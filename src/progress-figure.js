/* Today's progress figure (v1.3.1): concentric circles, inside to outside,
   in the order of the colours the Prophet ﷺ is reported to have loved:
     1. Fard        — WHITE centre: a thin 5-segment ring that becomes a solid
                      white disc after the fifth Fard (ivory + neutral outline
                      on light themes).
     2. Sunnah      — GREEN ring (Sunnah mu’akkadah tied to the Fard).
     3. Nafl        — BLACK ring (Nafl tied to the Fard; faint light edge on
                      dark themes).
     4. Voluntary   — RED-AND-BLACK STRIPED ring (the striped Yemeni Hillah),
                      standalone voluntary prayers. Never solid red.
     5. Seasonal    — SAFFRON ring, outermost, only on days that have
                      date-specific prayers (Tarawih, Eid prayer). The whole
                      figure is scaled so its diameter stays the same.
   Every ring fills clockwise from 12 o'clock, one segment per item in
   prayer-time order, so an angle always means the same prayer. Unfinished
   segments are faded tracks; a ring closes (solid, soft glow) only when all
   of its segments are done. Pure helpers, no DOM, so the rules are testable. */

export const LAYER_COLORS = Object.freeze({
  fard: '#F7F4EC',
  fardOutline: '#BDB6A6',
  sunnah: '#1E8E5A',
  nafl: '#141414',
  hillahRed: '#B3122E',
  hillahDark: '#141414',
  seasonal: '#E8A33D'
});

export const LAYER_ORDER = Object.freeze(['fard', 'sunnah', 'nafl', 'voluntary', 'seasonal']);

export const VIEWBOX = 300;
export const CENTER = 150;
/** Outer edge of the outermost ring; constant whether 4 or 5 rings are drawn. */
export const OUTER_EDGE = 137;

// Base proportions (300 viewBox) from the approved mock-up: radii 72/89/108/129,
// even ~6–7 unit gaps, strokes 10–16. The saffron ring sits one gap further out.
const BASE_RINGS = Object.freeze({
  fard: { r: 72, w: 10 },
  sunnah: { r: 89, w: 12 },
  nafl: { r: 108, w: 12 },
  voluntary: { r: 129, w: 16 },
  seasonal: { r: 151, w: 12 }
});
const BASE_DISC = 77;     // solid white Fard disc radius (outer edge of the Fard ring)
const BASE_TEXT = 54;     // الحمد لله font size inside the disc
const SEGMENT_GAP = 7;    // visible gap between segments, in viewBox units

/** Ring geometry. With a seasonal ring every radius/stroke is scaled so the
 *  outer edge stays at OUTER_EDGE. */
export function figureLayout(hasSeasonal = false) {
  const layers = hasSeasonal ? LAYER_ORDER : LAYER_ORDER.slice(0, 4);
  const outer = layers[layers.length - 1];
  const rawEdge = BASE_RINGS[outer].r + BASE_RINGS[outer].w / 2;
  const scale = OUTER_EDGE / rawEdge;
  const rings = {};
  for (const layer of layers) rings[layer] = { r: BASE_RINGS[layer].r * scale, w: BASE_RINGS[layer].w * scale };
  return { layers, scale, rings, discRadius: BASE_DISC * scale, textSize: BASE_TEXT * scale };
}

/** Clear space between two neighbouring rings (inner edge of the outer minus
 *  outer edge of the inner), in viewBox units. */
export function ringGaps(layout = figureLayout(false)) {
  const gaps = [];
  for (let i = 1; i < layout.layers.length; i++) {
    const inner = layout.rings[layout.layers[i - 1]];
    const outer = layout.rings[layout.layers[i]];
    gaps.push((outer.r - outer.w / 2) - (inner.r + inner.w / 2));
  }
  return gaps;
}

/**
 * Segments for one ring, using pathLength 100 and round caps. The dash length
 * leaves room for both round caps plus a visible gap, so a ring can never look
 * closed before its last item (the v1.2.x early-closing artefact). When every
 * item is done the ring is drawn as one closed circle instead (no seams).
 */
export function arcSegments(flags, r, w, gap = SEGMENT_GAP) {
  const list = Array.isArray(flags) ? flags.map(Boolean) : [];
  const count = list.length;
  const done = list.filter(Boolean).length;
  const complete = count > 0 && done === count;
  const circumference = 2 * Math.PI * r;
  if (!count) return { count, done, complete: false, gapUnits: 0, segments: [] };
  const step = 100 / count;
  const capUnits = (w / 2) / circumference * 100;
  const gapUnits = Math.min(step * 0.6, 2 * capUnits + gap / circumference * 100);
  const length = Math.max(0.01, step - gapUnits);
  const segments = list.map((isDone, index) => ({
    index,
    done: isDone,
    length,
    dasharray: `${length.toFixed(3)} ${(100 - length).toFixed(3)}`,
    // Negative offset moves the dash clockwise; start just after 12 o'clock.
    dashoffset: (-(index * step + gapUnits / 2)).toFixed(3)
  }));
  return { count, done, complete, gapUnits, capUnits, segments };
}

const asLayer = value => ({ done: Math.max(0, Math.floor(Number(value?.done) || 0)), total: Math.max(0, Math.floor(Number(value?.total) || 0)) });

