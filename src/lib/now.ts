import { getCollection } from 'astro:content';

export async function publishedNowUpdates() {
  return (await getCollection('now', ({ data }) => data.status === 'published'))
    .sort((a, b) => b.data.date.localeCompare(a.data.date) || b.id.localeCompare(a.id));
}
