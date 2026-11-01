import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_URL, SITE_NAME } from '../consts';

export const GET = async () => {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
  return rss({
    title: SITE_NAME,
    description: 'King Haonan 的个人庄园——航空航天·轨道力学·技术笔记',
    site: SITE_URL,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description || '',
      pubDate: p.data.date,
      link: `/${p.id}/`,
      categories: [...(p.data.categories || []), ...(p.data.tags || [])],
    })),
    customData: `<language>zh-cn</language>`,
  });
};
