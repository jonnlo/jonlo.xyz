import test from 'node:test';
import assert from 'node:assert/strict';
import { addTag, matchingTagOptions, tagValues } from '../src/editor/tag-values.mjs';

test('tag values are stable ID strings and preserve existing IDs', () => {
  assert.deepEqual(tagValues(['ai', 'ordinary-life', 'ai']), ['ai', 'ordinary-life']);
  assert.deepEqual(addTag(['ai', 'ordinary-life'], 'new-thought'), ['ai', 'ordinary-life', 'new-thought']);
  assert.deepEqual(addTag(['ai'], 'ai'), ['ai']);
  assert.throws(() => tagValues('not an array'));
  assert.throws(() => tagValues([3]));
});

test('tag suggestions match renamed labels and omit selected stable IDs', () => {
  const options = [
    { id: 'ai', name: 'Artificial Intelligence' },
    { id: 'ordinary-life', name: 'Everyday Life' },
    { id: 'attention', name: 'Attention' },
  ];
  assert.deepEqual(matchingTagOptions(options, ['ai'], 'artificial'), []);
  assert.deepEqual(matchingTagOptions(options, ['ai'], 'everyday'), [{ id: 'ordinary-life', name: 'Everyday Life' }]);
  assert.deepEqual(matchingTagOptions(options, ['ai', 'ordinary-life'], 'life'), []);
});
