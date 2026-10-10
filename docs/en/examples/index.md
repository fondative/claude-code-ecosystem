# User Manual: Legacy Modernization

## Context

This project uses Claude Code to migrate a legacy PHP application to a modern architecture:

- **Source**: Procedural PHP, MySQL, no framework
- **Target backend**: Symfony 7.4, PostgreSQL, REST API, JWT
- **Target frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4, direct HTTP calls to the API

The Claude Code ecosystem orchestrates the entire process, from initial analysis to final documentation.

## Pipeline Overview

```
Phase 0: Infrastructure
└── CLAUDE.md, agents, skills, rules, commands, settings.json, hooks, scripts

Phase 1: Analysis (/mod-analyze-legacy)
├── Technical analysis (reverse engineering)
├── Functional inventory (features, roles, flows)
├── Audit (enrichment, missing features)
├── Batch detailed specs (optional)
└── Wiki sync (if the wiki folder exists)

Phase 2: Visualization (/mod-generate-visualization, launched by phase 1)
├── Dependency graph (ECharts force-directed)
└── Functional tree (ECharts tree)

Phase 3: Migration, per feature (/mod-migrate-feature)
├── Step 0: target stacks installed (otherwise /dev:install-stack)
├── Step 1: detailed specification (14 sections, deviations from the legacy arbitrated)
├── Step 2: backend + frontend planning
├── Step 3: TDD implementation in batches of 3 tasks, each batch tested then committed
├── Step 4: conformity report (scoring)
├── Step 5: quality loop (1 correction pass then V2, 80/100 threshold)
└── Step 6: wiki sync (if WIKI_TARGET exists; also after the spec, the planning and each batch)

Phase 4: Documentation (/mod-generate-docs)
└── Adaptive VitePress site
```

Each phase and its human validations are detailed in the [Methodology](/en/guide/methodology).

## Pipeline deliverables and where to see them

Each step produces a file, stored under an alias from the `CLAUDE.md` table. The last column points to the section of the example wiki (*Classified Ads* project, in French) that shows this deliverable.

