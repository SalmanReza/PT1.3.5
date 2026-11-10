/* One ordered timeline of "events" for the Next event hero (v1.3.2): obligatory
   prayers, voluntary prayers, the prohibited (Ja'fari: disliked) intervals, and
   the Ja'fari midnight. The caller builds the per-day lists from the app's own
   prayer, voluntary and forbidden-time data, so madhab and date-specific events
   are already applied (for example no Duha/Awwabin in Ja'fari mode). Pure. */

/* Events that start at the same instant collapse into one, most specific first:
   an obligatory prayer, then a date-specific prayer (Eid), then other voluntary
   prayers, the Ja'fari midnight, the end of an interval, the start of an interval. */
const PRIORITY = { fard: 0, special: 1, voluntary: 2, midnight: 3, 'prohibited-end': 4, 'prohibited-start': 5 };
const SPECIAL = new Set(['eid_prayer']);
const ms = value => (value instanceof Date ? value.getTime() : Number(value));

/** days: [{ fard:[{key,start,end}], voluntary:[{key,start}], prohibited:[{key,start,end}], midnight: Date|null }] */
export function buildTimeline(days) {
  const raw = [];
  for (const day of days || []) {
    for (const e of day.fard || []) raw.push({ kind: 'fard', key: e.key, at: ms(e.start), date: e.date });
    for (const e of day.voluntary || []) raw.push({ kind: SPECIAL.has(e.key) ? 'special' : 'voluntary', key: e.key, at: ms(e.start), date: e.date });
    for (const e of day.prohibited || []) {
      raw.push({ kind: 'prohibited-start', key: e.key, at: ms(e.start) });
      raw.push({ kind: 'prohibited-end', key: e.key, at: ms(e.end) });
    }
    if (day.midnight) raw.push({ kind: 'midnight', key: 'midnight', at: ms(day.midnight) });
  }
  const valid = raw.filter(item => Number.isFinite(item.at));
  valid.sort((a, b) => a.at - b.at || PRIORITY[a.kind] - PRIORITY[b.kind]);
  const out = [];
  for (const item of valid) {
    const last = out[out.length - 1];
    if (last && last.at === item.at) continue; // same instant: the higher-priority event already won
    out.push(item);
  }
  return out.map(item => ({ ...item, kind: item.kind === 'special' ? 'voluntary' : item.kind }));
}

/** First event strictly after `now` (a Date or ms), plus the one after it; or null. */
export function nextEventAfter(timeline, now) {
  const at = ms(now);
  const index = timeline.findIndex(item => item.at > at);
  return index < 0 ? null : { ...timeline[index], following: timeline[index + 1] || null };
}

/** Hero wording for an event: { name, meta } in English or Bangla. `shia` selects "disliked" wording. */
export function eventLabel(event, { lang = 'en', shia = false, prayerName = key => key } = {}) {
  const bn = lang === 'bn';
  if (event.kind === 'prohibited-start' || event.kind === 'prohibited-end') {
    const ends = event.kind === 'prohibited-end';
    const name = bn
      ? `${shia ? 'মাকরুহ সময়' : 'নিষিদ্ধ সময়'}${ends ? ' শেষ' : ''}`
      : `${shia ? 'Disliked time' : 'Prohibited time'}${ends ? ' ends' : ''}`;
    return { name, verb: ends ? 'Ends at' : 'Begins at' };
  }
  if (event.kind === 'midnight') return { name: bn ? 'মধ্যরাত (ইশার শেষ)' : 'Midnight (end of Isha)', verb: 'Begins at' };
  return { name: prayerName(event.key), verb: 'Begins at' };
}
