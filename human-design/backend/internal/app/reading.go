package app

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// Reading is original Turkish editorial content selected by computed chart
// facts. It uses no model, external request, random seed, or personal inference.
// Version changes when editorial rules change; saved charts are read on demand.
type Reading struct {
	Version      string           `json:"version"`
	Introduction string           `json:"introduction"`
	Summary      string           `json:"summary"`
	Sections     []ReadingSection `json:"sections"`
	Centers      []ReadingSection `json:"centers"`
	Channels     []ReadingSection `json:"channels"`
	Gates        []ReadingSection `json:"gates"`
	Practice     []string         `json:"practice"`
	Sources      []ReadingSource  `json:"sources"`
}
type ReadingSection struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Subtitle   string   `json:"subtitle,omitempty"`
	Evidence   []string `json:"evidence"`
	Paragraphs []string `json:"paragraphs"`
	Practice   string   `json:"practice,omitempty"`
	Question   string   `json:"question,omitempty"`
}
type ReadingSource struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}
type theme struct{ title, body, practice, question string }

var typeThemes = map[string]theme{
	"Generator":             {"Generator · sürdürülebilir katılım", "Human Design, tanımlı sakral merkezi tekrar eden üretim ve katılım temasıyla okur. Bu, her iş için sınırsız enerjin olduğu anlamına gelmez. Önündeki somut bir işe, soruya ya da fırsata verdiğin karşılığı gözlemlemek, hangi uğraşlara gerçekten katılmak istediğini ayırt etmene yardımcı olabilir.", "Gün sonunda hangi işlerin seni doyurduğunu, hangilerinde yalnızca mecburiyet hissettiğini yaz. Yorgunluğu kişisel başarısızlık olarak yorumlama; iş yükü ve dinlenme de sonucu etkiler.", "Bu işe ilgiyle mi katılıyorum, yoksa yalnızca başlamış olduğum için mi sürdürüyorum?"},
	"Manifesting Generator": {"Manifesting Generator · denemek ve düzenlemek", "Tanımlı sakral merkez ve bir motor merkezinin boğaza bağlantısı bu tipi oluşturur. Sistem bunu bir işe karşılık verip uygulama sırasında rotayı düzenleme temasıyla yorumlar. Birden fazla ilgi alanı, bir aşamayı yeniden ele almak ya da bir işi bırakmak üzerine düşünmek için kullanabilirsin; harita hızlı veya çok görevli olmak zorunda olduğunu söylemez.", "Bir projede küçük bir uygulama adımı dene, geri bildirimi al ve sonraki adımı düzenle. Yön değişikliği başkalarının planını etkiliyorsa değişikliği açıkça paylaş.", "Hızlanırken gerçekten gerekli bir adımı atlıyor muyum; yön değiştirmem gerekiyorsa bunu kime söylemeliyim?"},
	"Projector":             {"Projector · fark etmek ve rehberlik etmek", "Sakral merkezin tanımlı olmaması ve motor–boğaz bağlantısının bulunmaması bu tipi ayırır. Human Design bunu süreçleri ve insanları gözlemleme, rehberliğin tanınması temasıyla ele alır. Sürekli üretim temposuyla değerini ölçmek yerine, bir katkının nerede istendiğini ve nerede karşılık bulduğunu gözlemleyebilirsin.", "Bir görüşünü paylaşmadan önce karşı tarafın geri bildirim isteyip istemediğini sor. Takviminde çalışma kadar duraklama ve toparlanmaya da yer ayır.", "Burada katkım isteniyor mu ve bu ilişki becerimi karşılıklı olarak görüyor mu?"},
	"Manifestor":            {"Manifestor · başlatmak ve haber vermek", "Tanımlı sakral merkez olmadan bir motorun boğaza bağlanması Manifestor tipini oluşturur. Sistem bunu başlatma dürtüsü ve hareketin çevredeki etkisi üzerinden okur. Kendi alanına ihtiyaç duymanla başkalarının bilgiye ihtiyaç duyması birlikte ele alınabilir; bağımsızlık, iş birliğini dışlamak zorunda değildir.", "Bir değişiklik yapmadan önce etkilenecek kişilere kapsamı, zamanı ve ihtiyaç duyduğun alanı anlat. Sonrasında başlatma ile sürdürme yükünü ayrı değerlendir.", "Bu başlangıç kimleri etkiliyor ve onlara hangi bilgiyi önceden verebilirim?"},
	"Reflector":             {"Reflector · çevreyi ve zaman içindeki değişimi gözlemek", "Haritanda hiçbir merkez bir tam kanalla tanımlanmıyor. Bu, etkin kapın olmadığı veya bir kimliğinin bulunmadığı anlamına gelmez. Human Design bu düzeni çevreye duyarlılık ve zaman içinde farklı bakışlar edinme temalarıyla yorumlar. Aynı ortamın seni farklı günlerde nasıl etkilediğini gözlemlemek başlangıç olabilir.", "Sık bulunduğun ortamlarda deneyimini günlere yayılan kısa notlarla kaydet. Bir günkü izlenimi bütün hayatının tanımı olarak ele alma.", "Bu ortamda kendime alan buluyor muyum; birkaç gün sonra deneyimim nasıl değişiyor?"},
}

