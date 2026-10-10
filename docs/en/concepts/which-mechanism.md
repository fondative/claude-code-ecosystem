# The essentials: which building block for which need?

::: tip What you will find on this page
The eight most common hesitations when configuring Claude Code. For each one: what the two options do, the question to ask yourself, the answer, and **the choice made in the modernization project** ("In our project" box). Each building block is detailed on its own Concept page.
:::

## Instruction or block?

- An **instruction** (CLAUDE.md, [rule](/en/reference/glossary#rule), [skill](/en/reference/glossary#skill)) *asks* Claude to do or avoid something. It obeys almost always, but nothing forces it to.
- A **block** (a [`deny` rule](/en/reference/glossary#regles-de-permission) in the settings, a [hook](/en/reference/glossary#hook)) is enforced by Claude Code itself: the action is refused before it happens, whatever Claude decides.

**The question to ask:** *if Claude breaks the rule even once, is it serious?*
- No → an instruction is enough.
- Yes → you need a block:
  - the rule always targets the same folder or command → a **`deny`** rule in `settings.json`;
  - the decision depends on content (a command containing a password, for example) → a **`PreToolUse` hook**.

::: info In our project
The `php-legacy/` folder must **never** be modified. The project therefore uses both:
- the `legacy-readonly` rule **explains** to Claude why this code is read-only (instruction);
- the `deny Edit(/php-legacy/**)` rule in `settings.json` actually **prevents** it from being modified (block).

A rule alone would not be enough: see [Rules — WARN-002](/en/concepts/rules#warn-002).
:::

## CLAUDE.md, rule or skill?

All three hold instructions; what changes is **when** Claude reads them.

**The question to ask:** *when is this information useful?*
- In **every** session → **CLAUDE.md** (under 200 lines).
- Only when Claude touches **some files** → a **rule** with `paths`.
- **Now and then**, or it is a procedure to follow → a **skill**.

::: info In our project
- The **project paths** are in CLAUDE.md: every agent needs them.
- The **"TDD is mandatory (tests before code)"** reminder is in the `symfony-api` rule: it only matters when Claude works in `api-rest-symfony-target/`.
- The **15 Symfony convention files** are in the `sym-api-conventions` skill: they are only read when writing backend code.
:::

## Skill or agent?

- A **skill** adds instructions **to the current conversation**.
- An **[agent](/en/reference/glossary#agent)** works **in its own context**, separately, and returns only a summary.

**The question to ask:** *will the task read many files or produce a lot of output?*
- Yes → an **agent**: the main conversation stays readable.
- No → a **skill**.

::: info In our project
The two combine. Conventions are **skills**, **preloaded** into the **agents** that need them (the agent's `skills:` field). For example, the `backend-tasks-executor` agent starts with `sym-api-conventions` and `sym-testing-conventions` already loaded.
:::

## Hook or skill?

- A **hook** is a script that **Claude Code runs itself**, automatically, at a precise moment (for example right after every file change). Claude does not have to think about it and cannot forget it, like a smoke detector.
- A **skill** is a **procedure sheet** that Claude reads and then applies. It can adapt it to the situation, but it can also skip a step or forget it.

**Same need, handled both ways:** "after every change to a PHP file, reformat it to the PSR-12 standard".

| | With a hook | With a skill |
|---|---|---|
| How | Claude Code runs `phpcbf` right after every change to a `.php` file | The skill tells Claude: "after editing PHP, run `phpcbf`" |
| If Claude forgets? | Impossible: Claude is not the one running it | Possible: the file stays badly formatted |
| Right choice? | <Icone nom="check" /> It is always the same command | <Icone nom="x" /> |

Conversely, "fix a failing test" means reading the error, understanding its cause and choosing what to change: a script cannot do that, it is a **skill**.

**The question to ask:** *is the task always identical (a fixed command), or does it need thinking depending on the situation?*
- Always identical (format, block a command, write to a log) → **hook**.
- It needs thinking or adapting → **skill**.

::: info In our project
The project has **only one hook**: `block-rm.sh` (`PreToolUse` on `Bash`), which denies recursive deletions. The next candidate is precisely the example above: PSR-12 formatting, run **by hand** with `/dev:php-lint`. With a hook, it would happen on every change, without thinking about it. → Ready-to-use example: [Hooks — examples](/en/concepts/hooks#ready-to-use-examples).
:::

## MCP or command line?

- An **[MCP](/en/reference/glossary#mcp) server** gives Claude tools for an external service (database, GitHub, Slack…).
- The **command line** (`git`, `docker`, `psql`, `kubectl`…) is already usable by Claude through the Bash tool.

**The question to ask:** *is there already a command-line tool for this service?*
- Yes → use the **command line**: it costs less context.
- No, or the service needs [OAuth](/en/reference/glossary#oauth) authentication that the command line doesn't handle → **MCP**.

::: info In our project
No MCP server. Everything goes through the command line, in particular `docker compose exec -T app …` for the backend.
:::

## Agent or workflow? {#agent-or-workflow}

- With **agents**, Claude decides itself, step by step, which agent to launch next.
- A **[workflow](https://code.claude.com/docs/en/workflows)** is a script that launches and coordinates many agents in a predictable way.

| | Agents driven by Claude ([launcher skill](/en/reference/glossary#skill-launcher)) | Workflow |
|---|---|---|
| Who decides the next step | Claude, turn by turn | The script |
| Target scale | A few agents per turn | Dozens to hundreds of agents |
| Human intervention along the way | Possible | **Impossible** during a run |
| Resuming after an interruption | Rerun (checkpoints to plan for) | Finished agents return their cached result |

**The question to ask:** *how many agents, must their results be cross-checked, and must a human decide along the way?*
- A few agents, or a human must be able to decide between two steps → Claude drives them, from a skill.
- Dozens of agents, or results that must check each other, with no human decision during the run → a **workflow**.
- A workflow costs significantly more tokens than a conversation: try it first on a slice (two or three items) before the whole scope.
- When a stopped run is resumed, a failed agent is rerun along with every agent started after it: each agent must be replayable (it writes or rewrites its own file, never appends).

::: info In our project
Analyzing the legacy features in parallel (13 simultaneous `legacy-feature-analyzer` agents, according to the lessons recorded in the `claude-code-parallel-agents` skill) fits in agents launched by a skill. Beyond that, a workflow would become useful. `/mod-migrate-feature` stays a skill because it stops several times for a human decision: see [Human Oversight](/en/guide/methodology#human-oversight). The pitfall to avoid when running agents in parallel: [Agents — WARN-005](/en/concepts/agents#warn-005).
:::

## Which permission mode, at which step? {#which-permission-mode-at-which-step}

The **[permission mode](/en/reference/glossary#modes-de-permission)** sets what Claude can do without asking you: ask for everything (`default`), accept file edits (`acceptEdits`), only read and propose (`plan`), let a classifier judge (`auto`), refuse anything not allowed (`dontAsk`)… Mode details: [official documentation](https://code.claude.com/docs/en/permission-modes).

**The question to ask:** *at this step, must Claude write, and where?*
- It must write nothing → `plan` ([plan mode](/en/reference/glossary#plan-mode)).
- It only writes in planned folders (for example `output/`) → `default`, with an `allow` rule on those folders.
- It changes a lot of code that you will review afterwards → `acceptEdits`.
- Nobody is there to answer (CI, scheduled task) → `dontAsk`, with a precise `allow` list.
- A **background** agent asks for a permission → granting it "for the rest of the session" grants it to **the whole session**, main conversation included ([official documentation](https://code.claude.com/docs/en/sub-agents#run-subagents-in-foreground-or-background)).
- To refuse without stopping everything → `Esc` denies that call without stopping the agent; only give a lasting grant if you would have put it in `settings.json`.

::: info In our project
The choice is written in each agent's [frontmatter](/en/reference/glossary#frontmatter) (`permissionMode`):

| Step | Agents | Mode | Why |
|---|---|---|---|
| Analysis, specification, planning | `legacy-*`, `*-planner` | `default` | They only write to `output/`, already allowed |
| Implementation | `backend-tasks-executor`, `frontend-tasks-executor` | `acceptEdits` | Many edits, reviewed afterwards by review and conformity |
| Conformity | `conformity-reporter` | `default` | A single report in `output/reports/` |
| Diagnostics | `health-check` | `plan` | It checks, it does not fix |

Beware: if the main session runs in `auto`, `acceptEdits` or `bypassPermissions` (a mode that skips every permission prompt), **every** agent takes that mode and its `permissionMode` is ignored. The risk stays limited here, because the legacy code and `.env` files are protected by `deny` rules, which apply whatever the mode. The `deny Bash(rm -rf *)` rule, however, only blocks that exact form: `rm -fr` or `rm -r -f` are stopped by the `block-rm.sh` hook, a safeguard that doesn't see everything (a Python script, for example) (see [Hooks — security layers](/en/concepts/hooks#security-layers)).
:::

## Undoing a mistake: `/rewind` or git? {#undoing-a-mistake-rewind-or-git}

- **`/rewind`** (or `Esc Esc`) goes back to the state before one of your messages, in one move. But it only undoes what Claude changed **with its edit tools**, in **this** session.
- **git** undoes everything, whatever made the change, and lasts beyond the session.

**The question to ask:** *who made the change?*
- Claude, with its edit tools, directly in the conversation → **`/rewind`** is enough.
- A **command** (Docker, npm, a generator) or an **agent** → **git**: `/rewind` does not see it.
- It is a working state you want to keep → **commit**.

::: info In our project
Most of the migration code is written by the **[executor](/en/reference/glossary#executor)** agents and by `docker compose exec` commands (Symfony generators, `phpcbf`). **Neither is undone by `/rewind`.** Example: Claude runs `make:migration` through Docker, then you press `Esc Esc` → the generated migration is still there. In this project, **git is the real safety net**: commit every working state.
:::

## Going further

- [Philosophy & Vision](/en/introduction/) — the three families (context, control, extension) and priority rules
- [Pitfall catalog](/en/guide/warns) — common mistakes from every building block, by severity
- [.claude/ Project Structure](/en/examples/project-structure) — the project's configuration file by file

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
