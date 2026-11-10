/* Today's Progress headline for date-specific (Hijri) days (v1.3.1, trimmed in v1.3.2):
   Eid, Arafah, Ashura, Ramadan, the last ten nights and so on keep priority. On
   every other day the card shows the conversational line from progress-lines.js
   (the weekday, progress and fallback tiers moved there or were retired).
   Only well-known, authentic claims are made; where scholars or schools differ
   the neutral wording already used elsewhere in the app is kept, and in Ja'fari
   mode Sunni-specific items (Tarawih, the 27th-night convention, Monday/Thursday
   and Ashura fasting) are not shown. Pure: callers pass dates and localized
   prayer names/times, so the output is deterministic and unit-tested.

   Hijri inputs: `dayHijri` is the Umm al-Qura date of the civil prayer day
   (day-time observances); `nightHijri` follows the sunset boundary (night
   observances: last ten nights, Laylat al-Qadr, mid-Sha'ban). Both are
   estimates; local moon sighting may differ by a day. */

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const bnNum = value => String(value).replace(/[0-9]/g, d => BN_DIGITS[d]);

function line(tier, key, en, bn, lang) {
  const pick = lang === 'bn' ? bn : en;
  return { tier, key, title: pick[0], detail: pick[1] };
}

/**
 * @param {object} input
 *   lang 'en'|'bn'; shia boolean; weekday 0-6 of the prayer day;
 *   dayHijri/nightHijri {day, month, year} or null; fardDone 0-5;
 *   next {name, time} (localized next obligatory prayer today) or null;
 *   maghribTime / ishaTime localized strings or null; afterMaghrib boolean;
 *   hasTimes boolean (false when no location is set yet);
 *   reflection {text, source} for the day (tier 4), already localized.
 */