var authorityThemes = map[string]theme{
	"Emotional - Solar Plexus": {"Duygusal otorite · zamana yayılan netlik", "Haritanda solar pleksus tanımlı; Human Design sıralamasında bu, sakral ya da sezgisel işaretlerden önce gelir. İlk heyecan, isteksizlik veya güçlü bir bedensel tepkiyi nihai karar saymak yerine, önemli bir konunun farklı duygu hallerinde nasıl göründüğünü karşılaştırma teması öne çıkar. Sistem burada mutlak kesinlikten çok zamanla artan netliği tarif eder.", "Acil olmayan önemli bir karar için süre iste. Aynı seçeneği farklı zamanlarda yeniden değerlendir; gerekçelerini ve değişmeyen isteğini yaz. Tek bir gece veya sabit saat sayısı herkes için zorunlu bir kural değildir.", "Duygu halim değiştiğinde bu seçeneğe ilişkin isteğim ve gerekçelerim de tamamen değişiyor mu?"},
	"Sacral":                   {"Sakral otorite · somut seçeneğe verilen karşılık", "Solar pleksus tanımsız, sakral merkez tanımlı olduğunda bu otorite kullanılır. Sistem, soyut bir hayat planından çok önündeki somut seçeneğe verdiğin bedensel karşılığı incelemeyi önerir. İstek, isteksizlik veya kararsızlığı gözlemlemek mümkündür; bir bedensel his tek başına olguların ve sonuçların yerine geçmez.", "Bir konuyu birkaç açık evet/hayır sorusuna böl. Yanıt veremediğin yerde soruyu somutlaştır; sosyal baskıyı ve gerçek kapasiteni ayrıca değerlendir.", "Bu seçeneğe katılmak istiyor muyum, yoksa kendimi ikna etmeye mi çalışıyorum?"},
	"Splenic":                  {"Dalak otoritesi · anlık farkındalığı duymak", "Duygusal ve sakral otorite olmadan tanımlı dalak merkezi bu okumayı oluşturur. Human Design bunu içinde bulunulan ana ilişkin kısa ve sakin bir sezgisel işaret olarak anlatır. Sürekli tekrar eden endişe ile ilk fark edişini birbirinden ayırmayı gözlemleyebilirsin; harita bir tehlike tespiti veya sağlık değerlendirmesi yapmaz.", "Bir karşılaşmada ilk izlenimini not et, sonra elindeki somut bilgilerle karşılaştır. Sezgi diye adlandırdığın şeyin alışkanlık veya baskı olup olmadığını da sorgula.", "İlk sakin izlenimim neydi; sonradan hangi düşünceler ona eklendi?"},
	"Ego Manifested":           {"Ego otoritesi · istek ve taahhüt", "Bu düzende irade merkezi boğaza bağlanır. Yorumun odağı, seslendirdiğin gerçek isteği ve o isteğe ayırabileceğin gücü fark etmektir. Bir şeyi istemekle sürekli yapabilecek olmak farklıdır. Başlatacağın işin yükünü ve dinlenme ihtiyacını dürüstçe ifade edebilirsin.", "Bir söz vermeden önce neyi istediğini, ne kadar süre ve kaynak ayırabileceğini yüksek sesle ifade et. Etkilenecek kişilere kararını bildir.", "Bunu gerçekten istiyor muyum ve verdiğim sözü hangi kaynaklarla tutabilirim?"},
	"Ego Projected":            {"Ego otoritesi · davet içinde gerçek isteğini ayırmak", "İrade merkezi üzerinden okunan bu otorite, Projector stratejisiyle birlikte ele alınır. Bir fırsatta tanınmak, her daveti kabul etmen gerektiği anlamına gelmez. Beklentiye uygun görünme çabasıyla gerçek isteğini ayırmak ve üstleneceğin sorumluluğu açık konuşmak bu yorumun merkezidir.", "Bir davette senden ne beklendiğini netleştir. İstediğini ve karşılığında sunabileceğini ayrı cümlelerle anlat.", "Bu davette benim isteğim de var mı, yoksa yalnızca diğer kişinin beklentisini mi karşılıyorum?"},
	"Self Projected":           {"Kendini ifade etme otoritesi · konuşurken yönünü duymak", "G merkezi boğaza bağlanırken daha öncelikli bir içsel otorite bulunmaz. Human Design, kendini ifade ederken kendi sesinden duyduğun yön ve uyum temasını vurgular. Dinleyen kişi senin yerine karar veren bir danışman olmaktan çok, kendini duymana alan açan biri olabilir.", "Güvendiğin birine seçeneklerini anlat ve senden önce çözüm önermemesini iste. Konuşurken hangi seçenekte kendini daha rahat ifade ettiğini not et.", "Bu seçeneği anlatırken kendi yönümü duyuyor muyum, yoksa bir role uymaya mı çalışıyorum?"},
	"Sounding Board":           {"Çevresel değerlendirme · konuşmak için uygun alan", "Bu Projector düzeninde bedensel bir içsel otorite tanımlanmaz. Sistem, uygun ortamda farklı konuşmalar yoluyla kendi değerlendirmesini duymayı önerir. Birinin tavsiyesini otomatik olarak karar kabul etmek yerine, konuştuğun ortamın ve kişinin düşüncelerini nasıl etkilediğini gözlemleyebilirsin.", "Önemli bir daveti farklı sakin ortamlarda, seni yönlendirmeden dinleyebilen kişilerle konuş. Duyduğun tavsiye ile senin değerlendirmene ait cümleleri ayır.", "Burada rahatça düşünebiliyor muyum; konuşmanın sonunda kendi görüşüm daha anlaşılır mı?"},
	"Lunar":                    {"Ay döngüsü · farklı günlerin bakışını toplamak", "Reflector için sistem, önemli ve acil olmayan seçimleri yaklaşık bir Ay döngüsüne, yaklaşık 28–29 güne yayarak gözlemleme yaklaşımını kullanır. Amaç, tek bir günün etkisini kalıcı bir karar gibi ele almamaktır. Bu takvim gündelik küçük işler için bekleme zorunluluğu oluşturmaz.", "Acil olmayan büyük bir seçimde farklı günlerdeki izlenimlerini not al, konuş ve dönüp oku. Gerçek son tarihleri ve koşulları da değerlendirmene dahil et.", "Bu karar farklı günlerde ve farklı ortamlarda nasıl hissettiriyor; hangi gerekçeler tekrar ediyor?"},
}

