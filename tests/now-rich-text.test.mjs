import test from 'node:test';
import assert from 'node:assert/strict';
import { renderNowText } from '../src/lib/now-rich-text.mjs';

test('Now descriptions render links, emphasis, paragraphs and both list types', () => {
  const html = renderNowText('Reading **a book** with *care*: [notes](https://example.com/notes).\n\nAnother paragraph.\n\n- One\n- Two\n\n1. First\n2. Second');
  for (const expected of ['<strong>a book</strong>', '<em>care</em>', '<a href="https://example.com/notes">notes</a>', '<p>Another paragraph.</p>', '<ul>', '<ol>', '<li>Two</li>']) {
    assert.ok(html.includes(expected), expected);
  }
});

test('Existing plain descriptions stay readable and HTML is treated as text', () => {
  assert.equal(renderNowText('The city with the window open.'), '<div><p>The city with the window open.</p></div>');
  assert.ok(!renderNowText('<script>alert(1)</script>').includes('<script>'));
  assert.ok(!renderNowText('[unsafe](javascript:alert(1))').includes('href='));
});
