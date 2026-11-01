import { getCollection } from 'astro:content';
import { PER_PAGE } from '../consts';

export interface ArchPath {
  params: { rest: string | undefined };
  props: {
    items: any[];
    currentPage: number;
    lastPage: number;
    basePath: string;
    label: string;
    total: number;
  };
}

function paginate(
  items: any[],
  basePath: string,
  rest: string | undefined,
  label: string,
  total: number
): ArchPath[] {
  const lastPage = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const pages: ArchPath[] = [];
  for (let n = 1; n <= lastPage; n++) {
    let restParam: string | undefined;
    if (!rest) {
      restParam = n === 1 ? undefined : `page/${n}`;
    } else {
      restParam = n === 1 ? rest : `${rest}/page/${n}`;
    }
    pages.push({
      params: { rest: restParam },
      props: {
        items: items.slice((n - 1) * PER_PAGE, n * PER_PAGE),
        currentPage: n,
        lastPage,
        basePath,
        label,
        total,
      },
    });
  }
  return pages;
}

export async function getArchivePaths(): Promise<ArchPath[]> {
  const posts = (await getCollection('posts')).sort(
    (a: any, b: any) => b.data.date.getTime() - a.data.date.getTime()
  );
  const paths: ArchPath[] = [];

  paths.push(...paginate(posts, '/archives/', undefined, '全部文章', posts.length));

  const byYear: Record<string, any[]> = {};
  const byMonth: Record<string, any[]> = {};
  for (const p of posts) {
    const iso = p.data.date.toISOString();
    const y = iso.slice(0, 4);
    const m = iso.slice(5, 7);
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(p);
    const ym = `${y}/${m}`;
    if (!byMonth[ym]) byMonth[ym] = [];
    byMonth[ym].push(p);
  }
  for (const y of Object.keys(byYear)) {
    paths.push(...paginate(byYear[y], `/archives/${y}/`, y, `${y} 年`, byYear[y].length));
  }
  for (const ym of Object.keys(byMonth)) {
    const parts = ym.split('/');
    const y = parts[0];
    const m = parts[1];
    paths.push(
      ...paginate(byMonth[ym], `/archives/${y}/${m}/`, ym, `${y} 年 ${parseInt(m, 10)} 月`, byMonth[ym].length)
    );
  }
  return paths;
}
