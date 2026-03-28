import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useProfile } from '../../context/ProfileContext'
import { PreJoinModal } from '../meeting/PreJoinModal'
import { Dropdown } from '../../components/Dropdown'

/* ─────────────────────────────────────────────────────────
 * Figma content column spec:
 *   x:134, y:60 (within scrollable area), width:960, gap:64 between sections
 *
 * Section 1 — Welcome:
 *   "Welcome, {name}!" h1 (20px 600 white), marginBottom 24
 *   Banner row: LEFT text panel + RIGHT image panel
 *     LEFT: bg #494949, borderRadius 8px 0 0 8px, border #494949 (no right border)
 *           padding 32px 40px, column gap 32, text group gap 4
 *     RIGHT: bg #494949, borderRadius 0 8px 8px 0, border #494949 (no left border)
 *            flex 1, minHeight 180
 *
 * Section 2 — Meetings:
 *   Header row: "Meetings" h2 + "Connect your calendar" btn
 *   3 tiles row, gap 20: each bg #494949, radius 8, padding 20px 16px, column gap 10
 * ───────────────────────────────────────────────────────── */

// Fluent UI 20px icons — fill="currentColor"
const TILES = [
  {
    key: 'schedule',
    label: 'Schedule a meeting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ color: '#FFFFFF' }}>
        <path fill="currentColor" d="M14.5 3A2.5 2.5 0 0 1 17 5.5v4.1a5.5 5.5 0 0 0-1-.393V7H4v7.5A1.5 1.5 0 0 0 5.5 16h3.707q.149.524.393 1H5.5A2.5 2.5 0 0 1 3 14.5v-9A2.5 2.5 0 0 1 5.5 3zm0 1h-9A1.5 1.5 0 0 0 4 5.5V6h12v-.5A1.5 1.5 0 0 0 14.5 4M19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15z"/>
      </svg>
    ),
  },
  {
    key: 'join',
    label: 'Join with meeting ID',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ color: '#FFFFFF' }}>
        <path fill="currentColor" d="M6 5a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 3a1 1 0 1 1-2 0a1 1 0 0 1 2 0m3-7a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 3a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-1 5a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 3a1 1 0 1 1-2 0a1 1 0 0 1 2 0m3-11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 3a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-1 5a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/>
      </svg>
    ),
  },
  {
    key: 'launch',
    label: 'Launch a Webex Meeting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ color: '#FFFFFF' }}>
        <path fill="currentColor" d="M5 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-.321l3.037 2.097a1.25 1.25 0 0 0 1.96-1.029V6.252a1.25 1.25 0 0 0-1.96-1.028L13 7.32V7a3 3 0 0 0-3-3zm8 4.536l3.605-2.49a.25.25 0 0 1 .392.206v7.495a.25.25 0 0 1-.392.206L13 11.463zM3 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
]

