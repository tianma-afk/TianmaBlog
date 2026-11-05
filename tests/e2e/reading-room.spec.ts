import { expect, test } from '@playwright/test'

const storageKey = 'tianma:curtain-seen:v1'
const entranceLabel = '拉开幕布，进入书房'

async function skipCurtain(page: import('@playwright/test').Page) {
  await expect(page.getByRole('button', { name: entranceLabel })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

async function expectUnobstructedBooks(page: import('@playwright/test').Page) {
  const books = page.getByRole('navigation', { name: '选择一本书，进入栏目' }).getByRole('link')
  await expect(books).toHaveCount(4)
  for (const book of await books.all()) {
    await book.scrollIntoViewIfNeeded()
    await expect(book).toBeInViewport()
    await book.click({ trial: true })
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
}

test('幕布只显示艺术字，字体瞬间就绪无跳变且窄屏不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/')
  const dialog = page.getByRole('dialog', { name: 'Life is a play' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveText('Life is a play')
  const fontLoaded = await page.evaluate(async () => {
    const fonts = await document.fonts.load('50px "Pinyon Script"')
    return fonts.length > 0 && fonts.every(font => font.status === 'loaded')
  })
  expect(fontLoaded).toBe(true)
  const fontReadyImmediately = await page.evaluate(() => document.fonts.check('50px "Pinyon Script"'))
  expect(fontReadyImmediately).toBe(true)
  const title = await page.locator('.curtain-title').boundingBox()
  expect(title).not.toBeNull()
  expect(title!.x).toBeGreaterThanOrEqual(0)
  expect(title!.x + title!.width).toBeLessThanOrEqual(320)
  await page.screenshot({ path: test.info().outputPath('curtain-small.png') })
})

test('直接访问或刷新首页一开始合上幕布，启幕后站内访问书架保持展开，清理旧存储', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'warning' && /hydration/i.test(message.text())) errors.push(message.text())
  })
  // 模拟之前版本留下的 localStorage 标记
  await page.addInitScript(key => localStorage.setItem(key, 'true'), storageKey)
  await page.goto('/')
  // 即使有旧 storage，直接访问也必须是一开始合上的
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closed')
  await expect(page.getByRole('dialog', { name: 'Life is a play' })).toBeVisible()
  // 旧 storage 应该被清除
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull()

  const entrance = page.getByRole('button', { name: entranceLabel })
  await expect(entrance).toBeFocused()
  await entrance.click({ position: { x: 24, y: 100 } })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expectUnobstructedBooks(page)
  await page.screenshot({ path: test.info().outputPath('bookshelf.png'), fullPage: true })

  // 刷新页面后重新直接访问，一开始依然期望合上
  await page.reload()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closed')
  await expect(page.getByRole('dialog', { name: 'Life is a play' })).toBeVisible()
  expect(errors).toEqual([])
})

test('跳过动画、退出以及键盘焦点循环', async ({ page }) => {
  await page.goto('/')
  const entrance = page.getByRole('button', { name: entranceLabel })
  await expect(entrance).toBeFocused()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: test.info().outputPath('curtain.png'), fullPage: true })
  await page.keyboard.press('Shift+Tab')
  await expect(entrance).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(entrance).toBeFocused()
  await skipCurtain(page)
  await page.getByRole('button', { name: '退出' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(entrance).toBeFocused()
  await skipCurtain(page)
})

test('退出先合拢两侧幕布，最后才恢复艺术字', async ({ page }) => {
  await page.goto('/')
  await skipCurtain(page)
  await page.locator('.room-header button').click()
  await expect(page.locator('.curtain-title')).toHaveCount(0)
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closing')

  const panels = page.locator('.curtain-panel')
  await expect.poll(() => panels.evaluateAll(elements =>
    elements.reduce((total, element) => total + element.getAnimations().length, 0),
  )).toBe(2)
  await panels.evaluateAll(elements => {
    for (const element of elements) {
      for (const animation of element.getAnimations()) {
        animation.pause()
        animation.currentTime = 1000
      }
    }
  })
  await expect(page.locator('.curtain-title')).toHaveCount(0)
  await page.screenshot({ path: test.info().outputPath('exit-closing.png') })

  // 只完成一侧不算退出完成；两侧都结束后才允许显示文字。
  await panels.nth(0).evaluate(element => element.getAnimations().forEach(animation => animation.finish()))
  await expect(page.locator('.curtain-title')).toHaveCount(0)
  await panels.nth(1).evaluate(element => element.getAnimations().forEach(animation => animation.finish()))
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closed')
  await expect(page.getByRole('dialog', { name: 'Life is a play' })).toBeVisible()
  await expect(page.getByRole('button', { name: entranceLabel })).toBeFocused()
})

