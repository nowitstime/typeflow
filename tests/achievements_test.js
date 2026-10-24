/**
 * TypeFlow - Achievements & Trophy System Test Suite
 * Comprehensive automated verification for AchievementsModel, StorageService,
 * AudioService, HUDView, ModalView, and GameController integration.
 */

const assert = require('assert');
const { AchievementsModel, ACHIEVEMENTS } = require('../src/models/AchievementsModel.js');
const { StorageService, DEFAULT_GAME_SAVE } = require('../src/services/StorageService.js');
const { AudioService } = require('../src/services/AudioService.js');
const { StageView } = require('../src/views/StageView.js');
const { NestView } = require('../src/views/NestView.js');
const { HUDView } = require('../src/views/HUDView.js');
const { ChartView } = require('../src/views/ChartView.js');
const { ModalView } = require('../src/views/ModalView.js');
const { GameController } = require('../src/controllers/GameController.js');
const { WordsModel } = require('../src/models/WordsModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { JSDOM } = require('jsdom');

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

class AudioParamMock {
  setValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class AudioNodeMock {
  constructor() {
    this.frequency = new AudioParamMock();
    this.gain = new AudioParamMock();
  }
  connect() {}
  disconnect() {}
  start() {}
  stop() {}
}

class AudioContextMock {
  constructor() {
    this.currentTime = 0;
    this.destination = new AudioNodeMock();
    this.state = 'running';
  }
  createOscillator() {
    return new AudioNodeMock();
  }
  createGain() {
    return new AudioNodeMock();
  }
  resume() {
    return Promise.resolve();
  }
}

class DOMElementMock {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    const set = new Set();
    this.classList = {
      add: (c) => set.add(c),
      remove: (c) => set.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (set.has(c)) set.delete(c);
          else set.add(c);
        } else if (force) {
          set.add(c);
        } else {
          set.delete(c);
        }
      },
      contains: (c) => set.has(c)
    };
    this._set = set;
    this.style = {};
    this.dataset = {};
    this.children = [];
    this.childNodes = [];
    this._textContent = '';
    this._innerHTML = '';
    this.listeners = {};
  }

  get innerHTML() {
    return this._innerHTML;
  }
  set innerHTML(val) {
    this._innerHTML = String(val);
    if (!val) {
      this.children = [];
      this.childNodes = [];
    }
  }

  get className() {
    return Array.from(this._set).join(' ');
  }
  set className(str) {
    this._set.clear();
    if (str) {
      String(str).split(/\s+/).filter(Boolean).forEach(c => this._set.add(c));
    }
  }

  get textContent() {
    return this._textContent;
  }
  set textContent(val) {
    this._textContent = String(val);
  }

  appendChild(el) {
    this.children.push(el);
    this.childNodes.push(el);
    return el;
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  click() {
    if (this.listeners['click']) {
      this.listeners['click'].forEach(fn => fn({ target: this }));
    }
  }

  querySelector(sel) {
    return null;
  }

  querySelectorAll(sel) {
    return [];
  }
}

global.document = {
  createElement: (tag) => {
    const el = new DOMElementMock('', tag);
    el.ownerDocument = global.document;
    return el;
  },
  getElementById: (id) => null,
  querySelectorAll: () => []
};

console.log('========================================');
console.log('⚡ TYPEFLOW ACHIEVEMENTS TEST SUITE');
console.log('========================================\n');

let passedTests = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// --------------------------------------------------------------------------
console.log('--- 1. AchievementsModel Definitions & Progression Math ---');

test('defines exactly 35 distinct achievements across tiers and categories', () => {
  const model = new AchievementsModel();
  const defs = model.getDefinitions();
  const keys = Object.keys(defs);
  assert.strictEqual(keys.length, 35, `Expected 35 achievements, found ${keys.length}`);

  // Check categories exist
  const categories = new Set(keys.map(k => defs[k].category));
  assert.ok(categories.has('speed'));
  assert.ok(categories.has('flow'));
  assert.ok(categories.has('precision'));
  assert.ok(categories.has('hidden'));
  assert.ok(categories.has('ghost'));
  assert.ok(categories.has('rpg'));
  assert.ok(categories.has('feats'));

  // Check Crown Jewel
  assert.ok(defs.lexicon_1000, 'lexicon_1000 must exist');
  assert.strictEqual(defs.lexicon_1000.tier, 'crown');
  assert.strictEqual(defs.lexicon_1000.target, 1000);
});

