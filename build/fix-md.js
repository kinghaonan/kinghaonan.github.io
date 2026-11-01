/**
 * MD 兼容性修复脚本(配套 audit-md.js)
 *  - <center>X</center> → <p style="text-align: center">X</p>(代码围栏内的示例不动)
 *  - <div|p align='center'> → <div|p style="text-align: center">
 *  - 复变函数4 的 attachments/ 哈希图片路径 → 站点图片目录
 * 用法:node build/fix-md.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const POSTS = path.join(ROOT, 'source', '_posts');

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

let totalChanges = 0;
for (const file of walk(POSTS)) {
  const rel = path.relative(POSTS, file);
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  let inFence = false;
  let fenceMark = '';
  let changed = 0;

  const lines = raw.split(/\r?\n/).map((line) => {
    const fence = line.match(/^\s*(```|~~~)/);
    if (fence) {
      if (!inFence) { inFence = true; fenceMark = fence[1]; }
      else if (line.trim().startsWith(fenceMark)) { inFence = false; }
      return line;
    }
    if (inFence) return line;

    let out = line;
    // <center>图注</center> → <p style="text-align: center">图注</p>
    out = out.replace(/^([ \t]*)<center>(.*)<\/center>[ \t]*$/, '$1<p style="text-align: center">$2</p>');
    // align 属性 → style
    out = out.replace(/<div align=['"]center['"]>/g, '<div style="text-align: center">');
    out = out.replace(/<p align=['"]center['"]>/g, '<p style="text-align: center">');
    // 已有 style 的 flex 容器,align 冗余,直接移除
    out = out.replace(/<div align=['"]center['"](\s+style=)/g, '<div$1');
    // 复变函数4 的 attachments 引用
    if (rel.includes('复变函数4')) {
      out = out.replace(/attachments\/([0-9a-f]{64})\.jpg/g, './../../image/复变函数/4/$1.jpg');
    }

    if (out !== line) changed++;
    return out;
  });

  if (changed > 0) {
    fs.writeFileSync(file, lines.join(eol));
    totalChanges++;
    console.log(`fixed ${changed} 行:`, rel);
  }
}
console.log(`\n修改文件数: ${totalChanges}`);
