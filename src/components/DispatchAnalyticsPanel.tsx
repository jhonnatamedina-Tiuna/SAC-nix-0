import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import {
  Activity,
  Clock,
  TrendingDown,
  BarChart3,
  Calendar,
  Filter,
  Truck,
  Shield,
  Zap,
  CheckCircle2,
  RefreshCw,
  Flame,
  PlusCircle,
  MapPin
} from 'lucide-react';
import { TacticalUnit } from '../types/tactical';
import { SAC_MATRIX } from '../data/sacMatrix';
import { tacticalAudio } from '../utils/audio';

export interface MisionDespacho {
  id: string;
  unidadId: string;
  tipoUnidad: 'AMBULANCIA' | 'RESCATISTA';
  claveSac: string;
  sector: string;
  tiempoDespachoArriboMin: number;
  hora: string;
  prioridad: number;
  timestamp: string;
}

// Historial inicial de misiones y despachos en las últimas 24 horas
const MISIONES_INICIALES_24H: MisionDespacho[] = [
  // Madrugada (00:00 - 04:00)
  { id: 'm-1', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-41', sector: 'Autopista Fco. Fajardo', tiempoDespachoArriboMin: 7.2, hora: '02:00', prioridad: 1, timestamp: '2026-11-01T02:15:00Z' },
  { id: 'm-2', unidadId: 'Granito-1', tipoUnidad: 'RESCATISTA', claveSac: 'GR-20', sector: 'Quebrada Quintero / Ávila', tiempoDespachoArriboMin: 15.5, hora: '02:00', prioridad: 3, timestamp: '2026-11-01T02:40:00Z' },
  { id: 'm-3', unidadId: 'Cobalto-2', tipoUnidad: 'AMBULANCIA', claveSac: 'CB-81', sector: 'Distribuidor Altamira', tiempoDespachoArriboMin: 8.4, hora: '02:00', prioridad: 2, timestamp: '2026-11-01T03:10:00Z' },

  // Mañana (04:00 - 08:00)
  { id: 'm-4', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-41', sector: 'Av. Boyacá (Cota Mil)', tiempoDespachoArriboMin: 6.8, hora: '06:00', prioridad: 1, timestamp: '2026-11-01T06:12:00Z' },
  { id: 'm-5', unidadId: 'Granito-1', tipoUnidad: 'RESCATISTA', claveSac: 'GR-25', sector: 'Pico Oriental / Cortafuego', tiempoDespachoArriboMin: 14.1, hora: '06:00', prioridad: 1, timestamp: '2026-11-01T06:45:00Z' },
  { id: 'm-6', unidadId: 'Cobalto-2', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-42', sector: 'Petare Centro', tiempoDespachoArriboMin: 7.9, hora: '06:00', prioridad: 2, timestamp: '2026-11-01T07:20:00Z' },

  // Mediodía (08:00 - 12:00)
  { id: 'm-7', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'CB-82', sector: 'Chacao / El Rosal', tiempoDespachoArriboMin: 8.9, hora: '10:00', prioridad: 2, timestamp: '2026-11-01T10:05:00Z' },
  { id: 'm-8', unidadId: 'Granito-1', tipoUnidad: 'RESCATISTA', claveSac: 'GR-20', sector: 'Sabas Nieves', tiempoDespachoArriboMin: 17.2, hora: '10:00', prioridad: 3, timestamp: '2026-11-01T10:30:00Z' },
  { id: 'm-9', unidadId: 'Cobalto-2', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-46', sector: 'Autopista Prados del Este', tiempoDespachoArriboMin: 9.8, hora: '10:00', prioridad: 1, timestamp: '2026-11-01T11:15:00Z' },
  { id: 'm-10', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-41', sector: 'Bello Monte', tiempoDespachoArriboMin: 8.1, hora: '10:00', prioridad: 1, timestamp: '2026-11-01T11:45:00Z' },

  // Tarde (12:00 - 16:00)
  { id: 'm-11', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'CB-81', sector: 'Plaza Venezuela', tiempoDespachoArriboMin: 7.5, hora: '14:00', prioridad: 2, timestamp: '2026-11-01T14:10:00Z' },
  { id: 'm-12', unidadId: 'Granito-1', tipoUnidad: 'RESCATISTA', claveSac: 'GR-24', sector: 'Límite Geocerca Galindo', tiempoDespachoArriboMin: 13.8, hora: '14:00', prioridad: 1, timestamp: '2026-11-01T14:35:00Z' },
  { id: 'm-13', unidadId: 'Cobalto-2', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-41', sector: 'La California Norte', tiempoDespachoArriboMin: 8.2, hora: '14:00', prioridad: 1, timestamp: '2026-11-01T15:20:00Z' },
  { id: 'm-14', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'CB-83', sector: 'Hosp. Domingo Luciani', tiempoDespachoArriboMin: 6.9, hora: '14:00', prioridad: 1, timestamp: '2026-11-01T15:50:00Z' },

  // Tarde-Noche (16:00 - 20:00)
  { id: 'm-15', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-41', sector: 'Autopista Gran Cacique', tiempoDespachoArriboMin: 9.4, hora: '18:00', prioridad: 1, timestamp: '2026-11-01T18:15:00Z' },
  { id: 'm-16', unidadId: 'Granito-1', tipoUnidad: 'RESCATISTA', claveSac: 'GR-20', sector: 'Los Venados / Ávila', tiempoDespachoArriboMin: 18.2, hora: '18:00', prioridad: 3, timestamp: '2026-11-01T18:45:00Z' },
  { id: 'm-17', unidadId: 'Cobalto-2', tipoUnidad: 'AMBULANCIA', claveSac: 'CB-82', sector: 'Distribuidor Ciempiés', tiempoDespachoArriboMin: 10.5, hora: '18:00', prioridad: 2, timestamp: '2026-11-01T19:30:00Z' },

  // Noche (20:00 - 24:00)
  { id: 'm-18', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'AM-41', sector: 'Las Mercedes', tiempoDespachoArriboMin: 6.5, hora: '22:00', prioridad: 1, timestamp: '2026-11-01T22:10:00Z' },
  { id: 'm-19', unidadId: 'Granito-1', tipoUnidad: 'RESCATISTA', claveSac: 'GR-25', sector: 'Quebrada Chacaíto', tiempoDespachoArriboMin: 12.9, hora: '22:00', prioridad: 1, timestamp: '2026-11-01T22:40:00Z' },
  { id: 'm-20', unidadId: 'Cobalto-2', tipoUnidad: 'AMBULANCIA', claveSac: 'CB-81', sector: 'Av. Francisco de Miranda', tiempoDespachoArriboMin: 7.1, hora: '22:00', prioridad: 2, timestamp: '2026-11-01T23:25:00Z' },
  { id: 'm-21', unidadId: 'Cobalto-1', tipoUnidad: 'AMBULANCIA', claveSac: 'QZ-05', sector: 'Base Sebucán', tiempoDespachoArriboMin: 5.9, hora: '22:00', prioridad: 4, timestamp: '2026-11-01T23:50:00Z' },
];

interface DispatchAnalyticsPanelProps {
  unidades?: TacticalUnit[];
}

export const DispatchAnalyticsPanel: React.FC<DispatchAnalyticsPanelProps> = ({ unidades = [] }) => {
  const [misiones, setMisiones] = useState<MisionDespacho[]>(MISIONES_INICIALES_24H);
  const [filtroTipoUnidad, setFiltroTipoUnidad] = useState<'TODAS' | 'AMBULANCIA' | 'RESCATISTA'>('TODAS');
  const [filtroVentanaHoras, setFiltroVentanaHoras] = useState<'24h' | '12h' | '6h'>('24h');

  // Misiones filtradas por tipo de unidad
  const misionesFiltradas = useMemo(() => {
    return misiones.filter(m => {
      if (filtroTipoUnidad !== 'TODAS' && m.tipoUnidad !== filtroTipoUnidad) return false;
      return true;
    });
  }, [misiones, filtroTipoUnidad]);

  // 1) CÁLCULO DE CLAVES SAC MÁS FRECUENTES (Últimas 24h)
  const datosFrecuenciaClaves = useMemo(() => {
    const conteoMap: Record<string, number> = {};

    misionesFiltradas.forEach(m => {
      conteoMap[m.claveSac] = (conteoMap[m.claveSac] || 0) + 1;
    });

    // Ordenar de mayor a menor frecuencia
    return Object.entries(conteoMap)
      .map(([codigo, conteo]) => {
        const info = SAC_MATRIX.find(c => c.codigo === codigo);
        return {
          codigo,
          nombreMineral: info?.nombreMineral || 'SAC',
          conteo,
          prioridad: info?.prioridad || 3,
          color: info?.color || '#3b82f6',
          descripcion: info?.descripcion || 'Código táctico operacional'
        };
      })
      .sort((a, b) => b.conteo - a.conteo)
      .slice(0, 10); // Top 10 claves
  }, [misionesFiltradas]);

  // 2) COMPARATIVA DE TIEMPOS PROMEDIO: AMBULANCIA VS RESCATISTA
  const datosComparativaTiempos = useMemo(() => {
    const bloquesHorarios = ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'];

    return bloquesHorarios.map(hora => {
      const deEsaHora = misiones.filter(m => m.hora === hora);

      const misionesAmbulancia = deEsaHora.filter(m => m.tipoUnidad === 'AMBULANCIA');
      const misionesRescatista = deEsaHora.filter(m => m.tipoUnidad === 'RESCATISTA');

      const promedioAmbulancia = misionesAmbulancia.length > 0
        ? Number((misionesAmbulancia.reduce((acc, curr) => acc + curr.tiempoDespachoArriboMin, 0) / misionesAmbulancia.length).toFixed(1))
        : 7.8;

      const promedioRescatista = misionesRescatista.length > 0
        ? Number((misionesRescatista.reduce((acc, curr) => acc + curr.tiempoDespachoArriboMin, 0) / misionesRescatista.length).toFixed(1))
        : 14.5;

      return {
        hora,
        tiempoAmbulancia: promedioAmbulancia,
        tiempoRescatista: promedioRescatista,
        metaAmbulancia: 8.0, // Meta estándar SAR vial (< 8 min)
        metaRescatista: 15.0  // Meta estándar SAR agreste/montaña (< 15 min)
      };
    });
  }, [misiones]);

  // Métricas globales
  const promedioGeneralAmbulancias = useMemo(() => {
    const amb = misiones.filter(m => m.tipoUnidad === 'AMBULANCIA');
    if (amb.length === 0) return 0;
    return Number((amb.reduce((acc, curr) => acc + curr.tiempoDespachoArriboMin, 0) / amb.length).toFixed(1));
  }, [misiones]);

  const promedioGeneralRescatistas = useMemo(() => {
    const resc = misiones.filter(m => m.tipoUnidad === 'RESCATISTA');
    if (resc.length === 0) return 0;
    return Number((resc.reduce((acc, curr) => acc + curr.tiempoDespachoArriboMin, 0) / resc.length).toFixed(1));
  }, [misiones]);

  // Simular nuevo despacho de prueba
  const handleAgregarMisionSimulada = (tipo: 'AMBULANCIA' | 'RESCATISTA') => {
    tacticalAudio.playRogerBeep();
    const esAmbulancia = tipo === 'AMBULANCIA';
    const nuevaMision: MisionDespacho = {
      id: `m-${Date.now()}`,
      unidadId: esAmbulancia ? 'Cobalto-1' : 'Granito-1',
      tipoUnidad: tipo,
      claveSac: esAmbulancia ? 'AM-41' : 'GR-20',
      sector: esAmbulancia ? 'Autopista Fco. Fajardo' : 'Sector Sabas Nieves',
      tiempoDespachoArriboMin: esAmbulancia ? Number((6.5 + Math.random() * 2).toFixed(1)) : Number((13.0 + Math.random() * 4).toFixed(1)),
      hora: '22:00',
      prioridad: esAmbulancia ? 1 : 2,
      timestamp: new Date().toISOString()
    };

    setMisiones(prev => [nuevaMision, ...prev]);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado del Panel */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Analítica de Despacho Operacional</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-mono font-normal text-slate-400">Grupo de Rescate Tiuna</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consumo en tiempo real de unidades activas, claves SAC más frecuentes y comparativa Ambulancias vs Rescatistas.
          </p>
        </div>

        {/* Filtros de Tipo de Unidad y Acciones */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFiltroTipoUnidad('TODAS')}
              className={`px-2.5 py-1 rounded transition-colors ${
                filtroTipoUnidad === 'TODAS' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({misiones.length})
            </button>
            <button
              onClick={() => setFiltroTipoUnidad('AMBULANCIA')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                filtroTipoUnidad === 'AMBULANCIA' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3 h-3 text-blue-400" />
              <span>Ambulancias</span>
            </button>
            <button
              onClick={() => setFiltroTipoUnidad('RESCATISTA')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                filtroTipoUnidad === 'RESCATISTA' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Rescatistas</span>
            </button>
          </div>

          {/* Botones de simulación de despacho */}
          <button
            onClick={() => handleAgregarMisionSimulada('AMBULANCIA')}
            className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
            title="Simular despacho de ambulancia Cobalto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Despacho Ambulancia</span>
          </button>
          <button
            onClick={() => handleAgregarMisionSimulada('RESCATISTA')}
            className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors"
            title="Simular despacho de patrulla SAR Granito"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Despacho Rescatista</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* KPI Strip: Comparativa de Tiempos y Estado de Unidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Ambulancias (SVA/SVB)</span>
              <Truck className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
              {promedioGeneralAmbulancias} min
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Meta vial:</span> <strong className="text-emerald-400 font-mono">&lt; 8.0 min</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Rescatistas (SAR Ávila)</span>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {promedioGeneralRescatistas} min
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Meta agreste:</span> <strong className="text-emerald-400 font-mono">&lt; 15.0 min</strong>
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Total Misiones 24h</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {misionesFiltradas.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {misiones.filter(m => m.tipoUnidad === 'AMBULANCIA').length} Ambulancias · {misiones.filter(m => m.tipoUnidad === 'RESCATISTA').length} Rescatistas
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Clave Más Frecuente</span>
              <Flame className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-lg font-bold font-mono text-red-400 mt-1">
              {datosFrecuenciaClaves[0]?.codigo || 'AM-41'} · {datosFrecuenciaClaves[0]?.conteo || 0} avisos
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {datosFrecuenciaClaves[0]?.descripcion || 'Triaje Rojo'}
            </div>
          </div>
        </div>

        {/* 1) GRÁFICO DE BARRAS: CLAVES SAC MÁS FRECUENTES EN 24H */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <span>1. Claves SAC Más Frecuentes Reportadas (Últimas 24h)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Volumen acumulado de códigos emitidos por unidades en campo (Ámbar, Cobalto, Granito, Cuarzo, etc.).
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Filtro: <strong className="text-amber-400">{filtroTipoUnidad}</strong>
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFrecuenciaClaves} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="codigo"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as {
                        codigo: string;
                        nombreMineral: string;
                        conteo: number;
                        prioridad: number;
                        color: string;
                        descripcion: string;
                      };
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span style={{ color: data.color }}>{data.codigo}</span>
                            <span className="text-slate-400">· Mineral {data.nombreMineral}</span>
                          </div>
                          <div className="text-slate-300 mt-1">{data.descripcion}</div>
                          <div className="text-amber-400 mt-1 font-bold">
                            Total reportes: {data.conteo} eventos
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Prioridad táctica: P{data.prioridad}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="conteo" name="Frecuencia de Reportes" radius={[4, 4, 0, 0]}>
                  {datosFrecuenciaClaves.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2) GRÁFICO DE LÍNEAS: TIEMPOS PROMEDIO DE RESPUESTA (AMBULANCIA VS RESCATISTA) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Tiempos Promedio de Respuesta: Ambulancia vs Rescatista (Despacho a Arribo)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comparativa cronológica del intervalo entre orden de salida y arribo físico a la escena en minutos.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Ambulancias (Vial/Urbano)</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Rescatistas (SAR Montaña)</span>
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-3 h-0.5 bg-red-400" />
                <span>Meta Ambulancia (8 min)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosComparativaTiempos} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="hora"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  unit="m"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs font-mono">
                          <div className="font-bold text-amber-400 border-b border-slate-800 pb-1 mb-1.5">
                            Franja Horaria: {label}
                          </div>
                          {payload.map((p, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 mt-0.5" style={{ color: p.color }}>
                              <span>{p.name}:</span>
                              <strong className="tabular-nums">{p.value} min</strong>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Línea 1: Ambulancias */}
                <Line
                  type="monotone"
                  dataKey="tiempoAmbulancia"
                  name="Ambulancia (Cobalto)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                {/* Línea 2: Rescatistas */}
                <Line
                  type="monotone"
                  dataKey="tiempoRescatista"
                  name="Rescatista (Granito)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                {/* Línea 3: Meta Institucional Ambulancia */}
                <Line
                  type="monotone"
                  dataKey="metaAmbulancia"
                  name="Meta Ambulancia (8 min)"
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                {/* Línea 4: Meta Institucional Rescatista */}
                <Line
                  type="monotone"
                  dataKey="metaRescatista"
                  name="Meta Rescatista (15 min)"
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3) TELEMETRÍA Y ESTADO DE LAS UNIDADES ACTIVAS (Consumo del prop `unidades`) */}
        {unidades && unidades.length > 0 && (
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Estado y Eficiencia de Unidades Tácticas en Servicio</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Mapeo dinámico PostGIS / SAC</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {unidades.map(u => {
                const esAmbulancia = u.tipo === 'AMBULANCIA';
                const promedio = esAmbulancia ? promedioGeneralAmbulancias : promedioGeneralRescatistas;
                const meta = esAmbulancia ? 8.0 : 15.0;
                const enMeta = promedio <= meta;

                return (
                  <div key={u.indicativo} className="bg-slate-900/70 p-3 rounded-lg border border-slate-850 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        {esAmbulancia ? <Truck className="w-3.5 h-3.5 text-blue-400" /> : <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{u.indicativo}</span>
                      </span>
                      <span className="text-amber-400 font-bold">{u.estadoSac}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{u.operador}</div>
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] flex items-center justify-between text-slate-400">
                      <span>Tiempo medio: <strong className="text-slate-200">{promedio}m</strong></span>
                      <span className={enMeta ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {enMeta ? 'En Meta' : 'Ajustar'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
