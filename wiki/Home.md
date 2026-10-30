# ⚡ TypeFlow Wiki

Welcome to the official **TypeFlow Wiki**—a multi-page technical and design encyclopedia covering TypeFlow's game mechanics, biomechanical word scoring, mathematical models, and file-by-file software architecture.

---

## 🧭 Documentation Map

TypeFlow's documentation is split into three layers:
1. **[`README.md`](../README.md)** — Quick-start guide, feature overview, keyboard shortcuts, and build/test commands.
2. **[`DESIGN.md`](../DESIGN.md) & [`ROADMAP.md`](../ROADMAP.md)** — Global grounding vision document and upcoming feature roadmap.
3. **This Wiki (`wiki/`)** — Deep-dive reference pages explaining **how every mechanic works**, **the design philosophy behind why it was built that way**, and **what every file in the codebase does**.

---

## 📚 Wiki Pages

| Wiki Page | What It Covers |
| :--- | :--- |
| **[1. Core Mechanics & Flow Physics](./Core-Mechanics-and-Flow-Physics.md)** | Why TypeFlow starts at Ground Zero (`"the"`), the `0%–120%` Flywheel & Apex Cushion math, calibrated inter-word cadence WPM, deterministic egg incubation, in-situ `e-g-g` hatching, Flow State Recap (`;;`), 60fps Ghost Pacer, and Hidden Horizon modes. |
| **[2. Lexicon, Biometrics & SRS Engine](./Lexicon-Biometrics-and-SRS.md)** | How the 1,000-word lexicon is ordered, why "Top 200" vs. "1,000-word" distributions feel different, the 5 physical finger-motion buckets, the EMA `BigramLedger`, Spaced Repetition (SRS) scheduling, and `[Anchor, New, Anchor]` word sandwiches. |
| **[3. Architecture & File-by-File Guide](./Architecture-and-File-Guide.md)** | A complete map of every file in `src/`, `scripts/`, `tests/`, and `build.py`—explaining the Event-Driven MVC pattern, why there are zero npm runtime dependencies, and how `build.py` compiles the modular source into a single portable `index.html`. |
| **[4. Progression, Achievements & Cosmetics](./Progression-Achievements-and-Cosmetics.md)** | Player leveling curves, the 35-trophy Achievement Engine, the 6-slot Cosmetic Armory (OLED themes, Flow FX atmospheres, carets, ghost pacers), and procedural Web Audio API switch synthesis. |

---

## 💡 Core Design Philosophy at a Glance

1. **Hands Never Leave the Home Row:** Every interaction—typing, hatching eggs (`Tab` + `e-g-g`), toggling the Flow Recap (`;;`), and restarting (`Tab` / `Enter`)—happens directly on the keyboard without touching the mouse.
2. **Rotational Inertia Over Binary Streaks:** Traditional typing games punish a single hesitation or typo by wiping your entire streak to zero. TypeFlow models focus as a heavy flywheel (`0%–120%`) with an **Apex Cushion** (`100%–120%`) that absorbs minor stumbles so you stay in flow.
3. **Deliberate Biomechanical Practice:** Instead of random word soup, words are categorized by physical finger transitions and dynamically scheduled using your personal bigram speed/error ledger.
4. **Zero-Dependency Single-File Portability:** Developers work in clean, modular ES6 files (`src/`), while players get a single self-contained `index.html` that loads instantaneously offline or online.
