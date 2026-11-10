/* Quiet hours-and-minutes line under each Daily prayers card (v1.3.3).
   Not started: "in 3h 54m"; current: "ends in 25m"; passed: nothing. No seconds;
   the caller refreshes it once a minute. Durations carry no clock time, so the 12h/24h
   setting only matters for the tooltip the caller adds. Pure. */
const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnNum = v => String(v).replace(/[0-9]/g, d => BN_DIGITS[d]);
const ms = v => (v instanceof Date ? v.getTime() : Number(v));

/** Whole minutes left, rounded up and never below 1 while time remains. */
export function minutesLeft(msLeft) { return msLeft > 0 ? Math.max(1, Math.ceil(msLeft / 60000)) : 0; }

/** "3h 54m", "25m", "2h" (English) or "৩ ঘণ্টা ৫৪ মিনিট", "২৫ মিনিট", "২ ঘণ্টা" (Bangla). */
export function durationText(totalMinutes, lang = 'en') {
  const h = Math.floor(totalMinutes / 60), m = totalMinutes % 60;
  if (lang === 'bn') return [h ? `${bnNum(h)} ঘণ্টা` : '', m || !h ? `${bnNum(m)} মিনিট` : ''].filter(Boolean).join(' ');
  return [h ? `${h}h` : '', m || !h ? `${m}m` : ''].filter(Boolean).join(' ');
}

/** { kind: 'upcoming'|'current'|'passed', text } for a prayer window at `now`. */
export function cardCountdown({ now, start, end, lang = 'en' }) {
  const n = ms(now), s = ms(start), e = ms(end);
  if (!Number.isFinite(n) || !Number.isFinite(s) || !Number.isFinite(e)) return { kind: 'passed', text: '' };
  if (n < s) { const d = durationText(minutesLeft(s - n), lang); return { kind: 'upcoming', text: lang === 'bn' ? `${d} পরে` : `in ${d}` }; }
  if (n < e) { const d = durationText(minutesLeft(e - n), lang); return { kind: 'current', text: lang === 'bn' ? `${d}${d.endsWith('ঘণ্টা') ? 'য়' : 'ে'} শেষ` : `ends in ${d}` }; }
  return { kind: 'passed', text: '' };
}
