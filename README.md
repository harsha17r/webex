# Webex — Redesign Prototype

A high-fidelity, interactive UI prototype of the Webex desktop app. Built from scratch as a capstone project exploring how AI-assisted tools can accelerate the design-to-prototype pipeline.

---

## What this is

This is not a real Webex product. It's a **faithful interactive replica** — every screen, modal, animation, and interaction is built to match the Webex Figma design spec as closely as possible.

Think of it as a design prototype that behaves like a real app.

---

## The thinking behind it

This project started with a simple question: *can a design team build a production-quality interactive prototype without writing code by hand?*

The answer turned out to be yes — but the more interesting discovery was how the process changed the way we think about design work itself.

Traditionally, a designer hands off a Figma file and waits for an engineer to build it. Here, the design team *is* doing the building — with AI handling the code translation. The role shifts from drawing boxes in Figma to directing an AI with design intent.

The decisions — spacing, animation timing, interaction patterns, what feels right — are still design decisions. They just get expressed in a different medium.

That's the experiment this project is really running.

---

## How we built it

### Start with the source of truth

Everything traces back to the Figma file. Before writing a single line of code, the design tokens were extracted — every color, spacing value, and border radius pulled directly from Figma and turned into constants the app could use. This meant no guessing, no hardcoding random values. If the design changes in Figma, the values change in code.

### Talk to Figma directly

One of the biggest process shifts was using the **Figma MCP** (Model Context Protocol) — a live bridge between the AI and the Figma file. Instead of reading values off a screen and typing them in manually, the AI could fetch exact node data: dimensions, colors, padding, border radius, layer structure — all from the source. This is how pixel-level accuracy was possible without a single manual measurement.

### Write animations like a script

Every animated interaction in this project is documented at the top of the file it lives in, like a storyboard:

```
0ms    card height springs open
0ms    chevron rotates 0° → 180°
50ms   row 1 slides up, fades in
100ms  row 2 slides up, fades in
260ms  footer drifts in last
```

This came from a custom AI skill called **Interface Craft**. The idea is simple: animations should be readable by anyone, not just the person who wrote them. If you can read the storyboard at the top of the file, you understand the animation without touching the code.

### Keep a dev log

Every ~30 minutes of active work, a log entry was written to `devlog/LOG.md` — what changed, what files were touched, what's next. This wasn't for the code. It was for the humans. Anyone on the team could open that file at any point and know exactly where the project stood.

---

## Tools used

| Tool | What it did |
|---|---|
| **Cursor** | Code editor — where all files live and changes are reviewed |
| **Claude Code** | AI coding assistant — translated design intent into React components |
| **Figma MCP** | Live bridge to the Figma file — fetched exact design values node by node |
| **Interface Craft** | Custom AI skill for writing animations in a human-readable storyboard format |
| **Motion** | Animation library — spring physics, staggered sequences, entrance/exit transitions |
| **Vite + React** | Development framework — instant hot-reload, component-based structure |

---

## Project structure

```
src/
├── components/
│   ├── layout/         → Sidebar, TopBar, CiscoAIRail
│   ├── modals/         → AppearancesModal, ConnectCalendarModal,
│   │                     NotificationSettingsModal, SetupProfileModal
│   ├── Dropdown.jsx
│   └── OnboardingChecklist.jsx
├── screens/
│   ├── onboarding/     → WelcomeScreen, VerifyScreen, SetPasswordScreen
│   └── home/           → HomeScreen, MeetingsTab, MessagesTab, MessageStage
├── context/            → ProfileContext
└── tokens/             → colors, spacing, radius — sourced from Figma
```

---

## How to run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to start from the Welcome Screen.

---

## What's fictional

A few things look real but aren't wired to actual services — and that's intentional. The goal was always fidelity to the design, not backend integration.

- Calendar connection — choosing a provider marks it done locally, no real OAuth
- Notification settings — saves state in the browser, no backend
- Appearances — preview only, themes don't apply globally yet
- Cisco AI Rail — static suggestions, no live AI responses

---

*Webex Team · Capstone Project · 2026*
