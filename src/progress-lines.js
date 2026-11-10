/* Today's Progress status line (v1.3.2): short, warm, everyday lines that
   acknowledge what is done. Never guilt, never a word about what was missed, no
   scripture citations, no mention of God or the Prophet. Generated offline by a
   small NLG pipeline:
     1. content determination: ctx -> one situation                (determine)
        react   right after a tick (first few minutes): a warm reaction
        plain   afterwards: plain progress facts only ("Fajr done, 2 + 2, full set")
        soon    a heads-up for the next prayer, only inside its window (learned)
        open    a prayer's window is open
        all     all five are in
     2. sentence plan: an ordered list of slots per situation        (planFor)
     3. surface realization: every slot holds templates with inline alternatives
        "[a|b|c]" (synonyms, phrasings) expanded once, then placeholders are
        resolved from a feature structure with per-language grammar (the Bangla
        genitive, time strings, rak'ah counts)                        (expand, realize)
   Choice is deterministic: one seeded, recency-weighted pick per slot, retried
   until the whole line passes the checks (no repeated word, short). Pure and
   unit-tested; `forEachLine` enumerates every line the grammar can produce. */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnNum = v => String(v).replace(/[0-9]/g, d => BN_DIGITS[d]);

/* ---------- lexicon ---------- */
export const NAMES = {
  en: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', jumuah: 'Jumu‘ah' },
  bn: {
    fajr: { nom: 'ফজর', gen: 'ফজরের' }, dhuhr: { nom: 'যোহর', gen: 'যোহরের' }, asr: { nom: 'আসর', gen: 'আসরের' },
    maghrib: { nom: 'মাগরিব', gen: 'মাগরিবের' }, isha: { nom: 'ইশা', gen: 'ইশার' }, jumuah: { nom: 'জুমা', gen: 'জুমার' }
  }
};
const KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const SLOT_KEYS = [...KEYS, 'jumuah'];
const RAKAH = { fajr: 2, dhuhr: 4, asr: 4, maghrib: 3, isha: 4 };

/* A reaction lasts this long after a tick, unless a new prayer window opens first. */
export const REACT_MINUTES = 15;
/* The heads-up for the next prayer: a default window of 20-45 minutes before it, shortened
   for people who usually tick late (learned from their own history, see habits.js). */
export const HEADS_UP_RANGE = [20, 45];
export const VOLUNTARY_HEADS_UP_MINUTES = 10;

/* Templates: "[a|b|c]" are interchangeable alternatives (an empty one makes a phrase optional);
   {P} next prayer, {O} open prayer, {D} prayer just done, {T} start time, {E} end time,
   {n} rak‘ah of the prayer, {sum} ticked parts such as "2 + 2", {V} a voluntary prayer. */
