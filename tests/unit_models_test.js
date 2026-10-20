/**
 * TypeFlow - Headless Unit Test Suite for Pure Models
 * Tests EventEmitter, Constants, WordsModel, FlowModel, SessionModel, and EggNestModel.
 * Runs in pure Node.js in milliseconds without JSDOM or browser dependencies.
 */

const assert = require('assert');
const path = require('path');

const { EventEmitter } = require('../src/core/EventEmitter.js');
const { CONSTANTS } = require('../src/core/Constants.js');
const { WordsModel, DICTIONARY, RAW_WORDS, classifyWordMotor, getSrsWeightedRandomWords } = require('../src/models/WordsModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');

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
console.log('⚡ TYPEFLOW PURE MODELS HEADLESS TEST SUITE');
console.log('========================================\n');

// 1. EventEmitter Tests
console.log('--- 1. EventEmitter ---');

it('subscribes and receives emitted events with arguments', () => {
  const emitter = new EventEmitter();
  let received = null;
  emitter.on('testEvent', (data) => { received = data; });
  emitter.emit('testEvent', { value: 42 });
  assert.deepStrictEqual(received, { value: 42 });
});

it('unsubscribes cleanly via returned unsubscribe function', () => {
  const emitter = new EventEmitter();
  let callCount = 0;
  const unsub = emitter.on('click', () => { callCount++; });
  emitter.emit('click');
  assert.strictEqual(callCount, 1);
  unsub();
  emitter.emit('click');
  assert.strictEqual(callCount, 1);
});

// 2. Constants Tests
console.log('\n--- 2. Constants & Topography ---');

it('defines all 4 progression rarity tiers with increasing XP rewards', () => {
  const tiers = CONSTANTS.RARITY_TIERS;
  assert.strictEqual(tiers.COMMON.xp, 10);
  assert.strictEqual(tiers.UNCOMMON.xp, 25);
  assert.strictEqual(tiers.RARE.xp, 60);
  assert.strictEqual(tiers.EPIC.xp, 150);
});

it('defines flow momentum thresholds correctly', () => {
  assert.strictEqual(CONSTANTS.FLOW.MOMENTUM_MAX, 1.20);
  assert.strictEqual(CONSTANTS.FLOW.APEX_THRESHOLD, 1.00);
  assert.strictEqual(CONSTANTS.FLOW.TRANSITION_THRESHOLD, 0.85);
});

// 3. WordsModel Tests
console.log('\n--- 3. WordsModel (Hydrated Dictionary & SRS) ---');

const wordsModel = new WordsModel();

it('hydrates exactly 1,000 words with "the" pinned to Rank 1', () => {
  assert.strictEqual(wordsModel.dictionary.length, 1000);
  const word1 = wordsModel.getWord(1);
  assert.strictEqual(word1.word, 'the');
  assert.strictEqual(word1.rank, 1);
});

it('looks up words by rank and by string', () => {
  const byRank = wordsModel.getWord(1);
  const byText = wordsModel.getWordByText('the');
  assert.strictEqual(byRank.word, 'the');
  assert.strictEqual(byText.rank, 1);
});

it('generates an SRS weighted batch conforming to flow momentum', () => {
  const batch = wordsModel.generateBatch(20, [1, 2, 3, 4, 5], {}, 40, 0.5);
  assert.strictEqual(batch.length, 20);
  batch.forEach(w => assert.ok(typeof w === 'string' && w.length > 0));
});

it('updates motor pattern heat on hits and errors', () => {
  const model = new WordsModel();
  const initialHeat = model.patternHeat.HOME_CORE;
  
  // Clean hit on HOME_CORE
  model.recordPatternHit(['HOME_CORE']);
  assert.ok(model.patternHeat.HOME_CORE >= initialHeat);

  // Error on HOME_CORE drops heat
  model.recordPatternError(['HOME_CORE']);
  assert.ok(model.patternHeat.HOME_CORE <= 1.0);
});

it('provides backward-compatible classifyWordMotor and getSrsWeightedRandomWords aliases', () => {
  assert.strictEqual(classifyWordMotor('the'), 'HOME_CORE');
  const words = getSrsWeightedRandomWords([1], {}, 40, 10, 0);
  assert.strictEqual(words.length, 10);
  assert.strictEqual(words[0], 'the');
});

