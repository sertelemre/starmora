# Starmora Human Design

Türkçe React + TypeScript arayüz, Go API ve PostgreSQL. Ana depodaki landing sayfasından bağımsızdır. Kullanıcının sağladığı yatay Starmora logosu, özgün şekli korunarak arayüzün altın/krem paletiyle gösterilir.

## Hesaplama

Varsayılan motor **yereldir ve API anahtarı gerektirmez**. Go, MIT lisanslı Astronomy Engine 2.1.19'u CGO ile çağırır; Human Design kuralları Go'da uygulanır. Python/Node hesaplama servisi veya dış API çalışma zamanında gerekli değildir.

- Doğum tarihinin tarihsel IANA saat dilimi kurallarıyla UTC'ye çevrilmesi.
- Doğum anı ve Güneş'in tam 88° geride olduğu tasarım anı; 88 gün varsayımı kullanılmaz.
- İki katmanda 13 aktivasyon: gezegenler, Dünya ve gerçek/osculating Ay düğümleri.
- Tropical kapı çarkı: 41. kapı 302°'de başlar; kapı genişliği 5.625°, çizgi genişliği 0.9375°.
- 36 kanal, dokuz merkez, tip, otorite, profil ve bağlı bileşenlerden tanım.
- Enkarnasyon çaprazının dört kapı kombinasyonu. Adlandırılmış çapraz kataloğu ve Color/Tone/Base bu sürümde yoktur.
- Efemeris/çizgi sınırına yakın aktivasyonlar için açık hassasiyet notları; engine, node yöntemi ve hesaplanan UTC anları JSON çıktısında saklanır.

Hesaplama uygulama sunucusunda gerçekleşir. Yerel fontlar ve gömülü GeoNames şehir verisi sayesinde normal kullanımda tarayıcıdan veya backend'den doğum verileri dış servislere gönderilmez. GeoNames bağlantısı kullanıcı isteğiyle açılır.

Şehir listesi 34.154 kayıt içeren bir extract'ten türetilmiştir; küçük yerler için elle şehir ve IANA saat dilimi girişi vardır. Doğum yeri bu sistemde saat dilimini belirler; gezegen hesaplaması geocentrictir. Türkçe arama ve ülke adları desteklenir.

## Hesap ve haritalar

- Kayıt zorunlu değildir. Misafir haritaları tarayıcıya verilen özel oturumla erişilir.
- E-posta/şifre ile kayıt, giriş, çıkış; bcrypt cost 12, en az 10 karakter ve bcrypt'in 72 bayt sınırı.
- Girişte misafir haritaları hesaba atomik taşınır. Oturum kilidi eşzamanlı iki hesabın aynı misafir haritalarını sahiplenmesini önler.
- Cookie HttpOnly ve SameSite=Lax; HTTPS modunda Secure ve `__Host-` prefix. Token 256 bit rastgele; veritabanında yalnızca SHA-256 hash'i saklanır.
- Oturum 30 gün geçerlidir. Saatlik cleanup süresi dolmuş oturumları ve erişilemeyen misafir verilerini siler; hesap haritaları kalır.
- Harita oluşturma, açma, kalıcı silme ve JSON dışa aktarma. Silme doğum verisini ve hesaplama sonucunu aynı kayıtla birlikte kaldırır.
- Harita sahipliği her sorguda kontrol edilir. 100'lük sayfalarda stabil `(created_at,id)` cursor'ı ile eski haritalar yüklenir.

## Detaylı Türkçe ve İngilizce yorum

Gerçek haritada **Detaylı yorum** sekmesi açılır. Go'daki sürümlü, deterministik yorum motoru hesaplanan verilere göre özgün Türkçe veya İngilizce metin seçer; LLM, dış yorum API'si veya abonelik gerekmez.

- Tip, strateji, sekiz otorite çeşidi, profilin iki çizgisi ve bağlantı tanımı.
- Dokuz merkez: tanımlı, etkin kapısı olan tanımsız ve etkin kapısı olmayan tamamen açık ayrımı.
- Yalnızca haritada bulunan kanallar ve kapılar; 36 kanal ve 64 kapı için açıklama, günlük uygulama ve gözlem sorusu sözlüğü.
- Kapılarda kişilik/tasarım, gezegen ve çizgi dayanakları; tamamlanan ve tamamlanmayan kanal bağlantıları.
- Dört Güneş–Dünya kapısının yaşam temaları, ilişki gözlem soruları ve otoriteye uygun yedi günlük not planı.
- Duygusal otorite tanımlı sakralden önce gelir; sakral merkez yorumu bunu açıkça korur. İlişki uyumu veya doğrulanmamış çapraz adı üretilmez.

