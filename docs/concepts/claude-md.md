# CLAUDE.md

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Fichier d'instructions persistantes chargé intégralement à chaque session |
| **Où** | `./CLAUDE.md` ou `./.claude/CLAUDE.md` (projet), `~/.claude/CLAUDE.md` (personnel) |
| **Rôle** | Source unique de vérité : chemins, commandes, workflow, conventions |
| **Chargement** | Intégral (pas de limite de taille), survit à `/compact` |
| **Relation** | Orchestre tout — agents, skills et rules lisent CLAUDE.md |

---

## Qu'est-ce que CLAUDE.md ?

`CLAUDE.md` est le **premier fichier que Claude charge** à chaque session. Il contient les instructions permanentes du projet : chemins, conventions, commandes disponibles et workflow. C'est la "mémoire de travail" de Claude pour votre projet.

::: warning Contexte, pas enforcement
CLAUDE.md fournit du **contexte et des instructions** que Claude suit au mieux, mais ce n'est pas un mécanisme d'enforcement. Pour bloquer des actions, utiliser les **permissions** dans `settings.json` (deny) ou le **sandbox**.
:::

```
┌─────────────────────────────────────────────┐
│              SESSION CLAUDE CODE             │
│                                             │
│  1. Charge CLAUDE.md (integral)             │
│     ├── Chemins (SOURCE, TARGET, ...)       │
│     ├── Commandes (/dev/commit, ...)        │
│     ├── @import fichiers references         │
│     └── Workflow (ordre des etapes)         │
│                                             │
│  2. Charge settings.json (permissions)      │
│                                             │
│  3. Charge descriptions des skills          │
│                                             │
│  4. Pret a travailler                       │
│                                             │
│  Agents lisent CLAUDE.md pour les paths     │
│  Skills referent CLAUDE.md pour le ctx      │
│  Rules completent avec du detail cible      │
│  Survit a /compact (toujours en contexte)   │
└─────────────────────────────────────────────┘
```

---

## Comment ça marche

### Emplacements et découverte

Claude découvre les fichiers CLAUDE.md par un **directory tree walk** — il parcourt l'arborescence depuis la racine du projet :

| Emplacement | Portée | Partage |
|-------------|--------|---------|
| `~/.claude/CLAUDE.md` | Personnel (tous projets) | Non |
| `./CLAUDE.md` | Projet (racine) | Oui (git) |
| `./.claude/CLAUDE.md` | Projet (alternatif) | Oui (git) |
| `./src/CLAUDE.md` | Sous-dossier | Oui (git) |
| `./src/components/CLAUDE.md` | Sous-sous-dossier | Oui (git) |

::: info Directory tree walk
Claude charge **tous** les fichiers CLAUDE.md trouvés dans l'arborescence du projet, pas seulement celui de la racine. Un `src/CLAUDE.md` s'applique quand Claude travaille dans `src/`. Les deux emplacements racine (`./CLAUDE.md` et `./.claude/CLAUDE.md`) sont équivalents.
:::

### Exclure des dossiers : claudeMdExcludes

Pour empêcher Claude de charger des CLAUDE.md dans certains dossiers (ex. `node_modules`, `vendor`) :

```json
{
  "claudeMdExcludes": ["node_modules", "vendor", "dist", ".git"]
}
```

Configurable dans `settings.json` à n'importe quel scope.

### @import : inclure des fichiers externes

CLAUDE.md supporte l'import de fichiers pour garder le fichier principal court :

```markdown
# Mon Projet

@import ./docs/conventions.md
@import ./docs/api-guide.md
@import .claude/project-context.md
```

| Aspect | Détail |
|--------|--------|
| **Syntaxe** | `@import <chemin-relatif>` |
| **Profondeur max** | 5 niveaux d'imports imbriqués |
| **Résolution** | Relatif au fichier contenant l'import |
| **Échec** | Fichier manquant = warning silencieux |

::: tip Garder CLAUDE.md court
Utiliser `@import` pour déléguer le détail à des fichiers séparés. CLAUDE.md reste un sommaire avec les chemins et commandes essentiels.
:::

### Niveaux de priorité

| Niveau | Emplacement | Portée | Priorité |
|--------|------------|--------|----------|
| Enterprise | Managed settings | Organisation | Maximale |
| Personnel | `~/.claude/CLAUDE.md` | Tous vos projets | Haute |
| Projet (racine) | `./CLAUDE.md` | Ce projet | Normale |
| Projet (sous-dossier) | `./src/CLAUDE.md` | Ce sous-dossier | Contextuelle |

### Initialisation : /init

La commande `/init` génère un CLAUDE.md initial pour votre projet :

```bash
# Dans Claude Code
/init
```

Claude analyse le projet (structure, stack, commandes) et génère un CLAUDE.md adapté. Utile pour démarrer rapidement sur un nouveau projet.

### Auto-mémoire vs CLAUDE.md

Claude maintient aussi un fichier de mémoire automatique :

```
~/.claude/projects/<project>/memory/MEMORY.md
```

