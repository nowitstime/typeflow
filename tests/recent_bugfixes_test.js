/**
 * TypeFlow - Recent Bug Fixes Verification Test Suite
 * Tests the three specific user bug reports:
 * 1. Timer display on transition from results screen to new classic test (never 0, always duration)
 * 2. Backspacing into previous word in Classic Mode to fix typos after pressing space
 * 3. Active deck view under Stats displays proper category tags and tier names without "undefined"
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
    throw err;
  }
}

console.log('\n========================================');
console.log('⚡ TYPEFLOW RECENT BUG FIXES TEST SUITE');
console.log('========================================\n');

function createBugfixHarness() {
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
        <div class="config-item" data-time="15">15s</div>
        <div class="config-item" data-time="60">60s</div>
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
      <button id="ghost-btn"></button>
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
        <div class="deck-filter-btn active" data-filter="all">All</div>
        <div class="deck-filter-btn" data-filter="HOME_CORE">Home Core</div>
        <div class="deck-filter-btn" data-filter="ALTERNATING">Alternator</div>
        <div class="deck-filter-btn" data-filter="SUFFIX_CURL">Suffixes</div>
        <div class="deck-filter-btn" data-filter="REACH_PINKY">Reaches</div>
        <div class="deck-filter-btn" data-filter="DOUBLE_BOUNCE">Bounces</div>
        <div id="deck-words-scroll"></div>
      </div>
      <button id="restart-btn"></button>
    </body>
    </html>
  `, { url: 'https://typeflow.local/' });

  const { window } = dom;
  const { document } = window;
  window.localStorage = new LocalStorageMock();

  global.window = window;
  global.document = document;

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
    flowVignetteOverlay: document.getElementById('flow-vignette-overlay')
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
    deckFilters: Array.from(document.querySelectorAll('.deck-filter-btn')),
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

  return { dom, controller, storageService, wordsModel, sessionModel, flowModel, eggNestModel, stageView, hudView, modalView };
}

// ----------------------------------------------------
// Bug 1: Timer Display on Reset and Transition
// ----------------------------------------------------
console.log('--- Bug 1: Timer Display on Transition & Reset ---');

it('timer immediately shows duration (30) when switching to Classic mode', () => {
  const { controller, hudView } = createBugfixHarness();
  controller.switchMode('classic');
  assert.strictEqual(hudView.timerEl.textContent, '30');
  assert.strictEqual(hudView.timerEl.style.display, 'block');
});

it('timer shows selected duration when duration buttons are toggled', () => {
  const { controller, hudView, sessionModel } = createBugfixHarness();
  controller.switchMode('classic');

  sessionModel.duration = 15;
  controller.resetTest();
  assert.strictEqual(hudView.timerEl.textContent, '15');

  sessionModel.duration = 60;
  controller.resetTest();
  assert.strictEqual(hudView.timerEl.textContent, '60');
});

it('timer displays duration (not 0) when transitioning from Results screen to New Classic Test', () => {
  const { controller, hudView, modalView, sessionModel, dom } = createBugfixHarness();
  controller.switchMode('classic');
  sessionModel.duration = 30;
  controller.resetTest();

  // Simulate test ending at timer = 0
  controller.sessionModel.timeLeft = 0;
  controller.sessionModel.isFinished = true;
  controller.hudView.updateTimer(0);
  controller.modalView.showClassicResults({ wpm: 60, accuracy: 100, rawWpm: 60, correctChars: 100, incorrectChars: 0, duration: 30 });

  assert.strictEqual(hudView.timerEl.textContent, '0');
  assert.ok(modalView.resultsSection.classList.contains('visible'));

  // Player clicks "Next Test"
  const nextTestBtn = dom.window.document.getElementById('next-test-btn');
  // Set lastTestFinishedTime in the past so throttle passes
  controller.lastTestFinishedTime = Date.now() - 1000;
  nextTestBtn.click();

  // Timer must immediately show 30 and results must be hidden
  assert.strictEqual(hudView.timerEl.textContent, '30');
  assert.strictEqual(modalView.resultsSection.classList.contains('visible'), false);
});

// ----------------------------------------------------
// Bug 2: Backspace to Previous Word in Classic Mode
// ----------------------------------------------------
console.log('\n--- Bug 2: Backspace into Previous Word in Classic Mode ---');

it('allows backspacing from start of next word into previous completed word', () => {
  const { controller, sessionModel, stageView } = createBugfixHarness();
  controller.switchMode('classic');
  sessionModel.setWords(['first', 'second', 'third']);
  stageView.renderWords(['first', 'second', 'third']);
  stageView.updateCaret(0, 0);

  // Type "first" and hit space
  'first'.split('').forEach(ch => controller.handleChar(ch));
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 5);

  controller.handleSpace();
  // Now advanced to word 1 ("second") at index 0
  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
  assert.ok(stageView.wordElements[1].classList.contains('active'));
  assert.ok(!stageView.wordElements[0].classList.contains('active'));

  // Player hits backspace at index 0 of "second"
  controller.handleBackspace();

  // Must revert to word 0 ("first") at index 5!
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 5);
  assert.ok(stageView.wordElements[0].classList.contains('active'));
  assert.ok(!stageView.wordElements[1].classList.contains('active'));
});

it('allows typist to fix an error in previous word and clear error state', () => {
  const { controller, sessionModel, stageView } = createBugfixHarness();
  controller.switchMode('classic');
  sessionModel.setWords(['cat', 'dog']);
  stageView.renderWords(['cat', 'dog']);
  stageView.updateCaret(0, 0);

  // Typist makes a typo on "cat" -> types "cax"
  controller.handleChar('c');
  controller.handleChar('a');
  controller.handleChar('x'); // error at charIdx 2
  controller.handleSpace();

  // Word 0 is submitted with error
  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
  assert.ok(stageView.wordElements[0].classList.contains('error'));

  // Typist hits backspace to jump back to "cat"
  controller.handleBackspace();
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 3);

  // Typist backspaces the 'x'
  controller.handleBackspace();
  assert.strictEqual(sessionModel.currentCharIdx, 2);

  // Typist types the correct letter 't'
  controller.handleChar('t');
  assert.strictEqual(sessionModel.currentCharIdx, 3);

  // Typist hits space to re-submit
  controller.handleSpace();

  // Word 0 error underline must now be cleared!
  assert.ok(!stageView.wordElements[0].classList.contains('error'));
  assert.strictEqual(sessionModel.currentWordIdx, 1);
});

it('allows backspacing from start of next word into previous completed word in Flow Mode', () => {
  const { controller, sessionModel, stageView } = createBugfixHarness();
  controller.switchMode('flow');
  sessionModel.setWords(['flow', 'state']);
  stageView.renderWords(['flow', 'state']);
  stageView.updateCaret(0, 0);

  // Type "flow" and hit space
  'flow'.split('').forEach(ch => controller.handleChar(ch));
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 4);

  controller.handleSpace();
  // Now advanced to word 1 ("state") at index 0
  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.currentCharIdx, 0);
  assert.ok(stageView.wordElements[1].classList.contains('active'));

  // Player hits backspace at index 0 of "state" in Flow Mode
  controller.handleBackspace();

  // Must revert to word 0 ("flow") at index 4!
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 4);
  assert.ok(stageView.wordElements[0].classList.contains('active'));
  assert.ok(!stageView.wordElements[1].classList.contains('active'));
});

it('unrolls missed letter penalties when reverting and fixing a short-submitted word', () => {
  const { controller, sessionModel, stageView } = createBugfixHarness();
  controller.switchMode('classic');
  sessionModel.setWords(['hello', 'world']);
  stageView.renderWords(['hello', 'world']);

  // Typist types "hel" (omits 'lo') and hits space
  'hel'.split('').forEach(ch => controller.handleChar(ch));
  controller.handleSpace();

  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.missedCharsCount, 2);
  const missedCountBefore = sessionModel.missedCharsCount;
  assert.strictEqual(missedCountBefore, 2);

  // Typist hits backspace to go back and finish the word
  controller.handleBackspace();
  assert.strictEqual(sessionModel.currentWordIdx, 0);
  assert.strictEqual(sessionModel.currentCharIdx, 3);
  // Missed chars penalty must be completely unrolled
  assert.strictEqual(sessionModel.missedCharsCount, 0);

  // Typist finishes "lo" and hits space
  controller.handleChar('l');
  controller.handleChar('o');
  controller.handleSpace();

  assert.strictEqual(sessionModel.currentWordIdx, 1);
  assert.strictEqual(sessionModel.missedCharsCount, 0);
  assert.ok(!stageView.wordElements[0].classList.contains('error'));
});

// ----------------------------------------------------
// Bug 3: Active Deck View Under Stats
// ----------------------------------------------------
console.log('\n--- Bug 3: Active Deck View Under Stats & Categories ---');

it('renders active deck words with proper category tags and tier badges without "undefined"', () => {
  const { controller, modalView, dom } = createBugfixHarness();
  const unlockedRanks = [1, 2, 3, 105, 360, 750]; // Sample across Common, Uncommon, Rare, Epic
  controller.storageService.saveGameSave({
    ...controller.storageService.getGameSave(),
    unlockedRanks
  });

  // Open stats modal in Flow tab
  controller.openStats('flow');

  const chips = Array.from(dom.window.document.querySelectorAll('.deck-word-chip'));
  assert.ok(chips.length >= 6, `Expected at least 6 chips, found ${chips.length}`);

  chips.forEach((chip, i) => {
    const text = chip.textContent;
    // CRITICAL: Ensure NO instance of "undefined" appears anywhere
    assert.strictEqual(text.includes('undefined'), false, `Chip #${i} contained "undefined": ${text}`);
    assert.strictEqual(chip.innerHTML.includes('undefined'), false, `Chip #${i} HTML contained "undefined": ${chip.innerHTML}`);

    const tagEl = chip.querySelector('.deck-chip-tag');
    const tierEl = chip.querySelector('.deck-chip-tier');

    assert.ok(tagEl, `Chip #${i} is missing .deck-chip-tag`);
    assert.ok(tierEl, `Chip #${i} is missing .deck-chip-tier`);

    assert.ok(tagEl.textContent.trim().length > 0, `Chip #${i} .deck-chip-tag is empty`);
    assert.ok(tierEl.textContent.trim().length > 0, `Chip #${i} .deck-chip-tier is empty`);
  });
});

it('filters deck words correctly when clicking category filter buttons', () => {
  const { controller, dom } = createBugfixHarness();
  // Provide ranks 1 to 50
  const unlockedRanks = Array.from({ length: 50 }, (_, i) => i + 1);
  controller.storageService.saveGameSave({
    ...controller.storageService.getGameSave(),
    unlockedRanks
  });

  controller.openStats('flow');

  const homeCoreBtn = dom.window.document.querySelector('.deck-filter-btn[data-filter="HOME_CORE"]');
  assert.ok(homeCoreBtn);

  // Click Home Core filter
  homeCoreBtn.click();

  const chips = Array.from(dom.window.document.querySelectorAll('.deck-word-chip'));
  assert.ok(chips.length > 0, 'Expected chips after filtering');

  chips.forEach(chip => {
    assert.strictEqual(chip.textContent.includes('undefined'), false);
    const tagEl = chip.querySelector('.deck-chip-tag');
    assert.strictEqual(tagEl.textContent, 'Home Core Flow');
  });
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('ALL RECENT BUG FIXES VERIFIED! 🚀');
console.log('========================================\n');

process.exit(0);
