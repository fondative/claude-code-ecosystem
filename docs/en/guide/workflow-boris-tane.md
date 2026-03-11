# Boris Tane Workflow

> **Source**: [How I Use Claude Code](https://boristane.com/blog/how-i-use-claude-code/) — Boris Tane, Engineering Lead at Cloudflare (former Baselime founder). Published February 10, 2026.

## TL;DR

**Never let Claude write code before validating a written plan.** Separating research, planning and implementation avoids token waste and produces better results.

```
Research (research.md) → Plan (plan.md) → Annotation cycles → Implementation
```

---

## Phase 1: Research

Claude analyzes in depth the relevant parts of the codebase. Results are documented in a persistent `research.md` file (not a verbal summary).

### Key Techniques

- Use explicit language: *"deeply"*, *"in great details"*, *"intricacies"*, *"go through everything"*
- Require written artifacts to verify comprehension
- Identify understanding gaps **before** planning

### Errors Avoided Thanks to Research

- Ignoring existing cache layers
- Violating ORM conventions
- Duplicating logic that exists elsewhere
- Missing architectural constraints

:::tip Principle
Research prevents ignorant changes. Without it, Claude produces code that works in isolation but breaks the surrounding system.
:::

---

## Phase 2: Planning

Claude creates a detailed `plan.md` (not the built-in plan mode) containing:

- The implementation approach explained
- Code snippets showing the actual changes
- File paths to modify
- Trade-offs and considerations

:::tip Tip
Share reference implementations from open-source projects. Claude works better from a concrete example than designing from scratch.
:::

---

## Phase 3: Annotation Cycle

This is the most original phase of the workflow. It repeats **1 to 6 times** between planning and implementation.

### Process

1. Claude writes `plan.md`
2. The developer reads it in the editor and adds **inline notes** directly in the document
3. The developer sends it back to Claude with the explicit guard: **"don't implement yet"**
4. Claude updates the plan according to the annotations
5. Cycle repeats until satisfaction

### Types of Annotations

| Type | Example |
|------|---------|
| Domain correction | *"This field is not nullable in prod"* |
| Constraint clarification | *"Rate limit = 100 req/min, not 1000"* |
| Approach rejection | *"No, use the existing service"* |
| Business requirement | *"Admins see everything, users only their data"* |
| Architectural redirect | *"This should be an event, not a synchronous call"* |

### Why It Works

- Markdown serves as a **shared mutable state** between human and AI
- Structured specification vs scattered chat history
- The developer thinks at their own pace
- Precise corrections without rebuilding context

:::warning Final step
Request a granular breakdown into tasks with an explicit **"don't implement yet"** before moving to implementation.
:::

---

## Phase 4: Implementation

A standard prompt encodes all requirements:

> *"Implement it all. When done with task/phase, mark completed in plan document. Do not stop until all tasks completed. Do not add unnecessary comments or jsdocs, do not use any or unknown types. Continuously run typecheck."*

### Key Elements

| Element | Objective |
|---------|----------|
| *"Implement it all"* | Complete everything without stopping |
| Plan as source of truth | Progress tracking in the document |
| No mid-flow pauses | Continuous execution |
| Strict typing | No `any` or `unknown` |
| Continuous typecheck | Permanent verification during implementation |

:::tip Principle
Implementation becomes **mechanical, not creative**. All the thinking has already happened in the previous phases.
:::

---

## Feedback During Implementation

The developer's role shifts to **supervisor** with direct, concise corrections:

### Feedback Examples

- **Single word**: *"wider"*, *"still cropped"*, *"2px gap"*
- **Function level**: *"You didn't implement deduplicateByTitle"*
- **Scope redirect**: *"Move this to admin app, not main app"*
- **Visual**: send a screenshot for UI issues
- **Pattern**: *"Match existing users table exactly"*

### Scope Management

- **Full revert** rather than patching a failed approach
- Use `git` to abandon changes when the direction is wrong
- Restrict objectives after a revert

---

## Staying in Control

The developer maintains control through 5 levers:

| Lever | Action |
|-------|--------|
| **Cherry-pick** | Evaluate each proposal individually |
| **Trim scope** | Remove nice-to-haves and non-essentials |
| **Interface protection** | Strict constraints on existing signatures and APIs |
| **Technical override** | Impose library, model or method choice |
| **Item-by-item decision** | Balance complexity vs immediate value |

---

## Session Structure

- Research, planning and implementation in **a single long session**
- No splitting across multiple separate sessions
- Claude's auto-compaction keeps performance adequate
- The `plan.md` file survives compaction in full fidelity

---

## Visual Summary

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Research    │───→│   Planning   │───→│   Annotation    │───→│Implementation│
│             │    │             │    │   Cycles (1-6)  │    │             │
│ research.md │    │  plan.md    │    │  edited plan.md │    │ Final code  │
└─────────────┘    └─────────────┘    └─────────────────┘    └──────────────┘
                                            │       ↑
                                            │  "don't implement yet"
                                            └───────┘
```

---

## Links with the Claude Code Ecosystem

| Boris Tane Concept | Claude Code Equivalent |
|--------------------|----------------------|
| `research.md` | Explore agent / read-only sub-agent |
| `plan.md` | Plan mode (`/plan`) or launcher skill |
| Inline annotations | User feedback in the conversation |
| "Implement it all" | Implementation agent (Sonnet) |
| Continuous typecheck | PostToolUse hook or command in the prompt |
| Persistent file | CLAUDE.md / MEMORY.md |

---

## Resources

- [Original article](https://boristane.com/blog/how-i-use-claude-code/) — Boris Tane
- [Boris Tane on X/Twitter](https://x.com/boristane)