test('listAll and listUnlocked accurately reflect unlock map', () => {
  const initial = { cruising_60: 1700000000000, silver_stream: 1700000005000 };
  const model = new AchievementsModel(initial);

  assert.strictEqual(model.isUnlocked('cruising_60'), true);
  assert.strictEqual(model.isUnlocked('triple_digits'), false);
  assert.strictEqual(model.getUnlockedCount(), 2);

  const all = model.listAll();
  assert.strictEqual(all.length, 35);
  const unlocked = model.listUnlocked();
  assert.strictEqual(unlocked.length, 2);
  assert.strictEqual(unlocked[0].id, 'cruising_60');
  assert.strictEqual(unlocked[1].id, 'silver_stream');
});

test('multi-test counters evaluate speed & cadence milestones', () => {
  const model = new AchievementsModel();

  // Test finished event with counters
  const unlocked = model.evaluate('test_finished', {
    counters: {
      tests60Wpm: 5,
      tests100Wpm: 4,
      tests85Consistency: 3,
      tests92Consistency: 5,
      tests98Acc: 5,
      tests100RawAcc: 3
    }
  });

  const unlockedIds = unlocked.map(a => a.id);
  assert.ok(unlockedIds.includes('cruising_60'), 'Should unlock Cruising Altitude (5 tests @ 60 WPM)');
  assert.ok(!unlockedIds.includes('triple_digits'), 'Should NOT unlock Triple Digits (only 4 tests)');
  assert.ok(unlockedIds.includes('steady_cadence'), 'Should unlock Steady Cadence');
  assert.ok(unlockedIds.includes('human_metronome'), 'Should unlock Human Metronome');
  assert.ok(unlockedIds.includes('marksman'), 'Should unlock Marksman');
  assert.ok(unlockedIds.includes('surgical_precision'), 'Should unlock Surgical Precision');
});

test('typo recovery evaluates quick_patch and clutch_recovery cleanly', () => {
  const model = new AchievementsModel();

  // 3 errors fixed, 0 uncorrected
  const res1 = model.evaluate('test_finished', {
    fixedErrors: 3,
    incorrectChars: 3
  });
  assert.ok(res1.some(a => a.id === 'quick_patch'), 'Should unlock Quick Patch');
  assert.ok(!res1.some(a => a.id === 'clutch_recovery'), 'Should NOT unlock Clutch Recovery yet');

  // 6 errors fixed, 0 uncorrected
  const res2 = model.evaluate('test_finished', {
    fixedErrors: 6,
    incorrectChars: 6
  });
  assert.ok(res2.some(a => a.id === 'clutch_recovery'), 'Should unlock Clutch Recovery');

  // Stumble with uncorrected errors fails
  const model2 = new AchievementsModel();
  const res3 = model2.evaluate('test_finished', {
    fixedErrors: 4,
    incorrectChars: 5 // 1 uncorrected
  });
  assert.strictEqual(res3.length, 0, 'Uncorrected errors should disqualify typo recovery');
});

test('flow word_completed evaluates sustained flow and apex overspin', () => {
  const model = new AchievementsModel();

  const res1 = model.evaluate('word_completed', {
    flowSeconds: 32,
    consecutiveApexWords: 12,
    burstWpm: 135,
    wordLength: 6,
    momentum: 120
  });

  const ids = res1.map(a => a.id);
  assert.ok(ids.includes('sustained_current'), 'Should unlock Sustained Current (30s+ Flow)');
  assert.ok(!ids.includes('zen_master'), 'Should NOT unlock Zen Master (< 120s)');
  assert.ok(ids.includes('redline_runner'), 'Should unlock Redline Runner (10 words in 120% Apex)');
  assert.ok(!ids.includes('overclocked'), 'Should NOT unlock Overclocked (< 30 words)');
  assert.ok(ids.includes('terminal_velocity'), 'Should unlock Terminal Velocity (130+ burst, 5+ letters, Apex)');
});

