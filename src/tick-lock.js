/* Locking of marked prayer events (v1.3.2). A ticked event, with its Fard, Sunnah
   and Nafl parts, can be unmarked only until the NEXT prayer event begins; after
   that it is locked in. Locking only ever affects UN-marking: when an event can be
   ticked is unchanged.

   - Fard and standalone voluntary events (Fajr, Duha, Dhuhr, Asr, Maghrib, Awwabin,
     ...) lock when the next prayer event of that prayer day starts.
   - Date-specific events (Eid prayer, Tarawih) also lock when the next event starts
     (Eid: Dhuhr; Tarawih: the Tahajjud window).
   - The night prayers Isha, Qiyam, Witr and Tahajjud lock at the next Fajr (the
     prayer-day rollover).
   - Sunnah/Nafl parts lock together with their Fard.

   Clock changes: a lock, once seen, is remembered (see sealRecord and the date
   watermark), so setting the clock back or travelling to another time zone never
   re-opens a locked tick. */

export const NIGHT_KEYS = Object.freeze(['isha', 'qiyam', 'witr', 'tahajjud']);
const ms = value => (value instanceof Date ? value.getTime() : Number(value));

export const lockKey = (kind, key) => `${kind}:${key}`;

/** When this item locks: { at, by } with `by` the key of the event whose start locks it, or null when unknown.
 *  item: { kind: 'fard'|'voluntary'|'sunnah'|'nafl', key, prayer? }; events: [{ kind, key, start }] of its prayer day. */
export function lockInstant(item, events = [], nextFajr = null) {
  const base = item.kind === 'sunnah' || item.kind === 'nafl' ? { kind: 'fard', key: item.prayer } : item;
  if (NIGHT_KEYS.includes(base.key)) return nextFajr == null ? null : { at: ms(nextFajr), by: 'fajr' };
  const own = events.find(event => event.kind === base.kind && event.key === base.key);
  if (!own) return null;
  const later = events
    .map(event => ({ key: event.key, kind: event.kind, at: ms(event.start) }))
    .filter(event => event.at > ms(own.start))
    .sort((a, b) => a.at - b.at || (a.kind === 'fard' ? -1 : 1) - (b.kind === 'fard' ? -1 : 1));
  if (later.length) return { at: later[0].at, by: later[0].key };
  return nextFajr == null ? null : { at: ms(nextFajr), by: 'fajr' };
}

/** Is a ticked item locked at `now`? `sealed` is true when a lock was already recorded. */
export function isLockedAt(item, events, nextFajr, now, sealed = false) {
  if (sealed) return true;
  const lock = lockInstant(item, events, nextFajr);
  return !!lock && ms(now) >= lock.at;
}

/** Whole prayer days before the current prayer day are locked (Isha, the last to lock, locks at the next Fajr). */
export function dayIsLocked(dayKey, currentPrayerDayKey, watermark = null) {
  return dayKey < currentPrayerDayKey || (!!watermark && dayKey <= watermark);
}

/** The date watermark: every prayer day up to it stays locked whatever the clock does later. It moves forward at most one day per step, so one wrong clock cannot lock future days. */
export function nextWatermark(previous, currentPrayerDayKey, addDaysKey) {
  const target = addDaysKey(currentPrayerDayKey, -1);
  if (!previous) return target;
  if (target <= previous) return previous;
  const step = addDaysKey(previous, 1);
  return step < target ? step : target;
}

/** Record the locks of one day's record: every ticked item whose lock instant has passed gets a flag. Returns true when anything changed. */
export function sealRecord(record, itemsFor, now) {
  if (!record) return false;
  let changed = false;
  const flags = record.locked || {};
  for (const layer of ['fard', 'voluntary', 'sunnah', 'nafl']) {
    for (const key of Object.keys(record[layer] || {})) {
      if (!record[layer][key] || flags[lockKey(layer, key)]) continue;
      const { item, events, nextFajr } = itemsFor(layer, key);
      if (isLockedAt(item, events, nextFajr, now)) { flags[lockKey(layer, key)] = 1; changed = true; }
    }
  }
  if (changed) record.locked = flags;
  return changed;
}

/** Tooltip text: "Locked after Dhuhr began" / "যোহর শুরু হওয়ার পর লক হয়েছে". `name` is null for a past day. */
export function lockTip(name, lang = 'en') {
  if (lang === 'bn') return name ? `${name} শুরু হওয়ার পর লক হয়েছে` : 'পরবর্তী ওয়াক্ত শুরু হওয়ায় লক হয়েছে';
  return name ? `Locked after ${name} began` : 'Locked: a later prayer has begun';
}
