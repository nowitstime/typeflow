# 🏆 Progression, Achievements & Cosmetics

[**← Back to Wiki Home**](./Home.md)

This page documents how TypeFlow rewards long-term mastery through its **XP & Leveling Curve**, **35-Trophy Achievement System** (`src/models/AchievementsModel.js`), **6-Slot Cosmetic Armory** (`src/models/CosmeticsModel.js`), and **Procedural Audio Engine** (`src/services/AudioService.js`).

---

## 1. XP, Flow Multipliers & Player Leveling (`src/models/FlowModel.js`)

Every clean word completed in Flow RPG Mode awards Experience Points (XP) scaled by word tier, momentum, and active modifiers:
1. **Base Word Tier XP:** Rare and Epic words grant higher base XP than Common starter words.
2. **Flow Momentum Multiplier (`1.0×` to `3.0×`):** Reaching `100%` Flow triples XP gain, rewarding rhythmic consistency over frantic, error-prone mashing.
3. **Hidden Horizon Bonus (`+15%` XP):** Completing words with `Char` or `Word Vanish` active awards a 15% blind-typing mastery bonus.

Leveling up unlocks new Cosmetic Armory items and tracks your overall progression from Level 1 (Ground Zero) to Level 100+.

---

## 2. The 35-Trophy Achievement Engine (`src/models/AchievementsModel.js`)

TypeFlow includes **35 distinct achievements** organized into 5 categories inside the Trophy Case modal:

| Category | Count | Example Milestones & What They Test |
| :--- | :--- | :--- |
| **⚡ Speed** | 7 | Reaching 40, 60, 80, 100, 120, and 140+ WPM in timed trials or sustained flow. |
| **🌊 Flow** | 8 | Entering Flow for the first time, sustaining uninterrupted Flow for 30s/60s/120s/300s, and riding the `100%–120%` Apex Cushion. |
| **🥚 Hatchery** | 8 | Hatching your first egg, cracking Rare/Epic shells, and expanding your unlocked lexicon from 10 words up to all **1,000 words** (*Grand Lexicon*). |
| **🕶️ Hidden** | 6 | Completing clean streaks and high-WPM runs under `Character Horizon` and `Word Vanish` blindfolds. |
| **🎯 Feats** | 6 | Precision milestones such as 100 consecutive clean words, clutch typo recoveries, and marathon typing totals. |

### Non-Intrusive Micro-Toasts & Retroactive Sync
- **Micro-Toast Queue:** Unlocking a badge mid-run never pauses the game or steals keyboard focus. A sleek top pill (`✨ Achievement Unlocked!`) slides in with a synthesized chord while your fingers keep typing.
- **Retroactive Save Sync:** Whenever new achievements are added, `AchievementsModel.syncRetroactive()` inspects existing lifetime stats (`unlockedWords`, `bestWpm`, `totalWords`, `eggsHatched`) on boot and automatically awards any previously earned trophies.

---

## 3. The 6-Slot Cosmetic Armory (`src/models/CosmeticsModel.js`)

All visual and acoustic rewards are equipped in the **Cosmetic Armory** modal tab with live interactive preview cards.

### Slot 1: OLED Themes & Dynamic `color-mix()` Inheritance
- **6 Unlockable Palettes:** *OLED Cyan* (Lv 1), *Sakura Stream* (Lv 5), *Phosphor CRT* (Lv 10), *Cyberpunk Neon* (Lv 15), *Nord Frost* (Lv 25), and *Obsidian Gold* (Lv 50).
- **How Theme Inheritance Works (`style.css`):** Switching a theme updates root CSS variables (`--bg-color`, `--main-color`, `--sub-color`, `--accent`). Every modal border, button glow, chart curve, and slider thumb uses `color-mix(in srgb, var(--main-color) ..., transparent)` so the entire UI adapts automatically without hardcoding per-theme CSS overrides.

### Slot 2: Flow FX Atmospheres
- **6 Viewport Effects (Active at `>= 85%` Flow):** *Adaptive Resonance*, *Prismatic Aurora*, *Cyberpunk Grid*, *Solar Flame / Inferno* (SVG `<feTurbulence>` displacement filter), *Hyperdrive Speedlines*, and *Zen Trance*.

### Slot 3 & Slot 4: Caret Geometries & Caret Flow Modifiers
- **Geometries (5):** *Line*, *Low-Profile Runner* (underline), *Classic Terminal* (block), *Capsule*, and *Permanent Prism*.
- **Flow Modifiers (6):** *Clean Solid*, *Prismatic Rainbow*, *Plasma Overdrive*, *Solar Flare*, *Holo Glitch*, and *Hyperdrive Tracer*.
- **Why Geometries and Modifiers are Decoupled:** Separating *shape* (Geometry) from *shader/particle behavior* (Modifier) lets players mix and match 30 combinations (e.g., an *Underline Runner* with *Solar Flare*, or a *Terminal Block* with *Holo Glitch*).

### Slot 5: Ghost Pacer Styles
- **4 Styles:** *Ghost Line*, *Ghost Runner*, *Ghost Wireframe Terminal*, and *Ghost Halo*—allowing you to visually distinguish the pace rabbit from your active caret at a glance.

### Slot 6: Procedural Mechanical Switch Sound Packs (`src/services/AudioService.js`)
- **5 Synthesized Switch Profiles:**
  1. **Default Box Blue:** Crisp high-frequency click transient.
  2. **Thoccy Linear:** Low-pass filtered bass thump modeling lubed linear switches in a gasket-mounted case.
  3. **Tactile Brown:** Warm mid-range bump transient.
  4. **Typewriter Bell:** Percussive mechanical striker with a subtle carriage chime every 20 words.
  5. **Bubble Droplet:** Sine-sweep pitch droplet for a calm, meditative soundscape.
