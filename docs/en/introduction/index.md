# Philosophy & Vision

## The Founding Principle

Claude Code is built on a simple philosophy: **"less scaffolding, more model"**. Rather than multiplying rigid orchestration frameworks (DAGs, classifiers, RAG pipelines), Claude Code lets the model decide everything through a simple loop.

```
Main loop:
  1. Receive the instruction
  2. Choose the appropriate tool(s)
  3. Execute
  4. Analyze the result
  5. Decide: continue or respond
```

The 8 native tools — `Bash`, `Read`, `Edit`, `Write`, `Grep`, `Glob`, `Agent`, `TodoWrite` — cover the vast majority of needs. The model orchestrates their usage without prior configuration.

## The Extension Ecosystem

To go beyond native tools, Claude Code offers a modular ecosystem:

| Component | Role | Analogy |
|-----------|------|---------|
| **CLAUDE.md** | Persistent memory | Claude's "README" |
| **Settings** | Permissions and security | The firewall |
| **Rules** | Automatic context | The guard rails |
| **Skills** | Knowledge and workflows | The toolbox |
| **Agents** | Specialized instances | The collaborators |
| **Commands** | User-triggered actions | The shortcuts |
| **Hooks** | Pre/post action automation | The triggers |
| **MCP** | Connection to external services | The plugins |

## Configuration Hierarchy

Configuration resolves by priority levels (from highest to lowest):

```
Enterprise (organization)  <- Highest priority
  └── Personal (~/.claude/)
       └── Project (.claude/)
            └── Plugin (extensions)  <- Lowest priority
```

When two configurations share the same name, the higher level wins.

## Guiding Principles

1. **Single source of truth** — Each piece of information has only one reference location
2. **Convention over configuration** — Skills carry conventions, not docs/ folders
3. **Contextual injection** — Rules load the right context based on the files being manipulated
4. **Isolation by default** — Agents work in separate contexts
5. **Transparency** — Any deviation from the plan is documented

## Resources

- [Official Claude Code Documentation](https://code.claude.com/docs/en/skills)
- [Agent Skills Standard](https://agentskills.io)
