/**
 * TypeFlow - CosmeticsModel
 * Pure headless model for Level Progression Unlocks & Cosmetic Armory (v4.0).
 * Defines 16 procedural cosmetics across 3 categories:
 *   - 6 OLED Themes & Palettes
 *   - 5 Caret Geometries & Visual FX
 *   - 5 Web Audio Mechanical Switch Sound Packs
 * Zero DOM or storage dependencies.
 */

const COSMETIC_THEMES = {
  oled_cyan: {
    id: 'oled_cyan',
    category: 'theme',
    title: 'Electric Sky',
    icon: '⚡',
    desc: 'True OLED pitch black paired with electric sky blue and crisp slate.',
    reqLevel: 1,
    reqTrophies: [],
    reqLabel: 'Default (Lv. 1)',
    swatches: ['#000000', '#38bdf8', '#526071', '#f1f5f9'],
    vars: {
      '--bg-color': '#000000',
      '--bg-secondary': '#0b0f14',
      '--main-color': '#38bdf8',
      '--main-color-hover': '#7dd3fc',
      '--caret-color': '#38bdf8',
      '--accent': '#38bdf8',
      '--sub-color': '#526071',
      '--sub-alt-color': '#121820',
      '--border-color': '#1a2332',
      '--text-color': '#f1f5f9'
    }
  },
  sakura_stream: {
    id: 'sakura_stream',
    category: 'theme',
    title: 'Sakura Stream',
    icon: '🌸',
    desc: 'Soft midnight charcoal with pastel blossom pink, rose glow, and warm ivory.',
    reqLevel: 3,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 3',
    swatches: ['#07050a', '#f472b6', '#fb7185', '#fdf2f8'],
    vars: {
      '--bg-color': '#07050a',
      '--bg-secondary': '#120d18',
      '--main-color': '#f472b6',
      '--main-color-hover': '#f9a8d4',
      '--caret-color': '#fb7185',
      '--accent': '#f472b6',
      '--sub-color': '#7c657e',
      '--sub-alt-color': '#1b1324',
      '--border-color': '#2d1f3b',
      '--text-color': '#fdf2f8'
    }
  },
  phosphor_crt: {
    id: 'phosphor_crt',
    category: 'theme',
    title: 'Phosphor Terminal',
    icon: '🖥️',
    desc: 'Classic hacker monochrome CRT obsidian with matrix emerald and phosphor mint.',
    reqLevel: 6,
    reqTrophies: ['steady_cadence'],
    reqLabel: 'Lv. 6 or Steady Cadence Trophy',
    swatches: ['#020804', '#10b981', '#34d399', '#ecfdf5'],
    vars: {
      '--bg-color': '#020804',
      '--bg-secondary': '#07140c',
      '--main-color': '#10b981',
      '--main-color-hover': '#34d399',
      '--caret-color': '#34d399',
      '--accent': '#10b981',
      '--sub-color': '#3b6e56',
      '--sub-alt-color': '#0b1e13',
      '--border-color': '#133322',
      '--text-color': '#ecfdf5'
    }
  },
  cyberpunk_neon: {
    id: 'cyberpunk_neon',
    category: 'theme',
    title: 'Cyberpunk Neon',
    icon: '🌆',
    desc: 'High-contrast synthwave void with hot magenta and radioactive cyber cyan.',
    reqLevel: 10,
    reqTrophies: ['cruising_60'],
    reqLabel: 'Lv. 10 or Cruising Altitude Trophy',
    swatches: ['#080312', '#e879f9', '#22d3ee', '#fae8ff'],
    vars: {
      '--bg-color': '#080312',
      '--bg-secondary': '#120824',
      '--main-color': '#e879f9',
      '--main-color-hover': '#f0abfc',
      '--caret-color': '#22d3ee',
      '--accent': '#e879f9',
      '--sub-color': '#735796',
      '--sub-alt-color': '#1a0c33',
      '--border-color': '#2e1659',
      '--text-color': '#fae8ff'
    }
  },
  nord_frost: {
    id: 'nord_frost',
    category: 'theme',
    title: 'Nord Frost',
    icon: '❄️',
    desc: 'Glacial deep slate with arctic indigo, polar ice, and frosted snow white.',
    reqLevel: 15,
    reqTrophies: ['silver_stream'],
    reqLabel: 'Lv. 15 or Silver Stream Trophy',
    swatches: ['#090d16', '#818cf8', '#a5b4fc', '#eef2ff'],
    vars: {
      '--bg-color': '#090d16',
      '--bg-secondary': '#111827',
      '--main-color': '#818cf8',
      '--main-color-hover': '#a5b4fc',
      '--caret-color': '#818cf8',
      '--accent': '#818cf8',
      '--sub-color': '#64748b',
      '--sub-alt-color': '#1e293b',
      '--border-color': '#334155',
      '--text-color': '#eef2ff'
    }
  },
  obsidian_gold: {
    id: 'obsidian_gold',
    category: 'theme',
    title: 'Sovereign Gold',
    icon: '👑',
    desc: 'Royal pitch obsidian with sovereign gold luminescence and warm champagne.',
    reqLevel: 20,
    reqTrophies: [],
    reqTrophyCount: 10,
    reqLabel: 'Lv. 20 or 10+ Trophies Unlocked',
    swatches: ['#060502', '#fbbf24', '#fcd34d', '#fefce8'],
    vars: {
      '--bg-color': '#060502',
      '--bg-secondary': '#120f07',
      '--main-color': '#fbbf24',
      '--main-color-hover': '#fcd34d',
      '--caret-color': '#fbbf24',
      '--accent': '#fbbf24',
      '--sub-color': '#786b49',
      '--sub-alt-color': '#1c170b',
      '--border-color': '#362d16',
      '--text-color': '#fefce8'
    }
  }
};

