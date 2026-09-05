# benroberts.io

Personal site and technical blog: Azure identity, Entra, PowerShell, and infrastructure automation.

Production site: https://benroberts.io

## Stack

- **Astro** static site (markdown content collections)
- **Shiki** for PowerShell syntax highlighting
- **Pagefind** client-side search
- **Azure Static Web Apps Free** + GitHub Actions

## Day-to-day: publish a post

```bash
npm run dev
```

1. Add `src/content/blog/<slug>/index.md` and images in that same folder.
2. `git add src/content/blog/<slug> && git commit && git push`
3. GitHub Actions builds and deploys to Azure Static Web Apps.

No separate image host. No second repo. Bicep under `infra/` is only for Azure resource changes.

## Local commands

```bash
npm install
npm run dev
npm run build
npm run preview
```
