# Ultraviolet Perigee
## All-in-One Self-Improvement Platform
### Product Requirements Document v2.0

---

**Project Name:** Ultraviolet Perigee - Complete Wellness Ecosystem  
**Version:** 2.0 - Comprehensive Feature Set  
**Date:** February 2026  
**Scope:** Meditation • Habits • Productivity • Health • Mindfulness • AI Coaching

---

# 1. Executive Summary

Ultraviolet Perigee is a comprehensive self-improvement platform that unifies meditation, habit tracking, productivity management, health monitoring, and mindfulness practices into a single AI-powered ecosystem. By combining voice-first interactions, intelligent automation, and personalized insights, the platform eliminates the friction of managing multiple wellness apps while providing deep, actionable guidance for sustainable personal growth.

The platform features: distraction-free meditation with ambient audio, voice-powered habit and activity logging, Pomodoro focus sessions, intelligent task management, journaling with AI prompts, mood and emotion tracking, gratitude practice, health metrics (workouts, meals, weight), customizable routines, and cross-feature AI insights that reveal how different wellness dimensions impact each other.

The hybrid interface presents a unified dashboard showing holistic wellness at a glance, while deep-dive modules allow focused engagement with each feature area. AI coaching ties everything together through daily summaries, smart contextual nudges, and comprehensive weekly reviews.

---

# 2. Product Vision & Goals

## 2.1 Vision Statement

To create the definitive personal wellness operating system—a unified platform that intelligently integrates every dimension of self-improvement, leveraging AI to surface meaningful insights, reduce cognitive overhead, and empower users to build lasting positive change across mind, body, and productivity.

## 2.2 Core Principles

- **Voice-First Input:** Minimize manual data entry through natural speech interaction
- **Intelligent Integration:** AI reveals connections between habits, mood, productivity, and wellness
- **Contextual Simplicity:** Surface the right feature at the right time without overwhelming the user
- **Holistic Wellness:** Recognize that meditation, productivity, health, and mindfulness are interconnected
- **Sustainable Design:** Promote long-term behavioral change over short-term motivation spikes

## 2.3 Success Metrics

- **Daily Engagement:** Users interact with 3+ feature areas per day within 60 days
- **Voice Adoption:** 80%+ of habit/activity logging uses voice input within 30 days
- **Streak Maintenance:** Users maintain 14-day+ streaks for at least 3 tracked behaviors
- **AI Insight Engagement:** 70%+ of users view and act on daily AI summaries
- **Cross-Feature Discovery:** Users discover and adopt 2+ secondary features within 14 days
- **Retention:** 60%+ month-over-month retention after 90 days

---

# 3. Feature Architecture Overview

The platform is organized into eight interconnected modules, accessible through a hybrid dashboard + deep-dive interface. The unified dashboard provides a morning glance at wellness status, while module-specific views enable focused engagement.

## Feature Modules

| Module | Phase | Core Function |
|--------|-------|---------------|
| **Meditation Timer** | Phase 1 | Guided breathing, ambient sounds, session tracking |
| **Habit Tracker** | Phase 2 | Voice/manual habit logging, streaks, AI suggestions |
| **Productivity Hub** | Phase 3 | Pomodoro timer, task lists, time blocking calendar |
| **Health Tracker** | Phase 3 | Workout logging, meal photos, weight tracking |
| **Mindfulness Journal** | Phase 4 | Daily journaling, AI prompts, gratitude practice |
| **Mood & Emotion** | Phase 4 | Mood check-ins, emotion patterns, triggers analysis |
| **Goal System** | Phase 5 | Goal setting, milestone tracking, progress visualization |
| **AI Coaching** | Ongoing | Daily summaries, smart nudges, weekly reviews, insights |

---

# 4. Core Module Specifications

## 4.1 Meditation Timer (Phase 1)

**Purpose:** Provide distraction-free meditation with breathing animation, ambient audio, and automatic session tracking.

### Setup Screen

- Duration presets: 5, 10, 15, 20, 30 minutes (highlighted selection)
- Custom slider: 1-60 minutes, synced with presets
- Sound selection: Rain, Ocean, Singing Bowl, Silence
- Begin button with smooth transition to fullscreen

### Meditation Experience

- Fullscreen immersive mode (automatic on session start)
- Breathing circle: 6-second inhale/exhale cycle (scale 1.0 → 1.3, opacity 0.3 → 0.7, warm amber glow)
- GPU-accelerated animation maintains 60fps
- Ambient audio loops with fade-in/fade-out
- Zero UI: No countdown, buttons, or text during meditation
- Early exit: Escape/tap saves partial session and transitions to completion
- Session end: Gentle chime, auto-transition to completion screen

