import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { EMPLOYEE } from '../../config/employee'
/* ─────────────────────────────────────────────────────────
 * CalendarSyncScreen — Onboarding after profile review
 *
 * Same provider rows + icons as home `ConnectCalendarModal`.
 * User picks one calendar → in-card animation → enterprise home.
 *
 * Route: /calendar-sync
 *
 * "Connect a calendar for …" uses `EMPLOYEE.email` (work email), same as profile review.
 *
 * Two-column widths match `ProfileReviewScreen` (`LAYOUT`).
 * ───────────────────────────────────────────────────────── */

/** Same grid as `ProfileReviewScreen.jsx` — keeps left rail aligned across onboarding */
const LAYOUT = {
  leftWidthPx:      400,
  rightMinWidthPx:  360,
  rowMaxWidthPx:    1020,
  columnGapPx:      80,
}

/** Matches `src/components/modals/ConnectCalendarModal.jsx` */
const PROVIDERS = [
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    sub: 'Outlook, Teams calendar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="1"    y="1"    width="10.5" height="10.5" fill="#F25022"/>
        <rect x="12.5" y="1"    width="10.5" height="10.5" fill="#7FBA00"/>
        <rect x="1"    y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    id: 'google',
    name: 'Google Calendar',
    sub: 'Gmail, Google Workspace',
    icon: (
      <svg width="24" height="24" viewBox="0 0 256 256" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
        {/* logos:google-calendar — https://api.iconify.design/logos:google-calendar.svg */}
        <path fill="#fff" d="M195.368 60.632H60.632v134.736h134.736z"/>
        <path fill="#ea4335" d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"/>
        <path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z"/>
        <path fill="#1967d2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196q0 10.641 5.533 27.436q20.115 5.76 30.316 5.76T256 60.631"/>
        <path fill="#fbbc04" d="M256 60.632h-60.632v134.736H256z"/>
        <path fill="#34a853" d="M195.368 195.368H60.632V256h134.736z"/>
        <path fill="#4285f4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"/>
        <path fill="#4285f4" d="M88.27 165.154c-5.036-3.402-8.523-8.37-10.426-14.94l11.689-4.816q1.59 6.063 5.558 9.398c2.627 2.223 5.827 3.318 9.566 3.318q5.734 0 9.852-3.487c2.746-2.324 4.127-5.288 4.127-8.875q0-5.508-4.345-8.994c-2.897-2.324-6.535-3.486-10.88-3.486h-6.754v-11.57h6.063q5.608 0 9.448-3.033c2.56-2.02 3.84-4.783 3.84-8.303c0-3.132-1.145-5.625-3.435-7.494c-2.29-1.87-5.188-2.813-8.708-2.813c-3.436 0-6.164.91-8.185 2.745a16.1 16.1 0 0 0-4.413 6.754l-11.57-4.817c1.532-4.345 4.345-8.185 8.471-11.503s9.398-4.985 15.798-4.985c4.733 0 8.994.91 12.767 2.745c3.772 1.836 6.736 4.379 8.875 7.613c2.14 3.25 3.2 6.888 3.2 10.93c0 4.126-.993 7.613-2.98 10.476s-4.43 5.052-7.327 6.585v.69a22.25 22.25 0 0 1 9.398 7.327c2.442 3.284 3.672 7.208 3.672 11.79c0 4.58-1.163 8.673-3.487 12.26c-2.324 3.588-5.54 6.417-9.617 8.472c-4.092 2.055-8.69 3.1-13.793 3.1c-5.912.016-11.369-1.685-16.405-5.087m71.797-58.005l-12.833 9.28l-6.417-9.734l23.023-16.607h8.825v78.333h-12.598z"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    sub: 'iCloud, iPhone, Mac',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* ic:baseline-apple — https://api.iconify.design/ic:baseline-apple.svg */}
        <path fill="#FFFFFF" d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion Calendar',
    sub: 'Notion workspace, team & personal',
    icon: (
      <span
        style={{
          width: 24, height: 24, borderRadius: 6, background: '#F5F5F5',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <img
          src="https://api.iconify.design/devicon:notion.svg"
          width={18}
          height={18}
          alt=""
          style={{ display: 'block' }}
        />
      </span>
    ),
  },
]

const C = {
  bg:           '#111111',
  surface:      '#1E1E1E',
  border:       '#737373',
  borderModal:  '#737373',
  borderHover:  '#AAAAAA',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textMuted:    '#999999',
  accent:       '#4ac397',
}

const CONTENT = {
  enterY: 24,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
  delay:  0.12,
}

/* ─────────────────────────────────────────────────────────
 * IN-CARD CONNECTION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after tap.
 *
 *    0ms   tap → row locks active (green border), chevron cross-fades to spinner
 * 3000ms   spinner cross-fades to green checkmark (path draws on)
 * 3400ms   subtitle morphs to "Calendar connected"
 * 4400ms   navigate → enterprise dashboard
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  showSpinner:   0,       // immediate — chevron out, spinner in
  showCheck:     3000,    // spinner → checkmark (3s loading)
  showConnected: 3400,    // subtitle text swap
  navigate:      4400,    // go to dashboard
}

const ICON_SWAP = {
  spring: { type: 'spring', stiffness: 500, damping: 30 },
}

const SPINNER = {
  size:        20,        // px diameter
  strokeWidth: 2.2,
  color:       '#4ac397',
  rotate:      { duration: 0.7, ease: 'linear', repeat: Infinity },
}

const CHECK = {
  size:        22,
  strokeWidth: 2.4,
  color:       '#4ac397',
  pathDraw:    { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  spring:      { type: 'spring', stiffness: 460, damping: 24 },
}

const CONNECTED_TEXT = {
  spring: { type: 'spring', stiffness: 300, damping: 28 },
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function RowIcon({ stage }) {
  return (
    <div style={{
      width: 24, height: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <AnimatePresence mode="wait">
        {stage < 1 && (
          <motion.svg
            key="chevron"
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            initial={false}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={ICON_SWAP.spring}
            style={{ position: 'absolute' }}
          >
            <path d="M9 6l6 6-6 6" stroke="#D4D4D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}

        {stage >= 1 && stage < 2 && (
          <motion.svg
            key="spinner"
            width={SPINNER.size} height={SPINNER.size}
            viewBox="0 0 20 20" fill="none"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{
              opacity: { duration: 0.15 },
              scale: ICON_SWAP.spring,
              rotate: SPINNER.rotate,
            }}
            style={{ position: 'absolute' }}
          >
            <circle
              cx="10" cy="10" r="8"
              stroke="rgba(74, 195, 151, 0.25)"
              strokeWidth={SPINNER.strokeWidth}
              fill="none"
            />
            <path
              d="M10 2a8 8 0 0 1 8 8"
              stroke={SPINNER.color}
              strokeWidth={SPINNER.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        )}

        {stage >= 2 && (
          <motion.svg
            key="check"
            width={CHECK.size} height={CHECK.size}
            viewBox="0 0 24 24" fill="none"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={CHECK.spring}
            style={{ position: 'absolute' }}
          >
            <motion.path
              d="M6.5 12.5L10.5 16.5L18 7.5"
              stroke={CHECK.color}
              strokeWidth={CHECK.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={CHECK.pathDraw}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CalendarSyncScreen() {
  const navigate = useNavigate()
  const workEmail = EMPLOYEE.email
  const [hoveredProvider, setHoveredProvider] = useState(null)
  const [activeProvider, setActiveProvider] = useState(null)
  const [stage, setStage] = useState(0)
  const timersRef = useRef([])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  function handleChooseProvider(id) {
    if (activeProvider) return
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    setActiveProvider(id)
    setStage(1)

    timersRef.current.push(setTimeout(() => setStage(2), TIMING.showCheck))
    timersRef.current.push(setTimeout(() => setStage(3), TIMING.showConnected))
    timersRef.current.push(setTimeout(() => {
      navigate('/enterprise-home', { state: { calendarConnected: true, fromOnboarding: true } })
    }, TIMING.navigate))
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 56px 0',
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px',
            background: 'transparent',
            border: `2px solid ${C.borderSubtle}`,
            borderRadius: 9999,
            fontSize: 14, fontWeight: 600, color: C.borderSubtle,
            fontFamily: 'inherit', cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.textPrimary; e.currentTarget.style.color = C.textPrimary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSubtle; e.currentTarget.style.color = C.borderSubtle }}
        >
          <ArrowLeftIcon /> Back
        </button>

        <button
          type="button"
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: C.surface, border: `1.5px solid ${C.borderSubtle}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2e2e2e'; e.currentTarget.style.borderColor = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.borderSubtle }}
          aria-label="More options"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
            <circle cx="2" cy="2" r="1.5" fill="#AAAAAA"/>
            <circle cx="8" cy="2" r="1.5" fill="#AAAAAA"/>
            <circle cx="14" cy="2" r="1.5" fill="#AAAAAA"/>
          </svg>
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '3vh 56px 4vh',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: LAYOUT.columnGapPx,
          width: '100%',
          maxWidth: LAYOUT.rowMaxWidthPx,
        }}>

          <div style={{
            width: LAYOUT.leftWidthPx, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 20,
          }}>
            <div>
              <h1 style={{
                fontSize: 26, fontWeight: 700, lineHeight: '32px',
                color: C.textPrimary, margin: '0 0 10px',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}>
                Sync your calendar
              </h1>
              <p style={{ fontSize: 13, color: C.textSecond, margin: 0, lineHeight: 1.55 }}>
                Webex only reads your calendar to show meeting times. It will never create or delete events without your action.
              </p>
            </div>

            {/* Same panel treatment as home `ConnectCalendarModal` info banner */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: '#081E3D',
              border: '1px solid #0E3260',
              borderRadius: 10,
              padding: 14,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="10" cy="10" r="8.5" stroke="#92CBF2" strokeWidth="1.4"/>
                <path d="M10 9v5" stroke="#92CBF2" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="10" cy="6.5" r="0.8" fill="#92CBF2"/>
              </svg>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#92CBF2', margin: 0, lineHeight: 1.5 }}>
                You&apos;ll be briefly taken to your calendar provider to sign in, then brought right back.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: CONTENT.enterY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...CONTENT.spring, delay: CONTENT.delay }}
            style={{
              flex: 1,
              minWidth: LAYOUT.rightMinWidthPx,
              minHeight: 0,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 16,
            }}
          >
            <div>
              {workEmail && (
                <p style={{
                  fontSize: 14, fontWeight: 400, color: '#AAAAAA',
                  margin: '4px 0 0', lineHeight: '20px',
                }}>
                  for {workEmail}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PROVIDERS.map(p => {
                const isActive = activeProvider === p.id
                const isHovered = hoveredProvider === p.id && !activeProvider
                const isConnected = isActive && stage >= 3
                const borderColor = isActive ? C.accent : (isHovered ? C.borderHover : C.borderModal)
                const background = isActive
                  ? 'rgba(74, 195, 151, 0.08)'
                  : (isHovered ? 'rgba(255,255,255,0.04)' : 'transparent')

                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={activeProvider ? -1 : 0}
                    onClick={() => !activeProvider && handleChooseProvider(p.id)}
                    onKeyDown={e => {
                      if (!activeProvider && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        handleChooseProvider(p.id)
                      }
                    }}
                    onMouseEnter={() => setHoveredProvider(p.id)}
                    onMouseLeave={() => setHoveredProvider(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '12px 20px',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      cursor: activeProvider && !isActive ? 'default' : 'pointer',
                      background,
                      opacity: activeProvider && !isActive ? 0.45 : 1,
                      transition: 'background 0.15s, border-color 0.15s, opacity 0.2s',
                      outline: 'none',
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>{p.icon}</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                      <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF', lineHeight: '24px' }}>
                        {p.name}
                      </span>
                      <div style={{ position: 'relative', height: 20 }}>
                        <AnimatePresence mode="wait">
                          {isConnected ? (
                            <motion.span
                              key="connected"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={CONNECTED_TEXT.spring}
                              style={{
                                position: 'absolute', left: 0, top: 0,
                                fontSize: 14, fontWeight: 500, color: C.accent,
                                lineHeight: '20px', whiteSpace: 'nowrap',
                              }}
                            >
                              Calendar connected
                            </motion.span>
                          ) : (
                            <motion.span
                              key="sub"
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                position: 'absolute', left: 0, top: 0,
                                fontSize: 14, fontWeight: 400, color: '#AAAAAA',
                                lineHeight: '20px', whiteSpace: 'nowrap',
                              }}
                            >
                              {p.sub}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <RowIcon stage={isActive ? stage : 0} />
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => navigate('/enterprise-home', { state: { fromOnboarding: true } })}
              style={{
                alignSelf: 'center',
                marginTop: 4,
                padding: '12px 32px',
                minHeight: 46,
                fontSize: 14,
                fontWeight: 600,
                color: C.textSecond,
                fontFamily: 'inherit',
                background: 'transparent',
                border: `1px solid ${C.borderModal}`,
                borderRadius: 9999,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = C.borderHover
                e.currentTarget.style.color = C.textPrimary
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = C.borderModal
                e.currentTarget.style.color = C.textSecond
              }}
            >
              Skip for now
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