| Phase / step | Deliverable | Produced by | File (alias) | In the use case |
|--------------|-------------|-------------|--------------|-----------------|
| Phase 0 | Claude Code configuration and its inventory | The architect (configuration); `/mod-generate-docs harness` (inventory) | `CLAUDE.md`, `.claude/`; `WIKI_TARGET/docs/modernisation/claude-harness.md` | <CasUsage page="modernisation/claude-harness.html#agents">agents</CasUsage> · <CasUsage page="modernisation/claude-harness.html#permissions-settings-json">permissions</CasUsage> |
| Phase 1, step 1 | Technical analysis (7 files) | `legacy-technical-analyzer` | `SOURCE_TECHNICAL_DIR/00-index.md` to `06-audit.md` | <CasUsage page="docs/analyses/overview.html#_2-architecture-de-haut-niveau">overview</CasUsage> · <CasUsage page="docs/analyses/audit.html#_6-4-plan-d-action-priorise">audit</CasUsage> |
| Phase 1, steps 2 and 3 | Functional inventory and tree, enriched by the audit | `legacy-functional-analyzer`, then `legacy-functional-analyzer-auditor` | `FEATURE_SPECS_DIR/0-index.md`, `FEATURE_SPECS_DIR/0-features-tree.json` | <CasUsage page="docs/features/index.html#inventaire-des-features">feature inventory</CasUsage> |
| Phase 2 | Dependency graph and functional tree (standalone HTML); wiki mapping | `/mod-generate-visualization`; `/mod-generate-docs` (`<MigrationMap />`) | `FEATURE_SPECS_DIR/dependency-graph.html`, `FEATURE_SPECS_DIR/features-tree-visualization.html`; `WIKI_TARGET/docs/mapping/index.md` | <CasUsage page="mapping/index.html#cartographie-de-la-migration">mapping</CasUsage> |
| Phase 3, step 0 | Target projects installed | `/dev:install-stack` | `BACKEND_TARGET`, `FRONTEND_TARGET` | — |
| Phase 3, step 1 | 14-section spec, deviations from the legacy arbitrated | `legacy-feature-analyzer`; arbitration by `/mod-migrate-feature` | `FEATURE_SPECS_DIR/<feature>_spec.md` | <CasUsage page="docs/features/regions.html#sec-1">Regions module spec</CasUsage> · <CasUsage page="docs/features/regions.html#sec-13">arbitrated deviations</CasUsage> |
| Phase 3, step 2 | Backend (with its "Spécification OpenAPI" section) and frontend analyses: tasks, dependencies, criteria | `backend-tasks-planner`, then `frontend-tasks-planner` | `BACKEND_ANALYSIS_DIR/<feature>_backend_analysis.md`, `FRONTEND_ANALYSIS_DIR/<feature>_frontend_analysis.md` | <CasUsage page="modernisation/api/regions.html#liste-des-taches-backend">Regions module API analysis</CasUsage> · <CasUsage page="modernisation/frontend/regions.html#liste-des-taches-frontend">Regions module Frontend analysis</CasUsage> |
| Phase 3, step 3 | Code and tests in batches of 3 tasks, task status, API contract; wiki timeline and changelog | `backend-tasks-executor`, `frontend-tasks-executor`; commit and `/mod-generate-docs <feature> status` by `/mod-migrate-feature` | `BACKEND_TARGET`, `FRONTEND_TARGET`, `OPENAPI_SPEC`; `WIKI_TARGET/docs/modernisation/changelog.md` | <CasUsage page="modernisation/regions.html#timeline">Regions module timeline</CasUsage> · <CasUsage page="modernisation/changelog.html#journal-de-modernisation">changelog</CasUsage> |
| Phase 3, step 4 | V1 conformity report (score out of 100) | `conformity-reporter` | `REPORTS_DIR/<feature>_CONFORMITY_REPORT.md` | <CasUsage page="modernisation/conformity-categories.html#score-global">Categories module conformity</CasUsage> |
| Phase 3, step 5 | Corrections (MODE CORRECTION) and V2 report if V1 is below 80/100 | Executors, then `conformity-reporter` | `REPORTS_DIR/<feature>_CONFORMITY_REPORT-V2.md` | <CasUsage page="modernisation/conformity-categories.html#suivi-v1-→-v2-section-11-4-anticipee">V1 → V2 follow-up</CasUsage> |
| Phase 3, step 6 | Feature pages in the wiki (timeline, analyses, conformity) | `/mod-generate-docs <feature>` | `WIKI_TARGET/docs/modernisation/` | <CasUsage page="modernisation/index.html#modernisation-—-vue-d-ensemble">dashboard</CasUsage> |
| Phase 4 | Complete VitePress wiki, figures computed from `migration.data.ts` | `/mod-generate-docs all` | `WIKI_TARGET` | <CasUsage page="modernisation/index.html#resultats-verifies">verified results</CasUsage> · <CasUsage page="docs/index.html#analyses-techniques">legacy analyses</CasUsage> |

How the team relies on this wiki to steer the migration: [The wiki as the steering dashboard](/en/guide/methodology#wiki-steering).

## Sizing

| Component | Count |
|-----------|-------|
| Agents | 11 (2 Opus + 7 Sonnet + 2 Haiku) |
| Skills | 12 (4 launchers + 6 passive + 2 internal Claude Code) |
| Rules | 7 (1 global + 6 targeted) |
| Commands | 8 (commit, install-stack, php-test, php-lint, front-test, front-lint, symfony-review, frontend-review) |
| Hooks / scripts | 1 hook (`block-rm.sh`, with its test `block-rm.test.sh`) + 1 script (`install-stack.sh`) |
| References | 41 `.md` files in the skills' `references/` folders (+ wiki templates in `mod-generate-docs/references/`: `wiki-src/`, `vitepress-config.ts`, `package.json`) |

## Invocation

The entire workflow is triggered by 4 slash commands:

```bash
# Phase 1: analyze the legacy (chains into phase 2)
/mod-analyze-legacy

# Phase 2: re-run only the visualizations (after the inventory has been enriched)
/mod-generate-visualization

# Phase 3: migrate each feature
/mod-migrate-feature Search_Engine
/mod-migrate-feature User_Authentication
# ...

# Phase 4: generate documentation
/mod-generate-docs all
```

## Detail Pages

- [.claude/ Project Structure](/en/examples/project-structure) — Complete file organization
- [Migration Pipeline](/en/examples/pipeline) — Detail of each step
- [Model Strategy](/en/examples/model-strategy) — Opus/Sonnet/Haiku choices
- [Quality Review](/en/examples/quality-review) — Review and conformity of the migrated code

---

*Verified with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
