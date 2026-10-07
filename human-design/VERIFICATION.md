# Doğrulama kaydı · 7 Ekim 2026

Bu kayıt yerel geliştirme ve izole test ortamındaki kontrolleri açıklar. Sertifikasyon, bütün doğum tarihlerinin eşdeğerliği veya bilinmeyen güvenlik açıklarının yokluğu anlamına gelmez.

## Astronomik hesaplama

Astronomy Engine 2.1.19 ile Swiss Ephemeris 2.10.3.2'nin Moshier yöntemi bağımsız karşılaştırıldı. 100 doğum anı ve her birinin bağımsız hesaplanan 88° tasarım anında 13'er aktivasyon, toplam 2.600 konum karşılaştırıldı. Vektörler `backend/internal/astronomy/testdata/swiss-moshier.json` içinde; Swiss çalışma zamanı bağımlılığı değildir.

| Ölçüm | Gözlenen en büyük fark |
| --- | ---: |
| Doğum anı boylamı | 0.00855612° |
| Tasarım anı boylamı | 0.00966643° |
| 88° tasarım anı | 43.3597 saniye |

Konum testlerinin toleransı 0.04°, tasarım anının toleransı 120 saniyedir. Gerçek/osculating düğüm yöntemleri ve efemeris farkları özellikle çizgi/kapı sınırında önemlidir; uygulama 0.04° yakınlıkta kullanıcıya hassasiyet notu gösterir. Doğum saati yanlışlığı veya tarihsel kaydın belirsizliği bu testlerle giderilemez.

Bodygraph'ın yayımladığı 2019-05-05 10:10 Europe/London örneğinde tip, otorite, 2/4 profil, bölünmüş tanım, beş merkez ve dört kanal eşleşti. Yayımlanmış 13 kişilik ve 11 tasarım aktivasyonu karşılaştırıldı. Örnekte tasarım Uranüs'ü kişilik değerinden kopyalanmış 27.2 olarak bulunuyor; bağımsız Swiss kontrolü 28.984° ile 3.3 sonucunu destekliyor. Test bu bilinen örnek hatasını açıkça belgeliyor; kaynakta olmayan tasarım Jüpiter/Satürn yerleşimleri için eşleşme iddia edilmiyor. Canlı ücretli Bodygraph hesabıyla kontrol yapılmadı.

Ek testler kapı/çizgi sınırları, 36 kanal, merkez bağlantıları, motor–boğaz ulaşılabilirliği, otorite sıralaması ve tanım bileşenlerini kontrol eder. Tarihsel IANA testleri DST boşluk/çift saatlerini, kesirli kaymaları, 23 saatlik tarih çizgisi değişimini ve Samoa'nın atlanan gününü kapsar. Belirsiz saat sessizce seçilmez.

## Hesap ve veri erişimi

PostgreSQL entegrasyon testleri her testte ayrı schema kullanır ve sonunda kaldırır. Şunlar doğrulanır:

- Misafir ve hesaplar arasında liste, okuma, yorum, indirme ve silme erişiminin ayrılması.
- Gerçek yerel hesaplamanın JSONB'ye kaydedilmesi; kayıtta/girişte misafir haritalarının taşınması.
- Oturum döndürme, çıkış sonrası erişimin kesilmesi, hatalı parola, bcrypt hash ve HTTPS `__Host-` cookie özellikleri.
- Eşzamanlı aynı misafir oturumunu sahiplenme girişiminde yalnızca bir işlemin tamamlanması.
- Parametreli SQL, bilinmeyen JSON alanlarının/trailing nesnelerin reddi, aynı-origin mutation kontrolü.
- 101 kayıtta stabil sayfalama ve silinen cursor kaydına rağmen devam; süresi dolmuş misafir verisinin temizlenip hesap haritalarının korunması.
- Hesaplama sağlayıcısı kapalı/hatalıysa sahte harita kaydedilmemesi.

Go `-race` testleri ve `go vet` kullanılır. IP limitleri tek instance belleğindedir; dağıtık kötüye kullanım koruması veya bağımsız penetrasyon testi yapılmış değildir.

## Yorum motoru

Sözlük kapsamı: 64 kapı, 36 kanal, dokuz merkez, altı profil çizgisi, beş tip etiketi ve sekiz otorite etiketi. Testler 12 geçerli profili, gerçek haritanın tüm gezegen/çizgi dayanaklarını, yalnızca etkin kapı ve kanalların seçilmesini, açık/tanımsız ayrımını, duygusal önceliği, ters yazılmış kanal çiftlerini ve bilinmeyen/eski verinin temkinli ele alınmasını doğrular.

Tekrarlanan üretimin aynı JSON'u verdiği ve kayıtlı sonucu değiştirmediği kontrol edilir. Mevcut haritaya yorum erişimi, hesap aktarımı sonrası erişim, çıkış/silme sonrası erişimin kesilmesi ve export'a yorumun eklenmesi PostgreSQL ile test edilir. Yorumlar özgün Türkçe öz gözlem metinleridir; kişilik doğruluğu için bilimsel değerlendirme yapılmadı.

## Arayüz ve işletim

React/TypeScript üretim derlemesi geçti. In-app browser'da gerçek doğum girişi, şehir seçimi, harita oluşturma, kayıtlı harita açma, merkez seçme, aktivasyonlar, detaylı yorum başlıklarının açılması ve JSON dosyasının indirilmesi doğrulandı. Dar ekranda 390 px düzen taşması yok; kapalı mobil menü odak alanından çıkarılır. Orijinal logo ve yerel font kullanılır.

İzole Docker Compose projesinde Go/CGO, Nginx ve PostgreSQL birlikte derlenip çalıştırıldı. Yerel hesaplama, kaydetme, kayıt/giriş, misafir aktarımı, erişim ayrımı, JSON attachment ve güvenlik başlıkları kontrol edildi. TLS terminasyonu veya halka açık üretim yayını bu doğrulamaya dahil değildir.

Son yorum sürümüyle Docker kontrolü de geçti: örnek haritada dokuz merkez açıklaması, dört kanal ve 22 kapı; duygusal öncelik; başka oturumdan yorum erişiminin reddi; kayıt sonrasında misafir yorumunun korunması ve aynı yorumun JSON export içinde bulunması doğrulandı. Son Go race testleri ve `go vet` geçti; React üretim derlemesi geçti.

## Bağımlılık taraması

`npm audit` üretim ve geliştirme bağımlılıklarında sıfır bulgu verdi. `govulncheck` kullanılan semboller ve import edilen paketler için sıfır bulgu verdi. `golang.org/x/crypto` modülündeki bakım dışı `openpgp` paketi modül düzeyinde uyarı içerir; uygulama bunu import etmez veya binary'ye bağlamaz. Önceki pgx/x/text bulguları sürüm güncellemeleriyle giderildi. Taramalar tarandıkları andaki bilinen veritabanıyla sınırlıdır.

Tekrar çalıştırma komutları ve henüz uygulanmayan üretim özellikleri [README](README.md) içinde verilmiştir.


## Çift dil ve tanıtım sayfaları

TR/EN yorum sözlükleri aynı harita üzerinde seçilir; lokalizasyon astronomik veriyi değiştirmez. Dil pazarlığı, API hata mesajları, dışa aktarma ve yorum sürümleri integration testlerinde doğrulandı. 44 statik public sayfa ve iki özel çalışma alanı üretim paketinde kontrol edildi. Güncel UAT/SEO kapsamı ve canlı yayın gereklilikleri [SEO-UAT.md](SEO-UAT.md) içinde kayıtlıdır.
