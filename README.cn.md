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

**批量创建 Kezhan AI（客栈 AI）账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-5-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么有这个项目

Kezhan AI 会给每个新账户发放**每日签到额度**（每天约 592-637 额度），而本工具会将其转化为一个 `keys.txt`，其中**每一行都通过了一次真实的聊天调用**。可扩展的单位是*每个密钥对应一个账户*，注册验证码是一个 12 格的拼图，通过像素差异求解器破解，邮件通道会自动轮换，因此即使某个邮箱失效也不会中断运行。

## 🎁 免费额度 — 你能获得多少

**每个账户都能获得每日签到额度**（`POST /api/user/checkin` → 200，`quota_awarded ≈ 592-637`）——KEY 分组正是让廉价模型几乎免费使用的原因。

| 项目 | 值 |
| --- | --- |
| 是否需要银行卡 | **否** |
| 验证码 | 12 格水墨拼图 — **工具内自动破解** |
| 邮箱验证 | 必需 — 通道轮换 broker → temp.tf → emailnator |
| 每日额度 | 签到，`quota_awarded ≈ 592-637` / 天 |
| 可扩展的单位 | **一个账户 = 一个密钥** → `--count N` 即「N 个账户」 |

新账户 `quota=0` 在付费模型上会收到 **403 `用户额度不足`** —— 因此工具在申请密钥前总会先签到。

> 💡 免费额度由 Kezhan AI 设定，可能会变化。请查看 [kezhanai.com](https://kezhanai.com) 上的实时数据 —— 并让工具自身的关卡来判定：

```bash
node src/cli.js --verify-only     # keys.txt 中的每个密钥都会用真实聊天调用重新测试
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

`gpt-6.1-sol` 是最便宜的付费模型（分组 `gpt-pro`，分组倍率 **0.0265**），并同时作为默认关卡。此面板上**没有 `deepseek-*` id**（共 37 个 id：gpt-5.x/6.x + claude 系列）。已知会拒绝的 id：`gpt-5.6-luna`（403 `model_disabled`）、`claude-haiku-4-5`（签到前 403 额度不足）、`model_ratio=0` 的 id（400 `价格尚未由管理员配置`）。

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
printf 'http://127.0.0.1:8080\n' > proxies.txt   # optional — without it the tool runs direct

# 2) go
node src/launcher.js        # interactive
# or directly:
node src/cli.js --count 50
```

`--screen` 会先刷新出口列表（候选转储 → 可用，`email_verification` 可见）；每个密钥**只有**在实时聊天返回 200 后才会被写入。

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

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了一次实时 `chat-200`
> （绝不发送失效密钥）。路由组合在模型层面遵循同样的规则：只有当模型返回 `chat-200`
> 且能调用工具时，条目才会被添加 —— 不支持工具的模型、失效的密钥或失效的提供方会被丢弃
> 而非添加。可随时重新运行验证步骤；失败会被报告，绝不隐藏。

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
| `--model` | 套餐选择 | 显式指定 id 会将该关卡置于首位 |
| `--screen` | — | 从候选转储刷新 `proxies.txt`（必需的第一步） |
| `--verify-only` | — | 通过 chat-200 关卡重新运行 `keys.txt` 中的每个密钥 |
| `--budget` | 2400 s | 硬性停止 — 工作线程停止接收轮次 |
| `--mail-order` | `broker,temptf,emailnator` | 邮箱通道链 |

## 🛰️ 使用代理

**可选 — 大规模使用时推荐（每 IP 限制、封禁）。** 工具在没有代理的情况下也能运行。

- **有代理池时：** 每行写入一个出口到 `proxies.txt`（`http://…` 或 `socks5://…`，或将 `KEZHANAI_PROXIES` 指向你的列表），每个请求都会经过该列表中的一个出口 —— 一个账户在其整个生命周期内固定使用一个出口。
- **无代理池时：** CLI 会打印 `running WITHOUT a proxy (direct)` 并直接连接 —— 验证码、验证邮件、签到、密钥生成和聊天关卡都以相同方式运行。
- `--screen` 会从候选转储刷新 `proxies.txt`；在任一模式下它都不是必需的第一步。

**一条关键的传输规则：** 验证码 `verify` 调用必须来自**获取挑战的同一个出口**（同出口全部通过，跨出口 0/5）—— 工具将账户固定到一个出口，并在每一跳使用新邮箱。`--screen` 在约 3 分钟内刷新了 739 个候选，将运营者机群上的代理池从 62 个出口扩展到 132 个。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个 chat-200 密钥 — 已被 git 忽略 |
| `keys-unfunded.txt` | 从未通过关卡的密钥 — 稍后重试 |
| `accounts.json` | 每轮的原始证据（`captcha.hops`、`checkin`、`quota_awarded`、`plan.gate`、`checks[]`） |
| `proxies.txt` | 出口列表 — 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器。一条命令即可将 `keys.txt` 转换为带有可用组合的提供方节点：

```bash
node src/connect-9router.js
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "kezhanai"`、`--prefix kezhanai`、`--base-url https://kezhanai.com/v1`。

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器。一条命令即可将 `keys.txt` 转换为带有可用组合的提供方节点：

```bash
node src/connect-omniroute.js
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "kezhanai"`、`--prefix kezhanai`、`--base-url https://kezhanai.com/v1`。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供方 | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 提供方给予什么 | 每个密钥对应一个账户 — 水墨验证码已破解、每日签到额度、每个密钥都经过聊天验证 |
| 🔑 一个密钥能给你什么 | 一个作用域为其自身账户的 API 密钥：下方端点上的 5 个模型 id，受你套餐的限制。额度存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://kezhanai.com/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 kezhanai.com 和你配置的邮箱后端；密钥保留在你的机器上 |

## 🐞 问题反馈

如果面板更改了验证码形态、分组倍率或签到额度，工具会在该步骤停止并说明原因。请**[提交 issue](../../issues)**，附上你运行的命令和确切的输出；欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>