import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useProfile } from '../../context/ProfileContext'
import { PreJoinModal } from '../meeting/PreJoinModal'

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

const DAY_ABBR  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CHIPS     = ['Meeting Summary', 'View Transcript', 'Show Chat Messages']
const SEGMENTS  = ['Day', 'Week']

/* ── Shared card primitives ────────────────────────────── */

function StateLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, color: '#383838',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '8px 0 2px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>{children}</div>
  )
}

function CardShell({ children, accent = '#2E2E2E' }) {
  return (
    <div style={{
      background: '#1E1E1E',
      border: '1px solid #2E2E2E',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 8,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 6,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>{children}</div>
  )
}

function Badge({ color, bg, dot, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 600, color,
      background: bg, borderRadius: 4, padding: '2px 7px',
      letterSpacing: '0.03em', flexShrink: 0,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }}/>}
      {children}
    </span>
  )
}

function SmallJoinBtn({ label, bg, hoverBg }) {
  const [h, setH] = useState(false)
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? hoverBg : bg,
        border: 'none', borderRadius: 6,
        padding: '5px 14px', cursor: 'pointer', flexShrink: 0,
        fontSize: 12, fontWeight: 500, color: '#FFFFFF',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.15s',
      }}
    >{label}</button>
  )
}

/* ── State 1: Upcoming ─────────────────────────────────── */
function UpcomingCard() {
  return (
    <CardShell accent="#2E96E8">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Weekly design sync</span>
        <SmallJoinBtn label="Join" bg="#1A2E40" hoverBg="#1D4A7A" />
      </div>
      <span style={{ fontSize: 13, color: '#767676' }}>5:00 – 5:45 PM · In 2 hrs · Organizer: Sarah Kim</span>
    </CardShell>
  )
}

/* ── State 2: Starting soon ────────────────────────────── */
function StartingSoonCard() {
  return (
    <CardShell accent="#F0A500">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Weekly design sync</span>
          <Badge color="#F0A500" bg="rgba(240,165,0,0.12)">Starting soon</Badge>
        </div>
        <SmallJoinBtn label="Join now" bg="#1170CF" hoverBg="#2E96E8" />
      </div>
      <span style={{ fontSize: 13, color: '#767676' }}>Starting in 8 min · 5:00 PM · Organizer: Sarah Kim</span>
    </CardShell>
  )
}

/* ── State 3: Live ─────────────────────────────────────── */
function LiveCard() {
  return (
    <CardShell accent="#2BAB7E">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Weekly design sync</span>
          <Badge color="#2BAB7E" bg="rgba(43,171,126,0.12)" dot>Live</Badge>
        </div>
        <SmallJoinBtn label="Join" bg="#1D8160" hoverBg="#2BAB7E" />
      </div>
      <span style={{ fontSize: 13, color: '#767676' }}>In progress · 14:32 elapsed · 4 joined</span>
    </CardShell>
  )
}

/* ── State 4: Past ─────────────────────────────────────── */
function MeetingRow({ elapsed, profile, chipHover, setChipHover }) {
  const mins      = Math.max(1, Math.floor(elapsed / 60))
  const endTime   = new Date()
  const startTime = new Date(endTime - elapsed * 1000)
  const timeRange = `${fmt12(startTime)} – ${fmt12(endTime)}`

  return (
    <CardShell accent="#494949">
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
            style={{
              background: chipHover === chip ? '#383838' : '#2A2A2A',
              border: '1px solid #3A3A3A',
              borderRadius: 5, padding: '3px 10px',
              fontSize: 12, fontWeight: 500, color: '#AAAAAA', lineHeight: '18px',
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
function WeekView({ viewDate, meetingDate, elapsed, profile }) {
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
                color: isToday ? '#2E96E8' : '#767676',
              }}>{abbr}</span>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isToday ? '#2E96E8' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? '#FFFFFF' : (isWeekend ? '#595959' : '#E9E9E9'),
                }}>{day.getDate()}</span>
              </div>
            </div>

            {/* Day content */}
            <div style={{ flex: 1, padding: '8px 6px', minHeight: 160 }}>
              {hasMeeting && (
                <div style={{
                  borderLeft: '3px solid #2E96E8',
                  background: 'rgba(46,150,232,0.1)',
                  borderRadius: '0 4px 4px 0',
                  padding: '6px 8px',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#FFFFFF',
                    lineHeight: '16px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    Test call with {profile.name}
                  </span>
                  <span style={{ fontSize: 10, color: '#92CBF2', lineHeight: '14px' }}>
                    {fmt12(startTime)} – {fmt12(endTime)}
                  </span>
                  <span style={{ fontSize: 10, color: '#767676' }}>{mins} min</span>
                </div>
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
function PastMeetingCard({ elapsed, profile }) {
  const [chipHover,  setChipHover]  = useState(null)
  const [activeSeg,  setActiveSeg]  = useState('Day')
  const [viewDate,   setViewDate]   = useState(new Date())
  const [meetingDate]               = useState(() => new Date()) // captured once on mount

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
          <span style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px' }}>
            {navLabel()}
          </span>
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

        {/* Right: segment control + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#494949', border: '1px solid #737373',
            borderRadius: 8, padding: 2,
          }}>
            {SEGMENTS.map(seg => (
              <button
                key={seg}
                onClick={() => setActiveSeg(seg)}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: activeSeg === seg ? '#92CBF2' : 'transparent',
                  boxShadow: activeSeg === seg ? '0px 1px 3px rgba(0,0,0,0.1)' : 'none',
                  outline: activeSeg === seg ? '2px solid #1170CF' : 'none',
                  fontSize: 13, fontWeight: activeSeg === seg ? 500 : 400,
                  color: activeSeg === seg ? '#0E3668' : '#E9E9E9',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  transition: 'background 0.15s',
                }}
              >{seg}</button>
            ))}
          </div>

        </div>
      </div>

      {/* ── View content ── */}

      {activeSeg === 'Day' && (
        isSameDay(viewDate, meetingDate) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <StateLabel>Upcoming</StateLabel>
            <UpcomingCard />
            <StateLabel>Starting soon</StateLabel>
            <StartingSoonCard />
            <StateLabel>Live</StateLabel>
            <LiveCard />
            <StateLabel>Past</StateLabel>
            <MeetingRow elapsed={elapsed} profile={profile} chipHover={chipHover} setChipHover={setChipHover} />
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '52px 0', gap: 10,
          }}>
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <path fill="#383838" d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4"/>
            </svg>
            <span style={{ fontSize: 14, color: '#595959' }}>No meetings scheduled</span>
          </div>
        )
      )}

      {activeSeg === 'Week' && (
        <WeekView
          viewDate={viewDate}
          meetingDate={meetingDate}
          elapsed={elapsed}
          profile={profile}
        />
      )}

      {activeSeg === 'Calendar' && (
        <CalendarView viewDate={viewDate} meetingDate={meetingDate} />
      )}

    </div>
  )
}
