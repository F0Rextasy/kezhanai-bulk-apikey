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

**Créez en masse des comptes Kezhan AI (客栈 AI) avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-5-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

Kezhan AI offre à chaque nouveau compte une **récompense de pointage quotidien** (≈592-637 de quota par jour) et cet outil transforme cela en un `keys.txt` où **chaque ligne a survécu à un appel de chat en direct**. L'unité qui monte en charge est *un compte par clé*, le captcha d'inscription est un montage de 12 tuiles résolu avec un solveur de différence de pixels, et le rail de messagerie tourne automatiquement pour qu'une boîte morte n'arrête jamais l'exécution.

## 🎁 Offre gratuite — combien vous obtenez

**Chaque compte gagne une récompense de pointage quotidien** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — le groupe KEY est ce qui rend les modèles bon marché quasi gratuits à consommer.

| Quoi | Valeur |
| --- | --- |
| Carte requise | **Non** |
| Captcha | Montage d'encre de 12 tuiles — **résolu dans l'outil** |
| Vérification par e-mail | requise — le rail tourne broker → temp.tf → emailnator |
| Récompense quotidienne | pointage, `quota_awarded ≈ 592-637` / jour |
| L'unité qui monte en charge | **un compte = une clé** → `--count N` signifie « N comptes » |

Un compte frais avec `quota=0` reçoit **403 `用户额度不足`** sur les modèles payants — l'outil fait toujours le pointage avant de demander une clé.

> 💡 L'offre gratuite est définie par Kezhan AI et peut changer. Vérifiez les chiffres en direct sur [kezhanai.com](https://kezhanai.com) — et laissez la propre barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 5 au complet

Seuls les ids qui ont répondu un **200** en direct sont listés :

| ID du modèle | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` est le modèle payant le moins cher (groupe `gpt-pro`, ratio de groupe **0.0265**) et sert aussi de barrière par défaut. Il n'y a **aucun id `deepseek-*`** sur ce panneau (37 ids : gpt-5.x/6.x + famille claude). Ids connus pour refuser : `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (403 quota avant pointage), ids avec `model_ratio=0` (400 `价格尚未由管理员配置`).

## 🧪 Comment utiliser l'API

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Démarrage rapide

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

`--screen` rafraîchit d'abord la liste de sortie (dumps de candidats → live, `email_verification` visible) ; chaque clé n'est écrite **qu'**après un chat 200 en direct.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys, le nombre et le modèle, les mémorise dans `launcher.config.json`, et exécute le CLI avec les bons flags.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| captcha `POST /api/registration/captcha` → `verify` | **200** (solveur d'encre, 9/12 sauts du premier coup) |
| inscription `POST /api/user/register?turnstile=` | **200** |
| connexion `POST /api/user/login` | **200** — charge utile New-API **v2** (`access_token` JWT + uid) |
| auth | `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` à chaque appel |
| pointage `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| clé | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → clé complète |
| barrière de chat — exécutée pour **chaque** clé avant écriture | **200** avec du contenu réel |

> **Barrières de qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combos de routeur suivent la même règle au niveau du modèle : une entrée n'est
> ajoutée **que si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté plutôt qu'ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais cachés.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Notes |
| --- | --- | --- |
| captcha | `POST /api/registration/captcha` | montage 768×176, 12 tuiles — résolu localement |
| vérification | `POST /api/verification` + `X-Registration-Captcha: <token>` | le code arrive dans la boîte mail |
| inscription | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| connexion | `POST /api/user/login` | `access_token` + uid |
| récompense | `POST /api/user/checkin` | pointage quotidien |
| clé | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | révélation |
| vérification | `POST /v1/chat/completions` | 200 en direct requis avant `keys.txt` |

## ⚙️ Options du CLI

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Flag | Défaut | Signification |
| --- | --- | --- |
| `--count` | 5 | tours (= comptes) à tenter |
| `--conc` | 10 | tours en parallèle (plafonné à 12) |
| `--model` | choix du plan | un id explicite place la barrière en premier |
| `--screen` | — | rafraîchit `proxies.txt` à partir des dumps de candidats (première étape requise) |
| `--verify-only` | — | relance chaque clé de `keys.txt` à travers la barrière chat-200 |
| `--budget` | 2400 s | arrêt forcé — les workers cessent de prendre des tours |
| `--mail-order` | `broker,temptf,emailnator` | chaîne de rails de messagerie |

## 🛰️ Derrière un proxy

**Facultatif — recommandé à grande échelle (limites par IP, bannissements).** L'outil fonctionne aussi sans proxy.

- **Avec un pool :** écrivez une sortie par ligne dans `proxies.txt` (`http://…` ou `socks5://…`, ou pointez `KEZHANAI_PROXIES` vers votre liste) et chaque requête passe par une sortie de cette liste — un compte conserve une sortie pour toute sa durée de vie.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et se connecte directement — captcha, e-mail de vérification, pointage, création de clé et barrière de chat fonctionnent tous de la même manière.
- `--screen` rafraîchit `proxies.txt` à partir des dumps de candidats ; ce n'est pas une première étape requise dans l'un ou l'autre mode.

**Une règle de transport critique :** l'appel captcha `verify` doit provenir de la **même sortie que celle qui a récupéré le défi** (même sortie tout passe, sorties croisées 0/5) — l'outil épingle le compte à une sortie et utilise une boîte mail fraîche à chaque saut. `--screen` a rafraîchi 739 candidats en ≈3 min pour faire passer le pool de 62 → 132 sorties sur la flotte de l'opérateur.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé chat-200 par ligne — ignoré par git |
| `keys-unfunded.txt` | clés qui n'ont jamais passé la barrière — à réessayer plus tard |
| `accounts.json` | preuves brutes par tour (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | liste de sorties — ignoré par git |

## 🔌 Connexion à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé, compatible OpenAI. Une commande transforme `keys.txt` en un nœud fournisseur avec des combos fonctionnels :

```bash
node src/connect-9router.js
```

Défauts : `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔌 Connexion à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé, compatible OpenAI. Une commande transforme `keys.txt` en un nœud fournisseur avec des combos fonctionnels :

```bash
node src/connect-omniroute.js
```

Défauts : `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 Ce qu'une clé vous donne

| | |
| --- | --- |
| 🏢 Fournisseur | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 Ce que le fournisseur donne | un compte par clé — captcha d'encre résolu, récompense de pointage quotidien, chaque clé vérifiée par chat |
| 🔑 Ce qu'une clé vous donne | une clé API limitée à son propre compte : les 5 ids de modèles sur le point de terminaison ci-dessous, selon les limites de votre plan. Le quota vit sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | Compatible OpenAI : `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Vos données | seuls kezhanai.com et le backend de boîte mail que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Si le panneau change la forme de son captcha, les ratios de groupe ou la récompense de pointage, l'outil s'arrête à cette étape et le signale. **[Ouvrez un ticket](../../issues)** avec la commande que vous avez exécutée et la sortie exacte ; les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>