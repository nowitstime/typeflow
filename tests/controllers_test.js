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
      <button id="hd-btn"></button>
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
    flowVignetteOverlay: document.getElementById('flow-vignette-overlay'),
    hdBtn: document.getElementById('hd-btn')
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

  controller.destroy();
  assert.strictEqual(controller.classicTimerInterval, null);
  assert.strictEqual(controller.idleDecayInterval, null);
  assert.strictEqual(controller.physicsAnimFrame, null);
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
  controller.toggleHiddenMode(); // Enable Hidden mode

  // First word is 'the'
  assert.strictEqual(controller.sessionModel.getCurrentWordText(), 'the');

  const word0 = controller.stageView.wordElements[0];
  const word1 = controller.stageView.wordElements[1];

  // Initial state on word 0: first word onboarding makes untyped characters fully visible
  assert.strictEqual(word0.children[0].style.opacity, '');
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');
  // Next word starts at distance 4 -> gradual 50% visibility
  assert.strictEqual(word1.children[0].style.opacity, '0.5');

  // Type correct 't'
  controller.handleChar('t');
  // Past typed character is fully transparent behind cursor
  assert.strictEqual(word0.children[0].classList.contains('hd-past'), true);
  assert.strictEqual(word0.children[0].style.opacity, '0');
  // Untyped characters in first word follow smooth lookahead horizon (d <= 2 -> 0, no 100% next to 0%)
  assert.strictEqual(word0.children[1].style.opacity, '0');
  assert.strictEqual(word0.children[2].style.opacity, '0');

  // Type typo 'z' instead of 'h'
  controller.handleChar('z');
  // Safety brake triggers: mistake pops to full visibility (inline opacity cleared so CSS !important shows red)
  assert.strictEqual(word0.children[1].classList.contains('incorrect'), true);
  assert.strictEqual(word0.children[1].style.opacity, '');

  // Backspace cleans error
  controller.handleBackspace();
  assert.strictEqual(word0.children[1].classList.contains('incorrect'), false);
  // Returns to lookahead fade
  assert.strictEqual(word0.children[0].style.opacity, '0');
  assert.strictEqual(word0.children[1].style.opacity, '0');

  // Finish word 0 and enter word 1 to verify normal hidden mode fading kicks in
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();

  assert.strictEqual(controller.sessionModel.currentWordIdx, 1);
  // Word 1 is no longer first word, so within 2 chars it hits 0% opacity
  assert.strictEqual(word1.children[0].style.opacity, '0');
  assert.strictEqual(word1.children[1].style.opacity, '0');
});

it('Hidden Mode horizon scales infinitely at a quarter character per word in a row', () => {
  const { controller } = createTestHarness();
  controller.init();

  // Base Classic Mode horizon: 6 characters
  assert.strictEqual(controller.getHiddenFadeDepth(), 6.0);

  // Type 1 clean word
  controller.handleChar('t');
  controller.handleChar('h');
  controller.handleChar('e');
  controller.handleSpace();

  assert.strictEqual(controller.sessionModel.wordStreak, 1);
  assert.strictEqual(controller.getHiddenFadeDepth(), 6.25);

  // Type 3 more clean words (total 4 words in a row)
  for (let w = 0; w < 3; w++) {
    const cur = controller.sessionModel.getCurrentWordText();
    for (let c of cur) controller.handleChar(c);
    controller.handleSpace();
  }
  assert.strictEqual(controller.sessionModel.wordStreak, 4);
  assert.strictEqual(controller.getHiddenFadeDepth(), 7.0);

  // Type 4 more clean words (total 8 words in a row)
  for (let w = 0; w < 4; w++) {
    const cur = controller.sessionModel.getCurrentWordText();
    for (let c of cur) controller.handleChar(c);
    controller.handleSpace();
  }
  assert.strictEqual(controller.sessionModel.wordStreak, 8);
  assert.strictEqual(controller.getHiddenFadeDepth(), 8.0);
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
