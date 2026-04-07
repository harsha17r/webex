# Accessibility Audit — Color Contrast

> Scope: WCAG 2.2 AA · Text contrast (4.5:1 normal / 3:1 large ≥18px or ≥14px bold) · Non-text contrast (3:1 for interactive element borders)
> Date: 2026-04-07 · **All issues resolved.**

---

## Contrast Ratio Reference

Key luminance values used in calculations:

| Hex | Relative Luminance |
|-----|--------------------|
| #111111 | 0.0056 |
| #181818 | 0.0092 |
| #1A1A1A | 0.0104 |
| #1C1C1C | 0.0116 |
| #1E1E1E | 0.0131 |
| #222222 | 0.0164 |
| #2A2A2A | 0.0232 |
| #383838 | 0.0397 |
| #494949 | 0.0669 |
| #555555 | 0.0907 |
| #595959 | 0.1000 |
| #666666 | 0.1330 |
| #737373 | 0.1714 |
| #777777 | 0.1843 |
| #888888 | 0.2461 |
| #999999 | 0.3185 |
| #AAAAAA | 0.4025 |

---

## Text Contrast Issues

| # | Status | File | Line | Element | Was | Background | Old Ratio | Required | Fix Applied | New Ratio |
|---|--------|------|------|---------|-----|-----------|-----------|----------|-------------|-----------|
| T1 | ✅ Fixed | `src/components/layout/CiscoAIRail.jsx` | 235 | Disclaimer paragraph (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T2 | ✅ Fixed | `src/screens/home/MessageStage.jsx` | 91 | Cancel button + SVG stroke (16px) | `#777777` | `#1A1A1A` | 3.88:1 | 4.5:1 | `#999999` | 6.09:1 |
| T3 | ✅ Fixed | `src/screens/home/MessageStage.jsx` | 176 | "Shift+Enter" hint (12px) | `#737373` | `#1E1E1E` | 3.51:1 | 4.5:1 | `#999999` | 5.84:1 |
| T4 | ✅ Fixed | `src/screens/home/MessageStage.jsx` | 231 | Subtitle text (13px) | `#777777` | `#1A1A1A` | 3.88:1 | 4.5:1 | `#999999` | 6.09:1 |
| T5 | ✅ Fixed | `src/screens/home/MessageStage.jsx` | 263 | Description text (14px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T6 | ✅ Fixed | `src/screens/onboarding/sso/ProfileReviewScreen.jsx` | C.textMuted | Section heading, lock label, optional span, remove button | `#666666` | `#111111` | 3.29:1 | 4.5:1 | `#999999` | 6.62:1 |
| T7 | ✅ Fixed | `src/components/OnboardingChecklist.jsx` | 148 | Done task label (14px strikethrough) | `#737373` | `#111111` | 3.98:1 | 4.5:1 | `#999999` | 6.62:1 |
| T8 | ✅ Fixed | `src/components/OnboardingChecklist.jsx` | 264 | Progress counter "x/5" (14px) | `#737373` | `#111111` | 3.98:1 | 4.5:1 | `#999999` | 6.62:1 |
| T9 | ✅ Fixed | `src/components/meeting/ChatRail.jsx` | 122 | Empty state description (13px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T10 | ✅ Fixed | `src/components/meeting/ChatRail.jsx` | 174 | "Shift+Enter" hint (11px) | `#555555` | `#1A1A1A` | 2.33:1 | 4.5:1 | `#999999` | 6.09:1 |
| T11 | ✅ Fixed | `src/components/meeting/AppsRail.jsx` | 66, 256, 268 | App subtitle, section labels (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T12 | ✅ Fixed | `src/components/meeting/AppsRail.jsx` | 277 | Empty state text (13px) | `#555555` | `#1A1A1A` | 2.33:1 | 4.5:1 | `#999999` | 6.09:1 |
| T13 | ✅ Fixed | `src/components/meeting/ParticipantsRail.jsx` | 85 | Role label (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T14 | ✅ Fixed | `src/components/meeting/MeetingAIRail.jsx` | 281 | Disclaimer text (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T15 | ✅ Fixed | `src/enterprise-components/layout/CiscoAIRail.jsx` | 235 | Disclaimer paragraph (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T16 | ✅ Fixed | `src/enterprise-components/meeting/ChatRail.jsx` | 122, 174 | Empty state + hint text | `#666666`/`#555555` | `#1A1A1A` | 2.33–3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T17 | ✅ Fixed | `src/enterprise-components/meeting/AppsRail.jsx` | 66, 256, 268, 277 | Subtitle, labels, empty text | `#666666`/`#555555` | `#1A1A1A` | 2.33–3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T18 | ✅ Fixed | `src/enterprise-components/meeting/ParticipantsRail.jsx` | 85 | Role label (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T19 | ✅ Fixed | `src/enterprise-components/meeting/MeetingAIRail.jsx` | 281 | Disclaimer text (12px) | `#666666` | `#1A1A1A` | 3.03:1 | 4.5:1 | `#999999` | 6.09:1 |
| T20 | ✅ Fixed | `src/enterprise-components/OnboardingChecklist.jsx` | 126, 234 | Done task label + progress counter | `#737373` | `#111111` | 3.98:1 | 4.5:1 | `#999999` | 6.62:1 |
| T21 | ✅ Fixed | `src/screens/enterprise-meeting/MeetingScreen.jsx` | 1352, 1379, 1499, 1772, 1856 | Audio section headers, device subtitles, helper labels (12–13px) | `#666666` | `#111111` | 3.29:1 | 4.5:1 | `#999999` | 6.62:1 |
| T22 | ✅ Fixed | `src/screens/onboarding/CalendarSyncScreen.jsx` | C.textMuted | Muted text uses (various) | `#666666` | `#111111` | 3.29:1 | 4.5:1 | `#999999` | 6.62:1 |

---

## Border / Non-Text Contrast Issues (Interactive Elements)

WCAG 1.4.11 requires 3:1 contrast for visual information identifying UI components (inputs, buttons, checkboxes, interactive cards).

| # | Status | File | Line | Element | Was | Background | Old Ratio | Required | Fix Applied | New Ratio |
|---|--------|------|------|---------|-----|-----------|-----------|----------|-------------|-----------|
| B1 | ✅ Fixed | `src/screens/onboarding/sso/ProfileReviewScreen.jsx` | C.border | Text input borders (unfocused) | `#383838` | `#1E1E1E` | 1.42:1 | 3:1 | `#737373` | 3.51:1 |
| B2 | ✅ Fixed | `src/screens/onboarding/CalendarSyncScreen.jsx` | C.border | Provider row borders (unfocused) | `#383838` | `#1E1E1E` | 1.42:1 | 3:1 | `#737373` | 3.51:1 |
| B3 | ✅ Fixed | `src/components/layout/CiscoAIRail.jsx` | 61 | Suggestion card borders | `#383838` | `#1E1E1E` | 1.42:1 | 3:1 | `#737373` | 3.51:1 |
| B4 | ✅ Fixed | `src/components/OnboardingChecklist.jsx` | 210 | Checklist card outer border | `#595959` | `#111111` | 2.70:1 | 3:1 | `#737373` | 3.98:1 |
| B5 | ✅ Fixed | `src/screens/home/MessageStage.jsx` | 55 | ActionButton border (default state) | `#333333` | `#111111` | 1.49:1 | 3:1 | `#737373` | 3.98:1 |
| B6 | ✅ Fixed | `src/screens/home/MessageStage.jsx` | 131 | Compose box border | `#2E2E2E` | `#1A1A1A` | 1.28:1 | 3:1 | `#737373` | 3.68:1 |
| B7 | ✅ Fixed | `src/components/modals/NotificationSettingsModal.jsx` | 272 | Checkbox border (unchecked) | `#595959` | `#111111` | 2.70:1 | 3:1 | `#737373` | 3.98:1 |
| B8 | ✅ Fixed | `src/components/modals/NotificationSettingsModal.jsx` | 304 | Radio circle (unselected) | `#595959` | `#111111` | 2.70:1 | 3:1 | `#737373` | 3.98:1 |
| B9 | ✅ Fixed | `src/components/modals/AppearancesModal.jsx` | 173 | Theme preview card border (default/hover) | `#2A2A2A`/`#555555` | `#181818` | 1.24:1 / 2.15:1 | 3:1 | `#666666`/`#AAAAAA` | 3.09:1 / 5.68:1 |
| B10 | ✅ Fixed | `src/screens/meeting/PreJoinModal.jsx` | 361, 417 | Audio/video dropdown borders (closed) | `#494949` | `#222222` | 1.76:1 | 3:1 | `#737373` | 3.34:1 |
| B11 | ✅ Fixed | `src/screens/enterprise-meeting/PreJoinModal.jsx` | 361, 417 | Audio/video dropdown borders (closed) | `#494949` | `#222222` | 1.76:1 | 3:1 | `#737373` | 3.34:1 |
| B12 | ✅ Fixed | `src/components/CcNudge.jsx` | 28 | Nudge tooltip border | `#333333` | `#1C1C1C` | 1.35:1 | 3:1 | `#737373` | 3.60:1 |
| B13 | ✅ Fixed | `src/components/ReactNudge.jsx` | 28 | Nudge tooltip border | `#333333` | `#1C1C1C` | 1.35:1 | 3:1 | `#737373` | 3.60:1 |
| B14 | ✅ Fixed | `src/enterprise-components/layout/CiscoAIRail.jsx` | 61 | Suggestion card borders | `#383838` | `#1E1E1E` | 1.42:1 | 3:1 | `#737373` | 3.51:1 |
| B15 | ✅ Fixed | `src/enterprise-components/OnboardingChecklist.jsx` | 210 | Checklist card outer border | `#595959` | `#111111` | 2.70:1 | 3:1 | `#737373` | 3.98:1 |
| B16 | ✅ Fixed | `src/enterprise-components/modals/NotificationSettingsModal.jsx` | 272, 304 | Checkbox / radio borders (unchecked) | `#595959` | `#111111` | 2.70:1 | 3:1 | `#737373` | 3.98:1 |
| B17 | ✅ Fixed | `src/enterprise-components/modals/AppearancesModal.jsx` | 173 | Theme preview card border (default/hover) | `#2A2A2A`/`#555555` | `#181818` | 1.24:1 / 2.15:1 | 3:1 | `#666666`/`#AAAAAA` | 3.09:1 / 5.68:1 |

---

## Passing (no change needed)

| Element | Colors | Ratio |
|---------|--------|-------|
| Primary text `#FFFFFF` on `#111111` | — | 19.0:1 ✅ |
| Secondary text `#AAAAAA` on `#111111` | — | 8.1:1 ✅ |
| Secondary text `#CCCCCC` on `#111111` | — | 12.5:1 ✅ |
| `#888888` on `#111111` | muted text | 5.3:1 ✅ |
| `#888888` on `#1A1A1A` | muted text | 4.9:1 ✅ |
| `#888888` on `#1E1E1E` | muted text | 4.7:1 ✅ |
| `#888888` on `#181818` | modal description | 5.0:1 ✅ |
| `#999999` on `#1E1E1E` | compose placeholder | 5.8:1 ✅ |
| `#2E96E8` on `#111111` | "Don't show again" link | 5.9:1 ✅ |
| `#5cb3f0` on `#111111` | info-banner / links | 8.2:1 ✅ |
| `#4ac397` green / `#2BAB7E` green | accent / success | ≥7.5:1 ✅ |
| Focused input border `#4ac397` on `#1E1E1E` | — | ≥7:1 ✅ |

---

## Intentional Exclusions

- **Disabled UI states** (e.g. `disabled ? '#555555' : '#CCCCCC'` in NotificationSettingsModal): WCAG 1.4.3 explicitly exempts inactive/disabled components.
- **Decorative dividers** (e.g. `#2A2A2A` hairlines between sections): Not user-interface components per WCAG 1.4.11.
- **SVG icon strokes** (`#888888`, `#AAAAAA`): Meet 3:1 against their backgrounds on `#1A1A1A`/`#111111`.
- **`#595959` progress bar track** in OnboardingChecklist: Decorative background element, not a control boundary.
