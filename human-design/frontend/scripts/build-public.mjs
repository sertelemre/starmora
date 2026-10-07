import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  pages,
  render,
  appHtml,
  notFound,
  schemaFor,
  esc,
} from "../content/render.mjs";
const dist = new URL("../dist/", import.meta.url);
const original = await readFile(new URL("index.html", dist), "utf8");
const script = original.match(/<script[^>]+src="([^"]+)"/)[1];
const css = original.match(/<link[^>]+rel="stylesheet"[^>]*>/g)?.join("") ?? "";
const hashes = new Set();
async function put(path, value) {
  const url = new URL("." + path + "index.html", dist);
  await mkdir(new URL("./", url), { recursive: true });
  await writeFile(url, value);
}
for (const page of pages)
  for (const lang of ["tr", "en"]) {
    await put(page.path[lang], render(page, lang, { script, css }));
    hashes.add(
      "'sha256-" +
        createHash("sha256").update(schemaFor(page, lang)).digest("base64") +
        "'",
    );
  }
await put("/tr/harita/", appHtml(original, "tr"));
await put("/en/chart/", appHtml(original, "en"));
await writeFile(
  new URL("index.html", dist),
  '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/tr/"><link rel="canonical" href="https://starmora.com/tr/"><title>Starmora</title></head><body><a href="/tr/">Starmora</a></body></html>',
);
await writeFile(new URL("404.html", dist), notFound("tr"));
await writeFile(new URL("404-en.html", dist), notFound("en"));
const origin = "https://starmora.com";
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pages.flatMap((p) => ["tr", "en"].map((lang) => `<url><loc>${origin}${p.path[lang]}</loc><lastmod>2026-10-07</lastmod>${["tr", "en", "x-default"].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${origin}${p.path[l === "x-default" ? "tr" : l]}"/>`).join("")}</url>`)).join("")}</urlset>`;
await writeFile(new URL("sitemap.xml", dist), sitemap);
await writeFile(
  new URL("robots.txt", dist),
  "User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://starmora.com/sitemap.xml\n",
);
const policy = `default-src 'self'; script-src 'self' ${[...hashes].join(" ")}; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;
await writeFile(
  new URL("csp-header.conf", dist),
  `add_header Content-Security-Policy "${policy}" always;\n`,
);
console.log(
  `Generated ${pages.length * 2} public pages, 2 private workspaces, sitemap and CSP hashes.`,
);
