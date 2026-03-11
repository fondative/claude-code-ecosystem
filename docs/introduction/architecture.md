# Architecture du dossier .claude/

Le dossier `.claude/` est le coeur de la configuration projet. Il contient tous les composants qui étendent les capacités de Claude pour un projet spécifique.

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
│   │   └── ...
│   └── frontend-dev-conventions/
│       └── SKILL.md
├── rules/                 # Injection contextuelle
│   ├── legacy-readonly.md
│   ├── symfony-api.md
│   ├── git.md
│   └── ...
├── settings.local.json    # Preferences personnelles (gitignore)
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
| Agents | 13 | 3 analyse, 5 implémentation, 2 planification, 3 reporting |
| Skills | 8 | 4 launchers + 3 passives + 1 framework |
| Rules | 7 | 1 globale + 6 ciblées par path |
| Commands | 4 | 2 dev + 1 lint + 1 review |
| Références | 20 | 14 backend + 3 testing + 3 framework |

## Ressources

- [Documentation officielle — Memory](https://code.claude.com/docs/en/memory)
- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings)
