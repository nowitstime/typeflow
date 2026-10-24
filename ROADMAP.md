# TypeFlow — Future Development & Feature Roadmap

## Core Design Constraint
Every feature in this roadmap must preserve TypeFlow's core identity: **zero-dependency, single-file portability (~290 KB), and instant-load immediacy**. Any new mechanic, visual indicator, or onboarding cue must be lightweight, avoid intrusive modal pop-ups during active gameplay, and minimize HUD clutter.

---

## 1. Flow State Performance Recap & Timeline Graph
Provide deep, retrospective insight into sustained Flow State runs without interrupting the kinetic typing flow.

### 1.1 Flow Run Detection & Retention
- **Flow Session Trigger:** Automatically record a "Flow Run" snapshot whenever the player sustains Flow ($\text{Momentum} \ge 85\%$) for at least **5 seconds** or **3+ consecutive words**.
- **Non-Intrusive Access:**
  - *In-Flow Stealth:* Never interrupt active gameplay with auto-modals when dropping out of Flow.
  - *Retrospective Inspection:* Surface an accessible "Last Flow Run" button/chip in the HUD or Stats modal (`[Flow Recap]`).
  - *Session Summary on Pause:* If the player pauses for $\ge 3\text{s}$ after a major Flow run or manually opens Stats, display the Flow run recap card.

### 1.2 Telemetry Metrics
- **Duration & Rhythm:** Total seconds spent inside sustained Flow and Apex.
- **Volume & Diversity:** Total words typed, total characters, and **count of unique vocabulary words** encountered during the streak.
- **Speed & Precision:** Average Flow WPM, peak instantaneous burst WPM, and accuracy percentage.
- **Streak & Momentum Peak:** Highest combo streak reached and maximum flywheel momentum ($85\% \to 120\%$).

### 1.3 Interactive Flow Timeline Graph
- **Dual-Trace Canvas:** Render a timeline graph similar to Classic Mode's post-test view:
  - *WPM Speed Curve:* Second-by-second rolling WPM.
  - *Flywheel Momentum Line:* Gradient trace showing progression from Cruise ($85\%$) into Apex ($100\%\text{--}120\%$).
- **Stumble & Error Markers:** Pinpoint exact seconds where typos, extra characters, or pacing dips occurred, highlighting fixed vs. uncorrected errors.

---

## 2. Achievements & Milestone Badges (New)
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

## 3. Level Progression Unlocks & Cosmetic Armory (New)
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

---

## 7. Balance, Physics & Audio Tuning

### 7.1 Adaptive Inertia Decay
- **Adaptive Idle Grace:** Scale the idle decay grace period dynamically based on `targetWpm` interval (at 100 WPM, words take ~300ms, while at 35 WPM they take ~1000ms).

### 7.2 Audio Volume Control
- **Master Audio Volume Slider:** Add a dedicated volume percentage slider alongside the sound toggle.

---

## Completed Milestones (Shipped)
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
