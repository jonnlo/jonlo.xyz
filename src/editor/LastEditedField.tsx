import type { BasicFormField } from '@keystatic/core';
import { formatLastEdited } from './last-edited.mjs';

export function lastEditedField(): BasicFormField<string> {
  const parse = (value: unknown): string => {
    if (value === undefined) return '';
    if (typeof value !== 'string') throw new Error('Last edited must be a timestamp.');
    return value;
  };
  return {
    kind: 'form', label: 'Last edited',
    defaultValue: () => '',
    parse,
    validate: parse,
    serialize: value => ({ value: value || undefined }),
    Input: ({ value }: { value: string }) => <div style={{ font: '14px/1.5 system-ui, sans-serif' }}>
      <div style={{ fontWeight: 500, marginBottom: 8 }}>Last edited</div>
      <div>{formatLastEdited(value)}</div>
      <p style={{ color: '#666', fontSize: 12, margin: '6px 0 0' }}>Hong Kong time. Updated automatically when you save.</p>
    </div>,
    reader: { parse: value => formatLastEdited(parse(value)) },
  };
}
