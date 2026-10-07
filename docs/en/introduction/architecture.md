# .claude/ Directory Architecture

The `.claude/` directory is the heart of the project configuration. It contains all the components that extend Claude's capabilities for a specific project: [settings](/en/concepts/settings), [agents](/en/concepts/agents), [skills](/en/concepts/skills), [rules](/en/concepts/rules), [commands](/en/concepts/commands). [Hooks](/en/concepts/hooks) and [MCP](/en/concepts/mcp) servers are optional components, not used in this project.

## Typical Structure

```
.claude/
├── settings.json          # Allow/ask/deny permissions
├── settings.local.json    # Personal preferences (gitignored)
├── agents/                # Specialized sub-agents
│   ├── backend-tasks-executor.md
│   ├── conformity-reporter.md
│   └── ...
├── skills/                # Knowledge and workflows (one folder per skill, domain-prefixed)
│   ├── sym-api-conventions/          # sym-   : Symfony conventions
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── create-entity.md
│   │       └── ...
│   ├── sym-testing-conventions/
│   ├── front-app-conventions/        # front- : frontend conventions
│   ├── front-design-conventions/
│   ├── front-testing-conventions/
│   ├── mod-analyze-legacy/           # mod-   : modernization workflows
│   ├── mod-migrate-feature/
│   ├── mod-generate-visualization/
│   ├── mod-generate-docs/
│   ├── mod-conformity-conventions/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── claude-code-parallel-agents/  # claude-code- : internal skills
│   └── claude-code-skill-command-model/
├── rules/                 # Contextual injection
│   ├── legacy-readonly.md
│   ├── symfony-api.md
│   ├── git.md
│   └── ...
└── commands/              # Slash commands (merged with skills)
    ├── dev/
    │   ├── commit.md
    │   ├── php-test.md
    │   └── ...
    └── review/
        ├── symfony-review.md
        └── frontend-review.md
```

## Relationships Between Components

```
CLAUDE.md (single source of truth for paths)
    │
    ├── settings.json (permissions)
    │
    ├── rules/ ──────► Automatically injected based on paths: glob
    │
    ├── skills/
    │   ├── Passive ──► Loaded by agents via frontmatter skills:
    │   └── Launchers ─► Invoked by /name from the terminal
    │
    ├── agents/ ─────► Spawned by launcher skills or Agent tool
    │                   Inherit declared skills
    │
    └── commands/ ───► Merged with skills (same frontmatter)
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Agents | kebab-case | `backend-tasks-executor.md` |
| Skills (folder) | prefixed kebab-case (`sym-`, `front-`, `mod-`, `claude-code-`) | `sym-api-conventions/` |
| Rules | kebab-case | `legacy-readonly.md` |
| Commands | kebab-case in subfolder | `dev/commit.md` |
| References | kebab-case | `create-entity.md` |

## Real-World Sizing

A legacy modernization project typically uses:

| Component | Count | Distribution |
|-----------|-------|-------------|
| Agents | 11 | 5 analysis, 2 planning, 2 implementation, 1 reporting, 1 diagnostic |
| Skills | 12 | 4 launchers + 6 passive + 2 internal (`claude-code-`) |
| Rules | 7 | 1 global + 6 path-targeted |
| Commands | 8 | 6 dev + 2 review |
| References | 41 | 15 backend + 3 testing + 9 frontend + 3 testing-fe + 4 conformity + 4 generate-docs + 3 skill-command-model |

## Resources

- [Official Documentation — Memory](https://code.claude.com/docs/en/memory)
- [Official Documentation — Settings](https://code.claude.com/docs/en/settings)
