import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  const strip = (md: string) =>
    md
      .replace(/^---[\s\S]*?---\s*/, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

  const payload = {
    meta: { generated: 'static', site: 'https://kinghaonan.github.io' },
    pages: [
      { title: '关于我', url: '/about/', text: 'Ki Haonan 航空航天工程 技术笔记 NUAA 轨道力学 最优化方法' },
      { title: '联系我', url: '/faqs/', text: 'kihaonan@126.com GitHub 微信 kihaonan 联系方式' },
      { title: '归档', url: '/archives/', text: '全部文章按时间归档' },
      { title: '标签与分类', url: '/blog/categories/', text: '标签云与文章分类' },
    ],
    posts: posts.map((p) => ({
      title: p.data.title,
      slug: p.id,
      date: p.data.date.toISOString().slice(0, 10),
      path: `/${p.id}/`,
      permalink: `https://kinghaonan.github.io/${p.id}/`,
      excerpt: p.data.description || '',
      text: strip(p.body || ''),
      categories: p.data.categories || [],
      tags: p.data.tags || [],
    })),
    categories: Object.entries(
      posts.reduce<Record<string, number>>((acc, p) => {
        for (const c of p.data.categories || []) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count })),
    tags: Object.entries(
      posts.reduce<Record<string, number>>((acc, p) => {
        for (const t of p.data.tags || []) acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count })),
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
