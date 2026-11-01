import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // 保持原始路径大小写（/projects/CET-6/ 与旧站一致，不被 slug 化小写）
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      categories: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      description: z.string().optional(),
      headimg: z.string().optional(),
    })
    .passthrough(),
});

export const collections = { posts };
