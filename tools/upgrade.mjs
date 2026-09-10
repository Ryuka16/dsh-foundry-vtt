#!/usr/bin/env node
/**
 * 升级 — 用本包里的新版插件覆盖已安装的插件，并自动校验装配。
 * 关键设计：① 旧目录整体改名做备份（不是逐文件覆盖，避免「文件/目录撞名」中断）
 *          ② 拷贝时跳过 node_modules 并把旧的移回（省时间）③ 升级后自动补齐装配四要素
 *
 * 用法：
 *   node tools/upgrade.mjs                 # 自动探测已安装位置
 *   node tools/upgrade.mjs --plugin <目录> # 指定安装目录（插件目录本身，不是它的上级）
 *   node tools/upgrade.mjs --relay         # 顺带更新 relay.exe（默认不动）
 *   node tools/upgrade.mjs --dry           # 只显示计划，不实际改动
 *   node tools/upgrade.mjs --no-assembly   # 只换文件，不碰 DSH profile（测试用）
 */
import { existsSync, mkdirSync, cpSync, renameSync, rmSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import * as L from './_lib.mjs'

const argv = process.argv.slice(2)
const argVal = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : null }
const dry = argv.includes('--dry')
const withRelay = argv.includes('--relay')
const noAssembly = argv.includes('--no-assembly')

L.head('升级 DSH-Foundry-VTT')
console.log('   时间：' + new Date().toLocaleString('zh-CN') + (dry ? '   [试运行，不改动]' : ''))

let exitCode = 0

// ── 1. 新版（本包）──────────────────────────────────────────
L.sec('1 / 新版（本包）')
const fresh = L.pluginInfo(L.BUNDLE_PLUGIN_DIR)
if (!fresh.exists || fresh.error) {
  L.bad('本包里没有可用的 plugin/ 目录')
  L.info('预期：' + L.BUNDLE_PLUGIN_DIR)
  process.exit(1)
}
L.ok('v' + fresh.version + '  ' + L.BUNDLE_PLUGIN_DIR)
if (fresh.entryMissing) { L.bad('新版缺少入口文件 ' + fresh.entry); process.exit(1) }

// ── 2. 已装位置 ─────────────────────────────────────────────
L.sec('2 / 已安装位置')
const explicit = argVal('--plugin')
const tgt = explicit ? { dir: resolve(explicit), from: '手动指定' } : L.detectPluginDir(null)
if (!tgt.dir) {
  L.bad('没找到已安装的插件目录')
  L.info('如果你还没安装过：把本包放到一个固定目录（例如 F:\\ai\\dsh-foundry-vtt\\），然后双击「修复装配.bat」。')
  process.exit(1)
}
const old = L.pluginInfo(tgt.dir)
L.info('来源：' + tgt.from)
L.info('目录：' + tgt.dir)
L.ok('当前版本 v' + (old.version || '未知'))

if (L.samePath(tgt.dir, L.BUNDLE_PLUGIN_DIR)) {
  L.warn('你正在「安装目录」里运行升级 —— 新旧是同一个目录，无法自我覆盖')
  L.info('正确做法：把新版本 zip 解压到别的临时目录，再双击那里的「升级.bat」。')
  L.info('或者：直接把本包内容覆盖到安装目录，然后双击「修复装配.bat」。')
  process.exit(0)
}
if (old.version === fresh.version) {
  L.warn('版本相同（都是 v' + fresh.version + '），仍会照常覆盖 —— 这不影响使用')
}

// 预检：目标目录必须长得像我们的插件
if (!old.exists) {
  L.bad('目标目录里没有 package.json，看起来不是插件目录，已中止')
  process.exit(1)
}

if (dry) {
  L.sec('3 / 计划')
  L.info('备份：' + tgt.dir + '  →  ' + tgt.dir + '.bak-<时间戳>')
  L.info('拷贝：' + L.BUNDLE_PLUGIN_DIR + '  →  ' + tgt.dir)
  L.info('然后补齐装配四要素（dependencies / bundles / junction）')
  console.log(''); console.log('（--dry 结束，未做任何改动）'); console.log('')
  process.exit(0)
}

// ── 3. 备份 + 覆盖 ──────────────────────────────────────────
L.sec('3 / 覆盖安装')
const d = new Date()
const pad = (n) => String(n).padStart(2, '0')
const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
const bakDir = `${tgt.dir}.bak-${stamp}`

