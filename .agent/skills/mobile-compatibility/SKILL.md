---
name: mobile-compatibility
description: Ensures all UI components and features work on mobile (Capacitor iOS/Android) with proper safe areas, touch targets, native APIs, and responsive patterns. Use when building any new module, page, or interactive feature.
---

# Mobile Compatibility Skill

## When to Use
- Building any new UI component or page
- Adding interactive features (gestures, notifications, haptics)
- Modifying navigation or layout
- Adding audio/video playback

## Architecture

### Native Abstraction Layer (`src/utils/native.ts`)
All native APIs are accessed through this abstraction layer. **Never call browser APIs directly** for features that have native equivalents.

```typescript
import { haptic, scheduleNotification, keepScreenOn, isNative } from '../utils/native';
```

| Function | Native (Capacitor) | Web Fallback |
|----------|-------------------|--------------|
| `haptic(style)` | `@capacitor/haptics` | `navigator.vibrate()` |
| `scheduleNotification()` | `@capacitor/local-notifications` | `Notification` API |
| `keepScreenOn()` | `@capacitor/keep-awake` | Wake Lock API |
| `isNative()` | `Capacitor.isNativePlatform()` | `false` |

## CSS Rules

### Safe Areas
Always account for notch/home indicator on modern phones:

```css
/* Top-level containers */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Touch Targets
All interactive elements must be at minimum **44×44px** (Apple HIG) / **48×48dp** (Material):

```css
.interactive-element {
    min-height: 44px;
    min-width: 44px;
}
```

### Fixed Position Elements
When using `position: fixed`, always add safe area padding:

```css
.bottom-bar {
    position: fixed;
    bottom: 0;
    padding-bottom: env(safe-area-inset-bottom);
}
```

### Viewport Units
Use `dvh` (dynamic viewport height) instead of `vh` to handle mobile browser chrome:

```css
min-height: 100dvh;  /* ✓ */
min-height: 100vh;   /* ✗ jumps when address bar hides */
```

### Overflow Scrolling
Use `-webkit-overflow-scrolling: touch` for smooth native scroll feel:

```css
.scrollable {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}
```

### Input Handling
Prevent iOS zoom on inputs:

```css
input, select, textarea {
    font-size: 16px; /* prevents iOS auto-zoom */
}
```

## Navigation Pattern

### Desktop (≥768px)
- Sidebar navigation (existing pattern)

### Mobile (<768px)
- **Bottom tab bar** with icons + labels
- No hamburger menu — direct tab access
- Tabs: Dashboard, Meditation, Profile

## Component Checklist

When building ANY new component, verify:

- [ ] **Touch targets** ≥ 44px on all interactive elements
- [ ] **Safe areas** respected (especially bottom for tab bar)
- [ ] **No hover-only interactions** — all hover states have touch equivalents
- [ ] **Gestures** work with touch (use `onPointerDown`/`onPointerUp`, not `onClick` for press-and-hold)
- [ ] **Native APIs** use abstraction layer, not browser APIs directly
- [ ] **Font sizes** ≥ 14px for body text on mobile
- [ ] **No horizontal scroll** on mobile viewport (max-width: 100%)
- [ ] **Animations respect** `prefers-reduced-motion`
- [ ] **Keyboard** doesn't obscure inputs (use `visualViewport` API if needed)
- [ ] **Portrait + landscape** both work (or lock orientation in capacitor.config.ts)

## Audio on Mobile

iOS requires user gesture to start audio playback. Always:

```typescript
// Audio must be started from a user gesture handler
button.addEventListener('click', () => {
    audio.play(); // ✓ works on iOS
});

// This will be blocked on iOS:
useEffect(() => {
    audio.play(); // ✗ blocked by autoplay policy
}, []);
```

For background audio, configure `capacitor.config.ts`:
```json
{
    "plugins": {
        "App": {
            "iosScheme": "capacitor",
            "allowNavigation": ["*"]
        }
    }
}
```

## Testing

### Before any PR, test on:
1. Desktop browser (Chrome)
2. Mobile browser via `npm run dev -- --host` on phone
3. iOS Simulator (via Xcode) — if Capacitor is set up
4. Android Emulator (via Android Studio) — if Capacitor is set up

### Quick Mobile Test
```bash
npm run dev -- --host
# Open http://<local-ip>:5173 on phone
```
