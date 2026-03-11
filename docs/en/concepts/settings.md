# Settings

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Configuration for permissions, sandbox, model, hooks and Claude Code behavior |
| **Where** | 5 levels: managed > CLI > local > project > user |
| **Permissions** | `allow` (auto), `deny` (blocked), `ask` (confirmation) — deny takes priority |
| **Sandbox** | Filesystem + network isolation (macOS, Linux, WSL2) |
| **Verification** | `/status` to see active settings and their source |

---

## What is Settings?

The `settings.json` file configures the **complete behavior of Claude Code**: permissions, sandbox, model, hooks, environment variables, and more. It is the project's firewall and dashboard.

```
┌────────────────────────────────────────────┐
│              PERMISSIONS                    │
│                                            │
│  Claude wants: Write("php-legacy/file.php")│
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ Check deny   │ deny: Write(php-legacy/**) │
│  │              │ → BLOCKED ❌              │
│  └──────────────┘                          │
│                                            │
│  Claude wants: Bash("docker compose exec") │
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ Check allow  │ allow: Bash(docker *)    │
│  │              │ → ALLOWED ✅             │
│  └──────────────┘                          │
│                                            │
│  Claude wants: Bash("git push origin main")│
│         │                                  │
│         ▼                                  │
│  ┌──────────────┐                          │
│  │ Check ask    │ ask: Bash(git push *)    │
│  │              │ → CONFIRMATION REQUIRED   │
│  └──────────────┘                          │
└────────────────────────────────────────────┘
```

---

## How It Works

### Settings Files

| Scope | File | Shared | Priority |
|-------|------|--------|----------|
| **Managed** | `/etc/claude-code/managed-settings.json` | Organization (admin) | 1 (highest) |
| **CLI args** | `--model`, `--permission-mode`, etc. | Session | 2 |
| **Local** | `.claude/settings.local.json` | No (gitignored) | 3 |
| **Project** | `.claude/settings.json` | Yes (git) | 4 |
| **User** | `~/.claude/settings.json` | No (personal) | 5 (lowest) |

::: tip settings.local.json
Ideal for personal preferences on a project without polluting the repo: additional permissions, local env vars, dev hooks.
:::

### Permission Resolution Logic

```
1. deny matches? → BLOCKED (always takes priority)
2. ask matches?  → ASKS FOR CONFIRMATION
3. allow matches? → ALLOWED (without confirmation)
4. Nothing matches → ASKS FOR CONFIRMATION
```

::: warning deny takes priority
`deny` always overrides `allow` and `ask`. If a tool matches deny, it is blocked even if it is in allow.
:::

### Permissions: 3 Levels

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose *)",
      "Bash(git status)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(config/**)"
    ],
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### Tool Patterns

| Pattern | Target |
|---------|--------|
| `Bash(npm run *)` | Commands starting with `npm run` |
| `Read(.env*)` | .env files |
| `Write(src/**)` | Recursive write in src/ |
| `WebFetch(domain:example.com)` | Requests to a domain |
| `MCP(github)` | Tools from the github MCP server |
| `Agent(codereview)` | Agent named "codereview" |
| `Skill(deploy *)` | Deploy skill with arguments |

### 5 Permission Modes

| Mode | Edits | Executions | Usage |
|------|-------|------------|-------|
| **Plan** | Blocked | Blocked | Read-only exploration |
| **Default** | Confirmation | Confirmation | Secure work |
| **Accept Edits** | Auto | Confirmation | Speed + control |
| **Don't Ask** | Auto | Auto (allowlist) | High trust |
| **Bypass Permissions** | Auto | Auto (everything) | Dev/test only |

Cycle: `Ctrl+Shift+P`. Configure the default:

```json
{ "permissions": { "defaultMode": "acceptEdits" } }
```

::: danger bypassPermissions
Disables **all** security. Can be blocked by admin via `permissions.disableBypassPermissionsMode: "disable"` in managed settings.
:::

