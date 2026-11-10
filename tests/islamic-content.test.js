import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PRAYER_GUIDANCE, HIJRI_DAY_NOTES } from '../src/islamic-content.js';
import { readText } from './helpers/read-text.js';

test('every displayed prayer event has a rakah count and practical guidance in both languages', () => {
  const events = ['fajr','dhuhr','jumuah','asr','maghrib','isha','duha','awwabin','qiyam','tahajjud','tarawih','eid_prayer','witr','rawatib','tahiyyatul_masjid','istikhara','tawbah'];
  for (const key of events) {
    const item = PRAYER_GUIDANCE[key];
    assert.ok(item, `missing guidance: ${key}`);
    assert.ok(item.rakahs?.trim(), `missing English rakah detail: ${key}`);
    assert.ok(item.bn?.trim(), `missing Bangla rakah detail: ${key}`);
    assert.ok(item.guide?.trim(), `missing English prayer guidance: ${key}`);
    assert.ok(item.guideBn?.trim(), `missing Bangla prayer guidance: ${key}`);
    assert.ok(item.source?.trim(), `missing source note: ${key}`);
    assert.ok(item.sourceBn?.trim(), `missing Bangla source note: ${key}`);
  }
});

test('Hijri history entries contain qualified English and Bangla explanations', () => {
  assert.ok(Object.keys(HIJRI_DAY_NOTES).length >= 12);
  for (const [date, note] of Object.entries(HIJRI_DAY_NOTES)) {
    assert.match(date, /^\d{1,2}-\d{1,2}$/);
    assert.ok(note.title && note.bn && note.detail && note.detailBn, `incomplete Hijri note: ${date}`);
  }
});

test('special seasonal prayers have explicit time-window guidance', () => {
  assert.match(PRAYER_GUIDANCE.tarawih.guide, /after Isha/i);
  assert.match(PRAYER_GUIDANCE.eid_prayer.guide, /before Zawal/i);
});


test('Tarawih and Eid prayer are created only for their relevant Hijri dates', () => {
  const app = requireAppSource();
  assert.match(app, /function daytimeHijriDateForNight\(ishaTime\)/);
  assert.match(app, /function isRamadanNight\(ishaTime\)[\s\S]*?daytimeHijriDateForNight\(ishaTime\)\?\.month === 9/);
  assert.match(app, /ramadan\.first\.times\.isha\.getTime\(\) - 24 \* 60 \* 60 \* 1000/);
  assert.match(app, /if \(isRamadanNight\(times\.isha\)\)\s*\{\s*events\.push\(\{ key: 'tarawih'/);
  assert.match(app, /hijri\.month === 10 && hijri\.day === 1/);
  assert.match(app, /hijri\.month === 12 && hijri\.day === 10/);
});

function requireAppSource() {
  return readText('../src/app.js', import.meta.url);
}
