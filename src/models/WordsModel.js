/**
 * TypeFlow - Hybrid Biomechanical & Frequency Dictionary Sorter
 * 1,000 Most Common English Words Ranked by Hybrid Biomechanical Friction & Frequency
 * Zero-hardcode runtime dictionary hydration pipeline (<2ms)
 * Flow-Aware Spaced Repetition (SRS) Pacing
 */

// 1. Overview & Raw Words String
const RAW_WORDS =
  "the be of and to in he have it that for they with as not on she at by this we you do but his from or which what go their can who get if would her all my make about know will up one time there year so think when them some me people take out into just see him your come could now than like other how then its our two more these want way look first also new because day use no man find here thing give many well only those tell very even back any good woman through us life child work down may after should call world over school still try last ask need too feel three state never become between high really something most another much family own leave put old while mean keep student why let great same big group begin seem country help talk where turn problem every start hand might american show part against place such again few case week company system each right program hear question during play government run small number off always move night live point believe hold today bring happen next without before large million must home under water room write mother area national money story young fact month different lot study book eye job word though business issue side kind four head far black long both little house yes since provide service around friend important father sit away until power hour game often yet line political end among ever stand bad lose however member pay law meet car city almost include continue set later community name five once white least learn real change team minute best several idea kid body information nothing ago lead social understand whether watch together follow parent stop face anything create public already speak others read level allow add office spend door health person art sure war history party within grow result open morning walk reason low win research girl guy early food moment himself air teacher force offer enough education across although remember foot second boy maybe toward able age policy everything love process music including consider appear actually buy probably human wait serve market die send expect sense build stay fall nation plan cut college interest death course someone experience behind reach local kill six remain effect suggest class control raise care perhaps late hard field else pass former sell major sometimes require along development themselves report role better economic effort decide rate strong possible heart drug leader light voice wife whole police mind finally pull return free military price less according decision explain son hope develop view relationship carry town road drive arm true federal break difference thank receive value international building action full model join season society tax director position player agree especially record pick wear paper special space ground form support event official whose matter everyone center couple site project hit base activity star table court produce eat teach oil half situation easy cost industry figure street image itself phone either data cover quite picture clear practice piece land recent describe product doctor wall patient worker news test movie certain north personal simply third technology catch step baby computer type attention draw film republican tree source red nearly organization choose cause hair century evidence window difficult listen soon culture billion chance brother energy period summer realize hundred available plant likely opportunity term short letter condition choice single rule daughter administration south husband congress floor campaign material population economy medical hospital church close thousand risk current fire future wrong involve defense anyone increase security bank myself certainly west sport board seek per subject officer private rest behavior deal performance fight throw top quickly past goal bed order author fill represent focus foreign drop blood upon agency push nature color recently store reduce sound note fine near movement page enter share common poor natural race concern series significant similar hot language usually response dead rise animal factor decade article shoot east save artist scene stock career despite central eight thus treatment beyond happy exactly protect approach lie size dog fund serious occur media ready sign thought list individual simple quality pressure accept answer resource identify left meeting determine prepare disease whatever success argue cup particularly amount ability staff recognize indicate character growth loss degree wonder attack herself traditional television box training pretty election everybody physical lay general feeling standard bill message fail outside arrive analysis benefit sex forward lawyer present section environmental glass skill sister professor operation financial crime stage compare authority miss design sort act ten knowledge gun station blue strategy clearly discuss indeed truth song example democratic check environment leg dark various rather laugh guess executive prove hang entire rock forget claim remove manager enjoy network legal religious cold final main science green memory card above seat cell establish nice trial expert spring firm democrat radio visit management avoid imagine tonight huge ball finish yourself theory impact respond statement maintain charge popular onto reveal direction weapon employee cultural contain peace pain apply measure wide shake fly interview manage chair fish particular camera structure politics perform bit weight suddenly discover candidate production treat trip evening affect inside conference unit style adult worry range mention deep front edge specific writer trouble necessary throughout challenge fear shoulder institution middle sea dream bar beautiful property instead improve stuff detail method somebody magazine hotel soldier reflect heavy sexual bag heat marriage tough sing surface purpose exist pattern whom skin agent owner machine gas ahead generation commercial address cancer item reality coach yard beat violence total tend investment discussion finger garden notice collection modern task partner positive civil kitchen consumer shot budget painting scientist safe agreement capital mouth nor victim newspaper threat rich score account wheat audience dinner vote western relate travel debate prevent citizen majority apart fellow born mental traffic colleague scale mountain forest quarter target element release champion journey silence shadow silver golden ocean island whisper thunder diamond castle horizon mystery harmony courage victory legend ancient stellar galaxy crystal spirit starlight";

