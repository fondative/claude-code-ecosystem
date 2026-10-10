# Rules

## En bref

| Aspect | Détail |
|--------|--------|
| **Quoi** | Instructions injectées automatiquement dans le contexte de Claude |
| **Où** | `.claude/rules/<nom>.md` (projet) ou `~/.claude/rules/` (utilisateur) |
| **Déclenchement** | Par motif [glob](/reference/glossary#glob) (`paths:`) ou global (sans `paths`) |
| **Taille** | Courte, un sujet par fichier — déléguer les procédures aux skills |
| **Relation** | Les rules rappellent, les [skills](/concepts/skills) détaillent |
| **Ce que cette page apporte** | Quand choisir une rule plutôt que CLAUDE.md ou une skill, les 7 rules réelles du projet et leurs globs |

---

## L'essentiel en 2 minutes

Une rule est un fichier Markdown de `.claude/rules/` dont le contenu est **injecté automatiquement** dans le contexte : au démarrage si elle n'a pas de `paths`, ou dès que Claude touche un fichier qui correspond à son glob. Pas d'invocation, pas de commande.

```
┌───────────────────────────────────────────────────────┐
│             INJECTION CONTEXTUELLE                    │
│                                                       │
│  Claude édite api-rest-symfony-target/src/Entity.php  │
│         │                                             │
│         ▼                                             │
│  Glob match: "api-rest-symfony-target/**"             │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────────┐                             │
│  │ rules/symfony-api.md │  ◄── injectée               │
│  │  "Docker, TDD,       │                             │
│  │   Controller→Service"│                             │
│  └──────────────────────┘                             │
│                                                       │
│  git.md (pas de paths) ───── toujours                 │
└───────────────────────────────────────────────────────┘
```

```markdown
---
paths:
  - "api-rest-symfony-target/**"
---

# Conventions Backend

- Commandes via `docker compose exec -T app [cmd]`
- Architecture : Controller → Service → Repository
- TDD : écrire le test avant le code
```

Quatre faits changent la façon de concevoir une rule :

1. **Une rule à `paths` se charge au premier contact** (Read, Write, Edit, ou `cat`/`head` via Bash sur un fichier correspondant), puis **reste dans le contexte** jusqu'à la prochaine [compaction](/reference/glossary#compaction).
2. **Sans `paths`, elle coûte comme une ligne de CLAUDE.md**, à chaque session. Et un [frontmatter](/reference/glossary#frontmatter) YAML invalide la rend globale, sans message d'erreur.
3. **C'est du contexte, pas une barrière** : une rule « lecture seule » ne bloque rien sans une règle [`deny`](/reference/glossary#regles-de-permission) dans [settings.json](/concepts/settings).
4. **Un glob qui ne matche rien ne produit aucune erreur** : la rule est simplement inactive.

→ Tout le fonctionnement (format, [portées](/reference/glossary#scope) projet et utilisateur, découverte récursive, globs, symlinks, exclusions, débogage) : [documentation officielle — Memory (rules)](https://code.claude.com/docs/en/memory#path-specific-rules).

---

## Bien concevoir ses rules

### Quand utiliser une rule ?

Le critère est la **portée**, pas la longueur : une rule est attachée à une **zone du code**, une skill à une **procédure**.

```
Doit être garanti (bloquer, formater, tester) ?
└── OUI → settings.json (deny) ou hook — pas du texte
Sinon, à quoi l'information est-elle liée ?
├── Une zone du code (dossier, type de fichier) → RULE avec paths
├── Tout le projet, à chaque session            → CLAUDE.md (ou rule globale)
└── Une tâche / procédure ponctuelle            → SKILL (chargée à la demande)
```

| Information | Composant | Raison |
|-------------|-----------|--------|
| « Pas d'adaptateurs HTTP dans `app-react-target/` » | Rule ciblée | Liée à une zone du code |
| Formatage PSR-12 | [Hook](/concepts/hooks) `PostToolUse` (ex. `php-cs-fixer`) ou `/dev:php-lint` | Un formateur garantit, une phrase non ([exemple officiel](https://code.claude.com/docs/en/hooks-guide#auto-format-code-after-edits)) |
| Guide de migration d'une feature | [Skill](/concepts/skills) | Procédure ponctuelle |
| « Toujours utiliser `/dev:commit` » | Rule globale ou CLAUDE.md | S'applique partout |
| Chemins du projet | [CLAUDE.md](/concepts/claude-md) | Toujours chargé ; <span class="chez-nous">Chez nous</span> « source unique de vérité » des chemins |

::: tip Un sujet par fichier
Une rule = un sujet (`git.md`, `frontend.md`…), nommée d'après ce sujet : elle reste facile à cibler, à relire et à supprimer.
:::

### La configuration réelle du projet

<span class="chez-nous">Chez nous</span> Les 7 rules du projet de modernisation, dans `.claude/rules/` :

| Rule | `paths` | Lignes | Contenu |
|------|---------|:------:|---------|
| `legacy-readonly` | `php-legacy/**` | 10 | Le legacy est en lecture seule (doublé par `deny: Edit(/php-legacy/**)` dans `settings.json`) |
| `symfony-api` | `api-rest-symfony-target/**` | 14 | Renvoie aux skills `sym-*` + 4 rappels (Docker, TDD, UUID, OpenAPI) |
| `docs` | `api-rest-symfony-target/docs/**` | 9 | `OPENAPI_SPEC` (`openapi.yaml`) est la source de vérité des contrats d'API |
| `frontend` | `app-react-target/**` | 15 | Renvoie aux skills `front-*` + 3 rappels |
| `output-format` | `output/**` | 15 | Langue et format des livrables |
| `design` | `output/design/**` | 8 | Fichiers design Figma JSON |
| `git` | aucun (pas de frontmatter) | 5 | Seule rule globale : commits proposés via `/dev:commit` |

Ce qu'il faut y lire :

- **6 rules sur 7 sont ciblées**, aucune ne dépasse 15 lignes, et les rules liées au code **délèguent** le détail aux skills.
- **Les globs se recouvrent volontairement** : un fichier de `api-rest-symfony-target/docs/` charge `symfony-api` **et** `docs`, un fichier de `output/design/` charge `output-format` **et** `design`.
- **Les dossiers ciblés n'existent pas dans le dépôt de la stack** : `api-rest-symfony-target/` et `app-react-target/` sont créés par `install-stack.sh`, `php-legacy/` est déposé par l'équipe et `output/` est produit par le pipeline. Avant cela, les rules ciblées ne se déclenchent jamais, sans erreur.

### Pièges à connaître

- **`paths` est le seul champ lu** dans le frontmatter d'une rule : `description` ou tout autre champ est ignoré sans erreur.
- **YAML invalide = rule globale** : si le frontmatter ne se parse pas, la rule est chargée comme si elle n'avait pas de `paths`. `claude --debug` affiche l'erreur.
- **Après `/compact`**, les rules sans `paths` reviennent avec CLAUDE.md ; celles à `paths` seulement quand Claude retouche un fichier correspondant.
- **Rules user et projet se cumulent** : une rule projet apparaît après une rule user mais ne l'annule pas. Deux consignes contraires : Claude peut suivre l'une ou l'autre.
- **`*` couvre un niveau, `**` tous les niveaux.** Les accolades (`*.{ts,tsx}`) multiplient les motifs, dans un budget de 1 000 motifs par rule.
- **Un symlink vers une cible hors projet** est traité comme un import externe : approbation requise, et seules les rules **sans** `paths` sont alors chargées.

Détails et sources : [documentation officielle — Memory (rules)](https://code.claude.com/docs/en/memory#path-specific-rules).

### Erreurs fréquentes à éviter

→ Les pièges de toutes les briques, classés par gravité : [Catalogue des pièges](/guide/warns).

#### `WARN-001` : Glob `*` vs `**` {#warn-001 .warn-title}
*Origine : bonne pratique générale (sémantique des globs).*

Même piège que pour les permissions, détaillé dans [Settings — WARN-003](/concepts/settings#warn-003) : dans `paths`, `"php-legacy/*"` ne couvre que le premier niveau ; écrire `"php-legacy/**"` pour inclure les sous-dossiers.

---

#### `WARN-002` : Rule sans renfort settings {#warn-002 .warn-title}
*Origine : vécu sur ce projet ([Méthodologie — Phase 0](/guide/methodology#phase-0-construire-l-infrastructure) : « Une rule seule peut être contournée ») ; le legacy a d'abord été protégé par la rule seule, avant l'ajout d'un `settings.json`.*

Une rule « lecture seule » n'est que du texte : elle n'empêche pas Claude d'écrire. Le blocage vient d'un `deny` `Edit(/php-legacy/**)` dans `settings.json` — exemple complet dans [Settings — WARN-002](/concepts/settings#warn-002), même piège côté CLAUDE.md dans [CLAUDE.md — WARN-005](/concepts/claude-md#warn-005).

Ce `deny` couvre les outils d'écriture de Claude **et** les écritures Bash que Claude Code reconnaît : redirections (`>`, `>>`), `tee`, `sed -i`… En revanche, une commande qui écrit sans que Claude Code identifie la cible (un script Python ou Node qui ouvre ses fichiers lui-même, par exemple) passe : pour celles-là, un [hook](/concepts/hooks) `PreToolUse` ou le [sandbox](/reference/glossary#sandbox) ([source](https://code.claude.com/docs/en/permissions#read-and-edit)).

---

#### `WARN-003` : Rule trop longue {#warn-003 .warn-title}
*Origine : vécu sur ce projet : `symfony-api` est passée de 29 à 14 lignes en déléguant ses conventions aux skills (commit `e0b87b5`).*

Une fois chargée, une rule reste dans le contexte pour toute la suite de la session — une rule volumineuse pollue le contexte en permanence.

::: danger Problème
```markdown
# ❌ — 80 lignes de conventions détaillées
```
80 lignes qui restent en contexte pour toute la session saturent inutilement la fenêtre de contexte.
:::

::: info Solution
```markdown
# ✅ — Rule courte + délégation
Charger skill `sym-api-conventions`. Rappels : Docker, TDD.
```
La rule rappelle l'essentiel, la skill porte le détail. Pas de duplication.
:::

---

#### `WARN-004` : Glob `**` seul {#warn-004 .warn-title}
*Origine : bonne pratique générale.*

Un glob `**` sans préfixe de dossier revient presque à une rule globale, en moins lisible.

::: danger Problème
```yaml
# ❌ — Injectée PARTOUT (quasi équivalent à une globale)
paths: ["**"]
```
La rule est injectée pour chaque fichier de tout le projet, sans discrimination.
:::

::: info Solution
```yaml
# ✅ — Ciblée
paths: ["api-rest-symfony-target/**"]
```
Cibler un dossier précis limite l'injection aux fichiers réellement concernés.
:::

---

#### `WARN-005` : Path obsolète {#warn-005 .warn-title}
*Origine : vécu sur ce projet : à sa création, `legacy-readonly` ciblait `php-classified-ads-legacy/**` alors que le CLAUDE.md déclarait `./php-legacy` (corrigé, commit `847ccc2`).*

Si le dossier ciblé est renommé, le glob ne matche plus rien — sans aucun message d'erreur.

::: danger Problème
```yaml
# ❌ — Dossier renommé, rule silencieusement inactive
paths: ["php-classified-ads-legacy/**"]
```
Aucune erreur visible si le glob ne matche rien. La rule est ignorée en silence.
:::

::: info Solution
```yaml
# ✅ — Correspond au dossier actuel
paths: ["php-legacy/**"]
```
Vérifier que le path correspond au nom de dossier actuel à chaque renommage.
:::

---

## Exemples prêts à l'emploi

### Exemple 1 : Protection lecture seule

```markdown
---
paths:
  - "php-legacy/**"
---

# Code legacy — lecture seule

Ce code est la référence de l'analyse : il doit rester intact pour comparer
avec l'implémentation cible. Documenter ses écarts dans `output/`, jamais ici.
```

::: warning Double protection
L'interdiction est déjà appliquée par `deny` : la rule n'a pas à la répéter en majuscules, elle donne le **pourquoi** et l'alternative. (<span class="chez-nous">Chez nous</span> la rule réelle est celle-ci, à ceci près qu'elle désigne les dossiers de sortie par leurs alias de la table PATHS : `SOURCE_TECHNICAL_DIR`, `FEATURE_SPECS_DIR`…) Le `settings.json` applique l'interdiction :
```json
{
  "permissions": {
    "deny": ["Edit(/php-legacy/**)"]
  }
}
```
:::

### Exemple 2 : Rule globale (git)

<span class="chez-nous">Chez nous</span> `.claude/rules/git.md` (sans frontmatter, donc sans `paths` : chargée à chaque session) :

```markdown
# Git - Conventions

- Ne pas lancer `git commit` : quand un commit est pertinent, proposer a l'utilisateur de taper `/dev:commit` (commande reservee a l'utilisateur).
- Exception : le launcher `/mod-migrate-feature` commite chaque lot verifie (commit soumis a `ask`).
- Format Conventional Commits : `type(scope): description`
```

::: tip Ce qu'un réglage fait mieux
- Sans `paths`, cette rule coûte comme une ligne de CLAUDE.md : la garder courte.
- Claude Code injecte déjà ses propres instructions de commit/PR. Si une skill maison (`/dev:commit`) les remplace, `"includeGitInstructions": false` évite deux consignes concurrentes.
- Le trailer `Co-Authored-By` se règle avec `attribution` (ex. `{ "commit": "", "pr": "" }` pour le retirer), pas avec une phrase.

Voir [`includeGitInstructions`, `attribution`](https://code.claude.com/docs/en/settings) et [Settings](/concepts/settings).
:::

::: info Chez nous : notation `/dev/commit` vs `/dev:commit`
Cet extrait reprend tel quel la rule du projet, qui écrit **`/dev:commit`** : la command étant dans `.claude/commands/dev/commit.md`, c'est son invocation réelle (chaque sous-dossier devient un préfixe suivi de `:`). La notation `/dev/commit` est l'ancienne forme, à ne pas reproduire — voir [documentation officielle — Skills](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name).
:::

### Exemple 3 : Délégation vers skill

<span class="chez-nous">Chez nous</span> La rule réelle `frontend`, citée telle quelle :

```markdown
---
paths:
  - "app-react-target/**"
---

# Conventions Frontend (auto-injecte)

Les conventions frontend completes sont definies dans les skills :
- `front-app-conventions` — Architecture, patterns, standards de code
- `front-testing-conventions` — Tests, TDD, mocking MSW

Rappels critiques :
- Appels HTTP directs (pas d'adaptateurs)
- Responsive obligatoire, pas de pixels hardcodes
- Consulter `OPENAPI_SPEC` (table PATHS de CLAUDE.md) avant integration
```

::: tip Pattern de délégation
La rule rappelle 3-4 points. La skill détaille. Pas de duplication.
:::

### Exemple 4 : Format de sortie

<span class="chez-nous">Chez nous</span> La rule réelle `output-format`, citée telle quelle (sans accents dans l'original) :

```markdown
---
paths:
  - "output/**"
---

# Conventions de sortie (auto-injecte)

## Langue
- Tous les documents generes DOIVENT etre rediges en **francais**
- Titres, descriptions, findings, recommandations, conclusions — tout en francais
- Seuls les noms de code restent en anglais (classes, methodes, fichiers, variables)

## Format
- Markdown avec diagrammes Mermaid pour les flux et architectures
- Donnees structurees en tableaux Markdown (pas de listes quand un tableau est plus lisible)
```

### Exemples de référence

[Trail of Bits — claude-code-config](https://github.com/trailofbits/claude-code-config) publie des rules personnelles par langage (`rules/python.md`, `typescript.md`, `rust.md`, `bash.md`, `github-actions.md`) : chacune cible ses fichiers via `paths` et tient en un tableau « usage → outil » (lint, formatage, tests), en complément d'un `~/.claude/CLAUDE.md` court.

---

## Avant de mettre en service

### Contenu

- [ ] Un sujet par fichier, liée à une zone du code (sinon CLAUDE.md ou skill)
- [ ] Pas de répétition de ce qu'un `deny` ou un hook garantit déjà
- [ ] Pas de duplication entre rule et skill
- [ ] Rule courte ; le détail des conventions délégué à une skill ([WARN-003](#warn-003))
- [ ] Instructions spécifiques et vérifiables (pas « bien formater le code »)
- [ ] Commandes citées sous leur forme d'invocation réelle (`/dev:commit`)

### Globs

- [ ] Globs précis et testés (`**` récursif, `*` un niveau)
- [ ] Accolades pour plusieurs extensions (`*.{ts,tsx}`), sans multiplier les groupes
- [ ] Pas de `paths: ["**"]` (équivaut à une rule sans `paths`) ([WARN-004](#warn-004))
- [ ] `/context` pour les rules sans `paths` ; hook `InstructionsLoaded` pour les rules à `paths` (chargées à la demande)
- [ ] Frontmatter YAML valide (`claude --debug`) — sinon la rule devient globale
- [ ] `paths` alignés sur les dossiers actuels : après un renommage, chercher l'ancien nom dans CLAUDE.md, `settings.json`, `.claude/rules/` et les skills

### Protection

- [ ] Rule "lecture seule" doublée d'un `deny` dans [`settings.json`](/concepts/settings)

### Organisation

- [ ] Fichier nommé d'après son sujet ; sous-dossiers possibles (découverte récursive)
- [ ] Rules utilisateur dans `~/.claude/rules/` pour les préférences personnelles
- [ ] Symlinks si rules partagées entre projets (approbation requise si cible hors projet ; seules les rules sans `paths` s'y chargent alors)

---

## Pour aller plus loin

- [CLAUDE.md](/concepts/claude-md) — ce qui vaut pour tout le projet, à chaque session
- [Skills](/concepts/skills) — le détail vers lequel les rules renvoient
- [Settings](/concepts/settings) — le `deny` qui rend une interdiction effective
- [Méthodologie — Phase 0](/guide/methodology#phase-0-construire-l-infrastructure) — d'où vient la règle « rule + deny »
- [Documentation officielle — Memory (rules)](https://code.claude.com/docs/en/memory#path-specific-rules)

---

*Vérifié avec **Claude Code v2.1.295** contre la documentation officielle le 10 octobre 2026. Une fonctionnalité plus récente peut manquer : voir le [journal des modifications](https://code.claude.com/docs/en/changelog).*