### Completion & Stats

- Session summary with completed duration
- Total sessions, total minutes, current streak, longest streak
- Auto-marks meditation habit as complete in habit tracker
- Quick restart button returns to setup

---

## 4.2 Comprehensive Habit Tracker (Phase 2)

**Purpose:** Voice-powered habit tracking with AI understanding, streak management, and intelligent suggestions.

### Voice Input System

- Push-to-talk with visual pulse animation during recording
- Live transcription display as user speaks (builds confidence)
- Flexible workflow: Daily reflection ("Today I meditated, exercised, and read") OR real-time ("Just finished my workout")
- Google Cloud Speech-to-Text for audio conversion
- Gemini AI parses transcription and detects habit completion
- Confirmation UI: Shows detected habits with checkmarks before saving
- Manual fallback: Text input option for quiet environments

### Habit Management

- Pre-defined habits: User creates initial list across categories
- Categories: Meditation, Exercise, Reading/Learning, Nutrition, Sleep
- Habit attributes: Name, category, target frequency (daily/weekly/custom), icon
- AI habit suggestions: System detects frequently mentioned activities ("You've mentioned journaling 5 times—track it?")
- Hybrid approach: Start with user-defined habits, AI refines over time
- Archive inactive habits (soft delete)

### Visual Habit Dashboard

- Grid view: All habits with today's completion status (checkmarks/empty circles)
- Streak counters: Current and longest streak displayed per habit
- Weekly heatmap: 7-day visual showing completion patterns
- Category breakdown: Percentage complete by category
- Quick manual toggle: Tap to mark complete/incomplete without voice

---

## 4.3 Productivity Hub (Phase 3)

**Purpose:** Integrated focus tools to enhance deep work, task completion, and time management.

### Pomodoro Focus Timer

- Customizable work/break intervals (default: 25 min work, 5 min break)
- Focus session tracking: Records completed Pomodoros with task association
- Ambient sound integration: Same audio library as meditation timer
- Do Not Disturb mode: Minimizes notifications during focus sessions
- Daily focus time stats: Total deep work minutes tracked

### Task List Management

- Quick capture: Voice or text input for new tasks
- Task attributes: Title, due date, priority (high/medium/low), category tags
- Smart organization: Auto-sort by priority and due date
- Completion tracking: Check off completed tasks, archive old items
- Voice task entry: "Add task: Finish project proposal by Friday, high priority"

### Time Blocking Calendar

- Day view: Hourly grid showing scheduled blocks
- Block types: Deep work, meetings, exercise, meditation, meals, breaks
- Drag-and-drop scheduling: Move and resize time blocks
- Template routines: Apply saved daily schedules (e.g., "Ideal Monday")
- Integration: Links to Pomodoro sessions, meditation timer, habit routines

---

## 4.4 Health Metrics Tracker (Phase 3)

**Purpose:** Comprehensive health data logging for workouts, nutrition, and body metrics.

### Workout Logging

- Voice entry: "Ran 5 miles in 45 minutes" or "Did 30 minutes of yoga"
- Workout types: Running, cycling, strength training, yoga, sports, walking
- Exercise details: Duration, distance, intensity, notes
- Historical view: Weekly/monthly workout calendar
- Auto-marks exercise habit as complete

### Meal Logging

- Photo capture: Snap meal photos for visual log
- Voice description: "Grilled chicken salad for lunch"
- Meal timing: Breakfast, lunch, dinner, snacks
- Gallery view: Visual meal history timeline
- Healthy eating habit integration

### Body Metrics

- Weight tracking: Manual entry with date stamps
- Trend visualization: Line chart showing weight over time
- Frequency: Weekly or custom check-in schedule
- Privacy: Data stored locally, never shared

---

## 4.5 Mindfulness Journal (Phase 4)

**Purpose:** Daily reflection practice with AI-generated prompts and gratitude tracking.

### Daily Journaling

- AI prompts: Gemini generates contextual questions based on recent activity ("You meditated twice this week—how has it affected your focus?")
- Freeform writing: Rich text editor for open reflection
- Voice-to-text: Dictate journal entries
- Entry history: Calendar view of past journal entries
- Search: Find entries by keyword or date

### Gratitude Practice

- Daily gratitude prompts: "What are you grateful for today?"
- Quick capture: Three gratitude items per day minimum
- Gratitude gallery: Visual collection of past gratitudes
- Marks gratitude habit complete automatically

---

## 4.6 Mood & Emotion Tracking (Phase 4)

**Purpose:** Track emotional patterns and identify triggers to support mental wellness.

