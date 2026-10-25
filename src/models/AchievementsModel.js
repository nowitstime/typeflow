/**
 * TypeFlow - AchievementsModel
 * Pure mathematical & declarative achievement system.
 * Evaluates session/game telemetry against tiered milestones and signature feats.
 * Zero DOM dependencies.
 */

const ACHIEVEMENTS = {
  // --- Speed & Cadence ---
  cruising_60: {
    id: 'cruising_60',
    groupId: 'velocity',
    tier: 1,
    title: 'Cruising Altitude',
    icon: '✈️',
    desc: 'Complete 5 Classic tests (30s+) at 60+ WPM with ≥96% accuracy.',
    category: 'speed',
    target: 5
  },
  triple_digits: {
    id: 'triple_digits',
    groupId: 'velocity',
    tier: 2,
    title: 'Triple Digits',
    icon: '🚀',
    desc: 'Complete 5 Classic tests (30s+) at 100+ WPM with ≥96% accuracy.',
    category: 'speed',
    target: 5
  },
  steady_cadence: {
    id: 'steady_cadence',
    groupId: 'consistency',
    tier: 1,
    title: 'Steady Cadence',
    icon: '⏱️',
    desc: 'Complete 3 Classic tests at 50+ WPM with ≥85% consistency.',
    category: 'speed',
    target: 3
  },
  human_metronome: {
    id: 'human_metronome',
    groupId: 'consistency',
    tier: 2,
    title: 'Human Metronome',
    icon: '🎵',
    desc: 'Complete 5 Classic tests at 70+ WPM with ≥92% consistency.',
    category: 'speed',
    target: 5
  },
  terminal_velocity: {
    id: 'terminal_velocity',
    groupId: 'burst',
    tier: 'apex',
    title: 'Terminal Velocity',
    icon: '⚡',
    desc: 'Hit 130+ Instantaneous Burst WPM on a word of 5+ letters while in Apex Flow.',
    category: 'speed'
  },

  // --- Flow State & Flywheel Physics ---
  sustained_current: {
    id: 'sustained_current',
    groupId: 'flow_duration',
    tier: 1,
    title: 'Sustained Current',
    icon: '🌊',
    desc: 'Maintain uninterrupted Flow (≥85% momentum) for 30 consecutive seconds.',
    category: 'flow',
    target: 30
  },
  zen_master: {
    id: 'zen_master',
    groupId: 'flow_duration',
    tier: 2,
    title: 'Zen Master',
    icon: '🧘',
    desc: 'Maintain uninterrupted Flow (≥85% momentum) for 120 consecutive seconds (2 minutes).',
    category: 'flow',
    target: 120
  },
  redline_runner: {
    id: 'redline_runner',
    groupId: 'overspin',
    tier: 1,
    title: 'Redline Runner',
    icon: '🏎️',
    desc: 'Charge to 120% Apex Overspin and hold it for 10 consecutive words.',
    category: 'flow',
    target: 10
  },
  overclocked: {
    id: 'overclocked',
    groupId: 'overspin',
    tier: 2,
    title: 'Overclocked',
    icon: '🔥',
    desc: 'Sustain 120% Apex Overspin for 30 consecutive words without slipping.',
    category: 'flow',
    target: 30
  },
  silver_stream: {
    id: 'silver_stream',
    groupId: 'stream',
    tier: 1,
    title: 'Silver Stream',
    icon: '🥈',
    desc: 'Achieve a 50-word clean streak in Flow Mode without a single typo.',
    category: 'flow',
    target: 50
  },
  unbroken_stream: {
    id: 'unbroken_stream',
    groupId: 'stream',
    tier: 2,
    title: 'Unbroken Stream',
    icon: '💎',
    desc: 'Achieve a 100-word clean streak in Flow Mode without a single typo.',
    category: 'flow',
    target: 100
  },

  // --- Precision & Recovery ---
  marksman: {
    id: 'marksman',
    groupId: 'raw_precision',
    tier: 1,
    title: 'Marksman',
    icon: '🎯',
    desc: 'Complete 5 Classic tests (30s+) with ≥98% accuracy.',
    category: 'precision',
    target: 5
  },
  surgical_precision: {
    id: 'surgical_precision',
    groupId: 'raw_precision',
    tier: 2,
    title: 'Surgical Precision',
    icon: '🔬',
    desc: 'Complete 3 Classic tests (30s+) with 100% True Raw accuracy (0 typos, 0 backspaces).',
    category: 'precision',
    target: 3
  },
  quick_patch: {
    id: 'quick_patch',
    groupId: 'recovery',
    tier: 1,
    title: 'Quick Patch',
    icon: '🛠️',
    desc: 'Fix 3+ typos with Backspace in a Classic test and finish with 0 uncorrected errors.',
    category: 'precision',
    target: 3
  },
  clutch_recovery: {
    id: 'clutch_recovery',
    groupId: 'recovery',
    tier: 2,
    title: 'Clutch Recovery',
    icon: '🔧',
    desc: 'Fix 6+ typos with Backspace in a Classic test and finish with 0 uncorrected errors.',
    category: 'precision',
    target: 6
  },

  // --- Hidden Horizon ---
  vanishing_act: {
    id: 'vanishing_act',
    groupId: 'word_vanish',
    tier: 1,
    title: 'Vanishing Act',
    icon: '🕶️',
    desc: 'Type 20 consecutive clean words with Word Vanish distance set to 2 words.',
    category: 'hidden',
    target: 20
  },
  mind_palace: {
    id: 'mind_palace',
    groupId: 'word_vanish',
    tier: 2,
    title: 'Mind Palace',
    icon: '🧠',
    desc: 'Type 25 consecutive clean words with Word Vanish distance set to 4+ words.',
    category: 'hidden',
    target: 25
  },
  shadow_walker: {
    id: 'shadow_walker',
    groupId: 'char_horizon',
    tier: 1,
    title: 'Shadow Walker',
    icon: '🌫️',
    desc: 'Reach a 35-character combo in Character Horizon mode.',
    category: 'hidden',
    target: 35
  },
  into_the_fog: {
    id: 'into_the_fog',
    groupId: 'char_horizon',
    tier: 2,
    title: 'Into the Fog',
    icon: '🌌',
    desc: 'Reach a 70-character combo in Character Horizon mode.',
    category: 'hidden',
    target: 70
  },
  blind_typist: {
    id: 'blind_typist',
    groupId: 'hidden_volume',
    tier: 1,
    title: 'Blind Typist',
    icon: '🙈',
    desc: 'Complete 3 Classic tests (30s+) or 75 Flow words in Hidden Mode with ≥96% accuracy.',
    category: 'hidden',
    target: 3
  },
  true_sight: {
    id: 'true_sight',
    groupId: 'hidden_volume',
    tier: 2,
    title: 'True Sight',
    icon: '👁️‍🗨️',
    desc: 'Complete a 60s Classic test or 150 Flow words in Hidden Mode with ≥98% accuracy.',
    category: 'hidden'
  },

  // --- Ghost Pacer ---
  rabbit_chaser: {
    id: 'rabbit_chaser',
    groupId: 'ghost_race',
    tier: 1,
    title: 'Rabbit Chaser',
    icon: '🐇',
    desc: 'Enable Ghost Cursor at 60+ WPM and finish a 30s test or 35 Flow words without falling behind.',
    category: 'ghost',
    target: 35
  },
  shadow_boxer: {
    id: 'shadow_boxer',
    groupId: 'ghost_race',
    tier: 2,
    title: 'Shadow Boxer',
    icon: '👻',
    desc: 'Enable Ghost Cursor at 85+ WPM and finish a 30s test or 50 Flow words without falling behind.',
    category: 'ghost',
    target: 50
  },

  // --- Lexicon & Hatchery RPG ---
  nest_tender: {
    id: 'nest_tender',
    groupId: 'hatchery',
    tier: 1,
    title: 'Nest Tender',
    icon: '🪺',
    desc: 'Incubate and hatch 15 word eggs.',
    category: 'rpg',
    target: 15
  },
  grand_incubator: {
    id: 'grand_incubator',
    groupId: 'hatchery',
    tier: 2,
    title: 'Grand Incubator',
    icon: '🌟',
    desc: 'Incubate and hatch 60 word eggs.',
    category: 'rpg',
    target: 60
  },
  lexicon_explorer: {
    id: 'lexicon_explorer',
    groupId: 'lexicon_ranks',
    tier: 1,
    title: 'Lexicon Explorer',
    icon: '🗺️',
    desc: 'Unlock 50 unique words in your Flow RPG deck.',
    category: 'rpg',
    target: 50
  },
  lexicon_architect: {
    id: 'lexicon_architect',
    groupId: 'lexicon_ranks',
    tier: 2,
    title: 'Lexicon Architect',
    icon: '📚',
    desc: 'Unlock 250 unique words in your Flow RPG deck.',
    category: 'rpg',
    target: 250
  },
  golden_discovery: {
    id: 'golden_discovery',
    groupId: 'rarity',
    tier: 1,
    title: 'Golden Discovery',
    icon: '🔮',
    desc: 'Incubate and hatch a Rare-tier word (Rank 601–850).',
    category: 'rpg'
  },
  mythic_discovery: {
    id: 'mythic_discovery',
    groupId: 'rarity',
    tier: 2,
    title: 'Mythic Discovery',
    icon: '👑',
    desc: 'Incubate and hatch an Epic-tier word (Rank 851–1000).',
    category: 'rpg'
  },
  tri_core_flow: {
    id: 'tri_core_flow',
    groupId: 'motor_buckets',
    tier: 1,
    title: 'Tri-Core Flow',
    icon: '🧩',
    desc: 'Master words (streak ≥5) in at least 3 different motor buckets.',
    category: 'rpg',
    target: 3
  },
  five_finger_pentathlon: {
    id: 'five_finger_pentathlon',
    groupId: 'motor_buckets',
    tier: 2,
    title: 'Five-Finger Pentathlon',
    icon: '🖐️',
    desc: 'Master at least 3 words in all 5 motor buckets (Home Core, Alternator, Suffix, Pinky, Bounce).',
    category: 'rpg',
    target: 5
  },

  // --- Crown Jewel ---
  lexicon_1000: {
    id: 'lexicon_1000',
    groupId: 'crown_jewel',
    tier: 'crown',
    title: 'The Grand Lexicon',
    icon: '🏛️',
    desc: 'Unlock all 1,000 words in the TypeFlow frequency dictionary.',
    category: 'rpg',
    target: 1000
  },

  // --- Signature Feats ---
  shock_absorber: {
    id: 'shock_absorber',
    groupId: 'feats',
    tier: 'feat',
    title: 'Shock Absorber',
    icon: '🛡️',
    desc: 'Absorb a typo above 100% Apex using the Cushion Buffer without dropping below 85% Flow, and recover back to 100%.',
    category: 'feats'
  },
  in_stride_crack: {
    id: 'in_stride_crack',
    groupId: 'feats',
    tier: 'feat',
    title: 'In-Stride Crack',
    icon: '⚡',
    desc: 'Enter Hatch Mode (Tab), crack an egg (e-g-g), and resume typing into the sandwich without dropping below 85% Flow.',
    category: 'feats'
  },
  sixth_sense: {
    id: 'sixth_sense',
    groupId: 'feats',
    tier: 'feat',
    title: 'Sixth Sense',
    icon: '🔮',
    desc: 'Hatch an egg and complete the sandwich in Hidden Mode without breaking combo.',
    category: 'feats'
  }
};

