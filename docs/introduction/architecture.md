# Architecture du dossier .claude/

Le dossier `.claude/` est le coeur de la configuration projet. Il contient tous les composants qui étendent les capacités de Claude pour un projet spécifique : [settings](/concepts/settings), [agents](/concepts/agents), [skills](/concepts/skills), [rules](/concepts/rules), [commands](/concepts/commands), [hooks](/concepts/hooks) et [MCP](/concepts/mcp).

## Structure type

```
.claude/
├── settings.json          # Permissions allow/deny
├── settings.local.json    # Preferences personnelles (gitignore)
├── agents/                # Sub-agents specialises
│   ├── backend-tasks-executor.md
│   ├── conformity-reporter.md
│   └── ...
├── skills/                # Connaissances et workflows
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
│   │   ├── conformity-conventions/
│   │   │   ├── SKILL.md
│   │   │   └── references/
│   │   └── ...
│   └── frontend/
│       ├── app-conventions/
│       │   ├── SKILL.md
│       │   └── references/
│       ├── design-conventions/
│       │   └── SKILL.md
│       └── testing-conventions/
│           ├── SKILL.md
│           └── references/
├── rules/                 # Injection contextuelle
│   ├── legacy-readonly.md
│   ├── symfony-api.md
│   ├── git.md
│   └── ...
└── commands/              # Slash commands (fusionne avec skills)
    ├── dev/
    │   ├── commit.md
    │   └── php-test.md
    └── review/
        └── symfony-review.md
```

## Relations entre composants

```
CLAUDE.md (source de verite des chemins)
    │
    ├── settings.json (permissions)
    │
    ├── rules/ ──────► Injectes automatiquement selon paths: glob
    │
    ├── skills/
    │   ├── Passives ──► Chargees par agents via frontmatter skills:
    │   └── Launchers ─► Invoquees par /nom depuis le terminal
    │
    ├── agents/ ─────► Spawnes par les skills launchers ou Agent tool
    │                   Heritent des skills declarees
    │
    └── commands/ ───► Fusionnes avec skills (meme frontmatter)
```

## Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Agents | kebab-case | `backend-tasks-executor.md` |
| Skills (dossier) | kebab-case ou namespace/ | `symfony/api-conventions/` |
| Rules | kebab-case | `legacy-readonly.md` |
| Commands | kebab-case dans sous-dossier | `dev/commit.md` |
| Références | kebab-case | `create-entity.md` |

## Dimensionnement réel

Un projet de modernisation legacy utilise typiquement :

| Composant | Quantité | Répartition |
|-----------|----------|-------------|
| Agents | 12 | 5 analyse, 2 implémentation, 2 planification, 2 reporting, 1 diagnostic |
| Skills | 11 | 4 launchers + 6 passives + 1 framework |
| Rules | 7 | 1 globale + 6 ciblées par path |
| Commands | 5 | 3 dev + 2 review |
| Références | 34 | 15 backend + 3 testing + 9 frontend + 3 testing-fe + 4 conformity |

## Ressources

- [Documentation officielle — Memory](https://code.claude.com/docs/en/memory)
- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings)
