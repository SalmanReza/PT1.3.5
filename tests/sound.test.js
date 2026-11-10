import test from 'node:test';
import assert from 'node:assert/strict';
import { PENTATONIC_TICK_HZ, TICK_STYLES, DEFAULT_TICK_STYLE, MAX_TICK_SECONDS, JITTER, LAYER_VOICES, sanitizeTickStyle, tickFrequency, tickPlan, untickPlan, soundCues, flourishNotes, chimeNotes, schedulePlan } from '../src/sound.js';

const fixed = value => () => value; // deterministic RNG

test('each layer has its own voice in the same wooden family', () => {
  const mid = fixed(0.5); // 0.5 → no jitter
  const plans = Object.fromEntries(['fard', 'sunnah', 'nafl', 'voluntary', 'seasonal'].map(layer => [layer, tickPlan(layer, 1, 'wooden', mid)]));
  assert.ok(plans.fard.frequency < plans.sunnah.frequency, 'Fard is lower');
  assert.ok(plans.fard.bodyGain > plans.sunnah.bodyGain && plans.fard.duration > plans.sunnah.duration, 'Fard is fuller and warmer');
  assert.ok(plans.fard.lowpass < plans.sunnah.lowpass, 'Fard is darker, Sunnah brighter');
  assert.ok(plans.nafl.bodyGain < plans.sunnah.bodyGain && plans.nafl.clickGain < plans.sunnah.clickGain, 'Nafl is softer');
  assert.ok(plans.voluntary.frequency > plans.sunnah.frequency, 'standalone voluntary is airy and high');
  assert.ok(plans.seasonal.overtoneGain > plans.sunnah.overtoneGain, 'date-specific is festive (sparkle)');
  for (const plan of Object.values(plans)) {
    assert.ok(plan.duration < MAX_TICK_SECONDS, `${plan.layer} under 120 ms`);
    assert.ok(plan.volume <= 0.6, 'modest volume');
  }
});

test('successive ticks of a layer step through the pentatonic scale', () => {
  const mid = fixed(0.5);
  const notes = [1, 2, 3, 4, 5, 6].map(step => tickPlan('sunnah', step, 'wooden', mid).frequency);
  assert.deepEqual(notes.slice(0, 5).map(n => +n.toFixed(2)), [...PENTATONIC_TICK_HZ]);
  assert.equal(notes[5], notes[0], 'wraps around');
  assert.equal(tickFrequency(0), tickFrequency(1), 'invalid step falls back to the first note');
  assert.equal(tickFrequency(10), tickFrequency(5));
  assert.equal(tickFrequency(-4), PENTATONIC_TICK_HZ[0]);
});

test('micro-variation stays within ±2 %', () => {
  const base = tickPlan('nafl', 3, 'wooden', fixed(0.5)).frequency;
  const low = tickPlan('nafl', 3, 'wooden', fixed(0)).frequency;
  const high = tickPlan('nafl', 3, 'wooden', fixed(0.999999)).frequency;
  assert.ok(Math.abs(low / base - (1 - JITTER)) < 1e-6);
  assert.ok(high / base <= 1 + JITTER + 1e-6 && high > base);
  for (let i = 0; i < 200; i++) {
    const plan = tickPlan('voluntary', i, 'crystal');
    assert.ok(plan.duration < MAX_TICK_SECONDS);
  }
});

test('tick styles: Wooden default, Soft and Crystal; unknown values fall back', () => {
  assert.deepEqual([...TICK_STYLES], ['wooden', 'soft', 'crystal']);
  assert.equal(DEFAULT_TICK_STYLE, 'wooden');
  assert.equal(sanitizeTickStyle('crystal'), 'crystal');
  assert.equal(sanitizeTickStyle('loud'), 'wooden');
  assert.equal(sanitizeTickStyle(undefined), 'wooden');
  const mid = fixed(0.5);
  const wooden = tickPlan('sunnah', 1, 'wooden', mid), soft = tickPlan('sunnah', 1, 'soft', mid), crystal = tickPlan('sunnah', 1, 'crystal', mid);
  assert.ok(soft.clickGain < wooden.clickGain && soft.lowpass < wooden.lowpass);
  assert.ok(crystal.overtoneGain > wooden.overtoneGain);
  assert.equal(tickPlan('sunnah', 1, 'nope', mid).style, 'wooden');
  assert.equal(tickPlan('unknown-layer', 1, 'wooden', mid).layer, 'sunnah');
});

test('sound selection: tick, untick tock, ring flourish, day chime', () => {
  assert.deepEqual(soundCues({ layer: 'fard', ticked: true, step: 2 }), [{ type: 'tick', layer: 'fard', step: 2 }]);
  assert.deepEqual(soundCues({ layer: 'nafl', ticked: false }), [{ type: 'untick' }]);
  assert.deepEqual(soundCues({ layer: 'sunnah', ticked: true, step: 5, ringClosed: true }), [{ type: 'tick', layer: 'sunnah', step: 5 }, { type: 'flourish', layer: 'sunnah' }]);
  assert.deepEqual(soundCues({ layer: 'voluntary', ticked: true, step: 5, ringClosed: true, dayComplete: true }).map(c => c.type), ['tick', 'chime'], 'completing the day plays the chime, not the flourish too');
  assert.deepEqual(soundCues({ layer: 'fard', ticked: false, ringClosed: true, dayComplete: true }), [{ type: 'untick' }], 'unticking never celebrates');
  const flourish = flourishNotes('nafl');
  assert.equal(flourish.length, 2);
  const chime = chimeNotes();
  assert.ok(chime.length >= 2 && chime.length <= 3);
  const freqs = chime.map(note => tickFrequency(note.step));
  assert.ok(freqs.every((f, i) => i === 0 || f > freqs[i - 1]), 'chime rises');
  assert.ok(chime.at(-1).at + MAX_TICK_SECONDS < 1, 'chime under one second');
  const tock = untickPlan('wooden', fixed(0.5));
  assert.ok(tock.frequency < tickPlan('fard', 1, 'wooden', fixed(0.5)).frequency, 'untick is lower');
  assert.ok(tock.volume < 0.4 && tock.duration <= 0.05, 'untick is quiet and short');
});

test('scheduling stays inside the duration on a fake Web Audio context', () => {
  const node = () => ({ connect() {}, start() {}, stop(at) { node.stops.push(at); }, gain: param(), frequency: param(), Q: param(), type: '' });
  node.stops = [];
  function param() { return { setValueAtTime() {}, exponentialRampToValueAtTime() {} }; }
  const context = { currentTime: 0, sampleRate: 8000, destination: {}, createGain: node, createBiquadFilter: node, createOscillator: node, createBufferSource: node, createBuffer: (c, length) => ({ getChannelData: () => new Float32Array(length) }) };
  for (const layer of Object.keys(LAYER_VOICES)) {
    node.stops.length = 0;
    const end = schedulePlan(context, tickPlan(layer, 2, 'wooden', fixed(0.9)), 0);
    assert.ok(end <= MAX_TICK_SECONDS);
    assert.ok(Math.max(...node.stops) <= MAX_TICK_SECONDS, `${layer} stops by 120 ms`);
  }
});
