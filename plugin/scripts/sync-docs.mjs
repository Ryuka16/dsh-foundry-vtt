#!/usr/bin/env node
/**
 * 知识库副本同步器（src → lib → release）。
 *
 * 存在的理由：`tsc` 只编译 .ts，**不会拷贝 .md/.txt 等非 TS 资源**；
 * 而 `knowledge-docs` / `knowledge-local` / `knowledge-manuals` 三个目录是
 * 运行时靠 `import.meta.url + dirname` 读的（见 src/knowledge.ts 的 BUILTIN_*_DIR）。
 * ⇒ 改完 src 里的文档不同步 lib，运行时读到的还是旧内容，**且不报任何错**。
 *
 * 2026-09-15 就是这么翻的车：`src/knowledge-local/FVTT-monster-spec-v2_1.md` 加了勘误，
 * lib 那份要靠手工编辑才生效，多改一处就多一处漂移。本脚本把这一步变成一条命令。
 *
 * 用法：
 *   node scripts/sync-docs.mjs                      # src → lib（本包）
 *   node scripts/sync-docs.mjs --check              # 只检查不写；有差异 exit 1
 *   node scripts/sync-docs.mjs --release            # 额外同步到 release 的 plugin/src 与 plugin/lib
 *   node scripts/sync-docs.mjs --release --check    # 发版前全量自检
 *   node scripts/sync-docs.mjs --release-dir <路径> # release 插件目录不在默认位置时指定
 *
 * 行为约定：
 *   · 只**新增/覆盖**，**从不删除**目标里多出来的文件——多余的只报告（删文件必须人工确认）。
 *   · 内容相同则跳过（不触碰 mtime），所以重复跑是幂等的。
 *   · 退出码：0 = 已同步/已一致；1 = --check 模式下发现差异，或目标目录不存在。
 */
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const PKG = resolve(here, '..')

/** 需要镜像的目录（相对 src/ 与各目标根，同名） */
const DIRS = ['knowledge-docs', 'knowledge-local', 'knowledge-manuals']

const argv = process.argv.slice(2)
const has = (n) => argv.includes(n)
const opt = (n) => {
  const i = argv.indexOf(n)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null
}

const CHECK = has('--check')
const WITH_RELEASE = has('--release') || has('--all')
const releasePlugin = resolve(
  opt('--release-dir') ?? join(PKG, '..', 'release', 'dsh-foundry-vtt', 'plugin'),
)

const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 12)

/** 递归列出相对路径（文件） */
function walk(dir, base = dir) {
  const out = []
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p, base))
    else if (e.isFile()) out.push(relative(base, p))
  }
  return out
}

const targets = [{ label: 'lib（本包）', root: join(PKG, 'lib') }]
if (WITH_RELEASE) {
  targets.push({ label: 'release / plugin/src', root: join(releasePlugin, 'src') })
  targets.push({ label: 'release / plugin/lib', root: join(releasePlugin, 'lib') })
}

console.log(`=== 知识库副本同步${CHECK ? '（--check 只查不写）' : ''} ===`)
console.log(`来源：${join(PKG, 'src')}\\{${DIRS.join(', ')}}`)

const problems = []
const notes = []
let nAdd = 0
let nUpd = 0
let nSame = 0
let nExtra = 0

for (const t of targets) {
  if (!existsSync(t.root)) {
    problems.push(`目标目录不存在：${t.root}`)
    continue
  }
  console.log(`\n── ${t.label}`)
  console.log(`   ${t.root}`)

  for (const d of DIRS) {
    const src = join(PKG, 'src', d)
    const dst = join(t.root, d)
    const srcFiles = walk(src)
    if (srcFiles.length === 0) {
      notes.push(`src/${d} 不存在或为空，跳过（${t.label}）`)
      continue
    }

    let add = 0
    let upd = 0
    let same = 0
    for (const rel of srcFiles) {
      const from = join(src, rel)
      const to = join(dst, rel)
      const exists = existsSync(to)
      if (exists && sha(from) === sha(to)) {
        same++
        continue
      }
      if (exists) upd++
      else add++
      if (!CHECK) {
        mkdirSync(dirname(to), { recursive: true })
        copyFileSync(from, to)
      }
    }

    // 目标里多出来的（源已无对应文件）——只报告，不删
    const extra = walk(dst).filter((rel) => !existsSync(join(src, rel)))
    if (extra.length) {
      nExtra += extra.length
      notes.push(
        `${t.label} ${d}/ 有 ${extra.length} 个源里没有的文件（未动）：${extra.slice(0, 4).join(', ')}${extra.length > 4 ? ' …' : ''}`,
      )
    }

    nAdd += add
    nUpd += upd
    nSame += same

    const verb = CHECK ? '待同步' : '已同步'
    const mark = add + upd === 0 ? '·' : CHECK ? '✗' : '✓'
    console.log(
      `   ${mark} ${d.padEnd(18)} 源 ${String(srcFiles.length).padStart(3)} 文件 ｜ ${verb} 新增 ${String(add).padStart(3)} / 更新 ${String(upd).padStart(3)} ｜ 已一致 ${String(same).padStart(3)}`,
    )
    if (CHECK && add + upd > 0) {
      problems.push(
        `${t.label} 的 ${d}/ 有 ${add + upd} 个文件需要同步（新增 ${add} / 更新 ${upd}）`,
      )
    }
  }
}

console.log('\n=== 汇总 ===')
console.log(
  `新增 ${nAdd} ｜ 更新 ${nUpd} ｜ 已一致 ${nSame} ｜ 目标多余（未删）${nExtra} ｜ 目标数 ${targets.length}`,
)
for (const n of notes) console.log('  · ' + n)

if (problems.length) {
  console.log(`\n❌ ${problems.length} 处需要处理：`)
  for (const p of problems) console.log('  ✗ ' + p)
  console.log('\n去掉 --check 再跑一次即可自动同步。')
  process.exit(1)
}

console.log(
  CHECK
    ? '\n✅ 三个知识目录在所有目标里都已一致。'
    : `\n✅ 同步完成（${CHECK ? '' : '可重复执行，幂等'}）。`,
)
process.exit(0)
