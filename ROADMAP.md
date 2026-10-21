# TypeFlow — Future Development & Feature Roadmap

## Core Design Constraint
Every feature in this roadmap must preserve TypeFlow's core identity: **zero-dependency, single-file portability (~240 KB), and instant-load immediacy**. Any new mechanic, visual indicator, or onboarding cue must be lightweight, avoid intrusive modal pop-ups during active gameplay, and minimize HUD clutter.

---

## 1. Flow State Performance Recap & Timeline Graph (New)
Provide deep, retrospective insight into sustained Flow State runs without interrupting the kinetic typing flow.

### 1.1 Flow Run Detection & Retention
- **Flow Session Trigger:** Automatically record a "Flow Run" snapshot whenever the player sustains Flow ($\text{Momentum} \ge 85\%$) for at least **5 seconds** or **3+ consecutive words**.
- **Non-Intrusive Access:**
  - *In-Flow Stealth:* Never interrupt active gameplay with auto-modals when dropping out of Flow.
  - *Retrospective Inspection:* Surface an accessible "Last Flow Run" button/chip in the HUD or Stats modal (`[Flow Recap]`).
  - *Session Summary on Pause:* If the player pauses for $\ge 3$ seconds after a major Flow run or manually opens Stats, display the Flow run recap card.

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

## 2. Frictionless Onboarding & Calibration

New playtesters need seamless onboarding without intrusive tutorial pop-ups.

### 2.1 Initial WPM Target Calibration
- **Exploratory Calibration Options:**
  - *Option A (Guided 30s Classic Baseline):* Prompt first-time players to run a quick 30-second test, then automatically initialize their Flow Target WPM to 3–5 WPM below their baseline.
  - *Option B (Silent 10-Word In-Band Calibration):* Start new saves in an uncalibrated state for the first 10 words, compute median cadence WPM, and lock `targetWpm` with a gentle floating toast.
- **First-Time Pace Callout:** Briefly highlight the Pace slider once calibrated so the player understands how target pacing governs the flywheel.

### 2.2 Contextual First-Egg Prompt
- **One-Time Hatch Instruction:** When a player has only 1 unlocked word (`"the"`) and earns their very first egg, display a non-modal inline prompt (e.g., `Type "egg" to hatch`).
- **Auto-Dismiss:** Permanently retire the hint once the first egg is cracked.

---

## 3. UI Decluttering & Visual Polish

### 3.1 Active Typing Focus Dimmer
- **Zen Focus State:** Fade peripheral chrome (header navigation, mode tabs, stats bar, and footer) to low opacity (~20%) while actively typing.
- **Instant Wake:** Restore full brightness instantly upon backspacing, pausing for $\ge 1.5\text{s}$, or moving the mouse.

### 3.2 HUD Streamlining
- **Consolidate Target Displays:** Unify the header WPM indicator and the active Flow gauge slider so the player's eye has one unified anchor for pace telemetry.
- **Flow State Kinetic Transitions:** Polish visual feedback across tiers (subtle caret aura shifts, multiplier badge reactivity, and smooth camera/caret glide).

---

## 4. Training Modifiers & Scaffolding

### 4.1 Bigram Diagnostic View & Motor Heatmap
- **Surface Bigram Ledger in Stats:** Expose player's top 5 weakest and top 5 strongest bigrams from `BigramLedger`.
- **Motor Pattern Recommendations:** Suggest targeted practice words or confidence drills based on specific weak transitions (e.g., `th`, `ou`, `er`).

---

## 5. Balance, Physics & Ergonomics Tuning

### 5.1 Flywheel Momentum Balance
- **Adaptive Idle Grace:** Scale the idle decay grace period dynamically based on `targetWpm` interval (at 100 WPM, words take ~300ms, while at 35 WPM they take ~1000ms).
- **Apex Cushion Buffer:** Soften edge-of-flow drops so overcharging into 100%–120% Apex cushion absorbs a single typo without immediately crashing below Flow threshold.

### 5.2 Audio Feedback Refinements
- **Pitch-Scaled Audio Ticks:** Modulate mechanical click pitch slightly as combo streak climbs to provide auditory reinforcement of rhythm acceleration.
- **Audio Volume Slider:** Add a dedicated volume percentage slider alongside the sound toggle.

---

## Completed Milestones (Shipped)
- [x] **Deterministic Egg Incubation:** Charge-based egg progression (`eggCharge` $0\text{--}100\%$) driven by clean on-pace words in Flow; hybrid under-track and dynamic glow aura.
- [x] **In-Situ Hatchery & Sandwiched Induction:** In-stride egg cracking (`e-g-g`) directly in the active slot; sandwich spawner (`createWordSandwich`) wrapping new words between launchpad and landing pad anchors.
- [x] **Hidden (HD) Look-Ahead Mode:** Two-phase square-root blindfold mask (`getBlindfoldMask`), 4-step quantized opacity horizon (`getHiddenOpacity`), continuous caret look-ahead fading, and 15% XP bonus.
- [x] **Telemetry & Word Boundary Accounting:** Spacebar keystroke accounting (divisor of 5 chars/word), double-counted extra char elimination, cadence timer preservation on word reversion, and $O(M + N)$ error history aggregation.
- [x] **Ghost Cursor Pacer (Visual Rhythm Rabbit):** Toggleable header button with dedicated speed slider (15–150 WPM), smooth subpixel caret pacing, 0.6s inactivity fade, 1.2s instant snap reset, backspace resync, and local storage persistence.
