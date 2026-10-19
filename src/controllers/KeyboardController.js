/**
 * TypeFlow - KeyboardController
 * Input controller for physical keyboard (keydown) and mobile/virtual IME (beforeinput).
 * Normalizes chords (Tab + Enter), modal escapes, space submissions, and hatch typing.
 */

class KeyboardController {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.lastTabPressTime = 0;
    this.lastKeyHandled = false;

    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundBeforeInput = this.handleBeforeInput.bind(this);
    this.typingInput = null;
    this.diffInput = null;
  }

  attach(windowObj = (typeof window !== 'undefined' ? window : null), typingInputEl = null, diffInputEl = null) {
    if (windowObj) {
      windowObj.addEventListener('keydown', this._boundKeyDown);
    }
    this.typingInput = typingInputEl;
    this.diffInput = diffInputEl;

    if (this.typingInput) {
      this.typingInput.addEventListener('beforeinput', this._boundBeforeInput);
    }
  }

  detach(windowObj = (typeof window !== 'undefined' ? window : null)) {
    if (windowObj) {
      windowObj.removeEventListener('keydown', this._boundKeyDown);
    }
    if (this.typingInput) {
      this.typingInput.removeEventListener('beforeinput', this._boundBeforeInput);
    }
  }

  handleKeyDown(e) {
    const isStatsOpen = this.handlers.isStatsOpen ? this.handlers.isStatsOpen() : false;
    if (isStatsOpen) {
      if (e.key === 'Escape') {
        if (this.handlers.onEscape) this.handlers.onEscape();
      }
      return;
    }

    // Isolate difficulty input so typing numbers, space, or backspace doesn't trigger board actions
    if (this.diffInput && (typeof document !== 'undefined' && document.activeElement === this.diffInput)) {
      return;
    }

    const isHatching = this.handlers.isHatching ? this.handlers.isHatching() : false;
    const isTestFinished = this.handlers.isTestFinished ? this.handlers.isTestFinished() : false;

    // 1. Tab Navigation / Chord Handling
    if (e.key === 'Tab') {
      e.preventDefault();
      this.lastTabPressTime = Date.now();

      if (this.handlers.onTab) {
        this.handlers.onTab();
      }
      return;
    }

    // 2. Tab + Enter Restart Chord
    if (e.key === 'Enter') {
      if (Date.now() - this.lastTabPressTime < 1500) {
        e.preventDefault();
        if (this.handlers.onRestartChord) {
          this.handlers.onRestartChord();
        }
        return;
      }
    }

    // 3. Escape key (exit hatch, close modals, or reset)
    if (e.key === 'Escape') {
      e.preventDefault();
      if (this.handlers.onEscape) {
        this.handlers.onEscape();
      }
      return;
    }

    // 4. In-Situ Hatching Mode input
    if (isHatching) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (this.handlers.onHatchBackspace) {
          this.handlers.onHatchBackspace();
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (this.handlers.onHatchChar) {
          this.handlers.onHatchChar(e.key);
        }
        return;
      }
      return;
    }

    // 5. Test Finished Screen controls
    if (isTestFinished) {
      if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
        e.preventDefault();
        return; // Prevent accidental spacebar restart
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (this.handlers.onEnterFinished) {
          this.handlers.onEnterFinished();
        }
      }
      return;
    }

    // 6. Normal Typing: Space key
    if (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
      e.preventDefault();
      this.lastKeyHandled = true;
      if (this.handlers.onSpace) {
        this.handlers.onSpace();
      }
      return;
    }

    // 7. Normal Typing: Backspace key
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.lastKeyHandled = true;
      if (this.handlers.onBackspace) {
        this.handlers.onBackspace();
      }
      return;
    }

    // 8. Normal Typing: Single character key
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      this.lastKeyHandled = true;
      if (this.handlers.onChar) {
        this.handlers.onChar(e.key);
      }
      return;
    }
  }

  handleBeforeInput(e) {
    const isStatsOpen = this.handlers.isStatsOpen ? this.handlers.isStatsOpen() : false;
    const isHatching = this.handlers.isHatching ? this.handlers.isHatching() : false;
    const isTestFinished = this.handlers.isTestFinished ? this.handlers.isTestFinished() : false;

    if (isTestFinished || isHatching || isStatsOpen) return;
    if (this.lastKeyHandled) {
      this.lastKeyHandled = false;
      return;
    }

    if (e.inputType === 'deleteContentBackward') {
      e.preventDefault();
      if (this.handlers.onBackspace) this.handlers.onBackspace();
    } else if (e.inputType === 'insertText' && e.data) {
      e.preventDefault();
      for (let i = 0; i < e.data.length; i++) {
        const ch = e.data[i];
        if (ch === ' ') {
          if (this.handlers.onSpace) this.handlers.onSpace();
        } else {
          if (this.handlers.onChar) this.handlers.onChar(ch);
        }
      }
    }

    if (this.typingInput) {
      this.typingInput.value = '';
    }
  }
}

if (typeof window !== 'undefined') {
  window.KeyboardController = KeyboardController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeyboardController };
}
