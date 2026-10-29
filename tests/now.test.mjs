import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderNowText } from '../src/lib/now-rich-text.mjs';

const root = resolve(import.meta.dirname, '..');
const directory = resolve(root, 'src/content/now');
const updates = readdirSync(directory).filter(file => file.endsWith('.json')).map(file => ({
  id: file.replace(/\.json$/, ''),
  ...JSON.parse(readFileSync(resolve(directory, file), 'utf8')),
}));
const published = updates.filter(update => update.status === 'published')
  .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
const about = readFileSync(resolve(root, 'dist/about/index.html'), 'utf8');
const now = readFileSync(resolve(root, 'dist/now/index.html'), 'utf8');
const history = readFileSync(resolve(root, 'dist/now/history/index.html'), 'utf8');
const nowPage = JSON.parse(readFileSync(resolve(root, 'src/content/now-page.json'), 'utf8'));
const escape = renderNowText;

test('About links to the separate Now page without embedding its update', () => {
  assert.ok(about.includes('href="/now/"'));
  assert.ok(!about.includes('id="now"'));
  for (const update of published) {
    for (const item of update.items) assert.ok(!about.includes(escape(item.text)), item.text);
  }
});

test('Now shows only the latest published update and links to its history', () => {
  const escapedBlurb = nowPage.currentDescription.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  assert.ok(now.includes(escapedBlurb));
  if (!published.length) { assert.ok(now.includes('No updates published yet.')); return; }
  assert.ok(now.includes(`datetime="${published[0].date}"`));
  assert.ok(now.includes('href="/now/history/"'));
  for (const item of published[0].items) assert.ok(now.includes(escape(item.text)), item.text);
  for (const update of updates.filter(update => update.id !== published[0].id)) {
    for (const item of update.items) {
      if (!published[0].items.some(current => current.text === item.text)) assert.ok(!now.includes(escape(item.text)), `${update.id} must not appear on the current Now page`);
    }
  }
});

test('Now history retains every published snapshot in date order and excludes drafts', () => {
  const ids = [...history.matchAll(/id="update-([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, published.map(update => update.id));
  for (const update of published) {
    for (const item of update.items) assert.ok(history.includes(escape(item.text)), `${update.id}: ${item.text}`);
  }
  for (const draft of updates.filter(update => update.status !== 'published')) {
    assert.ok(!history.includes(`id="update-${draft.id}"`));
    for (const item of draft.items) {
      if (!published.some(update => update.items.some(publicItem => publicItem.text === item.text))) assert.ok(!history.includes(escape(item.text)));
    }
  }
});
