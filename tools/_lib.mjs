/**
 * 共用工具库 —— 供 体检 / 修复装配 / 升级 / relay自启 四个脚本使用。
 * 只依赖 Node 内置模块，无第三方依赖。
 */
import { existsSync, readFileSync, writeFileSync, copyFileSync, readdirSync, statSync, lstatSync, readlinkSync, unlinkSync, symlinkSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

export const PKG_NAME = '@dsh-external/dsh-foundry-vtt'
export const TOOLS_DIR = dirname(fileURLToPath(import.meta.url))
export const BUNDLE_DIR = resolve(TOOLS_DIR, '..')
export const BUNDLE_PLUGIN_DIR = join(BUNDLE_DIR, 'plugin')
export const BUNDLE_RELAY_DIR = join(BUNDLE_DIR, 'relay')

export const OK = '✅'
export const BAD = '❌'
export const WARN = '⚠️ '
export const DOT = '·'

// ── 输出 ────────────────────────────────────────────────────
export function head(title) {
  console.log('')
  console.log('='.repeat(58))
  console.log('  ' + title)
  console.log('='.repeat(58))
}
export function sec(title) { console.log(''); console.log('【' + title + '】') }
export function line(tag, text) { console.log('  ' + tag + ' ' + text) }
export function ok(text, detail) { line(OK, text); if (detail) console.log('     ' + detail) }
export function bad(text, detail) { line(BAD, text); if (detail) console.log('     ' + detail) }
export function warn(text, detail) { line(WARN, text); if (detail) console.log('     ' + detail) }
export function info(text) { console.log('     ' + text) }
export function fmtSize(n) { return n >= 1048576 ? (n / 1048576).toFixed(2) + ' MB' : (n / 1024).toFixed(1) + ' KB' }

// ── 路径 ────────────────────────────────────────────────────
export function dshDir() { return join(process.env.USERPROFILE || homedir(), '.dsh') }
export function profilesRoot() { return join(dshDir(), 'profiles') }
export function configPath() { return join(dshDir(), 'dsh-foundry-vtt', 'config.json') }
export function junctionPath(profileDir) { return join(profileDir, 'node_modules', ...PKG_NAME.split('/')) }

export function findProfiles() {
  const root = profilesRoot()
  if (!existsSync(root)) return []
  const out = []
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue
    const dir = join(root, e.name)
    const pkgPath = join(dir, 'package.json')
    if (existsSync(pkgPath)) out.push({ name: e.name, dir, pkgPath })
  }
  return out
}

// ── JSON 读写（UTF-8 无 BOM，2 空格缩进，末尾换行）────────────
export function readJson(p) {
  let s = readFileSync(p, 'utf8')
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1)
  return JSON.parse(s)
}
export function writeJson(p, obj) {
  writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8')
}
export function backupFile(p) {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const b = `${p}.bak-${stamp}`
  copyFileSync(p, b)
  return b
}

// ── Windows 目录链接（junction）──────────────────────────────
export function junctionTarget(linkPath) {
  try {
    const st = lstatSync(linkPath)
    if (!st.isSymbolicLink()) return null
    return readlinkSync(linkPath)
  } catch { return null }
}
export function samePath(a, b) { return resolve(a).toLowerCase() === resolve(b).toLowerCase() }
/** 建立/校正 junction；已正确则返回 unchanged。若目标位置是真实目录（非链接）则拒绝覆盖。 */
export function makeJunction(linkPath, target) {
  mkdirSync(dirname(linkPath), { recursive: true })
  if (existsSync(linkPath)) {
    const cur = junctionTarget(linkPath)
    if (cur && samePath(cur, target)) return 'unchanged'
    if (!cur) throw new Error('该位置已存在真实目录（不是链接），拒绝覆盖：' + linkPath)
    unlinkSync(linkPath)
  }
  symlinkSync(resolve(target), linkPath, 'junction')
  return 'created'
}

