/**
 * TypeFlow - GameController
 * Central Coordinator for TypeFlow.
 * Wires Models (Session, Flow, Words, EggNest), Views (Stage, Nest, HUD, Chart, Modal),
 * Services (Storage, Audio), and Inputs (KeyboardController).
 */

var _KeyboardController = (typeof KeyboardController !== 'undefined') ? KeyboardController : null;
if (!_KeyboardController && typeof require !== 'undefined') {
  try {
    _KeyboardController = require('./KeyboardController.js').KeyboardController;
  } catch (e) {}
}

var _BigramLedger = (typeof BigramLedger !== 'undefined') ? BigramLedger : null;
if (!_BigramLedger && typeof require !== 'undefined') {
  try {
    _BigramLedger = require('../models/BigramLedger.js').BigramLedger;
  } catch (e) {}
}

var _Constants = (typeof CONSTANTS !== 'undefined') ? CONSTANTS : null;
if (!_Constants && typeof require !== 'undefined') {
  try {
    _Constants = require('../core/Constants.js').CONSTANTS;
  } catch (e) {}
}

class GameController {
  constructor(deps = {}) {
    // Models
    this.wordsModel = deps.wordsModel || new WordsModel();
    this.sessionModel = deps.sessionModel || new SessionModel();
    this.flowModel = deps.flowModel || new FlowModel();
    this.eggNestModel = deps.eggNestModel || new EggNestModel();

    // Services
    this.storageService = deps.storageService || (typeof StorageManager !== 'undefined' ? StorageManager : new StorageService());
    this.audioService = deps.audioService || (typeof audioService !== 'undefined' ? audioService : new AudioService());

    // Bigram Ledger
    const BLClass = deps.bigramLedgerClass || _BigramLedger || (typeof BigramLedger !== 'undefined' ? BigramLedger : null);
    if (deps.bigramLedger) {
      this.bigramLedger = deps.bigramLedger;
    } else if (BLClass) {
      const savedLedger = this.storageService.getBigramLedger ? this.storageService.getBigramLedger() : {};
      this.bigramLedger = new BLClass(savedLedger);
    } else {
      this.bigramLedger = null;
    }

    this.lastKeystrokeTime = null;
    this.pendingHatchedWords = [];
    this.pendingRareEpicUnlocks = [];

    // Stream Buffer Configuration (keeps ~60 words total at any given time for tight flow adaptation)
    const cfg = deps.bufferConfig || (_Constants ? _Constants.STREAM_BUFFER : null);
    this.bufferConfig = {
      initialWordCount: (cfg && cfg.INITIAL_WORD_COUNT) || 60,
      refillThreshold: (cfg && cfg.REFILL_THRESHOLD) || 24,
      refillBatchSize: (cfg && cfg.REFILL_BATCH_SIZE) || 30
    };

    // Views
    this.stageView = deps.stageView || new StageView();
    this.nestView = deps.nestView || new NestView();
    this.hudView = deps.hudView || new HUDView();
    this.chartView = deps.chartView || new ChartView();
    this.modalView = deps.modalView || new ModalView();

    // Timers & Loops
    this.classicTimerInterval = null;
    this.idleDecayInterval = null;
    this.physicsAnimFrame = null;
    this.hatchExitTimeout = null;
    this.visualMomentum = 0;
    this.lastTestFinishedTime = 0;
    this.currentMode = 'flow';

    // Ghost Cursor Pacer state
    this.ghostEnabled = false;
    this.ghostSpeed = 50;
    this.ghostAnimId = null;
    this.ghostLastFrameTime = null;
    this.ghostTotalChars = 0;
    this.ghostPhaseTimer = null;
    this.ghostResetTimer = null;
    this.isGhostRunning = false;
    this.ghostNeedsSync = true;
    this._onWindowResize = null;

    const KBClass = deps.keyboardControllerClass || _KeyboardController;
    if (KBClass) {
      this.keyboardController = new KBClass({
        onChar: (c) => this.handleChar(c),
        onSpace: () => this.handleSpace(),
        onBackspace: () => this.handleBackspace(),
        onTab: () => this.handleTab(),
        onRestartChord: () => this.resetTest(),
        onEscape: () => this.handleEscape(),
        onHatchChar: (c) => this.handleHatchChar(c),
        onHatchBackspace: () => this.handleHatchBackspace(),
        onEnterFinished: () => this.resetTest(),
        isHatching: () => this.eggNestModel.isHatching(),
        isTestFinished: () => this.sessionModel.isFinished,
        isStatsOpen: () => this.isStatsModalOpen(),
        isDiffInputFocused: () => this.isDiffInputFocused()
      });
    } else {
      this.keyboardController = null;
    }
  }

  isStatsModalOpen() {
    return this.modalView.statsModal && this.modalView.statsModal.style.display !== 'none';
  }

  isDiffInputFocused() {
    return this.hudView.diffInput && (typeof document !== 'undefined' && document.activeElement === this.hudView.diffInput);
  }

