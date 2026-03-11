# Rules

## TL;DR

| Aspect | Détail |
|--------|--------|
| **Quoi** | Instructions injectées automatiquement dans le contexte de Claude |
| **Où** | `.claude/rules/<nom>.md` (projet) ou `~/.claude/rules/` (user) |
| **Déclenchement** | Par glob pattern (`paths:`) ou global (sans paths) |
| **Taille** | < 30 lignes — déléguer le détail aux skills |
| **Relation** | Les rules rappellent, les skills détaillent |

---

## Qu'est-ce qu'une Rule ?

Une rule est un fichier Markdown dont le contenu est **automatiquement injecté dans le contexte de Claude** lorsque les fichiers manipulés correspondent à un pattern glob. Pas d'invocation manuelle, pas de commande — c'est transparent.

```
┌────────────────────────────────────────┐
│         INJECTION CONTEXTUELLE          │
│                                        │
│  Claude edite api-rest/src/Entity.php  │
│         │                              │
│         ▼                              │
│  Glob match: "api-rest/**"             │
│         │                              │
│         ▼                              │
│  ┌──────────────────────┐              │
│  │  rules/symfony-api.md │ ◄── injecte │
│  │  "PSR-12, Docker,    │              │
│  │   TDD obligatoire"   │              │
│  └──────────────────────┘              │
│                                        │
│  git.md (pas de paths) ───── toujours  │
└────────────────────────────────────────┘
```

::: info Rules vs Skills
Les rules sont chargées **à chaque session** (ou quand un fichier matche). Pour des instructions ponctuelles qui n'ont pas besoin d'être en contexte en permanence, utiliser une [skill](/concepts/skills) à la place.
:::

---

## Comment ça marche

### Format

```markdown
---
paths:
  - "api-rest-symfony-target/**"
---

# Conventions Backend

- Commandes via `docker compose exec -T app [cmd] 2>&1 | cat`
- Architecture : Controller → Service → Repository
- PSR-12, TDD obligatoire
```

### Deux types

| Type | Frontmatter | Déclenchement |
|------|------------|---------------|
| **Ciblée** | `paths: ["src/**"]` | Quand un fichier matche |
| **Globale** | Pas de `paths` | Toujours active (même priorité que `.claude/CLAUDE.md`) |

### Scopes et priorité

Les rules existent à plusieurs niveaux. Les plus spécifiques gagnent :

| Scope | Emplacement | Priorité | Partage |
|-------|-------------|----------|---------|
| **Managed policy** | `/etc/claude-code/CLAUDE.md` (Linux) | La plus haute (non excluable) | Organisation entière |
| **Projet** | `.claude/rules/*.md` | Haute | Équipe (git) |
| **User** | `~/.claude/rules/*.md` | Basse | Personnel (tous projets) |

::: tip User-level rules
`~/.claude/rules/` permet de définir des préférences personnelles (style de code, workflows) qui s'appliquent à **tous** vos projets sans polluer les rules du repo.
:::

### Découverte récursive

Les fichiers `.md` dans les sous-dossiers de `rules/` sont découverts automatiquement :

```
.claude/rules/
├── legacy-readonly.md
├── git.md
├── backend/
│   ├── symfony-api.md
│   └── docs.md
└── frontend/
    └── react.md
```

### Glob patterns avancés

Brace expansion pour matcher plusieurs extensions :

```yaml
paths:
  - "src/**/*.{ts,tsx}"    # TypeScript + JSX
  - "lib/**/*.ts"
  - "tests/**/*.test.ts"
```

| Pattern | Matche |
|---------|--------|
| `**/*.ts` | Tous les `.ts` récursifs |
| `src/**/*` | Tout sous `src/` |
| `*.md` | Markdown à la racine seulement |
| `src/components/*.tsx` | Composants dans un dossier spécifique |

### Symlinks

Les symlinks sont supportés pour partager des rules entre projets. Les liens circulaires sont détectés et ignorés.

```bash
# Partager un dossier de rules communes
ln -s ~/shared-claude-rules .claude/rules/shared

# Partager une rule individuelle
ln -s ~/company-standards/security.md .claude/rules/security.md
```

---

## Guide pratique : concevoir ses rules

### Quand utiliser une rule ?

```
Information < 30 lignes ?
├── OUI → Sous-ensemble de fichiers ? → RULE ciblee
│         Partout ? → RULE globale
│
└── NON → Workflow ? → SKILL launcher
          Conventions ? → SKILL passive + references
```

| Information | Composant | Raison |
|-------------|-----------|--------|
| "PSR-12 strict" | Rule | Court, contextuel |
| Guide PSR-12 avec 50 exemples | Skill passive | Trop long pour une rule |
| "Toujours utiliser /dev/commit" | Rule globale | S'applique partout |
| Chemins du projet | CLAUDE.md | Source unique de vérité |

