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

**Kezhan AI（客栈 AI）のアカウントを自動生成された API キーとともに一括作成 — OpenAI 互換の推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-5-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

Kezhan AI は新規アカウントごとに**デイリーチェックイン特典**（1日あたり約 592〜637 クォータ）を付与し、このツールはそれを `keys.txt` に変換します。そこでは**すべての行が実際のチャット呼び出しを通過しています**。スケールする単位は*1アカウントにつき1キー*であり、登録時のキャプチャは12タイルのモンタージュでピクセル差分ソルバーによって解かれ、メールレールは自動的にローテーションするため、死んだメールボックスが実行を止めることはありません。

## 🎁 無料枠 — どれだけ得られるか

**すべてのアカウントがデイリーチェックイン特典を獲得します**（`POST /api/user/checkin` → 200、`quota_awarded ≈ 592-637`）— KEY グループこそが、安価なモデルをほぼ無料で使えるようにするものです。

| 項目 | 値 |
| --- | --- |
| カード登録 | **不要** |
| キャプチャ | 12タイルのインクモンタージュ — **ツール内で解決** |
| メール認証 | 必須 — レールは broker → temp.tf → emailnator とローテーション |
| デイリー特典 | チェックイン、`quota_awarded ≈ 592-637` / 日 |
| スケールする単位 | **1アカウント = 1キー** → `--count N` は「N アカウント」 |

`quota=0` の新規アカウントは有料モデルで **403 `用户额度不足`** を受け取ります — ツールはキーを要求する前に必ずチェックインします。

