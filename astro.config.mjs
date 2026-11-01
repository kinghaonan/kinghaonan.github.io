// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// https://astro.build/config
export default defineConfig({
  site: 'https://kinghaonan.github.io',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [react(), sitemap()],
  markdown: {
    gfm: true,
    // 与原 Hexo 渲染行为对齐：单换行成 <br>、关闭智能引号（typographer 默认 false）
    remarkPlugins: [remarkMath, remarkBreaks],
    rehypePlugins: [rehypeRaw, rehypeKatex],
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: true,
    },
  },
  vite: {
    ssr: {
      // liquid-glass-react 的 CJS 产物缺 __esModule 标记，SSR 下走 ESM 产物
      noExternal: ['liquid-glass-react'],
    },
  },
});
