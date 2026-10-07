# Cas d'usage réel : Modernisation Legacy

## Contexte

Ce projet utilise Claude Code pour migrer une application PHP legacy vers une architecture moderne :

- **Source** : PHP procédurale, MySQL, pas de framework
- **Cible backend** : Symfony 7.4, PostgreSQL, API REST, JWT
- **Cible frontend** : React 19 + TypeScript + Vite + Tailwind CSS 4, appels HTTP directs à l'API

L'écosystème Claude Code orchestre l'ensemble du processus, de l'analyse initiale à la documentation finale.

## Vue d'ensemble du pipeline

```
Phase 1 : Analyse
├── Analyse technique (reverse engineering)
├── Inventaire fonctionnel (features, rôles, flux)
├── Audit (enrichissement, features manquantes)
├── Specs détaillées en batch (optionnel)
├── Visualisations
└── Sync wiki (si le dossier wiki existe)

Phase 1.5 : Visualisation
├── Graphe de dépendances (ECharts force-directed)
└── Arbre fonctionnel (ECharts tree)

Phase 2 : Migration (par feature)
├── Pré-requis : stacks cibles installés
├── Spécification détaillée (12 sections)
├── Planification backend + frontend
├── Implémentation TDD (tests avant code)
├── Rapport de conformité (scoring)
├── Boucle qualité (max 2 itérations, seuil 80/100)
└── Sync wiki (si le dossier wiki existe)

Phase 3 : Documentation
└── Site VitePress adaptatif
```

## Dimensionnement

| Composant | Quantité |
|-----------|----------|
| Agents | 11 (2 Opus + 7 Sonnet + 2 Haiku) |
| Skills | 12 (4 launchers + 6 passives + 2 internes Claude Code) |
| Rules | 7 (1 globale + 6 ciblées) |
| Commands | 8 (commit, install-stack, php-test, php-lint, front-test, front-lint, symfony-review, frontend-review) |
| Références | 41 fichiers de documentation technique |
| Features migrées | 14+ (auth, annonces, recherche, catégories...) |

## Invocation

Tout le workflow est déclenché par 4 slash commands :

```bash
# 1. Analyser le legacy
/mod-analyze-legacy

# 1.5. Générer les visualisations
/mod-generate-visualization

# 2. Migrer chaque feature
/mod-migrate-feature Search_Engine
/mod-migrate-feature User_Authentication
# ...

# 3. Générer la documentation
/mod-generate-docs all
```

## Pages de détail

- [Structure du projet .claude/](/examples/project-structure) — Organisation complète des fichiers
- [Pipeline de migration](/examples/pipeline) — Détail de chaque étape
- [Stratégie de modèles](/examples/model-strategy) — Choix opus/sonnet/haiku
