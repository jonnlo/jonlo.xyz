import { getCollection } from 'astro:content';

export type Tag = { id: string; name: string };
export async function tagRegistry(): Promise<Tag[]> {
  return (await getCollection('tags')).map(tag => ({ id: tag.id, name: tag.data.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
