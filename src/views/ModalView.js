/**
 * TypeFlow - ModalView
 * Passive View for Result Summaries, Lifetime Stats Dialog,
 * Keybr Neuromuscular Motor Pattern cards, and Deck Mastery Explorer.
 * Zero business logic.
 */

class ModalView {
  constructor(elements = {}) {
    // Classic Results Screen
    this.resultsSection = elements.resultsSection || (typeof document !== 'undefined' ? document.getElementById('results-section') : null);
    this.nextTestBtn = elements.nextTestBtn || (typeof document !== 'undefined' ? document.getElementById('next-test-btn') : null);
    this.testSection = elements.testSection || (typeof document !== 'undefined' ? document.getElementById('test-section') : null);
    this.resWpmEl = elements.resWpmEl || elements.resWpm || (typeof document !== 'undefined' ? document.getElementById('res-wpm') : null);
    this.resWpm = this.resWpmEl;
    this.resAccEl = elements.resAccEl || elements.resAcc || (typeof document !== 'undefined' ? document.getElementById('res-acc') : null);
    this.resAcc = this.resAccEl;
    this.resRawEl = elements.resRawEl || elements.resRaw || (typeof document !== 'undefined' ? document.getElementById('res-raw') : null);
    this.resRaw = this.resRawEl;
    this.resCharsEl = elements.resCharsEl || elements.resChars || (typeof document !== 'undefined' ? document.getElementById('res-chars') : null);
    this.resChars = this.resCharsEl;
    this.resFixedEl = elements.resFixedEl || elements.resFixed || (typeof document !== 'undefined' ? document.getElementById('res-fixed') : null);
    this.resFixed = this.resFixedEl;
    this.resFixedDetailEl = elements.resFixedDetailEl || elements.resFixedDetail || (typeof document !== 'undefined' ? document.getElementById('res-fixed-detail') : null);
    this.resFixedDetail = this.resFixedDetailEl;
    this.resConsistencyEl = elements.resConsistencyEl || elements.resConsistency || (typeof document !== 'undefined' ? document.getElementById('res-consistency') : null);
    this.resConsistency = this.resConsistencyEl;
    this.resTimeEl = elements.resTimeEl || elements.resTime || (typeof document !== 'undefined' ? document.getElementById('res-time') : null);
    this.resTime = this.resTimeEl;
    this.resTimeDetailEl = elements.resTimeDetailEl || elements.resTimeDetail || (typeof document !== 'undefined' ? document.getElementById('res-time-detail') : null);
    this.resTimeDetail = this.resTimeDetailEl;

    // Lifetime Stats Modal
    this.statsModal = elements.statsModal || (typeof document !== 'undefined' ? document.getElementById('stats-modal') : null);
    this.tabStatsFlow = elements.tabStatsFlow || (typeof document !== 'undefined' ? document.getElementById('tab-stats-flow') : null);
    this.tabStatsClassic = elements.tabStatsClassic || (typeof document !== 'undefined' ? document.getElementById('tab-stats-classic') : null);
    this.tabStatsTrophies = elements.tabStatsTrophies || (typeof document !== 'undefined' ? document.getElementById('tab-stats-trophies') : null);
    this.tabStatsArmory = elements.tabStatsArmory || (typeof document !== 'undefined' ? document.getElementById('tab-stats-armory') : null);
    this.tabStatsMotor = elements.tabStatsMotor || (typeof document !== 'undefined' ? document.getElementById('tab-stats-motor') : null);
    this.tabStatsConfig = elements.tabStatsConfig || (typeof document !== 'undefined' ? document.getElementById('tab-stats-config') : null);
    this.paneStatsFlow = elements.paneStatsFlow || (typeof document !== 'undefined' ? document.getElementById('pane-stats-flow') : null);
    this.paneStatsClassic = elements.paneStatsClassic || (typeof document !== 'undefined' ? document.getElementById('pane-stats-classic') : null);
    this.paneStatsTrophies = elements.paneStatsTrophies || (typeof document !== 'undefined' ? document.getElementById('pane-stats-trophies') : null);
    this.paneStatsArmory = elements.paneStatsArmory || (typeof document !== 'undefined' ? document.getElementById('pane-stats-armory') : null);
    this.paneStatsMotor = elements.paneStatsMotor || (typeof document !== 'undefined' ? document.getElementById('pane-stats-motor') : null);
    this.paneStatsConfig = elements.paneStatsConfig || (typeof document !== 'undefined' ? document.getElementById('pane-stats-config') : null);
    this.drawerActiveTitle = elements.drawerActiveTitle || (typeof document !== 'undefined' ? document.getElementById('drawer-active-title') : null);

    // Trophies Elements
    this.trophiesCountEl = elements.trophiesCountEl || (typeof document !== 'undefined' ? document.getElementById('trophies-count') : null);
    this.trophiesProgressBar = elements.trophiesProgressBar || (typeof document !== 'undefined' ? document.getElementById('trophies-progress-bar') : null);
    this.trophiesGrid = elements.trophiesGrid || (typeof document !== 'undefined' ? document.getElementById('trophies-grid') : null);
    this.trophyFilterBtns = elements.trophyFilterBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.trophy-filter-btn') : []);
    this.currentTrophyFilter = 'all';
    this.currentAchievementsModel = null;
    this.currentStorageService = null;

    // Armory Elements
    this.armoryCountEl = elements.armoryCountEl || (typeof document !== 'undefined' ? document.getElementById('armory-count') : null);
    this.armoryProgressBar = elements.armoryProgressBar || (typeof document !== 'undefined' ? document.getElementById('armory-progress-bar') : null);
    this.armoryThemesGrid = elements.armoryThemesGrid || (typeof document !== 'undefined' ? document.getElementById('armory-themes-grid') : null);
    this.armoryFlowFxGrid = elements.armoryFlowFxGrid || (typeof document !== 'undefined' ? document.getElementById('armory-flowfx-grid') : null);
    this.armoryCaretsGrid = elements.armoryCaretsGrid || (typeof document !== 'undefined' ? document.getElementById('armory-carets-grid') : null);
    this.armoryCaretFxGrid = elements.armoryCaretFxGrid || (typeof document !== 'undefined' ? document.getElementById('armory-caretfx-grid') : null);
    this.armoryGhostGrid = elements.armoryGhostGrid || (typeof document !== 'undefined' ? document.getElementById('armory-ghost-grid') : null);
    this.armorySoundsGrid = elements.armorySoundsGrid || (typeof document !== 'undefined' ? document.getElementById('armory-sounds-grid') : null);
    this.armoryFilterBtns = elements.armoryFilterBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.armory-filter-btn') : []);
    this.currentArmoryFilter = 'all';

    // RPG Stats Pane Elements
    this.statsRpgLevel = elements.statsRpgLevel || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-level') : null);
    this.statsRpgTitle = elements.statsRpgTitle || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-title') : null);
    this.statsRpgXp = elements.statsRpgXp || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-xp') : null);
    this.statsRpgXpBar = elements.statsRpgXpBar || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-xp-bar') : null);
    this.statsRpgWordsCount = elements.statsRpgWordsCount || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-words-count') : null);
    this.statsRpgEggsCount = elements.statsRpgEggsCount || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-eggs-count') : null);
    this.statsRpgHighStreak = elements.statsRpgHighStreak || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-high-streak') : null);
    this.motorGrid = elements.motorGrid || (typeof document !== 'undefined' ? document.getElementById('motor-grid') : null);
    this.deckUnlockedCount = elements.deckUnlockedCount || (typeof document !== 'undefined' ? document.getElementById('deck-unlocked-count') : null);
    this.deckWordsScroll = elements.deckWordsScroll || (typeof document !== 'undefined' ? document.getElementById('deck-words-scroll') : null);
    this.deckFilters = elements.deckFilters || (typeof document !== 'undefined' ? document.getElementById('deck-filters') : null);
    this.deckFilterBtns = elements.deckFilterBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.deck-filter-btn') : []);
    this.currentDeckFilter = 'all';
    this.currentGameState = null;
    this.getWordMetaFn = null;

    // Classic Stats Pane Elements
    this.pb15s = elements.pb15s || (typeof document !== 'undefined' ? document.getElementById('pb-15s') : null);
    this.pb15sDate = elements.pb15sDate || (typeof document !== 'undefined' ? document.getElementById('pb-15s-date') : null);
    this.pb30s = elements.pb30s || (typeof document !== 'undefined' ? document.getElementById('pb-30s') : null);
    this.pb30sDate = elements.pb30sDate || (typeof document !== 'undefined' ? document.getElementById('pb-30s-date') : null);
    this.pb60s = elements.pb60s || (typeof document !== 'undefined' ? document.getElementById('pb-60s') : null);
    this.pb60sDate = elements.pb60sDate || (typeof document !== 'undefined' ? document.getElementById('pb-60s-date') : null);
    this.classicTotalTests = elements.classicTotalTests || (typeof document !== 'undefined' ? (document.getElementById('stats-total-tests') || document.getElementById('classic-total-tests')) : null);
    this.classicTotalTime = elements.classicTotalTime || (typeof document !== 'undefined' ? (document.getElementById('stats-total-time') || document.getElementById('classic-total-time')) : null);
    this.classicTotalWords = elements.classicTotalWords || (typeof document !== 'undefined' ? (document.getElementById('stats-total-words') || document.getElementById('classic-total-words')) : null);
    this.classicTotalKeys = elements.classicTotalKeys || (typeof document !== 'undefined' ? (document.getElementById('stats-total-keys') || document.getElementById('classic-total-keys')) : null);
    this.classicHistoryTable = elements.classicHistoryTable || (typeof document !== 'undefined' ? document.getElementById('classic-history-table') : null);
    this.classicHistoryTbody = elements.classicHistoryTbody || (typeof document !== 'undefined' ? (document.getElementById('stats-history-tbody') || (this.classicHistoryTable ? this.classicHistoryTable.querySelector('tbody') : null)) : null);
    this.flowHistoryTbody = elements.flowHistoryTbody || (typeof document !== 'undefined' ? document.getElementById('flow-history-tbody') : null);
    this.nextTestBtnLabel = elements.nextTestBtnLabel || (typeof document !== 'undefined' ? document.getElementById('next-test-btn-label') : null);
    this.nextTestBtnHint = elements.nextTestBtnHint || (typeof document !== 'undefined' ? document.getElementById('next-test-btn-hint') : null);
  }

