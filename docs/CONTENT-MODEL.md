# Content and writing

Entries live in `src/content/entries/*.mdoc`. Astro validates frontmatter through
`src/content.config.ts`; Keystatic edits the same files through
`keystatic.config.ts`. About uses the JSON singleton `src/content/about.json`;
Now updates are separate JSON records in `src/content/now/`.

## Entry fields

| Field | Meaning |
| --- | --- |
| Filename | Stable public URL slug, exposed to Astro as `entry.id` |
| `name` | Required internal editorial name; Keystatic's slug field stores its name here and its URL in the filename |
| `title` | Display title; optional so lines can remain untitled |
| `date` | Required calendar date, stored as a quoted `YYYY-MM-DD` string |
| `timestamp` | Optional ISO timestamp with the recorded timezone offset |
| `form` | `essay`, `note`, or `fragment` (displayed as “line”) |
| `concepts` | List of concept labels; spelling and case are preserved |
| `summary` | Optional journal excerpt; migrated essays use their first paragraph |
| `status` | `draft` or `published`; new entries default to draft |
| `sample` | Marks illustrative prototype content; new entries default to false |
| Body | Markdoc content after frontmatter; editable as rich text |

Query with `getCollection('entries', ({ data }) => data.status === 'published')`.
The resulting type is `CollectionEntry<'entries'>`. Use `entry.id` in routes and
`await render(entry)` from `astro:content` for its `Content` component. Do not
render the editorial `name` as the public URL. A display fallback can use
`entry.data.title || entry.data.name`.

Date-only entries retain date precision. No timestamp was fabricated during
migration; the two known timestamps keep their exact `+08:00` offset and seconds.
An empty timestamp saved by Keystatic is equivalent to an omitted timestamp.

## Marginalia

Insert **In the margin** from the Keystatic body editor. Its Markdoc form is:

```markdoc
{% marginNote %}

A note connected to the preceding paragraph.

{% /marginNote %}
```

`markdoc.config.mjs` renders it with `MarginNote.astro`, producing an
`aside.margin-note` at the content position with the prototype label
“01 / In the margin”. Article CSS controls desktop placement and mobile flow.
The wrapper supports ordinary rich text and preserves the order of the writing.

## About and Now

About has `heading` and `paragraphs: string[]`. Its singleton edits that source.

In Keystatic, open **Now updates → Add** for each new snapshot. Give it an
update name (for example `2026-10-21`), a date, activities such as Reading /
Thinking / Working / Listening, and a Draft or Published status. Save it as
Published when ready. Add a new record to keep history; editing an existing
record changes that snapshot. Git remains the backup for corrections/deletions.

Each JSON snapshot has `name`, `date`, `status`, and
`items: { label: string, text: string }[]`. New records default to Draft.
About displays the newest published snapshot. `/now/` lists every published
snapshot, newest first, with stable links such as `/now/#update-2026-09-10`.
Drafts stay out of both views. Same-date records sort by record ID descending;
use distinct names/IDs if saving multiple updates on the same day.
The original September 10, 2026 snapshot was preserved without changing its text.

## Sample provenance

All ten entries were migrated from `prototype/app.js` without rewriting the
writing, concepts, original dates, precise timestamps, headings, or marginalia.
All ten are marked `sample: true` and `status: published` for visual comparison,
including records that lacked an explicit sample property in the prototype.
They are illustrative design content, not an assertion that they are the owner's
authored or publication-ready writing. About and Now also preserve prototype
copy. Review or replace these examples before publishing a real site.

Keystatic currently uses local storage: saving updates files in this checkout.
GitHub publishing and hosted authentication are separate deployment decisions.

Migration validation checked exact prototype parity for all ten entries. The
Keystatic Reader API reads all entries with resolved bodies and the About/Now
singleton. Both marginalia entries also passed the editor's in-memory
parse/serialize/parse roundtrip with identical rich-text documents.

References: [Astro content collections](https://docs.astro.build/en/guides/content-collections/),
[Astro Markdoc integration](https://docs.astro.build/en/guides/integrations-guide/markdoc/),
[Keystatic content components](https://keystatic.com/docs/content-components), and
[Keystatic slug field](https://keystatic.com/docs/fields/slug).
