# Model Strategy

## Principle

The model choice for each agent is an architectural decision that directly impacts quality, speed and cost. The rule: **use the least expensive model that produces the required quality**.

## Selection Matrix

| Criterion | Opus | Sonnet | Haiku |
|-----------|------|--------|-------|
| Complex reasoning | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Instruction following | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Speed | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Cost | $$$ | $$ | $ |
| Context window | 1M tokens | 200k tokens | 200k tokens |

## Project Distribution

### Opus — Deep Analysis (2 agents)

```yaml
# legacy-technical-analyzer.md
model: opus
# Justification: complete reverse engineering of an unknown codebase
# Requires: multi-step reasoning, architecture deduction

# legacy-feature-analyzer.md
model: opus
# Justification: 12-section specification from undocumented code
# Requires: deep understanding of business and flows
```

**Why Opus?** These tasks require understanding an entire codebase without documentation, deducing architecture, patterns and implicit business rules. Sonnet doesn't produce the same depth of analysis.

### Sonnet — Implementation and Planning (8 agents)

```yaml
# backend-tasks-planner.md / frontend-tasks-planner.md
model: sonnet
# Justification: structured decomposition with spec as input
# The Opus spec provides context — Sonnet executes

# backend-tasks-executor.md / frontend-tasks-executor.md
model: sonnet
# Justification: TDD with clear conventions (skills)
# Skills provide patterns — Sonnet applies

# conformity-reporter.md
model: sonnet
# Justification: evaluation with defined scoring grid
# Framework is clear — Sonnet judges and scores

# legacy-feature-analyzer-refiner.md
model: sonnet
# Justification: refinement of existing spec (not creation)

# legacy-functional-analyzer.md
model: sonnet
# Justification: structured inventory with known patterns
```

**Why Sonnet?** These agents have clear context (specifications, conventions, analyses) and apply defined patterns. Opus's creative reasoning isn't necessary.

### Haiku — Lightweight Tasks (3 agents)

```yaml
# legacy-functional-analyzer-auditor.md
model: haiku
# Justification: verification of an existing inventory
# Comparison task, not creation

# documentation-generator.md
model: haiku
# Justification: structured Markdown generation
# Clear template, no complex reasoning

# health-check.md
model: haiku
# Justification: file existence verification
# Simple and fast diagnostics
```

**Why Haiku?** These tasks are structured, repetitive and don't require complex reasoning. Haiku is 10x cheaper than Sonnet for equivalent results.

## Cost Impact

### Estimation Per Migrated Feature

| Step | Agent | Model | Estimated tokens |
|------|-------|-------|-----------------|
| Specification | feature-analyzer | Opus | ~50k input + ~10k output |
| Backend planning | backend-planner | Sonnet | ~30k input + ~8k output |
| Frontend planning | frontend-planner | Sonnet | ~25k input + ~6k output |
| Backend implementation | backend-executor | Sonnet | ~40k input + ~20k output |
| Frontend implementation | frontend-executor | Sonnet | ~35k input + ~15k output |
| Conformity | conformity-reporter | Sonnet | ~30k input + ~5k output |

### Optimization

1. **Opus only when necessary** — Technical analysis is done once for the entire project
2. **Skills as context** — References prevent Sonnet from "guessing" conventions
3. **Haiku for repetitive work** — Documentation and serial audits

## Decision Tree

```
Does the task require understanding undocumented code?
├── YES → Opus
└── NO
    Does the task produce code or specifications?
    ├── YES → Sonnet
    └── NO
        Does the task follow a clear template?
        ├── YES → Haiku
        └── NO → Sonnet (default)
```

## When to Scale Up

Signals that a Haiku agent should be Sonnet:
- Incomplete or poorly structured outputs
- Forgotten sections in templates
- Misinterpretation of complex instructions

Signals that a Sonnet agent should be Opus:
- Superficial analysis of complex code
- Specifications missing edge cases
- Poor deduction of implicit architecture

## Lesson Learned

> **The refiner was upgraded from Haiku to Sonnet** after finding that Haiku produced overly superficial refinements. Specification refinement requires understanding business context, not just rephrasing.
