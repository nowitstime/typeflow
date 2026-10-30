# TypeFlow — Future Development & Feature Roadmap

## Core Design Constraint
Every feature in this roadmap must preserve TypeFlow's core identity: **zero-dependency, single-file portability (~290 KB), and instant-load immediacy**. Any new mechanic, visual indicator, or onboarding cue must be lightweight, avoid intrusive modal pop-ups during active gameplay, and minimize HUD clutter.

---

## 1. Flow State Performance Recap & Timeline Graph (Shipped in v4.1)
Provide deep, retrospective insight into sustained Flow State runs without interrupting the kinetic typing flow, while reusing Classic Mode's `#results-section` and `ChartView` for a unified experience and minimal footprint.

### 1.1 Flow Run Qualification & Lenient Continuation Floor
- **Start & Qualification:** Tracking begins when $\text{Momentum} \ge 85\%$, and a run only saves/surfaces if it reaches at least **5 seconds** AND **3+ clean words**.
- **Lenient Continuation Floor ($\ge 50\%$):** Once active, the Flow Run survives minor stumbles or single-word errors as long as $\text{Momentum} \ge 50\%$, finalizing only when momentum drops below $50\%$, decays below $50\%$ on idle, or on session reset.
- **Hands-on-Keyboard Invocation & AFK Dissolve:**
  - *Contextual Recap Pill:* Compact pill next to the Egg Nest (`📈 Flow: 68 WPM • Peak 84 [;;]`).
  - *Home-Row `;;` Shortcut:* Double-tapping semicolon (`;;` within 400ms) toggles the Flow Recap view; single `;` is ignored during word typing so it never causes a typo.
  - *7s AFK Crossfade & Zero-Friction Wake:* After a qualifying Flow Run ends, 7 seconds of inactivity triggers a 1.0s dissolve into the Flow Recap view; typing any letter immediately dismisses the recap and routes that keystroke directly into the active word.
- **Saved Flow History & Deck Size:** Persists up to 15 recent Flow Runs in `StorageService` (`flowHistory`) alongside the player's `unlockedWords` count, with clickable rows in the Lifetime Stats modal.

---

## 2. Achievements & Milestone Badges (Shipped in v3.5)
A comprehensive, lightweight milestone trophy system rewarding speed, flow endurance, vocabulary mastery, and hidden mode discipline.

### 2.1 Achievement Categories
- **Flow & Endurance:**
  - *First Current:* Enter Flow State ($85\%$ momentum) for the first time.
  - *Zen Master:* Maintain uninterrupted Flow for 30s, 60s, 120s, and 300s.
  - *Apex Predator:* Sustain maximum Apex overspin ($100\%\text{--}120\%$) for 20 consecutive seconds.
  - *Unbroken Stream:* Type 100 consecutive clean words without a single mistake.
- **Speed & Cadence:**
  - *Pace Setter:* Complete a clean Flow run at 50, 75, 100, and 120+ Target WPM.
  - *Burst Sprinter:* Hit 130+ instantaneous burst WPM during an Apex run.
- **Vocabulary & Hatchery RPG:**
  - *Nest Tender:* Hatch 10, 50, 100 eggs.
  - *Lexicon Hoarder:* Unlock 50, 100, 250, and 500 word ranks.
  - *Mythic Discovery:* Hatch your first Rare and Epic tier word eggs.
  - *Linguistic Legend:* Reach Player Level 25, 50, and 100.
- **Hidden Mode Prowess:**
  - *Blind Typist:* Type 25 consecutive clean words in Hidden Mode.
  - *Memory Horizon:* Sustain Flow with 4+ words vanished in Word Vanish mode.
  - *Echoes in the Dark:* Reach a 50+ combo streak in Character Horizon mode.

