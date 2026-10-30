/**
 * TypeFlow - Unit & DOM Test Suite for Passive Views
 * Tests StageView, NestView, HUDView, ChartView, and ModalView.
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

const { StageView } = require('../src/views/StageView.js');
const { NestView } = require('../src/views/NestView.js');
const { HUDView } = require('../src/views/HUDView.js');
const { ChartView } = require('../src/views/ChartView.js');
const { ModalView } = require('../src/views/ModalView.js');
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
console.log('⚡ TYPEFLOW PASSIVE VIEWS TEST SUITE');
console.log('========================================\n');

// 1. StageView Tests
console.log('--- 1. StageView ---');

it('renders word stream and character spans', () => {
  const dom = new JSDOM(`
    <div id="words-box">
      <div id="words-wrapper"></div>
      <div id="caret"></div>
    </div>
  `);
  const { document } = dom.window;
  const stage = new StageView({
    wordsBox: document.getElementById('words-box'),
    wordsWrapper: document.getElementById('words-wrapper'),
    caret: document.getElementById('caret')
  });

  stage.renderWords(['the', 'quick']);
  assert.strictEqual(stage.wordElements.length, 2);

  const firstWord = stage.wordElements[0];
  assert.strictEqual(firstWord.className, 'word active');
  assert.strictEqual(firstWord.children.length, 3);
  assert.strictEqual(firstWord.children[0].textContent, 't');
  assert.strictEqual(firstWord.children[1].textContent, 'h');
  assert.strictEqual(firstWord.children[2].textContent, 'e');
});

it('updates letter styling for correct, incorrect, and extra characters', () => {
  const dom = new JSDOM(`<div id="words-box"><div id="words-wrapper"></div></div>`);
  const stage = new StageView({
    wordsBox: dom.window.document.getElementById('words-box'),
    wordsWrapper: dom.window.document.getElementById('words-wrapper')
  });

  stage.renderWords(['the']);
  // Correct letter
  stage.updateLetter(0, 0, true);
  assert.ok(stage.wordElements[0].children[0].classList.contains('correct'));

  // Incorrect letter
  stage.updateLetter(0, 1, false);
  assert.ok(stage.wordElements[0].children[1].classList.contains('incorrect'));
  assert.ok(stage.wordElements[0].classList.contains('error'));

  // Backspace on incorrect letter
  stage.backspaceLetter(0, 1);
  assert.ok(!stage.wordElements[0].children[1].classList.contains('incorrect'));
  assert.ok(!stage.wordElements[0].classList.contains('error'));
});

it('toggles hiddenMode on wordsBox and applies character fade horizon', () => {
  const dom = new JSDOM(`
    <div id="words-box">
      <div id="words-wrapper"></div>
      <div id="caret"></div>
    </div>
  `);
  const { document } = dom.window;
  const stage = new StageView({
    wordsBox: document.getElementById('words-box'),
    wordsWrapper: document.getElementById('words-wrapper'),
    caret: document.getElementById('caret')
  });

  stage.renderWords(['the', 'quick']);
  stage.setHiddenMode(true);
  stage.setHiddenMethod('char');
  assert.strictEqual(stage.wordsBox.classList.contains('hidden-mode'), true);

  // Test static methods
  assert.strictEqual(StageView.getBlindfoldMask(0), 0.0);
  assert.strictEqual(StageView.getBlindfoldMask(4), 1.0);
  assert.strictEqual(StageView.getBlindfoldMask(26), 6.5);
  assert.strictEqual(StageView.getBlindfoldMask(90), 12.5);
  assert.strictEqual(StageView.getHiddenOpacity(0, 0), 1.0);
  assert.strictEqual(StageView.getHiddenOpacity(0, 1), 0.75);
  assert.strictEqual(StageView.getHiddenOpacity(0, 4), 0.0);
  assert.strictEqual(StageView.getHiddenOpacity(1, 4), 1.0);
  assert.strictEqual(StageView.getHiddenOpacity(1, 5), 0.75);

  // Initial state (combo 0): zero character fade
  stage.updateHiddenHorizon(0, 0, 0, false);

  const word0 = stage.wordElements[0];
  const word1 = stage.wordElements[1];

  // combo 0: all untyped letters in word 0 and word 1 are fully visible
  assert.strictEqual(word0.children[0].style.opacity, '');
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');
  assert.strictEqual(word1.children[0].style.opacity, '');
  assert.strictEqual(word1.children[1].style.opacity, '');
  assert.strictEqual(word1.children[2].style.opacity, '');

  // Advance cursor to letter 1 ('h') while combo = 0
  stage.updateHiddenHorizon(0, 1, 0, false);
  // letter 0 ('t') is now in the past: has hd-past and opacity: '0' (fully transparent)
  assert.strictEqual(word0.children[0].classList.contains('hd-past'), true);
  assert.strictEqual(word0.children[0].style.opacity, '0');
  // Untyped letters remain visible with zero combo
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');

  // With combo = 1 (M = 0.25): caret at 0 in word0 -> letter at cursor (k=0) dims to 0.75
  stage.updateHiddenHorizon(0, 0, 1, false);
  assert.strictEqual(word0.children[0].style.opacity, '0.75'); // k=0 (cursor): dims to 0.75
  assert.strictEqual(word0.children[1].style.opacity, ''); // k=1: 1.0
  assert.strictEqual(word0.children[2].style.opacity, ''); // k=2: 1.0

  // With combo = 4 (M = 1.0): caret at 0 in word0 -> letter at cursor (k=0) hits 0% opacity
  stage.updateHiddenHorizon(0, 0, 4, false);
  assert.strictEqual(word0.children[0].style.opacity, '0'); // k=0 (cursor): 0.0 (overtaken)
  assert.strictEqual(word0.children[1].style.opacity, ''); // k=1: 1.0
  assert.strictEqual(word0.children[2].style.opacity, ''); // k=2: 1.0

  // First word completed (word 1 active, caret at 0, combo = 4)
  stage.updateHiddenHorizon(1, 0, 4, false);
  // Word 1 ('quick'): k=0 ('q') is cursor -> 0.0; k=1 ('u') is 1.0; k=2 ('i') is 1.0
  assert.strictEqual(word1.children[0].style.opacity, '0');
  assert.strictEqual(word1.children[1].style.opacity, '');
  assert.strictEqual(word1.children[2].style.opacity, '');

  // Safety brake: error clears inline opacity on active word and upcoming words
  stage.updateHiddenHorizon(1, 0, 4, true);
  assert.strictEqual(word1.children[0].style.opacity, '');
  assert.strictEqual(word1.children[1].style.opacity, '');
  assert.strictEqual(word1.children[2].style.opacity, '');

  // Legacy 5-argument support (backward compatibility test)
  stage.updateHiddenHorizon(1, 0, 5, false, 1);
  assert.strictEqual(word1.children[0].style.opacity, '0');
  assert.strictEqual(word1.children[1].style.opacity, '0');
  assert.strictEqual(word1.children[2].style.opacity, '0.25');

  // Disabling hiddenMode cleans all styles
  stage.setHiddenMode(false);
  assert.strictEqual(stage.wordsBox.classList.contains('hidden-mode'), false);
  assert.strictEqual(word0.children[0].classList.contains('hd-past'), false);
});

it('applies Word Vanish mode progressively in StageView', () => {
  const dom = new JSDOM(`
    <div id="words-box">
      <div id="words-wrapper"></div>
      <div id="caret"></div>
    </div>
  `);
  const wordsBox = dom.window.document.getElementById('words-box');
  const wordsWrapper = dom.window.document.getElementById('words-wrapper');
  const caret = dom.window.document.getElementById('caret');
  const stage = new StageView({ wordsBox, wordsWrapper, caret });
  stage.renderWords(['apple', 'banana', 'cherry', 'date', 'elderberry']);
  stage.setHiddenMode(true);
  stage.setHiddenMethod('word');
  stage.setHiddenWordDistance(2);

  const [w0, w1, w2, w3, w4] = stage.wordElements;

  // Streak = 0: all words visible
  stage.updateHiddenHorizon(0, 0, 0, false, null, { method: 'word', wordDistance: 2, streak: 0 });
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), false);

  // Streak = 1: word 0 vanishes
  stage.updateHiddenHorizon(0, 0, 0, false, null, { method: 'word', wordDistance: 2, streak: 1 });
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), false);

  // Streak = 2: word 0 and word 1 vanish
  stage.updateHiddenHorizon(0, 0, 0, false, null, { method: 'word', wordDistance: 2, streak: 2 });
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), false);

  // Streak = 3 (target 3 words): word 0 (active), word 1 (1 ahead), word 2 (2 ahead) vanish!
  stage.updateHiddenHorizon(0, 0, 0, false, null, { method: 'word', wordDistance: 3, streak: 3 });
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w3.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w4.classList.contains('hd-word-vanished'), false);

  // Cursor-only mode (wordDistance = 1): only active word vanishes, upcoming words are always visible
  stage.updateHiddenHorizon(0, 0, 0, false, null, { method: 'word', wordDistance: 1, streak: 5 });
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), true);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), false);

  // Error occurs: safety brake clears hd-word-vanished instantly
  stage.updateHiddenHorizon(0, 0, 0, true, null, { method: 'word', wordDistance: 2, streak: 3 });
  assert.strictEqual(w0.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w1.classList.contains('hd-word-vanished'), false);
  assert.strictEqual(w2.classList.contains('hd-word-vanished'), false);
});

it('manages Ghost Caret visibility, coordinates, and fading in StageView', () => {
  const dom = new JSDOM(`
    <div id="words-box">
      <div id="words-wrapper"></div>
      <div id="caret"></div>
      <div id="ghost-caret"></div>
    </div>
  `);
  const { document } = dom.window;
  const stage = new StageView({
    wordsBox: document.getElementById('words-box'),
    wordsWrapper: document.getElementById('words-wrapper'),
    caret: document.getElementById('caret'),
    ghostCaret: document.getElementById('ghost-caret')
  });

  stage.renderWords(['hello', 'world']);

  // Initially hidden
  stage.setGhostVisible(false);
  assert.strictEqual(stage.ghostCaret.style.display, 'none');
  assert.strictEqual(stage.ghostCaret.classList.contains('visible'), false);

  // Set visible
  stage.setGhostVisible(true);
  assert.strictEqual(stage.ghostCaret.style.display, 'block');
  assert.strictEqual(stage.ghostCaret.classList.contains('visible'), true);

  // Set fading
  stage.setGhostFading(true);
  assert.strictEqual(stage.ghostCaret.classList.contains('fading'), true);
  assert.strictEqual(stage.ghostCaret.classList.contains('visible'), false);

  // Coordinates and transform
  const res = stage.updateGhostCaret(0, 2, 0.5);
  assert.ok(res !== null);
  assert.strictEqual(typeof res.left, 'number');
  assert.strictEqual(typeof res.top, 'number');
  assert.strictEqual(res.isOutOfBounds, false);
  assert.ok(stage.ghostCaret.style.transform.includes('translate('));

  // Sync ghost directly to caret
  stage.syncGhostToCaret(0, 0);
  assert.ok(stage.ghostCaret.style.transform.includes('translate('));
});

it('appends words dynamically and cleanly updates wordElements and DOM structure', () => {
  const dom = new JSDOM(`<div id="words-box"><div id="words-wrapper"></div></div>`);
  const stage = new StageView({
    wordsBox: dom.window.document.getElementById('words-box'),
    wordsWrapper: dom.window.document.getElementById('words-wrapper')
  });

  stage.renderWords(['apple', 'banana']);
  assert.strictEqual(stage.wordElements.length, 2);
  assert.strictEqual(stage.wordsWrapper.children.length, 2);

  // Dynamically append a batch of 50 words
  const batch = Array.from({ length: 50 }, (_, i) => `word${i}`);
  stage.appendWords(batch);

  assert.strictEqual(stage.wordElements.length, 52);
  assert.strictEqual(stage.wordsWrapper.children.length, 52);
  assert.strictEqual(stage.wordElements[51].dataset.word, 'word49');
  assert.strictEqual(stage.wordElements[51].children.length, 'word49'.length);
});

// 2. NestView Tests
console.log('\n--- 2. NestView ---');

it('renders 3 slots from EggNestModel with empty, occupied, and revealed states', () => {
  const dom = new JSDOM(`
    <div id="egg-nest">
      <div id="nest-slot-0"></div>
      <div id="nest-slot-1"></div>
      <div id="nest-slot-2"></div>
      <div id="nest-hint"></div>
    </div>
    <button id="restart-btn"></button>
  `);
  const { document } = dom.window;
  const nestView = new NestView({
    eggNest: document.getElementById('egg-nest'),
    nestSlots: [
      document.getElementById('nest-slot-0'),
      document.getElementById('nest-slot-1'),
      document.getElementById('nest-slot-2')
    ],
    nestHint: document.getElementById('nest-hint'),
    restartBtn: document.getElementById('restart-btn')
  });

  const nestModel = new EggNestModel();
  nestModel.syncBasket([{ id: 1, name: 'Rare Egg', rarity: 'rare', tierColor: '#c084fc' }]);

  nestView.render(nestModel);

  const slot0 = document.getElementById('nest-slot-0');
  const slot1 = document.getElementById('nest-slot-1');
  const hint = document.getElementById('nest-hint');
  const restartBtn = document.getElementById('restart-btn');

  assert.ok(slot0.classList.contains('has-egg'));
  assert.strictEqual(slot1.textContent, '·');
  // With < 3 eggs, tab: hatch is NOT shown and restartBtn is visible
  assert.ok(!hint.classList.contains('visible'));
  assert.ok(!restartBtn.classList.contains('fade-out'));

  // With exactly 3 eggs, tab: hatch shows and restartBtn fades out
  nestModel.syncBasket([
    { id: 1, name: 'Rare Egg', rarity: 'rare', tierColor: '#c084fc' },
    { id: 2, name: 'Common Egg', rarity: 'common', tierColor: '#38bdf8' },
    { id: 3, name: 'Epic Egg', rarity: 'epic', tierColor: '#fbbf24' }
  ]);
  nestView.render(nestModel);
  assert.ok(hint.classList.contains('visible'));
  assert.strictEqual(hint.textContent, 'tab: hatch');
  assert.ok(restartBtn.classList.contains('fade-out'));
});

it('updates crack prompt UI as player types "e", "g", "g"', () => {
  const dom = new JSDOM(`
    <div id="egg-nest">
      <div id="nest-slot-0">
        <div class="nest-crack-prompt" id="crack-prompt-0">
          <span class="p-e untyped">e</span>
          <span class="p-g1 untyped">g</span>
          <span class="p-g2 untyped">g</span>
        </div>
      </div>
    </div>
  `);
  global.document = dom.window.document;
  const nestView = new NestView();

  nestView.updateCrackPrompt(0, 'e');
  assert.ok(dom.window.document.querySelector('.p-e').classList.contains('typed'));
  assert.ok(dom.window.document.querySelector('.p-g1').classList.contains('untyped'));

  nestView.updateCrackPrompt(0, 'egg');
  assert.ok(dom.window.document.querySelector('.p-g1').classList.contains('typed'));
  assert.ok(dom.window.document.querySelector('.p-g2').classList.contains('typed'));
});

it('updates incubation under-track width and ambient aura classes cleanly', () => {
  const dom = new JSDOM(`
    <div id="egg-nest">
      <div id="nest-incubation-track">
        <div id="nest-incubation-fill" style="width: 0%;"></div>
      </div>
    </div>
  `);
  const nestEl = dom.window.document.getElementById('egg-nest');
  const fillEl = dom.window.document.getElementById('nest-incubation-fill');
  const nestView = new NestView({
    eggNest: nestEl,
    incubationFill: fillEl
  });

  // 1. Partial charge (45%) in baseline combo
  nestView.updateIncubation(45.0, 'baseline', false);
  assert.strictEqual(fillEl.style.width, '45%');
  assert.ok(nestEl.classList.contains('charging'));
  assert.ok(!nestEl.classList.contains('high-combo'));
  assert.ok(!nestEl.classList.contains('nest-full'));

  // 2. High combo in overdrive
  nestView.updateIncubation(80.0, 'overdrive', false);
  assert.strictEqual(fillEl.style.width, '80%');
  assert.ok(nestEl.classList.contains('high-combo'));

  // 3. When nest is full (3 eggs occupied)
  nestView.updateIncubation(0.0, 'baseline', true);
  assert.strictEqual(fillEl.style.width, '0%');
  assert.ok(nestEl.classList.contains('nest-full'));
  assert.ok(!nestEl.classList.contains('charging'));

  // 4. Trigger materialize animation
  nestView.triggerMaterialize();
  assert.ok(nestEl.classList.contains('materialize'));
});

// 3. HUDView Tests
console.log('\n--- 3. HUDView ---');

it('toggles mode widgets between Classic and Flow', () => {
  const dom = new JSDOM(`
    <div id="tab-classic"></div>
    <div id="tab-flow"></div>
    <div id="timer">30</div>
    <div id="flow-gauge"></div>
    <div id="classic-duration-pill"></div>
    <div id="flow-target-pill"></div>
  `);
  const hud = new HUDView({
    tabClassic: dom.window.document.getElementById('tab-classic'),
    tabFlow: dom.window.document.getElementById('tab-flow'),
    timerEl: dom.window.document.getElementById('timer'),
    flowGauge: dom.window.document.getElementById('flow-gauge'),
    classicDurationPill: dom.window.document.getElementById('classic-duration-pill'),
    flowTargetPill: dom.window.document.getElementById('flow-target-pill')
  });

  hud.setMode('classic', 30);
  assert.strictEqual(hud.timerEl.style.display, 'block');
  assert.strictEqual(hud.flowGauge.style.display, 'none');

  hud.setMode('flow');
  assert.strictEqual(hud.timerEl.style.display, 'none');
  assert.strictEqual(hud.flowGauge.style.display, 'flex');
});

it('synchronizes target WPM slider and numeric input', () => {
  const dom = new JSDOM(`
    <input id="diff-slider" type="range" min="15" max="120" value="40">
    <input id="diff-input" type="number" value="40">
  `);
  const hud = new HUDView({
    diffSlider: dom.window.document.getElementById('diff-slider'),
    diffInput: dom.window.document.getElementById('diff-input')
  });

  hud.syncTargetWpm(75);
  assert.strictEqual(hud.diffSlider.value, '75');
  assert.strictEqual(hud.diffInput.value, '75');
});

it('updateFlowGauge updates speedometer tags and multiplier badge across flow states', () => {
  const dom = new JSDOM(`
    <div id="flow-gauge" style="display: flex;">
      <div id="flow-speed-tag" class="flow-speed-tag">
        <span id="speed-status-dot"></span>
        <span id="speed-indicator-text"></span>
      </div>
      <div id="flow-multiplier-badge" class="flow-multiplier-badge">
        <span id="flow-mult-val"></span>
      </div>
    </div>
  `);
  const hud = new HUDView({
    flowGauge: dom.window.document.getElementById('flow-gauge'),
    flowSpeedTag: dom.window.document.getElementById('flow-speed-tag'),
    speedIndicatorText: dom.window.document.getElementById('speed-indicator-text'),
    flowMultiplierBadge: dom.window.document.getElementById('flow-multiplier-badge'),
    flowMultVal: dom.window.document.getElementById('flow-mult-val')
  });

  // 1. Idle state (liveWpm = 0)
  hud.updateFlowGauge(0, 40, 0, 1.0, 0, 1);
  assert.strictEqual(hud.flowSpeedTag.className, 'flow-speed-tag slow');
  assert.strictEqual(hud.speedIndicatorText.textContent, 'Target: 40 WPM');
  assert.strictEqual(hud.flowMultVal.textContent, '1.0x Flow');
  assert.ok(!hud.flowMultiplierBadge.classList.contains('active'));

  // 2. Slow paced state (liveWpm = 25 < target 40)
  hud.updateFlowGauge(25, 40, 20, 1.0, 0, 1);
  assert.strictEqual(hud.flowSpeedTag.className, 'flow-speed-tag slow');
  assert.strictEqual(hud.speedIndicatorText.textContent, '⚡ Paced: 25 / 40 WPM');

  // 3. In Flow state (liveWpm = 45 >= target 40, momentum = 80)
  hud.updateFlowGauge(45, 40, 80, 2.5, 0, 1);
  assert.strictEqual(hud.flowSpeedTag.className, 'flow-speed-tag in-flow');
  assert.strictEqual(hud.speedIndicatorText.textContent, '🔥 Flow Active (45 WPM)');
  assert.strictEqual(hud.flowMultVal.textContent, '2.5x Flow');
  assert.ok(hud.flowMultiplierBadge.classList.contains('active'));

  // 4. Max Flow / Cushion (momentum >= 100)
  hud.updateFlowGauge(55, 40, 110, 3.0, 0, 1);
  assert.strictEqual(hud.flowSpeedTag.className, 'flow-speed-tag in-flow');
  assert.ok(hud.speedIndicatorText.textContent.includes('MAX FLOW'));
  assert.ok(hud.flowMultiplierBadge.classList.contains('rainbow-max'));
  assert.ok(hud.flowMultiplierBadge.classList.contains('cushion-active'));
});

it('HUDView.updateHiddenModeState updates active class, config pill, method toggle, and distance slider', () => {
  const dom = new JSDOM(`
    <button class="icon-btn" id="hd-btn" title="Toggle Hidden">HD</button>
    <div id="hd-config-pill" style="display: none;">
      <button id="hd-mode-word" class="active">Word</button>
      <button id="hd-mode-char">Combo</button>
      <div id="hd-word-slider-group" style="display: none;">
        <input id="hd-words-slider" type="range" min="1" max="6" value="1">
        <span id="hd-words-val">1 word</span>
      </div>
    </div>
  `);
  const hud = new HUDView({
    hdBtn: dom.window.document.getElementById('hd-btn'),
    hdConfigPill: dom.window.document.getElementById('hd-config-pill'),
    hdModeChar: dom.window.document.getElementById('hd-mode-char'),
    hdModeWord: dom.window.document.getElementById('hd-mode-word'),
    hdWordSliderGroup: dom.window.document.getElementById('hd-word-slider-group'),
    hdWordsSlider: dom.window.document.getElementById('hd-words-slider'),
    hdWordsVal: dom.window.document.getElementById('hd-words-val')
  });

  hud.updateHiddenModeState(true, 'word', 3);
  assert.strictEqual(hud.hdBtn.classList.contains('active'), true);
  assert.strictEqual(hud.hdBtn.getAttribute('aria-pressed'), 'true');
  assert.strictEqual(hud.hdConfigPill.style.display, 'flex');
  assert.strictEqual(hud.hdModeWord.classList.contains('active'), true);
  assert.strictEqual(hud.hdModeChar.classList.contains('active'), false);
  assert.strictEqual(hud.hdWordSliderGroup.style.display, 'flex');
  assert.strictEqual(hud.hdWordsSlider.value, '3');
  assert.strictEqual(hud.hdWordsVal.textContent, '3 words');

  // Verify single word label
  hud.updateHiddenModeState(true, 'word', 1);
  assert.strictEqual(hud.hdWordsSlider.value, '1');
  assert.strictEqual(hud.hdWordsVal.textContent, '1 word');

  // Switch to char mode
  hud.updateHiddenModeState(true, 'char', 2);
  assert.strictEqual(hud.hdModeChar.classList.contains('active'), true);
  assert.strictEqual(hud.hdModeWord.classList.contains('active'), false);
  assert.strictEqual(hud.hdWordSliderGroup.style.display, 'none');

  // Turn off HD
  hud.updateHiddenModeState(false);
  assert.strictEqual(hud.hdBtn.classList.contains('active'), false);
  assert.strictEqual(hud.hdBtn.getAttribute('aria-pressed'), 'false');
  assert.strictEqual(hud.hdConfigPill.style.display, 'none');
});

it('HUDView.updateGhostState updates button, slider, and visibility', () => {
  const dom = new JSDOM(`
    <button class="icon-btn" id="ghost-btn" title="Toggle Ghost">Ghost</button>
    <div id="ghost-slider-pill" style="display: none;">
      <input type="range" id="ghost-slider" value="50">
      <span id="ghost-val">50 WPM</span>
    </div>
  `);
  const hud = new HUDView({
    ghostBtn: dom.window.document.getElementById('ghost-btn'),
    ghostSliderPill: dom.window.document.getElementById('ghost-slider-pill'),
    ghostSlider: dom.window.document.getElementById('ghost-slider'),
    ghostVal: dom.window.document.getElementById('ghost-val')
  });

  hud.updateGhostState(true, 70);
  assert.strictEqual(hud.ghostBtn.classList.contains('active'), true);
  assert.strictEqual(hud.ghostBtn.getAttribute('aria-pressed'), 'true');
  assert.strictEqual(hud.ghostSliderPill.style.display, 'flex');
  assert.strictEqual(hud.ghostSlider.value, '70');
  assert.strictEqual(hud.ghostVal.textContent, '70 WPM');

  hud.updateGhostState(false, 70);
  assert.strictEqual(hud.ghostBtn.classList.contains('active'), false);
  assert.strictEqual(hud.ghostBtn.getAttribute('aria-pressed'), 'false');
  assert.strictEqual(hud.ghostSliderPill.style.display, 'none');
});

it('HUDView.toggleModsPopover toggles visibility and aria-expanded', () => {
  const dom = new JSDOM(`
    <button id="mods-btn" aria-expanded="false"></button>
    <div id="mods-popover" style="display: none;"></div>
    <button id="mods-close-btn"></button>
    <span id="mods-active-dot" style="display: none;"></span>
  `);
  const hud = new HUDView({
    modsBtn: dom.window.document.getElementById('mods-btn'),
    modsPopover: dom.window.document.getElementById('mods-popover'),
    modsCloseBtn: dom.window.document.getElementById('mods-close-btn'),
    modsActiveDot: dom.window.document.getElementById('mods-active-dot')
  });

  assert.strictEqual(hud.isModsPopoverOpen(), false);

  hud.toggleModsPopover(true);
  assert.strictEqual(hud.isModsPopoverOpen(), true);
  assert.strictEqual(hud.modsPopover.style.display, 'flex');
  assert.strictEqual(hud.modsBtn.getAttribute('aria-expanded'), 'true');

  hud.toggleModsPopover(false);
  assert.strictEqual(hud.isModsPopoverOpen(), false);
  assert.strictEqual(hud.modsPopover.style.display, 'none');
  assert.strictEqual(hud.modsBtn.getAttribute('aria-expanded'), 'false');
});

it('HUDView.updateModsActiveIndicator displays LED indicator when any mod is active', () => {
  const dom = new JSDOM(`
    <span id="mods-active-dot" style="display: none;"></span>
  `);
  const hud = new HUDView({
    modsActiveDot: dom.window.document.getElementById('mods-active-dot')
  });

  // All off
  hud.updateModsActiveIndicator(false, false, false);
  assert.strictEqual(hud.modsActiveDot.style.display, 'none');

  // HD on
  hud.updateModsActiveIndicator(true, false, false);
  assert.strictEqual(hud.modsActiveDot.style.display, 'inline-block');

  // Ghost on
  hud.updateModsActiveIndicator(false, true, false);
  assert.strictEqual(hud.modsActiveDot.style.display, 'inline-block');

  // Sound on
  hud.updateModsActiveIndicator(false, false, true);
  assert.strictEqual(hud.modsActiveDot.style.display, 'inline-block');

  // Back to all off
  hud.updateModsActiveIndicator(false, false, false);
  assert.strictEqual(hud.modsActiveDot.style.display, 'none');
});

// 4. ModalView Tests
console.log('\n--- 4. ModalView ---');

it('displays classic results summary and switches stats tabs', () => {
  const dom = new JSDOM(`
    <div id="test-section" style="display: flex;"></div>
    <div id="results-section"></div>
    <div id="res-wpm"></div>
    <div id="res-acc"></div>
    <div id="res-raw"></div>
    <div id="stats-modal" style="display: none;"></div>
    <div id="tab-stats-flow"></div>
    <div id="tab-stats-classic"></div>
    <div id="pane-stats-flow"></div>
    <div id="pane-stats-classic"></div>
  `);
  const modal = new ModalView({
    testSection: dom.window.document.getElementById('test-section'),
    resultsSection: dom.window.document.getElementById('results-section'),
    resWpmEl: dom.window.document.getElementById('res-wpm'),
    resAccEl: dom.window.document.getElementById('res-acc'),
    resRawEl: dom.window.document.getElementById('res-raw'),
    statsModal: dom.window.document.getElementById('stats-modal'),
    tabStatsFlow: dom.window.document.getElementById('tab-stats-flow'),
    tabStatsClassic: dom.window.document.getElementById('tab-stats-classic'),
    paneStatsFlow: dom.window.document.getElementById('pane-stats-flow'),
    paneStatsClassic: dom.window.document.getElementById('pane-stats-classic')
  });

  modal.showClassicResults({ wpm: 80, accuracy: 98, rawWpm: 85, correctChars: 400, incorrectChars: 5, duration: 30 });
  assert.strictEqual(modal.testSection.style.display, 'none');
  assert.ok(modal.resultsSection.classList.contains('visible'));
  assert.strictEqual(modal.resWpmEl.textContent, '80');
  assert.strictEqual(modal.resAccEl.textContent, '98%');

  modal.openStatsModal('flow');
  assert.strictEqual(modal.statsModal.style.display, 'flex');
  assert.ok(modal.tabStatsFlow.classList.contains('active'));
});

it('ModalView manages command drawer, tabs, and breadcrumb navigation', () => {
  const dom = new JSDOM(`
    <div id="stats-modal" style="display: none;"></div>
    <div id="tab-stats-flow"></div>
    <div id="tab-stats-classic"></div>
    <div id="tab-stats-trophies"></div>
    <div id="tab-stats-armory"></div>
    <div id="tab-stats-motor"></div>
    <div id="tab-stats-config"></div>
    <div id="pane-stats-flow"></div>
    <div id="pane-stats-classic"></div>
    <div id="pane-stats-trophies"></div>
    <div id="pane-stats-armory"></div>
    <div id="pane-stats-motor"></div>
    <div id="pane-stats-config"></div>
    <div id="drawer-active-title"></div>
  `);
  const modal = new ModalView({
    statsModal: dom.window.document.getElementById('stats-modal'),
    tabStatsFlow: dom.window.document.getElementById('tab-stats-flow'),
    tabStatsClassic: dom.window.document.getElementById('tab-stats-classic'),
    tabStatsTrophies: dom.window.document.getElementById('tab-stats-trophies'),
    tabStatsArmory: dom.window.document.getElementById('tab-stats-armory'),
    tabStatsMotor: dom.window.document.getElementById('tab-stats-motor'),
    tabStatsConfig: dom.window.document.getElementById('tab-stats-config'),
    paneStatsFlow: dom.window.document.getElementById('pane-stats-flow'),
    paneStatsClassic: dom.window.document.getElementById('pane-stats-classic'),
    paneStatsTrophies: dom.window.document.getElementById('pane-stats-trophies'),
    paneStatsArmory: dom.window.document.getElementById('pane-stats-armory'),
    paneStatsMotor: dom.window.document.getElementById('pane-stats-motor'),
    paneStatsConfig: dom.window.document.getElementById('pane-stats-config'),
    drawerActiveTitle: dom.window.document.getElementById('drawer-active-title')
  });

  // Open modal
  modal.openStatsModal('flow');
  assert.strictEqual(modal.statsModal.style.display, 'flex');
  assert.ok(modal.statsModal.classList.contains('open'));
  assert.ok(modal.tabStatsFlow.classList.contains('active'));
  assert.strictEqual(modal.paneStatsFlow.style.display, 'flex');
  assert.strictEqual(modal.drawerActiveTitle.textContent, 'PROFILE // RPG OVERVIEW');

  // Switch to Motor
  modal.switchStatsTab('motor');
  assert.ok(modal.tabStatsMotor.classList.contains('active'));
  assert.ok(!modal.tabStatsFlow.classList.contains('active'));
  assert.strictEqual(modal.paneStatsMotor.style.display, 'flex');
  assert.strictEqual(modal.paneStatsFlow.style.display, 'none');
  assert.strictEqual(modal.drawerActiveTitle.textContent, 'MOTOR // NEUROMUSCULAR PATTERNS');

  // Switch to Config
  modal.switchStatsTab('config');
  assert.ok(modal.tabStatsConfig.classList.contains('active'));
  assert.strictEqual(modal.paneStatsConfig.style.display, 'flex');
  assert.strictEqual(modal.drawerActiveTitle.textContent, 'CONFIG // SYSTEM PARAMETERS');

  // Close modal
  modal.closeStatsModal();
  assert.strictEqual(modal.statsModal.style.display, 'none');
  assert.ok(!modal.statsModal.classList.contains('open'));
});

// 5. ChartView Tests
console.log('\n--- 5. ChartView ---');

it('renders timeline and isolates error indicators with fixed badges', () => {
  const dom = new JSDOM(`
    <div id="chart-container" style="width: 600px;">
      <canvas id="wpm-chart"></canvas>
      <div id="chart-tooltip">
        <div id="tooltip-time"></div>
        <div id="tooltip-wpm"></div>
        <div id="tooltip-pace"></div>
        <div id="tooltip-raw"></div>
        <div id="tooltip-err-row"></div>
      </div>
      <div id="chart-hover-stats"></div>
    </div>
  `);

  const canvas = dom.window.document.getElementById('wpm-chart');
  canvas.parentElement = dom.window.document.getElementById('chart-container');
  // Mock 2D context
  canvas.getContext = () => ({
    scale: () => {},
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fillText: () => {},
    save: () => {},
    restore: () => {},
    setLineDash: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    closePath: () => {},
    fill: () => {},
    arc: () => {}
  });
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 180 });

  const chart = new ChartView({
    chartCanvas: canvas,
    chartTooltip: dom.window.document.getElementById('chart-tooltip'),
    tooltipTime: dom.window.document.getElementById('tooltip-time'),
    tooltipWpm: dom.window.document.getElementById('tooltip-wpm'),
    tooltipPace: dom.window.document.getElementById('tooltip-pace'),
    tooltipRaw: dom.window.document.getElementById('tooltip-raw'),
    tooltipErrRow: dom.window.document.getElementById('tooltip-err-row'),
    chartHoverStats: dom.window.document.getElementById('chart-hover-stats')
  });

  const history = [
    { second: 1, wpm: 60, rawWpm: 60, burstWpm: 60, errors: 0, fixed: 0 },
    { second: 2, wpm: 65, rawWpm: 70, burstWpm: 70, errors: 1, fixed: 1 },
    { second: 3, wpm: 70, rawWpm: 75, burstWpm: 75, errors: 0, fixed: 0 },
    { second: 4, wpm: 72, rawWpm: 72, burstWpm: 72, errors: 1, fixed: 0 }
  ];

  chart.render(history);
  assert.strictEqual(chart.chartDataPoints.length, 4);

  // Hover point 0 (second 1: 0 errors)
  chart.handleInteraction({ clientX: chart.chartDataPoints[0].x });
  assert.ok(chart.tooltipErrRow.innerHTML.includes('Errors: <strong>0</strong>'));

  // Hover point 1 (second 2: 1 error, fixed = 1)
  chart.handleInteraction({ clientX: chart.chartDataPoints[1].x });
  assert.ok(chart.tooltipErrRow.innerHTML.includes('Errors: <strong>1</strong>'));
  assert.ok(chart.tooltipErrRow.innerHTML.includes('(Fixed ✓)'));

  // Hover point 2 (second 3: 0 errors)
  chart.handleInteraction({ clientX: chart.chartDataPoints[2].x });
  assert.ok(chart.tooltipErrRow.innerHTML.includes('Errors: <strong>0</strong>'));

  // Hover point 3 (second 4: 1 error, unfixed)
  chart.handleInteraction({ clientX: chart.chartDataPoints[3].x });
  assert.ok(chart.tooltipErrRow.innerHTML.includes('Errors: <strong>1</strong>'));
  assert.ok(chart.tooltipErrRow.innerHTML.includes('(Unfixed ✗)'));
});

console.log('\n========================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('ALL PASSIVE VIEWS TESTS PASSED! 🚀');
  console.log('========================================\n');
  process.exit(0);
} else {
  console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED!`);
  console.log('========================================\n');
  process.exit(1);
}
