/**
 * TypeFlow - v4.0 Cosmetic Armory & Level Progression Unlocks Test Suite
 * Verifies CosmeticsModel, StorageService persistence, AudioService switch packs,
 * StageView caret geometries, HUDView theme application, ModalView Armory rendering,
 * and GameController integration.
 */

const assert = require('assert');
const {
  CosmeticsModel,
  COSMETIC_THEMES,
  COSMETIC_FLOW_FX,
  COSMETIC_CARETS,
  COSMETIC_CARET_FX,
  COSMETIC_GHOST_STYLES,
  COSMETIC_SOUNDS,
  DEFAULT_EQUIPPED_COSMETICS
} = require('../src/models/CosmeticsModel.js');
const { StorageService } = require('../src/services/StorageService.js');
const { AudioService } = require('../src/services/AudioService.js');
const { StageView } = require('../src/views/StageView.js');
const { HUDView } = require('../src/views/HUDView.js');
const { ModalView } = require('../src/views/ModalView.js');
const { GameController } = require('../src/controllers/GameController.js');
const { WordsModel } = require('../src/models/WordsModel.js');
const { SessionModel } = require('../src/models/SessionModel.js');
const { FlowModel } = require('../src/models/FlowModel.js');
const { EggNestModel } = require('../src/models/EggNestModel.js');
const { NestView } = require('../src/views/NestView.js');
const { ChartView } = require('../src/views/ChartView.js');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

function createMockElement(tag = 'div') {
  const listeners = {};
  const classes = new Set();
  const children = [];
  const styleProps = {};
  const el = {
    tagName: tag.toUpperCase(),
    dataset: {},
    setAttribute: (name, val) => {
      if (name.startsWith('data-')) {
        const key = name.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
        el.dataset[key] = String(val);
      }
    },
    getAttribute: (name) => {
      if (name.startsWith('data-')) {
        const key = name.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
        return el.dataset[key] !== undefined ? el.dataset[key] : null;
      }
      return null;
    },
    style: {
      setProperty: (k, v) => { styleProps[k] = v; },
      getPropertyValue: (k) => styleProps[k] || '',
      _props: styleProps
    },
    get className() {
      return Array.from(classes).join(' ');
    },
    set className(val) {
      classes.clear();
      String(val || '').split(/\s+/).filter(Boolean).forEach(c => classes.add(c));
    },
    textContent: '',
    innerHTML: '',
    children,
    classList: {
      add: (...cls) => cls.forEach(c => c && classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) { classes.delete(c); return false; }
          classes.add(c); return true;
        }
        if (force) classes.add(c); else classes.delete(c);
        return Boolean(force);
      },
      contains: (c) => classes.has(c)
    },
    addEventListener: (evt, cb) => {
      if (!listeners[evt]) listeners[evt] = [];
      listeners[evt].push(cb);
    },
    removeEventListener: (evt, cb) => {
      if (listeners[evt]) {
        listeners[evt] = listeners[evt].filter(fn => fn !== cb);
      }
    },
    focus: () => {},
    blur: () => {},
    trigger: (evt, payload = {}) => {
      (listeners[evt] || []).forEach(cb => cb(payload));
    },
    appendChild: (child) => {
      children.push(child);
      return child;
    },
    querySelectorAll: () => [],
    querySelector: () => null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 10, height: 20 })
  };
  el.ownerDocument = {
    createElement: (t) => createMockElement(t)
  };
  return el;
}