const EN = {
  /* react: right after a tick */
  doneLead: [
    '{D} [done|ticked off|checked off|sorted|in].',
    '{D} is [done|in|ticked off|sorted|checked off].',
    '[Nice|Good|Lovely|Well done|Great], {D} is [done|in|ticked off].',
    '[Nice|Good|Lovely|Great], {D}’s [done|in|sorted].',
    'That’s {D} [done|ticked|in|sorted].',
    '{D}, {n} rak‘ah, [done|in|ticked off].',
    '{D} done, {n} rak‘ah [in|down|ticked].',
    '[Done|Ticked|Logged]: {D}.',
    'You’ve [done|ticked off|finished] {D}.'
  ],
  warm: {
    fajr: [
      '[Done|Finished|Sorted] before [the world|the street|the whole house|the city] [woke up|was awake|got going].',
      '[Nice|Calm|Good|Strong] start to the day.',
      'That’s a [strong|calm|quiet|good] morning.',
      'The [hardest|toughest] one is [in|done|sorted].',
      '[Early|Quiet|Calm|Steady] and [calm|steady|easy].',
      'The day [starts|begins] [well|on a calm note|on a steady note].',
      '[Early|Morning] light, [well used|well spent].'
    ],
    dhuhr: [
      'Midday [sorted|handled|taken care of|covered].',
      '[Good|Smart|Nice] use of a [break|pause|breather].',
      '[Lunch|Lunch break] [tastes|feels] [better|nicer] now.',
      '[Steady|Calm|Even] [through|across|in] the middle of the day.',
      'A [nice|good|calm|quiet] pause in a busy day.',
      '[Middle|Heart] of the day, [handled|sorted|covered].'
    ],
    asr: [
      'Afternoon [slump|dip|drowsiness] [beaten|handled|sorted].',
      '[Good|Nice|Smart] [reset|break|pause].',
      '[Evening|Sunset|Dinner time] feels [closer|nearer] now.',
      'You stepped away, [well done|nice one|good call].',
      'The busy stretch is [done|over|through].',
      'Afternoon [handled|covered|sorted].',
      'Good [timing|call|move] in a busy afternoon.'
    ],
    maghrib: [
      '[Dinner|The meal|Supper] can [start|begin].',
      '[Enjoy|Savour|Take your time with] the [meal|dinner|evening].',
      'A [peaceful|quiet|calm|gentle] pause at sunset.',
      '[Good|Nice|Perfect] timing.',
      'The evening [starts|opens|begins] [calmly|gently|quietly].',
      '[Sunset|Dusk] [sorted|handled|covered].'
    ],
    isha: [
      'The evening [wrapped up|ended|closed] [gently|calmly|quietly].',
      'A [calm|quiet|gentle|peaceful] finish.',
      'Quiet hours [ahead|to follow|waiting].',
      '[Steady|Even|Calm] all the way.',
      'You [made|found|kept] the time.',
      '[Night|Evening] [sorted|handled|covered].',
      'Quiet evening, [nicely|neatly|calmly] closed.'
    ],
    jumuah: [
      'Jumu‘ah mubarak.',
      '[Good|Lovely|Nice|Warm] gathering.',
      'Friday [feels|looks] right.',
      'A [nice|good|lovely|calm] way to spend Friday.',
      'Glad you [went|made it|came along].',
      'Friday, [sorted|handled|covered].',
      'Friday’s [main event|highlight] is [in|done|sorted].'
    ],
    any: [
      'That’s the [rhythm|spirit|way].',
      '[Calm|Quiet|Easy|Smooth] and [steady|even|unhurried|neat].',
      '[Good|Nice|Solid|Steady] [rhythm|pace|going].',
      '[Small|Simple|Short] step, [well|nicely|neatly] taken.',
      'That [feels|looks] [good|right|solid].',
      '[Good|Nice|Solid] habit, [kept|well kept|nicely kept].',
      'You [made|found|took] a moment for it.',
      'A [moment|pause] [well spent|nicely used].',
      '[Nice|Good|Lovely] [one|work].'
    ]
  },
  closer: [
    'Keep that [pace|rhythm].',
    'Carry that [calm|ease] with you.',
    'A good one to build on.',
    'Easy as that.',
    'Take a [breath|moment].',
    '[Quiet|Calm] minutes, [well used|nicely taken].'
  ],
  /* plain: progress facts only, never a look ahead */
  plain: {
    full: [
      '{D} [done|in|ticked off], {sum}, [full set|the full set|every part|all parts in].',
      '{D}: {sum}, [full set|all parts in|every part ticked].',
      '{D} [done|in], {sum}. [Full set|The full set|Every part ticked|All parts in].',
      '{D} [done|in|ticked off]: {sum}, the [full set|whole set].'
    ],
    multi: [
      '{D} [done|in|ticked off], {sum}.',
      '{D}: {sum}.',
      '{D} [done|in], {sum} [so far|today|ticked].',
      '{D} [is done|is in|is ticked off] with {sum}.'
    ],
    single: [
      '{D} [done|in|ticked off], {n} rak‘ah.',
      '{D}: {n} rak‘ah [done|in|ticked].',
      '{D} [is done|is in|is ticked off], {n} rak‘ah.',
      '{D} done: {n} rak‘ah [so far|today|in].'
    ],
    bare: [
      '{D} [done|in|ticked off].',
      '{D} is [done|in|ticked off|sorted].',
      '{D} [is done|is in|is ticked off] for today.',
      'For today, {D} is [done|in|ticked off].'
    ]
  },
  plainTail: [
    '[Steady|Smooth|Easy] so far.',
    'Going [smoothly|steadily|nicely].',
    '[Nice and even|Calm and even|Even and calm].',
    '[Easy|Gentle|Steady] rhythm today.',
    'No rush.',
    'Just the facts: all good.',
    'Everything in its place.',
    'Quiet progress.'
  ],
  /* soon: a heads-up for the next prayer, only inside its window */
  soonLead: [
    '{P} [is at|comes at|starts at|is due at] {T}[, not long now|, soon|].',
    '[Almost|Nearly] time for {P}.',
    '{P} is [coming up|close|nearly here|not far off].',
    '{P} [at {T}|around {T}], [coming up|not long now|soon].',
    '[Heads up|A quick heads-up]: {P} at {T}.',
    '{P}’s [next|up next|on its way], at {T}.',
    '[In a little while|Shortly|Soon]: {P} at {T}.',
    'Coming up: {P}, {T}.'
  ],
  soonTail: {
    fajr: [
      '[A calm|A quiet|A gentle] start before the day [gets loud|speeds up|picks up].',
      '[Still|Mostly] quiet out there.',
      'Water first, then pray?',
      'Maybe a glass of water first.',
      '[Early|Soft|First] light, [good|nice|perfect] timing.',
      'The day hasn’t started [shouting|rushing|buzzing] yet.',
      '[Quiet|Calm|Easy] [minutes|moments] to start with.'
    ],
    dhuhr: [
      '[Good|Nice|Perfect] time for a [break|pause|breather].',
      'Step away from the [desk|screen|laptop] for a bit.',
      'Pray first, lunch [after|next|afterwards].',
      'A [pause|break] in the middle of the day.',
      'Lunch can wait [ten|a few|a couple of] minutes.',
      '[Wrap up|Finish up|Round off] what you’re doing.'
    ],
    asr: [
      '[Step away from|Take a break from|Look away from] the [screen|desk] for a few minutes.',
      'A [good|decent|handy] fix for the afternoon [slump|dip].',
      'A short [pause|break|reset] [helps|works wonders|does wonders].',
      '[Stretch|Shake out] your legs, then pray.',
      'The afternoon [needs|could use|deserves] a [breather|pause].'
    ],
    maghrib: [
      '[Pray at sunset|Pray first], then [dinner|dinner with the family|a family meal].',
      'Dinner can wait a [few|couple of] minutes.',
      '[Golden|Warm|Soft] light outside.',
      'Sunset is the [signal|cue|reminder].',
      '[Wrap up|Finish up|Round off] what you’re doing.'
    ],
    isha: [
      'Time to start [winding down|slowing down|settling in].',
      'A [calm|gentle|quiet|easy] way to close the evening.',
      '[Unhurried|Easy|Gentle], no rush.',
      'Settle in [afterwards|once you’ve prayed].',
      '[Quiet|Calm|Easy] [evening|hour] [ahead|coming up].'
    ],
    jumuah: [
      'Jumu‘ah today, so head out a [little|bit] early.',
      '[Fresh|Clean] clothes, [easy|steady|unhurried] pace.',
      '[A good|A fine|A nice] day to go early.',
      '[Walk|Stroll|Head] over [unhurried|calmly|at an easy pace].',
      'Friday gathering, no [rushing|fuss].'
    ]
  },
  /* open: the window is open */
  openLead: [
    '{P} [is here|is open|has begun|is on|is open now|has started].',
    'It’s {P} time.',
    'Time for {P}.',
    '{P} time is on.',
    '{P}’s [window is open|here|open now|time has come].',
    '[Ready|Set] for {P}?',
    '[Now|Right now] it’s {P} time.',
    '{P} [is open until|runs until|stays open until] {E}.',
    'Open now: {P}.',
    '{P}, [open now|available now|ready when you are].'
  ],
  openTail: {
    fajr: [
      '[A calm|A quiet|A gentle] way to [begin|start] the day.',
      'Before the day [picks up speed|gets busy|speeds up].',
      'Quiet minutes, [put them to use|use them well].',
      '[Morning|Early] light is [out|up].',
      '[Open|Available|Here] until {E}.'
    ],
    dhuhr: [
      '[Take|Grab] a [short|quick] break from [work|the desk].',
      '[Pray|Pray first], then lunch.',
      'A [good|nice|calm] pause in a busy day.',
      'Step away for a [few minutes|moment|bit].',
      '[Open|Available|Here] until {E}.'
    ],
    asr: [
      'Beat the afternoon [slump|dip].',
      'A short [pause|break] helps.',
      'Stand up, stretch, pray.',
      'A [tiny|small] reset for the afternoon.',
      '[Open|Available|Here] until {E}.'
    ],
    maghrib: [
      'Sunset’s on, then dinner with the family.',
      '[Pray|Pray first] before the meal.',
      'Dinner can wait a few minutes.',
      '[Short|Brief] window, so make the most of it.',
      'Golden light, [quiet moment|quiet minutes].',
      '[Open|Available|Here] until {E}.'
    ],
    isha: [
      '[Wind down|Slow down] with it.',
      'A gentle end to the evening.',
      'No rush, there’s [time|plenty of time].',
      'Settle in [after|afterwards].',
      '[Quiet|Calm] [evening|hour] for it.',
      '[Open|Available|Here] until {E}.'
    ],
    jumuah: [
      'Head over [unhurried|calmly].',
      'A good day for it.',
      '[Fresh|Clean] clothes, easy pace.',
      '[Arrive|Get there] early if you can.',
      '[Open|Available|Here] until {E}.'
    ]
  },
  openMore: [
    'No rush.', '[Take|Give it] your time.', 'A few minutes is enough.', 'Keep it simple.', 'Phone away for a bit.',
    'Nothing fancy needed.', 'Short and sweet.', 'Slow and steady.'
  ],
  /* all: the five are in */
  allLead: [
    'All five [prayers are in|are done|are ticked off|are down].',
    '[All five|Every prayer] [done|ticked off|in] today.',
    'That’s all five [today|for today].',
    '[Fajr to Isha|Dawn to night], [all in|all done|all ticked].',
    'The full set [is in|is done|is ticked off|is in for today].',
    'All five done, [nicely|neatly|evenly] paced.'
  ],
  allTail: [
    '[Well|Nicely|Neatly] [done|played|kept].',
    '[Steady|Solid|Good|Fine] work.',
    'Take a [breath|moment].',
    '[A good|A solid|A fine] rhythm.',
    'Quietly [done|kept].',
    'That’s a [good|steady|lovely] rhythm.',
    '[Calm|Easy|Steady] pace [all day|throughout].',
    '[Good|Nice|Smooth] going.',
    '[Nicely|Steadily] kept.'
  ],
  allMore: ['Take a breath.', 'Enjoy the quiet.', 'Settle in.', 'Well earned.', 'Easy now.', 'Soak it in.'],
  sugg: ['{V} is open, and you’ve been keeping it up lately.', '{V} is open. Quick one, if you’re up for it.', 'You’ve got a nice habit going with {V}, and it’s open now.', '{V}’s window is open, and it suits you.', '{V} is open now, a good moment for it.'],
  suggSoon: ['{V} opens in a few minutes.', '{V} opens shortly, and you’ve been keeping it up lately.', '{V} is about to open. Quick one, if you’re up for it.', '{V} opens soon, a good moment for it.', 'Coming up shortly: {V}, a nice habit of yours.'],
  milestone: { streak: '{n} days running with the full set.', first: 'First time for the full set, nicely done.', trend: 'More prayers in than this time last week.', sunnah: 'More Sunnah in than last week.' },
  title: 'Today'
};

