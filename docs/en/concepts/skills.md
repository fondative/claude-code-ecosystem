# Skills

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Reusable knowledge and workflow modules in `SKILL.md` format |
| **Where** | `.claude/skills/<name>/SKILL.md` (project) or `~/.claude/skills/` (personal) |
| **Types** | Passive (auto-loaded conventions), Launcher (workflows `/name`), Standard (both) |
| **Standard** | [Agent Skills](https://agentskills.io) — compatible with 30+ tools (Cursor, VS Code, Gemini CLI...) |
| **Ideal size** | < 500 lines for SKILL.md, details in `references/` |

---

## Bundled Skills

Claude Code includes built-in skills available in every session. Unlike built-in commands (`/help`, `/compact`), these are prompt-based skills that can spawn agents and adapt to the codebase.

| Skill | Description |
|-------|-------------|
| **`/simplify`** | Reviews modified files (code reuse, quality, efficiency). Spawns 3 agents in parallel then applies corrections |
| **`/batch <instruction>`** | Large-scale changes in parallel. Decomposes into 5-30 units, each in an isolated git worktree with PR |
| **`/debug [description]`** | Diagnoses the current session via debug logs |
| **`/loop [interval] <prompt>`** | Runs a prompt recurrently (polling deploy, babysitting PR). E.g.: `/loop 5m check if the deploy finished` |
| **`/claude-api`** | Loads the Claude API reference (Python, TS, Java, Go...) + Agent SDK. Also activates automatically when the code imports `anthropic` |

---

## What is a Skill?

A skill is a **set of instructions, scripts and resources** that Claude can discover and use to perform tasks more efficiently. You create a `SKILL.md` file with instructions, and Claude adds it to its toolbox.

Skills distinguish themselves from other components by their **ability to carry rich context** (reference files, scripts, templates) and to be **invocable on demand** or **loaded automatically** based on context.

```
┌──────────────────────────────────────────────────────────┐
│                    SKILL ECOSYSTEM                        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Passive    │  │  Launcher   │  │    Standard     │  │
│  │             │  │             │  │                 │  │
│  │ Conventions │  │  Workflows  │  │  Both modes     │  │
│  │ auto-load   │  │  /slash-cmd │  │  auto + /cmd    │  │
│  │             │  │             │  │                 │  │
│  │ E.g.: api-  │  │ E.g.: /deploy│  │ E.g.: /explain-│  │
│  │ conventions │  │ /migrate    │  │ code            │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Reference files                       │  │
│  │  references/, scripts/, templates/, examples/      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## How It Works

### Skill Lifecycle

```
1. Claude starts the session
   │
   ├── Loads DESCRIPTIONS of all skills
   │   (budget: 2% of context window ≈ 16,000 chars)
   │
   ├── User types a command or message
   │   │
   │   ├── /skill-name → Direct invocation
   │   │   └── Loads the FULL SKILL.md content
   │   │
   │   └── Free message → Claude decides
   │       ├── Description matches → Loads the skill
   │       └── No match → Ignores
   │
   └── Skill active
       ├── Instructions followed
       ├── Reference files loaded on demand
       └── allowed-tools applied
```

### File Structure

```
my-skill/
├── SKILL.md              # Entry point (MANDATORY)
├── references/           # Detailed documentation
│   ├── api-guide.md      #   loaded on demand by Claude
│   └── patterns.md
├── scripts/              # Executable scripts
│   └── validate.sh       #   Claude can run them
├── templates/            # Templates to fill in
│   └── output.md
└── examples/             # Expected output examples
    └── sample.md
```

::: tip 500-line rule
Keep `SKILL.md` under 500 lines. Move details into reference files. Claude will load them on demand when the context requires it.
:::

### Scopes and Priority

| Location | Scope | Priority |
|----------|-------|----------|
| Enterprise ([managed settings](/en/concepts/settings)) | All organization users | 1 (highest) |
| `~/.claude/skills/<name>/SKILL.md` | Personal (all projects) | 2 |
| `.claude/skills/<name>/SKILL.md` | Project (versionable in git) | 3 |
| [Plugin](/en/concepts/plugins) `skills/` | Namespace `plugin:skill`, no conflict | 4 (lowest) |

::: info [Commands](/en/concepts/commands) compatibility
Files in `.claude/commands/deploy.md` continue to work — they create the same `/deploy` as a skill. Skills are the **recommended format** because they support reference files, full [frontmatter](/en/reference/frontmatter), and `context: fork`. If a skill and a command share the same name, the skill takes priority.
:::

::: details Automatic discovery in monorepo
Claude Code also discovers skills in subdirectories. If you edit a file in `packages/frontend/`, skills from `packages/frontend/.claude/skills/` are also loaded. Skills added via `--add-dir` are detected in real-time (no restart needed).
:::

::: details Agent Skills Standard vs Claude Code
In the [Agent Skills standard](https://agentskills.io), `name` and `description` are **required**. In Claude Code, they are **optional**: `name` defaults to the folder name, `description` to the first paragraph. Claude Code also adds exclusive fields: `disable-model-invocation`, `user-invocable`, `context`, `agent`, `argument-hint`, `hooks`, `model`.
:::

### Full Frontmatter

```yaml
---
name: my-skill                    # Name and /slash-command
description: What the skill does   # CRITICAL for auto-discovery
disable-model-invocation: true     # true = only /name by user
user-invocable: false              # false = invisible in the / menu
allowed-tools: Read, Grep, Glob   # Tools without confirmation
model: sonnet                      # Forced model
context: fork                      # Execution in an isolated sub-agent
agent: Explore                     # Sub-agent type (if context: fork)
argument-hint: "[feature-name]"    # Autocompletion hint
hooks:                             # [Lifecycle hooks](/en/concepts/hooks)
  PreToolUse:
    - matcher: Bash
      hooks:
        - type: command
          command: "echo 'starting...'"
---
```

### Substitution Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$ARGUMENTS` | All arguments | `/skill foo bar` → `foo bar` |
| `$ARGUMENTS[N]` / `$N` | By index (0-based) | `$0` → `foo`, `$1` → `bar` |
| `${CLAUDE_SESSION_ID}` | Session ID | For logs, unique files |
| `${CLAUDE_SKILL_DIR}` | SKILL.md folder | For `scripts/`, `references/` |
| `` !`command` `` | Dynamic injection | `` !`gh pr diff` `` → command result |

### Skill in a Subagent vs Subagent with Skills

Two directions for combining skills and agents:

| Approach | System prompt | Task | Also loads |
|----------|--------------|------|-----------|
| Skill with `context: fork` | From the agent type (`Explore`, `Plan`...) | SKILL.md content | CLAUDE.md |
| [Subagent](/en/concepts/agents) with `skills:` | Markdown body of the subagent | Claude's delegation message | Preloaded skills + CLAUDE.md |

With `context: fork`, **you** write the task in the skill and choose an agent to execute it. With a subagent that declares `skills:`, **the agent** controls the prompt and uses skills as reference context.

::: tip Extended thinking
Including the word **`ultrathink`** in a skill's content activates [extended thinking](https://code.claude.com/docs/en/common-workflows#use-extended-thinking-thinking-mode) mode for deeper reasoning.
:::

### Visual Output Pattern

A skill can bundle scripts that generate interactive HTML files (trees, graphs, dashboards). The script lives in `scripts/`, the skill invokes it via Bash, and the result is a standalone HTML file openable in the browser.

### Loading Budget

By default, skill content is limited to approximately 2% of the context window (~16,000 characters). To increase this limit:

```bash
SLASH_COMMAND_TOOL_CHAR_BUDGET=50000 claude
```

---

## Practical Guide: Designing Your Skills

### Which Type to Choose?

#### Skill vs Rule vs Agent

| Need | Component | Why |
|------|-----------|-----|
| Code conventions (style, architecture, naming) | **Passive skill** | Loaded automatically, supports references |
| Short contextual reminder (< 30 lines) | **[Rule](/en/concepts/rules)** | Lighter, injection by glob |
| Multi-step workflow (migration, deploy) | **Launcher skill** | Orchestrates [agents](/en/concepts/agents), invocable by `/name` |
| Atomic task execution | **[Agent](/en/concepts/agents)** | Isolated context, dedicated model |
| One-off action (commit, test) | **[Command](/en/concepts/commands)** or launcher skill | Commands still work, skills recommended |

#### Passive vs Launcher

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

#### Visibility Matrix

| Configuration | User sees `/name` | Claude auto-loads | Use case |
|---------------|-------------------|-------------------|----------|
| (default) | Yes | Yes | Versatile skill |
| `disable-model-invocation: true` | Yes | No | Deploy, commit, risky actions |
| `user-invocable: false` | No | Yes | Conventions, business context |

### Organization by Namespace

```
.claude/skills/
├── symfony/                    # By framework
│   ├── api-conventions/
│   └── testing-conventions/
├── modernization/              # By workflow
│   ├── analyze-legacy/
│   ├── migrate-feature/
│   ├── conformity-conventions/ # Scoring and reports
│   └── generate-docs/
├── frontend/                  # By framework
│   ├── app-conventions/
│   ├── design-conventions/    # Figma design conventions
│   └── testing-conventions/
```

### Skill → Agent Inheritance

```yaml
# .claude/agents/backend-executor.md
---
name: backend-executor
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---
```

The agent receives the **full** content of each skill at startup — not just the description. Different from automatic loading in a normal session.

### Warnings

#### ⚠️ `WARN-001`: Skill too long

Beyond 500 lines, `SKILL.md` saturates the context on every invocation — even for parts that are not relevant.

::: danger Problem
```yaml
# ❌ BAD — 2000 lines in SKILL.md
---
name: api-conventions
---
## Architecture (200 lines...)
## Entities (300 lines...)
## DTOs (400 lines...)
```
2000 lines loaded in full every time, even when only the architecture section is needed.
:::

::: info Solution
```yaml
# ✅ GOOD — Short SKILL.md + references
---
name: api-conventions
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

#### ⚠️ `WARN-002`: Vague or missing description

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
# ✅ GOOD — Precise keywords
---
name: api-conventions
description: Backend Symfony conventions. REST architecture, DTOs,
  repositories with filtering, exception handling.
---
```
Precise keywords allow Claude to load the skill as soon as the context matches.
:::

---

#### ⚠️ `WARN-003`: Launcher without protection

Without `disable-model-invocation: true`, Claude can trigger a launcher skill autonomously — including actions with side effects.

::: danger Problem
```yaml
# ❌ DANGEROUS — Claude can deploy on its own
---
name: deploy
description: Deploy to production
---
```
Claude can decide to deploy because "the code looks ready", without any human action.
:::

::: info Solution
```yaml
# ✅ SECURE — Human control mandatory
---
name: deploy
description: Deploy to production
disable-model-invocation: true
---
```
With `disable-model-invocation: true`, the skill can only be invoked explicitly by the user.
:::

---

#### ⚠️ `WARN-004`: Skill / [rule](/en/concepts/rules) duplication

Maintaining the same content in both a [rule](/en/concepts/rules) and a skill creates two sources of truth that diverge during updates.

::: danger Problem
```yaml
# ❌ BAD — Same content in 2 places
# rules/backend.md → PSR-12, camelCase...
# skills/api-conventions/SKILL.md → PSR-12, camelCase...
```
An update in one is not reflected in the other — desynchronization is guaranteed.
:::

::: info Solution
```yaml
# ✅ GOOD — Rule delegates, skill details
# rules/backend.md
# → "Load the skill api-conventions. Reminders: Docker, TDD."
# skills/api-conventions/SKILL.md → (full detail)
```
The rule points to the skill. One single place to maintain for detailed content.
:::

---

#### ⚠️ `WARN-005`: Context budget exceeded

When too many skills are present, some are silently excluded from automatic loading.

::: warning
**Symptom**: `⚠️ Some skills were excluded due to context budget limits`

See [Claude doesn't see all skills](#claude-doesn-t-see-all-skills) for solutions.
:::

---

## Advanced Control

### Restricting Access to Skills

Three levels of control over which skills Claude can invoke:

**Disable all skills** — add `Skill` to deny rules in [permissions](/en/concepts/settings).

**Allow/block specific skills**:

```text
# Allow only certain skills
Skill(commit)
Skill(review-pr *)

# Block certain skills
Skill(deploy *)
```

Syntax: `Skill(name)` for exact match, `Skill(name *)` for prefix with arguments.

**Hide a skill individually** — `disable-model-invocation: true` in the frontmatter. The skill completely disappears from Claude's context.

::: info
`user-invocable: false` only controls visibility in the `/` menu, not access via the Skill tool. Use `disable-model-invocation: true` to block programmatic invocation.
:::

### Troubleshooting

#### The skill doesn't trigger

1. Check that the description contains keywords the user would naturally use
2. Verify with `What skills are available?` that the skill appears
3. Rephrase the request to better match the description
4. Invoke directly with `/skill-name` to test

#### The skill triggers too often

1. Make the description more specific
2. Add `disable-model-invocation: true` if only manual invocation is desired

#### Claude doesn't see all skills

Skill descriptions are loaded within a budget of **2% of the context window** (~16,000 characters). If many skills:

1. Run `/context` to see excluded skills
2. Switch some to `disable-model-invocation: true` (excluded from budget)
3. Shorten descriptions
4. Increase via `SLASH_COMMAND_TOOL_CHAR_BUDGET`

---

## Concrete Examples

### Example 1: Passive skill — API Conventions

```yaml
---
name: api-conventions
description: Backend Symfony conventions for this project. REST
  architecture, DTOs, repositories with filtering, exception handling.
user-invocable: false
---

# Symfony API Conventions

## Architecture
Controller → Service → Repository → Entity

## Standards
- PSR-12 strict
- UUID for all primary keys
- camelCase methods, PascalCase classes
- All commands via Docker:
  `docker compose exec -T app [cmd] 2>&1 | cat`

## Detailed references
- Create an entity → [create-entity.md](references/create-entity.md)
- Create a DTO → [create-dto.md](references/create-dto.md)
- Create a controller → [create-controller.md](references/create-controller.md)
```

**14 reference files** cover each pattern in detail.

::: info Why passive?
Conventions are not an action. Claude needs to know them when working on the backend, not when the user types `/api-conventions`.
:::

### Example 2: Launcher skill — E2E Migration

```yaml
---
name: modernization/migrate-feature
description: End-to-end migration of a legacy feature to the modern stack
disable-model-invocation: true
argument-hint: "[feature-name] [stage]"
---

# Migration of $0

## Step 1: Detailed specification
Run the `legacy-feature-analyzer` agent on feature $0.
**Checkpoint**: Verify that `output/features/$0_spec.md` exists.

## Step 2: Planning
Run in PARALLEL:
- `backend-tasks-planner`
- `frontend-tasks-planner`
**Checkpoint**: The _analysis.md files exist.

## Step 3: TDD Implementation
1. `backend-tasks-executor` (tests before code)
2. `frontend-tasks-executor` (direct HTTP calls)
**Checkpoint**: All tests pass.

## Step 4: Conformity
Run `conformity-reporter`. NEVER overwrite — create V2, V3...

## Step 5: Quality loop (max 2 iterations)
If score < 80/100: re-run executor + conformity-reporter (V2).
If V2 < 80/100: STOP — human intervention required.
```

::: warning disable-model-invocation: true
ALWAYS set to `true` for workflows with side effects. You don't want Claude to start a migration because it "thinks it's relevant".
:::

### Example 3: Skill with dynamic injection

```yaml
---
name: pr-summary
description: Summarize the changes of a pull request
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

```yaml
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

---

## Launch Checklist

### Content & type

- [ ] Precise description with natural keywords
- [ ] Correct type ([decision tree](#passive-vs-launcher))
- [ ] `disable-model-invocation: true` for risky actions
- [ ] SKILL.md < 500 lines, details in `references/`

### Project coherence

- [ ] No duplication with an existing [rule](/en/concepts/rules) (see [WARN-004](#warn-004-skill--rule-duplication))
- [ ] Coherent namespace (`framework/`, `workflow/`)
- [ ] Skills listed in agents that need them (`skills:`)

### Security & visibility

- [ ] `allowed-tools` limited to strict necessities
- [ ] `context: fork` if the skill needs to run in isolation
- [ ] Deny [permissions](/en/concepts/settings) configured if needed (`Skill(name *)`)

### Validation

- [ ] Manually tested with `/skill-name`
- [ ] Tested in auto-invocation (free message that matches the description)
- [ ] Context budget verified (`/context`)

---

## Resources

- [Official Documentation — Skills](https://code.claude.com/docs/en/skills)
- [Agent Skills Standard](https://agentskills.io)
- [Format Specification](https://agentskills.io/specification)
- [Anthropic Skills Examples](https://github.com/anthropics/skills)
