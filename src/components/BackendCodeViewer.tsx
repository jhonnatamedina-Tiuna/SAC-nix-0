import React, { useState } from 'react';
import { BACKEND_SCRIPTS, BackendFile } from '../data/rawBackendCode';
import { FileCode, Copy, Check, Download, ExternalLink, Terminal, Shield, Database } from 'lucide-react';

export const BackendCodeViewer: React.FC = () => {
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<BackendFile>(BACKEND_SCRIPTS[0]);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  const handleCopiar = () => {
    navigator.clipboard.writeText(archivoSeleccionado.contenido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDescargar = () => {
    const blob = new Blob([archivoSeleccionado.contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivoSeleccionado.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span>Arquitectura y Scripts de Despliegue Ónix-0</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Archivos fuente completos listos para producción en servidores Debian/Ubuntu con PostgreSQL y PostGIS.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiar}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiado ? 'Copiado al Portapapeles' : 'Copiar Archivo'}</span>
          </button>
          <button
            onClick={handleDescargar}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar</span>
          </button>
        </div>
      </div>

      {/* Selector de pestañas de archivos */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {BACKEND_SCRIPTS.map((script) => {
          const isSelected = script.nombre === archivoSeleccionado.nombre;
          return (
            <button
              key={script.nombre}
              onClick={() => {
                setArchivoSeleccionado(script);
                setCopiado(false);
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 border ${
                isSelected
                  ? 'bg-slate-800 text-amber-400 border-amber-500/40 shadow-sm'
                  : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
              }`}
            >
              <span>{script.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de información del archivo activo */}
      <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          <span className="text-slate-500">Ruta:</span> <strong className="text-slate-200">{archivoSeleccionado.ruta}</strong>
          {' '}· <span className="text-slate-500">{archivoSeleccionado.descripcion}</span>
        </div>
        <div>
          <span className="text-slate-500">Lenguaje:</span> {archivoSeleccionado.lenguaje.toUpperCase()}
        </div>
      </div>

      {/* Visor de código con numeración de líneas */}
      <div className="flex-1 overflow-auto bg-[#090d16] p-4 text-xs font-mono leading-relaxed select-text">
        <pre className="text-slate-300">
          <code>
            {archivoSeleccionado.contenido.split('\n').map((linea, idx) => (
              <div key={idx} className="table-row">
                <span className="table-cell select-none text-right pr-4 text-slate-600 w-10 text-[11px]">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre">
                  {linea}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
