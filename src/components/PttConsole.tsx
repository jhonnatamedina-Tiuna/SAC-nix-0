import React, { useState } from 'react';
import { PttChannelInfo } from '../types/tactical';
import { CANALES_PTT_DISPONIBLES } from '../data/tacticalUnits';
import { tacticalAudio } from '../utils/audio';
import { Radio, Mic, MicOff, Volume2, VolumeX, Activity, ArrowRight, Zap, RefreshCw } from 'lucide-react';

interface PttConsoleProps {
  canalActivo: PttChannelInfo;
  onCambiarCanal: (canal: PttChannelInfo) => void;
  unidadVinculada: string;
  estadoCobaltoActual: string;
}

export const PttConsole: React.FC<PttConsoleProps> = ({
  canalActivo,
  onCambiarCanal,
  unidadVinculada,
  estadoCobaltoActual,
}) => {
  const [transmitiendo, setTransmitiendo] = useState<boolean>(false);
  const [muting, setMuting] = useState<boolean>(false);
  const [logTransmisiones, setLogTransmisiones] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Radio VHF encendida. Enlace establecido en ${canalActivo.frecuenciaMhz}.`,
    `[${new Date().toLocaleTimeString()}] Sintonía nominal: ${canalActivo.nombre}.`
  ]);

  const toggleMute = () => {
    const nextState = !muting;
    setMuting(nextState);
    tacticalAudio.setMuted(nextState);
  };

  const iniciarTransmision = () => {
    setTransmitiendo(true);
    tacticalAudio.playRogerBeep();
    setLogTransmisiones(prev => [
      `[${new Date().toLocaleTimeString()}] TX INICIADA · ${unidadVinculada} en ${canalActivo.frecuenciaMhz}`,
      ...prev.slice(0, 9)
    ]);
  };

  const finalizarTransmision = () => {
    if (transmitiendo) {
      setTransmitiendo(false);
      tacticalAudio.playSquelchTail();
      setLogTransmisiones(prev => [
        `[${new Date().toLocaleTimeString()}] TX CERRADA · Portadora liberada (Squelch tail)`,
        ...prev.slice(0, 9)
      ]);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado del módulo de radio */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Transceptor PTT & Conmutador Dinámico
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded transition-colors ${
              muting ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={muting ? 'Activar audio' : 'Silenciar audio'}
          >
            {muting ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ENLACE RF</span>
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Pantalla LCD de la Radio Táctica */}
        <div className="bg-[#091512] border-2 border-emerald-950 rounded-lg p-4 font-mono shadow-inner relative overflow-hidden">
          {/* Brillo de fondo LCD */}
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] text-emerald-500/80 uppercase tracking-widest font-semibold">
                CANAL DE VOZ SELECCIONADO
              </div>
              <div className="text-xl font-bold text-emerald-300 mt-0.5 tracking-tight">
                {canalActivo.nombre}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-emerald-500/80 uppercase tracking-widest">
                FRECUENCIA RF
              </div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">
                {canalActivo.frecuenciaMhz}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-400/90">
            <div>
              <span className="text-emerald-600">Unidad Enlazada:</span> {unidadVinculada}
            </div>
            <div>
              <span className="text-emerald-600">Estado SAC:</span> {estadoCobaltoActual}
            </div>
            <div>
              <span className="text-emerald-600">Modo:</span> Frecuencia Auto-conmutada
            </div>
          </div>

          {/* Visualizador de modulación de audio mientras se transmite */}
          <div className="mt-3 h-6 flex items-end gap-1 px-1">
            {Array.from({ length: 24 }).map((_, i) => {
              const altura = transmitiendo ? Math.max(15, (Math.sin(i * 0.8 + Date.now() * 0.01) + 1) * 50) : 10;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-all duration-75 ${
                    transmitiendo ? 'bg-emerald-400' : 'bg-emerald-950'
                  }`}
                  style={{ height: `${altura}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Botón Central PTT (Push-To-Talk) */}
        <div className="flex flex-col items-center justify-center py-2">
          <button
            onMouseDown={iniciarTransmision}
            onMouseUp={finalizarTransmision}
            onTouchStart={iniciarTransmision}
            onTouchEnd={finalizarTransmision}
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1 font-bold tracking-wider transition-all shadow-xl select-none active:scale-95 cursor-pointer ${
              transmitiendo
                ? 'bg-red-600 text-white ring-8 ring-red-500/30 scale-95 shadow-red-600/50'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-200 border-4 border-slate-700 shadow-slate-950'
            }`}
          >
            {transmitiendo ? (
              <>
                <Mic className="w-10 h-10 animate-bounce text-white" />
                <span className="text-xs font-mono tracking-widest uppercase">TRANSMITIENDO</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-mono tracking-widest uppercase">PULSAR PTT</span>
                <span className="text-[10px] text-slate-400 font-normal">Mantener presionado</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-400 mt-2 font-mono text-center">
            {transmitiendo ? 'Portadora abierta en frecuencia. Audio transmitiéndose.' : 'Haz clic sostenido o toca para modular en el canal actual.'}
          </span>
        </div>

        {/* Conmutador rápido de Canales Tácticos */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Canales Institucionales (Reasignación Manual)</span>
            <span className="text-[11px] text-slate-500 font-normal">Mapeo dinámico CB-80..86</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CANALES_PTT_DISPONIBLES.map((c) => {
              const isSelected = c.id === canalActivo.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onCambiarCanal(c);
                    tacticalAudio.playRogerBeep();
                  }}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'bg-amber-500/20 text-white border-amber-500/50 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{c.nombre}</span>
                    <span className="text-[10px] font-mono text-amber-400">{c.frecuenciaMhz}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{c.descripcion}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Historial de portadora y tráfico de radio */}
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-850 text-xs font-mono">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Registro de Eventos de Radiofrecuencia</span>
          </div>
          <div className="space-y-1 text-slate-400 max-h-24 overflow-y-auto">
            {logTransmisiones.map((log, idx) => (
              <div key={idx} className="leading-tight text-[11px]">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
