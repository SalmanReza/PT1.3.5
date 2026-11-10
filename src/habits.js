/* Offline behaviour learning for the Today's Progress lines (v1.3.2).
   Simple statistics over the tick history already kept on this device; nothing
   leaves the device and resetting the history resets what is learned.
   Records may carry `at: { "fard:fajr": [minutesAfterWindowStart, minuteOfDay] }`
   (added in v1.3.2; older records simply have no `at` and count as ticks with
   unknown time). Only positive facts are produced: what was done. */

const KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const DAY = 86400000;

export function addDaysKey(key, delta) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + delta, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const median = list => { const a = [...list].sort((x, y) => x - y); const n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : Math.round((a[n / 2 - 1] + a[n / 2]) / 2)) : null; };
const fardCount = rec => KEYS.filter(k => rec?.fard?.[k]).length;
const lightCount = rec => Object.keys(rec?.sunnah || {}).filter(k => rec.sunnah[k]).length + Object.keys(rec?.nafl || {}).filter(k => rec.nafl[k]).length;

/** habit strength from the last 14 days: habit (10+), occasional (5-9), rare (1-4), new (none) */
export function strengthOf(days) { return days >= 10 ? 'habit' : days >= 5 ? 'occasional' : days >= 1 ? 'rare' : 'new'; }

export function analyzeHabits(history = {}, todayKey, { fardKeys = KEYS } = {}) {
  const rec = k => history[k];
  const last14 = Array.from({ length: 14 }, (_, i) => addDaysKey(todayKey, -i));
  const past = last14.slice(1); // excluding today
  const strength = {}, usualOffset = {};
  for (const key of fardKeys) {
    const ticked = last14.filter(d => rec(d)?.fard?.[key]);
    strength[key] = strengthOf(ticked.length);
    const offsets = ticked.map(d => rec(d)?.at?.[`fard:${key}`]?.[0]).filter(Number.isFinite);
    usualOffset[key] = offsets.length >= 3 ? median(offsets) : null;
  }
  const historyDays = last14.filter(d => rec(d) && (fardCount(rec(d)) || lightCount(rec(d)))).length;
  // batch-ticker: on 2+ of the last 7 days, three or more Fard ticked within 15 minutes of each other
  let batchDays = 0;
  for (const d of last14.slice(0, 7)) {
    const mins = KEYS.map(k => rec(d)?.at?.[`fard:${k}`]?.[1]).filter(Number.isFinite).sort((a, b) => a - b);
    for (let i = 0; i + 2 < mins.length; i++) if (mins[i + 2] - mins[i] <= 15) { batchDays++; break; }
  }
  const sum = (from, to) => Array.from({ length: to - from }, (_, i) => addDaysKey(todayKey, -(from + i)));
  const week = list => list.reduce((t, d) => t + fardCount(rec(d)), 0);
  const thisWeek = week(sum(0, 7)), lastWeek = week(sum(7, 14));
  const light = list => list.reduce((t, d) => t + lightCount(rec(d)), 0);
  let streak = 0;
  for (let i = 0; i < 400; i++) { if (fardCount(rec(addDaysKey(todayKey, -i))) === 5) streak++; else break; }
  const everAll = Object.keys(history).some(k => k !== todayKey && fardCount(history[k]) === 5);
  const voluntaryScore = {};
  for (const d of sum(1, 8)) for (const [kind, map] of [['voluntary', rec(d)?.voluntary], ['sunnah', rec(d)?.sunnah], ['nafl', rec(d)?.nafl]]) {
    for (const [k, v] of Object.entries(map || {})) if (v) voluntaryScore[`${kind}:${k}`] = (voluntaryScore[`${kind}:${k}`] || 0) + 1;
  }
  const early = KEYS.some(k => Number.isFinite(usualOffset[k]) && usualOffset[k] <= 15);
  return {
    strength, usualOffset, historyDays, batch: batchDays >= 2, voluntaryScore,
    trendUp: lastWeek >= 3 && thisWeek > lastWeek,
    sunnahMore: light(sum(7, 14)) >= 3 && light(sum(0, 7)) > light(sum(7, 14)),
    streak, firstAll: !everAll && fardCount(rec(todayKey)) === 5,
    soonLeadMin: early ? 30 : 60
  };
}

/** A rare Sunnah/Nafl suggestion: the open candidate closest to becoming a habit (3-5 of the last 7 days) that was skipped yesterday. */
export function pickSuggestion({ candidates = [], history = {}, todayKey, memory = {}, shia = false }) {
  const h = analyzeHabits(history, todayKey);
  const yesterday = addDaysKey(todayKey, -1);
  const rec = history[todayKey];
  const shown = memory.day === todayKey ? memory : null;
  const eligible = candidates.filter(c => c.kind !== 'fard' && c.key !== 'tahajjud' && !(shia && ['duha', 'awwabin'].includes(c.key)))
    .filter(c => !rec?.[c.kind]?.[c.key]);
  // already suggested today: keep showing it until it is ticked or its window closes
  if (shown) return eligible.find(c => c.key === shown.key) || null;
  if (memory.day && (memory.day === yesterday || addDaysKey(memory.day, 3) > todayKey)) return null;
  const scored = eligible
    .filter(c => !history[yesterday]?.[c.kind]?.[c.key])
    .map(c => ({ c, score: h.voluntaryScore[`${c.kind}:${c.key}`] || 0 }))
    .filter(x => x.score >= 3 && x.score <= 5)
    .sort((a, b) => b.score - a.score || (a.c.key < b.c.key ? -1 : 1));
  return scored[0]?.c || null;
}
