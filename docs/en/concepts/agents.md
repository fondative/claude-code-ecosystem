# Agents

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Specialized Claude instances with dedicated tools, model and instructions |
| **Where** | `.claude/agents/<name>.md` |
| **Isolation** | Each agent has its own context (no conversation history) |
| **Models** | Opus (complex analysis), Sonnet (implementation), Haiku (lightweight tasks) |
| **Inheritance** | Can inherit skills via the `skills:` frontmatter |

---

## Built-in Agents

Claude Code includes built-in agents used automatically. They require no configuration.

| Agent | Model | Tools | Usage |
|-------|-------|-------|-------|
| **Explore** | Haiku | Read-only (no Write/Edit) | Codebase search and exploration. Levels: `quick`, `medium`, `very thorough` |
| **Plan** | Inherit | Read-only | Context search in plan mode (`/plan`) |
| **General-purpose** | Inherit | All | Complex multi-step tasks (exploration + modification) |
| **Bash** | Inherit | Terminal | Shell commands in a separate context |
| **Claude Code Guide** | Haiku | Read-only | Questions about Claude Code features |

::: tip Agent management
- `/agents`: interactive interface to create, edit, delete agents
- `claude agents`: list all agents from the terminal
:::

---

## What is an Agent?

An agent (or sub-agent) is an **isolated Claude instance** configured for a specific task. Each agent has its own system prompt (the `.md` file), its authorized tools, its model, and optionally inherited skills.

The agent does NOT see the conversation history. It receives a task, executes it with its tools, and returns a result.

```
┌─────────────────────────────────────────────┐
│              Main session                    │
│                                             │
│  User ←→ Claude (conversation)              │
│                    │                        │
│              Agent tool                     │
│                    │                        │
│    ┌───────────────┼───────────────┐        │
│    ▼               ▼               ▼        │
│ ┌────────┐   ┌──────────┐   ┌──────────┐   │
│ │Agent A │   │ Agent B  │   │ Agent C  │   │
│ │ Opus   │   │ Sonnet   │   │ Haiku    │   │
│ │Read    │   │Read,Write│   │Read,Grep │   │
│ │Grep    │   │Edit,Bash │   │          │   │
│ │        │   │          │   │          │   │
│ │Analysis│   │Implement.│   │ Audit    │   │
│ └────────┘   └──────────┘   └──────────┘   │
│    │               │               │        │
│    ▼               ▼               ▼        │
│  Result          Result          Result     │
└─────────────────────────────────────────────┘
```

---

## How It Works

### File Format

```yaml
---
name: backend-tasks-executor
description: Backend Test First implementation
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---

# Backend Tasks Executor

## Process
1. Read the backend analysis file
2. For each task:
   a. Read the skill reference (e.g.: create-entity.md)
   b. Write the tests first (Red)
   c. Implement the code (Green)
   d. Refactor if necessary
3. Mark the task "Processed"
```

### Frontmatter

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Unique identifier |
| `description` | Yes | string | What the agent does (1-2 lines) |
| `tools` | No | string (CSV) | `Read`, `Glob`, `Grep`, `Write`, `Edit`, `Bash`. Inherits all tools if omitted |
| `model` | No | string | `opus`, `sonnet`, `haiku`, `inherit`. Default: `inherit` (parent conversation model) |
| `skills` | No | list | Inherited skills (full content loaded at startup) |
| `disallowedTools` | No | string (CSV) | Tools to exclude (denylist), removed from inherited or specified list |
| `permissionMode` | No | string | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | number | Max number of agentic turns before stopping |
| `mcpServers` | No | list | [MCP](/en/concepts/mcp) servers dedicated to this agent |
| `hooks` | No | object | [Hooks](/en/concepts/hooks) lifecycle scoped to this agent (`PreToolUse`, `PostToolUse`, `Stop`) |
| `memory` | No | string | Persistent cross-session memory: `user`, `project`, `local` |
| `background` | No | boolean | `true` to always run in the background. Default: `false` |
| `isolation` | No | string | `worktree` for an isolated git worktree (cleaned up if no changes) |

### Skill Inheritance

When an agent declares `skills:`, the **full** content of each SKILL.md is injected into its system prompt at startup — not just the description.

```yaml
# The agent receives ALL the content of these skills
skills:
  - symfony/api-conventions      # 14 references available
  - symfony/testing-conventions  # 3 references available
```

### How an Agent is Spawned

| Method | Trigger | Example |
|--------|---------|---------|
| Launcher skill | `/modernization/migrate-feature X` | The skill orchestrates agents |
| Agent tool | Claude decides to delegate | `Agent(subagent_type: "Explore")` |

::: warning No nesting
Subagents **cannot** spawn other subagents. Only the main thread (conversation or `claude --agent`) can delegate. For multi-level workflows, use skills or chain agents from the main conversation.
:::

### Scopes and Priority

Agents can be defined at multiple levels. In case of name conflict, the highest priority wins.