| Aspect | CLAUDE.md | MEMORY.md |
|--------|-----------|-----------|
| **Nature** | Instructions stables, écrites par l'humain | Notes évolutives, écrites par Claude |
| **Chargement** | Intégral (pas de limite) | Tronqué après 200 lignes |
| **Persistence** | Dans le repo (git) | Local (`~/.claude/projects/`) |
| **Contenu** | Chemins, commandes, workflow, conventions | Patterns découverts, corrections, décisions |
| **Modifié par** | L'utilisateur (manuellement) | Claude (automatiquement) |
| **Commande** | `/init` (génération initiale) | `/memory` (voir/éditer) |

::: warning 200 lignes = MEMORY.md, pas CLAUDE.md
La limite de 200 lignes s'applique à **MEMORY.md** (auto-mémoire), pas à CLAUDE.md. CLAUDE.md est chargé intégralement quelle que soit sa taille. Garder CLAUDE.md court reste une bonne pratique pour la lisibilité, pas une contrainte technique.
:::

### Répertoires supplémentaires : --add-dir

Pour ajouter des répertoires hors du projet courant au scope de Claude :

```bash
claude --add-dir /path/to/other/project
```

Claude chargera aussi les CLAUDE.md trouvés dans ces répertoires supplémentaires, avec les mêmes règles de découverte.

### Comportement avec /compact

CLAUDE.md **survit à la compaction**. Quand Claude compresse le contexte via `/compact` ou auto-compaction, les instructions de CLAUDE.md restent toujours présentes — elles sont réinjectées dans le contexte compressé.

### Structure recommandée

```markdown
# Nom du Projet

## Configuration

### Chemins (PATHS)
| Alias | Chemin | Description |
|-------|--------|-------------|
| `SRC` | `./src/` | Code source |
| `TESTS` | `./tests/` | Tests |

### Commandes
- `npm test` : Lancer les tests
- `npm run lint` : Verifier le style

## Workflow
### Skills disponibles
- `/migrate <nom>` : Migration E2E

### Ordre
1. Analyse → 2. Migration → 3. Documentation
```

---

## Guide pratique : concevoir son CLAUDE.md

### Matrice d'usage : quoi mettre où ?

| Information | Où la mettre | Pourquoi |
|-------------|-------------|----------|
| Chemins du projet | **CLAUDE.md** | Source unique de vérité |
| Commandes disponibles | **CLAUDE.md** | Vue d'ensemble du workflow |
| Stack technique (1 ligne) | **CLAUDE.md** | Contexte global |
| Conventions détaillées | **Skill passive** | Trop long pour CLAUDE.md |
| Rappel contextuel court | **Rule** | Injecté selon les fichiers |
| Préférences personnelles | **~/.claude/CLAUDE.md** | Pas dans le repo |
| Notes de session | **MEMORY.md** | Évolue automatiquement |
| Sécurité (deny/allow) | **settings.json** | Enforcement réel (pas juste contexte) |

### Les erreurs à éviter

#### Piège 1 : Fichier trop long

```markdown
# --- 500 lignes de conventions detaillees
## Architecture (100 lignes)
## Patterns (100 lignes)
## DTOs (100 lignes)
...
```

```markdown
# --- Court et factuel, detail dans les skills ou @import
## Stack
Symfony 7.4, PostgreSQL, Docker

## Conventions
Voir skill `symfony/api-conventions` pour le detail.
```

> Bien que CLAUDE.md n'ait pas de limite technique, un fichier trop long noie les informations essentielles. Déléguer le détail aux skills, rules ou `@import`.

#### Piège 2 : Chemins hardcodés dans les agents

```markdown
# --- Agent avec chemin en dur
Lire les fichiers dans ./php-classified-ads-legacy/

# --- Agent lit le chemin depuis CLAUDE.md
Lire SOURCE_PROJECT (defini dans CLAUDE.md)
```

> Si le dossier est renommé, un seul endroit à modifier.

#### Piège 3 : Conventions dupliquées

```markdown
# --- PSR-12 dans CLAUDE.md ET dans la skill
## Conventions
- PSR-12 strict
- camelCase methodes
```

```markdown
# --- Reference vers la skill
## Conventions
Voir skill `symfony/api-conventions`.
```

#### Piège 4 : Instructions temporaires

```markdown
# --- Tache en cours dans CLAUDE.md
## TODO
- Finir la migration Search_Engine
- Corriger le bug #42
```

> Utiliser MEMORY.md pour les notes de session, pas CLAUDE.md.

#### Piège 5 : Confondre CLAUDE.md et permissions

```markdown
# --- Croire que CLAUDE.md bloque les actions
## Regles
Ne JAMAIS modifier les fichiers dans php-legacy/
```

> CLAUDE.md est du **contexte**, pas de l'enforcement. Claude fera de son mieux pour respecter l'instruction, mais pour un blocage réel, utiliser `deny` dans `settings.json`.

#### Piège 6 : Oublier @import pour les gros projets

