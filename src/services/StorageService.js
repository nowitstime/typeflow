/**
 * TypeFlow - StorageService
 * LocalStorage persistence service for Classic Mode stats and Flow Game Mode progression,
 * XP, Levels, Eggs, & SRS telemetry.
 */

const STORAGE_KEYS = {
  CLASSIC_STATS: 'typeflow_classic_stats_v1',
  GAME_SAVE:     'typeflow_game_save_v2',
  ACTIVE_MODE:   'typeflow_active_mode',
  HIDDEN_MODE:   'typeflow_hidden_mode',
  HIDDEN_METHOD: 'typeflow_hidden_method',
  HIDDEN_WORD_DIST: 'typeflow_hidden_word_dist',
  GHOST_CURSOR:  'typeflow_ghost_cursor',
  GHOST_SPEED:   'typeflow_ghost_speed'
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
  recentHistory: []
};

const DEFAULT_GAME_SAVE = {
  level: 1,
  currentXp: 0,
  targetWpm: 40,
  unlockedRanks: [1], // Starts with literally 1 word: "the" (Rank 1)!
  eggBasket: [],      // Array of unhatched eggs [{ id, rarity, wordRank, tierName, tierColor }]
  eggCharge: 0,       // Deterministic incubation progress (0-100)
  wordStats: {},      // SRS telemetry: { [rank]: { seen, unfixedErr, fixedErr, avgWpm, streak } }
  bigramLedger: {},   // Rolling EMA bigram mastery ledger: { [bg]: mastery }
  lifetimeWords: 0,
  highStreak: 0,
  hiddenMode: false,
  hiddenMethod: 'word',
  hiddenWordDistance: 1,
  ghostCursor: false,
  ghostSpeed: 50,
  achievements: {},
  achievementCounters: {
    tests60Wpm: 0,
    tests100Wpm: 0,
    tests98Acc: 0,
    tests100RawAcc: 0,
    tests85Consistency: 0,
    tests92Consistency: 0,
    testsHiddenMode: 0,
    eggsHatchedTotal: 0
  },
  equippedCosmetics: {
    theme: 'oled_cyan',
    flowFx: 'adaptive_resonance',
    caret: 'line',
    caretFx: 'rainbow_prism',
    ghostStyle: 'phantom_line',
    sound: 'clicky_blue'
  }
};

function safeGetLocalStorage() {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
      return window.localStorage;
    }
  } catch (e) {}
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch (e) {}
  return null;
}

class MemoryStorageFallback {
  constructor() {
    this._data = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : null;
  }
  setItem(key, val) {
    this._data[key] = String(val);
  }
  removeItem(key) {
    delete this._data[key];
  }
  clear() {
    this._data = {};
  }
}

class StorageService {
  constructor(storage = null) {
    this.storage = storage || safeGetLocalStorage() || new MemoryStorageFallback();
  }

  _getStorage() {
    return this.storage;
  }

  // Load classic stats
  getClassicStats() {
    try {
      const s = this._getStorage();
      const data = s ? s.getItem(STORAGE_KEYS.CLASSIC_STATS) : null;
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
      const defaultClone = JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
      return Object.assign(defaultClone, JSON.parse(data));
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
    }
  }

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

