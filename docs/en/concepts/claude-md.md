# CLAUDE.md

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Persistent instructions file loaded in full at every session |
| **Where** | `./CLAUDE.md` or `./.claude/CLAUDE.md` (project), `./CLAUDE.local.md` (personal, not versioned), `~/.claude/CLAUDE.md` (personal) |
| **Role** | What Claude can't guess: commands, project-specific conventions, paths, gotchas. <span class="chez-nous">In our project</span> it also serves as the "single source of truth" for paths (in-house convention) |
| **Loading** | Full (up to 4 MiB), concatenated with the other levels, survives `/compact` |
| **Relationship** | Always-loaded foundation; [rules](/en/concepts/rules) and [skills](/en/concepts/skills) add detail only when it's needed |
| **What this page adds** | What to put (and not put) in CLAUDE.md, the actual file of a modernization project and the gotchas it illustrates |

---

## The essentials in 2 minutes

CLAUDE.md is a Markdown file that Claude Code loads **in full at the start of every session**. It holds what Claude can't guess by reading the code: commands, project-specific conventions, paths, gotchas. CLAUDE.md files from different levels **stack** instead of replacing each other.

```
~/.claude/CLAUDE.md      personal, all projects          ─┐
./CLAUDE.md              project, versioned (git)         ├─► session context
./CLAUDE.local.md        personal, not versioned          │   (root re-read after /compact)
./src/CLAUDE.md          loaded when Claude touches src/ ─┘
```

Minimal example, from the [official best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md):

