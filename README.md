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

1. Create a content branch:
   ```bash
   git checkout -b post/<slug>
   ```
2. Add `src/content/blog/<slug>/index.md` and any images in that same folder.
   - `description` in frontmatter is the stored card & SEO summary (1–2 punchy sentences, ~140–220 chars), not a body excerpt.
   - `heroImage` points to `./cover.webp` (or `./cover.png`/`./cover.jpg`) colocated in the post folder.
3. Commit and push the branch:
   ```bash
   git add src/content/blog/<slug>
   git commit -m "Add post: <title>"
   git push -u origin post/<slug>
   ```
4. Open a Pull Request into `main`. The `Validate Site Build` check will test the Astro build and search indexing.
5. Merge the PR. GitHub Actions deploys automatically to Azure Static Web Apps (`Deploy to Production`).

No separate image host. No second repo. Bicep under `infra/` is only for Azure resource changes.

## Local commands

```bash
npm install
npm run dev
npm run build
npm run preview
```