const COSMETIC_CARETS = {
  line: {
    id: 'line',
    category: 'caret',
    title: 'Precision Bar',
    icon: '│',
    desc: 'Clean 3px vertical bar with subpixel horizontal glide.',
    reqLevel: 1,
    reqTrophies: [],
    reqLabel: 'Default (Lv. 1)'
  },
  underline: {
    id: 'underline',
    category: 'caret',
    title: 'Low-Profile Runner',
    icon: '▁',
    desc: 'Sleek 3px horizontal underline gliding beneath the active character.',
    reqLevel: 2,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 2'
  },
  block: {
    id: 'block',
    category: 'caret',
    title: 'Retro Terminal Block',
    icon: '█',
    desc: 'Translucent full-character terminal block cursor with crisp accent trim.',
    reqLevel: 4,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 4'
  },
  capsule: {
    id: 'capsule',
    category: 'caret',
    title: 'Pulse Capsule',
    icon: '⬭',
    desc: 'Rounded glowing pill caret with a subtle rhythmic breathing aura.',
    reqLevel: 8,
    reqTrophies: ['sustained_current'],
    reqLabel: 'Lv. 8 or Sustained Current Trophy'
  },
  prism: {
    id: 'prism',
    category: 'caret',
    title: 'Permanent Prism',
    icon: '🌈',
    desc: 'Keeps the 100% Flow iridescent rainbow barber-pole aura active at all times.',
    reqLevel: 12,
    reqTrophies: ['zen_master', 'overclocked'],
    reqLabel: 'Lv. 12 or Zen Master / Overclocked'
  }
};

