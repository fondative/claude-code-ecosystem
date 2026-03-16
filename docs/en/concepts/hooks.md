# Hooks

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Scripts, HTTP endpoints or LLM prompts executed before/after Claude's actions |
| **Where** | [`settings.json`](/en/concepts/settings) (`hooks` section), [skill](/en/concepts/skills)/[agent](/en/concepts/agents) frontmatter |
| **Types** | `command` (shell), `http` (POST), `prompt` (LLM) |
| **Events** | 18 execution points in the lifecycle |
| **Security** | Block dangerous commands, detect secrets, validate writes |

---

## What is a Hook?

A hook is a **script, HTTP endpoint or LLM prompt** that executes automatically at specific points in the Claude Code lifecycle. It is the callback system — validation, logging, notifications, security, without manual intervention.

```
┌──────────────────────────────────────────────────┐
│                  TOOL CYCLE                       │
│                                                  │
│  Claude wants to execute Bash("npm test")        │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐                                │
│  │ PreToolUse   │ <── validate-command.sh         │
│  │ matcher:Bash │     Exit 0 → Allowed            │
│  └──────┬───────┘     Exit 2 → BLOCKED + message  │
│         │                                        │
│         ▼ (if allowed)                           │
│  ┌──────────────┐                                │
│  │  Execution   │  npm test                      │
│  └──────┬───────┘                                │
│         │                                        │
│         ▼                                        │
│  ┌──────────────┐                                │
│  │ PostToolUse  │ <── log-action.sh               │
│  │ matcher:Bash │     Logging, notification       │
│  └──────────────┘                                │
└──────────────────────────────────────────────────┘
```

---

## How It Works

### The 18 Events

| Event | When | Can block? | Typical usage |
|-------|------|-----------|---------------|
| `SessionStart` | Session start/resume | No | Load context, env vars |
| `UserPromptSubmit` | Prompt submission | Yes | Validate/enrich prompts |
| `PreToolUse` | Before a tool | Yes | Security, validation |
| `PermissionRequest` | Permission dialog | Yes | Auto-approve/refuse |
| `PostToolUse` | After a tool (success) | No (feedback) | Logging, formatting |
| `PostToolUseFailure` | After a tool (failure) | No (feedback) | Diagnosis |
| `Notification` | Attention required | No | Sound alert, push |
| `SubagentStart` | Subagent spawn | No | Logging |
| `SubagentStop` | Subagent end | Yes | Prevent stopping |
| `Stop` | Claude turn end | Yes | Force continuation |
| `TeammateIdle` | Teammate going idle | Yes | Prevent idle |
| `TaskCompleted` | Task marked complete | Yes | Validate before completion |
| `InstructionsLoaded` | [CLAUDE.md](/en/concepts/claude-md)/[rules](/en/concepts/rules) loaded | No | Audit, observability |
| `ConfigChange` | Config modified | Yes | Block config changes |
| `WorktreeCreate` | Worktree creation | Yes | Customize creation |
| `WorktreeRemove` | Worktree removal | No | Cleanup |
| `PreCompact` | Before compaction | No | Save context |
| `SessionEnd` | Session end | No | Cleanup, analytics |

### The 3 Hook Types

| Type | Description | Usage |
|------|-------------|-------|
| `command` | Shell script (bash/sh) | Local validation, logging |
| `http` | POST JSON to an endpoint | External monitoring, API |
| `prompt` | Evaluation by an LLM model | Nuanced decisions |

### Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash .claude/hooks/security-gate.sh",
          "timeout": 10
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "bash .claude/hooks/lint-check.sh",
          "async": true
        }]
      }
    ]
  }
}
```

### Matchers (regex)

The `matcher` is a **regex**, not just a tool name:

| Pattern | Matches |
|---------|---------|
| `Bash` | Bash tool |
| `Edit\|Write` | Edit or Write |
| `Notebook.*` | Any tool starting with Notebook |
| `mcp__memory__.*` | All tools from the [MCP](/en/concepts/mcp) memory server |
| `mcp__.*__write.*` | Any "write" tool from any MCP |
| `""` or omitted | All events of this type |

::: info Events without matcher
`UserPromptSubmit`, `Stop`, `TeammateIdle`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove`, `InstructionsLoaded` do not support a matcher — they always trigger.
:::