### Mood Check-Ins

- Simple scale: 1-10 mood rating with optional emoji selection
- Emotion tags: Happy, anxious, stressed, energized, calm, frustrated, excited, etc.
- Context notes: Optional brief description of what influenced mood
- Multiple check-ins per day: Morning, afternoon, evening

### Pattern Analysis

- Mood timeline: Visual graph showing mood trends over weeks/months
- AI insights: Gemini identifies correlations ("Your mood is 30% higher on days you meditate")
- Trigger detection: Highlights activities or times associated with negative moods
- Weekly emotion summary: Dominant emotions and sentiment trends

---

## 4.7 Goal Setting & Milestones (Phase 5)

**Purpose:** Define long-term objectives with measurable milestones and track progress holistically.

### Goal Creation

- Goal attributes: Title, description, target date, category (health, productivity, mindfulness, personal)
- Milestones: Break down goals into 3-5 checkpoints
- Habit linking: Associate habits with goals (e.g., "Meditate daily" → "Reduce stress goal")
- AI suggestions: Gemini recommends milestones based on goal type

### Progress Tracking

- Progress bar: Visual percentage complete based on milestone completion
- Automatic updates: Habit streaks and task completion contribute to goal progress
- Milestone celebrations: In-app recognition when milestones are achieved
- Goal gallery: Overview of all active and completed goals

---

## 4.8 AI Coaching & Cross-Feature Integration (Ongoing)

**Purpose:** Intelligent system that connects all modules, surfaces insights, and provides personalized guidance.

### Daily AI Summary

- Morning dashboard card: "Your day at a glance" with wellness snapshot
- Content: Yesterday's highlights, today's scheduled routines, pending tasks, habit streak status
- Tone: Encouraging and concise (3-4 sentences max)
- Generated via Gemini API using previous 24 hours of activity data

### Smart Contextual Nudges

- Time-based prompts: "You usually meditate now—ready to start?" (based on historical patterns)
- Streak protection: "2-day meditation streak—keep it going!"
- Task reminders: Gentle nudges for pending high-priority tasks
- Non-intrusive: Appears as subtle dashboard cards, not push notifications

### Cross-Feature Insights

- Correlation analysis: "You complete 40% more tasks on days you meditate in the morning"
- Mood-habit connections: "Your mood averages 8/10 on days you journal"
- Sleep-productivity: "8+ hours of sleep correlates with 2x more Pomodoros completed"
- Exercise-meditation: "You're 75% more likely to meditate on workout days"
- Generated weekly using Gemini API analysis of multi-module data

### Weekly Coaching Session

- Comprehensive review: Every Sunday evening, Gemini generates detailed progress report
- Content sections: Wins of the week, areas for improvement, actionable recommendations, motivational message
- Visualization: AI-generated progress image using Google Imagen (metaphorical artwork reflecting weekly themes)
- Shareable: Users can download or share weekly summary to social media

---

## 4.9 Custom Routine Builder (Phase 5)

**Purpose:** Create and automate personalized daily routines that integrate multiple features.

### Evening Wind-Down Routine

- Routine steps: Sequence of activities (e.g., gratitude practice → journal → meditation)
- One-tap activation: Start routine, app guides through each step
- Auto-tracking: Routine completion marks associated habits
- Customization: Add/remove/reorder steps, set duration per step

### Weekly Review Ritual

- Guided reflection: Structured prompts for reviewing week
- Steps: Review AI summary → reflect in journal → set 3 intentions for next week
- Scheduling: Set preferred day/time for weekly review
- Integration: Pulls data from all modules for comprehensive view

### Custom Routine Templates

- Drag-and-drop builder: Add feature modules (meditation, task review, mood check-in)
- Save as template: Reuse routines ("Monday Morning", "Sunday Planning")
- Share routines: Export/import routine configurations

---

# 5. User Interface Architecture

## 5.1 Hybrid Dashboard + Module System

The interface employs a hybrid approach: a unified dashboard provides holistic wellness overview, while dedicated module views enable deep engagement with specific features.

### Unified Dashboard

- Top section: Daily AI summary card with wellness snapshot
- Habit overview: Today's habits with completion status (grid or list view)
- Quick stats: Meditation minutes, Pomodoros completed, tasks done, mood rating
- Smart nudges: Contextual prompts based on time and patterns
- Quick actions: Voice log button, start meditation, add task
- Module shortcuts: Icon-based navigation to deep-dive views

### Module Deep-Dive Views

