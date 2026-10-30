# 🧠 Lexicon, Biometrics & SRS Engine

[**← Back to Wiki Home**](./Home.md)

This page explains how TypeFlow structures its **1,000-word Grand Lexicon** (`src/models/WordsModel.js`), how words are scored for physical typing difficulty (`scripts/score_words.py` and `src/models/BigramLedger.js`), and how new words are introduced and scheduled.

---

## 1. The 1,000-Word Lexicon & Rarity Tiers

All 1,000 words in `RAW_WORDS` (`src/models/WordsModel.js`) are ordered from Rank 1 (`"the"`) to Rank 1,000 (`"my"`) by a hybrid of **real-world English frequency** and **biomechanical typability**.

They are divided into an **Asymmetric Rarity Pyramid**:

| Tier | Word Ranks | Count | Classic Mode Spawn Weight | Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **Common** | `1 – 100` | 100 words | `58%` | High-frequency connectors & core vocabulary (*the, their, world, work*). |
| **Uncommon** | `101 – 350` | 250 words | `26%` | Everyday conversational verbs and nouns (*system, city,story, social*). |
| **Rare** | `351 – 700` | 350 words | `12%` | Longer multi-syllable words and complex suffixes (*government, information, challenge*). |
| **Epic** | `701 – 1,000` | 300 words | `4%` | High-complexity or awkward finger-transition words (*organization, administration, environment*). |

### Why Typability Length Multipliers Exist (`getClassicTypabilityMultiplier`)
If a typing test samples purely by raw English frequency, ~40% of your test consists of 2- and 3-letter words (*of, to, in, it, is, be*). That turns typing into jerky spacebar hammering rather than fluid finger rolling.
 Conversely, if every word is 10 letters long, cadence feels sluggish.

TypeFlow applies a **Typability Flow Multiplier** on top of tier weights:
- **1–2 letters (`0.45×`) & 3 letters (`0.80×`):** Dampened to prevent repetitive spacebar hammering.
- **4–6 letters (`1.20×`):** Boosted—"the golden zone" for multi-finger rolling cadence.
- **7–8 letters (`1.00×`–`0.85×`) & 9+ letters (`0.70×`):** Moderated so polysyllabic endurance words appear as rhythmic challenges rather than consecutive walls of text.

---

## 2. The 5 Physical Motor Patterns (Keybr-Inspired Biometrics)

Every word in `WordsModel.js` is classified at startup (<2ms hydration) into one of **5 physical finger-motion buckets**, each with an associated biomechanical cost (`PATTERN_COST`):

| Bucket ID | Badge | Cost | Biomechanical Definition & Purpose |
| :--- | :--- | :--- | :--- |
| **`HOME_CORE`** | `🏠 Home Core` | `0.0` | High concentration of home-row keys (`asdfghjkl`) with minimal vertical row jumping. Builds foundational posture. |
| **`ALTERNATING`** | `⚡ Alternator` | `1.0` | High left-hand / right-hand alternation ratio (`>= 65%`). Trains high-speed ping-pong rhythm where one hand prepares while the other strikes. |
| **`SUFFIX_CURL`** | `🌀 Suffix Curl` | `2.5` | Words containing common inward/outward 3-finger rolls (`-ing`, `-tion`, `-ment`, `-ght`, `-ough`, `str-`, `thr-`). Trains fluid chorded macro-movements. |
| **`DOUBLE_BOUNCE`** | `💥 Double Tap` | `3.5` | Words with repeated consecutive letters (`ll`, `ss`, `ee`, `oo`, `tt`, `ff`). Trains crisp key release and double-tap timing without mushing keys. |
| **`REACH_PINKY`** | `🎯 Lateral Reach` | `5.0` | Words requiring outer-column pinky/ring extensions (`q`, `z`, `p`, `x`, `v`, `y`, `b`) or wide top-to-bottom row hurdles. The highest-friction physical pattern. |

---

## 3. Personal N-Gram Tracking (`src/models/BigramLedger.js`)

Beyond static word difficulty, every typist has unique personal bottlenecks (for example, hesitating on `th`, `ou`, `qu`, or `ct`).

`BigramLedger.js` tracks every two-letter transition ($c_1 \rightarrow c_2$) you type in real time using an **Exponential Moving Average (EMA, $\alpha = 0.20$)**:
- **Transition Latency (`emaMs`):** Clamped between `30ms` and `1500ms` so outliers or AFK pauses never corrupt your profile.
- **Error Rate (`emaErr`):** Rolling probability ($0.0\text{–}1.0$) of mistyping the second character of the bigram.
- **Composite Friction Score (`getFrictionScore`):** Combines your speed deficit and error rate on that specific bigram so `WordsModel.js` can identify which unlocked words contain your weakest transitions.

---

## 4. Flow-Aware Spaced Repetition (SRS) & Word Sandwiches

### Spaced Repetition Scheduling (`WordsModel.js`)
Each unlocked word maintains its own telemetry record (`seen`, `cleanStreak`, `avgWpm`, `fixedErrors`, `unfixedErrors`). When generating the next stream of words in Flow Mode:
1. Words with recent unfixed errors, fixed backspaces, or low `cleanStreak` receive higher selection priority.
2. Words containing your currently weakest bigrams from `BigramLedger` receive a targeted practice boost.
3. A **recent-word ring buffer** prevents the same word from repeating back-to-back once your unlocked deck grows.

### Sandwiched Word Induction (`createWordSandwich`)
When you hatch a brand-new word from an Egg, dropping it randomly into a fast stream often causes an immediate stumble—especially on transition *into* or *out of* the unfamiliar word.

TypeFlow wraps newly hatched words inside a **3-word Sandwich**:
$$\texttt{[ Fast Familiar Anchor ]} \longrightarrow \texttt{[ Newly Hatched Word ]} \longrightarrow \texttt{[ Fast Familiar Anchor ]}$$
- The first **Familiar Anchor** (a mastered word you type effortlessly) acts as a launchpad so your flywheel momentum and hand positioning are stable before hitting the new word.
- The second **Familiar Anchor** acts as a landing pad so your fingers immediately recover rhythm after completing the new word.
