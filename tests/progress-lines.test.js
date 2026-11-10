import test from 'node:test';
import assert from 'node:assert/strict';
import { progressLine, determine, repeatsWord, variantCount, forEachLine, normalizeLine, expand, headsUpLead, LINE_LEXICON, NAMES, realize, REACT_MINUTES, HEADS_UP_RANGE, VOLUNTARY_HEADS_UP_MINUTES } from '../src/progress-lines.js';
import { analyzeHabits, pickSuggestion, addDaysKey, strengthOf } from '../src/habits.js';
import { readText } from './helpers/read-text.js';

/* The grammar is enumerated once per language and shared by the scans below. */
const enumerated = {};
const eachLine = (lang, fn) => {
  if (!enumerated[lang]) { enumerated[lang] = []; forEachLine(lang, l => enumerated[lang].push(l)); }
  enumerated[lang].forEach(fn);
  return enumerated[lang].length;
};

const MIN = 60000;
const DAY0 = Date.UTC(2026, 10, 13, 0, 0, 0); // arbitrary fixed instant; only differences matter
const at = (h, m = 0) => DAY0 + (h * 60 + m) * MIN;
const WINDOWS = [['fajr', 4.87, 6.17], ['dhuhr', 11.8, 15.3], ['asr', 15.3, 17.1], ['maghrib', 17.3, 18.5], ['isha', 18.5, 28.9]];
/* done: flags; ticks: minutes after the window start at which each done prayer was ticked (default 10) */
const fard = (done, ticks = {}) => WINDOWS.map(([key, s, e], i) => {
  const start = at(0) + s * 60 * MIN;
  return { key, start, end: at(0) + e * 60 * MIN, done: !!done[i], tickedAt: done[i] ? start + (ticks[key] ?? 10) * MIN : null, parts: done[i] ? [RAK[key]] : [], full: false };
});
const RAK = { fajr: 2, dhuhr: 4, asr: 4, maghrib: 3, isha: 4 };
const fmtEn = ms => { const d = new Date(ms); return `${d.getUTCHours() % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${d.getUTCHours() < 12 ? 'AM' : 'PM'}`; };
const fmtBn = ms => fmtEn(ms).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]).replace(' AM', ' সকাল').replace(' PM', ' বিকাল');
const ctx = (over = {}) => ({ lang: 'en', dateKey: '2026-11-13', now: at(10), friday: false, fard: fard([0, 0, 0, 0, 0]), habits: {}, fmt: over.lang === 'bn' ? fmtBn : fmtEn, ...over });
const line = over => progressLine(ctx(over));
const dateKeyN = d => `2027-${String(1 + (d % 12)).padStart(2, '0')}-${String(1 + (d % 28)).padStart(2, '0')}`;

/* Fajr ticked at 5:10 (window opens 4:52); times below are relative to that. */
const SCENES = {
  soonFirst: { now: at(4, 40), fard: fard([0, 0, 0, 0, 0]) },
  open: { now: at(12, 30), fard: fard([1, 0, 0, 0, 0]) },
  react: { now: at(5, 10), fard: fard([1, 0, 0, 0, 0]) },
  plain: { now: at(8), fard: fard([1, 0, 0, 0, 0]) },
  soon: { now: at(11, 40), fard: fard([1, 0, 0, 0, 0]) },
  all: { now: at(20), fard: fard([1, 1, 1, 1, 1]) }
};
const EXPECT = { soonFirst: 'soon', open: 'open', react: 'react', plain: 'plain', soon: 'soon', all: 'all' };

test('situations: reaction right after a tick, then plain facts, a heads-up only inside its window, window open, all done, and nothing', () => {
  for (const [name, scene] of Object.entries(SCENES)) assert.equal(line(scene)?.state, EXPECT[name], name);
  assert.equal(line({ now: at(3), fard: fard([0, 0, 0, 0, 0]) }), null, 'far before the first prayer: no line');
  assert.equal(line({ now: at(5), fard: fard([0, 0, 0, 0, 0]) }).state, 'open');
  assert.equal(line({ now: at(13), fard: fard([0, 0, 0, 0, 0]) }), null, 'nothing ticked and a window already closed: no line');
  assert.equal(line({ now: at(20), fard: fard([0, 0, 0, 0, 0]) }), null);
  // unticked prayers that already ended never change what is said
  assert.equal(line({ now: at(16), fard: fard([1, 0, 0, 0, 0]) }).state, 'open');
  assert.equal(line({ now: at(10), fard: fard([1, 0, 0, 0, 0]) }).state, 'plain');
});