- **Meditation:** Setup → session → completion flow (fullscreen immersion)
- **Habits:** Visual habit grid, streak calendars, category breakdown
- **Productivity:** Pomodoro timer, task list, time blocking calendar
- **Health:** Workout log, meal gallery, weight chart
- **Journal:** Entry editor, AI prompts, gratitude practice
- **Mood:** Check-in interface, emotion tags, mood timeline
- **Goals:** Goal cards, milestone tracker, progress visualizations
- **Insights:** AI coaching summaries, cross-feature correlations, weekly reviews

## 5.2 Navigation Pattern

- Bottom tab bar (mobile): Dashboard, Voice Log, Meditation, Insights, More
- Sidebar (desktop/tablet): Collapsible module menu with icons
- Breadcrumbs: Show current location within module hierarchy
- Back gestures: Swipe or button to return to dashboard

---

# 6. Technical Architecture

## 6.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite + TypeScript |
| **Animation** | Framer Motion (GPU-accelerated) |
| **Audio** | Howler.js |
| **State Management** | React Context + Zustand (complex state) |
| **Styling** | Vanilla CSS with CSS variables (design tokens) |
| **Backend** | FastAPI (Python) with async endpoints |
| **Database** | Supabase PostgreSQL (eu-central-1) |
| **Cross-Platform** | Capacitor (iOS/Android) + PWA + Electron/Tauri (desktop) |
| **AI Services** | Google Cloud (Speech-to-Text, Gemini, Imagen) |
| **File Storage** | Supabase Storage (meal photos, AI-generated images) |

## 6.2 Database Schema

### Core Tables

- **meditation_sessions:** Session tracking with duration, sound choice, completion status
- **habits:** User-defined habits with category, frequency, archive status
- **habit_logs:** Individual completion records with timestamps and voice transcriptions
- **pomodoro_sessions:** Focus session logs with task association and duration
- **tasks:** To-do items with title, due date, priority, category, completion
- **time_blocks:** Calendar events for time blocking with type and time range
- **workouts:** Exercise logs with type, duration, distance, intensity, notes
- **meals:** Meal records with photo URL, description, meal type, timestamp
- **body_metrics:** Weight tracking with date stamps
- **journal_entries:** Daily reflections with text content, AI prompt used, gratitude items
- **mood_checkins:** Mood ratings with emotion tags, context notes, timestamp
- **goals:** Goal definitions with title, description, category, target date, milestones
- **routines:** Custom routine templates with step sequences and timing
- **ai_insights:** Cached AI-generated summaries and coaching messages

---

# 7. Development Roadmap

## 7.1 Phase 1: Foundation (Weeks 1-3)

**Focus:** Core meditation experience and technical infrastructure

**Deliverables:**
- Meditation timer with setup, session, completion screens
- Breathing animation (Framer Motion, 60fps GPU-accelerated)
- Audio integration (Howler.js with royalty-free sounds)
- FastAPI backend with session CRUD endpoints
- Supabase PostgreSQL setup with meditation_sessions table
- PWA deployment for web testing
- Basic dashboard shell (placeholder for future modules)

## 7.2 Phase 2: Habit Tracking & Voice Input (Weeks 4-7)

**Focus:** Voice-powered habit logging and AI understanding

**Deliverables:**
- Voice recording interface with push-to-talk and live transcription
- Google Cloud Speech-to-Text integration
- Gemini AI habit extraction and parsing
- Habit management UI (create, edit, archive)
- Visual habit dashboard (grid view, streaks, heatmaps)
- Database schema: habits, habit_logs tables
- Auto-sync: meditation sessions mark habit complete
- Habit category support (meditation, exercise, reading, nutrition, sleep)

## 7.3 Phase 3: Productivity & Health (Weeks 8-11)

**Focus:** Expand to productivity tools and health tracking

**Deliverables:**
- Pomodoro focus timer with work/break intervals
- Task list management (voice/text input, priority, due dates)
- Time blocking calendar (day view, drag-and-drop)
- Workout logging (voice entry, exercise types, duration)
- Meal photo capture and gallery view
- Weight tracking with trend visualization
- Database: pomodoro_sessions, tasks, time_blocks, workouts, meals, body_metrics
- Supabase Storage integration for meal photos

## 7.4 Phase 4: Mindfulness & Emotion (Weeks 12-15)

**Focus:** Journal, gratitude, mood tracking

**Deliverables:**
- Journaling interface with rich text editor and voice-to-text
- AI-generated journal prompts (contextual based on activity)
- Gratitude practice with quick capture and gallery
- Mood check-in interface (1-10 scale, emotion tags)
- Mood timeline and pattern analysis
- Database: journal_entries, mood_checkins
- Entry history and search functionality

