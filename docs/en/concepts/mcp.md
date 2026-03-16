# MCP — Model Context Protocol

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Standardized protocol to connect Claude to external tools and data |
| **Where** | [`settings.json`](/en/concepts/settings) (`mcpServers`), `.mcp.json` (project), CLI `claude mcp` |
| **Transports** | `http` (recommended), `stdio` (local), `sse` (deprecated) |
| **Scopes** | `local` (default), `project` (.mcp.json, git), `user` (cross-project) |
| **Security** | Trust dialog, per-tool [permissions](/en/concepts/settings), secrets via env vars |

---

## What is MCP?

The Model Context Protocol is an **open-source standardized protocol** for connecting Claude to external services via servers. Each server exposes tools that Claude discovers and uses as if they were native.

```
┌──────────────────────────────────────────────┐
│              CLAUDE CODE                      │
│                                              │
│  Native tools                                │
│  ├── Read, Write, Edit, Bash                 │
│  ├── Glob, Grep, Agent                       │
│                                              │
│  MCP tools (dynamically discovered)          │
│  ├── mcp__github__list_prs                   │
│  ├── mcp__slack__send_message                │
│  ├── mcp__postgres__query                    │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ GitHub   │  │  Slack   │  │ Postgres │   │
│  │ Server   │  │  Server  │  │  Server  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼──────────────┼─────────────┼─────────┘
        ▼              ▼             ▼
    GitHub API     Slack API    PostgreSQL
```

---

## How It Works

### The 3 Transports

| Transport | Description | Usage |
|-----------|-------------|-------|
| **`http`** | HTTP POST (streamable-http) | **Recommended** — cloud servers |
| **`stdio`** | Local process (stdin/stdout) | Local tools, custom scripts |
| **`sse`** | Server-Sent Events | **Deprecated** — use http |

### Installation via CLI

```bash
# Remote HTTP server (recommended)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# HTTP server with authentication
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Local stdio server
claude mcp add --transport stdio --env GITHUB_TOKEN=xxx github \
  -- npx -y @modelcontextprotocol/server-github

# Server with specific scope
claude mcp add --transport http --scope user notion https://mcp.notion.com/mcp
```

### Server Management

```bash
claude mcp list                      # List servers
claude mcp get github                # Server details
claude mcp remove github             # Remove a server
claude mcp add-json weather '...'    # Add from JSON
claude mcp add-from-claude-desktop   # Import from Claude Desktop
claude mcp serve                     # Claude Code AS an MCP server
```

In Claude Code, `/mcp` shows status and allows OAuth authentication.

### JSON Configuration

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

::: info Variable expansion in .mcp.json
`${VAR}` is replaced by the environment variable. `${VAR:-default}` uses a default value. Works in `command`, `args`, `env`, `url`, `headers`.
:::

### Scopes and Priority

| Scope | Storage | Shared | Command |
|-------|---------|--------|---------|
| **Local** (default) | `~/.claude.json` | No, current project | `--scope local` |
| **Project** | `.mcp.json` (root) | Yes (git) | `--scope project` |
| **User** | `~/.claude.json` | No, all projects | `--scope user` |
| **Managed** | `/etc/claude-code/managed-mcp.json` | Organization | Admin |

Priority: local > project > user. Managed servers take exclusive control.

### Discovery Cycle

```
1. Claude Code starts → launches each MCP server
2. Server exposes its tools (mcp__github__list_prs, ...)
3. Claude detects the need for an external tool
4. ToolSearch("github") → discovers tools
5. Claude uses the tool → result in the conversation
```

::: info "Deferred" tools and Tool Search
MCP tools are not loaded at startup. Claude discovers them via `ToolSearch` on demand. When tools exceed 10% of context, Tool Search activates automatically (`ENABLE_TOOL_SEARCH=auto`).
:::

### Granular Permissions {#permissions}

MCP permissions are configured in [`settings.json`](/en/concepts/settings):

```json
{
  "permissions": {
    "allow": [
      "mcp__github__list_prs",
      "mcp__github__get_issue"
    ],
    "deny": [
      "mcp__github__delete_repo",
      "mcp__github__create_release"
    ]
  }
}
```

### OAuth 2.0 Authentication

Remote servers may require OAuth:

```bash
# Add the server
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# Authenticate in Claude Code
/mcp  # → follow the browser flow
```

For servers without dynamic registration:

```bash
claude mcp add --transport http \
  --client-id your-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### MCP Resources and Prompts

| Feature | Syntax | Description |
|---------|--------|-------------|
| **Resources** | `@github:issue://123` | Referencing via @ mentions |
| **Prompts** | `/mcp__github__pr_review 456` | MCP prompts as commands |

### Output Limits

| Config | Value | Description |
|--------|-------|-------------|
| Warning | 10,000 tokens | Warning displayed |
| Default max | 25,000 tokens | Default limit |
| `MAX_MCP_OUTPUT_TOKENS` | Configurable | Increase for large results |
| `MCP_TIMEOUT` | ms | Server startup timeout |

### Dynamic Tool Updates

MCP servers can send `list_changed` notifications to update their tools without reconnection.

---

## Practical Guide: Configuring Your MCP Servers

### MCP vs Native Bash

| Need | MCP | Bash | Recommendation |
|------|-----|------|---------------|
| List PRs | Yes | `gh pr list` | Both OK |
| SQL query | Yes | `psql -c` | MCP = more structured |
| Send a Slack message | Yes | `curl API` | MCP = simpler |
| Build/test | No | Yes | Bash always |
| K8s cluster | Yes | `kubectl` | MCP = auto discovery |

