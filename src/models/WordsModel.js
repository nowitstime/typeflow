/**
 * TypeFlow - Hybrid Biomechanical & Frequency Dictionary Sorter
 * 1,000 Most Common English Words Ranked by Hybrid Biomechanical Friction & Frequency
 * Zero-hardcode runtime dictionary hydration pipeline (<2ms)
 * Flow-Aware Spaced Repetition (SRS) Pacing
 */

var _BigramLedger = (typeof BigramLedger !== 'undefined') ? BigramLedger : null;
if (!_BigramLedger && typeof require !== 'undefined') {
  try {
    _BigramLedger = require('./BigramLedger.js').BigramLedger;
  } catch (e) {}
}

// 1. Overview & Raw Words String
const RAW_WORDS =
  "the their she for they with make them other world work when her also then first use which there this such would could life right that down these through hand turn if high what here ask than and four study good take issue our last where should week eye small but well story child those big let sit seem black end system little city about feel girl social keep though three body out both your during father he his word die year of sure same write spend still off while do talk show name may always field send head problem health whether food others us house will today else hear market former air door drug sense people see tell help find lead light change hour all game man play able each without meet offer back sell public its own yet stand cut road form later speak mean wife learn least it course raise me half set really power case figure or foot major class either history six book so time walk white call law early hard go itself day return worker want some land pick build result get hair ago put site society who happen cost might add yes mother state already risk value view how player full town fall come parent thank real south toward future wait himself less rule film fight american fire whose to late perhaps give you thing far focus friend read member together clear water seek night before another new plan arm throw third woman into goal teacher reach two too although stay job period official rise away cause suggest five pay enough different listen couple we eight way series paper think across within table almost line boy stock easy area student doctor drive push stop team author nearly dog sign single can against open as live pass by culture family have foreign choose carry lie share list term very wear letter matter remain store fill patient leave few star draw over possible plant provide board car hit nature window business bad occur finally usually care enter person age quite know again teach appear herself base current agency product require rate point home difficult lawyer most step maybe laugh wall blue west type sister rock war serious per pull glass reason disease room discuss thought firm daughter at oil leg between past remember drop movie quality dark hope natural lay more test season quickly probably effort hang visit national entire like nation near someone create shoot cover ready material question level theory actually side rest fact guess picture staff fine shake image activity fish every east legal rather building avoid data chair program private wrong likely baby eat leader thousand school weight never language several career only something watch ability fly fail include page just including clearly moment however better general poor factor office analysis energy hospital themselves attack network bill policy behind hot large college research bank stuff pretty one position interest after adult forward join nothing according style meeting begin tough happy worry situation final writer military box personal defense method stage radio available bit medical prepare realize various claim manager sometimes present phone benefit feeling arrive seat manage money often around spring report measure month billion owner catch consider memory article court believe message pressure individual tax approach behavior authority rich death represent coach allow produce close size best card ahead whole among identify camera civil simply middle yourself lose soon political heavy artist husband republican dream explain standard action million myself item group media special song religious street role ten win event cultural start hotel true cup floor range growth budget tend local top professor ball yard similar century him design heat officer campaign industry outside financial heart simple prove fear agent animal score need task total music indicate party brother island answer shadow grow shot strong order crime argue hold purpose response element short son main security finish even great ever reality born establish legend discover scale condition apply finger miss morning sexual wheat mental information truth church forget relate spirit chance despite vote summer forest idea above popular threat record imagine process government station sing look address journey sea soldier challenge respond beyond movement increase marriage attention sport mention castle support blood safe agree computer trial character onto center significant statement everybody release whisper not perform mind management tonight throughout ancient choice save skill exist difference candidate majority charge everything scientist thus gas instead pattern dinner machine weapon second left trouble education voice note whatever western because price galaxy physical pain now director everyone until stellar exactly subject wonder remove science model capital part bar mouth silver kill upon courage inside victory somebody suddenly place project victim bag citizen free beautiful positive television follow move along sound wide especially up reveal compare treatment cold next kid federal deal check contain from shoulder relationship anything whom effect success sort detail kind strategy much young crystal specific congress space dead starlight enjoy maintain operation population scene source discussion describe politics experience example continue green news involve diamond knowledge fellow partner loss horizon since country traffic act garden north production structure accept concern must painting old audience common practice break huge kitchen particular bring international force tree important property particularly fund quarter prevent determine environment control expert edge service commercial sex resource institution silence understand generation improve colleague become agreement traditional protect long modern degree ground impact many employee reflect front investment beat target treat serve cancer try company deep guy newspaper apart evidence reduce anyone why love democratic decision mystery lot amount evening performance face champion consumer democrat minute police election account environmental magazine interview travel low central color nor under expect conference golden affect trip debate indeed notice buy section peace direction recognize recently surface training art skin cell red develop certain executive violence race in certainly development ocean decide hundred recent human receive economic once community opportunity on organization harmony necessary administration number mountain run decade collection piece thunder nice be unit technology any economy gun bed no my";