/**
 * Good Job = all five Fard. Great Job / Alhamdulillah = every layer present
 * that day is complete. Sunnah/Nafl layers always exist; the striped voluntary
 * ring needs at least one event (no location = no reward); the saffron ring
 * only counts on days that have date-specific prayers.
 */
export function progressSummary({ fard, sunnah, nafl, voluntary, seasonal } = {}) {
  const L = { fard: asLayer(fard), sunnah: asLayer(sunnah), nafl: asLayer(nafl), voluntary: asLayer(voluntary), seasonal: asLayer(seasonal) };
  const complete = {};
  for (const key of LAYER_ORDER) complete[key] = L[key].total > 0 && L[key].done >= L[key].total;
  const hasSeasonal = L.seasonal.total > 0;
  const fardDisc = L.fard.total === 5 && complete.fard;
  const reward = fardDisc && complete.sunnah && complete.nafl && complete.voluntary && (!hasSeasonal || complete.seasonal);
  return { layers: L, complete, hasSeasonal, fardDisc, good: fardDisc, great: reward, reward };
}

export const REWARD_TEXT = 'الحمد لله';

/**
 * Build the SVG markup for the figure.
 * @param {object} flagsByLayer {fard:boolean[], sunnah:[], nafl:[], voluntary:[], seasonal:[]}
 * @param {object} options {mini, sweep:Set('layer:index'), closing:Set(layer), rewardFade:boolean, label}
 */
export function figureSvg(flagsByLayer = {}, options = {}) {
  const { mini = false, sweep = new Set(), closing = new Set(), rewardFade = false } = options;
  const flags = key => (Array.isArray(flagsByLayer[key]) ? flagsByLayer[key] : []);
  const hasSeasonal = flags('seasonal').length > 0;
  const layout = figureLayout(hasSeasonal);
  const count = key => ({ done: flags(key).filter(Boolean).length, total: flags(key).length });
  const summary = progressSummary({ fard: count('fard'), sunnah: count('sunnah'), nafl: count('nafl'), voluntary: count('voluntary'), seasonal: count('seasonal') });
  const c = CENTER;
  const f = n => Number(n.toFixed(2));
  const parts = [];
  for (const layer of layout.layers) {
    const { r, w } = layout.rings[layer];
    if (layer === 'fard' && summary.fardDisc) {
      parts.push(`<circle class="pf-disc${closing.has('fard') ? ' closing' : ''}" cx="${c}" cy="${c}" r="${f(layout.discRadius)}"/>`);
      continue;
    }
    const ring = arcSegments(flags(layer), r, w);
    const base = `cx="${c}" cy="${c}" r="${f(r)}" fill="none" stroke-width="${f(w)}"`;
    const edge = `cx="${c}" cy="${c}" r="${f(r)}" fill="none" stroke-width="${f(w + 2.6 * layout.scale)}"`;
    const turn = `transform="rotate(-90 ${c} ${c})"`;
    if (!ring.count) {
      parts.push(`<circle class="pf-track ${layer}" ${base}/>`);
    } else if (ring.complete) {
      const cls = closing.has(layer) ? ' closing' : '';
      parts.push(`<g class="pf-ring ${layer} closed${cls}" data-layer="${layer}"><circle class="pf-edge ${layer}" ${edge}/><circle class="pf-seg ${layer} done" ${base}/></g>`);
    } else {
      const items = ring.segments.map(segment => {
        const dash = `pathLength="100" stroke-linecap="round" stroke-dasharray="${segment.dasharray}" stroke-dashoffset="${segment.dashoffset}" ${turn}`;
        if (!segment.done) return `<circle class="pf-track ${layer}" ${base} ${dash}/>`;
        const anim = sweep.has(`${layer}:${segment.index}`) ? ' sweep' : '';
        return `<circle class="pf-edge ${layer}${anim}" ${edge} ${dash}/><circle class="pf-seg ${layer} done${anim}" ${base} ${dash}/>`;
      }).join('');
      parts.push(`<g class="pf-ring ${layer}" data-layer="${layer}" data-done="${ring.done}" data-total="${ring.count}">${items}</g>`);
    }
  }
  if (!mini && summary.reward) {
    parts.push(`<text class="pf-reward${rewardFade ? ' fade-in' : ''}" x="${c}" y="${c}" font-size="${f(layout.textSize)}" text-anchor="middle" dominant-baseline="central" direction="rtl" lang="ar">${REWARD_TEXT}</text>`);
  }
  const cls = `pf${mini ? ' pf-mini' : ''}${summary.fardDisc ? ' fard-disc' : ''}${summary.reward ? ' rewarded' : ''}${hasSeasonal ? ' has-seasonal' : ''}`;
  return `<svg class="${cls}" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}

/** Which segments just turned on / which rings just closed between two renders. */
export function figureChanges(before = {}, after = {}) {
  const sweep = new Set();
  const closing = new Set();
  for (const layer of LAYER_ORDER) {
    const a = Array.isArray(before[layer]) ? before[layer] : [];
    const b = Array.isArray(after[layer]) ? after[layer] : [];
    b.forEach((done, index) => { if (done && !a[index]) sweep.add(`${layer}:${index}`); });
    const wasComplete = a.length > 0 && a.length === b.length && a.every(Boolean);
    if (b.length && b.every(Boolean) && !wasComplete) closing.add(layer);
  }
  return { sweep, closing };
}
