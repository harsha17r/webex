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

const CHIPS = ['Meeting Summary', 'View Transcript', 'Show Chat Messages']

function PastMeetingCard({ elapsed, profile }) {
  const [chipHover, setChipHover] = useState(null)
  const [activeSeg, setActiveSeg] = useState('Day')

  const mins    = Math.max(1, Math.floor(elapsed / 60))
  const now     = new Date()
  const navDate = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })
  const cardDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const initial = profile.name?.charAt(0).toUpperCase() || 'U'
  const segments = ['Day', 'Week', 'Calendar']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Date Navigation Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '12px 0', gap: 0,
      }}>
        {/* Left group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Arrow buttons */}
          {['‹', '›'].map(arrow => (
            <button key={arrow} style={{
              width: 28, height: 28, borderRadius: 6,
              background: '#494949', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#FFFFFF', fontSize: 16, fontWeight: 400,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>{arrow}</button>
          ))}
          {/* Date label */}
          <span style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px' }}>
            {navDate}
          </span>
          {/* Return to today */}
          <span style={{ fontSize: 13, fontWeight: 400, color: '#2E96E8', opacity: 0.6, cursor: 'pointer' }}>
            Return to today
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Segmented control */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#494949', border: '1px solid #737373',
            borderRadius: 8, padding: 2,
          }}>
            {segments.map(seg => (
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

          {/* Avatar pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: '#222222', borderRadius: 9999,
            padding: 8,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: '#7C3EC3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: '#FFFFFF',
            }}>{initial}</div>
          </div>
        </div>
      </div>

      {/* ── Meeting Card ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '16px 20px',
        background: '#222222',
        borderBottom: '1px solid #737373',
      }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#7C3EC3', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 600, color: '#FFFFFF',
        }}>{initial}</div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Title */}
          <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF', lineHeight: '24px' }}>
            Test call with {profile.name}
          </span>

          {/* Date · duration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#999CA2', lineHeight: '20px' }}>{cardDate}</span>
            <span style={{ fontSize: 12, color: '#999CA2' }}>·</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#999CA2', lineHeight: '20px' }}>{mins} min</span>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {CHIPS.map(chip => (
              <button
                key={chip}
                onMouseEnter={() => setChipHover(chip)}
                onMouseLeave={() => setChipHover(null)}
                style={{
                  background: chipHover === chip ? '#595959' : '#494949',
                  border: '1px solid #737373',
                  borderRadius: 5, padding: '4px 10px',
                  fontSize: 14, fontWeight: 500, color: '#D1D1D9', lineHeight: '20px',
                  cursor: 'pointer', transition: 'background 0.15s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >{chip}</button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
