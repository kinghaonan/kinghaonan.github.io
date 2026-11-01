/**
 * 文档适配层：content-md/（原始 md，零改动保留）→ src/content/posts/（构建期变换）
 * - Volantis 插件语法 → 自有语义 HTML（gallery/note/folding/noteblock/timeline/timenode/tabs/
 *   span/p/btn/link/video/audio/u/emp/del/wavy，raw 标记剥离并保护内部字面量）
 * - 图片相对路径 → 站点绝对路径（/image/...）
 * - front-matter 原样保留（headimg 重写为绝对路径）
 * 用法：node build/gen-content.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SRC = path.join(ROOT, 'content-md');
const OUT = path.join(ROOT, 'src', 'content', 'posts');

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue; // 跳过 .obsidian 等
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: '', body: raw };
  return { fm: m[1], body: m[2] };
}

/* ---------- 语法变换 ---------- */

let rawSlots = [];
function protectRaw(s) {
  rawSlots = [];
  return s.replace(/\{%\s*raw\s*%\}([\s\S]*?)\{%\s*endraw\s*%\}/gi, (_, inner) => {
    rawSlots.push(inner);
    return `\u0000RAW${rawSlots.length - 1}\u0000`;
  });
}
function restoreRaw(s) {
  return s.replace(/\u0000RAW(\d+)\u0000/g, (_, i) => rawSlots[Number(i)]);
}

const COLOR_WORDS = new Set(['blue', 'red', 'yellow', 'green', 'gray', 'grey', 'pink', 'purple', 'cyan', 'orange', 'gold']);
const TYPE_WORDS = new Set(['info', 'error', 'success', 'quote', 'warning', 'warning', 'idea', 'danger', 'bug', 'note', 'default']);

function classFromArgs(args) {
  const words = String(args || '').trim().split(/\s+/).filter(Boolean);
  const cls = [];
  for (const w of words) {
    const lw = w.toLowerCase();
    if (COLOR_WORDS.has(lw)) cls.push(`is-${lw}`);
    else if (TYPE_WORDS.has(lw)) cls.push(`t-${lw}`);
    else if (lw === 'theme') cls.push('is-gold');
  }
  return cls;
}

