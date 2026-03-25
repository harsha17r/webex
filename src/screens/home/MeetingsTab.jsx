import { useState } from 'react'
import { useProfile } from '../../context/ProfileContext'

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

const TILES = [
  {
    key: 'schedule',
    label: 'Schedule a meeting',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M3 9h18M8 2v4M16 2v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 13v4M10 15h4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'join',
    label: 'Join with meeting ID',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M7 10h2M11 10h2M15 10h2M9 14h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'launch',
    label: 'Launch a Webex Meeting',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="14" height="11" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M16 9l5.5-3.5V18.5L16 15" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function MeetingsTab({ calendarConnected }) {
  const [tileHover, setTileHover] = useState(null)
  const [btnHover, setBtnHover]   = useState(false)
  const { profile } = useProfile()

  return (
    /* Full-area card — fills the scrollable column, small padding all sides */
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

        {/* ── Section 1 — Welcome ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{
            fontSize: 20, fontWeight: 600, color: '#FFFFFF',
            margin: 0, lineHeight: '28px',
          }}>
            Welcome, {profile.name}!
          </h1>

          {/* Banner row */}
          <div style={{ display: 'flex', width: '100%', minHeight: 200 }}>

            {/* RIGHT — image panel (Figma: LEFT is image, RIGHT is text — but spec says
                LEFT=image, RIGHT=text with radius 12px 0 0 12px on image side.
                Per spec: LEFT=image panel, borderRadius 12px 0 0 12px;
                          RIGHT=text panel, borderRadius 0 8px 8px 0) */}
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

            {/* LEFT — text panel */}
            <div style={{
              flex: 1,
              background: '#494949',
              borderRadius: '0 8px 8px 0',
              padding: '32px 40px',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', gap: 32,
              boxSizing: 'border-box',
            }}>
              {/* Text group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{
                  fontSize: 20, fontWeight: 600, color: '#FFFFFF',
                  margin: 0, lineHeight: '28px',
                }}>
                  Try a quick test meeting
                </h2>
                <p style={{
                  fontSize: 14, fontWeight: 500, color: '#AAAAAA',
                  margin: 0, maxWidth: 325, lineHeight: '20px',
                }}>
                  Experience how your meetings will look and feel.
                </p>
              </div>

              {/* CTA button */}
              <button
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="5" width="11" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
                  <path d="M13 8.5L18 6V14L13 11.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>
                  Start a test meeting
                </span>
              </button>
            </div>

          </div>
        </div>

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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
                  <path d="M3 7h14M7 1v4M13 1v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
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

        </div>

      </div>


    </div>
  )
}
