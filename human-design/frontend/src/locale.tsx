import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { english } from "./translations";

export type Locale = "tr" | "en";
export const initialLocale = (): Locale =>
  location.pathname.startsWith("/en/") ? "en" : "tr";
let requestLocale: Locale = initialLocale();
export const getRequestLocale = () => requestLocale;
const turkish = Object.fromEntries(
  Object.entries(english).map(([key, value]) => [value, key]),
);
export function translate(source: string, locale: Locale = requestLocale) {
  if (locale === "tr") return turkish[source] ?? source;
  return (
    english[source] ?? english[source.replace(/\s+/g, " ").trim()] ?? source
  );
}
const LocaleContext = createContext({
  locale: initialLocale(),
  setLocale: (_locale: Locale) => {},
  t: (value: string) => value,
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, update] = useState<Locale>(initialLocale);
  function setLocale(next: Locale) {
    requestLocale = next;
    update(next);
    const home = !!document.querySelector("[data-home-calculator]");
    history.replaceState(
      null,
      "",
      (home ? `/${next}/` : next === "en" ? "/en/chart/" : "/tr/harita/") +
        location.hash,
    );
  }
  useEffect(() => {
    document.documentElement.lang = locale;
    const home = !!document.querySelector("[data-home-calculator]");
    document.title = home
      ? document.documentElement.dataset[
          locale === "en" ? "homeTitleEn" : "homeTitleTr"
        ] || "Starmora"
      : locale === "en"
        ? "Human Design Chart & Detailed Reading | Starmora"
        : "Human Design Haritası ve Detaylı Yorum | Starmora";
    if (home) {
      const description =
        document.documentElement.dataset[
          locale === "en" ? "homeDescriptionEn" : "homeDescriptionTr"
        ] || "";
      const url = `https://starmora.com/${locale}/`;
      document
        .querySelector('link[rel="canonical"]')
        ?.setAttribute("href", url);
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", description);
      for (const name of ["og:title", "twitter:title"])
        document
          .querySelector(`meta[property="${name}"],meta[name="${name}"]`)
          ?.setAttribute("content", document.title);
      for (const name of ["og:description", "twitter:description"])
        document
          .querySelector(`meta[property="${name}"],meta[name="${name}"]`)
          ?.setAttribute("content", description);
      document
        .querySelector('meta[property="og:url"]')
        ?.setAttribute("content", url);
      document
        .querySelector('meta[property="og:locale"]')
        ?.setAttribute("content", locale === "en" ? "en_US" : "tr_TR");
      const structured = document.getElementById("structured-data");
      if (structured?.textContent) {
        const data = JSON.parse(structured.textContent);
        const page = data["@graph"].find(
          (item: Record<string, unknown>) => item["@type"] === "WebPage",
        );
        Object.assign(page, {
          "@id": url + "#page",
          url,
          name: document.title,
          description,
          inLanguage: locale,
        });
        structured.textContent = JSON.stringify(data);
      }
    }
    document
      .querySelectorAll<HTMLElement>("[data-tr][data-en]")
      .forEach((element) => {
        element.textContent = element.dataset[locale] || "";
      });
    document
      .querySelectorAll<HTMLElement>("[data-aria-tr][data-aria-en]")
      .forEach((element) =>
        element.setAttribute(
          "aria-label",
          element.dataset[locale === "en" ? "ariaEn" : "ariaTr"] || "",
        ),
      );
    document
      .querySelectorAll<HTMLAnchorElement>("[data-href-tr][data-href-en]")
      .forEach((element) => {
        element.href =
          element.dataset[locale === "en" ? "hrefEn" : "hrefTr"] ||
          element.href;
      });
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>("[data-switch-language]"),
    ];
    const change = (event: Event) => {
      event.preventDefault();
      const next = (event.currentTarget as HTMLAnchorElement).dataset
        .switchLanguage;
      if (next === "en" || next === "tr") setLocale(next);
    };
    links.forEach((link) => {
      link.setAttribute(
        "aria-current",
        link.dataset.switchLanguage === locale ? "page" : "false",
      );
      link.addEventListener("click", change);
    });
    return () =>
      links.forEach((link) => link.removeEventListener("click", change));
  }, [locale]);
  return (
    <LocaleContext
      value={{ locale, setLocale, t: (value) => translate(value, locale) }}
    >
      {children}
    </LocaleContext>
  );
}
export const useLocale = () => useContext(LocaleContext);

export function localizeWarning(warning: string, locale: Locale) {
  const tr = " bir kapı/çizgi sınırına yakın.";
  const en = " is close to a gate/line boundary.";
  const label = warning.split(warning.includes(tr) ? tr : en)[0];
  if (!warning.includes(tr) && !warning.includes(en))
    return translate(warning, locale);
  if (locale === "en")
    return (
      label.replace("Kişilik", "Personality").replace("Tasarım", "Design") +
      " is close to a gate/line boundary. Birth-time precision and differences between ephemerides may change this activation."
    );
  const planets: Record<string, string> = {
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
  const localized = Object.entries(planets).reduce(
    (value, [en, tr]) => value.replace(en, tr),
    label.replace("Personality", "Kişilik").replace("Design", "Tasarım"),
  );
  return (
    localized +
    " bir kapı/çizgi sınırına yakın. Doğum saati hassasiyeti ve efemeris farkları bu aktivasyonu değiştirebilir."
  );
}
