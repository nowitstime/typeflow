/**
 * TypeFlow - Persistent Storage Manager (localStorage)
 * Handles Classic Mode stats and Flow Game Mode progression, XP, Levels, Eggs, & SRS data.
 */

const STORAGE_KEYS = {
  CLASSIC_STATS: 'typeflow_classic_stats_v1',
  GAME_SAVE: 'typeflow_game_save_v2', // v2 for 1-word genesis, XP & Egg architecture
  ACTIVE_MODE: 'typeflow_active_mode'
};

const DEFAULT_CLASSIC_STATS = {
  personalBests: {
    15: { wpm: 0, acc: 0, date: null },
    30: { wpm: 0, acc: 0, date: null },
    60: { wpm: 0, acc: 0, date: null }
  },
  totalTests: 0,
  totalWords: 0,
  totalKeystrokes: 0,
  totalTimeSeconds: 0,
  recentHistory: [] // Last 15 tests
};

const DEFAULT_GAME_SAVE = {
  level: 1,
  currentXp: 0,
  targetWpm: 40, // Default target WPM goal
  unlockedRanks: [1], // Starts with literally 1 word: "the" (Rank 1)!
  eggBasket: [], // Array of unhatched eggs [{ id, rarity, wordRank, tierName, tierColor }]
  wordStats: {}, // Spaced Repetition stats: { [rank]: { timesSeen, errorCount, cleanHits, lastWpm } }
  lifetimeWords: 0,
  highStreak: 0
};