### Les erreurs à éviter

#### ❌ Piège 1 : Glob `*` vs `**`

```yaml
# ❌ — Ne couvre que le 1er niveau
paths: ["php-legacy/*"]

# ✅ — Recursif
paths: ["php-legacy/**"]
```

#### ❌ Piège 2 : Rule sans renfort settings

```markdown
# ❌ — "Lecture seule" sans enforcement
NE JAMAIS modifier ces fichiers
```

```json
// ✅ — settings.json enforce
{ "deny": ["Write(php-legacy/**)", "Edit(php-legacy/**)"] }
```

#### ❌ Piège 3 : Rule trop longue

```markdown
# ❌ — 80 lignes de conventions detaillees
```

```markdown
# ✅ — Rule courte + delegation
Charger skill `api-conventions`. Rappels : Docker, TDD, PSR-12.
```

> Les rules sont injectées à chaque interaction. 80 lignes = pollution du contexte.

#### ❌ Piège 4 : Glob `**` seul

```yaml
# ❌ — Injecte PARTOUT (equivalent a une globale en plus lourd)
paths: ["**"]

# ✅ — Cible
paths: ["ap-rest/**"]
```

#### ❌ Piège 5 : Path obsolète

```yaml
# ❌ — Dossier renomme, rule silencieusement inactive
paths: ["php-classified-ads-legacy/**"]

# ✅ — Correspond au dossier actuel
paths: ["php-legacy/**"]
```

> Aucune erreur visible si le glob ne matche rien.

---

## Contrôle avancé

### Exclure des rules (monorepo)

Dans un monorepo, des rules d'autres équipes peuvent être chargées. `claudeMdExcludes` dans `settings.local.json` permet de les ignorer :

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

::: warning Managed policy
Les rules déployées via managed policy (`/etc/claude-code/CLAUDE.md`) ne peuvent **pas** être exclues. C'est voulu pour garantir les standards de l'organisation.
:::

### Debugger avec le hook InstructionsLoaded

Le hook `InstructionsLoaded` permet de logger exactement quelles rules sont chargées, quand, et pourquoi :

```json
{
  "hooks": {
    "InstructionsLoaded": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo \"$CLAUDE_INSTRUCTIONS_FILE\" >> /tmp/rules-loaded.log"
      }]
    }]
  }
}
```

Utile pour diagnostiquer pourquoi une rule ciblée ne se déclenche pas.

---

## Exemples concrets

### Exemple 1 : Protection lecture seule

```markdown
---
paths:
  - "php-legacy/**"
---

# Legacy — LECTURE SEULE

NE JAMAIS modifier, ecrire ou supprimer de fichiers ici.
Utiliser uniquement Read, Glob, Grep pour l'analyse.
```

::: warning Double protection
La rule rappelle. Le `settings.json` enforce :
```json
{ "deny": ["Write(php-legacy/**)", "Edit(php-legacy/**)"] }
```
:::

### Exemple 2 : Rule globale (git)

```markdown
---
---

# Git - Conventions

- TOUJOURS utiliser `/dev/commit` pour commiter
- Conventional Commits : `type(scope): description`
- Ne jamais force-push sur main
```

### Exemple 3 : Délégation vers skill

```markdown
---
paths:
  - "app-react-target/**"
---

# Frontend

Charger les skills `frontend/app-conventions` et `frontend/testing-conventions`.

Rappels : mobile-first, pas de px (rem/em/%), PascalCase composants.
```

::: tip Pattern de délégation
La rule rappelle 3-4 points. La skill détaille. Pas de duplication.
:::

### Exemple 4 : Format de sortie

```markdown
---
paths:
  - "output/**"
---

# Format

- Markdown avec titres hierarchiques
- Diagrammes Mermaid
- Classification dette : Critique / Haute / Moyenne / Basse
```

---

## Checklist de lancement

### Contenu

- [ ] < 30 lignes (déléguer aux skills au-delà)
- [ ] Pas de duplication entre rule et skill
- [ ] Instructions spécifiques et vérifiables (pas "format code nicely")

### Globs

- [ ] Globs précis et testés (`**` récursif, `*` un niveau)
- [ ] Brace expansion si multi-extensions (`*.{ts,tsx}`)
- [ ] Vérifier que le path correspond au dossier actuel (pas d'ancien nom)

### Protection

- [ ] Rule "lecture seule" doublée d'un `deny` dans `settings.json`
- [ ] Managed policy pour les standards organisation (non excluable)

### Organisation

- [ ] Nommage : `{domaine}-{contexte}.md`
- [ ] Sous-dossiers si > 10 rules (`backend/`, `frontend/`)
- [ ] User rules dans `~/.claude/rules/` pour les préférences personnelles
- [ ] Symlinks si rules partagées entre projets

---

## Ressources

- [Documentation officielle — Memory](https://code.claude.com/docs/en/memory)