var lineThemes = map[int]theme{
	1: {"Araştırma ve sağlam temel", "Bir konunun dayanağını öğrenme teması. Ayrıntı araştırmak güven sağlayabilir; bütün belirsizliği gidermeye çalışmak ise başlamayı erteletebilir.", "Yeterli bilgi için bir eşik belirle: hangi üç bilgiye gerçekten ihtiyacın var?", "Bilgi eksikliği mi var, yoksa kesinlik arayışı mı?"},
	2: {"Doğal beceri ve kendi alanı", "Kendiliğinden gelen beceriler ile yalnız kalma ihtiyacının birlikte ele alınması. Sana kolay gelen bir beceriyi küçümsememek ve her çağrıya yanıt vermek zorunda hissetmemek üzerine düşünebilirsin.", "Kendi başına çalışmak ve uygun insanlarla paylaşmak için ayrı zamanlar ayır.", "Bana kolay gelen hangi beceriyi başkaları değerli buluyor?"},
	3: {"Deneyim ve deneme", "Uygulayarak neyin çalıştığını öğrenme teması. Bir denemenin beklenen sonucu vermemesi kimliğini tanımlamaz; süreç hakkında veri sağlar.", "Küçük ve geri alınabilir bir deneme yap; önce beklentini, sonra öğrendiğini yaz.", "Bu deneyimden ne öğrendim ve sonraki denemede neyi değiştireceğim?"},
	4: {"Güven ilişkileri ve paylaşım", "Tanıdık çevre, karşılıklı güven ve bağlantılar üzerinden paylaşım teması. İlişki kurmayı yalnızca fırsat toplamak olarak görmeden, yakınlık ve sınırları birlikte gözlemleyebilirsin.", "Bir bağlantıda karşılıklı katkıyı ve beklentiyi açıklaştır; sosyal takviminde dinlenme payı bırak.", "Bu ilişki iki tarafa da alan ve karşılık sağlıyor mu?"},
	5: {"Pratik çözüm ve beklentiler", "Başkalarının çözüm beklentisiyle karşılaşma ve işe yarar bir yaklaşım sunma teması. Beklentiyi üstlenmeden önce gerçekten ne sunabileceğini anlatmak önem kazanır.", "Bir görevde kapsamı, başarı ölçütünü ve yapamayacaklarını başlangıçta konuş.", "Benden beklenen ile gerçek katkım aynı şey mi?"},
	6: {"Gözlem ve örnek olma", "Deneyimlerden geri çekilip daha geniş bir bakış edinme ve yaşananı tutarlı biçimde yansıtma teması. Sistem bunu yaşam evreleriyle anlatır; yaşına göre karakter veya başarı düzeyi çıkarımı yapılmaz.", "Bir deneyimi hemen genellemeden önce zaman içinde tekrar eden örüntüleri izle.", "Tavsiye verdiğim konularda kendi davranışım neyi gösteriyor?"},
}