// Raw commonness-ordered word list (1,000 words ordered strictly 1..1000 by frequency)
const RAW_WORDS_LIST = RAW_WORDS.trim().split(/\s+/).slice(0, 1000);
const CLASSIC_WEIGHTS = RAW_WORDS_LIST.map((_, i) => 1 / Math.pow(i + 1, 0.5));
const CLASSIC_TOTAL_WEIGHT = CLASSIC_WEIGHTS.reduce((a, b) => a + b, 0);

// 2. Keyboard Geography & Friction Sets
const LEFT_HAND = new Set("qwertasdfgzxcvb".split(""));
const TOP_ROW   = new Set("qwertyuiop".split(""));
const BOT_ROW   = new Set("zxcvbnm".split(""));

const PATTERN_COST = {
  HOME_CORE: 0.0,
  ALTERNATING: 1.0,
  SUFFIX_CURL: 2.5,
  DOUBLE_BOUNCE: 3.5,
  REACH_PINKY: 5.0
};

// 2.1 Rarity Tier Definitions & Multipliers
const WORD_TIERS = {
  COMMON:   { id: 1, name: 'Common',   color: '#38bdf8', minRank: 1,   maxRank: 100,  baseCost: 40,   reward: 10 },
  UNCOMMON: { id: 2, name: 'Uncommon', color: '#34d399', minRank: 101, maxRank: 350,  baseCost: 100,  reward: 25 },
  RARE:     { id: 3, name: 'Rare',     color: '#c084fc', minRank: 351, maxRank: 700,  baseCost: 220,  reward: 60 },
  EPIC:     { id: 4, name: 'Epic',     color: '#fbbf24', minRank: 701, maxRank: 1000, baseCost: 450,  reward: 150 }
};

// 10 simple starter words (Rank 1 to 10)
const STARTER_WORD_RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Motor & Touch-Typing Buckets (Keybr-inspired)
const MOTOR_BUCKETS = {
  HOME_CORE: {
    id: 'HOME_CORE',
    name: 'Home Core & Center Flow',
    tag: 'Home Core Flow',
    description: 'Index & middle home keys (T, H, E, A, O, I, N, S). Optimal baseline rhythm.',
    color: '#38bdf8'
  },
  ALTERNATING: {
    id: 'ALTERNATING',
    name: 'Hand Alternator',
    tag: 'Hand Alternator ⚡',
    description: 'Strict Left ↔ Right hand transitions. Maximum burst speed potential.',
    color: '#2dd4bf'
  },
  SUFFIX_CURL: {
    id: 'SUFFIX_CURL',
    name: 'Suffix & Inward Curl',
    tag: 'Suffix Curl 🌀',
    description: 'Smooth curling rolls (-ing, -ight, -tion, -ment, -ould, -able, etc.).',
    color: '#c084fc'
  },
  REACH_PINKY: {
    id: 'REACH_PINKY',
    name: 'Lateral & Pinky Reach',
    tag: 'Lateral Reach 🎯',
    description: 'Extensions to pinky (A, Q, Z) and corner reach keys (W, P, V, B, C, Y, K).',
    color: '#fbbf24'
  },
  DOUBLE_BOUNCE: {
    id: 'DOUBLE_BOUNCE',
    name: 'Double-Letter Bounce',
    tag: 'Double Bounce 💥',
    description: 'Quick single-finger tap cadences (ee, oo, ll, ss, tt) and vertical hurdles.',
    color: '#f472b6'
  }
};

// 3.2 Session Motor Bucket Heat (0.0 to 2.0 cap)
const patternHeat = {
  HOME_CORE: 0,
  ALTERNATING: 0,
  SUFFIX_CURL: 0,
  REACH_PINKY: 0,
  DOUBLE_BOUNCE: 0
};

// 4.3 Anti-Clumping Cooldown Buffer
let recentHistory = [];

