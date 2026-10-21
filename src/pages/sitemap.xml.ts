import type { APIContext } from 'astro';
import { publishedEntries, entryHref } from '../lib/entries';

export async function GET({ site }: APIContext) {
  const paths = ['/', '/journal/essay/', '/journal/note/', '/journal/crumb/', '/about/', '/now/', ...(await publishedEntries()).map(entryHref)];
  const escape = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
}
