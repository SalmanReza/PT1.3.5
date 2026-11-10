/* Keyboard shortcut resolution. Kept free of DOM/Tauri imports so it can be
   unit-tested in Node. The set is deliberately small: fullscreen, Escape,
   page navigation and the shortcut guide. */

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function isTypingTarget(target) {
  if (!target || typeof target !== 'object') return false;
  if (target.isContentEditable) return true;
  return TYPING_TAGS.has(String(target.tagName || '').toUpperCase());
}

/**
 * Map a keydown event to an app action.
 * @returns {'fullscreen'|'escape'|'help'|'home'|'end'|'pageUp'|'pageDown'|null}
 */
export function shortcutFor(event, { helpOpen = false } = {}) {
  if (!event) return null;
  const key = event.key;
  if (key === 'F11') return event.repeat ? null : 'fullscreen';
  if (key === 'Escape') return 'escape';
  if (event.altKey || event.ctrlKey || event.metaKey) return null;
  if (isTypingTarget(event.target)) return null;
  if (key === '?' || (key === '/' && event.shiftKey)) return 'help';
  // While the shortcut guide is open, do not scroll the page behind it.
  if (helpOpen) return null;
  if (key === 'Home') return 'home';
  if (key === 'End') return 'end';
  if (key === 'PageUp') return 'pageUp';
  if (key === 'PageDown') return 'pageDown';
  return null;
}

/** Distance for Page Up / Page Down: roughly one viewport, keeping a little overlap. */
export function pageScrollDistance(viewportHeight) {
  const height = Number(viewportHeight) || 0;
  return Math.max(240, Math.round(height * 0.88));
}

/** Left/Right arrows page a focused carousel. Returns -1, 1 or 0. */
export function carouselArrowDelta(event) {
  if (!event || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return 0;
  if (isTypingTarget(event.target)) return 0;
  if (event.key === 'ArrowLeft') return -1;
  if (event.key === 'ArrowRight') return 1;
  return 0;
}