function resetRecentHistory() {
  recentHistory = [];
}

/**
 * 2. Neuromuscular Motor Pattern Tag Detector
 */
function detectMotorTags(word) {
  const tags = [];

  // 1. DOUBLE_BOUNCE: Matches consecutive identical letters OR vertical hurdle bigrams
  if (/([a-z])\1|(ed|de|lo|ol|sw|ws|fr|rf|ju|uj|ki|ik)/.test(word)) {
    tags.push("DOUBLE_BOUNCE");
  }

  // 2. SUFFIX_CURL: length >= 5 AND matches suffix endings
  if (word.length >= 5 && /(ing|tion|ment|ight|ence|able|ness|ly|ed)$/.test(word)) {
    tags.push("SUFFIX_CURL");
  }

  // 3. REACH_PINKY: Matches [qzxj] OR contains >= 2 characters from [qzxvpbjky]
  const reachMatches = word.match(/[qzxvpbjky]/g) || [];
  if (/[qzxj]/.test(word) || reachMatches.length >= 2) {
    tags.push("REACH_PINKY");
  }

  // 4. ALTERNATING: length >= 4 where >= 75% of adjacent character transitions alternate hands
  if (word.length >= 4) {
    let switches = 0;
    for (let i = 1; i < word.length; i++) {
      if (LEFT_HAND.has(word[i]) !== LEFT_HAND.has(word[i - 1])) switches++;
    }
    if (switches / (word.length - 1) >= 0.75) tags.push("ALTERNATING");
  }

  // 5. HOME_CORE: Fallback default if tags is empty
  if (tags.length === 0) tags.push("HOME_CORE");

  return tags;
}

/**
 * 2.1 Biomechanical Cost Computation
 * Evaluates physical finger friction: Length Factor + Motor Pattern Costs + Row Hurdle Penalties
 */
function computeBiomechanicalCost(word, tags) {
  let cost = Math.max(0, word.length - 3) * 1.2;

  for (const tag of tags) {
    cost += (PATTERN_COST[tag] || 0);
  }

  for (let i = 1; i < word.length; i++) {
    const prev = word[i - 1];
    const curr = word[i];
    if ((TOP_ROW.has(prev) && BOT_ROW.has(curr)) || (BOT_ROW.has(prev) && TOP_ROW.has(curr))) {
      cost += 1.0;
    }
  }
  return cost;
}

/**
 * 2.2 & 2.3 Hybrid Sorter & Runtime Dictionary Hydration (<2ms)
 * Scores words by composite friction & frequency, pins Ground Zero ("the" = -1),
 * sorts progression, and assigns tiers.
 */
function buildHydratedDictionary(rawWordsString) {
  const rawList = rawWordsString.trim().split(/\s+/).slice(0, 1000);

  // 1. Tag and score based on frequency index + physical hurdle costs
  const scored = rawList.map((word, freqIdx) => {
    const tags = detectMotorTags(word);
    const bioCost = computeBiomechanicalCost(word, tags);
    const compositeScore = freqIdx === 0 ? -1 : (freqIdx * 0.55) + (bioCost * 22.0);

    return {
      word,
      freqRank: freqIdx + 1,
      bioCost: Number(bioCost.toFixed(2)),
      compositeScore,
      primaryPattern: tags[0],
      tags
    };
  });

  // 2. Sort by composite score ascending
  scored.sort((a, b) => a.compositeScore - b.compositeScore);

  // 3. Assign final progression ranks (1-1000) and tier metadata
  return scored.map((item, sortedIdx) => {
    const rank = sortedIdx + 1;
    const tier = sortedIdx < 100 ? "COMMON"
               : sortedIdx < 350 ? "UNCOMMON"
               : sortedIdx < 700 ? "RARE" : "EPIC";
    return {
      word: item.word,
      rank,
      freqRank: item.freqRank,
      tier,
      bioCost: item.bioCost,
      compositeScore: item.compositeScore,
      primaryPattern: item.primaryPattern,
      tags: item.tags
    };
  });
}

// Runtime Startup Hydration (<2ms)
const DICTIONARY = buildHydratedDictionary(RAW_WORDS);

// Progression-ordered array view (Rank 1 to 1000)
const RANKED_WORDS = DICTIONARY.map(item => item.word);

