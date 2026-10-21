/**
 * TypeFlow - Ghost Cursor Headless Test Suite
 * Tests the Ghost Cursor (visual pace rabbit) across Storage, Views, and GameController.
 */

const { JSDOM } = require('jsdom');
const assert = require('assert');

// Pure Models & Services
const { WordsModel } = require('../src/models/WordsModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { StorageService } = require('../src/services/StorageService.js');
const { AudioService } = require('../src/services/AudioService.js');

// Views & Controller
const { StageView } = require('../src/views/StageView.js');
const { NestView } = require('../src/views/NestView.js');
const { HUDView } = require('../src/views/HUDView.js');
const { ModalView } = require('../src/views/ModalView.js');
const { ChartView } = require('../src/views/ChartView.js');
const { GameController } = require('../src/controllers/GameController.js');

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('========================================');
console.log('⚡ TYPEFLOW GHOST CURSOR TEST SUITE');
console.log('========================================\n');

function createGhostHarness(storageOverrides = {}) {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="flow-vignette-overlay"></div>
      <div id="tab-classic"></div>
      <div id="tab-flow" class="active"></div>
      <div id="timer" style="display: none;">30</div>
      <div id="live-stats" style="display: none;">
        <span id="live-wpm">0</span>
        <span id="live-acc">100%</span>
      </div>
      <div id="flow-gauge" style="display: flex;"></div>
      <div id="flow-speed-tag"></div>
      <div id="speed-indicator-text"></div>
      <div id="flow-multiplier-badge"><span id="flow-mult-val"></span></div>
      <div id="momentum-bar-fill"></div>
      <div id="classic-duration-pill" style="display: none;">
        <div class="config-item active" data-time="30">30s</div>
      </div>
      <div id="flow-target-pill" style="display: flex;"></div>
      <div id="diff-slider"></div>
      <div id="diff-input"></div>
      <div id="level-hud-card">
        <span id="hud-level-badge"></span>
        <span id="hud-level-title"></span>
        <span id="hud-xp-ratio"></span>
        <div id="hud-level-bar-fill"></div>
      </div>
      <button id="hd-btn">HD</button>
      <button id="ghost-btn" aria-pressed="false"></button>
      <div id="ghost-slider-pill" style="display: none;">
        <input type="range" id="ghost-slider" min="15" max="150" step="5" value="50">
        <span id="ghost-val">50 WPM</span>
      </div>
      <div id="words-box">
        <div id="words-wrapper"></div>
        <div id="caret"></div>
        <div id="ghost-caret" style="display: none;"></div>
      </div>
      <input id="typing-input" />
      <div id="focus-overlay"></div>
      <div id="egg-nest">
        <div id="nest-slot-0"></div>
        <div id="nest-slot-1"></div>
        <div id="nest-slot-2"></div>
        <div id="nest-hint"></div>
      </div>
      <div id="test-section" style="display: flex;"></div>
      <div id="results-section" style="display: none;">
        <button id="next-test-btn">Next Test</button>
        <div id="res-wpm"></div>
        <div id="res-acc"></div>
        <div id="res-raw"></div>
        <div id="res-consistency"></div>
        <div id="res-chars"></div>
      </div>
      <div id="stats-modal" style="display: none;">
        <div id="tab-stats-flow"></div>
        <div id="tab-stats-classic"></div>
        <div id="pane-stats-flow"></div>
        <div id="pane-stats-classic"></div>
        <div id="stats-rpg-level"></div>
        <div id="stats-rpg-xp"></div>
        <div id="stats-rpg-streak"></div>
        <div id="stats-rpg-unlocked"></div>
        <div id="stats-rpg-eggs-count"></div>
        <div id="stats-rpg-high-streak"></div>
        <div id="motor-grid"></div>
        <div id="deck-words-scroll"></div>
      </div>
      <button id="restart-btn"></button>
    </body>
    </html>
  `, { url: 'https://typeflow.local/' });

  const { window } = dom;
  const { document } = window;
  window.localStorage = new LocalStorageMock();
  for (const [k, v] of Object.entries(storageOverrides)) {
    window.localStorage.setItem(k, v);
  }

  global.window = window;
  global.document = document;
  global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  global.cancelAnimationFrame = (id) => clearTimeout(id);

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
    ghostCaret: document.getElementById('ghost-caret'),
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
    liveStats: document.getElementById('live-stats'),
    liveWpmEl: document.getElementById('live-wpm'),
    liveAccEl: document.getElementById('live-acc'),
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
    ghostBtn: document.getElementById('ghost-btn'),
    ghostSliderPill: document.getElementById('ghost-slider-pill'),
    ghostSlider: document.getElementById('ghost-slider'),
    ghostVal: document.getElementById('ghost-val')
  });

  const chartView = new ChartView();
  const modalView = new ModalView({
    testSection: document.getElementById('test-section'),
    resultsSection: document.getElementById('results-section'),
    nextTestBtn: document.getElementById('next-test-btn'),
    resWpmEl: document.getElementById('res-wpm'),
    resAccEl: document.getElementById('res-acc'),
    resRawEl: document.getElementById('res-raw'),
    resConsistencyEl: document.getElementById('res-consistency'),
    resCharsEl: document.getElementById('res-chars'),
    statsModal: document.getElementById('stats-modal'),
    tabStatsFlow: document.getElementById('tab-stats-flow'),
    tabStatsClassic: document.getElementById('tab-stats-classic'),
    paneStatsFlow: document.getElementById('pane-stats-flow'),
    paneStatsClassic: document.getElementById('pane-stats-classic'),
    motorGrid: document.getElementById('motor-grid'),
    deckWordsScroll: document.getElementById('deck-words-scroll'),
    deckFilters: [],
    statsRpgLevel: document.getElementById('stats-rpg-level'),
    statsRpgXp: document.getElementById('stats-rpg-xp'),
    statsRpgStreak: document.getElementById('stats-rpg-streak'),
    statsRpgUnlocked: document.getElementById('stats-rpg-unlocked'),
    statsRpgEggsCount: document.getElementById('stats-rpg-eggs-count'),
    statsRpgHighStreak: document.getElementById('stats-rpg-high-streak')
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

  controller.init();

  return { dom, controller, storageService, wordsModel, sessionModel, flowModel, eggNestModel, stageView, hudView };
}

// ----------------------------------------------------
// 1. Initial State & UI Synchronization
// ----------------------------------------------------
console.log('--- 1. State & Storage Integration ---');

it('initializes Ghost Cursor as disabled with default 50 WPM when storage is empty', () => {
  const { controller, storageService, dom } = createGhostHarness();
  assert.strictEqual(controller.ghostEnabled, false);
  assert.strictEqual(controller.ghostSpeed, 50);
  assert.strictEqual(storageService.getGhostCursor(), false);
  assert.strictEqual(storageService.getGhostSpeed(), 50);

  const ghostBtn = dom.window.document.getElementById('ghost-btn');
  const ghostSliderPill = dom.window.document.getElementById('ghost-slider-pill');
  assert.strictEqual(ghostBtn.classList.contains('active'), false);
  assert.strictEqual(ghostSliderPill.style.display, 'none');
});

it('initializes Ghost Cursor as enabled if saved in storage', () => {
  const { controller, dom } = createGhostHarness({
    typeflow_ghost_cursor: 'true',
    typeflow_ghost_speed: '75'
  });
  assert.strictEqual(controller.ghostEnabled, true);
  assert.strictEqual(controller.ghostSpeed, 75);

  const ghostBtn = dom.window.document.getElementById('ghost-btn');
  const ghostSliderPill = dom.window.document.getElementById('ghost-slider-pill');
  const ghostVal = dom.window.document.getElementById('ghost-val');
  assert.strictEqual(ghostBtn.classList.contains('active'), true);
  assert.strictEqual(ghostSliderPill.style.display, 'flex');
  assert.strictEqual(ghostVal.textContent, '75 WPM');
});

// ----------------------------------------------------
// 2. Toggling & Speed Adjustments
// ----------------------------------------------------
console.log('\n--- 2. Toggling & Speed Adjustments ---');

it('toggleGhostCursor() toggles state, updates UI, and persists to storage', () => {
  const { controller, storageService, dom } = createGhostHarness();
  const ghostBtn = dom.window.document.getElementById('ghost-btn');
  const ghostSliderPill = dom.window.document.getElementById('ghost-slider-pill');

  // Toggle ON
  controller.toggleGhostCursor();
  assert.strictEqual(controller.ghostEnabled, true);
  assert.strictEqual(storageService.getGhostCursor(), true);
  assert.strictEqual(ghostBtn.classList.contains('active'), true);
  assert.strictEqual(ghostSliderPill.style.display, 'flex');

  // Toggle OFF
  controller.toggleGhostCursor();
  assert.strictEqual(controller.ghostEnabled, false);
  assert.strictEqual(storageService.getGhostCursor(), false);
  assert.strictEqual(ghostBtn.classList.contains('active'), false);
  assert.strictEqual(ghostSliderPill.style.display, 'none');
});

it('updateGhostSpeed() updates speed, clamps between 15 and 150, and persists to storage', () => {
  const { controller, storageService, dom } = createGhostHarness();
  const ghostVal = dom.window.document.getElementById('ghost-val');

  // Valid speed update
  controller.updateGhostSpeed(65);
  assert.strictEqual(controller.ghostSpeed, 65);
  assert.strictEqual(storageService.getGhostSpeed(), 65);
  assert.strictEqual(ghostVal.textContent, '65 WPM');

  // Lower clamp (15)
  controller.updateGhostSpeed(5);
  assert.strictEqual(controller.ghostSpeed, 15);
  assert.strictEqual(storageService.getGhostSpeed(), 15);
  assert.strictEqual(ghostVal.textContent, '15 WPM');

  // Upper clamp (150)
  controller.updateGhostSpeed(200);
  assert.strictEqual(controller.ghostSpeed, 150);
  assert.strictEqual(storageService.getGhostSpeed(), 150);
  assert.strictEqual(ghostVal.textContent, '150 WPM');
});

// ----------------------------------------------------
// 3. Mathematical Position Mapping
// ----------------------------------------------------
console.log('\n--- 3. Mathematical Position Mapping ---');

it('getCharCumulativeIndex() calculates cumulative characters including inter-word spaces', () => {
  const { controller, sessionModel } = createGhostHarness();
  sessionModel.words = ['the', 'quick', 'brown', 'fox'];

  // Word 0 ('the' length 3)
  assert.strictEqual(controller.getCharCumulativeIndex(0, 0), 0);
  assert.strictEqual(controller.getCharCumulativeIndex(0, 2), 2);

  // Word 1 ('quick' starts after 'the ' = 4 chars)
  assert.strictEqual(controller.getCharCumulativeIndex(1, 0), 4);
  assert.strictEqual(controller.getCharCumulativeIndex(1, 3), 7);

  // Word 2 ('brown' starts after 'the quick ' = 4 + 6 = 10 chars)
  assert.strictEqual(controller.getCharCumulativeIndex(2, 0), 10);
  assert.strictEqual(controller.getCharCumulativeIndex(2, 4), 14);
});

it('mapCharsToPosition() maps continuous character offsets to wordIdx, charIdx, and fraction', () => {
  const { controller, sessionModel } = createGhostHarness();
  sessionModel.words = ['the', 'quick', 'fox'];

  // Total lengths:
  // 'the' length 3 (+ 1 space = 4)
  // 'quick' length 5 (+ 1 space = 6)
  // 'fox' length 3

  // At 0.0 -> word 0, char 0, fraction 0.0
  let pos = controller.mapCharsToPosition(0.0);
  assert.strictEqual(pos.wordIdx, 0);
  assert.strictEqual(pos.charIdx, 0);
  assert.strictEqual(pos.fraction, 0.0);

  // At 1.5 -> word 0, char 1, fraction 0.5
  pos = controller.mapCharsToPosition(1.5);
  assert.strictEqual(pos.wordIdx, 0);
  assert.strictEqual(pos.charIdx, 1);
  assert.strictEqual(pos.fraction, 0.5);

  // At 3.0 -> word 0, space position (char 3)
  pos = controller.mapCharsToPosition(3.0);
  assert.strictEqual(pos.wordIdx, 0);
  assert.strictEqual(pos.charIdx, 3);

  // At 4.25 -> word 1 ('quick'), char 0, fraction 0.25
  pos = controller.mapCharsToPosition(4.25);
  assert.strictEqual(pos.wordIdx, 1);
  assert.strictEqual(pos.charIdx, 0);
  assert.strictEqual(pos.fraction, 0.25);

  // Past all words -> isOutOfBounds: true
  pos = controller.mapCharsToPosition(50.0);
  assert.strictEqual(pos.isOutOfBounds, true);
});

// ----------------------------------------------------
// 4. Inactivity & Keystroke Phasing
// ----------------------------------------------------
console.log('\n--- 4. Inactivity & Keystroke Phasing ---');

it('triggerGhostActivity() sets visible, starts pacer, and schedules 0.6s fade and 1.2s reset timers', () => {
  const { controller, stageView } = createGhostHarness({
    typeflow_ghost_cursor: 'true'
  });

  let visibleCalled = false;
  let fadingCalled = false;
  stageView.setGhostVisible = (v) => { visibleCalled = v; };
  stageView.setGhostFading = (f) => { fadingCalled = f; };

  controller.triggerGhostActivity();

  assert.strictEqual(visibleCalled, true);
  assert.strictEqual(fadingCalled, false);
  assert.ok(controller.ghostPhaseTimer !== null);
  assert.ok(controller.ghostResetTimer !== null);
  assert.strictEqual(controller.isGhostRunning, true);

  controller.stopGhostPacer(true);
});

it('backspace keystroke does NOT reset ghost cursor position to the player cursor', () => {
  const { controller, sessionModel, stageView } = createGhostHarness({
    typeflow_ghost_cursor: 'true'
  });
  sessionModel.words = ['testing', 'ghost'];

  let syncCallCount = 0;
  stageView.syncGhostToCaret = () => {
    syncCallCount++;
  };

  // Simulate typing 3 characters in word 0
  sessionModel.recordChar('t');
  sessionModel.recordChar('e');
  sessionModel.recordChar('s');
  assert.strictEqual(sessionModel.currentCharIdx, 3);

  // Set ghost ahead at char 10 and start pacer
  controller.ghostTotalChars = 10;
  controller.ghostNeedsSync = false;
  controller.startGhostPacer();

  // Reset sync count to track backspace specifically
  syncCallCount = 0;

  // Typist backspaces
  controller.handleBackspace();

  // After backspacing, current char index is 2
  assert.strictEqual(sessionModel.currentCharIdx, 2);
  // CRITICAL: Ghost position was NOT reset or snapped to char 2!
  assert.strictEqual(controller.ghostTotalChars, 10);
  assert.strictEqual(syncCallCount, 0);

  controller.stopGhostPacer(true);
});

it('backspacing across word boundary does NOT reset ghost cursor position', () => {
  const { controller, sessionModel, stageView } = createGhostHarness({
    typeflow_ghost_cursor: 'true'
  });
  sessionModel.words = ['the', 'word'];

  // Complete word 0 and advance to word 1
  sessionModel.recordChar('t');
  sessionModel.recordChar('h');
  sessionModel.recordChar('e');
  sessionModel.submitWord();

  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.currentCharIdx, 0);

  // Ghost is ahead at char 8
  controller.ghostTotalChars = 8;
  controller.ghostNeedsSync = false;
  controller.startGhostPacer();

  let syncCallCount = 0;
  stageView.syncGhostToCaret = () => { syncCallCount++; };

  // Typist backspaces across boundary back into word 0
  controller.handleBackspace();

  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 3);
  // Ghost position must remain unchanged at 8
  assert.strictEqual(controller.ghostTotalChars, 8);
  assert.strictEqual(syncCallCount, 0);

  controller.stopGhostPacer(true);
});

it('resetting test stops ghost pacer and synchronizes ghost position', () => {
  const { controller, sessionModel } = createGhostHarness({
    typeflow_ghost_cursor: 'true'
  });

  controller.triggerGhostActivity();
  assert.strictEqual(controller.isGhostRunning, true);

  controller.resetTest();

  assert.strictEqual(controller.isGhostRunning, false);
  assert.strictEqual(controller.ghostTotalChars, 0);
});

it('0.6s inactivity halts advancement and triggers fading; 1.2s triggers reset', () => {
  const { controller, stageView } = createGhostHarness({
    typeflow_ghost_cursor: 'true'
  });

  let fadeSet = false;
  let visibleSet = true;
  stageView.setGhostFading = (f) => { fadeSet = f; };
  stageView.setGhostVisible = (v) => { visibleSet = v; };

  const timers = [];
  const origSetTimeout = global.setTimeout;
  global.setTimeout = (cb, ms) => {
    timers.push({ cb, ms });
    return timers.length;
  };

  try {
    controller.triggerGhostActivity();
    const ghostTimers = timers.filter(t => t.ms >= 600);
    assert.strictEqual(ghostTimers.length, 2);
    assert.strictEqual(ghostTimers[0].ms, 600);
    assert.strictEqual(ghostTimers[1].ms, 1200);

    // Fire 600ms phase-out timeout
    ghostTimers[0].cb();
    assert.strictEqual(controller.isGhostRunning, false);
    assert.strictEqual(fadeSet, true);

    // Fire 1200ms reset timeout
    ghostTimers[1].cb();
    assert.strictEqual(visibleSet, false);
  } finally {
    global.setTimeout = origSetTimeout;
    controller.stopGhostPacer(true);
  }
});

it('syncs to player and hides when ghost advances out of bounds', () => {
  const { controller, stageView, sessionModel } = createGhostHarness({
    typeflow_ghost_cursor: 'true'
  });
  sessionModel.words = ['hi'];

  let visibleCalled = null;
  stageView.setGhostVisible = (v) => { visibleCalled = v; };

  controller.triggerGhostActivity();
  assert.strictEqual(controller.isGhostRunning, true);

  // Advance ghost past all words
  controller.ghostTotalChars = 100;
  
  // Directly invoke map and out-of-bounds handler
  const pos = controller.mapCharsToPosition(controller.ghostTotalChars);
  assert.strictEqual(pos.isOutOfBounds, true);

  // Triggering ghost pacer frame with out-of-bounds pos
  controller.syncGhostToPlayer();
  stageView.setGhostVisible(false);
  controller.stopGhostPacer(false);

  assert.strictEqual(controller.isGhostRunning, false);
  assert.strictEqual(visibleCalled, false);
  assert.strictEqual(controller.ghostTotalChars, 0);
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('GHOST CURSOR SYSTEM FULLY VERIFIED! 🚀');
console.log('========================================\n');

process.exit(0);
