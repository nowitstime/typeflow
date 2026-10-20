/**
 * TypeFlow - Headless Unit Test Suite for Pure Models
 * Tests EventEmitter, Constants, WordsModel, FlowModel, SessionModel, and EggNestModel.
 * Runs in pure Node.js in milliseconds without JSDOM or browser dependencies.
 */

const assert = require('assert');
const path = require('path');

const { EventEmitter } = require('../src/core/EventEmitter.js');
const { CONSTANTS } = require('../src/core/Constants.js');
const { WordsModel, DICTIONARY, RAW_WORDS, classifyWordMotor, getSrsWeightedRandomWords, getAnchorWords, createWordSandwich, calculateWordWeight } = require('../src/models/WordsModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { BigramLedger } = require('../src/models/BigramLedger.js');
const { StageView } = require('../src/views/StageView.js');

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

it('defines all 5 asymmetric progression rarity tiers with increasing XP rewards', () => {
  const tiers = CONSTANTS.RARITY_TIERS;
  assert.strictEqual(tiers.STARTER.xp, 8);
  assert.strictEqual(tiers.COMMON.xp, 15);
  assert.strictEqual(tiers.UNCOMMON.xp, 35);
  assert.strictEqual(tiers.RARE.xp, 80);
  assert.strictEqual(tiers.EPIC.xp, 180);
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

it('assigns 5 asymmetric tiers across the 1,000 words conforming to specification', () => {
  assert.strictEqual(wordsModel.dictionary.length, 1000);
  const starterWords = wordsModel.dictionary.filter(w => w.tier === 'STARTER');
  const commonWords = wordsModel.dictionary.filter(w => w.tier === 'COMMON');
  const uncommonWords = wordsModel.dictionary.filter(w => w.tier === 'UNCOMMON');
  const rareWords = wordsModel.dictionary.filter(w => w.tier === 'RARE');
  const epicWords = wordsModel.dictionary.filter(w => w.tier === 'EPIC');

  assert.strictEqual(starterWords.length, 40);
  assert.strictEqual(commonWords.length, 260);
  assert.strictEqual(uncommonWords.length, 300);
  assert.strictEqual(rareWords.length, 250);
  assert.strictEqual(epicWords.length, 150);

  // Top 40 words must include "the" pinned to Rank 1 and have short/smooth flow
  assert.strictEqual(starterWords[0].word, 'the');
  assert.strictEqual(starterWords[0].rank, 1);
});

it('early-game gacha draws heavily from Tier 0 (Starter pool) for typists with < 30 unlocked words', () => {
  const unlocked = [1];
  const rolls = [];
  for (let i = 0; i < 100; i++) {
    rolls.push(wordsModel.rollEgg(unlocked, 5, null, {}, 40, []));
  }
  const starterRolls = rolls.filter(e => e.rarity === 'starter');
  // Expected ~85% starter eggs
  assert.ok(starterRolls.length >= 70, `Expected at least 70% starter eggs in early onboarding, got ${starterRolls.length}%`);
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

// 7. BigramLedger & i+1 Bridge Scaffolding
console.log('\n--- 7. BigramLedger & i+1 Scaffolding ---');

it('records clean transition at or under target WPM interval with maximum speed score (1.0)', () => {
  const ledger = new BigramLedger();
  // 40 WPM target -> 12000 / 40 = 300ms interval
  // Clean hit at 250ms (<= 300ms) -> S_bg = 1.0, A_bg = 1.0 -> M_instant = 1.0
  const m1 = ledger.recordTransition('t', 'h', 250, true, 40);
  assert.strictEqual(m1, 1.0);
  assert.strictEqual(ledger.isStrong('th'), true);
  assert.strictEqual(ledger.isWeak('th'), false);

  // Second keystroke: Hesitation at 600ms (halfway between 300 and 900 -> S_bg = 0.5), mistyped (A_bg = 0.0)
  // M_instant = 0.6 * 0.5 + 0.4 * 0 = 0.30
  // EMA update: (1 - 0.15) * 1.0 + 0.15 * 0.30 = 0.85 + 0.045 = 0.895
  const m2 = ledger.recordTransition('t', 'h', 600, false, 40);
  assert.strictEqual(m2, 0.895);
  assert.strictEqual(ledger.isStrong('th'), true);
});

it('identifies weak transitions and returns top weakest bigrams', () => {
  const ledger = new BigramLedger();
  // Severe hesitation + error: 1000ms transition with typo -> S_bg = 0, A_bg = 0 -> M = 0
  ledger.recordTransition('s', 'f', 1000, false, 40);
  ledger.recordTransition('u', 'n', 800, false, 40);
  ledger.recordTransition('e', 'd', 750, false, 40);
  ledger.recordTransition('i', 'n', 200, true, 40); // Clean

  assert.strictEqual(ledger.isWeak('sf'), true);
  assert.strictEqual(ledger.isWeak('un'), true);
  assert.strictEqual(ledger.isWeak('ed'), true);
  assert.strictEqual(ledger.isWeak('in'), false);

  const weakest = ledger.getWeakestBigrams(2);
  assert.strictEqual(weakest.length, 2);
  assert.ok(weakest.includes('sf'));
});

it('evaluates early-game Confidence Words (< 35 words unlocked)', () => {
  const ledger = new BigramLedger();
  // Populate strong bigrams for "flow" ('fl', 'lo', 'ow')
  ledger.recordTransition('f', 'l', 200, true, 40);
  ledger.recordTransition('l', 'o', 200, true, 40);
  ledger.recordTransition('o', 'w', 200, true, 40);

  // Confidence word: all bigrams strong (or at most 1 unseen), 0 weak -> 2.0x weight
  const eval1 = ledger.evaluateWordBridgeBonus('flow', 10);
  assert.strictEqual(eval1.classification, 'confidence');
  assert.strictEqual(eval1.weight, 2.0);

  // Word with weak bigram: not confidence
  ledger.recordTransition('b', 'a', 900, false, 40); // weak 'ba'
  const eval2 = ledger.evaluateWordBridgeBonus('bad', 10);
  assert.strictEqual(eval2.classification, 'standard');
  assert.strictEqual(eval2.weight, 1.0);
});

it('evaluates standard-play Bridge Words, Pure Comfort, and Overload (35+ words unlocked)', () => {
  const ledger = new BigramLedger();
  // Set up strong bigrams: 'st', 'ar'
  ledger.recordTransition('s', 't', 200, true, 40);
  ledger.recordTransition('a', 'r', 200, true, 40);
  // Set up 1 weak bigram: 'ta'
  ledger.recordTransition('t', 'a', 900, false, 40);

  // "star" has bigrams ['st', 'ta', 'ar']. Total = 3 bigrams.
  // Weak = 1 ('ta'), Strong = 2 ('st', 'ar').
  // This is a Bridge Word! (1 Weak + >= 75% / remaining Strong) -> 2.5x weight
  const bridgeEval = ledger.evaluateWordBridgeBonus('star', 40);
  assert.strictEqual(bridgeEval.classification, 'bridge');
  assert.strictEqual(bridgeEval.weight, 2.5);

  // Pure comfort word (0 weak bigrams) -> 1.2x weight
  const comfortEval = ledger.evaluateWordBridgeBonus('so', 40);
  assert.strictEqual(comfortEval.classification, 'comfort');
  assert.strictEqual(comfortEval.weight, 1.2);

  // Overload word (>= 2 weak bigrams) -> 0.15x weight
  ledger.recordTransition('o', 'u', 900, false, 40);
  ledger.recordTransition('u', 't', 900, false, 40);
  const overloadEval = ledger.evaluateWordBridgeBonus('out', 40);
  assert.strictEqual(overloadEval.classification, 'overload');
  assert.strictEqual(overloadEval.weight, 0.15);
});

it('WordsModel.rollEgg scores candidate pool with N-Gram Bridge Bonus', () => {
  const model = new WordsModel();
  const ledger = new BigramLedger();
  const egg = model.rollEgg([1, 2, 3], 5, null, {}, 40, [], ledger);
  assert.ok(egg.wordRank);
  assert.ok(egg.word);
  assert.ok(['confidence', 'standard', 'bridge', 'comfort', 'overload', null].includes(egg.bridgeBonus));
});

// 8. Flow-Aware Dual-Mode Spawner (Drill vs Surf at 90%) & Sandwiched Induction
console.log('\n--- 8. Dual-Mode Spawner (90% Threshold) & Sandwiched Induction ---');

it('Drill Mode (< 90% Flow) aggressively boosts words targeting player weakest bigrams', () => {
  const ledger = new BigramLedger();
  // Mark 'th' as weak
  ledger.recordTransition('t', 'h', 950, false, 40);
  assert.strictEqual(ledger.isWeak('th'), true);

  const wordWithWeak = { word: 'the', rank: 1, tags: ['Home Core Flow'] };
  const neutralWord  = { word: 'so', rank: 20, tags: ['Home Core Flow'] };

  // At 50% momentum (< 90% threshold: Drill Mode)
  const weightWeak = calculateWordWeight(wordWithWeak, {}, 40, 50, ledger, ['th'], 40);
  const weightNeutral = calculateWordWeight(neutralWord, {}, 40, 50, ledger, ['th'], 40);

  // Weak bigram word receives +4.0 deliberate practice boost
  assert.ok(weightWeak >= 5.0, `Expected weight >= 5.0, got ${weightWeak}`);
  assert.ok(weightWeak > weightNeutral + 3.0, `Expected weak word weight to be > neutral word weight by at least 3.0`);
});

it('Surf Mode (>= 90% Flow) completely suppresses Overload words and prioritizes Anchor words (>= 85%)', () => {
  const ledger = new BigramLedger();
  // Word 'out' has 2 weak bigrams ('ou', 'ut') -> Overload
  ledger.recordTransition('o', 'u', 900, false, 40);
  ledger.recordTransition('u', 't', 900, false, 40);

  // Word 'the' has 0 weak bigrams -> Anchor
  ledger.recordTransition('t', 'h', 200, true, 40);
  ledger.recordTransition('h', 'e', 200, true, 40);

  const overloadWord = { word: 'out', rank: 35, tags: [] };
  const anchorWord = { word: 'the', rank: 1, tags: [] };

  // At 95% momentum (>= 90% threshold: Surf Mode)
  const overloadWeight = calculateWordWeight(overloadWord, {}, 40, 95, ledger, [], 40);
  const anchorWeight = calculateWordWeight(anchorWord, {}, 40, 95, ledger, [], 40);

  // Overload words strictly suppressed to protect rhythm
  assert.strictEqual(overloadWeight, 0.001);
  // Anchor words given high weight (>= 4.5)
  assert.ok(anchorWeight >= 4.5, `Expected anchor weight >= 4.5, got ${anchorWeight}`);

  // Generate batch in Surf Mode: Overload words should NEVER be generated
  const model = new WordsModel();
  // Pool containing 'the' (rank 1), and suppose an overload word is present
  const batch = model.generateBatch(100, [1, 2, 3, 4, 5], {}, 40, 95, ledger);
  assert.strictEqual(batch.length, 100);
  assert.strictEqual(batch.includes('out'), false, 'Overload word must be 0% in Surf Mode');
});

it('getAnchorWords identifies reliable words with 0 weak bigrams', () => {
  const ledger = new BigramLedger();
  // 'th' is strong, 'he' is strong
  ledger.recordTransition('t', 'h', 200, true, 40);
  ledger.recordTransition('h', 'e', 200, true, 40);

  const anchors = getAnchorWords([1, 2, 3, 4, 5], DICTIONARY, {}, ledger);
  assert.ok(anchors.length > 0);
  assert.strictEqual(anchors[0].word, 'the');
});

it('createWordSandwich wraps newly unlocked words between launchpad and landing pad', () => {
  const ledger = new BigramLedger();
  ledger.recordTransition('t', 'h', 200, true, 40);
  ledger.recordTransition('h', 'e', 200, true, 40);

  // New word: 'question' (starts with 'q' [Left Hand])
  const sandwich = createWordSandwich('question', [1, 2, 3, 4, 5], DICTIONARY, {}, ledger);

  assert.strictEqual(sandwich.length, 3);
  assert.strictEqual(sandwich[1], 'question');
  assert.ok(sandwich[0].length > 0);
  assert.ok(sandwich[2].length > 0);
  assert.notStrictEqual(sandwich[0], 'question');
  assert.notStrictEqual(sandwich[2], 'question');
});

it('SessionModel.insertWordsAt dynamically splices words into upcoming stream', () => {
  const session = new SessionModel({ words: ['alpha', 'bravo', 'charlie', 'delta'] });
  session.currentWordIdx = 0;

  session.insertWordsAt(2, ['sandwich1', 'target', 'sandwich2']);
  assert.deepStrictEqual(session.words, ['alpha', 'bravo', 'sandwich1', 'target', 'sandwich2', 'charlie', 'delta']);
});

// 9. Hidden (HD) Look-Ahead Logic & Geometry
console.log('\n--- 9. Hidden (HD) Look-Ahead Logic & Geometry ---');

it('calculates fade opacity across distances and horizons accurately', () => {
  // When zeroDist <= 0 (zero character fade at start of combo): all distances are fully visible (100%)
  assert.strictEqual(StageView.calculateOpacity(0, 4, 0), 1);
  assert.strictEqual(StageView.calculateOpacity(1, 4, 0), 1);
  assert.strictEqual(StageView.calculateOpacity(2, 4, 0), 1);
  assert.strictEqual(StageView.calculateOpacity(5, 4, 0), 1);

  // At or within zeroDist = 2 characters from cursor: vanished (0% capacity)
  assert.strictEqual(StageView.calculateOpacity(0, 6, 2), 0);
  assert.strictEqual(StageView.calculateOpacity(1, 6, 2), 0);
  assert.strictEqual(StageView.calculateOpacity(2, 6, 2), 0);

  // Ahead of cursor when zeroDist = 2, N = 6: gradual 25% increments
  // d=3: (3 - 2) / 4 = 0.25
  assert.strictEqual(StageView.calculateOpacity(3, 6, 2), 0.25);
  // d=4: (4 - 2) / 4 = 0.50
  assert.strictEqual(StageView.calculateOpacity(4, 6, 2), 0.50);
  // d=5: (5 - 2) / 4 = 0.75
  assert.strictEqual(StageView.calculateOpacity(5, 6, 2), 0.75);
  // d>=N: full opacity
  assert.strictEqual(StageView.calculateOpacity(6, 6, 2), 1);
  assert.strictEqual(StageView.calculateOpacity(7, 6, 2), 1);

  // When zeroDist = 1, N = 5:
  assert.strictEqual(StageView.calculateOpacity(1, 5, 1), 0);
  assert.strictEqual(StageView.calculateOpacity(2, 5, 1), 0.25);
  assert.strictEqual(StageView.calculateOpacity(3, 5, 1), 0.50);
  assert.strictEqual(StageView.calculateOpacity(4, 5, 1), 0.75);
  assert.strictEqual(StageView.calculateOpacity(5, 5, 1), 1);
});

it('SessionModel.getBlindfoldMask calculates fast phase and decelerating slow phase', () => {
  // Fast Phase (combo <= 26): M = combo * 0.25
  assert.strictEqual(SessionModel.getBlindfoldMask(0), 0.0);
  assert.strictEqual(SessionModel.getBlindfoldMask(1), 0.25);
  assert.strictEqual(SessionModel.getBlindfoldMask(2), 0.50);
  assert.strictEqual(SessionModel.getBlindfoldMask(4), 1.0);
  assert.strictEqual(SessionModel.getBlindfoldMask(10), 2.5);
  assert.strictEqual(SessionModel.getBlindfoldMask(26), 6.5);

  // Slow Phase (combo > 26): M = 6.5 + 0.75 * Math.sqrt(combo - 26)
  // combo = 90 -> 90 - 26 = 64, sqrt(64) = 8 -> 6.5 + 0.75 * 8 = 12.5 (2 hidden words)
  assert.strictEqual(SessionModel.getBlindfoldMask(90), 12.5);

  // combo = 282 -> 282 - 26 = 256, sqrt(256) = 16 -> 6.5 + 0.75 * 16 = 18.5
  assert.strictEqual(SessionModel.getBlindfoldMask(282), 18.5);

  // Negative combo handled safely
  assert.strictEqual(SessionModel.getBlindfoldMask(-5), 0.0);
});

it('SessionModel.getHiddenOpacity quantizes opacity to 0.25 steps and keeps k <= 0 visible', () => {
  // Active cursor and past letters (k <= 0) must always return 1.0
  assert.strictEqual(SessionModel.getHiddenOpacity(0, 100), 1.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(-1, 100), 1.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(-5, 0), 1.0);

  // combo = 0 (M = 0.0): all upcoming characters are 1.0
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 0), 1.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 0), 1.0);

  // combo = 1 (M = 0.25): k=1 penetration = 0.25, raw = 0.75, quantized = 0.75
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 1), 0.75);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 1), 1.0);

  // combo = 2 (M = 0.50): k=1 penetration = 0.50, raw = 0.50, quantized = 0.50
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 2), 0.50);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 2), 1.0);

  // combo = 3 (M = 0.75): k=1 penetration = 0.75, raw = 0.25, quantized = 0.25
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 3), 0.25);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 3), 1.0);

  // combo = 4 (M = 1.00): k=1 penetration = 1.00, raw = 0.00, quantized = 0.00 (blindfold fully overtakes char 1)
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 4), 0.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 4), 1.0);

  // combo = 5 (M = 1.25): k=1 is 0.0, k=2 penetration = 0.25 -> 0.75
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 5), 0.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 5), 0.75);
  assert.strictEqual(SessionModel.getHiddenOpacity(3, 5), 1.0);

  // combo = 8 (M = 2.00): k=1 is 0.0, k=2 is 0.0, k=3 is 1.0
  assert.strictEqual(SessionModel.getHiddenOpacity(1, 8), 0.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(2, 8), 0.0);
  assert.strictEqual(SessionModel.getHiddenOpacity(3, 8), 1.0);
});