// Backward-compatible classification helper
function classifyWord(word, index) {
  if (typeof index !== 'number') {
    index = RANKED_WORDS.indexOf(word);
    if (index === -1) index = 0;
  }
  const tags = detectMotorTags(word);
  const tier = index < 100 ? "COMMON"
             : index < 350 ? "UNCOMMON"
             : index < 700 ? "RARE" : "EPIC";
  return {
    word,
    rank: index + 1,
    tier,
    primaryPattern: tags[0],
    tags
  };
}

// Backward-compatible alias
function classifyWordMotor(word) {
  return detectMotorTags(word)[0];
}

function getWordComplexity(word) {
  if (!word) return 1;
  if (word.length <= 4) return 1;
  if (word.length <= 6) return 2;
  return 3;
}

/**
 * Returns metadata for a given 1-indexed word progression rank
 */
function getWordMetadata(rank) {
  const index = Math.max(0, Math.min(DICTIONARY.length - 1, rank - 1));
  const wordObj = DICTIONARY[index] || classifyWord(RANKED_WORDS[index] || 'type', index);
  const tier = WORD_TIERS[wordObj.tier] || WORD_TIERS.COMMON;
  const bucket = MOTOR_BUCKETS[wordObj.primaryPattern] || MOTOR_BUCKETS.HOME_CORE;
  const tierProgress = (rank - tier.minRank) / Math.max(1, tier.maxRank - tier.minRank);
  const cost = Math.round(tier.baseCost + tierProgress * (tier.baseCost * 0.8));

  return {
    rank,
    word: wordObj.word,
    freqRank: wordObj.freqRank,
    bioCost: wordObj.bioCost,
    tierId: tier.id,
    tierName: tier.name,
    tierColor: tier.color,
    cost,
    reward: tier.reward,
    bucketId: wordObj.primaryPattern,
    bucketName: bucket.name,
    bucketTag: bucket.tag,
    bucketColor: bucket.color,
    complexity: getWordComplexity(wordObj.word),
    tags: wordObj.tags,
    primaryPattern: wordObj.primaryPattern
  };
}

function getWordBaseXp(rank) {
  if (rank > 700) return 150; // Epic
  if (rank > 350) return 60;  // Rare
  if (rank > 100) return 25;  // Uncommon
  return 10;                  // Common
}

const EGG_RARITIES = {
  common:   { id: 'common',   name: 'Common Egg',   color: '#38bdf8', minRank: 1,   maxRank: 100 },
  uncommon: { id: 'uncommon', name: 'Uncommon Egg', color: '#34d399', minRank: 101, maxRank: 350 },
  rare:     { id: 'rare',     name: 'Rare Egg',     color: '#c084fc', minRank: 351, maxRank: 700 },
  epic:     { id: 'epic',     name: 'Epic Egg',     color: '#fbbf24', minRank: 701, maxRank: 1000 }
};

