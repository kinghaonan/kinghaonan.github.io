/**
 * MD 兼容性审计脚本
 * 扫描 source/_posts 下全部 .md 文件:
 *  - 图片引用(markdown + <img>)按 permalink(:title/ → /子路径/)解析,检查文件是否存在
 *  - 废弃 HTML 标签(<center>、align 属性)
 *  - 代码围栏配对、数学定界符、{% tag %} 插件、front-matter 字段
 * 用法:node build/audit-md.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS = path.join(ROOT, 'content-md');

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

function stripCodeFences(md) {
  // 移除围栏代码块内容,避免误报图片/标签
  return md.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, (m) => m.replace(/[^\n]/g, ''));
}

const issues = [];
const files = walk(POSTS);

for (const file of files) {
  const rel = path.relative(POSTS, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const body = stripCodeFences(raw);

  // front-matter
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  const fm = fmMatch ? fmMatch[1] : null;
  if (!fm) issues.push([rel, 'front-matter', '缺少 front-matter']);
  else {
    if (!/^title:/m.test(fm)) issues.push([rel, 'front-matter', '缺 title']);
    if (!/^date:/m.test(fm)) issues.push([rel, 'front-matter', '缺 date']);
  }

  // permalink 假定 :title/ → /blogs/xxx/
  const urlDir = '/' + rel.replace(/\.md$/, '') + '/';
  const imgRe = /(!\[[^\]]*\]\()\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;
  let m;
  while ((m = imgRe.exec(body))) {
    const src = m[2];
    if (/^(https?:|\/\/|data:)/.test(src)) continue;
    const resolved = path.posix.normalize(path.posix.join(urlDir, src));
    const fsPath = path.join(ROOT, 'public', resolved.replace(/^\//, ''));
    if (!fs.existsSync(fsPath)) {
      issues.push([rel, 'image', `markdown 图片不存在: ${src} → ${resolved}`]);
    }
  }

  const imgTagRe = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  while ((m = imgTagRe.exec(body))) {
    const src = m[1];
    if (/^(https?:|\/\/|data:)/.test(src)) continue;
    const resolved = path.posix.normalize(path.posix.join(urlDir, src));
    const fsPath = path.join(ROOT, 'public', resolved.replace(/^\//, ''));
    if (!fs.existsSync(fsPath)) {
      issues.push([rel, 'image', `<img> 图片不存在: ${src} → ${resolved}`]);
    }
  }

  // 废弃标签
  if (/<center[\s>]/i.test(body)) {
    const n = (body.match(/<center[\s>]/gi) || []).length;
    issues.push([rel, 'deprecated', `<center> × ${n}`]);
  }
  const alignRe = /<(div|p|img|table|td|th|h[1-6])[^>]*\salign=["'][^"']*["']/gi;
  while ((m = alignRe.exec(body))) {
    issues.push([rel, 'deprecated', `<${m[1]} align="...">`]);
  }

  // 代码围栏配对
  const fences = (raw.match(/^\s*(```|~~~)/gm) || []).length;
  if (fences % 2 !== 0) issues.push([rel, 'fence', `代码围栏数量为奇数(${fences})`]);

  // 数学定界符统计
  const inlineMath = (body.match(/\$[^$\n]+\$/g) || []).length;
  const blockMath = (body.match(/\$\$/g) || []).length;
  const bracketMath = (body.match(/\\\(|\\\[|\\begin\{/g) || []).length;

  // tag 插件
  const tags = body.match(/\{%[^%]*%\}/g) || [];
  const known = ['gallery', 'note', 'folding', 'tabs', 'tab', 'checkbox', 'btn', 'label',
    'image', 'audio', 'video', 'photos', 'post', 'index', 'timeline', 'timenode',
    'noteblock', 'raw', 'link', 'span', 'emoji', 'friendlink', 'score', 'powder'];
  for (const t of tags) {
    let name = (t.match(/\{%\s*:?[a-zA-Z]+/) || [])[0];
    name = name && name.replace(/\{%\s*:?/, '');
    if (!name) continue;
    const bare = name.replace(/^end/, '');
    const isEnd = name !== bare;
    if (!(known.includes(name.toLowerCase()) || (isEnd && known.includes(bare.toLowerCase())))) {
      issues.push([rel, 'tag-plugin', `未知 tag 插件: ${t.trim().slice(0, 60)}`]);
    }
  }
  const openEnd = (body.match(/\{%\s*end[a-zA-Z]+\s*%\}/g) || []).length;
  const openStart = tags.length - openEnd;

  // 数学渲染声明:正文含公式但 front-matter 未声明 mathjax
  const hasMath = /\$\$|\$[^$\n]+\$/.test(body) || /\\\(|\\\[|\\begin\{/.test(body);
  const declaresMathjax = !!fm && /plugins:[^\n]*(\[[^\]]*mathjax|\r?\n\s*-\s*mathjax)/i.test(fm);
  if (hasMath && !declaresMathjax) issues.push([rel, 'math', '含公式但 front-matter 未声明 plugins: [mathjax]']);
  if (!hasMath && declaresMathjax) issues.push([rel, 'math', '声明了 mathjax 但未检测到公式']);

  // html(true) 下的原始 HTML:报告自定义结构供人工核查
  const htmlBlocks = (body.match(/<div[^>]*>/gi) || []).length;

  console.log(`== ${rel}  (inline math:${inlineMath}, block $$:${blockMath / 2 | 0}, \\(:${bracketMath}, div:${htmlBlocks}, tags:${tags.length})`);
}

console.log('\n========== 问题清单 ==========');
if (issues.length === 0) console.log('(无)');
for (const [f, kind, msg] of issues) console.log(`[${kind}] ${f}: ${msg}`);
console.log(`\n共 ${files.length} 个文件,${issues.length} 个问题`);
