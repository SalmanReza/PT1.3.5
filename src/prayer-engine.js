// Offline solar prayer-time engine.
// Default profile (unchanged): Karachi convention, Fajr 18°, Isha 18°; Hanafi
// Asr shadow factor 2; Dhuhr begins 6 minutes after solar noon (Zawal margin).
// v1.3.1 adds the standard calculation methods (parameters as published by
// praytimes.org and the adhan library), a separate Asr school and optional
// high-latitude rules. Everything is computed locally; no network access.
const rad = value => value * Math.PI / 180;
const deg = value => value * 180 / Math.PI;
const norm = value => ((value % 360) + 360) % 360;

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function sunPosition(jd) {
  const days = jd - 2451545.0;
  const meanAnomaly = rad(norm(357.529 + 0.98560028 * days));
  const meanLongitude = norm(280.459 + 0.98564736 * days);
  const longitude = rad(norm(meanLongitude + 1.915 * Math.sin(meanAnomaly) + 0.020 * Math.sin(2 * meanAnomaly)));
  const obliquity = rad(23.439 - 0.00000036 * days);
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(longitude));
  const rightAscension = norm(deg(Math.atan2(Math.cos(obliquity) * Math.sin(longitude), Math.cos(longitude))));
  let equationOfTime = meanLongitude / 15 - rightAscension / 15;
  while (equationOfTime > 12) equationOfTime -= 24;
  while (equationOfTime < -12) equationOfTime += 24;
  return { declination, equationOfTime };
}

function hourAngle(angle, latitude, declination) {
  const numerator = Math.sin(rad(angle)) - Math.sin(rad(latitude)) * Math.sin(declination);
  const denominator = Math.cos(rad(latitude)) * Math.cos(declination);
  const ratio = numerator / denominator;
  return Math.acos(Math.max(-1, Math.min(1, ratio)));
}

function asrAngle(factor, latitude, declination) {
  return deg(Math.atan(1 / (factor + Math.tan(Math.abs(rad(latitude) - declination)))));
}

