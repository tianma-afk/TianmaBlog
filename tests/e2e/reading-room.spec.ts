import { expect, test } from '@playwright/test'

const storageKey = 'tianma:curtain-seen:v1'

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

test('首次启幕、焦点转移，以及刷新后不重复打扰', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'warning' && /hydration/i.test(message.text())) errors.push(message.text())
  })
  await page.goto('/')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button', { name: '启 幕' })).toBeFocused()
  await page.getByRole('button', { name: '启 幕' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expectUnobstructedBooks(page)
  await page.screenshot({ path: test.info().outputPath('bookshelf.png'), fullPage: true })
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('true')
  await page.reload()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('跳过动画、重看启幕以及键盘焦点循环', async ({ page }) => {
  await page.goto('/')
  await page.screenshot({ path: test.info().outputPath('curtain.png'), fullPage: true })
  const enter = page.getByRole('button', { name: '启 幕' })
  const skip = page.getByRole('button', { name: /跳过动画/ })
  await expect(enter).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(skip).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(enter).toBeFocused()
  await skip.click()
  await page.getByRole('button', { name: '重看启幕' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(enter).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

for (const [slug, title] of [['resume', '简历'], ['blog', '博客'], ['novels', '小说'], ['journal', '日志']]) {
  test(`${title}可从书架进入、直接访问并返回`, async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /跳过动画/ }).click()
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
  await page.getByRole('button', { name: '启 幕' }).click()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open', { timeout: 1000 })
})

test('禁止本地存储时仍可进入并在站内返回', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: /跳过动画/ }).click()
  await page.getByRole('link', { name: /^翻开博客：/ }).click()
  await page.getByRole('link', { name: '回到书架' }).click()
  await expect(page.locator('.theatre-curtain')).toHaveAttribute('data-phase', 'open')
})

test('窄屏下书本不溢出、不会被幕布挡住', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/')
  await page.getByRole('button', { name: /跳过动画/ }).click()
  await expectUnobstructedBooks(page)
})

test('书封文字完整，简历标题保持纵排', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /跳过动画/ }).click()
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
