import React, { useState, useEffect } from 'react';
import { PttChannelInfo } from '../types/tactical';
import { CANALES_PTT_DISPONIBLES } from '../data/tacticalUnits';
import { tacticalAudio, VoiceMode, TacticalVoiceInfo } from '../utils/audio';
import { 
  Radio, 
  Mic, 
  Volume2, 
  VolumeX, 
  Activity, 
  Headphones, 
  Play, 
  Sliders, 
  AlertCircle, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

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
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(tacticalAudio.getVoiceMode());
  const [probandoVoz, setProbandoVoz] = useState<boolean>(false);
  const [customPitch, setCustomPitch] = useState<number>(tacticalAudio.getCustomPitch());
  const [vocesEspanol, setVocesEspanol] = useState<SpeechSynthesisVoice[]>([]);
  const [todasVoces, setTodasVoces] = useState<SpeechSynthesisVoice[]>([]);
  const [vozSeleccionadaURI, setVozSeleccionadaURI] = useState<string>(tacticalAudio.getSelectedVoiceURI() || '');
  const [voiceInfo, setVoiceInfo] = useState<TacticalVoiceInfo>(tacticalAudio.getVoiceInfo());

  const [logTransmisiones, setLogTransmisiones] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Radio VHF encendida. Enlace establecido en ${canalActivo.frecuenciaMhz}.`,
    `[${new Date().toLocaleTimeString()}] Sintonía nominal: ${canalActivo.nombre}.`
  ]);

  // Cargar y sincronizar voces del navegador
  useEffect(() => {
    const actualizarVoces = () => {
      const esp = tacticalAudio.getAvailableSpanishVoices();
      const all = tacticalAudio.getAllVoices();
      setVocesEspanol(esp);
      setTodasVoces(all);
      setVoiceInfo(tacticalAudio.getVoiceInfo());
      setVozSeleccionadaURI(tacticalAudio.getSelectedVoiceURI() || '');
    };

    actualizarVoces();
    const unsub = tacticalAudio.subscribe(actualizarVoces);
    
    // Forzar carga asíncrona si el navegador aún no las había poblado
    tacticalAudio.getVoicesAsync().then(() => {
      actualizarVoces();
    });

    return unsub;
  }, []);

  const cambiarModoVoz = (nuevoModo: VoiceMode) => {
    setVoiceMode(nuevoModo);
    tacticalAudio.setVoiceMode(nuevoModo);
    const info = tacticalAudio.getVoiceInfo();
    setVoiceInfo(info);
    setVozSeleccionadaURI(tacticalAudio.getSelectedVoiceURI() || '');
    setLogTransmisiones(prev => [
      `[${new Date().toLocaleTimeString()}] TTS TÁCTICO: Perfil cambiado a [${nuevoModo.toUpperCase()}] · ${info.name}`,
      ...prev.slice(0, 9)
    ]);
  };

  const seleccionarVozEspecifica = (uri: string) => {
    setVozSeleccionadaURI(uri);
    tacticalAudio.setSelectedVoiceURI(uri);
    const info = tacticalAudio.getVoiceInfo();
    setVoiceInfo(info);
    setLogTransmisiones(prev => [
      `[${new Date().toLocaleTimeString()}] TTS TÁCTICO: Voz manual fijada en [${info.name}] (${info.lang})`,
      ...prev.slice(0, 9)
    ]);
  };

  const ejecutarPruebaVoz = () => {
    setProbandoVoz(true);
    tacticalAudio.testVoice();
    setTimeout(() => setProbandoVoz(false), 3200);
  };

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

          {/* Visualizador de modulación de audio */}
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

        {/* MÓDULO AVANZADO: SÍNTESIS DE VOZ TÁCTICA (TTS) */}
        <div className="bg-slate-900 rounded-lg p-3.5 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>Voz Fonética Táctica (Español Neutro Masculino)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={ejecutarPruebaVoz}
                disabled={probandoVoz}
                className={`px-2.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border shadow-sm ${
                  probandoVoz
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 font-bold'
                }`}
                title="Escuchar prueba de voz táctica masculina neutra"
              >
                <Play className={`w-3.5 h-3.5 ${probandoVoz ? 'text-amber-400' : 'text-slate-950 fill-current'}`} />
                <span>{probandoVoz ? 'Modulando...' : 'Frase Neutra'}</span>
              </button>
              <button
                onClick={() => {
                  setProbandoVoz(true);
                  tacticalAudio.speakSacCode('QZ-18', 'Señal y enlace radial nominal. Reporte de señal cinco de cinco.');
                  setTimeout(() => setProbandoVoz(false), 3800);
                }}
                disabled={probandoVoz}
                className="px-2.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300"
                title="Probar modulación de clave SAC QZ-18"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Probar QZ-18</span>
              </button>
            </div>
          </div>

          {/* Selector de Modos de Voz */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => cambiarModoVoz('masculino_neutro')}
              className={`py-2 px-2.5 rounded-lg text-xs font-mono text-center transition-all border ${
                voiceMode === 'masculino_neutro'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/70 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div className="font-bold">Masculina</div>
              <div className="text-[10px] text-amber-400/80">Acento Neutro</div>
            </button>
            <button
              onClick={() => cambiarModoVoz('femenino')}
              className={`py-2 px-2.5 rounded-lg text-xs font-mono text-center transition-all border ${
                voiceMode === 'femenino'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/70 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div className="font-bold">Femenina</div>
              <div className="text-[10px] text-slate-500">Español Agudo</div>
            </button>
            <button
              onClick={() => cambiarModoVoz('sistema')}
              className={`py-2 px-2.5 rounded-lg text-xs font-mono text-center transition-all border ${
                voiceMode === 'sistema'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/70 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300 hover:bg-slate-850'
              }`}
            >
              <div className="font-bold">Por Defecto</div>
              <div className="text-[10px] text-slate-500">Nativo OS</div>
            </button>
          </div>

          {/* Selector Explícito de Voces Instaladas en el Navegador */}
          <div className="space-y-1.5 mb-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Voz Seleccionada en su Navegador:</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {vocesEspanol.length} voz/voces en español detectadas
              </span>
            </div>

            <select
              value={vozSeleccionadaURI}
              onChange={(e) => seleccionarVozEspecifica(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
            >
              {vocesEspanol.length > 0 ? (
                <>
                  <optgroup label="Voces en Español Verificadas (Recomendadas)">
                    {vocesEspanol.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                <option value="">
                  {todasVoces.length > 0 
                    ? '⚡ Modo Forzado: Español Neutro Masculino (es-ES) Barítono' 
                    : 'Cargando lista de voces del sistema...'}
                </option>
              )}
            </select>

            {vocesEspanol.length === 0 && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[11px] text-amber-300/90 font-mono flex items-start gap-1.5 mt-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Aviso de Entorno Windows/Navegador:</span> Su equipo no tiene paquetes de voz en español instalados localmente. El sistema fuerza la síntesis en red <strong className="text-white">es-ES</strong> sin asignar la voz en inglés de Windows (Microsoft Zira).
                </div>
              </div>
            )}
          </div>

          {/* Control deslizante de Modulación Barítona (Pitch) */}
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 space-y-2 mb-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Calibración de Tono (Pitch):</span>
              </span>
              <span className="text-amber-400 font-bold">
                {customPitch.toFixed(2)} {customPitch <= 0.8 ? '(Barítono Masculino)' : '(Estándar)'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">0.50 (Grave)</span>
              <input
                type="range"
                min="0.5"
                max="1.2"
                step="0.02"
                value={customPitch}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomPitch(val);
                  tacticalAudio.setCustomPitch(val);
                }}
                className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">1.20 (Agudo)</span>
            </div>
          </div>

          {/* Información y estado de modulación */}
          <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-850">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Salida Fonética:</span>
              </span>
              <span className="text-slate-200 truncate max-w-[220px]" title={voiceInfo.name}>
                {voiceInfo.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Idioma forzado: <strong className="text-slate-300">{voiceInfo.lang}</strong></span>
              <span>Cadencia: <strong className="text-slate-300">0.96x</strong></span>
            </div>
          </div>
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
