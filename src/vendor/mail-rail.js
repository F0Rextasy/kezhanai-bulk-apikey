'use strict';
/**
 * Mail-rail rotation for the bulk rails (operator directive 2026-10-19).
 *
 * Our own mailbox quota is never a reason to wait: a rail that answers a
 * 429/limit/reject instantly hands the next account to the next rail. Order
 * `emailnator (gmail) → temptf (Microsoft alias) → mailtrap broker`; every
 * adapter exposes the same shape so a calling rail only sees
 * `{ rail, address, waitCode(), close() }`, and the run reports which rail
 * served how many accounts plus the failover count.
 *
 * The panel's own SMTP quota/deliverability is not ours to fix: when a panel
 * refuses the address (`EMAIL_ADDRESS_REJECTED`) or never delivers, that is a
 * panel-side limit to report, and rotating rails does not repair it.
 */
// Vendored copy: every rail module sits beside this file, so the require graph
// is flat and resolves in the lab checkout and in the published `src/vendor/`.
const emailnator = require('./emailnator.js');
const { TempTf } = require('./temptf.js');
const { BrokerMailbox } = require('./mailbox-broker.js');

/** Panels mail a 4-8 digit code (hex codes are handled by the rails that need them). */
const CODE_RE = /(?:^|[^\d])(\d{4,8})(?!\d)/;
function codeIn(text) {
  const m = String(text || '').match(CODE_RE);
  return m ? m[1] : null;
}

class MailRails {
  /**
   * @param {{order?:string[], log?:Function, brokerPort?:number, codeWaitMs?:number, pollMs?:number}} opts
   */
  constructor({ order = ['emailnator', 'temptf', 'broker'], log = () => {}, brokerPort = 9700, codeWaitMs = null, pollMs = null } = {}) {
    this.order = order.slice();
    this.log = log;
    this.brokerPort = brokerPort;
    this.codeWaitMs = codeWaitMs;
    this.pollMs = pollMs;
    this.failover = 0;
    this.used = new Map();
    this.errors = new Map();
  }

  /**
   * Next account; a failing rail rotates immediately, no sleep.
   *
   * Every attempt starts at `order[0]` — the rail the caller ranked best. A
   * successful-but-slow rail must not pin the fleet: measured 2026-10-19 on
   * kezhanai, one temp.tf success made every later account start at temp.tf
   * (90-180 s no-code waits) while the healthy broker sat idle at index 0.
   */

  async create({ proxy = null, tries = 3 } = {}) {
    let last = null;
    for (let t = 0; t < tries; t++) {
      const rail = this.order[t % this.order.length];
      try {
        const box = await this.open(rail, proxy);
        this.used.set(rail, (this.used.get(rail) || 0) + 1);
        if (t) {
          this.log(`   mail rail → ${rail} (${box.address})`);
        }
        return box;
      } catch (e) {
        last = e;
        this.errors.set(rail, String((e && e.message) || e).slice(0, 140));
        this.failover++;
        this.log(`   mail rail ${rail} unavailable → next (${String((e && e.message) || e).slice(0, 90)})`);
      }
    }
    throw new Error(`no mail rail after ${tries} tries: ${String((last && last.message) || last).slice(0, 160)}`);
  }

  async open(rail, proxy) {
    const wait = { timeoutMs: this.codeWaitMs || undefined, pollMs: this.pollMs || undefined };
    if (rail === 'broker') {
      // The broker answers `/create -> 500` when it is slammed (measured at
      // conc 10), so the proven rail retries in place before the chain moves on.
      let last = null;
      for (let i = 0; i < 3; i++) {
        try {
          const box = new BrokerMailbox({ port: this.brokerPort, log: () => {} });
          const acc = await box.createAccount();
          return { rail, address: acc.address, waitCode: (o = {}) => box.waitForCode({ ...wait, ...o }), close: () => {} };
        } catch (e) {
          last = e;
          await new Promise((r) => setTimeout(r, 1200));
        }
      }
      throw last;
    }
    if (rail === 'emailnator') {
      const a = await emailnator.newAddress(proxy);
      const address = a && a.plain ? a.plain : String(a);
      return {
        rail,
        address,
        waitCode: async (o = {}) => {
          const mail = await emailnator.waitForCloudflareMail(address, proxy, { ...wait, ...o, log: () => {} });
          const code = codeIn(mail.text) || codeIn(mail.html);
          if (!code) throw new Error(`emailnator mail without a code: ${String(mail.subject || '').slice(0, 60)}`);
          return code;
        },
        close: () => {},
      };
    }
    if (rail === 'temptf') {
      const tf = new TempTf({ log: () => {} });
      await tf.createAccount();
      return {
        rail,
        address: tf.address,
        waitCode: async (o = {}) => {
          const r = await tf.waitForCode({ ...wait, ...o, log: () => {} });
          const code = r && (r.code || codeIn(r.text) || codeIn(r.html));
          if (!code) throw new Error('temptf mail without a code');
          return code;
        },
        close: () => { try { tf.close(); } catch (e) { /* */ } },
      };
    }
    throw new Error(`unknown mail rail ${rail}`);
  }

  /** One report line: which rail served what, plus the failover count. */
  line() {
    const used = [...this.used.entries()].map(([k, v]) => `${k}:${v}`).join(' ');
    const errs = [...this.errors.entries()].map(([k, v]) => `${k}=${v.slice(0, 40)}`).join(' · ');
    return `mail rails ${used || '(none)'} · failover ${this.failover}${errs ? ` · ${errs}` : ''}`;
  }
}

module.exports = { MailRails, codeIn };
