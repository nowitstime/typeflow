# ⚙️ Core Mechanics & Flow Physics

[**← Back to Wiki Home**](./Home.md)

This page documents the design rationale and mathematical formulas behind TypeFlow's two primary modes (**Flow RPG Mode** and **Classic Mode**) and its real-time training modifiers.

---

## 1. Why "Ground Zero" Starts with 1 Word (`"the"`)

Most typing trainers throw 200 to 1,000 words at a player on second zero. When you are trying to build clean neuromuscular rhythm, cognitive overload from unfamiliar word shapes causes micro-hesitations before your fingers even move.

TypeFlow starts a new save at **Ground Zero** (`Level 1`, unlocked lexicon = `["the"]`):
- With only `"the"` on stage, reading overhead drops to zero.
- The player immediately experiences what it feels like to hit target cadence, spin the momentum flywheel up to `100%`, charge their first Egg, press <kbd>Tab</kbd>, and type `e-g-g` to hatch their second word.
- Every subsequent word added to the deck is earned through sustained rhythm.

---

## 2. The Momentum Flywheel & Apex Cushion (`src/models/FlowModel.js`)

### Why a Flywheel Instead of a Combo Counter?
In traditional rhythm or typing games, a 100-word streak is binary: one mistyped character or a 0.5-second pause resets your multiplier to `0`. That binary punishment creates anxiety rather than flow state.

TypeFlow models concentration as a physical flywheel spinning between **`0.0%` and `120.0%`**:

| Zone | Range | Behavior & Meaning |
| :--- | :--- | :--- |
| **Spin-Up (Sub-Flow)** | `0% – 84%` | Building rotational inertia. Clean words accelerate the wheel (~8–10 words from dead stop to Flow). |
| **Flow State** | `85% – 99%` | Active Flow State qualification begins at `85%`. Atmospheric borders and Flow Run telemetry start recording. |
| **Nominal Max Flow** | `100%` | Unlocks the `3.0×` XP multiplier, full Egg Incubation charging, and caret flow effects. |
| **Apex Cushion (Overspin)** | `100% – 120%` | A kinetic energy buffer above 100%. Absorbs minor pacing stumbles (`-8%` instead of `-12%`) and cushions single errors so your flow state isn't shattered by one slip. |

### Inter-Word Cadence WPM (Why Short Words Don't Cheat)
If you only measure typing speed from the first letter of a word to the last letter of that word, 2- and 3-letter words produce artificially inflated burst speeds (e.g., 180+ WPM) while hiding long pauses *between* words.

`FlowModel.js` measures the **full inter-word cycle** ($\Delta t_{\text{cycle}}$) from the completion of the previous word to the completion of the current word:

$$\Delta t_{\text{cycle}} = \max\left(0.20, \, \frac{t_{\text{now}} - t_{\text{lastWordEnd}}}{1000}\right)$$

$$\text{WordCadenceWPM} = \text{round}\left(\frac{\text{WordLength} + 1}{5} \times \frac{60}{\Delta t_{\text{cycle}}}\right)$$

$$\text{LiveWPM} = \text{round}\left(0.5 \times \text{WordCadenceWPM} + 0.5 \times \text{InstantaneousWPM}\right)$$

This guarantees that Flow Mode WPM matches Classic Mode timed WPM and rewards smooth transitions across spaces.

---

## 3. Deterministic Egg Incubation & In-Situ Hatching (`src/models/EggNestModel.js`)

### Why Deterministic Charge Replaced Pure RNG
Early prototypes rolled a random percentage chance to drop an egg on each word in Flow. Pure RNG meant a player could type 40 clean words at 100% Flow and get nothing, breaking the feedback loop.

Instead, `FlowModel.js` uses a deterministic **`eggCharge` (`0% – 100%`)** bar underneath the stage:
- Every clean, on-pace word while at `100%+` Flow adds base charge (`+12%`).
- **Streak Surges:** Consecutive clean words grant bonus charge (`+4%` at 5+, `+8%` at 10+, `+12%` at 15+).
- **Apex & Velocity Bonuses:** Operating in the `100%–120%` Apex Cushion or exceeding `1.25×` Target WPM accelerates incubation further.
- At `100%` charge, an egg deterministically spawns into the 3-slot Nest (`Common`, `Uncommon`, `Rare`, or `Epic`).

### Hands-on-Home-Row Hatching (`Tab` + `e-g-g`)
To keep the player's hands on the keyboard:
1. Pressing <kbd>Tab</kbd> shifts focus from the typing stage to the first occupied Egg slot in `NestView.js`.
2. Typing **`e` → `g` → `g`** physically cracks the shell in three stages (with rising acoustic fractures) and reveals the new word.
3. Once hatched, pressing <kbd>Tab</kbd> (or hatching the final egg) returns focus straight to the typing stream and weaves the newly unlocked words into the upcoming deck.

---

## 4. Flow State Performance Recap (`;;` & 7s AFK Dissolve)

In Classic Mode, a timer expires and shows `#results-section`. In Flow Mode, typing is endless—so how do you inspect a great Flow streak without a disruptive popup?
- **Qualification (`>= 85%` Start, `>= 50%` Floor):** A Flow Run begins recording when momentum reaches `85%`. To prevent a single mid-run hiccup from cutting a long graph in half, the run stays alive as long as momentum stays at or above a lenient **`50%` continuation floor**, saving only if the run lasted `>= 5 seconds` and `>= 3 clean words`.
- **Contextual Pill & `;;` Shortcut:** A compact pill appears beside the Egg Nest (`Flow: 72 WPM • Peak 89 [;;]`). Double-tapping semicolon (`;;` within 400ms) toggles the full WPM/Flow timeline chart without leaving the home row (single `;` is suppressed during word typing so it never causes a typo).
- **7s AFK Crossfade & Zero-Friction Wake:** If you take your hands off the keyboard for 7 seconds after a qualifying Flow Run ends, the stage smoothly crossfades into the Flow Recap chart. Typing *any* letter immediately dismisses the chart and types that character directly into the first letter of the active word.

---

## 5. Advanced Training Modifiers

### 👻 60fps Ghost Cursor Pacer (`StageView.js`)
- A visual rhythm rabbit that glides across characters at your exact configured Ghost WPM (`15–150 WPM`) using `requestAnimationFrame` subpixel interpolation.
- **Why it helps:** Instead of glancing up at a numeric WPM counter (which pulls your eyes away from the text), peripheral vision tracks the Ghost Caret right alongside your own caret.

### 🕶️ Hidden Horizon (`Char` & `Words: 1–6`)
Trains two distinct cognitive layers of touch-typing:
1. **Character Horizon (`Char`):** Masks characters immediately around the caret with a progressive opacity curtain that tightens as your combo climbs—forcing pure finger proprioception without visual confirmation.
2. **Word Vanish (`Words: 1–6`):** Keeps the current word and the next $N$ words visible while hiding the rest, or progressively vanishes words behind a lookahead window—training your eyes to scan 2–3 words ahead while your fingers finish the current word.
- **Safety Brake:** Any typo immediately lifts the blindfold mask so you can orient yourself and recover without frustration.
