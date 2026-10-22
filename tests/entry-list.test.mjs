import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { customizeEntryList, entryListPlugin } from '../src/editor/entry-list-plugin.mjs';

const path = import.meta.resolve('@keystatic/core/ui').replace(/keystatic-core-ui(?:\.node)?\.js$/, 'keystatic-core-ui.js');
const source = readFileSync(new URL(path), 'utf8');

test('The installed Entries list can hide slug header and cells while retaining row routes', () => {
  const output = customizeEntryList(source);
  assert.ok(output.includes("props.collection === 'entries' ? [] : [{\n        name: props.collection === 'tags' ? 'Tag ID' : 'Slug'"));
  assert.ok(output.includes("props.collection === 'entries' ? [] : [nameCell]"));
  assert.ok(output.includes("column: props.collection === 'entries' ? 'date' : props.collection === 'tags' ? 'name' : SLUG"));
  assert.ok(output.includes("column === 'name' ? 'Tag name'"));
  assert.ok(output.includes('Number(a.key === SLUG) - Number(b.key === SLUG)'));
  assert.ok(output.includes('Number(a.key === SLUG + item_0.name) - Number(b.key === SLUG + item_0.name)'));
  assert.ok(output.includes("direction: props.collection === 'entries' ? 'descending' : 'ascending'"));
  assert.ok(output.includes("getItemPath(props.basePath, props.collection, key.toString().slice('key:'.length))"));
  assert.ok(output.includes("item.data?.title || item.data?.name"));
  assert.ok(output.includes("column_0 === 'form') val = ({ essay: 'Essay', note: 'Note', crumb: 'Crumb' })[val] || val"));
  assert.ok(output.includes("column_0 === 'status') val = ({ draft: 'Draft', published: 'Published' })[val] || val"));
  const checked = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: output, encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
});

test('Editor adapter leaves unrelated modules alone and reports incompatible package upgrades', () => {
  assert.equal(entryListPlugin().transform('unrelated', '/src/example.js'), undefined);
  assert.throws(() => customizeEntryList('a different table'), /Keystatic Entries table changed/);
});
