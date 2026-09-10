#!/usr/bin/env node
/**
 * relay 开机自启 — 让 relay 不再依赖 DSH：DSH 挂了，relay 照样在跑，FVTT 那侧不受影响。
 *
 * 用法：
 *   node tools/relay-autostart.mjs status      # 看当前状态
 *   node tools/relay-autostart.mjs install     # 装到「启动」文件夹（登录时自动跑）
 *   node tools/relay-autostart.mjs uninstall   # 卸载
 *
 * 实现：在 %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ 放一个 DSH-Foundry-Relay.bat，
 *      内容是 start /min 调用 relay 的启动脚本（最小化运行，不占屏幕）。
 */
import { existsSync, writeFileSync, unlinkSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as L from './_lib.mjs'

const action = (process.argv[2] || 'status').toLowerCase()
const STARTUP = join(process.env.APPDATA || join(process.env.USERPROFILE || '', 'AppData', 'Roaming'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')
const LN = join(STARTUP, 'DSH-Foundry-Relay.bat')

/** 找 relay 的启动脚本：本包 relay/start-relay.bat > 配置里 relayExePath 同级 > 常见位置 */
function findLauncher() {
  const cands = []
  cands.push(join(L.BUNDLE_RELAY_DIR, 'start-relay.bat'))
  cands.push(join(L.BUNDLE_RELAY_DIR, 'start-relay.ps1'))
  const cfg = L.readConfig()
  if (cfg.exists && !cfg.error && cfg.data.relayExePath) {
    const dir = join(cfg.data.relayExePath, '..')
    cands.push(join(dir, 'start-relay.bat'))
    cands.push(join(dir, 'start-relay.ps1'))
  }
  for (const c of cands) if (existsSync(c)) return c
  return null
}

L.head('relay 开机自启')
console.log('   时间：' + new Date().toLocaleString('zh-CN'))
L.info('启动文件夹：' + STARTUP)

const proc = L.relayProcess()
L.sec('当前状态')
if (proc) L.ok('relay.exe 正在运行（PID ' + proc.pid + '）')
else L.warn('relay.exe 当前没在运行')
if (existsSync(LN)) {
  L.ok('开机自启：已安装')
  L.info('文件：' + LN)
  try { L.info('内容：' + readFileSync(LN, 'utf8').split(/\r?\n/).filter((s) => s.trim() && !/^@echo/.test(s)).join(' | ')) } catch { /* 忽略 */ }
} else {
  L.info('开机自启：未安装')
}

if (action === 'status') {
  console.log('')
  console.log('  可选操作：install（安装自启） / uninstall（卸载）')
  console.log('')
  process.exit(0)
}

if (action === 'install') {
  L.sec('安装')
  if (!existsSync(STARTUP)) { L.bad('找不到启动文件夹：' + STARTUP); process.exit(1) }
  const launcher = findLauncher()
  if (!launcher) {
    L.bad('找不到 relay 的启动脚本（start-relay.bat / start-relay.ps1）')
    L.info('预期在本包的 relay\\ 目录下；如果你的 relay 装在别处，把本包 relay\\start-relay.bat 一起放过去再试。')
    process.exit(1)
  }
  L.ok('启动脚本：' + launcher)
  // .bat 内容必须用 CRLF，否则 cmd 会拆行报错
  const body = [
    '@echo off',
    'rem DSH-Foundry-VTT relay autostart (managed by relay-autostart.mjs)',
    'if exist "' + launcher + '" start "" /min "' + launcher + '"',
    '',
  ].join('\r\n')
  try {
    writeFileSync(LN, body, 'utf8')
    L.ok('已写入自启文件 → ' + LN)
  } catch (e) {
    L.bad('写入失败：' + String(e?.message || e))
    process.exit(1)
  }
  console.log('')
  console.log('='.repeat(58))
  console.log('  完成 ✅  下次登录 Windows 时 relay 会自动启动（最小化）')
  console.log('  想立刻生效：直接双击 relay 目录里的 start-relay.bat')
  console.log('  不想要了：跑 node tools/relay-autostart.mjs uninstall')
  console.log('='.repeat(58))
  console.log('')
  process.exit(0)
}

if (action === 'uninstall') {
  L.sec('卸载')
  if (!existsSync(LN)) { L.ok('本来就没装，无需卸载') }
  else {
    try { unlinkSync(LN); L.ok('已删除自启文件') } catch (e) { L.bad('删除失败：' + String(e?.message || e)); process.exit(1) }
  }
  console.log('')
  console.log('  （relay 进程本身不受影响；DSH 插件启动时也仍会自动拉起 relay）')
  console.log('')
  process.exit(0)
}

L.bad('未知操作：' + action + '（可用：status / install / uninstall）')
process.exit(1)
