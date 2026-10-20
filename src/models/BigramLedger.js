/**
 * TypeFlow - Compact Bigram Mastery Ledger
 * Tracks a rolling Exponential Moving Average (EMA, alpha = 0.15) of transitions (L_1 -> L_2)
 * evaluating keystroke speed and accuracy against the target WPM interval.
 *
 * Classifies bigrams into:
 *  - Strong Bigram: Mastery >= 0.75
 *  - Weak / Target Bigram: Mastery <= 0.45
 *
 * Evaluates candidate words for i+1 Scaffolding:
 *  - Early game (< 35 words): 2.0x weight for Confidence Words (all strong or <=1 unseen)
 *  - Standard play (35+ words):
 *      - Bridge Word Match (1 Weak + >=75% Strong): 2.5x weight
 *      - Pure Comfort Match (0 Weak): 1.2x weight
 *      - Overload Match (>= 2 Weak): 0.15x weight (suppressed)
 */

class BigramLedger {
  constructor(initialData = {}) {
    // ledger: { [bg]: { m: mastery, hits: count } } or flat { [bg]: mastery }
    this.ledger = {};
    if (initialData && typeof initialData === 'object') {
      for (const [k, v] of Object.entries(initialData)) {
        if (typeof v === 'number') {
          this.ledger[k] = Math.max(0.0, Math.min(1.0, v));
        } else if (v && typeof v.m === 'number') {
          this.ledger[k] = Math.max(0.0, Math.min(1.0, v.m));
        }
      }
    }
    this.alpha = 0.15;
  }

  /**
   * Records a transition between two adjacent characters.
   * @param {string} char1 - Preceding character
   * @param {string} char2 - Current typed character
   * @param {number} transitionMs - Keystroke interval in milliseconds
   * @param {boolean} isCorrect - Whether current keystroke was a clean hit
   * @param {number} targetWpm - Current target WPM
   */
  recordTransition(char1, char2, transitionMs, isCorrect, targetWpm = 40) {
    if (!char1 || !char2) return null;
    const c1 = char1.toLowerCase();
    const c2 = char2.toLowerCase();
    if (!/^[a-z]$/.test(c1) || !/^[a-z]$/.test(c2)) return null;

    const bg = c1 + c2;

    // Target keystroke interval in ms: 60,000 / (targetWpm * 5) = 12,000 / targetWpm
    const targetInterval = targetWpm > 0 ? (12000 / targetWpm) : 300;

    // Speed Score S_bg in [0.0, 1.0]
    let s_bg = 1.0;
    if (transitionMs > targetInterval) {
      // Scale down linearly towards 0.0 for hesitation up to 3x target interval
      s_bg = Math.max(0.0, 1.0 - ((transitionMs - targetInterval) / (2.0 * targetInterval)));
    }

    // Accuracy Score A_bg in {0.0, 1.0}
    const a_bg = isCorrect ? 1.0 : 0.0;

    // Instant transition mastery
    const m_instant = (0.6 * s_bg) + (0.4 * a_bg);

    // Update Exponential Moving Average (alpha = 0.15)
    if (typeof this.ledger[bg] !== 'number') {
      this.ledger[bg] = Math.round(m_instant * 1000) / 1000;
    } else {
      const prev = this.ledger[bg];
      const updated = ((1.0 - this.alpha) * prev) + (this.alpha * m_instant);
      this.ledger[bg] = Math.round(updated * 1000) / 1000;
    }

    return this.ledger[bg];
  }

  /**
   * Returns mastery M_bg in [0.0, 1.0], or null if unseen.
   */
  getMastery(bg) {
    if (!bg || typeof this.ledger[bg] !== 'number') return null;
    return this.ledger[bg];
  }

  isStrong(bg) {
    const m = this.getMastery(bg);
    return m !== null && m >= 0.75;
  }

  isWeak(bg) {
    const m = this.getMastery(bg);
    return m !== null && m <= 0.45;
  }

  isUnseen(bg) {
    return this.getMastery(bg) === null;
  }

  /**
   * Returns the top N weakest seen bigrams, sorted ascending by mastery.
   */
  getWeakestBigrams(limit = 3) {
    const entries = [];
    for (const [bg, m] of Object.entries(this.ledger)) {
      if (m <= 0.45) {
        entries.push({ bg, mastery: m });
      }
    }
    entries.sort((a, b) => a.mastery - b.mastery);
    return entries.slice(0, limit).map(e => e.bg);
  }

  /**
   * Extracts adjacent bigrams from a word.
   */
  getWordBigrams(word) {
    if (!word || word.length < 2) return [];
    const bgs = [];
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    for (let i = 0; i < clean.length - 1; i++) {
      bgs.push(clean[i] + clean[i + 1]);
    }
    return bgs;
  }

  /**
   * Evaluates a word for i+1 Scaffolding Bridge Bonus.
   * @param {string} word - Candidate word
   * @param {number} unlockedCount - Number of words player has currently unlocked
   * @returns {{ weight: number, classification: string, weakBigrams: string[], strongBigrams: string[] }}
   */
  evaluateWordBridgeBonus(word, unlockedCount = 40) {
    const bgs = this.getWordBigrams(word);
    if (bgs.length === 0) {
      return { weight: 1.0, classification: 'neutral', weakBigrams: [], strongBigrams: [] };
    }

    const weakBgs = [];
    const strongBgs = [];
    let unseenCount = 0;

    for (const bg of bgs) {
      const m = this.getMastery(bg);
      if (m === null) {
        unseenCount++;
      } else if (m <= 0.45) {
        weakBgs.push(bg);
      } else if (m >= 0.75) {
        strongBgs.push(bg);
      }
    }

    const nTotal = bgs.length;
    const nWeak = weakBgs.length;
    const nStrong = strongBgs.length;

    // 1. Early Game (< 35 words unlocked): Prioritize Confidence Words
    if (unlockedCount < 35) {
      const isConfidence = (nStrong + unseenCount === nTotal) && (unseenCount <= 1) && (nWeak === 0);
      if (isConfidence) {
        return { weight: 2.0, classification: 'confidence', weakBigrams: weakBgs, strongBigrams: strongBgs };
      }
      return { weight: 1.0, classification: 'standard', weakBigrams: weakBgs, strongBigrams: strongBgs };
    }

    // 2. Standard Play (35+ words unlocked): Prioritize Bridge Words (i+1)
    const strongRatio = nStrong / nTotal;
    const isBridge = (nWeak === 1) && (nTotal <= 3 ? (nStrong === nTotal - 1) : (strongRatio >= 0.75));

    if (isBridge) {
      return { weight: 2.5, classification: 'bridge', weakBigrams: weakBgs, strongBigrams: strongBgs };
    }
    if (nWeak === 0) {
      return { weight: 1.2, classification: 'comfort', weakBigrams: weakBgs, strongBigrams: strongBgs };
    }
    if (nWeak >= 2) {
      return { weight: 0.15, classification: 'overload', weakBigrams: weakBgs, strongBigrams: strongBgs };
    }

    return { weight: 1.0, classification: 'neutral', weakBigrams: weakBgs, strongBigrams: strongBgs };
  }

  toJSON() {
    return { ...this.ledger };
  }

  fromJSON(data) {
    if (data && typeof data === 'object') {
      this.ledger = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'number') {
          this.ledger[k] = Math.max(0.0, Math.min(1.0, v));
        }
      }
    }
  }
}

// Global browser & CommonJS exports
if (typeof window !== 'undefined') {
  window.BigramLedger = BigramLedger;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BigramLedger };
}
