import { readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
import { pages, schemaFor } from "../content/render.mjs";
import { createHash } from "node:crypto";
const root = new URL("../dist/", import.meta.url),
  titles = new Set(),
  paths = new Set(pages.flatMap((p) => Object.values(p.path))),
  csp = await readFile(new URL("csp-header.conf", root), "utf8");
paths.add("/tr/harita/");
paths.add("/en/chart/");
let links = 0;
for (const p of pages)
  for (const lang of ["tr", "en"]) {
    const html = await readFile(
      new URL("." + p.path[lang] + "index.html", root),
      "utf8",
    );
    assert(html.includes(`<html lang="${lang}"`));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert(!titles.has(title), `Duplicate ${title}`);
    titles.add(title);
    assert(
      html.includes(
        `rel="canonical" href="https://starmora.com${p.path[lang]}"`,
      ),
    );
    for (const alternate of ["tr", "en"])
      assert(
        html.includes(
          `hreflang="${alternate}" href="https://starmora.com${p.path[alternate]}"`,
        ),
      );
    assert(!html.includes("noindex"));
    assert(!html.includes("Papricode"));
    assert(!html.includes("b47c069e"));
    assert(!/<footer[\s\S]*?Pangaea[\s\S]*?<\/footer>/.test(html));
    const schema = html.match(
      /<script id="structured-data" type="application\/ld\+json">(.*?)<\/script>/s,
    )[1];
    assert.deepEqual(JSON.parse(schema), JSON.parse(schemaFor(p, lang)));
    const hash = createHash("sha256").update(schema).digest("base64");
    assert(csp.includes(hash));
    for (const match of html.matchAll(/\bhref="(\/[^"\s]*)"/g)) {
      const dest = match[1].split("#")[0];
      if (!dest) continue;
      if (
        dest.startsWith("/assets/") ||
        dest.endsWith(".css") ||
        dest.endsWith(".svg")
      )
        await access(new URL("." + dest, root));
      else assert(paths.has(dest), `Broken link ${p.path[lang]} -> ${dest}`);
      links++;
    }
    assert(p.description[lang].length > 50);
  }
for (const [path, lang] of [
  ["/tr/harita/", "tr"],
  ["/en/chart/", "en"],
]) {
  const html = await readFile(new URL("." + path + "index.html", root), "utf8");
  assert(html.includes("noindex,nofollow"));
  assert(html.includes(`<html lang="${lang}">`));
}
const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length * 2);
assert(!sitemap.includes("/harita/"));
assert(!sitemap.includes("/chart/"));
assert(!sitemap.includes("/api/"));
for (const file of ["App.tsx", "HomeCalculator.tsx"]) {
  const source = await readFile(new URL("../src/" + file, root), "utf8");
  for (const match of source.matchAll(/["'](\/(?:tr|en)\/[^"'\s]*)["']/g)) {
    const path = match[1].split("#")[0];
    assert(paths.has(path), `Invalid application link in ${file}: ${path}`);
  }
}
await access(new URL("og-starmora.png", root));
console.log(
  `PASS: ${pages.length * 2} public pages; unique titles, H1, canonical/hreflang, JSON-LD/CSP, ${links} internal links, private exclusions and social image.`,
);
