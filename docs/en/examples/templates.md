# Template Library

Copy-paste templates to get started quickly.

## Agents

### Reviewer Agent (Sonnet)

```yaml
---
name: code-reviewer
description: Code review with quality and security checklist
tools: Read, Glob, Grep
model: sonnet
---

# Code Review

Analyze modified files (git diff) and verify:

## Checklist
1. **Architecture**: separation of concerns
2. **Standards**: style conventions, naming
3. **Security**: injection, validation, auth
4. **Tests**: coverage, edge cases, mocking
5. **Performance**: N+1, loops, memory

## Severities
- CRITICAL: blocking, security flaw
- HIGH: probable bug, bad design
- MEDIUM: readability, maintainability
- LOW: suggestion, style

## Verdict
APPROVED | CORRECTIONS REQUIRED | REFONTE NEEDED
```

### Test Writer Agent (Sonnet)

```yaml
---
name: test-writer
description: Generate exhaustive tests for existing code
tools: Read, Glob, Grep, Write
model: sonnet
---

# Test Writer

For each target file/class:

1. Identify public methods
2. For each method, generate:
   - Nominal test (happy path)
   - Edge case tests
   - Error tests (exceptions, invalid inputs)
3. Use the project's test framework
4. Naming convention: test_[method]_[scenario]
```

### Security Auditor Agent (Sonnet)

```yaml
---
name: security-auditor
description: OWASP Top 10 audit on source code
tools: Read, Glob, Grep
model: sonnet
---

# Security Audit

Scan for OWASP Top 10 vulnerabilities:

1. Injection (SQL, Command, LDAP)
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Using Components with Known Vulnerabilities
10. Insufficient Logging & Monitoring

## Report Format
For each finding:
- Severity: CRITICAL / HIGH / MEDIUM / LOW
- File and line
- Risk description
- Suggested remediation
```

### Planner Agent (Opus, read-only)

```yaml
---
name: architecture-planner
description: Architecture planning without code modification
tools: Read, Glob, Grep
model: opus
---

# Architecture Planning

1. Analyze the current project structure
2. Identify patterns in place
3. Propose a detailed implementation plan:
   - Files to create/modify
   - Creation order (dependencies)
   - Tests to write
   - Risks and alternatives

NEVER modify code. Only analyze and recommend.
```

---

## Skills

### Passive Skill — TypeScript Conventions

```yaml
---
name: ts-conventions
description: TypeScript conventions for the project.
  Style, patterns, component architecture.
user-invocable: false
---

# TypeScript Conventions

## Style
- Strict mode (`"strict": true` in tsconfig)
- Interfaces > Types (except unions/intersections)
- No `any` — use `unknown` + type guards
- String enums > Numeric enums

## Architecture
- Barrel exports (`index.ts`) per module
- Services in `services/`, types in `types/`
- Components: PascalCase files, kebab-case folders

## Tests
- `.test.ts` files alongside source
- Describe/it in English, descriptive messages
```

### Launcher Skill — Feature Flag Toggle

```yaml
---
name: toggle-feature
description: Enable/disable a feature flag in production
disable-model-invocation: true
argument-hint: "[flag-name] [on|off]"
---

# Toggle Feature Flag

1. Verify that the flag `$0` exists in the config
2. Change the value to `$1` (on/off)
3. Run smoke tests
4. If tests OK → commit with `feat(flags): toggle $0 $1`
5. If tests KO → rollback + error report
```

---

## Hooks

### Complete Security Hook

```bash
#!/bin/bash
# security-gate.sh — referenced in settings.json hooks
# PreToolUse matcher: Bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Destructive commands
BLOCKED=(
  'rm -rf /'
  'rm -rf \.'
  'chmod 777'
  'curl.*| bash'
  'wget.*| sh'
  'git push.*--force.*main'
  'git reset --hard'
  'DROP TABLE'
  'DROP DATABASE'
  'TRUNCATE'
)

for p in "${BLOCKED[@]}"; do
  if echo "$COMMAND" | grep -qiE "$p"; then
    echo "BLOCKED: $p" >&2
    exit 2
  fi
done

exit 0
```

### Secret Detection Hook

```bash
#!/bin/bash
# secret-scanner.sh — referenced in settings.json hooks
# PreToolUse matcher: Write, Edit

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

SECRETS=(
  'AKIA[0-9A-Z]{16}'                # AWS
  'sk-[a-zA-Z0-9]{48}'              # OpenAI
  'ghp_[a-zA-Z0-9]{36}'             # GitHub PAT
  'xoxb-[0-9]+-[a-zA-Z0-9]+'        # Slack
  'AIza[0-9A-Za-z_-]{35}'           # Google API
  'SG\.[a-zA-Z0-9_-]{22}\.'        # SendGrid
)

for p in "${SECRETS[@]}"; do
  if echo "$CONTENT" | grep -qE "$p"; then
    echo "BLOCKED: secret detected ($p)" >&2
    exit 2
  fi
done

exit 0
```

---

## Configurations

### settings.json — Web Project (Node.js)

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(ls *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(.env*)",
      "Edit(.env*)"
    ]
  }
}
```

### settings.json — Docker Project (PHP/Symfony)

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose *)",
      "Bash(git status)", "Bash(git diff *)",
      "Bash(git log *)", "Bash(git add *)",
      "Bash(ls *)", "Bash(find *)", "Bash(mkdir *)"
    ],
    "deny": [
      "Write(legacy-src/**)",
      "Edit(legacy-src/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### CLAUDE.md — Starter Template

```markdown
# My Project

## Stack
- Runtime: [Node.js 20 / PHP 8.2 / Python 3.12]
- Framework: [Express / Symfony / FastAPI]
- DB: [PostgreSQL / MySQL / MongoDB]
- Tests: [Jest / PHPUnit / pytest]

## Commands
- `[npm test / docker compose exec app phpunit]` : Tests
- `[npm run lint / phpcs]` : Lint
- `[npm run build / docker compose build]` : Build

## Conventions
- [Style: camelCase / snake_case]
- [Architecture: MVC / Hexagonal / Clean]
- [Tests before code (TDD)]

## Workflow
1. /plan → Explore
2. Implement → Tests first
3. /dev/commit → Conventional Commits
```

---

## Rules

### Protection Rule

```markdown
---
paths:
  - "legacy/**"
---

# Legacy — READ ONLY

NEVER modify these files. Read, Glob, Grep only.
```

### Delegation Rule

```markdown
---
paths:
  - "src/api/**"
---

# API

Load the skill `api-conventions` for conventions.
Reminders: REST, DTO validation, integration tests.
```

### Global Rule (git)

```markdown
---
---

# Git

- Conventional Commits: type(scope): description
- Never force-push on main
- Always use /dev/commit
```

---

## GitHub Actions

### Automatic PR Review

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Claude Review
        run: |
          gh pr diff ${{ github.event.pull_request.number }} > /tmp/diff.txt
          # Send the diff to Claude via API for review
```

## Resources

- [Official Anthropic examples](https://github.com/anthropics/skills)
- [Bruniaux Templates](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/tree/main/examples)
