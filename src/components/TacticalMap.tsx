import React, { useState } from 'react';
import { TacticalUnit, CriticalAlert } from '../types/tactical';
import { GEOFENCE_WARAIRA_REPANO, UNIDADES_INICIALES } from '../data/tacticalUnits';
import { calcularDistanciaMetros, encontrarUnidadMasCercana, estaDentroDeGeocerca } from '../utils/geo';
import { tacticalAudio } from '../utils/audio';
import { Navigation, AlertTriangle, ShieldCheck, Radio, MapPin, Compass, Crosshair, ArrowRight, Activity, Zap } from 'lucide-react';

interface TacticalMapProps {
  unidades: TacticalUnit[];
  onDespacharUnidad: (indicativo: string, nuevoEstado: string, destinoLat: number, destinoLon: number) => void;
  onGenerarAlerta: (alerta: Omit<CriticalAlert, 'id' | 'timestamp'>) => void;
  incidenteActivo: { lat: number; lon: number; descripcion: string; codigoSac: string } | null;
  setIncidenteActivo: React.Dispatch<React.SetStateAction<{ lat: number; lon: number; descripcion: string; codigoSac: string } | null>>;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  unidades,
  onDespacharUnidad,
  onGenerarAlerta,
  incidenteActivo,
  setIncidenteActivo,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [capaGeocerca, setCapaGeocerca] = useState<boolean>(true);
  const [capaTopografia, setCapaTopografia] = useState<boolean>(true);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<TacticalUnit | null>(null);

  // Dimensiones del canvas SVG
  const width = 800;
  const height = 480;

  // Proyección geográfica WGS-84 a coordenadas SVG locales (Caracas / Waraira Repano)
  // Lat: 10.46 a 10.56 (Sur a Norte)
  // Lon: -66.96 a -66.80 (Oeste a Este)
  const minLat = 10.460;
  const maxLat = 10.560;
  const minLon = -66.960;
  const maxLon = -66.800;

  const proyeccionX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width;
  const proyeccionY = (lat: number) => height - ((lat - minLat) / (maxLat - minLat)) * height;

  // Inversa para clics en el mapa
  const inversaLon = (x: number) => minLon + (x / width) * (maxLon - minLon);
  const inversaLat = (y: number) => minLat + ((height - y) / height) * (maxLat - minLat);

  // SVG Path del polígono de Geocerca (Waraira Repano)
  const puntosGeocercaSvg = GEOFENCE_WARAIRA_REPANO.map(([lat, lon]) => `${proyeccionX(lon)},${proyeccionY(lat)}`).join(' ');

  // Manejar clic en el mapa para situar incidente o punto táctico
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    const y = ((e.clientY - rect.top) / rect.height) * height;

    const lat = Number(inversaLat(y).toFixed(4));
    const lon = Number(inversaLon(x).toFixed(4));

    // Determinar si está dentro del Parque Nacional Waraira Repano
    const dentroParque = estaDentroDeGeocerca(lat, lon, GEOFENCE_WARAIRA_REPANO);
    const ubicacionNombre = dentroParque ? 'Sector Waraira Repano (Área Protegida)' : 'Área Metropolitana de Caracas';

