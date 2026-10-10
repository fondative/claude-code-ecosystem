# Pipeline de migration

## Vue d'ensemble

Le pipeline de migration (`/mod-migrate-feature <nom>`) transforme une feature legacy en implémentation moderne à travers 5 étapes principales (1 à 5), encadrées par une étape 0 de pré-requis (vérification des stacks cibles, sinon proposition de `/dev:install-stack`) et une étape 6 de synchronisation finale du wiki (`/mod-generate-docs`). Si le dossier wiki (`WIKI_TARGET`) existe, le wiki est aussi synchronisé après l'arbitrage de la spec (étape 1 bis), après la planification (étape 2 bis, feature « Planifiée ») et à chaque commit de lot (`/mod-generate-docs <feature> status`). Chaque étape a un checkpoint de vérification.

```
Spécification ──► Planification ──► Implémentation ──► Conformité ──► Boucle qualité
     │                  │                  │                │               │
     ▼                  ▼                  ▼                ▼               ▼
  _spec.md        _analysis.md     Code + Tests        _REPORT.md     Score ≥ 80
                                  (1 commit par lot)  (commit V1)
```

::: info Convention de ce projet
Un seul nom de feature, `<feature>`, sert pour tous les fichiers (`<feature>_spec.md`, `<feature>_backend_analysis.md`, `<feature>_CONFORMITY_REPORT*.md`…) et tous les prompts d'agents : c'est le texte qui suit `### Feature N : ` dans `output/features/0-index.md`, espaces remplacés par `_` (`### Feature 3 : User Authentication` → `User_Authentication`). L'argument de `/mod-migrate-feature` est comparé sans tenir compte de la casse ni des séparateurs : `user-authentication` → `User_Authentication`, mais `user-auth` ne correspond à rien. Zéro ou plusieurs correspondances : le launcher s'arrête et liste les candidats.
:::

## Étape 1 : Spécification détaillée

**Agent** : `legacy-feature-analyzer` (Opus)

**Prompt** : `Feature : <feature>`, rien d'autre (jamais une autre spec citée en exemple : l'agent part du seul code legacy). L'étape est sautée si la spec existe déjà avec ses 14 sections.

**Entrée** : Code source legacy + inventaire fonctionnel

**Sortie** : `output/features/<feature>_spec.md` (14 sections)

### Les 14 sections

Chaque section a un titre `## N. Titre` (N = 1 à 14, dans cet ordre), précédé de son ancre `<a id="sec-N"></a>` :

1. Vue d'Ensemble
2. Référence à l'Implémentation Source
3. Scénarios Utilisateur
4. Points d'Interaction
5. Règles Métier
6. Règles de Validation des Données
7. Gestion de l'État
8. Contrôle d'Accès & Autorisation
9. Gestion des Erreurs
10. Cas Limites & Scénarios Spéciaux
11. Points d'Intégration
12. Considérations pour les Tests
13. Notes de Migration
14. Annexe

### Arbitrage des écarts au legacy