const BN = {
  doneLead: [
    '{D} [হয়ে গেছে|শেষ|পড়া হলো|টিক পড়েছে|হয়ে গেল|পড়া হলো].',
    '[বাহ|চমৎকার|ভালো|দারুণ], {D} [হয়ে গেছে|হয়ে গেল|শেষ|পড়া হলো].',
    '{D}, {n} রাকাত, [পড়া হলো|শেষ|পড়া হলো].',
    '{D} [শেষ|হয়ে গেছে|পড়া হলো], {n} রাকাত [পড়া|আদায়] [হলো|হয়েছে].',
    '[আপনার|আজকের] {D} [হয়ে গেছে|পড়া হলো|শেষ].',
    '[টিক পড়ল|পড়া হলো]: {D}.',
    '{D} [পড়ে নিয়েছেন|সেরে ফেলেছেন|শেষ করেছেন|আদায় করেছেন].',
    '{D} পড়া [শেষ|হয়ে গেছে|পড়া হলো].',
    '[এই তো|বেশ], {D} [হয়ে গেল|শেষ|পড়া হলো].'
  ].map(t => t.replace(/\.$/, '।')),
  warm: {
    fajr: [
      '[দুনিয়া|শহর|পাড়া|গোটা বাড়ি] জাগার আগেই [হয়ে গেল|সারা হলো|শেষ]।',
      'দিনের [সুন্দর|শান্ত|ভালো] শুরু।',
      '[দারুণ|শান্ত|চমৎকার] একটা সকাল।',
      'সবচেয়ে কঠিন ওয়াক্তটা [হয়ে গেল|সারা হলো|শেষ]।',
      '[ভোরের|সকালের] আলোয় ওয়াক্তটা [সেরে নিলেন|শেষ হলো]।',
      '[ভোরেই|ভোরবেলাতেই], [শান্তভাবে|ধীরেসুস্থে|চুপচাপ]।',
      'দিনটা [ভালোভাবে|শান্তভাবে|সুন্দরভাবে] [শুরু হলো|শুরু হয়েছে]।'
    ],
    dhuhr: [
      'দুপুরটা [গুছিয়ে গেল|ঠিকঠাক|সামলানো হলো]।',
      'বিরতিটা [ভালো|দারুণ|সুন্দর] কাজে লাগল।',
      'এবার [খাবার|দুপুরের খাওয়া|লাঞ্চ] [আরও|বেশ] মজা লাগবে।',
      'দিনের মাঝপথে [স্থির|শান্ত|সুন্দর] গতি।',
      'ব্যস্ত দিনে [সুন্দর|ছোট্ট|শান্ত] একটা [থামা|বিরতি]।',
      '[দিনের|দুপুরের] মাঝখানটা [সামলে নিলেন|গুছিয়ে নিলেন]।'
    ],
    asr: [
      'বিকেলের [ঝিমুনি|ক্লান্তি|আলস্য] [হার মানল|কেটে গেল]।',
      '[ভালো|দারুণ|সুন্দর] একটা [রিসেট|বিরতি|থামা]।',
      '[সন্ধ্যা|সূর্যাস্ত|রাতের খাবার] এখন [আরও কাছে|একটু কাছে]।',
      '[উঠে এসেছেন|সরে এসেছেন|একটু থেমেছেন], [ভালো করেছেন|বেশ করেছেন|দারুণ করেছেন]।',
      'দিনের ব্যস্ত অংশটা [পার|শেষ]।',
      'বিকেলটা [গুছিয়ে|সামলে] [নিলেন|ফেললেন]।'
    ],
    maghrib: [
      'এবার [খাওয়া|রাতের খাবার|সন্ধ্যার খাবার] [শুরু করতে পারেন|শুরু হতে পারে]।',
      'সন্ধ্যাটা [শান্তভাবে|সুন্দরভাবে|ধীরে] শুরু হলো।',
      '[খাবার|সন্ধ্যার খাবার] [উপভোগ করুন|আরাম করে খান]।',
      'সূর্যাস্তে [শান্ত|ছোট্ট|সুন্দর] একটা বিরতি।',
      'সময়টা [ঠিকঠাক|চমৎকার|দারুণ]।',
      '[সন্ধ্যার|সূর্যাস্তের] ওয়াক্তটা [সেরে নিলেন|গুছিয়ে নিলেন]।'
    ],
    isha: [
      'সন্ধ্যাটা [ধীরে|শান্তভাবে|নরমভাবে] [গুটিয়ে এল|শেষ হলো]।',
      '[শান্ত|নরম|সুন্দর] একটা [সমাপ্তি|শেষ]।',
      'সামনে [চুপচাপ|নিরিবিলি] [সময়|রাত]।',
      'ঠিকঠাক গতিতে [শেষ করলেন|সেরে নিলেন]।',
      '[বাহ|ভালো], সময় [বের করেছেন|করে নিয়েছেন]।',
      'রাতের ওয়াক্তটা [সেরে নিলেন|গুছিয়ে নিলেন]।'
    ],
    jumuah: [
      'জুমা মোবারক।',
      '[সুন্দর|ভালো|চমৎকার] জমায়েত।',
      'শুক্রবারটা [ঠিকঠাক|সুন্দর|দারুণ] [লাগছে|কাটছে]।',
      '[গিয়েছেন|পৌঁছেছেন], [ভালো করেছেন|বেশ করেছেন]।',
      'শুক্রবারের [সবচেয়ে বড় কাজটা|মূল কাজটা] [হয়ে গেল|সারা হলো]।',
      'শুক্রবারটা [সুন্দরভাবে|শান্তভাবে] [শুরু হলো|কাটছে]।'
    ],
    any: [
      '[সুন্দর|দারুণ|চমৎকার|বেশ ভালো] [ছন্দ|গতি]।',
      '[ধীরেসুস্থে|শান্তভাবে|নিঃশব্দে] [হয়ে গেল|সারা হলো]।',
      '[ভালো|সুন্দর|দারুণ] অভ্যাস, [ধরে রেখেছেন|বজায় আছে|চলছে]।',
      '[নিজের জন্য|নামাজের জন্য] সময় [বের করেছেন|রেখেছেন]।',
      '[একটু|ছোট্ট] [থামা|বিরতি], [ভালো|দারুণ|সুন্দর] কাজে লাগল।',
      '[ভালো|চমৎকার|দারুণ] কাজ।',
      '[ছোট্ট|সহজ] একটা ধাপ, [সুন্দরভাবে|ঠিকঠাক] [সারা হলো|পার হলো]।',
      '[নিজের|মনের] জন্য [ভালো|সুন্দর] একটা মুহূর্ত।'
    ]
  },
  closer: [
    '[এই|এমন] [গতি|ছন্দ] ধরে রাখুন।',
    'মনটা [হালকা|শান্ত] থাকুক।',
    'সামনের সময়টাও [ভালো|সুন্দর] কাটুক।',
    'এভাবেই চলুক।',
    '[আরাম করে|শান্ত হয়ে] একটু বসুন।',
    'ধীরে এগোন।',
    '[নিশ্চিন্তে|সহজে] এগোন।',
    'একটু [হেসে|দম নিয়ে] নিন।'
  ],
  plain: {
    full: [
      '{D} [হয়ে গেছে|পড়া হলো|শেষ], {sum}, [পুরো সেটই|সবগুলো অংশই|প্রতিটি অংশই] [হয়ে গেছে|পড়া হয়েছে].',
      '{D}: {sum}, [পুরো সেটে|সবগুলো অংশে|প্রতিটি অংশে] টিক পড়েছে.',
      '{D} [হয়ে গেছে|পড়া হলো], {sum}. [পুরো সেটে|সবগুলো অংশে|প্রতিটি অংশে] টিক পড়েছে.',
      '{D} [হয়ে গেছে|পড়া হলো|শেষ]: {sum}, [পুরো|সম্পূর্ণ] সেট.'
    ].map(t => t.replace(/\.$/, '।').replace(/\. /g, '। ')),
    multi: [
      '{D} [হয়ে গেছে|পড়া হলো|শেষ], {sum}।',
      '{D}: {sum}।',
      '{D} [হয়ে গেছে|পড়া হলো], {sum} [এখন পর্যন্ত|আজ|টিক]।',
      '{D} [হয়ে গেছে|পড়া হলো|শেষ], সঙ্গে {sum}।'
    ],
    single: [
      '{D} [হয়ে গেছে|পড়া হলো|শেষ], {n} রাকাত।',
      '{D}: {n} রাকাত [পড়া হলো|শেষ|পড়া হয়েছে]।',
      '{D} [পড়া হলো|শেষ], {n} রাকাত [এখন পর্যন্ত|আজ]।',
      '{D} [হয়ে গেছে|পড়া হলো|শেষ], মোট {n} রাকাত।'
    ],
    bare: [
      '{D} [হয়ে গেছে|পড়া হলো|শেষ]।',
      '{D} [হয়ে গেল|পড়া হলো|টিক পড়ল]।',
      'আজকের {D} [হয়ে গেছে|পড়া হলো|শেষ]।',
      'আজ {D} [হয়ে গেছে|পড়া হলো|শেষ]।'
    ]
  },
  plainTail: [
    '[এখন পর্যন্ত|এ পর্যন্ত] [স্থির|মসৃণ|সহজ]।',
    '[মসৃণভাবে|ধীরে|স্থিরভাবে] চলছে।',
    '[সহজ|শান্ত|স্থির] একটা ছন্দ।',
    'তাড়া নেই।',
    'সবকিছু জায়গামতো।',
    'নিঃশব্দে এগোচ্ছে।'
  ],
  soonLead: [
    '{P:gen} সময় {T}-এ[, প্রায় হয়ে এল|, এসে পড়ছে|, কাছাকাছি|]।',
    '{P} {T}-এ[, একটু পরেই|, আর অল্প সময়|, খুব কাছে|]।',
    '[প্রায়|এখন প্রায়] {P:gen} সময়।',
    '{P} [আসছে|এসে পড়ছে|এগিয়ে আসছে|কাছেই]।',
    '[একটু পরেই|খানিক পরে] {P}, {T}-এ।',
    '[খেয়াল করুন|জেনে রাখুন|মনে রাখুন]: {T}-এ {P}।',
    '[পরেরটা|এবার] {P}, {T}-এ।',
    '{P} {T} নাগাদ, [কাছেই|সামনেই]।'
  ],
  soonTail: {
    fajr: [
      'দিনের [হইচইয়ের|ব্যস্ততার|ছুটোছুটির] আগে [শান্ত|নিরিবিলি|ধীর] একটা শুরু।',
      'বাইরে এখনও [চুপচাপ|নিরিবিলি|শান্ত]।',
      'আগে এক গ্লাস পানি, তারপর নামাজ?',
      'আগে একটু পানি, তারপর নামাজ?',
      '[ভোরের|সকালের] [আলো|হাওয়া], [সময়টা|মুহূর্তটা] [ভালো|সুন্দর]।',
      'দিন এখনও জেগে ওঠেনি।',
      'দিন এখনও [ধীরে|আস্তে] জাগছে।',
      'সকালটা এখনও [নরম|শান্ত|স্নিগ্ধ]।'
    ],
    dhuhr: [
      '[বিরতির|থামার] [ভালো|দারুণ|সুন্দর] সুযোগ: আগে নামাজ, পরে [লাঞ্চ|খাওয়া]।',
      '[ডেস্ক|স্ক্রিন|কাজ] থেকে [একটু|কয়েক মিনিট] [উঠে পড়ুন|উঠে আসুন]।',
      'আগে নামাজ, তারপর [খাওয়া|লাঞ্চ]।',
      'দিনের মাঝখানে [ছোট্ট|সুন্দর|শান্ত] একটা বিরতি।',
      '[লাঞ্চ|খাওয়া] [দশ|কয়েক] মিনিট [অপেক্ষা করতে পারে|অপেক্ষা করুক]।'
    ],
    asr: [
      'স্ক্রিন থেকে [কয়েক মিনিটের জন্য|একটু] সরে আসবেন?',
      'স্ক্রিন থেকে [কয়েক মিনিটের জন্য|একটু] সরে আসুন।',
      'বিকেলের [ঝিমুনি|আলস্য|ক্লান্তি] কাটানোর [ভালো|সহজ|দারুণ] উপায়।',
      '[ছোট্ট|ছোট একটা] বিরতি, নিজেকে [গুছিয়ে|সতেজ করে] নেওয়ার জন্য।',
      '[একটু|কিছুটা] [হেঁটে|পায়চারি করে|গা ছাড়িয়ে] নিন, তারপর নামাজ।',
      'বিকেলটা [একটু|কিছুটা] দম [নিতে চায়|নিতে পারে]।'
    ],
    maghrib: [
      '[সূর্যাস্তে|সন্ধ্যায়] নামাজ, তারপর [সবাই মিলে খাওয়া|পরিবারের সঙ্গে খাওয়া|রাতের খাবার]।',
      '[খাওয়া|খাবার] [কয়েক|দু-এক] মিনিট [অপেক্ষা করুক|অপেক্ষা করতে পারে]।',
      'বাইরে [সোনালি|নরম|কোমল] আলো।',
      'সূর্যাস্তই [ইশারা|সংকেত]।',
      'হাতের কাজটা [গুছিয়ে|শেষ করে|গুটিয়ে] নিন।'
    ],
    isha: [
      'এবার [ধীরে ধীরে|একটু একটু করে] [গুটিয়ে|গুছিয়ে] নেওয়ার সময়।',
      'সন্ধ্যাটা [শান্তভাবে|নরমভাবে|সুন্দরভাবে] শেষ করার [সুন্দর|ভালো|সহজ] উপায়।',
      'তাড়াহুড়ো নেই[|, ধীরেসুস্থে|, আরাম করে]।',
      'আগে নামাজ, তারপর আরাম করে বসা।',
      'সন্ধ্যা গড়ানোর আগে [সুন্দর|ছোট্ট] একটা [থামা|বিরতি]।'
    ],
    jumuah: [
      'আজ জুমা, [একটু|খানিক] আগে বেরিয়ে পড়ুন।',
      '[পরিষ্কার|ধোয়া] জামা, [ধীরে|ধীর পায়ে|আস্তে] [হাঁটা|যাওয়া]।',
      'আজ [আগেভাগে|সময় থাকতে] যাওয়ার দিন।',
      '[ভালো|সুন্দর] পোশাক, তাড়াহুড়ো ছাড়া।',
      'শুক্রবারের জমায়েত, [তাড়া|তাড়াহুড়ো] নেই।'
    ]
  },
  openLead: [
    '{P} [শুরু হয়েছে|চলছে|খোলা আছে|এখন খোলা]।',
    'এখন {P:gen} সময়।',
    '{P:gen} সময় [শুরু হয়েছে|চলছে|এখন]।',
    '{P:gen} জন্য তৈরি তো?',
    '{P:gen} ওয়াক্ত [খোলা|শুরু হয়েছে|এসে গেছে]।',
    '{P} [পড়ার সময়|পড়ে নেওয়ার সময়] এখন।',
    '{P} এখন [হাতের কাছেই|হাতের নাগালে]।',
    '[এখনই|এখন] {P} পড়া [যায়|যাবে]।',
    '{P} [{E} পর্যন্ত|{E}-এর আগ পর্যন্ত] খোলা।'
  ],
  openTail: {
    fajr: [
      'দিনটা [শান্তভাবে|ধীরে|সুন্দরভাবে] শুরু করুন।',
      'দিনের গতি [বাড়ার|বাড়তে থাকার] আগে।',
      '[নীরব|শান্ত] কয়েকটা মিনিট, [কাজে লাগান|ভালো কাজে লাগান]।',
      '[সকালের|ভোরের] আলো [ফুটেছে|ছড়িয়েছে]।',
      '{E} পর্যন্ত [সময় আছে|সময় পাবেন|ওয়াক্ত খোলা]।'
    ],
    dhuhr: [
      'কাজ থেকে [ছোট্ট|ছোট একটা|একটু] বিরতি [নিন|নিয়ে নিন]।',
      'আগে নামাজ, তারপর [খাওয়া|লাঞ্চ]।',
      'ব্যস্ত দুপুরে [একটু|ছোট্ট] [থামা|বিরতি]।',
      'কয়েক মিনিটের জন্য [উঠে পড়ুন|উঠে আসুন]।',
      '{E} পর্যন্ত [সময় আছে|সময় পাবেন|ওয়াক্ত খোলা]।'
    ],
    asr: [
      'স্ক্রিন থেকে [কয়েক মিনিটের জন্য|একটু] সরে আসবেন?',
      'বিকেলের [ঝিমুনি|ক্লান্তি] [কাটান|ঝেড়ে ফেলুন]।',
      'ছোট্ট বিরতিতে [অনেক কাজ হয়|অনেক সতেজ লাগে]।',
      'উঠুন, গা ছাড়িয়ে নিন, নামাজ।',
      '{E} পর্যন্ত [সময় আছে|সময় পাবেন|ওয়াক্ত খোলা]।'
    ],
    maghrib: [
      'সূর্যাস্ত চলছে, তারপর [পরিবারের সঙ্গে|সবার সঙ্গে] খাওয়া।',
      'খাওয়ার আগে নামাজ।',
      '[খাওয়া|খাবার] [একটু|কয়েক মিনিট] অপেক্ষা করুক।',
      'সময় [অল্প|সংক্ষিপ্ত], [কাজে লাগান|ভালোভাবে কাজে লাগান]।',
      'সোনালি আলোয় [ছোট্ট|শান্ত] একটা [মুহূর্ত|বিরতি]।',
      '{E} পর্যন্ত [সময় আছে|সময় পাবেন|ওয়াক্ত খোলা]।'
    ],
    isha: [
      '[ধীরে|আস্তে] গুটিয়ে নিন।',
      'সন্ধ্যার [নরম|শান্ত] সমাপ্তি।',
      'তাড়া নেই, সময় [আছে|অনেক আছে]।',
      'পরে [আরাম করে|ধীরেসুস্থে] বসুন।',
      '[শান্ত|নিরিবিলি] একটা [সন্ধ্যা|সময়]।',
      '{E} পর্যন্ত [সময় আছে|সময় পাবেন|ওয়াক্ত খোলা]।'
    ],
    jumuah: [
      '[ধীরেসুস্থে|ধীর পায়ে] যান।',
      'আজকের জন্য [সুন্দর|ভালো] দিন।',
      '[পরিষ্কার|ধোয়া] জামা, [ধীর পায়ে|আস্তে]।',
      'পারলে [আগে|আগেভাগে] পৌঁছান।',
      '{E} পর্যন্ত [সময় আছে|সময় পাবেন|ওয়াক্ত খোলা]।'
    ]
  },
  openMore: [
    '[ধীরেসুস্থে|আরাম করে] পড়ুন।', 'কয়েক মিনিটই [যথেষ্ট|বেশ]।', 'সহজ রাখুন।', 'ফোনটা একটু দূরে রাখুন।',
    'ছোট্ট করে, [ভালো করে|মন দিয়ে]।', 'সময় নিয়ে পড়ুন।'
  ],
  allLead: [
    '[আজ পাঁচ ওয়াক্তই|পাঁচ ওয়াক্তই|পাঁচটাই|আজ সবগুলোই] [হয়ে গেছে|পড়া হলো|টিক পড়েছে|হয়ে গেল]।',
    'ফজর থেকে ইশা, [সবই|সবকটা|সবগুলো] [হয়ে গেছে|পড়া হলো|টিক পড়েছে]।',
    'পূর্ণ পাঁচ ওয়াক্ত, [সুন্দর গতিতে|ধীরেসুস্থে|শান্তভাবে]।',
    'পুরো সেটটাই [হয়ে গেছে|পড়া হলো|টিক পড়েছে]।'
  ],
  allTail: [
    '[চমৎকার|দারুণ|সুন্দর|বাহ]।',
    '[নিয়মিত|ভালো|ঠিকঠাক] [কাজ|ছন্দ]।',
    'একটু দম [নিন|নিয়ে নিন]।',
    '[শান্ত|ধীর|সহজ] [গতি|ছন্দ]।',
    'নিঃশব্দে [পড়া হলো|সারা]।',
    'এভাবেই [চলুক|চলতে থাকুক]।',
    'আজ [সবকিছু|সবটাই] [ঠিকঠাক|গুছানো]।'
  ],
  allMore: ['মনটা [হালকা|শান্ত] থাকুক।', 'এই ছন্দ ধরে রাখুন।', 'নিজের জন্য একটু সময়।', 'হাসিমুখে বসুন।'],
  sugg: ['{V} এখন খোলা, আর সম্প্রতি আপনি নিয়মিতই পড়ছেন।', '{V} এখন খোলা। সময় থাকলে ছোট্ট করে পড়ে নিন।', '{V}-এর ভালো একটা অভ্যাস গড়ে উঠছে, আর এখন সময়ও আছে।', '{V}-এর ওয়াক্ত খোলা, আপনার সঙ্গে মানাবে।', '{V} এখন খোলা, ভালো একটা সুযোগ।'],
  suggSoon: ['{V} কয়েক মিনিটের মধ্যেই শুরু।', '{V} একটু পরেই শুরু, আর সম্প্রতি আপনি নিয়মিতই পড়ছেন।', '{V} শুরু হতে চলেছে। সময় থাকলে ছোট্ট করে পড়ে নিন।', '{V} খুব শিগগিরই শুরু, ভালো একটা সুযোগ।', 'একটু পরেই {V}, আপনার ভালো একটা অভ্যাস।'],
  milestone: { streak: '{n} দিন ধরে একটানা সবগুলো হচ্ছে।', first: 'প্রথমবার সবগুলো একসঙ্গে, দারুণ!', trend: 'গত সপ্তাহের এই সময়ের চেয়ে বেশি নামাজ হয়েছে।', sunnah: 'গত সপ্তাহের চেয়ে সুন্নাত বেশি হয়েছে।' },
  title: 'আজ'
};
const LEX = { en: EN, bn: BN };