test('the cycle after a tick: reaction (about 15 min), then plain facts, then the heads-up only in its window', () => {
  const f = fard([1, 0, 0, 0, 0]); // Fajr ticked 10 minutes after it opened (5:02)
  const tickAt = f[0].tickedAt;
  const state = now => line({ now, fard: f })?.state;
  assert.equal(state(tickAt), 'react');
  assert.equal(state(tickAt + (REACT_MINUTES - 1) * MIN), 'react');
  assert.equal(state(tickAt + REACT_MINUTES * MIN), 'plain');
  assert.equal(state(at(9)), 'plain');
  const lead = headsUpLead('dhuhr', '2026-11-13', {});
  assert.equal(state(f[1].start - (lead + 1) * MIN), 'plain');
  assert.equal(state(f[1].start - lead * MIN), 'soon');
  assert.equal(state(f[1].start - 1 * MIN), 'soon');
  assert.equal(state(f[1].start), 'open');
  // a new window opening ends the reaction early (the open state takes over)
  const g = fard([1, 0, 1, 0, 0], { asr: 3 });
  assert.equal(line({ now: g[2].start + 3 * MIN, fard: g }).state, 'react');
  const h = fard([1, 1, 0, 0, 0], { dhuhr: 205 });
  assert.equal(line({ now: h[1].tickedAt + 7 * MIN, fard: h })?.state, 'open', 'Asr opened since the tick');
  // old history without a tick time: never a reaction, just plain facts
  const old = fard([1, 0, 0, 0, 0]).map(p => ({ ...p, tickedAt: null }));
  assert.equal(line({ now: at(5, 5), fard: old }).state, 'plain');
});

/* ---------- hard rule 1: never mention what was missed ---------- */
const BAN_MISSED_EN = /\bmiss(?:ed|es|ing)?\b|\bgaps?\b|\bzero(?:es|s)?\b|no worries|it happens|catch(?:ing)? up|make[- ]?up|\bbehind\b|\bskipp?(?:ed|ing)?\b|\blate\b|overdue|\bqada\b|still time|no stress|that[’']s okay|easy does it|don[’']t worry|forgot|\bslip(?:s|ped)?\b|\bfail|\bsorry\b|\bshould\b|\bmust\b|\bhave to\b|\bneed to\b/i;
const BAN_MISSED_BN = /ছুটে|মিস|কাজা|বাদ পড়|বাদ গেছে|ফাঁক|শূন্য|জিরো|হয়ে যায়|চিন্তা নেই|ব্যাপার না|পুষিয়ে|ধরে ফেল|পিছিয়ে|দেরি|ভুলে|ঠিক আছে|এখনও সময়|গাফিলতি|অবহেলা/;
const strings = value => (typeof value === 'string' ? [value] : Object.values(value).flatMap(strings));

test('rule 1: no generated line in either language mentions missed prayers, gaps, zeros, “no worries”, “it happens”, “catch up” or similar', () => {
  for (const [lang, re] of [['en', BAN_MISSED_EN], ['bn', BAN_MISSED_BN]]) {
    let n = 0;
    eachLine(lang, ({ text }) => { n++; assert.doesNotMatch(text, re, text); });
    assert.ok(n > 0, `${lang}: scanned ${n} lines`);
    for (const t of strings(LINE_LEXICON[lang])) assert.doesNotMatch(t, re, t);
  }
  const lex = Object.keys(LINE_LEXICON.en);
  assert.ok(!lex.some(k => /missed/i.test(k)), 'the “missed” template family is gone');
  assert.ok(!Object.keys(LINE_LEXICON.bn).some(k => /missed/i.test(k)));
  assert.doesNotMatch(readText('../src/progress-lines.js', import.meta.url), /missedLast|missedOpen|state: 'missed'/);
});

test('rule 1 end to end: a day with unticked prayers never produces a “missed” line, whatever the situation', () => {
  for (const lang of ['en', 'bn']) for (const done of [[1, 0, 0, 0, 0], [1, 0, 1, 0, 0], [0, 1, 0, 0, 1], [1, 1, 0, 0, 0], [0, 0, 1, 1, 1]]) {
    for (let m = 0; m < 1440; m += 7) {
      const l = progressLine({ ...ctx({ lang }), now: at(0) + m * MIN, fard: fard(done) });
      if (l) assert.doesNotMatch(l.text, lang === 'en' ? BAN_MISSED_EN : BAN_MISSED_BN, l.text);
    }
  }
});

/* ---------- hard rule 2: no heads-up straight after a tick; heads-ups only inside their window ---------- */
const NEXTISH_EN = /\bnext up\b|around the corner|\bnext\b|coming up|heads[- ]?up|not long now|\bsoon\b|\bshortly\b|nearly here|almost time|on its way|up next/i;
const NEXTISH_BN = /এরপর|পরেরটা|একটু পরেই|খানিক পরে|আসছে|এসে পড়ছে|এগিয়ে আসছে|প্রায় .*সময়|খেয়াল করুন|জেনে রাখুন|মনে রাখুন/;

test('rule 2: reaction and plain lines never look ahead (no “Next up”, no “around the corner”, no other prayer’s name or time)', () => {
  for (const lang of ['en', 'bn']) {
    let n = 0;
    eachLine(lang, ({ state, text }) => {
      if (state !== 'react' && state !== 'plain') return;
      n++;
      assert.doesNotMatch(text, lang === 'en' ? NEXTISH_EN : NEXTISH_BN, text);
      assert.doesNotMatch(text, /around the corner|Next up|পরবর্তী|এরপর/, text);
      const others = SLOT_KEYS.map(k => (lang === 'en' ? NAMES.en[k] : NAMES.bn[k].nom));
      const mentioned = others.filter(nm => text.includes(nm));
      assert.ok(mentioned.length <= 1, `${text} mentions ${mentioned}`);
    });
    assert.ok(n > 100);
  }
  for (const key of ['react', 'plain']) for (const lang of ['en', 'bn']) {
    const l = progressLine({ ...ctx({ lang }), ...SCENES[key], dateKey: '2026-11-14' });
    assert.ok(l && l.state === key);
    assert.doesNotMatch(l.text, /\d{1,2}:\d{2}|[০-৯]{1,2}:[০-৯]{2}/, 'no next-prayer time inside a reaction or plain line');
  }
});
const SLOT_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah'];

