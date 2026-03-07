# Ultraviolet Perigee — Changelog

All notable changes to this project, organized by date.

---

## 2026-03-07

### Added
- **Gamified Isometric Navigation:** The 3D town is now the central hub. Clicking the "Zen Shrine" opens the Meditation page, and clicking other buildings opens the Habits page.
- **Voice Pill (Coach):** Added a floating, "Wispr Flow"-style voice dictation button (`VoicePill.tsx`) globally to the Layout. Users can press to talk from any screen without navigating.
- **Voice Review Stage:** The Voice Pill now shows a review panel with editable text before sending to AI, mimicking the Wispr Flow UI.
- **Voice Input Modal:** Integrated Web Speech API (`webkitSpeechRecognition`) for pushing-to-talk to transcribe user voice on the Habits page. Includes a live pulsing animation and fallback text input.
- **Gemini AI Parsing Service:** New service (`src/services/gemini.ts`) that securely connects to Gemini 2.5 Flash to process speech transcripts using Structured Outputs (`application/json`) to accurately match against existing habits (with confidence scoring) and suggest new trackable habits.
- **AI Confirmation Panel:** New UI panel that allows the user to review AI-detected habits and confirm their completion, as well as one-click add newly suggested habits.
- **Weekly Heatmap Visualization:** 7-day visual strip on the "Today" habits view to quickly scan the week's completion percentage (represented with opacity).
- **Category Breakdown Chart:** Horizontal bar chart to visualize habit completion rates isolated by custom categories (Meditation, Exercise, Reading, Nutrition, Sleep, etc.).
- **Admin Password Reset:** Updated the auth system to allow quick auto-fill of admin sandbox credentials for easier developer testing.

### Changed
- **Habits Page:** Wire-framed the UI components to seamlessly combine the STT flow into the main Habit tracking dashboard using the existing design system. Added ~475 lines of new modular CSS logic.

### Testing the New Features
1. **Login:** The credentials `erenkeles2005@outlook.com` / `admin123456` are auto-filled on `/login`.
2. **Setup Habits:** Go to the Habits page (`/#/habits`). Make sure you have created at least a couple of habits like "Meditation", "Read a Book", or "Workout".
3. **Voice Tracking:**
   - Click the `🎤` button at the top header next to "+ New".
   - Grant microphone access.
   - Hold the mic button and say something like: *"I finished my meditation and completed a quick workout today."*
   - Let go, wait for the AI to process, and the Confirmation panel will correctly detect those two habits. Click **Mark 2 Complete**.
4. **Visualizations:**
   - The **Weekly Heatmap** will instantly show your progress for the current day increasing its shading.
   - The **Category Breakdown** will update the progress bar related to the category (e.g., Exercise) percentage.

---

## 2026-02-09

### Meditation UX — Completion Screen Redesign
- Compact 3-zone layout: hero line (`✨ Complete · 0:05`), inline stats, interactive calendar
- Stats scoped to **current month** (sessions + minutes), not all-time
- Click active calendar days → session detail pills (duration · sound · time)
- Day detail capped at 5 visible sessions, scrollable for more

### Meditation UX — Candle Flame Fix
- Reduced jitter amplitude by 70% — slow gentle sway instead of bouncing
- Added `softRem = pow(rem, 0.3)` curve — flame stays bright for 70%+ of session
- Increased all flame opacity values (glow, body, core)
- Breathing animation reduced from ±25% to ±15%

### Sidebar Flash Bug Fixed
- Countdown/session screens render as fixed overlays (`z-index: 200`) immediately
- Removed `AnimatePresence mode="wait"` dependency that caused gap

### Backend — Environment Variable Fix
- `database.py` now loads `.env.local` as fallback
- Maps `VITE_SUPABASE_URL` → `SUPABASE_URL` when dedicated vars aren't set

---

## 2026-02-08

### Meditation UX Improvements (Major)
- **Real ambient sounds**: Replaced Web Audio synthesis with 5 MP3s (rain, ocean, singing bowl, fireplace, forest) — royalty-free from Mixkit
- **Sound crossfade**: Smooth 1.5s crossfade when switching sounds during setup
- **Countdown sequence**: 3-2-1 countdown with gentle bell tones before session
- **Screen Wake Lock**: `navigator.wakeLock` keeps screen on during meditation
- **Haptic feedback**: Double-tap vibration pattern on session completion
- **Long-press exit**: 1.5s hold with circular SVG progress ring replaces tap-to-exit
- **Background notifications**: Browser Notification fires if session ends while tab is hidden
- **Streaks + stats**: Auto-saves session, fetches history to compute consecutive-day streaks
- **AnimatePresence transitions**: Fade between setup → countdown → session → completion

### Meditation Module — Core Build
- Canvas-based candle animation with breathing cycle
- Clock-face duration picker (1–60 min)
- Sound selection grid (rain, ocean, singing bowl → expanded to fireplace, forest)
- Zustand store for meditation state management
- Supabase `meditation_sessions` table for persistence

### Project Foundation
- Vite + React 19 + TypeScript scaffold
- Supabase auth (email magic link + Google OAuth)
- Design system: CSS custom properties, dark theme, Inter + Outfit fonts
- Sidebar layout with responsive breakpoints
- Dashboard placeholder
- Styles prototyping page

### Database Setup (Supabase)
- `profiles` table with RLS
- `meditation_sessions` table with RLS
- Auth trigger for auto-profile creation

---

## Skills Created
- `design-system` — Brand identity, color tokens, typography, animation philosophy
- `mobile-compatibility` — Capacitor patterns, safe areas, touch targets, native API abstraction
- `clean-code` — Minimal diffs, no over-engineering
- `frontend-design` — Production-grade UI patterns
- `component-library` — Styles page management