it('SessionModel tracks consecutive correct keystroke combo streak', () => {
  const session = new SessionModel({ words: ['the', 'quick'] });
  assert.strictEqual(session.combo, 0);

  // Type correct 't', 'h', 'e'
  session.recordChar('t', true);
  assert.strictEqual(session.combo, 1);
  assert.strictEqual(session.getBlindfoldMask(), 0.25);

  session.recordChar('h', true);
  assert.strictEqual(session.combo, 2);

  session.recordChar('e', true);
  assert.strictEqual(session.combo, 3);

  // Backspace decrements combo
  session.recordBackspace();
  assert.strictEqual(session.combo, 2);

  // Re-type 'e'
  session.recordChar('e', true);
  assert.strictEqual(session.combo, 3);

  // Typo resets combo to 0
  session.recordChar('z', false);
  assert.strictEqual(session.combo, 0);
  assert.strictEqual(session.getBlindfoldMask(), 0.0);

  // Backspace from 0 doesn't go below 0
  session.recordBackspace();
  assert.strictEqual(session.combo, 0);

  // Re-type 'e' correctly
  session.recordChar('e', true);
  assert.strictEqual(session.combo, 1);

  // Submit word cleanly: space key counts as consecutive stroke (+1)
  session.submitWord(false);
  assert.strictEqual(session.combo, 2);

  // Submitting word with error resets combo
  session.submitWord(true);
  assert.strictEqual(session.combo, 0);
});

