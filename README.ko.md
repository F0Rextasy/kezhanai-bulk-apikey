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

**Kezhan AI(客栈 AI) 계정을 자동 생성된 API 키와 함께 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-5-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 왜 만들었나

Kezhan AI는 모든 신규 계정에 **일일 출석 보너스**(하루 약 592-637 할당량)를 지급하며, 이 도구는 그것을 **모든 줄이 실제 채팅 호출을 통과한** `keys.txt`로 바꿔줍니다. 확장 단위는 *계정당 키 하나*이고, 가입 캡차는 픽셀 차이 솔버로 푸는 12타일 몽타주이며, 메일 레일이 자동으로 순환하므로 죽은 메일박스가 실행을 멈추지 않습니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

**모든 계정은 일일 출석 보너스를 받습니다** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — KEY 그룹이 저렴한 모델을 거의 무료로 쓸 수 있게 해주는 요소입니다.

| 항목 | 값 |
| --- | --- |
| 카드 필요 | **아니오** |
| 캡차 | 12타일 잉크 몽타주 — **도구 내에서 해결** |
| 메일 인증 | 필요 — 레일이 broker → temp.tf → emailnator 순환 |
| 일일 보너스 | 출석, `quota_awarded ≈ 592-637` / 일 |
| 확장 단위 | **계정 하나 = 키 하나** → `--count N`은 "N개 계정" |

`quota=0`인 새 계정은 유료 모델에서 **403 `用户额度不足`** 을 받습니다 — 도구는 키를 요청하기 전에 항상 출석 체크를 합니다.

