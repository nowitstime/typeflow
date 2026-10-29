/**
 * TypeFlow - ChartView
 * Passive View for rendering the end-of-test performance timeline on HTML5 Canvas 2D:
 * Multi-layer WPM curves (Cumulative WPM, Rolling Pace, Raw WPM), error markers (fixed vs unfixed),
 * high-DPI scaling, and hover/touch interaction tooltips.
 * Zero business logic.
 */

class ChartView {
  constructor(elements = {}) {
    this.chartCanvas = elements.chartCanvas || (typeof document !== 'undefined' ? document.getElementById('wpm-chart') : null);
    this.chartTooltip = elements.chartTooltip || (typeof document !== 'undefined' ? document.getElementById('chart-tooltip') : null);
    this.tooltipTime = elements.tooltipTime || (typeof document !== 'undefined' ? document.getElementById('tooltip-time') : null);
    this.tooltipWpm = elements.tooltipWpm || (typeof document !== 'undefined' ? document.getElementById('tooltip-wpm') : null);
    this.tooltipPace = elements.tooltipPace || (typeof document !== 'undefined' ? document.getElementById('tooltip-pace') : null);
    this.tooltipRaw = elements.tooltipRaw || (typeof document !== 'undefined' ? document.getElementById('tooltip-raw') : null);
    this.tooltipErrRow = elements.tooltipErrRow || (typeof document !== 'undefined' ? document.getElementById('tooltip-err-row') : null);
    this.chartHoverStats = elements.chartHoverStats || (typeof document !== 'undefined' ? document.getElementById('chart-hover-stats') : null);

    this.chartDataPoints = [];
    this.hoveredPointIndex = null;
    this.cachedHistory = [];
  }

  /**
   * Binds interaction listeners (hover, tap) to the chart canvas.
   */
  bindEvents() {
    if (this.chartCanvas) {
      this.chartCanvas.addEventListener('mousemove', (e) => this.handleInteraction(e));
      this.chartCanvas.addEventListener('mouseleave', () => this.clearHover());
      this.chartCanvas.addEventListener('touchstart', (e) => this.handleInteraction(e), { passive: true });
      this.chartCanvas.addEventListener('touchmove', (e) => this.handleInteraction(e), { passive: true });
      this.chartCanvas.addEventListener('touchend', () => this.clearHover());
    }
  }