class AchievementsModel {
  constructor(unlocked = {}) {
    this.definitions = ACHIEVEMENTS;
    this.unlocked = Object.assign({}, unlocked);
  }

  getDefinitions() {
    return this.definitions;
  }

  isUnlocked(id) {
    return Boolean(this.unlocked[id]);
  }

  getUnlockedMap() {
    return Object.assign({}, this.unlocked);
  }

  getUnlockedCount() {
    return Object.keys(this.unlocked).length;
  }

  getTotalCount() {
    return Object.keys(this.definitions).length;
  }

  listAll() {
    return Object.values(this.definitions).map(def => Object.assign({}, def, {
      unlocked: Boolean(this.unlocked[def.id]),
      unlockedAt: this.unlocked[def.id] || null
    }));
  }

  listUnlocked() {
    return this.listAll().filter(a => a.unlocked);
  }

  /**
   * Evaluates incoming events and returns array of newly unlocked achievement definitions.
   * eventType: 'test_finished' | 'word_completed' | 'egg_hatched' | 'cushion_recovered' | 'in_stride_crack' | 'sync'
   */
  evaluate(eventType, context = {}) {
    const newlyUnlocked = [];

    const tryUnlock = (id) => {
      if (!this.unlocked[id] && this.definitions[id]) {
        const timestamp = Date.now();
        this.unlocked[id] = timestamp;
        newlyUnlocked.push(Object.assign({ unlockedAt: timestamp }, this.definitions[id]));
      }
    };

    const counters = context.counters || {};
    const gameSave = context.gameSave || {};
    const classicStats = context.classicStats || {};

    // 1. Classic Test Finished Event & Sync
    if (eventType === 'test_finished' || eventType === 'sync') {
      const {
        wpm = 0,
        accuracy = 0,
        consistency = 0,
        fixedErrors = 0,
        incorrectChars = 0,
        duration = 0,
        isHidden = false,
        beatGhost = false,
        ghostSpeed = 0
      } = context;

      const uncorrectedErrors = Math.max(0, incorrectChars - fixedErrors);

      // Multi-test counters check
      if (counters.tests60Wpm >= 5) tryUnlock('cruising_60');
      if (counters.tests100Wpm >= 5) tryUnlock('triple_digits');
      if (counters.tests85Consistency >= 3) tryUnlock('steady_cadence');
      if (counters.tests92Consistency >= 5) tryUnlock('human_metronome');
      if (counters.tests98Acc >= 5) tryUnlock('marksman');
      if (counters.tests100RawAcc >= 3) tryUnlock('surgical_precision');
      if (counters.testsHiddenMode >= 3) tryUnlock('blind_typist');

      // Sync checks for persistent streaks & counters
      if (eventType === 'sync') {
        const highStreak = gameSave.highStreak || 0;
        if (highStreak >= 50) tryUnlock('silver_stream');
        if (highStreak >= 100) tryUnlock('unbroken_stream');

        if (counters.eggsHatchedTotal >= 15) tryUnlock('nest_tender');
        if (counters.eggsHatchedTotal >= 60) tryUnlock('grand_incubator');
      }

      if (eventType === 'test_finished') {
        // Typo Recovery
        if (fixedErrors >= 3 && uncorrectedErrors === 0) tryUnlock('quick_patch');
        if (fixedErrors >= 6 && uncorrectedErrors === 0) tryUnlock('clutch_recovery');

        // Hidden Mode Volume
        if (duration >= 60 && isHidden && accuracy >= 98 && uncorrectedErrors === 0) {
          tryUnlock('true_sight');
        }

        // Ghost pacer race in Classic test
        if (duration >= 30 && beatGhost) {
          if (ghostSpeed >= 60) tryUnlock('rabbit_chaser');
          if (ghostSpeed >= 85) tryUnlock('shadow_boxer');
        }
      }
    }

    // 2. Flow Mode Word Completed Event
    if (eventType === 'word_completed') {
      const {
        flowStreak = 0,
        burstWpm = 0,
        wordLength = 0,
        momentum = 0,
        consecutiveApexWords = 0,
        flowSeconds = 0,
        isHidden = false,
        hiddenMethod = 'word',
        hiddenWordDistance = 1,
        hiddenCombo = 0,
        hiddenStreak = 0,
        beatGhost = false,
        ghostConsecutiveWords = 0,
        ghostSpeed = 0
      } = context;

      // Burst WPM Feat (5+ letter word, in 120% apex)
      if (burstWpm >= 130 && wordLength >= 5 && momentum >= 118) {
        tryUnlock('terminal_velocity');
      }

      // Flow Duration
      if (flowSeconds >= 30) tryUnlock('sustained_current');
      if (flowSeconds >= 120) tryUnlock('zen_master');

      // Overspin hold
      if (consecutiveApexWords >= 10) tryUnlock('redline_runner');
      if (consecutiveApexWords >= 30) tryUnlock('overclocked');

      // Clean Stream
      if (flowStreak >= 50) tryUnlock('silver_stream');
      if (flowStreak >= 100) tryUnlock('unbroken_stream');

      // Word Vanish
      if (isHidden && hiddenMethod === 'word') {
        if (hiddenWordDistance >= 2 && hiddenStreak >= 20) tryUnlock('vanishing_act');
        if (hiddenWordDistance >= 4 && hiddenStreak >= 25) tryUnlock('mind_palace');
      }

      // Character Horizon Combo
      if (isHidden && (hiddenMethod === 'char' || hiddenMethod === 'combo')) {
        if (hiddenCombo >= 35) tryUnlock('shadow_walker');
        if (hiddenCombo >= 70) tryUnlock('into_the_fog');
      }

      // Hidden Flow volume
      if (isHidden && hiddenStreak >= 75) tryUnlock('blind_typist');
      if (isHidden && hiddenStreak >= 150) tryUnlock('true_sight');

      // Ghost pacer flow race
      if (beatGhost) {
        if (ghostSpeed >= 60 && ghostConsecutiveWords >= 35) tryUnlock('rabbit_chaser');
        if (ghostSpeed >= 85 && ghostConsecutiveWords >= 50) tryUnlock('shadow_boxer');
      }
    }

    // 3. Egg Hatched Event
    if (eventType === 'egg_hatched') {
      const {
        totalHatched = 0,
        rarityTier = 'STARTER',
        isHidden = false,
        hiddenCombo = 0
      } = context;

      if (totalHatched >= 15) tryUnlock('nest_tender');
      if (totalHatched >= 60) tryUnlock('grand_incubator');

      if (rarityTier === 'RARE') tryUnlock('golden_discovery');
      if (rarityTier === 'EPIC') tryUnlock('mythic_discovery');

      if (isHidden && hiddenCombo > 0) {
        tryUnlock('sixth_sense');
      }
    }

    // 4. Kinetic Signature Feats
    if (eventType === 'cushion_recovered') {
      tryUnlock('shock_absorber');
    }

    if (eventType === 'in_stride_crack') {
      tryUnlock('in_stride_crack');
    }

    // 5. Lexicon & Motor Updates
    if (eventType === 'lexicon_updated' || eventType === 'sync') {
      const ranks = gameSave.unlockedRanks || [];
      const unlockedCount = ranks.length;
      if (unlockedCount >= 50) tryUnlock('lexicon_explorer');
      if (unlockedCount >= 250) tryUnlock('lexicon_architect');
      if (unlockedCount >= 1000) tryUnlock('lexicon_1000');

      if (eventType === 'sync') {
        if (ranks.some(r => r >= 601 && r <= 850)) tryUnlock('golden_discovery');
        if (ranks.some(r => r >= 851 && r <= 1000)) tryUnlock('mythic_discovery');
      }

      // Motor bucket evaluation
      const motorBuckets = context.motorBucketsCount || 0;
      const allFiveMastered = context.allFiveMastered || false;
      if (motorBuckets >= 3) tryUnlock('tri_core_flow');
      if (allFiveMastered) tryUnlock('five_finger_pentathlon');
    }

    return newlyUnlocked;
  }

