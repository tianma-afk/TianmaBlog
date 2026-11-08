import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validateIdentity, readPrivateIdentity, checkPublicBuild } from '../../scripts/export-resume.mjs'

const identity = { name: '投递测试员', phone: '13900000000', email: 'application@example.invalid' }

test('accepts only valid private identity and trims outer whitespace', () => {
  assert.deepEqual(validateIdentity({ ...identity, name: '  投递测试员  ', ignored: 'not exported' }), identity)
  for (const value of [null, {}, { ...identity, name: '' }, { ...identity, name: '<script>' }, { ...identity, phone: '139****0000' }, { ...identity, email: 'not-email' }, { ...identity, name: '姓名\n多行' }]) {
    assert.throws(() => validateIdentity(value), /身份配置/)
  }
})

test('missing or malformed local JSON fails without logging identity', async () => {
  const root = await mkdtemp(join(tmpdir(), 'resume-config-'))
  try {
    await assert.rejects(readPrivateIdentity(root), /identity.json/)
    await mkdir(join(root, '.private/resume'), { recursive: true })
    await writeFile(join(root, '.private/resume/identity.json'), '{invalid json')
    await assert.rejects(readPrivateIdentity(root), /JSON/)
    await writeFile(join(root, '.private/resume/identity.json'), '\ufeff' + JSON.stringify(identity))
    assert.deepEqual(await readPrivateIdentity(root), identity)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('scans source and deployable output but never treats private files as public', async () => {
  const root = await mkdtemp(join(tmpdir(), 'resume-scan-'))
  try {
    for (const directory of ['app', 'public', '.output/public/_nuxt', '.private/resume']) await mkdir(join(root, directory), { recursive: true })
    await writeFile(join(root, '.private/resume/identity.json'), JSON.stringify(identity))
    await writeFile(join(root, '.output/public/_nuxt/safe.js'), 'const name="博"')
    await checkPublicBuild(identity, root)
    const escapedName = [...identity.name].map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0')).join('')
    for (const value of [identity.name, identity.phone, encodeURIComponent(identity.name), escapedName]) {
      await writeFile(join(root, '.output/public/_nuxt/leak.js'), value)
      await assert.rejects(checkPublicBuild(identity, root), error => {
        assert.match(error.message, /隐私检查失败/)
        assert.ok(!error.message.includes(identity.name) && !error.message.includes(identity.phone) && !error.message.includes(identity.email))
        return true
      })
    }
  } finally { await rm(root, { recursive: true, force: true }) }
})


test('public email is allowed while full name and phone are still blocked', async () => {
  const root = await mkdtemp(join(tmpdir(), 'resume-public-email-'))
  try {
    await mkdir(join(root, 'app'), { recursive: true })
    const path = join(root, 'app/contact.js')
    await writeFile(path, JSON.stringify({ name: '博', phone: '139****0000', email: identity.email, mailto: 'mailto:' + encodeURIComponent(identity.email) }))
    await checkPublicBuild(identity, root)
    for (const field of ['name', 'phone']) {
      await writeFile(path, JSON.stringify({ email: identity.email, [field]: identity[field] }))
      await assert.rejects(checkPublicBuild(identity, root), /隐私检查失败/)
    }
  } finally { await rm(root, { recursive: true, force: true }) }
})
