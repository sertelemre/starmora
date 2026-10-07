const p = (tr, en) => ({ tr, en });
const section = (tr, en, ...paragraphs) => ({ heading: p(tr, en), paragraphs });
export const sourceLinks = [
  {
    title: "Jovian Archive · Type and Strategy",
    url: "https://jovianarchive.com/pages/type-and-strategy-in-human-design",
  },
  {
    title: "Jovian Archive · Inner Authority",
    url: "https://jovianarchive.com/pages/what-is-inner-authority-in-human-design",
  },
  {
    title: "Jovian Archive · Profile",
    url: "https://jovianarchive.com/pages/understanding-profile-in-human-design",
  },
  {
    title: "Human.Design · Centers",
    url: "https://human.design/the-human-design-system/centers",
  },
  {
    title: "Human.Design · Channels",
    url: "https://human.design/the-human-design-system/channels",
  },
];
export const pages = [
  {
    id: "home",
    path: p("/tr/", "/en/"),
    title: p(
      "Ücretsiz Human Design Haritası ve Detaylı Yorum | Starmora",
      "Free Human Design Chart & Detailed Reading | Starmora",
    ),
    heading: p(
      "Human Design ile kendini keşfet.",
      "Discover yourself with Human Design.",
    ),
    description: p(
      "Doğum bilgilerinle ücretsiz Human Design haritanı oluştur. Tip, otorite, profil, merkez, kapı ve kanallarını Türkçe veya İngilizce detaylı yorumla keşfet.",
      "Create a free Human Design chart from your birth details. Explore your type, authority, profile, centers, gates and channels with a detailed English or Turkish reading.",
    ),
    kind: "home",
    sections: [],
  },
  {
    id: "basics",
    path: p("/tr/human-design/", "/en/human-design/"),
    title: p(
      "Human Design Nedir? Başlangıç Rehberi | Starmora",
      "What Is Human Design? A Beginner's Guide | Starmora",
    ),
    heading: p("Human Design nedir?", "What is Human Design?"),
    description: p(
      "Human Design sistemini, BodyGraph haritasını ve astrolojiyle ilişkisini öğren. Haritanın ne gösterdiğini ve yorumların sınırlarını açık bir dille keşfet.",
      "Learn about Human Design, the BodyGraph and its relationship to astrology. Understand what a chart shows and the limits of its interpretations.",
    ),
    related: ["reading", "types", "method"],
    sections: [
      section(
        "Bir harita, birkaç farklı katman",
        "One chart, several layers",
        p(
          "Human Design, doğum anındaki astronomik konumları sembolik bir haritaya yerleştiren spiritüel bir kendini keşfetme sistemidir. BodyGraph adı verilen şema dokuz merkez, 64 kapı ve 36 olası kanaldan oluşur. Sistem astrolojik konumları kullanır; ancak bir doğum haritasındaki evler veya yükselen burçla aynı sonucu üretmez.",
          "Human Design is a spiritual framework that places astronomical positions into a symbolic chart. The diagram, called a BodyGraph, contains nine centers, 64 gates and 36 possible channels. It uses astrological positions, but does not produce the same information as houses or an ascendant in a natal astrology chart.",
        ),
        p(
          "Haritanın teknik olarak tutarlı hesaplanması ile kişilik yorumlarının bilimsel olarak doğrulanması farklı konulardır. Human Design bir klinik değerlendirme veya bilimsel kişilik testi değildir. Buradaki açıklamaları kendini gözlemlemek için kullanabilir; deneyiminle örtüşmeyen bir tanımı benimsemek zorunda olmadığını hatırlayabilirsin.",
          "Consistent chart calculations and scientifically validated personality interpretations are separate questions. Human Design is not a clinical assessment or a scientific personality test. Use these explanations to observe your experience without feeling obliged to adopt a description that does not fit.",
        ),
      ),
      section(
        "Kişilik ve tasarım neyi anlatır?",
        "What do Personality and Design mean?",
        p(
          "Kişilik katmanı doğum anındaki yerleşimlerden hesaplanır. Tasarım katmanı ise Güneş'in doğum konumundan tam 88 derece geride olduğu önceki andan hesaplanır. Bu, doğumdan tam 88 gün önce demek değildir. Starmora bu anı bir Güneş yayı hesabıyla bulur; iki katmanda da 13 aktivasyonu gösterir.",
          "Personality is calculated from positions at birth. Design uses the earlier moment when the Sun was exactly 88 degrees before its birth position. This is not the same as exactly 88 days before birth. Starmora solves for that solar arc and displays 13 activations in each layer.",
        ),
      ),
      section(
        "Nereden başlamalı?",
        "Where should you start?",
        p(
          "Önce tip, strateji ve otoriteyi birlikte oku. Sonra profilini, merkezlerini ve tamamlanan kanalları incele. Tek bir kapının açıklamasını bütün kimliğinin tanımı olarak kullanmak yerine, gerçek bir olayla karşılaştır. Küçük notlar tutmak, yalnızca sana uyan cümleleri seçmekten daha yararlı bir gözlem sağlayabilir.",
          "Read type, strategy and authority together first. Then explore your profile, centers and complete channels. Compare a gate's theme with a real event rather than treating it as your entire identity. Keeping small notes, including examples that do not fit, can be more useful than selecting only statements that sound familiar.",
        ),
      ),
    ],
  },
  {
    id: "reading",
    path: p(
      "/tr/human-design/harita-nasil-okunur/",
      "/en/human-design/how-to-read-a-chart/",
    ),
    title: p(
      "Human Design Haritası Nasıl Okunur? | Starmora",
      "How to Read a Human Design Chart | Starmora",
    ),
    heading: p("Haritanı adım adım oku.", "Read your chart, step by step."),
    description: p(
      "BodyGraph renkleri, tip, otorite, profil, kapı ve kanal numaraları ne anlama gelir? İlk Human Design haritanı okumak için pratik bir sıralama.",
      "What do BodyGraph colors, type, authority, profile, gate and channel numbers mean? Follow a practical order for reading your first Human Design chart.",
    ),
    related: ["authority", "centers", "gates", "channels"],
    sections: [
      section(
        "1. Doğum bilgisini kontrol et",
        "1. Check the birth details",
        p(
          "Harita adı hesabı değiştirmez. Tarih, saat ve saat dilimi değiştirir. Şehri listeden seçtiğinde IANA saat dilimi gelir ve o tarihteki tarihsel kurallar uygulanır. Aynı yerel saat yaz saati geçişinde iki kez yaşanmışsa kesin UTC anı belirlenmeden birini rastgele seçmek doğru değildir.",
          "The chart's name does not change its calculation; the date, time and time zone do. Selecting a city supplies an IANA zone and applies the historical rules for that date. If a local time occurred twice during a clock change, one occurrence should not be selected arbitrarily without confirming the exact UTC instant.",
        ),
      ),
      section(
        "2. Tip ve otoriteyi birlikte ele al",
        "2. Consider type and authority together",
        p(
          "Tip, merkez ve bağlantı yapısının temel sınıflandırmasıdır. Strateji bir fırsata nasıl yaklaşılacağını, otorite o fırsatın nasıl değerlendirileceğini anlatan sistem içi temalardır. Örneğin duygusal otoritesi olan bir Generator için ilk sakral karşılık tek başına nihai karar önerisi değildir.",
          "Type is the basic classification of the centers and their connections. Strategy describes an approach to an opportunity; authority describes how that opportunity is considered within the system. For example, a Generator with Emotional authority is not advised to treat an initial Sacral response as a final decision on its own.",
        ),
      ),
      section(
        "3. Bağlantıyı kapıdan önce gör",
        "3. Look at connections before individual gates",
        p(
          "Tanımlı merkez en az bir tam kanalla bağlıdır. Bir kapı etkin olsa da karşı kapı etkin değilse o bağlantı tam bir kanal oluşturmaz. Bu bir eksiklik veya seni tamamlayacak bir kişiye ihtiyaç duyduğun anlamına gelmez. Merkezin tanımsız olması ile hiçbir etkin kapı içermemesi de farklıdır.",
          "A defined center is connected by at least one complete channel. An active gate without its active partner does not form that complete channel. This is not a deficiency or a need for another person to complete you. An undefined center and a center with no active gates are also different configurations.",
        ),
      ),
      section(
        "4. Bir örnek seç ve geri dön",
        "4. Choose an example and revisit it",
        p(
          "Bir iş teklifi, konuşma veya günlük rutin seç. Önce ne olduğunu yaz; sonra haritadaki temalarla karşılaştır. Yorumun sana uyduğu ve uymadığı örnekleri birlikte kaydet. Haritayı veya yorumu JSON olarak indirip hesaplama yöntemi, UTC anları ve hassasiyet notlarıyla tekrar inceleyebilirsin.",
          "Choose a work offer, conversation or everyday routine. First record what happened, then compare it with the chart's themes. Include examples that fit and examples that do not. Download the chart and reading as JSON to revisit the calculation method, UTC instants and precision notes.",
        ),
      ),
    ],
  },
  {
    id: "types",
    path: p("/tr/human-design/enerji-tipleri/", "/en/human-design/types/"),
    title: p(
      "Human Design Enerji Tipleri: Beş Etiket | Starmora",
      "Human Design Types: The Five Labels | Starmora",
    ),
    heading: p(
      "Tipin, merkezlerin ve bağlantıların bir sonucu.",
      "Your type follows the centers and their connections.",
    ),
    description: p(
      "Generator, Manifesting Generator, Projector, Manifestor ve Reflector nasıl belirlenir? Tipleri ve stratejileri karşılaştır, kendi haritanla keşfet.",
      "How are Generator, Manifesting Generator, Projector, Manifestor and Reflector determined? Compare the types and strategies and explore your own chart.",
    ),
    special: "types",
    related: [
      "generator",
      "manifesting-generator",
      "projector",
      "manifestor",
      "reflector",
    ],
    sections: [
      section(
        "Dört aile, beş yaygın etiket",
        "Four families, five common labels",
        p(
          "Kaynak öğretilerde Generator, Projector, Manifestor ve Reflector olmak üzere dört temel aile anlatılır. Manifesting Generator, Generator ailesinin bir alt tipi olduğu için uygulamalarda çoğunlukla beş ayrı tip etiketi gösterilir. Bu iki anlatım bir hesaplama çelişkisi değildir.",
          "The source teachings describe four basic families: Generator, Projector, Manifestor and Reflector. Manifesting Generator is a Generator subtype, so applications commonly display five distinct labels. These two ways of describing the types are not a calculation contradiction.",
        ),
      ),
      section(
        "Bir kişilik sıralaması değil",
        "Not a ranking of personalities",
        p(
          "Tip için davranış anketi uygulanmaz. Tanımlı sakral merkeze, motor merkezinden boğaza bağlantıya ve merkezlerin tanımlanıp tanımlanmadığına bakılır. Bir tip diğerinden üstün değildir; meslek, ilişki kalitesi veya sağlık durumunu tek başına belirlemez.",
          "Type is not determined through a behavior questionnaire. The calculation considers Sacral definition, a motor-to-Throat connection and whether any centers are defined. One type is not superior to another and does not by itself determine a career, relationship quality or health.",
        ),
      ),
    ],
  },
  {
    id: "authority",
    path: p(
      "/tr/human-design/otorite-ve-strateji/",
      "/en/human-design/authority-and-strategy/",
    ),
    title: p(
      "Human Design Otorite ve Strateji Rehberi | Starmora",
      "Human Design Authority and Strategy Guide | Starmora",
    ),
    heading: p(
      "Strateji ve otoriteyi birlikte anlamak.",
      "Understanding strategy and authority together.",
    ),
    description: p(
      "Duygusal, sakral, dalak, ego, kendini ifade etme, çevresel ve Ay döngüsü otoritelerini; stratejiyle nasıl birlikte okunacağını öğren.",
      "Explore Emotional, Sacral, Splenic, Ego, Self-projected, Environmental and Lunar approaches and how to read them alongside strategy.",
    ),
    special: "authorities",
    related: ["types", "method", "reading"],
    sections: [
      section(
        "İki kavram, iki farklı soru",
        "Two concepts, two different questions",
        p(
          "Strateji, bir fırsatla karşılaşmaya ilişkin sistem içi yaklaşımı anlatır. Otorite ise o fırsatı değerlendirirken hangi temanın öne alındığını gösterir. Bir tipin stratejisi aynı olsa da otoritesi farklı olabilir; bütün Generator'lara aynı karar önerisini vermek bu ayrımı gözden kaçırır.",
          "Strategy describes the system's approach to encountering an opportunity. Authority shows which theme takes precedence when considering it. People with the same type and strategy can have different authorities; giving every Generator the same decision guidance misses this distinction.",
        ),
      ),
      section(
        "Duygusal öncelik neden önemli?",
        "Why does Emotional authority take precedence?",
        p(
          "Solar pleksus tanımlıysa duygusal otorite öne gelir. Sakral merkez de tanımlı olabilir, ama önemli bir seçimde ilk bedensel karşılığı son yanıt olarak okumak yerine zaman içindeki netlik teması kullanılır. Starmora merkez yorumlarını da bu önceliğe göre hazırlar.",
          "When the Solar Plexus is defined, Emotional authority takes precedence. The Sacral can also be defined, but an initial physical response is not treated as the final answer to an important choice. The theme is clarity over time. Starmora's center readings also preserve that priority.",
        ),
      ),
      section(
        "Gerçek koşulları dışarıda bırakma",
        "Keep real conditions in view",
        p(
          "Bu açıklamalar spiritüel bir çerçeve içindeki öz gözlem önerileridir. Gerçek bilgi, sorumluluk, kaynak, son tarih ve uzman görüşü gerektiren bir konuda bunların yerini almaz. Bir temayı incelemek için küçük, geri alınabilir bir günlük deneyim seçmek daha uygun bir başlangıç olabilir.",
          "These are self-observation suggestions within a spiritual framework. They do not replace factual information, responsibilities, resources, deadlines or professional judgment where those are needed. A small, reversible everyday experience can be a suitable starting point for exploring a theme.",
        ),
      ),
    ],
  },
  {
    id: "profiles",
    path: p("/tr/human-design/profiller/", "/en/human-design/profiles/"),
    title: p(
      "Human Design Profilleri ve Altı Çizgi | Starmora",
      "Human Design Profiles and the Six Lines | Starmora",
    ),
    heading: p(
      "İki sayı, birlikte okunan iki tema.",
      "Two numbers, two themes read together.",
    ),
    description: p(
      "1/3, 2/4, 3/5 ve diğer Human Design profilleri nasıl hesaplanır? Kişilik ve tasarım çizgileri ile 12 profil kombinasyonunu öğren.",
      "How are profiles such as 1/3, 2/4 and 3/5 calculated? Learn about Personality and Design lines and the 12 profile combinations.",
    ),
    special: "profiles",
    related: ["reading", "gates", "method"],
    sections: [
      section(
        "Profil nasıl hesaplanır?",
        "How is a profile calculated?",
        p(
          "İlk sayı kişilik Güneşi'nin çizgisinden, ikinci sayı tasarım Güneşi'nin çizgisinden gelir. Her kapının altı çizgisi vardır. Altı sayının bütün olası eşleşmeleri kullanılmaz; geleneksel düzende 12 profil kombinasyonu bulunur. Örneğin 2/4, ikinci ve dördüncü çizgi temalarının birlikte okunmasıdır.",
          "The first number comes from the Personality Sun line and the second from the Design Sun line. Every gate has six lines. Not every possible pair is used; the traditional arrangement has 12 profile combinations. For example, 2/4 reads the themes of lines two and four together.",
        ),
      ),
      section(
        "Sayıları başarı düzeyi olarak okuma",
        "Do not read the numbers as achievement levels",
        p(
          "Birinci çizgi daha az gelişmiş, altıncı çizgi daha başarılı anlamına gelmez. Profil, sistemde rol ve deneyim temalarını açıklamak için kullanılır. İki tarafın birlikte görüldüğü gerçek bir olay seçmek, kendini tek bir kelimeye indirgemekten daha yararlı olabilir.",
          "Line one does not mean less developed and line six does not mean more successful. Profiles describe themes of roles and experience within the system. A real event in which you can explore both sides may be more useful than reducing yourself to a single label.",
        ),
      ),
      section(
        "Doğum saati hassasiyeti",
        "Birth-time precision",
        p(
          "Güneş çizgi sınırına yakınsa doğum saatindeki fark profil sonucunu etkileyebilir. Bir sitedeki profil ile başka bir sitedeki profil farklı görünüyorsa önce aynı UTC anının ve aynı tasarım yönteminin kullanıldığını kontrol et. Sonuç için bir açıklama uydurmak yerine bu teknik farkı incelemek gerekir.",
          "If the Sun is near a line boundary, a difference in birth time can affect the profile. If two sites show different profiles, first check that they use the same UTC instant and Design calculation method. Investigate the technical difference rather than inventing an explanation for the result.",
        ),
      ),
    ],
  },
  {
    id: "centers",
    path: p("/tr/human-design/merkezler/", "/en/human-design/centers/"),
    title: p(
      "Human Design Dokuz Merkez: Tanımlı ve Açık | Starmora",
      "The Nine Human Design Centers: Defined and Open | Starmora",
    ),
    heading: p(
      "Dokuz merkezini bağlantılarıyla oku.",
      "Read your nine centers through their connections.",
    ),
    description: p(
      "Human Design merkezlerinin temaları; tanımlı, tanımsız ve tamamen açık ayrımı. BodyGraph renkleri ne anlatır, ne anlatmaz?",
      "Explore the nine centers and the difference between defined, undefined and completely open. Understand what BodyGraph colors do and do not describe.",
    ),
    special: "centers",
    related: ["channels", "authority", "reading"],
    sections: [
      section(
        "Renk tek başına yeterli değil",
        "Color alone is not enough",
        p(
          "Bir merkez en az bir tam kanalın parçasıysa tanımlıdır. Tanımsız merkezde etkin kapı bulunabilir. Tamamen açık merkezde ise etkin kapı da yoktur. Uygulamalar farklı renk paletleri kullanabilir; renkten önce bu bağlantı ayrımına bakmak daha güvenilir bir okuma sağlar.",
          "A center is defined when it is part of at least one complete channel. An undefined center can contain an active gate. A completely open center has no active gates. Applications may use different palettes; examining the connections before the colors gives a more reliable reading.",
        ),
      ),
      section(
        "Tanımsız olmak eksiklik değildir",
        "Undefined does not mean deficient",
        p(
          "Sistem tanımlı merkezleri daha tutarlı temalar, tanımsız alanları ise farklı ortamlarda değişebilen deneyimler üzerinden açıklar. Bu, bir alanda üstün veya yetersiz olduğunu söylemez. Bir merkezin adı da o organa ilişkin bir sağlık sonucu çıkarmaz.",
          "The system describes defined centers through more consistent themes and undefined areas through experiences that may vary with context. It does not establish superiority or inadequacy in an area. A center's name also does not establish anything about an organ's health.",
        ),
      ),
    ],
  },
  {
    id: "gates",
    path: p("/tr/human-design/kapilar/", "/en/human-design/gates/"),
    title: p(
      "64 Human Design Kapısı: Temalar ve Çizgiler | Starmora",
      "The 64 Human Design Gates: Themes and Lines | Starmora",
    ),
    heading: p(
      "Bir kapıyı bütün kimliğin gibi okuma.",
      "A gate is not your whole identity.",
    ),
    description: p(
      "Human Design'daki 64 kapının sembolik temalarını ve altı çizgiyle ilişkisini incele. Etkin kapı ile tanımlı kanal arasındaki farkı öğren.",
      "Explore symbolic themes for all 64 Human Design gates and their relationship to six lines. Learn the difference between an active gate and a defined channel.",
    ),
    special: "gates",
    related: ["channels", "profiles", "method"],
    sections: [
      section(
        "Kapı ve çizgi nasıl bulunur?",
        "How are gates and lines found?",
        p(
          "Starmora, tropikal boylamı kapı çarkına yerleştirir. Geleneksel çarkta 41. kapı 302 derecede başlar; her kapı 5.625 derece, her çizgi 0.9375 derece genişliğindedir. Haritada görülen 3.2 gibi bir ifade üçüncü kapının ikinci çizgisi anlamına gelir.",
          "Starmora places tropical longitude into the gate wheel. In the traditional wheel, gate 41 begins at 302 degrees; each gate spans 5.625 degrees and each line spans 0.9375 degrees. A notation such as 3.2 means gate three, line two.",
        ),
      ),
      section(
        "Bir etkin kapı neyi değiştirmez?",
        "What does one active gate not establish?",
        p(
          "Tek bir etkin kapı merkezi tanımlamaz. Bunun için bir tam kanal gerekir. Karşı kapı etkin değilse bu durum bir eksiklik olarak yorumlanmaz. Aşağıdaki açıklamalar sembolik öz gözlem temalarıdır; gelecekte yaşanacak bir olayın, yeteneğin veya zorunlu davranışın kanıtı değildir.",
          "One active gate does not define a center; a complete channel is needed. An inactive partner gate is not interpreted as a deficiency. The explanations below are symbolic reflection themes, not evidence of a future event, an ability or a required behavior.",
        ),
      ),
    ],
  },
  {
    id: "channels",
    path: p("/tr/human-design/kanallar/", "/en/human-design/channels/"),
    title: p(
      "36 Human Design Kanalı ve Bağlantılar | Starmora",
      "The 36 Human Design Channels and Connections | Starmora",
    ),
    heading: p(
      "İki kapı bir bağlantıya dönüşür.",
      "Two gates form a connection.",
    ),
    description: p(
      "Human Design'daki 36 kanalın kapı çiftlerini ve sembolik temalarını incele. Tam kanal, tanımlı merkez ve tanım grupları arasındaki ilişkiyi öğren.",
      "Explore the gate pairs and symbolic themes of all 36 Human Design channels. Learn how complete channels relate to center definition and connected groups.",
    ),
    special: "channels",
    related: ["centers", "gates", "types"],
    sections: [
      section(
        "Tam kanal ne demek?",
        "What is a complete channel?",
        p(
          "Bir kanalın iki kapısı da kişilik veya tasarım katmanlarında etkinse tam bağlantı oluşur. İki kapının aynı gezegene veya aynı katmana ait olması gerekmez. Kanalın bağladığı merkezler tanımlanır. Merkezler arasındaki bağlı gruplar da tekli, bölünmüş ve diğer tanım etiketlerini belirler.",
          "A complete connection forms when both gates of a channel are active in Personality or Design. The gates need not belong to the same planet or layer. The connected centers are defined, and the connected groups determine labels such as Single or Split definition.",
        ),
      ),
      section(
        "Bir kanal, karar otoritesinin yerine geçmez",
        "A channel does not replace authority",
        p(
          "Bir kanalın konusu hızlı uygulama veya anlık farkındalık olsa bile haritadaki otorite sıralaması korunur. Solar pleksus tanımlıysa duygusal otorite önceliklidir. Ayrıca tek bir kişinin kanalları, iki kişinin ilişki uyumu analizinin yerini tutmaz.",
          "Even when a channel's theme involves immediate application or awareness, the chart's authority hierarchy still applies. A defined Solar Plexus gives Emotional authority priority. One person's channels also do not constitute a compatibility analysis of two people.",
        ),
      ),
    ],
  },
  {
    id: "method",
    path: p(
      "/tr/human-design/hesaplama-yontemi/",
      "/en/human-design/calculation-method/",
    ),
    title: p(
      "Human Design Hesaplama Yöntemi ve Doğruluk | Starmora",
      "Human Design Calculation Method and Accuracy | Starmora",
    ),
    heading: p(
      "Hesabın nasıl yapıldığını bil.",
      "Understand how the calculation is made.",
    ),
    description: p(
      "Starmora'nın astronomik hesaplama, tarihsel saat dilimi, 88° tasarım anı ve doğrulama yöntemini; çizgi sınırı ve doğum saati hassasiyetini incele.",
      "Understand Starmora's astronomical calculations, historical time zones, 88° Design moment and verification, including birth-time and line-boundary precision.",
    ),
    related: ["basics", "profiles", "faq"],
    sections: [
      section(
        "Astronomik konumdan haritaya",
        "From astronomical positions to a chart",
        p(
          "Varsayılan hesaplama motoru Go içinde MIT lisanslı Astronomy Engine 2.1.19 kullanır. Görünür geosantrik tropikal boylamlar doğum anı ve 88° Güneş yayıyla bulunan tasarım anında hesaplanır. Dünya, Güneş'in karşı konumundan; düğümler gerçek/osculating düğüm yöntemiyle üretilir. Ardından kapı, çizgi, kanal ve merkez kuralları uygulanır.",
          "The default Go calculation engine uses MIT-licensed Astronomy Engine 2.1.19. Apparent geocentric tropical longitudes are calculated at birth and at the Design moment found by solving the 88° solar arc. Earth is placed opposite the Sun, and nodes use a true/osculating node method. Gate, line, channel and center rules are then applied.",
        ),
      ),
      section(
        "Doğrulamanın kapsamı",
        "The scope of verification",
        p(
          "Geliştirme kontrolünde 100 doğum ve 100 tasarım anında toplam 2.600 konum, bağımsız Swiss Ephemeris Moshier sonuçlarıyla karşılaştırıldı. Gözlenen en büyük boylam farkı doğum katmanında yaklaşık 0.00856°, tasarımda 0.00967°; tasarım anında yaklaşık 43.36 saniyeydi. Bu örneklem bütün tarihler için mutlak eşdeğerlik veya resmi sertifikasyon anlamına gelmez.",
          "Development verification compared 2,600 positions across 100 birth and 100 Design moments against independent Swiss Ephemeris Moshier results. The largest observed longitude differences were about 0.00856° at birth and 0.00967° at Design, with a Design-time difference of about 43.36 seconds. This sample does not establish absolute equivalence for every date or official certification.",
        ),
      ),
      section(
        "Saat dilimi ve sınırlar",
        "Time zones and boundaries",
        p(
          "Şehir verisi GeoNames'ten türetilmiştir; tarihsel IANA kuralları yerel saati UTC'ye çevirir. Atlanan veya tekrarlanan saatler sessizce değiştirilmez. Bir aktivasyon kapı/çizgi sınırına 0.04° yakınsa hassasiyet notu gösterilir. Bu eşik bir garanti veya doğum belgesinin doğruluğunun teyidi değildir.",
          "City data is derived from GeoNames and historical IANA rules convert local time to UTC. Skipped or repeated times are not silently changed. A precision note is shown when an activation is within 0.04° of a gate or line boundary. That threshold is not a guarantee or verification of the birth record.",
        ),
      ),
      section(
        "Yorum motoru",
        "The reading engine",
        p(
          "Türkçe ve İngilizce yorumlar hesaplanan harita öğelerinden sabit kurallarla seçilen özgün metinlerdir. Harita yorumlamak için dışarıya doğum verisi gönderilmez veya bir dil modeli çağrılmaz. Aynı dil, harita ve yorum sürümü aynı metni üretir. Kaydedilmiş haritalar yeniden astronomik hesaplama yapılmadan yorum alabilir.",
          "Turkish and English readings use original text selected by fixed rules from calculated chart elements. Producing the reading does not send birth details to an external service or call a language model. The same language, chart and reading version produce the same text. Stored charts can receive a reading without repeating the astronomical calculation.",
        ),
      ),
    ],
  },
];
