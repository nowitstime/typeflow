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
    this.soundPack = 'clicky_blue';

    // Load initial preference from localStorage if available
    try {
      if (typeof localStorage !== 'undefined') {
        this.soundEnabled = localStorage.getItem('typeflow_sound_enabled') === 'true';
      }
    } catch (e) {
      this.soundEnabled = false;
    }
  }

  setSoundPack(packId) {
    const valid = ['clicky_blue', 'thoccy_linear', 'tactile_brown', 'zen_droplet', 'typewriter'];
    if (valid.includes(packId)) {
      this.soundPack = packId;
    } else {
      this.soundPack = 'clicky_blue';
    }
    return this.soundPack;
  }

  getSoundPack() {
    return this.soundPack || 'clicky_blue';
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
   * Synthesizes a single keystroke for a given mechanical switch pack at time offset `startTime`.
   */
  _triggerSwitchNote(packId, isSpace = false, streakStep = 0, timeOffset = 0) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime + timeOffset;
    const pitchSemitones = Math.min(18, streakStep || 0);
    const pitchMult = Math.pow(1.05946, pitchSemitones);
    const jitter = (Math.random() * 16) - 8;

    if (packId === 'thoccy_linear') {
      // Deep Gateron Ink / Linear Thock: low triangle with rapid sub-bass pitch drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startFreq = ((isSpace ? 115 : 155) + jitter * 0.4) * Math.pow(1.03, pitchSemitones);
      const endFreq = isSpace ? 48 : 65;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + (isSpace ? 0.055 : 0.042));

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.06 : 0.045));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
      return;
    }

    if (packId === 'tactile_brown') {
      // Tactile Brown: warm mid-range body + subtle high tactile bump transient
      const oscBody = ctx.createOscillator();
      const gainBody = ctx.createGain();
      const bodyFreq = ((isSpace ? 200 : 265) + jitter * 0.5) * Math.pow(1.04, pitchSemitones);

      oscBody.type = 'triangle';
      oscBody.frequency.setValueAtTime(bodyFreq, now);
      oscBody.frequency.exponentialRampToValueAtTime(95, now + 0.038);
      gainBody.gain.setValueAtTime(0.11, now);
      gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      oscBody.connect(gainBody);
      gainBody.connect(ctx.destination);
      oscBody.start(now);
      oscBody.stop(now + 0.048);

      const oscBump = ctx.createOscillator();
      const gainBump = ctx.createGain();
      oscBump.type = 'sine';
      oscBump.frequency.setValueAtTime(bodyFreq * 2.1, now);
      gainBump.gain.setValueAtTime(0.045, now);
      gainBump.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

      oscBump.connect(gainBump);
      gainBump.connect(ctx.destination);
      oscBump.start(now);
      oscBump.stop(now + 0.02);
      return;
    }

    if (packId === 'zen_droplet') {
      // Zen Water Droplet: upward pitch-bent sine harmonic sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = ((isSpace ? 290 : 390) + jitter * 0.6) * pitchMult;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.62, now + (isSpace ? 0.06 : 0.048));

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.065 : 0.052));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      return;
    }

    if (packId === 'typewriter') {
      // Vintage Striker: crisp mechanical impact + subtle harmonic bell on spacebar
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startFreq = isSpace ? 240 : (640 + jitter);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(isSpace ? 90 : 170, now + 0.028);

      gain.gain.setValueAtTime(0.075, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.036);

      if (isSpace) {
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(1318.5 * Math.pow(1.02, Math.min(12, streakStep || 0)), now);
        bellGain.gain.setValueAtTime(0.035, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        bell.connect(bellGain);
        bellGain.connect(ctx.destination);
        bell.start(now);
        bell.stop(now + 0.15);
      }
      return;
    }

    // Default: 'clicky_blue' (Box Blue Clicky)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const baseFreq = isSpace ? 320 : 480;
    const freq = (baseFreq + jitter) * pitchMult;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpace ? 0.05 : 0.035));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Mechanical key click with flow-streak pitch scaling and active switch sound pack.
   */
  playKey(isSpace = false, streakStep = 0) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      this.init();
      this._triggerSwitchNote(this.soundPack || 'clicky_blue', isSpace, streakStep, 0);
    } catch (e) {}
  }

  /**
   * Plays a short 3-key sample cadence so the user can preview a switch sound pack in the Armory.
   */
  previewSoundPack(packId) {
    try {
      this.init();
      if (!this.audioCtx) return;
      const targetPack = packId || this.soundPack || 'clicky_blue';
      this._triggerSwitchNote(targetPack, false, 2, 0.0);
      this._triggerSwitchNote(targetPack, false, 4, 0.075);
      this._triggerSwitchNote(targetPack, true, 6, 0.155);
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
