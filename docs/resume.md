# 简历页与 cv 子域名

## 已实现

- `/resume` 为公开脱敏简历，来自用户提供的 Word 文档；没有添加毕业年份、工作经历、项目日期或未提供的项目链接。
- 内容包含基本信息、个人技能、三个项目经验及个人证书。以用户提供的 Word 与后续修订为依据，聚焦实际工作，不编造贡献。
- 采用参考站 zhilu-cv 的白色纸张、浅色背景、居中姓名、双栏资料、细横线章节、灰色项目条和技术栈排版；补充窄屏、暗色与 A4 打印样式。
- 公开页面的姓名、电话、邮箱均脱敏，不再提供电话/邮箱链接；GitHub 链接保留。“打印 / 保存 PDF”导出的是公开脱敏版，完整投递版在本机单独生成。
- `cv.<主域名>/` 在服务端直接渲染简历，不展示书房或幕布；`/resume` 保持可用。跨域“回到书架”使用一次性的 `?from=cv` 导航提示保持书架展开，到达后清除提示，之后刷新仍按原逻辑合上幕布。
- 主域名书架的简历书本自动链接到 `cv.<主域名>/`。本机/IP、Vercel 和 Netlify 预览地址仍使用 `/resume`，避免生成不存在的预览子域名。
- 保持参考站的 `noindex, nofollow`，不主动让搜索引擎收录联系方式。这不是访问控制；上线后任何拿到地址的人仍可查看简历。
- 未将完整 Word 文件复制到 public，没有新增外部字体、图标服务或分析请求。

## 内容修改入口

| 文件 | 用途 |
| --- | --- |
| `app/data/resume.ts` | 公开脱敏身份、技能、项目经验与证书内容 |
| `app/components/ResumeDocument.vue` | 简历整体结构、联系方式、SEO 和打印操作 |
| `app/components/ResumeSection.vue` | 章节标题与分隔线 |
| `app/components/ResumeEntry.vue` | 项目标题条与技术标签 |
| `app/components/ResumeIcon.vue` | 本地内联 SVG 图标 |
| `app/assets/css/resume.css` | 桌面、手机、深色与打印样式 |
| `app/composables/useSiteLinks.ts` | 域名识别、跨域书架链接和预览回退 |
| `app/pages/index.vue` | cv 主机名显示简历，其他主机名显示书房 |
| `app/components/ReadingRoom.vue` | 从原首页完整迁出的书房逻辑与模板 |

文档里的“绩点：19%”原样保留，没有推断成具体 GPA 或额外排名。没有为简历中没有网址的“项目复盘”创建虚假链接。

## 公开版与本地投递版 PDF

### 公开网站

- 公开姓名显示「**博」（仅露出名字末字），电话继续脱敏，邮箱按用户选择完整显示。SSR、页面标题、描述、Nuxt 数据及构建产物遵循同一规则，不得包含完整姓名或完整电话。公开页面暂不添加电话和邮箱链接，也没有通过参数切换完整版的入口。
- 网页的“打印 / 保存 PDF”遵循相同的公开展示规则（姓名为「**博」、电话脱敏、邮箱完整）。公开 GitHub 和项目经历仍可能关联身份，这不是匿名化；noindex 也不是访问控制。
- 不要把完整身份放进 Nuxt public runtimeConfig、公开环境变量、隐藏 HTML、图片或 public/ 下载文件。

### 本机生成完整投递版

真实身份保存在本机 **.private/resume/identity.json**，整个 .private/ 目录由 Git 忽略，不进入网站构建。当前机器已从原简历数据迁移好，不必再次填写。更换电脑时自行安全复制此文件，或者按以下结构创建（以下为虚构示例）：

```json
{
  "name": "投递测试员",
  "phone": "13900000000",
  "email": "application@example.invalid"
}
```

在项目根目录，使用项目要求的 Node 版本运行：

```powershell
npm run resume:pdf
```

命令会重新构建公开站点，检查 app/、public/ 和 .output/ 中没有完整姓名或完整电话（邮箱允许公开），然后启动仅绑定 127.0.0.1 的临时服务。浏览器使用 SSR、禁用页面脚本和 Service Worker，仅允许该本地服务的资源请求；资源加载后封锁全部网络，再在本机浏览器内替换姓名、电话、邮箱及 PDF 标题。最后生成：

