# 天马的书房

一个以「舞台启幕 → 阶梯书架 → 翻开栏目」为入口的 Nuxt 个人网站。

## 本地启动

需要 **Node.js 24.15.0+（24.x），或 26+**，以及 npm。项目根目录的 `.node-version` 记录了本次验证使用的版本；它不会自动升级你的系统 Node。

```bash
npm install
npm run dev
```

打开终端显示的本地地址，默认是 http://localhost:3000。

如果当前电脑还在使用 Node 24.11.0，暂时不升级也可以先这样启动，命令只使用 npm 缓存中的临时 Node：

```bash
npx --yes --package=node@24.15.0 -- node node_modules/nuxt/bin/nuxt.mjs dev
```

此临时命令要求先安装好依赖；日常开发建议直接将系统 Node 升级到兼容版本。

## 当前功能

- 首次访问展示深红色舞台幕布，点击「启幕」后向两侧拉开。
- 「跳过动画」直接入内；遵循系统的减少动态效果设置。
- 本地存储记住启幕状态；后续访问不重复展示，可点击「重看启幕」。
- 正面三层阶梯书架，简历、博客、小说、日志四本栏目书可点击。
- 四个独立栏目路由与明确的内容占位，支持直接访问和返回书架。
- 手机窄屏适配、键盘操作、焦点管理；无 JavaScript 时仍可浏览书架与栏目。
- 当前没有数据库、登录、内容后台，也没有虚构的个人经历和文章。

## 修改入口

| 需要修改 | 文件 |
| --- | --- |
| 栏目名、书封文案、书架分层 | `app/data/library.ts` |
| 首页文案、启幕状态及首次访问逻辑 | `app/pages/index.vue` |
| 幕布外观与动画 | `app/components/CurtainIntro.vue` |
| 书封外观、悬停效果 | `app/components/LibraryBook.vue` |
| 阶梯书架布局、木质层板 | `app/components/SteppedBookshelf.vue` |
| 全局配色、字体、手机适配 | `app/assets/css/main.css` |
| 栏目占位页 | `app/pages/[section].vue` |
| 站点标题、描述与 Nuxt 配置 | `nuxt.config.ts` |

首次访问标记为 localStorage 中的 `tianma:curtain-seen:v1`。清除此键可以模拟新访客；只想重看动画时无需清理，点击首页按钮即可。

## 验证

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

浏览器测试会自动在独立的 4173 端口启动构建后的 Node 服务（不复用已有进程），覆盖桌面/手机、启幕与记忆、四个栏目导航、键盘焦点、减少动态效果、存储被禁用、窄屏、404 以及无 JavaScript 访问。截图与失败追踪位于被 Git 忽略的 `test-results/`。

如果 Chromium 下载受限，而电脑已安装 Chrome，可以用本机浏览器验证（本次使用此方式）：

```bash
# Git Bash / macOS / Linux
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e

# PowerShell
$env:PLAYWRIGHT_CHANNEL='chrome'; npm run test:e2e
```

生产预览：

```bash
npm run build
npm run preview
```

## 后续部署到 Vercel

本阶段只在本地构建和验证，尚未发布。之后将仓库导入 Vercel，使用 Nuxt 框架预设、`npm run build` 构建命令，并保留平台默认输出目录设置即可；当前不需要手写 `vercel.json`。选择兼容的 Node 版本。

Vercel 会根据平台环境选择 Nitro 部署目标，本地默认仍是 Node server。自定义域名应在 Vercel 项目中配置，不依赖 GitHub Pages 的 `CNAME` 文件。

参考：[Nuxt 部署平台](https://nuxt.com/deploy) · [Vercel Nuxt 文档](https://vercel.com/docs/frameworks/full-stack/nuxt)

设计假设与当前阶段范围见 [实现说明](docs/implementation-notes.md)。