      const s = this._getStorage();
      if (s) {
        s.setItem(STORAGE_KEYS.CLASSIC_STATS, JSON.stringify(stats));
      }
      return stats;
    } catch (e) {
      console.error('[StorageService] Failed to save classic stats:', e);
      return null;
    }
  }

  saveClassicStats(stats) {
    try {
      const s = this._getStorage();
      if (s) {
        s.setItem(STORAGE_KEYS.CLASSIC_STATS, JSON.stringify(stats));
      }
      return true;
    } catch (e) {
      console.error('[StorageService] Failed to save classic stats:', e);
      return false;
    }
  }

  // XP Required to advance from level L to L+1
  getXpForLevel(level) {
    return Math.round(100 * Math.pow(level, 1.35));
  }

  // Title corresponding to player Level
  getLevelTitle(level) {
    if (level >= 20) return 'Grandmaster of Keys';
    if (level >= 15) return 'Flow Master';
    if (level >= 10) return 'Velocity Adept';
    if (level >= 5)  return 'Rhythm Apprentice';
    return 'Novice Typist';
  }

  // Load game mode save
  getGameSave() {
    try {
      const s = this._getStorage();
      const data = s ? s.getItem(STORAGE_KEYS.GAME_SAVE) : null;
      if (!data) {
        const fresh = JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
        this.saveGameSave(fresh);
        return fresh;
      }
      const parsed = JSON.parse(data);
      const defaultClone = JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
      const state = Object.assign(defaultClone, parsed);
      if (!state.unlockedRanks || state.unlockedRanks.length === 0) {
        state.unlockedRanks = [1];
      }
      if (state.eggBasket && state.eggBasket.length > 3) {
        state.eggBasket = state.eggBasket.slice(0, 3);
      }
      if (!state.bigramLedger || typeof state.bigramLedger !== 'object') {
        state.bigramLedger = {};
      }
      if (typeof state.hiddenMode !== 'boolean') {
        state.hiddenMode = false;
      }
      if (state.hiddenMethod !== 'char' && state.hiddenMethod !== 'word' && state.hiddenMethod !== 'combo') {
        state.hiddenMethod = 'word';
      } else if (state.hiddenMethod === 'combo') {
        state.hiddenMethod = 'char';
      }
      if (typeof state.hiddenWordDistance !== 'number' || isNaN(state.hiddenWordDistance) || state.hiddenWordDistance < 1 || state.hiddenWordDistance > 5) {
        state.hiddenWordDistance = 1;
      }
      if (typeof state.ghostCursor !== 'boolean') {
        state.ghostCursor = false;
      }
      if (typeof state.ghostSpeed !== 'number' || isNaN(state.ghostSpeed) || state.ghostSpeed <= 0) {
        state.ghostSpeed = 50;
      }
      const defaultCosmetics = {
        theme: 'oled_cyan',
        flowFx: 'adaptive_resonance',
        caret: 'line',
        caretFx: 'rainbow_prism',
        ghostStyle: 'phantom_line',
        sound: 'clicky_blue'
      };
      if (!state.equippedCosmetics || typeof state.equippedCosmetics !== 'object') {
        state.equippedCosmetics = Object.assign({}, defaultCosmetics);
      } else {
        state.equippedCosmetics = Object.assign({}, defaultCosmetics, state.equippedCosmetics);
      }
      return state;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
    }
  }

  // Save game mode save
  saveGameSave(saveState) {
    try {
      const s = this._getStorage();
      if (s) {
        s.setItem(STORAGE_KEYS.GAME_SAVE, JSON.stringify(saveState));
      }
      return true;
    } catch (e) {
      console.error('[StorageService] Failed to save game state:', e);
      return false;
    }
  }

  // Get Bigram Mastery Ledger
  getBigramLedger() {
    const save = this.getGameSave();
    return (save && save.bigramLedger) ? save.bigramLedger : {};
  }

  // Persist Bigram Mastery Ledger
  saveBigramLedger(ledgerData) {
    if (!ledgerData || typeof ledgerData !== 'object') return false;
    const save = this.getGameSave();
    save.bigramLedger = ledgerData;
    return this.saveGameSave(save);
  }

  // Update high streak if current streak exceeds personal record
  updateHighStreak(streak) {
    if (typeof streak !== 'number' || streak <= 0) return 0;
    try {
      const save = this.getGameSave();
      if (streak > (save.highStreak || 0)) {
        save.highStreak = streak;
        this.saveGameSave(save);
        return streak;
      }
      return save.highStreak || 0;
    } catch (e) {
      console.error('[StorageService] Failed to update high streak:', e);
      return 0;
    }
  }

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

      let stepRarity = 'uncommon';
      if (save.level % 10 === 0) {
        stepRarity = 'epic';
      } else if (save.level % 5 === 0) {
        stepRarity = 'rare';
      }

      const RARITY_WEIGHT = { uncommon: 1, rare: 2, epic: 3 };
      if (!bonusEggRarity || RARITY_WEIGHT[stepRarity] > RARITY_WEIGHT[bonusEggRarity]) {
        bonusEggRarity = stepRarity;
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
  }

  setTargetWpm(wpm) {
    const save = this.getGameSave();
    save.targetWpm = wpm;
    this.saveGameSave(save);
    return save;
  }

  updateEggCharge(charge) {
    const save = this.getGameSave();
    save.eggCharge = Math.max(0.0, Math.min(100.0, Number(charge) || 0));
    this.saveGameSave(save);
    return save;
  }

  // Add an Egg to the nest (Hard limit of 3 slots, strictly unique unowned words)
  addEgg(egg) {
    const save = this.getGameSave();
    if (!save.eggBasket) save.eggBasket = [];
    if (save.eggBasket.length >= 3) {
      return { success: false, reason: 'Nest full', save };
    }
    if (egg && typeof egg.wordRank === 'number') {
      if (save.unlockedRanks && save.unlockedRanks.includes(egg.wordRank)) {
        console.warn('[StorageService] Refusing to add already-unlocked egg:', egg.wordRank);
        return { success: false, reason: 'Word already unlocked', save };
      }
      if (save.eggBasket.some(e => e && e.wordRank === egg.wordRank)) {
        console.warn('[StorageService] Refusing duplicate egg in basket:', egg.wordRank);
        return { success: false, reason: 'Duplicate egg in basket', save };
      }
    }
    save.eggBasket.push(egg);
    this.saveGameSave(save);
    return { success: true, save };
  }

  // Hatch an Egg: unlocks the word and removes the egg from basket
  hatchEgg(eggIndexOrId = 0) {
    const save = this.getGameSave();
    if (!save.eggBasket || save.eggBasket.length === 0) {
      return { success: false, reason: 'Egg basket is empty' };
    }

    let eggIndex = -1;
    // 1. Match by egg.id if provided
    if (eggIndexOrId !== undefined && eggIndexOrId !== null) {
      const foundIdx = save.eggBasket.findIndex(e => e && e.id === eggIndexOrId);
      if (foundIdx !== -1) {
        eggIndex = foundIdx;
      }
    }

    // 2. Otherwise match by numeric array index if within bounds
    if (eggIndex === -1 && typeof eggIndexOrId === 'number') {
      eggIndex = Math.max(0, Math.min(save.eggBasket.length - 1, eggIndexOrId));
    } else if (eggIndex === -1) {
      eggIndex = 0;
    }

    const egg = save.eggBasket.splice(eggIndex, 1)[0];
    if (egg && typeof egg.wordRank === 'number') {
      if (!save.unlockedRanks.includes(egg.wordRank)) {
        save.unlockedRanks.push(egg.wordRank);
        save.unlockedRanks.sort((a, b) => a - b);
      }
    }
    this.saveGameSave(save);
    return { success: true, egg, save };
  }

  // Update SRS telemetry for a word
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
    return save;
  }

  // Performance breakdown for all 5 motor buckets
  getBucketStats(saveState) {
    const save = saveState || this.getGameSave();
    const stats = {};
    const unlocked = save.unlockedRanks || [1];

    const buckets = (typeof MOTOR_BUCKETS !== 'undefined')
      ? MOTOR_BUCKETS
      : (typeof window !== 'undefined' ? window.MOTOR_BUCKETS : null);

    if (buckets) {
      Object.keys(buckets).forEach(bId => {
        const mb = buckets[bId];
        stats[bId] = {
          bucketId: bId,
          bucketName: mb.name,
          bucketTag: mb.tag,
          bucketColor: mb.color,
          description: mb.description,
          count: 0,
          masteredWordsCount: 0,
          totalHits: 0,
          totalWpm: 0,
          totalErrors: 0,
          isProficient: false,
          isDiscovered: false
        };
      });
    }

    const metaLookup = (typeof getWordMetadata === 'function')
      ? getWordMetadata
      : (typeof window !== 'undefined' ? window.getWordMetadata : null);

    if (metaLookup) {
      unlocked.forEach(rank => {
        const meta = metaLookup(rank);
        if (meta && stats[meta.bucketId]) {
          const b = stats[meta.bucketId];
          const st = (save.wordStats && save.wordStats[rank]) || {};
          const hits = (st.streak ?? st.cleanHits ?? 0);
          b.count += 1;
          b.isDiscovered = true;
          if (hits >= 5) b.masteredWordsCount += 1;
          b.totalHits += hits;
          b.totalWpm += (st.avgWpm ?? st.lastWpm ?? save.targetWpm ?? 40);
          b.totalErrors += ((st.unfixedErr || 0) + (st.fixedErr || 0)) || (st.errorCount || 0);
        }
      });
    }

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
  }

  getMotorMasterySummary(saveState) {
    let motorBucketsCount = 0;
    let pentathlonBucketsCount = 0;
    let allFiveMastered = false;
    try {
      const bStats = this.getBucketStats(saveState);
      const bKeys = Object.keys(bStats);
      if (bKeys.length > 0) {
        for (const k of bKeys) {
          const b = bStats[k];
          if (b.isProficient || b.masteredWordsCount >= 1) {
            motorBucketsCount++;
          }
          if ((b.isProficient && b.count >= 3) || b.masteredWordsCount >= 3) {
            pentathlonBucketsCount++;
          }
        }
        allFiveMastered = (bKeys.length >= 5 && pentathlonBucketsCount >= 5);
      }
    } catch (e) {}
    return { motorBucketsCount, pentathlonBucketsCount, allFiveMastered };
  }

  resetGameSave(resetAchievements = false) {
    try {
      const prev = this.getGameSave();
      const s = this._getStorage();
      if (s) s.removeItem(STORAGE_KEYS.GAME_SAVE);
      const fresh = JSON.parse(JSON.stringify(DEFAULT_GAME_SAVE));
      if (!resetAchievements && prev) {
        if (prev.achievements) fresh.achievements = prev.achievements;
        if (prev.achievementCounters) fresh.achievementCounters = prev.achievementCounters;
        if (prev.achievementRetroSynced) fresh.achievementRetroSynced = prev.achievementRetroSynced;
        if (prev.equippedCosmetics) fresh.equippedCosmetics = prev.equippedCosmetics;
      }
      this.saveGameSave(fresh);
      return fresh;
    } catch (e) {
      return DEFAULT_GAME_SAVE;
    }
  }

  resetClassicStats() {
    try {
      const s = this._getStorage();
      if (s) s.removeItem(STORAGE_KEYS.CLASSIC_STATS);
      const fresh = JSON.parse(JSON.stringify(DEFAULT_CLASSIC_STATS));
      if (s) s.setItem(STORAGE_KEYS.CLASSIC_STATS, JSON.stringify(fresh));
      return fresh;
    } catch (e) {
      return DEFAULT_CLASSIC_STATS;
    }
  }

  getActiveMode() {
    try {
      const s = this._getStorage();
      const mode = s ? s.getItem(STORAGE_KEYS.ACTIVE_MODE) : 'flow';
      return (mode === 'classic' || mode === 'flow') ? mode : 'flow';
    } catch (e) {
      return 'flow';
    }
  }

  setActiveMode(mode) {
    try {
      const clean = (mode === 'classic') ? 'classic' : 'flow';
      const s = this._getStorage();
      if (s) s.setItem(STORAGE_KEYS.ACTIVE_MODE, clean);
      return clean;
    } catch (e) {
      return mode;
    }
  }

  getHiddenMode() {
    try {
      const s = this._getStorage();
      if (s) {
        const val = s.getItem(STORAGE_KEYS.HIDDEN_MODE);
        if (val !== null) return val === 'true';
      }
      const save = this.getGameSave();
      return !!save.hiddenMode;
    } catch (e) {
      return false;
    }
  }

  setHiddenMode(enabled) {
    const val = !!enabled;
    try {
      const s = this._getStorage();
      if (s) s.setItem(STORAGE_KEYS.HIDDEN_MODE, String(val));
      const save = this.getGameSave();
      save.hiddenMode = val;
      this.saveGameSave(save);
      return val;
    } catch (e) {
      return val;
    }
  }

  getHiddenMethod() {
    try {
      const s = this._getStorage();
      if (s) {
        const val = s.getItem(STORAGE_KEYS.HIDDEN_METHOD);
        if (val === 'char' || val === 'word') return val;
        if (val === 'combo') return 'char';
      }
      const save = this.getGameSave();
      return (save.hiddenMethod === 'char') ? 'char' : 'word';
    } catch (e) {
      return 'word';
    }
  }

  setHiddenMethod(val) {
    const method = (val === 'char' || val === 'combo') ? 'char' : 'word';
    try {
      const s = this._getStorage();
      if (s) s.setItem(STORAGE_KEYS.HIDDEN_METHOD, method);
      const save = this.getGameSave();
      save.hiddenMethod = method;
      this.saveGameSave(save);
      return method;
    } catch (e) {
      return method;
    }
  }

  getHiddenWordDistance() {
    try {
      const s = this._getStorage();
      if (s) {
        const val = parseInt(s.getItem(STORAGE_KEYS.HIDDEN_WORD_DIST), 10);
        if (!isNaN(val) && val >= 1 && val <= 6) return val;
      }
      const save = this.getGameSave();
      const dist = parseInt(save.hiddenWordDistance, 10);
      return (!isNaN(dist) && dist >= 1 && dist <= 6) ? dist : 1;
    } catch (e) {
      return 1;
    }
  }

  setHiddenWordDistance(val) {
    const parsed = parseInt(val, 10);
    const dist = isNaN(parsed) ? 1 : Math.max(1, Math.min(6, parsed));
    try {
      const s = this._getStorage();
      if (s) s.setItem(STORAGE_KEYS.HIDDEN_WORD_DIST, String(dist));
      const save = this.getGameSave();
      save.hiddenWordDistance = dist;
      this.saveGameSave(save);
      return dist;
    } catch (e) {
      return dist;
    }
  }

  getGhostCursor() {
    try {
      const s = this._getStorage();
      if (s) {
        const val = s.getItem(STORAGE_KEYS.GHOST_CURSOR);
        if (val !== null) return val === 'true';
      }
      const save = this.getGameSave();
      return !!save.ghostCursor;
    } catch (e) {
      return false;
    }
  }

  setGhostCursor(enabled) {
    const val = !!enabled;
    try {
      const s = this._getStorage();
      if (s) s.setItem(STORAGE_KEYS.GHOST_CURSOR, String(val));
      const save = this.getGameSave();
      save.ghostCursor = val;
      this.saveGameSave(save);
      return val;
    } catch (e) {
      return val;
    }
  }

  getGhostSpeed() {
    try {
      const s = this._getStorage();
      if (s) {
        const val = s.getItem(STORAGE_KEYS.GHOST_SPEED);
        if (val !== null) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num > 0) return num;
        }
      }
      const save = this.getGameSave();
      return (typeof save.ghostSpeed === 'number' && save.ghostSpeed > 0) ? save.ghostSpeed : 50;
    } catch (e) {
      return 50;
    }
  }

  setGhostSpeed(speed) {
    const num = Math.max(15, Math.min(150, parseInt(speed, 10) || 50));
    try {
      const s = this._getStorage();
      if (s) s.setItem(STORAGE_KEYS.GHOST_SPEED, String(num));
      const save = this.getGameSave();
      save.ghostSpeed = num;
      this.saveGameSave(save);
      return num;
    } catch (e) {
      return num;
    }
  }

  // --- Achievement System Persistence ---
  getAchievements() {
    const save = this.getGameSave();
    return (save && typeof save.achievements === 'object' && save.achievements !== null)
      ? Object.assign({}, save.achievements)
      : {};
  }

  unlockAchievement(id, timestamp = Date.now()) {
    if (!id) return false;
    const save = this.getGameSave();
    if (!save.achievements) save.achievements = {};
    if (!save.achievements[id]) {
      save.achievements[id] = timestamp;
      this.saveGameSave(save);
      return true;
    }
    return false;
  }

  getAchievementCounters() {
    const save = this.getGameSave();
    const defaults = {
      tests60Wpm: 0,
      tests100Wpm: 0,
      tests98Acc: 0,
      tests100RawAcc: 0,
      tests85Consistency: 0,
      tests92Consistency: 0,
      testsHiddenMode: 0,
      eggsHatchedTotal: 0
    };
    return Object.assign({}, defaults, save.achievementCounters || {});
  }

  updateAchievementCounters(updaterFn) {
    const save = this.getGameSave();
    if (!save.achievementCounters) {
      save.achievementCounters = {
        tests60Wpm: 0,
        tests100Wpm: 0,
        tests98Acc: 0,
        tests100RawAcc: 0,
        tests85Consistency: 0,
        tests92Consistency: 0,
        testsHiddenMode: 0,
        eggsHatchedTotal: 0
      };
    }
    if (typeof updaterFn === 'function') {
      updaterFn(save.achievementCounters);
    }
    this.saveGameSave(save);
    return Object.assign({}, save.achievementCounters);
  }

  syncRetroactiveAchievements(achievementsModel) {
    if (!achievementsModel) return [];
    const save = this.getGameSave();
    const classicStats = this.getClassicStats();
    const counters = this.getAchievementCounters();

    // Populate counters from recentHistory & unlockedRanks at most once per save
    if (!save.achievementRetroSynced) {
      let modified = false;
      if (Array.isArray(classicStats.recentHistory) && classicStats.recentHistory.length > 0) {
        for (const t of classicStats.recentHistory) {
          if (t.duration >= 30) {
            const acc = t.accuracy ?? t.acc ?? 0;
            if (t.wpm >= 60 && acc >= 96) counters.tests60Wpm++;
            if (t.wpm >= 100 && acc >= 96) counters.tests100Wpm++;
            if (acc >= 98) counters.tests98Acc++;
            if (typeof t.incorrectChars === 'number' && t.incorrectChars === 0 && (!t.fixedErrors || t.fixedErrors === 0)) {
              counters.tests100RawAcc++;
            }
            if (t.wpm >= 50 && t.consistency >= 85) counters.tests85Consistency++;
            if (t.wpm >= 70 && t.consistency >= 92) counters.tests92Consistency++;
            modified = true;
          }
        }
      }

      const unlockedLen = Array.isArray(save.unlockedRanks) ? save.unlockedRanks.length : 1;
      if ((counters.eggsHatchedTotal || 0) < unlockedLen - 1) {
        counters.eggsHatchedTotal = unlockedLen - 1;
        modified = true;
      }

      save.achievementRetroSynced = true;
      if (!save.achievementCounters) save.achievementCounters = {};
      Object.assign(save.achievementCounters, counters);
      this.saveGameSave(save);
    }

    const { motorBucketsCount, pentathlonBucketsCount, allFiveMastered } = this.getMotorMasterySummary(save);

    const newlyUnlocked = achievementsModel.evaluate('sync', {
      gameSave: save,
      classicStats,
      counters,
      motorBucketsCount,
      pentathlonBucketsCount,
      allFiveMastered
    });

    for (const ach of newlyUnlocked) {
      this.unlockAchievement(ach.id, ach.unlockedAt);
    }
    return newlyUnlocked;
  }

  getEquippedCosmetics() {
    const save = this.getGameSave();
    return Object.assign(
      {
        theme: 'oled_cyan',
        flowFx: 'adaptive_resonance',
        caret: 'line',
        caretFx: 'rainbow_prism',
        ghostStyle: 'phantom_line',
        sound: 'clicky_blue'
      },
      save.equippedCosmetics || {}
    );
  }

  setEquippedCosmetic(category, id) {
    if (!category || !id) return this.getEquippedCosmetics();
    const save = this.getGameSave();
    if (!save.equippedCosmetics || typeof save.equippedCosmetics !== 'object') {
      save.equippedCosmetics = {
        theme: 'oled_cyan',
        flowFx: 'adaptive_resonance',
        caret: 'line',
        caretFx: 'rainbow_prism',
        ghostStyle: 'phantom_line',
        sound: 'clicky_blue'
      };
    }
    save.equippedCosmetics[category] = id;
    this.saveGameSave(save);
    return Object.assign({}, save.equippedCosmetics);
  }
}

// Default singleton instance and backwards-compatible StorageManager alias
const storageService = new StorageService();
const StorageManager = storageService;

if (typeof window !== 'undefined') {
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.DEFAULT_CLASSIC_STATS = DEFAULT_CLASSIC_STATS;
  window.DEFAULT_GAME_SAVE = DEFAULT_GAME_SAVE;
  window.StorageService = StorageService;
  window.storageService = storageService;
  window.StorageManager = StorageManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEYS,
    DEFAULT_CLASSIC_STATS,
    DEFAULT_GAME_SAVE,
    StorageService,
    storageService,
    StorageManager
  };
}
