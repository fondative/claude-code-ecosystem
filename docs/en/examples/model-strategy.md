# Model Strategy

This page justifies the model of each of the project's 11 agents. The general strategy (which model for which task, decision heuristic, costs) is described in [Agents — Which Model to Choose?](/en/concepts/agents#which-model-to-choose); the overall distribution in [Methodology — Model Distribution](/en/guide/methodology#model-distribution).

## Justification per agent

`model` and `maxTurns` values taken from the frontmatter of the project's `.claude/agents/*.md` files.

| Agent | `model` | `maxTurns` | Justification |
|-------|---------|------------|---------------|
| `legacy-technical-analyzer` | `opus` | 100 | Reverse engineering of raw, undocumented code: inferring the architecture, flows and implicit patterns |
| `legacy-functional-analyzer` | `sonnet` | 50 | Features / roles / flows inventory based on the already-generated technical report, not raw code |
| `legacy-functional-analyzer-auditor` | `haiku` | 35 | Comparing an existing inventory with the legacy: verification, not creation |
| `legacy-feature-analyzer` | `opus` | 50 | 14-section specification from undocumented code: implicit business rules, edge cases |
| `legacy-feature-analyzer-refiner` | `sonnet` | 35 | Enriching an existing spec, which requires understanding the business context, not just rephrasing |
| `backend-tasks-planner` | `sonnet` | 35 | Structured breakdown from the spec: the Opus spec provides the context |
| `frontend-tasks-planner` | `sonnet` | 35 | Breakdown from the spec and the OpenAPI contract defined on the backend side |
| `backend-tasks-executor` | `sonnet` | 60 | TDD guided by the skills' references (`create-entity.md`, `create-dto.md`…): the patterns are given; `maxTurns` sized for a batch of 3 tasks (the launcher splits the work) |
| `frontend-tasks-executor` | `sonnet` | 60 | TDD guided by the frontend skills, including the conditional Figma design integration; `maxTurns` sized for a batch of 3 tasks |
| `conformity-reporter` | `sonnet` | 45 | Evaluation against a defined deduction grid (`mod-conformity-conventions` skill) |
| `health-check` | `haiku` | 50 | Reads the whole configuration (11 agents, 12 skills, 7 rules, `settings.json`, install script) and runs consistency checks, including hardcoded paths |

Two choices go against the "the more important, the bigger the model" intuition: `legacy-functional-analyzer` is on Sonnet because it reads the technical report, not raw code, and `legacy-feature-analyzer-refiner` is on Sonnet rather than Haiku because a refinement must enrich the spec, not just rephrase it. → [Methodology — Model Distribution](/en/guide/methodology#model-distribution)

::: info This project's convention
`maxTurns` = estimated budget (files read + files written + commands) + a margin of 10, written as a YAML comment next to the value. Example, `backend-tasks-planner.md`:

```yaml
maxTurns: 35   # ~20 lus (CLAUDE.md, spec, index, OPENAPI_SPEC, references, docs techniques) + 1 ecrit (analyse, section OpenAPI incluse) + 10 = 31
```

For the executors, the calculation covers one batch: `3 x 12 + 4 fixes + 3 doc + 10 marge = 53`, rounded up to 60. If an agent is cut off, the launcher resumes it (SendMessage) until the batch is done; if this keeps happening, it switches to batches of 2 tasks rather than raising `maxTurns`. See [Agents, WARN-006](/en/concepts/agents#warn-006) and the `claude-code-parallel-agents` skill.
:::

---

*Verified with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