### 2.2 Visual Presentation & Storage
- **Trophy Shelf inside Stats Modal:** Dedicated "Badges" gallery tab inside the Stats modal displaying unlocked glassmorphism medals and progress bars for locked achievements.
- **Micro-Toast Celebration:** Non-blocking floating celebration pill (`✨ Achievement Unlocked: Zen Master!`) that appears in the top viewport without stealing focus.
- **Compact Persistence:** Bitfield or string array in `StorageService` (`save.achievements = ['first_flow', ...]`) with zero runtime overhead.

---

## 3. Level Progression Unlocks & Cosmetic Armory (Shipped in v4.0)
Reward leveling up and vocabulary expansion with aesthetic customizations that let players personalize their typing experience.

### 3.1 Unlockable OLED Themes & Palettes
- **Level-Gated Themes:**
  - *Lv. 1 (Default):* OLED Cyan (Deep pitch black with electric cyan and amber accents).
  - *Lv. 5 (Sakura Stream):* Soft midnight charcoal, pastel blossom pink, and lavender accents.
  - *Lv. 10 (Cyberpunk Neon):* High-contrast purple haze with radioactive green and hot magenta.
  - *Lv. 15 (Solarized Terminal):* Classic hacker monochrome amber/green phosphor CRT aesthetic.
  - *Lv. 25 (Nord Frost):* Glacial blues, polar white text, and frosted aurora accents.
  - *Lv. 50 (Obsidian Gold):* Sovereign dark gold, champagne luminescence, and warm amber aura.
- **Instant Palette Switching:** Integrated palette selector inside Settings / Stats modal that updates CSS custom properties (`--main-color`, `--sub-color`, `--bg-color`) instantly.

### 3.2 Caret Styles & Custom FX
- **Selectable Caret Geometry:**
  - *Line (Default):* Clean 3px vertical bar with subpixel tracking.
  - *Block / Terminal:* Semi-transparent retro terminal box cursor.
  - *Underline:* Sleek bottom-accent border runner.
  - *Pulse Capsule:* Rounded pill caret that pulses subtly with typing rhythm.
- **Caret Trails & VFX:**
  - *Comet Trail:* Gentle particle tail fading behind the caret during rapid horizontal jumps.
  - *Rainbow Barber-Pole (Apex Unlock):* Unlock the dynamic 100% flow rainbow spiral as a permanent selectable style.

### 3.3 Mechanical Sound Packs
- **Switch Sound Profiles (Web Audio API Synthesized):**
  - *Default Box Blue:* Crisp, clicky mechanical switch clicks.
  - *Thoccy Linear (Gateron Ink / Oil King):* Deep, bassy, muted acoustic thocs.
  - *Tactile Brown:* Rounded, subtle tactile bump clicks.
  - *Typewriter Bell:* Retro typewriter striker impact with subtle carriage return bell on word 20.
  - *Bubble / Droplet:* Organic water droplet micro-clicks for a soothing, zen acoustic atmosphere.

### 3.4 Cosmetic Wardrobe / Armory UI
- **Unified Customization Drawer:** Clean tab or modal section showcasing unlocked themes, carets, sounds, and egg nests with live preview cards.
- **Progress Badges:** Locked items display clear criteria (e.g. `Unlocks at Lv. 20` or `Earn by typing 100 WPM in Flow`).

---

## 4. Visual Polish & Kinetic Juice
Elevate TypeFlow's game feel with responsive micro-animations, typography finesse, and fluid motion.

### 4.1 Caret Physics & Motion Polish
- **Smooth Spring Interpolation:** Add subtle spring physics to caret movement so it glides and snaps fluidly between characters rather than stepping rigidly.
- **Word-Wrap Snap Transitions:** Graceful vertical slide when advancing to the next row, preventing visual jarring during rapid line-shifts.

### 4.2 Kinetic Typing Juice & Feedback
- **Combustion & Streak Haze:** Progressive ambient particles or soft radial glow behind the active word as combo passes 25, 50, and 100.
- **Clean Word Spacebar Ripple:** Gentle, fleeting expansion wave radiating from the submitted word upon clean spacebar completion.
- **Level-Up Radial Shimmer:** Celebratory golden edge sweep across the viewport boundary upon reaching a new rank/level milestone.

