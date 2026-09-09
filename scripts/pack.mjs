#!/usr/bin/env node
/**
 * 一键打包发布资产（替代手敲 robocopy + Compress-Archive）。
 *
 * 产出（默认到 <repo>/dist/）：
 *   dsh-foundry-vtt-plugin-v<ver>.zip   纯插件（装配用，不含 node_modules）
 *   dsh-foundry-vtt-full-v<ver>.zip     全家桶（插件 + relay.exe 免编译 + mcp-server + docs + 教程）
 *
 * 用法：
 *   node scripts/pack.mjs                  # 打包两个 zip 到 repo/dist/
 *   node scripts/pack.mjs --out D:\tmp     # 指定输出目录
 *   node scripts/pack.mjs --skip-full      # 只打插件包（快，~1 秒）
 *
 * 排除规则：node_modules / .git / data / dist / *.db* / *.env（relay.exe 保留，它被 .gitignore 排除但要进发布包）。
 */
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ver = JSON.parse(readFileSync(join(repo, 'plugin', 'package.json'), 'utf8')).version

const argv = process.argv.slice(2)
const oi = argv.indexOf('--out')
const outDir = oi >= 0 && argv[oi + 1] ? resolve(process.cwd(), argv[oi + 1]) : join(repo, 'dist')
const skipFull = argv.includes('--skip-full')

const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'data', 'dist'])
const EXCLUDE_FILES = new Set(['.env', '.DS_Store', 'Thumbs.db'])
const isExcluded = (p) => {
  const base = p.split(/[\\/]/).pop()
  return (
    EXCLUDE_DIRS.has(base) ||
    EXCLUDE_FILES.has(base) ||
    /\.(db|db-shm|db-wal|env)$/i.test(base) ||
    /^verify-.*\.mjs$/.test(base)
  )
}

const mb = (f) => (statSync(f).size / 1048576).toFixed(2) + ' MB'
const zip = (fromDir, zipPath) => {
  rmSync(zipPath, { force: true })
  // Windows 自带 PowerShell；Compress-Archive 对 'dir\*' 打包目录内容（不含目录本身）。
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command',
      `Compress-Archive -Path '${join(fromDir, '*')}' -DestinationPath '${zipPath}' -Force`],
    { stdio: 'inherit' },
  )
  return zipPath
}

console.log(`=== 打包 v${ver} ===`)
console.log(`仓库：${repo}`)
console.log(`输出：${outDir}`)
// stage 必须放在仓库之外：全量打包要 cpSync(仓库, stage)，若 stage 在仓库内，
// Node 会以 ERR_FS_CP_EINVAL 拒绝（dest 是 src 的子目录）。
const stage = join(tmpdir(), `dsh-foundry-vtt-pack-${ver}`)
rmSync(stage, { recursive: true, force: true })
mkdirSync(stage, { recursive: true })

// ── 1. 插件包 ────────────────────────────────────────────────
const pStage = join(stage, 'plugin')
mkdirSync(pStage, { recursive: true })
cpSync(join(repo, 'plugin'), pStage, { recursive: true, filter: (s) => !isExcluded(s) })
const pZip = zip(pStage, join(outDir, `dsh-foundry-vtt-plugin-v${ver}.zip`))
console.log(`✅ 插件包：${pZip}（${mb(pZip)}）`)

// ── 2. 全家桶 ────────────────────────────────────────────────
if (skipFull) {
  console.log('（--skip-full：跳过全家桶）')
} else {
  const fStage = join(stage, 'full')
  mkdirSync(fStage, { recursive: true })
  cpSync(repo, fStage, { recursive: true, filter: (s) => !isExcluded(s) })
  const fZip = zip(fStage, join(outDir, `dsh-foundry-vtt-full-v${ver}.zip`))
  console.log(`✅ 全家桶：${fZip}（${mb(fZip)}）`)
}

rmSync(stage, { recursive: true, force: true })
console.log('\n下一步：gh release create v' + ver + ' <两个 zip> --notes-file <notes.md>（在仓库根目录跑）')
