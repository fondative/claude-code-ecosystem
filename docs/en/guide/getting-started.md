# Quick Start

## Prerequisites

- Claude Code installed. Recommended method: the native installer (automatic updates)
  - macOS, Linux, WSL: `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`
  - Windows CMD: `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
  - Alternatives: Homebrew, WinGet, `npm install -g @anthropic-ai/claude-code` (Node.js 22+), or the VS Code extension. See the [setup page](https://code.claude.com/docs/en/setup).
- A Pro, Max, Team, Enterprise or Console account (the free claude.ai plan does not include Claude Code), or a third-party provider (Amazon Bedrock, Google Cloud Vertex AI, Microsoft Foundry)
- An existing project with a `.git/` folder

Check the installation with `claude --version`, then run `claude` in the project folder.

## Step 1: Initialize CLAUDE.md

::: tip Quick alternative
Use `/init` in Claude Code to automatically generate a CLAUDE.md tailored to your project (analyzes structure, stack and commands).
:::

Or manually create a `CLAUDE.md` file at the project root:

```markdown
# My Project

## Stack
- Runtime: Node.js 20
- Framework: Express
- Database: PostgreSQL
- Tests: Jest

## Commands
- `npm test` : Run tests
- `npm run lint` : Check style
- `npm run build` : Production build

## Conventions
- camelCase for variables and functions
- PascalCase for classes
- Tests before code (TDD)
```

::: tip
Keep the file short and factual (under 200 lines recommended): Claude loads it at every session. If the repository already has an `AGENTS.md` (used by other coding agents) and no CLAUDE.md, Claude Code reads it instead.
:::

→ **Going further**: [CLAUDE.md](/en/concepts/claude-md) (writing it well, pitfalls) · official docs: [memory and CLAUDE.md](https://code.claude.com/docs/en/memory), [`/init` and `AGENTS.md`](https://code.claude.com/docs/en/memory#agents-md)

## Step 2: Create the .claude/ folder

```bash
mkdir -p .claude/{agents,skills,rules}
```

::: info What about `commands/`?
Commands are now merged into skills: an action triggered by `/name` is created as a skill (`.claude/skills/<name>/SKILL.md`). The `commands/` folder is still read, but it is a legacy format.
:::

→ **Going further**: [.claude/ Architecture](/en/introduction/architecture) (role of each folder) · official docs: [Extend Claude Code](https://code.claude.com/docs/en/features-overview)

## Step 3: First rule

Create `.claude/rules/git.md` to standardize commits. Without [frontmatter](/en/reference/glossary#frontmatter), the [rule](/en/reference/glossary#rule) is loaded in every session:

```markdown
# Git

- Always use Conventional Commits: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore
- Never force-push on main
```

To load it only when Claude works on certain files, add a `paths` frontmatter:

```markdown
---
paths:
  - "src/api/**/*.ts"
---
```

**Test it**: run `/context` and check that the rule appears in the memory files section.

→ **Going further**: [Rules](/en/concepts/rules) (`paths`, glob pitfalls) · official docs: [rules](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/)

## Step 4: First skill

Create `.claude/skills/quality-check/SKILL.md` ([skill](/en/reference/glossary#skill)):

::: warning Avoid bundled skill names
Don't name your skill `code-review`: that name is already taken by a Claude Code bundled skill (`/code-review`).
:::

```markdown
---
name: quality-check
description: Code review with quality checklist
disable-model-invocation: true
---

# Quality Check

Analyze $ARGUMENTS, or failing that the modified files, and verify:

1. **Readability**: clear naming, short functions
2. **Security**: no injection, input validation
3. **Tests**: coverage of main and edge cases
4. **Performance**: no N+1, no unnecessary loops

