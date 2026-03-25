# Webex — Redesign Prototype

A high-fidelity, interactive UI prototype of the Webex desktop app. Built from scratch as a capstone project exploring how AI-assisted tools can accelerate the design-to-prototype pipeline.

---

## What this is

This is not a real Webex product. It's a **faithful interactive replica** — every screen, modal, animation, and interaction is built to match the Webex Figma design spec as closely as possible. The goal was to turn a static Figma file into something you can actually click through, interact with, and feel.

Think of it as a design prototype that behaves like a real app.

---

## The story

This project started with a simple question: *can a designer build a production-quality interactive prototype without writing code by hand?*

The answer turned out to be yes — but not in the way you'd expect.

### Where it began

Everything started from a Figma file. The Webex design system was already there — colors, spacing, components, the whole thing. The challenge was translating it into something interactive that a browser could actually render.

The first step was scaffolding the project. A Vite + React app, Tailwind CSS for styling utilities, React Router for navigation. That's the foundation almost every modern web app is built on.

Then came the design tokens — pulling every color, spacing value, and border radius directly out of Figma and turning them into TypeScript constants. This wasn't just a setup task. It meant every single value in the app traces back to the source design file. No guessing, no hardcoding random colors.

### Building the onboarding flow

The first real screens were the onboarding flow — the screens a user sees before they even get into the app.

**Welcome Screen** — Email input, SSO buttons (Google, Microsoft, Apple), a gradient glow background, and a feature benefits card on the left. This took multiple passes against the Figma spec. Every pixel — the column gap (240px, not 120), the gradient border stroke width (3px, not 1.5), the exact pill shape of the SSO buttons — was checked against the Figma node data directly.

**Verify Screen** — A 6-digit OTP input with full keyboard navigation (arrows, backspace, paste support). Three stages: form → "Verifying..." with animated dots → green checkmark success. The timing of every stage lives in a named `TIMING` object at the top of the file. No magic numbers buried in the code.

**Set Password Screen** — Live password validation with 6 rules rendered in a 2-column grid. Each rule starts grey, turns red when you type something invalid, turns green when met. The submit button only activates when every rule passes.

### The home screen

The main dashboard is where most of the complexity lives. It's a multi-panel layout: a sidebar on the left, a top bar, a main content area, and a Cisco AI Rail panel that slides in and out with a spring animation.

**Sidebar** — Icon-based nav with active/inactive states, filled icon variants, and a "More" dropdown that floats in on click.

**Top Bar** — Avatar, status, search bar, back/forward navigation, Connect button, and the Cisco AI toggle.

**Meetings Tab** — Welcome banner with a test meeting CTA, three action tiles (Schedule / Join / Launch), and a calendar connection button that transforms into a settings icon once a calendar is connected.

**Messages Tab** — Left panel with filter pills (All / DM's / Spaces / Public) and three dropdowns (Filter, Compose, More Options). Right panel is an empty-state feature carousel with 5 slides, a ResizeObserver keeping the card dimensions accurate on resize, and two action buttons at the bottom.

**Cisco AI Rail** — An animated panel with a welcome state, four suggestion cards, and a chat input. Slides in and out with a spring (stiffness 320, damping 30).

### Modals and interactions

Beyond the main screens, there's a full set of modal interactions built as part of an onboarding checklist widget:

- **Setup Profile Modal** — Avatar, name, job title, timezone. Opens an appearances modal from within it.
- **Appearances Modal** — Mode selector (System / Light / Dark) and 6 theme cards (Classic, Indigo, Bronze, Jade, Lavender, Rose). Each card shows a live mini-preview of that theme rendered at that mode. Purely visual — no actual theme changes, but the values are ready to wire up.
- **Connect Calendar Modal** — Microsoft 365 and Google Calendar provider options. Choosing one marks the checklist task as done and changes the Meetings Tab button.
- **Notification Settings Modal** — Full notification preferences for Messaging, Meetings, Calling, and Quiet Hours. Custom day schedule with animated expand, time pickers, and ringtone dropdowns.

### The onboarding checklist widget

A floating "Personalize your account" widget sits in the bottom-right corner of the app. It has 5 tasks, a progress bar, and spring-driven animations for opening, closing, and completing tasks. The checklist state persists across tab switches — switching from Meetings to Messages and back doesn't reset your progress.

---

## Tools used

### Cursor
The code editor. Cursor is where all the files live and where changes are reviewed. It provides the workspace context that makes everything else work.

### Claude Code
The AI coding assistant running inside Cursor. This is what actually wrote the code — every component, every animation, every layout. Claude Code reads the Figma spec, understands the design intent, and translates it into React. It also maintains a dev log (`devlog/LOG.md`) every 30 minutes of active work, so there's a full audit trail of every decision made.

### Figma MCP (Model Context Protocol)
A direct bridge between Claude Code and the Figma file. Instead of manually reading values from Figma and typing them in, the MCP lets Claude fetch exact node data — dimensions, colors, padding, border radius — straight from the design file. This is how pixel-level accuracy was achieved without manually cross-referencing every value.

### Interface Craft (Skill)
A custom Claude skill for writing animations in a human-readable storyboard format. Every animation in this project — the checklist opening, the modal entrance, the OTP success sequence — is documented at the top of the file like a script:

```
0ms    card height springs open
0ms    chevron rotates 0° → 180°
50ms   row 1 slides up, fades in
100ms  row 2 slides up, fades in
...
260ms  footer drifts in last
```

This makes animations easy to read, easy to tune, and easy to hand off.

### Motion (Framer Motion)
The animation library. All transitions — spring physics, AnimatePresence entrance/exit, staggered sequences — run through Motion.

### Vite + React
The development framework. Vite gives instant hot-reload so every change shows up in the browser immediately. React handles the component structure.

---

## Project structure

```
src/
├── components/
│   ├── layout/         → Sidebar, TopBar, CiscoAIRail
│   ├── modals/         → AppearancesModal, ConnectCalendarModal,
│   │                     NotificationSettingsModal, SetupProfileModal
│   ├── Dropdown.jsx    → shared animated dropdown wrapper
│   └── OnboardingChecklist.jsx
├── screens/
│   ├── onboarding/     → WelcomeScreen, VerifyScreen, SetPasswordScreen
│   └── home/           → HomeScreen, MeetingsTab, MessagesTab, MessageStage
├── context/            → ProfileContext (user data across the app)
└── tokens/             → colors, spacing, radius — sourced from Figma
```

---

## How to run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and you'll land on the Welcome Screen.

---

## What's fictional

A few things look real but aren't wired to actual services:

- Calendar connection — choosing a provider marks it done locally, no real OAuth
- Notification settings — saves state locally, no backend
- Appearances — preview only, themes don't apply globally yet
- Cisco AI Rail — static suggestions, no live AI responses

The point was always fidelity to the design, not backend integration.

---

## The bigger picture

This project is a proof of concept for a new kind of design workflow. Traditionally, a designer hands off a Figma file and waits for an engineer to build it. Here, the designer *is* doing the building — just with AI handling the code translation.

The role shifted from "drawing boxes in Figma" to "directing an AI with design intent." The decisions — spacing, animation timing, interaction patterns — are still design decisions. They just get expressed in a different medium.

That's the experiment this project is really running.

---

*Built by Harsha · Capstone Project · 2026*