export function dayStatus(input = {}) {
  const { lang = 'en', shia = false, weekday = -1, dayHijri = null, nightHijri = null,
    fardDone = 0, next = null, maghribTime = null, ishaTime = null, afterMaghrib = false, hasTimes = true, reflection = null } = input;
  const n = value => (lang === 'bn' ? bnNum(value) : String(value));
  const d = dayHijri || {}, night = nightHijri || dayHijri || {};
  const is = (h, month, day) => h.month === month && h.day === day;

  /* ---------- 1. date-specific ---------- */
  if (is(d, 10, 1)) return line(1, 'eid-fitr',
    ['Eid Mubarak: Eid al-Fitr', 'The Eid prayer is offered in the morning after sunrise; follow your local Eid congregation.'],
    ['ঈদ মোবারক: ঈদুল ফিতর', 'ঈদের নামাজ সূর্যোদয়ের পর সকালে আদায় করা হয়; স্থানীয় ঈদের জামাতের সময় অনুসরণ করুন।'], lang);
  if (is(d, 12, 10)) return line(1, 'eid-adha',
    ['Eid Mubarak: Eid al-Adha', 'The Eid prayer is offered in the morning after sunrise; follow your local Eid congregation.'],
    ['ঈদ মোবারক: ঈদুল আজহা', 'ঈদের নামাজ সূর্যোদয়ের পর সকালে আদায় করা হয়; স্থানীয় ঈদের জামাতের সময় অনুসরণ করুন।'], lang);
  if (is(d, 12, 9)) return line(1, 'arafah',
    ['Day of Arafah', shia ? 'A day of supplication and remembrance of Allah.' : 'A day of supplication and remembrance; fasting it is recommended for those not on Hajj.'],
    ['আরাফার দিন', shia ? 'দোয়া ও আল্লাহর জিকিরের দিন।' : 'দোয়া ও জিকিরের দিন; হজে না থাকলে এ দিনের রোজা মুস্তাহাব।'], lang);
  if (d.month === 12 && d.day >= 11 && d.day <= 13) return line(1, 'tashriq',
    ['Days of Tashriq', 'Days of eating, drinking and the remembrance of Allah.'],
    ['আইয়ামে তাশরিক', 'পানাহার ও আল্লাহর জিকিরের দিন।'], lang);
  if (d.month === 12 && d.day >= 1 && d.day <= 8) return line(1, 'dhul-hijjah',
    [`Dhul Hijjah day ${n(d.day)} of 10`, 'Among the best days of the year for good deeds and remembrance.'],
    [`জিলহজ ${n(d.day)} · প্রথম দশ দিন`, 'নেক আমল ও জিকিরের জন্য বছরের শ্রেষ্ঠ দিনগুলোর অন্তর্ভুক্ত।'], lang);
  if (night.month === 9 && night.day >= 21) {
    const commonlyQadr = !shia && night.day === 27;
    const odd = !shia && night.day % 2 === 1;
    return line(1, commonlyQadr ? 'qadr-27' : 'last-ten',
      [commonlyQadr ? 'Night 27 of Ramadan' : `Last ten nights: night ${n(night.day)}`,
        commonlyQadr ? 'Commonly observed as Laylat al-Qadr; the exact night is not fixed, so seek it throughout the last ten.'
          : odd ? 'An odd night: seek Laylat al-Qadr with night prayer, Qur’an and supplication.'
            : 'Seek Laylat al-Qadr with night prayer, Qur’an and supplication.'],
      [commonlyQadr ? '২৭ রমজানের রাত' : `শেষ দশ রাত · ${n(night.day)} রমজানের রাত`,
        commonlyQadr ? 'লাইলাতুল কদর হিসেবে প্রচলিত; নির্দিষ্ট রাত নিশ্চিত নয়, তাই শেষ দশ রাতজুড়ে অনুসন্ধান করুন।'
          : odd ? 'বিজোড় রাত: রাতের নামাজ, কুরআন ও দোয়ায় লাইলাতুল কদর অনুসন্ধান করুন।'
            : 'রাতের নামাজ, কুরআন ও দোয়ায় লাইলাতুল কদর অনুসন্ধান করুন।'], lang);
  }
  if (d.month === 9 && night.month === 10 && night.day === 1) return line(1, 'eid-eve',
    ['Eid al-Fitr begins tonight', 'Eid Mubarak. The Eid prayer is tomorrow morning after sunrise.'],
    ['আজ রাত থেকে ঈদুল ফিতর', 'ঈদ মোবারক। ঈদের নামাজ আগামীকাল সকালে সূর্যোদয়ের পর।'], lang);
  if (d.month === 9 && d.day >= 1) {
    const evening = afterMaghrib
      ? (shia
        ? [ishaTime ? `Night prayer and Qur’an after Isha (${ishaTime}).` : 'Night prayer and Qur’an after Isha.', ishaTime ? `ইশার (${ishaTime}) পর রাতের নামাজ ও কুরআন।` : 'ইশার পর রাতের নামাজ ও কুরআন।']
        : [ishaTime ? `Tarawih after Isha (${ishaTime}).` : 'Tarawih after Isha.', ishaTime ? `ইশার (${ishaTime}) পর তারাবিহ।` : 'ইশার পর তারাবিহ।'])
      : [maghribTime ? `Ramadan Mubarak · Iftar at Maghrib, ${maghribTime}.` : 'Ramadan Mubarak · Iftar at Maghrib.',
        maghribTime ? `রমজান মোবারক · ইফতার মাগরিবে, ${maghribTime}।` : 'রমজান মোবারক · ইফতার মাগরিবে।'];
    return line(1, afterMaghrib ? 'ramadan-night' : 'ramadan-day',
      [`Ramadan day ${n(d.day)}`, evening[0]], [`${n(d.day)} রমজান`, evening[1]], lang);
  }
  if (is(night, 8, 15)) return line(1, 'mid-shaban',
    ['Mid-Sha‘ban (Shab-e-Barat)', 'Scholars differ over reports about this night; no fixed special prayer is established.'],
    ['মধ্য শাবান (শবে বরাত)', 'এ রাত সম্পর্কে বর্ণনায় আলেমদের মতভেদ রয়েছে; নির্দিষ্ট বিশেষ নামাজ প্রতিষ্ঠিত নয়।'], lang);
  if (d.month === 1 && (d.day === 9 || d.day === 10)) {
    const ashura = d.day === 10;
    return line(1, ashura ? 'ashura' : 'tasua',
      [ashura ? 'Day of Ashura · 10 Muharram' : 'Tasu‘a · 9 Muharram',
        shia ? 'A day of remembrance; observance differs among schools.' : (ashura ? 'Fasting this day is a recommended Sunnah.' : 'Fasting the 9th along with Ashura is reported in the Sunnah.')],
      [ashura ? 'আশুরার দিন · ১০ মুহাররম' : 'তাসুআ · ৯ মুহাররম',
        shia ? 'স্মরণের দিন; মাজহাবভেদে পালন ভিন্ন।' : (ashura ? 'এ দিনের রোজা সুন্নাত।' : 'আশুরার সঙ্গে ৯ তারিখের রোজার কথা সুন্নাহে এসেছে।')], lang);
  }
  if (is(d, 1, 1)) return line(1, 'new-year',
    [`Islamic New Year · ${n(d.year)} AH`, 'The first day of Muharram, one of the sacred months.'],
    [`হিজরি নববর্ষ · ${n(d.year)} হিজরি`, 'মুহাররমের প্রথম দিন; সম্মানিত মাসগুলোর একটি।'], lang);
  if (d.day >= 13 && d.day <= 15 && d.month !== 12 && d.month !== 9) return line(1, 'white-days',
    [`The white days · ${n(d.day)}th of the month`, 'Fasting the 13th, 14th and 15th of the lunar month is a recommended voluntary fast.'],
    [`আইয়ামে বিজ · মাসের ${n(d.day)} তারিখ`, 'চান্দ্রমাসের ১৩, ১৪ ও ১৫ তারিখের রোজা মুস্তাহাব নফল রোজা।'], lang);

  /* Everything else (progress, weekday, no-location) is the conversational line
     from src/progress-lines.js; the day's reflection lives in the Sunnah & Seerah carousel. */
  return null;
}
