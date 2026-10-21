import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import YAML from 'yaml';
import { normalizeTagName } from './tag-values.mjs';

/** @returns {Promise<Array<{id:string,name:string}>>} */
export async function readTags(root = process.cwd()) {
  const directory = join(root, 'src/content/tags');
  const files = await readdir(directory);
  return Promise.all(files.filter(file => file.endsWith('.json')).map(async file => ({
    id: file.slice(0, -5),
    name: normalizeTagName(JSON.parse(await readFile(join(directory, file), 'utf8')).name),
  })));
}

export async function createSharedTag(input, root = process.cwd()) {
  const name = normalizeTagName(input);
  const tags = await readTags(root);
  const existing = tags.find(tag => tag.name.toLocaleLowerCase() === name.toLocaleLowerCase());
  if (existing) return existing;
  const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tag';
  const directory = join(root, 'src/content/tags');
  await mkdir(directory, { recursive: true });
  for (let suffix = 0; ; suffix++) {
    const id = suffix ? `${base}-${suffix + 1}` : base;
    try {
      await writeFile(join(directory, `${id}.json`), JSON.stringify({ name }, null, 2) + '\n', { flag: 'wx' });
      return { id, name };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const found = JSON.parse(await readFile(join(directory, `${id}.json`), 'utf8'));
      if (found.name.toLocaleLowerCase() === name.toLocaleLowerCase()) return { id, name: found.name };
    }
  }
}

const tagPath = /^src\/content\/tags\/([^/]+)\.json$/;
const entryPath = /^src\/content\/entries\/([^/]+)\.mdoc$/;

// Check the final batch state, allowing reassignment and deletion in one save.
export function validateTagReferences(tags, entries) {
  const byId = new Map(tags.map(tag => [tag.id, tag]));
  const names = new Map();
  const fileIds = new Map();
  for (const tag of tags) {
    const fileId = tag.id.toLocaleLowerCase();
    if (fileIds.has(fileId) && fileIds.get(fileId) !== tag.id) throw new Error(`Tag ID “${tag.id}” conflicts with an existing ID. Choose a different stable ID.`);
    fileIds.set(fileId, tag.id);
    const name = normalizeTagName(tag.name).toLocaleLowerCase();
    if (names.has(name)) throw new Error(`A tag named “${tag.name}” already exists. Use the existing tag.`);
    names.set(name, tag.id);
  }
  for (const entry of entries) {
    for (const id of entry.tags) {
      if (!byId.has(id)) throw new Error(`Tag “${id}” is used by “${entry.id}”. Reassign that entry before removing or changing the tag ID.`);
    }
  }
}

export async function validateTagUpdate(payload, root = process.cwd()) {
  if (!Array.isArray(payload?.additions) || !Array.isArray(payload?.deletions)) return;
  const tags = new Map((await readTags(root)).map(tag => [tag.id, tag]));
  const directory = join(root, 'src/content/entries');
  const entries = new Map();
  function readEntry(id, source) {
    const metadata = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!metadata) throw new Error(`Entry “${id}” has no frontmatter.`);
    const data = YAML.parse(metadata[1]);
    if (!Array.isArray(data.concepts) || data.concepts.some(tag => typeof tag !== 'string')) throw new Error(`Entry “${id}” has invalid tag references.`);
    return { id, tags: data.concepts };
  }
  for (const file of await readdir(directory)) {
    if (file.endsWith('.mdoc')) entries.set(file.slice(0, -5), readEntry(file.slice(0, -5), await readFile(join(directory, file), 'utf8')));
  }
  for (const deletion of payload.deletions) {
    const tag = tagPath.exec(deletion?.path);
    const entry = entryPath.exec(deletion?.path);
    if (tag) tags.delete(tag[1]);
    if (entry) entries.delete(entry[1]);
  }
  for (const addition of payload.additions) {
    if (typeof addition?.contents !== 'string') continue;
    const tag = tagPath.exec(addition.path);
    const entry = entryPath.exec(addition.path);
    if (!tag && !entry) continue;
    const text = Buffer.from(addition.contents, 'base64url').toString('utf8');
    if (tag) tags.set(tag[1], { id: tag[1], name: normalizeTagName(JSON.parse(text).name) });
    if (entry) entries.set(entry[1], readEntry(entry[1], text));
  }
  validateTagReferences([...tags.values()], [...entries.values()]);
}
