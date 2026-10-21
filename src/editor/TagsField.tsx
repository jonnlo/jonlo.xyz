import { useEffect, useId, useState, type CSSProperties } from 'react';
import type { BasicFormField, FormFieldInputProps } from '@keystatic/core';
import { addTag, matchingTagOptions, tagValues } from './tag-values.mjs';

const border = 'var(--ks-color-border-neutral, #d4d4d8)';
const surface = 'var(--ks-color-background-surface, #fff)';
const muted = 'var(--ks-color-foreground-neutral-secondary, #666)';
const action: CSSProperties = { font: 'inherit', color: 'inherit', cursor: 'pointer', border: 0, background: 'transparent' };
type TagOption = { id: string; name: string; create?: boolean };

function TagsInput({ value, onChange, autoFocus }: FormFieldInputProps<string[]>) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<TagOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState('');
  const matches = matchingTagOptions(options, value, query);
  const exact = options.some(tag => tag.name.toLocaleLowerCase() === query.trim().toLocaleLowerCase());
  const choices: TagOption[] = [...matches, ...(query.trim() && !exact ? [{ id: '', name: query.trim(), create: true }] : [])];

  async function loadOptions() {
    try {
      const response = await fetch('/api/tag-options', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unavailable');
      const tags = await response.json();
      if (!Array.isArray(tags) || tags.some(tag => typeof tag.id !== 'string' || typeof tag.name !== 'string')) throw new Error('Invalid registry');
      setOptions(tags);
      setNotice('');
    } catch {
      setNotice('Tag list unavailable. Try refreshing before adding a tag.');
    }
  }

  useEffect(() => { void loadOptions(); }, []);

  async function select(choice: TagOption) {
    if (busy) return;
    setBusy(true);
    try {
      let tag = choice;
      if (choice.create) {
        const response = await fetch('/api/tag-options', {
          method: 'POST', headers: { 'content-type': 'application/json', 'no-cors': '1' },
          body: JSON.stringify({ name: choice.name }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to create tag.');
        tag = result;
        setOptions(current => [...current.filter(item => item.id !== tag.id), tag]);
      }
      onChange(addTag(value, tag.id));
      setQuery(''); setActive(0); setNotice('');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to create tag.');
    } finally { setBusy(false); }
  }

  return <div style={{ font: '14px/1.5 system-ui, sans-serif', position: 'relative' }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <label htmlFor={id} style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>Tags</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, border: `1px solid ${border}`, borderRadius: 8, background: surface }}>
      {value.map(id => <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 16, padding: '2px 8px', background: 'var(--ks-color-background-neutral, #ededf0)' }}>
        {options.find(tag => tag.id === id)?.name || id}<button type="button" disabled={busy} aria-label={`Remove tag ${options.find(tag => tag.id === id)?.name || id}`} style={action} onClick={() => onChange(value.filter(item => item !== id))}>×</button>
      </span>)}
      <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open && choices.length > 0} aria-controls={`${id}-options`}
        aria-activedescendant={open && choices[active] ? `${id}-option-${active}` : undefined} aria-describedby={`${id}-help`}
        autoFocus={autoFocus} disabled={busy} value={query} placeholder={busy ? 'Creating tag…' : 'Find or add a tag…'} autoComplete="off"
        style={{ font: 'inherit', color: 'inherit', minWidth: 130, width: '100%', flex: '1 1 130px', border: 0, padding: '4px 2px', background: 'transparent' }}
        onFocus={() => { setOpen(true); void loadOptions(); }}
        onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            setActive(index => choices.length ? (index + (event.key === 'ArrowDown' ? 1 : choices.length - 1)) % choices.length : 0);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const choice = choices[active];
            if (choice) void select(choice);
          } else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
        }} />
    </div>
    {open && choices.length > 0 && <div role="listbox" id={`${id}-options`} aria-label="Tag suggestions" style={{ border: `1px solid ${border}`, borderRadius: 8, background: surface, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
      {choices.map((tag, index) => <button key={tag.id || 'create'} disabled={busy} type="button" role="option" id={`${id}-option-${index}`} aria-selected={index === active}
        onMouseDown={event => event.preventDefault()} onClick={() => { void select(tag); }}
        style={{ ...action, display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', background: index === active ? 'var(--ks-color-background-neutral, #ededf0)' : 'transparent' }}>
        {tag.create ? `Create “${tag.name}”` : tag.name}
      </button>)}
    </div>}
    <p id={`${id}-help`} style={{ color: muted, fontSize: 12, margin: '6px 0 0' }}>Choose a tag or create one here. New tags are shared immediately; save this entry to apply them. Rename tags under Tags.</p>
    {notice && <p role="status" style={{ color: muted, fontSize: 12, margin: '6px 0 0' }}>{notice}</p>}
  </div>;
}

export function tagsField(): BasicFormField<string[]> {
  return {
    kind: 'form', label: 'Tags', Input: TagsInput,
    defaultValue: () => [],
    parse: tagValues,
    serialize: value => ({ value: tagValues(value) }),
    validate: tagValues,
    reader: { parse: tagValues },
  };
}
