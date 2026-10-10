# .claude/ Project Structure

::: tip What you will find on this page
The **actual** Claude Code configuration of the modernisation project: every file, what it does, and how everything fits together. For the generic layout that applies to any project, see [.claude/ Architecture](/en/introduction/architecture) first.
:::

## Overview

| Component | Count | Breakdown |
|-----------|-------|-----------|
| Agents | 11 | 5 analysis, 2 planning, 2 implementation, 1 conformity, 1 diagnostic (`health-check`) |
| Skills | 12 | 4 launchers, 6 convention skills, 2 about Claude Code (`claude-code-`) |
| Rules | 7 | 1 always loaded (`git`) + 6 targeted by `paths` |
| Commands | 8 | 6 `dev:` + 2 `review:` (former format, see below) |
| Skill references | 41 | `.md` files in the `references/` folders: 15 backend + 3 backend testing + 9 frontend + 3 frontend testing + 4 conformity + 3 docs generation + 1 visualization + 3 skill-command-model. `mod-generate-docs/references/` also holds `package.json`, `vitepress-config.ts` and `wiki-src/` (9 sources copied into the wiki: TS data, Vue components, CSS, Map page) |
| Hooks | 1 | `PreToolUse` on `Bash` → `hooks/block-rm.sh`: refuses recursive deletions (`rm -r`, `git rm -r` without `--cached`, `find -delete`), requires `jq`, tested by `hooks/block-rm.test.sh` |
| MCP servers | 0 | No `.mcp.json` |

At the repository root, next to `.claude/`, `CLAUDE.md` is the **single source of the project paths** (`SOURCE_PROJECT`, `BACKEND_TARGET`…): agents and skills read them from there instead of hardcoding them. Three places cannot read `CLAUDE.md` and therefore hold real paths: the `Edit(...)` rules in `settings.json`, the rules' `paths:` and `STACK_DIRS` in the `scripts/install-stack.sh` script. The `health-check` agent checks that they stay aligned with the paths table.

## Complete File Tree