### 4.3 Active Typing Focus Dimmer
- **Zen Focus State:** Fade peripheral chrome (header navigation, mode tabs, stats bar, and footer) to low opacity (~20%) while actively typing.
- **Instant Wake:** Restore full brightness instantly upon backspacing, pausing for $\ge 1.5\text{s}$, or moving the mouse.

### 4.4 Typography & Font Selection
- **Monospace Font Switcher:** Option to toggle between curated programming fonts via `localStorage` (JetBrains Mono, Fira Code, Roboto Mono, Share Tech Mono).
- **Ligature Support Toggle:** Clean option to enable or disable programming ligatures.

---

## 5. Frictionless Onboarding & Calibration
New playtesters need seamless onboarding without intrusive tutorial pop-ups.

### 5.1 Initial WPM Target Calibration
- **Exploratory Calibration Options:**
  - *Option A (Guided 30s Classic Baseline):* Prompt first-time players to run a quick 30-second test, then automatically initialize their Flow Target WPM to 3–5 WPM below their baseline.
  - *Option B (Silent 10-Word In-Band Calibration):* Start new saves in an uncalibrated state for the first 10 words, compute median cadence WPM, and lock `targetWpm` with a gentle floating toast.
- **First-Time Pace Callout:** Briefly highlight the Pace slider once calibrated so the player understands how target pacing governs the flywheel.

---

## 6. Training Modifiers & Motor Diagnostics

### 6.1 Bigram Diagnostic View & Motor Heatmap
- **Surface Bigram Ledger in Stats:** Expose player's top 5 weakest and top 5 strongest bigrams from `BigramLedger`.
- **Motor Pattern Recommendations:** Suggest targeted practice words or confidence drills based on specific weak transitions (e.g., `th`, `ou`, `er`).

### 6.2 Dynamic Deck Difficulty & Typability Friction Score (Future)
- **Active Deck Complexity Index:** Compute a composite difficulty score for the player's currently unlocked deck based on average word length, tier distribution (Starter vs. Rare/Epic), motor pattern weights (`REACH_PINKY`, `DOUBLE_BOUNCE`), and personal bigram friction.
- **Run-Specific Stream Difficulty:** Record the exact typability difficulty rating of the words that actually spawned on screen during a Flow Run or Classic Test so players can compare WPM performance normalized against stream complexity.

### 6.3 Verified Modifier Badging & Pure Hidden Scores (Classic & Flow Modes)
- **Session Integrity Tripwire:** Track `verifiedHidden` across both Classic and Flow Mode sessions. The modifier mark is only awarded if Hidden Horizon remained active continuously from the very first keystroke through test completion without ever being toggled off mid-run.
- **Modifier Badges on Scorecards & History:**
  - *Results Card:* Prominent `[🕶️ HIDDEN]` modifier badge with configuration subtitle (`Word Vanish • 2 Words` or `Character Horizon`) next to the main WPM score.
  - *Classic History Table (`#stats-history-tbody`):* Mode column displays `30s [HD]` or a dedicated `Mod` badge.
  - *Flow History Table (`#flow-history-tbody`):* Qualifying Flow Runs retain `[HD]` tags in `flowHistory` so players can review their blindfolded flow streaks.
- **Hidden Personal Bests (Split / Badged PBs):** Distinguish PBs achieved under blindfold conditions in the Classic Records card grid or provide a sub-tab toggle for pure Hidden high scores.

### 6.4 Sudden Death / Hardcore Mode ("Pro Mode")
- **Zero-Tolerance Precision Mechanics:**
  - *Instant Fail / Restart on Error:* Any mistyped character (or uncorrected error submitted with Space) immediately halts the session with an acoustic fracture sound and subtle red vignette flash, allowing instant restart with <kbd>Tab</kbd> or <kbd>Enter</kbd>.
  - *Configurable Strictness:* Option to toggle between "Strict" (Backspace disabled entirely, requiring pure unhesitating forward momentum) and "Forgiving Sudden Death" (Backspace permitted for typo correction, but any uncorrected word submitted with Space ends the run).
