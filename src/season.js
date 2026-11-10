/* Seasonal reminder choices (v1.3.4). "Remind me before a prayer period ends" lists Tarawih only during Ramadan and the
   Eid prayer only on Eid days (1 Shawwal, 10 Dhu al-Hijjah). `hijri` is {day, month}. Saved reminder values are never
   removed: this only decides which rows are drawn. Pure. */
export function isRamadan(hijri) { return !!hijri && hijri.month === 9; }
export function isEidDay(hijri) { return !!hijri && ((hijri.month === 10 && hijri.day === 1) || (hijri.month === 12 && hijri.day === 10)); }
export function reminderRowVisible(key, hijri) {
  if (key === 'tarawih') return isRamadan(hijri);
  if (key === 'eid_prayer') return isEidDay(hijri);
  return true;
}
