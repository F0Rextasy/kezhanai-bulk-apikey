'use strict';
/**
 * kezhanai.com "客栈验真帖" solver — measured 2026-10-19.
 *
 * Shapes (from the panel's own bundle `/next/static/chunks/1itln1jfkl227.js` and
 * a live challenge):
 *   POST /api/registration/captcha        {email}  -> {data:{id, expires_at, prompt, tiles[12]}}
 *   POST /api/registration/captcha/verify  {id, email, positions:[4]} -> {data:{token, …}}
 *   POST /api/verification                  header X-Registration-Captcha: token, {email}
 *
 * The hint image is exactly N tiles wide (768x176 = 4 x 192x176) and shows the
 * four picked tiles side by side in click order. Two metrics live here:
 *
 *  - `rank` (ink, the rail's solver) — the panel is the tile's *content*
 *    re-rendered, so it is matched on binarised shape; see `ink.js`.
 *  - `rankPixel` (baseline) — byte MAD with a ±6 px per-slot search. Exact in
 *    rounds where the montage happens to be a pixel paste (MAD 1.5-6) and the
 *    comparator the ink metric was tuned against; it loses the re-rendered
 *    rounds (MAD 13-17 for the *true* tile, present in solved rounds too).
 *
 * `solve` computes the single best pixel assignment; `candidates` composes
 * per-slot pixel lists, so one mis-ranked slot can still be repaired.
 */

const png = require('./png.js');
const ink = require('./ink.js');

const FINE_X = 6; // the pixel montage is off by up to ~3 px per slot (measured x=191 vs 192)

/** Mean absolute RGB difference of `tile` placed at (ox,0) over the hint image. */
function madAt(hint, tile, ox) {
  const H = hint.data;
  const T = tile.data;
  const hc = hint.channels;
  const tc = tile.channels;
  let sum = 0;
  for (let y = 0; y < tile.height; y++) {
    let hi = (y * hint.width + ox) * hc;
    let ti = y * tile.width * tc;
    for (let x = 0; x < tile.width; x++) {
      sum += Math.abs(H[hi] - T[ti]) + Math.abs(H[hi + 1] - T[ti + 1]) + Math.abs(H[hi + 2] - T[ti + 2]);
      hi += hc;
      ti += tc;
    }
  }
  return sum / (tile.width * tile.height * 3);
}

/** Best (score, x) for this tile anywhere near `slotX`. */
function bestNear(hint, tile, slotX) {
  let best = Infinity;
  let bx = slotX;
  for (let d = -FINE_X; d <= FINE_X; d++) {
    const ox = slotX + d;
    if (ox < 0 || ox + tile.width > hint.width) continue;
    const v = madAt(hint, tile, ox);
    if (v < best) { best = v; bx = ox; }
  }
  return { score: best, x: bx };
}

/** Every permutation of `k` distinct indices out of `n`. */
function permutations(n, k) {
  const out = [];
  const pick = (acc, used) => {
    if (acc.length === k) { out.push(acc.slice()); return; }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true;
      acc.push(i);
      pick(acc, used);
      acc.pop();
      used[i] = false;
    }
  };
  pick([], new Array(n).fill(false));
  return out;
}

/**
 * Solves a challenge payload (`{prompt, tiles}`) into the click order.
 * @returns {{positions:number[], cost:number, margin:number, slots:Array, matrix:number[][]}}
 */
function solve({ prompt, tiles }, { log = () => {} } = {}) {
  const hint = png.decodeDataUri(prompt);
  const tileImgs = tiles.map((t) => png.decodeDataUri(t));
  const tileW = tileImgs[0].width;
  const slots = Math.round(hint.width / tileW);
  const fixed = tileImgs.every((t) => t.height === hint.height);
  if (!fixed) throw new Error(`tile/hint geometry mismatch: tile ${tileW}x${tileImgs[0].height} hint ${hint.width}x${hint.height}`);

  const matrix = tileImgs.map((t) => {
    const row = [];
    for (let s = 0; s < slots; s++) row.push(bestNear(hint, t, Math.round(s * tileW)));
    return row;
  });
  log(`captcha matrix ${tileImgs.length}x${slots} (${tileW}x${hint.height} each)`);

  // exact assignment: minimise the summed MAD over the clicked slots
  let best = null;
  for (const perm of permutations(tileImgs.length, slots)) {
    let cost = 0;
    for (let s = 0; s < slots; s++) cost += matrix[perm[s]][s].score;
    if (!best || cost < best.cost) best = { perm, cost };
  }
  // margin: how much worse the runner-up assignment is (a weak margin = a guess)
  let second = Infinity;
  for (const perm of permutations(tileImgs.length, slots)) {
    let cost = 0;
    for (let s = 0; s < slots; s++) cost += matrix[perm[s]][s].score;
    if (cost > best.cost && cost < second) second = cost;
  }
  const slotDetail = best.perm.map((t, s) => ({ slot: s, tile: t, mad: matrix[t][s].score, x: matrix[t][s].x }));
  return {
    positions: best.perm,
    cost: best.cost / slots,
    margin: second / slots - best.cost / slots,
    slots: slotDetail,
    matrix: matrix.map((row) => row.map((c) => Number(c.score.toFixed(2)))),
  };
}

