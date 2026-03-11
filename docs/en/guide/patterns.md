# Multi-Agent Orchestration Patterns

## Overview

Claude Code agents can be orchestrated using different patterns to decompose complex tasks. The choice of pattern depends on the nature of dependencies between tasks.

::: tip Complete reference
This page details patterns with examples. For the technical reference on agents (frontmatter, delegation, scopes), see [Agents — Concepts](/en/concepts/agents).
:::

## Pattern 1: Sequential (Pipeline)

Each agent finishes before the next one starts. Output files serve as relays.

```
Agent A ──► file.md ──► Agent B ──► file.md ──► Agent C
```

### Use Cases
- Feature migration: Spec → Planning → Implementation → Conformity
- Legacy analysis: Technical → Functional → Audit

### Implementation (launcher skill)

```yaml
---
name: pipeline-migration
disable-model-invocation: true
---

# Migration $ARGUMENTS

## Step 1: Specification
Run the `feature-analyzer` agent on $ARGUMENTS.
**Checkpoint**: verify that `output/features/$ARGUMENTS_spec.md` exists.

## Step 2: Planning
Run `backend-planner` then `frontend-planner`.
**Checkpoint**: verify that the _analysis.md files exist.

## Step 3: Implementation
Run `backend-executor` then `frontend-executor`.
**Checkpoint**: all tests pass.

## Step 4: Conformity
Run `conformity-reporter`.
```

### Strengths and Weaknesses

| + | - |
|---|---|
| Simple to understand | Slow (no parallelism) |
| Each step verifiable | A failure blocks everything |
| Intermediate files = traceability | Tight coupling between steps |

## Pattern 2: Parallel (Fan-out)

Multiple agents work simultaneously on independent tasks.

```
         ┌── Agent A (backend) ──┐
Input ───┤                       ├──► Merge
         └── Agent B (frontend) ─┘
```

### Use Cases
- Backend + frontend planning in parallel
- Security + performance + quality analysis simultaneously
- Multi-criteria review

### Implementation

Claude Code naturally launches agents in parallel when tasks are independent:

```yaml
---
name: parallel-analysis
---

Run in PARALLEL:
1. Agent `security-auditor` on the src/ folder
2. Agent `performance-analyzer` on the src/ folder
3. Agent `quality-reviewer` on the src/ folder

Wait for all 3 results, then synthesize.
```

### Strengths and Weaknesses

| + | - |
|---|---|
| Fast (simultaneous execution) | Tasks must be independent |
| Good cost/time ratio | Merging results can be complex |
| Scalable | Consumes more tokens simultaneously |

## Pattern 3: Hierarchical (Delegation)

An orchestrator agent delegates to specialized agents that can themselves delegate.

```
Orchestrator
├── Analysis Agent
│   ├── Technical Sub-agent
│   └── Functional Sub-agent
├── Implementation Agent
│   ├── Backend Sub-agent
│   └── Frontend Sub-agent
└── Validation Agent
```

### Use Cases
- Complex projects with sub-domains
- Workflows where each domain has its own logic
- Multi-team systems

### Implementation

```yaml
---
name: full-modernization
disable-model-invocation: true
---

# Complete Modernization

## Phase 1: Analysis (parallel)
Run in parallel:
- `legacy-technical-analyzer`
- `legacy-functional-analyzer`

## Phase 2: Audit
Run `legacy-functional-analyzer-auditor`

## Phase 3: Migration per feature
For each feature in 0-index.md:
  Run `/modernization/migrate-feature [feature]`
  (which itself orchestrates 4 agents)

## Phase 4: Documentation
Run `/modernization/generate-docs all`
```

## Pattern 4: LLM-as-Judge (Evaluation)

An evaluator agent scores the output of an executor agent.

```
Executor ──► output ──► Judge ──► score
                           │
                           └── if score < threshold ──► re-execution
```

### Use Cases
- Implementation conformity vs specification
- Quality gates before merge
- Documentation validation

### Implementation

```yaml
---
name: implement-and-validate
---

# Implementation-Validation Loop

1. Run `backend-executor` for the task $ARGUMENTS
2. Run `conformity-reporter` on the result
3. If score < 80%:
   - Identify major deductions
   - Rerun `backend-executor` with corrections
   - Re-evaluate (max 2 iterations)
4. If score >= 80%: DONE
```

## Choosing the Right Pattern

```
Does the next task depend on the previous one?
├── YES → Sequential
└── NO
    Are the tasks at the same level?
    ├── YES → Parallel
    └── NO
        Are there sub-tasks within the tasks?
        ├── YES → Hierarchical
        └── NO → Parallel
```

## Combining Patterns

In practice, real projects combine multiple patterns:

```
Phase 1: Analysis (PARALLEL)
├── Technical (sequential internally)
└── Functional (sequential internally)

Phase 2: Migration per feature (SEQUENTIAL between features)
├── Spec → Plan → Impl → Conformity (SEQUENTIAL per feature)
│         ├── Backend (PARALLEL with Frontend if possible)
│         └── Frontend
└── Evaluation (LLM-AS-JUDGE)

Phase 3: Documentation (SEQUENTIAL)
```

## Best Practices

::: tip Do
- Use file checkpoints between agents
- Prefer parallel when tasks are independent
- Limit hierarchical depth to 2-3 levels
- Document the flow in the launcher skill
:::

::: danger Don't
- Parallelize tasks with dependencies (inconsistent results)
- Too deep hierarchy (context loss, cost)
- Orchestrator agent that also does execution
- Forget stop conditions in LLM-as-Judge loops
:::

## Resources

- [Official Documentation — Sub-agents](https://code.claude.com/docs/en/sub-agents)