```markdown
# --- Tout dans un seul fichier
## Architecture (50 lignes)
## API Guide (80 lignes)
## Testing (40 lignes)
## Deployment (30 lignes)
```

```markdown
# --- CLAUDE.md comme sommaire + @import
## Architecture
@import ./docs/architecture.md

## API
@import ./docs/api-guide.md
```

---

## Contrôle avancé

### Hook InstructionsLoaded

Le hook `InstructionsLoaded` se déclenche après le chargement de CLAUDE.md et toutes les instructions :

```json
{
  "hooks": {
    "InstructionsLoaded": [{
      "type": "command",
      "command": "echo 'Instructions chargees pour le projet'"
    }]
  }
}
```

Utile pour du logging, des validations custom, ou l'injection dynamique de contexte.

### Enterprise : managed CLAUDE.md

Les organisations peuvent forcer des instructions via managed settings. Ces instructions ont **priorité maximale** et ne peuvent pas être surchargées par les fichiers projet ou utilisateur.

### Troubleshooting

| Problème | Diagnostic | Solution |
|----------|-----------|----------|
| Instructions ignorées | `/status` → vérifier le chargement | Vérifier l'emplacement du fichier |
| CLAUDE.md sous-dossier pas chargé | Le fichier est dans un dossier exclu | Vérifier `claudeMdExcludes` |
| @import ne fonctionne pas | Chemin relatif incorrect | Vérifier le chemin depuis le fichier parent |
| Instructions perdues après /compact | Ne devrait pas arriver | CLAUDE.md survit à /compact — vérifier que ce n'est pas du contexte conversation |
| MEMORY.md tronqué | Normal au-delà de 200 lignes | Garder MEMORY.md concis, archiver les anciennes notes |

---

## Exemples concrets

### Exemple 1 : Projet de modernisation

```markdown
# Projet de Modernisation Legacy

## Configuration du Projet

> **SOURCE UNIQUE DE VERITE** : Tous les subagents et skills
> DOIVENT lire leurs chemins depuis cette section.

### Chemins (PATHS)

| Alias | Chemin | Description |
|-------|--------|-------------|
| `SOURCE_PROJECT` | `./php-legacy` | Legacy (LECTURE SEULE) |
| `BACKEND_TARGET` | `./api-rest-symfony-target/` | Backend cible |
| `FRONTEND_TARGET` | `./ap-rest/` | Frontend cible |
| `OPENAPI_SPEC` | `./api-rest-symfony-target/docs/openapi.yaml` | Spec OpenAPI |
| `FEATURE_SPECS_DIR` | `./output/features/` | Specifications |
| `REPORTS_DIR` | `./output/reports/` | Rapports conformite |

### Commandes
- `/dev/commit` : Conventional Commits
- `/dev/php-test` : Tests backend
- `/modernization/migrate-feature <nom>` : Migration E2E

### Workflow
1. `/modernization/analyze-legacy`
2. `/modernization/migrate-feature <nom>` (par feature)
3. `/modernization/generate-docs`
```

### Exemple 2 : Projet avec @import

```markdown
# API Platform

## Stack
Node.js 22, TypeScript, PostgreSQL, Docker

## Chemins
| Alias | Chemin | Description |
|-------|--------|-------------|
| `SRC` | `./src/` | Code source |
| `TESTS` | `./tests/` | Tests |

## Conventions
@import ./docs/coding-standards.md
@import ./docs/api-design.md

## Commandes
- `npm test` : Tests
- `npm run build` : Build
```

### Exemple 3 : CLAUDE.md personnel

`~/.claude/CLAUDE.md` :

```markdown
# Preferences personnelles

## Langue
Toujours repondre en francais.

## Workflow
- Toujours utiliser les Conventional Commits
- Preferer les commits atomiques
- Ne jamais push sans confirmation

## Style
- Code concis, pas de commentaires obvies
- Noms de variables explicites
```

---

## Checklist de lancement

### Contenu

- [ ] Chemins centralisés dans une table unique
- [ ] Note "SOURCE UNIQUE DE VERITE" visible
- [ ] Commandes et skills documentés
- [ ] Stack technique en 1 ligne

### Organisation

- [ ] CLAUDE.md court — détail dans skills ou `@import`
- [ ] Pas de conventions détaillées (dans les skills)
- [ ] Pas d'instructions temporaires (dans MEMORY.md)
- [ ] Pas de règles de sécurité (dans settings.json deny)

### Découverte

- [ ] CLAUDE.md à la racine (`./` ou `./.claude/`)
- [ ] `claudeMdExcludes` pour les dossiers à ignorer (`node_modules`, `vendor`)
- [ ] Sous-dossiers CLAUDE.md si nécessaire (contextuel)
- [ ] `@import` avec profondeur max 5

### Vérification

- [ ] `/init` pour générer un CLAUDE.md initial
- [ ] `/status` pour vérifier le chargement
- [ ] `/memory` pour vérifier la mémoire auto
- [ ] CLAUDE.md survit à `/compact` — tester

---

## Ressources

- [Documentation officielle — Memory](https://code.claude.com/docs/en/memory)
