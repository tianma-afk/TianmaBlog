import { expect, test } from '@playwright/test'
import { resume } from '../../app/data/resume'

const resumeName = '**博'

test('简历呈现更新后的项目经验与联系方式', async ({ page }) => {
  expect(resume.email).not.toContain('*')
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration/i.test(message.text())) errors.push(message.text())
  })
  await page.goto('/resume')
  await expect(page).toHaveTitle('**博 - 大模型应用开发工程师')
  await expect(page.getByRole('heading', { level: 1, name: resumeName })).toBeVisible()
  for (const title of ['个人技能', '项目经验', '个人证书']) {
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible()
  }
  for (const text of ['软件工程', '19%', '实验设计智能助手', 'TableRecognition', '基于多智能体的表格解析算法服务', 'Carwin', '3D智慧教育平台', '2025 年度校级三等奖学金']) {
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
  }
  await expect(page.locator('[data-resume-field=phone]')).toHaveText('151****8912')
  await expect(page.locator('[data-resume-field=email]')).toHaveText(resume.email)
  await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'tianma-afk', exact: true })).toHaveAttribute('href', 'https://github.com/tianma-afk')
  await expect(page.getByText('书页已打开，内容正在准备中。')).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  expect(errors).toEqual([])
  await page.screenshot({ path: test.info().outputPath('resume.png'), fullPage: true })
})

test('项目聚焦实际工作，移除条目小标题与已删除的经历', async ({ page }) => {
  await page.goto('/resume')
  const paper = page.locator('.resume-paper')
  await expect(paper.locator('.resume-points strong')).toHaveCount(0)
  for (const entry of await paper.locator('.resume-entry').all()) {
    await expect(entry).not.toContainText(/熟悉|了解|理解|掌握/)
  }
  for (const removed of ['项目经历', '校园经历', '社团经历', '华工青年夜校小程序', '华南理工大学嵌入式协会']) {
    await expect(paper).not.toContainText(removed)
  }
  await expect(paper.locator('.resume-entry')).toHaveCount(3)
  for (const name of ['TableRecognition', 'Carwin']) {
    const project = paper.locator('.resume-entry').filter({ has: page.getByRole('heading', { name, exact: true }) })
    await expect(project.locator('.resume-entry-role')).toHaveText('核心贡献者')
  }
  await expect(paper).toContainText('负责实验报告生成')
  await expect(paper).toContainText('调用 LLM 服务')
})

test('学校使用本地校徽替代文字，窄屏与深色模式均可读', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/resume')
  await expect(page.locator('.resume-school')).toContainText('学校：')
  await expect(page.locator('.resume-school .resume-icon')).toBeVisible()
  const logo = page.getByRole('img', { name: '华南理工大学', exact: true })
  await expect(logo).toBeVisible()
  await expect(logo).toHaveAttribute('src', '/images/scut-logo.png')
  expect(await logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media })
    const size = await logo.evaluate(image => ({
      height: image.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(image.parentElement!).lineHeight),
    }))
    expect(size.height).toBeCloseTo(size.lineHeight, 0)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('简历窄屏不溢出且所有操作可键盘访问', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/resume')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '回到书架' })).toBeFocused()
  await expect(page.getByRole('button', { name: '打印 / 保存 PDF' })).toBeVisible()
  await page.screenshot({ path: test.info().outputPath('resume-320.png'), fullPage: true })
})

test('简历暗色模式与打印样式保留完整内容', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/resume')
  await expect(page.locator('.resume-paper')).toHaveCSS('background-color', 'rgb(30, 34, 43)')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.resume-toolbar')).toBeHidden()
  await expect(page.locator('.resume-paper')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.getByRole('heading', { name: '个人证书', exact: true })).toBeVisible()
  if (test.info().project.name === 'chromium') {
    await page.pdf({ path: test.info().outputPath('resume.pdf'), preferCSSPageSize: true, printBackground: true })
  }
})

test('未开启 JavaScript 仍可读取简历并返回书架', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  await page.goto('/resume')
  await expect(page.getByRole('heading', { level: 1, name: resumeName })).toBeVisible()
  await expect(page.getByText('实验设计智能助手', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: '回到书架' }).click()
  await expect(page.getByRole('heading', { name: '翻开一页，走进一个世界。' })).toBeVisible()
  await context.close()
})

test('cv 子域名根路径直接返回简历的 SSR HTML', async ({ request }) => {
  const response = await request.get('/', { headers: { host: 'cv.example.com' } })
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('<title>**博 - 大模型应用开发工程师</title>')
  expect(html).toContain('实验设计智能助手')
  expect(html).toContain('href="http://example.com/?from=cv"')
  expect(html).not.toContain('class="reading-room"')
})

