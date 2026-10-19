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

**Crea cuentas de Kezhan AI (客栈 AI) en masa con claves API autogeneradas — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-5-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>


---

## ✨ Por qué existe esto

Kezhan AI otorga a cada cuenta nueva una **concesión diaria por check-in** (≈592-637 de cuota por día) y esta herramienta lo convierte en un `keys.txt` donde **cada línea sobrevivió a una llamada de chat en vivo**. La unidad que escala es *una cuenta por clave*, el captcha de registro es un montaje de 12 fichas resuelto con un solucionador de diferencia de píxeles, y el riel de correo rota automáticamente para que un buzón muerto nunca detenga la ejecución.

## 🎁 Nivel gratuito — cuánto obtienes

**Cada cuenta gana una concesión diaria por check-in** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — el grupo KEY es lo que hace que los modelos baratos sean casi gratuitos de usar.

| Qué | Valor |
| --- | --- |
| Tarjeta requerida | **No** |
| Captcha | Montaje de tinta de 12 fichas — **resuelto dentro de la herramienta** |
| Verificación de correo | requerida — el riel rota broker → temp.tf → emailnator |
| Concesión diaria | check-in, `quota_awarded ≈ 592-637` / día |
| La unidad que escala | **una cuenta = una clave** → `--count N` significa "N cuentas" |

Una cuenta nueva con `quota=0` recibe **403 `用户额度不足`** en modelos de pago — la herramienta siempre hace check-in antes de pedir una clave.

> 💡 El nivel gratuito lo define Kezhan AI y puede cambiar. Consulta los números en vivo en [kezhanai.com](https://kezhanai.com) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 5

Solo se listan los ids que respondieron un **200** en vivo:

| Model ID | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` es el modelo de pago más barato (grupo `gpt-pro`, ratio de grupo **0.0265**) y también sirve como puerta predeterminada. **No hay ningún id `deepseek-*`** en este panel (37 ids: gpt-5.x/6.x + familia claude). Ids que se sabe que rechazan: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (403 cuota antes del check-in), ids con `model_ratio=0` (400 `价格尚未由管理员配置`).

## 🧪 Cómo usar la API

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Inicio rápido

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

`--screen` actualiza primero la lista de salidas (volcados de candidatos → en vivo, `email_verification` visible); cada clave se escribe **solo** después de un 200 de chat en vivo.

### 🖱️ El lanzador

El lanzador pide la lista de proxies, la cantidad y el modelo, los recuerda en `launcher.config.json` y ejecuta el CLI con las banderas correctas.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| captcha `POST /api/registration/captcha` → `verify` | **200** (solucionador de tinta, 9/12 saltos al primer intento) |
| registro `POST /api/user/register?turnstile=` | **200** |
| login `POST /api/user/login` | **200** — payload de New-API **v2** (`access_token` JWT + uid) |
| auth | `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` en cada llamada |
| check-in `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| clave | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → clave completa |
| puerta de chat — ejecutada para **cada** clave antes de escribirla | **200** con contenido real |

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| captcha | `POST /api/registration/captcha` | montaje de 768×176, 12 fichas — resuelto localmente |
| verify | `POST /api/verification` + `X-Registration-Captcha: <token>` | el código llega al buzón |
| signup | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| login | `POST /api/user/login` | `access_token` + uid |
| grant | `POST /api/user/checkin` | check-in diario |
| key | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | revelar |
| check | `POST /v1/chat/completions` | se requiere 200 en vivo antes de `keys.txt` |

## ⚙️ Opciones del CLI

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Bandera | Predeterminado | Significado |
| --- | --- | --- |
| `--count` | 5 | rondas (= cuentas) a intentar |
| `--conc` | 10 | rondas en paralelo (limitado a 12) |
| `--model` | selección del plan | un id explícito pone la puerta primero |
| `--screen` | — | actualiza `proxies.txt` desde volcados de candidatos (primer paso requerido) |
| `--verify-only` | — | vuelve a pasar cada clave de `keys.txt` por la puerta de chat-200 |
| `--budget` | 2400 s | parada dura — los workers dejan de tomar rondas |
| `--mail-order` | `broker,temptf,emailnator` | cadena de rieles de buzón |

## 🛰️ Detrás de un proxy

Cada solicitud sale a través de una salida de tu grupo. **Una regla de transporte crítica:** la llamada `verify` del captcha debe venir de la **misma salida que obtuvo el desafío** (misma salida 5/5 aprobadas, salidas cruzadas 0/5) — la herramienta fija la cuenta a una salida y usa un buzón nuevo por salto. `--screen` actualizó 739 candidatos en ≈3 min para hacer crecer el grupo de 62 → 132 salidas en la flota del operador.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave con chat-200 por línea — ignorada por git |
| `keys-unfunded.txt` | claves que nunca pasaron la puerta — reintentar más tarde |
| `accounts.json` | evidencia bruta por ronda (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | lista de salidas — ignorada por git |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado compatible con OpenAI. Un comando convierte `keys.txt` en un nodo proveedor con combos funcionales:

```bash
node src/connect-9router.js
```

Predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 Qué da el proveedor | una cuenta por clave — captcha de tinta resuelto, concesión diaria por check-in, cada clave verificada por chat |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 5 ids de modelo en el endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta kezhanai.com y el backend de buzón que configures; las claves permanecen en tu máquina |

## 🐞 Problemas

Si el panel cambia la forma de su captcha, los ratios de grupo o la concesión por check-in, la herramienta se detiene en ese paso y lo indica. **[Abre un issue](../../issues)** con el comando que ejecutaste y la salida exacta; los PR son bienvenidos.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>