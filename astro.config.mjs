// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const sanitizeOptions = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    pre: [
      ...(defaultSchema.attributes?.pre || []),
      'className',
      'style',
      'tabIndex',
      'data*',
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
      'className',
      'style',
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      'className',
      'style',
    ],
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://benroberts.io',
  integrations: [sitemap()],
  vite: {
    build: {
      assetsInlineLimit: 0,
      modulePreload: {
        polyfill: false,
      },
    },
  },
  markdown: {
    rehypePlugins: [[rehypeSanitize, sanitizeOptions]],
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
