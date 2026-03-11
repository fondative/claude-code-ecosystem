# Workflow Boris Tane

> **Source** : [How I Use Claude Code](https://boristane.com/blog/how-i-use-claude-code/) — Boris Tane, Engineering Lead chez Cloudflare (ex-fondateur Baselime). Publié le 10 février 2026.

## TL;DR

**Ne jamais laisser Claude écrire du code avant d'avoir validé un plan écrit.** Séparer recherche, planification et implémentation évite le gaspillage de tokens et produit de meilleurs résultats.

```
Research (research.md) → Plan (plan.md) → Annotation cycles → Implementation
```

---

## Phase 1 : Research

Claude analyse en profondeur les parties pertinentes du codebase. Les résultats sont documentés dans un fichier `research.md` persistant (pas un résumé verbal).

### Techniques clés

- Utiliser un langage explicite : *"deeply"*, *"in great details"*, *"intricacies"*, *"go through everything"*
- Exiger des artefacts écrits pour vérifier la compréhension
- Identifier les lacunes de compréhension **avant** de planifier

### Erreurs évitées grâce à la recherche

- Ignorer des couches de cache existantes
- Violer les conventions ORM
- Dupliquer de la logique existante ailleurs
- Manquer des contraintes architecturales

:::tip Principe
La recherche empêche les changements ignorants. Sans elle, Claude produit du code qui fonctionne en isolation mais casse le système environnant.
:::

---

## Phase 2 : Planning

Claude crée un `plan.md` détaillé (pas le mode plan intégré) contenant :

- L'approche d'implémentation expliquée
- Des snippets de code montrant les changements réels
- Les chemins des fichiers à modifier
- Les compromis et considérations

:::tip Astuce
Partager des implémentations de référence depuis des projets open-source. Claude travaille mieux à partir d'un exemple concret qu'en concevant from scratch.
:::

---

## Phase 3 : Cycle d'annotation

C'est la phase la plus originale du workflow. Elle se répète **1 à 6 fois** entre la planification et l'implémentation.

### Processus

1. Claude écrit `plan.md`
2. Le développeur relit dans l'éditeur et ajoute des **notes inline** directement dans le document
3. Le développeur renvoie à Claude avec la garde explicite : **"don't implement yet"**
4. Claude met à jour le plan selon les annotations
5. Cycle répété jusqu'à satisfaction

### Types d'annotations

| Type | Exemple |
|------|---------|
| Correction de domaine | *"Ce champ n'est pas nullable en prod"* |
| Clarification de contrainte | *"Rate limit = 100 req/min, pas 1000"* |
| Rejet d'approche | *"Non, utiliser le service existant"* |
| Exigence métier | *"Les admins voient tout, les users seulement leurs données"* |
| Redirect architecturale | *"Ça doit être un event, pas un appel synchrone"* |

### Pourquoi ça marche

- Le Markdown sert de **state mutable partagé** entre humain et IA
- Spécification structurée vs historique de chat dispersé
- Le développeur réfléchit à son rythme
- Corrections précises sans reconstruire le contexte

:::warning Étape finale
Demander un découpage granulaire en tâches avec un explicite **"don't implement yet"** avant de passer à l'implémentation.
:::

---

## Phase 4 : Implémentation

Un prompt standard encode toutes les exigences :

> *"Implement it all. When done with task/phase, mark completed in plan document. Do not stop until all tasks completed. Do not add unnecessary comments or jsdocs, do not use any or unknown types. Continuously run typecheck."*

### Éléments clés

| Élément | Objectif |
|---------|----------|
| *"Implement it all"* | Tout compléter sans s'arrêter |
| Plan comme source de vérité | Suivi de progression dans le document |
| Pas de pauses mid-flow | Exécution continue |
| Typage strict | Pas de `any` ni `unknown` |
| Typecheck continu | Vérification permanente pendant l'implémentation |

:::tip Principe
L'implémentation devient **mécanique, pas créative**. Toute la réflexion a déjà eu lieu dans les phases précédentes.
:::

---

## Feedback pendant l'implémentation

Le rôle du développeur passe à celui de **superviseur** avec des corrections directes et concises :

### Exemples de feedback

- **Mot unique** : *"wider"*, *"still cropped"*, *"2px gap"*
- **Niveau fonction** : *"You didn't implement deduplicateByTitle"*
- **Redirect de scope** : *"Move this to admin app, not main app"*
- **Visuel** : envoyer un screenshot pour les problèmes d'UI
- **Pattern** : *"Match existing users table exactly"*

### Gestion du scope

- **Revert complet** plutôt que patcher une approche échouée
- Utiliser `git` pour abandonner les changements quand la direction est mauvaise
- Restreindre les objectifs après un revert

---

## Rester aux commandes

Le développeur garde le contrôle à travers 5 leviers :

| Levier | Action |
|--------|--------|
| **Cherry-pick** | Évaluer chaque proposition individuellement |
| **Trim du scope** | Supprimer les nice-to-have et non-essentiels |
| **Protection des interfaces** | Contraintes strictes sur les signatures et APIs existantes |
| **Override technique** | Imposer le choix de librairie, modèle ou méthode |
| **Décision item par item** | Équilibrer complexité vs valeur immédiate |

---

## Structure de session

- Recherche, planification et implémentation dans **une seule session longue**
- Pas de découpage sur plusieurs sessions séparées
- L'auto-compaction de Claude garde la performance adéquate
- Le fichier `plan.md` survit à la compaction en pleine fidélité

---

## Résumé visuel

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Research    │───→│   Planning   │───→│   Annotation    │───→│Implementation│
│             │    │             │    │   Cycles (1-6)  │    │             │
│ research.md │    │  plan.md    │    │  plan.md edite  │    │ Code final  │
└─────────────┘    └─────────────┘    └─────────────────┘    └──────────────┘
                                            │       ↑
                                            │  "don't implement yet"
                                            └───────┘
```

---

## Liens avec l'écosystème Claude Code

| Concept Boris Tane | Équivalent Claude Code |
|--------------------|----------------------|
| `research.md` | Agent Explore / sub-agent read-only |
| `plan.md` | Mode Plan (`/plan`) ou skill launcher |
| Annotations inline | Feedback utilisateur dans la conversation |
| "Implement it all" | Agent d'implémentation (Sonnet) |
| Typecheck continu | Hook PostToolUse ou commande dans le prompt |
| Fichier persistant | CLAUDE.md / MEMORY.md |

---

## Ressources

- [Article original](https://boristane.com/blog/how-i-use-claude-code/) — Boris Tane
- [Boris Tane sur X/Twitter](https://x.com/boristane)