var centerThemes = map[string]theme{
	"head":         {"Baş · sorular ve ilham", "Sorular, merak ve cevap arama baskısı.", "Aklına gelen soruları yaz; hangisinin bugün gerçekten sana ait bir işi ilgilendirdiğini seç.", "Her soruya şimdi cevap bulmam gerekiyor mu?"},
	"ajna":         {"Ajna · anlamlandırma", "Kavramlar, görüşler ve bilgiyi yorumlama biçimi.", "Bir görüşü olgu, yorum ve varsayım olarak üçe ayır. Fikrini değiştirebilmek için alan bırak.", "Bunu biliyor muyum, yoksa belli bir yorumla mı ele alıyorum?"},
	"throat":       {"Boğaz · ifade ve görünür eylem", "Kendini ifade etme, anlatma ve bir şeyi görünür hale getirme.", "Konuşurken içeriği kadar zamanı ve dinleyenin ilgisini de gözlemle.", "Şu anda paylaşmak için alan var mı?"},
	"g":            {"G · yön ve kimlik", "Yön, aidiyet ve kendini nasıl tanımladığın.", "Bir ortamda hangi yönlerinin rahatça ortaya çıktığını ve hangi rollere sıkıştığını yaz.", "Bu ortamda kendimi rahatça ifade edebiliyor muyum?"},
	"heart":        {"İrade · değer ve taahhüt", "İstek, özdeğer, söz verme ve kaynak ayırma.", "Sözlerini gerçek zamanın ve kaynaklarınla eşleştir. Değerini kanıtlamak için verdiğin sözleri gözden geçir.", "Bu taahhüt isteğimden mi, kendimi ispat çabamdan mı geliyor?"},
	"splenic":      {"Dalak · anlık farkındalık", "Anlık sezgi, alışkanlıklar ve tutunma temaları; organ sağlığı hakkında bir bilgi değildir.", "Sürdürdüğün bir alışkanlığın bugün gerçekten işe yarayıp yaramadığını değerlendir.", "Tanıdık olduğu için mi sürdürüyorum, bugün işe yaradığı için mi?"},
	"sacral":       {"Sakral · katılım ve çalışma", "Bir işe katılma isteği, üretim ritmi ve sürdürülebilir uğraş.", "Yapılacaklar listene kapasiteni ve toparlanma zamanını da ekle.", "Bu işe ayırabileceğim gerçek kapasite ne?"},
	"solar plexus": {"Solar pleksus · duygusal deneyim", "Duygular, ilişkisel hassasiyet ve deneyimin zaman içinde değişmesi.", "Bir duyguyu adlandırırken durumu ve zamanı da not et; tek bir duygu halini bütün ilişkinin sonucu sayma.", "Bu duygunun içinde hangi ihtiyacımı fark ediyorum?"},
	"root":         {"Kök · baskı ve tempo", "Başlama, bitirme ve baskı altında hareket etme temaları.", "İşin gerçek son tarihini, kendine koyduğun acele hissinden ayır.", "Şimdi hızlanmam gerekiyor mu, yoksa baskıdan kurtulmak mı istiyorum?"},
}

func section(id string, t theme, evidence ...string) ReadingSection {
	return ReadingSection{ID: id, Title: t.title, Evidence: evidence, Paragraphs: []string{t.body}, Practice: t.practice, Question: t.question}
}

