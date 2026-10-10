# Démarrage rapide

## Prérequis

- Claude Code installé. Méthode recommandée : l'installeur natif (mises à jour automatiques)
  - macOS, Linux, WSL : `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows PowerShell : `irm https://claude.ai/install.ps1 | iex`
  - Windows CMD : `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`
  - Alternatives : Homebrew, WinGet, `npm install -g @anthropic-ai/claude-code` (Node.js 22+), ou l'extension VS Code. Voir la [page d'installation](https://code.claude.com/docs/en/setup).
- Un compte Pro, Max, Team, Enterprise ou Console (l'offre gratuite de claude.ai n'inclut pas Claude Code), ou un fournisseur tiers (Amazon Bedrock, Google Cloud Vertex AI, Microsoft Foundry)
- Un projet existant avec un dossier `.git/`

Vérifier l'installation avec `claude --version`, puis lancer `claude` dans le dossier du projet.

## Étape 1 : Initialiser CLAUDE.md

::: tip Alternative rapide
Utiliser `/init` dans Claude Code pour générer automatiquement un CLAUDE.md adapté à votre projet (analyse la structure, stack et commandes).
:::

Ou créer manuellement un fichier `CLAUDE.md` à la racine du projet :

```markdown
# Mon Projet

## Stack
- Runtime : Node.js 20
- Framework : Express
- Base de données : PostgreSQL
- Tests : Jest

## Commandes
- `npm test` : Lancer les tests
- `npm run lint` : Vérifier le style
- `npm run build` : Build de production

## Conventions
- camelCase pour les variables et fonctions
- PascalCase pour les classes
- Tests avant code (TDD)
```

::: tip
Gardez le fichier court et factuel (moins de 200 lignes recommandées) : Claude le charge à chaque session. Si le dépôt contient déjà un `AGENTS.md` (utilisé par d'autres agents de code) et aucun CLAUDE.md, Claude Code le lit à la place.
:::

→ **Aller plus loin** : [CLAUDE.md](/concepts/claude-md) (bien l'écrire, pièges) · doc officielle : [mémoire et CLAUDE.md](https://code.claude.com/docs/en/memory), [`/init` et `AGENTS.md`](https://code.claude.com/docs/en/memory#agents-md)

## Étape 2 : Créer le dossier .claude/

```bash
mkdir -p .claude/{agents,skills,rules}
```

::: info Et `commands/` ?
Les commandes sont désormais fusionnées dans les skills : une action déclenchée par `/nom` se crée comme une skill (`.claude/skills/<nom>/SKILL.md`). Le dossier `commands/` reste lu mais c'est un format historique.
:::

→ **Aller plus loin** : [Architecture .claude/](/introduction/architecture) (rôle de chaque dossier) · doc officielle : [Extend Claude Code](https://code.claude.com/docs/en/features-overview)

## Étape 3 : Première rule

Créer `.claude/rules/git.md` pour standardiser les commits. Sans [frontmatter](/reference/glossary#frontmatter), la [rule](/reference/glossary#rule) est chargée à chaque session :

```markdown
# Git

- Toujours utiliser Conventional Commits : `type(scope): description`
- Types : feat, fix, refactor, docs, test, chore
- Ne jamais force-push sur main
```

Pour ne la charger que lorsque Claude travaille sur certains fichiers, ajouter un frontmatter `paths` :

```markdown
---
paths:
  - "src/api/**/*.ts"
---
```

**Tester** : lancer `/context` et vérifier que la rule apparaît dans la section des fichiers mémoire.

→ **Aller plus loin** : [Rules](/concepts/rules) (`paths`, pièges des globs) · doc officielle : [rules](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/)

## Étape 4 : Première skill

Créer `.claude/skills/quality-check/SKILL.md` ([skill](/reference/glossary#skill)) :

::: warning Éviter les noms des skills intégrées
Ne pas nommer sa skill `code-review` : ce nom est déjà pris par une skill intégrée de Claude Code (`/code-review`).
:::

```markdown
---
name: quality-check
description: Review de code avec checklist qualité
disable-model-invocation: true
---

# Quality Check

Analyser $ARGUMENTS, ou à défaut les fichiers modifiés, et vérifier :

1. **Lisibilité** : nommage clair, fonctions courtes
2. **Sécurité** : pas d'injection, validation des entrees
3. **Tests** : couverture des cas principaux et limites
4. **Performance** : pas de N+1, pas de boucles inutiles

Donner un verdict : APPROVED / CORRECTIONS NEEDED
```

**Tester** : `/quality-check src/auth/` (`src/auth/` remplace `$ARGUMENTS`). La commande `/skills` liste les skills disponibles.

→ **Aller plus loin** : [Skills](/concepts/skills) (description, déclenchement, pièges) · doc officielle : [skills et frontmatter complet](https://code.claude.com/docs/en/skills)

## Étape 5 : Premier agent

Créer `.claude/agents/code-explainer.md` ([agent](/reference/glossary#agent)) :

```markdown
---
name: code-explainer
description: Explique le code avec des analogies et diagrammes
tools: Read, Glob, Grep
model: haiku
---

Quand on te demande d'expliquer du code :

1. Commence par une analogie du quotidien
2. Dessine un diagramme ASCII du flux
3. Explique étape par étape
4. Signale un piege courant
```

**Tester** : demander « Utilise l'agent code-explainer pour expliquer `src/auth/login.ts` ». L'agent s'exécute dans son propre contexte (en arrière-plan par défaut) ; `/tasks` liste le travail en cours.

→ **Aller plus loin** : [Agents](/concepts/agents) (modèle, outils, parallélisme) · doc officielle : [sub-agents](https://code.claude.com/docs/en/sub-agents)

## Étape 6 : Configurer les permissions

Créer `.claude/settings.json` :

```json
{
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(npm test *)",
      "Bash(npm run lint *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)"
    ],
    "ask": [
      "Bash(git commit *)",
      "Bash(git push *)"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(rm -rf *)"
    ]
  }
}
```

`Bash(rm -rf *)` ne bloque que cette forme exacte (`rm -fr`, `rm -r -f` passent) : voir [Hooks — couches de sécurité](/concepts/hooks#couches-de-securite).

- **`allow`** : exécuté sans confirmation ([règles de permission](/reference/glossary#regles-de-permission)) ; **`ask`** : toujours demander ; **`deny`** : toujours bloqué (prioritaire).
- **`defaultMode`** : mode de permission au démarrage (`default`, `acceptEdits`, `plan`…). Voir les [modes de permission](https://code.claude.com/docs/en/permission-modes) et, pour choisir, [L'essentiel](/concepts/which-mechanism#quel-mode-de-permission-a-quelle-etape).
- Les règles de fichiers s'écrivent avec `Read(...)` et `Edit(...)` (`Edit` couvre tous les outils d'écriture).

→ **Aller plus loin** : [Settings](/concepts/settings), [Consigne ou blocage ?](/concepts/which-mechanism#consigne-ou-blocage) · doc officielle : [permissions](https://code.claude.com/docs/en/permissions), [modes de permission](https://code.claude.com/docs/en/permission-modes)

## Étape 7 : Premiers réglages

| Commande / raccourci | Usage |
|----------------------|-------|
| `/permissions` | Voir et modifier les règles allow / ask / deny |
| `/memory` | Éditer CLAUDE.md, CLAUDE.local.md et activer/désactiver l'[auto memory](/reference/glossary#auto-memory) |
| `/model` | Changer de modèle |
| `/effort` | Régler le niveau d'effort (`low` → `max`) |
| `Shift+Tab` | Faire défiler les modes de permission, dont le **[plan mode](/reference/glossary#plan-mode)** (analyse sans modification) |
| `/context` | Visualiser l'occupation du contexte et les fichiers mémoire chargés |
| `/skills` | Lister les skills disponibles |
| `/doctor` | Diagnostiquer l'installation, les réglages et les CLAUDE.md |

→ **Aller plus loin** : [Cheatsheet](/reference/cheatsheet) · doc officielle : [commandes](https://code.claude.com/docs/en/commands), [raccourcis](https://code.claude.com/docs/en/interactive-mode)

::: warning Commitez chaque état qui fonctionne
`/rewind` (Esc Esc) n'annule ni ce que font les commandes (Docker, npm, générateurs) ni le travail des agents. Un commit à chaque étape qui marche vous donne un point de retour fiable. Voir [`/rewind` ou git ?](/concepts/which-mechanism#annuler-une-erreur-rewind-ou-git).
:::

## Structure obtenue

```
mon-projet/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── agents/
│   │   └── code-explainer.md
│   ├── skills/
│   │   └── quality-check/
│   │       └── SKILL.md
│   └── rules/
│       └── git.md
└── src/
```

## Prochaines étapes

- [L'essentiel : quelle brique pour quel besoin ?](/concepts/which-mechanism) — les hésitations que vous allez rencontrer, et nos choix
- [Bonnes pratiques](/guide/best-practices) — les règles d'or et la checklist complète
- [Catalogue des pièges](/guide/warns) — les erreurs fréquentes, classées par gravité
- [Settings — sandbox](/concepts/settings#sandbox) — durcir la configuration
- [Exemples concrets](/examples/) d'un projet réel