> 💡 무료 티어는 Kezhan AI가 정하며 변경될 수 있습니다. 실시간 수치는 [kezhanai.com](https://kezhanai.com)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하게 하세요:

```bash
node src/cli.js --verify-only     # keys.txt의 모든 키가 실제 채팅 호출로 재검증됩니다
```

## 🤖 모델 — 5개 전부

실제 **200** 응답을 반환한 id만 나열합니다:

| 모델 ID | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol`은 가장 저렴한 유료 모델(그룹 `gpt-pro`, 그룹 비율 **0.0265**)이며 기본 게이트 역할도 합니다. 이 패널에는 **`deepseek-*` id가 없습니다**(37개 id: gpt-5.x/6.x + claude 계열). 거부하는 것으로 알려진 id: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (출석 전 403 할당량), `model_ratio=0` id (400 `价格尚未由管理员配置`).

## 🧪 API 사용하기

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 빠른 시작

```bash
# clone or fork this repository, then:
cd kezhanai-bulk-apikey

# 1) your proxy list, one per line (http://… or socks5://…) — optional, see below
printf 'http://127.0.0.1:8080\n' > proxies.txt   # optional — without it the tool runs direct

# 2) go
node src/launcher.js        # interactive
# or directly:
node src/cli.js --count 50
```

`--screen`은 먼저 출구 목록을 새로 고칩니다(후보 덤프 → 라이브, `email_verification` 표시됨). 모든 키는 실제 채팅 200 이후에**만** 기록됩니다.

### 🖱️ 런처

런처는 프록시 목록, 개수, 모델을 물어보고 `launcher.config.json`에 기억한 뒤 올바른 플래그로 CLI를 실행합니다.

## ✅ 검증됨 — 모든 키가 테스트됨

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실제 `chat-200`을 통과했습니다
> (죽은 키는 절대 포함되지 않습니다). 라우터 조합도 모델 수준에서 같은 규칙을 따릅니다: 모델이
> `chat-200`을 반환하고 도구를 호출할 수 있는 경우에**만** 항목이 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키, 죽은 제공자는 추가되지 않고 제거됩니다. **9Router와 OmniRoute**에서 작동합니다.

| 검사 | 결과 |
| --- | --- |
| 캡차 `POST /api/registration/captcha` → `verify` | **200** (잉크 솔버, 첫 시도 9/12 홉) |
| 가입 `POST /api/user/register?turnstile=` | **200** |
| 로그인 `POST /api/user/login` | **200** — New-API **v2** 페이로드 (`access_token` JWT + uid) |
| 인증 | 모든 호출에 `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` |
| 출석 `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| 키 | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → 전체 키 |
| 채팅 게이트 — 기록되기 전 **모든** 키에 대해 실행 | 실제 콘텐츠와 함께 **200** |

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 캡차 | `POST /api/registration/captcha` | 768×176 몽타주, 12타일 — 로컬에서 해결 |
| 인증 | `POST /api/verification` + `X-Registration-Captcha: <token>` | 코드가 메일박스에 도착 |
| 가입 | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| 로그인 | `POST /api/user/login` | `access_token` + uid |
| 보너스 | `POST /api/user/checkin` | 일일 출석 |
| 키 | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | 공개 |
| 검사 | `POST /v1/chat/completions` | `keys.txt` 이전에 실제 200 필요 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| 플래그 | 기본값 | 의미 |
| --- | --- | --- |
| `--count` | 5 | 시도할 라운드 (= 계정) |
| `--conc` | 10 | 병렬 라운드 (최대 12) |
| `--model` | 플랜 선택 | 명시적 id는 게이트를 먼저 배치 |
| `--screen` | — | 후보 덤프에서 `proxies.txt` 새로 고침 (선택 — 없어도 민트 실행됨) |
| `--verify-only` | — | `keys.txt`의 모든 키를 chat-200 게이트로 재실행 |
| `--budget` | 2400 s | 강제 중지 — 워커가 라운드 수락 중단 |
| `--mail-order` | `broker,temptf,emailnator` | 메일박스 레일 체인 |

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장 (IP별 제한, 차단).** 프록시 없이도 작동합니다.

- **풀이 있는 경우:** `proxies.txt`에 한 줄에 하나의 출구를 기록하거나(`http://…` 또는 `socks5://…`, 또는 `KEZHANAI_PROXIES`를 목록으로 지정) 모든 요청이 그 목록의 출구를 통해 나갑니다 — 하나의 계정은 전체 수명 동안 하나의 출구를 유지합니다.
- **풀이 없는 경우:** CLI가 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다 — 캡차, 인증 메일, 출석, 키 민트, 채팅 게이트 모두 동일하게 실행됩니다.
- `--screen`은 후보 덤프에서 `proxies.txt`를 새로 고칩니다; 어느 모드에서도 필수 첫 단계가 아닙니다.

**중요한 전송 규칙 하나:** 캡차 `verify` 호출은 **챌린지를 가져온 것과 동일한 출구**에서 와야 합니다 (동일 출구 5/5 통과, 교차 출구 0/5) — 도구는 계정을 하나의 출구에 고정하고 홉마다 새 메일박스를 사용합니다. `--screen`은 운영자의 플릿에서 풀을 62 → 132 출구로 늘리기 위해 약 3분 만에 739개 후보를 새로 고쳤습니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 chat-200 키 — git 무시됨 |
| `keys-unfunded.txt` | 게이트를 통과하지 못한 키 — 나중에 재시도 |
| `accounts.json` | 라운드별 원시 증거 (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | 출구 목록 — git 무시됨 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다. 명령 하나로 `keys.txt`를 작동하는 조합이 있는 제공자 노드로 바꿉니다:

```bash
node src/connect-9router.js
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다. 명령 하나로 `keys.txt`를 작동하는 조합이 있는 제공자 노드로 바꿉니다:

```bash
node src/connect-omniroute.js
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 제공자가 주는 것 | 계정당 키 하나 — 잉크 캡차 해결, 일일 출석 보너스, 모든 키 채팅 검증됨 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 API 키 하나: 아래 엔드포인트의 5개 모델 id, 플랜 한도 내에서. 할당량은 **계정**에 있으므로, 이 도구가 키당 계정 하나를 만드는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 데이터 | kezhanai.com과 설정한 메일박스 백엔드만 접촉됩니다; 키는 사용자 컴퓨터에 남습니다 |

## 🐞 이슈

패널이 캡차 형태, 그룹 비율 또는 출석 보너스를 변경하면 도구는 해당 단계에서 멈추고 알려줍니다. 실행한 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**; PR을 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>