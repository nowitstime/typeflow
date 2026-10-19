# TypeFlow — Future Development & Feature Roadmap

## Core Design Constraint
Every feature in this roadmap must preserve TypeFlow's core identity: **zero-dependency, single-file portability (~220 KB), and instant-load immediacy**. Any new mechanic, visual indicator, or onboarding cue must be lightweight, avoid intrusive modal pop-ups, and minimize HUD clutter.

---

## Phase 1: Flow State Rebalance & Egg Incubation

### 1.1 Deterministic Egg Incubation (Replacing Pure RNG)
Currently, egg drops rely on a hidden dice roll inside Apex Flow, leaving players unsure why or when an egg will appear. Moving to a charge-based incubation system makes progression tangible while keeping the reward tied to sustained Flow.
- [x] **Flow-Driven Charge (`eggCharge`):** Accumulate egg progress (`0–100%`) as the player completes clean, on-pace words in Flow State ($\text{Momentum} \ge 100\%$). Base gain ($+3.0\%$) scales with streak combo tiers ($+4.0\%$, $+5.0\%$, $+6.5\%$), Apex cushion ($+1.0\%$), and speed surge ($+1.0\%$) up to $+8.5\%$ per word (~12 clean words per egg in peak flow). Mistake penalties ($-12\%$ on typo, $-3\%$ on sub-pace) and idle decay ($-2.5\%/\text{sec}$) balance the curve.
- [x] **Visual Indicator (Hybrid Under-Track & Dynamic Aura):** 
  - *Primary Indicator:* An ultra-minimalist 2.5px cyan/mint under-track integrated along the bottom edge of the `#egg-nest` container.
  - *Ambient Aura:* Dynamic cyan glow and high-combo pulse (`--nest-glow`) on the egg nest container that scales in intensity with charge and flashes on egg birth.

### 1.2 Post-Hatch Flow & Transition Behavior (Open Design Question)
Evaluating how hatching an egg (`Tab` → `"egg"`) interacts with the active typing session and Flow state:
- [ ] **Evaluate Reset vs. Continuation:**
  - *Path A (Keep Board Reset, Carry Over Bonus):* Keep the clean board reset after hatching so the newly unlocked word is freshly generated into a clean paragraph, **but** reward the `"egg"` hatch with XP, streak credit, or a "Warm Start" Flow boost so the player doesn't feel penalized for hatching.
  - *Path B (In-Stride Continuation):* Do not reset the board on hatch; pause timers while in the nest and splice the newly hatched word into the upcoming stream.
- [ ] **Make Typing `"egg"` Rewarding:** Regardless of whether the board resets, typing `"egg"` should count as a positive action (granting a small XP pop, incrementing word count, or feeding into Flow).

### 1.3 Error & Backspace Tuning
- [ ] **Apex Cushion Protection:** Adjust the error penalty math so overcharging into the 100%–120% Apex cushion absorbs a stumble rather than clamping back to 100% before subtracting the penalty.
- [ ] **Corrected Typo Grace:** Evaluate softening the pace penalty when a player backspaces and fixes a typo so self-correction doesn't double-penalize both speed and momentum.

---

## Phase 2: Frictionless Onboarding & Calibration

New playtesters need guidance on two things—setting their initial WPM pace and knowing how to hatch an egg—without slowing down startup with tutorial pop-ups.

### 2.1 Initial WPM Target Calibration
- [ ] **Explore Calibration Flows:**
  - *Option A (Guided 30s Classic Baseline):* Prompt first-time players to run a quick 30-second test, then automatically set their Flow Target WPM to a few WPM below their 30s score.
  - *Option B (Silent 10-Word In-Band Calibration):* Start new saves in an uncalibrated state for the first ~10 words, measure their natural median speed, and auto-lock `targetWpm` slightly below that baseline with a quick floating toast.
- [ ] **First-Time Pace Callout:** Briefly highlight the Pace control once calibrated so the player knows where to adjust it manually later.

### 2.2 Contextual First-Egg Prompt
- [ ] **One-Time Hatch Instruction:** When a player has only 1 unlocked word (`"the"`) and earns their very first egg, display a clear, non-modal inline prompt (e.g., `Press [TAB] then type "egg" to hatch`).
- [ ] **Auto-Dismiss:** Permanently retire the prompt once the player successfully hatches their first egg.

---

## Phase 3: UI Decluttering & Visual Polish

### 3.1 Reducing Screen Noise
- [ ] **Active Typing Focus Dimmer:** Fade peripheral UI (header, mode tabs, footer) to low opacity while the player is actively typing, restoring full brightness on pause or mouse movement.
- [ ] **Audit HUD Redundancy:** Consolidate overlapping pace/target WPM displays between the top header bar and the active Flow gauge bar so the eye only has one place to check.

### 3.2 Flow State Visual Upgrade
- [ ] **Escalate Visual Feedback Across Tiers:** Make the transition from Sub-Flow → Flow (85%) → Apex (100%+) feel more distinct and kinetic (caret states, multiplier badge reactivity, and smoother caret glide transitions).

---

## Phase 4: High-Speed Training Modifiers (Level Unlocks)

Optional, toggleable modifiers unlocked via RPG level-ups to help players push past the 70–100+ WPM plateau.

### 4.1 "Hidden" (HD) Look-Ahead Mode (osu!mania Inspired)
Designed to train saccadic look-ahead (reading 1–2 words ahead of what the fingers are currently typing).
- [ ] **Progressive Fade Wave:** As the player's streak climbs, smoothly fade out characters/words ahead of the caret so the player must read further down the line before the text disappears.
- [ ] **Smooth CSS Opacity Transitions:** Ensure letters fade out gradually (`transition: opacity`) rather than snapping invisible abruptly.
- [ ] **Fade Granularity Prototyping:** Test whether a continuous character-distance gradient (with a feathered edge) or whole-word progressive fading feels more natural to read at high WPM.
- [ ] **Error Recovery:** Immediately reveal mistyped characters in red and retract the hidden horizon when a streak breaks so the player can recover rhythm.

### 4.2 Ghost Caret Pacer
- [ ] **Visual Pace Rabbit:** Add a secondary, translucent ghost caret that glides across the text at the player's `targetWpm`.
- [ ] **Nest & Hatch Pause:** Automatically pause the ghost caret whenever the player presses `Tab` to enter the egg nest so hatching never causes the player to lose to the ghost.

### 4.3 Progression Integration
- [ ] **Unlockable Modifier Toggles:** Introduce Ghost Caret and Hidden Mode as mid-level RPG unlocks (with a small bonus XP multiplier when toggled on) rather than forcing them on by default.
