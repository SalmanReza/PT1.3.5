/* Matching rules for the daily Islamic content carousels. Every card shows
   ALL items that match the current Hijri date, ordered by match precision:
   exact Hijri day first, then the documented fallbacks. Nothing is fetched
   from the internet; all data is bundled in islamic-content.js. */

export function hijriCalendarIndex(month, day) {
  return ((month - 1) * 30 + ((day || 15) - 1)) % 354;
}

function circularDistance(a, b) {
  const raw = Math.abs(a - b);
  return Math.min(raw, 354 - raw);
}

export function nearestHijriEvent(month, day, events) {
  const todayIndex = hijriCalendarIndex(month, day);
  return events.map(event => ({ event, distance: circularDistance(todayIndex, hijriCalendarIndex(event.month, event.day)) }))
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

/** All events tied for the smallest calendar distance (nearest anniversaries). */
export function nearestHijriEvents(month, day, events) {
  const first = nearestHijriEvent(month, day, events);
  if (!first) return [];
  const todayIndex = hijriCalendarIndex(month, day);
  return events.filter(event => circularDistance(todayIndex, hijriCalendarIndex(event.month, event.day)) === first.distance)
    .map(event => ({ event, distance: first.distance }));
}

/**
 * Islamic-history items for a Hijri date.
 * 1. The date note for this exact Hijri day (unless an event already covers it),
 * 2. history events on this exact Hijri day,
 * 3. month-level events for this month (labelled month-level),
 * 4. only when nothing above matches: the nearest documented anniversary(ies).
 * @returns {{type:'note'|'event', match:'exact'|'month'|'nearest', item:object, key:string}[]}
 */
export function historyItemsFor(hijri, notes = {}, events = []) {
  if (!hijri) return [];
  const { month, day } = hijri;
  const exactEvents = events.filter(event => event.month === month && event.day === day);
  const covered = new Set(exactEvents.map(event => event.noteKey).filter(Boolean));
  const noteKey = `${month}-${day}`;
  const items = [];
  if (notes[noteKey] && !covered.has(noteKey)) items.push({ type: 'note', match: 'exact', item: notes[noteKey], key: `note:${noteKey}` });
  for (const event of exactEvents) items.push({ type: 'event', match: 'exact', item: event, key: `event:${event.title}` });
  for (const event of events.filter(entry => entry.month === month && (entry.day === null || entry.day === undefined))) {
    items.push({ type: 'event', match: 'month', item: event, key: `event:${event.title}` });
  }
  if (items.length) return items;
  return nearestHijriEvents(month, day, events).map(({ event }) => ({
    type: 'event',
    match: event.day === null || event.day === undefined ? 'month' : 'nearest',
    item: event,
    key: `event:${event.title}`
  }));
}

export function recordMonths(record) {
  return Array.isArray(record.months) && record.months.length ? record.months : [record.month];
}

/**
 * Qur'anic verse records for a Hijri date. Every genuine match is returned,
 * ordered by precision: exact day, then week of month, then month-level
 * records; only when none match, the nearest documented period(s).
 * There is no cap and no padding.
 * @returns {{record:object, matchLevel:'day'|'week'|'month'|'nearest'}[]}
 */
export function quranItemsFor(hijri, records = []) {
  if (!hijri || !records.length) return [];
  const week = Math.ceil(hijri.day / 7);
  const inMonth = record => recordMonths(record).includes(hijri.month);
  const results = [];
  const seen = new Set();
  const add = (record, matchLevel) => { if (!seen.has(record)) { seen.add(record); results.push({ record, matchLevel }); } };
  records.filter(record => record.day === hijri.day && inMonth(record)).forEach(record => add(record, 'day'));
  records.filter(record => record.week === week && inMonth(record)).forEach(record => add(record, 'week'));
  // Month tier: records dated only to a month. A record tied to a specific
  // day matches that day only (as in historyItemsFor), never the whole month.
  records.filter(record => !record.day && !record.week && inMonth(record)).forEach(record => add(record, 'month'));
  if (results.length) return results;
  const today = hijriCalendarIndex(hijri.month, hijri.day);
  const scored = records.map(record => {
    const anchorDay = record.day || (record.week ? (record.week - 1) * 7 + 1 : 15);
    const distance = Math.min(...recordMonths(record).map(month => circularDistance(today, hijriCalendarIndex(month, anchorDay))));
    return { record, distance };
  });
  const best = Math.min(...scored.map(item => item.distance));
  return scored.filter(item => item.distance === best).map(item => ({ record: item.record, matchLevel: 'nearest' }));
}

/**
 * Seerah daily-life glimpses that genuinely match a weekday. The bundled list is
 * a weekday table (index 0 = Sunday … 6 = Saturday); an entry tagged with
 * `weekday` belongs to that weekday wherever it sits. Untagged entries match
 * only their own weekday slot. No padding with other days' glimpses and no
 * cap: the count is whatever matches (one per weekday with today's data).
 * v1.2.9 appended every untagged glimpse, so most days showed exactly five.
 */
export function glimpsesFor(weekday, glimpses) {
  const today = ((Number(weekday) % 7) + 7) % 7;
  const matches = [];
  glimpses.forEach((glimpse, index) => {
    const tagged = glimpse && glimpse.weekday !== undefined && glimpse.weekday !== null;
    if (tagged ? Number(glimpse.weekday) === today : index === today) matches.push(index);
  });
  return matches;
}
