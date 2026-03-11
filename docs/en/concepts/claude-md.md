# CLAUDE.md

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Persistent instructions file loaded in full at every session |
| **Where** | `./CLAUDE.md` or `./.claude/CLAUDE.md` (project), `~/.claude/CLAUDE.md` (personal) |
| **Role** | Single source of truth: paths, commands, workflow, conventions |
| **Loading** | Full (no size limit), survives `/compact` |
| **Relationship** | Orchestrates everything — agents, skills and rules read CLAUDE.md |

---

## What is CLAUDE.md?

`CLAUDE.md` is the **first file Claude loads** at every session. It contains the project's permanent instructions: paths, conventions, available commands and workflow. It is Claude's "working memory" for your project.

::: warning Context, not enforcement
CLAUDE.md provides **context and instructions** that Claude follows to the best of its ability, but it is not an enforcement mechanism. To block actions, use **permissions** in `settings.json` (deny) or the **sandbox**.
:::

```
┌─────────────────────────────────────────────┐
│              CLAUDE CODE SESSION             │
│                                             │
│  1. Load CLAUDE.md (in full)               │
│     ├── Paths (SOURCE, TARGET, ...)        │
│     ├── Commands (/dev/commit, ...)        │
│     ├── @import referenced files           │
│     └── Workflow (step order)              │
│                                             │
│  2. Load settings.json (permissions)       │
│                                             │
│  3. Load skill descriptions                │
│                                             │
│  4. Ready to work                          │
│                                             │
│  Agents read CLAUDE.md for paths           │
│  Skills reference CLAUDE.md for context    │
│  Rules complement with targeted detail     │
│  Survives /compact (always in context)     │
└─────────────────────────────────────────────┘
```

---

## How It Works

### Locations and Discovery

Claude discovers CLAUDE.md files through a **directory tree walk** — it traverses the tree from the project root:

| Location | Scope | Shared |
|----------|-------|--------|
| `~/.claude/CLAUDE.md` | Personal (all projects) | No |
| `./CLAUDE.md` | Project (root) | Yes (git) |
| `./.claude/CLAUDE.md` | Project (alternate) | Yes (git) |
| `./src/CLAUDE.md` | Subfolder | Yes (git) |
| `./src/components/CLAUDE.md` | Sub-subfolder | Yes (git) |

::: info Directory tree walk
Claude loads **all** CLAUDE.md files found in the project tree, not just the root one. A `src/CLAUDE.md` applies when Claude works in `src/`. Both root locations (`./CLAUDE.md` and `./.claude/CLAUDE.md`) are equivalent.
:::

### Excluding Folders: claudeMdExcludes

To prevent Claude from loading CLAUDE.md files in certain folders (e.g. `node_modules`, `vendor`):

```json
{
  "claudeMdExcludes": ["node_modules", "vendor", "dist", ".git"]
}
```

Configurable in `settings.json` at any scope.

### @import: Including External Files

CLAUDE.md supports importing files to keep the main file short:

```markdown
# My Project

@import ./docs/conventions.md
@import ./docs/api-guide.md
@import .claude/project-context.md
```

| Aspect | Detail |
|--------|--------|
| **Syntax** | `@import <relative-path>` |
| **Max depth** | 5 levels of nested imports |
| **Resolution** | Relative to the file containing the import |
| **Failure** | Missing file = silent warning |

::: tip Keep CLAUDE.md short
Use `@import` to delegate details to separate files. CLAUDE.md remains a summary with essential paths and commands.
:::

### Priority Levels

| Level | Location | Scope | Priority |
|-------|----------|-------|----------|
| Enterprise | Managed settings | Organization | Highest |
| Personal | `~/.claude/CLAUDE.md` | All your projects | High |
| Project (root) | `./CLAUDE.md` | This project | Normal |
| Project (subfolder) | `./src/CLAUDE.md` | This subfolder | Contextual |

### Initialization: /init

The `/init` command generates an initial CLAUDE.md for your project:

```bash
# In Claude Code
/init
```

Claude analyzes the project (structure, stack, commands) and generates an appropriate CLAUDE.md. Useful for quickly getting started on a new project.

### Auto-memory vs CLAUDE.md

Claude also maintains an automatic memory file:

```
~/.claude/projects/<project>/memory/MEMORY.md
```

