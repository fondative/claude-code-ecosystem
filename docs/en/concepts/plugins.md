# Plugins

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Distributable packages containing [skills](/en/concepts/skills), [agents](/en/concepts/agents), [hooks](/en/concepts/hooks), [MCP servers](/en/concepts/mcp), [LSP](/en/reference/glossary#lsp) servers (code intelligence), [output styles](/en/reference/glossary#output-style)… |
| **Where** | Installed from a [marketplace](/en/reference/glossary#marketplace) (plugin catalog): `/plugin install <name>@<marketplace>` (in session) or `claude plugin install` (CLI) |
| **[Manifest](/en/reference/glossary#manifeste)** | `.claude-plugin/plugin.json` (optional, only `name` is required; it can declare a `userConfig`, the settings Claude Code asks the user for when the plugin is enabled, such as a URL or a token); everything else at the plugin root |
| **Namespace** | `/plugin-name:skill-name` — coexists with project/user skills of the same name |
| **[Scope](/en/reference/glossary#scope)** | `user` (all your projects), `project` (committed `.claude/settings.json`), `local` (you, this repository) |
| **Sharing** | Folder or `.zip` (no marketplace), private or public marketplace (git repo, URL, local path); `enabledPlugins` + `extraKnownMarketplaces` for a team or organization |
| **Local testing** | `claude --plugin-dir ./my-plugin` (session only, no install) |
| **What this page adds** | When to package a plugin rather than keep a `.claude/`, how to audit a plugin before installing it, and two real approaches of the team: the modernisation project's `.claude/` and the recode plugin |

---

## The essentials in 2 minutes

A plugin is a **directory of components** ([skills](/en/concepts/skills), [agents](/en/concepts/agents), [hooks](/en/concepts/hooks), [MCP servers](/en/concepts/mcp)…) that Claude Code installs and loads **as one unit**. It lets you distribute a coherent set of capabilities across projects and teams, with versioned updates from a marketplace.

```
┌────────────────────────────────────────┐
│                 PLUGIN                 │
│                                        │
│  my-plugin/                            │
│  ├── .claude-plugin/                   │
│  │   └── plugin.json   (manifest)      │
│  ├── skills/                           │
│  │   ├── review-pr/SKILL.md            │
│  │   └── deploy/SKILL.md               │
│  ├── agents/                           │
│  │   └── security-auditor.md           │
│  ├── hooks/                            │
│  │   └── hooks.json                    │
│  └── .mcp.json                         │
│                                        │
│  Namespace: /my-plugin:review-pr       │
│             /my-plugin:deploy          │
│             my-plugin:security-auditor │
└────────────────────────────────────────┘
```

```json
{ "name": "my-plugin", "description": "PR review and deployment", "author": { "name": "Platform Team" } }
```

::: tip Plugin or `.claude/` configuration?
Skills, agents, hooks and MCP servers work perfectly well **without a plugin**. A plugin is worth it when you want to **package** several components to share them (team, several projects, published versions).
:::

Five facts change how you design a plugin:

1. **Everything is prefixed with the plugin name**: `/my-plugin:deploy` cannot conflict with `/deploy`, but the invocation changes. Only hooks have no prefix.
2. **An enabled plugin weighs on every session**: its skills' and agents' descriptions in context, MCP servers running, hooks firing.
3. **It runs code with your privileges, outside the sandbox**, and auto-update can change its files after your audit.
4. **Only `plugin.json` goes in `.claude-plugin/`**; a `CLAUDE.md` at the plugin root is not loaded.
5. **A set `version` pins users** to that version: without a `version` change, new commits don't reach them.

→ How it all works (structure, manifest and `userConfig`, variables, namespace, CLI and in-session commands, loading without installing, plugin hooks and MCP, mods — plugins whose hooks are written in JavaScript and can also draw panes —, distribution and publishing): [official documentation — Plugins](https://code.claude.com/docs/en/plugins) · [Plugins reference](https://code.claude.com/docs/en/plugins-reference).

---

## When to create a plugin?

```
Are the extensions specific to ONE project?
├── YES → .claude/skills/ + .claude/agents/ (no plugin)
│
└── NO → Who do you share them with?
    ├── A few people → folder or .zip handed over directly
    │                  (claude --plugin-dir), no marketplace
    ├── Team / organization → private marketplace (private git repo)
    │       + enabledPlugins in the repo's .claude/settings.json
    │       (managed settings to enforce it across the organization)
    └── Public → public marketplace (or Anthropic's directory)
```

[Managed settings](/en/reference/glossary#managed) are not a distribution channel: they **register and enforce** an existing marketplace. Source: [Share your plugin](https://code.claude.com/docs/en/plugins/create#share-the-plugin).

Two more criteria, taken from the [recode plugin's architecture choices](/recode/#choix-d-architecture) (page in French): a plugin is also the right call when the work **spans several repositories** (a `.claude/` belongs to a single repository) or when code repositories **must keep no trace** of the tooling.

---

## Designing a plugin well

### What an enabled plugin costs

An enabled plugin is part of **every session**, even when you don't use it:

- **Context**: the name and description of each skill, agent and command Claude can invoke are in context on every turn. The full content only loads on use.
- **Processes**: its MCP servers run and its hooks fire at their events.
- **Permissions**: what it runs, it runs with your privileges.

`/plugin` (**Installed** tab) groups plugins **not used recently**; `/skill-doctor` shows each skill's cost. Disable without uninstalling: `claude plugin disable <plugin>`.

### Development cycle

```bash
# 1. Scaffold (in ~/.claude/skills/<name>/, loaded as <name>@skills-dir)
claude plugin init my-plugin --with skills hooks

# 2. Test without installing, for one session (repeatable, folder or .zip)
claude --plugin-dir ./my-plugin

# 3. After a change: /reload-plugins in the session

# 4. Validate (--strict: warnings become errors, useful in CI)
claude plugin validate ./my-plugin --strict

# 5. Measure skill triggering with evals (v2.1.269+)
claude plugin eval ./my-plugin
```

→ Other ways to load without installing (`--plugin-url`, `CLAUDE_CODE_PLUGIN_DIRS`): [official documentation — CLI reference](https://code.claude.com/docs/en/cli-reference).

::: tip Get guided: `plugin-dev`
The `plugin-dev` plugin from the official marketplace adds skills and agents for writing skills, hooks and MCP servers, then validating the plugin: `/plugin install plugin-dev@claude-plugins-official`, then `/plugin-dev:create-plugin <description>`.
:::

### Minimal complete plugin

The smallest useful plugin: a manifest and one skill ([Create your first plugin](https://code.claude.com/docs/en/plugins/create#create-your-first-plugin)).

```bash
mkdir -p hello-plugin/.claude-plugin hello-plugin/skills/hello
```

```json
{
  "name": "hello-plugin",
  "description": "Example plugin: a greeting skill",
  "author": { "name": "Your Name" }
}
```

```markdown
---
name: hello
description: Greets the user and asks how to help
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

The first block goes in `hello-plugin/.claude-plugin/plugin.json`, the second in `hello-plugin/skills/hello/SKILL.md`. Then `claude plugin validate ./hello-plugin` and `claude --plugin-dir ./hello-plugin`; the skill is invoked with `/hello-plugin:hello`. Without `version`, marketplace users will track your commits.

### Convert a `.claude/` setup into a plugin

Existing skills, agents and hooks move into a plugin **without rewriting** ([Convert an existing `.claude/` setup](https://code.claude.com/docs/en/plugins/create#convert-an-existing-claude-setup)):

1. Create `my-plugin/.claude-plugin/plugin.json`.
2. Copy `.claude/skills`, `.claude/agents`, `.claude/commands` to the plugin root (`cp -r .claude/skills my-plugin/`…).
3. Copy the `hooks` object from `.claude/settings.json` into `my-plugin/hooks/hooks.json`, wrapped in `{ "hooks": … }`.
4. Test with `claude --plugin-dir ./my-plugin`: `/deploy` becomes `/my-plugin:deploy`, the `reviewer` agent becomes `my-plugin:reviewer`.
5. Once validated, **delete the originals** from `.claude/` and remove `hooks` from the settings.

::: danger Pitfall: hooks run twice
While the originals stay in `.claude/`, skills and agents coexist without conflict (`my-plugin:` prefix), but **hooks have no prefix**: a hook present both in the settings and in `hooks/hooks.json` runs **twice** on every event.
:::

### Audit a plugin before installing

An installed plugin can run arbitrary code **with your privileges**. A marketplace's name tells you who publishes the catalog, not what each plugin does: audit whatever the source ([Plugin security and trust](https://code.claude.com/docs/en/plugins/security#review-a-plugin-before-you-install)).

| Step | How |
|------|-----|
| Marketplace source | `claude plugin marketplace list` prints where each marketplace comes from |
| Declared components | `/plugin` → plugin details → **Will install** section (commands, agents, skills, hooks, MCP and LSP servers) |
| Code actually run | Read `hooks/hooks.json` (each hook's command), `.mcp.json` (each server's command or URL) and **every file** in `bin/` |
| Local inventory | `claude --plugin-dir <folder> plugin details <name>` on a clone, without starting a session; after installing, `claude plugin details <name>` |

::: warning Outside the sandbox and updated in the background
- A plugin's hooks, monitors (commands the plugin runs in the background during the session, for example to watch a deployment), MCP and LSP servers run **outside the [sandbox](/en/concepts/settings#sandbox)** and outside permission rules, which only cover Claude's tool calls.
- The `bin/` folder is added to the Bash tool's `PATH`.
- When auto-update is on for the marketplace, the files you audited can **change on disk** without any action from you: turn it off per marketplace (`/plugin` → **Marketplaces**) for third-party sources.
:::

### Sharing with the team

So that every contributor to a repository has the same plugins, declare them in the committed `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "team-plugins": {
      "source": { "source": "github", "repo": "org/team-plugins" }
    }
  },
  "enabledPlugins": {
    "security-audit@team-plugins": true
  }
}
```

The marketplace is only registered after each contributor accepts the folder's [trust dialog](/en/reference/glossary#dialogue-de-confiance). After that, it depends on where the plugin lives in the catalog ([Require plugins per repository](https://code.claude.com/docs/en/plugins/org#require-plugins-per-repository)):

- plugin stored **in the marketplace repository** (relative path): it loads automatically;
- plugin pointing to **an external source** (its own GitHub repository, for example): each contributor sees `Plugin "<name>" is enabled in project settings but isn't installed` and must run `claude plugin install <name>@<marketplace> --scope project`.

→ Adding a marketplace, enforcing plugins across an organization (managed settings), publishing: [official documentation — Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces).

### Best practices

| Do | Don't |
|----|-------|
| One plugin = one coherent domain | A catch-all "utils" plugin |
| Descriptive kebab-case name (`security-audit`, `devops`) | Generic (`tools`, `helpers`) or reserved name (`claude-…`, `anthropic-…`) |
| `description` + `author` filled in; `version` bumped on each release **or** omitted | `version` frozen while the code changes; unvalidated manifest |
| README at the plugin root | No documentation |
| Instructions in skills | Instructions in a `CLAUDE.md` (ignored) |
| State in `${CLAUDE_PLUGIN_DATA}` | State in `${CLAUDE_PLUGIN_ROOT}` (wiped on update) |
| Fast hooks, lower `timeout` for a hook that may block (default 600 s for a `command` hook, [hooks](https://code.claude.com/docs/en/hooks)) | Slow or blocking hook left at the default timeout |

### In the team

::: info In our project
Two approaches coexist in the team. The modernisation project (this repository) **is not a plugin**: its configuration lives in `.claude/`. The [recode plugin](/recode/) (pages in French), documented in this wiki, packages another piece of the team's tooling. The facts below come from the project's `.claude/` and CLAUDE.md on one side, and from the [recode plugin](/recode/) pages on the other.

| Aspect | Modernisation project (`.claude/`) | recode plugin |
|--------|------------------------------------|---------------|
| Form | `.claude/` committed in the project repository | Claude Code plugin, "a single package, installed and updated in one place" |
| Content | 11 agents, 12 skills, 8 commands, 7 rules | 9 skills across 4 workflows (Development, Migration, Delivery, Documentation) |
| Reach | One repository (legacy, target backend and frontend as subfolders) | A workspace spanning several repositories (source, targets) |
| Paths | PATHS section of CLAUDE.md (+ real paths in `settings.json`) | Declared by each skill; per-workspace configuration, stored outside the repositories, suggested on first use then confirmed once |
| Chaining | `/mod-migrate-feature` launcher skill: specs → planning → implementation → conformity | Each skill invoked explicitly, one by one; human validation at every step |
| Invocation | `/mod-migrate-feature <name>`, `/dev:commit` | `/recode:explore-need`, `/recode:analyze-app`… |
| Traces in code repositories | `.claude/` and CLAUDE.md in the repository | None |

What to read in it: `.claude/` suits tooling **specific to one project**; recode was designed as a plugin because it serves **several projects and several repositories at once**.
:::

### Pitfalls to know

- **`hooks/hooks.json` must wrap the events in a `"hooks"` key**, otherwise the file doesn't load.
- **`${CLAUDE_PLUGIN_ROOT}` changes on every update**: state goes in `${CLAUDE_PLUGIN_DATA}`, itself deleted on uninstall (unless `--keep-data`). In shell form, quote `"${CLAUDE_PLUGIN_ROOT}"`.
- **A `strictKnownMarketplaces` allowlist blocks plugins placed in `skills/`** (those created by `claude plugin init`), unless it contains `{ "source": "skills-dir" }`.
- **A project's `extraKnownMarketplaces` waits for the folder's trust dialog** (see [Sharing with the team](#sharing-with-the-team)).

Details and sources: [official documentation — Plugins reference](https://code.claude.com/docs/en/plugins-reference).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001` : Copying the same `.claude/` into every project {#warn-001 .warn-title}
*Origin: the team's design choice, motivation of the recode plugin ("instead of copies of `.claude/` that drift apart from one project to the next", [Architecture choices](/recode/#choix-d-architecture), in French).*

Tooling meant for several projects, copied into each one's `.claude/`, evolves differently in every copy.

::: danger Problem
```text
project-a/.claude/skills/analyze-app/   ← fixed in this project
project-b/.claude/skills/analyze-app/   ← original copy
project-c/.claude/skills/analyze-app/   ← modified locally
→ three diverging versions, a trace in each repository's history,
  and a tool that can't span several repositories at once
```
:::

::: info Solution
```text
recode/  (plugin, installed once)
→ /recode:analyze-app identical for every project
→ updated in one place
→ per-workspace configuration, stored outside the repositories
```
Keep `.claude/` for what is specific to the project (conventions, rules, permissions); package as a plugin what several projects share.
:::

---

#### `WARN-002` : Components stored in `.claude-plugin/` or in the wrong place {#warn-002 .warn-title}
*Origin: official documentation; experienced on this wiki (mistake found in this page: a plugin's MCP servers placed in `mcp/mcp.json`).*

Claude Code only looks for components at their standard location: a misplaced folder is not loaded.

::: danger Problem
```text
my-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   └── skills/          ← ❌ ignored: only plugin.json goes here
├── mcp/
│   └── mcp.json         ← ❌ ignored: MCP servers go in .mcp.json at the root
└── CLAUDE.md            ← ❌ never loaded into context
```
:::

::: info Solution
```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json      ← the ONLY file in this folder
├── skills/<name>/SKILL.md
├── agents/
├── hooks/hooks.json     ← wrapped in { "hooks": … }
└── .mcp.json            ← at the root
```
Instructions go through a skill. `claude plugin validate` flags a `CLAUDE.md` at the root; then test with `claude --plugin-dir` that every component shows up (`/plugin`, **Errors** tab if something is wrong).
:::

---

## Ready-to-use examples

### Reference plugins

Rather than starting from scratch, read or install plugins maintained by Anthropic (repository [`anthropics/claude-code/plugins`](https://github.com/anthropics/claude-code/tree/main/plugins) and the `claude-plugins-official` marketplace):

| Plugin | Why |
|--------|-----|
| `feature-dev` | 7-phase feature development, `code-explorer`, `code-architect`, `code-reviewer` agents |
| `code-review` | PR review by several specialized agents, with confidence scoring to filter false positives |
| `commit-commands` | Git commands (`commit`, `commit-push-pr`…) with context injection and minimal `allowed-tools` |
| `hookify` | Create hooks that prevent unwanted behaviors, from the conversation or from instructions |
| `security-guidance` | `PreToolUse` hook that warns about potential flaws (command injection, XSS, `eval`…) while editing |
| `plugin-dev`, `skill-creator` | Write and validate plugins and skills |
| `php-lsp`, `typescript-lsp` | **Code intelligence** (LSP): diagnostics after each edit and symbol navigation. Required binary: `intelephense` (PHP), `typescript-language-server` (TS) — [Code intelligence](https://code.claude.com/docs/en/plugins/code-intelligence) |

```bash
# E.g. for this project's React/TS frontend
npm install -g typescript-language-server typescript
# then, in a session:
/plugin install typescript-lsp@claude-plugins-official
```

### Example 1: Security plugin

```
security-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── security-audit/
│       ├── SKILL.md
│       └── references/
│           └── owasp-top-10.md
├── agents/
│   └── vulnerability-scanner.md
├── hooks/
│   └── hooks.json          # PreToolUse: secret detection
└── scripts/
    └── detect-secrets.sh
```

### Example 2: DevOps plugin

```
devops-plugin/
├── .claude-plugin/
│   └── plugin.json         # userConfig: monitoring URL and token
├── skills/
│   ├── deploy/
│   │   └── SKILL.md
│   └── rollback/
│       └── SKILL.md
├── agents/
│   └── infra-reviewer.md
└── .mcp.json               # MCP server for monitoring
```

---

## Before going live

### Structure

- [ ] `.claude-plugin/` holds only the manifest, everything else at the root
- [ ] Each skill in `skills/<name>/SKILL.md`
- [ ] Each agent in `agents/<name>.md`
- [ ] Hooks in `hooks/hooks.json`, wrapped in `"hooks": { … }`
- [ ] MCP in `.mcp.json` at the root
- [ ] No instructions in a `CLAUDE.md` (not loaded)

### Quality

- [ ] Each `description` says what to do and when
- [ ] `"${CLAUDE_PLUGIN_ROOT}"` (quoted) for plugin paths, `${CLAUDE_PLUGIN_DATA}` for state
- [ ] Secrets declared in `userConfig` with `sensitive: true`
- [ ] Fast hooks, `timeout` adjusted for those that may block
- [ ] README at the root

### Distribution

- [ ] Plugin reserved for tooling shared by several projects; what is specific to the project stays in `.claude/`
- [ ] Tested locally with `claude --plugin-dir ./my-plugin`
- [ ] `claude plugin validate --strict` in CI; set `version` or accept the warning its absence triggers
- [ ] `version` bumped on each release, or omitted (tracks commits)
- [ ] Hooks removed from `.claude/settings.json` after conversion ([why](#convert-a-claude-setup-into-a-plugin))
- [ ] Clear, descriptive, non-reserved name
- [ ] Sharing through the repository: `extraKnownMarketplaces` applies after the trust dialog; a plugin with an external source must be installed by each contributor ([details](#sharing-with-the-team))

### Installing a third-party plugin

- [ ] **Will install** section read, then `hooks/hooks.json`, `.mcp.json` and `bin/`
- [ ] Auto-update turned off for unaudited third-party marketplaces

---

## Going further

- [recode plugin](/recode/) — the team's plugin: principles, workflows and architecture choices (in French)
- [Skills](/en/concepts/skills) — the main component of a plugin
- [Hooks](/en/concepts/hooks) and [MCP](/en/concepts/mcp) — to audit before installing a third-party plugin
- [Official documentation — Plugins](https://code.claude.com/docs/en/plugins) · [Manifest (plugins reference)](https://code.claude.com/docs/en/plugins-reference) · [`claude plugin` commands](https://code.claude.com/docs/en/plugins/cli-reference)
- [Manage plugins for your organization](https://code.claude.com/docs/en/plugins/org) · [Create a plugin](https://code.claude.com/docs/en/plugins/create) · [Plugin security](https://code.claude.com/docs/en/plugins/security)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 9, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
