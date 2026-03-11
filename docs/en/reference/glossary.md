# Glossary

## A

### Agent (Sub-agent)
Specialized Claude instance configured in `.claude/agents/`. Each agent has its own tools, model and instructions. Works in an isolated context, without access to conversation history. See [Agents](/en/concepts/agents).

### Agent Skills (standard)
Open standard initiated by Anthropic to define a portable skill format compatible with multiple AI tools (Claude Code, Cursor, VS Code Copilot, Gemini CLI, etc.). See [Agent Skills Standard](/en/reference/agent-skills-standard).

### Allow (permission)
List of tools and commands Claude can use without asking for confirmation. Configured in `settings.json`. See [Settings](/en/concepts/settings).

### @import
Directive in CLAUDE.md to include content from another file. Syntax: `@import ./path/to/file.md`. Max depth: 5 nested levels. See [CLAUDE.md](/en/concepts/claude-md).

### Auto-memory
File `MEMORY.md` in `~/.claude/projects/<project>/memory/` that Claude automatically updates to remember patterns and decisions between sessions. Truncated after 200 lines.

## C

### claudeMdExcludes
Field in `settings.json` to prevent Claude from loading CLAUDE.md files in certain folders (e.g.: `node_modules`, `vendor`).

### Checkpoint
Verification point between two pipeline steps. Checks the existence and validity of output files before moving to the next step.

### CLAUDE.md
Persistent project memory file, automatically loaded by Claude at every session. Single source of truth for paths and conventions. See [CLAUDE.md](/en/concepts/claude-md).

### Command (slash command)
Markdown file in `.claude/commands/` invocable via `/name`. Merged with skills (same frontmatter, same behavior), commands continue to work. See [Commands](/en/concepts/commands).

### Context (fork)
Frontmatter option `context: fork` that executes a skill in an isolated sub-agent, without access to conversation history.

### Conventional Commits
Commit message format convention: `type(scope): description`. Types: feat, fix, refactor, docs, test, chore.

## D

### Deny (permission)
List of tools and commands Claude can never use. Configured in `settings.json`. Takes priority over allow.

### disable-model-invocation
Frontmatter field that prevents Claude from loading a skill automatically. Only the user can invoke it via `/name`.

## F

### Frontmatter
YAML metadata at the beginning of a Markdown file (between `---`). Configures the behavior of agents, skills and rules.

## G

### Glob pattern
File matching pattern used in rules (`paths:`) and permissions. E.g.: `src/**/*.ts` matches all TypeScript files in src/.

## H

### Haiku
Lightweight and fast Claude model. Used for structured tasks: documentation, audit, diagnostics. Minimal cost.

### Hook
Script, HTTP endpoint, prompt or agent executed automatically in response to a Claude event. 16 available events: PreToolUse, PostToolUse, Notification, Stop, SubagentStop, etc. 4 types: command, http, prompt, agent. See [Hooks](/en/concepts/hooks).

## I

### /init
Built-in command that automatically generates a CLAUDE.md tailored to the project (analyzes structure, stack and commands).

### InstructionsLoaded (hook event)
Hook event triggered after loading CLAUDE.md and all instructions. Useful for logging or dynamic context injection.

## L

### Launcher (skill)
Skill manually invocable via `/name` that orchestrates a multi-step workflow, often by delegating to multiple agents.

## M

### MCP (Model Context Protocol)
Standardized protocol connecting Claude to external tools and data via servers. See [MCP](/en/concepts/mcp).

### Managed settings
Configuration deployed at the enterprise level, applicable to all users in an organization.

### /memory
Built-in command to view and edit the automatic memory file (`MEMORY.md`).

## O

### Opus
Most powerful Claude model. Used for complex analysis, multi-step reasoning and understanding undocumented code. 1M token window.

## P

### Passive (skill)
Skill with `user-invocable: false`, invisible in the `/` menu. Claude loads it automatically when the context is relevant.

### Permission mode
Trust level configured for Claude Code: Plan Mode (read-only), Default (confirmation), Accept Edits (auto-edits), Don't Ask (allowlist auto), Bypass Permissions (all auto, danger).

### Plugin
Packaged extension that can contain skills, configured in an external directory added via `--add-dir`.

### PreToolUse / PostToolUse
Hook execution points. PreToolUse executes before the action (can block), PostToolUse after (for logging/notification).

## R

### Reference (file)
Detailed documentation file associated with a skill, stored in `references/`. Loaded by Claude on demand.

### Rule
Markdown file in `.claude/rules/` whose content is automatically injected when manipulated files match the glob pattern. See [Rules](/en/concepts/rules).

## S

### Sandbox
Filesystem and network isolation for Bash commands (macOS, Linux, WSL2). Configured in `settings.json` with `allowWrite`, `denyRead`, `allowedDomains`. See [Settings](/en/concepts/settings).

### Settings (settings.json)
Configuration file for permissions, sandbox, model and hooks. 5 levels: managed > CLI > local > project > user. See [Settings](/en/concepts/settings).

### settings.local.json
Personal settings file (`.claude/settings.local.json`), gitignored. Ideal for personal preferences (model, language) without polluting the repo.

### Skill
Set of instructions and resources in `.claude/skills/`. Can be passive (conventions) or launcher (workflow). See [Skills](/en/concepts/skills).

### SKILL.md
Mandatory entry file for a skill. Contains the configuration frontmatter and main instructions.

### Sonnet
Balanced quality/speed Claude model. Used for implementation, planning and review. Good cost/performance ratio.

### Single source of truth
Principle that each piece of information has only one reference location, avoiding duplications and contradictions.

## T

### TDD (Test-Driven Development)
Implementation approach where tests are written before code: Red (test fails) → Green (code passes) → Refactor.

### ToolSearch
MCP tool discovery mechanism. "Deferred" tools are only loaded after calling ToolSearch.

## U

### user-invocable
Frontmatter field. `false` = the skill is invisible in the `/` menu, only Claude can load it.

## V

### Versioning (reports)
Convention of never overwriting an existing report. Each new evaluation creates an incremented version: V1, V2, V3.
