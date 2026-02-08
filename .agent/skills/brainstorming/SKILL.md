---
name: brainstorming
description: Explores user intent, requirements, and design before implementation. Use before any creative work like creating features, building components, or modifying behavior.
---

# Brainstorming Ideas Into Designs

## When to use this skill
- Before creating new features
- Before building new components
- Before adding functionality
- Before modifying component behavior
- When the user asks to "brainstorm" or "plan" a feature

## Workflow
- [ ] Understand the idea (Check context, ask clarification questions)
- [ ] Explore approaches (Propose 2-3 options with trade-offs)
- [ ] Present design (Interactive walkthrough in 200-300 word sections)
- [ ] Documentation (Write design doc to `docs/plans/`)
- [ ] Implementation Handoff (Prepare for coding)

## Instructions

### 1. Understanding the Idea
1.  **Context First**: Check current project state (files, docs, recent commits) before asking.
2.  **One Question Loop**: Ask questions **one at a time**.
    *   Prefer multiple choice.
    *   Focus on purpose, constraints, and success criteria.
    *   *Do not move forward until you clearly understand the goal.*

### 2. Exploring Approaches
1.  Propose **2-3 different technical approaches**.
2.  Explain trade-offs for each.
3.  Lead with your recommendation and reasoning.

### 3. Presenting the Design
1.  Once the approach is selected, present the design.
2.  **Chunking**: Break into sections of 200-300 words.
3.  **Checkpoints**: Ask "Does this look right so far?" after each section.
4.  **Coverage**: Include architecture, components, data flow, error handling, and testing.

### 4. After the Design
1.  **Documentation**:
    *   Write the validated design to `docs/plans/YYYY-MM-DD-<topic>-design.md`.
    *   Use `elements-of-style:writing-clearly-and-concisely` if available.
2.  **Implementation Prep**:
    *   Ask: "Ready to set up for implementation?"
    *   Use `superpowers:using-git-worktrees` (if available) for isolation.
    *   Use `superpowers:writing-plans` (if available) for the implementation plan.

## Key Principles
*   **One question at a time**: Don't overwhelm.
*   **YAGNI ruthlessly**: Remove specific unnecessary features.
*   **Explore alternatives**: Always propose 2-3 approaches.
*   **Incremental validation**: Validate each section of the design.