  _getDoc() {
    return (this.statsModal && this.statsModal.ownerDocument)
      ? this.statsModal.ownerDocument
      : (this.resultsSection && this.resultsSection.ownerDocument
        ? this.resultsSection.ownerDocument
        : ((typeof document !== 'undefined') ? document : null));
  }

  showClassicResults(stats) {
    if (this.testSection) this.testSection.style.display = 'none';
    if (this.resultsSection) {
      this.resultsSection.classList.remove('flow-recap-mode', 'afk-crossfade');
      this.resultsSection.classList.add('visible');
    }

    if (this.resWpmEl) this.resWpmEl.textContent = stats.wpm;
    if (this.resAccEl) this.resAccEl.textContent = `${stats.accuracy ?? stats.acc ?? 100}%`;
    if (this.resRawEl) this.resRawEl.textContent = stats.rawWpm ?? stats.wpm;
    if (this.resCharsEl) {
      this.resCharsEl.textContent = `${stats.correctChars || 0}/${stats.incorrectChars || 0}/${stats.extraChars || 0}/${stats.missedChars || 0}`;
    }
    if (this.resFixedEl) this.resFixedEl.textContent = stats.fixedErrors || 0;
    if (this.resFixedDetailEl) {
      const fixed = stats.fixedErrors || 0;
      this.resFixedDetailEl.textContent = fixed === 1 ? '1 error fixed' : `${fixed} errors fixed`;
    }
    if (this.resConsistencyEl) this.resConsistencyEl.textContent = `${stats.consistency ?? 100}%`;
    if (this.resTimeEl) this.resTimeEl.textContent = `${stats.duration}s`;
    if (this.resTimeDetailEl) this.resTimeDetailEl.textContent = 'standard mode';
    if (this.nextTestBtnLabel) this.nextTestBtnLabel.textContent = 'Next Test';
    if (this.nextTestBtnHint) this.nextTestBtnHint.textContent = 'tab';
  }