function transformVolantis(body) {
  let s = protectRaw(body);

  // timenode 必须先于 timeline（timenode 嵌在 timeline 内部）
  s = s.replace(/\{%\s*timenode\s+([^%]*?)\s*%\}\s*([\s\S]*?)\s*\{%\s*endtimenode\s*%\}/gi,
    (_, title, inner) =>
      `\n<div class="v-timenode"><div class="v-timenode-title">${title.trim()}</div><div class="v-timenode-body">\n\n${inner.trim()}\n\n</div></div>\n`);
  s = s.replace(/\{%\s*timeline\s*%\}\s*([\s\S]*?)\s*\{%\s*endtimeline\s*%\}/gi,
    (_, inner) => `\n<div class="v-timeline">\n${inner.trim()}\n</div>\n`);

  // gallery：支持 stretch::列数::间隙 变体
  s = s.replace(/\{%\s*gallery(?:\s+([^%]*?))?\s*%\}\s*([\s\S]*?)\s*\{%\s*endgallery\s*%\}/gi,
    (_, args, inner) => {
      const a = String(args || '').trim();
      let cls = 'v-gallery';
      let style = '';
      if (/^stretch/i.test(a)) {
        cls += ' v-gallery--stretch';
        const parts = a.split('::');
        if (parts[1]) style = ` style="--v-cols:${parseInt(parts[1], 10) || 2}"`;
      }
      return `\n<div class="${cls}"${style}>\n${inner.trim()}\n</div>\n`;
    });

  // noteblock：块级标注（颜色/类型词转修饰类）
  s = s.replace(/\{%\s*noteblock\s+([^%]*?)\s*%\}\s*([\s\S]*?)\s*\{%\s*endnoteblock\s*%\}/gi,
    (_, args, inner) => {
      const cls = classFromArgs(args).join(' ');
      return `\n<div class="v-noteblock${cls ? ' ' + cls : ''}">\n\n${inner.trim()}\n\n</div>\n`;
    });

  // folding：折叠（[color:: ]标题）
  s = s.replace(/\{%\s*folding\s+([^%]*?)\s*%\}\s*([\s\S]*?)\s*\{%\s*endfolding\s*%\}/gi,
    (_, args, inner) => {
      let color = '';
      let title = args.trim();
      const m = title.match(/^([a-z]+)\s*::\s*(.*)$/i);
      if (m) { color = COLOR_WORDS.has(m[1].toLowerCase()) ? ` is-${m[1].toLowerCase()}` : ''; title = m[2].trim(); }
      return `\n<details class="v-folding${color}"><summary>${title}</summary><div class="v-folding-body">\n\n${inner.trim()}\n\n</div></details>\n`;
    });

  // tabs：<!-- tab 标题 --> ... <!-- endtab --> 分片
  s = s.replace(/\{%\s*tabs\s+([^%]*?)\s*%\}\s*([\s\S]*?)\s*\{%\s*endtabs\s*%\}/gi,
    (_, args, inner) => {
      const panes = [];
      const re = /<!--\s*tab\s+([\s\S]*?)\s*-->\s*([\s\S]*?)\s*<!--\s*endtab\s*-->/g;
      let m;
      while ((m = re.exec(inner))) panes.push({ title: m[1].trim(), body: m[2].trim() });
      if (!panes.length) return inner;
      const nav = panes.map((p, i) =>
        `<button class="v-tabs-tab${i === 0 ? ' is-active' : ''}" data-vtab="${i}" type="button">${p.title}</button>`).join('');
      const bodies = panes.map((p, i) =>
        `<div class="v-tabs-pane${i === 0 ? ' is-active' : ''}" data-vtab-pane="${i}">\n\n${p.body}\n\n</div>`).join('\n');
      return `\n<div class="v-tabs"><div class="v-tabs-nav">${nav}</div>${bodies}</div>\n`;
    });

  // note：单行标注 {% note type :: text %}
  s = s.replace(/\{%\s*note\s+([^%:]*?)\s*::\s*([^%]*?)\s*%\}/gi,
    (_, type, text) => {
      const cls = classFromArgs(type).join(' ');
      return `<div class="v-note${cls ? ' ' + cls : ''}">${text.trim()}</div>`;
    });

  // btn：{% btn, 文本, url %} 或 {% btn url, 文本 %}
  s = s.replace(/\{%\s*btn\s*,?\s*([^%]*?)\s*%\}/gi,
    (_, args) => {
      const parts = args.split(',').map((x) => x.trim()).filter(Boolean);
      let url = '#', text = '按钮';
      if (parts.length >= 2) {
        if (/^https?:\/\//.test(parts[0])) { url = parts[0]; text = parts[1]; }
        else { text = parts[0]; url = parts[1]; }
      }
      return `<a class="v-btn" href="${url}" target="_blank" rel="noopener">${text}</a>`;
    });

  // link：{% link 标题::链接::图标 %}
  s = s.replace(/\{%\s*link\s+([^%]*?)\s*%\}/gi,
    (_, args) => {
      const [title, url, icon] = args.split('::').map((x) => (x || '').trim());
      return `<a class="v-link" href="${url || '#'}" target="_blank" rel="noopener">${icon ? `<img class="v-link-icon" src="${icon}" alt="" loading="lazy">` : ''}<span class="v-link-title">${title || url}</span></a>`;
    });

  // video / audio（兼容全角逗号参数）
  s = s.replace(/\{%\s*video\s+([^,%，\s]+)[^%]*%\}/gi, (_, src) => `<div class="v-media"><video controls preload="metadata" src="${src}"></video></div>`);
  s = s.replace(/\{%\s*audio\s+([^,%，\s]+)[^%]*%\}/gi, (_, src) => `<div class="v-media"><audio controls preload="metadata" src="${src}"></audio></div>`);

  // p / span：样式类段落与行内
  s = s.replace(/\{%\s*p\s+([^,%]+?)\s*,\s*([\s\S]*?)\s*%\}/gi, (_, cls, text) => `\n<p class="v-p ${String(cls).trim().split(/\s+/).map((c) => 'vp-' + c).join(' ')}">${text.trim()}</p>\n`);
  s = s.replace(/\{%\s*span\s+([^,%]+?)\s*,\s*([\s\S]*?)\s*%\}/gi, (_, cls, text) => `<span class="v-span ${String(cls).trim().split(/\s+/).map((c) => 'vs-' + c).join(' ')}">${text.trim()}</span>`);

  // 行内成对标签
  s = s.replace(/\{%\s*u\s*%\}([\s\S]*?)\{%\s*endu\s*%\}/gi, '<u>$1</u>');
  s = s.replace(/\{%\s*emp\s*%\}([\s\S]*?)\{%\s*endemp\s*%\}/gi, '<em>$1</em>');
  s = s.replace(/\{%\s*del\s*%\}([\s\S]*?)\{%\s*enddel\s*%\}/gi, '<del>$1</del>');
  s = s.replace(/\{%\s*wavy\s*%\}([\s\S]*?)\{%\s*endwavy\s*%\}/gi, '<span class="v-wavy">$1</span>');

  // 图片路径：相对 → 站点绝对（markdown 引用与 HTML src）
  // 前缀形态兼容：./../../ 、 ../../ 、 / 、 ./ 等
  const REL = '(?:\\.{1,2}/|\\.\\./|/)*';
  s = s.replace(new RegExp('\\]\\(\\s*' + REL + 'image/', 'g'), '](/image/');
  s = s.replace(new RegExp("(src=)(['\"])" + REL + 'image/', 'g'), '$1$2/image/');
  s = s.replace(new RegExp("(href=)(['\"])" + REL + 'image/', 'g'), '$1$2/image/');

  return restoreRaw(s);
}

function transformFrontmatter(fm) {
  return fm
    .replace(/(headimg:\s*)(?:\.{1,2}\/|\.\.\/|\/)*image\//g, '$1/image/');
}

/* ---------- 主流程 ---------- */

let ok = 0, fail = 0;
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const { fm, body } = splitFrontmatter(raw);
  const out = `---\n${transformFrontmatter(fm)}\n---\n\n${transformVolantis(body)}`;
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out, 'utf8');
  ok++;
}
console.log(`gen-content: ${ok} 篇生成到 src/content/posts/` + (fail ? `，失败 ${fail}` : ''));
