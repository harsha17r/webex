import { useState } from 'react'

/* ─────────────────────────────────────────────────────────
 * ParticipantsRail
 *
 * Layout (top → bottom):
 *   Header:   "Participants (N)"  +  external-link  +  ×
 *   Controls: [Invite people]   search   sort
 *   Section:  ∨ Participants (N)
 *             → participant rows (avatar · name · role · mic)
 *   Footer:   Mute all   Unmute all   ···
 * ───────────────────────────────────────────────────────── */

function MutedMicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="#E53935" strokeWidth="1.5"/>
      <path d="M5 10a7 7 0 0 0 14 0" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 19v3" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="3" x2="21" y2="21" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ActiveMicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="11" rx="3" stroke="#AAAAAA" strokeWidth="1.5"/>
      <path d="M5 10a7 7 0 0 0 14 0" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 19v3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function CiscoAIAvatar() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #0051AF 0%, #0087EA 60%, #00BCEB 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none"/>
        <ellipse cx="23" cy="9" rx="7" ry="7" fill="rgba(255,255,255,0.35)"/>
        <ellipse cx="23" cy="9" rx="4.5" ry="5.5" fill="rgba(116,191,75,0.6)"/>
      </svg>
    </div>
  )
}

function ParticipantRow({ name, role, micOn, isAI }) {
  const [hovered, setHovered] = useState(false)
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px',
        background: hovered ? '#222222' : 'transparent',
        transition: 'background 0.12s',
        cursor: 'default',
      }}
    >
      {/* Avatar */}
      {isAI ? <CiscoAIAvatar /> : (
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#444444', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, color: '#FFFFFF',
        }}>
          {initials}
        </div>
      )}

      {/* Name + role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#FFFFFF', lineHeight: '21px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#666666', lineHeight: '18px' }}>{role}</p>
      </div>

      {/* Mic status — AI has no mic */}
      <div style={{ flexShrink: 0, width: 18 }}>
        {!isAI && (micOn ? <ActiveMicIcon /> : <MutedMicIcon />)}
      </div>
    </div>
  )
}

export function ParticipantsRail({ onClose, profile, micOn }) {
  const [collapsed, setCollapsed] = useState(false)
  const count = 2

  return (
    <div style={{
      width: 371, minWidth: 371, height: 'calc(100% - 8px)',
      margin: '4px 4px 4px 0',
      background: '#1A1A1A',
      borderLeft:   '1px solid #494949',
      borderTop:    '1px solid #494949',
      borderBottom: '1px solid #494949',
      borderRadius: '12px 0 0 12px',
      display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 14px',
        borderBottom: '1px solid #494949',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
          Participants ({count})
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* External link */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M8 4H4a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-4" stroke="#AAAAAA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 2h5v5M16 2L9.5 8.5" stroke="#AAAAAA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Close */}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 12px',
        flexShrink: 0,
      }}>
        {/* Invite pill */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent',
          border: '1px solid #494949',
          borderRadius: 9999,
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="7" r="4" stroke="#FFFFFF" strokeWidth="1.5"/>
            <path d="M2 21v-1a7 7 0 0 1 11.95-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M19 15v6M16 18h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Invite people</span>
        </button>

        {/* Search + Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#AAAAAA" strokeWidth="1.5"/>
              <path d="M17 17L21 21" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M7 3v18M7 21l-3-3M7 21l3-3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 21V3M17 3l-3 3M17 3l3 3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Participant list ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Section header */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', background: 'none', border: 'none',
            padding: '6px 16px 10px', cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M3 5l4 4 4-4" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#888888' }}>
            Participants ({count})
          </span>
        </button>

        {!collapsed && (
          <>
            <ParticipantRow
              name={profile?.name || 'You'}
              role="Host, presenter, me"
              micOn={micOn}
            />
            <ParticipantRow
              name="Cisco AI"
              role="AI Assistant"
              isAI
            />
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid #2A2A2A',
        display: 'flex', alignItems: 'center',
        padding: '14px 20px',
        gap: 24,
      }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>
          Mute all
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>
          Unmute all
        </button>
        <div style={{ flex: 1 }} />
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="5"  cy="12" r="1.5" fill="#AAAAAA"/>
            <circle cx="12" cy="12" r="1.5" fill="#AAAAAA"/>
            <circle cx="19" cy="12" r="1.5" fill="#AAAAAA"/>
          </svg>
        </button>
      </div>

    </div>
  )
}