```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

Four facts change how you design a CLAUDE.md:

1. **It is context, not a barrier.** Claude follows instructions as best it can; to block an action, use a [`deny`](/en/reference/glossary#regles-de-permission) rule in [settings.json](/en/concepts/settings), a `PreToolUse` [hook](/en/concepts/hooks) or the [sandbox](/en/reference/glossary#sandbox).
2. **Every line is paid for on every request.** The file is loaded in full: target under 200 lines and move detail into [skills](/en/concepts/skills) or [`paths`-scoped rules](/en/concepts/rules). `@path` imports lighten nothing, they load at launch.
3. **Files stack, none "wins".** Two conflicting instructions (across files or levels): Claude may follow either one arbitrarily ([memory](https://code.claude.com/docs/en/memory#audit-your-instruction-files)); `/doctor prompt-audit` finds them (see [Maintenance](#maintenance)).
4. **After `/compact`, the file is re-read, not the conversation.** An instruction given in chat can disappear; one written in the root CLAUDE.md comes back.

→ How it all works (locations, load order, imports, [auto memory](/en/reference/glossary#auto-memory), exclusions, [compaction](/en/reference/glossary#compaction)): [official documentation — Memory](https://code.claude.com/docs/en/memory).

---

## Designing your CLAUDE.md well

### Writing Good Instructions

For each line, ask: **"Would removing this cause Claude to make mistakes?"** If not, cut it ([best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)).

| <Icone nom="check" /> Include | <Icone nom="x" /> Exclude |
|-----------|-----------|
| Bash commands Claude can't guess | Anything Claude can figure out by reading code |
| Code style rules that differ from defaults | Standard language conventions |
| Testing instructions and preferred test runners | Detailed API documentation (link instead) |
| Repository etiquette (branches, PRs) | Information that changes frequently |
| Project-specific architectural decisions | Long explanations, tutorials |
| Environment quirks (required variables) | File-by-file descriptions of the code |
| Non-obvious gotchas | Self-evident practices ("write clean code") |

- **Concrete and verifiable**: "Use 2-space indentation" rather than "Format code properly"; "Run `npm test` before committing" rather than "Test your changes".
- **When to add a line**: when Claude gets something wrong that it couldn't infer from the code. If it asks a question already answered in CLAUDE.md, the wording is ambiguous: rephrase rather than add.
- **Rare emphasis**: if Claude skips one specific instruction, add "IMPORTANT" to **that line alone**. Emphasizing everything emphasizes nothing.
- **Guarantee ≠ instruction**: anything that must happen every time (blocking, formatting, running a test) belongs in a [hook](/en/concepts/hooks) or a [permission](/en/concepts/settings), not a sentence.

### Usage Matrix: What Goes Where?

| Information | Where to Put It | Why |
|-------------|----------------|-----|
| Project paths | **CLAUDE.md** | Single source of truth |
| Available commands | **CLAUDE.md** | Workflow overview |
| Tech stack (1 line) | **CLAUDE.md** | Global context |
| Detailed conventions | **[Passive skill](/en/concepts/skills)** | Too long for CLAUDE.md |
| Short contextual reminder | **[Rule](/en/concepts/rules)** | Injected based on files |
| Personal preferences | **~/.claude/CLAUDE.md** | Not in the repo |
| Claude's learnings | **MEMORY.md** (auto memory) | Written and pruned by Claude |
| In-progress tasks, TODOs | **Plan file** (`PLAN.md`…) or conversation | Temporary, driven by you |
| Security (deny/allow) | **[settings.json](/en/concepts/settings)** | Real blocking (not just context) |

### The project's actual configuration

<span class="chez-nous">In our project</span> The modernization project's root `CLAUDE.md`:

| Element | In the project |
|---------|----------------|
| Files | Only one: `./CLAUDE.md`. No `.claude/CLAUDE.md`, no `CLAUDE.local.md`, no subfolder CLAUDE.md, no `@` import |
| Size | **82 lines**, 5.4 KB — under the recommended 200-line threshold |
| Structure | 2 sections: *Configuration du Projet* (stack, PATHS, commands, conventions) and *Workflow de Modernisation* (launcher skills, technical commands, agents/skills/rules, workflow order) |
| PATHS table | **11 aliases** (`SOURCE_PROJECT` → `./php-legacy`, `BACKEND_TARGET`, `OPENAPI_SPEC`, `REPORTS_DIR`, `WIKI_TARGET`…); all 11 agents point to CLAUDE.md for their paths |
| Conventions | No detailed code rules: **pointers** to the `sym-*` and `front-*` skills |
| Inventories | Lists of the 4 launcher skills and the 8 technical commands; for agents, skills and rules, a plain pointer to their `.claude/` folder |

::: info This project's convention: PATHS alias table
Agents and skills read `SOURCE_PROJECT`, `BACKEND_TARGET`… from the table instead of hardcoding paths. This is an **in-house convention**, useful when many agents share the same paths — not a Claude Code feature.
:::

What to take from it: the PATHS table is not the only copy of the paths. `php-legacy` also appears in the `settings.json` `deny` and in the `legacy-readonly` rule glob. The CLAUDE.md note lists these copies (`settings.json`, the rules' `paths:`, `STACK_DIRS` in `.claude/scripts/install-stack.sh`) and asks, after a rename, for a `grep` over `.claude/` followed by the `health-check` agent. The technical commands are written in their actual invocation form, `/dev:commit` (the subfolder becomes a namespace separated by `:`).

### Gotchas

- **Subfolder CLAUDE.md files only load on demand**, when Claude reads or modifies a file in that folder (including a `cat` through Bash). At launch, only those of the current directory and its parents load.
- **`@path` imports load at launch**, along with the file containing them (max depth: 4 hops). An import pointing outside the project triggers an approval dialog.
- **Auto memory is not CLAUDE.md**: it is notes Claude writes itself (corrections, preferences) in `~/.claude/projects/<project>/memory/`, with a `MEMORY.md` index. The "200 lines or 25KB" limit applies to that index; CLAUDE.md loads in full up to 4 MiB (beyond that, it is skipped). `/memory` lets you browse or disable it.
- **A [managed](/en/reference/glossary#managed) CLAUDE.md** (deployed by the organization to a system location, e.g. `/etc/claude-code/CLAUDE.md` on Linux) adds to all the others and **cannot be excluded**. Other CLAUDE.md files (e.g. other teams' in a monorepo) can be skipped with the [`claudeMdExcludes`](/en/reference/glossary#claudemdexcludes) setting: a list of [globs](/en/reference/glossary#glob) matched against absolute paths.
- **Block-level HTML comments are stripped** before injection: they cost nothing and suit maintainer notes.
- **`CLAUDE.local.md` must be in `.gitignore`** and only exists in the worktree where it was created.
- **If an instruction disappears after `/compact`**, it was in the conversation, or in a subfolder CLAUDE.md (or a `paths` rule) that hasn't reloaded yet.

Details and sources: [official documentation — Memory](https://code.claude.com/docs/en/memory).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001`: File too long / monolithic {#warn-001 .warn-title}
*Origin: official documentation (target under 200 lines per file).*

A 200+ line CLAUDE.md drowns essential information and reduces Claude's adherence.

::: danger Problem
```markdown
## Architecture (100 lines)
## Patterns (100 lines)
## DTOs (100 lines)
```
Everything in a single file — impossible to scan, Claude can no longer distinguish what's essential.
:::

::: info Solution
```markdown
## Stack
Symfony 7.4, PostgreSQL, Docker

## Conventions
See skill `sym-api-conventions` for details.
```
Keep CLAUDE.md **short and factual** (< 200 lines). Delegate details to skills (loaded on demand) and `paths`-scoped rules. Splitting into `@path` imports organizes the file but **doesn't reduce** context.
:::

---

#### `WARN-002`: Hardcoded paths in agents {#warn-002 .warn-title}
*Origin: project rule (PATHS section); experienced on this project: hardcoded paths had to be removed from the `documentation-generator` agent (commit `847ccc2`).*

If a folder is renamed, you have to update every agent one by one. <span class="chez-nous">In our project</span> agents read the path aliases from CLAUDE.md.

::: danger Problem
```markdown
Read files in ./php-classified-ads-legacy/
```
Hardcoded path in the agent — fragile and a source of silent bugs.
:::

::: info Solution
```markdown
Read SOURCE_PROJECT (defined in CLAUDE.md)
```
The agent reads the path from CLAUDE.md. If the folder is renamed, **only one place to update**.
:::

---

#### `WARN-003`: Duplicated conventions {#warn-003 .warn-title}
*Origin: experienced on this project: the Docker command, written in both CLAUDE.md and the `symfony-api` rule, diverged: the `-T` flag was missing from CLAUDE.md for a long time (commits `e0b87b5`, `dfb52db`).*

The same conventions written in two places will inevitably diverge.

::: danger Problem
```markdown
<!-- CLAUDE.md -->
- Toutes les commandes backend via Docker Compose : `docker compose exec -T app [commande] 2>&1 | cat`

<!-- .claude/rules/symfony-api.md -->
- Commandes via `docker compose exec -T app [cmd] 2>&1 | cat`
```
The same instruction in two places: when one changes (adding `-T`), the other lags behind — which one is authoritative?
:::

::: info Solution
Write the instruction **in one place only**. A command valid for the whole project stays in CLAUDE.md (always loaded); the `symfony-api` rule keeps only what is backend-specific (TDD, PSR-12) or **points** to CLAUDE.md. Same principle for detailed conventions: CLAUDE.md points to the skill (`See skill sym-api-conventions`) without copying them.
:::

::: info In our project
The duplicate **is resolved**: the Docker command is written only in CLAUDE.md, and the `symfony-api` rule points to it (« voir CLAUDE.md, section Commandes »).
:::

---

#### `WARN-004`: Temporary instructions {#warn-004 .warn-title}
*Origin: official documentation (exclude information that changes frequently).*

CLAUDE.md is loaded at **every session**. In-progress tasks don't belong here.

::: danger Problem
```markdown
## TODO
- Finish the Search_Engine migration
- Fix bug #42
```
These notes pollute the permanent file and become stale.
:::

::: info Solution
Track in-progress tasks in a **plan file** in the repo (e.g. `PLAN.md`, read on demand) or simply in the **conversation**. Don't send them to **MEMORY.md**: that's the memory **Claude** writes and prunes itself, loaded every session — TODOs there would go stale without you noticing. CLAUDE.md is reserved for **permanent** instructions only.
:::

---

#### `WARN-005`: Confusing CLAUDE.md with permissions {#warn-005 .warn-title}
*Origin: official documentation (CLAUDE.md is not enforced); the project backs its instructions with a `deny` ([Methodology — Phase 0](/en/guide/methodology#phase-0-build-the-infrastructure)).*

CLAUDE.md is **context**, not a blocking mechanism.

::: danger Problem
```markdown
## Rules
NEVER modify files in php-legacy/
```
Claude will try its best, but nothing **technically** prevents it from modifying those files.
:::

::: info Solution
Use `deny` in **[settings.json](/en/concepts/settings)** for actual blocking (`Edit(...)` covers all write tools):
```json
{
  "permissions": {
    "deny": ["Edit(/php-legacy/**)"]
  }
}
```
CLAUDE.md provides the **why**, settings.json enforces the **block**.
:::

---

#### `WARN-006`: Believing an `@` import lightens the context {#warn-006 .warn-title}
*Origin: experienced on this wiki: it wrongly presented `@` imports as a way to reduce context.*

Splitting CLAUDE.md into imported files makes it more readable, not lighter.

::: danger Problem
```markdown
# "Slimmed-down" CLAUDE.md: 10 visible lines
## Conventions
- @docs/backend-conventions.md    <!-- 400 lines -->
- @docs/frontend-conventions.md   <!-- 300 lines -->
```
The 700 imported lines are expanded and loaded at launch, every session, as if they were written in CLAUDE.md.
:::

::: info Solution
```markdown
## Conventions
- Backend: skill `sym-api-conventions`
- Frontend: skill `front-app-conventions`
```
Detail goes into skills (content loaded when the task needs it) or `paths`-scoped rules (loaded when Claude touches the matching files). `/context` (*Memory files* section) shows what is actually loaded.
:::

---

### Maintenance

Treat CLAUDE.md like code: review it when things go wrong, prune it regularly, and check that a change actually shifts Claude's behavior ([best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)).

| Need | Tool / practice |
|------|-----------------|
| Cut what Claude can derive from the code | `/doctor` proposes cuts for a checked-in CLAUDE.md |
| Find outdated or **conflicting** instructions across CLAUDE.md, nested CLAUDE.md, rules, skills, agents | `/doctor prompt-audit` (report + proposed edits, nothing changes without your approval) |
| Check what is loaded | `/context` (*Memory files* section), size warning at startup and in `/status` |
| Keep the essentials through compaction | Add an instruction such as "When compacting, always preserve the full list of modified files and any test commands" |

---

## Ready-to-use examples

### Example 1: Modernization project

<span class="chez-nous">In our project</span> Excerpt from this project's actual `CLAUDE.md` (intermediate sections omitted). The alias table and the skills list are **this project's conventions** (see above):

::: details See the CLAUDE.md excerpt
````markdown
# Projet de Modernisation Legacy

## Configuration du Projet

> **Stack** : PHP 8.5 + Symfony 7.4 + PostgreSQL + Docker (backend) | React 19 + TypeScript + Vite + Tailwind CSS 4 (frontend)

> **SOURCE UNIQUE DE VERITE** : subagents et skills lisent leurs chemins dans cette table, par alias, jamais en dur.
> Seuls `.claude/settings.json` (regles `Edit(...)`, dont `Edit(/output/**)` et `Edit(/legacy-wiki/**)` pour `WIKI_TARGET`) et le `paths:` des `.claude/rules/*.md` contiennent des chemins reels (globs obligatoires), ainsi que `STACK_DIRS` de `.claude/scripts/install-stack.sh` (chemins reels, a mettre a jour lors d'un renommage).
> Apres un renommage : mettre a jour la table, puis `grep -rn "<ancien-chemin>" .claude/` (script `.claude/scripts/install-stack.sh` compris) et corriger chaque resultat ; enfin lancer l'agent `health-check` (section « Chemins en dur ») pour verifier l'alignement.

### Chemins (PATHS)

| Alias | Chemin | Description |
|-------|--------|-------------|
| `SOURCE_PROJECT` | `./php-legacy` | Projet legacy (LECTURE SEULE) |
| `SOURCE_TECHNICAL_DIR` | `./output/technique/` | Documentation technique generee |
| `FEATURE_SPECS_DIR` | `./output/features/` | Specifications fonctionnelles |
| `BACKEND_TARGET` | `./api-rest-symfony-target/` | Projet backend cible |
| `FRONTEND_TARGET` | `./app-react-target/` | Projet frontend cible |
| `OPENAPI_SPEC` | `./api-rest-symfony-target/docs/openapi.yaml` | Specification OpenAPI |
| `BACKEND_ANALYSIS_DIR` | `./output/analysis/backend/` | Analyses backend |
| `FRONTEND_ANALYSIS_DIR` | `./output/analysis/frontend/` | Analyses frontend |
| `REPORTS_DIR` | `./output/reports/` | Rapports de conformite |
| `DESIGN_DIR` | `./output/design/` | Fichiers design Figma |
| `WIKI_TARGET` | `./legacy-wiki/` | Wiki VitePress genere (mod-analyze-legacy, mod-generate-docs) |

### Commandes

- Toutes les commandes backend via Docker Compose : `cd <BACKEND_TARGET> && docker compose exec -T app <commande> 2>&1` (sans `| cat`, pour garder le code de sortie)
- Ne jamais executer de commandes PHP ou Composer directement sur l'hote
...

## Workflow de Modernisation

### Skills lanceurs (slash commands)

- `/mod-analyze-legacy` : Pipeline d'analyse en 6 etapes (technique → inventaire → audit → specs detaillees (optionnel) → visualisations → synchro wiki si `WIKI_TARGET` existe)
- `/mod-generate-visualization` : Visualisations interactives (arbre + graphe de dependances)
- `/mod-migrate-feature <nom>` : Migration E2E d'une feature (specs → arbitrage des ecarts → synchro wiki spec → planif → synchro wiki planif → implementation (synchro wiki a chaque lot) → conformite (synchro wiki) → boucle qualite → synchro wiki)
- `/mod-generate-docs` : Generation documentation VitePress

...

### Ordre du workflow

```
1. /mod-analyze-legacy
   └── Analyse technique → Inventaire → Audit → Specs detaillees (optionnel)
       → Visualisations (/mod-generate-visualization, etape 5) → Synchro wiki (si WIKI_TARGET existe)
   (/mod-generate-visualization peut aussi etre relance seul apres un enrichissement de l'inventaire)

2. /mod-migrate-feature <nom>  (pour chaque feature)
   └── Specs → Arbitrage ecarts → Synchro wiki spec → Planif Backend → Planif Frontend → Synchro wiki planif → Implem Backend → Implem Frontend → Conformite
       → Boucle qualite → Synchro wiki (si WIKI_TARGET existe)

3. /mod-generate-docs
   └── Documentation VitePress complete
```
````
:::

### Example 2: Project with `@path` imports

```markdown
# API Platform

## Stack
Node.js 22, TypeScript, PostgreSQL, Docker

## Conventions
- Coding standards: @docs/coding-standards.md
- API design: @docs/api-design.md

## Commands
- `npm test` : Tests
- `npm run build` : Build
```

Both imported files load **every session**. If they only concern part of the code (e.g. `src/api/`), a `paths`-scoped rule is cheaper.

### Example 3: Personal CLAUDE.md

Whatever a **setting can guarantee** moves out of CLAUDE.md: response language, commit attribution, confirmation before `git push`. In `~/.claude/settings.json` ([`language`, `attribution`](https://code.claude.com/docs/en/settings), [`ask` rules](https://code.claude.com/docs/en/permissions)):

```json
{
  "language": "french",
  "attribution": { "commit": "", "pr": "" },
  "permissions": {
    "ask": ["Bash(git push *)"]
  }
}
```

Only the preferences no setting can express stay in `~/.claude/CLAUDE.md`:

```markdown
# Personal Preferences
- Conventional Commits (`type(scope): description`), atomic commits
- No comments that restate the code
```

### Example 4: Starter skeleton

Starting point for a new project: fill in the brackets, then delete any line Claude would guess on its own (see [WARN-001](#warn-001)).

```markdown
# [Project name]

## Stack
[Runtime + version], [framework], [database], [test framework]

## Commands
- `[test command]`: Tests
- `[lint command]`: Lint
- `[build command]`: Build

## Conventions
- [Only what differs from the language's standards]

## Workflow
1. Explore in plan mode before changing anything
2. Tests first, then implementation
3. Commit with `/<namespace>:<command>` (Conventional Commits)
```

### Reference Examples

| Source | What you learn |
|--------|----------------|
| [Anthropic best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md) | Short file, include / exclude table, "would removing this line…?" test |
| [Trail of Bits — claude-code-config](https://github.com/trailofbits/claude-code-config) | **Two layers**: a ~100-line always-loaded `~/.claude/CLAUDE.md` + per-language `~/.claude/rules/` loaded via `paths` |
| [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) | **WHAT** (stack, structure) / **WHY** (project purpose) / **HOW** (how to work) structure; "never send an LLM to do a linter's job" |

---

## Before going live

### Content

- [ ] Commands Claude can't guess are documented
- [ ] <span class="chez-nous">In our project</span> Paths centralized in an alias table, "SINGLE SOURCE OF TRUTH" note visible
- [ ] Tech stack in 1 line
- [ ] Agents and skills read paths through the CLAUDE.md aliases, no hardcoded path ([WARN-002](#warn-002))

### Organization

- [ ] CLAUDE.md short (< 200 lines) — details in skills or `paths`-scoped rules (`@path` imports don't reduce context)
- [ ] Every line passes the "would removing it cause a mistake?" test
- [ ] No detailed conventions (those go in skills)
- [ ] No temporary instructions (plan file or conversation, not MEMORY.md)
- [ ] What a setting guarantees (`language`, `attribution`, permissions, security rules as `deny`) lives in settings.json, not in CLAUDE.md
- [ ] Each PATHS path searched for in `settings.json`, `.claude/rules/` and the skills before a rename
- [ ] Commands written in their actual invocation form (`/dev:commit`, not `/dev/commit`)

### Discovery

- [ ] CLAUDE.md at root (`./` or `./.claude/`)
- [ ] `claudeMdExcludes` (globs on absolute paths) for CLAUDE.md files to ignore; managed CLAUDE.md for organization standards (cannot be excluded)
- [ ] Instructions specific to a subfolder in its own CLAUDE.md or a `paths`-scoped rule (loaded on demand, not at launch)
- [ ] `@path` imports with max depth of 4 hops
- [ ] `CLAUDE.local.md` listed in `.gitignore`

### Verification

- [ ] `/init` to generate an initial CLAUDE.md
- [ ] `/context` (*Memory files* section) to verify loading
- [ ] `/memory` to check auto-memory
- [ ] Lasting instructions in the root CLAUDE.md (re-read after `/compact`, unlike subfolder CLAUDE.md files and `paths`-scoped rules) — test it
- [ ] `/doctor prompt-audit` run regularly (outdated or conflicting instructions)

---

## Going further

- [Rules](/en/concepts/rules) — detail tied to an area of the code, loaded only when it matters
- [Skills](/en/concepts/skills) — where detailed conventions belong
- [Settings](/en/concepts/settings) — what must be guaranteed rather than asked for
- [Methodology](/en/guide/methodology) — the pipeline that consumes the PATHS table
- [Official Documentation — Memory](https://code.claude.com/docs/en/memory)
- [Best practices — Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
