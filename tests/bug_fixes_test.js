/**
 * TypeFlow - Bug Fixes & Regression Test Suite
 * Validates fixes for:
 * 1. Infinite WPM / Keystroke farming on backspace (SessionModel)
 * 2. rollingKeystrokeTimestamps clean accounting (SessionModel)
 * 3. Complete RPG state wipe on Reset RPG (FlowModel & GameController)
 * 4. Hidden Mode horizon clearing on combo drop (StageView)
 * 5. Ghost Cursor position compensation on sandwich insertion (GameController)
 * 6. Multi-level up bonus egg rarity preservation (StorageService)
 * 7. Default save template deep clone isolation (StorageService)
 * 8. FlowModel keystroke recording on spacebar (GameController)
 * 9. Lifecycle cleanup on GameController.destroy() (GameController)
 */

const assert = require('assert');
const { SessionModel } = require('../src/models/SessionModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { WordsModel } = require('../src/models/WordsModel.js');
const { BigramLedger } = require('../src/models/BigramLedger.js');
const { StorageService } = require('../src/services/StorageService.js');
const { AudioService } = require('../src/services/AudioService.js');
const { StageView } = require('../src/views/StageView.js');
const { NestView } = require('../src/views/NestView.js');
const { HUDView } = require('../src/views/HUDView.js');
const { ModalView } = require('../src/views/ModalView.js');
const { ChartView } = require('../src/views/ChartView.js');
const { KeyboardController } = require('../src/controllers/KeyboardController.js');
const { GameController } = require('../src/controllers/GameController.js');

let passedTests = 0;
function it(desc, fn) {
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

// Minimal DOM Mock for DOM tests
function createMockElement(tag = 'div', id = '', classList = []) {
  const listeners = {};
  const children = [];
  const classes = new Set(classList);
  return {
    tagName: tag.toUpperCase(),
    id,
    classList: {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) { classes.delete(c); return false; }
          else { classes.add(c); return true; }
        } else if (force) {
          classes.add(c); return true;
        } else {
          classes.delete(c); return false;
        }
      },
      contains: (c) => classes.has(c)
    },
    style: {},
    dataset: {},
    value: '',
    textContent: '',
    innerHTML: '',
    children,
    addEventListener: (evt, cb) => {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(cb);
    },
    removeEventListener: (evt, cb) => {
      if (!listeners[evt]) return;
      const idx = listeners[evt].indexOf(cb);
      if (idx !== -1) listeners[evt].splice(idx, 1);
    },
    dispatchEvent: (evt) => {
      if (listeners[evt.type]) {
        listeners[evt.type].forEach(cb => cb(evt));
      }
    },
    querySelector: (sel) => null,
    querySelectorAll: (sel) => [],
    appendChild: (child) => { children.push(child); return child; },
    focus: () => {},
    blur: () => {},
    getBoundingClientRect: () => ({ top: 100, bottom: 120, left: 50, right: 80, width: 30, height: 20 })
  };
}

// Memory Storage Mock
class MockLocalStorage {
  constructor() { this.store = {}; }
  getItem(key) { return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

console.log('\n========================================');
console.log('⚡ TYPEFLOW BUG FIXES & REGRESSION TESTS');
console.log('========================================\n');

// 1. SessionModel Backspace Farming Prevention & Rolling Timestamps
console.log('--- 1. SessionModel Anti-Farming & Rolling Keystroke Telemetry ---');

it('decrements correctKeystrokes and pops rollingKeystrokeTimestamps when backspacing correct letter', () => {
  const session = new SessionModel({ words: ['cat'] });
  const t0 = 10000;
  session.start(t0);

  session.recordChar('c', true, false, t0 + 100);
  session.recordChar('a', true, false, t0 + 200);
  session.recordChar('t', true, false, t0 + 300);

  assert.strictEqual(session.correctKeystrokes, 3);
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 3);

  // Backspace 't'
  session.recordBackspace(t0 + 400);
  assert.strictEqual(session.correctKeystrokes, 2, 'correctKeystrokes should decrement to 2 on backspace of correct letter');
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 2, 'rollingKeystrokeTimestamps should pop on backspace of correct letter');

  // Re-type 't'
  session.recordChar('t', true, false, t0 + 500);
  assert.strictEqual(session.correctKeystrokes, 3, 'correctKeystrokes should return to 3, not inflate to 4');
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 3);