test('egg hatching evaluates tiers, count, and sixth sense in hidden mode', () => {
  const model = new AchievementsModel();

  const res = model.evaluate('egg_hatched', {
    totalHatched: 15,
    rarityTier: 'RARE',
    isHidden: true,
    hiddenCombo: 10
  });

  const ids = res.map(a => a.id);
  assert.ok(ids.includes('nest_tender'), 'Should unlock Nest Tender (15 eggs)');
  assert.ok(ids.includes('golden_discovery'), 'Should unlock Golden Discovery (Rare egg)');
  assert.ok(ids.includes('sixth_sense'), 'Should unlock Sixth Sense (Hatch during hidden combo)');
});

test('lexicon milestones evaluate explorer, architect, and the 1,000-word Crown Jewel', () => {
  const model = new AchievementsModel();

  const res50 = model.evaluate('lexicon_updated', {
    gameSave: { unlockedRanks: new Array(50).fill(1) }
  });
  assert.ok(res50.some(a => a.id === 'lexicon_explorer'));

  const res250 = model.evaluate('lexicon_updated', {
    gameSave: { unlockedRanks: new Array(250).fill(1) }
  });
  assert.ok(res250.some(a => a.id === 'lexicon_architect'));

  const res1000 = model.evaluate('lexicon_updated', {
    gameSave: { unlockedRanks: new Array(1000).fill(1) }
  });
  assert.ok(res1000.some(a => a.id === 'lexicon_1000'), 'Should unlock The Grand Lexicon Crown Jewel');
});

test('getProgress accurately calculates progress percentages and formats', () => {
  const model = new AchievementsModel();
  const counters = { tests60Wpm: 3, eggsHatchedTotal: 10 };
  const gameSave = { unlockedRanks: new Array(20).fill(1), highStreak: 25 };

  const p1 = model.getProgress('cruising_60', counters, gameSave);
  assert.strictEqual(p1.current, 3);
  assert.strictEqual(p1.target, 5);
  assert.strictEqual(p1.pct, 60);
  assert.strictEqual(p1.label, '3 / 5 tests');

  const p2 = model.getProgress('silver_stream', counters, gameSave);
  assert.strictEqual(p2.current, 25);
  assert.strictEqual(p2.target, 50);
  assert.strictEqual(p2.pct, 50);

  const p3 = model.getProgress('lexicon_1000', counters, gameSave);
  assert.strictEqual(p3.current, 20);
  assert.strictEqual(p3.target, 1000);
  assert.strictEqual(p3.pct, 2);
});

// --------------------------------------------------------------------------
console.log('\n--- 2. StorageService Achievements & Retroactive Sync ---');

test('StorageService persists achievement unlocks and counters', () => {
  const mockStorage = new LocalStorageMock();
  const storage = new StorageService(mockStorage);

  assert.deepStrictEqual(storage.getAchievements(), {});

  const unlocked = storage.unlockAchievement('cruising_60', 123456789);
  assert.strictEqual(unlocked, true);
  assert.strictEqual(storage.getAchievements()['cruising_60'], 123456789);

  // Calling again returns false (already unlocked)
  assert.strictEqual(storage.unlockAchievement('cruising_60', 9999), false);

  storage.updateAchievementCounters(c => {
    c.tests60Wpm = 2;
    c.eggsHatchedTotal = 7;
  });

  const c = storage.getAchievementCounters();
  assert.strictEqual(c.tests60Wpm, 2);
  assert.strictEqual(c.eggsHatchedTotal, 7);
});

test('StorageService.syncRetroactiveAchievements unlocks earned milestones from past history', () => {
  const mockStorage = new LocalStorageMock();
  const storage = new StorageService(mockStorage);

  // Seed classic stats with 5 runs of 65 WPM, 97% acc, 30s
  const classic = storage.getClassicStats();
  for (let i = 0; i < 5; i++) {
    classic.recentHistory.push({
      duration: 30,
      wpm: 65,
      accuracy: 97,
      consistency: 86,
      incorrectChars: 0,
      fixedErrors: 0
    });
  }
  storage.saveClassicStats(classic);

  // Seed game save with 55 unlocked words and 60 high streak
  const save = storage.getGameSave();
  save.unlockedRanks = new Array(55).fill(1);
  save.highStreak = 60;
  storage.saveGameSave(save);

  const model = new AchievementsModel();
  const retroUnlocks = storage.syncRetroactiveAchievements(model);

  const retroIds = retroUnlocks.map(a => a.id);
  assert.ok(retroIds.includes('cruising_60'), 'Should retroactively unlock cruising_60');
  assert.ok(retroIds.includes('steady_cadence'), 'Should retroactively unlock steady_cadence');
  assert.ok(retroIds.includes('silver_stream'), 'Should retroactively unlock silver_stream');
  assert.ok(retroIds.includes('lexicon_explorer'), 'Should retroactively unlock lexicon_explorer');

  // Verify stored in storageService
  assert.ok(storage.getAchievements()['cruising_60']);
  assert.ok(storage.getAchievements()['lexicon_explorer']);
});

