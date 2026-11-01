/**
 * TypeFlow - GhostPacerModel
 * Pure headless model for the Ghost Cursor Pacer (Visual Pace Rabbit).
 * Handles continuous character offset integration, cumulative word-stream
 * indexing, subpixel word/character coordinate mapping, and sandwich-splice
 * offset compensation. Zero DOM or timer dependencies.
 */

var _GhostEmitterBase = (typeof EventEmitter !== 'undefined')
  ? EventEmitter
  : (typeof require !== 'undefined' ? require('../core/EventEmitter.js').EventEmitter : class {});

class GhostPacerModel extends _GhostEmitterBase {
  constructor(options = {}) {
    super();
    this.minWpm = options.minWpm || 15;
    this.maxWpm = options.maxWpm || 150;
    this.maxFrameDtMs = options.maxFrameDtMs || 100;

    this.enabled = Boolean(options.enabled);
    this.speed = this.clampSpeed(options.speed !== undefined ? options.speed : 50);
    this.totalChars = 0;
    this.isRunning = false;
    this.needsSync = true;
    this.consecutiveWords = 0;
  }

  /**
   * Clamps target Ghost WPM between minWpm (15) and maxWpm (150).
   */
  clampSpeed(speed) {
    const parsed = parseInt(speed, 10);
    const num = (typeof parsed === 'number' && !isNaN(parsed) && parsed > 0) ? parsed : 50;
    return Math.max(this.minWpm, Math.min(this.maxWpm, num));
  }

  /**
   * Updates and clamps the Ghost Pacer WPM speed.
   */
  setSpeed(speed) {
    this.speed = this.clampSpeed(speed);
    this.emit('speedChanged', this.speed);
    return this.speed;
  }

  /**
   * Sets enabled state and marks needsSync when enabled.
   */
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.enabled) {
      this.needsSync = true;
    } else {
      this.isRunning = false;
    }
    this.emit('enabledChanged', this.enabled);
    return this.enabled;
  }

  /**
   * Toggles enabled state and returns the new boolean state.
   */
  toggle() {
    return this.setEnabled(!this.enabled);
  }

  /**
   * Calculates cumulative character index in the word stream (including 1 space per completed word).
   */
  getCharCumulativeIndex(words = [], wordIdx = 0, charIdx = 0) {
    const list = Array.isArray(words) ? words : [];
    let total = 0;
    for (let i = 0; i < wordIdx && i < list.length; i++) {
      total += list[i].length + 1;
    }
    return total + charIdx;
  }

  /**
   * Maps a continuous character offset (float) to { wordIdx, charIdx, fraction, isOutOfBounds }.
   */
  mapCharsToPosition(words = [], totalChars = this.totalChars) {
    const list = Array.isArray(words) ? words : [];
    let remaining = Math.max(0, totalChars);
    for (let i = 0; i < list.length; i++) {
      const wLen = list[i].length;
      const totalSlot = wLen + 1;
      if (remaining < totalSlot) {
        const charIdx = Math.floor(remaining);
        const fraction = remaining - charIdx;
        return {
          wordIdx: i,
          charIdx: Math.min(charIdx, wLen),
          fraction,
          isOutOfBounds: false
        };
      }
      remaining -= totalSlot;
    }
    return {
      wordIdx: Math.max(0, list.length - 1),
      charIdx: 999,
      fraction: 0,
      isOutOfBounds: true
    };
  }

  /**
   * Advances totalChars over dtMs at current speed (5 chars = 1 word) and returns mapped position.
   */
  advance(dtMs, words = []) {
    const clampedDt = Math.max(0, Math.min(this.maxFrameDtMs, Number(dtMs) || 0));
    const charsPerMs = (this.speed * 5) / 60000;
    this.totalChars += charsPerMs * clampedDt;
    return this.mapCharsToPosition(words, this.totalChars);
  }

  /**
   * Synchronizes totalChars to the player's current wordIdx and charIdx.
   */
  syncToPlayer(words = [], wordIdx = 0, charIdx = 0) {
    this.totalChars = this.getCharCumulativeIndex(words, wordIdx, charIdx);
    return this.totalChars;
  }

  /**
   * Compensates totalChars when new words (e.g. a hatched word sandwich) are spliced
   * into the stream at or before the ghost's current word position.
   */
  compensateInsertedWords(insertedWords = []) {
    if (!Array.isArray(insertedWords) || insertedWords.length === 0) return this.totalChars;
    const insertedChars = insertedWords.reduce((acc, w) => acc + w.length + 1, 0);
    this.totalChars += insertedChars;
    return this.totalChars;
  }

  /**
   * Checks whether the player's cumulative character index is strictly ahead of the ghost.
   */
  isPlayerAhead(words = [], wordIdx = 0, charIdx = 0) {
    const playerCumIdx = this.getCharCumulativeIndex(words, wordIdx, charIdx);
    return playerCumIdx > Math.floor(this.totalChars);
  }

  /**
   * Resets runtime pacer state for a new test/session while preserving enabled and speed preferences.
   */
  reset() {
    this.totalChars = 0;
    this.isRunning = false;
    this.needsSync = true;
    this.consecutiveWords = 0;
  }
}

if (typeof window !== 'undefined') {
  window.GhostPacerModel = GhostPacerModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GhostPacerModel };
}
