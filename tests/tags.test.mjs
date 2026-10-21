import test from 'node:test';
import assert from 'node:assert/strict';
import { addTag, matchingTagOptions, tagValues } from '../src/editor/tag-values.mjs';

test('Tags support inline creation without a fixed vocabulary, preserving stored names', () => {
  assert.deepEqual(addTag(['standards'], 'new thought', []), ['standards', 'new thought']);
  assert.deepEqual(addTag([], 'ai', ['AI', 'attention']), ['AI']);
  assert.deepEqual(addTag(['AI'], 'ai', []), ['AI']);
  assert.deepEqual(tagValues(['ordinary life', 'Buddhism']), ['ordinary life', 'Buddhism']);
});

test('Tag suggestions search saved names and omit assigned tags', () => {
  assert.deepEqual(matchingTagOptions(['AI', 'attention', 'perception', 'new thought'], ['AI'], 'tion'), ['attention', 'perception']);
  assert.deepEqual(matchingTagOptions(['attention', 'Attention'], [], ''), ['attention']);
  assert.deepEqual(tagValues(['  care  ', '', 'Care']), ['care']);
  assert.throws(() => tagValues('not an array'));
  assert.throws(() => tagValues([3]));
});