| Aspect | CLAUDE.md | MEMORY.md |
|--------|-----------|-----------|
| **Nature** | Stable instructions, written by human | Evolving notes, written by Claude |
| **Loading** | Full (no limit) | Truncated after 200 lines |
| **Persistence** | In the repo (git) | Local (`~/.claude/projects/`) |
| **Content** | Paths, commands, workflow, conventions | Discovered patterns, corrections, decisions |
| **Modified by** | The user (manually) | Claude (automatically) |
| **Command** | `/init` (initial generation) | `/memory` (view/edit) |

::: warning 200 lines = MEMORY.md, not CLAUDE.md
The 200-line limit applies to **MEMORY.md** (auto-memory), not CLAUDE.md. CLAUDE.md is loaded in full regardless of size. Keeping CLAUDE.md short is a good practice for readability, not a technical constraint.
:::

### Additional Directories: --add-dir

To add directories outside the current project to Claude's scope:

```bash
claude --add-dir /path/to/other/project
```

Claude will also load CLAUDE.md files found in these additional directories, with the same discovery rules.

### Behavior with /compact

CLAUDE.md **survives compaction**. When Claude compresses context via `/compact` or auto-compaction, CLAUDE.md instructions always remain present — they are re-injected into the compressed context.

### Recommended Structure

```markdown
# Project Name

## Configuration

### Paths (PATHS)
| Alias | Path | Description |
|-------|------|-------------|
| `SRC` | `./src/` | Source code |
| `TESTS` | `./tests/` | Tests |

### Commands
- `npm test` : Run tests
- `npm run lint` : Check style

## Workflow
### Available Skills
- `/migrate <name>` : E2E Migration

### Order
1. Analysis → 2. Migration → 3. Documentation
```

---

## Practical Guide: Designing Your CLAUDE.md

### Usage Matrix: What Goes Where?

| Information | Where to Put It | Why |
|-------------|----------------|-----|
| Project paths | **CLAUDE.md** | Single source of truth |
| Available commands | **CLAUDE.md** | Workflow overview |
| Tech stack (1 line) | **CLAUDE.md** | Global context |
| Detailed conventions | **Passive skill** | Too long for CLAUDE.md |
| Short contextual reminder | **Rule** | Injected based on files |
| Personal preferences | **~/.claude/CLAUDE.md** | Not in the repo |
| Session notes | **MEMORY.md** | Evolves automatically |
| Security (deny/allow) | **settings.json** | Real enforcement (not just context) |

### Mistakes to Avoid

#### Pitfall 1: File too long

```markdown
# --- 500 lines of detailed conventions
## Architecture (100 lines)
## Patterns (100 lines)
## DTOs (100 lines)
...
```

```markdown
# --- Short and factual, details in skills or @import
## Stack
Symfony 7.4, PostgreSQL, Docker

## Conventions
See skill `symfony/api-conventions` for details.
```

> Although CLAUDE.md has no technical limit, a file that is too long drowns essential information. Delegate details to skills, rules or `@import`.

#### Pitfall 2: Hardcoded paths in agents

```markdown
# --- Agent with hardcoded path
Read files in ./php-classified-ads-legacy/

# --- Agent reads path from CLAUDE.md
Read SOURCE_PROJECT (defined in CLAUDE.md)
```

> If the folder is renamed, only one place to update.

#### Pitfall 3: Duplicated conventions

```markdown
# --- PSR-12 in CLAUDE.md AND in the skill
## Conventions
- PSR-12 strict
- camelCase methods
```

```markdown
# --- Reference to the skill
## Conventions
See skill `symfony/api-conventions`.
```

#### Pitfall 4: Temporary instructions

```markdown
# --- Current task in CLAUDE.md
## TODO
- Finish the Search_Engine migration
- Fix bug #42
```

> Use MEMORY.md for session notes, not CLAUDE.md.

#### Pitfall 5: Confusing CLAUDE.md with permissions

```markdown
# --- Believing CLAUDE.md blocks actions
## Rules
NEVER modify files in php-legacy/
```

> CLAUDE.md is **context**, not enforcement. Claude will do its best to follow the instruction, but for actual blocking, use `deny` in `settings.json`.

#### Pitfall 6: Forgetting @import for large projects

```markdown
# --- Everything in a single file
## Architecture (50 lines)
## API Guide (80 lines)
## Testing (40 lines)
## Deployment (30 lines)
```