### Settings Beyond Permissions

| Field | Type | Description |
|-------|------|-------------|
| `model` | string | Default model (`"claude-sonnet-4-6"`) |
| `availableModels` | array | Restrict models in `/model` |
| `language` | string | Preferred response language |
| `outputStyle` | string | System prompt style |
| `env` | object | Environment variables per session |
| `attribution.commit` | string | Attribution for git commits |
| `attribution.pr` | string | Attribution for PRs |
| `cleanupPeriodDays` | number | Deletion of inactive sessions (default: 30) |
| `autoMemoryEnabled` | boolean | Automatic memory |
| `alwaysThinkingEnabled` | boolean | Extended thinking by default |
| `includeGitInstructions` | boolean | Git instructions in the prompt |
| `permissions.additionalDirectories` | array | Additional working directories |

### Sandbox

The sandbox isolates Bash commands from the filesystem and network (macOS, Linux, WSL2):

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "filesystem": {
      "allowWrite": ["//tmp/build", "~/.kube"],
      "denyWrite": ["//etc"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "allowLocalBinding": true
    }
  }
}
```

| Path prefix | Meaning |
|-------------|---------|
| `//` | Absolute from root (`//tmp` → `/tmp`) |
| `~/` | Home directory |
| `/` | Relative to settings folder |
| `./` | Relative to current directory |

### Environment Variables

The `env` field in settings.json defines variables for each session:

```json
{
  "env": {
    "NODE_ENV": "development",
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1"
  }
}
```

Notable env vars:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_MODEL` | Override the model |
| `CLAUDE_CODE_EFFORT_LEVEL` | `low\|medium\|high` (reasoning) |
| `BASH_DEFAULT_TIMEOUT_MS` | Command timeout (default: 120000) |
| `MAX_MCP_OUTPUT_TOKENS` | MCP output limit |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Disable auto-memory |
| `CLAUDE_CODE_AUTOCOMPACT_PCT_OVERRIDE` | % for auto-compaction |

### Merge Behavior

Settings are **merged** across scopes:

| Type | Behavior |
|------|----------|
| **Arrays** (`allow`, `deny`, `ask`, `allowWrite`, `allowedDomains`...) | Concatenated and deduplicated |
| **Non-arrays** (`model`, `language`, `defaultMode`...) | Highest scope wins |

---

## Practical Guide: Configuring Your Settings

### What to Put in allow vs ask vs deny

```
Action ALWAYS safe?
├── YES → allow (Read, Glob, Grep, git status)
└── NO
    Action NEVER allowed?
    ├── YES → deny (rm -rf, force push, write .env)
    └── NO → ask (git push, deploy, edit config)
