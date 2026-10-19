# TypeFlow ⚡ v3.0 (Flow RPG & OLED Edition)

> 🚀 **Play Live in Browser:** [https://nowitstime.github.io/typeflow/](https://nowitstime.github.io/typeflow/)  
> 📦 **GitHub Repository:** [https://github.com/nowitstime/typeflow](https://github.com/nowitstime/typeflow)  
> 🧪 **Test Suite:** 67 / 67 Tests Passing (100% Pass Rate)

A clean, minimalist typing trainer and kinetic flow RPG inspired by Monkeytype and Keybr, crafted with an OLED True Black & Electric Sky Blue aesthetic. 

TypeFlow pairs high-precision typing ergonomics with a rhythmic, incremental roguelike progression engine. Players begin at **Ground Zero with a single word (*"the"*)** and progressively unlock a curated deck of the **1,000 most common English words** categorized by physical touch-typing motor patterns.

---

## ✨ Game Modes & Core Features

### 1. ⏱️ Classic Mode (15s / 30s / 60s)
- **Natural Frequency Power-Law Sampling**: Draws words from the top 1,000 common English vocabulary using a calibrated power distribution ($P(r) \propto 1 / (r + 5)^{0.75}$), guaranteeing a rich, natural distribution rather than skewing solely to the first few words.
- **Full Word Revert & Dynamic Error Clearance**:
  - Hit <kbd>Backspace</kbd> at the start of a word to navigate back across word boundaries into previously submitted words.
  - Fix typos or missed characters in previous words; upon re-submitting, the red error underline dynamically clears!
- **Accurate Real-Time Feedback**:
  - Live cursor tracking with subpixel precision that glides across words and lines as you type.
  - Character highlighting: correct (crisp white), incorrect (coral red), extra characters, and missed letters.
  - Deterministic 3-line row anchoring that maintains viewport stability with zero line-jump glitches.
- **Accidental Restart Protection**:
  - Spacebar is strictly prevented from triggering new tests on the results screen.
  - Includes an anti-buffering cooldown for trailing keystrokes.
- **Advanced Performance Analytics on Chart**:
  - **Cumulative Average WPM line** (solid electric cyan `#38bdf8`).
  - **Rolling 3-Second Pace line** (vibrant mint teal `#2dd4bf`) showing instantaneous speed surges and dips.
  - **Raw WPM line** (muted dashed slate).
  - **Fixed vs. Unfixed Error Markers**: Emerald markers (`#34d399`) denote mistakes you successfully backspaced and fixed; coral markers (`#f87171`) denote unfixed errors.
  - **Interactive Hover Tooltip & Header Stats**: Hover or tap points on the graph to inspect exact second, Average Speed, 3s Pace, Raw Speed, and Error Fix Status.
- **Persistent Lifetime Records**: Automatically saves Personal Bests (15s, 30s, 60s), total words typed, total keystrokes, and recent test histories in browser `localStorage`. Click the 📊 bar chart icon in the header to view.

---

### 2. 🎮 Flow RPG Game Mode (Active Skill Building)
- **Ground Zero (1-Word Start)**:
  - You begin your journey with literally **1 word** (*"the"*).
  - Eliminates overwhelm and establishes baseline rhythm, hand placement, and cadence.
- **Word Revert Across Boundaries**:
  - Full backspace navigation into previous completed words is supported in Flow Mode, allowing you to salvage stumbles before submitting.
- **Spaced Repetition System (SRS)**:
  - Memory and performance are tracked continuously per word.
  - Words with typos or typed below Target WPM reappear frequently until mastered cleanly at pace.
  - Mastered words gradually decay in frequency to make room for new vocabulary.
- **Granular Target WPM Difficulty Control**:
  - **Analog OLED Slider**: Adjust your target pace from **15 to 120 WPM** with single-WPM precision.
  - **Direct Number Input Box**: Type custom values beyond 120 WPM (up to 300 WPM) with bidirectional sync.
  - **Keystroke Isolation**: Typing inside the target input box cleanly isolates keys without triggering board inputs.
- **Calibrated Cadence Pace Formula**:
  - Computes pace across the full inter-word cycle ($\Delta t_{\text{cycle}} = \max(0.20, (t_{\text{now}} - t_{\text{lastWordEnd}})/1000)$), penalizing hesitation between words and preventing artificial speed inflation on short words.
- **Weighted "Flywheel" Flow State Engine (0%–120%)**:
  - **Analog Rotational Inertia**: Replaces rigid binary streak resets with continuous momentum.
  - **Weighted Ramp-Up (~10 Words to 100%)**: Starts at $+6.0\%$ on word 1 and smoothly accelerates to $+16.0\%$ as the wheel spins.
  - **Apex Cushion (100%–120%)**: Continuing your cadence banks an extra $20\%$ over-spin buffer.
  - **Stumble Damping**: Hesitations at the top only drop $-8\%$. If you have banked cushion (e.g. $115\%$), a stumble drops you to $107\%$, keeping you at $\ge 100\%$ Max Flow with your rainbow caret unbroken!
  - **Kinetic Resting Inertia (3.0s Grace Period)**: At $\ge 100\%$, decay waits for a full 3.0-second grace period before convex friction ($-3.5\%/\text{sec}$ gentle bleed) begins.
  - **Continuous Analog Physics Ticker (`requestAnimationFrame`)**:
    - Smooth critically damped spring interpolation eliminates stepped visual jumps.
    - **Continuous Focus Dimming**: Peripheral UI dims continuously from $100\%$ down to $32\%$ via `--focus-opacity` like an analog dimmer dial.
    - **Pre-Flow Caret Bloom ($85\%–99\%$)**: Cyan cursor radiates an intense cyan/magenta chromatic aura before locking into the full iridescent prism at $100\%$.
    - **Overdrive Badge Pulse**: Multiplier badge lightning bolt pulses with energetic heartbeat inside the $100\%–120\%$ cushion.
- **XP, Flow Multipliers & Level HUD**:
  - Every word typed rewards Base XP based on its tier:
    - **Common (#1–100)**: +10 Base XP
    - **Uncommon (#101–350)**: +25 Base XP
    - **Rare (#351–700)**: +60 Base XP
    - **Epic (#701–1000)**: +150 Base XP
  - Flow Momentum scales the multiplier seamlessly (1.0x $\rightarrow$ 1.2x $\rightarrow$ 2.0x $\rightarrow$ 2.5x $\rightarrow$ 3.0x max).
  - Header **Level HUD** displays Level, Title (*Novice Typist*, *Rhythm Apprentice*, *Velocity Adept*, *Flow Master*, *Grandmaster of Keys*), and smooth progress bar.
  - Leveling up triggers a triumphant fanfare and drops a **Guaranteed Bonus Egg**!
- **Flow Mistake Punishment (Typos ≠ Flow)**:
  - Uncorrected errors on <kbd>Space</kbd> immediately wipe the Apex Cushion to 0, inflict a **$-25\%$ momentum penalty**, extinguish the prismatic rainbow caret, and reset clean word streaks.
- **In-Situ 3-Slot Egg Nest (Zero Modals, Hands on Home Row)**:
  - Replaces detached modal popups with **3 physical nest slots directly on the active typing stage** (`#flow-gauge`).
  - **Hard Inventory Cap (Max 3 Eggs)**: Stops egg hoarding. When all 3 slots are occupied (`[🥚][🥚][🥚]`), no more eggs will roll until a slot is cracked open.
  - **Keyboard-Native Hatching**:
    - Hit <kbd>Tab</kbd> anytime during flow to activate the nest.
    - Active egg focuses with a glowing prompt: `e g g`.
    - Type **`e`** (fracture wobble + crack sound), **`g`** (deep crack + wobble), **`g`** (shatter chime + word revealed!).
    - Hands never leave the home row, and zero popups interrupt your vision.
    - Press <kbd>Tab</kbd> or <kbd>Esc</kbd> to return to active typing.
  - **Fluid Pending-Clear**: Freshly cracked words show directly in the nest slot (`✨ [word]`) and reset to empty automatically once you resume typing on the board.
- **Mastery-Gated Egg Drop Rate (Earned Pacing)**:
  - Out of Flow ($< 100\%$ momentum): Egg drop chance is strictly **$0.0\%$**.
  - In Flow ($\ge 100\%$ momentum): Drop chance scales from **$0.5\%$** to **$3.5\%$** with consecutive clean words.
  - **Dynamic Rarity Shift**: Common eggs dominate early (~85%). As Common words are completed, Uncommon smoothly becomes dominant (~80%), naturally advancing into Rare and Epic as tiers are completed.
- **Keybr-Inspired Touch-Typing Motor Buckets**:
  - 100% real English words categorized across 5 distinct physical hand-motion buckets:
    - **Home Core Flow** (`T, H, E, A, O, I, N, S`): Baseline index/middle rhythm (*the, that, this, state, together*).
    - **Hand Alternators ⚡**: Strict Left $\leftrightarrow$ Right hand drumrolls (*hand, down, form, city, fuel, island*).
    - **Suffix Curls 🌀**: Smooth finger sweeps (*thing, right, night, action, question*).
    - **Lateral Reach 🎯**: Pinky and corner extensions (*word, very, have, place, family*).
    - **Double Bounce 💥**: Single-finger tap cadences (*see, good, look, call, little, keep*).
- **Keybr Motor Mastery Matrix & Active Deck Explorer (Stats Modal)**:
  - Accessible via the 📊 button in the header.
  - **Dual Tabs**: Seamlessly switch between `🎮 Flow RPG & Mastery` and `⏱️ Classic Records`.
  - **5-Pattern Neuromuscular Matrix**: Displays active status (`⚡ Flowing / Proficient`, `🌱 Developing`, `🔒 Undiscovered`), words unlocked, average burst speed, and clean hits across all 5 physical finger patterns.
  - **Active Deck Explorer**: Scroll through every unlocked word in your vocabulary, filter by motor bucket, and view spaced repetition health (⭐ Mastered, ⚡ In Flow, ⚠️ Needs Practice).
  - **Clean Board Reset**: Entering and exiting the Stats menu automatically resets the board to the first word, weaving newly unlocked words into the stream.
  - **Instant Reset Option**: `Reset RPG ↺` button allows instant reset back to Ground Zero anytime.
- **Melodic Keyboard Audio & Persistence**:
  - Key clicks harmonically climb up musical semitones as your flow streak grows.
  - Crisp crack and sparkly shatter sound effects during egg hatching.
  - Sound preference toggle is persistently remembered across browser refreshes via `localStorage`.

---

## 🏛️ Architecture & Codebase Design (v3.0)

TypeFlow v3.0 has undergone a complete architectural refactoring into a **decoupled Observable Model-View-Controller (MVC)** design with zero external runtime dependencies.

```
lively-nobel/
├── src/
│   ├── core/
│   │   ├── Constants.js          # Shared enums, tiers, thresholds & configuration
│   │   └── EventEmitter.js       # Lightweight publish/subscribe event bus
│   ├── models/
│   │   ├── WordsModel.js         # 1,000-word dictionary, Keybr motor buckets & SRS
│   │   ├── FlowModel.js          # Kinetic flywheel physics, momentum & XP multiplier
│   │   ├── SessionModel.js       # Autonomous keystroke engine & live metrics
│   │   └── EggNestModel.js       # 3-slot in-situ egg nest & hatching state machine
│   ├── services/
│   │   ├── StorageService.js     # Persistent localStorage with safe memory fallback
│   │   └── AudioService.js       # Web Audio API harmonic sound synthesizers
│   ├── views/
│   │   ├── StageView.js          # Passive DOM text stage, caret tracking & error styling
│   │   ├── NestView.js           # Physical 3-slot egg nest & fracture animations
│   │   ├── HUDView.js            # Atmosphere dimmer, level bar & pace controls
│   │   ├── ChartView.js          # Canvas analytics graph, pace curves & error markers
│   │   └── ModalView.js          # Lifetime stats, motor matrix & active deck view
│   ├── controllers/
│   │   ├── KeyboardController.js # Home-row key routing & hotkey mappings
│   │   └── GameController.js     # Orchestrator & dependency injection wiring
│   └── bootstrap.js              # Runtime instantiation & application lifecycle
├── tests/
│   ├── unit_models_test.js       # Pure headless unit tests for models & event bus
│   ├── services_test.js          # Storage fallback & audio service tests
│   ├── views_test.js             # View rendering & DOM-isolation tests
│   ├── controllers_test.js       # GameController state machine & event wiring tests
│   ├── edge_cases_stress_test.js # High-speed typing bursts & storage edge cases
│   └── recent_bugfixes_test.js   # Regression tests for timer, revert & deck views
├── build.py                      # Standalone compiler (bundles src/ into index.html)
├── index.html                    # Single-file distributable (browser & WebView ready)
├── style.css                     # OLED Black styling & responsive layouts
└── README.md                     # Documentation
```

### Key Architectural Principles
1. **Headless Models**: All business logic (keystroke evaluation, SRS weights, flywheel momentum physics, and egg cracking) lives in pure JavaScript models with zero DOM dependencies. Models are 100% testable in Node.js.
2. **Passive Views**: Views handle DOM rendering, canvas drawing, CSS transitions, and local element events, exposing clean semantic methods to the controller.
3. **Unidirectional Event Flow**: Components communicate via an `EventEmitter` pub/sub bus rather than direct tight coupling.
4. **Offline Resilience**: `StorageService` wraps `localStorage` in safe `try/catch` handlers with an automated in-memory fallback, allowing TypeFlow to run flawlessly inside sandboxed webviews, `file:///` URLs, and restricted Android `content://` providers.

---

## 🧪 Testing & Verification

TypeFlow features automated test suites covering pure logic, services, view isolation, controllers, and edge cases.

### Running Tests
Execute individual suites using Node.js:
```bash
# Run headless unit tests (Models & Event Bus)
node tests/unit_models_test.js

# Run services tests (Storage & Audio)
node tests/services_test.js

# Run view isolation tests
node tests/views_test.js

# Run controller lifecycle tests
node tests/controllers_test.js

# Run stress & edge case tests
node tests/edge_cases_stress_test.js

# Run recent regression bug fixes test suite
node tests/recent_bugfixes_test.js
```

Or run all 6 suites at once:
```bash
for test in tests/*_test.js; do node "$test"; done
```

**Current Suite Status:** `67 / 67 tests passing (100%)`.

---

## 🛠️ Building & Bundling

TypeFlow compiles from modular ES6 source files into a **zero-dependency, single-file `index.html`** that runs anywhere without an npm/Node build step.

### Rebuilding `index.html`
Whenever you modify files in `src/` or `style.css`, rebuild the distributable:
```bash
python3 build.py
```
This script combines `style.css` and all 16 modules from `src/` into `index.html`.

### Running Locally
You can open `index.html` directly in any web browser or start a local HTTP server:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Context | Action |
|---|---|---|
| <kbd>Char</kbd> | Typing Stage | Type character / advance cursor |
| <kbd>Space</kbd> | Typing Stage | Submit word and evaluate accuracy |
| <kbd>Backspace</kbd> | Typing Stage | Delete character or backspace across word boundary into previous word |
| <kbd>Tab</kbd> | Active Flow Mode | Focus active egg in nest (Hatch Mode) |
| <kbd>e</kbd> <kbd>g</kbd> <kbd>g</kbd> | Egg Nest Active | Crack active egg and reveal word |
| <kbd>Tab</kbd> / <kbd>Esc</kbd> | Egg Nest Active | Exit Hatch Mode and return to active typing stage |
| <kbd>Tab</kbd> | Classic Mode | Quick-restart current test |
| <kbd>Esc</kbd> | Any Modal Open | Close Stats Modal or dialog |

---

## 📄 License
MIT License. Open source for typing enthusiasts and developers.
