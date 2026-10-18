# TypeFlow ⚡ (OLED Edition & Flow Roguelike)

A clean, minimalist typing trainer and incremental roguelike game inspired by Monkeytype with a pure OLED Black & Electric Light Blue aesthetic.

## ✨ Game Modes & Core Features

### 1. ⏱️ Classic Mode (15s / 30s / 60s)
- **OLED Black & Light Blue Theme**: Pure `#000000` background for battery-saving OLED displays with vibrant `#38bdf8` light blue accents.
- **Accurate Real-Time Feedback**:
  - Live cursor tracking with subpixel precision that glides across words and lines as you type.
  - Character highlighting: correct (crisp white), incorrect (coral red), extra characters, and missed letters.
  - Multi-line deterministic row anchoring (maintains a clean 3-line viewport with zero line-jump glitches).
  - **Dynamic Error Clearance**: When you backspace to an errored word and fix the mistake, the red underline immediately clears.
- **Accidental Restart Protection**: Spacebar is strictly disabled from triggering the next test on the results screen, with an anti-buffering cooldown for trailing keystrokes.
- **Advanced Performance Analytics on Chart**:
  - **Cumulative Average WPM line** (solid electric cyan).
  - **Rolling 3-Second Pace line** (vibrant mint teal `#2dd4bf`) showing instantaneous speed spikes and dips.
  - **Raw WPM line** (muted dashed slate).
  - **Fixed vs. Unfixed Error Markers**: Green/emerald markers `#34d399` indicate errors you successfully fixed, while red markers `#f87171` indicate unfixed mistakes.
  - **Interactive Hover Tooltip & Header Stats**: Hover or tap points on the graph to inspect exact second, Average Speed, 3s Pace, Raw Speed, and Error Fix Status.
- **Persistent Lifetime Records**: Automatically saves Personal Bests (15s, 30s, 60s), total words typed, total keystrokes, and recent 15 test histories in browser `localStorage`. Click the 📊 bar chart icon in the header to view.

---

### 2. 🎮 Flow RPG Game Mode (Active Skill Building)
- **Ground Zero (1-Word Start)**:
  - You begin your journey with literally **1 word** (*"the"*).
  - Perfect for establishing rhythm, muscle memory, and a solid baseline pace.
- **Spaced Repetition System (SRS)**:
  - Memory and performance are tracked continuously per word.
  - Words with typos or typed below your Target WPM are heavily weighted to reappear frequently until mastered cleanly at pace.
  - Mastered words gradually decay in frequency to make room for new and challenging words.
- **Target WPM Goal Setting**:
  - Choose your target typing pace directly from the header pill (**30, 40, 50, 60, or 80 WPM**).
  - Paced typing at or above your goal drives streaks, multiplier bonuses, and egg discoveries.
  - When you drop below your target or take a pause, the screen enters a calm amber **Pace Paused** breathing state without punishing you.
- **Weighted "Flywheel" Flow State Engine (0%–120%)**:
  - Replaces rigid binary streak resets with a continuous, weighted **Rotational Inertia Reservoir**.
  - **Weighted Ramp-Up (~10 Words to 100%)**: Starting from zero has weight. Overcoming static friction starts at $+6.0\%$ on word 1 and smoothly accelerates to $+16.0\%$ as the wheel spins, taking ~10 clean words of moderate length to wind up to $100\%$ Max Flow.
  - **Apex Cushion (100%–120%)**: Once at $100\%$, continuing your cadence banks up to an extra $20\%$ over-spin buffer.
  - **Momentum at the Top (Stumble Damping)**: Hesitations at the top only drop $-10\%$. If you have banked cushion (e.g. $115\%$), a stumble drops you to $105\%$, keeping you at $\ge 100\%$ Max Flow ($3.0\times$) with your rainbow caret completely unbroken!
  - **Kinetic Resting Inertia (3.0s Grace Period)**: High rotational momentum takes longer to slow down. At $\ge 100\%$, decay waits for a full 3.0-second grace period before convex friction ($-3.5\%/\text{sec}$ gentle bleed) begins.
  - **60fps/120fps Continuous Analog Physics Ticker (`requestAnimationFrame`)**:
    - Smooth critically damped spring interpolation eliminates all stepped visual jumps.
    - **Continuous Focus Dimming**: Peripheral UI (logo, header, footer) dims continuously from $100\%$ down to $32\%$ via CSS variable `--focus-opacity` like an analog dimmer dial.
    - **Pre-Flow Caret Bloom ($85\%–99\%$)**: The cyan cursor radiates an intense cyan/magenta chromatic aura before locking into the full iridescent prism at $100\%$.
    - **Overdrive Badge Pulse**: Multiplier badge lightning bolt glows and pulses with energetic heartbeat when inside the $100\%–120\%$ cushion.