### Command Protocol

```bash
#!/bin/bash
INPUT=$(cat)                    # JSON on stdin
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [[ "$COMMAND" == *"rm -rf /"* ]]; then
  echo "BLOCKED: destructive" >&2   # stderr = message to Claude
  exit 2                            # EXIT 2 = BLOCK
fi

exit 0                              # EXIT 0 = ALLOW
```

| Exit code | Meaning |
|-----------|---------|
| **0** | Allow (stdout = optional JSON) |
| **2** | Block (stderr = message to Claude) |
| Other | Non-blocking error (continues) |

### JSON Output (exit 0)

For finer control than exit codes, return JSON on stdout:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked"
  }
}
```

| Field | Description |
|-------|-------------|
| `continue` | `false` = Claude stops completely |
| `stopReason` | Message displayed when `continue: false` |
| `decision` | `"block"` for UserPromptSubmit, PostToolUse, Stop... |
| `hookSpecificOutput` | Rich control for PreToolUse and PermissionRequest |
| `additionalContext` | Context added to conversation (SessionStart, UserPromptSubmit) |

### Common Input Fields

All hooks receive these fields as JSON on stdin:

| Field | Description |
|-------|-------------|
| `session_id` | Session ID |
| `transcript_path` | Path to JSON transcript |
| `cwd` | Working directory |
| `permission_mode` | `default`, `plan`, `acceptEdits`, `dontAsk`, `bypassPermissions` |
| `hook_event_name` | Event name |
| `agent_id` | Subagent ID (if applicable) |
| `agent_type` | Agent type (if applicable) |

### Hook Locations

| Location | Scope | Shared |
|----------|-------|--------|
| `~/.claude/settings.json` | All your projects | No |
| `.claude/settings.json` | Project | Yes (git) |
| `.claude/settings.local.json` | Project (local) | No (gitignored) |
| Managed policy settings | Organization | Admin |
| [Plugin](/en/concepts/plugins) `hooks/hooks.json` | When plugin active | Yes |
| [Skill](/en/concepts/skills)/[agent](/en/concepts/agents) frontmatter | During the component | Yes |

### Hooks in Skills and Agents

Hooks can be defined in the YAML frontmatter of skills and agents. They are scoped to the component's lifecycle:

```yaml
---
name: secure-operations
description: Operations with security controls
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

### Handler Fields

| Field | Types | Description |
|-------|-------|-------------|
| `type` | all | `command`, `http`, `prompt` |
| `timeout` | all | Seconds before cancellation (default: 600 command, 30 prompt) |
| `statusMessage` | all | Spinner message during execution |
| `once` | skills | `true` = single execution per session |
| `command` | command | Shell command |
| `async` | command | `true` = background execution |
| `url` | http | POST URL |
| `headers` | http | Headers with `$VAR_NAME` interpolation |
| `allowedEnvVars` | http | Variables allowed in headers |
| `prompt` | prompt | Prompt sent to the model (`$ARGUMENTS` = input JSON) |
| `model` | prompt | Model to use |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `$CLAUDE_PROJECT_DIR` | Project root |
| `$CLAUDE_PLUGIN_ROOT` | Plugin root |
| `$CLAUDE_ENV_FILE` | File to persist env vars (SessionStart only) |
| `$CLAUDE_CODE_REMOTE` | `"true"` in remote environment |

---

## Practical Guide: Designing Your Hooks

### When to Use a Hook?

```
Is the need STATIC (always the same pattern)?
├── YES → [settings.json](/en/concepts/settings) deny (simpler)
└── NO
    Need to ANALYZE the content?
    ├── YES → Hook PreToolUse
    └── NO
        After the action?
        ├── YES → Hook PostToolUse
        └── NO → Hook PreToolUse
```