test('rule 2: a plain progress line states what was ticked (“Fajr done, 2 + 2, full set”)', () => {
  const f = fard([1, 0, 0, 0, 0]).map(p => (p.key === 'fajr' ? { ...p, parts: [2, 2], full: true } : p));
  const seen = new Set();
  for (let d = 1; d <= 80; d++) seen.add(progressLine({ ...ctx({ now: at(8), fard: f }), dateKey: dateKeyN(d) }).text);
  assert.ok([...seen].some(t => /^Fajr done, 2 \+ 2, full set\./.test(t)) || [...seen].some(t => /Fajr.*2 \+ 2.*(full set|every part|all parts)/i.test(t)));
  assert.ok([...seen].every(t => /Fajr/.test(t) && /2 \+ 2/.test(t)));
  const bn = new Set();
  for (let d = 1; d <= 40; d++) bn.add(progressLine({ ...ctx({ lang: 'bn', now: at(8), fard: f }), dateKey: dateKeyN(d) }).text);
  assert.ok([...bn].every(t => /ফজর/.test(t) && /২ \+ ২/.test(t)));
  const partial = fard([1, 0, 0, 0, 0]).map(p => (p.key === 'fajr' ? { ...p, parts: [2, 2], full: false } : p));
  assert.ok(![...new Set(Array.from({ length: 60 }, (_, d) => progressLine({ ...ctx({ now: at(8), fard: partial }), dateKey: dateKeyN(d) }).text))].some(t => /full set|every part|all parts|whole set/i.test(t)));
});

test('rule 2: the heads-up window is 20–45 minutes by default and shortens for people who tick late', () => {
  for (let d = 1; d <= 120; d++) for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
    const lead = headsUpLead(key, dateKeyN(d), {});
    assert.ok(lead >= HEADS_UP_RANGE[0] && lead <= HEADS_UP_RANGE[1], `${lead}`);
  }
  const defaults = new Set(Array.from({ length: 120 }, (_, d) => headsUpLead('asr', dateKeyN(d), {})));
  assert.ok(defaults.size > 10, 'varies with the day');
  for (let d = 1; d <= 60; d++) {
    const base = headsUpLead('dhuhr', dateKeyN(d), {});
    const late = headsUpLead('dhuhr', dateKeyN(d), { usualOffset: { dhuhr: 30 } });
    assert.ok(late <= base && late >= 12);
    assert.equal(headsUpLead('dhuhr', dateKeyN(d), { usualOffset: { dhuhr: 3 } }), base, 'prompt tickers keep the default');
  }
});

test('rule 2 (day simulation): across a whole day no heads-up appears outside its window, in any state, language or habit', () => {
  const profiles = {
    plain: {}, prompt: { usualOffset: { fajr: 4, dhuhr: 5, asr: 3, maghrib: 2, isha: 4 } }, late: { usualOffset: { fajr: 40, dhuhr: 35, asr: 30, maghrib: 25, isha: 40 } },
    batch: { batch: true }, rare: { historyDays: 10, strength: { dhuhr: 'rare', asr: 'rare', maghrib: 'rare', isha: 'rare', fajr: 'rare' } }
  };
  const tickPatterns = [[1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0], [1, 1, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0]];
  let soonLines = 0, minutes = 0;
  for (const [pname, habits] of Object.entries(profiles)) for (const lang of ['en', 'bn']) for (const done of tickPatterns) for (const dateKey of ['2026-11-13', '2026-11-14', '2027-03-05']) {
    const f = fard(done, { fajr: 8, dhuhr: 20, asr: 12, maghrib: 5, isha: 30 });
    for (let m = 0; m < 24 * 60; m += 5) {
      const now = at(0) + m * MIN; minutes++;
      const l = progressLine({ ...ctx({ lang }), dateKey, now, fard: f, habits });
      if (!l) continue;
      const c = determine({ now, fard: f, habits, dateKey });
      if (l.state === 'soon') {
        soonLines++;
        const next = f.find(p => p.start > now);
        assert.ok(next, 'a heads-up needs a next prayer');
        const lead = headsUpLead(next.key, dateKey, habits);
        assert.ok(next.start - now <= lead * MIN && next.start - now > 0, `${pname} ${lang}: heads-up ${Math.round((next.start - now) / MIN)} min before ${next.key}, window ${lead}`);
        assert.ok(lead <= 45);
        assert.ok(!habits.batch, 'no time-based heads-ups for batch tickers');
        if (habits.strength) assert.fail('no heads-up for rarely ticked prayers');
        assert.ok(!(f.some(p => p.done && p.tickedAt <= now && now - p.tickedAt < REACT_MINUTES * MIN && !f.some(q => q.start > p.tickedAt && q.start <= now))), 'never during a reaction');
      } else if (l.state !== 'open') {
        assert.doesNotMatch(l.text, lang === 'en' ? /around the corner|Next up|heads[- ]?up/i : /এসে পড়ছে|খেয়াল করুন/, l.text);
      }
      assert.equal(c.state, l.state);
    }
  }
  assert.ok(soonLines > 100, `${soonLines} heads-up minutes across ${minutes}`);
});