test('退出使用门与箭头图标，减少动态效果时立即返回开场', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await skipCurtain(page)
  const exit = page.getByRole('button', { name: '退出', exact: true })
  await expect(exit.locator('svg')).toHaveAttribute('aria-hidden', 'true')
  await expect(exit.locator('svg path')).toHaveCount(2)
  await exit.click()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closed', { timeout: 1000 })
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull()
  await page.reload()
  await expect(page.getByRole('dialog', { name: 'Life is a play' })).toBeVisible()
  await skipCurtain(page)
  await expect(exit).toBeVisible()
})

test('退出途中开启减少动态效果，也能完成合拢而不卡住', async ({ page }) => {
  await page.goto('/')
  await skipCurtain(page)
  await page.getByRole('button', { name: '退出', exact: true }).click()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closing')
  // 暂停两侧动画，确保测试确实覆盖合拢途中的偏好切换。
  await expect.poll(() => page.locator('.curtain-panel').evaluateAll(elements =>
    elements.reduce((total, element) => total + element.getAnimations().length, 0),
  )).toBe(2)
  await page.locator('.curtain-panel').evaluateAll(elements => {
    for (const element of elements) {
      for (const animation of element.getAnimations()) animation.pause()
    }
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByRole('dialog', { name: 'Life is a play' })).toBeVisible()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'closed')
})

for (const key of ['Enter', 'Space']) {
  test(`可用 ${key} 启幕而无需可见按钮`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(page.getByRole('button', { name: entranceLabel })).toBeFocused()
    await page.keyboard.press(key)
    await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
  })
}

for (const [slug, title] of [['resume', '简历'], ['blog', '博客'], ['novels', '小说'], ['journal', '日志']]) {
  test(`${title}可从书架进入、直接访问并返回`, async ({ page }) => {
    await page.goto('/')
    await skipCurtain(page)
    await page.getByRole('link', { name: new RegExp(`翻开${title}：`) }).click()
    await expect(page).toHaveURL(`/${slug}`)
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(page.getByText('书页已打开，内容正在准备中。')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await page.getByRole('link', { name: '回到书架' }).click()
    await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
  })
}

test('减少动态效果偏好会直接启幕', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: entranceLabel }).click()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open', { timeout: 1000 })
})

test('禁止本地存储时仍可进入并在站内返回', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } })
  })
  await page.goto('/')
  await skipCurtain(page)
  await page.getByRole('link', { name: /^翻开博客：/ }).click()
  await page.getByRole('link', { name: '回到书架' }).click()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
})

test('窄屏下书本不溢出、不会被幕布挡住', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/')
  await skipCurtain(page)
  await expectUnobstructedBooks(page)
})

test('书封文字完整，简历标题保持纵排', async ({ page }) => {
  await page.goto('/')
  await skipCurtain(page)
  const coversFit = await page.locator('.book-cover').evaluateAll(covers => covers.every(cover => {
    const bounds = cover.getBoundingClientRect()
    return [...cover.children].every(child => child.getBoundingClientRect().bottom <= bounds.bottom - 2)
  }))
  expect(coversFit).toBe(true)
  const title = await page.locator('.library-book--forest .book-title').boundingBox()
  expect(title).not.toBeNull()
  expect(title!.height).toBeGreaterThan(title!.width)
  const glyphsInOrder = await page.locator('.library-book--forest .book-title > span').evaluateAll(([first, second]) =>
    first!.getBoundingClientRect().bottom <= second!.getBoundingClientRect().top,
  )
  expect(glyphsInOrder).toBe(true)
})

test('不存在的栏目返回 404', async ({ page }) => {
  const response = await page.goto('/not-a-book')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: '这本书还不在架上。' })).toBeVisible()
})

test('未开启 JavaScript 也可以浏览书架和栏目', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  await page.goto('/')
  await page.getByRole('link', { name: /^翻开博客：/ }).click()
  await expect(page.getByRole('heading', { name: '博客', exact: true })).toBeVisible()
  await context.close()
})
