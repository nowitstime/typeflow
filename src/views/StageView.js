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
    this.focusOverlay = elements.focusOverlay || (typeof document !== 'undefined' ? document.getElementById('focus-overlay') : null);
    this.typingInput = elements.typingInput || (typeof document !== 'undefined' ? document.getElementById('typing-input') : null);

    this.scrollOffset = 0;
    this.wordElements = [];
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
      this.wordsWrapper.appendChild(wordEl);
      this.wordElements.push(wordEl);
    }

    this.scrollOffset = 0;
    this.wordsWrapper.style.transform = 'translateY(0px)';
  }

  /**
   * Dynamically appends additional words as player nears the end of the batch.
   */
  appendWords(moreWords) {
    if (!this.wordsWrapper || !Array.isArray(moreWords)) return;
    const doc = this._getDoc();
    if (!doc) return;

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
      this.wordsWrapper.appendChild(wordEl);
      this.wordElements.push(wordEl);
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
    }

    const prevEl = this.wordElements[prevWordIdx];
    if (prevEl) {
      prevEl.classList.add('active');
      this.checkWordErrorState(prevEl);
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

    const line2Word = Array.from(this.wordsWrapper.children).find(w => w.offsetTop > baseTop + 10);
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
   * Subpixel horizontal caret tracking and synchronous vertical lock.
   */
  updateCaret(currentWordIdx, currentCharIdx) {
    if (!this.caret || !this.wordsWrapper) return;
    const currentWordEl = this.wordElements[currentWordIdx];
    if (!currentWordEl) return;

    this.checkLineScroll(currentWordEl);

    const currentWordTop = currentWordEl.offsetTop;
    const visualTop = currentWordTop - this.scrollOffset;
    const targetTop = visualTop + 5;

    const letterElements = currentWordEl.querySelectorAll('.letter');
    const boxRect = this.wordsBox ? this.wordsBox.getBoundingClientRect() : { left: 0, width: 0 };
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

    this.caret.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
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
}

if (typeof window !== 'undefined') {
  window.StageView = StageView;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StageView };
}
