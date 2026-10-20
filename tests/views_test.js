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
  assert.strictEqual(stage.wordsBox.classList.contains('hidden-mode'), true);

  // Initial state: cursor at word 0, char 0 ('t' in 'the')
  stage.updateHiddenHorizon(0, 0, 6, false);

  const word0 = stage.wordElements[0];
  const word1 = stage.wordElements[1];

  // First word onboarding rule: untyped letters in word 0 are fully visible
  // so the player can see what to type at test start:
  assert.strictEqual(word0.children[0].style.opacity, '');
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');

  // Next word: 'quick' starts at d = 3 + 1 = 4
  // Letter 0 ('q'): d=4 -> opacity: '0.5'
  assert.strictEqual(word1.children[0].style.opacity, '0.5');
  // Letter 1 ('u'): d=5 -> opacity: '0.75'
  assert.strictEqual(word1.children[1].style.opacity, '0.75');
  // Letter 2 ('i'): d=6 >= 6 -> full opacity
  assert.strictEqual(word1.children[2].style.opacity, '');

  // Advance cursor to letter 1 ('h') in first word
  stage.updateHiddenHorizon(0, 1, 6, false);
  // letter 0 ('t') is now in the past: has hd-past and opacity: '0' (fully transparent)
  assert.strictEqual(word0.children[0].classList.contains('hd-past'), true);
  assert.strictEqual(word0.children[0].style.opacity, '0');
  // Untyped letters in first word remain fully visible
  assert.strictEqual(word0.children[1].style.opacity, '');
  assert.strictEqual(word0.children[2].style.opacity, '');
  // Next word start ('q' in 'quick'): d = (3 - 1) + 1 = 3 -> opacity: '0.25'
  assert.strictEqual(word1.children[0].style.opacity, '0.25');
  assert.strictEqual(word1.children[1].style.opacity, '0.5');

  // Once past word 0 (e.g. at word 1, char 0), standard hidden fading applies to active word:
  stage.updateHiddenHorizon(1, 0, 6, false);
  // Word 1 ('quick'): letters within 2 chars hit 0% opacity
  assert.strictEqual(word1.children[0].style.opacity, '0');
  assert.strictEqual(word1.children[1].style.opacity, '0');
  assert.strictEqual(word1.children[2].style.opacity, '0');
  assert.strictEqual(word1.children[3].style.opacity, '0.25');

  // Safety brake: error clears inline opacity on active word
  stage.updateHiddenHorizon(1, 0, 6, true);
  assert.strictEqual(word1.children[0].style.opacity, '');
  assert.strictEqual(word1.children[1].style.opacity, '');

  // Disabling hiddenMode cleans all styles
  stage.setHiddenMode(false);
  assert.strictEqual(stage.wordsBox.classList.contains('hidden-mode'), false);
  assert.strictEqual(word0.children[0].classList.contains('hd-past'), false);
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
  `);
  const { document } = dom.window;
  const nestView = new NestView({
    eggNest: document.getElementById('egg-nest'),
    nestSlots: [
      document.getElementById('nest-slot-0'),
      document.getElementById('nest-slot-1'),
      document.getElementById('nest-slot-2')
    ],
    nestHint: document.getElementById('nest-hint')
  });

  const nestModel = new EggNestModel();
  nestModel.syncBasket([{ id: 1, name: 'Rare Egg', rarity: 'rare', tierColor: '#c084fc' }]);

  nestView.render(nestModel);

  const slot0 = document.getElementById('nest-slot-0');
  const slot1 = document.getElementById('nest-slot-1');
  const hint = document.getElementById('nest-hint');

  assert.ok(slot0.classList.contains('has-egg'));
  assert.strictEqual(slot1.textContent, '·');
  assert.strictEqual(hint.textContent, 'tab: hatch');
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

it('HUDView.updateHiddenModeState updates active class and aria-pressed', () => {
  const dom = new JSDOM(`
    <button class="icon-btn" id="hd-btn" title="Toggle Hidden">HD</button>
  `);
  const hud = new HUDView({
    hdBtn: dom.window.document.getElementById('hd-btn')
  });

  hud.updateHiddenModeState(true);
  assert.strictEqual(hud.hdBtn.classList.contains('active'), true);
  assert.strictEqual(hud.hdBtn.getAttribute('aria-pressed'), 'true');

  hud.updateHiddenModeState(false);
  assert.strictEqual(hud.hdBtn.classList.contains('active'), false);
  assert.strictEqual(hud.hdBtn.getAttribute('aria-pressed'), 'false');
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
