import { spawn } from 'node:child_process'
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function validateIdentity(value) {
  const invalid = () => { throw new Error('身份配置无效：需要完整的 name、phone、email；请勿填脱敏值、HTML 或多行内容。') }
  if (!value || typeof value !== 'object') invalid()
  const result = {}
  for (const field of ['name', 'phone', 'email']) {
    if (typeof value[field] !== 'string' || /[\x00-\x1f\x7f<>*]/.test(value[field])) invalid()
    result[field] = value[field].trim()
  }
  if (!result.name || result.name.length > 80) invalid()
  if (!/^\+?[\d ()-]{7,25}$/.test(result.phone) || result.phone.replace(/\D/g, '').length < 7) invalid()
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(result.email)) invalid()
  return result
}

export async function readPrivateIdentity(root = projectRoot) {
  const path = join(root, '.private/resume/identity.json')
  let raw
  try { raw = await readFile(path, 'utf8') }
  catch { throw new Error(`未找到本地身份文件：${path}。请参考 docs/resume.md 创建；不要放进 public 或环境变量。`) }
  let value
  try { value = JSON.parse(raw.replace(/^\ufeff/, '')) }
  catch { throw new Error('本地身份文件不是有效 JSON。请检查 .private/resume/identity.json，文件内容不会写入日志。') }
  return validateIdentity(value)
}

// Scan client and server artifacts for full name and phone. Email is intentionally public.
export async function checkPublicBuild(input, root = projectRoot) {
  const identity = validateIdentity(input)
  const variants = ['name', 'phone'].map(field => [field, [identity[field], encodeURIComponent(identity[field])]])
  async function scan(directory) {
    let entries
    try { entries = await readdir(directory, { withFileTypes: true }) }
    catch (error) { if (error.code === 'ENOENT') return; throw error }
    for (const entry of entries) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) await scan(path)
      else if (entry.isFile()) {
        const raw = await readFile(path, 'utf8')
        const decoded = raw.replace(/\\u([0-9a-f]{4})/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
        for (const [field, values] of variants) {
          if (values.some(value => decoded.includes(value))) {
            // Never echo the matched private value, even when failing.
            throw new Error(`隐私检查失败：${path} 包含完整 ${field} 字段。请移除后重新构建。`)
          }
        }
      }
    }
  }
  for (const directory of ['app', 'public', '.output']) await scan(join(root, directory))
}

export async function applyPrivateIdentity(page, input) {
  const identity = validateIdentity(input)
  await page.evaluate(identity => {
    const fields = Object.fromEntries(['name', 'phone', 'email'].map(key => {
      const node = document.querySelector(`[data-resume-field="${key}"]`)
      if (!node) throw new Error('简历模板缺少本地导出字段')
      return [key, node]
    }))
    const maskedName = fields.name.textContent
    fields.name.textContent = identity.name
    for (const [key, scheme] of [['phone', 'tel:'], ['email', 'mailto:']]) {
      const link = document.createElement('a')
      link.textContent = identity[key]
      link.setAttribute('href', scheme + identity[key])
      fields[key].replaceChildren(link)
    }
    document.title = document.title.replace(maskedName, identity.name)
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', description.getAttribute('content').replace(maskedName, identity.name))
  }, identity)
}

async function stopServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return
  await new Promise(resolve => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); resolve() }, 3000)
    child.once('exit', () => { clearTimeout(timer); resolve() })
    child.kill()
  })
}

function serverOrigin(child) {
  return new Promise((resolve, reject) => {
    let output = ''
    const timer = setTimeout(() => reject(new Error('本地简历服务启动超时。')), 30_000)
    child.stdout.on('data', chunk => {
      output = (output + chunk).slice(-8000)
      const match = output.match(/Listening on (http:\/\/127\.0\.0\.1:\d+)/)
      if (match) { clearTimeout(timer); resolve(match[1]) }
    })
    // Drain stderr, but never forward application output containing possible personal data.
    child.stderr.resume()
    child.once('error', () => { clearTimeout(timer); reject(new Error('无法启动本地简历服务。')) })
    child.once('exit', () => { clearTimeout(timer); reject(new Error('本地简历服务提前退出，请重新运行 npm run build。')) })
  })
}

export async function exportResumePdf({ root = projectRoot, identity, channel = process.env.PLAYWRIGHT_CHANNEL } = {}) {
  identity = validateIdentity(identity ?? await readPrivateIdentity(root))
  const entry = join(root, '.output/server/index.mjs')
  try { await access(entry) }
  catch { throw new Error('缺少本地 Node 生产构建，请先运行 npm run build。') }
  await checkPublicBuild(identity, root)
  const child = spawn(process.execPath, [entry], {
    cwd: root,
    env: {
      ...process.env,
      HOST: '127.0.0.1', NITRO_HOST: '127.0.0.1', PORT: '0', NITRO_PORT: '0',
      NITRO_UNIX_SOCKET: '', NITRO_SSL_CERT: '', NITRO_SSL_KEY: '',
      NUXT_APP_BASE_URL: '/', NUXT_APP_CDN_URL: '', NODE_ENV: 'production',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  let browser
  const interrupt = () => { child.kill(); void browser?.close() }
  process.once('SIGINT', interrupt)
  process.once('SIGTERM', interrupt)
  try {
    const origin = await serverOrigin(child)
    try { browser = await chromium.launch({ channel: channel || (process.platform === 'win32' ? 'chrome' : undefined) }) }
    catch { throw new Error('无法启动 Chromium。请运行 npx playwright install chromium，或设置 PLAYWRIGHT_CHANNEL=chrome 使用本机 Chrome。') }
    const context = await browser.newContext({
      javaScriptEnabled: false, serviceWorkers: 'block', colorScheme: 'light',
      viewport: { width: 1440, height: 1000 },
    })
    // Only this freshly started loopback origin may load resources; no analytics or external assets.
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
    await context.routeWebSocket('**/*', socket => socket.close())
    const page = await context.newPage()
    const response = await page.goto(`${origin}/resume`, { waitUntil: 'networkidle' })
    if (!response?.ok()) throw new Error('本地简历页面加载失败。')
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all([...document.images].map(image => image.decode()))
    })
    // Freeze ALL network activity before complete identity ever enters the browser.
    await context.route('**/*', route => route.abort())
    await applyPrivateIdentity(page, identity)
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false })
    const output = join(root, '.private/resume/resume-full.pdf')
    await mkdir(dirname(output), { recursive: true })
    await writeFile(output, pdf, { mode: 0o600 })
    return output
  } finally {
    await browser?.close().catch(() => {})
    await stopServer(child)
    process.removeListener('SIGINT', interrupt)
    process.removeListener('SIGTERM', interrupt)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const output = await exportResumePdf()
    console.log(`完整版 PDF 已生成（仅本地，不上传）：${output}`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
