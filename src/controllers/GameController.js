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
          this.flowModel.reset();
          this.updateLevelHud();
          this.nestView.render(this.eggNestModel);
          this.resetTest();
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
      window.addEventListener('resize', () => {
        if (!this.sessionModel.isFinished) {
          this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);
        } else {
          this.chartView.render(this.sessionModel.wpmHistory, this.chartView.hoveredPointIndex);
        }
      });
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

  resetTest() {
    if (this.classicTimerInterval) {
      clearInterval(this.classicTimerInterval);
      this.classicTimerInterval = null;
    }

    this.modalView.hideClassicResults();
    this.stageView.setPacePaused(false);
    this.flowModel.reset();
    this.visualMomentum = 0;
    this.wordsModel.resetHistory();

    const gameState = this.storageService.getGameSave();
    this.eggNestModel.syncBasket(gameState.eggBasket || []);
    const count = 70;
    const words = (this.currentMode === 'flow')
      ? this.wordsModel.generateBatch(count, gameState.unlockedRanks, gameState.wordStats, this.flowModel.targetWpm, 0)
      : this.wordsModel.generateClassicBatch(count);

    this.sessionModel.reset({ mode: this.currentMode, duration: this.sessionModel.duration, words });
    this.stageView.renderWords(words);
    this.stageView.updateCaret(0, 0);

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

    this.storageService.recordClassicTest(
      this.sessionModel.duration,
      stats.wpm,
      stats.rawWpm,
      stats.accuracy,
      stats.consistency,
      stats.correctChars + stats.incorrectChars,
      this.sessionModel.currentWordIdx
    );

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

    this.sessionModel.recordChar(char, isCorrect, isExtra);
    this.flowModel.recordKeystroke();
    this.stageView.updateLetter(this.sessionModel.currentWordIdx, charIdx, isCorrect, isExtra, char);
    this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);

    this.audioService.playKey(false, this.currentMode === 'flow' ? this.flowModel.flowStreak : 0);
  }

  handleBackspace() {
    if (this.sessionModel.isFinished) return;

    if (this.sessionModel.currentCharIdx === 0) {
      if (this.sessionModel.currentWordIdx > 0) {
        const prevWordIdx = this.sessionModel.currentWordIdx - 1;
        const reverted = this.sessionModel.revertToPreviousWord();
        if (reverted) {
          this.stageView.revertWord(prevWordIdx + 1, prevWordIdx);
          this.stageView.updateCaret(this.sessionModel.currentWordIdx, this.sessionModel.currentCharIdx);
          this.flowModel.recordKeystroke();
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
  }

  handleSpace() {
    if (this.sessionModel.isFinished) return;
    if (this.sessionModel.currentCharIdx === 0) return; // Prevent empty skipping

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
      const baseXp = wordMeta.reward || 10;
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
        if (basketCount < 3) {
          const bonusEgg = this.wordsModel.rollEgg(
            xpRes.save.unlockedRanks,
            evalRes.flowStreak,
            xpRes.bonusEggRarity,
            xpRes.save.wordStats,
            this.flowModel.targetWpm
          );
          this.storageService.addEgg(bonusEgg);
          this.eggNestModel.syncBasket(this.storageService.getGameSave().eggBasket);
          this.nestView.render(this.eggNestModel);
          this.hudView.spawnXpToast(`LVL UP! 🎁 ${bonusEgg.name}`, 1.0, wordEl, true);
        }
      }

      // Deterministic Egg Incubation Spawn
      if (evalRes.eggRollSuccess && basketCount < 3) {
        const droppedEgg = this.wordsModel.rollEgg(
          gameState.unlockedRanks,
          evalRes.flowStreak,
          null,
          gameState.wordStats,
          this.flowModel.targetWpm
        );
        this.storageService.addEgg(droppedEgg);
        this.eggNestModel.syncBasket(this.storageService.getGameSave().eggBasket);
        this.nestView.render(this.eggNestModel);
        this.nestView.triggerMaterialize();
        this.audioService.playEggDrop();
        this.hudView.spawnXpToast(`🥚 ${droppedEgg.name}!`, 1.0, wordEl, true);
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

      this.hudView.updateFlowGauge(
        liveWpm,
        this.flowModel.targetWpm,
        this.flowModel.momentum,
        evalRes.multiplier,
        evalRes.eggChance,
        (this.storageService.getGameSave().unlockedRanks || [1]).length
      );
      this.stageView.setPacePaused(hasUncorrectedErrors || liveWpm < this.flowModel.targetWpm);
    }

    const prevIdx = this.sessionModel.currentWordIdx - 1;
    const nextIdx = this.sessionModel.currentWordIdx;
    this.stageView.advanceWord(prevIdx, nextIdx, hasUncorrectedErrors);
    this.stageView.updateCaret(nextIdx, 0);

    // Dynamic infinite stream appending
    if (nextIdx >= this.stageView.wordElements.length - 10) {
      const gameState = this.storageService.getGameSave();
      const more = (this.currentMode === 'flow')
        ? this.wordsModel.generateBatch(30, gameState.unlockedRanks, gameState.wordStats, this.flowModel.targetWpm, this.flowModel.momentum)
        : this.wordsModel.generateClassicBatch(30);
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
      const hatchRes = this.storageService.hatchEgg(0);
      if (hatchRes.success) {
        const hatchedRank = hatchRes.egg.wordRank;
        const meta = this.wordsModel.getWord(hatchedRank);
        const hatchedWord = hatchRes.egg.word || (meta ? meta.word : 'word');
        this.eggNestModel.recordHatch(hatchedWord, hatchRes.egg);
        this.nestView.render(this.eggNestModel);
        this.updateLevelHud();
        this.hudView.spawnXpToast(`✨ Hatched: ${hatchedWord}!`, 1.0, null, true);

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

  destroy() {
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
