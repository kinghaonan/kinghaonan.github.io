---
title: "Volantis社区模板配置指南"
date: 2025-11-22
categories: [blog]
tags: [网站搭建,Volantis]
description: 使用Volantis快速搭建自己的网站。
headimg: ./../../image/volantis配置/bg.png
---

# Volantis社区模板配置指南

## 1. 获取源码
对于像我这样的新手而言，自己查看文档从头搭建自己的网站可能太难了，不如直接获取Volantis社区模板作为自己的网站。
在开始之前，要安装Git和Node.js。

### 安装 Git
- Windows：下载并安装 [git](https://git-scm.com/install/windows)
- Mac：使用 [Homebrew](https://mxcl.github.com/homebrew/), [MacPorts](https://www.macports.org/) 或者下载 [安装程序](https://sourceforge.net/projects/git-osx-installer/)。
### 安装 Node.js
- Node.js 为大多数平台提供了官方的 [安装程序](https://nodejs.org/zh-cn/download/)。
其它的安装方法：
- Windows：通过 [nvs](https://github.com/jasongin/nvs/)（推荐）或者 [nvm](https://github.com/nvm-sh/nvm) 安装。
- Mac：使用 [Homebrew](https://brew.sh/) 或 [MacPorts](https://www.macports.org/) 安装。  
其它：使用相应的软件包管理器进行安装。 可以参考由 Node.js 提供的 [指导]  (https://nodejs.org/en/download)。
对于 Mac 和 Linux 同样建议使用 nvs 或者 nvm，以避免可能会出现的权限问题。

>关于两个程序的安装详情参考 [Hexo](https://hexo.io/zh-cn/docs/) 官方文档 

接着可以参考 [Volantis](https://volantis.js.org/)里的示例，可以找自己喜欢的模板，不过大部分是没有源码的，这里我们用社区的 [源码](https://github.com/volantis-x/community)。
在你的空文件夹下 cmd：
```bash
git clone --recursive https://github.com/volantis-x/community && cd community && npm i && hexo s
```
然后浏览器访问 http://localhost:4000/ （默认）你会看到和 [社区](https://github.com/volantis-x/community)一样的界面，接下来ctrl+c退出，我们删掉不必要的内容，然后添加个性化内容。
## 2. 更改导航栏

![导航栏](./../../image/volantis配置/导航栏.png)

导航栏配置位于 `_config.volantis.yml` 文件的 `navbar` 部分：

### Logo设置
- 修改 `navbar.logo.img` 设置自定义图片（路径相对于 `source/` 目录）
- 或修改 `navbar.logo.title` 设置文字标题

示例：
```yaml
navbar:
  logo:
    img: volantis-static/media/my-logo.png
    # 或
    title: '我的个人网站'
```

### 主菜单修改

![主菜单](./../../image/volantis配置/主菜单.png)

在 `navbar.menu` 数组中添加/删除菜单项，每个项目包含：
- `name`：菜单名称
- `icon`：图标（使用Font Awesome图标类名）
- `url`：链接地址
- `target`：打开方式（`_self` 或 `_blank`）

示例：添加"我的博客"菜单项
```yaml
navbar:
  menu:
    - name: 文档
      icon: fa-duotone fa-book faa-tada
      url: /v7/getting-started/
      target: _self
    - name: 示例
      icon: fa-duotone fa-play-circle faa-tada
      url: /examples/
    - name: 帮助
      icon: fa-duotone fa-question-circle faa-tada
      url: /faqs/
    - name: 我的博客
      icon: fa-duotone fa-blog
      url: /archives/
    - name: 鸣谢
      icon: fa-duotone fa-heart
      url: /contributors/
```

### 下拉菜单设置
在需要下拉的菜单项中添加 `rows` 数组，包含子菜单项：

示例：
```yaml
- name: 更多
  icon: fa-duotone fa-ellipsis-v
  rows:
    - name: 暗黑模式
      icon: fa-solid fa-moon
      toggle: darkmode
    - name: hr
    - name: 本站源码
      url: https://github.com/volantis-x/volantis-docs/
    - name: 主题源码
      url: https://github.com/volantis-x/hexo-theme-volantis/
    - name: hr
    - name: 更新日志
      url: https://github.com/volantis-x/hexo-theme-volantis/releases/
    - name: 博客文章
      url: /archives/
```

## 2. 更改个人信息
个人信息配置在 `_data/author.yml` 文件中：

### 添加个人资料
在文件末尾添加您的个人条目，格式为：
```yaml
your-username:
  name: 您的姓名
  avatar: 您的头像URL
  url: 您的个人网站URL
```

示例：
```yaml
myname:
  name: 张三
  avatar: https://example.com/my-avatar.jpg
  url: https://mywebsite.com
```

### 在文章中引用
在文章的Front Matter中使用 `author: your-username` 引用该信息：

```yaml
---
title: 文章标题
date: 2025-11-21
author: myname
---
```

## 3. 添加博客/项目/笔记

### 添加博客文章
1. 在 `source/_posts/blogs/` 目录下创建Markdown文件，命名格式：`年-月-日-文章标题.md`
2. 文件头部添加Front Matter：

```yaml
---
title: 文章标题
date: 2025-11-21
updated: 2025-11-21
categories: [分类名称]
author: your-username
link: 如果是转载，请填写原文链接
description: 文章摘要（可选）
headimg: 文章封面图URL（可选）
backup: 互联网档案馆存档链接（可选）
---
```

示例：
```yaml
---
title: 如何配置Volantis主题
date: 2025-11-21
updated: 2025-11-21
categories: [配置指南]
author: myname
description: 详细说明Volantis主题的配置方法
headimg: https://example.com/config-guide-cover.jpg
---
```

### 添加项目展示
在 `source/_data/sites.yml` 中的 `showcase` 部分添加项目信息：

```yaml
showcase:
  title:
  description:
  items:
    - title: 项目名称
      url: 项目网址
      screenshot: 截图URL
      avatar: 项目头像URL
      description: 项目描述
```

示例：
```yaml
showcase:
  items:
    - title: 我的个人网站
      url: https://mywebsite.com
      screenshot: https://example.com/my-site-screenshot.jpg
      avatar: https://example.com/my-avatar.jpg
      description: 使用Volantis主题搭建的个人博客
```

### 添加笔记页面
创建新的Markdown文件在 `source/` 目录下，如 `source/notes/index.md`：

```yaml
---
layout: page
title: 我的笔记
cover: true
sidebar: []
---
```

## 4. 更改封面
封面配置在 `_config.volantis.yml` 的 `cover` 部分：

### 基本设置
- 修改 `cover.title` 和 `cover.subtitle` 设置标题和副标题
- 修改 `cover.background` 设置背景图片URL（推荐使用高清图）

示例：
```yaml
cover:
  title: 我的数字空间
  subtitle: 欢迎来到我的个人世界
  background: https://example.com/my-cover-image.jpg
```

### 功能入口设置
在 `cover.features` 数组中修改或添加图标、标题和链接：

```yaml
cover:
  features:
    - name: 博客
      img: volantis-static/media/twemoji/assets/svg/1f4f0.svg
      url: /
    - name: 笔记
      img: volantis-static/media/twemoji/assets/svg/1f4d6.svg
      url: /notes/
    - name: 项目
      img: volantis-static/media/twemoji/assets/svg/1f4bb.svg
      url: /projects/
    - name: 关于
      img: volantis-static/media/twemoji/assets/svg/1f464.svg
      url: /about/
```

## 5. 美化网站

### 自定义CSS
在 `_config.volantis.yml` 中启用自定义CSS：

```yaml
custom_css:
  font_smoothing: true
  cursor:
    enable: true
```

### 更改字体
修改 `fontfamily` 部分设置自定义字体：

```yaml
fontfamily:
  logofont:
    fontfamily: 'Your Font, "PingFang SC", "Microsoft YaHei"'
    name: 'Your Font'
    url: volantis-static/media/fonts/YourFont.ttf
  bodyfont:
    fontfamily: 'Your Font, "PingFang SC", "Microsoft YaHei"'
    name: 'Your Font'
    url: volantis-static/media/fonts/YourFont.ttf
```

### 添加背景音乐
在 `_config.volantis.yml` 的 `aplayer` 部分配置：

```yaml
aplayer:
  enable: true
  autoplay: true
  volume: 0.5
  order: random
  id: 你的音乐ID # 可以是网易云、QQ音乐等平台的歌曲ID
```

## 6. 使用标签小组件
标签页面已预配置：

### 创建标签
在文章Front Matter中添加 `tags` 字段：

```yaml
---
title: 文章标题
date: 2025-11-21
tags:
  - 标签1
  - 标签2
  - 标签3
---
```

### 访问标签页面
标签列表页面位于 `source/blog/tags/index.md`，无需修改。

## 7. 添加文章封面
在文章Front Matter中添加 `headimg` 字段：

```yaml
---
title: 文章标题
date: 2025-11-21
headimg: https://example.com/your-cover-image.jpg
---
```
## 8.进阶修改
找到 themes\volantis\layout\_partial\head.ejs 文件，该文件负责生成HTML文档的<head>部分。这个文件包含了所有需要在HTML头部加载的元信息、样式表、预加载资源等。

- 元标签（Meta Tags）：如字符集声明、视口设置、作者、描述等。
- 标题（Title）：生成页面的标题。
- 样式表（CSS）：引入主题的样式文件，以及自定义的CSS。
- 预加载（Preload）：对关键资源进行预加载以提升性能。
- Favicon：网站图标的链接。
- SEO相关：如Open Graph标签等。
- 脚本（Scripts）：一些全局的JavaScript脚本，可能包括暗黑模式切换、全局变量等。

还可以添加一些自定义的样式和脚本，例如：

- 为头像添加了动态渐变边框。

- 为卡片元素添加了毛玻璃效果。

- 调整封面标题的字体大小。

- 个性签名随机诗句效果。

如果您对head.ejs文件进行了修改，请确保修改是正确的，并且不会破坏原有的功能。同时，清除浏览器缓存和Hexo的缓存（使用hexo clean）后重新生成和部署，以确保修改生效。

``` bash
---
hexo clean
hexo g
hexo s
---
```

## 9.网站上传

找到你的_config.yml文件的deploy：

``` yml
deploy:
  - type: git
    repo: https://github.com/你的github用户名/仓库名字（和用户名相同）.github.io.git
```

然后

``` bash 
---
hexo deploy
---
```

等待一两分钟就上传完成了。

--------------------

作者水平有限，如有错误请指出。
