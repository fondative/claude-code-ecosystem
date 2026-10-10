# Glossary

## A

### Agent (subagent) {#agent}
Specialized Claude instance configured in `.claude/agents/`. Each agent has its own tools, model and instructions, and works in an isolated context, without access to conversation history. See [Agents](/en/concepts/agents) and the [official documentation](https://code.claude.com/docs/en/sub-agents).

### Agent SDK (Claude Agent SDK)
Python and TypeScript library (formerly "Claude Code SDK") that exposes Claude Code's tools, agent loop and context management to build your own agents. See [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview).

### Agent Skills (standard)
Open standard initiated by Anthropic to define a portable skill format compatible with multiple AI tools (Claude Code, Cursor, VS Code Copilot, Gemini CLI, etc.). See [Agent Skills Standard](https://agentskills.io/specification).

### Agent Teams
Multi-agent coordination feature where multiple Claude Code sessions collaborate on different tasks. Unlike subagents (same session), agent teams operate in separate sessions.

### AGENTS.md
Instruction file in a format shared across several AI tools. Claude Code reads it instead of CLAUDE.md when no `CLAUDE.md` / `CLAUDE.local.md` exists in the current directory or its parents. See [CLAUDE.md](/en/concepts/claude-md).

### Artifact
Interactive web page (HTML) that Claude Code publishes from the session to a private URL on claude.ai, updated as the session goes on and shareable. See [Artifacts](https://code.claude.com/docs/en/artifacts).

### @import (`@path`)
CLAUDE.md syntax to include content from another file: `@path/to/file.md` (relative to the importing file, or absolute). Max depth: 4 nested import hops. Imports from outside the project trigger an approval prompt. See [CLAUDE.md](/en/concepts/claude-md).

### Auto mode
`auto` [permission mode](#modes-de-permission): a classifier reviews actions in the background and avoids most confirmation prompts, while blocking actions deemed risky.

### Auto memory {#auto-memory}
Notes Claude writes itself to remember information across sessions, in `~/.claude/projects/<project>/memory/` (shared across a repository's worktrees): a `MEMORY.md` index plus topic files. At startup, only the first 200 lines or 25 KB of `MEMORY.md` (whichever comes first) are loaded. Toggle via `/memory` (`autoMemoryEnabled`). See [CLAUDE.md](/en/concepts/claude-md) and the [official documentation](https://code.claude.com/docs/en/memory).

## B

### Background agent
Subagent that runs without blocking the conversation; Claude gets a notification when it finishes. This is the default behavior; `Ctrl+B` sends a running task to the background and `/tasks` lists ongoing work. See [Parallelism and sequence](/en/examples/pipeline#parallelism-and-sequence).

### --bare {#bare}
`claude -p` (non-interactive mode) option that skips auto-discovery of hooks, skills, commands, subagents, plugins, MCP servers, auto memory and CLAUDE.md: only what you pass on the command line applies. Recommended for scripts and CI. See [Hooks — WARN-008](/en/concepts/hooks#warn-008) and the [official documentation](https://code.claude.com/docs/en/headless).

### Quality loop (boucle qualité) {#boucle-qualite}
<span class="chez-nous">In our project</span> Iterative mechanism where a judge agent (conformity-reporter) evaluates an [executor](#executor)'s output. If the score is below 80/100, the executor is re-run with corrections. A single correction pass, then a V2 report: below 80/100 in V2, human intervention. See [Pipeline](/en/examples/pipeline).

### /btw
Built-in command to ask a side question about the session without adding it to the conversation, preserving context for the current task.

## C

### Checkpoint (pipeline)
<span class="chez-nous">In our project</span> In the project's pipelines: verification point between two steps. Checks the existence and validity of output files before moving to the next step. Not to be confused with [Claude Code checkpoints](#checkpoint-rewind).

### Checkpoint / Rewind {#checkpoint-rewind}
Claude Code feature that records the state of the conversation and of files edited by Claude, so you can go back to an earlier point via `Esc` `Esc` or `/rewind` (aliases `/checkpoint`, `/undo`). See [Undoing a mistake: `/rewind` or git?](/en/concepts/which-mechanism#undoing-a-mistake-rewind-or-git).

### claudeMdExcludes {#claudemdexcludes}
Setting (list of [glob](#glob) patterns on absolute paths) that stops Claude Code from loading some CLAUDE.md files, typically other teams' files in a monorepo. Can be set at any settings layer (lists merge); the [managed](#managed) CLAUDE.md cannot be excluded. See [CLAUDE.md](/en/concepts/claude-md) and the [official documentation](https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files).

### CLAUDE.md
Persistent project memory file, automatically loaded by Claude at every session. <span class="chez-nous">In our project</span> it is the single source of truth for paths. See [CLAUDE.md](/en/concepts/claude-md).

### CLAUDE.local.md
Personal variant of CLAUDE.md, at the project root and to be added to `.gitignore`. Loaded in addition to CLAUDE.md, after it (so it appears last in context). See [CLAUDE.md](/en/concepts/claude-md).

### Command (slash command)
Markdown file in `.claude/commands/` invocable via `/name` (a subfolder becomes a prefix: `dev/commit.md` → `/dev:commit`). Legacy format merged with skills: same frontmatter (except `name` and `paths`), still works. See [Commands](/en/concepts/commands) and [Project commands](/en/examples/project-structure#project-commands).

### Compaction {#compaction}
Automatic summary of the conversation when the context window nears its limit (or on demand with `/compact [instructions]`). Exchanges are replaced by a summary: an instruction given only in conversation can be lost, whereas the root CLAUDE.md is re-read from disk. See [CLAUDE.md](/en/concepts/claude-md) and the [official documentation](https://code.claude.com/docs/en/memory#instructions-seem-lost-after-compact).

### Context (fork)
Frontmatter option `context: fork` that runs a skill in an isolated subagent, without access to conversation history.

### Conventional Commits
Commit message format convention: `type(scope): description`. Types: feat, fix, refactor, docs, test, chore.

## D

### disable-model-invocation
Frontmatter field that prevents Claude from loading a skill automatically. Only the user can invoke it via `/name`.

## E

### Effort
How much reasoning the model puts into a task: `low`, `medium`, `high`, `xhigh`, `max` (depending on model). Set via `/effort`, the `effort` setting or the `effort` frontmatter field of agents and skills. See [Model configuration](https://code.claude.com/docs/en/model-config).

### Exec form / shell form {#exec-form}
Two ways to run a `command` hook. **Exec form** (`args` field present): the executable is spawned directly with `args` as its arguments, no shell (no quoting to manage, no expansion). **Shell form** (no `args`): the `command` string goes through a shell, so pipes, `&&` and variables work. See [Hooks](/en/concepts/hooks) and the [official documentation](https://code.claude.com/docs/en/hooks#exec-form-and-shell-form).

### Executor {#executor}
<span class="chez-nous">In our project</span> Agent that implements the planned tasks with TDD (`backend-tasks-executor`, `frontend-tasks-executor`); its output is then scored by the conformity-reporter in the [quality loop](#boucle-qualite). See [Pipeline](/en/examples/pipeline).

## F

### Fable
Claude model family. Current version: Fable 5.1 (`claude-fable-5-1`), alias `fable`. See [Model configuration](https://code.claude.com/docs/en/model-config).

### Fast mode
Speed-oriented Opus configuration (much faster responses, higher cost per token) — not a different model. Toggle with `/fast`. See [Fast mode](https://code.claude.com/docs/en/fast-mode).

### front-design-conventions (skill)
<span class="chez-nous">In our project</span> Passive skill defining design conventions (rem/em/%, breakpoints, design tokens, fidelity checklist). Inherited by the frontend-tasks-executor for conditional processing of Figma JSON files. See [Skills](/en/concepts/skills).

### Frontmatter {#frontmatter}
YAML metadata at the beginning of a Markdown file (between two `---` lines). Configures the behavior of agents, skills, commands, rules and output styles (name, description, tools, model, `paths`…). See [Skills](/en/concepts/skills) and the [official reference](https://code.claude.com/docs/en/skills#frontmatter-reference).

## G

### Glob {#glob}
File path matching pattern: `*` stands for one name (no `/`), `**` for any number of folders. E.g. `src/**/*.ts` matches every TypeScript file under `src/`. Used in rules (`paths:`), permissions (`Edit(src/**)`) and `claudeMdExcludes`. See [Rules](/en/concepts/rules) and the [official documentation](https://code.claude.com/docs/en/permissions#wildcard-patterns).

## H

### Haiku
Lightweight and fast Claude model (current version: Haiku 4.5, `claude-haiku-4-5-20251001`, alias `haiku`). Used for structured tasks: inventory auditing, diagnostics. Minimal cost.

### headersHelper {#headershelper}
Configuration field of a remote MCP server (`http`, `sse`, `ws`): a command run on every connection that prints the headers to send as JSON (e.g. `Authorization`). The token is produced on the fly instead of being written in plain text in the configuration. See [MCP](/en/concepts/mcp) and the [official documentation](https://code.claude.com/docs/en/mcp#use-dynamic-headers-for-custom-authentication).

### Hook {#hook}
Action Claude Code runs automatically in response to a lifecycle event (before/after a tool, on prompt submission, at the end of a turn…). More than 30 events (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop, SessionStart, PreCompact…). 5 types: `command`, `http`, `mcp_tool`, `prompt`, `agent`. It is deterministic code, not an instruction. See [Hooks](/en/concepts/hooks) and the [official documentation](https://code.claude.com/docs/en/hooks).

## I

### /init
Built-in command that automatically generates a CLAUDE.md tailored to the project (analyzes structure, stack and commands).

### Prompt injection {#injection-de-prompt}
Malicious instructions hidden in content Claude reads (web page, file, issue, MCP tool result) to hijack its behavior, for example to make it exfiltrate a secret. Defenses are [permission rules](#regles-de-permission), the [sandbox](#sandbox) and detection hooks. See [Hooks — anti-injection example](/en/concepts/hooks#example-10-anti-injection-hook) and the [official documentation](https://code.claude.com/docs/en/security).

### Dynamic injection (`` !`command` ``) {#injection-dynamique}
Skill or command syntax: `` !`git diff --staged` `` runs the shell command before the prompt is sent and replaces the placeholder with its output. Claude therefore receives the result, not the command. Can be disabled with the `disableSkillShellExecution` setting. See [Skills](/en/concepts/skills) and [Commands](/en/concepts/commands).

### InstructionsLoaded (hook event)
Hook event fired each time an instruction file (CLAUDE.md or `.claude/rules/*.md`) is loaded: at startup, then on every on-demand load (matching `paths:` rule, subfolder CLAUDE.md, after compaction). Purely observational: it can neither block loading nor inject context; use it for logging and auditing. See the [official documentation](https://code.claude.com/docs/en/hooks#instructionsloaded).

## L

### Launcher (skill launcher) {#skill-launcher}
Skill invoked manually via `/name` (often with `disable-model-invocation: true`) that orchestrates a multi-step workflow, usually by delegating to several agents. Opposite of the [passive skill](#skill-passive). See [Skills](/en/concepts/skills).

### LLM-as-Judge {#llm-as-judge}
Pattern where an agent, in a fresh context, evaluates another agent's output against explicit criteria. <span class="chez-nous">In our project</span> the conformity-reporter scores the [executor](#executor) in the `/mod-migrate-feature` quality loop (threshold 80/100). See [Agents](/en/concepts/agents) and [Pipeline](/en/examples/pipeline).

### /loop
Bundled skill that repeats a prompt at a regular interval while the session stays open (`/loop 5m <prompt>`); without an interval, Claude picks the pace itself. For scheduled execution in the cloud, see [Routine](#routine).

### LSP {#lsp}
Language Server Protocol: the standard protocol of language servers (the ones editors use). A plugin can declare LSP servers (`.lsp.json` or the `lspServers` field) to give Claude diagnostics and code navigation (definitions, references). See [Plugins](/en/concepts/plugins) and the [official documentation](https://code.claude.com/docs/en/plugins-reference).

## M

### Managed (managed configuration) {#managed}
Configuration deployed by the organization (system file, MDM or admin console) that applies to all users and takes precedence over every other level: a user cannot override it. Exists for settings and for CLAUDE.md. See [Settings](/en/concepts/settings) and the [official documentation](https://code.claude.com/docs/en/permissions#managed-settings).

### Managed Policy CLAUDE.md
System CLAUDE.md file deployed at the organization level. Locations: macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux `/etc/claude-code/CLAUDE.md`, Windows `C:\Program Files\ClaudeCode\CLAUDE.md`. Cannot be excluded via `claudeMdExcludes`. See [CLAUDE.md](/en/concepts/claude-md).

### Manifest (plugin.json) {#manifeste}
A plugin's `.claude-plugin/plugin.json` file: metadata (name, version, description…), options to ask the user for (`userConfig`) and components placed outside their default location. See [Plugins](/en/concepts/plugins) and the [official reference](https://code.claude.com/docs/en/plugins-reference).

### Marketplace {#marketplace}
Plugin catalog (`.claude-plugin/marketplace.json` file in a git repository, at a URL or in a local folder) added with `/plugin marketplace add`, from which you install plugins. See [Plugins](/en/concepts/plugins) and the [official documentation](https://code.claude.com/docs/en/plugin-marketplaces).

### Matcher {#matcher}
Hook filter that states what it fires on, usually the tool name: `"Bash"`, `"Edit|Write"`, `"mcp__github__.*"`. Missing or `"*"`: the hook fires on every occurrence of the event. See [Hooks](/en/concepts/hooks) and the [official documentation](https://code.claude.com/docs/en/hooks#matcher-patterns).

### MCP (Model Context Protocol) {#mcp}
Standard protocol connecting Claude to external tools and data (GitHub, database, browser…) through servers; their tools appear as `mcp__<server>__<tool>`. See [MCP](/en/concepts/mcp) and the [official documentation](https://code.claude.com/docs/en/mcp).

### /memory
Built-in command to edit CLAUDE.md files (and CLAUDE.local.md), toggle auto memory and browse its entries.

### Mod
Claude Code interface extension (pane, band, status line, toast or hook) written as a plugin of "function hooks", hot-reloaded. Claude Code ships a few built-in ones, which can be turned off in `/plugin`. See [Plugins](/en/concepts/plugins).

### mod-conformity-conventions (skill)
<span class="chez-nous">In our project</span> Passive skill containing the scoring methodology, conformity report templates, report version management, and issue format. Inherited by the conformity-reporter. See [Skills](/en/concepts/skills).

### Permission modes {#modes-de-permission}
Claude Code's autonomy level, changed with `Shift+Tab` or `--permission-mode`: `default` (confirmation), `acceptEdits` (file edits without confirmation), `plan` (read-only, see [plan mode](#plan-mode)), `auto` (classifier), `dontAsk` (denies anything not pre-approved), `bypassPermissions` (no prompts, isolated environments only). See [Which permission mode, at which step?](/en/concepts/which-mechanism#which-permission-mode-at-which-step) and the [official documentation](https://code.claude.com/docs/en/permission-modes).

## O

### OAuth {#oauth}
Standard authorization protocol. For a remote MCP server that supports it, `/mcp` opens the browser to sign in; Claude Code stores and refreshes the token itself, without it appearing in plain text in the configuration. See [MCP](/en/concepts/mcp) and the [official documentation](https://code.claude.com/docs/en/mcp).

### Opus
High-end Claude model (current version: Opus 5.5, `claude-opus-5-5`, alias `opus`). Used for complex analysis, multi-step reasoning and understanding undocumented code. Extended context up to 1M tokens depending on model and provider.

### Orchestrator {#orchestrateur}
Main session (or a skill launcher running in it) that splits the work, launches subagents, checks their outputs and chains the steps. A subagent cannot launch other subagents: orchestration stays in the main session. See [Agents](/en/concepts/agents) and [Pipeline](/en/examples/pipeline).

### Output style {#output-style}
Markdown file (`.claude/output-styles/` or `~/.claude/output-styles/`) that sets Claude's role, tone and response format for the whole session. Selected via `/config` or the `outputStyle` setting. See [Output styles](https://code.claude.com/docs/en/output-styles).

## P

### Passive skill {#skill-passive}
Convention skill with `user-invocable: false`, invisible in the `/` menu: Claude loads it when its description matches the task, or it is preloaded into an agent through its `skills:` field. Opposite of the [skill launcher](#skill-launcher). See [Skills](/en/concepts/skills).

### Plan mode {#plan-mode}
`plan` [permission mode](#modes-de-permission): Claude explores (reads, read-only commands) and proposes a plan to approve before any change. Enable with `/plan` or `Shift+Tab`. See [Which permission mode, at which step?](/en/concepts/which-mechanism#which-permission-mode-at-which-step).

### Plugin
Portable package containing skills, agents, hooks and/or MCP servers in a single directory. Installed from a [marketplace](#marketplace) via `/plugin install <name>@<marketplace>` (or `claude plugin install`). Uses a `plugin-name:skill-name` namespace to avoid conflicts. See [Plugins](/en/concepts/plugins).

### Plugin eval
`claude plugin eval` command that runs a plugin against a suite of test cases (realistic prompt + pass/fail graders: regex, tool call, model-judged rubric) and scores the results. `claude plugin eval init` helps create the suite. See [Quality and review](/en/examples/quality-review).

### PreToolUse / PostToolUse
Hook events. PreToolUse runs before the action and can block it; PostToolUse runs after, to log, format or detect a problem (e.g. a [prompt injection](#injection-de-prompt) in the result): it can send feedback to Claude but cannot undo the action already done.

## R

### Reference (file)
Detailed documentation file associated with a skill, stored in `references/`. Loaded by Claude on demand.

### Permission rules (allow / ask / deny) {#regles-de-permission}
`settings.json` lists written as `Tool` or `Tool(specifier)`, e.g. `Bash(npm run test *)`, `Edit(src/**)`. `deny` always refuses, `ask` asks for confirmation, `allow` permits without asking; they are evaluated in the order deny → ask → allow, so a deny always wins. See [Settings](/en/concepts/settings) and the [official documentation](https://code.claude.com/docs/en/permissions#permission-rule-syntax).

### Routine {#routine}
Saved Claude Code configuration (prompt, repositories, connectors) run automatically on Anthropic's cloud infrastructure according to triggers (schedule…), even with your computer off. Created via `/schedule`.

### Rule {#rule}
Markdown file in `.claude/rules/`. Without `paths:` in its frontmatter, it is loaded at every session like CLAUDE.md; with `paths:`, its content is only injected when Claude works on a file matching the [glob](#glob) pattern. See [Rules](/en/concepts/rules) and the [official documentation](https://code.claude.com/docs/en/memory).

## S

### Sandbox {#sandbox}
Operating-system-level isolation (filesystem and network) of Bash commands and their child processes (macOS, Linux, WSL2). Configured in `settings.json` (`sandbox`, with `allowWrite`, `denyRead`, `allowedDomains`…). See [Settings](/en/concepts/settings#sandbox) and the [official documentation](https://code.claude.com/docs/en/sandboxing).

### Scope {#scope}
Reach of a configuration, i.e. the file it is written in and whom it applies to. Settings: `managed`, `user` (`~/.claude/`), `project` (`.claude/settings.json`, committed), `local` (`.claude/settings.local.json`, personal). MCP servers: `local` (default, this project, private, in `~/.claude.json`), `project` (`.mcp.json`, shared), `user` (all your projects). See [Settings](/en/concepts/settings), [MCP](/en/concepts/mcp) and the [official documentation](https://code.claude.com/docs/en/mcp#mcp-installation-scopes).

### SendMessage
Tool that sends a message to another agent (by ID or name), notably to **resume** a finished subagent with its context intact. See [Parallelism and sequence](/en/examples/pipeline#parallelism-and-sequence).

### Settings (settings.json)
Configuration file for permissions, sandbox, model and hooks. 5 levels: managed > CLI > local > project > user. See [Settings](/en/concepts/settings).

### settings.local.json
Personal settings file (`.claude/settings.local.json`), ignored by git. Ideal for personal preferences (model, language) without polluting the repository.

### Single source of truth
<span class="chez-nous">In our project</span> Principle that each piece of information has only one reference location, avoiding duplications and contradictions: the project's paths are defined only in the PATHS table of CLAUDE.md.

### Skill {#skill}
Folder in `.claude/skills/<name>/` containing a `SKILL.md` (frontmatter + instructions) and possibly reference files and scripts. Only its description is loaded at first; the full content is loaded when Claude or the user invokes it. Can be [passive](#skill-passive) (conventions) or a [launcher](#skill-launcher) (workflow). See [Skills](/en/concepts/skills) and the [official documentation](https://code.claude.com/docs/en/skills).

### SKILL.md
Required entry file for a skill. Contains the configuration frontmatter and main instructions.

### Sonnet
Balanced quality/speed Claude model (current version: Sonnet 5.5, `claude-sonnet-5-5`, alias `sonnet`). Used for implementation, planning and review. Good cost/performance ratio.

### Status line
Customizable bar at the bottom of Claude Code, fed by a shell script that receives session data as JSON (context, cost, git branch…). Configure via `/statusline` or the `statusLine` setting.

### stdio {#stdio}
Local MCP transport: Claude Code starts the server as a process on the machine and talks to it through its standard input and output. Opposite of remote transports (`http`, `sse`, `ws`) where the server is reached by URL. See [MCP](/en/concepts/mcp) and the [official documentation](https://code.claude.com/docs/en/mcp).

## T

### TDD (Test-Driven Development)
Implementation approach where tests are written before code: Red (test fails) → Green (code passes) → Refactor.

### Tool Search (ToolSearch) {#tool-search}
Deferred loading of tools: only their names are loaded at first, their full schema is loaded only after calling the ToolSearch tool. Applies to MCP tools (on by default, `ENABLE_TOOL_SEARCH=false` to turn it off) but also to some built-in tools; it saves context when many tools are connected. See [MCP](/en/concepts/mcp) and the [official documentation](https://code.claude.com/docs/en/mcp#scale-with-mcp-tool-search).

## U

### user-invocable
Frontmatter field. `false` = the skill is invisible in the `/` menu, only Claude can load it.

## V

### Versioning (reports)
<span class="chez-nous">In our project</span> Convention of never overwriting an existing report. Each new evaluation creates an incremented version: V1, V2, V3.

## W

### Workflow (dynamic workflow)
JavaScript script, written by Claude for the task you describe, that orchestrates many subagents at once; it runs in the background while the session stays responsive. Watch via `/workflows`. See [Agent or workflow?](/en/concepts/which-mechanism#agent-or-workflow).

### Workspace trust dialog {#dialogue-de-confiance}
Prompt shown the first time Claude Code starts in a folder: until you accept it, the `allow` rules of the project `settings.json`, its hooks and the `.mcp.json` servers do not apply (`deny` and `ask` rules always apply). `claude -p` does not show this dialog. See [Settings](/en/concepts/settings) and the [official documentation](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust).

### Worktree
Isolated git working copy (`git worktree`) where Claude or a subagent works without touching the current branch (agent field `isolation: worktree`). A temporary worktree with no changes is cleaned up automatically. See [Parallelism and sequence](/en/examples/pipeline#parallelism-and-sequence).
