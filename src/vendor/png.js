'use strict';
/**
 * Minimal PNG decoder — pure Node (`zlib` only).
 *
 * The captcha panel serves its prompt and tiles as `data:image/png;base64,…` and
 * the match is pixel-exact, so the rail needs raw RGB(A) buffers, not a full
 * codec. Supports the shapes measured on the panel (8-bit, colour types 0/2/4/6,
 * no interlace) and refuses anything else loudly rather than guessing.
 */

const zlib = require('zlib');

const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 };

/** @returns {{width:number,height:number,channels:number,data:Buffer}} data = RGB(A), rows top-down */
function decode(buffer) {
  if (buffer.length < 8 || buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8;
  let ihdr = null;
  const idat = [];
  while (off + 8 <= buffer.length) {
    const len = buffer.readUInt32BE(off);
    const type = buffer.toString('ascii', off + 4, off + 8);
    const body = buffer.slice(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        width: body.readUInt32BE(0),
        height: body.readUInt32BE(4),
        bitDepth: body[8],
        colorType: body[9],
        interlace: body[12],
      };
    } else if (type === 'IDAT') {
      idat.push(body);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }
  if (!ihdr) throw new Error('PNG has no IHDR');
  if (ihdr.bitDepth !== 8) throw new Error(`unsupported bit depth ${ihdr.bitDepth}`);
  if (ihdr.interlace !== 0) throw new Error('interlaced PNG unsupported');
  const channels = CHANNELS[ihdr.colorType];
  if (!channels) throw new Error(`unsupported colour type ${ihdr.colorType}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = ihdr.width * channels;
  const out = Buffer.alloc(stride * ihdr.height);
  let prev = Buffer.alloc(stride);
  let pos = 0;
  for (let y = 0; y < ihdr.height; y++) {
    const filter = raw[pos++];
    const line = raw.slice(pos, pos + stride);
    pos += stride;
    const cur = out.slice(y * stride, (y + 1) * stride);
    line.copy(cur);
    unfilter(filter, cur, prev, channels);
    prev = cur;
  }
  return { width: ihdr.width, height: ihdr.height, channels, data: out };
}

function unfilter(filter, cur, prev, bpp) {
  const n = cur.length;
  switch (filter) {
    case 0:
      break;
    case 1:
      for (let i = bpp; i < n; i++) cur[i] = (cur[i] + cur[i - bpp]) & 0xff;
      break;
    case 2:
      for (let i = 0; i < n; i++) cur[i] = (cur[i] + prev[i]) & 0xff;
      break;
    case 3:
      for (let i = 0; i < n; i++) {
        const a = i >= bpp ? cur[i - bpp] : 0;
        cur[i] = (cur[i] + ((a + prev[i]) >> 1)) & 0xff;
      }
      break;
    case 4:
      for (let i = 0; i < n; i++) {
        const a = i >= bpp ? cur[i - bpp] : 0;
        const b = prev[i];
        const c = i >= bpp ? prev[i - bpp] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        cur[i] = (cur[i] + pr) & 0xff;
      }
      break;
    default:
      throw new Error(`unknown PNG filter ${filter}`);
  }
}

/** `data:image/png;base64,…` (or a bare base64 body) → decoded image. */
function decodeDataUri(value) {
  const s = String(value || '');
  const i = s.indexOf('base64,');
  return decode(Buffer.from(i === -1 ? s : s.slice(i + 7), 'base64'));
}

module.exports = { decode, decodeDataUri };