func GenerateReading(r Result) Reading {
	// Sanitize a copy for legacy/imported records. Saved facts are never edited.
	validGates := map[int]bool{}
	for _, g := range r.Gates {
		if g >= 1 && g <= 64 {
			validGates[g] = true
		}
	}
	r.Gates = []int{}
	for g := range validGates {
		r.Gates = append(r.Gates, g)
	}
	sort.Ints(r.Gates)
	channels := []string{}
	for _, pair := range channelPairs {
		if containsChannel(r.Channels, pair) {
			channels = append(channels, fmt.Sprintf("%d-%d", pair[0], pair[1]))
		}
	}
	r.Channels = channels
	centers := []string{}
	for _, c := range allCenters {
		for _, given := range r.Centers {
			if c == given {
				centers = append(centers, c)
				break
			}
		}
	}
	r.Centers = centers
	o := Reading{Version: "starmora-tr-1", Introduction: "Bu metin, hesaplanan haritanın öğelerini Human Design geleneği içinde açıklayan bir öz gözlem rehberidir. Human Design bilimsel olarak doğrulanmış bir kişilik testi değildir; yorumlar kesin kişilik, gelecek, sağlık veya kader tespiti olarak okunmamalıdır. Sana uyan örnekleri gözlemleyebilir, uymayanları bırakabilirsin.", Sections: []ReadingSection{}, Centers: []ReadingSection{}, Channels: []ReadingSection{}, Gates: []ReadingSection{}, Sources: []ReadingSource{
		{"Tip ve strateji · Jovian Archive", "https://jovianarchive.com/pages/type-and-strategy-in-human-design"},
		{"İçsel otorite · Jovian Archive", "https://jovianarchive.com/pages/what-is-inner-authority-in-human-design"},
		{"Profil · Jovian Archive", "https://jovianarchive.com/pages/understanding-profile-in-human-design"},
		{"Merkezler · Human.Design", "https://human.design/the-human-design-system/centers"},
		{"Kanallar · Human.Design", "https://human.design/the-human-design-system/channels"},
	}}
	t, ok := typeThemes[r.Type]
	if !ok {
		t = theme{"Tip bilgisi", "Bu haritanın tip etiketi yorum sözlüğünde bulunmuyor. Tip hakkında otomatik bir çıkarım yapılmadı.", "", ""}
	}
	o.Sections = append(o.Sections, section("type", t, "Hesaplanan tip: "+r.Type, "Strateji: "+strategyLabel(r.Strategy)))
	a, ok := authorityThemes[r.Authority]
	if !ok {
		a = theme{"Otorite bilgisi", "Bu haritanın otorite etiketi yorum sözlüğünde bulunmuyor. Karar yaklaşımı hakkında otomatik bir öneri üretilmedi.", "", ""}
	}
	o.Sections = append(o.Sections, section("authority", a, "Hesaplanan otorite: "+r.Authority))
	strategy := strategyText(r.Strategy)
	strategy.Paragraphs = append(strategy.Paragraphs, "Strateji bir fırsata nasıl yaklaşacağını, otorite ise o fırsatı nasıl değerlendireceğini anlatır. Bu haritada karar yaklaşımın: "+a.title+". Tipinle ilgili örnekleri bu otorite bölümüyle birlikte oku.")
	o.Sections = append(o.Sections, strategy)
	p := ReadingSection{ID: "profile", Title: "Profil · " + r.Profile, Evidence: []string{"Kişilik Güneşi çizgisi + Tasarım Güneşi çizgisi"}, Paragraphs: []string{"Profilde ilk sayı kişilik tarafındaki, ikinci sayı tasarım tarafındaki Güneş çizgisidir. Sistem bunları daha kolay fark ettiğin rol ile başkalarının da fark edebileceği davranış temalarını birlikte okumak için kullanır. İki sayı başarı sıralaması veya gelişmişlik düzeyi değildir."}}
	parts := strings.Split(strings.ReplaceAll(r.Profile, " ", ""), "/")
	for i, part := range parts {
		if i > 1 {
			break
		}
		line, err := strconv.Atoi(part)
		if l, exists := lineThemes[line]; err == nil && exists {
			layer := []string{"Kişilik", "Tasarım"}[i]
			p.Paragraphs = append(p.Paragraphs, fmt.Sprintf("%s · %d. çizgi — %s: %s %s", layer, line, l.title, l.body, l.practice))
		}
	}
	p.Practice = "Bu iki temanın birlikte göründüğü bir olay seç. Hangi kısmını kendin fark ettin, hangi kısmına çevrendekiler dikkat çekti?"
	p.Question = "İki rol arasında nasıl bir denge kuruyorum?"
	o.Sections = append(o.Sections, p, definitionSection(r))
	defined, gates := map[string]bool{}, map[int]bool{}
	for _, c := range r.Centers {
		defined[c] = true
	}
	for _, g := range r.Gates {
		if g >= 1 && g <= 64 {
			gates[g] = true
		}
	}
	for _, c := range allCenters {
		ct := centerThemes[c]
		active := []int{}
		for _, g := range centerGates[c] {
			if gates[g] {
				active = append(active, g)
			}
		}
		sort.Ints(active)
		status, explanation := "Tanımsız", "Bu merkezde etkin kapı var, ancak merkezi tanımlayan tam bir kanal yok. Sistem bu alandaki deneyimin çevre ve ilişkilerle değişebilmesi temasını kullanır. Değişkenlik bir eksiklik değildir; farklı durumları karşılaştırmak için bir gözlem alanıdır."
		if defined[c] {
			status, explanation = "Tanımlı", "Bu merkez en az bir tam kanalla tanımlanıyor. Human Design bunu bu alandaki temaların daha tutarlı bir biçimde yaşanması olarak yorumlar. Tutarlılık her koşulda aynı davranmak, üstün olmak veya bu merkezin tek başına karar otoriten olması anlamına gelmez."
		} else if len(active) == 0 {
			status, explanation = "Tamamen açık", "Bu merkez tanımsız ve merkezde etkin kapı da yok. Sistem burada sabit bir kapı temasına bağlanmadan farklı deneyimleri gözlemleme yaklaşımını kullanır. Açıklık yeteneksizlik veya bir sorun anlamına gelmez."
		}
		cs := section("center-"+strings.ReplaceAll(c, " ", "-"), ct, "Durum: "+status, fmt.Sprintf("Etkin kapılar: %v", active))
		cs.Subtitle = status
		cs.Paragraphs = append(cs.Paragraphs, explanation)
		if c == "solar plexus" && defined[c] {
			cs.Paragraphs = append(cs.Paragraphs, "Bu haritada bu merkez aynı zamanda duygusal otoriteyi belirliyor. Önemli kararlar için duygusal otorite bölümündeki zamana yayma yaklaşımını esas al.")
		}
		if c == "sacral" && defined[c] && r.Authority == "Emotional - Solar Plexus" {
			cs.Paragraphs = append(cs.Paragraphs, "Sakralin tanımlı olsa da bu haritada karar otoriten duygusal. İlk bedensel karşılık, önemli bir kararın tek başına son yanıtı olarak yorumlanmaz.")
		}
		o.Centers = append(o.Centers, cs)
	}
	for _, pair := range channelPairs {
		id := fmt.Sprintf("%d-%d", pair[0], pair[1])
		if !containsChannel(r.Channels, pair) {
			continue
		}
		ct := channelThemes[id]
		cs := section("channel-"+id, ct, "Tanımlı kanal: "+id, centerThemes[gateCenter(pair[0])].title+" ↔ "+centerThemes[gateCenter(pair[1])].title)
		cs.Title = id + " · " + ct.title
		cs.Paragraphs = append(cs.Paragraphs, "Her iki kapı da haritanda etkin olduğu için tam bir bağlantı oluşturur. Kişilik ve tasarım katmanlarının birlikte oluşturduğu bu kanal, tek bir gezegen yerleşimine indirgenmez. Bir kanalın teması, tip ve otoriteye ait karar yaklaşımının yerine geçmez.")
		o.Channels = append(o.Channels, cs)
	}
	ordered := []int{}
	for g := range gates {
		ordered = append(ordered, g)
	}
	sort.Ints(ordered)
	for _, g := range ordered {
		gt := gateThemes[g]
		gs := section(fmt.Sprintf("gate-%d", g), gt, "Merkez: "+centerThemes[gateCenter(g)].title)
		gs.Title = fmt.Sprintf("%d · %s", g, gt.title)
		for _, layer := range []struct {
			label string
			data  map[string]Activation
		}{{"Kişilik", r.Personality}, {"Tasarım", r.Design}} {
			for _, planet := range readingPlanets {
				act, exists := layer.data[planet]
				if !exists || act.Gate != g {
					continue
				}
				gs.Evidence = append(gs.Evidence, fmt.Sprintf("%s · %s · %d.%d", layer.label, planetLabels[planet], g, act.Line))
				if lt, exists := lineThemes[act.Line]; exists {
					gs.Paragraphs = append(gs.Paragraphs, fmt.Sprintf("%s %s, %d. çizgi: %s. Bu kapı temasını %s bağlamında gözlemleyebilirsin.", layer.label, planetLabels[planet], act.Line, lt.title, strings.ToLower(planetThemes[planet])))
				}
			}
		}
		connected := []string{}
		partners := []string{}
		for _, pair := range channelPairs {
			if pair[0] != g && pair[1] != g {
				continue
			}
			partner := pair[0]
			if partner == g {
				partner = pair[1]
			}
			if containsChannel(r.Channels, pair) {
				connected = append(connected, fmt.Sprintf("%d-%d", pair[0], pair[1]))
			} else {
				partners = append(partners, strconv.Itoa(partner))
			}
		}
		if len(connected) > 0 {
			gs.Paragraphs = append(gs.Paragraphs, "Haritanda tamamladığı kanal: "+strings.Join(connected, ", ")+".")
		}
		if len(partners) > 0 {
			gs.Paragraphs = append(gs.Paragraphs, "Bu kapının karşısındaki "+strings.Join(partners, ", ")+" kapısı ile bağlantı haritanda tam kanal oluşturmuyor. Tek bir etkin kapı merkezi tek başına tanımlamaz. Bu bağlantıyı tamamlayan bir kişiye ihtiyaç duyduğun veya bir ilişki yaşaman gerektiği sonucu çıkarılmaz.")
		}
		o.Gates = append(o.Gates, gs)
	}
	o.Sections = append(o.Sections, crossSection(r), section("relationships", theme{"İlişkiler · beklenti, alan ve iletişim", "Bu bir tek kişi haritasıdır; iki kişi arasındaki uyum veya bir ilişkinin geleceği hesaplanmadı. Profilindeki paylaşım temalarını, tanımsız merkezlerdeki değişken deneyimleri ve otoritendeki karar yaklaşımını ilişkilerde sınırları konuşmak için kullanabilirsin. Benzer ya da farklı bir tip, tek başına iyi veya kötü bir eşleşme belirlemez.", "Bir beklentiyi açık bir cümleye dönüştür: benden ne bekleniyor, ne sunabilirim ve ne kadar zamana ihtiyacım var? Karşı tarafın kendi değerlendirmesine de alan bırak.", "Bu ilişkide kararlarımı ve ihtiyaçlarımı söyleyebiliyor muyum?"}, "Tek kişi haritası · ilişki karşılaştırması yapılmadı"))
	o.Practice = []string{"1. gün · Gerçek bir olay seç: bir iş, teklif veya görüşme. Ne olduğunu yorum katmadan yaz.", "2. gün · Tip ve strateji bölümünü oku. Olayda nasıl başladığını ve nasıl karşılık aldığını gözlemle.", "3. gün · " + a.practice, "4. gün · Profilinin iki çizgisine bak; kendin fark ettiğin ve çevrenden duyduğun temaları ayır.", "5. gün · Bir tanımlı ve bir tanımsız ya da açık merkezi seç. Aynı temanın iki ortamda nasıl farklı yaşandığını karşılaştır. Hepsi tanımlıysa farklı merkezleri karşılaştır.", "6. gün · Bir kanal veya kapı temasını somut bir deneyime bağla; uymayan örnekleri de kaydet.", "7. gün · Notlarını oku. Sana yararlı gelen bir küçük değişikliği seç; geri kalanını zorunlu bir kural haline getirme."}
	if a.practice == "" {
		o.Practice[2] = "3. gün · Otorite verisi desteklenmiyor; otomatik karar önerisi kullanılmadı."
	}
	definedCount := 0
	for _, c := range o.Centers {
		if c.Subtitle == "Tanımlı" {
			definedCount++
		}
	}
	o.Summary = fmt.Sprintf("Haritanda %s tipi, %s otorite ve %s profili hesaplandı. %d merkez, %d kanal tanımlı; %d farklı kapı aktif. Aşağıdaki bölümler bu somut öğelerden hazırlanır.", r.Type, authorityLabel(r.Authority), r.Profile, definedCount, len(o.Channels), len(o.Gates))
	return o
}

