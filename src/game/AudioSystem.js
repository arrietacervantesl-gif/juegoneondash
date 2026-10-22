/**
 * Motor de Audio Rítmico y Efectos de Sonido mediante Web Audio API
 * Implementación sólida y robusta con tolerancia a políticas de autoplay,
 * programación de tiempo seguro (lookahead scheduling) y sintetizador melódico.
 */
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.noiseBuffer = null;

    // Estado del sintetizador rítmico
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.currentStep = 0;
    this.bpm = 138;

    // Escala menor armónica para la línea de bajo y melodía Geometry Dash
    this.bassNotes = [65.41, 65.41, 77.78, 87.31, 65.41, 65.41, 98.00, 87.31]; // C2, Eb2, F2, G2
    this.leadNotes = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 392.00, 311.13]; // C4, Eb4, F4, G4, Bb4, C5

    this.beatCallbacks = [];
  }

  /**
   * Inicializa de forma segura el AudioContext tras el primer gesto del usuario
   */
  ensureContext() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
          this.generateNoiseBuffer();
        }
      } catch (e) {
        console.warn('AudioContext error:', e);
      }
    }
  }

  generateNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2) - 1;
    }
  }

  onBeat(callback) {
    if (typeof callback === 'function') {
      this.beatCallbacks.push(callback);
    }
  }

  async resume() {
    this.ensureContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('No se pudo reanudar AudioContext:', e);
      }
    }

    if (this.ctx && !this.isPlayingBgm && !this.isMuted) {
      this.startBgm();
    }

    return this.ctx ? (this.ctx.state === 'running') : false;
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  startBgm() {
    this.ensureContext();
    if (!this.ctx || this.isPlayingBgm) return;
    this.isPlayingBgm = true;

    const stepIntervalMs = (60 / this.bpm / 2) * 1000;

    const tickBgm = () => {
      if (!this.isPlayingBgm) return;

      if (this.ctx && !this.isMuted) {
        // En caso de que se haya suspendido, intentar reanudar
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        } else if (this.ctx.state === 'running') {
          this.playBgmStep(this.currentStep);
        }
      }

      this.currentStep = (this.currentStep + 1) % 16;
      this.bgmTimer = setTimeout(tickBgm, stepIntervalMs);
    };

    tickBgm();
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  resetBgm() {
    this.currentStep = 0;
  }

  playBgmStep(step) {
    if (!this.ctx || this.ctx.state !== 'running') return;

    // Lookahead time seguro para evitar drops de audio
    const startTime = this.ctx.currentTime + 0.025;

    const isKick = (step % 4 === 0);
    const isSnare = (step % 8 === 4);

    // Notificar Beat Sync
    for (const cb of this.beatCallbacks) {
      cb({
        step,
        isKick,
        isSnare,
        intensity: isKick ? 1.0 : (isSnare ? 0.7 : 0.25)
      });
    }

    // 1. Kick en tiempos fuertes
    if (isKick) {
      this.triggerKick(startTime);
    }

    // 2. Hi-Hat en contratiempos
    if (step % 2 === 1) {
      this.triggerHiHat(startTime);
    }

    // 3. Bajo sintetizado constante
    const bassFreq = this.bassNotes[step % this.bassNotes.length];
    this.triggerBassNote(startTime, bassFreq);

    // 4. Arpegio agudo melódico en semicorcheas
    if (step % 2 === 0) {
      const leadFreq = this.leadNotes[(step / 2) % this.leadNotes.length];
      this.triggerLeadArp(startTime, leadFreq);
    }
  }

  triggerKick(time) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);

      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.16);
    } catch (e) {}
  }

  triggerHiHat(time) {
    try {
      if (!this.noiseBuffer) this.generateNoiseBuffer();
      if (!this.noiseBuffer) return;

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(time);
      noise.stop(time + 0.05);
    } catch (e) {}
  }

  triggerBassNote(time, freq) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, time);

      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.19);
    } catch (e) {}
  }

  triggerLeadArp(time, freq) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.11);
    } catch (e) {}
  }

  // --- EFECTOS DE SONIDO (SFX) ---

  playJump() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const time = this.ctx.currentTime + 0.01;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, time);
      osc.frequency.exponentialRampToValueAtTime(650, time + 0.12);

      gain.gain.setValueAtTime(0.45, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.13);
    } catch (e) {}
  }

  playOrb() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const time = this.ctx.currentTime + 0.01;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, time);
      osc.frequency.exponentialRampToValueAtTime(1250, time + 0.16);

      gain.gain.setValueAtTime(0.55, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.17);
    } catch (e) {}
  }

  playPortal() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const time = this.ctx.currentTime + 0.01;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, time);
      osc.frequency.linearRampToValueAtTime(850, time + 0.09);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.22);

      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.23);
    } catch (e) {}
  }

  playDeath() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const time = this.ctx.currentTime + 0.01;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + 0.26);

      gain.gain.setValueAtTime(0.65, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.27);
    } catch (e) {}
  }

  playCoin() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const time = this.ctx.currentTime + 0.01;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, time);
      osc1.frequency.setValueAtTime(1318.51, time + 0.08);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1975.53, time + 0.08);

      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(time);
      osc1.stop(time + 0.33);
      osc2.start(time + 0.08);
      osc2.stop(time + 0.33);
    } catch (e) {}
  }

  playCheckpoint() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const time = this.ctx.currentTime + 0.01;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, time);
      osc.frequency.exponentialRampToValueAtTime(783.99, time + 0.1);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.16);
    } catch (e) {}
  }

  playVictory() {
    this.resume();
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime + 0.02;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + (idx * 0.12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.45, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.36);
      });
    } catch (e) {}
  }
}
