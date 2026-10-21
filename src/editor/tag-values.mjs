export function tagValues(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(tag => typeof tag !== 'string')) {
    throw new Error('Tags must be a list of names.');
  }
  const seen = new Set();
  return value.map(tag => tag.trim()).filter(tag => {
    const key = tag.toLocaleLowerCase();
    if (!tag || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function matchingTagOptions(options, selected, query) {
  const assigned = new Set(selected.map(tag => tag.toLocaleLowerCase()));
  const search = query.trim().toLocaleLowerCase();
  return tagValues(options).filter(tag => !assigned.has(tag.toLocaleLowerCase()) && tag.toLocaleLowerCase().includes(search))
    .sort((a, b) => a.localeCompare(b));
}

export function addTag(selected, input, options) {
  const name = input.trim();
  const existing = [...selected, ...options].find(tag => tag.toLocaleLowerCase() === name.toLocaleLowerCase());
  return tagValues([...selected, existing || name]);
}