- **Sudden Death Telemetry & Records:** Track "Longest Clean Word Run before Death" (e.g., 25, 50, 100 words clean) and award high-tier precision trophies.
- **Cross-Mode Applicability:** Can be enabled as an optional modifier in Classic Mode (e.g., 30s Sudden Death) or as a high-stakes Flow Mode variant (where a mistake instantly wipes momentum to 0% and requires spinning up the flywheel from a dead stop).

### 6.5 Classic Mode Word Difficulty Modifiers ("Easy 200" / "Standard 1k" / "Hard")
- **Addressing the "Monkeytype 200" Phenomenon:** Standard 200-word typing tests feel gratifying because they stick to low-friction 3–5 letter words, but they fail to train harder finger transitions. Making word difficulty an explicit, badged modifier in the Mods section gives players both options:
  - *Easy / Sprint 200:* Restricts spawning to the top 200 highest-frequency, lowest-friction words for high-velocity warmup sprints and 1:1 baseline comparisons with traditional typing sites.
  - *Standard 1k (Default):* Our balanced tier-weighted distribution (58% Common, 26% Uncommon, 12% Rare, 4% Epic) with typability flow calibration.
  - *Hard / Technical:* Shifts weights heavily toward Rare and Epic tiers (polysyllabic words and high-cost motor patterns like `REACH_PINKY` and `DOUBLE_BOUNCE`) to stress-test accuracy and endurance under awkward transitions.
- **Scorecard & PB Badging:** Tags Classic runs with their difficulty tier (`[200]`, `[1K]`, `[HARD]`) alongside a calculated stream difficulty rating so Personal Bests remain contextualized.

### 6.6 Punctuation Modifier & Sentence Mode
- **Punctuation & Capitalization Modifier:** Toggleable modifier injecting realistic `Shift` capitalizations, periods, commas, hyphens, apostrophes, and quotation marks into the word stream to train pinky precision and rhythm recovery.
- **Dedicated Sentence & Quote Mode:** Curated prose sentences and quotes graded automatically by our biomechanical difficulty engine (combining word tier friction, average length, and punctuation density into a 1–5★ difficulty rating).

---

## 7. Balance, Physics & Audio Tuning

### 7.1 Adaptive Inertia Decay
- **Adaptive Idle Grace:** Scale the idle decay grace period dynamically based on `targetWpm` interval (at 100 WPM, words take ~300ms, while at 35 WPM they take ~1000ms).

### 7.2 Audio Volume Control
- **Master Audio Volume Slider:** Add a dedicated volume percentage slider alongside the sound toggle.

---

## 8. Flow FX, Atmospheres & Sensory Tuning (Phase 2 & Future)
The v4.0 release shipped the core Cosmetic Armory with 6 Atmospheres, 6 Caret Modifiers, and 4 Ghost Pacer Styles (§8.1–§8.3). The remaining items below are staged for subsequent releases.

### 8.1 Flow FX Styles (Shipped in v4.0)
- *Shipped Presets:* Adaptive Resonance, Prismatic Aurora, Cyberpunk Grid, Solar Flame / Inferno (`<feTurbulence>`), Hyperdrive Speedlines, and Zen Trance.

### 8.2 Universal Caret Flow Modifiers (Shipped in v4.0)
- *Shipped Modifiers:* Clean Solid, Prismatic Rainbow, Plasma Overdrive, Solar Flare, Holo Glitch, and Hyperdrive Tracer.

### 8.3 Ghost Caret (Pace Rabbit) Customization (Shipped in v4.0)
- *Shipped Styles:* Ghost Line, Ghost Runner, Ghost Wireframe Terminal, and Ghost Halo.