  showFlowRecap(stats, isAfk = false) {
    if (!stats) return;
    this.showClassicResults(stats);
    if (this.resultsSection) {
      this.resultsSection.classList.add('flow-recap-mode');
      this.resultsSection.classList.toggle('afk-crossfade', Boolean(isAfk));
    }
    if (this.resTimeDetailEl) {
      const unlocked = stats.unlockedWords || 1;
      this.resTimeDetailEl.textContent = `flow run • ${unlocked} ${unlocked === 1 ? 'word' : 'words'} unlocked`;
    }
    if (this.nextTestBtnLabel) this.nextTestBtnLabel.textContent = 'Resume Flow';
    if (this.nextTestBtnHint) this.nextTestBtnHint.textContent = ';; / Esc';
  }

  hideClassicResults() {
    if (this.resultsSection) {
      this.resultsSection.classList.remove('visible', 'flow-recap-mode', 'afk-crossfade');
    }
    if (this.testSection) this.testSection.style.display = 'flex';
  }

  openStatsModal(defaultTab = 'flow') {
    if (this.statsModal) {
      this.statsModal.style.display = 'flex';
      this.statsModal.classList.add('open');
    }
    this.switchStatsTab(defaultTab);
  }

  closeStatsModal() {
    if (this.statsModal) {
      this.statsModal.classList.remove('open');
      this.statsModal.style.display = 'none';
    }
  }

