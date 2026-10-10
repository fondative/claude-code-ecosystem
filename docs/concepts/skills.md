# Skills

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Modules de connaissances et workflows réutilisables au format `SKILL.md` |
| **Où** | `.claude/skills/<nom>/SKILL.md` (projet) ou `~/.claude/skills/` (personnel) |
| **Types** | Contenu de *référence* (conventions) ou de *tâche* (workflow `/nom`) — appelés [Passive](/reference/glossary#skill-passive) / [Launcher](/reference/glossary#skill-launcher) dans ce projet |
| **Standard** | [Agent Skills](https://agentskills.io) — plus de 40 outils compatibles (Cursor, VS Code, Gemini CLI...) |
| **Taille idéale** | < 500 lignes pour SKILL.md, détail dans `references/` |
| **Ce que cette page apporte** | Quel type de skill choisir, comment l'écrire pour qu'elle se déclenche, les erreurs à éviter et les 12 skills réelles du projet de modernisation |

---

## L'essentiel en 2 minutes

Une skill est un **dossier** dont le point d'entrée est `SKILL.md` : un [frontmatter](/reference/glossary#frontmatter) (nom, description, réglages d'invocation) puis des instructions, avec des fichiers de support optionnels (`references/`, `scripts/`). Claude ne garde en permanence que **son nom et sa description** ; il charge le `SKILL.md` complet quand la skill est invoquée (par `/nom` ou parce que la description correspond à la demande), et les fichiers de `references/` seulement quand il en a besoin.

```
┌─────────────────────────────────────────────────────────┐
│                  ÉCOSYSTÈME DES SKILLS                  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Passive     │  │ Launcher    │  │ Standard        │  │
│  │             │  │             │  │                 │  │
│  │ Conventions │  │ Workflows   │  │ Les deux modes  │  │
│  │ chargées    │  │ lancés par  │  │ auto + /nom     │  │
│  │ d'office    │  │ /nom        │  │                 │  │
│  │ ex.         │  │ ex.         │  │ ex.             │  │
│  │ sym-api-    │  │ /deploy,    │  │ /explain-code   │  │
│  │ conventions │  │ /migrate    │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                Fichiers de support                │  │
│  │    references/, scripts/, templates/, examples/   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

```markdown
---
name: sym-api-conventions
description: Conventions backend Symfony 7.4 du projet. À utiliser pour tout
  travail sur l'API REST backend.
user-invocable: false
---
Controller → Service → Repository → Entity. UUID pour toutes les clés primaires.
Créer une entité → [create-entity.md](references/create-entity.md)
```

::: info Convention de ce projet : Passive / Launcher
La documentation officielle distingue deux types de contenu : le contenu de **référence** (*reference content* : conventions, patterns, connaissances métier appliqués au travail en cours) et le contenu de **tâche** (*task content* : instructions pas à pas pour une action, souvent invoquée par `/nom` avec `disable-model-invocation: true`). « Passive » et « Launcher » sont les noms que **ce projet** donne à ces deux types ; « Standard » désigne une skill laissée avec les réglages par défaut. Source : [Skills — Types of skill content](https://code.claude.com/docs/en/skills).
:::

Quatre faits changent la façon de concevoir une skill :

1. **Sa `description` décide du déclenchement automatique.** C'est le seul texte que Claude voit avant de charger la skill : sans mots-clés précis, une skill passive ne se déclenche jamais.
2. **Le `SKILL.md` entier est chargé à chaque invocation**, les `references/` seulement à la demande : le détail va dans `references/`, pas dans `SKILL.md`.
3. **Après une [compaction](/reference/glossary#compaction), seuls les 5 000 premiers tokens** de chaque skill sont ré-attachés : les consignes importantes vont en haut du fichier.
4. **`allowed-tools` pré-approuve, il ne restreint pas** : les autres outils restent utilisables selon vos permissions. Pour retirer un outil, c'est `disallowed-tools` ou une [règle `deny`](/reference/glossary#regles-de-permission).

→ Tout le fonctionnement (cycle de vie, structure, scopes, budget de la liste, skills intégrées, contrôle d'accès, dépannage) : [documentation officielle — Skills](https://code.claude.com/docs/en/skills) · tous les champs et variables : [Skills — frontmatter](https://code.claude.com/docs/en/skills#frontmatter-reference).

---

## Quel type choisir ?

### Skill vs Rule vs Agent

| Besoin | Composant | Pourquoi |
|--------|-----------|----------|
| Conventions de code (style, archi, nommage) | **Skill passive** | Chargée automatiquement, supporte les références |
| Rappel contextuel court (< 30 lignes, repère recommandé) | **[Rule](/concepts/rules)** | Plus léger, injection par [glob](/reference/glossary#glob) |
| Workflow multi-étapes (migration, déploiement) | **Skill launcher** | Orchestre des [agents](/concepts/agents), invocable par `/nom` |
| Exécution d'une tâche atomique | **[Agent](/concepts/agents)** | Contexte isolé, modèle dédié |
| Action ponctuelle (commit, test) | **[Command](/concepts/commands)** ou skill launcher | Commands marchent toujours, skills recommandées |

### Passive vs Launcher

```
La skill contient-elle des INSTRUCTIONS D'EXÉCUTION ?
│
├── OUI (déployer, migrer, commiter...)
│   └── LAUNCHER (disable-model-invocation: true)
│       Raison : on veut contrôler QUAND ça se lance
│
└── NON (conventions, patterns, contexte métier...)
    └── PASSIVE (user-invocable: false)
        Raison : Claude doit connaître ça AUTOMATIQUEMENT
```

### Matrice de visibilité

| Configuration | Utilisateur voit `/nom` | Claude charge auto | Cas d'usage |
|---------------|--------------------------|-------------------|-------------|
| (défaut) | <Icone nom="check" /> | <Icone nom="check" /> | Skill polyvalente |
| `disable-model-invocation: true` | <Icone nom="check" /> | <Icone nom="x" /> | Déploiement, commit, actions à risque |
| `user-invocable: false` | <Icone nom="x" /> | <Icone nom="check" /> | Conventions, contexte métier |

::: warning Skill appelée par un pipeline
Une skill lancée par une autre skill ne doit **pas** avoir `disable-model-invocation: true` : Claude ne pourrait plus l'invoquer depuis le pipeline. <span class="chez-nous">Chez nous</span> `mod-generate-visualization` est appelée par `mod-analyze-legacy`, `mod-generate-docs` par `mod-migrate-feature`.
:::

### Skill dans un subagent ou subagent avec skills ?

Deux directions pour combiner skills et agents :

| Approche | System prompt | Tâche | Charge aussi |
|----------|--------------|-------|-------------|
| Skill avec `context: fork` | Depuis le type d'agent (`Explore`, `Plan`...) | Contenu du SKILL.md | CLAUDE.md, sauf avec `Explore` et `Plan` qui ne le chargent pas |
| [Subagent](/concepts/agents) avec `skills:` | Corps markdown du subagent | Message de délégation de Claude | Skills préchargées + CLAUDE.md |

Avec `context: fork`, **vous** écrivez la tâche dans la skill et choisissez un agent pour l'exécuter. Avec un subagent qui déclare `skills:`, **l'agent** contrôle le prompt et utilise les skills comme contexte de référence : il reçoit leur contenu **complet** au démarrage, pas seulement la description.

---

## Bien concevoir ses skills

### Organisation par préfixe

Claude Code ne découvre les skills qu'au premier niveau (`.claude/skills/<nom>/SKILL.md`) : les sous-dossiers de namespace ne sont pas chargés. Le regroupement se fait donc par **préfixe** dans le nom du dossier. <span class="chez-nous">Chez nous</span> les préfixes `sym-`, `front-`, `mod-`, `claude-code-` sont une convention du projet, pas une règle de Claude Code.

### Pattern de sortie visuelle

Une skill peut embarquer des scripts qui génèrent des fichiers HTML interactifs (arbres, graphes, dashboards). Le script est dans `scripts/`, la skill l'invoque via Bash, et le résultat est un fichier HTML autonome ouvrable dans le navigateur.

### La configuration réelle du projet

::: info Chez nous
Les 12 skills du projet de modernisation, telles qu'elles sont configurées dans `.claude/skills/` :

| Skill | Type | Réglage d'invocation | Lignes de `SKILL.md` | Fichiers `references/` | Préchargée par |
|-------|------|----------------------|----------------------|------------------------|----------------|
| `sym-api-conventions` | Passive | `user-invocable: false` | 133 | 15 | `backend-tasks-*`, `conformity-reporter` |
| `sym-testing-conventions` | Passive | `user-invocable: false` | 133 | 3 | `backend-tasks-*`, `conformity-reporter` |
| `front-app-conventions` | Passive | `user-invocable: false` | 169 | 9 | `frontend-tasks-*`, `conformity-reporter` |
| `front-testing-conventions` | Passive | `user-invocable: false` | 204 | 3 | `frontend-tasks-*`, `conformity-reporter` |
| `front-design-conventions` | Passive | `user-invocable: false` | 95 | 0 | `frontend-tasks-*` |
| `mod-conformity-conventions` | Passive | `user-invocable: false` | 143 | 4 | `conformity-reporter` |
| `mod-analyze-legacy` | Launcher | `disable-model-invocation: true` | 117 | 0 | — |
| `mod-migrate-feature` | Launcher | `disable-model-invocation: true` + `argument-hint` | 249 | 0 | — |
| `claude-code-skill-command-model` | Standard | (défaut) + `argument-hint` | 127 | 3 | — |
| `mod-generate-visualization` | Standard | (défaut) | 121 | 1 | — |
| `mod-generate-docs` | Standard | (défaut) | 200 | 14 | — |
| `claude-code-parallel-agents` | Standard | (défaut) | 164 | 0 | — |

Ce qu'il faut y lire : **aucun `SKILL.md` ne dépasse 250 lignes**, le volume est dans les 52 fichiers de `references/` ; les conventions sont **préchargées** dans les agents par `skills:` plutôt qu'écrites dans leur prompt (voir [WARN-006](#warn-006)) ; les deux skills appelées par un pipeline (`mod-generate-visualization`, `mod-generate-docs`) restent en réglage par défaut pour que Claude puisse les invoquer.
:::

### Pièges à connaître

- **`allowed-tools` n'est pas une restriction** : voir le fait n°4 de [L'essentiel en 2 minutes](#l-essentiel-en-2-minutes).
- **`user-invocable: false` masque seulement le menu `/`** : Claude peut toujours invoquer la skill. Seul `disable-model-invocation: true` l'en empêche, et ce réglage empêche aussi de la **précharger dans un subagent** et de l'exécuter depuis une **tâche planifiée**.
- **Un sous-dossier de regroupement n'est pas découvert** (`.claude/skills/backend/api/SKILL.md`) : regrouper par préfixe.
- **Un YAML mal formé est silencieux** : la skill se charge sans métadonnées, `/nom` marche encore mais le déclenchement automatique ne marche plus. Vérifier avec `claude --debug`.
- **Trop de skills = descriptions retirées sans message** : voir [WARN-005](#warn-005).
- **Une skill qui porte le nom d'une skill intégrée la remplace**, mais pas son alias (`code-review` remplace `/code-review`, pas `/review`).
- **`name` et `description` sont requis par le [standard Agent Skills](https://agentskills.io/specification)** mais optionnels dans Claude Code (déduits du dossier et de la première ligne) : les renseigner toujours pour qu'une skill reste portable vers d'autres outils.

Détails et sources : [documentation officielle — Skills](https://code.claude.com/docs/en/skills).

### Évaluer une skill

Une skill se teste comme du code : on vérifie qu'elle **change** le comportement de Claude, et dans le bon sens. Démarche recommandée par Anthropic ([Evaluation and iteration](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#evaluation-and-iteration)) :

1. **Scénarios d'abord** : faire tourner Claude sans la skill sur des tâches représentatives, noter les échecs, en tirer au moins **trois scénarios** de test.
2. **Baseline sans la skill** : lancer chaque prompt dans une **session neuve** avec la skill, puis avec la skill coupée (`"off"` dans `skillOverrides`), et comparer. Une session neuve évite que le contexte de rédaction masque les trous des instructions ([Skills](https://code.claude.com/docs/en/skills)).
3. **Instructions minimales** : écrire juste ce qu'il faut pour passer les scénarios, puis itérer.
4. **Plusieurs modèles** : tester avec chaque modèle visé (Haiku : assez guidé ? Opus : pas trop expliqué ?).

::: tip Automatiser avec le plugin `skill-creator`
`/plugin install skill-creator@claude-plugins-official` ajoute des cas de test (`evals/evals.json`), des exécutions isolées par subagent, une notation, un benchmark **avec / sans la skill**, une comparaison A/B de deux versions et un réglage de la `description` (prompts qui doivent / ne doivent pas déclencher). Pour une skill de plugin, la baseline se fait avec `claude plugin eval`.
:::

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### `WARN-001` : Skill trop longue {#warn-001 .warn-title}
*Origine : documentation officielle (règle des 500 lignes), appliquée aux 12 skills du projet.*

Au-delà de 500 lignes, `SKILL.md` sature le contexte à chaque invocation — même pour les parties non pertinentes.

::: danger Problème
```markdown
<!-- ❌ MAUVAIS — 2000 lignes dans SKILL.md -->
---
name: sym-api-conventions
---
## Architecture (200 lignes...)
## Entités (300 lignes...)
## DTOs (400 lignes...)
```
2000 lignes chargées en entier à chaque fois, même quand seule l'architecture est nécessaire.
:::

::: info Solution
```markdown
<!-- ✅ BON — SKILL.md court + references -->
---
name: sym-api-conventions
---
## Architecture
Controller → Service → Repository → Entity
## Voir les détails
- [create-entity.md](references/create-entity.md)
- [create-dto.md](references/create-dto.md)
```
Claude charge les fichiers de référence à la demande, uniquement quand le contexte l'exige.
:::

---

#### `WARN-002` : Description vague ou manquante {#warn-002 .warn-title}
*Origine : documentation officielle (Skill authoring best practices).*

Claude utilise la `description` pour décider automatiquement quand charger une skill passive — sans description précise, la skill n'est jamais déclenchée.

::: danger Problème
```yaml
# ❌ MAUVAIS — Claude ne sait pas quand charger
---
name: helper
---
```
Sans description, Claude ne peut pas associer la skill à un contexte d'utilisation.
:::

::: info Solution
```yaml
# ✅ BON — Ce que fait la skill + quand l'utiliser, à la 3e personne
---
name: sym-api-conventions
description: Fournit les conventions backend Symfony (architecture REST,
  DTOs, repositories avec filtrage, gestion d'exceptions). À utiliser pour
  toute création ou modification de code dans l'API REST backend.
---
```
La description est injectée dans le prompt système : Anthropic recommande d'y dire **ce que fait** la skill **et quand** l'utiliser (« Use when… »), avec des mots-clés précis, **à la 3e personne** (« Génère… », pas « Je peux… » ni « Vous pouvez… »). Source : [Skill authoring best practices — Writing effective descriptions](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#writing-effective-descriptions).
:::

---

#### `WARN-003` : Launcher sans protection {#warn-003 .warn-title}
*Origine : documentation officielle ; règle du projet (`mod-analyze-legacy` et `mod-migrate-feature` sont en `disable-model-invocation: true`).*

Sans `disable-model-invocation: true`, Claude peut déclencher une skill launcher de manière autonome — y compris des actions à effets de bord.

::: danger Problème
```yaml
# ❌ DANGEREUX — Claude peut déployer seul
---
name: deploy
description: Déploie l'application en production
---
```
Claude peut décider de déployer parce que "le code a l'air prêt", sans action humaine.
:::

::: info Solution
```yaml
# ✅ SÉCURISÉ — Contrôle humain obligatoire
---
name: deploy
description: Déploie l'application en production
disable-model-invocation: true
---
```
Avec `disable-model-invocation: true`, la skill ne peut être invoquée que par l'utilisateur explicitement.
:::

---

#### `WARN-004` : Duplication skill / [rule](/concepts/rules) {#warn-004 .warn-title}
*Origine : règle du projet (les rules `symfony-api` et `frontend` renvoient aux skills au lieu de recopier les conventions).*

Maintenir le même contenu dans une [rule](/concepts/rules) et une skill crée deux sources de vérité qui divergent lors des mises à jour.

::: danger Problème
```text
# ❌ MAUVAIS — Même contenu à 2 endroits
rules/backend.md                   → UUID, commandes Docker...
skills/sym-api-conventions/SKILL.md → UUID, commandes Docker...
```
Une mise à jour dans l'un n'est pas répercutée dans l'autre — désynchronisation garantie.
:::

::: info Solution
```text
# ✅ BON — La rule délègue, la skill détaille
rules/backend.md                   → "Charger la skill sym-api-conventions. Rappels : Docker, TDD."
skills/sym-api-conventions/SKILL.md → (détail complet)
```
La rule pointe vers la skill. Un seul endroit à maintenir pour le contenu détaillé.
:::

---

#### `WARN-005` : Budget de contexte dépassé {#warn-005 .warn-title}
*Origine : documentation officielle.*

Claude Code charge la liste des noms et descriptions de skills dans un budget d'environ 1 % de la fenêtre de contexte. Quand la liste déborde, il retire les descriptions des skills les moins utilisées : leurs noms restent listés, mais sans les mots-clés qui permettent à Claude de les déclencher automatiquement.

::: danger Problème
Une skill passive ne se déclenche plus, et aucun message n'apparaît dans la session : l'avertissement n'est écrit que dans le log de debug (`claude --debug`).
:::

::: info Solution
`/doctor` estime le coût de la liste et ses plus gros contributeurs ; `/skill-doctor` identifie les skills à désactiver. Ensuite : raccourcir les descriptions (cas d'usage principal en premier), passer les skills peu prioritaires en `"name-only"` dans `skillOverrides`, ou relever le budget avec `skillListingBudgetFraction`. Voir [Skill descriptions are cut short](https://code.claude.com/docs/en/skills#skill-descriptions-are-cut-short).
:::

---

#### `WARN-006` : Conventions écrites dans le prompt d'un agent {#warn-006 .warn-title}
*Origine : vécu sur ce projet ([Méthodologie — Phase 0](/guide/methodology#phase-0-construire-l-infrastructure)).*

Des conventions recopiées dans le corps d'un agent sont mal suivies, et doivent être maintenues dans chaque agent qui en a besoin.

::: danger Problème
```markdown
<!-- ❌ — Conventions noyées dans le prompt de l'agent -->
---
name: backend-tasks-executor
---
Utiliser des UUID, des DTOs, PSR-12, le pattern Controller → Service...
(+ 200 lignes de conventions, recopiées aussi dans le planner)
```
Constat du projet : ces conventions étaient ignorées par les agents.
:::

::: info Solution
```markdown
<!-- ✅ — Conventions dans une skill, préchargée par les agents -->
---
name: backend-tasks-executor
skills:
  - sym-api-conventions      # SKILL.md court + 15 references/
  - sym-testing-conventions
---
Avant chaque tâche, lire la référence de la skill correspondante.
```
Une seule source pour les conventions, partagée par tous les agents qui la déclarent dans `skills:`.
:::

---

## Exemples prêts à l'emploi

### Exemple 1 : Skill passive — Conventions API

<span class="chez-nous">Chez nous</span> version simplifiée de la skill réelle `sym-api-conventions`.

```markdown
---
name: sym-api-conventions
description: Fournit les conventions backend Symfony 7.4 du projet
  (architecture, patterns, standards). À utiliser pour tout travail sur
  l'API REST backend.
user-invocable: false
---

# Conventions API Symfony

## Architecture
Controller → Service → Repository → Entity

## Spécificités du projet
- UUID pour toutes les clés primaires
- Toutes les commandes via Docker :
  `docker compose exec -T app [cmd] 2>&1`

## Références détaillées
- Créer une entité → [create-entity.md](references/create-entity.md)
- Créer un DTO → [create-dto.md](references/create-dto.md)
- Créer un controller → [create-controller.md](references/create-controller.md)
```

**15 fichiers de référence** couvrent chaque pattern en détail.

::: tip N'écrire que ce que Claude ne sait pas
PSR-12 ou « camelCase pour les méthodes » sont des conventions standard que Claude connaît déjà : les répéter coûte des tokens à chaque invocation sans rien changer. Gardez ce qui est propre au projet (UUID, Docker). Source : [Concise is key](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#concise-is-key) — « Only add context Claude doesn't already have ».
:::

::: info Pourquoi passive ?
Les conventions ne sont pas une action. Claude doit les connaître quand il travaille sur le backend, pas sur demande de l'utilisateur : avec `user-invocable: false`, `sym-api-conventions` n'apparaît pas dans le menu `/`.
:::

### Exemple 2 : Skill launcher — Migration E2E

<span class="chez-nous">Chez nous</span> version simplifiée de la skill réelle `mod-migrate-feature`.

::: details Voir le SKILL.md complet
```markdown
---
name: mod-migrate-feature
description: Migre une feature legacy de bout en bout vers la stack moderne
  (specs, planification, implémentation TDD, conformité).
disable-model-invocation: true
argument-hint: "[nom-feature]"
---

# Migration de $ARGUMENTS

## Étape 0 : Prérequis
Vérifier que BACKEND_TARGET et FRONTEND_TARGET existent.
Sinon : STOP, proposer `/dev:install-stack backend|frontend`.

## Étape 1 : Spécification détaillée
Lancer l'agent `legacy-feature-analyzer` sur la feature $ARGUMENTS.
**Checkpoint** : vérifier que `FEATURE_SPECS_DIR/$ARGUMENTS_spec.md` existe.

## Étape 2 : Planification (SÉQUENTIELLE)
1. `backend-tasks-planner` (tâches + spec OpenAPI)
2. `frontend-tasks-planner` (basé sur OPENAPI_SPEC)
**Checkpoint** : les fichiers _analysis.md existent.

## Étape 3 : Implémentation TDD
1. `backend-tasks-executor` (tests avant code)
2. `frontend-tasks-executor` (appels HTTP directs)
**Checkpoint** : tous les tests passent.

## Étape 4 : Conformité
Lancer `conformity-reporter`. Ne JAMAIS écraser — créer V2, V3...

## Étape 5 : Boucle qualité (1 seule passe de correction puis rapport V2)
Si score < 80/100 : relancer l'executor + conformity-reporter (V2).
Si V2 < 80/100 : STOP — intervention humaine requise.

## Étape 6 : Sync wiki (si le dossier wiki existe)
Lancer `/mod-generate-docs $ARGUMENTS`.
```
:::

Reprise après échec : la skill ne prend qu'un argument, le nom de la feature (aucun argument pour choisir l'étape de départ). En cas d'échec, elle indique de relancer `/mod-migrate-feature <feature>`, qui reprend depuis l'étape échouée.

::: warning disable-model-invocation: true
TOUJOURS mettre `true` pour les workflows avec effets de bord. On ne veut pas que Claude lance une migration parce qu'il "pense que c'est pertinent".
:::

### Exemple 3 : Skill avec injection dynamique

```markdown
---
name: pr-summary
description: Résume les changements d'une pull request et signale les risques.
  À utiliser quand l'utilisateur demande un résumé ou une revue rapide de PR.
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Contexte de la PR
- Diff : !`gh pr diff`
- Commentaires : !`gh pr view --comments`
- Fichiers modifiés : !`gh pr diff --name-only`

## Tâche
Résumer cette PR en 3-5 points. Identifier les risques.
```

::: tip Injection dynamique
La syntaxe `` !`commande` `` exécute la commande AVANT l'envoi au modèle. Claude reçoit le résultat, pas la commande. Idéal pour du contexte live (diff de PR, git log, état d'une API).
:::

### Exemple 4 : Skill avec script intégré

```markdown
---
name: codebase-visualizer
description: Génère une visualisation interactive de la structure du projet
allowed-tools: Bash(python *)
disable-model-invocation: true
---

# Visualisation du codebase

Exécuter le script :
`python ${CLAUDE_SKILL_DIR}/scripts/visualize.py .`

Le script génère `codebase-map.html` et l'ouvre dans le navigateur.
```

### Exemple 5 : Skill launcher — arguments positionnels

`/toggle-feature new-checkout off` → `$0` = `new-checkout`, `$1` = `off` (voir [variables de substitution](https://code.claude.com/docs/en/skills#available-string-substitutions)).

```markdown
---
name: toggle-feature
description: Active ou désactive un feature flag
disable-model-invocation: true
argument-hint: "[flag-name] [on|off]"
---

1. Vérifier que le flag `$0` existe dans la config
2. Passer sa valeur à `$1`
3. Lancer les tests de smoke ; si KO, annuler le changement et s'arrêter
4. Proposer à l'utilisateur de lancer `/dev:commit`
```

L'étape 4 ne lance pas `/dev:commit` elle-même : ce command est en `disable-model-invocation: true`, Claude ne peut donc pas l'invoquer.

### Exemples de référence

Plutôt que de recopier de longs exemples, partir de skills publiées et maintenues par Anthropic :

| Exemple | Ce qu'il illustre |
|---------|-------------------|
| [`fix-issue`](https://code.claude.com/docs/en/best-practices#create-skills) (best practices Claude Code) | Skill de tâche minimale : `disable-model-invocation: true`, `$ARGUMENTS`, étapes numérotées jusqu'à la vérification (tests, lint) |
| [`anthropics/skills` → `pdf`](https://github.com/anthropics/skills/tree/main/skills/pdf) | `SKILL.md` court qui renvoie vers des fichiers de référence et des scripts (divulgation progressive) |
| [`anthropics/skills` → `skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator) | Skill qui aide à écrire, tester et améliorer d'autres skills |

```markdown
<!-- .claude/skills/fix-issue/SKILL.md (extrait des best practices) -->
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---
Analyze and fix the GitHub issue: $ARGUMENTS.
1. Use `gh issue view` to get the issue details
...
5. Write and run tests to verify the fix
```

---

## Avant de mettre en service

### Contenu & type

- [ ] Description : ce que fait la skill **et** quand l'utiliser, à la 3e personne, mots-clés naturels
- [ ] Type correct ([arbre de décision](#passive-vs-launcher))
- [ ] `disable-model-invocation: true` pour les actions à risque
- [ ] Skill appelée par le pipeline ou préchargée par un agent (`skills:`) : sans `disable-model-invocation`
- [ ] SKILL.md < 500 lignes, détail dans `references/`
- [ ] Rien que Claude sait déjà (standards du langage, explications génériques)
- [ ] Fichiers de référence liés **directement** depuis `SKILL.md` (un seul niveau de profondeur)
- [ ] Table des matières en tête des fichiers de référence de plus de 100 lignes
- [ ] Pas d'information datée (« avant août 2025… ») ou alors dans une section « anciens patterns »

### Cohérence projet

- [ ] Pas de duplication avec une [rule](/concepts/rules) existante (voir [WARN-004](#warn-004))
- [ ] Préfixe cohérent (<span class="chez-nous">Chez nous</span> `sym-`, `front-`, `mod-`)
- [ ] Skills listées dans les agents qui en ont besoin (`skills:`)
- [ ] Conventions dans une skill préchargée, pas recopiées dans le prompt des agents ([WARN-006](#warn-006))

### Sécurité & visibilité

- [ ] `allowed-tools` limité au strict nécessaire
- [ ] `context: fork` si la skill doit tourner en isolation
- [ ] [Permissions](/concepts/settings) deny configurées si besoin (`Skill(name *)`)
- [ ] Skill tierce (dépôt public, collègue) **lue en entier** avant usage : `SKILL.md`, scripts et injections `` !`…` `` s'exécutent avec vos droits

### Validation

- [ ] Testée par `/nom` (launcher, standard) et en déclenchement automatique par un message libre qui correspond à la description (passive, standard)
- [ ] Au moins trois scénarios comparés avec / sans la skill ([Évaluer une skill](#evaluer-une-skill))
- [ ] Testée avec chaque modèle visé
- [ ] Budget vérifié (`/context`, `/doctor` ; avertissement dans `claude --debug`)

---

## Pour aller plus loin

- [Commands](/concepts/commands) et [Commands du projet](/examples/project-structure#commands-du-projet) — le format historique et comment en sortir
- <span class="chez-nous">Chez nous</span> skill `claude-code-skill-command-model` — classer un nouveau workflow en skill ou en command, auditer `.claude/`
- [Documentation officielle — Skills](https://code.claude.com/docs/en/skills) · [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Standard Agent Skills](https://agentskills.io) · [Spécification du format](https://agentskills.io/specification) · [Exemples de skills Anthropic](https://github.com/anthropics/skills)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