| Need | Component | Why |
|------|-----------|-----|
| Block `rm -rf` | **[Settings](/en/concepts/settings) deny** | Static, zero latency |
| Block `curl \| bash` with context | **Hook PreToolUse** | Dynamic logic |
| Scan secrets in Write | **Hook PreToolUse** | Content analysis |
| Log actions | **Hook PostToolUse** | After execution |
| Sound alert | **Hook Notification** | User feedback |
| Enrich prompt | **Hook UserPromptSubmit** | Add context |
| Environment at startup | **Hook SessionStart** | Variables, setup |

### Security Layers

```
Layer 1: [settings.json](/en/concepts/settings) deny  (static, zero latency)
Layer 2: [Rules](/en/concepts/rules)                  (contextual reminders)
Layer 3: Hooks PreToolUse                             (dynamic validation)
Layer 4: [MCP](/en/concepts/mcp) permissions          (external tools)
```

### Warnings

#### ⚠️ `WARN-001` : Forgetting exit 0

Without an explicit exit, hook behavior is unpredictable.

::: danger Problem
```bash
# ❌ — No explicit exit → unpredictable behavior
INPUT=$(cat)
# ... verification ...
```
The script terminates without a defined return code.
:::

::: info Solution
```bash
# ✅ — ALWAYS end with exit 0
INPUT=$(cat)
# ... verification ...
exit 0
```
An explicit exit 0 guarantees that the hook allows the action.
:::

---

#### ⚠️ `WARN-002` : Hook too slow

A blocking PreToolUse hook must respond quickly to avoid penalizing every Claude action.

::: danger Problem
```bash
# ❌ SLOW — Network call on every action
curl -s https://api.external.com/validate "$COMMAND"
```
A synchronous network call can block for several seconds on each tool use.
:::

::: info Solution
```bash
# ✅ FAST — Local verification
echo "$COMMAND" | grep -qE 'rm -rf /' && exit 2
exit 0
```
A PreToolUse hook should execute in < 1 second.
:::

---

#### ⚠️ `WARN-003` : Script not executable

A script without execute permission fails silently or raises a cryptic error.

::: danger Problem
```bash
# ❌
$ ls -la security-gate.sh
-rw-r--r-- security-gate.sh
```
The script cannot be launched by Claude Code.
:::

::: info Solution
```bash
# ✅
$ chmod +x security-gate.sh
```
Always check permissions after creating a hook.
:::

---

#### ⚠️ `WARN-004` : Matcher too broad

An overly permissive matcher triggers the hook on every action, including those that don't need it.

::: danger Problem
```json
// ❌ — Triggers on ALL actions
{ "matcher": ".*" }
```
The hook runs for every tool, adding unnecessary latency.
:::

::: info Solution
```json
// ✅ — Only on Bash
{ "matcher": "Bash" }
```
Use a precise regex to target only the relevant tools.
:::

---

#### ⚠️ `WARN-005` : Mixing exit code and JSON

Combining exit 2 with JSON output produces an unexpected result: the JSON is ignored.

::: danger Problem
```bash
# ❌ — Exit 2 + JSON → the JSON is IGNORED
echo '{"decision":"block"}' && exit 2
```
When exit 2 is used, Claude reads stderr — the JSON on stdout is ignored.
:::

::: info Solution
```bash
# ✅ — Choose one OR the other
# Exit code method:
echo "Block reason" >&2 && exit 2
# JSON method:
echo '{"decision":"block","reason":"..."}' && exit 0
```
Choose a single method: exit code (simple) or JSON stdout (fine-grained control).
:::

---

## Advanced Control

### The `/hooks` Menu

Typing `/hooks` in Claude Code opens the interactive manager:
- View all active hooks with their source (`[User]`, `[Project]`, `[Local]`, `[Plugin]`)
- Add/remove hooks without editing JSON
- Enable/disable all hooks

### Disabling Hooks

```json
{ "disableAllHooks": true }
```

::: warning Enterprise
`allowManagedHooksOnly` blocks user/project/plugin hooks. Only managed policy hooks remain active. `disableAllHooks` at managed level disables **everything**.
:::

### Security: Snapshot at Startup