  switchStatsTab(tabName) {
    const isFlow = tabName === 'flow';
    const isClassic = tabName === 'classic';
    const isTrophies = tabName === 'trophies';
    const isArmory = tabName === 'armory';
    const isMotor = tabName === 'motor';
    const isConfig = tabName === 'config';

    if (this.tabStatsFlow) this.tabStatsFlow.classList.toggle('active', isFlow);
    if (this.tabStatsClassic) this.tabStatsClassic.classList.toggle('active', isClassic);
    if (this.tabStatsTrophies) this.tabStatsTrophies.classList.toggle('active', isTrophies);
    if (this.tabStatsArmory) this.tabStatsArmory.classList.toggle('active', isArmory);
    if (this.tabStatsMotor) this.tabStatsMotor.classList.toggle('active', isMotor);
    if (this.tabStatsConfig) this.tabStatsConfig.classList.toggle('active', isConfig);

    if (this.paneStatsFlow) this.paneStatsFlow.style.display = isFlow ? 'flex' : 'none';
    if (this.paneStatsClassic) this.paneStatsClassic.style.display = isClassic ? 'flex' : 'none';
    if (this.paneStatsTrophies) this.paneStatsTrophies.style.display = isTrophies ? 'flex' : 'none';
    if (this.paneStatsArmory) this.paneStatsArmory.style.display = isArmory ? 'flex' : 'none';
    if (this.paneStatsMotor) this.paneStatsMotor.style.display = isMotor ? 'flex' : 'none';
    if (this.paneStatsConfig) this.paneStatsConfig.style.display = isConfig ? 'flex' : 'none';

    if (this.drawerActiveTitle) {
      const titles = {
        flow: 'PROFILE // RPG OVERVIEW',
        armory: 'ARMORY // COSMETIC REPOSITORY',
        trophies: 'TROPHIES // ACHIEVEMENTS CASE',
        classic: 'RECORDS // BENCHMARK ARCHIVE',
        motor: 'MOTOR // NEUROMUSCULAR PATTERNS',
        config: 'CONFIG // SYSTEM PARAMETERS'
      };
      this.drawerActiveTitle.textContent = titles[tabName] || 'PROFILE // OVERVIEW';
    }
  }

