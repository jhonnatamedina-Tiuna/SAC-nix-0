import React from 'react';

interface TacticalBootScreenProps {
  onComplete: () => void;
}

export const TacticalBootScreen: React.FC<TacticalBootScreenProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 select-none font-mono">
      {/* Cabecera superior de estado */}
      <div className="w-full flex justify-between items-center text-xs tracking-widest text-amber-500/80 border-b border-amber-500/20 pb-2">
        <span>BOOT_SEQUENCE_START // SAC-ONIX0</span>
        <span>LAT: 10.4900° N &nbsp; LON: -66.8900° W &nbsp;|&nbsp; CARACAS / DISTRITO CAPITAL</span>
      </div>

      {/* Núcleo central con animación y la insignia institucional */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        {/* Círculo SVG con texto adaptado y sin recortes */}
        <div className="absolute w-72 h-72 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full animate-spin-slow opacity-80" viewBox="0 0 240 240">
            <defs>
              <path
                id="circlePath"
                fill="none"
                d="M 30, 120 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0"
              />
            </defs>
            <text className="text-[10px] fill-amber-400 font-bold uppercase tracking-[0.2em]">
              <textPath href="#circlePath" startOffset="0%">
                FUNDACIÓN DE RESCATE TIUNA • REGIÓN CAPITAL • GRUPO DE OPERACIONES SAR •
              </textPath>
            </text>
          </svg>
        </div>

        {/* Insignia Institucional con ruta absoluta dinámica corregida */}
        <div className="relative z-10 w-28 h-28 flex items-center justify-center rounded-full bg-slate-900/80 border-2 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] mb-4">
          <img
            src={`${import.meta.env.BASE_URL}insignia-tiuna.png`}
            alt="Insignia Grupo de Rescate Tiuna"
            className="w-20 h-20 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Títulos e información táctica */}
        <h1 className="text-xl md:text-2xl font-black text-amber-400 tracking-wider text-center mt-2">
          FUNDACIÓN DE RESCATE TIUNA
        </h1>
        <p className="text-xs text-slate-400 tracking-widest mt-1 text-center">
          REGIÓN CAPITAL • GRUPO DE OPERACIONES SAR
        </p>
        <p className="text-[11px] text-amber-500/70 tracking-wide mt-1 text-center">
          Consola Maestra C4ISR Estación Ónix-0 con Matriz Operativa SAC 01–99
        </p>

        {/* Barra de progreso de arranque */}
        <div className="w-80 max-w-full bg-slate-900 border border-amber-500/30 rounded-full h-2 mt-6 overflow-hidden p-0.5">
          <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full animate-pulse transition-all duration-500 w-full" />
        </div>

        <div className="w-80 max-w-full flex justify-between items-center text-[10px] text-amber-400/80 mt-2">
          <span>⚡ KERNEL ÓXIN-0</span>
          <span>100% CARGADO</span>
        </div>

        {/* Caja de Terminal Log con caracteres seguros para TSX */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded p-3 mt-5 text-left shadow-inner">
          <p className="text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-1 font-semibold">
            {'>'}_ TERMINAL LOG TIUNA-OS v2.4
          </p>
          <p className="text-[11px] text-emerald-400/90 font-mono">
            {'>'} Cargando núcleo C4ISR Grupo de Rescate Tiuna v2.4... Conectado a Red Táctica.
          </p>
        </div>
      </div>

      {/* Pie de página con botón de acceso */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between border-t border-slate-800 pt-3 gap-3">
        <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
          <input type="checkbox" className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" />
          <span>Omitir boot screen en futuros accesos</span>
        </label>

        <button
          onClick={onComplete}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-pointer"
        >
          Acceder a Consola C4ISR &gt;
        </button>
      </div>
    </div>
  );
};
