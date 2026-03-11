# Stratégie de modèles

## Principe

Le choix du modèle pour chaque agent est une décision architecturale qui impacte directement la qualité, la vitesse et le coût. La règle : **utiliser le modèle le moins coûteux qui produit la qualité requise**.

## Matrice de sélection

| Critère | Opus | Sonnet | Haiku |
|---------|------|--------|-------|
| Raisonnement complexe | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Suivi d'instructions | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Vitesse | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Coût | $$$ | $$ | $ |
| Fenêtre de contexte | 1M tokens | 200k tokens | 200k tokens |

## Répartition du projet

### Opus — Analyse approfondie (2 agents)

```yaml
# legacy-technical-analyzer.md
model: opus
# Justification : reverse engineering complet d'un codebase inconnu
# Nécessite : raisonnement multi-étapes, déduction d'architecture

# legacy-feature-analyzer.md
model: opus
# Justification : spécification 12 sections depuis du code non documenté
# Nécessite : compréhension profonde du métier et des flux
```

**Pourquoi Opus ?** Ces tâches demandent de comprendre un codebase entier sans documentation, déduire l'architecture, les patterns et les règles métier implicites. Sonnet ne produit pas la même profondeur d'analyse.

### Sonnet — Implémentation et planification (8 agents)

```yaml
# backend-tasks-planner.md / frontend-tasks-planner.md
model: sonnet
# Justification : décomposition structurée avec spec en entrée
# La spec Opus fournit le contexte — Sonnet exécute

# backend-tasks-executor.md / frontend-tasks-executor.md
model: sonnet
# Justification : TDD avec conventions claires (skills)
# Les skills fournissent les patterns — Sonnet applique

# conformity-reporter.md
model: sonnet
# Justification : évaluation avec grille de scoring définie
# Le framework est clair — Sonnet juge et score

# legacy-feature-analyzer-refiner.md
model: sonnet
# Justification : affinement d'une spec existante (pas création)

# legacy-functional-analyzer.md
model: sonnet
# Justification : inventaire structuré avec patterns connus
```

**Pourquoi Sonnet ?** Ces agents ont un contexte clair (spécifications, conventions, analyses) et appliquent des patterns définis. Le raisonnement créatif d'Opus n'est pas nécessaire.

### Haiku — Tâches légères (3 agents)

```yaml
# legacy-functional-analyzer-auditor.md
model: haiku
# Justification : vérification d'un inventaire existant
# Tâche de comparaison, pas de création

# documentation-generator.md
model: haiku
# Justification : génération de Markdown structuré
# Template clair, pas de raisonnement complexe

# health-check.md
model: haiku
# Justification : vérification d'existence de fichiers
# Diagnostics simples et rapides
```

**Pourquoi Haiku ?** Ces tâches sont structurées, répétitives et ne demandent pas de raisonnement complexe. Haiku est 10x moins cher que Sonnet pour un résultat équivalent.

## Impact sur les coûts

### Estimation par feature migrée

| Étape | Agent | Modèle | Tokens estimés |
|-------|-------|--------|----------------|
| Spécification | feature-analyzer | Opus | ~50k input + ~10k output |
| Planification backend | backend-planner | Sonnet | ~30k input + ~8k output |
| Planification frontend | frontend-planner | Sonnet | ~25k input + ~6k output |
| Implémentation backend | backend-executor | Sonnet | ~40k input + ~20k output |
| Implémentation frontend | frontend-executor | Sonnet | ~35k input + ~15k output |
| Conformité | conformity-reporter | Sonnet | ~30k input + ~5k output |

### Optimisation

1. **Opus seulement quand nécessaire** — L'analyse technique se fait une seule fois pour tout le projet
2. **Skills comme contexte** — Les références évitent à Sonnet de "deviner" les conventions
3. **Haiku pour le répétitif** — Documentation et audits en série

## Decision tree

```
La tâche nécessite-t-elle de comprendre du code non documenté ?
├── OUI → Opus
└── NON
    La tâche produit-elle du code ou des spécifications ?
    ├── OUI → Sonnet
    └── NON
        La tâche suit-elle un template clair ?
        ├── OUI → Haiku
        └── NON → Sonnet (par défaut)
```

## Quand monter en puissance

Signaux qu'un agent Haiku devrait être Sonnet :
- Sorties incomplètes ou mal structurées
- Oubli de sections dans les templates
- Mauvaise interprétation des instructions complexes

Signaux qu'un agent Sonnet devrait être Opus :
- Analyse superficielle de code complexe
- Spécifications qui manquent des cas limites
- Mauvaise déduction d'architecture implicite

## Leçon apprise

> **Le refiner est passé de Haiku à Sonnet** après avoir constaté que Haiku produisait des affinements trop superficiels. L'affinement de spécifications nécessite de comprendre le contexte métier, pas juste de reformuler.
