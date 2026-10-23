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

**Массовое создание аккаунтов Kezhan AI (客栈 AI) с автоматически сгенерированными API-ключами — инференс, совместимый с OpenAI, + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-5-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

Kezhan AI выдаёт каждому новому аккаунту **ежедневный бонус за чек-ин** (≈592-637 квоты в день), а этот инструмент превращает его в `keys.txt`, где **каждая строка прошла живую проверку через чат-запрос**. Единица масштабирования — *один аккаунт на ключ*, капча при регистрации — это монтаж из 12 плиток, решаемый солвером на основе разницы пикселей, а почтовая цепочка ротируется автоматически, так что мёртвый ящик никогда не останавливает процесс.

## 🎁 Бесплатный тариф — сколько вы получаете

**Каждый аккаунт получает ежедневный бонус за чек-ин** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — именно группа KEY делает дешёвые модели почти бесплатными для использования.

| Что | Значение |
| --- | --- |
| Требуется карта | **Нет** |
| Капча | Монтаж из 12 чернильных плиток — **решается внутри инструмента** |
| Подтверждение почты | требуется — цепочка ротируется: broker → temp.tf → emailnator |
| Ежедневный бонус | чек-ин, `quota_awarded ≈ 592-637` / день |
| Единица масштабирования | **один аккаунт = один ключ** → `--count N` означает «N аккаунтов» |

Свежий аккаунт с `quota=0` получает **403 `用户额度不足`** на платных моделях — инструмент всегда выполняет чек-ин, прежде чем запросить ключ.

> 💡 Бесплатный тариф устанавливается Kezhan AI и может измениться. Проверяйте актуальные цифры на [kezhanai.com](https://kezhanai.com) — и пусть собственный шлюз инструмента решает:

```bash
node src/cli.js --verify-only     # каждый ключ в keys.txt перепроверяется реальным чат-запросом
```

## 🤖 Модели — все 5

Перечислены только те id, которые ответили живым **200**:

| ID модели | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` — самая дешёвая платная модель (группа `gpt-pro`, коэффициент группы **0.0265**) и одновременно шлюз по умолчанию. На этой панели **нет id `deepseek-*`** (37 id: gpt-5.x/6.x + семейство claude). Известные отказывающие id: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (403 квота до чек-ина), id с `model_ratio=0` (400 `价格尚未由管理员配置`).

## 🧪 Как использовать API

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Быстрый старт

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

`--screen` сначала обновляет список выходов (дампы кандидатов → живые, `email_verification` виден); каждый ключ записывается **только** после живого чат-ответа 200.

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси, количество и модель, запоминает их в `launcher.config.json` и запускает CLI с нужными флагами.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| капча `POST /api/registration/captcha` → `verify` | **200** (солвер чернил, с первой попытки 9/12 переходов) |
| регистрация `POST /api/user/register?turnstile=` | **200** |
| вход `POST /api/user/login` | **200** — payload New-API **v2** (`access_token` JWT + uid) |
| авторизация | `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` при каждом вызове |
| чек-ин `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| ключ | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → полный ключ |
| шлюз чата — выполняется для **каждого** ключа перед записью | **200** с реальным содержимым |

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` до того, как был записан в `keys.txt`
> (мёртвые ключи никогда не попадают в поставку). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Перезапускайте шаг проверки в любое время;
> сбои сообщаются, но никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| капча | `POST /api/registration/captcha` | монтаж 768×176, 12 плиток — решается локально |
| проверка | `POST /api/verification` + `X-Registration-Captcha: <token>` | код приходит на почту |
| регистрация | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| вход | `POST /api/user/login` | `access_token` + uid |
| бонус | `POST /api/user/checkin` | ежедневный чек-ин |
| ключ | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | раскрытие |
| проверка | `POST /v1/chat/completions` | требуется живой 200 до записи в `keys.txt` |

## ⚙️ Опции CLI

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Флаг | По умолчанию | Значение |
| --- | --- | --- |
| `--count` | 5 | количество раундов (= аккаунтов) для попытки |
| `--conc` | 10 | параллельные раунды (ограничено 12) |
| `--model` | выбор плана | явный id ставит шлюз первым |
| `--screen` | — | обновить `proxies.txt` из дампов кандидатов (обязательный первый шаг) |
| `--verify-only` | — | перепроверить каждый ключ в `keys.txt` через шлюз chat-200 |
| `--budget` | 2400 с | жёсткая остановка — воркеры перестают брать раунды |
| `--mail-order` | `broker,temptf,emailnator` | цепочка почтовых сервисов |

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабе (лимиты на IP, баны).** Инструмент работает и без прокси.

- **С пулом:** запишите один выход на строку в `proxies.txt` (`http://…` или `socks5://…`, либо укажите `KEZHANAI_PROXIES` на ваш список) — и каждый запрос идёт через выход из этого списка; один аккаунт удерживает один выход на протяжении всей своей жизни.
- **Без пула:** CLI выводит `running WITHOUT a proxy (direct)` и подключается напрямую — капча, письмо с подтверждением, чек-ин, генерация ключа и шлюз чата работают одинаково.
- `--screen` обновляет `proxies.txt` из дампов кандидатов; это не обязательный первый шаг ни в одном из режимов.

**Одно критическое правило транспорта:** вызов `verify` капчи должен исходить от **того же выхода, который получил задание** (один выход — все проходят, разные выходы — 0/5) — инструмент привязывает аккаунт к одному выходу и использует свежий почтовый ящик на каждом переходе. `--screen` обновил 739 кандидатов за ≈3 мин, увеличив пул с 62 → 132 выходов на парке оператора.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один ключ с chat-200 на строку — игнорируется git |
| `keys-unfunded.txt` | ключи, не прошедшие шлюз — повторить позже |
| `accounts.json` | сырые данные по каждому раунду (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | список выходов — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI. Одна команда превращает `keys.txt` в узел-провайдер с рабочими комбинациями:

```bash
node src/connect-9router.js
```

По умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI. Одна команда превращает `keys.txt` в узел-провайдер с рабочими комбинациями:

```bash
node src/connect-omniroute.js
```

По умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 Что даёт провайдер | один аккаунт на ключ — чернильная капча решена, ежедневный бонус за чек-ин, каждый ключ проверен через чат |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к своему аккаунту: 5 id моделей на указанной ниже конечной точке, в пределах лимитов вашего плана. Квота хранится на **аккаунте**, именно поэтому этот инструмент создаёт один аккаунт на ключ |
| 🌐 Формат API | Совместим с OpenAI: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Ваши данные | связь только с kezhanai.com и настроенным вами почтовым бэкендом; ключи остаются на вашей машине |

## 🐞 Проблемы

Если панель изменит форму капчи, коэффициенты групп или бонус за чек-ин, инструмент остановится на этом шаге и сообщит об этом. **[Откройте issue](../../issues)** с командой, которую вы запустили, и точным выводом; PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>