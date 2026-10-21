import { useId, useState, type CSSProperties } from 'react';
import type { BasicFormField, FormFieldInputProps } from '@keystatic/core';
import { addTag, matchingTagOptions, tagValues } from './tag-values.mjs';

const border = 'var(--ks-color-border-neutral, #d4d4d8)';
const surface = 'var(--ks-color-background-surface, #fff)';
const muted = 'var(--ks-color-foreground-neutral-secondary, #666)';
const action: CSSProperties = { font: 'inherit', color: 'inherit', cursor: 'pointer', border: 0, background: 'transparent' };

function TagsInput({ value, onChange, autoFocus }: FormFieldInputProps<string[]>) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState('');
  const matches = matchingTagOptions(options, value, query);
  const exact = [...options, ...value].some(tag => tag.toLocaleLowerCase() === query.trim().toLocaleLowerCase());
  const choices = [...matches, ...(query.trim() && !exact ? [query.trim()] : [])];

  async function loadOptions() {
    try {
      const response = await fetch('/api/tag-options', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unavailable');
      setOptions(tagValues(await response.json()));
      setNotice('');
    } catch {
      setNotice('Suggestions unavailable. You can still type a tag and press Enter.');
    }
  }

  function select(tag: string) {
    onChange(addTag(value, tag, options));
    setQuery('');
    setActive(0);
  }

  return <div style={{ font: '14px/1.5 system-ui, sans-serif', position: 'relative' }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <label htmlFor={id} style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>Tags</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, border: `1px solid ${border}`, borderRadius: 8, background: surface }}>
      {value.map(tag => <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 16, padding: '2px 8px', background: 'var(--ks-color-background-neutral, #ededf0)' }}>
        {tag}<button type="button" aria-label={`Remove tag ${tag}`} style={action} onClick={() => onChange(value.filter(item => item !== tag))}>×</button>
      </span>)}
      <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open && choices.length > 0} aria-controls={`${id}-options`}
        aria-activedescendant={open && choices[active] ? `${id}-option-${active}` : undefined} aria-describedby={`${id}-help`}
        autoFocus={autoFocus} value={query} placeholder="Find or add a tag…" autoComplete="off"
        style={{ font: 'inherit', color: 'inherit', minWidth: 130, width: '100%', flex: '1 1 130px', border: 0, padding: '4px 2px', background: 'transparent' }}
        onFocus={() => { setOpen(true); void loadOptions(); }}
        onChange={event => { setQuery(event.target.value); setActive(0); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            setActive(index => choices.length ? (index + (event.key === 'ArrowDown' ? 1 : choices.length - 1)) % choices.length : 0);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const choice = choices[active] || query.trim();
            if (choice) select(choice);
          } else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
        }} />
    </div>
    {open && choices.length > 0 && <div role="listbox" id={`${id}-options`} aria-label="Tag suggestions" style={{ border: `1px solid ${border}`, borderRadius: 8, background: surface, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
      {choices.map((tag, index) => <button key={tag} type="button" role="option" id={`${id}-option-${index}`} aria-selected={index === active}
        onMouseDown={event => event.preventDefault()} onClick={() => select(tag)}
        style={{ ...action, display: 'block', width: '100%', padding: '7px 10px', textAlign: 'left', background: index === active ? 'var(--ks-color-background-neutral, #ededf0)' : 'transparent' }}>
        {index >= matches.length ? `Create “${tag}”` : tag}
      </button>)}
    </div>}
    <p id={`${id}-help`} style={{ color: muted, fontSize: 12, margin: '6px 0 0' }}>Choose a suggestion or type a new tag and press Enter. New tags are saved with this entry.</p>
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
