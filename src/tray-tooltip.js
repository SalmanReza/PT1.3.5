/* System-tray tooltip text: the next obligatory prayer and the time left.
   Pure helpers so the wording, rounding and digits can be tested offline. */
import { toBengaliDigits } from './carousel.js';

export const TRAY_APP_NAME = { en: 'Prayer Times', bn: 'নামাজের সময়' };
// Windows truncates tray tooltips at 127 UTF-16 code units.
export const TRAY_TOOLTIP_MAX = 127;

/* Whole minutes left, rounded up so the tooltip never reads "0m" before the
   prayer has begun. */
export function minutesLeft(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.ceil(ms / 60000);
}

export function formatRemaining(ms, lang = 'en') {
  const total = Math.max(1, minutesLeft(ms));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (lang === 'bn') {
    const parts = [];
    if (hours) parts.push(`${toBengaliDigits(hours)} ঘণ্টা`);
    if (minutes || !hours) parts.push(`${toBengaliDigits(minutes)} মিনিট`);
    return parts.join(' ');
  }
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes || !hours) parts.push(`${minutes}m`);
  return parts.join(' ');
}

export function trayTooltipText({ name, ms, lang = 'en' } = {}) {
  const app = TRAY_APP_NAME[lang === 'bn' ? 'bn' : 'en'];
  if (!name || !Number.isFinite(ms)) return app;
  const line = lang === 'bn'
    ? `${name} শুরু হতে ${formatRemaining(ms, 'bn')} বাকি`
    : `${name} in ${formatRemaining(ms, 'en')}`;
  const text = `${app}\n${line}`;
  return text.length > TRAY_TOOLTIP_MAX ? text.slice(0, TRAY_TOOLTIP_MAX) : text;
}
