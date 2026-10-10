# .claude/ Folder Architecture

::: tip What you will find on this page
Where Claude Code looks for its configuration, in **any project**: the files and folders it recognises, what they contain, what is versioned or not, and how to check what Claude has loaded. If building blocks (rules, skills, agents…) are still new to you, read [Philosophy & Vision](/en/introduction/) first.
:::

::: info This page is generic
For the complete example of a real project (11 agents, 12 skills, 7 rules), see [.claude/ Project Structure](/en/examples/project-structure) in the User Manual.
:::

## Two locations: the project and your personal folder

Claude Code reads its configuration from two main places. The folders have the **same layout**; only the scope changes.

| Location | Scope | Versioned? | Typical use |
|----------|-------|------------|-------------|
| `.claude/` at the repository root | The whole team, in this project | Yes (except `*.local.*` files) | Project conventions, business agents and skills, shared permissions |
| `~/.claude/` in your home folder | You, in all your projects | No | Personal preferences, skills and agents you reuse everywhere |

An organisation can also enforce a *managed* configuration, deployed by the administrator. When the same thing is defined in several places, the priority rule depends on the building block: see [Philosophy & Vision](/en/introduction/#where-configuration-lives-and-which-one-wins).

## Typical project layout

```
<repository root>/
├── CLAUDE.md                  # Permanent project instructions (versioned)
├── CLAUDE.local.md            # Your personal instructions for this project (not versioned)
├── .mcp.json                  # Shared MCP servers (optional, versioned)
└── .claude/
    ├── settings.json          # Shared permissions and settings (versioned)
    ├── settings.local.json    # Your personal settings for this project (not versioned)
    ├── rules/                 # Targeted instructions, one .md file per topic
    │   └── testing.md
    ├── skills/                # One folder per skill
    │   └── deploy/
    │       ├── SKILL.md       #   main file (frontmatter + instructions)
    │       └── references/    #   supporting documents, read on demand
    ├── agents/                # One .md file per subagent
    │   └── code-reviewer.md
    ├── commands/              # Former format of skills (still read)
    │   └── deploy.md
    ├── output-styles/         # Custom response styles (optional)
    └── agent-memory/          # Memory of subagents with memory: project (optional)
```

None of these is mandatory: Claude Code works with no configuration. You add a building block when you need it. The `/init` command generates a first `CLAUDE.md` from the project's code.

## What each item is for

| Item | Content | Loaded… | Page |
|------|---------|---------|------|
| `CLAUDE.md` | Stack, useful commands, conventions, key paths | At the start of every session | [CLAUDE.md](/en/concepts/claude-md) |
| `CLAUDE.local.md` | Your preferences for this project (test URLs, shortcuts…) | At the start of every session, after `CLAUDE.md` | [CLAUDE.md](/en/concepts/claude-md) |
| `settings.json` / `settings.local.json` | `allow` / `ask` / `deny` permissions, model, hooks, environment variables | At all times | [Settings](/en/concepts/settings) |
| `rules/*.md` | Short instruction on one topic; the `paths` field limits it to some files | Without `paths`: at startup. With `paths`: when Claude touches a matching file | [Rules](/en/concepts/rules) |
| `skills/<name>/SKILL.md` | Procedure or know-how, with its supporting files | Only the name and description load at startup; the content loads on invocation (by you with `/name`, or by Claude) | [Skills](/en/concepts/skills) |
| `agents/<name>.md` | Specialised subagent: description, tools, model, instructions | When Claude or a skill delegates a task to it | [Agents](/en/concepts/agents) |
| `commands/<name>.md` | Former format of a skill triggered by `/name` | Like a skill | [Commands](/en/concepts/commands) |
| `.mcp.json` | The project's MCP servers (Claude asks for your approval on first use) | At startup | [MCP](/en/concepts/mcp) |

::: warning `commands/`: former format
Files in `commands/` still work, but new ones are written as **skills**, which offer more options. A subfolder becomes a prefix separated by `:`: `commands/dev/commit.md` is invoked with `/dev:commit`. → [Migrate commands → skills](/en/examples/project-structure#project-commands)
:::

**Hooks** have no dedicated folder: they are declared in the `hooks` section of `settings.json` (the scripts they call can live anywhere, for example `.claude/hooks/`). **Plugins** are installed with `/plugin` and bring their own skills, agents, hooks and MCP servers. → [Hooks](/en/concepts/hooks) · [Plugins](/en/concepts/plugins)

## How the building blocks fit together

```
Session start
  ├── CLAUDE.md, CLAUDE.local.md, rules without "paths"  → loaded into context
  ├── names and descriptions of skills and agents       → loaded (content waits)
  └── settings.json                                     → applied to every action

During the work
  ├── Claude touches src/api/user.ts  → rules whose "paths" match are added
  ├── you type /deploy                → the deploy skill's content is loaded
  ├── Claude delegates a review       → the code-reviewer subagent starts
  │                                      in its own context, with the skills
  │                                      listed in its "skills:" field
  └── every action (read, edit, command)
                                      → checked by permissions and hooks
```

## Recommended naming conventions

| Item | Convention | Example |
|------|-----------|---------|
| Agents | kebab-case (lowercase and hyphens), a name that describes the role | `code-reviewer.md` |
| Skills (folder) | kebab-case; a domain prefix helps when there are many | `deploy/`, `api-conventions/` |
| Rules | kebab-case, one topic per file | `testing.md` |
| Skill references | kebab-case, in `references/` | `create-entity.md` |

Avoid naming a skill after a built-in command (`/code-review`, `/init`…): yours would replace it.

## Check what Claude has loaded

| Question | Command |
|----------|---------|
| Which CLAUDE.md, rules and memory files are in context? | `/context` (*Memory files* section), `/memory` |
| Which skills are available? | `/skills`, or type `/` to see the menu |
| Which subagents are running? | `/tasks` |
| Which permissions apply? | `/permissions` |
| Which MCP servers are connected? | `/mcp` |
| Is something wrong with the configuration? | `/doctor` |

## Resources

- [.claude/ Project Structure](/en/examples/project-structure) — the complete example of the modernisation project
- [Philosophy & Vision](/en/introduction/) — building blocks and their priority rules
- [Official documentation — Memory and CLAUDE.md](https://code.claude.com/docs/en/memory)
- [Official documentation — Settings](https://code.claude.com/docs/en/settings)
- [Official documentation — Skills](https://code.claude.com/docs/en/skills)
- [Official documentation — Subagents](https://code.claude.com/docs/en/sub-agents)