const COSMETIC_SOUNDS = {
  clicky_blue: {
    id: 'clicky_blue',
    category: 'sound',
    title: 'Box Blue (Clicky)',
    icon: '🟦',
    desc: 'Crisp high-frequency mechanical click with flow-streak semitone pitch scaling.',
    reqLevel: 1,
    reqTrophies: [],
    reqLabel: 'Default (Lv. 1)'
  },
  thoccy_linear: {
    id: 'thoccy_linear',
    category: 'sound',
    title: 'Gateron Ink (Thoccy)',
    icon: '⬛',
    desc: 'Deep, muted low-frequency acoustic thock with warm sub-bass resonance.',
    reqLevel: 3,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 3'
  },
  tactile_brown: {
    id: 'tactile_brown',
    category: 'sound',
    title: 'Tactile Brown',
    icon: '🟫',
    desc: 'Rounded mid-range dual-transient tactile bump with gentle acoustic warmth.',
    reqLevel: 5,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 5'
  },
  zen_droplet: {
    id: 'zen_droplet',
    category: 'sound',
    title: 'Zen Water Droplet',
    icon: '💧',
    desc: 'Organic upward pitch-bent harmonic droplet for a calming zen atmosphere.',
    reqLevel: 9,
    reqTrophies: ['shadow_walker'],
    reqLabel: 'Lv. 9 or Shadow Walker Trophy'
  },
  typewriter: {
    id: 'typewriter',
    category: 'sound',
    title: 'Vintage Striker',
    icon: '📠',
    desc: 'Crisp metallic striker impact with a subtle carriage chime on spacebar.',
    reqLevel: 14,
    reqTrophies: ['marksman'],
    reqLabel: 'Lv. 14 or Marksman Trophy'
  }
};

const COSMETIC_FLOW_FX = {
  adaptive_resonance: {
    id: 'adaptive_resonance',
    category: 'flowFx',
    title: 'Adaptive Resonance',
    icon: '🔮',
    desc: '100% theme-reactive portals and perimeter glow dynamically matched to your equipped theme.',
    reqLevel: 1,
    reqTrophies: [],
    reqLabel: 'Default (Lv. 1)',
    swatches: ['var(--main-color)', 'var(--caret-color)', 'var(--sub-color)']
  },
  zen_trance: {
    id: 'zen_trance',
    category: 'flowFx',
    title: 'Zen Trance',
    icon: '🌑',
    desc: 'Zero chromatic distraction. Deep velvet focus vignette with a razor-thin luminance hairline.',
    reqLevel: 2,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 2',
    swatches: ['#000000', '#334155', '#e2e8f0']
  },
  prismatic_aurora: {
    id: 'prismatic_aurora',
    category: 'flowFx',
    title: 'Prismatic Aurora',
    icon: '🌌',
    desc: 'Ethereal northern lights ribbons undulating across the screen borders with iridescent refraction.',
    reqLevel: 7,
    reqTrophies: ['sustained_current'],
    reqLabel: 'Lv. 7 or Sustained Current Trophy',
    swatches: ['#00ff88', '#00ccff', '#818cf8', '#f472b6']
  },
  cyberpunk_grid: {
    id: 'cyberpunk_grid',
    category: 'flowFx',
    title: 'Cyberpunk Grid',
    icon: '🕸️',
    desc: 'Synthwave wireframe laser frame with perspective corner grids and subtle CRT scanlines.',
    reqLevel: 11,
    reqTrophies: ['flow_architect'],
    reqLabel: 'Lv. 11 or Flow Architect Trophy',
    swatches: ['#e879f9', '#22d3ee', '#7928ca']
  },
  solar_flame: {
    id: 'solar_flame',
    category: 'flowFx',
    title: 'Solar Inferno',
    icon: '🔥',
    desc: 'Procedural organic flames generated via SVG turbulence filters with rising combustion embers.',
    reqLevel: 16,
    reqTrophies: ['unstoppable_current', 'supersonic_90'],
    reqLabel: 'Lv. 16 or Unstoppable / Supersonic',
    swatches: ['#dc2626', '#f97316', '#fbbf24', '#fef08a']
  },
  hyperdrive_warp: {
    id: 'hyperdrive_warp',
    category: 'flowFx',
    title: 'Hyperdrive Warp',
    icon: '🚀',
    desc: 'Sci-fi velocity tunnel with radial speedline streaks around the viewport periphery.',
    reqLevel: 19,
    reqTrophies: ['flow_grandmaster', 'mach_1'],
    reqLabel: 'Lv. 19 or Grandmaster / Mach 1',
    swatches: ['#38bdf8', '#818cf8', '#f8fafc']
  }
};

