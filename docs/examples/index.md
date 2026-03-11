# Cas d'usage réel : Modernisation Legacy

## Contexte

Ce projet utilise Claude Code pour migrer une application PHP legacy vers une architecture moderne :

- **Source** : PHP procédurale, MySQL, pas de framework
- **Cible backend** : Symfony 7.4, PostgreSQL, API REST, JWT
- **Cible frontend** : SPA avec appels HTTP directs à l'API

L'écosystème Claude Code orchestre l'ensemble du processus, de l'analyse initiale à la documentation finale.

## Vue d'ensemble du pipeline

```
Phase 1 : Analyse
├── Analyse technique (reverse engineering)
├── Inventaire fonctionnel (features, rôles, flux)
└── Audit (enrichissement, features manquantes)

Phase 1.5 : Visualisation
├── Graphe de dépendances (ECharts force-directed)
└── Arbre fonctionnel (ECharts tree)

Phase 2 : Migration (par feature)
├── Spécification détaillée (12 sections)
├── Planification backend + frontend
├── Implémentation TDD (tests avant code)
└── Rapport de conformité (scoring)

Phase 3 : Documentation
└── Site VitePress adaptatif
```

## Dimensionnement

| Composant | Quantité |
|-----------|----------|
| Agents | 13 (3 Opus + 8 Sonnet + 3 Haiku) |
| Skills | 8 (4 launchers + 3 passives + 1 framework) |
| Rules | 7 (1 globale + 6 ciblées) |
| Commands | 4 (commit, test, lint, review) |
| Références | 20 fichiers de documentation technique |
| Features migrées | 14+ (auth, annonces, recherche, catégories...) |

## Invocation

Tout le workflow est déclenché par 4 slash commands :

```bash
# 1. Analyser le legacy
/modernization/analyze-legacy

# 1.5. Générer les visualisations
/modernization/generate-visualization

# 2. Migrer chaque feature
/modernization/migrate-feature Search_Engine
/modernization/migrate-feature User_Authentication
# ...

# 3. Générer la documentation
/modernization/generate-docs all
```

## Pages de détail

- [Structure du projet .claude/](/examples/project-structure) — Organisation complète des fichiers
- [Pipeline de migration](/examples/pipeline) — Détail de chaque étape
- [Stratégie de modèles](/examples/model-strategy) — Choix opus/sonnet/haiku