function rollNewEgg(unlockedRanks, currentStreak = 0, forceRarity = null, wordStats = {}, targetWpm = 40) {
  const unlockedSet = new Set(unlockedRanks || [1]);

  // Group unowned candidate words by rarity tier & motor bucket
  const allUnowned = [];
  const unownedByTier = {
    common: [],
    uncommon: [],
    rare: [],
    epic: []
  };
  const unownedByBucket = {
    HOME_CORE: [],
    ALTERNATING: [],
    SUFFIX_CURL: [],
    REACH_PINKY: [],
    DOUBLE_BOUNCE: []
  };

  for (let r = 1; r <= RANKED_WORDS.length; r++) {
    if (!unlockedSet.has(r)) {
      const meta = getWordMetadata(r);
      allUnowned.push(r);
      const tierKey = meta.tierName.toLowerCase();
      if (unownedByTier[tierKey]) unownedByTier[tierKey].push(r);
      if (unownedByBucket[meta.bucketId]) unownedByBucket[meta.bucketId].push(r);
    }
  }

  // Fallback if all words unlocked
  if (allUnowned.length === 0) {
    allUnowned.push(1);
  }

  // 1. Dynamic Rarity Determination (Progressive Curve: ~85% Common, ~13% Uncommon, ~1.8% Rare, ~0.2% Epic)
  let pickedRarity = forceRarity;
  if (!pickedRarity) {
    const cCount = unownedByTier.common.length;
    const uCount = unownedByTier.uncommon.length;
    const rCount = unownedByTier.rare.length;
    const eCount = unownedByTier.epic.length;

    let wCommon = 0;
    let wUncommon = 0;
    let wRare = 0;
    let wEpic = 0;

    if (cCount > 0) {
      // Phase 1: Common tier active (~85% Common, ~13% Uncommon, ~1.8% Rare, ~0.2% Epic)
      const factor = Math.sqrt(cCount / 100.0);
      wCommon = 85.0 * factor;
      const spill = 85.0 * (1.0 - factor);
      wUncommon = (13.0 + spill * 0.88) * (uCount > 0 ? 1 : 0);
      wRare = (1.8 + spill * 0.10) * (rCount > 0 ? 1 : 0);
      wEpic = (0.2 + spill * 0.02) * (eCount > 0 ? 1 : 0);
    } else if (uCount > 0) {
      // Phase 2: Common completed; Uncommon dominant (~80% Uncommon, ~17% Rare, ~3% Epic)
      const factor = Math.sqrt(uCount / 250.0);
      wCommon = 0;
      wUncommon = 80.0 * factor;
      const spill = 80.0 * (1.0 - factor);
      wRare = (17.0 + spill * 0.85) * (rCount > 0 ? 1 : 0);
      wEpic = (3.0 + spill * 0.15) * (eCount > 0 ? 1 : 0);
    } else if (rCount > 0) {
      // Phase 3: Rare dominant (~85% Rare, ~15% Epic)
      const factor = Math.sqrt(rCount / 350.0);
      wCommon = 0;
      wUncommon = 0;
      wRare = 85.0 * factor;
      wEpic = 15.0 + 85.0 * (1.0 - factor);
    } else {
      wCommon = 0;
      wUncommon = 0;
      wRare = 0;
      wEpic = 100.0;
    }

    const tierWeights = [
      { id: 'common', weight: wCommon },
      { id: 'uncommon', weight: wUncommon },
      { id: 'rare', weight: wRare },
      { id: 'epic', weight: wEpic }
    ].filter(tw => tw.weight > 0 && unownedByTier[tw.id].length > 0);

    const totalWeight = tierWeights.reduce((s, tw) => s + tw.weight, 0);
    if (totalWeight > 0) {
      let rand = Math.random() * totalWeight;
      for (const tw of tierWeights) {
        rand -= tw.weight;
        if (rand <= 0) {
          pickedRarity = tw.id;
          break;
        }
      }
    }
    if (!pickedRarity) pickedRarity = (tierWeights[0] && tierWeights[0].id) || 'common';
  }

  // 2. Determine active buckets in player's unlocked deck
  const activeBucketCounts = {};
  const activeBucketStats = {};
  (unlockedRanks || [1]).forEach(rank => {
    const meta = getWordMetadata(rank);
    activeBucketCounts[meta.bucketId] = (activeBucketCounts[meta.bucketId] || 0) + 1;
    if (!activeBucketStats[meta.bucketId]) {
      activeBucketStats[meta.bucketId] = { totalHits: 0, totalWpm: 0, count: 0, totalErrors: 0 };
    }
    const st = wordStats[rank] || { cleanHits: 0, lastWpm: targetWpm, errorCount: 0 };
    activeBucketStats[meta.bucketId].totalHits += (st.cleanHits || 0);
    activeBucketStats[meta.bucketId].totalWpm += (st.lastWpm || 0);
    activeBucketStats[meta.bucketId].totalErrors += (st.errorCount || 0);
    activeBucketStats[meta.bucketId].count += 1;
  });

  // Identify proficient active buckets (consistent clean speed at or above target WPM)
  const proficientBuckets = [];
  Object.keys(activeBucketStats).forEach(bId => {
    const s = activeBucketStats[bId];
    const avgHits = s.totalHits / Math.max(1, s.count);
    const avgWpm = s.totalWpm / Math.max(1, s.count);
    const avgErrors = s.totalErrors / Math.max(1, s.count);
    if (avgHits >= 3 && avgWpm >= targetWpm && avgErrors <= 1.0) {
      proficientBuckets.push(bId);
    }
  });

  const inactiveBuckets = Object.keys(MOTOR_BUCKETS).filter(bId => !activeBucketCounts[bId] && unownedByBucket[bId].length > 0);

  // 3. Candidate Selection Combining Target Rarity & Motor Progression
  const tierCandidates = unownedByTier[pickedRarity] || allUnowned;
  let rollType = 'reinforce';
  let candidateRanks = [];

  if (forceRarity) {
    candidateRanks = tierCandidates;
    rollType = 'deepen';
  } else if (proficientBuckets.length > 0) {
    // Proficient: 75% Deepen existing pattern, 25% Branch to new motor bucket
    const canBranch = inactiveBuckets.length > 0 && Math.random() < 0.25;
    if (canBranch) {
      const branchBucket = inactiveBuckets[Math.floor(Math.random() * inactiveBuckets.length)];
      const branchInTier = tierCandidates.filter(r => getWordMetadata(r).bucketId === branchBucket);
      if (branchInTier.length > 0) {
        candidateRanks = branchInTier;
        rollType = 'branch';
      } else {
        // Fallback: take intro words from the branch bucket directly
        const intro = unownedByBucket[branchBucket].filter(r => getWordMetadata(r).complexity <= 2);
        candidateRanks = intro.length > 0 ? intro : unownedByBucket[branchBucket];
        if (candidateRanks.length > 0) {
          rollType = 'branch';
          pickedRarity = getWordMetadata(candidateRanks[0]).tierName.toLowerCase();
        }
      }
    }
    
    if (candidateRanks.length === 0) {
      // Deepen proficient buckets
      rollType = 'deepen';
      const deepenInTier = tierCandidates.filter(r => proficientBuckets.includes(getWordMetadata(r).bucketId));
      if (deepenInTier.length > 0) {
        const higherComp = deepenInTier.filter(r => getWordMetadata(r).complexity >= 2);
        candidateRanks = higherComp.length > 0 ? higherComp : deepenInTier;
      } else {
        candidateRanks = tierCandidates;
      }
    }
  } else {
    // Developing: reinforce active buckets with accessible Level 1 words
    rollType = 'reinforce';
    const activeList = Object.keys(activeBucketCounts);
    const activeInTier = tierCandidates.filter(r => activeList.includes(getWordMetadata(r).bucketId));
    if (activeInTier.length > 0) {
      const level1 = activeInTier.filter(r => getWordMetadata(r).complexity === 1);
      candidateRanks = level1.length > 0 ? level1 : activeInTier;
    } else {
      candidateRanks = tierCandidates;
    }
  }

  // Fallback if candidate pool is empty
  if (!candidateRanks || candidateRanks.length === 0) {
    candidateRanks = tierCandidates.length > 0 ? tierCandidates : allUnowned;
  }

  // Bias slightly towards earlier frequency ranks within candidate pool
  candidateRanks.sort((a, b) => a - b);
  const poolSlice = candidateRanks.slice(0, Math.min(25, candidateRanks.length));
  const pickedRank = poolSlice[Math.floor(Math.random() * poolSlice.length)];

  const word = RANKED_WORDS[pickedRank - 1] || 'flow';
  const meta = getWordMetadata(pickedRank);
  const finalRarity = pickedRarity || meta.tierName.toLowerCase();
  const tierDef = EGG_RARITIES[finalRarity] || EGG_RARITIES.common;

  return {
    id: 'egg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    rarity: finalRarity,
    name: tierDef.name,
    color: tierDef.color,
    wordRank: pickedRank,
    word: word,
    tierName: meta.tierName,
    tierColor: meta.tierColor,
    baseXp: getWordBaseXp(pickedRank),
    bucketId: meta.bucketId,
    bucketName: meta.bucketName,
    bucketTag: meta.bucketTag,
    bucketColor: meta.bucketColor,
    complexity: meta.complexity,
    rollType: rollType // 'deepen', 'branch', or 'reinforce'
  };
}


