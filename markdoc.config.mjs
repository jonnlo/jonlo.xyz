import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  tags: {
    marginNote: {
      render: component('./src/components/MarginNote.astro'),
    },
  },
});