```

| Pattern | Where | Why |
|---------|-------|-----|
| `Read`, `Glob`, `Grep` | allow | Reading is always safe |
| `Bash(docker compose *)` | allow | Frequent command, safe |
| `Bash(git status/diff/log)` | allow | Read-only git |
| `Bash(git push *)` | ask | Verify before push |
| `Write(php-legacy/**)` | deny | Protect source code |
| `Bash(rm -rf *)` | deny | Destructive |
| `Write(.env*)` | deny | Secret files |

### Mistakes to Avoid

#### Pitfall 1: Permissions too broad

```json
// ❌ — Disables all security
{ "allow": ["Bash(*)"] }
```

```json
// ✅ — Specific commands
{ "allow": ["Bash(npm test *)", "Bash(docker compose *)"] }
```

#### Pitfall 2: Forgetting deny for writes

```json
// ❌ — Legacy is not protected
{ "allow": ["Read", "Write"] }
```

```json
// ✅ — Explicit protection
{ "deny": ["Write(php-legacy/**)", "Edit(php-legacy/**)"] }
```

#### Pitfall 3: Glob `*` vs `**`

```json
// ❌ — First level only
{ "deny": ["Write(php-legacy/*)"] }

// ✅ — Recursive
{ "deny": ["Write(php-legacy/**)"] }
```

#### Pitfall 4: MCP without permissions

```json
// ❌ — All GitHub tools allowed
{ "mcpServers": { "github": {} } }
```

```json
// ✅ — Granular permissions
{
  "permissions": {
    "allow": ["mcp__github__list_prs"],
    "deny": ["mcp__github__delete_repo"]
  }
}
```

#### Pitfall 5: Project settings for personal preferences

```json
// ❌ — In .claude/settings.json (git): personal preferences
{ "model": "claude-opus-4-6", "language": "french" }
```

```json
// ✅ — In .claude/settings.local.json (gitignored)
{ "model": "claude-opus-4-6", "language": "french" }
```

---

## Advanced Control

### Verification with `/status`

`/status` displays:
- Which settings files are active
- Source of each configuration (Managed, User, Project, Local)
- Configuration errors

### Managed Settings (Enterprise)

3 delivery mechanisms:

| Mechanism | Platform |
|-----------|----------|
| **Server** | Via Claude.ai admin console |
| **MDM/OS** | macOS plist, Windows registry (HKLM) |
| **File** | `managed-settings.json` in `/etc/claude-code/` |

Settings reserved for managed:

| Setting | Effect |
|---------|--------|
| `allowManagedPermissionRulesOnly` | Only managed rules apply |
| `allowManagedHooksOnly` | Blocks user/project/plugin hooks |
| `allowManagedMcpServersOnly` | Only admin MCP servers are allowed |
| `disableBypassPermissionsMode` | Prevents bypass mode |
| `strictKnownMarketplaces` | Allowlist for plugin sources |

### Attribution

```json
{
  "attribution": {
    "commit": "Co-Authored-By: Claude <noreply@anthropic.com>",
    "pr": "Generated with Claude Code"
  }
}
```

Set to `""` to hide attribution.

---

## Concrete Examples

### Example 1: Modernization project

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(docker compose exec *)",
      "Bash(git status)", "Bash(git diff *)",
      "Bash(git log *)", "Bash(git add *)",
      "Bash(ls *)", "Bash(find *)", "Bash(mkdir *)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(git commit *)"
    ],
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)",
      "Bash(rm -rf *)"
    ]
  }
}
```

### Example 2: Personal settings (local)

`.claude/settings.local.json`:

```json
{
  "model": "claude-opus-4-6",
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
      "allowWrite": ["//tmp/build"],
      "denyRead": ["~/.aws/credentials", "~/.ssh/id_rsa"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"]
    }
  }
}
```

### Example 4: Universal starter template

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(npm run lint *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(.env*)"
    ]
  }
}
```

---

## Launch Checklist

### Permissions

- [ ] `allow`: reading (Read/Glob/Grep) + frequent commands
- [ ] `ask`: impactful actions (git push, deploy)
- [ ] `deny`: destruction (rm -rf), secrets (.env), legacy
- [ ] Globs with `**` (recursive)
- [ ] MCP with granular permissions

### Files

- [ ] `.claude/settings.json` for the team (git)
- [ ] `.claude/settings.local.json` for personal preferences (gitignored)
- [ ] `$schema` for IDE autocompletion

### Sandbox

- [ ] Enable if macOS/Linux/WSL2
- [ ] `denyRead` for credentials (`~/.aws`, `~/.ssh`)
- [ ] `allowedDomains` for the network

### Verification

- [ ] `/status` to check active settings
- [ ] Test deny rules: Claude should be blocked
- [ ] Test allow rules: no unnecessary confirmation

---

## Resources

- [Official Documentation — Settings](https://code.claude.com/docs/en/settings)
- [Official Documentation — Permissions](https://code.claude.com/docs/en/permissions)
- [JSON Schema](https://json.schemastore.org/claude-code-settings.json)
