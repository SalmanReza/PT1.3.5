/* Evidence for the prayer reference section (v1.3.2), switched by school.
   Sunni schools (Hanafi, Shafi'i, Maliki, Hanbali) share ONE set: Qur'an verses
   plus hadith from Bukhari and Muslim that all four schools accept. Ja'fari has
   its own set: Qur'an verses plus narrations from al-Kafi (Book of Prayer,
   chapter "Those Who Preserve Salah and Those Who Lose", numbered as in the
   thaqalayn.net edition). Wording is a faithful short paraphrase of the meaning.
   Where no reference could be verified, an entry uses the Qur'an only; nothing
   here carries an invented reference. School-specific points get a neutral note. */

import { sourceLabel } from './daily-reflections.js';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnNum = text => String(text).replace(/[0-9]/g, d => BN_DIGITS[d]);

const q = (ref, en, bn) => ({ kind: 'quran', ref, en, bn });
const h = (src, srcBn, en, bn) => ({ kind: 'hadith', src, srcBn, en, bn });
const BUK = n => ['Sahih al-Bukhari ' + n, 'সহিহ বুখারি ' + bnNum(n)];
const MUS = n => ['Sahih Muslim ' + n, 'সহিহ মুসলিম ' + bnNum(n)];
const both = (a, b) => [a[0] + '; ' + b[0], a[1] + '; ' + b[1]];
const hb = (pair, en, bn) => h(pair[0], pair[1], en, bn);
const KAFI_EN = n => 'al-Kāfi, Book of Prayer, “Those Who Preserve Salah and Those Who Lose”, no. ' + n;
const KAFI_BN = n => 'আল-কাফি, কিতাবুস সালাত, “নামাজের হেফাজতকারী ও নষ্টকারী”, নং ' + bnNum(n);
const k = (n, who, whoBn, en, bn) => h(KAFI_EN(n) + ' (' + who + ')', KAFI_BN(n) + ' (' + whoBn + ')', en, bn);