const COSMETIC_CARET_FX = {
  rainbow_prism: {
    id: 'rainbow_prism',
    category: 'caretFx',
    title: 'Prismatic Rainbow',
    icon: '🌈',
    desc: 'Classic 135° diagonal chromatic spectrum sliding continuously across any caret shape.',
    reqLevel: 1,
    reqTrophies: [],
    reqLabel: 'Default (Lv. 1)',
    swatches: ['#ff0055', '#ffcc00', '#00ff88', '#00ccff']
  },
  theme_overdrive: {
    id: 'theme_overdrive',
    category: 'caretFx',
    title: 'Theme Overdrive',
    icon: '⚡',
    desc: 'Supercharged high-contrast aura cycling between your theme accent and a white-hot core.',
    reqLevel: 4,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 4',
    swatches: ['var(--main-color)', 'var(--caret-color)', '#ffffff']
  },
  solar_flare: {
    id: 'solar_flare',
    category: 'caretFx',
    title: 'Solar Flare',
    icon: '☀️',
    desc: 'Blazing thermal gradient rising from cherry red and ember orange to solar gold.',
    reqLevel: 8,
    reqTrophies: ['hot_streak'],
    reqLabel: 'Lv. 8 or Hot Streak Trophy',
    swatches: ['#dc2626', '#f97316', '#fbbf24', '#fef08a']
  },
  holo_glitch: {
    id: 'holo_glitch',
    category: 'caretFx',
    title: 'Holo Glitch',
    icon: '👾',
    desc: 'Digital scanline bands with high-frequency micro-jitter and RGB chromatic split.',
    reqLevel: 13,
    reqTrophies: ['clutch_recovery'],
    reqLabel: 'Lv. 13 or Clutch Recovery Trophy',
    swatches: ['#f43f5e', '#ffffff', '#22d3ee']
  },
  frost_sparkle: {
    id: 'frost_sparkle',
    category: 'caretFx',
    title: 'Ethereal Frost',
    icon: '❄️',
    desc: 'Shimmering diamond cyan, polar ice, and snow-white crystalline refraction.',
    reqLevel: 15,
    reqTrophies: ['ice_veins'],
    reqLabel: 'Lv. 15 or Ice in the Veins Trophy',
    swatches: ['#38bdf8', '#e0f2fe', '#ffffff', '#818cf8']
  },
  plasma_arc: {
    id: 'plasma_arc',
    category: 'caretFx',
    title: 'Plasma Arc',
    icon: '⚛️',
    desc: 'High-voltage electric violet, hot magenta, and arc-white plasma flicker.',
    reqLevel: 18,
    reqTrophies: ['overclocked'],
    reqLabel: 'Lv. 18 or Overclocked Trophy',
    swatches: ['#a855f7', '#ec4899', '#38bdf8', '#ffffff']
  }
};

