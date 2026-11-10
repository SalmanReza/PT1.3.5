/* Reminder timing rules shared by the 15-second notification check. */
export const PRE_REMINDER_MIN = 0;      // 0 = off
export const PRE_REMINDER_MAX = 180;    // three hours
/* How long after its exact moment a reminder may still fire. Hidden WebView2
   windows (minimised to the tray) can throttle timers to about once per
   minute, so the window must be longer than one throttled tick. */
export const REMINDER_GRACE_MS = 120000;

/* Parse a minutes field. Empty means off (0). Returns null for anything that
   is not a whole number from 0 to 180. */
export function parseReminderMinutes(value) {
  const text = String(value ?? '').trim();
  if (text === '') return 0;
  if (!/^\d+$/.test(text)) return null;
  const minutes = Number(text);
  return minutes >= PRE_REMINDER_MIN && minutes <= PRE_REMINDER_MAX ? minutes : null;
}

/* Sanitise stored values (e.g. from an older or hand-edited profile). */
export function sanitizeReminderMap(map, keys) {
  const out = {};
  if (!map || typeof map !== 'object') return out;
  for (const key of keys) {
    const minutes = parseReminderMinutes(map[key]);
    if (minutes) out[key] = minutes;
  }
  return out;
}

/* The reminder is due from `fireAt` until the grace window ends, but never at
   or after `limit` (the prayer start for "before" reminders). */
export function isReminderDue(now, fireAt, limit = Infinity, grace = REMINDER_GRACE_MS) {
  return Number.isFinite(fireAt) && now >= fireAt && now < Math.min(fireAt + grace, limit);
}

export function preReminderFireAt(start, minutes) {
  return start.getTime() - minutes * 60000;
}
