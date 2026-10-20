/**
 * TypeFlow - Centralized Game Constants & Mathematical Configurations
 */

const CONSTANTS = {
  // Rarity Tiers & Progression (Asymmetric Rarity Pyramid)
  RARITY_TIERS: {
    STARTER:  { id: 'STARTER',  maxRank: 40,   name: 'Starter',  color: '#38bdf8', xp: 8 },
    COMMON:   { id: 'COMMON',   maxRank: 300,  name: 'Common',   color: '#2dd4bf', xp: 15 },
    UNCOMMON: { id: 'UNCOMMON', maxRank: 600,  name: 'Uncommon', color: '#34d399', xp: 35 },
    RARE:     { id: 'RARE',     maxRank: 850,  name: 'Rare',     color: '#c084fc', xp: 80 },
    EPIC:     { id: 'EPIC',     maxRank: 1000, name: 'Epic',     color: '#fbbf24', xp: 180 }
  },

  // Neuromuscular Pattern Costs (Biomechanical Friction)
  PATTERN_COST: {
    HOME_CORE:     0.0,
    ALTERNATING:   1.0,
    SUFFIX_CURL:   2.5,
    DOUBLE_BOUNCE: 3.5,
    REACH_PINKY:   5.0
  },

  // Keyboard Topography
  KEYBOARD: {
    LEFT_HAND:  'qwertasdfgzxcvb',
    RIGHT_HAND: 'yuiophjklnm',
    TOP_ROW:    'qwertyuiop',
    HOME_ROW:   'asdfghjkl',
    BOT_ROW:    'zxcvbnm'
  },

  // Flow Flywheel Mechanics
  FLOW: {
    MOMENTUM_MIN: 0.0,
    MOMENTUM_MAX: 1.20,             // 120% Apex Cap
    APEX_THRESHOLD: 1.00,           // 100% enters Apex Flow
    TRANSITION_THRESHOLD: 0.85,     // 85% enters Flow State
    ACCEL_PER_CLEAN_WORD: 0.04,     // +4% momentum on clean hit >= target WPM
    DAMPENED_STUMBLE_PENALTY: 0.08, // -8% penalty when absorbing error in Apex
    NORMAL_STUMBLE_PENALTY: 0.18,   // -18% penalty on error in Sub-Flow/Transition
    CUSHION_TIME_MS: 3000,          // 3s Apex cushion to absorb slowdowns
    IDLE_DECAY_RATE_PER_SEC: 0.05,  // 5% momentum decay per second of inactivity
    CHALLENGE_SCALE: {
      SUB_FLOW: 0.35,               // Smooth runway of mastered words
      TRANSITION: 0.85,             // Moderate challenge
      APEX: 1.25                    // Aggressively targets weak patterns
    }
  },

  // Difficulty & WPM Pacing Limits
  DIFFICULTY: {
    SLIDER_MIN: 15,
    SLIDER_MAX: 120,
    INPUT_MIN: 5,
    INPUT_MAX: 300,
    DEFAULT_WPM: 40
  },

  // Classic Mode Configs
  CLASSIC: {
    DURATIONS: [15, 30, 60],
    DEFAULT_DURATION: 30
  },

  // In-Situ Egg Nest Mechanics
  NEST: {
    MAX_SLOTS: 3,
    CRACK_WORD: 'egg',
    DROP_CHANCE_BASE: 0.15,
    STREAK_BONUS_INTERVAL: 15
  },

  // Storage Keys
  STORAGE_KEYS: {
    CLASSIC_STATS: 'typeflow_classic_stats_v1',
    GAME_SAVE:     'typeflow_game_save_v2',
    ACTIVE_MODE:   'typeflow_active_mode'
  }
};

if (typeof window !== 'undefined') {
  window.CONSTANTS = CONSTANTS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONSTANTS };
}
