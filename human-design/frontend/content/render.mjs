import { pages as base, sourceLinks } from "./pages.mjs";
import { extraPages, faq } from "./extra-pages.mjs";
import { readFileSync } from "node:fs";
export const pages = [...base, ...extraPages];
const editorial = JSON.parse(
  readFileSync(new URL("./editorial.json", import.meta.url), "utf8"),
);
export const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pair = (tr, en) => ({ tr, en });
const byId = (id) => pages.find((p) => p.id === id);
const text = (value, lang, tag = "span", attrs = "") =>
  `<${tag} data-tr="${esc(value.tr)}" data-en="${esc(value.en)}" ${attrs}>${esc(value[lang])}</${tag}>`;
const link = (id, lang, label, cls = "") => {
  const p = byId(id);
  return `<a class="${cls}" href="${p.path[lang]}" data-href-tr="${p.path.tr}" data-href-en="${p.path.en}">${text(label ?? p.heading, lang)}</a>`;
};
const logo = `<svg viewBox="96 94 1980 535" role="img" aria-label="Starmora" class="public-logo"><defs><filter id="brand-tone" color-interpolation-filters="sRGB"><feFlood flood-color="#967344"/><feComposite in2="SourceAlpha" operator="in"/></filter></defs><image href="/assets/starmora-wordmark.png" width="2172" height="724" filter="url(#brand-tone)"/></svg>`;
const visual = `<svg class="hero-graph" viewBox="0 0 350 520" role="img" aria-labelledby="visual-title"><title id="visual-title">BodyGraph</title><g class="graph-orbits"><ellipse cx="175" cy="260" rx="162" ry="218"/><ellipse cx="175" cy="260" rx="132" ry="247" transform="rotate(28 175 260)"/></g><g class="graph-links"><path d="M175 60V105M155 60V105M195 60V105M175 158V196M154 156V196M196 156V196M175 233V278M145 230L120 370M205 230L270 371M171 324V364M112 406L145 451M237 412L198 451M163 410V451M186 410V451M235 296L275 370M225 311L193 379M90 381L156 390"/></g><g class="graph-nodes"><path d="M175 13L137 73H213Z"/><path d="M137 106H213L175 171Z" class="sage"/><rect x="143" y="194" width="64" height="50" rx="6" class="sand"/><path d="M175 275L209 309L175 343L141 309Z" class="sage"/><path d="M222 292L245 319H209Z"/><path d="M82 351L117 409H47Z"/><rect x="147" y="367" width="56" height="52" rx="6" class="sand"/><path d="M293 345L256 409H329Z" class="sage"/><rect x="147" y="450" width="56" height="52" rx="6"/></g><g class="graph-stars"><path d="M51 77V107M36 92H66M278 202V226M266 214H290"/></g></svg>`;
function header(page, lang) {
  return `<a class="public-skip" href="#main">${text(pair("İçeriğe geç", "Skip to content"), lang)}</a><header class="public-header"><a href="${byId("home").path[lang]}" data-href-tr="/tr/" data-href-en="/en/" aria-label="Starmora">${logo}</a><nav data-aria-tr="Ana gezinme" data-aria-en="Main navigation" aria-label="${lang === "tr" ? "Ana gezinme" : "Main navigation"}">${link("basics", lang, pair("Human Design nedir?", "What is Human Design?"))}${link("reading", lang, pair("Keşif rehberi", "Explore the guide"))}${link("faq", lang, pair("Sorular", "Questions"))}</nav><div class="public-actions"><div class="public-languages" aria-label="Language"><a href="${page.path.tr}" data-switch-language="tr" lang="tr" hreflang="tr" aria-current="${lang === "tr" ? "page" : "false"}">TR</a><a href="${page.path.en}" data-switch-language="en" lang="en" hreflang="en" aria-current="${lang === "en" ? "page" : "false"}">EN</a></div><a class="public-button small" href="${byId("home").path[lang]}#start" data-href-tr="/tr/#start" data-href-en="/en/#start">${text(pair("Haritamı oluştur", "Create my chart"), lang)} <span aria-hidden="true">↗</span></a></div></header>`;
}
function footer(lang) {
  return `<footer class="public-footer"><div>${logo}${text(pair("Kendine biraz daha yaklaş.", "Get a little closer to yourself."), lang, "p")}</div><nav data-aria-tr="Alt bağlantılar" data-aria-en="Footer links" aria-label="${lang === "tr" ? "Alt bağlantılar" : "Footer links"}">${["about", "method", "contact", "privacy", "terms", "cookies"].map((id) => link(id, lang, pair({ about: "Hakkımızda", method: "Hesaplama yöntemi", contact: "İletişim", privacy: "Gizlilik", terms: "Koşullar", cookies: "Çerezler" }[id], { about: "About", method: "Calculation method", contact: "Contact", privacy: "Privacy", terms: "Terms", cookies: "Cookies" }[id]))).join("")}</nav><p class="public-footnote">© 2026 Starmora. ${text(pair("Human Design, spiritüel bir öz gözlem çerçevesidir.", "Human Design is a spiritual framework for reflection."), lang)}</p></footer>`;
}
const guides = (ids, lang) =>
  `<div class="guide-grid">${ids
    .map((id) => {
      const p = byId(id);
      return `<a href="${p.path[lang]}" data-href-tr="${p.path.tr}" data-href-en="${p.path.en}" class="guide-card">${text(p.heading, lang, "h3")}${text(p.description, lang, "p")}<span aria-hidden="true">↗</span></a>`;
    })
    .join("")}</div>`;
