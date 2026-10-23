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

**Massenhaft Kezhan AI (客栈 AI)-Konten mit automatisch generierten API-Schlüsseln erstellen — OpenAI-kompatible Inferenz + 9Router-Konnektor.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenlose Stufe](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-5-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Kezhan AI gewährt jedem neuen Konto eine **tägliche Check-in-Gutschrift** (≈592-637 Kontingent pro Tag), und dieses Tool verwandelt das in eine `keys.txt`, in der **jede Zeile einen echten Chat-Aufruf überlebt hat**. Die Einheit, die skaliert, ist *ein Konto pro Schlüssel*, das Registrierungs-Captcha ist eine 12-Kachel-Montage, die mit einem Pixel-Differenz-Löser gelöst wird, und die Mail-Schiene rotiert automatisch, damit ein totes Postfach den Lauf nie stoppt.

## 🎁 Kostenlose Stufe — wie viel du bekommst

**Jedes Konto erhält eine tägliche Check-in-Gutschrift** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — die KEY-Gruppe ist das, was die günstigen Modelle quasi kostenlos nutzbar macht.

| Was | Wert |
| --- | --- |
| Karte erforderlich | **Nein** |
| Captcha | 12-Kachel-Tinten-Montage — **im Tool gelöst** |
| Mail-Verifizierung | erforderlich — Schiene rotiert broker → temp.tf → emailnator |
| Tägliche Gutschrift | Check-in, `quota_awarded ≈ 592-637` / Tag |
| Die Einheit, die skaliert | **ein Konto = ein Schlüssel** → `--count N` bedeutet „N Konten" |

Ein frisches Konto mit `quota=0` erhält **403 `用户额度不足`** bei kostenpflichtigen Modellen — das Tool checkt immer zuerst ein, bevor es einen Schlüssel anfordert.

> 💡 Die kostenlose Stufe wird von Kezhan AI festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [kezhanai.com](https://kezhanai.com) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 5 davon

Nur IDs, die mit einem echten **200** geantwortet haben, sind aufgeführt:

| Modell-ID | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` ist das günstigste kostenpflichtige Modell (Gruppe `gpt-pro`, Gruppenverhältnis **0.0265**) und dient zugleich als Standard-Gate. Es gibt **keine `deepseek-*`-ID** auf diesem Panel (37 IDs: gpt-5.x/6.x + claude-Familie). Bekanntlich ablehnende IDs: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (403 Kontingent vor Check-in), `model_ratio=0`-IDs (400 `价格尚未由管理员配置`).

## 🧪 Die API verwenden

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Schnellstart

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

`--screen` aktualisiert zuerst die Exit-Liste (Kandidaten-Dumps → live, `email_verification` sichtbar); jeder Schlüssel wird **erst** geschrieben, nachdem ein echter Chat-200 erfolgt ist.

### 🖱️ Der Launcher

Der Launcher fragt nach Proxy-Liste, Anzahl und Modell, merkt sie sich in `launcher.config.json` und führt die CLI mit den richtigen Flags aus.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| Captcha `POST /api/registration/captcha` → `verify` | **200** (Tinten-Löser, beim ersten Versuch 9/12 Treffer) |
| Registrierung `POST /api/user/register?turnstile=` | **200** |
| Login `POST /api/user/login` | **200** — New-API **v2**-Payload (`access_token` JWT + uid) |
| Auth | `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` bei jedem Aufruf |
| Check-in `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| Schlüssel | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → vollständiger Schlüssel |
| Chat-Gate — für **jeden** Schlüssel ausgeführt, bevor er geschrieben wird | **200** mit echtem Inhalt |

> **Qualitäts-Gates.** Jeder Schlüssel hier hat ein echtes `chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben Regel auf Modellebene: ein Eintrag wird
> **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Schlüssel oder ein toter Anbieter wird verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie versteckt.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Captcha | `POST /api/registration/captcha` | 768×176 Montage, 12 Kacheln — lokal gelöst |
| Verifizierung | `POST /api/verification` + `X-Registration-Captcha: <token>` | Code landet im Postfach |
| Registrierung | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| Login | `POST /api/user/login` | `access_token` + uid |
| Gutschrift | `POST /api/user/checkin` | täglicher Check-in |
| Schlüssel | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | aufdecken |
| Prüfung | `POST /v1/chat/completions` | echtes 200 erforderlich vor `keys.txt` |

## ⚙️ CLI-Optionen

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Flag | Standard | Bedeutung |
| --- | --- | --- |
| `--count` | 5 | Runden (= Konten), die versucht werden |
| `--conc` | 10 | parallele Runden (begrenzt auf 12) |
| `--model` | Plan-Auswahl | explizite ID stellt das Gate an die erste Stelle |
| `--screen` | — | `proxies.txt` aus Kandidaten-Dumps aktualisieren (erforderlicher erster Schritt) |
| `--verify-only` | — | jeden Schlüssel in `keys.txt` erneut durch das Chat-200-Gate laufen lassen |
| `--budget` | 2400 s | harter Stopp — Worker nehmen keine Runden mehr an |
| `--mail-order` | `broker,temptf,emailnator` | Kette der Postfach-Schiene |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen (Limits pro IP, Sperren).** Das Tool funktioniert auch ohne Proxy.

- **Mit einem Pool:** schreibe einen Exit pro Zeile in `proxies.txt` (`http://…` oder `socks5://…`, oder richte `KEZHANAI_PROXIES` auf deine Liste) und jede Anfrage geht durch einen Exit aus dieser Liste — ein Konto behält einen Exit für sein ganzes Leben.
- **Ohne Pool:** die CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet direkt — Captcha, Verifizierungsmail, Check-in, Schlüsselerstellung und das Chat-Gate laufen alle gleich ab.
- `--screen` aktualisiert `proxies.txt` aus den Kandidaten-Dumps; es ist in keinem der beiden Modi ein erforderlicher erster Schritt.

**Eine kritische Transportregel:** der Captcha-`verify`-Aufruf muss vom **selben Exit kommen, der die Challenge abgerufen hat** (gleicher Exit: alle bestehen, Exit-Wechsel: 0/5) — das Tool bindet das Konto an einen Exit und verwendet pro Sprung ein frisches Postfach. `--screen` aktualisierte 739 Kandidaten in ≈3 min, um den Pool von 62 → 132 Exits in der Flotte des Betreibers zu erweitern.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein Chat-200-Schlüssel pro Zeile — von Git ignoriert |
| `keys-unfunded.txt` | Schlüssel, die das Gate nie bestanden haben — später erneut versuchen |
| `accounts.json` | Rohbelege pro Runde (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | Exit-Liste — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router. Ein Befehl verwandelt `keys.txt` in einen Provider-Node mit funktionierenden Kombinationen:

```bash
node src/connect-9router.js
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router. Ein Befehl verwandelt `keys.txt` in einen Provider-Node mit funktionierenden Kombinationen:

```bash
node src/connect-omniroute.js
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 Was der Anbieter gibt | ein Konto pro Schlüssel — Tinten-Captcha gelöst, tägliche Check-in-Gutschrift, jeder Schlüssel chat-verifiziert |
| 🔑 Was ein Schlüssel dir bringt | einen API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 5 Modell-IDs am unten stehenden Endpunkt, im Rahmen deines Plans. Das Kontingent liegt auf dem **Konto**, genau deshalb erstellt dieses Tool ein Konto pro Schlüssel |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Deine Daten | nur kezhanai.com und das von dir konfigurierte Postfach-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Probleme

Wenn das Panel die Form seines Captchas, die Gruppierungsverhältnisse oder die Check-in-Gutschrift ändert, stoppt das Tool an diesem Schritt und sagt es. **[Öffne ein Issue](../../issues)** mit dem ausgeführten Befehl und der genauen Ausgabe; PRs sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>