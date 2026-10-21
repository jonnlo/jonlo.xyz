# Architecture

Astro builds the site as static files. Page routes in `src/pages/` load
published records through `src/lib/entries.ts`; reusable archive, article and
document views live in `src/components/` and `src/layouts/`. The index is the
All journal, format routes filter it, concept paths combine with those filters,
and each published record receives a `/thought/<slug>/` page. Feed and sitemap
routes are generated from the same published collection.

Entries are Markdoc files in `src/content/entries/`. Astro validates their
frontmatter in `src/content.config.ts`; the local Keystatic editor writes those
same files. About uses the JSON singleton at `src/content/about.json`.
Now uses a dated JSON collection in `src/content/now/`; About shows its newest
published snapshot and `/now/` retains the published history. Field definitions and date precision rules are in
[CONTENT-MODEL.md](CONTENT-MODEL.md).

`astro.config.mjs` includes Keystatic only for `astro dev`. Production output is
static and has no editor/admin route. Set `SITE_URL` to the canonical domain
when building for a real deployment; this project has not been deployed.

The root-level `prototype/` is the visual comparison reference and runs
independently from Astro. The `/exp/` paper and ink tuner loads that prototype
through a local HTTP server. Keep both out of `public/`; only intentional site
assets belong there. The source stylesheet is `src/styles/global.css`, while
`dist/` is generated output that can be rebuilt.