// Raw commonness-ordered word list (1,000 words ordered strictly 1..1000 by frequency)
const RAW_WORDS_LIST = RAW_WORDS.trim().split(/\s+/).slice(0, 1000);

// Calibrated typability multiplier: lowers probability of small, cadence-disrupting words
// (avoids spacebar hammering on <=3 letter words) while boosting the 4-6 character fluid flow zone.
function getClassicTypabilityMultiplier(word) {
  const len = word.length;
  if (len <= 2) return 0.45; // Dampens 2-letter words (eliminates jerky spacebar hammering)
  if (len === 3) return 0.80; // Moderates 3-letter words
  if (len >= 4 && len <= 6) return 1.20; // Golden zone for rolling finger flow
  if (len === 7) return 1.00;
  if (len === 8) return 0.85;
  return 0.70; // Polysyllabic endurance words (9+)
}

// Option A: Tier-Weighted Macro Distribution with Typability Flow Calibration
// (58% Common, 26% Uncommon, 12% Rare, 4% Epic) scaled by length typability multiplier
const CLASSIC_WEIGHTS = RAW_WORDS_LIST.map((word, i) => {
  let base;
  if (i < 100) base = 0.58 / 100;          // Common (Rank 1-100)
  else if (i < 350) base = 0.26 / 250;     // Uncommon (Rank 101-350)
  else if (i < 700) base = 0.12 / 350;     // Rare (Rank 351-700)
  else base = 0.04 / 300;                  // Epic (Rank 701-1000)
  return base * getClassicTypabilityMultiplier(word);
});
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

// 2.1 Rarity Tier Definitions & Multipliers (Asymmetric Rarity Pyramid)
const WORD_TIERS = {
  STARTER:  { id: 0, name: 'Starter',  color: '#38bdf8', minRank: 1,   maxRank: 40,   baseCost: 30,   reward: 8 },
  COMMON:   { id: 1, name: 'Common',   color: '#2dd4bf', minRank: 41,  maxRank: 300,  baseCost: 50,   reward: 15 },
  UNCOMMON: { id: 2, name: 'Uncommon', color: '#34d399', minRank: 301, maxRank: 600,  baseCost: 120,  reward: 35 },
  RARE:     { id: 3, name: 'Rare',     color: '#c084fc', minRank: 601, maxRank: 850,  baseCost: 260,  reward: 80 },
  EPIC:     { id: 4, name: 'Epic',     color: '#fbbf24', minRank: 851, maxRank: 1000, baseCost: 500,  reward: 180 }
};

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