test('rule 2: batch tickers and rarely ticked prayers get no time-based heads-ups at all', () => {
  const f = fard([1, 0, 0, 0, 0]);
  const lead = headsUpLead('dhuhr', '2026-11-13', {});
  const t = f[1].start - Math.min(lead - 1, 10) * MIN;
  assert.equal(line({ now: t, fard: f, habits: {} }).state, 'soon');
  assert.equal(line({ now: t, fard: f, habits: { batch: true } }).state, 'plain');
  assert.equal(line({ now: t, fard: f, habits: { historyDays: 10, strength: { dhuhr: 'rare' } } }).state, 'plain');
  assert.equal(line({ now: t, fard: f, habits: { historyDays: 3, strength: { dhuhr: 'rare' } } }).state, 'soon', 'too little data: general behaviour');
  assert.equal(line({ now: at(4, 30), fard: fard([0, 0, 0, 0, 0]), habits: { batch: true } }), null);
});

test('rule 2: Duha/Awwabin get a heads-up only shortly before they open, and never for batch tickers', () => {
  const sugg = (phase, extra = {}) => progressLine({ ...ctx({ now: at(8), fard: fard([1, 0, 0, 0, 0]) }), suggestion: { name: { en: 'Duha', bn: 'দুহা' }, phase }, ...extra });
  const soon = sugg('soon'), open = sugg('open');
  assert.match(soon.text, /Duha/); assert.match(open.text, /Duha/);
  assert.match(soon.text, /opens|about to open|coming up shortly/i);
  assert.match(open.text, /is open|window is open|open now/i);
  assert.equal(soon.suggested, true);
  const batch = sugg('soon', { habits: { batch: true } });
  assert.doesNotMatch(batch.text, /Duha/); assert.equal(batch.suggested, false);
  // never inside a reaction or a prayer heads-up
  assert.doesNotMatch(progressLine({ ...ctx(SCENES.react), suggestion: { name: { en: 'Duha', bn: 'দুহা' }, phase: 'open' } }).text, /Duha/);
  assert.doesNotMatch(progressLine({ ...ctx(SCENES.soon), suggestion: { name: { en: 'Duha', bn: 'দুহা' }, phase: 'soon' } }).text, /Duha/);
  const app = readText('../src/app.js', import.meta.url);
  assert.match(app, /now\.getTime\(\) >= e\.start\.getTime\(\) - VOLUNTARY_HEADS_UP_MINUTES \* 60000/);
  assert.equal(VOLUNTARY_HEADS_UP_MINUTES, 10);
});

/* ---------- variety and wording hygiene (no clichés, God/Prophet, “ring”, repeated words) ---------- */
const CLICHE_EN = /clean slate|blessed start|new chapter|fresh start|rise and shine|game changer|journey|you got this|proud of you|keep shining|day complete|sleep well|rest easy|goodnight|good night|sweet dreams/i;
const CLICHE_BN = /পরিষ্কার স্লেট|ধন্য|যাত্রা|ঘুমিয়ে|শুভরাত্রি|শুভ রাত্রি|বিশ্রাম|দিন সম্পূর্ণ/;
const GOD_EN = /\bAllah\b|\bGod\b|Prophet|Muhammad|\bSAW\b|ﷺ|Qur|Quran|hadith|Bukhari|Muslim|surah|ayah|\bring\b|\brings\b|\d of \d|\d\/\d|%|percent|streak|yesterday|welcome back/i;
const GOD_BN = /আল্লাহ|নবী|রাসূল|কুরআন|হাদিস|আয়াত|সূরা|ﷺ|রিং|গতকাল|শতাংশ|স্বাগতম|%/;

test('v1.3.4 Bangla is natural spoken চলিত: no literal-translation joins, no সালাত or stiff words in generated lines', () => {
  const BAD = [/অংশ টিক/, /প্রতিটি অংশ\s*[.।]?$/, /সালাত/, /সম্পন্ন/, /ইভেন্ট/, /মুহূর্তে সালাত/];
  eachLine('bn', ({ text }) => { for (const re of BAD) assert.doesNotMatch(text, re, text); });
  const joined = []; eachLine('bn', ({ text }) => { if (/অংশে টিক পড়েছে/.test(text)) joined.push(text); });
  assert.ok(joined.length > 0, 'the fixed phrase সবগুলো অংশে টিক পড়েছে is generated');
  const lexicon = JSON.stringify(LINE_LEXICON.bn);
  assert.match(lexicon, /এখন \{P:gen\} সময়/, 'এখন এই নামাজের সময় style');
  assert.ok(!/সবগুলো অংশ টিক/.test(lexicon));
});

