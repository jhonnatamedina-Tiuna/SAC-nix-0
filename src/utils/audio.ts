/**
 * Sintetizador Procedural de Audio Táctico y TTS para Ónix-0 (Rescate Tiuna)
 * Utiliza Web Audio API para simular el canal RF (Roger beep, squelch, ráfagas)
 * y Web Speech API para la dicción fonética de claves SAC.
 */

class TacticalAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
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
   * Síntesis de voz fonética táctica (TTS).
   * Pronuncia primero un beep, luego la clave SAC y la descripción breve.
   */
  public speakSacCode(codigo: string, descripcion: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Tono previo
    this.playRogerBeep();

    setTimeout(() => {
      try {
        window.speechSynthesis.cancel();

        // Convertir ej "AM-41" a "Ámbar cuarenta y uno"
        let textoPronunciado = codigo;
        if (codigo.startsWith('QZ-')) {
          textoPronunciado = `Cuarzo ${codigo.replace('QZ-', '')}`;
        } else if (codigo.startsWith('GR-')) {
          textoPronunciado = `Granito ${codigo.replace('GR-', '')}`;
        } else if (codigo.startsWith('AM-')) {
          textoPronunciado = `Ámbar ${codigo.replace('AM-', '')}`;
        } else if (codigo.startsWith('DM-')) {
          textoPronunciado = `Diamante ${codigo.replace('DM-', '')}`;
        } else if (codigo.startsWith('CB-')) {
          textoPronunciado = `Cobalto ${codigo.replace('CB-', '')}`;
        } else if (codigo.startsWith('NX-')) {
          textoPronunciado = `Ónix ${codigo.replace('NX-', '')}`;
        }

        const textoCompleto = `${textoPronunciado}. ${descripcion}`;
        const utterance = new SpeechSynthesisUtterance(textoCompleto);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;

        // Intentar voz en español
        const voces = window.speechSynthesis.getVoices();
        const vozEspanol = voces.find(v => v.lang.startsWith('es'));
        if (vozEspanol) {
          utterance.voice = vozEspanol;
        }

        utterance.onend = () => {
          this.playSquelchTail();
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis fallback
      }
    }, 180);
  }
}

export const tacticalAudio = new TacticalAudioEngine();
