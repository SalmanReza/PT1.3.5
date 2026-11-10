/* Offline sun and moon maths for the top-bar dial (v1.3.2). Pure functions of a
   date and a position; no network. Standard low-precision formulas:
   - Sun: Meeus ch. 25 (mean longitude, equation of centre, obliquity), accurate to
     about 0.01 degree: declination, altitude and azimuth (from north, clockwise).
   - Moon: Meeus ch. 48 phase angle from the mean elongation with the principal
     corrections, illuminated fraction k = (1 + cos i) / 2; accurate to about 1 %.
   - Moon position: the low-precision series used by SunCalc (mean elements plus the
     principal longitude, latitude and distance terms; about 0.3 degree), with the
     topocentric parallax correction. Sun and moon rise/set are found by scanning the
     altitude and interpolating the horizon crossing (a few minutes).
   The sky panel maps a body's time above the horizon onto an arc (see arcPoint). */
const RAD = Math.PI / 180;
const norm = deg => ((deg % 360) + 360) % 360;
export const julianDay = date => date.getTime() / 86400000 + 2440587.5;

export function sunPosition(date, latitude, longitude) {
  const n = julianDay(date) - 2451545.0;
  const L = norm(280.460 + 0.9856474 * n);
  const g = norm(357.528 + 0.9856003 * n) * RAD;
  const lambda = norm(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD;
  const epsilon = (23.439 - 0.0000004 * n) * RAD;
  const rightAscension = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  const declination = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  const gmstHours = 18.697374558 + 24.06570982441908 * n;
  const hourAngle = norm(gmstHours * 15 + longitude) * RAD - rightAscension;
  const phi = latitude * RAD;
  const sinAlt = Math.sin(phi) * Math.sin(declination) + Math.cos(phi) * Math.cos(declination) * Math.cos(hourAngle);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const azimuth = Math.atan2(-Math.sin(hourAngle), Math.tan(declination) * Math.cos(phi) - Math.sin(phi) * Math.cos(hourAngle));
  return { altitude: altitude / RAD, azimuth: norm(azimuth / RAD), declination: declination / RAD };
}

/** Moon phase: illuminated fraction (0 new .. 1 full), waxing/waning, and the Sun-Moon elongation in degrees (0 new, 180 full). */
export function moonPhase(date) {
  const T = (julianDay(date) - 2451545.0) / 36525;
  const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = norm(357.5291092 + 35999.0502909 * T) * RAD;
  const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * RAD;
  const d = D * RAD;
  const i = 180 - D - 6.289 * Math.sin(Mp) + 2.100 * Math.sin(M) - 1.274 * Math.sin(2 * d - Mp) - 0.658 * Math.sin(2 * d) - 0.214 * Math.sin(2 * Mp) - 0.110 * Math.sin(d);
  const illumination = (1 + Math.cos(i * RAD)) / 2;
  const waxing = D < 180;
  return { illumination: Math.max(0, Math.min(1, illumination)), waxing, elongation: D };
}

/** Phase name from the illuminated fraction and direction. */
export function phaseName(phase) {
  const k = phase.illumination;
  if (k < 0.03) return 'new';
  if (k > 0.97) return 'full';
  if (Math.abs(k - 0.5) < 0.06) return phase.waxing ? 'first-quarter' : 'last-quarter';
  return `${phase.waxing ? 'waxing' : 'waning'}-${k < 0.5 ? 'crescent' : 'gibbous'}`;
}

/** Path of the lit part of the moon disc (centre cx,cy, radius r). `mirror` flips it for the southern hemisphere. */
export function moonLitPath(illumination, waxing, cx, cy, r, mirror = false) {
  const k = Math.max(0, Math.min(1, illumination));
  const rx = Math.round(r * Math.abs(1 - 2 * k) * 100) / 100;
  const right = waxing !== mirror; // lit limb on the right
  const outer = right ? 1 : 0;
  const crescent = k < 0.5;
  const term = right ? (crescent ? 0 : 1) : (crescent ? 1 : 0);
  return `M${cx} ${cy - r}A${r} ${r} 0 0 ${outer} ${cx} ${cy + r}A${rx} ${r} 0 0 ${term} ${cx} ${cy - r}Z`;
}

const HORIZON = -0.833; // upper limb + refraction, for both bodies (topocentric for the moon)
const EARTH_RADIUS_KM = 6378.14;

/** Moon right ascension/declination (degrees) and distance (km), low precision. */
export function moonEquatorial(date) {
  const d = julianDay(date) - 2451545.0;
  const L = (218.316 + 13.176396 * d) * RAD;
  const M = (134.963 + 13.064993 * d) * RAD;
  const F = (93.272 + 13.229350 * d) * RAD;
  const lon = L + 6.289 * RAD * Math.sin(M);
  const lat = 5.128 * RAD * Math.sin(F);
  const distance = 385001 - 20905 * Math.cos(M);
  const e = 23.4397 * RAD;
  const ra = Math.atan2(Math.sin(lon) * Math.cos(e) - Math.tan(lat) * Math.sin(e), Math.cos(lon));
  const dec = Math.asin(Math.sin(lat) * Math.cos(e) + Math.cos(lat) * Math.sin(e) * Math.sin(lon));
  return { ra: norm(ra / RAD), dec: dec / RAD, distance };
}

/** Topocentric moon altitude and azimuth (degrees; azimuth from north, clockwise). */
export function moonPosition(date, latitude, longitude) {
  const { ra, dec, distance } = moonEquatorial(date);
  const n = julianDay(date) - 2451545.0;
  const H = (norm((18.697374558 + 24.06570982441908 * n) * 15 + longitude - ra)) * RAD;
  const phi = latitude * RAD, delta = dec * RAD;
  const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(H);
  const geo = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const azimuth = Math.atan2(-Math.sin(H), Math.tan(delta) * Math.cos(phi) - Math.sin(phi) * Math.cos(H));
  const altitude = geo - Math.asin((EARTH_RADIUS_KM / distance) * Math.cos(geo)); // parallax
  return { altitude: altitude / RAD, azimuth: norm(azimuth / RAD), distance };
}

/** Horizon crossings of `altitudeAt(ms)` between two instants: [{ at (ms), rising }]. */
export function horizonCrossings(altitudeAt, fromMs, toMs, stepMs = 360000) {
  const out = [];
  let t0 = fromMs, a0 = altitudeAt(t0) - HORIZON;
  for (let t1 = fromMs + stepMs; t1 <= toMs + stepMs; t1 += stepMs) {
    const a1 = altitudeAt(t1) - HORIZON;
    if ((a0 < 0) !== (a1 < 0)) {
      let lo = t0, hi = t1, flo = a0;
      for (let i = 0; i < 12; i++) { const mid = (lo + hi) / 2; const fm = altitudeAt(mid) - HORIZON; if ((fm < 0) === (flo < 0)) { lo = mid; flo = fm; } else hi = mid; }
      out.push({ at: Math.round((lo + hi) / 2), rising: a1 > a0 });
    }
    t0 = t1; a0 = a1;
  }
  return out;
}

/** Sunrise and sunset (Dates) of the 24 hours starting at `dayStart`; null when the sun does not cross the horizon. */
export function sunTimes(dayStart, latitude, longitude) {
  const crossings = horizonCrossings(ms => sunPosition(new Date(ms), latitude, longitude).altitude, dayStart.getTime(), dayStart.getTime() + 86400000, 300000);
  const rise = crossings.find(c => c.rising), set = crossings.find(c => !c.rising && (!rise || c.at > rise.at));
  return { sunrise: rise ? new Date(rise.at) : null, sunset: set ? new Date(set.at) : null };
}

/** The moon's pass around `now`: whether it is up, and its rise and set (Dates; the pass it is in, or the next one). */
export function moonPass(now, latitude, longitude) {
  const t = now.getTime();
  const alt = ms => moonPosition(new Date(ms), latitude, longitude).altitude;
  const up = alt(t) > HORIZON;
  const crossings = horizonCrossings(alt, t - 30 * 3600000, t + 30 * 3600000);
  let rise = null, set = null;
  if (up) {
    rise = [...crossings].reverse().find(c => c.rising && c.at <= t);
    set = crossings.find(c => !c.rising && c.at > t);
  } else {
    rise = crossings.find(c => c.rising && c.at > t);
    set = rise ? crossings.find(c => !c.rising && c.at > rise.at) : null;
  }
  return { up, rise: rise ? new Date(rise.at) : null, set: set ? new Date(set.at) : null };
}

/** Fraction (0..1) of a body's pass at `now`, or null when unknown. */
export function passFraction(rise, set, now) {
  if (!rise || !set || set <= rise) return null;
  return Math.max(0, Math.min(1, (now.getTime() - rise.getTime()) / (set.getTime() - rise.getTime())));
}

/** Point on the sky arc for a pass fraction f (0 = left horizon, 1 = right horizon): an elliptical arc whose
 *  motion slows near the horizon, like a real path. horizon is the y of the horizon line, apex the y of the top. */
export function arcPoint(f, width, horizonY, apexY, margin) {
  const rx = (width - 2 * margin) / 2, ry = horizonY - apexY;
  return { x: margin + rx - rx * Math.cos(Math.PI * f), y: horizonY - ry * Math.sin(Math.PI * f) };
}

export function arcPath(width, horizonY, apexY, margin) {
  const rx = (width - 2 * margin) / 2, ry = horizonY - apexY;
  const r = n => Math.round(n * 10) / 10;
  return `M${r(margin)} ${r(horizonY)}A${r(rx)} ${r(ry)} 0 0 1 ${r(width - margin)} ${r(horizonY)}`;
}

const msOf = value => (value instanceof Date ? value.getTime() : Number(value));
const clamp01 = x => Math.max(0, Math.min(1, x));

/** v1.3.3 time axis: x is LINEAR in time between sunrise (f = 0) and sunset (f = 1); the height follows a sine, so
 *  the path is a smooth half-wave. The sun and moon sit at timeArcPoint(f), and a span of the day has an x-extent
 *  exactly proportional to its duration (the older elliptical arcPoint compresses time near the horizon). */
export function timeArcPoint(f, width, horizonY, apexY, margin) {
  return { x: margin + (width - 2 * margin) * f, y: horizonY - (horizonY - apexY) * Math.sin(Math.PI * f) };
}

export function timeArcPath(width, horizonY, apexY, margin, steps = 96) {
  const r = n => Math.round(n * 10) / 10;
  let d = '';
  for (let i = 0; i <= steps; i++) { const p = timeArcPoint(i / steps, width, horizonY, apexY, margin); d += `${i ? 'L' : 'M'}${r(p.x)} ${r(p.y)}`; }
  return d;
}

/** Forbidden-time zones: [{key, f0, f1}] with f the fraction of the daylight span, so
 *  (f1 - f0) = duration / (sunset - sunrise). Intervals are clipped to the daylight arc. */
export function zoneSpans(intervals, rise, set) {
  const r = msOf(rise), e = msOf(set);
  if (!Number.isFinite(r) || !Number.isFinite(e) || e <= r) return [];
  return (intervals || [])
    .map(item => ({ key: item.key, f0: clamp01((msOf(item.start) - r) / (e - r)), f1: clamp01((msOf(item.end) - r) / (e - r)) }))
    .filter(zone => zone.f1 > zone.f0);
}

/** Horizontal extent of a zone on the panel: x and width, exactly proportional to its duration. */
export function zoneRect(zone, width, margin) {
  const span = width - 2 * margin;
  return { x: margin + span * zone.f0, width: span * (zone.f1 - zone.f0) };
}

/** Path along the arc for one zone, from the same timeArcPoint the sun uses (first/last points are exactly f0 and f1). */
export function zonePath(f0, f1, width, horizonY, apexY, margin) {
  const steps = Math.max(2, Math.min(90, Math.ceil((f1 - f0) * 90)));
  const r = n => Math.round(n * 100) / 100;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const p = timeArcPoint(f0 + (f1 - f0) * (i / steps), width, horizonY, apexY, margin);
    d += `${i ? 'L' : 'M'}${r(p.x)} ${r(p.y)}`;
  }
  return d;
}

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Sky colour weights from the sun's altitude in degrees: night (deep sky and stars), twilight (warm horizon tint), day. */
export function skyWeights(sunAltitude) {
  const night = 1 - smooth(-18, -6, sunAltitude);
  const day = smooth(-4, 12, sunAltitude);
  const twilight = Math.max(0, 1 - Math.abs(sunAltitude + 2) / 12);
  return { night, twilight, day };
}

