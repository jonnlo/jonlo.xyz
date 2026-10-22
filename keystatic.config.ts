import { createElement } from 'react';
import { collection, config, fields, singleton } from '@keystatic/core';
import { mark, wrapper } from '@keystatic/core/content-components';
import { tagsField } from './src/editor/TagsField';
import { timestampField } from './src/editor/TimestampField';
import { lastEditedField } from './src/editor/LastEditedField';

export default config({
  storage: { kind: 'local' },
  collections: {
    entries: collection({
      label: 'Entries',
      path: 'src/content/entries/*',
      slugField: 'name',
      columns: ['title', 'form', 'date', 'lastEdited', 'status'],
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        name: fields.slug({
          name: { label: 'Internal name', validation: { isRequired: true } },
          slug: { label: 'URL slug' },
        }),
        title: fields.text({
          label: 'Title',
          description: 'Optional for a crumb. The internal name identifies untitled entries in the editor.',
        }),
        date: fields.date({ label: 'Entry date', validation: { isRequired: true } }),
        lastEdited: lastEditedField(),
        timestamp: timestampField(),
        form: fields.select({
          label: 'Format',
          options: [
            { label: 'Essay', value: 'essay' },
            { label: 'Note', value: 'note' },
            { label: 'Crumb', value: 'crumb' },
          ],
          defaultValue: 'note',
        }),
        concepts: tagsField(),
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
            marginNote: wrapper({ label: 'In the margin', schema: { title: fields.text({ label: 'Margin heading' }) } }),
            smallText: mark({ label: 'Small text', icon: createElement('span', null, 'Aa'), tag: 'small', schema: {} }),
          },
        }),
      },
    }),
    tags: collection({
      label: 'Tags',
      path: 'src/content/tags/*',
      slugField: 'name',
      columns: ['name'],
      format: { data: 'json' },
      schema: {
        name: fields.slug({
          name: { label: 'Tag name', validation: { isRequired: true, length: { max: 100 } } },
          slug: { label: 'Tag ID', description: 'Used in links and entry references. Rename the tag using Tag name; keep this ID unchanged.' },
        }),
      },
    }),
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
          text: fields.markdoc.inline({
            label: 'Description',
            options: {
              bold: true, italic: true, link: true,
              orderedList: true, unorderedList: true,
              heading: false, blockquote: false, table: false, image: false,
              divider: false, code: false, codeBlock: false, strikethrough: false,
            },
          }),
        }), {
          label: 'Activities',
          description: 'Descriptions are shown in the list so you can review all activities together. Select a row to edit it.',
          itemLabel: (props) => {
            const label = props.fields.label.value;
            const document = props.fields.text.value.doc;
            const description = document.textBetween(0, document.content.size, ' ').trim();
            return description ? `${label}: ${description}` : label;
          },
        }),
      },
    }),
  },
  singletons: {
    nowPage: singleton({
      label: 'Now page',
      path: 'src/content/now-page',
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
      },
    }),
    about: singleton({
      label: 'About',
      path: 'src/content/about',
      format: { contentField: 'body' },
      entryLayout: 'content',
      schema: {
        heading: fields.text({ label: 'Heading', multiline: true, validation: { isRequired: true } }),
        body: fields.markdoc({
          label: 'Body',
          components: { smallText: wrapper({ label: 'Small text', schema: {} }) },
        }),
      },
    }),
  },
});
