# Dokploy kurulumu

Repo: https://github.com/sertelemre/starmora — branch `main`.
Repo kökündeki **`compose.dokploy.yaml`** dosyası Dokploy'un Docker Compose dağıtımı içindir. Go, React/Nginx ve PostgreSQL'i mevcut Dockerfile'larla build eder. Yerel geliştirme için `human-design/compose.yaml` kullanılmaya devam eder.

## Panel ayarları

1. Dokploy'da bir **Docker Compose** servisi oluştur; Git/GitHub kaynağını yukarıdaki repo ve `main` olarak seç.
2. Compose dosya yolu: `compose.dokploy.yaml`. Repo kökü build tabanıdır. **Docker Stack/Swarm deployment seçme**; bu dosya `build` kullanan Compose içindir.
3. **Isolated Deployments kapalı** olsun. Bu dosya özel `app` ağını ve yalnızca frontend için `dokploy-network` bağlantısını kendisi tanımlar. Dokploy'un ağı yeniden yazmasını gerektirmez.
4. Environment alanını aşağıdaki gibi doldur.
5. `starmora.com` A kaydını Dokploy sunucusunun IP'sine yönlendir. DNS ve sunucudaki Traefik 80/443 erişimi hazırken Deploy'a bas.

Alan adı, HTTP → HTTPS yönlendirmesi ve Let's Encrypt sertifika seçimi Compose'un Traefik etiketlerinden yönetilir. Panelin Domains sekmesinde aynı host için ikinci bir yönlendirme ekleme. Dokploy'un standart `web`, `websecure`, `letsencrypt` ve `dokploy-network` adları kullanılır. Sunucunda bunlar özelleştirilmişse ilgili etiket/ağ adlarını aynı şekilde değiştir.

## Environment

Şablon: [`deploy/dokploy.env.example`](deploy/dokploy.env.example).

```dotenv
APP_DOMAIN=starmora.com
TRAEFIK_PREFIX=starmora
POSTGRES_USER=starmora
POSTGRES_DB=starmora_hd
POSTGRES_PASSWORD=<benzersiz-guclu-parola>
TRUSTED_PROXY_CIDR=<dokploy-network-IPv4-subneti>
```

Parola için kendi makinen veya sunucunda `openssl rand -hex 32` çalıştırıp çıkan değeri Environment alanına ekleyebilirsin. Gerçek parolayı Git'e veya sohbete koyma. Şablondaki boş parola/CIDR değerleriyle deployment başlamaz.

Dokploy **sunucusunda** gerçek proxy ağını bul:

```sh
docker network inspect dokploy-network --format '{{range .IPAM.Config}}{{println .Subnet}}{{end}}'
```

Çıktıdaki IPv4 CIDR'yi `TRUSTED_PROXY_CIDR` olarak kullan. Örneğin çıktı `10.0.1.0/24` ise tam bu değeri gir; varsayılan bir subnet tahmin etme. Bu değer yalnızca o ağdan gelen `X-Forwarded-For` başlığının güvenilmesini sağlar. Desteklenen biçim tek bir IPv4 CIDR, /8–/32 aralığıdır. Dokploy ağının subneti değişirse Environment değerini güncelle ve frontend'i yeniden deploy et.

PostgreSQL parolası backend'e `PGPASSWORD` ile aktarılır; bağlantı URL'sine gömülmediği için `@`, `:`, `%` ve tırnakların URI olarak kaçırılması gerekmez. Dokploy/.env biçimine girerken özel karakterli değerlerin dotenv kurallarına uyduğundan emin ol; önerilen hexadecimal parola bunu kolaylaştırır.

`COOKIE_SECURE=true`, `TRUST_PROXY=true` ve `CALCULATION_PROVIDER=local` Compose içinde sabittir. Harita hesaplaması dış API anahtarı istemez. Bu dağıtımda backend yalnızca özel ağdadır; dış API sağlayıcısına egress açılmaz.

## Ağ ve veri