test('variety: the grammar is wide — many sentence patterns per situation and plenty of alternatives', () => {
  for (const lang of ['en', 'bn']) {
    const L = LINE_LEXICON[lang];
    const width = list => list.reduce((total, x) => total + expand(x).length, 0);
    assert.ok(width(L.doneLead) >= 40, `${lang} doneLead ${width(L.doneLead)}`);
    for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah']) {
      assert.ok(width(L.warm[key]) >= 20, `${lang} warm ${key}`);
      assert.ok(width(L.soonTail[key]) >= 15, `${lang} soon ${key}`);
      assert.ok(width(L.openTail[key]) >= 10, `${lang} open ${key}`);
    }
    assert.ok(width(L.warm.any) >= 40);
    assert.ok(width(L.soonLead) >= 20 && width(L.openLead) >= 20 && width(L.allLead) >= 20 && width(L.closer) >= 10);
  }
});

test('the enumerated grammar has no near-duplicates (distinct after normalising case, punctuation, spacing and digits)', () => {
  assert.equal(normalizeLine('Fajr done, 2 + 2.'), normalizeLine('fajr done 4 + 3'));
  assert.equal(normalizeLine('ফজর, ২ রাকাত।'), normalizeLine('ফজর ৪ রাকাত'));
  for (const lang of ['en', 'bn']) {
    const seen = new Set();
    let n = 0;
    eachLine(lang, ({ text }) => { const k = normalizeLine(text); assert.ok(!seen.has(k), text); seen.add(k); n++; });
    assert.equal(n, variantCount(lang));
    assert.equal(seen.size, n);
    assert.ok(n > 0);
  }
  assert.deepEqual(expand('a [b|c] d'), ['a b d', 'a c d']);
  assert.deepEqual(expand('x[| y]'), ['x', 'x y']);
});

test('every enumerated line is natural and short, with no repeated word, no God/Prophet, no “ring”, no clichés, no “sleep well”', () => {
  for (const lang of ['en', 'bn']) {
    let longest = 0;
    eachLine(lang, ({ text }) => {
      assert.equal(repeatsWord(text, lang), false, text);
      assert.doesNotMatch(text, lang === 'en' ? CLICHE_EN : CLICHE_BN, text);
      assert.doesNotMatch(text, lang === 'en' ? GOD_EN : GOD_BN, text);
      assert.doesNotMatch(text, /\s{2,}|\s[,.:;?!।]|\[|\]|\{|\}|\|/, text);
      assert.match(text, lang === 'en' ? /[.?!]$/ : /[।?]$/, text);
      longest = Math.max(longest, text.length);
    });
    assert.ok(longest <= (lang === 'en' ? 100 : 118), `${lang} longest ${longest}`);
  }
});

test('Bangla is lived-in spoken চলিত in one consistent আপনি register', () => {
  const SADHU = /করিয়া|হইয়া|হইল|হইবে|করিবেন|যাইবে|দেখিয়া|বলিয়া|আসিয়া|পড়িয়া|লইয়া|তাহা|তাঁহা|ইহা|উহা|যদ্যপি|অতএব|নিম্নে|সম্পাদন/;
  const TUMI = /তুমি|তোমার|তোমাকে|তোমরা|তুই|তোর|করো\b|পড়ো\b|নাও\b|যাও\b|এসো\b|বসো\b|থাকো\b|রাখো\b|দাও\b|করবে\b|পড়বে\b|যাবে না\b|দেখো\b/;
  for (const lang of ['bn']) {
    eachLine(lang, ({ text }) => {
      assert.doesNotMatch(text, SADHU, text);
      assert.doesNotMatch(text, TUMI, text);
      assert.doesNotMatch(text, /[A-Za-z0-9]/, text);
    });
  }
  for (const t of strings(LINE_LEXICON.bn)) { assert.doesNotMatch(t, SADHU, t); assert.doesNotMatch(t, TUMI, t); }
});

test('bilingual: English is Latin, Bangla is Bengali with Bengali digits and no Latin letters or digits', () => {
  for (const scene of Object.values(SCENES)) {
    const en = line(scene), bn = line({ ...scene, lang: 'bn' });
    assert.ok(en && bn);
    assert.match(en.text, /[A-Za-z]/);
    assert.match(bn.text, /[\u0980-\u09FF]/);
    assert.doesNotMatch(bn.text, /[A-Za-z0-9]/, bn.text);
  }
});

test('no citations, no scripture, no God or Prophet, no “ring”, no counts of what is left, in any template', () => {
  for (const lang of ['en', 'bn']) for (const text of strings(LINE_LEXICON[lang])) assert.doesNotMatch(text, lang === 'en' ? GOD_EN : GOD_BN, text);
});

test('after the last prayer there is no “sleep well” or “day complete” (the night prayer may still follow)', () => {
  for (const lang of ['en', 'bn']) {
    const flat = JSON.stringify([LINE_LEXICON[lang].allLead, LINE_LEXICON[lang].allTail, LINE_LEXICON[lang].allMore, LINE_LEXICON[lang].warm.isha, LINE_LEXICON[lang].closer]);
    assert.doesNotMatch(flat, /sleep|rest easy|day complete|ঘুম|বিশ্রাম/i);
  }
});