  /**
   * Renders the Canvas 2D graph with DPI scaling and anti-aliasing.
   */
  render(wpmHistory, hoverIndex = null) {
    if (!this.chartCanvas || !wpmHistory || wpmHistory.length === 0) return;
    this.cachedHistory = wpmHistory;
    this.hoveredPointIndex = hoverIndex;

    const ctx = this.chartCanvas.getContext('2d');
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

    const width = this.chartCanvas.parentElement ? this.chartCanvas.parentElement.clientWidth : 600;
    const height = 180;

    this.chartCanvas.width = width * dpr;
    this.chartCanvas.height = height * dpr;
    this.chartCanvas.style.width = `${width}px`;
    this.chartCanvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = wpmHistory.flatMap(h => [h.wpm, h.rawWpm || h.raw, h.burstWpm || h.wpm]);
    const maxVal = Math.max(40, ...allValues) + 10;
    const minVal = 0;

    // Grid lines & Y-axis labels
    ctx.strokeStyle = '#1a2332';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#526071';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

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

    // Time ticks along X axis
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xStep = Math.max(1, Math.floor(n / 6));
    for (let i = 0; i < n; i += xStep) {
      const x = getX(i);
      const sec = wpmHistory[i].second || wpmHistory[i].time || (i + 1);
      ctx.fillText(`${sec}s`, x, height - padding.bottom + 8);
    }

    // 1. Raw WPM line (dashed grey)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.rawWpm || pt.raw || pt.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // 2. Rolling Pace line (mint teal)
    ctx.save();
    ctx.strokeStyle = '#2dd4bf';
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

    // 3. Cumulative Avg WPM line (matches active theme with area gradient)
    ctx.save();
    let mainColor = '#38bdf8';
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const computed = getComputedStyle(document.documentElement).getPropertyValue('--main-color');
        if (computed && computed.trim()) mainColor = computed.trim();
      } catch (e) {}
    }

    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    let gradColorStart = 'rgba(56, 189, 248, 0.25)';
    let gradColorEnd = 'rgba(56, 189, 248, 0.0)';
    if (mainColor.startsWith('#') && (mainColor.length === 7 || mainColor.length === 4)) {
      let r = 56, g = 189, b = 248;
      if (mainColor.length === 7) {
        r = parseInt(mainColor.slice(1, 3), 16);
        g = parseInt(mainColor.slice(3, 5), 16);
        b = parseInt(mainColor.slice(5, 7), 16);
      } else {
        r = parseInt(mainColor[1] + mainColor[1], 16);
        g = parseInt(mainColor[2] + mainColor[2], 16);
        b = parseInt(mainColor[3] + mainColor[3], 16);
      }
      gradColorStart = `rgba(${r}, ${g}, ${b}, 0.25)`;
      gradColorEnd = `rgba(${r}, ${g}, ${b}, 0.0)`;
    }
    grad.addColorStop(0, gradColorStart);
    grad.addColorStop(1, gradColorEnd);

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

    ctx.strokeStyle = mainColor;
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
    this.chartDataPoints = [];
    wpmHistory.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.wpm);
      this.chartDataPoints.push({ x, y, item: pt, index: i });

      // Error markers
      const errors = (typeof pt.errors === 'number') ? pt.errors : 0;
      if (errors > 0) {
        const isFixed = (pt.fixed >= errors);
        ctx.save();
        ctx.fillStyle = isFixed ? '#34d399' : '#f87171';
        ctx.beginPath();
        ctx.arc(x, getY(pt.rawWpm || pt.raw || pt.wpm), 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Hover crosshair and highlighted point
    if (hoverIndex !== null && this.chartDataPoints[hoverIndex]) {
      const target = this.chartDataPoints[hoverIndex];
      ctx.save();
      ctx.strokeStyle = gradColorStart;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(target.x, padding.top);
      ctx.lineTo(target.x, padding.top + chartH);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = mainColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  handleInteraction(e) {
    if (this.chartDataPoints.length === 0 || !this.chartCanvas) return;
    const rect = this.chartCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const mouseX = clientX - rect.left;

    let closestIdx = 0;
    let minDiff = Infinity;
    this.chartDataPoints.forEach((pt, i) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    if (minDiff < 45) {
      this.hoveredPointIndex = closestIdx;
      const pt = this.chartDataPoints[closestIdx];
      this.render(this.cachedHistory, this.hoveredPointIndex);

      if (this.chartTooltip) {
        const sec = pt.item.second || pt.item.time || (closestIdx + 1);
        const momTag = (typeof pt.item.momentum === 'number') ? ` • ${pt.item.momentum}% Flow` : '';
        if (this.tooltipTime) this.tooltipTime.textContent = `${sec}s${momTag}`;
        if (this.tooltipWpm) this.tooltipWpm.textContent = `${pt.item.wpm} WPM`;
        if (this.tooltipPace) this.tooltipPace.textContent = `${pt.item.burstWpm || pt.item.wpm} WPM`;
        if (this.tooltipRaw) this.tooltipRaw.textContent = `${pt.item.rawWpm || pt.item.raw || pt.item.wpm} WPM`;

        const errors = (typeof pt.item.errors === 'number') ? pt.item.errors : 0;
        if (this.tooltipErrRow) {
          if (errors > 0) {
            const isFixed = (pt.item.fixed >= errors);
            this.tooltipErrRow.innerHTML = isFixed
              ? `<span class="dot-indicator dot-fixed"></span> Errors: <strong>${errors}</strong> <span class="badge-fixed">(Fixed ✓)</span>`
              : `<span class="dot-indicator dot-err"></span> Errors: <strong>${errors}</strong> <span class="badge-unfixed">(Unfixed ✗)</span>`;
          } else {
            this.tooltipErrRow.innerHTML = `<span class="dot-indicator dot-fixed"></span> Errors: <strong>0</strong>`;
          }
        }

        const tooltipW = 180;
        let leftPos = pt.x - tooltipW / 2;
        leftPos = Math.max(10, Math.min(rect.width - tooltipW - 10, leftPos));
        this.chartTooltip.style.left = `${leftPos}px`;
        this.chartTooltip.style.top = `${Math.max(10, pt.y - 120)}px`;
        this.chartTooltip.classList.add('visible');
      }

      if (this.chartHoverStats) {
        const sec = pt.item.second || pt.item.time || (closestIdx + 1);
        const errors = (typeof pt.item.errors === 'number') ? pt.item.errors : 0;
        const momHover = (typeof pt.item.momentum === 'number') ? ` • ${pt.item.momentum}% Flow` : '';
        this.chartHoverStats.innerHTML = `<strong>${sec}s:</strong> Avg ${pt.item.wpm} WPM • Pace ${pt.item.burstWpm || pt.item.wpm} WPM • Raw ${pt.item.rawWpm || pt.item.raw || pt.item.wpm} WPM${momHover} • ${errors} err`;
      }
    }
  }

  clearHover() {
    this.hoveredPointIndex = null;
    if (this.chartTooltip) this.chartTooltip.classList.remove('visible');
    if (this.chartHoverStats) this.chartHoverStats.textContent = 'Hover or tap points for details';
    this.render(this.cachedHistory, null);
  }
}

if (typeof window !== 'undefined') {
  window.ChartView = ChartView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChartView };
}