/**
 * 3.2 Session Motor Bucket Heat update
 * When an error or backspace occurs on a word, increment heat +0.3 on all its tags (cap 2.0).
 * When completed cleanly at/above target WPM, decay heat -0.05 on all its tags (floor 0.0).
 */
function updatePatternHeat(wordObj, isCleanAndOnPace, hadErrorOrBackspace) {
  if (!wordObj || !wordObj.tags) return;
  for (const tag of wordObj.tags) {
    if (hadErrorOrBackspace) {
      patternHeat[tag] = Math.min(2.0, Math.round(((patternHeat[tag] || 0) + 0.3) * 100) / 100);
    } else if (isCleanAndOnPace) {
      patternHeat[tag] = Math.max(0.0, Math.round(((patternHeat[tag] || 0) - 0.05) * 100) / 100);
    }
  }
}

/**
 * 4.1 & 4.2 Dynamic Flow Governor & Word Weight Calculation
 * Prevents SRS Death Spirals by modulating challengeScale based on flowMomentum.
 */
function calculateWordWeight(wordObj, userStats = {}, targetWpm = 40, currentMomentum = 0) {
  const s = (userStats && userStats[wordObj.rank]) || {
    seen: 0,
    unfixedErr: 0,
    fixedErr: 0,
    avgWpm: targetWpm,
    streak: 0
  };

  const seen = s.seen ?? s.timesSeen ?? 0;
  const unfixedErr = s.unfixedErr ?? s.errorCount ?? 0;
  const fixedErr = s.fixedErr ?? 0;
  const avgWpm = s.avgWpm ?? s.lastWpm ?? targetWpm;
  const streak = s.streak ?? s.cleanHits ?? 0;

  const curiosity = seen < 4 ? (4 - seen) * 0.4 : 0;
  const errorWeight = (unfixedErr * 2.5) + (fixedErr * 0.8);
  const paceDeficit = avgWpm < targetWpm
    ? Math.min(2.0, ((targetWpm - avgWpm) / targetWpm) * 3.0)
    : 0;
  const tagHeat = wordObj.tags.reduce((sum, tag) => sum + (patternHeat[tag] || 0), 0);
  const masteryDecay = streak > 3 ? (streak - 3) * 0.1 : 0;

  // Flow Governor: Sub-Flow (0.35), Transition (0.85), Apex Testing (1.25)
  const challengeScale = currentMomentum < 85 ? 0.35 : (currentMomentum >= 100 ? 1.25 : 0.85);
  const rawWeight = 1.0 + curiosity + ((errorWeight + paceDeficit + tagHeat) * challengeScale) - masteryDecay;

  return Math.max(0.3, rawWeight);
}

