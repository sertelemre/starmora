import { useLocale, localizeWarning } from "./locale";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Fingerprint,
  Layers3,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import BodyGraph from "./BodyGraph";
import ReadingView from "./ReadingView";
import BrandLogo from "./BrandLogo";
import { api, preview } from "./types";
import type { Birth, Chart, Location, Result, Session, User } from "./types";
type Page = "create" | "saved" | "learn";
const labels: Record<string, string> = {
  "Manifesting Generator": "Manifesting Generator",
  Generator: "Generator",
  Projector: "Projector",
  Manifestor: "Manifestor",
  Reflector: "Reflector",
  "To Respond": "Yanıt vermek",
  "Wait for the Invitation": "Daveti beklemek",
  "To Inform": "Bilgilendirmek",
  "Wait a Lunar Cycle": "Ay döngüsünü beklemek",
  "Emotional - Solar Plexus": "Duygusal · Solar Pleksus",
  Sacral: "Sakral",
  Splenic: "Dalak",
  "Split Definition": "Bölünmüş tanım",
  "Single Definition": "Tekli tanım",
  "Triple Split Definition": "Üçlü bölünmüş tanım",
  "Quadruple Split Definition": "Dörtlü bölünmüş tanım",
  "No Definition": "Tanım yok",
  "Ego Manifested": "Ego · Manifested",
  "Ego Projected": "Ego · Projected",
  "Self Projected": "Kendini ifade etme",
  "Sounding Board": "Çevresel · Sesli değerlendirme",
  Lunar: "Ay döngüsü",
};
const countryNames = {
  tr: new Intl.DisplayNames(["tr"], { type: "region" }),
  en: new Intl.DisplayNames(["en"], { type: "region" }),
};
const placeLabel = (v: string, lang: "tr" | "en") => {
  const parts = v.split(", ");
  const code = parts.at(-1) || "";
  return /^[A-Z]{2}$/.test(code)
    ? [...parts.slice(0, -1), countryNames[lang].of(code) || code].join(", ")
    : v;
};
const tr = (v: string) => labels[v] || v;
const planetLabels: Record<string, string> = {
  Sun: "Güneş",
  Earth: "Dünya",
  Moon: "Ay",
  Mercury: "Merkür",
  Venus: "Venüs",
  Mars: "Mars",
  Jupiter: "Jüpiter",
  Saturn: "Satürn",
  Uranus: "Uranüs",
  Neptune: "Neptün",
  Pluto: "Plüton",
  "North Node": "Kuzey Ay Düğümü",
  "South Node": "Güney Ay Düğümü",
};
const formatDate = (date: string, lang: "tr" | "en") => {
  const value = new Date(date + "T12:00:00Z");
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(value);
};
export function Auth({
  mode,
  close,
  onSuccess,
}: {
  mode: "login" | "register";
  close: () => void;
  onSuccess: (user: User) => void;
}) {
  const { t, locale } = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState(mode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => dialog.current?.close();
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget);
    try {
      const r = await api<{
        user: User;
      }>(`/auth/${tab}`, {
        method: "POST",
        body: JSON.stringify({
          name: d.get("name") || "",
          email: d.get("email"),
          password: d.get("password"),
        }),
      });
      onSuccess(r.user);
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="auth-dialog"
      aria-labelledby="auth-title"
      aria-describedby="auth-description"
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current && !busy) close();
      }}
    >
      <button
        className="icon-button modal-close"
        onClick={close}
        disabled={busy}
        aria-label={t("Kapat")}
      >
        <X size={20} />
      </button>
      <div className="auth-symbol">
        <Fingerprint size={30} />
      </div>
      <p className="eyebrow">{t("KENDİNE BİR ALAN AÇ")}</p>
      <h2 id="auth-title">
        {tab === "register"
          ? t("Keşfin burada devam etsin.")
          : t("Yeniden hoş geldin.")}
      </h2>
      <p className="muted" id="auth-description">
        {t("Haritalarını hesabında sakla, istediğin cihazdan keşfet.")}
      </p>
      <div className="auth-tabs">
        <button
          className={tab === "login" ? "active" : ""}
          disabled={busy}
          aria-pressed={tab === "login"}
          onClick={() => {
            setTab("login");
            setError("");
          }}
        >
          {t("Giriş yap")}
        </button>
        <button
          className={tab === "register" ? "active" : ""}
          disabled={busy}
          aria-pressed={tab === "register"}
          onClick={() => {
            setTab("register");
            setError("");
          }}
        >
          {t("Kayıt ol")}
        </button>
      </div>
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          {tab === "register" && (
            <label>
              {t("Adın")}
              <input
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                autoFocus
                required
              />
            </label>
          )}
          <label>
            {t("E-posta")}
            <input
              name="email"
              type="email"
              autoComplete="email"
              autoFocus={tab === "login"}
              maxLength={254}
              required
            />
          </label>
          <label>
            {t("Şifre")}
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  tab === "register" ? "new-password" : "current-password"
                }
                minLength={tab === "register" ? 10 : 1}
                maxLength={72}
                required
              />
              <button
                type="button"
                className="icon-button password-toggle"
                aria-label={
                  showPassword ? t("Şifreyi gizle") : t("Şifreyi göster")
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <small>
              {tab === "register" ? t("En az 10 karakter kullan.") : " "}
            </small>
          </label>
          {error && (
            <p role="alert" className="error">
              {t(error)}
            </p>
          )}
          <button className="button dark full" disabled={busy}>
            {busy ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <ArrowRight size={17} />
            )}{" "}
            {tab === "register" ? t("Hesabımı oluştur") : t("Giriş yap")}
          </button>
        </fieldset>
      </form>
      <p className="auth-policy-links">
        <a
          href={locale === "en" ? "/en/terms/" : "/tr/kullanim-kosullari/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Kullanım koşulları")}
        </a>
        {" · "}
        <a
          href={locale === "en" ? "/en/privacy/" : "/tr/gizlilik/"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Gizlilik")}
        </a>
      </p>
      <p className="auth-note">
        {t(
          "Kayıt olmadan da harita oluşturabilirsin. Bu tarayıcıdaki misafir haritaların giriş yaptığında hesabına eklenir.",
        )}
      </p>
    </dialog>
  );
}
export function BirthForm({
  ready,
  onCreated,
  openRegister,
  signedIn = false,
  provider = "starmora-local",
}: {
  ready: boolean;
  onCreated: (c: Chart) => void;
  openRegister: () => void;
  signedIn?: boolean;
  provider?: string;
}) {
  const { t, locale } = useLocale();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Location | null>(null);
  const [options, setOptions] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [manual, setManual] = useState(false);
  const [manualZone, setManualZone] = useState("Europe/Istanbul");
  const [searched, setSearched] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState(-1);
  const placeInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selected) setQuery(placeLabel(selected.value, locale));
  }, [locale, selected]);
  useEffect(() => {
    if (locationOpen && activeLocation >= 0)
      document
        .getElementById(`location-${activeLocation}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [activeLocation, locationOpen]);
  function choosePlace(location: Location) {
    setSelected(location);
    setQuery(placeLabel(location.value, locale));
    setOptions([]);
    setLocationOpen(false);
    setError("");
    placeInput.current?.focus();
  }
  useEffect(() => {
    if (!ready || selected || query.length < 2 || manual) {
      setOptions([]);
      return;
    }
    const abort = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setLocationError("");
      try {
        const results = await api<Location[]>(
          "/locations?q=" + encodeURIComponent(query),
          {
            signal: abort.signal,
          },
        );
        if (!abort.signal.aborted) {
          setOptions(results);
          setSearched(true);
          setActiveLocation(-1);
        }
      } catch (e) {
        if (!abort.signal.aborted) setLocationError((e as Error).message);
      } finally {
        if (!abort.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      abort.abort();
      setSearching(false);
    };
  }, [query, selected, ready, manual]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    const location = manual ? { value: query, timezone: manualZone } : selected;
    if (!location) {
      setError(t("Arama sonuçlarından doğum yerini seç."));
      placeInput.current?.focus();
      return;
    }
    setBusy(true);
    const birth: Birth = {
      date,
      time,
      place: location.value,
      timezone: location.timezone,
    };
    try {
      onCreated(
        await api<Chart>("/charts", {
          method: "POST",
          body: JSON.stringify({ name, birth }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card birth-card">
      <div className="card-heading">
        <span className="step">01</span>
        <div>
          <h2>{t("Seninle başlayalım")}</h2>
          <p>{t("Doğduğun an, keşfinin başlangıcı.")}</p>
        </div>
      </div>
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          <label>
            {t("Adın veya harita adı")}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("Sana nasıl seslenelim?")}
              minLength={2}
              maxLength={100}
              required
            />
          </label>
          <div className="form-row">
            <label>
              {t("Doğum tarihi")}
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="1900-01-01"
                max={new Date().toLocaleDateString("sv-SE")}
                required
              />
            </label>
            <label>
              {t("Doğum saati")}
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="field-help">
            <CircleHelp size={14} />
            <span>
              {t("Kesin doğum saati, haritanın hesaplanması için gerekli.")}
            </span>
          </div>
          <div
            className="location-combobox"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null))
                setLocationOpen(false);
            }}
          >
            <label>
              {t("Doğum yeri")}
              <div className="location-field">
                <input
                  ref={placeInput}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(null);
                    setSearched(false);
                    setLocationError("");
                    setOptions([]);
                    setLocationOpen(true);
                    setActiveLocation(-1);
                  }}
                  onFocus={() => setLocationOpen(true)}
                  onKeyDown={(e) => {
                    if (manual) return;
                    if (e.key === "Escape") {
                      setLocationOpen(false);
                      return;
                    }
                    if (
                      options.length &&
                      (e.key === "ArrowDown" || e.key === "ArrowUp")
                    ) {
                      e.preventDefault();
                      setLocationOpen(true);
                      setActiveLocation((index) =>
                        e.key === "ArrowDown"
                          ? (index + 1) % options.length
                          : index <= 0
                            ? options.length - 1
                            : index - 1,
                      );
                    }
                    if (
                      e.key === "Enter" &&
                      locationOpen &&
                      activeLocation >= 0 &&
                      options[activeLocation]
                    ) {
                      e.preventDefault();
                      choosePlace(options[activeLocation]);
                    }
                  }}
                  placeholder={
                    manual
                      ? t("Doğduğun şehir veya ilçe")
                      : t("Şehir ara · ör. İstanbul")
                  }
                  maxLength={100}
                  minLength={2}
                  role={manual ? undefined : "combobox"}
                  aria-autocomplete={manual ? undefined : "list"}
                  aria-expanded={
                    manual ? undefined : locationOpen && options.length > 0
                  }
                  aria-controls={
                    !manual && locationOpen && options.length
                      ? "locations"
                      : undefined
                  }
                  aria-activedescendant={
                    !manual && locationOpen && activeLocation >= 0
                      ? `location-${activeLocation}`
                      : undefined
                  }
                  aria-describedby="location-feedback"
                  autoComplete="off"
                  required
                />
                {searching && <LoaderCircle size={16} className="spin" />}
              </div>
            </label>
            {locationOpen && options.length > 0 && (
              <ul
                id="locations"
                className="location-options"
                role="listbox"
                aria-label={t("Doğum yeri sonuçları")}
              >
                {options.map((l, i) => (
                  <li key={l.value + i} role="presentation">
                    <button
                      id={`location-${i}`}
                      type="button"
                      role="option"
                      aria-selected={activeLocation === i}
                      tabIndex={-1}
                      onClick={() => choosePlace(l)}
                    >
                      {placeLabel(l.value, locale)}
                      <small>{l.timezone}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div
            id="location-feedback"
            className="location-feedback"
            role="status"
            aria-live="polite"
          >
            {searching
              ? t("Şehirler aranıyor…")
              : !manual &&
                  !selected &&
                  searched &&
                  !options.length &&
                  !locationError
                ? t(
                    "Sonuç bulunamadı. Şehir adını değiştir veya elle giriş yap.",
                  )
                : selected
                  ? `${locale === "en" ? "Selected" : "Seçildi"}: ${placeLabel(selected.value, locale)} · ${selected.timezone}`
                  : ""}
          </div>
          {selected && (
            <div className="selected-place">
              <Check size={14} />
              {selected.timezone}
            </div>
          )}
          <button
            type="button"
            className="text-link manual-toggle"
            onClick={() => {
              setManual(!manual);
              setSelected(null);
              setOptions([]);
              setQuery("");
              setLocationError("");
              setSearched(false);
            }}
          >
            {manual
              ? t("Şehir aramasına dön")
              : t("Şehrim listede yok · elle gir")}
          </button>
          {manual && (
            <label>
              {t("Saat dilimi")}
              <input
                value={manualZone}
                onChange={(e) => setManualZone(e.target.value)}
                placeholder={t("Örn. Europe/Istanbul")}
                list="timezones"
                maxLength={100}
                required
              />
              <datalist id="timezones">
                {[
                  "Europe/Istanbul",
                  "Europe/London",
                  "Europe/Berlin",
                  "Europe/Paris",
                  "America/New_York",
                  "America/Los_Angeles",
                  "Asia/Dubai",
                  "Asia/Tokyo",
                  "Australia/Sydney",
                  "UTC",
                ].map((z) => (
                  <option key={z} value={z} />
                ))}
              </datalist>
              <small className="timezone-help">
                {t(
                  "Doğum yerinin IANA saat dilimini kullan. Geçmiş yaz saati kuralları tarihe göre uygulanır.",
                )}
              </small>
            </label>
          )}
          {locationError && (
            <p role="alert" className="error">
              {t(locationError)}
            </p>
          )}
          <p className="location-credit">
            {t("Şehir verisi:")}{" "}
            <a
              href="https://www.geonames.org/"
              target="_blank"
              rel="noreferrer"
            >
              GeoNames
            </a>{" "}
            {t("· geçmiş saat dilimi kurallarıyla.")}
          </p>
          <button
            className="button dark full calculate"
            disabled={busy || !ready}
          >
            {busy ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Sparkles size={17} />
            )}{" "}
            {busy ? t("Haritan hazırlanıyor…") : t("Haritamı oluştur")}
            {!busy && <ArrowRight size={17} />}
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {!ready && (
            <p className="notice">
              {t(
                "Hesaplama servisine henüz bağlanamadık. Sayfayı yenileyip tekrar dene.",
              )}
            </p>
          )}
        </fieldset>
      </form>
      <p className="privacy-note">
        {t(
          provider.startsWith("starmora-local")
            ? "Hesaplama Starmora sunucusunda yapılır. Haritanı silerek kayıtlı doğum bilgilerini de kaldırabilirsin."
            : "Hesaplama için doğum bilgileri BodyGraph sağlayıcısına gönderilir. Haritanı silerek Starmora’daki kaydını kaldırabilirsin.",
        )}
      </p>
      <div className="guest-note">
        <UserRound size={18} />
        <div>
          <strong>
            {t(
              signedIn ? "Haritaların hesabına bağlı." : "Kayıt zorunlu değil.",
            )}
          </strong>
          <p>
            {signedIn ? (
              t("Haritalarını hesabında sakla, istediğin cihazdan keşfet.")
            ) : (
              <>
                {t("Misafir haritaların bu tarayıcıda erişilebilir.")}{" "}
                <button className="text-link" onClick={openRegister}>
                  {t("Hesap aç")}
                </button>
                {t(", diğer cihazlarından da ulaş.")}
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
export function ChartView({ chart }: { chart: Chart | null }) {
  const { t, locale } = useLocale();
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (chart) {
      setTab("overview");
      section.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
      heading.current?.focus({ preventScroll: true });
    }
  }, [chart?.id]);
  const [tab, setTab] = useState<"overview" | "activations" | "reading">(
    "overview",
  );
  const r: Result = chart?.result || preview;
  return (
    <section className="card result-card" ref={section}>
      <div className="result-heading">
        <div>
          <p className="eyebrow">
            {chart ? t("KİŞİSEL HARİTAN") : t("HARİTANA İLK BAKIŞ")}
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {chart
              ? `${chart.name} · Human Design`
              : t("Her tasarım, ayrı bir hikâye.")}
          </h2>
        </div>
        {chart ? (
          <a
            className="icon-button"
            href={`/api/charts/${chart.id}/export?lang=${locale}`}
            download
            aria-label={t("Haritayı JSON olarak indir")}
          >
            <ArrowDownToLine size={18} />
          </a>
        ) : (
          <span className="badge">{t("Örnek harita")}</span>
        )}
      </div>
      {!chart && (
        <p className="preview-note">
          {t(
            "Bu, arayüzü keşfetmen için sabit bir örnek. Doğum bilgilerini temsil etmez.",
          )}
        </p>
      )}
      {chart && (
        <p className="preview-note">
          {formatDate(chart.birth.date, locale)} · {chart.birth.time} ·{" "}
          {placeLabel(chart.birth.place, locale)}
          <br />
          {chart.birth.timezone} ·{" "}
          {chart.provider.startsWith("starmora-local")
            ? t("Starmora yerel hesaplama")
            : t("Bodygraph hesaplaması")}
        </p>
      )}
      {!!r.warnings?.length && (
        <details className="calculation-details">
          <summary>
            {t("Hesaplama hassasiyeti ·")} {r.warnings.length} {t("sınır notu")}
          </summary>
          {r.warnings.map((warning, i) => (
            <p key={i}>{localizeWarning(warning, locale)}</p>
          ))}
        </details>
      )}
      <div className="result-tabs">
        <button
          onClick={() => setTab("overview")}
          className={tab === "overview" ? "active" : ""}
          aria-pressed={tab === "overview"}
        >
          {t("Genel bakış")}
        </button>
        <button
          onClick={() => setTab("activations")}
          className={tab === "activations" ? "active" : ""}
          aria-pressed={tab === "activations"}
        >
          {t("Gezegen aktivasyonları")}
        </button>
        {chart && (
          <button
            onClick={() => setTab("reading")}
            className={tab === "reading" ? "active" : ""}
            aria-pressed={tab === "reading"}
          >
            {t("Detaylı yorum")}
          </button>
        )}
      </div>
      {tab === "overview" ? (
        <div className="result-body">
          <div className="diagram">
            <div className="diagram-label">
              BODYGRAPH <span>{t("9 MERKEZ")}</span>
            </div>
            <BodyGraph result={r} />
            <div className="legend">
              <span>
                <i className="defined" />
                {t("Tanımlı")}
              </span>
              <span>
                <i />
                {t("Tanımsız")}
              </span>
            </div>
          </div>
          <div className="insights">
            <div className="type-block">
              <span className="tiny-label">{t("ENERJİ TİPİ")}</span>
              <h3>{r.type}</h3>
              <p>
                {t(
                  "Haritandaki merkez ve bağlantıların oluşturduğu temel tip.",
                )}
              </p>
            </div>
            <dl>
              {[
                [t("Strateji"), t(tr(r.strategy))],
                [t("İçsel otorite"), t(tr(r.authority))],
                [t("Profil"), r.profile],
                [t("Tanım"), t(tr(r.definition))],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt>{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
            {r.cross && (
              <div className="cross">
                <span className="tiny-label">{t("ENKARNASYON ÇAPRAZI")}</span>
                <p>{r.cross}</p>
              </div>
            )}
            <div className="gate-section">
              <span className="tiny-label">
                {t("AKTİF KAPILAR ·")}
                {r.gates.length}
              </span>
              <div className="gate-pills">
                {r.gates.map((g) => (
                  <span key={g}>{g}</span>
                ))}
              </div>
            </div>
            <div className="channel-section">
              <span className="tiny-label">
                {t("TANIMLI KANALLAR ·")}
                {r.channels.length}
              </span>
              <p>
                {r.channels.length
                  ? r.channels.join(" · ")
                  : t("Tanımlı kanal yok")}
              </p>
            </div>
          </div>
        </div>
      ) : tab === "reading" && chart ? (
        <ReadingView key={chart.id} chartId={chart.id} />
      ) : (
        <div className="activation-tables">
          {(
            [
              [t("Kişilik"), r.personality],
              [t("Tasarım"), r.design],
            ] as const
          ).map(([title, data]) => (
            <div key={title}>
              <h3>{title}</h3>
              <table>
                <thead>
                  <tr>
                    <th>{t("Gezegen")}</th>
                    <th>{t("Kapı")}</th>
                    <th>{t("Çizgi")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data).map(([planet, a]) => (
                    <tr key={planet}>
                      <td>
                        {locale === "en"
                          ? planet
                          : planetLabels[planet] || planet}
                      </td>
                      <td>{a.gate}</td>
                      <td>{a.line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      <div className="result-footer">
        <Fingerprint size={17} />
        <span>
          {tab === "reading"
            ? t("Haritan ve detaylı yorumun JSON indirmesine dahildir.")
            : tab === "activations"
              ? t(
                  "Kişilik doğum anını, tasarım Güneş'in 88° geride olduğu anı gösterir.",
                )
              : t("Merkezlere dokun, tasarımın katmanlarını keşfet.")}
        </span>
      </div>
    </section>
  );
}
export default function App() {
  const { t, locale, setLocale } = useLocale();
  const [session, setSession] = useState<Session | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [page, setPage] = useState<Page>(() =>
    location.hash === "#charts" ? "saved" : "create",
  );
  const [chart, setChart] = useState<Chart | null>(null);
  const [auth, setAuth] = useState<"login" | "register" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileClose = useRef<HTMLButtonElement>(null);
  const previousMenu = useRef(false);
  const pageHeading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 801px)");
    const closeOnDesktop = () => {
      if (wide.matches) setMobile(false);
    };
    wide.addEventListener("change", closeOnDesktop);
    return () => wide.removeEventListener("change", closeOnDesktop);
  }, []);
  useEffect(() => {
    if (mobile) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      mobileClose.current?.focus();
      previousMenu.current = true;
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    if (previousMenu.current) {
      menuButton.current?.focus();
      previousMenu.current = false;
    }
  }, [mobile]);
  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const s = await api<Session>("/session");
      setSession(s);
      const items = await api<Chart[]>("/charts");
      setCharts(items);
      updateCursor(items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  function updateCursor(items: Chart[]) {
    const last = items.at(-1);
    setNextPage(
      items.length === 100 && last
        ? "?" +
            new URLSearchParams({
              before: last.createdAt,
              beforeId: last.id,
            }).toString()
        : null,
    );
  }
  async function loadMore() {
    if (!nextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const items = await api<Chart[]>("/charts" + nextPage);
      setCharts((old) => [
        ...old,
        ...items.filter((c) => !old.some((v) => v.id === c.id)),
      ]);
      updateCursor(items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api("/auth/logout", { method: "POST" });
      setChart(null);
      setCharts([]);
      setSession(null);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    setBusy(true);
    try {
      await api("/charts/" + id, { method: "DELETE" });
      setCharts((c) => c.filter((v) => v.id !== id));
      if (chart?.id === id) setChart(null);
      setDeleting(null);
      setNotice(t("Harita ve kayıtlı doğum bilgileri silindi."));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function navigate(p: Page) {
    setPage(p);
    setMobile(false);
    history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    pageHeading.current?.focus({ preventScroll: true });
  }, [page]);
  return (
    <div className="app-shell">
      <aside
        id="main-navigation"
        className={`sidebar ${mobile ? "mobile-open" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") setMobile(false);
        }}
      >
        <button
          className="icon-button mobile-close"
          ref={mobileClose}
          aria-label={t("Menüyü kapat")}
          onClick={() => setMobile(false)}
        >
          <X size={19} />
        </button>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("create");
          }}
        >
          <BrandLogo />
        </a>
        <div className="workspace-label">{t("KENDİNİ KEŞFET")}</div>
        <nav aria-label={t("Ana menü")}>
          {(
            [
              ["create", Fingerprint, "Human Design"],
              ["saved", Layers3, t("Haritalarım")],
              ["learn", Compass, t("Keşif rehberi")],
            ] as const
          ).map(([p, Icon, label]) => (
            <button
              key={p}
              className={page === p ? "nav-item active" : "nav-item"}
              aria-current={page === p ? "page" : undefined}
              onClick={() => navigate(p)}
            >
              <Icon size={19} />
              {label}
              {p === "saved" && (
                <span className="nav-count">{charts.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-callout">
            <span>✧</span>
            <p>
              {t("Kendine giden yol,")}
              <br />
              {t("kendini dinlemekle başlar.")}
            </p>
            <small>{t("HER TASARIM BENZERSİZDİR")}</small>
          </div>
          <div className="account">
            <div className="avatar">
              {session?.user ? (
                session.user.name[0].toUpperCase()
              ) : (
                <UserRound size={18} />
              )}
            </div>
            <div>
              <strong>{session?.user?.name || t("Misafir gezgin")}</strong>
              <small>
                {session?.user
                  ? t("Kişisel hesabın")
                  : t("Keşfetmek için kayıt gerekmez")}
              </small>
            </div>
            {session?.user ? (
              <button
                className="icon-button"
                disabled={busy}
                onClick={logout}
                aria-label={t("Çıkış yap")}
              >
                <LogOut size={17} />
              </button>
            ) : (
              <button
                className="icon-button"
                onClick={() => setAuth("login")}
                aria-label={t("Giriş yap")}
              >
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="nav-backdrop"
          aria-label={t("Menüyü kapat")}
          tabIndex={-1}
          onClick={() => setMobile(false)}
        />
      )}
      <main inert={mobile}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              ref={menuButton}
              aria-expanded={mobile}
              aria-controls="main-navigation"
              onClick={() => setMobile(!mobile)}
              aria-label={t("Menüyü aç")}
            >
              <Menu size={20} />
            </button>
            <a
              className="mobile-brand-link"
              href="#"
              aria-label={t("Starmora ana sayfa")}
              onClick={(e) => {
                e.preventDefault();
                navigate("create");
              }}
            >
              <BrandLogo className="mobile-brand" />
            </a>
            <span className="crumb-root">{t("Keşfet")}</span>
            <ChevronRight className="crumb-arrow" size={14} />
            <span>
              {page === "saved"
                ? t("Haritalarım")
                : page === "learn"
                  ? t("Keşif rehberi")
                  : "Human Design"}
            </span>
          </div>
          <div className="top-actions">
            <div
              className="locale-switch"
              aria-label={locale === "en" ? "Language" : "Dil"}
            >
              {(["tr", "en"] as const).map((language) => (
                <button
                  key={language}
                  onClick={() => setLocale(language)}
                  aria-pressed={locale === language}
                  aria-label={language === "en" ? "English" : "Türkçe"}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="guest-chip">
              <span className="status-dot" />
              {session?.user ? t("Hesabına bağlı") : t("Misafir erişimi")}
            </span>
            {!session?.user && (
              <button
                className="button small"
                aria-label={t("Hesap oluştur")}
                onClick={() => setAuth("register")}
              >
                <span className="account-action-label">
                  {t("Hesap oluştur")}
                </span>
                <UserRound size={16} />
              </button>
            )}
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">{t("BİR KEŞİF, BİNLERCE OLASILIK")}</p>
              <h1 ref={pageHeading} tabIndex={-1}>
                {page === "saved"
                  ? t("Hikâyelerini biriktir.")
                  : page === "learn"
                    ? t("Tasarımının dilini öğren.")
                    : t("Kendine biraz daha yaklaş.")}
              </h1>
              <p>
                {page === "saved"
                  ? t("Sana ve merak ettiklerine ait haritalar, tek bir yerde.")
                  : page === "learn"
                    ? t(
                        "Human Design dünyasına sakin ve meraklı bir başlangıç.",
                      )
                    : t("Doğduğun andan yola çık, sana özgü tasarımı keşfet.")}
              </p>
            </div>
            <span className="heading-mark" aria-hidden="true">
              ✳
            </span>
          </div>
          {error && (
            <div role="alert" className="error global-error">
              {error}
              <button className="text-link" onClick={() => void refresh()}>
                {t("Tekrar dene")}
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="success-note">
              {t(notice)}
              <button
                className="icon-button"
                aria-label={t("Bildirimi kapat")}
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {loading && (
            <div role="status" className="loading-note">
              <LoaderCircle className="spin" size={16} />
              {t("Alanını hazırlıyoruz…")}
            </div>
          )}
          {page === "create" && (
            <>
              <div className="intro-strip">
                <div className="intro-icon">
                  <Sparkles size={18} />
                </div>
                <p>
                  <strong>{t("Bir haritadan daha fazlası.")}</strong>
                  {t(
                    "Tipin, stratejin ve karar verme yaklaşımın için yeni bir bakış açısı.",
                  )}
                </p>
                <span>HUMAN DESIGN</span>
              </div>
              <div className="workspace-grid">
                <BirthForm
                  signedIn={!!session?.user}
                  ready={!!session?.providerReady}
                  provider={session?.provider}
                  onCreated={(c) => {
                    setChart(c);
                    setCharts((old) => [c, ...old]);
                    setError("");
                  }}
                  openRegister={() => setAuth("register")}
                />
                <ChartView chart={chart} />
              </div>
            </>
          )}
          {page === "saved" && (
            <>
              <div className="saved-toolbar">
                <p>
                  {session?.user
                    ? t("Haritaların hesabına bağlı.")
                    : t(
                        "Misafir haritaların yalnızca bu tarayıcı oturumunda görünür.",
                      )}
                </p>
                <button
                  className="button dark"
                  onClick={() => {
                    setChart(null);
                    navigate("create");
                  }}
                >
                  <Plus size={16} />
                  {t("Yeni harita")}
                </button>
              </div>
              {loading ? null : charts.length === 0 ? (
                <div className="empty card">
                  <Layers3 size={34} />
                  <h2>{t("İlk hikâyene yer aç.")}</h2>
                  <p>{t("Oluşturduğun haritaları burada bulacaksın.")}</p>
                  <button className="button" onClick={() => navigate("create")}>
                    {t("Harita oluştur")}
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="saved-grid">
                  {charts.map((c) => (
                    <article key={c.id} className="card saved-card">
                      <div className="saved-card-top">
                        <span className="saved-icon">
                          <Fingerprint size={23} />
                        </span>
                        <button
                          className="icon-button"
                          onClick={() => setDeleting(c.id)}
                          aria-label={`${t("Haritayı sil")}: ${c.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h2>{c.name}</h2>
                      <p>
                        {formatDate(c.birth.date, locale)} ·{" "}
                        {placeLabel(c.birth.place, locale)}
                      </p>
                      <span className="badge">{c.result.type}</span>
                      <div className="saved-card-bottom">
                        <span>
                          {t("Profil")}
                          {c.result.profile}
                        </span>
                        <button
                          className="text-link"
                          onClick={() => {
                            setChart(c);
                            navigate("create");
                          }}
                        >
                          {t("Haritayı aç")}
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {nextPage && (
                <button
                  className="button load-more"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                >
                  {loadingMore
                    ? t("Yükleniyor…")
                    : t("Daha fazla harita yükle")}
                </button>
              )}
            </>
          )}
          {page === "learn" && (
            <div className="learn-grid">
              {[
                [
                  "01",
                  "Generator",
                  t(
                    "Sakral merkezi tanımlı olan temel tip. Sistemde stratejisi yaşamın getirdiklerine yanıt vermektir.",
                  ),
                ],
                [
                  "02",
                  "Manifesting Generator",
                  t(
                    "Generator ailesinin bir alt tipi. Tanımlı sakral merkezi ve motor merkezden boğaza bağlantısı bulunur.",
                  ),
                ],
                [
                  "03",
                  "Projector",
                  t(
                    "Sakral merkezi tanımsızdır ve motor merkezden boğaza bağlantısı yoktur. Sistemde tanınma ve davet temalarıyla anlatılır.",
                  ),
                ],
                [
                  "04",
                  "Manifestor",
                  t(
                    "Sakral merkezi tanımsızdır; bir motor merkezden boğaza bağlantısı vardır. Stratejisi bilgilendirmek olarak tanımlanır.",
                  ),
                ],
                [
                  "05",
                  "Reflector",
                  t(
                    "Dokuz merkezin tamamı tanımsızdır. Sistemde önemli kararlar için bir Ay döngüsü gözlemleme yaklaşımı anlatılır.",
                  ),
                ],
              ].map(([n, t, d]) => (
                <article className="card learn-card" key={n}>
                  <span className="step">{n}</span>
                  <h2>{t}</h2>
                  <p>{d}</p>
                </article>
              ))}
              <article className="card learn-card source-card">
                <Compass size={25} />
                <h2>{t("Merakla yaklaş.")}</h2>
                <p>
                  {t(
                    "Human Design spiritüel bir kendini keşfetme çerçevesidir. Harita hesaplamasının tutarlılığı, kişilik yorumlarının bilimsel olarak doğrulandığı anlamına gelmez.",
                  )}
                </p>
                <a
                  className="text-link"
                  href="https://jovianarchive.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Kaynak öğretileri incele")}
                  <ArrowRight size={15} />
                </a>
              </article>
            </div>
          )}
          <footer className="page-footer">
            <span>{t("STARMORA · KENDİNE AİT BİR KEŞİF")}</span>
            <nav
              aria-label={locale === "en" ? "Site links" : "Site bağlantıları"}
            >
              <a href={`/${locale}/`}>{t("Ana sayfa")}</a>
              <a href={locale === "en" ? "/en/privacy/" : "/tr/gizlilik/"}>
                {t("Gizlilik")}
              </a>
              <a
                href={
                  locale === "en" ? "/en/terms/" : "/tr/kullanim-kosullari/"
                }
              >
                {t("Kullanım koşulları")}
              </a>
              <a href={locale === "en" ? "/en/cookies/" : "/tr/cerezler/"}>
                {t("Çerez politikası")}
              </a>
            </nav>
            <p>{t("Yorumlar, kendini gözlemlemek için bir başlangıçtır.")}</p>
          </footer>
        </div>
      </main>
      {auth && (
        <Auth
          mode={auth}
          close={() => setAuth(null)}
          onSuccess={(u) => {
            setSession((s) => (s ? { ...s, user: u } : null));
            setNotice(
              t("Giriş tamamlandı. Misafir haritaların hesabına eklendi."),
            );
            void refresh();
          }}
        />
      )}
      {deleting && (
        <DeleteDialog
          busy={busy}
          close={() => setDeleting(null)}
          confirm={() => void remove(deleting)}
        />
      )}
    </div>
  );
}
function DeleteDialog({
  busy,
  close,
  confirm,
}: {
  busy: boolean;
  close: () => void;
  confirm: () => void;
}) {
  const { t } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="auth-dialog delete-dialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else close();
      }}
    >
      <h2 id="delete-title">{t("Harita silinsin mi?")}</h2>
      <p id="delete-description">
        {t(
          "Harita ve kayıtlı doğum bilgileri kalıcı olarak silinir. Bu işlem geri alınamaz.",
        )}
      </p>
      <div className="delete-actions">
        <button className="button" disabled={busy} onClick={close} autoFocus>
          {t("Vazgeç")}
        </button>
        <button className="button dark" disabled={busy} onClick={confirm}>
          {busy ? t("Siliniyor…") : t("Haritayı sil")}
        </button>
      </div>
    </dialog>
  );
}
