/* App-wide clock format (v1.3.1): 24-hour (default, unchanged) or 12-hour.
   English 12-hour: "5:07 AM". Bangla uses Bengali digits; in 12-hour mode the
   everyday Bangla day-period word comes first, e.g. "বিকাল ৩:৩৭":
     ভোর 04–06 · সকাল 06–12 · দুপুর 12–15 · বিকাল 15–18 · সন্ধ্যা 18–20 · রাত 20–04
   Pure (no DOM) so every format is unit-tested. */

export const CLOCK_FORMATS = Object.freeze(['24h', '12h']);
export const DEFAULT_CLOCK_FORMAT = '24h';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnDigits = text => String(text).replace(/[0-9]/g, d => BN_DIGITS[d]);
const pad = n => String(n).padStart(2, '0');

export function sanitizeClockFormat(value) {
  return CLOCK_FORMATS.includes(value) ? value : DEFAULT_CLOCK_FORMAT;
}

export function bnDayPeriod(hour) {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h >= 4 && h < 6) return 'ভোর';
  if (h >= 6 && h < 12) return 'সকাল';
  if (h >= 12 && h < 15) return 'দুপুর';
  if (h >= 15 && h < 18) return 'বিকাল';
  if (h >= 18 && h < 20) return 'সন্ধ্যা';
  return 'রাত';
}

/**
 * @param {Date} date
 * @param {object} options {lang:'en'|'bn', clock:'24h'|'12h', seconds:boolean}
 */
export function formatClock(date, { lang = 'en', clock = DEFAULT_CLOCK_FORMAT, seconds = false } = {}) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
  const h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();
  const tail = `${pad(m)}${seconds ? `:${pad(s)}` : ''}`;
  if (sanitizeClockFormat(clock) === '24h') {
    const text = `${pad(h)}:${tail}`;
    return lang === 'bn' ? bnDigits(text) : text;
  }
  const h12 = h % 12 || 12;
  if (lang === 'bn') return `${bnDayPeriod(h)} ${bnDigits(`${h12}:${tail}`)}`;
  return `${h12}:${tail} ${h < 12 ? 'AM' : 'PM'}`;
}
