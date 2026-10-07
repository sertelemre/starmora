const p = (tr, en) => ({ tr, en });
const s = (tr, en, ...paragraphs) => ({ heading: p(tr, en), paragraphs });
const typeDetails = [
  [
    "generator",
    "Generator",
    p(
      "Tanımlı sakral merkez, motor–boğaz bağlantısı olmadan.",
      "A defined Sacral without a motor-to-Throat connection.",
    ),
    p(
      "Bir ekip senden yeni bir göreve katılmanı istediğinde önce görevi somutlaştır: hangi iş, ne kadar zaman ve hangi sorumluluk? Yalnızca “fırsatı kaçırmamalıyım” düşüncesi ile gerçek katılma isteğini ayır. Duygusal otoriten varsa ilk karşılığın ardından zaman içindeki netliği de incele.",
      "When a team asks you to take on a task, make the option concrete: what work, how much time and which responsibilities? Separate a fear of missing out from an actual wish to participate. If you have Emotional authority, also explore clarity over time after the initial response.",
    ),
  ],
  [
    "manifesting-generator",
    "Manifesting Generator",
    p(
      "Tanımlı sakral merkez ve bir motor merkezinden boğaza tam kanallar üzerinden bağlantı.",
      "A defined Sacral and a motor-to-Throat connection through complete channels.",
    ),
    p(
      "Bir projede ilk deneme, yaklaşımını değiştirmek istediğini gösterebilir. Değişiklikten etkilenecek kişilerle yeni kapsamı konuş ve önemli aşamaları atlayıp atlamadığını kontrol et. Birkaç ilgi alanın olması bu tipe ait olduğunu kanıtlamaz; tip davranışından değil, haritanın bağlantılarından hesaplanır.",
      "A first attempt at a project may show that you want to adjust the approach. Discuss the new scope with people affected and check whether essential steps have been skipped. Having several interests does not prove this type; it is calculated from chart connections rather than behavior.",
    ),
  ],
  [
    "projector",
    "Projector",
    p(
      "En az bir tanımlı merkez; tanımsız sakral ve motor–boğaz bağlantısının bulunmaması.",
      "At least one defined center, an undefined Sacral and no motor-to-Throat connection.",
    ),
    p(
      "Bir süreçte iyileştirme gördüğünde önce geri bildirim istenip istenmediğini sor. Bir davette senden beklenen katkının, yetkinin ve iş yükünün açık olması önemli olabilir. Daveti beklemek temasını gündelik ihtiyaçlarını dile getirmeme veya her konuşmada izin arama kuralına dönüştürme.",
      "When you see a process improvement, first ask whether feedback is wanted. An invitation can benefit from clarity about your contribution, authority and workload. Do not turn the theme of waiting for invitations into a rule against expressing everyday needs or speaking without permission.",
    ),
  ],
  [
    "manifestor",
    "Manifestor",
    p(
      "Tanımsız sakral merkez ve bir motor merkezinden boğaza bağlantı.",
      "An undefined Sacral and a motor-to-Throat connection.",
    ),
    p(
      "Bir işin yöntemini değiştirmeyi düşünüyorsan kimlerin planının etkileneceğini belirle. Kapsamı ve zamanı önceden paylaşmak bu sistemde haber verme temasına bir örnektir. Bu, karşı tarafın sınırlarını veya ortak kararlara ilişkin yükümlülükleri geçersiz kılmaz.",
      "If you plan to change how work is done, identify whose plans are affected. Sharing scope and timing in advance is an example of the informing theme in this system. It does not override another person’s boundaries or responsibilities around shared decisions.",
    ),
  ],
  [
    "reflector",
    "Reflector",
    p(
      "Tam bir kanalla tanımlanan hiçbir merkez bulunmaması. Etkin kapılar yine bulunabilir.",
      "No centers defined by a complete channel. Active gates can still be present.",
    ),
    p(
      "Acil olmayan büyük bir seçenek için farklı günlerde ve ortamlarda kısa notlar tutabilirsin. Ay döngüsü teması yaklaşık 28–29 güne yayılan gözlemi anlatır; her küçük iş için bekleme kuralı değildir. Haritanda tanımlı merkez bulunmaması, kimliğinin olmadığı veya başkalarının seni tamamlaması gerektiği anlamına gelmez.",
      "For a major non-urgent option, keep short notes across different days and environments. The lunar-cycle theme describes observation over roughly 28–29 days, not waiting for every small task. Having no defined centers does not mean you lack an identity or need other people to complete you.",
    ),
  ],
];
export const extraPages = typeDetails.map(([id, name, basis, example]) => ({
  id,
  path: p(`/tr/human-design/${id}/`, `/en/human-design/${id}/`),
  title: p(
    `${name} Nedir? Strateji ve Yorum | Starmora`,
    `${name} Human Design: Strategy and Reading | Starmora`,
  ),
  heading: p(`${name} tipini anlamak.`, `Understanding the ${name} type.`),
  description: p(
    `${name} nasıl hesaplanır? Human Design stratejisini, otoriteyle ilişkisini ve günlük hayattan bir gözlem örneğini incele.`,
    `How is the ${name} type calculated? Explore its Human Design strategy, relationship to authority and a practical everyday reflection.`,
  ),
  special: "type",
  typeName: name,
  related: ["types", "authority", "reading"],
  sections: [
    s(
      "Haritadaki teknik ayrım",
      "The mechanical distinction",
      basis,
      p(
        "Bu sınıflandırma doğum bilgisiyle hesaplanır. İlgi alanı, meslek, başarı veya dışa dönüklük bir tipin kanıtı değildir. Kendi tipini öğrenmek için doğum saati ve tarihsel saat dilimiyle haritanı oluştur.",
        "This classification is calculated from birth details. Interests, career, achievement and sociability do not establish a type. Create your chart using your birth time and historical time zone to find your own type.",
      ),
    ),
    s("Günlük hayatta bir gözlem", "An everyday observation", example),
    s(
      "Tip, otorite ve profil birlikte",
      "Type, authority and profile together",
      p(
        "Tip açıklamasını otorite ve profilinle birlikte oku. Özellikle tanımlı solar pleksus duygusal otoriteye öncelik verir. Bir tip etiketi, kararlarının sorumluluğunu üstlenmez; gerçek koşulları ve deneyimini değerlendirmeye devam et.",
        "Read the type alongside authority and profile. In particular, a defined Solar Plexus gives Emotional authority priority. A type label does not take responsibility for decisions; continue considering real circumstances and your own experience.",
      ),
    ),
  ],
}));
export const faq = [
  p("Harita oluşturmak ücretsiz mi?", "Is creating a chart free?"),
  p(
    "Evet. Harita oluşturma ve detaylı yorum için hesap açman gerekmez. Hesap, misafir haritalarını hesabına taşımana ve farklı oturumlarda erişmene yardımcı olur.",
    "Yes. You do not need an account to create a chart and detailed reading. An account lets you transfer guest charts to your account and access them in other sessions.",
  ),
  p(
    "Doğum saatimi bilmiyorsam ne olur?",
    "What if I do not know my birth time?",
  ),
  p(
    "Kesin saat olmadan kesin bir sonuç sunamayız. Önce doğum kaydını araştır. Tahmini saatle deneme yaparsan farklı saatlerde çıkan sonuçları kesin haritan olarak kabul etme.",
    "An exact result cannot be established without an exact time. Check your birth records first. If you explore an estimated time, do not treat results across possible times as your confirmed chart.",
  ),
  p("Şehrim listede yoksa ne yapmalıyım?", "What if my city is not listed?"),
  p(
    "“Şehrim listede yok · elle gir” seçeneğiyle yer adını ve doğru IANA saat dilimini gir. Bugünkü UTC farkı tarihsel yaz saati kurallarının yerini tutmaz.",
    "Use “My city is not listed · enter manually” and provide the place name and correct IANA zone. Today’s UTC offset does not replace historical daylight-saving rules.",
  ),
  p(
    "Dili değiştirirsem haritam değişir mi?",
    "Does switching language change my chart?",
  ),
  p(
    "Hayır. İngilizce ve Türkçe aynı astronomik sonuç üzerinden yorum üretir. Açık form ve sonuç, sayfa içindeki dil düğmesiyle değiştirdiğinde korunur.",
    "No. English and Turkish readings use the same astronomical result. The open form and result are preserved when you use the language control on the page.",
  ),
  p(
    "Neden iki sitede farklı sonuç görüyorum?",
    "Why do two sites show different results?",
  ),
  p(
    "Aynı UTC anı, tasarım anı yöntemi ve Ay düğümü yöntemini karşılaştır. Saat dilimi hataları ve çizgi sınırına yakın yerleşimler sonucu değiştirebilir. Starmora yöntem ve hassasiyet notlarını görünür tutar.",
    "Compare the UTC instant, Design-time method and lunar-node method. Time-zone differences and placements close to line boundaries can affect the result. Starmora makes its method and precision notes visible.",
  ),
  p("Haritam herkese açık mı?", "Is my chart public?"),
  p(
    "Harita uç noktaları sahiplik kontrolü yapar. Kişisel haritalar ve doğum bilgileri sitemap veya arama motoru sayfalarına eklenmez. İndirdiğin dosyayı kendin paylaşabilirsin; bu dosya doğum bilgilerini içerir.",
    "Chart endpoints check ownership. Personal charts and birth details are not added to the sitemap or search pages. You can choose to share your downloaded file; it includes birth details.",
  ),
  p(
    "Human Design bilimsel olarak kanıtlandı mı?",
    "Is Human Design scientifically validated?",
  ),
  p(
    "Human Design spiritüel bir kendini keşfetme çerçevesidir; bilimsel kişilik testi değildir. Astronomik hesabı doğrulamak, sembolik kişilik yorumlarını bilimsel olarak doğrulamak anlamına gelmez.",
    "Human Design is a spiritual framework for self-exploration, not a scientific personality test. Verifying the astronomical calculation does not scientifically validate symbolic personality interpretations.",
  ),
];
extraPages.push(
  {
    id: "faq",
    path: p("/tr/sik-sorulan-sorular/", "/en/faq/"),
    title: p(
      "Human Design Sık Sorulan Sorular | Starmora",
      "Human Design Frequently Asked Questions | Starmora",
    ),
    heading: p("Merak ettiklerin.", "Your questions, answered."),
    description: p(
      "Ücretsiz harita, doğum saati, şehir seçimi, gizlilik ve TR/EN yorumlar hakkında sık sorulan sorular.",
      "Answers about free charts, birth time, city selection, privacy and English/Turkish readings.",
    ),
    related: ["method", "privacy", "reading"],
    sections: Array.from({ length: faq.length / 2 }, (_, i) => ({
      heading: faq[i * 2],
      paragraphs: [faq[i * 2 + 1]],
    })),
  },
  {
    id: "about",
    path: p("/tr/hakkimizda/", "/en/about/"),
    title: p(
      "Starmora Hakkında | Human Design ve Öz Gözlem",
      "About Starmora | Human Design and Reflection",
    ),
    heading: p(
      "Kendine dair sorular için bir alan.",
      "A space for questions about yourself.",
    ),
    description: p(
      "Starmora, Human Design haritanı anlaşılır, ayrıntılı ve iki dilde keşfetmene yardımcı olur. Yaklaşımımızı ve hesaplama şeffaflığını öğren.",
      "Starmora helps you explore your Human Design chart with clear, detailed bilingual readings. Learn about our approach and calculation transparency.",
    ),
    related: ["method", "basics", "contact"],
    sections: [
      s(
        "Neyi amaçlıyoruz?",
        "Our purpose",
        p(
          "Starmora, bir haritayı yalnızca sayılarla göstermek yerine o sayıların bağlantısını açıklamak için geliştirildi. Ücretsiz başlangıç, anlaşılır merkez açıklamaları ve haritadaki gerçek aktivasyonlara dayanan yorumlar bu yaklaşımın parçaları. Kendini tek bir etikete indirgemeden merakını sürdürebileceğin bir alan sunmayı amaçlıyoruz.",
          "Starmora was developed to explain connections in a chart rather than only displaying numbers. A free starting point, clear center explanations and readings grounded in actual chart activations are parts of this approach. We aim to support curiosity without reducing you to one label.",
        ),
      ),
      s(
        "Şeffaf bir yaklaşım",
        "A transparent approach",
        p(
          "Özgün Türkçe ve İngilizce yorumlar, hesaplanan öğelere göre sabit kurallarla seçilir. Hesaplama yöntemi, veri kaynağı ve doğrulamanın sınırları ayrı bir rehberde açıklanır. Resmi Human Design kuruluşuyla bağlantı veya sertifikasyon iddia etmiyoruz.",
          "Original Turkish and English texts are selected by fixed rules from calculated elements. A separate guide explains the calculation method, data source and verification limits. We do not claim affiliation with or certification from an official Human Design organization.",
        ),
      ),
    ],
  },
  {
    id: "privacy",
    kind: "legal",
    path: p("/tr/gizlilik/", "/en/privacy/"),
    title: p("Gizlilik Politikası | Starmora", "Privacy Policy | Starmora"),
    heading: p("Gizlilik politikası.", "Privacy policy."),
    description: p(
      "Starmora doğum bilgilerini, hesap verilerini ve oturum çerezlerini nasıl işler? Saklama, güvenlik ve veri talepleri hakkında bilgi.",
      "How Starmora handles birth details, account data and session cookies, including retention, security and data requests.",
    ),
    sections: [
      s(
        "İşletmeci ve iletişim",
        "Operator and contact",
        p(
          "Starmora hizmetinin işletmecisi Pangaea’dır. Gizlilik ve veri talepleri için info@starmora.com adresine yazabilirsin. Bu metin 7 Ekim 2026 tarihinde güncellendi.",
          "Starmora is operated by Pangaea. Contact info@starmora.com for privacy and data requests. This policy was updated on 7 October 2026.",
        ),
      ),
      s(
        "İşlenen veriler ve amaçları",
        "Data and purposes",
        p(
          "Harita adı, doğum tarihi, yerel doğum saati, yer adı ve saat dilimi haritanı hesaplamak, yorumlamak ve sana tekrar göstermek için işlenir. Hesap açarsan e-posta adresin ve güvenli parola özeti hesap erişimi için saklanır. Parolan açık metin olarak saklanmaz. Hesaplama sonucu, UTC anları ve harita oluşturma zamanı da tutulur.",
          "The chart name, birth date, local birth time, place name and time zone are processed to calculate, interpret and display your chart. If you register, your email and a secure password hash are stored for account access. Passwords are not stored as plain text. Calculation results, UTC instants and chart creation time are also retained.",
        ),
        p(
          "Rastgele bir oturum tanımlayıcısı, misafir haritalarına veya hesabına erişimi sağlar. Sunucuda bunun özeti saklanır. IP adresi kısa süreli bellek içi hız sınırlama için kullanılır; doğum bilgilerini içeren API istekleri erişim günlüğüne yazılmaz. Hizmet için gereken işlemler, talep ettiğin hizmetin sunulması ve güvenliğinin sağlanması amacıyla yapılır; uygulanabilir hukuki dayanak bulunduğun yere ve işlemin niteliğine bağlıdır.",
          "A random session identifier enables access to guest charts or an account; the server stores its hash. IP addresses are used for short-lived in-memory rate limiting. API requests containing birth data are not written to access logs. Necessary processing supports the service you request and its security; the applicable legal basis depends on your location and the processing involved.",
        ),
      ),
      s(
        "Saklama ve silme",
        "Retention and deletion",
        p(
          "Oturumun geçerliliği 30 gündür. Süresi dolan misafir oturumları ve bunlara bağlı hesap dışı haritalar periyodik olarak temizlenir. Hesaba taşınmış haritalar bu temizliğe dahil değildir; onları Haritalarım alanından silebilirsin. Hesap silme veya başka veri talebi için e-posta ile iletişime geç. Kayıtlı bir hesabın e-postasını doğrulaman istenebilir.",
          "Sessions remain valid for 30 days. Expired guest sessions and their unclaimed charts are periodically cleaned up. Charts transferred to an account are excluded from that cleanup; you can delete them from My charts. Contact us by email for account deletion or another data request. Verification that you control the account email may be required.",
        ),
        p(
          "Harita silme uygulama veritabanındaki kaydı kaldırır. Daha önce indirdiğin dosyalar ve dışarıda paylaştığın kopyalar otomatik olarak silinmez. Aktif sistemin yedekleme ve barındırma düzeni, canlı hizmetin saklama uygulamaları kapsamında ayrıca değerlendirilir.",
          "Deleting a chart removes its record from the application database. Files you downloaded or copies shared elsewhere are not automatically removed. Backup and hosting arrangements must also be considered as part of the live service’s retention practices.",
        ),
      ),
      s(
        "Paylaşım ve sağlayıcılar",
        "Sharing and providers",
        p(
          "Varsayılan hesaplama ve yorum motoru sunucuda çalışır; yorum için dış yapay zekâ servisine doğum verisi gönderilmez. Şehir listesi GeoNames verisinden türetilen yerel bir veri setidir. Barındırma altyapısı hizmetin çalışması için verileri işleyebilir. İsteğe bağlı BodyGraph sağlayıcısı etkinleştirilirse hesaplama için gerekli doğum verileri bu sağlayıcıya iletilir ve bu kullanım formda belirtilir.",
          "The default calculation and reading engine runs on the server; birth data is not sent to an external AI service for readings. City search uses a local dataset derived from GeoNames. Hosting infrastructure may process data to operate the service. If the optional BodyGraph provider is enabled, necessary birth details are sent to that provider and this use is disclosed in the form.",
        ),
      ),
      s(
        "Çerezler, haklar ve güvenlik",
        "Cookies, rights and security",
        p(
          "Hizmet yalnızca gerekli birinci taraf oturum çerezini kullanır. Reklam veya analitik izleme bu sürümde etkin değildir. Çerez politikasında ad, süre ve teknik özellikler açıklanır. Uygulanabilir hukuka bağlı olarak erişim, düzeltme, silme ve diğer veri haklarına ilişkin taleplerini iletebilirsin. Başkasının doğum verilerini yalnızca uygun yetkiyle gir.",
          "The service uses only a necessary first-party session cookie. Advertising and analytics tracking are not enabled in this version. The cookie policy explains its name, duration and properties. Depending on applicable law, you may request access, correction, deletion and other data rights. Enter another person’s birth data only with appropriate authorization.",
        ),
        p(
          "Erişim kontrolü, güvenli parola özeti ve oturum önlemleri uygulanır. Hiçbir sistem mutlak güvenlik garantisi veremez. Güvenlik sorunlarını info@starmora.com üzerinden bildirebilirsin.",
          "Access controls, secure password hashing and session protections are applied. No system can guarantee absolute security. Report security concerns to info@starmora.com.",
        ),
      ),
    ],
  },
  {
    id: "terms",
    kind: "legal",
    path: p("/tr/kullanim-kosullari/", "/en/terms/"),
    title: p("Kullanım Koşulları | Starmora", "Terms of Use | Starmora"),
    heading: p("Kullanım koşulları.", "Terms of use."),
    description: p(
      "Starmora harita ve yorum hizmetinin kapsamı, hesap kullanımı, içerik hakları ve sorumluluk sınırları.",
      "The scope of Starmora charts and readings, account use, content rights and service limitations.",
    ),
    sections: [
      s(
        "Hizmetin kapsamı",
        "Scope of the service",
        p(
          "Starmora, Pangaea tarafından sunulan Human Design harita ve yorum hizmetidir. İletişim adresi info@starmora.com’dur. Bu koşullar 7 Ekim 2026 tarihinde güncellendi. Harita oluşturma ve mevcut yorumlar ücretsizdir; kayıt olmadan kullanılabilir.",
          "Starmora is a Human Design chart and reading service operated by Pangaea. Contact info@starmora.com. These terms were updated on 7 October 2026. Chart creation and current readings are free and available without registration.",
        ),
      ),
      s(
        "Yorumların niteliği",
        "Nature of the readings",
        p(
          "Human Design spiritüel bir öz gözlem çerçevesidir. Metinler bilimsel kişilik değerlendirmesi, teşhis, tedavi, hukuki veya yatırım tavsiyesi değildir; olay veya sonuç garantisi vermez. Kararlarını gerçek bilgiler, koşullar ve gerektiğinde uzman görüşüyle değerlendir. Harita etiketi kimliğini, becerini veya geleceğini kesin olarak belirlemez.",
          "Human Design is a spiritual reflection framework. Texts are not scientific personality assessments, diagnoses, treatments, legal or investment advice, and do not guarantee events or outcomes. Consider decisions through factual information, circumstances and professional judgment where needed. A chart label does not definitively establish identity, abilities or the future.",
        ),
      ),
      s(
        "Bilgilerin doğruluğu ve hesap güvenliği",
        "Data accuracy and account security",
        p(
          "Girdiğin tarih, saat ve saat diliminin doğruluğundan sorumlusun. Kesin olmayan doğum bilgileri ve çizgi sınırları sonucu etkileyebilir. Başkasının verisini yalnızca uygun yetkiyle kullan. Hesabının parolasını paylaşma; yetkisiz erişim şüphesini bildir. Misafir haritalarını hesap olmadan kullanırken oturum çerezin erişim için gereklidir.",
          "You are responsible for the accuracy of dates, times and time zones you provide. Uncertain birth details and line boundaries can affect results. Use another person’s data only with appropriate authorization. Do not share your account password and report suspected unauthorized access. The session cookie is necessary for accessing guest charts without an account.",
        ),
      ),
      s(
        "Uygun kullanım ve içerik",
        "Appropriate use and content",
        p(
          "Hizmetin güvenliğini aşmaya, başkalarının verilerine erişmeye veya sistemi aşırı isteklerle engellemeye çalışma. Kendi haritanı kişisel kullanım için indirebilirsin. Starmora’nın özgün açıklamalarını toplu olarak kopyalama veya yeniden satma hakkı bu hizmetle verilmez. Üçüncü taraf açık kaynak bileşenleri kendi lisanslarına tabidir.",
          "Do not attempt to bypass service security, access other people’s data or disrupt the system with excessive requests. You may download your own chart for personal use. The service does not grant permission to copy or resell Starmora’s original explanations in bulk. Third-party open-source components remain subject to their own licenses.",
        ),
      ),
      s(
        "Erişim, değişiklikler ve zorunlu haklar",
        "Availability, changes and mandatory rights",
        p(
          "Bakım, arıza veya güvenlik gerekçesiyle erişim geçici olarak kesilebilir. Mutlak doğruluk veya kesintisiz erişim garantisi verilemez; hesaplama yönteminin sınırları yöntem sayfasında açıklanır. Koşullar değişirse güncelleme tarihi yenilenir. Bu koşullar, uygulanabilir hukukun tanıdığı ve sözleşmeyle kaldırılamayan hakları sınırlandırmaz. Silme, hesap veya koşullarla ilgili sorularını iletişim adresine gönderebilirsin.",
          "Access may be temporarily interrupted for maintenance, faults or security reasons. Absolute accuracy and uninterrupted access cannot be guaranteed; calculation limits are explained on the method page. Updates to these terms will carry a new date. These terms do not restrict rights that applicable law does not permit a contract to waive. Send deletion, account or terms questions to the contact address.",
        ),
      ),
    ],
  },
  {
    id: "cookies",
    kind: "legal",
    path: p("/tr/cerezler/", "/en/cookies/"),
    title: p("Çerez Politikası | Starmora", "Cookie Policy | Starmora"),
    heading: p("Çerez politikası.", "Cookie policy."),
    description: p(
      "Starmora’nın gerekli oturum çerezi, kullanım amacı, 30 günlük süresi ve tarayıcıdan yönetimi.",
      "Starmora’s necessary session cookie, its purpose, 30-day lifetime and how to manage it in your browser.",
    ),
    sections: [
      s(
        "Kullanılan tek çerez",
        "The cookie in use",
        p(
          "Starmora, Pangaea tarafından işletilir. Bu politika 7 Ekim 2026 tarihinde güncellendi. HTTPS hizmette çerezin adı __Host-starmora_session, yerel HTTP geliştirme ortamında starmora_session’dır. Birinci taraf oturum çerezi rastgele bir tanımlayıcı içerir; parolanı veya doğum bilgilerini içermez.",
          "Starmora is operated by Pangaea. This policy was updated on 7 October 2026. The cookie is named __Host-starmora_session on HTTPS and starmora_session in local HTTP development. This first-party session cookie contains a random identifier, not your password or birth details.",
        ),
      ),
      s(
        "Amaç, süre ve özellikler",
        "Purpose, lifetime and properties",
        p(
          "Misafir haritalarını sana bağlamak, hesabına girişini korumak ve erişim kontrolünü uygulamak için gereklidir. Süresi 30 gündür. HttpOnly ve SameSite=Lax özellikleri kullanılır; canlı HTTPS ortamında Secure etkinleştirilmelidir. Giriş ve çıkış gibi işlemler oturum kimliğini yeniler.",
          "It is necessary to associate guest charts with you, maintain account access and enforce ownership controls. Its lifetime is 30 days. HttpOnly and SameSite=Lax are used; Secure must be enabled on live HTTPS. Operations such as login and logout rotate the session identifier.",
        ),
      ),
      s(
        "İzleme ve tercihler",
        "Tracking and preferences",
        p(
          "Bu sürümde reklam, analitik veya üçüncü taraf izleme çerezi yoktur. Dil seçimi URL üzerinden yapılır; dil için çerez veya localStorage kullanılmaz. İleride gerekli olmayan izleme eklenirse ilgili bilgilendirme ve tercih mekanizması kullanım başlamadan güncellenmelidir.",
          "This version has no advertising, analytics or third-party tracking cookies. Language selection is reflected in the URL; no language cookie or localStorage is used. If non-essential tracking is added later, the relevant information and preference mechanism must be updated before it is used.",
        ),
      ),
      s(
        "Tarayıcıdan yönetim",
        "Browser controls",
        p(
          "Tarayıcının site verileri ayarlarından çerezi silebilir veya engelleyebilirsin. Engelleme, harita oluşturma ve hesap erişimi için gerekli oturumun çalışmasını önleyebilir. Çerezi silmek sunucudaki kaydı anında silmez; hesap dışı misafir verileri süresi dolunca temizlenir. Hesaba taşınmamış haritalarına erişimini kaybedebilirsin. Sorular için info@starmora.com adresine yaz.",
          "You can delete or block the cookie in your browser’s site-data settings. Blocking it may prevent the session needed for chart creation and account access from working. Deleting the cookie does not immediately delete server records; unclaimed guest data is cleaned up after expiry. You may lose access to guest charts that were not transferred to an account. Contact info@starmora.com with questions.",
        ),
      ),
    ],
  },
  {
    id: "contact",
    path: p("/tr/iletisim/", "/en/contact/"),
    title: p("İletişim ve Destek | Starmora", "Contact and Support | Starmora"),
    heading: p(
      "Birlikte daha anlaşılır kılalım.",
      "Let’s make it clearer together.",
    ),
    description: p(
      "Starmora desteğine ulaş. Hesap, gizlilik, hesaplama veya içerik sorularını info@starmora.com adresine ilet.",
      "Contact Starmora support at info@starmora.com for account, privacy, calculation or content questions.",
    ),
    related: ["faq", "privacy", "method"],
    sections: [
      s(
        "Bize yaz",
        "Write to us",
        p(
          "Destek, içerik düzeltmesi, gizlilik ve hesap talepleri için info@starmora.com adresini kullan. Hata bildirirken adımları ve gördüğün hata metnini paylaş; parolanı veya oturum çerezini gönderme. Doğum bilgilerini yalnızca inceleme için gerçekten gerekiyorsa paylaş.",
          "Use info@starmora.com for support, content corrections, privacy and account requests. When reporting a problem, describe the steps and error text; do not send your password or session cookie. Share birth details only when they are actually needed for investigation.",
        ),
      ),
      s(
        "Hesaplama farkını incelemek",
        "Investigating a calculation difference",
        p(
          "İki harita farklıysa önce tarih, saat, IANA saat dilimi ve UTC anının aynı olduğunu kontrol et. Yöntem sayfamız sınır notlarını açıklar. Harita adın veya bir yorumun sana uymaması tek başına astronomik hesabın hatalı olduğunu göstermez.",
          "If two charts differ, first check that the date, time, IANA zone and UTC instant match. Our method page explains boundary notes. A chart name or a reading that does not fit your experience does not by itself establish an astronomical calculation error.",
        ),
      ),
    ],
  },
);
extraPages.push({
  id: "definition",
  path: p("/tr/human-design/tanim/", "/en/human-design/definition/"),
  title: p(
    "Human Design Tanım: Tekli ve Bölünmüş | Starmora",
    "Human Design Definition: Single and Split | Starmora",
  ),
  heading: p("Bağlantı gruplarını anlamak.", "Understanding connected groups."),
  description: p(
    "Tekli, bölünmüş, üçlü ve dörtlü tanım nasıl hesaplanır? Tanımlı merkezlerin bağlı gruplarını ve tanımın yorum sınırlarını öğren.",
    "How are Single, Split, Triple Split and Quadruple Split definitions calculated? Explore connected groups of defined centers and the limits of interpretation.",
  ),
  related: ["channels", "centers", "reading"],
  sections: [
    s(
      "Tanımın teknik temeli",
      "The mechanical basis of definition",
      p(
        "Tanım, tam kanallarla birbirine bağlanan tanımlı merkezlerin kaç ayrı grup oluşturduğuna bakar. Tek bir grupta birleşen merkezler tekli tanım, birbirine tam kanalla bağlanmayan iki grup bölünmüş tanım oluşturur. Üç ve dört grup, üçlü ve dörtlü bölünmüş tanım etiketleriyle gösterilir. Hiçbir merkez tanımlı değilse tanım yoktur.",
        "Definition considers how many separate groups the defined centers form through complete channels. Centers connected into one group form Single definition. Two groups without a complete channel joining them form Split definition. Three and four groups are labeled Triple Split and Quadruple Split. With no defined centers, there is no definition.",
      ),
    ),
    s(
      "Bir eksiklik olarak okuma",
      "Do not read it as a deficiency",
      p(
        "Bölünmüş tanım bir şeyin eksik olduğu veya başka bir kişinin seni tamamlamak zorunda olduğu anlamına gelmez. Sistem bunu deneyimi işleme ve farklı bağlantılarla karşılaşma temaları üzerinden yorumlar. Bağlı grup sayısı zekâ, olgunluk, yalnız yaşayabilme veya ilişki kalitesi için bir ölçü değildir.",
        "Split definition does not mean something is missing or that another person must complete you. The system interprets it through themes of processing experience and encountering different connections. The number of groups does not measure intelligence, maturity, ability to live independently or relationship quality.",
      ),
    ),
    s(
      "Birlikte değerlendirilecek öğeler",
      "What to consider alongside it",
      p(
        "Tanım etiketini tip, otorite ve gerçek kanallarla birlikte incele. İki kişinin haritasını yalnızca bölünmüş veya tekli tanım üzerinden eşleştirmek ilişki analizi sayılmaz. Bir yorum temasını gündelik bir olayla karşılaştırabilir, sana uymayan gözlemleri de kaydedebilirsin.",
        "Read definition alongside type, authority and actual channels. Matching two people only by Single or Split definition does not constitute a relationship analysis. Compare a theme with an everyday event and record observations that do not fit as well.",
      ),
    ),
  ],
});