**.private/resume/resume-full.pdf**

PDF 使用同一套 A4 打印样式，包含完整联系方式与可点击电话/邮箱；脚本会关闭自己的浏览器与临时服务，不影响既有预览服务。Windows 默认使用本机 Chrome；其他系统默认使用 Playwright Chromium。可通过 PLAYWRIGHT_CHANNEL 指定浏览器；未安装时运行 npx playwright install chromium。该流程不上传 PDF，也不会增加公开完整版接口。

### Windows 完整 PDF 操作步骤

1. 打开 PowerShell，进入项目目录：

   ```powershell
   Set-Location 'E:\code\TianmaBlog'
   node --version
   ```

2. 先关闭正在查看的 `resume-full.pdf`，避免 Windows 文件占用导致 EBUSY。当前电脑的私有身份文件已经配置好，不需要修改公开数据来还原姓名或电话。
3. 使用项目支持的 Node 版本（^24.15.0 或 >=26.0.0）时执行：

   ```powershell
   npm run resume:pdf
   ```

   如果系统 Node 版本较旧，可临时使用固定版本（不切换全局 Node）：

   ```powershell
   npx --yes --package=node@24.15.0 -- npm run resume:pdf
   ```

4. 终端显示“完整版 PDF 已生成”后，打开文件：

   ```powershell
   Start-Process 'E:\code\TianmaBlog\.private\resume\resume-full.pdf'
   ```

5. PDF 中姓名、电话、邮箱均完整；用 PDF 阅读器的打印功能（Ctrl+P）打印，选择 A4、实际大小 / 100%。不要通过公开网页的打印按钮生成投递版，因为网页打印仍使用公开展示规则。

换电脑后先 `npm ci`，再手动安全复制私有身份 JSON 到同一相对目录；此文件不会随 GitHub 克隆恢复。请勿为了生成完整 PDF 把完整姓名和电话写回公开源码。

### 日常更新与安全边界

- 修改项目经历：编辑 app/data/resume.ts，之后重新运行导出命令。
- 修改真实联系方式：编辑 .private/resume/identity.json；邮箱还需同步 app/data/resume.ts 中的公开值，电话只同步公开脱敏值。
- 不要把完整 PDF 移到 public/、提交到 Git、作为公开附件或随整目录上传。部署只上传常规 Nuxt 构建产物。
- Git ignore 不是加密，请自行保管和备份 .private/。此前若已提交或发布过完整信息，当前脱敏不会清除历史提交、缓存或外部副本。
- 运行 npm run build 后再运行 npm run test:resume-export，可验证配置校验、隐私扫描和虚构身份的本地导出；测试使用独立临时目录，不会覆盖真实投递版 PDF。

## 本地查看

```powershell
npm run dev
```

- `http://localhost:3000/resume`：简历的本地路由。
- `http://cv.localhost:3000/`：验证子域名根路径，Chromium 支持 `.localhost` 回环解析，无需修改 hosts。
- `http://localhost:3000/`：原来的书房首页。

也可以 `npm run build` 后执行 `npm run preview`，使用终端实际显示的端口。部署必须保留 SSR（Nuxt 服务端渲染）；静态 `npm run generate` 无法根据每次请求的主机名切换根页面。

## 绑定真实 cv 子域名

本次未发布、未修改 DNS，也没有猜测实际域名。仓库没有提供真实主域名或 Vercel 项目关联。

1. 将仓库部署到 Vercel 的 Nuxt 项目，保留框架预设，使用 `npm run build`，不要设为纯静态输出；使用项目要求的 Node 版本。
2. 在**同一个 Vercel 项目**的 Settings → Domains 中添加主域名和 `cv.<你的主域名>`。将 cv 设为正常服务的域名，而不是重定向到主域名。
3. 在域名 DNS 服务商处创建主机记录 `cv`。记录类型和值以该 Vercel 项目 Domains 页面给出的要求为准；不要盲目使用其他项目的 CNAME 目标。
4. 等待域名验证和 HTTPS 生效。应用会根据请求中的 `cv.` 主机名前缀直接渲染简历，无须新建第二个项目。
5. 如主站使用 `www`，或希望显式固定链接，在 Vercel 项目环境变量里设置：

   ```dotenv
   NUXT_PUBLIC_SITE_URL=https://你的主域名
   NUXT_PUBLIC_CV_URL=https://cv.你的主域名
   ```

   这两个值是公开链接，不要写凭据。使用完整的 HTTP(S) URL，不加路径。主机名识别仍使用 `cv.` 前缀。更改平台环境变量后重新部署；本地可复制 `.env.example` 到 `.env` 配置。

