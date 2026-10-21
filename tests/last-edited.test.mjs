import test from 'node:test';
import assert from 'node:assert/strict';
import { formatLastEdited, stampEntryUpdates } from '../src/editor/last-edited.mjs';

const encode = text => Buffer.from(text).toString('base64url');
const decode = text => Buffer.from(text, 'base64url').toString();
const instant = '2026-10-21T10:00:00.000Z';

test('Saving an entry updates last edited without changing its date or body', () => {
  const source = '---\nname: Example\ndate: 2026-08-09\nlastEdited: "2026-10-20T00:00:00Z"\n---\n\nAn unchanged body.\n';
  const payload = { additions: [{ path: 'src/content/entries/example.mdoc', contents: encode(source) }], deletions: [] };
  const output = stampEntryUpdates(payload, instant);
  const saved = decode(output.additions[0].contents);
  assert.ok(saved.includes('date: 2026-08-09\n'));
  assert.ok(saved.endsWith('---\n\nAn unchanged body.\n'));
  assert.ok(saved.includes(`lastEdited: "${instant}"`));
  assert.equal((saved.match(/^lastEdited:/gm) || []).length, 1);
  assert.equal(decode(payload.additions[0].contents), source);
});

test('Stamping handles new entries and leaves other collections and deletions alone', () => {
  const other = { path: 'src/content/now/example.json', contents: encode('{"date":"2026-10-21"}') };
  const deletion = { path: 'src/content/entries/old.mdoc' };
  const source = '---\r\nname: New\r\ndate: 2026-10-21\r\n---\r\nText.';
  const result = stampEntryUpdates({ additions: [{ path: 'src/content/entries/new.mdoc', contents: encode(source) }, other], deletions: [deletion] }, instant);
  assert.ok(decode(result.additions[0].contents).includes(`\r\nlastEdited: "${instant}"\r\n---`));
  assert.deepEqual(result.additions[1], other);
  assert.deepEqual(result.deletions, [deletion]);
  assert.deepEqual(stampEntryUpdates({ additions: [null] }, instant), { additions: [null] });
});

test('Last edited displays Hong Kong time and leaves unknown dates blank', () => {
  assert.equal(formatLastEdited(instant), '2026-10-21 18:00');
  assert.equal(formatLastEdited(''), '—');
  assert.equal(formatLastEdited(undefined), '—');
});

test('Optional time uses entry date and preserves seconds and UTC offset on save', () => {
  for (const recorded of ['22:33:12+08:00', '2026-10-21T22:33:12+08:00', '09:15:00Z']) {
    const source = `---\nname: Example\ndate: 2026-09-07\ntimestamp: '${recorded}'\n---\n\nBody.\n`;
    const output = stampEntryUpdates({ additions: [{ path: 'src/content/entries/example.mdoc', contents: encode(source) }] }, instant);
    const text = decode(output.additions[0].contents);
    assert.ok(text.includes(`timestamp: "2026-09-07T${recorded.replace(/^.*T/, '')}"`));
    assert.ok(text.endsWith('\n\nBody.\n'));
  }
});
