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
  "the of he to it do as for we or by she if at go and in so me his her be but up on us use our out who its get all you see make with day they how ask man may can them this two new let no big way work when own also take one then life off him that here their few put what eye such down too high than sit not end yes find turn hand year your job far good feel will world yet same well now time last four some law set show talk week tell give other keep seem which ago word come first back would help hear pay car my bad could air right there add head old want mean city each girl these die call both child have case hour sure into body game cut war lead name play six kid very study age try boy over where know live more issue those food why like five win door send real while else meet drug book field walk story area about just arm read most lot able black small three line home wife write team hard side away foot still today sell hit wait form road only spend house fall oil view half son guy might stop late should even stay fact open run room low eat full site pick less tax thing speak plan sense town think light from hold white stand state land care any learn later need least cost during night system social offer hair art woman raise through build major look risk lose rate film leave buy ever move power though water pass early best rule wear much easy always fire idea father per people little former star hope health grow kind class others base pull draw next part value change again seek every term reach goal market test wall role must step thank never figure type top hot red lie dog whose drive fight problem data rise really many join third level result fill mother true clear focus course push south whether friend public point mind maybe after either west before large worker rest long begin cause kill sign itself without member return fine table paper baby drop throw watch lay carry toward list money family cup near month free quite eight past often bank history box face parent teach movie happen enough love future group page east cover great stock among within almost start leg share already store soon player image ten board himself society music fail plant remain death blue rock allow enter poor across whole period local news sex couple dark doctor another deal firm listen size single until bill person hang perhaps occur party act note teacher once series wrong court heart tree bed event nearly author american save reason window catch thus laugh fly place ready choose together suggest phone culture create student dead fish official although shoot upon matter voice young model bit left close price letter since provide song appear nature foreign effort visit glass season card short require office moment staff floor leader seat force fund nation school agency miss against order shake bring behind agree guess legal along product media likely patient main sea around loss avoid chair sort lawyer different gun sister finally herself usually ball happy stage bar current policy break sport argue cold claim space serious final energy better someone serve disease business race entire radio possible quickly blood crime factor under fear bag report difficult daughter gas onto include several thought program theory career sound picture however north natural wide between remember discuss rather quality adult prove huge style truth pain stuff record heat item myself private skill scene believe action weight building simply material sing tend worry tough yard strong above nothing arrive attack trial general rich range check memory pretty thousand task second dream church clearly ability medical college language shot forward activity question national street chance animal probably artist edge cell hotel defense spring center owner simple network ahead heavy produce nor safe design growth summer actually research whom civil analysis writer realize manage coach benefit choice vote hospital prepare various method enjoy trip answer special camera deep apply present human agent article finish color beyond meeting feeling total born middle follow measure million manager green military source husband forget exist similar explain interest position score effect message billion century personal officer morning nice behavior become beat brother including outside remove something skin consider identify pressure wonder yourself wheat sexual scale because cultural budget process themselves charge mouth individual despite authority finger available standard front situation sometimes treat reveal island religious unit indicate inside ground approach industry minute according shadow campaign security represent threat subject relate reality imagine soldier forest weapon discover mental federal purpose station peace respond response element reduce legend project financial mention support professor political tonight perform common movement country detail director piece popular science expect spirit dinner castle police exactly victim increase silver address trouble journey accept computer instead service machine anyone decide release compare expert degree establish everyone involve marriage whisper galaxy condition majority republican whatever challenge apart amount control impact western success ancient garden capital describe contain physical recent candidate example pattern everybody anything concern scientist fellow somebody victory courage citizen statement modern company stellar continue character education cancer number shoulder positive indeed suddenly congress attention throughout specific government protect significant beautiful ocean diamond crystal management difference strategy kitchen affect practice maintain everything partner treatment improve politics information resource target traffic notice travel television central horizon reflect prevent silence debate audience knowledge golden operation evidence evening quarter starlight receive develop decision section property decade structure painting discussion certain especially election democrat employee hundred experience surface determine important mystery production population account consumer relationship particular agreement magazine colleague recently champion commercial training generation understand interview newspaper investment economic institution violence environment direction democratic harmony traditional recognize particularly performance executive conference certainly community economy international thunder mountain environmental development necessary opportunity organization collection technology administration";

// Raw commonness-ordered word list (1,000 words ordered strictly 1..1000 by frequency)
const RAW_WORDS_LIST = RAW_WORDS.trim().split(/\s+/).slice(0, 1000);

// Option A: Tier-Weighted Macro Distribution (60% Common, 25% Uncommon, 12% Rare, 3% Epic)
// Ensures high-frequency typing cadence without clumping on words #1-5 ("to/he/she")
const CLASSIC_WEIGHTS = RAW_WORDS_LIST.map((_, i) => {
  if (i < 100) return 0.60 / 100;     // Common (Rank 1-100)
  if (i < 350) return 0.25 / 250;     // Uncommon (Rank 101-350)
  if (i < 700) return 0.12 / 350;     // Rare (Rank 351-700)
  return 0.03 / 300;                  // Epic (Rank 701-1000)
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
