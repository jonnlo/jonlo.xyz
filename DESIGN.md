# Journal design direction

A personal journal where a passing observation has the same standing as a finished essay. One chronological stream, with time in the margin and writing in the foreground.

## Typography and layout

- Source Serif 4 for prose and titles; Inter for navigation and dates.
- Near-white #fafaf8, charcoal #242522, muted #686a65, rules #dedfd9, oxblood #743e39 on interaction.
- Outer page: 1080px maximum including desktop padding. Stream: 164px timestamp margin, 36px gap, up to 620px text.
- Journal title: 58px desktop / 42px mobile. Essay titles: 32px. Fragments: 23px. Article prose: 21px with 1.75 line height.
- Thin rules separate entries. No cards, illustrations, shadows, or decorative animation.
- On mobile, timestamps move above the writing; 24px page gutters retain breathing room.

## Content rules

- Essays display a title and excerpt, linking to the full reading view.
- Fragments display their full text without requiring a title. Their timestamp is a permalink.
- New timestamped records retain ISO 8601 seconds and timezone. Display the recorded time explicitly in UTC+08:00; do not silently reinterpret it in the visitor's timezone.
- Historical records with dates only remain date-only. Never imply unknown recording precision.
- Existing concept/format archives, About, Now, and sample RSS remain available.

## Prototype boundary

All writing is illustrative. This is a local reading prototype, not an authoring or publishing system. Recording new thoughts currently means adding content records; a future editor should capture the creation instant automatically and preserve it independently from later edits.


## Current visual system

The fixed visual system uses Instrument Sans for display and interface type, Source Serif 4 for reading text, and low-chroma institutional paper stocks: grey canvas, neutral All sheet, celadon essays, buff notes, and dusty salmon fragments. No simulated grain or ornamental shapes are added.

Homepage filters isolate fragments, notes, and essays.

## Unified journal archive

The site uses one browsing surface rather than separate Journal and Index destinations. All is the chronological journal; Essays, Notes, and Fragments filter that same rich reading view. Concepts remain visible as metadata and can become interactive when the archive is large enough to justify another navigation layer.

Folder tabs provide the institutional control layer while the records retain a stable catalogue geometry without an explicit column-heading row. All aligns date, title and filing, and format as columns, while filtered format tabs omit the redundant format column. All expands each record to expose the writing—an essay excerpt or the full short format. Format tabs use their assigned paper stock and compact records to support scanning. Color therefore belongs to the filing system rather than the reading surface. The site canvas and article pages remain neutral. Years and dedicated concept filters should be introduced only when the content gives them useful distinctions to reveal.

Every record presents concepts as an unlabeled typographic line beneath the title. In All, Format occupies a dedicated catalogue column; filtered tabs communicate the selected format at panel level. Concepts are links rather than buttons. Selecting one filters the Journal in place and can stack with the active format; a small Concept / value row exposes that state and provides a clear action. This preserves linkable archive exploration without creating separate tag pages for a small collection.

About and Now are supporting documents within the archive. About is a collection statement pairing a small metadata block with serif prose. Now is a dated status record whose subjects appear as compact system labels beside human responses. The footer identifies the archive quietly and does not describe the site as a prototype.