  /**
   * Calculates progress towards an achievement for the UI.
   * Returns { current, target, pct, label }
   */
  getProgress(id, counters = {}, gameSave = {}, extraContext = {}) {
    const def = this.definitions[id];
    if (!def) return null;

    if (this.isUnlocked(id)) {
      return { current: def.target || 1, target: def.target || 1, pct: 100, label: 'Completed' };
    }

    switch (id) {
      case 'cruising_60':
        return { current: Math.min(5, counters.tests60Wpm || 0), target: 5, pct: Math.min(100, Math.round(((counters.tests60Wpm || 0) / 5) * 100)), label: `${counters.tests60Wpm || 0} / 5 tests` };
      case 'triple_digits':
        return { current: Math.min(5, counters.tests100Wpm || 0), target: 5, pct: Math.min(100, Math.round(((counters.tests100Wpm || 0) / 5) * 100)), label: `${counters.tests100Wpm || 0} / 5 tests` };
      case 'steady_cadence':
        return { current: Math.min(3, counters.tests85Consistency || 0), target: 3, pct: Math.min(100, Math.round(((counters.tests85Consistency || 0) / 3) * 100)), label: `${counters.tests85Consistency || 0} / 3 tests` };
      case 'human_metronome':
        return { current: Math.min(5, counters.tests92Consistency || 0), target: 5, pct: Math.min(100, Math.round(((counters.tests92Consistency || 0) / 5) * 100)), label: `${counters.tests92Consistency || 0} / 5 tests` };
      case 'marksman':
        return { current: Math.min(5, counters.tests98Acc || 0), target: 5, pct: Math.min(100, Math.round(((counters.tests98Acc || 0) / 5) * 100)), label: `${counters.tests98Acc || 0} / 5 tests` };
      case 'surgical_precision':
        return { current: Math.min(3, counters.tests100RawAcc || 0), target: 3, pct: Math.min(100, Math.round(((counters.tests100RawAcc || 0) / 3) * 100)), label: `${counters.tests100RawAcc || 0} / 3 tests` };
      case 'blind_typist':
        return { current: Math.min(3, counters.testsHiddenMode || 0), target: 3, pct: Math.min(100, Math.round(((counters.testsHiddenMode || 0) / 3) * 100)), label: `${counters.testsHiddenMode || 0} / 3 tests` };
      case 'silver_stream':
        return { current: Math.min(50, gameSave.highStreak || 0), target: 50, pct: Math.min(100, Math.round(((gameSave.highStreak || 0) / 50) * 100)), label: `${gameSave.highStreak || 0} / 50 words` };
      case 'unbroken_stream':
        return { current: Math.min(100, gameSave.highStreak || 0), target: 100, pct: Math.min(100, Math.round(((gameSave.highStreak || 0) / 100) * 100)), label: `${gameSave.highStreak || 0} / 100 words` };
      case 'nest_tender':
        return { current: Math.min(15, counters.eggsHatchedTotal || 0), target: 15, pct: Math.min(100, Math.round(((counters.eggsHatchedTotal || 0) / 15) * 100)), label: `${counters.eggsHatchedTotal || 0} / 15 eggs` };
      case 'grand_incubator':
        return { current: Math.min(60, counters.eggsHatchedTotal || 0), target: 60, pct: Math.min(100, Math.round(((counters.eggsHatchedTotal || 0) / 60) * 100)), label: `${counters.eggsHatchedTotal || 0} / 60 eggs` };
      case 'lexicon_explorer':
        const len50 = (gameSave.unlockedRanks || []).length;
        return { current: Math.min(50, len50), target: 50, pct: Math.min(100, Math.round((len50 / 50) * 100)), label: `${len50} / 50 words` };
      case 'lexicon_architect':
        const len250 = (gameSave.unlockedRanks || []).length;
        return { current: Math.min(250, len250), target: 250, pct: Math.min(100, Math.round((len250 / 250) * 100)), label: `${len250} / 250 words` };
      case 'lexicon_1000':
        const len1000 = (gameSave.unlockedRanks || []).length;
        return { current: Math.min(1000, len1000), target: 1000, pct: Math.min(100, Math.round((len1000 / 1000) * 100)), label: `${len1000} / 1000 words` };
      case 'tri_core_flow':
        const mb3 = extraContext.motorBucketsCount || 0;
        return { current: Math.min(3, mb3), target: 3, pct: Math.min(100, Math.round((mb3 / 3) * 100)), label: `${mb3} / 3 buckets` };
      case 'five_finger_pentathlon':
        const mb5 = extraContext.pentathlonBucketsCount || 0;
        return { current: Math.min(5, mb5), target: 5, pct: Math.min(100, Math.round((mb5 / 5) * 100)), label: `${mb5} / 5 buckets` };
      default:
        return { current: 0, target: 1, pct: 0, label: 'In Progress' };
    }
  }
}

if (typeof window !== 'undefined') {
  window.AchievementsModel = AchievementsModel;
  window.ACHIEVEMENTS = ACHIEVEMENTS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AchievementsModel, ACHIEVEMENTS };
}
