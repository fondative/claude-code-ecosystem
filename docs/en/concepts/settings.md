# Settings

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Configuration for permissions, [sandbox](/en/reference/glossary#sandbox), model, hooks and Claude Code behavior |
| **Where** | 5 levels: [managed](/en/reference/glossary#managed) (set by the organization, not changeable by the user) > CLI (`--settings`) > local > project > user |
| **Permissions** | [`allow` (auto), `deny` (blocked), `ask` (confirmation)](/en/reference/glossary#regles-de-permission) — deny takes priority |
| **Files** | Only `Read(…)` and `Edit(…)` rules are checked — `Edit` covers every write tool |
| **Modes** | 6 [permission modes](/en/reference/glossary#modes-de-permission) (`default`/Manual, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`) — cycle with `Shift+Tab` |
| **Sandbox** | Filesystem + network isolation (macOS, Linux, WSL2) |
| **Verification** | `/status` for active settings, `/permissions` for rules and their source file |
| **What this page adds** | What to put in `allow` / `ask` / `deny`, the project's actual `settings.json`, and the rules that look protective while protecting nothing |

---

## The essentials in 2 minutes

`settings.json` is Claude Code's **configuration**, enforced by the program itself rather than by the model: permissions, sandbox, model, [hooks](/en/concepts/hooks), environment variables. This is where, rather than in CLAUDE.md, you decide what Claude **can** do. The `.claude/settings.json` file is versioned and applies to the whole team.

```
┌───────────────────────────────────────────────────────────┐
│                        PERMISSIONS                        │
│                                                           │
│  Claude wants: Edit("php-legacy/file.php")                │
│    1. deny?   deny: Edit(/php-legacy/**)                  │
│       → BLOCKED (ask and allow are not checked)           │
│                                                           │
│  Claude wants: Bash("git push origin main")               │
│    1. deny?   no rule                                     │
│    2. ask?    ask: Bash(git push *)                       │
│       → CONFIRMATION REQUIRED                             │
│                                                           │
│  Claude wants: Bash("docker compose exec -T app php -v")  │
│    1. deny?   no rule                                     │
│    2. ask?    no rule                                     │
│    3. allow?  allow: Bash(docker compose exec -T app *)   │
│       → ALLOWED without confirmation                      │
│                                                           │
│  No rule matches → the permission mode decides            │
└───────────────────────────────────────────────────────────┘
```

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(npm run test *)", "Bash(npm run lint *)"],
    "ask": ["Bash(git push *)", "Edit(config/**)"],
    "deny": ["Edit(/php-legacy/**)", "Read(.env*)", "Bash(rm -rf *)"]
  }
}
```

Five facts change how you write your settings:

1. **`deny` always wins**: a `PreToolUse` hook runs first, then `deny` → `ask` → `allow` → the current mode. A `deny` still applies even in `bypassPermissions`.
2. **For files, only `Read(…)` and `Edit(…)` count.** A `Write(…)` rule is accepted but never consulted; `Edit(…)` covers every write tool.
3. **Reads inside the project are already free.** A bare `"Read"` in `allow` adds nothing inside the project, but allows reading everywhere else (`~/.ssh`, `~/.aws`).
4. **A `Bash(…)` rule matches text**, not a program: `Bash(rm -rf *)` doesn't stop `/bin/rm -rf`. For a guarantee: a hook or the sandbox.
5. **A project settings file's `allow` rules only apply after the folder's [trust dialog](/en/reference/glossary#dialogue-de-confiance)**, which lists them (as well as `additionalDirectories`); `deny` and `ask` rules always apply ([source](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust)). Read that dialog on a cloned repository.

→ How it all works (levels and merging, resolution, file and Bash rules, patterns, modes, sandbox, variables, managed): [official documentation — Permissions](https://code.claude.com/docs/en/permissions) · [Settings](https://code.claude.com/docs/en/settings) · [Sandboxing](https://code.claude.com/docs/en/sandboxing).

---

## Configuring your settings well

### What to put in allow vs ask vs deny

```
Read in the project or read-only command (ls, cd, git status)?
├── YES → nothing to do (already no confirmation)
└── NO
    ALWAYS safe and frequent action?
    ├── YES → allow, as close to the command as possible (npm run test *)
    └── NO
        NEVER allowed action?
        ├── YES → deny (read/write .env) + hook/sandbox (rm -rf, force push)
        └── NO → ask (git push, deploy, edit config)
```

| Pattern | Where | Why |
|---------|-------|-----|
| Reads, `ls`, `cd`, `git status/diff/log` | — | Already no confirmation (built-in read-only) |
| `Bash(npm run test *)` | allow | Precise; `Bash(npm *)` would cover `npm publish` |
| `Bash(docker compose exec -T app *)` | allow | <span class="chez-nous">In our project</span> everything runs in the container, with targeted rules (`Bash(docker compose exec -T app php bin/phpunit *)`…). Beware, this broad pattern runs any inner command |
| `Bash(git push *)` | ask | Review before pushing |
| `Edit(/php-legacy/**)` | deny | Protect the source code (all writes) |
| `Bash(rm -rf *)` | deny | Destructive (bypassable via `sh -c`: pair with the sandbox) |
| `Read(.env*)` + `Edit(.env*)` | deny | Secret files (read and write), at any depth; `./.env*` would only cover the current directory |

::: tip Protect your secrets in **user** settings
In `~/.claude/settings.json`, valid for every project (practice taken from [Trail of Bits](https://github.com/trailofbits/claude-code-config)):

```json
{
  "permissions": {
    "deny": ["Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(~/.config/gh/**)"]
  }
}
```

These `deny` rules have the limits of any `Read(…)` `deny` (see [Gotchas](#gotchas)).
:::

::: tip Prune the "don't ask again" rules
For a Bash command or a WebFetch domain, "Yes, and don't ask again" saves a rule to `.claude/settings.local.json` (at the git repository root); for a file modification, the approval only lasts until the session ends and isn't saved ([source](https://code.claude.com/docs/en/permissions#permission-system)). Review these rules regularly with `/permissions` and remove those that are too broad or outdated.
:::

### The project's actual configuration

<span class="chez-nous">In our project</span> The modernization project's `.claude/settings.json` (full file in [example 1](#example-1-modernization-project)):

| Block | Rules | What it means |
|-------|-------|---------------|
| `allow` (43) | 24 targeted `Bash(docker compose exec -T app php …)` rules (`bin/phpunit`, 21 allowlisted `bin/console` subcommands, `vendor/bin/phpcs`, `vendor/bin/phpcbf`), `docker compose ps *`, `docker compose up -d *`, `git add *`, `mkdir *`, `jq empty *`, 12 targeted `npm` commands (`npm ci`, `npm test`, `npm run lint`/`typecheck`/`format`/`format:check`/`test`/`test:unit`/`test:integration`/`test:coverage`/`build`/`docs:build`), `Edit(/output/**)`, `Edit(/legacy-wiki/**)` | Tests, lint and build in the container or on the host, and output folders, without confirmation; any other command asks for confirmation |
| `ask` (8) | `Bash(git commit *)`, `Bash(git push *)`, 6 destructive commands (`doctrine:database:drop`, `doctrine:schema:drop`, `doctrine:schema:update`, `doctrine:fixtures:load`, `doctrine:query:sql`, `dbal:run-sql`) | Every commit, every push and every destructive database operation goes through the user |
| `deny` (4) | `Edit(/php-legacy/**)`, `Edit(.env*)`, `Read(.env*)`, `Bash(rm -rf *)` | Legacy is read-only, secrets are neither read nor written |
| Other | `hooks`: one `PreToolUse` on `Bash` (`.claude/hooks/block-rm.sh`, tested by `block-rm.test.sh`); `env`: `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1`; `includeGitInstructions: false` | The hook refuses recursive deletions (`rm -r` in all its forms, `git rm -r` without `--cached`, `find -delete`) |
| Absent | No `sandbox`, no `defaultMode`, no MCP server | `settings.local.json` exists but stays personal (ignored by git) |

What to take from it: `settings.json` holds the **actual paths**, not the CLAUDE.md PATHS aliases; renaming `php-legacy` must therefore also be carried over here (CLAUDE.md says so). `Edit(/output/**)` and `Edit(/legacy-wiki/**)` have a leading `/`: they start from the **project root**, not the current directory. `Bash(rm -rf *)` only blocks that exact form: the other forms are covered by the `block-rm.sh` hook.

::: info In our project: avoiding a dead rule
A rule like `Edit(*-wiki/**)` would match **no folder** in the project (this site's wiki is named `wiki-claude-code/`, which doesn't end in `-wiki`) and would allow nothing. The project's rule targets the actual path of `WIKI_TARGET` (PATHS table): `Edit(/legacy-wiki/**)`.
:::

### Sandbox with a project that runs everything through Docker? {#sandbox}

The sandbox only applies to shell commands (Bash, PowerShell, Monitor and their child processes). The official documentation is explicit: "`docker` is incompatible with the sandbox"; Docker commands must be taken out with `sandbox.excludedCommands`, and an excluded command runs **with your full access** ([sandboxing](https://code.claude.com/docs/en/sandboxing#run-commands-outside-the-sandbox-with-excludedcommands)). Allowing the `/var/run/docker.sock` socket amounts to granting access to the host.

**The question to ask:** *which commands, apart from Docker, does Claude run on the host?*
- Almost none → the sandbox adds little; rely on `deny`/`ask` and on reviewing diffs.
- Package installs, scripts, network calls → the sandbox is worth it, with a **narrow** `excludedCommands`.

::: info In our project
All backend commands go through `cd <BACKEND_TARGET> && docker compose exec -T app … 2>&1`: they would leave the sandbox. It would mostly protect the `npm` commands (frontend, on the host) and read commands (`find`, `ls`, `git`). The project has **not** enabled it. If the team enables it: exclude `docker compose exec -T app *` rather than `docker compose *` ([WARN-008](#warn-008)).
:::

### Gotchas

- **Five levels, two merge rules**: managed > `--settings` > local > project > user; arrays (`allow`, `deny`…) are concatenated, scalar values (`model`, `defaultMode`) come from the highest level.
- **`/` doesn't mean the same thing everywhere**: in `Read(…)`/`Edit(…)`, `/path` starts at the project root (or `~/.claude` in user settings), `//path` is absolute, no prefix means the current directory. In the sandbox, `/path` is absolute.
- **Put the `*` after a space**: `Bash(ls*)` also matches `lsof`, and `Bash(npm *)` covers `npm publish`.
- **`MCP(github)` is not valid syntax**: write `mcp__github__*` or `mcp__github__<tool>`.
- **`bypassPermissions`** keeps explicit `deny` and `ask` rules, but offers no protection against [prompt injection](/en/reference/glossary#injection-de-prompt) (malicious instructions hidden in a file or page Claude reads): isolated containers or VMs only.
- **A `Read(…)` `deny` doesn't stop everything**: it blocks file tools, Bash commands that name the path (`cat ~/.ssh/id_rsa`) and redirections, but not a `grep -r` run over the folder nor a script that opens the file itself. Only the sandbox closes that gap: once enabled, it adds the denied `Read` paths to what no sandboxed command can read.
- **For the network, prefer `WebFetch(domain:…)` over `Bash(curl …)`**: a `Bash(curl *)` rule sees neither `/usr/bin/curl` nor `sh -c 'curl …'`.

Details and sources: [official documentation — Permissions](https://code.claude.com/docs/en/permissions).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001`: Overly broad permissions {#warn-001 .warn-title}
*Origin: official documentation (rules as close to the command as possible).*

Allowing `Bash(*)` effectively disables all protection on shell commands.

::: danger Problem
```jsonc
// ❌ — Disables all security
{ "permissions": { "allow": ["Bash(*)"] } }
```
Claude can execute any command without restriction or confirmation.
:::

::: info Solution
```jsonc
// ✅ — Specific commands
{ "permissions": { "allow": ["Bash(npm test *)", "Bash(docker compose exec -T app *)"] } }
```
Only allow the commands needed for the project's workflow. (In `auto` mode, Claude Code also drops overly broad allow rules such as `Bash(*)` while the mode is active.)
:::

---

#### `WARN-002`: Missing write deny {#warn-002 .warn-title}
*Origin: project rule (the legacy code is read-only); experienced on this project: the legacy code was first protected by a rule alone, without `settings.json`.*

Without an explicit `deny` rule, Claude can write to sensitive directories. See also [`CLAUDE.md` WARN-005](/en/concepts/claude-md#warn-005) on the difference between context and permissions.

::: danger Problem
```jsonc
// ❌ — The legacy code is not protected
{ "permissions": { "allow": ["Read", "Edit"] } }
```
Unrestricted `Edit` allows writing everywhere (Edit, Write, NotebookEdit), including in read-only source code.
:::

::: info Solution
```jsonc
// ✅ — Explicit protection
{ "permissions": { "deny": ["Edit(/php-legacy/**)"] } }
```
Explicitly define write-protected directories via `deny` on `Edit(…)`. A `Write(/php-legacy/**)` rule would be ignored.
:::

---

#### `WARN-003`: Glob `*` vs `**` {#warn-003 .warn-title}
*Origin: general good practice (gitignore syntax of file rules).*

A single `*` [glob](/en/reference/glossary#glob) only protects the first directory level, leaving subdirectories exposed.

::: danger Problem
```jsonc
// ❌ — First level only
{ "permissions": { "deny": ["Edit(/php-legacy/*)"] } }
```
Files in `php-legacy/src/Controller/` are not covered by this pattern.
:::

::: info Solution
```jsonc
// ✅ — Recursive
{ "permissions": { "deny": ["Edit(/php-legacy/**)"] } }
```
Use `**` for recursive protection across all subdirectory levels.
:::

---

#### `WARN-004`: MCP without permissions {#warn-004 .warn-title}
*Origin: official documentation; this project declares no MCP server.*

An [MCP](/en/concepts/mcp) server declared without `allow`/`deny` rules exposes all its tools to the default permission flow, with no granularity.

::: danger Problem
```jsonc
// ❌ — .mcp.json: server declared, no rule in settings.json
{ "mcpServers": { "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/" } } }
```
Servers are declared in `.mcp.json` (project) or `~/.claude.json` (user), not in `settings.json`. Without rules, decisions are made case by case (or wholesale with an overly broad `mcp__github` allow), including for destructive operations.
:::

::: info Solution
```jsonc
// ✅ — settings.json: granular permissions
{
  "permissions": {
    "allow": ["mcp__github__get_*"],
    "deny": ["mcp__github__delete_*"]
  }
}
```
Explicitly list allowed MCP tools and block dangerous ones. `mcp__server` or `mcp__server__*` targets every tool of a server, `mcp__server__tool` one specific tool (exact names depend on the server: check them with `/mcp`).
:::

---

#### `WARN-005`: Project settings for personal preferences {#warn-005 .warn-title}
*Origin: official documentation ([scope](/en/reference/glossary#scope) of each settings file).*

Putting personal preferences in `.claude/settings.json` imposes them on the whole team via git.

::: danger Problem
```jsonc
// ❌ — In .claude/settings.json (git): personal preferences
{ "model": "claude-opus-5-5", "language": "french" }
```
These personal preferences are committed and apply to every team member.
:::

::: info Solution
```jsonc
// ✅ — In .claude/settings.local.json (gitignore)
{ "model": "claude-opus-5-5", "language": "french" }
```
Use `settings.local.json` (in `.gitignore`) for individual preferences.
:::

---

#### `WARN-006`: Path `Write(…)` rules: a phantom protection {#warn-006 .warn-title}
*Origin: experienced on this project: `settings.json` held up to 4 `Write(…)` rules, all ignored, and didn't deny reading `.env` files; corrected form: only `Read(...)`/`Edit(...)`, `.env*` denied.*

A `Write(path)` rule is accepted without a blocking error, but Claude Code never consults it: the protection only exists on paper.

::: danger Problem
```jsonc
// ❌ — The project's former deny (excerpt)
"deny": [
  "Write(/php-legacy/**)", "Edit(/php-legacy/**)",
  "Write(.env*)", "Edit(.env*)",
  "Bash(rm -rf *)"
]
```
The two `Write(…)` rules added nothing (`Edit(…)` already protected writes), and nothing prevented **reading** the `.env` files.
:::

::: info Solution
```jsonc
// ✅ — The project's current deny
"deny": ["Edit(/php-legacy/**)", "Edit(.env*)", "Read(.env*)", "Bash(rm -rf *)"]
```
`Edit(…)` for every write, `Read(…)` for every read. After each change, check that no "ignored rule" warning appears at startup and review `/permissions`.
:::

---

#### `WARN-007`: Bare `"Read"` in `allow` {#warn-007 .warn-title}
*Origin: experienced on this project: present in an earlier version of `settings.json`, removed.*

Allowing the `Read` tool without a path saves no confirmation inside the project, but removes them everywhere else.

::: danger Problem
```jsonc
// ❌ — The project's former allow (excerpt)
"allow": ["Read", "Glob", "Grep", "Bash(docker compose exec -T app *)"]
```
Reads in the working directory are already free; this `"Read"` additionally allowed reading `~/.ssh`, `~/.aws` or any other folder on the machine, without confirmation.
:::

::: info Solution
```jsonc
// ✅ — The project's current allow (excerpt): no bare Read
"allow": ["Bash(docker compose exec -T app php bin/phpunit *)", "Bash(git add *)", "Bash(npm run lint *)"]
```
For an external folder you really need, add it explicitly (`permissions.additionalDirectories` or `Read(~/precise/path/**)`), and protect user secrets with `deny` rules (see above).
:::

---

#### `WARN-008`: Taking `docker compose *` out of the sandbox {#warn-008 .warn-title}
*Origin: official documentation ([sandboxing — excludedCommands](https://code.claude.com/docs/en/sandboxing#run-commands-outside-the-sandbox-with-excludedcommands)).*

Excluding a command from the sandbox makes it run with your full access: a pattern that is too broad reopens what the sandbox closed.

::: danger Problem
```json
{ "sandbox": { "enabled": true, "excludedCommands": ["docker compose *"] } }
```
Every `docker compose` command runs outside the sandbox with your access. Claude can also **edit the compose file** (a volume, a command) and then run it outside the sandbox.
:::

::: info Solution
Exclude only the form the project uses, `docker compose exec -T app *`, keep `docker compose up`/`down` under confirmation, and add the compose files as `deny Edit(…)` if the sandbox really has to hold.
:::

---

## Ready-to-use examples

### Example 1: Modernization project

::: details See the full configuration
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "includeGitInstructions": false,
  "env": {
    "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR": "1"
  },
  "permissions": {
    "allow": [
      "Bash(docker compose exec -T app php bin/phpunit *)",
      "Bash(docker compose exec -T app php bin/console about *)",
      "Bash(docker compose exec -T app php bin/console cache:clear *)",
      "Bash(docker compose exec -T app php bin/console cache:warmup *)",
      "Bash(docker compose exec -T app php bin/console debug:router *)",
      "Bash(docker compose exec -T app php bin/console debug:container *)",
      "Bash(docker compose exec -T app php bin/console debug:autowiring *)",
      "Bash(docker compose exec -T app php bin/console debug:config *)",
      "Bash(docker compose exec -T app php bin/console debug:event-dispatcher *)",
      "Bash(docker compose exec -T app php bin/console router:match *)",
      "Bash(docker compose exec -T app php bin/console lint:container *)",
      "Bash(docker compose exec -T app php bin/console lint:yaml *)",
      "Bash(docker compose exec -T app php bin/console make:entity *)",
      "Bash(docker compose exec -T app php bin/console make:migration *)",
      "Bash(docker compose exec -T app php bin/console make:fixtures *)",
      "Bash(docker compose exec -T app php bin/console doctrine:database:create *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:diff *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:migrate *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:status *)",
      "Bash(docker compose exec -T app php bin/console doctrine:migrations:generate *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:validate *)",
      "Bash(docker compose exec -T app php bin/console doctrine:mapping:info *)",
      "Bash(docker compose ps *)",
      "Bash(docker compose exec -T app php vendor/bin/phpcs *)",
      "Bash(docker compose exec -T app php vendor/bin/phpcbf *)",
      "Bash(git add *)",
      "Bash(mkdir *)",
      "Bash(jq empty *)",
      "Bash(npm run lint *)",
      "Bash(npm run typecheck *)",
      "Bash(npm run format *)",
      "Bash(npm run format:check *)",
      "Bash(npm run test *)",
      "Bash(npm run test:unit *)",
      "Bash(npm run test:integration *)",
      "Bash(npm run test:coverage *)",
      "Bash(npm run build *)",
      "Bash(npm test *)",
      "Bash(npm ci *)",
      "Bash(npm run docs:build *)",
      "Bash(docker compose up -d *)",
      "Edit(/output/**)",
      "Edit(/legacy-wiki/**)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)",
      "Bash(docker compose exec -T app php bin/console doctrine:database:drop *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:drop *)",
      "Bash(docker compose exec -T app php bin/console doctrine:fixtures:load *)",
      "Bash(docker compose exec -T app php bin/console doctrine:query:sql *)",
      "Bash(docker compose exec -T app php bin/console dbal:run-sql *)",
      "Bash(docker compose exec -T app php bin/console doctrine:schema:update *)"
    ],
    "deny": [
      "Edit(/php-legacy/**)",
      "Edit(.env*)",
      "Read(.env*)",
      "Bash(rm -rf *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```
:::

::: info This project's convention
The `Bash(docker compose exec -T app …)` rules reflect the project rule "all backend commands in the container", limited to `phpunit`, `phpcs`/`phpcbf` and an allowlist of `bin/console` subcommands; Doctrine's destructive subcommands go to `ask`. The `npm` commands are targeted (`npm run lint *`… rather than `npm *`). `Bash(rm -rf *)` only blocks that exact form (see [limits of Bash rules](https://code.claude.com/docs/en/permissions#bash-rule-limits)): the `block-rm.sh` hook refuses the other forms of recursive deletion.
:::

### Example 2: Personal settings (local)

`.claude/settings.local.json`:

```json
{
  "model": "claude-opus-5-5",
  "language": "french",
  "env": {
    "NODE_ENV": "development"
  },
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

### Example 3: Strict sandbox

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "filesystem": {
      "allowWrite": ["/tmp/build"],
      "denyRead": ["~/.aws/credentials", "~/.ssh/id_rsa"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"]
    }
  }
}
```

### Example 4: Starter template

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run lint *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Read(.env*)",
      "Edit(./.env*)"
    ]
  }
}
```

Reads and `git status/diff/log` don't need an `allow`. To block `rm -rf` in all its forms (`rm -fr`, `rm -r -f`, `/bin/rm -rf`…), a Bash `deny` isn't enough: see the hook in the next example, and the sandbox for a real guarantee.

### Example 5: Official team file

Excerpt from the [official docs' team file](https://code.claude.com/docs/en/settings-example#a-teams-shared-settings) (plugin [marketplace](/en/reference/glossary#marketplace) omitted): one `ask`, read `deny` rules, a hook that inspects **every** Bash command, and the sandbox.

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(.env*)", "Read(./secrets/**)"]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh" }
        ]
      }
    ]
  },
  "sandbox": {
    "enabled": true,
    "filesystem": { "allowWrite": ["/tmp/build"] },
    "network": { "allowedDomains": ["registry.npmjs.org", "*.example.com"] }
  }
}
```

`.claude/hooks/block-rm.sh` ([hooks docs](https://code.claude.com/docs/en/hooks), `chmod +x`) — it sees the command's full text and refuses any recursive `rm`, whatever the option order (`rm -rf`, `rm -fr`, `rm -r -f`, `rm -R`, `rm --recursive`, `/bin/rm -rf`, `sh -c "rm -rf …"`):

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

# rm followed by options, one of which contains r/R, or --recursive
if echo "$COMMAND" | grep -Eq '(^|[^[:alnum:]_-])rm[[:space:]]+(-[[:alnum:]]+[[:space:]]+)*(-[[:alpha:]]*[rR]|--recursive)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0  # no decision; normal permission flow applies
fi
```

This filter is still text-based: it also blocks `git rm -r` (a false positive to confirm by hand) and lets through a deletion written differently (`find … -delete`, a Python script). This file's `Read(…)` `deny` rules have the limits described in [Gotchas](#gotchas), which the sandbox closes.

---

## Before going live

### Permissions

- [ ] No bare `"Read"` in `allow` (reads in the project are already free)
- [ ] `allow`: frequent, precise commands (`npm run test *` rather than `npm *`), `*` after a space
- [ ] `ask`: impactful actions (git push, deploy)
- [ ] `deny`: secrets (`Read(.env*)` + `Edit(.env*)`, bare name: any depth), legacy (`Edit(...)`)
- [ ] Destructive commands (rm -rf, force push): `PreToolUse` hook and/or sandbox, not just a Bash `deny`
- [ ] User settings: `deny` on `~/.ssh`, `~/.aws`, `~/.config/gh`
- [ ] "Don't ask again" rules reviewed and pruned (`/permissions`)
- [ ] No path `Write(...)` rule (ignored) — use `Edit(...)`
- [ ] Globs with `**` (recursive)
- [ ] MCP with granular permissions (`mcp__server__tool`)
- [ ] Relative paths chosen deliberately: `/path` (project root) or `path` (current directory)

### Files

- [ ] `.claude/settings.json` for the team (git) — its `allow` rules only apply after the trust dialog
- [ ] `.claude/settings.local.json` for personal preferences (gitignore)
- [ ] `$schema` for IDE autocompletion
- [ ] <span class="chez-nous">In our project</span> `settings.json` paths aligned with the CLAUDE.md PATHS table

### Sandbox

- [ ] Sandbox enabled if Claude runs non-Docker commands on the host (npm, scripts, network) — macOS, Linux, WSL2
- [ ] Sandbox `denyRead` or user-settings `Read(…)` deny for credentials (`~/.aws`, `~/.ssh`) — the two are merged
- [ ] `allowedDomains` for the network
- [ ] `excludedCommands` limited to the form actually used (`docker compose exec -T app *`), never `docker compose *` ([WARN-008](#warn-008))

### Verification

- [ ] `/status` (loaded files), `/permissions` (rules and source file), `claude doctor` (rejected entries)
- [ ] No ignored-rule warning at startup
- [ ] Test the deny rules: Claude must be blocked
- [ ] Test the allow rules: no unnecessary confirmation
- [ ] Security hook also tested on allowed commands (no false positive)

---

## Going further

- [Permission modes](https://code.claude.com/docs/en/permission-modes) — each mode, the classifier and protected paths
- [Hooks](/en/concepts/hooks) — the guarantee Bash rules don't give
- [Instruction or block?](/en/concepts/which-mechanism#instruction-or-block) — when a rule is enough, when you need a `deny` or a hook
- [CLAUDE.md](/en/concepts/claude-md) — context, not to be confused with permissions
- [Official documentation — Settings](https://code.claude.com/docs/en/settings), [Permissions](https://code.claude.com/docs/en/permissions), [Permission modes](https://code.claude.com/docs/en/permission-modes), [Example settings files](https://code.claude.com/docs/en/settings-example), [Settings reference](https://code.claude.com/docs/en/settings-reference)
- [JSON Schema](https://json.schemastore.org/claude-code-settings.json)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
