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

**Otomatik oluşturulan API anahtarlarıyla toplu Kezhan AI (客栈 AI) hesabı oluşturun — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-5%20served-412991?style=for-the-badge)](https://kezhanai.com)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-5-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>


---

## ✨ Bu neden var

Kezhan AI her yeni hesaba bir **günlük giriş hibesi** verir (günde ≈592-637 kota) ve bu araç bunu, **her satırı canlı bir sohbet çağrısından geçmiş** bir `keys.txt` dosyasına dönüştürür. Ölçeklenen birim *anahtar başına bir hesap*tır, kayıt captcha'sı piksel farkı çözücüsüyle çözülen 12 parçalı bir montajdır ve posta hattı otomatik olarak döner, böylece ölü bir posta kutusu çalışmayı asla durdurmaz.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

**Her hesap günlük bir giriş hibesi kazanır** (`POST /api/user/checkin` → 200, `quota_awarded ≈ 592-637`) — ucuz modelleri neredeyse bedava harcanabilir yapan şey KEY grubudur.

| Ne | Değer |
| --- | --- |
| Kart gerekli | **Hayır** |
| Captcha | 12 parçalı mürekkep montajı — **araç içinde çözülür** |
| Posta doğrulaması | gerekli — hat broker → temp.tf → emailnator arasında döner |
| Günlük hibe | giriş, `quota_awarded ≈ 592-637` / gün |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N` "N hesap" demektir |

`quota=0` olan yeni bir hesap, ücretli modellerde **403 `用户额度不足`** alır — araç anahtar istemeden önce her zaman giriş yapar.

> 💡 Ücretsiz katman Kezhan AI tarafından belirlenir ve değişebilir. Güncel sayıları [kezhanai.com](https://kezhanai.com) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 5'inin tamamı

Yalnızca canlı bir **200** yanıtı veren kimlikler listelenmiştir:

| Model Kimliği | ✓ |
| --- | --- |
| `gpt-6.1-sol` | ✓ |
| `gpt-6-sol` | ✓ |
| `gpt-5.6-terra` | ✓ |
| `gpt-5.6-sol` | ✓ |
| `gpt-6-astra` | ✓ |

`gpt-6.1-sol` en ucuz ücretli modeldir (grup `gpt-pro`, grup oranı **0.0265**) ve aynı zamanda varsayılan kapı olarak işlev görür. Bu panelde **`deepseek-*` kimliği yoktur** (37 kimlik: gpt-5.x/6.x + claude ailesi). Reddettiği bilinen kimlikler: `gpt-5.6-luna` (403 `model_disabled`), `claude-haiku-4-5` (girişten önce 403 kota), `model_ratio=0` kimlikleri (400 `价格尚未由管理员配置`).

## 🧪 API nasıl kullanılır

```bash
curl https://kezhanai.com/v1/chat/completions \
  -H "Authorization: Bearer <your key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"hi"}],"max_tokens":16}'
```

## 🛠 Hızlı başlangıç

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

`--screen` önce çıkış listesini yeniler (aday dökümleri → canlı, `email_verification` görünür); her anahtar **yalnızca** canlı bir sohbet 200'ünden sonra yazılır.

### 🖱️ Başlatıcı

Başlatıcı proxy listesini, sayıyı ve modeli sorar, bunları `launcher.config.json` içinde hatırlar ve CLI'yi doğru bayraklarla çalıştırır.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| captcha `POST /api/registration/captcha` → `verify` | **200** (mürekkep çözücü, ilk denemede 9/12 atlama) |
| kayıt `POST /api/user/register?turnstile=` | **200** |
| giriş `POST /api/user/login` | **200** — New-API **v2** yükü (`access_token` JWT + uid) |
| kimlik doğrulama | her çağrıda `Authorization: Bearer <access_token>` + `New-Api-User: <uid>` |
| giriş `POST /api/user/checkin` | **200** `{quota_awarded: 592…637}` |
| anahtar | `POST /api/token/ {group}` → `POST /api/token/<id>/key` → tam anahtar |
| sohbet kapısı — yazılmadan önce **her** anahtar için çalıştırılır | gerçek içerikle **200** |

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Kezhan AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://kezhanai.com/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| captcha | `POST /api/registration/captcha` | 768×176 montaj, 12 parça — yerel olarak çözülür |
| doğrulama | `POST /api/verification` + `X-Registration-Captcha: <token>` | kod posta kutusuna düşer |
| kayıt | `POST /api/user/register?turnstile= {username,password,email,verification_code}` | 200 |
| giriş | `POST /api/user/login` | `access_token` + uid |
| hibe | `POST /api/user/checkin` | günlük giriş |
| anahtar | `POST /api/token/ {group: <plan group>}` → `POST /api/token/<id>/key` | açığa çıkarma |
| kontrol | `POST /v1/chat/completions` | `keys.txt` öncesinde canlı 200 gerekli |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count N [--conc N] [--model <id>] [--screen] [--verify-only]
```

| Bayrak | Varsayılan | Anlamı |
| --- | --- | --- |
| `--count` | 5 | denenecek tur (= hesap) sayısı |
| `--conc` | 10 | paralel tur (en fazla 12) |
| `--model` | plan seçimi | açık kimlik kapıyı öne alır |
| `--screen` | — | `proxies.txt` dosyasını aday dökümlerinden yeniler (gerekli ilk adım) |
| `--verify-only` | — | `keys.txt` içindeki her anahtarı sohbet-200 kapısından yeniden geçirir |
| `--budget` | 2400 s | kesin durma — çalışanlar tur almayı bırakır |
| `--mail-order` | `broker,temptf,emailnator` | posta kutusu hattı zinciri |

## 🛰️ Proxy arkasında

Her istek havuzunuzdan bir çıkış üzerinden ayrılır. **Kritik bir taşıma kuralı:** captcha `verify` çağrısı, **meydan okumayı getiren aynı çıkıştan** gelmelidir (aynı çıkışta 5/5 geçer, çapraz çıkışta 0/5) — araç hesabı tek bir çıkışa sabitler ve her atlamada yeni bir posta kutusu kullanır. `--screen`, operatörün filosunda havuzu 62 → 132 çıkışa büyütmek için ≈3 dakikada 739 adayı yeniledi.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir sohbet-200 anahtarı — git tarafından yok sayılır |
| `keys-unfunded.txt` | kapıdan hiç geçmemiş anahtarlar — daha sonra yeniden deneyin |
| `accounts.json` | tur başına ham kanıt (`captcha.hops`, `checkin`, `quota_awarded`, `plan.gate`, `checks[]`) |
| `proxies.txt` | çıkış listesi — git tarafından yok sayılır |

## 🔌 9Router'a bağlanma

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir. Tek bir komut `keys.txt` dosyasını çalışan kombinasyonlara sahip bir sağlayıcı düğümüne dönüştürür:

```bash
node src/connect-9router.js
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "kezhanai"`, `--prefix kezhanai`, `--base-url https://kezhanai.com/v1`.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Kezhan AI** — [kezhanai.com](https://kezhanai.com) |
| 🎁 Sağlayıcının verdikleri | anahtar başına bir hesap — mürekkep captcha'sı çözülür, günlük giriş hibesi, her anahtar sohbet ile doğrulanır |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktadaki 5 model kimliği, planınızın sınırlarında. Kota **hesapta** yaşar, bu aracın anahtar başına bir hesap oluşturmasının nedeni tam olarak budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://kezhanai.com/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca kezhanai.com ve yapılandırdığınız posta kutusu arka ucuyla iletişim kurulur; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

Panel captcha biçimini, grup oranlarını veya giriş hibesini değiştirirse, araç o adımda durur ve bunu bildirir. Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 kezhanai-bulk-apikey contributors

</div>