test('live lines: no word repeated, short, deterministic; different dates rotate through many lines', () => {
  for (const [name, scene] of Object.entries(SCENES)) for (const lang of ['en', 'bn']) {
    assert.deepEqual(line({ ...scene, lang }), line({ ...scene, lang }));
    const seen = new Set();
    for (let d = 1; d <= 30; d++) {
      const l = progressLine({ ...ctx({ ...scene, lang }), dateKey: `2026-12-${String(d).padStart(2, '0')}` });
      assert.equal(repeatsWord(l.text, lang), false, l.text);
      assert.ok(l.text.length <= (lang === 'en' ? 120 : 140), `${lang} ${name} ${l.text.length}: ${l.text}`);
      seen.add(l.text);
    }
    assert.ok(seen.size >= (name === 'plain' ? 5 : 15), `${lang} ${name}: ${seen.size} distinct lines in 30 days`);
  }
});

test('memory keeps lines fresh for weeks and locks the line between events', () => {
  const scene = SCENES.react;
  let memory = { recent: [], current: null };
  const shown = [], texts = [];
  for (let d = 1; d <= 40; d++) {
    const c = { ...ctx(scene), dateKey: `2027-01-${String(d).padStart(2, '0')}`, memory };
    const l = progressLine(c);
    // same event again (a re-render): the same line
    assert.equal(progressLine({ ...c, memory: { ...memory, current: { sig: l.sig, id: l.id } } }).text, l.text);
    memory = { recent: [...memory.recent, l.id].slice(-80), current: { sig: l.sig, id: l.id } };
    shown.push(l.id); texts.push(l.text);
  }
  for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < Math.min(shown.length, i + 21); j++) assert.notEqual(texts[i], texts[j], `line repeated within ${j - i} days`);
});

test('Friday: Dhuhr reads as Jumu‘ah, and no rak‘ah count is claimed for it', () => {
  const friday = (state, lang) => progressLine({ ...ctx({ now: state.now, fard: state.fard, lang }), friday: true });
  assert.match(friday({ now: at(12, 30), fard: fard([1, 0, 0, 0, 0]) }, 'en').text, /Jumu‘ah/);
  assert.match(friday({ now: at(12, 30), fard: fard([1, 0, 0, 0, 0]) }, 'bn').text, /জুমা/);
  for (let d = 1; d <= 60; d++) {
    for (const now of [at(15, 40), at(18, 5)]) {
      const l = progressLine({ ...ctx({ now, fard: fard([1, 1, 0, 0, 0]) }), friday: true, dateKey: `2027-02-${String(1 + d % 28).padStart(2, '0')}-x${d}` });
      if (l) assert.doesNotMatch(l.text.replace(/\d+:\d+ [AP]M/g, ''), /\d/, 'no rak‘ah digits for Jumu‘ah');
    }
  }
  const done = progressLine({ ...ctx({ now: at(15, 35), fard: fard([1, 1, 0, 0, 0]) }), friday: true, dateKey: '2027-02-05' });
  assert.ok(!/Dhuhr/.test(done.text), done.text);
});

test('rak‘ah counts follow the Fard (Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, Isha 4) and only what was done is counted', () => {
  const lines = new Set();
  for (let d = 1; d <= 120; d++) lines.add(progressLine({ ...ctx({ now: at(17, 40), fard: fard([0, 0, 0, 1, 0]) }), dateKey: `2027-03-${String(1 + d % 28).padStart(2, '0')}-${d}` }).text);
  assert.ok([...lines].some(t => /Maghrib, 3 rak‘ah/.test(t)));
  assert.ok(![...lines].some(t => /Maghrib, [^3] rak‘ah/.test(t)));
});

test('positive milestones only; trend only when it is up', () => {
  const all = { now: at(20), fard: fard([1, 1, 1, 1, 1]) };
  const lines = new Set();
  for (let d = 1; d <= 80; d++) lines.add(progressLine({ ...ctx(all), dateKey: `2027-04-${String(1 + d % 28).padStart(2, '0')}-${d}`, habits: { streak: 3, trendUp: true, firstAll: true, sunnahMore: true } }).text);
  const joined = [...lines].join(' | ');
  assert.match(joined, /3 days running with the full set/);
  assert.match(joined, /More prayers in than this time last week/);
  assert.match(joined, /First time for the full set/);
  assert.match(joined, /More Sunnah in than last week/);
  const plain = new Set();
  for (let d = 1; d <= 40; d++) plain.add(progressLine({ ...ctx(all), dateKey: `2027-05-${String(1 + d % 28).padStart(2, '0')}-${d}`, habits: { streak: 1, trendUp: false } }).text);
  assert.doesNotMatch([...plain].join(' '), /running|last week|First time/);
});

/* ---------- behaviour learning ---------- */
const hist = (days, make) => Object.fromEntries(Array.from({ length: days }, (_, i) => [addDaysKey('2026-11-13', -(i + 1)), make(i)]));

