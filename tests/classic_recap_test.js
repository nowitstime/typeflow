/**
 * TypeFlow - Classic Mode Records & Graph Inspection Test Suite
 * Tests feature parity with Flow Mode records:
 * - StorageService persistence of classic test timeline (wpmHistory, character counts, lastClassicTest)
 * - ModalView clickable rows (.classic-history-row, onSelectClassicTest)
 * - GameController.openClassicRecap and graph rendering on ChartView
 * - Mode switching when opening classic recap from flow mode and vice versa
 * - Dismissing recap via Next Test button, Tab, Enter, and Escape
 * - KeyboardController finished screen handling during classic recap
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');
const { StorageService } = require('../src/services/StorageService.js');
const { ModalView } = require('../src/views/ModalView.js');
const { ChartView } = require('../src/views/ChartView.js');
const { KeyboardController } = require('../src/controllers/KeyboardController.js');
const { GameController } = require('../src/controllers/GameController.js');
const { WordsModel } = require('../src/models/WordsModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { StageView } = require('../src/views/StageView.js');
const { NestView } = require('../src/views/NestView.js');
const { HUDView } = require('../src/views/HUDView.js');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(err);
    process.exitCode = 1;
  }
}

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
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

class MockCanvasContext {
  clearRect() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  fill() {}
  arc() {}
  fillText() {}
  scale() {}
  save() {}
  restore() {}
  closePath() {}
  setLineDash() {}
  createLinearGradient() {
    return { addColorStop() {} };
  }
}

console.log('\n========================================');
console.log('⚡ CLASSIC MODE RECORDS & GRAPH PARITY TEST SUITE');
console.log('========================================');

// --- 1. StorageService Classic Records Persistence ---
console.log('\n--- 1. StorageService Classic Records ---');

it('stores full telemetry including wpmHistory, character counts, and lastClassicTest', () => {
  const storage = new StorageService(new LocalStorageMock());

  const mockTimeline = [
    { second: 1, time: 1, wpm: 45, rawWpm: 50, raw: 50, burstWpm: 45, errors: 0, fixed: 0 },
    { second: 2, time: 2, wpm: 75, rawWpm: 80, raw: 80, burstWpm: 85, errors: 1, fixed: 1 }
  ];

  const stats = storage.recordClassicTest(
    30, // duration
    75, // wpm
    80, // rawWpm
    98, // acc
    92, // consistency
    350, // keystrokes
    35,  // wordsCount
    {
      correctChars: 345,
      incorrectChars: 5,
      extraChars: 2,
      missedChars: 0,
      fixedErrors: 1,
      wpmHistory: mockTimeline
    }
  );

  assert.ok(stats, 'recordClassicTest should return stats');
  assert.strictEqual(stats.totalTests, 1);
  assert.strictEqual(stats.recentHistory.length, 1);

  const entry = stats.recentHistory[0];
  assert.strictEqual(entry.mode, 'classic');
  assert.strictEqual(entry.wpm, 75);
  assert.strictEqual(entry.rawWpm, 80);
  assert.strictEqual(entry.acc, 98);
  assert.strictEqual(entry.correctChars, 345);
  assert.strictEqual(entry.incorrectChars, 5);
  assert.strictEqual(entry.fixedErrors, 1);
  assert.strictEqual(entry.wpmHistory.length, 2);
  assert.strictEqual(entry.wpmHistory[0].wpm, 45);

  const lastTest = storage.getLastClassicTest();
  assert.ok(lastTest, 'getLastClassicTest should return the recorded entry');
  assert.strictEqual(lastTest.wpm, 75);
  assert.strictEqual(lastTest.wpmHistory.length, 2);

  const history = storage.getClassicHistory();
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].wpm, 75);
});

// --- 2. ModalView Classic Records Table ---
console.log('\n--- 2. ModalView Classic Records Table ---');

it('renders classic records as clickable rows with classic-history-row class and invokes onSelectClassicTest', () => {
  const dom = new JSDOM(`
    <div id="stats-modal">
      <table id="classic-history-table">
        <tbody id="stats-history-tbody"></tbody>
      </table>
    </div>
  `);

  const tbody = dom.window.document.getElementById('stats-history-tbody');
  const modal = new ModalView({
    statsModal: dom.window.document.getElementById('stats-modal'),
    classicHistoryTbody: tbody
  });

  const sampleStats = {
    personalBests: {},
    recentHistory: [
      {
        id: 101,
        date: 'Oct 30, 12:00',
        duration: 30,
        wpm: 85,
        rawWpm: 90,
        acc: 97,
        wpmHistory: [{ second: 1, wpm: 85, raw: 90, errors: 0, fixed: 0 }]
      },
      {
        id: 102,
        date: 'Oct 30, 12:05',
        duration: 15,
        wpm: 105,
        rawWpm: 110,
        acc: 100,
        wpmHistory: [{ second: 1, wpm: 105, raw: 110, errors: 0, fixed: 0 }]
      }
    ]
  };

  let selectedTest = null;
  modal.renderClassicStats(sampleStats, (item) => {
    selectedTest = item;
  });

  const rows = tbody.querySelectorAll('tr');
  assert.strictEqual(rows.length, 2);

  const firstRow = rows[0];
  assert.ok(firstRow.classList.contains('classic-history-row'), 'Row must have classic-history-row class');
  assert.strictEqual(firstRow.style.cursor, 'pointer');
  assert.strictEqual(firstRow.title, 'Click to inspect this Classic Test on the timeline graph');
  assert.ok(firstRow.innerHTML.includes('85 WPM'));

  // Simulate click on second row
  rows[1].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  assert.ok(selectedTest, 'onSelectClassicTest should be invoked');
  assert.strictEqual(selectedTest.id, 102);
  assert.strictEqual(selectedTest.wpm, 105);
});

// --- 3. GameController Classic Recap Integration ---
console.log('\n--- 3. GameController Classic Recap Integration ---');

function createClassicHarness() {
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
      <div id="test-section" style="display: flex;"></div>
      <div id="results-section" style="display: none;">
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
      <canvas id="wpm-chart"></canvas>
      <div id="chart-tooltip">
        <div id="tooltip-time"></div>
        <div id="tooltip-wpm"></div>
        <div id="tooltip-pace"></div>
        <div id="tooltip-raw"></div>
        <div id="tooltip-err-row"></div>
      </div>
      <div id="chart-hover-stats"></div>
      <button id="hd-btn"></button>
      <button id="mods-btn" aria-expanded="false"></button>
      <div id="mods-popover" style="display: none;"></div>
      <button id="mods-close-btn"></button>
      <button id="restart-btn"><span id="restart-btn-label">tab</span></button>
      <div id="stats-modal" style="display: none;">
        <table><tbody id="flow-history-tbody"></tbody></table>
        <table id="classic-history-table"><tbody id="stats-history-tbody"></tbody></table>
      </div>
    </body>
    </html>
  `, { url: 'https://typeflow.local/' });

  const { window } = dom;
  const { document } = window;
  window.localStorage = new LocalStorageMock();

  const chartCanvas = document.getElementById('wpm-chart');
  chartCanvas.getContext = () => new MockCanvasContext();

  const wordsModel = new WordsModel();
  const sessionModel = new SessionModel();
  const flowModel = new FlowModel();
  const eggNestModel = new EggNestModel();
  const storageService = new StorageService(window.localStorage);

  const stageView = new StageView({
    wordsBox: document.getElementById('words-box'),
    wordsWrapper: document.getElementById('words-wrapper'),
    caret: document.getElementById('caret'),
    typingInput: document.getElementById('typing-input'),
    focusOverlay: document.getElementById('focus-overlay')
  });

  const nestView = new NestView({
    eggNest: document.getElementById('egg-nest'),
    nestSlots: [
      document.getElementById('nest-slot-0'),
      document.getElementById('nest-slot-1'),
      document.getElementById('nest-slot-2')
    ],
    nestHint: document.getElementById('nest-hint'),
    flowRecapPill: document.getElementById('flow-recap-pill'),
    flowRecapPillText: document.getElementById('flow-recap-pill-text')
  });

  const hudView = new HUDView({
    flowVignetteOverlay: document.getElementById('flow-vignette-overlay'),
    tabClassic: document.getElementById('tab-classic'),
    tabFlow: document.getElementById('tab-flow'),
    timer: document.getElementById('timer'),
    flowGauge: document.getElementById('flow-gauge'),
    flowSpeedTag: document.getElementById('flow-speed-tag'),
    speedIndicatorText: document.getElementById('speed-indicator-text'),
    flowMultiplierBadge: document.getElementById('flow-multiplier-badge'),
    momentumBarFill: document.getElementById('momentum-bar-fill'),
    classicDurationPill: document.getElementById('classic-duration-pill'),
    flowTargetPill: document.getElementById('flow-target-pill'),
    diffSlider: document.getElementById('diff-slider'),
    diffInput: document.getElementById('diff-input'),
    hudLevelBadge: document.getElementById('hud-level-badge'),
    hudLevelTitle: document.getElementById('hud-level-title'),
    hudXpRatio: document.getElementById('hud-xp-ratio'),
    hudLevelBarFill: document.getElementById('hud-level-bar-fill')
  });

  const chartView = new ChartView({
    chartCanvas,
    chartTooltip: document.getElementById('chart-tooltip'),
    tooltipTime: document.getElementById('tooltip-time'),
    tooltipWpm: document.getElementById('tooltip-wpm'),
    tooltipPace: document.getElementById('tooltip-pace'),
    tooltipRaw: document.getElementById('tooltip-raw'),
    tooltipErrRow: document.getElementById('tooltip-err-row'),
    chartHoverStats: document.getElementById('chart-hover-stats')
  });

  const modalView = new ModalView({
    testSection: document.getElementById('test-section'),
    resultsSection: document.getElementById('results-section'),
    statsModal: document.getElementById('stats-modal'),
    resWpmEl: document.getElementById('res-wpm'),
    resAccEl: document.getElementById('res-acc'),
    resRawEl: document.getElementById('res-raw'),
    resCharsEl: document.getElementById('res-chars'),
    resFixedEl: document.getElementById('res-fixed'),
    resFixedDetailEl: document.getElementById('res-fixed-detail'),
    resConsistencyEl: document.getElementById('res-consistency'),
    resTimeEl: document.getElementById('res-time'),
    resTimeDetailEl: document.getElementById('res-time-detail'),
    nextTestBtnLabel: document.getElementById('next-test-btn-label'),
    nextTestBtnHint: document.getElementById('next-test-btn-hint'),
    classicHistoryTbody: document.getElementById('stats-history-tbody'),
    flowHistoryTbody: document.getElementById('flow-history-tbody')
  });

  const controller = new GameController({
    wordsModel,
    sessionModel,
    flowModel,
    eggNestModel,
    storageService,
    audioService: { init() {}, playKey() {}, toggle() { return false; }, isEnabled() { return false; } },
    stageView,
    nestView,
    hudView,
    chartView,
    modalView
  });

  return { dom, controller, storageService, modalView, chartView, sessionModel };
}

it('opens classic recap and renders timeline graph when selecting a classic record', () => {
  const { dom, controller, storageService, modalView, chartView } = createClassicHarness();
  controller.init();

  const mockTimeline = [
    { second: 1, time: 1, wpm: 60, rawWpm: 65, raw: 65, burstWpm: 60, errors: 0, fixed: 0 },
    { second: 2, time: 2, wpm: 90, rawWpm: 95, raw: 95, burstWpm: 90, errors: 0, fixed: 0 }
  ];

  storageService.recordClassicTest(30, 90, 95, 99, 94, 450, 45, {
    wpmHistory: mockTimeline,
    correctChars: 445,
    incorrectChars: 5,
    fixedErrors: 2
  });

  // Open stats modal and select the classic test
  controller.openStats('classic');
  const tbody = modalView.classicHistoryTbody;
  const rows = tbody.querySelectorAll('tr');
  assert.strictEqual(rows.length, 1);

  let renderedHistory = null;
  chartView.render = (wpmHistory) => {
    renderedHistory = wpmHistory;
  };

  // Click the record row
  rows[0].dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

  assert.strictEqual(controller.currentMode, 'classic');
  assert.strictEqual(controller.isClassicRecapVisible, true);
  assert.strictEqual(modalView.resultsSection.classList.contains('visible'), true);
  assert.strictEqual(modalView.resWpmEl.textContent, '90');
  assert.strictEqual(modalView.resAccEl.textContent, '99%');
  assert.strictEqual(modalView.resCharsEl.textContent, '445/5/0/0');
  assert.strictEqual(modalView.resFixedEl.textContent, '2');

  assert.ok(renderedHistory, 'Chart must be rendered');
  assert.strictEqual(renderedHistory.length, 2);
  assert.strictEqual(renderedHistory[1].wpm, 90);
  controller.destroy();
});

it('switches to classic mode if clicked from flow mode stats view', () => {
  const { dom, controller, storageService, modalView, chartView } = createClassicHarness();
  controller.init();
  controller.switchMode('flow');
  assert.strictEqual(controller.currentMode, 'flow');

  storageService.recordClassicTest(15, 110, 115, 100, 95, 200, 20, {
    wpmHistory: [{ second: 1, time: 1, wpm: 110, rawWpm: 115, raw: 115, burstWpm: 110, errors: 0, fixed: 0 }]
  });

  controller.openStats('classic');
  const row = modalView.classicHistoryTbody.querySelector('tr');
  assert.ok(row, 'Row should exist');

  let chartCalled = false;
  chartView.render = () => { chartCalled = true; };

  row.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

  assert.strictEqual(controller.currentMode, 'classic', 'Must switch mode to classic');
  assert.strictEqual(controller.isClassicRecapVisible, true);
  assert.strictEqual(chartCalled, true);
  controller.destroy();
});

it('dismisses classic recap when Next Test is triggered', () => {
  const { controller, storageService } = createClassicHarness();
  controller.init();

  const record = {
    duration: 30,
    wpm: 80,
    rawWpm: 85,
    acc: 95,
    wpmHistory: [{ second: 1, time: 1, wpm: 80, raw: 85, errors: 0, fixed: 0 }]
  };

  controller.openClassicRecap(record);
  assert.strictEqual(controller.isClassicRecapVisible, true);

  controller.dismissClassicRecap();
  assert.strictEqual(controller.isClassicRecapVisible, false);
  assert.strictEqual(controller.modalView.resultsSection.classList.contains('visible'), false);
  assert.strictEqual(controller.modalView.testSection.style.display, 'flex');
  controller.destroy();
});

it('generates fallback timeline for legacy records that lack wpmHistory', () => {
  const { controller, chartView } = createClassicHarness();
  controller.init();

  const legacyRecord = {
    duration: 15,
    wpm: 70,
    rawWpm: 75,
    acc: 95
  };

  let renderedHistory = null;
  chartView.render = (history) => {
    renderedHistory = history;
  };

  controller.openClassicRecap(legacyRecord);
  assert.strictEqual(controller.isClassicRecapVisible, true);
  assert.ok(renderedHistory, 'Should generate fallback history');
  assert.strictEqual(renderedHistory.length, 15);
  assert.strictEqual(renderedHistory[0].wpm, 70);
  assert.strictEqual(renderedHistory[14].second, 15);
  controller.destroy();
});

it('KeyboardController treats isClassicRecapOpen as finished screen preventing space restart', () => {
  let isClassicRecapOpen = true;
  let spaceTriggered = false;
  let enterTriggered = false;

  const kb = new KeyboardController({
    isClassicRecapOpen: () => isClassicRecapOpen,
    isTestFinished: () => false,
    onSpace: () => { spaceTriggered = true; },
    onEnterFinished: () => { enterTriggered = true; }
  });

  kb.handleKeyDown({ key: ' ', preventDefault() {} });
  assert.strictEqual(spaceTriggered, false, 'Spacebar must not trigger when classic recap is open');

  kb.handleKeyDown({ key: 'Enter', preventDefault() {} });
  assert.strictEqual(enterTriggered, true, 'Enter key must trigger onEnterFinished to dismiss/restart');
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL CLASSIC RECAP & GRAPH PARITY TESTS PASSED! 🚀');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  console.log('========================================\n');
  process.exit(1);
}
