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

**批量创建客栈 AI (Kezhan AI) 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-5-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>


---

## ✨ 为什么会有这个工具

客栈 AI 会为每个新账户发放**每日签到额度**（每天约 592-637 配额），而本工具将其转化为一个 `keys.txt`，其中**每一行都通过了一次真实的聊天调用**。可扩展的单元是*一个账户对应一个密钥*，注册验证码是一个 12 格的拼图，通过像素差异求解器破解，邮件通道会自动轮换，因此即使某个邮箱失效也不会中断运行。

## 🎁 免费额度 — 你能获得多少

**每个账户都能获得每日签到额度**（`POST /api/user/checkin` → 200，`quota_awarded ≈ 592-637`）——KEY 分组正是让廉价模型几乎可以免费使用的原因。

| 项目 | 值 |
| --- | --- |
| 需要银行卡 | **否** |
| 验证码 | 12 格水墨拼图 — **工具内自动破解** |
| 邮箱验证 | 必需 — 通道轮换 broker → temp.tf → emailnator |
| 每日额度 | 签到，`quota_awarded ≈ 592-637` / 天 |
| 可扩展的单元 | **一个账户 = 一个密钥** → `--count N` 即“N 个账户” |

一个 `quota=0` 的新账户在付费模型上会收到 **403 `用户额度不足`** —— 因此工具在申请密钥前总会先签到。

> 💡 免费额度由客栈 AI 设定，可能会变化。请前往 [kezhanai.com](https://kezhanai.com) 查看实时数据 —— 并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 5 个

仅列出实际返回 **200** 的 id：

| 模型 ID | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` 是最便宜的付费模型（分组 `gpt-pro`，分组倍率 **0.0265**），并同时作为默认关卡。此面板上**没有 `deepseek-*` id**（共 37 个 id：gpt-5.x/6.x + claude 系列）。已知会拒绝的 id：`gpt-5.6-luna`（403 `model_disabled`）、`claude-haiku-4-5`（签到前 403 配额不足）、`model_ratio=0` 的 id（400 `价格尚未由管理员配置`）。

## 🧪 如何使用 API

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 快速开始

```bash
# clone or fork this repository, then:
cd kezhanai-bulk-apikey

# 1) your proxy list, one per line (http://… or socks5://…)
printf 'http://127.0.0.1:8080\n' > proxies.txt

# 2) go
node src/launcher.js        # interactive
# or directly:
node src/cli.js --count 50
```

`--screen` 会先刷新出口列表（候选转储 → 实时，`email_verification` 可见）；每个密钥**只有**在实时聊天返回 200 后才会被写入。

### 🖱️ 启动器

启动器会询问代理列表、数量和模型，将它们记录在 `launcher.config.json` 中，并使用正确的参数运行 CLI。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查项 | 结果 |
| --- | --- |
| 验证码 `POST /api/registration/captcha` → `verify` | **200**（水墨求解器，首次尝试 9/12 跳） |
| 注册 `POST /api/user/register?turnstile=` | **200** |
| 登录 `POST /api/user/login` | **200** — New-API **v2** 载荷（`access_token` JWT + uid） |
| 认证 | 每次调用都带 `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` |
| 签到 `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| 密钥 | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → 完整密钥 |
| 聊天关卡 — 在写入**每个**密钥前运行 | **200** 且返回真实内容 |

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 备注 |
| --- | --- | --- |
| 验证码 | `POST /api/registration/captcha` | 768×176 拼图，12 格 — 本地破解 |
| 验证 | `POST /api/verification` + `X-Registration-Captcha: <token>` | 验证码发送到邮箱 |
| 注册 | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| 登录 | `POST /api/user/login` | `access_token` + uid |
| 额度 | `POST /api/user/checkin` | 每日签到 |
| 密钥 | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | 显示 |
| 检查 | `POST /v1/chat/completions` | 写入 `keys.txt` 前必须实时返回 200 |

## ⚙️ CLI 选项

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| 参数 | 默认值 | 含义 |
| --- | --- | --- |
| `--count` | 5 | 尝试的轮数（= 账户数） |
| `--conc` | 10 | 并行轮数（上限 12） |
| `--model` | 套餐选择 | 显式指定 id 会将关卡前置 |
| `--screen` | — | 从候选转储刷新 `proxies.txt`（必需的第一步） |
| `--verify-only` | — | 将 `keys.txt` 中的每个密钥重新通过聊天 200 关卡 |
| `--budget` | 2400 s | 硬性停止 — 工作线程停止接收轮次 |
| `--mail-order` | `broker,temptf,emailnator` | 邮箱通道链 |

## 🛰️ 在代理之后

每个请求都通过你池中的一个出口发出。**一条关键传输规则：** 验证码 `verify` 调用必须来自**获取挑战的同一出口**（同出口 5/5 通过，跨出口 0/5）—— 工具将账户固定到一个出口，并在每一跳使用全新的邮箱。`--screen` 在约 3 分钟内刷新了 739 个候选，将运营者机群上的出口池从 62 增长到 132。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个聊天 200 的密钥 — 已被 git 忽略 |
| `keys-unfunded.txt` | 从未通过关卡的密钥 — 稍后重试 |
| `accounts.json` | 每轮原始证据（`captcha.hops`、`checkin`、`quota_awarded`、`plan.gate`、`checks[]`） |
| `proxies.txt` | 出口列表 — 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器。一条命令即可将 `keys.txt` 转换为一个带有可用组合的提供商节点：

```bash
node src/connect-9router.js
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "kezhanai"`、`--prefix kezhanai`、`--base-url https://kezhanai.com/v1`。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **客栈 AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 提供商提供什么 | 一个账户对应一个密钥 — 水墨验证码已破解、每日签到额度、每个密钥都经过聊天验证 |
| 🔑 一个密钥能给你什么 | 一个绑定其自身账户的 API 密钥：下方端点上的 5 个模型 id，受你套餐的限制。配额存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://kezhanai.com/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 kezhanai.com 和你配置的邮箱后端；密钥保留在你的机器上 |

## 🐞 问题反馈

如果面板更改了验证码形态、分组倍率或签到额度，工具会在该步骤停止并说明原因。请**[提交 issue](../../issues)**，附上你运行的命令和确切的输出；欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>