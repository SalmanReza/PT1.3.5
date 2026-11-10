/* Completion sounds (v1.3.1). One wooden family, synthesised with Web Audio
   (no audio files, no network): a filtered noise transient plus a short
   pitched body and a faint inharmonic overtone, like a chess piece placed.
   Each progress layer has its own voice; successive ticks of a layer step
   through the G-major pentatonic scale with a subtle ±2 % random variation,
   so a day of prayers sounds musical rather than repetitive.
     fard      fuller, lower, warmest
     sunnah    brighter mid
     nafl      softer, lighter
     voluntary airy, high
     seasonal  festive (bright with a sparkle)
   Untick = one quiet, short, lower "tock". Closing a ring = a tiny 2-note
   flourish. Completing the whole day = the completion chime (3 rising notes,
   under one second). Every tick stays under 120 ms. */

// G major pentatonic, upper-middle register (G5 A5 B5 D6 E6).
export const PENTATONIC_TICK_HZ = Object.freeze([783.99, 880.0, 987.77, 1174.66, 1318.51]);

export const TICK_STYLES = Object.freeze(['wooden', 'soft', 'crystal']);
export const DEFAULT_TICK_STYLE = 'wooden';
export const MAX_TICK_SECONDS = 0.12;
export const JITTER = 0.02;

export function sanitizeTickStyle(value) {
  return TICK_STYLES.includes(value) ? value : DEFAULT_TICK_STYLE;
}

export function tickFrequency(completionNumber) {
  const n = Math.floor(Number(completionNumber) || 1);
  const size = PENTATONIC_TICK_HZ.length;
  return PENTATONIC_TICK_HZ[(((n - 1) % size) + size) % size];
}

/* Layer voices: octave multiplier, body decay (s), body/click/overtone gains,
   low-pass cut-off, click band multiplier and overtone ratio. */
export const LAYER_VOICES = Object.freeze({
  fard:      { octave: 0.5, decay: 0.11,  body: 0.32, click: 0.42, overtone: 0.03, lowpass: 3600, band: 3.2, ratio: 2.76 },
  sunnah:    { octave: 1,   decay: 0.09,  body: 0.26, click: 0.5,  overtone: 0.05, lowpass: 7000, band: 2.6, ratio: 2.76 },
  nafl:      { octave: 1,   decay: 0.07,  body: 0.16, click: 0.26, overtone: 0.02, lowpass: 4200, band: 2.2, ratio: 2.76 },
  voluntary: { octave: 2,   decay: 0.06,  body: 0.12, click: 0.34, overtone: 0.06, lowpass: 9000, band: 1.6, ratio: 3.01 },
  seasonal:  { octave: 1,   decay: 0.1,   body: 0.22, click: 0.4,  overtone: 0.09, lowpass: 9500, band: 2.4, ratio: 4.0 }
});

const STYLE_SHAPES = Object.freeze({
  wooden:  { click: 1,    body: 1,   overtone: 1,   decay: 1,   lowpass: 1 },
  soft:    { click: 0.35, body: 0.85, overtone: 0.5, decay: 1.1, lowpass: 0.55 },
  crystal: { click: 0.25, body: 0.9, overtone: 2.6, decay: 1.05, lowpass: 1.4 }
});

const clampDecay = value => Math.min(MAX_TICK_SECONDS - 0.01, value);

/**
 * Parameters for one tick, pure and testable.
 * @param {string} layer  fard | sunnah | nafl | voluntary | seasonal
 * @param {number} step   1-based count within the layer (pentatonic step)
 * @param {string} style  wooden | soft | crystal
 * @param {function} random  injectable RNG returning [0, 1)
 */
export function tickPlan(layer = 'sunnah', step = 1, style = DEFAULT_TICK_STYLE, random = Math.random) {
  const voice = LAYER_VOICES[layer] || LAYER_VOICES.sunnah;
  const shape = STYLE_SHAPES[sanitizeTickStyle(style)];
  const wobble = () => 1 + (random() * 2 - 1) * JITTER;
  const frequency = tickFrequency(step) * voice.octave * wobble();
  return {
    layer: LAYER_VOICES[layer] ? layer : 'sunnah',
    style: sanitizeTickStyle(style),
    frequency,
    duration: clampDecay(voice.decay * shape.decay * wobble()),
    bodyGain: voice.body * shape.body,
    clickGain: voice.click * shape.click * wobble(),
    overtoneGain: Math.min(0.2, voice.overtone * shape.overtone),
    lowpass: voice.lowpass * shape.lowpass * wobble(),
    band: voice.band,
    ratio: voice.ratio,
    volume: 0.55
  };
}

/** Quiet, short, lower "tock" for unticking. */
export function untickPlan(style = DEFAULT_TICK_STYLE, random = Math.random) {
  const plan = tickPlan('fard', 1, style, random);
  return { ...plan, layer: 'untick', frequency: plan.frequency * 0.75, duration: 0.05, bodyGain: plan.bodyGain * 0.5, clickGain: plan.clickGain * 0.4, overtoneGain: 0, volume: 0.3 };
}

/**
 * Which sounds to play for one change. Pure, so the selection is testable.
 * @returns {Array<{type:string, layer?:string, step?:number}>}
 */
export function soundCues({ layer, ticked, step = 1, ringClosed = false, dayComplete = false } = {}) {
  if (!ticked) return [{ type: 'untick' }];
  const cues = [{ type: 'tick', layer, step }];
  if (dayComplete) cues.push({ type: 'chime' });
  else if (ringClosed) cues.push({ type: 'flourish', layer });
  return cues;
}

