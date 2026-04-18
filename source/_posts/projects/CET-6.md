---
title: 项目
date: 2020-04-04
categories: [project]
discription: 六级乱序单词
---
# 📚 CET-6 词汇修炼

> 一个优雅、高效的大学英语六级词汇学习工具

https://opensource.org/licenses/MIT 

https://developer.mozilla.org/en-US/docs/Web/HTML 

https://developer.mozilla.org/en-US/docs/Web/JavaScript 

https://developer.mozilla.org/en-US/docs/Web/CSS

![image-20260324165727022](./../../image/project/cet-6/review.png) 

## ✨ 特性

- 🎨 **精美设计** - 采用现代极简风格，支持浅色/深色主题切换
- 📖 **完整词库** - 内置 5548 个 CET-6 核心词汇
- 🔍 **智能搜索** - 实时搜索，快速定位单词
- 🎯 **学习追踪** - 标记已学/收藏单词，记录学习进度
- ⌨️ **快捷键支持** - 键盘操作，学习效率翻倍
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🌙 **深色模式** - 护眼设计，夜间学习更舒适

## 🚀 快速开始

### 在线体验

直接在浏览器中打开 `index.html` 即可使用，无需安装任何依赖。

bash

复制

```bash
# 克隆仓库
git clone https://github.com/kinghaonan/CET-6.git

# 进入目录
cd cet6-vocabulary

# 打开应用（任选其一）
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### 本地服务器

bash

复制

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 🎮 使用指南

### 基础操作

表格

| 操作       | 说明                |
| :--------- | :------------------ |
| `←` / `→`  | 上一个 / 下一个单词 |
| `R`        | 随机跳转到任意单词  |
| `S`        | 播放单词发音        |
| `F`        | 收藏 / 取消收藏     |
| `L`        | 标记为已学 / 未学   |
| `点击单词` | 播放发音            |

### 筛选模式

- **全部** - 显示所有 5548 个单词
- **未学** - 仅显示未学习的单词
- **已学** - 仅显示已标记为学会的单词
- **收藏** - 仅显示收藏的单词

### 搜索功能

在顶部搜索框输入单词，支持实时模糊匹配，快速跳转到目标单词。

## 🏗️ 项目结构

plain

复制

```plain
cet6-vocabulary/
├── index.html          # 主应用文件
├── README.md           # 项目说明
└── assets/             # 资源文件（可选）
    ├── favicon.ico
    └── preview.png
```

## 🛠️ 技术栈

- **原生 HTML5** - 语义化标签，无障碍访问
- **现代 CSS3** - CSS Variables, Flexbox, Grid, 动画
- **Vanilla JavaScript** - 零依赖，高性能
- **Local Storage API** - 本地数据持久化
- **Web Speech API** - 语音朗读功能

## 📊 数据格式

单词数据采用 JSON 格式存储：

JavaScript

复制

```javascript
{
  "id": 1,
  "word": "meanwhile",
  "phonetic": "'mi:n'wail",
  "definition": "adv.同时 当时 n.其时 其间"
}
```

## 🎨 主题定制

通过 CSS 变量轻松自定义主题：

```css
:root {
  --bg-primary: #f4f1eb;      /* 主背景色 */
  --bg-secondary: #ede8df;    /* 次背景色 */
  --accent: #c45d3e;          /* 强调色 */
  --learned-color: #5a8a6a;   /* 已学标记色 */
  --favorite-color: #d4894e;  /* 收藏标记色 */
}
```

## 📝 开发计划

- [ ] 添加单词例句
- [ ] 支持导入/导出学习记录
- [ ] 添加学习统计图表
- [ ] 支持单词本导出为 PDF
- [ ] 添加记忆曲线复习提醒
- [ ] 支持自定义词库导入

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT](https://www.kimi.com/chat/LICENSE) 许可证开源。

## 🙏 致谢

- 词汇数据来源于大学英语六级考试大纲
- 字体：[Crimson Pro](https://fonts.google.com/specimen/Crimson+Pro), [Noto Sans SC](https://fonts.google.com/specimen/Noto+Sans+SC)
- 灵感来源于 [Quizlet](https://quizlet.com/) 和 [Anki](https://apps.ankiweb.net/)

------

<p align="center">   Made with ❤️ for CET-6 learners </p>
