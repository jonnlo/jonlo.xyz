import { useEffect, useId, useState } from 'react';
import type { BasicFormField, FormFieldInputProps } from '@keystatic/core';
import { z } from 'astro/zod';

const timeWithOffset = z.iso.datetime({ offset: true });
const isValid = (value: string) => !value || timeWithOffset.safeParse(`2000-01-01T${value}`).success;
const timePart = (value: string) => value.replace(/^\d{4}-\d{2}-\d{2}T/, '');
const style = {
  width: '100%', minWidth: 0, boxSizing: 'border-box' as const,
  padding: '8px 10px', borderRadius: 6,
  border: '1px solid var(--ks-color-border-neutral, #d4d4d8)',
  background: 'var(--ks-color-background-surface, #fff)', color: 'inherit', font: 'inherit',
};

function TimestampInput({ value, onChange, autoFocus }: FormFieldInputProps<string>) {
  const id = useId();
  const match = /^(.*?)(Z|[+-]\d{2}:\d{2})$/.exec(value);
  const [time, setTime] = useState(match ? match[1] : value);
  const [offset, setOffset] = useState(match ? match[2] : '+08:00');
  useEffect(() => {
    if (!value) { setTime(''); return; }
    const parts = /^(.*?)(Z|[+-]\d{2}:\d{2})$/.exec(value);
    if (parts) { setTime(parts[1]); setOffset(parts[2]); }
  }, [value]);
  const help = `${id}-help`;
  return <div style={{ font: '14px/1.5 system-ui, sans-serif' }}>
    <div style={{ fontWeight: 500, marginBottom: 8 }}>Precise time (optional)</div>
    <label htmlFor={id} style={{ display: 'block', marginBottom: 4 }}>Time</label>
    <input id={id} type="time" step="any" value={time} autoFocus={autoFocus}
      aria-describedby={help} style={style}
      onChange={event => {
        const next = event.target.value;
        setTime(next);
        onChange(next ? `${next.length === 5 ? `${next}:00` : next}${offset}` : '');
      }} />
    <p id={help} style={{ color: 'var(--ks-color-foreground-neutral-secondary, #666)', fontSize: 12, margin: '6px 0 0' }}>
      Uses Entry date when saved. Only add a time if known. New times use Hong Kong time.
    </p>
    {!isValid(value) && <p role="alert" style={{ fontSize: 12 }}>Enter a complete time.</p>}
    {value && <button type="button" onClick={() => onChange('')} style={{ marginTop: 6 }}>Clear time</button>}
  </div>;
}

export function timestampField(): BasicFormField<string> {
  const parse = (value: unknown): string => {
    if (value === undefined) return '';
    if (typeof value !== 'string') throw new Error('Timestamp must be text.');
    return timePart(value);
  };
  return {
    kind: 'form', label: 'Precise time (optional)', defaultValue: () => '', parse,
    validate(value) {
      if (!isValid(value)) throw new Error('Enter a complete time.');
      return value;
    },
    serialize: value => ({ value: value || undefined }),
    Input: TimestampInput,
    reader: { parse },
  };
}