`GET /api/charts/{id}/reading` kayıtlı sonucun yorumunu üretir; eski haritalar yeniden hesaplama veya DB migration gerektirmez. Aynı sahiplik kontrolü uygulanır. JSON export, harita verisine ek olarak `reading` ve yorum sürümünü içerir. Liste endpoint'i uzun yorumları yüklemez. Metin Human Design geleneği içinde öz gözlem amaçlıdır; bilimsel kişilik testi veya kehanet olarak sunulmaz. Kavram kaynakları yorum ekranında bağlantılıdır.

## Docker ile çalıştırma

Docker Desktop açık olmalı. Bu klasörde:

```sh
cp .env.example .env
# POSTGRES_PASSWORD değerini değiştir. Yerel Compose şifresi için harf/rakam kullan.
docker compose up --build
```

Arayüz: http://127.0.0.1:5173. PostgreSQL ve Go API dışarı açılmaz; Nginx aynı origin üzerinden API'ye proxy yapar. Veriler named volume'da tutulur. Portu `.env` içindeki `WEB_PORT` ile değiştirebilirsin. Şifrede URL ayracı kullanılacaksa `DATABASE_URL` içinde URL encode edilmeli.

Nginx üretim konfigürasyonu CSP, frame engelleme, no-sniff ve referrer headers içerir. API access log kapalıdır. TLS terminate eden bir proxy ile yayımlarken `COOKIE_SECURE=true` zorunludur. Compose localhost için `false` kullanır.

## Yerel geliştirme

Go **1.26.8+**, C derleyicisi (macOS: Xcode Command Line Tools, Linux: gcc/build-essential), Node 22.12+ ve PostgreSQL 15+ gereklidir. Go eskiyse standart toolchain mekanizması gereken sürümü indirir.

Kendine ait geliştirme veritabanını oluştur. Backend:

```sh
cd backend
export DATABASE_URL='postgres://starmora:password@127.0.0.1:5432/starmora_hd?sslmode=disable'
export CALCULATION_PROVIDER=local
go run ./cmd/server
```

Frontend için ayrı shell:

```sh
cd frontend
npm ci
npm run dev
```

Vite `/api` çağrılarını `127.0.0.1:8080` adresine aktarır ve Host başlığını korur. Go `.env` dosyasını kendiliğinden yüklemez; environment kullanır. SQL başlangıç şeması binary'ye gömülüdür.

## İsteğe bağlı Bodygraph API

