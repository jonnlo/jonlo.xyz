# Journal design direction

The journal gives passing observations the same standing as finished essays.
It presents one chronological archive, with dates in the margin and writing in
the foreground. The current visual authority is the standalone implementation
in `prototype/`; use it to compare appearance and behavior while working on
Astro.

## Visual system

The prototype uses bundled ABC Areal for display and interface text, ABC Areal
Mono for dates, and Crimson Text for reading. Its low-chroma paper colors,
spacing, responsive layout and interaction details are defined in
`prototype/styles.css`. `src/styles/global.css` is the Astro implementation.
Preserve their shared visual direction unless a redesign is requested.

The archive is a single chronological surface with All, Essays, Notes and Lines
filters. Concept links can combine with a format filter. Records remain
typographic and compact, without cards, shadows or decorative animation.
Articles retain their marginalia and place it in the reading flow on narrow
screens. About and Now are supporting pages within the same archive.

## Content rules

- Essays may show a title and excerpt; lines may be untitled. A date or precise
  timestamp must preserve the precision actually known.
- Keep timestamp offsets and seconds intact. The current known recording times
  are shown explicitly in UTC+08:00.
- All current entry, About and Now copy is illustrative sample content, not the
  author's original writing. See [the content model](docs/CONTENT-MODEL.md) for
  provenance and editing guidance.
- The reference prototype is served from the repository root. Do not put it in
  `public/` as part of a production deployment.
