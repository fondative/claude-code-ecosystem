# Rules

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Instructions automatically injected into Claude's context |
| **Where** | `.claude/rules/<name>.md` (project) or `~/.claude/rules/` (user) |
| **Trigger** | By glob pattern (`paths:`) or global (without paths) |
| **Size** | < 30 lines — delegate details to skills |
| **Relationship** | Rules remind, skills detail |

---

## What is a Rule?

A rule is a Markdown file whose content is **automatically injected into Claude's context** when the files being manipulated match a glob pattern. No manual invocation, no command — it is transparent.

```
┌────────────────────────────────────────┐
│         CONTEXTUAL INJECTION           │
│                                        │
│  Claude edits api-rest/src/Entity.php  │
│         │                              │
│         ▼                              │
│  Glob match: "api-rest/**"             │
│         │                              │
│         ▼                              │
│  ┌──────────────────────┐              │
│  │  rules/symfony-api.md │ <── injected│
│  │  "PSR-12, Docker,    │              │
│  │   TDD mandatory"     │              │
│  └──────────────────────┘              │
│                                        │
│  git.md (no paths) ───── always active │
└────────────────────────────────────────┘
```

::: info Rules vs Skills
Rules are loaded **at every session** (or when a file matches). For one-off instructions that don't need to be in context permanently, use a [skill](/en/concepts/skills) instead.
:::

---

## How It Works

### Format

```markdown
---
paths:
  - "api-rest-symfony-target/**"
---

# Backend Conventions

- Commands via `docker compose exec -T app [cmd] 2>&1 | cat`
- Architecture: Controller → Service → Repository
- PSR-12, TDD mandatory
```

### Two Types

| Type | Frontmatter | Trigger |
|------|------------|---------|
| **Targeted** | `paths: ["src/**"]` | When a file matches |
| **Global** | No `paths` | Always active (same priority as [`.claude/CLAUDE.md`](/en/concepts/claude-md)) |

### Scopes and Priority

Rules exist at multiple levels. The most specific wins:

| Scope | Location | Priority | Shared |
|-------|----------|----------|--------|
| **Managed policy** | `/etc/claude-code/CLAUDE.md` (Linux) | Highest (cannot be excluded) | Entire organization |
| **Project** | `.claude/rules/*.md` | High | Team (git) |
| **User** | `~/.claude/rules/*.md` | Low | Personal (all projects) |

::: tip User-level rules
`~/.claude/rules/` lets you define personal preferences (code style, workflows) that apply to **all** your projects without polluting the repo's rules.
:::

### Recursive Discovery

`.md` files in `rules/` subdirectories are automatically discovered:

```
.claude/rules/
├── legacy-readonly.md
├── git.md
├── backend/
│   ├── symfony-api.md
│   └── docs.md
└── frontend/
    └── react.md
```

### Advanced Glob Patterns

Brace expansion for matching multiple extensions:

```yaml
paths:
  - "src/**/*.{ts,tsx}"    # TypeScript + JSX
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
```

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All `.ts` files recursively |
| `src/**/*` | Everything under `src/` |
| `*.md` | Markdown at root only |
| `src/components/*.tsx` | Components in a specific folder |

### Symlinks

Symlinks are supported for sharing rules between projects. Circular links are detected and ignored.

```bash
# Share a common rules folder
ln -s ~/shared-claude-rules .claude/rules/shared

# Share an individual rule
ln -s ~/company-standards/security.md .claude/rules/security.md
```

---

## Practical Guide: Designing Your Rules

### When to Use a Rule?

```
Information < 30 lines?
├── YES → Subset of files? → TARGETED RULE
│         Everywhere? → GLOBAL RULE
│
└── NO → Workflow? → [LAUNCHER SKILL](/en/concepts/skills)
          Conventions? → [PASSIVE SKILL](/en/concepts/skills) + references
```

| Information | Component | Reason |
|-------------|-----------|--------|
| "PSR-12 strict" | Rule | Short, contextual |
| PSR-12 guide with 50 examples | [Passive skill](/en/concepts/skills) | Too long for a rule |
| "Always use /dev/commit" | Global rule | Applies everywhere |
| Project paths | [CLAUDE.md](/en/concepts/claude-md) | Single source of truth |

### Warnings

#### ⚠️ `WARN-001`: Glob `*` vs `**`

The `*` glob only covers the first level of files, not subdirectories.

::: danger Problem
```yaml
# ❌ — Only covers 1st level
paths: ["php-legacy/*"]
```
Files in subdirectories are not covered by the rule.
:::

::: info Solution
```yaml
# ✅ — Recursive
paths: ["php-legacy/**"]
```
The double `**` covers all levels of the directory tree.
:::

---

#### ⚠️ `WARN-002`: Rule without settings enforcement

