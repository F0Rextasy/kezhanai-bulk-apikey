'use strict';
/**
 * kezhanai "客栈验真帖" captcha — structure ("ink") metric.
 *
 * The hint is a montage of the four picked tiles pasted side by side in click
 * order, but measured 2026-10-19 on the labelled rounds the panel is the tile's
 * *content* re-rendered, not a byte paste: the true tile's pixel MAD at its own
 * slot is 13.5-16.9 where a paste scores 1.5-6, and a sub-pixel search does not
 * recover it. Byte-compare therefore loses exactly the rounds where the
 * re-render lands off-grid ("hard" rounds: best assignment cost ~10-12 → the
 * panel answers CAPTCHA_INVALID).
 *
 * What survives a re-render is the shape: binarise both images (Otsu on
 * luminance) and compare the ink masks with a 1-px tolerance (dilated symmetric
 * difference) over a small shift window. Identical content → 0.04-0.30, a
 * different glyph/icon → 0.43-0.70. On the 11 labelled rounds this puts the
 * truth first on every slot (44/44) and in the top assignment (11/11), where the
 * pixel metric was 11/11 but with margins of 0.01-0.5 and it lost
 * `cn4b-labels2/09` outright at win=12.
 */
const png = require('./png.js');

/** Luminance plane of an RGB(A) image. */
function gray(img) {
  const out = new Uint8Array(img.width * img.height);
  const c = img.channels;
  for (let i = 0, p = 0; i < out.length; i++, p += c) {
    out[i] = (img.data[p] * 299 + img.data[p + 1] * 587 + img.data[p + 2] * 114) / 1000;
  }
  return { width: img.width, height: img.height, data: out };
}

/** Otsu threshold of a luminance plane (ink = darker than the threshold). */
function otsu(g) {
  const hist = new Float64Array(256);
  for (let i = 0; i < g.data.length; i++) hist[g.data[i]]++;
  const total = g.data.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, thr = 128;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * hist[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const v = wB * wF * (mB - mF) * (mB - mF);
    if (v > best) { best = v; thr = i; }
  }
  return thr;
}

/** 1-bit ink mask. */
function inkMask(g, thr) {
  const out = new Uint8Array(g.width * g.height);
  for (let i = 0; i < out.length; i++) out[i] = g.data[i] < thr ? 1 : 0;
  return out;
}

/** Dilate by r (chebyshev), separable max filter. */
function dilate(mask, w, h, r) {
  if (!r) return mask;
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let d = -r; d <= r && !v; d++) {
        const xx = x + d;
        if (xx < 0 || xx >= w) continue;
        if (mask[y * w + xx]) v = 1;
      }
      tmp[y * w + x] = v;
    }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let d = -r; d <= r && !v; d++) {
        const yy = y + d;
        if (yy < 0 || yy >= h) continue;
        if (tmp[yy * w + x]) v = 1;
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

/**
 * Symmetric-difference ratio between the hint panel whose top-left is (bx,by)
 * inside the full hint mask `A` (stride `Aw`) and the tile mask `B` (w x h),
 * with 1-px tolerance on both sides (Ad/Bd = dilated masks).
 * @returns {number} 0 = identical structure, 1 = nothing in common, -1 = empty
 */
function diffRatio(A, Aw, Ad, bx, by, B, Bd, w, h) {
  let miss = 0, extra = 0, na = 0, nb = 0;
  for (let y = 0; y < h; y++) {
    const ay = by + y;
    for (let x = 0; x < w; x++) {
      const a = A[ay * Aw + bx + x];
      const b = B[y * w + x];
      na += a; nb += b;
      if (a && !Bd[y * w + x]) miss++;
      if (b && !Ad[ay * Aw + bx + x]) extra++;
    }
  }
  const denom = na + nb;
  return denom ? (miss + extra) / denom : -1;
}

/**
 * Structure score matrix for a challenge payload.
 * @param {{prompt:string, tiles:string[]}} data
 * @param {{winX?:number, winY?:number, perSlot?:number, k?:number, thr?:number}} opts
 * @returns {{slots:number, tileW:number, tileH:number, thr:number, matrix:number[][],
 *           shift:Array<Array<{dx:number,dy:number}>>, perSlot:number[][], ranked:Array}}
 */
function analyze(data, { winX = 10, winY = 6, perSlot = 12, k = 12, thr = null } = {}) {
  const hint = gray(png.decodeDataUri(data.prompt));
  const tiles = data.tiles.map((t) => gray(png.decodeDataUri(t)));
  const tileW = tiles[0].width;
  const tileH = tiles[0].height;
  if (!tiles.every((t) => t.height === tileH && t.width === tileW)) throw new Error('tile geometry mismatch');
  const slots = Math.round(hint.width / tileW);
  const useThr = thr == null ? otsu(hint) : thr;
  const hInk = inkMask(hint, useThr);
  const hDil = dilate(hInk, hint.width, hint.height, 1);
  const tms = tiles.map((t) => {
    const m = inkMask(t, thr == null ? otsu(t) : thr);
    return { m, d: dilate(m, tileW, tileH, 1) };
  });

  const matrix = [];
  const shift = [];
  for (const tm of tms) {
    const row = [];
    const srow = [];
    for (let s = 0; s < slots; s++) {
      const cx = Math.round(s * tileW);
      let best = Infinity;
      let bs = { dx: 0, dy: 0 };
      for (let dx = -winX; dx <= winX; dx++) {
        const bx = cx + dx;
        if (bx < 0 || bx + tileW > hint.width) continue;
        for (let dy = -winY; dy <= winY; dy++) {
          const by = dy;
          if (by < 0 || by + tileH > hint.height) continue;
          const v = diffRatio(hInk, hint.width, hDil, bx, by, tm.m, tm.d, tileW, tileH);
          if (v >= 0 && v < best) { best = v; bs = { dx, dy }; }
        }
      }
      row.push(best);
      srow.push(bs);
    }
    matrix.push(row);
    shift.push(srow);
  }

  const perSlotList = [];
  for (let s = 0; s < slots; s++) {
    perSlotList.push(tiles.map((_, t) => t).sort((a, b) => matrix[a][s] - matrix[b][s]).slice(0, perSlot));
  }
  const combos = [];
  const walk = (acc, used) => {
    if (acc.length === slots) {
      let cost = 0;
      for (let s = 0; s < slots; s++) cost += matrix[acc[s]][s];
      combos.push({ perm: acc.slice(), cost: cost / slots });
      return;
    }
    for (const t of perSlotList[acc.length]) {
      if (used.has(t)) continue;
      used.add(t); acc.push(t); walk(acc, used); acc.pop(); used.delete(t);
    }
  };
  walk([], new Set());
  combos.sort((a, b) => a.cost - b.cost);
  return {
    slots,
    tileW,
    tileH,
    thr: useThr,
    matrix,
    shift,
    perSlot: perSlotList,
    ranked: combos.slice(0, k).map((c, i) => ({
      positions: c.perm,
      cost: Number(c.cost.toFixed(4)),
      margin: Number(((combos[i + 1] ? combos[i + 1].cost : c.cost) - c.cost).toFixed(4)),
      slots: c.perm.map((t, s) => ({ slot: s, tile: t, mad: Number(matrix[t][s].toFixed(4)), dx: shift[t][s].dx, dy: shift[t][s].dy })),
    })),
  };
}

/** Ranked assignments, cheapest first (the solver's public shape). */
function rank(data, opts) {
  return analyze(data, opts).ranked;
}

module.exports = { analyze, rank, gray, otsu, inkMask, dilate, diffRatio };
