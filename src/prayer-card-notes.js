/* One-line note for each Daily prayers card (v1.3.2), switched by school.
   Sunni schools (Hanafi, Shafi'i, Maliki, Hanbali) share one set: Qur'an or a
   Bukhari/Muslim hadith accepted by all four. Ja'fari has its own set: Qur'an or
   al-Kafi (the same narrations as src/prayer-evidence.js). No rulings, no
   contested tafsir. Entry: key -> {en, bn, ref} (Qur'an, "Q<surah>:<ayah>") or
   {en, bn, src, srcBn} (hadith). */

import { sourceLabel } from './daily-reflections.js';
import { evidenceSet } from './prayer-evidence.js';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnNum = text => String(text).replace(/[0-9]/g, d => BN_DIGITS[d]);
const KAFI = n => [`al-Kāfi, Book of Prayer, no. ${n}`, `আল-কাফি, কিতাবুস নামাজ, নং ${bnNum(n)}`];

export const SUNNI_CARD_NOTES = Object.freeze({
  fajr:    { en: 'The two rak‘ahs of Fajr are better than the world and all in it.', bn: 'ফজরের দুই রাকাত দুনিয়া ও তার সবকিছুর চেয়ে উত্তম।', src: 'Sahih Muslim 725', srcBn: 'সহিহ মুসলিম ৭২৫' },
  dhuhr:   { en: 'Establish prayer from the sun’s decline.', bn: 'সূর্য ঢলে পড়ার সময় থেকে নামাজ কায়েম করো।', ref: 'Q17:78' },
  asr:     { en: 'Whoever prays the two cool prayers enters Paradise.', bn: 'যে দুই ঠান্ডা সময়ের নামাজ পড়ে, সে জান্নাতে যাবে।', src: 'Sahih al-Bukhari 574', srcBn: 'সহিহ বুখারি ৫৭৪' },
  maghrib: { en: 'Prayer at the two ends of the day and the night’s early hours.', bn: 'দিনের দুই প্রান্তে ও রাতের প্রথম প্রহরে নামাজ।', ref: 'Q11:114' },
  isha:    { en: '‘Isha in congregation is like half the night in prayer.', bn: 'জামাতে ইশা যেন অর্ধরাত নামাজে কাটানো।', src: 'Sahih Muslim 656', srcBn: 'সহিহ মুসলিম ৬৫৬' }
});

export const JAFARI_CARD_NOTES = Object.freeze({
  fajr:    { en: 'The dawn recitation is witnessed.', bn: 'ভোরের কুরআন পাঠে সাক্ষী রাখা হয়।', ref: 'Q17:78' },
  dhuhr:   { en: 'Keep the prayers’ limits and times, and meet Allah with a covenant.', bn: 'নামাজের সীমা ও সময় রক্ষা করো, আল্লাহর কাছে প্রতিশ্রুতি নিয়ে হাজির হবে।', src: KAFI(1)[0], srcBn: KAFI(1)[1] },
  asr:     { en: 'Guard the prayers, and stand in devotion.', bn: 'নামাজগুলোর হেফাজত করো, বিনীত হয়ে দাঁড়াও।', ref: 'Q2:238' },
  maghrib: { en: 'Prayer at the two ends of the day and the night’s early hours.', bn: 'দিনের দুই প্রান্তে ও রাতের প্রথম প্রহরে নামাজ।', ref: 'Q11:114' },
  isha:    { en: 'The first thing a servant is asked about is prayer.', bn: 'বান্দাকে সবার আগে নামাজের হিসাব দিতে হবে।', src: KAFI(4)[0], srcBn: KAFI(4)[1] }
});

export const PRAYER_CARD_NOTES = SUNNI_CARD_NOTES;

export function cardNote(prayerKey, lang = 'en', school = 'hanafi') {
  const set = evidenceSet(school) === 'jafari' ? JAFARI_CARD_NOTES : SUNNI_CARD_NOTES;
  const note = set[prayerKey];
  if (!note) return null;
  const bn = lang === 'bn';
  return { text: bn ? note.bn : note.en, ref: note.ref ? sourceLabel(note.ref, bn ? 'bn' : 'en') : (bn ? note.srcBn : note.src) };
}