6. 分别打开主域名和 cv 域名，检查：主域名是书房；简历书本跳到 cv；刷新 cv 仍是简历；“回到书架”回到主站；姓名/电话/邮箱保持脱敏，PDF 打印正常。

若使用自建 Node/Nginx，两个域名应反向代理到同一个 Nuxt 服务，并保留原始 Host 与正确的 `X-Forwarded-Proto`，同时分别配置 HTTPS。若另外开启 HTML 缓存，缓存键必须包含 hostname，不能混用两个域名的根页面。

官方配置参考：
- https://vercel.com/docs/domains/working-with-domains/add-a-domain
- https://nuxt.com/docs/4.x/api/composables/use-request-url
- https://nuxt.com/docs/4.x/guide/going-further/runtime-config

## 版权

布局参考并适配自 https://github.com/L33Z22L11/zhilu-cv 。参考代码采用 MIT License，完整版权与许可声明保存在 `docs/licenses/zhilu-cv-MIT.txt`，页面底部也保留来源链接。简历资料属于站点作者，没有使用参考作者的姓名、电话、项目或个人经历。

## 验证

```powershell
npm run typecheck
npm run build
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run test:e2e
```

测试同时运行桌面与手机项目，覆盖项目内容、脱敏联系方式、320px 不溢出、键盘操作、暗色模式、打印样式、打印按钮、无 JavaScript、cv 根路径的 SSR 与刷新、主域名与预览链接，以及原书房的全部回归场景。截图、浏览器打印 PDF 和失败追踪位于被 Git 忽略的 `test-results/`。

### 本次验证记录（2026-11-07）

- 类型检查、生产构建通过；桌面和手机共 58 项端到端测试全部通过（含本轮内容与校徽回归）。
- 桌面、320px 窄屏已做视觉检查；打印结果为一页 A4，内容完整。
- cv 主机名根路径、刷新、跨域回到书架和显式 URL 环境变量已验证。
- 本次交付预览：http://cv.localhost:4318/ ，备用路径：http://localhost:4318/resume 。该地址仅限本机，服务停止后不再可访问。
- 未修改线上 DNS、未发布生产站点。

### 内容修订（2026-11-07）

- 个人技能与项目经验改用无条目小标题的直接表述，内容聚焦完成的开发、数据处理、报告生成与部署工作。
- 删除夜校项目条目与整个社团经历章节；保留 Word 中有依据的通用开发实践。
- 新增 TableRecognition（基于多智能体的表格解析算法服务）与 Carwin（3D智慧教育平台），角色均为核心贡献者。用户尚未提供具体贡献，因此不编造项目职责、成果、指标、技术栈或日期；后续可在 `projects[].points` 中补充已确认的事实。
- 学校行使用学校图标、“学校：”标签与用户提供的蓝色校徽；优化副本位于 `public/images/scut-logo.png`，原文件保持不变，替代文本保留学校名称；深色模式使用白色衬底。

- 本轮最终验证：类型检查与生产构建通过，58/58 E2E 通过（18.1 秒），git diff --check 通过；A4 PDF 为一页，包含新项目与内嵌校徽。桌面截图和手机预览已检查。

- 校徽尺寸修订：等比缩放至一行文字高度（`height: 1lh; width: auto`），屏幕与打印一致。类型检查、构建及 58 项测试通过（16.7 秒），本地预览已刷新。


### 技术栈图标与项目文字修订（2026-11-07）

