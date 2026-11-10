import test from 'node:test';
import assert from 'node:assert/strict';
import { isGoogleMapsUrl, parseCoordinates } from '../src/location.js';
import { readText } from './helpers/read-text.js';

test('accepts manual latitude and longitude', () => {
  assert.deepEqual(parseCoordinates('23.8103, 90.4125'), { lat: 23.8103, lon: 90.4125 });
});

test('extracts coordinates from an expanded Maps link', () => {
  assert.deepEqual(parseCoordinates('https://www.google.com/maps/place/Home/@23.8103,90.4125,15z'), { lat: 23.8103, lon: 90.4125 });
  assert.deepEqual(parseCoordinates('https://www.google.com/maps?data=!3d23.8103!4d90.4125'), { lat: 23.8103, lon: 90.4125 });
});

test('recognises only HTTPS Google Maps share links', () => {
  assert.equal(isGoogleMapsUrl('https://maps.app.goo.gl/example'), true);
  assert.equal(isGoogleMapsUrl('https://www.google.com/maps/place/Home'), true);
  assert.equal(isGoogleMapsUrl('https://example.com/maps/place/Home'), false);
  assert.equal(isGoogleMapsUrl('http://maps.app.goo.gl/example'), false);
});

test('rejects invalid coordinate pairs', () => {
  assert.equal(parseCoordinates('91, 90'), null);
  assert.equal(parseCoordinates('23, 181'), null);
});


test('a fresh installation does not contain a preset or detected location', async () => {
  const fs = await import('node:fs');
  const app = readText('../src/app.js', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.match(app, /lat:\s*null/);
  assert.match(app, /lon:\s*null/);
  assert.match(app, /if \(!hasLocation\(\)\) openSettings\(\)/);
  assert.doesNotMatch(app, /navigator\.geolocation/);
  assert.match(html, /Google Maps sharing link/);
  assert.match(html, /for="latitude"/);
  assert.match(html, /for="longitude"/);
  assert.doesNotMatch(html, /Monzila Residency/);
});

test('location link processing stays offline and accepts only coordinates embedded in Maps URLs', async () => {
  const fs = await import('node:fs');
  const app = readText('../src/app.js', import.meta.url);
  const rust = readText('../src-tauri/src/main.rs', import.meta.url);
  const cargo = readText('../src-tauri/Cargo.toml', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.doesNotMatch(app, /resolve_maps_link|__TAURI__\?\.core\?\.invoke/);
  assert.doesNotMatch(rust, /reqwest|resolve_maps_link|\.send\(\)/);
  assert.doesNotMatch(cargo, /^reqwest\s*=/m);
  assert.doesNotMatch(html, /placeName|Location name \(optional\)/);
  assert.match(app, /Shortened links cannot be expanded offline/);
});
