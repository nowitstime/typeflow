/**
 * TypeFlow - StageView
 * Passive View for the main typing stage: word streams, character spans,
 * subpixel caret tracking, line scrolling, and focus overlay.
 * Zero business logic.
 */

class StageView {
  constructor(elements = {}) {
    this.wordsBox = elements.wordsBox || (typeof document !== 'undefined' ? document.getElementById('words-box') : null);
    this.wordsWrapper = elements.wordsWrapper || (typeof document !== 'undefined' ? document.getElementById('words-wrapper') : null);
    this.caret = elements.caret || (typeof document !== 'undefined' ? document.getElementById('caret') : null);
    this.ghostCaret = elements.ghostCaret || (typeof document !== 'undefined' ? document.getElementById('ghost-caret') : null);
    this.focusOverlay = elements.focusOverlay || (typeof document !== 'undefined' ? document.getElementById('focus-overlay') : null);
    this.typingInput = elements.typingInput || (typeof document !== 'undefined' ? document.getElementById('typing-input') : null);

    this.scrollOffset = 0;
    this.wordElements = [];
    this.hiddenMode = false;
    this.hiddenMethod = 'char';
    this.hiddenWordDistance = 2;
  }

  /**
   * Binds stage interaction events (words box & focus overlay clicks).
   * @param {Object} handlers - Event handlers { onClick }
   */
  bindEvents(handlers = {}) {
    const handleBoxClick = () => {
      if (typeof handlers.onClick === 'function') {
        handlers.onClick();
      }
      this.focusInput();
    };

    if (this.wordsBox) {
      this.wordsBox.addEventListener('click', handleBoxClick);
    }
    if (this.focusOverlay) {
      this.focusOverlay.addEventListener('click', handleBoxClick);
    }
  }

  static getBlindfoldMask(combo) {
    if (typeof SessionModel !== 'undefined' && SessionModel.getBlindfoldMask) {
      return SessionModel.getBlindfoldMask(combo);
    }
    const c = Math.max(0, combo || 0);
    if (c <= 26) {
      return c * 0.25;
    }
    return 6.5 + 0.75 * Math.sqrt(c - 26);
  }

  static getHiddenOpacity(k, combo) {
    if (typeof SessionModel !== 'undefined' && SessionModel.getHiddenOpacity) {
      return SessionModel.getHiddenOpacity(k, combo);
    }
    if (k < 0) return 0.0;
    const M = StageView.getBlindfoldMask(combo);
    const penetration = M - k;
    const rawOpacity = Math.max(0.0, Math.min(1.0, 1.0 - penetration));
    const scaled = rawOpacity * 4;
    return (scaled <= 1e-9) ? 0.0 : Math.ceil(scaled - 1e-9) / 4;
  }

  static calculateOpacity(d, fadeDepth = 6, zeroDist = 2) {
    if (zeroDist <= 0) return 1;
    if (d <= zeroDist) return 0;
    if (d >= fadeDepth) return 1;
    const span = Math.max(0.1, fadeDepth - zeroDist);
    const alpha = Math.min(1.0, Math.max(0.0, (d - zeroDist) / span));
    return parseFloat(alpha.toFixed(2));
  }

  _getDoc() {
    return this.wordsWrapper ? this.wordsWrapper.ownerDocument : (typeof document !== 'undefined' ? document : null);
  }

