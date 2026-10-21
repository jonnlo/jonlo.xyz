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
  integrations: [markdoc(), ...(localEditor ? [react(), keystatic()] : [])],
  devToolbar: { enabled: false },
});