```
.claude/
├── README.md
├── settings.json                          # Team permissions, env and hooks (committed)
├── settings.local.json                    # Personal settings (not committed)
├── agents/
│   ├── legacy-technical-analyzer.md      # Opus - Reverse engineering
│   ├── legacy-functional-analyzer.md     # Sonnet - Functional inventory
│   ├── legacy-functional-analyzer-auditor.md  # Haiku - Audit
│   ├── legacy-feature-analyzer.md        # Opus - 14-section spec
│   ├── legacy-feature-analyzer-refiner.md # Sonnet - Refinement
│   ├── backend-tasks-planner.md          # Sonnet - Backend planning
│   ├── backend-tasks-executor.md         # Sonnet - TDD implementation (acceptEdits)
│   ├── frontend-tasks-planner.md         # Sonnet - Frontend planning
│   ├── frontend-tasks-executor.md        # Sonnet - Frontend implementation + design (acceptEdits)
│   ├── conformity-reporter.md            # Sonnet - Scoring
│   └── health-check.md                   # Haiku - Diagnostics + hardcoded paths (plan)
├── skills/
│   ├── mod-analyze-legacy/SKILL.md          # Analysis pipeline (launcher)
│   ├── mod-migrate-feature/SKILL.md         # E2E migration (launcher)
│   ├── mod-generate-visualization/          # ECharts (called by mod-analyze-legacy)
│   │   ├── SKILL.md
│   │   └── references/
│   │       └── echarts-spec.md
│   ├── mod-generate-docs/                   # VitePress (launcher, also called by mod-migrate-feature for wiki sync)
│   │   ├── SKILL.md
│   │   └── references/                      # 14 files
│   │       ├── home-page.md
│   │       ├── migration-status.md
│   │       ├── theme-and-styles.md
│   │       ├── package.json
│   │       ├── vitepress-config.ts
│   │       └── wiki-src/                    # Copied into the wiki: computed dashboards
│   │           ├── data/                    # migration.data.ts, migration-states.ts
│   │           ├── pages/                   # mapping-index.md (Map)
│   │           └── theme/                   # index.ts, custom.css, components/Migration*.vue (4)
│   ├── mod-conformity-conventions/          # Scoring and reports
│   │   ├── SKILL.md
│   │   └── references/                      # 4 files
│   │       ├── scoring-methodology.md
│   │       ├── report-template.md
│   │       ├── version-management.md
│   │       └── issue-reporting.md
│   ├── sym-api-conventions/
│   │   ├── SKILL.md                         # Backend conventions
│   │   └── references/                      # 15 files
│   │       ├── getting-started.md
│   │       ├── request-lifecycle.md
│   │       ├── create-entity.md
│   │       ├── create-dto.md
│   │       ├── create-mapper.md
│   │       ├── create-repository.md
│   │       ├── create-service.md
│   │       ├── create-controller.md
│   │       ├── api-reference.md
│   │       ├── exception-handling.md
│   │       ├── database-setup.md
│   │       ├── jwt-auth.md
│   │       ├── email-service.md
│   │       ├── logging.md
│   │       └── debugging.md
│   ├── sym-testing-conventions/
│   │   ├── SKILL.md                         # TDD and strategies
│   │   └── references/                      # 3 files
│   │       ├── tdd-conventions.md
│   │       ├── testing.md
│   │       └── mocking-strategies.md
│   ├── front-app-conventions/
│   │   ├── SKILL.md                         # Frontend conventions
│   │   └── references/                      # 9 files
│   │       ├── getting-started.md
│   │       ├── architecture.md
│   │       ├── code-standards.md
│   │       ├── api-integration.md
│   │       ├── authentication.md
│   │       ├── state-management.md
│   │       ├── routing.md
│   │       ├── features.md
│   │       └── styling.md
│   ├── front-design-conventions/
│   │   └── SKILL.md                         # Figma design conventions
│   ├── front-testing-conventions/
│   │   ├── SKILL.md                         # TDD and strategies
│   │   └── references/                      # 3 files
│   │       ├── tdd-conventions.md
│   │       ├── testing.md
│   │       └── mocking-strategies.md
│   ├── claude-code-parallel-agents/
│   │   └── SKILL.md                         # Parallel agents
│   └── claude-code-skill-command-model/
│       ├── SKILL.md                         # Skill vs command, .claude/ audit
│       └── references/
│           ├── framework.md
│           ├── skill-template.md
│           └── command-template.md
├── rules/
│   ├── legacy-readonly.md    # php-legacy/** → READ ONLY
│   ├── symfony-api.md        # api-rest-symfony-target/** → Conventions
│   ├── frontend.md           # app-react-target/** → Delegation to skills
│   ├── output-format.md      # output/** → Markdown format
│   ├── design.md             # output/design/** → Figma JSON
│   ├── docs.md               # api-rest-symfony-target/docs/** → OpenAPI
│   └── git.md                # (global) → Conventional Commits
├── commands/                 # Former format of skills (still read)
│   ├── dev/
│   │   ├── commit.md         # /dev:commit
│   │   ├── install-stack.md  # /dev:install-stack
│   │   ├── php-test.md       # /dev:php-test
│   │   ├── php-lint.md       # /dev:php-lint
│   │   ├── front-test.md     # /dev:front-test
│   │   └── front-lint.md     # /dev:front-lint
│   └── review/
│       ├── symfony-review.md  # /review:symfony-review
│       └── frontend-review.md # /review:frontend-review
├── hooks/
│   ├── block-rm.sh           # PreToolUse (Bash): refuses recursive deletions
│   └── block-rm.test.sh      # Blocked and allowed cases (bash .claude/hooks/block-rm.test.sh)
└── scripts/
    └── install-stack.sh      # Run by /dev:install-stack (--force option)
```

## Settings: The Security Layer

Excerpt from `.claude/settings.json` (the `allow` whitelist is shortened; the other sections are complete):

