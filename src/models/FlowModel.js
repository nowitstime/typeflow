/**
 * TypeFlow - FlowModel
 * Pure mathematical state machine for Flow Momentum (0 - 120%),
 * Apex Flywheel Cushion, Multipliers, Idle Inertia Decay, and SRS Challenge Scaling.
 * Zero DOM dependencies.
 */

var _EventEmitter = (typeof EventEmitter !== 'undefined') ? EventEmitter : null;
if (!_EventEmitter && typeof require !== 'undefined') {
  try {
    _EventEmitter = require('../core/EventEmitter.js').EventEmitter;
  } catch (e) {}
}
if (!_EventEmitter) {
  _EventEmitter = class {
    constructor() { this._listeners = new Map(); }
    on(event, handler) { if (!this._listeners.has(event)) this._listeners.set(event, []); this._listeners.get(event).push(handler); return () => this.off(event, handler); }
    off(event, handler) { const l = this._listeners.get(event); if (!l) return; const i = l.indexOf(handler); if (i !== -1) l.splice(i, 1); }
    emit(event, ...args) { const l = this._listeners.get(event); if (!l) return; l.slice().forEach(fn => { try { fn(...args); } catch(e) { console.error(e); } }); }
    removeAllListeners(event) { if (event) this._listeners.delete(event); else this._listeners.clear(); }
  };
}

class FlowModel extends _EventEmitter {
  constructor(options = {}) {
    super();
    this.targetWpm = options.targetWpm || 40;
    this.momentum = 0.0; // 0.0 to 120.0
    this.flowStreak = 0;
    this.highStreak = options.highStreak || 0;
    this.consecutiveCleanWords = 0;
    this.eggCharge = Number(options.eggCharge) || 0.0; // 0.0 to 100.0
    this.eggChance = 0.0; // legacy alias
    this.lastKeystrokeTime = 0;
  }

  reset(preserveEggCharge = true, resetHighStreak = false) {
    this.momentum = 0.0;
    this.flowStreak = 0;
    this.consecutiveCleanWords = 0;
    if (!preserveEggCharge) {
      this.eggCharge = 0.0;
    }
    if (resetHighStreak) {
      this.highStreak = 0;
    }
    this.eggChance = 0.0;
    this.lastKeystrokeTime = 0;
    this.emit('reset', { momentum: 0.0, eggCharge: this.eggCharge, highStreak: this.highStreak });
  }

  setTargetWpm(wpm) {
    this.targetWpm = Math.max(5, Math.min(300, Number(wpm) || 40));
    this.emit('targetChanged', { targetWpm: this.targetWpm });
  }

  recordKeystroke(time = Date.now()) {
    this.lastKeystrokeTime = time;
  }

  getMultiplier() {
    if (this.momentum >= 100) return 3.0;
    if (this.momentum >= 75) return 2.5;
    if (this.momentum >= 50) return 2.0;
    if (this.momentum >= 25) return 1.2;
    return 1.0;
  }

  getChallengeScale() {
    if (this.momentum < 85) return 0.35;
    if (this.momentum < 100) return 0.85;
    return 1.25;
  }

  getTier() {
    if (this.momentum >= 100) return 'apex';
    if (this.momentum >= 75) return 'high';
    if (this.momentum >= 50) return 'flow';
    if (this.momentum >= 25) return 'waking';
    return 'idle';
  }

  getComboTier() {
    if (this.consecutiveCleanWords >= 15) return 'transcendence';
    if (this.consecutiveCleanWords >= 10) return 'overdrive';
    if (this.consecutiveCleanWords >= 5) return 'heated';
    return 'baseline';
  }

