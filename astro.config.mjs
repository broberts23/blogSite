// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://benroberts.io',
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark-dimmed',
      langs: [
        'powershell',
        'ps1',
        'bash',
        'shell',
        'bicep',
        'json',
        'yaml',
        'python',
        'typescript',
        'javascript',
        'csharp',
        'sql',
        'dockerfile',
        'xml',
        'html',
        'css',
        'diff',
        'text',
      ],
      wrap: true,
    },
  },
  prefetch: true,
});
