import { useLocale } from "./locale";
import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, LoaderCircle } from "lucide-react";
import { api } from "./types";
import type { Reading, ReadingSection } from "./types";
function ReadingCard({
  item,
  open = false,
}: {
  item: ReadingSection;
  open?: boolean;
}) {
  const { t } = useLocale();
  return (
    <details className="reading-card" open={open}>
      <summary>
        <span>
          <strong>{item.title}</strong>
          {item.subtitle && <small>{item.subtitle}</small>}
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="reading-card-body">
        {item.evidence.length > 0 && (
          <div
            className="reading-evidence"
            aria-label={t("Haritadaki dayanaklar")}
          >
            {item.evidence.map((value, i) => (
              <span key={i}>{value}</span>
            ))}
          </div>
        )}
        {item.paragraphs.map((value, i) => (
          <p key={i}>{value}</p>
        ))}
        {item.practice && (
          <div className="reading-observation">
            <span className="tiny-label">{t("GÜNLÜK HAYATTA DENE")}</span>
            <p>{item.practice}</p>
          </div>
        )}
        {item.question && <blockquote>{item.question}</blockquote>}
      </div>
    </details>
  );
}
export default function ReadingView({ chartId }: { chartId: string }) {
  const { t, locale } = useLocale();
  const [reading, setReading] = useState<Reading | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setReading(null);
    setError("");
    api<Reading>(`/charts/${chartId}/reading?lang=${locale}`, {
      signal: controller.signal,
    })
      .then((value) => {
        if (!controller.signal.aborted) setReading(value);
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [chartId, attempt, locale]);
  if (error)
    return (
      <div role="alert" className="error">
        {t(error)}{" "}
        <button
          className="text-link"
          onClick={() => setAttempt((value) => value + 1)}
        >
          {t("Yorumu tekrar yükle")}
        </button>
      </div>
    );
  if (!reading)
    return (
      <div role="status" className="loading-note">
        <LoaderCircle className="spin" size={17} />
        {t("Haritanın yorumunu hazırlıyoruz…")}
      </div>
    );
  const prefix = `reading-${chartId}`;
  return (
    <div className="reading-view">
      <div className="reading-intro">
        <BookOpen size={23} aria-hidden="true" />
        <div>
          <p className="eyebrow">{t("HARİTANIN KATMANLARI")}</p>
          <h3>{t("Kendini gözlemlemek için bir rehber.")}</h3>
          <p>{reading.summary}</p>
        </div>
      </div>
      <p className="reading-context">{reading.introduction}</p>
      <nav className="reading-nav" aria-label={t("Yorum bölümleri")}>
        {[
          ["essentials", t("Tip, otorite ve profil")],
          ["centers", t("9 merkez")],
          [
            "channels",
            `${reading.channels.length} ${locale === "en" ? "channels" : "kanal"}`,
          ],
          [
            "gates",
            `${reading.gates.length} ${locale === "en" ? "gates" : "kapı"}`,
          ],
          ["practice", t("7 günlük gözlem")],
        ].map(([id, title]) => (
          <a key={id} href={`#${prefix}-${id}`}>
            {title}
          </a>
        ))}
      </nav>
      <section id={`${prefix}-essentials`} className="reading-group">
        <h3>{t("Temel tasarımın")}</h3>
        <p className="muted">
          {t(
            "Tip ve stratejiyi karar otoritenle birlikte oku. Başlıkları açarak günlük örnekleri keşfet.",
          )}
        </p>
        {reading.sections.map((item, i) => (
          <ReadingCard key={item.id} item={item} open={i < 2} />
        ))}
      </section>
      <section id={`${prefix}-centers`} className="reading-group">
        <h3>{t("Dokuz merkezin")}</h3>
        <p className="muted">
          {t(
            "Tanımlı merkez tam bir kanalla bağlıdır. Tanımsız merkezde etkin kapı bulunabilir; tamamen açık merkezde etkin kapı da yoktur.",
          )}
        </p>
        {reading.centers.map((item) => (
          <ReadingCard key={item.id} item={item} />
        ))}
      </section>
      <section id={`${prefix}-channels`} className="reading-group">
        <h3>
          {t("Tanımlı kanallar ·")}
          {reading.channels.length}
        </h3>
        <p className="muted">
          {t(
            "İki etkin kapının birlikte oluşturduğu bağlantılar ve gözlem temaları.",
          )}
        </p>
        {reading.channels.length ? (
          reading.channels.map((item) => (
            <ReadingCard key={item.id} item={item} />
          ))
        ) : (
          <p className="reading-empty">
            {t(
              "Haritanda tanımlı kanal yok. Etkin kapıların aşağıda ayrı ayrı yorumlanır; bu bir eksiklik değildir.",
            )}
          </p>
        )}
      </section>
      <section id={`${prefix}-gates`} className="reading-group">
        <h3>
          {t("Etkin kapılar ·")}
          {reading.gates.length}
        </h3>
        <p className="muted">
          {t(
            "Her kapının konusu, gezegen ve çizgi dayanakları, tamamlanan veya açık kalan bağlantıları.",
          )}
        </p>
        {reading.gates.length ? (
          reading.gates.map((item) => <ReadingCard key={item.id} item={item} />)
        ) : (
          <p className="reading-empty">
            {t("Bu kayıtta yorumlanabilecek etkin kapı verisi bulunmuyor.")}
          </p>
        )}
      </section>
      <section id={`${prefix}-practice`} className="reading-group reading-week">
        <p className="eyebrow">{t("OKUMADAN GÖZLEME")}</p>
        <h3>{t("Yedi gün, küçük notlar.")}</h3>
        <p className="muted">
          {t("Kendini bir tanıma uydurmak yerine deneyimlerini karşılaştır.")}
        </p>
        <ol>
          {reading.practice.map((value, i) => (
            <li key={i}>
              <span className="reading-day" aria-hidden="true">
                {i + 1}
              </span>
              {value.replace(/^(?:\d\. gün|Day \d) · /, "")}
            </li>
          ))}
        </ol>
      </section>
      <details className="reading-sources">
        <summary>{t("Yorum yöntemi ve kaynaklar")}</summary>
        <p>
          {t(
            "Starmora'nın özgün Türkçe açıklamaları, hesaplanan kapı, çizgi, kanal ve merkez verilerinden sabit kurallarla seçilir. Yorum oluşturmak için doğum bilgisi dışarıya gönderilmez. Aynı harita ve yorum sürümü aynı metni üretir. Ücretli API veya yapay zekâ aboneliği gerekmez.",
          )}
        </p>
        <p>{t("Temel kavramları incelemek için:")}</p>
        <ul>
          {reading.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
        <small>
          {t("Yorum sürümü:")}
          {reading.version}
        </small>
      </details>
    </div>
  );
}
