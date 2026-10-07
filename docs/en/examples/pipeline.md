# Migration Pipeline

## Overview

The migration pipeline transforms a legacy feature into a modern implementation through 5 main steps (1 to 5), framed by a step 0 prerequisite (target stacks check, otherwise `/dev/install-stack` is suggested) and a step 6 wiki sync (`/mod-generate-docs`, if the wiki folder exists). Each step has a verification checkpoint.

```
Specification ──► Planning ──► Implementation ──► Conformity ──► Quality Loop
     │                  │                  │                │              │
     ▼                  ▼                  ▼                ▼              ▼
  _spec.md        _analysis.md         Code + Tests      _REPORT.md   Score ≥ 80
```

## Step 1: Detailed Specification

**Agent**: `legacy-feature-analyzer` (Opus)

**Input**: Legacy source code + functional inventory

**Output**: `output/features/[Feature]_spec.md` (12 sections)

### The 12 Sections

1. Overview (Vue d'Ensemble)
2. Source Implementation Reference
3. User Scenarios
4. Interaction Points
5. Business Rules
6. Data Validation Rules
7. State Management
8. Access Control & Authorization
9. Error Handling
10. Edge Cases & Special Scenarios
11. Integration Points
12. Testing Considerations

The output format ends with two complementary sections: Migration Notes and Appendix.

### Checkpoint

```
✅ File output/features/Search_Engine_spec.md exists
✅ Contains all 12 sections
✅ Scenarios cover nominal and edge cases
→ Move to step 2
```

### Refinement (optional)

If the spec needs corrections, the `legacy-feature-analyzer-refiner` agent (Sonnet) can enrich it without changing its nature. It enriches `[Feature]_spec.md` in place (no new file) and updates the features tree.

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
✅ Contains tasks with IDs (BACKEND-001, BACKEND-002...)
✅ Each task has: title, description, acceptance criteria
✅ Dependencies reference existing IDs in the same file
✅ Execution order is defined
✅ OpenAPI spec included if endpoints are created
✅ File _frontend_analysis.md exists
✅ Contains tasks with IDs (FRONTEND-001, FRONTEND-002...)
✅ FRONTEND-001 is the HTTP client configuration
✅ Referenced endpoints exist in the OpenAPI spec
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
✅ The frontend application compiles without errors
→ Move to step 4
```

## Step 4: Conformity Report

**Agent**: `conformity-reporter` (Sonnet)

**Input**: Specification + analysis + implemented code

**Output**: `output/reports/[Feature]_CONFORMITY_REPORT.md` (V1), then `[Feature]_CONFORMITY_REPORT-V[N].md` (V2+)

### Scoring System

| Severity | Deduction |
|----------|-----------|
| Critical | -15 points |
| High | -10 points |
| Medium | -5 points |
| Low | -2 points |

Starting score: 100 points per section. Each non-conformity deducts according to its severity, with a per-section cap for Medium (max 25 points) and Low (max 10 points); Critical and High are not capped.

The overall score weights 4 categories: Project Guidelines Conformity (30%), Codebase Consistency (25%), Feature Specifications Conformity (25%), Analysis Document Alignment (20%).

### Versioning

Reports are **never overwritten**. Each evaluation produces a new version:

```
output/reports/
├── Search_Engine_CONFORMITY_REPORT.md      # V1: first evaluation (no suffix)
├── Search_Engine_CONFORMITY_REPORT-V2.md   # After corrections (quality loop)
└── Search_Engine_CONFORMITY_REPORT-V3.md   # Only after manual intervention
```

The automatic quality loop stops at V2: a V3 is only produced after human intervention.

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
APPROVED WITH CONDITIONS (80-89) — Implement pagination before merge.
```

## Step 5: Quality Loop

**Pattern**: LLM-as-Judge (maximum 2 iterations)

**Process**:

1. Read the conformity report score (step 4)
2. If score ≥ 80/100: pipeline completed successfully
3. If score < 80/100:
   - Extract CRITICAL and HIGH deductions from the report
   - Identify the concerned executor (backend or frontend)
   - Re-run the executor with the list of corrections
   - Re-run the conformity-reporter (V2 report)
   - If V2 score ≥ 80/100: success
   - If V2 score < 80/100: **STOP** — human intervention required

### Checkpoint

```
✅ Final report score (V1 or V2) ≥ 80/100
✅ No remaining CRITICAL non-conformities
→ Pipeline completed
```

## Pipeline Resilience

### Failure Recovery

Each step checks its output files before moving on. Rerunning the same command resumes the pipeline at the failed step:

```bash
# Resumes at the failed step (e.g. implementation), without redoing spec or planning
/mod-migrate-feature Search_Engine
```

### Intermediate Files = Relays

Agents are isolated (no shared context). Intermediate files (`_spec.md`, `_analysis.md`) serve as handoff points between agents.

### Corrected Versions

When generating the wiki (`/mod-generate-docs`), if a `-corrected` version of a file exists, it takes priority:
- `Search_Engine_spec.md` → initial version
- `Search_Engine_spec-corrected.md` → version to use
