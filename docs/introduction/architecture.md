# Architecture du dossier .claude/

::: tip Ce que vous trouverez sur cette page
Où Claude Code va chercher sa configuration, dans **n'importe quel projet** : les fichiers et dossiers reconnus, ce qu'ils contiennent, ce qui se versionne ou non, et comment vérifier ce que Claude a chargé. Si les briques (rules, skills, agents…) ne vous parlent pas encore, lisez d'abord [Philosophie & Vision](/introduction/).
:::

::: info Cette page est générique
Pour l'exemple complet d'un vrai projet (11 agents, 12 skills, 7 rules), voir [Structure du projet .claude/](/examples/project-structure) dans le Manuel d'utilisation.
:::

## Deux emplacements : le projet et votre dossier personnel

Claude Code lit sa configuration à deux endroits principaux. Les dossiers ont la **même organisation** ; seule la portée change.

| Emplacement | Portée | Versionné ? | Usage typique |
|-------------|--------|-------------|---------------|
| `.claude/` à la racine du dépôt | Toute l'équipe, dans ce projet | Oui (sauf les fichiers `*.local.*`) | Conventions du projet, agents et skills métier, permissions partagées |
| `~/.claude/` dans votre dossier personnel | Vous, dans tous vos projets | Non | Préférences personnelles, skills et agents que vous réutilisez partout |

Une organisation peut en plus imposer une configuration *managed*, déployée par l'administrateur. Quand une même chose est définie à plusieurs endroits, la règle de priorité dépend de la brique : voir [Philosophie & Vision](/introduction/#ou-vivent-les-configurations-et-qui-l-emporte).

## Structure type d'un projet

```
<racine du dépôt>/
├── CLAUDE.md                  # Instructions permanentes du projet (versionné)
├── CLAUDE.local.md            # Vos instructions personnelles pour ce projet (non versionné)
├── .mcp.json                  # Serveurs MCP partagés (optionnel, versionné)
└── .claude/
    ├── settings.json          # Permissions et réglages partagés (versionné)
    ├── settings.local.json    # Vos réglages personnels pour ce projet (non versionné)
    ├── rules/                 # Consignes ciblées, un fichier .md par thème
    │   └── testing.md
    ├── skills/                # Un dossier par skill
    │   └── deploy/
    │       ├── SKILL.md       #   fichier principal (frontmatter + instructions)
    │       └── references/    #   documents complémentaires, lus à la demande
    ├── agents/                # Un fichier .md par sous-agent
    │   └── code-reviewer.md
    ├── commands/              # Ancien format des skills (toujours lu)
    │   └── deploy.md
    ├── output-styles/         # Styles de réponse personnalisés (optionnel)
    └── agent-memory/          # Mémoire des sous-agents qui ont le champ memory: project (optionnel)
```

Aucun de ces éléments n'est obligatoire : Claude Code fonctionne sans configuration. On ajoute une brique quand on en a besoin. La commande `/init` génère un premier `CLAUDE.md` à partir du code du projet.

## Rôle de chaque élément

| Élément | Contenu | Chargé… | Page |
|---------|---------|---------|------|
| `CLAUDE.md` | Stack, commandes utiles, conventions, chemins importants | Au début de chaque session | [CLAUDE.md](/concepts/claude-md) |
| `CLAUDE.local.md` | Vos préférences pour ce projet (URL de test, raccourcis…) | Au début de chaque session, après `CLAUDE.md` | [CLAUDE.md](/concepts/claude-md) |
| `settings.json` / `settings.local.json` | Permissions `allow` / `ask` / `deny`, modèle, hooks, variables d'environnement | En permanence | [Settings](/concepts/settings) |
| `rules/*.md` | Consigne courte sur un thème ; le champ `paths` la limite à certains fichiers | Sans `paths` : au démarrage. Avec `paths` : quand Claude touche un fichier qui correspond | [Rules](/concepts/rules) |
| `skills/<nom>/SKILL.md` | Procédure ou savoir-faire, avec ses fichiers annexes | Seuls le nom et la description sont chargés au démarrage ; le contenu l'est à l'invocation (par vous avec `/nom`, ou par Claude) | [Skills](/concepts/skills) |
| `agents/<nom>.md` | Sous-agent spécialisé : description, outils, modèle, instructions | Quand Claude ou une skill lui délègue une tâche | [Agents](/concepts/agents) |
| `commands/<nom>.md` | Ancien format de skill déclenchée par `/nom` | Comme une skill | [Commands](/concepts/commands) |
| `.mcp.json` | Liste des serveurs MCP du projet (Claude demande votre accord au premier usage) | Au démarrage | [MCP](/concepts/mcp) |

