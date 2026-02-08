---
name: component-library
description: Manage the in-app component library (Styles page). Use when creating new UI variants, comparing styles, or registering production components.
---

# Component Library Skill

The project has an in-app component library at `/styles` (sidebar → "Styles").
It lets the user browse, compare, and pick UI variants before committing them to production.

## Architecture

**File:** `src/modules/styles/StylesPage.tsx`

The library is powered by a `CATEGORIES` array at the top of the file:

```ts
const CATEGORIES: Category[] = [
  {
    id: 'login',
    label: 'Login / Register',
    icon: '🔐',
    variants: [
      { id: 'cosmic-ambient', label: 'Cosmic Ambient', tag: 'USED', component: <CosmicAmbientLogin /> },
    ],
  },
];
```

Each category has an `id`, `label`, `icon`, and array of `variants`.
Each variant has an `id`, `label`, optional `tag: 'USED'`, and a `component`.

## Workflow: Adding a New Style

1. **Create the variant component** as a function in `StylesPage.tsx` (or import from a separate file for complex ones).
2. **Wrap it** in a `<div className="proto-frame [your-bg-class]">` so it renders inside the viewport.
3. **Register it** by adding an entry to the appropriate category in `CATEGORIES`.
4. **Add CSS** for the variant in `StylesPage.css`.
5. **DO NOT** tag it as `USED` yet — only the user decides which variant ships.

## Workflow: Promoting a Variant to Production

1. User picks a variant from the library.
2. Implement the real component (e.g., `LoginPage.tsx`) based on the prototype.
3. Tag the winning variant with `tag: 'USED'` in the registry.
4. Remove unused variants from the same category (delete both the component function and CSS).

## Workflow: Adding a New Category

1. Add a new object to `CATEGORIES` with a unique `id`, descriptive `label`, emoji `icon`, and empty `variants` array.
2. Build variant components and add them to the new category.

## Rules

- **One USED per category** — only one variant should be tagged `USED` at a time.
- **Prototype components use `MockForm` or mock data** — they should never call real APIs or manage real state.
- **All prototype styles live in `StylesPage.css`** — don't leak prototype styles into production CSS files.
- **Proto frames are 100% width/height** — they fill the viewport container, which is `560px` tall.