  /**
   * Evaluates word completion and modulates momentum flywheel and egg incubation.
   * @param {boolean} hasErrors - Whether word was submitted with uncorrected errors
   * @param {number} liveWpm - Current calculated WPM for the word
   * @param {boolean} hadBackspace - Whether user used backspace on this word
   * @param {number} basketCount - Number of eggs currently in basket
   * @param {number} baseXp - Base XP reward for the word
   * @returns {Object} result metadata
   */
  evaluateWord(hasErrors, liveWpm, hadBackspace = false, basketCount = 0, baseXp = 10) {
    const prevMomentum = this.momentum;
    const prevTier = this.getTier();
    let eggRollSuccess = false;

    if (hasErrors) {
      // Severe Mistake Penalty: Wipes cushion (>100), subtracts -25% momentum, -12% egg charge
      this.momentum = Math.max(0, Math.min(100.0, this.momentum) - 25.0);
      this.flowStreak = 0;
      this.consecutiveCleanWords = 0;
      this.eggCharge = Math.max(0.0, Math.round((this.eggCharge - 12.0) * 10) / 10);
      this.eggChance = 0.0;

      this.emit('stumble', {
        penalty: 25.0,
        momentum: this.momentum,
        eggCharge: this.eggCharge,
        hasErrors: true
      });
    } else if (liveWpm >= this.targetWpm) {
      // Paced Clean Hit: Accelerate flywheel
      this.flowStreak++;
      this.consecutiveCleanWords++;
      if (this.flowStreak > this.highStreak) {
        this.highStreak = this.flowStreak;
      }

      const speedBonus = Math.min(5.0, Math.max(0, ((liveWpm - this.targetWpm) / this.targetWpm) * 8.0));
      const deltaBase = 6.0 + (Math.min(100.0, this.momentum) / 100.0) * 10.0;
      this.momentum = Math.min(120.0, this.momentum + deltaBase + speedBonus);

      // Deterministic Egg Incubation (Roadmap 1.1):
      // Only charges when in Flow (momentum >= 100) and basket < 3
      if (this.momentum >= 100 && basketCount < 3) {
        let chargeGain = 3.0; // Base gain (~33 words)

        // Streak combo bonus
        if (this.consecutiveCleanWords >= 15) {
          chargeGain += 3.5;
        } else if (this.consecutiveCleanWords >= 10) {
          chargeGain += 2.0;
        } else if (this.consecutiveCleanWords >= 5) {
          chargeGain += 1.0;
        }

        // Apex cushion overspin bonus
        if (this.momentum > 100.0) {
          chargeGain += 1.0;
        }

        // Velocity surge bonus (>= 25% above target)
        if (liveWpm >= this.targetWpm * 1.25) {
          chargeGain += 1.0;
        }

        this.eggCharge = Math.min(100.0, Math.round((this.eggCharge + chargeGain) * 10) / 10);

        if (this.eggCharge >= 100.0) {
          eggRollSuccess = true;
          this.eggCharge = 0.0;
        }
      } else if (basketCount >= 3) {
        this.eggCharge = 0.0; // Paused/dormant when nest is full
      }

      this.emit('cleanHit', {
        momentum: this.momentum,
        flowStreak: this.flowStreak,
        liveWpm,
        speedBonus,
        eggCharge: this.eggCharge
      });
    } else {
      // Clean word, but below target pace: Gentle Exhale
      // Apex cushion dampens stumble from -12% down to -8%
      const exhaleAmount = this.momentum >= 100 ? 8.0 : 12.0;
      this.momentum = Math.max(0, this.momentum - exhaleAmount);
      this.flowStreak = Math.max(0, this.flowStreak - 2);
      this.consecutiveCleanWords = 0;
      this.eggCharge = Math.max(0.0, Math.round((this.eggCharge - 3.0) * 10) / 10);
      this.eggChance = 0.0;

      this.emit('slowClean', {
        exhaleAmount,
        momentum: this.momentum,
        eggCharge: this.eggCharge,
        liveWpm
      });
    }

    const currentTier = this.getTier();
    if (prevTier !== currentTier) {
      this.emit('tierChanged', { oldTier: prevTier, newTier: currentTier });
    }

    const multiplier = this.getMultiplier();
    const earnedXp = Math.max(1, Math.round(baseXp * multiplier * (hasErrors ? 0.25 : 1.0)));

    this.emit('momentumChanged', {
      momentum: this.momentum,
      delta: this.momentum - prevMomentum,
      multiplier,
      tier: currentTier,
      eggCharge: this.eggCharge,
      eggChance: this.eggChance,
      comboTier: this.getComboTier(),
      streak: this.flowStreak,
      earnedXp
    });

    return {
      momentum: this.momentum,
      multiplier,
      flowStreak: this.flowStreak,
      highStreak: this.highStreak,
      eggRollSuccess,
      eggCharge: this.eggCharge,
      eggChance: this.eggChance,
      comboTier: this.getComboTier(),
      earnedXp
    };
  }

  /**
   * Idle decay step called periodically (e.g. every 200ms).
   * @param {number} now - performance.now() or Date.now()
   * @param {number} dtSeconds - Delta time in seconds (default ~0.20s)
   */
  applyIdleDecay(now = Date.now(), dtSeconds = 0.20) {
    if (this.momentum <= 0 || !this.lastKeystrokeTime) return 0;

    const gracePeriod = this.momentum >= 100 ? 3000 : (this.momentum >= 50 ? 2200 : 1600);
    const idleTime = now - this.lastKeystrokeTime;

    if (idleTime > gracePeriod) {
      const overSec = (idleTime - gracePeriod) / 1000;
      const decayPerSec = overSec <= 2.0 ? 3.5 : 7.5;
      const decayAmount = decayPerSec * dtSeconds;
      const prevMomentum = this.momentum;
      this.momentum = Math.max(0, this.momentum - decayAmount);

      if (this.eggCharge > 0) {
        const chargeDecay = 2.5 * dtSeconds;
        this.eggCharge = Math.max(0.0, Math.round((this.eggCharge - chargeDecay) * 10) / 10);
      }

      if (this.momentum !== prevMomentum) {
        this.emit('decay', {
          momentum: this.momentum,
          decayAmount,
          idleTime,
          eggCharge: this.eggCharge
        });
        this.emit('momentumChanged', {
          momentum: this.momentum,
          delta: -decayAmount,
          multiplier: this.getMultiplier(),
          tier: this.getTier(),
          eggCharge: this.eggCharge,
          eggChance: this.eggChance,
          comboTier: this.getComboTier(),
          streak: this.flowStreak
        });
      }
      return decayAmount;
    }
    return 0;
  }
}

if (typeof window !== 'undefined') {
  window.FlowModel = FlowModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FlowModel };
}
