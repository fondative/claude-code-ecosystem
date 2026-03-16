# Structure du projet .claude/

## Arborescence complète

```
.claude/
├── settings.json
├── agents/
│   ├── legacy-technical-analyzer.md      # Opus - Reverse engineering
│   ├── legacy-functional-analyzer.md     # Sonnet - Inventaire fonctionnel
│   ├── legacy-functional-analyzer-auditor.md  # Haiku - Audit
│   ├── legacy-feature-analyzer.md        # Opus - Spec 12 sections
│   ├── legacy-feature-analyzer-refiner.md # Sonnet - Affinement
│   ├── backend-tasks-planner.md          # Sonnet - Planification backend
│   ├── backend-tasks-executor.md         # Sonnet - Implementation TDD (acceptEdits)
│   ├── frontend-tasks-planner.md         # Sonnet - Planification frontend
│   ├── frontend-tasks-executor.md        # Sonnet - Implementation frontend + design (acceptEdits)
│   ├── conformity-reporter.md            # Sonnet - Scoring
│   ├── documentation-generator.md        # Haiku - VitePress
│   └── health-check.md                   # Haiku - Diagnostics (plan)
├── skills/
│   ├── modernization/
│   │   ├── analyze-legacy/SKILL.md       # Pipeline d'analyse
│   │   ├── migrate-feature/SKILL.md      # Migration E2E
│   │   ├── generate-visualization/SKILL.md  # ECharts
│   │   ├── generate-docs/SKILL.md        # VitePress
│   │   └── conformity-conventions/       # Scoring et rapports
│   │       ├── SKILL.md
│   │       └── references/               # 4 fichiers
│   │           ├── scoring-methodology.md
│   │           ├── report-template.md
│   │           ├── version-management.md
│   │           └── issue-reporting.md
│   ├── symfony/
│   │   ├── api-conventions/
│   │   │   ├── SKILL.md                  # Conventions backend
│   │   │   └── references/               # 15 fichiers
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
│   │       ├── SKILL.md                  # TDD et stratégies
│   │       └── references/               # 3 fichiers
│   │           ├── tdd-conventions.md
│   │           ├── testing.md
│   │           └── mocking-strategies.md
│   ├── frontend/
│   │   ├── app-conventions/
│   │   │   ├── SKILL.md                  # Conventions frontend
│   │   │   └── references/               # 9 fichiers
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
│   │   │   └── SKILL.md                  # Conventions design Figma
│   │   └── testing-conventions/
│   │       ├── SKILL.md                  # TDD et stratégies
│   │       └── references/               # 3 fichiers
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
│   ├── legacy-readonly.md    # php-legacy/** → LECTURE SEULE
│   ├── symfony-api.md        # api-rest-symfony-target/** → Conventions
│   ├── frontend.md           # app-react-target/** → Délégation vers skills
│   ├── output-format.md      # output/** → Format Markdown
│   ├── design.md             # output/design/** → Figma JSON
│   ├── docs.md               # api-rest-symfony-target/docs/** → OpenAPI
│   └── git.md                # (global) → Conventional Commits
└── commands/
    ├── dev/
    │   ├── commit.md         # /dev/commit
    │   ├── php-test.md       # /dev/php-test
    │   └── php-lint.md       # /dev/php-lint
    └── review/
        ├── symfony-review.md  # /review/symfony-review
        └── frontend-review.md # /review/frontend-review
```

## Settings : la couche de sécurité

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

**Logique** : Lecture libre partout. Écriture autorisée partout sauf dans le legacy. Docker Compose et git autorisés sans confirmation.

## Relations clés

### Skills héritées par les agents

| Agent | Skills héritées |
|-------|----------------|
| `backend-tasks-planner` | `symfony/api-conventions`, `symfony/testing-conventions` |
| `backend-tasks-executor` | `symfony/api-conventions`, `symfony/testing-conventions` |
| `frontend-tasks-planner` | `frontend/app-conventions`, `frontend/testing-conventions` |
| `frontend-tasks-executor` | `frontend/app-conventions`, `frontend/testing-conventions`, `frontend/design-conventions` |
| `legacy-feature-analyzer` | `symfony/api-conventions`, `frontend/app-conventions` |
| `legacy-feature-analyzer-refiner` | `symfony/api-conventions`, `frontend/app-conventions` |
| `conformity-reporter` | `symfony/api-conventions`, `symfony/testing-conventions`, `frontend/app-conventions`, `frontend/testing-conventions`, `modernization/conformity-conventions` |

### Rules et leur renfort settings

| Rule | Glob pattern | Renfort settings.json |
|------|-------------|----------------------|
| `legacy-readonly.md` | `php-legacy/**` | `deny: Write/Edit(php-legacy/**)` |
| `symfony-api.md` | `api-rest-symfony-target/**` | `allow: Bash(docker compose *)` |
| `git.md` | (global) | `allow: Bash(git *)` |

### Pipeline des skills launchers

```
/modernization/analyze-legacy
  → legacy-technical-analyzer (Opus)
  → legacy-functional-analyzer (Sonnet)
  → legacy-functional-analyzer-auditor (Haiku)

/modernization/migrate-feature <nom>
  → legacy-feature-analyzer (Opus)
  → backend-tasks-planner (Sonnet)
  → frontend-tasks-planner (Sonnet)
  → backend-tasks-executor (Sonnet)
  → frontend-tasks-executor (Sonnet)
  → conformity-reporter (Sonnet)
  → boucle qualité (si score < 80/100, max 2 iterations)
```