it('SessionModel scales Hidden zeroDist and fadeDepth: 0 at start, 1..5, and 0.5/word after word 6', () => {
  // Streak 0 (start of combo): 0 character fade
  assert.strictEqual(SessionModel.calculateHiddenZeroDist(0), 0);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(0), 4.0);

  // Words 1 to 5: 1, 2, 3, 4, 5
  assert.strictEqual(SessionModel.calculateHiddenZeroDist(1), 1);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(1), 5.0);

  assert.strictEqual(SessionModel.calculateHiddenZeroDist(2), 2);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(2), 6.0);

  assert.strictEqual(SessionModel.calculateHiddenZeroDist(3), 3);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(3), 7.0);

  assert.strictEqual(SessionModel.calculateHiddenZeroDist(4), 4);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(4), 8.0);

  assert.strictEqual(SessionModel.calculateHiddenZeroDist(5), 5);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(5), 9.0);

  // Word 6+: scales by half a character per word (+0.5)
  assert.strictEqual(SessionModel.calculateHiddenZeroDist(6), 5.5);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(6), 9.5);

  assert.strictEqual(SessionModel.calculateHiddenZeroDist(7), 6.0);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(7), 10.0);

  assert.strictEqual(SessionModel.calculateHiddenZeroDist(8), 6.5);
  assert.strictEqual(SessionModel.calculateHiddenFadeDepth(8), 10.5);
});

