'use strict';
/**
 * BrokerMailbox — mailbox backend over the local inbox broker
 * (proxy-lab/as-inbox-broker.js :9700 mailtrap / :9701 inboxes.com).
 *
 * Contract used by mint-newapi-pinned.js `--mail broker`:
 *   broker: POST /create            -> { address, token }
 *           GET  /list?token=<t>    -> { messages: [ { id, subject, from, text, html } ] }
 *           GET  /read?id&token=<t> -> { id, subject, from, text, html }
 *
 * Surface mirrors river-bulk-apikey/src/mailbox-imap (the `--mail imap` path):
 *   createAccount({ address })                    -> { address, token }
 *   waitForCode({ address, timeoutMs, pollMs })   -> '123456' | 'fd8b37'
 *
 * Code shapes measured so far:
 *   - CN new-api numeric 4-8 digits, plain text bodies;
 *   - **xycai.us: a 6-char hex token rendered inside a styled `<p>` with
 *     `letter-spacing:10px` (`fd8b37`) — the digit-only regex used to miss it
 *     and the mint logged "no code read", measured 2026-10-17.**
 * HTML is stripped twice (with and without a space boundary) because panels
 * split codes across sibling elements; the styled-element probe runs first.
 */
class BrokerMailbox {
  constructor({ port = 9700, log = () => {} } = {}) {
    this.port = port;
    this.log = log;
    this.token = null;
    this.address = null;
  }

  async #req(path, { method = 'GET', timeoutMs = 45000 } = {}) {
    const r = await fetch(`http://127.0.0.1:${this.port}${path}`, { method, signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) throw new Error(`broker ${path} -> ${r.status}`);
    return r.json();
  }

  async createAccount() {
    const j = await this.#req('/create', { method: 'POST' });
    if (!j || !j.address || !j.token) throw new Error('broker create: missing address/token');
    this.token = j.token;
    this.address = j.address;
    this.log(`broker box ${j.address} (:${this.port})`);
    return { address: j.address, token: j.token };
  }

  async #readToken(token) {
    const t = token || this.token;
    if (!t) throw new Error('broker: no token (createAccount first)');
    return t;
  }

  /** Multi-shape code extraction — styled element first, then phrasing, then hex/digits. */
  static extractCode(subject, text, html = '') {
    const htmlRaw = String(html || '');
    const strip = (s, joiner) => String(s || '').replace(/<[^>]+>/g, joiner).replace(/&nbsp;?/g, ' ').replace(/\s+/g, ' ').trim();
    const flat = `${subject || ''} ${strip(text, ' ')} ${strip(htmlRaw, ' ')}`.trim();
    const tight = `${String(text || '')} ${htmlRaw}`.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

    // 1) the styled big-code element (measured on xycai: letter-spacing:10px > fd8b37)
    for (const src of [`${text || ''} ${htmlRaw}`, flat]) {
      const m =
        src.match(/letter-spacing\s*:\s*\d+px[^>]*>\s*([a-zA-Z0-9]{4,10})\s*</i) ||
        src.match(/font-size\s*:\s*(?:3\d|4[0-5])px[^>]*>\s*([a-zA-Z0-9]{4,10})\s*</i);
      if (m) return m[1];
    }
    // 2) phrase-anchored — numeric first (CN panels), then alnum with a brand guard
    //    (measured on 9527.codes: the brand "9527CODE" sat right after the word
    //    "code" and was submitted as the verification code three cycles in a row).
    const words = '(?:验证码|校验码|认证码|动态码|verification code|verify code|your code|code)';
    for (const src of [flat, tight]) {
      const num = src.match(new RegExp(`${words}[^0-9]{1,40}(\\d{4,8})\\b`, 'i'));
      if (num) return num[1];
    }
    for (const src of [flat, tight]) {
      const near = src.match(new RegExp(`${words}[^a-zA-Z0-9]{1,40}([a-zA-Z0-9]{4,10})\\b`, 'i'));
      if (near && !/^\d{1,2}$/.test(near[1]) && !/code/i.test(near[1])) return near[1];
    }
    // 3) a standalone 6-char hex token anywhere in the stripped body
    const hex = tight.match(/(?:^|[^a-zA-Z0-9])([0-9a-f]{6})(?:[^a-zA-Z0-9]|$)/i);
    if (hex) return hex[1];
    // 4) the classic 4-8 digit numeric code
    const digits = tight.match(/(?:^|[^\d])(\d{4,8})(?:[^\d]|$)/);
    return digits ? digits[1] : null;
  }

  async waitForCode({ address = null, token = null, timeoutMs = 150000, pollMs = 4000 } = {}) {
    const t = await this.#readToken(token);
    const t0 = Date.now();
    const seen = new Set();
    while (Date.now() - t0 < timeoutMs) {
      await new Promise((r) => setTimeout(r, pollMs));
      let list;
      try {
        list = await this.#req(`/list?token=${encodeURIComponent(t)}`);
      } catch (e) {
        this.log(`broker list: ${String(e.message).slice(0, 120)}`);
        continue;
      }
      const msgs = (list && list.messages) || [];
      for (const m of msgs) {
        if (!m || !m.id) continue;
        let full = m;
        // bodies can lag behind the list (first read returns an empty shell);
        // retry the same id before giving up on it, then re-visit once more.
        const tries = seen.has(m.id) ? 1 : 2;
        for (let a = 0; a < tries; a++) {
          try {
            full = await this.#req(`/read?id=${encodeURIComponent(m.id)}&token=${encodeURIComponent(t)}`);
          } catch (e) {
            /* fall back to the list stub */
          }
          const code = BrokerMailbox.extractCode(full.subject || m.subject, full.text || m.text || '', full.html || m.html || '');
          if (code) {
            this.log(`broker mail ${m.from || '?'} | ${m.subject || ''} -> code ${code}`);
            return code;
          }
          if (a + 1 < tries) await new Promise((r) => setTimeout(r, 2500));
        }
        if (!seen.has(m.id)) {
          seen.add(m.id);
          const tight = String(full.html || m.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          this.log(`broker mail seen but code not extracted: ${m.from || '?'} | ${m.subject || ''} | body[0..160]="${tight.slice(0, 160)}"`);
        }
      }
    }
    throw new Error(`broker waitForCode: no code in ${timeoutMs}ms for ${address || this.address || '?'}`);
  }
  /** Wait for a message whose full text matches `re`; returns the match array. */
  async waitForMatch({ re, timeoutMs = 150000, pollMs = 5000 } = {}) {
    const t = await this.#readToken();
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      await new Promise((r) => setTimeout(r, pollMs));
      let list;
      try {
        list = await this.#req(`/list?token=${encodeURIComponent(t)}`);
      } catch (e) {
        this.log(`broker list: ${String(e.message).slice(0, 100)}`);
        continue;
      }
      for (const m of (list && list.messages) || []) {
        let full = m;
        try {
          full = await this.#req(`/read?id=${encodeURIComponent(m.id)}&token=${encodeURIComponent(t)}`);
        } catch (e) {
          /* keep the list stub */
        }
        const corpus = `${full.subject || ''} ${full.text || ''} ${full.html || ''}`;
        const mm = corpus.match(re);
        if (mm) return mm;
      }
    }
    return null;
  }
}

module.exports = { BrokerMailbox };
