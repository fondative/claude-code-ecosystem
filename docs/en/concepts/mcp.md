# MCP — Model Context Protocol

## In short

| Aspect | Detail |
|--------|--------|
| **What** | Standardized protocol to connect Claude to external tools and data |
| **Where** | `.mcp.json` (project), `~/.claude.json` (user / local), CLI `claude mcp add` — MCP tool permissions stay in [`settings.json`](/en/concepts/settings) |
| **Transports** | `http` (recommended), [`stdio`](/en/reference/glossary#stdio) (local process launched by Claude Code), `ws` (WebSocket), `sse` (deprecated) |
| **[Scopes](/en/reference/glossary#scope)** | `local` (default), `project` (.mcp.json, git), `user` (all your projects) + plugin servers, claude.ai connectors and [managed](/en/reference/glossary#managed) |
| **Security** | Trusted servers only ([prompt injection](/en/reference/glossary#injection-de-prompt) risk), per-tool [permissions](/en/concepts/settings), [OAuth](/en/reference/glossary#oauth) rather than tokens |
| **What this page adds** | When to prefer a CLI over an MCP server, how to connect a server without exposing a secret or a destructive action, and why the modernisation project does without |

---

## The essentials in 2 minutes

The Model Context Protocol is an **open-source standardized protocol** for connecting Claude to external services via servers. Each server exposes tools (`mcp__<server>__<tool>`) that Claude discovers and uses as if they were native.

```
┌──────────────────────────────────────────────┐
│                 CLAUDE CODE                  │
│                                              │
│  Native tools                                │
│  ├── Read, Write, Edit, Bash                 │
│  └── Glob, Grep, Agent                       │
│                                              │
│  MCP tools (dynamically discovered)          │
│  ├── mcp__github__list_prs                   │
│  ├── mcp__slack__send_message                │
│  └── mcp__db__query                          │
│                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │  GitHub  │   │  Slack   │   │  DBHub   │  │
│  │  server  │   │  server  │   │  server  │  │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘  │
└───────┼──────────────┼──────────────┼────────┘
        ▼              ▼              ▼
    GitHub API     Slack API      PostgreSQL
```

```bash
# Remote server, shared with the team via .mcp.json; then authenticate in /mcp
claude mcp add --transport http --scope project notion https://mcp.notion.com/mcp
```

Five facts change how you choose and configure a server:

1. **CLI first.** The official docs recommend `gh`, `aws`, `psql`… when they exist: no tool listing to load, nothing to maintain.
2. **A server is trusted code.** A stdio server runs with your rights, outside the [sandbox](/en/reference/glossary#sandbox) and the permission rules; a server that reads external content can inject instructions.
3. **The default scope is `local`**: without `--scope project`, the server is neither in `.mcp.json` nor shared.
4. **[Tool Search](/en/reference/glossary#tool-search) is on by default**: only tool names load at startup; Claude loads a tool's full definition when it needs it.
5. **Permissions are set per tool** (`mcp__server__tool`): reads in `allow`, writes in `ask`, irreversible actions in `deny` ([permission rules](/en/reference/glossary#regles-de-permission)).

→ How it all works (transports, `claude mcp` commands, server fields, variable expansion, scopes and priority, Tool Search, permission syntax, OAuth, resources and prompts, limits, managed MCP): [official documentation — MCP](https://code.claude.com/docs/en/mcp).

---

## MCP or CLI?

The official documentation recommends **CLI first**: `gh`, `aws`, `gcloud`, `sentry-cli`… are the most context-efficient way to interact with an external service, since they add no tool listing ([best practices — Use CLI tools](https://code.claude.com/docs/en/best-practices#use-cli-tools), [costs](https://code.claude.com/docs/en/costs#reduce-token-usage)).

| Need | Recommendation | Why |
|------|----------------|-----|
| GitHub PRs, issues | `gh` | CLI Claude knows, already authenticated |
| One-off SQL query | `psql` with a read-only user | No server to maintain |
| Kubernetes cluster | `kubectl` | Same |
| Build / tests | Bash | Always |
| Service without a CLI (Notion, Slack…) or OAuth-authenticated | **MCP** | Integration and auth handled by the server |
| Tools reserved for a single agent | **MCP** via the [subagent](/en/concepts/agents)'s `mcpServers` | Tools kept out of the main context |

::: tip Practical rule
A CLI exists and Claude knows how to use it → the CLI. MCP when there is no CLI, when OAuth is needed, or to give an agent a precise tool set. Prefer few, well-targeted tools: bloated tool sets make the choice ambiguous ([Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).
:::

---

## Configuring your MCP servers well

### Security: What to Know Before Connecting a Server

::: danger Prompt injection
A server that fetches external content (web pages, issues, tickets, emails) can return malicious instructions that Claude reads as working content. The official docs say to **verify you trust each server before connecting it** ([MCP](https://code.claude.com/docs/en/mcp), [prompt injection](https://code.claude.com/docs/en/security#protect-against-prompt-injection)). Keep write tools in `ask` or `deny`.
:::

- **Source**: prefer the reviewed connectors of the [Anthropic Directory](https://claude.ai/directory) (addable with `claude mcp add`) and vendors' official servers.
- **Cloned repository**: review its `.mcp.json` before approving its servers; a stdio server runs a command with your permissions. In an interactive session, Claude Code asks you to approve project servers (after the folder's [trust dialog](/en/reference/glossary#dialogue-de-confiance)); with `claude -p`, the Agent SDK or a cloud session, they load **without confirmation**.
- **CI / scripts**: `claude -p --strict-mcp-config --mcp-config ci-mcp.json` only uses the servers passed explicitly; `disabledMcpjsonServers` blocks a project server in every mode.
- **Context**: `/context` shows what is using the context; disable unused servers in `/mcp`.

### Popular Servers

::: warning Third-party servers
Anthropic has not verified the security of all community servers. Check the source before installing. Among the `@modelcontextprotocol/` reference servers, only some are still maintained (`everything`, `fetch`, `filesystem`, `git`, `memory`, `sequentialthinking`, `time`): `server-github` and `server-postgres` are **archived** (no more fixes) — prefer GitHub's official remote server and a maintained database server.
:::

Installation commands: GitHub and PostgreSQL in the [examples](#ready-to-use-examples), Notion in [The essentials](#the-essentials-in-2-minutes); Sentry is added the same way (`claude mcp add --transport http sentry https://mcp.sentry.dev/mcp`). See also the [reference servers repository](https://github.com/modelcontextprotocol/servers) and its links to server registries.

### In the modernisation project

::: info In our project
The modernisation project **uses no MCP server**: no `.mcp.json`, no `mcp__…` rule in `.claude/settings.json`, no `mcpServers` in its 11 agents. Its external access goes through pre-approved CLIs:

| Need | What the project does | Possible MCP alternative |
|------|----------------------|--------------------------|
| Backend commands (PHP, Composer, tests, the container's PostgreSQL database) | Targeted `allow` on `docker compose exec -T app` (`php bin/phpunit`, `phpcs`/`phpcbf`, a list of `php bin/console` commands) | Database server reserved for an agent (example 5) |
| Git | `allow: Bash(git add *)`; `ask` on `commit` and `push`; `git status`, `git diff`, `git log` pre-approved by the `allowed-tools` of the `/dev:commit` command | GitHub remote server (example 1) |
| Frontend | `allow: Bash(npm ci *)`, `npm test *`, `npm run` limited to `lint`, `typecheck`, `format`, `format:check`, `test*`, `build`, `docs:build` | — |

This is the "CLI first" rule applied directly: everything the pipeline needs has a CLI, already governed by the Bash permissions.
:::

### Pitfalls to know

- **`type` is required whenever there is a `url`**: without it, the entry is read as stdio and skipped.
- **Claude Code credentials (`ANTHROPIC_API_KEY`…) read as empty** in a remote server's `url`/`headers`, even via `${VAR}`.
- **`mcp__*` in `allow` is skipped** (with a warning); it only works in `deny`/`ask`. The `MCP(...)` form doesn't exist.
- **A server defined at several scopes is not merged**: the winning entry (local > project > user > plugin > connectors) is used whole.
- **A large tool result is saved to a file** and Claude only receives its path, in two cases: beyond 25,000 tokens (a threshold `MAX_MCP_OUTPUT_TOKENS` raises), and as soon as a text result exceeds 50,000 characters, whatever its token count (a threshold `MAX_MCP_OUTPUT_TOKENS` doesn't change; only the server can raise it for a tool).
- **`tools:` in a subagent is an allowlist**: an agent limited to `tools: Read` has no MCP tools at all. Either list the wanted MCP tools there (`mcp__db__search_objects`…), or use `disallowedTools` to remove only the forbidden tools ([sub-agents](https://code.claude.com/docs/en/sub-agents)).

Details and sources: [official documentation — MCP](https://code.claude.com/docs/en/mcp).

### Common mistakes to avoid

→ Pitfalls from every building block, sorted by severity: [Pitfall catalog](/en/guide/warns).

#### `WARN-001` : Hardcoded token {#warn-001 .warn-title}
*Origin: general good practice; the OAuth → `headersHelper` → variables order comes from the official documentation.*

Writing a token in plaintext in a configuration file exposes credentials in git history.

::: danger Problem
```jsonc
// ❌ — Token in plaintext in the file
{ "headers": { "Authorization": "Bearer ghp_abc123..." } }
```
The token is visible in the git repository and all its clones.
:::

::: info Solution, in order of preference
1. **OAuth** if the server supports it: no token to store (`/mcp` or `claude mcp login <name>`).
2. **[`headersHelper`](/en/reference/glossary#headershelper)**: a command reads the token from a secrets manager on every connection ([dynamic headers](https://code.claude.com/docs/en/mcp#use-dynamic-headers-for-custom-authentication)).

```json
{ "type": "http", "url": "https://mcp.example.com/mcp", "headersHelper": "/opt/bin/mcp-headers.sh" }
```

```bash
#!/bin/bash
# /opt/bin/mcp-headers.sh — prints the headers as JSON (example with pass)
jq -nc --arg t "$(pass show mcp/example)" '{Authorization: ("Bearer " + $t)}'
```

3. Otherwise, `${VAR}` in `.mcp.json`, with the variable injected by a secrets manager — not written in plaintext in `.bashrc`.
:::

---

#### `WARN-002` : No deny for destructive actions {#warn-002 .warn-title}
*Origin: general good practice, based on the official MCP permission syntax.*

An `allow` covering every tool of a server (`mcp__github__*`) also auto-approves its writes and irreversible actions (merge, deletion).

::: info Solution
`allow` limited to specific read tools, writes in `ask`, irreversible actions in `deny` (see [example 3](#example-3-granular-permissions)). Detailed problem and solution: [Settings — WARN-004](/en/concepts/settings#warn-004).
:::

---

#### `WARN-003` : Server from unknown source {#warn-003 .warn-title}
*Origin: official documentation (verify the trust given to each server).*

::: warning Attention
A stdio server runs with your user permissions; a remote server sees everything Claude sends it. **Never** install an unverified server. Prefer vendors' official HTTP servers and still-maintained reference servers (not archived packages).
:::

---

#### `WARN-004` : Expired token {#warn-004 .warn-title}
*Origin: general good practice (diagnosis with the official commands).*

::: warning Attention
**Symptom**: Vague error or empty result.

**Diagnosis**:
1. `claude mcp list` / `claude mcp get <name>` — status and failure detail (HTTP code, e.g. 401)
2. `${VAR}` variable defined? (a missing variable is flagged in `claude mcp list`)
3. `/mcp` → **Re-authenticate** for an OAuth server, or `claude mcp login <name>`
4. Regenerate the token if necessary (and update it where the `headersHelper` reads it)
:::

---

#### `WARN-005` : Forgetting --scope for team sharing {#warn-005 .warn-title}
*Origin: official documentation (the default scope is `local`).*

Without the `--scope project` flag, the MCP server remains local and invisible to other team members.

::: danger Problem
```bash
# ❌ — Local scope by default, invisible to the team
claude mcp add --transport http api https://mcp.example.com
```
The server is registered in `~/.claude.json` and is not shared via git.
:::

::: info Solution
```bash
# ✅ — Project scope, .mcp.json in git
claude mcp add --transport http --scope project api https://mcp.example.com
```
The server is written to `.mcp.json` at the project root, versioned with the code.
:::

---

## Ready-to-use examples

### Example 1: GitHub

GitHub's official remote server, authenticated with a (fine-grained) personal access token sent as a header.

::: warning `--header "Authorization: Bearer $GITHUB_PAT"` writes the token in plaintext
This is the form shown in the official docs, but the shell replaces `$GITHUB_PAT` **before** Claude Code sees the command: the token is stored in plaintext in `~/.claude.json`, exactly what [WARN-001](#warn-001) tries to avoid. Prefer OAuth (`/mcp`) when the server offers it, otherwise a `headersHelper` that reads the token on every connection:
:::

```bash
claude mcp add-json github '{"type":"http","url":"https://api.githubcopilot.com/mcp/","headersHelper":"$HOME/bin/github-mcp-headers.sh"}'
```

```bash
#!/bin/bash
# ~/bin/github-mcp-headers.sh — reads the token from the secrets manager (here pass)
jq -nc --arg t "$(pass show github/mcp-pat)" '{Authorization: ("Bearer " + $t)}'
```

The single quotes stop the shell from replacing `$HOME` when adding; Claude Code runs the `headersHelper` in a shell on every connection. Check with `/mcp` that the server is `connected` (a bad token shows as `failed` with the HTTP code, e.g. 401).

```
User: "What PRs are open?"
Claude → ToolSearch("github")
Claude → mcp__github__<PR listing tool>({ state: "open" })
Claude: "3 open PRs: #42, #43, #44"
```

### Example 2: PostgreSQL (DBHub)

[DBHub](https://github.com/bytebase/dbhub) (`@bytebase/dbhub`) connects Claude to a relational database through a connection string. Use a **read-only** database user:

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

Like the token in example 1, the connection string, password included, is stored as is in `~/.claude.json`: to keep it out, pass it through the `DSN` variable (example 5).

```
User: "What is this month's revenue?"
Claude → mcp__db__query({ sql: "SELECT SUM(amount)..." })
```

### Example 3: Granular Permissions

```json
{
  "permissions": {
    "allow": [
      "mcp__github__get_issue",
      "mcp__db__search_objects"
    ],
    "ask": [
      "mcp__db__execute_sql"
    ],
    "deny": [
      "mcp__github__merge_pull_request"
    ]
  }
}
```

`search_objects` and `execute_sql` are the two tools DBHub exposes; check the actual names in `/mcp`.

### Example 4: Shared project server (.mcp.json)

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

### Example 5: Database reserved for a subagent

- **Server defined in the agent** (inline `mcpServers`): it connects when the subagent starts, disconnects when it finishes, and its tools stay out of the main context ([sub-agents — Scope MCP servers](https://code.claude.com/docs/en/sub-agents#scope-mcp-servers-to-a-subagent)).
- **Connection string**: DBHub reads it from the `DSN` environment variable ([DBHub docs](https://dbhub.ai/config/command-line)). Define it in the environment of the shell that launches Claude Code (the stdio server inherits it), preferably injected by a secrets manager rather than written in `.bashrc` or in the agent file.
- **Read-only**: `DSN` must point to a **read-only** PostgreSQL user: the database is what guarantees no writes.
- **`disallowedTools` rather than `tools`**: see [Pitfalls to know](#pitfalls-to-know).

```markdown
---
name: db-analyst
description: Answers questions about the data with read-only SELECT queries.
disallowedTools: Write, Edit, Bash
mcpServers:
  - db:
      type: stdio
      command: npx
      args: ["-y", "@bytebase/dbhub"]
---

Explore the schema with search_objects before writing a query.
Return the query used and a summary of the result, not raw rows.
```

---

## Before going live

### Installation

- [ ] Choose the right transport (`http` for remote, `stdio` for local, `ws` if the server pushes events); `type` set whenever there is a `url`
- [ ] Choose the right scope (`project`, i.e. `.mcp.json` in git, if team sharing; `local` otherwise)
- [ ] Test connection: `/mcp` in Claude Code

### Security

- [ ] OAuth, then `headersHelper`, otherwise `${VARIABLE}` (never a plaintext token)
- [ ] `allow` limited to read tools; writes in `ask`, irreversible actions in `deny`
- [ ] Trusted servers from verified sources (official HTTP servers, maintained reference servers — no archived packages; prompt injection risk); a cloned repository's `.mcp.json` reviewed before approval

### Organization

- [ ] CLI first (`gh`, `psql`, `kubectl`); MCP when it adds something
- [ ] `/context` to measure the cost; unused servers disabled in `/mcp`
- [ ] `--strict-mcp-config` in CI
- [ ] `MAX_MCP_OUTPUT_TOKENS` if large results expected; per-server `timeout` for long-running tools
- [ ] Heavy servers reserved for a subagent via `mcpServers` rather than in `.mcp.json`
- [ ] Subagent with `tools:`: wanted MCP tools listed, or `disallowedTools` instead

### Security Architecture

```
Layer 1: Server choice              <- Trusted sources (prompt injection)
Layer 2: Secrets out of files       <- OAuth, headersHelper, variables
Layer 3: allow/ask/deny permissions <- Per-tool access control
Layer 4: .mcp.json approval         <- Trust dialog (absent in -p / SDK)
Layer 5: Managed MCP (enterprise)   <- Organizational control
```

Each server running in its own process is **not** a security barrier: a stdio server runs with your user permissions, outside the sandbox and outside permission rules (which only cover Claude's tool calls).

---

## Going further

- [Agents](/en/concepts/agents) — reserving a server for a subagent with `mcpServers`
- [Hooks](/en/concepts/hooks) — control MCP tool calls with an `mcp__<server>__.*` matcher; the `mcp_tool` hook type and the `Elicitation` events are described in the [official hooks reference](https://code.claude.com/docs/en/hooks)
- [Settings](/en/concepts/settings) — where `mcp__…` permissions live
- [Official Documentation — MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io) · [MCP Servers — GitHub](https://github.com/modelcontextprotocol/servers) · [MCP SDK — Build your own](https://modelcontextprotocol.io/quickstart/server)

---

*Checked with **Claude Code v2.1.295** against the official documentation on October 10, 2026. A newer feature may be missing: see the [changelog](https://code.claude.com/docs/en/changelog).*