- 保留用户最新修改的项目顺序、角色、技能、技术栈和前两条项目描述。
- 参考 zhilu-cv 的技术名称映射和 SVG 图标方案，使用 Iconify SVG Logos 的品牌图标替代 x 占位符。九个 SVG 本地存放于 public/images/tech/，显示时不请求第三方接口；CC0 许可见 docs/licenses/svg-logos-CC0.txt。
- Ollama、Three.js、LangChain 的单色图标适配深色背景，打印时恢复原色；技术名称作为可访问文本保留。
- 三个项目第三条分别展开多智能体分阶段解析、Function Calling 平台交互与模板化实验报告生成；不添加未提供的量化成果、项目日期或新功能。在 1440px 桌面预览下自然换行为三行，不使用强制换行或截断。

- 本轮验证：类型检查与生产构建通过，62/62 端到端测试通过（19.2 秒）；三个第三条描述在桌面各为三行，A4 PDF 仍为一页；本地 cv 预览已加载新图标和新文案。

### 根据本地仓库补充技术栈（2026-11-07）

- 仅修改技术栈列表，保留用户个人资料和所有项目描述。
- TableRecognition 补充 Python、OpenCV、NumPy，共 6 项。依据：E:/code/TableRecognition/pyproject.toml、packages/table-engine/pyproject.toml，以及 src/core/image_source.py 中实际使用的 cv2、numpy。
- Carwin 补充 TypeScript、Vite，共 6 项。依据：E:/code/CarWin/3d-preview/package.json 的依赖与构建命令，以及 vite.config.ts、tsconfig.app.json。
- DesignOfExpert 增加飞书，共 5 项。使用 Semi Design 原始单色品牌 SVG，复用暗色模式与打印处理；MIT 许可与来源已记录。
- 六个新增图标全部本地托管，没有添加 npm 依赖或运行时第三方请求。
- 验证：类型检查、生产构建通过；62/62 E2E 通过（20.1 秒），包含 17 个图标的路径、加载、每项目技术列表、暗色/打印、移动端布局及三行项目描述回归；桌面截图已检查。

### 飞书原色图标与学校标识（2026-11-07）

- 飞书图标改用官方网站 favicon 中的原色品牌标志，在原始 48×48 分辨率下无损转换为本地 PNG；取消 monochrome 标记，不对浅色、暗色或打印模式进行反色。
- 校徽后增加 (985)，保留学校图标、学校标签与一行高的等比校徽。
- 用户仅询问隐私导出机制，本轮不改变姓名、电话及 PDF 的完整信息显示方式。
- 已检查 zhilu-cv 的 app/app.vue、nuxt.config.ts、README.md：姓名/电话优先取环境配置，否则使用脱敏占位值；没有打印时恢复姓名或电话的分支。README 建议本地 .env 配置 NAME/PHONE 后启动服务，通过浏览器打印导出。
- 类型检查、生产构建通过；64/64 E2E 通过（20.5 秒），覆盖学校标识、原色图标、浅色/暗色/打印样式及移动端回归；桌面截图已检查。


### 公开脱敏与本地投递版（2026-11-07）

- 用户已选择公开脱敏、本地 PDF 完整的方案，替代前一节“暂不改变显示方式”的状态。
- 完整姓名、电话和邮箱已迁移到 Git 忽略的本地 JSON；前端数据只保留脱敏值，公开电话和邮箱不再带链接，SEO 与 SSR 同步脱敏。
- 增加 npm run resume:pdf：先构建和扫描，再使用仅本机临时服务生成完整 PDF；不增加运行时第三方请求、依赖或公开下载入口。
- 66/66 桌面与手机 E2E、6/6 配置/扫描/导出测试通过；类型检查、生产构建、Git 忽略与差异检查通过。外部资源拦截、成功/异常后的子进程清理均有测试。
- 实际完整 PDF 已验证姓名/电话/邮箱和标题均完整、无脱敏占位、项目未遗漏、一页 A4；公开 cv 预览已重启并检查。私有配置和 PDF 的 HTTP 路径均返回 404，未发布线上。

### 参考站字号对齐（2026-11-08）

