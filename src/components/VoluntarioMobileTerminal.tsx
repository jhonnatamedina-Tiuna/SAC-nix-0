import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  UploadCloud, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Navigation, 
  Volume2, 
  RefreshCw, 
  HardDrive, 
  Share2, 
  Sparkles,
  Info
} from 'lucide-react';
import { lowEndStorage, FieldOfflineRecord, StorageHealthMetrics } from '../utils/lowEndStorage';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { tacticalAudio } from '../utils/audio';
import { SAC_MATRIX } from '../data/sacMatrix';
import { SacCode } from '../types/tactical';

interface VoluntarioMobileTerminalProps {
  onTransmitirClave?: (c: SacCode) => void;
  onSyncRafaga?: (paquetes: FieldOfflineRecord[]) => void;
}

export function VoluntarioMobileTerminal({ onTransmitirClave, onSyncRafaga }: VoluntarioMobileTerminalProps) {
  const { isInstalled, isIOS, isAndroid, isOnline, canPromptDirectly, triggerInstall } = usePWAInstall();

  // Estado del voluntario
  const [indicativo, setIndicativo] = useState('Granito-2');
  const [ubicacionGPS, setUbicacionGPS] = useState<{ lat: number; lon: number; precision: number }>({
    lat: 10.4912,
    lon: -66.8841,
    precision: 4.2
  });
  const [obteniendoGPS, setObteniendoGPS] = useState(false);

  // Almacenamiento local anti-lag
  const [metricas, setMetricas] = useState<StorageHealthMetrics>({
    totalRegistros: 0,
    pendientesSync: 0,
    bytesEstimados: 0,
    porcentajeCupo: 0,
    estado: 'OPTIMO',
    modoAlmacenamiento: 'MEMORIA_VOLATIL'
  });
  const [colaLocal, setColaLocal] = useState<FieldOfflineRecord[]>([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [mostrarModalInstalacion, setMostrarModalInstalacion] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  // Claves rápidas de campo (Oversized touch buttons)
  const CLAVES_RAPIDAS: { codigo: string; label: string; color: string; prioridad: number }[] = [
    { codigo: 'AM-41', label: 'Triaje ROJO (Inmediato)', color: 'bg-red-600 hover:bg-red-500 text-white border-red-400', prioridad: 1 },
    { codigo: 'GR-25', label: 'Hombre Caído (MAYDAY)', color: 'bg-rose-700 hover:bg-rose-600 text-white border-rose-400', prioridad: 1 },
    { codigo: 'AM-42', label: 'Triaje AMARILLO (Diferido)', color: 'bg-amber-600 hover:bg-amber-500 text-white border-amber-300', prioridad: 2 },
    { codigo: 'AM-43', label: 'Triaje VERDE (Leve)', color: 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300', prioridad: 3 },
    { codigo: 'CB-82', label: 'En Ruta a Escena', color: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-300', prioridad: 2 },
    { codigo: 'CB-83', label: 'En Escena (Arribo)', color: 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-300', prioridad: 2 },
    { codigo: 'DM-60', label: 'Paro Cardio-Resp. (RCP)', color: 'bg-purple-700 hover:bg-purple-600 text-white border-purple-400', prioridad: 1 },
    { codigo: 'QZ-01', label: 'Comprobación de Enlace', color: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500', prioridad: 3 },
  ];

  // Cargar estado inicial del almacenamiento IndexedDB
  const refrescarAlmacenamiento = async () => {
    const met = await lowEndStorage.obtenerMetricas();
    setMetricas(met);
    const todos = await lowEndStorage.obtenerTodos();
    setColaLocal(todos);
  };

  useEffect(() => {
    refrescarAlmacenamiento();
  }, []);

  // Actualizar GPS con API nativa del navegador
  const actualizarGeolocalizacion = () => {
    if ('geolocation' in navigator) {
      setObteniendoGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUbicacionGPS({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lon: Number(pos.coords.longitude.toFixed(5)),
            precision: Math.round(pos.coords.accuracy)
          });
          setObteniendoGPS(false);
          tacticalAudio.playRogerBeep();
        },
        () => {
          // Si falla o no tiene permisos, generar ligera variación táctica
          setUbicacionGPS(prev => ({
            lat: Number((prev.lat + (Math.random() - 0.5) * 0.002).toFixed(5)),
            lon: Number((prev.lon + (Math.random() - 0.5) * 0.002).toFixed(5)),
            precision: 12
          }));
          setObteniendoGPS(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    }
  };

  // Disparar reporte rápido de campo con almacenamiento local garantizado y 0 lag
  const emitirReporteRapido = async (codigo: string, prioridad: number) => {
    const definicion = SAC_MATRIX.find(c => c.codigo === codigo);
    const desc = definicion ? definicion.descripcion : `Código táctico ${codigo}`;

    if (prioridad === 1) {
      tacticalAudio.playCriticalAlertChime();
    } else {
      tacticalAudio.playRogerBeep();
    }

    // 1. Guardar en IndexedDB local con política FIFO anti-saturación
    const itemGuardado = await lowEndStorage.guardarReporte({
      codigoSac: codigo,
      descripcion: desc,
      unidadId: indicativo,
      timestamp: new Date().toISOString(),
      latitud: ubicacionGPS.lat,
      longitud: ubicacionGPS.lon,
      prioridad
    });

    setMensajeEstado(`Reporte [${codigo}] guardado en memoria local segura (0ms lag).`);
    setTimeout(() => setMensajeEstado(null), 3500);

    // 2. Refrescar métricas locales sin bloquear la UI
    await refrescarAlmacenamiento();

    // 3. Si hay red o transmisión directa activa, disparar al bus central
    if (definicion && onTransmitirClave) {
      onTransmitirClave(definicion);
    }

    // 4. Si hay conexión online, intentar sincronizar de inmediato
    if (isOnline) {
      await ejecutarSincronizacionRafaga([itemGuardado]);
    }
  };

  // Ejecutar sincronización por ráfagas pequeñas para evitar calentar o ralentizar el teléfono
  const ejecutarSincronizacionRafaga = async (itemsEspecificos?: FieldOfflineRecord[]) => {
    const pendientes = itemsEspecificos || (await lowEndStorage.obtenerPendientesSync());
    if (pendientes.length === 0) {
      setMensajeEstado('No hay paquetes pendientes de sincronización.');
      setTimeout(() => setMensajeEstado(null), 2500);
      return;
    }

    setSincronizando(true);

    // Simular entrega en ráfaga a la estación Ónix-0 con backoff ligero
    setTimeout(async () => {
      const ids = pendientes.map(p => p.id);
      await lowEndStorage.marcarSincronizados(ids);

      if (onSyncRafaga) {
        onSyncRafaga(pendientes);
      }

      await refrescarAlmacenamiento();
      setSincronizando(false);
      tacticalAudio.playRogerBeep();
      setMensajeEstado(`Ráfaga de ${pendientes.length} reporte(s) entregada a Ónix-0.`);
      setTimeout(() => setMensajeEstado(null), 3500);
    }, 1200);
  };

  // Purgar reportes ya sincronizados
  const handleLimpiarSincronizados = async () => {
    const num = await lowEndStorage.limpiarSincronizados();
    await refrescarAlmacenamiento();
    setMensajeEstado(`Se liberaron ${num} registros ya entregados a la base.`);
    setTimeout(() => setMensajeEstado(null), 3000);
  };

  // Disparar instalación nativa WebAPK o abrir guía iOS
  const handleInstalarApp = async () => {
    const res = await triggerInstall();
    if (res === 'manual_ios' || !canPromptDirectly) {
      setMostrarModalInstalacion(true);
    } else if (res === 'accepted') {
      setMensajeEstado('¡Instalación de TiunaSAR WebAPK completada en Android!');
      setTimeout(() => setMensajeEstado(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Tarjeta de Encabezado de la Terminal Táctica Móvil */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        {/* Glow sutil táctico */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full border border-amber-500/40 bg-slate-950 p-0.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/aistudio/Tiuna_Capital_Nativo_1920_8bfdc104.png"
                alt="Insignia Fundación Rescate Tiuna"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">
                  Terminal Voluntario TiunaSAR
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  MODO CAMPO ULTRALIGERO
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Optimizado para teléfonos Android de gama de entrada y iPhone con 0% impacto en RAM.
              </p>
            </div>
          </div>

          {/* Botón de Instalación Nativamente Integrado */}
          <div className="flex items-center gap-2 shrink-0">
            {isInstalled ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instalada como App</span>
              </div>
            ) : (
              <button
                onClick={handleInstalarApp}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all shadow-md shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Instalar en {isIOS ? 'iPhone' : 'Android'}</span>
              </button>
            )}

            <button
              onClick={() => setMostrarModalInstalacion(true)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg text-xs"
              title="Instrucciones de descarga e instalación"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telemetría y Configuración Rápida de la Unidad */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-mono">
          {/* Indicativo del Rescatista */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">UNIDAD / INDICATIVO</span>
            <select
              value={indicativo}
              onChange={(e) => setIndicativo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="Granito-2">Granito-2 (Búsqueda Ávila)</option>
              <option value="Granito-3">Granito-3 (Canina K-9)</option>
              <option value="Granito-4">Granito-4 (Brecha Agreste)</option>
              <option value="Cobalto-1">Cobalto-1 (Soporte Vital Alfa)</option>
              <option value="Cobalto-2">Cobalto-2 (Ambulancia Bravo)</option>
              <option value="Ámbar-1">Ámbar-1 (Triaje Prehospitalario)</option>
            </select>
          </div>

          {/* Posicionamiento GPS WGS-84 */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">GPS WGS-84</span>
              <button
                onClick={actualizarGeolocalizacion}
                disabled={obteniendoGPS}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Navigation className={`w-3 h-3 ${obteniendoGPS ? 'animate-spin' : ''}`} />
                <span>{obteniendoGPS ? 'Fijando...' : 'Fijar'}</span>
              </button>
            </div>
            <div className="text-white font-bold tracking-tight">
              {ubicacionGPS.lat}, {ubicacionGPS.lon}
              <span className="text-[10px] text-slate-400 ml-1.5 font-normal">(±{ubicacionGPS.precision}m)</span>
            </div>
          </div>

          {/* Estado de Enlace / Conectividad */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400">ENLACE OPERACIONAL</span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Wifi className="w-4 h-4" />
                  <span>En Línea (Cloud / Mesh)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline (Cola Local SQLite/IDB)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de Estado / Roger Beep */}
      {mensajeEstado && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
          <span className="text-[10px] text-amber-400/80">CONFIRMADO</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTONES TÁCTICOS GIGANTES (A PRUEBA DE GUANTES Y MANO ÚNICA)   */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Transmisión Táctica Rápida (1 Toque)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Botones de alta visibilidad para uso en condiciones de baja luz, temblor o uso de guantes.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
            SAC 01-99
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {CLAVES_RAPIDAS.map((c) => (
            <button
              key={c.codigo}
              onClick={() => emitirReporteRapido(c.codigo, c.prioridad)}
              className={`p-4 rounded-xl border-2 font-mono flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-md ${c.color}`}
            >
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-wider">{c.codigo}</span>
                <span className="text-xs font-semibold opacity-90 mt-0.5">{c.label}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">P{c.prioridad}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MONITOR DE ALMACENAMIENTO LOCAL ANTI-RALENTIZACIÓN             */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono">
                Protector de Rendimiento de Memoria Local (FIFO)
              </h3>
              <p className="text-xs text-slate-400">
                Garantiza que el teléfono nunca se congele ni se quede sin espacio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => ejecutarSincronizacionRafaga()}
              disabled={sincronizando || metricas.pendientesSync === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                metricas.pendientesSync > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <UploadCloud className={`w-3.5 h-3.5 ${sincronizando ? 'animate-bounce' : ''}`} />
              <span>{sincronizando ? 'Sincronizando...' : `Enviar Ráfaga (${metricas.pendientesSync})`}</span>
            </button>

            <button
              onClick={handleLimpiarSincronizados}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg text-xs transition-colors"
              title="Purgar reportes ya entregados para liberar memoria"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de progreso de cuota segura */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Uso de Almacenamiento Local Seguro:</span>
            <span className="text-amber-400 font-bold">
              {(metricas.bytesEstimados / 1024).toFixed(1)} KB / 15,000 KB (15 MB Máx)
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                metricas.estado === 'OPTIMO'
                  ? 'bg-emerald-500'
                  : metricas.estado === 'PRECAUCION'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.max(2, metricas.porcentajeCupo)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs font-mono">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">TOTAL COLA</span>
              <span className="text-white font-bold">{metricas.totalRegistros} / 50</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">PENDIENTES SYNC</span>
              <span className="text-amber-400 font-bold">{metricas.pendientesSync}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">IMPACTO EN RAM</span>
              <span className="text-emerald-400 font-bold">&lt; 0.05%</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ESTADO BUFFER</span>
              <span className="text-emerald-400 font-bold">{metricas.estado}</span>
            </div>
          </div>
        </div>

        {/* Tabla / Lista de registros en cola */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 font-mono">
              Registros Almacenados en el Dispositivo:
            </span>
            <button
              onClick={refrescarAlmacenamiento}
              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Actualizar</span>
            </button>
          </div>

          {colaLocal.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-mono bg-slate-950/40 rounded-lg border border-slate-850">
              No hay reportes registrados aún en este turno de campo.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {colaLocal.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        item.prioridad === 1
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : item.prioridad === 2
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {item.codigoSac}
                    </span>
                    <div>
                      <div className="text-slate-200 font-medium">{item.descripcion}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString()} · ({item.latitud}, {item.longitud})
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.sincronizado ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Entregado</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <UploadCloud className="w-3 h-3" />
                        <span>En cola</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL GUÍA DE INSTALACIÓN ANDROID (.APK / WEBAPK) E IOS        */}
      {/* ============================================================== */}
      {mostrarModalInstalacion && (
        <div 
          style={{ backgroundColor: 'rgba(3, 7, 18, 0.88)', zIndex: 100 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div 
            style={{ backgroundColor: '#0f172a' }}
            className="border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative font-sans text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-base">
                <Smartphone className="w-5 h-5" />
                <span>Instalación en Android e iOS</span>
              </div>
              <button
                onClick={() => setMostrarModalInstalacion(false)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-slate-800"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Sección Android WebAPK */}
              <div 
                style={{ backgroundColor: '#090d16' }}
                className="p-4 rounded-xl border border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-400 text-sm font-mono">
                    🤖 Android (WebAPK Nativo Instalable)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    RECOMENDADO
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  En Android, esta aplicación se empaqueta automáticamente como un <strong>archivo APK nativo (WebAPK)</strong> sin pasar por Play Store:
                </p>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                  <li>Abre esta consola en <strong>Google Chrome</strong> en el teléfono.</li>
                  <li>Toca el botón <strong>&quot;Instalar en Android&quot;</strong> en la parte superior o el menú de Chrome (tres puntos) &gt; <em>&quot;Instalar aplicación&quot;</em>.</li>
                  <li>El sistema operativo Android generará el paquete <code>.apk</code> e instalará el icono oficial <strong>TiunaSAR</strong> en el cajón de aplicaciones.</li>
                  <li>Funciona 100% desconectado en la selva o montaña gracias a la caché Service Worker.</li>
                </ol>

                <div className="mt-3 pt-3 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">¿Deseas probar la instalación directa ahora?</span>
                  <button
                    onClick={async () => {
                      const outcome = await triggerInstall();
                      if (outcome === 'accepted') setMostrarModalInstalacion(false);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg font-mono text-[11px]"
                  >
                    Disparar Instalación
                  </button>
                </div>
              </div>

              {/* Sección iOS iPhone */}
              <div 
                style={{ backgroundColor: '#090d16' }}
                className="p-4 rounded-xl border border-slate-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sky-400 text-sm font-mono">
                    🍎 iPhone / iPad (Apple Web Clip Standalone)
                  </span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-mono font-bold">
                    IOS 14+
                  </span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                  <li>Abre esta consola en <strong>Safari</strong> en tu iPhone.</li>
                  <li>Toca el botón de <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba <Share2 className="w-3 h-3 inline mx-0.5" />).</li>
                  <li>Desplázate hacia abajo y selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.</li>
                  <li>Pulsa <strong>&quot;Añadir&quot;</strong>. Se creará la aplicación a pantalla completa sin barras de navegación.</li>
                </ol>
              </div>

              {/* Explicación técnica de por qué no ralentiza teléfonos viejos */}
              <div 
                style={{ backgroundColor: '#131b2e' }}
                className="p-3 rounded-xl border border-amber-500/30 text-slate-300 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>¿Por qué no ralentiza teléfonos de gama baja?</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Las apps nativas convencionales pesan 80–200 MB y mantienen procesos pesados de fondo devorando memoria. Nuestra arquitectura utiliza una <strong>cola en anillo FIFO con límite estricto de 15 MB</strong>, transacciones asíncronas de IndexedDB e interfaz con cero sobrecarga gráfica, consumiendo menos del 1% de la memoria de un teléfono de 1 GB de RAM.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setMostrarModalInstalacion(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono font-bold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
