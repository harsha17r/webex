import { useState } from 'react'

/* ─────────────────────────────────────────────────────────
 * ChatRail
 *
 * Layout (top → bottom):
 *   Header:    "Chat"  +  external-link  +  ×
 *   Tabs:      Everyone (selected)  |  Direct
 *   Banner:    Blue info — "Messages to everyone will be saved…"  + × dismiss
 *   Body:      Empty state — "Ready, set, chat 💬"
 *   Footer:    Format + Emoji + GIF + Mention icons
 *              Input: "Write a message to everyone…"  + send →
 * ───────────────────────────────────────────────────────── */

export function ChatRail({ onClose }) {
  const [tab,             setTab]             = useState('everyone')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [message,         setMessage]         = useState('')

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
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>Chat</span>
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

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '10px 12px 10px',
        flexShrink: 0,
      }}>
        {[{ id: 'everyone', label: 'Everyone' }, { id: 'direct', label: 'Direct' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? '#2A2A2A' : 'transparent',
              border: 'none', borderRadius: 9999,
              padding: '7px 16px',
              fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#FFFFFF' : '#888888',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Info Banner ── */}
      {!bannerDismissed && (
        <div style={{
          margin: '0 14px 12px',
          background: 'rgba(0, 122, 255, 0.12)',
          border: '1px solid rgba(0, 122, 255, 0.3)',
          borderRadius: 10,
          padding: '11px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          flexShrink: 0,
        }}>
          {/* Info icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="9" stroke="#4A9EFF" strokeWidth="1.5"/>
            <path d="M12 11v5" stroke="#4A9EFF" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="7.5" r="0.8" fill="#4A9EFF"/>
          </svg>

          <p style={{ margin: 0, flex: 1, fontSize: 13, color: '#8BBCFF', lineHeight: '18px' }}>
            Messages to everyone will be saved after the meeting.
          </p>

          <button
            onClick={() => setBannerDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="#4A9EFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Body — empty state ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 22 }}>💬</p>
        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#FFFFFF', textAlign: 'center', lineHeight: '22px' }}>
          Ready, set, chat
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: '19px' }}>
          Share key points, ask questions, and track action items in real time.
        </p>
      </div>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid #2A2A2A',
        padding: '10px 14px 14px',
      }}>

        {/* Toolbar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 8 }}>
          {/* Text format */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', display: 'flex', alignItems: 'center', borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7V5h16v2" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 5v14m0 0H7m2 0h2" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 12h6" stroke="#888888" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 12v7" stroke="#888888" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Emoji */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', display: 'flex', alignItems: 'center', borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#888888" strokeWidth="1.5"/>
              <path d="M8.5 14.5s1 2 3.5 2 3.5-2 3.5-2" stroke="#888888" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="10" r="1" fill="#888888"/>
              <circle cx="15" cy="10" r="1" fill="#888888"/>
            </svg>
          </button>

          {/* GIF */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', display: 'flex', alignItems: 'center', borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="3" stroke="#888888" strokeWidth="1.5"/>
              <path d="M7.5 14v-4H6v4h1.5zM10 10v4M13 10h3M13 12h2" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* @ Mention */}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', display: 'flex', alignItems: 'center', borderRadius: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="#888888" strokeWidth="1.5"/>
              <path d="M16 12c0 2.2 1 4 3 4s3-2 3-4a10 10 0 1 0-3 7" stroke="#888888" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <div style={{ flex: 1 }} />

          <span style={{ fontSize: 11, color: '#555555', whiteSpace: 'nowrap' }}>
            Shift + Enter for a new line
          </span>
        </div>

        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#222222',
          border: '1px solid #383838',
          borderRadius: 10,
          padding: '9px 10px 9px 14px',
        }}>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={tab === 'everyone' ? 'Write a message to everyone' : 'Write a direct message'}
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              fontSize: 14, color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              caretColor: '#FFFFFF',
            }}
          />

          {/* Send button */}
          <button
            onClick={() => setMessage('')}
            style={{
              background: message.trim() ? '#0051AF' : '#2A2A2A',
              border: 'none',
              borderRadius: 8,
              width: 30, height: 30, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: message.trim() ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>

    </div>
  )
}