it('SessionModel.wordStreak increments on clean words and resets on error', () => {
  const session = new SessionModel({ words: ['one', 'two', 'three'] });
  assert.strictEqual(session.wordStreak, 0);

  // Submit word 0 cleanly
  session.submitWord(false);
  assert.strictEqual(session.wordStreak, 1);

  // Submit word 1 cleanly
  session.submitWord(false);
  assert.strictEqual(session.wordStreak, 2);

  // Submit word 2 with uncorrected error -> resets
  session.submitWord(true);
  assert.strictEqual(session.wordStreak, 0);
});

it('SessionModel.hasErrorInCurrentWord detects errors and fixes via backspace', () => {
  const session = new SessionModel({ words: ['flow'] });
  assert.strictEqual(session.hasErrorInCurrentWord(), false);

  // Correct hit 'f'
  session.recordChar('f', true, false);
  assert.strictEqual(session.hasErrorInCurrentWord(), false);

  // Mistyped 'x' instead of 'l'
  session.recordChar('x', false, false);
  assert.strictEqual(session.hasErrorInCurrentWord(), true);

  // Backspace fixes the error
  session.recordBackspace();
  assert.strictEqual(session.hasErrorInCurrentWord(), false);

  // Correct 'l'
  session.recordChar('l', true, false);
  assert.strictEqual(session.hasErrorInCurrentWord(), false);

  // Extra characters count as error
  session.recordChar('o', true, false);
  session.recordChar('w', true, false);
  assert.strictEqual(session.hasErrorInCurrentWord(), false);
  session.recordChar('s', false, true); // extra letter
  assert.strictEqual(session.hasErrorInCurrentWord(), true);
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
