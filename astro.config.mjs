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
    // lightningcss 会把标准 backdrop-filter 转 -webkit- 并丢弃（Chromium 不认 webkit 前缀）
    build: { cssMinify: 'esbuild' },
  },
});
