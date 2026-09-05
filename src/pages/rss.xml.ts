import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getPublishedPosts, postSlug } from '../utils/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  return rss({
    title: 'benroberts.io',
    description: 'Azure, identity security, and automation notes by Ben Roberts.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/${postSlug(post)}`,
      categories: post.data.tags,
    })),
  });
};
