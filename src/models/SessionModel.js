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
    this.hiddenMode = options.hiddenMode || false;
    this.hiddenMethod = (options.hiddenMethod === 'char' || options.hiddenMethod === 'combo') ? 'char' : (options.hiddenMethod || 'word');
    this.hiddenWordDistance = (options.hiddenWordDistance !== undefined) ? options.hiddenWordDistance : 1;
    this.timeLeft = this.duration;
    this.isActive = false;
    this.isFinished = false;

    // Word stream state
    this.words = options.words || [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.hadBackspaceOnCurrentWord = false;
    this.hadErrorOnCurrentWord = false;
    this.wordStreak = 0;
    this.combo = 0;

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
    this.lastSecCorrect = 0;
    this.lastSecRaw = 0;
    this.secondDeltas = [];

    // Sustained Flow Run telemetry tracker
    this.flowRun = null;
    this.lastCompletedFlowRun = null;
  }

  reset(options = {}) {
    if (options.mode) this.mode = options.mode;
    if (options.duration) this.duration = options.duration;
    if (options.hiddenMode !== undefined) this.hiddenMode = options.hiddenMode;
    if (options.hiddenMethod !== undefined) this.hiddenMethod = options.hiddenMethod;
    if (options.hiddenWordDistance !== undefined) this.hiddenWordDistance = options.hiddenWordDistance;
    this.timeLeft = this.duration;
    this.isActive = false;
    this.isFinished = false;

    this.words = options.words || [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.hadBackspaceOnCurrentWord = false;
    this.hadErrorOnCurrentWord = false;
    this.currentWordCharCorrect = [];
    this.wordStreak = 0;
    this.combo = 0;

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

    this.lastSecCorrect = 0;
    this.lastSecRaw = 0;
    this.secondDeltas = [];
    this.flowRun = null;
    if (options.clearFlowRecap) {
      this.lastCompletedFlowRun = null;
    }

    this.emit('reset', { mode: this.mode, duration: this.duration });
  }

  setHiddenMode(enabled) {
    this.hiddenMode = Boolean(enabled);
  }

  setHiddenMethod(method) {
    this.hiddenMethod = (method === 'char' || method === 'combo') ? 'char' : 'word';
  }

  setHiddenWordDistance(dist) {
    const d = parseInt(dist, 10);
    this.hiddenWordDistance = (d >= 1 && d <= 6) ? d : 1;
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
    if (this.wpmHistory.length === 0 || this.errorLog.length === 0) {
      for (let i = 0; i < this.wpmHistory.length; i++) {
        this.wpmHistory[i].errors = 0;
        this.wpmHistory[i].fixed = 0;
      }
      return;
    }

    const counts = new Map();
    for (let i = 0; i < this.errorLog.length; i++) {
      const e = this.errorLog[i];
      let entry = counts.get(e.second);
      if (!entry) {
        entry = { errors: 0, fixed: 0 };
        counts.set(e.second, entry);
      }
      entry.errors++;
      if (e.fixed) entry.fixed++;
    }

    for (let i = 0; i < this.wpmHistory.length; i++) {
      const snap = this.wpmHistory[i];
      const sec = snap.second || (i + 1);
      const entry = counts.get(sec);
      snap.errors = entry ? entry.errors : 0;
      snap.fixed = entry ? entry.fixed : 0;
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
      this.combo = 0;
      this.hadErrorOnCurrentWord = true;
      if (this.hiddenMode) this.wordStreak = 0;
      this.extraCharsCount++;
      this.incorrectKeystrokes++;
      const key = `${this.currentWordIdx}:${prevCharIdx}:extra`;
      const errEntry = {
        id: this.errorLog.length + 1,
        second: sec,
        flowSecond: this.flowRun ? (this.flowRun.elapsedSeconds + 1) : null,
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
      if (this.hiddenMode && this.hadErrorOnCurrentWord) {
        this.combo = 0;
      } else {
        this.combo++;
      }
      this.correctKeystrokes++;
      this.rollingKeystrokeTimestamps.push(now);
      // Check if user is repairing a previously incorrect character at this position
      const key = `${this.currentWordIdx}:${prevCharIdx}:norm`;
      const unfixedList = this.unfixedErrorsByKey.get(key);
      if (unfixedList && unfixedList.length > 0) {
        unfixedList.forEach(e => {
          if (!e.fixed) {
            e.fixed = true;
            this.totalFixedErrors++;
            if (e.second && this.wpmHistory[e.second - 1]) {
              this.wpmHistory[e.second - 1].fixed++;
            }
          }
        });
        this.unfixedErrorsByKey.delete(key);
      }
    } else {
      this.combo = 0;
      this.hadErrorOnCurrentWord = true;
      if (this.hiddenMode) this.wordStreak = 0;
      this.incorrectKeystrokes++;
      const key = `${this.currentWordIdx}:${prevCharIdx}:norm`;
      const errEntry = {
        id: this.errorLog.length + 1,
        second: sec,
        flowSecond: this.flowRun ? (this.flowRun.elapsedSeconds + 1) : null,
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
    this.combo = Math.max(0, this.combo - 1);

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
              if (e.second && this.wpmHistory[e.second - 1]) {
                this.wpmHistory[e.second - 1].fixed++;
              }
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
              if (e.second && this.wpmHistory[e.second - 1]) {
                this.wpmHistory[e.second - 1].fixed++;
              }
              fixedError = true;
            }
          });
          this.unfixedErrorsByKey.delete(normKey);
        } else {
          for (let i = this.errorLog.length - 1; i >= 0; i--) {
            const e = this.errorLog[i];
            if (!e.fixed) {
              e.fixed = true;
              this.totalFixedErrors++;
              if (e.second && this.wpmHistory[e.second - 1]) {
                this.wpmHistory[e.second - 1].fixed++;
              }
              break;
            }
          }
          fixedError = true;
        }
      }

      if (!isExtra && this.currentWordCharCorrect[deletedIdx] === true) {
        this.correctKeystrokes = Math.max(0, this.correctKeystrokes - 1);
        this.rollingKeystrokeTimestamps.pop();
      }

      this.currentWordCharCorrect.length = deletedIdx;
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
    const windowSeconds = Math.min(3.0, Math.max(1.0, (now - this.rollingKeystrokeTimestamps[0]) / 1000));
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
    const savedWordStartTime = this.wordStartTime || (now - 600);
    const savedLastWordEndTime = this.lastWordEndTime;
    const prevWordStreak = this.wordStreak;
    const prevCombo = this.combo;

    let hasErrors = false;
    let missedLetters = 0;
    let extraLetters = 0;
    let extraLettersAddedOnSubmit = 0;

    if (typeof hasErrorsArg === 'boolean') {
      hasErrors = hasErrorsArg;
      missedLetters = typeof missedLettersArg === 'number' ? missedLettersArg : 0;
      extraLetters = typeof extraLettersArg === 'number' ? extraLettersArg : 0;
      if (extraLetters > 0) {
        extraLettersAddedOnSubmit = extraLetters;
        this.extraCharsCount += extraLetters;
      }
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
      // Note: extra characters are already counted in recordChar(), avoid double counting here
    }

    this.missedCharsCount += missedLetters;
    if (missedLetters > 0) {
      this.incorrectKeystrokes += missedLetters;
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

    // Spacebar keystroke accounting (Divisor of 5 chars/word assumes 4 letters + 1 space)
    this.rawKeystrokes++;
    if (!hasErrors) {
      this.correctKeystrokes++;
      if (this.hiddenMode && this.hadErrorOnCurrentWord) {
        this.wordStreak = 0;
        this.combo = 0;
      } else {
        this.wordStreak++;
        this.combo++;
      }
      if (this.currentCharIdx > 0) {
        this.rollingKeystrokeTimestamps.push(now);
      }
    } else {
      this.wordStreak = 0;
      this.combo = 0;
    }

    this.wordHistory[completedIdx] = {
      charIdx: this.currentCharIdx,
      charCorrect: [...this.currentWordCharCorrect],
      hadBackspace: this.hadBackspaceOnCurrentWord,
      hadErrorOnCurrentWord: this.hadErrorOnCurrentWord,
      missedLetters,
      extraLetters,
      extraLettersAddedOnSubmit,
      hasErrors,
      wordStreakBefore: prevWordStreak,
      comboBefore: prevCombo,
      wordStartTime: savedWordStartTime,
      lastWordEndTime: savedLastWordEndTime
    };

    this.currentWordCharCorrect = [];
    this.lastWordEndTime = now;
    this.hadBackspaceOnCurrentWord = false;
    this.hadErrorOnCurrentWord = false;
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
      this.errorLog = this.errorLog.filter(e => !(e.wordIdx === prevIdx && e.isMissed));
    }

    if (prevHistory.extraLettersAddedOnSubmit > 0) {
      this.extraCharsCount = Math.max(0, this.extraCharsCount - prevHistory.extraLettersAddedOnSubmit);
    }

    // Rollback spacebar keystroke from submitWord (Bug 1A / 1C)
    if (!prevHistory.hasErrors) {
      this.correctKeystrokes = Math.max(0, this.correctKeystrokes - 1);
      this.rollingKeystrokeTimestamps.pop();
    }

    this.currentWordIdx = prevIdx;
    this.currentCharIdx = prevHistory.charIdx;
    this.currentWordCharCorrect = [...prevHistory.charCorrect];
    this.hadBackspaceOnCurrentWord = true;
    this.hadErrorOnCurrentWord = Boolean(prevHistory.hadErrorOnCurrentWord || prevHistory.hasErrors);
    this.wordStartTime = prevHistory.wordStartTime || 0;
    this.lastWordEndTime = prevHistory.lastWordEndTime || 0;
    if (this.hiddenMode && this.hadErrorOnCurrentWord) {
      this.wordStreak = 0;
      this.combo = 0;
    } else {
      this.wordStreak = prevHistory.wordStreakBefore !== undefined ? prevHistory.wordStreakBefore : 0;
      this.combo = prevHistory.comboBefore !== undefined ? prevHistory.comboBefore : Math.max(0, this.combo - 1);
    }
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

  /**
   * Starts tracking a candidate sustained Flow Run (triggered at >= 85% momentum).
   */
  startFlowRun(initialMomentum = 85, now = Date.now(), preCreditedChars = 0) {
    if (this.flowRun) return this.flowRun;
    const baseCorrect = Math.max(0, this.correctKeystrokes - preCreditedChars);
    const baseRaw = Math.max(0, this.rawKeystrokes - preCreditedChars);
    this.flowRun = {
      startTime: now,
      elapsedSeconds: 0,
      startCorrectKeystrokes: baseCorrect,
      startRawKeystrokes: baseRaw,
      startIncorrectKeystrokes: this.incorrectKeystrokes,
      startExtraChars: this.extraCharsCount,
      startFixedErrors: this.totalFixedErrors,
      lastSecCorrect: baseCorrect,
      lastSecRaw: baseRaw,
      secondDeltas: [],
      cleanWords: 0,
      wordsCount: 0,
      maxMomentum: initialMomentum,
      peakWpm: 0,
      wpmHistory: [],
      errorStartIdx: this.errorLog.length
    };
    this.emit('flowRunStarted', this.flowRun);
    return this.flowRun;
  }

  /**
   * Records a completed word during Flow Mode and manages Flow Run entry/continuation.
   * Entry requires >= 85% momentum; continuation allows dipping down to 50% momentum floor.
   */
  recordFlowRunWord(isClean, liveWpm, momentum, unlockedWords = 1, now = Date.now()) {
    if (!this.flowRun && momentum >= 85) {
      const lastEntry = this.wordHistory[this.wordHistory.length - 1];
      const wordChars = lastEntry && Array.isArray(lastEntry.charCorrect)
        ? lastEntry.charCorrect.filter(Boolean).length + 1
        : 0;
      const wordStart = lastEntry && lastEntry.wordStartTime ? lastEntry.wordStartTime : now;
      this.startFlowRun(momentum, wordStart, wordChars);
    }

    if (!this.flowRun) return null;

    this.flowRun.wordsCount++;
    if (isClean) {
      this.flowRun.cleanWords++;
    }
    if (momentum > this.flowRun.maxMomentum) {
      this.flowRun.maxMomentum = momentum;
    }
    if (liveWpm > this.flowRun.peakWpm) {
      this.flowRun.peakWpm = liveWpm;
    }

    if (momentum < 50) {
      return this.endFlowRun(unlockedWords, now);
    }
    return null;
  }

  /**
   * Per-second telemetry snapshot while inside an active Flow Run.
   * Produces points identical in schema to Classic Mode's wpmHistory for ChartView reuse.
   */
  tickFlowRun(momentum = 85, now = Date.now()) {
    if (!this.flowRun) return null;
    this.flowRun.elapsedSeconds++;
    const elapsed = this.flowRun.elapsedSeconds;

    if (momentum > this.flowRun.maxMomentum) {
      this.flowRun.maxMomentum = momentum;
    }

    const runCorrect = Math.max(0, this.correctKeystrokes - this.flowRun.startCorrectKeystrokes);
    const runRaw = Math.max(0, this.rawKeystrokes - this.flowRun.startRawKeystrokes);
    const currentWpm = Math.round((runCorrect / 5) / (Math.max(1, elapsed) / 60));
    const currentRaw = Math.round((runRaw / 5) / (Math.max(1, elapsed) / 60));

    const deltaCorrect = Math.max(0, this.correctKeystrokes - this.flowRun.lastSecCorrect);
    const deltaRaw = Math.max(0, this.rawKeystrokes - this.flowRun.lastSecRaw);
    this.flowRun.lastSecCorrect = this.correctKeystrokes;
    this.flowRun.lastSecRaw = this.rawKeystrokes;
    this.flowRun.secondDeltas.push({ correct: deltaCorrect, raw: deltaRaw });

    const recentWindow = this.flowRun.secondDeltas.slice(-3);
    const burstCorrectSum = recentWindow.reduce((a, b) => a + b.correct, 0);
    const burstWindowSec = Math.max(1, recentWindow.length);
    const burstWpm = Math.round((burstCorrectSum / 5) / (burstWindowSec / 60));

    if (burstWpm > this.flowRun.peakWpm) this.flowRun.peakWpm = burstWpm;
    if (currentWpm > this.flowRun.peakWpm) this.flowRun.peakWpm = currentWpm;

    const runErrors = this.errorLog.slice(this.flowRun.errorStartIdx);
    const secErrors = runErrors.filter(e => e.flowSecond === elapsed);
    const errorsThisSec = secErrors.length;
    const fixedThisSec = secErrors.filter(e => e.fixed).length;

    const snap = {
      second: elapsed,
      time: elapsed,
      wpm: currentWpm,
      rawWpm: currentRaw,
      raw: currentRaw,
      burstWpm,
      momentum: Math.round(momentum),
      errors: errorsThisSec,
      fixed: fixedThisSec
    };

    this.flowRun.wpmHistory.push(snap);
    return snap;
  }

  /**
   * Finalizes the active Flow Run and returns the recap summary if it meets
   * qualification criteria (duration >= 5s AND cleanWords >= 3).
   */
  endFlowRun(unlockedWords = 1, now = Date.now()) {
    if (!this.flowRun) return null;
    const run = this.flowRun;
    this.flowRun = null;

    const wallSec = Math.max(0, Math.round((now - run.startTime) / 1000));
    const duration = Math.max(run.elapsedSeconds, wallSec);

    if (duration < 5 || run.cleanWords < 3) {
      return null;
    }

    const correctChars = Math.max(0, this.correctKeystrokes - run.startCorrectKeystrokes);
    const incorrectChars = Math.max(0, this.incorrectKeystrokes - run.startIncorrectKeystrokes);
    const extraChars = Math.max(0, this.extraCharsCount - run.startExtraChars);
    const fixedErrors = Math.max(0, this.totalFixedErrors - run.startFixedErrors);
    const rawChars = Math.max(0, this.rawKeystrokes - run.startRawKeystrokes);

    const totalAttempts = correctChars + incorrectChars;
    const finalWpm = Math.round((correctChars / 5) / (Math.max(1, duration) / 60));
    const finalRawWpm = Math.round((rawChars / 5) / (Math.max(1, duration) / 60));
    const finalAcc = totalAttempts > 0 ? Math.round((correctChars / totalAttempts) * 100) : 100;

    // Refresh fixed/unfixed error attribution across snapshots
    const runErrors = this.errorLog.slice(run.errorStartIdx);
    if (run.wpmHistory.length > 0 && runErrors.length > 0) {
      const counts = new Map();
      for (let i = 0; i < runErrors.length; i++) {
        const e = runErrors[i];
        const fSec = e.flowSecond || 1;
        let entry = counts.get(fSec);
        if (!entry) {
          entry = { errors: 0, fixed: 0 };
          counts.set(fSec, entry);
        }
        entry.errors++;
        if (e.fixed) entry.fixed++;
      }
      for (let i = 0; i < run.wpmHistory.length; i++) {
        const snap = run.wpmHistory[i];
        const sec = snap.second || (i + 1);
        const entry = counts.get(sec);
        snap.errors = entry ? entry.errors : 0;
        snap.fixed = entry ? entry.fixed : 0;
      }
    }

    // Synthesize timeline points if wall time elapsed without per-second ticks
    if (run.wpmHistory.length === 0) {
      for (let s = 1; s <= duration; s++) {
        run.wpmHistory.push({
          second: s,
          time: s,
          wpm: finalWpm,
          rawWpm: finalRawWpm,
          raw: finalRawWpm,
          burstWpm: run.peakWpm || finalWpm,
          momentum: Math.round(run.maxMomentum),
          errors: s === duration ? incorrectChars : 0,
          fixed: s === duration ? fixedErrors : 0
        });
      }
    }

    let consistency = 100;
    if (run.wpmHistory.length > 2) {
      const wpms = run.wpmHistory.map(h => h.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (mean || 1)) * 100)));
    }

    const peakWpm = Math.max(
      finalWpm,
      Math.round(run.peakWpm || 0),
      ...run.wpmHistory.map(h => h.burstWpm || h.wpm || 0)
    );

    const summary = {
      id: now,
      date: new Date(now).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: 'flow',
      duration,
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      peakWpm,
      accuracy: finalAcc,
      consistency,
      correctChars,
      incorrectChars,
      extraChars,
      missedChars: 0,
      fixedErrors,
      wordsCount: run.wordsCount,
      totalWords: run.wordsCount,
      cleanWords: run.cleanWords,
      unlockedWords: Math.max(1, Number(unlockedWords) || 1),
      maxMomentum: Math.round(run.maxMomentum),
      wpmHistory: run.wpmHistory
    };

    this.lastCompletedFlowRun = summary;
    this.emit('flowRunCompleted', summary);
    return summary;
  }

  /**
   * Calculates floating-point blindfold distance M based on combo streak.
   * - Fast Phase (combo <= 26): M = combo * 0.25
   * - Slow Phase (combo > 26): M = 6.5 + 0.75 * Math.sqrt(combo - 26)
   * @param {number} combo - Consecutive correct keystroke streak
   * @returns {number} Blindfold mask distance M
   */
  static getBlindfoldMask(combo) {
    const c = Math.max(0, combo || 0);
    if (c <= 26) {
      return c * 0.25;
    }
    return 6.5 + 0.75 * Math.sqrt(c - 26);
  }

  /**
   * Calculates character opacity based on lookahead offset k and combo streak.
   * If k < 0 (already typed): returns 0.0.
   * For active and upcoming characters (k >= 0):
   *   penetration = M - k
   *   rawOpacity = Math.max(0.0, Math.min(1.0, 1.0 - penetration))
   *   quantizedOpacity = Math.ceil(rawOpacity * 4) / 4 (0.0, 0.25, 0.50, 0.75, 1.0)
   * @param {number} k - Character offset relative to cursor (0 = active cursor character)
   * @param {number} combo - Consecutive correct keystroke streak
   * @returns {number} Quantized opacity
   */
  static getHiddenOpacity(k, combo) {
    if (k < 0) return 0.0;
    const M = SessionModel.getBlindfoldMask(combo);
    const penetration = M - k;
    const rawOpacity = Math.max(0.0, Math.min(1.0, 1.0 - penetration));
    const scaled = rawOpacity * 4;
    return (scaled <= 1e-9) ? 0.0 : Math.ceil(scaled - 1e-9) / 4;
  }

  getBlindfoldMask() {
    return SessionModel.getBlindfoldMask(this.combo);
  }

  getHiddenOpacity(k) {
    return SessionModel.getHiddenOpacity(k, this.combo);
  }

  /**
   * Calculates zero-capacity blind distance based on word streak.
   * Starts with zero character fade (at streak 0 / start of combo).
   * Scales: word 1 -> 1, word 2 -> 2, word 3 -> 3, word 4 -> 4, word 5 -> 5,
   * and word 6+ -> +0.5 character per word (5.5, 6.0, 6.5...).
   * @param {number} streak - Consecutive clean words typed
   * @returns {number} Distance in characters where text hits 0% opacity
   */
  static calculateHiddenZeroDist(streak) {
    if (!streak || streak <= 0) return 0;
    if (streak <= 5) return streak;
    return 5.0 + (streak - 5) * 0.5;
  }

  /**
   * Calculates total horizon depth (zeroDist + rampWidth).
   * @param {number} streak - Consecutive clean words typed
   * @param {number} rampWidth - Gradual ramp width in characters (default: 4.0)
   * @returns {number} Distance in characters where text reaches full visibility (1.0)
   */
  static calculateHiddenFadeDepth(streak, rampWidth = 4.0) {
    const zeroDist = SessionModel.calculateHiddenZeroDist(streak);
    return zeroDist + rampWidth;
  }

  getHiddenZeroDist() {
    return SessionModel.calculateHiddenZeroDist(this.wordStreak);
  }

  getHiddenFadeDepth(rampWidth = 4.0) {
    return SessionModel.calculateHiddenFadeDepth(this.wordStreak, rampWidth);
  }

  /**
   * Calculates effective total words hidden (active word + upcoming words) in Word Vanish mode.
   * Progressively scales with clean word streak S:
   * - At streak 0: 0 words hidden (everything visible)
   * - At streak 1: 1 word hidden (current word W)
   * - At streak 2: 2 words hidden (current word W + 1 word ahead)
   * - At streak N: up to targetCount words hidden
   * @param {number} streak - Consecutive clean word streak
   * @param {number} targetCount - User configured total words hidden (default 2, range 1..6)
   * @returns {number} Effective total words hidden
   */
  static calculateWordVanishEffectiveCount(streak, targetCount = 2) {
    const s = Math.max(0, streak || 0);
    const maxWords = Math.max(1, Math.min(6, targetCount || 2));
    if (s <= 0) return 0;
    return Math.min(maxWords, s);
  }

  getHiddenWordVanishEffectiveCount() {
    return SessionModel.calculateWordVanishEffectiveCount(this.wordStreak, this.hiddenWordDistance);
  }
}

if (typeof window !== 'undefined') {
  window.SessionModel = SessionModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SessionModel };
}
