import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import { entryListPlugin } from './src/editor/entry-list-plugin.mjs';

// Astro config is an object; the editor integration is added only to `astro dev`.
const localEditor = process.argv.includes('dev');
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  // Keystatic's local API requests omit trailing slashes. Public links still
  // consistently use them, while dev accepts either form.
  trailingSlash: 'ignore',
  integrations: [markdoc(), ...(localEditor ? [react(), keystatic(), {
    name: 'local-tag-suggestions',
    hooks: {
      'astro:config:setup': ({ injectRoute, addMiddleware }) => {
        injectRoute({ pattern: '/api/tag-options', entrypoint: './src/editor/tag-options.ts', prerender: false });
        addMiddleware({ entrypoint: fileURLToPath(new URL('./src/editor/last-edited-middleware.ts', import.meta.url)), order: 'pre' });
      },
    },
  }] : [])],
  vite: {
    // Local table conventions: Entries by date, Tags by name with a Tag ID.
    plugins: localEditor ? [entryListPlugin()] : [],
    resolve: { dedupe: ['react', 'react-dom', '@keystar/ui', 'yjs'] },
    optimizeDeps: {
      rolldownOptions: { plugins: localEditor ? [entryListPlugin()] : [] },
      include: localEditor ? [
        '@keystatic/core', '@keystatic/core/ui', '@keystatic/core/content-components',
        '@keystar/ui/core', '@keystar/ui/button', 'yjs',
      ] : [],
    },
  },
  devToolbar: { enabled: false },
});