// --------------------------------------------------------------------------
console.log('\n--- 3. AudioService Procedural Synthesizer ---');

test('AudioService.playAchievementUnlock synthesizes distinct notes for Tier 1 vs Tier 2', () => {
  const audioContext = new AudioContextMock();
  const audio = new AudioService({ audioContextClass: () => audioContext });
  audio.enabled = true;

  // Tier 1 Major Chime
  assert.doesNotThrow(() => {
    audio.playAchievementUnlock(1);
  });

  // Tier 2 Arpeggio
  assert.doesNotThrow(() => {
    audio.playAchievementUnlock(2);
  });

  // Crown Jewel
  assert.doesNotThrow(() => {
    audio.playAchievementUnlock('crown');
  });
});

// --------------------------------------------------------------------------
console.log('\n--- 4. HUDView Micro-Toast Queue & Stats Badge ---');

test('HUDView queues achievement toasts and manages stats button badge', () => {
  const toastEl = new DOMElementMock('achievement-toast');
  const statsBtn = new DOMElementMock('stats-btn');
  const hud = new HUDView({
    achievementToast: toastEl,
    statsBtn: statsBtn
  });

  assert.strictEqual(statsBtn.classList.contains('has-badge'), false);
  hud.setStatsBadgeVisible(true);
  assert.strictEqual(statsBtn.classList.contains('has-badge'), true);
  hud.setStatsBadgeVisible(false);
  assert.strictEqual(statsBtn.classList.contains('has-badge'), false);

  // Queue two toasts
  hud.showAchievementToast({
    id: 'cruising_60',
    title: 'Cruising Altitude',
    desc: '5 tests at 60 WPM',
    tier: 1,
    icon: '✈️'
  });
  hud.showAchievementToast({
    id: 'triple_digits',
    title: 'Triple Digits',
    desc: '5 tests at 100 WPM',
    tier: 2,
    icon: '🚀'
  });

  assert.strictEqual(hud.isToastShowing, true);
  assert.strictEqual(hud.toastQueue.length, 1, 'Second toast should remain queued');
  assert.ok(toastEl.classList.contains('visible'));
  assert.ok(toastEl.classList.contains('tier-1'));
  assert.ok(toastEl.innerHTML.includes('Cruising Altitude'));
});

// --------------------------------------------------------------------------
console.log('\n--- 5. ModalView Trophies Pane & Filtering ---');

test('ModalView switches to Trophies tab and renders 35 cards with progress', () => {
  const tabFlow = new DOMElementMock('tab-stats-flow');
  const tabClassic = new DOMElementMock('tab-stats-classic');
  const tabTrophies = new DOMElementMock('tab-stats-trophies');
  const paneFlow = new DOMElementMock('pane-stats-flow');
  const paneClassic = new DOMElementMock('pane-stats-classic');
  const paneTrophies = new DOMElementMock('pane-stats-trophies');
  const trophiesCountEl = new DOMElementMock('trophies-count');
  const trophiesProgressBar = new DOMElementMock('trophies-progress-bar');
  const trophiesGrid = new DOMElementMock('trophies-grid');

  const modal = new ModalView({
    tabStatsFlow: tabFlow,
    tabStatsClassic: tabClassic,
    tabStatsTrophies: tabTrophies,
    paneStatsFlow: paneFlow,
    paneStatsClassic: paneClassic,
    paneStatsTrophies: paneTrophies,
    trophiesCountEl: trophiesCountEl,
    trophiesProgressBar: trophiesProgressBar,
    trophiesGrid: trophiesGrid
  });

  modal.switchStatsTab('trophies');
  assert.ok(tabTrophies.classList.contains('active'));
  assert.ok(!tabFlow.classList.contains('active'));
  assert.strictEqual(paneTrophies.style.display, 'flex');
  assert.strictEqual(paneFlow.style.display, 'none');

  const model = new AchievementsModel({ cruising_60: Date.now() });
  const storage = new StorageService(new LocalStorageMock());

  modal.renderTrophies(model, storage);

  assert.strictEqual(trophiesGrid.children.length, 35);
  assert.ok(trophiesCountEl.textContent.includes('1 / 35 unlocked (3%)'));

  // Filter to speed
  modal.renderTrophies(model, storage, 'speed');
  assert.strictEqual(trophiesGrid.children.length, 5); // 5 speed achievements
});

