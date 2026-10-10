# Cheatsheet

Quick reference — everything you need in 2 minutes.

Valid for any project. <span class="chez-nous">In our project</span> the modernization project's own commands are described in [Project commands](/en/examples/project-structure#project-commands).

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Interrupt Claude or close a dialog (work done so far is kept) |
| `Esc` `Esc` | Empty input: open the rewind menu (checkpoints) |
| `Shift+Tab` | Cycle [permission modes](/en/reference/glossary#modes-de-permission) (`Alt+M` on Windows in some terminals) |
| `Ctrl+C` | Interrupt the running operation (if nothing is running: clear the input, then exit on a 2nd press) |
| `Ctrl+B` | Send running Bash commands and agents to the background |
| `Ctrl+O` | Show/hide the detailed transcript (tool calls) |

Full list: [shortcuts (official docs)](https://code.claude.com/docs/en/interactive-mode).

## Built-in Commands

| Command | Action |
|---------|--------|
| `/init` | Generate an initial CLAUDE.md for the project |
| `/clear` | Start a new conversation with empty context (the old one stays available via `/resume`) |
| `/compact [instructions]` | Free up context by summarizing the conversation |
| `/context` | Visualize context usage and loaded memory files |
| `/resume` | Resume a conversation |
| `/rewind` | Go back to an earlier point (conversation and/or code) — does not undo commands or agents ([`/rewind` or git?](/en/concepts/which-mechanism#undoing-a-mistake-rewind-or-git)) |
| `/model` · `/effort` | Switch models · set the effort level |
| `/memory` | Edit CLAUDE.md files and manage [auto memory](/en/reference/glossary#auto-memory) |
| `/permissions` | Manage [allow / ask / deny rules](/en/reference/glossary#regles-de-permission) |
| `/plan [description]` | Enter [Plan mode](/en/reference/glossary#plan-mode) (read-only exploration) |
| `/diff` | Review working tree changes |
| `/tasks` | View and manage background work (shells, [subagents](/en/reference/glossary#agent)) |
| `/usage` | Session cost and plan limits |

Full list: [commands (official docs)](https://code.claude.com/docs/en/commands).

## Permission Modes

| Mode | In short |
|------|----------|
| **Manual** (`default`) | Asks before any action that is not pre-approved |
| **Accept Edits** | File edits accepted, everything else asked |
| **Plan** | Reading and read-only commands only |
| **Auto** | A classifier approves actions in the background |
| **Don't Ask** | Automatically denies anything not pre-approved |
| **Bypass** | No prompts — isolated environments only |

Cycle: `Shift+Tab`. Details and choosing a mode: [Which permission mode at which step](/en/concepts/which-mechanism#which-permission-mode-at-which-step) · [official docs](https://code.claude.com/docs/en/permission-modes).

## Context Management

Claude Code **auto-compacts** the conversation ([compaction](/en/reference/glossary#compaction)) when the context nears its limit (threshold adjustable with `/autocompact`). Depending on model and provider, the window can reach **1M tokens**. The thresholds below are a **recommendation** from this wiki to keep reasoning quality high, not a rule of the tool:

| Threshold (recommended) | Action |
|-----------|--------|
| < 70% | Normal — work |
| ~70% | `/compact` — compress, keeping the essentials |
| ~85% | Urgent `/compact`, or move heavy tasks to subagents |
| Task switch | `/clear` — start over with empty context |

::: tip Good practice
Compact early, ideally at a transition point, with instructions (`/compact keep the architecture decisions`). `/context` shows what fills the window. See [Costs (official docs)](https://code.claude.com/docs/en/costs).
:::

## .claude/ Structure in 30 Seconds

```
.claude/
├── settings.json     # allow/ask/deny (the firewall)
├── agents/           # Specialized instances (1 file = 1 task)
├── skills/           # Knowledge + workflows (SKILL.md + references/)
├── rules/            # Auto-injected context (< 30 lines: recommended guideline)
└── commands/         # Slash commands (legacy format, merged with skills)
```

Definitions: [agent](/en/reference/glossary#agent) · [skill](/en/reference/glossary#skill) · [rule](/en/reference/glossary#rule) · [hook](/en/reference/glossary#hook) · [MCP](/en/reference/glossary#mcp).

## Effective Prompt Formula

```
WHAT : "In [file], [precise action]"
WHERE: "lines [N-M]" or "[function/class]"
HOW  : constraints, style, framework
VERIFY: "run tests" or "show the diff"
```

**Example**:
```
In src/auth/login.ts, add a JWT refresh token.
Follow the pattern from src/auth/register.ts.
Run tests after implementation.
```

## Available Models

| Model | ID | Strength | Cost |
|-------|----|----------|------|
| Fable 5.1 | `claude-fable-5-1` | Most demanding tasks | $$$$ |
| Opus 5.5 | `claude-opus-5-5` | Complex reasoning, analysis | $$$ |
| Sonnet 5.5 | `claude-sonnet-5-5` | Implementation, planning | $$ |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | Audit, checks (<span class="chez-nous">In our project</span> auditor, health-check) | $ |

Costs as a relative order of magnitude; exact amounts: [pricing](https://www.anthropic.com/pricing).

Aliases usable in `model` (settings, agents, skills): `fable`, `opus`, `sonnet`, `haiku`, and `inherit` (reuse the session's model).

## Anti-patterns to Avoid

| Don't | Do |
|-------|-----|
| Vague prompts ("fix this") | Specify file, line, expected behavior |
| Accept without reading the diff | Always review changes (`/diff`) |
| Let the context fill up unchecked | `/compact` early, `/clear` between tasks |
| Opus for everything | Haiku for simple, Sonnet for implementation |
| One agent that does everything | 1 agent = 1 responsibility |
| Conventions in CLAUDE.md | Conventions in skills |

::: info In our project
The modernization project runs every backend command through Docker (`docker compose exec -T app …`, without `| cat` to keep the exit code) and reserves committing to `/dev:commit`.
`/dev:*` and `/review:*` commands, notation and workflow: [Project commands](/en/examples/project-structure#project-commands).
:::

## Resources

- [Official documentation — commands](https://code.claude.com/docs/en/commands)
- [Official documentation — shortcuts](https://code.claude.com/docs/en/interactive-mode)
- [Agent Skills Standard](https://agentskills.io)