try {
  renameSync(tgt.dir, bakDir)
  L.ok('旧版本已整体备份 → ' + bakDir.split(/[\\/]/).pop())
} catch (e) {
  L.bad('备份失败（可能是插件正在被使用）：' + String(e?.message || e))
  exitCode = 1
}

if (!exitCode) {
  let files = 0
  const walk = (s, dst) => {
    mkdirSync(dst, { recursive: true })
    for (const e of readdirSync(s, { withFileTypes: true })) {
      if (e.name === 'node_modules') continue
      const sp = join(s, e.name)
      const dp = join(dst, e.name)
      if (e.isDirectory()) walk(sp, dp)
      else { copyFileSync(sp, dp); files++ }
    }
  }
  try {
    walk(L.BUNDLE_PLUGIN_DIR, tgt.dir)
    L.ok('已写入 ' + files + ' 个文件')
  } catch (e) {
    L.bad('拷贝失败：' + String(e?.message || e))
    L.info('旧版本仍在备份目录里：' + bakDir)
    exitCode = 1
  }
  // 把旧的 node_modules 移回（省去重装依赖）
  const oldNm = join(bakDir, 'node_modules')
  const newNm = join(tgt.dir, 'node_modules')
  if (!existsSync(newNm) && existsSync(oldNm)) {
    try { renameSync(oldNm, newNm); L.ok('旧 node_modules 已移回（保留开发依赖）') } catch { /* 非关键 */ }
  }
}

// ── 4. 顺带更新 relay.exe（可选）────────────────────────────
if (withRelay && !exitCode) {
  L.sec('4 / relay.exe')
  const freshRelay = join(L.BUNDLE_RELAY_DIR, 'go-relay', 'relay.exe')
  const cfg = L.readConfig()
  const installedRelay = cfg.exists && !cfg.error ? cfg.data.relayExePath : null
  if (!existsSync(freshRelay)) L.warn('本包里没有 relay.exe，跳过')
  else if (!installedRelay) L.warn('配置里没有 relayExePath，跳过（插件会用它来拉起 relay）')
  else if (L.samePath(installedRelay, freshRelay)) L.ok('relay.exe 就在本包里，无需更新')
  else {
    try {
      copyFileSync(installedRelay, installedRelay + '.bak-' + stamp)
      copyFileSync(freshRelay, installedRelay)
      L.ok('relay.exe 已更新 → ' + installedRelay)
      L.info('（旧文件已备份为 relay.exe.bak-' + stamp + '）')
    } catch (e) { L.warn('relay.exe 更新失败（relay 可能在运行）：' + String(e?.message || e)) }
  }
}

// ── 5. 校验装配 ─────────────────────────────────────────────
L.sec('5 / 校验装配')
const profiles = L.findProfiles()
if (noAssembly) {
  L.info('（--no-assembly：跳过装配校验，本次只换文件）')
} else if (!profiles.length) {
  L.warn('没找到任何 profile，跳过')
} else {
  const marked = profiles.filter((p) => {
    try {
      const j = L.readJson(p.pkgPath)
      return j.dependencies?.[L.PKG_NAME] || (j.dsh?.profile?.bundles || []).includes(L.PKG_NAME)
    } catch { return false }
  })
  const targets = marked.length ? marked : profiles.filter((p) => p.name === 'web')
  if (!targets.length) {
    L.warn('没找到需要处理的 profile，跳过')
  } else {
    const results = L.ensureAssembly(tgt.dir, targets)
    for (const r of results) {
      if (r.error) { L.bad('[' + r.profile + '] ' + r.error); exitCode = 1; continue }
      if (r.changed.length) L.ok('[' + r.profile + '] 已补齐：' + r.changed.join(' + '))
      else L.ok('[' + r.profile + '] 装配本来就是对的')
    }
  }
}

// ── 结论 ────────────────────────────────────────────────────
console.log('')
console.log('='.repeat(58))
if (!exitCode) {
  console.log('  升级完成 ✅  v' + (old.version || '?') + '  →  v' + fresh.version)
  console.log('')
  console.log('  ★ 重启 DSH 生效。')
  console.log('    旧版本备份在：' + bakDir)
  console.log('    （确认新版没问题后，可以手动删掉这个 .bak- 目录）')
} else {
  console.log('  升级过程中出错了，请把上面的红字发给我')
  console.log('  旧版本备份仍在：' + bakDir)
}
console.log('='.repeat(58))
console.log('')
process.exit(exitCode)
