# Commands

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Actions invocable by the user via `/name` |
| **Where** | `.claude/commands/` (project) or `~/.claude/commands/` (personal) |
| **Status** | Merged with skills — commands continue to work, skills recommended for new workflows |
| **Priority** | A command and a skill with the same name → the skill wins |
| **Arguments** | Via `$ARGUMENTS`, `$0`, `$1`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}` |

---

## What is a Command?

A command (or slash command) is a Markdown file in `.claude/commands/` that defines a **user-invocable action** via `/name`. Since the merger with skills, commands share **the same frontmatter system** as skills. Skills are recommended for new workflows because they support additional features (support files, automatic loading).

```
┌──────────────────────────────────────┐
│  User types: /dev/commit             │
│         │                            │
│         ▼                            │
│  Claude loads:                       │
│  .claude/commands/dev/commit.md      │
│         │                            │
│         ▼                            │
│  Executes the instructions:          │
│  1. git diff --staged                │
│  2. Determine type/scope             │
│  3. Propose message                  │
│  4. Commit                           │
└──────────────────────────────────────┘
```

::: info Commands = Skills without a folder
Commands support **the same frontmatter** as skills. The only difference: a command is a single `.md` file, a skill is a folder with `SKILL.md` + optional support files.
:::

---

## How It Works

### Skills / Commands Equivalence

| Aspect | Command | Skill |
|--------|---------|-------|
| Location | `.claude/commands/review.md` | `.claude/skills/review/SKILL.md` |
| Invocation | `/review` | `/review` |
| Support files | No | Yes (`references/`, `scripts/`) |
| Auto-loading | No | Yes (unless `disable-model-invocation`) |
| Frontmatter | **Same full system** | **Same full system** |
| **Recommendation** | Existing ones OK | **Preferred for new ones** |

::: info Progressive migration
Your `.claude/commands/` files continue to work. If a command and a skill share the same name, the skill takes priority. Migrate progressively.
:::

### Frontmatter (same as skills)

Commands support **all** skill frontmatter fields:

| Field | Description |
|-------|-------------|
| `name` | Display name (default: filename) |
| `description` | What the command does — helps autocompletion |
| `argument-hint` | Hint for arguments (`[unit\|path]`) |
| `disable-model-invocation` | `true` = manual invocation only |
| `user-invocable` | `false` = invisible in the `/` menu |
| `allowed-tools` | Tools allowed without confirmation |
| `model` | Model to use |
| `context` | `fork` to execute in an isolated subagent |
| `agent` | Subagent type if `context: fork` |
| `hooks` | Hooks scoped to the command lifecycle |

### Substitution Variables

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed |
| `$ARGUMENTS[N]` or `$N` | Argument by index (0-based) |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_SKILL_DIR}` | Directory containing the file |

### Dynamic Injection

The `` !`command` `` syntax executes shell **before** sending the content to Claude:

```yaml
---
name: pr-summary
description: Summarize the changes of a PR
context: fork
---

## PR Context
- Diff: !`gh pr diff`
- Comments: !`gh pr view --comments`
- Files: !`gh pr diff --name-only`

## Task
Summarize this pull request...
```

The shell commands execute first, their output replaces the placeholder, and Claude receives the final prompt with real data.

### Scopes and Priority

| Scope | Location | Priority | Shared |
|-------|----------|----------|--------|
| **Enterprise** | Managed settings | Highest | Organization |
| **Personal** | `~/.claude/commands/*.md` | Medium | All your projects |
| **Project** | `.claude/commands/*.md` | Standard | Team (git) |

Project commands override personal commands with the same name.

::: tip Personal commands
`~/.claude/commands/` lets you define commands that follow you across **all** your projects (e.g.: `/my-commit`, `/my-review`).
:::

### Subfolder Organization

Subfolders become namespaces:

```
.claude/commands/
├── dev/
│   ├── commit.md        # → /dev/commit
│   ├── php-test.md      # → /dev/php-test
│   └── php-lint.md      # → /dev/php-lint
└── review/
    └── symfony-review.md # → /review/symfony-review
```

---

## Practical Guide: Designing Your Commands

### When to Use a Command vs a Skill?

```
Need support files (references, scripts)?
├── YES → SKILL (only format that supports it)
└── NO
    Need automatic loading by Claude?
    ├── YES → SKILL (with description)
    └── NO
        Existing command that works?
        ├── YES → Keep the command (no urgent migration)
        └── NO → Create a SKILL (modern format)
```

### When to Migrate to Skill