/** Sun glow strength 0..1: brightest at the day's highest point (solar noon). */
export function sunIntensity(altitude, maxAltitude) {
  if (altitude <= 0) return 0.25 * smooth(-1, 0, altitude);
  return Math.max(0.25, Math.min(1, Math.sin(altitude * RAD) / Math.max(0.2, Math.sin(Math.max(maxAltitude, 1) * RAD))));
}

/** Deterministic star field: n stars with x, y in 0..1 (y measured from the top of the sky), radius class, twinkle timing. */
export function starField(n = 96, seed = 1447) {
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return Array.from({ length: n }, (_, i) => {
    const x = rnd(), y = 0.05 + rnd() * 0.8, k = Math.floor(rnd() * 3);
    // layer 0 = far (tiny, steady), 1 = middle, 2 = near (largest, with a soft glow)
    return { x, y, r: [0.75, 1.05, 1.45][k], layer: k, twinkle: i % 3 === 0, delay: Math.round(rnd() * 60) / 10, duration: 2.4 + Math.round(rnd() * 30) / 10 };
  });
}

/** v1.3.4: sky colour from the sun's altitude. Keyframes (altitude in degrees) for the morning (rising) and the evening
 *  (setting) side; the three gradient stops are interpolated linearly in RGB between neighbouring keyframes, so the
 *  colour changes smoothly through pre-dawn, sunrise glow, midday, golden afternoon, sunset, dusk and night. */
