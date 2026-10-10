# Golden Rules

::: tip What you will find on this page
The wiki's golden rules gathered on one page: each fits on one line and links to the section that explains it, with, when useful, what the modernization project does ("In our project"). It is followed by the full go-live checklist of each building block. Mistakes to avoid are gathered in the [Pitfall catalog](/en/guide/warns).
:::

## Golden rules

### Context: CLAUDE.md, rules, skills

1. **Keep CLAUDE.md under 200 lines; put the rest in [rules](/en/reference/glossary#rule) with `paths` or in [skills](/en/reference/glossary#skill).** `@` imports do not lighten anything. → [CLAUDE.md — WARN-001](/en/concepts/claude-md#warn-001) · <span class="chez-nous">In our project</span> 82 lines, conventions in the `sym-*` and `front-*` skills.
2. **Write short, concrete, verifiable instructions; cut any line whose absence would not cause a mistake.** → [Writing good instructions](/en/concepts/claude-md#writing-good-instructions) · <span class="chez-nous">In our project</span> one line is enough for Docker: "Toutes les commandes backend via Docker Compose : `docker compose exec -T app <commande>` (sans `| cat`, pour garder le code de sortie)".
3. **Centralize paths in CLAUDE.md, never hardcode them in [agents](/en/reference/glossary#agent).** → [CLAUDE.md — WARN-002](/en/concepts/claude-md#warn-002) · <span class="chez-nous">In our project</span> a PATHS table of 11 aliases marked "SOURCE UNIQUE DE VERITE".
4. **One piece of information in one place: the convention in a skill, the rule only points to it.** → [Skills — WARN-004](/en/concepts/skills#warn-004) · <span class="chez-nous">In our project</span> the `symfony-api` rule loads `sym-api-conventions` and keeps only 4 reminders.
5. **One rule per topic, short and tied to an area of the code with `paths`.** → [Rules — WARN-003](/en/concepts/rules#warn-003) · <span class="chez-nous">In our project</span> "under 30 lines" guideline recommended by this wiki (not a Claude Code limit); 7 rules, the longest is 15 lines.
6. **A skill description says what AND when.** Without the "when", the skill does not trigger on its own. → [Skills — WARN-002](/en/concepts/skills#warn-002) · <span class="chez-nous">In our project</span> `sym-api-conventions`: "Conventions de developpement backend Symfony 7.4. […] Charger pour tout travail sur l'API REST backend."

### Control: settings, hooks

7. **Forbid through configuration, not through instructions.** A rule explains, only a [`deny`](/en/reference/glossary#regles-de-permission) or a [hook](/en/reference/glossary#hook) prevents. → [Instruction or block?](/en/concepts/which-mechanism#instruction-or-block) · <span class="chez-nous">In our project</span> the `legacy-readonly` rule backed by `deny Edit(/php-legacy/**)`.
8. **Write path rules as `Edit(…)` and `Read(…)` with `**`, never as `Write(…)`, which is ignored.** → [Settings — WARN-006](/en/concepts/settings#warn-006).
9. **Precise `allow`, `ask` for actions with impact, `deny` for secrets and what must never change.** → [What to put in allow vs ask vs deny](/en/concepts/settings#what-to-put-in-allow-vs-ask-vs-deny) · <span class="chez-nous">In our project</span> `git commit` and `git push` in `ask`, `.env*` denied for both reading and editing.
10. **Do not mistake a Bash `deny` for a boundary: against destructive commands, add a hook or the [sandbox](/en/reference/glossary#sandbox).** → [Hooks — security layers](/en/concepts/hooks#security-layers) · <span class="chez-nous">In our project</span> `deny Bash(rm -rf *)` only blocks that exact form; the `block-rm.sh` hook refuses the others (`rm -r`, `git rm -r` without `--cached`, `find -delete`).
11. **Do not take `docker compose *` out of the sandbox: limit `excludedCommands` to the exact form you use.** An excluded command runs with all your rights, and Claude can edit the compose file before running it. → [Settings — WARN-008](/en/concepts/settings#warn-008) · <span class="chez-nous">In our project</span> sandbox not enabled; if it is, exclude only `docker compose exec -T app *`.
12. **Test a hook on cases that must pass, not only on those it must block.** → [Hooks — WARN-006](/en/concepts/hooks#warn-006) · <span class="chez-nous">In our project</span> a hook published in this wiki blocked `docker compose exec -T app sh -c …`, the very form of the backend commands.
13. **In CI, choose explicitly between [`--bare`](/en/reference/glossary#bare) and the repository's configuration.** `--bare` loads no CLAUDE.md, agents or skills; without it, the repository's hooks and [MCP](/en/reference/glossary#mcp) servers run without a [trust dialog](/en/reference/glossary#dialogue-de-confiance). → [Hooks — WARN-008](/en/concepts/hooks#warn-008).

### Agents and pipeline

14. **One responsibility per agent, and only the tools it needs.** → [Agents — WARN-001](/en/concepts/agents#warn-001) · <span class="chez-nous">In our project</span> `legacy-technical-analyzer` and `legacy-functional-analyzer` have no `Edit`, only `Write` for their output.
15. **Pick the model for the task (Sonnet by default, Opus for deep analysis, Haiku for diagnostics) and lower the `effort` before switching models.** → [Which model to choose?](/en/concepts/agents#which-model-to-choose) · <span class="chez-nous">In our project</span> 7 Sonnet agents, 2 Opus, 2 Haiku.
16. **Write an approved plan into the spec or the delegation message: an agent does not see the conversation.** What was decided while chatting is lost if it is not passed on. → [Agents — pitfalls to know](/en/concepts/agents#pitfalls-to-know) · <span class="chez-nous">In our project</span> the [executors](/en/reference/glossary#executor) read the spec in `output/features/` and the planned tasks, not the exchange that produced them.
17. **Check a step's output before starting the next one.** Otherwise the next agent runs on nothing. → [Agents — WARN-004](/en/concepts/agents#warn-004) · <span class="chez-nous">In our project</span> `/mod-analyze-legacy` puts a checkpoint after every step.
18. **One writer per file when agents run in parallel; the [orchestrator](/en/reference/glossary#orchestrateur) updates shared files.** → [Parallelism and sequence](/en/examples/pipeline#parallelism-and-sequence) · <span class="chez-nous">In our project</span> the `legacy-feature-analyzer` agents run in BATCH MODE ("MODE BATCH"), `0-index.md` is updated once, at the end.
19. **Size `maxTurns` (files to read + files to write + 10) and check it on a real run.** A truncated output shows no error: the result is only marked partial, to be resumed with SendMessage. → [Agents — WARN-006](/en/concepts/agents#warn-006).
20. **Have work reviewed in a fresh context, against the spec and with the tests actually run, rather than asking "what is missing".** → [Correctness, conventions or conformity?](/en/examples/quality-review#correctness-conventions-or-conformity) · <span class="chez-nous">In our project</span> `conformity-reporter` approves from 80/100 and creates a V2, V3… report instead of overwriting the previous one.
21. **Commit every working state.** `/rewind` (Esc Esc) undoes neither commands (`docker compose exec`, npm, generators) nor the work of agents; only git does. → [`/rewind` or git?](/en/concepts/which-mechanism#undoing-a-mistake-rewind-or-git) · <span class="chez-nous">In our project</span> the migration code is written by the executors and by generators run through Docker.

### Maintenance

22. **Write commands in their real invocation form (`/dev:commit`, not `/dev/commit`).** → [Commands — WARN-008](/en/concepts/commands#warn-008) · <span class="chez-nous">In our project</span> CLAUDE.md and the `git` rule write `/dev:commit`.
23. **After renaming a folder, search for the old path in `settings.json`, the rules and the skills.** → [Rules — WARN-005](/en/concepts/rules#warn-005) · <span class="chez-nous">In our project</span> CLAUDE.md reminds you to update the PATHS table **then** search for the old path in `.claude/` (including `settings.json`) and `install-stack.sh`.
24. **Read a third-party skill, plugin or MCP server in full before installing it: it runs with your rights.** → [Audit a plugin before installing](/en/concepts/plugins#audit-a-plugin-before-installing).

## Full checklist

Generated from the Concepts pages: to change it, change the checklist of the relevant page.

<!-- checklist:start -->

### [CLAUDE.md](/en/concepts/claude-md) · 21 items

**Content**

- [ ] Commands Claude can't guess are documented
- [ ] <span class="chez-nous">In our project</span> Paths centralized in an alias table, "SINGLE SOURCE OF TRUTH" note visible
- [ ] Tech stack in 1 line
- [ ] Agents and skills read paths through the CLAUDE.md aliases, no hardcoded path ([WARN-002](/en/concepts/claude-md#warn-002))

**Organization**

- [ ] CLAUDE.md short (< 200 lines) — details in skills or `paths`-scoped rules (`@path` imports don't reduce context)
- [ ] Every line passes the "would removing it cause a mistake?" test
- [ ] No detailed conventions (those go in skills)
- [ ] No temporary instructions (plan file or conversation, not MEMORY.md)
- [ ] What a setting guarantees (`language`, `attribution`, permissions, security rules as `deny`) lives in settings.json, not in CLAUDE.md
- [ ] Each PATHS path searched for in `settings.json`, `.claude/rules/` and the skills before a rename
- [ ] Commands written in their actual invocation form (`/dev:commit`, not `/dev/commit`)

**Discovery**

- [ ] CLAUDE.md at root (`./` or `./.claude/`)
- [ ] `claudeMdExcludes` (globs on absolute paths) for CLAUDE.md files to ignore; managed CLAUDE.md for organization standards (cannot be excluded)
- [ ] Instructions specific to a subfolder in its own CLAUDE.md or a `paths`-scoped rule (loaded on demand, not at launch)
- [ ] `@path` imports with max depth of 4 hops
- [ ] `CLAUDE.local.md` listed in `.gitignore`

**Verification**

- [ ] `/init` to generate an initial CLAUDE.md
- [ ] `/context` (*Memory files* section) to verify loading
- [ ] `/memory` to check auto-memory
- [ ] Lasting instructions in the root CLAUDE.md (re-read after `/compact`, unlike subfolder CLAUDE.md files and `paths`-scoped rules) — test it
- [ ] `/doctor prompt-audit` run regularly (outdated or conflicting instructions)

### [Settings](/en/concepts/settings) · 24 items

**Permissions**

- [ ] No bare `"Read"` in `allow` (reads in the project are already free)
- [ ] `allow`: frequent, precise commands (`npm run test *` rather than `npm *`), `*` after a space
- [ ] `ask`: impactful actions (git push, deploy)
- [ ] `deny`: secrets (`Read(.env*)` + `Edit(.env*)`, bare name: any depth), legacy (`Edit(...)`)
- [ ] Destructive commands (rm -rf, force push): `PreToolUse` hook and/or sandbox, not just a Bash `deny`
- [ ] User settings: `deny` on `~/.ssh`, `~/.aws`, `~/.config/gh`
- [ ] "Don't ask again" rules reviewed and pruned (`/permissions`)
- [ ] No path `Write(...)` rule (ignored) — use `Edit(...)`
- [ ] Globs with `**` (recursive)
- [ ] MCP with granular permissions (`mcp__server__tool`)
- [ ] Relative paths chosen deliberately: `/path` (project root) or `path` (current directory)

**Files**

- [ ] `.claude/settings.json` for the team (git) — its `allow` rules only apply after the trust dialog
- [ ] `.claude/settings.local.json` for personal preferences (gitignore)
- [ ] `$schema` for IDE autocompletion
- [ ] <span class="chez-nous">In our project</span> `settings.json` paths aligned with the CLAUDE.md PATHS table

**Sandbox**

- [ ] Sandbox enabled if Claude runs non-Docker commands on the host (npm, scripts, network) — macOS, Linux, WSL2
- [ ] Sandbox `denyRead` or user-settings `Read(…)` deny for credentials (`~/.aws`, `~/.ssh`) — the two are merged
- [ ] `allowedDomains` for the network
- [ ] `excludedCommands` limited to the form actually used (`docker compose exec -T app *`), never `docker compose *` ([WARN-008](/en/concepts/settings#warn-008))

**Verification**

- [ ] `/status` (loaded files), `/permissions` (rules and source file), `claude doctor` (rejected entries)
- [ ] No ignored-rule warning at startup
- [ ] Test the deny rules: Claude must be blocked
- [ ] Test the allow rules: no unnecessary confirmation
- [ ] Security hook also tested on allowed commands (no false positive)

### [Rules](/en/concepts/rules) · 16 items

**Content**

- [ ] One topic per file, tied to an area of the code (otherwise CLAUDE.md or skill)
- [ ] No repetition of what a `deny` or a hook already guarantees
- [ ] No duplication between rule and skill
- [ ] Short rule; detailed conventions delegated to a skill ([WARN-003](/en/concepts/rules#warn-003))
- [ ] Specific and verifiable instructions (not "format the code nicely")
- [ ] Commands cited in their actual invocation form (`/dev:commit`)

**Globs**

- [ ] Precise and tested globs (`**` recursive, `*` one level)
- [ ] Braces for several extensions (`*.{ts,tsx}`), without stacking groups
- [ ] No `paths: ["**"]` (same as a rule without `paths`) ([WARN-004](/en/concepts/rules#warn-004))
- [ ] `/context` for rules without `paths`; `InstructionsLoaded` hook for `paths`-scoped rules (loaded on demand)
- [ ] Valid YAML frontmatter (`claude --debug`) — otherwise the rule becomes global
- [ ] `paths` match the current folders: after a rename, search for the old name in CLAUDE.md, `settings.json`, `.claude/rules/` and the skills

**Protection**

- [ ] "Read only" rule doubled with a `deny` in [`settings.json`](/en/concepts/settings)

**Organization**

- [ ] File named after its topic; subfolders allowed (recursive discovery)
- [ ] User rules in `~/.claude/rules/` for personal preferences
- [ ] Symlinks if rules are shared between projects (approval required if target is outside the project; then only rules without `paths` load)

### [Skills](/en/concepts/skills) · 21 items

**Content & type**

- [ ] Description: what the skill does **and** when to use it, in third person, natural keywords
- [ ] Correct type ([decision tree](/en/concepts/skills#passive-vs-launcher))
- [ ] `disable-model-invocation: true` for risky actions
- [ ] Skill called by the pipeline or preloaded by an agent (`skills:`): without `disable-model-invocation`
- [ ] SKILL.md < 500 lines, details in `references/`
- [ ] Nothing Claude already knows (language standards, generic explanations)
- [ ] Reference files linked **directly** from `SKILL.md` (one level deep)
- [ ] Table of contents at the top of reference files longer than 100 lines
- [ ] No time-sensitive information ("before August 2025…"), or keep it in an "old patterns" section

**Project coherence**

- [ ] No duplication with an existing [rule](/en/concepts/rules) (see [WARN-004](/en/concepts/skills#warn-004))
- [ ] Coherent prefix (<span class="chez-nous">In our project</span> `sym-`, `front-`, `mod-`)
- [ ] Skills listed in agents that need them (`skills:`)
- [ ] Conventions in a preloaded skill, not copied into the agents' prompt ([WARN-006](/en/concepts/skills#warn-006))

**Security & visibility**

- [ ] `allowed-tools` limited to strict necessities
- [ ] `context: fork` if the skill needs to run in isolation
- [ ] Deny [permissions](/en/concepts/settings) configured if needed (`Skill(name *)`)
- [ ] Third-party skill (public repo, colleague) **read in full** before use: `SKILL.md`, scripts and `` !`…` `` injections run with your privileges

**Validation**

- [ ] Tested with `/name` (launcher, standard) and through automatic triggering with a free message that matches the description (passive, standard)
- [ ] At least three scenarios compared with / without the skill ([Evaluating a skill](/en/concepts/skills#evaluating-a-skill))
- [ ] Tested with every target model
- [ ] Budget verified (`/context`, `/doctor`; warning in `claude --debug`)

### [Agents](/en/concepts/agents) · 18 items

**Design**

- [ ] Single responsibility per agent
- [ ] Appropriate model ([Sonnet by default, Opus for complex, Haiku for simple](/en/concepts/agents#which-model-to-choose))
- [ ] Tools limited to strict necessities
- [ ] `disallowedTools` if specific tools need to be excluded

**Description & delegation**

- [ ] Short, specific description — Claude uses it to decide when to delegate (see [Writing a good description](/en/concepts/agents#writing-a-good-description))
- [ ] Return format requested: short, structured summary
- [ ] `"Use proactively"` in description if automatic delegation desired
- [ ] Skills listed explicitly (no inheritance from parent conversation)
- [ ] Key instructions and approved plan written in the delegation message or the spec (the agent does not see the conversation)

**Execution**

- [ ] Checkpoints between sequential steps
- [ ] Result reviewed by a fresh-context subagent, limited to correctness and requirements
- [ ] `maxTurns` ≥ files to read + files to write + 10, checked on a real run; at the limit, the output is marked partial (resumable)
- [ ] `permissionMode` appropriate (`plan` for read-only, `dontAsk` for CI, `auto` if auto mode is available)

**Maintenance**

- [ ] File versioned in `.claude/agents/` (team sharing)
- [ ] Explicit names; <span class="chez-nous">In our project</span> domain prefix + role (`legacy-…`, `backend-tasks-…`, `frontend-tasks-…`)
- [ ] Output files documented in the prompt
- [ ] `memory: project` (or `user`) if cross-session learning desired
- [ ] Agents launched in parallel: a single writer per file; shared files updated by the orchestrator

### [Hooks](/en/concepts/hooks) · 20 items

**Security**

- [ ] PreToolUse on `Bash`: dangerous commands
- [ ] PreToolUse on `Write|Edit`: secrets
- [ ] Pair with [`settings.json` deny](/en/concepts/settings) for static blocks
- [ ] Prompt injection detection in `PostToolUse` on `Read|WebFetch`, not in `PreToolUse` ([WARN-007](/en/concepts/hooks#warn-007))
- [ ] CI job with `claude -p`: `--bare` / no `--bare` chosen deliberately ([WARN-008](/en/concepts/hooks#warn-008))

**Scripts**

- [ ] `chmod +x` on all scripts
- [ ] ALWAYS explicit `exit 0` at end of script (and `exit 2`, not `exit 1`, to block)
- [ ] Fast, local PreToolUse hooks (use `async: true` or `asyncRewake: true` if long)
- [ ] Test positive **and** negative cases (negative = the project's everyday commands, e.g. `docker compose exec -T app sh -c …`): `echo '{"tool_input":{"command":"rm -rf /"}}' | ./hook.sh; echo $?`; `|` escaped in `grep -E` patterns
- [ ] Scripts called via `"$CLAUDE_PROJECT_DIR"/…`, or `${CLAUDE_PROJECT_DIR}/…` in exec form (no relative path)
- [ ] `Stop` hook: check `stop_hook_active` to avoid a loop

**Configuration**

- [ ] Precise matchers (exact name or anchored regex, not `*`) + `if` to filter arguments
- [ ] Choose exit code OR JSON, not both
- [ ] Short, explicit `timeout` (a timed-out `PreToolUse` lets the call through)
- [ ] Hook declared in a skill: active for the rest of the session
- [ ] Don't rely on a hook `allow` to lift a `deny` or an `ask`

**Organization**

- [ ] Scripts in `.claude/hooks/` (versioned)
- [ ] Project hooks in `.claude/settings.json` (team)
- [ ] Personal hooks in `~/.claude/settings.json`
- [ ] Personal hooks for this repository, not shared: `.claude/settings.local.json`

### [MCP](/en/concepts/mcp) · 12 items

**Installation**

- [ ] Choose the right transport (`http` for remote, `stdio` for local, `ws` if the server pushes events); `type` set whenever there is a `url`
- [ ] Choose the right scope (`project`, i.e. `.mcp.json` in git, if team sharing; `local` otherwise)
- [ ] Test connection: `/mcp` in Claude Code

**Security**

- [ ] OAuth, then `headersHelper`, otherwise `${VARIABLE}` (never a plaintext token)
- [ ] `allow` limited to read tools; writes in `ask`, irreversible actions in `deny`
- [ ] Trusted servers from verified sources (official HTTP servers, maintained reference servers — no archived packages; prompt injection risk); a cloned repository's `.mcp.json` reviewed before approval

**Organization**

- [ ] CLI first (`gh`, `psql`, `kubectl`); MCP when it adds something
- [ ] `/context` to measure the cost; unused servers disabled in `/mcp`
- [ ] `--strict-mcp-config` in CI
- [ ] `MAX_MCP_OUTPUT_TOKENS` if large results expected; per-server `timeout` for long-running tools
- [ ] Heavy servers reserved for a subagent via `mcpServers` rather than in `.mcp.json`
- [ ] Subagent with `tools:`: wanted MCP tools listed, or `disallowedTools` instead

### [Plugins](/en/concepts/plugins) · 20 items

**Structure**

- [ ] `.claude-plugin/` holds only the manifest, everything else at the root
- [ ] Each skill in `skills/<name>/SKILL.md`
- [ ] Each agent in `agents/<name>.md`
- [ ] Hooks in `hooks/hooks.json`, wrapped in `"hooks": { … }`
- [ ] MCP in `.mcp.json` at the root
- [ ] No instructions in a `CLAUDE.md` (not loaded)

**Quality**

- [ ] Each `description` says what to do and when
- [ ] `"${CLAUDE_PLUGIN_ROOT}"` (quoted) for plugin paths, `${CLAUDE_PLUGIN_DATA}` for state
- [ ] Secrets declared in `userConfig` with `sensitive: true`
- [ ] Fast hooks, `timeout` adjusted for those that may block
- [ ] README at the root

**Distribution**

- [ ] Plugin reserved for tooling shared by several projects; what is specific to the project stays in `.claude/`
- [ ] Tested locally with `claude --plugin-dir ./my-plugin`
- [ ] `claude plugin validate --strict` in CI; set `version` or accept the warning its absence triggers
- [ ] `version` bumped on each release, or omitted (tracks commits)
- [ ] Hooks removed from `.claude/settings.json` after conversion ([why](/en/concepts/plugins#convert-a-claude-setup-into-a-plugin))
- [ ] Clear, descriptive, non-reserved name
- [ ] Sharing through the repository: `extraKnownMarketplaces` applies after the trust dialog; a plugin with an external source must be installed by each contributor ([details](/en/concepts/plugins#sharing-with-the-team))

**Installing a third-party plugin**

- [ ] **Will install** section read, then `hooks/hooks.json`, `.mcp.json` and `bin/`
- [ ] Auto-update turned off for unaudited third-party marketplaces

### [Commands](/en/concepts/commands) · 17 items

**Content**

- [ ] One file = one action (extract complex logic into a skill)
- [ ] Clear `description` and `argument-hint` if arguments
- [ ] Prerequisites declared (`compatibility`) and **checked in the body**, not in the description
- [ ] Useful context injected (`` !`git status` ``…) and required commands in `allowed-tools`
- [ ] No `name:` field (ignored in a command)

**Invocation**

- [ ] `disable-model-invocation: true` for commands with side effects (commit, deploy), not for checks (tests, lint)
- [ ] Reviews in `context: fork`
- [ ] No name conflict with an existing skill (nor with a bundled skill, unless replacement is intended)
- [ ] Invocation documented with the actual notation (`/folder:command`) in CLAUDE.md, the rules and the other commands

**Organization**

- [ ] Semantic subfolders (`dev/`, `review/`, `deploy/`) → namespaces `dev:`, `review:`…
- [ ] Personal commands in `~/.claude/commands/` if multi-project
- [ ] Naming: `{action}.md` (kebab-case)
- [ ] New workflows created directly as skills ([when to migrate](/en/concepts/commands#when-to-migrate-to-skill))

**Docker (this project's convention)**

- [ ] `-T` flag to avoid TTY allocation
- [ ] `2>&1` so that errors show up in the output
- [ ] No `| cat`: `cat`'s exit code (0) would hide the failure
- [ ] Command run via `cd <BACKEND_TARGET> && docker compose exec -T app <binary> 2>&1` (e.g. `php bin/phpunit`)

<!-- checklist:end -->

## Going further

- [Pitfall catalog](/en/guide/warns): every common mistake, sorted by severity
- [The essentials: which building block for which need?](/en/concepts/which-mechanism): the eight most common hesitations
- [Quick Start](/en/guide/getting-started): set up a first configuration

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