Les sections 1 à 12 décrivent le legacy tel qu'il est. La section 13 contient les « Transpositions Techniques Appliquées » et le tableau « Écarts au Legacy ». Le launcher présente chaque ligne `À arbitrer` à l'utilisateur (comportement legacy et sa source, proposition, recommandation de l'agent) et écrit sa réponse dans la colonne `Décision` : `Reproduire` ou `Corriger : <règle retenue>`. Tant qu'une ligne vaut `À arbitrer`, le pipeline ne passe pas à l'étape 2.

### Checkpoint

```
✅ Fichier output/features/Search_Engine_spec.md existe
✅ 14 sections ## N. dans l'ordre, chacune précédée de son ancre sec-N
✅ Section 13 : transpositions + tableau « Écarts au Legacy »
✅ Aucune ligne « À arbitrer »
→ Étape 1 bis (sync wiki de la spec), puis étape 2
```

### Affinement (optionnel)

Si la spec nécessite des corrections, l'agent `legacy-feature-analyzer-refiner` (Sonnet) peut l'enrichir sans changer sa nature. Il enrichit directement `<feature>_spec.md` (pas de nouveau fichier) et met à jour l'arbre des features.

## Étape 2 : Planification

**Agents** : `backend-tasks-planner` puis `frontend-tasks-planner` (Sonnet), prompt `Feature : <feature>`. Le planner frontend n'est lancé qu'après le checkpoint backend.

**Entrée** : Spécification détaillée

**Sorties** :
- `output/analysis/backend/<feature>_backend_analysis.md`
- `output/analysis/frontend/<feature>_frontend_analysis.md`

Un planner est sauté si son analyse existe déjà avec au moins une tâche (`#### BACKEND-0xx`, resp. `#### FRONTEND-0xx`) : une reprise ne réécrase pas les statuts des tâches.

### Contenu de l'analyse backend

- Mapping source → cible (patterns PHP → Symfony)
- Liste de tâches atomiques avec dépendances
- Schéma de base de données (entités, relations)
- Spécification OpenAPI pour les endpoints
- Estimation de complexité par tâche

### Contenu de l'analyse frontend

- Mapping UI source → composants cibles
- Liste de tâches avec intégration API
- Consultation de la spec OpenAPI pour les contrats
- Points de responsive design
- Stratégie de gestion d'état

### Checkpoint

```
✅ Fichier _backend_analysis.md existe
✅ Tâches au format « #### BACKEND-001 : <titre> » avec « - **Status** : »
   (Unprocessed après une planification neuve)
✅ Chaque tâche a : titre, description, critères d'acceptation
✅ Les dépendances réfèrent des IDs existants dans le même fichier
✅ L'ordre d'exécution est défini
✅ Spec OpenAPI incluse si des endpoints sont créés
✅ Fichier _frontend_analysis.md existe, tâches « #### FRONTEND-001 : <titre> »
✅ FRONTEND-001 configure le client HTTP s'il n'existe pas encore (sinon le réutilise)
✅ Les endpoints référencés existent dans openapi.yaml
   ou dans la section « Spécification OpenAPI » de l'analyse backend
→ Étape 2 bis (sync wiki : feature « Planifiée »), puis étape 3
```

## Étape 3 : Implémentation TDD

**Agents** : `backend-tasks-executor` puis `frontend-tasks-executor` (Sonnet) : tout le backend d'abord, puis le frontend

**Entrée** : Fichiers d'analyse + skills de conventions

**Sortie** : Code source + tests dans les projets cibles, un commit par lot

### Processus Test First (backend)

Pour chaque tâche de l'analyse :

```
1. Lire la référence skill (ex: create-entity.md)
2. Écrire le test
3. Vérifier qu'il échoue (Red)
4. Implémenter le code
5. Vérifier que le test passe (Green)
6. Refactorer si nécessaire
7. Mettre à jour le statut : "Processed" (ou "Blocked" avec la raison)
```

### Lots de tâches

Le launcher ne confie jamais toute l'analyse à un executor : il boucle par **lots de 3 tâches au plus** (au-delà, l'executor atteint son `maxTurns` de 60). Il relève les tâches `Unprocessed` dans l'ordre d'exécution, en excluant celles dont une dépendance est `Blocked`, et lance :

```text
Feature : User_Authentication — Taches : BACKEND-001, BACKEND-002, BACKEND-003 — Derniere serie : non
```

`Derniere serie : oui` marque le dernier lot : l'executor génère alors la documentation de la feature (`<cible>/docs/features/<feature>.md`). Un résultat `partiel` (`maxTurns` atteint) est repris par SendMessage jusqu'à la fin du lot ; si cela se répète, le launcher passe à des lots de 2 tâches plutôt que d'augmenter `maxTurns`.

### Commande d'exécution

```bash
cd api-rest-symfony-target && docker compose exec -T app php bin/phpunit 2>&1
```

Le répertoire courant revient à la racine du projet après chaque commande Bash (`CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` dans le bloc `env` de `.claude/settings.json`), d'où le `cd <cible> &&` en tête de chaque commande. Pas de `| cat` : un tube renverrait le code de sortie de `cat` et masquerait l'échec.

### Suivi des tâches

Chaque tâche dans l'analyse passe de `Unprocessed` à `Processed` avec :
- Date de complétion
- Nombre de tests écrits
- Déviations par rapport au plan (et justification)

Une tâche impossible à réaliser telle que planifiée passe à `Blocked`, avec la raison et une alternative proposée. Ses dépendantes (y compris les tâches frontend qui citent un endpoint « prévu BACKEND-00X » bloqué) restent `Unprocessed` et sont exclues des lots suivants.

**Tâche bloquée** : le launcher commite d'abord le lot, affiche la raison, l'alternative et les tâches en attente, puis demande à l'utilisateur comment continuer. Si une alternative est retenue, il remplace `- **Status** : Blocked` par `- **Status** : Unprocessed` et ajoute juste en dessous une ligne `- **Decision** : <alternative retenue>`, que l'executor applique au lot suivant. Sans alternative retenue, la tâche reste `Blocked`.

### Checkpoint (après chaque lot)

