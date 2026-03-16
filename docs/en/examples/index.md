# Real-World Use Case: Legacy Modernization

## Context

This project uses Claude Code to migrate a legacy PHP application to a modern architecture:

- **Source**: Procedural PHP, MySQL, no framework
- **Target backend**: Symfony 7.4, PostgreSQL, REST API, JWT
- **Target frontend**: SPA with direct HTTP calls to the API

The Claude Code ecosystem orchestrates the entire process, from initial analysis to final documentation.

## Pipeline Overview

```
Phase 1: Analysis
├── Technical analysis (reverse engineering)
├── Functional inventory (features, roles, flows)
└── Audit (enrichment, missing features)

Phase 1.5: Visualization
├── Dependency graph (ECharts force-directed)
└── Functional tree (ECharts tree)

Phase 2: Migration (per feature)
├── Detailed specification (12 sections)
├── Backend + frontend planning
├── TDD implementation (tests before code)
└── Conformity report (scoring)

Phase 3: Documentation
└── Adaptive VitePress site
```

## Sizing

| Component | Count |
|-----------|-------|
| Agents | 12 (2 Opus + 7 Sonnet + 3 Haiku) |
| Skills | 11 (4 launchers + 6 passive + 1 framework) |
| Rules | 7 (1 global + 6 targeted) |
| Commands | 5 (commit, test, lint, symfony-review, frontend-review) |
| References | 34 technical documentation files |
| Features migrated | 14+ (auth, ads, search, categories...) |

## Invocation

The entire workflow is triggered by 4 slash commands:

```bash
# 1. Analyze the legacy
/modernization/analyze-legacy

# 1.5. Generate visualizations
/modernization/generate-visualization

# 2. Migrate each feature
/modernization/migrate-feature Search_Engine
/modernization/migrate-feature User_Authentication
# ...

# 3. Generate documentation
/modernization/generate-docs all
```

## Detail Pages

- [.claude/ Project Structure](/en/examples/project-structure) — Complete file organization
- [Migration Pipeline](/en/examples/pipeline) — Detail of each step
- [Model Strategy](/en/examples/model-strategy) — Opus/Sonnet/Haiku choices
