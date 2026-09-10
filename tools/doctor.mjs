#!/usr/bin/env node
/**
 * 体检 — 一次性打印全链路状态并给出结论。
 * 用法：node tools/doctor.mjs [--plugin <插件目录>]
 */
import { existsSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import * as L from './_lib.mjs'

const argv = process.argv.slice(2)
const iPlugin = argv.indexOf('--plugin')
const explicitPlugin = iPlugin >= 0 ? argv[iPlugin + 1] : null

const problems = []
const warnings = []

L.head('DSH-Foundry-VTT 体检报告')
console.log('   时间：' + new Date().toLocaleString('zh-CN'))

// ── 1. Node ─────────────────────────────────────────────────
L.sec('1 / Node 环境')
const major = Number(process.versions.node.split('.')[0])
if (major >= 22) L.ok('Node ' + process.version)
else { L.bad('Node ' + process.version + ' —— 低于 22，DSH 会拒绝启动'); problems.push('Node 版本 < 22，请升级到 Node 22 或更高') }
L.info('位置：' + process.execPath)
try {
  const out = execSync('where node', { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] })
  const list = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  if (list.length > 1) {
    L.warn('系统里有 ' + list.length + ' 个 node（DSH 可能挑到旧的那个）')
    list.forEach((p) => L.info(p))
    warnings.push('检测到多个 Node，若 DSH 起不来先检查 PATH 里第一个的版本')
  } else if (list.length === 1) {
    L.info('where node → ' + list[0])
  } else {
    L.warn('where node 没有结果')
  }
} catch {
  L.warn('where node 没有结果（node 不在 PATH，DSH 可能检测不到）')
  warnings.push('node 不在 PATH 里')
}

// ── 2. 插件装配（四要素）─────────────────────────────────────
L.sec('2 / DSH 插件装配')
const profiles = L.findProfiles()
if (!profiles.length) {
  L.bad('没找到任何 DSH profile')
  L.info('预期路径：' + L.profilesRoot())
  problems.push('找不到 DSH profile 目录（路径：' + L.profilesRoot() + '）')
} else {
  if (profiles.length > 1) L.info('找到 ' + profiles.length + ' 个 profile：' + profiles.map((p) => p.name).join('、'))
  for (const p of profiles) {
    let j
    try { j = L.readJson(p.pkgPath) } catch (e) {
      L.bad(`[${p.name}] package.json 解析失败：` + String(e?.message || e))
      problems.push(p.name + ': package.json 解析失败')
      continue
    }
    console.log('   ' + L.DOT + ' profile「' + p.name + '」')
    const dep = j.dependencies?.[L.PKG_NAME]
    const bundles = j.dsh?.profile?.bundles || []
    const inBundles = bundles.includes(L.PKG_NAME)
    if (typeof dep !== 'string' && !inBundles) {
      console.log('     ℹ️  没装过本插件 —— 跳过（要装到它：修复装配.bat --all）')
      continue
    }
    const link = L.junctionPath(p.dir)
    const target = L.junctionTarget(link)

    if (typeof dep === 'string' && dep.startsWith('link:')) ok_('dependencies 已链接 → ' + dep.slice(5))
    else { L.bad('dependencies 缺少插件条目'); problems.push(p.name + ': dependencies 缺 ' + L.PKG_NAME) }

    if (inBundles) ok_('bundles 已登记（重启后会自动加载）')
    else { L.bad('bundles 未登记 → DSH 重启后插件不加载，工具会消失'); problems.push(p.name + ': bundles 缺 ' + L.PKG_NAME) }

    if (target) ok_('node_modules 链接 → ' + target)
    else { L.bad('node_modules 下没有链接（junction 缺失）'); problems.push(p.name + ': node_modules 缺链接') }
  }
}
function ok_(t) { console.log('     ' + L.OK + ' ' + t) }

// ── 3. 插件文件 ──────────────────────────────────────────────
L.sec('3 / 插件文件')
const det = L.detectPluginDir(explicitPlugin)
if (!det.dir) {
  L.bad('找不到插件目录')
  L.info('可用 --plugin <插件目录> 指定，例如：node tools/doctor.mjs --plugin F:\\ai\\dsh-foundry-vtt\\plugin')
  problems.push('找不到插件目录')
} else {
  const pi = L.pluginInfo(det.dir)
  L.info('来源：' + det.from)
  L.info('目录：' + pi.dir)
  if (!pi.exists) { L.bad('目录里没有 package.json'); problems.push('插件目录不完整（缺 package.json）') }
  else if (pi.error) { L.bad('package.json 坏了：' + pi.error); problems.push('插件 package.json 解析失败') }
  else {
    L.ok('包名 ' + pi.pkg.name + '  版本 ' + pi.version)
    if (pi.pkg.name !== L.PKG_NAME) { L.bad('包名不对，应为 ' + L.PKG_NAME); problems.push('插件包名不匹配') }
    if (pi.entryMissing) { L.bad('缺少入口文件 ' + pi.entry); problems.push('插件缺少入口 ' + pi.entry) }
    else L.ok('入口 ' + pi.entry + '（' + L.fmtSize(pi.entrySize) + '）')
  }
}