/* ---------- template expansion: "[a|b|c]" alternatives, expanded once and cached ---------- */
const expandCache = new Map();
export function expand(template) {
  if (expandCache.has(template)) return expandCache.get(template);
  const m = /\[([^[\]]*)\]/.exec(template);
  let out;
  if (!m) out = [template];
  else {
    const seen = new Set(); out = [];
    for (const alt of m[1].split('|')) {
      for (const r of expand(template.slice(0, m.index) + alt + template.slice(m.index + m[0].length))) if (!seen.has(r)) { seen.add(r); out.push(r); }
    }
  }
  expandCache.set(template, out);
  return out;
}
const expandAll = list => { const seen = new Set(); const out = []; for (const t of list) for (const e of expand(t)) if (!seen.has(e)) { seen.add(e); out.push(e); } return out; };

/* ---------- surface realization ---------- */
function nameForm(lang, key, form) {
  const e = NAMES[lang][key];
  if (lang === 'en') return e;
  return e[form] || e.nom;
}
export function realize(template, feats, lang) {
  return template.replace(/\{(\w+)(?::(\w+))?\}/g, (m, slot, form) => {
    const v = feats[slot];
    if (v === undefined || v === null) return '';
    if (slot === 'P' || slot === 'D') return nameForm(lang, v, form);
    return String(v);
  }).replace(/\s+([,.:?!।])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}
const needs = (template, slot) => template.includes(`{${slot}`);

/* ---------- repetition checks (no word twice inside a line) ---------- */
const STOP_EN = new Set(['the', 'and', 'for', 'you', 'are', 'was', 'has', 'had', 'can', 'its', 'but', 'not', 'out', 'too', 'got', 'get', 'did', 'then', 'that', 'with', 'this', 'than', 'have', 'been', 'your', 'from', 'you’ve', 'it’s']);
const STOP_BN = new Set(['এখন', 'আর', 'এখনও', 'তারপর', 'এরপর', 'জন্য', 'থেকে', 'একটু', 'আজ', 'সঙ্গে', 'পরে', 'আগে']);
export function words(text, lang) {
  const list = text.toLowerCase().split(/[\s,.:;?!।\-–—()“”"‘’]+/).filter(Boolean);
  return list.filter(w => (lang === 'bn' ? Array.from(w).length >= 3 && !STOP_BN.has(w) : w.length >= 3 && !STOP_EN.has(w)))
    .map(w => (lang === 'en' ? w.replace(/[’']s$/, '') : w));
}
export function repeatsWord(text, lang) {
  const seen = new Set();
  for (const w of words(text, lang)) { if (seen.has(w)) return true; seen.add(w); }
  return false;
}
const MAX_LEN = { en: 100, bn: 118 };

/* ---------- deterministic weighted choice ---------- */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** Pick the candidate with the best seeded score; recently shown ids are strongly down-weighted. */
export function choose(candidates, seed, recent = []) {
  const recentIdx = new Map(recent.map((id, i) => [id, i]));
  let best = null, bestScore = -1;
  for (const c of candidates) {
    let weight = 1;
    if (recentIdx.has(c.id)) weight = 0.02 + 0.2 * (1 - (recentIdx.get(c.id) + 1) / (recent.length + 1)) * 0.1;
    const score = hash(`${seed}|${c.id}`) * weight;
    if (score > bestScore) { best = c; bestScore = score; }
  }
  return best;
}

/* ---------- learned heads-up window ---------- */
/** Minutes before a prayer in which its heads-up may appear: 20-45 by default (varies by day and
 *  prayer so it never feels mechanical), shortened by half the person's usual tick delay. */
export function headsUpLead(key, dateKey, habits = {}) {
  const [lo, hi] = HEADS_UP_RANGE;
  let lead = lo + Math.floor(hash(`${dateKey}|${key}|lead`) * (hi - lo + 1));
  const usual = habits.usualOffset?.[key];
  if (Number.isFinite(usual) && usual > 5) lead = Math.max(12, lead - Math.round(usual / 2));
  return lead;
}

/* ---------- content determination ---------- */
/**
 * ctx: { lang, dateKey, now (ms), friday, fmt(ms)->string,
 *        fard:[{key,start,end,done,tickedAt?,parts?:[rak‘ah of each ticked part],full?}] (the prayer day, in order),
 *        habits: {strength:{key}, usualOffset:{key}, batch, historyDays, streak, firstAll, trendUp, sunnahMore},
 *        suggestion: {name:{en,bn}, phase:'open'|'soon'}|null, memory:{recent,current} }
 */
export function determine(ctx) {
  const { now, fard = [], habits = {} } = ctx;
  const done = fard.filter(p => p.done);
  const ended = fard.filter(p => p.end <= now);
  const open = fard.find(p => p.start <= now && now < p.end) || null;
  const next = fard.find(p => p.start > now) || null;
  const slotKey = p => (p && p.key === 'dhuhr' && ctx.friday ? 'jumuah' : p?.key);
  const lastDone = [...done].sort((a, b) => b.start - a.start)[0] || null;
  const quiet = !!next && (habits.batch || (habits.historyDays >= 7 && habits.strength?.[next.key] === 'rare'));
  const lead = next ? headsUpLead(next.key, ctx.dateKey, habits) : 0;
  const inWindow = !!next && !quiet && next.start - now <= lead * 60000;
  const reacting = !!lastDone && Number.isFinite(lastDone.tickedAt) && now >= lastDone.tickedAt && now - lastDone.tickedAt < REACT_MINUTES * 60000
    && !fard.some(p => p.start > lastDone.tickedAt && p.start <= now);
  const base = { next, open, lastDone, nextKey: slotKey(next), openKey: slotKey(open), doneKey: slotKey(lastDone), doneCount: done.length, leadMin: lead };
  if (done.length >= KEYS.length) return { ...base, state: 'all' };
  if (!done.length && ended.length) return { ...base, state: 'none' };
  if (reacting) return { ...base, state: 'react' };
  if (open && !open.done) return { ...base, state: 'open' };
  if (inWindow) return { ...base, state: 'soon' };
  if (done.length) return { ...base, state: 'plain' };
  return { ...base, state: 'none' };
}

/* ---------- sentence plans: ordered slots per situation ---------- */
function plainKind(c) {
  const parts = c.lastDone?.parts;
  if (c.doneKey === 'jumuah' || !Array.isArray(parts) || !parts.length) return 'bare';
  if (parts.length === 1) return 'single';
  return c.lastDone.full ? 'full' : 'multi';
}
/** A plan: { prefix, slots:[{ opts:[{i,text}], optional }] } with every option already realized. */
function planFor(L, lang, c, feats) {
  const slot = (templates, { optional = false, drop = null } = {}) => {
    const opts = [];
    expandAll(templates).forEach((t, i) => {
      if (drop && drop(t)) return;
      const text = realize(t, feats, lang);
      if (text) opts.push({ i, text });
    });
    return { opts, optional };
  };
  const noN = t => needs(t, 'n') && feats.n === undefined;
  switch (c.state) {
    case 'react': return { prefix: `react.${c.doneKey}`, slots: [slot(L.doneLead, { drop: noN }), slot([...(L.warm[c.doneKey] || []), ...L.warm.any]), slot(L.closer, { optional: true })] };
    case 'plain': { const kind = plainKind(c); return { prefix: `plain.${kind}.${c.doneKey}`, slots: [slot(L.plain[kind]), slot(L.plainTail, { optional: true })] }; }
    case 'soon': return { prefix: `soon.${c.nextKey}`, slots: [slot(L.soonLead), slot(L.soonTail[c.nextKey] || [])] };
    case 'open': return { prefix: `open.${c.openKey}`, slots: [slot(L.openLead), slot(L.openTail[c.openKey] || []), slot(L.openMore, { optional: true })] };
    case 'all': return { prefix: 'all', slots: [slot(L.allLead), slot(L.allTail), slot(L.allMore, { optional: true })] };
    default: return null;
  }
}
const joinText = parts => parts.filter(Boolean).join(' ');
const lineOk = (text, lang) => !repeatsWord(text, lang) && text.length <= MAX_LEN[lang];
const idOf = (plan, picks) => `${plan.prefix}.${picks.map(p => (p ? p.i : '-')).join('.')}`;

function featuresFor(ctx, c) {
  const fmt = ctx.fmt || (ms => String(ms));
  const bn = ctx.lang === 'bn';
  const f = { P: c.nextKey, O: c.openKey, D: c.doneKey };
  if (c.next) f.T = fmt(c.next.start);
  if (c.open) f.E = fmt(c.open.end);
  if (c.lastDone && c.doneKey !== 'jumuah') {
    const parts = c.lastDone.parts;
    const rak = RAKAH[c.lastDone.key];
    f.n = bn ? bnNum(rak) : rak;
    if (Array.isArray(parts) && parts.length) f.sum = (bn ? bnNum : String)(parts.join(' + '));
  }
  if (c.state === 'plain' && plainKind(c) === 'single') f.n = bn ? bnNum(c.lastDone.parts[0]) : c.lastDone.parts[0];
  return f;
}
const withPlanFeatures = (c, f) => (c.state === 'open' ? { ...f, P: f.O } : f);

/** Pick one option per slot (seeded, recency-weighted); retry until the whole line passes the checks. */
function pickLine(plan, seed, recentIds, lang) {
  const slotRecent = plan.slots.map((_, k) => recentIds.filter(id => id.startsWith(`${plan.prefix}.`)).map(id => {
    const idx = id.slice(plan.prefix.length + 1).split('.')[k];
    return idx === undefined || idx === '-' ? null : `${k}:${idx}`;
  }).filter(Boolean));
  let fallback = null;
  for (let attempt = 0; attempt < 48; attempt++) {
    const picks = plan.slots.map((s, k) => {
      if (!s.opts.length) return null;
      if (s.optional && hash(`${seed}|${attempt}|inc${k}`) >= 0.4) return null;
      return choose(s.opts.map(o => ({ id: `${k}:${o.i}`, o })), `${seed}|${attempt}|${k}`, slotRecent[k]).o;
    });
    const text = joinText(picks.map(p => p && p.text));
    if (!text) continue;
    if (lineOk(text, lang)) return { id: idOf(plan, picks), text };
    if (!fallback) fallback = { id: idOf(plan, picks), text };
  }
  return fallback;
}
/** Rebuild a remembered line from its id (the line stays the same between events). */
function rebuild(plan, id, lang) {
  if (!id.startsWith(`${plan.prefix}.`)) return null;
  const idx = id.slice(plan.prefix.length + 1).split('.');
  if (idx.length !== plan.slots.length) return null;
  const picks = idx.map((v, k) => (v === '-' ? null : plan.slots[k].opts.find(o => String(o.i) === v) || undefined));
  if (picks.some(p => p === undefined)) return null;
  const text = joinText(picks.map(p => p && p.text));
  return text && lineOk(text, lang) ? { id, text } : null;
}

/** The status line for the card, or null when nothing should be said. */
export function progressLine(ctx) {
  const lang = ctx.lang === 'bn' ? 'bn' : 'en';
  const L = LEX[lang];
  const c = determine(ctx);
  if (c.state === 'none') return null;
  const feats = withPlanFeatures(c, featuresFor({ ...ctx, lang }, c));
  const plan = planFor(L, lang, c, feats);
  if (!plan || plan.slots.some(s => !s.opts.length && !s.optional)) return null;
  const seed = `${ctx.dateKey}|${c.state}|${c.nextKey || ''}|${c.openKey || ''}|${c.doneKey || ''}|${c.doneCount}|${(ctx.fard || []).map(p => (p.done ? 1 : 0)).join('')}|${plan.prefix}`;
  const memory = ctx.memory || {};
  const lock = memory.current && memory.current.sig === seed ? memory.current.id : null;
  const recent = memory.recent || ctx.recent || [];
  let pick = null;
  const refresh = Number(ctx.refresh) || 0;
  if (refresh > 0) {
    // The window was shown again (v1.3.3): choose a NEW line for the same situation. Never the line on screen
    // (memory.current.id) and, where the grammar has room, none of the recent lines either; the same seed and
    // refresh number always give the same line, so tests are reproducible.
    const shown = memory.current && memory.current.id;
    const recentSet = new Set(recent);
    let fallback = null;
    for (let k = 0; k < 16 && !pick; k++) {
      const cand = pickLine(plan, `${seed}|reopen${refresh}|${k}`, recent, lang);
      if (!cand || cand.id === shown) continue;
      if (!recentSet.has(cand.id)) pick = cand; else fallback = fallback || cand;
    }
    pick = pick || fallback;
  }
  pick = pick || (lock && rebuild(plan, lock, lang)) || pickLine(plan, seed, recent, lang);
  if (!pick) return null;
  const extras = [];
  const habits = ctx.habits || {};
  // a positive milestone, only on a finished day or right after the last prayer, and only some days
  const m = [];
  if (c.state === 'all' || (c.state === 'react' && c.doneKey === 'isha')) {
    if (habits.firstAll && c.state === 'all') m.push('first');
    if (habits.streak >= 2 && c.state === 'all') m.push('streak');
    if (habits.trendUp) m.push('trend');
    if (habits.sunnahMore) m.push('sunnah');
  }
  if (m.length && hash(`${seed}|milestone`) < 0.5) {
    const kind = m[Math.floor(hash(`${seed}|mk`) * m.length)];
    const text = realize(L.milestone[kind], { n: lang === 'bn' ? bnNum(habits.streak) : habits.streak }, lang);
    if (!repeatsWord(`${pick.text} ${text}`, lang)) extras.push(text);
  }
  // a rare Sunnah/Nafl suggestion, with its own short heads-up shortly before it opens (never for batch tickers)
  const sg = ctx.suggestion;
  const phase = sg?.phase === 'soon' ? 'soon' : 'open';
  let addedSugg = false;
  const sgStates = phase === 'soon' ? ['plain', 'all'] : ['plain', 'open', 'all'];
  if (sg && sgStates.includes(c.state) && !(phase === 'soon' && habits.batch)) {
    const list = phase === 'soon' ? L.suggSoon : L.sugg;
    const first = Math.floor(hash(`${seed}|sg`) * list.length);
    for (let k = 0; k < list.length; k++) {
      const text = realize(list[(first + k) % list.length], { V: sg.name[lang] }, lang);
      if (!repeatsWord(`${pick.text} ${text}`, lang)) { extras.push(text); addedSugg = true; break; }
    }
  }
  return { id: pick.id, sig: seed, state: c.state, text: [pick.text, ...extras].join(' '), base: pick.text, suggested: addedSugg, title: L.title };
}

/* ---------- enumeration: every line the grammar can produce ---------- */
const REP_FEATS = {
  en: { T: '11:48 AM', E: '3:18 PM', n: 4, sum: '4 + 4 + 2 + 2' },
  bn: { T: 'সকাল ১১:৪৮', E: 'বিকাল ৩:১৮', n: '৪', sum: '৪ + ৪ + ২ + ২' }
};
/** Normal form used to count *distinct* lines: case, punctuation, spacing and digits (times, counts) are ignored. */
export function normalizeLine(text) {
  return text.toLowerCase().replace(/[0-9০-৯]+/g, '#').replace(/[\s,.:;?!।\-–—()“”"‘’]+/g, ' ').trim();
}
/**
 * Calls fn({state, text}) for every distinct line the grammar can produce in `lang` (distinct under
 * normalizeLine, passing the same checks as live lines). Returns the number of distinct lines.
 */
export function forEachLine(lang, fn) {
  const L = LEX[lang];
  const seen = new Set();
  let count = 0;
  const feats = { ...REP_FEATS[lang] };
  const run = (state, c) => {
    const f = withPlanFeatures({ state }, { ...feats, P: c.nextKey, O: c.openKey, D: c.doneKey });
    if (c.doneKey === 'jumuah') { delete f.n; delete f.sum; }
    const plan = planFor(L, lang, { state, ...c, lastDone: c.lastDone }, f);
    const [s0, s1, s2] = plan.slots;
    const lists = plan.slots.map(s => (s.optional ? [null, ...s.opts] : s.opts));
    const walk = (k, acc) => {
      if (k === lists.length) {
        const text = joinText(acc);
        if (!text || !lineOk(text, lang)) return;
        const key = normalizeLine(text);
        if (seen.has(key)) return;
        seen.add(key); count++;
        if (fn) fn({ state, text });
        return;
      }
      for (const o of lists[k]) walk(k + 1, o ? [...acc, o.text] : acc);
    };
    void s0; void s1; void s2;
    walk(0, []);
  };
  for (const k of SLOT_KEYS) {
    run('react', { doneKey: k, lastDone: { key: k === 'jumuah' ? 'dhuhr' : k } });
    for (const kind of ['full', 'multi', 'single', 'bare']) {
      const parts = kind === 'single' ? [4] : [4, 4, 2, 2];
      run('plain', { doneKey: k, lastDone: { key: k === 'jumuah' ? 'dhuhr' : k, parts: kind === 'bare' ? [] : parts, full: kind === 'full' } });
    }
    run('soon', { nextKey: k, next: {} });
    run('open', { openKey: k, open: {} });
  }
  run('all', {});
  return count;
}
let counts = {};
/** Number of distinct lines the generator can produce for a language (memoized). */
export function variantCount(lang = 'en') {
  if (!(lang in counts)) counts[lang] = forEachLine(lang);
  return counts[lang];
}
export const LINE_LEXICON = LEX;
