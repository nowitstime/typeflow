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
    this.resWpmEl = elements.resWpmEl || (typeof document !== 'undefined' ? document.getElementById('res-wpm') : null);
    this.resAccEl = elements.resAccEl || (typeof document !== 'undefined' ? document.getElementById('res-acc') : null);
    this.resRawEl = elements.resRawEl || (typeof document !== 'undefined' ? document.getElementById('res-raw') : null);
    this.resCharsEl = elements.resCharsEl || (typeof document !== 'undefined' ? document.getElementById('res-chars') : null);
    this.resFixedEl = elements.resFixedEl || (typeof document !== 'undefined' ? document.getElementById('res-fixed') : null);
    this.resFixedDetailEl = elements.resFixedDetailEl || (typeof document !== 'undefined' ? document.getElementById('res-fixed-detail') : null);
    this.resConsistencyEl = elements.resConsistencyEl || (typeof document !== 'undefined' ? document.getElementById('res-consistency') : null);
    this.resTimeEl = elements.resTimeEl || (typeof document !== 'undefined' ? document.getElementById('res-time') : null);
    this.resTimeDetailEl = elements.resTimeDetailEl || (typeof document !== 'undefined' ? document.getElementById('res-time-detail') : null);

    // Lifetime Stats Modal
    this.statsModal = elements.statsModal || (typeof document !== 'undefined' ? document.getElementById('stats-modal') : null);
    this.tabStatsFlow = elements.tabStatsFlow || (typeof document !== 'undefined' ? document.getElementById('tab-stats-flow') : null);
    this.tabStatsClassic = elements.tabStatsClassic || (typeof document !== 'undefined' ? document.getElementById('tab-stats-classic') : null);
    this.paneStatsFlow = elements.paneStatsFlow || (typeof document !== 'undefined' ? document.getElementById('pane-stats-flow') : null);
    this.paneStatsClassic = elements.paneStatsClassic || (typeof document !== 'undefined' ? document.getElementById('pane-stats-classic') : null);

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
  }

  showClassicResults(stats) {
    if (this.testSection) this.testSection.style.display = 'none';
    if (this.resultsSection) this.resultsSection.classList.add('visible');

    if (this.resWpmEl) this.resWpmEl.textContent = stats.wpm;
    if (this.resAccEl) this.resAccEl.textContent = `${stats.accuracy}%`;
    if (this.resRawEl) this.resRawEl.textContent = stats.rawWpm;
    if (this.resCharsEl) {
      this.resCharsEl.textContent = `${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars || 0}/${stats.missedChars || 0}`;
    }
    if (this.resFixedEl) this.resFixedEl.textContent = stats.fixedErrors || 0;
    if (this.resFixedDetailEl) {
      const fixed = stats.fixedErrors || 0;
      this.resFixedDetailEl.textContent = fixed === 1 ? '1 error fixed' : `${fixed} errors fixed`;
    }
    if (this.resConsistencyEl) this.resConsistencyEl.textContent = `${stats.consistency}%`;
    if (this.resTimeEl) this.resTimeEl.textContent = `${stats.duration}s`;
    if (this.resTimeDetailEl) this.resTimeDetailEl.textContent = 'standard mode';
  }

  hideClassicResults() {
    if (this.resultsSection) this.resultsSection.classList.remove('visible');
    if (this.testSection) this.testSection.style.display = 'flex';
  }

  openStatsModal(defaultTab = 'flow') {
    if (this.statsModal) {
      this.statsModal.style.display = 'flex';
    }
    this.switchStatsTab(defaultTab);
  }

  closeStatsModal() {
    if (this.statsModal) {
      this.statsModal.style.display = 'none';
    }
  }

  switchStatsTab(tabName) {
    const isFlow = tabName === 'flow';
    if (this.tabStatsFlow) this.tabStatsFlow.classList.toggle('active', isFlow);
    if (this.tabStatsClassic) this.tabStatsClassic.classList.toggle('active', !isFlow);
    if (this.paneStatsFlow) this.paneStatsFlow.style.display = isFlow ? 'flex' : 'none';
    if (this.paneStatsClassic) this.paneStatsClassic.style.display = isFlow ? 'none' : 'flex';
  }
  bindEvents(handlers = {}) {
    if (this.tabStatsFlow) {
      this.tabStatsFlow.addEventListener('click', () => this.switchStatsTab('flow'));
    }
    if (this.tabStatsClassic) {
      this.tabStatsClassic.addEventListener('click', () => this.switchStatsTab('classic'));
    }

    if (this.nextTestBtn) {
      this.nextTestBtn.addEventListener('click', () => {
        if (handlers.onNextTest) handlers.onNextTest();
      });
    }

    const closeStatsBtn = (typeof document !== 'undefined') ? document.getElementById('close-stats-btn') : null;
    const closeStatsFooterBtn = (typeof document !== 'undefined') ? document.getElementById('close-stats-footer-btn') : null;
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

    const statsBtn = (typeof document !== 'undefined') ? document.getElementById('stats-btn') : null;
    const openDeckMasteryBtn = (typeof document !== 'undefined') ? document.getElementById('open-deck-mastery-btn') : null;
    if (statsBtn) {
      statsBtn.addEventListener('click', () => {
        if (handlers.onOpenStats) handlers.onOpenStats('flow');
      });
    }
    if (openDeckMasteryBtn) {
      openDeckMasteryBtn.addEventListener('click', () => {
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

  renderFlowStats(gameState, bucketStats, getWordMetaFn, storageService = null) {
    if (!gameState) return;
    this.currentGameState = gameState;
    this.getWordMetaFn = getWordMetaFn;
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

    // Render Motor Cards
    if (this.motorGrid && bucketStats) {
      this.motorGrid.innerHTML = '';
      Object.values(bucketStats).forEach(b => {
        const card = document.createElement('div');
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

      const chip = document.createElement('div');
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

    const tbody = this.classicHistoryTbody || (this.classicHistoryTable ? this.classicHistoryTable.querySelector('tbody') : null);
    if (tbody) {
      tbody.innerHTML = '';
      const history = stats.recentHistory || [];
      if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--sub-color); padding: 12px;">No tests recorded yet.</td></tr>';
      } else {
        history.forEach(item => {
          const tr = document.createElement('tr');
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
}

if (typeof window !== 'undefined') {
  window.ModalView = ModalView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ModalView };
}
