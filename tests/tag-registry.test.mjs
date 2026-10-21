import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSharedTag, readTags, validateTagReferences, validateTagUpdate } from '../src/editor/tag-registry.server.mjs';
import { resolveTagReferences } from '../src/lib/tag-references.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'blog-tag-registry-'));
  await mkdir(join(root, 'src/content/tags'), { recursive: true });
  await mkdir(join(root, 'src/content/entries'), { recursive: true });
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function putTag(root, id, name) {
  await writeFile(join(root, `src/content/tags/${id}.json`), JSON.stringify({ name }));
}

async function putEntry(root, id, concepts) {
  await writeFile(join(root, `src/content/entries/${id}.mdoc`), `---\nconcepts:\n${concepts.map(value => `  - ${JSON.stringify(value)}`).join('\n')}\n---\nEntry body\n`);
}

function addition(path, contents) {
  return { path, contents: Buffer.from(contents).toString('base64url') };
}

test('shared tag creation deduplicates labels without changing IDs and handles slug collisions', async t => {
  const root = await fixture(t);
  await putTag(root, 'ai', 'AI');
  assert.deepEqual(await createSharedTag(' aI ', root), { id: 'ai', name: 'AI' });

  await putTag(root, 'quiet-life', 'A renamed label');
  const created = await createSharedTag('Quiet Life', root);
  assert.deepEqual(created, { id: 'quiet-life-2', name: 'Quiet Life' });
  assert.deepEqual((await readTags(root)).sort((a, b) => a.id.localeCompare(b.id)), [
    { id: 'ai', name: 'AI' },
    { id: 'quiet-life', name: 'A renamed label' },
    { id: 'quiet-life-2', name: 'Quiet Life' },
  ]);
  assert.equal(JSON.parse(await readFile(join(root, 'src/content/tags/quiet-life-2.json'), 'utf8')).name, 'Quiet Life');
});

test('reference resolution returns current renamed labels under stable IDs', () => {
  const records = [{ id: 'ai', name: 'Artificial Intelligence' }, { id: 'ordinary-life', name: 'Everyday Life' }];
  assert.deepEqual(resolveTagReferences(['ai', 'ordinary-life'], records), records);
  assert.throws(() => resolveTagReferences(['missing'], records), /Unknown tag ID “missing”/);
});

test('tag reference validation enforces existing IDs and unique labels while allowing renames', () => {
  assert.doesNotThrow(() => validateTagReferences(
    [{ id: 'old-id', name: 'A new label' }],
    [{ id: 'entry', tags: ['old-id'] }],
  ));
  assert.throws(() => validateTagReferences([], [{ id: 'entry', tags: ['missing'] }]), /used by “entry”/);
  assert.throws(() => validateTagReferences(
    [{ id: 'one', name: 'Mind' }, { id: 'two', name: ' mind ' }],
    [],
  ), /already exists/);
  assert.throws(() => validateTagReferences(
    [{ id: 'AI', name: 'Existing tag' }, { id: 'ai', name: 'Another tag' }], [],
  ), /conflicts with an existing ID/);
});

test('tag update rejects deleting a referenced ID, but accepts reassignment and deletion together', async t => {
  const root = await fixture(t);
  await putTag(root, 'ai', 'AI');
  await putTag(root, 'ordinary-life', 'Ordinary Life');
  await putEntry(root, 'note', ['ai', 'ordinary-life']);

  await assert.rejects(validateTagUpdate({ additions: [], deletions: [
    { path: 'src/content/tags/ai.json' },
  ] }, root), /Tag “ai” is used by “note”/);

  await assert.doesNotReject(validateTagUpdate({
    additions: [addition('src/content/entries/note.mdoc', '---\nconcepts:\n  - ordinary-life\n---\nUpdated\n')],
    deletions: [{ path: 'src/content/tags/ai.json' }],
  }, root));
});

test('tag update rejects an entry save with a missing tag reference', async t => {
  const root = await fixture(t);
  await putTag(root, 'ai', 'AI');
  await putEntry(root, 'note', ['ai']);
  await assert.rejects(validateTagUpdate({
    additions: [addition('src/content/entries/note.mdoc', '---\nconcepts:\n  - deleted-tag\n---\nUpdated\n')],
    deletions: [],
  }, root), /Tag “deleted-tag” is used by “note”/);
});
