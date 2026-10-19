/**
 * TypeFlow - Edge Cases & Stress Test Suite
 * Deep validation for:
 * 1. Classic Mode 10,000-Word Frequency-Weighted Distribution & Anti-Clumping
 * 2. Graph Error Timeline Profiles (Flawless, Quick Fix, Delayed Fix, Unfixed, Multi-Error)
 * 3. In-Situ Egg Nest Multi-Hatch Progression & Playfield Refresh Boundaries
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

const { WordsModel, RAW_WORDS_LIST } = require('../src/models/WordsModel.js');
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
console.log('⚡ TYPEFLOW EDGE CASES & STRESS TEST SUITE');
console.log('========================================\n');

// -------------------------------------------------------------
// PART 1: CLASSIC MODE 10,000-WORD DISTRIBUTION & ANTI-CLUMPING
// -------------------------------------------------------------
console.log('--- Part 1: Classic Mode Word Distribution ---');

it('generates 10,000 words with zero adjacent repeats and proper frequency gradient', () => {
  const wordsModel = new WordsModel();
  const sampleSize = 10000;
  const words = [];

  // Generate in batches of 70 (like the game does)
  while (words.length < sampleSize) {
    words.push(...wordsModel.generateClassicBatch(70));
  }

  // 1. Anti-clumping check: NO adjacent identical words
  for (let i = 1; i < words.length; i++) {
    assert.notStrictEqual(words[i], words[i - 1], `Found duplicate adjacent word: "${words[i]}" at index ${i}`);
  }

  // 2. Vocabulary richness: unique words count across 10,000 sampled
  const uniqueWords = new Set(words);
  // With 1,000 words in dictionary and power-law distribution, 10,000 samples should cover almost the entire dictionary (>800 unique words)
  assert.ok(uniqueWords.size >= 800, `Expected at least 800 unique words in 10,000 samples, got ${uniqueWords.size}`);

  // 3. Frequency gradient: Rank 1-100 words should appear more frequently than 901-1000 words
  const rankCounts = { top100: 0, mid101_350: 0, rare351_700: 0, epic701_1000: 0 };
  const rawWordIndexMap = new Map();
  RAW_WORDS_LIST.forEach((w, idx) => rawWordIndexMap.set(w, idx + 1));

  for (const w of words) {
    const rank = rawWordIndexMap.get(w) || 1000;
    if (rank <= 100) rankCounts.top100++;
    else if (rank <= 350) rankCounts.mid101_350++;
    else if (rank <= 700) rankCounts.rare351_700++;
    else rankCounts.epic701_1000++;
  }

  // Verify monotonic gradient across tier buckets
  assert.ok(rankCounts.top100 > rankCounts.mid101_350, `top100 (${rankCounts.top100}) should exceed mid (${rankCounts.mid101_350})`);
  assert.ok(rankCounts.mid101_350 > rankCounts.rare351_700, `mid (${rankCounts.mid101_350}) should exceed rare (${rankCounts.rare351_700})`);
  assert.ok(rankCounts.rare351_700 > rankCounts.epic701_1000, `rare (${rankCounts.rare351_700}) should exceed epic (${rankCounts.epic701_1000})`);
  assert.ok(rankCounts.epic701_1000 >= 200, `epic tier must have presence (~3% under Option A), got ${rankCounts.epic701_1000}`);
});

// -------------------------------------------------------------
// PART 2: GRAPH ERROR TIMELINE PROFILES
// -------------------------------------------------------------
console.log('\n--- Part 2: Graph Error Timeline Profiles ---');

it('Profile A (Flawless Typist): 60 seconds with 0 errors renders 0 error markers', () => {
  const session = new SessionModel({ mode: 'classic', duration: 60 });
  session.start(1000);

  for (let s = 1; s <= 60; s++) {
    // Type 5 clean characters per second
    for (let c = 0; c < 5; c++) {
      session.recordChar('a', true, false, 1000 + s * 1000 + c * 100);
    }
    session.tickTimer(1000 + s * 1000);
  }

  assert.strictEqual(session.wpmHistory.length, 60);
  const errorPoints = session.wpmHistory.filter(pt => pt.errors > 0);
  assert.strictEqual(errorPoints.length, 0, 'Flawless typist should have 0 error points');
});

it('Profile B (Stumble & Quick Fix): typo in second 5 fixed in second 5', () => {
  const session = new SessionModel({ mode: 'classic', duration: 30 });
  session.start(1000);

  for (let s = 1; s <= 10; s++) {
    const t = 1000 + s * 1000;
    if (s === 5) {
      session.recordChar('c', true, false, t + 100);
      session.recordChar('x', false, false, t + 200); // Typo!
      session.recordBackspace(true, t + 300); // Quick fix!
      session.recordChar('a', true, false, t + 400);
      session.recordChar('t', true, false, t + 500);
    } else {
      for (let c = 0; c < 5; c++) session.recordChar('a', true, false, t + c * 100);
    }
    session.tickTimer(t);
  }

  // Exactly second 5 (index 4) should have errors = 1 and fixed = 1
  assert.strictEqual(session.wpmHistory[4].errors, 1);
  assert.strictEqual(session.wpmHistory[4].fixed, 1);

  // All other seconds must have errors = 0
  for (let i = 0; i < 10; i++) {
    if (i !== 4) {
      assert.strictEqual(session.wpmHistory[i].errors, 0, `Second ${i + 1} must have 0 errors`);
    }
  }
});

it('Profile C (Stumble & Delayed Fix): typo in second 5, fixed in second 6 across tick boundary', () => {
  const session = new SessionModel({ mode: 'classic', duration: 30 });
  session.start(1000);

  for (let s = 1; s <= 10; s++) {
    const t = 1000 + s * 1000;
    if (s === 5) {
      session.recordChar('c', true, false, t + 100);
      session.recordChar('x', false, false, t + 200); // Typo at 5.2s!
      // Timer ticks before user fixes it!
    } else if (s === 6) {
      // User fixes it in second 6!
      session.recordBackspace(true, t + 100); // Delayed fix!
      session.recordChar('a', true, false, t + 200);
      session.recordChar('t', true, false, t + 300);
    } else {
      for (let c = 0; c < 5; c++) session.recordChar('a', true, false, t + c * 100);
    }
    session.tickTimer(t);
  }

  // Second 5 (index 4) had the error, and because it was back-propagated on fix, fixed = 1
  assert.strictEqual(session.wpmHistory[4].errors, 1);
  assert.strictEqual(session.wpmHistory[4].fixed, 1, 'Second 5 error must be updated to fixed = 1');

  // Second 6 (index 5) had NO new errors
  assert.strictEqual(session.wpmHistory[5].errors, 0, 'Second 6 must have 0 errors');

  // All other seconds have 0 errors
  const errorsTotal = session.wpmHistory.reduce((acc, pt) => acc + pt.errors, 0);
  assert.strictEqual(errorsTotal, 1, 'Only 1 error should exist in the entire history');
});

it('Profile D (Unfixed Error): typo in second 3 never repaired stays red unfixed', () => {
  const session = new SessionModel({ mode: 'classic', duration: 10 });
  session.start(1000);

  for (let s = 1; s <= 10; s++) {
    const t = 1000 + s * 1000;
    if (s === 3) {
      session.recordChar('z', false, false, t + 100); // Unfixed error
    } else {
      for (let c = 0; c < 5; c++) session.recordChar('a', true, false, t + c * 100);
    }
    session.tickTimer(t);
  }

  assert.strictEqual(session.wpmHistory[2].errors, 1);
  assert.strictEqual(session.wpmHistory[2].fixed, 0, 'Should remain unfixed');

  // Subsequent seconds must NOT inherit the error
  for (let i = 3; i < 10; i++) {
    assert.strictEqual(session.wpmHistory[i].errors, 0, `Second ${i + 1} must have 0 errors`);
  }
});

it('Profile E (Multi-Error Second): 3 errors in second 4, 1 fixed, 2 unfixed', () => {
  const session = new SessionModel({ mode: 'classic', duration: 10 });
  session.start(1000);

  for (let s = 1; s <= 10; s++) {
    const t = 1000 + s * 1000;
    if (s === 4) {
      session.recordChar('x', false, false, t + 100); // error 1
      session.recordBackspace(true, t + 150); // fix 1
      session.recordChar('y', false, false, t + 200); // error 2
      session.recordChar('z', false, false, t + 300); // error 3
    } else {
      for (let c = 0; c < 5; c++) session.recordChar('a', true, false, t + c * 100);
    }
    session.tickTimer(t);
  }

  assert.strictEqual(session.wpmHistory[3].errors, 3);
  assert.strictEqual(session.wpmHistory[3].fixed, 1);
  assert.strictEqual(session.wpmHistory[4].errors, 0);
});

// -------------------------------------------------------------
// PART 3: IN-SITU EGG NEST MULTI-HATCH & BOUNDARIES
// -------------------------------------------------------------
console.log('\n--- Part 3: Egg Nest In-Situ Multi-Hatch Lifecycle ---');

function createHarness() {
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
  const audioService = new AudioService({ audioContextClass: null });

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

  return { controller, storageService, wordsModel, sessionModel, eggNestModel, stageView };
}

it('sequentially hatches multiple eggs (egg 1 then egg 2) without premature exit', () => {
  const { controller, storageService, eggNestModel } = createHarness();
  controller.init();

  // Add 2 eggs to basket
  storageService.addEgg({ id: 1, name: 'Egg A', wordRank: 50, rarity: 'uncommon', tierColor: '#34d399' });
  storageService.addEgg({ id: 2, name: 'Egg B', wordRank: 120, rarity: 'rare', tierColor: '#c084fc' });
  eggNestModel.syncBasket(storageService.getGameSave().eggBasket);

  assert.strictEqual(eggNestModel.basket.length, 2);

  // Enter hatch mode
  controller.enterHatchMode(0);
  assert.strictEqual(eggNestModel.hatchingSlotIndex, 0);

  // Hatch egg 0 ('e', 'g', 'g')
  controller.handleHatchChar('e');
  controller.handleHatchChar('g');
  controller.handleHatchChar('g');

  // Egg 0 should be hatched, and focus should automatically shift to next unhatched slot
  assert.strictEqual(eggNestModel.basket.length, 1);
  assert.strictEqual(eggNestModel.isHatching(), true, 'Should still be hatching egg 2');
  assert.strictEqual(eggNestModel.hatchingSlotIndex, 1, 'Should focus slot 1');

  // Hatch egg 1 ('e', 'g', 'g')
  controller.handleHatchChar('e');
  controller.handleHatchChar('g');
  controller.handleHatchChar('g');

  // Both eggs hatched! Basket empty
  assert.strictEqual(eggNestModel.basket.length, 0);
  assert.strictEqual(eggNestModel.hatchingSlotIndex, -1, 'All eggs cracked');
});

it('escape key cancels hatch mode and cleanly refreshes stage words', () => {
  const { controller, sessionModel, storageService, eggNestModel } = createHarness();
  controller.init();

  storageService.addEgg({ id: 1, name: 'Egg', wordRank: 50, rarity: 'common', tierColor: '#38bdf8' });
  eggNestModel.syncBasket(storageService.getGameSave().eggBasket);

  controller.enterHatchMode(0);
  assert.strictEqual(eggNestModel.isHatching(), true);

  // Hit Escape
  controller.handleEscape();
  assert.strictEqual(eggNestModel.isHatching(), false);
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL EDGE CASES & STRESS TESTS PASSED! 🚀');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  console.log('========================================\n');
  process.exit(1);
}