::: warning `commands/` : ancien format
Les fichiers de `commands/` fonctionnent toujours, mais on écrit désormais des **skills**, qui offrent plus d'options. Un sous-dossier devient un préfixe séparé par `:` : `commands/dev/commit.md` s'invoque avec `/dev:commit`. → [Migrer commands → skills](/examples/project-structure#commands-du-projet)
:::

Les **hooks** n'ont pas de dossier dédié : ils se déclarent dans la section `hooks` de `settings.json` (les scripts qu'ils appellent peuvent être rangés où vous voulez, par exemple `.claude/hooks/`). Les **plugins** s'installent avec `/plugin` et apportent leurs propres skills, agents, hooks et serveurs MCP. → [Hooks](/concepts/hooks) · [Plugins](/concepts/plugins)

## Comment les briques s'enchaînent

```
Démarrage de la session
  ├── CLAUDE.md, CLAUDE.local.md, rules sans « paths »  → chargés dans le contexte
  ├── noms et descriptions des skills et des agents      → chargés (le contenu attend)
  └── settings.json                                      → appliqué à chaque action

Pendant le travail
  ├── Claude touche src/api/user.ts   → les rules dont « paths » correspond s'ajoutent
  ├── vous tapez /deploy              → le contenu de la skill deploy est chargé
  ├── Claude délègue une revue        → le sous-agent code-reviewer démarre
  │                                      dans son propre contexte, avec les skills
  │                                      listées dans son champ « skills: »
  └── chaque action (lecture, édition, commande)
                                      → vérifiée par les permissions et les hooks
```

## Conventions de nommage recommandées

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Agents | kebab-case (minuscules et tirets), nom qui décrit le rôle | `code-reviewer.md` |
| Skills (dossier) | kebab-case ; un préfixe par domaine aide quand il y en a beaucoup | `deploy/`, `api-conventions/` |
| Rules | kebab-case, un thème par fichier | `testing.md` |
| Références de skill | kebab-case, dans `references/` | `create-entity.md` |

Évitez de donner à une skill le nom d'une commande intégrée (`/code-review`, `/init`…) : la vôtre la remplacerait.

## Vérifier ce que Claude a chargé

| Question | Commande |
|----------|----------|
| Quels CLAUDE.md, rules et fichiers mémoire sont dans le contexte ? | `/context` (section *Memory files*), `/memory` |
| Quelles skills sont disponibles ? | `/skills`, ou tapez `/` pour voir le menu |
| Quels sous-agents tournent ? | `/tasks` |
| Quelles permissions s'appliquent ? | `/permissions` |
| Quels serveurs MCP sont connectés ? | `/mcp` |
| La configuration a-t-elle un problème ? | `/doctor` |

## Ressources

- [Structure du projet .claude/](/examples/project-structure) — l'exemple complet du projet de modernisation
- [Philosophie & Vision](/introduction/) — les briques et leurs règles de priorité
- [Documentation officielle — Mémoire et CLAUDE.md](https://code.claude.com/docs/en/memory)
- [Documentation officielle — Settings](https://code.claude.com/docs/en/settings)
- [Documentation officielle — Skills](https://code.claude.com/docs/en/skills)
- [Documentation officielle — Sous-agents](https://code.claude.com/docs/en/sub-agents)
