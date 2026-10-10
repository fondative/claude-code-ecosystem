# Migration Pipeline

## Overview

The migration pipeline (`/mod-migrate-feature <name>`) transforms a legacy feature into a modern implementation through 5 main steps (1 to 5), framed by a step 0 prerequisite (target stacks check, otherwise `/dev:install-stack` is suggested) and a step 6 final wiki sync (`/mod-generate-docs`). If the wiki folder (`WIKI_TARGET`) exists, the wiki is also synced after the spec arbitration (step 1 bis), after planning (step 2 bis, feature "Planned") and at each batch commit (`/mod-generate-docs <feature> status`). Each step has a verification checkpoint.

```
Specification ──► Planning ──► Implementation ──► Conformity ──► Quality Loop
     │                  │                  │                │              │
     ▼                  ▼                  ▼                ▼              ▼
  _spec.md        _analysis.md     Code + Tests        _REPORT.md     Score ≥ 80
                                  (1 commit per batch) (V1 commit)
```

::: info This project's convention
A single feature name, `<feature>`, is used for every file (`<feature>_spec.md`, `<feature>_backend_analysis.md`, `<feature>_CONFORMITY_REPORT*.md`…) and every agent prompt: it is the text following `### Feature N : ` in `output/features/0-index.md`, with spaces replaced by `_` (`### Feature 3 : User Authentication` → `User_Authentication`). The `/mod-migrate-feature` argument is compared ignoring case and separators: `user-authentication` → `User_Authentication`, but `user-auth` matches nothing. Zero or several matches: the launcher stops and lists the candidates.
:::

## Step 1: Detailed Specification

**Agent**: `legacy-feature-analyzer` (Opus)

**Prompt**: `Feature : <feature>`, nothing else (never another spec quoted as an example: the agent starts from the legacy code alone). The step is skipped if the spec already exists with its 14 sections.

**Input**: Legacy source code + functional inventory

**Output**: `output/features/<feature>_spec.md` (14 sections)

### The 14 Sections

Each section has a `## N. Title` heading (N = 1 to 14, in this order), preceded by its `<a id="sec-N"></a>` anchor. The actual headings are in French:

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
13. Migration Notes
14. Appendix

### Arbitrating deviations from the legacy

