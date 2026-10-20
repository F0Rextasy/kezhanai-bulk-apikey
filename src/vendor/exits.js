'use strict';
/**
 * kezhanai.com exit supply for the mint rail.
 *
 * The lab-wide candidate dumps are ~2 % live (measured 2026-10-19: 3 of 143),
 * and each dead exit costs a full connect timeout, so the rail keeps its own
 * screened list (`proxies.txt`, one `scheme://host:port` per line, `# notes`
 * allowed) and re-screens candidates into it only when asked (`--screen`).
 *
 * The list is optional: with no file — or an empty one — the mint switches to
 * DIRECT mode (see `lib.req`), and no request is refused for the missing exits.
 */
const fs = require('fs');
const path = require('path');
const { parseProxy, loadPoolFile } = require('./proxy.js');

// Two layouts, one copy: `providers/kezhanai.com/vendor/` in the lab and
// `<repo>/src/vendor/` once published. DIR is the checkout either way — that is
// where the user's `proxies.txt` lives (beside `src/`, where 9Router looks for
// `keys.txt`), and ROOT is only used for the lab's own candidate dumps.
const SHIPPED = path.basename(path.resolve(__dirname, '..')) === 'src';
const DIR = SHIPPED ? path.resolve(__dirname, '..', '..') : path.resolve(__dirname, '..');
// The launcher hands the file it asked for over as `KEZHANAI_PROXIES`; without
// one the conventional `proxies.txt` beside `src/` is used.
const LIST = process.env.KEZHANAI_PROXIES ? path.resolve(DIR, process.env.KEZHANAI_PROXIES) : path.join(DIR, 'proxies.txt');
const ROOT = SHIPPED ? null : path.resolve(__dirname, '..', '..', '..');

/** Candidate files the lab's screeners already wrote, cheapest-first. */
const CANDIDATES = !ROOT
  ? []
  : [
      path.join(ROOT, 'proxy-lab', 'out', 'proxies-emergency.txt'),
      path.join(ROOT, 'proxy-lab', 'out', '9c-live-exits.txt'),
      path.join(ROOT, 'proxy-lab', 'out', 'captcha-exits-live.txt'),
      path.join(ROOT, 'proxy-lab', 'out', 'freshpool-live.txt'),
      // The 2026-10-19 dumps; the first four are small screened lists, these two
      // are raw multi-thousand-line pools, so only a bounded head of each is probed.
      path.join(ROOT, 'proxy-lab', 'out', 'llmgw-exits-2.txt'),
      path.join(ROOT, 'proxy-lab', 'out', 'union-live.txt'),
    ];

/**
 * Per-file probe budget. Measured 2026-10-19: the small lists are exhausted (2
 * live exits out of 139), while the labs' raw pools hold ~2 % live lines —
 * probing them wholesale is hours, probing a head is minutes and is the only
 * lever that still adds exits to `proxies.txt`.
 */
const PER_FILE_CAP = 300;

function list() {
  const out = [];
  let lines;
  try {
    lines = loadPoolFile(LIST);
  } catch (e) {
    return out; // no list file at all: the CLI turns this into DIRECT mode
  }
  for (const line of lines) {
    const p = typeof line === 'string' ? parseProxy(line) : line;
    if (p) out.push(p);
  }
  return out;
}

function append(proxy) {
  const line = `${proxy.protocol}://${proxy.username ? proxy.username + ':' + proxy.password + '@' : ''}${proxy.host}:${proxy.port}`;
  const seen = new Set(fs.existsSync(LIST) ? fs.readFileSync(LIST, 'utf8').split(/\r?\n/) : []);
  if (seen.has(line)) return false;
  fs.appendFileSync(LIST, line + '\n');
  return true;
}

function candidates() {
  const seen = new Set();
  const out = [];
  for (const f of CANDIDATES) {
    let lines;
    try { lines = loadPoolFile(f); } catch (e) { continue; }
    let taken = 0;
    for (const line of lines) {
      if (taken >= PER_FILE_CAP) break;
      const p = typeof line === 'string' ? parseProxy(line) : line;
      if (!p) continue;
      const id = `${p.host}:${p.port}`;
      if (seen.has(id)) continue;
      seen.add(id);
      taken++;
      out.push(p);
    }
  }
  return out;
}

module.exports = { LIST, list, append, candidates, DIR };
