import assert from 'node:assert/strict'
import { test } from 'node:test'
import { access, cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { applyPrivateIdentity, exportResumePdf } from '../../scripts/export-resume.mjs'

// Fictional identity only. Never copy real identity into test fixtures.
const identity = { name: '投递测试员', phone: '13900000000', email: 'application@example.invalid' }

test('private browser injection preserves layout, replaces metadata and creates PDF contact links', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const context = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: 'block' })
    const page = await context.newPage()
    await page.setContent('<title>**博 - 工程师</title><meta name="description" content="**博的简历"><h1 id="resume-name" data-resume-field="name">**博</h1><span data-resume-field="phone">151****8912</span><span data-resume-field="email">public@example.invalid</span><section>项目经验不变</section><script>document.body.textContent="must not execute"</script>')
    await applyPrivateIdentity(page, identity)
    assert.equal(await page.title(), '投递测试员 - 工程师')
    assert.equal(await page.locator('meta[name=description]').getAttribute('content'), '投递测试员的简历')
    assert.equal(await page.locator('#resume-name').textContent(), identity.name)
    assert.equal(await page.locator('[data-resume-field=phone] a').getAttribute('href'), 'tel:' + identity.phone)
    assert.equal(await page.locator('[data-resume-field=email] a').getAttribute('href'), 'mailto:' + identity.email)
    assert.equal(await page.locator('section').textContent(), '项目经验不变')
    assert.ok(!(await page.content()).includes('151****8912'))
  } finally { await browser.close() }
})

test('exports real production resume only to the ignored local directory', async () => {
  const root = await mkdtemp(join(tmpdir(), 'resume-export-'))
  try {
    const project = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
    await cp(join(project, '.output'), join(root, '.output'), { recursive: true })
    const path = await exportResumePdf({ identity, root })
    assert.equal(path, join(root, '.private/resume/resume-full.pdf'))
    const pdf = await readFile(path)
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
    assert.ok(pdf.byteLength > 10_000)
  } finally { await rm(root, { recursive: true, force: true }) }
})


test('export blocks other origins and closes its own server on success and template failure', async () => {
  let externalRequests = 0
  const tracker = createServer((_, response) => { externalRequests++; response.end('body { color: red }') })
  await new Promise(resolve => tracker.listen(0, '127.0.0.1', resolve))
  const root = await mkdtemp(join(tmpdir(), 'resume-offline-'))
  try {
    await mkdir(join(root, '.output/server'), { recursive: true })
    const html = '<title>**博 - 工程师</title><link rel="stylesheet" href="http://127.0.0.1:' + tracker.address().port + '/style.css"><h1 data-resume-field="name">**博</h1><span data-resume-field="phone">151****8912</span><span data-resume-field="email">public@example.invalid</span>'
    const makeServer = html => 'import { createServer } from "node:http"; import { writeFileSync } from "node:fs"; writeFileSync("server.pid", String(process.pid)); const server=createServer((_, res)=>{res.setHeader("Content-Type", "text/html; charset=utf-8");res.end(' + JSON.stringify(html) + ')});server.listen(Number(process.env.PORT), process.env.HOST, ()=>console.log("Listening on http://127.0.0.1:" + server.address().port));'
    await writeFile(join(root, '.output/server/index.mjs'), makeServer(html))
    const output = await exportResumePdf({ identity, root })
    assert.equal(externalRequests, 0)
    const assertExited = async () => {
      const pid = Number(await readFile(join(root, 'server.pid'), 'utf8'))
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' })
    }
    await assertExited()
    await rm(output)
    await writeFile(join(root, '.output/server/index.mjs'), makeServer(html.replace('data-resume-field="email"', 'data-missing="email"')))
    await assert.rejects(exportResumePdf({ identity, root }), /缺少本地导出字段/)
    await assertExited()
    await assert.rejects(access(output), { code: 'ENOENT' })
    assert.equal(externalRequests, 0)
  } finally {
    await new Promise(resolve => tracker.close(resolve))
    await rm(root, { recursive: true, force: true })
  }
})