export function MeetingsTab({ calendarConnected, fromMeeting = false, meetingElapsed = 0 }) {
  const [tileHover, setTileHover] = useState(null)
  const [btnHover, setBtnHover]     = useState(false)
  const [preJoinOpen, setPreJoinOpen] = useState(false)
  const { profile } = useProfile()

  return (
    <>
    {/* Full-area card — fills the scrollable column, small padding all sides */}
    <div style={{
      margin: 4,
      minHeight: 'calc(100% - 8px)',
      background: '#1A1A1A',
      border: '1px solid #494949',
      borderRadius: 12,
      padding: '32px 32px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxSizing: 'border-box',
      position: 'relative',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Inner content column — max 960px, centered */}
      <div style={{ width: 'clamp(560px, 85%, 960px)', display: 'flex', flexDirection: 'column', gap: 64 }}>

        {/* ── Section 1 — Welcome banner (hidden after first meeting) ── */}
        <AnimatePresence>
          {!fromMeeting && (
            <motion.div
              key="welcome-banner"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <h1 style={{
                fontSize: 20, fontWeight: 600, color: '#FFFFFF',
                margin: 0, lineHeight: '28px',
              }}>
                Welcome, {profile.name}!
              </h1>

              {/* Banner row */}
              <div style={{ display: 'flex', width: '100%', minHeight: 200 }}>
                <div style={{
                  width: 320, flexShrink: 0,
                  background: '#494949',
                  borderRadius: '12px 0 0 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 24, boxSizing: 'border-box',
                }}>
                  <svg width="160" height="110" viewBox="0 0 160 110" fill="none">
                    <rect x="0"  y="0"  width="75" height="50" rx="5" fill="#383838" stroke="#606060" strokeWidth="1"/>
                    <rect x="0"  y="60" width="75" height="50" rx="5" fill="#383838" stroke="#606060" strokeWidth="1"/>
                    <rect x="85" y="0"  width="75" height="50" rx="5" fill="#383838" stroke="#606060" strokeWidth="1"/>
                    <rect x="85" y="60" width="75" height="50" rx="5" fill="#383838" stroke="#606060" strokeWidth="1"/>
                    <circle cx="37"  cy="20" r="10" fill="#555555"/>
                    <circle cx="122" cy="20" r="10" fill="#555555"/>
                    <circle cx="37"  cy="80" r="10" fill="#555555"/>
                    <circle cx="122" cy="80" r="10" fill="#555555"/>
                  </svg>
                </div>

                <div style={{
                  flex: 1,
                  background: '#494949',
                  borderRadius: '0 8px 8px 0',
                  padding: '32px 40px',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', gap: 32,
                  boxSizing: 'border-box',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '28px' }}>
                      Try a quick test meeting
                    </h2>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#AAAAAA', margin: 0, maxWidth: 325, lineHeight: '20px' }}>
                      Experience how your meetings will look and feel.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreJoinOpen(true)}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      background: btnHover ? '#2BAB7E' : '#1D8160',
                      border: 'none', borderRadius: 9999,
                      height: 48, padding: '0 24px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      cursor: 'pointer', width: 'fit-content',
                      transition: 'background 0.15s',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path fill="#FFFFFF" d="M5 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-.321l3.037 2.097a1.25 1.25 0 0 0 1.96-1.029V6.252a1.25 1.25 0 0 0-1.96-1.028L13 7.32V7a3 3 0 0 0-3-3zm8 4.536l3.605-2.49a.25.25 0 0 1 .392.206v7.495a.25.25 0 0 1-.392.206L13 11.463zM3 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Start a test meeting</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Section 2 — Meetings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              fontSize: 20, fontWeight: 600, color: '#FFFFFF',
              margin: 0, lineHeight: '28px',
            }}>
              Meetings
            </h2>
            {calendarConnected ? (
              /* ── After connecting — icon-only settings button ── */
              <button
                title="Calendar settings"
                style={{
                  background: '#222222',
                  border: '1px solid #494949',
                  borderRadius: 8, padding: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
                onMouseLeave={e => e.currentTarget.style.background = '#222222'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                  <path d="M16 2v4M8 2v4m13 6.5V12c0-3.771 0-5.657-1.172-6.828S16.771 4 13 4h-2C7.229 4 5.343 4 4.172 5.172S3 8.229 3 12v2c0 3.771 0 5.657 1.172 6.828S7.229 22 11 22M3 10h18"/>
                  <path d="M17.5 20.5c.93 0 1.74-.507 2.171-1.26M17.5 20.5c-.93 0-1.74-.507-2.171-1.26M17.5 20.5V22m0-6.5c.93 0 1.74.507 2.17 1.26M17.5 15.5c-.93 0-1.74.507-2.17 1.26m2.17-1.26V14m3.5 2l-1.33.76M14 20l1.329-.76M21 20l-1.329-.76M14 16l1.33.76m4.34 0c.21.365.33.788.33 1.24s-.12.875-.329 1.24m-4.342 0A2.5 2.5 0 0 1 15 18c0-.451.12-.875.33-1.24"/>
                </svg>
              </button>
            ) : (
              /* ── Before connecting ── */
              <button style={{
                background: '#222222',
                border: '1px solid #494949',
                borderRadius: 8, padding: 12,
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path fill="#FFFFFF" d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>
                  Connect your calendar
                </span>
              </button>
            )}
          </div>

          {/* Action tiles */}
          <div style={{ display: 'flex', gap: 20 }}>
            {TILES.map(tile => (
              <div
                key={tile.key}
                onMouseEnter={() => setTileHover(tile.key)}
                onMouseLeave={() => setTileHover(null)}
                style={{
                  flex: 1, background: tileHover === tile.key ? '#444444' : '#3A3A3A',
                  borderRadius: 8, padding: '20px 24px',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  cursor: 'pointer', transition: 'background 0.15s',
                  boxSizing: 'border-box',
                }}
              >
                {tile.icon}
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', lineHeight: '20px' }}>
                  {tile.label}
                </span>
              </div>
            ))}
          </div>

          {/* Past meeting card — appears after returning from a meeting */}
          <AnimatePresence>
            {fromMeeting && (
              <motion.div
                key="past-meeting"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
              >
                <PastMeetingCard elapsed={meetingElapsed} profile={profile} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>


    </div>

    <AnimatePresence>
      {preJoinOpen && (
        <PreJoinModal onClose={() => setPreJoinOpen(false)} />
      )}
    </AnimatePresence>
    </>
  )
}

/* ── Calendar helpers ─────────────────────────────────── */

function getWeekStart(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() // 0 = Sun
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)) // Monday-first
  return date
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

function fmt12(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const DAY_ABBR       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PICKER_DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CHIPS    = ['Meeting Summary', 'Transcript', 'Chat Messages']
const SEGMENTS = ['Day', 'Week']

/* ── Date picker popover ───────────────────────────────── */
function DatePickerPopover({ viewDate, activeSeg, onSelect, onClose }) {
  const today = new Date()
  const [pickerMonth, setPickerMonth] = useState(() =>
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  )

  function prevMonth() { setPickerMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)) }
  function nextMonth() { setPickerMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)) }

  // Grid starts on the Sunday before (or on) the 1st of the month
  const firstOfMonth = pickerMonth
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  const monthLabel = pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function isHighlighted(cell) {
    if (activeSeg === 'Week') {
      const ws = getWeekStart(viewDate)
      return cell >= ws && cell <= addDays(ws, 6)
    }
    return isSameDay(cell, viewDate)
  }

  return (
    <div style={{
      width: 288,
      background: '#111111',
      border: '1px solid #2E2E2E',
      borderRadius: 16,
      padding: '16px 16px 12px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.65)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {/* Month header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{monthLabel}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['‹', prevMonth], ['›', nextMonth]].map(([ch, fn]) => (
            <button key={ch} onClick={fn} style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#888888', fontSize: 18, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{ch}</button>
          ))}
        </div>
      </div>

      {/* Day name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {PICKER_DAY_ABBR.map(d => (
          <span key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 600,
            color: '#666666', textTransform: 'uppercase', letterSpacing: '0.03em',
            paddingBottom: 4,
          }}>{d}</span>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          const inMonth  = cell.getMonth() === pickerMonth.getMonth()
          const isToday  = isSameDay(cell, today)
          const selected = isHighlighted(cell)

          return (
            <button
              key={i}
              onClick={() => { onSelect(cell); onClose() }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: isToday ? '#2E96E8' : (selected && !isToday ? 'rgba(255,255,255,0.06)' : 'none'),
                border: selected && !isToday ? '1px solid #595959' : '1px solid transparent',
                color: !inMonth ? '#383838' : isToday ? '#FFFFFF' : '#E9E9E9',
                fontSize: 13, fontWeight: isToday ? 600 : 400,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                transition: 'background 0.1s',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >{cell.getDate()}</button>
          )
        })}
      </div>
    </div>
  )
}
const DETAIL_TABS = ['About', 'Meeting summary', 'Transcript', 'Chat messages']

const MEETING_NOTES_DATA = {
  overview: 'A first-time onboarding test call with Cisco AI. Audio and video were verified and working. Cisco AI walked through its in-meeting and post-meeting capabilities to help the user get comfortable before their first real Webex meeting.',
  highlights: [
    'Audio and video confirmed working — no setup changes needed.',
    'Cisco AI can provide live summaries, flag action items, and help latecomers catch up mid-call.',
    'Post-meeting detail view explored — summary, transcript, and action items are all accessible after a call ends.',
    'User found the layout intuitive and felt ready for their first real meeting.',
  ],
  decisions: [
    'No configuration changes required — setup is complete out of the box.',
    'User will rely on Cisco AI during upcoming meetings to explore its full feature set.',
  ],
}

const INITIAL_ACTION_ITEMS = [
  { id: 1, text: 'Try asking Cisco AI to summarize the meeting during your next call.' },
  { id: 2, text: 'Use the \'Catch me up\' chip if you ever join a meeting late.' },
  { id: 3, text: 'Check back in the meeting detail view after your next call to review the summary and transcript.' },
]

/* ── Shared card primitives ────────────────────────────── */

function CardShell({ children, accent = '#2E2E2E', onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={onClick ? () => setHov(true) : undefined}
      onMouseLeave={onClick ? () => setHov(false) : undefined}
      style={{
        background: hov ? '#232323' : '#1E1E1E',
        border: '1px solid #2E2E2E',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 6,
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.12s',
      }}
    >{children}</div>
  )
}

/* ── Cisco AI avatar (used in detail modal participants) ── */
function CiscoAIAvatar({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="cav-ring" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0051AF"/>
          <stop offset="67%"  stopColor="#0087EA"/>
          <stop offset="100%" stopColor="#00BCEB"/>
        </linearGradient>
        <linearGradient id="cav-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#0087EA"/>
          <stop offset="84%" stopColor="#63FFF7"/>
        </linearGradient>
        <linearGradient id="cav-inner" x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="35%"  stopColor="rgba(116,191,75,0)"/>
          <stop offset="96%"  stopColor="#74BF4B"/>
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill="#1E2A3A"/>
      <circle cx="18" cy="18" r="12" stroke="url(#cav-ring)" strokeWidth="2" fill="none"/>
      <ellipse cx="24" cy="12" rx="6" ry="6" fill="url(#cav-lens)" opacity="0.85"/>
      <ellipse cx="24" cy="12" rx="4" ry="5" fill="url(#cav-inner)" opacity="0.9"/>
    </svg>
  )
}

/* ── Summary section card (Notes + Action Items) ───────── */
function SummarySection({ title, feedbackConfig, children }) {
  const [vote,         setVote]         = useState(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [copyTick,     setCopyTick]     = useState(false)

  function handleVote(v) {
    setVote(v)
    setTimeout(() => setFeedbackSent(true), 350)
  }

  return (
    <div style={{
      background: '#1C1C1C',
      border: '1px solid #2A2A2A',
      borderRadius: 10,
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 18px',
        borderBottom: '1px solid #222222',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{title}</span>
          <span style={{ fontSize: 12, color: '#d1d1d1', fontWeight: 600}}>·    Cisco AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Translate */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: 6,
            display: 'flex', alignItems: 'center', color: '#888888',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="m11.9 22l4.55-12h2.1l4.55 12H21l-1.075-3.05h-4.85L14 22zM4 19l-1.4-1.4l5.05-5.05q-.875-.875-1.588-2T4.75 8h2.1q.5.975 1 1.7t1.2 1.45q.825-.825 1.713-2.313T12.1 6H1V4h7V2h2v2h7v2h-2.9q-.525 1.8-1.575 3.7t-2.075 2.9l2.4 2.45l-.75 2.05l-3.05-3.125zm11.7-1.8h3.6l-1.8-5.1z"/>
            </svg>
          </button>
          {/* Copy — flips to a checkmark on click */}
          <button
            onClick={() => { setCopyTick(true); setTimeout(() => setCopyTick(false), 1500) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, borderRadius: 6,
              display: 'flex', alignItems: 'center',
              color: copyTick ? '#2BAB7E' : '#888888',
              transition: 'color 0.15s',
            }}
          >
            {copyTick ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 11H3a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 3 2h6A1.5 1.5 0 0 1 10.5 3.5V5"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 18px 20px' }}>
        {children}
      </div>

      {/* Feedback strip */}
      <div style={{
        padding: '14px 18px 16px',
        background: '#161616',
        borderTop: '1px solid #1F1F1F',
      }}>
        {feedbackSent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="rgba(43,171,126,0.15)"/>
              <path d="M4 7l2 2 4-4" stroke="#2BAB7E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 12, color: '#666666' }}>
              Thanks for the feedback. Cisco AI will use this to improve.
            </span>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9', margin: '0 0 2px' }}>
              {feedbackConfig.prompt}
            </p>
            <p style={{ fontSize: 13, color: '#888888', margin: '0 0 10px', lineHeight: '18px' }}>
              {feedbackConfig.sub}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { val: 'up',   label: feedbackConfig.yes, activeColor: '#2BAB7E', activeBg: 'rgba(43,171,126,0.12)', icon: 'M3 6V11M3 6L6 2L8.5 5H11.5L10 11H3V6Z' },
                { val: 'down', label: feedbackConfig.no,  activeColor: '#E06050', activeBg: 'rgba(224,96,80,0.10)',   icon: 'M11 8V3M11 8L8 12L5.5 9H2.5L4 3H11V8Z' },
              ].map(btn => (
                <button
                  key={btn.val}
                  onClick={() => handleVote(btn.val)}
                  style={{
                    background: vote === btn.val ? btn.activeBg : '#202020',
                    border: `1px solid ${vote === btn.val ? btn.activeColor : '#2A2A2A'}`,
                    borderRadius: 6, padding: '5px 12px',
                    fontSize: 12, fontWeight: 500,
                    color: vote === btn.val ? btn.activeColor : '#888888',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d={btn.icon} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                  {btn.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MeetingSummaryContent() {
  const [checked, setChecked] = useState({})
  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: 16, alignItems: 'start' }}>

      {/* ── Notes ── */}
      <SummarySection
        title="Notes"
        feedbackConfig={{
          prompt: 'Was this summary accurate?',
          yes:    'Accurate',
          no:     'Not quite',
        }}
      >
        <p style={{ fontSize: 14, color: '#FFFFFF', margin: '0 0 18px', lineHeight: '24px' }}>
          {MEETING_NOTES_DATA.overview}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
          {MEETING_NOTES_DATA.highlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#FFFFFF', lineHeight: '24px' }}>
              <span style={{ color: '#383838', flexShrink: 0, userSelect: 'none' }}>·</span>
              {h}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {MEETING_NOTES_DATA.decisions.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#FFFFFF', lineHeight: '24px' }}>
              <span style={{ color: '#383838', flexShrink: 0, userSelect: 'none' }}>·</span>
              {d}
            </div>
          ))}
        </div>
      </SummarySection>

      {/* ── Action items ── */}
      <SummarySection
        title="Action items"
        feedbackConfig={{
          prompt: 'Are these action items complete?',
          
          yes:    'Yes, complete',
          no:     'No, incomplete',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {INITIAL_ACTION_ITEMS.map(item => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
                border: `1.5px solid ${checked[item.id] ? '#2E96E8' : '#383838'}`,
                background: checked[item.id] ? '#2E96E8' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {checked[item.id] && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: 14, lineHeight: '20px',
                color: checked[item.id] ? '#494949' : '#E9E9E9',
                textDecoration: checked[item.id] ? 'line-through' : 'none',
                transition: 'color 0.15s',
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </SummarySection>

    </div>
  )
}

/* ── Transcript tab ────────────────────────────────────── */

function highlight(text, query) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: 'rgba(46,150,232,0.22)', color: '#FFFFFF',
        borderRadius: 2, padding: '0 1px',
      }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const TRANSCRIPT_ENTRIES = [
  { id: 1,  speaker: 'ai',   time: '0:00:04', text: "Welcome to Webex! I'm Cisco AI, your meeting assistant. This is a quick test call to make sure everything is working before your first real meeting." },
  { id: 2,  speaker: 'user', time: '0:00:18', text: 'Hi! Yeah, can you hear me okay?' },
  { id: 3,  speaker: 'ai',   time: '0:00:22', text: "Loud and clear! Your audio is coming through perfectly. Your video looks great too — you're all set on both." },
  { id: 4,  speaker: 'user', time: '0:00:35', text: "That's good to know. So what can you actually do during a meeting?" },
  { id: 5,  speaker: 'ai',   time: '0:00:41', text: "Quite a lot. I can give you a live summary, flag action items as they come up, answer questions, and help you catch up if you join late. Just ask." },
  { id: 6,  speaker: 'user', time: '0:01:02', text: 'What about after the meeting — is there a way to go back and review everything?' },
  { id: 7,  speaker: 'ai',   time: '0:01:08', text: "Yes — once a call ends you'll find the full summary, action items, and this transcript right in the meeting detail view. That's actually where you are right now." },
  { id: 8,  speaker: 'user', time: '0:01:28', text: 'Oh nice, so this is what it looks like. The layout is pretty clean.' },
  { id: 9,  speaker: 'ai',   time: '0:01:33', text: "Glad you like it! You can search the transcript, translate it, or copy it out. And if my summary ever misses something, the feedback buttons help me improve over time." },
  { id: 10, speaker: 'user', time: '0:01:52', text: "That's really helpful. I think I'm good to go." },
  { id: 11, speaker: 'ai',   time: '0:01:56', text: "You're all set. I'll be here in every meeting whenever you need me. Good luck out there!" },
]
const CHAT_MESSAGES = [
  { id: 1, speaker: 'ai',   timeLabel: '3:55 PM', text: "Welcome! Feel free to use this chat to share links, notes, or questions during any meeting." },
  { id: 2, speaker: 'user', timeLabel: '3:56 PM', text: "Got it — just testing the chat!" },
  { id: 3, speaker: 'ai',   timeLabel: '3:56 PM', text: "Looks good! Chat history from every meeting is saved here so you can review it any time after the call ends." },
  { id: 4, speaker: 'user', timeLabel: '3:57 PM', text: "That's really useful. So I can come back and read this later?" },
  { id: 5, speaker: 'ai',   timeLabel: '3:57 PM', text: "Exactly — just open the meeting detail and head to Chat messages. It'll always be here." },
]

function TranscriptContent({ profile }) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)

  const initials = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  const filtered = search.trim()
    ? TRANSCRIPT_ENTRIES.filter(e =>
        e.text.toLowerCase().includes(search.toLowerCase())
      )
    : TRANSCRIPT_ENTRIES

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Search bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#1C1C1C',
        border: `1px solid ${focused ? '#494949' : '#2A2A2A'}`,
        borderRadius: 8,
        padding: '9px 14px',
        marginBottom: 20,
        transition: 'border-color 0.15s',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="5.8" cy="5.8" r="4" stroke="#494949" strokeWidth="1.3"/>
          <path d="M9 9L12 12" stroke="#494949" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search transcript"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 14, color: '#FFFFFF', caretColor: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', color: '#666666' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Entries */}
      {filtered.length > 0 ? (
        <div>
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '13px 0',
                borderBottom: i < filtered.length - 1 ? '1px solid #1E1E1E' : 'none',
              }}
            >
              {/* Avatar */}
              {entry.speaker === 'ai' ? (
                <div style={{ marginTop: 1, flexShrink: 0 }}><CiscoAIAvatar size={32} /></div>
              ) : profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 1 }}
                />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#3D4A5C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: '#FFFFFF', flexShrink: 0, marginTop: 1,
                }}>
                  {initials}
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, color: '#E9E9E9', margin: '0 0 5px', lineHeight: '24px' }}>
                  {highlight(entry.text, search)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#888888' }}>
                    {entry.speaker === 'ai' ? 'Cisco AI' : profile.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#888888', flexShrink: 0, marginLeft: 16 }}>
                    {entry.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#666666' }}>No results for &ldquo;{search}&rdquo;</span>
        </div>
      )}

    </div>
  )
}

/* ── Chat messages tab ─────────────────────────────────── */
function ChatContent({ profile }) {
  const initials = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  const today    = new Date()
  const weekday  = today.toLocaleDateString('en-US', { weekday: 'long' })
  const shortDate = today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  const dateHeader = `${weekday} · ${shortDate}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Date header */}
      <div style={{ textAlign: 'center', paddingBottom: 20 }}>
        <span style={{ fontSize: 12, color: '#666666' }}>{dateHeader}</span>
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {CHAT_MESSAGES.map(msg => {
          const isAI = msg.speaker === 'ai'
          const name = isAI ? 'Cisco AI' : profile.name
          const timestamp = `${shortDate}, ${msg.timeLabel}`
          return (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Avatar */}
              {isAI ? (
                <CiscoAIAvatar size={36} />
              ) : profile.photoUrl ? (
                <img src={profile.photoUrl} alt={name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#3D4A5C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
                }}>{initials}</div>
              )}
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9' }}>{name}</span>
                  <span style={{ fontSize: 12, color: '#888888' }}>{timestamp}</span>
                </div>
                <p style={{ fontSize: 14, color: '#D9D9D9', margin: 0, lineHeight: '20px' }}>
                  {msg.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

/* ── Meeting Detail Modal ──────────────────────────────── */
const DOWNLOAD_WIDTH = 220

function DownloadPanel({ onClose }) {
  const [hovered, setHovered] = useState(null)
  const items = ['Transcript', 'Chat messages']
  return (
    <div style={{
      width: DOWNLOAD_WIDTH,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 12,
      padding: 8,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {items.map(item => (
        <div
          key={item}
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          onClick={onClose}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            background: hovered === item ? '#1E1E1E' : 'transparent',
            transition: 'background 0.12s',
            fontSize: 14, fontWeight: 400,
            color: '#FFFFFF',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

function MeetingDetailModal({ onClose, elapsed, profile, initialTab = 'About' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [partsOpen, setPartsOpen] = useState(true)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const downloadRef = useRef(null)

  const mins      = Math.max(1, Math.floor(elapsed / 60))
  const endTime   = new Date()
  const startTime = new Date(endTime - elapsed * 1000)
  const dateStr   = startTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const timeRange = `${fmt12(startTime)} – ${fmt12(endTime)}`
  const initials  = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 920,
          height: '74vh',
          background: '#141414',
          border: '1px solid #2E2E2E',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Title area ── */}
        <div style={{ padding: '28px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '30px' }}>
                Test call with {profile.name}
              </h2>
              <p style={{ fontSize: 13, color: '#888888', margin: '4px 0 0', lineHeight: '20px' }}>
                {dateStr}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, marginTop: -4,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Tabs + action buttons */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 20, paddingBottom: 12, borderBottom: '1px solid #242424',
          }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {DETAIL_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#323232' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? '#FFFFFF' : '#888888',
                    transition: 'background 0.12s, color 0.12s',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >{tab}</button>
              ))}
            </div>
            {/* Action icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Download + chevron grouped pill */}
              <div
                ref={downloadRef}
                style={{
                  display: 'flex', alignItems: 'center',
                  border: '1px solid #333333',
                  borderRadius: 8, overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setDownloadOpen(o => !o)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '7px 8px', display: 'flex', alignItems: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v9M5 9l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 14h12" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => setDownloadOpen(o => !o)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '7px 7px', display: 'flex', alignItems: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {/* Share */}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="14" cy="4" r="2"  stroke="#AAAAAA" strokeWidth="1.3"/>
                  <circle cx="4"  cy="9" r="2"  stroke="#AAAAAA" strokeWidth="1.3"/>
                  <circle cx="14" cy="14" r="2" stroke="#AAAAAA" strokeWidth="1.3"/>
                  <path d="M6 8l6-3M6 10l6 3" stroke="#AAAAAA" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, overflowY: 'auto' }}>

          {/* Left: tab content */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            {activeTab === 'Meeting summary' ? (
              <MeetingSummaryContent />
            ) : activeTab === 'Transcript' ? (
              <TranscriptContent profile={profile} />
            ) : activeTab === 'About' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* Date + time row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                    <circle cx="9" cy="9" r="7" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M9 5.5V9l2.5 2" stroke="#888888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 14, color: '#E9E9E9', lineHeight: '20px' }}>{dateStr}</span>
                    <span style={{ fontSize: 14, color: '#888888', lineHeight: '18px' }}>{timeRange} · {mins} min</span>
                  </div>
                </div>

                {/* Participants count row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="6.5" r="2.8" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M1.5 15.5c0-3.04 2.46-5.5 5.5-5.5" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="13" cy="7" r="2.1" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M11 15.5c0-2.21 1.79-4 4-4" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>2 participants</span>
                </div>

                {/* Description row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                    <path d="M3 5h12M3 9h9M3 13h6" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9', margin: '0 0 6px' }}>Description</p>
                    <p style={{ fontSize: 14, color: '#666666', margin: 0, lineHeight: '20px' }}>No description added.</p>
                  </div>
                </div>

              </div>
            ) : activeTab === 'Chat messages' ? (
              <ChatContent profile={profile} />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 200,
              }}>
                <span style={{ fontSize: 13, color: '#666666' }}>No content yet.</span>
              </div>
            )}
          </div>

          {/* Right: Participants panel — About tab only */}
          {activeTab === 'About' && <div style={{
            width: 256, flexShrink: 0,
            borderLeft: '1px solid #242424',
            padding: '20px 20px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <button
              onClick={() => setPartsOpen(x => !x)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ transform: partsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s', flexShrink: 0 }}
              >
                <path d="M3 5l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#888888' }}>Participants</span>
            </button>

            {partsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Profile user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#3D4A5C',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                  )}
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>{profile.name}</span>
                </div>
                {/* Cisco AI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CiscoAIAvatar size={36} />
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>Cisco AI</span>
                </div>
              </div>
            )}
          </div>}

        </div>

        {/* Chat closed footer */}
        {activeTab === 'Chat messages' && (
          <div style={{
            padding: '13px 28px',
            borderTop: '1px solid #1F1F1F',
            textAlign: 'center',
            flexShrink: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            <span style={{ fontSize: 14, color: '#FFFFFF' }}>The meeting conversation is closed.</span>
          </div>
        )}

      </motion.div>

      {/* Download dropdown */}
      <AnimatePresence>
        {downloadOpen && (
          <Dropdown
            anchorRef={downloadRef}
            onClose={() => setDownloadOpen(false)}
            anchor="bottom-right"
            offsetY={6}
          >
            <DownloadPanel onClose={() => setDownloadOpen(false)} />
          </Dropdown>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

/* ── State 4: Past ─────────────────────────────────────── */
function MeetingRow({ elapsed, profile, chipHover, setChipHover, onClick, onChipClick }) {
  const mins      = Math.max(1, Math.floor(elapsed / 60))
  const endTime   = new Date()
  const startTime = new Date(endTime - elapsed * 1000)
  const timeRange = `${fmt12(startTime)} – ${fmt12(endTime)}`

  return (
    <CardShell accent="#494949" onClick={onClick}>
      <span style={{ fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>
        Test call with {profile.name}
      </span>
      <span style={{ fontSize: 13, color: '#767676' }}>
        {timeRange} · {mins} min duration
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
        {CHIPS.map(chip => (
          <button
            key={chip}
            onMouseEnter={() => setChipHover(chip)}
            onMouseLeave={() => setChipHover(null)}
            onClick={e => { e.stopPropagation(); onChipClick?.(CHIP_TAB_MAP[chip]) }}
            style={{
              background: chipHover === chip ? '#383838' : '#2A2A2A',
              border: '1px solid #3A3A3A',
              borderRadius: 5, padding: '3px 10px',
              fontSize: 12, fontWeight: 500, color: '#FFFFFF', lineHeight: '18px',
              cursor: 'pointer', transition: 'background 0.15s',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >{chip}</button>
        ))}
      </div>
    </CardShell>
  )
}

/* ── Week view ─────────────────────────────────────────── */
function WeekMeetingBlock({ title, timeRange, mins, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#232323' : '#1E1E1E',
        border: '1px solid #2E2E2E',
        borderLeft: '3px solid #494949',
        borderRadius: 8,
        padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 3,
        cursor: 'pointer',
        transition: 'background 0.12s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 600, color: '#FFFFFF',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{title}</span>
      <span style={{ fontSize: 11, color: '#888888', lineHeight: '16px' }}>{timeRange}</span>
      <span style={{ fontSize: 11, color: '#666666' }}>{mins} min</span>
    </div>
  )
}

function WeekView({ viewDate, meetingDate, elapsed, profile, onMeetingClick }) {
  const weekStart = getWeekStart(viewDate)
  const today     = new Date()
  const endTime   = new Date(meetingDate)
  const startTime = new Date(endTime - elapsed * 1000)
  const mins      = Math.max(1, Math.floor(elapsed / 60))

  return (
    <div style={{
      display: 'flex',
      border: '1px solid #2E2E2E',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {DAY_ABBR.map((abbr, i) => {
        const day       = addDays(weekStart, i)
        const isToday   = isSameDay(day, today)
        const hasMeeting = isSameDay(day, meetingDate)
        const isWeekend = i >= 5

        return (
          <div key={abbr} style={{
            flex: 1,
            borderRight: i < 6 ? '1px solid #2E2E2E' : 'none',
            display: 'flex', flexDirection: 'column',
            background: isWeekend ? 'rgba(0,0,0,0.18)' : 'transparent',
          }}>

            {/* Column header */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 4px 8px', gap: 4,
              borderBottom: '1px solid #2E2E2E',
              background: '#1E1E1E',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: isToday ? '#FFFFFF' : '#767676',
              }}>{abbr}</span>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isToday ? '#ffffff' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? '#4d4d4d' : (isWeekend ? '#595959' : '#E9E9E9'),
                }}>{day.getDate()}</span>
              </div>
            </div>

            {/* Day content */}
            <div style={{ flex: 1, padding: '8px 6px', minHeight: 160 }}>
              {hasMeeting && (
                <WeekMeetingBlock
                  title={`Test call with ${profile.name}`}
                  timeRange={`${fmt12(startTime)} – ${fmt12(endTime)}`}
                  mins={mins}
                  onClick={onMeetingClick}
                />
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}

/* ── Calendar (month) view ─────────────────────────────── */
function CalendarView({ viewDate, meetingDate }) {
  const today      = new Date()
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const gridStart  = getWeekStart(firstOfMonth)
  const cells      = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  return (
    <div style={{
      border: '1px solid #2E2E2E', borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Day name header */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #2E2E2E', background: '#1E1E1E',
      }}>
        {DAY_ABBR.map(d => (
          <div key={d} style={{ padding: '8px 0', textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#595959', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          const inMonth   = day.getMonth() === viewDate.getMonth()
          const isToday   = isSameDay(day, today)
          const hasMeeting = isSameDay(day, meetingDate) && inMonth
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          const isLast    = i >= 35

          return (
            <div key={i} style={{
              minHeight: 52,
              borderRight: (i + 1) % 7 !== 0 ? '1px solid #2E2E2E' : 'none',
              borderBottom: !isLast ? '1px solid #2E2E2E' : 'none',
              padding: '6px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: isWeekend && inMonth ? 'rgba(0,0,0,0.18)' : 'transparent',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: isToday ? '#2E96E8' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? '#FFFFFF' : (inMonth ? (isWeekend ? '#595959' : '#E9E9E9') : '#383838'),
                }}>{day.getDate()}</span>
              </div>
              {hasMeeting && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2E96E8' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── PastMeetingCard ───────────────────────────────────── */
const CHIP_TAB_MAP = {
  'Meeting Summary': 'Meeting summary',
  'Transcript':      'Transcript',
  'Chat Messages':   'Chat messages',
}

const SEGMENT_ICONS = {
  Day: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 17q-.825 0-1.412-.587T3 15V9q0-.825.588-1.412T5 7h14q.825 0 1.413.588T21 9v6q0 .825-.587 1.413T19 17zm0-2h14V9H5zM3 5V3h18v2zm0 16v-2h18v2zM5 9v6z"/>
    </svg>
  ),
  Week: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm9-2h2.5V6H13zm-4.5 0H11V6H8.5zM4 18h2.5V6H4zm13.5 0H20V6h-2.5z"/>
    </svg>
  ),
}

function ViewDropPanel({ activeSeg, onSelect }) {
  const [hov, setHov] = useState(null)
  return (
    <div style={{
      width: 160,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 12,
      padding: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {SEGMENTS.map(seg => (
        <div
          key={seg}
          onMouseEnter={() => setHov(seg)}
          onMouseLeave={() => setHov(null)}
          onClick={() => onSelect(seg)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            background: hov === seg ? '#1E1E1E' : 'transparent',
            transition: 'background 0.12s',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, color: '#FFFFFF',
          }}
        >
          <span style={{ color: activeSeg === seg ? '#FFFFFF' : '#888888', display: 'flex', flexShrink: 0 }}>
            {SEGMENT_ICONS[seg]}
          </span>
          <span style={{ flex: 1 }}>{seg}</span>
          {activeSeg === seg && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 4" stroke="#2E96E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

function PastMeetingCard({ elapsed, profile }) {
  const [chipHover,      setChipHover]      = useState(null)
  const [detailOpen,     setDetailOpen]     = useState(false)
  const [initialTab,     setInitialTab]     = useState('About')
  const [activeSeg,      setActiveSeg]      = useState('Day')
  const [viewDate,       setViewDate]       = useState(new Date())
  const [meetingDate]                       = useState(() => new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [viewDropOpen,   setViewDropOpen]   = useState(false)
  const dateLabelRef                        = useRef(null)
  const viewDropRef                         = useRef(null)

  const today = new Date()

  /* ── Navigation helpers ── */
  function isOnToday() {
    if (activeSeg === 'Day')      return isSameDay(viewDate, today)
    if (activeSeg === 'Week')     return isSameDay(getWeekStart(viewDate), getWeekStart(today))
    return viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
  }

  function navLabel() {
    if (activeSeg === 'Day') {
      return viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }
    if (activeSeg === 'Week') {
      const start = getWeekStart(viewDate)
      const end   = addDays(start, 6)
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`
    }
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  function navPrev() {
    setViewDate(d => {
      if (activeSeg === 'Week') return addDays(d, -7)
      if (activeSeg === 'Calendar') { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n }
      return addDays(d, -1)
    })
  }

  function navNext() {
    setViewDate(d => {
      if (activeSeg === 'Week') return addDays(d, 7)
      if (activeSeg === 'Calendar') { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n }
      return addDays(d, 1)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Date navigation bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>

        {/* Left: arrows + label + return to today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={navPrev} style={{
            width: 28, height: 28, borderRadius: 6, background: '#494949', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#FFFFFF', fontSize: 16,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>‹</button>
          <button onClick={navNext} style={{
            width: 28, height: 28, borderRadius: 6, background: '#494949', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#FFFFFF', fontSize: 16,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>›</button>
          <button
            ref={dateLabelRef}
            onClick={() => setDatePickerOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 18, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {navLabel()}
          </button>
          {!isOnToday() && (
            <span
              onClick={() => setViewDate(new Date())}
              style={{ fontSize: 13, fontWeight: 400, color: '#2E96E8', cursor: 'pointer' }}
            >
              Return to today
            </span>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Right: segment control + settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 7,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065"/>
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/>
            </svg>
          </button>
          <button
            ref={viewDropRef}
            onClick={() => setViewDropOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#494949', border: '1px solid #737373',
              borderRadius: 8, padding: '7px 12px',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{activeSeg}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="#888888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>

      {/* ── View content ── */}

      {activeSeg === 'Day' && (
        isSameDay(viewDate, meetingDate) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <MeetingRow elapsed={elapsed} profile={profile} chipHover={chipHover} setChipHover={setChipHover} onClick={() => { setInitialTab('About'); setDetailOpen(true) }} onChipClick={tab => { setInitialTab(tab); setDetailOpen(true) }} />
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '52px 0', gap: 10,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5h9a2 2 0 0 1 2 2v9m-.184 3.839A2 2 0 0 1 18 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 1.158-1.815M16 3v4M8 3v1m-4 7h7m4 0h5M3 3l18 18"/>
            </svg>
            <span style={{ fontSize: 14, color: '#ffffff' }}>No meetings scheduled</span>
          </div>
        )
      )}

      {activeSeg === 'Week' && (
        <WeekView
          viewDate={viewDate}
          meetingDate={meetingDate}
          elapsed={elapsed}
          profile={profile}
          onMeetingClick={() => { setInitialTab('About'); setDetailOpen(true) }}
        />
      )}

      {activeSeg === 'Calendar' && (
        <CalendarView viewDate={viewDate} meetingDate={meetingDate} />
      )}

      <AnimatePresence>
        {detailOpen && (
          <MeetingDetailModal
            onClose={() => setDetailOpen(false)}
            elapsed={elapsed}
            profile={profile}
            initialTab={initialTab}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {datePickerOpen && (
          <Dropdown
            anchorRef={dateLabelRef}
            onClose={() => setDatePickerOpen(false)}
            anchor="bottom"
            dropdownWidth={288}
            offsetY={10}
          >
            <DatePickerPopover
              viewDate={viewDate}
              activeSeg={activeSeg}
              onSelect={date => setViewDate(date)}
              onClose={() => setDatePickerOpen(false)}
            />
          </Dropdown>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewDropOpen && (
          <Dropdown
            anchorRef={viewDropRef}
            onClose={() => setViewDropOpen(false)}
            anchor="bottom-right"
            offsetY={6}
          >
            <ViewDropPanel
              activeSeg={activeSeg}
              onSelect={seg => { setActiveSeg(seg); setViewDropOpen(false) }}
            />
          </Dropdown>
        )}
      </AnimatePresence>

    </div>
  )
}