```markdown
# --- CLAUDE.md as summary + @import
## Architecture
@import ./docs/architecture.md

## API
@import ./docs/api-guide.md
```

---

## Advanced Control

### InstructionsLoaded Hook

The `InstructionsLoaded` hook fires after CLAUDE.md and all instructions are loaded:

```json
{
  "hooks": {
    "InstructionsLoaded": [{
      "type": "command",
      "command": "echo 'Instructions loaded for the project'"
    }]
  }
}
```

Useful for logging, custom validations, or dynamic context injection.

### Enterprise: Managed CLAUDE.md

Organizations can enforce instructions via managed settings. These instructions have **highest priority** and cannot be overridden by project or user files.

### Troubleshooting

| Problem | Diagnosis | Solution |
|---------|----------|----------|
| Instructions ignored | `/status` → check loading | Verify file location |
| Subfolder CLAUDE.md not loaded | File is in an excluded folder | Check `claudeMdExcludes` |
| @import not working | Incorrect relative path | Verify path from parent file |
| Instructions lost after /compact | Should not happen | CLAUDE.md survives /compact — check that it's not conversation context |
| MEMORY.md truncated | Normal beyond 200 lines | Keep MEMORY.md concise, archive old notes |

---

## Concrete Examples

### Example 1: Modernization project

```markdown
# Legacy Modernization Project

## Project Configuration

> **SINGLE SOURCE OF TRUTH**: All subagents and skills
> MUST read their paths from this section.

### Paths (PATHS)

| Alias | Path | Description |
|-------|------|-------------|
| `SOURCE_PROJECT` | `./php-legacy` | Legacy (READ-ONLY) |
| `BACKEND_TARGET` | `./api-rest-symfony-target/` | Target backend |
| `FRONTEND_TARGET` | `./ap-rest/` | Target frontend |
| `OPENAPI_SPEC` | `./api-rest-symfony-target/docs/openapi.yaml` | OpenAPI spec |
| `FEATURE_SPECS_DIR` | `./output/features/` | Specifications |
| `REPORTS_DIR` | `./output/reports/` | Conformity reports |

### Commands
- `/dev/commit` : Conventional Commits
- `/dev/php-test` : Backend tests
- `/modernization/migrate-feature <name>` : E2E migration

### Workflow
1. `/modernization/analyze-legacy`
2. `/modernization/migrate-feature <name>` (per feature)
3. `/modernization/generate-docs`
```

### Example 2: Project with @import

```markdown
# API Platform

## Stack
Node.js 22, TypeScript, PostgreSQL, Docker

## Paths
| Alias | Path | Description |
|-------|------|-------------|
| `SRC` | `./src/` | Source code |
| `TESTS` | `./tests/` | Tests |

## Conventions
@import ./docs/coding-standards.md
@import ./docs/api-design.md

## Commands
- `npm test` : Tests
- `npm run build` : Build
```

### Example 3: Personal CLAUDE.md

`~/.claude/CLAUDE.md`:

```markdown
# Personal Preferences

## Language
Always respond in French.

## Workflow
- Always use Conventional Commits
- Prefer atomic commits
- Never push without confirmation

## Style
- Concise code, no obvious comments
- Explicit variable names
```

---

## Launch Checklist

### Content

- [ ] Paths centralized in a single table
- [ ] "SINGLE SOURCE OF TRUTH" note visible
- [ ] Commands and skills documented
- [ ] Tech stack in 1 line

### Organization

- [ ] CLAUDE.md short — details in skills or `@import`
- [ ] No detailed conventions (those go in skills)
- [ ] No temporary instructions (those go in MEMORY.md)
- [ ] No security rules (those go in settings.json deny)

### Discovery

- [ ] CLAUDE.md at root (`./` or `./.claude/`)
- [ ] `claudeMdExcludes` for folders to ignore (`node_modules`, `vendor`)
- [ ] Subfolder CLAUDE.md files if needed (contextual)
- [ ] `@import` with max depth of 5

### Verification

- [ ] `/init` to generate an initial CLAUDE.md
- [ ] `/status` to verify loading
- [ ] `/memory` to check auto-memory
- [ ] CLAUDE.md survives `/compact` — test it

---

## Resources

- [Official Documentation — Memory](https://code.claude.com/docs/en/memory)