it('rollNewEgg strictly excludes pending egg basket ranks and unlocked ranks', () => {
  const model = new WordsModel();
  const unlocked = [1, 2, 3];
  // Put ranks 4, 5, 28 ("which") into pending egg basket
  const pending = [
    { wordRank: 4 },
    { wordRank: 5 },
    { wordRank: 28 }
  ];

  for (let i = 0; i < 100; i++) {
    const egg = model.rollEgg(unlocked, 5, null, {}, 40, pending);
    assert.ok(!unlocked.includes(egg.wordRank), `Egg rank ${egg.wordRank} should not be in unlocked ranks`);
    assert.ok(![4, 5, 28].includes(egg.wordRank), `Egg rank ${egg.wordRank} ("${egg.word}") should not be in pending basket`);
  }
});

// 4. FlowModel Tests
console.log('\n--- 4. FlowModel (Flywheel Physics & Pacing) ---');

it('calculates earned XP and applies 0.25 penalty on errors', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  // Clean word at 50 WPM with baseXp = 20
  const cleanRes = flow.evaluateWord(false, 50, false, 0, 20);
  assert.strictEqual(cleanRes.earnedXp, 20); // 20 * 1.0 multiplier

  // Error word with baseXp = 20 -> 20 * 1.0 * 0.25 = 5
  const errRes = flow.evaluateWord(true, 50, false, 0, 20);
  assert.strictEqual(errRes.earnedXp, 5);
});

it('initializes at zero momentum and idle tier', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  assert.strictEqual(flow.momentum, 0.0);
  assert.strictEqual(flow.getTier(), 'idle');
  assert.strictEqual(flow.getMultiplier(), 1.0);
  assert.strictEqual(flow.getChallengeScale(), 0.35);
});

it('accelerates momentum on clean hits at or above target WPM', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  const res = flow.evaluateWord(false, 45, false, 0);
  assert.ok(flow.momentum > 0);
  assert.strictEqual(res.flowStreak, 1);
});

it('caps flywheel momentum strictly at 120% (1.20)', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  for (let i = 0; i < 30; i++) {
    flow.evaluateWord(false, 80, false, 0);
  }
  assert.strictEqual(flow.momentum, 120.0);
  assert.strictEqual(flow.getTier(), 'apex');
  assert.strictEqual(flow.getMultiplier(), 3.0);
  assert.strictEqual(flow.getChallengeScale(), 1.25);
});

it('applies dampened stumble penalty (-8%) in Apex when typing slow clean word', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 120.0;
  flow.evaluateWord(false, 30, false, 0); // Clean but slow (30 < 40)
  assert.strictEqual(flow.momentum, 112.0); // 120 - 8 = 112
});

it('wipes cushion and applies -25% penalty on uncorrected error', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 115.0; // In cushion
  flow.evaluateWord(true, 50, false, 0); // Has uncorrected errors
  // Cushion wiped to 100, then -25% -> 75%
  assert.strictEqual(flow.momentum, 75.0);
  assert.strictEqual(flow.flowStreak, 0);
  assert.strictEqual(flow.consecutiveCleanWords, 0);
});

it('applies idle decay when user pauses past the grace period', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 100.0;
  flow.eggCharge = 50.0;
  const t0 = 10000;
  flow.recordKeystroke(t0);
  // Grace period at 100 momentum is 3000ms. Check at t0 + 4000ms (1000ms over grace)
  const decayAmount = flow.applyIdleDecay(t0 + 4000, 0.20);
  assert.ok(decayAmount > 0);
  assert.ok(flow.momentum < 100.0);
  assert.ok(flow.eggCharge < 50.0);
});

it('accumulates eggCharge when in Flow (momentum >= 100) and applies combo bonuses', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 100.0;
  assert.strictEqual(flow.eggCharge, 0.0);

  // Word 1: Clean and on-pace (40 WPM, momentum reaches cushion > 100)
  // Base (3.0) + Apex cushion (1.0) = 4.0
  let res = flow.evaluateWord(false, 40, false, 0);
  assert.strictEqual(res.eggCharge, 4.0);
  assert.strictEqual(res.comboTier, 'baseline');

  // Push streak to 5 clean words in Apex cushion (>100 momentum, >=50 WPM for speed surge)
  // Base (3.0) + heated combo (1.0) + apex (1.0) + speed (1.0) = 6.0
  flow.consecutiveCleanWords = 4; // next will be word 5
  flow.momentum = 105.0; // in cushion
  res = flow.evaluateWord(false, 55, false, 0); // 55 >= 40 * 1.25 (50)
  assert.strictEqual(res.comboTier, 'heated');
  // 4.0 (old) + 6.0 = 10.0
  assert.strictEqual(res.eggCharge, 10.0);

  // Peak rate test: streak >= 15 (transcendence: 3.5), cushion (1.0), speed surge (1.0), base (3.0) = 8.5
  flow.consecutiveCleanWords = 14;
  flow.momentum = 110.0;
  res = flow.evaluateWord(false, 60, false, 0);
  assert.strictEqual(res.comboTier, 'transcendence');
  assert.strictEqual(Math.round((res.eggCharge - 10.0) * 10) / 10, 8.5);
});