```
✅ Tâches du lot « Processed » ou « Blocked » (ou restées « Unprocessed »
   parce qu'une dépendance est « Blocked »)
✅ Backend : critère de /dev:php-test (code retour 0 et au moins un test exécuté)
✅ Frontend : npm run typecheck sans erreur, puis npm test -- --run sans échec
→ Commit du lot, puis lot suivant
```

Si les tests échouent : STOP, erreurs affichées, rien n'est commité.

### Commit du lot

Les executors ne commitent pas : c'est le launcher qui vérifie et commite chaque lot. Il lance d'abord `/mod-generate-docs <feature> status` (si le wiki existe) pour que le tableau de bord du wiki entre dans le même commit, puis fait un `git add` ciblé (fichiers listés par l'executor et par `/mod-generate-docs`, spec et analyses de la feature) et un `git commit` au format Conventional Commits.

::: info Chez nous
La rule `git` interdit à Claude de lancer `git commit` (il propose `/dev:commit`), avec une exception : `/mod-migrate-feature` commite chaque lot vérifié. Chaque commit reste validé par l'utilisateur, car `Bash(git commit *)` est dans la liste `ask` de `.claude/settings.json`.
:::

**Passage final** : s'il ne reste aucune tâche éligible et que la documentation de l'executor n'existe pas (le dernier lot n'a jamais été lancé, les tâches restantes étant bloquées), le launcher relance l'executor avec `Feature : <feature> — Taches : aucune — Derniere serie : oui`, qui ne génère que la documentation, puis commite.

## Étape 4 : Rapport de conformité

**Agent** : `conformity-reporter` (Sonnet), prompt `Feature : <feature>`

**Entrée** : Spécification + analyse + code implémenté

**Sortie** : `output/reports/<feature>_CONFORMITY_REPORT.md` (V1), puis `<feature>_CONFORMITY_REPORT-V<N>.md` (V2+)

### Système de scoring

Barème des déductions, plafonds par section et pondération du score global : voir [Méthodologie — Étape 4](/guide/methodology#etape-4).

### Versioning

Les rapports ne sont **jamais écrasés**. Chaque évaluation produit une nouvelle version :

```
output/reports/
├── Search_Engine_CONFORMITY_REPORT.md      # V1 : première évaluation (sans suffixe)
├── Search_Engine_CONFORMITY_REPORT-V2.md   # Après corrections (boucle qualité)
└── Search_Engine_CONFORMITY_REPORT-V3.md   # Uniquement après intervention manuelle
```

La boucle qualité automatique s'arrête à V2 : une V3 n'est produite qu'après intervention humaine.

La documentation utilise toujours la **dernière version**.

### Commit de conformité

Le launcher synchronise le wiki (`/mod-generate-docs <feature>` : page de conformité, score dans les tableaux de bord), puis commite le rapport, les fichiers du wiki et les fichiers de la feature encore non commités. Ce commit sert de référence au rapport V2, dont l'analyse est incrémentale depuis le V1.

À la relance, l'étape est sautée si le dernier rapport est déjà commité et que le code des cibles n'a pas changé depuis ; un rapport écrit mais pas encore commité est commité sans relancer l'agent.

### Exemple de rapport

Extrait simplifié du template de `mod-conformity-conventions` :

```markdown
# Search_Engine — Rapport de Conformite

> 🔵 85/100 — Approuvé avec conditions

### Conformités
- ✅ Endpoints REST corrects (GET /api/ads, GET /api/ads/stats)
- ✅ DTOs de réponse avec serialization groups
- ✅ Repository avec critères de recherche

### Non-conformités
- ❌ 🟠 High (-10) : Pagination non implémentée
- ❌ 🟡 Medium (-5) : Tri par pertinence manquant

### Recommandation
Approuvé avec conditions (80-89) — Implémenter la pagination avant merge.
```

## Étape 5 : Boucle qualité

**Pattern** : LLM-as-Judge, **une seule passe de correction**, puis rapport V2 (pas de V3 automatique). Seuil et arrêt pour intervention humaine : voir [Méthodologie — Étape 5](/guide/methodology#etape-5).

Si le V1 est sous 80/100, le launcher extrait les issues Critical et High et les répartit par executor selon leur localisation ; celles qu'aucun executor ne peut corriger (alignement avec les analyses, fichiers de spec, d'analyse ou de rapport) sont listées à l'utilisateur. Chaque executor est relancé en **MODE CORRECTION**, par lots de 3 corrections au plus, avec checkpoint et commit après chaque lot :

```text
Feature : <feature> — Corrections : <ID> <localisation> <attendu> ; … — Derniere serie : non
```

L'executor ajoute une ligne `- **Correction** : <ID> — …` dans son analyse. Le rapport V2 n'est demandé que lorsque toutes les issues envoyées ont leur ligne. Si le V2 reste sous 80/100, ou si l'on relance le pipeline sur un V2 insuffisant : STOP, intervention humaine.

### Checkpoint

```
✅ Score du rapport final (V1 ou V2) ≥ 80/100
→ Étape 6
```

## Étape 6 : Synchronisation du wiki

Si `WIKI_TARGET` existe, `/mod-generate-docs <feature>` publie l'état final de la feature (sinon l'étape est ignorée).