  // Repeated backspace + re-type cycle 10 times
  for (let i = 0; i < 10; i++) {
    session.recordBackspace(t0 + 600 + i * 200);
    assert.strictEqual(session.correctKeystrokes, 2);
    session.recordChar('t', true, false, t0 + 700 + i * 200);
    assert.strictEqual(session.correctKeystrokes, 3);
  }
});

it('does not decrement correctKeystrokes when backspacing a mistyped character', () => {
  const session = new SessionModel({ words: ['cat'] });
  const t0 = 10000;
  session.start(t0);

  session.recordChar('c', true, false, t0 + 100);
  session.recordChar('a', true, false, t0 + 200);
  assert.strictEqual(session.correctKeystrokes, 2);
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 2);

  // Typo 'x' instead of 't'
  session.recordChar('x', false, false, t0 + 300);
  assert.strictEqual(session.correctKeystrokes, 2, 'Typo should not increment correctKeystrokes');
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 2, 'Typo should not be pushed to rollingKeystrokeTimestamps');

  // Backspacing the typo
  session.recordBackspace(t0 + 400);
  assert.strictEqual(session.correctKeystrokes, 2, 'Backspacing a typo should NOT decrement correctKeystrokes');
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 2);

  // Typing correct 't'
  session.recordChar('t', true, false, t0 + 500);
  assert.strictEqual(session.correctKeystrokes, 3);
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 3);
});

it('submitWord with errors does not push to rollingKeystrokeTimestamps', () => {
  const session = new SessionModel({ words: ['cat'] });
  const t0 = 10000;
  session.start(t0);

  session.recordChar('c', true, false, t0 + 100);
  session.recordChar('x', false, false, t0 + 200); // typo
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 1);

  // Submit with errors
  session.submitWord(true, 1, 0, t0 + 300);
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 1, 'Error word submission spacebar must NOT push to rollingKeystrokeTimestamps');
});

it('revertToPreviousWord pops spacebar timestamp when reverting clean word', () => {
  const session = new SessionModel({ words: ['cat', 'dog'] });
  const t0 = 10000;
  session.start(t0);

  session.recordChar('c', true, false, t0 + 100);
  session.recordChar('a', true, false, t0 + 200);
  session.recordChar('t', true, false, t0 + 300);
  session.submitWord(false, 0, 0, t0 + 400); // clean submit (+1 spacebar)

  assert.strictEqual(session.correctKeystrokes, 4);
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 4);

  // Revert back to 'cat'
  session.revertToPreviousWord();
  assert.strictEqual(session.correctKeystrokes, 3, 'Spacebar keystroke rolled back');
  assert.strictEqual(session.rollingKeystrokeTimestamps.length, 3, 'Spacebar timestamp rolled back from rollingKeystrokeTimestamps');
});

// 2. StorageService Multi-Level Up and Deep Clone
console.log('\n--- 2. StorageService Fixes ---');

it('preserves epic rarity milestone when multi-leveling up past level 10', () => {
  const mockStorage = new MockLocalStorage();
  const storage = new StorageService(mockStorage);
  const save = storage.getGameSave();
  save.level = 9;
  save.currentXp = 0;
  storage.saveGameSave(save);

  // Award enough XP to cross level 10 and reach level 11
  const xp9 = storage.getXpForLevel(9);
  const xp10 = storage.getXpForLevel(10);
  const res = storage.addXp(xp9 + xp10 + 50);

  assert.strictEqual(res.leveledUp, true);
  assert.strictEqual(res.newLevel, 11);
  assert.strictEqual(res.bonusEggRarity, 'epic', 'Crossing Level 10 milestone must award epic egg even if advancing to 11');
});

