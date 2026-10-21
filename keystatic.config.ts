import { collection, config, fields, singleton } from '@keystatic/core';
import { wrapper } from '@keystatic/core/content-components';

export default config({
  storage: { kind: 'local' },
  collections: {
    now: collection({
      label: 'Now updates',
      path: 'src/content/now/*',
      slugField: 'name',
      format: { data: 'json' },
      columns: ['date', 'status'],
      schema: {
        name: fields.slug({
          name: { label: 'Update name', description: 'For example: 2026-10-21. Add a new update to keep earlier records.', validation: { isRequired: true } },
          slug: { label: 'Record ID' },
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        status: fields.select({
          label: 'Status',
          options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
          defaultValue: 'draft',
        }),
        items: fields.array(fields.object({
          label: fields.text({ label: 'Activity', validation: { isRequired: true } }),
          text: fields.text({ label: 'Description', multiline: true }),
        }), { label: 'Activities', itemLabel: (props) => props.fields.label.value }),
      },
    }),
    entries: collection({
      label: 'Entries',
      path: 'src/content/entries/*',
      slugField: 'name',
      columns: ['title', 'form', 'date', 'status'],
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        name: fields.slug({
          name: { label: 'Internal name', validation: { isRequired: true } },
          slug: { label: 'URL slug' },
        }),
        title: fields.text({
          label: 'Title',
          description: 'Optional for a line. The internal name identifies untitled entries in the editor.',
        }),
        date: fields.date({ label: 'Date', validation: { isRequired: true } }),
        timestamp: fields.text({
          label: 'Precise timestamp (optional)',
          description: 'Only if known: for example 2026-09-14T17:42:08+08:00. Keep the original timezone offset.',
        }),
        form: fields.select({
          label: 'Format',
          options: [
            { label: 'Essay', value: 'essay' },
            { label: 'Note', value: 'note' },
            { label: 'Line', value: 'fragment' },
          ],
          defaultValue: 'note',
        }),
        concepts: fields.array(fields.text({ label: 'Concept', validation: { isRequired: true } }), {
          label: 'Concepts',
          itemLabel: (props) => props.value,
        }),
        summary: fields.text({ label: 'Summary', multiline: true, description: 'Essay excerpt shown in the journal.' }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        }),
        sample: fields.checkbox({ label: 'Illustrative sample', defaultValue: false }),
        body: fields.markdoc({
          label: 'Body',
          components: {
            marginNote: wrapper({ label: 'In the margin', schema: {} }),
          },
        }),
      },
    }),
  },
  singletons: {
    about: singleton({
      label: 'About',
      path: 'src/content/about',
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
        paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
          label: 'About paragraphs',
          itemLabel: (props) => props.value,
        }),
      },
    }),
  },
});