const StorageManager = {
  // Load classic stats
  getClassicStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSIC_STATS);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
      return Object.assign({}, DEFAULT_CLASSIC_STATS, JSON.parse(data));
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
    }
  },

  // Record a completed classic test
  recordClassicTest(duration, wpm, rawWpm, acc, consistency, keystrokes, wordsCount) {
    try {
      const stats = this.getClassicStats();
      stats.totalTests += 1;
      stats.totalKeystrokes += (keystrokes || 0);
      stats.totalWords += (wordsCount || 0);
      stats.totalTimeSeconds += (duration || 30);

      const durKey = duration.toString();
      if (!stats.personalBests[durKey] || wpm > stats.personalBests[durKey].wpm) {
        stats.personalBests[durKey] = {
          wpm,
          acc,
          date: new Date().toISOString()
        };
      }

      stats.recentHistory.unshift({
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        duration,
        wpm,
        rawWpm,
        acc,
        consistency
      });
      if (stats.recentHistory.length > 15) {
        stats.recentHistory.pop();
      }

      localStorage.setItem(STORAGE_KEYS.CLASSIC_STATS, JSON.stringify(stats));
      return stats;
    } catch (e) {
      console.error('Failed to save classic stats:', e);
      return null;
    }
  },

  // XP Required to advance from level L to L+1
  getXpForLevel(level) {
    return Math.round(100 * Math.pow(level, 1.35));
  },

  // Title corresponding to player Level
  getLevelTitle(level) {
    if (level >= 20) return 'Grandmaster of Keys';
    if (level >= 15) return 'Flow Master';
    if (level >= 10) return 'Velocity Adept';
    if (level >= 5)  return 'Rhythm Apprentice';
    return 'Novice Typist';
  },

  // Load game mode save
  getGameSave() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_SAVE);
      if (!data) {
        const fresh = JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
        this.saveGameSave(fresh);
        return fresh;
      }
      const parsed = JSON.parse(data);
      const state = Object.assign({}, DEFAULT_GAME_SAVE, parsed);
      // Ensure unlockedRanks at least has [1]
      if (!state.unlockedRanks || state.unlockedRanks.length === 0) {
        state.unlockedRanks = [1];
      }
      // Ensure egg nest does not exceed 3 slots
      if (state.eggBasket && state.eggBasket.length > 3) {
        state.eggBasket = state.eggBasket.slice(0, 3);
      }
      return state;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
    }
  },

  // Save game mode save
  saveGameSave(saveState) {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_SAVE, JSON.stringify(saveState));
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  },

  // Add XP and handle potential level-up
  addXp(amount) {
    const save = this.getGameSave();
    save.currentXp += amount;
    let leveledUp = false;
    let oldLevel = save.level;
    let bonusEggRarity = null;

    let req = this.getXpForLevel(save.level);
    while (save.currentXp >= req) {
      save.currentXp -= req;
      save.level += 1;
      leveledUp = true;
      req = this.getXpForLevel(save.level);

      // Level-up reward: determine bonus egg rarity
      if (save.level % 10 === 0) {
        bonusEggRarity = 'epic';
      } else if (save.level % 5 === 0) {
        bonusEggRarity = 'rare';
      } else {
        bonusEggRarity = 'uncommon';
      }
    }

    this.saveGameSave(save);
    return {
      leveledUp,
      oldLevel,
      newLevel: save.level,
      bonusEggRarity,
      currentXp: save.currentXp,
      nextLevelXp: req,
      title: this.getLevelTitle(save.level),
      save
    };
  },

  // Update target WPM
  setTargetWpm(wpm) {
    const save = this.getGameSave();
    save.targetWpm = wpm;
    this.saveGameSave(save);
    return save;
  },

  // Add an Egg to the nest (Hard limit of 3 slots)
  addEgg(egg) {
    const save = this.getGameSave();
    if (!save.eggBasket) save.eggBasket = [];
    if (save.eggBasket.length >= 3) {
      return { success: false, reason: 'Nest full', save };
    }
    save.eggBasket.push(egg);
    this.saveGameSave(save);
    return { success: true, save };
  },

  // Hatch an Egg: unlocks the word and removes the egg from basket
  hatchEgg(eggIndex = 0) {
    const save = this.getGameSave();
    if (!save.eggBasket || !save.eggBasket[eggIndex]) {
      return { success: false, reason: 'Egg not found' };
    }

    const egg = save.eggBasket.splice(eggIndex, 1)[0];
    if (!save.unlockedRanks.includes(egg.wordRank)) {
      save.unlockedRanks.push(egg.wordRank);
      save.unlockedRanks.sort((a, b) => a - b);
    }
    this.saveGameSave(save);
    return { success: true, egg, save };
  },

  // Update SRS memory for a word (3.1 Per-Word Persistent Telemetry)
  updateWordStat(rank, hasUnfixedError, hadBackspace = false, wordWpm = 0, targetWpm = 40) {
    const save = this.getGameSave();
    if (!save.wordStats) save.wordStats = {};
    if (!save.wordStats[rank]) {
      save.wordStats[rank] = {
        seen: 0,
        unfixedErr: 0,
        fixedErr: 0,
        avgWpm: wordWpm || targetWpm,
        streak: 0,
        timesSeen: 0,
        errorCount: 0,
        cleanHits: 0,
        lastWpm: wordWpm || targetWpm
      };
    }

    const st = save.wordStats[rank];
    st.seen = (st.seen ?? st.timesSeen ?? 0) + 1;
    st.timesSeen = st.seen;
    st.unfixedErr = st.unfixedErr ?? st.errorCount ?? 0;
    st.fixedErr = st.fixedErr ?? 0;
    st.streak = st.streak ?? st.cleanHits ?? 0;
    st.avgWpm = st.avgWpm ?? st.lastWpm ?? targetWpm;

    const wpm = wordWpm || 0;
    st.lastWpm = wpm;
    // Exponential moving average: avgWpm = (avgWpm * 0.7) + (wordWpm * 0.3)
    st.avgWpm = Math.round(((st.avgWpm * 0.7) + (wpm * 0.3)) * 10) / 10;

    if (hasUnfixedError) {
      st.unfixedErr += 1.0;
      st.streak = 0;
      st.cleanHits = 0;
    } else {
      if (hadBackspace) {
        st.fixedErr += 1.0;
        st.streak = 0;
        st.cleanHits = 0;
      } else if (wpm >= targetWpm) {
        st.streak += 1;
        st.cleanHits = st.streak;
        st.unfixedErr = Math.max(0.0, Math.round((st.unfixedErr - 0.25) * 100) / 100);
        st.fixedErr = Math.max(0.0, Math.round((st.fixedErr - 0.35) * 100) / 100);
      } else {
        st.streak = 0;
        st.cleanHits = 0;
      }
    }
    st.errorCount = Math.round(st.unfixedErr + st.fixedErr);

    save.lifetimeWords += 1;
    this.saveGameSave(save);
    return st;
  },

  // Get performance breakdown for all 5 Keybr motor buckets
  getBucketStats(saveState) {
    const save = saveState || this.getGameSave();
    const stats = {};
    const unlocked = save.unlockedRanks || [1];

    // Pre-populate all 5 buckets from MOTOR_BUCKETS so locked patterns are tracked
    if (typeof MOTOR_BUCKETS !== 'undefined') {
      Object.keys(MOTOR_BUCKETS).forEach(bId => {
        const mb = MOTOR_BUCKETS[bId];
        stats[bId] = {
          bucketId: bId,
          bucketName: mb.name,
          bucketTag: mb.tag,
          bucketColor: mb.color,
          description: mb.description,
          count: 0,
          totalHits: 0,
          totalWpm: 0,
          totalErrors: 0,
          isProficient: false,
          isDiscovered: false
        };
      });
    }

    unlocked.forEach(rank => {
      if (typeof getWordMetadata === 'function') {
        const meta = getWordMetadata(rank);
        if (!stats[meta.bucketId]) {
          stats[meta.bucketId] = {
            bucketId: meta.bucketId,
            bucketName: meta.bucketName,
            bucketTag: meta.bucketTag,
            bucketColor: meta.bucketColor,
            description: '',
            count: 0,
            totalHits: 0,
            totalWpm: 0,
            totalErrors: 0,
            isProficient: false,
            isDiscovered: false
          };
        }
        const b = stats[meta.bucketId];
        const st = (save.wordStats && save.wordStats[rank]) || {};
        b.count += 1;
        b.isDiscovered = true;
        b.totalHits += (st.streak ?? st.cleanHits ?? 0);
        b.totalWpm += (st.avgWpm ?? st.lastWpm ?? save.targetWpm ?? 40);
        b.totalErrors += ((st.unfixedErr || 0) + (st.fixedErr || 0)) || (st.errorCount || 0);
      }
    });

    Object.values(stats).forEach(b => {
      if (b.count > 0) {
        const avgHits = b.totalHits / b.count;
        const avgWpm = b.totalWpm / b.count;
        const avgErrors = b.totalErrors / b.count;
        b.avgHits = Math.round(avgHits * 10) / 10;
        b.avgWpm = Math.round(avgWpm);
        b.avgErrors = Math.round(avgErrors * 10) / 10;
        b.isProficient = (avgHits >= 3) && (avgWpm >= (save.targetWpm || 40)) && (avgErrors <= 1.0);
      } else {
        b.avgHits = 0;
        b.avgWpm = 0;
        b.avgErrors = 0;
        b.isProficient = false;
        b.isDiscovered = false;
      }
    });

    return stats;
  },

  // Reset game save (Ground Zero)
  resetGameSave() {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_SAVE);
      const fresh = JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
      this.saveGameSave(fresh);
      return fresh;
    } catch (e) {
      return DEFAULT_GAME_SAVE;
    }
  },

  // Reset classic stats & personal bests
  resetClassicStats() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CLASSIC_STATS);
      const fresh = JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
      localStorage.setItem(STORAGE_KEYS.CLASSIC_STATS, JSON.stringify(fresh));
      return fresh;
    } catch (e) {
      return DEFAULT_CLASSIC_STATS;
    }
  },

  // Active Mode ('flow' or 'classic')
  getActiveMode() {
    try {
      const mode = localStorage.getItem(STORAGE_KEYS.ACTIVE_MODE);
      return (mode === 'classic' || mode === 'flow') ? mode : 'flow';
    } catch (e) {
      return 'flow';
    }
  },

  setActiveMode(mode) {
    try {
      const clean = (mode === 'classic') ? 'classic' : 'flow';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MODE, clean);
      return clean;
    } catch (e) {
      return mode;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, STORAGE_KEYS, DEFAULT_GAME_SAVE };
}
