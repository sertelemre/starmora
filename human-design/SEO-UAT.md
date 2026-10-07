# Starmora: competitor research, SEO and UAT

Verified on 7 October 2026. This records implementation checks, not a claim of traffic leadership, official Human Design certification, zero defects, legal approval or guaranteed search ranking.

## Prominent sites inspected

| Site | Verified emphasis | Useful direction for Starmora |
| --- | --- | --- |
| [Jovian Archive](https://jovianarchive.com/pages/get-your-human-design-chart) | Source teachings, free chart entry, extensive subject guides | Explain the system and link distinct learning topics to a clear chart CTA |
| [myBodyGraph](https://www.mybodygraph.com/) | Promotional website leads to a separate account/chart application and learning library | Separate public discovery from personal chart management |
| [My Human Design](https://www.myhumandesign.com/) | Homepage chart form followed by explanatory type content and detailed-reading products | Keep a real form on the homepage, surrounded by explanatory content |
| [Human.Design](https://human.design/) | Chart access, educational system material and reports | Explain chart mechanics with dedicated center/channel guides |
| [BodyGraph](https://bodygraph.com/) | Tools for practitioners to embed chart and reading services | Treat the integration business as a different audience from the first-time visitor |

These examples were verified on their own websites. No independently audited visitor totals or comparable traffic ranking were obtained. Genetic Matrix was also considered, but direct retrieval returned 403; its current features were not used as verified evidence. Text, reviews and branded graphics from these sites were not copied.

## Public information architecture

22 topics, each with distinct Turkish and English URLs: **44 static public pages** plus two private chart workspaces. The homepage presents the product, practical uses, a real anonymous birth form, guide cards and questions. Users can begin without an account. Personal chart management uses `/tr/harita/` and `/en/chart/`.

Topics include Human Design basics; reading a chart; type comparison; Generator, Manifesting Generator, Projector, Manifestor and Reflector individually; authority/strategy; profiles; centers; all 64 gate themes; all 36 channel themes; definition; calculation method; FAQ; about; contact; privacy; terms; cookies.

Guide HTML is present in the initial response and does not require JavaScript. The React bundle loads on the home calculator and private workspace. Editorial catalogs are generated from the same Go dictionaries used for readings, with complete TR/EN coverage checks.

## Technical SEO implemented

- Unique page titles, descriptions and one H1 per generated public page.
- Self-referencing canonical on `https://starmora.com`, reciprocal TR/EN hreflang and Turkish x-default.
- Sitemap contains all 44 public language URLs, alternates and content update date; no chart IDs or birth data.
- Organization/WebSite/WebPage, suitable Article and BreadcrumbList JSON-LD. No invented ratings, review counts or FAQ rich-result promises.
- Visible FAQ content, internal related-topic navigation, accessible anchors and semantic headings.
- Open Graph/Twitter metadata and a 1200 × 630 social image using the supplied logo.
- Nginx root and legacy legal-page redirects; genuine 404 responses for unknown routes/assets.
- Private workspaces carry HTML noindex and HTTP X-Robots-Tag plus no-store. Robots allows these HTML pages to be fetched so crawlers can observe noindex; API is disallowed. Ownership checks protect chart endpoints.
- Local fonts, gzip, immutable caching only for hashed Vite assets, bounded API calls and no third-party tracking.
- CSP permits only self-hosted executable scripts and exact hashes for generated JSON-LD. No unsafe-inline or eval exception.

Primary implementation references: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions). These are technical guidelines, not ranking guarantees.

## Verification performed

| Check | Evidence/result |
| --- | --- |
| Frontend TypeScript/production build | Passed; 44 public pages and two private shells generated |
| Static SEO audit | Passed unique titles, H1, canonical/hreflang, JSON-LD/CSP hashes, 972 internal HTML links, application route literals and private sitemap exclusions |
| Production Docker/HTTP | Go, PostgreSQL and Nginx ran together; 44 public responses, real 404s, redirects, privacy headers and static asset access passed |
| Anonymous calculation | Real 2019-05-05 10:10 Europe/London chart created in browser in both development and production packages |
| Language switching | Name, date, time, selected city, same chart ID and result survived in-place EN/TR changes; country/date labels, reading content, export language and canonical updated |
| Detailed reading | Type, authority, profile, definition, nine centers, actual active channels/gates, evidence and seven-day practice displayed in English and Turkish |
| Account UI | Registration/login dialog, focus, password field, policy links and translated invalid-credential error inspected; disposable local fixture login succeeded |
| Guest ownership migration | Browser login moved the guest chart to the fixture account; saved-chart view showed it. Backend lifecycle/race tests also cover transfer, login/logout, ownership and deletion |
| Responsive UI | 320, 390, 768 and desktop 1280 layouts inspected; no horizontal overflow at checked widths |
| Keyboard interactions | City selection with arrows/Enter, missing selection validation, mobile menu Escape/focus restoration, native dialog and modal dismissal |
| Text contrast | Checked normal application text; channel/cross text and navigation count corrected. Not a certification or an exhaustive WCAG audit |
| Backend tests | `go test -race ./...` with a real isolated PostgreSQL test schema passed; `go vet ./...` passed |
| Translation tests | EN dictionaries complete, deterministic reading, stable section IDs, no chart mutation, language negotiation including q=0, localized API errors/export and invalid-language privacy headers passed |
| Dependency audit | npm audit: zero findings. govulncheck: zero affected imported packages/used symbols; one required-module warning in unused openpgp documented in VERIFICATION.md |

UAT fixes include city combobox semantics, modal busy states and focus, mobile navigation/inert restoration, password visibility, minimum mobile form text sizing, wrapping, translated dynamic warnings, guest/account messaging, the correct cookie route, accessible mobile account icon, channel text contrast and readable logo asset permissions in the Nginx image. The logo preserves the uploaded artwork's alpha shape through an SVG color filter.

Automated checks:

```sh
cd frontend
npm run build
npm run check:seo
node scripts/check-http.mjs http://127.0.0.1:5184
npm audit
cd ../backend
TEST_DATABASE_URL='postgres://user:password@127.0.0.1:5432/test_db?sslmode=disable' go test -race ./...
go vet ./...
go run golang.org/x/vuln/cmd/govulncheck@latest ./...
```

The test Docker project is disposable and separate from the development PostgreSQL cluster. Only fictional fixture names and dates were used. Browser test accounts are not production customer accounts. Cross-browser Safari/Firefox testing, assistive-technology certification and production field Core Web Vitals were not performed.

## Live launch requirements

The requested GitHub push does not deploy starmora.com or establish indexing. HTTPS/domain routing, live database/backup policy and `COOKIE_SECURE=true` must be configured for live service. Search Console ownership, sitemap submission and real-user performance/coverage monitoring require the live domain and its owner’s access.

Privacy, terms and cookie pages reflect the implemented service, user-provided operator **Pangaea** and **info@starmora.com**. Pangaea is absent from footer/main branding. Registered country/address/full legal identity were not supplied; confirm them and applicable jurisdiction requirements before legal publication. No analytics/advertising cookie is currently installed; do not add tracking without updating the policy and preference mechanism.

Email verification, automated password reset, self-service account deletion and distributed abuse limiting are not implemented. Account deletion requests currently go to the support address. Calculation boundaries and independent astronomy comparison limits are documented in [VERIFICATION.md](VERIFICATION.md); accurate astronomy does not scientifically validate personality interpretations.
