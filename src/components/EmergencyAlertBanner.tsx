import React from 'react';
import { CriticalAlert } from '../types/tactical';
import { AlertOctagon, Zap, X, MapPin, Radio, ShieldAlert } from 'lucide-react';

interface EmergencyAlertBannerProps {
  alerta: CriticalAlert | null;
  onDespachar: (unidadIndicativo: string) => void;
  onCerrar: () => void;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  alerta,
  onDespachar,
  onCerrar,
}) => {
  if (!alerta || alerta.atendida) return null;

  return (
    <div className="bg-red-950/90 border-y md:border border-red-600/80 text-white p-3.5 shadow-2xl backdrop-blur-md rounded-none md:rounded-xl mb-4 transition-all animate-pulse-subtle">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-bold text-xs rounded">
                ALERTA ROJA TÁCTICA
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {alerta.tipoEvento}
              </span>
              <span className="text-red-300 text-xs">·</span>
              <span className="text-xs text-red-200">
                Emisor: <strong className="text-white">{alerta.unidadId}</strong>
              </span>
              <span className="text-red-300 text-xs">·</span>
              <span className="text-[11px] text-red-300 font-mono">
                {new Date(alerta.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-xs text-red-100 mt-1 font-medium">
              {alerta.descripcion}
            </p>
            {alerta.unidadSugerida && (
              <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-amber-200">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Despacho Sugerido PostGIS: <strong className="text-white">{alerta.unidadSugerida}</strong>
                  {alerta.distanciaMetros && ` (a ${(alerta.distanciaMetros / 1000).toFixed(2)} km)`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          {alerta.unidadSugerida && (
            <button
              onClick={() => onDespachar(alerta.unidadSugerida!)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all font-mono"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Despachar {alerta.unidadSugerida}</span>
            </button>
          )}
          <button
            onClick={onCerrar}
            className="p-1.5 text-red-300 hover:text-white rounded-lg hover:bg-red-900/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
