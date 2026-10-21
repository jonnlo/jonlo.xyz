# Jon’s Log

A small journal built with Astro and Keystatic. The Astro site is the app; the
standalone files in `prototype/` remain the visual reference for comparison.
All current entry and About/Now writing is illustrative sample copy, not the
author’s original work. See [the content model](docs/CONTENT-MODEL.md) before
editing or replacing it.

## Run locally

Install dependencies and start Astro from the repository root:

```sh
npm install
npm run dev
```

Open <http://127.0.0.1:4321/>. The Keystatic editor is at
<http://127.0.0.1:4321/keystatic/> while the development server is running.
It edits the local files in this checkout. The static production build does
not include the editor or an admin route.

For Now, choose **Now updates → Add** to save a new dated snapshot. The newest
published update appears on About; **Past updates** opens the saved history.
Editing an existing snapshot corrects that record, so add a new one for each
update you want to preserve separately.

Useful project commands:

```sh
npm run check
npm run build
npm test
```

Set `SITE_URL` to the real canonical domain when preparing a production build;
the current site has not been deployed. Without it, Astro uses its local URL.
The generated `dist/` directory is disposable build output.

## Visual reference and experiment

The visual authority is `prototype/`, an independently served static version
of the journal. From the repository root, start its local server:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open
<http://127.0.0.1:8000/prototype/>. It uses the bundled ABC Areal and ABC Areal
Mono fonts with Crimson Text for reading. Preserve this prototype when checking
the Astro implementation visually.

The paper and ink tuner in `exp/` is served by the same local HTTP server at
<http://127.0.0.1:8000/exp/> and loads the prototype independently. Keep
`prototype/` as a repository-level reference; do not copy it into the public
asset directory for deployment.
