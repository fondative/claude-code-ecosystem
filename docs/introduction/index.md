# Philosophie & Vision

## Le principe fondateur

Claude Code repose sur une philosophie simple : **"less scaffolding, more model"**. Plutôt que de multiplier les frameworks d'orchestration rigides (DAGs, classifiers, RAG pipelines), Claude Code laisse le modèle décider de tout à travers une boucle simple.

```
Boucle principale :
  1. Recevoir l'instruction
  2. Choisir le(s) outil(s) adapte(s)
  3. Executer
  4. Analyser le resultat
  5. Decider : continuer ou repondre
```

Les 8 outils natifs — `Bash`, `Read`, `Edit`, `Write`, `Grep`, `Glob`, `Agent`, `TodoWrite` — couvrent la quasi-totalité des besoins. Le modèle orchestre leur utilisation sans configuration préalable.

## L'écosystème d'extension

Pour aller au-delà des outils natifs, Claude Code propose un écosystème modulaire :

| Composant | Rôle | Analogie |
|-----------|------|----------|
| **CLAUDE.md** | Mémoire persistante | Le "README" de Claude |
| **Settings** | Permissions et sécurité | Le pare-feu |
| **Rules** | Contexte automatique | Les guard rails |
| **Skills** | Connaissances et workflows | La boîte à outils |
| **Agents** | Instances spécialisées | Les collaborateurs |
| **Commands** | Actions déclenchées par l'utilisateur | Les raccourcis |
| **Hooks** | Automatisation pré/post action | Les triggers |
| **MCP** | Connexion à des services externes | Les plugins |

## Hiérarchie de configuration

La configuration se résout par niveaux de priorité (du plus fort au plus faible) :

```
Enterprise (organisation)  ← Priorite maximale
  └── Personal (~/.claude/)
       └── Project (.claude/)
            └── Plugin (extensions)  ← Priorite minimale
```

Quand deux configurations partagent le même nom, le niveau supérieur l'emporte.

## Principes directeurs

1. **Source unique de vérité** — Chaque information a un seul endroit de référence
2. **Convention over configuration** — Les skills portent les conventions, pas des dossiers docs/
3. **Injection contextuelle** — Les rules chargent le bon contexte selon les fichiers manipulés
4. **Isolation par défaut** — Les agents travaillent dans des contextes séparés
5. **Transparence** — Toute déviation par rapport au plan est documentée

## Ressources

- [Documentation officielle Claude Code](https://code.claude.com/docs/en/skills)
- [Standard Agent Skills](https://agentskills.io)
