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
import { basename, dirname, join, resolve } from 'node:path'
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

// ── 2. src/knowledge-docs/*.md 必须同步到 lib/knowledge-docs/ ────────
const srcDocs = join(srcDir, 'knowledge-docs')
const libDocs = join(libDir, 'knowledge-docs')
for (const f of files(srcDocs).filter((f) => f.endsWith('.md'))) {
  const out = join(libDocs, f)
  if (!existsSync(out)) {
    problems.push(`lib 缺知识文档：src/knowledge-docs/${f} → lib/knowledge-docs/${f}（build 后要拷贝 .md）`)
    continue
  }
  if (sha(join(srcDocs, f)) !== sha(out)) problems.push(`知识文档内容不一致：${f}（重新拷贝）`)
}
for (const f of files(libDocs)) {
  if (!existsSync(join(srcDocs, f))) notes.push(`lib/knowledge-docs/${f} 在 src 里没有对应源文件`)
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
    // 知识文档 + 样本也要同步
    for (const f of files(libDocs)) {
      const out = join(relLib, 'knowledge-docs', f)
      if (!existsSync(out) || sha(out) !== sha(join(libDocs, f))) {
        problems.push(`release 知识文档缺失或过旧：lib/knowledge-docs/${f}`)
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
console.log(`检查：${tsFiles.length} 个 TS 源 → lib，${files(srcDocs).filter((f) => f.endsWith('.md')).length} 篇知识文档`)
for (const n of notes) console.log('  · 提示：' + n)
if (problems.length === 0) {
  console.log('\n✅ 一致，可以发版。')
  process.exit(0)
}
console.log(`\n❌ 发现 ${problems.length} 个问题（发版前必须清零）：`)
for (const p of problems) console.log('  ✗ ' + p)
console.log('\n修复：重新 tsc 编译 → 拷 .md → 全量同步 lib 到 release → 再跑本脚本。')
process.exit(1)