/**
 * Ranked assignments by the ink (structure) metric — the solver the rail uses.
 * Shape matches `rankPixel`: `{positions, cost, margin, slots}` with `cost` in
 * [0,1] (mean symmetric-difference ratio) instead of MAD pixels.
 */
function rank(data, opts = {}) {
  const { log = () => {}, ...rest } = opts;
  const res = ink.analyze(data, rest);
  log(`captcha ink ${res.matrix.length}x${res.slots} (thr ${res.thr}); best ${res.ranked[0].cost.toFixed(3)} runner-up ${(res.ranked[1] ? res.ranked[1].cost : NaN).toFixed(3)}`);
  return res.ranked;
}

/**
 * Ranked assignments by the pixel metric (cheapest first) — the comparator the
 * ink metric was tuned against, kept for the lab's label sets and shoot-outs.
 * The panel's `verify` answers `CAPTCHA_INVALID` for a wrong order, so the rail
 * walks a ranking instead of trusting a single guess.
 */
function rankPixel({ prompt, tiles }, { k = 8, log = () => {} } = {}) {
  const hint = png.decodeDataUri(prompt);
  const tileImgs = tiles.map((t) => png.decodeDataUri(t));
  const tileW = tileImgs[0].width;
  const slots = Math.round(hint.width / tileW);
  if (!tileImgs.every((t) => t.height === hint.height)) throw new Error('tile/hint geometry mismatch');
  const matrix = tileImgs.map((t) => {
    const row = [];
    for (let s = 0; s < slots; s++) row.push(bestNear(hint, t, Math.round(s * tileW)));
    return row;
  });
  const scored = permutations(tileImgs.length, slots)
    .map((perm) => {
      let cost = 0;
      for (let s = 0; s < slots; s++) cost += matrix[perm[s]][s].score;
      return { perm, cost: cost / slots };
    })
    .sort((a, b) => a.cost - b.cost);
  log(`captcha matrix ${tileImgs.length}x${slots}; best ${scored[0].cost.toFixed(2)} runner-up ${(scored[1] ? scored[1].cost : NaN).toFixed(2)}`);
  return scored.slice(0, k).map((s, i) => ({
    positions: s.perm,
    cost: Number(s.cost.toFixed(2)),
    margin: Number(((scored[i + 1] ? scored[i + 1].cost : s.cost) - s.cost).toFixed(2)),
    slots: s.perm.map((t, sl) => ({ slot: sl, tile: t, mad: Number(matrix[t][sl].score.toFixed(2)), x: matrix[t][sl].x })),
  }));
}


/**
 * Per-slot candidate lists (cheapest tile per slot first) plus the ranked
 * unique assignments built from the top `perSlot` tiles of each slot.
 *
 * The measured failure mode of the pure global ranking is one bad slot: the
 * per-slot minimum was the truth on every labelled challenge, but a decoy tile
 * can win one slot and then the cheapest *unique* assignment is a different
 * permutation that never appears in the top of the global list. Composing
 * candidates from per-slot lists keeps the "fix one slot" repair in reach.
 */
function candidates({ prompt, tiles }, { perSlot = 4, k = 12, log = () => {} } = {}) {
  const hint = png.decodeDataUri(prompt);
  const tileImgs = tiles.map((t) => png.decodeDataUri(t));
  const tileW = tileImgs[0].width;
  const slots = Math.round(hint.width / tileW);
  if (!tileImgs.every((t) => t.height === hint.height)) throw new Error('tile/hint geometry mismatch');
  const matrix = tileImgs.map((t) => {
    const row = [];
    for (let s = 0; s < slots; s++) row.push(bestNear(hint, t, Math.round(s * tileW)));
    return row;
  });
  const perSlotList = [];
  for (let s = 0; s < slots; s++) {
    perSlotList.push(
      tileImgs.map((_, t) => t)
        .sort((a, b) => matrix[a][s].score - matrix[b][s].score)
        .slice(0, perSlot)
    );
  }
  const combos = [];
  const walk = (acc, used) => {
    if (acc.length === slots) {
      let cost = 0;
      for (let s = 0; s < slots; s++) cost += matrix[acc[s]][s].score;
      combos.push({ perm: acc.slice(), cost: cost / slots });
      return;
    }
    for (const t of perSlotList[acc.length]) {
      if (used.has(t)) continue;
      used.add(t);
      acc.push(t);
      walk(acc, used);
      acc.pop();
      used.delete(t);
    }
  };
  walk([], new Set());
  combos.sort((a, b) => a.cost - b.cost);
  log(`captcha ${tileImgs.length} tiles x ${slots} slots; slot minima [${perSlotList.map((l, s) => matrix[l[0]][s].score.toFixed(1)).join(', ')}]`);
  return {
    matrix: matrix.map((row) => row.map((c) => Number(c.score.toFixed(2)))),
    perSlot: perSlotList,
    ranked: combos.slice(0, k).map((c) => ({ positions: c.perm, cost: Number(c.cost.toFixed(2)), slots: c.perm.map((t, s) => ({ tile: t, mad: Number(matrix[t][s].score.toFixed(2)), x: matrix[t][s].x })) })),
  };
}
module.exports = { solve, rank, rankPixel, candidates, madAt, bestNear };
