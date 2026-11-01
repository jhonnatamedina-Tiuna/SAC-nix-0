import React, { useState } from 'react';
import { OfflineQueueItem, CartographyRegion } from '../types/tactical';
import { REGIONES_CARTOGRAFICAS } from '../data/networkRules';
import { SAC_MATRIX } from '../data/sacMatrix';
import { tacticalAudio } from '../utils/audio';
import { Smartphone, HardDrive, Wifi, WifiOff, UploadCloud, Download, CheckCircle, Clock, Plus, Database, Map } from 'lucide-react';

interface MobileTerminalSimProps {
  onSyncRafaga: (paquetes: OfflineQueueItem[]) => void;
}

export const MobileTerminalSim: React.FC<MobileTerminalSimProps> = ({ onSyncRafaga }) => {
  const [unidadActiva, setUnidadActiva] = useState<string>('Cobalto-1');
  const [enlaceRed, setEnlaceRed] = useState<boolean>(false);
  const [colaOffline, setColaOffline] = useState<OfflineQueueItem[]>([
    {
      idPaquete: 'b4a8e291-76a1-4321-9988-1234567890ab',
      unidadId: 'Cobalto-1',
      tipoEvento: 'AM-41',
      prioridad: 1,
      fechaOffline: new Date(Date.now() - 600000).toISOString(),
      datos: {
        diagnostico: 'Trauma torácico severo con compromiso ventilatorio',
        frecuenciaCardiaca: 132,
        tensionArterial: '85/50',
        saturacionOxigeno: 84,
        latitud: 10.4910,
        longitud: -66.8890
      },
      estado: 'PENDIENTE'
    },
    {
      idPaquete: 'c9f11002-3321-4def-aacc-9876543210fe',
      unidadId: 'Cobalto-1',
      tipoEvento: 'AM-46',
      prioridad: 1,
      fechaOffline: new Date(Date.now() - 300000).toISOString(),
      datos: {
        procedimiento: 'Aplicación de torniquete táctico en extremidad inferior derecha',
        horaAplicacion: '14:15 UTC',
        paramedico: 'M. Rangel'
      },
      estado: 'PENDIENTE'
    }
  ]);

  const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>('AM-45');
  const [cartografia, setCartografia] = useState<CartographyRegion[]>(REGIONES_CARTOGRAFICAS);
  const [descargandoId, setDescargandoId] = useState<string | null>(null);

  // Registrar nuevo evento offline
  const handleRegistrarEvento = () => {
    const sacInfo = SAC_MATRIX.find(c => c.codigo === codigoSeleccionado);
    const idGenerado = crypto.randomUUID();
    const nuevoPaquete: OfflineQueueItem = {
      idPaquete: idGenerado,
      unidadId: unidadActiva,
      tipoEvento: codigoSeleccionado,
      prioridad: sacInfo ? sacInfo.prioridad : 3,
      fechaOffline: new Date().toISOString(),
      datos: {
        descripcion: sacInfo?.descripcion || 'Registro táctico de terreno',
        latitud: 10.4900 + (Math.random() - 0.5) * 0.01,
        longitud: -66.8900 + (Math.random() - 0.5) * 0.01,
        bateriaTerminal: 88
      },
      estado: 'PENDIENTE'
    };

    setColaOffline(prev => [nuevoPaquete, ...prev]);

    // TTS en auricular
    if (sacInfo) {
      tacticalAudio.speakSacCode(sacInfo.codigo, sacInfo.descripcion);
    }
  };

  // Simulación de ráfaga
  const handleDispararRafaga = () => {
    const pendientes = colaOffline.filter(p => p.estado === 'PENDIENTE');
    if (pendientes.length === 0) return;

    // Enviar a la estación central
    onSyncRafaga(pendientes);

    // Marcar como sincronizados en el SQLite local
    setColaOffline(prev =>
      prev.map(p => (p.estado === 'PENDIENTE' ? { ...p, estado: 'SINCRONIZADO' } : p))
    );

    // TTS de éxito en enlace restablecido
    tacticalAudio.speakSacCode('QZ-13', 'Conectividad de red mallada restablecida. Sincronización correcta.');
  };

  // Descarga simulada de archivo MBTiles
  const handleDescargarMbtiles = (id: string) => {
    setDescargandoId(id);
    setTimeout(() => {
      setCartografia(prev =>
        prev.map(r => (r.id === id ? { ...r, estado: 'DESCARGADO' } : r))
      );
      setDescargandoId(null);
      tacticalAudio.playRogerBeep();
    }, 1200);
  };

  const paquetesPendientes = colaOffline.filter(p => p.estado === 'PENDIENTE');

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Terminal Táctico Móvil & Motor Offline
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEnlaceRed(!enlaceRed)}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors border ${
              enlaceRed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            {enlaceRed ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{enlaceRed ? 'Mesh Ónix-0 En Rango' : 'Modo Offline (Sin Señal)'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Selector de unidad y estado SQLite */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="text-[11px] text-slate-400 block mb-1 font-mono">Unidad Emisora:</label>
            <select
              value={unidadActiva}
              onChange={(e) => setUnidadActiva(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Cobalto-1">Cobalto-1 (Ambulancia SVA)</option>
              <option value="Cobalto-2">Cobalto-2 (Ambulancia SVB)</option>
              <option value="Granito-1">Granito-1 (Patrulla SAR Ávila)</option>
              <option value="Granito-2">Granito-2 (Unidad K9)</option>
            </select>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-mono">Ledger SQLite Local:</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
                local_{unidadActiva}.db
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-amber-400 font-bold">
                {paquetesPendientes.length} Pendientes
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center">
            <button
              onClick={handleDispararRafaga}
              disabled={paquetesPendientes.length === 0}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                paquetesPendientes.length > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Disparar Ráfaga (/api/v1/sync)</span>
            </button>
          </div>
        </div>

        {/* Formulario de registro rápido en campo */}
        <div className="bg-slate-900/80 rounded-lg p-3.5 border border-slate-800">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Registrar Nuevo Evento en Terreno (Insert Local SQLite)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <select
              value={codigoSeleccionado}
              onChange={(e) => setCodigoSeleccionado(e.target.value)}
              className="flex-1 w-full sm:w-auto bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {SAC_MATRIX.slice(0, 40).map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.codigo} · {c.nombreMineral} · {c.descripcion.slice(0, 50)}...
                </option>
              ))}
            </select>
            <button
              onClick={handleRegistrarEvento}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guardar en Cola Offline + TTS</span>
            </button>
          </div>
        </div>

        {/* Cola Offline SQLite */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Cola de Paquetes Offline (Tabla cola_offline)</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{colaOffline.length} paquetes totales</span>
          </div>

          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden divide-y divide-slate-850">
            {colaOffline.map((p) => {
              const isPendiente = p.estado === 'PENDIENTE';
              return (
                <div key={p.idPaquete} className="p-3 hover:bg-slate-900/40 text-xs font-mono flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">{p.tipoEvento}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">{p.unidadId}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 text-[11px] truncate max-w-xs">{p.idPaquete}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {JSON.stringify(p.datos)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Generado: {new Date(p.fechaOffline).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPendiente
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución de Cartografía Offline (.mbtiles) */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-sky-400" />
            <span>Paquetes de Cartografía Offline (.mbtiles)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cartografia.map((r) => {
              const descargado = r.estado === 'DESCARGADO';
              const descargando = descargandoId === r.id;

              return (
                <div key={r.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono">{r.nombre}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.cobertura}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      {r.archivo} · {r.tamanioMb} MB · Zoom Z{r.zoomMax}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDescargarMbtiles(r.id)}
                    disabled={descargado || descargando}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium shrink-0 flex items-center gap-1.5 transition-colors ${
                      descargado
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : descargando
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse'
                        : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {descargado ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>En Dispositivo</span>
                      </>
                    ) : descargando ? (
                      <span>Descargando...</span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Bajar MBTiles</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
