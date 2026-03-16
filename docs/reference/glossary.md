# Glossaire

## A

### Agent (Sub-agent)
Instance spécialisée de Claude configurée dans `.claude/agents/`. Chaque agent a ses propres outils, modèle et instructions. Travaille dans un contexte isolé, sans accès à l'historique de conversation. Voir [Agents](/concepts/agents).

### Agent Skills (standard)
Standard ouvert initié par Anthropic pour définir un format portable de skills compatible avec plusieurs outils IA (Claude Code, Cursor, VS Code Copilot, Gemini CLI, etc.). Voir [Standard Agent Skills](/reference/agent-skills-standard).

### Agent Teams
Fonctionnalité de coordination multi-agents où plusieurs sessions Claude Code collaborent sur des tâches différentes. Contrairement aux subagents (même session), les agent teams opèrent dans des sessions séparées.

### Allow (permission)
Liste des outils et commandes que Claude peut utiliser sans demander confirmation. Configuré dans `settings.json`. Voir [Settings](/concepts/settings).

### @import
Directive dans CLAUDE.md pour inclure le contenu d'un autre fichier. Syntaxe : `@import ./path/to/file.md`. Profondeur max : 5 niveaux imbriqués. Voir [CLAUDE.md](/concepts/claude-md).

### Auto-mémoire
Fichier `MEMORY.md` dans `~/.claude/projects/<project>/memory/` que Claude met à jour automatiquement pour retenir des patterns et décisions entre sessions. Tronqué après 200 lignes.

## B

### Boucle qualité
Mécanisme itératif où un agent juge (conformity-reporter) évalue la sortie d'un executor. Si le score est inférieur à 80/100, l'executor est relancé avec les corrections. Maximum 2 itérations avant intervention humaine. Voir [Pipeline](/examples/pipeline).

### /btw
Commande intégrée pour poser une question rapide sans outils. La réponse est jetée de l'historique de conversation, préservant le contexte pour la tâche en cours.

## C

### claudeMdExcludes
Champ dans `settings.json` pour empêcher Claude de charger des CLAUDE.md dans certains dossiers (ex: `node_modules`, `vendor`).

### Checkpoint
Point de vérification entre deux étapes d'un pipeline. Vérifie l'existence et la validité des fichiers de sortie avant de passer à l'étape suivante.

### CLAUDE.md
Fichier de mémoire persistante du projet, chargé automatiquement par Claude à chaque session. Source unique de vérité pour les chemins et conventions. Voir [CLAUDE.md](/concepts/claude-md).

### Command (slash command)
Fichier Markdown dans `.claude/commands/` invocable via `/nom`. Fusionné avec les skills (même frontmatter, même fonctionnement), les commands continuent de fonctionner. Voir [Commands](/concepts/commands).

### Context (fork)
Option frontmatter `context: fork` qui exécute une skill dans un sub-agent isolé, sans accès à l'historique de conversation.

### conformity-conventions (skill)
Skill passive contenant la méthodologie de scoring, les templates de rapport de conformité, la gestion de versions des rapports et le format d'issues. Héritée par le conformity-reporter. Voir [Skills](/concepts/skills).

### Conventional Commits
Convention de format de messages de commit : `type(scope): description`. Types : feat, fix, refactor, docs, test, chore.

## D

### Deny (permission)
Liste des outils et commandes que Claude ne peut jamais utiliser. Configuré dans `settings.json`. Priorité sur allow.

### design-conventions (skill)
Skill passive définissant les conventions de design (rem/em/%, breakpoints, design tokens, checklist fidélité). Héritée par le frontend-tasks-executor pour le traitement conditionnel des fichiers Figma JSON. Voir [Skills](/concepts/skills).

### disable-model-invocation
Champ frontmatter qui empêche Claude de charger une skill automatiquement. Seul l'utilisateur peut l'invoquer via `/nom`.

## F

### Frontmatter
Métadonnées YAML en début de fichier Markdown (entre `---`). Configure le comportement des agents, skills et rules.

## G

### Glob pattern
Pattern de correspondance de fichiers utilisé dans les rules (`paths:`) et les permissions. Ex: `src/**/*.ts` matche tous les fichiers TypeScript dans src/.

## H

### Haiku
Modèle Claude léger et rapide. Utilisé pour les tâches structurées : documentation, audit, diagnostics. Coût minimal.

### Hook
Script, endpoint HTTP ou prompt exécuté automatiquement en réponse à un événement de Claude. 18 événements disponibles : PreToolUse, PostToolUse, Notification, Stop, SubagentStop, etc. 3 types : command, http, prompt. Voir [Hooks](/concepts/hooks).

## I

