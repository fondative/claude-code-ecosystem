# Plugins

## TL;DR

| Aspect | Detail |
|--------|--------|
| **Quoi** | Packages distribuables contenant [skills](/concepts/skills), [agents](/concepts/agents), [MCP servers](/concepts/mcp) et [hooks](/concepts/hooks) |
| **Ou** | Installes via `claude plugins add <source>` |
| **Namespace** | `plugin-name:skill-name` — pas de conflit avec les skills projet/user |
| **Scope** | Actifs dans les projets ou le plugin est active |
| **Partage** | Git, npm, ou managed settings pour distribution equipe/organisation |

---

## Qu'est-ce qu'un Plugin ?

Un plugin est un **package portable** qui regroupe des extensions Claude Code ([skills](/concepts/skills), [agents](/concepts/agents), [hooks](/concepts/hooks), [MCP servers](/concepts/mcp)) dans un repertoire unique. Il permet de distribuer un ensemble coherent de capacites a travers des projets et des equipes.

```
┌────────────────────────────────────────┐
│              PLUGIN                     │
│                                        │
│  mon-plugin/                           │
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
│  Namespace: mon-plugin:review-pr       │
│             mon-plugin:deploy          │
└────────────────────────────────────────┘
```

---

## Comment ca marche

### Structure d'un plugin

```
mon-plugin/
├── skills/                  # Skills du plugin
│   ├── review-pr/
│   │   ├── SKILL.md
│   │   └── references/
│   └── deploy/
│       └── SKILL.md
├── agents/                  # Agents du plugin
│   └── security-auditor.md
├── hooks/                   # Hooks du plugin
│   └── hooks.json
└── mcp/                     # Serveurs MCP du plugin
    └── mcp.json
```

Tous les repertoires sont optionnels. Un plugin peut ne contenir que des skills, ou que des agents.

### Namespace et priorite

Les plugins utilisent un namespace `plugin-name:skill-name` pour eviter les conflits :

```bash
# Invoquer une skill de plugin
/mon-plugin:review-pr

# Les skills projet/user ne sont PAS affectees
/review-pr    # → skill projet, pas le plugin
```

| Scope | Priorite | Conflit possible |
|-------|----------|-----------------|
| Enterprise (managed) | 1 (plus haute) | Oui (ecrase tout) |
| Personnel (`~/.claude/`) | 2 | Oui (ecrase projet) |
| Projet (`.claude/`) | 3 | Oui (ecrase plugin) |
| **Plugin** | 4 (plus basse) | **Non** (namespace isole) |

### Installation

```bash
# Depuis un depot git
claude plugins add https://github.com/org/my-plugin

# Depuis un chemin local
claude plugins add ./path/to/plugin

# Lister les plugins installes
claude plugins list

# Supprimer un plugin
claude plugins remove my-plugin
```

### Gestion des plugins

```bash
# Recharger les plugins sans redemarrer
/reload-plugins

# Voir les skills et agents d'un plugin dans le menu
/agents    # Affiche aussi les agents de plugins
```

---

## Guide pratique : concevoir un plugin

### Quand creer un plugin ?

```
Les extensions sont-elles specifiques a UN projet ?
├── OUI → .claude/skills/ + .claude/agents/ (pas de plugin)
│
└── NON
    Partagees entre VOTRE equipe uniquement ?
    ├── OUI → Plugin dans un repo git prive
    │
    └── NON → Publiees en open source ?
        ├── OUI → Plugin sur GitHub/npm
        └── NON → Managed settings (organisation)
```

### Bonnes pratiques

| Faire | Ne pas faire |
|-------|-------------|
| Un plugin = un domaine coherent | Un plugin fourre-tout "utils" |
| Namespace descriptif (`security`, `devops`) | Namespace generique (`tools`, `helpers`) |
| README a la racine du plugin | Pas de documentation |
| Skills avec `description` detaillee | Skills sans description |
| Hooks avec `timeout` explicite | Hooks sans timeout |

### [Hooks](/concepts/hooks) dans un plugin

Les [hooks](/concepts/hooks) de plugin sont definis dans `hooks/hooks.json` :

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
La variable `$CLAUDE_PLUGIN_ROOT` pointe vers la racine du plugin. Utile pour referencer des scripts relatifs au plugin.
:::

### [MCP](/concepts/mcp) dans un plugin

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

### Par projet (version control)

```bash
# Ajouter comme sous-module git
git submodule add https://github.com/org/security-plugin .claude/plugins/security

# Ou simplement copier dans le repo
cp -r ~/plugins/security .claude/plugins/security
```

### Par organisation (managed settings)

Les administrateurs peuvent deployer des plugins pour tous les utilisateurs via les [managed settings](/concepts/settings) :

```json
{
  "plugins": [
    "https://github.com/org/company-standards-plugin"
  ]
}
```

### Publication open source

```
my-plugin/
├── README.md           # Documentation
├── LICENSE
├── skills/
├── agents/
└── hooks/
```

---

## Exemples concrets

### Exemple 1 : Plugin de securite

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

### Exemple 2 : Plugin DevOps

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
    └── mcp.json            # Serveur MCP pour monitoring
```

---

## Checklist de lancement

### Structure

- [ ] Chaque skill dans `skills/<nom>/SKILL.md`
- [ ] Chaque agent dans `agents/<nom>.md`
- [ ] Hooks dans `hooks/hooks.json`
- [ ] MCP dans `mcp/mcp.json`

### Qualite

- [ ] `description` detaillee sur chaque skill et agent
- [ ] `$CLAUDE_PLUGIN_ROOT` pour les chemins relatifs
- [ ] Timeouts sur les hooks
- [ ] README a la racine

### Distribution

- [ ] Plugin teste localement (`claude plugins add ./`)
- [ ] Namespace clair et descriptif
- [ ] Pas de conflit avec les noms de skills courants

---

## Ressources

- [Documentation officielle — Plugins](https://code.claude.com/docs/en/plugins)
- [Documentation officielle — Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
