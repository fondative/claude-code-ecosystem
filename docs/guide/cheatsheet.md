# Cheatsheet

Aide-mémoire rapide — tout ce qu'il faut en 2 minutes.

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+C` | Annuler l'action en cours |
| `Ctrl+Shift+P` | Cycler les modes de permission |
| `Esc` | Quitter le mode actuel |
| `Tab` | Autocomplétion des commandes `/` |
| `Space` | Push-to-talk (mode voix) |

## Commandes intégrées

| Commande | Action |
|----------|--------|
| `/help` | Aide contextuelle |
| `/clear` | Reset la conversation (garde le contexte) |
| `/compact` | Compresser le contexte (lancer à >70% utilisation) |
| `/context` | Voir l'utilisation du contexte et les skills chargées |
| `/model` | Changer de modèle en cours de session |
| `/plan` | Activer le mode Plan (exploration read-only) |
| `/debug` | Diagnostics de la session |
| `/loop [interval] <prompt>` | Exécuter un prompt de manière récurrente |
| `/batch <instruction>` | Orchestrer des changements massifs en parallèle |
| `/simplify` | Revoir le code récemment modifié pour qualité et reuse |
| `/init` | Générer un CLAUDE.md initial pour le projet |
| `/memory` | Voir/éditer la mémoire automatique |
| `/mcp` | Statut des serveurs MCP et authentification OAuth |
| `/status` | Voir les settings actifs et leur source |
| `/hooks` | Statut des hooks configurés |
| `/agents` | Lister les agents disponibles (built-in + custom) |
| `/btw <question>` | Question rapide sans outils (réponse jetée de l'historique) |

## Modes de permission

| Mode | Edits | Bash | Quand |
|------|-------|------|-------|
| **Plan** | ❌ | ❌ | Exploration, avant un refactor |
| **Default** | Demande | Demande | Travail quotidien |
| **Accept Edits** | Auto | Demande | Speed avec contrôle |
| **Don't Ask** | Auto | Auto (allowlist) | Workflow rodé + hooks |
| **Bypass** | Auto | Auto (tout) | Dev/test uniquement |

Cycler : `Ctrl+Shift+P`

## Gestion du contexte

| Seuil | Action |
|-------|--------|
| < 70% | Normal — travailler |
| 70% | `/compact` — compresser |
| 85% | Risque de troncature — `/compact` urgent |
| 90%+ | `/clear` — repartir à zéro |

::: warning Règle critique
Ne jamais dépasser 70% sans compacter. La qualité du raisonnement se dégrade avant la troncature.
:::

## Structure .claude/ en 30 secondes

```
.claude/
├── settings.json     # allow/deny (le pare-feu)
├── agents/           # Instances specialisees (1 fichier = 1 tache)
├── skills/           # Connaissances + workflows (SKILL.md + references/)
├── rules/            # Contexte auto-injecte (< 30 lignes)
└── commands/         # Slash commands (fusionne avec skills)
```

## Formule de prompt efficace

```
QUOI : "Dans [fichier], [action precise]"
OU   : "lignes [N-M]" ou "[fonction/classe]"
COMMENT : contraintes, style, framework
VERIFIER : "lance les tests" ou "montre le diff"
```

**Exemple** :
```
Dans src/auth/login.ts, ajouter un refresh token JWT.
Suivre le pattern de create-entity.md.
Lancer les tests apres implementation.
```

## Workflow type en 5 étapes

```
1. /plan          → Explorer, comprendre le contexte
2. Implementer    → Code avec conventions (skills)
3. Tester         → /dev/php-test ou npm test
4. Reviewer       → /review/symfony-review ou /review/frontend-review
5. /dev/commit    → Conventional Commits
```

## Commandes Docker (backend Symfony)

```bash
# Tests
docker compose exec -T app php bin/phpunit 2>&1 | cat
docker compose exec -T app php bin/phpunit --testsuite unit 2>&1 | cat

# Lint
docker compose exec -T app vendor/bin/phpcs --standard=PSR12 src/ 2>&1 | cat
docker compose exec -T app vendor/bin/phpcbf --standard=PSR12 src/ 2>&1 | cat

# Migrations
docker compose exec -T app php bin/console doctrine:migrations:migrate --no-interaction 2>&1 | cat

# Cache
docker compose exec -T app php bin/console cache:clear 2>&1 | cat
```

::: tip Flags obligatoires
`-T` : désactive le TTY (évite les exit codes erronés)
`2>&1 | cat` : capture toute la sortie
:::

## Modèles disponibles

| Modèle | ID | Force | Coût |
|--------|----|-------|------|
| Opus 4.6 | `claude-opus-4-6` | Raisonnement complexe, analyse | $$$ |
| Sonnet 4.6 | `claude-sonnet-4-6` | Implémentation, planning | $$ |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | Documentation, tâches légères | $ |

## Git rapide

```bash
# Status
git status -u

# Diff complet
git diff --staged --stat && git diff --stat

# Commit (TOUJOURS utiliser la commande projet)
/dev/commit

# Ne JAMAIS faire
git push --force        # Destructeur
git reset --hard        # Perte de travail
git commit --amend      # Apres echec hook, faire un NOUVEAU commit
```

## Anti-patterns à éviter

| ❌ Ne pas faire | ✅ Faire |
|----------------|---------|
| Prompts vagues ("fix this") | Préciser fichier, ligne, comportement attendu |
| Accepter sans lire le diff | Toujours reviewer les changements |
| Ignorer les warnings de contexte | `/compact` à 70% |
| Opus pour tout | Haiku pour le simple, Sonnet pour l'implémentation |
| Un agent qui fait tout | 1 agent = 1 responsabilité |
| Conventions dans CLAUDE.md | Conventions dans les skills |

## Ressources

- [Documentation officielle](https://code.claude.com/docs/en/skills)
- [Standard Agent Skills](https://agentskills.io)