function localDateAt(date, decimalHour) {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return new Date(midnight.getTime() + decimalHour * 3600000);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/* Calculation methods. Angles are degrees below the horizon; ishaInterval is
   minutes after sunset (maghrib); maghribAngle replaces sunset for Maghrib
   (Ja'fari: disappearance of the eastern redness); adjustments are minutes. */
export const CALCULATION_METHODS = Object.freeze({
  karachi:   { en: 'University of Islamic Sciences, Karachi (18° / 18°)', bn: 'ইউনিভার্সিটি অব ইসলামিক সায়েন্সেস, করাচি (১৮° / ১৮°)', fajr: 18, isha: 18 },
  mwl:       { en: 'Muslim World League (18° / 17°)', bn: 'মুসলিম ওয়ার্ল্ড লীগ (১৮° / ১৭°)', fajr: 18, isha: 17 },
  isna:      { en: 'ISNA, North America (15° / 15°)', bn: 'ইসনা, উত্তর আমেরিকা (১৫° / ১৫°)', fajr: 15, isha: 15 },
  egypt:     { en: 'Egyptian General Authority of Survey (19.5° / 17.5°)', bn: 'মিশরীয় জেনারেল অথরিটি অব সার্ভে (১৯.৫° / ১৭.৫°)', fajr: 19.5, isha: 17.5 },
  ummalqura: { en: 'Umm al-Qura, Makkah (18.5°, Isha 90 min; 120 in Ramadan)', bn: 'উম্মুল কুরা, মক্কা (১৮.৫°, এশা ৯০ মিনিট; রমজানে ১২০)', fajr: 18.5, ishaInterval: 90, ramadanIshaInterval: 120 },
  gulf:      { en: 'Gulf Region (19.5°, Isha 90 min)', bn: 'উপসাগরীয় অঞ্চল (১৯.৫°, এশা ৯০ মিনিট)', fajr: 19.5, ishaInterval: 90 },
  kuwait:    { en: 'Kuwait (18° / 17.5°)', bn: 'কুয়েত (১৮° / ১৭.৫°)', fajr: 18, isha: 17.5 },
  qatar:     { en: 'Qatar (18°, Isha 90 min)', bn: 'কাতার (১৮°, এশা ৯০ মিনিট)', fajr: 18, ishaInterval: 90 },
  singapore: { en: 'MUIS, Singapore (20° / 18°)', bn: 'মুইস, সিঙ্গাপুর (২০° / ১৮°)', fajr: 20, isha: 18 },
  turkey:    { en: 'Diyanet, Turkey (18° / 17°, with Diyanet offsets)', bn: 'দিয়ানেত, তুরস্ক (১৮° / ১৭°, দিয়ানেতের সমন্বয়সহ)', fajr: 18, isha: 17, adjustments: { sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7 } },
  tehran:    { en: 'Institute of Geophysics, Tehran (17.7° / 14°, Maghrib 4.5°)', bn: 'ইনস্টিটিউট অব জিওফিজিক্স, তেহরান (১৭.৭° / ১৪°, মাগরিব ৪.৫°)', fajr: 17.7, isha: 14, maghribAngle: 4.5, shia: true },
  jafari:    { en: 'Shia Ithna Ashari, Leva Institute, Qum (16° / 14°, Maghrib 4°)', bn: 'শিয়া ইসনা আশারি, লেভা ইনস্টিটিউট, কোম (১৬° / ১৪°, মাগরিব ৪°)', fajr: 16, isha: 14, maghribAngle: 4, shia: true }
});

/* Asr school: shadow factor 2 (Hanafi) or 1 (Shafi'i, Maliki, Hanbali, Ja'fari). */
export const SCHOOLS = Object.freeze({
  hanafi:  { en: 'Hanafi (Asr shadow factor 2)', bn: 'হানাফি (আসর ছায়া দ্বিগুণ)', asrFactor: 2 },
  shafii:  { en: 'Shafi‘i (Asr shadow factor 1)', bn: 'শাফেয়ি (আসর ছায়া এক গুণ)', asrFactor: 1 },
  maliki:  { en: 'Maliki (Asr shadow factor 1)', bn: 'মালেকি (আসর ছায়া এক গুণ)', asrFactor: 1 },
  hanbali: { en: 'Hanbali (Asr shadow factor 1)', bn: 'হাম্বলি (আসর ছায়া এক গুণ)', asrFactor: 1 },
  jafari:  { en: 'Ja‘fari (Asr shadow factor 1)', bn: 'জাফরি (আসর ছায়া এক গুণ)', asrFactor: 1 }
});

export const HIGH_LATITUDE_RULES = Object.freeze({
  none:    { en: 'None (pure angles)', bn: 'নেই (শুধু কোণ)' },
  middle:  { en: 'Middle of the night', bn: 'রাতের মধ্যভাগ' },
  seventh: { en: 'One-seventh of the night', bn: 'রাতের এক-সপ্তমাংশ' },
  angle:   { en: 'Angle-based', bn: 'কোণভিত্তিক' }
});

export const DEFAULT_PROFILE = Object.freeze({ method: 'karachi', school: 'hanafi', highLatitude: 'none' });
export const ZAWAL_MARGIN_MINUTES = 6;

export function sanitizeProfile(profile = {}) {
  const value = profile && typeof profile === 'object' ? profile : {};
  return {
    method: Object.hasOwn(CALCULATION_METHODS, value.method) ? value.method : DEFAULT_PROFILE.method,
    school: Object.hasOwn(SCHOOLS, value.school) ? value.school : DEFAULT_PROFILE.school,
    highLatitude: Object.hasOwn(HIGH_LATITUDE_RULES, value.highLatitude) ? value.highLatitude : DEFAULT_PROFILE.highLatitude
  };
}

/** Sensible preset when the school changes: Ja'fari ↔ a Shia method. */
export function presetForSchool(school, currentMethod) {
  const method = CALCULATION_METHODS[currentMethod] ? currentMethod : DEFAULT_PROFILE.method;
  if (school === 'jafari') return CALCULATION_METHODS[method].shia ? method : 'jafari';
  return CALCULATION_METHODS[method].shia ? (school === 'hanafi' ? 'karachi' : 'mwl') : method;
}

export function isShiaProfile(profile) {
  return sanitizeProfile(profile).school === 'jafari';
}

function hourAngleOrNull(angle, latitude, declination) {
  const ratio = (Math.sin(rad(angle)) - Math.sin(rad(latitude)) * Math.sin(declination)) / (Math.cos(rad(latitude)) * Math.cos(declination));
  return Math.abs(ratio) <= 1 ? Math.acos(ratio) : null;
}

/**
 * @param {Date} date local civil date
 * @param {object} options {method, school, highLatitude, ramadan}
 */
export function calculatePrayerTimes(date, latitude, longitude, timezoneOffsetMinutes = -date.getTimezoneOffset(), options = {}) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new Error('A valid local date is required');
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new Error('Invalid coordinates');
  }
  if (!Number.isFinite(timezoneOffsetMinutes) || Math.abs(timezoneOffsetMinutes) > 14 * 60) {
    throw new Error('Invalid time-zone offset');
  }
  const profile = sanitizeProfile(options);
  const method = CALCULATION_METHODS[profile.method];
  const asrFactor = SCHOOLS[profile.school].asrFactor;

  // Calculate using the selected civil date and its device-local UTC offset.
  const offsetHours = timezoneOffsetMinutes / 60;
  const solarFor = dayOffset => {
    const noonUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset, 12) - offsetHours * 3600000;
    const sun = sunPosition(julianDay(new Date(noonUtc)));
    return { sun, noonHour: 12 + offsetHours - lon / 15 - sun.equationOfTime + dayOffset * 24 };
  };
  const { sun, noonHour: solarNoonHour } = solarFor(0);
  const angleHours = angle => deg(hourAngle(angle, lat, sun.declination)) / 15;
  const exactHours = angle => { const h = hourAngleOrNull(angle, lat, sun.declination); return h === null ? null : deg(h) / 15; };

  const solarNoon = localDateAt(date, solarNoonHour);
  const sunrise = localDateAt(date, solarNoonHour - angleHours(-0.833));
  const sunset = localDateAt(date, solarNoonHour + angleHours(-0.833));
  let fajr = localDateAt(date, solarNoonHour - angleHours(-method.fajr));
  const asr = localDateAt(date, solarNoonHour + deg(hourAngle(asrAngle(asrFactor, lat, sun.declination), lat, sun.declination)) / 15);
  let maghrib = method.maghribAngle ? localDateAt(date, solarNoonHour + angleHours(-method.maghribAngle)) : sunset;
  const interval = method.ishaInterval ? (options.ramadan && method.ramadanIshaInterval ? method.ramadanIshaInterval : method.ishaInterval) : 0;
  let isha = interval ? addMinutes(sunset, interval) : localDateAt(date, solarNoonHour + angleHours(-method.isha));

  // Optional high-latitude safeguards (night = sunset → next sunrise).
  if (profile.highLatitude !== 'none') {
    const next = solarFor(1);
    const nextRiseHours = deg(hourAngle(-0.833, lat, next.sun.declination)) / 15;
    const nextSunrise = localDateAt(date, next.noonHour - nextRiseHours);
    const night = nextSunrise.getTime() - sunset.getTime();
    const portion = angle => profile.highLatitude === 'middle' ? 1 / 2 : profile.highLatitude === 'seventh' ? 1 / 7 : angle / 60;
    const safeFajr = new Date(sunrise.getTime() - portion(method.fajr) * night);
    if (exactHours(-method.fajr) === null || fajr < safeFajr) fajr = safeFajr;
    if (!interval) {
      const safeIsha = new Date(sunset.getTime() + portion(method.isha) * night);
      if (exactHours(-method.isha) === null || isha > safeIsha) isha = safeIsha;
    }
  }

  // Isha never begins before Maghrib (possible only with a Maghrib angle under a
  // high-latitude safeguard, e.g. Ja'fari at 60°N in June).
  if (isha <= maghrib) isha = addMinutes(maghrib, 1);
  const adjust = method.adjustments || {};
  const zawalStart = addMinutes(solarNoon, -ZAWAL_MARGIN_MINUTES);
  // Dhuhr begins after the Zawal margin (or the method's own later offset).
  const dhuhr = addMinutes(solarNoon, Math.max(ZAWAL_MARGIN_MINUTES, adjust.dhuhr || 0));
  return {
    fajr: addMinutes(fajr, adjust.fajr || 0),
    sunrise: addMinutes(sunrise, adjust.sunrise || 0),
    solarNoon,
    zawalStart,
    zawalEnd: addMinutes(solarNoon, ZAWAL_MARGIN_MINUTES),
    dhuhr,
    asr: addMinutes(asr, adjust.asr || 0),
    sunset,
    maghrib: addMinutes(maghrib, adjust.maghrib || 0),
    isha: addMinutes(isha, adjust.isha || 0)
  };
}

/** Ja'fari midnight (end of Isha): halfway between sunset and the next Fajr. */
export function jafariMidnight(sunset, nextFajr) {
  return new Date(sunset.getTime() + (nextFajr.getTime() - sunset.getTime()) / 2);
}

export function formatTime(date, locale = 'en') {
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date);
}

export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
