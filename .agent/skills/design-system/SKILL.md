---
name: design-system
description: "Project-wide design system and coding conventions for Ultraviolet Perigee. Use when building any UI component, page, feature, or backend endpoint. This is the single source of truth for brand identity, color tokens, typography, animation philosophy, component structure, state management patterns, and API conventions. Read this BEFORE writing any code."
---

# Ultraviolet Perigee — Design System & Conventions

This document is the **single source of truth** for all visual and architectural decisions. Update this file when branding, tokens, or conventions change — everything cascades from here.

## 1. Brand Identity

> **Status: Placeholder — update when finalized**

| Property | Value |
|----------|-------|
| App Name | Ultraviolet Perigee |
| Tagline | All-in-One Self-Improvement Platform |
| Logo | `TBD` — place in `/public/logo.svg` |
| Favicon | `TBD` — place in `/public/favicon.ico` |

## 2. Color Tokens

All colors are defined as CSS variables in `index.css`. Never use raw hex values in components.

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0f;       /* Main app background */
  --bg-secondary: #12121a;     /* Cards, panels, module containers */
  --bg-elevated: #1a1a25;      /* Modals, dropdowns, elevated surfaces */

  /* Text */
  --text-primary: #e0d5c7;     /* Headings, primary content */
  --text-secondary: #8a8078;   /* Labels, metadata, timestamps */
  --text-muted: #5a534d;       /* Disabled, placeholder */

  /* Accent */
  --accent: #c8956c;           /* Buttons, highlights, active states */
  --accent-hover: #d4a67d;     /* Hover state for accent elements */
  --accent-muted: rgba(200, 149, 108, 0.15); /* Subtle accent backgrounds */

  /* Glow & Animation */
  --glow: rgba(255, 200, 100, 0.15); /* Ambient glow for breathing circle, animations */

  /* Semantic */
  --success: #6ec87a;
  --warning: #e8b94a;
  --error: #d4574a;

  /* Borders & Dividers */
  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);
}
```

### Usage Rules
- **Never hardcode colors** — always use `var(--token-name)`
- One dominant tone (`--bg-primary`), one accent (`--accent`), one neutral system (`--text-secondary`)
- Dark backgrounds promote focus and reduce eye strain during evening use
- Warm amber accent creates emotional warmth and approachability

## 3. Typography

```css
:root {
  --font-primary: 'Inter', system-ui, sans-serif;  /* Body text — swap when brand finalizes */
  --font-display: 'Inter', system-ui, sans-serif;   /* Headings — swap when brand finalizes */

  /* Scale (modular, 1.25 ratio) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

> **Note:** `Inter` is a placeholder. When brand fonts are selected, update `--font-primary` and `--font-display` here and in the Google Fonts import.

## 4. Spacing & Layout

```css
:root {
  /* 4px base unit */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --max-width-content: 1200px;
  --sidebar-width: 280px;
}
```

## 5. Animation Philosophy

Animations are **intentionally slow and fluid** to reinforce mindfulness rather than urgency.

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
  --transition-mindful: 600ms cubic-bezier(0.4, 0, 0.2, 1); /* For wellness interactions */
}
```

### Rules
- Use CSS transitions for simple state changes (hover, focus)
- Use Framer Motion only for orchestrated sequences (breathing circle, page transitions)
- GPU-accelerate animations: only animate `transform` and `opacity`
- No decorative micro-motion spam — every animation must serve a purpose
- Meditation/breathing: 6-second inhale/exhale cycle (scale 1.0 → 1.3, opacity 0.3 → 0.7)

## 6. Component Patterns

### File Structure (per module)

```
src/
├── components/         # Shared, reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── modules/            # Feature modules (1 folder per PRD module)
│   ├── meditation/
│   │   ├── components/ # Module-specific components
│   │   ├── hooks/      # Module-specific hooks
│   │   ├── store.ts    # Zustand slice for this module
│   │   └── index.tsx   # Module page/route entry
│   ├── habits/
│   ├── productivity/
│   └── ...
├── stores/             # Global Zustand stores
├── services/           # API service layer
├── styles/             # Global CSS
│   └── index.css       # Design tokens live here
└── App.tsx
```

### Component Rules
- Functional components only, no class components
- Co-locate module-specific code inside `modules/<name>/`
- Shared components go in top-level `components/`
- One component per file, named export matching filename

## 7. State Management

| Scope | Tool | Example |
|-------|------|---------|
| Local UI state | `useState` / `useReducer` | Modal open, form inputs |
| Module state | Zustand slice in `modules/<name>/store.ts` | Meditation timer, habit list |
| Global app state | Zustand in `stores/` | User profile, `subscription_tier`, theme |
| Server state | Fetch + Zustand (or SWR if needed) | API data |

### Rules
- No prop drilling beyond 2 levels — use Zustand or Context
- Zustand stores are flat, not nested
- Derive state instead of duplicating it

## 8. API & Backend Conventions

### Endpoint Pattern
```
/api/{module}/{action}

Examples:
  POST   /api/meditation/sessions
  GET    /api/meditation/sessions
  GET    /api/habits
  POST   /api/habits/{id}/complete
  GET    /api/health/workouts
```

### Rules
- FastAPI async endpoints only
- All endpoints return `{ data, error }` shape
- Supabase client initialized once, imported from `services/supabase.py`
- Use Pydantic models for request/response validation
- Environment variables for all secrets (Supabase URL, keys, Gemini API key)

## 9. Feature Gating

Every feature that may become premium later should check tier:

```typescript
// Frontend pattern
const { tier } = useUserStore();
if (tier === 'free' && isPremiumFeature) {
  return <UpgradePrompt />;
}
```

```python
# Backend pattern
def require_premium(user: User):
    if user.subscription_tier != "premium":
        raise HTTPException(403, "Premium required")
```

### Premium-tagged features (build them, gate them later)
- Voice input (STT costs money)
- AI cross-feature insights
- Weekly AI coaching with Imagen art
- Custom routine builder
- Unlimited habits (free tier: 5 max)

## 10. How to Update This Document

When brand identity is finalized:
1. Update Section 1 (name, logo paths)
2. Update Section 2 CSS variables (colors)
3. Update Section 3 font families
4. Run find-and-replace on any hardcoded values (there should be none)
5. Everything cascades through CSS variables automatically
