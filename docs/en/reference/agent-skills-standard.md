# Agent Skills Standard

## Definition

Agent Skills is an **open standard** initiated by Anthropic that defines a portable format for giving new capabilities to AI agents. A skill written once works on all compatible tools.

## Compatible Tools

The standard is supported by 30+ tools, including:

| Tool | Publisher |
|------|----------|
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

Full list: [agentskills.io](https://agentskills.io)

## Format Specification

### Minimal Structure

```
my-skill/
└── SKILL.md        # Entry file (mandatory)
```

### Complete Structure

```
my-skill/
├── SKILL.md           # Main instructions
├── references/        # Detailed documentation
│   ├── api-guide.md
│   └── examples.md
├── scripts/           # Executable scripts
│   └── validate.sh
└── templates/         # Templates to fill in
    └── output.md
```

### SKILL.md Format

```yaml
---
name: my-skill
description: What the skill does
---

Markdown instructions that the agent will follow.
```

The file contains:
1. **YAML frontmatter** (optional): configuration metadata
2. **Markdown content**: instructions for the agent

## Frontmatter Fields (standard)

The standard defines a minimal set of fields. Each tool can add its own extensions.

### Universal Fields

| Field | Description |
|-------|-------------|
| `name` | Skill identifier |
| `description` | What the skill does (for automatic discovery) |

### Claude Code Extensions

Claude Code adds specific fields:

| Field | Description |
|-------|-------------|
| `disable-model-invocation` | Prevent automatic invocation |
| `user-invocable` | Control visibility in the menu |
| `allowed-tools` | Restrict available tools |
| `context` | Isolated execution (`fork`) |
| `agent` | Sub-agent type |
| `model` | Model to use |
| `hooks` | Lifecycle hooks |

See [Frontmatter Reference](/en/reference/frontmatter) for complete details.

## Philosophy

### Why an Open Standard?

1. **Portability** — Write a skill once, use it everywhere
2. **Sharing** — Teams share their skills between projects and tools
3. **Capitalization** — Organizational knowledge is versioned in Git
4. **Interoperability** — No lock-in to a specific tool

### Design Principles

- **Simple** — A folder + a Markdown file
- **Extensible** — Each tool adds its own frontmatter fields
- **Discoverable** — Descriptions enable automatic loading
- **Versionable** — Everything is text, storable in Git

## Skill Categories

### Domain Knowledge

```yaml
---
name: legal-review
description: Review rules for legal documents
---

When reviewing legal documents:
1. Check GDPR compliance
2. Identify restrictive clauses
3. ...
```

### New Capabilities

```yaml
---
name: create-presentation
description: Create PowerPoint presentations
---

To create a presentation:
1. Define the outline
2. Generate content per slide
3. Apply the template
```

### Reproducible Workflows

```yaml
---
name: release
description: Standard release process
disable-model-invocation: true
---

1. Bump the version
2. Generate the changelog
3. Create the Git tag
4. Publish the package
```

## Where to Find Skills

| Source | URL |
|--------|-----|
| Official examples | [github.com/anthropics/skills](https://github.com/anthropics/skills) |
| Specification | [agentskills.io/specification](https://agentskills.io/specification) |
| Reference library | [github.com/agentskills/agentskills](https://github.com/agentskills/agentskills) |

## Distribution

### Per Project

Commit `.claude/skills/` to the repository:

```bash
git add .claude/skills/
git commit -m "feat: add project skills"
```

### Per Plugin

Create a skill directory distributed via a plugin:

```
my-plugin/
└── skills/
    ├── skill-a/SKILL.md
    └── skill-b/SKILL.md
```

### Per Organization

Deploy via managed settings at the enterprise level so all developers benefit.

## Resources

- [Agent Skills — Official site](https://agentskills.io)
- [Complete specification](https://agentskills.io/specification)
- [GitHub Repository](https://github.com/agentskills/agentskills)
- [Anthropic Skills Examples](https://github.com/anthropics/skills)
- [Claude Code Documentation — Skills](https://code.claude.com/docs/en/skills)
