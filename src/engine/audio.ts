// Futuristic Web Audio API sound synthesizer for NEURAL JACKPOT
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private ambientOsc: OscillatorNode | null = null;
  private spinNoiseNode: AudioNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.startAmbientHum();
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public enableAudio() {
    this.initContext();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  // Futuristic low ambient quantum drone
  private startAmbientHum() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;
    } catch {
      // Audio autoplay restriction handling
    }
  }

  // Tactile click for buttons and denomination selector
  public playClick(pitch: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(150 * pitch, t + 0.04);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {
      console.warn(e);
    }
  }

  // Mechanical spin acceleration whoosh
  public playSpinStart() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + 0.4);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.55);
    } catch (e) {
      console.warn(e);
    }
  }

  // Rapid mechanical tick for spinning reels
  public playReelTick(pitchMod: number = 1.0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320 * pitchMod, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.02);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch (e) {
      console.warn(e);
    }
  }

  // Mechanical reel stop "lock and clack"
  public playReelStop(reelIndex: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const baseFreq = 160 + reelIndex * 35;

      // Heavy metallic thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      // Glassy latch sound
      const latch = this.ctx.createOscillator();
      const latchGain = this.ctx.createGain();
      latch.type = 'triangle';
      latch.frequency.setValueAtTime(600 + reelIndex * 80, t);
      latch.frequency.exponentialRampToValueAtTime(200, t + 0.08);

      latchGain.gain.setValueAtTime(0.12, t);
      latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      latch.connect(latchGain);
      latchGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.14);
      latch.start(t);
      latch.stop(t + 0.1);
    } catch (e) {
      console.warn(e);
    }
  }

  // Harmonious futuristic win chime
  public playWin(multiplier: number = 1) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const notes = multiplier > 20 ? [440, 554, 659, 880, 1108] : [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + idx * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // Grand Win / "NEURAL OVERLOAD" cinematic sequence
  public playNeuralOverload() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      // Synthesize arpeggiated laser sweep and bass drop
      const chord = [220, 277.18, 329.63, 440, 554.37, 659.25, 880, 1108.73];
      chord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + i * 0.06;

        osc.type = i % 2 === 0 ? 'sine' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, start + 0.8);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + 1.3);
      });

      // Sub-bass sweep
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(150, t);
      sub.frequency.exponentialRampToValueAtTime(35, t + 1.5);
      subGain.gain.setValueAtTime(0.3, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(t);
      sub.stop(t + 1.6);
    } catch (e) {
      console.warn(e);
    }
  }

  // Cash out transfer beam sound
  public playCashOut() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(900, t + 0.35);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const soundManager = new SoundManager();
