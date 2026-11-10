/* Hanafi prohibited (makruh tahrimi) prayer intervals for one day:
   - sunrise: from sunrise until the sun has risen about a spear's length,
     approximated as 20 minutes (the same point at which Ishraq/Duha begins);
   - zawal: the solar-noon interval already used by the app (solar noon ± 6 min);
   - sunset: from the yellowing of the sun until sunset, approximated as the
     last 15 minutes before sunset. That day's own Asr, if still unprayed,
     may be performed then according to the Hanafi school, but delaying it is disliked.
   The minute values are practical approximations, not observed sky conditions. */
export const SUNRISE_PROHIBITED_MINUTES = 20;
export const SUNSET_PROHIBITED_MINUTES = 15;

export const PROHIBITED_LABELS = {
  sunrise: { en: 'Sunrise', bn: 'সূর্যোদয়' },
  zawal: { en: 'Zawal', bn: 'জাওয়াল' },
  sunset: { en: 'Before sunset', bn: 'সূর্যাস্তের আগে' }
};

const add = (date, minutes) => new Date(date.getTime() + minutes * 60000);
const valid = value => value instanceof Date && Number.isFinite(value.getTime());

export function prohibitedIntervals(times) {
  if (!times) return [];
  const sunset = valid(times.sunset) ? times.sunset : times.maghrib;
  const list = [];
  if (valid(times.sunrise)) list.push({ key: 'sunrise', start: times.sunrise, end: add(times.sunrise, SUNRISE_PROHIBITED_MINUTES) });
  if (valid(times.zawalStart) && valid(times.zawalEnd)) list.push({ key: 'zawal', start: times.zawalStart, end: times.zawalEnd });
  if (valid(sunset)) list.push({ key: 'sunset', start: add(sunset, -SUNSET_PROHIBITED_MINUTES), end: sunset });
  return list.filter(item => item.end > item.start);
}

/* The interval that contains `now` (start inclusive, end exclusive), or null. */
export function activeProhibition(times, now = new Date()) {
  const at = now.getTime();
  return prohibitedIntervals(times).find(item => at >= item.start.getTime() && at < item.end.getTime()) || null;
}