| Location | Scope | Priority |
|----------|-------|----------|
| `--agents '{JSON}'` (CLI) | Current session only | 1 (highest) |
| `.claude/agents/` | Project (versionable in git) | 2 |
| `~/.claude/agents/` | User (all projects) | 3 |
| Plugin `agents/` | Projects where the plugin is active | 4 (lowest) |

```bash
# Ephemeral agent via CLI (not saved to disk)
claude --agents '{
  "quick-reviewer": {
    "description": "Quick review of modified code",
    "prompt": "Analyze git diff and give concise feedback.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "haiku"
  }
}'
```

### Foreground vs Background

| Mode | Behavior | Permissions |
|------|----------|-------------|
| **Foreground** | Blocks the conversation until done | Permission prompts passed to the user |
| **Background** | Runs in parallel (`Ctrl+B` to background) | Permissions pre-approved at launch, auto-deny otherwise |

::: tip
If a background agent fails due to lack of permissions, you can **resume it in foreground** via its agent ID to retry with interactive prompts.
:::

To completely disable background: `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`.

### Resuming an Agent

Each invocation creates an instance with a fresh context. To **continue** an agent's work instead of starting over, ask Claude to resume it:

```text
Use the code-reviewer agent to analyze the auth module
[Agent finishes]

Continue this review and now analyze the authorization module
[Claude resumes the agent with all its previous history]
```

The resumed agent keeps **all** its history: tool calls, results, reasoning.

Transcripts are stored in `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl` and persist independently of the main conversation:
- Conversation compaction does not affect transcripts
- You can resume an agent after restarting Claude Code (same session)
- Automatic cleanup based on `cleanupPeriodDays` (default: 30 days)

### Automatic Delegation

Claude decides to delegate based on your request description and the agent's `description` field.

::: tip Proactive delegation
Including **"use proactively"** in an agent's description encourages Claude to use it automatically without waiting for an explicit request.

```yaml
description: Expert code reviewer. Use proactively after code changes.
```
:::

---

## When to Use a Subagent?

