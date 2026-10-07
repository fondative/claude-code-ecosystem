# .claude/ Project Structure

## Complete File Tree

```
.claude/
├── README.md
├── settings.json
├── settings.local.json
├── agents/
│   ├── legacy-technical-analyzer.md      # Opus - Reverse engineering
│   ├── legacy-functional-analyzer.md     # Sonnet - Functional inventory
│   ├── legacy-functional-analyzer-auditor.md  # Haiku - Audit
│   ├── legacy-feature-analyzer.md        # Opus - 12-section spec
│   ├── legacy-feature-analyzer-refiner.md # Sonnet - Refinement
│   ├── backend-tasks-planner.md          # Sonnet - Backend planning
│   ├── backend-tasks-executor.md         # Sonnet - TDD implementation (acceptEdits)
│   ├── frontend-tasks-planner.md         # Sonnet - Frontend planning
│   ├── frontend-tasks-executor.md        # Sonnet - Frontend implementation + design (acceptEdits)
│   ├── conformity-reporter.md            # Sonnet - Scoring
│   └── health-check.md                   # Haiku - Diagnostics (plan)
├── skills/
│   ├── mod-analyze-legacy/SKILL.md          # Analysis pipeline (launcher)
│   ├── mod-migrate-feature/SKILL.md         # E2E migration (launcher)
│   ├── mod-generate-visualization/SKILL.md  # ECharts (called by mod-analyze-legacy)
│   ├── mod-generate-docs/                   # VitePress (launcher, also called by mod-migrate-feature for wiki sync)
│   │   ├── SKILL.md
│   │   └── references/                      # 4 templates
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
└── commands/
    ├── dev/
    │   ├── commit.md         # /dev/commit
    │   ├── install-stack.md  # /dev/install-stack
    │   ├── php-test.md       # /dev/php-test
    │   ├── php-lint.md       # /dev/php-lint
    │   ├── front-test.md     # /dev/front-test
    │   └── front-lint.md     # /dev/front-lint
    └── review/
        ├── symfony-review.md  # /review/symfony-review
        └── frontend-review.md # /review/frontend-review
```

## Settings: The Security Layer

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(docker compose exec -T app *)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add *)",
      "Bash(ls *)",
      "Bash(find *)",
      "Bash(mkdir *)",
      "Bash(npm *)",
      "Bash(cd *)",
      "Write(output/**)",
      "Edit(output/**)",
      "Write(*-wiki/**)",
      "Edit(*-wiki/**)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)"
    ],
    "deny": [
      "Write(/php-legacy/**)",
      "Edit(/php-legacy/**)",
      "Write(.env*)",
      "Edit(.env*)",
      "Bash(rm -rf *)"
    ]
  }
}
```

**Logic**: Free reading everywhere. Writing without confirmation only in `output/**` and generated wikis (`*-wiki/**`). The legacy and `.env` files are write-protected. Docker and read-only git commands are allowed; `git commit` and `git push` always ask for confirmation.

## Key Relationships

### Skills Inherited by Agents

| Agent | Inherited skills |
|-------|-----------------|
| `backend-tasks-planner` | `sym-api-conventions`, `sym-testing-conventions` |
| `backend-tasks-executor` | `sym-api-conventions`, `sym-testing-conventions` |
| `frontend-tasks-planner` | `front-app-conventions`, `front-testing-conventions` |
| `frontend-tasks-executor` | `front-app-conventions`, `front-testing-conventions`, `front-design-conventions` |
| `legacy-feature-analyzer` | `sym-api-conventions`, `front-app-conventions` |
| `legacy-feature-analyzer-refiner` | `sym-api-conventions`, `front-app-conventions` |
| `conformity-reporter` | `sym-api-conventions`, `sym-testing-conventions`, `front-app-conventions`, `front-testing-conventions`, `mod-conformity-conventions` |

### Rules and Their Settings Reinforcement

| Rule | Glob pattern | settings.json reinforcement |
|------|-------------|---------------------------|
| `legacy-readonly.md` | `php-legacy/**` | `deny: Write/Edit(php-legacy/**)` |
| `symfony-api.md` | `api-rest-symfony-target/**` | `allow: Bash(docker compose exec -T app *)` |
| `git.md` | (global) | `ask: Bash(git commit/push *)` |

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
  → prerequisite: target stacks installed (otherwise /dev/install-stack)
  → legacy-feature-analyzer (Opus)
  → backend-tasks-planner (Sonnet)
  → frontend-tasks-planner (Sonnet)
  → backend-tasks-executor (Sonnet)
  → frontend-tasks-executor (Sonnet)
  → conformity-reporter (Sonnet)
  → quality loop (if score < 80/100, max 2 iterations)
  → /mod-generate-docs <name> (wiki sync, if the wiki folder exists)
```
