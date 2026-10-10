# Agents

## In short

| Aspect | Detail |
|--------|--------|
| **What** | A subagent: a Claude instance with its own context, tools, model and instructions |
| **Where** | `.claude/agents/<name>.md` (project) or `~/.claude/agents/` (personal) |
| **Why** | Isolate a task (the noise stays out of the conversation), restrict tools, pick a cheaper model |
| **What this page adds** | When to delegate, how to design an agent, the mistakes to avoid and examples from a real 11-agent pipeline |

---

## The essentials in 2 minutes

An agent is a **Markdown file**: a [frontmatter](/en/reference/glossary#frontmatter) (name, description, tools, model) followed by instructions. When Claude delegates a task to it, the agent starts in a **fresh context**, works with its own tools, and returns only a **summary** to the main conversation. Full example: [read-only reviewer](#reference-example-read-only-reviewer).

```
┌─────────────────────────────────────────┐
│               Main session              │
│                                         │
│  User ←→ Claude (conversation)          │
│                    │                    │
│               Agent tool                │
│                    │                    │
│       ┌────────────┼────────────┐       │
│       ▼            ▼            ▼       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Agent A   │ │Agent B   │ │Agent C   │ │
│  │Opus or   │ │Sonnet    │ │Haiku     │ │
│  │Fable     │ │          │ │          │ │
│  │Read, Grep│ │Read,Write│ │Read, Grep│ │
│  │Analysis  │ │Edit,Bash │ │Audit     │ │
│  │          │ │Implement.│ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│       │            │            │       │
│       ▼            ▼            ▼       │
│    Result       Result       Result     │
└─────────────────────────────────────────┘
```

Four facts change how you design an agent:

1. **It does not see the conversation.** It receives the delegation message, the CLAUDE.md files and the skills listed in `skills:`. An important instruction must be restated in the delegation.
2. **Only its summary comes back.** Ask for a short return format; several verbose agents quickly saturate the main context.
3. **It runs in the background by default** and its permission requests surface in the main session.
4. **Its `description` drives delegation**: it is what Claude reads to pick the agent.

→ How it all works (launching, nesting, resuming, forks, scopes, built-in agents, [permission modes](/en/reference/glossary#modes-de-permission), memory): [official documentation — Sub-agents](https://code.claude.com/docs/en/sub-agents) · all fields: [Sub-agents — frontmatter](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields).

---

## When to Use a Subagent?

| Situation | Recommendation |
|-----------|---------------|
| Voluminous output (tests, logs, docs) | **Subagent** — isolates noise from the main context |
| Tool restrictions / specific permissions | **Subagent** — tools limited to strict necessities |
| Autonomous task with summarizable result | **Subagent** — returns a concise summary (often 1,000 to 2,000 tokens according to [Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)) |
| Iterative exchanges, frequent back-and-forth | **Main conversation** — preserves shared context |
| Related phases (plan → impl → test) | **Main conversation** — avoids context loss |
| Quick, targeted change | **Main conversation** — no startup latency |
| Reusable workflow in main context | **[Skill](/en/concepts/skills)** — no isolation, same context |
| Sustained parallelism across sessions | **[Agent Teams](https://code.claude.com/docs/en/agent-teams)** — each worker has its own independent context |

---

## Designing your agents well

### Which Model to Choose?

Official guidance ([costs — Choose the right model](https://code.claude.com/docs/en/costs#choose-the-right-model)): Sonnet handles most coding tasks well and costs less than Opus; reserve Opus for complex architectural decisions and multi-step reasoning; for simple subagent tasks, specify `model: haiku`.

| Model | When | Examples |
|-------|------|----------|
| `sonnet` | **Default**: most coding tasks | Implementation, planning, review |
| `opus` | Complex architecture, multi-step reasoning | Reverse engineering undocumented code |
| `fable` | The hardest and longest-running tasks, autonomously ([Fable](https://code.claude.com/docs/en/model-config)); never the default, must be chosen explicitly | Large-scale analysis or migration |
| `haiku` | Simple, well-scoped tasks | File search, template-driven diagnostics |
| `inherit` / omitted | Follow the session's model (see [resolution order](https://code.claude.com/docs/en/sub-agents#choose-a-model)) | Generic agents |

Switching the session to Opus propagates to subagents that inherit the model: set `model` explicitly on agents whose cost must stay under control.

::: info Heuristic of this project
The modernisation project picks the model based on the nature of the task:

```
Does the task require UNDERSTANDING undocumented code?
├── YES → Opus    (reverse engineering, architecture deduction)
└── NO
    Does the task PRODUCE code or specifications?
    ├── YES → Sonnet (implementation, planning, review)
    └── NO
        Does the task follow a clear TEMPLATE?
        ├── YES → Haiku  (audit, diagnostics)
        └── NO  → Sonnet (default)
```

Then validate on a few real runs: move up one tier if quality falls short.
:::

### Writing a good description

Claude decides to delegate based on your request description and the agent's `description` field.

::: tip Proactive delegation
Including **"use proactively"** in an agent's description encourages Claude to use it automatically without waiting for an explicit request.

```yaml
description: Expert code reviewer. Use proactively after code changes.
```
:::

Descriptions are always loaded into context: keep them short and discriminating, and put the detail in the file body (loaded only when the agent runs). Beyond **15,000 tokens** of combined descriptions (built-ins excluded), Claude Code shows a startup warning ([sub-agents](https://code.claude.com/docs/en/sub-agents#understand-automatic-delegation)). For an agent shipped in a [plugin](/en/concepts/plugins), `claude plugin eval` measures delegation reliability across realistic prompts ([plugin evals](https://code.claude.com/docs/en/plugin-evals)).

### The project's actual configuration

::: info In our project
The 11 agents of the modernisation project, as configured in `.claude/agents/`:

| Agent | Model | `maxTurns` | `permissionMode` | Writes code? |
|-------|-------|-----------|------------------|--------------|
| `legacy-technical-analyzer` | opus | 100 | default | No (reports) |
| `legacy-feature-analyzer` | opus | 50 | default | No (spec) |
| `legacy-functional-analyzer` | sonnet | 50 | default | No (inventory) |
| `legacy-feature-analyzer-refiner` | sonnet | 35 | default | No (spec) |
| `legacy-functional-analyzer-auditor` | haiku | 35 | default | No (audit) |
| `backend-tasks-planner` | sonnet | 35 | default | No (plan) |
| `frontend-tasks-planner` | sonnet | 35 | default | No (plan) |
| `backend-tasks-executor` | sonnet | 60 | acceptEdits | **Yes** |
| `frontend-tasks-executor` | sonnet | 60 | acceptEdits | **Yes** |
| `conformity-reporter` | sonnet | 45 | default | No (report) |
| `health-check` | haiku | 50 | plan | No (read-only) |

What to read in it: **Opus only where undocumented code must be understood**, `acceptEdits` only for the two agents that write code, `plan` for the diagnostic agent, and a `maxTurns` sized to the volume of files.
:::

### Pitfalls to know

- **A misspelled field is silently ignored** (`maxturns` instead of `maxTurns`), and a file with no `name` or `description` is skipped. Check with `claude --debug`.
- **`skills:` preloads, it does not restrict**: without this field, the agent can still invoke skills through the `Skill` tool.
- **Explore and Plan do not load CLAUDE.md files** and cannot be resumed: for a task that must follow your conventions, use a custom agent.
- **No subagent has `AskUserQuestion`**, in the foreground or in the background: an agent that needs to ask the user a question stops and hands back with its question.
- **`permissionMode` is ignored** if the main session is in `bypassPermissions`, `acceptEdits` or `auto`.
- **A plan approved in [plan mode](/en/reference/glossary#plan-mode) is not passed to agents**: it stays in the conversation, which the agent does not see (fact #1). Write it into the spec or the delegation message.

Details and sources: [official documentation — Sub-agents](https://code.claude.com/docs/en/sub-agents).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001`: Catch-all agent {#warn-001 .warn-title}
*Origin: a principle of the official documentation (one responsibility per agent), applied to the project's 11 agents.*

An agent that does everything loses focus and costs more tokens.

::: danger Problem
```yaml
# ❌ BAD — Analysis + implementation + documentation
---
name: do-everything
description: Does everything
model: opus
---
```
Too many responsibilities in a single agent.
:::

::: info Solution
```yaml
# ✅ GOOD — Single responsibility
---
name: backend-tasks-executor
description: Backend Test First implementation
model: sonnet
---
```
Each agent has one clear responsibility.
:::

---

#### `WARN-002`: Too many tools {#warn-002 .warn-title}
*Origin: a project rule (the legacy is read-only), aligned with the official documentation.*

Giving an agent too many tools increases the risk of unexpected or destructive actions.

::: danger Problem
```yaml
# ❌ — Analysis agent with Edit (can modify the legacy)
tools: Read, Glob, Grep, Write, Edit, Bash
```
An analysis agent must never modify the analyzed source (`SOURCE_PROJECT`): `Edit` is useless.
:::

::: info Solution
```yaml
# ✅ — Legacy read-only, Write for its output
tools: Read, Glob, Grep, Write
```
Limiting tools prevents unexpected actions. `Write` remains legitimate to produce deliverables in the output directory (e.g. `SOURCE_TECHNICAL_DIR`), never in the legacy.
:::

::: info In our project
The real `legacy-technical-analyzer` agent ([example 1](#example-1-analysis-agent-opus-read-only-legacy-writes-its-output)) applies this WARN: `tools: Read, Glob, Grep, Write`, without `Edit` or `Bash`. The legacy is also protected by the [`deny` rule](/en/reference/glossary#regles-de-permission) `Edit(/php-legacy/**)` in `settings.json`, which also covers the Bash writes Claude Code recognizes (`>` redirections, `tee`, `sed -i`…) but not `cp`, `mv` or a script that opens files itself.
:::

---

#### `WARN-003`: Opus everywhere {#warn-003 .warn-title}
*Origin: experienced on this project (`legacy-functional-analyzer` moved back from Opus to Sonnet).*

Using Opus for every task multiplies costs with no quality gain on structured tasks.

::: danger Problem
```yaml
# ❌ EXPENSIVE — Opus for a template-driven audit or diagnostic
model: opus
```
Opus is significantly more expensive than Sonnet and Haiku, while structured tasks don't require deep reasoning (see the [official costs page](https://code.claude.com/docs/en/costs) and [Which model to choose](#which-model-to-choose)).
:::

::: info Solution
```yaml
# ✅ ECONOMICAL — Sonnet by default, Haiku for template-driven work
model: haiku
```
Haiku is much cheaper and faster for simple tasks; check quality on a few runs before generalizing. <span class="chez-nous">In our project</span> `legacy-functional-analyzer-auditor` and `health-check` run on Haiku.
:::

---

#### `WARN-004`: No checkpoint {#warn-004 .warn-title}
*Origin: the design of this project's pipeline (each step checks the previous step's output).*

Without verification between steps, a failure upstream causes downstream agents to run idle.

::: danger Problem
```text
# ❌ — The executor runs idle if analysis failed
Step 1: analyzer → Step 2: executor
```
Without a checkpoint, a failure propagates silently.
:::

::: info Solution
```text
# ✅ — Verification before continuing
Step 1: analyzer
Checkpoint: output/analysis.md exists?
Step 2: executor
```
The pipeline stops cleanly if a step fails.
:::

---

#### `WARN-005`: Parallel agents writing the same file {#warn-005 .warn-title}
*Origin: experienced on this project (13 `legacy-feature-analyzer` run in parallel).*

Launched in parallel, agents that all update a shared file (an index, a status file) overwrite each other and waste their turns starting over.

::: danger Problem
```text
13 × legacy-feature-analyzer in parallel
→ each one edits 0-index.md and 0-features-tree.json
→ "The file keeps being modified externally"
→ 11 statuses out of 13 not updated
```
:::

::: info Solution
```text
BATCH MODE in each agent's prompt:
→ each agent writes ONLY its own file (its spec)
→ the orchestrator updates the index ONCE, after all agents finish
```
Rule: **one file = one writer**. Shared files belong to the [orchestrator](/en/reference/glossary#orchestrateur). See the project skill `claude-code-parallel-agents`.
:::

---

#### `WARN-006`: Undersized `maxTurns` {#warn-006 .warn-title}
*Origin: experienced on this project (specs produced by `legacy-feature-analyzer`).*

An agent cut off by `maxTurns` does not crash: it returns **partial** output. Claude Code marks it as partial (v2.1.246 and later), but without a check it easily passes for a complete result.

::: danger Problem
```yaml
maxTurns: 30   # for an agent that must read ~15 files and produce a 14-section spec
```
Observed result: specs **30 to 50% shorter** than the reference, with no error message.
:::

::: info Solution
```yaml
maxTurns: 50   # project rule: files to read + files to write + 10 of margin
```
After a run, check whether the result is marked partial: `maxTurns` counts turns (round trips), not tool calls, and an agent that reaches it returns a truncated output, to be resumed with `SendMessage` rather than re-run.
:::

---

## Orchestration Patterns

Which pattern to choose? One question decides:

| Situation | Pattern |
|-----------|---------|
| The next task reads the output of the previous one | **Sequential** |
| Independent tasks, each writing its own file | **Parallel** |
| A task breaks down into sub-domains | **Hierarchical** (orchestrated from the [skill launcher](/en/reference/glossary#skill-launcher)) |
| The result must be checked before moving on | **[LLM-as-Judge](/en/reference/glossary#llm-as-judge)** |
| Dozens of items, or an orchestration to replay identically | **[Workflow](/en/concepts/which-mechanism#agent-or-workflow)** (script) |

<span class="chez-nous">In our project</span> the pipeline combines all of them: sequential analysis, parallel specs (BATCH MODE), sequential migration per feature, then LLM-as-Judge — details in the [Methodology](/en/guide/methodology).

::: danger Orchestration pitfalls
- **Parallelizing dependent tasks**: a frontend planner launched alongside the backend reads an incomplete `openapi.yaml`.
- **Orchestrator that also executes**: it mixes steering context with working context; the launcher only launches, checks checkpoints and chains steps.
- **LLM-as-Judge loop without a stop condition**: always set a maximum number of iterations (<span class="chez-nous">In our project</span> a single correction pass, then a V2 report).
:::

### Sequential

```
Analyzer ──► spec.md ──► Planner ──► analysis.md ──► Executor
```

Usage: migration pipeline (each step depends on the previous one).

### Parallel

```
           ┌── Feature Analyzer (feature A) ──┐
Inventory ─┤                                  ├──► specs/*.md
           └── Feature Analyzer (feature B) ──┘
```

Usage: `legacy-feature-analyzer` in BATCH MODE (step 4 of `/mod-analyze-legacy`). Backend and frontend planners stay sequential: the frontend builds on the `OPENAPI_SPEC` produced by the backend.

### Hierarchical

```
Skill Launcher (orchestrator, main conversation)
├── Analysis Agent (Opus)
├── Implementation Agent (Sonnet)
│   ├── Backend sub-task
│   └── Frontend sub-task
└── Conformity Agent (Sonnet)
```

::: info In our project
The **skill launcher** (main conversation) launches each agent: backend/frontend sub-tasks are sequential steps of the same agent. [Nesting](https://code.claude.com/docs/en/sub-agents#let-subagents-spawn-their-own-subagents) is possible (3 levels by default), but keeping orchestration at the launcher level makes the pipeline easier to read and resume, and avoids multiplying contexts.
:::

### LLM-as-Judge (fresh-context review)

```
Executor ──► output ──► Judge (subagent, fresh context) ──► gaps
                          │
                          └── blocking gap → fix → review again
```

A reviewer in a **fresh context** sees only the diff and the criteria you give it, not the reasoning that produced the change, so it judges the result on its own terms ([best practices — adversarial review](https://code.claude.com/docs/en/best-practices#add-an-adversarial-review-step)). For a correctness check of the current diff, the bundled `/code-review` skill already does this.

::: warning Avoid over-correction
A reviewer asked to find gaps will almost always report some, even when the work is sound; chasing every finding leads to over-engineering (abstractions, defensive code, tests for impossible cases). Tell it to **flag only what affects correctness or the stated requirements**, and treat the rest as optional.
:::

Also specify the **return format**: list of gaps with file/line, requirement concerned, severity (blocking / optional). Official prompt example:

```text
Use a subagent to review the rate limiter diff against PLAN.md. Check that
every requirement is implemented, the listed edge cases have tests, and
nothing outside the task's scope changed. Report gaps, not style preferences.
```

::: info This project's convention
`conformity-reporter` scores a feature's conformity; below **80/100**, a single correction pass is made, then a V2 report; if V2 stays below 80/100, the pipeline stops (human intervention). This threshold is a project choice, not an official recommendation.
:::

---

## Ready-to-use examples

### Reference example: read-only reviewer

Inspired by the official `code-reviewer` example ([sub-agents](https://code.claude.com/docs/en/sub-agents)): no `Write`/`Edit`, a scope instruction and an output format.

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

Run git diff and focus on the modified files.
Only flag what affects correctness, security or the requirements.
Output: prioritized list (blocking / should fix / suggestion), with file:line and a proposed fix.
```

Official `db-reader` variant: an agent with only `Bash`, plus a [hook](/en/reference/glossary#hook) `PreToolUse` in its frontmatter that rejects any write query ([sub-agents — conditional rules with hooks](https://code.claude.com/docs/en/sub-agents#conditional-rules-with-hooks)):

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/validate-readonly-query.sh'
---
```

```bash
#!/bin/bash
# .claude/hooks/validate-readonly-query.sh
COMMAND=$(jq -r '.tool_input.command // empty')
if grep -qiE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' <<< "$COMMAND"; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi
exit 0
```

::: info This project's convention
<span class="chez-nous">In our project</span> examples 1 to 3 are agents of the modernisation project: they read their paths (`SOURCE_PROJECT`, `SOURCE_TECHNICAL_DIR`…) from the PATHS section of the project's CLAUDE.md, which is not a Claude Code mechanism.
:::

### Example 1: Analysis agent (Opus, read-only legacy, writes its output)

```markdown
---
name: legacy-technical-analyzer
description: Complete reverse engineering of legacy (architecture,
  data flow, database, dependencies, deployment)
tools: Read, Glob, Grep, Write
model: opus
---

# Technical Analysis

Read paths from CLAUDE.md.

## Steps
1. Scan the SOURCE_PROJECT project structure
2. Analyze the flow: routes → controllers → models → DB
3. Document the database schema
4. Identify external dependencies
5. Produce a technical debt audit

## Output
7 files in SOURCE_TECHNICAL_DIR:
00-index, 01-overview, 02-data-flow, 03-database,
04-dependencies, 05-deployment, 06-audit
```

::: info Why Opus?
Understanding an entire codebase without documentation, deducing implicit architecture. Sonnet doesn't produce the same depth.
:::

The real agent has neither `Edit` nor `Bash`: see the box in [WARN-002](#warn-002).

### Example 2: Implementation agent (Sonnet, TDD)

```markdown
---
name: backend-tasks-executor
description: Backend Test First implementation via Docker
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - sym-api-conventions
  - sym-testing-conventions
---

# TDD Implementation

Before each task, read the skill reference:
- create-entity.md, create-dto.md, create-controller.md

## Process per task
1. Write the test → Red
2. Implement → Green
3. Refactor
4. `docker compose exec -T app php bin/phpunit 2>&1`
5. Mark "Processed" with date and test count
```

### Example 3: Diagnostic agent (Haiku, fast)

```markdown
---
name: health-check
description: Project coherence verification
tools: Read, Glob, Grep, Bash
model: haiku
---

Verify:
- [ ] CLAUDE.md paths exist
- [ ] Rules target valid globs
- [ ] Agents reference existing skills
- [ ] Docker responds
- [ ] OpenAPI spec valid (YAML)

Report: errors / warnings / OK
```

### Example 4: Test writer (Sonnet, generic)

An agent that **writes** code (hence `Write` and `Edit`) but has no `Bash`: it does not run the tests, the main conversation does that afterwards.

```markdown
---
name: test-writer
description: Writes the missing tests for existing code.
  Use after adding or changing a class that has no coverage.
tools: Read, Glob, Grep, Write, Edit
model: sonnet
---

For each target class, and each public method:
- a happy path, the edge cases, the error cases
- using the test framework and naming already present in the project
Do not change the code under test; report any bug found instead of fixing it.
```

---

## Before going live

### Design

- [ ] Single responsibility per agent
- [ ] Appropriate model ([Sonnet by default, Opus for complex, Haiku for simple](#which-model-to-choose))
- [ ] Tools limited to strict necessities
- [ ] `disallowedTools` if specific tools need to be excluded

### Description & delegation

- [ ] Short, specific description — Claude uses it to decide when to delegate (see [Writing a good description](#writing-a-good-description))
- [ ] Return format requested: short, structured summary
- [ ] `"Use proactively"` in description if automatic delegation desired
- [ ] Skills listed explicitly (no inheritance from parent conversation)
- [ ] Key instructions and approved plan written in the delegation message or the spec (the agent does not see the conversation)

### Execution

- [ ] Checkpoints between sequential steps
- [ ] Result reviewed by a fresh-context subagent, limited to correctness and requirements
- [ ] `maxTurns` ≥ files to read + files to write + 10, checked on a real run; at the limit, the output is marked partial (resumable)
- [ ] `permissionMode` appropriate (`plan` for read-only, `dontAsk` for CI, `auto` if auto mode is available)

### Maintenance

- [ ] File versioned in `.claude/agents/` (team sharing)
- [ ] Explicit names; <span class="chez-nous">In our project</span> domain prefix + role (`legacy-…`, `backend-tasks-…`, `frontend-tasks-…`)
- [ ] Output files documented in the prompt
- [ ] `memory: project` (or `user`) if cross-session learning desired
- [ ] Agents launched in parallel: a single writer per file; shared files updated by the orchestrator

---

## Going further

- [Parallelism and sequence](/en/examples/pipeline#parallelism-and-sequence) — drive agents that run while you work
- [Workflows](/en/concepts/which-mechanism#agent-or-workflow) — orchestrate dozens of agents with a deterministic script
- [Model configuration](https://code.claude.com/docs/en/model-config) — choosing model and effort (official docs)
- <span class="chez-nous">In our project</span> skill `claude-code-parallel-agents` — the complete method for running agents in parallel
- [Official Documentation — Sub-agents](https://code.claude.com/docs/en/sub-agents)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
