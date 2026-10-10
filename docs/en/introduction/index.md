# Philosophy & Vision

::: tip What you will find on this page
In 5 minutes: what Claude Code is, how it works, the building blocks that adapt it to a project, and where to start depending on your role. No prerequisites.
:::

## Claude Code in one sentence

**Claude Code is a development assistant that works directly inside your project**: it reads your files, edits them, runs commands (tests, build, git…) and chains these actions until it reaches the goal you gave it. You can use it in the terminal, in VS Code / JetBrains, in the desktop app or on the web (see [Platforms](https://code.claude.com/docs/en/platforms)).

This wiki explains how to **configure and equip it** for a real project, with one running example: modernising a legacy application (see [AI-Driven Methodology](/en/guide/methodology)).

## How it works: the agentic loop

Claude Code does not follow a pre-written script. For every request, it repeats the same loop:

```
1. Read the request and the project context
2. Pick the useful action (read a file, search, edit, run a command…)
3. Run the action — if it is allowed
4. Analyse the result
5. Go back to step 2, or answer once the goal is reached
```

That is what **"less scaffolding, more model"** means: instead of coding every step of a process in advance, you let the model decide how to chain the actions.

::: warning The model decides "how", you decide "what is allowed"
"Letting the model decide" does not mean "letting it do anything". Every action goes through your **permissions** (what is allowed, denied or needs confirmation) and then through the active **permission mode**: depending on the mode, Claude Code asks for your approval, or has the action checked by a safety classifier that blocks risky actions (`auto` mode). Whatever your permissions deny stays denied in every case.
→ [Which permission mode at which step](/en/concepts/which-mechanism#which-permission-mode-at-which-step) · [Settings](/en/concepts/settings)
:::

### Built-in tools

To act, Claude uses **tools** that ship with Claude Code and need no configuration. The main ones:

| Need | Tools |
|------|-------|
| Read and search | `Read`, `Grep`, `Glob` |
| Edit | `Edit`, `Write` |
| Run | `Bash` |
| Use the web | `WebFetch`, `WebSearch` |
| Delegate and organise | `Agent` (start a subagent), `Skill` (load a skill), task list |

The full list changes between versions: see the [official tools reference](https://code.claude.com/docs/en/tools-reference).

## The customisation building blocks

Claude Code already works with no configuration. The building blocks below **adapt it to your project**. They fall into three families — this is the most important distinction to remember:

| Family | Effect | Building blocks |
|--------|--------|-----------------|
| **Context** | *Informs* Claude. It takes it into account, but nothing **forces** it to. | CLAUDE.md, Rules, Skills |
| **Control** | *Constrains* Claude. Enforced by Claude Code, whatever the model decides. | Settings (permissions), Hooks |
| **Extension** | *Adds* capabilities. | Agents, MCP, Plugins |

::: danger An instruction is not a protection
Writing "never modify `php-legacy/`" in a CLAUDE.md or a rule is an **instruction**: Claude follows it almost always, but it is not guaranteed. To actually **forbid** something, use a `deny` rule in the settings or a hook. → [Instruction or block?](/en/concepts/which-mechanism#instruction-or-block)
:::

### Building blocks in detail

| Building block | What it is for | When it acts | File(s) |
|----------------|----------------|--------------|---------|
| [CLAUDE.md](/en/concepts/claude-md) | Permanent project instructions (stack, commands, conventions) | Loaded at the start of every session | `CLAUDE.md`, `CLAUDE.local.md` |
| [Rules](/en/concepts/rules) | Instructions targeted at some files | When Claude touches a file matching the `paths` pattern (or always, without `paths`) | `.claude/rules/*.md` |
| [Skills](/en/concepts/skills) | Reusable know-how and procedures | When Claude finds the skill relevant, or when you type `/skill-name` | `.claude/skills/<name>/SKILL.md` |
| [Commands](/en/concepts/commands) | Former format of skills triggered by `/name` — still read, but new ones are written as skills | When you type `/name` | `.claude/commands/*.md` |
| [Settings](/en/concepts/settings) | Permissions (allow / ask / deny), model, options | At all times | `.claude/settings.json` |
| [Hooks](/en/concepts/hooks) | Scripts run automatically at specific moments (before a tool, after an edit…); they can block an action | On every configured event | `hooks` section of the settings |
| [Agents](/en/concepts/agents) | Specialised subagents, each with its own context, tools and model | When Claude (or a skill) delegates a task to them | `.claude/agents/*.md` |
| [MCP](/en/concepts/mcp) | Connection to external services (GitHub, databases, internal tools…) | When Claude calls one of the server's tools | `.mcp.json` |
| [Plugins](/en/concepts/plugins) | Installable package bundling skills, agents, hooks and MCP servers to share them across projects | Once installed and enabled | Installed with `/plugin` |

To choose between two building blocks: [The essentials: which building block for which need?](/en/concepts/which-mechanism). To see where these files go: [.claude/ Architecture](/en/introduction/architecture) (typical layout) and [.claude/ Project Structure](/en/examples/project-structure) (real example).

## Where configuration lives and which one wins

Each building block can exist at several **levels**:

| Level | Location | Scope |
|-------|----------|-------|
| Organisation (*managed*) | Deployed by the administrator | Every user in the organisation |
| Personal | `~/.claude/` | You, in all your projects |
| Project | The repository's `.claude/` (versioned) | The whole team, in this project |
| Local | `.claude/settings.local.json`, `CLAUDE.local.md` (not versioned) | You, in this project |
| Plugin | Installed plugin | Wherever the plugin is enabled |

::: warning There is no single priority order
What happens when the same thing is defined at several levels **depends on the building block**:

| Building block | Rule |
|----------------|------|
| **Settings** | For a given key, the priority order is: organisation > command line (`--settings`) > local > project > personal. Permission rules from all levels add up, and a `deny` always wins over an `allow`. |
| **CLAUDE.md and Rules** | Nothing is replaced: **every file is loaded and they add up**. |
| **Skills with the same name** | Organisation > personal > project. |
| **Plugins** | No conflict: their skills are prefixed with the plugin name (`/my-plugin:review`). |

Details are on each building block's page.
:::

## The principles of this wiki

These principles drive how the modernisation project is configured. They are **choices made by this project**, not Claude Code requirements:

1. **A single source of truth** — every piece of information (a path, a convention) is written in one place only. Example: project paths are defined only in the root `CLAUDE.md`; agents and skills read them from there.
2. **Conventions live in skills** — backend and frontend coding rules are in skills (`sym-api-conventions`, `front-app-conventions`…) loaded by the agents, rather than in a separate documentation folder.
3. **The right context at the right time** — rules only load when Claude touches the files they cover, so they do not clutter its context.
4. **One agent = one responsibility** — each subagent does one thing (analyse, plan, implement, check) in its own context.
5. **A human validates every step** — Claude produces, the architect reviews and decides; any deviation from the specification is recorded in a conformity report.
6. **Forbid through configuration, not instructions** — anything that must be impossible (editing the legacy code, reading secrets) is blocked in the settings.

## Where to start?

| You are… | Start with |
|----------|------------|
| New to Claude Code | [Getting Started](/en/guide/getting-started), then [The essentials: which building block for which need?](/en/concepts/which-mechanism), [CLAUDE.md](/en/concepts/claude-md) and [Permission modes](https://code.claude.com/docs/en/permission-modes) |
| A developer configuring a project | [The essentials: which building block for which need?](/en/concepts/which-mechanism), [.claude/ Architecture](/en/introduction/architecture), [Best Practices](/en/guide/best-practices), [Skills](/en/concepts/skills), [Agents](/en/concepts/agents) |
| A security lead or tech lead | [Settings](/en/concepts/settings), [Hooks](/en/concepts/hooks), [Pitfall catalog](/en/guide/warns) |
| A modernisation project manager | [AI-Driven Methodology](/en/guide/methodology), then the [User Manual](/en/examples/) |

Unsure about a term? The [Glossary](/en/reference/glossary) defines them all. Commands and shortcuts are in the [Cheatsheet](/en/reference/cheatsheet).

## Resources

- [Official Claude Code documentation](https://code.claude.com/docs/en/overview)
- [Agent Skills open standard](https://agentskills.io)
