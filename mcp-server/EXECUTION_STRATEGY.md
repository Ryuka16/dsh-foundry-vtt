# Execution Strategy — how to implement V1

Companion to [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) (the *what*) and the [V1 board](https://github.com/users/PhillypHenning/projects/4) (the *tickets*). This doc answers **how to run the build**: model/effort per task, what parallelizes, and the branching model.

## TL;DR
- **Default model = Sonnet 4.6** (medium effort) for routine tickets. **Opus 4.8** (high/xhigh) for: orchestration & PR review, the dnd5e schema **spike (#11)**, the **creature builder (#12)**, and the **`callRelay` core (#3)**. Haiku 4.5 optional for pure boilerplate.
- **Sequential foundation → parallel fan-out → sequential convergence.** Run the schema spike (#11) in parallel from the start.
- **Trunk-based: one short-lived branch per work-stream**, foundation merged first; parallel agents in git worktrees. *Not* one big branch, *not* per-phase.

---

## 1. Model & effort matrix

| Stage | Tickets | Model | Effort | Why |
|---|---|---|---|---|
| **Orchestrator / PR review** | — | **Opus 4.8** | high–xhigh | Owns the DAG, cross-cutting calls, reviews correctness-critical merges before they land on `main`. |
| Scaffold + config | #1, #2 | Sonnet 4.6 | low–medium | Mechanical, well-specified. |
| **Relay core** (`callRelay`, envelope, errors) | #3 | **Opus 4.8** | high | Everything depends on it; subtle (envelope variance, error/scope mapping). Get it right once. |
| Tool framework | #4 | Sonnet 4.6 | medium | Interface + registry; pre-stub all module imports here (see §3). |
| **dnd5e schema spike** | #11 | **Opus 4.8** | xhigh | Highest ambiguity: v5.2.2 vs 4.3.8 drift, the "activities" damage model, reverse-engineering from a live read. The linchpin for all creature value. |
| Read tools | #5, #6, #7 | Sonnet 4.6 | medium | Pattern-following once #3/#4 exist. |
| Write tools | #8, #9, #10 | Sonnet 4.6 | medium | Same pattern; #9 follows #8. |
| **Creature builder** | #12 | **Opus 4.8** | high | Deep nested-schema assembly; depends on the spike. |
| Folders | #13 | Sonnet 4.6 | low–medium | Small surface. |
| Hardening (annotations/gating) | #14 | Sonnet 4.6 | medium | Cross-cutting but mechanical. |
| Tests + packaging + docs | #15 | Sonnet 4.6 | medium–high | Breadth; correctness of mocked-fetch tests matters. |

Rule of thumb: **spend Opus where there is ambiguity or blast radius** (orchestration, the core, the schema). Everything pattern-shaped is Sonnet. Don't run the whole project on Opus — it's not where the marginal correctness is won, and the tickets are specified tightly enough for Sonnet.

---

## 2. Execution order — sequential vs parallel

Dependency DAG (waves; everything in a wave runs concurrently):

```
Wave 0   #1 scaffold ───────────────────────────────► (gate: nothing else starts)
Wave 1   #2 config ─► #3 callRelay ─┐   #4 registry/framework      #11 SPIKE (curl-only, START NOW)
                                     └── foundation merges to main ──► unblocks Wave 2
Wave 2   ║ #5 worlds ║ #6 search ║ #7→#8→#9 entity ║ #10 modify_actor ║ #13 folders ║   (all parallel)
Wave 2b  #12 creature  (needs #11 done + #8 merged)
Wave 3   #14 annotations + scope/system gating        (sequential — touches every tool)
Wave 4   #15 tests + packaging + README + Inspector    (sequential — whole-picture)
```

**What's strictly sequential**
- **Foundation (#1 → #2/#3 + #4).** The shared core. Best authored by **one agent** start-to-finish — tight coupling, and the contracts (`callRelay` signature, `ToolModule`, result helpers) are what every other stream codes against. Merge it to `main` before fanning out.
- **#9 after #8** (both live in `entity.ts`).
- **#12 after #11 + #8.**
- **#14 then #15** at the end — each needs all tools present.

**What parallelizes (the big win)**
- **#11 spike runs immediately**, alongside the foundation — it's curl + a live read + a markdown deliverable, no server code. Front-loading it kills the project's biggest unknown before any creature code is written.
- After foundation merges, **5 independent tool streams** run at once: `worlds`, `search`, `entity (7-9)`, `modify_actor`, `folders`. Each owns one file → near-zero conflicts.

**Why one agent should own the foundation rather than parallelizing #2/#3/#4:** they're small, interdependent, and define the interfaces everyone else consumes. Parallelizing them costs more in coordination than it saves.

---

## 3. Branching & integration

**Recommendation: trunk-based with one short-lived branch per work-stream.** Concretely:

| Branch | Tickets | Off | Merge gate |
|---|---|---|---|
| `feat/foundation` | #1–#4 | `main` | build + Inspector lists server → merge **first** |
| `chore/dnd5e-schema-spike` | #11 | `main` (independent) | schema doc committed; verified attack renders |
| `feat/tool-worlds` | #5 | `main` (post-foundation) | unit tests green + live `/clients` |
| `feat/tool-search` | #6 | ″ | tests + live search |
| `feat/tool-entity` | #7→#8→#9 | ″ | tests + create/get/update/delete round-trip |
| `feat/tool-actor` | #10 | ″ | tests + live modify |
| `feat/tool-folders` | #13 | ″ | tests + create-into-folder |
| `feat/creature` | #12 | `main` (after spike + entity) | Jabberwocky + Hagspawn son render correctly |
| `chore/harden` | #14 | `main` (after tools) | annotation tests; non-dnd5e gating |
| `chore/release` | #15 | `main` (last) | `npm test` green, Inspector full, README config works |

**Why not the alternatives**
- *One branch for the whole project*: serializes integration, produces one unreviewable mega-PR, and parallel agents would constantly conflict. Rejected.
- *Branch per phase*: phases contain **intra-phase parallel** tickets (e.g. Phase 2 = three independent tools), so a phase branch still has multiple agents fighting over it, and the branch lives too long. Stream-per-branch is strictly finer-grained and conflict-free.

**Conflict-elimination tricks (do these in the foundation):**
1. **Pre-stub the registry.** In `feat/foundation`, have `src/tools/registry.ts` import *all* planned module files, each a no-op stub. Every tool stream then only fills in its own file — the one shared file (`registry.ts`) is never edited again, so zero merge conflicts.
2. **One file per stream.** Split `modify_actor` into `src/tools/actor.ts` (not `entity.ts`) so #10 parallelizes cleanly against the entity stream.
3. **Add CI in the foundation.** `.github/workflows/ci.yml` running `npm ci && npm run build && npm test` on every PR gives the orchestrator an objective green/red merge signal.

**Parallel execution mechanics**
- Run each parallel stream as a subagent in its **own git worktree** (isolated working copy off the same repo) so concurrent agents don't collide on disk. In Claude Code: `Agent(..., isolation: "worktree")`; in a workflow: `agent(prompt, { isolation: "worktree" })`.
- Each stream agent: branch → implement its file(s) + unit tests → open PR. The **Opus reviewer/orchestrator** reviews, confirms CI green, merges to `main`.
- Keep streams rebased on `main` after the foundation merge (small, since files are disjoint).

---

## 4. Recommended run sequence (for the orchestrator)

1. **Prereq:** set a write-scoped `FOUNDRY_API_KEY` (`clients:read, search, entity:read, entity:write, structure:write`) — see [`README.md`](./README.md). Without it, Wave 2 write tickets can't pass acceptance.
2. **Kick off in parallel:** one Opus agent on `feat/foundation` (#1–#4, incl. registry stubs + CI), one Opus agent on `chore/dnd5e-schema-spike` (#11).
3. **Merge foundation.** Review (Opus), CI green, merge to `main`.
4. **Fan out** 5 Sonnet agents (worktrees) on the tool streams (#5, #6, #7-9, #10, #13). Merge each PR as it goes green.
5. **Creature builder** (Opus) on `feat/creature` once the spike + entity stream are merged.
6. **Converge:** Sonnet on `chore/harden` (#14), then `chore/release` (#15).
7. Move each board item Todo → In Progress → Done as it flows.

## 5. Risk controls
- **Spike first.** #11 is the only research-heavy unknown; doing it in Wave 1 means the creature schema is proven before #12 starts.
- **Live smoke gate.** Each write tool's PR should create-then-delete a throwaway entity against the live world (gated by `FOUNDRY_LIVE_TEST=1`) so "passes unit tests" can't mask a wrong request shape.
- **Review gate on `main`.** The relay core (#3) and creature builder (#12) get an explicit Opus review before merge — that's where a subtle bug is most expensive.
- **No silent scope failures.** The #3 error mapping must surface `403 lacks scope X` as an actionable message, so a mis-scoped key fails loud, not weird.
