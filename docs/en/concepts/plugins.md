# Plugins

## TL;DR

| Aspect | Detail |
|--------|--------|
| **What** | Distributable packages containing [skills](/en/concepts/skills), [agents](/en/concepts/agents), [MCP servers](/en/concepts/mcp) and [hooks](/en/concepts/hooks) |
| **Where** | Installed via `claude plugins add <source>` |
| **Namespace** | `plugin-name:skill-name` — no conflict with project/user skills |
| **Scope** | Active in projects where the plugin is enabled |
| **Sharing** | Git, npm, or managed settings for team/organization distribution |

---

## What is a Plugin?

A plugin is a **portable package** that bundles Claude Code extensions ([skills](/en/concepts/skills), [agents](/en/concepts/agents), [hooks](/en/concepts/hooks), [MCP servers](/en/concepts/mcp)) into a single directory. It enables distributing a coherent set of capabilities across projects and teams.

```
┌────────────────────────────────────────┐
│              PLUGIN                     │
│                                        │
│  my-plugin/                            │
│  ├── skills/                           │
│  │   ├── review-pr/                    │
│  │   │   └── SKILL.md                  │
│  │   └── deploy/                       │
│  │       └── SKILL.md                  │
│  ├── agents/                           │
│  │   └── security-auditor.md           │
│  ├── hooks/                            │
│  │   └── hooks.json                    │
│  └── mcp/                              │
│      └── mcp.json                      │
│                                        │
│  Namespace: my-plugin:review-pr        │
│             my-plugin:deploy           │
└────────────────────────────────────────┘
```

---

## How It Works

### Plugin structure

```
my-plugin/
├── skills/                  # Plugin skills
│   ├── review-pr/
│   │   ├── SKILL.md
│   │   └── references/
│   └── deploy/
│       └── SKILL.md
├── agents/                  # Plugin agents
│   └── security-auditor.md
├── hooks/                   # Plugin hooks
│   └── hooks.json
└── mcp/                     # Plugin MCP servers
    └── mcp.json
```

All directories are optional. A plugin can contain only skills, or only agents.

### Namespace and priority

Plugins use a `plugin-name:skill-name` namespace to avoid conflicts:

```bash
# Invoke a plugin skill
/my-plugin:review-pr

# Project/user skills are NOT affected
/review-pr    # → project skill, not the plugin
```

| Scope | Priority | Can conflict |
|-------|----------|-------------|
| Enterprise (managed) | 1 (highest) | Yes (overrides all) |
| Personal (`~/.claude/`) | 2 | Yes (overrides project) |
| Project (`.claude/`) | 3 | Yes (overrides plugin) |
| **Plugin** | 4 (lowest) | **No** (isolated namespace) |

### Installation

```bash
# From a git repository
claude plugins add https://github.com/org/my-plugin

# From a local path
claude plugins add ./path/to/plugin

# List installed plugins
claude plugins list

# Remove a plugin
claude plugins remove my-plugin
```

### Managing plugins

```bash
# Reload plugins without restarting
/reload-plugins

# View plugin skills and agents in the menu
/agents    # Also shows plugin agents
```

---

## Practical Guide: Designing a Plugin

### When to create a plugin?

```
Are the extensions specific to ONE project?
├── YES → .claude/skills/ + .claude/agents/ (no plugin needed)
│
└── NO
    Shared within YOUR team only?
    ├── YES → Plugin in a private git repo
    │
    └── NO → Published open source?
        ├── YES → Plugin on GitHub/npm
        └── NO → Managed settings (organization)
```

### Best practices

| Do | Don't |
|----|-------|
| One plugin = one coherent domain | A catch-all "utils" plugin |
| Descriptive namespace (`security`, `devops`) | Generic namespace (`tools`, `helpers`) |
| README at plugin root | No documentation |
| Skills with detailed `description` | Skills without description |
| Hooks with explicit `timeout` | Hooks without timeout |

### [Hooks](/en/concepts/hooks) in a plugin

Plugin [hooks](/en/concepts/hooks) are defined in `hooks/hooks.json`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "bash $CLAUDE_PLUGIN_ROOT/scripts/validate.sh"
      }]
    }
  ]
}
```

::: tip `$CLAUDE_PLUGIN_ROOT`
The `$CLAUDE_PLUGIN_ROOT` variable points to the plugin root directory. Useful for referencing scripts relative to the plugin.
:::

### [MCP](/en/concepts/mcp) in a plugin

```json
{
  "mcpServers": {
    "plugin-db": {
      "command": "node",
      "args": ["$CLAUDE_PLUGIN_ROOT/mcp/db-server.js"]
    }
  }
}
```

---

## Distribution

### Per project (version control)

```bash
# Add as git submodule
git submodule add https://github.com/org/security-plugin .claude/plugins/security

# Or simply copy into the repo
cp -r ~/plugins/security .claude/plugins/security
```

### Per organization (managed settings)

Administrators can deploy plugins for all users via [managed settings](/en/concepts/settings):

```json
{
  "plugins": [
    "https://github.com/org/company-standards-plugin"
  ]
}
```

### Open source publication

```
my-plugin/
├── README.md           # Documentation
├── LICENSE
├── skills/
├── agents/
└── hooks/
```

---

## Concrete Examples

### Example 1: Security plugin

```
security-plugin/
├── skills/
│   └── security-audit/
│       ├── SKILL.md
│       └── references/
│           └── owasp-top-10.md
├── agents/
│   └── vulnerability-scanner.md
└── hooks/
    └── hooks.json          # PreToolUse: detect secrets
```

### Example 2: DevOps plugin

```
devops-plugin/
├── skills/
│   ├── deploy/
│   │   └── SKILL.md
│   └── rollback/
│       └── SKILL.md
├── agents/
│   └── infra-reviewer.md
└── mcp/
    └── mcp.json            # MCP server for monitoring
```

---

## Launch Checklist

### Structure

- [ ] Each skill in `skills/<name>/SKILL.md`
- [ ] Each agent in `agents/<name>.md`
- [ ] Hooks in `hooks/hooks.json`
- [ ] MCP in `mcp/mcp.json`

### Quality

- [ ] Detailed `description` on every skill and agent
- [ ] `$CLAUDE_PLUGIN_ROOT` for relative paths
- [ ] Timeouts on hooks
- [ ] README at root

### Distribution

- [ ] Plugin tested locally (`claude plugins add ./`)
- [ ] Clear and descriptive namespace
- [ ] No conflict with common skill names

---

## Resources

- [Official Documentation — Plugins](https://code.claude.com/docs/en/plugins)
- [Official Documentation — Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
