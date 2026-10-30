/**
 * TypeFlow - Controllers Test Suite
 * Tests KeyboardController and GameController integration.
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

const { WordsModel } = require('../src/models/WordsModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { StorageService } = require('../src/services/StorageService.js');
const { AudioService } = require('../src/services/AudioService.js');
const { StageView } = require('../src/views/StageView.js');
const { NestView } = require('../src/views/NestView.js');
const { HUDView } = require('../src/views/HUDView.js');
const { ChartView } = require('../src/views/ChartView.js');
const { ModalView } = require('../src/views/ModalView.js');
const { KeyboardController } = require('../src/controllers/KeyboardController.js');
const { GameController } = require('../src/controllers/GameController.js');

class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] !== undefined ? this.store[key] : null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

let totalTests = 0;
let passedTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
  }
}

console.log('\n========================================');
console.log('⚡ TYPEFLOW CONTROLLERS TEST SUITE');
console.log('========================================\n');

function createTestHarness() {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="flow-vignette-overlay"></div>
      <div id="tab-classic"></div>
      <div id="tab-flow" class="active"></div>
      <div id="timer" style="display: none;">30</div>
      <div id="flow-gauge" style="display: flex;"></div>
      <div id="flow-speed-tag"></div>
      <div id="speed-indicator-text"></div>
      <div id="flow-multiplier-badge"><span id="flow-mult-val"></span></div>
      <div id="momentum-bar-fill"></div>
      <div id="classic-duration-pill" style="display: none;"></div>
      <div id="flow-target-pill" style="display: flex;"></div>
      <div id="diff-slider"></div>
      <div id="diff-input"></div>
      <div id="level-hud-card">
        <span id="hud-level-badge"></span>
        <span id="hud-level-title"></span>
        <span id="hud-xp-ratio"></span>
        <div id="hud-level-bar-fill"></div>
      </div>
      <div id="words-box">
        <div id="words-wrapper"></div>
        <div id="caret"></div>
      </div>
      <input id="typing-input" />
      <div id="focus-overlay"></div>
      <div id="egg-nest">
        <div id="nest-slot-0"></div>
        <div id="nest-slot-1"></div>
        <div id="nest-slot-2"></div>
        <div id="nest-hint"></div>
      </div>
      <button id="flow-recap-pill" style="display: none;"><span id="flow-recap-pill-text"></span></button>
      <div id="test-section"></div>
      <div id="results-section">
        <span id="res-wpm"></span>
        <span id="res-acc"></span>
        <span id="res-raw"></span>
        <span id="res-chars"></span>
        <span id="res-fixed"></span>
        <span id="res-fixed-detail"></span>
        <span id="res-consistency"></span>
        <span id="res-time"></span>
        <span id="res-time-detail"></span>
        <button id="next-test-btn"><span id="next-test-btn-label">Next Test</span><span id="next-test-btn-hint">tab</span></button>
      </div>
      <button id="hd-btn"></button>
      <button id="mods-btn" aria-expanded="false"></button>
      <div id="mods-popover" style="display: none;"></div>
      <button id="mods-close-btn"></button>
      <button id="restart-btn"><span id="restart-btn-label">tab</span></button>
      <div id="stats-modal" style="display: none;">
        <table><tbody id="flow-history-tbody"></tbody></table>
      </div>
    </body>
    </html>
  `, { url: 'https://typeflow.local/' });

  const { window } = dom;
  const { document } = window;
  window.localStorage = new LocalStorageMock();

  const wordsModel = new WordsModel();
  const sessionModel = new SessionModel();
  const flowModel = new FlowModel();
  const eggNestModel = new EggNestModel();
  const storageService = new StorageService(window.localStorage);
  const audioService = new AudioService();

  const stageView = new StageView({
    wordsBox: document.getElementById('words-box'),
    wordsWrapper: document.getElementById('words-wrapper'),
    caret: document.getElementById('caret'),
    focusOverlay: document.getElementById('focus-overlay'),
    typingInput: document.getElementById('typing-input')
  });

  const nestView = new NestView({
    eggNest: document.getElementById('egg-nest'),
    nestSlots: [
      document.getElementById('nest-slot-0'),
      document.getElementById('nest-slot-1'),
      document.getElementById('nest-slot-2')
    ],
    nestHint: document.getElementById('nest-hint'),
    restartBtn: document.getElementById('restart-btn'),
    flowRecapPill: document.getElementById('flow-recap-pill'),
    flowRecapPillText: document.getElementById('flow-recap-pill-text')
  });

  const hudView = new HUDView({
    tabClassic: document.getElementById('tab-classic'),
    tabFlow: document.getElementById('tab-flow'),
    timerEl: document.getElementById('timer'),
    restartBtn: document.getElementById('restart-btn'),
    restartBtnLabel: document.getElementById('restart-btn-label'),
    flowGauge: document.getElementById('flow-gauge'),
    flowSpeedTag: document.getElementById('flow-speed-tag'),
    speedIndicatorText: document.getElementById('speed-indicator-text'),
    flowMultiplierBadge: document.getElementById('flow-multiplier-badge'),
    flowMultVal: document.getElementById('flow-mult-val'),
    momentumBarFill: document.getElementById('momentum-bar-fill'),
    classicDurationPill: document.getElementById('classic-duration-pill'),
    flowTargetPill: document.getElementById('flow-target-pill'),
    diffSlider: document.getElementById('diff-slider'),
    diffInput: document.getElementById('diff-input'),
    levelHudCard: document.getElementById('level-hud-card'),
    hudLevelBadge: document.getElementById('hud-level-badge'),
    hudLevelTitle: document.getElementById('hud-level-title'),
    hudXpRatio: document.getElementById('hud-xp-ratio'),
    hudLevelBarFill: document.getElementById('hud-level-bar-fill'),
    flowVignetteOverlay: document.getElementById('flow-vignette-overlay'),
    hdBtn: document.getElementById('hd-btn'),
    modsBtn: document.getElementById('mods-btn'),
    modsPopover: document.getElementById('mods-popover'),
    modsCloseBtn: document.getElementById('mods-close-btn')
  });

  const chartView = new ChartView();
  const modalView = new ModalView({
    testSection: document.getElementById('test-section'),
    resultsSection: document.getElementById('results-section'),
    statsModal: document.getElementById('stats-modal'),
    resWpm: document.getElementById('res-wpm'),
    resAcc: document.getElementById('res-acc'),
    resRaw: document.getElementById('res-raw'),
    resChars: document.getElementById('res-chars'),
    resFixed: document.getElementById('res-fixed'),
    resFixedDetail: document.getElementById('res-fixed-detail'),
    resConsistency: document.getElementById('res-consistency'),
    resTime: document.getElementById('res-time'),
    resTimeDetail: document.getElementById('res-time-detail'),
    nextTestBtn: document.getElementById('next-test-btn'),
    nextTestBtnLabel: document.getElementById('next-test-btn-label'),
    nextTestBtnHint: document.getElementById('next-test-btn-hint'),
    flowHistoryTbody: document.getElementById('flow-history-tbody')
  });

  const controller = new GameController({
    wordsModel,
    sessionModel,
    flowModel,
    eggNestModel,
    storageService,
    audioService,
    stageView,
    nestView,
    hudView,
    chartView,
    modalView
  });

  return { dom, controller, storageService, wordsModel, sessionModel, flowModel, eggNestModel, stageView, nestView, hudView, modalView, restartBtn: document.getElementById('restart-btn'), nestHint: document.getElementById('nest-hint') };
}

// 1. KeyboardController Tests
console.log('--- 1. KeyboardController ---');

it('intercepts keys and maps chords properly', () => {
  let spaceCalled = false;
  let backspaceCalled = false;
  let tabCalled = false;
  let charReceived = '';

  const kb = new KeyboardController({
    onSpace: () => { spaceCalled = true; },
    onBackspace: () => { backspaceCalled = true; },
    onTab: () => { tabCalled = true; },
    onChar: (c) => { charReceived = c; }
  });

  kb.handleKeyDown({ key: ' ', preventDefault() {} });
  assert.strictEqual(spaceCalled, true);

  kb.handleKeyDown({ key: 'Backspace', preventDefault() {} });
  assert.strictEqual(backspaceCalled, true);

  kb.handleKeyDown({ key: 'Tab', preventDefault() {} });
  assert.strictEqual(tabCalled, true);

  kb.handleKeyDown({ key: 'a', preventDefault() {} });
  assert.strictEqual(charReceived, 'a');
});

// 2. GameController Tests
console.log('\n--- 2. GameController Integration ---');

it('initializes game controller and renders starting Ground Zero word', () => {
  const { controller, sessionModel } = createTestHarness();
  controller.init();

  assert.strictEqual(sessionModel.words[0], 'the');
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
});

it('types "the " cleanly and completes first word', () => {
  const { controller, sessionModel, flowModel } = createTestHarness();
  controller.init();

  controller.handleChar('t');
  assert.strictEqual(sessionModel.currentCharIdx, 1);

  controller.handleChar('h');
  assert.strictEqual(sessionModel.currentCharIdx, 2);

  controller.handleChar('e');
  assert.strictEqual(sessionModel.currentCharIdx, 3);

  controller.handleSpace();
  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
});

it('switches to classic mode cleanly and synchronizes widgets', () => {
  const { controller, storageService } = createTestHarness();
  controller.init();

  controller.switchMode('classic');
  assert.strictEqual(controller.currentMode, 'classic');
  assert.strictEqual(controller.hudView.timerEl.style.display, 'block');
  assert.strictEqual(controller.hudView.flowGauge.style.display, 'none');
  assert.strictEqual(storageService.getActiveMode(), 'classic');
});

it('manages in-situ egg hatching cycle', () => {
  const { controller, storageService, eggNestModel } = createTestHarness();
  controller.init();

  // Inject egg into basket
  storageService.addEgg({ id: 1, name: 'Rare Egg', wordRank: 42, rarity: 'rare', tierColor: '#c084fc' });
  eggNestModel.syncBasket(storageService.getGameSave().eggBasket);

  const entered = controller.enterHatchMode(0);
  assert.strictEqual(entered, true);
  assert.strictEqual(eggNestModel.isHatching(), true);

  // Type 'e' -> 'g' -> 'g'
  controller.handleHatchChar('e');
  assert.strictEqual(eggNestModel.hatchTyped, 'e');

  controller.handleHatchChar('g');
  assert.strictEqual(eggNestModel.hatchTyped, 'eg');

  controller.handleHatchChar('g');
  // Egg hatched! Removed from basket and rank unlocked
  const save = storageService.getGameSave();
  assert.ok(save.unlockedRanks.includes(42));
});

it('refreshes playfield when exiting egg hatch mode', () => {
  const { controller, sessionModel, eggNestModel, storageService, stageView } = createTestHarness();
  controller.init();

  // Inject egg into basket
  storageService.addEgg({ id: 1, name: 'Epic Egg', wordRank: 800, rarity: 'epic', tierColor: '#fbbf24' });
  eggNestModel.syncBasket(storageService.getGameSave().eggBasket);

  // Type some words first
  controller.handleChar('t');
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();
  assert.strictEqual(sessionModel.currentWordIdx, 1);

  // Enter hatch mode
  controller.enterHatchMode(0);
  assert.strictEqual(eggNestModel.isHatching(), true);

  // Exit hatch mode via user exit (e.g. Tab/Esc or clicking slot)
  controller.exitHatchMode();
  assert.strictEqual(eggNestModel.isHatching(), false);
  // Stage and session words must be refreshed and wordIdx reset to 0
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
  assert.ok(stageView.wordsWrapper.children.length > 0);
});

it('incubates egg deterministically in Flow mode, spawns egg into basket, and triggers materialize', () => {
  const { controller, flowModel, sessionModel, storageService, eggNestModel } = createTestHarness();
  controller.init();

  // Bring flowModel to nominal flow (100) and 98% egg charge
  flowModel.momentum = 100.0;
  flowModel.eggCharge = 98.0;

  // Type a clean word on pace
  const word = sessionModel.words[sessionModel.currentWordIdx] || 'the';
  for (const c of word) {
    controller.handleChar(c);
  }
  controller.handleSpace();

  // Egg must be spawned into basket, eggNestModel synced, eggCharge reset to 0
  const save = storageService.getGameSave();
  assert.strictEqual(save.eggBasket.length, 1);
  assert.strictEqual(eggNestModel.basket.length, 1);
  assert.strictEqual(flowModel.eggCharge, 0.0);
  assert.strictEqual(save.eggCharge, 0.0);
});

it('consecutive incubated eggs earned in Flow mode are strictly unique and never duplicate', () => {
  const { controller, flowModel, sessionModel, storageService, eggNestModel } = createTestHarness();
  controller.init();

  // Incubate Egg 1
  flowModel.momentum = 100.0;
  flowModel.eggCharge = 98.0;
  let word = sessionModel.words[sessionModel.currentWordIdx] || 'the';
  for (const c of word) controller.handleChar(c);
  controller.handleSpace();

  // Incubate Egg 2
  flowModel.momentum = 100.0;
  flowModel.eggCharge = 98.0;
  word = sessionModel.words[sessionModel.currentWordIdx] || 'the';
  for (const c of word) controller.handleChar(c);
  controller.handleSpace();

  // Incubate Egg 3
  flowModel.momentum = 100.0;
  flowModel.eggCharge = 98.0;
  word = sessionModel.words[sessionModel.currentWordIdx] || 'the';
  for (const c of word) controller.handleChar(c);
  controller.handleSpace();

  const finalSave = storageService.getGameSave();
  assert.strictEqual(finalSave.eggBasket.length, 3);
  const basketRanks = finalSave.eggBasket.map(e => e.wordRank);
  const uniqueRanks = new Set(basketRanks);
  assert.strictEqual(uniqueRanks.size, 3, 'All 3 eggs in basket must have distinct unique word ranks');
  basketRanks.forEach(r => {
    assert.notStrictEqual(r, 1, 'Eggs must not roll already-unlocked rank 1 ("the")');
  });
});

it('sanitizeEggBasket automatically repairs legacy duplicate or already-unlocked eggs on init', () => {
  const { storageService } = createTestHarness();
  const corruptSave = storageService.getGameSave();
  corruptSave.unlockedRanks = [1, 28]; // Rank 28 ("which") is already unlocked!
  corruptSave.eggBasket = [
    { id: 'old_1', wordRank: 28, word: 'which', rarity: 'common' }, // Corrupt: already unlocked!
    { id: 'old_2', wordRank: 45, word: 'time', rarity: 'common' },
    { id: 'old_3', wordRank: 45, word: 'time', rarity: 'common' }   // Corrupt: duplicate of slot 1!
  ];
  storageService.saveGameSave(corruptSave);

  // Initialize controller with this corrupt save
  const { controller } = createTestHarness();
  // Set the pre-populated storage
  controller.storageService = storageService;
  controller.init();

  const sanitizedSave = storageService.getGameSave();
  assert.strictEqual(sanitizedSave.eggBasket.length, 3);
  const ranks = sanitizedSave.eggBasket.map(e => e.wordRank);
  const unique = new Set(ranks);
  assert.strictEqual(unique.size, 3, 'All eggs must be sanitized to unique words');
  assert.ok(!ranks.includes(28), 'Egg for rank 28 must be re-rolled since 28 is already unlocked');
  assert.ok(!ranks.includes(1), 'Egg must not roll rank 1');
});

it('classic mode chooses words across 1,000 common words with frequency weighting', () => {
  const { controller, wordsModel } = createTestHarness();
  controller.init();
  controller.switchMode('classic');

  // Verify generateClassicBatch produces a rich variety across the 1,000 dictionary
  const sampleBatches = [];
  for (let b = 0; b < 5; b++) {
    sampleBatches.push(wordsModel.generateClassicBatch(70));
  }
  const allSampled = sampleBatches.flat();
  const uniqueWords = new Set(allSampled);

  // Classic mode must NOT be restricted to only 10 words
  assert.ok(uniqueWords.size >= 100, `Expected at least 100 unique words across 350 sampled, got ${uniqueWords.size}`);

  // Must include words beyond rank 100 (uncommon, rare, epic)
  const metaRanks = allSampled.map(w => {
    const meta = wordsModel.getWordByText(w);
    return meta ? meta.rank : 1;
  });
  const maxRankSampled = Math.max(...metaRanks);
  assert.ok(maxRankSampled > 300, `Expected words with rank > 300 to appear, max rank was ${maxRankSampled}`);

  // Verify anti-clumping: no word appears adjacent to itself
  for (const batch of sampleBatches) {
    for (let i = 1; i < batch.length; i++) {
      assert.notStrictEqual(batch[i], batch[i - 1], `Clumping detected: adjacent repeated word "${batch[i]}"`);
    }
  }
});

it('results graph timeline tracks errors per-second and properly records fixed errors', () => {
  const { controller, sessionModel } = createTestHarness();
  controller.init();
  controller.switchMode('classic');

  // Start classic test
  sessionModel.start(1000);

  // Second 1: Type word 1 cleanly
  const word1 = sessionModel.getCurrentWordText();
  for (const ch of word1) {
    controller.handleChar(ch);
  }
  controller.handleSpace();
  sessionModel.tickTimer(2000); // 1s tick

  // Second 2: Type first char of word 2, then typo
  const word2 = sessionModel.getCurrentWordText();
  controller.handleChar(word2[0]);
  const typoChar = word2[1] === 'x' ? 'y' : 'x';
  controller.handleChar(typoChar); // Typo!
  sessionModel.tickTimer(3000); // 2s tick

  // Second 3: Backspace to fix typo, then complete word 2
  controller.handleBackspace(); // Fixes error!
  for (let i = 1; i < word2.length; i++) {
    controller.handleChar(word2[i]);
  }
  controller.handleSpace();
  sessionModel.tickTimer(4000); // 3s tick

  // Second 4: Type word 3 cleanly
  const word3 = sessionModel.getCurrentWordText();
  for (const ch of word3) {
    controller.handleChar(ch);
  }
  controller.handleSpace();
  sessionModel.tickTimer(5000); // 4s tick

  const history = sessionModel.wpmHistory;
  assert.strictEqual(history.length, 4);

  // Verify per-second error isolation:
  assert.strictEqual(history[0].errors, 0, 'Second 1 should have 0 errors');
  assert.strictEqual(history[1].errors, 1, 'Second 2 should have 1 error');
  assert.strictEqual(history[2].errors, 0, 'Second 3 should have 0 errors');
  assert.strictEqual(history[3].errors, 0, 'Second 4 should have 0 errors');

  // Verify error fix propagation:
  // Since typo in second 2 was repaired in second 3, second 2's snapshot has fixed = 1
  assert.strictEqual(history[1].fixed, 1, 'Second 2 error should be marked as fixed');
  assert.strictEqual(sessionModel.totalFixedErrors, 1);
});

it('destroys and cleans up intervals and event listeners without leaks', () => {
  const { controller } = createTestHarness();
  controller.init();
  controller.startClassicTimer();
  assert.ok(controller.classicTimerInterval);
  assert.ok(controller.idleDecayInterval);
  assert.ok(controller._onMouseMove);

  controller.destroy();
  assert.strictEqual(controller.classicTimerInterval, null);
  assert.strictEqual(controller.idleDecayInterval, null);
  assert.strictEqual(controller.physicsAnimFrame, null);
  assert.strictEqual(controller._onMouseMove, null);
  assert.strictEqual(controller._boundMouseMoveDoc, null);
  assert.strictEqual(controller._zenMouseResetTimer, null);
});

it('typing words records bigram transitions into BigramLedger and persists on space', () => {
  const { controller } = createTestHarness();
  controller.init();

  assert.ok(controller.bigramLedger);
  assert.strictEqual(controller.bigramLedger.getMastery('th'), null);

  // Type "the"
  controller.handleChar('t');
  controller.handleChar('h');
  controller.handleChar('e');

  assert.ok(controller.bigramLedger.getMastery('th') !== null);
  assert.ok(controller.bigramLedger.getMastery('he') !== null);

  // Hit space to complete word
  controller.handleSpace();

  const persisted = controller.storageService.getBigramLedger();
  assert.ok(persisted.th !== undefined);
  assert.ok(persisted.he !== undefined);
});

it('Sandwiched Induction Rule applies on egg hatch: stage words launch with [Anchor1, NewWord, Anchor2]', () => {
  const { controller } = createTestHarness();
  controller.init();

  // Add an egg to basket
  const egg = controller.wordsModel.rollEgg([1], 0, 'starter');
  controller.storageService.addEgg(egg);
  controller.eggNestModel.syncBasket(controller.storageService.getGameSave().eggBasket);

  // Enter hatch mode and crack egg
  controller.enterHatchMode(0);
  controller.handleHatchChar('e');
  controller.handleHatchChar('g');
  controller.handleHatchChar('g');

  // Verify pending hatched word queued
  assert.strictEqual(controller.pendingHatchedWords.length, 1);
  assert.strictEqual(controller.pendingHatchedWords[0].word, egg.word);

  // Exit hatch mode -> applies Sandwiched Induction
  controller.exitHatchMode();

  // The very first 3 words in sessionModel are [Anchor1, HatchedWord, Anchor2]
  assert.strictEqual(controller.sessionModel.words[1], egg.word);
  assert.notStrictEqual(controller.sessionModel.words[0], egg.word);
  assert.notStrictEqual(controller.sessionModel.words[2], egg.word);
});

it('Rare/Epic unlocks during peak flow (>= 90% momentum) are held in queue until flow dips below 90%', () => {
  const { controller } = createTestHarness();
  controller.init();

  // Simulate peak egg-charging flow
  controller.flowModel.momentum = 105;

  // Queue an Epic hatched word
  controller.queueHatchedWord('question', 'epic');

  // Must be held in pendingRareEpicUnlocks to protect peak flow
  assert.strictEqual(controller.pendingRareEpicUnlocks.length, 1);
  assert.strictEqual(controller.pendingRareEpicUnlocks[0].word, 'question');
  assert.strictEqual(controller.pendingHatchedWords.length, 0);

  // Now flow dips below 90% (e.g. 50% momentum)
  controller.flowModel.momentum = 50;

  // Type a word and press space to trigger momentum check in handleSpace
  controller.handleChar('t');
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();

  // Queued Epic word is released to pendingHatchedWords / induced into stream
  assert.strictEqual(controller.pendingRareEpicUnlocks.length, 0);
});

it('GameController.toggleHiddenMode toggles mode, updates views, and persists to storageService', () => {
  const { controller } = createTestHarness();
  controller.init();

  assert.strictEqual(controller.storageService.getHiddenMode(), false);
  assert.strictEqual(controller.stageView.hiddenMode, false);

  const toggledOn = controller.toggleHiddenMode();
  assert.strictEqual(toggledOn, true);
  assert.strictEqual(controller.storageService.getHiddenMode(), true);
  assert.strictEqual(controller.stageView.hiddenMode, true);
  assert.strictEqual(controller.stageView.wordsBox.classList.contains('hidden-mode'), true);
  assert.strictEqual(controller.hudView.hdBtn.classList.contains('active'), true);

  const toggledOff = controller.toggleHiddenMode();
  assert.strictEqual(toggledOff, false);
  assert.strictEqual(controller.storageService.getHiddenMode(), false);
  assert.strictEqual(controller.stageView.hiddenMode, false);
  assert.strictEqual(controller.stageView.wordsBox.classList.contains('hidden-mode'), false);
  assert.strictEqual(controller.hudView.hdBtn.classList.contains('active'), false);
});

it('typing keystrokes in Hidden Mode updates stage horizon and safety brake triggers on error', () => {
  const { controller } = createTestHarness();
  controller.init();
  controller.setHiddenMethod('char');
  controller.toggleHiddenMode(); // Enable Hidden mode

  // First word is 'the'
  assert.strictEqual(controller.sessionModel.getCurrentWordText(), 'the');

  const word0 = controller.stageView.wordElements[0];
  const word1 = controller.stageView.wordElements[1];

  // Initial state on word 0 (streak 0): zero character fade (all untyped characters fully visible)
  assert.strictEqual(controller.getHiddenZeroDist(), 0);
  assert.strictEqual(controller.getHiddenFadeDepth(), 4.0);
  assert.strictEqual(word0.children[0].style.opacity, '');
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');
  assert.strictEqual(word1.children[0].style.opacity, '');

  // Type correct 't'
  controller.handleChar('t');
  // Past typed character is fully transparent behind cursor
  assert.strictEqual(word0.children[0].classList.contains('hd-past'), true);
  assert.strictEqual(word0.children[0].style.opacity, '0');
  // Letter at cursor k=0 ('h') dims to 0.75 (combo 1 -> M = 0.25), k=1 ('e') is 1.0
  assert.strictEqual(word0.children[1].style.opacity, '0.75');
  assert.strictEqual(word0.children[2].style.opacity, '');

  // Type typo 'z' instead of 'h'
  controller.handleChar('z');
  // Safety brake triggers: mistake pops to full visibility (inline opacity cleared so CSS !important shows red)
  assert.strictEqual(word0.children[1].classList.contains('incorrect'), true);
  assert.strictEqual(word0.children[1].style.opacity, '');

  // Backspace cleans error
  controller.handleBackspace();
  assert.strictEqual(word0.children[1].classList.contains('incorrect'), false);
  // Returns to zero combo visibility (cursor letter restored to 1.0)
  assert.strictEqual(word0.children[0].style.opacity, '0');
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');

  // Finish word 0 cleanly ('h', 'e', ' ') to complete first word and enter word 1
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();

  // In Hidden mode, an error on word 0 breaks combo and taints the word.
  // Backspacing and finishing word 0 does NOT award combo or increment streak.
  assert.strictEqual(controller.sessionModel.currentWordIdx, 1);
  assert.strictEqual(controller.sessionModel.wordStreak, 0);
  assert.strictEqual(controller.getHiddenCombo(), 0);
  assert.strictEqual(controller.sessionModel.getBlindfoldMask(), 0.0);

  // Word 1 starts at combo 0: all untyped letters are fully visible (1.0 opacity)
  assert.strictEqual(word1.children[0].style.opacity, '');
  assert.strictEqual(word1.children[1].style.opacity, '');
  assert.strictEqual(word1.children[2].style.opacity, '');

  // Typing cleanly on Word 1 now legitimately builds combo from 0
  const nextWordText = controller.sessionModel.getCurrentWordText();
  controller.handleChar(nextWordText[0]);
  assert.strictEqual(controller.getHiddenCombo(), 1);
  assert.strictEqual(controller.sessionModel.getBlindfoldMask(), 0.25);
  // First letter is now behind cursor (k < 0 -> hd-past, opacity 0)
  assert.strictEqual(word1.children[0].classList.contains('hd-past'), true);
  assert.strictEqual(word1.children[0].style.opacity, '0');
  // Second letter is at cursor (k = 0 -> penetration = 0.25 - 0 = 0.25 -> raw = 0.75 -> opacity '0.75')
  assert.strictEqual(word1.children[1].style.opacity, '0.75');
  // Third letter is upcoming char 1 (k = 1 -> penetration <= 0 -> opacity '')
  assert.strictEqual(word1.children[2].style.opacity, '');
});

it('Hidden Mode horizon scales: zero at start, 1..5, and 0.5 per word after word 6', () => {
  const { controller } = createTestHarness();
  controller.init();

  // Streak 0 (start of combo): zero character fade
  assert.strictEqual(controller.getHiddenZeroDist(), 0);
  assert.strictEqual(controller.getHiddenFadeDepth(), 4.0);

  // Type 1 clean word -> 1 character fade
  controller.handleChar('t');
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();

  assert.strictEqual(controller.sessionModel.wordStreak, 1);
  assert.strictEqual(controller.getHiddenZeroDist(), 1);
  assert.strictEqual(controller.getHiddenFadeDepth(), 5.0);

  // Type words 2 to 5 (total 5 words in a row)
  for (let w = 0; w < 4; w++) {
    const cur = controller.sessionModel.getCurrentWordText();
    for (let c of cur) controller.handleChar(c);
    controller.handleSpace();
  }
  assert.strictEqual(controller.sessionModel.wordStreak, 5);
  assert.strictEqual(controller.getHiddenZeroDist(), 5);
  assert.strictEqual(controller.getHiddenFadeDepth(), 9.0);

  // Word 6: scales by half a character (+0.5)
  const cur6 = controller.sessionModel.getCurrentWordText();
  for (let c of cur6) controller.handleChar(c);
  controller.handleSpace();

  assert.strictEqual(controller.sessionModel.wordStreak, 6);
  assert.strictEqual(controller.getHiddenZeroDist(), 5.5);
  assert.strictEqual(controller.getHiddenFadeDepth(), 9.5);

  // Word 7: scales to 6.0
  const cur7 = controller.sessionModel.getCurrentWordText();
  for (let c of cur7) controller.handleChar(c);
  controller.handleSpace();

  assert.strictEqual(controller.sessionModel.wordStreak, 7);
  assert.strictEqual(controller.getHiddenZeroDist(), 6.0);
  assert.strictEqual(controller.getHiddenFadeDepth(), 10.0);

  // Word with error drops combo back to zero
  controller.handleChar('x'); // wrong char
  controller.handleSpace();
  assert.strictEqual(controller.sessionModel.wordStreak, 0);
  assert.strictEqual(controller.getHiddenZeroDist(), 0);
  assert.strictEqual(controller.getHiddenFadeDepth(), 4.0);
});

it('completing words in Hidden Mode awards +15% bonus XP', () => {
  const { controller } = createTestHarness();
  controller.init();

  const initialSave = controller.storageService.getGameSave();
  const startXp = initialSave.currentXp;

  // Type 'the' with Hidden Mode OFF
  controller.handleChar('t');
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();

  const xpEarnedNormal = controller.storageService.getGameSave().currentXp - startXp;

  // Now enable Hidden Mode
  controller.toggleHiddenMode();
  const xpBeforeHidden = controller.storageService.getGameSave().currentXp;

  // Type next word (all unlocked ranks start with rank 1 'the')
  const curWord = controller.sessionModel.getCurrentWordText();
  for (let c of curWord) {
    controller.handleChar(c);
  }
  controller.handleSpace();

  const xpHidden = controller.storageService.getGameSave().currentXp - xpBeforeHidden;

  // Hidden mode must award strictly greater XP (+15% bonus)
  assert.ok(xpHidden > xpEarnedNormal, `Expected Hidden XP (${xpHidden}) > Normal XP (${xpEarnedNormal})`);
});

it('typing incorrect letter in Hidden Flow Mode immediately breaks flow streak and combo, but clean submission clears error underline and renders letters transparent', () => {
  const { controller } = createTestHarness();
  controller.init();
  controller.toggleHiddenMode(); // Enable Hidden Mode

  // Accelerate momentum and build flowStreak
  controller.flowModel.momentum = 80;
  controller.flowModel.flowStreak = 5;
  controller.flowModel.consecutiveCleanWords = 5;

  const word = controller.sessionModel.getCurrentWordText(); // 'the'
  // Type 't'
  controller.handleChar(word[0]);
  assert.strictEqual(controller.flowModel.flowStreak, 5);

  // Type typo 'z' instead of 'h'
  controller.handleChar('z');
  // Immediately breaks flow combo & streak
  assert.strictEqual(controller.flowModel.flowStreak, 0);
  assert.strictEqual(controller.flowModel.consecutiveCleanWords, 0);
  assert.strictEqual(controller.sessionModel.combo, 0);

  // Backspace the error
  controller.handleBackspace();
  assert.strictEqual(controller.flowModel.flowStreak, 0);

  // Finish typing the word cleanly
  for (let i = 1; i < word.length; i++) {
    controller.handleChar(word[i]);
  }
  assert.strictEqual(controller.sessionModel.combo, 0); // Still 0 on tainted word

  const completedWordEl = controller.stageView.wordElements[controller.sessionModel.currentWordIdx];
  controller.handleSpace();

  // Completed word was fixed: hasErrors must be false, no .error class (no red underline)
  assert.strictEqual(completedWordEl.classList.contains('error'), false, 'Fixed word should NOT have .error class');

  // Completed word in hidden mode must become transparent with hd-past
  const letters = completedWordEl.querySelectorAll('.letter');
  for (let i = 0; i < letters.length; i++) {
    assert.strictEqual(letters[i].classList.contains('hd-past'), true, `Letter ${i} should have hd-past class`);
    assert.strictEqual(letters[i].style.opacity, '0', `Letter ${i} should have opacity: '0'`);
  }

  // Anti-exploit: combo and wordStreak stayed at 0 for the tainted word
  assert.strictEqual(controller.sessionModel.combo, 0);
  assert.strictEqual(controller.sessionModel.wordStreak, 0);
});

it('GameController switches Hidden mode method and word distance, and handles Word Vanish mode during play', () => {
  const { controller } = createTestHarness();
  controller.init();
  // Verify initial default is 'word' and 1
  assert.strictEqual(controller.storageService.getHiddenMethod(), 'word');
  assert.strictEqual(controller.storageService.getHiddenWordDistance(), 1);
  assert.strictEqual(controller.sessionModel.hiddenMethod, 'word');
  assert.strictEqual(controller.sessionModel.hiddenWordDistance, 1);

  controller.toggleHiddenMode(); // Enable Hidden Mode

  // Switch distance to 2
  controller.setHiddenMethod('word');
  controller.setHiddenWordDistance(2);

  assert.strictEqual(controller.storageService.getHiddenMethod(), 'word');
  assert.strictEqual(controller.storageService.getHiddenWordDistance(), 2);
  assert.strictEqual(controller.sessionModel.hiddenMethod, 'word');
  assert.strictEqual(controller.sessionModel.hiddenWordDistance, 2);
  assert.strictEqual(controller.stageView.hiddenMethod, 'word');
  assert.strictEqual(controller.stageView.hiddenWordDistance, 2);

  // At start (streak 0): active word (word 0) and upcoming words are visible
  const w0 = controller.stageView.wordElements[0];
  const w1 = controller.stageView.wordElements[1];
  const w2 = controller.stageView.wordElements[2];
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), false);

  // Complete Word 0 cleanly
  const word0 = controller.sessionModel.getCurrentWordText();
  for (let i = 0; i < word0.length; i++) {
    controller.handleChar(word0[i]);
  }
  controller.handleSpace();

  // Streak is now 1: active word (word 1) vanishes, word 2 is visible
  assert.strictEqual(controller.sessionModel.wordStreak, 1);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), false);

  // Complete Word 1 cleanly
  const word1 = controller.sessionModel.getCurrentWordText();
  for (let i = 0; i < word1.length; i++) {
    controller.handleChar(word1[i]);
  }
  controller.handleSpace();

  // Streak is now 2: active word (word 2) and word 3 (1 word ahead) vanish!
  const w3 = controller.stageView.wordElements[3];
  const w4 = controller.stageView.wordElements[4];
  assert.strictEqual(controller.sessionModel.wordStreak, 2);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w3.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w4.classList.contains('hd-word-vanished'), false);

  // Mistype on word 2: safety brake triggers immediately and reveals vanished words!
  controller.handleChar('z');
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w3.classList.contains('hd-word-vanished'), false);

  // Set distance to 1 (cursor-only mode): only active word vanishes, upcoming words remain visible
  controller.setHiddenWordDistance(1);
  assert.strictEqual(controller.storageService.getHiddenWordDistance(), 1);
  assert.strictEqual(controller.sessionModel.hiddenWordDistance, 1);
  controller.sessionModel.wordStreak = 4;
  controller.stageView.updateHiddenHorizon(2, 0, 10, false, null, { method: 'word', wordDistance: 1, streak: 4 });
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w3.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w4.classList.contains('hd-word-vanished'), false);
});

it('proactively initializes stage runway with ~60 words and replenishes to keep line 3 full with tight flow relevance', () => {
  const { controller, sessionModel, stageView } = createTestHarness();
  controller.init();

  // 1. Initial buffer maintains ~60 words so lines 1, 2, and 3 are completely filled (~25-50 words visible)
  assert.strictEqual(sessionModel.words.length, 60);
  assert.strictEqual(stageView.wordElements.length, 60);

  // 2. Advance through words until remaining count hits threshold (<= 24)
  // At word index 35: remaining words = 60 - 35 = 25 (> 24, no refill yet)
  sessionModel.currentWordIdx = 35;
  controller.ensureWordBuffer(35);
  assert.strictEqual(sessionModel.words.length, 60);

  // At word index 36: remaining words = 60 - 36 = 24 (threshold hit, appends 30 words)
  sessionModel.currentWordIdx = 36;
  controller.ensureWordBuffer(36);
  assert.strictEqual(sessionModel.words.length, 90);
  assert.strictEqual(stageView.wordElements.length, 90);

  // Remaining words ahead is now 90 - 36 = 54 words (~50-60 words), ensuring line 3 is always full
  // while keeping newly generated words fresh and tightly responsive to player's live flow state
  assert.strictEqual(stageView.wordElements.length - 36, 54);
});

it('replenishes classic mode word stream to maintain runway for long tests', () => {
  const { controller, sessionModel, stageView } = createTestHarness();
  controller.init();
  controller.switchMode('classic');

  assert.strictEqual(controller.currentMode, 'classic');
  assert.strictEqual(sessionModel.words.length, 60);

  // Advance near end of buffer in Classic mode
  sessionModel.currentWordIdx = 36;
  controller.ensureWordBuffer(36);

  // Check that 30 classic words were appended
  assert.strictEqual(sessionModel.words.length, 90);
  assert.strictEqual(stageView.wordElements.length, 90);
  assert.strictEqual(typeof sessionModel.words[89], 'string');
});

// 3. Flow State Performance Recap & Timeline Graph Tests
console.log('\n--- 3. Flow State Performance Recap & Timeline Graph ---');

it('qualifies a Flow Run only when momentum >= 85% start, >= 5s duration, >= 3 clean words, and stays alive above >= 50% continuation floor', () => {
  const { sessionModel } = createTestHarness();
  sessionModel.reset({ mode: 'flow', words: ['the', 'and', 'for', 'are', 'but', 'not'] });

  // 1. Disqualified short run (< 5s or < 3 clean words) returns null
  sessionModel.recordFlowRunWord(true, 65, 90, 12);
  sessionModel.tickFlowRun(92);
  sessionModel.recordFlowRunWord(true, 70, 95, 12);
  const shortRes = sessionModel.recordFlowRunWord(false, 40, 45, 12); // drops below 50% after only 2 clean words & 1s
  assert.strictEqual(shortRes, null);
  assert.strictEqual(sessionModel.flowRun, null);

  // 2. Qualifying run starts at >= 85% momentum, survives a dip to 55% (>= 50% floor), and finalizes at < 50%
  sessionModel.recordFlowRunWord(true, 62, 88, 25);
  assert.ok(sessionModel.flowRun, 'Flow run should start at >= 85% momentum');
  // Simulate 5 seconds of 1s timeline ticks + 3 clean words + 1 stumble to 55%
  for (let s = 1; s <= 5; s++) {
    sessionModel.correctKeystrokes += 5;
    sessionModel.rawKeystrokes += 5;
    sessionModel.tickFlowRun(s === 3 ? 55 : 95);
  }
  sessionModel.recordFlowRunWord(true, 68, 96, 25);
  // Stumble word that drops momentum to 55% (still >= 50% floor, so run stays alive!)
  const midDipRes = sessionModel.recordFlowRunWord(false, 45, 55, 25);
  assert.strictEqual(midDipRes, null, 'Flow run should survive a dip to 55% momentum (>= 50% floor)');
  assert.ok(sessionModel.flowRun, 'Flow run remains active at 55% momentum');

  // Third clean word brings cleanWords to 3
  sessionModel.recordFlowRunWord(true, 74, 92, 25);
  assert.strictEqual(sessionModel.flowRun.cleanWords, 3);

  // Now drop below 50% (e.g. 42%) -> finalizes and returns qualifying Flow Run summary!
  const completed = sessionModel.recordFlowRunWord(false, 30, 42, 25);
  assert.ok(completed, 'Qualifying flow run should be returned when momentum drops below 50%');
  assert.strictEqual(completed.cleanWords, 3);
  assert.strictEqual(completed.totalWords, 5);
  assert.strictEqual(completed.unlockedWords, 25);
  assert.ok(completed.duration >= 5);
  assert.strictEqual(completed.wpmHistory.length, 5);
  assert.strictEqual(completed.wpmHistory[2].momentum, 55);
});

it('persists qualifying Flow Runs in StorageService (up to 15 runs) with unlockedWords and updates NestView pill', () => {
  const { controller, storageService, nestView, modalView, dom } = createTestHarness();
  controller.init();

  const sampleRun = {
    wpm: 68,
    rawWpm: 72,
    peakWpm: 84,
    accuracy: 97,
    consistency: 91,
    duration: 18,
    cleanWords: 16,
    totalWords: 17,
    unlockedWords: 42,
    correctChars: 95,
    incorrectChars: 3,
    extraChars: 0,
    missedChars: 0,
    fixedErrors: 2,
    wpmHistory: [
      { second: 1, wpm: 64, raw: 64, errors: 0, burstWords: [{ word: 'the', wpm: 64 }], momentum: 88 },
      { second: 2, wpm: 72, raw: 72, errors: 0, burstWords: [{ word: 'and', wpm: 76 }], momentum: 96 }
    ]
  };

  controller.handleFlowRunCompleted(sampleRun);

  const savedLast = storageService.getLastFlowRun();
  assert.ok(savedLast);
  assert.strictEqual(savedLast.wpm, 68);
  assert.strictEqual(savedLast.peakWpm, 84);
  assert.strictEqual(savedLast.unlockedWords, 42);
  assert.strictEqual(storageService.getFlowHistory().length, 1);

  // Verify contextual pill next to Egg Nest is visible and displays summary
  assert.strictEqual(nestView.flowRecapPill.style.display, 'inline-flex');
  assert.ok(nestView.flowRecapPillText.textContent.includes('Flow: 68 WPM'));
  assert.ok(nestView.flowRecapPillText.textContent.includes('Peak 84'));

  // Verify Lifetime Stats modal renders Recent Flow Runs table and clicking a row opens Flow Recap
  controller.openStats('flow');
  const rows = dom.window.document.querySelectorAll('#flow-history-tbody tr.flow-history-row');
  assert.strictEqual(rows.length, 1);
  assert.ok(rows[0].textContent.includes('68 WPM'));
  assert.ok(rows[0].textContent.includes('42 words'));

  rows[0].click();
  assert.strictEqual(controller.isFlowRecapVisible, true);
  assert.strictEqual(modalView.resultsSection.classList.contains('visible'), true);
  assert.strictEqual(modalView.resWpm.textContent, '68');
  assert.strictEqual(modalView.resTimeDetail.textContent, 'flow run • 42 words unlocked');
  assert.strictEqual(modalView.nextTestBtnLabel.textContent, 'Resume Flow');
});

it('handles ;; home-row double-tap toggle, suppresses single ; typos, and wakes on first typing keystroke without losing the character', () => {
  const { controller, sessionModel, modalView } = createTestHarness();
  controller.init();

  // Seed a completed Flow Run
  controller.handleFlowRunCompleted({
    wpm: 75,
    rawWpm: 75,
    peakWpm: 90,
    accuracy: 100,
    consistency: 94,
    duration: 12,
    cleanWords: 12,
    totalWords: 12,
    unlockedWords: 15,
    correctChars: 60,
    incorrectChars: 0,
    extraChars: 0,
    missedChars: 0,
    fixedErrors: 0,
    wpmHistory: [{ second: 1, wpm: 75, raw: 75, errors: 0, burstWords: [], momentum: 100 }]
  });

  const startCharIdx = sessionModel.currentCharIdx;

  // 1. Single semicolon ';' is suppressed and never registered as a character or error
  controller.keyboardController.handleKeyDown({ key: ';', preventDefault() {} });
  assert.strictEqual(sessionModel.currentCharIdx, startCharIdx, 'Single ; should not advance or taint current word');
  assert.strictEqual(controller.isFlowRecapVisible, false);

  // 2. Second semicolon ';' within 400ms triggers ;; chord and opens Flow Recap
  controller.keyboardController.handleKeyDown({ key: ';', preventDefault() {} });
  assert.strictEqual(controller.isFlowRecapVisible, true);
  assert.strictEqual(modalView.resultsSection.classList.contains('visible'), true);

  // 3. Pressing first letter of current word while Flow Recap is open immediately dismisses recap AND types that letter!
  const firstLetter = sessionModel.getCurrentWordText()[0];
  controller.keyboardController.handleKeyDown({ key: firstLetter, preventDefault() {} });
  assert.strictEqual(controller.isFlowRecapVisible, false, 'Typing a character should immediately dismiss Flow Recap');
  assert.strictEqual(modalView.resultsSection.classList.contains('visible'), false);
  assert.strictEqual(sessionModel.currentCharIdx, 1, 'First keystroke that woke from Flow Recap should be typed into the active word');
});

it('activates Zen Focus on active typing, maintains focus on Backspace, and deactivates on Escape', () => {
  const { controller, sessionModel, dom } = createTestHarness();
  controller.init();
  const appEl = dom.window.document.getElementById('app') || dom.window.document.body;

  assert.strictEqual(controller.isZenActive, false);
  assert.ok(!appEl.classList.contains('zen-active'));

  // 1. Typing a character triggers Zen Focus
  const word = sessionModel.getCurrentWordText();
  controller.keyboardController.handleKeyDown({ key: word[0], preventDefault() {} });
  assert.strictEqual(controller.isZenActive, true);
  assert.ok(appEl.classList.contains('zen-active'));

  // 2. Pressing Backspace maintains Zen Focus (no jarring unhide/re-hide flash)
  controller.keyboardController.handleKeyDown({ key: 'Backspace', preventDefault() {} });
  assert.strictEqual(controller.isZenActive, true);
  assert.ok(appEl.classList.contains('zen-active'));

  // 3. Pressing Escape deactivates Zen Focus
  controller.keyboardController.handleKeyDown({ key: 'Escape', preventDefault() {} });
  assert.strictEqual(controller.isZenActive, false);
  assert.ok(!appEl.classList.contains('zen-active'));
});

it('Zen Focus requires wind-up mouse movement interaction before waking and ignores accidental touches', () => {
  const { controller, sessionModel, dom } = createTestHarness();
  controller.init();
  const appEl = dom.window.document.getElementById('app') || dom.window.document.body;

  // 1. Enter Zen Focus via typing
  const word = sessionModel.getCurrentWordText();
  controller.keyboardController.handleKeyDown({ key: word[0], preventDefault() {} });
  assert.strictEqual(controller.isZenActive, true);
  assert.ok(appEl.classList.contains('zen-active'));

  // 2. Accidental trackpad brush: single slight mouse movement event (0ms elapsed, 0px)
  controller.handleMouseMove({ clientX: 200, clientY: 200, timeStamp: 1000 });
  assert.strictEqual(controller.isZenActive, true, 'Single accidental trackpad touch should not wake Zen Focus');
  assert.ok(appEl.classList.contains('zen-active'));

  // 3. Minor jitter/graze 40ms later with negligible movement (2px, 40ms elapsed < 250ms threshold)
  controller.handleMouseMove({ clientX: 202, clientY: 201, timeStamp: 1040 });
  assert.strictEqual(controller.isZenActive, true, 'Minor jitter should not wake Zen Focus');
  assert.ok(appEl.classList.contains('zen-active'));

  // 4. Movement stops, and 1.5 seconds later another accidental touch occurs
  // Idle gap > 300ms resets the tracker, treating the new event as an initial brush
  controller.handleMouseMove({ clientX: 203, clientY: 202, timeStamp: 2500 });
  assert.strictEqual(controller.isZenActive, true, 'Intermittent accidental brush after idle gap must not wake Zen Focus');

  // 5. Deliberate mouse interaction with sustained movement across 260ms (> 250ms wind-up) and 60px distance
  // Event at 100ms into stroke:
  controller.handleMouseMove({ clientX: 230, clientY: 220, timeStamp: 2600 });
  assert.strictEqual(controller.isZenActive, true, 'Still winding up at 100ms');

  // Event at 260ms into stroke (> 250ms wind-up and > 30px distance):
  controller.handleMouseMove({ clientX: 260, clientY: 240, timeStamp: 2760 });
  assert.strictEqual(controller.isZenActive, false, 'Sustained deliberate movement exceeding wind-up threshold wakes Zen Focus');
  assert.ok(!appEl.classList.contains('zen-active'), 'zen-active class removed from app container');
});

it('document mousemove event routes through handleMouseMove with wind-up protection', () => {
  const { controller, sessionModel, dom } = createTestHarness();
  controller.init();

  // Type to activate Zen Focus
  const word = sessionModel.getCurrentWordText();
  controller.keyboardController.handleKeyDown({ key: word[0], preventDefault() {} });
  assert.strictEqual(controller.isZenActive, true);

  // Dispatching a single mousemove event onto document should not wake Zen Focus
  const moveEvent1 = new dom.window.MouseEvent('mousemove', { clientX: 100, clientY: 100 });
  dom.window.document.dispatchEvent(moveEvent1);
  assert.strictEqual(controller.isZenActive, true, 'DOM mousemove without windup does not wake Zen Focus');
});

it('Escape closes Mods Popover when open before triggering session reset', () => {
  const { controller } = createTestHarness();
  controller.init();

  // Open mods popover
  controller.hudView.toggleModsPopover(true);
  assert.strictEqual(controller.hudView.isModsPopoverOpen(), true);

  // Press Escape
  controller.keyboardController.handleKeyDown({ key: 'Escape', preventDefault() {} });
  assert.strictEqual(controller.hudView.isModsPopoverOpen(), false, 'Escape should close mods popover first');
});

it('Tab only enters hatch mode when player has 3 eggs, otherwise resets session and toggles restartBtn fade-out', () => {
  const { controller, storageService, eggNestModel, restartBtn, nestHint } = createTestHarness();
  controller.init();

  // 1. With 1 egg in Flow mode: Tab resets session, does NOT enter hatch mode
  storageService.addEgg({ id: 1, name: 'Egg 1', wordRank: 10, rarity: 'common', tierColor: '#38bdf8' });
  eggNestModel.syncBasket(storageService.getGameSave().eggBasket);
  controller.nestView.render(eggNestModel);

  assert.strictEqual(eggNestModel.basket.length, 1);
  assert.ok(!nestHint.classList.contains('visible'));
  assert.ok(!restartBtn.classList.contains('fade-out'));

  // Pressing Tab resets test, stays out of hatch mode
  controller.handleTab();
  assert.strictEqual(eggNestModel.isHatching(), false);

  // 2. Add 2 more eggs (total 3 eggs)
  storageService.addEgg({ id: 2, name: 'Egg 2', wordRank: 20, rarity: 'common', tierColor: '#38bdf8' });
  storageService.addEgg({ id: 3, name: 'Egg 3', wordRank: 30, rarity: 'rare', tierColor: '#c084fc' });
  eggNestModel.syncBasket(storageService.getGameSave().eggBasket);
  controller.nestView.render(eggNestModel);

  assert.strictEqual(eggNestModel.basket.length, 3);
  assert.ok(nestHint.classList.contains('visible'));
  assert.strictEqual(nestHint.textContent, 'tab: hatch');
  assert.ok(restartBtn.classList.contains('fade-out'), 'restart button should fade out when 3 eggs are ready to hatch');

  // Pressing Tab now enters hatch mode!
  controller.handleTab();
  assert.strictEqual(eggNestModel.isHatching(), true);
  assert.strictEqual(nestHint.textContent, "type 'egg' (tab: back)");
  assert.ok(restartBtn.classList.contains('fade-out'));

  // Pressing Tab while hatching exits hatch mode
  controller.handleTab();
  assert.strictEqual(eggNestModel.isHatching(), false);
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL CONTROLLERS TESTS PASSED! 🚀');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  console.log('========================================\n');
  process.exit(1);
}
