/**
 * 研究状态追踪 —— 记录 AI 最近查过什么，用于在「建东西」时提醒它先扫现成实现。
 *
 * 动机：写在系统提示里的铁律，是会话创建时组装一次的，对话一长就被稀释
 * （铁律在最前、决策在最后）。工具返回值是每次动作之后都会看到的位置，
 * 把提醒放这里才拦得住 —— 这是「每句话前注入」在工程上能做到的等价物。
 *
 * 纯内存，进程重启即清空。这是刻意的：跨会话的旧记录没有参考价值，
 * 而且不能让上一次会话查过的东西给这一次背书。
 */

interface ResearchNote {
  at: number
  label: string
}

/** 多久之内算「刚刚查过」 */
const RECENT_MS = 15 * 60 * 1000
/** 最多留多少条，防内存无限涨 */
const MAX_NOTES = 60

const notes: ResearchNote[] = []

/**
 * 哪些检索算「扫过现成实现」。
 * 只认这几类，因为只有它们能回答「这件事是不是已经有现成做法了」：
 *   - howto:*            任务级入口，直接给必读文档与步骤
 *   - ref:cpr            CPR 通用特性 45 条 + 嵌入式宏
 *   - ref:optional       midi optional 加值
 *   - ref:conditions     激活条件全集（AC5E 那一类判定）
 *   - ref:trigger        反应触发 / 触发行动
 *   - ref:item-macro     物品宏（跨物品联动的现成做法）
 *   - ref:fx-anim        动画音效三件套
 *   - ref:activity-types 12 种活动（很多需求其实换个活动类型就够）
 *   - ref:midi-properties 29 键（automationOnly / triggeredActivityId 等现成开关）
 *   - kb:all / local / manuals / samples  全库检索与真实样本
 */
const IMPL_SCAN_RE =
  /^howto:|^ref:(?:cpr|optional|conditions|trigger|item-macro|fx-anim|activity-types|midi-properties|other-activity|enchant|daelink)|^kb:(?:all|local|manuals|samples)/

/** 记一条检索足迹（工具名 + 参数，如 howto:建角色卡 / ref:cpr / kb:all） */
export function noteResearch(label: string): void {
  const trimmed = String(label || '').trim()
  if (!trimmed) return
  notes.push({ at: Date.now(), label: trimmed })
  if (notes.length > MAX_NOTES) notes.splice(0, notes.length - MAX_NOTES)
}

/** 最近这段时间查过的、且与「现成实现」相关的足迹 */
function recentImplScans(): Array<{ label: string; minutesAgo: number }> {
  const now = Date.now()
  const out: Array<{ label: string; minutesAgo: number }> = []
  for (const n of notes) {
    const age = now - n.at
    if (age > RECENT_MS) continue
    if (!IMPL_SCAN_RE.test(n.label)) continue
    out.push({ label: n.label, minutesAgo: Math.floor(age / 60000) })
  }
  return out
}

/**
 * 生成给 AI 看的一句自检结论。放在创建类工具的返回值里。
 * 查过 → 报「已扫过」并列出足迹（让 AI 自己核对扫的是不是相关的）；
 * 没查过 → 报「没看到」并给两条最省事的查法。
 */
export function researchCheck(): string {
  const hits = recentImplScans()
  if (hits.length === 0) {
    const all = notes.filter((n) => Date.now() - n.at <= RECENT_MS).map((n) => n.label)
    const recent = all.length ? '（最近查过：' + all.slice(-4).join('、') + '，但都不是现成实现类）' : ''
    return (
      '⚠️ 没看到你扫过现成实现' + recent + ' —— 建之前先花一次调用确认【这事是不是已经有人做过了】：' +
      'foundry_howto{task:"<你在做什么>"}，或 foundry_reference{topic:"cpr"|"optional"|"conditions"|"trigger"|"item-macro"}。' +
      '★ 可能的来源远不止 CPR，按这个顺序过一遍：' +
      '① 官方 dnd5e 自己（活动类型 / 特性字段 / 规则动作 / enricher）｜' +
      '② midi-qol（flags / optional / OverTime / triggeredActivity / 物品宏）｜' +
      '③ DAE（AE changes / specialDuration / macro.execute / 条件表达式）｜' +
      '④ AC5E 激活条件 / Effect Macro 效果触发宏 / Aura Effects 光环 / Convenient Effects｜' +
      '⑤ CPR（45 条通用特性 + 575 个内置宏 + 内嵌法术）/ GPS / MISC —— 几百条预制自动化。' +
      '先 foundry_reference{topic:"cpr"} 看预制自动化的全貌，再判断有没有现成的，别重复造轮子。' +
      '若你已确认过没有现成的（例如刚查过但用的是别的方式），忽略本条即可。'
    )
  }
  const top = hits.slice(-4).map((h) => h.label + (h.minutesAgo > 0 ? '（' + h.minutesAgo + ' 分钟前）' : '（刚刚）'))
  return (
    '✅ 已扫过现成实现：' + top.join('、') + '。若这次要做的机制与上面扫的不是同一类，建议补一次检索。' +
    '⚠️ 【抗压缩提醒】上面只是「查过」的记录，具体内容在对话上下文里 —— ' +
    '如果你这一轮被压缩过、已经不记得查到了什么，别凭模糊印象写：' +
    '用 brief:true 重查一次（foundry_reference{topic:"cpr", brief:true} 只要 900 字符，全文是 1.4 万）。' +
    '真正不会丢的只有两样：foundry_knowledge{topic:"learned"}（坑表，存磁盘）与 foundry_howto 的步骤清单。' +
    '（重要结论用 foundry_learn 落盘 —— 那个压缩冲不掉，下个会话也读得到。）'
  )
}
