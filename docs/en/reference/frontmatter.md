# Frontmatter Reference

## [Agents](/en/concepts/agents)

[Agents](/en/concepts/agents) use YAML frontmatter at the beginning of `.claude/agents/<name>.md` files:

```yaml
---
name: backend-tasks-executor
description: Backend Test First implementation
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - symfony/api-conventions
  - symfony/testing-conventions
---
```

### Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Unique agent identifier |
| `description` | Yes | string | What the agent does (1-2 lines). Used by Claude for auto-delegation |
| `tools` | No | string (CSV) | Authorized tools: `Read`, `Glob`, `Grep`, `Write`, `Edit`, `Bash`, `Agent(type)`. Default: all |
| `model` | No | string | Model: `opus`, `sonnet`, `haiku`. Default: inherits from parent |
| `skills` | No | list | Inherited skills (folder names in `.claude/skills/`) |
| `allowed-tools` | No | string (CSV) | Tools allowed without confirmation (e.g.: `Bash(docker *)`) |
| `disallowedTools` | No | list | Tools forbidden for this agent |
| `permissionMode` | No | string | Permission mode: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | number | Max number of turns (tool/response exchanges) |
| `mcpServers` | No | object | MCP servers specific to this agent |
| `memory` | No | string | Persistent memory: `user`, `project`, `local` |
| `background` | No | boolean | Run the agent in the background |
| `isolation` | No | string | `worktree` to execute in an isolated git worktree |
| `hooks` | No | object | Agent lifecycle-specific hooks |

### Model Values

| Value | Model | Full ID |
|-------|-------|---------|
| `opus` | Claude Opus 4.6 | `claude-opus-4-6` |
| `sonnet` | Claude Sonnet 4.6 | `claude-sonnet-4-6` |
| `haiku` | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` |

### Available Tools

| Tool | Description | Typical usage |
|------|-------------|--------------|
| `Read` | Read a file | Analysis, consultation |
| `Glob` | Search files by pattern | Navigation |
| `Grep` | Search content in files | Code analysis |
| `Write` | Create/overwrite a file | Generation |
| `Edit` | Modify an existing file | Implementation |
| `Bash` | Execute a shell command | Tests, build, git |

---

## [Skills](/en/concepts/skills)

[Skills](/en/concepts/skills) use YAML frontmatter at the beginning of `SKILL.md`:

```yaml
---
name: api-conventions
description: Backend Symfony conventions for this project
user-invocable: false
---
```

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Bash(gh *), Read
argument-hint: "[environment]"
---
```

### Fields

| Field | Required | Type | Default | Description |
|-------|----------|------|---------|-------------|
| `name` | No | string | folder name | Display name and `/slash-command`. Lowercase, digits, hyphens (max 64 chars) |
| `description` | Recommended | string | 1st paragraph | What the skill does. Claude uses it to decide when to load |
| `disable-model-invocation` | No | boolean | `false` | `true` = only the user can invoke |
| `user-invocable` | No | boolean | `true` | `false` = invisible in the `/` menu |
| `allowed-tools` | No | string (CSV) | - | Tools allowed without confirmation |
| `model` | No | string | - | Model to use |
| `context` | No | string | - | `fork` = execute in an isolated sub-agent |
| `agent` | No | string | `general-purpose` | Sub-agent type if `context: fork` |
| `argument-hint` | No | string | - | Autocompletion hint (e.g.: `[issue-number]`) |
| `hooks` | No | object | - | Skill lifecycle-specific hooks |

### Visibility Combinations

| `user-invocable` | `disable-model-invocation` | User | Claude | Description loaded |
|-------------------|--------------------------|------|--------|-------------------|
| `true` (default) | `false` (default) | Yes | Yes | Yes |
| `true` | `true` | Yes | No | No |
| `false` | `false` | No | Yes | Yes |

### Substitution Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$ARGUMENTS` | All arguments | `/skill foo bar` → `foo bar` |
| `$ARGUMENTS[N]` | Argument by index | `$ARGUMENTS[0]` → `foo` |
| `$N` | Shortcut for `$ARGUMENTS[N]` | `$0` → `foo` |
| `${CLAUDE_SESSION_ID}` | Session ID | `abc123-def456` |
| `${CLAUDE_SKILL_DIR}` | SKILL.md folder | `/path/to/.claude/skills/my-skill` |

### Dynamic Injection

```markdown
Content before: !`gh pr diff`
```

The command between `` !` `` and `` ` `` is executed before sending to the model. The output replaces the placeholder.

---

## [Rules](/en/concepts/rules)

[Rules](/en/concepts/rules) use minimal YAML frontmatter:

```yaml
---
paths:
  - "api-rest-symfony-target/**"
  - "api-rest-symfony-target/tests/**"
---
```

### Fields

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `paths` | No | list | Glob patterns. If absent = global rule (always active) |

### Glob Pattern Examples

| Pattern | Matches |
|---------|---------|
| `src/**` | All files in src/ recursively |
| `src/*.ts` | .ts files at first level of src/ |
| `src/**/*.test.ts` | All test files in src/ |
| `*.md` | Markdown files at root |
| `**` | All files (avoid this) |

---

## [Commands](/en/concepts/commands)

[Commands](/en/concepts/commands) support the same frontmatter as [skills](/en/concepts/skills):

```yaml
---
name: commit
description: Commit with Conventional Commits
disable-model-invocation: true
---
```

The fields are identical to those of skills. The difference is location: `.claude/commands/` vs `.claude/skills/`.
