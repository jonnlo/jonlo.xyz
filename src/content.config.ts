import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { calendarDateValue } from './lib/calendar-date.mjs';

// Keep calendar dates and original timestamp offsets as strings. Converting these
// fields to Date would invent a time for date-only entries and discard offsets.
const calendarDate = z.preprocess(calendarDateValue, z.iso.date());
const entries = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/entries' }),
  schema: z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    date: calendarDate,
    lastEdited: z.iso.datetime({ offset: true }).optional().or(z.literal('')),
    timestamp: z.iso.datetime({ offset: true }).optional().or(z.literal('')),
    form: z.enum(['essay', 'note', 'crumb']),
    concepts: z.array(z.string().min(1)),
    summary: z.string().optional(),
    status: z.enum(['draft', 'published']).default('draft'),
    sample: z.boolean().default(false),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/now' }),
  schema: z.object({
    name: z.string().min(1),
    date: z.iso.date(),
    status: z.enum(['draft', 'published']).default('draft'),
    items: z.array(z.object({ label: z.string().min(1), text: z.string() })),
  }),
});

const tags = defineCollection({
  loader: glob({
    pattern: '*.json', base: './src/content/tags',
    // Preserve existing case/spaces in IDs so old archive links stay valid.
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z.object({ name: z.string().trim().min(1).max(100) }),
});

const about = defineCollection({
  loader: glob({ pattern: 'about.mdoc', base: './src/content' }),
  schema: z.object({ heading: z.string().min(1) }),
});

const nowPage = defineCollection({
  loader: glob({ pattern: 'now-page.json', base: './src/content' }),
  schema: z.object({
    heading: z.string().min(1),
    description: z.string().min(1),
  }),
});

export const collections = { entries, now, tags, about, nowPage };