- **XP, Flow Multipliers & Level HUD**:
  - Every word typed rewards Base XP based on its tier:
    - **Common (#1–100)**: +10 Base XP
    - **Uncommon (#101–350)**: +25 Base XP
    - **Rare (#351–700)**: +60 Base XP
    - **Epic (#701–1000)**: +150 Base XP
  - Flow Momentum scales the multiplier seamlessly (1.0x $\rightarrow$ 1.2x $\rightarrow$ 2.0x $\rightarrow$ 2.5x $\rightarrow$ 3.0x max).
  - Header **Level HUD** displays your Level, Title (*Novice Typist*, *Rhythm Apprentice*, *Velocity Adept*, *Flow Master*, *Grandmaster of Keys*), and a smooth progress bar.
  - Leveling up triggers a triumphant fanfare and drops a **Guaranteed Bonus Egg**!
- **Flow Mistake Punishment (Typos ≠ Flow)**:
  - Uncorrected errors on <kbd>Space</kbd> immediately **wipe the 120% Apex Cushion down to 0**, inflict a **$-25\%$ momentum penalty**, extinguish the prismatic rainbow caret, reset consecutive clean words, and break streaks.
  - Keeps the focus on rhythm, accuracy, and flow mastery without allowing sloppy spamming.
- **In-Situ 3-Slot Egg Nest (Zero Modals, Hands on Keyboard)**:
  - Replaces detached modal popups with **3 physical nest slots directly on the active typing stage** (`#flow-gauge`).
  - **Hard Inventory Cap (Max 3 Eggs)**: Stops egg hoarding and keeps the focus on active typing. When all 3 slots are occupied (`[🥚][🥚][🥚]`), no more eggs will roll until a slot is cracked open.
  - **Keyboard-Native Hatching**:
    - Hit <kbd>Tab</kbd> anytime during flow to activate the nest.
    - Active egg focuses with a glowing prompt: `e g g`.
    - Type **`e`** (fracture wobble + crack sound), **`g`** (deep crack + wobble), **`g`** (shatter chime + word revealed!).
    - Hands never leave the home row, and zero popups interrupt your vision.
  - **Fluid Pending-Clear**:
    - Freshly cracked words show directly in the nest slot (`✨ [word]`).
    - The slot resets back to empty (`[ · ]`) automatically the moment you finish typing your first word on the board!
- **Mastery-Gated Egg Drop Rate (Earned Pacing)**:
  - Out of Flow ($< 100\%$ momentum): Egg drop chance is strictly **$0.0\%$**.
  - In Flow ($\ge 100\%$ momentum): Drop chance starts at **$0.5\%$** after 3 consecutive clean words, scaling by $+0.1\%$ per clean word up to a maximum of **$3.5\%$** (averaging 1 egg per ~35–45 clean words).
  - **Dynamic Rarity Shift (Progressive Curve)**: Common eggs dominate early (~85%), Uncommon is ~13%, Rare is ~1.8% (~7x rarer than Uncommon), and Epic is ~0.2%. As Common words are completed, Uncommon smoothly becomes the dominant drop (~80%), naturally advancing into Rare and Epic as tiers are completed.
- **Keybr-Inspired Touch-Typing Motor Buckets (Invisible Intelligence)**:
  - 100% real English words categorized across 5 distinct physical hand-motion buckets:
    - **Home Core Flow** (`T, H, E, A, O, I, N, S`): Baseline index/middle rhythm (*the, that, this, state, together*).
    - **Hand Alternators ⚡**: Strict Left $\leftrightarrow$ Right hand drumrolls (*hand, down, form, city, fuel, island*).
    - **Suffix Curls 🌀**: Smooth finger sweeps (*thing, right, night, action, question*).
    - **Lateral Reach 🎯**: Pinky and corner extensions (*word, very, have, place, family*).
    - **Double Bounce 💥**: Single-finger tap cadences (*see, good, look, call, little, keep*).
  - **Proficiency-Driven Egg Rolling (Deepen vs. Branch)**:
    - **Deepen (~75%)**: When your active pattern is typed cleanly at/above Target WPM, eggs hatch longer, richer words sharing that familiar motor pathway.
    - **Branch (~25%)**: A rare discovery egg unlocks a **brand-new motor bucket**, introducing fresh finger coordination.
    - When developing rhythm, eggs reinforce accessible baseline words.
- **Keybr Motor Mastery Matrix & Active Deck Explorer (Stats Modal)**:
  - Accessible via the 📊 button in the header.
  - **Dual Tabs**: Seamlessly switch between `🎮 Flow RPG & Mastery` and `⏱️ Classic Records`.
  - **5-Pattern Neuromuscular Matrix**: Displays active status (`⚡ Flowing / Proficient`, `🌱 Developing`, `🔒 Undiscovered`), words unlocked, average burst speed, and clean hits across all 5 physical finger patterns.
  - **Active Deck Explorer**: Scroll through every unlocked word in your vocabulary, filter by motor bucket, and view spaced repetition health (⭐ Mastered, ⚡ In Flow, ⚠️ Needs Practice).
  - **Clean Board Reset**: Entering and exiting the Stats menu automatically resets the board to the first word, eliminating jarring mid-sentence pauses and weaving newly unlocked words into the stream.
  - **Instant Reset Option**: `Reset RPG ↺` button allows instant reset back to Ground Zero anytime.
- **Melodic Keyboard Audio & Persistence**:
  - Key clicks harmonically climb up musical semitones as your flow streak grows.
  - Crisp crack and sparkly shatter sound effects during egg hatching.
  - Sound preference toggle is persistently remembered across browser refreshes via `localStorage`.

---

## 🛠️ Project Structure & Building

```
lively-nobel/
├── index.html        # Standalone, self-contained bundle (runs directly in browser)
├── words.js          # 1,000 curated words ranked by frequency with tiers & economics
├── storage.js        # Persistent localStorage manager for records & game saves
├── style.css         # OLED Black theme & responsive UI styling
├── app.js            # Typing engine, velocity calculator, chart & shop controller
├── build.py          # Python bundling script that outputs index.html
└── README.md         # Documentation
```

### Rebuilding `index.html`
Whenever you edit `words.js`, `storage.js`, `style.css`, or `app.js`, re-bundle with:
```bash
python3 build.py
```

### Running Locally
You can open [index.html](file:///storage/emulated/10/Documents/anitone/antigravity/lively-nobel/index.html) directly in any browser (self-contained, Android `content://` compatible), or start a local server:
```bash
python3 -m http.server 8080
```
and visit `http://localhost:8080`.
