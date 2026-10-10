# Quality control

::: tip What you will find on this page
Three review tools coexist in the project and they do not answer the same question: **is the code correct?** (`/code-review`), **does it follow our conventions?** (`/review:symfony-review`, `/review:frontend-review`), **does it do what the spec says?** (`conformity-reporter` agent). This page helps you choose and gives ready-to-use commands. Option details are in the [official documentation](https://code.claude.com/docs/en/code-review).
:::

## In short

| Tool | Question asked | Reference | Output | Changes code? |
|---|---|---|---|---|
| `/code-review` (built-in, alias `/review`) | Does this diff contain **bugs**? | The code itself | List of findings | Only with `--fix` |
| `/review:symfony-review`, `/review:frontend-review` (project) | Does this code follow **our conventions**? | `sym-*` / `front-*` convention skills (+ security or accessibility checks, dead code), reviewed in a forked context | CRITICAL → LOW findings + recommendation | No |
| `conformity-reporter` agent (project) | Is the implementation **compliant with the spec**? | Feature spec, analyses, conventions, actual test and linter output | Versioned report (V1, then `-V<N>`) with a score out of 100 | No |

Complementary built-in tools: `/simplify` (cleanup, does not look for bugs), `/security-review` (vulnerabilities in the branch diff), `/verify` and `/run` (check in the running app). See [Bundled skills](https://code.claude.com/docs/en/skills#bundled-skills).

### When to run what?

| Moment | Tool | Why at that moment |
|---|---|---|
| During implementation, on a local diff | `/code-review` | Fast, focused on the diff: fix while the context is fresh |
| Outside the pipeline, before `/dev:commit`; in the pipeline, on the batches `/mod-migrate-feature` has committed | `/review:symfony-review <path>` or `/review:frontend-review <path>` | Conventions are easier to fix before they spread |
| End of a feature pipeline | `conformity-reporter` (step 4 of `/mod-migrate-feature`) | Scoring needs the complete code, the tests and the spec |
| Before merging | `/security-review` | Analyzes the branch diff against `origin` |

## Correctness, conventions or conformity?

The three tools look alike ("review code") but they do not look at the same thing:

- `/code-review` reads the **diff** and looks for what is wrong: inverted condition, forgotten `null` case, query that does not filter. It does not know the feature spec.
- `/review:symfony-review` applies **our conventions** (the `sym-api-conventions` and `sym-testing-conventions` skills, which are authoritative): Controller → Service → Repository flow, DTOs, PSR-12, UUID, `DateTimeImmutable`, AAA tests named `test{Action}With{Condition}()`, plus a few security and dead-code checks. It runs in a fresh context (`context: fork`) and changes no file. It does not look for logic bugs.
- `conformity-reporter` compares the implementation with the **14-section spec** (including faithfulness to the legacy: any behavior that differs from sections 1 to 12 without a transposition or an arbitrated `Corriger : …` deviation is an issue) and the backend/frontend analyses, **runs** PHPUnit, phpcs, Vitest, ESLint and the typecheck, then computes a weighted score.

Only `conformity-reporter` scores: its Critical → Low issues lead to deductions (scale: [Methodology, step 4](/en/guide/methodology#step-4)); the CRITICAL → LOW findings of `/review:*` give no score.

**The question to ask:** *what would be serious if it were missed?*
- A bug in what I just wrote → `/code-review`.
- A deviation from the project architecture or standards → `/review:symfony-review` or `/review:frontend-review`.
- A legacy business rule forgotten or reproduced wrongly → `conformity-reporter`.

For a migrated feature, the three are chained before it is considered done. Elsewhere in the wiki:

- the `conformity-reporter` scoring grid (deductions, weights, 80/100 threshold): [Methodology, step 4](/en/guide/methodology#step-4);
- the quality loop (a single correction pass, then a V2 report): [Methodology, step 5](/en/guide/methodology#step-5);
- over-correction by a reviewer asked "what is missing": [Agents, LLM-as-Judge](/en/concepts/agents#llm-as-judge-fresh-context-review);
- the `/review:symfony-review` notation (colon, not slash): [Commands, WARN-008](/en/concepts/commands#warn-008).

::: warning Review in CI: provide Docker
The example job in the [GitLab CI/CD documentation](https://code.claude.com/docs/en/gitlab-ci-cd) uses the `node:24-alpine3.21` image, which does not provide Docker. Since all the project's backend commands go through `docker compose exec -T app …`, a review job that has to run the tests (as `conformity-reporter` does) must run on a runner that provides Docker.
:::

## Common mistakes to avoid

#### `WARN-001`: Mistaking one tool for another {#warn-001 .warn-title}
*Origin: design of this project's pipeline (three checks with different references).*

::: danger Problem
"`/code-review` found nothing, the feature is good" or "the conformity score is 92, there is no bug". Each tool is blind to what the other two look at.
:::

::: info Solution
Choose the tool from the question ([In short](#in-short) table) and, for a migrated feature, run all three.
:::

#### `WARN-002`: Judging tests without running them {#warn-002 .warn-title}
*Origin: project rule (`mod-conformity-conventions` skill, rule 7 "Actual test execution").*

::: danger Problem
A reviewer that reads the tests and concludes "they pass" is regularly wrong: it infers instead of observing.
:::

::: info Solution
Run the tools and rely on their output, as `conformity-reporter` does: `cd <BACKEND_TARGET> && docker compose exec -T app php bin/phpunit 2>&1` (no `| cat`, which would hide the exit code), `… php vendor/bin/phpcs --standard=PSR12 src/`, `cd <FRONTEND_TARGET> && npm test -- --run --reporter=verbose`, `npm run lint`, `npm run typecheck`.

PHPUnit success criterion: the one from `/dev:php-test` (exit code 0 and at least one test run). A deprecation or a warning fails the suite; "No tests executed!" or a stopped container is reported as "tests not run", with no invented result.
:::

## Ready-to-use examples

```text
# Bugs in the current diff, most certain findings, then fix
/code-review high --fix

# Backend conventions on a given folder (no argument: `git diff HEAD`)
/review:symfony-review api-rest-symfony-target/src/Service/

# Frontend conventions
/review:frontend-review app-react-target/src/

# Conformity report for a feature (normally launched by /mod-migrate-feature)
Use the conformity-reporter agent with the prompt "Feature : User_Authentication"
```

## Going further

- [Methodology](/en/guide/methodology) — the project pipeline, conformity grid and quality loop
- [Agents](/en/concepts/agents) — LLM-as-Judge pattern and over-correction
- [Commands](/en/concepts/commands) — `/review:…` naming
- Official documentation: [Code Review](https://code.claude.com/docs/en/code-review) · [Ultrareview](https://code.claude.com/docs/en/ultrareview) · [Bundled skills](https://code.claude.com/docs/en/skills#bundled-skills) · [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