function createMockStorage() {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

console.log('\n======================================================');
console.log('🎨 TypeFlow v4.0 Cosmetic Armory Test Suite');
console.log('======================================================\n');

// 1. CosmeticsModel Catalog & Unlock Logic
test('1. CosmeticsModel defines 34 cosmetics across 6 categories (6 themes, 6 flowFx, 5 carets, 6 caretFx, 6 ghostStyles, 5 sounds)', () => {
  const model = new CosmeticsModel();
  assert.strictEqual(Object.keys(COSMETIC_THEMES).length, 6);
  assert.strictEqual(Object.keys(COSMETIC_FLOW_FX).length, 6);
  assert.strictEqual(Object.keys(COSMETIC_CARETS).length, 5);
  assert.strictEqual(Object.keys(COSMETIC_CARET_FX).length, 6);
  assert.strictEqual(Object.keys(COSMETIC_GHOST_STYLES).length, 6);
  assert.strictEqual(Object.keys(COSMETIC_SOUNDS).length, 5);
  assert.strictEqual(model.getTotalCount(), 34);
  assert.strictEqual(model.listByCategory('theme').length, 6);
  assert.strictEqual(model.listByCategory('flowFx').length, 6);
  assert.strictEqual(model.listByCategory('caret').length, 5);
  assert.strictEqual(model.listByCategory('caretFx').length, 6);
  assert.strictEqual(model.listByCategory('ghostStyle').length, 6);
  assert.strictEqual(model.listByCategory('sound').length, 5);
});

test('2. CosmeticsModel unlocks 6 defaults at Level 1 and gates higher-tier cosmetics by Level or Achievement', () => {
  const model = new CosmeticsModel();
  // Level 1 defaults across all 6 categories
  assert.strictEqual(model.isUnlocked('oled_cyan', 1, {}), true);
  assert.strictEqual(model.isUnlocked('adaptive_resonance', 1, {}), true);
  assert.strictEqual(model.isUnlocked('line', 1, {}), true);
  assert.strictEqual(model.isUnlocked('rainbow_prism', 1, {}), true);
  assert.strictEqual(model.isUnlocked('phantom_line', 1, {}), true);
  assert.strictEqual(model.isUnlocked('clicky_blue', 1, {}), true);
  assert.strictEqual(model.getUnlockedCount(1, {}), 6);

  // Locked at Level 1
  assert.strictEqual(model.isUnlocked('sakura_stream', 1, {}), false);
  assert.strictEqual(model.isUnlocked('phosphor_crt', 1, {}), false);
  assert.strictEqual(model.isUnlocked('solar_flame', 1, {}), false);
  assert.strictEqual(model.isUnlocked('prism', 1, {}), false);
  assert.strictEqual(model.isUnlocked('plasma_arc', 1, {}), false);
  assert.strictEqual(model.isUnlocked('shadow_rival', 1, {}), false);
  assert.strictEqual(model.isUnlocked('typewriter', 1, {}), false);
  assert.strictEqual(model.isUnlocked('obsidian_gold', 1, {}), false);

  // Unlocked via Level
  assert.strictEqual(model.isUnlocked('sakura_stream', 3, {}), true);
  assert.strictEqual(model.isUnlocked('phosphor_crt', 6, {}), true);
  assert.strictEqual(model.isUnlocked('solar_flame', 16, {}), true);
  assert.strictEqual(model.isUnlocked('prism', 12, {}), true);
  assert.strictEqual(model.isUnlocked('plasma_arc', 18, {}), true);
  assert.strictEqual(model.isUnlocked('shadow_rival', 14, {}), true);
  assert.strictEqual(model.isUnlocked('obsidian_gold', 20, {}), true);

  // Unlocked via Alternative Achievement at Level 1
  assert.strictEqual(model.isUnlocked('phosphor_crt', 1, { steady_cadence: 123 }), true);
  assert.strictEqual(model.isUnlocked('cyberpunk_neon', 1, { cruising_60: 123 }), true);
  assert.strictEqual(model.isUnlocked('nord_frost', 1, { silver_stream: 123 }), true);
  assert.strictEqual(model.isUnlocked('prismatic_aurora', 1, { sustained_current: 123 }), true);
  assert.strictEqual(model.isUnlocked('solar_flame', 1, { supersonic_90: 123 }), true);
  assert.strictEqual(model.isUnlocked('hyperdrive_warp', 1, { mach_1: 123 }), true);
  assert.strictEqual(model.isUnlocked('capsule', 1, { sustained_current: 123 }), true);
  assert.strictEqual(model.isUnlocked('prism', 1, { overclocked: 123 }), true);
  assert.strictEqual(model.isUnlocked('holo_glitch', 1, { clutch_recovery: 123 }), true);
  assert.strictEqual(model.isUnlocked('plasma_arc', 1, { overclocked: 123 }), true);
  assert.strictEqual(model.isUnlocked('golden_hare', 1, { shadow_conqueror: 123 }), true);
  assert.strictEqual(model.isUnlocked('shadow_rival', 1, { ghost_duelist: 123 }), true);
  assert.strictEqual(model.isUnlocked('zen_droplet', 1, { shadow_walker: 123 }), true);
  assert.strictEqual(model.isUnlocked('typewriter', 1, { marksman: 123 }), true);

  // Obsidian Gold unlocks via 10+ trophies at Level 1
  const tenTrophies = { a1: 1, a2: 1, a3: 1, a4: 1, a5: 1, a6: 1, a7: 1, a8: 1, a9: 1, a10: 1 };
  assert.strictEqual(model.isUnlocked('obsidian_gold', 1, tenTrophies), true);
});

test('3. CosmeticsModel.getNewlyUnlockedOnLevelUp returns only items newly unlocked between oldLevel and newLevel', () => {
  const model = new CosmeticsModel();
  // Level 1 -> Level 3 unlocks zen_trance (Lv. 2), underline (Lv. 2), sakura_stream (Lv. 3), hologram_runner (Lv. 3), thoccy_linear (Lv. 3)
  const unlocked1to3 = model.getNewlyUnlockedOnLevelUp(1, 3, {});
  const ids = unlocked1to3.map(i => i.id);
  assert.ok(ids.includes('zen_trance'));
  assert.ok(ids.includes('underline'));
  assert.ok(ids.includes('sakura_stream'));
  assert.ok(ids.includes('hologram_runner'));
  assert.ok(ids.includes('thoccy_linear'));
  assert.strictEqual(ids.length, 5);

  // If phosphor_crt was already unlocked via achievement steady_cadence and wireframe_block via Level 6,
  // leveling 5 -> 6 only announces wireframe_block (not phosphor_crt)
  const unlocked5to6WithAch = model.getNewlyUnlockedOnLevelUp(5, 6, { steady_cadence: 100 });
  assert.strictEqual(unlocked5to6WithAch.length, 1);
  assert.strictEqual(unlocked5to6WithAch[0].id, 'wireframe_block');
});

// 2. StorageService Cosmetic Persistence
test('4. StorageService persists all 6 equippedCosmetics slots and preserves them across resetGameSave()', () => {
  const mockStorage = createMockStorage();
  const storage = new StorageService(mockStorage);

  const initial = storage.getEquippedCosmetics();
  assert.deepStrictEqual(initial, DEFAULT_EQUIPPED_COSMETICS);

  storage.setEquippedCosmetic('theme', 'cyberpunk_neon');
  storage.setEquippedCosmetic('flowFx', 'solar_flame');
  storage.setEquippedCosmetic('caret', 'prism');
  storage.setEquippedCosmetic('caretFx', 'plasma_arc');
  storage.setEquippedCosmetic('ghostStyle', 'golden_hare');
  storage.setEquippedCosmetic('sound', 'thoccy_linear');

  const updated = storage.getEquippedCosmetics();
  assert.strictEqual(updated.theme, 'cyberpunk_neon');
  assert.strictEqual(updated.flowFx, 'solar_flame');
  assert.strictEqual(updated.caret, 'prism');
  assert.strictEqual(updated.caretFx, 'plasma_arc');
  assert.strictEqual(updated.ghostStyle, 'golden_hare');
  assert.strictEqual(updated.sound, 'thoccy_linear');

  // Reset RPG progress to Ground Zero — equipped cosmetics must remain intact
  storage.resetGameSave();
  const afterReset = storage.getEquippedCosmetics();
  assert.strictEqual(afterReset.theme, 'cyberpunk_neon');
  assert.strictEqual(afterReset.flowFx, 'solar_flame');
  assert.strictEqual(afterReset.caret, 'prism');
  assert.strictEqual(afterReset.caretFx, 'plasma_arc');
  assert.strictEqual(afterReset.ghostStyle, 'golden_hare');
  assert.strictEqual(afterReset.sound, 'thoccy_linear');
});

// 3. AudioService Switch Sound Packs
test('5. AudioService synthesizes all 5 mechanical switch sound packs and previews 3-note burst', () => {
  const createdOscs = [];
  class MockAudioContext {
    constructor() {
      this.currentTime = 1.0;
      this.state = 'running';
      this.destination = {};
    }
    createOscillator() {
      const osc = {
        type: 'sine',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {}
      };
      createdOscs.push(osc);
      return osc;
    }
    createGain() {
      return {
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {}
      };
    }
  }

  const audio = new AudioService();
  audio.audioCtx = new MockAudioContext();
  audio.soundEnabled = true;

  const packs = ['clicky_blue', 'thoccy_linear', 'tactile_brown', 'zen_droplet', 'typewriter'];
  for (const pack of packs) {
    const before = createdOscs.length;
    audio.setSoundPack(pack);
    assert.strictEqual(audio.getSoundPack(), pack);
    audio.playKey(false, 4);
    audio.playKey(true, 4);
    assert.ok(createdOscs.length > before, `Expected oscillators created for pack ${pack}`);
  }

  const beforePreview = createdOscs.length;
  audio.previewSoundPack('typewriter');
  assert.ok(createdOscs.length >= beforePreview + 4, 'Expected previewSoundPack to schedule 3 key notes');
});

// 4. StageView Caret Styles, Caret FX Modifiers, Ghost Styles & Permanent Prism Caret
test('6. StageView applies Caret geometries, Caret FX modifiers, and Ghost Caret pacer styles', () => {
  const caret = createMockElement('div');
  const ghostCaret = createMockElement('div');
  const stageView = new StageView({
    wordsBox: createMockElement('div'),
    wordsWrapper: createMockElement('div'),
    caret,
    ghostCaret,
    focusOverlay: createMockElement('div'),
    typingInput: createMockElement('input')
  });

  stageView.setCaretStyle('block');
  assert.strictEqual(caret.classList.contains('caret-style-block'), true);
  assert.strictEqual(caret.classList.contains('caret-rainbow'), false);

  stageView.setCaretFx('plasma_arc');
  assert.strictEqual(caret.classList.contains('caret-fx-plasma_arc'), true);
  assert.strictEqual(stageView.caretFx, 'plasma_arc');

  stageView.setGhostStyle('wireframe_block');
  assert.strictEqual(ghostCaret.classList.contains('ghost-style-wireframe_block'), true);
  assert.strictEqual(stageView.ghostStyle, 'wireframe_block');

  stageView.setCaretStyle('prism');
  assert.strictEqual(caret.classList.contains('caret-style-prism'), true);
  assert.strictEqual(caret.classList.contains('caret-rainbow'), true);

  // Even when flow momentum is 0 (setCaretRainbow(false)), prism caret remains rainbow!
  stageView.setCaretRainbow(false);
  assert.strictEqual(caret.classList.contains('caret-rainbow'), true);

  // Switching to capsule while flow rainbow is false removes caret-rainbow
  stageView.setCaretStyle('capsule');
  assert.strictEqual(caret.classList.contains('caret-style-capsule'), true);
  assert.strictEqual(caret.classList.contains('caret-rainbow'), false);
});

// 5. HUDView Theme & Flow FX Application & Armory Shortcut
test('7. HUDView.applyTheme and applyFlowFx set CSS properties/classes and levelHudCard click fires onOpenArmory', () => {
  const levelHudCard = createMockElement('div');
  const toastEl = createMockElement('div');
  const flowVignetteOverlay = createMockElement('div');
  const hudView = new HUDView({
    levelHudCard,
    achievementToast: toastEl,
    flowVignetteOverlay
  });

  let openedArmory = false;
  hudView.bindEvents({
    onOpenArmory: () => { openedArmory = true; }
  });
  levelHudCard.trigger('click');
  assert.strictEqual(openedArmory, true);

  const rootEl = createMockElement('html');
  const model = new CosmeticsModel();
  const sakura = model.getTheme('sakura_stream');
  hudView.applyTheme(sakura, rootEl);
  assert.strictEqual(rootEl.style.getPropertyValue('--main-color'), sakura.vars['--main-color']);
  assert.strictEqual(rootEl.style.getPropertyValue('--caret-color'), sakura.vars['--caret-color']);

  hudView.applyFlowFx('solar_flame', rootEl);
  assert.strictEqual(rootEl.dataset.flowFx, 'solar_flame');
  assert.strictEqual(flowVignetteOverlay.classList.contains('flow-fx-solar_flame'), true);

  // Verify cosmetic toast tier header
  hudView.showAchievementToast({
    tier: 'cosmetic',
    icon: '🌸',
    title: 'Sakura Stream',
    desc: 'Unlocked theme in the Cosmetic Armory!'
  });
  assert.ok(toastEl.innerHTML.includes('🎨 ARMORY UNLOCKED'));
  assert.ok(toastEl.classList.contains('tier-cosmetic'));
  if (hudView.toastTimeout) clearTimeout(hudView.toastTimeout);
});

// 6. ModalView Armory Rendering & Card Click Equipping
test('8. ModalView.renderArmory populates all 6 category grids and triggers onEquipCosmetic on unlocked cards', () => {
  const mockStorage = createMockStorage();
  const storage = new StorageService(mockStorage);
  const cosmeticsModel = new CosmeticsModel();

  const armoryCountEl = createMockElement('span');
  const armoryProgressBar = createMockElement('div');
  const armoryThemesGrid = createMockElement('div');
  const armoryFlowFxGrid = createMockElement('div');
  const armoryCaretsGrid = createMockElement('div');
  const armoryCaretFxGrid = createMockElement('div');
  const armoryGhostGrid = createMockElement('div');
  const armorySoundsGrid = createMockElement('div');

  const modalView = new ModalView({
    armoryCountEl,
    armoryProgressBar,
    armoryThemesGrid,
    armoryFlowFxGrid,
    armoryCaretsGrid,
    armoryCaretFxGrid,
    armoryGhostGrid,
    armorySoundsGrid
  });

  let equippedCall = null;
  modalView.renderArmory(cosmeticsModel, storage, {
    onEquipCosmetic: (category, id) => { equippedCall = { category, id }; }
  });

  assert.strictEqual(armoryThemesGrid.children.length, 6);
  assert.strictEqual(armoryFlowFxGrid.children.length, 6);
  assert.strictEqual(armoryCaretsGrid.children.length, 5);
  assert.strictEqual(armoryCaretFxGrid.children.length, 6);
  assert.strictEqual(armoryGhostGrid.children.length, 6);
  assert.strictEqual(armorySoundsGrid.children.length, 5);
  assert.ok(armoryCountEl.textContent.includes('6 / 34 unlocked'));

  // Clicking locked Sakura Stream card at Lv. 1 does not trigger handler
  const sakuraCard = armoryThemesGrid.children.find(c => c.dataset.id === 'sakura_stream');
  assert.ok(sakuraCard.classList.contains('locked'));
  sakuraCard.trigger('click');
  assert.strictEqual(equippedCall, null);

  // Clicking unlocked OLED Cyan card triggers handler
  const cyanCard = armoryThemesGrid.children.find(c => c.dataset.id === 'oled_cyan');
  assert.ok(cyanCard.classList.contains('unlocked'));
  assert.ok(cyanCard.classList.contains('equipped'));
  cyanCard.trigger('click');
  assert.deepStrictEqual(equippedCall, { category: 'theme', id: 'oled_cyan' });
});

// 7. GameController Integration: Equipping & Level-Up Unlock Toasts
test('9. GameController equips unlocked cosmetics across all 6 categories, rejects locked ones, and fires cosmetic unlock toasts on level-up', () => {
  const mockStorage = createMockStorage();
  const storage = new StorageService(mockStorage);
  const cosmeticsModel = new CosmeticsModel();

  const toasts = [];
  const appliedThemes = [];
  const appliedFlowFx = [];
  const appliedCarets = [];
  const appliedCaretFx = [];
  const appliedGhosts = [];
  const appliedSounds = [];
  const previewedSounds = [];

  const mockHudView = new HUDView({
    achievementToast: createMockElement('div')
  });
  mockHudView.applyTheme = (t) => appliedThemes.push(t.id);
  mockHudView.applyFlowFx = (fx) => appliedFlowFx.push(fx);
  mockHudView.showAchievementToast = (t) => toasts.push(t);

  const mockStageView = new StageView({
    wordsBox: createMockElement('div'),
    wordsWrapper: createMockElement('div'),
    caret: createMockElement('div'),
    ghostCaret: createMockElement('div'),
    focusOverlay: createMockElement('div'),
    typingInput: createMockElement('input')
  });
  const origSetCaret = mockStageView.setCaretStyle.bind(mockStageView);
  mockStageView.setCaretStyle = (c) => { appliedCarets.push(c); origSetCaret(c); };
  const origSetCaretFx = mockStageView.setCaretFx.bind(mockStageView);
  mockStageView.setCaretFx = (fx) => { appliedCaretFx.push(fx); origSetCaretFx(fx); };
  const origSetGhost = mockStageView.setGhostStyle.bind(mockStageView);
  mockStageView.setGhostStyle = (g) => { appliedGhosts.push(g); origSetGhost(g); };

  const mockAudio = new AudioService();
  mockAudio.setSoundPack = (s) => { appliedSounds.push(s); return s; };
  mockAudio.previewSoundPack = (s) => { previewedSounds.push(s); };

  const controller = new GameController({
    wordsModel: new WordsModel(),
    sessionModel: new SessionModel(),
    flowModel: new FlowModel(),
    eggNestModel: new EggNestModel(),
    storageService: storage,
    audioService: mockAudio,
    cosmeticsModel,
    stageView: mockStageView,
    nestView: new NestView(),
    hudView: mockHudView,
    chartView: new ChartView(),
    modalView: new ModalView()
  });

  controller.init();
  assert.ok(appliedThemes.includes('oled_cyan'));
  assert.ok(appliedFlowFx.includes('adaptive_resonance'));
  assert.ok(appliedCarets.includes('line'));
  assert.ok(appliedCaretFx.includes('rainbow_prism'));
  assert.ok(appliedGhosts.includes('phantom_line'));
  assert.ok(appliedSounds.includes('clicky_blue'));

  // Reject equipping locked item at Level 1
  assert.strictEqual(controller.equipCosmetic('caret', 'underline'), false);
  assert.strictEqual(controller.equipCosmetic('flowFx', 'zen_trance'), false);

  // Grant enough XP to reach Level 2 during handleSpace()
  const save = storage.getGameSave();
  save.currentXp = 95;
  storage.saveGameSave(save);

  const word = controller.sessionModel.getCurrentWordText();
  for (const ch of word) {
    controller.handleChar(ch);
  }
  controller.handleSpace();

  // Level 1 -> 2 unlocks 'zen_trance' (flowFx) and 'underline' (caret) and fires cosmetic toasts
  const cosmeticToasts = toasts.filter(t => t.tier === 'cosmetic');
  assert.strictEqual(cosmeticToasts.length, 2);
  const toastTitles = cosmeticToasts.map(t => t.title);
  assert.ok(toastTitles.includes('Zen Trance'));
  assert.ok(toastTitles.includes('Low-Profile Runner'));

  // Now equipping 'underline' and 'zen_trance' succeeds
  assert.strictEqual(controller.equipCosmetic('caret', 'underline'), true);
  assert.strictEqual(controller.equipCosmetic('flowFx', 'zen_trance'), true);
  assert.strictEqual(storage.getEquippedCosmetics().caret, 'underline');
  assert.strictEqual(storage.getEquippedCosmetics().flowFx, 'zen_trance');

  controller.destroy();
});

console.log(`\n🎉 All ${passed} Cosmetic Armory v4.0 tests passed!\n`);
process.exit(0);
