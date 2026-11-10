/* Boundary handling for the live prayer view (v1.3.2).
   The home screen is a snapshot (next prayer, current prayer, "available right
   now", progress). It must be rebuilt the instant any prayer window opens or
   closes, at the day change, and after a sleep/wake or a throttled hidden
   window. These helpers are pure so they can be tested with fixed dates. */

/** Smallest start or end time (ms) strictly after `now` among the events, or null. */
export function nextBoundary(events, now) {
  const at = now instanceof Date ? now.getTime() : Number(now);
  let best = null;
  for (const event of events || []) {
    for (const value of [event?.start, event?.end]) {
      const t = value instanceof Date ? value.getTime() : Number(value);
      if (Number.isFinite(t) && t > at && (best === null || t < best)) best = t;
    }
  }
  return best;
}

/** Largest gap between two ticks (ms) that still counts as a normal tick. */
export const TICK_GAP_MS = 5000;

/** True when the snapshot is stale: a boundary was reached, the civil day changed,
    the clock went backwards, or the ticks stopped for a while (sleep, hidden window). */
export function needsRefresh({ now, boundaryAt, lastTickAt, todayKey, lastDateKey }) {
  if (boundaryAt !== null && boundaryAt !== undefined && now >= boundaryAt) return true;
  if (todayKey !== lastDateKey) return true;
  if (lastTickAt !== null && lastTickAt !== undefined) {
    if (now < lastTickAt) return true;
    if (now - lastTickAt > TICK_GAP_MS) return true;
  }
  return false;
}

/** Delay (ms) for a one-shot timer that fires just after the boundary; capped
    so a long wait is re-checked at least once a minute. */
export function boundaryDelay(boundaryAt, now, cap = 60000) {
  if (boundaryAt === null || boundaryAt === undefined) return cap;
  return Math.min(cap, Math.max(0, boundaryAt - now) + 25);
}
