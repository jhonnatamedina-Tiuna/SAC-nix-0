import React, { useState, useMemo } from 'react';
import { SacCode, MineralType } from '../types/tactical';
import { SAC_MATRIX } from '../data/sacMatrix';
import { tacticalAudio } from '../utils/audio';
import { Search, Volume2, Radio, Filter, AlertOctagon, CheckCircle2, Shield, HeartPulse, Stethoscope, Truck, Terminal } from 'lucide-react';

interface SacMatrixPanelProps {
  onTransmitirClave: (codigo: SacCode) => void;
}

export const SacMatrixPanel: React.FC<SacMatrixPanelProps> = ({ onTransmitirClave }) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [mineralFiltro, setMineralFiltro] = useState<MineralType | 'TODOS'>('TODOS');
  const [prioridadFiltro, setPrioridadFiltro] = useState<number | 'TODAS'>('TODAS');
  const [claveActiva, setClaveActiva] = useState<string | null>(null);

  // Filtro reactivo
  const clavesFiltradas = useMemo(() => {
    return SAC_MATRIX.filter(c => {
      if (mineralFiltro !== 'TODOS' && c.mineral !== mineralFiltro) return false;
      if (prioridadFiltro !== 'TODAS' && c.prioridad !== prioridadFiltro) return false;
      if (busqueda.trim() !== '') {
        const query = busqueda.toLowerCase().trim();
        const coincideCodigo = c.codigo.toLowerCase().includes(query);
        const coincideDesc = c.descripcion.toLowerCase().includes(query);
        const coincideDominio = c.dominio.toLowerCase().includes(query);
        const coincideMineral = c.nombreMineral.toLowerCase().includes(query);
        return coincideCodigo || coincideDesc || coincideDominio || coincideMineral;
      }
      return true;
    });
  }, [busqueda, mineralFiltro, prioridadFiltro]);

  const mineralTabs: { id: MineralType | 'TODOS'; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'TODOS', label: 'Todas (01-99)', icon: <Filter className="w-3.5 h-3.5" />, count: SAC_MATRIX.length },
    { id: 'CUARZO', label: 'Cuarzo (01-19)', icon: <Radio className="w-3.5 h-3.5 text-cyan-400" />, count: 19 },
    { id: 'GRANITO', label: 'Granito (20-39)', icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />, count: 20 },
    { id: 'AMBAR', label: 'Ámbar (40-59)', icon: <HeartPulse className="w-3.5 h-3.5 text-amber-400" />, count: 20 },
    { id: 'DIAMANTE', label: 'Diamante (60-79)', icon: <Stethoscope className="w-3.5 h-3.5 text-sky-400" />, count: 20 },
    { id: 'COBALTO', label: 'Cobalto (80-89)', icon: <Truck className="w-3.5 h-3.5 text-blue-400" />, count: 10 },
    { id: 'ONIX', label: 'Ónix (90-99)', icon: <Terminal className="w-3.5 h-3.5 text-purple-400" />, count: 10 },
  ];

  const handlePronunciar = (c: SacCode) => {
    setClaveActiva(c.codigo);
    tacticalAudio.speakSacCode(c.codigo, c.descripcion);
  };

  const handleTransmitir = (c: SacCode) => {
    handlePronunciar(c);
    onTransmitirClave(c);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado del Panel */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Matriz Operativa SAC (01–99)</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono font-normal text-slate-400">Códigos Minerales Tiuna</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocolo de radiocomunicaciones y despacho táctico por bloques minerales.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => tacticalAudio.testVoice()}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors"
              title="Escuchar prueba de voz táctica masculina neutra"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Voz: Masculina Neutro</span>
            </button>
            <div className="text-xs font-mono text-slate-500 hidden sm:block">
              {clavesFiltradas.length} de {SAC_MATRIX.length} claves
            </div>
          </div>
        </div>

        {/* Buscador táctico */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por clave (ej: AM-41, GR-25) o palabras clave (paro, cerca, canal, hospital)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
          />
        </div>

        {/* Pestañas de minerales */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {mineralTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMineralFiltro(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                mineralFiltro === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-850'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filtro de prioridad */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span className="font-semibold text-slate-400">Filtrar Prioridad:</span>
          <button
            onClick={() => setPrioridadFiltro('TODAS')}
            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
              prioridadFiltro === 'TODAS' ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setPrioridadFiltro(1)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
              prioridadFiltro === 1 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-500 hover:text-red-400'
            }`}
          >
            P1 (Crítica)
          </button>
          <button
            onClick={() => setPrioridadFiltro(2)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono ${
              prioridadFiltro === 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-amber-400'
            }`}
          >
            P2 (Urgente)
          </button>
        </div>
      </div>

      {/* Lista de Claves */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 p-2">
        {clavesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No se encontraron claves SAC con el filtro especificado.
          </div>
        ) : (
          clavesFiltradas.map((c) => {
            const isCritical = c.prioridad === 1;
            const isPttTrigger = Boolean(c.cambioCanalPtt);

            return (
              <div
                key={c.codigo}
                className={`p-3 rounded-lg hover:bg-slate-850/60 transition-all ${
                  claveActiva === c.codigo ? 'bg-slate-800/90 ring-1 ring-amber-500/50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {/* Fila de metadatos limpia sin píldoras */}
                    <div className="flex items-center gap-2 text-xs font-mono mb-1">
                      <span className="font-bold text-white text-sm" style={{ color: c.color }}>
                        {c.codigo}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">{c.nombreMineral} ({c.rango})</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{c.dominio}</span>
                      <span className="text-slate-600">·</span>
                      <span className={isCritical ? 'text-red-400 font-semibold' : 'text-slate-500'}>
                        P{c.prioridad}
                      </span>
                    </div>

                    {/* Descripción oficial */}
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {c.descripcion}
                    </p>

                    {/* Acción sugerida o reasignación de canal */}
                    {c.accionSugerida && (
                      <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1.5 font-mono">
                        <AlertOctagon className="w-3 h-3 shrink-0" />
                        <span>Acción: {c.accionSugerida}</span>
                      </p>
                    )}
                    {c.cambioCanalPtt && (
                      <p className="text-[11px] text-blue-400 mt-1 flex items-center gap-1.5 font-mono">
                        <Radio className="w-3 h-3 shrink-0" />
                        <span>Reasigna PTT a: {c.cambioCanalPtt}</span>
                      </p>
                    )}
                  </div>

                  {/* Botones de acción rápida */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePronunciar(c)}
                      title="Pronunciar fonéticamente vía sintetizador TTS"
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTransmitir(c)}
                      title="Emitir transmisión táctica y registrar en consola"
                      className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 rounded transition-colors flex items-center gap-1"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Emitir</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
