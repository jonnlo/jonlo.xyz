# a home for thoughts

A local, typography-led HTML blog prototype. See DESIGN.md for the art direction and content rules. Open `dist/index.html` directly, or serve `dist` with a static HTTP server. No build or dependencies are required. The two typefaces load from Google Fonts; system serif and sans-serif fallbacks work offline.

Includes a mixed journal of full fragments and essay excerpts, with exact recorded timestamps on new sample fragments, plus concept and format views of one archive; article layouts with marginalia; About and Now pages. URLs use hashes so the prototype works from a file or static server. The RSS file is a clearly labeled sample, not a production feed.

All article bodies, About and Now text are illustrative prototype copy, not the author's original writing. Titles and concepts draw on the supplied brief.

## Later Astro + Keystatic port

- `dist/styles.css`: shared tokens, 12-column layout, fluid typography, 4-column mobile layout.
- `dist/index.html`: shared document shell.
- `dist/app.js`: example content records and view templates. Move records to Keystatic collections and templates to Astro components/routes.
- Suggested content fields: slug, title, date, form, concepts, body, optional marginalia. Derive related entries from shared concepts.
- Replace hash routes with real URLs and generate the feed from published content.

The UI deliberately has no cards, hero, engagement metadata, shadows, or decorative animation. On smaller screens, dates stack with titles and margin notes move into the reading flow.