### /init
Commande intégrée qui génère automatiquement un CLAUDE.md adapté au projet (analyse la structure, stack et commandes).

### InstructionsLoaded (hook event)
Événement de hook déclenché après le chargement de CLAUDE.md et toutes les instructions. Utile pour du logging ou l'injection dynamique de contexte.

## L

### Launcher (skill)
Skill invocable manuellement via `/nom` qui orchestre un workflow multi-étapes, souvent en déléguant à plusieurs agents.

### LLM-as-Judge
Pattern d'orchestration où un agent (conformity-reporter) évalue la sortie d'un autre agent (executor). Utilisé dans la boucle qualité du pipeline migrate-feature pour garantir un score minimum de 80/100. Voir [Pipeline](/examples/pipeline).

## M

### MCP (Model Context Protocol)
Protocole standardisé connectant Claude à des outils et données externes via des serveurs. Voir [MCP](/concepts/mcp).

### Managed Policy CLAUDE.md
Fichier CLAUDE.md système déployé au niveau organisation. Emplacements : macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux `/etc/claude-code/CLAUDE.md`, Windows `C:\Program Files\ClaudeCode\CLAUDE.md`. Non excluable via `claudeMdExcludes`. Voir [CLAUDE.md](/concepts/claude-md).

### Managed settings
Configuration déployée au niveau enterprise, applicable à tous les utilisateurs d'une organisation.

### /memory
Commande intégrée pour voir et éditer le fichier de mémoire automatique (`MEMORY.md`).

## O

### Opus
Modèle Claude le plus puissant. Utilisé pour l'analyse complexe, le raisonnement multi-étapes et la compréhension de code non documenté. Fenêtre de 1M tokens.

## P

### Passive (skill)
Skill avec `user-invocable: false`, invisible dans le menu `/`. Claude la charge automatiquement quand le contexte est pertinent.

### Permission mode
Niveau de confiance configuré pour Claude Code : Plan Mode (lecture seule), Default (confirmation), Accept Edits (auto-edits), Don't Ask (allowlist auto), Bypass Permissions (tout auto, danger).

### Plugin
Package portable contenant skills, agents, hooks et/ou serveurs MCP dans un repertoire unique. Installe via `claude plugins add <source>`. Utilise un namespace `plugin-name:skill-name` pour eviter les conflits. Voir [Plugins](/concepts/plugins).

### PreToolUse / PostToolUse
Points d'exécution des hooks. PreToolUse s'exécute avant l'action (peut bloquer), PostToolUse après (pour logging/notification).

## R

### Reference (fichier)
Fichier de documentation détaillée associé à une skill, stocké dans `references/`. Chargé par Claude à la demande.

### Rule
Fichier Markdown dans `.claude/rules/` dont le contenu est injecté automatiquement quand les fichiers manipulés matchent le pattern glob. Voir [Rules](/concepts/rules).

## S

### Sandbox
Isolation filesystem et réseau pour les commandes Bash (macOS, Linux, WSL2). Configuré dans `settings.json` avec `allowWrite`, `denyRead`, `allowedDomains`. Voir [Settings](/concepts/settings).

### Settings (settings.json)
Fichier de configuration des permissions, sandbox, modèle et hooks. 5 niveaux : managed > CLI > local > project > user. Voir [Settings](/concepts/settings).

### settings.local.json
Fichier de settings personnel (`.claude/settings.local.json`), gitignore. Idéal pour les préférences personnelles (modèle, langue) sans polluer le repo.

### Skill
Ensemble d'instructions et ressources dans `.claude/skills/`. Peut être passive (conventions) ou launcher (workflow). Voir [Skills](/concepts/skills).

### SKILL.md
Fichier d'entrée obligatoire d'une skill. Contient le frontmatter de configuration et les instructions principales.

### Sonnet
Modèle Claude équilibré qualité/vitesse. Utilisé pour l'implémentation, la planification et la review. Bon rapport coût/performance.

### Source unique de vérité
Principe selon lequel chaque information a un seul endroit de référence, évitant les duplications et contradictions.

## T

### TDD (Test-Driven Development)
Approche d'implémentation où les tests sont écrits avant le code : Red (test échoue) → Green (code passe) → Refactor.

### ToolSearch
Mécanisme de découverte d'outils MCP. Les outils "deferred" ne sont chargés qu'après appel à ToolSearch.

## U

### user-invocable
Champ frontmatter. `false` = la skill est invisible dans le menu `/`, seul Claude peut la charger.

## V

### Versioning (rapports)
Convention de ne jamais écraser un rapport existant. Chaque nouvelle évaluation crée une version incrémentée : V1, V2, V3.
