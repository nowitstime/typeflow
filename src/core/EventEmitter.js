/**
 * TypeFlow - EventEmitter
 * Ultra-lightweight, zero-dependency event dispatcher for Observable MVC.
 */

class EventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * Register an event listener.
   * Returns an unsubscribe function.
   */
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }

  /**
   * Remove an event listener.
   */
  off(event, handler) {
    const list = this._listeners.get(event);
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx !== -1) {
      list.splice(idx, 1);
    }
  }

  /**
   * Emit an event synchronously to all registered listeners.
   */
  emit(event, ...args) {
    const list = this._listeners.get(event);
    if (!list || list.length === 0) return;
    const listeners = list.slice();
    for (let i = 0; i < listeners.length; i++) {
      try {
        listeners[i](...args);
      } catch (err) {
        console.error(`[EventEmitter] Error in listener for "${event}":`, err);
      }
    }
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified.
   */
  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}

if (typeof window !== 'undefined') {
  window.EventEmitter = EventEmitter;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventEmitter };
}
