# Paper & ink experiment

Run from the **Blog repository root**, not `prototype`:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/exp/. No installation or build is needed. Keep the server local; stop it with Ctrl+C.

The tuner reads the current defaults from `../prototype/styles.css` and embeds the real `../prototype/index.html` with its actual JavaScript templates, styles, fonts, content, and navigation. Each token shows its original site color beside its current color for comparison. Move OKLCH lightness (0–100%), chroma (0–0.4), and hue (0–360°) sliders or enter values. Both tabs and archive panels update, including the article’s colored top edge. Preview All to inspect darker labels; preview Article and About to compare the shared neutral paper. The narrow preview is 390px wide (or available width on smaller screens).

Values persist in this browser under `jons-log-oklch-v1`. Each Reset token button restores only that token. Reset all rereads the defaults captured at page load; reload after changing source styles. Copy CSS or Download CSS preserves values outside the browser. Extreme chroma can fall outside a display’s gamut; the browser maps colors for display, while export retains your OKLCH values.

## Actual token mapping

| Use | Existing token |
| --- | --- |
| Gray site background | `--canvas` |
| All tab and archive paper | `--paper-all` |
| Essays tab and archive paper | `--paper-essay` |
| Notes tab and archive paper | `--paper-note` |
| Fragments tab and archive paper | `--paper-fragment` |
| Essay label in All + essay title hover | `--hover-essay` |
| Note label in All + note title hover | `--hover-note` |
| Line label in All + fragment title hover | `--hover-fragment` |
| Article and About sheet | `--paper-document` |

“Dark versions” here means the darker type labels, not a dark mode. All is an aggregate filter with no corresponding All type label. Fragment records are labeled “line” by the existing app. The three label colors begin as hexadecimal colors in the source; the tuner converts them to OKLCH. No unused poem token or separate dark theme is introduced.

## Apply to the site

1. Copy or download the generated `:root` block.
2. Append it to `prototype/styles.css` to override the earlier definitions, or replace the matching nine declarations in its opening `:root` block. Do not change the selector mappings further down the stylesheet.
3. Reload the actual site at http://127.0.0.1:8000/prototype/ and check all filters, article, About, and hover colors. Label tokens also affect their existing hover uses.

The tuner only sets inline custom properties inside its own embedded preview. It never writes site files. All experiment code is contained in `/exp`; existing site edits are preserved.
