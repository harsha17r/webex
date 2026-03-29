import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

/* ─────────────────────────────────────────────────────────
 * CalendarSyncScreen — Onboarding step after profile review
 *
 * LEFT PANEL (320px, top-aligned)
 *   "Sync your calendar" heading + subtitle + info banner
 *   Mini month calendar — same visual as MeetingsTab CalendarView
 *     border #2E2E2E, header #1E1E1E, today in blue #2E96E8
 *
 * RIGHT PANEL (flex: 1, top-aligned, slides up on mount)
 *   Provider cards: Google Calendar, Microsoft Outlook, Apple Calendar
 *   Click → 900ms "connecting" spinner → "Connected" green state
 *   "Connect & continue" enabled once ≥ 1 provider connected
 *   "Skip for now" ghost link always available
 *
 * Route: /calendar-sync  (comes after /profile-review)
 * ───────────────────────────────────────────────────────── */

/* ── Calendar helpers (mirrors MeetingsTab) ───────────── */

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getWeekStart(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - date.getDay())
  return date
}

function addDays(d, n) {
  const date = new Date(d)
  date.setDate(date.getDate() + n)
  return date
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

/* ── Provider data ────────────────────────────────────── */

const PROVIDERS = [
  {
    id:    'google',
    name:  'Google Calendar',
    desc:  'Sync meetings from your Google Workspace account',
    icon:  <GoogleIcon />,
  },
  {
    id:    'outlook',
    name:  'Microsoft Outlook',
    desc:  'Connect to Exchange, Office 365, or Outlook.com',
    icon:  <OutlookIcon />,
  },
  {
    id:    'apple',
    name:  'Apple Calendar',
    desc:  'Sync iCloud or locally stored calendars',
    icon:  <AppleIcon />,
  },
]

/* ── Colors ───────────────────────────────────────────── */

const C = {
  bg:           '#111111',
  surface:      '#1E1E1E',
  surfaceCard:  '#181818',
  border:       '#383838',
  borderSubtle: '#AAAAAA',
  textPrimary:  '#FFFFFF',
  textSecond:   '#AAAAAA',
  textMuted:    '#666666',
  accent:       '#4ac397',
  accentDim:    '#1c8160',
  accentHover:  '#4ac397',
  infoBg:       'rgba(92, 179, 240, 0.07)',
  infoBorder:   'rgba(92, 179, 240, 0.22)',
  infoText:     '#5cb3f0',
  calBorder:    '#2E2E2E',
  calHeader:    '#1E1E1E',
  calToday:     '#2E96E8',
  connectedBg:  'rgba(74,195,151,0.06)',
  connectedBorder: 'rgba(74,195,151,0.30)',
}

const CONTENT = {
  enterY: 24,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
  delay:  0.12,
}

/* ── Provider icons ───────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#FFFFFF"/>
      <path d="M28.64 16.204c0-.639-.057-1.252-.164-1.84H16v3.48h7.076a6.045 6.045 0 0 1-2.623 3.966v3.299h4.247c2.484-2.288 3.942-5.655 3.942-8.905z" fill="#4285F4"/>
      <path d="M16 29c3.546 0 6.521-1.175 8.695-3.178l-4.247-3.299c-1.176.788-2.68 1.253-4.448 1.253-3.42 0-6.316-2.31-7.35-5.415H4.264v3.408A13.996 13.996 0 0 0 16 29z" fill="#34A853"/>
      <path d="M8.65 18.361A8.394 8.394 0 0 1 8.21 16c0-.819.14-1.614.44-2.361V10.23H4.264A13.996 13.996 0 0 0 2 16c0 2.258.54 4.394 1.496 6.277l4.153-3.916z" fill="#FBBC05"/>
      <path d="M16 8.224c1.927 0 3.655.662 5.015 1.962l3.76-3.76C22.516 4.26 19.541 3 16 3A13.996 13.996 0 0 0 2.737 9.723l4.153 3.916C7.924 10.533 10.82 8.224 16 8.224z" fill="#EA4335"/>
    </svg>
  )
}

function OutlookIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0078D4"/>
      <path d="M18 8h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8V8z" fill="#50D9FF" fillOpacity="0.35"/>
      <rect x="18" y="8" width="9" height="2.5" rx="0" fill="#50D9FF" fillOpacity="0.55"/>
      <rect x="18" y="12.5" width="9" height="2" fill="white" fillOpacity="0.3"/>
      <rect x="18" y="16" width="9" height="2" fill="white" fillOpacity="0.3"/>
      <rect x="18" y="19.5" width="6" height="2" fill="white" fillOpacity="0.3"/>
      <rect x="5" y="10" width="14" height="12" rx="2" fill="white"/>
      <text x="12" y="19.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0078D4" fontFamily="Arial, sans-serif">OL</text>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#1C1C1E"/>
      <path d="M20.5 8C19.1 9.4 17.5 9.3 16 9.3c-.1-1.5.5-3 1.9-4C19.3 3.9 21 4 21.1 4c.1 1.4-.4 2.8-1.6 4z" fill="white"/>
      <path d="M16.2 10.5c1.7 0 3.2.9 4.3.9 1.1 0 2.8-.9 4.3-.7.7.1 2.6.3 3.8 1.9-3.3 2-2.8 7.2.7 9.1-.9 2.5-2.1 5-3.7 5-1.5 0-2-.9-3.7-.9-1.8 0-2.3.9-3.7.9-1.5 0-2.7-2.4-3.7-4.9-1.2-3-1.8-8.2 1.2-10.5.9-.7 1.8-1 2.5-.8z" fill="white"/>
    </svg>
  )
}

/* ── Sub-components ───────────────────────────────────── */

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={C.accentDim} fillOpacity="0.3"/>
      <circle cx="8" cy="8" r="8" stroke={C.accent} strokeWidth="1.2"/>
      <path d="M4.5 8L7 10.5L11.5 5.5" stroke={C.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <motion.svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
    >
      <circle cx="8" cy="8" r="6" stroke={C.borderSubtle} strokeWidth="1.5" strokeDasharray="20 8" strokeLinecap="round"/>
    </motion.svg>
  )
}

