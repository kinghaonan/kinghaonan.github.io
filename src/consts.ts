export const PER_PAGE = 10;
export const SITE_NAME = 'King Haonan';
export const SITE_URL = 'https://kinghaonan.github.io';
export const RUN_START = '2020-01-01';
/** 标签 URL slug：与旧 Hexo 站一致（小写化，保住已收录 URL） */
export const tagSlug = (t: string) => t.toLowerCase();
export const tagUrl = (t: string) => `/tags/${encodeURIComponent(tagSlug(t))}/`;
