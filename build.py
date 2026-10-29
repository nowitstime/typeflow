#!/usr/bin/env python3
"""
TypeFlow Build & Bundling Script
Combines style.css, words.js, storage.js, and app.js into a single standalone index.html
so that Android content:// URIs and standard browsers load seamlessly without CORS/sub-resource blocks.
"""

import os
import sys
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def clean_css(css):
    """Strips comments and collapses empty lines from CSS while preserving rules."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
    lines = [l for l in css.splitlines() if l.strip()]
    return "\n".join(lines)

def clean_js(js):
    """Strips comments and collapses empty lines from JS while preserving string literals."""
    js = re.sub(r"/\*.*?\*/", "", js, flags=re.DOTALL)
    out_lines = []
    for line in js.splitlines():
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        if "//" in line:
            if '"' not in line and "'" not in line and '`' not in line:
                line = re.sub(r"\s*//.*$", "", line)
        if line.strip():
            out_lines.append(line)
    return "\n".join(out_lines)

def build():
    print("[TypeFlow] Starting build with Observable MVC modules...")

    css_path = os.path.join(BASE_DIR, "style.css")
    output_path = os.path.join(BASE_DIR, "index.html")

    if not os.path.exists(css_path):
        print(f"Error: Missing required file {css_path}")
        sys.exit(1)

    with open(css_path, "r", encoding="utf-8") as f:
        css_content = clean_css(f.read())

    mvc_modules = [
        "src/core/Constants.js",
        "src/core/EventEmitter.js",
        "src/models/BigramLedger.js",
        "src/models/WordsModel.js",
        "src/models/FlowModel.js",
        "src/models/SessionModel.js",
        "src/models/EggNestModel.js",
        "src/models/AchievementsModel.js",
        "src/models/CosmeticsModel.js",
        "src/services/StorageService.js",
        "src/services/AudioService.js",
        "src/views/StageView.js",
        "src/views/NestView.js",
        "src/views/HUDView.js",
        "src/views/ChartView.js",
        "src/views/ModalView.js",
        "src/controllers/KeyboardController.js",
        "src/controllers/GameController.js",
        "src/bootstrap.js"
    ]

    bundled_js_parts = []
    for mod_rel in mvc_modules:
        mod_path = os.path.join(BASE_DIR, mod_rel)
        if not os.path.exists(mod_path):
            print(f"Error: Missing required module {mod_path}")
            sys.exit(1)
        with open(mod_path, "r", encoding="utf-8") as f:
            bundled_js_parts.append(clean_js(f.read()))

    bundled_js = "\n".join(bundled_js_parts)

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeFlow - OLED Typing & Flow Roguelike</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
{css_content}
  </style>
</head>
<body>
  <!-- Micro-Toast Achievement Notification -->
  <div class="achievement-toast" id="achievement-toast"></div>

  <!-- Procedural SVG Turbulence Filter for Solar Inferno Flow FX -->
  <svg width="0" height="0" style="position: absolute; pointer-events: none;" aria-hidden="true">
    <defs>
      <filter id="tf-flame-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.075" numOctaves="3" seed="4">
          <animate attributeName="baseFrequency" dur="3.6s" values="0.018 0.075; 0.024 0.11; 0.018 0.075" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="22" />
      </filter>
    </defs>
  </svg>

  <!-- Flow Atmosphere Vignette Overlay -->
  <div class="flow-vignette-overlay flow-fx-adaptive_resonance" id="flow-vignette-overlay"></div>
  <div class="app-container">
    <!-- Header -->
    <header>
      <div class="header-left">
        <div class="logo-area" id="brand-logo" title="Reset Test">
          <div class="logo-icon">⚡</div>
          <div class="logo-title">type<span>flow</span></div>
        </div>

        <!-- Mode Selector Tabs -->
        <div class="mode-tabs" id="mode-tabs">
          <button class="mode-tab" data-mode="classic" id="tab-classic">⏱️ Classic</button>
          <button class="mode-tab active" data-mode="flow" id="tab-flow">🎮 Flow RPG</button>
        </div>
      </div>

      <div class="header-controls">
        <!-- Classic Duration Pill (Visible in Classic Mode) -->
        <div class="config-pill" id="classic-duration-pill" style="display: none;" title="Test Duration">
          <span class="config-item active" data-time="30">30s</span>
          <span class="config-item" data-time="15">15s</span>
          <span class="config-item" data-time="60">60s</span>
        </div>

        <!-- Flow Difficulty Slider & Custom Input (Visible in Flow Mode) -->
        <div class="flow-diff-pill" id="flow-target-pill" title="Pace Difficulty Target (WPM)">
          <span class="diff-label">Pace:</span>
          <input type="range" id="diff-slider" class="diff-slider" min="15" max="120" step="1" value="40" aria-label="Difficulty slider">
          <div class="diff-input-wrap">
            <input type="number" id="diff-input" class="diff-input" min="10" max="300" step="1" value="40" aria-label="Target WPM input">
            <span class="diff-unit">wpm</span>
          </div>
        </div>

        <!-- Level HUD Card in Header -->
        <div class="level-hud-card" id="level-hud-card" title="Player Level & XP Progress • Click to Open Cosmetic Armory">
          <div class="level-hud-info">
            <span class="hud-level-badge" id="hud-level-badge">Lv. 1</span>
            <span class="hud-level-title" id="hud-level-title">Novice Typist</span>
            <span class="hud-xp-ratio" id="hud-xp-ratio">0/100 XP</span>
          </div>
          <div class="hud-level-bar-bg">
            <div class="hud-level-bar-fill" id="hud-level-bar-fill"></div>
          </div>
        </div>
      </div>

      <!-- Action Tools (Wraps on the right when expanded) -->
      <div class="header-actions">
        <!-- Stats Modal Toggle Button -->
        <button class="icon-btn" id="stats-btn" title="View Lifetime Stats & Personal Bests">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </button>

        <!-- Hidden Mode Tool Group -->
        <div class="header-tool-group">
          <button class="icon-btn" id="hd-btn" title="Toggle Hidden (HD) Look-Ahead Mode">
            <span>HD</span>
          </button>

          <!-- Hidden Mode Config Pill (Revealed when HD is active) -->
          <div class="hd-config-pill" id="hd-config-pill" style="display: none;" title="Hidden Words Count">
            <div class="hd-mode-toggle" id="hd-mode-toggle">
              <button type="button" class="hd-mode-btn active" id="hd-mode-word" data-mode="word" title="Word Vanish">Word</button>
              <button type="button" class="hd-mode-btn" id="hd-mode-char" data-mode="char" title="Combo Horizon">Combo</button>
            </div>
            <div class="hd-word-slider-group" id="hd-word-slider-group" style="display: flex;" title="Hidden Words Count">
              <span class="hd-label">Hide:</span>
              <input type="range" id="hd-words-slider" class="diff-slider" min="1" max="6" step="1" value="1" aria-label="Hidden words count slider">
              <span class="hd-val" id="hd-words-val">1 word</span>
            </div>
          </div>
        </div>

        <!-- Ghost Cursor Tool Group -->
        <div class="header-tool-group">
          <button class="icon-btn" id="ghost-btn" title="Toggle Ghost Cursor Pacer" aria-pressed="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C7.58 2 4 5.58 4 10v9.5c0 .48.53.77.92.5l2.08-1.4 2.5 1.7c.32.22.75.22 1.07 0l2.43-1.65 2.43 1.65c.32.22.75.22 1.07 0l2.5-1.7 2.08 1.4c.39.27.92-.02.92-.5V10c0-4.42-3.58-8-8-8zm-3 8c-.83 0-1.5-.67-1.5-1.5S8.17 7 9 7s1.5.67 1.5 1.5S9.83 10 9 10zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 7 15 7s1.5.67 1.5 1.5S15.83 10 15 10z"/>
            </svg>
          </button>

          <!-- Ghost Cursor Speed Slider Pill (Revealed when Ghost is active) -->
          <div class="ghost-slider-pill" id="ghost-slider-pill" style="display: none;" title="Ghost Cursor Pace (WPM)">
            <span class="ghost-label">Ghost:</span>
            <input type="range" id="ghost-slider" class="diff-slider" min="15" max="150" step="5" value="50" aria-label="Ghost Cursor speed slider">
            <span class="ghost-val" id="ghost-val">50 WPM</span>
          </div>
        </div>

        <!-- Sound Button -->
        <button class="icon-btn" id="sound-btn" title="Toggle Mechanical Keyboard Sounds">
          <svg id="sound-icon-on" style="display: none;" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <svg id="sound-icon-off" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <!-- Active Typing Stage Section -->
      <section class="test-section" id="test-section">
        <!-- Floating XP Layer -->
        <div class="xp-toast-layer" id="xp-toast-layer"></div>

        <div class="test-top-bar">
          <!-- Classic Timer Display -->
          <div class="timer-display" id="timer" style="display: none;">30</div>

          <!-- Flow Mode Speedometer & Streak Display -->
          <div class="flow-top-gauge" id="flow-gauge">
            <div class="flow-metrics-left">
              <div class="flow-speed-tag" id="flow-speed-tag">
                <span class="speed-status-dot" id="speed-status-dot"></span>
                <span class="speed-text" id="speed-indicator-text">Target: 40 WPM</span>
              </div>
              <div class="flow-multiplier-badge" id="flow-multiplier-badge">
                <span class="mult-icon">⚡</span>
                <span id="flow-mult-val">1.0x Flow</span>
                <div class="momentum-bar-bg">
                  <div class="momentum-bar-fill" id="momentum-bar-fill"></div>
                </div>
              </div>
            </div>

            <div class="flow-right-cluster">
              <!-- Ambient Last Flow Run Recap Pill (;; Home-Row Shortcut) -->
              <button class="flow-recap-pill" id="flow-recap-pill" style="display: none;" title="Tap ;; on home row or click to inspect last Flow Run">
                <span class="recap-pill-icon">📈</span>
                <span class="recap-pill-text" id="flow-recap-pill-text">Flow: 0 WPM • Peak 0</span>
                <kbd class="key-hint">;;</kbd>
              </button>

              <!-- In-Situ 3-Slot Egg Nest (Zero Modals, Hands-on-Keyboard) -->
              <div class="egg-nest" id="egg-nest" title="Egg Nest (Max 3) • Press Tab to Hatch">
                <div class="nest-slot" id="nest-slot-0" data-slot="0">
                  <span class="slot-dot">·</span>
                  <div class="nest-crack-prompt" id="crack-prompt-0">
                    <span class="p-e">e</span><span class="p-g1">g</span><span class="p-g2">g</span>
                  </div>
                </div>
                <div class="nest-slot" id="nest-slot-1" data-slot="1">
                  <span class="slot-dot">·</span>
                  <div class="nest-crack-prompt" id="crack-prompt-1">
                    <span class="p-e">e</span><span class="p-g1">g</span><span class="p-g2">g</span>
                  </div>
                </div>
                <div class="nest-slot" id="nest-slot-2" data-slot="2">
                  <span class="slot-dot">·</span>
                  <div class="nest-crack-prompt" id="crack-prompt-2">
                    <span class="p-e">e</span><span class="p-g1">g</span><span class="p-g2">g</span>
                  </div>
                </div>
                <span class="nest-hint" id="nest-hint">tab: hatch</span>
                <div class="nest-incubation-track" id="nest-incubation-track" title="Incubation Progress">
                  <div class="nest-incubation-fill" id="nest-incubation-fill"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Stats (Classic) -->
          <div class="live-stats" id="live-stats">
            <span>wpm: <strong id="live-wpm">0</strong></span>
            <span>acc: <strong id="live-acc">100%</strong></span>
          </div>
        </div>

        <div class="words-box" id="words-box" tabindex="0">
          <div class="caret" id="caret"></div>
          <div class="ghost-caret" id="ghost-caret" style="display: none;"></div>
          <div class="words-wrapper" id="words-wrapper">
            <!-- Words dynamically generated by script -->
          </div>

          <div class="focus-overlay" id="focus-overlay">
            <div class="focus-notice">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M13 1.07V3.12C16.96 3.65 20.08 6.77 20.61 10.73H22.66C22.11 5.65 18.08 1.62 13 1.07M13 20.88V22.93C18.08 22.38 22.11 18.35 22.66 13.27H20.61C20.08 17.23 16.96 20.35 13 20.88M3.39 13.27C3.92 17.23 7.04 20.35 11 20.88V22.93C5.92 22.38 1.89 18.35 1.34 13.27H3.39M11 3.12V1.07C5.92 1.62 1.89 5.65 1.34 10.73H3.39C3.92 6.77 7.04 3.65 11 3.12M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6M12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z"/>
              </svg>
              <span>Click or tap here to focus</span>
            </div>
          </div>
        </div>

        <input type="text" id="typing-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">

        <div class="test-bottom-bar">
          <button class="restart-btn" id="restart-btn" title="Restart Session (Tab + Enter)">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span id="restart-btn-label">restart flow</span>
            <span class="key-hint">tab + enter</span>
          </button>
        </div>
      </section>

      <!-- Classic Results & Flow Recap Section -->
      <section class="results-section" id="results-section">
        <div class="results-grid">
          <div class="hero-stats">
            <div class="stat-card hero">
              <span class="stat-label">wpm</span>
              <span class="stat-value" id="res-wpm">0</span>
            </div>
            <div class="stat-card hero acc">
              <span class="stat-label">acc</span>
              <span class="stat-value" id="res-acc">0%</span>
            </div>
          </div>

          <div class="secondary-stats">
            <div class="sub-stat">
              <span class="stat-label">raw wpm</span>
              <span class="stat-value" id="res-raw">0</span>
              <span class="stat-detail">total keystrokes</span>
            </div>
            <div class="sub-stat">
              <span class="stat-label">characters</span>
              <span class="stat-value" id="res-chars">0/0/0/0</span>
              <span class="stat-detail">correct / err / extra / miss</span>
            </div>
            <div class="sub-stat">
              <span class="stat-label">errors fixed</span>
              <span class="stat-value" id="res-fixed">0</span>
              <span class="stat-detail" id="res-fixed-detail">0 corrected</span>
            </div>
            <div class="sub-stat">
              <span class="stat-label">consistency</span>
              <span class="stat-value" id="res-consistency">0%</span>
              <span class="stat-detail">pace variance</span>
            </div>
            <div class="sub-stat">
              <span class="stat-label">test time</span>
              <span class="stat-value" id="res-time">30s</span>
              <span class="stat-detail" id="res-time-detail">standard mode</span>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <div class="chart-header-left">
              <span>WPM Timeline</span>
              <div class="chart-legend">
                <div class="legend-item"><span class="legend-color avg"></span> Avg WPM</div>
                <div class="legend-item"><span class="legend-color pace"></span> Pace (3s)</div>
                <div class="legend-item"><span class="legend-color raw"></span> Raw</div>
                <div class="legend-item"><span class="legend-dot err-fixed"></span> Fixed</div>
                <div class="legend-item"><span class="legend-dot err-unfixed"></span> Unfixed</div>
              </div>
            </div>
            <span class="chart-header-stats" id="chart-hover-stats">Hover or tap points for details</span>
          </div>
          <canvas id="wpm-chart"></canvas>

          <!-- Interactive Hover Tooltip -->
          <div class="chart-tooltip" id="chart-tooltip">
            <div class="tooltip-time" id="tooltip-time">0s</div>
            <div class="tooltip-row"><span class="dot-indicator dot-wpm"></span> Avg Speed: <strong id="tooltip-wpm">0 WPM</strong></div>
            <div class="tooltip-row"><span class="dot-indicator dot-pace"></span> Pace (3s): <strong id="tooltip-pace">0 WPM</strong></div>
            <div class="tooltip-row"><span class="dot-indicator dot-raw"></span> Raw Speed: <strong id="tooltip-raw">0 WPM</strong></div>
            <div class="tooltip-row" id="tooltip-err-row"><span class="dot-indicator dot-fixed"></span> Errors: <strong>0</strong></div>
          </div>
        </div>

        <div class="results-actions">
          <button class="btn-primary" id="next-test-btn">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/>
            </svg>
            <span id="next-test-btn-label">Next Test</span>
            <span class="key-hint" id="next-test-btn-hint" style="background: rgba(0,0,0,0.18); border-color: rgba(0,0,0,0.2); color: #000000;">Tab + Enter</span>
          </button>
        </div>
      </section>



      <!-- Lifetime Stats Modal -->
      <section class="modal-backdrop" id="stats-modal" style="display: none;">
        <div class="modal-card stats-card">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <h2>📊 Lifetime Stats & Mastery</h2>
              <div class="stats-modal-tabs">
                <button class="stats-tab active" id="tab-stats-flow" data-tab="flow">🎮 Flow RPG & Mastery</button>
                <button class="stats-tab" id="tab-stats-classic" data-tab="classic">⏱️ Classic Records</button>
                <button class="stats-tab" id="tab-stats-trophies" data-tab="trophies">🏆 Trophies</button>
                <button class="stats-tab" id="tab-stats-armory" data-tab="armory">🎨 Armory</button>
              </div>
            </div>
            <button class="icon-btn close-modal-btn" id="close-stats-btn" title="Close Stats">✕</button>
          </div>

          <!-- Flow RPG & Keybr Mastery Pane -->
          <div class="stats-pane" id="pane-stats-flow">
            <!-- RPG Overview Cards -->
            <div class="rpg-overview-grid">
              <div class="rpg-hero-card">
                <div class="rpg-hero-top">
                  <span class="rpg-level-chip" id="stats-rpg-level">Lv. 1</span>
                  <span class="rpg-title-text" id="stats-rpg-title">Novice Typist</span>
                </div>
                <div class="rpg-xp-info">
                  <span class="rpg-xp-label">XP Progress</span>
                  <span class="rpg-xp-numbers" id="stats-rpg-xp">0 / 100 XP</span>
                </div>
                <div class="rpg-bar-track">
                  <div class="rpg-bar-fill" id="stats-rpg-xp-bar"></div>
                </div>
              </div>

              <div class="rpg-metrics-column">
                <div class="rpg-sub-stat">
                  <span class="rpg-sub-label">Unlocked Vocabulary</span>
                  <span class="rpg-sub-val" id="stats-rpg-words-count">1 / 1,000</span>
                </div>
                <div class="rpg-sub-stat">
                  <span class="rpg-sub-label">Eggs Hatched</span>
                  <span class="rpg-sub-val" id="stats-rpg-eggs-count">0</span>
                </div>
                <div class="rpg-sub-stat">
                  <span class="rpg-sub-label">Best Flow Streak</span>
                  <span class="rpg-sub-val" id="stats-rpg-high-streak">0 words</span>
                </div>
              </div>
            </div>

            <!-- Recent Flow Runs History Table -->
            <div class="history-table-wrap" style="margin-bottom: 18px;">
              <div class="history-table-title">⚡ Recent Flow Runs <span style="font-weight: 400; font-size: 11px; color: var(--sub-color); margin-left: 6px;">(Click a row to inspect timeline graph • Tap <kbd class="key-hint">;;</kbd> anytime in Flow Mode)</span></div>
              <table class="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Avg WPM</th>
                    <th>Peak Pace</th>
                    <th>Acc</th>
                    <th>Deck Size</th>
                  </tr>
                </thead>
                <tbody id="flow-history-tbody">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>

            <!-- Keybr Motor Mastery Matrix -->
            <div class="motor-mastery-section">
              <div class="section-heading-wrap">
                <div class="section-title">🧠 Neuromuscular Motor Patterns</div>
                <div class="section-subtitle">Physical finger mechanics & proficiency tracking across your deck</div>
              </div>
              <div class="motor-grid" id="motor-grid">
                <!-- Dynamically populated 5 motor cards -->
              </div>
            </div>

            <!-- Active Deck Explorer Section -->
            <div class="deck-explorer-section">
              <div class="deck-explorer-header">
                <div>
                  <span class="section-title">Active Deck Words (<span id="deck-unlocked-count">1</span>)</span>
                  <div class="section-subtitle">Spaced repetition memory and burst speeds</div>
                </div>
                <div class="deck-filters" id="deck-filters">
                  <button class="deck-filter-btn active" data-filter="all">All</button>
                  <button class="deck-filter-btn" data-filter="HOME_CORE">Home Core</button>
                  <button class="deck-filter-btn" data-filter="ALTERNATING">Alternator</button>
                  <button class="deck-filter-btn" data-filter="SUFFIX_CURL">Suffixes</button>
                  <button class="deck-filter-btn" data-filter="REACH_PINKY">Reaches</button>
                  <button class="deck-filter-btn" data-filter="DOUBLE_BOUNCE">Bounces</button>
                </div>
              </div>
              <div class="deck-words-scroll" id="deck-words-scroll">
                <!-- Dynamically populated word chips -->
              </div>
            </div>
          </div>

          <!-- Classic Records Pane -->
          <div class="stats-pane" id="pane-stats-classic" style="display: none;">
            <div class="stats-pbs-grid">
              <div class="pb-card">
                <span class="pb-label">15s Record</span>
                <span class="pb-val" id="pb-15s">0 WPM</span>
                <span class="pb-date" id="pb-15s-date">--</span>
              </div>
              <div class="pb-card highlight">
                <span class="pb-label">30s Record</span>
                <span class="pb-val" id="pb-30s">0 WPM</span>
                <span class="pb-date" id="pb-30s-date">--</span>
              </div>
              <div class="pb-card">
                <span class="pb-label">60s Record</span>
                <span class="pb-val" id="pb-60s">0 WPM</span>
                <span class="pb-date" id="pb-60s-date">--</span>
              </div>
            </div>

            <div class="secondary-stats" style="margin-top: 16px;">
              <div class="sub-stat">
                <span class="stat-label">total tests</span>
                <span class="stat-value" id="stats-total-tests">0</span>
              </div>
              <div class="sub-stat">
                <span class="stat-label">total words</span>
                <span class="stat-value" id="stats-total-words">0</span>
              </div>
              <div class="sub-stat">
                <span class="stat-label">keystrokes</span>
                <span class="stat-value" id="stats-total-keys">0</span>
              </div>
              <div class="sub-stat">
                <span class="stat-label">time typing</span>
                <span class="stat-value" id="stats-total-time">0m</span>
              </div>
            </div>

            <div class="history-table-wrap">
              <div class="history-table-title">Recent Tests</div>
              <table class="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mode</th>
                    <th>WPM</th>
                    <th>Raw</th>
                    <th>Acc</th>
                  </tr>
                </thead>
                <tbody id="stats-history-tbody">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Trophies & Achievements Pane -->
          <div class="stats-pane" id="pane-stats-trophies" style="display: none;">
            <div class="trophy-summary-bar">
              <div class="trophy-summary-left">
                <span class="trophy-summary-title">Trophy Case</span>
                <span class="trophy-summary-count" id="trophies-count">0 / 35 unlocked (0%)</span>
              </div>
              <div class="trophy-summary-track">
                <div class="trophy-summary-fill" id="trophies-progress-bar" style="width: 0%;"></div>
              </div>
            </div>

            <div class="trophy-filters" id="trophy-filters">
              <button class="trophy-filter-btn active" data-filter="all">All</button>
              <button class="trophy-filter-btn" data-filter="speed">Speed</button>
              <button class="trophy-filter-btn" data-filter="flow">Flow</button>
              <button class="trophy-filter-btn" data-filter="precision">Precision</button>
              <button class="trophy-filter-btn" data-filter="hidden">Hidden</button>
              <button class="trophy-filter-btn" data-filter="ghost">Ghost</button>
              <button class="trophy-filter-btn" data-filter="rpg">RPG & Deck</button>
              <button class="trophy-filter-btn" data-filter="feats">Feats</button>
            </div>

            <div class="trophies-grid" id="trophies-grid">
              <!-- Dynamically populated trophy cards -->
            </div>
          </div>

          <!-- Cosmetic Armory Pane -->
          <div class="stats-pane" id="pane-stats-armory" style="display: none;">
            <div class="trophy-summary-bar">
              <div class="trophy-summary-left">
                <span class="trophy-summary-title">Cosmetic Armory</span>
                <span class="trophy-summary-count" id="armory-count">6 / 34 unlocked (18%)</span>
              </div>
              <div class="trophy-summary-track">
                <div class="trophy-summary-fill" id="armory-progress-bar" style="width: 18%;"></div>
              </div>
            </div>

            <div class="trophy-filters armory-filters" id="armory-filters">
              <button class="trophy-filter-btn armory-filter-btn active" data-filter="all">All</button>
              <button class="trophy-filter-btn armory-filter-btn" data-filter="theme">🎨 Themes</button>
              <button class="trophy-filter-btn armory-filter-btn" data-filter="flowFx">🌌 Flow FX</button>
              <button class="trophy-filter-btn armory-filter-btn" data-filter="caret">│ Caret Shapes</button>
              <button class="trophy-filter-btn armory-filter-btn" data-filter="caretFx">✨ Caret FX</button>
              <button class="trophy-filter-btn armory-filter-btn" data-filter="ghostStyle">👻 Ghost Pacer</button>
              <button class="trophy-filter-btn armory-filter-btn" data-filter="sound">🔊 Sounds</button>
            </div>

            <div class="armory-scroll-container">
              <div class="armory-section" data-armory-section="theme">
                <div class="armory-section-title">🎨 OLED Stage Themes</div>
                <div class="armory-grid" id="armory-themes-grid"></div>
              </div>

              <div class="armory-section" data-armory-section="flowFx">
                <div class="armory-section-title">🌌 Flow State Atmospheres (Flow FX)</div>
                <div class="armory-grid" id="armory-flowfx-grid"></div>
              </div>

              <div class="armory-section" data-armory-section="caret">
                <div class="armory-section-title">│ Caret Geometries</div>
                <div class="armory-grid" id="armory-carets-grid"></div>
              </div>

              <div class="armory-section" data-armory-section="caretFx">
                <div class="armory-section-title">✨ Flow Caret Modifiers (Independent)</div>
                <div class="armory-grid" id="armory-caretfx-grid"></div>
              </div>

              <div class="armory-section" data-armory-section="ghostStyle">
                <div class="armory-section-title">👻 Ghost Cursor Pacer Styles</div>
                <div class="armory-grid" id="armory-ghost-grid"></div>
              </div>

              <div class="armory-section" data-armory-section="sound">
                <div class="armory-section-title">🔊 Mechanical Switch Sound Packs</div>
                <div class="armory-grid" id="armory-sounds-grid"></div>
              </div>
            </div>
          </div>

          <div class="modal-footer space-between" style="margin-top: 18px;">
            <div style="display: flex; gap: 10px; align-items: center;">
              <button class="btn-danger-outline" id="reset-rpg-stats-btn" title="Reset Flow RPG progress back to Level 1, 0 XP, and 1 Word">Reset RPG (Ground Zero) ↺</button>
              <button class="btn-secondary" id="reset-classic-stats-btn" style="font-size: 12px; padding: 7px 14px;" title="Reset Classic Mode Personal Bests & Records">Clear Records</button>
            </div>
            <button class="btn-secondary" id="close-stats-footer-btn">Close</button>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer>
      <div class="footer-left">
        <span><span class="shortcut-badge">tab</span> + <span class="shortcut-badge">enter</span> - restart</span>
        <span><span class="shortcut-badge">esc</span> - pause / hatchery</span>
      </div>
      <div class="footer-right">
        <span>TypeFlow v4.0 • Flow RPG Edition</span>
      </div>
    </footer>
  </div>

  <script>
{bundled_js}
  </script>
</body>
</html>
"""

    # Strip HTML comments and collapse empty lines
    cleaned_html = re.sub(r"<!--.*?-->", "", html_template, flags=re.DOTALL)
    cleaned_html_lines = [l for l in cleaned_html.splitlines() if l.strip()]
    final_output = "\n".join(cleaned_html_lines) + "\n"

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(final_output)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"[TypeFlow] Build complete! index.html generated ({size_kb:.1f} KB).")

if __name__ == "__main__":
    build()