  /**
   * Clears and renders a fresh stream of words into the stage DOM.
   */
  renderWords(wordsList) {
    if (!this.wordsWrapper) return;
    const doc = this._getDoc();
    if (!doc) return;

    this.wordsWrapper.innerHTML = '';
    this.wordElements = [];

    const fragment = (doc && typeof doc.createDocumentFragment === 'function')
      ? doc.createDocumentFragment()
      : null;
    const container = fragment || this.wordsWrapper;

    for (let wIdx = 0; wIdx < wordsList.length; wIdx++) {
      const word = wordsList[wIdx];
      const wordEl = doc.createElement('div');
      wordEl.className = 'word' + (wIdx === 0 ? ' active' : '');
      wordEl.dataset.word = word;

      for (let i = 0; i < word.length; i++) {
        const letterEl = doc.createElement('span');
        letterEl.className = 'letter';
        letterEl.textContent = word[i];
        wordEl.appendChild(letterEl);
      }
      container.appendChild(wordEl);
      this.wordElements.push(wordEl);
    }

    if (fragment) {
      this.wordsWrapper.appendChild(fragment);
    }

    this.scrollOffset = 0;
    this.wordsWrapper.style.transform = 'translateY(0px)';
    if (this.wordsBox) {
      this.wordsBox.classList.toggle('hidden-mode', this.hiddenMode);
    }
  }

  /**
   * Dynamically appends additional words as player nears the end of the batch.
   */
  appendWords(moreWords) {
    if (!this.wordsWrapper || !Array.isArray(moreWords)) return;
    const doc = this._getDoc();
    if (!doc) return;

    const fragment = (doc && typeof doc.createDocumentFragment === 'function')
      ? doc.createDocumentFragment()
      : null;
    const container = fragment || this.wordsWrapper;

    for (let i = 0; i < moreWords.length; i++) {
      const word = moreWords[i];
      const wordEl = doc.createElement('div');
      wordEl.className = 'word';
      wordEl.dataset.word = word;

      for (let j = 0; j < word.length; j++) {
        const letterEl = doc.createElement('span');
        letterEl.className = 'letter';
        letterEl.textContent = word[j];
        wordEl.appendChild(letterEl);
      }
      container.appendChild(wordEl);
      this.wordElements.push(wordEl);
    }

    if (fragment) {
      this.wordsWrapper.appendChild(fragment);
    }
  }

  /**
   * Inserts words dynamically at a specific index in the stage.
   */
  insertWordsAt(insertIdx, wordsToInsert) {
    if (!this.wordsWrapper || !Array.isArray(wordsToInsert) || wordsToInsert.length === 0) return;
    const doc = this._getDoc();
    if (!doc) return;

    const idx = Math.max(0, Math.min(this.wordElements.length, insertIdx));
    const refNode = this.wordElements[idx] || null;

    const newEls = [];
    for (let i = 0; i < wordsToInsert.length; i++) {
      const word = wordsToInsert[i];
      const wordEl = doc.createElement('div');
      wordEl.className = 'word';
      wordEl.dataset.word = word;

      for (let j = 0; j < word.length; j++) {
        const letterEl = doc.createElement('span');
        letterEl.className = 'letter';
        letterEl.textContent = word[j];
        wordEl.appendChild(letterEl);
      }
      this.wordsWrapper.insertBefore(wordEl, refNode);
      newEls.push(wordEl);
    }
    this.wordElements.splice(idx, 0, ...newEls);
  }

  /**
   * Updates state styling of an individual letter span (correct, incorrect, extra).
   */
  updateLetter(wordIdx, charIdx, isCorrect, isExtra = false, typedChar = '') {
    const wordEl = this.wordElements[wordIdx];
    if (!wordEl) return;
    const doc = this._getDoc();

    if (isExtra && doc) {
      const extraSpan = doc.createElement('span');
      extraSpan.className = 'letter extra incorrect';
      extraSpan.textContent = typedChar;
      wordEl.appendChild(extraSpan);
    } else {
      const letters = wordEl.querySelectorAll('.letter:not(.extra)');
      if (charIdx < letters.length) {
        const letter = letters[charIdx];
        letter.classList.remove('correct', 'incorrect');
        letter.classList.add(isCorrect ? 'correct' : 'incorrect');
      }
    }
    this.checkWordErrorState(wordEl);
  }

