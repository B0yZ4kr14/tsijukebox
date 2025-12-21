# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records documenting significant technical decisions made in TSiJUKEBOX.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences.

## Template

Each ADR follows this structure:

```markdown
# ADR-NNNN: Title

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context
What is the issue we're facing and what forces are at play?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult because of this change?

## References
Related documents, issues, or previous ADRs.
```

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](ADR-0001-repository-structure.md) | Repository Structure | Accepted | 2024-12-21 |
| [ADR-0002](ADR-0002-refactoring-priorities.md) | Refactoring Priorities | Proposed | 2024-12-21 |

## Creating a New ADR

1. Copy the template below
2. Create file: `ADR-NNNN-descriptive-title.md`
3. Fill in all sections
4. Update this index
5. Submit with your PR

## Why ADRs?

- **Knowledge preservation**: Capture the "why" behind decisions
- **Onboarding**: Help new contributors understand the codebase
- **Reversibility**: Document what we tried and why
- **Accountability**: Clear record of who decided what

---

Based on [Michael Nygard's ADR format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
