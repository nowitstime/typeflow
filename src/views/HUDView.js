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
    this.ghostBtn = elements.ghostBtn || (typeof document !== 'undefined' ? document.getElementById('ghost-btn') : null);
    this.ghostSliderPill = elements.ghostSliderPill || (typeof document !== 'undefined' ? document.getElementById('ghost-slider-pill') : null);
    this.ghostSlider = elements.ghostSlider || (typeof document !== 'undefined' ? document.getElementById('ghost-slider') : null);
    this.ghostVal = elements.ghostVal || (typeof document !== 'undefined' ? document.getElementById('ghost-val') : null);

    // Typing Stage HUD
    this.timerEl = elements.timerEl || (typeof document !== 'undefined' ? document.getElementById('timer') : null);
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
      this.restartBtnLabel.textContent = isClassic ? 'restart test' : 'restart flow';
    }

    if (this.liveStats) {
      this.liveStats.classList.remove('visible');
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
    if (this.hudLevelBadge) this.hudLevelBadge.textContent = `Lv. ${level}`;
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

    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2 - 80;

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

  updateHiddenModeState(enabled) {
    const btn = this.hdBtn || ((typeof document !== 'undefined') ? document.getElementById('hd-btn') : null);
    if (btn) {
      btn.classList.toggle('active', !!enabled);
      btn.setAttribute('aria-pressed', String(!!enabled));
      btn.title = enabled
        ? 'Hidden (HD) Look-Ahead: ON (Click to disable)'
        : 'Toggle Hidden (HD) Look-Ahead Mode';
    }
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
  }
}

if (typeof window !== 'undefined') {
  window.HUDView = HUDView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HUDView };
}
