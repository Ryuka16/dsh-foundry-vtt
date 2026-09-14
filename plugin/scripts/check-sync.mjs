#!/usr/bin/env node
/**
 * 发版前产物一致性校验：src ↔ lib ↔ release。
 *
 * 背景：v1.1.5 发布时只同步了部分 lib 产物，导致 release 里的
 * plugin/lib/knowledge.js 是旧构建产物（缺 DEFAULT_SAMPLE_DIR 导出），
 * 别人 dev_install_package 直接失败。此脚本用来在发版前拦下这种情况。
 *
 * 用法：
 *   node scripts/check-sync.mjs                                    # 只校验 src ↔ lib
 *   node scripts/check-sync.mjs --release <releasePluginDir>       # 额外校验 lib ↔ release
 *
 * 退出码：0 = 一致（可以发版）；1 = 不一致（禁止发版）。
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const problems = []
const notes = []

const argv = process.argv.slice(2)
const ri = argv.indexOf('--release')
const releaseDir = ri >= 0 && argv[ri + 1] ? resolve(process.cwd(), argv[ri + 1]) : null

const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 16)
const files = (d) => (existsSync(d) ? readdirSync(d).filter((f) => statSync(join(d, f)).isFile()) : [])

// ── 1. src/*.ts 必须都有对应 lib/*.js，且产物不比源码旧 ──────────────
const srcDir = join(root, 'src')
const libDir = join(root, 'lib')
const tsFiles = files(srcDir).filter((f) => f.endsWith('.ts'))
if (tsFiles.length === 0) problems.push(`找不到源码目录：${srcDir}`)
for (const f of tsFiles) {
  const out = join(libDir, f.replace(/\.ts$/, '.js'))
  if (!existsSync(out)) {
    problems.push(`lib 缺产物：src/${f} → lib/${basename(out)}`)
    continue
  }
  if (statSync(out).mtimeMs + 1500 < statSync(join(srcDir, f)).mtimeMs) {
    problems.push(`产物比源码旧（忘了重新编译）：src/${f} 比 lib/${basename(out)} 新`)
  }
}

// ── 2. src/knowledge-{docs,local,manuals}/ 必须全部同步到 lib/ 同名目录 ──
// 为什么三个都查：tsc 不拷贝 .md/.txt，而这三个目录都是运行时靠 import.meta.url 读的。
// 2026-09-15 的教训：原来只查 knowledge-docs，于是 knowledge-local 里改了没同步的那份
// 一直没人发现——运行时读到旧内容且不报任何错。一键修复：node scripts/sync-docs.mjs
const KB_DIRS = ['knowledge-docs', 'knowledge-local', 'knowledge-manuals']

/** 递归列文件（相对路径）——knowledge-local 下有子目录，不能只列顶层 */
const walkFiles = (d, base = d) => {
  if (!existsSync(d)) return []
  const out = []
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) out.push(...walkFiles(p, base))
    else if (e.isFile()) out.push(relative(base, p))
  }
  return out
}

for (const d of KB_DIRS) {
  const s = join(srcDir, d)
  const t = join(libDir, d)
  const srcList = walkFiles(s)
  if (srcList.length === 0) continue
  for (const rel of srcList) {
    const out = join(t, rel)
    if (!existsSync(out)) {
      problems.push(`lib 缺知识副本：src/${d}/${rel}（跑 node scripts/sync-docs.mjs 自动补齐）`)
      continue
    }
    if (sha(join(s, rel)) !== sha(out)) {
      problems.push(`知识副本内容不一致：${d}/${rel}（跑 node scripts/sync-docs.mjs）`)
    }
  }
  for (const rel of walkFiles(t)) {
    if (!existsSync(join(s, rel))) notes.push(`lib/${d}/${rel} 在 src 里没有对应源文件`)
  }
}

// ── 3. src/samples 与 lib/samples（若存在）───────────────────────────
const srcSamples = join(srcDir, 'samples')
if (existsSync(srcSamples) && !existsSync(join(libDir, 'samples'))) {
  problems.push('lib 缺 samples 目录（build 后要拷贝 src/samples → lib/samples）')
}

// ── 4. lib ↔ release 逐文件比对 ─────────────────────────────────────
if (releaseDir) {
  const relLib = join(releaseDir, 'lib')
  if (!existsSync(relLib)) {
    problems.push(`release 目录不对（没有 lib/）：${releaseDir}`)
  } else {
    const a = files(libDir)
    const b = files(relLib)
    for (const f of a) {
      const out = join(relLib, f)
      if (!existsSync(out)) {
        problems.push(`release 缺文件：lib/${f}（必须全量同步，不能只同步改过的）`)
        continue
      }
      if (sha(join(libDir, f)) !== sha(out)) {
        problems.push(`release 产物与 lib 不一致：lib/${f}（旧产物，必须覆盖）`)
      }
    }
    for (const f of b) {
      if (!existsSync(join(libDir, f))) notes.push(`release/lib/${f} 是多余残留（本机 lib 里没有）`)
    }
    // 知识副本（三个目录，含子目录）也要同步到 release
    for (const d of KB_DIRS) {
      for (const rel of walkFiles(join(libDir, d))) {
        const out = join(relLib, d, rel)
        if (!existsSync(out) || sha(out) !== sha(join(libDir, d, rel))) {
          problems.push(
            `release 知识副本缺失或过旧：lib/${d}/${rel}（跑 node scripts/sync-docs.mjs --release）`,
          )
        }
      }
    }
    // package.json 版本与 main 入口
    const relPkg = join(releaseDir, 'package.json')
    if (existsSync(relPkg)) {
      const pkg = JSON.parse(readFileSync(relPkg, 'utf8'))
      const localPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
      notes.push(`release 版本 ${pkg.version} / 本机版本 ${localPkg.version} / main=${pkg.main}`)
      if (!existsSync(join(releaseDir, String(pkg.main ?? '')))) {
        problems.push(`release package.json 的 main 指向的文件不存在：${pkg.main}`)
      }
    }
  }
}

// ── 输出 ─────────────────────────────────────────────────────────────
console.log('=== 发版产物一致性校验 ===')
console.log(`插件根目录：${root}`)
if (releaseDir) console.log(`release 目录：${releaseDir}`)
const kbCount = KB_DIRS.reduce((n, d) => n + walkFiles(join(srcDir, d)).length, 0)
console.log(`检查：${tsFiles.length} 个 TS 源 → lib，${kbCount} 个知识副本（${KB_DIRS.join(' / ')}）`)
for (const n of notes) console.log('  · 提示：' + n)
if (problems.length === 0) {
  console.log('\n✅ 一致，可以发版。')
  process.exit(0)
}
console.log(`\n❌ 发现 ${problems.length} 个问题（发版前必须清零）：`)
for (const p of problems) console.log('  ✗ ' + p)
console.log('\n修复：重新 tsc 编译 → 拷 .md → 全量同步 lib 到 release → 再跑本脚本。')
process.exit(1)