  bindEvents(handlers = {}) {
    if (this.tabStatsFlow) {
      this.tabStatsFlow.addEventListener('click', () => this.switchStatsTab('flow'));
    }
    if (this.tabStatsClassic) {
      this.tabStatsClassic.addEventListener('click', () => this.switchStatsTab('classic'));
    }
    if (this.tabStatsTrophies) {
      this.tabStatsTrophies.addEventListener('click', () => {
        this.switchStatsTab('trophies');
        if (handlers.onSelectTrophiesTab) handlers.onSelectTrophiesTab();
      });
    }
    if (this.tabStatsArmory) {
      this.tabStatsArmory.addEventListener('click', () => {
        this.switchStatsTab('armory');
        if (handlers.onSelectArmoryTab) handlers.onSelectArmoryTab();
      });
    }
    if (this.tabStatsMotor) {
      this.tabStatsMotor.addEventListener('click', () => {
        this.switchStatsTab('motor');
        if (handlers.onSelectMotorTab) handlers.onSelectMotorTab();
      });
    }
    if (this.tabStatsConfig) {
      this.tabStatsConfig.addEventListener('click', () => {
        this.switchStatsTab('config');
        if (handlers.onSelectConfigTab) handlers.onSelectConfigTab();
      });
    }

    if (this.nextTestBtn) {
      this.nextTestBtn.addEventListener('click', () => {
        if (handlers.onNextTest) handlers.onNextTest();
      });
    }

    const closeStatsBtn = (typeof document !== 'undefined') ? document.getElementById('close-stats-btn') : null;
    const closeStatsFooterBtn = (typeof document !== 'undefined') ? document.getElementById('close-stats-footer-btn') : null;
    const closeStatsTopBtn = (typeof document !== 'undefined') ? document.getElementById('close-stats-top-btn') : null;

    if (closeStatsBtn) {
      closeStatsBtn.addEventListener('click', () => {
        if (handlers.onCloseStats) handlers.onCloseStats();
      });
    }
    if (closeStatsFooterBtn) {
      closeStatsFooterBtn.addEventListener('click', () => {
        if (handlers.onCloseStats) handlers.onCloseStats();
      });
    }
    if (closeStatsTopBtn) {
      closeStatsTopBtn.addEventListener('click', () => {
        if (handlers.onCloseStats) handlers.onCloseStats();
      });
    }

    if (this.statsModal) {
      this.statsModal.addEventListener('click', (e) => {
        if (e.target === this.statsModal) {
          if (handlers.onCloseStats) handlers.onCloseStats();
        }
      });
    }

    const statsBtn = (typeof document !== 'undefined') ? document.getElementById('stats-btn') : null;
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        if (handlers.onOpenStats) handlers.onOpenStats('flow');
      });
    }

    const resetRpgStatsBtn = (typeof document !== 'undefined') ? document.getElementById('reset-rpg-stats-btn') : null;
    const resetClassicStatsBtn = (typeof document !== 'undefined') ? document.getElementById('reset-classic-stats-btn') : null;
    if (resetRpgStatsBtn) {
      resetRpgStatsBtn.addEventListener('click', () => {
        if (handlers.onResetRpg) handlers.onResetRpg();
      });
    }
    if (resetClassicStatsBtn) {
      resetClassicStatsBtn.addEventListener('click', () => {
        if (handlers.onResetClassic) handlers.onResetClassic();
      });
    }

    this.setupDeckFilters();
    this.setupTrophyFilters();
    this.setupArmoryFilters();
  }

  setupArmoryFilters() {
    const btns = (this.armoryFilterBtns && this.armoryFilterBtns.length > 0)
      ? this.armoryFilterBtns
      : (typeof document !== 'undefined' ? document.querySelectorAll('.armory-filter-btn') : []);
    if (btns && btns.length > 0) {
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentArmoryFilter = btn.dataset.filter || 'all';
          this.filterArmorySections(this.currentArmoryFilter);
        });
      });
    }
  }

  filterArmorySections(filter = 'all') {
    this.currentArmoryFilter = filter || 'all';
    const sections = (typeof document !== 'undefined') ? document.querySelectorAll('.armory-section[data-armory-section]') : [];
    if (sections && sections.length > 0) {
      sections.forEach(sec => {
        const secKey = sec.dataset.armorySection;
        sec.style.display = (this.currentArmoryFilter === 'all' || secKey === this.currentArmoryFilter) ? 'flex' : 'none';
      });
    }
  }

  setupTrophyFilters() {
    const btns = (this.trophyFilterBtns && this.trophyFilterBtns.length > 0)
      ? this.trophyFilterBtns
      : (typeof document !== 'undefined' ? document.querySelectorAll('.trophy-filter-btn') : []);
    if (btns && btns.length > 0) {
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentTrophyFilter = btn.dataset.filter || 'all';
          if (this.currentAchievementsModel && this.currentStorageService) {
            this.renderTrophies(this.currentAchievementsModel, this.currentStorageService, this.currentTrophyFilter);
          }
        });
      });
    }
  }

  setupDeckFilters() {
    if (this.deckFilterBtns && this.deckFilterBtns.length > 0) {
      this.deckFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.deckFilterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentDeckFilter = btn.dataset.filter || 'all';
          this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
        });
      });
    }
  }

  renderFlowStats(gameState, bucketStats, getWordMetaFn, storageService = null, onSelectFlowRun = null) {
    if (!gameState) return;
    this.currentGameState = gameState;
    this.getWordMetaFn = getWordMetaFn;
    if (onSelectFlowRun) {
      this.onSelectFlowRun = onSelectFlowRun;
    }
    const storage = storageService || (typeof StorageManager !== 'undefined' ? StorageManager : null);

    if (this.statsRpgLevel) this.statsRpgLevel.textContent = `Lv. ${gameState.level}`;
    if (this.statsRpgTitle && storage) {
      this.statsRpgTitle.textContent = storage.getLevelTitle(gameState.level);
    }

    if (this.statsRpgXp && storage) {
      const reqXp = storage.getXpForLevel(gameState.level);
      this.statsRpgXp.textContent = `${gameState.currentXp} / ${reqXp} XP`;
      const pct = Math.min(100, Math.round((gameState.currentXp / reqXp) * 100));
      if (this.statsRpgXpBar) this.statsRpgXpBar.style.width = `${pct}%`;
    }

    const unlocked = gameState.unlockedRanks || [1];
    if (this.statsRpgWordsCount) {
      this.statsRpgWordsCount.textContent = `${unlocked.length} / 1,000 (${((unlocked.length / 1000) * 100).toFixed(1)}%)`;
    }
    if (this.deckUnlockedCount) this.deckUnlockedCount.textContent = unlocked.length;
    if (this.statsRpgEggsCount) this.statsRpgEggsCount.textContent = Math.max(0, unlocked.length - 1);
    if (this.statsRpgHighStreak) this.statsRpgHighStreak.textContent = `${gameState.highStreak || 0} words`;

    // Render Recent Flow Runs History Table
    const doc = this._getDoc();
    if (this.flowHistoryTbody && doc) {
      this.flowHistoryTbody.innerHTML = '';
      const flowHistory = Array.isArray(gameState.flowHistory) ? gameState.flowHistory : [];
      if (flowHistory.length === 0) {
        this.flowHistoryTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--sub-color); padding: 12px;">No qualifying flow runs recorded yet (maintain ≥85% Flow for 5s+ & 3+ clean words).</td></tr>';
      } else {
        flowHistory.forEach(item => {
          const tr = doc.createElement('tr');
          tr.className = 'flow-history-row';
          tr.style.cursor = 'pointer';
          tr.title = 'Click to inspect this Flow Run on the timeline graph';
          const acc = item.accuracy ?? item.acc ?? 100;
          const peak = item.peakWpm || item.wpm || 0;
          const unlockedCount = item.unlockedWords || unlocked.length || 1;
          tr.innerHTML = `
            <td>${item.date || '--'}</td>
            <td>${item.duration || 0}s</td>
            <td style="color: var(--main-color); font-weight: 700;">${item.wpm || 0} WPM</td>
            <td>${peak} WPM</td>
            <td>${acc}%</td>
            <td>${unlockedCount} words</td>
          `;
          tr.addEventListener('click', () => {
            if (this.onSelectFlowRun) {
              this.onSelectFlowRun(item);
            }
          });
          this.flowHistoryTbody.appendChild(tr);
        });
      }
    }

    // Render Motor Cards
    if (this.motorGrid && bucketStats && doc) {
      this.motorGrid.innerHTML = '';
      Object.values(bucketStats).forEach(b => {
        const card = doc.createElement('div');
        card.className = `motor-card ${b.isProficient ? 'proficient' : ''} ${!b.isDiscovered ? 'locked' : ''}`;
        card.style.borderColor = b.isDiscovered ? b.bucketColor : 'var(--border-color)';

        let statusText = '🔒 Undiscovered';
        let statusClass = 'locked';
        if (b.isDiscovered) {
          if (b.isProficient) {
            statusText = '★ Mastered';
            statusClass = 'proficient';
          } else {
            statusText = '🌱 Developing';
            statusClass = 'developing';
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
        this.motorGrid.appendChild(card);
      });
    }

    this.renderDeckExplorer(gameState, this.currentDeckFilter || 'all', getWordMetaFn);
  }

  renderDeckExplorer(gameState, filter = 'all', getWordMetaFn) {
    if (!this.deckWordsScroll || !gameState) return;
    this.deckWordsScroll.innerHTML = '';

    const unlocked = gameState.unlockedRanks || [1];
    let filteredRanks = unlocked;

    if (filter !== 'all' && getWordMetaFn) {
      filteredRanks = unlocked.filter(rank => {
        const meta = getWordMetaFn(rank);
        return meta && (meta.bucketId === filter || (meta.tags && meta.tags.includes(filter)));
      });
    }

    if (filteredRanks.length === 0) {
      this.deckWordsScroll.innerHTML = `<span style="color: var(--sub-color); font-size: 12px; padding: 10px;">No words unlocked in this motor pattern yet.</span>`;
      return;
    }

    filteredRanks.forEach(rank => {
      const meta = getWordMetaFn ? getWordMetaFn(rank) : null;
      if (!meta) return;

      const st = (gameState.wordStats && gameState.wordStats[rank]) || {};
      const errors = (st.unfixedErr || 0) + (st.fixedErr || 0) || (st.errorCount || 0);
      const wpm = Math.round(st.avgWpm ?? st.lastWpm ?? 0);
      const cleanHits = st.streak ?? st.cleanHits ?? 0;

      let srsBadge = '🌱';
      let srsTitle = 'New Discovery';
      if (errors > 0 || (wpm > 0 && wpm < (gameState.targetWpm || 40))) {
        srsBadge = '⚠️';
        srsTitle = 'Practicing (Needs Rhythm)';
      } else if (cleanHits >= 4) {
        srsBadge = '⭐';
        srsTitle = 'Mastered';
      } else if (cleanHits >= 1) {
        srsBadge = '⚡';
        srsTitle = 'In Flow';
      }

      const doc = this._getDoc();
      if (!doc) return;
      const chip = doc.createElement('div');
      chip.className = 'deck-word-chip';
      chip.style.borderColor = meta.bucketColor || 'var(--border-color)';
      chip.title = `${meta.bucketName || 'Pattern'} (${meta.bucketTag || meta.bucketId || ''}) • ${meta.tierName || meta.tier || ''} • ${srsTitle} • Clean hits: ${cleanHits} • Avg: ${wpm} WPM`;
      chip.innerHTML = `
        <span class="deck-chip-srs">${srsBadge}</span>
        <strong style="color: var(--text-color);">${meta.word}</strong>
        <span class="deck-chip-tag" style="font-size: 10px; color: ${meta.bucketColor || 'var(--main-color)'}; background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 4px;">${meta.bucketTag || meta.bucketId || ''}</span>
        <span class="deck-chip-tier" style="font-size: 9px; color: ${meta.tierColor || 'var(--sub-color)'}; text-transform: uppercase;">${meta.tierName || meta.tier || ''}</span>
      `;
      this.deckWordsScroll.appendChild(chip);
    });
  }

  renderClassicStats(stats) {
    if (!stats) return;

    if (this.pb15s && this.pb15sDate) {
      const pb = stats.personalBests['15'];
      this.pb15s.textContent = (pb && pb.wpm > 0) ? `${pb.wpm} WPM` : '--';
      this.pb15sDate.textContent = (pb && pb.wpm > 0) ? `${pb.acc}% acc` : 'No runs yet';
    }

    if (this.pb30s && this.pb30sDate) {
      const pb = stats.personalBests['30'];
      this.pb30s.textContent = (pb && pb.wpm > 0) ? `${pb.wpm} WPM` : '--';
      this.pb30sDate.textContent = (pb && pb.wpm > 0) ? `${pb.acc}% acc` : 'No runs yet';
    }

    if (this.pb60s && this.pb60sDate) {
      const pb = stats.personalBests['60'];
      this.pb60s.textContent = (pb && pb.wpm > 0) ? `${pb.wpm} WPM` : '--';
      this.pb60sDate.textContent = (pb && pb.wpm > 0) ? `${pb.acc}% acc` : 'No runs yet';
    }

    if (this.classicTotalTests) this.classicTotalTests.textContent = stats.totalTests || 0;
    if (this.classicTotalWords) this.classicTotalWords.textContent = stats.totalWords || 0;
    if (this.classicTotalKeys) this.classicTotalKeys.textContent = stats.totalKeystrokes || 0;
    if (this.classicTotalTime) {
      const sec = stats.totalTimeSeconds || 0;
      const mins = Math.floor(sec / 60);
      this.classicTotalTime.textContent = `${mins}m ${sec % 60}s`;
    }

    const doc = this._getDoc();
    const tbody = this.classicHistoryTbody || (this.classicHistoryTable ? this.classicHistoryTable.querySelector('tbody') : null);
    if (tbody && doc) {
      tbody.innerHTML = '';
      const history = stats.recentHistory || [];
      if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--sub-color); padding: 12px;">No tests recorded yet.</td></tr>';
      } else {
        history.forEach(item => {
          const tr = doc.createElement('tr');
          tr.innerHTML = `
            <td>${item.date}</td>
            <td>${item.duration}s</td>
            <td>${item.wpm} WPM</td>
            <td>${item.rawWpm || item.wpm}</td>
            <td>${item.acc}%</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  }

  renderTrophies(achievementsModel, storageService, filter = null) {
    if (!achievementsModel) return;
    this.currentAchievementsModel = achievementsModel;
    this.currentStorageService = storageService;
    if (filter) this.currentTrophyFilter = filter;

    const all = achievementsModel.listAll();
    const unlocked = achievementsModel.listUnlocked();
    const totalCount = all.length;
    const unlockedCount = unlocked.length;
    const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    if (this.trophiesCountEl) {
      this.trophiesCountEl.textContent = `${unlockedCount} / ${totalCount} unlocked (${pct}%)`;
    }
    if (this.trophiesProgressBar) {
      this.trophiesProgressBar.style.width = `${pct}%`;
    }

    if (!this.trophiesGrid) {
      this.trophiesGrid = (typeof document !== 'undefined') ? document.getElementById('trophies-grid') : null;
    }
    if (!this.trophiesGrid) return;

    let items = all;
    if (this.currentTrophyFilter && this.currentTrophyFilter !== 'all') {
      items = items.filter(a => a.category === this.currentTrophyFilter);
    }

    const counters = (storageService && storageService.getAchievementCounters) ? storageService.getAchievementCounters() : {};
    const gameSave = (storageService && storageService.getGameSave) ? storageService.getGameSave() : {};
    const motorSummary = (storageService && storageService.getMotorMasterySummary) ? storageService.getMotorMasterySummary(gameSave) : {};

    const tierLabels = {
      1: 'Tier I',
      2: 'Tier II',
      apex: 'Apex',
      crown: 'Crown Jewel',
      feat: 'Feat'
    };

    const doc = (this.trophiesGrid && this.trophiesGrid.ownerDocument)
      ? this.trophiesGrid.ownerDocument
      : ((typeof document !== 'undefined') ? document : null);
    if (!doc) return;

    this.trophiesGrid.innerHTML = '';
    items.forEach(a => {
      const isUnlocked = a.unlocked;
      const prog = achievementsModel.getProgress(a.id, counters, gameSave, motorSummary);
      const tierClass = `tier-${a.tier}`;
      const tierLabel = tierLabels[a.tier] || `Tier ${a.tier}`;

      let dateStr = '';
      if (isUnlocked && a.unlockedAt) {
        try {
          const d = new Date(a.unlockedAt);
          dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch (e) {
          dateStr = '';
        }
      }

      const card = doc.createElement('div');
      card.className = `trophy-card ${isUnlocked ? 'unlocked' : 'locked'} ${tierClass}`;

      let footerHtml = '';
      if (isUnlocked) {
        footerHtml = `<div class="trophy-status unlocked"><span class="trophy-check">✓</span> Unlocked ${dateStr ? `· ${dateStr}` : ''}</div>`;
      } else {
        const miniPct = prog ? Math.min(100, Math.max(0, prog.pct || 0)) : 0;
        const miniLabel = (prog && prog.label) ? prog.label : 'In Progress';
        footerHtml = `
          <div class="trophy-progress-wrap">
            <div class="trophy-progress-text">${miniLabel}</div>
            <div class="trophy-mini-bar"><div class="trophy-mini-fill" style="width: ${miniPct}%;"></div></div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="trophy-header">
          <div class="trophy-icon-wrap">${a.icon}</div>
          <div class="trophy-title-wrap">
            <div class="trophy-title">${a.title}</div>
            <div class="trophy-tier-badge">${tierLabel}</div>
          </div>
        </div>
        <div class="trophy-desc">${a.desc}</div>
        ${footerHtml}
      `;
      this.trophiesGrid.appendChild(card);
    });
  }

  renderArmory(cosmeticsModel, storageService, handlers = {}) {
    if (!cosmeticsModel) return;
    const gameSave = (storageService && storageService.getGameSave) ? storageService.getGameSave() : { level: 1, achievements: {} };
    const level = gameSave.level || 1;
    const unlockedAchievements = gameSave.achievements || ((storageService && storageService.getAchievements) ? storageService.getAchievements() : {});
    const equipped = (storageService && storageService.getEquippedCosmetics)
      ? storageService.getEquippedCosmetics()
      : { theme: 'oled_cyan', caret: 'line', sound: 'clicky_blue' };

    const totalCount = cosmeticsModel.getTotalCount();
    const unlockedCount = cosmeticsModel.getUnlockedCount(level, unlockedAchievements);
    const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    if (this.armoryCountEl) {
      this.armoryCountEl.textContent = `${unlockedCount} / ${totalCount} unlocked (${pct}%)`;
    }
    if (this.armoryProgressBar) {
      this.armoryProgressBar.style.width = `${pct}%`;
    }

    const renderCategoryGrid = (gridEl, category) => {
      if (!gridEl) return;
      const doc = (gridEl && gridEl.ownerDocument)
        ? gridEl.ownerDocument
        : ((typeof document !== 'undefined') ? document : null);
      if (!doc) return;

      gridEl.innerHTML = '';
      const items = cosmeticsModel.getAnnotatedItems(category, level, unlockedAchievements, equipped);

      items.forEach(item => {
        const card = doc.createElement('div');
        card.className = `armory-card ${item.unlocked ? 'unlocked' : 'locked'} ${item.equipped ? 'equipped' : ''}`;
        card.dataset.id = item.id;
        card.dataset.category = item.category;

        let swatchesHtml = '';
        if (Array.isArray(item.swatches) && item.swatches.length > 0) {
          const dots = item.swatches.map(c => `<span class="theme-swatch-dot" style="background: ${c};"></span>`).join('');
          swatchesHtml = `<div class="theme-swatches">${dots}</div>`;
        }

        let badgeHtml = '';
        if (item.equipped) {
          badgeHtml = `<div class="armory-badge equipped">✓ Equipped</div>`;
        } else if (item.unlocked) {
          badgeHtml = `<div class="armory-badge unlocked">${category === 'sound' ? '🔊 Click to Equip & Preview' : 'Click to Equip'}</div>`;
        } else {
          badgeHtml = `<div class="armory-badge locked">🔒 ${item.unlockLabel}</div>`;
        }

        card.innerHTML = `
          <div class="armory-card-header">
            <div class="armory-icon-wrap">${item.icon}</div>
            <div class="armory-title-wrap">
              <div class="armory-title">${item.title}</div>
              ${swatchesHtml}
            </div>
          </div>
          <div class="armory-desc">${item.desc}</div>
          ${badgeHtml}
        `;

        if (item.unlocked && handlers.onEquipCosmetic) {
          card.addEventListener('click', () => {
            handlers.onEquipCosmetic(item.category, item.id);
          });
        }

        gridEl.appendChild(card);
      });
    };

    renderCategoryGrid(this.armoryThemesGrid, 'theme');
    renderCategoryGrid(this.armoryFlowFxGrid, 'flowFx');
    renderCategoryGrid(this.armoryCaretsGrid, 'caret');
    renderCategoryGrid(this.armoryCaretFxGrid, 'caretFx');
    renderCategoryGrid(this.armoryGhostGrid, 'ghostStyle');
    renderCategoryGrid(this.armorySoundsGrid, 'sound');
    this.filterArmorySections(this.currentArmoryFilter);
  }
}

if (typeof window !== 'undefined') {
  window.ModalView = ModalView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModalView };
}
