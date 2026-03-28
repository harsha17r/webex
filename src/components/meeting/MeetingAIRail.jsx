import { useState } from 'react'

/* ─────────────────────────────────────────────────────────
 * MeetingAIRail
 *
 * Figma ref: node 1434-3370 "MeetingsAiRail"
 * Matches the structure/sizing of CiscoAIRail (home screen)
 * but with meeting-specific header icons and suggestions.
 *
 * Layout (top → bottom):
 *   Header:  "Cisco AI  Assistant" + ⓘ  |  gear · external · ×
 *   Body:    (space) → AI logo → "Try these to get started"
 *            → 4 suggestion chips (last one has gradient border)
 *   Footer:  input + paperclip + blue send  +  disclaimer
 * ───────────────────────────────────────────────────────── */

function CiscoAIIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="mrail-ring" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0051AF"/>
          <stop offset="67%"  stopColor="#0087EA"/>
          <stop offset="100%" stopColor="#00BCEB"/>
        </linearGradient>
        <linearGradient id="mrail-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#0087EA"/>
          <stop offset="84%" stopColor="#63FFF7"/>
        </linearGradient>
        <linearGradient id="mrail-inner" x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="35%"  stopColor="rgba(116,191,75,0)"/>
          <stop offset="96%"  stopColor="#74BF4B"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" stroke="url(#mrail-ring)" strokeWidth="2.5" fill="none"/>
      <ellipse cx="23" cy="9" rx="7" ry="7" fill="url(#mrail-lens)" opacity="0.85"/>
      <ellipse cx="23" cy="9" rx="4.5" ry="5.5" fill="url(#mrail-inner)" opacity="0.9"/>
    </svg>
  )
}

function SuggestionCard({ label, gradient, onSelect }) {
  const [hovered, setHovered] = useState(false)

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(label)}
      style={{
        padding: '13px 16px',
        background: hovered ? '#2A2A2A' : '#1E1E1E',
        border: gradient ? 'none' : '1px solid #383838',
        borderRadius: gradient ? 7 : 8,
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

  if (gradient) {
    return (
      <div style={{
        padding: 1.2,
        background: 'linear-gradient(180deg, #81CF62 0%, #00BCF4 100%)',
        borderRadius: 8,
      }}>
        {inner}
      </div>
    )
  }

  return inner
}

const SUGGESTIONS = [
  { label: 'Catch me up',                gradient: false },
  { label: 'Was my name mentioned?',     gradient: false },
  { label: 'What are the action items?', gradient: false },
  { label: 'What all can Cisco AI do?',  gradient: true  },
]

export function MeetingAIRail({ onClose, summaryActive, onSummaryToggle }) {
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
        {/* Left: title + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF' }}>
            AI Assistant
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#AAAAAA" strokeWidth="1.2"/>
            <path d="M8 7v4" stroke="#AAAAAA" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="8" cy="5.5" r="0.7" fill="#AAAAAA"/>
          </svg>
        </div>

        {/* Right: gear + external link + close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Gear */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="#AAAAAA" strokeWidth="1.3"/>
              <path d="M7.4 2.4l-.4 1.3a5.5 5.5 0 00-1.1.65l-1.3-.43-1.6 1.6.43 1.3c-.27.34-.49.7-.65 1.1L1.4 8.4v2.2l1.33.4c.16.4.38.76.65 1.1l-.43 1.3 1.6 1.6 1.3-.43c.34.27.7.49 1.1.65l.4 1.33h2.2l.4-1.33a5.5 5.5 0 001.1-.65l1.3.43 1.6-1.6-.43-1.3c.27-.34.49-.7.65-1.1l1.33-.4V8.4l-1.33-.4a5.5 5.5 0 00-.65-1.1l.43-1.3-1.6-1.6-1.3.43a5.5 5.5 0 00-1.1-.65L10.6 2.4H7.4z" stroke="#AAAAAA" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* External link */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8 4H4a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-4" stroke="#AAAAAA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 2h5v5M16 2L9.5 8.5" stroke="#AAAAAA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Close */}
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

      {/* ── Body ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        padding: '20px 20px 24px',
        boxSizing: 'border-box',
      }}>

        {/* ── Meeting Summary toggle row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          paddingBottom: 16, marginBottom: 4,
          borderBottom: '1px solid #2A2A2A',
          flexShrink: 0,
        }}>
          {/* Clipboard icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <rect x="8" y="2" width="8" height="4" rx="1.5" stroke="#888888" strokeWidth="1.4"/>
            <path d="M8 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-2" stroke="#888888" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M9 12h6M9 16h4" stroke="#888888" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>

          {/* Label + status */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9', margin: 0 }}>
              Meeting Summary
            </p>
            <p style={{ fontSize: 12, color: '#666666', margin: '2px 0 0' }}>
              {summaryActive ? 'On for everyone' : 'Off'}
            </p>
          </div>

          {/* Toggle switch */}
          <button
            onClick={onSummaryToggle}
            style={{
              flexShrink: 0, background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 38, height: 22, borderRadius: 11,
              background: summaryActive ? '#0073E6' : '#383838',
              position: 'relative',
              transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute',
                top: 3, left: summaryActive ? 19 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#FFFFFF',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>
        </div>

        {/* Spacer pushes AI content to bottom */}
        <div style={{ flex: 1 }} />

        {/* AI logo */}
        <CiscoAIIcon size={48} />

        {/* Label */}
        <p style={{
          fontSize: 14, fontWeight: 500, color: '#E9E9E9',
          margin: '16px 0 16px', lineHeight: '20px',
        }}>
          Try these to get started
        </p>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SUGGESTIONS.map(s => (
            <SuggestionCard
              key={s.label}
              label={s.label}
              gradient={s.gradient}
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
          {/* Send */}
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
