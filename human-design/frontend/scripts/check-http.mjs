import assert from "node:assert/strict";
import { pages } from "../content/render.mjs";
const base = process.argv[2] || "http://127.0.0.1:5184";
for (const p of pages)
  for (const lang of ["tr", "en"]) {
    const response = await fetch(base + p.path[lang]);
    assert.equal(response.status, 200, p.path[lang]);
    assert(response.headers.get("content-security-policy"));
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    const html = await response.text();
    assert(html.includes(`https://starmora.com${p.path[lang]}`));
    assert(!html.split("<footer")[1].includes("Pangaea"));
  }
for (const path of [
  "/en/missing-page/",
  "/tr/olmayan-sayfa/",
  "/no-such-page",
  "/assets/missing.js",
])
  assert.equal((await fetch(base + path)).status, 404, `Soft 404: ${path}`);
for (const path of ["/en/chart/", "/tr/harita/"]) {
  const r = await fetch(base + path);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert(r.headers.get("content-security-policy"));
}
const root = await fetch(base + "/", { redirect: "manual" });
assert.equal(root.status, 301);
assert(root.headers.get("location").endsWith("/tr/"));
for (const [from, to] of [
  ["/privacy.html", "/tr/gizlilik/"],
  ["/terms.html", "/tr/kullanim-kosullari/"],
]) {
  const r = await fetch(base + from, { redirect: "manual" });
  assert.equal(r.status, 301);
  assert(r.headers.get("location").endsWith(to));
}
for (const path of [
  "/assets/starmora-wordmark.png",
  "/assets/dm-sans-latin.woff2",
  "/og-starmora.png",
  "/favicon.svg",
  "/public.css",
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, `Unreadable asset ${path}`);
  assert((await response.arrayBuffer()).byteLength > 100);
}
const health = await fetch(base + "/api/health?lang=en");
assert.equal(health.status, 200);
assert.equal((await health.json()).status, "ok");
assert.equal(health.headers.get("cache-control"), "no-store");
assert.equal(health.headers.get("content-language"), "en");
console.log(
  `PASS: ${pages.length * 2} public HTTP pages, security headers, private exclusions, redirects, real 404s and API health.`,
);
