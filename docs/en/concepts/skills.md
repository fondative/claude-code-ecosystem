# Skills

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Reusable knowledge and workflow modules in `SKILL.md` format |
| **Where** | `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/` (personal) |
| **Types** | *Reference* content (conventions) or *task* content (`/name` workflow) — called [Passive](/en/reference/glossary#skill-passive) / [Launcher](/en/reference/glossary#skill-launcher) in this project |
| **Standard** | [Agent Skills](https://agentskills.io) — 40+ compatible tools (Cursor, VS Code, Gemini CLI...) |
| **Ideal size** | < 500 lines for SKILL.md, details in `references/` |
| **What this page adds** | Which kind of skill to choose, how to write it so it triggers, the mistakes to avoid and the modernization project's 12 real skills |

---

## The essentials in 2 minutes

A skill is a **folder** whose entry point is `SKILL.md`: a [frontmatter](/en/reference/glossary#frontmatter) (name, description, invocation settings) followed by instructions, with optional support files (`references/`, `scripts/`). Claude permanently keeps only **its name and description**; it loads the full `SKILL.md` when the skill is invoked (by `/name` or because the description matches the request), and the `references/` files only when it needs them.

```
┌─────────────────────────────────────────────────────────┐
│                     SKILL ECOSYSTEM                     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Passive     │  │ Launcher    │  │ Standard        │  │
│  │             │  │             │  │                 │  │
│  │ Conventions │  │ Workflows   │  │ Both modes      │  │
│  │ auto-loaded │  │ run by /name│  │ auto + /name    │  │
│  │             │  │             │  │                 │  │
│  │ e.g.        │  │ e.g.        │  │ e.g.            │  │
│  │ sym-api-    │  │ /deploy,    │  │ /explain-code   │  │
│  │ conventions │  │ /migrate    │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  Supporting files                 │  │
│  │    references/, scripts/, templates/, examples/   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

```markdown
---
name: sym-api-conventions
description: The project's Symfony 7.4 backend conventions. Use for any work
  on the backend REST API.
user-invocable: false
---
Controller → Service → Repository → Entity. UUID for all primary keys.
Create an entity → [create-entity.md](references/create-entity.md)
```

::: info This project's convention: Passive / Launcher
The official documentation distinguishes two kinds of content: **reference** content (conventions, patterns, domain knowledge applied to the current work) and **task** content (step-by-step instructions for an action, often invoked with `/name` and `disable-model-invocation: true`). "Passive" and "Launcher" are the names **this project** gives to these two kinds; "Standard" means a skill left with the default settings. Source: [Skills — Types of skill content](https://code.claude.com/docs/en/skills).
:::

Four facts change the way you design a skill:

1. **Its `description` decides automatic triggering.** It is the only text Claude sees before loading the skill: without precise keywords, a passive skill never triggers.
2. **The whole `SKILL.md` loads on every invocation**, `references/` only on demand: details go in `references/`, not in `SKILL.md`.
3. **After [compaction](/en/reference/glossary#compaction), only the first 5,000 tokens** of each skill are re-attached: important instructions go at the top of the file.
4. **`allowed-tools` pre-approves, it does not restrict**: the other tools stay usable according to your permissions. To remove a tool, use `disallowed-tools` or a [`deny` rule](/en/reference/glossary#regles-de-permission).

→ How it all works (lifecycle, structure, scopes, listing budget, bundled skills, access control, troubleshooting): [official documentation — Skills](https://code.claude.com/docs/en/skills) · all fields and variables: [Skills — frontmatter](https://code.claude.com/docs/en/skills#frontmatter-reference).

---

## Which Type to Choose?

### Skill vs Rule vs Agent

| Need | Component | Why |
|------|-----------|-----|
| Code conventions (style, architecture, naming) | **Passive skill** | Loaded automatically, supports references |
| Short contextual reminder (< 30 lines, recommended guideline) | **[Rule](/en/concepts/rules)** | Lighter, injection by [glob](/en/reference/glossary#glob) |
| Multi-step workflow (migration, deploy) | **Launcher skill** | Orchestrates [agents](/en/concepts/agents), invocable by `/name` |
| Atomic task execution | **[Agent](/en/concepts/agents)** | Isolated context, dedicated model |
| One-off action (commit, test) | **[Command](/en/concepts/commands)** or launcher skill | Commands still work, skills recommended |

### Passive vs Launcher

```
Does the skill contain EXECUTION INSTRUCTIONS?
│
├── YES (deploy, migrate, commit...)
│   └── LAUNCHER (disable-model-invocation: true)
│       Reason: we want to control WHEN it launches
│
└── NO (conventions, patterns, business context...)
    └── PASSIVE (user-invocable: false)
        Reason: Claude must know this AUTOMATICALLY
```

### Visibility Matrix

| Configuration | User sees `/name` | Claude auto-loads | Use case |
|---------------|-------------------|-------------------|----------|
| (default) | Yes | Yes | Versatile skill |
| `disable-model-invocation: true` | Yes | No | Deployment, commit, risky actions |
| `user-invocable: false` | No | Yes | Conventions, business context |

::: warning Skill called by a pipeline
A skill launched by another skill must **not** have `disable-model-invocation: true`: Claude could no longer invoke it from the pipeline. <span class="chez-nous">In our project</span> `mod-generate-visualization` is called by `mod-analyze-legacy`, `mod-generate-docs` by `mod-migrate-feature`.
:::

### Skill in a subagent or subagent with skills?

Two directions for combining skills and agents:

| Approach | System prompt | Task | Also loads |
|----------|--------------|------|-----------|
| Skill with `context: fork` | From the agent type (`Explore`, `Plan`...) | SKILL.md content | CLAUDE.md, except with `Explore` and `Plan`, which do not load it |
| [Subagent](/en/concepts/agents) with `skills:` | Markdown body of the subagent | Claude's delegation message | Preloaded skills + CLAUDE.md |

With `context: fork`, **you** write the task in the skill and choose an agent to execute it. With a subagent that declares `skills:`, **the agent** controls the prompt and uses skills as reference context: it receives their **full** content at startup, not just the description.

---

## Designing your skills well

### Organization by Prefix

Claude Code only discovers skills at the first level (`.claude/skills/<name>/SKILL.md`): namespace subfolders are not loaded. Grouping is therefore done with a **prefix** in the folder name. <span class="chez-nous">In our project</span> the `sym-`, `front-`, `mod-`, `claude-code-` prefixes are a project convention, not a Claude Code rule.

### Visual Output Pattern

A skill can bundle scripts that generate interactive HTML files (trees, graphs, dashboards). The script lives in `scripts/`, the skill invokes it via Bash, and the result is a standalone HTML file openable in the browser.

### The project's actual configuration

::: info In our project
The modernization project's 12 skills, as configured in `.claude/skills/`:

| Skill | Type | Invocation setting | `SKILL.md` lines | `references/` files | Preloaded by |
|-------|------|--------------------|------------------|---------------------|--------------|
| `sym-api-conventions` | Passive | `user-invocable: false` | 133 | 15 | `backend-tasks-*`, `conformity-reporter` |
| `sym-testing-conventions` | Passive | `user-invocable: false` | 133 | 3 | `backend-tasks-*`, `conformity-reporter` |
| `front-app-conventions` | Passive | `user-invocable: false` | 169 | 9 | `frontend-tasks-*`, `conformity-reporter` |
| `front-testing-conventions` | Passive | `user-invocable: false` | 204 | 3 | `frontend-tasks-*`, `conformity-reporter` |
| `front-design-conventions` | Passive | `user-invocable: false` | 95 | 0 | `frontend-tasks-*` |
| `mod-conformity-conventions` | Passive | `user-invocable: false` | 143 | 4 | `conformity-reporter` |
| `mod-analyze-legacy` | Launcher | `disable-model-invocation: true` | 117 | 0 | — |
| `mod-migrate-feature` | Launcher | `disable-model-invocation: true` + `argument-hint` | 249 | 0 | — |
| `claude-code-skill-command-model` | Standard | (default) + `argument-hint` | 127 | 3 | — |
| `mod-generate-visualization` | Standard | (default) | 121 | 1 | — |
| `mod-generate-docs` | Standard | (default) | 200 | 14 | — |
| `claude-code-parallel-agents` | Standard | (default) | 164 | 0 | — |

What to read in it: **no `SKILL.md` exceeds 250 lines**, the volume lives in 52 `references/` files; conventions are **preloaded** into agents through `skills:` rather than written into their prompt (see [WARN-006](#warn-006)); the two skills called by a pipeline (`mod-generate-visualization`, `mod-generate-docs`) keep the default setting so that Claude can invoke them.
:::

### Pitfalls to know

- **`allowed-tools` is not a restriction**: see fact 4 in [The essentials in 2 minutes](#the-essentials-in-2-minutes).
- **`user-invocable: false` only hides the `/` menu entry**: Claude can still invoke the skill. Only `disable-model-invocation: true` prevents that, and it also prevents **preloading it into a subagent** and running it from a **scheduled task**.
- **A grouping subfolder is not discovered** (`.claude/skills/backend/api/SKILL.md`): group by prefix.
- **Malformed YAML is silent**: the skill loads without metadata, `/name` still works but automatic triggering no longer does. Check with `claude --debug`.
- **Too many skills = descriptions dropped without a message**: see [WARN-005](#warn-005).
- **A skill named like a bundled skill replaces it**, but not its alias (`code-review` replaces `/code-review`, not `/review`).
- **`name` and `description` are required by the [Agent Skills standard](https://agentskills.io/specification)** but optional in Claude Code (inferred from the folder and the first line): always fill them in so a skill stays portable to other tools.

Details and sources: [official documentation — Skills](https://code.claude.com/docs/en/skills).

### Evaluating a skill

Test a skill like code: check that it **changes** Claude's behavior, and in the right direction. Approach recommended by Anthropic ([Evaluation and iteration](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#evaluation-and-iteration)):

1. **Scenarios first**: run Claude without the skill on representative tasks, note the failures, and turn them into at least **three test scenarios**.
2. **Baseline without the skill**: run each prompt in a **fresh session** with the skill, then with the skill turned off (`"off"` in `skillOverrides`), and compare. A fresh session prevents leftover authoring context from masking gaps in the instructions ([Skills](https://code.claude.com/docs/en/skills)).
3. **Minimal instructions**: write just enough to pass the scenarios, then iterate.
4. **Several models**: test with every model you target (Haiku: enough guidance? Opus: not over-explained?).

::: tip Automate with the `skill-creator` plugin
`/plugin install skill-creator@claude-plugins-official` adds test cases (`evals/evals.json`), isolated runs per subagent, grading, a **with / without skill** benchmark, A/B comparison of two versions, and description tuning (prompts that should / should not trigger). For a plugin skill, run the baseline with `claude plugin eval`.
:::

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### ⚠️ `WARN-001`: Skill too long {#warn-001}

*Origin: official documentation (500-line rule), applied to the project's 12 skills.*

Beyond 500 lines, `SKILL.md` saturates the context on every invocation — even for parts that are not relevant.

::: danger Problem
```markdown
<!-- ❌ BAD — 2000 lines in SKILL.md -->
---
name: sym-api-conventions
---
## Architecture (200 lines...)
## Entities (300 lines...)
## DTOs (400 lines...)
```
2000 lines loaded in full every time, even when only the architecture section is needed.
:::

::: info Solution
```markdown
<!-- ✅ GOOD — Short SKILL.md + references -->
---
name: sym-api-conventions
---
## Architecture
Controller → Service → Repository → Entity
## See details
- [create-entity.md](references/create-entity.md)
- [create-dto.md](references/create-dto.md)
```
Claude loads reference files on demand, only when the context requires it.
:::

---

#### ⚠️ `WARN-002`: Vague or missing description {#warn-002}

*Origin: official documentation (Skill authoring best practices).*

Claude uses the `description` to automatically decide when to load a passive skill — without a precise description, the skill is never triggered.

::: danger Problem
```yaml
# ❌ BAD — Claude doesn't know when to load
---
name: helper
---
```
Without a description, Claude cannot associate the skill with any usage context.
:::

::: info Solution
```yaml
# ✅ GOOD — What the skill does + when to use it, in third person
---
name: sym-api-conventions
description: Provides the Symfony backend conventions (REST architecture,
  DTOs, repositories with filtering, exception handling). Use when creating
  or modifying code in the backend REST API.
---
```
The description is injected into the system prompt: Anthropic recommends stating **what** the skill does **and when** to use it ("Use when…"), with precise keywords, **in third person** ("Generates…", not "I can…" or "You can…"). Source: [Skill authoring best practices — Writing effective descriptions](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#writing-effective-descriptions).
:::

---

#### ⚠️ `WARN-003`: Launcher without protection {#warn-003}

*Origin: official documentation; a project rule (`mod-analyze-legacy` and `mod-migrate-feature` use `disable-model-invocation: true`).*

Without `disable-model-invocation: true`, Claude can trigger a launcher skill autonomously — including actions with side effects.

::: danger Problem
```yaml
# ❌ DANGEROUS — Claude can deploy on its own
---
name: deploy
description: Deploys the application to production
---
```
Claude can decide to deploy because "the code looks ready", without any human action.
:::

::: info Solution
```yaml
# ✅ SECURE — Human control mandatory
---
name: deploy
description: Deploys the application to production
disable-model-invocation: true
---
```
With `disable-model-invocation: true`, the skill can only be invoked explicitly by the user.
:::

---

#### ⚠️ `WARN-004`: Skill / [rule](/en/concepts/rules) duplication {#warn-004}

*Origin: a project rule (the `symfony-api` and `frontend` rules point to the skills instead of copying the conventions).*

Maintaining the same content in both a [rule](/en/concepts/rules) and a skill creates two sources of truth that diverge during updates.

::: danger Problem
```text
# ❌ BAD — Same content in 2 places
rules/backend.md                    → UUID, Docker commands...
skills/sym-api-conventions/SKILL.md → UUID, Docker commands...
```
An update in one is not reflected in the other — desynchronization is guaranteed.
:::

::: info Solution
```text
# ✅ GOOD — The rule delegates, the skill details
rules/backend.md                    → "Load the skill sym-api-conventions. Reminders: Docker, TDD."
skills/sym-api-conventions/SKILL.md → (full detail)
```
The rule points to the skill. One single place to maintain for detailed content.
:::

---

#### ⚠️ `WARN-005`: Context budget exceeded {#warn-005}

*Origin: official documentation.*

Claude Code loads the list of skill names and descriptions within a budget of about 1% of the context window. When the list overflows, it drops the descriptions of the least used skills: their names stay listed, but without the keywords Claude needs to trigger them automatically.

::: danger Problem
A passive skill stops triggering, and no message appears in the session: the warning only goes to the debug log (`claude --debug`).
:::

::: info Solution
`/doctor` estimates the listing's cost and its biggest contributors; `/skill-doctor` identifies skills to turn off. Then: shorten descriptions (main use case first), set low-priority skills to `"name-only"` in `skillOverrides`, or raise the budget with `skillListingBudgetFraction`. See [Skill descriptions are cut short](https://code.claude.com/docs/en/skills#skill-descriptions-are-cut-short).
:::

---

#### ⚠️ `WARN-006`: Conventions written in an agent's prompt {#warn-006}

*Origin: experienced on this project ([Methodology — Phase 0](/en/guide/methodology#phase-0-build-the-infrastructure)).*

Conventions copied into an agent's body are poorly followed, and must be maintained in every agent that needs them.

::: danger Problem
```markdown
<!-- ❌ — Conventions buried in the agent's prompt -->
---
name: backend-tasks-executor
---
Use UUIDs, DTOs, PSR-12, the Controller → Service pattern...
(+ 200 lines of conventions, also copied into the planner)
```
What the project found: agents ignored these conventions.
:::

::: info Solution
```markdown
<!-- ✅ — Conventions in a skill, preloaded by the agents -->
---
name: backend-tasks-executor
skills:
  - sym-api-conventions      # short SKILL.md + 15 references/
  - sym-testing-conventions
---
Before each task, read the matching skill reference.
```
A single source for conventions, shared by every agent that declares it in `skills:`.
:::

---

## Ready-to-use examples

### Example 1: Passive skill — API Conventions

<span class="chez-nous">In our project</span> simplified version of the real `sym-api-conventions` skill.

```markdown
---
name: sym-api-conventions
description: Provides the project's Symfony 7.4 backend conventions
  (architecture, patterns, standards). Use for any work on the backend
  REST API.
user-invocable: false
---

# Symfony API Conventions

## Architecture
Controller → Service → Repository → Entity

## Project specifics
- UUID for all primary keys
- All commands via Docker:
  `docker compose exec -T app [cmd] 2>&1`

## Detailed references
- Create an entity → [create-entity.md](references/create-entity.md)
- Create a DTO → [create-dto.md](references/create-dto.md)
- Create a controller → [create-controller.md](references/create-controller.md)
```

**15 reference files** cover each pattern in detail.

::: tip Only write what Claude doesn't know
PSR-12 or "camelCase for methods" are standard conventions Claude already knows: repeating them costs tokens on every invocation without changing anything. Keep what is specific to the project (UUID, Docker). Source: [Concise is key](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#concise-is-key) — "Only add context Claude doesn't already have".
:::

::: info Why passive?
Conventions are not an action. Claude needs to know them when working on the backend, not on user request: with `user-invocable: false`, `sym-api-conventions` does not appear in the `/` menu.
:::

### Example 2: Launcher skill — E2E Migration

<span class="chez-nous">In our project</span> simplified version of the real `mod-migrate-feature` skill.

::: details See the full SKILL.md
```markdown
---
name: mod-migrate-feature
description: Migrates a legacy feature end to end to the modern stack
  (specs, planning, TDD implementation, conformity).
disable-model-invocation: true
argument-hint: "[nom-feature]"
---

# Migration of $ARGUMENTS

## Step 0: Prerequisites
Verify that BACKEND_TARGET and FRONTEND_TARGET exist.
Otherwise: STOP, suggest `/dev:install-stack backend|frontend`.

## Step 1: Detailed specification
Run the `legacy-feature-analyzer` agent on feature $ARGUMENTS.
**Checkpoint**: Verify that `FEATURE_SPECS_DIR/$ARGUMENTS_spec.md` exists.

## Step 2: Planning (SEQUENTIAL)
1. `backend-tasks-planner` (tasks + OpenAPI spec)
2. `frontend-tasks-planner` (built on OPENAPI_SPEC)
**Checkpoint**: The _analysis.md files exist.

## Step 3: TDD Implementation
1. `backend-tasks-executor` (tests before code)
2. `frontend-tasks-executor` (direct HTTP calls)
**Checkpoint**: All tests pass.

## Step 4: Conformity
Run `conformity-reporter`. NEVER overwrite — create V2, V3...

## Step 5: Quality loop (a single correction pass, then a V2 report)
If score < 80/100: re-run executor + conformity-reporter (V2).
If V2 < 80/100: STOP — human intervention required.

## Step 6: Wiki sync (if the wiki folder exists)
Run `/mod-generate-docs $ARGUMENTS`.
```
:::

Resuming after a failure: the skill takes a single argument, the feature name (no argument to choose the starting step). On failure, it tells you to re-run `/mod-migrate-feature <feature>`, which resumes from the failed step.

::: warning disable-model-invocation: true
ALWAYS set to `true` for workflows with side effects. You don't want Claude to start a migration because it "thinks it's relevant".
:::

### Example 3: Skill with dynamic injection

```markdown
---
name: pr-summary
description: Summarizes the changes of a pull request and flags risks.
  Use when the user asks for a summary or a quick review of a PR.
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## PR Context
- Diff: !`gh pr diff`
- Comments: !`gh pr view --comments`
- Modified files: !`gh pr diff --name-only`

## Task
Summarize this PR in 3-5 points. Identify risks.
```

::: tip Dynamic injection
The `` !`command` `` syntax executes the command BEFORE sending to the model. Claude receives the result, not the command. Ideal for live context (PR diff, git log, API status).
:::

### Example 4: Skill with integrated script

```markdown
---
name: codebase-visualizer
description: Generate an interactive visualization of the project structure
allowed-tools: Bash(python *)
disable-model-invocation: true
---

# Codebase Visualization

Execute the script:
`python ${CLAUDE_SKILL_DIR}/scripts/visualize.py .`

The script generates `codebase-map.html` and opens it in the browser.
```

### Example 5: Launcher skill — positional arguments

`/toggle-feature new-checkout off` → `$0` = `new-checkout`, `$1` = `off` (see [substitution variables](https://code.claude.com/docs/en/skills#available-string-substitutions)).

```markdown
---
name: toggle-feature
description: Turn a feature flag on or off
disable-model-invocation: true
argument-hint: "[flag-name] [on|off]"
---

1. Check that flag `$0` exists in the config
2. Set its value to `$1`
3. Run the smoke tests; if they fail, revert the change and stop
4. Offer the user to run `/dev:commit`
```

Step 4 does not run `/dev:commit` itself: that command uses `disable-model-invocation: true`, so Claude cannot invoke it.

### Reference examples

Rather than copying long examples, start from skills that Anthropic publishes and maintains:

| Example | What it shows |
|---------|---------------|
| [`fix-issue`](https://code.claude.com/docs/en/best-practices#create-skills) (Claude Code best practices) | Minimal task skill: `disable-model-invocation: true`, `$ARGUMENTS`, numbered steps up to verification (tests, lint) |
| [`anthropics/skills` → `pdf`](https://github.com/anthropics/skills/tree/main/skills/pdf) | Short `SKILL.md` pointing to reference files and scripts (progressive disclosure) |
| [`anthropics/skills` → `skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator) | A skill that helps write, test and improve other skills |

```markdown
<!-- .claude/skills/fix-issue/SKILL.md (excerpt from the best practices) -->
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.
1. Use `gh issue view` to get the issue details
...
5. Write and run tests to verify the fix
```

---

## Before going live

### Content & type

- [ ] Description: what the skill does **and** when to use it, in third person, natural keywords
- [ ] Correct type ([decision tree](#passive-vs-launcher))
- [ ] `disable-model-invocation: true` for risky actions
- [ ] Skill called by the pipeline or preloaded by an agent (`skills:`): without `disable-model-invocation`
- [ ] SKILL.md < 500 lines, details in `references/`
- [ ] Nothing Claude already knows (language standards, generic explanations)
- [ ] Reference files linked **directly** from `SKILL.md` (one level deep)
- [ ] Table of contents at the top of reference files longer than 100 lines
- [ ] No time-sensitive information ("before August 2025…"), or keep it in an "old patterns" section

### Project coherence

- [ ] No duplication with an existing [rule](/en/concepts/rules) (see [WARN-004](#warn-004))
- [ ] Coherent prefix (<span class="chez-nous">In our project</span> `sym-`, `front-`, `mod-`)
- [ ] Skills listed in agents that need them (`skills:`)
- [ ] Conventions in a preloaded skill, not copied into the agents' prompt ([WARN-006](#warn-006))

### Security & visibility

- [ ] `allowed-tools` limited to strict necessities
- [ ] `context: fork` if the skill needs to run in isolation
- [ ] Deny [permissions](/en/concepts/settings) configured if needed (`Skill(name *)`)
- [ ] Third-party skill (public repo, colleague) **read in full** before use: `SKILL.md`, scripts and `` !`…` `` injections run with your privileges

### Validation

- [ ] Tested with `/name` (launcher, standard) and through automatic triggering with a free message that matches the description (passive, standard)
- [ ] At least three scenarios compared with / without the skill ([Evaluating a skill](#evaluating-a-skill))
- [ ] Tested with every target model
- [ ] Budget verified (`/context`, `/doctor`; warning in `claude --debug`)

---

## Going further

- [Commands](/en/concepts/commands) and [Project commands](/en/examples/project-structure#project-commands) — the legacy format and how to move off it
- <span class="chez-nous">In our project</span> skill `claude-code-skill-command-model` — classify a new workflow as a skill or a command, audit `.claude/`
- [Official Documentation — Skills](https://code.claude.com/docs/en/skills) · [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills Standard](https://agentskills.io) · [Format Specification](https://agentskills.io/specification) · [Anthropic Skills Examples](https://github.com/anthropics/skills)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
