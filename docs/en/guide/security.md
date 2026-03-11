# Security & Permissions

## Overview

Security in Claude Code relies on 4 complementary layers:

```
Layer 1: Settings (allow/deny permissions)
Layer 2: Rules (contextual reminders)
Layer 3: Hooks (active pre/post validation)
Layer 4: MCP (trust per server)
```

## Layer 1: Permissions (settings.json)

### Principle of Least Privilege

Only authorize what is necessary:

```json
{
  "permissions": {
    "allow": [
      "Read", "Glob", "Grep",
      "Bash(npm test *)",
      "Bash(git status)",
      "Bash(docker compose exec *)"
    ],
    "deny": [
      "Write(secrets/**)",
      "Edit(secrets/**)",
      "Bash(rm -rf *)",
      "Bash(curl * | bash)",
      "Bash(git push --force *)"
    ]
  }
}
```

### Critical Deny Patterns

| Pattern | Protection |
|---------|-----------|
| `Write(secrets/**)` | Prevents writing to secret files |
| `Bash(rm -rf *)` | Blocks recursive deletion |
| `Bash(curl * \| bash)` | Blocks remote code execution |
| `Bash(git push --force *)` | Prevents force push |
| `Write(.env*)` | Protects environment files |

### Protecting Source Code

For a migration project, protect the legacy as read-only:

```json
{
  "permissions": {
    "deny": [
      "Write(php-legacy/**)",
      "Edit(php-legacy/**)"
    ]
  }
}
```

## Layer 2: Security Rules

Reminders automatically injected for sensitive areas:

```markdown
---
paths:
  - "infrastructure/**"
---

# Infrastructure — Critical Zone

- NEVER modify Terraform files without manual review
- NEVER delete cloud resources
- Propose changes, wait for explicit validation
```

## Layer 3: Validation Hooks

### Block Dangerous Commands

```bash
#!/bin/bash
# security-gate.sh — referenced from settings.json

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Command blacklist
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
    echo "BLOCKED: dangerous pattern detected: $pattern" >&2
    exit 2
  fi
done

exit 0
```

### Detect Secrets in Code

```bash
#!/bin/bash
# secret-scanner.sh — referenced from settings.json

INPUT=$(cat)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')

SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'           # AWS Access Key
  'sk-[a-zA-Z0-9]{48}'         # OpenAI API Key
  'ghp_[a-zA-Z0-9]{36}'        # GitHub PAT
  'xoxb-[0-9]+-[a-zA-Z0-9]+'   # Slack Bot Token
  'password\s*=\s*["\x27][^"\x27]{8,}'  # Hardcoded password
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern"; then
    echo "BLOCKED: potential secret detected" >&2
    exit 2
  fi
done

exit 0
```

### Hook Configuration in settings.json

::: info Hooks = settings.json, not a folder
Hooks are configured in `settings.json` (`hooks` field), not in a `.claude/hooks/` folder. Referenced scripts can be placed anywhere in the project.
:::

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash scripts/security-gate.sh"
        }]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "bash scripts/secret-scanner.sh"
        }]
      }
    ]
  }
}
```

## Layer 4: MCP Security

### Server Verification

- Never install MCP servers from unverified sources
- Check the permissions of each exposed tool
- Use environment variables for tokens

### Granular MCP Permissions

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

## Security Checklist

### New Project

- [ ] `settings.json` with explicit deny rules
- [ ] Protection rule for sensitive files
- [ ] Secret convention via environment variables
- [ ] `.gitignore` including `.env`, `credentials*`, `*.pem`

### Production Project

- [ ] PreToolUse hooks to block dangerous commands
- [ ] Secret detection hooks in Write/Edit
- [ ] Granular MCP permissions
- [ ] Regular audit of allow permissions

### Team

- [ ] Managed settings at enterprise level
- [ ] Shared security review skills
- [ ] Permissions documented in CLAUDE.md
- [ ] Training on permission modes

## Permission Modes

| Situation | Recommended mode |
|-----------|-----------------|
| Initial exploration | Plan Mode (read-only) |
| Daily development | Default (per-action confirmation) |
| Established workflow with hooks | Accept Edits |
| Automated CI/CD | Don't Ask (with security hooks) |
| Dev/test only | Bypass Permissions (disables all security) |

::: danger Bypass Permissions
Disables **all** security. Can be blocked by admin via `permissions.disableBypassPermissionsMode: "disable"` in managed settings.
:::

## Layer 5: Sandbox

The sandbox isolates Bash commands from the filesystem and network (macOS, Linux, WSL2):

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
      "allowedDomains": ["github.com", "*.npmjs.org"]
    }
  }
}
```

## Resources

- [Official Documentation — Permissions](https://code.claude.com/docs/en/permissions)
- [Official Documentation — Settings](https://code.claude.com/docs/en/settings)
- [Official Documentation — Hooks](https://code.claude.com/docs/en/hooks)
