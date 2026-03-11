# .claude/ Directory Architecture

The `.claude/` directory is the heart of the project configuration. It contains all the components that extend Claude's capabilities for a specific project.

## Typical Structure

```
.claude/
├── settings.json          # Allow/deny permissions
├── settings.local.json    # Personal preferences (gitignored)
├── agents/                # Specialized sub-agents
│   ├── backend-tasks-executor.md
│   ├── conformity-reporter.md
│   └── ...
├── skills/                # Knowledge and workflows
│   ├── symfony/
│   │   ├── api-conventions/
│   │   │   ├── SKILL.md
│   │   │   └── references/
│   │   │       ├── create-entity.md
│   │   │       └── ...
│   │   └── testing-conventions/
│   │       ├── SKILL.md
│   │       └── references/
│   ├── modernization/
│   │   ├── migrate-feature/
│   │   │   └── SKILL.md
│   │   └── ...
│   └── frontend-dev-conventions/
│       └── SKILL.md
├── rules/                 # Contextual injection
│   ├── legacy-readonly.md
│   ├── symfony-api.md
│   ├── git.md
│   └── ...
├── settings.local.json    # Personal preferences (gitignored)
└── commands/              # Slash commands (merged with skills)
    ├── dev/
    │   ├── commit.md
    │   └── php-test.md
    └── review/
        └── symfony-review.md
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
| Skills (folder) | kebab-case or namespace/ | `symfony/api-conventions/` |
| Rules | kebab-case | `legacy-readonly.md` |
| Commands | kebab-case in subfolder | `dev/commit.md` |
| References | kebab-case | `create-entity.md` |

## Real-World Sizing

A legacy modernization project typically uses:

| Component | Count | Distribution |
|-----------|-------|-------------|
| Agents | 13 | 3 analysis, 5 implementation, 2 planning, 3 reporting |
| Skills | 8 | 4 launchers + 3 passive + 1 framework |
| Rules | 7 | 1 global + 6 path-targeted |
| Commands | 4 | 2 dev + 1 lint + 1 review |
| References | 20 | 14 backend + 3 testing + 3 framework |

## Resources

- [Official Documentation — Memory](https://code.claude.com/docs/en/memory)
- [Official Documentation — Settings](https://code.claude.com/docs/en/settings)
