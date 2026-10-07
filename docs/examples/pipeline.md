# Pipeline de migration

## Vue d'ensemble

Le pipeline de migration transforme une feature legacy en implémentation moderne à travers 5 étapes principales (1 à 5), encadrées par une étape 0 de pré-requis (vérification des stacks cibles, sinon proposition de `/dev/install-stack`) et une étape 6 de synchronisation du wiki (`/mod-generate-docs`, si le dossier wiki existe). Chaque étape a un checkpoint de vérification.

```
Spécification ──► Planification ──► Implémentation ──► Conformité ──► Boucle qualité
     │                  │                  │                │               │
     ▼                  ▼                  ▼                ▼               ▼
  _spec.md        _analysis.md         Code + Tests      _REPORT.md    Score ≥ 80
```

## Étape 1 : Spécification détaillée

**Agent** : `legacy-feature-analyzer` (Opus)

**Entrée** : Code source legacy + inventaire fonctionnel

**Sortie** : `output/features/[Feature]_spec.md` (12 sections)

### Les 12 sections

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

Le format de sortie se termine par deux sections complémentaires : Notes de Migration et Annexe.

### Checkpoint

```
✅ Fichier output/features/Search_Engine_spec.md existe
✅ Contient les 12 sections
✅ Scénarios couvrent les cas nominaux et limites
→ Passer à l'étape 2
```

### Affinement (optionnel)

Si la spec nécessite des corrections, l'agent `legacy-feature-analyzer-refiner` (Sonnet) peut l'enrichir sans changer sa nature. Il enrichit directement `[Feature]_spec.md` (pas de nouveau fichier) et met à jour l'arbre des features.

## Étape 2 : Planification

**Agents** : `backend-tasks-planner` + `frontend-tasks-planner` (Sonnet)

**Entrée** : Spécification détaillée

**Sorties** :
- `output/analysis/backend/[Feature]_backend_analysis.md`
- `output/analysis/frontend/[Feature]_frontend_analysis.md`

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
✅ Contient des tâches avec IDs (BACKEND-001, BACKEND-002...)
✅ Chaque tâche a : titre, description, critères d'acceptation
✅ Les dépendances réfèrent des IDs existants dans le même fichier
✅ L'ordre d'exécution est défini
✅ Spec OpenAPI incluse si des endpoints sont créés
✅ Fichier _frontend_analysis.md existe
✅ Contient des tâches avec IDs (FRONTEND-001, FRONTEND-002...)
✅ FRONTEND-001 est la configuration HTTP client
✅ Les endpoints référencés existent dans la spec OpenAPI
→ Passer à l'étape 3
```

## Étape 3 : Implémentation TDD

**Agents** : `backend-tasks-executor` + `frontend-tasks-executor` (Sonnet)

**Entrée** : Fichiers d'analyse + skills de conventions

**Sortie** : Code source + tests dans les projets cibles

### Processus Test First (backend)

Pour chaque tâche de l'analyse :

```
1. Lire la référence skill (ex: create-entity.md)
2. Écrire le test
3. Vérifier qu'il échoue (Red)
4. Implémenter le code
5. Vérifier que le test passe (Green)
6. Refactorer si nécessaire
7. Mettre à jour le statut : "Processed"
```

### Commande d'exécution

```bash
docker compose exec -T app php bin/phpunit --testsuite unit 2>&1 | cat
```

### Suivi des tâches

Chaque tâche dans l'analyse passe de `Unprocessed` à `Processed` avec :
- Date de complétion
- Nombre de tests écrits
- Déviations par rapport au plan (et justification)

### Checkpoint

```
✅ Tous les tests unitaires passent
✅ Tous les tests d'intégration passent
✅ Tous les tests fonctionnels passent
✅ Toutes les tâches marquées "Processed"
✅ L'application frontend compile sans erreur
→ Passer à l'étape 4
```

## Étape 4 : Rapport de conformité

**Agent** : `conformity-reporter` (Sonnet)

**Entrée** : Spécification + analyse + code implémenté

**Sortie** : `output/reports/[Feature]_CONFORMITY_REPORT.md` (V1), puis `[Feature]_CONFORMITY_REPORT-V[N].md` (V2+)

### Système de scoring

| Sévérité | Déduction |
|----------|-----------|
| Critique | -15 points |
| Élevée | -10 points |
| Moyenne | -5 points |
| Basse | -2 points |

Score initial : 100 points par section. Chaque non-conformité déduit selon sa sévérité, avec un plafond par section pour les sévérités Moyenne (max 25 points) et Basse (max 10 points) ; Critique et Élevée ne sont pas plafonnées.

Le score global pondère 4 catégories : Conformité aux guidelines projet (30 %), Cohérence de la codebase (25 %), Conformité aux spécifications (25 %), Alignement avec l'analyse (20 %).

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

### Exemple de rapport

```markdown
# Rapport de Conformité : Search_Engine (V1)

## Score global : 85/100

### Conformités
- ✅ Endpoints REST corrects (GET /api/ads, GET /api/ads/stats)
- ✅ DTOs de réponse avec serialization groups
- ✅ Repository avec critères de recherche

### Non-conformités
- ❌ ÉLEVÉE (-10) : Pagination non implémentée
- ❌ MOYENNE (-5) : Tri par pertinence manquant

### Recommandation
APPROUVÉ AVEC CONDITIONS (80-89) — Implémenter la pagination avant merge.
```

## Étape 5 : Boucle qualité

**Pattern** : LLM-as-Judge (maximum 2 itérations)

**Processus** :

1. Lire le score du rapport de conformité (étape 4)
2. Si score ≥ 80/100 : pipeline terminé avec succès
3. Si score < 80/100 :
   - Extraire les déductions CRITIQUES et ÉLEVÉES du rapport
   - Identifier l'executor concerné (backend ou frontend)
   - Relancer l'executor avec la liste des corrections
   - Relancer le conformity-reporter (rapport V2)
   - Si score V2 ≥ 80/100 : succès
   - Si score V2 < 80/100 : **STOP** — intervention humaine requise

### Checkpoint

```
✅ Score du rapport final (V1 ou V2) ≥ 80/100
✅ Aucune non-conformité CRITIQUE restante
→ Pipeline terminé
```

## Résilience du pipeline

### Reprise sur échec

Chaque étape vérifie ses fichiers de sortie avant de passer à la suivante. Relancer la même commande reprend le pipeline à l'étape qui a échoué :

```bash
# Reprend à l'étape échouée (ex : implémentation), sans refaire spec ni planification
/mod-migrate-feature Search_Engine
```

### Fichiers intermédiaires = relais

Les agents sont isolés (pas de contexte partagé). Les fichiers intermédiaires (`_spec.md`, `_analysis.md`) servent de point de passage entre agents.

### Versions corrigées

Lors de la génération du wiki (`/mod-generate-docs`), si une version `-corrected` d'un fichier existe, elle a priorité :
- `Search_Engine_spec.md` → version initiale
- `Search_Engine_spec-corrected.md` → version à utiliser
