import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

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
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({ pattern: '/api/tag-options', entrypoint: './src/editor/tag-options.ts', prerender: false });
      },
    },
  }] : [])],
  vite: {
    resolve: { dedupe: ['react', 'react-dom', '@keystar/ui', 'yjs'] },
    optimizeDeps: {
      include: localEditor ? [
        '@keystatic/core', '@keystatic/core/ui', '@keystatic/core/content-components',
        '@keystar/ui/core', '@keystar/ui/button', 'yjs',
      ] : [],
    },
  },
  devToolbar: { enabled: false },
});