export const SUNNI_EVIDENCE = Object.freeze({
  fajr: [
    q('Q17:78', 'And the dawn recitation: the recitation of dawn is ever witnessed.', 'আর ভোরের কুরআন পাঠ: ভোরের পাঠে সাক্ষী রাখা হয়।'),
    hb(MUS(725), 'The two rak‘ahs of Fajr are better than this world and all that is in it.', 'ফজরের দুই রাকাত দুনিয়া ও তার সবকিছুর চেয়ে উত্তম।')
  ],
  dhuhr: [
    q('Q17:78', 'Establish prayer from the decline of the sun until the darkness of the night.', 'সূর্য ঢলে পড়ার সময় থেকে রাতের অন্ধকার পর্যন্ত সালাত কায়েম করো।'),
    hb(both(BUK(528), MUS(667)), 'If a river flowed by your door and you bathed in it five times a day, no dirt would remain; so are the five prayers, by which Allah wipes out faults.', 'তোমাদের দরজার সামনে নদী বইলে আর দিনে পাঁচবার তাতে গোসল করলে কোনো ময়লা থাকে না; পাঁচ ওয়াক্ত সালাতও তেমন, এর মাধ্যমে আল্লাহ ভুলত্রুটি মুছে দেন।')
  ],
  jumuah: [
    q('Q62:9', 'When the call is made for the Friday prayer, hasten to the remembrance of Allah and leave off trade.', 'জুমার দিনে সালাতের আহ্বান এলে আল্লাহর স্মরণের দিকে ছুটে যাও, বেচাকেনা ছেড়ে দাও।'),
    hb(MUS(854), 'The best day on which the sun has risen is Friday.', 'সূর্য ওঠা দিনগুলোর মধ্যে সেরা দিন জুমার দিন।')
  ],
  asr: [
    q('Q2:238', 'Guard the prayers, and stand before Allah in devotion.', 'সালাতগুলোর হেফাজত করো, আর আল্লাহর সামনে বিনীত হয়ে দাঁড়াও।'),
    hb(both(BUK(574), MUS(635)), 'Whoever prays the two cool prayers (Fajr and ‘Asr) will enter Paradise.', 'যে দুই ঠান্ডা সময়ের সালাত (ফজর ও আসর) আদায় করে, সে জান্নাতে প্রবেশ করবে।')
  ],
  maghrib: [
    q('Q11:114', 'Establish prayer at the two ends of the day and at the approach of the night.', 'দিনের দুই প্রান্তে ও রাতের প্রথম অংশে সালাত কায়েম করো।'),
    hb(both(BUK(527), MUS(85)), 'Asked which deed Allah loves most, the Prophet ﷺ said: prayer at its proper time.', 'কোন আমল আল্লাহর কাছে সবচেয়ে প্রিয়, জিজ্ঞেস করা হলে নবী ﷺ বললেন: যথাসময়ে সালাত।')
  ],
  isha: [
    q('Q20:130', 'Glorify your Lord with praise, and in the hours of the night.', 'তোমার রবের প্রশংসাসহ তাসবিহ করো, আর রাতের প্রহরগুলোতেও।'),
    hb(MUS(656), 'Whoever prays ‘Isha in congregation, it is as if he stood half the night in prayer.', 'যে জামাতে ইশা পড়ে, সে যেন অর্ধরাত নামাজে দাঁড়িয়ে কাটাল।')
  ],
  duha: [hb(MUS(720), 'Charity is due from every joint each morning; two rak‘ahs prayed at Duha suffice for it.', 'প্রতিদিন সকালে শরীরের প্রতিটি জোড়ার সদকা আছে; চাশতের দুই রাকাতই তার জন্য যথেষ্ট।')],
  awwabin: [q('Q11:114', 'Establish prayer at the two ends of the day and at the approach of the night.', 'দিনের দুই প্রান্তে ও রাতের প্রথম অংশে সালাত কায়েম করো।')],
  qiyam: [
    q('Q73:20', 'Your Lord knows that you stand in prayer nearly two-thirds of the night, or half of it, or a third.', 'তোমার রব জানেন, তুমি রাতের প্রায় দুই-তৃতীয়াংশ, অর্ধেক বা এক-তৃতীয়াংশ সালাতে দাঁড়াও।'),
    hb(MUS(1163), 'The best prayer after the obligatory prayers is the prayer in the depth of the night.', 'ফরজের পর সর্বোত্তম সালাত গভীর রাতের সালাত।')
  ],
  tahajjud: [
    q('Q17:79', 'And during part of the night, pray with it as an extra prayer for you.', 'আর রাতের কিছু অংশে তা দিয়ে তাহাজ্জুদ পড়ো; এটি তোমার জন্য অতিরিক্ত।'),
    hb(both(BUK(1145), MUS(758)), 'In the last third of the night it is called: who calls on Me, that I may answer? Who asks Me, that I may give? Who seeks forgiveness, that I may forgive?', 'রাতের শেষ তৃতীয়াংশে ডাকা হয়: কে আমাকে ডাকছে, আমি সাড়া দেব? কে চাইছে, আমি দেব? কে ক্ষমা চাইছে, আমি ক্ষমা করব?')
  ],
  tarawih: [hb(both(BUK(37), MUS(759)), 'Whoever stands in prayer in Ramadan with faith and hope of reward, his past sins are forgiven.', 'যে ঈমান ও সওয়াবের আশায় রমজানে রাতে নামাজে দাঁড়ায়, তার আগের গুনাহ ক্ষমা করা হয়।')],
  eid_prayer: [hb(BUK(956), 'The Prophet ﷺ, Abu Bakr and ‘Umar prayed the Eid prayer before the sermon.', 'নবী ﷺ, আবু বকর ও উমর (রা.) খুতবার আগে ঈদের সালাত আদায় করতেন।')],
  witr: [hb(both(BUK(998), MUS(751)), 'Make Witr the last of your night prayer.', 'রাতের সালাতের শেষে বিতর পড়ো।')],
  rawatib: [hb(MUS(728), 'A Muslim who prays twelve voluntary rak‘ahs for Allah each day, Allah builds him a house in Paradise.', 'যে মুসলিম প্রতিদিন আল্লাহর জন্য বারো রাকাত নফল পড়ে, আল্লাহ তার জন্য জান্নাতে ঘর তৈরি করেন।')],
  tahiyyatul_masjid: [hb(both(BUK(444), MUS(714)), 'When one of you enters the mosque, let him not sit until he has prayed two rak‘ahs.', 'তোমাদের কেউ মসজিদে ঢুকলে দুই রাকাত না পড়ে যেন না বসে।')],
  istikhara: [hb(BUK(6382), 'The Prophet ﷺ taught his Companions to seek guidance in every matter, as he taught them a surah of the Qur’an.', 'নবী ﷺ সাহাবিদের প্রতিটি বিষয়ে ইসতিখারা শেখাতেন, যেভাবে কুরআনের সূরা শেখাতেন।')],
  tawbah: [
    q('Q3:135', 'Those who, when they do wrong, remember Allah and ask forgiveness for their sins.', 'যারা মন্দ কাজ করে ফেললে আল্লাহকে স্মরণ করে ও নিজেদের গুনাহের জন্য ক্ষমা চায়।'),
    h('Sunan Abi Dawud 1521; Jami‘ at-Tirmidhi 406', 'সুনানে আবু দাউদ ১৫২১; জামে তিরমিজি ৪০৬', 'No one commits a sin, then purifies himself, prays two rak‘ahs and seeks forgiveness, but Allah forgives him.', 'কেউ গুনাহ করে উত্তমভাবে পবিত্র হয়ে দুই রাকাত পড়ে ক্ষমা চাইলে আল্লাহ তাকে ক্ষমা করেন।')
  ]
});

