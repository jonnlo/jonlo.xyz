/** @param {string[]} ids @param {{id: string, name: string}[]} records */
export function resolveTagReferences(ids, records) {
  const byId = new Map(records.map(tag => [tag.id, tag]));
  return ids.map(id => {
    const tag = byId.get(id);
    if (!tag) throw new Error(`Unknown tag ID “${id}”. Restore the tag or reassign the entry.`);
    return tag;
  });
}