const SKY_KEYS = [
  [-18, ['#060a22', '#131a4e', '#2a3170'], ['#060a22', '#131a4e', '#2a3170']],
  [-10, ['#10184a', '#2c3578', '#4e4f93'], ['#0f1648', '#2b2a68', '#4b3d84']],
  [-4,  ['#2f3f80', '#8a6aa8', '#e0a070'], ['#2b2766', '#8c4f88', '#e2704e']],
  [0.5, ['#4d6fb0', '#e8a58a', '#ffd08a'], ['#4a4a9a', '#d9667a', '#ff9a55']],
  [8,   ['#5a8cd0', '#a9c9ea', '#f5dba8'], ['#5a85c8', '#c9c4d0', '#f6c58a']],
  [28,  ['#4f8fd8', '#8fc0ee', '#d9ecf8'], ['#4f8fd8', '#8fc0ee', '#d9ecf8']]
];
const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
export function skyColors(altitude, rising) {
  const alt = Number.isFinite(altitude) ? altitude : -90;
  const side = rising ? 1 : 2;
  if (alt <= SKY_KEYS[0][0]) return SKY_KEYS[0][side].slice();
  const last = SKY_KEYS[SKY_KEYS.length - 1];
  if (alt >= last[0]) return last[side].slice();
  let i = 0;
  while (SKY_KEYS[i + 1][0] < alt) i++;
  const [a0, , ] = SKY_KEYS[i], [a1] = SKY_KEYS[i + 1];
  const t = (alt - a0) / (a1 - a0);
  return SKY_KEYS[i][side].map((hex, k) => {
    const from = hexToRgb(hex), to = hexToRgb(SKY_KEYS[i + 1][side][k]);
    return rgbToHex(from.map((v, c) => v + (to[c] - v) * t));
  });
}
/** Path of an 8-point star (Rub el Hizb style) used for the sun and the stars: unit radius 1. */
export const STAR8_PATH = 'M0.00 -1.00L0.19 -0.46L0.71 -0.71L0.46 -0.19L1.00 0.00L0.46 0.19L0.71 0.71L0.19 0.46L0.00 1.00L-0.19 0.46L-0.71 0.71L-0.46 0.19L-1.00 0.00L-0.46 -0.19L-0.71 -0.71L-0.19 -0.46Z';
