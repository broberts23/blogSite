import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export const NEW_WINDOW_DAYS = 90;

export function isNew(date: Date, now = new Date()): boolean {
  return now.valueOf() - date.valueOf() <= NEW_WINDOW_DAYS * 86_400_000;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function postSlug(post: BlogPost): string {
  // folder name is the public slug: content/blog/<slug>/index.md
  const id = post.id.replace(/\/index$/, '').replace(/\\/g, '/');
  return id.split('/').pop() ?? id;
}

export function uniqueTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
