# Architecture

Astro builds the site as static files. Page routes in `src/pages/` load
published records through `src/lib/entries.ts`; reusable archive, article and
document views live in `src/components/` and `src/layouts/`. The index is the
All entries view, `/formats/<format>/` routes filter it, `/tags/<tag>/` paths
combine with those filters, and each published record receives an `/entries/<slug>/`
page. Feed and sitemap routes are generated from the same published collection.

Entries are Markdoc files in `src/content/entries/`. Astro validates their
frontmatter in `src/content.config.ts`; the local Keystatic editor writes those
same files. About uses the JSON singleton at `src/content/about.json`.
Now uses a dated JSON collection in `src/content/now/`; About shows its newest
published snapshot and `/now/` retains the published history. Shared tags live
in `src/content/tags/` and resolve the stable IDs stored in each entry's
`concepts` field for public labels and feed categories. Keystatic manages them
through the **Tags** collection. Field definitions and date precision rules
are in [CONTENT-MODEL.md](CONTENT-MODEL.md).

`astro.config.mjs` includes Keystatic only for `astro dev`. Production output is
static and has no editor/admin route. Set `SITE_URL` to the canonical domain
when building for a real deployment; this project has not been deployed.

The local Entries list hides Slug and initially sorts Entry date newest first.
`src/editor/entry-list-plugin.mjs` narrowly adapts Keystatic's built-in table
during Vite loading and dependency optimization. It preserves slug-based row
navigation, title search and the other collections. Upgrades that change those
integration points fail explicitly and require updating the adapter; the tests
check it against the installed package. Package files are never edited in place.

The root-level `prototype/` is the visual comparison reference and runs
independently from Astro. The `/exp/` paper and ink tuner loads that prototype
through a local HTTP server. Keep both out of `public/`; only intentional site
assets belong there. The source stylesheet is `src/styles/global.css`, while
`dist/` is generated output that can be rebuilt.