test('主域名简历书本指向 cv 子域名，预览域名保留本地路由', async ({ request }) => {
  const production = await request.get('/', { headers: { host: 'www.example.com' } })
  expect(await production.text()).toContain('href="http://cv.example.com/"')
  const preview = await request.get('/', { headers: { host: 'tianma-preview.vercel.app' } })
  expect(await preview.text()).toContain('href="/resume"')
})

test('打印按钮调用浏览器打印功能', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => { document.documentElement.dataset.printCalled = 'true' }
  })
  await page.goto('/resume')
  await page.getByRole('button', { name: '打印 / 保存 PDF' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-print-called', 'true')
})

test('cv 本地主机名刷新与客户端 hydration 一致', async ({ page, baseURL }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration/i.test(message.text())) errors.push(message.text())
  })
  const url = new URL(baseURL!)
  url.hostname = 'cv.localhost'
  await page.goto(url.href)
  await expect(page.getByRole('heading', { level: 1, name: resumeName })).toBeVisible()
  await expect(page.getByRole('button', { name: '打印 / 保存 PDF' })).toBeVisible()
  await expect(page.getByRole('link', { name: '回到书架' })).toHaveAttribute('href', `http://localhost:${url.port}/?from=cv`)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: resumeName })).toBeVisible()
  await expect(page.locator('.theatre-curtain')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('从 cv 跨域返回书架保持展开，但刷新仍恢复开场', async ({ page, baseURL }) => {
  const home = new URL(baseURL!)
  home.hostname = 'localhost'
  await page.goto(home.href)
  await page.keyboard.press('Escape')
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
  const cv = new URL(home)
  cv.hostname = 'cv.localhost'
  await page.goto(cv.href)
  await page.getByRole('link', { name: '回到书架' }).click()
  await expect(page).toHaveURL(home.href)
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
  await expect(page.locator('html')).not.toHaveClass(/resume-mode/)
  await page.reload()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closed')
})


test('技术栈使用本地品牌图标，不再显示占位 mark', async ({ page }) => {
  await page.goto('/resume')
  const technologies = page.locator('.resume-techs li')
  const slugs: Record<string, string> = {
    Ollama: 'ollama', FastAPI: 'fastapi', Docker: 'docker', Electron: 'electron',
    'Three.js': 'threejs', React: 'react', LangChain: 'langchain', Vue: 'vue', Git: 'git',
    Python: 'python', OpenCV: 'opencv', NumPy: 'numpy', TypeScript: 'typescript', Vite: 'vite', 飞书: 'feishu',
  }
  await expect(technologies).toHaveCount(17)
  const entries = page.locator('.resume-entry')
  await expect(entries.nth(0).locator('.resume-techs li')).toHaveText(['Ollama', 'FastAPI', 'Docker', 'Python', 'OpenCV', 'NumPy'])
  await expect(entries.nth(1).locator('.resume-techs li')).toHaveText(['Electron', 'Three.js', 'React', 'FastAPI', 'TypeScript', 'Vite'])
  await expect(entries.nth(2).locator('.resume-techs li')).toHaveText(['LangChain', 'FastAPI', 'Vue', 'Git', '飞书'])
  await expect(page.locator('.resume-tech-mark')).toHaveCount(0)
  for (const item of await technologies.all()) {
    const name = (await item.innerText()).trim()
    const icon = item.locator('img.resume-tech-icon')
    await expect(icon).toBeVisible()
    await expect(icon).toHaveAttribute('src', '/images/tech/' + slugs[name] + (name === '飞书' ? '.png' : '.svg'))
    await expect(icon).toHaveAttribute('alt', '')
    expect(await icon.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
  }
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('.resume-tech-icon[data-monochrome]')).toHaveCount(3)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.resume-tech-icon').first()).toBeVisible()
})

test('三个项目各保留三条实际工作描述，第三条在桌面自然排成约三行', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/resume')
  await page.evaluate(() => document.fonts.ready)
  const entries = page.locator('.resume-entry')
  await expect(entries).toHaveCount(3)
  for (const entry of await entries.all()) {
    const points = entry.locator('.resume-points > li')
    await expect(points).toHaveCount(3)
    const third = points.nth(2)
    await expect(third.locator('br')).toHaveCount(0)
    const lineCount = await third.evaluate(element =>
      element.getBoundingClientRect().height / Number.parseFloat(getComputedStyle(element).lineHeight),
    )
    expect(lineCount).toBeCloseTo(3, 0)
  }
  await page.screenshot({ path: test.info().outputPath('resume-expanded.png'), fullPage: true })
})


