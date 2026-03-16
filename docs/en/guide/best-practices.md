# Best Practices

## .claude/ Directory Architecture

### Organize by Responsibility

```
.claude/
├── settings.json              # Security only
├── agents/                    # 1 file = 1 responsibility
│   ├── analyzer.md
│   ├── implementer.md
│   └── reviewer.md
├── skills/
│   ├── conventions/           # Passive skills (knowledge)
│   │   └── SKILL.md
│   ├── deploy/                # Launcher skills (workflows)
│   │   └── SKILL.md
│   └── framework/references/  # Detailed documentation
├── rules/                     # Short, targeted, contextual
│   ├── backend.md
│   └── git.md
└── commands/                  # One-off actions
    └── dev/
        └── test.md
```

### Single Responsibility Principle

| Component | Responsibility | Anti-pattern |
|-----------|---------------|-------------|
| [CLAUDE.md](/en/concepts/claude-md) | Paths + workflow | Detailed conventions |
| [Rules](/en/concepts/rules) | Contextual reminders | Complete documentation |
| [Skills](/en/concepts/skills) (passive) | Detailed conventions | Execution instructions |
| [Skills](/en/concepts/skills) (launcher) | Orchestration | Conventions |
| [Agents](/en/concepts/agents) | Single task execution | Multi-responsibility |
| [Commands](/en/concepts/commands) | User actions | Business logic |

## Path Management

### Single Source of Truth

**Always** centralize paths in CLAUDE.md:

```markdown
| Alias | Path | Description |
|-------|------|-------------|
| `SRC` | `./src/` | Source code |
| `TESTS` | `./tests/` | Tests |
| `DOCS` | `./docs/` | Documentation |
```

**Never** hardcode in agents:

```markdown
# ❌ Bad
Read files in ./src/legacy/php-app/

# ✅ Good
Read files in `SRC` (defined in CLAUDE.md)
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Agents | `role-action.md` | `backend-tasks-executor.md` |
| Skills | `domain/name/SKILL.md` | `symfony/api-conventions/SKILL.md` |
| Rules | `domain-context.md` | `legacy-readonly.md` |
| Commands | `category/action.md` | `dev/commit.md` |
| References | `action-object.md` | `create-entity.md` |
| Feature specs | `Feature_Name_spec.md` | `Search_Engine_spec.md` |

## Model Strategy

### Right Model Rule

| Complexity | Model | Justification |
|------------|-------|---------------|
| Deep analysis | Opus | Multi-step reasoning, large context |
| Implementation | Sonnet | Quality/speed balance |
| Documentation | Haiku | Structured task, fast |
| Health-check | Haiku | Simple diagnostics |

**Rule**: start with Haiku, scale up only if quality isn't sufficient.

## Checkpoints and Resilience

### Checkpoint Pattern

Between each pipeline step, verify that outputs exist:

```markdown
## Step 1: Analysis
Generate `output/analysis.md`

### Checkpoint
Verify that `output/analysis.md` exists and contains > 100 lines.
If missing: STOP + error message + relaunch command.

## Step 2: Implementation
Read `output/analysis.md` and implement...
```

### Report Versioning

Never overwrite an existing report:

```
output/reports/
├── Feature_REPORT-V1.md    # First report
├── Feature_REPORT-V2.md    # After corrections
└── Feature_REPORT-V3.md    # Final version ← always use this one
```

## Skills: Passive vs Launcher

### When to Use a Passive Skill?

- Code conventions (style, architecture, naming)
- Domain knowledge (business, API, DB schema)
- Context Claude needs to know but that isn't an action

### When to Use a Launcher Skill?

- Multi-step workflows (migration, deploy, release)
- Actions with side effects (commit, send message)
- Pipelines orchestrating multiple agents

## Rules: Short and Targeted

### Ideal Length

- **< 30 lines**: essential reminders
- Delegate details to skills
- A rule should be readable in 10 seconds

### Delegation Pattern

```markdown
---
paths:
  - "api-rest-symfony-target/**"
---

# Backend Symfony

Load the skill `symfony/api-conventions` for conventions.

Reminders:
- Docker: `docker compose exec -T app [cmd]`
- TDD mandatory
```

## RTK — Raw Token Keying

RTK is an advanced technique to maximize information density in CLAUDE.md and skill instructions. Principle: use raw keywords rather than complete sentences.

| Approach | Tokens | Example |
|----------|--------|---------|
| Verbose | ~30 | "Always use Docker Compose to execute backend commands" |
| RTK | ~10 | "Backend cmds: `docker compose exec -T app [cmd]`" |

::: tip When to use RTK
Reserve RTK for frequently loaded files (CLAUDE.md, global rules). Passive skills can remain more detailed since they are only loaded on demand.
:::

## Most Common Mistakes

1. **CLAUDE.md too long** — No technical truncation, but a file that is too long drowns essential information. Delegate to skills and `@import`
2. **Duplicated conventions** — Same info in rule + skill = desynchronization
3. **Catch-all agent** — An agent that does analysis + implementation + review
4. **No checkpoint** — An agent fails and the next one runs idle
5. **Opus everywhere** — 10x cost for tasks Haiku does just as well

## Resources

- [How I use Claude Code](https://boristane.com/blog/how-i-use-claude-code/)
- [Official documentation](https://code.claude.com/docs/en/skills)
