# Quick Start

## Prerequisites

- Claude Code installed (`npm install -g @anthropic-ai/claude-code` or via the VS Code extension)
- An existing project with a `.git/` folder

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
Keep the file short and factual. Claude loads it at every session.
:::

## Step 2: Create the .claude/ folder

```bash
mkdir -p .claude/{agents,skills,rules,commands}
```

## Step 3: First rule

Create `.claude/rules/git.md` to standardize commits:

```markdown
---
---

# Git

- Always use Conventional Commits: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore
- Never force-push on main
```

## Step 4: First skill

Create `.claude/skills/code-review/SKILL.md`:

```yaml
---
name: code-review
description: Code review with quality checklist
disable-model-invocation: true
---

# Code Review

Analyze the modified files and verify:

1. **Readability**: clear naming, short functions
2. **Security**: no injection, input validation
3. **Tests**: coverage of main and edge cases
4. **Performance**: no N+1, no unnecessary loops

Give a verdict: APPROVED / CORRECTIONS NEEDED
```

Test it: `/code-review src/auth/`

## Step 5: First agent

Create `.claude/agents/code-explainer.md`:

```yaml
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

## Step 6: Configure permissions

Create `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(npm run lint *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  }
}
```

## Resulting Structure

```
my-project/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   └── code-explainer.md
│   ├── skills/
│   │   └── code-review/
│   │       └── SKILL.md
│   ├── rules/
│   │   └── git.md
│   └── commands/
└── src/
```

## Next Steps

- [Best practices](/en/guide/best-practices) for structuring a complete project
- [Multi-agent patterns](/en/guide/patterns) for orchestrating complex workflows
- [Security](/en/guide/security) for hardening the configuration
- [Concrete examples](/en/examples/) from a real project
