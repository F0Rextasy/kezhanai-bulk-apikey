#!/usr/bin/env node
'use strict';
/**
 * kezhanai.com mint — one account + one key per unit, HTTP-only, exit-pooled.
 *
 * Rail measured 2026-10-19 (the fork's own bundle
 * `/_next/static/chunks/1itln1jfkl227.js` + live runs):
 *
 *   POST /api/registration/captcha        {email}            -> {data:{id, expires_at, prompt, tiles[12]}}
 *   POST /api/registration/captcha/verify  {id, email, positions:[4]} -> {data:{expires_at, token}}
 *   POST /api/verification                  header X-Registration-Captcha: <token>, {email}
 *   POST /api/user/register?turnstile=      {username, password, email, verification_code}
 *   POST /api/user/login                    -> session cookie (+ uid for New-Api-User)
 *   POST /api/token/                        -> token; POST /api/token/:id/key -> the key
 *   POST /v1/chat/completions               -> live chat verification (written only after 200)
 *
 * The captcha is the fork's own "客栈验真帖": the hint image is N tiles wide
 * (768x176 = 4 x 192x176) and the four picked tiles are pasted side by side in
 * click order. The panel re-renders them, so the answer is a *structure* match
 * (src/ink.js, the rail's `captcha.rank`), not a byte compare or a model call.
 *
 * One account talks through ONE exit: `verify` is refused when it arrives from a
 * different IP than the challenge fetch (measured, `proxy-lab/cn4b-exit-bind.js`),
 * so the whole register→login→token→chat flow stays pinned. A refused captcha
 * answer is not re-walked — a fresh challenge is fetched (same email, same exit).
 *
 * Usage:
 *   node providers/kezhanai.com/mint.js --count 100 --conc 3 --model deepseek-v4.1-flash
 *   node providers/kezhanai.com/mint.js --screen          # refresh proxies.txt
 *   node providers/kezhanai.com/mint.js --verify-only     # re-run the chat gate
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Vendored so the shipped `src/cli.js` is self-contained: `./vendor/*` resolves
// both in the lab checkout and in the published repo.
const lib = require('./vendor/lib.js');
const exits = require('./vendor/exits.js');
const captcha = require('./vendor/captcha.js');
const { MailRails } = require('./vendor/mail-rail.js');

const argv = process.argv.slice(2);
const one = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const has = (n) => argv.includes('--' + n);
const DRY = has('dry'); // resolve the plan, write nothing, send nothing

const BASE = 'https://kezhanai.com';
const COUNT = parseInt(one('count', '5'), 10);
const CONC = Math.max(1, Math.min(12, parseInt(one('conc', '10'), 10)));
const MODEL = one('model', ''); // '' = the cheapest priced model the account can reach
const CAPTCHA_HOPS = parseInt(one('captcha-hops', '6'), 10);
const CODE_WAIT_MS = parseInt(one('code-wait', '180000'), 10);
const POLL_MS = parseInt(one('poll-ms', '2500'), 10);
// Rail order. The operator's chain is emailnator → temptf → broker, but the rail
// distribution measured on this panel (2026-10-19: broker 47 · temptf 34 ·
// emailnator 1 of the served mailboxes) makes emailnator the rail this panel
// refuses, so it goes last: a broker failure falls to temptf, which delivers.
const MAIL_ORDER = one('mail-order', 'broker,temptf,emailnator').split(',').map((s) => s.trim()).filter(Boolean);
const BUDGET_MS = parseInt(one('budget', '2400'), 10) * 1000;
// The lab runs two inbox brokers: :9700 mailtrap (one inbox per account, capped
// account-wide) and :9701 inboxes.com (any local part is already an inbox, no
// create call) — the second one is the escape hatch when the Mailtrap cap bites.
const BROKER_PORT = parseInt(one('broker-port', '9700'), 10);
const GAP_MS = Math.max(0, parseInt(one('gap', '1000'), 10)); // industrial pacing is gone

// The checkout root in both layouts: `providers/kezhanai.com/` in the lab,
// `<repo>/src/..` once published — where `connect-9router.js` reads keys.txt.
const DIR = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS = path.join(DIR, 'keys.txt');
const UNFUNDED = path.join(DIR, 'keys-unfunded.txt');
/** Dead keys leave keys.txt and are parked here — repo root, like keys.txt. */
const KEYS_DEAD = path.join(DIR, 'keys-dead.txt');
/** A key the panel refuses outright (auth rejection) — never 429/5xx/transport. */
const keyRejected = (status) => status === 401 || status === 403;
/** key<TAB>reason<TAB>ISO date, one line per dead key, parked next to keys.txt. */
function recordDeadKey(key, reason) {
  try {
    fs.appendFileSync(KEYS_DEAD, `${key}\t${String(reason).replace(/\s+/g, ' ').slice(0, 100)}\t${nowIso()}\n`);
  } catch (e) { /* diagnostics must never break the run */ }
}
const ACCOUNTS = path.join(DIR, 'accounts.json');
const LOG = path.join(DIR, 'out', `mint-${new Date().toISOString().slice(0, 10)}.log`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randHex = (n) => crypto.randomBytes(Math.ceil(n / 2)).toString('hex').slice(0, n);
const nowIso = () => new Date().toISOString();

function log(msg) {
  const line = `${new Date().toISOString().slice(11, 19)} ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG, line + '\n');
}

const state = { minted: 0, unfunded: 0, tried: 0, failed: 0 };
const accounts = (() => {
  try { return JSON.parse(fs.readFileSync(ACCOUNTS, 'utf8')); } catch (e) { return []; }
})();
let writeChain = Promise.resolve();
function saveRec(rec) {
  accounts.push(rec);
  writeChain = writeChain.then(() => fs.writeFileSync(ACCOUNTS, JSON.stringify(accounts, null, 1))).catch(() => {});
  return writeChain;
}
function appendKey(file, key) {
  const seen = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (seen.includes(key)) return;
  fs.appendFileSync(file, key + '\n');
}

const t0 = Date.now();
setInterval(() => {
  log(`· ${Math.round((Date.now() - t0) / 1000)}s · minted=${state.minted} unfunded=${state.unfunded} failed=${state.failed} tried=${state.tried}`);
}, 120000).unref();

/**
 * Screen candidates into proxies.txt (a run without a live list mints nothing).
 * 139 lab dumps against a 5 s connect timeout is ~25 minutes serial, which is
 * most of a mint budget, so the probes run in a bounded wave and the log shows
 * one line per 25 finished candidates.
 */
async function screenPool(pool) {
  const cands = exits.candidates();
  log(`screening ${cands.length} candidates against ${BASE}`);
  let ok = 0;
  let done = 0;
  const QUEUE = cands.slice();
  const worker = async () => {
    for (;;) {
      const p = QUEUE.shift();
      if (!p) return;
      try {
        const r = await lib.jreq(p, `${BASE}/api/status`, { timeoutMs: 12000, connectTimeoutMs: 5000 });
        if (r.status === 200 && /"email_verification"/.test(r.text)) { if (exits.append(p)) ok++; }
      } catch (e) { /* dead */ }
      done++;
      if (done % 25 === 0) log(`   screened ${done}/${cands.length} (${ok} live)`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(16, cands.length) }, worker));
  log(`screened ${ok} new live exit(s) of ${cands.length} candidates`);
  return ok;
}

function panelFetch(pool, pathname, { method = 'GET', body = null, headers = {}, tries = 5, timeoutMs = 30000 } = {}) {
  const url = pathname.startsWith('http') ? pathname : BASE + pathname;
  return pool.attempt((exit) => lib.jreq(exit, url, { method, body, headers, timeoutMs, connectTimeoutMs: 8000 }), { tries });
}

/** Speed-mode pacing: a short random beat, no industrial gap. */
async function pace() {
  await sleep(Math.random() * GAP_MS);
}

/**
 * Spread the workers over the exit list: the pool's sticky rule hands ~80 % of
 * the picks back to the last good exit, which is a thundering herd at conc 10.
 */
function pickExit(pool) {
  const live = pool.exits.filter((e) => (pool.dead.get(e.line) || 0) < 2);
  const from = live.length ? live : pool.exits;
  const pick = from[Math.floor(Math.random() * from.length)];
  pool.alive(pick);
  return pick;
}

async function rl(pool, pathname, opts) {
  for (let i = 0; i < 4; i++) {
    const r = await panelFetch(pool, pathname, opts);
    if (r.status === 429) { log(`   429 → 2.5s back-off (${pathname})`); await sleep(2500); continue; }
    return r;
  }
  throw new Error(`429 persisted: ${pathname}`);
}

/**
 * The fork answers `/api/user/login` with a New-API v2 payload — an
 * `access_token` JWT (uid in its `sub`), a `session` cookie and a `user` object —
 * instead of the stock `id`. Every following call needs one of those plus the
 * uid, and the panel answers 401 AUTH_UNAUTHORIZED for the wrong pair, so the
 * candidates are tried in order (measured on this panel 2026-10-19).
 */
function authVariants(lj, login) {
  const data = (lj && lj.data) || {};
  const tok = data.access_token;
  const sess = ((login.headers && login.headers['set-cookie']) || [])
    .map((c) => String(c).split(';')[0]).find((c) => /^session=/.test(c));
  let sub = (data.user && (data.user.id || data.user.user_id)) || data.id || data.user_id || null;
  if (sub == null && tok) {
    try { sub = JSON.parse(Buffer.from(tok.split('.')[1], 'base64').toString('utf8')).sub; } catch (e) { sub = null; }
  }
  const uid = String(sub == null ? '' : sub);
  const out = [];
  if (tok) out.push({ authorization: `${data.token_type || 'Bearer'} ${tok}`, 'New-Api-User': uid });
  if (sess) out.push({ cookie: sess, 'New-Api-User': uid });
  if (tok) out.push({ authorization: `${data.token_type || 'Bearer'} ${tok}` });
  return { sub, variants: out };
}

async function mintOne(pool, index, MAIL) {
  const rec = { provider: 'kezhanai.com', base: BASE, index, at: nowIso(), status: 'start' };
  let mbox = await MAIL.create({ proxy: pickExit(pool) });
  let acc = { address: mbox.address };
  rec.email = acc.address;
  rec.mailRail = mbox.rail;
  log(`#${index} mailbox ${acc.address} [${mbox.rail}]`);

  // The panel pins a challenge to the exit that fetched it (cross-exit `verify`
  // is refused — measured, `proxy-lab/cn4b-exit-bind.js`), so one account talks
  // through ONE exit for its whole life. A refused answer is not walked and
  // `verify` is not the finish line either: the panel sometimes accepts the
  // answer and then refuses the mail with CAPTCHA_REQUIRED, so one hop is
  // challenge -> verify -> send code and only a dispatched mail ends the loop.
  // A refused hop also leaves the address unusable (its later `verify`s answer
  // CAPTCHA_INVALID on a clean solve), so every retry takes a fresh mailbox.
  let solo = null;
  let sent = null;
  let hops = 0;
  let chj = null;
  let top = null;
  for (; hops < CAPTCHA_HOPS && !sent; hops++) {
    if (!solo) {
      const conn = pickExit(pool);
      solo = new lib.ExitPool([conn], { label: 'kz-conn' });
      rec.exit = `${conn.host}:${conn.port}`;
    }
    if (hops > 0) {
      mbox = await MAIL.create({ proxy: pickExit(pool) });
      acc = { address: mbox.address };
      rec.email = acc.address;
      log(`#${index} hop ${hops + 1}: fresh mailbox ${acc.address}`);
    }
    try {
      const ch = await rl(solo, '/api/registration/captcha', { method: 'POST', body: { email: acc.address } });
      chj = JSON.parse(ch.text);
      if (!chj.data || !chj.data.tiles) throw new Error(`captcha challenge refused: ${String(ch.text).slice(0, 120)}`);
      top = captcha.rank(chj.data, { k: 1, log: (m) => log('   ' + m) })[0];
      const v = await rl(solo, '/api/registration/captcha/verify', { method: 'POST', body: { id: chj.data.id, email: acc.address, positions: top.positions } });
      const vj = (() => { try { return JSON.parse(v.text); } catch (e) { return null; } })();
      const token = vj && vj.data && vj.data.token;
      if (!token) { log(`#${index} captcha hop ${hops + 1} refused on ${rec.exit}: ${JSON.stringify(top.positions)} cost ${top.cost} (${v.status})`); }
      else {
        const send = await rl(solo, '/api/verification', { method: 'POST', headers: { 'X-Registration-Captcha': token }, body: { email: acc.address } });
        rec.sendCode = { status: send.status, body: String(send.text).slice(0, 160) };
        if (/"success"\s*:\s*true/.test(send.text)) sent = send;
        else log(`#${index} sendCode hop ${hops + 1} on ${rec.exit}: ${send.status} ${String(send.text).slice(0, 120)}`);
      }
    } catch (e) {
      if (!lib.isExitError(e)) throw e;
      log(`#${index} exit died mid-captcha, rotating: ${String((e && e.message) || e).slice(0, 90)}`);
      solo = null;
    }
    if (!sent) await sleep(600);
  }
  if (!sent) throw new Error(`captcha+sendCode failed after ${hops} hops (last ${JSON.stringify(top && top.positions)} cost ${top && top.cost})`);
  rec.captcha = { id: chj.data.id, tiles: chj.data.tiles.length, positions: top.positions, topCost: top.cost, margin: top.margin, hops };
  log(`#${index} captcha ok (hop ${hops}, ${JSON.stringify(top.positions)} cost ${top.cost}) sendCode ${sent.status} exit ${rec.exit}`);

  const code = await mbox.waitCode({ timeoutMs: CODE_WAIT_MS, pollMs: POLL_MS });
  rec.code = code;
  log(`#${index} code ${code}`);

  const username = 'kz' + randHex(6);
  const password = 'Kz' + randHex(6) + '!' + (100 + Math.floor(Math.random() * 899));
  rec.username = username;
  rec.password = password;

  const reg = await rl(solo, '/api/user/register?turnstile=', {
    method: 'POST',
    body: { username, password, email: acc.address, verification_code: code },
  });
  rec.register = { status: reg.status, body: String(reg.text).slice(0, 200) };
  log(`#${index} register ${reg.status} ${String(reg.text).slice(0, 160)}`);
  if (!/"success"\s*:\s*true/.test(reg.text)) throw new Error(`register refused: ${reg.text.slice(0, 200)}`);

  const login = await rl(solo, '/api/user/login', { method: 'POST', body: { username, password } });
  const lj = (() => { try { return JSON.parse(login.text); } catch (e) { return null; } })();
  if (!lj || !lj.success) throw new Error(`login failed: ${login.text.slice(0, 200)}`);
  const auth = authVariants(lj, login);
  if (!auth.variants.length) throw new Error(`login gave no credential: ${login.text.slice(0, 200)}`);
  rec.uid = auth.sub;
  rec.login = { status: login.status, group: lj.data && lj.data.group, keys: Object.keys(lj.data || {}) };
  log(`#${index} login ok uid=${auth.sub} keys=${Object.keys(lj.data || {}).join(',')}`);

  let H = auth.variants[0];
  let self = await rl(solo, '/api/user/self', { headers: H });
  for (let i = 1; i < auth.variants.length && self.status === 401; i++) {
    log(`#${index} self 401 on variant ${i - 1}, retrying variant ${i}`);
    H = auth.variants[i];
    self = await rl(solo, '/api/user/self', { headers: H });
  }
  const selfj = (() => { try { return JSON.parse(self.text); } catch (e) { return null; } })();
  rec.quota = selfj && selfj.data && selfj.data.quota;
  rec.self = { status: self.status, raw: String(self.text).slice(0, 200) };
  log(`#${index} self ${self.status} quota=${rec.quota} ${String(self.text).slice(0, 120)}`);
  if (self.status !== 200) throw new Error(`self ${self.status}: ${String(self.text).slice(0, 200)}`);

  // A fresh account has quota 0 and every priced model then answers
  // "用户额度不足" 403; the panel's daily check-in is what funds the account
  // (measured 2026-10-19: 0 → 637 credits).
  const ck = await rl(solo, '/api/user/checkin', { method: 'POST', headers: H });
  rec.checkin = { status: ck.status, body: String(ck.text).slice(0, 160) };
  log(`#${index} checkin ${ck.status} ${String(ck.text).slice(0, 120)}`);
  const ckj = (() => { try { return JSON.parse(ck.text); } catch (e) { return null; } })();
  rec.quota_awarded = ckj && ckj.data && ckj.data.quota_awarded;
  const after = await rl(solo, '/api/user/self', { headers: H });
  const afterj = (() => { try { return JSON.parse(after.text); } catch (e) { return null; } })();
  rec.quota = afterj && afterj.data && afterj.data.quota;
  log(`#${index} quota ${rec.quota} (awarded ${rec.quota_awarded})`);

  // New-API v2 needs a KEY group: with an empty one /v1 answers 403
  // "请设置 KEY 分组", so the group comes from the pricing plan below.
  const groups = await rl(solo, '/api/user/self/groups', { headers: H });
  const gj = (() => { try { return JSON.parse(groups.text); } catch (e) { return null; } })();
  const avail = Object.keys((gj && gj.data) || {});

  // Which model a fresh account can actually reach: the panel lists ~37 models,
  // each enabled for a few KEY groups, and the ratio-0 ones are refused with
  // "价格尚未由管理员配置", so the plan is built from /api/pricing — priced models
  // whose group the account may create a KEY in — cheapest first. The KEY is
  // created in the plan's cheapest group and the gate walks that group's models.
  const pricing = await rl(solo, '/api/pricing');
  const pj = (() => { try { return JSON.parse(pricing.text); } catch (e) { return {}; } })();
  const groupRatio = pj.group_ratio || {};
  const plan = (Array.isArray(pj.data) ? pj.data : [])
    .filter((m) => Number(m.model_ratio) > 0 && Array.isArray(m.enable_groups))
    .flatMap((m) => m.enable_groups.filter((g) => avail.includes(g))
      .map((g) => ({ model: m.model_name, group: g, price: Number(m.model_ratio) * (groupRatio[g] || 1) })))
    .sort((a, b) => a.price - b.price);
  const GROUP = plan.length ? plan[0].group : '';
  const models = [...new Set(plan.filter((p) => p.group === GROUP || !GROUP).map((p) => p.model))];
  const GATE = [...new Set([...(MODEL ? [MODEL] : []), ...models])];
  rec.plan = { groups: avail, priced: plan.length, group: GROUP, gate: GATE.slice(0, 8) };
  log(`#${index} groups [${avail.join(',')}] priced=${plan.length} key-group=${GROUP || '(empty)'} gate=[${GATE.slice(0, 4).join(',')}]`);
  if (!GATE.length) throw new Error(`no priced model to gate (groups ${avail.join(',')})`);

  const created = await rl(solo, '/api/token/', {
    method: 'POST',
    headers: H,
    body: { name: `kz-${index}`, remain_quota: 0, expired_time: -1, unlimited_quota: true, model_limits_enabled: false, model_limits: '', allow_ips: '', group: GROUP },
  });
  rec.createToken = { status: created.status, body: String(created.text).slice(0, 160) };
  const list = await rl(solo, '/api/token/?p=0&size=50', { headers: H });
  const lj2 = (() => { try { return JSON.parse(list.text); } catch (e) { return null; } })();
  const items = (lj2 && lj2.data && (lj2.data.items || lj2.data)) || [];
  const tk = Array.isArray(items) ? items.find((t) => (t.group || '') === GROUP) || items[0] : null;
  if (!tk || !tk.id) throw new Error(`no token after create (${created.status} ${String(created.text).slice(0, 120)} / list ${String(list.text).slice(0, 120)})`);
  rec.tokenId = tk.id;
  const reveal = await rl(solo, `/api/token/${tk.id}/key`, { method: 'POST', headers: H });
  const rj = (() => { try { return JSON.parse(reveal.text); } catch (e) { return null; } })();
  const key = rj && rj.data && (rj.data.key || rj.data);
  if (!key || typeof key !== 'string') throw new Error(`key reveal failed: ${reveal.text.slice(0, 160)}`);
  rec.key = key;
  log(`#${index} key ${key.slice(0, 12)}… (group ${GROUP})`);

  // Chat gate: the key must answer 200 on a priced model the panel actually serves.
  const checks = [];
  for (const model of GATE.slice(0, 8)) {
    const chat = await rl(solo, '/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + key },
      // max_tokens 8 starves a reasoning model (measured: completion_tokens 35, of which
      // 28 reasoning) -> an empty content field is read as "provider produced nothing".
      body: { model, messages: [{ role: 'user', content: 'Reply OK' }], max_tokens: 256 },
      timeoutMs: 90000,
    });
    const cj = (() => { try { return JSON.parse(chat.text); } catch (e) { return null; } })();
    const msg = cj && cj.choices && cj.choices[0] && cj.choices[0].message;
    const txt = msg && String(msg.content || msg.reasoning_content || msg.reasoning || '').trim();
    checks.push({ model, status: chat.status, content: txt || null, error: txt ? null : String(chat.text).slice(0, 200) });
    log(`#${index} chat ${model} → ${chat.status} ${txt ? JSON.stringify(txt.slice(0, 20)) : String(chat.text).slice(0, 120)}`);
    if (chat.status === 200 && txt) break;
    await sleep(600);
  }
  rec.checks = checks;
  const ok = checks.find((c) => c.status === 200 && c.content);
  if (ok) {
    rec.status = 'chat-200';
    rec.model = ok.model;
    rec.content = ok.content.slice(0, 40);
    appendKey(KEYS, key);
    state.minted++;
    log(`✔ #${index} KEY ${key.slice(0, 20)}… [${state.minted} ok]`);
  } else {
    const balanceWall = checks.some((c) => /余额|额度|balance|quota|group|分组|无权|no access|insufficient/i.test(c.error || ''));
    rec.status = balanceWall ? 'key-unfunded' : 'key-unverified';
    if (!balanceWall && checks.some((c) => keyRejected(c.status))) recordDeadKey(key, `chat ${checks.filter((c) => keyRejected(c.status)).map((c) => c.status).join('/')}`);
    appendKey(UNFUNDED, key);
    state.unfunded++;
    log(`✖ #${index} key NOT promoted (${rec.status}) — ${checks.map((c) => c.status).join('/')}`);
  }
  return rec;
}

