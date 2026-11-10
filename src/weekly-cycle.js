/* Weekly Prayer Progress model (v1.3.0).
   The week runs Saturday to Friday: full calendar days, five Fard per day
   (35 per week), Friday last and highlighted. Classical Shafi‘i and Hanafi
   texts (e.g. al-Nawawi, al-Majmu‘) treat Saturday as the first day of the
   week and Friday as its last, citing Sahih Muslim 2789; Friday is the
   Muslim day of gathering (Sahih Muslim 855–856). On Friday the midday slot is
   "Dhuhr/Jumu‘ah": Jumu‘ah replaces Dhuhr for those obliged to attend it, and
   anyone who does not attend prays Dhuhr, so either one completes the slot.
   Records keep their existing keys (fard.dhuhr), so no history is lost. */

export const WEEK_START_DAY = 6;   // Saturday
export const FRIDAY = 5;
export const FARD_PER_DAY = 5;
export const FARD_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const FRIDAY_DHUHR_LABEL = { en: 'Dhuhr/Jumu’ah', bn: 'যোহর/জুমা' };
export const WEEK_DAY_LABELS = {
  en: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  bn: ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র']
};

/** Midnight at the start of the Saturday-to-Friday week containing `now`. */
export function weekStart(now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() - WEEK_START_DAY + 7) % 7));
  return start;
}

export function sevenCycleDates(start) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    date.setHours(0, 0, 0, 0);
    return date;
  });
}

export function isFridayDhuhr(key, date) {
  return key === 'dhuhr' && date instanceof Date && date.getDay() === FRIDAY;
}

/** Friday's midday slot is completed by either Dhuhr or (legacy key) Jumu‘ah. */
export function fardSlotDone(fard, key, date) {
  if (!fard) return false;
  if (fard[key]) return true;
  return isFridayDhuhr(key, date) && !!fard.jumuah;
}

/** Per-day Fard cells (always five) and the weekly totals (35 possible). */
export function weeklyFardTally(dates, recordFor) {
  let done = 0;
  const days = dates.map(date => {
    const fard = recordFor(date)?.fard || {};
    const cells = FARD_KEYS.map(key => ({ key, done: fardSlotDone(fard, key, date), friday: isFridayDhuhr(key, date) }));
    const count = cells.filter(cell => cell.done).length;
    done += count;
    return { date, cells, count };
  });
  return { days, done, possible: dates.length * FARD_PER_DAY };
}

/* Kept for compatibility with v1.2.x callers: the former Friday-Dhuhr
   boundary. The weekly view no longer uses it. */
export function fridayCycleStart(now, getDhuhrForDate) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysSinceFriday = (start.getDay() - 5 + 7) % 7;
  start.setDate(start.getDate() - daysSinceFriday);
  const dhuhr = getDhuhrForDate(start);
  if (dhuhr instanceof Date && now < dhuhr) start.setDate(start.getDate() - 7);
  return start;
}
