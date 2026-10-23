<div align="center">

```
██╗  ██╗███████╗███████╗██╗  ██╗ █████╗ ███╗   ██╗ █████╗ ██╗
██║ ██╔╝██╔════╝╚══███╔╝██║  ██║██╔══██╗████╗  ██║██╔══██╗██║
█████╔╝ █████╗    ███╔╝ ███████║███████║██╔██╗ ██║███████║██║
██╔═██╗ ██╔══╝   ███╔╝  ██╔══██║██╔══██║██║╚██╗██║██╔══██║██║
██║  ██╗███████╗███████╗██║  ██║██║  ██║██║ ╚████║██║  ██║██║
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝
```

# kezhanai-bulk-apikey

**Bulk-create Kezhan AI (客栈 AI) accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-5-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Kezhan AI hands every new account a **daily check-in grant** (≈592-637 quota per day) and this tool turns that into a `keys.txt` where **every line survived a live chat call**. The unit that scales is *one account per key*, the sign-up captcha is a 12-tile montage solved with a pixel-difference solver, and the mail rail rotates automatically so a dead mailbox never stops the run.

## 🎁 Free tier — how much you get

**Every account earns a daily check-in grant** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — the KEY group is what makes the cheap models free-ish to spend against.

| What | Value |
| --- | --- |
| Card required | **No** |
| Captcha | 12-tile ink montage — **solved in-tool** |
| Mail verification | required — rail rotates broker → temp.tf → emailnator |
| Daily grant | check-in, `quota_awarded ≈ 592-637` / day |
| The unit that scales | **one account = one key** → `--count N` is "N accounts" |

A fresh account with `quota=0` gets **403 `用户额度不足`** on priced models — the tool always checks in before it asks for a key.

> 💡 The free tier is set by Kezhan AI and can change. Check the live numbers at [kezhanai.com](https://kezhanai.com) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 5 of them

Only ids that answered a live **200** are listed:

| Model ID | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` is the cheapest priced model (group `gpt-pro`, group ratio **0.0265**) and doubles as the default gate. There is **no `deepseek-*` id** on this panel (37 ids: gpt-5.x/6.x + claude family). Known-refusing ids: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (403 quota before check-in), `model_ratio=0` ids (400 `价格尚未由管理员配置`).

## 🧪 How to use the API

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Quick start

```bash
# clone or fork this repository, then:
cd kezhanai-bulk-apikey

# 1) your proxy list, one per line (http://… or socks5://…)
printf 'http://127.0.0.1:8080\n' > proxies.txt   # optional — without it the tool runs direct

# 2) go
node src/launcher.js        # interactive
# or directly:
node src/cli.js --count 50
```

`--screen` refreshes the exit list first (candidate dumps → live, `email_verification` visible); every key is written **only** after a live chat 200.

### 🖱️ The launcher

The launcher asks for proxy list, count and model, remembers them in `launcher.config.json`, and runs the CLI with the right flags.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| captcha `POST /api/registration/captcha` → `verify` | **200** (ink solver, first-try 9/12 hops) |
| register `POST /api/user/register?turnstile=` | **200** |
| login `POST /api/user/login` | **200** — New-API **v2** payload (`access_token` JWT + uid) |
| auth | `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` on every call |
| check-in `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| key | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → full key |
| chat gate — run for **every** key before it is written | **200** with real content |

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| captcha | `POST /api/registration/captcha` | 768×176 montage, 12 tiles — solved locally |
| verify | `POST /api/verification` + `X-Registration-Captcha: <token>` | code lands in the mailbox |
| signup | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| login | `POST /api/user/login` | `access_token` + uid |
| grant | `POST /api/user/checkin` | daily check-in |
| key | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | reveal |
| check | `POST /v1/chat/completions` | live 200 required before `keys.txt` |

## ⚙️ CLI options

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--count` | 5 | rounds (= accounts) to attempt |
| `--conc` | 10 | parallel rounds (capped at 12) |
| `--model` | plan pick | explicit id puts the gate first |
| `--screen` | — | refresh `proxies.txt` from candidate dumps (required first step) |
| `--verify-only` | — | re-run every key in `keys.txt` through the chat-200 gate |
| `--budget` | 2400 s | hard stop — workers stop taking rounds |
| `--mail-order` | `broker,temptf,emailnator` | mailbox rail chain |

## 🛰️ Behind a proxy

**Optional — recommended at scale (per-IP limits, bans).** The tool works without a proxy too.

- **With a pool:** write one exit per line to `proxies.txt` (`http://…` or `socks5://…`, or point `KEZHANAI_PROXIES` at your list) and every request goes through an exit from that list — one account holds one exit for its whole life.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and connects directly — captcha, verification mail, check-in, key mint and the chat gate all run the same way.
- `--screen` refreshes `proxies.txt` from the candidate dumps; it is not a required first step in either mode.

**One critical transport rule:** the captcha `verify` call must come from the **same exit that fetched the challenge** (same-exit all pass, cross-exit 0/5) — the tool pins the account to one exit and uses a fresh mailbox per hop. `--screen` refreshed 739 candidates in ≈3 min to grow the pool 62 → 132 exits on the operator's fleet.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one chat-200 key per line — git-ignored |
| `keys-unfunded.txt` | keys that never passed the gate — retry later |
| `accounts.json` | per-round raw evidence (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | exit list — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router. One command turns `keys.txt` into a provider-node with working combos:

```bash
node src/connect-9router.js
```

Defaults: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router. One command turns `keys.txt` into a provider-node with working combos:

```bash
node src/connect-omniroute.js
```

Defaults: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 What the provider gives | one account per key — ink-captcha solved, daily check-in grant, every key chat-verified |
| 🔑 What one key gets you | one API key scoped to its own account: the 5 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Your data | only kezhanai.com and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

If the panel changes its captcha shape, group ratios or check-in grant, the tool stops at that step and says so. **[Open an issue](../../issues)** with the command you ran and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>