Migrate a command to a skill when:
- Need for reference files
- Need for executable scripts
- Need for `context: fork` (isolated execution)
- Need for `hooks` scoped to lifecycle
- Creating a new workflow

### Mistakes to Avoid

#### Pitfall 1: Command and Skill with the same name

```
# ❌ — Name conflict
.claude/commands/review.md
.claude/skills/review/SKILL.md
# → The skill takes priority, the command is ignored
```

> Choose one or the other, not both.

#### Pitfall 2: Forgetting Docker flags

```bash
# ❌ — TTY + lost output
docker compose exec app php bin/phpunit
```

```bash
# ✅ — Correct flags
docker compose exec -T app php bin/phpunit 2>&1 | cat
```

#### Pitfall 3: Command without description

```yaml
# ❌ — Autocompletion shows nothing useful
---
name: test
---
```

```yaml
# ✅ — Clear description
---
name: php-test
description: Run backend tests via Docker Compose
argument-hint: "[unit|integration|functional]"
---
```

#### Pitfall 4: Logic too complex

```markdown
# ❌ — Branching, conditions, 200 lines of instructions
```

```markdown
# ✅ — Extract complex logic into a skill with support files
```

> A command = a single file. If the logic overflows, it's a skill.

#### Pitfall 5: Hidden dependencies

```yaml
# ❌ — Requires gh CLI + Docker but doesn't say so
---
name: deploy
---
```

```yaml
# ✅ — Prerequisites documented
---
name: deploy
description: Deploy via Docker (requires gh CLI and Docker)
---
```

---

## Concrete Examples

### Example 1: /dev/commit

```yaml
---
name: commit
description: Commit with Conventional Commits
disable-model-invocation: true
---

# Commit

1. Analyze `git diff --staged` and `git diff`
2. Determine the type: feat, fix, refactor, docs, test, chore
3. Deduce the scope from modified files
4. Propose: `type(scope): concise description`
5. Add `Co-Authored-By: Claude <noreply@anthropic.com>`

Warning: If pre-commit hook fails → fix → NEW commit (NOT amend)
```

### Example 2: /dev/php-test

```yaml
---
name: php-test
description: Run backend tests via Docker
disable-model-invocation: true
argument-hint: "[unit|integration|functional|path]"
---

# PHP Tests

Command: `docker compose exec -T app php bin/phpunit $ARGUMENTS 2>&1 | cat`

## Arguments
- (empty): all tests
- `unit`: `--testsuite unit`
- `integration`: `--testsuite integration`
- `functional`: `--testsuite functional`
- path: specific file or folder
```

::: tip Docker flags
`-T` disables TTY (avoids exit code issues).
`2>&1 | cat` captures all output.
:::

### Example 3: /review/symfony-review

```yaml
---
name: symfony-review
description: Code review with quality checklist
disable-model-invocation: true
argument-hint: "[path]"
---

# Symfony Code Review

## Checklist
1. **Architecture**: Controller → Service → Repository
2. **Standards**: PSR-12, naming, typing
3. **Security**: injection, validation, auth
4. **Tests**: coverage, edge cases
5. **Quality**: DRY, SOLID, readability

## Severities
- CRITICAL: blocking, security
- HIGH: potential bug
- MEDIUM: style, readability
- LOW: suggestion

## Verdict
APPROVED | CORRECTIONS REQUIRED | REFONTE NEEDED
```

### Example 4: Dynamic injection

```yaml
---
name: pr-review
description: Automatic review of the current PR
disable-model-invocation: true
context: fork
agent: Explore
---

## Context
- Diff: !`gh pr diff`
- Modified files: !`gh pr diff --name-only`

## Task
Analyze the changes and produce a structured review.
```

---

## Launch Checklist

### Content

- [ ] One file = one action (extract complex logic into a skill)
- [ ] Clear `description` and `argument-hint` if arguments
- [ ] Prerequisites documented (tools, required services)

### Invocation

- [ ] `disable-model-invocation: true` for commands with side effects
- [ ] No name conflict with an existing skill
- [ ] `argument-hint` to guide autocompletion

### Organization

- [ ] Semantic subfolders (`dev/`, `review/`, `deploy/`)
- [ ] Personal commands in `~/.claude/commands/` if multi-project
- [ ] Naming: `{action}.md` (kebab-case)

### Docker (if applicable)

- [ ] `-T` flag to disable TTY
- [ ] `2>&1 | cat` to capture all output
- [ ] Full command path in the container

---

## Resources

- [Official Documentation — Skills (Commands section)](https://code.claude.com/docs/en/skills)
- [Official Documentation — Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