const COSMETIC_GHOST_STYLES = {
  phantom_line: {
    id: 'phantom_line',
    category: 'ghostStyle',
    title: 'Phantom Beam',
    icon: '👻',
    desc: 'Classic semi-transparent ethereal white vertical pacer beam.',
    reqLevel: 1,
    reqTrophies: [],
    reqLabel: 'Default (Lv. 1)',
    swatches: ['#ffffff', '#94a3b8']
  },
  hologram_runner: {
    id: 'hologram_runner',
    category: 'ghostStyle',
    title: 'Hologram Runner',
    icon: '▁',
    desc: 'Full-character glowing cyan underline runner skimming beneath target letters.',
    reqLevel: 3,
    reqTrophies: ['pace_setter'],
    reqLabel: 'Lv. 3 or Pace Setter Trophy',
    swatches: ['#22d3ee', '#0ea5e9']
  },
  theme_specter: {
    id: 'theme_specter',
    category: 'ghostStyle',
    title: 'Theme Specter',
    icon: '💠',
    desc: 'Vertical pacer beam tinted dynamically with your active theme accent and glow.',
    reqLevel: 5,
    reqTrophies: [],
    reqLabel: 'Reach Lv. 5',
    swatches: ['var(--main-color)', 'var(--caret-color)']
  },
  wireframe_block: {
    id: 'wireframe_block',
    category: 'ghostStyle',
    title: 'Wireframe Box',
    icon: '▢',
    desc: 'Full-character hollow terminal wireframe box framing the target pace character.',
    reqLevel: 6,
    reqTrophies: ['ghost_whisperer'],
    reqLabel: 'Lv. 6 or Ghost Whisperer Trophy',
    swatches: ['#38bdf8', '#0f172a']
  },
  golden_hare: {
    id: 'golden_hare',
    category: 'ghostStyle',
    title: 'Golden Hare',
    icon: '🏆',
    desc: 'Championship radiant gold vertical capsule with warm amber luminescence.',
    reqLevel: 10,
    reqTrophies: ['shadow_conqueror'],
    reqLabel: 'Lv. 10 or Shadow Conqueror Trophy',
    swatches: ['#fbbf24', '#f59e0b', '#fef08a']
  },
  shadow_rival: {
    id: 'shadow_rival',
    category: 'ghostStyle',
    title: 'Crimson Rival',
    icon: '⚔️',
    desc: 'Translucent dark-crimson block cursor with a razor-sharp crimson bottom edge.',
    reqLevel: 14,
    reqTrophies: ['ghost_duelist'],
    reqLabel: 'Lv. 14 or Ghost Duelist Trophy',
    swatches: ['#f43f5e', '#881337']
  }
};

const DEFAULT_EQUIPPED_COSMETICS = {
  theme: 'oled_cyan',
  flowFx: 'adaptive_resonance',
  caret: 'line',
  caretFx: 'rainbow_prism',
  ghostStyle: 'phantom_line',
  sound: 'clicky_blue'
};

class CosmeticsModel {
  constructor() {
    this.themes = COSMETIC_THEMES;
    this.flowFx = COSMETIC_FLOW_FX;
    this.carets = COSMETIC_CARETS;
    this.caretFx = COSMETIC_CARET_FX;
    this.ghostStyles = COSMETIC_GHOST_STYLES;
    this.sounds = COSMETIC_SOUNDS;
    this.allById = Object.assign(
      {},
      COSMETIC_THEMES,
      COSMETIC_FLOW_FX,
      COSMETIC_CARETS,
      COSMETIC_CARET_FX,
      COSMETIC_GHOST_STYLES,
      COSMETIC_SOUNDS
    );
  }

  getItem(id) {
    return this.allById[id] || null;
  }

  getTheme(id) {
    return this.themes[id] || this.themes.oled_cyan;
  }

  getFlowFx(id) {
    return this.flowFx[id] || this.flowFx.adaptive_resonance;
  }

  getCaret(id) {
    return this.carets[id] || this.carets.line;
  }

  getCaretFx(id) {
    return this.caretFx[id] || this.caretFx.rainbow_prism;
  }

  getGhostStyle(id) {
    return this.ghostStyles[id] || this.ghostStyles.phantom_line;
  }

  getSound(id) {
    return this.sounds[id] || this.sounds.clicky_blue;
  }

  listByCategory(category) {
    if (category === 'theme' || category === 'themes') return Object.values(this.themes);
    if (category === 'flowFx' || category === 'flowfx') return Object.values(this.flowFx);
    if (category === 'caret' || category === 'carets') return Object.values(this.carets);
    if (category === 'caretFx' || category === 'caretfx') return Object.values(this.caretFx);
    if (category === 'ghostStyle' || category === 'ghost') return Object.values(this.ghostStyles);
    if (category === 'sound' || category === 'sounds') return Object.values(this.sounds);
    return [];
  }

