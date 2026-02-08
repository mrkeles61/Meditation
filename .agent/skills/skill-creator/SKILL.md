---
name: skill-creator
description: "Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations. Use when creating a new skill from scratch, updating or iterating on an existing skill, packaging a skill for distribution, or understanding skill best practices and design patterns."
---

# Skill Creator

This skill provides guidance for creating effective skills.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. Think of them as "onboarding guides" for specific domains or tasks—they transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge that no model can fully possess.

### What Skills Provide

- **Specialized workflows** - Multi-step procedures for specific domains
- **Tool integrations** - Instructions for working with specific file formats or APIs
- **Domain expertise** - Company-specific knowledge, schemas, business logic
- **Bundled resources** - Scripts, references, and assets for complex and repetitive tasks

## Core Principles

### Concise is Key

The context window is a public good. Skills share the context window with everything else Claude needs: system prompt, conversation history, other Skills' metadata, and the actual user request.

**Default assumption**: Claude is already very smart. Only add context Claude doesn't already have. Challenge each piece of information: "Does Claude really need this explanation?" and "Does this paragraph justify its token cost?"

Prefer concise examples over verbose explanations.

### Set Appropriate Degrees of Freedom

Match the level of specificity to the task's fragility and variability:

- **High freedom** (text-based instructions): Use when multiple approaches are valid, decisions depend on context, or heuristics guide the approach.
- **Medium freedom** (pseudocode or scripts with parameters): Use when a preferred pattern exists, some variation is acceptable, or configuration affects behavior.
- **Low freedom** (specific scripts, few parameters): Use when operations are fragile and error-prone, consistency is critical, or a specific sequence must be followed.

Think of Claude as exploring a path: a narrow bridge with cliffs needs specific guardrails (low freedom), while an open field allows many routes (high freedom).

## Anatomy of a Skill

Every skill consists of a required SKILL.md file and optional bundled resources:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter metadata (required)
│   │   ├── name: (required)
│   │   └── description: (required)
│   └── Markdown instructions (required)
└── Bundled Resources (optional)
    ├── scripts/          - Executable code (Python/Bash/etc.)
    ├── references/       - Documentation intended to be loaded into context as needed
    └── assets/           - Files used in output (templates, icons, fonts, etc.)
```

### SKILL.md (required)

Every SKILL.md consists of:

- **Frontmatter (YAML)**: Contains `name` and `description` fields. These are the only fields that Claude reads to determine when the skill gets used.
- **Body (Markdown)**: Instructions and guidance for using the skill. Only loaded AFTER the skill triggers.

### Bundled Resources (optional)

#### scripts/
Executable code (Python/Bash/etc.) for tasks that require deterministic reliability or are repeatedly rewritten.

- **When to include**: When the same code is being rewritten repeatedly or deterministic reliability is needed
- **Benefits**: Token efficient, deterministic, may be executed without loading into context

#### references/
Documentation and reference material intended to be loaded as needed into context.

- **When to include**: For documentation that Claude should reference while working
- **Examples**: API documentation, database schemas, company policies, detailed workflow guides

#### assets/
Files not intended to be loaded into context, but rather used within the output Claude produces.

- **When to include**: When the skill needs files that will be used in the final output
- **Examples**: PowerPoint templates, logo files, HTML/React boilerplate, fonts

### What NOT to Include

Do NOT create extraneous documentation or auxiliary files:
- ❌ README.md
- ❌ INSTALLATION_GUIDE.md
- ❌ QUICK_REFERENCE.md
- ❌ CHANGELOG.md

## Progressive Disclosure Design

Skills use a three-level loading system to manage context efficiently:

1. **Metadata** (name + description) - Always in context (~100 words)
2. **SKILL.md body** - When skill triggers (<5k words)
3. **Bundled resources** - As needed by Claude (Unlimited)

Keep SKILL.md body to the essentials and under 500 lines. When splitting content:
- Reference files clearly from SKILL.md
- Describe when to read them
- Keep references one level deep from SKILL.md

For detailed patterns, see [references/workflows.md](references/workflows.md) and [references/output-patterns.md](references/output-patterns.md).

## Skill Creation Process

### Step 1: Understand the Skill with Concrete Examples

Ask clarifying questions to understand:
- What functionality should the skill support?
- What would a user say that should trigger this skill?
- Can you give examples of how this skill would be used?

### Step 2: Plan the Reusable Skill Contents

For each example, identify what scripts, references, and assets would be helpful:
- **Scripts**: Code that would be rewritten each time
- **References**: Documentation needed while working
- **Assets**: Templates or files used in output

### Step 3: Initialize the Skill

Run the initialization script to create the skill structure:

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

The script creates:
- Skill directory with SKILL.md template
- Example resource directories (scripts/, references/, assets/)

### Step 4: Edit the Skill

1. Start with reusable resources (scripts, references, assets)
2. Test added scripts by actually running them
3. Delete example files not needed
4. Update SKILL.md frontmatter and body

**Frontmatter Guidelines:**
- `name`: Hyphen-case identifier (e.g., 'data-analyzer')
- `description`: Include WHAT it does AND WHEN to use it

### Step 5: Package the Skill

```bash
scripts/package_skill.py <path/to/skill-folder> [output-directory]
```

The script:
1. Validates the skill automatically
2. Creates a `.skill` file (zip format) if validation passes

### Step 6: Iterate

After testing:
1. Use the skill on real tasks
2. Notice struggles or inefficiencies
3. Identify improvements
4. Implement changes and test again

## Resources

- **scripts/init_skill.py** - Initialize new skill from template
- **scripts/package_skill.py** - Package skill for distribution
- **scripts/quick_validate.py** - Validate skill structure
- **references/workflows.md** - Sequential and conditional workflow patterns
- **references/output-patterns.md** - Template and examples patterns for consistent output
