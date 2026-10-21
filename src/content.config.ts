import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Keep calendar dates and original timestamp offsets as strings. Converting these
// fields to Date would invent a time for date-only entries and discard offsets.
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const entries = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/entries' }),
  schema: z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    date: calendarDate,
    timestamp: z.iso.datetime({ offset: true }).optional().or(z.literal('')),
    form: z.enum(['essay', 'note', 'fragment']),
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

export const collections = { entries, now };
