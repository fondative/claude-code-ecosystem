# Structure du projet .claude/

## Arborescence complète

```
.claude/
├── README.md
├── settings.json
├── settings.local.json
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
│   └── health-check.md                   # Haiku - Diagnostics (plan)
├── skills/
│   ├── mod-analyze-legacy/SKILL.md          # Pipeline d'analyse (launcher)
│   ├── mod-migrate-feature/SKILL.md         # Migration E2E (launcher)
│   ├── mod-generate-visualization/SKILL.md  # ECharts (appelée par mod-analyze-legacy)
│   ├── mod-generate-docs/                   # VitePress (launcher, aussi appelée par mod-migrate-feature pour la sync wiki)
│   │   ├── SKILL.md
│   │   └── references/                      # 4 templates
│   ├── mod-conformity-conventions/          # Scoring et rapports
│   │   ├── SKILL.md
│   │   └── references/                      # 4 fichiers
│   │       ├── scoring-methodology.md
│   │       ├── report-template.md
│   │       ├── version-management.md
│   │       └── issue-reporting.md
│   ├── sym-api-conventions/
│   │   ├── SKILL.md                         # Conventions backend
│   │   └── references/                      # 15 fichiers
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
│   │   ├── SKILL.md                         # TDD et stratégies
│   │   └── references/                      # 3 fichiers
│   │       ├── tdd-conventions.md
│   │       ├── testing.md
│   │       └── mocking-strategies.md
│   ├── front-app-conventions/
│   │   ├── SKILL.md                         # Conventions frontend
│   │   └── references/                      # 9 fichiers
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
│   │   └── SKILL.md                         # Conventions design Figma
│   ├── front-testing-conventions/
│   │   ├── SKILL.md                         # TDD et stratégies
│   │   └── references/                      # 3 fichiers
│   │       ├── tdd-conventions.md
│   │       ├── testing.md
│   │       └── mocking-strategies.md
│   ├── claude-code-parallel-agents/
│   │   └── SKILL.md                         # Agents en parallèle
│   └── claude-code-skill-command-model/
│       ├── SKILL.md                         # Skill vs command, audit .claude/
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
    │   ├── install-stack.md  # /dev/install-stack
    │   ├── php-test.md       # /dev/php-test
    │   ├── php-lint.md       # /dev/php-lint
    │   ├── front-test.md     # /dev/front-test
    │   └── front-lint.md     # /dev/front-lint
    └── review/
        ├── symfony-review.md  # /review/symfony-review
        └── frontend-review.md # /review/frontend-review
```

## Settings : la couche de sécurité

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

**Logique** : Lecture libre partout. Écriture sans confirmation uniquement dans `output/**` et les wikis générés (`*-wiki/**`). Le legacy et les `.env` sont protégés en écriture. Commandes Docker et git en lecture autorisées ; `git commit` et `git push` demandent toujours confirmation.

## Relations clés

### Skills héritées par les agents

| Agent | Skills héritées |
|-------|----------------|
| `backend-tasks-planner` | `sym-api-conventions`, `sym-testing-conventions` |
| `backend-tasks-executor` | `sym-api-conventions`, `sym-testing-conventions` |
| `frontend-tasks-planner` | `front-app-conventions`, `front-testing-conventions` |
| `frontend-tasks-executor` | `front-app-conventions`, `front-testing-conventions`, `front-design-conventions` |
| `legacy-feature-analyzer` | `sym-api-conventions`, `front-app-conventions` |
| `legacy-feature-analyzer-refiner` | `sym-api-conventions`, `front-app-conventions` |
| `conformity-reporter` | `sym-api-conventions`, `sym-testing-conventions`, `front-app-conventions`, `front-testing-conventions`, `mod-conformity-conventions` |

### Rules et leur renfort settings

| Rule | Glob pattern | Renfort settings.json |
|------|-------------|----------------------|
| `legacy-readonly.md` | `php-legacy/**` | `deny: Write/Edit(php-legacy/**)` |
| `symfony-api.md` | `api-rest-symfony-target/**` | `allow: Bash(docker compose exec -T app *)` |
| `git.md` | (global) | `ask: Bash(git commit/push *)` |

### Pipeline des skills launchers

```
/mod-analyze-legacy
  → legacy-technical-analyzer (Opus)
  → legacy-functional-analyzer (Sonnet)
  → legacy-functional-analyzer-auditor (Haiku)
  → legacy-feature-analyzer x N en batch (Opus, optionnel)
  → /mod-generate-visualization
  → sync wiki (si le dossier wiki existe)

/mod-migrate-feature <nom>
  → pré-requis : stacks cibles installés (sinon /dev/install-stack)
  → legacy-feature-analyzer (Opus)
  → backend-tasks-planner (Sonnet)
  → frontend-tasks-planner (Sonnet)
  → backend-tasks-executor (Sonnet)
  → frontend-tasks-executor (Sonnet)
  → conformity-reporter (Sonnet)
  → boucle qualité (si score < 80/100, max 2 iterations)
  → /mod-generate-docs <nom> (sync wiki, si le dossier wiki existe)
```
