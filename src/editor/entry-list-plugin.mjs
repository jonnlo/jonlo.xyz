// Keystatic 0.6.9 has no settings for its mandatory slug column or initial
// sorting. Adapt the local Entries/Tags tables; leave package files untouched.
// Fail explicitly if an upgrade changes these integration points.
export function customizeEntryList(source) {
  const replacements = [
    ["column: SLUG,\n    direction: 'ascending'", "column: props.collection === 'entries' ? 'date' : props.collection === 'tags' ? 'name' : SLUG,\n    direction: props.collection === 'entries' ? 'descending' : 'ascending'"],
    ["{\n        name: 'Slug',\n        key: SLUG\n      }, ...collection.columns.map", "...(props.collection === 'entries' ? [] : [{\n        name: props.collection === 'tags' ? 'Tag ID' : 'Slug',\n        key: SLUG\n      }]), ...collection.columns.map"],
    ["name: 'label' in schema_0 && schema_0.label || column,", "name: props.collection === 'tags' && column === 'name' ? 'Tag name' : 'label' in schema_0 && schema_0.label || column,"],
    ['})];\n    }\n    return hideStatusColumn', "})].sort((a, b) => props.collection === 'tags' ? Number(a.key === SLUG) - Number(b.key === SLUG) : 0);\n    }\n    return hideStatusColumn"],
    ["})]\n          }, 'key:' + item_0.name);", "})].sort((a, b) => props.collection === 'tags' ? Number(a.key === SLUG + item_0.name) - Number(b.key === SLUG + item_0.name) : 0)\n          }, 'key:' + item_0.name);"],
    ['}, [collection, hideStatusColumn]);', '}, [collection, hideStatusColumn, props.collection]);'],
    ['...(hideStatusColumn ? [] : [statusCell]), nameCell, ...collection.columns.map', "...(hideStatusColumn ? [] : [statusCell]), ...(props.collection === 'entries' ? [] : [nameCell]), ...collection.columns.map"],
    ["val = (_item_0$data = item_0.data) === null || _item_0$data === void 0 ? void 0 : _item_0$data[column_0];", "val = (_item_0$data = item_0.data) === null || _item_0$data === void 0 ? void 0 : _item_0$data[column_0];\n              if (props.collection === 'entries' && column_0 === 'title' && !val) val = item_0.data?.name || item_0.name;"],
    ["return entriesWithData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));", "return entriesWithData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (props.collection === 'entries' && (item.data?.title || item.data?.name || '').toLowerCase().includes(searchTerm.toLowerCase())));"],
    ['}, [entriesWithData, searchTerm]);', '}, [entriesWithData, searchTerm, props.collection]);'],
  ];
  let output = source;
  for (const [before, after] of replacements) {
    if (output.split(before).length !== 2) {
      throw new Error('Keystatic Entries table changed. Update src/editor/entry-list-plugin.mjs before upgrading the editor.');
    }
    output = output.replace(before, after);
  }
  return output;
}

export function entryListPlugin() {
  return {
    name: 'jons-log-entry-list-v2',
    transform(source, id) {
      if (!id.replaceAll('\\', '/').endsWith('/@keystatic/core/dist/keystatic-core-ui.js')) return;
      return { code: customizeEntryList(source), map: null };
    },
  };
}