/** Note schedule (relative seconds) for the flourish and the chime. */
export function flourishNotes(layer = 'sunnah') {
  return [{ at: 0.11, layer, step: 4 }, { at: 0.2, layer, step: 5 }];
}

export function chimeNotes() {
  // Three wooden ticks rising up the same scale; ends well under one second.
  return [{ at: 0.14, layer: 'sunnah', step: 3 }, { at: 0.3, layer: 'sunnah', step: 4 }, { at: 0.48, layer: 'sunnah', step: 5 }];
}

/* Notification sound (v1.3.4): the same wooden Fard voice as the completion tick, but stronger: three rising notes,
   louder (volume .95, bigger body and click) and a little longer. Still synthesised, still under one second. */
export const NOTIFICATION_VOLUME = 0.95;
export const NOTIFICATION_SECONDS = 0.22;
export function notificationNotes() {
  return [{ at: 0, step: 3 }, { at: 0.17, step: 4 }, { at: 0.34, step: 5 }];
}
export function notificationPlan(step = 3, style = DEFAULT_TICK_STYLE, random = Math.random) {
  const base = tickPlan('fard', step, style, random);
  return {
    ...base,
    frequency: base.frequency * 2,
    duration: NOTIFICATION_SECONDS,
    bodyGain: Math.min(0.9, base.bodyGain * 2),
    clickGain: Math.min(0.9, base.clickGain * 1.6),
    overtoneGain: Math.min(0.2, base.overtoneGain * 2),
    lowpass: Math.max(base.lowpass, 6000),
    volume: NOTIFICATION_VOLUME
  };
}

let sharedContext = null;

function getContext(scope) {
  const AudioContextClass = scope.AudioContext || scope.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext || sharedContext.state === 'closed') sharedContext = new AudioContextClass();
  if (sharedContext.state === 'suspended' && sharedContext.resume) sharedContext.resume().catch(() => {});
  return sharedContext;
}

/** Schedule one tick from a plan. Returns the end time. */
export function schedulePlan(context, plan, when = context.currentTime + 0.005) {
  const master = context.createGain();
  master.gain.setValueAtTime(plan.volume, when);
  const tone = context.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.setValueAtTime(Math.min(16000, plan.lowpass), when);
  master.connect(tone);
  tone.connect(context.destination);

  // 1) Click transient: decaying noise, band-passed for a woody snap.
  const length = Math.max(1, Math.floor(context.sampleRate * 0.03));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  const noise = context.createBufferSource();
  noise.buffer = buffer;
  const band = context.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(plan.frequency * plan.band, when);
  band.Q.setValueAtTime(1.4, when);
  const clickGain = context.createGain();
  clickGain.gain.setValueAtTime(Math.max(0.0001, plan.clickGain), when);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.028);
  noise.connect(band);
  band.connect(clickGain);
  clickGain.connect(master);
  noise.start(when);
  noise.stop(when + 0.03);

  // 2) Pitched body: a quick downward chirp settling on the note.
  const body = context.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(plan.frequency * 1.45, when);
  body.frequency.exponentialRampToValueAtTime(plan.frequency, when + 0.012);
  const bodyGain = context.createGain();
  bodyGain.gain.setValueAtTime(0.0001, when);
  bodyGain.gain.exponentialRampToValueAtTime(Math.max(0.0002, plan.bodyGain), when + 0.002);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, when + plan.duration);
  body.connect(bodyGain);
  bodyGain.connect(master);
  body.start(when);
  body.stop(when + plan.duration + 0.005);

  // 3) Faint inharmonic overtone for the hollow wooden "tock" (or sparkle).
  if (plan.overtoneGain > 0) {
    const overtone = context.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(plan.frequency * plan.ratio, when);
    const overtoneGain = context.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, when);
    overtoneGain.gain.exponentialRampToValueAtTime(plan.overtoneGain, when + 0.002);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, when + Math.min(0.06, plan.duration));
    overtone.connect(overtoneGain);
    overtoneGain.connect(master);
    overtone.start(when);
    overtone.stop(when + Math.min(0.065, plan.duration + 0.005));
  }
  return when + plan.duration;
}

/** Backwards-compatible single tick (sunnah voice, wooden). */
export function scheduleTick(context, frequency, when = context.currentTime + 0.005) {
  return schedulePlan(context, { ...tickPlan('sunnah', 1, 'wooden', () => 0.5), frequency }, when);
}

/** Play the cues for one change. Silent no-op where Web Audio is unavailable. */
export function playCues(cues, style = DEFAULT_TICK_STYLE, scope = globalThis) {
  try {
    const context = getContext(scope);
    if (!context) return false;
    const start = context.currentTime + 0.005;
    for (const cue of cues) {
      if (cue.type === 'untick') schedulePlan(context, untickPlan(style), start);
      else if (cue.type === 'tick') schedulePlan(context, tickPlan(cue.layer, cue.step, style), start);
      else if (cue.type === 'notify') for (const note of notificationNotes()) schedulePlan(context, notificationPlan(note.step, style), start + note.at);
      else if (cue.type === 'flourish') for (const note of flourishNotes(cue.layer)) schedulePlan(context, tickPlan(note.layer, note.step, style), start + note.at);
      else if (cue.type === 'chime') for (const note of chimeNotes()) schedulePlan(context, tickPlan(note.layer, note.step, style), start + note.at);
    }
    return true;
  } catch {
    return false; // sound is optional; completion still saves
  }
}

/** Play one completion tick (kept for compatibility). */
export function playCompletionTick(completionNumber = 1, scope = globalThis) {
  return playCues([{ type: 'tick', layer: 'sunnah', step: completionNumber }], DEFAULT_TICK_STYLE, scope);
}
