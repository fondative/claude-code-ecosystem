# Agents

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Un sous-agent : une instance de Claude avec son propre contexte, ses outils, son modèle et ses instructions |
| **Où** | `.claude/agents/<nom>.md` (projet) ou `~/.claude/agents/` (personnel) |
| **Pourquoi** | Isoler une tâche (le bruit reste hors de la conversation), restreindre les outils, choisir un modèle moins cher |
| **Ce que cette page apporte** | Quand déléguer, comment concevoir un agent, les erreurs à éviter et des exemples tirés d'un pipeline réel de 11 agents |

---

## L'essentiel en 2 minutes

Un agent est un **fichier Markdown** : un [frontmatter](/reference/glossary#frontmatter) (nom, description, outils, modèle) puis des instructions. Quand Claude lui délègue une tâche, l'agent démarre dans un **contexte neuf**, travaille avec ses propres outils, et ne renvoie qu'un **résumé** à la conversation principale. Exemple complet : [relecteur en lecture seule](#exemple-de-reference-relecteur-en-lecture-seule).

```
┌─────────────────────────────────────────┐
│            Session principale           │
│                                         │
│  Utilisateur ←→ Claude (conversation)   │
│                    │                    │
│               outil Agent               │
│                    │                    │
│       ┌────────────┼────────────┐       │
│       ▼            ▼            ▼       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Agent A   │ │Agent B   │ │Agent C   │ │
│  │Opus ou   │ │Sonnet    │ │Haiku     │ │
│  │Fable     │ │          │ │          │ │
│  │Read, Grep│ │Read,Write│ │Read, Grep│ │
│  │Analyse   │ │Edit,Bash │ │Audit     │ │
│  │          │ │Implément.│ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│       │            │            │       │
│       ▼            ▼            ▼       │
│   Résultat     Résultat     Résultat    │
└─────────────────────────────────────────┘
```

Quatre faits changent la façon de concevoir un agent :

1. **Il ne voit pas la conversation.** Il reçoit le message de délégation, les CLAUDE.md et les skills listées dans `skills:`. Une consigne importante doit être répétée dans la délégation.
2. **Seul son résumé revient.** Demander un format de retour court ; plusieurs agents bavards saturent vite le contexte principal.
3. **Il tourne en arrière-plan par défaut** et ses demandes de permission remontent dans la session principale.
4. **Sa `description` décide de la délégation** : c'est elle que Claude lit pour choisir l'agent.

→ Tout le fonctionnement (lancement, imbrication, reprise, forks, scopes, agents intégrés, [modes de permission](/reference/glossary#modes-de-permission), mémoire) : [documentation officielle — Sub-agents](https://code.claude.com/docs/en/sub-agents) · tous les champs : [Sub-agents — frontmatter](https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields).

---

## Quand utiliser un subagent ?

| Situation | Recommandation |
|-----------|---------------|
| Sortie volumineuse (tests, logs, docs) | **Subagent** — isole le bruit hors du contexte principal |
| Restrictions d'outils / permissions spécifiques | **Subagent** — outils limités au strict nécessaire |
| Tâche autonome avec résultat résumable | **Subagent** — retourne un résumé concis (souvent 1 000 à 2 000 tokens d'après [Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)) |
| Échanges itératifs, allers-retours fréquents | **Conversation principale** — conserve le contexte partagé |
| Phases liées (plan → implem → test) | **Conversation principale** — évite la perte de contexte |
| Changement rapide et ciblé | **Conversation principale** — pas de latence de démarrage |
| Workflow réutilisable dans le contexte principal | **[Skill](/concepts/skills)** — pas d'isolation, même contexte |
| Parallélisme soutenu entre sessions | **[Agent Teams](https://code.claude.com/docs/en/agent-teams)** — chaque worker a son propre contexte indépendant |

---

## Bien concevoir ses agents

### Quel modèle choisir ?

Guidance officielle ([costs — Choose the right model](https://code.claude.com/docs/en/costs#choose-the-right-model)) : Sonnet traite bien la plupart des tâches de code et coûte moins cher qu'Opus ; Opus est à réserver aux décisions d'architecture complexes et au raisonnement multi-étapes ; pour les subagents aux tâches simples, préciser `model: haiku`.

| Modèle | Quand | Exemples |
|--------|-------|----------|
| `sonnet` | **Par défaut** : la plupart des tâches de code | Implémentation, planification, review |
| `opus` | Architecture complexe, raisonnement multi-étapes | Reverse engineering de code non documenté |
| `fable` | Tâches les plus difficiles et les plus longues, en autonomie ([Fable](https://code.claude.com/docs/en/model-config)) ; jamais choisi par défaut, à demander explicitement | Analyse ou migration de grande ampleur |
| `haiku` | Tâches simples, bien cadrées | Recherche de fichiers, diagnostics sur template |
| `inherit` / omis | Suivre le modèle de la session (voir [ordre de résolution](https://code.claude.com/docs/en/sub-agents#choose-a-model)) | Agents génériques |

Passer la session en Opus le propage aux subagents qui héritent du modèle : fixer `model` explicitement pour les agents dont le coût doit rester maîtrisé.

::: info Heuristique de ce projet
Le projet de modernisation choisit le modèle selon la nature de la tâche :

```
La tâche nécessite de COMPRENDRE du code non documenté ?
├── OUI → Opus      (reverse engineering, déduction d'architecture)
└── NON
    La tâche PRODUIT du code ou des spécifications ?
    ├── OUI → Sonnet (implémentation, planification, review)
    └── NON
        La tâche suit un TEMPLATE clair ?
        ├── OUI → Haiku  (audit, diagnostics)
        └── NON → Sonnet (par défaut)
```

Valider ensuite sur quelques exécutions réelles : monter d'un cran si la qualité ne suffit pas.
:::

### Écrire une bonne description

Claude décide de déléguer en fonction de la description de votre requête et du champ `description` de l'agent.

::: tip Délégation proactive
Inclure **"use proactively"** dans la description d'un agent encourage Claude à l'utiliser automatiquement sans attendre une demande explicite.

```yaml
description: Expert code reviewer. Use proactively after code changes.
```
:::

Les descriptions sont toujours chargées dans le contexte : les garder courtes et discriminantes, et mettre le détail dans le corps du fichier (chargé seulement quand l'agent tourne). Au-delà de **15 000 tokens** de descriptions cumulées (hors agents intégrés), Claude Code affiche un avertissement au démarrage ([sub-agents](https://code.claude.com/docs/en/sub-agents#understand-automatic-delegation)). Pour un agent distribué en [plugin](/concepts/plugins), `claude plugin eval` mesure la fiabilité de la délégation sur des prompts réalistes ([plugin evals](https://code.claude.com/docs/en/plugin-evals)).

### La configuration réelle du projet

::: info Chez nous
Les 11 agents du projet de modernisation, tels qu'ils sont configurés dans `.claude/agents/` :

| Agent | Modèle | `maxTurns` | `permissionMode` | Écrit du code ? |
|-------|--------|-----------|------------------|-----------------|
| `legacy-technical-analyzer` | opus | 100 | default | Non (rapports) |
| `legacy-feature-analyzer` | opus | 50 | default | Non (spec) |
| `legacy-functional-analyzer` | sonnet | 50 | default | Non (inventaire) |
| `legacy-feature-analyzer-refiner` | sonnet | 35 | default | Non (spec) |
| `legacy-functional-analyzer-auditor` | haiku | 35 | default | Non (audit) |
| `backend-tasks-planner` | sonnet | 35 | default | Non (plan) |
| `frontend-tasks-planner` | sonnet | 35 | default | Non (plan) |
| `backend-tasks-executor` | sonnet | 60 | acceptEdits | **Oui** |
| `frontend-tasks-executor` | sonnet | 60 | acceptEdits | **Oui** |
| `conformity-reporter` | sonnet | 45 | default | Non (rapport) |
| `health-check` | haiku | 50 | plan | Non (lecture seule) |

Ce qu'il faut y lire : **Opus seulement là où il faut comprendre du code non documenté**, `acceptEdits` seulement pour les deux agents qui écrivent du code, `plan` pour l'agent de diagnostic, et un `maxTurns` dimensionné selon le volume de fichiers.
:::

### Pièges à connaître

- **Un champ mal orthographié est ignoré sans erreur** (`maxturns` au lieu de `maxTurns`), et un fichier sans `name` ou `description` est sauté. Vérifier avec `claude --debug`.
- **`skills:` précharge, il ne restreint pas** : sans ce champ, l'agent peut quand même invoquer les skills via l'outil `Skill`.
- **Explore et Plan ne chargent pas les CLAUDE.md** et ne sont pas reprenables : pour une tâche qui doit respecter vos conventions, utiliser un agent custom.
- **Aucun subagent n'a `AskUserQuestion`**, au premier plan comme en arrière-plan : un agent qui doit poser une question à l'utilisateur s'arrête et rend la main avec sa question.
- **`permissionMode` est ignoré** si la session principale est en `bypassPermissions`, `acceptEdits` ou `auto`.
- **Un plan validé en [plan mode](/reference/glossary#plan-mode) n'est pas transmis aux agents** : il reste dans la conversation, que l'agent ne voit pas (fait n°1). L'écrire dans la spec ou dans le message de délégation.

Détails et sources : [documentation officielle — Sub-agents](https://code.claude.com/docs/en/sub-agents).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### ⚠️ `WARN-001` : Agent fourre-tout {#warn-001}

*Origine : principe de la documentation officielle (une responsabilité par agent), appliqué aux 11 agents du projet.*

Un agent qui fait tout perd le focus et coûte plus cher en tokens.

::: danger Problème
```yaml
# ❌ MAUVAIS — Analyse + implémentation + documentation
---
name: do-everything
description: Fait tout
model: opus
---
```
Trop de responsabilités dans un seul agent.
:::

::: info Solution
```yaml
# ✅ BON — Une seule responsabilité
---
name: backend-tasks-executor
description: Implémentation backend Test First
model: sonnet
---
```
Chaque agent a une seule responsabilité claire.
:::

---

#### ⚠️ `WARN-002` : Trop d'outils {#warn-002}

*Origine : règle du projet (le legacy est en lecture seule), alignée sur la documentation officielle.*

Donner trop d'outils à un agent augmente le risque d'actions inattendues ou destructives.

::: danger Problème
```yaml
# ❌ — Agent d'analyse avec Edit (peut modifier le legacy)
tools: Read, Glob, Grep, Write, Edit, Bash
```
Un agent d'analyse ne doit jamais modifier la source analysée (`SOURCE_PROJECT`) : `Edit` est inutile.
:::

::: info Solution
```yaml
# ✅ — Legacy en lecture seule, Write pour sa sortie
tools: Read, Glob, Grep, Write
```
Limiter les outils empêche les actions inattendues. `Write` reste légitime pour produire les livrables dans le dossier de sortie (ex. `SOURCE_TECHNICAL_DIR`), jamais dans le legacy.
:::

::: info Chez nous
L'agent réel `legacy-technical-analyzer` ([exemple 1](#exemple-1-agent-d-analyse-opus-legacy-en-lecture-seule-ecrit-sa-sortie)) applique ce WARN : `tools: Read, Glob, Grep, Write`, sans `Edit` ni `Bash`. Le legacy est en plus protégé par la [règle `deny`](/reference/glossary#regles-de-permission) `Edit(/php-legacy/**)` du `settings.json`, qui couvre aussi les écritures Bash que Claude Code reconnaît (redirections `>`, `tee`, `sed -i`…) mais pas `cp`, `mv` ou un script qui ouvre lui-même les fichiers.
:::

---

#### ⚠️ `WARN-003` : Opus partout {#warn-003}

*Origine : vécu sur ce projet (`legacy-functional-analyzer` repassé d'Opus à Sonnet).*

Utiliser Opus pour toutes les tâches multiplie les coûts sans gain de qualité sur les tâches structurées.

::: danger Problème
```yaml
# ❌ COÛTEUX — Opus pour un audit ou un diagnostic sur template
model: opus
```
Opus est nettement plus cher que Sonnet et Haiku, alors que les tâches structurées n'exigent pas de raisonnement poussé (voir les [tarifs et coûts officiels](https://code.claude.com/docs/en/costs) et [Quel modèle choisir](#quel-modele-choisir)).
:::

::: info Solution
```yaml
# ✅ ÉCONOMIQUE — Sonnet par défaut, Haiku pour les tâches sur template
model: haiku
```
Haiku est beaucoup moins cher et plus rapide pour les tâches simples ; vérifier la qualité sur quelques exécutions avant de généraliser. <span class="chez-nous">Chez nous</span> `legacy-functional-analyzer-auditor` et `health-check` tournent en Haiku.
:::

---

#### ⚠️ `WARN-004` : Pas de checkpoint {#warn-004}

*Origine : conception du pipeline de ce projet (chaque étape vérifie la sortie de la précédente).*

Sans vérification entre étapes, un échec en amont fait tourner les agents suivants à vide.

::: danger Problème
```text
# ❌ — L'executor tourne à vide si l'analyse a échoué
Étape 1 : analyzer → Étape 2 : executor
```
Sans checkpoint, un échec se propage silencieusement.
:::

::: info Solution
```text
# ✅ — Vérification avant de continuer
Étape 1 : analyzer
Checkpoint : output/analysis.md existe ?
Étape 2 : executor
```
Le pipeline s'arrête proprement si une étape échoue.
:::

---

#### ⚠️ `WARN-005` : Agents parallèles qui écrivent le même fichier {#warn-005}

*Origine : vécu sur ce projet (lancement en parallèle de 13 `legacy-feature-analyzer`).*

Lancés en parallèle, des agents qui mettent tous à jour un fichier partagé (un index, un fichier de statut) s'écrasent mutuellement et gaspillent leurs tours à recommencer.

::: danger Problème
```text
13 × legacy-feature-analyzer en parallèle
→ chacun modifie 0-index.md et 0-features-tree.json
→ « The file keeps being modified externally »
→ 11 statuts sur 13 non mis à jour
```
:::

::: info Solution
```text
MODE BATCH dans le prompt de chaque agent :
→ chaque agent écrit UNIQUEMENT son propre fichier (sa spec)
→ l'orchestrateur met à jour l'index UNE fois, après la fin de tous les agents
```
Règle : **un fichier = un seul écrivain**. Les fichiers partagés appartiennent à l'[orchestrateur](/reference/glossary#orchestrateur). Voir la skill projet `claude-code-parallel-agents`.
:::

---

#### ⚠️ `WARN-006` : `maxTurns` sous-dimensionné {#warn-006}

*Origine : vécu sur ce projet (specs produites par `legacy-feature-analyzer`).*

Un agent coupé par `maxTurns` ne plante pas : il rend une sortie **partielle**. Claude Code la marque comme partielle (v2.1.246 et suivantes), mais sans vérification elle passe facilement pour un résultat complet.

::: danger Problème
```yaml
maxTurns: 30   # pour un agent qui doit lire ~15 fichiers et produire une spec de 14 sections
```
Résultat observé : des specs **30 à 50 % plus courtes** que la référence, sans message d'erreur.
:::

::: info Solution
```yaml
maxTurns: 50   # règle du projet : fichiers à lire + fichiers à écrire + 10 de marge
```
Après un lancement, vérifier si le résultat est marqué partiel : `maxTurns` compte des tours (aller-retour), pas des appels d'outils, et un agent qui l'atteint rend une sortie tronquée, à reprendre par `SendMessage` plutôt qu'à relancer.
:::

---

## Patterns d'orchestration

Quel pattern choisir ? Une seule question décide :

| Situation | Pattern |
|-----------|---------|
| La tâche suivante lit la sortie de la précédente | **Séquentiel** |
| Tâches indépendantes, chacune écrit son propre fichier | **Parallèle** |
| Une tâche se décompose en sous-domaines | **Hiérarchique** (orchestré depuis le [skill launcher](/reference/glossary#skill-launcher)) |
| Le résultat doit être vérifié avant de continuer | **[LLM-as-Judge](/reference/glossary#llm-as-judge)** |
| Des dizaines d'éléments, ou une orchestration à rejouer à l'identique | **[Workflow](/concepts/which-mechanism#agent-ou-workflow)** (script) |

<span class="chez-nous">Chez nous</span> le pipeline les combine tous : analyse séquentielle, specs en parallèle (MODE BATCH), migration séquentielle par feature, puis LLM-as-Judge — détail dans la [Méthodologie](/guide/methodology).

::: danger Pièges d'orchestration
- **Paralléliser des tâches dépendantes** : le planner frontend lancé en même temps que le backend lit un `openapi.yaml` incomplet.
- **Orchestrateur qui exécute aussi** : il mélange contexte de pilotage et contexte de travail ; le launcher ne fait que lancer, vérifier les checkpoints et enchaîner.
- **Boucle LLM-as-Judge sans condition d'arrêt** : toujours un nombre maximal d'itérations (<span class="chez-nous">Chez nous</span> une seule passe de correction, puis un rapport V2).
:::

### Séquentiel

```
Analyzer ──► spec.md ──► Planner ──► analysis.md ──► Executor
```

Usage : pipeline de migration (chaque étape dépend de la précédente).

### Parallèle

```
            ┌── Feature Analyzer (feature A) ──┐
Inventaire ─┤                                  ├──► specs/*.md
            └── Feature Analyzer (feature B) ──┘
```

Usage : `legacy-feature-analyzer` en MODE BATCH (étape 4 de `/mod-analyze-legacy`). Les planners backend et frontend restent séquentiels : le frontend s'appuie sur l'`OPENAPI_SPEC` produite par le backend.

### Hiérarchique

```
Skill Launcher (orchestrateur, conversation principale)
├── Agent Analyse (Opus)
├── Agent Implémentation (Sonnet)
│   ├── Sous-tâche backend
│   └── Sous-tâche frontend
└── Agent Conformité (Sonnet)
```

::: info Chez nous
C'est le **skill launcher** (conversation principale) qui lance chaque agent : les sous-tâches backend/frontend sont des étapes séquentielles du même agent. L'[imbrication](https://code.claude.com/docs/en/sub-agents#let-subagents-spawn-their-own-subagents) est possible (3 niveaux par défaut), mais garder l'orchestration au niveau du launcher rend le pipeline plus lisible, plus facile à reprendre et évite de multiplier les contextes.
:::

### LLM-as-Judge (relecture en contexte neuf)

```
Executor ──► sortie ──► Juge (subagent, contexte neuf) ──► écarts
                          │
                          └── écart bloquant → correction → nouvelle relecture
```

Un relecteur en **contexte neuf** ne voit que le diff et les critères fournis, pas le raisonnement qui a produit le changement : il juge le résultat sur pièces ([best practices — adversarial review](https://code.claude.com/docs/en/best-practices#add-an-adversarial-review-step)). Pour un contrôle de justesse du diff courant, la skill intégrée `/code-review` le fait déjà.

::: warning Éviter la sur-correction
Un relecteur à qui l'on demande de trouver des manques en trouvera presque toujours, même quand le travail est correct ; tout corriger mène à la sur-ingénierie (abstractions, code défensif, tests de cas impossibles). Lui demander de **ne signaler que ce qui touche la justesse ou les exigences énoncées**, et traiter le reste comme optionnel.
:::

Préciser aussi le **format de retour** : liste d'écarts avec fichier/ligne, exigence concernée, gravité (bloquant / optionnel). Exemple de prompt officiel :

```text
Use a subagent to review the rate limiter diff against PLAN.md. Check that
every requirement is implemented, the listed edge cases have tests, and
nothing outside the task's scope changed. Report gaps, not style preferences.
```

::: info Convention de ce projet
`conformity-reporter` note la conformité d'une feature ; en dessous de **80/100**, une seule passe de correction est faite, puis un rapport V2 ; si le V2 reste sous 80/100, le pipeline s'arrête (intervention humaine). Ce seuil est un choix du projet, pas une recommandation officielle.
:::

---

## Exemples prêts à l'emploi

### Exemple de référence : relecteur en lecture seule

Inspiré de l'exemple officiel `code-reviewer` ([sub-agents](https://code.claude.com/docs/en/sub-agents)) : pas de `Write`/`Edit`, une consigne de périmètre et un format de sortie.

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---

Lance git diff, concentre-toi sur les fichiers modifiés.
Ne signale que ce qui touche la justesse, la sécurité ou les exigences.
Sortie : liste priorisée (bloquant / à corriger / suggestion), avec fichier:ligne et correctif proposé.
```

Variante officielle `db-reader` : un agent qui n'a que `Bash`, plus un [hook](/reference/glossary#hook) `PreToolUse` dans son frontmatter qui refuse toute requête d'écriture ([sub-agents — conditional rules with hooks](https://code.claude.com/docs/en/sub-agents#conditional-rules-with-hooks)) :

```yaml
---
name: db-reader
description: Execute read-only database queries
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/validate-readonly-query.sh'
---
```

```bash
#!/bin/bash
# .claude/hooks/validate-readonly-query.sh
COMMAND=$(jq -r '.tool_input.command // empty')
if grep -qiE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b' <<< "$COMMAND"; then
  echo "Blocked: Only SELECT queries are allowed" >&2
  exit 2
fi
exit 0
```

::: info Convention de ce projet
<span class="chez-nous">Chez nous</span> les exemples 1 à 3 sont des agents du projet de modernisation : ils lisent leurs chemins (`SOURCE_PROJECT`, `SOURCE_TECHNICAL_DIR`…) dans la section PATHS du CLAUDE.md du projet, ce qui n'est pas un mécanisme de Claude Code.
:::

### Exemple 1 : Agent d'analyse (Opus, legacy en lecture seule, écrit sa sortie)

```markdown
---
name: legacy-technical-analyzer
description: Reverse engineering complet du legacy (architecture,
  data flow, base de données, dépendances, déploiement)
tools: Read, Glob, Grep, Write
model: opus
---

# Analyse technique

Lire les chemins depuis CLAUDE.md.

## Étapes
1. Scanner la structure du projet SOURCE_PROJECT
2. Analyser le flux : routes → controllers → models → DB
3. Documenter le schéma de base de données
4. Identifier les dépendances externes
5. Produire un audit de dette technique

## Sortie
7 fichiers dans SOURCE_TECHNICAL_DIR :
00-index, 01-overview, 02-data-flow, 03-database,
04-dependencies, 05-deployment, 06-audit
```

::: info Pourquoi Opus ?
Comprendre un codebase entier sans documentation, déduire l'architecture implicite. Sonnet ne produit pas la même profondeur.
:::

L'agent réel n'a ni `Edit` ni `Bash` : voir l'encadré de [WARN-002](#warn-002).

### Exemple 2 : Agent d'implémentation (Sonnet, TDD)

```markdown
---
name: backend-tasks-executor
description: Implémentation backend Test First via Docker
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
skills:
  - sym-api-conventions
  - sym-testing-conventions
---

# Implémentation TDD

Avant chaque tâche, lire la référence de la skill :
- create-entity.md, create-dto.md, create-controller.md

## Processus par tâche
1. Écrire le test → Red
2. Implémenter → Green
3. Refactorer
4. `docker compose exec -T app php bin/phpunit 2>&1`
5. Marquer "Processed" avec date et nb tests
```

### Exemple 3 : Agent de diagnostic (Haiku, rapide)

```markdown
---
name: health-check
description: Vérification de cohérence du projet
tools: Read, Glob, Grep, Bash
model: haiku
---

Vérifier :
- [ ] Chemins CLAUDE.md existent
- [ ] Rules ciblent des globs valides
- [ ] Agents réfèrent des skills existantes
- [ ] Docker répond
- [ ] Spec OpenAPI valide (YAML)

Rapport : erreurs / avertissements / OK
```

### Exemple 4 : Rédacteur de tests (Sonnet, générique)

Agent qui **écrit** dans le code (d'où `Write` et `Edit`) mais sans `Bash` : il ne lance pas les tests, la conversation principale le fait après.

```markdown
---
name: test-writer
description: Écrit les tests manquants pour du code existant.
  À utiliser après l'ajout ou la modification d'une classe non couverte.
tools: Read, Glob, Grep, Write, Edit
model: sonnet
---

Pour chaque classe cible, et chaque méthode publique :
- un cas nominal, les cas limites, les cas d'erreur
- avec le framework et le nommage des tests déjà présents dans le projet
Ne pas modifier le code testé ; signaler tout bug trouvé au lieu de le corriger.
```

---

## Avant de mettre en service

### Conception

- [ ] Une seule responsabilité par agent
- [ ] Modèle adapté ([Sonnet par défaut, Opus complexe, Haiku simple](#quel-modele-choisir))
- [ ] Outils limités au strict nécessaire
- [ ] `disallowedTools` si besoin d'exclure des outils spécifiques

### Description & délégation

- [ ] Description courte et spécifique — Claude l'utilise pour décider quand déléguer (voir [Écrire une bonne description](#ecrire-une-bonne-description))
- [ ] Format de retour demandé : résumé court et structuré
- [ ] `"Use proactively"` dans la description si délégation automatique souhaitée
- [ ] Skills listées explicitement (pas d'héritage depuis la conversation parente)
- [ ] Consignes clés et plan validé écrits dans le message de délégation ou la spec (l'agent ne voit pas la conversation)

### Exécution

- [ ] Checkpoints entre étapes séquentielles
- [ ] Relecture du résultat par un subagent en contexte neuf, limitée à la justesse et aux exigences
- [ ] `maxTurns` ≥ fichiers à lire + fichiers à écrire + 10, vérifié sur un vrai lancement ; à la limite, la sortie est marquée partielle (reprenable)
- [ ] `permissionMode` adapté (`plan` pour lecture seule, `dontAsk` pour CI, `auto` si le mode auto est disponible)

### Maintenance

- [ ] Fichier versionné dans `.claude/agents/` (partagé équipe)
- [ ] Noms explicites ; <span class="chez-nous">Chez nous</span> préfixe de domaine + rôle (`legacy-…`, `backend-tasks-…`, `frontend-tasks-…`)
- [ ] Fichiers de sortie documentés dans le prompt
- [ ] `memory: project` (ou `user`) si apprentissage entre sessions souhaité
- [ ] Agents lancés en parallèle : un seul écrivain par fichier ; fichiers partagés mis à jour par l'orchestrateur

---

## Pour aller plus loin

- [Parallélisme et séquence](/examples/pipeline#parallelisme-et-sequence) — piloter des agents qui tournent pendant que vous travaillez
- [Workflows](/concepts/which-mechanism#agent-ou-workflow) — orchestrer des dizaines d'agents avec un script déterministe
- [Model configuration](https://code.claude.com/docs/en/model-config) — choisir modèle et effort (doc officielle)
- <span class="chez-nous">Chez nous</span> skill `claude-code-parallel-agents` — la méthode complète pour lancer des agents en parallèle
- [Documentation officielle — Sub-agents](https://code.claude.com/docs/en/sub-agents)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
