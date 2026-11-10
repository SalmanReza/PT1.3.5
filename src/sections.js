/* Home page sections that Settings can hide (v1.3.3). All are shown by default; the choice is persisted.
   Anything missing or not a boolean in saved data falls back to "shown". Pure. */
export const SECTION_KEYS = ['descriptions', 'sunnah', 'onThisDay'];

export function sanitizeSections(saved) {
  const input = saved && typeof saved === 'object' ? saved : {};
  return Object.fromEntries(SECTION_KEYS.map(key => [key, typeof input[key] === 'boolean' ? input[key] : true]));
}

/* v1.3.4: every card inside a tab can be hidden on its own. Keys are flat; the tab owns them. A card is shown unless
   its saved value is the boolean false. Saved values for hidden cards are kept, never deleted. */
export const CARD_KEYS = {
  descriptions: ['obligatory', 'daily', 'situational', 'seasonal'],
  sunnah: ['hijriEvent', 'propheticDay'],
  onThisDay: ['onThisDay', 'quranRevelation']
};
export const ALL_CARD_KEYS = Object.values(CARD_KEYS).flat();

export function sanitizeCards(saved) {
  const input = saved && typeof saved === 'object' ? saved : {};
  return Object.fromEntries(ALL_CARD_KEYS.map(key => [key, typeof input[key] === 'boolean' ? input[key] : true]));
}

/** A tab with every one of its cards hidden is not drawn at all. */
export function tabVisible(tab, sections, cards) {
  return !!sections[tab] && CARD_KEYS[tab].some(key => cards[key] !== false);
}
