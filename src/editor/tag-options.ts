import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import taxonomy from '../content/tags.json';
import { tagValues } from './tag-values.mjs';

// Registered only in local development. Include draft entries: their saved tags
// are useful suggestions in the editor, but never become public content here.
export const prerender = false;
export const GET: APIRoute = async () => {
  const entries = await getCollection('entries');
  return Response.json(tagValues([...taxonomy.tags, ...entries.flatMap(entry => entry.data.concepts)]), {
    headers: { 'Cache-Control': 'no-store' },
  });
};