```
✅ Aucune erreur dans le retour de /mod-generate-docs
✅ Pages modernisation/<slug>.md, modernisation/api/<slug>.md,
   modernisation/frontend/<slug>.md et modernisation/conformity-<slug>.md
✅ Ces pages référencées dans la sidebar de docs/.vitepress/config.ts
→ Pipeline terminé
```

## Résilience du pipeline

### Reprise sur échec

Chaque étape vérifie ses fichiers de sortie avant de passer à la suivante. Relancer la même commande reprend le pipeline à l'étape qui a échoué :

```bash
# Reprend à l'étape échouée (ex : implémentation), sans refaire spec ni planification
/mod-migrate-feature Search_Engine
```

- **Analyses conservées** : un planner n'est pas relancé si son analyse contient déjà des tâches (les statuts sont préservés).
- **Lot interrompu** : à l'entrée de l'étape 3, `git status --porcelain` sur la cible et les fichiers de la feature ; une sortie non vide signale un lot non commité. Le launcher rejoue le checkpoint du lot : vert → commit puis lot suivant ; rouge → STOP. Les tests en échec sont corrigés par l'utilisateur ou par l'executor en MODE CORRECTION (`Feature : <feature> — Corrections : <test en échec> <fichier de test> test vert ; … — Derniere serie : non`).
- **Rapport réutilisé** : l'étape 4 est sautée si le dernier rapport est commité et le code inchangé ; une boucle de correction interrompue reprend avec les seules issues sans ligne `- **Correction**`.

### Fichiers intermédiaires = relais