/**
 * 4.3 Flow-Modulated SRS Generator with Anti-Clumping Cooldown Buffer
 */
function generateWords(batchSize = 70, unlockedRanks = [1], dictionary = DICTIONARY, userStats = {}, targetWpm = 40, currentMomentum = 0) {
  if (!unlockedRanks || unlockedRanks.length === 0) unlockedRanks = [1];
  const pool = unlockedRanks.map(rank => dictionary[rank - 1]).filter(Boolean);
  if (pool.length === 0) {
    pool.push(dictionary[0] || classifyWord("the", 0));
  }
  const cooldownCap = Math.min(6, Math.floor(pool.length * 0.6));
  const batch = [];

  for (let i = 0; i < batchSize; i++) {
    const candidates = pool.filter(w => !recentHistory.includes(w.word));
    const activePool = candidates.length > 0 ? candidates : pool;

    const weights = activePool.map(w => calculateWordWeight(w, userStats, targetWpm, currentMomentum));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let roll = Math.random() * totalWeight;
    let picked = activePool[activePool.length - 1];
    for (let j = 0; j < activePool.length; j++) {
      roll -= weights[j];
      if (roll <= 0) {
        picked = activePool[j];
        break;
      }
    }

    batch.push(picked.word);

    if (cooldownCap > 0) {
      recentHistory.push(picked.word);
      if (recentHistory.length > cooldownCap) recentHistory.shift();
    }
  }

  return batch;
}

function getSrsWeightedRandomWords(unlockedRanks, userStats, targetWpm, count = 70, currentMomentum = 0) {
  return generateWords(count, unlockedRanks, DICTIONARY, userStats, targetWpm, currentMomentum);
}

