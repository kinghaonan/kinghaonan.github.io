/**
 * 下载圣托里尼壁纸（Wikimedia Commons，自由许可）→ public/image/bg/cover-01..12.jpg
 * 同时生成 CREDITS.md（标题/作者/许可/来源页）
 * 用法：node build/dl-walls.mjs
 */
import fs from 'node:fs';

const PICKS = [
  'The Santorini Caldera.jpg',
  'Imerovigli view from drone - Santorini.jpg',
  'Aerophotography of Thira, Greece.jpg',
  'Imerovigli Panoramic 360 View - Santorini.jpg',
  'Cliffs in Santorini, Greece.jpg',
  'Santorini-CalderaDEC2024-1JPG.jpg',
  '1000 Three domes of Oia in Santorini Photo by Giles Laurent.jpg',
  'Thira (Santorini) - Ia-01.jpg',
  'View of Oia, Santorini.jpg',
  'Oia in Santorini, Greece 001.jpg',
  'Oia, Ammoudi harbour, Santorini, Greece 001.JPG',
  'Panoramic view of Oia, Santorini island (Thira), Greece.jpg',
];

const strip = (s) => String(s || '').replace(/<[^>]+>/g, '').trim();

const records = [];
for (const f of ['build/tmp-santo.json', 'build/tmp-santo2.json']) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const p of Object.values(d.query?.pages || {})) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const title = p.title.replace(/^File:/, '');
    if (!PICKS.includes(title)) continue;
    const em = ii.extmetadata || {};
    records.push({
      title,
      thumb: ii.thumburl,
      descUrl: ii.descriptionurl,
      license: strip(em.LicenseShortName?.value) || 'see source page',
      artist: strip(em.Artist?.value) || 'unknown',
    });
  }
}

const ordered = PICKS.map((t) => records.find((r) => r.title === t)).filter(Boolean);
console.log(`选中 ${ordered.length}/${PICKS.length} 张`);

let credits = '# 壁纸出处（Wikimedia Commons，自由许可）\n\n';
let i = 0;
for (const r of ordered) {
  i += 1;
  const name = `cover-${String(i).padStart(2, '0')}.jpg`;
  const res = await fetch(r.thumb, { headers: { 'User-Agent': 'kinghaonan-site/1.0 (personal blog)' } });
  if (!res.ok) {
    console.log('FAIL', name, r.title, res.status);
    continue;
  }
  fs.writeFileSync(`public/image/bg/${name}`, Buffer.from(await res.arrayBuffer()));
  credits += `## ${name}\n- 图题：${r.title}\n- 作者：${r.artist}\n- 许可：${r.license}\n- 来源：${r.descUrl}\n`;
  console.log('OK', name, r.title.slice(0, 50));
}
fs.writeFileSync('public/image/bg/CREDITS.md', credits);
console.log('完成，CREDITS.md 已生成');
