/* Small carousel helpers shared by the daily content cards. */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

export function toBengaliDigits(value) {
  return String(value).replace(/[0-9]/g, digit => BN_DIGITS[Number(digit)]);
}

export function wrapIndex(index, count) {
  const total = Math.max(0, Math.floor(Number(count) || 0));
  if (!total) return 0;
  const value = Math.floor(Number(index) || 0);
  return ((value % total) + total) % total;
}

export function stepIndex(index, delta, count) {
  return wrapIndex((Number(index) || 0) + (Number(delta) || 0), count);
}

/** "1 / 5" in English, "১ / ৫" in Bangla. Empty when there is nothing to page. */
export function counterLabel(index, count, language = 'en') {
  if (!count) return '';
  const label = `${wrapIndex(index, count) + 1} / ${count}`;
  return language === 'bn' ? toBengaliDigits(label) : label;
}

export function showsControls(count) {
  return Number(count) > 1;
}

/**
 * Keep the visible page when the same set of items is re-rendered (clock,
 * language change), but start again at the first item when the set changes
 * (for example after the Hijri date changes at sunset).
 */
export function reconcileIndex(previous, signature, count) {
  if (!previous || previous.signature !== signature) return 0;
  return wrapIndex(previous.index, count);
}