  init() {
    // 1. Load active mode & saved state
    this.currentMode = this.storageService.getActiveMode ? this.storageService.getActiveMode() : 'flow';
    this.sessionModel.mode = this.currentMode;

    const gameState = this.storageService.getGameSave();
    this.sanitizeEggBasket(gameState);
    this.flowModel.setTargetWpm(gameState.targetWpm || 40);
    this.flowModel.highStreak = gameState.highStreak || 0;
    this.flowModel.eggCharge = gameState.eggCharge || 0.0;
    this.eggNestModel.syncBasket(gameState.eggBasket || []);

    // 2. Initialize HUD & Views
    this.hudView.setMode(this.currentMode, this.sessionModel.duration);
    this.hudView.syncTargetWpm(gameState.targetWpm || 40);
    this.updateLevelHud();
    this.nestView.render(this.eggNestModel);
    this.nestView.updateIncubation(
      this.flowModel.eggCharge,
      this.flowModel.getComboTier(),
      (gameState.eggBasket || []).length >= 3
    );
    this.hudView.updateSoundState(this.audioService.isEnabled());
    const isHidden = this.storageService.getHiddenMode ? this.storageService.getHiddenMode() : false;
    const hiddenMethod = this.storageService.getHiddenMethod ? this.storageService.getHiddenMethod() : 'char';
    const hiddenWordDistance = this.storageService.getHiddenWordDistance ? this.storageService.getHiddenWordDistance() : 2;
    this.sessionModel.setHiddenMode(isHidden);
    this.sessionModel.setHiddenMethod(hiddenMethod);
    this.sessionModel.setHiddenWordDistance(hiddenWordDistance);
    this.stageView.setHiddenMode(isHidden);
    this.stageView.setHiddenMethod(hiddenMethod);
    this.stageView.setHiddenWordDistance(hiddenWordDistance);
    if (this.hudView.updateHiddenModeState) {
      this.hudView.updateHiddenModeState(isHidden, hiddenMethod, hiddenWordDistance);
    }
    this.ghostEnabled = this.storageService.getGhostCursor ? this.storageService.getGhostCursor() : false;
    this.ghostSpeed = this.storageService.getGhostSpeed ? this.storageService.getGhostSpeed() : 50;
    if (this.hudView.updateGhostState) {
      this.hudView.updateGhostState(this.ghostEnabled, this.ghostSpeed);
    }

    // 3. Attach keyboard controller
    this.keyboardController.attach(
      typeof window !== 'undefined' ? window : null,
      this.stageView.typingInput,
      this.hudView.diffInput
    );

    // 4. Bind DOM UI listeners
    this.bindUIListeners();

    // 5. Start decay loop & visual ticker
    this.startIdleDecayLoop();
    this.startPhysicsTicker();

    // 6. Reset test to initial state
    this.resetTest();
  }