Hooks are captured at session startup. Mid-session modifications are detected and require review in the `/hooks` menu before being applied. This prevents malicious mid-session modifications.

### SessionStart: Persisting Variables

`CLAUDE_ENV_FILE` lets you persist environment variables for the entire session:

```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG_LOG=true' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

### Advanced Patterns

#### Velocity governor (rate limiting)

A `PreToolUse` hook that blocks if too many actions are executed in a short time, preventing runaway loops:

```bash
#!/bin/bash
LOG="/tmp/claude-velocity.log"
NOW=$(date +%s)
echo "$NOW" >> "$LOG"
# Count actions in the last 10 seconds
COUNT=$(awk -v threshold=$((NOW-10)) '$1 > threshold' "$LOG" | wc -l)
if [ "$COUNT" -gt 20 ]; then
  echo "Too many actions in 10s ($COUNT). Slow down." >&2
  exit 2
fi
exit 0
```

#### Auto-checkpoint (automatic git commit)

A `PostToolUse` hook on `Write|Edit` that creates an automatic commit after each modification, allowing rollback:

```bash
#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
git add -A && git commit -m "auto-checkpoint: $(date +%H:%M:%S)" --no-verify -q 2>/dev/null
exit 0
```

---

## Concrete Examples

### Example 1: Block dangerous commands

```bash
#!/bin/bash
# .claude/hooks/security-gate.sh

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

BLOCKED_PATTERNS=(
  'rm -rf /'
  'curl.*| bash'
  'wget.*| sh'
  'chmod 777'
  'git push.*--force.*main'
  'DROP TABLE'
  'DROP DATABASE'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    echo "BLOCKED: dangerous pattern: $pattern" >&2
    exit 2
  fi
done

exit 0
```

### Example 2: Scan for secrets

```bash
#!/bin/bash
# .claude/hooks/secret-scanner.sh

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'             # AWS Access Key
  'sk-[a-zA-Z0-9]{48}'           # OpenAI API Key
  'ghp_[a-zA-Z0-9]{36}'          # GitHub PAT
  'xoxb-[0-9]+-[a-zA-Z0-9]+'     # Slack Bot Token
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern"; then
    echo "BLOCKED: potential secret" >&2
    exit 2
  fi
done

exit 0
```

### Example 3: Sound notification

```bash
#!/bin/bash
# macOS
afplay /System/Library/Sounds/Ping.aiff &
```

### Example 4: HTTP hook with auth

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "http",
        "url": "http://localhost:8080/hooks/pre-tool-use",
        "timeout": 30,
        "headers": {
          "Authorization": "Bearer $MY_TOKEN"
        },
        "allowedEnvVars": ["MY_TOKEN"]
      }]
    }]
  }
}
```

### Example 5: Complete configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/security-gate.sh" }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/secret-scanner.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/lint-check.sh", "async": true }]
      }
    ],
    "Notification": [
      {
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/notify.sh" }]
      }
    ]
  }
}
```

---

## Launch Checklist

### Security

- [ ] PreToolUse on `Bash`: dangerous commands
- [ ] PreToolUse on `Write|Edit`: secrets
- [ ] Pair with [`settings.json` deny](/en/concepts/settings) for static blocks

### Scripts

- [ ] `chmod +x` on all scripts
- [ ] ALWAYS explicit `exit 0` at end of script
- [ ] Execution < 1s for PreToolUse (use `async: true` if long)
- [ ] Test: `echo '{"tool_input":{"command":"rm -rf /"}}' | bash hook.sh`

### Configuration

- [ ] Precise matchers (regex, not `*`)
- [ ] Choose exit code OR JSON, not both
- [ ] `timeout` for external hooks (HTTP, prompt)

### Organization

- [ ] Scripts in `.claude/hooks/` (versioned)
- [ ] Project hooks in `.claude/settings.json` (team)
- [ ] Personal hooks in `~/.claude/settings.json`
- [ ] Sensitive hooks in `.claude/settings.local.json` (gitignored)

---

## Resources

- [Official Documentation — Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Official Documentation — Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
