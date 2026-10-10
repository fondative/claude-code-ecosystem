# Rules

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Instructions automatically injected into Claude's context |
| **Where** | `.claude/rules/<name>.md` (project) or `~/.claude/rules/` (user) |
| **Trigger** | By [glob](/en/reference/glossary#glob) pattern (`paths:`) or global (without `paths`) |
| **Size** | Short, one topic per file — delegate procedures to skills |
| **Relationship** | Rules remind, [skills](/en/concepts/skills) detail |
| **What this page adds** | When to choose a rule over CLAUDE.md or a skill, and the project's 7 actual rules with their globs |

---

## The essentials in 2 minutes

A rule is a Markdown file in `.claude/rules/` whose content is **automatically injected** into context: at startup if it has no `paths`, or as soon as Claude touches a file matching its glob. No invocation, no command.

```
┌───────────────────────────────────────────────────────┐
│              CONTEXTUAL INJECTION                     │
│                                                       │
│  Claude edits api-rest-symfony-target/src/Entity.php  │
│         │                                             │
│         ▼                                             │
│  Glob match: "api-rest-symfony-target/**"             │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────────┐                             │
│  │ rules/symfony-api.md │  <── injected               │
│  │  "Docker, TDD,       │                             │
│  │   Controller→Service"│                             │
│  └──────────────────────┘                             │
│                                                       │
│  git.md (no paths) ───── always active                │
└───────────────────────────────────────────────────────┘
```

```markdown
---
paths:
  - "api-rest-symfony-target/**"
---

# Backend Conventions

- Commands via `docker compose exec -T app [cmd]`
- Architecture: Controller → Service → Repository
- TDD: write the test before the code
```

Four facts change how you design a rule:

1. **A `paths` rule loads on first contact** (Read, Write, Edit, or `cat`/`head` through Bash on a matching file), then **stays in context** until the next [compaction](/en/reference/glossary#compaction).
2. **Without `paths`, it costs as much as a CLAUDE.md line**, every session. And invalid YAML [frontmatter](/en/reference/glossary#frontmatter) silently makes it global.
3. **It is context, not a barrier**: a "read only" rule blocks nothing without a [`deny`](/en/reference/glossary#regles-de-permission) rule in [settings.json](/en/concepts/settings).
4. **A glob that matches nothing raises no error**: the rule is simply inactive.

→ How it all works (format, project and user [scopes](/en/reference/glossary#scope), recursive discovery, globs, symlinks, exclusions, debugging): [official documentation — Memory (rules)](https://code.claude.com/docs/en/memory#path-specific-rules).

---

## Designing your rules well

### When to Use a Rule?

The criterion is **scope**, not length: a rule is tied to an **area of the code**, a skill to a **procedure**.

```
Must it be guaranteed (block, format, test)?
└── YES → settings.json (deny) or hook — not text
Otherwise, what is the information tied to?
├── An area of the code (folder, file type) → RULE with paths
├── The whole project, every session        → CLAUDE.md (or global rule)
└── An occasional task / procedure          → SKILL (loaded on demand)
```

| Information | Component | Reason |
|-------------|-----------|--------|
| "No HTTP adapters in `app-react-target/`" | Targeted rule | Tied to an area of the code |
| PSR-12 formatting | `PostToolUse` [hook](/en/concepts/hooks) (e.g. `php-cs-fixer`) or `/dev:php-lint` | A formatter guarantees, a sentence doesn't ([official example](https://code.claude.com/docs/en/hooks-guide#auto-format-code-after-edits)) |
| Feature migration guide | [Skill](/en/concepts/skills) | Occasional procedure |
| "Always use `/dev:commit`" | Global rule or CLAUDE.md | Applies everywhere |
| Project paths | [CLAUDE.md](/en/concepts/claude-md) | Always loaded; <span class="chez-nous">In our project</span> the "single source of truth" for paths |

::: tip One topic per file
One rule = one topic (`git.md`, `frontend.md`…), named after that topic: it stays easy to target, review and delete.
:::

### The project's actual configuration

<span class="chez-nous">In our project</span> The modernization project's 7 rules, in `.claude/rules/`:

| Rule | `paths` | Lines | Content |
|------|---------|:-----:|---------|
| `legacy-readonly` | `php-legacy/**` | 10 | The legacy code is read-only (backed by `deny: Edit(/php-legacy/**)` in `settings.json`) |
| `symfony-api` | `api-rest-symfony-target/**` | 14 | Points to the `sym-*` skills + 4 reminders (Docker, TDD, UUID, OpenAPI) |
| `docs` | `api-rest-symfony-target/docs/**` | 9 | `OPENAPI_SPEC` (`openapi.yaml`) is the source of truth for API contracts |
| `frontend` | `app-react-target/**` | 15 | Points to the `front-*` skills + 3 reminders |
| `output-format` | `output/**` | 15 | Language and format of deliverables |
| `design` | `output/design/**` | 8 | Figma JSON design files |
| `git` | none (no frontmatter) | 5 | The only global rule: commits offered through `/dev:commit` |

What to take from it:

- **6 of the 7 rules are targeted**, none exceeds 15 lines, and the code-related rules **delegate** detail to skills.
- **The globs overlap on purpose**: a file in `api-rest-symfony-target/docs/` loads `symfony-api` **and** `docs`, a file in `output/design/` loads `output-format` **and** `design`.
- **The targeted folders don't exist in the stack repository**: `api-rest-symfony-target/` and `app-react-target/` are created by `install-stack.sh`, `php-legacy/` is dropped in by the team and `output/` is produced by the pipeline. Until then, the targeted rules never fire, without any error.

### Gotchas

- **`paths` is the only field read** in a rule's frontmatter: `description` or any other field is ignored without an error.
- **Invalid YAML = global rule**: if the frontmatter doesn't parse, the rule loads as if it had no `paths`. `claude --debug` shows the error.
- **After `/compact`**, rules without `paths` come back with CLAUDE.md; `paths` rules only when Claude touches a matching file again.
- **User and project rules stack**: a project rule appears after a user rule but doesn't cancel it. Two conflicting instructions: Claude may follow either one.
- **`*` covers one level, `**` every level.** Braces (`*.{ts,tsx}`) multiply patterns, within a budget of 1,000 patterns per rule.
- **A symlink to a target outside the project** is treated as an external import: approval required, and only rules **without** `paths` then load.

Details and sources: [official documentation — Memory (rules)](https://code.claude.com/docs/en/memory#path-specific-rules).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001`: Glob `*` vs `**` {#warn-001 .warn-title}
*Origin: general good practice (glob semantics).*

Same pitfall as for permissions, detailed in [Settings — WARN-003](/en/concepts/settings#warn-003): in `paths`, `"php-legacy/*"` only covers the first level; write `"php-legacy/**"` to include subfolders.

---

#### `WARN-002`: Rule without settings enforcement {#warn-002 .warn-title}
*Origin: experienced on this project ([Methodology — Phase 0](/en/guide/methodology#phase-0-build-the-infrastructure): "A rule alone can be bypassed"); the legacy code was first protected by the rule alone, before a `settings.json` was added.*

A "read only" rule is only text: it doesn't prevent Claude from writing. The block comes from an `Edit(/php-legacy/**)` `deny` in `settings.json` — full example in [Settings — WARN-002](/en/concepts/settings#warn-002), same pitfall on the CLAUDE.md side in [CLAUDE.md — WARN-005](/en/concepts/claude-md#warn-005).

This `deny` covers Claude's write tools **and** the Bash writes Claude Code recognizes: redirections (`>`, `>>`), `tee`, `sed -i`… However, a command that writes without Claude Code identifying the target (for example a Python or Node script that opens its files itself) gets through: for those, a `PreToolUse` [hook](/en/concepts/hooks) or the [sandbox](/en/reference/glossary#sandbox) ([source](https://code.claude.com/docs/en/permissions#read-and-edit)).

---

#### `WARN-003`: Rule too long {#warn-003 .warn-title}
*Origin: experienced on this project: `symfony-api` went from 29 to 14 lines by delegating its conventions to skills (commit `e0b87b5`).*

Once loaded, a rule stays in context for the rest of the session — a large rule permanently pollutes the context.

::: danger Problem
```markdown
# ❌ — 80 lines of detailed conventions
```
80 lines that stay in context for the whole session unnecessarily saturate the context window.
:::

::: info Solution
```markdown
# ✅ — Short rule + delegation
Load skill `sym-api-conventions`. Reminders: Docker, TDD.
```
The rule recalls the essentials, the skill carries the detail. No duplication.
:::

---

#### `WARN-004`: Glob `**` alone {#warn-004 .warn-title}
*Origin: general good practice.*

A `**` glob without a folder prefix is almost the same as a global rule, only less readable.

::: danger Problem
```yaml
# ❌ — Injected EVERYWHERE (almost equivalent to a global rule)
paths: ["**"]
```
The rule is injected for every file in the entire project, without discrimination.
:::

::: info Solution
```yaml
# ✅ — Targeted
paths: ["api-rest-symfony-target/**"]
```
Targeting a specific folder limits injection to files that are actually relevant.
:::

---

#### `WARN-005`: Obsolete path {#warn-005 .warn-title}
*Origin: experienced on this project: when it was created, `legacy-readonly` targeted `php-classified-ads-legacy/**` while CLAUDE.md declared `./php-legacy` (fixed, commit `847ccc2`).*

If the targeted folder is renamed, the glob matches nothing — with no error message.

::: danger Problem
```yaml
# ❌ — Folder renamed, rule silently inactive
paths: ["php-classified-ads-legacy/**"]
```
No visible error if the glob matches nothing. The rule is silently ignored.
:::

::: info Solution
```yaml
# ✅ — Matches current folder
paths: ["php-legacy/**"]
```
Verify that the path matches the current folder name after each rename.
:::

---

## Ready-to-use examples

### Example 1: Read-only protection

```markdown
---
paths:
  - "php-legacy/**"
---

# Legacy code — read only

This code is the reference for the analysis: it must stay intact so it can be
compared with the target implementation. Document its gaps in `output/`, never here.
```

::: warning Double protection
The prohibition is already enforced by `deny`: the rule doesn't need to repeat it in capitals, it gives the **why** and the alternative. (<span class="chez-nous">In our project</span> the actual rule is this one, except that it names the output folders by their PATHS table aliases: `SOURCE_TECHNICAL_DIR`, `FEATURE_SPECS_DIR`…) The `settings.json` applies the prohibition:
```json
{
  "permissions": {
    "deny": ["Edit(/php-legacy/**)"]
  }
}
```
:::

### Example 2: Global rule (git)

<span class="chez-nous">In our project</span> `.claude/rules/git.md` (no frontmatter, so no `paths`: loaded every session):

```markdown
# Git - Conventions

- Ne pas lancer `git commit` : quand un commit est pertinent, proposer a l'utilisateur de taper `/dev:commit` (commande reservee a l'utilisateur).
- Exception : le launcher `/mod-migrate-feature` commite chaque lot verifie (commit soumis a `ask`).
- Format Conventional Commits : `type(scope): description`
```

::: tip What a setting does better
- Without `paths`, this rule costs like a CLAUDE.md line: keep it short.
- Claude Code already injects its own commit/PR instructions. If an in-house skill (`/dev:commit`) replaces them, `"includeGitInstructions": false` avoids two competing instructions.
- The `Co-Authored-By` trailer is set with `attribution` (e.g. `{ "commit": "", "pr": "" }` to remove it), not with a sentence.

See [`includeGitInstructions`, `attribution`](https://code.claude.com/docs/en/settings) and [Settings](/en/concepts/settings).
:::

::: info In our project: `/dev/commit` vs `/dev:commit` notation
This excerpt reproduces the project rule verbatim, which writes **`/dev:commit`**: since the command lives in `.claude/commands/dev/commit.md`, that is its actual invocation (each subfolder becomes a prefix followed by `:`). The `/dev/commit` notation is the old form, not to be reproduced — see [official documentation — Skills](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name).
:::

### Example 3: Delegation to skill

<span class="chez-nous">In our project</span> The actual `frontend` rule, quoted verbatim:

```markdown
---
paths:
  - "app-react-target/**"
---

# Conventions Frontend (auto-injecte)

Les conventions frontend completes sont definies dans les skills :
- `front-app-conventions` — Architecture, patterns, standards de code
- `front-testing-conventions` — Tests, TDD, mocking MSW

Rappels critiques :
- Appels HTTP directs (pas d'adaptateurs)
- Responsive obligatoire, pas de pixels hardcodes
- Consulter `OPENAPI_SPEC` (table PATHS de CLAUDE.md) avant integration
```

::: tip Delegation pattern
The rule reminds 3-4 points. The skill details. No duplication.
:::

### Example 4: Output format

<span class="chez-nous">In our project</span> The actual `output-format` rule, quoted verbatim (in French, without accents in the original):

```markdown
---
paths:
  - "output/**"
---

# Conventions de sortie (auto-injecte)

## Langue
- Tous les documents generes DOIVENT etre rediges en **francais**
- Titres, descriptions, findings, recommandations, conclusions — tout en francais
- Seuls les noms de code restent en anglais (classes, methodes, fichiers, variables)

## Format
- Markdown avec diagrammes Mermaid pour les flux et architectures
- Donnees structurees en tableaux Markdown (pas de listes quand un tableau est plus lisible)
```

### Reference Examples

[Trail of Bits — claude-code-config](https://github.com/trailofbits/claude-code-config) publishes personal per-language rules (`rules/python.md`, `typescript.md`, `rust.md`, `bash.md`, `github-actions.md`): each targets its files via `paths` and fits in a "purpose → tool" table (lint, format, tests), alongside a short `~/.claude/CLAUDE.md`.

---

## Before going live

### Content

- [ ] One topic per file, tied to an area of the code (otherwise CLAUDE.md or skill)
- [ ] No repetition of what a `deny` or a hook already guarantees
- [ ] No duplication between rule and skill
- [ ] Short rule; detailed conventions delegated to a skill ([WARN-003](#warn-003))
- [ ] Specific and verifiable instructions (not "format the code nicely")
- [ ] Commands cited in their actual invocation form (`/dev:commit`)

### Globs

- [ ] Precise and tested globs (`**` recursive, `*` one level)
- [ ] Braces for several extensions (`*.{ts,tsx}`), without stacking groups
- [ ] No `paths: ["**"]` (same as a rule without `paths`) ([WARN-004](#warn-004))
- [ ] `/context` for rules without `paths`; `InstructionsLoaded` hook for `paths`-scoped rules (loaded on demand)
- [ ] Valid YAML frontmatter (`claude --debug`) — otherwise the rule becomes global
- [ ] `paths` match the current folders: after a rename, search for the old name in CLAUDE.md, `settings.json`, `.claude/rules/` and the skills

### Protection

- [ ] "Read only" rule doubled with a `deny` in [`settings.json`](/en/concepts/settings)

### Organization

- [ ] File named after its topic; subfolders allowed (recursive discovery)
- [ ] User rules in `~/.claude/rules/` for personal preferences
- [ ] Symlinks if rules are shared between projects (approval required if target is outside the project; then only rules without `paths` load)

---

## Going further

- [CLAUDE.md](/en/concepts/claude-md) — what applies to the whole project, every session
- [Skills](/en/concepts/skills) — the detail rules point to
- [Settings](/en/concepts/settings) — the `deny` that makes a prohibition effective
- [Methodology — Phase 0](/en/guide/methodology#phase-0-build-the-infrastructure) — where the "rule + deny" principle comes from
- [Official Documentation — Memory (rules)](https://code.claude.com/docs/en/memory#path-specific-rules)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
