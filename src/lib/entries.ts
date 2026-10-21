import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'entries'>;
export type Form = Entry['data']['form'];
export type Filter = Form | 'all';
export const formats = [['all', 'All'], ['essay', 'Essays'], ['note', 'Notes'], ['fragment', 'Lines']] as const;
export const entryTitle = (entry: Entry) => entry.data.title || entry.data.name;
export const entryHref = (entry: Entry) => `/thought/${encodeURIComponent(entry.id)}/`;
export const formLabel = (form: Form) => form === 'fragment' ? 'line' : form;
export function archiveHref(form: Filter = 'all', concept = '') {
  const base = form === 'all' ? '/' : `/journal/${form}/`;
  return concept ? `${base}concept/${encodeURIComponent(concept)}/` : base;
}
export async function publishedEntries() {
  return (await getCollection('entries', ({ data }) => data.status === 'published'))
    .sort((a, b) => {
      const dateOrder = b.data.date.localeCompare(a.data.date);
      if (dateOrder) return dateOrder;
      if (a.data.timestamp && b.data.timestamp) return Date.parse(b.data.timestamp) - Date.parse(a.data.timestamp);
      return a.id.localeCompare(b.id);
    });
}
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const indexDate = (date: string) => `${months[Number(date.slice(5, 7)) - 1]} ${date.slice(8, 10)}`;
export const articleDate = (date: string) => `${indexDate(date)} ${date.slice(0, 4)}`;
export function recordedTime(timestamp: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(timestamp));
}