test('学校校徽后显示 985，飞书在浅色、暗色与打印中保持原色', async ({ page }) => {
  await page.goto('/resume')
  const school = page.locator('.resume-school')
  await expect(school).toContainText('(985)')
  expect(await school.locator('img').evaluate(image => image.nextElementSibling?.textContent)).toBe('(985)')
  const feishu = page.locator('.resume-techs li').filter({ hasText: '飞书' }).locator('img')
  await expect(feishu).toHaveAttribute('src', '/images/tech/feishu.png')
  expect(await feishu.getAttribute('data-monochrome')).toBeNull()
  const response = await page.request.get('/images/tech/feishu.png')
  expect(response.ok()).toBe(true)
  expect((await response.body()).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ media: 'screen', colorScheme })
    await expect(feishu).toHaveCSS('filter', 'none')
    expect(await feishu.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
  }
  await page.emulateMedia({ media: 'print' })
  await expect(feishu).toHaveCSS('filter', 'none')
})


test('公开简历在 SSR、禁用脚本与打印中只显示博和完整邮箱，电话保持脱敏', async ({ browser, request, baseURL }) => {
  for (const path of ['/resume', '/resume?full=1&private=true']) {
    const response = await request.get(path)
    const html = await response.text()
    expect(html).toContain('<title>**博 - 大模型应用开发工程师</title>')
    expect(html).not.toContain('孙**')
    expect(html).toContain('151****8912')
    expect(html).toContain(resume.email)
    expect(html).not.toMatch(/href=["'](?:tel:|mailto:)/)
  }
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  await page.goto('/resume')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('#resume-name')).toHaveText('**博')
  await expect(page.locator('[data-resume-field=phone]')).toHaveText('151****8912')
  await expect(page.locator('[data-resume-field=email]')).toHaveText(resume.email)
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /^\*\*博的/)
  await context.close()
})

test('简历字号和行高对齐参考站，手机与打印不再缩小', async ({ page }) => {
  await page.goto('/resume')
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const media of ['screen', 'print'] as const) {
      await page.emulateMedia({ media })
      await page.evaluate(() => document.fonts.ready)
      for (const [selector, size, line] of [
        ['.resume-page', '14.8px', '20.72px'],
        ['.resume-header h1', '29.6px', '41.44px'],
        ['.resume-section > h2', '20px', '28px'],
        ['.resume-entry-heading h3', '14.8px', '20.72px'],
        ['.resume-entry-description', '14.8px', '20.72px'],
        ['.resume-entry-role', '14.8px', '20.72px'],
        ['.resume-points li', '14.8px', '20.72px'],
        ['.resume-info li', '14.8px', '22.2px'],
        ['.resume-techs', '14px', '20px'],
      ]) {
        const element = page.locator(selector!).first()
        await expect(element).toHaveCSS('font-size', size!)
        await expect(element).toHaveCSS('line-height', line!)
      }
      expect(await page.evaluate(() => [...document.fonts].some(font =>
        font.family === 'InterVariable' && font.status === 'loaded',
      ))).toBe(true)
      if (media === 'screen') {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      }
    }
  }
})

test('A4 打印将底部多余留白分配到章节和项目间距，仍保留安全页边', async ({ page }) => {
  // A4 minus 10mm top/bottom margins, at CSS 96dpi.
  const printableHeight = (297 - 20) * 96 / 25.4
  await page.setViewportSize({ width: Math.round(190 * 96 / 25.4), height: Math.round(printableHeight) })
  await page.emulateMedia({ media: 'print' })
  await page.goto('/resume')
  await page.evaluate(() => document.fonts.ready)
  const paperHeight = await page.locator('.resume-paper').evaluate(element => element.getBoundingClientRect().height)
  const remaining = printableHeight - paperHeight
  // Keep 2–10mm breathing room inside the printable area, without a fixed/stretched paper height.
  expect(remaining).toBeGreaterThanOrEqual(2 * 96 / 25.4)
  expect(remaining).toBeLessThanOrEqual(10 * 96 / 25.4)
  await expect(page.locator('.resume-section').first()).toHaveCSS('margin-top', '20px')
  await expect(page.locator('.resume-entry').first()).toHaveCSS('margin-top', '14px')
  await expect(page.locator('.resume-points li').first()).toHaveCSS('margin-top', '3px')
})