  /**
   * Removes character or extra letter on backspace.
   * Returns { fixedError: boolean } indicating if an incorrect letter or extra character was removed.
   */
  backspaceLetter(wordIdx, charIdx) {
    const wordEl = this.wordElements[wordIdx];
    if (!wordEl) return { fixedError: false, isExtra: false };

    let fixedError = false;
    let isExtra = false;
    const extras = wordEl.querySelectorAll('.letter.extra');
    if (extras.length > 0) {
      extras[extras.length - 1].remove();
      fixedError = true;
      isExtra = true;
    } else {
      const letters = wordEl.querySelectorAll('.letter');
      if (charIdx >= 0 && charIdx < letters.length) {
        letters[charIdx].classList.remove('correct', 'incorrect');
      }
    }
    this.checkWordErrorState(wordEl);
    return { fixedError, isExtra };
  }

  /**
   * Finalizes the current word element and activates the next word element.
   */
  advanceWord(prevWordIdx, nextWordIdx, hasErrors) {
    const prevEl = this.wordElements[prevWordIdx];
    if (prevEl) {
      prevEl.classList.remove('active');
      if (hasErrors) {
        prevEl.classList.add('error');
      } else {
        prevEl.classList.remove('error');
      }
      if (this.hiddenMode) {
        prevEl.classList.remove('hd-word-vanished');
        const letters = prevEl.querySelectorAll('.letter');
        for (let i = 0; i < letters.length; i++) {
          letters[i].classList.add('hd-past');
          letters[i].style.opacity = '0';
        }
      }
    }

    const nextEl = this.wordElements[nextWordIdx];
    if (nextEl) {
      nextEl.classList.add('active');
    }
  }

  /**
   * Reverts back from current word element to previous word element.
   */
  revertWord(currentWordIdx, prevWordIdx) {
    const currentEl = this.wordElements[currentWordIdx];
    if (currentEl) {
      currentEl.classList.remove('active');
      if (this.hiddenMode) {
        currentEl.classList.remove('hd-word-vanished');
        const letters = currentEl.querySelectorAll('.letter');
        for (let i = 0; i < letters.length; i++) {
          letters[i].classList.remove('hd-past');
          letters[i].style.opacity = '';
        }
      }
    }

    const prevEl = this.wordElements[prevWordIdx];
    if (prevEl) {
      prevEl.classList.add('active');
      this.checkWordErrorState(prevEl);
      if (this.hiddenMode) {
        const letters = prevEl.querySelectorAll('.letter');
        for (let i = 0; i < letters.length; i++) {
          letters[i].classList.remove('hd-past');
          letters[i].style.opacity = '';
        }
      }
    }
  }

  /**
   * Checks if word element has any error spans and toggles the red underline.
   */
  checkWordErrorState(wordEl) {
    if (!wordEl) return;
    const hasIncorrect = wordEl.querySelector('.incorrect, .extra');
    if (hasIncorrect) {
      wordEl.classList.add('error');
    } else {
      wordEl.classList.remove('error');
    }
  }

  /**
   * Vertical auto-scroll so active line stays centered at visual Line 2.
   */
  checkLineScroll(activeWordEl) {
    if (!this.wordsWrapper || !activeWordEl) return;
    const firstWord = this.wordsWrapper.firstElementChild;
    if (!firstWord) return;

    const baseTop = firstWord.offsetTop;
    const currentWordTop = activeWordEl.offsetTop;

    let line2Word = null;
    if (this.wordElements) {
      const searchLimit = Math.min(this.wordElements.length, 40);
      for (let i = 0; i < searchLimit; i++) {
        if (this.wordElements[i].offsetTop > baseTop + 10) {
          line2Word = this.wordElements[i];
          break;
        }
      }
    }
    const lineHeight = line2Word ? (line2Word.offsetTop - baseTop) : (activeWordEl.offsetHeight || 42);

    let newScrollOffset = 0;
    if (currentWordTop > baseTop + lineHeight * 1.2) {
      newScrollOffset = currentWordTop - (baseTop + lineHeight);
    } else {
      newScrollOffset = 0;
    }

    if (newScrollOffset !== this.scrollOffset) {
      this.scrollOffset = newScrollOffset;
      this.wordsWrapper.style.transform = `translateY(-${this.scrollOffset}px)`;
    }
  }