  bindUIListeners() {
    // 1. HUD View events (tabs, durations, target WPM, sound toggle, restart)
    this.hudView.bindEvents({
      onModeChange: (mode) => this.switchMode(mode),
      onDurationChange: (dur) => {
        this.sessionModel.duration = dur;
        this.resetTest();
      },
      onTargetWpmChange: (wpm) => this.updateTargetWpm(wpm),
      onSoundToggle: () => {
        const enabled = this.audioService.toggle();
        this.hudView.updateSoundState(enabled);
        if (enabled) {
          this.audioService.playKey(false, 0);
        }
      },
      onHiddenToggle: () => this.toggleHiddenMode(),
      onHiddenMethodChange: (method) => this.setHiddenMethod(method),
      onHiddenWordDistanceChange: (dist) => this.setHiddenWordDistance(dist),
      onGhostToggle: () => this.toggleGhostCursor(),
      onGhostSpeedChange: (speed) => this.updateGhostSpeed(speed),
      onRestart: () => this.resetTest()
    });

    // 2. Nest View events (slot clicks to enter/exit hatch mode)
    this.nestView.bindEvents({
      onSlotClick: (slotIdx) => {
        const status = this.eggNestModel.getSlotStatus(slotIdx);
        if (status.state === 'occupied') {
          if (this.eggNestModel.hatchingSlotIndex === slotIdx) {
            this.exitHatchMode();
          } else {
            this.enterHatchMode(slotIdx);
          }
        }
      }
    });

    // 3. Stage View events (words box & focus overlay clicks)
    this.stageView.bindEvents({
      onClick: () => {
        if (this.eggNestModel.isHatching()) {
          this.exitHatchMode();
        }
      }
    });

    // 4. Modal View events (stats modal, filters, reset RPG/classic)
    this.modalView.bindEvents({
      onNextTest: () => {
        if (Date.now() - this.lastTestFinishedTime < 350) return;
        this.resetTest();
      },
      onCloseStats: () => this.closeStats(),
      onOpenStats: (tab) => this.openStats(tab),
      onResetRpg: () => {
        if (window.confirm('Reset Flow RPG progress back to Level 1 and 1 word ("the")?')) {
          this.storageService.resetGameSave();
          this.eggNestModel.syncBasket([]);
          if (this.eggNestModel.clearRevealedSlots) {
            this.eggNestModel.clearRevealedSlots();
          }
          this.flowModel.reset(false, true);
          this.flowModel.setTargetWpm(40);
          this.hudView.syncTargetWpm(40);
          const BigramClass = typeof BigramLedger !== 'undefined' ? BigramLedger : (typeof require !== 'undefined' ? require('../models/BigramLedger.js').BigramLedger : null);
          if (BigramClass) {
            this.bigramLedger = new BigramClass({});
          }
          this.pendingHatchedWords = [];
          this.pendingRareEpicUnlocks = [];
          this.updateLevelHud();
          this.nestView.render(this.eggNestModel);
          this.resetTest();
          const freshSave = this.storageService.getGameSave();
          this.modalView.renderFlowStats(freshSave);
          this.hudView.spawnXpToast('RPG Reset to Ground Zero!', 1.0, null, true);
        }
      },
      onResetClassic: () => {
        if (window.confirm('Clear all Classic Mode Personal Bests and test history?')) {
          this.storageService.resetClassicStats();
          this.modalView.renderClassicStats(this.storageService.getClassicStats());
        }
      }
    });

    // 5. Chart View interactions
    this.chartView.bindEvents();

    // 6. Window resize handler
    if (typeof window !== 'undefined') {
      this._onWindowResize = () => {
        if (!this.sessionModel.isFinished) {
          this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);
          this.ensureWordBuffer(this.sessionModel.currentWordIdx);
        } else {
          this.chartView.render(this.sessionModel.wpmHistory, this.chartView.hoveredPointIndex);
        }
      };
      window.addEventListener('resize', this._onWindowResize);
    }
  }

  updateTargetWpm(wpm) {
    this.flowModel.setTargetWpm(wpm);
    this.storageService.setTargetWpm(wpm);
    this.hudView.syncTargetWpm(wpm);
    this.hudView.updateFlowGauge(
      0,
      wpm,
      this.flowModel.momentum,
      this.flowModel.getMultiplier(),
      this.flowModel.eggChance,
      (this.storageService.getGameSave().unlockedRanks || [1]).length
    );
  }

  switchMode(mode) {
    this.currentMode = (mode === 'classic') ? 'classic' : 'flow';
    this.storageService.setActiveMode(this.currentMode);
    this.sessionModel.mode = this.currentMode;
    this.hudView.setMode(this.currentMode, this.sessionModel.duration);
    this.resetTest();
  }

  getHiddenCombo() {
    return this.sessionModel ? this.sessionModel.combo : 0;
  }

  getHiddenZeroDist() {
    return this.sessionModel ? this.sessionModel.getHiddenZeroDist() : 0;
  }

  getHiddenFadeDepth() {
    return this.sessionModel ? this.sessionModel.getHiddenFadeDepth() : 4.0;
  }

  toggleHiddenMode() {
    const current = this.storageService.getHiddenMode ? this.storageService.getHiddenMode() : false;
    const next = !current;
    if (this.storageService.setHiddenMode) {
      this.storageService.setHiddenMode(next);
    }
    this.sessionModel.setHiddenMode(next);
    this.stageView.setHiddenMode(next);
    const method = this.storageService.getHiddenMethod ? this.storageService.getHiddenMethod() : 'char';
    const dist = this.storageService.getHiddenWordDistance ? this.storageService.getHiddenWordDistance() : 2;
    if (this.hudView.updateHiddenModeState) {
      this.hudView.updateHiddenModeState(next, method, dist);
    }
    const combo = this.getHiddenCombo();
    const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
    this.stageView.updateHiddenHorizon(
      this.sessionModel.currentWordIdx,
      this.sessionModel.currentCharIdx,
      combo,
      this.sessionModel.hasErrorInCurrentWord(),
      null,
      streak
    );
    return next;
  }

  setHiddenMethod(method) {
    if (this.storageService.setHiddenMethod) {
      this.storageService.setHiddenMethod(method);
    }
    this.sessionModel.setHiddenMethod(method);
    this.stageView.setHiddenMethod(method);
    const isHidden = this.storageService.getHiddenMode ? this.storageService.getHiddenMode() : false;
    const dist = this.storageService.getHiddenWordDistance ? this.storageService.getHiddenWordDistance() : 2;
    if (this.hudView.updateHiddenModeState) {
      this.hudView.updateHiddenModeState(isHidden, method, dist);
    }
    const combo = this.getHiddenCombo();
    const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
    this.stageView.updateHiddenHorizon(
      this.sessionModel.currentWordIdx,
      this.sessionModel.currentCharIdx,
      combo,
      this.sessionModel.hasErrorInCurrentWord(),
      null,
      streak
    );
  }

  setHiddenWordDistance(dist) {
    if (this.storageService.setHiddenWordDistance) {
      this.storageService.setHiddenWordDistance(dist);
    }
    this.sessionModel.setHiddenWordDistance(dist);
    this.stageView.setHiddenWordDistance(dist);
    const isHidden = this.storageService.getHiddenMode ? this.storageService.getHiddenMode() : false;
    const method = this.storageService.getHiddenMethod ? this.storageService.getHiddenMethod() : 'char';
    if (this.hudView.updateHiddenModeState) {
      this.hudView.updateHiddenModeState(isHidden, method, dist);
    }
    const combo = this.getHiddenCombo();
    const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
    this.stageView.updateHiddenHorizon(
      this.sessionModel.currentWordIdx,
      this.sessionModel.currentCharIdx,
      combo,
      this.sessionModel.hasErrorInCurrentWord(),
      null,
      streak
    );
  }

  toggleGhostCursor() {
    this.ghostEnabled = !this.ghostEnabled;
    if (this.storageService.setGhostCursor) {
      this.storageService.setGhostCursor(this.ghostEnabled);
    }
    if (this.hudView.updateGhostState) {
      this.hudView.updateGhostState(this.ghostEnabled, this.ghostSpeed);
    }
    if (!this.ghostEnabled) {
      this.stopGhostPacer(true);
      if (this.stageView.setGhostVisible) {
        this.stageView.setGhostVisible(false);
      }
    } else {
      this.ghostNeedsSync = true;
      this.syncGhostToPlayer();
    }
    return this.ghostEnabled;
  }

  updateGhostSpeed(speed) {
    const num = Math.max(15, Math.min(150, parseInt(speed, 10) || 50));
    this.ghostSpeed = num;
    if (this.storageService.setGhostSpeed) {
      this.storageService.setGhostSpeed(num);
    }
    if (this.hudView.updateGhostState) {
      this.hudView.updateGhostState(this.ghostEnabled, this.ghostSpeed);
    }
    return num;
  }

  getCharCumulativeIndex(wordIdx, charIdx) {
    const words = this.sessionModel.words || [];
    let total = 0;
    for (let i = 0; i < wordIdx && i < words.length; i++) {
      total += words[i].length + 1;
    }
    return total + charIdx;
  }

  mapCharsToPosition(totalChars) {
    const words = this.sessionModel.words || [];
    let remaining = Math.max(0, totalChars);
    for (let i = 0; i < words.length; i++) {
      const wLen = words[i].length;
      const totalSlot = wLen + 1;
      if (remaining < totalSlot) {
        const charIdx = Math.floor(remaining);
        const fraction = remaining - charIdx;
        return { wordIdx: i, charIdx: Math.min(charIdx, wLen), fraction, isOutOfBounds: false };
      }
      remaining -= totalSlot;
    }
    return { wordIdx: Math.max(0, words.length - 1), charIdx: 999, fraction: 0, isOutOfBounds: true };
  }

  triggerGhostActivity() {
    if (!this.ghostEnabled || this.sessionModel.isFinished) return;
    if (this.eggNestModel && this.eggNestModel.isHatching && this.eggNestModel.isHatching()) return;

    if (this.ghostPhaseTimer) {
      clearTimeout(this.ghostPhaseTimer);
      this.ghostPhaseTimer = null;
    }
    if (this.ghostResetTimer) {
      clearTimeout(this.ghostResetTimer);
      this.ghostResetTimer = null;
    }

    if (this.stageView.setGhostFading) {
      this.stageView.setGhostFading(false);
    }
    if (this.stageView.setGhostVisible) {
      this.stageView.setGhostVisible(true);
    }

    if (!this.isGhostRunning) {
      if (this.ghostNeedsSync) {
        this.syncGhostToPlayer();
        this.ghostNeedsSync = false;
      }
      this.startGhostPacer();
    }

    // 0.6s inactivity: start phasing out smoothly
    this.ghostPhaseTimer = setTimeout(() => {
      this.stopGhostPacer(false);
      if (this.stageView.setGhostFading) {
        this.stageView.setGhostFading(true);
      }
    }, 600);

    // 1.2s inactivity: full reset back to actual cursor, hide
    this.ghostResetTimer = setTimeout(() => {
      this.syncGhostToPlayer();
      this.ghostNeedsSync = true;
      if (this.stageView.setGhostVisible) {
        this.stageView.setGhostVisible(false);
      }
    }, 1200);
  }

  startGhostPacer() {
    if (this.isGhostRunning) return;
    this.isGhostRunning = true;
    this.ghostLastFrameTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const tick = (now) => {
      if (!this.isGhostRunning || !this.ghostEnabled) return;
      const currentTime = now || ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      const dt = Math.min(100, currentTime - this.ghostLastFrameTime);
      this.ghostLastFrameTime = currentTime;

      const v = (this.ghostSpeed * 5) / 60000;
      this.ghostTotalChars += v * dt;

      const pos = this.mapCharsToPosition(this.ghostTotalChars);
      let res = null;
      if (this.stageView.updateGhostCaret) {
        res = this.stageView.updateGhostCaret(pos.wordIdx, pos.charIdx, pos.fraction);
      }

      if ((res && res.isOutOfBounds) || pos.isOutOfBounds) {
        this.syncGhostToPlayer();
        this.ghostNeedsSync = true;
        if (this.stageView.setGhostVisible) {
          this.stageView.setGhostVisible(false);
        }
        this.stopGhostPacer(false);
        return;
      }

      if (typeof requestAnimationFrame !== 'undefined') {
        this.ghostAnimId = requestAnimationFrame(tick);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      this.ghostAnimId = requestAnimationFrame(tick);
    }
  }

  stopGhostPacer(cancelTimers = false) {
    this.isGhostRunning = false;
    if (this.ghostAnimId) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.ghostAnimId);
      }
      this.ghostAnimId = null;
    }
    if (cancelTimers) {
      if (this.ghostPhaseTimer) {
        clearTimeout(this.ghostPhaseTimer);
        this.ghostPhaseTimer = null;
      }
      if (this.ghostResetTimer) {
        clearTimeout(this.ghostResetTimer);
        this.ghostResetTimer = null;
      }
      this.ghostNeedsSync = true;
    }
  }

  syncGhostToPlayer() {
    this.ghostTotalChars = this.getCharCumulativeIndex(
      this.sessionModel.currentWordIdx,
      this.sessionModel.currentCharIdx
    );
    if (this.stageView.syncGhostToCaret) {
      this.stageView.syncGhostToCaret(
        this.sessionModel.currentWordIdx,
        this.sessionModel.currentCharIdx
      );
    }
  }

  resetTest() {
    if (this.classicTimerInterval) {
      clearInterval(this.classicTimerInterval);
      this.classicTimerInterval = null;
    }

    this.stopGhostPacer(true);
    if (this.stageView.setGhostVisible) {
      this.stageView.setGhostVisible(false);
    }
    this.syncGhostToPlayer();

    this.modalView.hideClassicResults();
    this.stageView.setPacePaused(false);
    this.flowModel.reset();
    this.visualMomentum = 0;
    this.wordsModel.resetHistory();
    this.lastKeystrokeTime = null;

    const gameState = this.storageService.getGameSave();
    this.eggNestModel.syncBasket(gameState.eggBasket || []);
    const count = this.bufferConfig.initialWordCount;
    const words = (this.currentMode === 'flow')
      ? this.wordsModel.generateBatch(count, gameState.unlockedRanks, gameState.wordStats, this.flowModel.targetWpm, 0, this.bigramLedger)
      : this.wordsModel.generateClassicBatch(count);

    // Sandwiched Induction Rule: If new words were hatched, launch with [Anchor1, NewWord, Anchor2]
    if (this.currentMode === 'flow' && this.pendingHatchedWords && this.pendingHatchedWords.length > 0) {
      const nextWordObj = this.pendingHatchedWords.shift();
      const sandwich = this.wordsModel.createSandwich(
        nextWordObj.word,
        gameState.unlockedRanks,
        gameState.wordStats,
        this.bigramLedger
      );
      words.splice(0, 3, ...sandwich);
    }

    const isHidden = this.storageService.getHiddenMode ? this.storageService.getHiddenMode() : false;
    this.sessionModel.setHiddenMode(isHidden);
    this.sessionModel.reset({ mode: this.currentMode, duration: this.sessionModel.duration, words, hiddenMode: isHidden });
    this.stageView.renderWords(words);
    this.stageView.updateCaret(0, 0);
    const combo = this.getHiddenCombo();
    this.stageView.updateHiddenHorizon(0, 0, combo, false, null, 0);

    if (this.currentMode === 'classic') {
      this.hudView.updateTimer(this.sessionModel.duration);
      if (this.hudView.liveStats) this.hudView.liveStats.classList.remove('visible');
    }

    this.hudView.updateFlowGauge(
      0,
      this.flowModel.targetWpm,
      0,
      1.0,
      0.0,
      (gameState.unlockedRanks || [1]).length
    );
    this.hudView.renderAtmosphere(0, this.currentMode === 'flow');
    this.updateLevelHud();
    this.nestView.render(this.eggNestModel);
    this.nestView.updateIncubation(
      this.flowModel.eggCharge,
      this.flowModel.getComboTier(),
      (gameState.eggBasket || []).length >= 3
    );
    this.stageView.focusInput();
  }

  startClassicTimer() {
    if (this.classicTimerInterval) return;
    this.hudView.updateTimer(this.sessionModel.duration);
    this.hudView.updateLiveClassicStats(0, 100);

    this.classicTimerInterval = setInterval(() => {
      const timeLeft = this.sessionModel.tickTimer();
      this.hudView.updateTimer(timeLeft);

      const stats = this.sessionModel.calculateFinalStats();
      this.hudView.updateLiveClassicStats(stats.wpm, stats.accuracy);

      if (this.sessionModel.isFinished) {
        clearInterval(this.classicTimerInterval);
        this.classicTimerInterval = null;
        this.endClassicTest();
      }
    }, 1000);
  }

  endClassicTest() {
    this.lastTestFinishedTime = Date.now();
    const stats = this.sessionModel.calculateFinalStats();

    this.stopGhostPacer(true);
    if (this.stageView.setGhostVisible) {
      this.stageView.setGhostVisible(false);
    }

    this.storageService.recordClassicTest(
      this.sessionModel.duration,
      stats.wpm,
      stats.rawWpm,
      stats.accuracy,
      stats.consistency,
      stats.correctChars + stats.incorrectChars,
      this.sessionModel.currentWordIdx
    );

    if (this.bigramLedger) {
      this.storageService.saveBigramLedger(this.bigramLedger.toJSON());
    }

    this.modalView.showClassicResults(stats);
    this.chartView.render(this.sessionModel.wpmHistory);
  }

  // Handle standard typing character
  handleChar(char) {
    if (this.sessionModel.isFinished) return;
    this.audioService.init();

    if (!this.sessionModel.isActive && this.currentMode === 'classic') {
      this.startClassicTimer();
    }

    const currentWord = this.sessionModel.getCurrentWordText();
    const charIdx = this.sessionModel.currentCharIdx;
    const isExtra = charIdx >= currentWord.length;
    const isCorrect = !isExtra && currentWord[charIdx] === char;

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    // N-Gram Bigram Mastery Ledger transition recording
    if (this.bigramLedger && charIdx > 0 && charIdx < currentWord.length) {
      const prevChar = currentWord[charIdx - 1];
      const targetChar = currentWord[charIdx];
      const targetWpm = (this.flowModel && this.flowModel.targetWpm) || 40;
      const targetInterval = 12000 / targetWpm;
      let transitionMs = targetInterval;
      if (this.lastKeystrokeTime !== null) {
        const delta = now - this.lastKeystrokeTime;
        if (delta > 0 && delta <= 5000) {
          transitionMs = delta;
        }
      }
      this.bigramLedger.recordTransition(prevChar, targetChar, transitionMs, isCorrect, targetWpm);
    }
    this.lastKeystrokeTime = now;

    this.sessionModel.recordChar(char, isCorrect, isExtra);
    this.flowModel.recordKeystroke();

    const isHidden = (this.sessionModel && this.sessionModel.hiddenMode) || (this.storageService && this.storageService.getHiddenMode && this.storageService.getHiddenMode());
    if (isHidden && (!isCorrect || isExtra)) {
      if (this.currentMode === 'flow' && this.flowModel) {
        this.flowModel.flowStreak = 0;
        this.flowModel.consecutiveCleanWords = 0;
        if (this.hudView && this.hudView.updateFlowGauge) {
          const unlockedCount = (this.storageService && this.storageService.getGameSave)
            ? (this.storageService.getGameSave().unlockedRanks || [1]).length
            : 1;
          this.hudView.updateFlowGauge(
            this.sessionModel.getInstantaneousWpm(),
            this.flowModel.targetWpm,
            this.flowModel.momentum,
            this.flowModel.getMultiplier(),
            0.0,
            unlockedCount
          );
        }
      }
    }

    this.stageView.updateLetter(this.sessionModel.currentWordIdx, charIdx, isCorrect, isExtra, char);
    this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);

    const combo = this.getHiddenCombo();
    const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
    const hasErr = isExtra || !isCorrect || this.sessionModel.hasErrorInCurrentWord();
    this.stageView.updateHiddenHorizon(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx, combo, hasErr, null, streak);

    this.triggerGhostActivity();
    this.audioService.playKey(false, this.currentMode === 'flow' ? this.flowModel.flowStreak : 0);
  }

  handleBackspace() {
    if (this.sessionModel.isFinished) return;
    this.lastKeystrokeTime = null;

    if (this.sessionModel.currentCharIdx === 0) {
      if (this.sessionModel.currentWordIdx > 0) {
        const prevWordIdx = this.sessionModel.currentWordIdx - 1;
        const reverted = this.sessionModel.revertToPreviousWord();
        if (reverted) {
          this.stageView.revertWord(prevWordIdx + 1, prevWordIdx);
          this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);
          this.triggerGhostActivity();
          this.flowModel.recordKeystroke();
          const combo = this.getHiddenCombo();
          const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
          this.stageView.updateHiddenHorizon(
            this.sessionModel.currentWordIdx,
            this.sessionModel.currentCharIdx,
            combo,
            this.sessionModel.hasErrorInCurrentWord(),
            null,
            streak
          );
        }
      }
      return;
    }

    const backspaceRes = this.sessionModel.recordBackspace();
    if (backspaceRes) {
      this.stageView.backspaceLetter(this.sessionModel.currentWordIdx, backspaceRes.targetIdx);
    }
    this.flowModel.recordKeystroke();
    this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);
    this.triggerGhostActivity();
    const combo = this.getHiddenCombo();
    const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
    this.stageView.updateHiddenHorizon(
      this.sessionModel.currentWordIdx,
      this.sessionModel.currentCharIdx,
      combo,
      this.sessionModel.hasErrorInCurrentWord(),
      null,
      streak
    );
  }

  handleSpace() {
    if (this.sessionModel.isFinished) return;
    if (this.sessionModel.currentCharIdx === 0) return; // Prevent empty skipping

    this.lastKeystrokeTime = null;
    this.flowModel.recordKeystroke();
    this.audioService.init();
    this.audioService.playKey(true, this.currentMode === 'flow' ? this.flowModel.flowStreak : 0);

    if (!this.sessionModel.isActive && this.currentMode === 'classic') {
      this.startClassicTimer();
    }

    const wordEl = this.stageView.wordElements[this.sessionModel.currentWordIdx];
    const currentWordText = this.sessionModel.getCurrentWordText();
    const isHadBackspace = this.sessionModel.hadBackspaceOnCurrentWord;

    const res = this.sessionModel.submitWord();
    const liveWpm = res.liveWpm;
    const hasUncorrectedErrors = res.hasErrors;

    if (this.currentMode === 'flow') {
      // Fluid pending clear on first completed word
      if (this.eggNestModel.clearRevealedSlots()) {
        this.nestView.render(this.eggNestModel);
      }

      const gameState = this.storageService.getGameSave();
      const basketCount = (gameState.eggBasket || []).length;
      const wordMeta = this.wordsModel.getWordByText(currentWordText) || this.wordsModel.getWord(1);
      let baseXp = wordMeta.reward || 10;
      if (this.storageService.getHiddenMode && this.storageService.getHiddenMode()) {
        baseXp = Math.round(baseXp * 1.15);
      }
      const evalRes = this.flowModel.evaluateWord(hasUncorrectedErrors, liveWpm, isHadBackspace, basketCount, baseXp);
      const earnedXp = evalRes.earnedXp;

      // Persist high streak if improved
      this.storageService.updateHighStreak(evalRes.highStreak);

      // Add XP & Check Level-Up
      const xpRes = this.storageService.addXp(earnedXp);
      this.updateLevelHud();

      const isRainbow = this.flowModel.momentum >= 100;
      this.hudView.spawnXpToast(earnedXp, evalRes.multiplier, wordEl, false, isRainbow);

      if (xpRes.leveledUp) {
        this.audioService.playLevelUp();
        const curSave = this.storageService.getGameSave();
        const curBasket = curSave.eggBasket || [];
        if (curBasket.length < 3) {
          const bonusEgg = this.wordsModel.rollEgg(
            curSave.unlockedRanks,
            evalRes.flowStreak,
            xpRes.bonusEggRarity,
            curSave.wordStats,
            this.flowModel.targetWpm,
            curBasket,
            this.bigramLedger
          );
          this.storageService.addEgg(bonusEgg);
          this.eggNestModel.syncBasket(this.storageService.getGameSave().eggBasket);
          this.nestView.render(this.eggNestModel);
          this.hudView.spawnXpToast(`LVL UP! 🎁 ${bonusEgg.name}`, 1.0, wordEl, true);
        }
      }

      // Deterministic Egg Incubation Spawn
      if (evalRes.eggRollSuccess) {
        const freshSave = this.storageService.getGameSave();
        const freshBasket = freshSave.eggBasket || [];
        if (freshBasket.length < 3) {
          const droppedEgg = this.wordsModel.rollEgg(
            freshSave.unlockedRanks,
            evalRes.flowStreak,
            null,
            freshSave.wordStats,
            this.flowModel.targetWpm,
            freshBasket,
            this.bigramLedger
          );
          this.storageService.addEgg(droppedEgg);
          this.eggNestModel.syncBasket(this.storageService.getGameSave().eggBasket);
          this.nestView.render(this.eggNestModel);
          this.nestView.triggerMaterialize();
          this.audioService.playEggDrop();
          this.hudView.spawnXpToast(`🥚 ${droppedEgg.name}!`, 1.0, wordEl, true);
        }
      }

      // Persist eggCharge and update under-track & ambient aura
      this.storageService.updateEggCharge(evalRes.eggCharge);
      const updatedBasket = (this.storageService.getGameSave().eggBasket || []).length;
      this.nestView.updateIncubation(
        evalRes.eggCharge,
        evalRes.comboTier,
        updatedBasket >= 3
      );

      // Update SRS telemetry
      this.storageService.updateWordStat(wordMeta.rank, hasUncorrectedErrors, isHadBackspace, liveWpm, this.flowModel.targetWpm);
      if (hasUncorrectedErrors) {
        this.wordsModel.recordPatternError(wordMeta.tags);
      } else {
        this.wordsModel.recordPatternHit(wordMeta.tags);
      }

      // Persist Bigram Ledger
      if (this.bigramLedger) {
        this.storageService.saveBigramLedger(this.bigramLedger.toJSON());
      }

      this.hudView.updateFlowGauge(
        liveWpm,
        this.flowModel.targetWpm,
        this.flowModel.momentum,
        evalRes.multiplier,
        evalRes.eggChance,
        (this.storageService.getGameSave().unlockedRanks || [1]).length
      );
      this.stageView.setPacePaused(hasUncorrectedErrors || liveWpm < this.flowModel.targetWpm);

      // Release held Rare/Epic unlocks if flow momentum has dipped below 90%
      if (this.flowModel.momentum < 90 && this.pendingRareEpicUnlocks && this.pendingRareEpicUnlocks.length > 0) {
        const released = this.pendingRareEpicUnlocks.shift();
        this.pendingHatchedWords.push(released);
      }

      // If pending hatched words are ready to induce mid-stream
      if (this.pendingHatchedWords && this.pendingHatchedWords.length > 0) {
        const nextHatched = this.pendingHatchedWords.shift();
        const curSave = this.storageService.getGameSave();
        const sandwich = this.wordsModel.createSandwich(
          nextHatched.word,
          curSave.unlockedRanks,
          curSave.wordStats,
          this.bigramLedger
        );
        const insertPos = this.sessionModel.currentWordIdx + 3;
        const insertBoundaryChars = this.getCharCumulativeIndex(insertPos, 0);
        this.sessionModel.insertWordsAt(insertPos, sandwich);
        this.stageView.insertWordsAt(insertPos, sandwich);
        if (this.ghostEnabled && this.ghostTotalChars >= insertBoundaryChars) {
          const addedChars = sandwich.reduce((sum, w) => sum + w.length + 1, 0);
          this.ghostTotalChars += addedChars;
        }
      }
    }

    const prevIdx = this.sessionModel.currentWordIdx - 1;
    const nextIdx = this.sessionModel.currentWordIdx;
    this.stageView.advanceWord(prevIdx, nextIdx, hasUncorrectedErrors);
    this.stageView.updateCaret(nextIdx, 0);
    const combo = this.getHiddenCombo();
    const streak = this.sessionModel ? this.sessionModel.wordStreak : 0;
    this.stageView.updateHiddenHorizon(nextIdx, 0, combo, false, null, streak);
    this.triggerGhostActivity();

    // Dynamic infinite stream appending: keep runway full well ahead of line 3
    this.ensureWordBuffer(nextIdx);
  }

  /**
   * Proactively replenishes words in the stage to guarantee the 3rd line and beyond
   * are always fully populated without visual gaps or pop-in.
   */
  ensureWordBuffer(nextIdx = (this.sessionModel ? this.sessionModel.currentWordIdx : 0)) {
    if (!this.stageView || !this.stageView.wordElements) return;
    const remainingWords = this.stageView.wordElements.length - nextIdx;
    if (remainingWords <= this.bufferConfig.refillThreshold) {
      const gameState = this.storageService.getGameSave();
      const refillCount = this.bufferConfig.refillBatchSize;
      const more = (this.currentMode === 'flow')
        ? this.wordsModel.generateBatch(refillCount, gameState.unlockedRanks, gameState.wordStats, this.flowModel.targetWpm, this.flowModel.momentum, this.bigramLedger)
        : this.wordsModel.generateClassicBatch(refillCount);
      this.sessionModel.appendWords(more);
      this.stageView.appendWords(more);
    }
  }

  // Hatch Mode in-situ actions
  enterHatchMode(preferredSlot = -1) {
    this.audioService.init();
    const entered = this.eggNestModel.enterHatchMode(preferredSlot);
    if (entered) {
      this.nestView.render(this.eggNestModel);
      this.stopGhostPacer(false);
      if (this.stageView.setGhostFading) {
        this.stageView.setGhostFading(true);
      }
    }
    return entered;
  }

  exitHatchMode() {
    if (this.hatchExitTimeout) {
      clearTimeout(this.hatchExitTimeout);
      this.hatchExitTimeout = null;
    }
    const hadHatched = this.eggNestModel.exitHatchMode();
    this.nestView.render(this.eggNestModel);
    this.resetTest();
    if (hadHatched) {
      this.hudView.spawnXpToast('✨ Deck updated with new words!', 1.0, null, true);
    }
    this.stageView.focusInput();
  }

  handleHatchChar(char) {
    const res = this.eggNestModel.processHatchKey(char);
    if (!res) return;

    if (res.status === 'progress') {
      this.audioService.playFracture();
      this.nestView.triggerWobble(res.slotIndex, res.stage);
      this.nestView.updateCrackPrompt(res.slotIndex, res.hatchTyped);
    } else if (res.status === 'complete') {
      this.audioService.playHatch();
      const slotStatus = this.eggNestModel.getSlotStatus(res.slotIndex);
      const eggToHatch = (slotStatus && slotStatus.egg) || this.eggNestModel.basket[0];
      const hatchRes = this.storageService.hatchEgg(eggToHatch ? eggToHatch.id : 0);
      if (hatchRes.success) {
        const hatchedRank = hatchRes.egg.wordRank;
        const meta = this.wordsModel.getWord(hatchedRank);
        const hatchedWord = hatchRes.egg.word || (meta ? meta.word : 'word');
        const hatchedRarity = (hatchRes.egg.rarity || (meta && meta.tierName) || '').toLowerCase();
        this.eggNestModel.recordHatch(hatchedWord, hatchRes.egg);
        this.nestView.render(this.eggNestModel);
        this.updateLevelHud();
        this.hudView.spawnXpToast(`✨ Hatched: ${hatchedWord}!`, 1.0, null, true);

        // Queue newly hatched word for Sandwiched Induction
        this.queueHatchedWord(hatchedWord, hatchedRarity);

        // If all eggs in nest have now been hatched, exit hatch mode after brief reveal delay
        if (!this.eggNestModel.isHatching()) {
          if (this.hatchExitTimeout) clearTimeout(this.hatchExitTimeout);
          this.hatchExitTimeout = setTimeout(() => {
            this.hatchExitTimeout = null;
            this.exitHatchMode();
          }, 550);
        }
      } else {
        this.exitHatchMode();
      }
    } else if (res.status === 'error') {
      this.nestView.triggerErrorShake(res.slotIndex);
    }
  }

  queueHatchedWord(word, rarity = 'common') {
    const isRareEpic = (rarity === 'rare' || rarity === 'epic');
    const isPeakFlow = this.flowModel && this.flowModel.momentum >= 90;

    if (isPeakFlow && isRareEpic) {
      // Hold in queue during peak egg-charging cycle (>=90%) to protect rhythm
      this.pendingRareEpicUnlocks.push({ word, rarity });
    } else {
      this.pendingHatchedWords.push({ word, rarity });
    }
  }

  handleHatchBackspace() {
    if (this.eggNestModel.processHatchBackspace()) {
      this.nestView.updateCrackPrompt(this.eggNestModel.hatchingSlotIndex, this.eggNestModel.hatchTyped);
    }
  }

  handleTab() {
    if (this.eggNestModel.isHatching()) {
      this.exitHatchMode();
      return;
    }
    if (this.currentMode === 'flow' && this.eggNestModel.basket.length > 0) {
      this.enterHatchMode();
      return;
    }
    this.resetTest();
  }

  handleEscape() {
    if (this.eggNestModel.isHatching()) {
      this.exitHatchMode();
      return;
    }
    if (this.isStatsModalOpen()) {
      this.closeStats();
      return;
    }
    this.resetTest();
  }

  openStats(tab = 'flow') {
    this.resetTest();
    this.stageView.blurInput();
    const gameState = this.storageService.getGameSave();
    const bucketStats = this.storageService.getBucketStats(gameState);

    this.modalView.openStatsModal(tab);
    this.modalView.renderFlowStats(gameState, bucketStats, (r) => this.wordsModel.getWord(r), this.storageService);
    this.modalView.renderClassicStats(this.storageService.getClassicStats());
  }

  closeStats() {
    this.modalView.closeStatsModal();
    this.stageView.focusInput();
  }

  updateLevelHud() {
    const gameState = this.storageService.getGameSave();
    const reqXp = this.storageService.getXpForLevel(gameState.level || 1);
    const title = this.storageService.getLevelTitle(gameState.level || 1);
    this.hudView.updateLevelCard(gameState.level || 1, gameState.currentXp || 0, reqXp, title);
  }

  startIdleDecayLoop() {
    if (this.idleDecayInterval) clearInterval(this.idleDecayInterval);
    this.idleDecayInterval = setInterval(() => {
      if (this.currentMode !== 'flow' || !this.sessionModel.isActive || this.flowModel.momentum <= 0) return;
      if (this.eggNestModel.isHatching() || this.isStatsModalOpen()) return;

      const decay = this.flowModel.applyIdleDecay(Date.now(), 0.20);
      if (decay > 0) {
        this.storageService.updateEggCharge(this.flowModel.eggCharge);
        const basketCount = (this.storageService.getGameSave().eggBasket || []).length;
        this.nestView.updateIncubation(
          this.flowModel.eggCharge,
          this.flowModel.getComboTier(),
          basketCount >= 3
        );
        this.hudView.updateFlowGauge(
          this.sessionModel.getInstantaneousWpm(),
          this.flowModel.targetWpm,
          this.flowModel.momentum,
          this.flowModel.getMultiplier(),
          0.0,
          (this.storageService.getGameSave().unlockedRanks || [1]).length
        );
      }
    }, 200);
  }

  startPhysicsTicker() {
    const tick = () => {
      if (this.currentMode === 'flow') {
        const diff = this.flowModel.momentum - this.visualMomentum;
        if (Math.abs(diff) > 0.001) {
          this.visualMomentum = Math.abs(diff) < 0.05 ? this.flowModel.momentum : this.visualMomentum + diff * 0.12;
          this.hudView.renderAtmosphere(this.visualMomentum, true);
          this.stageView.setCaretRainbow(this.visualMomentum >= 100);
        }
      }
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        this.physicsAnimFrame = window.requestAnimationFrame(tick);
      }
    };
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      this.physicsAnimFrame = window.requestAnimationFrame(tick);
    }
  }

  sanitizeEggBasket(gameState) {
    if (!gameState || !Array.isArray(gameState.eggBasket) || gameState.eggBasket.length === 0) {
      return;
    }
    const unlockedSet = new Set(gameState.unlockedRanks || [1]);
    const basketRanks = new Set();
    let modified = false;

    for (let i = 0; i < gameState.eggBasket.length; i++) {
      const egg = gameState.eggBasket[i];
      const rank = egg ? egg.wordRank : null;
      if (!egg || typeof rank !== 'number' || unlockedSet.has(rank) || basketRanks.has(rank)) {
        // Re-roll duplicate or already-unlocked egg into an unowned word
        const pending = [...basketRanks];
        const newEgg = this.wordsModel.rollEgg(
          gameState.unlockedRanks,
          0,
          (egg && egg.rarity) || null,
          gameState.wordStats || {},
          gameState.targetWpm || 40,
          pending,
          this.bigramLedger
        );
        gameState.eggBasket[i] = newEgg;
        basketRanks.add(newEgg.wordRank);
        modified = true;
      } else {
        basketRanks.add(rank);
      }
    }

    if (modified) {
      this.storageService.saveGameSave(gameState);
    }
  }

  destroy() {
    if (this._onWindowResize && typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onWindowResize);
      this._onWindowResize = null;
    }
    this.stopGhostPacer(true);
    if (this.classicTimerInterval) {
      clearInterval(this.classicTimerInterval);
      this.classicTimerInterval = null;
    }
    if (this.idleDecayInterval) {
      clearInterval(this.idleDecayInterval);
      this.idleDecayInterval = null;
    }
    if (this.hatchExitTimeout) {
      clearTimeout(this.hatchExitTimeout);
      this.hatchExitTimeout = null;
    }
    if (this.physicsAnimFrame && typeof window !== 'undefined' && window.cancelAnimationFrame) {
      window.cancelAnimationFrame(this.physicsAnimFrame);
      this.physicsAnimFrame = null;
    }
    if (this.keyboardController) {
      this.keyboardController.detach(typeof window !== 'undefined' ? window : null);
    }
  }
}

if (typeof window !== 'undefined') {
  window.GameController = GameController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameController };
}