Give a verdict: APPROVED / CORRECTIONS NEEDED
```

**Test it**: `/quality-check src/auth/` (`src/auth/` replaces `$ARGUMENTS`). The `/skills` command lists available skills.

→ **Going further**: [Skills](/en/concepts/skills) (description, triggering, pitfalls) · official docs: [skills and full frontmatter](https://code.claude.com/docs/en/skills)

## Step 5: First agent

Create `.claude/agents/code-explainer.md` ([agent](/en/reference/glossary#agent)):

```markdown
---
name: code-explainer
description: Explains code with analogies and diagrams
tools: Read, Glob, Grep
model: haiku
---

When asked to explain code:

1. Start with an everyday analogy
2. Draw an ASCII flow diagram
3. Explain step by step
4. Point out a common pitfall
```

**Test it**: ask "Use the code-explainer agent to explain `src/auth/login.ts`". The agent runs in its own context (in the background by default); `/tasks` lists ongoing work.

→ **Going further**: [Agents](/en/concepts/agents) (model, tools, parallelism) · official docs: [sub-agents](https://code.claude.com/docs/en/sub-agents)

## Step 6: Configure permissions

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run lint *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(rm -rf *)"
    ]
  }
}
```

`Bash(rm -rf *)` only blocks this exact form (`rm -fr`, `rm -r -f` get through): see [Hooks — security layers](/en/concepts/hooks#security-layers).

- **`allow`**: runs without confirmation ([permission rules](/en/reference/glossary#regles-de-permission)); **`ask`**: always asks; **`deny`**: always blocked (takes precedence).
- **`defaultMode`**: permission mode at startup (`default`, `acceptEdits`, `plan`…). See the [permission modes](https://code.claude.com/docs/en/permission-modes) and, to choose, [The essentials](/en/concepts/which-mechanism#which-permission-mode-at-which-step).
- File rules are written with `Read(...)` and `Edit(...)` (`Edit` covers all write tools).

→ **Going further**: [Settings](/en/concepts/settings), [Instruction or block?](/en/concepts/which-mechanism#instruction-or-block) · official docs: [permissions](https://code.claude.com/docs/en/permissions), [permission modes](https://code.claude.com/docs/en/permission-modes)

## Step 7: First Settings

| Command / shortcut | Usage |
|--------------------|-------|
| `/permissions` | View and edit allow / ask / deny rules |
| `/memory` | Edit CLAUDE.md, CLAUDE.local.md and toggle [auto memory](/en/reference/glossary#auto-memory) |
| `/model` | Switch models |
| `/effort` | Set the effort level (`low` → `max`) |
| `Shift+Tab` | Cycle through permission modes, including **[plan mode](/en/reference/glossary#plan-mode)** (analysis without changes) |
| `/context` | Visualize context usage and loaded memory files |
| `/skills` | List available skills |
| `/doctor` | Diagnose installation, settings and CLAUDE.md files |

→ **Going further**: [Cheatsheet](/en/reference/cheatsheet) · official docs: [commands](https://code.claude.com/docs/en/commands), [shortcuts](https://code.claude.com/docs/en/interactive-mode)

::: warning Commit every working state
`/rewind` (Esc Esc) undoes neither what commands do (Docker, npm, generators) nor the work of agents. A commit at each step that works gives you a reliable restore point. See [`/rewind` or git?](/en/concepts/which-mechanism#undoing-a-mistake-rewind-or-git).
:::

## Resulting Structure

```
my-project/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   └── code-explainer.md
│   ├── skills/
│   │   └── quality-check/
│   │       └── SKILL.md
│   └── rules/
│       └── git.md
└── src/
```

## Next Steps

- [The essentials: which building block for which need?](/en/concepts/which-mechanism) — the hesitations you will meet, and our choices
- [Best practices](/en/guide/best-practices) — golden rules and the full checklist
- [Pitfall catalog](/en/guide/warns) — common mistakes, sorted by severity
- [Settings — sandbox](/en/concepts/settings#sandbox) — hardening the configuration
- [Concrete examples](/en/examples/) from a real project
