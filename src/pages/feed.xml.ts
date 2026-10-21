import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publishedEntries, entryTitle, entryHref } from '../lib/entries';

export async function GET(context: APIContext) {
  const entries = await publishedEntries();
  return rss({
    title: 'Jon’s log',
    description: 'A personal archive of essays, notes and recurring thoughts.',
    site: context.site!,
    items: entries.map(entry => ({
      title: entryTitle(entry),
      link: entryHref(entry),
      description: entry.data.summary || entryTitle(entry),
      // A date-only record has no known publication instant. Do not invent one.
      ...(entry.data.timestamp ? { pubDate: new Date(entry.data.timestamp) } : {}),
      categories: entry.data.concepts,
    })),
  });
}