it('triggers eggRollSuccess at 100% charge and resets eggCharge to 0', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 100.0;
  flow.eggCharge = 98.0;

  // Clean hit adds at least 3.0 -> reaches >= 100
  const res = flow.evaluateWord(false, 45, false, 0);
  assert.strictEqual(res.eggRollSuccess, true);
  assert.strictEqual(res.eggCharge, 0.0);
});

it('freezes eggCharge at 0 when egg basket is full (3/3)', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 100.0;
  flow.eggCharge = 40.0;

  // When basketCount is 3, charge is frozen/dormant at 0
  const res = flow.evaluateWord(false, 50, false, 3);
  assert.strictEqual(res.eggCharge, 0.0);
  assert.strictEqual(res.eggRollSuccess, false);
});

it('applies -12% penalty on typo and -3% on below-pace word with 0% floor', () => {
  const flow = new FlowModel({ targetWpm: 40 });
  flow.momentum = 100.0;
  flow.eggCharge = 20.0;

  // Below pace word: -3.0
  let res = flow.evaluateWord(false, 30, false, 0);
  assert.strictEqual(res.eggCharge, 17.0);

  // Typo: -12.0
  res = flow.evaluateWord(true, 45, false, 0);
  assert.strictEqual(res.eggCharge, 5.0);

  // Another typo: drops to floor 0.0
  res = flow.evaluateWord(true, 45, false, 0);
  assert.strictEqual(res.eggCharge, 0.0);
});

// 5. SessionModel Tests
console.log('\n--- 5. SessionModel (Keystroke Engine & Metrics) ---');

it('tracks typed characters, correct count, and instantaneous WPM', () => {
  const session = new SessionModel({ mode: 'flow', words: ['the', 'quick'] });
  const t0 = 100000;
  session.recordChar('t', true, t0);
  session.recordChar('h', true, t0 + 150);
  session.recordChar('e', true, t0 + 300);

  assert.strictEqual(session.correctKeystrokes, 3);
  assert.strictEqual(session.rawKeystrokes, 3);
  assert.strictEqual(session.currentCharIdx, 3);
  assert.ok(session.isActive);
});

it('handles backspace and tracks fixed stumbles', () => {
  const session = new SessionModel({ mode: 'flow', words: ['the'] });
  const t0 = 100000;
  session.recordChar('t', true, t0);
  session.recordChar('x', false, t0 + 100); // Typo
  assert.strictEqual(session.currentCharIdx, 2);

  session.recordBackspace(t0 + 200);
  assert.strictEqual(session.currentCharIdx, 1);
  assert.strictEqual(session.hadBackspaceOnCurrentWord, true);

  session.recordChar('h', true, t0 + 300);
  session.recordChar('e', true, t0 + 400);

  const res = session.submitWord(false, 0, 0, t0 + 500);
  assert.strictEqual(res.hadBackspace, true);
  assert.strictEqual(res.hasErrors, false);
  assert.strictEqual(session.totalFixedErrors, 1);
});

it('autonomously detects errors and extra letters in submitWord() without DOM arguments', () => {
  const session = new SessionModel({ mode: 'flow', words: ['cat'] });
  session.recordChar('c');
  session.recordChar('a');
  session.recordChar('x'); // typo

  // Calling submitWord with zero arguments auto-detects error
  const res = session.submitWord();
  assert.strictEqual(res.hasErrors, true);
  assert.strictEqual(res.missedLetters, 0);
});