test('learning: habit strength, usual time, batch tickers, trend, streak (only counts what was done)', () => {
  assert.deepEqual(['habit', 'occasional', 'rare', 'new'], [strengthOf(12), strengthOf(6), strengthOf(2), strengthOf(0)]);
  const regular = hist(14, i => ({ fard: { fajr: true, dhuhr: i % 3 === 0, asr: true }, at: { 'fard:fajr': [10 + (i % 3), 300], 'fard:asr': [20, 960] } }));
  const h = analyzeHabits(regular, '2026-11-13');
  assert.equal(h.strength.fajr, 'habit');
  assert.equal(h.strength.maghrib, 'new');
  assert.ok(h.usualOffset.fajr >= 10 && h.usualOffset.fajr <= 12);
  assert.equal(h.usualOffset.dhuhr, null, 'no usual time without enough samples');
  assert.equal(h.batch, false);
  const batch = hist(7, () => ({ fard: { dhuhr: true, asr: true, maghrib: true, isha: true }, at: { 'fard:dhuhr': [300, 1200], 'fard:asr': [200, 1203], 'fard:maghrib': [60, 1205], 'fard:isha': [10, 1207] } }));
  assert.equal(analyzeHabits(batch, '2026-11-13').batch, true);
  const up = { ...hist(7, () => ({ fard: { fajr: true } })), ...Object.fromEntries(Array.from({ length: 7 }, (_, i) => [addDaysKey('2026-11-13', -(i + 8)), { fard: { fajr: i < 3 } }])) };
  assert.equal(analyzeHabits(up, '2026-11-13').trendUp, true);
  assert.equal(analyzeHabits({}, '2026-11-13').trendUp, false, 'no data: no trend');
  const five = hist(3, () => ({ fard: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } }));
  five['2026-11-13'] = five[addDaysKey('2026-11-13', -1)];
  assert.equal(analyzeHabits(five, '2026-11-13').streak, 4);
  assert.equal(analyzeHabits({}, '2026-11-13').historyDays, 0, 'a reset history resets what is learned');
});

test('suggestions: Sunnah/Nafl only, rare, never two days running, picks the one nearest to a habit, skipped yesterday', () => {
  const cand = [{ kind: 'voluntary', key: 'duha', name: { en: 'Duha', bn: 'দুহা' } }, { kind: 'voluntary', key: 'awwabin', name: { en: 'Awwabin', bn: 'আওয়াবিন' } }, { kind: 'voluntary', key: 'tahajjud', name: { en: 'Tahajjud', bn: 'তাহাজ্জুদ' } }];
  const history = hist(8, i => ({ fard: {}, voluntary: { duha: i >= 1 && i < 5, awwabin: (i >= 2 && i < 4) || i === 6, tahajjud: true } }));
  history[addDaysKey('2026-11-13', -1)] = { fard: {}, voluntary: {} };
  const pick = (memory = {}, c = cand, h = history) => pickSuggestion({ candidates: c, history: h, todayKey: '2026-11-13', memory });
  assert.equal(pick().key, 'duha', 'closest to a habit (4 of 7)');
  assert.notEqual(pick().key, 'tahajjud');
  assert.equal(pick({ day: '2026-11-12', key: 'duha' }), null, 'never two days running');
  assert.equal(pick({ day: '2026-11-11', key: 'duha' }), null, 'at most once every few days');
  assert.equal(pick({ day: '2026-11-09', key: 'duha' }).key, 'duha');
  assert.equal(pick({ day: '2026-11-13', key: 'duha' }).key, 'duha', 'keeps showing the same day until ticked');
  assert.equal(pickSuggestion({ candidates: cand, history: { ...history, '2026-11-13': { voluntary: { duha: true } } }, todayKey: '2026-11-13', memory: { day: '2026-11-13', key: 'duha' } }), null, 'disappears when ticked');
  assert.equal(pick({}, cand.slice(2)), null, 'Tahajjud is never suggested');
  assert.equal(pickSuggestion({ candidates: cand, history, todayKey: '2026-11-13', memory: {}, shia: true }), null, 'Ja‘fari: no Duha/Awwabin');
  const yesterdayDone = { ...history, [addDaysKey('2026-11-13', -1)]: { voluntary: { duha: true, awwabin: true } } };
  assert.equal(pick({}, cand, yesterdayDone), null, 'only if skipped yesterday');
  const l = progressLine({ ...ctx(SCENES.plain), suggestion: { name: { en: 'Duha', bn: 'দুহা' }, phase: 'open' } });
  assert.match(l.text, /Duha/);
  assert.equal(l.suggested, true);
});

test('template realization resolves Bangla name forms and trims stray spaces', () => {
  assert.equal(realize('{P:gen} সময় {T}।', { P: 'isha', T: 'রাত ৬:৩০' }, 'bn'), 'ইশার সময় রাত ৬:৩০।');
  assert.equal(realize('{P}’s at {T} .', { P: 'asr', T: '3:37 PM' }, 'en'), 'Asr’s at 3:37 PM.');
});

