export function tagValues(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(tag => typeof tag !== 'string')) {
    throw new Error('Tags must be a list of names.');
  }
  const seen = new Set();
  return value.map(tag => tag.trim()).filter(tag => {
    const key = tag;
    if (!tag || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** @param {{id:string,name:string}[]} options @param {string[]} selected @param {string} query */
export function matchingTagOptions(options, selected, query) {
  const assigned = new Set(selected);
  const search = query.trim().toLocaleLowerCase();
  return options.filter(tag => !assigned.has(tag.id) && tag.name.toLocaleLowerCase().includes(search))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function addTag(selected, id) {
  return tagValues([...selected, id]);
}

export function normalizeTagName(name) {
  if (typeof name !== 'string') throw new Error('A tag needs a name.');
  const value = name.trim().replace(/\s+/g, ' ');
  if (!value || value.length > 100) throw new Error('Tag names must contain 1–100 characters.');
  return value;
}
