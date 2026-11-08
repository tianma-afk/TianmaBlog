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

- 首次访问展示深红色舞台幕布，画面只保留书法艺术字「Life is a play」，点击幕布任意位置后向两侧拉开。
- 不显示按钮或操作提示；支持 Enter / 空格启幕、Esc 跳过动画，并遵循系统的减少动态效果设置。
- 英文书法字体 Pinyon Script 随站点本地托管，无第三方字体请求；授权文件见 `docs/licenses/pinyon-script/OFL.txt`。
- 直接访问或刷新首页时合上幕布；同一次站内翻阅后返回书架保持展开。右上角「退出」配有门与向外箭头图标。
- 退出时先合拢两侧幕布，等两侧动画都结束后才恢复「Life is a play」；退出也会清除进入状态，刷新仍停留在开场。
- 正面三层阶梯书架，简历、博客、小说、日志四本栏目书可点击。
- 简历已接入真实资料，排版参考 zhilu-cv，支持手机、暗色模式、A4 打印 / 保存 PDF 与 cv 子域名根路径；其余三个栏目暂为占位页。
- 手机窄屏适配、键盘操作、焦点管理；无 JavaScript 时仍可浏览书架与栏目。
- 当前没有数据库、登录、内容后台，也没有虚构的个人经历和文章。

## 修改入口

| 需要修改 | 文件 |
| --- | --- |
| 栏目名、书封文案、书架分层 | `app/data/library.ts` |
| 首页文案、启幕状态及首次访问逻辑 | `app/components/ReadingRoom.vue` |
| cv 子域名与首页分流 | `app/pages/index.vue`、`app/composables/useSiteLinks.ts` |
| 简历内容与排版 | `app/data/resume.ts`、`app/assets/css/resume.css` |
| 幕布外观与动画 | `app/components/CurtainIntro.vue` |
| 书封外观、悬停效果 | `app/components/LibraryBook.vue` |
| 阶梯书架布局、木质层板 | `app/components/SteppedBookshelf.vue` |
| 全局配色、字体、手机适配 | `app/assets/css/main.css` |
| 栏目占位页 | `app/pages/[section].vue` |
| 站点标题、描述与 Nuxt 配置 | `nuxt.config.ts` |

进入状态只在当前站内访问中保留；历史 localStorage 标记 `tianma:curtain-seen:v1` 会主动清理。点击首页右上角「退出」回到幕布，再次点击幕布重新进入。

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


简历页面、修改入口及 cv 子域名配置详见 [简历说明](docs/resume.md)。

公开简历姓名为「**博」（仅露出名字末字）、电话脱敏、邮箱完整公开；完整投递版仅在本机生成：`npm run resume:pdf`。完整信息与 PDF 均位于 Git 忽略的 `.private/resume/`，不要放入 `public/` 或上传部署。配置与安全边界见简历说明。