// ── 运行态探测 ───────────────────────────────────────────────
export async function probeRelay(url, ms = 3000) {
  const base = String(url || 'http://localhost:3010').replace(/\/+$/, '')
  try {
    const r = await fetch(base + '/api/health', { signal: AbortSignal.timeout(ms) })
    const body = (await r.text()).slice(0, 200)
    return { ok: r.ok, status: r.status, body, base }
  } catch (e) {
    return { ok: false, base, error: e?.name === 'TimeoutError' ? '超时（' + ms + 'ms）' : String(e?.message || e) }
  }
}
export function relayProcess() {
  try {
    const out = execSync('tasklist /FI "IMAGENAME eq relay.exe" /FO CSV /NH', { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })
    const m = out.match(/relay\.exe","?(\d+)/i)
    return m ? { pid: m[1] } : null
  } catch { return null }
}

// ── 配置 ────────────────────────────────────────────────────
export function readConfig() {
  const p = configPath()
  if (!existsSync(p)) return { path: p, exists: false }
  try { return { path: p, exists: true, data: readJson(p) } }
  catch (e) { return { path: p, exists: true, error: String(e?.message || e) } }
}

// ── 定位插件目录：显式参数 > profile 链接 > 本包同级 plugin ────
export function detectPluginDir(explicit) {
  if (explicit) {
    const d = resolve(explicit)
    if (existsSync(join(d, 'package.json'))) return { dir: d, from: '指定参数' }
  }
  for (const p of findProfiles()) {
    try {
      const v = readJson(p.pkgPath).dependencies?.[PKG_NAME]
      if (typeof v === 'string' && v.startsWith('link:')) {
        const d = resolve(v.slice(5))
        if (existsSync(join(d, 'package.json'))) return { dir: d, from: 'profile 链接（' + p.name + '）' }
      }
    } catch { /* 忽略坏 profile */ }
  }
  if (existsSync(join(BUNDLE_PLUGIN_DIR, 'package.json'))) return { dir: BUNDLE_PLUGIN_DIR, from: '本包同级 plugin/' }
  return { dir: null, from: null }
}

/** 装配四要素一次补齐：dependencies 链接 + bundles 登记 + node_modules junction。
 *  返回每个 profile 的结果 { profile, ok, changed[], junction, backup, error }。 */
export function ensureAssembly(pluginDir, targets) {
  const want = 'link:' + pluginDir
  const results = []
  for (const p of targets) {
    const r = { profile: p.name, ok: false, changed: [], junction: null, backup: null, error: null }
    try {
      const j = readJson(p.pkgPath)
      const needDep = j.dependencies?.[PKG_NAME] !== want
      const needBundle = !((j.dsh?.profile?.bundles) || []).includes(PKG_NAME)
      if (needDep || needBundle) {
        r.backup = backupFile(p.pkgPath)
        j.dependencies = j.dependencies || {}
        j.dependencies[PKG_NAME] = want
        j.dsh = j.dsh || {}
        j.dsh.profile = j.dsh.profile || {}
        if (!Array.isArray(j.dsh.profile.bundles)) j.dsh.profile.bundles = []
        if (!j.dsh.profile.bundles.includes(PKG_NAME)) j.dsh.profile.bundles.push(PKG_NAME)
        writeJson(p.pkgPath, j)
        if (needDep) r.changed.push('dependencies')
        if (needBundle) r.changed.push('bundles')
      }
      const jr = makeJunction(junctionPath(p.dir), pluginDir)
      r.junction = jr
      if (jr === 'created') r.changed.push('junction')
      r.ok = true
    } catch (e) {
      r.error = String(e?.message || e)
    }
    results.push(r)
  }
  return results
}

/** 读插件自身版本与入口文件状态 */
export function pluginInfo(dir) {
  const pkgPath = join(dir, 'package.json')
  const out = { dir, pkgPath, exists: false }
  if (!existsSync(pkgPath)) return out
  out.exists = true
  try { out.pkg = readJson(pkgPath); out.version = out.pkg.version } catch (e) { out.error = String(e?.message || e) }
  const entry = join(dir, out.pkg?.main ? out.pkg.main.replace(/^\.\//, '') : 'lib/index.js')
  out.entry = entry
  if (existsSync(entry)) { out.entrySize = statSync(entry).size } else { out.entryMissing = true }
  return out
}