func containsChannel(channels []string, pair [2]int) bool {
	for _, c := range channels {
		c = strings.ReplaceAll(c, " ", "")
		if c == fmt.Sprintf("%d-%d", pair[0], pair[1]) || c == fmt.Sprintf("%d-%d", pair[1], pair[0]) {
			return true
		}
	}
	return false
}
func strategyLabel(v string) string {
	return mapValue(map[string]string{"To Respond": "Yanıt vermek", "Wait for the Invitation": "Daveti beklemek", "To Inform": "Bilgilendirmek", "Wait a Lunar Cycle": "Ay döngüsünü beklemek"}, v)
}
func authorityLabel(v string) string {
	return mapValue(map[string]string{"Emotional - Solar Plexus": "duygusal", "Sacral": "sakral", "Splenic": "dalak", "Ego Manifested": "ego", "Ego Projected": "ego", "Self Projected": "kendini ifade etme", "Sounding Board": "çevresel değerlendirme", "Lunar": "Ay döngüsü"}, v)
}
func mapValue(m map[string]string, v string) string {
	if s, ok := m[v]; ok {
		return s
	}
	return v
}
func strategyText(v string) ReadingSection {
	t := map[string]theme{
		"To Respond":              {"Strateji · somut olana yanıt vermek", "Sistem, içinden soyut bir zorunluluk üretmek yerine bir soru, olay, seçenek veya karşılaşma gibi somut olana verdiğin karşılığı gözlemlemeyi önerir. Bu pasif kalmak demek değildir: çevreyi keşfetmek, soru sormak ve seçenek yaratmak da somut bir karşılaşma sağlayabilir.", "Bir sonraki adımı genel bir hedef yerine somut bir seçeneğe dönüştür ve otorite bölümünle birlikte değerlendir.", "Önümde gerçekten değerlendirebileceğim hangi seçenek var?"},
		"Wait for the Invitation": {"Strateji · tanınma ve davet", "İş ortaklığı, yakın ilişki veya yön verme gibi önemli alanlarda katkının tanındığı bir daveti inceleme teması vardır. Her gündelik eylem için izin beklemek anlamına gelmez. Bir davet de uygunluk garantisi değildir; rolün, karşılık ve kendi otoriten birlikte değerlendirilir.", "Bir davette rolü, karar alanını, beklentiyi ve karşılığı konuş.", "Beni gerçekten hangi katkım için davet ediyorlar?"},
		"To Inform":               {"Strateji · etkilenecek kişileri bilgilendirmek", "Bir başlangıcın başkalarını nasıl etkileyeceğini önceden anlatma teması vardır. Bilgilendirme, her adımda onay istemekten farklı bir iletişim davranışıdır; ortak sorumluluklarda karşılıklı anlaşma yine gerekir.", "Başlatacağın değişikliği kimlerin bilmesi gerektiğini yaz; karar yaklaşımını otorite bölümünden kontrol et.", "Hangi bilgi bu geçişi çevrem için daha anlaşılır kılar?"},
		"Wait a Lunar Cycle":      {"Strateji · büyük seçimlere zaman vermek", "Önemli, acil olmayan konuları farklı günlerin deneyimleriyle değerlendirme temasıdır. Tek bir ortamın veya günün etkisini bütün kararın ölçüsü yapmadan, zaman içindeki örüntüyü inceleyebilirsin.", "Değerlendirme notlarını tarih ve ortam bilgisiyle tut.", "Tekrarlayan izlenim ile geçici etkiyi ayırabiliyor muyum?"},
	}[v]
	if t.title == "" {
		t = theme{"Strateji bilgisi", "Bu strateji için desteklenen bir yorum bulunmuyor.", "", ""}
	}
	return section("strategy", t, "Hesaplanan strateji: "+strategyLabel(v))
}

