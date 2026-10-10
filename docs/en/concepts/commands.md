# Commands

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Actions invocable by the user via `/name` |
| **Where** | `.claude/commands/` (project) or `~/.claude/commands/` (personal) |
| **Status** | Merged with [skills](/en/concepts/skills) — commands continue to work, skills are recommended for new workflows |
| **Priority** | A command and a skill with the same name → the skill wins |
| **Namespace** | Subfolder → prefix with `:` (`.claude/commands/dev/commit.md` → `/dev:commit`) |
| **Arguments** | Via `$ARGUMENTS`, `$0`, `$1`, `$name`, `${CLAUDE_SESSION_ID}`, `${CLAUDE_SKILL_DIR}`… |
| **What this page adds** | When to keep a command or switch to a skill, how to migrate, and the gaps found in the project's commands |

---

## The essentials in 2 minutes

A command (or slash command) is a **single Markdown file** in `.claude/commands/` that defines an action invocable via `/name`. Since the merger with skills, it accepts **the same [frontmatter](/en/reference/glossary#frontmatter)** as a skill, except `name` and `paths`; it cannot have support files. Skills are recommended for new workflows.

```
┌────────────────────────────────────────┐
│  User types: /dev:commit               │
│         │                              │
│         ▼                              │
│  Claude loads:                         │
│  .claude/commands/dev/commit.md        │
│         │                              │
│         ▼                              │
│  Runs the instructions:                │
│  1. git diff --staged                  │
│  2. Determine type/scope               │
│  3. Write the message                  │
│  4. Confirm with the user              │
│     → commit                           │
└────────────────────────────────────────┘
```

```markdown
<!-- .claude/commands/dev/php-test.md  →  /dev:php-test unit -->
---
description: Run backend tests via Docker Compose
argument-hint: "[unit|integration|functional|path]"
---
Run `docker compose exec -T app php bin/phpunit $ARGUMENTS 2>&1`
```

::: info This project's convention: `/dev/commit` → `/dev:commit`
<span class="chez-nous">In our project</span> the `CLAUDE.md` and the rules write `/dev:commit`, `/dev:php-test`, `/review:symfony-review`…: a `.claude/commands/dev/commit.md` file is invoked with **`/dev:commit`**. The `/dev/commit` notation is the old form, which matches no invocation. This page uses the actual notation.
:::

Four facts change the way you design a command:

1. **The name always comes from the path**: each subfolder becomes a prefix followed by `:`, and a `name:` field is ignored.
2. **A skill with the same name wins, without warning**: the command no longer runs.
3. **Claude can run a command like a skill**, unless it has `disable-model-invocation: true` — which also blocks it from running as a scheduled task (`/loop`, `/schedule`). Where to use it and where not to: [WARN-007](#warn-007).
4. **A single file, no support**: as soon as you need `references/`, scripts or a free name, it is a skill.

→ How it all works (equivalence with skills, scopes, namespaces, dynamic injection): [official documentation — Skills](https://code.claude.com/docs/en/skills) · all fields: [Skills — frontmatter](https://code.claude.com/docs/en/skills#frontmatter-reference).

---

## When to Use a Command vs a Skill?

```
Need support files (references, scripts)?
├── YES → SKILL (only format that supports it)
└── NO
    Need a free name (name field) or paths-based triggering?
    ├── YES → SKILL
    └── NO
        Existing command that works?
        ├── YES → Keep the command (no urgent migration)
        └── NO → Create a SKILL (modern format)
```

Recommended format: [Skills](/en/concepts/skills).

### When to Migrate to Skill

Migrate a command to a skill when:
- Need for reference files
- Need for executable scripts
- Need for `context: fork` (isolated execution)
- Need for a name independent of the path (`name`) or activation tied to files (`paths`)
- Creating a new workflow

::: tip Migrating from `commands/` to `skills/`
The migration is mechanical: `.claude/commands/dev/commit.md` becomes `.claude/skills/<name>/SKILL.md`, and the frontmatter is kept, **except `name:`, which must be removed**: a skill honors this field, and `name: commit` would expose `/commit`. Watch the **invocation name**: a skill takes the name of its folder (or of its `name` field), so `/dev:commit` will become `/dev-commit` (`skills/dev-commit/` folder) — remember to update CLAUDE.md and the rules that mention it. Before/after: [example 1](#example-1-dev-commit); strategy and steps chosen for the project: [Project commands](/en/examples/project-structure#project-commands).
:::

---

## Designing your commands well

### Dynamic injection `` !`…` `` {#dynamic-injection}

A `` !`command` `` line in the body of a command (or a skill) is a [dynamic injection](/en/reference/glossary#injection-dynamique): Claude Code runs the command **before** sending the text to the model and replaces the line with its output. Claude therefore receives the result, not the command.

```markdown
## Context
- Branch: !`git branch --show-current`
- Modified files: !`git status --short`
```

The command runs with your privileges, at invocation time. The `disableSkillShellExecution` setting (best set in [managed settings](/en/reference/glossary#managed), which users cannot override) turns this execution off: each command is then replaced with `[shell command execution disabled by policy]`.

### The project's actual configuration

::: info In our project
The project's 8 commands live in `.claude/commands/dev/` (6) and `.claude/commands/review/` (2). For example:

| File | Actual invocation | CLAUDE.md notation | `name:` (ignored) | `disable-model-invocation` |
|------|-------------------|--------------------|-------------------|----------------------------|
| `dev/commit.md` | `/dev:commit` | `/dev:commit` | absent | `true` |
| `dev/php-test.md` | `/dev:php-test` | `/dev:php-test` | absent | absent |

The full list and the migration chosen for these files: [Project commands](/en/examples/project-structure#project-commands).

What to read in it: the 8 files are 66 to 85 lines long and follow the same template; only `commit` uses `allowed-tools` and `` !`…` `` injection, the two reviews use `context: fork`; **none** declares `name:`, and only `commit` and `install-stack` reserve invocation for the user, tests and lint remaining runnable by Claude (see [WARN-006](#warn-006) and [WARN-007](#warn-007)).
:::

### Pitfalls to know

- **`name:` is ignored in a command**: the name comes from the file path. To choose the name freely, switch to a skill.
- **`/folder/file` is not the invocation syntax**: it is `/folder:file`.
- **Same name as a skill = command ignored**, without warning. Same name as a bundled skill = yours replaces it, but not its aliases (`/review` still runs the bundled version).
- **`allowed-tools` pre-approves, it does not restrict**; other tools remain available according to your permissions.
- **`disable-model-invocation: true` on a check** (tests, lint): see [WARN-007](#warn-007).
- **`` !`…` `` injection can be turned off** by `disableSkillShellExecution` (see [Dynamic injection](#dynamic-injection)): a command that depends on it must work without it, or say so.

Details and sources: [official documentation — Skills](https://code.claude.com/docs/en/skills).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001`: Command and Skill with the same name {#warn-001 .warn-title}
*Origin: official documentation.*

Having a command and a skill with the same name creates a silent conflict: the skill always wins.

::: danger Problem
```text
# ❌ — Name conflict
.claude/commands/review.md
.claude/skills/review/SKILL.md
# → The skill takes priority, the command is ignored
```
The command is silently ignored with no warning.
:::

::: info Solution
Choose one or the other, not both. If both exist, delete the command or rename it.
:::

---

#### `WARN-002`: Forgetting Docker flags (this project's convention) {#warn-002 .warn-title}
*Origin: a project rule (CLAUDE.md: "All backend commands via Docker Compose").*

When commands go through `docker compose exec`, leaving out `-T` makes Docker request a TTY, which blocks or garbles the output in a non-interactive context such as Claude's.

::: danger Problem
```bash
# ❌ — TTY allocation
docker compose exec app php bin/phpunit
```
The interactive TTY blocks or truncates the output.
:::

::: info Solution
```bash
# ✅ — No TTY, stderr visible, exit code preserved
docker compose exec -T app php bin/phpunit 2>&1
```
`-T` avoids TTY allocation; `2>&1` sends stderr into the output so Claude sees the errors.
:::

::: info In our project
The project's `CLAUDE.md` mandates the form `cd <BACKEND_TARGET> && docker compose exec -T app <commande> 2>&1`, **without `| cat`**: a pipeline returns the exit code of its last command, here `cat` (0), which **would hide the failure** of the Docker command. The `php-test`, `php-lint`, `front-test` and `front-lint` commands repeat the instruction ("Ne pas ajouter `| cat`").
:::

---

#### `WARN-003`: Command without description {#warn-003 .warn-title}
*Origin: official documentation (the description feeds the `/` menu and Claude's choice).*

A command without a description doesn't appear correctly in autocompletion and Claude doesn't know when to use it.

::: danger Problem
```yaml
# ❌ — Autocompletion shows nothing useful
---
argument-hint: "[suite]"
---
```
The user has no idea what this command does without opening the file.
:::

::: info Solution
```yaml
# ✅ — Clear description
---
description: Run backend tests via Docker Compose
argument-hint: "[unit|integration|functional]"
---
```
The description guides autocompletion and automatic delegation.
:::

---

#### `WARN-004`: Logic too complex {#warn-004 .warn-title}
*Origin: general good practice.*

A command with branching, conditions, and hundreds of lines becomes unmanageable and hard to maintain.

::: danger Problem
```markdown
<!-- ❌ .claude/commands/deploy.md — every branch in a single file -->
---
description: Deploys the application
argument-hint: "[staging|prod|rollback]"
---
If $0 = staging: build the image, push it to the test registry, restart...
Else if $0 = prod: check the branch is main, back up the database,
  run the migrations; if they fail, restore the backup, unless...
Else if $0 = rollback: find the previous image, ...
(+ 180 lines of special cases)
```
Growing complexity makes the command fragile and hard to debug.
:::

::: info Solution
```text
# ✅ — A skill: common steps in SKILL.md, per-case details loaded on demand
.claude/skills/deploy/
├── SKILL.md            # common steps + "read references/$0.md"
├── references/
│   ├── staging.md
│   ├── prod.md         # backup, migrations, restore
│   └── rollback.md
└── scripts/
    └── check-branch.sh
```
A command = a single file. If the logic overflows, it's a skill.
:::

---

#### `WARN-005`: Hidden dependencies {#warn-005 .warn-title}
*Origin: general good practice.*

A command that requires external tools without documenting them fails silently depending on the environment.

::: danger Problem
```yaml
# ❌ — Requires gh CLI + Docker but doesn't say so
---
description: Deploy
---
```
The user discovers missing dependencies at runtime.
:::

::: info Solution
```markdown
<!-- ✅ — Prerequisites declared AND checked in the body -->
---
description: Deploys the application via Docker
compatibility: Requires gh CLI and Docker
---
## Prerequisites
- gh: !`command -v gh || echo MISSING`
- Docker: !`docker compose version 2>&1 | head -1`
If a tool is MISSING or errors out: STOP and explain how to install it.
```
The `description` is used to pick the command: say what it does, not what it depends on. `compatibility` documents the prerequisites, and the body **checks** them before acting.
:::

---

#### `WARN-006`: `name:` in a command {#warn-006 .warn-title}
*Origin: experienced on this project (all 8 commands declared `name:`; corrected form: no `name:`).*

The field suggests the command name is chosen in the frontmatter. It is not: only the path counts.

::: danger Problem
```yaml
# ❌ — .claude/commands/dev/commit.md
---
name: commit          # ignored: the command is /dev:commit, not /commit
description: Commit changes following Conventional Commits
---
```
:::

::: info Solution
```yaml
# ✅ — No name in a command
---
description: Commit changes following Conventional Commits
---
```
For a name independent of the path, migrate to a skill (`.claude/skills/dev-commit/SKILL.md` → `/dev-commit`, see [example 1](#example-1-dev-commit)).
:::

---

#### `WARN-007`: Checks reserved for the user {#warn-007 .warn-title}
*Origin: experienced on this project (`php-test`, `php-lint`, `front-test`, `front-lint` used `disable-model-invocation: true`; corrected form: without this field).*

A test or lint command with manual-only invocation deprives Claude of a way to verify its own work, and cannot be run by a scheduled task (`/loop`, `/schedule`). Anthropic recommends the opposite: give Claude a check it can run itself ("Give Claude a check it can run: tests, a build…", [Best practices](https://code.claude.com/docs/en/best-practices#give-claude-a-way-to-verify-its-work)).

::: danger Problem
```yaml
# ❌ — .claude/commands/dev/php-test.md
---
description: Run backend tests via Docker Compose
disable-model-invocation: true   # Claude cannot run the tests; neither can /loop
---
```
:::

::: info Solution
```yaml
# ✅ — Check without side effects: Claude can run it
---
description: Run backend tests via Docker Compose
argument-hint: "[unit|integration|functional|path]"
---
```
Without `disable-model-invocation`, Claude can run the tests and iterate until green. Keep `disable-model-invocation: true` for commands with side effects (`commit`, `install-stack`).
:::

---

#### `WARN-008`: Documenting an invocation that doesn't exist {#warn-008 .warn-title}
*Origin: experienced on this project (CLAUDE.md, the `git` rule and `commit.md` wrote `/dev/commit`; corrected form: `/dev:commit`).*

The instruction "ALWAYS use `/dev/commit`" refers to a name Claude Code does not expose: in the `/` menu as for Claude, the command is called `/dev:commit`.

::: danger Problem
```markdown
<!-- ❌ CLAUDE.md / .claude/rules/git.md -->
For every commit: ALWAYS use the `/dev/commit` command.
```
:::

::: info Solution
```markdown
<!-- ✅ The actual notation: folder, colon, file -->
For every commit: ALWAYS use the `/dev:commit` command.
```
After any move or migration of a command, search for its old name in CLAUDE.md, the rules and the other commands.
:::

---

## Ready-to-use examples

<span class="chez-nous">In our project</span> examples 2 and 3 reproduce (abridged) the project's files, without a `name` field: it would be **ignored** for a command (the name comes from the path). Example 1 is an improved version of `/dev:commit`.

### Example 1: /dev:commit

```markdown
---
description: Creates a Conventional Commits commit from the current changes
disable-model-invocation: true
argument-hint: "[message]"
allowed-tools: Bash(git add *), Bash(git status *), Bash(git commit *)
---

## Context
- Status: !`git status`
- Diff (staged and unstaged): !`git diff HEAD`
- Branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Task
1. Determine the type (feat, fix, refactor, docs, test, chore...) and the scope
2. Write `type(scope): description` (the why, not the what), taking $ARGUMENTS into account
3. Propose the message and WAIT for validation before `git commit`
4. Add the attribution line provided by Claude Code (do not hard-code the model name)

⚠️ If a pre-commit hook fails → fix → NEW commit (NOT amend)
```

::: tip Reference model: `commit-commands`
This version follows the `commit` command of Anthropic's [`commit-commands`](https://github.com/anthropics/claude-code/blob/main/plugins/commit-commands/commands/commit.md) plugin: the context (`git status`, `git diff HEAD`, branch, recent commits) is **injected** before the prompt reaches the model, which saves Claude round trips, and `allowed-tools` pre-approves only the git commands it needs. A hard-coded model name (`Claude Opus 5.5`) becomes wrong at the next model change.
:::

**The same command migrated to a skill.** The file is moved (`git mv .claude/commands/dev/commit.md .claude/skills/dev-commit/SKILL.md`) and is now invoked as `/dev-commit`; the frontmatter above stays valid as is. The skill can also carry supporting files, loaded on demand:

```
.claude/skills/dev-commit/
├── SKILL.md
└── types.md        # feat, fix, refactor, test, docs, chore, style, perf + examples
```

| Change | Reason |
|---|---|
| No `name` field | The `dev-commit` folder already gives the name; `name: commit` would expose `/commit` (now honored in a skill) |
| Type list → `types.md` | Shorter `SKILL.md`, details loaded on demand ("Choose type and scope according to `[types.md](types.md)`") |
| Internal examples updated | `/dev:commit` → `/dev-commit` in the file body |

### Example 2: /dev:php-test

```markdown
---
description: Lance les tests backend PHPUnit via Docker Compose. Utiliser apres toute modification du code backend pour verifier que les tests passent.
argument-hint: "[unit|integration|functional|path]"
---

# PHP Tests

Command: `cd <BACKEND_TARGET> && docker compose exec -T app php bin/phpunit 2>&1`

## Arguments
- (empty): all tests
- `unit`: `--testsuite=unit`
- `integration`: `--testsuite=integration`
- `functional`: `--testsuite=functional`
- path: specific test file
```

::: info This project's convention
The command follows the CLAUDE.md form, without the `| cat` that would hide PHPUnit's exit code (see [WARN-002](#warn-002)), and does not declare `disable-model-invocation`: Claude can run the tests itself (see [WARN-007](#warn-007)). The setting is reserved for `commit` and `install-stack`.
:::

### Example 3: /review:symfony-review

```markdown
---
description: Review du code backend Symfony contre les conventions sym-*. Utiliser quand l'utilisateur demande une review backend ou avant de proposer un commit backend important.
argument-hint: "[path]"
context: fork
agent: general-purpose
background: false
---

# Symfony Code Review

## Process
1. **Conventions**: load the `sym-api-conventions` and `sym-testing-conventions` skills (they are authoritative)
2. **Scope**: `$ARGUMENTS`, otherwise `git diff HEAD`
3. **Also check**: security (prepared statements, validation through DTOs, JWT authorization), no business logic in controllers, no dead code

## Severities
- CRITICAL, HIGH, MEDIUM, LOW (citing the convention or security point violated)

## Verdict
APPROVED | CORRECTIONS REQUIRED | REWORK REQUIRED
```

::: tip Why `context: fork` for a review
A reviewer in a fresh context sees only the code and the criteria, not the reasoning that produced the change: it judges the result on its own terms. See [Add an adversarial review step](https://code.claude.com/docs/en/best-practices#add-an-adversarial-review-step).
:::

### Example 4: Dynamic injection

A command accepts the same fields as a skill (`context: fork`, `agent`, `allowed-tools`) and the same `` !`…` `` injection: see [example 3 on the Skills page](/en/concepts/skills#example-3-skill-with-dynamic-injection), which summarizes a PR from `gh pr diff`. Without `allowed-tools: Bash(gh *)`, the `gh` calls Claude then makes trigger a permission prompt.

---

## Before going live

### Content

- [ ] One file = one action (extract complex logic into a skill)
- [ ] Clear `description` and `argument-hint` if arguments
- [ ] Prerequisites declared (`compatibility`) and **checked in the body**, not in the description
- [ ] Useful context injected (`` !`git status` ``…) and required commands in `allowed-tools`
- [ ] No `name:` field (ignored in a command)

### Invocation

- [ ] `disable-model-invocation: true` for commands with side effects (commit, deploy), not for checks (tests, lint)
- [ ] Reviews in `context: fork`
- [ ] No name conflict with an existing skill (nor with a bundled skill, unless replacement is intended)
- [ ] Invocation documented with the actual notation (`/folder:command`) in CLAUDE.md, the rules and the other commands

### Organization

- [ ] Semantic subfolders (`dev/`, `review/`, `deploy/`) → namespaces `dev:`, `review:`…
- [ ] Personal commands in `~/.claude/commands/` if multi-project
- [ ] Naming: `{action}.md` (kebab-case)
- [ ] New workflows created directly as skills ([when to migrate](#when-to-migrate-to-skill))

### Docker (this project's convention)

- [ ] `-T` flag to avoid TTY allocation
- [ ] `2>&1` so that errors show up in the output
- [ ] No `| cat`: `cat`'s exit code (0) would hide the failure
- [ ] Command run via `cd <BACKEND_TARGET> && docker compose exec -T app <binary> 2>&1` (e.g. `php bin/phpunit`)

---

## Going further

- [Project commands](/en/examples/project-structure#project-commands) — the project's 8 commands and their migration to skills
- [Skills](/en/concepts/skills) — the recommended format for new workflows
- [`commit-commands` plugin (Anthropic)](https://github.com/anthropics/claude-code/tree/main/plugins/commit-commands) — reference commands with context injection
- [Official Documentation — Skills (Commands section)](https://code.claude.com/docs/en/skills) · [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) · [Best practices](https://code.claude.com/docs/en/best-practices)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
