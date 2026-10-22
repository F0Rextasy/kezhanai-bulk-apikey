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

**Crie contas em massa no Kezhan AI (客栈 AI) com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Plano gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-5-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

O Kezhan AI concede a cada nova conta um **bônus diário de check-in** (≈592-637 de cota por dia) e esta ferramenta transforma isso em um `keys.txt` onde **cada linha sobreviveu a uma chamada de chat real**. A unidade que escala é *uma conta por chave*, o captcha de cadastro é uma montagem de 12 peças resolvida com um solucionador por diferença de pixels, e o trilho de e-mail rotaciona automaticamente para que uma caixa de entrada morta nunca interrompa a execução.

## 🎁 Plano gratuito — quanto você recebe

**Cada conta ganha um bônus diário de check-in** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — o grupo KEY é o que torna os modelos baratos quase gratuitos de usar.

| O quê | Valor |
| --- | --- |
| Cartão exigido | **Não** |
| Captcha | Montagem de tinta de 12 peças — **resolvido pela própria ferramenta** |
| Verificação de e-mail | obrigatória — o trilho rotaciona broker → temp.tf → emailnator |
| Bônus diário | check-in, `quota_awarded ≈ 592-637` / dia |
| A unidade que escala | **uma conta = uma chave** → `--count N` significa "N contas" |

Uma conta nova com `quota=0` recebe **403 `用户额度不足`** em modelos pagos — a ferramenta sempre faz check-in antes de pedir uma chave.

> 💡 O plano gratuito é definido pelo Kezhan AI e pode mudar. Confira os números ao vivo em [kezhanai.com](https://kezhanai.com) — e deixe o próprio portão da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 5

Apenas os ids que responderam um **200** ao vivo estão listados:

| ID do modelo | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` é o modelo pago mais barato (grupo `gpt-pro`, proporção de grupo **0.0265**) e também serve como portão padrão. **Não há id `deepseek-*`** neste painel (37 ids: gpt-5.x/6.x + família claude). Ids que recusam conhecidos: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (403 cota antes do check-in), ids com `model_ratio=0` (400 `价格尚未由管理员配置`).

## 🧪 Como usar a API

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Início rápido

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

`--screen` atualiza a lista de saídas primeiro (despejos de candidatos → ao vivo, `email_verification` visível); cada chave é gravada **somente** após um 200 de chat ao vivo.

### 🖱️ O launcher

O launcher pergunta a lista de proxies, a quantidade e o modelo, memoriza tudo em `launcher.config.json` e executa a CLI com as flags corretas.

## ✅ Verificado e funcionando — cada chave é testada

> **Portões de qualidade.** Cada chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e conseguir chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Funciona com **9Router e OmniRoute**.

| Verificação | Resultado |
| --- | --- |
| captcha `POST /api/registration/captcha` → `verify` | **200** (solucionador de tinta, 9/12 saltos na primeira tentativa) |
| registro `POST /api/user/register?turnstile=` | **200** |
| login `POST /api/user/login` | **200** — payload New-API **v2** (`access_token` JWT + uid) |
| auth | `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` em cada chamada |
| check-in `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| chave | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → chave completa |
| portão de chat — executado para **cada** chave antes de ser gravada | **200** com conteúdo real |

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| captcha | `POST /api/registration/captcha` | montagem 768×176, 12 peças — resolvida localmente |
| verificação | `POST /api/verification` + `X-Registration-Captcha: <token>` | o código chega na caixa de entrada |
| cadastro | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| login | `POST /api/user/login` | `access_token` + uid |
| bônus | `POST /api/user/checkin` | check-in diário |
| chave | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | revelar |
| verificação | `POST /v1/chat/completions` | 200 ao vivo obrigatório antes de `keys.txt` |

## ⚙️ Opções da CLI

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Flag | Padrão | Significado |
| --- | --- | --- |
| `--count` | 5 | rodadas (= contas) a tentar |
| `--conc` | 10 | rodadas paralelas (limitado a 12) |
| `--model` | escolha do plano | id explícito coloca o portão primeiro |
| `--screen` | — | atualiza `proxies.txt` a partir dos despejos de candidatos (opcional — a criação funciona sem isso) |
| `--verify-only` | — | reexecuta cada chave em `keys.txt` pelo portão de chat-200 |
| `--budget` | 2400 s | parada rígida — os workers param de aceitar rodadas |
| `--mail-order` | `broker,temptf,emailnator` | cadeia do trilho de caixas de entrada |

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala (limites por IP, banimentos).** A ferramenta também funciona sem proxy.

- **Com um pool:** escreva uma saída por linha em `proxies.txt` (`http://…` ou `socks5://…`, ou aponte `KEZHANAI_PROXIES` para sua lista) e cada requisição passa por uma saída dessa lista — uma conta mantém uma saída por toda a sua vida.
- **Sem um pool:** a CLI imprime `running WITHOUT a proxy (direct)` e conecta diretamente — captcha, e-mail de verificação, check-in, criação de chave e o portão de chat funcionam da mesma forma.
- `--screen` atualiza `proxies.txt` a partir dos despejos de candidatos; não é um primeiro passo obrigatório em nenhum dos modos.

**Uma regra crítica de transporte:** a chamada de `verify` do captcha deve vir da **mesma saída que buscou o desafio** (mesma saída 5/5 aprovadas, saídas cruzadas 0/5) — a ferramenta fixa a conta em uma saída e usa uma caixa de entrada nova a cada salto. `--screen` atualizou 739 candidatos em ≈3 min para aumentar o pool de 62 → 132 saídas na frota do operador.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave com chat-200 por linha — ignorado pelo git |
| `keys-unfunded.txt` | chaves que nunca passaram pelo portão — tente novamente depois |
| `accounts.json` | evidência bruta por rodada (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | lista de saídas — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI. Um comando transforma `keys.txt` em um nó de provedor com combinações funcionais:

```bash
node src/connect-9router.js
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI. Um comando transforma `keys.txt` em um nó de provedor com combinações funcionais:

```bash
node src/connect-omniroute.js
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 O que uma chave oferece

| | |
| --- | --- |
| 🏢 Provedor | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 O que o provedor oferece | uma conta por chave — captcha de tinta resolvido, bônus diário de check-in, cada chave verificada por chat |
| 🔑 O que uma chave oferece | uma chave de API limitada à sua própria conta: os 5 ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, e é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Seus dados | apenas kezhanai.com e o backend de caixa de entrada que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Se o painel mudar o formato do captcha, as proporções de grupo ou o bônus de check-in, a ferramenta para nessa etapa e avisa. **[Abra uma issue](../../issues)** com o comando que você executou e a saída exata; PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>