### 8.4 Tactile Overspin Cushion & Ambient Audio (Staged for Phase 2)
- *Overspin Cushion Shield (100%–120%):* Crystalline/electrified perimeter aura visually arming the shield; "shield shatter / deflect" dispersion wave upon absorbing typos.
- *Ambient Flow Audio:* Gentle harmonic undertone or binaural synth drone swelling at $\ge 75\%$ flow, with an Apex transcendence chime at 100% (fully toggleable with volume controls).

### 8.5 Comprehensive Settings & Menu Revamp (Future Phase)
- *Flow FX Intensity Slider:* Off, Subtle (25%), Normal (Default), and Max Energy.
- *Reduced Motion Mode:* Replaces pulsing scale and moving gradients with static opacity crossfades.
- *Unified Navigation:* Streamlined drawer consolidating gameplay modifiers, cosmetics, audio, and diagnostics.

---

## 9. Long-Term Horizon: Pathways, Programming Mode & UGC Ecosystem

### 9.1 Structured Learning Pathways & Pass/Fail Trials ("License Tests")
- **Guided Mastery Tracks:** Structured progression trees where players advance through curated typing trials with explicit **Pass / Fail criteria** (e.g., *"Pass: Reach 65 WPM with $\ge 97\%$ Accuracy and 0 unfixed errors across a Tier-3 Sentence Gauntlet"*).
- **Skill Certification & Milestones:** Completing pathways unlocks specialized titles, cosmetics, and mastery ranks—bridging the gap between sandbox typing and structured deliberate practice.

### 9.2 Programming & Syntax Mode
- **Code & Symbol Fluency:** Dedicated decks and Flow progressions focused on programming keywords, bracket/operator ergonomics (`{}`, `[]`, `()=>`, `===`, `;`), and idiomatic one-liners across popular languages (JavaScript/TypeScript, Python, Rust, C++, HTML/CSS).
- **Biomechanical Symbol Scoring:** Extends `BigramLedger` and motor pattern costs to track right-pinky symbol reaches and bracket pairing speed.

### 9.3 User-Generated Content (UGC), Custom Phrases & Shareable Packs
- **Custom Phrase & Quote Importer:** Allow players to paste or upload custom phrases, study decks, or book excerpts into `StorageService`, with automatic runtime difficulty scoring.
- **Shareable Pathway & Quote Packs (Marketplace Vision):** Enable exporting and importing compact JSON/string bundles containing custom sentence packs, difficulty ratings, and custom Pass/Fail WPM targets—laying the foundation for a community pack browser or curated quote library down the line.

---

## Completed Milestones (Shipped)
- [x] **v4.1 Flow State Performance Recap & Timeline Graph:**
  - *Qualification & Lenient Floor:* Starts at $\ge 85\%$ Flow (`>= 5s` and `>= 3` clean words required) and stays alive across mid-run stumbles down to a $\ge 50\%$ continuation floor.
  - *Contextual Pill & `;;` Home-Row Shortcut:* Ambient recap pill next to the Egg Nest (`Flow: <wpm> WPM • Peak <peak> [;;]`) and instant `;;` double-tap toggle (with single `;` typo suppression).
  - *7s AFK Crossfade & Zero-Friction Wake:* 1.0s dissolve into the Flow Recap after 7 seconds of post-run inactivity, waking and typing the first character directly into the active word on any keystroke.
  - *Unified Timeline Graph & History:* Reuses `#results-section` and `ChartView` with per-second `% Flow` hover telemetry, plus 15-run `flowHistory` persistence with `unlockedWords` deck size and clickable rows in the Lifetime Stats modal.