/* Neutral notes where the schools differ (shown quietly under the evidence). */
export const SUNNI_NOTES = Object.freeze({
  awwabin: ['No single hadith fixes this prayer’s name or count; scholars differ, so only the Qur’an is cited.', 'এই সালাতের নাম ও সংখ্যা নিয়ে একক কোনো হাদিস নির্দিষ্ট নয়; আলেমদের মতভেদ আছে, তাই শুধু কুরআন উল্লেখ করা হলো।'],
  tarawih: ['The number of rak‘ahs differs among scholars and communities.', 'রাকাতের সংখ্যা নিয়ে আলেম ও এলাকাভেদে মতভেদ আছে।'],
  witr: ['Its status (wajib or Sunnah) differs among the Sunni schools.', 'এর মর্যাদা (ওয়াজিব না সুন্নাত) সুন্নি মাজহাবগুলোতে ভিন্ন।'],
  eid_prayer: ['The number of extra takbirs differs among the schools.', 'অতিরিক্ত তাকবিরের সংখ্যা মাজহাবভেদে ভিন্ন।']
});

export const JAFARI_EVIDENCE = Object.freeze({
  fajr: [
    q('Q17:78', 'And the dawn recitation: the recitation of dawn is ever witnessed.', 'আর ভোরের কুরআন পাঠ: ভোরের পাঠে সাক্ষী রাখা হয়।'),
    k(16, 'the Prophet', 'নবী ﷺ', 'Everything has a face, and the face of your religion is prayer; let none of you disfigure the face of his religion.', 'প্রতিটি জিনিসের একটি মুখ আছে, আর তোমাদের দ্বীনের মুখ হলো সালাত; কেউ যেন নিজের দ্বীনের মুখ বিকৃত না করে।')
  ],
  dhuhr: [
    q('Q17:78', 'Establish prayer from the decline of the sun until the darkness of the night.', 'সূর্য ঢলে পড়ার সময় থেকে রাতের অন্ধকার পর্যন্ত সালাত কায়েম করো।'),
    k(1, 'Imam al-Sadiq', 'ইমাম জাফর সাদিক', 'Whoever keeps the limits of the five prayers and guards their times will meet Allah with a covenant that admits him to Paradise.', 'যে পাঁচ ওয়াক্ত সালাতের সীমা রক্ষা করে ও সময়ের হেফাজত করে, সে আল্লাহর কাছে জান্নাতের প্রতিশ্রুতি নিয়ে হাজির হবে।')
  ],
  jumuah: [q('Q62:9', 'When the call is made for the Friday prayer, hasten to the remembrance of Allah and leave off trade.', 'জুমার দিনে সালাতের আহ্বান এলে আল্লাহর স্মরণের দিকে ছুটে যাও, বেচাকেনা ছেড়ে দাও।')],
  asr: [
    q('Q2:238', 'Guard the prayers, and stand before Allah in devotion.', 'সালাতগুলোর হেফাজত করো, আর আল্লাহর সামনে বিনীত হয়ে দাঁড়াও।'),
    k(14, 'Imam al-Baqir', 'ইমাম মুহাম্মদ বাকির', 'A believer who guards the obligatory prayers and prays them on time is not among the heedless.', 'যে মুমিন ফরজ সালাতের হেফাজত করে ও সময়মতো পড়ে, সে উদাসীনদের অন্তর্ভুক্ত নয়।')
  ],
  maghrib: [
    q('Q11:114', 'Establish prayer at the two ends of the day and at the approach of the night.', 'দিনের দুই প্রান্তে ও রাতের প্রথম অংশে সালাত কায়েম করো।'),
    k(8, 'Imam al-Sadiq', 'ইমাম জাফর সাদিক', 'Satan stays fearful of the believer for as long as he guards the five prayers.', 'মুমিন যতক্ষণ পাঁচ ওয়াক্ত সালাতের হেফাজত করে, শয়তান ততক্ষণ তাকে ভয় পায়।')
  ],
  isha: [
    q('Q20:130', 'Glorify your Lord with praise, and in the hours of the night.', 'তোমার রবের প্রশংসাসহ তাসবিহ করো, আর রাতের প্রহরগুলোতেও।'),
    k(4, 'Imam al-Baqir', 'ইমাম মুহাম্মদ বাকির', 'The first thing a servant is held to account for is prayer; if it is accepted, the rest is accepted.', 'বান্দার কাছ থেকে সবার আগে সালাতের হিসাব নেওয়া হবে; তা কবুল হলে বাকি সবকিছুও কবুল হয়।')
  ],
  qiyam: [q('Q73:20', 'Your Lord knows that you stand in prayer nearly two-thirds of the night, or half of it, or a third.', 'তোমার রব জানেন, তুমি রাতের প্রায় দুই-তৃতীয়াংশ, অর্ধেক বা এক-তৃতীয়াংশ সালাতে দাঁড়াও।')],
  tahajjud: [q('Q17:79', 'And during part of the night, pray with it as an extra prayer for you.', 'আর রাতের কিছু অংশে তা দিয়ে তাহাজ্জুদ পড়ো; এটি তোমার জন্য অতিরিক্ত।')],
  eid_prayer: [q('Q87:14-15', 'Successful is the one who purifies himself, remembers the name of his Lord and prays.', 'সফল সে, যে নিজেকে পরিশুদ্ধ করে, তার রবের নাম স্মরণ করে ও সালাত পড়ে।')],
  witr: [q('Q51:17-18', 'They slept but little of the night, and before dawn they would ask forgiveness.', 'রাতের সামান্যই তারা ঘুমাত, আর ভোরের আগে ক্ষমা চাইত।')],
  rawatib: [
    q('Q70:22-23', 'Except those who pray, who are constant in their prayer.', 'তবে মুসল্লিরা ছাড়া, যারা নিজেদের সালাতে নিয়মিত।'),
    k(11, 'Imam al-Sadiq', 'ইমাম জাফর সাদিক', 'The voluntary prayers are there to make up what falls short in the obligatory prayers.', 'নফল সালাত আছে ফরজ সালাতের ঘাটতি পূরণ করার জন্য।')
  ],
  tahiyyatul_masjid: [q('Q9:18', 'Only those who believe in Allah and the Last Day, and establish prayer, tend Allah’s mosques.', 'আল্লাহর মসজিদ আবাদ করে কেবল তারাই, যারা আল্লাহ ও শেষ দিনে ঈমান আনে ও সালাত কায়েম করে।')],
  istikhara: [q('Q28:68', 'Your Lord creates what He wills and chooses.', 'তোমার রব যা চান সৃষ্টি করেন ও পছন্দ করেন।')],
  tawbah: [q('Q66:8', 'O believers, turn to Allah in sincere repentance.', 'হে মুমিনরা, আল্লাহর কাছে খাঁটি তওবা করো।')]
});