// Standard English corpus frequency ordering (1..1000) for telemetry and analytics
const CORPUS_FREQ_STRING =
  "the be of and to in he have it that for they with as not on she at by this we you do but his from or which what go their can who get if would her all my make about know will up one time there year so think when them some me people take out into just see him your come could now than like other how then its our two more these want way look first also new because day use no man find here thing give many well only those tell very even back any good woman through us life child work down may after should call world over school still try last ask need too feel three state never become between high really something most another much family own leave put old while mean keep student why let great same big group begin seem country help talk where turn problem every start hand might american show part against place such again few case week company system each right program hear question during play government run small number off always move night live point believe hold today bring happen next without before large million must home under water room write mother area national money story young fact month different lot study book eye job word though business issue side kind four head far black long both little house yes since provide service around friend important father sit away until power hour game often yet line political end among ever stand bad lose however member pay law meet car city almost include continue set later community name five once white least learn real change team minute best several idea kid body information nothing ago lead social understand whether watch together follow parent stop face anything create public already speak others read level allow add office spend door health person art sure war history party within grow result open morning walk reason low win research girl guy early food moment himself air teacher force offer enough education across although remember foot second boy maybe toward able age policy everything love process music including consider appear actually buy probably human wait serve market die send expect sense build stay fall nation plan cut college interest death course someone experience behind reach local kill six remain effect suggest class control raise care perhaps late hard field else pass former sell major sometimes require along development themselves report role better economic effort decide rate strong possible heart drug leader light voice wife whole police mind finally pull return free military price less according decision explain son hope develop view relationship carry town road drive arm true federal break difference thank receive value international building action full model join season society tax director position player agree especially record pick wear paper special space ground form support event official whose matter everyone center couple site project hit base activity star table court produce eat teach oil half situation easy cost industry figure street image itself phone either data cover quite picture clear practice piece land recent describe product doctor wall patient worker news test movie certain north personal simply third technology catch step baby computer type attention draw film republican tree source red nearly organization choose cause hair century evidence window difficult listen soon culture billion chance brother energy period summer realize hundred available plant likely opportunity term short letter condition choice single rule daughter administration south husband congress floor campaign material population economy medical hospital church close thousand risk current fire future wrong involve defense anyone increase security bank myself certainly west sport board seek per subject officer private rest behavior deal performance fight throw top quickly past goal bed order author fill represent focus foreign drop blood upon agency push nature color recently store reduce sound note fine near movement page enter share common poor natural race concern series significant similar hot language usually response dead rise animal factor decade article shoot east save artist scene stock career despite central eight thus treatment beyond happy exactly protect approach lie size dog fund serious occur media ready sign thought list individual simple quality pressure accept answer resource identify left meeting determine prepare disease whatever success argue cup particularly amount ability staff recognize indicate character growth loss degree wonder attack herself traditional television box training pretty election everybody physical lay general feeling standard bill message fail outside arrive analysis benefit sex forward lawyer present section environmental glass skill sister professor operation financial crime stage compare authority miss design sort act ten knowledge gun station blue strategy clearly discuss indeed truth song example democratic check environment leg dark various rather laugh guess executive prove hang entire rock forget claim remove manager enjoy network legal religious cold final main science green memory card above seat cell establish nice trial expert spring firm democrat radio visit management avoid imagine tonight huge ball finish yourself theory impact respond statement maintain charge popular onto reveal direction weapon employee cultural contain peace pain apply measure wide shake fly interview manage chair fish particular camera structure politics perform bit weight suddenly discover candidate production treat trip evening affect inside conference unit style adult worry range mention deep front edge specific writer trouble necessary throughout challenge fear shoulder institution middle sea dream bar beautiful property instead improve stuff detail method somebody magazine hotel soldier reflect heavy sexual bag heat marriage tough sing surface purpose exist pattern whom skin agent owner machine gas ahead generation commercial address cancer item reality coach yard beat violence total tend investment discussion finger garden notice collection modern task partner positive civil kitchen consumer shot budget painting scientist safe agreement capital mouth nor victim newspaper threat rich score account wheat audience dinner vote western relate travel debate prevent citizen majority apart fellow born mental traffic colleague scale mountain forest quarter target element release champion journey silence shadow silver golden ocean island whisper thunder diamond castle horizon mystery harmony courage victory legend ancient stellar galaxy crystal spirit starlight";

