/* Reads saved history safely (v1.3.2). Standalone voluntary prayers have a single
   tick: older or hand-edited data that stored sub-parts for a voluntary prayer
   (an object such as { before: true, after: false } instead of true) is folded into
   that one tick (done when any part was done). Records that are not objects are
   replaced by an empty day. Everything else (fard, sunnah, nafl, at, locked, unknown
   keys) is kept as it is, so nothing from an older version is lost. */
export function migrateRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { fard: {}, voluntary: {} };
  const out = { ...record };
  out.fard = out.fard && typeof out.fard === 'object' && !Array.isArray(out.fard) ? out.fard : {};
  const voluntary = out.voluntary && typeof out.voluntary === 'object' && !Array.isArray(out.voluntary) ? out.voluntary : {};
  const folded = {};
  for (const [key, value] of Object.entries(voluntary)) {
    const done = value && typeof value === 'object' ? Object.values(value).some(Boolean) : !!value;
    if (done) folded[key] = true;
  }
  out.voluntary = folded;
  return out;
}

export function migrateHistory(history) {
  const out = {};
  if (!history || typeof history !== 'object' || Array.isArray(history)) return out;
  for (const [key, record] of Object.entries(history)) if (/^\d{4}-\d{2}-\d{2}$/.test(key)) out[key] = migrateRecord(record);
  return out;
}
