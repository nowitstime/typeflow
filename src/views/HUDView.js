/**
 * TypeFlow - HUDView
 * Passive View for all Heads-Up Displays:
 * Mode navigation tabs, Speedometer, Flow Momentum bar, Atmosphere Vignette,
 * RPG Level Card, Dual Target WPM Controls (slider + number input), and Floating XP Toasts.
 * Zero business logic.
 */

class HUDView {
  constructor(elements = {}) {
    // Header & Tabs
    this.tabClassic = elements.tabClassic || (typeof document !== 'undefined' ? document.getElementById('tab-classic') : null);
    this.tabFlow = elements.tabFlow || (typeof document !== 'undefined' ? document.getElementById('tab-flow') : null);
    this.classicDurationPill = elements.classicDurationPill || (typeof document !== 'undefined' ? document.getElementById('classic-duration-pill') : null);
    this.flowTargetPill = elements.flowTargetPill || (typeof document !== 'undefined' ? document.getElementById('flow-target-pill') : null);

    // Difficulty Controls (Slider & Granular Input)
    this.diffSlider = elements.diffSlider || (typeof document !== 'undefined' ? document.getElementById('diff-slider') : null);
    this.diffInput = elements.diffInput || (typeof document !== 'undefined' ? document.getElementById('diff-input') : null);
    this.targetItems = elements.targetItems || (typeof document !== 'undefined' ? document.querySelectorAll('.target-item') : []);

    // RPG Level Card
    this.levelHudCard = elements.levelHudCard || (typeof document !== 'undefined' ? document.getElementById('level-hud-card') : null);
    this.hudLevelBadge = elements.hudLevelBadge || (typeof document !== 'undefined' ? document.getElementById('hud-level-badge') : null);
    this.hudLevelTitle = elements.hudLevelTitle || (typeof document !== 'undefined' ? document.getElementById('hud-level-title') : null);
    this.hudXpRatio = elements.hudXpRatio || (typeof document !== 'undefined' ? document.getElementById('hud-xp-ratio') : null);
    this.hudLevelBarFill = elements.hudLevelBarFill || (typeof document !== 'undefined' ? document.getElementById('hud-level-bar-fill') : null);

    // Sound & Feature Controls
    this.soundIconOn = elements.soundIconOn || (typeof document !== 'undefined' ? document.getElementById('sound-icon-on') : null);
    this.soundIconOff = elements.soundIconOff || (typeof document !== 'undefined' ? document.getElementById('sound-icon-off') : null);
    this.hdBtn = elements.hdBtn || (typeof document !== 'undefined' ? document.getElementById('hd-btn') : null);
    this.hdConfigPill = elements.hdConfigPill || (typeof document !== 'undefined' ? document.getElementById('hd-config-pill') : null);
    this.hdModeChar = elements.hdModeChar || (typeof document !== 'undefined' ? document.getElementById('hd-mode-char') : null);
    this.hdModeWord = elements.hdModeWord || (typeof document !== 'undefined' ? document.getElementById('hd-mode-word') : null);
    this.hdWordSliderGroup = elements.hdWordSliderGroup || (typeof document !== 'undefined' ? document.getElementById('hd-word-slider-group') : null);
    this.hdWordsSlider = elements.hdWordsSlider || (typeof document !== 'undefined' ? document.getElementById('hd-words-slider') : null);
    this.hdWordsVal = elements.hdWordsVal || (typeof document !== 'undefined' ? document.getElementById('hd-words-val') : null);
    this.ghostBtn = elements.ghostBtn || (typeof document !== 'undefined' ? document.getElementById('ghost-btn') : null);
    this.ghostSliderPill = elements.ghostSliderPill || (typeof document !== 'undefined' ? document.getElementById('ghost-slider-pill') : null);
    this.ghostSlider = elements.ghostSlider || (typeof document !== 'undefined' ? document.getElementById('ghost-slider') : null);
    this.ghostVal = elements.ghostVal || (typeof document !== 'undefined' ? document.getElementById('ghost-val') : null);

    // Mods Folder / Popover Controls
    this.modsBtn = elements.modsBtn || (typeof document !== 'undefined' ? document.getElementById('mods-btn') : null);
    this.modsPopover = elements.modsPopover || (typeof document !== 'undefined' ? document.getElementById('mods-popover') : null);
    this.modsCloseBtn = elements.modsCloseBtn || (typeof document !== 'undefined' ? document.getElementById('mods-close-btn') : null);
    this.modsActiveDot = elements.modsActiveDot || (typeof document !== 'undefined' ? document.getElementById('mods-active-dot') : null);

    // Typing Stage HUD
    this.timerEl = elements.timerEl || (typeof document !== 'undefined' ? document.getElementById('timer') : null);
    this.restartBtn = elements.restartBtn || (typeof document !== 'undefined' ? document.getElementById('restart-btn') : null);
    this.restartBtnLabel = elements.restartBtnLabel || (typeof document !== 'undefined' ? document.getElementById('restart-btn-label') : null);
    this.liveStats = elements.liveStats || (typeof document !== 'undefined' ? document.getElementById('live-stats') : null);
    this.liveWpmEl = elements.liveWpmEl || (typeof document !== 'undefined' ? document.getElementById('live-wpm') : null);
    this.liveAccEl = elements.liveAccEl || (typeof document !== 'undefined' ? document.getElementById('live-acc') : null);

    // Flow Gauge & Atmosphere
    this.flowGauge = elements.flowGauge || (typeof document !== 'undefined' ? document.getElementById('flow-gauge') : null);
    this.flowSpeedTag = elements.flowSpeedTag || (typeof document !== 'undefined' ? document.getElementById('flow-speed-tag') : null);
    this.speedIndicatorText = elements.speedIndicatorText || (typeof document !== 'undefined' ? document.getElementById('speed-indicator-text') : null);
    this.flowMultiplierBadge = elements.flowMultiplierBadge || (typeof document !== 'undefined' ? document.getElementById('flow-multiplier-badge') : null);
    this.flowMultVal = elements.flowMultVal || (typeof document !== 'undefined' ? document.getElementById('flow-mult-val') : null);
    this.momentumBarFill = elements.momentumBarFill || (typeof document !== 'undefined' ? document.getElementById('momentum-bar-fill') : null);
    this.flowVignetteOverlay = elements.flowVignetteOverlay || (typeof document !== 'undefined' ? document.getElementById('flow-vignette-overlay') : null);
    this.xpToastLayer = elements.xpToastLayer || (typeof document !== 'undefined' ? document.getElementById('xp-toast-layer') : null);
    this.achievementToast = elements.achievementToast || (typeof document !== 'undefined' ? document.getElementById('achievement-toast') : null);
    this.statsBtn = elements.statsBtn || (typeof document !== 'undefined' ? document.getElementById('stats-btn') : null);
    this.toastQueue = [];
    this.isToastShowing = false;
    this.toastTimeout = null;

    this.lastRenderedMomentum = -1;
  }

