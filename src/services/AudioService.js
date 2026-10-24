/**
 * TypeFlow - AudioService
 * Web Audio API procedural sound synthesizer.
 * Handles mechanical key clicks with streak pitch-scaling, egg fracture wobbles,
 * hatching arpeggios, level-up fanfares, and egg drop pop chimes.
 */

class AudioService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = false;

    // Load initial preference from localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        this.soundEnabled = localStorage.getItem('typeflow_sound_enabled') === 'true';
      }
    } catch (e) {
      this.soundEnabled = false;
    }
  }

  /**
   * Initializes or resumes the AudioContext on user interaction.
   */
  init() {
    if (!this.audioCtx) {
      const AudioContextClass = (typeof window !== 'undefined')
        ? (window.AudioContext || window.webkitAudioContext)
        : (typeof global !== 'undefined' ? (global.AudioContext || global.webkitAudioContext) : null);

      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();
        } catch (e) {
          this.audioCtx = null;
        }
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        this.audioCtx.resume();
      } catch (e) {}
    }
  }

  isEnabled() {
    return this.soundEnabled;
  }

  setEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('typeflow_sound_enabled', String(this.soundEnabled));
      }
    } catch (e) {}
    if (this.soundEnabled) {
      this.init();
    }
    return this.soundEnabled;
  }

  toggle() {
    return this.setEnabled(!this.soundEnabled);
  }

  /**
   * Mechanical key click with flow-streak pitch scaling (semitones: 2^(n/12))
   */
  playKey(isSpace = false, streakStep = 0) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = isSpace ? 320 : 480;
      const pitchSemitones = Math.min(18, streakStep || 0);
      const freq = (baseFreq + (Math.random() * 25 - 12)) * Math.pow(1.05946, pitchSemitones);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isSpace ? 0.05 : 0.035));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  /**
   * Egg cracking fracture wobble sound
   */
  playFracture() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {}
  }

  /**
   * Egg shatter & word reveal sound (sparkly ascending arpeggio)
   */
  playHatch() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.24);
      });
    } catch (e) {}
  }

  /**
   * Level-up celebration fanfare
   */
  playLevelUp() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch (e) {}
  }

  /**
   * Cute pop chime when an egg is discovered during typing
   */
  playEggDrop() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.2);
      });
    } catch (e) {}
  }

  /**
   * Soft error thud
   */
  playError() {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.10, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }

  /**
   * Procedural chime for achievement unlock
   * tier: 1 (crisp 3-note chime) | 2 | 'crown' | 'feat' (resonant major 7th arpeggio)
   */
  playAchievementUnlock(tier = 1) {
    if (!this.soundEnabled) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const isGrand = tier === 2 || tier === 'crown' || tier === 'feat' || tier === 'apex';
      const notes = isGrand
        ? [523.25, 659.25, 783.99, 987.77, 1046.50] // C5, E5, G5, B5, C6
        : [587.33, 739.99, 880.00];                // D5, F#5, A5
      const noteDelay = isGrand ? 0.07 : 0.08;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isGrand ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * noteDelay);
        gain.gain.setValueAtTime(isGrand ? 0.12 : 0.10, now + idx * noteDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * noteDelay + (isGrand ? 0.35 : 0.25));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * noteDelay);
        osc.stop(now + idx * noteDelay + (isGrand ? 0.38 : 0.28));
      });
    } catch (e) {}
  }
}

// Singleton instance
const audioService = new AudioService();

if (typeof window !== 'undefined') {
  window.AudioService = AudioService;
  window.audioService = audioService;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudioService, audioService };
}