// ── 4. relay 服务 ────────────────────────────────────────────
L.sec('4 / relay 服务（本机 3010 端口）')
const proc = L.relayProcess()
if (proc) L.ok('relay.exe 进程在跑（PID ' + proc.pid + '）')
else { L.bad('relay.exe 没在运行'); problems.push('relay 没启动（FVTT 那侧会连不上）') }

const cfg = L.readConfig()
const relayUrl = cfg.exists && !cfg.error ? (cfg.data.relayUrl || 'http://localhost:3010') : 'http://localhost:3010'
const health = await L.probeRelay(relayUrl)
if (health.ok) L.ok('/api/health 响应 ' + health.status + ' → ' + health.base)
else { L.bad('/api/health 不通（' + (health.error || 'HTTP ' + health.status) + '）'); problems.push('relay 健康检查不通（' + health.base + '）') }

if (cfg.exists && !cfg.error) {
  const exe = cfg.data.relayExePath
  if (exe && existsSync(exe)) L.ok('relay.exe 存在 → ' + exe)
  else if (exe) { L.warn('配置里的 relayExePath 不存在：' + exe); warnings.push('relayExePath 指向的文件不存在') }
  else L.info('config.json 没配 relayExePath（DSH 插件不会自动拉起 relay）')
}

// ── 5. 配对数据 ──────────────────────────────────────────────
L.sec('5 / 配对数据（命根子，别删）')
const dataDir = cfg.exists && !cfg.error && cfg.data.relayDataDir ? cfg.data.relayDataDir : L.relayProcess() ? null : null
const candidates = [dataDir, join(L.BUNDLE_RELAY_DIR, 'data'), join(L.BUNDLE_RELAY_DIR, 'go-relay', 'data')].filter(Boolean)
let dbFound = null
for (const d of candidates) {
  const db = join(d, 'relay.db')
  if (existsSync(db)) { dbFound = db; break }
}
if (dbFound) {
  const st = statSync(dbFound)
  L.ok('relay.db（' + L.fmtSize(st.size) + '）')
  L.info(dbFound)
  L.info('最后修改：' + st.mtime.toLocaleString('zh-CN'))
} else {
  L.warn('没找到 relay.db')
  L.info('若还没配对过，这是正常的；若已配对过却没找到，请先确认 relay 数据目录')
}

// ── 6. 配置文件 ──────────────────────────────────────────────
L.sec('6 / 插件配置')
if (!cfg.exists) {
  L.warn('没有 config.json（还没配置）')
  L.info('路径：' + cfg.path)
  warnings.push('插件配置文件不存在：' + cfg.path)
} else if (cfg.error) {
  L.bad('config.json 解析失败：' + cfg.error)
  problems.push('config.json 解析失败（可能是 BOM 或格式错误）')
} else {
  L.ok('config.json（' + cfg.path + '）')
  L.info('relayUrl = ' + (cfg.data.relayUrl || '（空，用默认 http://localhost:3010）'))
  const key = cfg.data.apiKey
  L.info('apiKey   = ' + (key ? key.slice(0, 8) + '…（' + key.length + ' 字符）' : '（空，未配置）'))
  L.info('clientId = ' + (cfg.data.clientId ? cfg.data.clientId : '（空 = 多世界自动路由）'))
  if (!key) { L.bad('apiKey 没配，AI 调不动 relay'); problems.push('config.json 缺 apiKey') }
}

// ── 结论 ─────────────────────────────────────────────────────
console.log('')
console.log('='.repeat(58))
if (!problems.length) {
  console.log('  结论：' + L.OK + ' 全部正常')
  if (warnings.length) console.log('  （有 ' + warnings.length + ' 条提醒，见上）')
} else {
  console.log('  结论：发现 ' + problems.length + ' 个问题')
  problems.forEach((p, n) => console.log('   ' + (n + 1) + '. ' + p))
  console.log('')
  console.log('  → 装配类问题（dependencies / bundles / junction）：双击「修复装配.bat」')
  console.log('  → relay 没起来：双击 relay 目录里的 start-relay.bat')
}
if (warnings.length) {
  console.log('')
  console.log('  提醒：')
  warnings.forEach((w, n) => console.log('   ' + (n + 1) + '. ' + w))
}
console.log('='.repeat(58))
console.log('')
