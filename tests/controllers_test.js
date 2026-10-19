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
      <div id="test-section"></div>
      <div id="results-section"></div>
      <div id="stats-modal" style="display: none;"></div>
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
    nestHint: document.getElementById('nest-hint')
  });

  const hudView = new HUDView({
    tabClassic: document.getElementById('tab-classic'),
    tabFlow: document.getElementById('tab-flow'),
    timerEl: document.getElementById('timer'),
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
    flowVignetteOverlay: document.getElementById('flow-vignette-overlay')
  });

  const chartView = new ChartView();
  const modalView = new ModalView({
    testSection: document.getElementById('test-section'),
    resultsSection: document.getElementById('results-section'),
    statsModal: document.getElementById('stats-modal')
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

  return { dom, controller, storageService, wordsModel, sessionModel, flowModel, eggNestModel, stageView };
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

  controller.destroy();
  assert.strictEqual(controller.classicTimerInterval, null);
  assert.strictEqual(controller.idleDecayInterval, null);
  assert.strictEqual(controller.physicsAnimFrame, null);
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
