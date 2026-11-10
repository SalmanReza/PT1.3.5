import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrayerTimes, formatTime, dateKey } from '../src/prayer-engine.js';

test('calculates ordered Karachi prayer times for Dhaka',()=>{
 const d=new Date(2026,10,9);const t=calculatePrayerTimes(d,23.8103,90.4125,360);
 for(const k of ['fajr','sunrise','dhuhr','asr','maghrib','isha']) assert.ok(t[k] instanceof Date,`${k} is a Date`);
 assert.ok(t.fajr<t.sunrise && t.sunrise<t.dhuhr && t.dhuhr<t.asr && t.asr<t.maghrib && t.maghrib<t.isha);
 const hours=Object.fromEntries(Object.entries(t).map(([k,v])=>[k,v.getHours()+v.getMinutes()/60]));
 assert.ok(hours.fajr>3.5&&hours.fajr<6,`Fajr plausible: ${hours.fajr}`);
 assert.ok(hours.sunrise>5&&hours.sunrise<7,`Sunrise plausible: ${hours.sunrise}`);
 assert.ok(hours.dhuhr>11&&hours.dhuhr<13.5,`Dhuhr plausible: ${hours.dhuhr}`);
 assert.ok(hours.maghrib>16&&hours.maghrib<19,`Maghrib plausible: ${hours.maghrib}`);
});
test('rejects invalid coordinates',()=>{assert.throws(()=>calculatePrayerTimes(new Date(),91,0));assert.throws(()=>calculatePrayerTimes(new Date(),0,181));});
test('formats date keys and local times',()=>{assert.match(dateKey(new Date(2026,0,2)),/^2026-01-02$/);assert.match(formatTime(new Date(2026,0,2,5,7)),/^05:07$/)});


test('enforces a six-minute Zawal exclusion before Dhuhr',()=>{
 const date=new Date(2026,10,9);
 const t=calculatePrayerTimes(date,23.8103,90.4125,360);
 assert.equal(t.zawalEnd.getTime()-t.zawalStart.getTime(),12*60000);
 assert.equal(t.dhuhr.getTime()-t.solarNoon.getTime(),6*60000);
 assert.equal(t.zawalEnd.getTime(),t.dhuhr.getTime());
});

test('supports different device time-zone offsets for the same coordinates',()=>{
 const date=new Date(2026,10,9);
 const dhaka=calculatePrayerTimes(date,23.8103,90.4125,360);
 const utc=calculatePrayerTimes(date,23.8103,90.4125,0);
 assert.ok(Math.abs((dhaka.fajr.getTime()-utc.fajr.getTime())-6*3600000)<120000);
 assert.ok(Math.abs((dhaka.isha.getTime()-utc.isha.getTime())-6*3600000)<120000);
});