func definitionSection(r Result) ReadingSection {
	body := map[string]string{
		"No Definition":              "Hiçbir merkez tam kanalla tanımlanmıyor. Etkin kapılar yine bulunabilir. Sistem bu düzeni farklı çevrelerdeki deneyimleri karşılaştırma üzerinden ele alır; bir bütünlük eksikliği veya kişilik yokluğu anlamına gelmez.",
		"Single Definition":          "Tanımlı merkezlerin tek bir bağlı grupta yer alıyor. Sistem bunu temalar arasındaki bağlantının tek bir ağda bulunması olarak ele alır. Bu, tek başına yaşamak, her işi yalnız çözmek veya hiç desteğe ihtiyaç duymamak demek değildir.",
		"Split Definition":           "Tanımlı merkezlerin iki ayrı bağlı grupta bulunuyor. Sistem bu iki küme arasındaki temaları ayrı ayrı gözlemlemeyi önerir. Diğer insanlarla farklı bağlantılar deneyimlemek mümkün olsa da birinin seni tamamlaması gerektiği sonucu çıkarılmaz.",
		"Triple Split Definition":    "Tanımlı merkezlerin üç ayrı bağlı grupta bulunuyor. Sistem farklı ortamlar ve etkileşimler içinde deneyimin değişmesini gözlemleme teması kullanır. Tek bir kişiyi bütün ihtiyaçların için çözüm olarak görmek yerine farklı bağlamların katkısını inceleyebilirsin.",
		"Quadruple Split Definition": "Tanımlı merkezlerin dört ayrı bağlı grupta bulunuyor. Sistem bu kümelerin temalarını ve farklı bağlantı deneyimlerini gözlemleme alanı olarak ele alır. Bu bir engel veya kusur değildir; karar yaklaşımın yine otorite bölümünde belirtilendir.",
	}[r.Definition]
	if body == "" {
		body = "Tanım etiketi desteklenen sözlükte bulunmuyor; bağlantı yapısı hakkında ek çıkarım yapılmadı."
	}
	return section("definition", theme{"Tanım · merkezlerin bağlantı yapısı", body, "Bir konuyu tek başına ve konuşarak değerlendirirken nelerin farklılaştığını izle. Bu farkı bir eksiklik olarak adlandırmadan not et.", "Bir fikrin farklı parçalarını nasıl bir araya getiriyorum?"}, "Hesaplanan tanım: "+r.Definition, fmt.Sprintf("Tanımlı merkez: %d · tam kanal: %d", len(r.Centers), len(r.Channels)))
}