A text-only "read only" rule does not prevent Claude from writing — a technical block in [`settings.json`](/en/concepts/settings) is required.

::: danger Problem
```markdown
# ❌ — "Read only" without enforcement
NEVER modify these files
```
Without a deny in `settings.json`, this instruction can be ignored.
:::

::: info Solution
```json
// ✅ — settings.json enforces
{ "deny": ["Write(php-legacy/**)", "Edit(php-legacy/**)"] }
```
The `deny` blocks the Write and Edit tools at the engine level, independently of the rule text.
:::

---

#### ⚠️ `WARN-003`: Rule too long

Rules are injected at every interaction — a large rule permanently pollutes the context.

::: danger Problem
```markdown
# ❌ — 80 lines of detailed conventions
```
80 lines injected at every exchange unnecessarily saturate the context window.
:::

::: info Solution
```markdown
# ✅ — Short rule + delegation
Load skill `api-conventions`. Reminders: Docker, TDD, PSR-12.
```
The rule recalls the essentials, the skill carries the detail. No duplication.
:::

---

#### ⚠️ `WARN-004`: Glob `**` alone

A `**` glob without a folder prefix is equivalent to a global rule, but more expensive to evaluate.

::: danger Problem
```yaml
# ❌ — Injected EVERYWHERE (equivalent to global but heavier)
paths: ["**"]
```
The rule is injected for every file in the entire project, without discrimination.
:::

::: info Solution
```yaml
# ✅ — Targeted
paths: ["ap-rest/**"]
```
Targeting a specific folder limits injection to files that are actually relevant.
:::

---

#### ⚠️ `WARN-005`: Obsolete path

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

## Advanced Control

### Excluding Rules (monorepo)

In a monorepo, rules from other teams may be loaded. `claudeMdExcludes` in [`settings.local.json`](/en/concepts/settings) lets you ignore them:

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

::: warning Managed policy
Rules deployed via managed policy (`/etc/claude-code/CLAUDE.md`) **cannot** be excluded. This is intentional to guarantee organization standards.
:::

### Debugging with the InstructionsLoaded [Hook](/en/concepts/hooks)

The `InstructionsLoaded` [hook](/en/concepts/hooks) lets you log exactly which rules are loaded, when, and why:

```json
{
  "hooks": {
    "InstructionsLoaded": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo \"$CLAUDE_INSTRUCTIONS_FILE\" >> /tmp/rules-loaded.log"
      }]
    }]
  }
}
```

Useful for diagnosing why a targeted rule isn't triggering.

---

## Concrete Examples

### Example 1: Read-only protection

```markdown
---
paths:
  - "php-legacy/**"
---

# Legacy — READ ONLY

NEVER modify, write or delete files here.
Use only Read, Glob, Grep for analysis.
```

::: warning Double protection
The rule reminds. The `settings.json` enforces:
```json
{ "deny": ["Write(php-legacy/**)", "Edit(php-legacy/**)"] }
```
:::

### Example 2: Global rule (git)

```markdown
---
---

# Git - Conventions

- ALWAYS use `/dev/commit` to commit
- Conventional Commits: `type(scope): description`
- Never force-push on main
```

### Example 3: Delegation to skill

```markdown
---
paths:
  - "app-react-target/**"
---

# Frontend

Load the skills `frontend/app-conventions` and `frontend/testing-conventions`.

Reminders: mobile-first, no px (rem/em/%), PascalCase components.
```

::: tip Delegation pattern
The rule reminds 3-4 points. The skill details. No duplication.
:::

### Example 4: Output format

```markdown
---
paths:
  - "output/**"
---

# Format

## Language
- All generated documents MUST be written in French
- Only code names remain in English

## Format
- Markdown with hierarchical headings
- Mermaid diagrams
- Debt classification: Critical / High / Medium / Low
```

---

## Launch Checklist

### Content

- [ ] < 30 lines (delegate to skills beyond that)
- [ ] No duplication between rule and skill
- [ ] Specific and verifiable instructions (not "format code nicely")

### Globs

- [ ] Precise and tested globs (`**` recursive, `*` one level)
- [ ] Brace expansion for multi-extension (`*.{ts,tsx}`)
- [ ] Verify the path matches the current folder (no old names)

### Protection

- [ ] "Read only" rule doubled with a `deny` in [`settings.json`](/en/concepts/settings)
- [ ] Managed policy for organization standards (cannot be excluded)

### Organization

- [ ] Naming: `{domain}-{context}.md`
- [ ] Subfolders if > 10 rules (`backend/`, `frontend/`)
- [ ] User rules in `~/.claude/rules/` for personal preferences
- [ ] Symlinks if rules are shared between projects

---

## Resources

- [Official Documentation — Memory](https://code.claude.com/docs/en/memory)