/* ── Mini Calendar (month view) ───────────────────────── */

function MiniCalendar() {
  const today        = new Date()
  const viewDate     = today
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const gridStart    = getWeekStart(firstOfMonth)
  const cells        = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  return (
    <div>
      {/* Month label */}
      <p style={{ fontSize: 12, fontWeight: 600, color: C.textSecond, margin: '0 0 10px', letterSpacing: '0.01em' }}>
        {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
      </p>

      <div style={{ border: `1px solid ${C.calBorder}`, borderRadius: 8, overflow: 'hidden' }}>

        {/* Day header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: `1px solid ${C.calBorder}`,
          background: C.calHeader,
        }}>
          {DAY_ABBR.map(d => (
            <div key={d} style={{ padding: '6px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#595959', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {d}
              </span>
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            const inMonth  = day.getMonth() === viewDate.getMonth()
            const isToday  = isSameDay(day, today)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6
            const isLast   = i >= 35

            return (
              <div key={i} style={{
                minHeight: 34,
                borderRight: (i + 1) % 7 !== 0 ? `1px solid ${C.calBorder}` : 'none',
                borderBottom: !isLast ? `1px solid ${C.calBorder}` : 'none',
                padding: '4px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: isWeekend && inMonth ? 'rgba(0,0,0,0.18)' : 'transparent',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: isToday ? C.calToday : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: isToday ? 600 : 400,
                    color: isToday ? '#FFFFFF' : (inMonth ? (isWeekend ? '#595959' : '#E9E9E9') : '#383838'),
                  }}>
                    {day.getDate()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

/* ── Provider card ────────────────────────────────────── */

function ProviderCard({ provider, status, onConnect }) {
  const isConnected  = status === 'connected'
  const isConnecting = status === 'connecting'

  return (
    <motion.div
      layout
      onClick={() => !isConnecting && !isConnected && onConnect(provider.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 18px',
        background: isConnected ? C.connectedBg : C.surfaceCard,
        border: `1px solid ${isConnected ? C.connectedBorder : C.border}`,
        borderRadius: 12,
        cursor: isConnected || isConnecting ? 'default' : 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        userSelect: 'none',
      }}
      whileHover={!isConnected && !isConnecting ? { borderColor: '#555555' } : {}}
    >
      {/* Provider icon */}
      <div style={{ flexShrink: 0 }}>
        {provider.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 2px' }}>
          {provider.name}
        </p>
        <p style={{ fontSize: 12, color: C.textSecond, margin: 0, lineHeight: 1.4 }}>
          {provider.desc}
        </p>
      </div>

      {/* Status indicator */}
      <div style={{ flexShrink: 0 }}>
        <AnimatePresence mode="wait">
          {isConnecting && (
            <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SpinnerIcon />
            </motion.div>
          )}
          {isConnected && (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <CheckIcon />
            </motion.div>
          )}
          {status === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 500, color: C.infoText,
                padding: '4px 10px',
                border: `1px solid ${C.infoBorder}`,
                borderRadius: 6,
                background: C.infoBg,
              }}>
                Connect
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ── Main screen ──────────────────────────────────────── */

export function CalendarSyncScreen() {
  const navigate = useNavigate()

  // status per provider: 'idle' | 'connecting' | 'connected'
  const [statuses, setStatuses] = useState({ google: 'idle', outlook: 'idle', apple: 'idle' })

  const anyConnected = Object.values(statuses).some(s => s === 'connected')

  function handleConnect(id) {
    setStatuses(prev => ({ ...prev, [id]: 'connecting' }))
    setTimeout(() => {
      setStatuses(prev => ({ ...prev, [id]: 'connected' }))
    }, 900)
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 72px 0',
        flexShrink: 0,
      }}>
        <button
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

      {/* ── Two-column layout ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '3vh 72px 4vh',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 64,
          width: '100%',
          maxWidth: 940,
        }}>

          {/* ── LEFT PANEL ── */}
          <div style={{
            width: 320, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 20,
          }}>

            {/* Heading */}
            <div>
              <h1 style={{
                fontSize: 26, fontWeight: 700, lineHeight: '32px',
                color: C.textPrimary, margin: '0 0 8px',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}>
                Sync your calendar
              </h1>
              <p style={{ fontSize: 13, color: C.textSecond, margin: 0, lineHeight: 1.55 }}>
                See all your upcoming meetings directly inside Webex.
              </p>
            </div>

            {/* Info banner */}
            <div style={{
              background: C.infoBg,
              border: `1px solid ${C.infoBorder}`,
              borderRadius: 10,
              padding: '11px 14px',
              display: 'flex', gap: 9, alignItems: 'flex-start',
            }}>
              <div style={{ color: C.infoText, flexShrink: 0, marginTop: 1 }}>
                <InfoIcon />
              </div>
              <p style={{ fontSize: 12, color: C.infoText, margin: 0, lineHeight: 1.55 }}>
                Webex only reads your calendar to show meeting times. It will never create or delete events without your action.
              </p>
            </div>

            {/* Mini calendar */}
            <MiniCalendar />

          </div>

          {/* ── RIGHT PANEL ── */}
          <motion.div
            initial={{ opacity: 0, y: CONTENT.enterY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...CONTENT.spring, delay: CONTENT.delay }}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 14,
            }}
          >

            {/* Section label */}
            <div>
              <p style={{
                fontSize: 11, fontWeight: 600, color: C.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                margin: '0 0 4px',
              }}>
                Choose a calendar
              </p>
              <p style={{ fontSize: 13, color: C.textSecond, margin: 0, lineHeight: 1.5 }}>
                Connect one or more providers — you can always add more later.
              </p>
            </div>

            {/* Provider cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROVIDERS.map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  status={statuses[provider.id]}
                  onConnect={handleConnect}
                />
              ))}
            </div>

            {/* Connect button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => anyConnected && navigate('/enterprise-home')}
                disabled={!anyConnected}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: anyConnected
                    ? 'linear-gradient(90deg, #1c8160 0%, #2aab7d 100%)'
                    : C.surface,
                  border: `1px solid ${anyConnected ? 'transparent' : C.border}`,
                  borderRadius: 9999,
                  fontSize: 14, fontWeight: 600,
                  color: anyConnected ? '#FFFFFF' : C.textMuted,
                  fontFamily: 'inherit',
                  cursor: anyConnected ? 'pointer' : 'default',
                  transition: 'opacity 0.15s, transform 0.1s, background 0.3s',
                }}
                onMouseEnter={e => { if (anyConnected) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {anyConnected ? 'Connect & continue →' : 'Connect a calendar to continue'}
              </button>

              <button
                onClick={() => navigate('/enterprise-home')}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 13, color: C.textMuted,
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 500, padding: '4px 0',
                  transition: 'color 0.15s',
                  textAlign: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.color = C.textSecond}
                onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
              >
                Skip for now
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
