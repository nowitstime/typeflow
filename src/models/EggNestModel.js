/**
 * TypeFlow - EggNestModel
 * Pure mathematical state machine for the 3-Slot In-Situ Egg Nest & Hatchery.
 * Handles egg slot allocations, typing "egg" fracture stages, hatch transitions, and fluid slot clears.
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

class EggNestModel extends _EventEmitter {
  constructor(options = {}) {
    super();
    this.maxSlots = options.maxSlots || 3;
    this.targetWord = options.targetWord || 'egg';
    this.basket = options.basket || []; // Array of { id, name, rarity, wordRank, tierColor }
    this.hatchingSlotIndex = -1; // -1 when inactive, 0..2 when hatching an egg
    this.hatchTyped = '';
    this.revealedSlots = {}; // { [slotIdx]: { word, tierColor, name } }
    this.eggsHatchedInSession = false;
  }

  syncBasket(basket = []) {
    this.basket = Array.isArray(basket) ? basket.slice(0, this.maxSlots) : [];
    this.emit('basketSynced', { basket: this.basket, count: this.basket.length });
  }

  isHatching() {
    return this.hatchingSlotIndex !== -1;
  }

  getSlotStatus(slotIdx) {
    if (this.revealedSlots[slotIdx]) {
      return {
        state: 'revealed',
        data: this.revealedSlots[slotIdx]
      };
    }
    // Calculate which egg belongs in this slot
    let eggIdx = 0;
    for (let i = 0; i < slotIdx; i++) {
      if (!this.revealedSlots[i]) eggIdx++;
    }
    if (eggIdx < this.basket.length) {
      const egg = this.basket[eggIdx];
      const isFocused = (this.hatchingSlotIndex === slotIdx);
      return {
        state: 'occupied',
        egg,
        isFocused,
        hatchTyped: isFocused ? this.hatchTyped : '',
        eggIndex: eggIdx
      };
    }
    return { state: 'empty' };
  }

  enterHatchMode(preferredSlot = -1) {
    if (this.basket.length === 0) return false;

    let targetIdx = preferredSlot;
    if (targetIdx < 0 || targetIdx >= this.maxSlots || this.revealedSlots[targetIdx]) {
      // Find first unrevealed slot with an egg
      let currentEggIdx = 0;
      targetIdx = -1;
      for (let i = 0; i < this.maxSlots; i++) {
        if (!this.revealedSlots[i]) {
          if (currentEggIdx < this.basket.length) {
            targetIdx = i;
            break;
          }
          currentEggIdx++;
        }
      }
    }

    if (targetIdx === -1) return false;

    this.hatchingSlotIndex = targetIdx;
    this.hatchTyped = '';
    this.emit('hatchModeEntered', { slotIndex: targetIdx });
    return true;
  }

  exitHatchMode() {
    const wasHatching = this.hatchingSlotIndex !== -1;
    const hadHatched = this.eggsHatchedInSession;
    this.hatchingSlotIndex = -1;
    this.hatchTyped = '';

    if (hadHatched) {
      this.eggsHatchedInSession = false;
    }

    if (wasHatching) {
      this.emit('hatchModeExited', { deckRefreshNeeded: hadHatched });
    }
    return hadHatched;
  }

  /**
   * Processes a keystroke during in-situ hatch mode.
   * Target is typically "egg" (3 keystrokes).
   */
  processHatchKey(key) {
    if (this.hatchingSlotIndex === -1) return null;
    const lowerKey = String(key || '').toLowerCase();
    const expectedChar = this.targetWord[this.hatchTyped.length];

    if (lowerKey === expectedChar) {
      this.hatchTyped += lowerKey;
      const progress = this.hatchTyped.length;

      if (this.hatchTyped === this.targetWord) {
        // Complete hatch
        const slotIdx = this.hatchingSlotIndex;
        return {
          status: 'complete',
          slotIndex: slotIdx,
          hatchTyped: this.hatchTyped,
          targetWord: this.targetWord
        };
      } else {
        // Progress stage ("e" or "eg")
        this.emit('crackProgress', {
          slotIndex: this.hatchingSlotIndex,
          hatchTyped: this.hatchTyped,
          stage: progress
        });
        return {
          status: 'progress',
          slotIndex: this.hatchingSlotIndex,
          hatchTyped: this.hatchTyped,
          stage: progress
        };
      }
    } else if (lowerKey === this.targetWord[0]) {
      // Recovery: typing first letter again restarts progress
      this.hatchTyped = this.targetWord[0];
      this.emit('crackProgress', {
        slotIndex: this.hatchingSlotIndex,
        hatchTyped: this.hatchTyped,
        stage: 1
      });
      return {
        status: 'progress',
        slotIndex: this.hatchingSlotIndex,
        hatchTyped: this.hatchTyped,
        stage: 1
      };
    } else {
      // Missed key: fracture wobble error
      this.emit('crackError', {
        slotIndex: this.hatchingSlotIndex,
        invalidKey: lowerKey,
        expectedChar
      });
      return {
        status: 'error',
        slotIndex: this.hatchingSlotIndex,
        invalidKey: lowerKey
      };
    }
  }

  /**
   * Processes a backspace during in-situ hatch mode.
   * Decrements hatchTyped progress and emits crackProgress.
   */
  processHatchBackspace() {
    if (this.hatchingSlotIndex === -1) return false;
    if (this.hatchTyped.length > 0) {
      this.hatchTyped = this.hatchTyped.slice(0, -1);
      this.emit('crackProgress', {
        slotIndex: this.hatchingSlotIndex,
        hatchTyped: this.hatchTyped,
        stage: this.hatchTyped.length
      });
      return true;
    }
    return false;
  }

  /**
   * Completes hatching for the active slot with hatched metadata.
   */
  recordHatch(hatchedWord, eggData) {
    const slotIdx = this.hatchingSlotIndex;
    if (slotIdx === -1) return;

    this.revealedSlots[slotIdx] = {
      word: hatchedWord,
      tierColor: eggData.tierColor || '#38bdf8',
      name: eggData.name || 'Egg'
    };
    this.eggsHatchedInSession = true;

    // Remove first egg from basket
    this.basket.shift();

    this.emit('eggHatched', {
      slotIndex: slotIdx,
      hatchedWord,
      egg: eggData,
      remainingEggs: this.basket.length
    });

    // Automatically check for next unhatched egg in nest
    let nextSlot = -1;
    let currentEggIdx = 0;
    for (let i = 0; i < this.maxSlots; i++) {
      if (!this.revealedSlots[i]) {
        if (currentEggIdx < this.basket.length) {
          nextSlot = i;
          break;
        }
        currentEggIdx++;
      }
    }

    if (nextSlot !== -1) {
      this.hatchingSlotIndex = nextSlot;
      this.hatchTyped = '';
      this.emit('hatchModeEntered', { slotIndex: nextSlot });
    } else {
      this.hatchingSlotIndex = -1;
      this.hatchTyped = '';
    }
  }

  /**
   * Clears revealed word badges once player completes a board word.
   */
  clearRevealedSlots() {
    if (Object.keys(this.revealedSlots).length > 0) {
      this.revealedSlots = {};
      this.emit('revealedCleared');
      return true;
    }
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.EggNestModel = EggNestModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EggNestModel };
}
