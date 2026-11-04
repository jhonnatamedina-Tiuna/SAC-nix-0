/**
 * Sintetizador Procedural de Audio Táctico y TTS para Ónix-0 (Rescate Tiuna)
 * Utiliza Web Audio API para simular el canal RF (Roger beep, squelch, ráfagas)
 * y Web Speech API rigurosamente forzado en Español Neutro con Voz Masculina.
 */

export type VoiceMode = 'masculino_neutro' | 'femenino' | 'sistema';

export interface TacticalVoiceInfo {
  name: string;
  lang: string;
  mode: VoiceMode;
  isExplicitlyMale: boolean;
  totalSpanishVoicesFound: number;
}

export function isSpanishVoice(v: SpeechSynthesisVoice | null | undefined): boolean {
  if (!v) return false;
  const lang = (v.lang || '').toLowerCase().replace('_', '-');
  const name = (v.name || '').toLowerCase();
  return (
    lang.startsWith('es') ||
    lang.includes('-es') ||
    lang === 'spa' ||
    name.includes('spanish') ||
    name.includes('español') ||
    name.includes('castellano')
  );
}

export function isMaleVoice(v: SpeechSynthesisVoice | null | undefined): boolean {
  if (!v) return false;
  const name = (v.name || '').toLowerCase();
  const FEMALE_NAMES = [
    'monica', 'mónica', 'paulina', 'luciana', 'sabina', 'helena', 'paloma', 'laura', 
    'marta', 'rosa', 'female', 'mujer', 'zira', 'maria', 'maría', 'victoria', 
    'soledad', 'conchita', 'elvira', 'francisca', 'hilda', 'mia', 'jenny', 'cortana'
  ];
  if (FEMALE_NAMES.some(f => name.includes(f))) {
    return false;
  }
  const MALE_NAMES = [
    'jorge', 'diego', 'carlos', 'alonso', 'pablo', 'raul', 'raúl', 'enrique', 
    'tomas', 'tomás', 'alvaro', 'álvaro', 'miguel', 'juan', 'gonzalo', 'mateo', 'sebastian', 'sebastián',
    'male', 'hombre', 'david', 'natural', 'guy', 'neural', 'gabriel', 'alberto', 'andres', 'andrés', 'castellano'
  ];
  return MALE_NAMES.some(m => name.includes(m)) || !FEMALE_NAMES.some(f => name.includes(f));
}

/**
 * Filtra y selecciona activamente una voz masculina con perfil neutral en español
 * desde window.speechSynthesis.getVoices().
 */
export function findBestMaleSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const esVoices = voices.filter(v => isSpanishVoice(v));
  if (esVoices.length === 0) return null;

  const MALE_IDENTIFIERS = [
    'jorge', 'pablo', 'diego', 'carlos', 'alonso', 'raul', 'raúl', 'enrique', 
    'alvaro', 'álvaro', 'miguel', 'juan', 'tomas', 'tomás', 'gonzalo', 'mateo', 
    'sebastian', 'sebastián', 'david', 'male', 'hombre', 'guy', 'natural', 
    'neural', 'gabriel', 'alberto', 'castellano'
  ];

  const FEMALE_IDENTIFIERS = [
    'monica', 'mónica', 'paulina', 'luciana', 'sabina', 'helena', 'paloma', 'laura', 
    'marta', 'rosa', 'female', 'mujer', 'zira', 'maria', 'maría', 'victoria', 
    'soledad', 'conchita', 'elvira', 'francisca', 'hilda', 'mia', 'jenny', 'cortana'
  ];

  // 1. Prioridad: Voz en es-ES con nombre/identificador masculino explícito
  const maleEsEs = esVoices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const isEsEs = lang === 'es-es' || lang.startsWith('es-es');
    const hasMale = MALE_IDENTIFIERS.some(m => name.includes(m));
    const hasFemale = FEMALE_IDENTIFIERS.some(f => name.includes(f));
    return isEsEs && hasMale && !hasFemale;
  });
  if (maleEsEs) return maleEsEs;

  // 2. Prioridad: Voz en español neutro (es-419, es-MX, etc.) con identificador masculino explícito
  const maleNeutral = esVoices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const isNeutral = ['es-419', 'es-mx', 'es-us', 'es-co', 'es-ve', 'es-cl', 'es-pe', 'es-ar'].some(l => lang.includes(l));
    const hasMale = MALE_IDENTIFIERS.some(m => name.includes(m));
    const hasFemale = FEMALE_IDENTIFIERS.some(f => name.includes(f));
    return isNeutral && hasMale && !hasFemale;
  });
  if (maleNeutral) return maleNeutral;

  // 3. Cualquier voz en español con identificador masculino explícito
  const anyMaleEs = esVoices.find(v => {
    const name = (v.name || '').toLowerCase();
    const hasMale = MALE_IDENTIFIERS.some(m => name.includes(m));
    const hasFemale = FEMALE_IDENTIFIERS.some(f => name.includes(f));
    return hasMale && !hasFemale;
  });
  if (anyMaleEs) return anyMaleEs;

  // 4. Voz en es-ES sin firma femenina
  const nonFemaleEsEs = esVoices.find(v => {
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const isEsEs = lang === 'es-es' || lang.startsWith('es-es');
    const hasFemale = FEMALE_IDENTIFIERS.some(f => name.includes(f));
    return isEsEs && !hasFemale;
  });
  if (nonFemaleEsEs) return nonFemaleEsEs;

  // 5. Cualquier voz en español sin firma femenina
  const nonFemaleEs = esVoices.find(v => {
    const name = (v.name || '').toLowerCase();
    const hasFemale = FEMALE_IDENTIFIERS.some(f => name.includes(f));
    return !hasFemale;
  });
  if (nonFemaleEs) return nonFemaleEs;

  // 6. Primera voz en español disponible
  return esVoices[0] || null;
}

class TacticalAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voiceMode: VoiceMode = 'masculino_neutro';
  private selectedVoiceURI: string | null = null;
  private customPitch: number = 0.76; // Tono barítono táctico marcadamente masculino
  private customRate: number = 0.96;  // Cadencia militar pausada y comprensible
  private listeners: Array<() => void> = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null; // Previene recolección de basura del navegador
  private voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.cachedVoices = v;
        this.autoSelectBestMaleVoice();
        this.notify();
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }

  public async getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    
    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      this.cachedVoices = immediate;
      return immediate;
    }

    if (this.cachedVoices.length > 0) return this.cachedVoices;

    if (!this.voicesLoadedPromise) {
      this.voicesLoadedPromise = new Promise((resolve) => {
        let timer: ReturnType<typeof setTimeout>;

        const handler = () => {
          clearTimeout(timer);
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          const v = window.speechSynthesis.getVoices();
          this.cachedVoices = v;
          this.autoSelectBestMaleVoice();
          this.notify();
          resolve(v);
        };

        window.speechSynthesis.addEventListener('voiceschanged', handler);
        timer = setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          const v = window.speechSynthesis.getVoices();
          this.cachedVoices = v;
          this.autoSelectBestMaleVoice();
          this.notify();
          resolve(v);
        }, 500);
      });
    }

    return this.voicesLoadedPromise;
  }

  private autoSelectBestMaleVoice() {
    if (this.selectedVoiceURI) return; // Respeta selección manual si existe

    const maleVoice = findBestMaleSpanishVoice(this.cachedVoices);
    if (maleVoice) {
      this.selectedVoiceURI = maleVoice.voiceURI;
    }
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.notify();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVoiceMode(mode: VoiceMode) {
    this.voiceMode = mode;
    this.selectedVoiceURI = null; // Reinicia para auto-detectar según el modo
    this.autoSelectBestMaleVoice();
    this.notify();
  }

  public getVoiceMode(): VoiceMode {
    return this.voiceMode;
  }

  public setSelectedVoiceURI(uri: string) {
    this.selectedVoiceURI = uri;
    this.notify();
  }

  public getSelectedVoiceURI(): string | null {
    return this.selectedVoiceURI;
  }

  public setCustomPitch(pitch: number) {
    this.customPitch = Math.max(0.4, Math.min(1.6, pitch));
    this.notify();
  }

  public getCustomPitch(): number {
    return this.customPitch;
  }

  public setCustomRate(rate: number) {
    this.customRate = Math.max(0.5, Math.min(1.8, rate));
    this.notify();
  }

  public getCustomRate(): number {
    return this.customRate;
  }

  public getAvailableSpanishVoices(): SpeechSynthesisVoice[] {
    const voices = this.cachedVoices.length > 0 
      ? this.cachedVoices 
      : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
    return voices.filter(v => isSpanishVoice(v));
  }

  public getAllVoices(): SpeechSynthesisVoice[] {
    return this.cachedVoices.length > 0 
      ? this.cachedVoices 
      : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);
  }

  /**
   * Resuelve la voz táctica garantizando SIEMPRE idioma español y modulación barítona.
   */
  public getBestTacticalVoice(): { 
    voice: SpeechSynthesisVoice | null; 
    pitch: number; 
    rate: number; 
    isMale: boolean; 
    forcedLang: string;
  } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { voice: null, pitch: this.customPitch, rate: this.customRate, isMale: true, forcedLang: 'es-ES' };
    }

    const allVoices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    const esVoices = allVoices.filter(v => isSpanishVoice(v));

    // Si el usuario seleccionó una voz manualmente por URI
    if (this.selectedVoiceURI) {
      const explicit = allVoices.find(v => v.voiceURI === this.selectedVoiceURI);
      if (explicit) {
        const isEs = isSpanishVoice(explicit);
        return {
          voice: isEs ? explicit : null,
          pitch: this.voiceMode === 'femenino' ? 1.05 : this.customPitch,
          rate: this.customRate,
          isMale: this.voiceMode !== 'femenino',
          forcedLang: 'es-ES'
        };
      }
    }

    if (this.voiceMode === 'masculino_neutro') {
      const bestMale = findBestMaleSpanishVoice(allVoices);
      if (bestMale) {
        return { 
          voice: bestMale, 
          pitch: this.customPitch, 
          rate: this.customRate, 
          isMale: true, 
          forcedLang: 'es-ES' 
        };
      }

      // Si el sistema no reporta voces en español instaladas localmente:
      // Devolver voice: null para que Chromium/navegador use su motor en red con 'es-ES'
      // sin forzar jamás una voz en inglés del sistema operativo.
      return { 
        voice: null, 
        pitch: this.customPitch, 
        rate: this.customRate, 
        isMale: true, 
        forcedLang: 'es-ES' 
      };
    }

    if (this.voiceMode === 'femenino') {
      const female = esVoices.find(v => !isMaleVoice(v)) || esVoices[0] || null;
      return { 
        voice: female, 
        pitch: 1.05, 
        rate: 1.0, 
        isMale: false, 
        forcedLang: 'es-ES' 
      };
    }

    // Modo sistema
    const sysVoice = esVoices[0] || null;
    return { 
      voice: sysVoice, 
      pitch: 1.0, 
      rate: 1.0, 
      isMale: false, 
      forcedLang: 'es-ES' 
    };
  }

  public getVoiceInfo(): TacticalVoiceInfo {
    const { voice, isMale, forcedLang } = this.getBestTacticalVoice();
    const esCount = this.getAvailableSpanishVoices().length;
    return {
      name: voice ? voice.name : (esCount === 0 ? 'Español Neutro Forzado (es-MX)' : 'Voz Táctica'),
      lang: voice ? voice.lang : forcedLang,
      mode: this.voiceMode,
      isExplicitlyMale: isMale,
      totalSpanishVoicesFound: esCount
    };
  }

  /**
   * Genera el auténtico "Roger Beep" militar/táctico (doble tono 880Hz -> 1760Hz).
   */
  public playRogerBeep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // Primer tono
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Segundo tono agudo
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1760, now + 0.08);
      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.16);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Genera el ruido blanco de corte de transmisión (Squelch tail) característico de radios VHF/UHF.
   */
  public playSquelchTail() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 0.12; // 120ms
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 2;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.12);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Alarma de emergencia crítica (para AM-41, GR-25, etc.)
   */
  public playCriticalAlertChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        const start = now + i * 0.14;
        osc.frequency.setValueAtTime(950, start);
        osc.frequency.exponentialRampToValueAtTime(1400, start + 0.1);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.12);
      }
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Pronuncia un texto libre utilizando rigurosamente voz en español masculino y acento neutro.
   */
  public async speakText(texto: string, conRogerBeep: boolean = true) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Asegurar que las voces del navegador estén cargadas
    await this.getVoicesAsync();

    if (conRogerBeep) {
      this.playRogerBeep();
    }

    setTimeout(() => {
      try {
        // Desbloquear si el sintetizador estaba pausado por pérdida de foco
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(texto);
        const { voice, pitch, rate } = this.getBestTacticalVoice();

        // Configuración explícita del objeto SpeechSynthesisUtterance a 'es-ES'
        utterance.lang = 'es-ES';

        // Asignar la voz masculina con perfil neutral en español seleccionada
        if (voice && isSpanishVoice(voice)) {
          utterance.voice = voice;
        }

        // Parámetros acústicos barítonos masculinos
        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onend = () => {
          this.playSquelchTail();
          this.activeUtterance = null;
        };

        utterance.onerror = () => {
          this.activeUtterance = null;
        };

        // Mantener referencia viva en memoria para evitar el bug de Garbage Collection en Chromium/Safari
        this.activeUtterance = utterance;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback
      }
    }, conRogerBeep ? 190 : 50);
  }

  /**
   * Convierte números del 01 al 99 a palabras fonéticas en español
   */
  public numeroAPalabrasEspanol(numStr: string): string {
    const n = parseInt(numStr, 10);
    if (isNaN(n)) return numStr;
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const diezAVeinte = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];

    if (n === 0) return 'cero';
    if (n < 10) return unidades[n];
    if (n <= 20) return diezAVeinte[n - 10];
    if (n < 30) return `veinti${unidades[n - 20]}`;

    const d = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return decenas[d];
    return `${decenas[d]} y ${unidades[u]}`;
  }

  /**
   * Prueba táctica de la voz masculina con acento neutro configurada.
   */
  public testVoice() {
    this.speakText('Ónix Cero Central. Transmisión táctica en español neutro verificada. Cuarzo dieciocho, frecuencia nominal.', true);
  }

  /**
   * Síntesis de voz fonética táctica (TTS) para claves SAC 01-99.
   * Pronuncia primero un roger beep, luego el bloque mineral fonético y su significado en español masculino neutro.
   */
  public async speakSacCode(codigo: string, descripcion: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    await this.getVoicesAsync();

    // Tono previo
    this.playRogerBeep();

    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        // Convertir ej "AM-41" a "Ámbar cuarenta y uno" fonético en palabras en español
        let mineralNombre = 'Clave';
        const rawNumero = codigo.split('-')[1] || '';
        const numeroEnPalabras = this.numeroAPalabrasEspanol(rawNumero);
        
        if (codigo.startsWith('QZ-')) {
          mineralNombre = 'Cuarzo';
        } else if (codigo.startsWith('GR-')) {
          mineralNombre = 'Granito';
        } else if (codigo.startsWith('AM-')) {
          mineralNombre = 'Ámbar';
        } else if (codigo.startsWith('DM-')) {
          mineralNombre = 'Diamante';
        } else if (codigo.startsWith('CB-')) {
          mineralNombre = 'Cobalto';
        } else if (codigo.startsWith('NX-')) {
          mineralNombre = 'Ónix';
        }

        const textoCompleto = `${mineralNombre} ${numeroEnPalabras}. ${descripcion}`;
        const utterance = new SpeechSynthesisUtterance(textoCompleto);
        const { voice, pitch, rate } = this.getBestTacticalVoice();

        // Configuración explícita del objeto SpeechSynthesisUtterance a 'es-ES'
        utterance.lang = 'es-ES';

        // Asignar voz masculina en español si está disponible
        if (voice && isSpanishVoice(voice)) {
          utterance.voice = voice;
        }
        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onend = () => {
          this.playSquelchTail();
          this.activeUtterance = null;
        };

        utterance.onerror = () => {
          this.activeUtterance = null;
        };

        this.activeUtterance = utterance;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis fallback
      }
    }, 190);
  }

  /**
   * Sonido táctico de inicialización / boot del sistema C4ISR Ónix-0.
   */
  public playBootSequenceSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const freqs = [330, 440, 660, 880];

      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        const startTime = now + idx * 0.08;
        const duration = 0.15;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio fallback
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();
