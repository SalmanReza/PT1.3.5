export function validCoordinates(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

function parsePair(text) {
  const match = String(text).match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lon = Number(match[2]);
  return validCoordinates(lat, lon) ? { lat, lon } : null;
}

export function parseCoordinates(value) {
  const raw = String(value || '').trim();
  const direct = parsePair(raw);
  if (direct) return direct;
  const patterns = [
    /@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/,
    /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/i,
    /[?&](?:q|query|ll|center|destination)=(-?\d{1,2}(?:\.\d+)?)(?:%2C|,|%20|\s)+(-?\d{1,3}(?:\.\d+)?)/i
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    if (validCoordinates(lat, lon)) return { lat, lon };
  }
  return null;
}

export function isGoogleMapsUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && (
      host === 'maps.app.goo.gl' ||
      (host === 'goo.gl' && url.pathname.startsWith('/maps')) ||
      ((host === 'www.google.com' || host === 'google.com') && url.pathname.startsWith('/maps')) ||
      host === 'maps.google.com'
    );
  } catch {
    return false;
  }
}