test('the card wiring: date headline first, else the conversational line, remembered per situation; ticks record their time', () => {
  const app = readText('../src/app.js', import.meta.url);
  assert.match(app, /const LINE_MEMORY_KEY = 'prayer-times-line-memory'/);
  assert.match(app, /\.slice\(-80\)/, 'memory is capped');
  assert.match(app, /memory\.current\.sig !== result\.sig/);
  assert.match(app, /\(record\.at \|\| \(record\.at = \{\}\)\)\[`\$\{kind\}:\$\{key\}`\] = \[/);
  assert.match(app, /if \(record\.at\) delete record\.at\[`\$\{kind\}:\$\{key\}`\];/);
  assert.match(app, /for \(let lead = 20; lead <= 45; lead \+= 5\)/, 'the line re-renders at its heads-up moments (the 20-45 minute window)');
  assert.match(app, /tickedAt: Array\.isArray\(at\)/, 'the reaction knows when the prayer was ticked');
  assert.match(app, /statusEl\.hidden = !statusEl\.textContent;/, 'no line on days with nothing ticked');
});

/* ---------- v1.3.3: a new line each time the window is shown again ---------- */
test('reopen: a refresh picks a NEW line for the same situation, never the one on screen, in every scene and both languages', () => {
  for (const lang of ['en', 'bn']) for (const [name, scene] of Object.entries(SCENES)) for (let d = 1; d <= 25; d++) {
    let memory = { recent: [], current: null };
    let shown = progressLine({ ...ctx({ ...scene, lang }), dateKey: dateKeyN(d), memory });
    memory = { recent: [shown.id], current: { sig: shown.sig, id: shown.id } };
    for (let reopen = 1; reopen <= 6; reopen++) {
      const next = progressLine({ ...ctx({ ...scene, lang }), dateKey: dateKeyN(d), memory, refresh: reopen });
      assert.notEqual(next.id, shown.id, `${lang}/${name}/${d}: reopen ${reopen} repeated the line on screen`);
      assert.equal(next.state, shown.state, 'stays accurate to the current progress state');
      assert.equal(next.sig, shown.sig, 'same situation, so the lock key is unchanged');
      memory = { recent: [...memory.recent, next.id].slice(-80), current: { sig: next.sig, id: next.id } };
      shown = next;
    }
  }
});

test('reopen: the new line is then locked (no change while the window stays visible), and without a refresh nothing changes', () => {
  const memory = { recent: [], current: null };
  const first = progressLine({ ...ctx(SCENES.plain), memory });
  const mem1 = { recent: [first.id], current: { sig: first.sig, id: first.id } };
  const next = progressLine({ ...ctx(SCENES.plain), memory: mem1, refresh: 1 });
  const mem2 = { recent: [first.id, next.id], current: { sig: next.sig, id: next.id } };
  for (let i = 0; i < 5; i++) assert.equal(progressLine({ ...ctx(SCENES.plain), memory: mem2 }).text, next.text, 'locked between events');
  assert.equal(progressLine({ ...ctx(SCENES.plain), memory: mem1 }).text, first.text, 'refresh 0 keeps the locked line');
});

test('reopen: reproducible (same seed and refresh number give the same line) and the recent-lines memory is respected where possible', () => {
  const memory = { recent: [], current: null };
  const first = progressLine({ ...ctx(SCENES.plain), memory });
  const mem = { recent: [first.id], current: { sig: first.sig, id: first.id } };
  const a = progressLine({ ...ctx(SCENES.plain), memory: mem, refresh: 3 }), b = progressLine({ ...ctx(SCENES.plain), memory: mem, refresh: 3 });
  assert.deepEqual(a, b);
  // across many reopens the lines do not cycle back to an immediately previous line, and variety is high
  const seen = new Set(); let m = mem, prev = first.id;
  for (let r = 1; r <= 40; r++) {
    const l = progressLine({ ...ctx(SCENES.plain), memory: m, refresh: r });
    assert.notEqual(l.id, prev); seen.add(l.id); prev = l.id;
    m = { recent: [...m.recent, l.id].slice(-80), current: { sig: l.sig, id: l.id } };
  }
  assert.ok(seen.size >= 30, `variety across 40 reopens: ${seen.size}`);
});

test('reopen wiring: Rust emits shown/hidden, the page handles Rust events AND visibilitychange/focus, one new line per reopen', () => {
  const app = readText('../src/app.js', import.meta.url);
  const rust = readText('../src-tauri/src/main.rs', import.meta.url);
  assert.match(rust, /fn show_main_window\(app: &tauri::AppHandle\)/);
  assert.match(rust, /app\.emit\("main-window-shown", \(\)\)/);
  assert.match(rust, /emit\("main-window-hidden", \(\)\)/);
  assert.equal((rust.match(/show_main_window\(/g) || []).length, 4, 'tray click, tray menu, second launch + the definition');
  assert.match(rust, /Emitter, Manager,/);
  assert.match(rust, /was_showing[\s\S]*if !was_showing \{\s+let _ = app\.emit\("main-window-shown"/, 'a click on an already visible window does not count as a reopen');
  assert.match(app, /listen\('main-window-shown', \(\) => onWindowReopened\('rust'\)\)/);
  assert.match(app, /listen\('main-window-hidden', \(\) => \{ windowWasHidden = true; \}\)/);
  assert.match(app, /onWindowReopened\('visibility'\);[^\n]*\n\s+render\(\);/, 'the new line is chosen before render() re-reads the lock');
  assert.match(app, /window\.addEventListener\('focus', \(\) => onWindowReopened\('focus'\)\)/);
  assert.match(app, /if \(source !== 'rust' && !windowWasHidden\) return;/, 'ordinary focus while visible never changes the line');
  assert.match(app, /if \(now - lastReopenAt < 2000\) return;/, 'several signals for one reopen choose one line');
  assert.match(app, /refresh: pendingLineRefresh/);
  assert.match(app, /memory\.current\.id !== result\.id/, 'the new line replaces the lock and joins the recent memory');
  const capability = JSON.parse(readText('../src-tauri/capabilities/default.json', import.meta.url));
  assert.ok(capability.permissions.includes('core:default'), 'core:default carries core:event:default (listen)');
});
