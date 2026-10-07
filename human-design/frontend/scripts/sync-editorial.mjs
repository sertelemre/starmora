import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const files = [
  "reading.go",
  "reading_themes.go",
  "reading_en.go",
  "reading_en_themes.go",
];
let source = "";
for (const name of files)
  source +=
    (await readFile(
      new URL(`../../backend/internal/app/${name}`, import.meta.url),
      "utf8",
    )) + "\n";
const catalog = {};
for (const name of [
  "gateThemes",
  "channelThemes",
  "typeThemes",
  "authorityThemes",
  "lineThemes",
  "centerThemes",
]) {
  for (const [lang, map] of [
    ["tr", name],
    ["en", `english${name[0].toUpperCase()}${name.slice(1)}`],
  ]) {
    const block = source.match(
      new RegExp(`var ${map} = map\\[[^\\]]+\\]theme\\{([\\s\\S]*?)\\n\\}`),
    );
    if (!block) throw Error(`Missing ${map}`);
    const entries = {};
    const strings = '"(?:[^"\\\\]|\\\\.)*"';
    const pattern = new RegExp(
      `(${strings}|\\d+):\\s*\\{(${strings}),\\s*(${strings}),\\s*(${strings}),\\s*(${strings})\\}`,
      "g",
    );
    for (const row of block[1].matchAll(pattern)) {
      const key = row[1].startsWith('"') ? JSON.parse(row[1]) : row[1];
      entries[key] = {
        title: JSON.parse(row[2]),
        body: JSON.parse(row[3]),
        practice: JSON.parse(row[4]),
        question: JSON.parse(row[5]),
      };
    }
    (catalog[name] ??= {})[lang] = entries;
  }
}
for (const [key, size] of [
  ["gateThemes", 64],
  ["channelThemes", 36],
  ["typeThemes", 5],
  ["authorityThemes", 8],
  ["lineThemes", 6],
  ["centerThemes", 9],
])
  for (const lang of ["tr", "en"])
    if (Object.keys(catalog[key][lang]).length !== size)
      throw Error(`Incomplete ${lang} ${key}`);
await writeFile(
  new URL("content/editorial.json", root),
  JSON.stringify(catalog, null, 2) + "\n",
);
await writeFile(
  new URL("src/api-errors.en.json", root),
  await readFile(
    new URL("../../backend/internal/app/errors.en.json", import.meta.url),
  ),
);