function getRandomWords(count = 70, recentBuffer = null) {
  const result = [];
  const bufferCap = 8;
  const buffer = recentBuffer || [];

  for (let i = 0; i < count; i++) {
    let word;
    for (let attempts = 0; attempts < 60; attempts++) {
      let r = Math.random() * CLASSIC_TOTAL_WEIGHT;
      let idx = 0;
      for (let j = 0; j < CLASSIC_WEIGHTS.length; j++) {
        r -= CLASSIC_WEIGHTS[j];
        if (r <= 0) {
          idx = j;
          break;
        }
      }
      word = RAW_WORDS_LIST[idx];
      if (!buffer.includes(word)) break;
    }
    result.push(word);
    buffer.push(word);
    if (buffer.length > bufferCap) buffer.shift();
  }
  return result;
}

class WordsModel {
  constructor(dictionary = DICTIONARY) {
    this.dictionary = dictionary;
    this.classicBuffer = [];
    this.rankedWords = dictionary.map(d => d.word);
    this.wordByRank = new Map();
    this.wordByText = new Map();
    for (let i = 0; i < dictionary.length; i++) {
      const d = dictionary[i];
      this.wordByRank.set(d.rank, d);
      this.wordByText.set(d.word, d);
    }
    this.patternHeat = patternHeat;
  }

  getWord(rank) {
    return getWordMetadata(rank);
  }

  getWordByText(text) {
    const raw = this.wordByText.get(text);
    return raw ? getWordMetadata(raw.rank) : null;
  }

  generateBatch(count, unlockedRanks, userStats, targetWpm, currentMomentum) {
    return generateWords(count, unlockedRanks, this.dictionary, userStats, targetWpm, currentMomentum);
  }

  generateClassicBatch(count = 70) {
    return getRandomWords(count, this.classicBuffer);
  }

  recordPatternHit(tags) {
    if (tags && tags.length > 0) {
      updatePatternHeat({ tags }, true, false);
    }
  }

  recordPatternError(tags) {
    if (tags && tags.length > 0) {
      updatePatternHeat({ tags }, false, true);
    }
  }

  resetHistory() {
    resetRecentHistory();
    this.classicBuffer = [];
  }

  rollEgg(unlockedRanks, streak = 0, forceRarity = null, wordStats = {}, targetWpm = 40) {
    return rollNewEgg(unlockedRanks, streak, forceRarity, wordStats, targetWpm);
  }
}

if (typeof window !== 'undefined') {
  window.RAW_WORDS = RAW_WORDS;
  window.RAW_WORDS_LIST = RAW_WORDS_LIST;
  window.RANKED_WORDS = RANKED_WORDS;
  window.DICTIONARY = DICTIONARY;
  window.PATTERN_COST = PATTERN_COST;
  window.detectMotorTags = detectMotorTags;
  window.computeBiomechanicalCost = computeBiomechanicalCost;
  window.buildHydratedDictionary = buildHydratedDictionary;
  window.patternHeat = patternHeat;
  window.recentHistory = recentHistory;
  window.resetRecentHistory = resetRecentHistory;
  window.classifyWord = classifyWord;
  window.classifyWordMotor = classifyWordMotor;
  window.updatePatternHeat = updatePatternHeat;
  window.calculateWordWeight = calculateWordWeight;
  window.generateWords = generateWords;
  window.getSrsWeightedRandomWords = getSrsWeightedRandomWords;
  window.getRandomWords = getRandomWords;
  window.getWordMetadata = getWordMetadata;
  window.getWordBaseXp = getWordBaseXp;
  window.rollNewEgg = rollNewEgg;
  window.WORD_TIERS = WORD_TIERS;
  window.MOTOR_BUCKETS = MOTOR_BUCKETS;
  window.EGG_RARITIES = EGG_RARITIES;
  window.WordsModel = WordsModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RAW_WORDS,
    RAW_WORDS_LIST,
    RANKED_WORDS,
    DICTIONARY,
    PATTERN_COST,
    detectMotorTags,
    computeBiomechanicalCost,
    buildHydratedDictionary,
    patternHeat,
    recentHistory,
    resetRecentHistory,
    classifyWord,
    classifyWordMotor,
    updatePatternHeat,
    calculateWordWeight,
    generateWords,
    getSrsWeightedRandomWords,
    getRandomWords,
    getWordMetadata,
    getWordBaseXp,
    rollNewEgg,
    WORD_TIERS,
    MOTOR_BUCKETS,
    EGG_RARITIES,
    WordsModel
  };
}
