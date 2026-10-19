/**
 * TypeFlow - NestView
 * Passive View for the 3-Slot In-Situ Egg Nest & Hatchery.
 * Renders egg glyphs, progressive fracture prompts ("e", "g", "g"),
 * revealed hatched word badges, wobble animations, and contextual hints.
 * Zero business logic.
 */

class NestView {
  constructor(elements = {}) {
    this.eggNest = elements.eggNest || (typeof document !== 'undefined' ? document.getElementById('egg-nest') : null);
    this.nestSlots = elements.nestSlots || (typeof document !== 'undefined' ? [
      document.getElementById('nest-slot-0'),
      document.getElementById('nest-slot-1'),
      document.getElementById('nest-slot-2')
    ] : []);
    this.nestHint = elements.nestHint || (typeof document !== 'undefined' ? document.getElementById('nest-hint') : null);
    this.incubationTrack = elements.incubationTrack || (typeof document !== 'undefined' ? document.getElementById('nest-incubation-track') : null);
    this.incubationFill = elements.incubationFill || (typeof document !== 'undefined' ? document.getElementById('nest-incubation-fill') : null);
  }

  /**
   * Binds click and interaction events for nest slots.
   * @param {Object} handlers - Event handlers { onSlotClick }
   */
  bindEvents(handlers = {}) {
    if (this.nestSlots && Array.isArray(this.nestSlots)) {
      this.nestSlots.forEach((slotEl, slotIdx) => {
        if (!slotEl) return;
        slotEl.addEventListener('click', () => {
          if (typeof handlers.onSlotClick === 'function') {
            handlers.onSlotClick(slotIdx);
          }
        });
      });
    }
  }

  /**
   * Renders the 3 slots directly from the EggNestModel state.
   * @param {EggNestModel} nestModel
   */
  render(nestModel) {
    if (!this.nestSlots || this.nestSlots.length === 0 || !nestModel) return;

    for (let i = 0; i < 3; i++) {
      const slotEl = this.nestSlots[i];
      if (!slotEl) continue;

      slotEl.className = 'nest-slot';
      slotEl.removeAttribute('style');

      const status = nestModel.getSlotStatus(i);

      if (status.state === 'revealed') {
        // Displays the freshly hatched word
        slotEl.classList.add('revealed-word');
        slotEl.innerHTML = `<span class="revealed-word-text">✨ ${status.data.word}</span>`;
        slotEl.title = `Hatched: ${status.data.word} • Clears on your next completed word`;
      } else if (status.state === 'occupied') {
        const egg = status.egg;
        slotEl.classList.add('has-egg');
        slotEl.style.setProperty('--slot-egg-color', egg.color || egg.tierColor || '#38bdf8');

        if (status.isFocused) {
          slotEl.classList.add('hatch-focused');
        }

        const typed = status.hatchTyped || '';
        const eClass = (status.isFocused && typed.length >= 1) ? 'typed' : 'untyped';
        const g1Class = (status.isFocused && typed.length >= 2) ? 'typed' : 'untyped';
        const g2Class = (status.isFocused && typed.length >= 3) ? 'typed' : 'untyped';

        slotEl.innerHTML = `
          <span class="egg-glyph">🥚</span>
          <div class="nest-crack-prompt" id="crack-prompt-${i}">
            <span class="p-e ${eClass}">e</span>
            <span class="p-g1 ${g1Class}">g</span>
            <span class="p-g2 ${g2Class}">g</span>
          </div>
        `;
        slotEl.title = `${egg.name || 'Egg'} • Type 'egg' to hatch`;
        slotEl.dataset.eggIndex = status.eggIndex;
      } else {
        // Empty slot
        slotEl.innerHTML = `<span class="slot-dot">·</span>`;
        slotEl.title = 'Empty Nest Slot (Max 3)';
      }
    }

    this.updateHint(nestModel.isHatching(), nestModel.basket.length);
  }

  updateCrackPrompt(slotIdx, typed) {
    const prompt = (typeof document !== 'undefined') ? document.getElementById(`crack-prompt-${slotIdx}`) : null;
    if (!prompt) return;

    const pe = prompt.querySelector('.p-e');
    const pg1 = prompt.querySelector('.p-g1');
    const pg2 = prompt.querySelector('.p-g2');

    if (pe) pe.className = `p-e ${typed.length >= 1 ? 'typed' : 'untyped'}`;
    if (pg1) pg1.className = `p-g1 ${typed.length >= 2 ? 'typed' : 'untyped'}`;
    if (pg2) pg2.className = `p-g2 ${typed.length >= 3 ? 'typed' : 'untyped'}`;
  }

  triggerWobble(slotIdx, stage = 1) {
    const slotEl = this.nestSlots[slotIdx];
    if (!slotEl) return;

    slotEl.classList.remove('wobble-1', 'wobble-2');
    // Force CSS reflow for instant retrigger
    void slotEl.offsetWidth;
    slotEl.classList.add(stage === 2 ? 'wobble-2' : 'wobble-1');
  }

  triggerErrorShake(slotIdx) {
    const slotEl = this.nestSlots[slotIdx];
    if (!slotEl) return;

    slotEl.classList.add('wobble-1');
    setTimeout(() => {
      slotEl.classList.remove('wobble-1');
    }, 200);
  }

  updateHint(isHatching, eggCount) {
    if (!this.nestHint) return;

    if (isHatching) {
      this.nestHint.classList.add('visible');
      this.nestHint.textContent = "type 'egg' (tab: back)";
    } else if (eggCount > 0) {
      this.nestHint.classList.add('visible');
      this.nestHint.textContent = 'tab: hatch';
    } else {
      this.nestHint.classList.remove('visible');
    }
  }

  /**
   * Updates deterministic egg incubation under-track progress and ambient aura glow.
   * @param {number} chargePct - Incubation progress (0.0 to 100.0)
   * @param {string} comboTier - Active combo streak tier ('baseline', 'heated', 'overdrive', 'transcendence')
   * @param {boolean} isFull - Whether all 3 egg slots are currently occupied
   */
  updateIncubation(chargePct = 0, comboTier = 'baseline', isFull = false) {
    if (this.incubationFill) {
      const pct = isFull ? 0 : Math.min(100.0, Math.max(0.0, Number(chargePct) || 0));
      this.incubationFill.style.width = `${pct}%`;
    }
    if (this.eggNest) {
      this.eggNest.classList.toggle('nest-full', Boolean(isFull));
      const isCharging = !isFull && chargePct > 0;
      this.eggNest.classList.toggle('charging', isCharging);
      const isHighCombo = isCharging && (comboTier === 'overdrive' || comboTier === 'transcendence');
      this.eggNest.classList.toggle('high-combo', isHighCombo);
      const glowIntensity = Math.min(1.0, Math.max(0.1, (chargePct / 100.0))).toFixed(2);
      this.eggNest.style.setProperty('--nest-glow', glowIntensity);
    }
  }

  /**
   * Triggers the celebratory materialize animation when an egg finishes incubating.
   */
  triggerMaterialize() {
    if (!this.eggNest) return;
    this.eggNest.classList.remove('materialize');
    void this.eggNest.offsetWidth; // force CSS reflow
    this.eggNest.classList.add('materialize');
    setTimeout(() => {
      if (this.eggNest) this.eggNest.classList.remove('materialize');
    }, 600);
  }
}

if (typeof window !== 'undefined') {
  window.NestView = NestView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NestView };
}