Sections 1 to 12 describe the legacy as it is. Section 13 contains the "Applied Technical Transpositions" and the "Deviations from the Legacy" table (`Écarts au Legacy`). The launcher presents each `À arbitrer` (to be decided) row to the user (legacy behavior and its source, proposal, the agent's recommendation) and writes the answer in the `Décision` column: `Reproduire` (reproduce) or `Corriger : <rule kept>` (fix). As long as a row reads `À arbitrer`, the pipeline does not move to step 2.

### Checkpoint

```
✅ File output/features/Search_Engine_spec.md exists
✅ 14 ## N. sections in order, each preceded by its sec-N anchor
✅ Section 13: transpositions + "Écarts au Legacy" table
✅ No "À arbitrer" row left
→ Step 1 bis (spec wiki sync), then step 2
```

### Refinement (optional)

If the spec needs corrections, the `legacy-feature-analyzer-refiner` agent (Sonnet) can enrich it without changing its nature. It enriches `<feature>_spec.md` in place (no new file) and updates the features tree.

## Step 2: Planning

**Agents**: `backend-tasks-planner` then `frontend-tasks-planner` (Sonnet), prompt `Feature : <feature>`. The frontend planner only runs after the backend checkpoint.

**Input**: Detailed specification

**Outputs**:
- `output/analysis/backend/<feature>_backend_analysis.md`
- `output/analysis/frontend/<feature>_frontend_analysis.md`

A planner is skipped if its analysis already exists with at least one task (`#### BACKEND-0xx`, resp. `#### FRONTEND-0xx`): a resume does not overwrite task statuses.

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
✅ Tasks in the "#### BACKEND-001 : <title>" format with "- **Status** :"
   (Unprocessed after a fresh planning)
✅ Each task has: title, description, acceptance criteria
✅ Dependencies reference existing IDs in the same file
✅ Execution order is defined
✅ OpenAPI spec included if endpoints are created
✅ File _frontend_analysis.md exists, tasks "#### FRONTEND-001 : <title>"
✅ FRONTEND-001 configures the HTTP client if it does not exist yet (otherwise reuses it)
✅ Referenced endpoints exist in openapi.yaml
   or in the "OpenAPI Specification" section of the backend analysis
→ Step 2 bis (wiki sync: feature "Planned"), then step 3
```

## Step 3: TDD Implementation

**Agents**: `backend-tasks-executor` then `frontend-tasks-executor` (Sonnet): the whole backend first, then the frontend

**Input**: Analysis files + convention skills

**Output**: Source code + tests in target projects, one commit per batch

### Test First Process (backend)

For each task in the analysis:

```
1. Read the skill reference (e.g.: create-entity.md)
2. Write the test
3. Verify it fails (Red)
4. Implement the code
5. Verify the test passes (Green)
6. Refactor if necessary
7. Update status: "Processed" (or "Blocked" with the reason)
```

### Task batches

The launcher never hands the whole analysis to an executor: it loops in **batches of at most 3 tasks** (beyond that, the executor reaches its `maxTurns` of 60). It picks the `Unprocessed` tasks in execution order, excluding those with a `Blocked` dependency, and runs:

```text
Feature : User_Authentication — Taches : BACKEND-001, BACKEND-002, BACKEND-003 — Derniere serie : non
```

`Derniere serie : oui` (last batch: yes) marks the last batch: the executor then generates the feature documentation (`<target>/docs/features/<feature>.md`). A `partiel` (partial) result (`maxTurns` reached) is resumed with SendMessage until the batch is done; if it keeps happening, the launcher switches to batches of 2 tasks rather than raising `maxTurns`.

### Execution Command

```bash
cd api-rest-symfony-target && docker compose exec -T app php bin/phpunit 2>&1
```

The working directory returns to the project root after each Bash command (`CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` in the `env` block of `.claude/settings.json`), hence the `cd <target> &&` at the start of every command. No `| cat`: a pipe would return `cat`'s exit code and hide the failure.

### Task Tracking

Each task in the analysis moves from `Unprocessed` to `Processed` with:
- Completion date
- Number of tests written
- Deviations from the plan (with justification)

A task that cannot be done as planned moves to `Blocked`, with the reason and a proposed alternative. Its dependents (including frontend tasks that cite a blocked "planned BACKEND-00X" endpoint) stay `Unprocessed` and are excluded from the next batches.

**Blocked task**: the launcher first commits the batch, displays the reason, the alternative and the waiting tasks, then asks the user how to continue. If an alternative is chosen, it replaces `- **Status** : Blocked` with `- **Status** : Unprocessed` and adds right below a `- **Decision** : <chosen alternative>` line, which the executor applies in the next batch. With no alternative chosen, the task stays `Blocked`.

### Checkpoint (after each batch)

```
✅ Batch tasks "Processed" or "Blocked" (or left "Unprocessed"
   because a dependency is "Blocked")
✅ Backend: /dev:php-test criterion (exit code 0 and at least one test run)
✅ Frontend: npm run typecheck with no error, then npm test -- --run with no failure
→ Batch commit, then next batch
```

If the tests fail: STOP, errors displayed, nothing is committed.

### Batch commit

The executors do not commit: the launcher checks and commits each batch. It first runs `/mod-generate-docs <feature> status` (if the wiki exists) so that the wiki dashboard goes into the same commit, then runs a targeted `git add` (files listed by the executor and by `/mod-generate-docs`, the feature's spec and analyses) and a `git commit` in the Conventional Commits format.

::: info In our project
The `git` rule forbids Claude from running `git commit` (it suggests `/dev:commit`), with one exception: `/mod-migrate-feature` commits each checked batch. Every commit is still approved by the user, because `Bash(git commit *)` is in the `ask` list of `.claude/settings.json`.
:::

**Final pass**: if no eligible task is left and the executor documentation does not exist (the last batch never ran, the remaining tasks being blocked), the launcher reruns the executor with `Feature : <feature> — Taches : aucune — Derniere serie : oui`, which only generates the documentation, then commits.

## Step 4: Conformity Report

**Agent**: `conformity-reporter` (Sonnet), prompt `Feature : <feature>`

**Input**: Specification + analysis + implemented code

**Output**: `output/reports/<feature>_CONFORMITY_REPORT.md` (V1), then `<feature>_CONFORMITY_REPORT-V<N>.md` (V2+)

### Scoring System

Deduction scale, per-section caps and overall score weighting: see [Methodology — Step 4](/en/guide/methodology#step-4).

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

### Conformity commit

The launcher syncs the wiki (`/mod-generate-docs <feature>`: conformity page, score in the dashboards), then commits the report, the wiki files and the feature files not yet committed. This commit is the reference for the V2 report, whose analysis is incremental from V1.

On a rerun, the step is skipped if the latest report is already committed and the target code has not changed since; a report written but not yet committed is committed without rerunning the agent.

### Report Example

Simplified excerpt of the `mod-conformity-conventions` template (the reports are written in French):

```markdown
# Search_Engine — Rapport de Conformite

> 🔵 85/100 — Approuvé avec conditions

### Conformités
- ✅ Endpoints REST corrects (GET /api/ads, GET /api/ads/stats)
- ✅ DTOs de réponse avec serialization groups
- ✅ Repository avec critères de recherche

### Non-conformités
- ❌ 🟠 High (-10) : Pagination non implémentée
- ❌ 🟡 Medium (-5) : Tri par pertinence manquant

### Recommandation
Approuvé avec conditions (80-89) — Implémenter la pagination avant merge.
```

## Step 5: Quality Loop

**Pattern**: LLM-as-Judge, **a single correction pass**, then a V2 report (no automatic V3). Threshold and stop for human intervention: see [Methodology — Step 5](/en/guide/methodology#step-5).

If V1 is below 80/100, the launcher extracts the Critical and High issues and splits them by executor according to their location; those no executor can fix (alignment with the analyses, spec, analysis or report files) are listed to the user. Each executor is rerun in **CORRECTION MODE**, in batches of at most 3 corrections, with a checkpoint and a commit after each batch:

```text
Feature : <feature> — Corrections : <ID> <location> <expected> ; … — Derniere serie : non
```

The executor adds a `- **Correction** : <ID> — …` line in its analysis. The V2 report is only requested once every issue sent has its line. If V2 is still below 80/100, or if the pipeline is rerun on an insufficient V2: STOP, human intervention.

### Checkpoint

```
✅ Final report score (V1 or V2) ≥ 80/100
→ Step 6
```

## Step 6: Wiki Synchronization

If `WIKI_TARGET` exists, `/mod-generate-docs <feature>` publishes the final state of the feature (otherwise the step is ignored).

```
✅ No error in the /mod-generate-docs output
✅ Pages modernisation/<slug>.md, modernisation/api/<slug>.md,
   modernisation/frontend/<slug>.md and modernisation/conformity-<slug>.md
✅ These pages referenced in the sidebar of docs/.vitepress/config.ts
→ Pipeline completed
```

## Pipeline Resilience

### Failure Recovery

Each step checks its output files before moving on. Rerunning the same command resumes the pipeline at the failed step:

```bash
# Resumes at the failed step (e.g. implementation), without redoing spec or planning
/mod-migrate-feature Search_Engine
```

- **Analyses kept**: a planner is not rerun if its analysis already contains tasks (statuses are preserved).
- **Interrupted batch**: when entering step 3, `git status --porcelain` on the target and the feature files; a non-empty output signals an uncommitted batch. The launcher replays the batch checkpoint: green → commit then next batch; red → STOP. The failing tests are fixed by the user or by the executor in CORRECTION MODE (`Feature : <feature> — Corrections : <failing test> <test file> test vert ; … — Derniere serie : non`).
- **Report reused**: step 4 is skipped if the latest report is committed and the code unchanged; an interrupted correction loop resumes with only the issues that have no `- **Correction**` line.

### Intermediate Files = Relays

Agents share no context: they hand off to each other through files. See [Methodology — How Agents Communicate](/en/guide/methodology#how-agents-communicate).

The second channel is the agent's normalized return: `Statut`, `Fichiers ecrits`, `Resultats`, `Points bloquants / decisions` (status, files written, results, blocking points / decisions). `Statut : partiel` (`maxTurns` reached) → the launcher resumes the same agent with SendMessage ("Continuer") before the checkpoint; `Statut : bloque` or a blocking point → question to the user before any rerun.

### Corrected Versions

When generating the wiki (`/mod-generate-docs`), if a `-corrected` version of a file exists, it takes priority:
- `Search_Engine_spec.md` → initial version
- `Search_Engine_spec-corrected.md` → version to use

## Parallelism and sequence {#parallelism-and-sequence}

**Project rule**: **one file = one writer**, and a step that reads another step's output runs **after** it. The sequential, parallel and hierarchical patterns are described in [Agents — Orchestration Patterns](/en/concepts/agents#orchestration-patterns).

| Step | Mode | Why |
|------|------|-----|
| `/mod-analyze-legacy`: technical analysis → inventory → audit | Sequence | The skill enforces the order and checks each step's output (checkpoint) before the next one |
| `/mod-analyze-legacy` step 4: one spec per feature (`legacy-feature-analyzer`) | **Parallel**, in **BATCH MODE**, in waves of at most 4 agents | Each agent writes only its `*_spec.md`; the orchestrator updates `0-index.md` and `0-features-tree.json` once, at the end, and only marks `analyzed` the features whose spec has its 14 sections (the others are listed as failures to rerun) |
| `/mod-migrate-feature`: spec → backend planner → frontend planner → backend executor → frontend executor → conformity | Sequence | The frontend planner relies on the OpenAPI contract defined on the backend side; the frontend executor calls the API the backend has just implemented |
| Migrating **two features** at the same time | Avoid | Same `openapi.yaml`, same Docker stack (see [WARN-001](#warn-001)) |

The anti-conflict rules come from the project skill `claude-code-parallel-agents`, written after a launch of 13 agents in parallel that went wrong. The two pitfalls observed are described on the Agents page: [WARN-005](/en/concepts/agents#warn-005) (parallel agents writing the same file) and [WARN-006](/en/concepts/agents#warn-006) (undersized `maxTurns`, partial output with no error).

The prompt `/mod-analyze-legacy` sends to each step 4 agent (one wave of at most 4 agents, the next one after the previous one ends):

```text
MODE BATCH — Feature : User_Authentication
```

`MODE BATCH` makes the agent skip the interactive selection and the `0-index.md` / `0-features-tree.json` update: it only writes the spec. The `claude-code-parallel-agents` skill describes a richer generic form, which also preloads the source files and paths in the prompt to save discovery turns.

### Worktree and Docker

`isolation: worktree` gives a subagent its **own copy** of the repository (a git worktree); without isolation, all agents work in the **same checkout**. The question to ask: *does the agent need the project's Docker stack?*
- No (legacy analysis, documentation) → a worktree is possible.
- Yes (executors that run the tests) → **no worktree** without a dedicated stack (see [WARN-002](#warn-002)).

No project agent uses `isolation: worktree`. The parallel agents (feature analysis) do not need it: BATCH MODE is enough, since each one writes to a different file.

#### ⚠️ `WARN-001`: Migrating two features in parallel {#warn-001}

*Origin: consequence of the project's configuration (a single `OPENAPI_SPEC` declared in CLAUDE.md, a single Docker stack), same mechanism as the conflict between parallel agents ([Agents — WARN-005](/en/concepts/agents#warn-005)).*

BATCH MODE protects the analysis, not the migration. Two `/mod-migrate-feature` runs at the same time launch two `backend-tasks-executor` agents that both update **the same** `api-rest-symfony-target/docs/openapi.yaml` and run their tests in **the same** `app` container.

::: danger Problem
```text
/mod-migrate-feature user-authentication  ┐ at the same time
/mod-migrate-feature product-list         ┘
→ both executors rewrite openapi.yaml: one's endpoints disappear
→ one's tests run while the other changes the code: failures that
  belong to neither feature
```
:::

::: info Solution
```text
Migrate features one after the other.
Parallelism happens upstream: analyze all features in BATCH MODE,
then migrate in sequence: wait for the end of a feature's pipeline
(conformity commit) before starting the next one.
```
:::

#### ⚠️ `WARN-002`: Isolating an executor in a worktree while tests run in Docker {#warn-002}

*Origin: good practice derived from the project's configuration (every backend command through `docker compose exec`).*

A worktree is a **new checkout**, in `.claude/worktrees/`. The containers of a development stack usually mount the main checkout: `docker compose exec -T app …` run from the worktree executes in a container that sees **the other** copy of the code.

::: danger Problem
```yaml
# backend-tasks-executor
isolation: worktree
# → the agent changes the code in its worktree
# → docker compose exec -T app php bin/phpunit tests the main checkout's code
# → green tests on code that is not its own
```
:::

::: info Solution
Keep `isolation: worktree` for agents that do not need the stack (analysis, documentation), or start a dedicated Docker stack in the worktree.
:::

### Before launching

- [ ] Agents run in parallel each write **a different file**; shared files are updated by the orchestrator at the end.
- [ ] Each parallel agent's prompt contains `MODE BATCH`; agents are launched in waves of at most 4.
- [ ] `maxTurns` ≥ files to read + files to write + 10 ([WARN-006](/en/concepts/agents#warn-006)).
- [ ] Executors receive batches of at most 3 tasks (`maxTurns` 60).
- [ ] The `/mod-migrate-feature` steps stay in sequence; only one feature is migrated at a time.
- [ ] No executor that runs the Docker tests is isolated in a worktree.

---

*Verified with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