  listAll() {
    return [
      ...Object.values(this.themes),
      ...Object.values(this.flowFx),
      ...Object.values(this.carets),
      ...Object.values(this.caretFx),
      ...Object.values(this.ghostStyles),
      ...Object.values(this.sounds)
    ];
  }

  getTotalCount() {
    return this.listAll().length;
  }

  /**
   * Determines whether a cosmetic item is unlocked given player level and unlocked achievements map.
   */
  isUnlocked(id, level = 1, unlockedAchievements = {}) {
    const item = this.allById[id];
    if (!item) return false;

    const lv = Math.max(1, Number(level) || 1);
    if (lv >= (item.reqLevel || 1)) return true;

    const achMap = unlockedAchievements || {};
    if (Array.isArray(item.reqTrophies) && item.reqTrophies.length > 0) {
      if (item.reqTrophies.some(tId => Boolean(achMap[tId]))) {
        return true;
      }
    }

    if (typeof item.reqTrophyCount === 'number' && item.reqTrophyCount > 0) {
      const unlockedCount = Object.keys(achMap).length;
      if (unlockedCount >= item.reqTrophyCount) {
        return true;
      }
    }

    return false;
  }

  getUnlockedCount(level = 1, unlockedAchievements = {}) {
    return this.listAll().filter(item => this.isUnlocked(item.id, level, unlockedAchievements)).length;
  }

  getAnnotatedItems(category, level = 1, unlockedAchievements = {}, equipped = {}) {
    const eq = Object.assign({}, DEFAULT_EQUIPPED_COSMETICS, equipped);
    return this.listByCategory(category).map(item => {
      const unlocked = this.isUnlocked(item.id, level, unlockedAchievements);
      const isEquipped = eq[item.category] === item.id;
      return Object.assign({}, item, {
        unlocked,
        equipped: isEquipped,
        unlockLabel: item.reqLabel || item.unlockLabel || ''
      });
    });
  }

  /**
   * Returns an array of cosmetic items that crossed from locked -> unlocked when advancing from oldLevel to newLevel.
   */
  getNewlyUnlockedOnLevelUp(oldLevel, newLevel, unlockedAchievements = {}) {
    const prevLv = Math.max(1, Number(oldLevel) || 1);
    const nextLv = Math.max(1, Number(newLevel) || 1);
    if (nextLv <= prevLv) return [];

    return this.listAll().filter(item => {
      const wasUnlocked = this.isUnlocked(item.id, prevLv, unlockedAchievements);
      const nowUnlocked = this.isUnlocked(item.id, nextLv, unlockedAchievements);
      return !wasUnlocked && nowUnlocked;
    });
  }
}

if (typeof window !== 'undefined') {
  window.COSMETIC_THEMES = COSMETIC_THEMES;
  window.COSMETIC_FLOW_FX = COSMETIC_FLOW_FX;
  window.COSMETIC_CARETS = COSMETIC_CARETS;
  window.COSMETIC_CARET_FX = COSMETIC_CARET_FX;
  window.COSMETIC_GHOST_STYLES = COSMETIC_GHOST_STYLES;
  window.COSMETIC_SOUNDS = COSMETIC_SOUNDS;
  window.DEFAULT_EQUIPPED_COSMETICS = DEFAULT_EQUIPPED_COSMETICS;
  window.CosmeticsModel = CosmeticsModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COSMETIC_THEMES,
    COSMETIC_FLOW_FX,
    COSMETIC_CARETS,
    COSMETIC_CARET_FX,
    COSMETIC_GHOST_STYLES,
    COSMETIC_SOUNDS,
    DEFAULT_EQUIPPED_COSMETICS,
    CosmeticsModel
  };
}
