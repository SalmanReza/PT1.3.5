/* Prohibited (Ja'fari: disliked) intervals in "Available right now" (v1.3.3).
   An interval is shown ONLY while it is in progress (no lead time, nothing upcoming) and is never a
   Next event target: Next event is always the soonest obligatory or voluntary prayer event.
   Pure helpers; the app supplies the intervals and the timeline. */
const ms = value => (value instanceof Date ? value.getTime() : Number(value));

/** Next obligatory or voluntary prayer event after `now` from the day timeline, or null. */
export function nextPrayerEventAfter(timeline, now) {
  const at = ms(now);
  return (timeline || []).find(item => item.at > at && (item.kind === 'fard' || item.kind === 'voluntary')) || null;
}

/** Intervals that are IN PROGRESS at `now` (start <= now < end), sorted; nothing upcoming, ever (v1.3.3). */
export function activeIntervals(intervals, now) {
  const at = ms(now);
  return (intervals || [])
    .map(item => ({ key: item.key, start: ms(item.start), end: ms(item.end) }))
    .filter(item => Number.isFinite(item.start) && Number.isFinite(item.end) && at >= item.start && at < item.end)
    .sort((a, b) => a.start - b.start)
    .map(item => ({ ...item, active: true }));
}