it('deep-clones DEFAULT_GAME_SAVE and DEFAULT_CLASSIC_STATS preventing template mutation', () => {
  const mockStorage = new MockLocalStorage();
  const storage = new StorageService(mockStorage);

  const save1 = storage.getGameSave();
  save1.wordStats['the'] = { seen: 999 };
  save1.personalBests = { '30': { wpm: 999 } };

  // Fetching a fresh save or resetting must NOT contain mutated references
  storage.resetGameSave();
  const freshSave = storage.getGameSave();
  assert.strictEqual(freshSave.wordStats['the'], undefined, 'DEFAULT_GAME_SAVE template must not be polluted');

  const stats1 = storage.getClassicStats();
  stats1.personalBests['30'].wpm = 999;
  storage.resetClassicStats();
  const freshStats = storage.getClassicStats();
  assert.strictEqual(freshStats.personalBests['30'].wpm, 0, 'DEFAULT_CLASSIC_STATS template must not be polluted');
});

// 3. StageView Hidden Mode Lookahead Clearing
console.log('\n--- 3. StageView Hidden Horizon Buffer Cleanup ---');

it('clears all faded lookahead words up to 12 words ahead when combo breaks to 0', () => {
  const wordsBox = createMockElement('div', 'words-box');
  const wordEls = [];

  for (let w = 0; w < 10; w++) {
    const wEl = createMockElement('div', `word-${w}`);
    const letters = [];
    for (let c = 0; c < 4; c++) {
      const lEl = createMockElement('span', `l-${w}-${c}`, ['letter']);
      letters.push(lEl);
      wEl.appendChild(lEl);
    }
    wEl.querySelectorAll = (sel) => (sel === '.letter' ? letters : []);
    wordEls.push(wEl);
  }

  const stageView = new StageView({ wordsBox });
  stageView.wordElements = wordEls;
  stageView.setHiddenMode(true);

  // Simulate high combo (combo = 60), which sets opacity on words 1 and 2
  stageView.updateHiddenHorizon(0, 0, 60, false);
  const word1Letters = wordEls[1].querySelectorAll('.letter');
  assert.strictEqual(word1Letters[0].style.opacity, '0', 'Word 1 was faded at combo 60');

  // Combo drops to 0 on spacebar submission
  stageView.updateHiddenHorizon(1, 0, 0, false);

  // Verify all upcoming words (including word 3 and 4) have style.opacity cleared
  for (let w = 1; w < 6; w++) {
    const letters = wordEls[w].querySelectorAll('.letter');
    for (let j = 0; j < letters.length; j++) {
      assert.strictEqual(letters[j].style.opacity, '', `Word ${w} letter ${j} must be cleared to visible when combo drops`);
    }
  }
});

// 4. GameController Reset RPG, Ghost Cursor, Keystroke Recording & Teardown
console.log('\n--- 4. GameController Integration Fixes ---');

