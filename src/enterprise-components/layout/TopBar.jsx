import { useState } from 'react'
import { useProfile } from '../../context/ProfileContext'

/* ─────────────────────────────────────────────────────────
 * Figma TopBar spec (y:0–63, full width, bg #111111):
 *   LEFT  (x:34, y:8): Avatar 40×40 + gap 37px + "Set your status" btn
 *   CENTER/RIGHT (x:513, y:10, w:1187): row, space-between, gap 344px
 *     Left: back/fwd chevrons + search 420×40
 *     Right: Connect btn + Cisco AI btn
 * ───────────────────────────────────────────────────────── */

function CiscoAISymbol({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="tb-ring" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0051AF"/>
          <stop offset="67%"  stopColor="#0087EA"/>
          <stop offset="100%" stopColor="#00BCEB"/>
        </linearGradient>
        <linearGradient id="tb-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#0087EA"/>
          <stop offset="84%"  stopColor="#63FFF7"/>
        </linearGradient>
        <linearGradient id="tb-inner" x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="35%"  stopColor="rgba(116,191,75,0)"/>
          <stop offset="96%"  stopColor="#74BF4B"/>
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="11.5" stroke="url(#tb-ring)" strokeWidth="2" fill="none"/>
      <ellipse cx="20" cy="8" rx="6" ry="6" fill="url(#tb-lens)" opacity="0.85"/>
      <ellipse cx="20" cy="8" rx="4" ry="5" fill="url(#tb-inner)" opacity="0.9"/>
    </svg>
  )
}

const STATUS_PREVIEW_MAX = 28

export function TopBar({ aiPanelOpen, onToggleAI, onSetStatusClick = () => {} }) {
  const [aiHover, setAiHover] = useState(false)
  const { profile } = useProfile()
  const raw = profile.statusText?.trim()
  const statusLabel = raw
    ? (raw.length > STATUS_PREVIEW_MAX ? `${raw.slice(0, STATUS_PREVIEW_MAX)}…` : raw)
    : null

  return (
    <div style={{
      width: '100%', height: 63, background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px 0 34px',
      boxSizing: 'border-box', flexShrink: 0,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* LEFT — Avatar (40×40) + gap 37px + Set your status button
           Width = 462px so right edge = padLeft(34) + 462 = 496,
           which aligns exactly with MessageStage's left edge:
           sidebar(90) + tab-margin(4) + tab-border(1) + left-panel(400) + panel-border(1) = 496 */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 37, flexShrink: 0,
        width: 462,
      }}>
        {/* Avatar with green status dot */}
        <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: profile.photoUrl ? 'transparent' : profile.bannerColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 500, color: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
            overflow: 'hidden',
          }}>
            {profile.photoUrl
              ? <img src={profile.photoUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
              : profile.name.charAt(0).toUpperCase()
            }
          </div>
          {/* Green status dot */}
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 11, height: 11, borderRadius: '50%',
            background: '#27A17A',
            border: '2px solid var(--bg-primary)',
            boxSizing: 'border-box',
          }} />
        </div>

        {/* Set your status button */}
        <button
          type="button"
          onClick={onSetStatusClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, borderRadius: 8,
            maxWidth: 320, minWidth: 0,
          }}
        >
          {/* Pencil SVG icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M11.5 2L14 4.5L5.5 13H3V10.5L11.5 2Z"
              stroke="var(--text-primary)" strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <span style={{
            fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {statusLabel ?? 'Set your status'}
          </span>
        </button>
      </div>

      {/* CENTER/RIGHT — back/fwd + search (left) + Connect + Cisco AI (right) */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* Left: chevrons + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Back chevron */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 4px', display: 'flex', alignItems: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 6L8 10L12 14" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Forward chevron */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 4px', display: 'flex', alignItems: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 6L12 10L8 14" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Search bar 420×40 */}
          <div style={{
            width: 420, height: 40, background: 'var(--bg-primary)',
            border: '1px solid var(--border-strong)', borderRadius: 8,
            padding: '0 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxSizing: 'border-box',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="var(--text-muted)" strokeWidth="1.4"/>
              <path d="M10.5 10.5L13.5 13.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              placeholder="Search Webex, chats, meetings, files ...."
              style={{
                flex: 1, background: 'transparent',
                border: 'none', outline: 'none',
                fontSize: 14, fontWeight: 400,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: 'var(--text-muted)', caretColor: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Right: Connect + Cisco AI buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Connect button */}
          <button style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 9999,
            padding: '8px 18px',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer',
          }}>
            {/* MDI cast — https://api.iconify.design/mdi:cast.svg */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path fill="var(--text-primary)" d="M1 10v2a9 9 0 0 1 9 9h2c0-6.08-4.93-11-11-11m0 4v2a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7m0 4v3h3a3 3 0 0 0-3-3M21 3H3c-1.11 0-2 .89-2 2v3h2V5h18v14h-7v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Connect</span>
          </button>

          {/* Cisco AI button */}
          <button
            onClick={onToggleAI}
            onMouseEnter={() => setAiHover(true)}
            onMouseLeave={() => setAiHover(false)}
            style={{
              background: aiPanelOpen ? '#3A3A3A' : aiHover ? '#2E2E2E' : 'var(--bg-elevated)',
              border: `1px solid ${aiPanelOpen ? '#737373' : aiHover ? '#5A5A5A' : 'var(--border-strong)'}`,
              borderRadius: 9999,
              padding: '8px 18px 8px 10px',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <CiscoAISymbol size={22} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Cisco AI</span>
          </button>
        </div>
      </div>

    </div>
  )
}
