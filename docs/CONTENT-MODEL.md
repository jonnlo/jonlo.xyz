# Content and writing

Entries live in `src/content/entries/*.mdoc`. Astro validates frontmatter through
`src/content.config.ts`; Keystatic edits the same files through
`keystatic.config.ts`. About uses the Markdoc singleton `src/content/about.mdoc`;
Now updates are separate JSON records in `src/content/now/`.

## Entry fields

| Field | Meaning |
| --- | --- |
| Filename | Stable public URL slug, exposed to Astro as `entry.id` |
| `name` | Required internal editorial name; Keystatic's slug field stores its name here and its URL in the filename |
| `title` | Display title; optional so crumbs can remain untitled |
| `date` | Required calendar date, stored as a quoted `YYYY-MM-DD` string |
| `lastEdited` | Automatic ISO timestamp set by a successful local editor save; displayed in Hong Kong time in the editor only |
| `timestamp` | Optional ISO timestamp with the recorded timezone offset |
| `form` | `essay`, `note`, or `crumb` |
| `concepts` | Stable tag IDs assigned to the entry. The stored key is retained for compatibility; display names come from the Tags registry. |
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
The editor provides only a time picker, using Hong Kong’s +08:00 when adding
a timestamp. Existing recorded offsets are preserved internally. On save, the time is combined with Entry date,
which is authoritative if an older timestamp had a conflicting date.
Clear time removes the optional value. An empty timestamp saved by Keystatic
is equivalent to an omitted timestamp.
Astro normalizes YAML Date objects from Keystatic's unquoted calendar dates
back to `YYYY-MM-DD` strings, so editor-created entries load like migrated ones.

The editor list labels `date` **Entry date** and shows **Last edited** separately.
Local Keystatic saves stamp `lastEdited` on the server as part of the saved
frontmatter. It is read-only in the editor, never displayed on the public site,
and never changes the entry date, archive order, or RSS publication date.
Existing entries show a dash until their next save; unknown past edit times are
not invented. Direct file edits outside Keystatic do not automatically stamp it.

## Tags

Tags are shared records in `src/content/tags/<stable-id>.json`, each storing
`{ "name": "Display name" }`. Keystatic exposes them as the **Tags**
collection; there is no Tag list singleton. Existing IDs, including their case
and spaces, are intentionally retained so archive URLs remain stable.

Entries keep the `concepts: string[]` field, but each value is now a tag ID.
The editor's searchable chip picker suggests registry records and can create a
shared tag immediately through the local API, even before the entry is saved.
The help text explains that saving the entry applies its assignments. Edit a
label in the Tags collection; public labels, chip labels, and feed categories
resolve from the registry, so a rename updates all of those displays while
IDs and URLs stay fixed.

The server rejects assignments to missing IDs. It also rejects renaming or
deleting a tag that is still used unless the affected entry assignments change
in the same save. Unused tags can be deleted normally. To consolidate tags,
reassign entries to the desired ID, then delete the unused old tag; there is no
merge interface. The suggestion and tag-creation API is available only during
local editing, never in production.

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

About has a separate `heading` and one rich-text `body` stored in
`src/content/about.mdoc`. Its singleton uses the full document editor with the default formatting tools,
including headings, links, lists, quotes, tables, images and code. The original paragraphs were joined
without changing their wording; the page keeps its existing reading layout.

In Keystatic, open **Now updates → Add** for each new snapshot. Give it an
update name (for example `2026-10-21`), a date, activities such as Reading /
Thinking / Working / Listening, and a Draft or Published status. Save it as
Published when ready. Add a new record to keep history; editing an existing
record changes that snapshot. Git remains the backup for corrections/deletions.

Each JSON snapshot has `name`, `date`, `status`, and
`items: { label: string, text: string }[]`. New records default to Draft.
Activity descriptions use a small rich-text editor: links, bold, italics,
paragraphs, and ordered/bullet lists. They are stored as inline Markdoc strings
in the same JSON `text` field, so earlier plain-text updates remain compatible.
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