function home(lang) {
  return `<main id="main" tabindex="-1"><section class="public-hero"><div><p class="public-eyebrow">${text(pair("ÜCRETSİZ HARİTA · DETAYLI YORUM", "FREE CHART · DETAILED READING"), lang)}</p>${text(byId("home").heading, lang, "h1")}<p class="hero-description">${text(pair("Doğum bilgilerinle ücretsiz Human Design haritanı oluştur. Enerji tipini, karar verme yaklaşımını ve profilini detaylı yorumlarla keşfet.", "Create your free Human Design chart from your birth details. Explore your energy type, approach to decisions and profile with a detailed reading."), lang)}</p><div class="hero-cta"><a class="public-button" href="#start">${text(pair("Ücretsiz haritamı oluştur", "Create my free chart"), lang)} <span aria-hidden="true">↗</span></a>${link("basics", lang, pair("Önce Human Design’ı tanı", "Get to know Human Design"), "public-secondary")}</div><p class="hero-note">${text(pair("Kayıt gerekmez · Detaylı yorum · Türkçe & İngilizce", "No signup needed · Detailed reading · English & Turkish"), lang)}</p></div><div class="hero-art">${visual}<div class="visual-caption">${text(pair("BİR HARİTADAN DAHA FAZLASI", "MORE THAN A CHART"), lang)}<span>9 · 64 · 36</span></div></div></section><section class="public-section intro-section"><p class="public-eyebrow">${text(pair("KENDİNİ MERAK ET", "FOLLOW YOUR CURIOSITY"), lang)}</p>${text(pair("Bir etiket değil. Yeni sorular için bir başlangıç.", "A starting point for new questions."), lang, "h2")}<div class="feature-grid">${[
    [
      pair("Kendi ritmini fark et", "Notice your own rhythm"),
      pair(
        "Tip, strateji ve otoriteyi birlikte okuyarak günlük deneyimine yeni sorularla bak.",
        "Read type, strategy and authority together to bring new questions to everyday experience.",
      ),
    ],
    [
      pair("Bağlantıları anla", "Understand the connections"),
      pair(
        "Merkez, kapı ve kanalların yalnızca numaralarını değil, birbirleriyle ilişkisini keşfet.",
        "Explore how centers, gates and channels relate rather than only seeing their numbers.",
      ),
    ],
    [
      pair("Kendi deneyiminle karşılaştır", "Compare with your experience"),
      pair(
        "Detaylı yorumlar, gözlem soruları ve yedi günlük küçük bir pratikle başlayabilirsin.",
        "Begin with detailed readings, reflection questions and a small seven-day practice.",
      ),
    ],
  ]
    .map(
      ([h, p], i) =>
        `<article><span class="feature-number">0${i + 1}</span>${text(h, lang, "h3")}${text(p, lang, "p")}</article>`,
    )
    .join(
      "",
    )}</div></section><section class="public-section start-section" id="start"><div class="section-heading"><div><p class="public-eyebrow">${text(pair("DOĞDUĞUN AN, KEŞFİNİN BAŞLANGICI", "YOUR BIRTH MOMENT, YOUR STARTING POINT"), lang)}</p>${text(pair("Seninle başlayalım.", "Let’s start with you."), lang, "h2")}</div>${text(pair("Doğum bilgilerini gir. Haritan ve ayrıntılı yorumun burada açılsın.", "Enter your birth details. Your chart and detailed reading open right here."), lang, "p")}</div><div data-home-calculator><p>${text(pair("Harita formu yükleniyor…", "Loading the chart form…"), lang)}</p></div><noscript>${text(pair("Harita oluşturmak için JavaScript’i etkinleştir. Rehberler JavaScript olmadan okunabilir.", "Enable JavaScript to create a chart. The guides remain readable without JavaScript."), lang, "p")}</noscript></section><section class="public-section"><p class="public-eyebrow">${text(pair("İLK HARİTANDAN DAHA DERİNE", "GO BEYOND YOUR FIRST CHART"), lang)}</p><div class="section-heading">${text(pair("Merakın nereye götürüyor?", "Where does your curiosity lead?"), lang, "h2")}${link("reading", lang, pair("Rehberden başla →", "Start with the guide →"), "public-secondary")}</div>${guides(["basics", "types", "authority", "profiles", "centers", "gates", "channels", "definition", "method"], lang)}</section><section class="public-section home-faq"><p class="public-eyebrow">${text(pair("BAŞLAMADAN ÖNCE", "BEFORE YOU BEGIN"), lang)}</p>${text(pair("Biraz daha açıklık.", "A little more clarity."), lang, "h2")}<div>${[0, 1, 2, 6].map((i) => `<details><summary>${text(faq[i * 2], lang)}</summary>${text(faq[i * 2 + 1], lang, "p")}</details>`).join("")}</div>${link("faq", lang, pair("Tüm sorulara göz at →", "See all questions →"), "public-secondary")}</section><section class="public-bottom-cta">${text(pair("Haritanı keşfet. Sözü deneyimine bırak.", "Explore your chart. Let experience have a say."), lang, "h2")}<a class="public-button" href="#start">${text(pair("Ücretsiz başla", "Start for free"), lang)} ↗</a></section></main>`;
}
function themes(page, lang) {
  const kind = page.special;
  if (!kind) return "";
  let rows, title;
  if (kind === "profiles") {
    const profiles = [
      "1/3",
      "1/4",
      "2/4",
      "2/5",
      "3/5",
      "3/6",
      "4/6",
      "4/1",
      "5/1",
      "5/2",
      "6/2",
      "6/3",
    ];
    return `<section class="article-section"><h2>${lang === "tr" ? "Altı çizginin teması" : "Themes of the six lines"}</h2>${Object.entries(
      editorial.lineThemes[lang],
    )
      .map(
        ([key, v]) =>
          `<article class="theme-card"><h3>${key} · ${esc(v.title)}</h3><p>${esc(v.body)}</p><p>${esc(v.practice)}</p></article>`,
      )
      .join(
        "",
      )}<h2>${lang === "tr" ? "12 profil kombinasyonu" : "The 12 profile combinations"}</h2><div class="profile-grid">${profiles
      .map(
        (profile) =>
          `<div><strong>${profile}</strong><p>${profile
            .split("/")
            .map((n) => esc(editorial.lineThemes[lang][n].title))
            .join(" + ")}</p></div>`,
      )
      .join("")}</div></section>`;
  }
  const map = {
    types: "typeThemes",
    type: "typeThemes",
    authorities: "authorityThemes",
    centers: "centerThemes",
    gates: "gateThemes",
    channels: "channelThemes",
  }[kind];
  rows = Object.entries(editorial[map][lang]);
  if (kind === "type") rows = rows.filter(([key]) => key === page.typeName);
  title =
    lang === "tr"
      ? "Temalar ve gözlem önerileri"
      : "Themes and reflection prompts";
  return `<section class="article-section"><h2>${title}</h2><div class="theme-grid">${rows.map(([key, v]) => `<article class="theme-card" id="theme-${esc(key.toLowerCase().replaceAll(" ", "-"))}"><h3>${["gates", "channels"].includes(kind) ? esc(key) + " · " : ""}${esc(v.title)}</h3><p>${esc(v.body)}</p><p><strong>${lang === "tr" ? "Küçük bir pratik" : "A small practice"}:</strong> ${esc(v.practice)}</p><p class="reflection-question">${esc(v.question)}</p></article>`).join("")}</div></section>`;
}
function article(page, lang) {
  return `<main id="main" tabindex="-1" class="public-article"><nav class="breadcrumbs" aria-label="${lang === "tr" ? "İçerik yolu" : "Breadcrumbs"}">${link("home", lang, pair("Ana sayfa", "Home"))} <span aria-hidden="true">/</span> ${text(page.heading, lang)}</nav><header class="article-header"><p class="public-eyebrow">${page.kind === "legal" ? (lang === "tr" ? "HİZMET BİLGİLERİ" : "SERVICE INFORMATION") : "STARMORA · HUMAN DESIGN"}</p><h1>${esc(page.heading[lang])}</h1><p>${esc(page.description[lang])}</p><p class="article-date">${lang === "tr" ? "Starmora · Güncelleme: 7 Ekim 2026" : "Starmora · Updated: 7 October 2026"}</p></header><div class="article-layout"><article>${page.sections.map((s, i) => `<section class="article-section" id="section-${i}"><h2>${esc(s.heading[lang])}</h2>${s.paragraphs.map((p) => `<p>${esc(p[lang])}</p>`).join("")}</section>`).join("")}${themes(page, lang)}${page.id === "contact" ? '<p><a class="public-button" href="mailto:info@starmora.com">info@starmora.com ↗</a></p>' : ""}${
    page.kind !== "legal"
      ? `<section class="article-section sources"><h2>${lang === "tr" ? "Kaynaklar ve yaklaşım" : "Sources and approach"}</h2><p>${lang === "tr" ? "Özgün Starmora metinleri; geleneksel sistem kavramları için aşağıdaki kaynaklar incelenebilir." : "Original Starmora text. Consult these sources for traditional system concepts."}</p><ul>${(page.id ===
        "method"
          ? [
              {
                title: "Astronomy Engine · MIT",
                url: "https://github.com/cosinekitty/astronomy",
              },
              {
                title: "GeoNames · CC BY 4.0",
                url: "https://www.geonames.org/export/",
              },
            ]
          : sourceLinks
        )
          .map(
            (s) =>
              `<li><a href="${esc(s.url)}" rel="noopener noreferrer">${esc(s.title)}</a></li>`,
          )
          .join("")}</ul></section>`
      : ""
  }</article><aside class="article-aside"><p>${lang === "tr" ? "BU SAYFADA" : "ON THIS PAGE"}</p><nav aria-label="${lang === "tr" ? "Sayfa içindekiler" : "Page contents"}">${page.sections.map((s, i) => `<a href="#section-${i}">${esc(s.heading[lang])}</a>`).join("")}</nav><a class="public-button" href="${byId("home").path[lang]}#start">${lang === "tr" ? "Haritamı oluştur" : "Create my chart"} ↗</a></aside></div>${page.related?.length ? `<section class="public-section"><h2>${lang === "tr" ? "Keşfe devam et" : "Keep exploring"}</h2>${guides(page.related, lang)}</section>` : ""}</main>`;
}
export function schemaFor(page, lang) {
  const url = "https://starmora.com" + page.path[lang];
  const graph = [
    {
      "@type": "Organization",
      "@id": "https://starmora.com/#organization",
      name: "Starmora",
      url: "https://starmora.com",
      email: "info@starmora.com",
      logo: "https://starmora.com/assets/starmora-wordmark.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://starmora.com/#website",
      name: "Starmora",
      url: "https://starmora.com",
      inLanguage: ["tr", "en"],
      publisher: { "@id": "https://starmora.com/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": url + "#page",
      url,
      name: page.title[lang],
      description: page.description[lang],
      inLanguage: lang,
      isPartOf: { "@id": "https://starmora.com/#website" },
    },
  ];
  if (
    page.kind !== "home" &&
    page.kind !== "legal" &&
    !["contact", "about"].includes(page.id)
  )
    graph.push({
      "@type": "Article",
      headline: page.heading[lang],
      description: page.description[lang],
      inLanguage: lang,
      dateModified: "2026-10-07",
      datePublished: "2026-10-07",
      author: { "@id": "https://starmora.com/#organization" },
      publisher: { "@id": "https://starmora.com/#organization" },
      mainEntityOfPage: { "@id": url + "#page" },
      image: "https://starmora.com/og-starmora.png",
    });
  if (page.id !== "home")
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: lang === "tr" ? "Ana sayfa" : "Home",
          item: "https://starmora.com" + byId("home").path[lang],
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.heading[lang],
          item: url,
        },
      ],
    });
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  }).replaceAll("<", "\\u003c");
}
export function render(
  page,
  lang,
  { script = "/src/main.tsx", css = "" } = {},
) {
  const url = "https://starmora.com" + page.path[lang];
  const isHome = page.kind === "home";
  return `<!doctype html><html lang="${lang}" data-home-title-tr="${esc(byId("home").title.tr)}" data-home-title-en="${esc(byId("home").title.en)}" data-home-description-tr="${esc(byId("home").description.tr)}" data-home-description-en="${esc(byId("home").description.en)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(page.title[lang])}</title><meta name="description" content="${esc(page.description[lang])}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#f7f6f2"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="tr" href="https://starmora.com${page.path.tr}"><link rel="alternate" hreflang="en" href="https://starmora.com${page.path.en}"><link rel="alternate" hreflang="x-default" href="https://starmora.com${page.path.tr}"><meta property="og:type" content="${isHome ? "website" : "article"}"><meta property="og:site_name" content="Starmora"><meta property="og:title" content="${esc(page.title[lang])}"><meta property="og:description" content="${esc(page.description[lang])}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${lang === "tr" ? "tr_TR" : "en_US"}"><meta property="og:image" content="https://starmora.com/og-starmora.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(page.title[lang])}"><meta name="twitter:description" content="${esc(page.description[lang])}"><meta name="twitter:image" content="https://starmora.com/og-starmora.png"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/public.css">${isHome ? css : ""}<script id="structured-data" type="application/ld+json">${schemaFor(page, lang)}</script>${isHome ? `<script type="module" src="${script}"></script>` : ""}</head><body class="marketing">${header(page, lang)}${isHome ? home(lang) : article(page, lang)}${footer(lang)}</body></html>`;
}
export function appHtml(original, lang) {
  return original
    .replace('<html lang="tr">', `<html lang="${lang}">`)
    .replace(
      "<title>Starmora — Human Design</title>",
      `<title>${lang === "tr" ? "Haritalarım" : "My charts"} | Starmora</title><meta name="robots" content="noindex,nofollow"><meta name="description" content="${lang === "tr" ? "Kişisel Human Design haritalarını yönet." : "Manage your personal Human Design charts."}">`,
    )
    .replace("/favicon.ico", "/favicon.svg");
}
export function notFound(lang = "tr") {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>404 | Starmora</title><meta name="robots" content="noindex"><link rel="stylesheet" href="/public.css"></head><body class="marketing"><main class="public-article"><h1>${lang === "en" ? "This page could not be found." : "Bu sayfa bulunamadı."}</h1><p><a class="public-button" href="/${lang}/">${lang === "en" ? "Back to home" : "Ana sayfaya dön"} →</a></p></main></body></html>`;
}