| Situation | Recommendation |
|-----------|---------------|
| Voluminous output (tests, logs, docs) | **Subagent** — isolates noise from the main context |
| Tool restrictions / specific permissions | **Subagent** — tools limited to strict necessities |
| Autonomous task with summarizable result | **Subagent** — returns a concise summary |
| Iterative exchanges, frequent back-and-forth | **Main conversation** — preserves shared context |
| Related phases (plan → impl → test) | **Main conversation** — avoids context loss |
| Quick, targeted change | **Main conversation** — no startup latency |
| Reusable workflow in main context | **[Skill](/en/concepts/skills)** — no isolation, same context |
| Sustained cross-session parallelism | **[Agent Teams](https://code.claude.com/docs/en/agent-teams)** — each worker has its own independent context |

---

## Practical Guide: Designing Your Agents

### Which Model to Choose?

```
Does the task require UNDERSTANDING undocumented code?
├── YES → Opus ($$$)
│   (reverse engineering, architecture deduction)
└── NO
    Does the task PRODUCE code or specifications?
    ├── YES → Sonnet ($$)
    │   (implementation, planning, review)
    └── NO
        Does the task follow a CLEAR TEMPLATE?
        ├── YES → Haiku ($)
        │   (documentation, audit, diagnostics)
        └── NO → Sonnet (default)
```

::: tip Golden rule
Start with Haiku. Move up to Sonnet if quality isn't sufficient. Opus only for analyzing undocumented code.
:::

### Typical Distribution (project example)

::: info
This distribution is specific to the legacy modernization project. Adapt it to your context.
:::

```
Opus (2 agents) ─────────────────────────────── $$$
├── legacy-technical-analyzer    # Complete reverse engineering
└── legacy-feature-analyzer      # 12-section specification

Sonnet (8 agents) ───────────────────────────── $$
├── backend-tasks-planner        # Task decomposition
├── backend-tasks-executor       # TDD implementation
├── frontend-tasks-planner       # Frontend planning
├── frontend-tasks-executor      # Frontend implementation
├── frontend-design-executor     # With Figma design
├── legacy-feature-analyzer-refiner
├── legacy-functional-analyzer
└── conformity-reporter          # Scoring

Haiku (3 agents) ────────────────────────────── $
├── legacy-functional-analyzer-auditor
├── documentation-generator      # VitePress
└── health-check                 # Diagnostics
```

### Mistakes to Avoid

#### Pitfall 1: Catch-all agent

```yaml
# ❌ BAD — Analysis + implementation + documentation
---
name: do-everything
description: Does everything
model: opus
---
```

```yaml
# ✅ GOOD — Single responsibility
---
name: backend-tasks-executor
description: Backend Test First implementation
model: sonnet
---
```

> A catch-all agent loses focus and costs more.

#### Pitfall 2: Too many tools

```yaml
# ❌ — Analysis agent with Write/Edit
tools: Read, Glob, Grep, Write, Edit, Bash
```

```yaml
# ✅ — Read-only for analysis
tools: Read, Glob, Grep
```

> Limiting tools prevents unexpected actions.

#### Pitfall 3: Opus everywhere

```yaml
# ❌ EXPENSIVE — Opus for documentation
model: opus
```

```yaml
# ✅ ECONOMICAL — Haiku is sufficient
model: haiku
```

> Haiku is ~10x cheaper for structured tasks.

#### Pitfall 4: No checkpoint

```yaml
# ❌ — The executor runs idle if analysis failed
Step 1: analyzer → Step 2: executor
```

```yaml
# ✅ — Verification before continuing
Step 1: analyzer
Checkpoint: output/analysis.md exists?
Step 2: executor
```

> Without checkpoint, a failure propagates silently.

### Orchestration Patterns

#### Sequential

```
Analyzer ──► spec.md ──► Planner ──► analysis.md ──► Executor
```

Usage: migration pipeline (each step depends on the previous one).

#### Parallel

```
         ┌── Backend Planner ──┐
Spec ────┤                     ├──► Merge
         └── Frontend Planner ─┘
```

Usage: simultaneous backend + frontend planning.

#### Hierarchical

```
Skill Launcher (orchestrator, main conversation)
├── Analysis Agent (Opus)
├── Implementation Agent (Sonnet)
│   ├── Backend sub-task
│   └── Frontend sub-task
└── Conformity Agent (Sonnet)
```

::: warning
It is the **skill launcher** (main conversation) that spawns each agent — not the agents themselves. Backend/frontend sub-tasks are sequential steps of the same agent, not nested sub-agents.
:::

#### LLM-as-Judge

```
Executor ──► output ──► Judge ──► score
                          │
                          └── if < 80% → re-execution (max 2x)
```

---

## Advanced Control

### Permission Modes

The `permissionMode` field controls how the agent handles permission prompts.

| Mode | Behavior |
|------|----------|
| `default` | Standard verification with user prompts |
| `acceptEdits` | Auto-accepts file edits |
| `dontAsk` | Auto-refuses prompts (only explicitly allowed tools work) |
| `bypassPermissions` | Ignores all permission checks |
| `plan` | Read-only mode (exploration only) |

::: danger
`bypassPermissions` skips ALL checks. Use only in controlled environments (CI/CD, sandbox).
:::

### Persistent Memory

The `memory` field gives the agent a persistent cross-session directory to accumulate knowledge.

| Scope | Location | Usage |
|-------|----------|-------|
| `user` | `~/.claude/agent-memory/<name>/` | Knowledge shared between all projects |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, versionable in git |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, not committed |

When `memory` is active:
- The system prompt includes the first 200 lines of `MEMORY.md` from the memory directory
- Read, Write, Edit tools are automatically enabled
- The agent can read and write its notes between sessions

```yaml
---
name: code-reviewer
description: Code review with continuous learning
memory: user
---

Before each review, consult your memory for previously identified patterns.
After each review, update your memory with new discoveries.
```

### Disabling an Agent

You can prevent Claude from using a specific agent via `permissions.deny` in settings:

```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-custom-agent)"]
  }
}
```

Or via CLI: `claude --disallowedTools "Agent(Explore)"`

---

## Concrete Examples

### Example 1: Analysis agent (Opus, read-only)

```yaml
---
name: legacy-technical-analyzer
description: Complete reverse engineering of legacy (architecture,
  data flow, database, dependencies, deployment)
tools: Read, Glob, Grep, Write, Bash
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

### Example 2: Implementation agent (Sonnet, TDD)

```yaml
---
name: backend-tasks-executor
description: Backend Test First implementation via Docker
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---

# TDD Implementation

Before each task, read the skill reference:
- create-entity.md, create-dto.md, create-controller.md

## Process per task
1. Write the test → Red
2. Implement → Green
3. Refactor
4. `docker compose exec -T app php bin/phpunit 2>&1 | cat`
5. Mark "Processed" with date and test count
```

### Example 3: Diagnostic agent (Haiku, fast)

```yaml
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
- [ ] Tests pass

Report: errors / warnings / OK
```

---

## Launch Checklist

### Design

- [ ] Single responsibility per agent
- [ ] Appropriate model ([decision tree](#which-model-to-choose))
- [ ] Tools limited to strict necessities
- [ ] `disallowedTools` if specific tools need to be excluded

### Description & delegation

- [ ] Clear description — Claude uses it to decide when to delegate
- [ ] `"Use proactively"` in description if automatic delegation desired
- [ ] Skills listed explicitly (no inheritance from parent conversation)

### Execution

- [ ] Checkpoints between sequential steps
- [ ] `maxTurns` defined to avoid infinite loops
- [ ] `permissionMode` appropriate (`plan` for read-only, `dontAsk` for CI)

### Maintenance

- [ ] File versioned in `.claude/agents/` (team sharing)
- [ ] Naming convention: `{role}-{action}.md`
- [ ] Output files documented in the prompt
- [ ] `memory: user` if cross-session learning desired

---

## Resources

- [Official Documentation — Sub-agents](https://code.claude.com/docs/en/sub-agents)