(async () => {
  if (has('help') || argv.includes('-h')) {
    console.log('kezhanai-bulk — bulk-create Kezhan AI keys (no direct traffic: a proxy pool is required)');
    console.log('  node src/cli.js --count 100 --conc 3 [--model <id>] [--pool proxies.txt]');
    console.log('  node src/cli.js --screen        # vet/refresh the exit pool');
    console.log('  node src/cli.js --verify-only   # re-run the live chat gate over keys.txt');
    console.log('  node src/cli.js --count 100 --dry   # print the resolved plan, write nothing');
    return;
  }

  // `--dry` first, `out/` only for a real run: `--help`/`--dry` must not create
  // anything in the checkout (dry-mutation audit, 2026-10-23).
  if (DRY) {
    console.log(`kezhanai dry run — nothing written, nothing sent
  command   node src/cli.js --count ${COUNT}
  count     ${COUNT}
  conc      ${CONC}
  model     ${MODEL || '(cheapest priced model the account can reach)'}
  exits     ${exits.list().length} in proxies.txt
  keys      ${KEYS}`);
    return;
  }
  fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
  if (has('screen')) {
    const pool = new lib.ExitPool([], { label: 'screen' });
    await screenPool(pool);
    return;
  }

  const list = exits.list();
  if (!list.length) {
    log('proxies.txt is empty — run --screen first (no direct traffic, ever)');
    process.exit(2);
  }
  const pool = new lib.ExitPool(list, { label: 'kezhanai' });
  const MAIL = new MailRails({ order: MAIL_ORDER, log: (m) => log(m), brokerPort: BROKER_PORT, codeWaitMs: CODE_WAIT_MS, pollMs: POLL_MS });
  log(`mint start count=${COUNT} conc=${CONC} model=${MODEL} exits=${list.length} broker=:${BROKER_PORT}`);

  if (has('verify-only')) {
    const keys = fs.existsSync(KEYS) ? fs.readFileSync(KEYS, 'utf8').split(/\r?\n/).filter(Boolean) : [];
    let ok = 0;
    for (const k of keys) {
      const r = await rl(pool, '/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + k }, body: { model: MODEL, messages: [{ role: 'user', content: 'Reply OK' }], max_tokens: 8 }, timeoutMs: 90000 });
      log(`${k.slice(0, 10)}… → ${r.status} ${String(r.text).slice(0, 100)}`);
      if (r.status === 200) ok++;
      if (keyRejected(r.status)) recordDeadKey(k, `chat ${r.status}`);
      await sleep(600);
    }
    log(`verify-only: ${ok}/${keys.length} alive`);
    return;
  }

  let cursor = 0;
  let budgetHit = false;
  const worker = async () => {
    for (;;) {
      const i = ++cursor;
      if (i > COUNT) return;
      // `--budget` is a wall-clock stop, not a post-mortem note: the operator's
      // slot is finite and a runaway run pins the mail rail for hours.
      if (Date.now() - t0 > BUDGET_MS) { budgetHit = true; return; }
      state.tried++;
      const t0acc = Date.now();
      try {
        const rec = await mintOne(pool, i, MAIL);
        rec.ms = Date.now() - t0acc;
        await saveRec(rec);
      } catch (e) {
        state.failed++;
        const msg = String((e && e.message) || e).slice(0, 240);
        log(`✖ #${i} ${msg}`);
        await saveRec({ provider: 'kezhanai.com', base: BASE, index: i, at: nowIso(), status: 'error', error: msg, ms: Date.now() - t0acc });
      }
      await pace();
    }
  };
  const started = Date.now();
  await Promise.all(Array.from({ length: Math.min(CONC, COUNT) }, worker));
  const wall = Date.now() - started;
  const alive = state.minted;
  const perKey = alive ? (wall / 1000 / alive).toFixed(1) : '—';
  const perTry = state.tried ? (wall / 1000 / state.tried).toFixed(1) : '—';
  log(`done in ${Math.round(wall / 1000)}s: ${alive} key(s) live, ${state.unfunded} unfunded, ${state.failed} failed of ${state.tried} attempted — ${perKey} s/key, ${perTry} s/attempt${budgetHit ? ' · budget exhausted' : ''}`);
  log(MAIL.line());
})().catch((e) => { log(`FATAL ${String((e && e.stack) || e).slice(0, 400)}`); process.exit(1); });