- [x] **v4.0 Cosmetic Armory & Atmospheric Flow Engine:**
  - *6 Full Themes:* OLED Cyan, Sakura Stream, Phosphor CRT, Cyberpunk Neon, Nord Frost, Obsidian Gold.
  - *6 Flow FX Atmospheres:* Adaptive Resonance, Prismatic Aurora, Cyberpunk Grid, Solar Flame / Inferno, Hyperdrive Speedlines, Zen Trance.
  - *5 Caret Geometries:* Line, Low-Profile Runner (full-width underline), Classic Terminal (full-coverage block), Capsule, and Permanent Prism.
  - *6 Caret FX Modifiers:* Clean Solid, Prismatic Rainbow, Plasma Overdrive, Solar Flare, Holo Glitch, and Hyperdrive Tracer.
  - *4 Ghost Pacer Styles:* Ghost Line, Ghost Runner, Ghost Terminal, and Ghost Halo.
  - *5 Mechanical Switch Sound Packs:* Default Box Blue, Thoccy Linear, Tactile Brown, Typewriter Bell, and Bubble Droplet.
  - *Cosmetic Armory Drawer:* Tabbed modal interface with live preview cards, lock criteria, level/trophy gating, and instant equipment across all 6 slots.
  - *Dynamic Color Inheritance:* Universal `--main-color`, `--accent`, and `color-mix()` inheritance across all modals, buttons, sliders, levels, charts, and nests.
- [x] **v3.5 Achievements & Trophies System:**
  - *35 Distinct Achievements:* Speed milestones, cadence consistency, typo recoveries, sustained flow, apex overspin, egg hatching, and vocabulary lexicon goals (including the 1,000-word Crown Jewel).
  - *Two-Tier Progression:* Entry milestones and mastery tiers to reward dedication without idle spam.
  - *Micro-Toast Notification Queue:* Fixed top celebration pill with tier-specific sound synthesis and stats button pulse badge.
  - *Trophy Case Gallery:* Filterable modal gallery (All, Speed, Flow, Hatchery, Hidden, Feats) with live progress bars.
  - *Retroactive Save Synchronization:* Automatic historical evaluation of past tests on startup.
- [x] **Deterministic Egg Incubation:** Charge-based egg progression (`eggCharge` $0\text{--}100\%$) driven by clean on-pace words in Flow; hybrid under-track and dynamic glow aura.
- [x] **In-Situ Hatchery & Sandwiched Induction:** In-stride egg cracking (`e-g-g`) directly in the active slot; sandwich spawner (`createWordSandwich`) wrapping new words between launchpad and landing pad anchors.
- [x] **Contextual First-Egg Prompt:** Inline non-modal prompt (`tab: hatch` and `type 'egg' (tab: back)`) guiding players directly through their first crack cycle without intrusive popups.
- [x] **Apex Cushion Buffer:** Overcharging into 100%–120% momentum absorbs pacing stumbles (-8% instead of -12%) and protects flow threshold against single errors.
- [x] **Hidden (HD) Look-Ahead Mode (Char & Word Vanish):**
  - *Character Horizon:* Two-phase square-root blindfold mask (`getBlindfoldMask`), 4-step quantized opacity horizon (`getHiddenOpacity`), and combo-scaled look-ahead fading.
  - *Word Vanish:* Full-word progressive vanish scaling with word streak, adjustable lookahead (1 to 6 words), and instant safety brake on errors.
  - *Bonus Rewards:* +15% XP bonus on all words completed in Hidden Mode.
- [x] **Ghost Cursor Pacer (Visual Rhythm Rabbit):** Toggleable header button with dedicated speed slider (15–150 WPM), smooth subpixel caret pacing, 0.6s inactivity fade, 1.2s instant snap reset, decoupled backspacing, and local storage persistence.
- [x] **Pitch-Scaled Audio Ticks:** Synthesized Web Audio API mechanical key clicks scaling smoothly in pitch along chromatic semitones ($2^{n/12}$) as combo streak climbs.
- [x] **Telemetry & Word Boundary Accounting:** Spacebar keystroke accounting (divisor of 5 chars/word), double-counted extra char elimination, cadence timer preservation on word reversion, and $O(M + N)$ error history aggregation.
- [x] **Responsive Header Layout & Tool Wrapping:** Right-aligned `.header-actions` wrapping with `.header-tool-group` containers, preventing UI clipping when Ghost and Hidden mode sliders are simultaneously active.