`CALCULATION_PROVIDER=bodygraph` ve `BODYGRAPH_API_KEY` ile [Bodygraph'ın belgelenmiş API'si](https://bodygraph.com/docs/) seçilebilir. Yerel motorla sessiz fallback yapılmaz; seçilen kaynak her haritaya yazılır. Anahtar yalnızca backend'de tutulur ve URL/error loglarına yazılmaz. API anahtarı olmadığı için bu adaptör canlı hizmetle test edilmedi; protokol/hata testleri vardır.

## Doğrulama

[VERIFICATION.md](VERIFICATION.md) sayısal doğruluk, hesap güvenliği ve işletim kontrollerinin kapsamını ve sınırlarını açıklar.

```sh
cd backend
go test ./...
TEST_DATABASE_URL='postgres://user:password@127.0.0.1:5432/test_db?sslmode=disable' go test -race -v ./...
go vet ./...
go run golang.org/x/vuln/cmd/govulncheck@latest ./...
cd ../frontend
npm run build
npm audit
```

PostgreSQL testleri rastgele izole bir schema oluşturup sonunda kaldırır. Test rolünün schema oluşturma izni olmalı; üretim veritabanı kullanma. `TEST_DATABASE_URL` yoksa DB testleri açıkça skip edilir. Swiss Ephemeris test vektörleri geliştirme aşamasında bağımsız üretildi; uygulama Swiss Ephemeris dağıtmaz veya ona ihtiyaç duymaz.

## İşletim ve kapsam sınırları

JSON mutation istekleri, aynı-origin kontrolü, 16 KiB istek sınırı, bağlantı süre sınırları ve IP bazında authentication/calculate rate limit vardır. Limitler tek API instance'ının belleğinde tutulur. `TRUST_PROXY=true` yalnızca backend erişimi güvenilir reverse proxy ile sınırlandığında kullanılmalı; proxy `X-Real-IP` değerini kendisi yazar.

Bu sürüm yerel çalışan bir üründür; halka açık üretim yayını yapılmadı. E-posta doğrulama, şifre sıfırlama, hesap silme ve çok instance için paylaşımlı rate limit henüz yoktur. Yayında ayrıca TLS, yedekleme ve uygulanacak kullanım/gizlilik metinleri gereklidir. Belirli doğum saatlerinin kayıt doğruluğu, bütün tarihlerin matematiksel eşdeğerliği veya bilinmeyen güvenlik açıklarının yokluğu garanti edilemez. Jovian/IHDS sertifikası veya bilimsel kişilik doğrulaması iddia edilmez.

## Kaynak/lisanslar

- [Astronomy Engine](https://github.com/cosinekitty/astronomy), MIT. Orijinal kaynak ve lisans `backend/internal/astronomy/` içinde korunur.
- [GeoNames](https://www.geonames.org/), CC BY 4.0. Türetilmiş veri açıklaması `backend/internal/app/GEONAMES-NOTICE.md` içinde.
- DM Sans fontu npm ile paketlenmiştir; font lisansı paket içinde bulunur.


## Ana sayfa, rehberler ve SEO

`/` → `/tr/`; İngilizce ana sayfa `/en/`. Tanıtım ana sayfası içinde gerçek hesaplama formu bulunur. Kayıtlı haritalar `/tr/harita/#charts` ve `/en/chart/#charts` üzerinden açılır. Dil değişimi formu ve açık haritayı korur; yorum endpoint’i ve JSON indirme `?lang=tr|en` destekler.

22 farklı sayfanın her biri TR/EN hazırlanır: toplam 44 statik, indekslenebilir HTML sayfası. Tipler, beş ayrı tip rehberi, otorite, profil, merkez, 64 kapı, 36 kanal, tanım, hesaplama yöntemi, SSS, hakkında, iletişim, gizlilik, koşullar ve çerezler dahildir. React yalnızca ana sayfa hesaplama alanında ve özel çalışma alanlarında yüklenir. Rehberler JavaScript olmadan okunabilir.

Canonical ve karşılıklı hreflang adresleri `https://starmora.com` alanına göre üretilir. Sitemap, robots, sosyal paylaşım görseli ve JSON-LD build sırasında hazırlanır. Kişisel çalışma alanları HTML meta ve HTTP X-Robots-Tag ile noindex; API cevapları no-store/noindex. Sitemap kişisel veri içermez. Nginx bilinmeyen URL’lere gerçek 404 döndürür.

```sh
cd frontend
npm run build
npm run check:seo
# Ayrı Docker test sunucusu çalışıyorsa:
node scripts/check-http.mjs http://127.0.0.1:5184
```

Hukuki sayfalarda işletmeci kullanıcının verdiği Pangaea adıyla, iletişim info@starmora.com ile gösterilir. Pangaea ana sayfa/footer markasında gösterilmez. İşletmecinin kayıtlı ülkesi, resmi adresi ve tam ticari unvanı teyit edilmeden hukuki metinlerin tüm yerel yükümlülükleri karşıladığı iddia edilmez. Canlı yayından önce bu bilgiler, barındırma/yedekleme düzeni, HTTPS/Secure cookie ve uygulanabilir hukuki gereklilikler tamamlanmalıdır.

Rakip incelemesi ve UAT sonuçları: [SEO-UAT.md](SEO-UAT.md).

## Dokploy dağıtımı

Repo kökündeki [`compose.dokploy.yaml`](../compose.dokploy.yaml), HTTPS/Traefik yönlendirmesi, özel servis ağı, kalıcı PostgreSQL volume'u ve sağlık kontrolleriyle hazırlanmıştır. Dokploy Compose dosya yolunu `compose.dokploy.yaml` seç. Environment ve proxy ağı kurulumunun adımları [DOKPLOY.md](DOKPLOY.md) içindedir.
