#!/usr/bin/env node
/**
 * 修复装配 — 把插件写回 DSH profile，让它在 DSH 重启后依然加载。
 * 四要素一次补齐：dependencies 链接 / bundles 登记 / node_modules junction / 插件文件校验。
 *
 * 用法：
 *   node tools/repair.mjs                    # 修「已有插件痕迹」的 profile（没有则装到 web）
 *   node tools/repair.mjs --all              # 所有 profile 都装
 *   node tools/repair.mjs --profile web      # 只修指定 profile
 *   node tools/repair.mjs --plugin <目录>    # 指定插件目录（默认自动探测）
 */
import * as L from './_lib.mjs'

const argv = process.argv.slice(2)
const argVal = (n) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : null }

L.head('修复插件装配')
console.log('   时间：' + new Date().toLocaleString('zh-CN'))

let exitCode = 0

// ── 1. 定位插件目录 ─────────────────────────────────────────
L.sec('1 / 定位插件目录')
const det = L.detectPluginDir(argVal('--plugin'))
if (!det.dir) {
  L.bad('找不到插件目录 —— 无法继续')
  L.info('用 --plugin <插件目录> 指定，例如：node tools/repair.mjs --plugin F:\\ai\\dsh-foundry-vtt\\plugin')
  process.exit(1)
}
const pi = L.pluginInfo(det.dir)
if (!pi.exists || pi.error) {
  L.bad('插件目录不完整：' + det.dir)
  if (pi.error) L.info(pi.error)
  process.exit(1)
}
if (pi.entryMissing) {
  L.bad('插件缺少入口文件 ' + pi.entry + '（lib 没编译或被删）')
  process.exit(1)
}
L.ok('插件 v' + pi.version + '  ' + pi.dir)
L.info('来源：' + det.from)

// ── 2. 选择要处理的 profile ─────────────────────────────────
L.sec('2 / 选择 profile')
const profiles = L.findProfiles()
if (!profiles.length) {
  L.bad('没找到任何 DSH profile')
  L.info('预期路径：' + L.profilesRoot())
  process.exit(1)
}
const only = argVal('--profile')
const all = argv.includes('--all')
const marked = profiles.filter((p) => {
  try {
    const j = L.readJson(p.pkgPath)
    return j.dependencies?.[L.PKG_NAME] || (j.dsh?.profile?.bundles || []).includes(L.PKG_NAME)
  } catch { return false }
})
let targets
if (only) {
  targets = profiles.filter((p) => p.name === only)
  if (!targets.length) { L.bad('没有名为「' + only + '」的 profile'); process.exit(1) }
} else if (all) {
  targets = profiles
} else if (marked.length) {
  targets = marked
} else {
  const w = profiles.filter((p) => p.name === 'web')
  targets = w.length ? w : [profiles[0]]
}
L.info('全部 profile：' + profiles.map((p) => p.name).join('、'))
L.ok('本次处理：' + targets.map((p) => p.name).join('、') + (only || all ? '' : '（默认只处理已有插件痕迹的）'))

// ── 3. 补齐四要素 ───────────────────────────────────────────
L.sec('3 / 写入装配')
const results = L.ensureAssembly(pi.dir, targets)
for (const r of results) {
  console.log('')
  console.log('   ' + L.DOT + ' profile「' + r.profile + '」')
  if (r.error) { L.bad('处理失败：' + r.error); exitCode = 1; continue }
  if (r.backup) L.info('已备份 → ' + r.backup.split(/[\\/]/).pop())
  if (r.changed.length) L.ok('已更新：' + r.changed.join(' + '))
  else L.ok('本来就是对的（无需改动）')
  if (r.junction === 'created') L.ok('已建立 node_modules 链接')
  else L.ok('node_modules 链接已正确')
}

// ── 4. 复查 ─────────────────────────────────────────────────
L.sec('4 / 复查')
let allGood = true
for (const p of targets) {
  let j
  try { j = L.readJson(p.pkgPath) } catch { allGood = false; continue }
  const a = typeof j.dependencies?.[L.PKG_NAME] === 'string' && j.dependencies[L.PKG_NAME].startsWith('link:')
  const b = (j.dsh?.profile?.bundles || []).includes(L.PKG_NAME)
  const c = !!L.junctionTarget(L.junctionPath(p.dir))
  const mark = '[' + p.name + '] 依赖 ' + (a ? '✅' : '❌') + '  bundles ' + (b ? '✅' : '❌') + '  链接 ' + (c ? '✅' : '❌')
  if (a && b && c) L.ok(mark); else { L.bad(mark); allGood = false }
}

console.log('')
console.log('='.repeat(58))
if (allGood && !exitCode) {
  console.log('  完成 ✅  装配已修好')
  console.log('')
  console.log('  ★ 现在重启 DSH，工具就会回来了。')
  console.log('    （重启后想确认再双击一次「体检.bat」）')
} else {
  console.log('  部分项目没修好，请把上面的红字发给我')
}
console.log('='.repeat(58))
console.log('')
process.exit(exitCode)