  /**
   * Computes subpixel cursor coordinates for a given word and character position.
   */
  getCursorCoordinates(wordIdx, charIdx) {
    if (!this.wordElements || this.wordElements.length === 0) {
      return { left: 0, top: 5, visualTop: 5, valid: false };
    }
    const safeWordIdx = Math.max(0, Math.min(this.wordElements.length - 1, wordIdx));
    const wordEl = this.wordElements[safeWordIdx];
    if (!wordEl) {
      return { left: 0, top: 5, visualTop: 5, valid: false };
    }

    const wordTop = wordEl.offsetTop;
    const visualTop = wordTop - this.scrollOffset;
    const targetTop = visualTop + 5;

    const letterElements = wordEl.querySelectorAll('.letter');
    const boxRect = this.wordsBox ? this.wordsBox.getBoundingClientRect() : { left: 0, width: 0 };
    let targetLeft = 0;

    if (charIdx < letterElements.length) {
      const activeLetter = letterElements[charIdx];
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
        targetLeft = wordEl.offsetLeft;
      }
    }

    return {
      left: targetLeft,
      top: targetTop,
      visualTop,
      valid: true
    };
  }

  /**
   * Subpixel horizontal caret tracking and synchronous vertical lock.
   */
  updateCaret(currentWordIdx, currentCharIdx) {
    if (!this.caret || !this.wordsWrapper) return;
    const currentWordEl = this.wordElements[currentWordIdx];
    if (!currentWordEl) return;

    this.checkLineScroll(currentWordEl);

    const coords = this.getCursorCoordinates(currentWordIdx, currentCharIdx);
    if (coords.valid) {
      this.caret.style.transform = `translate(${coords.left}px, ${coords.top}px)`;
    }
  }

  /**
   * Updates Ghost Caret (Pace Rabbit) position with optional fractional interpolation.
   */
  updateGhostCaret(wordIdx, charIdx, fraction = 0) {
    if (!this.ghostCaret) return null;
    const coordsA = this.getCursorCoordinates(wordIdx, charIdx);
    if (!coordsA.valid) return null;

    let targetLeft = coordsA.left;
    let targetTop = coordsA.top;
    const visualTop = coordsA.visualTop;

    if (fraction > 0) {
      const wordEl = this.wordElements[wordIdx];
      const letters = wordEl ? wordEl.querySelectorAll('.letter') : [];
      let nextWordIdx = wordIdx;
      let nextCharIdx = charIdx + 1;
      if (nextCharIdx > letters.length) {
        nextWordIdx = wordIdx + 1;
        nextCharIdx = 0;
      }
      if (nextWordIdx < this.wordElements.length) {
        const coordsB = this.getCursorCoordinates(nextWordIdx, nextCharIdx);
        // Only interpolate horizontally if both characters are on the exact same line
        if (coordsB.top === coordsA.top) {
          targetLeft = coordsA.left + (coordsB.left - coordsA.left) * fraction;
        }
      }
    }

    this.ghostCaret.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;

    const boxHeight = this.wordsBox ? (this.wordsBox.offsetHeight || 140) : 140;
    const isOutOfBounds = (visualTop > boxHeight - 15) || (wordIdx >= this.wordElements.length - 1 && charIdx >= 999);

    return {
      left: targetLeft,
      top: targetTop,
      visualTop,
      isOutOfBounds
    };
  }

  /**
   * Toggles visibility of ghost caret.
   */
  setGhostVisible(visible) {
    if (!this.ghostCaret) return;
    if (visible) {
      this.ghostCaret.style.display = 'block';
      this.ghostCaret.classList.remove('fading');
      this.ghostCaret.classList.add('visible');
    } else {
      this.ghostCaret.classList.remove('visible', 'fading');
      this.ghostCaret.style.display = 'none';
    }
  }

  /**
   * Starts smooth fade out transition after 0.6s pause.
   */
  setGhostFading(isFading) {
    if (!this.ghostCaret) return;
    this.ghostCaret.classList.toggle('fading', !!isFading);
    if (isFading) {
      this.ghostCaret.classList.remove('visible');
    }
  }

  /**
   * Snaps ghost caret position directly to player's active caret position.
   */
  syncGhostToCaret(wordIdx, currentCharIdx) {
    if (!this.ghostCaret) return;
    const coords = this.getCursorCoordinates(wordIdx, currentCharIdx);
    if (coords.valid) {
      this.ghostCaret.style.transform = `translate(${coords.left}px, ${coords.top}px)`;
    }
  }

  setCaretRainbow(isApex) {
    if (!this.caret) return;
    this.caret.classList.toggle('caret-rainbow', isApex);
  }

  setPacePaused(isPaused) {
    if (!this.wordsBox) return;
    this.wordsBox.classList.toggle('pace-paused', isPaused);
  }

  setFocusOverlay(visible) {
    if (!this.focusOverlay) return;
    this.focusOverlay.classList.toggle('visible', visible);
  }

  focusInput() {
    if (!this.typingInput) return;
    this.setFocusOverlay(false);
    this.typingInput.value = '';
    try {
      this.typingInput.focus();
    } catch (e) {}
  }

  blurInput() {
    if (!this.typingInput) return;
    try {
      this.typingInput.blur();
    } catch (e) {}
  }

  setHiddenMode(enabled) {
    this.hiddenMode = !!enabled;
    if (this.wordsBox) {
      this.wordsBox.classList.toggle('hidden-mode', this.hiddenMode);
    }
    if (!this.hiddenMode) {
      this._clearHiddenStyling();
      for (let i = 0; i < this.wordElements.length; i++) {
        const wEl = this.wordElements[i];
        if (wEl) {
          const letters = wEl.querySelectorAll('.letter');
          for (let j = 0; j < letters.length; j++) {
            letters[j].classList.remove('hd-past');
          }
        }
      }
    }
  }

  setHiddenMethod(method) {
    this.hiddenMethod = (method === 'word') ? 'word' : 'char';
    this._clearHiddenStyling();
  }

  setHiddenWordDistance(dist) {
    const d = parseInt(dist, 10);
    this.hiddenWordDistance = (d >= 1 && d <= 6) ? d : 2;
  }

  _clearHiddenStyling() {
    if (!this.wordElements) return;
    for (let i = 0; i < this.wordElements.length; i++) {
      const wEl = this.wordElements[i];
      if (wEl) {
        wEl.classList.remove('hd-word-vanished');
        const letters = wEl.querySelectorAll('.letter');
        for (let j = 0; j < letters.length; j++) {
          letters[j].style.opacity = '';
        }
      }
    }
  }

  /**
   * Updates character-by-character fade horizon based on cursor position and combo streak.
   * Uses mathematical blindfold distance M(combo) and quantized getHiddenOpacity(k, combo).
   * @param {number} currentWordIdx - Index of active word
   * @param {number} currentCharIdx - Index of caret within active word
   * @param {number} combo - Consecutive correct keystroke streak (or legacy fadeDepth)
   * @param {boolean} hasError - Safety brake: if true, immediately restores visibility
   * @param {number|null} zeroDist - Optional legacy parameter
   * @param {number|Object} streakOrOptions - Consecutive clean word streak or config object
   */
  updateHiddenHorizon(currentWordIdx, currentCharIdx, combo = 0, hasError = false, zeroDist = null, streakOrOptions = 0) {
    if (!this.hiddenMode || !this.wordElements || this.wordElements.length === 0) return;
    const activeWordEl = this.wordElements[currentWordIdx];
    if (!activeWordEl) return;

    // Safety brake: if error exists, immediately restore visibility of all letters in active word & upcoming words
    if (hasError) {
      activeWordEl.classList.remove('hd-word-vanished');
      const activeLetters = activeWordEl.querySelectorAll('.letter');
      for (let i = 0; i < activeLetters.length; i++) {
        activeLetters[i].style.opacity = '';
        activeLetters[i].classList.remove('hd-past');
      }
      for (let w = 1; w <= 12; w++) {
        const nextWordEl = this.wordElements[currentWordIdx + w];
        if (!nextWordEl) break;
        nextWordEl.classList.remove('hd-word-vanished');
        const letters = nextWordEl.querySelectorAll('.letter');
        for (let j = 0; j < letters.length; j++) {
          letters[j].style.opacity = '';
          letters[j].classList.remove('hd-past');
        }
      }
      return;
    }

    let method = this.hiddenMethod;
    let wordDistance = this.hiddenWordDistance;
    let streak = 0;

    if (typeof streakOrOptions === 'object' && streakOrOptions !== null) {
      if (streakOrOptions.method) method = streakOrOptions.method;
      if (streakOrOptions.wordDistance) wordDistance = streakOrOptions.wordDistance;
      if (typeof streakOrOptions.streak === 'number') streak = streakOrOptions.streak;
    } else if (typeof streakOrOptions === 'number') {
      streak = streakOrOptions;
    }

    // Word Vanish Mode
    if (method === 'word') {
      let effectiveCount = 0;
      if (typeof SessionModel !== 'undefined' && SessionModel.calculateWordVanishEffectiveCount) {
        effectiveCount = SessionModel.calculateWordVanishEffectiveCount(streak, wordDistance);
      } else {
        const maxWords = Math.max(1, Math.min(6, wordDistance || 2));
        effectiveCount = streak <= 0 ? 0 : Math.min(maxWords, streak);
      }

      // Process active word
      if (effectiveCount >= 1) {
        activeWordEl.classList.add('hd-word-vanished');
      } else {
        activeWordEl.classList.remove('hd-word-vanished');
      }
      const activeLetters = activeWordEl.querySelectorAll('.letter');
      for (let i = 0; i < activeLetters.length; i++) {
        activeLetters[i].style.opacity = '';
        if (i < currentCharIdx) {
          activeLetters[i].classList.add('hd-past');
        } else {
          activeLetters[i].classList.remove('hd-past');
        }
      }

      // Process upcoming words
      for (let w = 1; w <= 12; w++) {
        const wordEl = this.wordElements[currentWordIdx + w];
        if (!wordEl) break;
        if (w < effectiveCount) {
          wordEl.classList.add('hd-word-vanished');
        } else {
          wordEl.classList.remove('hd-word-vanished');
        }
        const letters = wordEl.querySelectorAll('.letter');
        for (let j = 0; j < letters.length; j++) {
          letters[j].style.opacity = '';
          letters[j].classList.remove('hd-past');
        }
      }
      return;
    }

    activeWordEl.classList.remove('hd-word-vanished');

    // Support legacy 5-argument callers if zeroDist is explicitly provided
    if (zeroDist !== null && typeof zeroDist === 'number') {
      const actualZeroDist = zeroDist;
      const N = Math.max(actualZeroDist + 0.1, combo || 6);
      const activeLetters = activeWordEl.querySelectorAll('.letter');
      const wordLen = activeLetters.length;

      for (let i = 0; i < wordLen; i++) {
        const letter = activeLetters[i];
        if (i < currentCharIdx) {
          letter.classList.add('hd-past');
          letter.style.opacity = '0';
        } else {
          letter.classList.remove('hd-past');
          const d = i - currentCharIdx;
          if (actualZeroDist <= 0) {
            letter.style.opacity = '';
          } else if (d <= actualZeroDist) {
            letter.style.opacity = '0';
          } else if (d >= N) {
            letter.style.opacity = '';
          } else {
            const alpha = StageView.calculateOpacity(d, N, actualZeroDist);
            letter.style.opacity = String(alpha);
          }
        }
      }

      let dCumulative = Math.max(0, wordLen - currentCharIdx) + 1;
      let nextWordOffset = 1;
      while (currentWordIdx + nextWordOffset < this.wordElements.length) {
        const nextWordEl = this.wordElements[currentWordIdx + nextWordOffset];
        if (!nextWordEl) break;
        const nextLetters = nextWordEl.querySelectorAll('.letter');
        if (actualZeroDist > 0 && dCumulative >= N) {
          for (let j = 0; j < nextLetters.length; j++) {
            nextLetters[j].classList.remove('hd-past');
            nextLetters[j].style.opacity = '';
          }
          break;
        }
        for (let j = 0; j < nextLetters.length; j++) {
          const letter = nextLetters[j];
          letter.classList.remove('hd-past');
          const d = dCumulative + j;
          if (actualZeroDist <= 0) {
            letter.style.opacity = '';
          } else if (d <= actualZeroDist) {
            letter.style.opacity = '0';
          } else if (d >= N) {
            letter.style.opacity = '';
          } else {
            const alpha = StageView.calculateOpacity(d, N, actualZeroDist);
            letter.style.opacity = String(alpha);
          }
        }
        dCumulative += nextLetters.length + 1;
        nextWordOffset++;
      }
      return;
    }

    // Standard mathematical specification
    const M = StageView.getBlindfoldMask(combo);

    // 1. Process active word
    const activeLetters = activeWordEl.querySelectorAll('.letter');
    const wordLen = activeLetters.length;

    for (let i = 0; i < wordLen; i++) {
      const letter = activeLetters[i];
      if (i < currentCharIdx) {
        // Behind cursor: fully transparent once typed
        letter.classList.add('hd-past');
        letter.style.opacity = '0';
      } else {
        letter.classList.remove('hd-past');
        const k = i - currentCharIdx;
        const opacity = StageView.getHiddenOpacity(k, combo);
        letter.style.opacity = (opacity >= 1.0) ? '' : String(opacity);
      }
    }

    // 2. Process subsequent words ahead
    let kRunning = Math.max(0, wordLen - currentCharIdx) + 1; // +1 accounts for space between words
    let nextWordOffset = 1;

    while (currentWordIdx + nextWordOffset < this.wordElements.length) {
      const nextWordEl = this.wordElements[currentWordIdx + nextWordOffset];
      if (!nextWordEl) break;
      const nextLetters = nextWordEl.querySelectorAll('.letter');

      // If upcoming word is completely past blindfold horizon (kRunning >= M),
      // all characters are 1.0: clear inline opacity across previously faded words and stop.
      if (kRunning >= M) {
        for (let clearOffset = nextWordOffset; clearOffset < Math.min(this.wordElements.length - currentWordIdx, nextWordOffset + 12); clearOffset++) {
          const clearWordEl = this.wordElements[currentWordIdx + clearOffset];
          if (!clearWordEl) break;
          const clearLetters = clearWordEl.querySelectorAll('.letter');
          let hadAnyOpacity = false;
          for (let j = 0; j < clearLetters.length; j++) {
            if (clearLetters[j].style.opacity !== '' || clearLetters[j].classList.contains('hd-past')) {
              hadAnyOpacity = true;
              clearLetters[j].classList.remove('hd-past');
              clearLetters[j].style.opacity = '';
            }
          }
          if (!hadAnyOpacity && clearOffset > nextWordOffset + 1) {
            break;
          }
        }
        break;
      }

      for (let j = 0; j < nextLetters.length; j++) {
        const letter = nextLetters[j];
        letter.classList.remove('hd-past');
        const k = kRunning + j;
        const opacity = StageView.getHiddenOpacity(k, combo);
        letter.style.opacity = (opacity >= 1.0) ? '' : String(opacity);
      }

      kRunning += nextLetters.length + 1;
      nextWordOffset++;
    }
  }
}

if (typeof window !== 'undefined') {
  window.StageView = StageView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StageView };
}
