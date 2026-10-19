/**
 * TypeFlow - Headless Unit Test Suite for Services
 * Tests StorageService and AudioService in pure Node.js.
 */

const assert = require('assert');
const { StorageService, STORAGE_KEYS, DEFAULT_GAME_SAVE } = require('../src/services/StorageService.js');
const { AudioService } = require('../src/services/AudioService.js');

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
    this.state = 'running';
  }
}

global.AudioContext = AudioContextMock;

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
console.log('⚡ TYPEFLOW SERVICES HEADLESS TEST SUITE');
console.log('========================================\n');

// 1. StorageService Tests
console.log('--- 1. StorageService ---');

it('initializes Ground Zero save if empty', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);
  const save = service.getGameSave();

  assert.strictEqual(save.level, 1);
  assert.strictEqual(save.currentXp, 0);
  assert.deepStrictEqual(save.unlockedRanks, [1]);
  assert.deepStrictEqual(save.eggBasket, []);
});

it('records classic test and updates personal best', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  service.recordClassicTest(30, 85, 92, 98, 90, 450, 45);
  const stats = service.getClassicStats();

  assert.strictEqual(stats.totalTests, 1);
  assert.strictEqual(stats.personalBests['30'].wpm, 85);
  assert.strictEqual(stats.personalBests['30'].acc, 98);
});

it('handles multi-level XP advancement and awards bonus rarity eggs', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  // Add 1,500 XP to jump multiple levels
  const res = service.addXp(1500);
  assert.strictEqual(res.leveledUp, true);
  assert.ok(res.newLevel > 1);
  assert.ok(res.save.level > 1);
});

it('enforces strict 3-slot cap on egg nest', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  assert.strictEqual(service.addEgg({ id: 1, name: 'Egg 1' }).success, true);
  assert.strictEqual(service.addEgg({ id: 2, name: 'Egg 2' }).success, true);
  assert.strictEqual(service.addEgg({ id: 3, name: 'Egg 3' }).success, true);

  // 4th egg must be rejected
  const res = service.addEgg({ id: 4, name: 'Egg 4' });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.reason, 'Nest full');
  assert.strictEqual(service.getGameSave().eggBasket.length, 3);
});

it('hatches egg, unlocks progression rank, and removes from basket', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  service.addEgg({ id: 1, name: 'Star Egg', wordRank: 42 });
  const hatchRes = service.hatchEgg(0);

  assert.strictEqual(hatchRes.success, true);
  assert.strictEqual(hatchRes.egg.wordRank, 42);
  assert.strictEqual(hatchRes.save.eggBasket.length, 0);
  assert.ok(hatchRes.save.unlockedRanks.includes(42));
});

it('updates and decays SRS word telemetry', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  // 1. Submit word with uncorrected error
  let save = service.updateWordStat(1, true, false, 30, 40);
  assert.strictEqual(save.wordStats[1].unfixedErr, 1.0);
  assert.strictEqual(save.wordStats[1].streak, 0);

  // 2. Submit clean hit at target pace -> decays error by -0.25
  save = service.updateWordStat(1, false, false, 50, 40);
  assert.strictEqual(save.wordStats[1].unfixedErr, 0.75);
  assert.strictEqual(save.wordStats[1].streak, 1);
});

it('persists and retrieves active mode ("classic" | "flow")', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  assert.strictEqual(service.getActiveMode(), 'flow');
  service.setActiveMode('classic');
  assert.strictEqual(service.getActiveMode(), 'classic');
  service.setActiveMode('flow');
  assert.strictEqual(service.getActiveMode(), 'flow');
});

it('updates and persists high streak record', () => {
  const mock = new LocalStorageMock();
  const service = new StorageService(mock);

  assert.strictEqual(service.getGameSave().highStreak, 0);
  service.updateHighStreak(12);
  assert.strictEqual(service.getGameSave().highStreak, 12);

  // Lower streak does not overwrite high streak
  service.updateHighStreak(8);
  assert.strictEqual(service.getGameSave().highStreak, 12);

  // Higher streak updates it
  service.updateHighStreak(25);
  assert.strictEqual(service.getGameSave().highStreak, 25);
});

// 2. AudioService Tests
console.log('\n--- 2. AudioService ---');

it('initializes and manages sound enabled preference', () => {
  const audio = new AudioService();
  assert.strictEqual(audio.isEnabled(), false);

  audio.setEnabled(true);
  assert.strictEqual(audio.isEnabled(), true);

  audio.toggle();
  assert.strictEqual(audio.isEnabled(), false);
});

it('synthesizes key clicks and sound events without errors', () => {
  const audio = new AudioService();
  audio.setEnabled(true);
  audio.init();

  assert.doesNotThrow(() => {
    audio.playKey(false, 0);
    audio.playKey(true, 5);
    audio.playFracture();
    audio.playHatch();
    audio.playLevelUp();
    audio.playEggDrop();
    audio.playError();
  });
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL SERVICES UNIT TESTS PASSED! 🚀');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  console.log('========================================\n');
  process.exit(1);
}