func crossSection(r Result) ReadingSection {
	s := ReadingSection{ID: "cross", Title: "Güneş–Dünya ekseni · yaşam temaları", Evidence: []string{}, Paragraphs: []string{"Human Design enkarnasyon çaprazını kişilik ve tasarım Güneş–Dünya kapılarından okur. Burada dört kapının sembolik temaları bir arada sunulur. Bunlar hayat amacının kesin tanımı, bir meslek önerisi veya gelecekte olacakların tahmini değildir. Adlandırılmış çaprazlar için doğrulanmış bir ad kataloğu kullanılmadığından kapı numaralarından bir çapraz adı uydurulmaz."}}
	for _, layer := range []struct {
		label string
		data  map[string]Activation
	}{{"Kişilik", r.Personality}, {"Tasarım", r.Design}} {
		for _, planet := range []string{"Sun", "Earth"} {
			a, ok := layer.data[planet]
			if !ok || a.Gate < 1 || a.Gate > 64 {
				continue
			}
			gt := gateThemes[a.Gate]
			s.Evidence = append(s.Evidence, fmt.Sprintf("%s %s: %d.%d", layer.label, planetLabels[planet], a.Gate, a.Line))
			s.Paragraphs = append(s.Paragraphs, fmt.Sprintf("%s %s · %d — %s: %s", layer.label, planetLabels[planet], a.Gate, gt.title, gt.body))
		}
	}
	s.Practice = "Bu dört temadan hayatında karşılığı olan birini seç ve somut bir örnek yaz. Karşılığı olmayan temalar için örnek üretmeye çalışma."
	s.Question = "Bu temalar benim deneyimimle nerede buluşuyor, nerede buluşmuyor?"
	return s
}

var readingPlanets = []string{"Sun", "Earth", "North Node", "South Node", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"}
var planetLabels = map[string]string{"Sun": "Güneş", "Earth": "Dünya", "North Node": "Kuzey Ay Düğümü", "South Node": "Güney Ay Düğümü", "Moon": "Ay", "Mercury": "Merkür", "Venus": "Venüs", "Mars": "Mars", "Jupiter": "Jüpiter", "Saturn": "Satürn", "Uranus": "Uranüs", "Neptune": "Neptün", "Pluto": "Plüton"}
var planetThemes = map[string]string{"Sun": "İfade ettiğin ana temalar", "Earth": "Denge ve dayanak arayışı", "North Node": "Yön ve çevre deneyimleri", "South Node": "Tanıdık çevre deneyimleri", "Moon": "Hareket etme isteği", "Mercury": "İletişim ve anlatım", "Venus": "Değerler ve sınırlar", "Mars": "Deneyerek gelişme", "Jupiter": "İlkeler ve genişleme", "Saturn": "Sorumluluk ve sınırlar", "Uranus": "Özgünlük ve değişim", "Neptune": "Belirsizlik ve anlam arayışı", "Pluto": "Derinlemesine sorgulama"}
