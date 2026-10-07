# GeoNames city index

`cities.tsv` is derived from https://download.geonames.org/export/dump/cities15000.zip, retrieved 2026-10-07. Source: [GeoNames](https://www.geonames.org/).

License: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). GeoNames permits commercial use with attribution. Dataset is provided without accuracy, completeness or timeliness warranties.

Changes: selected name, ISO country code and IANA timezone columns; sorted by population; omitted all other columns. The Go loader skips unknown IANA zones and deduplicates search results. Small towns may not appear in this population-based extract. Users can enter a manual birthplace and timezone.
