# Catalogue des pièges

::: tip Page générée
Cette page rassemble les **54 erreurs fréquentes** (WARN) décrites dans les pages [Concepts](/concepts/claude-md). Chaque ligne renvoie au WARN complet, avec le problème, la solution et la source. Elle est générée par `scripts/generate-warn-catalog.mjs` : pour la modifier, modifier le WARN dans sa page.
:::

## Comment lire ce catalogue

| Gravité | Signifie | Nombre |
|---------|----------|--------|
| 🔴 Sécurité | une protection qui ne protège pas, un secret exposé, une action destructrice possible | 15 |
| 🟠 Fiabilité | un comportement différent de celui attendu, souvent sans message d'erreur | 21 |
| 🟡 Coût & contexte | des tokens, du contexte ou du temps dépensés pour rien | 9 |
| 🔵 Maintenabilité | une configuration qui diverge ou devient difficile à faire évoluer | 9 |

**Origine** : 🧪 constaté sur le projet de modernisation (audit, historique git, méthodologie) · 📐 règle du projet · 📘 documentation officielle · 🧭 bonne pratique générale.

## 🔴 Sécurité

| Piège | Brique | Origine |
|-------|--------|---------|
| [CLAUDE.md · WARN-005 · Confondre CLAUDE.md et permissions](/concepts/claude-md#warn-005) | CLAUDE.md | 📘 Doc officielle |
| [Settings · WARN-001 · Permissions trop larges](/concepts/settings#warn-001) | Settings | 📘 Doc officielle |
| [Settings · WARN-002 · Oubli du deny en écriture](/concepts/settings#warn-002) | Settings | 🧪 Constaté sur le projet |
| [Settings · WARN-003 · Glob `*` vs `**`](/concepts/settings#warn-003) | Settings | 🧭 Bonne pratique |
| [Settings · WARN-004 · MCP sans permissions](/concepts/settings#warn-004) | Settings | 📘 Doc officielle |
| [Settings · WARN-006 · Règles de chemin `Write(…)` : une protection fantôme](/concepts/settings#warn-006) | Settings | 🧪 Constaté sur le projet |
| [Settings · WARN-007 · `"Read"` nu en `allow`](/concepts/settings#warn-007) | Settings | 🧪 Constaté sur le projet |
| [Settings · WARN-008 · Sortir `docker compose *` du sandbox](/concepts/settings#warn-008) | Settings | 📘 Doc officielle |
| [Rules · WARN-002 · Rule sans renfort settings](/concepts/rules#warn-002) | Rules | 🧪 Constaté sur le projet |
| [Agents · WARN-002 · Trop d'outils](/concepts/agents#warn-002) | Agents | 📐 Règle du projet |
| [Hooks · WARN-007 · Chercher une injection de prompt en `PreToolUse`](/concepts/hooks#warn-007) | Hooks | 📘 Doc officielle |
| [Hooks · WARN-008 · Lancer `claude -p` en CI sans choisir entre `--bare` et la configuration du dépôt](/concepts/hooks#warn-008) | Hooks | 📘 Doc officielle |
| [MCP · WARN-001 · Token hardcodé](/concepts/mcp#warn-001) | MCP | 🧭 Bonne pratique |
| [MCP · WARN-002 · Pas de deny pour les actions destructrices](/concepts/mcp#warn-002) | MCP | 🧭 Bonne pratique |
| [MCP · WARN-003 · Serveur de source inconnue](/concepts/mcp#warn-003) | MCP | 📘 Doc officielle |

## 🟠 Fiabilité

| Piège | Brique | Origine |
|-------|--------|---------|
| [Rules · WARN-001 · Glob `*` vs `**`](/concepts/rules#warn-001) | Rules | 🧭 Bonne pratique |
| [Rules · WARN-005 · Path obsolète](/concepts/rules#warn-005) | Rules | 🧪 Constaté sur le projet |
| [Skills · WARN-002 · Description vague ou manquante](/concepts/skills#warn-002) | Skills | 📘 Doc officielle |
| [Skills · WARN-003 · Launcher sans protection](/concepts/skills#warn-003) | Skills | 📘 Doc officielle |
| [Skills · WARN-006 · Conventions écrites dans le prompt d'un agent](/concepts/skills#warn-006) | Skills | 🧪 Constaté sur le projet |
| [Agents · WARN-004 · Pas de checkpoint](/concepts/agents#warn-004) | Agents | 📐 Règle du projet |
| [Agents · WARN-005 · Agents parallèles qui écrivent le même fichier](/concepts/agents#warn-005) | Agents | 🧪 Constaté sur le projet |
| [Agents · WARN-006 · `maxTurns` sous-dimensionné](/concepts/agents#warn-006) | Agents | 🧪 Constaté sur le projet |
| [Hooks · WARN-001 · Oubli du exit 0](/concepts/hooks#warn-001) | Hooks | 📘 Doc officielle |
| [Hooks · WARN-003 · Script non exécutable](/concepts/hooks#warn-003) | Hooks | 🧭 Bonne pratique |
| [Hooks · WARN-005 · Mixer exit code et JSON](/concepts/hooks#warn-005) | Hooks | 📘 Doc officielle |
| [Hooks · WARN-006 · `\|` non échappé dans un motif `grep -E`](/concepts/hooks#warn-006) | Hooks | 🧪 Constaté sur le projet |
| [MCP · WARN-004 · Token expiré](/concepts/mcp#warn-004) | MCP | 🧭 Bonne pratique |
| [Plugins · WARN-002 · Composants rangés dans `.claude-plugin/` ou au mauvais endroit](/concepts/plugins#warn-002) | Plugins | 🧪 Constaté sur le projet |
| [Commands · WARN-001 · Command et Skill avec le même nom](/concepts/commands#warn-001) | Commands | 📘 Doc officielle |
| [Commands · WARN-002 · Oubli des flags Docker (convention de ce projet)](/concepts/commands#warn-002) | Commands | 📐 Règle du projet |
| [Commands · WARN-003 · Command sans description](/concepts/commands#warn-003) | Commands | 📘 Doc officielle |
| [Commands · WARN-005 · Dépendances cachées](/concepts/commands#warn-005) | Commands | 🧭 Bonne pratique |
| [Commands · WARN-006 · `name:` dans un command](/concepts/commands#warn-006) | Commands | 🧪 Constaté sur le projet |
| [Commands · WARN-007 · Vérifications réservées à l'utilisateur](/concepts/commands#warn-007) | Commands | 🧪 Constaté sur le projet |
| [Commands · WARN-008 · Documenter une invocation qui n'existe pas](/concepts/commands#warn-008) | Commands | 🧪 Constaté sur le projet |

## 🟡 Coût & contexte

| Piège | Brique | Origine |
|-------|--------|---------|
| [CLAUDE.md · WARN-001 · Fichier trop long / monolithique](/concepts/claude-md#warn-001) | CLAUDE.md | 📘 Doc officielle |
| [CLAUDE.md · WARN-006 · Croire qu'un import `@` allège le contexte](/concepts/claude-md#warn-006) | CLAUDE.md | 🧪 Constaté sur le projet |
| [Rules · WARN-003 · Rule trop longue](/concepts/rules#warn-003) | Rules | 🧪 Constaté sur le projet |
| [Rules · WARN-004 · Glob `**` seul](/concepts/rules#warn-004) | Rules | 🧭 Bonne pratique |
| [Skills · WARN-001 · Skill trop longue](/concepts/skills#warn-001) | Skills | 📘 Doc officielle |
| [Skills · WARN-005 · Budget de contexte dépassé](/concepts/skills#warn-005) | Skills | 📘 Doc officielle |
| [Agents · WARN-003 · Opus partout](/concepts/agents#warn-003) | Agents | 🧪 Constaté sur le projet |
| [Hooks · WARN-002 · Hook trop lent](/concepts/hooks#warn-002) | Hooks | 🧭 Bonne pratique |
| [Hooks · WARN-004 · Matcher trop large](/concepts/hooks#warn-004) | Hooks | 🧭 Bonne pratique |

## 🔵 Maintenabilité

| Piège | Brique | Origine |
|-------|--------|---------|
| [CLAUDE.md · WARN-002 · Chemins hardcodés dans les agents](/concepts/claude-md#warn-002) | CLAUDE.md | 🧪 Constaté sur le projet |
| [CLAUDE.md · WARN-003 · Conventions dupliquées](/concepts/claude-md#warn-003) | CLAUDE.md | 🧪 Constaté sur le projet |
| [CLAUDE.md · WARN-004 · Instructions temporaires](/concepts/claude-md#warn-004) | CLAUDE.md | 📘 Doc officielle |
| [Settings · WARN-005 · Settings projet pour des préférences personnelles](/concepts/settings#warn-005) | Settings | 📘 Doc officielle |
| [Skills · WARN-004 · Duplication skill / rule](/concepts/skills#warn-004) | Skills | 📐 Règle du projet |
| [Agents · WARN-001 · Agent fourre-tout](/concepts/agents#warn-001) | Agents | 📘 Doc officielle |
| [MCP · WARN-005 · Oublier --scope pour le partage équipe](/concepts/mcp#warn-005) | MCP | 📘 Doc officielle |
| [Plugins · WARN-001 · Recopier le même `.claude/` dans chaque projet](/concepts/plugins#warn-001) | Plugins | 📐 Règle du projet |
| [Commands · WARN-004 · Logique trop complexe](/concepts/commands#warn-004) | Commands | 🧭 Bonne pratique |

## Les pièges constatés sur le projet

Les pièges qui se sont réellement produits sur le projet de modernisation ou dans ce wiki : ce sont ceux qui ont le plus de chances de vous arriver.

| Piège | Brique | Origine |
|-------|--------|---------|
| [CLAUDE.md · WARN-002 · Chemins hardcodés dans les agents](/concepts/claude-md#warn-002) | CLAUDE.md | 🧪 Constaté sur le projet |
| [CLAUDE.md · WARN-003 · Conventions dupliquées](/concepts/claude-md#warn-003) | CLAUDE.md | 🧪 Constaté sur le projet |
| [CLAUDE.md · WARN-006 · Croire qu'un import `@` allège le contexte](/concepts/claude-md#warn-006) | CLAUDE.md | 🧪 Constaté sur le projet |
| [Settings · WARN-002 · Oubli du deny en écriture](/concepts/settings#warn-002) | Settings | 🧪 Constaté sur le projet |
| [Settings · WARN-006 · Règles de chemin `Write(…)` : une protection fantôme](/concepts/settings#warn-006) | Settings | 🧪 Constaté sur le projet |
| [Settings · WARN-007 · `"Read"` nu en `allow`](/concepts/settings#warn-007) | Settings | 🧪 Constaté sur le projet |
| [Rules · WARN-002 · Rule sans renfort settings](/concepts/rules#warn-002) | Rules | 🧪 Constaté sur le projet |
| [Rules · WARN-003 · Rule trop longue](/concepts/rules#warn-003) | Rules | 🧪 Constaté sur le projet |
| [Rules · WARN-005 · Path obsolète](/concepts/rules#warn-005) | Rules | 🧪 Constaté sur le projet |
| [Skills · WARN-006 · Conventions écrites dans le prompt d'un agent](/concepts/skills#warn-006) | Skills | 🧪 Constaté sur le projet |
| [Agents · WARN-003 · Opus partout](/concepts/agents#warn-003) | Agents | 🧪 Constaté sur le projet |
| [Agents · WARN-005 · Agents parallèles qui écrivent le même fichier](/concepts/agents#warn-005) | Agents | 🧪 Constaté sur le projet |
| [Agents · WARN-006 · `maxTurns` sous-dimensionné](/concepts/agents#warn-006) | Agents | 🧪 Constaté sur le projet |
| [Hooks · WARN-006 · `\|` non échappé dans un motif `grep -E`](/concepts/hooks#warn-006) | Hooks | 🧪 Constaté sur le projet |
| [Plugins · WARN-002 · Composants rangés dans `.claude-plugin/` ou au mauvais endroit](/concepts/plugins#warn-002) | Plugins | 🧪 Constaté sur le projet |
| [Commands · WARN-006 · `name:` dans un command](/concepts/commands#warn-006) | Commands | 🧪 Constaté sur le projet |
| [Commands · WARN-007 · Vérifications réservées à l'utilisateur](/concepts/commands#warn-007) | Commands | 🧪 Constaté sur le projet |
| [Commands · WARN-008 · Documenter une invocation qui n'existe pas](/concepts/commands#warn-008) | Commands | 🧪 Constaté sur le projet |

## Par brique

| Brique | 🔴 | 🟠 | 🟡 | 🔵 | Total |
|--------|----|----|----|----|-------|
| [CLAUDE.md](/concepts/claude-md) | 1 | · | 2 | 3 | 6 |
| [Settings](/concepts/settings) | 7 | · | · | 1 | 8 |
| [Rules](/concepts/rules) | 1 | 2 | 2 | · | 5 |
| [Skills](/concepts/skills) | · | 3 | 2 | 1 | 6 |
| [Agents](/concepts/agents) | 1 | 3 | 1 | 1 | 6 |
| [Hooks](/concepts/hooks) | 2 | 4 | 2 | · | 8 |
| [MCP](/concepts/mcp) | 3 | 1 | · | 1 | 5 |
| [Plugins](/concepts/plugins) | · | 1 | · | 1 | 2 |
| [Commands](/concepts/commands) | · | 7 | · | 1 | 8 |