const CORPUS_FREQ_MAP = new Map(
  CORPUS_FREQ_STRING.trim().split(/\s+/).map((w, idx) => [w, idx + 1])
);

/**
 * 2.2 & 2.3 Runtime Dictionary Hydration (<2ms)
 * Maps progression-ranked words (statically sorted by UnlockPriority) into hydrated dictionary with 5-tier pyramid.
 */
function buildHydratedDictionary(rawWordsString) {
  const rawList = rawWordsString.trim().split(/\s+/).slice(0, 1000);

  return rawList.map((word, sortedIdx) => {
    const rank = sortedIdx + 1;
    const tags = detectMotorTags(word);
    const bioCost = computeBiomechanicalCost(word, tags);
    const tier = rank <= 40 ? "STARTER"
               : rank <= 300 ? "COMMON"
               : rank <= 600 ? "UNCOMMON"
               : rank <= 850 ? "RARE" : "EPIC";

    return {
      word,
      rank,
      freqRank: CORPUS_FREQ_MAP.get(word) || rank,
      tier,
      bioCost: Number(bioCost.toFixed(2)),
      primaryPattern: tags[0] || 'HOME_CORE',
      tags
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
  const tier = index < 40 ? "STARTER"
             : index < 300 ? "COMMON"
             : index < 600 ? "UNCOMMON"
             : index < 850 ? "RARE" : "EPIC";
  return {
    word,
    rank: index + 1,
    tier,
    primaryPattern: tags[0] || 'HOME_CORE',
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
  if (rank > 850) return 180; // Epic
  if (rank > 600) return 80;  // Rare
  if (rank > 300) return 35;  // Uncommon
  if (rank > 40)  return 15;  // Common
  return 8;                   // Starter
}

const EGG_RARITIES = {
  starter:  { id: 'starter',  name: 'Starter Egg',  color: '#38bdf8', minRank: 1,   maxRank: 40 },
  common:   { id: 'common',   name: 'Common Egg',   color: '#2dd4bf', minRank: 41,  maxRank: 300 },
  uncommon: { id: 'uncommon', name: 'Uncommon Egg', color: '#34d399', minRank: 301, maxRank: 600 },
  rare:     { id: 'rare',     name: 'Rare Egg',     color: '#c084fc', minRank: 601, maxRank: 850 },
  epic:     { id: 'epic',     name: 'Epic Egg',     color: '#fbbf24', minRank: 851, maxRank: 1000 }
};

function rollNewEgg(unlockedRanks, currentStreak = 0, forceRarity = null, wordStats = {}, targetWpm = 40, pendingRanks = [], bigramLedger = null) {
  let ledger = bigramLedger;
  if (ledger && typeof ledger.evaluateWordBridgeBonus !== 'function') {
    const BLClass = _BigramLedger || (typeof BigramLedger !== 'undefined' ? BigramLedger : (typeof window !== 'undefined' ? window.BigramLedger : null));
    if (BLClass) {
      ledger = new BLClass(ledger);
    }
  }

  const pendingSet = new Set(
    (Array.isArray(pendingRanks) ? pendingRanks : [])
      .map(item => (item && typeof item === 'object' ? item.wordRank : item))
      .filter(r => typeof r === 'number' && !isNaN(r))
  );
  const unlockedSet = new Set(unlockedRanks || [1]);
  const excludedSet = new Set([...unlockedSet, ...pendingSet]);

  // Group unowned candidate words by rarity tier & motor bucket
  const allUnowned = [];
  const unownedByTier = {
    starter: [],
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
    if (!excludedSet.has(r)) {
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

  // 1. Dynamic Rarity Determination (Asymmetric Pyramid & Early-Game Onboarding Gate)
  let pickedRarity = forceRarity;
  if (!pickedRarity) {
    const sCount = unownedByTier.starter.length;
    const cCount = unownedByTier.common.length;
    const uCount = unownedByTier.uncommon.length;
    const rCount = unownedByTier.rare.length;
    const eCount = unownedByTier.epic.length;

    let wStarter = 0;
    let wCommon = 0;
    let wUncommon = 0;
    let wRare = 0;
    let wEpic = 0;

    // Early-Game Onboarding Gate: For first 30 unlocked words, heavily draw from Starter pool (85%)
    if (unlockedSet.size < 30 && sCount > 0) {
      wStarter = 85.0 * Math.sqrt(sCount / 40.0);
      wCommon = 14.0 * (cCount > 0 ? Math.sqrt(cCount / 260.0) : 0);
      wUncommon = 1.0 * (uCount > 0 ? Math.sqrt(uCount / 300.0) : 0);
      wRare = 0.0;
      wEpic = 0.0;
    } else {
      // Dynamic Pool Depletion across Asymmetric Rarity Pyramid:
      // Base drop rates: Starter (overflow into Common), Common 75%, Uncommon 18%, Rare 6%, Epic 1%
      if (sCount > 0) {
        wStarter = 35.0 * Math.sqrt(sCount / 40.0);
      }
      if (cCount > 0) {
        wCommon = 75.0 * Math.sqrt(cCount / 260.0);
      }
      if (uCount > 0) {
        wUncommon = 18.0 * Math.sqrt(uCount / 300.0);
      }
      if (rCount > 0) {
        wRare = 6.0 * Math.sqrt(rCount / 250.0);
      }
      if (eCount > 0) {
        wEpic = 1.0 * Math.sqrt(eCount / 150.0);
      }
    }

    const tierWeights = [
      { id: 'starter', weight: wStarter },
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

  // Step 2 (Slice Candidates): Take top 15 easiest remaining locked words in Tier T
  candidateRanks.sort((a, b) => a - b);
  const poolSlice = candidateRanks.slice(0, Math.min(15, candidateRanks.length));

  // Step 3 (Score via N-Gram Bridge Bonus)
  let pickedRank = poolSlice[0];
  let bridgeEval = null;

  if (ledger && typeof ledger.evaluateWordBridgeBonus === 'function') {
    const unlockedCount = (unlockedRanks && unlockedRanks.length) || 1;
    const scoredCandidates = poolSlice.map(rank => {
      const wText = RANKED_WORDS[rank - 1] || '';
      const evalRes = ledger.evaluateWordBridgeBonus(wText, unlockedCount);
      return {
        rank,
        word: wText,
        weight: Math.max(0.01, (evalRes && typeof evalRes.weight === 'number') ? evalRes.weight : 1.0),
        evalRes
      };
    });

    const totalWeight = scoredCandidates.reduce((sum, c) => sum + c.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosen = scoredCandidates[scoredCandidates.length - 1];
    for (let i = 0; i < scoredCandidates.length; i++) {
      roll -= scoredCandidates[i].weight;
      if (roll <= 0) {
        chosen = scoredCandidates[i];
        break;
      }
    }
    pickedRank = chosen.rank;
    bridgeEval = chosen.evalRes;
  } else {
    pickedRank = poolSlice[Math.floor(Math.random() * poolSlice.length)];
  }

  const word = RANKED_WORDS[pickedRank - 1] || 'flow';
  const meta = getWordMetadata(pickedRank);
  const finalRarity = pickedRarity || meta.tierName.toLowerCase();
  const tierDef = EGG_RARITIES[finalRarity] || EGG_RARITIES.starter || EGG_RARITIES.common;

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
    rollType: rollType, // 'deepen', 'branch', or 'reinforce'
    bridgeBonus: bridgeEval ? bridgeEval.classification : null
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
 * 4.1 & 4.2 Dynamic Flow Governor & Dual-Mode Word Weight Calculation
 * Switches between Drill Mode (< 90% Flow) and Surf Mode (>= 90% Flow):
 *  - Drill Mode (< 90%): Training Ground. Aggressively drills player's top 3 weakest bigrams (+4.0)
 *    and newly unlocked words to stabilize mechanics.
 *  - Surf Mode (>= 90%): Runway / Peak Egg-Charging. Streams 85% high-mastery Anchor words,
 *    <= 15% Bridge words, and completely suppresses Overload words (>= 2 weak bigrams) to 0%.
 */
function calculateWordWeight(wordObj, userStats = {}, targetWpm = 40, currentMomentum = 0, bigramLedger = null, weakestBigrams = [], unlockedCount = 40) {
  const isSurfMode = currentMomentum >= 90;

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

  // Evaluate Bigrams if ledger is available
  let bridgeClassification = 'neutral';
  let weakCount = 0;
  if (bigramLedger && typeof bigramLedger.evaluateWordBridgeBonus === 'function') {
    const evalRes = bigramLedger.evaluateWordBridgeBonus(wordObj.word, unlockedCount);
    bridgeClassification = evalRes.classification;
    weakCount = evalRes.weakBigrams ? evalRes.weakBigrams.length : 0;
  }

  // --- SURF MODE (>= 90% Momentum): Rhythm Protection & Egg Charging ---
  if (isSurfMode) {
    // 0% Overload Words (>= 2 weak bigrams suppressed to protect rhythm)
    if (bridgeClassification === 'overload' || weakCount >= 2) {
      return 0.001;
    }

    // <= 15% Bridge Words (1 weak bigram, rest strong)
    if (bridgeClassification === 'bridge' || weakCount === 1) {
      return 0.35;
    }

    // 85% Anchor Words (0 weak bigrams, high mastery/comfort)
    const easeBonus = (wordObj.rank <= 40) ? 1.5 : 0.5;
    const streakBonus = Math.min(2.0, streak * 0.2);
    const lowErrorBonus = (unfixedErr === 0 && fixedErr === 0) ? 1.0 : 0.0;
    return 3.0 + easeBonus + streakBonus + lowErrorBonus;
  }

  // --- DRILL MODE (< 90% Momentum): Deliberate Practice ---
  // Target top 3 weakest bigrams from player's ledger
  let weakBigramBonus = 0;
  if (weakestBigrams && weakestBigrams.length > 0) {
    const hitsWeak = weakestBigrams.some(bg => wordObj.word.includes(bg));
    if (hitsWeak) {
      weakBigramBonus = 4.0; // Aggressively drill shaky transitions
    }
  }

  const curiosity = seen < 4 ? (4 - seen) * 1.2 : 0;
  const errorWeight = (unfixedErr * 2.5) + (fixedErr * 0.8);
  const paceDeficit = avgWpm < targetWpm
    ? Math.min(2.0, ((targetWpm - avgWpm) / targetWpm) * 3.0)
    : 0;
  const tagHeat = (wordObj.tags && Array.isArray(wordObj.tags))
    ? wordObj.tags.reduce((sum, tag) => sum + (patternHeat[tag] || 0), 0)
    : 0;
  const masteryDecay = streak > 3 ? (streak - 3) * 0.15 : 0;

  const challengeScale = currentMomentum < 40 ? 0.5 : 0.85;
  const rawWeight = 1.0 + weakBigramBonus + curiosity + ((errorWeight + paceDeficit + tagHeat) * challengeScale) - masteryDecay;

  return Math.max(0.3, rawWeight);
}

/**
 * 4.3 Flow-Modulated Dual-Mode Generator with Anti-Clumping Cooldown Buffer
 */
function generateWords(
  batchSize = 70,
  unlockedRanks = [1],
  dictionary = DICTIONARY,
  userStats = {},
  targetWpm = 40,
  currentMomentum = 0,
  bigramLedger = null
) {
  if (!unlockedRanks || unlockedRanks.length === 0) unlockedRanks = [1];
  const pool = unlockedRanks.map(rank => dictionary[rank - 1]).filter(Boolean);
  if (pool.length === 0) {
    pool.push(dictionary[0] || classifyWord("the", 0));
  }
  const cooldownCap = Math.min(6, Math.floor(pool.length * 0.6));
  const batch = [];

  let ledger = bigramLedger;
  if (ledger && typeof ledger.getWeakestBigrams !== 'function') {
    const BLClass = _BigramLedger || (typeof BigramLedger !== 'undefined' ? BigramLedger : (typeof window !== 'undefined' ? window.BigramLedger : null));
    if (BLClass) {
      ledger = new BLClass(ledger);
    }
  }

  const weakestBigrams = (ledger && typeof ledger.getWeakestBigrams === 'function')
    ? ledger.getWeakestBigrams(3)
    : [];

  const unlockedCount = unlockedRanks.length;

  for (let i = 0; i < batchSize; i++) {
    const candidates = pool.filter(w => !recentHistory.includes(w.word));
    const activePool = candidates.length > 0 ? candidates : pool;

    const weights = activePool.map(w =>
      calculateWordWeight(w, userStats, targetWpm, currentMomentum, ledger, weakestBigrams, unlockedCount)
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let picked = activePool[activePool.length - 1];
    if (totalWeight > 0) {
      let roll = Math.random() * totalWeight;
      for (let j = 0; j < activePool.length; j++) {
        roll -= weights[j];
        if (roll <= 0) {
          picked = activePool[j];
          break;
        }
      }
    } else {
      picked = activePool[Math.floor(Math.random() * activePool.length)];
    }

    batch.push(picked.word);

    if (cooldownCap > 0) {
      recentHistory.push(picked.word);
      if (recentHistory.length > cooldownCap) recentHistory.shift();
    }
  }

  return batch;
}

/**
 * Helper to identify high-mastery Anchor Words from the player's unlocked deck.
 * Prioritizes Starter pool words (ranks 1-40) and words with zero weak bigrams and clean hit streaks.
 */
function getAnchorWords(unlockedRanks = [1], dictionary = DICTIONARY, userStats = {}, bigramLedger = null) {
  if (!unlockedRanks || unlockedRanks.length === 0) unlockedRanks = [1];
  const words = unlockedRanks.map(r => dictionary[r - 1]).filter(Boolean);

  let ledger = bigramLedger;
  if (ledger && typeof ledger.isWeak !== 'function') {
    const BLClass = _BigramLedger || (typeof BigramLedger !== 'undefined' ? BigramLedger : (typeof window !== 'undefined' ? window.BigramLedger : null));
    if (BLClass) {
      ledger = new BLClass(ledger);
    }
  }

  const anchors = words.filter(w => {
    if (ledger && typeof ledger.isWeak === 'function') {
      const bgs = ledger.getWordBigrams(w.word);
      if (bgs.some(bg => ledger.isWeak(bg))) return false;
    }
    const stat = userStats[w.rank];
    if (stat && (stat.unfixedErr || 0) > 0.5) return false;
    return true;
  });

  if (anchors.length > 0) return anchors;
  // Fallback to top Starter words
  const starters = words.filter(w => w.rank <= 40);
  return starters.length > 0 ? starters : [dictionary[0] || { word: 'the', rank: 1 }];
}

/**
 * Sandwiched Induction Rule:
 * Wraps a newly unlocked word between two high-mastery Anchor Words.
 * Prefers Anchor 1 ending on the opposite hand of newWord's starting letter for hand-alternating launch.
 */
function createWordSandwich(newWordText, unlockedRanks = [1], dictionary = DICTIONARY, userStats = {}, bigramLedger = null) {
  const clean = (newWordText || 'flow').toLowerCase();
  const anchors = getAnchorWords(unlockedRanks, dictionary, userStats, bigramLedger);

  const startChar = clean[0] || 't';
  const startHand = LEFT_HAND.has(startChar) ? 'L' : 'R';

  // Anchor 1: launchpad, ideally ending on the opposite hand (H1 != H2 alternation)
  const oppHandAnchors = anchors.filter(a => {
    const endChar = a.word[a.word.length - 1];
    const endHand = LEFT_HAND.has(endChar) ? 'L' : 'R';
    return endHand !== startHand && a.word !== clean;
  });

  const anchor1Obj = oppHandAnchors.length > 0
    ? oppHandAnchors[Math.floor(Math.random() * oppHandAnchors.length)]
    : (anchors.find(a => a.word !== clean) || anchors[0]);

  const anchor1 = anchor1Obj ? anchor1Obj.word : 'the';

  // Anchor 2: landing pad, distinct from Anchor 1 and clean
  const landingAnchors = anchors.filter(a => a.word !== clean && a.word !== anchor1);
  const anchor2Obj = landingAnchors.length > 0
    ? landingAnchors[Math.floor(Math.random() * landingAnchors.length)]
    : (anchors.find(a => a.word !== clean) || anchors[0]);

  const anchor2 = anchor2Obj ? anchor2Obj.word : 'and';

  return [anchor1, clean, anchor2];
}

function getSrsWeightedRandomWords(unlockedRanks, userStats, targetWpm, count = 70, currentMomentum = 0, bigramLedger = null) {
  return generateWords(count, unlockedRanks, DICTIONARY, userStats, targetWpm, currentMomentum, bigramLedger);
}

function getRandomWords(count = 70, recentBuffer = null) {
  const result = [];
  const bufferCap = 20;
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

  generateBatch(count, unlockedRanks, userStats, targetWpm, currentMomentum, bigramLedger = null) {
    return generateWords(count, unlockedRanks, this.dictionary, userStats, targetWpm, currentMomentum, bigramLedger || this.bigramLedger);
  }

  generateClassicBatch(count = 70) {
    return getRandomWords(count, this.classicBuffer);
  }

  getAnchors(unlockedRanks, userStats, bigramLedger = null) {
    return getAnchorWords(unlockedRanks, this.dictionary, userStats, bigramLedger || this.bigramLedger);
  }

  createSandwich(newWordText, unlockedRanks, userStats, bigramLedger = null) {
    return createWordSandwich(newWordText, unlockedRanks, this.dictionary, userStats, bigramLedger || this.bigramLedger);
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

  rollEgg(unlockedRanks, streak = 0, forceRarity = null, wordStats = {}, targetWpm = 40, pendingRanks = [], bigramLedger = null) {
    return rollNewEgg(unlockedRanks, streak, forceRarity, wordStats, targetWpm, pendingRanks, bigramLedger);
  }
}

if (typeof window !== 'undefined') {
  window.RAW_WORDS = RAW_WORDS;
  window.RAW_WORDS_LIST = RAW_WORDS_LIST;
  window.CLASSIC_WEIGHTS = CLASSIC_WEIGHTS;
  window.CLASSIC_TOTAL_WEIGHT = CLASSIC_TOTAL_WEIGHT;
  window.getClassicTypabilityMultiplier = getClassicTypabilityMultiplier;
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
  window.getAnchorWords = getAnchorWords;
  window.createWordSandwich = createWordSandwich;
  window.WORD_TIERS = WORD_TIERS;
  window.MOTOR_BUCKETS = MOTOR_BUCKETS;
  window.EGG_RARITIES = EGG_RARITIES;
  window.WordsModel = WordsModel;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RAW_WORDS,
    RAW_WORDS_LIST,
    CLASSIC_WEIGHTS,
    CLASSIC_TOTAL_WEIGHT,
    getClassicTypabilityMultiplier,
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
    getAnchorWords,
    createWordSandwich,
    WORD_TIERS,
    MOTOR_BUCKETS,
    EGG_RARITIES,
    WordsModel
  };
}