## 7.5 Phase 5: Goals, Routines & AI Integration (Weeks 16-20)

**Focus:** Long-term goal system, custom routines, comprehensive AI coaching

**Deliverables:**
- Goal creation with milestones and progress tracking
- Habit-goal linking and automatic progress updates
- Evening wind-down routine builder
- Weekly review ritual with guided reflection
- Custom routine template builder (drag-and-drop)
- Daily AI summary generation (morning dashboard card)
- Smart contextual nudges (time-based, streak protection)
- Cross-feature insight analysis (Gemini API)
- Weekly coaching session with comprehensive review
- Google Imagen integration for weekly progress images
- Database: goals, routines, ai_insights
- Background job scheduler for AI batch processing

## 7.6 Phase 6: Cross-Platform Launch (Weeks 21-24)

**Focus:** Deploy to all platforms simultaneously

**Deliverables:**
- Capacitor build pipeline for iOS and Android
- Electron/Tauri packaging for desktop (Windows, macOS, Linux)
- Platform-specific optimizations (push notifications, widgets)
- App store assets (screenshots, descriptions, videos)
- Device testing on iOS, Android, desktop platforms
- Performance optimization and bug fixes
- Beta testing with early users
- Simultaneous launch: PWA, iOS App Store, Google Play, desktop app stores

---

# 8. Success Metrics & Analytics

## 8.1 User Engagement Metrics

- **Daily Active Users (DAU):** Percentage of users who log in daily
- **Multi-Module Usage:** Percentage using 3+ modules per day within 60 days (target: 60%)
- **Session Duration:** Average time spent in app per session (target: 15+ minutes)
- **Voice Adoption Rate:** Percentage of habit entries via voice within 30 days (target: 80%)

## 8.2 Behavioral Change Metrics

- **Habit Streak Length:** Average current streak across all habits (target: 14+ days)
- **Meditation Consistency:** Percentage meditating 5+ days/week (target: 50%)
- **Task Completion Rate:** Percentage of created tasks marked complete (target: 75%)
- **Goal Milestone Achievement:** Percentage of set milestones completed on time (target: 60%)

## 8.3 AI Engagement Metrics

- **Daily Summary Views:** Percentage viewing morning AI summary (target: 70%)
- **Smart Nudge Click-Through:** Percentage acting on contextual nudges (target: 40%)
- **Weekly Review Completion:** Percentage completing full weekly review (target: 60%)
- **Insight Share Rate:** Percentage sharing AI-generated progress images (target: 20%)

## 8.4 Retention & Growth

- **Day 1 Retention:** Percentage returning day after signup (target: 70%)
- **Day 7 Retention:** Percentage active 7 days post-signup (target: 50%)
- **Month-over-Month Retention:** Percentage active after 90 days (target: 60%)
- **Feature Discovery Rate:** Average number of modules adopted per user (target: 5+)

---

# 9. Design System

## 9.1 Visual Language

The design philosophy balances calm minimalism with warm encouragement. Dark backgrounds promote focus and reduce eye strain during evening use, while warm amber accents create emotional warmth and approachability. Animations are intentionally slow and fluid to reinforce mindfulness rather than urgency.

## 9.2 Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | Main app background |
| `--bg-secondary` | `#12121a` | Cards, panels, module containers |
| `--text-primary` | `#e0d5c7` | Primary text, headings |
| `--text-secondary` | `#8a8078` | Labels, metadata, timestamps |
| `--accent` | `#c8956c` | Buttons, highlights, breathing circle glow |
| `--glow` | `rgba(255, 200, 100, 0.15)` | Soft ambient glow for animations |

## 9.3 Typography

- **Font Family:** Inter (primary), system fallbacks
- **Headings:** Bold weight, generous spacing
- **Body Text:** Regular weight, optimized line height (1.6)
- **Labels:** Medium weight, reduced opacity for hierarchy

---

# 10. Conclusion

Ultraviolet Perigee represents a paradigm shift in personal wellness technology—moving beyond fragmented single-purpose apps to deliver a truly integrated ecosystem. By unifying meditation, habit tracking, productivity, health monitoring, and mindfulness practices with intelligent AI insights, the platform eliminates friction, reduces cognitive overhead, and empowers users to build sustainable positive change across all dimensions of wellness.

The phased development approach ensures a solid foundation while progressively expanding capabilities. Cross-platform deployment from day one maximizes accessibility, while voice-first interaction and AI coaching create a uniquely effortless user experience. Success will be measured not just by engagement metrics, but by demonstrable behavioral change—longer streaks, deeper insights, and lasting wellness improvements.

---

**End of Document**