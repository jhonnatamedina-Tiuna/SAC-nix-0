import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone, Share2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstalled, isIOS, isAndroid, canPromptDirectly, triggerInstall } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    const outcome = await triggerInstall();
    if (outcome === 'manual_ios' || !canPromptDirectly) {
      setShowModal(true);
    }
  };

  return (
    <>
      {isInstalled ? (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-[11px] font-mono shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>App Instalada</span>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50 rounded-md text-[11px] font-mono font-medium transition-all shrink-0"
          title="Instalar en teléfono Android o iPhone"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Instalar Móvil</span>
        </button>
      )}

      {/* Modal Guía Rápida */}
      {showModal && (
        <div 
          style={{ backgroundColor: 'rgba(3, 7, 18, 0.88)', zIndex: 100 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div 
            style={{ backgroundColor: '#0f172a' }}
            className="border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl relative font-sans text-slate-200 text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-mono font-bold text-amber-400 flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4" />
                Instalar TiunaSAR en Teléfono
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-3">
              {isIOS ? (
                <div className="space-y-2">
                  <p className="font-bold text-sky-400 font-mono">📱 Pasos para iPhone / iPad:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    <li>Abre esta consola en <strong>Safari</strong>.</li>
                    <li>Toca el botón <strong>Compartir</strong> (<Share2 className="w-3 h-3 inline" />).</li>
                    <li>Selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.</li>
                    <li>Presiona <strong>&quot;Añadir&quot;</strong>.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-bold text-emerald-400 font-mono">🤖 Pasos para Android (WebAPK):</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                    <li>Abre el menú de Chrome (los 3 puntos superiores).</li>
                    <li>Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Añadir a pantalla principal&quot;</strong>.</li>
                    <li>Android generará el paquete <code>.apk</code> e instalará el icono en tus aplicaciones.</li>
                  </ol>
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>Cero Ralentización Garantizada</span>
                </div>
                Esta app móvil no ocupa cientos de megabytes en memoria de fondo. Su almacenamiento local está limitado estrictamente para teléfonos de 1GB/2GB RAM.
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
