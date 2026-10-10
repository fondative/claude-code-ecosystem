# Cheatsheet

Aide-mémoire rapide — tout ce qu'il faut en 2 minutes.

Valable pour n'importe quel projet. <span class="chez-nous">Chez nous</span> les commandes propres au projet de modernisation sont décrites dans [Commands du projet](/examples/project-structure#commands-du-projet).

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Esc` | Interrompre Claude ou fermer un dialogue (le travail déjà fait est conservé) |
| `Esc` `Esc` | Saisie vide : ouvrir le menu de rewind (checkpoints) |
| `Shift+Tab` | Cycler les [modes de permission](/reference/glossary#modes-de-permission) (`Alt+M` sous Windows dans certains terminaux) |
| `Ctrl+C` | Interrompre l'opération en cours (si rien ne tourne : vider la saisie, puis quitter au 2e appui) |
| `Ctrl+B` | Passer en arrière-plan les commandes Bash et agents en cours |
| `Ctrl+O` | Afficher/masquer le transcript détaillé (appels d'outils) |

Liste complète : [raccourcis (doc officielle)](https://code.claude.com/docs/en/interactive-mode).

## Commandes intégrées

| Commande | Action |
|----------|--------|
| `/init` | Générer un CLAUDE.md initial pour le projet |
| `/clear` | Démarrer une nouvelle conversation au contexte vide (l'ancienne reste accessible via `/resume`) |
| `/compact [instructions]` | Libérer du contexte en résumant la conversation |
| `/context` | Visualiser l'utilisation du contexte et les fichiers mémoire chargés |
| `/resume` | Reprendre une conversation |
| `/rewind` | Revenir à un point antérieur (conversation et/ou code) — n'annule pas les commandes ni les agents ([`/rewind` ou git ?](/concepts/which-mechanism#annuler-une-erreur-rewind-ou-git)) |
| `/model` · `/effort` | Changer de modèle · régler le niveau d'effort |
| `/memory` | Éditer les fichiers CLAUDE.md et gérer l'[auto memory](/reference/glossary#auto-memory) |
| `/permissions` | Gérer les [règles allow / ask / deny](/reference/glossary#regles-de-permission) |
| `/plan [description]` | Entrer en [mode Plan](/reference/glossary#plan-mode) (exploration en lecture seule) |
| `/diff` | Revoir les changements de l'arbre de travail |
| `/tasks` | Voir et gérer le travail en arrière-plan (shells, [subagents](/reference/glossary#agent)) |
| `/usage` | Coût de la session et limites du forfait |

Liste complète : [commandes (doc officielle)](https://code.claude.com/docs/en/commands).

## Modes de permission

| Mode | En bref |
|------|---------|
| **Manual** (`default`) | Demande avant chaque action non pré-autorisée |
| **Accept Edits** | Éditions de fichiers acceptées, le reste est demandé |
| **Plan** | Lecture et commandes en lecture seule uniquement |
| **Auto** | Un classifieur valide les actions en arrière-plan |
| **Don't Ask** | Refuse automatiquement tout ce qui n'est pas pré-autorisé |
| **Bypass** | Aucune demande — environnements isolés uniquement |

Cycler : `Shift+Tab`. Détails et choix du mode : [Quel mode de permission, à quelle étape](/concepts/which-mechanism#quel-mode-de-permission-a-quelle-etape) · [doc officielle](https://code.claude.com/docs/en/permission-modes).

## Gestion du contexte

Claude Code **compacte automatiquement** la conversation ([compaction](/reference/glossary#compaction)) quand le contexte approche de sa limite (seuil réglable avec `/autocompact`). Selon le modèle et le fournisseur, la fenêtre peut atteindre **1M tokens**. Les seuils ci-dessous sont une **recommandation** de ce wiki pour garder un raisonnement de qualité, pas une règle de l'outil :

| Seuil (recommandé) | Action |
|-------|--------|
| < 70% | Normal — travailler |
| ~70% | `/compact` — compresser en gardant l'essentiel |
| ~85% | `/compact` urgent, ou passer les tâches lourdes à des subagents |
| Changement de tâche | `/clear` — repartir sur un contexte vide |

::: tip Bonne pratique
Compacter tôt, de préférence à un point de transition, avec des instructions (`/compact garde les décisions d'architecture`). `/context` montre ce qui occupe la fenêtre. Voir [Costs (doc officielle)](https://code.claude.com/docs/en/costs).
:::

## Structure .claude/ en 30 secondes

```
.claude/
├── settings.json     # allow/ask/deny (le pare-feu)
├── agents/           # Instances spécialisées (1 fichier = 1 tâche)
├── skills/           # Connaissances + workflows (SKILL.md + references/)
├── rules/            # Contexte auto-injecté (< 30 lignes : repère recommandé)
└── commands/         # Slash commands (format historique, fusionné avec skills)
```

Définitions : [agent](/reference/glossary#agent) · [skill](/reference/glossary#skill) · [rule](/reference/glossary#rule) · [hook](/reference/glossary#hook) · [MCP](/reference/glossary#mcp).

## Formule de prompt efficace

```
QUOI : "Dans [fichier], [action précise]"
OÙ   : "lignes [N-M]" ou "[fonction/classe]"
COMMENT : contraintes, style, framework
VÉRIFIER : "lance les tests" ou "montre le diff"
```

**Exemple** :
```
Dans src/auth/login.ts, ajouter un refresh token JWT.
Suivre le pattern de src/auth/register.ts.
Lancer les tests après l'implémentation.
```

## Modèles disponibles

| Modèle | ID | Force | Coût |
|--------|----|-------|------|
| Fable 5.1 | `claude-fable-5-1` | Tâches les plus exigeantes | $$$$ |
| Opus 5.5 | `claude-opus-5-5` | Raisonnement complexe, analyse | $$$ |
| Sonnet 5.5 | `claude-sonnet-5-5` | Implémentation, planification | $$ |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | Audit, vérifications (<span class="chez-nous">Chez nous</span> auditor, health-check) | $ |

Coûts en ordre de grandeur relatif ; montants exacts : [tarifs](https://www.anthropic.com/pricing).

Alias utilisables dans `model` (settings, agents, skills) : `fable`, `opus`, `sonnet`, `haiku`, et `inherit` (reprendre le modèle de la session).

## Anti-patterns à éviter

| <Icone nom="x" /> Ne pas faire | <Icone nom="check" /> Faire |
|----------------|---------|
| Prompts vagues ("fix this") | Préciser fichier, ligne, comportement attendu |
| Accepter sans lire le diff | Toujours relire les changements (`/diff`) |
| Laisser le contexte se remplir sans contrôle | `/compact` tôt, `/clear` entre deux tâches |
| Opus pour tout | Haiku pour le simple, Sonnet pour l'implémentation |
| Un agent qui fait tout | 1 agent = 1 responsabilité |
| Conventions dans CLAUDE.md | Conventions dans les skills |

::: info Chez nous
Le projet de modernisation passe toutes les commandes backend par Docker (`docker compose exec -T app …`, sans `| cat` pour garder le code de sortie) et réserve le commit à `/dev:commit`.
Commandes `/dev:*` et `/review:*`, notation et workflow : [Commands du projet](/examples/project-structure#commands-du-projet).
:::

## Ressources

- [Documentation officielle — commandes](https://code.claude.com/docs/en/commands)
- [Documentation officielle — raccourcis et mode interactif](https://code.claude.com/docs/en/interactive-mode)
- [Standard Agent Skills](https://agentskills.io)