    setIncidenteActivo({
      lat,
      lon,
      descripcion: `Incidente reportado en ${ubicacionNombre}`,
      codigoSac: 'AM-41'
    });
  };

  // Sugerencia PostGIS para el incidente actual
  const sugerenciaPostGIS = incidenteActivo
    ? encontrarUnidadMasCercana(incidenteActivo.lat, incidenteActivo.lon, unidades)
    : null;

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Barra superior de control del mapa */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>Despacho Espacial PostGIS</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            Datum: WGS-84 / UTM 19N · Caracas - Ávila
          </span>
        </div>

        {/* Controles de capas */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCapaGeocerca(!capaGeocerca)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              capaGeocerca ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cerca Virtual (GR-24)</span>
          </button>

          <button
            onClick={() => setCapaTopografia(!capaTopografia)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
              capaTopografia ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Relieve Ávila</span>
          </button>

          {/* Quick simulation trigger */}
          <button
            onClick={() => {
              // Simular alerta de Hombre Caído (GR-25) en Granito-1
              const g1 = unidades.find(u => u.indicativo === 'Granito-1');
              if (g1) {
                tacticalAudio.playCriticalAlertChime();
                onGenerarAlerta({
                  tipoEvento: 'GR-25',
                  unidadId: g1.indicativo,
                  prioridad: 1,
                  descripcion: 'Alerta de inactividad: Hombre caído sin movimiento >15m en Quebrada Quintero.',
                  latitud: g1.latitud,
                  longitud: g1.longitud,
                  unidadSugerida: 'Cobalto-1',
                  distanciaMetros: calcularDistanciaMetros(g1.latitud, g1.longitud, 10.4900, -66.8900)
                });
                setIncidenteActivo({
                  lat: g1.latitud,
                  lon: g1.longitud,
                  descripcion: '¡Hombre caído! Rescatista Granito-1 sin signos de movimiento.',
                  codigoSac: 'GR-25'
                });
              }
            }}
            className="px-2.5 py-1 text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simular GR-25</span>
          </button>
        </div>
      </div>

      {/* Visor SVG de Mapa */}
      <div className="relative flex-1 bg-[#090d16] overflow-hidden select-none cursor-crosshair">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          onClick={handleMapClick}
        >
          <defs>
            {/* Cuadrícula táctica milimétrica */}
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" strokeDasharray="2,2" />
            </pattern>
            <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cuadrícula de fondo */}
          <rect width={width} height={height} fill="url(#tacticalGrid)" />

          {/* Topografía simulada del Parque Ávila (Curvas de nivel) */}
          {capaTopografia && (
            <g opacity="0.35">
              <path
                d="M 50,120 Q 200,60 400,90 T 750,110"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
              <path
                d="M 40,160 Q 220,90 420,130 T 760,150"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
              />
              <path
                d="M 60,80 Q 250,30 450,50 T 740,70"
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
              />
              {/* Picos destacados */}
              <text x="380" y="45" fill="#10b981" fontSize="10" fontFamily="JetBrains Mono" opacity="0.8">
                ▲ Pico Naiguatá (2.765 m)
              </text>
              <text x="210" y="70" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">
                ▲ Pico Oriental (2.640 m)
              </text>
              <text x="140" y="105" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono" opacity="0.8">
                ▲ Hotel Humboldt / Ávila (2.140 m)
              </text>
              <text x="40" y="320" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono" opacity="0.6">
                VALLE DE CARACAS (Autopista Fco. Fajardo / Gran Cacique Guaicaipuro)
              </text>
            </g>
          )}

          {/* Geocerca activa del Parque Nacional Waraira Repano */}
          {capaGeocerca && (
            <g>
              <polygon
                points={puntosGeocercaSvg}
                fill="#10b981"
                fillOpacity="0.08"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <text x="440" y="125" fill="#34d399" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600" opacity="0.85">
                [GEOCERCA ACTIVA · P.N. WARAIRA REPANO]
              </text>
            </g>
          )}

          {/* Trazado PostGIS entre Incidente y Unidad Más Cercana */}
          {incidenteActivo && sugerenciaPostGIS && (
            <g>
              <line
                x1={proyeccionX(incidenteActivo.lon)}
                y1={proyeccionY(incidenteActivo.lat)}
                x2={proyeccionX(sugerenciaPostGIS.unidad.longitud)}
                y2={proyeccionY(sugerenciaPostGIS.unidad.latitud)}
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="5,5"
              />
              {/* Etiqueta de distancia en medio de la línea */}
              <rect
                x={(proyeccionX(incidenteActivo.lon) + proyeccionX(sugerenciaPostGIS.unidad.longitud)) / 2 - 40}
                y={(proyeccionY(incidenteActivo.lat) + proyeccionY(sugerenciaPostGIS.unidad.latitud)) / 2 - 12}
                width="80"
                height="22"
                rx="4"
                fill="#0f172a"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={(proyeccionX(incidenteActivo.lon) + proyeccionX(sugerenciaPostGIS.unidad.longitud)) / 2}
                y={(proyeccionY(incidenteActivo.lat) + proyeccionY(sugerenciaPostGIS.unidad.latitud)) / 2 + 3}
                fill="#fcd34d"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
              >
                {(sugerenciaPostGIS.distanciaMetros / 1000).toFixed(2)} km
              </text>
            </g>
          )}

          {/* Marcador del Incidente Táctico Activo */}
          {incidenteActivo && (
            <g transform={`translate(${proyeccionX(incidenteActivo.lon)}, ${proyeccionY(incidenteActivo.lat)})`}>
              <circle r="22" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
              <circle r="12" fill="#ef4444" fillOpacity="0.4" />
              <circle r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
              <text y="-18" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                EMERGENCIA ({incidenteActivo.codigoSac})
              </text>
            </g>
          )}

          {/* Marcadores de Unidades Tácticas */}
          {unidades.map(u => {
            const cx = proyeccionX(u.longitud);
            const cy = proyeccionY(u.latitud);
            const isBase = u.tipo === 'BASE';
            const isAmbulance = u.tipo === 'AMBULANCIA';
            const isSelected = unidadSeleccionada?.indicativo === u.indicativo;

            const colorPrincipal = isBase ? '#8b5cf6' : isAmbulance ? '#3b82f6' : '#10b981';

            return (
              <g
                key={u.indicativo}
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setUnidadSeleccionada(u);
                }}
              >
                {/* Anillo de selección */}
                {isSelected && (
                  <circle r="20" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" />
                )}

                {/* Radar sweep sutil en Base Ónix-0 */}
                {isBase && (
                  <circle r="45" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
                )}

                {/* Símbolo táctico según tipo */}
                <circle
                  r={isBase ? 11 : 8}
                  fill={colorPrincipal}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? 2 : 1.5}
                  className="transition-transform group-hover:scale-125"
                />

                {/* Indicador de estado */}
                <rect
                  x="-35"
                  y="12"
                  width="70"
                  height="16"
                  rx="3"
                  fill="#0b0f19"
                  stroke={colorPrincipal}
                  strokeWidth="0.75"
                />
                <text
                  y="23"
                  fill="#f1f5f9"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {u.indicativo} · {u.estadoSac}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Coordenadas en vivo e instrucción */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 font-mono flex items-center gap-3">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>Haz clic en el mapa para posicionar un evento o calcular el vector de aproximación.</span>
        </div>

        {/* Brújula azimutal visual */}
        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded p-2 text-center text-xs font-mono text-slate-400">
          <div className="font-bold text-amber-400 text-[10px]">N</div>
          <div className="text-[9px] text-slate-500">360°</div>
        </div>
      </div>

      {/* Panel inferior de despacho PostGIS inteligente */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {incidenteActivo && sugerenciaPostGIS ? (
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 shrink-0">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                  Sugerencia PostGIS (Nearest Neighbor)
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-mono text-slate-300">
                  Unidad: <strong className="text-white">{sugerenciaPostGIS.unidad.indicativo}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Distancia mínima: <strong className="text-amber-300 font-mono">{(sugerenciaPostGIS.distanciaMetros / 1000).toFixed(2)} km</strong>
                {' '}· Estado actual: <span className="font-mono text-slate-200">{sugerenciaPostGIS.unidad.estadoSac}</span>
                {' '}· Operador: <span className="text-slate-300">{sugerenciaPostGIS.unidad.operador}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>Selecciona un punto en el mapa o genera una alerta para activar el algoritmo de despacho espacial.</span>
          </div>
        )}

        {incidenteActivo && sugerenciaPostGIS && (
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                onDespacharUnidad(
                  sugerenciaPostGIS.unidad.indicativo,
                  'CB-81', // En ruta hacia el teatro de operaciones
                  incidenteActivo.lat,
                  incidenteActivo.lon
                );
                tacticalAudio.speakSacCode('CB-81', `Unidad ${sugerenciaPostGIS.unidad.indicativo} en ruta.`);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Despachar {sugerenciaPostGIS.unidad.indicativo} (CB-81)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIncidenteActivo(null)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