  bindEvents(handlers = {}) {
    if (this.tabClassic) {
      this.tabClassic.addEventListener('click', () => {
        if (handlers.onModeChange) handlers.onModeChange('classic');
      });
    }
    if (this.tabFlow) {
      this.tabFlow.addEventListener('click', () => {
        if (handlers.onModeChange) handlers.onModeChange('flow');
      });
    }

    const configItems = (typeof document !== 'undefined') ? document.querySelectorAll('.config-item') : [];
    configItems.forEach(item => {
      item.addEventListener('click', () => {
        configItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const dur = parseInt(item.dataset.time, 10) || 30;
        if (handlers.onDurationChange) handlers.onDurationChange(dur);
      });
    });

    if (this.diffSlider) {
      this.diffSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (handlers.onTargetWpmChange) handlers.onTargetWpmChange(val);
      });
    }

    if (this.diffInput) {
      this.diffInput.addEventListener('change', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 5) {
          if (handlers.onTargetWpmChange) handlers.onTargetWpmChange(val);
        } else {
          this.syncTargetWpm(this.diffSlider ? this.diffSlider.value : 40);
        }
      });
    }

    if (this.targetItems) {
      this.targetItems.forEach(item => {
        item.addEventListener('click', () => {
          const t = parseInt(item.dataset.target, 10);
          if (t && handlers.onTargetWpmChange) handlers.onTargetWpmChange(t);
        });
      });
    }

    const soundBtn = (typeof document !== 'undefined') ? document.getElementById('sound-btn') : null;
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        if (handlers.onSoundToggle) handlers.onSoundToggle();
      });
    }

    const hdBtn = this.hdBtn || ((typeof document !== 'undefined') ? document.getElementById('hd-btn') : null);
    if (hdBtn) {
      hdBtn.addEventListener('click', () => {
        if (handlers.onHiddenToggle) handlers.onHiddenToggle();
      });
    }

    const hdModeChar = this.hdModeChar || ((typeof document !== 'undefined') ? document.getElementById('hd-mode-char') : null);
    if (hdModeChar) {
      hdModeChar.addEventListener('click', () => {
        if (handlers.onHiddenMethodChange) handlers.onHiddenMethodChange('char');
      });
    }

    const hdModeWord = this.hdModeWord || ((typeof document !== 'undefined') ? document.getElementById('hd-mode-word') : null);
    if (hdModeWord) {
      hdModeWord.addEventListener('click', () => {
        if (handlers.onHiddenMethodChange) handlers.onHiddenMethodChange('word');
      });
    }

    const hdWordsSlider = this.hdWordsSlider || ((typeof document !== 'undefined') ? document.getElementById('hd-words-slider') : null);
    if (hdWordsSlider) {
      hdWordsSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (handlers.onHiddenWordDistanceChange) handlers.onHiddenWordDistanceChange(val);
      });
    }

    const ghostBtn = this.ghostBtn || ((typeof document !== 'undefined') ? document.getElementById('ghost-btn') : null);
    if (ghostBtn) {
      ghostBtn.addEventListener('click', () => {
        if (handlers.onGhostToggle) handlers.onGhostToggle();
      });
    }

    const ghostSlider = this.ghostSlider || ((typeof document !== 'undefined') ? document.getElementById('ghost-slider') : null);
    if (ghostSlider) {
      ghostSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (handlers.onGhostSpeedChange) handlers.onGhostSpeedChange(val);
      });
    }

    const restartBtn = (typeof document !== 'undefined') ? document.getElementById('restart-btn') : null;
    const brandLogo = (typeof document !== 'undefined') ? document.getElementById('brand-logo') : null;
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (handlers.onRestart) handlers.onRestart();
      });
    }
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        if (handlers.onRestart) handlers.onRestart();
      });
    }

    const levelHudCard = this.levelHudCard || ((typeof document !== 'undefined') ? document.getElementById('level-hud-card') : null);
    if (levelHudCard) {
      levelHudCard.style.cursor = 'pointer';
      levelHudCard.title = 'Open Cosmetic Armory & Progression Unlocks';
      levelHudCard.addEventListener('click', () => {
        if (handlers.onOpenArmory) handlers.onOpenArmory();
      });
    }

    const modsBtn = this.modsBtn || ((typeof document !== 'undefined') ? document.getElementById('mods-btn') : null);
    if (modsBtn) {
      modsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleModsPopover();
      });
    }

    const modsCloseBtn = this.modsCloseBtn || ((typeof document !== 'undefined') ? document.getElementById('mods-close-btn') : null);
    if (modsCloseBtn) {
      modsCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleModsPopover(false);
      });
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const popover = this.modsPopover || document.getElementById('mods-popover');
        const btn = this.modsBtn || document.getElementById('mods-btn');
        if (popover && popover.style.display !== 'none') {
          if (!popover.contains(e.target) && (!btn || !btn.contains(e.target))) {
            this.toggleModsPopover(false);
          }
        }
      });
    }
  }

  setFocusOpacity(opacity) {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.style.setProperty('--focus-opacity', String(opacity));
    }
  }

  /**
   * Switches active mode in header tabs and toggles between Classic and Flow widgets.
   */
  setMode(mode, duration = 30) {
    const isClassic = mode === 'classic';
    this.setFocusOpacity(1.0);

    if (this.tabClassic) this.tabClassic.classList.toggle('active', isClassic);
    if (this.tabFlow) this.tabFlow.classList.toggle('active', !isClassic);

    if (this.timerEl) {
      this.timerEl.style.display = isClassic ? 'block' : 'none';
      if (isClassic) this.timerEl.textContent = duration;
    }

    if (this.flowGauge) this.flowGauge.style.display = isClassic ? 'none' : 'flex';
    if (this.classicDurationPill) this.classicDurationPill.style.display = isClassic ? 'flex' : 'none';
    if (this.flowTargetPill) this.flowTargetPill.style.display = isClassic ? 'none' : 'flex';
    if (this.levelHudCard) this.levelHudCard.style.display = isClassic ? 'none' : 'flex';

    if (this.restartBtnLabel) {
      this.restartBtnLabel.textContent = 'tab';
    }

    if (this.restartBtn && isClassic) {
      this.restartBtn.classList.remove('fade-out');
    }

    if (this.liveStats) {
      this.liveStats.classList.remove('visible');
    }
  }

  setRestartPromptVisible(visible) {
    if (this.restartBtn) {
      this.restartBtn.classList.toggle('fade-out', !visible);
    }
  }

  updateTimer(timeLeft) {
    if (this.timerEl) {
      this.timerEl.textContent = timeLeft;
    }
  }

  updateLiveClassicStats(wpm, acc) {
    if (this.liveStats) this.liveStats.classList.add('visible');
    if (this.liveWpmEl) this.liveWpmEl.textContent = wpm;
    if (this.liveAccEl) this.liveAccEl.textContent = `${acc}%`;
  }

  /**
   * Updates Flow Gauge speedometer tag, multiplier badge, and egg drop percentage.
   */
  updateFlowGauge(liveWpm, targetWpm, momentum, multiplier, eggChance, deckCount) {
    if (!this.flowGauge || this.flowGauge.style.display === 'none') return;

    const inFlow = liveWpm >= targetWpm;
    const isMaxFlow = momentum >= 100;
    const isCushion = momentum > 100;

    if (this.flowSpeedTag && this.speedIndicatorText) {
      if (isCushion || isMaxFlow) {
        this.flowSpeedTag.className = 'flow-speed-tag in-flow';
        this.speedIndicatorText.textContent = `🌈 MAX FLOW (${liveWpm || targetWpm} WPM)`;
      } else if (inFlow) {
        this.flowSpeedTag.className = 'flow-speed-tag in-flow';
        this.speedIndicatorText.textContent = `🔥 Flow Active (${liveWpm} WPM)`;
      } else if (liveWpm === 0) {
        this.flowSpeedTag.className = 'flow-speed-tag slow';
        this.speedIndicatorText.textContent = `Target: ${targetWpm} WPM`;
      } else {
        this.flowSpeedTag.className = 'flow-speed-tag slow';
        this.speedIndicatorText.textContent = `⚡ Paced: ${liveWpm} / ${targetWpm} WPM`;
      }
    }

    if (this.flowMultVal) {
      this.flowMultVal.textContent = `${multiplier.toFixed(1)}x Flow`;
    }
    if (this.flowMultiplierBadge) {
      this.flowMultiplierBadge.classList.toggle('active', multiplier > 1.0);
      this.flowMultiplierBadge.classList.toggle('rainbow-max', isMaxFlow);
      this.flowMultiplierBadge.classList.toggle('cushion-active', isCushion);
    }
  }

  /**
   * Renders the analog atmosphere vignette and momentum bar fill.
   */
  renderAtmosphere(vMomentum, isFlowMode) {
    if (!this.flowVignetteOverlay) return;

    if (!isFlowMode || vMomentum <= 0) {
      if (this.lastRenderedMomentum === 0) return;
      this.lastRenderedMomentum = 0;
      this.flowVignetteOverlay.classList.remove('active', 'breathing');
      this.flowVignetteOverlay.style.setProperty('--portal-alpha', '0');
      this.flowVignetteOverlay.style.setProperty('--vignette-alpha', '0');
      if (this.momentumBarFill) {
        this.momentumBarFill.style.width = '0%';
        this.momentumBarFill.classList.remove('rainbow');
      }
      return;
    }

    if (Math.abs(vMomentum - this.lastRenderedMomentum) < 0.1) return;
    this.lastRenderedMomentum = vMomentum;

    const displayPct = Math.min(100.0, Math.max(0.0, vMomentum));
    const isMaxFlow = vMomentum >= 100.0;
    const isCushion = vMomentum > 100.0;

    const portalAlpha = Math.min(1.0, Math.max(0.0, (displayPct - 10) / 90.0));
    const vignetteAlpha = isMaxFlow ? 1.0 : (displayPct / 100.0) * 0.85;

    this.flowVignetteOverlay.style.setProperty('--portal-alpha', portalAlpha.toFixed(3));
    this.flowVignetteOverlay.style.setProperty('--vignette-alpha', vignetteAlpha.toFixed(3));
    this.flowVignetteOverlay.classList.toggle('active', vMomentum > 15);
    this.flowVignetteOverlay.classList.toggle('breathing', isMaxFlow);

    if (this.momentumBarFill) {
      this.momentumBarFill.style.width = `${displayPct.toFixed(2)}%`;
      this.momentumBarFill.classList.toggle('rainbow', isMaxFlow);
    }
  }

  /**
   * Updates Header Level HUD Card (Lv. X, title, XP ratio bar)
   */
  updateLevelCard(level, currentXp, reqXp, title) {
    if (!this.levelHudCard) return;
    if (this.hudLevelBadge) this.hudLevelBadge.textContent = `LVL ${level}`;
    if (this.hudLevelTitle) this.hudLevelTitle.textContent = title;
    if (this.hudXpRatio) this.hudXpRatio.textContent = `${currentXp}/${reqXp} XP`;
    if (this.hudLevelBarFill) {
      const pct = Math.min(100, Math.max(0, Math.round((currentXp / reqXp) * 100)));
      this.hudLevelBarFill.style.width = `${pct}%`;
    }
  }

  /**
   * Synchronizes both the difficulty slider and text input.
   */
  syncTargetWpm(targetWpm) {
    const val = Number(targetWpm) || 40;
    if (this.diffSlider) {
      this.diffSlider.value = Math.min(120, Math.max(15, val));
    }
    if (this.diffInput && (typeof document !== 'undefined' && document.activeElement !== this.diffInput)) {
      this.diffInput.value = val;
    }
    if (this.targetItems) {
      this.targetItems.forEach(item => {
        const t = parseInt(item.dataset.target, 10);
        item.classList.toggle('active', t === val);
      });
    }
  }

  updateSoundState(enabled) {
    if (this.soundIconOn) this.soundIconOn.style.display = enabled ? 'block' : 'none';
    if (this.soundIconOff) this.soundIconOff.style.display = enabled ? 'none' : 'block';
    this._refreshModsIndicator();
  }

  /**
   * Spawns an animated floating XP toast in the viewport.
   */
  spawnXpToast(text, multiplier = 1.0, anchorEl = null, isBonus = false, isRainbow = false) {
    if (!this.xpToastLayer) return;

    const toast = document.createElement('div');
    toast.className = 'xp-toast' + (isBonus ? ' bonus' : '') + (isRainbow ? ' rainbow' : '');

    let msg = text;
    if (typeof text === 'number') {
      msg = `+${text} XP`;
      if (multiplier > 1.0 && !isBonus) {
        msg += ` (${multiplier.toFixed(1)}x)`;
      }
    }
    toast.textContent = msg;

    let posX = (typeof window !== 'undefined' ? window.innerWidth : 800) / 2;
    let posY = (typeof window !== 'undefined' ? window.innerHeight : 600) / 2 - 80;

    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      if (rect.width > 0 && rect.top > 0) {
        posX = rect.left + rect.width / 2;
        posY = rect.top - 14;
      }
    }

    toast.style.left = `${posX + (Math.random() * 20 - 10)}px`;
    toast.style.top = `${posY}px`;

    this.xpToastLayer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 950);
  }

  updateHiddenModeState(enabled, method = 'word', distance = 1) {
    const btn = this.hdBtn || ((typeof document !== 'undefined') ? document.getElementById('hd-btn') : null);
    if (btn) {
      btn.classList.toggle('active', !!enabled);
      btn.setAttribute('aria-pressed', String(!!enabled));
      btn.title = enabled
        ? `Hidden (HD) Mode: ON (${method === 'word' ? 'Word Vanish' : 'Combo Horizon'}) - Click to disable`
        : 'Toggle Hidden (HD) Look-Ahead Mode';
    }

    const pill = this.hdConfigPill || ((typeof document !== 'undefined') ? document.getElementById('hd-config-pill') : null);
    if (pill) {
      pill.style.display = enabled ? 'flex' : 'none';
    }

    const charBtn = this.hdModeChar || ((typeof document !== 'undefined') ? document.getElementById('hd-mode-char') : null);
    const wordBtn = this.hdModeWord || ((typeof document !== 'undefined') ? document.getElementById('hd-mode-word') : null);
    if (charBtn) charBtn.classList.toggle('active', method === 'char' || method === 'combo');
    if (wordBtn) wordBtn.classList.toggle('active', method === 'word');

    const sliderGroup = this.hdWordSliderGroup || ((typeof document !== 'undefined') ? document.getElementById('hd-word-slider-group') : null);
    if (sliderGroup) {
      sliderGroup.style.display = (method === 'word') ? 'flex' : 'none';
    }

    const slider = this.hdWordsSlider || ((typeof document !== 'undefined') ? document.getElementById('hd-words-slider') : null);
    if (slider) {
      slider.value = distance;
    }

    const valEl = this.hdWordsVal || ((typeof document !== 'undefined') ? document.getElementById('hd-words-val') : null);
    if (valEl) {
      valEl.textContent = `${distance} ${distance === 1 ? 'word' : 'words'}`;
    }
    this._refreshModsIndicator();
  }

  updateGhostState(enabled, speed) {
    const btn = this.ghostBtn || ((typeof document !== 'undefined') ? document.getElementById('ghost-btn') : null);
    if (btn) {
      btn.classList.toggle('active', !!enabled);
      btn.setAttribute('aria-pressed', String(!!enabled));
      btn.title = enabled
        ? `Ghost Cursor Pacer: ON (${speed || 50} WPM) - Click to disable`
        : 'Toggle Ghost Cursor Pacer';
    }
    const pill = this.ghostSliderPill || ((typeof document !== 'undefined') ? document.getElementById('ghost-slider-pill') : null);
    if (pill) {
      pill.style.display = enabled ? 'flex' : 'none';
    }
    const slider = this.ghostSlider || ((typeof document !== 'undefined') ? document.getElementById('ghost-slider') : null);
    const valEl = this.ghostVal || ((typeof document !== 'undefined') ? document.getElementById('ghost-val') : null);
    if (slider) {
      slider.value = speed || 50;
    }
    if (valEl) {
      valEl.textContent = `${speed || 50} WPM`;
    }
    this._refreshModsIndicator();
  }

  toggleModsPopover(forceState) {
    const popover = this.modsPopover || ((typeof document !== 'undefined') ? document.getElementById('mods-popover') : null);
    const btn = this.modsBtn || ((typeof document !== 'undefined') ? document.getElementById('mods-btn') : null);
    if (!popover) return;
    const isCurrentlyVisible = popover.style.display !== 'none';
    const show = forceState !== undefined ? Boolean(forceState) : !isCurrentlyVisible;
    popover.style.display = show ? 'flex' : 'none';
    if (btn) {
      btn.setAttribute('aria-expanded', show ? 'true' : 'false');
      btn.classList.toggle('active', show);
    }
  }

  isModsPopoverOpen() {
    const popover = this.modsPopover || ((typeof document !== 'undefined') ? document.getElementById('mods-popover') : null);
    return Boolean(popover && popover.style.display !== 'none');
  }

  updateModsActiveIndicator(isHdActive, isGhostActive, isSoundActive) {
    const dot = this.modsActiveDot || ((typeof document !== 'undefined') ? document.getElementById('mods-active-dot') : null);
    const btn = this.modsBtn || ((typeof document !== 'undefined') ? document.getElementById('mods-btn') : null);
    const hasActiveMods = Boolean(isHdActive || isGhostActive || isSoundActive);
    if (dot) {
      dot.style.display = hasActiveMods ? 'inline-block' : 'none';
    }
    if (btn) {
      btn.classList.toggle('has-active-mods', hasActiveMods);
    }
  }

  _refreshModsIndicator() {
    const hdBtn = this.hdBtn || ((typeof document !== 'undefined') ? document.getElementById('hd-btn') : null);
    const ghostBtn = this.ghostBtn || ((typeof document !== 'undefined') ? document.getElementById('ghost-btn') : null);
    const soundOn = this.soundIconOn || ((typeof document !== 'undefined') ? document.getElementById('sound-icon-on') : null);

    const isHd = Boolean(hdBtn && hdBtn.classList.contains('active'));
    const isGhost = Boolean(ghostBtn && ghostBtn.classList.contains('active'));
    const isSound = Boolean(soundOn && soundOn.style.display !== 'none');

    this.updateModsActiveIndicator(isHd, isGhost, isSound);
  }

  /**
   * Pushes unlocked achievement into FIFO queue and displays non-blocking toast
   */
  showAchievementToast(achievement) {
    if (!achievement) return;
    this.toastQueue.push(achievement);
    this._processToastQueue();
  }

  _processToastQueue() {
    if (this.isToastShowing || this.toastQueue.length === 0) return;
    const toast = this.achievementToast || ((typeof document !== 'undefined') ? document.getElementById('achievement-toast') : null);
    if (!toast) return;

    const ach = this.toastQueue.shift();
    this.isToastShowing = true;

    const tierLabel = ach.tier === 1
      ? 'TIER I UNLOCKED'
      : (ach.tier === 2
          ? 'TIER II MASTERY'
          : (ach.tier === 'crown'
              ? '👑 CROWN JEWEL'
              : (ach.tier === 'cosmetic'
                  ? '🎨 ARMORY UNLOCKED'
                  : (ach.tier === 'apex' ? '⚡ APEX FEAT' : '🌟 SIGNATURE FEAT'))));
    const tierClass = `tier-${ach.tier}`;

    toast.className = `achievement-toast visible ${tierClass}`;
    toast.innerHTML = `
      <div class="toast-icon-wrap">${ach.icon || '🏆'}</div>
      <div class="toast-body">
        <span class="toast-tier ${tierClass}">${tierLabel}</span>
        <div class="toast-title">${ach.title}</div>
        <div class="toast-desc">${ach.desc}</div>
      </div>
    `;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    if (this.toastFadeTimeout) clearTimeout(this.toastFadeTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
      this.toastFadeTimeout = setTimeout(() => {
        this.isToastShowing = false;
        this._processToastQueue();
      }, 400);
    }, 3500);
  }

  setStatsBadgeVisible(visible) {
    const btn = this.statsBtn || ((typeof document !== 'undefined') ? document.getElementById('stats-btn') : null);
    if (btn) {
      btn.classList.toggle('has-badge', Boolean(visible));
    }
  }

  /**
   * Applies an OLED theme palette's CSS custom properties to the document root.
   */
  applyTheme(themeDef, rootEl = null) {
    if (!themeDef || !themeDef.vars) return null;
    this.activeThemeId = themeDef.id || 'oled_cyan';
    const target = rootEl || ((typeof document !== 'undefined' && document.documentElement) ? document.documentElement : null);
    if (target && target.style && typeof target.style.setProperty === 'function') {
      Object.entries(themeDef.vars).forEach(([prop, val]) => {
        target.style.setProperty(prop, val);
      });
    }
    if (target && typeof target.setAttribute === 'function') {
      target.setAttribute('data-theme', this.activeThemeId);
    }
    return this.activeThemeId;
  }

  /**
   * Applies the active Flow FX atmosphere preset to the vignette overlay and document root.
   */
  applyFlowFx(flowFxId = 'adaptive_resonance', rootEl = null) {
    const valid = ['adaptive_resonance', 'zen_trance', 'prismatic_aurora', 'cyberpunk_grid', 'solar_flame', 'hyperdrive_warp'];
    const id = (typeof flowFxId === 'object' && flowFxId && flowFxId.id) ? flowFxId.id : flowFxId;
    this.activeFlowFxId = valid.includes(id) ? id : 'adaptive_resonance';
    const target = rootEl || ((typeof document !== 'undefined' && document.documentElement) ? document.documentElement : null);
    if (target) {
      if (target.dataset) {
        target.dataset.flowFx = this.activeFlowFxId;
      }
      if (typeof target.setAttribute === 'function') {
        target.setAttribute('data-flow-fx', this.activeFlowFxId);
      }
    }
    if (this.flowVignetteOverlay && this.flowVignetteOverlay.classList) {
      valid.forEach(fx => this.flowVignetteOverlay.classList.remove(`flow-fx-${fx}`));
      this.flowVignetteOverlay.classList.add(`flow-fx-${this.activeFlowFxId}`);
    }
    return this.activeFlowFxId;
  }
}

if (typeof window !== 'undefined') {
  window.HUDView = HUDView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HUDView };
}
