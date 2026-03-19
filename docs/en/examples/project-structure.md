# .claude/ Project Structure

## Complete File Tree

```
.claude/
├── settings.json
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
│   ├── modernization/
│   │   ├── analyze-legacy/SKILL.md       # Analysis pipeline
│   │   ├── migrate-feature/SKILL.md      # E2E migration
│   │   ├── generate-visualization/SKILL.md  # ECharts
│   │   ├── generate-docs/SKILL.md        # VitePress
│   │   └── conformity-conventions/       # Scoring and reports
│   │       ├── SKILL.md
│   │       └── references/               # 4 files
│   │           ├── scoring-methodology.md
│   │           ├── report-template.md
│   │           ├── version-management.md
│   │           └── issue-reporting.md
│   ├── symfony/
│   │   ├── api-conventions/
│   │   │   ├── SKILL.md                  # Backend conventions
│   │   │   └── references/               # 15 files
│   │   │       ├── getting-started.md
│   │   │       ├── request-lifecycle.md
│   │   │       ├── create-entity.md
│   │   │       ├── create-dto.md
│   │   │       ├── create-mapper.md
│   │   │       ├── create-repository.md
│   │   │       ├── create-service.md
│   │   │       ├── create-controller.md
│   │   │       ├── api-reference.md
│   │   │       ├── exception-handling.md
│   │   │       ├── database-setup.md
│   │   │       ├── jwt-auth.md
│   │   │       ├── email-service.md
│   │   │       ├── logging.md
│   │   │       └── debugging.md
│   │   └── testing-conventions/
│   │       ├── SKILL.md                  # TDD and strategies
│   │       └── references/               # 3 files
│   │           ├── tdd-conventions.md
│   │           ├── testing.md
│   │           └── mocking-strategies.md
│   ├── frontend/
│   │   ├── app-conventions/
│   │   │   ├── SKILL.md                  # Frontend conventions
│   │   │   └── references/               # 9 files
│   │   │       ├── getting-started.md
│   │   │       ├── architecture.md
│   │   │       ├── code-standards.md
│   │   │       ├── api-integration.md
│   │   │       ├── authentication.md
│   │   │       ├── state-management.md
│   │   │       ├── routing.md
│   │   │       ├── features.md
│   │   │       └── styling.md
│   │   ├── design-conventions/
│   │   │   └── SKILL.md                  # Figma design conventions
│   │   └── testing-conventions/
│   │       ├── SKILL.md                  # TDD and strategies
│   │       └── references/               # 3 files
│   │           ├── tdd-conventions.md
│   │           ├── testing.md
│   │           └── mocking-strategies.md
│   └── claude-code-skill-command-model/
│       ├── SKILL.md                      # Templates
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
    │   └── php-lint.md       # /dev/php-lint
    └── review/
        ├── symfony-review.md  # /review/symfony-review
        └── frontend-review.md # /review/frontend-review
```

## Settings: The Security Layer

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose exec *)",
      "Bash(git status)", "Bash(git diff *)",
      "Bash(git log *)", "Bash(git add *)",
      "Bash(ls *)", "Bash(find *)", "Bash(mkdir *)",
      "Bash(npm *)"
    ],
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

**Logic**: Free reading everywhere. Writing allowed everywhere except in the legacy. Docker Compose and git authorized without confirmation.

## Key Relationships

### Skills Inherited by Agents

| Agent | Inherited skills |
|-------|-----------------|
| `backend-tasks-planner` | `symfony/api-conventions`, `symfony/testing-conventions` |
| `backend-tasks-executor` | `symfony/api-conventions`, `symfony/testing-conventions` |
| `frontend-tasks-planner` | `frontend/app-conventions`, `frontend/testing-conventions` |
| `frontend-tasks-executor` | `frontend/app-conventions`, `frontend/testing-conventions`, `frontend/design-conventions` |
| `legacy-feature-analyzer` | `symfony/api-conventions`, `frontend/app-conventions` |
| `legacy-feature-analyzer-refiner` | `symfony/api-conventions`, `frontend/app-conventions` |
| `conformity-reporter` | `symfony/api-conventions`, `symfony/testing-conventions`, `frontend/app-conventions`, `frontend/testing-conventions`, `modernization/conformity-conventions` |

### Rules and Their Settings Reinforcement

| Rule | Glob pattern | settings.json reinforcement |
|------|-------------|---------------------------|
| `legacy-readonly.md` | `php-legacy/**` | `deny: Write/Edit(php-legacy/**)` |
| `symfony-api.md` | `api-rest-symfony-target/**` | `allow: Bash(docker compose *)` |
| `git.md` | (global) | `allow: Bash(git *)` |

### Launcher Skills Pipeline

```
/modernization/analyze-legacy
  → legacy-technical-analyzer (Opus)
  → legacy-functional-analyzer (Sonnet)
  → legacy-functional-analyzer-auditor (Haiku)

/modernization/migrate-feature <name>
  → legacy-feature-analyzer (Opus)
  → backend-tasks-planner (Sonnet)
  → frontend-tasks-planner (Sonnet)
  → backend-tasks-executor (Sonnet)
  → frontend-tasks-executor (Sonnet)
  → conformity-reporter (Sonnet)
  → quality loop (if score < 80/100, max 2 iterations)
```