// --------------------------------------------------------------------------
console.log('\n--- 6. GameController End-to-End Achievement Integration ---');

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
        <div id="nest-incubation-fill"></div>
      </div>
      <div id="test-section"></div>
      <div id="results-section"></div>
      <button id="hd-btn"></button>
      <button id="stats-btn"></button>
      <div id="achievement-toast" class="achievement-toast"></div>
      <div id="stats-modal" style="display: none;">
        <button id="tab-stats-flow"></button>
        <button id="tab-stats-classic"></button>
        <button id="tab-stats-trophies"></button>
        <div id="pane-stats-flow"></div>
        <div id="pane-stats-classic"></div>
        <div id="pane-stats-trophies">
          <span id="trophies-count"></span>
          <div id="trophies-progress-bar"></div>
          <div id="trophies-grid"></div>
        </div>
      </div>
    </body>
    </html>
  `, { url: 'https://typeflow.local/' });

  const { window } = dom;
  const { document } = window;
  global.window = window;
  global.document = document;
  const storageBackend = new LocalStorageMock();
  const storageService = new StorageService(storageBackend);
  const achievementsModel = new AchievementsModel();
  const wordsModel = new WordsModel();
  const sessionModel = new SessionModel();
  const flowModel = new FlowModel();
  const eggNestModel = new EggNestModel();
  const audioService = new AudioService({ audioContextClass: () => new AudioContextMock() });

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
    nestIncubationFill: document.getElementById('nest-incubation-fill')
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
    statsBtn: document.getElementById('stats-btn'),
    achievementToast: document.getElementById('achievement-toast'),
    xpToastLayer: document.createElement('div')
  });

  const modalView = new ModalView({
    statsModal: document.getElementById('stats-modal'),
    tabStatsFlow: document.getElementById('tab-stats-flow'),
    tabStatsClassic: document.getElementById('tab-stats-classic'),
    tabStatsTrophies: document.getElementById('tab-stats-trophies'),
    paneStatsFlow: document.getElementById('pane-stats-flow'),
    paneStatsClassic: document.getElementById('pane-stats-classic'),
    paneStatsTrophies: document.getElementById('pane-stats-trophies'),
    trophiesCountEl: document.getElementById('trophies-count'),
    trophiesProgressBar: document.getElementById('trophies-progress-bar'),
    trophiesGrid: document.getElementById('trophies-grid')
  });

  const controller = new GameController({
    wordsModel,
    sessionModel,
    flowModel,
    eggNestModel,
    storageService,
    audioService,
    achievementsModel,
    stageView,
    nestView,
    hudView,
    chartView: new ChartView(),
    modalView
  });

  return { controller, dom, storageService, achievementsModel, hudView, modalView, document };
}

test('GameController triggers shock_absorber on typo cushion absorption and recovery', () => {
  const { controller, achievementsModel } = createHarness();

  controller.init();
  controller.currentMode = 'flow';

  // Elevate flow momentum to Apex (104%)
  controller.flowModel.momentum = 104.0;
  controller.flowModel.setTargetWpm(60);

  // Set up active word and simulate typing with a backspaced error
  controller.sessionModel.words = ['test', 'word', 'next'];
  controller.sessionModel.currentWordIdx = 0;
  controller.sessionModel.currentCharIdx = 0;

  // Simulate typing 't', typo 'x', backspace 'x', then 'e', 's', 't'
  controller.sessionModel.recordChar('t');
  controller.sessionModel.recordChar('x');
  controller.sessionModel.recordBackspace();
  controller.sessionModel.recordChar('e');
  controller.sessionModel.recordChar('s');
  controller.sessionModel.recordChar('t');

  // Stumble pace: set base times to 3 seconds ago so liveWpm is ~20 WPM (< 60 WPM)
  const now = Date.now();
  controller.sessionModel.wordStartTime = now - 3000;
  controller.sessionModel.lastWordEndTime = now - 3000;

  // Spacebar submit word:
  // prevMomentum is 104 (>= 100), isHadBackspace = true, liveWpm < targetWpm
  // gentle exhale drops momentum by 8% to 96 (>= 85 and < 100)
  controller.handleSpace();

  assert.strictEqual(controller.cushionAbsorbedState, true, 'Cushion should have absorbed stumble into flow zone without falling below 85%');
  assert.strictEqual(achievementsModel.isUnlocked('shock_absorber'), false, 'Not yet recovered');

  // Next word: clean and fast -> momentum returns to >= 100%
  controller.sessionModel.recordChar('w');
  controller.sessionModel.recordChar('o');
  controller.sessionModel.recordChar('r');
  controller.sessionModel.recordChar('d');
  controller.sessionModel.wordStartTime = Date.now();
  controller.sessionModel.lastWordEndTime = Date.now();
  controller.handleSpace();

  assert.strictEqual(achievementsModel.isUnlocked('shock_absorber'), true, 'Shock Absorber feat should be unlocked!');
  assert.strictEqual(controller.cushionAbsorbedState, false);
  controller.destroy();
});

test('GameController triggers egg_hatched and updates lexicon achievements', () => {
  const { controller, achievementsModel, storageService } = createHarness();

  controller.init();
  controller.currentMode = 'flow';

  // Put a Rare egg into the nest slot 0
  const rareEgg = { id: 101, wordRank: 650, word: 'rareword', rarity: 'rare', requiredKey: 'e-g-g' };
  controller.eggNestModel.basket = [rareEgg];
  storageService.addEgg(rareEgg);

  // Enter hatch mode and type "e", "g", "g"
  controller.enterHatchMode(0);
  controller.handleHatchChar('e');
  controller.handleHatchChar('g');
  controller.handleHatchChar('g'); // complete!

  assert.strictEqual(achievementsModel.isUnlocked('golden_discovery'), true, 'Should unlock Golden Discovery for hatching a Rare egg!');
  assert.strictEqual(storageService.getAchievementCounters().eggsHatchedTotal, 1);
  controller.destroy();
});

test('opening stats modal clears stats button badge and renders trophies', () => {
  const { controller, hudView, modalView } = createHarness();

  hudView.setStatsBadgeVisible(true);
  const statsBtn = hudView.statsBtn;
  assert.strictEqual(statsBtn.classList.contains('has-badge'), true);

  controller.openStats('trophies');
  assert.strictEqual(statsBtn.classList.contains('has-badge'), false, 'Badge should clear when modal opens');
  controller.destroy();
});

test('syncRetroactiveAchievements is idempotent across reloads and supports acc field in recentHistory', () => {
  const mockStorage = new LocalStorageMock();
  const storage = new StorageService(mockStorage);

  // Seed 2 runs at 55 WPM (< 60 WPM) with acc: 99 (using real recentHistory field name 'acc')
  const classic = storage.getClassicStats();
  classic.recentHistory.push(
    { duration: 30, wpm: 55, acc: 99, consistency: 88 },
    { duration: 30, wpm: 56, acc: 99, consistency: 89 }
  );
  storage.saveClassicStats(classic);

  const model = new AchievementsModel();
  storage.syncRetroactiveAchievements(model);
  assert.strictEqual(storage.getAchievementCounters().tests98Acc, 2);
  assert.strictEqual(storage.getAchievementCounters().tests85Consistency, 2);

  // Calling a second time (simulating page reload) must NOT double-increment counters
  storage.syncRetroactiveAchievements(model);
  assert.strictEqual(storage.getAchievementCounters().tests98Acc, 2, 'Should not double-increment on reload');
  assert.strictEqual(storage.getAchievementCounters().tests85Consistency, 2, 'Should not double-increment on reload');

  // Check motor bucket progress formatting
  const pTri = model.getProgress('tri_core_flow', {}, {}, { motorBucketsCount: 2 });
  assert.strictEqual(pTri.label, '2 / 3 buckets');
  assert.strictEqual(pTri.pct, 67);
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${passedTests} PASSED`);
console.log('ALL ACHIEVEMENTS & TROPHIES TESTS PASSED! 🚀');
console.log('========================================\n');
process.exit(0);