> 💡 無料枠は Kezhan AI が設定するもので、変更される可能性があります。最新の数値は [kezhanai.com](https://kezhanai.com) で確認してください — そしてツール自身のゲートに判断を委ねてください:

```bash
node src/cli.js --verify-only     # keys.txt のすべてのキーが実際のチャット呼び出しで再テストされます
```

## 🤖 モデル — 全5つ

実際の **200** を返した ID のみを掲載しています:

| モデル ID | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` は最も安価な有料モデル（グループ `gpt-pro`、グループ比率 **0.0265**）であり、デフォルトのゲートも兼ねています。このパネルには **`deepseek-*` の ID はありません**（37 個の ID: gpt-5.x/6.x + claude ファミリー）。拒否が確認されている ID: `gpt-5.6-luna`（403 `model_disabled`）、`claude-haiku-4-5`（チェックイン前は 403 クォータ）、`model_ratio=0` の ID（400 `价格尚未由管理员配置`）。

## 🧪 API の使い方

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 クイックスタート

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

`--screen` は最初に出口リストを更新します（候補ダンプ → ライブ、`email_verification` が表示可能）。すべてのキーは**実際のチャット 200 の後にのみ**書き込まれます。

### 🖱️ ランチャー

ランチャーはプロキシリスト、カウント、モデルを尋ね、それらを `launcher.config.json` に記憶し、適切なフラグで CLI を実行します。

## ✅ 検証済みで動作 — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| キャプチャ `POST /api/registration/captcha` → `verify` | **200**（インクソルバー、初回で 9/12 ホップ） |
| 登録 `POST /api/user/register?turnstile=` | **200** |
| ログイン `POST /api/user/login` | **200** — New-API **v2** ペイロード（`access_token` JWT + uid） |
| 認証 | すべての呼び出しで `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` |
| チェックイン `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| キー | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → 完全なキー |
| チャットゲート — 書き込まれる前に**すべての**キーに対して実行 | 実際のコンテンツを含む **200** |

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前に実際の `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダは追加されずに除外されます。検証ステップはいつでも再実行できます;
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| キャプチャ | `POST /api/registration/captcha` | 768×176 モンタージュ、12 タイル — ローカルで解決 |
| 検証 | `POST /api/verification` + `X-Registration-Captcha: <token>` | コードがメールボックスに届く |
| 登録 | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| ログイン | `POST /api/user/login` | `access_token` + uid |
| 特典 | `POST /api/user/checkin` | デイリーチェックイン |
| キー | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | 表示 |
| チェック | `POST /v1/chat/completions` | `keys.txt` の前に実際の 200 が必須 |

## ⚙️ CLI オプション

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| フラグ | デフォルト | 意味 |
| --- | --- | --- |
| `--count` | 5 | 試行するラウンド数（= アカウント数） |
| `--conc` | 10 | 並列ラウンド数（最大 12） |
| `--model` | プラン選択 | 明示的な ID はゲートを最初に置く |
| `--screen` | — | 候補ダンプから `proxies.txt` を更新（必須の最初のステップ） |
| `--verify-only` | — | `keys.txt` のすべてのキーを chat-200 ゲートで再実行 |
| `--budget` | 2400 s | ハードストップ — ワーカーはラウンドの受付を停止 |
| `--mail-order` | `broker,temptf,emailnator` | メールボックスレールチェーン |

## 🛰️ プロキシの背後で

**オプション — 大規模運用では推奨（IP ごとの制限、BAN）。** ツールはプロキシなしでも動作します。

- **プールあり:** 1 行につき 1 つの出口を `proxies.txt` に書き込み（`http://…` または `socks5://…`、あるいは `KEZHANAI_PROXIES` をリストに向ける）、すべてのリクエストはそのリストの出口を経由します — 1 つのアカウントはそのライフサイクル全体を通じて 1 つの出口を保持します。
- **プールなし:** CLI は `running WITHOUT a proxy (direct)` と表示して直接接続します — キャプチャ、認証メール、チェックイン、キー生成、チャットゲートはすべて同じように動作します。
- `--screen` は候補ダンプから `proxies.txt` を更新します; どちらのモードでも必須の最初のステップではありません。

**1 つの重要なトランスポートルール:** キャプチャの `verify` 呼び出しは、**チャレンジを取得したのと同じ出口**から来なければなりません（同一出口はすべて成功、出口をまたぐと 0/5）— ツールはアカウントを 1 つの出口に固定し、ホップごとに新しいメールボックスを使用します。`--screen` は運用者のフリートで 739 の候補を約 3 分で更新し、プールを 62 → 132 出口に拡大しました。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1 行につき 1 つの chat-200 キー — git 無視 |
| `keys-unfunded.txt` | ゲートを通過しなかったキー — 後で再試行 |
| `accounts.json` | ラウンドごとの生の証拠（`captcha.hops`、`checkin`、`quota_awarded`、`plan.gate`、`checks[]`） |
| `proxies.txt` | 出口リスト — git 無視 |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです。1 つのコマンドで `keys.txt` を動作するコンボを持つプロバイダーノードに変換します:

```bash
node src/connect-9router.js
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "kezhanai"`、`--prefix kezhanai`、`--base-url https://kezhanai.com/v1`。

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです。1 つのコマンドで `keys.txt` を動作するコンボを持つプロバイダーノードに変換します:

```bash
node src/connect-omniroute.js
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "kezhanai"`、`--prefix kezhanai`、`--base-url https://kezhanai.com/v1`。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 プロバイダーが提供するもの | 1 キーにつき 1 アカウント — インクキャプチャ解決済み、デイリーチェックイン特典、すべてのキーがチャット検証済み |
| 🔑 1 つのキーで得られるもの | 自身のアカウントにスコープされた 1 つの API キー: 下記エンドポイントの 5 つのモデル ID を、プランの制限内で利用可能。クォータは**アカウント**に紐づくため、このツールが 1 キーにつき 1 アカウントを作成するのです |
| 🌐 API の形式 | OpenAI 互換: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのは kezhanai.com と設定した受信トレイバックエンドのみ; キーはあなたのマシンに留まります |

## 🐞 問題報告

パネルがキャプチャの形状、グループ比率、またはチェックイン特典を変更した場合、ツールはそのステップで停止し、その旨を報告します。実行したコマンドと正確な出力を添えて **[issue を作成してください](../../issues)**; PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>