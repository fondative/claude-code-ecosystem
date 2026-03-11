# Standard Agent Skills

## Définition

Agent Skills est un **standard ouvert** initié par Anthropic qui définit un format portable pour donner de nouvelles capacités aux agents IA. Un skill écrit une fois fonctionne sur tous les outils compatibles.

## Outils compatibles

Le standard est supporté par 30+ outils, dont :

| Outil | Éditeur |
|-------|---------|
| **Claude Code** | Anthropic |
| **Claude** (claude.ai) | Anthropic |
| **Cursor** | Cursor Inc. |
| **VS Code Copilot** | Microsoft |
| **GitHub Copilot** | GitHub/Microsoft |
| **Gemini CLI** | Google |
| **OpenAI Codex** | OpenAI |
| **Roo Code** | Roo Code Inc. |
| **Junie** | JetBrains |
| **OpenHands** | All Hands AI |
| **Goose** | Block |
| **Spring AI** | VMware/Broadcom |
| **Laravel Boost** | Laravel |

Liste complète : [agentskills.io](https://agentskills.io)

## Spécification du format

### Structure minimale

```
my-skill/
└── SKILL.md        # Fichier d'entrée (obligatoire)
```

### Structure complète

```
my-skill/
├── SKILL.md           # Instructions principales
├── references/        # Documentation détaillée
│   ├── api-guide.md
│   └── examples.md
├── scripts/           # Scripts exécutables
│   └── validate.sh
└── templates/         # Templates à remplir
    └── output.md
```

### Format SKILL.md

```yaml
---
name: my-skill
description: Ce que fait la skill
---

Instructions en Markdown que l'agent suivra.
```

Le fichier contient :
1. **Frontmatter YAML** (optionnel) : métadonnées de configuration
2. **Contenu Markdown** : instructions pour l'agent

## Champs frontmatter (standard)

Le standard définit un ensemble minimal de champs. Chaque outil peut ajouter ses propres extensions.

### Champs universels

| Champ | Description |
|-------|-------------|
| `name` | Identifiant de la skill |
| `description` | Ce que fait la skill (pour la découverte automatique) |

### Extensions Claude Code

Claude Code ajoute des champs spécifiques :

| Champ | Description |
|-------|-------------|
| `disable-model-invocation` | Empêcher l'invocation automatique |
| `user-invocable` | Contrôler la visibilité dans le menu |
| `allowed-tools` | Restreindre les outils disponibles |
| `context` | Exécution isolée (`fork`) |
| `agent` | Type de sub-agent |
| `model` | Modèle à utiliser |
| `hooks` | Hooks de cycle de vie |

Voir [Référence Frontmatter](/reference/frontmatter) pour le détail complet.

## Philosophie

### Pourquoi un standard ouvert ?

1. **Portabilité** — Écrire une skill une fois, l'utiliser partout
2. **Partage** — Les équipes partagent leurs skills entre projets et outils
3. **Capitalisation** — Les connaissances organisationnelles sont versionnées en Git
4. **Interopérabilité** — Pas de lock-in sur un outil spécifique

### Principes de design

- **Simple** — Un dossier + un fichier Markdown
- **Extensible** — Chaque outil ajoute ses propres champs frontmatter
- **Découvrable** — Les descriptions permettent le chargement automatique
- **Versionnable** — Tout est du texte, stockable en Git

## Catégories de skills

### Connaissances de domaine

```yaml
---
name: legal-review
description: Règles de review pour les documents juridiques
---

Lors de la review de documents juridiques :
1. Vérifier la conformité RGPD
2. Identifier les clauses limitatives
3. ...
```

### Nouvelles capacités

```yaml
---
name: create-presentation
description: Créer des présentations PowerPoint
---

Pour créer une présentation :
1. Définir le plan
2. Générer le contenu par slide
3. Appliquer le template
```

### Workflows reproductibles

```yaml
---
name: release
description: Processus de release standard
disable-model-invocation: true
---

1. Bumper la version
2. Générer le changelog
3. Créer le tag Git
4. Publier le package
```

## Où trouver des skills

| Source | URL |
|--------|-----|
| Exemples officiels | [github.com/anthropics/skills](https://github.com/anthropics/skills) |
| Spécification | [agentskills.io/specification](https://agentskills.io/specification) |
| Reference library | [github.com/agentskills/agentskills](https://github.com/agentskills/agentskills) |

## Distribution

### Par projet

Committer `.claude/skills/` dans le repository :

```bash
git add .claude/skills/
git commit -m "feat: add project skills"
```

### Par plugin

Créer un répertoire de skills distribué via un plugin :

```
my-plugin/
└── skills/
    ├── skill-a/SKILL.md
    └── skill-b/SKILL.md
```

### Par organisation

Déployer via les managed settings au niveau enterprise pour que tous les développeurs en bénéficient.

## Ressources

- [Agent Skills — Site officiel](https://agentskills.io)
- [Spécification complète](https://agentskills.io/specification)
- [Repository GitHub](https://github.com/agentskills/agentskills)
- [Exemples de skills Anthropic](https://github.com/anthropics/skills)
- [Documentation Claude Code — Skills](https://code.claude.com/docs/en/skills)
