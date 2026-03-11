# Migration Pipeline

## Overview

The migration pipeline transforms a legacy feature into a modern implementation through 4 steps, each with a verification checkpoint.

```
Specification ──► Planning ──► Implementation ──► Conformity
     │                  │                  │                │
     ▼                  ▼                  ▼                ▼
  _spec.md        _analysis.md         Code + Tests      _REPORT.md
```

## Step 1: Detailed Specification

**Agent**: `legacy-feature-analyzer` (Opus)

**Input**: Legacy source code + functional inventory

**Output**: `output/features/[Feature]_spec.md` (12 sections)

### The 12 Sections

1. Functional overview
2. Legacy implementation reference
3. User scenarios
4. Interface points (UI)
5. Business rules
6. Validation and constraints
7. Error handling
8. Security and permissions
9. Dependencies with other features
10. Data and persistence
11. Performance and scalability
12. Acceptance criteria

### Checkpoint

```
✅ File output/features/Search_Engine_spec.md exists
✅ Contains all 12 sections
✅ Scenarios cover nominal and edge cases
→ Move to step 2
```

### Refinement (optional)

If the spec needs corrections, the `legacy-feature-analyzer-refiner` agent (Sonnet) can enrich it without changing its nature. The corrected file is suffixed with `-corrected`.

## Step 2: Planning

**Agents**: `backend-tasks-planner` + `frontend-tasks-planner` (Sonnet)

**Input**: Detailed specification

**Outputs**:
- `output/analysis/backend/[Feature]_backend_analysis.md`
- `output/analysis/frontend/[Feature]_frontend_analysis.md`

### Backend Analysis Content

- Source → target mapping (PHP patterns → Symfony)
- List of atomic tasks with dependencies
- Database schema (entities, relationships)
- OpenAPI specification for endpoints
- Complexity estimation per task

### Frontend Analysis Content

- Source UI → target component mapping
- Task list with API integration
- OpenAPI spec consultation for contracts
- Responsive design points
- State management strategy

### Checkpoint

```
✅ File _backend_analysis.md exists
✅ File _frontend_analysis.md exists
✅ OpenAPI spec updated in api-rest-symfony-target/docs/openapi.yaml
→ Move to step 3
```

## Step 3: TDD Implementation

**Agents**: `backend-tasks-executor` + `frontend-tasks-executor` (Sonnet)

**Input**: Analysis files + convention skills

**Output**: Source code + tests in target projects

### Test First Process (backend)

For each task in the analysis:

```
1. Read the skill reference (e.g.: create-entity.md)
2. Write the test
3. Verify it fails (Red)
4. Implement the code
5. Verify the test passes (Green)
6. Refactor if necessary
7. Update status: "Processed"
```

### Execution Command

```bash
docker compose exec -T app php bin/phpunit --testsuite unit 2>&1 | cat
```

### Task Tracking

Each task in the analysis moves from `Unprocessed` to `Processed` with:
- Completion date
- Number of tests written
- Deviations from the plan (with justification)

### Checkpoint

```
✅ All unit tests pass
✅ All integration tests pass
✅ All functional tests pass
✅ All tasks marked "Processed"
→ Move to step 4
```

## Step 4: Conformity Report

**Agent**: `conformity-reporter` (Sonnet)

**Input**: Specification + analysis + implemented code

**Output**: `output/reports/[Feature]_CONFORMITY_REPORT-V[N].md`

### Scoring System

| Severity | Deduction |
|----------|-----------|
| Critical | -15 points |
| High | -10 points |
| Medium | -5 points |
| Low | -2 points |

Starting score: 100 points. Each non-conformity deducts according to its severity.

### Versioning

Reports are **never overwritten**. Each evaluation produces a new version:

```
output/reports/
├── Search_Engine_CONFORMITY_REPORT-V1.md   # First evaluation
├── Search_Engine_CONFORMITY_REPORT-V2.md   # After corrections
└── Search_Engine_CONFORMITY_REPORT-V3.md   # Final version
```

Documentation always uses the **latest version**.

### Report Example

```markdown
# Conformity Report: Search_Engine (V1)

## Overall Score: 85/100

### Conformities
- ✅ Correct REST endpoints (GET /api/ads, GET /api/ads/stats)
- ✅ Response DTOs with serialization groups
- ✅ Repository with search criteria

### Non-conformities
- ❌ HIGH (-10): Pagination not implemented
- ❌ MEDIUM (-5): Relevance sorting missing

### Recommendation
CORRECTIONS REQUIRED — Implement pagination before validation.
```

## Pipeline Resilience

### Failure Recovery

Each launcher skill accepts a stage argument to resume at a specific step:

```bash
# Resume at step 3 (implementation)
/modernization/migrate-feature Search_Engine stage=3
```

### Intermediate Files = Relays

Agents are isolated (no shared context). Intermediate files (`_spec.md`, `_analysis.md`) serve as handoff points between agents.

### Corrected Versions

If a `Feature_spec.md` file is corrected, the `-corrected` version takes priority:
- `Search_Engine_spec.md` → initial version
- `Search_Engine_spec-corrected.md` → version to use
