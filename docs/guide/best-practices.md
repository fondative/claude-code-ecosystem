# Bonnes pratiques

## Architecture du dossier .claude/

### Organiser par responsabilité

```
.claude/
├── settings.json              # Securite uniquement
├── agents/                    # 1 fichier = 1 responsabilite
│   ├── analyzer.md
│   ├── implementer.md
│   └── reviewer.md
├── skills/
│   ├── conventions/           # Skills passives (connaissances)
│   │   └── SKILL.md
│   ├── deploy/                # Skills launcher (workflows)
│   │   └── SKILL.md
│   └── framework/references/  # Documentation detaillee
├── rules/                     # Court, cible, contextuel
│   ├── backend.md
│   └── git.md
└── commands/                  # Actions ponctuelles
    └── dev/
        └── test.md
```

### Principe de responsabilité unique

| Composant | Responsabilité | Anti-pattern |
|-----------|---------------|-------------|
| CLAUDE.md | Chemins + workflow | Conventions détaillées |
| Rules | Rappels contextuels | Documentation complète |
| Skills passives | Conventions détaillées | Instructions d'exécution |
| Skills launchers | Orchestration | Conventions |
| Agents | Exécution d'une tâche | Multi-responsabilités |
| Commands | Actions utilisateur | Logique métier |

## Gestion des chemins

### Source unique de vérité

**Toujours** centraliser les chemins dans CLAUDE.md :

```markdown
| Alias | Chemin | Description |
|-------|--------|-------------|
| `SRC` | `./src/` | Code source |
| `TESTS` | `./tests/` | Tests |
| `DOCS` | `./docs/` | Documentation |
```

**Jamais** hardcoder dans les agents :

```markdown
# ❌ Mauvais
Lire les fichiers dans ./src/legacy/php-app/

# ✅ Bon
Lire les fichiers dans `SRC` (defini dans CLAUDE.md)
```

## Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Agents | `role-action.md` | `backend-tasks-executor.md` |
| Skills | `domaine/nom/SKILL.md` | `symfony/api-conventions/SKILL.md` |
| Rules | `domaine-contexte.md` | `legacy-readonly.md` |
| Commands | `categorie/action.md` | `dev/commit.md` |
| Références | `action-objet.md` | `create-entity.md` |
| Specs de features | `Feature_Name_spec.md` | `Search_Engine_spec.md` |

## Stratégie de modèles

### Règle du juste modèle

| Complexité | Modèle | Justification |
|------------|--------|---------------|
| Analyse approfondie | Opus | Raisonnement multi-étapes, contexte large |
| Implémentation | Sonnet | Équilibre qualité/vitesse |
| Documentation | Haiku | Tâche structurée, rapide |
| Health-check | Haiku | Diagnostics simples |

**Règle** : commencer par Haiku, monter en puissance seulement si la qualité ne suffit pas.

## Checkpoints et résilience

### Pattern de checkpoint

Entre chaque étape d'un pipeline, vérifier que les sorties existent :

```markdown
## Etape 1 : Analyse
Generer `output/analysis.md`

### Checkpoint
Verifier que `output/analysis.md` existe et contient > 100 lignes.
Si absent : STOP + message d'erreur + commande de relance.

## Etape 2 : Implementation
Lire `output/analysis.md` et implementer...
```

### Versioning des rapports

Ne jamais écraser un rapport existant :

```
output/reports/
├── Feature_REPORT-V1.md    # Premier rapport
├── Feature_REPORT-V2.md    # Apres corrections
└── Feature_REPORT-V3.md    # Version finale ← toujours utiliser celle-ci
```

## Skills : passive vs launcher

### Quand utiliser une skill passive ?

- Conventions de code (style, architecture, nommage)
- Connaissances de domaine (métier, API, schéma DB)
- Contexte que Claude doit connaître mais qui n'est pas une action

### Quand utiliser une skill launcher ?

- Workflows multi-étapes (migration, deploy, release)
- Actions avec effets de bord (commit, envoi de message)
- Pipelines orchestrant plusieurs agents

## Rules : court et ciblé

### Longueur idéale

- **< 30 lignes** : rappels essentiels
- Déléguer le détail aux skills
- Une rule doit être lisible en 10 secondes

### Pattern de délégation

```markdown
---
paths:
  - "api-rest-symfony-target/**"
---

# Backend Symfony

Charger la skill `symfony/api-conventions` pour les conventions.

Rappels :
- Docker : `docker compose exec -T app [cmd]`
- TDD obligatoire
```

## Erreurs les plus fréquentes

1. **CLAUDE.md trop long** — Pas de troncature technique, mais un fichier trop long noie les informations essentielles. Déléguer aux skills et `@import`
2. **Conventions dupliquées** — Même info dans rule + skill = désynchronisation
3. **Agent fourre-tout** — Un agent qui fait analyse + implémentation + review
4. **Pas de checkpoint** — Un agent échoue et le suivant tourne à vide
5. **Opus partout** — Coût x10 pour des tâches que Haiku fait aussi bien

## Ressources

- [How I use Claude Code](https://boristane.com/blog/how-i-use-claude-code/)
- [Documentation officielle](https://code.claude.com/docs/en/skills)
