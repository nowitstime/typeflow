/**
 * TypeFlow - Minimalist Typing Test & Flow Roguelike Game Engine
 * OLED Black & Light Blue Theme
 * Spaced Repetition (SRS), Target WPM Pacing, XP Levels & Egg Hatchery
 */

(function () {
  // Mode State: 'flow' (default) or 'classic', loaded from StorageManager
  let currentMode = (typeof StorageManager !== "undefined" && StorageManager.getActiveMode)
    ? StorageManager.getActiveMode()
    : "flow";

  // DOM Elements - Header & Tabs
  const tabClassic = document.getElementById("tab-classic");
  const tabFlow = document.getElementById("tab-flow");
  const classicDurationPill = document.getElementById("classic-duration-pill");
  const flowTargetPill = document.getElementById("flow-target-pill");
  const diffSlider = document.getElementById("diff-slider");
  const diffInput = document.getElementById("diff-input");
  const targetItems = document.querySelectorAll(".target-item");
  const eggBasketBtn = document.getElementById("egg-basket-btn");
  const eggCountBadge = document.getElementById("egg-count-badge");
  const levelHudCard = document.getElementById("level-hud-card");
  const hudLevelBadge = document.getElementById("hud-level-badge");
  const hudLevelTitle = document.getElementById("hud-level-title");
  const hudXpRatio = document.getElementById("hud-xp-ratio");
  const hudLevelBarFill = document.getElementById("hud-level-bar-fill");
  const statsBtn = document.getElementById("stats-btn");
  const openDeckMasteryBtn = document.getElementById("open-deck-mastery-btn");
  const brandLogo = document.getElementById("brand-logo");
  const soundBtn = document.getElementById("sound-btn");
  const soundIconOn = document.getElementById("sound-icon-on");
  const soundIconOff = document.getElementById("sound-icon-off");
  const configItems = document.querySelectorAll(".config-item");

  // DOM Elements - Typing Stage
  const testSection = document.getElementById("test-section");
  const timerEl = document.getElementById("timer");
  const flowGauge = document.getElementById("flow-gauge");
  const flowSpeedTag = document.getElementById("flow-speed-tag");
  const speedIndicatorText = document.getElementById("speed-indicator-text");
  const flowMultiplierBadge = document.getElementById("flow-multiplier-badge");
  const flowMultVal = document.getElementById("flow-mult-val");
  const momentumBarFill = document.getElementById("momentum-bar-fill");
  const flowVignetteOverlay = document.getElementById("flow-vignette-overlay");
  const eggChancePct = document.getElementById("egg-chance-pct");
  const eggChanceBarFill = document.getElementById("egg-chance-bar-fill");
  const deckSizeTag = document.getElementById("deck-size-tag");
  const deckCountNum = document.getElementById("deck-count-num");
  const xpToastLayer = document.getElementById("xp-toast-layer");
  const liveStats = document.getElementById("live-stats");
  const liveWpmEl = document.getElementById("live-wpm");
  const liveAccEl = document.getElementById("live-acc");
  const wordsBox = document.getElementById("words-box");
  const wordsWrapper = document.getElementById("words-wrapper");
  const caret = document.getElementById("caret");
  const typingInput = document.getElementById("typing-input");
  const focusOverlay = document.getElementById("focus-overlay");
  const restartBtn = document.getElementById("restart-btn");
  const restartBtnLabel = document.getElementById("restart-btn-label");

  // DOM Elements - Results Screen (Classic)
  const resultsSection = document.getElementById("results-section");
  const nextTestBtn = document.getElementById("next-test-btn");
  const resWpmEl = document.getElementById("res-wpm");
  const resAccEl = document.getElementById("res-acc");
  const resRawEl = document.getElementById("res-raw");
  const resCharsEl = document.getElementById("res-chars");
  const resFixedEl = document.getElementById("res-fixed");
  const resFixedDetailEl = document.getElementById("res-fixed-detail");
  const resConsistencyEl = document.getElementById("res-consistency");
  const resTimeEl = document.getElementById("res-time");
  const resTimeDetailEl = document.getElementById("res-time-detail");
  const chartCanvas = document.getElementById("wpm-chart");
  const chartTooltip = document.getElementById("chart-tooltip");
  const tooltipTime = document.getElementById("tooltip-time");
  const tooltipWpm = document.getElementById("tooltip-wpm");
  const tooltipPace = document.getElementById("tooltip-pace");
  const tooltipRaw = document.getElementById("tooltip-raw");
  const tooltipErrRow = document.getElementById("tooltip-err-row");
  const chartHoverStats = document.getElementById("chart-hover-stats");

  // DOM Elements - 3-Slot In-Situ Egg Nest
  const eggNest = document.getElementById("egg-nest");
  const nestSlots = [
    document.getElementById("nest-slot-0"),
    document.getElementById("nest-slot-1"),
    document.getElementById("nest-slot-2")
  ];
  const nestHint = document.getElementById("nest-hint");

  // DOM Elements - Stats Modal
  const statsModal = document.getElementById("stats-modal");
  const tabStatsFlow = document.getElementById("tab-stats-flow");
  const tabStatsClassic = document.getElementById("tab-stats-classic");
  const paneStatsFlow = document.getElementById("pane-stats-flow");
  const paneStatsClassic = document.getElementById("pane-stats-classic");
  const statsRpgLevel = document.getElementById("stats-rpg-level");
  const statsRpgTitle = document.getElementById("stats-rpg-title");
  const statsRpgXp = document.getElementById("stats-rpg-xp");
  const statsRpgXpBar = document.getElementById("stats-rpg-xp-bar");
  const statsRpgWordsCount = document.getElementById("stats-rpg-words-count");
  const statsRpgEggsCount = document.getElementById("stats-rpg-eggs-count");
  const statsRpgHighStreak = document.getElementById("stats-rpg-high-streak");
  const motorGrid = document.getElementById("motor-grid");
  const deckUnlockedCount = document.getElementById("deck-unlocked-count");
  const deckFilters = document.getElementById("deck-filters");
  const deckWordsScroll = document.getElementById("deck-words-scroll");
  const closeStatsBtn = document.getElementById("close-stats-btn");
  const closeStatsFooterBtn = document.getElementById("close-stats-footer-btn");
  const resetRpgStatsBtn = document.getElementById("reset-rpg-stats-btn");
  const resetClassicStatsBtn = document.getElementById("reset-classic-stats-btn");
  const pb15s = document.getElementById("pb-15s");
  const pb15sDate = document.getElementById("pb-15s-date");
  const pb30s = document.getElementById("pb-30s");
  const pb30sDate = document.getElementById("pb-30s-date");
  const pb60s = document.getElementById("pb-60s");
  const pb60sDate = document.getElementById("pb-60s-date");
  const statsTotalTests = document.getElementById("stats-total-tests");
  const statsTotalWords = document.getElementById("stats-total-words");
  const statsTotalKeys = document.getElementById("stats-total-keys");
  const statsTotalTime = document.getElementById("stats-total-time");
  const statsHistoryTbody = document.getElementById("stats-history-tbody");

  // Classic Test State
  let testDuration = 30; // default 30s
  let timeLeft = testDuration;
  let timerInterval = null;
  let isTestActive = false;
  let isTestFinished = false;
  let testFinishedTime = 0;
  let wordsList = [];
  let currentWordIdx = 0;
  let currentCharIdx = 0;
  let wordStartTime = 0;
  let lastWordEndTime = 0;
  let hadBackspaceOnCurrentWord = false;

  // Metrics
  let correctKeystrokes = 0;
  let incorrectKeystrokes = 0;
  let extraCharsCount = 0;
  let missedCharsCount = 0;
  let rawKeystrokes = 0;
  let totalFixedErrors = 0;
  let currentSecondErrors = 0;
  let currentSecondFixed = 0;
  let lastSecCorrect = 0;
  let lastSecRaw = 0;
  let secondDeltas = []; // [{ correct, raw }]
  let wpmHistory = [];   // [{ second, wpm, rawWpm, burstWpm, errors, fixed }]
  let chartDataPoints = [];
  let hoveredPointIndex = null;

  // Flow RPG Game State
  let gameState = StorageManager.getGameSave();
  let flowStreak = 0;
  let flowMomentum = 0; // 0% to 120% breathing reservoir (100-120% is Apex Cushion)
  let visualMomentum = 0; // 0% to 120% smoothly lerped by physics ticker
  let lastKeystrokeTime = 0;
  let idleDecayTimer = null;
  let physicsAnimFrame = null;
  let eggChance = 0.0;
  let consecutiveCleanWords = 0;
  let rollingKeystrokeTimestamps = []; // for instantaneous WPM
  let hatchingSlotIndex = -1; // -1 = normal typing, 0/1/2 = active hatch slot
  let hatchTyped = ""; // "e", "eg", "egg"
  let revealedSlots = {}; // { 0: "wordA", 1: "wordB" } freshly hatched words displayed in nest slots
  let eggsHatchedInSession = false; // whether any eggs hatched during current nest visit
  let lastTabPressTime = 0; // timestamp for Tab + Enter detection

  // Sound Synth (Web Audio API)
  let soundEnabled = localStorage.getItem("typeflow_sound_enabled") === "true";
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  // Melodic pitch scaling with flow streak (semitones: 2^(n/12))
  function playKeySound(isSpace = false, streakStep = 0) {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const baseFreq = isSpace ? 320 : 480;
      const pitchSemitones = Math.min(18, streakStep);
      const freq = (baseFreq + (Math.random() * 25 - 12)) * Math.pow(1.05946, pitchSemitones);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (isSpace ? 0.05 : 0.035));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  // Egg cracking fracture sound
  function playFractureSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch (e) {}
  }

  // Egg shatter & word reveal sound (sparkly ascending arpeggio)
  function playHatchSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.24);
      });
    } catch (e) {}
  }

  // Level-up celebration fanfare
  function playLevelUpSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch (e) {}
  }

  // Cute pop chime when an egg is discovered during typing
  function playEggDropSound() {
    if (!soundEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.2);
      });
    } catch (e) {}
  }

  // Update Header Level HUD Card
  function updateLevelHud() {
    const level = gameState.level || 1;
    const currentXp = gameState.currentXp || 0;
    const reqXp = StorageManager.getXpForLevel(level);
    const title = StorageManager.getLevelTitle(level);

    hudLevelBadge.textContent = `Lv. ${level}`;
    hudLevelTitle.textContent = title;
    hudXpRatio.textContent = `${currentXp}/${reqXp} XP`;

    const pct = Math.min(100, Math.max(0, Math.round((currentXp / reqXp) * 100)));
    hudLevelBarFill.style.width = `${pct}%`;
  }

  // Update In-Situ Egg Nest HUD
  function updateEggBasketHud() {
    renderNestSlots();
  }

  // Update Target WPM Controls (Slider & Number Input)
  function updateTargetWpmPill() {
    const currentTarget = gameState.targetWpm || 40;
    if (diffSlider) {
      diffSlider.value = Math.min(120, Math.max(15, currentTarget));
    }
    if (diffInput && document.activeElement !== diffInput) {
      diffInput.value = currentTarget;
    }
    targetItems.forEach((item) => {
      const t = parseInt(item.dataset.target, 10);
      item.classList.toggle("active", t === currentTarget);
    });
  }

  // Compute Instantaneous WPM from rolling window (last 3 seconds)
  function getInstantaneousWpm() {
    const now = performance.now();
    rollingKeystrokeTimestamps = rollingKeystrokeTimestamps.filter(t => now - t <= 3000);
    const count = rollingKeystrokeTimestamps.length;
    if (count === 0) return 0;
    const windowSeconds = Math.max(1, (now - rollingKeystrokeTimestamps[0]) / 1000);
    const wpm = Math.round((count / 5) * (60 / windowSeconds));
    return isNaN(wpm) ? 0 : wpm;
  }

  // Flow Multiplier Formula: 1.0x to 3.0x based on Momentum (0% to 120%)
  function getFlowMultiplier(momentum = flowMomentum) {
    if (momentum >= 100) return 3.0;
    if (momentum >= 75) return 2.5;
    if (momentum >= 50) return 2.0;
    if (momentum >= 25) return 1.2;
    return 1.0;
  }

  let lastRenderedMomentum = -1;
  let lastRenderedMode = null;
  let lastFocusOpacity = null;
  let lastPortalAlpha = null;
  let lastVignetteAlpha = null;

  // Render Atmosphere on animation frame (smooth analog transitions, cached to prevent style thrashing)
  function renderFlowAtmosphere(vMomentum) {
    if (!flowVignetteOverlay) return;

    if (currentMode !== "flow" || vMomentum <= 0) {
      if (lastRenderedMomentum === 0 && lastRenderedMode === currentMode) {
        return; // Already clean, avoid redundant DOM thrashing!
      }
      lastRenderedMomentum = 0;
      lastRenderedMode = currentMode;
      lastPortalAlpha = "0";
      lastVignetteAlpha = "0";
      flowVignetteOverlay.classList.remove("active", "breathing");
      flowVignetteOverlay.style.setProperty("--portal-alpha", "0");
      flowVignetteOverlay.style.setProperty("--vignette-alpha", "0");
      if (lastFocusOpacity !== "1") {
        lastFocusOpacity = "1";
        document.documentElement.style.setProperty("--focus-opacity", "1");
      }
      if (caret) caret.classList.remove("caret-rainbow", "caret-flow-high");
      if (flowMultiplierBadge) flowMultiplierBadge.classList.remove("rainbow-max", "cushion-active");
      if (momentumBarFill) {
        momentumBarFill.style.width = "0%";
        momentumBarFill.classList.remove("rainbow");
      }
      return;
    }

    if (Math.abs(vMomentum - lastRenderedMomentum) < 0.12 && lastRenderedMode === currentMode) {
      return;
    }
    lastRenderedMomentum = vMomentum;
    lastRenderedMode = currentMode;

    const displayPct = Math.min(100.0, Math.max(0.0, vMomentum));
    const isMaxFlow = vMomentum >= 100.0;
    const isCushion = vMomentum > 100.0;

    // Portal alpha: begins waking at 10% momentum, reaches full radiance at 100%
    const portalAlpha = (Math.max(0, (displayPct - 10) / 90) * 0.75).toFixed(3);
    // Vignette alpha: breathing glow reaches up to 0.55 at peak flow
    const vignetteAlpha = (Math.max(0, (displayPct - 15) / 85) * 0.55).toFixed(3);

    if (portalAlpha !== lastPortalAlpha) {
      lastPortalAlpha = portalAlpha;
      flowVignetteOverlay.style.setProperty("--portal-alpha", portalAlpha);
    }
    if (vignetteAlpha !== lastVignetteAlpha) {
      lastVignetteAlpha = vignetteAlpha;
      flowVignetteOverlay.style.setProperty("--vignette-alpha", vignetteAlpha);
    }

    if (vMomentum >= 15) {
      flowVignetteOverlay.classList.add("active");
    } else {
      flowVignetteOverlay.classList.remove("active");
    }

    // Deep flow pulse: calm breathing sine animation at 70%+
    if (vMomentum >= 70) {
      flowVignetteOverlay.classList.add("breathing");
    } else {
      flowVignetteOverlay.classList.remove("breathing");
    }

    // Continuous Focus Mode: Dim peripheral UI smoothly from 100% down to 32%
    const focusOpacity = (1.0 - (displayPct / 100) * 0.68).toFixed(3);
    if (focusOpacity !== lastFocusOpacity) {
      lastFocusOpacity = focusOpacity;
      document.documentElement.style.setProperty("--focus-opacity", focusOpacity);
    }

    // Caret transitions: chromatic bloom entering 85%, full rainbow at 100%
    if (caret) {
      if (isMaxFlow) {
        caret.classList.remove("caret-flow-high");
        caret.classList.add("caret-rainbow");
      } else if (vMomentum >= 85) {
        caret.classList.add("caret-flow-high");
        caret.classList.remove("caret-rainbow");
      } else {
        caret.classList.remove("caret-flow-high", "caret-rainbow");
      }
    }

    // Multiplier Badge Rainbow & Cushion Overdrive Glow
    if (flowMultiplierBadge) {
      flowMultiplierBadge.classList.toggle("rainbow-max", isMaxFlow);
      flowMultiplierBadge.classList.toggle("cushion-active", isCushion);
    }

    // Smooth Momentum Bar Fill
    if (momentumBarFill) {
      momentumBarFill.style.width = `${displayPct.toFixed(2)}%`;
      momentumBarFill.classList.toggle("rainbow", isMaxFlow);
    }
  }

  // Update Atmosphere Entry Point
  function updateFlowAtmosphereUI(momentum) {
    flowMomentum = Math.min(120.0, Math.max(0.0, momentum));
    if (currentMode !== "flow" || flowMomentum <= 0) {
      visualMomentum = 0;
      renderFlowAtmosphere(0);
    }
  }

  // 60fps / 120fps Damped Physics Ticker
  function startPhysicsTicker() {
    if (physicsAnimFrame) cancelAnimationFrame(physicsAnimFrame);

    function tick() {
      if (currentMode === "flow") {
        const diff = flowMomentum - visualMomentum;
        if (Math.abs(diff) > 0.05) {
          visualMomentum += diff * 0.085; // Critically damped spring lerp
          renderFlowAtmosphere(visualMomentum);
        } else if (visualMomentum !== flowMomentum) {
          visualMomentum = flowMomentum;
          renderFlowAtmosphere(visualMomentum);
        }
      }
      physicsAnimFrame = requestAnimationFrame(tick);
    }
    physicsAnimFrame = requestAnimationFrame(tick);
  }

  // Idle Decay Loop: Kinetic Rolling Inertia with Apex Grace Period
  function startIdleDecayLoop() {
    if (idleDecayTimer) clearInterval(idleDecayTimer);
    idleDecayTimer = setInterval(() => {
      if (currentMode !== "flow" || !isTestActive || flowMomentum <= 0) return;
      if (hatchingSlotIndex !== -1 || (statsModal && statsModal.style.display !== "none")) return;

      const now = performance.now();
      // Grace period scales with momentum: top momentum gives 3.0s grace period!
      const gracePeriod = flowMomentum >= 100 ? 3000 : (flowMomentum >= 50 ? 2200 : 1600);
      const idleTime = now - lastKeystrokeTime;

      if (idleTime > gracePeriod) {
        const overSec = (idleTime - gracePeriod) / 1000;
        // Non-linear convex decay: gentle bleed for first 2 seconds, ramping up on prolonged idle
        const decayPerSec = overSec <= 2.0 ? 3.5 : 7.5;
        flowMomentum = Math.max(0, flowMomentum - (decayPerSec * 0.20));
        updateFlowGaugeUI(getInstantaneousWpm());
      }
    }, 200);
  }

  // Update Flow Gauge UI (Speedometer, Streak Multiplier, Egg Chance, Deck Size)
  function updateFlowGaugeUI(liveWpm) {
    if (currentMode !== "flow") return;

    const target = gameState.targetWpm || 40;
    const inFlow = liveWpm >= target;
    const isMaxFlow = flowMomentum >= 100;
    const isCushion = flowMomentum > 100;

    // Speed status tag
    if (isCushion) {
      flowSpeedTag.className = "flow-speed-tag in-flow";
      speedIndicatorText.textContent = `🌈 MAX FLOW (${liveWpm || target} WPM)`;
    } else if (isMaxFlow) {
      flowSpeedTag.className = "flow-speed-tag in-flow";
      speedIndicatorText.textContent = `🌈 MAX FLOW (${liveWpm || target} WPM)`;
    } else if (inFlow) {
      flowSpeedTag.className = "flow-speed-tag in-flow";
      speedIndicatorText.textContent = `🔥 Flow Active (${liveWpm} WPM)`;
    } else if (liveWpm === 0) {
      flowSpeedTag.className = "flow-speed-tag slow";
      speedIndicatorText.textContent = `Target: ${target} WPM`;
    } else {
      flowSpeedTag.className = "flow-speed-tag slow";
      speedIndicatorText.textContent = `⚡ Paced: ${liveWpm} / ${target} WPM`;
    }

    // Multiplier Badge
    const mult = getFlowMultiplier(flowMomentum);
    flowMultVal.textContent = `${mult.toFixed(1)}x Flow`;
    if (mult > 1.0) {
      flowMultiplierBadge.classList.add("active");
    } else {
      flowMultiplierBadge.classList.remove("active");
    }

    // Egg Drop Chance: scaled relative to 18% cap (if elements present)
    if (eggChancePct) eggChancePct.textContent = `${eggChance.toFixed(1)}%`;
    if (eggChanceBarFill) eggChanceBarFill.style.width = `${Math.min(100, Math.round((eggChance / 18.0) * 100))}%`;

    // Deck Size (if elements present)
    const deckCount = (gameState.unlockedRanks && gameState.unlockedRanks.length) || 1;
    if (deckCountNum) deckCountNum.textContent = `${deckCount} word${deckCount === 1 ? "" : "s"}`;
  }

  // Spawn Floating XP Toast
  function spawnXpToast(text, multiplier = 1.0, anchorEl = null, isBonus = false, isRainbow = false) {
    if (!xpToastLayer) return;

    const toast = document.createElement("div");
    const rainbowClass = isRainbow || multiplier >= 3.0 ? " rainbow" : "";
    toast.className = `xp-toast ${isBonus || multiplier > 1.5 ? "bonus" : ""}${rainbowClass}`;
    toast.textContent = typeof text === "number" ? `+${text} XP` : text;

    let left = 40;
    let top = 40;

    if (anchorEl) {
      const boxRect = wordsBox.getBoundingClientRect();
      const elRect = anchorEl.getBoundingClientRect();
      left = elRect.left - boxRect.left + (elRect.width / 2) - 15;
      top = elRect.top - boxRect.top - 10;
    } else {
      left = wordsBox.clientWidth / 2 - 25;
      top = 20;
    }

    toast.style.left = `${Math.max(10, Math.min(wordsBox.clientWidth - 70, left))}px`;
    toast.style.top = `${Math.max(5, top)}px`;

    xpToastLayer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 1000);
  }

  // Generate words and populate DOM based on active mode
  function generateWords(count = 70) {
    if (currentMode === "flow") {
      // Ground zero begins with 1 word ("the"); Flow-Aware SRS modulates challengeScale with flowMomentum!
      wordsList = getSrsWeightedRandomWords(
        gameState.unlockedRanks,
        gameState.wordStats,
        gameState.targetWpm,
        count,
        flowMomentum
      );
    } else {
      wordsList = getRandomWords(count);
    }

    wordsWrapper.innerHTML = "";

    wordsList.forEach((word, wIdx) => {
      const wordEl = document.createElement("div");
      wordEl.className = "word" + (wIdx === 0 ? " active" : "");
      wordEl.dataset.word = word;

      for (let i = 0; i < word.length; i++) {
        const letterEl = document.createElement("span");
        letterEl.className = "letter";
        letterEl.textContent = word[i];
        wordEl.appendChild(letterEl);
      }
      wordsWrapper.appendChild(wordEl);
    });

    scrollOffset = 0;
    wordsWrapper.style.transform = "translateY(0px)";
  }

  // Caret & Scroll Calculation (Deterministic Offset Math & Hybrid Tracking)
  let scrollOffset = 0;

  // Handle multi-line viewport alignment
  function checkLineScroll(activeWordEl) {
    const firstWord = wordsWrapper.firstElementChild;
    if (!firstWord) return;

    const baseTop = firstWord.offsetTop;
    const currentWordTop = activeWordEl.offsetTop;

    // Detect exact rendered line height dynamically from DOM
    const line2Word = Array.from(wordsWrapper.children).find(w => w.offsetTop > baseTop + 10);
    const lineHeight = line2Word ? (line2Word.offsetTop - baseTop) : (activeWordEl.offsetHeight || 42);

    // Line 1 & Line 2 do not scroll. Line 3+ scrolls so active line is always visually at Line 2
    let newScrollOffset = 0;
    if (currentWordTop > baseTop + lineHeight * 1.2) {
      newScrollOffset = currentWordTop - (baseTop + lineHeight);
    } else {
      newScrollOffset = 0;
    }

    if (newScrollOffset !== scrollOffset) {
      scrollOffset = newScrollOffset;
      wordsWrapper.style.transform = `translateY(-${scrollOffset}px)`;
    }
  }

  // Update Caret Position with subpixel horizontal tracking & synchronous vertical lock
  function updateCaret() {
    const wordElements = wordsWrapper.querySelectorAll(".word");
    const currentWordEl = wordElements[currentWordIdx];
    if (!currentWordEl) return;

    checkLineScroll(currentWordEl);

    const currentWordTop = currentWordEl.offsetTop;
    const visualTop = currentWordTop - scrollOffset;
    const targetTop = visualTop + 5;

    const letterElements = currentWordEl.querySelectorAll(".letter");
    const boxRect = wordsBox.getBoundingClientRect();
    let targetLeft = 0;

    if (currentCharIdx < letterElements.length) {
      const activeLetter = letterElements[currentCharIdx];
      const letterRect = activeLetter.getBoundingClientRect();
      if (boxRect.width > 0 && letterRect.width > 0) {
        targetLeft = letterRect.left - boxRect.left;
      } else {
        targetLeft = activeLetter.offsetLeft;
      }
    } else {
      // Past end of word
      if (letterElements.length > 0) {
        const lastLetter = letterElements[letterElements.length - 1];
        const lastRect = lastLetter.getBoundingClientRect();
        if (boxRect.width > 0 && lastRect.width > 0) {
          targetLeft = lastRect.right - boxRect.left;
        } else {
          targetLeft = lastLetter.offsetLeft + lastLetter.offsetWidth;
        }
      } else {
        targetLeft = currentWordEl.offsetLeft;
      }
    }

    caret.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
  }

  // Dynamic error underline removal check
  function checkWordErrorState(wordEl) {
    if (!wordEl) return;
    const hasIncorrect = wordEl.querySelector(".incorrect, .extra");
    if (hasIncorrect) {
      wordEl.classList.add("error");
    } else {
      wordEl.classList.remove("error");
    }
  }

  // Classic Timer
  function startTimer() {
    if (isTestActive) return;
    isTestActive = true;
    lastKeystrokeTime = performance.now();
    lastSecCorrect = 0;
    lastSecRaw = 0;
    secondDeltas = [];
    wpmHistory = [];
    currentSecondErrors = 0;
    currentSecondFixed = 0;

    if (currentMode === "classic") {
      liveStats.classList.add("visible");
      timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        const deltaCorrect = correctKeystrokes - lastSecCorrect;
        const deltaRaw = rawKeystrokes - lastSecRaw;
        lastSecCorrect = correctKeystrokes;
        lastSecRaw = rawKeystrokes;
        secondDeltas.push({ correct: deltaCorrect, raw: deltaRaw });

        const elapsedSec = testDuration - timeLeft;
        const currentCumulativeWpm = Math.round((correctKeystrokes / 5) / (elapsedSec / 60));
        const currentCumulativeRawWpm = Math.round((rawKeystrokes / 5) / (elapsedSec / 60));

        const recentWindow = secondDeltas.slice(-3);
        const burstCorrectSum = recentWindow.reduce((a, b) => a + b.correct, 0);
        const burstWindowSec = recentWindow.length;
        const burstWpm = Math.round((burstCorrectSum / 5) / (burstWindowSec / 60));

        wpmHistory.push({
          second: elapsedSec,
          wpm: currentCumulativeWpm,
          rawWpm: currentCumulativeRawWpm,
          burstWpm: burstWpm,
          errors: currentSecondErrors,
          fixed: currentSecondFixed
        });

        currentSecondErrors = 0;
        currentSecondFixed = 0;

        liveWpmEl.textContent = currentCumulativeWpm;
        const totalAttempts = correctKeystrokes + incorrectKeystrokes;
        const acc = totalAttempts > 0 ? Math.round((correctKeystrokes / totalAttempts) * 100) : 100;
        liveAccEl.textContent = `${acc}%`;

        if (timeLeft <= 0) {
          finishClassicTest();
        }
      }, 1000);
    }
  }

  // Finish Classic Test & Show Results
  function finishClassicTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTestActive = false;
    isTestFinished = true;
    testFinishedTime = Date.now();

    testSection.style.display = "none";
    resultsSection.classList.add("visible");

    const totalAttempts = correctKeystrokes + incorrectKeystrokes;
    const finalWpm = Math.round((correctKeystrokes / 5) / (testDuration / 60));
    const finalRawWpm = Math.round((rawKeystrokes / 5) / (testDuration / 60));
    const finalAcc = totalAttempts > 0 ? Math.round((correctKeystrokes / totalAttempts) * 100) : 100;

    let consistency = 100;
    if (wpmHistory.length > 2) {
      const wpms = wpmHistory.map(h => h.wpm);
      const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
      const variance = wpms.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpms.length;
      const stdDev = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (mean || 1)) * 100)));
    }

    resWpmEl.textContent = finalWpm;
    resAccEl.textContent = `${finalAcc}%`;
    resRawEl.textContent = finalRawWpm;
    resCharsEl.textContent = `${correctKeystrokes}/${incorrectKeystrokes}/${extraCharsCount}/${missedCharsCount}`;
    resFixedEl.textContent = totalFixedErrors;
    resFixedDetailEl.textContent = totalFixedErrors === 1 ? "1 error fixed" : `${totalFixedErrors} errors fixed`;
    resConsistencyEl.textContent = `${consistency}%`;
    resTimeEl.textContent = `${testDuration}s`;
    resTimeDetailEl.textContent = "standard mode";

    // Save to persistent storage!
    StorageManager.recordClassicTest(
      testDuration,
      finalWpm,
      finalRawWpm,
      finalAcc,
      consistency,
      rawKeystrokes,
      Math.round(correctKeystrokes / 5)
    );

    renderChart();

    nextTestBtn.blur();
    setTimeout(() => {
      nextTestBtn.focus();
    }, 450);
  }

  // Render Canvas Chart for Results
  function renderChart(hoverIndex = null) {
    if (!chartCanvas || wpmHistory.length === 0) return;
    const ctx = chartCanvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const width = chartCanvas.parentElement.clientWidth;
    const height = 180;
    chartCanvas.width = width * dpr;
    chartCanvas.height = height * dpr;
    chartCanvas.style.width = `${width}px`;
    chartCanvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = wpmHistory.flatMap(h => [h.wpm, h.rawWpm, h.burstWpm || h.wpm]);
    const maxVal = Math.max(40, ...allValues) + 10;
    const minVal = 0;

    // Grid lines
    ctx.strokeStyle = "#1a2332";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#526071";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = Math.round(minVal + (maxVal - minVal) * (i / ySteps));
      const y = padding.top + chartH - (i / ySteps) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${val}`, padding.left - 8, y);
    }

    const n = wpmHistory.length;
    const getX = (idx) => padding.left + (idx / Math.max(1, n - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Time ticks
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const xStep = Math.max(1, Math.floor(n / 6));
    for (let i = 0; i < n; i += xStep) {
      const x = getX(i);
      ctx.fillText(`${wpmHistory[i].second}s`, x, height - padding.bottom + 8);
    }

    // 1. Raw WPM line (dashed)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.rawWpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // 2. Rolling 3s Pace line (mint teal)
    ctx.save();
    ctx.strokeStyle = "#2dd4bf";
    ctx.lineWidth = 2;
    ctx.beginPath();
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.burstWpm || pt.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // 3. Cumulative Avg WPM line (cyan with area gradient)
    ctx.save();
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

    ctx.beginPath();
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(getX(n - 1), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // Store points for hover detection
    chartDataPoints = [];
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.wpm);
      chartDataPoints.push({ x, y, item: pt, index: i });

      // Error markers
      if (pt.errors > 0) {
        const isFixed = (pt.fixed >= pt.errors) || (pt.fixed > 0);
        ctx.save();
        ctx.fillStyle = isFixed ? "#34d399" : "#f87171";
        ctx.beginPath();
        ctx.arc(x, getY(pt.rawWpm), 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Hover crosshair and highlighted point
    if (hoverIndex !== null && chartDataPoints[hoverIndex]) {
      const target = chartDataPoints[hoverIndex];
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(target.x, padding.top);
      ctx.lineTo(target.x, padding.top + chartH);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "#38bdf8";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // Interactive Chart Tooltip
  function handleChartInteraction(e) {
    if (chartDataPoints.length === 0) return;
    const rect = chartCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseX = clientX - rect.left;

    let closestIdx = 0;
    let minDiff = Infinity;
    chartDataPoints.forEach((pt, i) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    if (minDiff < 45) {
      hoveredPointIndex = closestIdx;
      const pt = chartDataPoints[closestIdx];
      renderChart(hoveredPointIndex);

      if (chartTooltip) {
        tooltipTime.textContent = `${pt.item.second}s`;
        tooltipWpm.textContent = `${pt.item.wpm} WPM`;
        if (tooltipPace) tooltipPace.textContent = `${pt.item.burstWpm || pt.item.wpm} WPM`;
        tooltipRaw.textContent = `${pt.item.rawWpm} WPM`;

        if (tooltipErrRow) {
          if (pt.item.errors > 0) {
            const isFixed = (pt.item.fixed >= pt.item.errors) || (pt.item.fixed > 0);
            if (isFixed) {
              tooltipErrRow.innerHTML = `<span class="dot-indicator dot-fixed"></span> Errors: <strong>${pt.item.errors}</strong> <span class="badge-fixed">(Fixed ✓)</span>`;
            } else {
              tooltipErrRow.innerHTML = `<span class="dot-indicator dot-err"></span> Errors: <strong>${pt.item.errors}</strong> <span class="badge-unfixed">(Unfixed ✗)</span>`;
            }
          } else {
            tooltipErrRow.innerHTML = `<span class="dot-indicator dot-fixed"></span> Errors: <strong>0</strong>`;
          }
        }

        chartTooltip.style.left = `${pt.x + 20}px`;
        chartTooltip.style.top = `${pt.y + 16}px`;
        chartTooltip.classList.add("visible");
      }

      if (chartHoverStats) {
        const isFixed = (pt.item.fixed >= pt.item.errors) || (pt.item.fixed > 0);
        const errBadge = pt.item.errors > 0
          ? (isFixed
              ? `<span class="badge-fixed">${pt.item.errors} error (fixed ✓)</span>`
              : `<span class="badge-unfixed">${pt.item.errors} error (unfixed)</span>`)
          : `<span style="color: var(--sub-color);">0 errors</span>`;

        chartHoverStats.innerHTML = `${pt.item.second}s &bull; <strong style="color: var(--main-color);">${pt.item.wpm} Avg WPM</strong> &bull; <strong style="color: #2dd4bf;">${pt.item.burstWpm || pt.item.wpm} Pace (3s)</strong> &bull; ${errBadge}`;
      }
    } else {
      clearChartHover();
    }
  }

  function clearChartHover() {
    if (hoveredPointIndex !== null) {
      hoveredPointIndex = null;
      renderChart(null);
      if (chartTooltip) chartTooltip.classList.remove("visible");
      if (chartHoverStats) chartHoverStats.textContent = "Hover or tap points for details";
    }
  }

  // Reset or Start New Session
  function resetTest() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTestActive = false;
    isTestFinished = false;
    timeLeft = testDuration;
    currentWordIdx = 0;
    currentCharIdx = 0;
    wordStartTime = 0;
    lastWordEndTime = 0;
    hadBackspaceOnCurrentWord = false;
    if (typeof resetRecentHistory === "function") resetRecentHistory();
    scrollOffset = 0;
    correctKeystrokes = 0;
    incorrectKeystrokes = 0;
    extraCharsCount = 0;
    missedCharsCount = 0;
    rawKeystrokes = 0;
    totalFixedErrors = 0;
    currentSecondErrors = 0;
    currentSecondFixed = 0;
    lastSecCorrect = 0;
    lastSecRaw = 0;
    secondDeltas = [];
    wpmHistory = [];
    chartDataPoints = [];
    hoveredPointIndex = null;
    rollingKeystrokeTimestamps = [];
    flowStreak = 0;
    flowMomentum = 0;
    visualMomentum = 0;
    lastKeystrokeTime = 0;
    eggChance = 0.0;
    consecutiveCleanWords = 0;
    hatchingSlotIndex = -1;
    hatchTyped = "";
    revealedSlots = {};
    eggsHatchedInSession = false;
    lastRenderedMomentum = -1;

    // Reset pace visual & flow atmosphere
    wordsBox.classList.remove("pace-paused");
    renderFlowAtmosphere(0);

    // Switch view sections
    resultsSection.classList.remove("visible");
    testSection.style.display = "flex";

    // Synchronize mode tabs
    tabClassic.classList.toggle("active", currentMode === "classic");
    tabFlow.classList.toggle("active", currentMode === "flow");

    // Dismiss focus overlay
    focusOverlay.classList.remove("visible");

    if (currentMode === "classic") {
      timerEl.style.display = "block";
      flowGauge.style.display = "none";
      classicDurationPill.style.display = "flex";
      flowTargetPill.style.display = "none";
      if (eggBasketBtn) eggBasketBtn.style.display = "none";
      levelHudCard.style.display = "none";
      timerEl.textContent = testDuration;
      restartBtnLabel.textContent = "restart test";
      liveStats.classList.remove("visible");
      liveWpmEl.textContent = "0";
      liveAccEl.textContent = "100%";
    } else {
      // Flow RPG Mode
      timerEl.style.display = "none";
      flowGauge.style.display = "flex";
      classicDurationPill.style.display = "none";
      flowTargetPill.style.display = "flex";
      if (eggBasketBtn) eggBasketBtn.style.display = "none";
      levelHudCard.style.display = "flex";
      restartBtnLabel.textContent = "restart flow";
      updateTargetWpmPill();
      updateLevelHud();
      updateEggBasketHud();
      updateFlowGaugeUI(0);
    }

    if (chartTooltip) chartTooltip.classList.remove("visible");
    if (chartHoverStats) chartHoverStats.textContent = "Hover or tap points for details";

    // Rebuild words
    generateWords(70);

    updateCaret();
    focusInput();
  }

  function focusInput() {
    if (hatchingSlotIndex !== -1 || (statsModal && statsModal.style.display !== "none")) {
      return;
    }
    focusOverlay.classList.remove("visible");
    typingInput.value = "";
    try {
      typingInput.focus();
    } catch (e) {
      // Ignore if browser restricts programmatic focus before gesture
    }
  }

  // Word Completion (Space Key)
  function handleSpace() {
    if (currentCharIdx === 0) return; // Prevent skipping without typing anything

    initAudio();
    playKeySound(true, currentMode === "flow" ? flowStreak : 0);

    if (!isTestActive) startTimer();

    const wordElements = wordsWrapper.querySelectorAll(".word");
    const currentWordEl = wordElements[currentWordIdx];
    if (!currentWordEl) return;
    const letterElements = currentWordEl.querySelectorAll(".letter:not(.extra)");

    // Check if word was left incomplete
    if (currentCharIdx < letterElements.length) {
      currentWordEl.classList.add("error");
      for (let i = currentCharIdx; i < letterElements.length; i++) {
        letterElements[i].classList.add("incorrect");
        missedCharsCount++;
        currentSecondErrors++;
      }
    }

    // Check errors
    const hasErrors = !!currentWordEl.querySelector(".incorrect, .extra");
    if (hasErrors) {
      currentWordEl.classList.add("error");
    } else {
      currentWordEl.classList.remove("error");
    }

    // Flow Game Mode: Paced Streak, XP Multiplier, SRS Tracking & Egg Rolls
    if (currentMode === "flow") {
      const now = performance.now();
      lastKeystrokeTime = now;
      // Cadence calculation: elapsed time from previous word completion (lastWordEndTime)
      // or wordStartTime if this is the first word in the test/session.
      const baseTime = lastWordEndTime || wordStartTime || (now - 600);
      const elapsedWordSec = Math.max(0.20, (now - baseTime) / 1000);
      lastWordEndTime = now;
      const wordLength = (currentWordEl.dataset.word || "").length + 1;
      const wordCadenceWpm = Math.round((wordLength / 5) * (60 / elapsedWordSec));
      const instantaneousWpm = getInstantaneousWpm();
      // Calibrated Live WPM: blends cycle cadence and rolling key stream
      const liveWpm = Math.round(0.5 * wordCadenceWpm + 0.5 * instantaneousWpm);

      const target = gameState.targetWpm || 40;
      const wordText = currentWordEl.dataset.word;
      const rankIdx = RANKED_WORDS.indexOf(wordText);
      const rank = rankIdx !== -1 ? rankIdx + 1 : 1;
      const wordObj = (typeof DICTIONARY !== "undefined" && DICTIONARY[rank - 1]) || classifyWord(wordText, rank - 1);
      const isHadBackspace = hadBackspaceOnCurrentWord;
      hadBackspaceOnCurrentWord = false;

      // Fluid Pending Clear: If hatched words were displayed in nest slots,
      // free up the slots back to [ · ] now that the player has completed their first board word!
      if (Object.keys(revealedSlots).length > 0) {
        revealedSlots = {};
        renderNestSlots();
      }

      if (hasErrors) {
        // Severe Mistake Penalty:
        // Uncorrected typo on Space wipes 120% apex cushion to 0, subtracts -25% momentum,
        // breaks streaks to 0, resets consecutive clean words, and zeroes egg chance!
        wordsBox.classList.add("pace-paused");

        // Wipe cushion (anything > 100) and subtract 25% momentum
        flowMomentum = Math.max(0, Math.min(100.0, flowMomentum) - 25.0);
        flowStreak = 0;
        consecutiveCleanWords = 0;
        eggChance = 0.0;

        const mult = getFlowMultiplier(flowMomentum);
        const baseXp = getWordBaseXp(rank);
        const earnedXp = Math.max(1, Math.round(baseXp * mult * 0.25));

        const xpRes = StorageManager.addXp(earnedXp);
        gameState = xpRes.save;
        updateLevelHud();

        // Spawn XP toast without flow glow
        spawnXpToast(earnedXp, mult, currentWordEl, false, false);

        StorageManager.updateWordStat(rank, true, isHadBackspace, liveWpm, target);
        if (typeof updatePatternHeat === "function") {
          updatePatternHeat(wordObj, false, true);
        }
        updateFlowGaugeUI(liveWpm);
      } else if (liveWpm >= target) {
        // Paced Clean Hit! Inhale into flow momentum reservoir
        wordsBox.classList.remove("pace-paused");
        flowStreak++;
        consecutiveCleanWords++;
        if (flowStreak > (gameState.highStreak || 0)) {
          gameState.highStreak = flowStreak;
        }

        // Weighted Flywheel Inhale: takes ~10 words to reach 100%, builds cushion up to 120%
        const speedBonus = Math.min(5.0, Math.max(0, ((liveWpm - target) / target) * 8.0));
        const deltaBase = 6.0 + (Math.min(100.0, flowMomentum) / 100.0) * 10.0;
        flowMomentum = Math.min(120.0, flowMomentum + deltaBase + speedBonus);

        const mult = getFlowMultiplier(flowMomentum);

        // Calculate XP
        const baseXp = getWordBaseXp(rank);
        const earnedXp = Math.max(1, Math.round(baseXp * mult));

        // Add XP and check Level-Up
        const xpRes = StorageManager.addXp(earnedXp);
        gameState = xpRes.save;
        updateLevelHud();

        // Spawn floating XP toast (rainbow when at 100% flow!)
        spawnXpToast(earnedXp, mult, currentWordEl, false, flowMomentum >= 100);

        // Level-Up Fanfare & Guaranteed Bonus Egg (if basket < 3)
        if (xpRes.leveledUp) {
          playLevelUpSound();
          if ((gameState.eggBasket || []).length < 3) {
            const bonusEgg = rollNewEgg(gameState.unlockedRanks, flowStreak, xpRes.bonusEggRarity, gameState.wordStats, gameState.targetWpm);
            StorageManager.addEgg(bonusEgg);
            gameState = StorageManager.getGameSave();
            renderNestSlots();
            spawnXpToast(`LVL UP! 🎁 ${bonusEgg.name}`, 1.0, currentWordEl, true);
          } else {
            spawnXpToast(`LVL UP! 🎁 Max Eggs`, 1.0, currentWordEl, true);
          }
        }

        // Mastery-Gated Egg Drop Roll:
        // Out of flow (< 100 momentum): chance is 0.0%!
        // In flow (>= 100 momentum): starts at 0.5% after 3 consecutive clean words,
        // scaling +0.1% per clean word up to 3.5% max (averaging 1 egg per ~35-45 clean words).
        // Nest hard cap strictly at 3 eggs.
        const basket = gameState.eggBasket || [];
        if (flowMomentum >= 100 && basket.length < 3 && consecutiveCleanWords >= 3) {
          eggChance = Math.min(3.5, 0.5 + (consecutiveCleanWords - 3) * 0.1);
          const roll = Math.random() * 100;
          if (roll < eggChance) {
            const droppedEgg = rollNewEgg(gameState.unlockedRanks, flowStreak, null, gameState.wordStats, gameState.targetWpm);
            StorageManager.addEgg(droppedEgg);
            gameState = StorageManager.getGameSave();
            playEggDropSound();
            renderNestSlots();
            consecutiveCleanWords = 0;
            eggChance = 0.0;
            spawnXpToast(`🥚 ${droppedEgg.name}!`, 1.0, currentWordEl, true);
          }
        } else {
          eggChance = 0.0;
        }

        // Update Spaced Repetition stats and session pattern heat
        StorageManager.updateWordStat(rank, false, isHadBackspace, liveWpm, target);
        if (typeof updatePatternHeat === "function") {
          updatePatternHeat(wordObj, !isHadBackspace, isHadBackspace);
        }
        updateFlowGaugeUI(liveWpm);
      } else {
        // Clean word, but below target pace: Gentle Exhale
        // Flywheel Apex Cushion dampens stumbles when at top speed!
        wordsBox.classList.add("pace-paused");
        const exhaleAmount = flowMomentum >= 100 ? 8.0 : 12.0;
        flowMomentum = Math.max(0, flowMomentum - exhaleAmount);
        flowStreak = Math.max(0, flowStreak - 2);
        consecutiveCleanWords = 0;
        eggChance = 0.0;

        const mult = getFlowMultiplier(flowMomentum);
        const baseXp = getWordBaseXp(rank);
        const earnedXp = Math.max(1, Math.round(baseXp * mult * 0.8));

        const xpRes = StorageManager.addXp(earnedXp);
        gameState = xpRes.save;
        updateLevelHud();

        // Spawn XP toast
        spawnXpToast(earnedXp, mult, currentWordEl, false, flowMomentum >= 100);

        StorageManager.updateWordStat(rank, false, isHadBackspace, liveWpm, target);
        if (typeof updatePatternHeat === "function") {
          updatePatternHeat(wordObj, false, isHadBackspace);
        }
        updateFlowGaugeUI(liveWpm);
      }
    }

    // Move to next word
    currentWordEl.classList.remove("active");
    currentWordIdx++;
    wordStartTime = 0;

    // Dynamically append more words as user approaches end
    if (currentWordIdx >= wordElements.length - 10) {
      const moreWords = currentMode === "flow"
        ? getSrsWeightedRandomWords(gameState.unlockedRanks, gameState.wordStats, gameState.targetWpm, 30, flowMomentum)
        : getRandomWords(30);

      moreWords.forEach((word) => {
        const wEl = document.createElement("div");
        wEl.className = "word";
        wEl.dataset.word = word;
        for (let i = 0; i < word.length; i++) {
          const lEl = document.createElement("span");
          lEl.className = "letter";
          lEl.textContent = word[i];
          wEl.appendChild(lEl);
        }
        wordsWrapper.appendChild(wEl);
      });
    }

    const nextWordEl = wordsWrapper.querySelectorAll(".word")[currentWordIdx];
    if (nextWordEl) {
      nextWordEl.classList.add("active");
    }
    currentCharIdx = 0;
    updateCaret();
  }

  // Backspace Handling with Error Fix Detection
  function handleBackspace() {
    initAudio();
    lastKeystrokeTime = performance.now();
    hadBackspaceOnCurrentWord = true;
    playKeySound(false, currentMode === "flow" ? flowStreak : 0);

    const wordElements = wordsWrapper.querySelectorAll(".word");
    const currentWordEl = wordElements[currentWordIdx];
    if (!currentWordEl) return;
    const letterElements = currentWordEl.querySelectorAll(".letter:not(.extra)");

    if (currentCharIdx > 0) {
      const extraLetters = currentWordEl.querySelectorAll(".letter.extra");
      if (extraLetters.length > 0) {
        const lastExtra = extraLetters[extraLetters.length - 1];
        lastExtra.remove();
        currentCharIdx--;
        if (extraCharsCount > 0) extraCharsCount--;
        currentSecondFixed++;
        totalFixedErrors++;
      } else {
        currentCharIdx--;
        const letter = letterElements[currentCharIdx];
        if (letter) {
          if (letter.classList.contains("incorrect")) {
            currentSecondFixed++;
            totalFixedErrors++;
          }
          letter.className = "letter";
        }
      }
      checkWordErrorState(currentWordEl);
      updateCaret();
    } else if (currentCharIdx === 0 && currentWordIdx > 0) {
      const prevWordEl = wordElements[currentWordIdx - 1];
      if (prevWordEl && prevWordEl.classList.contains("error")) {
        currentWordEl.classList.remove("active");
        prevWordEl.classList.add("active");
        currentWordIdx--;
        const allLetters = prevWordEl.querySelectorAll(".letter");
        currentCharIdx = allLetters.length;
        updateCaret();
      }
    }
  }

  function revertLastKeystrokes(count) {
    const wordElements = wordsWrapper.querySelectorAll(".word");
    const currentWordEl = wordElements[currentWordIdx];
    if (!currentWordEl) return;
    for (let c = 0; c < count; c++) {
      if (currentCharIdx > 0) {
        currentCharIdx--;
        const extraLetters = currentWordEl.querySelectorAll(".letter.extra");
        if (extraLetters.length > 0) {
          extraLetters[extraLetters.length - 1].remove();
          extraCharsCount = Math.max(0, extraCharsCount - 1);
        } else {
          const letterElements = currentWordEl.querySelectorAll(".letter:not(.extra)");
          if (letterElements[currentCharIdx]) {
            letterElements[currentCharIdx].classList.remove("correct", "incorrect");
          }
        }
      }
    }
    checkWordErrorState(currentWordEl);
    updateCaret();
  }

  // Single Character Input Handling
  function handleChar(char) {
    if (char === " " || char === "Spacebar") {
      handleSpace();
      return;
    }

    // Direct Egg Crack Shortcut: If user has eggs in nest and types "egg" anywhere
    if (currentMode === "flow" && (gameState.eggBasket || []).length > 0) {
      if (char.toLowerCase() === "e") {
        directEggBuffer = "e";
      } else if (directEggBuffer === "e" && char.toLowerCase() === "g") {
        directEggBuffer = "eg";
      } else if (directEggBuffer === "eg" && char.toLowerCase() === "g") {
        directEggBuffer = "";
        // Revert any erroneous 'e' and 'g' letters applied to the active word
        revertLastKeystrokes(2);
        completeHatchAction(0);
        return;
      } else {
        directEggBuffer = "";
      }
    } else {
      directEggBuffer = "";
    }

    initAudio();
    playKeySound(false, currentMode === "flow" ? flowStreak : 0);

    if (!isTestActive) {
      startTimer();
    }

    rawKeystrokes++;
    const now = performance.now();
    lastKeystrokeTime = now;
    if (currentCharIdx === 0) {
      wordStartTime = now;
    }
    rollingKeystrokeTimestamps.push(now);

    const wordElements = wordsWrapper.querySelectorAll(".word");
    const currentWordEl = wordElements[currentWordIdx];
    if (!currentWordEl) return;

    const letterElements = currentWordEl.querySelectorAll(".letter:not(.extra)");
    const targetWord = currentWordEl.dataset.word;

    if (currentCharIdx < letterElements.length) {
      const letter = letterElements[currentCharIdx];
      const targetChar = targetWord[currentCharIdx];

      if (char === targetChar) {
        letter.classList.add("correct");
        correctKeystrokes++;
      } else {
        letter.classList.add("incorrect");
        incorrectKeystrokes++;
        currentSecondErrors++;
      }
      currentCharIdx++;
    } else {
      if (currentCharIdx < letterElements.length + 15) {
        const extraLetter = document.createElement("span");
        extraLetter.className = "letter extra incorrect";
        extraLetter.textContent = char;
        currentWordEl.appendChild(extraLetter);
        currentCharIdx++;
        extraCharsCount++;
        incorrectKeystrokes++;
        currentSecondErrors++;
      }
    }

    if (currentMode === "flow") {
      updateFlowGaugeUI(getInstantaneousWpm());
    }

    checkWordErrorState(currentWordEl);
    updateCaret();
  }

  let lastKeyHandled = false;

  // Handle Keyboard Events
  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      lastTabPressTime = Date.now();

      // If in Hatch Mode: Tab exits hatch mode, returns to typing & refreshes words!
      if (hatchingSlotIndex !== -1) {
        exitHatchMode();
        return;
      }

      // If in Flow mode and eggs are available in the nest: Tab enters Hatch Mode!
      if (currentMode === "flow") {
        const basket = gameState.eggBasket || [];
        if (basket.length > 0) {
          enterHatchMode();
          return;
        }
      }

      // If no eggs in nest, or in Classic mode: Tab restarts test!
      resetTest();
      return;
    }

    if (e.key === "Enter") {
      // Tab + Enter restarts test in both modes regardless of nest state!
      if (Date.now() - lastTabPressTime < 1500) {
        e.preventDefault();
        if (hatchingSlotIndex !== -1) {
          exitHatchMode();
        }
        resetTest();
        return;
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      if (hatchingSlotIndex !== -1) {
        exitHatchMode();
        return;
      }
      if (statsModal && statsModal.style.display !== "none") {
        closeStats();
        return;
      }
      resetTest();
      return;
    }

    // Hatching active controls: type 'e' 'g' 'g' to crack active egg
    if (hatchingSlotIndex !== -1) {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (hatchTyped.length > 0) {
          hatchTyped = hatchTyped.slice(0, -1);
          updateCrackPromptUI(hatchingSlotIndex);
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        handleHatchKeystroke(e.key);
        return;
      }
      return;
    }

    // Results screen controls
    if (isTestFinished) {
      if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
        e.preventDefault();
        return; // Prevent accidental spacebar restart!
      }
      if (Date.now() - testFinishedTime < 500) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        resetTest();
      }
      return;
    }

    if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
      e.preventDefault();
      lastKeyHandled = true;
      handleSpace();
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      lastKeyHandled = true;
      handleBackspace();
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      lastKeyHandled = true;
      handleChar(e.key);
      return;
    }
  }

  // Mobile virtual keyboard (IME / beforeinput)
  typingInput.addEventListener("beforeinput", (e) => {
    if (isTestFinished || hatchingSlotIndex !== -1 || (statsModal && statsModal.style.display !== "none")) return;
    if (lastKeyHandled) {
      lastKeyHandled = false;
      return;
    }

    if (e.inputType === "deleteContentBackward") {
      e.preventDefault();
      handleBackspace();
    } else if (e.inputType === "insertText" && e.data) {
      e.preventDefault();
      for (const ch of e.data) {
        if (ch === " ") {
          handleSpace();
        } else {
          handleChar(ch);
        }
      }
    }
    typingInput.value = "";
  });

  // Global Keydown Listener
  window.addEventListener("keydown", (e) => {
    if (statsModal && statsModal.style.display !== "none") {
      if (e.key === "Escape") {
        closeStats();
        return;
      }
      return;
    }

    // Isolate difficulty input so typing numbers, space, or backspace doesn't trigger board actions
    if (diffInput && document.activeElement === diffInput) {
      return;
    }

    if (hatchingSlotIndex !== -1) {
      handleKeyDown(e);
      return;
    }

    if (document.activeElement !== typingInput && !isTestFinished) {
      if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") {
        focusInput();
      }
    }
    handleKeyDown(e);
  });

  // 3-Slot In-Situ Egg Nest Logic (Keyboard Native, Zero Modals)
  function renderNestSlots() {
    if (!eggNest) return;
    gameState = StorageManager.getGameSave();
    const basket = gameState.eggBasket || [];

    let eggBasketIdx = 0;
    for (let i = 0; i < 3; i++) {
      const slotEl = nestSlots[i];
      if (!slotEl) continue;

      slotEl.className = "nest-slot";
      slotEl.removeAttribute("style");

      if (revealedSlots[i]) {
        // Slot displays the freshly hatched word!
        slotEl.classList.add("revealed-word");
        slotEl.innerHTML = `<span class="revealed-word-text">✨ ${revealedSlots[i]}</span>`;
        slotEl.title = `Hatched: ${revealedSlots[i]} • Clears on your next completed word`;
      } else if (eggBasketIdx < basket.length) {
        const egg = basket[eggBasketIdx];
        const currentEggIdx = eggBasketIdx;
        eggBasketIdx++;

        slotEl.classList.add("has-egg");
        slotEl.style.setProperty("--slot-egg-color", egg.color || "#38bdf8");

        const isFocused = (hatchingSlotIndex === i);
        if (isFocused) {
          slotEl.classList.add("hatch-focused");
        }

        const eClass = (isFocused && hatchTyped.length >= 1) ? "typed" : "untyped";
        const g1Class = (isFocused && hatchTyped.length >= 2) ? "typed" : "untyped";
        const g2Class = (isFocused && hatchTyped.length >= 3) ? "typed" : "untyped";

        slotEl.innerHTML = `
          <span class="egg-glyph">🥚</span>
          <div class="nest-crack-prompt" id="crack-prompt-${i}">
            <span class="p-e ${eClass}">e</span>
            <span class="p-g1 ${g1Class}">g</span>
            <span class="p-g2 ${g2Class}">g</span>
          </div>
        `;
        slotEl.title = `${egg.name} (${egg.rarity || "Egg"}) • Type 'egg' to hatch`;
        slotEl.dataset.eggIndex = currentEggIdx;
      } else {
        // Empty slot
        slotEl.innerHTML = `<span class="slot-dot">·</span>`;
        slotEl.title = "Empty Nest Slot (Max 3)";
      }
    }

    if (nestHint) {
      if (hatchingSlotIndex !== -1) {
        nestHint.classList.add("visible");
        nestHint.textContent = "type 'egg' (tab: back)";
      } else if (basket.length > 0) {
        nestHint.classList.add("visible");
        nestHint.textContent = "tab: hatch";
      } else {
        nestHint.classList.remove("visible");
      }
    }
  }

  function enterHatchMode(slotIdx = -1) {
    initAudio();
    gameState = StorageManager.getGameSave();
    const basket = gameState.eggBasket || [];
    if (basket.length === 0) return;

    let targetIdx = slotIdx;
    if (targetIdx < 0 || targetIdx >= 3 || revealedSlots[targetIdx]) {
      // Find first unrevealed slot that has an egg
      targetIdx = -1;
      let count = 0;
      for (let i = 0; i < 3; i++) {
        if (!revealedSlots[i]) {
          if (count < basket.length) {
            targetIdx = i;
            break;
          }
          count++;
        }
      }
    }
    if (targetIdx === -1) return;

    hatchingSlotIndex = targetIdx;
    hatchTyped = "";
    renderNestSlots();
  }

  function exitHatchMode() {
    hatchingSlotIndex = -1;
    hatchTyped = "";
    if (eggsHatchedInSession) {
      eggsHatchedInSession = false;
      gameState = StorageManager.getGameSave();
      generateWords(70);
      currentWordIdx = 0;
      currentCharIdx = 0;
      wordStartTime = 0;
      lastWordEndTime = 0;
      scrollOffset = 0;
      wordsWrapper.style.transform = "translateY(0px)";
      updateCaret();
      spawnXpToast("✨ Deck updated with new words!", 1.0, null, true);
    }
    renderNestSlots();
    focusInput();
  }

  function updateCrackPromptUI(slotIdx) {
    const slotEl = nestSlots[slotIdx];
    if (!slotEl) return;
    const promptEl = slotEl.querySelector(".nest-crack-prompt");
    if (!promptEl) return;

    const eClass = hatchTyped.length >= 1 ? "typed" : "untyped";
    const g1Class = hatchTyped.length >= 2 ? "typed" : "untyped";
    const g2Class = hatchTyped.length >= 3 ? "typed" : "untyped";

    promptEl.innerHTML = `
      <span class="p-e ${eClass}">e</span>
      <span class="p-g1 ${g1Class}">g</span>
      <span class="p-g2 ${g2Class}">g</span>
    `;
  }

  function handleHatchKeystroke(key) {
    initAudio();
    const targetWord = "egg";
    const expectedChar = targetWord[hatchTyped.length];
    const slotEl = nestSlots[hatchingSlotIndex];

    if (key.toLowerCase() === expectedChar) {
      hatchTyped += key.toLowerCase();
      updateCrackPromptUI(hatchingSlotIndex);

      if (hatchTyped === "e") {
        playFractureSound();
        if (slotEl) {
          slotEl.classList.remove("wobble-1", "wobble-2");
          void slotEl.offsetWidth;
          slotEl.classList.add("wobble-1");
        }
      } else if (hatchTyped === "eg") {
        playFractureSound();
        if (slotEl) {
          slotEl.classList.remove("wobble-1", "wobble-2");
          void slotEl.offsetWidth;
          slotEl.classList.add("wobble-2");
        }
      } else if (hatchTyped === "egg") {
        completeHatchAction(hatchingSlotIndex);
      }
    } else if (key.toLowerCase() === "e") {
      hatchTyped = "e";
      updateCrackPromptUI(hatchingSlotIndex);
      playFractureSound();
      if (slotEl) {
        slotEl.classList.remove("wobble-1", "wobble-2");
        void slotEl.offsetWidth;
        slotEl.classList.add("wobble-1");
      }
    } else {
      if (slotEl) {
        slotEl.classList.add("wobble-1");
        setTimeout(() => slotEl.classList.remove("wobble-1"), 200);
      }
    }
  }

  function completeHatchAction(slotIdx) {
    playHatchSound();
    // In our sequential egg assignment, the focused egg is always the first unhatched egg in basket (index 0)
    const res = StorageManager.hatchEgg(0);
    if (res.success) {
      gameState = res.save;
      revealedSlots[slotIdx] = res.egg.word;
      eggsHatchedInSession = true;

      spawnXpToast(`✨ ${res.egg.word} Unlocked!`, 1.0, null, true);

      const remainingBasket = gameState.eggBasket || [];
      if (remainingBasket.length > 0) {
        // Find next slot that has an egg to hatch
        let nextSlot = -1;
        for (let i = 0; i < 3; i++) {
          if (i !== slotIdx && !revealedSlots[i]) {
            nextSlot = i;
            break;
          }
        }
        if (nextSlot !== -1) {
          hatchingSlotIndex = nextSlot;
          hatchTyped = "";
          renderNestSlots();
          return;
        }
      }

      // All eggs in nest have now been hatched!
      hatchingSlotIndex = -1;
      hatchTyped = "";
      renderNestSlots();
      setTimeout(() => {
        exitHatchMode();
      }, 550);
    } else {
      exitHatchMode();
    }
  }

  let activeDeckFilter = "all";

  function renderDeckExplorer(filter = "all") {
    if (!deckWordsScroll) return;
    activeDeckFilter = filter;
    deckWordsScroll.innerHTML = "";

    const unlocked = gameState.unlockedRanks || [1];
    let filteredRanks = unlocked;

    if (filter !== "all") {
      filteredRanks = unlocked.filter(rank => {
        const meta = getWordMetadata(rank);
        return meta.bucketId === filter;
      });
    }

    if (filteredRanks.length === 0) {
      deckWordsScroll.innerHTML = `<span style="color: var(--sub-color); font-size: 12px; padding: 10px;">No words unlocked in this motor pattern yet.</span>`;
      return;
    }

    filteredRanks.forEach(rank => {
      const meta = getWordMetadata(rank);
      const st = (gameState.wordStats && gameState.wordStats[rank]) || {};
      const errors = (st.unfixedErr || 0) + (st.fixedErr || 0) || (st.errorCount || 0);
      const wpm = Math.round(st.avgWpm ?? st.lastWpm ?? 0);
      const cleanHits = st.streak ?? st.cleanHits ?? 0;
      
      let srsBadge = "🌱";
      let srsTitle = "New Discovery";
      if (errors > 0 || (wpm > 0 && wpm < (gameState.targetWpm || 40))) {
        srsBadge = "⚠️";
        srsTitle = "Practicing (Needs Rhythm)";
      } else if (cleanHits >= 4) {
        srsBadge = "⭐";
        srsTitle = "Mastered";
      } else if (cleanHits >= 1) {
        srsBadge = "⚡";
        srsTitle = "In Flow";
      }

      const chip = document.createElement("div");
      chip.className = "deck-word-chip";
      chip.style.borderColor = meta.bucketColor || "var(--border-color)";
      chip.title = `${meta.bucketName} • ${srsTitle} • Clean hits: ${cleanHits} • Avg: ${wpm} WPM`;
      chip.innerHTML = `
        <span class="deck-chip-srs">${srsBadge}</span>
        <strong style="color: var(--text-color);">${meta.word}</strong>
        <span style="font-size: 10px; color: ${meta.tierColor}; text-transform: uppercase;">${meta.tierName}</span>
      `;
      deckWordsScroll.appendChild(chip);
    });
  }

  function switchStatsTab(tabName) {
    if (!tabStatsFlow || !tabStatsClassic) return;
    if (tabName === "flow") {
      tabStatsFlow.classList.add("active");
      tabStatsClassic.classList.remove("active");
      if (paneStatsFlow) paneStatsFlow.style.display = "flex";
      if (paneStatsClassic) paneStatsClassic.style.display = "none";
    } else {
      tabStatsClassic.classList.add("active");
      tabStatsFlow.classList.remove("active");
      if (paneStatsClassic) paneStatsClassic.style.display = "flex";
      if (paneStatsFlow) paneStatsFlow.style.display = "none";
    }
  }

  // Lifetime Stats Modal Logic
  function openStats(defaultTab = null) {
    statsModal.style.display = "flex";

    // Reset the board on entering the menu so cursor does not linger
    resetTest();
    typingInput.blur();

    const targetTab = defaultTab || (currentMode === "flow" ? "flow" : "classic");
    switchStatsTab(targetTab);

    // Populate Flow RPG Overview & Keybr Motor Mastery
    if (statsRpgLevel) {
      statsRpgLevel.textContent = `Lv. ${gameState.level}`;
      statsRpgTitle.textContent = StorageManager.getLevelTitle(gameState.level);
      const reqXp = StorageManager.getXpForLevel(gameState.level);
      statsRpgXp.textContent = `${gameState.currentXp} / ${reqXp} XP`;
      const pct = Math.min(100, Math.round((gameState.currentXp / reqXp) * 100));
      if (statsRpgXpBar) statsRpgXpBar.style.width = `${pct}%`;

      const unlockedCount = (gameState.unlockedRanks || [1]).length;
      if (statsRpgWordsCount) statsRpgWordsCount.textContent = `${unlockedCount} / 1,000 (${((unlockedCount / 1000) * 100).toFixed(1)}%)`;
      if (deckUnlockedCount) deckUnlockedCount.textContent = unlockedCount;
      if (statsRpgEggsCount) statsRpgEggsCount.textContent = Math.max(0, unlockedCount - 1);
      if (statsRpgHighStreak) statsRpgHighStreak.textContent = `${gameState.highStreak || 0} words`;

      // Populate Keybr Motor Patterns Grid
      const bucketStats = StorageManager.getBucketStats(gameState);
      if (motorGrid) {
        motorGrid.innerHTML = "";
        Object.values(bucketStats).forEach(b => {
          const card = document.createElement("div");
          card.className = `motor-card ${b.isProficient ? "proficient" : ""} ${!b.isDiscovered ? "locked" : ""}`;
          card.style.borderColor = b.isDiscovered ? b.bucketColor : "var(--border-color)";

          let statusText = "🔒 Undiscovered";
          let statusClass = "locked";
          if (b.isDiscovered) {
            if (b.isProficient) {
              statusText = "⚡ Flowing";
              statusClass = "proficient";
            } else {
              statusText = "🌱 Developing";
              statusClass = "developing";
            }
          }

          card.innerHTML = `
            <div class="motor-card-header">
              <span class="motor-badge" style="color: ${b.bucketColor};">${b.bucketTag}</span>
              <span class="motor-status-pill ${statusClass}">${statusText}</span>
            </div>
            <div class="motor-desc">${b.description}</div>
            <div class="motor-metrics-row">
              <div class="motor-metric">
                <span class="motor-metric-label">Words</span>
                <span class="motor-metric-val">${b.count}</span>
              </div>
              <div class="motor-metric">
                <span class="motor-metric-label">Avg Pace</span>
                <span class="motor-metric-val" style="color: ${b.avgWpm >= (gameState.targetWpm || 40) ? '#34d399' : 'var(--text-color)'};">${b.avgWpm} WPM</span>
              </div>
              <div class="motor-metric">
                <span class="motor-metric-label">Clean Hits</span>
                <span class="motor-metric-val">${b.avgHits}</span>
              </div>
            </div>
          `;
          motorGrid.appendChild(card);
        });
      }

      renderDeckExplorer(activeDeckFilter);
    }

    // Populate Classic Stats
    const stats = StorageManager.getClassicStats();
    if (stats.personalBests["15"] && stats.personalBests["15"].wpm > 0) {
      pb15s.textContent = `${stats.personalBests["15"].wpm} WPM`;
      pb15sDate.textContent = `${stats.personalBests["15"].acc}% acc`;
    } else {
      pb15s.textContent = "--";
      pb15sDate.textContent = "No runs yet";
    }

    if (stats.personalBests["30"] && stats.personalBests["30"].wpm > 0) {
      pb30s.textContent = `${stats.personalBests["30"].wpm} WPM`;
      pb30sDate.textContent = `${stats.personalBests["30"].acc}% acc`;
    } else {
      pb30s.textContent = "--";
      pb30sDate.textContent = "No runs yet";
    }

    if (stats.personalBests["60"] && stats.personalBests["60"].wpm > 0) {
      pb60s.textContent = `${stats.personalBests["60"].wpm} WPM`;
      pb60sDate.textContent = `${stats.personalBests["60"].acc}% acc`;
    } else {
      pb60s.textContent = "--";
      pb60sDate.textContent = "No runs yet";
    }

    statsTotalTests.textContent = stats.totalTests;
    statsTotalWords.textContent = stats.totalWords;
    statsTotalKeys.textContent = stats.totalKeystrokes;
    statsTotalTime.textContent = `${Math.round(stats.totalTimeSeconds / 60)}m`;

    statsHistoryTbody.innerHTML = "";
    if (stats.recentHistory && stats.recentHistory.length > 0) {
      stats.recentHistory.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.date}</td>
          <td>${item.duration}s</td>
          <td><strong style="color: var(--main-color);">${item.wpm}</strong></td>
          <td>${item.rawWpm}</td>
          <td>${item.acc}%</td>
        `;
        statsHistoryTbody.appendChild(row);
      });
    } else {
      statsHistoryTbody.innerHTML = `<tr><td colspan="5" style="color: var(--sub-color); text-align: center;">No tests recorded yet. Complete a test to see records!</td></tr>`;
    }

  }

  function closeStats() {
    statsModal.style.display = "none";
    resetTest();
    focusInput();
  }

  // Reset Flow RPG back to Ground Zero
  function handleResetFlowRpg() {
    const confirmed = window.confirm(
      "Reset Flow RPG progress back to Ground Zero?\n\nThis will reset:\n• Level back to 1 (0 XP)\n• Deck back to 1 word ('the')\n• Empty your egg basket\n• Clear SRS trouble tracking"
    );
    if (!confirmed) return;

    gameState = StorageManager.resetGameSave();
    flowStreak = 0;
    flowMomentum = 0;
    visualMomentum = 0;
    lastKeystrokeTime = 0;
    consecutiveCleanWords = 0;
    eggChance = 0.0;
    hatchingSlotIndex = -1;
    hatchTyped = "";
    revealedSlots = {};
    eggsHatchedInSession = false;

    updateLevelHud();
    updateEggBasketHud();
    updateFlowGaugeUI(0);
    updateTargetWpmPill();

    // Immediately regenerate stage words back to 1 word ("the")
    resetTest();
    spawnXpToast("RPG Reset to Ground Zero!", 1.0, null, true);
  }

  // Clear Classic Records & History
  function handleResetClassicStats() {
    const confirmed = window.confirm(
      "Clear all Classic Mode Personal Bests and recorded test history?"
    );
    if (!confirmed) return;

    StorageManager.resetClassicStats();
    openStats();
    spawnXpToast("Classic Records Cleared", 1.0, null, false);
  }

  // Mode Switcher Helper & Listeners
  function switchMode(newMode) {
    if (newMode !== "classic" && newMode !== "flow") return;
    currentMode = newMode;
    if (typeof StorageManager !== "undefined" && StorageManager.setActiveMode) {
      StorageManager.setActiveMode(newMode);
    }
    tabClassic.classList.toggle("active", currentMode === "classic");
    tabFlow.classList.toggle("active", currentMode === "flow");
    resetTest();
  }

  tabClassic.addEventListener("click", () => {
    tabClassic.blur();
    if (currentMode === "classic") {
      focusInput();
      return;
    }
    switchMode("classic");
  });

  tabFlow.addEventListener("click", () => {
    tabFlow.blur();
    if (currentMode === "flow") {
      focusInput();
      return;
    }
    switchMode("flow");
  });

  // Set and persist target difficulty (WPM)
  function setTargetDifficulty(val) {
    let target = parseInt(val, 10);
    if (isNaN(target) || target < 10) target = 10;
    if (target > 300) target = 300;
    gameState = StorageManager.setTargetWpm(target);
    if (diffSlider) {
      diffSlider.value = Math.min(120, Math.max(15, target));
    }
    if (diffInput && document.activeElement !== diffInput) {
      diffInput.value = target;
    }
    targetItems.forEach((item) => {
      const t = parseInt(item.dataset.target, 10);
      item.classList.toggle("active", t === target);
    });
    updateFlowGaugeUI(0);
  }

  if (diffSlider) {
    diffSlider.addEventListener("input", (e) => {
      setTargetDifficulty(e.target.value);
    });
    diffSlider.addEventListener("change", () => {
      focusInput();
    });
  }

  if (diffInput) {
    diffInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 10) {
        setTargetDifficulty(val);
      }
    });
    diffInput.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        diffInput.blur();
        focusInput();
      }
    });
    diffInput.addEventListener("blur", () => {
      // Re-normalize value on blur if left empty or out of range
      const val = parseInt(diffInput.value, 10);
      setTargetDifficulty(isNaN(val) ? 40 : val);
    });
  }

  // Target WPM Selector Listeners (fallback / legacy buttons)
  targetItems.forEach((item) => {
    item.addEventListener("click", () => {
      targetItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const target = parseInt(item.dataset.target, 10);
      setTargetDifficulty(target);
      focusInput();
    });
  });

  // Nest Slot Click Listeners
  nestSlots.forEach((slot, slotIdx) => {
    if (!slot) return;
    slot.addEventListener("click", () => {
      if (revealedSlots[slotIdx]) return;
      if (slot.classList.contains("has-egg")) {
        if (hatchingSlotIndex === slotIdx) {
          exitHatchMode();
        } else {
          enterHatchMode(slotIdx);
        }
      }
    });
  });

  // Stats and Control Listeners
  if (eggBasketBtn) eggBasketBtn.addEventListener("click", () => enterHatchMode(0));
  if (statsBtn) statsBtn.addEventListener("click", () => openStats());
  if (closeStatsBtn) closeStatsBtn.addEventListener("click", closeStats);
  if (closeStatsFooterBtn) closeStatsFooterBtn.addEventListener("click", closeStats);
  if (resetRpgStatsBtn) resetRpgStatsBtn.addEventListener("click", handleResetFlowRpg);
  if (resetClassicStatsBtn) resetClassicStatsBtn.addEventListener("click", handleResetClassicStats);
  
  if (openDeckMasteryBtn) {
    openDeckMasteryBtn.addEventListener("click", () => {
      openStats("flow");
    });
  }

  if (tabStatsFlow) {
    tabStatsFlow.addEventListener("click", () => switchStatsTab("flow"));
  }
  if (tabStatsClassic) {
    tabStatsClassic.addEventListener("click", () => switchStatsTab("classic"));
  }

  if (deckFilters) {
    deckFilters.querySelectorAll(".deck-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        deckFilters.querySelectorAll(".deck-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderDeckExplorer(btn.dataset.filter);
      });
    });
  }

  // Keep input focused
  wordsBox.addEventListener("click", () => {
    if (hatchingSlotIndex !== -1) {
      exitHatchMode();
    }
    focusInput();
  });
  focusOverlay.addEventListener("click", () => {
    if (hatchingSlotIndex !== -1) {
      exitHatchMode();
    }
    focusInput();
  });

  typingInput.addEventListener("blur", () => {
    if (isTestActive && !isTestFinished && hatchingSlotIndex === -1 && (!statsModal || statsModal.style.display === "none")) {
      focusOverlay.classList.add("visible");
    }
  });

  typingInput.addEventListener("focus", () => {
    focusOverlay.classList.remove("visible");
  });

  restartBtn.addEventListener("click", resetTest);
  brandLogo.addEventListener("click", resetTest);

  nextTestBtn.addEventListener("click", () => {
    if (Date.now() - testFinishedTime < 350) return;
    resetTest();
  });
  nextTestBtn.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  });

  // Classic duration selector
  configItems.forEach((item) => {
    item.addEventListener("click", () => {
      configItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      testDuration = parseInt(item.dataset.time, 10);
      resetTest();
    });
  });

  // Initialize Sound UI state based on saved preference
  if (soundEnabled) {
    soundIconOn.style.display = "block";
    soundIconOff.style.display = "none";
    soundBtn.classList.add("active");
  } else {
    soundIconOn.style.display = "none";
    soundIconOff.style.display = "block";
    soundBtn.classList.remove("active");
  }

  // Sound toggle
  soundBtn.addEventListener("click", () => {
    initAudio();
    soundEnabled = !soundEnabled;
    localStorage.setItem("typeflow_sound_enabled", soundEnabled ? "true" : "false");
    soundIconOn.style.display = soundEnabled ? "block" : "none";
    soundIconOff.style.display = soundEnabled ? "none" : "block";
    soundBtn.classList.toggle("active", soundEnabled);
  });

  // Chart hover & touch listeners
  chartCanvas.addEventListener("mousemove", handleChartInteraction);
  chartCanvas.addEventListener("mouseleave", clearChartHover);
  chartCanvas.addEventListener("touchstart", (e) => { handleChartInteraction(e); }, { passive: true });
  chartCanvas.addEventListener("touchmove", (e) => { handleChartInteraction(e); }, { passive: true });
  chartCanvas.addEventListener("touchend", clearChartHover);

  // Window resize
  window.addEventListener("resize", () => {
    if (!isTestFinished) {
      updateCaret();
    } else {
      renderChart(hoveredPointIndex);
    }
  });

  // Font readiness & load synchronization
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!isTestActive) {
        updateCaret();
      }
    });
  }

  window.addEventListener("load", () => {
    if (!isTestActive) {
      updateCaret();
      focusInput();
    }
  });

  // Initialize on page load
  startIdleDecayLoop();
  startPhysicsTicker();
  resetTest();
})();
