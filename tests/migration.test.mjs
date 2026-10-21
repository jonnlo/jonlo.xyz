import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const prototype = readFileSync(resolve(root, 'prototype/app.js'), 'utf8');
const declaration = prototype.match(/const thoughts = \[([\s\S]*?)\n\];/);
assert.ok(declaration, 'The preserved prototype must provide the migration reference');
const entries = vm.runInNewContext(`${declaration[0]}\nJSON.stringify(thoughts)`, {}, { timeout: 1000 });
const originals = JSON.parse(entries);
const formats = ['all', 'essay', 'note', 'fragment'];
const concepts = [...new Set(originals.flatMap(entry => entry.concepts))];
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity]).replace(/\s+/g, ' ').trim();
const htmlFor = path => readFileSync(resolve(output, `.${decodeURIComponent(path)}`, 'index.html'), 'utf8');
const routeFor = (form, concept = '') => `${form === 'all' ? '/' : `/journal/${form}/`}${concept ? `concept/${encodeURIComponent(concept)}/` : ''}`;
const walk = path => readdirSync(path).flatMap(name => statSync(resolve(path, name)).isDirectory() ? walk(resolve(path, name)) : [resolve(path, name)]);
const fileFor = pathname => {
  const decoded = decodeURIComponent(pathname);
  const candidate = resolve(output, `.${decoded}`);
  return existsSync(candidate) && statSync(candidate).isDirectory() ? resolve(candidate, 'index.html') : candidate;
};
const recordSlugs = html => [...html.matchAll(/<li\b[^>]*class="[^"]*\brecord\s[^\"]*"[\s\S]*?<a\b[^>]*href="\/thought\/([^/]+)\/"/g)].map(match => decodeURIComponent(match[1]));

test('all ten prototype articles retain their public slugs, full writing, and marginalia', () => {
  assert.equal(originals.length, 10);
  const articlePaths = readdirSync(resolve(output, 'thought')).sort();
  for (const entry of originals) assert.ok(articlePaths.includes(entry.slug), `${entry.slug}: public route remains available`);
  for (const entry of originals) {
    const html = htmlFor(`/thought/${entry.slug}/`);
    const article = html.match(/<article\b[\s\S]*?<\/article>/)?.[0];
    assert.ok(article, `${entry.slug}: reading article exists`);
    const articleText = text(article);
    for (const passage of [...entry.body, ...(entry.more || []), ...(entry.heading ? [entry.heading] : []), ...(entry.note ? [entry.note] : [])]) {
      assert.ok(articleText.includes(passage), `${entry.slug}: missing original passage: ${passage}`);
    }
    if (entry.note) {
      const aside = article.match(/<aside\b[^>]*class="margin-note"[\s\S]*?<\/aside>/)?.[0];
      assert.ok(aside && text(aside).includes(entry.note), `${entry.slug}: marginalia remains an aside`);
    }
    assert.ok(html.includes(`datetime="${entry.timestamp || entry.date}"`), `${entry.slug}: original date precision and offset remain intact`);
    if (!entry.timestamp) assert.ok(!article.includes('UTC+'), `${entry.slug}: date-only records acquire no invented time`);
  }
});

test('format and concept combinations show exactly the matching records, in chronological order', () => {
  for (const form of formats) {
    for (const concept of ['', ...concepts]) {
      const route = routeFor(form, concept);
      const html = htmlFor(route);
      const expected = originals.filter(entry => (form === 'all' || entry.form === form) && (!concept || entry.concepts.includes(concept))).map(entry => entry.slug);
      const actual = recordSlugs(html);
      assert.deepEqual(actual.filter(slug => originals.some(entry => entry.slug === slug)), expected, route);
      if (!actual.length) assert.ok(text(html).includes('No entries in this selection yet.'), `${route}: empty selection has an explanation`);
      for (const nextForm of formats) {
        assert.ok(html.includes(`href="${routeFor(nextForm, concept)}"`), `${route}: format switching preserves the selected concept`);
      }
    }
  }
});

test('every generated local link and referenced asset resolves, including fragments', () => {
  const failures = [];
  for (const file of walk(output).filter(path => path.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    const route = `/${relative(output, file).replace(/index\.html$/, '')}`;
    for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (/^(?:[a-z]+:|\/\/)/i.test(raw)) continue;
      const url = new URL(raw.replace(/&amp;/g, '&'), `https://migration.test${route}`);
      const target = fileFor(url.pathname);
      if (!existsSync(target)) { failures.push(`${route} → ${raw}`); continue; }
      if (url.hash && !url.hash.startsWith('#/') && target.endsWith('.html')) {
        const fragment = decodeURIComponent(url.hash.slice(1));
        const destination = target === file ? html : readFileSync(target, 'utf8');
        if (!destination.includes(`id="${fragment}"`)) failures.push(`${route} → missing fragment ${raw}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('RSS includes all public entries and only assigns publication instants when recorded', () => {
  const feed = readFileSync(resolve(output, 'feed.xml'), 'utf8');
  const items = [...feed.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => match[1]);
  assert.equal(items.length, readdirSync(resolve(output, 'thought')).length);
  for (const entry of originals) {
    const item = items.find(item => item.includes(`/thought/${entry.slug}/`));
    assert.ok(item, `RSS includes ${entry.slug}`);
    if (entry.timestamp) assert.equal(new Date(item.match(/<pubDate>(.*?)<\/pubDate>/)[1]).getTime(), new Date(entry.timestamp).getTime());
    else assert.ok(!item.includes('<pubDate>'), `${entry.slug}: RSS invents no instant for a date-only entry`);
  }
});

test('sitemap uses a consistent absolute site origin and excludes filter duplicates', () => {
  const sitemap = readFileSync(resolve(output, 'sitemap.xml'), 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]));
  const expected = ['/', '/about/', '/now/', ...formats.filter(form => form !== 'all').map(form => routeFor(form)), ...readdirSync(resolve(output, 'thought')).map(slug => `/thought/${slug}/`)];
  assert.deepEqual(locations.map(url => url.pathname).sort(), expected.sort());
  const origin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : locations[0].origin;
  for (const url of locations) assert.equal(url.origin, origin);
  const feed = readFileSync(resolve(output, 'feed.xml'), 'utf8');
  for (const entry of originals) assert.ok(feed.includes(`${origin}/thought/${entry.slug}/`), 'RSS and sitemap share the site origin');
});

test('production output contains no editor endpoints or React hydration runtime', () => {
  const files = walk(output);
  assert.deepEqual(files.filter(path => /(?:^|\/)(?:keystatic|api|admin)(?:\/|\.)/.test(relative(output, path))), []);
  for (const file of files.filter(path => /\.(?:html|js)$/.test(path))) {
    const content = readFileSync(file, 'utf8');
    assert.ok(!/<astro-island\b|react-dom\/client|react\.production|\/api\/keystatic|\/keystatic\//.test(content), relative(output, file));
  }
});

test('unpublished content has no article route or feed item', () => {
  const directory = resolve(root, 'src/content/entries');
  const feed = readFileSync(resolve(output, 'feed.xml'), 'utf8');
  for (const file of walk(directory).filter(path => path.endsWith('.mdoc'))) {
    const source = readFileSync(file, 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1] || '';
    if (/^status:\s*["']?published["']?\s*$/m.test(frontmatter)) continue;
    const slug = relative(directory, file).replace(/\.mdoc$/, '');
    assert.ok(!existsSync(resolve(output, 'thought', slug)), `${slug}: unpublished route excluded`);
    assert.ok(!feed.includes(`/thought/${slug}/`), `${slug}: unpublished RSS item excluded`);
  }
});