- Dış trafik: Dokploy Traefik → frontend `80` → Go API → PostgreSQL.
- Compose hosta hiçbir uygulama/veritabanı portu publish etmez. Traefik yalnızca frontend'e bağlanır; backend ve db için `traefik.enable=false`.
- `app` ağı proje kapsamındadır ve `internal: true` kullanır. Backend'in özel DNS alias'ı `<TRAEFIK_PREFIX>-api` ile diğer uygulamaların genel `backend` alias'larından ayrılır.
- Nginx backend DNS'ini yeniden çözer; backend konteyner IP'si değiştiğinde eski IP'yi süresiz kullanmaz.
- PostgreSQL verisi proje kapsamındaki `postgres_data` named volume'unda tutulur. Normal rebuild/redeploy volume'u silmez. Bu kalıcılık otomatik yedekleme anlamına gelmez; Dokploy volume/database yedeğini ayrıca ayarla.
- Yeni bir Dokploy Compose servisi/proje adı yeni bir volume oluşturabilir. Mevcut kurulumu yeniden deploy et. `down --volumes` kalıcı veriyi siler.
- Kullanıcı/parola/veritabanı başlangıç değişkenleri yalnızca boş PostgreSQL volume'unda ilk kurulumu yapar. Var olan kurulumun parolasını Environment alanını değiştirerek tek başına döndürme; veritabanı rolünün parolasıyla birlikte güncelle.
- db, backend ve frontend sağlık kontrolleri içerir; frontend başlarken backend, backend başlarken db sağlıklı olmalıdır. Docker'ın `unless-stopped` politikası çıkan işlemi yeniden başlatır; tek başına `unhealthy` durumunu otomatik yeniden başlatma garantisi vermez.
- Backend root olmayan kullanıcıyla, salt okunur root filesystem ve ayrı geçici `/tmp` alanıyla çalışır. Loglar servis başına 3 × 10 MB ile döndürülür.

## Dağıtım kontrolü

Dokploy deployment log'unda üç servisin sağlıklı olduğunu kontrol et. Ardından:

```sh
curl -I http://starmora.com/
curl -I https://starmora.com/tr/
curl https://starmora.com/api/health
```

HTTP ilk istek HTTPS'ye yönlenmeli; sonuncu `{"status":"ok"}` dönmelidir. Tarayıcıda kayıt olmadan bir test haritası oluştur, dili değiştir ve yorumunu aç. HTTPS oturum çerezi `__Host-starmora_session` adıyla Secure/HttpOnly/SameSite=Lax olmalıdır. `www.starmora.com` için ayrıca DNS ve tek bir www → ana alan adı yönlendirmesi hazırlanması gerekir; bu dosya ana alan adını route eder.

7 Ekim 2026 yerel Docker/Traefik doğrulamasında üç servis sağlıklı başladı. Özel karakterli DB parolası, TLS doğrulanan HTTPS bağlantısı, HTTPS yönlendirmeleri, Secure oturum çerezi, misafir haritası, TR/EN yorumlar ve dışa aktarma geçti. Ayrı oturumun haritaya erişememesi, farklı Origin'den yazma isteğinin reddedilmesi ve gerçek istemci IP'sinin Nginx üzerinden aktarılması kontrol edildi. 44 public sayfa, private sayfaların noindex/no-store başlıkları, statik dosyalar ve gerçek 404 yanıtları HTTP kontrolünden geçti. Backend yeniden oluşturulduğunda kayıtlı harita korundu; yanlış proxy CIDR'si ve Nginx yapılandırmasına metin enjeksiyonu reddedildi.

Backend'in IP adresi ayrıca değiştirilerek Nginx'in Docker DNS'ini yeniden çözmesi ve HTTPS API bağlantısını tekrar kurması doğrulandı.

Bu dosya Dokploy sunucusuna otomatik deployment yapmaz. Yerel TLS testi geçici bir test sertifikasıyla yapıldı; gerçek sunucudaki DNS/Let's Encrypt sonucu ancak orada deployment ile doğrulanabilir.

Resmi referanslar: [Dokploy Compose domains](https://docs.dokploy.com/docs/core/docker-compose/domains), [Dokploy Compose utilities](https://docs.dokploy.com/docs/core/docker-compose/utilities), [Nginx real IP](https://nginx.org/en/docs/http/ngx_http_realip_module.html).
