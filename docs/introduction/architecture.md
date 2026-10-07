# Architecture du dossier .claude/

Le dossier `.claude/` est le coeur de la configuration projet. Il contient tous les composants qui étendent les capacités de Claude pour un projet spécifique : [settings](/concepts/settings), [agents](/concepts/agents), [skills](/concepts/skills), [rules](/concepts/rules), [commands](/concepts/commands). Les [hooks](/concepts/hooks) et serveurs [MCP](/concepts/mcp) sont des composants optionnels, non utilisés dans ce projet.

## Structure type

```
.claude/
├── settings.json          # Permissions allow/ask/deny
├── settings.local.json    # Preferences personnelles (gitignore)
├── agents/                # Sub-agents specialises
│   ├── backend-tasks-executor.md
│   ├── conformity-reporter.md
│   └── ...
├── skills/                # Connaissances et workflows (un dossier par skill, prefixe par domaine)
│   ├── sym-api-conventions/          # sym-   : conventions Symfony
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── create-entity.md
│   │       └── ...
│   ├── sym-testing-conventions/
│   ├── front-app-conventions/        # front- : conventions frontend
│   ├── front-design-conventions/
│   ├── front-testing-conventions/
│   ├── mod-analyze-legacy/           # mod-   : workflows de modernisation
│   ├── mod-migrate-feature/
│   ├── mod-generate-visualization/
│   ├── mod-generate-docs/
│   ├── mod-conformity-conventions/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── claude-code-parallel-agents/  # claude-code- : skills internes
│   └── claude-code-skill-command-model/
├── rules/                 # Injection contextuelle
│   ├── legacy-readonly.md
│   ├── symfony-api.md
│   ├── git.md
│   └── ...
└── commands/              # Slash commands (fusionne avec skills)
    ├── dev/
    │   ├── commit.md
    │   ├── php-test.md
    │   └── ...
    └── review/
        ├── symfony-review.md
        └── frontend-review.md
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
| Skills (dossier) | kebab-case préfixé (`sym-`, `front-`, `mod-`, `claude-code-`) | `sym-api-conventions/` |
| Rules | kebab-case | `legacy-readonly.md` |
| Commands | kebab-case dans sous-dossier | `dev/commit.md` |
| Références | kebab-case | `create-entity.md` |

## Dimensionnement réel

Un projet de modernisation legacy utilise typiquement :

| Composant | Quantité | Répartition |
|-----------|----------|-------------|
| Agents | 11 | 5 analyse, 2 planification, 2 implémentation, 1 reporting, 1 diagnostic |
| Skills | 12 | 4 launchers + 6 passives + 2 internes (`claude-code-`) |
| Rules | 7 | 1 globale + 6 ciblées par path |
| Commands | 8 | 6 dev + 2 review |
| Références | 41 | 15 backend + 3 testing + 9 frontend + 3 testing-fe + 4 conformity + 4 generate-docs + 3 skill-command-model |

## Ressources

- [Documentation officielle — Memory](https://code.claude.com/docs/en/memory)
- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings)
