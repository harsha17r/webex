import { useState, useId } from 'react'

/* ─────────────────────────────────────────────────────────
 * CiscoAIRail
 *
 * Empty state layout (top → bottom):
 *   Header:  "Cisco AI assistant" + refresh + close
 *   Body:    icon → "Welcome to Cisco AI" → subtitle
 *            → "Try asking me..." → 4 suggestion cards
 *   Footer:  input (placeholder + paperclip + blue send)
 *            + disclaimer
 * ───────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  'How do I set up my profile?',
  'How do I set up my notifications?',
  'What is custom status?',
  'What can you help me with?',
]

export function CiscoAIIcon({ size = 56 }) {
  const uid = useId().replace(/:/g, '')
  const ring = `${uid}-rail-ring`
  const lens = `${uid}-rail-lens`
  const inner = `${uid}-rail-m`

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id={ring} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0051AF"/>
          <stop offset="67%"  stopColor="#0087EA"/>
          <stop offset="100%" stopColor="#00BCEB"/>
        </linearGradient>
        <linearGradient id={lens} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#0087EA"/>
          <stop offset="84%" stopColor="#63FFF7"/>
        </linearGradient>
        <linearGradient id={inner} x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="35%"  stopColor="rgba(116,191,75,0)"/>
          <stop offset="96%"  stopColor="#74BF4B"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" stroke={`url(#${ring})`} strokeWidth="2.5" fill="none"/>
      <ellipse cx="23" cy="9" rx="7" ry="7" fill={`url(#${lens})`} opacity="0.85"/>
      <ellipse cx="23" cy="9" rx="4.5" ry="5.5" fill={`url(#${inner})`} opacity="0.9"/>
    </svg>
  )
}

function SuggestionCard({ label, onSelect }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(label)}
      style={{
        padding: '13px 16px',
        background: hovered ? '#2A2A2A' : '#1E1E1E',
        border: '1px solid #383838',
        borderRadius: 8,
        fontSize: 14, fontWeight: 400,
        color: '#FFFFFF',
        cursor: 'pointer',
        transition: 'background 0.12s',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: '20px',
      }}
    >
      {label}
    </div>
  )
}

export function CiscoAIRail({ onClose }) {
  const [query, setQuery] = useState('')

  return (
    <div style={{
      width: 371, minWidth: 371, height: 'calc(100% - 8px)',
      margin: '4px 4px 4px 0',
      background: '#1A1A1A',
      borderLeft: '1px solid #494949',
      borderTop: '1px solid #494949',
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
        <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
          Cisco AI assistant
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2.5 9A6.5 6.5 0 0 1 9 2.5c2.2 0 4.1 1.1 5.3 2.7M15.5 9A6.5 6.5 0 0 1 9 15.5c-2.2 0-4.1-1.1-5.3-2.7"
                stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M13 2l2.3 3.2L12 5.5" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 15.5l-2.3-3.2L6 11.5" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Chat area — empty state ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 24px',
        boxSizing: 'border-box',
        gap: 0,
      }}>

        {/* Icon */}
        <CiscoAIIcon size={56} />

        {/* Welcome heading */}
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: '#FFFFFF',
          margin: '20px 0 10px', textAlign: 'center', lineHeight: '30px',
        }}>
          Welcome to Cisco AI
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: 14, fontWeight: 400, color: '#AAAAAA',
          margin: 0, textAlign: 'center', lineHeight: '22px',
          maxWidth: 280,
        }}>
          I am here to help you get started with Webex and answer your questions.
        </p>

        {/* Suggestions section */}
        <div style={{
          alignSelf: 'stretch',
          marginTop: 40,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 500, color: '#888888',
            marginBottom: 4,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Try asking me...
          </span>
          {SUGGESTIONS.map(s => (
            <SuggestionCard
              key={s}
              label={s}
              onSelect={label => setQuery(label)}
            />
          ))}
        </div>

      </div>

      {/* ── Footer — input ── */}
      <div style={{
        padding: '12px 10px 16px',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}>
        <div style={{
          background: '#222222',
          borderRadius: 10,
          height: 52,
          display: 'flex', alignItems: 'center',
          paddingLeft: 16, paddingRight: 8, gap: 8,
          boxSizing: 'border-box',
        }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter your query"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              fontSize: 14, fontWeight: 400,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: '#FFFFFF', caretColor: '#FFFFFF',
            }}
          />
          {/* Paperclip */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15 8L8.5 14.5C7 16 4.5 16 3 14.5C1.5 13 1.5 10.5 3 9L10 2C11 1 12.5 1 13.5 2C14.5 3 14.5 4.5 13.5 5.5L6.5 12.5C6 13 5 13 4.5 12.5C4 12 4 11 4.5 10.5L11 4"
                stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Send — always blue */}
          <button
            onClick={() => setQuery('')}
            style={{
              background: '#0073E6',
              border: 'none', borderRadius: 8,
              width: 34, height: 34, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <p style={{
          fontSize: 12, fontWeight: 400, color: '#666666',
          textAlign: 'center',
          margin: '8px 0 0',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Cisco AI can make mistakes, double-check responses.
        </p>
      </div>

    </div>
  )
}
