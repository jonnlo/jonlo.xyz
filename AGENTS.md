# Repository guidance

- Preserve the existing journal UI and visual direction unless the user asks
  for a redesign. Use the standalone `prototype/` as the visual reference when
  checking changes to the Astro site.
- Keep entry and singleton fields aligned between Astro validation and
  Keystatic schemas. See [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md) before
  changing content structure or date/timestamp handling.
- Keystatic is a local editor. Keep it available in development only; static
  production output must not expose an admin/editor route.
- Run the relevant project checks for code or schema changes (`npm run check`,
  `npm test`, and/or `npm run build`). Do not install packages unless the task
  requires it.
- Keep `prototype/` and `exp/` at the repository root. Do not publish the
  reference prototype by copying it into `public/`.
- Treat `dist/` as generated, disposable output. The global stylesheet source
  is `src/styles/global.css`; do not edit a generated copy in `dist/`.
