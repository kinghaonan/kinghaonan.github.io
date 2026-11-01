# kinghaonan.github.io

个人网站：[https://kinghaonan.github.io](https://kinghaonan.github.io)

基于 [Astro](https://astro.build/) + [React](https://react.dev/) 的自研主题（金色庄园），
水特效背景来自 [Paper Design Shaders](https://shaders.paper.design/)（Apache-2.0），
液态玻璃使用 [liquid-glass-react](https://github.com/rdev/liquid-glass-react)（MIT）。

## 本地开发

```bash
git clone https://github.com/kinghaonan/kinghaonan.github.io.git
cd kinghaonan.github.io
npm i
npm run dev        # http://localhost:4321
```

## 构建与部署

```bash
npm run build      # prebuild 适配层变换 + astro build → dist/
```

推送到 main 后 GitHub Actions（.github/workflows/deploy.yml）自动构建并把 dist/ 同步到
仓库根目录提交（GitHub Pages 用户站从 main 根提供服务），无需手动部署。

## 内容与结构

- `content-md/` — 全部文章的原始 Markdown（**写文章只改这里**，Volantis 插件语法原样保留）
- `build/gen-content.mjs` — 文档适配层：插件语法（gallery/timeline/noteblock 等）→ 语义 HTML，
  图片相对路径 → 站点绝对路径，产物生成到 `src/content/posts/`（不入库）
- `build/audit-md.js` — 文档兼容性审计（图片路径/公式声明/废弃标签回归检查）
- `src/` — 页面、组件与 React islands（液态玻璃卡片、搜索弹层、右键菜单）
- `public/` — 静态资产（image/ 壁纸与文章图、fonts/、水效引擎脚本）
- 水效参数在 `public/js/water-bg.js`；主题脚本（壁纸轮换/暗色/搜索联动）在 `src/scripts/theme.js`