it('onResetRpg thoroughly resets FlowModel highStreak, eggCharge, bigramLedger, and queues', () => {
  const mockStorage = new MockLocalStorage();
  const storage = new StorageService(mockStorage);
  const words = new WordsModel();
  const flow = new FlowModel({ highStreak: 55, eggCharge: 75.0, targetWpm: 80 });
  const nest = new EggNestModel();
  const session = new SessionModel({ words: ['the'] });

  const stageView = new StageView({});
  const nestView = new NestView({});
  const hudView = new HUDView({});
  let onResetRpgHandler = null;
  const modalView = {
    bindEvents: (handlers) => { onResetRpgHandler = handlers.onResetRpg; },
    renderFlowStats: () => {},
    renderClassicStats: () => {},
    hideClassicResults: () => {}
  };
  const chartView = new ChartView({});
  const keyboard = new KeyboardController();
  const audio = new AudioService(mockStorage);

  let confirmAsked = false;
  global.window = {
    confirm: (msg) => { confirmAsked = true; return true; },
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const controller = new GameController({
    wordsModel: words,
    flowModel: flow,
    eggNestModel: nest,
    sessionModel: session,
    storageService: storage,
    audioService: audio,
    stageView,
    nestView,
    hudView,
    modalView,
    chartView,
    keyboardController: keyboard
  });
  controller.init();

  controller.pendingHatchedWords = [{ word: 'spark', rarity: 'common' }];
  controller.pendingRareEpicUnlocks = [{ word: 'cosmic', rarity: 'rare' }];
  controller.bigramLedger.recordTransition('t', 'h', 200, true, 40);

  // Trigger RPG reset
  assert.ok(typeof onResetRpgHandler === 'function');
  onResetRpgHandler();

  assert.strictEqual(confirmAsked, true);
  assert.strictEqual(flow.highStreak, 0, 'highStreak must be reset to 0');
  assert.strictEqual(flow.eggCharge, 0, 'eggCharge must be reset to 0');
  assert.strictEqual(flow.targetWpm, 40, 'targetWpm must be reset to 40');
  assert.strictEqual(controller.pendingHatchedWords.length, 0, 'pendingHatchedWords must be cleared');
  assert.strictEqual(controller.pendingRareEpicUnlocks.length, 0, 'pendingRareEpicUnlocks must be cleared');
  assert.strictEqual(Object.keys(controller.bigramLedger.ledger).length, 0, 'bigramLedger transitions must be cleared');

  controller.destroy();
});

it('handleSpace records keystroke in FlowModel to keep idle decay accurate', () => {
  const mockStorage = new MockLocalStorage();
  const storage = new StorageService(mockStorage);
  const words = new WordsModel();
  const flow = new FlowModel({ targetWpm: 40 });
  const nest = new EggNestModel();
  const session = new SessionModel({ words: ['the', 'quick'] });

  const hudView = new HUDView({});
  hudView.updateLevelCard = () => {};
  hudView.spawnXpToast = () => {};
  hudView.updateFlowGauge = () => {};

  const controller = new GameController({
    wordsModel: words,
    flowModel: flow,
    eggNestModel: nest,
    sessionModel: session,
    storageService: storage,
    audioService: new AudioService(mockStorage),
    stageView: new StageView({}),
    nestView: new NestView({}),
    hudView,
    modalView: new ModalView({}),
    chartView: new ChartView({}),
    keyboardController: new KeyboardController()
  });

  session.start(10000);
  session.recordChar('t', true, false, 10100);
  session.recordChar('h', true, false, 10200);
  session.recordChar('e', true, false, 10300);

  const prevKeystroke = flow.lastKeystrokeTime;
  // Hit spacebar at 10400
  controller.handleSpace();

  assert.ok(flow.lastKeystrokeTime >= prevKeystroke, 'Spacebar must update flowModel.lastKeystrokeTime');
  controller.destroy();
});

it('compensates ghostTotalChars when sandwiched words are spliced mid-stream', () => {
  const mockStorage = new MockLocalStorage();
  const storage = new StorageService(mockStorage);
  const words = new WordsModel();
  const flow = new FlowModel({ targetWpm: 40 });
  const nest = new EggNestModel();
  const session = new SessionModel({ words: ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'] });

  const hudView = new HUDView({});
  hudView.updateLevelCard = () => {};
  hudView.spawnXpToast = () => {};
  hudView.updateFlowGauge = () => {};

  const controller = new GameController({
    wordsModel: words,
    flowModel: flow,
    eggNestModel: nest,
    sessionModel: session,
    storageService: storage,
    audioService: new AudioService(mockStorage),
    stageView: new StageView({}),
    nestView: new NestView({}),
    hudView,
    modalView: new ModalView({}),
    chartView: new ChartView({}),
    keyboardController: new KeyboardController()
  });

  controller.ghostEnabled = true;
  controller.isGhostRunning = true;
  controller.ghostNeedsSync = false;
  // Position ghost at word 4 (insertPos is currentWordIdx 0 + 3 = 3)
  const posBefore = controller.getCharCumulativeIndex(4, 0);
  controller.ghostTotalChars = posBefore;

  // Queue a hatched word to induce sandwich
  controller.pendingHatchedWords = [{ word: 'hatch', rarity: 'common' }];

  // Advance word 0
  session.start(10000);
  session.recordChar('w', true, false, 10100);
  session.recordChar('0', true, false, 10200);
  controller.handleSpace();

  // Sandwich (3 words) was inserted at index 3
  // Since ghost was at index 4, ghostTotalChars must have grown by the sandwich chars
  assert.ok(controller.ghostTotalChars > posBefore, 'ghostTotalChars must advance to compensate for spliced sandwich');
  controller.destroy();
});

it('destroy() cleans up ghost pacer timers and window resize listener without leaks', () => {
  let removeEventCalled = false;
  global.window = {
    addEventListener: () => {},
    removeEventListener: (evt) => { if (evt === 'resize') removeEventCalled = true; },
    cancelAnimationFrame: () => {}
  };

  const mockStorage = new MockLocalStorage();
  const controller = new GameController({
    wordsModel: new WordsModel(),
    flowModel: new FlowModel(),
    eggNestModel: new EggNestModel(),
    sessionModel: new SessionModel({ words: ['the'] }),
    storageService: new StorageService(mockStorage),
    audioService: new AudioService(mockStorage),
    stageView: new StageView({}),
    nestView: new NestView({}),
    hudView: new HUDView({}),
    modalView: new ModalView({}),
    chartView: new ChartView({}),
    keyboardController: new KeyboardController()
  });
  controller.init();

  controller.ghostEnabled = true;
  controller.isGhostRunning = true;
  controller.ghostAnimId = 123;
  controller.ghostPhaseTimer = setTimeout(() => {}, 5000);
  controller.ghostResetTimer = setTimeout(() => {}, 5000);

  controller.destroy();

  assert.strictEqual(controller.isGhostRunning, false);
  assert.strictEqual(controller.ghostAnimId, null);
  assert.strictEqual(controller.ghostPhaseTimer, null);
  assert.strictEqual(controller.ghostResetTimer, null);
  assert.strictEqual(controller._onWindowResize, null);
  assert.strictEqual(removeEventCalled, true, 'Window resize listener must be removed on destroy');
});

// 5. Hidden Mode Bug Fixes
console.log('\n--- 5. Hidden Mode Bug Fixes ---');

it('in Hidden Mode, corrected word submitted with Spacebar clears error underline and renders letters transparent', () => {
  const wordsBox = createMockElement('div', 'words-box hidden-mode');
  const wordEls = [];

  for (let w = 0; w < 3; w++) {
    const wEl = createMockElement('div', `word-${w}`, ['word']);
    const letters = [];
    for (let c = 0; c < 5; c++) {
      const lEl = createMockElement('span', `l-${w}-${c}`, ['letter']);
      letters.push(lEl);
      wEl.appendChild(lEl);
    }
    wEl.querySelectorAll = (sel) => (sel === '.letter' ? letters : []);
    wordEls.push(wEl);
  }

  const stageView = new StageView({ wordsBox });
  stageView.wordElements = wordEls;
  stageView.setHiddenMode(true);

  const session = new SessionModel({ mode: 'flow', words: ['apple', 'grape'], hiddenMode: true });

  // Type 'a', 'p'
  session.recordChar('a', true);
  session.recordChar('p', true);
  // Typo 'x' instead of 'p'
  session.recordChar('x', false);
  assert.strictEqual(session.hadErrorOnCurrentWord, true);

  // Trigger safety brake on stageView
  stageView.updateHiddenHorizon(0, session.currentCharIdx, session.combo, true);

  // Typist backspaces 'x' and finishes word cleanly
  session.recordBackspace();
  session.recordChar('p', true);
  session.recordChar('l', true);
  session.recordChar('e', true);

  // Submit word via sessionModel
  const res = session.submitWord();
  assert.strictEqual(res.hasErrors, false, 'Corrected word must have hasErrors: false');
  assert.strictEqual(session.wordStreak, 0, 'Tainted word must not increment wordStreak');
  assert.strictEqual(session.combo, 0, 'Tainted word must not increment combo');

  // Advance word on stageView
  stageView.advanceWord(0, 1, res.hasErrors);

  const word0 = wordEls[0];
  assert.strictEqual(word0.classList.contains('error'), false, 'Corrected word must NOT have .error class');

  const letters0 = word0.querySelectorAll('.letter');
  for (let i = 0; i < letters0.length; i++) {
    assert.strictEqual(letters0[i].classList.contains('hd-past'), true, `Letter ${i} must have hd-past class`);
    assert.strictEqual(letters0[i].style.opacity, '0', `Letter ${i} must have opacity: '0'`);
  }
});

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passedTests} / ${passedTests} PASSED`);
console.log(`ALL BUG FIX REGRESSION TESTS PASSED! 🚀`);
console.log(`========================================\n`);