Les agents ne partagent pas de contexte : ils se passent le relais par fichiers. Voir [Méthodologie — Comment les agents communiquent](/guide/methodology#comment-les-agents-communiquent).

Le second canal est le retour de l'agent, normalisé : `Statut`, `Fichiers ecrits`, `Resultats`, `Points bloquants / decisions`. `Statut : partiel` (`maxTurns` atteint) → le launcher reprend le même agent par SendMessage (« Continuer ») avant le checkpoint ; `Statut : bloque` ou un point bloquant → question à l'utilisateur avant toute relance.

### Versions corrigées

Lors de la génération du wiki (`/mod-generate-docs`), si une version `-corrected` d'un fichier existe, elle a priorité :
- `Search_Engine_spec.md` → version initiale
- `Search_Engine_spec-corrected.md` → version à utiliser

## Parallélisme et séquence {#parallelisme-et-sequence}

**Règle du projet** : **un fichier = un seul écrivain**, et une étape qui lit la sortie d'une autre reste **après** elle. Les patterns séquentiel, parallèle et hiérarchique sont décrits dans [Agents — Patterns d'orchestration](/concepts/agents#patterns-d-orchestration).

| Étape | Mode | Pourquoi |
|-------|------|----------|
| `/mod-analyze-legacy` : analyse technique → inventaire → audit | Séquence | La skill impose l'ordre et vérifie la sortie de chaque étape (checkpoint) avant la suivante |
| `/mod-analyze-legacy` étape 4 : une spec par feature (`legacy-feature-analyzer`) | **Parallèle**, en **MODE BATCH**, par vagues de 4 agents au plus | Chaque agent n'écrit que son `*_spec.md` ; l'orchestrateur met à jour `0-index.md` et `0-features-tree.json` une seule fois, à la fin, et ne passe `analyzed` que les features dont la spec a ses 14 sections (les autres sont listées comme échecs à relancer) |
| `/mod-migrate-feature` : spec → planner backend → planner frontend → executor backend → executor frontend → conformité | Séquence | Le planner frontend s'appuie sur le contrat OpenAPI défini côté backend ; l'executor frontend appelle l'API que le backend vient d'implémenter |
| Migrer **deux features** en même temps | À éviter | Même `openapi.yaml`, même stack Docker (voir [WARN-001](#warn-001)) |

Les règles anti-conflits viennent de la skill projet `claude-code-parallel-agents`, écrite après un lancement de 13 agents en parallèle qui a mal tourné. Les deux pièges constatés sont décrits dans la page Agents : [WARN-005](/concepts/agents#warn-005) (agents parallèles qui écrivent le même fichier) et [WARN-006](/concepts/agents#warn-006) (`maxTurns` sous-dimensionné, sortie partielle sans erreur).

Le prompt que `/mod-analyze-legacy` envoie à chaque agent de l'étape 4 (une vague de 4 agents au plus, la suivante après la fin de la précédente) :

```text
MODE BATCH — Feature : User_Authentication
```

`MODE BATCH` fait sauter à l'agent la sélection interactive et la mise à jour de `0-index.md` / `0-features-tree.json` : il n'écrit que la spec. La skill `claude-code-parallel-agents` décrit une forme générique plus riche, qui pré-charge aussi les fichiers source et les chemins dans le prompt pour économiser des tours de découverte.

### Worktree et Docker

`isolation: worktree` donne à un subagent sa **propre copie** du dépôt (un git worktree) ; sans isolation, tous les agents travaillent dans le **même checkout**. La question à se poser : *l'agent a-t-il besoin de la stack Docker du projet ?*
- Non (analyse du legacy, documentation) → le worktree est possible.
- Oui (executors qui lancent les tests) → **pas de worktree** sans stack dédiée (voir [WARN-002](#warn-002)).

Aucun agent du projet n'utilise `isolation: worktree`. Les agents parallèles (analyse des features) n'en ont pas besoin : le MODE BATCH suffit, puisqu'ils écrivent chacun dans un fichier différent.

#### ⚠️ `WARN-001` : Migrer deux features en parallèle {#warn-001}

*Origine : conséquence de la configuration du projet (un seul `OPENAPI_SPEC` déclaré dans CLAUDE.md, une seule stack Docker), même mécanisme que le conflit entre agents parallèles ([Agents — WARN-005](/concepts/agents#warn-005)).*

Le MODE BATCH protège l'analyse, pas la migration. Deux `/mod-migrate-feature` en même temps lancent deux `backend-tasks-executor` qui mettent tous deux à jour **le même** `api-rest-symfony-target/docs/openapi.yaml` et lancent leurs tests dans **le même** conteneur `app`.

::: danger Problème
```text
/mod-migrate-feature user-authentication  ┐ en même temps
/mod-migrate-feature product-list         ┘
→ les deux executors réécrivent openapi.yaml : les endpoints de l'un disparaissent
→ les tests de l'un tournent pendant que l'autre modifie le code : échecs qui ne
  correspondent à aucune des deux features
```
:::

::: info Solution
```text
Migrer les features l'une après l'autre.
Le parallélisme se fait en amont : analyser toutes les features en MODE BATCH,
puis migrer en séquence : attendre la fin du pipeline d'une feature
(commit de conformité) avant de lancer la suivante.
```
:::

#### ⚠️ `WARN-002` : Isoler un executor en worktree alors que les tests tournent dans Docker {#warn-002}

*Origine : bonne pratique déduite de la configuration du projet (toutes les commandes backend via `docker compose exec`).*

Un worktree est un **nouveau checkout**, dans `.claude/worktrees/`. Les conteneurs d'une stack de développement montent en général le checkout principal : `docker compose exec -T app …` lancé depuis le worktree s'exécute dans un conteneur qui voit **l'autre** copie du code.

::: danger Problème
```yaml
# backend-tasks-executor
isolation: worktree
# → l'agent modifie le code de son worktree
# → docker compose exec -T app php bin/phpunit teste le code du checkout principal
# → tests verts sur du code qui n'est pas le sien
```
:::

::: info Solution
Réserver `isolation: worktree` aux agents qui n'ont pas besoin de la stack (analyse, documentation), ou démarrer une stack Docker dédiée dans le worktree.
:::

### Avant de lancer

- [ ] Les agents lancés en parallèle écrivent chacun **un fichier différent** ; les fichiers partagés sont mis à jour par l'orchestrateur à la fin.
- [ ] Le prompt de chaque agent parallèle contient `MODE BATCH` ; les agents sont lancés par vagues de 4 au plus.
- [ ] `maxTurns` ≥ fichiers à lire + fichiers à écrire + 10 ([WARN-006](/concepts/agents#warn-006)).
- [ ] Les executors reçoivent des lots de 3 tâches au plus (`maxTurns` 60).
- [ ] Les étapes de `/mod-migrate-feature` restent en séquence ; une seule feature migrée à la fois.
- [ ] Aucun executor qui lance les tests Docker n'est isolé en worktree.

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