```jsonc
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "includeGitInstructions": false,
  "env": {
    "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR": "1"
  },
  "permissions": {
    "allow": [
      "Bash(docker compose exec -T app php bin/phpunit *)",
      "Bash(docker compose exec -T app php bin/console debug:router *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:migrate *)",
      // … 19 other bin/console subcommands (about, cache:*, debug:*, router:match,
      //   lint:*, make:*, doctrine:database:create, doctrine:migrations:*, …)
      "Bash(docker compose exec -T app php vendor/bin/phpcs *)",
      "Bash(docker compose exec -T app php vendor/bin/phpcbf *)",
      "Bash(docker compose ps *)",
      "Bash(docker compose up -d *)",
      "Bash(git add *)",
      "Bash(mkdir *)",
      "Bash(jq empty *)",
      "Bash(npm run lint *)",
      "Bash(npm run typecheck *)",
      // … npm run format, format:check, test, test:unit, test:integration,
      //   test:coverage, build, docs:build
      "Bash(npm test *)",
      "Bash(npm ci *)",
      "Edit(/output/**)",
      "Edit(/legacy-wiki/**)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(docker compose exec -T app php bin/console doctrine:database:drop *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:drop *)",
      "Bash(docker compose exec -T app php bin/console doctrine:fixtures:load *)",
      "Bash(docker compose exec -T app php bin/console doctrine:query:sql *)",
      "Bash(docker compose exec -T app php bin/console dbal:run-sql *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:update *)"
    ],
    "deny": [
      "Edit(/php-legacy/**)",
      "Edit(.env*)",
      "Read(.env*)",
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**Logic**:
- **Reading**: reading files, searching (Grep, Glob) and running read-only commands (`git status`, `git diff`, `git log`…) does not ask for permission in the working directory. This is Claude Code's default behavior ([Permissions](https://code.claude.com/docs/en/permissions)), not an effect of `settings.json`. `.env` files (secrets) can be neither read nor edited.
- **Commands**: a **whitelist** rather than a wildcard. In the container, only `phpunit`, `phpcs`/`phpcbf` and a selection of `bin/console` subcommands run without confirmation; on the frontend side, `npm ci`, `npm test` and named `npm run` scripts. The six destructive database commands (`doctrine:database:drop`, `doctrine:schema:drop`, `doctrine:schema:update`, `doctrine:fixtures:load`, `doctrine:query:sql`, `dbal:run-sql`), `git commit` and `git push` always ask for confirmation.
- **Writing**: without confirmation in `/output/**` and `/legacy-wiki/**` (the leading `/` means the project root; `legacy-wiki` is the `WIKI_TARGET` from `CLAUDE.md`). The legacy code (`php-legacy/`) cannot be edited.
- **Recursive deletions**: blocked twice, by `deny: Bash(rm -rf *)` and by the `block-rm.sh` hook, which also catches the variants (`rm -r`, `rm -fr`, `git rm -r` without `--cached`, `find -delete`, `rm` behind `sudo`, `xargs` or `sh -c`…). The hook is a safety net, not a security boundary: the script itself lists what it cannot see. → [Hooks](/en/concepts/hooks)

::: info In our project
- `"includeGitInstructions": false` removes Claude Code's built-in git instructions: commit conventions come from the `git` rule and `/dev:commit`.
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1` brings the shell back to the project root after each Bash command: pipeline commands are therefore written `cd <target> && <command> 2>&1`.

Exact role of these two settings: [official settings documentation](https://code.claude.com/docs/en/settings); use in the project: [Settings](/en/concepts/settings).
:::

::: info Why `Edit(...)` and not `Write(...)`
Claude Code only checks file paths against `Read(...)` and `Edit(...)` rules; an `Edit` rule covers every tool that writes (including `Write`). A `Write(...)` rule would be accepted but never applied. → [Settings](/en/concepts/settings)
:::

## Key Relationships

### Two Kinds of Skills

The project uses skills in two ways. They are not two technical types: the frontmatter decides who can trigger them.

| Kind | Role | Who triggers it | Frontmatter setting | Project skills |
|------|------|-----------------|---------------------|----------------|
| **Convention skill** ("passive") | Pass coding rules on to agents | Agents that list it in their `skills:` field, or Claude when it finds it relevant — **not** the user | `user-invocable: false` (hidden from the `/` menu) | `sym-*`, `front-*`, `mod-conformity-conventions` |
| **Launcher skill** | Run a complete workflow by starting agents | **You**, by typing `/name` | `disable-model-invocation: true` (Claude does not start it on its own) | `/mod-analyze-legacy`, `/mod-migrate-feature` |

`mod-generate-docs` and `mod-generate-visualization` have neither setting: you can run them, and the launcher skills call them too. The same goes for the two `claude-code-*` skills (help maintaining `.claude/`: parallel agents, skill/command classification).

### Skills Inherited by Agents

Each agent starts with these skills already loaded (`skills:` field of its frontmatter):

| Agent | Inherited skills |
|-------|-----------------|
| `backend-tasks-planner` | `sym-api-conventions`, `sym-testing-conventions` |
| `backend-tasks-executor` | `sym-api-conventions`, `sym-testing-conventions` |
| `frontend-tasks-planner` | `front-app-conventions`, `front-testing-conventions`, `front-design-conventions` |
| `frontend-tasks-executor` | `front-app-conventions`, `front-testing-conventions`, `front-design-conventions` |
| `conformity-reporter` | `sym-api-conventions`, `sym-testing-conventions`, `front-app-conventions`, `front-testing-conventions`, `mod-conformity-conventions` |

The legacy analysis agents (`legacy-*`) and `health-check` have no `skills:` field: they describe the existing code without applying the target's conventions.

### Rules and Their Settings Reinforcement

A rule is an **instruction** (Claude follows it, with no guarantee); `settings.json` **enforces**. The important rules are therefore backed by a permission:

| Rule | Glob pattern | settings.json reinforcement |
|------|-------------|---------------------------|
| `legacy-readonly.md` | `php-legacy/**` | `deny: Edit(/php-legacy/**)` |
| `symfony-api.md` | `api-rest-symfony-target/**` | `allow`: whitelist of `phpunit` / `bin/console` / `phpcs` in the container; `ask`: destructive Doctrine commands |
| `git.md` | (global) | `ask: Bash(git commit/push *)`: the rule forbids committing outside the `/mod-migrate-feature` launcher, and `ask` has each batch commit approved |
| (no rule) | — | Recursive deletions: `deny: Bash(rm -rf *)` + `block-rm.sh` hook (`rm -r`, `git rm -r` without `--cached`, `find -delete`) |

### Launcher Skills Pipeline

```
/mod-analyze-legacy
  → legacy-technical-analyzer (Opus)
  → legacy-functional-analyzer (Sonnet)
  → legacy-functional-analyzer-auditor (Haiku)
  → legacy-feature-analyzer x N in batch (Opus, optional)
  → /mod-generate-visualization
  → wiki sync (if the wiki folder exists)

/mod-migrate-feature <name>
  → prerequisite: target stacks installed (otherwise /dev:install-stack)
  → legacy-feature-analyzer (Opus) → decisions on deviations from the legacy (you)
  → /mod-generate-docs <name> (spec wiki sync, if the wiki folder exists)
  → backend-tasks-planner (Sonnet)
  → frontend-tasks-planner (Sonnet)
  → /mod-generate-docs <name> (planning wiki sync)
  → backend-tasks-executor (Sonnet), in batches of 3 tasks: tests green → batch commit (ask)
  → frontend-tasks-executor (Sonnet), same
  → conformity-reporter (Sonnet) → report commit
  → quality loop (if score < 80/100: 1 correction pass in batches, then V2 report; no V3)
  → /mod-generate-docs <name> (wiki sync, if the wiki folder exists)
```

`Blocked` tasks and the `Decision` line, resuming an interrupted batch, final pass without tasks: see [Pipeline](/en/examples/pipeline).

### Example: what happens during `/mod-migrate-feature cart`

1. You type `/mod-migrate-feature cart`: the launcher skill loads (Claude would not have started it on its own).
2. It checks that the target stacks exist, then hands the specification to `legacy-feature-analyzer`.
3. The planners split the work; `backend-tasks-executor` starts with `sym-api-conventions` and `sym-testing-conventions` already loaded.
4. As soon as the executor edits a file in `api-rest-symfony-target/`, the `symfony-api` rule is added to its context.
5. If it tried to edit `php-legacy/`, the `deny` rule in `settings.json` would block the action, whatever it decides.
6. After each batch of 3 tasks, the launcher reruns the tests: green, it runs `git commit` (you approve, `ask` rule); red, it stops without committing.
7. `conformity-reporter` scores the result; below 80/100, the executors fix it once (batches of 3 corrections, each committed), then `conformity-reporter` produces a V2 report; below 80/100 in V2, the pipeline stops for human intervention.

## Project commands {#project-commands}

The 8 files in `commands/` use the former format of skills: they still work, but accept neither `name` nor `paths` and cannot have supporting files. A subfolder becomes a prefix separated by `:`: `commands/dev/commit.md` is invoked with **`/dev:commit`** (writing `/dev/commit` would document an invocation that doesn't exist: [Commands, WARN-008](/en/concepts/commands#warn-008)). Why migrate, differences between the two formats, naming rule: [Commands](/en/concepts/commands#when-to-migrate-to-skill).

Who triggers them:
- **Reserved for the user** (`disable-model-invocation: true`): `/dev:commit` and `/dev:install-stack`.
- **Also triggered by Claude**: the four `dev:` test and lint commands (their `description` says "Use after…"); the `/mod-migrate-feature` launcher reuses the success criterion of `/dev:php-test` for its checkpoints.
- **Run separately**: the two `review:` commands run in `context: fork` (`general-purpose` agent).

If the eight commands migrate to skills, the mapping would be:

| Current file | Current invocation | Target skill | Future invocation |
|---|---|---|---|
| `commands/dev/commit.md` | `/dev:commit` | `skills/dev-commit/` | `/dev-commit` |
| `commands/dev/install-stack.md` | `/dev:install-stack` | `skills/dev-install-stack/` | `/dev-install-stack` |
| `commands/dev/php-test.md` | `/dev:php-test` | `skills/dev-php-test/` | `/dev-php-test` |
| `commands/dev/php-lint.md` | `/dev:php-lint` | `skills/dev-php-lint/` | `/dev-php-lint` |
| `commands/dev/front-test.md` | `/dev:front-test` | `skills/dev-front-test/` | `/dev-front-test` |
| `commands/dev/front-lint.md` | `/dev:front-lint` | `skills/dev-front-lint/` | `/dev-front-lint` |
| `commands/review/symfony-review.md` | `/review:symfony-review` | `skills/symfony-review/` | `/symfony-review` |
| `commands/review/frontend-review.md` | `/review:frontend-review` | `skills/frontend-review/` | `/frontend-review` |

### Migration strategy (option)

Migrating is an option, not a requirement: commands are still read. If the team goes ahead:

- **Prefix in the folder name** (`dev-commit`): simple, and the visual grouping is kept in the `/` menu. This is the recommended strategy.
- Rejected: the **short name** (`commit`), which risks clashing with another skill or a built-in command (a project skill replaces the built-in command of the same name).
- Rejected: **keeping `/dev:commit` through a plugin** (`.claude/skills/dev/` folder with `.claude-plugin/plugin.json`, loaded as plugin `dev@skills-dir`), heavier: workspace trust required, check it is enabled in `/plugin`. See [Plugins](/en/concepts/plugins).
- **Gradual migration**, file by file: as long as a command is not migrated, it is still read; as soon as a skill has the same name, the skill wins.

### Project-specific steps

Moving a file and adapting its frontmatter are illustrated by [Commands example 1](/en/concepts/commands#example-1-dev-commit). What is specific to the project:

1. **Update `CLAUDE.md`**: "Commandes techniques" section (`/dev:commit` → `/dev-commit`, etc.) and any mention in the other sections.
2. **Update the `git` rule** (`.claude/rules/git.md`): replace `/dev:commit` with `/dev-commit`.
3. **Update `mod-migrate-feature`**: its batch commits follow "the format of `.claude/commands/dev/commit.md`", its prerequisite points to `/dev:install-stack` and its checkpoints to the `/dev:php-test` criterion.
4. **Update the other cross-references**: `.claude/README.md`, examples inside the files, this wiki.
5. **Check**: `/skills` lists the new skills, and `/dev-commit` appears in the `/` menu.

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