::: tip Practical rule
If a native CLI equivalent exists (`gh`, `kubectl`, `psql`), prefer it. MCP shines when the integration is richer or there is no CLI.
:::

### Popular Servers

::: warning Third-party servers
Anthropic has not verified the security of all community servers. Check the source before installing. `@modelcontextprotocol/` packages are the official protocol references.
:::

| Server | Installation command | Type |
|--------|---------------------|------|
| **GitHub** | `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` | HTTP |
| **Sentry** | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` | HTTP |
| **Notion** | `claude mcp add --transport http notion https://mcp.notion.com/mcp` | HTTP |
| **PostgreSQL** | `claude mcp add --transport stdio db -- npx -y @modelcontextprotocol/server-postgres` | stdio |
| **Filesystem** | `claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem` | stdio |

See the [complete registry on GitHub](https://github.com/modelcontextprotocol/servers) for hundreds of servers.

### Warnings

#### ⚠️ `WARN-001` : Hardcoded token

Writing a token in plaintext in a configuration file exposes credentials in git history.

::: danger Problem
```json
// ❌ — Token in plaintext in the file
{ "env": { "GITHUB_TOKEN": "ghp_abc123..." } }
```
The token is visible in the git repository and all its clones.
:::

::: info Solution
```json
// ✅ — Environment variable
{ "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" } }
```
Export in `.bashrc`: `export GITHUB_TOKEN=ghp_...`
:::

---

#### ⚠️ `WARN-002` : No deny for destructive actions

A wildcard on allow permissions gives Claude unlimited access, including irreversible actions.

::: danger Problem
```json
// ❌ — Claude can delete a repo
{ "allow": ["mcp__github__*"] }
```
All GitHub actions are permitted, including repository deletion.
:::

::: info Solution
```json
// ✅ — Specific actions
{ "allow": ["mcp__github__list_prs"], "deny": ["mcp__github__delete_repo"] }
```
Always explicitly define destructive actions in the `deny` list.
:::

---

#### ⚠️ `WARN-003` : Server from unknown source

::: warning Attention
Every MCP server has network access. **Never** install an unverified server. Prefer `@modelcontextprotocol/` packages and official HTTP servers.
:::

---

#### ⚠️ `WARN-004` : Expired token

::: warning Attention
**Symptom**: Vague error or empty result.

**Diagnosis**:
1. `echo $GITHUB_TOKEN` — variable defined?
2. `gh auth status` — token valid?
3. `/mcp` — server status?
4. Regenerate if necessary
:::

---

#### ⚠️ `WARN-005` : Forgetting --scope for team sharing

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

## Advanced Control

### Claude Code as MCP Server

Claude Code can itself serve as an MCP server for other applications:

```bash
claude mcp serve
```

Config for Claude Desktop:
```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"]
    }
  }
}
```

### Plugin MCP Servers

[Plugins](/en/concepts/plugins) can bundle MCP servers that start automatically:

```json
{
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

### Managed MCP (Enterprise)

`managed-mcp.json` takes exclusive control — users cannot add servers.

Allowlists/denylists for more flexible control:

```json
{
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverUrl": "https://mcp.company.com/*" }
  ],
  "deniedMcpServers": [
    { "serverName": "dangerous-server" }
  ]
}
```

> Denylist has absolute priority over allowlist.

### Import and Compatibility

```bash
# Import from Claude Desktop (macOS/WSL)
claude mcp add-from-claude-desktop

# Claude.ai servers available automatically
# Disable: ENABLE_CLAUDEAI_MCP_SERVERS=false
```

---

## Concrete Examples

### Example 1: GitHub

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

```
User: "What PRs are open?"
Claude → ToolSearch("github")
Claude → mcp__github__list_prs({ state: "open" })
Claude: "3 open PRs: #42, #43, #44"
```

### Example 2: PostgreSQL

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

```
User: "What is this month's revenue?"
Claude → mcp__db__query({ sql: "SELECT SUM(amount)..." })
```

### Example 3: Granular Permissions

```json
{
  "permissions": {
    "allow": [
      "mcp__github__list_prs",
      "mcp__github__get_issue",
      "mcp__github__get_pr_diff"
    ],
    "deny": [
      "mcp__github__delete_repo",
      "mcp__github__merge_pr"
    ]
  }
}
```

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

---

## Launch Checklist

### Installation

- [ ] Choose the right transport (`http` for remote, `stdio` for local)
- [ ] Choose the right scope (`project` if team sharing, `local` otherwise)
- [ ] Test connection: `/mcp` in Claude Code

### Security

- [ ] Secrets via `${VARIABLE}` (never hardcoded)
- [ ] `allow`/`deny` permissions per tool
- [ ] Verified sources only (`@modelcontextprotocol/` or official HTTP)
- [ ] OAuth configured for remote servers that require it

### Organization

- [ ] `.mcp.json` in git for team servers
- [ ] Document servers in CLAUDE.md
- [ ] `MAX_MCP_OUTPUT_TOKENS` if large results expected

### Security Architecture

```
Layer 1: Environment variables    <- Secrets
Layer 2: allow/deny permissions   <- Access control
Layer 3: Trust dialog             <- First use
Layer 4: Process isolation        <- Each server separate
Layer 5: Managed MCP (enterprise) <- Organizational control
```

---

## Resources

- [Official Documentation — MCP](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP Servers — GitHub](https://github.com/modelcontextprotocol/servers)
- [MCP SDK — Build your own](https://modelcontextprotocol.io/quickstart/server)
