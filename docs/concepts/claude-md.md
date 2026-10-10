# CLAUDE.md

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Fichier d'instructions persistantes chargé intégralement à chaque session |
| **Où** | `./CLAUDE.md` ou `./.claude/CLAUDE.md` (projet), `./CLAUDE.local.md` (perso, non versionné), `~/.claude/CLAUDE.md` (personnel) |
| **Rôle** | Ce que Claude ne peut pas deviner : commandes, conventions propres au projet, chemins, pièges. <span class="chez-nous">Chez nous</span> il sert aussi de « source unique de vérité » des chemins (convention maison) |
| **Chargement** | Intégral (jusqu'à 4 Mio), concaténé avec les autres niveaux, survit à `/compact` |
| **Relation** | Socle toujours chargé ; les [rules](/concepts/rules) et les [skills](/concepts/skills) ajoutent le détail seulement quand il sert |
| **Ce que cette page apporte** | Quoi mettre (et ne pas mettre) dans CLAUDE.md, le fichier réel d'un projet de modernisation et les pièges qu'il illustre |

---

## L'essentiel en 2 minutes

CLAUDE.md est un fichier Markdown que Claude Code charge **en entier au démarrage de chaque session**. Il porte ce que Claude ne peut pas deviner en lisant le code : commandes, conventions propres au projet, chemins, pièges. Les CLAUDE.md des différents niveaux **se cumulent** au lieu de se remplacer.

```
~/.claude/CLAUDE.md      personnel, tous projets        ─┐
./CLAUDE.md              projet, versionné (git)         ├─► contexte de la session
./CLAUDE.local.md        personnel, non versionné        │   (racine relue après /compact)
./src/CLAUDE.md          chargé quand Claude touche src/ ─┘
```

Exemple minimal, tiré des [best practices officielles](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md) :

```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
```

Quatre faits changent la façon de concevoir un CLAUDE.md :

1. **C'est du contexte, pas une barrière.** Claude suit les consignes au mieux ; pour bloquer une action, utiliser une règle [`deny`](/reference/glossary#regles-de-permission) dans [settings.json](/concepts/settings), un [hook](/concepts/hooks) `PreToolUse` ou le [sandbox](/reference/glossary#sandbox).
2. **Chaque ligne est payée à chaque requête.** Le fichier est chargé en entier : viser moins de 200 lignes et sortir le détail dans des [skills](/concepts/skills) ou des [rules à `paths`](/concepts/rules). Les imports `@chemin` n'allègent rien, ils sont chargés au lancement.
3. **Les fichiers se cumulent, aucun ne « gagne ».** Deux consignes contradictoires (entre fichiers ou niveaux) : Claude peut suivre l'une ou l'autre arbitrairement ([memory](https://code.claude.com/docs/en/memory#audit-your-instruction-files)) ; `/doctor prompt-audit` les repère (voir [Maintenance](#maintenance)).
4. **Après `/compact`, c'est le fichier qui est relu, pas la conversation.** Une consigne donnée dans le chat peut disparaître ; une consigne écrite dans le CLAUDE.md racine revient.

→ Tout le fonctionnement (emplacements, ordre de chargement, imports, [auto memory](/reference/glossary#auto-memory), exclusions, [compaction](/reference/glossary#compaction)) : [documentation officielle — Memory](https://code.claude.com/docs/en/memory).

---

## Bien concevoir son CLAUDE.md

### Bien écrire ses instructions

Pour chaque ligne, se demander : **« La supprimer ferait-elle faire une erreur à Claude ? »** Si non, la couper ([best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)).

| ✅ À inclure | ❌ À exclure |
|-------------|-------------|
| Commandes Bash que Claude ne peut pas deviner | Ce que Claude déduit en lisant le code |
| Règles de style qui diffèrent des défauts | Conventions standard du langage |
| Instructions de test et runners préférés | Documentation d'API détaillée (mettre un lien) |
| Étiquette du dépôt (branches, PR) | Informations qui changent souvent |
| Décisions d'architecture propres au projet | Longues explications, tutoriels |
| Particularités de l'environnement (variables requises) | Description fichier par fichier du code |
| Pièges non évidents | Évidences (« écrire du code propre ») |

- **Concret et vérifiable** : « Indentation de 2 espaces » plutôt que « Bien formater le code » ; « Lancer `npm test` avant de commiter » plutôt que « Tester ses changements ».
- **Quand ajouter une ligne** : quand Claude se trompe sur un point qu'il ne pouvait pas déduire du code. S'il pose une question dont la réponse est déjà dans CLAUDE.md, la formulation est ambiguë : la reformuler plutôt qu'ajouter.
- **Emphase rare** : si Claude ignore une consigne précise, ajouter « IMPORTANT » à **cette seule ligne**. Tout souligner revient à ne rien souligner.
- **Garantie ≠ consigne** : ce qui doit arriver à coup sûr (bloquer, formater, lancer un test) relève d'un [hook](/concepts/hooks) ou d'une [permission](/concepts/settings), pas d'une phrase.

### Matrice d'usage : quoi mettre où ?

| Information | Où la mettre | Pourquoi |
|-------------|-------------|----------|
| Chemins du projet | **CLAUDE.md** | Source unique de vérité |
| Commandes disponibles | **CLAUDE.md** | Vue d'ensemble du workflow |
| Stack technique (1 ligne) | **CLAUDE.md** | Contexte global |
| Conventions détaillées | **[Skill passive](/concepts/skills)** | Trop long pour CLAUDE.md |
| Rappel contextuel court | **[Rule](/concepts/rules)** | Injecté selon les fichiers |
| Préférences personnelles | **~/.claude/CLAUDE.md** | Pas dans le repo |
| Apprentissages de Claude | **MEMORY.md** (auto memory) | Écrit et élagué par Claude |
| Tâches en cours, TODO | **Fichier de plan** (`PLAN.md`…) ou conversation | Temporaire, piloté par vous |
| Sécurité (deny/allow) | **[settings.json](/concepts/settings)** | Blocage réel (pas seulement du contexte) |

### La configuration réelle du projet

<span class="chez-nous">Chez nous</span> Le `CLAUDE.md` racine du projet de modernisation :

| Élément | Dans le projet |
|---------|----------------|
| Fichiers | Un seul : `./CLAUDE.md`. Ni `.claude/CLAUDE.md`, ni `CLAUDE.local.md`, ni CLAUDE.md de sous-dossier, aucun import `@` |
| Taille | **82 lignes**, 5,4 Ko — sous le seuil de 200 lignes recommandé |
| Structure | 2 sections : *Configuration du Projet* (stack, PATHS, commandes, conventions) et *Workflow de Modernisation* (skills lanceurs, commandes techniques, agents/skills/rules, ordre du workflow) |
| Table PATHS | **11 alias** (`SOURCE_PROJECT` → `./php-legacy`, `BACKEND_TARGET`, `OPENAPI_SPEC`, `REPORTS_DIR`, `WIKI_TARGET`…) ; les 11 agents renvoient à CLAUDE.md pour leurs chemins |
| Conventions | Aucune règle de code détaillée : des **pointeurs** vers les skills `sym-*` et `front-*` |
| Inventaires | Liste des 4 skills lanceurs et des 8 commandes techniques ; pour les agents, skills et rules, un simple renvoi à leur dossier `.claude/` |

::: info Convention de ce projet : table d'alias PATHS
Les agents et skills lisent `SOURCE_PROJECT`, `BACKEND_TARGET`… dans la table au lieu de coder les chemins en dur. C'est une **convention maison**, utile quand de nombreux agents partagent les mêmes chemins — pas une fonctionnalité de Claude Code.
:::

Ce qu'il faut y lire : la table PATHS n'est pas la seule copie des chemins. `php-legacy` figure aussi dans le `deny` de `settings.json` et dans le glob de la rule `legacy-readonly`. La note du CLAUDE.md énumère ces copies (`settings.json`, `paths:` des rules, `STACK_DIRS` de `.claude/scripts/install-stack.sh`) et demande, après un renommage, un `grep` sur `.claude/` puis l'agent `health-check`. Les commandes techniques y sont écrites sous leur forme d'invocation réelle, `/dev:commit` (le sous-dossier devient un espace de noms séparé par `:`).

### Pièges à connaître

- **Les CLAUDE.md de sous-dossiers ne se chargent qu'à la demande**, quand Claude lit ou modifie un fichier du dossier (y compris un `cat` via Bash). Au lancement, seuls ceux du répertoire courant et de ses parents sont chargés.
- **Les imports `@chemin` sont chargés au lancement**, avec le fichier qui les contient (profondeur max : 4 sauts). Un import qui pointe hors du projet déclenche un dialogue d'approbation.
- **L'auto memory n'est pas CLAUDE.md** : ce sont des notes que Claude écrit lui-même (corrections, préférences) dans `~/.claude/projects/<projet>/memory/`, avec un index `MEMORY.md`. La limite « 200 lignes ou 25 Ko » concerne cet index ; CLAUDE.md, lui, est chargé en entier jusqu'à 4 Mio (au-delà, il est ignoré). `/memory` permet de la consulter ou de la désactiver.
- **Un CLAUDE.md [managed](/reference/glossary#managed)** (déployé par l'organisation dans un emplacement système, ex. `/etc/claude-code/CLAUDE.md` sous Linux) s'ajoute à tous les autres et **ne peut pas être exclu**. Les autres CLAUDE.md (ex. ceux d'autres équipes dans un monorepo) peuvent être ignorés avec le réglage [`claudeMdExcludes`](/reference/glossary#claudemdexcludes) : une liste de [globs](/reference/glossary#glob) comparés aux chemins absolus.
- **Les commentaires HTML de bloc sont retirés** avant l'injection : ils ne coûtent rien et conviennent aux notes de mainteneur.
- **`CLAUDE.local.md` doit figurer dans `.gitignore`** et n'existe que dans le worktree où il a été créé.
- **Si une consigne disparaît après `/compact`**, elle était dans la conversation, ou dans un CLAUDE.md de sous-dossier (ou une rule à `paths`) pas encore rechargé.

Détails et sources : [documentation officielle — Memory](https://code.claude.com/docs/en/memory).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### ⚠️ `WARN-001` : Fichier trop long / monolithique {#warn-001}

*Origine : documentation officielle (viser moins de 200 lignes par fichier).*

Un CLAUDE.md de 200+ lignes noie les informations essentielles et réduit l'adhérence de Claude.

::: danger Problème
```markdown
## Architecture (100 lignes)
## Patterns (100 lignes)
## DTOs (100 lignes)
```
Tout dans un seul fichier — impossible à scanner, Claude ne distingue plus l'essentiel.
:::

::: info Solution
```markdown
## Stack
Symfony 7.4, PostgreSQL, Docker

## Conventions
Voir skill `sym-api-conventions` pour le détail.
```
Garder CLAUDE.md **court et factuel** (< 200 lignes). Déléguer le détail aux skills (chargées à la demande) et aux rules à `paths`. Découper en imports `@chemin` organise le fichier mais **ne réduit pas** le contexte.
:::

---

#### ⚠️ `WARN-002` : Chemins hardcodés dans les agents {#warn-002}

*Origine : règle du projet (section PATHS) ; vécu sur ce projet : des chemins écrits en dur ont dû être retirés de l'agent `documentation-generator` (commit `847ccc2`).*

Si un dossier est renommé, il faut modifier chaque agent un par un. <span class="chez-nous">Chez nous</span> les agents lisent les alias de chemins de CLAUDE.md.

::: danger Problème
```markdown
Lire les fichiers dans ./php-classified-ads-legacy/
```
Chemin en dur dans l'agent — fragile et source de bugs silencieux.
:::

::: info Solution
```markdown
Lire SOURCE_PROJECT (défini dans CLAUDE.md)
```
L'agent lit le chemin depuis CLAUDE.md. Si le dossier est renommé, **un seul endroit à modifier**.
:::

---

#### ⚠️ `WARN-003` : Conventions dupliquées {#warn-003}

*Origine : vécu sur ce projet : la commande Docker, écrite à la fois dans CLAUDE.md et dans la rule `symfony-api`, a divergé : le flag `-T` a longtemps manqué dans CLAUDE.md (commits `e0b87b5`, `dfb52db`).*

Les mêmes conventions écrites à deux endroits divergent inévitablement.

::: danger Problème
```markdown
<!-- CLAUDE.md -->
- Toutes les commandes backend via Docker Compose : `docker compose exec -T app [commande] 2>&1 | cat`

<!-- .claude/rules/symfony-api.md -->
- Commandes via `docker compose exec -T app [cmd] 2>&1 | cat`
```
La même consigne à deux endroits : quand l'une change (ajout de `-T`), l'autre reste en arrière — laquelle fait foi ?
:::

::: info Solution
Écrire la consigne **à un seul endroit**. Une commande valable pour tout le projet reste dans CLAUDE.md (toujours chargé) ; la rule `symfony-api` ne garde que ce qui est propre au backend (TDD, PSR-12) ou **renvoie** à CLAUDE.md. Même principe pour les conventions détaillées : CLAUDE.md pointe vers la skill (`Voir skill sym-api-conventions`) sans les recopier.
:::

::: info Chez nous
Le doublon est **résolu** : la commande Docker n'est écrite que dans CLAUDE.md, et la rule `symfony-api` y renvoie (« voir CLAUDE.md, section Commandes »).
:::

---

#### ⚠️ `WARN-004` : Instructions temporaires {#warn-004}

*Origine : documentation officielle (exclure les informations qui changent souvent).*

CLAUDE.md est chargé à **chaque session**. Les tâches en cours n'ont pas leur place ici.

::: danger Problème
```markdown
## TODO
- Finir la migration Search_Engine
- Corriger le bug #42
```
Ces notes polluent le fichier permanent et deviennent obsolètes.
:::

::: info Solution
Suivre les tâches en cours dans un **fichier de plan** du dépôt (ex. `PLAN.md`, lu à la demande) ou simplement dans la **conversation**. Ne pas les envoyer dans **MEMORY.md** : c'est la mémoire que **Claude** écrit et élague lui-même, chargée à chaque session — des TODO y deviendraient obsolètes sans que vous le voyiez. CLAUDE.md reste réservé aux instructions **permanentes**.
:::

---

#### ⚠️ `WARN-005` : Confondre CLAUDE.md et permissions {#warn-005}

*Origine : documentation officielle (CLAUDE.md n'est pas contraignant) ; le projet double ses consignes d'un `deny` ([Méthodologie — Phase 0](/guide/methodology#phase-0-construire-l-infrastructure)).*

CLAUDE.md est du **contexte**, pas un mécanisme de blocage.

::: danger Problème
```markdown
## Règles
Ne JAMAIS modifier les fichiers dans php-legacy/
```
Claude fera de son mieux, mais rien ne l'empêche **techniquement** de modifier ces fichiers.
:::

::: info Solution
Utiliser `deny` dans **[settings.json](/concepts/settings)** pour un blocage réel (`Edit(...)` couvre tous les outils d'écriture) :
```json
{
  "permissions": {
    "deny": ["Edit(/php-legacy/**)"]
  }
}
```
CLAUDE.md fournit le **pourquoi**, settings.json applique le **blocage**.
:::

---

#### ⚠️ `WARN-006` : Croire qu'un import `@` allège le contexte {#warn-006}

*Origine : vécu sur ce wiki : il présentait à tort les imports `@` comme un moyen de réduire le contexte.*

Découper CLAUDE.md en fichiers importés le rend plus lisible, pas plus léger.

::: danger Problème
```markdown
# CLAUDE.md « allégé » : 10 lignes visibles
## Conventions
- @docs/conventions-backend.md    <!-- 400 lignes -->
- @docs/conventions-frontend.md   <!-- 300 lignes -->
```
Les 700 lignes importées sont expansées et chargées au lancement, à chaque session, comme si elles étaient écrites dans CLAUDE.md.
:::

::: info Solution
```markdown
## Conventions
- Backend : skill `sym-api-conventions`
- Frontend : skill `front-app-conventions`
```
Le détail va dans des skills (contenu chargé quand la tâche le demande) ou des rules à `paths` (chargées quand Claude touche les fichiers concernés). `/context` (section *Memory files*) montre ce qui est réellement chargé.
:::

---

### Maintenance

Traiter CLAUDE.md comme du code : le relire quand quelque chose tourne mal, l'élaguer régulièrement et vérifier qu'une modification change réellement le comportement ([best practices](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)).

| Besoin | Outil / pratique |
|--------|------------------|
| Couper ce que Claude peut déduire du code | `/doctor` propose des coupes pour un CLAUDE.md versionné |
| Trouver consignes obsolètes ou **contradictoires** entre CLAUDE.md, CLAUDE.md imbriqués, rules, skills, agents | `/doctor prompt-audit` (rapport + propositions, rien n'est modifié sans accord) |
| Vérifier ce qui est chargé | `/context` (section *Memory files*), avertissement de taille au démarrage et dans `/status` |
| Préserver l'essentiel lors d'une compaction | Ajouter une consigne du type « Lors d'une compaction, toujours conserver la liste des fichiers modifiés et les commandes de test » |

---

## Exemples prêts à l'emploi

### Exemple 1 : Projet de modernisation

<span class="chez-nous">Chez nous</span> Extrait du `CLAUDE.md` réel de ce projet (sections intermédiaires omises). La table d'alias et la liste des skills sont des **conventions de ce projet** (voir plus haut) :

::: details Voir l'extrait du CLAUDE.md
````markdown
# Projet de Modernisation Legacy

## Configuration du Projet

> **Stack** : PHP 8.5 + Symfony 7.4 + PostgreSQL + Docker (backend) | React 19 + TypeScript + Vite + Tailwind CSS 4 (frontend)

> **SOURCE UNIQUE DE VERITE** : subagents et skills lisent leurs chemins dans cette table, par alias, jamais en dur.
> Seuls `.claude/settings.json` (regles `Edit(...)`, dont `Edit(/output/**)` et `Edit(/legacy-wiki/**)` pour `WIKI_TARGET`) et le `paths:` des `.claude/rules/*.md` contiennent des chemins reels (globs obligatoires), ainsi que `STACK_DIRS` de `.claude/scripts/install-stack.sh` (chemins reels, a mettre a jour lors d'un renommage).
> Apres un renommage : mettre a jour la table, puis `grep -rn "<ancien-chemin>" .claude/` (script `.claude/scripts/install-stack.sh` compris) et corriger chaque resultat ; enfin lancer l'agent `health-check` (section « Chemins en dur ») pour verifier l'alignement.

### Chemins (PATHS)

| Alias | Chemin | Description |
|-------|--------|-------------|
| `SOURCE_PROJECT` | `./php-legacy` | Projet legacy (LECTURE SEULE) |
| `SOURCE_TECHNICAL_DIR` | `./output/technique/` | Documentation technique generee |
| `FEATURE_SPECS_DIR` | `./output/features/` | Specifications fonctionnelles |
| `BACKEND_TARGET` | `./api-rest-symfony-target/` | Projet backend cible |
| `FRONTEND_TARGET` | `./app-react-target/` | Projet frontend cible |
| `OPENAPI_SPEC` | `./api-rest-symfony-target/docs/openapi.yaml` | Specification OpenAPI |
| `BACKEND_ANALYSIS_DIR` | `./output/analysis/backend/` | Analyses backend |
| `FRONTEND_ANALYSIS_DIR` | `./output/analysis/frontend/` | Analyses frontend |
| `REPORTS_DIR` | `./output/reports/` | Rapports de conformite |
| `DESIGN_DIR` | `./output/design/` | Fichiers design Figma |
| `WIKI_TARGET` | `./legacy-wiki/` | Wiki VitePress genere (mod-analyze-legacy, mod-generate-docs) |

### Commandes

- Toutes les commandes backend via Docker Compose : `cd <BACKEND_TARGET> && docker compose exec -T app <commande> 2>&1` (sans `| cat`, pour garder le code de sortie)
- Ne jamais executer de commandes PHP ou Composer directement sur l'hote
...

## Workflow de Modernisation

### Skills lanceurs (slash commands)

- `/mod-analyze-legacy` : Pipeline d'analyse en 6 etapes (technique → inventaire → audit → specs detaillees (optionnel) → visualisations → synchro wiki si `WIKI_TARGET` existe)
- `/mod-generate-visualization` : Visualisations interactives (arbre + graphe de dependances)
- `/mod-migrate-feature <nom>` : Migration E2E d'une feature (specs → arbitrage des ecarts → synchro wiki spec → planif → synchro wiki planif → implementation (synchro wiki a chaque lot) → conformite (synchro wiki) → boucle qualite → synchro wiki)
- `/mod-generate-docs` : Generation documentation VitePress

...

### Ordre du workflow

```
1. /mod-analyze-legacy
   └── Analyse technique → Inventaire → Audit → Specs detaillees (optionnel)
       → Visualisations (/mod-generate-visualization, etape 5) → Synchro wiki (si WIKI_TARGET existe)
   (/mod-generate-visualization peut aussi etre relance seul apres un enrichissement de l'inventaire)

2. /mod-migrate-feature <nom>  (pour chaque feature)
   └── Specs → Arbitrage ecarts → Synchro wiki spec → Planif Backend → Planif Frontend → Synchro wiki planif → Implem Backend → Implem Frontend → Conformite
       → Boucle qualite → Synchro wiki (si WIKI_TARGET existe)

3. /mod-generate-docs
   └── Documentation VitePress complete
```
````
:::

### Exemple 2 : Projet avec imports `@chemin`

```markdown
# API Platform

## Stack
Node.js 22, TypeScript, PostgreSQL, Docker

## Conventions
- Standards de code : @docs/coding-standards.md
- Design d'API : @docs/api-design.md

## Commandes
- `npm test` : Tests
- `npm run build` : Build
```

Les deux fichiers importés sont chargés **à chaque session**. S'ils ne concernent qu'une partie du code (ex. `src/api/`), une rule à `paths` est plus économe.

### Exemple 3 : CLAUDE.md personnel

Ce qui peut être **garanti par un réglage** sort du CLAUDE.md : langue, attribution des commits, confirmation avant `git push`. Dans `~/.claude/settings.json` ([`language`, `attribution`](https://code.claude.com/docs/en/settings), [règles `ask`](https://code.claude.com/docs/en/permissions)) :

```json
{
  "language": "french",
  "attribution": { "commit": "", "pr": "" },
  "permissions": {
    "ask": ["Bash(git push *)"]
  }
}
```

Il ne reste dans `~/.claude/CLAUDE.md` que les préférences qu'aucun réglage n'exprime :

```markdown
# Préférences personnelles
- Conventional Commits (`type(scope): description`), commits atomiques
- Pas de commentaires qui répètent le code
```

### Exemple 4 : Squelette de démarrage

Point de départ pour un nouveau projet : remplacer les crochets, puis supprimer toute ligne que Claude devinerait seul (voir [WARN-001](#warn-001)).

```markdown
# [Nom du projet]

## Stack
[Runtime + version], [framework], [base de données], [framework de test]

## Commandes
- `[commande de test]` : Tests
- `[commande de lint]` : Lint
- `[commande de build]` : Build

## Conventions
- [Seulement ce qui diffère des standards du langage]

## Workflow
1. Explorer en mode plan avant de modifier
2. Tests d'abord, puis implémentation
3. Commiter avec `/<namespace>:<commande>` (Conventional Commits)
```

### Exemples de référence

| Source | Ce qu'on y apprend |
|--------|--------------------|
| [Best practices Anthropic](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md) | Fichier court, tableau à inclure / exclure, test « supprimer cette ligne ? » |
| [Trail of Bits — claude-code-config](https://github.com/trailofbits/claude-code-config) | **Deux couches** : un `~/.claude/CLAUDE.md` d'environ 100 lignes toujours chargé + des `~/.claude/rules/` par langage chargées via `paths` |
| [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) | Structure **WHAT** (stack, structure) / **WHY** (but du projet) / **HOW** (comment travailler) ; « ne jamais confier à un LLM le travail d'un linter » |

---

## Avant de mettre en service

### Contenu

- [ ] Commandes que Claude ne peut pas deviner documentées
- [ ] <span class="chez-nous">Chez nous</span> Chemins centralisés dans une table d'alias, note « SOURCE UNIQUE DE VERITE » visible
- [ ] Stack technique en 1 ligne
- [ ] Agents et skills lisent les chemins via les alias de CLAUDE.md, aucun chemin écrit en dur ([WARN-002](#warn-002))

### Organisation

- [ ] CLAUDE.md court (< 200 lignes) — détail dans skills ou rules à `paths` (les imports `@chemin` ne réduisent pas le contexte)
- [ ] Chaque ligne passe le test « la supprimer ferait-elle faire une erreur ? »
- [ ] Pas de conventions détaillées (dans les skills)
- [ ] Pas d'instructions temporaires (fichier de plan ou conversation, pas MEMORY.md)
- [ ] Ce qu'un réglage garantit (`language`, `attribution`, permissions, règles de sécurité en `deny`) est dans settings.json, pas dans CLAUDE.md
- [ ] Chaque chemin de la table PATHS recherché dans `settings.json`, `.claude/rules/` et les skills avant un renommage
- [ ] Commandes écrites sous leur forme d'invocation réelle (`/dev:commit`, pas `/dev/commit`)

### Découverte

- [ ] CLAUDE.md à la racine (`./` ou `./.claude/`)
- [ ] `claudeMdExcludes` (globs sur chemins absolus) pour les CLAUDE.md à ignorer ; CLAUDE.md managed pour les standards d'organisation (non excluable)
- [ ] Consignes propres à un sous-dossier dans son CLAUDE.md ou une rule à `paths` (chargés à la demande, pas au lancement)
- [ ] Imports `@chemin` avec profondeur max 4 sauts
- [ ] `CLAUDE.local.md` présent dans `.gitignore`

### Vérification

- [ ] `/init` pour générer un CLAUDE.md initial
- [ ] `/context` (section *Memory files*) pour vérifier le chargement
- [ ] `/memory` pour vérifier la mémoire auto
- [ ] Consignes durables dans le CLAUDE.md racine (relu après `/compact`, contrairement aux CLAUDE.md de sous-dossiers et aux rules à `paths`) — tester
- [ ] `/doctor prompt-audit` passé régulièrement (consignes obsolètes ou contradictoires)

---

## Pour aller plus loin

- [Rules](/concepts/rules) — le détail lié à une zone du code, chargé seulement quand il sert
- [Skills](/concepts/skills) — où placer les conventions détaillées
- [Settings](/concepts/settings) — ce qui doit être garanti plutôt que demandé
- [Méthodologie](/guide/methodology) — le pipeline qui consomme la table PATHS
- [Documentation officielle — Memory](https://code.claude.com/docs/en/memory)
- [Best practices — Write an effective CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