it('recordBackspace() returns targetIdx, fixedError, and isExtra autonomously', () => {
  const session = new SessionModel({ mode: 'flow', words: ['cat'] });
  session.recordChar('c');
  session.recordChar('a');
  session.recordChar('t');
  session.recordChar('s'); // extra character at idx 3

  const bs1 = session.recordBackspace();
  assert.strictEqual(bs1.targetIdx, 3);
  assert.strictEqual(bs1.isExtra, true);
  assert.strictEqual(bs1.fixedError, true);

  // Backspacing normal correct character 't'
  const bs2 = session.recordBackspace();
  assert.strictEqual(bs2.targetIdx, 2);
  assert.strictEqual(bs2.isExtra, false);
});

it('calculates Classic Mode countdown and final statistics', () => {
  const session = new SessionModel({ mode: 'classic', duration: 30, words: ['hello'] });
  session.start(10000);
  for (let i = 0; i < 150; i++) {
    session.recordChar('a', true, 10000 + i * 150);
  }

  // Tick timer down
  for (let s = 0; s < 30; s++) {
    session.tickTimer(10000 + s * 1000);
  }

  assert.strictEqual(session.isFinished, true);
  const stats = session.calculateFinalStats();
  assert.ok(stats.wpm > 0);
  assert.strictEqual(stats.accuracy, 100);
  assert.strictEqual(stats.duration, 30);
});

// 6. EggNestModel Tests
console.log('\n--- 6. EggNestModel (3-Slot In-Situ Nest & Hatchery) ---');

it('synchronizes egg basket up to 3 slots', () => {
  const nest = new EggNestModel();
  nest.syncBasket([
    { id: 1, name: 'Common Egg', rarity: 'common' },
    { id: 2, name: 'Rare Egg', rarity: 'rare' }
  ]);
  assert.strictEqual(nest.basket.length, 2);
  const slot0 = nest.getSlotStatus(0);
  assert.strictEqual(slot0.state, 'occupied');
  assert.strictEqual(slot0.egg.name, 'Common Egg');

  const slot2 = nest.getSlotStatus(2);
  assert.strictEqual(slot2.state, 'empty');
});

it('processes in-situ crack progression when typing "e", "g", "g"', () => {
  const nest = new EggNestModel();
  nest.syncBasket([{ id: 1, name: 'Common Egg', rarity: 'common' }]);
  
  const entered = nest.enterHatchMode(0);
  assert.strictEqual(entered, true);
  assert.strictEqual(nest.isHatching(), true);

  // Type 'e'
  const step1 = nest.processHatchKey('e');
  assert.strictEqual(step1.status, 'progress');
  assert.strictEqual(step1.hatchTyped, 'e');

  // Type wrong key 'x' -> error wobble
  const stepErr = nest.processHatchKey('x');
  assert.strictEqual(stepErr.status, 'error');

  // Type 'g' -> progress to 'eg'
  const step2 = nest.processHatchKey('g');
  assert.strictEqual(step2.status, 'progress');
  assert.strictEqual(step2.hatchTyped, 'eg');

  // Type 'g' -> completes hatch!
  const step3 = nest.processHatchKey('g');
  assert.strictEqual(step3.status, 'complete');
  assert.strictEqual(step3.hatchTyped, 'egg');

  // Record hatch result
  nest.recordHatch('starlight', { name: 'Common Egg', tierColor: '#38bdf8' });
  assert.strictEqual(nest.basket.length, 0); // Removed from basket
  const slot0After = nest.getSlotStatus(0);
  assert.strictEqual(slot0After.state, 'revealed');
  assert.strictEqual(slot0After.data.word, 'starlight');

  // Clear revealed slots after user types next word
  const cleared = nest.clearRevealedSlots();
  assert.strictEqual(cleared, true);
  assert.strictEqual(nest.getSlotStatus(0).state, 'empty');
});

it('processHatchBackspace() correctly decrements hatch progress and emits event', () => {
  const nest = new EggNestModel();
  nest.syncBasket([{ id: 1, name: 'Egg', rarity: 'common' }]);
  nest.enterHatchMode(0);

  nest.processHatchKey('e');
  nest.processHatchKey('g');
  assert.strictEqual(nest.hatchTyped, 'eg');

  let emittedStage = -1;
  nest.on('crackProgress', (data) => { emittedStage = data.stage; });

  const handled = nest.processHatchBackspace();
  assert.strictEqual(handled, true);
  assert.strictEqual(nest.hatchTyped, 'e');
  assert.strictEqual(emittedStage, 1);
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL PURE MODEL UNIT TESTS PASSED! 🚀');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  console.log('========================================\n');
  process.exit(1);
}
