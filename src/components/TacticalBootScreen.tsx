import React, { useState, useEffect } from 'react';
import { tacticalAudio } from '../utils/audio';
import { Shield, Radio, Terminal, CheckCircle2, ChevronRight, Activity, Cpu } from 'lucide-react';

interface TacticalBootScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  { step: 10, module: 'KERNEL ÓXIN-0', text: 'Cargando núcleo C4ISR Grupo de Rescate Tiuna v2.4...' },
  { step: 25, module: 'RED MALLADA', text: 'Verificando subredes institucionales 10.42.0.0/24 y 10.42.10.0/23... OK' },
  { step: 40, module: 'FIREWALL DEFON', text: 'Políticas iptables listas: Bloqueo automático tras 5 intentos fallidos (NX-93)... OK' },
  { step: 55, module: 'POSTGIS ESPACIAL', text: 'Indexando cuadrantes geográficos WGS-84 y despacho de vecino más cercano... OK' },
  { step: 70, module: 'MATRIZ SAC 01-99', text: 'Cargando minerales: Cuarzo, Granito, Ámbar, Diamante, Cobalto, Ónix... OK' },
  { step: 85, module: 'TRANSCEPTOR PTT', text: 'Enrutador dúplex RF: Base (147.400), Táctico 1, Escena 2, Sanitario 3... OK' },
  { step: 95, module: 'MOTOR OFFLINE', text: 'Buffer anular FIFO anti-ralentización para teléfonos de campo... OK' },
  { step: 100, module: 'SISTEMA LISTO', text: 'Estación Ónix-0 plenamente operativa. Concediendo control al operador.' }
];

export const TacticalBootScreen: React.FC<TacticalBootScreenProps> = ({ onComplete }) => {
  const [progreso, setProgreso] = useState<number>(5);
  const [indiceLog, setIndiceLog] = useState<number>(0);
  const [noVolverAMostrar, setNoVolverAMostrar] = useState<boolean>(false);

  useEffect(() => {
    // Reproducir acorde táctico de inicialización
    tacticalAudio.playBootSequenceSound();

    const interval = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        const nextVal = prev + Math.floor(Math.random() * 8) + 6;
        return nextVal > 100 ? 100 : nextVal;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    // Actualizar log activo según progreso
    for (let i = BOOT_LOGS.length - 1; i >= 0; i--) {
      if (progreso >= BOOT_LOGS[i].step) {
        setIndiceLog(i);
        break;
      }
    }
  }, [progreso]);

  const handleSaltar = () => {
    if (noVolverAMostrar) {
      try {
        localStorage.setItem('tiuna_skip_boot', 'true');
      } catch {
        // Silencioso
      }
    }
    tacticalAudio.playRogerBeep();
    onComplete();
  };

  const handleToggleNoMostrar = (checked: boolean) => {
    setNoVolverAMostrar(checked);
    try {
      if (checked) {
        localStorage.setItem('tiuna_skip_boot', 'true');
      } else {
        localStorage.removeItem('tiuna_skip_boot');
      }
    } catch {
      // Silencioso
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#070b12] text-slate-100 flex flex-col items-center justify-between p-6 select-none overflow-hidden font-sans">
      {/* Fondo de rejilla táctica y radar */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(245, 158, 11, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 158, 11, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Línea de escaneo CRT sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-20 w-full animate-scan pointer-events-none" />

      {/* Barra superior de telemetría de arranque */}
      <div className="w-full max-w-4xl flex items-center justify-between text-xs font-mono text-slate-400 z-10 pt-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-400 font-bold tracking-wider">BOOT_SEQUENCE_START // SAC-ONIX0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>LAT: 10.4900° N</span>
          <span>LON: -66.8900° W</span>
          <span className="text-amber-500/80 font-bold">CARACAS / DISTRITO CAPITAL</span>
        </div>
      </div>

      {/* Contenido Central: Insignia Oficial y Halo Táctico */}
      <div className="flex flex-col items-center justify-center my-auto z-10 max-w-xl text-center">
        {/* Contenedor del Logo con Anillo de Radar */}
        <div className="relative mb-6">
          {/* Anillo de Pulso Exterior */}
          <div className="absolute -inset-6 rounded-full border border-amber-500/20 animate-pulse pointer-events-none" />
          <div className="absolute -inset-3 rounded-full border border-dashed border-amber-500/30 animate-[spin_20s_linear_infinite] pointer-events-none" />
          
          {/* Resplandor suave */}
          <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Insignia Oficial de la Fundación de Rescate Tiuna */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20 bg-slate-950 p-1 flex items-center justify-center">
            <img
              src="/assets/aistudio/Tiuna_Capital_Nativo_1920_8bfdc104.png"
              alt="Fundación de Rescate Tiuna - Región Capital"
              className="w-full h-full object-contain filter drop-shadow-md transform transition-transform hover:scale-105 duration-300"
            />
          </div>

          {/* Indicador de estado en el anillo */}
          <div className="absolute bottom-0 right-2 px-2 py-0.5 rounded-full bg-slate-950 border border-amber-400 text-[10px] font-mono font-bold text-amber-300 shadow">
            {progreso}%
          </div>
        </div>

        {/* Títulos Institucionales Autorizados */}
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono uppercase">
          Fundación de Rescate Tiuna
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-400 font-mono mt-1 uppercase">
          Región Capital · Grupo de Operaciones SAR
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Consola Maestra C4ISR Estación Ónix-0 con Matriz Operativa SAC 01–99
        </p>

        {/* Barra de Progreso de Inicialización */}
        <div className="w-full max-w-md mt-6 space-y-2">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full transition-all duration-150 shadow-md shadow-amber-500/40"
              style={{ width: `${progreso}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>{BOOT_LOGS[indiceLog]?.module || 'INICIALIZANDO'}</span>
            </span>
            <span className="font-bold text-white">{progreso}% CARGADO</span>
          </div>
        </div>

        {/* Consola de Logs Procedurales del Sistema */}
        <div className="w-full max-w-lg mt-5 bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-left font-mono text-[11px] text-slate-300 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] pb-1.5 mb-1.5 border-b border-slate-850">
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>TERMINAL LOG TIUNA-OS v2.4</span>
          </div>
          <div className="space-y-1 h-14 overflow-hidden flex flex-col justify-end">
            {BOOT_LOGS.slice(Math.max(0, indiceLog - 1), indiceLog + 1).map((log, idx) => (
              <div key={idx} className="flex items-start gap-1.5 truncate">
                <span className="text-amber-500 font-bold shrink-0">&gt;</span>
                <span className="text-slate-200">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pie de Pantalla: Acceso Rápido y Preferencias */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-10 pb-2 border-t border-slate-800/80 pt-3">
        <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer font-mono text-[11px]">
          <input
            type="checkbox"
            checked={noVolverAMostrar}
            onChange={(e) => handleToggleNoMostrar(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:outline-none"
          />
          <span>Omitir boot screen en futuros accesos</span>
        </label>

        <button
          onClick={handleSaltar}
          className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs font-mono transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <span>Acceder a Consola C4ISR</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