export const JAFARI_NOTES = Object.freeze({
  witr: ['In Ja‘fari practice Witr is the closing rak‘ah of the night prayer.', 'জাফরি চর্চায় বিতর হলো রাতের নামাজের শেষ রাকাত।'],
  eid_prayer: ['Only the Qur’an is cited here; narrations differ in detail.', 'এখানে শুধু কুরআন উল্লেখ করা হলো; বর্ণনায় খুঁটিনাটি ভিন্নতা আছে।']
});

export const JAFARI_HIDDEN = Object.freeze(['duha', 'awwabin', 'tarawih']);

export function evidenceSet(school) { return school === 'jafari' ? 'jafari' : 'sunni'; }

/** Evidence entries for a prayer in the given school: [{kind, ref, en|text...}] */
export function evidenceFor(key, school, lang = 'en') {
  const set = evidenceSet(school) === 'jafari' ? JAFARI_EVIDENCE : SUNNI_EVIDENCE;
  const notes = evidenceSet(school) === 'jafari' ? JAFARI_NOTES : SUNNI_NOTES;
  const items = set[key];
  if (!items) return null;
  const bn = lang === 'bn';
  return {
    items: items.map(item => ({
      kind: item.kind,
      text: bn ? item.bn : item.en,
      ref: item.kind === 'quran' ? sourceLabel(item.ref, bn ? 'bn' : 'en') : (bn ? item.srcBn : item.src)
    })),
    note: notes[key] ? notes[key][bn ? 1 : 0] : ''
  };
}
