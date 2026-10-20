/**
 * TypeFlow - SessionModel
 * Pure mathematical state machine for Typing Sessions (Classic & Flow).
 * Handles word pointers, keystroke counters, rolling cadence, WPM, accuracy, consistency, and timers.
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

class SessionModel extends _EventEmitter {
  constructor(options = {}) {
    super();
    this.mode = options.mode || 'flow'; // 'classic' | 'flow'
    this.duration = options.duration || 30; // seconds for classic
    this.timeLeft = this.duration;
    this.isActive = false;
    this.isFinished = false;

    // Word stream state
    this.words = options.words || [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.hadBackspaceOnCurrentWord = false;
    this.wordStreak = 0;

    // Timestamps
    this.startTime = null;
    this.endTime = null;
    this.wordStartTime = null;
    this.lastWordEndTime = null;
    this.rollingKeystrokeTimestamps = [];
    this.wpmHistory = []; // Snapshots for charts/consistency

    // Keystroke counters
    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.rawKeystrokes = 0;
    this.extraCharsCount = 0;
    this.missedCharsCount = 0;
    this.totalFixedErrors = 0;
    this.currentWordCharCorrect = [];

    // Error event ledger
    this.errorLog = [];
    this.unfixedErrorsByKey = new Map();
    this.wordHistory = [];

    // Per-second delta telemetry (for timeline graph)
    this.currentSecondErrors = 0;
    this.currentSecondFixed = 0;
    this.lastSecCorrect = 0;
    this.lastSecRaw = 0;
    this.secondDeltas = [];
  }

  reset(options = {}) {
    if (options.mode) this.mode = options.mode;
    if (options.duration) this.duration = options.duration;
    this.timeLeft = this.duration;
    this.isActive = false;
    this.isFinished = false;

    this.words = options.words || [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.hadBackspaceOnCurrentWord = false;
    this.currentWordCharCorrect = [];
    this.wordStreak = 0;

    this.startTime = null;
    this.endTime = null;
    this.wordStartTime = null;
    this.lastWordEndTime = null;
    this.rollingKeystrokeTimestamps = [];
    this.wpmHistory = [];

    this.correctKeystrokes = 0;
    this.incorrectKeystrokes = 0;
    this.rawKeystrokes = 0;
    this.extraCharsCount = 0;
    this.missedCharsCount = 0;
    this.totalFixedErrors = 0;

    this.errorLog = [];
    this.unfixedErrorsByKey = new Map();
    this.wordHistory = [];

    this.currentSecondErrors = 0;
    this.currentSecondFixed = 0;
    this.lastSecCorrect = 0;
    this.lastSecRaw = 0;
    this.secondDeltas = [];
    this.wordStreak = 0;

    this.emit('reset', { mode: this.mode, duration: this.duration });
  }

  setWords(words) {
    this.words = words || [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
  }

  appendWords(moreWords) {
    if (Array.isArray(moreWords)) {
      this.words.push(...moreWords);
    }
  }

  insertWordsAt(insertIdx, wordsToInsert) {
    if (!Array.isArray(wordsToInsert) || wordsToInsert.length === 0) return;
    const idx = Math.max(this.currentWordIdx + 1, Math.min(this.words.length, insertIdx));
    this.words.splice(idx, 0, ...wordsToInsert);
  }

  start(now = Date.now()) {
    if (this.isActive) return;
    this.isActive = true;
    this.isFinished = false;
    this.startTime = now;
    this.wordStartTime = now;
    this.lastWordEndTime = now;
    this.emit('start', { mode: this.mode, startTime: now });
  }

  getCurrentWordText() {
    return this.words[this.currentWordIdx] || '';
  }

  hasErrorInCurrentWord() {
    const wordText = this.getCurrentWordText();
    if (this.currentCharIdx > wordText.length) return true;
    const limit = Math.min(this.currentCharIdx, wordText.length);
    for (let i = 0; i < limit; i++) {
      if (this.currentWordCharCorrect[i] === false) return true;
    }
    return false;
  }

  getCurrentSecond(now = Date.now()) {
    if (this.mode === 'classic') {
      const elapsed = this.duration - this.timeLeft;
      return Math.max(1, elapsed + 1);
    }
    const elapsed = this.startTime ? (now - this.startTime) / 1000 : 0;
    return Math.max(1, Math.floor(elapsed) + 1);
  }

  refreshWpmHistoryErrors() {
    for (let i = 0; i < this.wpmHistory.length; i++) {
      const snap = this.wpmHistory[i];
      const sec = snap.second || (i + 1);
      const secErrors = this.errorLog.filter(e => e.second === sec);
      snap.errors = secErrors.length;
      snap.fixed = secErrors.filter(e => e.fixed).length;
    }
  }

  /**
   * Registers a single typed character.
   */
  recordChar(char, isCorrectArg = null, arg3 = false, arg4 = undefined) {
    let isExtra = false;
    let isCorrect = false;
    let now = Date.now();

    if (typeof arg3 === 'boolean') {
      isExtra = arg3;
      if (typeof arg4 === 'number') now = arg4;
    } else if (typeof arg3 === 'number') {
      now = arg3;
    }

    if (!this.isActive) {
      this.start(now);
    }

    if (!this.wordStartTime) {
      this.wordStartTime = now;
    }

    this.rawKeystrokes++;
    this.rollingKeystrokeTimestamps.push(now);
    const sec = this.getCurrentSecond(now);
    const prevCharIdx = this.currentCharIdx;
    const currentWord = this.getCurrentWordText();

    if (typeof isCorrectArg === 'boolean') {
      isCorrect = isCorrectArg;
    } else {
      isExtra = currentWord.length > 0 ? (prevCharIdx >= currentWord.length) : false;
      isCorrect = !isExtra && currentWord.length > 0 && (currentWord[prevCharIdx] === char);
    }

    if (isExtra) {
      this.extraCharsCount++;
      this.incorrectKeystrokes++;
      this.currentSecondErrors++;
      const key = `${this.currentWordIdx}:${prevCharIdx}:extra`;
      const errEntry = {
        id: this.errorLog.length + 1,
        second: sec,
        wordIdx: this.currentWordIdx,
        charIdx: prevCharIdx,
        isExtra: true,
        fixed: false
      };
      this.errorLog.push(errEntry);
      const list = this.unfixedErrorsByKey.get(key) || [];
      list.push(errEntry);
      this.unfixedErrorsByKey.set(key, list);
    } else if (isCorrect) {
      this.correctKeystrokes++;
      // Check if user is repairing a previously incorrect character at this position
      const key = `${this.currentWordIdx}:${prevCharIdx}:norm`;
      const unfixedList = this.unfixedErrorsByKey.get(key);
      if (unfixedList && unfixedList.length > 0) {
        unfixedList.forEach(e => {
          if (!e.fixed) {
            e.fixed = true;
            this.totalFixedErrors++;
          }
        });
        this.unfixedErrorsByKey.delete(key);
      }
    } else {
      this.incorrectKeystrokes++;
      this.currentSecondErrors++;
      const key = `${this.currentWordIdx}:${prevCharIdx}:norm`;
      const errEntry = {
        id: this.errorLog.length + 1,
        second: sec,
        wordIdx: this.currentWordIdx,
        charIdx: prevCharIdx,
        isExtra: false,
        fixed: false
      };
      this.errorLog.push(errEntry);
      const list = this.unfixedErrorsByKey.get(key) || [];
      list.push(errEntry);
      this.unfixedErrorsByKey.set(key, list);
    }

    const prevIdx = prevCharIdx;
    this.currentWordCharCorrect[prevIdx] = isCorrect;
    this.currentCharIdx++;

    this.emit('charTyped', {
      char,
      isCorrect,
      isExtra,
      wordIdx: this.currentWordIdx,
      charIdx: prevIdx,
      now
    });
  }

  /**
   * Registers a backspace stroke.
   * Autonomously determines whether an extra letter was deleted or an error fixed.
   * Returns { targetIdx, fixedError, isExtra } or null if at beginning of word.
   */
  recordBackspace(arg1, arg2, arg3) {
    if (!this.isActive) return null;
    this.rawKeystrokes++;
    this.hadBackspaceOnCurrentWord = true;

    let isExplicitFixed = false;
    let isExtraDeleted = false;
    let now = Date.now();

    if (typeof arg1 === 'boolean') {
      isExplicitFixed = arg1;
      if (typeof arg2 === 'boolean') {
        isExtraDeleted = arg2;
        if (typeof arg3 === 'number') now = arg3;
      } else if (typeof arg2 === 'number') {
        now = arg2;
      }
    } else if (typeof arg1 === 'number') {
      now = arg1;
    }

    if (this.currentCharIdx > 0) {
      const deletedIdx = this.currentCharIdx - 1;
      const currentWord = this.getCurrentWordText();
      const isExtra = isExtraDeleted || (currentWord.length > 0 && deletedIdx >= currentWord.length);
      let fixedError = false;

      // Extra character removal is an immediate fix of the extra char
      const extraKey = `${this.currentWordIdx}:${deletedIdx}:extra`;
      const normKey = `${this.currentWordIdx}:${deletedIdx}:norm`;

      if (isExtra || this.unfixedErrorsByKey.has(extraKey)) {
        const extraList = this.unfixedErrorsByKey.get(extraKey);
        if (extraList && extraList.length > 0) {
          extraList.forEach(e => {
            if (!e.fixed) {
              e.fixed = true;
              this.totalFixedErrors++;
              fixedError = true;
            }
          });
          this.unfixedErrorsByKey.delete(extraKey);
        } else if (isExtra) {
          fixedError = true;
        }
      }

      if (isExplicitFixed) {
        // Explicit fixed call from unit tests (e.g. Profile E)
        const normList = this.unfixedErrorsByKey.get(normKey);
        if (normList && normList.length > 0) {
          normList.forEach(e => {
            if (!e.fixed) {
              e.fixed = true;
              this.totalFixedErrors++;
              fixedError = true;
            }
          });
          this.unfixedErrorsByKey.delete(normKey);
        } else {
          fixedError = true;
        }
      }

      delete this.currentWordCharCorrect[deletedIdx];
      this.currentCharIdx--;

      this.emit('backspace', {
        wordIdx: this.currentWordIdx,
        charIdx: this.currentCharIdx,
        targetIdx: deletedIdx,
        fixedError,
        isExtra,
        now
      });

      return {
        targetIdx: deletedIdx,
        fixedError,
        isExtra
      };
    }
    return null;
  }

  /**
   * Rolling Instantaneous WPM (Window: 3000ms)
   */
  getInstantaneousWpm(now = Date.now()) {
    this.rollingKeystrokeTimestamps = this.rollingKeystrokeTimestamps.filter(t => now - t <= 3000);
    const count = this.rollingKeystrokeTimestamps.length;
    if (count === 0) return 0;
    const windowSeconds = Math.max(1, (now - this.rollingKeystrokeTimestamps[0]) / 1000);
    const wpm = Math.round((count / 5) * (60 / windowSeconds));
    return isNaN(wpm) ? 0 : wpm;
  }

  /**
   * Single word cadence WPM (Elapsed time since last completed word)
   */
  getWordCadenceWpm(wordLength, now = Date.now()) {
    const baseTime = this.lastWordEndTime || this.wordStartTime || (now - 600);
    const elapsedWordSec = Math.max(0.20, (now - baseTime) / 1000);
    const wpm = Math.round(((wordLength + 1) / 5) * (60 / elapsedWordSec));
    return isNaN(wpm) ? 0 : wpm;
  }

  /**
   * Blended Live WPM: 50% Word Cadence + 50% Rolling Keystreams
   */
  getLiveWpm(wordLength, now = Date.now()) {
    const cadence = this.getWordCadenceWpm(wordLength, now);
    const instant = this.getInstantaneousWpm(now);
    return Math.round(0.5 * cadence + 0.5 * instant);
  }

  /**
   * Advances word on space submission.
   * Autonomously calculates hasErrors and missedLetters from internal character state if omitted.
   * @param {boolean|null} hasErrorsArg - Optional explicit error flag (or null for auto)
   * @param {number|null} missedLettersArg - Optional explicit count of omitted letters
   * @param {number|null} extraLettersArg - Optional explicit count of extra typed characters
   * @param {number} now - Timestamp
   */
  submitWord(hasErrorsArg = null, missedLettersArg = null, extraLettersArg = null, now = Date.now()) {
    const wordText = this.getCurrentWordText();
    const liveWpm = this.getLiveWpm(wordText.length, now);
    const hadBackspace = this.hadBackspaceOnCurrentWord;
    const completedIdx = this.currentWordIdx;

    let hasErrors = false;
    let missedLetters = 0;
    let extraLetters = 0;

    if (typeof hasErrorsArg === 'boolean') {
      hasErrors = hasErrorsArg;
      missedLetters = typeof missedLettersArg === 'number' ? missedLettersArg : 0;
      extraLetters = typeof extraLettersArg === 'number' ? extraLettersArg : 0;
    } else {
      // Autonomous calculation directly from pure model state
      missedLetters = Math.max(0, wordText.length - this.currentCharIdx);
      extraLetters = Math.max(0, this.currentCharIdx - wordText.length);
      hasErrors = (missedLetters > 0 || extraLetters > 0);

      const checkLimit = Math.min(this.currentCharIdx, wordText.length);
      for (let i = 0; i < checkLimit; i++) {
        if (this.currentWordCharCorrect[i] === false) {
          hasErrors = true;
          break;
        }
      }
    }

    this.extraCharsCount += extraLetters;
    this.missedCharsCount += missedLetters;
    if (missedLetters > 0) {
      this.incorrectKeystrokes += missedLetters;
      this.currentSecondErrors += missedLetters;
      const sec = this.getCurrentSecond(now);
      for (let i = 0; i < missedLetters; i++) {
        this.errorLog.push({
          id: this.errorLog.length + 1,
          second: sec,
          wordIdx: this.currentWordIdx,
          charIdx: this.currentCharIdx + i,
          isExtra: false,
          isMissed: true,
          fixed: false
        });
      }
    }

    this.wordHistory[completedIdx] = {
      charIdx: this.currentCharIdx,
      charCorrect: [...this.currentWordCharCorrect],
      hadBackspace: this.hadBackspaceOnCurrentWord,
      missedLetters,
      extraLetters
    };

    if (!hasErrors) {
      this.wordStreak++;
    } else {
      this.wordStreak = 0;
    }

    this.currentWordCharCorrect = [];
    this.lastWordEndTime = now;
    this.hadBackspaceOnCurrentWord = false;
    this.currentWordIdx++;
    this.currentCharIdx = 0;
    this.wordStartTime = 0;

    this.emit('wordSubmitted', {
      word: wordText,
      wordIdx: completedIdx,
      hasErrors,
      hadBackspace,
      liveWpm,
      missedLetters,
      extraLetters,
      wordStreak: this.wordStreak,
      now
    });

    return {
      word: wordText,
      wordIdx: completedIdx,
      hasErrors,
      hadBackspace,
      liveWpm,
      missedLetters,
      extraLetters,
      wordStreak: this.wordStreak
    };
  }

  /**
   * Reverts back to the previous word if typist backspaces past start of word.
   */
  revertToPreviousWord() {
    if (this.currentWordIdx <= 0) return false;
    const prevIdx = this.currentWordIdx - 1;
    const prevHistory = this.wordHistory[prevIdx];
    if (!prevHistory) return false;

    // Rollback any missed letter penalties recorded on word submission
    if (prevHistory.missedLetters > 0) {
      this.missedCharsCount = Math.max(0, this.missedCharsCount - prevHistory.missedLetters);
      this.incorrectKeystrokes = Math.max(0, this.incorrectKeystrokes - prevHistory.missedLetters);
      this.currentSecondErrors = Math.max(0, this.currentSecondErrors - prevHistory.missedLetters);
      this.errorLog = this.errorLog.filter(e => !(e.wordIdx === prevIdx && e.isMissed));
    }

    if (prevHistory.extraLetters > 0) {
      this.extraCharsCount = Math.max(0, this.extraCharsCount - prevHistory.extraLetters);
    }

    this.currentWordIdx = prevIdx;
    this.currentCharIdx = prevHistory.charIdx;
    this.currentWordCharCorrect = [...prevHistory.charCorrect];
    this.hadBackspaceOnCurrentWord = true;
    this.rawKeystrokes++;

    this.emit('wordReverted', {
      wordIdx: this.currentWordIdx,
      charIdx: this.currentCharIdx
    });

    return true;
  }

  /**
   * Classic Mode timer tick (called once per second).
   */
  tickTimer(now = Date.now()) {
    if (!this.isActive || this.isFinished) return this.timeLeft;
    this.timeLeft--;

    // Snapshot performance for graphs
    const elapsedSeconds = this.duration - this.timeLeft;
    const currentWpm = Math.round((this.correctKeystrokes / 5) / (Math.max(1, elapsedSeconds) / 60));
    const currentRaw = Math.round((this.rawKeystrokes / 5) / (Math.max(1, elapsedSeconds) / 60));

    const deltaCorrect = this.correctKeystrokes - this.lastSecCorrect;
    const deltaRaw = this.rawKeystrokes - this.lastSecRaw;
    this.lastSecCorrect = this.correctKeystrokes;
    this.lastSecRaw = this.rawKeystrokes;
    this.secondDeltas.push({ correct: deltaCorrect, raw: deltaRaw });

    const recentWindow = this.secondDeltas.slice(-3);
    const burstCorrectSum = recentWindow.reduce((a, b) => a + b.correct, 0);
    const burstWindowSec = recentWindow.length;
    const burstWpm = Math.round((burstCorrectSum / 5) / (burstWindowSec / 60));

    const secErrors = this.errorLog.filter(e => e.second === elapsedSeconds);
    const errorsThisSec = secErrors.length;
    const fixedThisSec = secErrors.filter(e => e.fixed).length;

    this.wpmHistory.push({
      second: elapsedSeconds,
      time: elapsedSeconds,
      wpm: currentWpm,
      rawWpm: currentRaw,
      raw: currentRaw,
      burstWpm,
      errors: errorsThisSec,
      fixed: fixedThisSec
    });

    this.refreshWpmHistoryErrors();

    this.currentSecondErrors = 0;
    this.currentSecondFixed = 0;

    this.emit('tick', { timeLeft: this.timeLeft, wpm: currentWpm, burstWpm, rawWpm: currentRaw });

    if (this.timeLeft <= 0) {
      this.finish(now);
    }
    return this.timeLeft;
  }

  finish(now = Date.now()) {
    if (this.isFinished) return;
    this.isActive = false;
    this.isFinished = true;
    this.endTime = now;

    const stats = this.calculateFinalStats();
    this.emit('finished', stats);
    return stats;
  }

  calculateFinalStats() {
    this.refreshWpmHistoryErrors();

    const elapsedSec = this.mode === 'classic'
      ? this.duration
      : Math.max(1, ((this.endTime || Date.now()) - (this.startTime || Date.now())) / 1000);

    const totalAttempts = this.correctKeystrokes + this.incorrectKeystrokes;
    const finalWpm = Math.round((this.correctKeystrokes / 5) / (elapsedSec / 60));
    const finalRawWpm = Math.round((this.rawKeystrokes / 5) / (elapsedSec / 60));
    const finalAcc = totalAttempts > 0 ? Math.round((this.correctKeystrokes / totalAttempts) * 100) : 100;

    let consistency = 100;
    if (this.wpmHistory.length > 2) {
      const wpms = this.wpmHistory.map(h => h.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (mean || 1)) * 100)));
    }

    return {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAcc,
      consistency,
      correctChars: this.correctKeystrokes,
      incorrectChars: this.incorrectKeystrokes,
      extraChars: this.extraCharsCount,
      missedChars: this.missedCharsCount,
      fixedErrors: this.totalFixedErrors,
      duration: this.duration,
      wpmHistory: this.wpmHistory
    };
  }
}

if (typeof window !== 'undefined') {
  window.SessionModel = SessionModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SessionModel };
}
