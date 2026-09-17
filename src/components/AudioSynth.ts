// Web Audio API organic ambient soundscape synthesizer
class AmbientSoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private isPlaying = false;
  private currentMode: 'Rain' | 'Forest' | 'Stream' | 'Off' = 'Off';

  private initCtx() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch {
      // AudioContext policy restriction safe fallback
    }
  }

  play(mode: 'Rain' | 'Forest' | 'Stream') {
    this.stop();
    this.initCtx();
    if (!this.audioCtx) return;

    this.isPlaying = true;
    this.currentMode = mode;

    const bufferSize = 2 * this.audioCtx.sampleRate;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink / Brown noise generation for soothing natural sound
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter tuning depending on mode
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.gainNode = this.audioCtx.createGain();

    if (mode === 'Rain') {
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 1100;
      this.gainNode.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
    } else if (mode === 'Forest') {
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.value = 750;
      this.filterNode.Q.value = 1.2;
      this.gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

      // Subtle rustle modulation
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.value = 0.3; // slow leaf rustle
      lfoGain.gain.value = 300;
      lfo.connect(this.filterNode.frequency);
      lfo.start();
      this.lfoNode = lfo;
    } else {
      // Gentle stream
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 900;
      this.gainNode.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
    }

    whiteNoise.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
    whiteNoise.start(0);
    this.noiseNode = whiteNoise;
  }

  stop() {
    try {
      if (this.lfoNode) {
        this.lfoNode.stop();
        this.lfoNode.disconnect();
        this.lfoNode = null;
      }
      if (this.noiseNode) {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch {
      // ignore
    }
    this.isPlaying = false;
    this.currentMode = 'Off';
  }

  playCompletionChime() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // Harmonic Tibetan singing bowl / completion bell chord
      const freqs = [528, 792, 1056]; // Solfeggio 528Hz transformation tone
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(now);
        osc.stop(now + 3.5);
      });
    } catch {
      // Audio playback restrictions safe fallback
    }
  }

  getMode() {
    return this.currentMode;
  }

  isActive() {
    return this.isPlaying;
  }
}

export const audioSynth = new AmbientSoundSynthesizer();
