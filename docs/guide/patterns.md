# Patterns d'orchestration multi-agents

## Vue d'ensemble

Les agents Claude Code peuvent être orchestrés selon différents patterns pour décomposer des tâches complexes. Le choix du pattern dépend de la nature des dépendances entre les tâches.

::: tip Référence complète
Cette page détaille les patterns avec des exemples. Pour la référence technique des agents (frontmatter, délégation, scopes), voir [Agents — Concepts](/concepts/agents).
:::

## Pattern 1 : Séquentiel (Pipeline)

Chaque agent termine avant que le suivant démarre. Les fichiers de sortie servent de relais.

```
Agent A ──► fichier.md ──► Agent B ──► fichier.md ──► Agent C
```

### Cas d'usage
- Migration de feature : Spec → Planification → Implémentation → Conformité
- Analyse legacy : Technique → Fonctionnel → Audit

### Implémentation (skill launcher)

```yaml
---
name: pipeline-migration
disable-model-invocation: true
---

# Migration $ARGUMENTS

## Etape 1 : Specification
Lancer l'agent `feature-analyzer` sur $ARGUMENTS.
**Checkpoint** : verifier que `output/features/$ARGUMENTS_spec.md` existe.

## Etape 2 : Planification
Lancer `backend-planner` puis `frontend-planner`.
**Checkpoint** : verifier que les fichiers _analysis.md existent.

## Etape 3 : Implementation
Lancer `backend-executor` puis `frontend-executor`.
**Checkpoint** : tous les tests passent.

## Etape 4 : Conformite
Lancer `conformity-reporter`.
```

### Forces et faiblesses

| + | - |
|---|---|
| Simple à comprendre | Lent (pas de parallélisme) |
| Chaque étape vérifiable | Un échec bloque tout |
| Fichiers intermédiaires = traçabilité | Couplage fort entre étapes |

## Pattern 2 : Parallèle (Fan-out)

Plusieurs agents travaillent simultanément sur des tâches indépendantes.

```
         ┌── Agent A (backend) ──┐
Input ───┤                       ├──► Merge
         └── Agent B (frontend) ─┘
```

### Cas d'usage
- Planification backend + frontend en parallèle
- Analyse de sécurité + performance + qualité simultanée
- Review multi-critères

### Implémentation

Claude Code lance naturellement des agents en parallèle quand les tâches sont indépendantes :

```yaml
---
name: parallel-analysis
---

Lancer en PARALLELE :
1. Agent `security-auditor` sur le dossier src/
2. Agent `performance-analyzer` sur le dossier src/
3. Agent `quality-reviewer` sur le dossier src/

Attendre les 3 resultats, puis synthetiser.
```

### Forces et faiblesses

| + | - |
|---|---|
| Rapide (exécution simultanée) | Tâches doivent être indépendantes |
| Bon ratio coût/temps | Merge des résultats peut être complexe |
| Scalable | Consomme plus de tokens simultanément |

## Pattern 3 : Hiérarchique (Délégation)

Un agent orchestrateur délègue à des agents spécialisés qui peuvent eux-mêmes déléguer.

```
Orchestrateur
├── Agent Analyse
│   ├── Sub-agent Technique
│   └── Sub-agent Fonctionnel
├── Agent Implementation
│   ├── Sub-agent Backend
│   └── Sub-agent Frontend
└── Agent Validation
```

### Cas d'usage
- Projets complexes avec sous-domaines
- Workflows où chaque domaine a sa propre logique
- Systèmes multi-équipes

### Implémentation

```yaml
---
name: full-modernization
disable-model-invocation: true
---

# Modernisation complete

## Phase 1 : Analyse (parallele)
Lancer en parallele :
- `legacy-technical-analyzer`
- `legacy-functional-analyzer`

## Phase 2 : Audit
Lancer `legacy-functional-analyzer-auditor`

## Phase 3 : Migration par feature
Pour chaque feature dans 0-index.md :
  Lancer `/modernization/migrate-feature [feature]`
  (qui lui-meme orchestre 4 agents)

## Phase 4 : Documentation
Lancer `/modernization/generate-docs all`
```

## Pattern 4 : LLM-as-Judge (Évaluation)

Un agent évaluateur note la sortie d'un agent exécuteur.

```
Executor ──► output ──► Judge ──► score
                           │
                           └── si score < seuil ──► re-execution
```

### Cas d'usage
- Conformité d'implémentation vs spécification
- Quality gates avant merge
- Validation de documentation

### Implémentation

```yaml
---
name: implement-and-validate
---

# Boucle implementation-validation

1. Lancer `backend-executor` pour la tache $ARGUMENTS
2. Lancer `conformity-reporter` sur le resultat
3. Si score < 80% :
   - Identifier les deductions majeures
   - Relancer `backend-executor` avec les corrections
   - Re-evaluer (max 2 iterations)
4. Si score >= 80% : DONE
```

## Choisir le bon pattern

```
La tache suivante depend-elle de la precedente ?
├── OUI → Sequentiel
└── NON
    Les taches sont-elles de meme niveau ?
    ├── OUI → Parallele
    └── NON
        Y a-t-il des sous-taches dans les taches ?
        ├── OUI → Hierarchique
        └── NON → Parallele
```

## Combiner les patterns

En pratique, les projets réels combinent plusieurs patterns :

```
Phase 1 : Analyse (PARALLELE)
├── Technique (sequentiel interne)
└── Fonctionnel (sequentiel interne)

Phase 2 : Migration par feature (SEQUENTIEL entre features)
├── Spec → Plan → Impl → Conformite (SEQUENTIEL par feature)
│         ├── Backend (PARALLELE avec Frontend si possible)
│         └── Frontend
└── Evaluation (LLM-AS-JUDGE)

Phase 3 : Documentation (SEQUENTIEL)
```

## Bonnes pratiques

::: tip À faire
- Utiliser des checkpoints fichiers entre les agents
- Préférer le parallèle quand les tâches sont indépendantes
- Limiter la profondeur hiérarchique à 2-3 niveaux
- Documenter le flux dans la skill launcher
:::

::: danger À éviter
- Paralléliser des tâches avec dépendances (résultats incohérents)
- Hiérarchie trop profonde (perte de contexte, coût)
- Agent orchestrateur qui fait aussi de l'exécution
- Oublier les conditions d'arrêt dans les boucles LLM-as-Judge
:::

## Ressources

- [Documentation officielle — Sub-agents](https://code.claude.com/docs/en/sub-agents)