- 以参考站当前线上页面的浏览器 computed style 为准，而不是按视觉猜测整体放大：正文 14.8px / 20.72px，姓名 29.6px / 41.44px，章节标题 20px / 28px，技术栈 14px / 20px，基本信息行高 22.2px。
- 项目标题、项目说明、贡献角色采用正文同等字号；移除手机和打印中额外缩小字号的覆盖，保留各终端原有的布局适配。
- 对齐字体栈 InterVariable、Noto Sans SC、system-ui；从 Inter 官方站获取 4.1 正体可变字体并本地托管，避免仅声明 Inter 但实际回退为其他英文字体，也不增加运行时第三方字体请求。原始 SIL OFL 许可见 docs/licenses/inter-OFL.txt。
- 对照来源：https://cv.zhilu.cyou/、上游 app/assets/main.scss、app/app.vue、app/components/Project.vue；字体来源：https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1，许可来源：https://github.com/rsms/inter/blob/v4.1/LICENSE.txt。
- 保持所有简历文案、原色飞书图标、学校标识和公开脱敏/本地完整 PDF 机制不变。新增跨桌面/390px/320px及屏幕/打印的字号行高和本地字体加载回归测试。
- 本轮验证：typecheck 与生产构建通过，68/68 桌面和手机 E2E（19.9 秒）、6/6 本地导出测试通过；三个项目第三条仍在桌面自然排成三行，320px 屏幕无横向溢出。桌面、手机及 PDF 渲染已检查，完整 PDF 仍为一页 A4，身份字段及三个项目均完整。
- 原有 resume-full.pdf 被其他程序占用（EBUSY），没有强行关闭或覆盖；本轮用相同的本地资源限制、禁用脚本、加载完成后阻止网络、DOM 替换完整身份的流程，另存 .private/resume/resume-full-typography.pdf。新版及预览仍受 Git 忽略，不进入公开目录；默认导出命令仍保持原行为。

### A4 底部留白优化（2026-11-08）

- 仅调整打印版的纵向间距，将多余底部空间均匀分配到章节、项目和列表条目之间：章节间距 20px、项目间距 14px、条目上下间距 3px。保持刚对齐的字号、行高、文案和屏幕布局不变，不通过固定页面高度或新增内容撑满纸张。
- 实际完整 PDF 仍为一页 A4，最后一行文字到纸张底部的距离由约 26.4mm 缩至约 13.7mm；顶部页边保持 10mm，视觉更均衡。
- 类型检查、生产构建、70/70 E2E、6/6 导出测试及差异检查通过；新增 A4 剩余高度和打印间距回归，实际 PDF 已渲染检查，身份字段和三个项目完整。
- 新版完整 PDF 另存 `.private/resume/resume-full-balanced.pdf`，保留旧文件；本地预览已重启加载新版打印样式，未部署线上。


### 公开身份展示调整（2026-11-08）

- 按用户要求，公开姓名由「孙**」改为只显示「博」，邮箱恢复完整显示，电话继续脱敏。页面、SEO、SSR 及公开打印保持一致；字号、排版和项目内容不变。
- 本地完整 PDF 仍使用私有配置中的完整姓名、电话和邮箱；导出扫描相应允许公开邮箱，但继续阻止完整姓名与电话进入公开源码或构建。
- 验证：类型检查与生产构建通过，70/70 桌面和手机 E2E、7/7 导出测试通过，真实配置的公开构建扫描通过；已重启本地预览，并检查 cv 根路径和 /resume 的姓名、邮箱及电话展示符合新规则，未部署线上。

### GitHub 提交前检查（2026-11-08）

- 保留用户最新的公开姓名「**博」，仅露出名字末字；电话继续脱敏，邮箱按明确要求完整公开。同步页面、SEO、SSR 与打印测试的预期，不覆盖用户数据。
- 检查全部 62 个拟公开文件（含文档、测试及文件名），清除实现计划中遗漏的完整姓名拼音；对完整姓名、电话及 Unicode/URL 编码形式进行扫描，未发现残留。常见密钥格式扫描未发现命中。
- 检查现有 5 个提交的文件内容，未发现上述完整姓名、电话或姓名拼音；但 GitHub 已有的两个旧提交，其作者/提交者名称仍含完整姓名拼音，未擅自重写历史。私有配置、完整 PDF、预览图及构建产物均被忽略，不纳入提交。
- 类型检查、生产构建、70/70 E2E、7/7 导出测试通过；按文档的固定 Node 版本命令实际导出成功，完整姓名、电话、邮箱、PDF 标题及三个项目均已验证，一页 A4，渲染已检查。
- 完整 PDF 的生成、打开、打印和换电脑迁移步骤已补充在上方；网页打印仍遵循公开展示规则。
