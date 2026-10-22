# Paper & ink experiment

Run from the **Blog repository root**, not `prototype`:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/exp/. No installation or build is needed. Keep the server local; stop it with Ctrl+C.

The tuner reads both colors in each `light-dark()` token from `../prototype/styles.css` and embeds the real `../prototype/index.html` with its actual JavaScript templates, styles, fonts, content, and navigation. Choose Dark tokens or Light tokens; the iframe switches to that appearance while you tune. Each token shows the source value beside its current value. Move OKLCH lightness (0–100%), chroma (0–0.4), and hue (0–360°) sliders or enter values. Both tabs and archive panels update, including the article’s colored top edge. Preview All, Article, and About to compare the palette across the site. The narrow preview is 390px wide (or available width on smaller screens).

Values persist in this browser under `jons-log-oklch-v4`. Each Reset token button restores only that token for the selected palette. Reset all restores both palettes to the source defaults captured at page load; reload after changing source styles. Copy CSS or Download CSS preserves values outside the browser. Extreme chroma can fall outside a display’s gamut; the browser maps colors for display, while export retains your OKLCH values.

## Actual token mapping

| Use | Existing token |
| --- | --- |
| Use | Tokens |
| --- | --- |
| Page backgrounds | `--canvas`, `--sheet`, `--paper-all`, `--paper-document` |
| Format papers | `--paper-essay`, `--paper-note`, `--paper-crumb`, `--paper-poem` |
| Text and rules | `--ink`, `--muted`, `--rule`, `--accent` |
| Format hover colors | `--hover-essay`, `--hover-note`, `--hover-crumb`, `--hover-poem` |
| Text selection | `--selection-bg`, `--selection-ink` |

## Apply to the site

1. Copy or download the generated theme block.
2. Append it to `prototype/styles.css` or `src/styles/global.css`. It applies the selected values to both an explicit theme and matching System preference.
3. Reload the actual site and check all filters, article, About, and hover colors.

The tuner only sets inline custom properties inside its own embedded preview. It never writes site files. All experiment code is contained in `/exp`; existing site edits are preserved.
