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
    this.resModsBadgesEl = elements.resModsBadgesEl || elements.resModsBadges || (typeof document !== 'undefined' ? document.getElementById('res-mods-badges') : null);
    this.resModsBadges = this.resModsBadgesEl;

    // Lifetime Stats Modal
    this.statsModal = elements.statsModal || (typeof document !== 'undefined' ? document.getElementById('stats-modal') : null);
    this.tabStatsFlow = elements.tabStatsFlow || (typeof document !== 'undefined' ? document.getElementById('tab-stats-flow') : null);
    this.tabStatsClassic = elements.tabStatsClassic || (typeof document !== 'undefined' ? document.getElementById('tab-stats-classic') : null);
    this.tabStatsTrophies = elements.tabStatsTrophies || (typeof document !== 'undefined' ? document.getElementById('tab-stats-trophies') : null);
    this.tabStatsArmory = elements.tabStatsArmory || (typeof document !== 'undefined' ? document.getElementById('tab-stats-armory') : null);
    this.tabStatsLexicon = elements.tabStatsLexicon || (typeof document !== 'undefined' ? document.getElementById('tab-stats-lexicon') : null);
    this.tabStatsMotor = elements.tabStatsMotor || (typeof document !== 'undefined' ? document.getElementById('tab-stats-motor') : null);
    this.tabStatsConfig = elements.tabStatsConfig || (typeof document !== 'undefined' ? document.getElementById('tab-stats-config') : null);
    this.paneStatsFlow = elements.paneStatsFlow || (typeof document !== 'undefined' ? document.getElementById('pane-stats-flow') : null);
    this.paneStatsClassic = elements.paneStatsClassic || (typeof document !== 'undefined' ? document.getElementById('pane-stats-classic') : null);
    this.paneStatsTrophies = elements.paneStatsTrophies || (typeof document !== 'undefined' ? document.getElementById('pane-stats-trophies') : null);
    this.paneStatsArmory = elements.paneStatsArmory || (typeof document !== 'undefined' ? document.getElementById('pane-stats-armory') : null);
    this.paneStatsLexicon = elements.paneStatsLexicon || (typeof document !== 'undefined' ? document.getElementById('pane-stats-lexicon') : null);
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
    this.armoryLoadoutBar = elements.armoryLoadoutBar || (typeof document !== 'undefined' ? document.getElementById('armory-loadout-bar') : null);
    this.armoryThemesGrid = elements.armoryThemesGrid || (typeof document !== 'undefined' ? document.getElementById('armory-themes-grid') : null);
    this.armoryFlowFxGrid = elements.armoryFlowFxGrid || (typeof document !== 'undefined' ? document.getElementById('armory-flowfx-grid') : null);
    this.armoryCaretsGrid = elements.armoryCaretsGrid || (typeof document !== 'undefined' ? document.getElementById('armory-carets-grid') : null);
    this.armoryCaretFxGrid = elements.armoryCaretFxGrid || (typeof document !== 'undefined' ? document.getElementById('armory-caretfx-grid') : null);
    this.armoryGhostGrid = elements.armoryGhostGrid || (typeof document !== 'undefined' ? document.getElementById('armory-ghost-grid') : null);
    this.armorySoundsGrid = elements.armorySoundsGrid || (typeof document !== 'undefined' ? document.getElementById('armory-sounds-grid') : null);
    this.armoryFilterBtns = elements.armoryFilterBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.armory-filter-btn') : []);
    this.currentArmoryFilter = 'all';

    // RPG Stats, Motor & Lexicon Compendium Elements
    this.statsRpgLevel = elements.statsRpgLevel || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-level') : null);
    this.statsRpgTitle = elements.statsRpgTitle || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-title') : null);
    this.statsRpgXp = elements.statsRpgXp || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-xp') : null);
    this.statsRpgXpBar = elements.statsRpgXpBar || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-xp-bar') : null);
    this.statsRpgWordsCount = elements.statsRpgWordsCount || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-words-count') : null);
    this.statsRpgEggsCount = elements.statsRpgEggsCount || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-eggs-count') : null);
    this.statsRpgHighStreak = elements.statsRpgHighStreak || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-high-streak') : null);
    this.statsRpgFlowTime = elements.statsRpgFlowTime || (typeof document !== 'undefined' ? document.getElementById('stats-rpg-flow-time') : null);
    this.motorGrid = elements.motorGrid || (typeof document !== 'undefined' ? document.getElementById('motor-grid') : null);
    this.deckUnlockedCount = elements.deckUnlockedCount || (typeof document !== 'undefined' ? document.getElementById('deck-unlocked-count') : null);
    this.lexiconDiscoveredPct = elements.lexiconDiscoveredPct || (typeof document !== 'undefined' ? document.getElementById('lexicon-discovered-pct') : null);
    this.lexiconProgressBar = elements.lexiconProgressBar || (typeof document !== 'undefined' ? document.getElementById('lexicon-progress-bar') : null);
    this.lexiconModeDiscoveredBtn = elements.lexiconModeDiscoveredBtn || (typeof document !== 'undefined' ? document.getElementById('lexicon-mode-discovered') : null);
    this.lexiconModeAllBtn = elements.lexiconModeAllBtn || (typeof document !== 'undefined' ? document.getElementById('lexicon-mode-all') : null);
    this.lexiconSearchInput = elements.lexiconSearchInput || (typeof document !== 'undefined' ? document.getElementById('lexicon-search-input') : null);
    this.lexiconSortSelect = elements.lexiconSortSelect || (typeof document !== 'undefined' ? document.getElementById('lexicon-sort-select') : null);
    this.lexiconRarityBtns = elements.lexiconRarityBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.lexicon-rarity-btn') : []);
    this.lexiconMasteryBtns = elements.lexiconMasteryBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.lexicon-mastery-btn') : []);
    this.lexiconWordModal = elements.lexiconWordModal || (typeof document !== 'undefined' ? document.getElementById('lexicon-word-modal') : null);
    this.lexiconModalWord = elements.lexiconModalWord || (typeof document !== 'undefined' ? document.getElementById('lexicon-modal-word') : null);
    this.lexiconModalRank = elements.lexiconModalRank || (typeof document !== 'undefined' ? document.getElementById('lexicon-modal-rank') : null);
    this.lexiconModalTier = elements.lexiconModalTier || (typeof document !== 'undefined' ? document.getElementById('lexicon-modal-tier') : null);
    this.lexiconModalSrs = elements.lexiconModalSrs || (typeof document !== 'undefined' ? document.getElementById('lexicon-modal-srs') : null);
    this.lexiconModalBody = elements.lexiconModalBody || (typeof document !== 'undefined' ? document.getElementById('lexicon-modal-body') : null);
    this.lexiconModalCloseBtn = elements.lexiconModalCloseBtn || (typeof document !== 'undefined' ? document.getElementById('lexicon-modal-close-btn') : null);
    this.deckWordsScroll = elements.deckWordsScroll || (typeof document !== 'undefined' ? document.getElementById('deck-words-scroll') : null);
    this.deckFilters = elements.deckFilters || (typeof document !== 'undefined' ? document.getElementById('deck-filters') : null);
    this.deckFilterBtns = elements.deckFilterBtns || (typeof document !== 'undefined' ? document.querySelectorAll('.deck-filter-btn') : []);
    this.currentDeckFilter = 'all';
    this.lexiconViewMode = 'discovered';
    this.lexiconSearchQuery = '';
    this.lexiconSortBy = 'rank';
    this.lexiconRarityFilter = 'all';
    this.lexiconMasteryFilter = 'all';
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
    this.onSelectClassicTest = null;
    this.nextTestBtnLabel = elements.nextTestBtnLabel || (typeof document !== 'undefined' ? document.getElementById('next-test-btn-label') : null);
    this.nextTestBtnHint = elements.nextTestBtnHint || (typeof document !== 'undefined' ? document.getElementById('next-test-btn-hint') : null);
  }

  _getDoc() {
    if (this.statsModal && this.statsModal.ownerDocument) return this.statsModal.ownerDocument;
    if (this.resultsSection && this.resultsSection.ownerDocument) return this.resultsSection.ownerDocument;
    if (this.armoryLoadoutBar && this.armoryLoadoutBar.ownerDocument) return this.armoryLoadoutBar.ownerDocument;
    if (this.armoryThemesGrid && this.armoryThemesGrid.ownerDocument) return this.armoryThemesGrid.ownerDocument;
    return (typeof document !== 'undefined') ? document : null;
  }

  getModBadgesList(item) {
    if (!item || typeof item !== 'object') return [];
    const mods = (item.mods && typeof item.mods === 'object') ? item.mods : item;
    const badges = [];

    const difficulty = mods.difficulty || item.wordDifficulty || item.difficulty || 'normal';
    if (difficulty === 'easy') {
      badges.push({
        key: 'easy',
        label: 'EASY',
        cls: 'mod-badge-easy',
        title: 'Word Difficulty: Easy (Top 200 short & common words)'
      });
    } else if (difficulty === 'hard') {
      badges.push({
        key: 'hard',
        label: 'HARD',
        cls: 'mod-badge-hard',
        title: 'Word Difficulty: Hard (Longer & complex words)'
      });
    }

    const punctuation = Boolean(mods.punctuation ?? item.punctuationMode ?? item.punctuation);
    if (punctuation) {
      badges.push({
        key: 'punct',
        label: '@! PUNCT',
        cls: 'mod-badge-punct',
        title: 'Punctuation Enabled'
      });
    }

    const capitals = Boolean(mods.capitals ?? item.capitalsMode ?? item.capitals);
    if (capitals) {
      badges.push({
        key: 'caps',
        label: 'Aa CAPS',
        cls: 'mod-badge-caps',
        title: 'Capital Letters Enabled'
      });
    }

    const hidden = Boolean(mods.hidden ?? item.hiddenMode ?? item.hidden);
    if (hidden) {
      const method = mods.hiddenMethod || item.hiddenMethod || 'word';
      const dist = mods.hiddenWordDistance || item.hiddenWordDistance || 1;
      const detail = method === 'char' ? 'Char Fade' : `Word Vanish (${dist}w)`;
      badges.push({
        key: 'hd',
        label: 'HD',
        cls: 'mod-badge-hd',
        title: `Hidden Horizon (${detail})`
      });
    }

    const ghost = Boolean(mods.ghost ?? item.ghostCursor ?? item.ghost);
    if (ghost) {
      const speed = mods.ghostSpeed || item.ghostSpeed || 50;
      badges.push({
        key: 'ghost',
        label: `👻 ${speed}`,
        cls: 'mod-badge-ghost',
        title: `Ghost Pacer (${speed} WPM)`
      });
    }

    return badges;
  }

  renderModBadgesHtml(item) {
    const badges = this.getModBadgesList(item);
    if (badges.length === 0) return '';
    return badges
      .map(b => `<span class="mod-badge ${b.cls}" title="${b.title}">${b.label}</span>`)
      .join('');
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
      let correct = stats.correctChars;
      let incorrect = stats.incorrectChars;
      let extra = stats.extraChars || 0;
      let missed = stats.missedChars || 0;
      if (correct === undefined && (stats.keystrokes || stats.wpm)) {
        const total = stats.keystrokes || Math.round((stats.rawWpm || stats.wpm || 0) * 5 * ((stats.duration || 30) / 60));
        const acc = (stats.accuracy ?? stats.acc ?? 100) / 100;
        correct = Math.round(total * acc);
        incorrect = Math.max(0, total - correct);
      }
      this.resCharsEl.textContent = `${correct || 0}/${incorrect || 0}/${extra}/${missed}`;
    }
    if (this.resFixedEl) this.resFixedEl.textContent = stats.fixedErrors || 0;
    if (this.resFixedDetailEl) {
      const fixed = stats.fixedErrors || 0;
      this.resFixedDetailEl.textContent = fixed === 1 ? '1 error fixed' : `${fixed} errors fixed`;
    }
    if (this.resConsistencyEl) this.resConsistencyEl.textContent = `${stats.consistency ?? 100}%`;
    if (this.resTimeEl) this.resTimeEl.textContent = `${stats.duration}s`;
    if (this.resTimeDetailEl) {
      this.resTimeDetailEl.textContent = stats.date ? `classic test • ${stats.date}` : 'standard mode';
    }
    if (this.resModsBadgesEl) {
      this.resModsBadgesEl.innerHTML = this.renderModBadgesHtml(stats);
    }
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
    this.closeLexiconWordModal();
    if (this.statsModal) {
      this.statsModal.classList.remove('open');
      this.statsModal.style.display = 'none';
    }
  }

  switchStatsTab(tabName) {
    this.closeLexiconWordModal();
    const isFlow = tabName === 'flow';
    const isClassic = tabName === 'classic';
    const isTrophies = tabName === 'trophies';
    const isArmory = tabName === 'armory';
    const isLexicon = tabName === 'lexicon';
    const isMotor = tabName === 'motor';
    const isConfig = tabName === 'config';

    if (this.tabStatsFlow) this.tabStatsFlow.classList.toggle('active', isFlow);
    if (this.tabStatsClassic) this.tabStatsClassic.classList.toggle('active', isClassic);
    if (this.tabStatsTrophies) this.tabStatsTrophies.classList.toggle('active', isTrophies);
    if (this.tabStatsArmory) this.tabStatsArmory.classList.toggle('active', isArmory);
    if (this.tabStatsLexicon) this.tabStatsLexicon.classList.toggle('active', isLexicon);
    if (this.tabStatsMotor) this.tabStatsMotor.classList.toggle('active', isMotor);
    if (this.tabStatsConfig) this.tabStatsConfig.classList.toggle('active', isConfig);

    if (this.paneStatsFlow) this.paneStatsFlow.style.display = isFlow ? 'flex' : 'none';
    if (this.paneStatsClassic) this.paneStatsClassic.style.display = isClassic ? 'flex' : 'none';
    if (this.paneStatsTrophies) this.paneStatsTrophies.style.display = isTrophies ? 'flex' : 'none';
    if (this.paneStatsArmory) this.paneStatsArmory.style.display = isArmory ? 'flex' : 'none';
    if (this.paneStatsLexicon) this.paneStatsLexicon.style.display = isLexicon ? 'flex' : 'none';
    if (this.paneStatsMotor) this.paneStatsMotor.style.display = isMotor ? 'flex' : 'none';
    if (this.paneStatsConfig) this.paneStatsConfig.style.display = isConfig ? 'flex' : 'none';

    if (this.drawerActiveTitle) {
      const titles = {
        flow: 'PROFILE // RPG OVERVIEW',
        armory: 'ARMORY // COSMETIC REPOSITORY',
        trophies: 'TROPHIES // ACHIEVEMENTS CASE',
        classic: 'RECORDS // BENCHMARK ARCHIVE',
        lexicon: 'LEXICON // WORD COMPENDIUM',
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
    if (this.tabStatsLexicon) {
      this.tabStatsLexicon.addEventListener('click', () => {
        this.switchStatsTab('lexicon');
        if (handlers.onSelectLexiconTab) handlers.onSelectLexiconTab();
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

    const doc = this._getDoc();
    const resetRpgStatsBtn = doc ? doc.getElementById('reset-rpg-stats-btn') : null;
    const resetClassicStatsBtn = doc ? doc.getElementById('reset-classic-stats-btn') : null;
    const resetAllStatsBtn = doc ? doc.getElementById('reset-all-stats-btn') : null;
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
    if (resetAllStatsBtn) {
      resetAllStatsBtn.addEventListener('click', () => {
        if (handlers.onResetAll) handlers.onResetAll();
      });
    }

    this.setupDeckFilters();
    this.setupTrophyFilters();
    this.setupArmoryFilters();
  }

  setupArmoryFilters() {
    const doc = this._getDoc();
    const btns = (this.armoryFilterBtns && this.armoryFilterBtns.length > 0)
      ? this.armoryFilterBtns
      : (doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('.armory-filter-btn') : []);
    if (btns && btns.length > 0) {
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentArmoryFilter = btn.dataset.filter || 'all';
          this.filterArmorySections(this.currentArmoryFilter);
        });
      });
    }
  }

  filterArmorySections(filter = 'all') {
    this.currentArmoryFilter = filter || 'all';
    const doc = this._getDoc();
    const btns = (this.armoryFilterBtns && this.armoryFilterBtns.length > 0)
      ? this.armoryFilterBtns
      : (doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('.armory-filter-btn') : []);
    if (btns && btns.length > 0) {
      btns.forEach(b => {
        b.classList.toggle('active', (b.dataset.filter || 'all') === this.currentArmoryFilter);
      });
    }
    const slots = (this.armoryLoadoutBar && Array.isArray(this.armoryLoadoutBar.children) && this.armoryLoadoutBar.children.length > 0)
      ? this.armoryLoadoutBar.children
      : (doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('.armory-loadout-slot[data-slot-category]') : []);
    if (slots && slots.length > 0) {
      Array.from(slots).forEach(s => {
        if (s && s.classList && s.dataset) {
          s.classList.toggle('active-filter', s.dataset.slotCategory === this.currentArmoryFilter);
        }
      });
    }
    const sections = (doc && typeof doc.querySelectorAll === 'function') ? doc.querySelectorAll('.armory-section[data-armory-section]') : [];
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

  isLexiconWordModalOpen() {
    const doc = this._getDoc();
    const modal = this.lexiconWordModal || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-word-modal') : null);
    return Boolean(modal && modal.style.display === 'flex');
  }

  setupDeckFilters() {
    const doc = this._getDoc();
    const patternBtns = (this.deckFilterBtns && this.deckFilterBtns.length > 0)
      ? this.deckFilterBtns
      : (doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('.deck-filter-btn') : []);
    if (patternBtns && patternBtns.length > 0) {
      patternBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          patternBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentDeckFilter = btn.dataset.filter || 'all';
          this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
        });
      });
    }
    this.setupLexiconControls();
  }

  setupLexiconControls() {
    const doc = this._getDoc();
    const modeDiscovered = this.lexiconModeDiscoveredBtn || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-mode-discovered') : null);
    const modeAll = this.lexiconModeAllBtn || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-mode-all') : null);

    if (modeDiscovered) {
      modeDiscovered.addEventListener('click', () => {
        this.lexiconViewMode = 'discovered';
        modeDiscovered.classList.add('active');
        if (modeAll) modeAll.classList.remove('active');
        this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
      });
    }
    if (modeAll) {
      modeAll.addEventListener('click', () => {
        this.lexiconViewMode = 'all';
        modeAll.classList.add('active');
        if (modeDiscovered) modeDiscovered.classList.remove('active');
        this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
      });
    }

    const searchInput = this.lexiconSearchInput || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-search-input') : null);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.lexiconSearchQuery = ((e && e.target && e.target.value) || searchInput.value || '').trim().toLowerCase();
        if (this._lexiconSearchTimer) clearTimeout(this._lexiconSearchTimer);
        this._lexiconSearchTimer = setTimeout(() => {
          this._lexiconSearchTimer = null;
          this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
        }, 120);
      });
    }

    const sortSelect = this.lexiconSortSelect || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-sort-select') : null);
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.lexiconSortBy = ((e && e.target && e.target.value) || sortSelect.value || 'rank');
        this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
      });
    }

    const rarityBtns = (this.lexiconRarityBtns && this.lexiconRarityBtns.length > 0)
      ? this.lexiconRarityBtns
      : (doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('.lexicon-rarity-btn') : []);
    if (rarityBtns && rarityBtns.length > 0) {
      rarityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          rarityBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.lexiconRarityFilter = btn.dataset.rarity || 'all';
          this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
        });
      });
    }

    const masteryBtns = (this.lexiconMasteryBtns && this.lexiconMasteryBtns.length > 0)
      ? this.lexiconMasteryBtns
      : (doc && typeof doc.querySelectorAll === 'function' ? doc.querySelectorAll('.lexicon-mastery-btn') : []);
    if (masteryBtns && masteryBtns.length > 0) {
      masteryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          masteryBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.lexiconMasteryFilter = btn.dataset.mastery || 'all';
          this.renderDeckExplorer(this.currentGameState, this.currentDeckFilter, this.getWordMetaFn);
        });
      });
    }

    const closeBtn = this.lexiconModalCloseBtn || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-modal-close-btn') : null);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLexiconWordModal());
    }

    const wordModal = this.lexiconWordModal || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-word-modal') : null);
    if (wordModal) {
      wordModal.addEventListener('click', (e) => {
        if (e.target === wordModal) {
          this.closeLexiconWordModal();
        }
      });
    }
  }

  _computeWordTelemetry(rank, meta, gameState, unlockedSet) {
    const isDiscovered = unlockedSet ? unlockedSet.has(rank) : true;
    const st = (gameState && gameState.wordStats && gameState.wordStats[rank]) || {};
    const seen = st.seen ?? st.timesSeen ?? 0;
    const avgWpm = Math.round(st.avgWpm ?? st.lastWpm ?? 0);
    const lastWpm = Math.round(st.lastWpm ?? st.avgWpm ?? 0);
    const bestWpm = Math.round(st.bestWpm ?? Math.max(avgWpm, lastWpm));
    const cleanHits = st.streak ?? st.cleanHits ?? 0;
    const bestStreak = Math.max(st.bestStreak || 0, cleanHits);
    const fixedErr = st.totalFixedErr ?? Math.round(st.fixedErr || 0);
    const unfixedErr = st.totalUnfixedErr ?? Math.round(st.unfixedErr || 0);
    const activeErrWeight = (st.unfixedErr || 0) + (st.fixedErr || 0) || (st.errorCount || 0);
    const totalErrors = fixedErr + unfixedErr;
    const accuracy = seen > 0
      ? Math.max(0, Math.min(100, Math.round(((seen - Math.min(seen, totalErrors)) / seen) * 100)))
      : 100;

    const targetWpm = (gameState && gameState.targetWpm) || 40;
    let srsKey = 'new';
    let srsBadge = '🌱';
    let srsTitle = 'New Discovery';
    if (activeErrWeight > 0 || (avgWpm > 0 && avgWpm < targetWpm)) {
      srsKey = 'practicing';
      srsBadge = '⚠️';
      srsTitle = 'Practicing (Needs Rhythm)';
    } else if (cleanHits >= 4) {
      srsKey = 'mastered';
      srsBadge = '⭐';
      srsTitle = 'Mastered';
    } else if (cleanHits >= 1) {
      srsKey = 'flow';
      srsBadge = '⚡';
      srsTitle = 'In Flow';
    }

    const tierCode = (meta && meta.tier)
      ? String(meta.tier).toUpperCase()
      : (rank <= 40 ? 'STARTER' : rank <= 300 ? 'COMMON' : rank <= 600 ? 'UNCOMMON' : rank <= 850 ? 'RARE' : 'EPIC');

    return {
      rank,
      isDiscovered,
      seen,
      avgWpm,
      lastWpm,
      bestWpm,
      cleanHits,
      bestStreak,
      fixedErr,
      unfixedErr,
      totalErrors,
      accuracy,
      srsKey,
      srsBadge,
      srsTitle,
      tierCode
    };
  }

  openLexiconWordModal(rank, meta, tel, gameState) {
    const doc = this._getDoc();
    const modal = this.lexiconWordModal || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-word-modal') : null);
    if (!modal || !meta || !tel) return;

    const wordEl = this.lexiconModalWord || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-modal-word') : null);
    const rankEl = this.lexiconModalRank || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-modal-rank') : null);
    const tierEl = this.lexiconModalTier || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-modal-tier') : null);
    const srsEl = this.lexiconModalSrs || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-modal-srs') : null);
    const bodyEl = this.lexiconModalBody || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-modal-body') : null);

    const tierName = meta.tierName || tel.tierCode;
    const tierColor = meta.tierColor || 'var(--main-color)';

    if (wordEl) {
      wordEl.textContent = tel.isDiscovered ? meta.word : '???';
      wordEl.style.color = tel.isDiscovered ? 'var(--text-color)' : 'var(--sub-color)';
    }
    if (rankEl) {
      rankEl.textContent = `#${rank}`;
    }
    if (tierEl) {
      tierEl.textContent = tierName;
      tierEl.style.color = tierColor;
      tierEl.style.borderColor = tierColor;
    }
    if (srsEl) {
      srsEl.textContent = tel.isDiscovered ? `${tel.srsBadge} ${tel.srsTitle}` : '🔒 Undiscovered';
    }

    if (bodyEl) {
      if (!tel.isDiscovered) {
        bodyEl.innerHTML = `
          <div class="lexicon-mystery-panel">
            <div class="lexicon-mystery-title">🔒 UNDISCOVERED LEXICON ENTRY</div>
            <div class="lexicon-mystery-desc">
              This word sits at <strong>Rank #${rank}</strong> in the <strong>${tierName}</strong> tier (${meta.word ? meta.word.length : '?'} letters • ${meta.bucketName || 'Motor Pattern'}).
              Build flow streaks in Flow Mode to incubate and hatch <strong>${tierName} Eggs</strong> to unlock it!
            </div>
            <div class="lexicon-stats-grid" style="margin-top: 10px;">
              <div class="lexicon-stat-box">
                <span class="lexicon-stat-label">Rarity Tier</span>
                <span class="lexicon-stat-val" style="color: ${tierColor};">${tierName}</span>
              </div>
              <div class="lexicon-stat-box">
                <span class="lexicon-stat-label">Progression Rank</span>
                <span class="lexicon-stat-val">#${rank} / 1,000</span>
              </div>
              <div class="lexicon-stat-box">
                <span class="lexicon-stat-label">Word Length</span>
                <span class="lexicon-stat-val">${meta.word ? meta.word.length : '?'} Letters</span>
              </div>
              <div class="lexicon-stat-box">
                <span class="lexicon-stat-label">Base XP Value</span>
                <span class="lexicon-stat-val">+${meta.reward || 15} XP</span>
              </div>
            </div>
          </div>
        `;
      } else {
        // Compute Bigram & Hand breakdown for discovered word
        const w = String(meta.word || '').toLowerCase();
        const leftSet = new Set('qwertasdfgzxcvb'.split(''));
        let leftCount = 0;
        let rightCount = 0;
        for (const ch of w) {
          if (leftSet.has(ch)) leftCount++;
          else if (/[a-z]/.test(ch)) rightCount++;
        }

        const ledgerMap = (gameState && gameState.bigramLedger && typeof gameState.bigramLedger === 'object')
          ? gameState.bigramLedger
          : {};
        const bigramPills = [];
        for (let i = 0; i < w.length - 1; i++) {
          const bg = w.slice(i, i + 2);
          const rawM = ledgerMap[bg];
          const mVal = typeof rawM === 'number' ? rawM : (rawM && typeof rawM.m === 'number' ? rawM.m : null);
          let bgColor = 'var(--sub-color)';
          let bgStatus = 'Unseen';
          if (mVal !== null) {
            const pct = Math.round(mVal * 100);
            if (mVal >= 0.75) {
              bgColor = '#34d399';
              bgStatus = `${pct}% Strong`;
            } else if (mVal <= 0.45) {
              bgColor = '#f43f5e';
              bgStatus = `${pct}% Weak`;
            } else {
              bgColor = '#fbbf24';
              bgStatus = `${pct}% Developing`;
            }
          }
          bigramPills.push(`
            <div class="lexicon-bigram-chip" style="border-color: ${bgColor};">
              <span class="lexicon-bigram-pair">${w[i]}→${w[i + 1]}</span>
              <span class="lexicon-bigram-score" style="color: ${bgColor};">${bgStatus}</span>
            </div>
          `);
        }

        bodyEl.innerHTML = `
          <div class="lexicon-stats-section-title">// LIFETIME TELEMETRY</div>
          <div class="lexicon-stats-grid">
            <div class="lexicon-stat-box highlight">
              <span class="lexicon-stat-label">Personal Best (Peak)</span>
              <span class="lexicon-stat-val" style="color: var(--main-color);">${tel.seen > 0 ? `${tel.bestWpm} WPM` : '--'}</span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Average Pace</span>
              <span class="lexicon-stat-val">${tel.seen > 0 ? `${tel.avgWpm} WPM` : '--'}</span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Last Pace</span>
              <span class="lexicon-stat-val">${tel.seen > 0 ? `${tel.lastWpm} WPM` : '--'}</span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Word Accuracy</span>
              <span class="lexicon-stat-val" style="color: ${tel.accuracy >= 95 ? '#34d399' : tel.accuracy >= 80 ? '#fbbf24' : '#f43f5e'};">${tel.seen > 0 ? `${tel.accuracy}%` : '100%'}</span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Times Seen</span>
              <span class="lexicon-stat-val">${tel.seen}</span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Clean Streak</span>
              <span class="lexicon-stat-val">${tel.cleanHits} <span style="font-size: 10px; color: var(--sub-color);">(Best: ${tel.bestStreak})</span></span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Fixed Errors</span>
              <span class="lexicon-stat-val">${tel.fixedErr}</span>
            </div>
            <div class="lexicon-stat-box">
              <span class="lexicon-stat-label">Unfixed Errors</span>
              <span class="lexicon-stat-val" style="color: ${tel.unfixedErr > 0 ? '#f43f5e' : 'var(--text-color)'};">${tel.unfixedErr}</span>
            </div>
          </div>

          <div class="lexicon-stats-section-title" style="margin-top: 12px;">// WORD BREAKDOWN & BIOMECHANICS</div>
          <div class="lexicon-breakdown-row">
            <span class="lexicon-breakdown-pill" style="border-color: ${meta.bucketColor || 'var(--border-color)'}; color: ${meta.bucketColor || 'var(--main-color)'};">
              ${meta.bucketTag || meta.bucketName || 'Home Core'}
            </span>
            <span class="lexicon-breakdown-pill">Length: ${w.length} chars</span>
            <span class="lexicon-breakdown-pill">Hands: ${leftCount}L / ${rightCount}R</span>
            <span class="lexicon-breakdown-pill">Reward: +${meta.reward || 8} XP</span>
          </div>
          ${bigramPills.length > 0 ? `
            <div class="lexicon-bigrams-wrap">
              ${bigramPills.join('')}
            </div>
          ` : ''}
        `;
      }
    }

    modal.style.display = 'flex';
  }

  closeLexiconWordModal() {
    const doc = this._getDoc();
    const modal = this.lexiconWordModal || (doc && typeof doc.getElementById === 'function' ? doc.getElementById('lexicon-word-modal') : null);
    if (modal) {
      modal.style.display = 'none';
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
    const discoveredPctStr = `${((unlocked.length / 1000) * 100).toFixed(1)}%`;
    if (this.statsRpgWordsCount) {
      this.statsRpgWordsCount.textContent = `${unlocked.length} / 1,000 (${discoveredPctStr})`;
    }
    if (this.deckUnlockedCount) this.deckUnlockedCount.textContent = unlocked.length;
    if (this.lexiconDiscoveredPct) this.lexiconDiscoveredPct.textContent = discoveredPctStr;
    if (this.lexiconProgressBar) this.lexiconProgressBar.style.width = discoveredPctStr;
    if (this.statsRpgEggsCount) this.statsRpgEggsCount.textContent = Math.max(0, unlocked.length - 1);
    if (this.statsRpgHighStreak) this.statsRpgHighStreak.textContent = `${gameState.highStreak || 0} words`;
    if (this.statsRpgFlowTime) {
      const totalSec = Math.max(0, Math.round(gameState.flowTimeSeconds || 0));
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      this.statsRpgFlowTime.textContent = hrs > 0
        ? `${hrs}h ${mins}m`
        : `${mins}m ${secs}s`;
    }

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
          const badgesHtml = this.renderModBadgesHtml(item);
          tr.innerHTML = `
            <td>${item.date || '--'}</td>
            <td><div class="history-mode-cell"><span>${item.duration || 0}s</span>${badgesHtml ? `<div class="history-mods-wrap">${badgesHtml}</div>` : ''}</div></td>
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
    if (filter) this.currentDeckFilter = filter;
    if (getWordMetaFn) this.getWordMetaFn = getWordMetaFn;
    const metaFn = getWordMetaFn || this.getWordMetaFn;

    this.deckWordsScroll.innerHTML = '';
    if (Array.isArray(this.deckWordsScroll.children)) {
      this.deckWordsScroll.children.length = 0;
    }

    const unlocked = gameState.unlockedRanks || [1];
    const unlockedSet = new Set(unlocked);
    const discoveredPctStr = `${((unlocked.length / 1000) * 100).toFixed(1)}%`;
    if (this.deckUnlockedCount) this.deckUnlockedCount.textContent = unlocked.length;
    if (this.lexiconDiscoveredPct) this.lexiconDiscoveredPct.textContent = discoveredPctStr;
    if (this.lexiconProgressBar) this.lexiconProgressBar.style.width = discoveredPctStr;

    let baseRanks;
    if (this.lexiconViewMode === 'all') {
      baseRanks = [];
      for (let r = 1; r <= 1000; r++) baseRanks.push(r);
    } else {
      baseRanks = unlocked.slice();
    }

    const patternFilter = this.currentDeckFilter || 'all';
    const rarityFilter = this.lexiconRarityFilter || 'all';
    const masteryFilter = this.lexiconMasteryFilter || 'all';
    const query = (this.lexiconSearchQuery || '').trim().toLowerCase();

    const entries = [];
    for (let i = 0; i < baseRanks.length; i++) {
      const rank = baseRanks[i];
      const meta = metaFn ? metaFn(rank) : null;
      if (!meta) continue;

      const tel = this._computeWordTelemetry(rank, meta, gameState, unlockedSet);

      // 1. Pattern filter
      if (patternFilter !== 'all') {
        const matchesPattern = meta.bucketId === patternFilter || (Array.isArray(meta.tags) && meta.tags.includes(patternFilter));
        if (!matchesPattern) continue;
      }

      // 2. Rarity filter
      if (rarityFilter !== 'all') {
        if (tel.tierCode !== rarityFilter && String(meta.tierName || '').toUpperCase() !== rarityFilter) {
          continue;
        }
      }

      // 3. Mastery filter
      if (masteryFilter !== 'all') {
        if (!tel.isDiscovered || tel.srsKey !== masteryFilter) {
          continue;
        }
      }

      // 4. Search query filter
      if (query) {
        const rankStr = `#${rank}`;
        const exactRankNum = String(rank) === query || rankStr === query;
        if (tel.isDiscovered) {
          const wordMatch = String(meta.word || '').toLowerCase().includes(query);
          if (!wordMatch && !exactRankNum && !rankStr.includes(query)) continue;
        } else {
          // Undiscovered words only match by #rank or tier name so ??? words aren't spoiled
          const tierMatch = String(meta.tierName || tel.tierCode).toLowerCase().includes(query);
          if (!exactRankNum && !rankStr.includes(query) && !tierMatch) continue;
        }
      }

      entries.push({ rank, meta, tel });
    }

    // 5. Sort entries
    const sortBy = this.lexiconSortBy || 'rank';
    entries.sort((a, b) => {
      if (sortBy === 'rank') {
        return a.rank - b.rank;
      }
      // Put discovered words ahead of undiscovered words when sorting by performance telemetry
      if (a.tel.isDiscovered !== b.tel.isDiscovered) {
        return a.tel.isDiscovered ? -1 : 1;
      }
      if (sortBy === 'wpm_desc') {
        return (b.tel.avgWpm - a.tel.avgWpm) || (b.tel.bestWpm - a.tel.bestWpm) || (a.rank - b.rank);
      }
      if (sortBy === 'wpm_asc') {
        const aSeen = a.tel.seen > 0 ? 1 : 0;
        const bSeen = b.tel.seen > 0 ? 1 : 0;
        if (aSeen !== bSeen) return bSeen - aSeen;
        return (a.tel.avgWpm - b.tel.avgWpm) || (a.rank - b.rank);
      }
      if (sortBy === 'acc_desc') {
        return (b.tel.accuracy - a.tel.accuracy) || (b.tel.seen - a.tel.seen) || (a.rank - b.rank);
      }
      if (sortBy === 'acc_asc') {
        const aSeen = a.tel.seen > 0 ? 1 : 0;
        const bSeen = b.tel.seen > 0 ? 1 : 0;
        if (aSeen !== bSeen) return bSeen - aSeen;
        return (a.tel.accuracy - b.tel.accuracy) || (b.tel.totalErrors - a.tel.totalErrors) || (a.rank - b.rank);
      }
      if (sortBy === 'seen_desc') {
        return (b.tel.seen - a.tel.seen) || (a.rank - b.rank);
      }
      return a.rank - b.rank;
    });

    if (entries.length === 0) {
      this.deckWordsScroll.innerHTML = `<span style="color: var(--sub-color); font-size: 12px; padding: 10px;">No words match the active Lexicon filters.</span>`;
      return;
    }

    const doc = this._getDoc();
    if (!doc) return;

    entries.forEach(({ rank, meta, tel }) => {
      const chip = doc.createElement('div');
      chip.dataset.rank = String(rank);
      const tierName = meta.tierName || tel.tierCode;
      const tierColor = meta.tierColor || 'var(--sub-color)';

      if (!tel.isDiscovered) {
        chip.className = 'deck-word-chip lexicon-word-card undiscovered';
        chip.style.borderColor = tierColor;
        chip.title = `Rank #${rank} • ${tierName} Tier (Undiscovered — Click for Rarity Tier Hunt info)`;
        chip.innerHTML = `
          <span class="lexicon-chip-rank">#${rank}</span>
          <strong class="lexicon-chip-mystery">???</strong>
          <span class="deck-chip-tier" style="font-size: 9px; color: ${tierColor}; text-transform: uppercase; font-weight: 700;">${tierName}</span>
        `;
      } else {
        chip.className = 'deck-word-chip lexicon-word-card discovered';
        chip.style.borderColor = meta.bucketColor || 'var(--border-color)';
        chip.title = `#${rank} ${meta.word} • ${tierName} • ${meta.bucketName || 'Pattern'} • ${tel.srsTitle} • Avg: ${tel.avgWpm} WPM • Acc: ${tel.accuracy}% • Seen: ${tel.seen}`;
        const statPill = tel.seen > 0
          ? `<span class="lexicon-chip-stat">${tel.avgWpm} WPM · ${tel.accuracy}%</span>`
          : `<span class="lexicon-chip-stat unseen">Unseen</span>`;
        chip.innerHTML = `
          <span class="lexicon-chip-rank">#${rank}</span>
          <span class="deck-chip-srs">${tel.srsBadge}</span>
          <strong style="color: var(--text-color);">${meta.word}</strong>
          <span class="deck-chip-tag" style="font-size: 10px; color: ${meta.bucketColor || 'var(--main-color)'}; background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 4px;">${meta.bucketTag || meta.bucketId || ''}</span>
          ${statPill}
          <span class="deck-chip-tier" style="font-size: 9px; color: ${tierColor}; text-transform: uppercase; font-weight: 700;">${tierName}</span>
        `;
      }

      chip.addEventListener('click', () => {
        this.openLexiconWordModal(rank, meta, tel, gameState);
      });

      this.deckWordsScroll.appendChild(chip);
    });
  }

  renderClassicStats(stats, onSelectClassicTest = null) {
    if (onSelectClassicTest) {
      this.onSelectClassicTest = onSelectClassicTest;
    }
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
          tr.className = 'classic-history-row';
          tr.style.cursor = 'pointer';
          tr.title = 'Click to inspect this Classic Test on the timeline graph';
          const acc = item.accuracy ?? item.acc ?? 100;
          const badgesHtml = this.renderModBadgesHtml(item);
          tr.innerHTML = `
            <td>${item.date || '--'}</td>
            <td><div class="history-mode-cell"><span>${item.duration || 0}s</span>${badgesHtml ? `<div class="history-mods-wrap">${badgesHtml}</div>` : ''}</div></td>
            <td style="color: var(--main-color); font-weight: 700;">${item.wpm || 0} WPM</td>
            <td>${item.rawWpm ?? item.wpm ?? 0}</td>
            <td>${acc}%</td>
          `;
          tr.addEventListener('click', () => {
            if (this.onSelectClassicTest) {
              this.onSelectClassicTest(item);
            }
          });
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
      : {
          theme: 'oled_cyan',
          flowFx: 'adaptive_resonance',
          caret: 'line',
          caretFx: 'rainbow_prism',
          ghostStyle: 'phantom_line',
          sound: 'clicky_blue'
        };

    const totalCount = cosmeticsModel.getTotalCount();
    const unlockedCount = cosmeticsModel.getUnlockedCount(level, unlockedAchievements);
    const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    if (this.armoryCountEl) {
      this.armoryCountEl.textContent = `${unlockedCount} / ${totalCount} unlocked (${pct}%)`;
    }
    if (this.armoryProgressBar) {
      this.armoryProgressBar.style.width = `${pct}%`;
    }

    const rootDoc = this._getDoc();

    // Render 6-Slot Equipped Loadout Bar
    const loadoutBar = this.armoryLoadoutBar || (rootDoc && typeof rootDoc.getElementById === 'function' ? rootDoc.getElementById('armory-loadout-bar') : null);
    if (loadoutBar && rootDoc && typeof rootDoc.createElement === 'function') {
      loadoutBar.innerHTML = '';
      if (Array.isArray(loadoutBar.children)) loadoutBar.children.length = 0;
      const slotDefs = [
        { category: 'theme', label: 'STAGE THEME', item: cosmeticsModel.getTheme(equipped.theme) },
        { category: 'flowFx', label: 'FLOW FX', item: cosmeticsModel.getFlowFx(equipped.flowFx) },
        { category: 'caret', label: 'CARET SHAPE', item: cosmeticsModel.getCaret(equipped.caret) },
        { category: 'caretFx', label: 'CARET FX', item: cosmeticsModel.getCaretFx(equipped.caretFx) },
        { category: 'ghostStyle', label: 'GHOST PACER', item: cosmeticsModel.getGhostStyle(equipped.ghostStyle) },
        { category: 'sound', label: 'SWITCH SOUND', item: cosmeticsModel.getSound(equipped.sound) }
      ];

      slotDefs.forEach(slot => {
        const item = slot.item;
        if (!item) return;
        const slotEl = rootDoc.createElement('button');
        slotEl.type = 'button';
        slotEl.className = `armory-loadout-slot ${this.currentArmoryFilter === slot.category ? 'active-filter' : ''}`;
        slotEl.dataset.slotCategory = slot.category;
        slotEl.dataset.equippedId = item.id;
        slotEl.title = `Equipped ${slot.label}: ${item.title} — Click to filter ${slot.label}`;

        let swatchesHtml = '';
        if (Array.isArray(item.swatches) && item.swatches.length > 0) {
          const dots = item.swatches.slice(0, 4).map(c => `<span class="theme-swatch-dot" style="background: ${c};"></span>`).join('');
          swatchesHtml = `<div class="theme-swatches loadout-swatches">${dots}</div>`;
        }

        slotEl.innerHTML = `
          <div class="loadout-slot-top">
            <span class="loadout-slot-cat">${slot.label}</span>
            ${swatchesHtml}
          </div>
          <div class="loadout-slot-main">
            <span class="loadout-slot-icon">${item.icon}</span>
            <span class="loadout-slot-name">${item.title}</span>
          </div>
        `;

        slotEl.addEventListener('click', () => {
          const nextFilter = this.currentArmoryFilter === slot.category ? 'all' : slot.category;
          this.filterArmorySections(nextFilter);
        });

        loadoutBar.appendChild(slotEl);
      });
    }

    const renderCategoryGrid = (gridEl, category) => {
      if (!gridEl) return;
      const doc = (gridEl && gridEl.ownerDocument)
        ? gridEl.ownerDocument
        : rootDoc;
      if (!doc) return;

      gridEl.innerHTML = '';
      const items = cosmeticsModel.getAnnotatedItems(category, level, unlockedAchievements, equipped);
      const catUnlocked = items.filter(i => i.unlocked).length;

      const countBadge = (doc && typeof doc.querySelector === 'function')
        ? doc.querySelector(`[data-armory-count="${category}"]`)
        : null;
      if (countBadge) {
        countBadge.textContent = `${catUnlocked} / ${items.length} UNLOCKED`;
      }

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
