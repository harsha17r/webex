import { useState, useEffect, useRef } from 'react'
import { CiscoAIIcon } from '../layout/CiscoAIRail'

/* ─────────────────────────────────────────────────────────
 * MeetingAIRail
 *
 * Figma ref: node 1434-3370 "MeetingsAiRail"
 * Matches the structure/sizing of CiscoAIRail (home screen)
 * but with meeting-specific header icons and suggestions.
 *
 * Layout (top → bottom):
 *   Header:  "AI Assistant" + ⓘ  |  gear · external · ×
 *   Body:    Meeting Summary control (idle/active/paused/confirming)
 *            → spacer → AI logo → "Try these to get started"
 *            → 4 suggestion chips (last one has gradient border)
 *   Footer:  input + paperclip + blue send + disclaimer
 * ───────────────────────────────────────────────────────── */

export function SummaryIcon({ size = 20, color = '#FFFFFF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10">
      <path d="M16 3h2.6A2.4 2.4 0 0 1 21 5.4v15.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 20.6V5.4A2.4 2.4 0 0 1 5.4 3H8M7 13h4m-4-3h10M7 16h2M8.8 1h6.4a.8.8 0 0 1 .8.8v2.4a.8.8 0 0 1-.8.8H8.8a.8.8 0 0 1-.8-.8V1.8a.8.8 0 0 1 .8-.8m5.506 12.776l-.377 1.508a.2.2 0 0 1-.145.145l-1.508.377c-.202.05-.202.338 0 .388l1.508.377a.2.2 0 0 1 .145.145l.377 1.508c.05.202.338.202.388 0l.377-1.508a.2.2 0 0 1 .145-.145l1.508-.377c.202-.05.202-.337 0-.388l-1.508-.377a.2.2 0 0 1-.145-.145l-.377-1.508c-.05-.202-.338-.202-.388 0"/>
    </svg>
  )
}

function SummaryWritingIcon({ size = 20, color = '#FFFFFF' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="10"
      aria-hidden
    >
      <path d="M16 3h2.6A2.4 2.4 0 0 1 21 5.4v15.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 20.6V5.4A2.4 2.4 0 0 1 5.4 3H8" />
      <path d="M8.8 1h6.4a.8.8 0 0 1 .8.8v2.4a.8.8 0 0 1-.8.8H8.8a.8.8 0 0 1-.8-.8V1.8a.8.8 0 0 1 .8-.8" />

      {/* Stepped "writing" effect: line1 -> line2 -> line3 -> clear */}
      <path
        d="M7 9h9"
        style={{
          strokeDasharray: 9,
          strokeDashoffset: 9,
          animation: 'summary-line-step-1 2.8s steps(1, end) infinite',
        }}
      />
      <path
        d="M7 12h7"
        style={{
          strokeDasharray: 7,
          strokeDashoffset: 7,
          animation: 'summary-line-step-2 2.8s steps(1, end) infinite',
        }}
      />
      <path
        d="M7 15h5"
        style={{
          strokeDasharray: 5,
          strokeDashoffset: 5,
          animation: 'summary-line-step-3 2.8s steps(1, end) infinite',
        }}
      />
    </svg>
  )
}

const GRADIENT_BORDER =
  'linear-gradient(90deg, #5A8E52 0%, #2D5D45 28%, #1A4A5A 58%, #2A2A2A 100%)'

function SuggestionCard({ label, gradient, onSelect }) {
  const [hovered, setHovered] = useState(false)

  const innerStyle = {
    padding: '13px 16px',
    background: hovered ? '#313131' : '#242424',
    borderRadius: gradient ? 7 : 8,
    fontSize: 14,
    fontWeight: 400,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'background 0.12s',
    fontFamily: "'Inter', system-ui, sans-serif",
    lineHeight: '20px',
  }

  if (gradient) {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(label)}
        style={{
          padding: 1,
          borderRadius: 8,
          background: GRADIENT_BORDER,
          cursor: 'pointer',
        }}
      >
        <div style={innerStyle}>{label}</div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(label)}
      style={innerStyle}
    >
      {label}
    </div>
  )
}

const SUGGESTIONS = [
  { label: 'Catch me up',                gradient: false },
  { label: 'Was my name mentioned?',     gradient: false },
  { label: 'What are the action items?', gradient: false },
  { label: 'What can I do with Cisco AI?',  gradient: true  },
]

/* ── Helpers ── */

const KEYFRAMES = `
  @keyframes summary-line-step-1 {
    0% { stroke-dashoffset: 9; }
    20% { stroke-dashoffset: 0; }
    95% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 9; }
  }
  @keyframes summary-line-step-2 {
    0%, 20% { stroke-dashoffset: 7; }
    45% { stroke-dashoffset: 0; }
    95% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 7; }
  }
  @keyframes summary-line-step-3 {
    0%, 45% { stroke-dashoffset: 5; }
    70% { stroke-dashoffset: 0; }
    95% { stroke-dashoffset: 0; }
    100% { stroke-dashoffset: 5; }
  }
  @keyframes summary-slide-down {
    from { opacity: 0; transform: translateY(-5px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
`

/* ── State indicator (left icon area) ── */

function SummaryStateIndicator({ displayState }) {
  if (displayState === 'active') {
    return (
      <div style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: 8,
        background: '#242424',
        border: '1px solid #3A3A3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <SummaryWritingIcon size={20} color="#F1F1F1" />
      </div>
    )
  }

  if (displayState === 'paused') {
    return (
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        borderRadius: '50%',
        background: '#2C2C2C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
          <rect x="0"   y="0" width="4" height="13" rx="1.5" fill="#CFCFCF"/>
          <rect x="7"   y="0" width="4" height="13" rx="1.5" fill="#CFCFCF"/>
        </svg>
      </div>
    )
  }

  /* idle */
  return (
    <div style={{
      width: 36, height: 36, flexShrink: 0,
      borderRadius: '50%',
      background: '#272727',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <SummaryIcon size={18} color="#777777" />
    </div>
  )
}

/* ── Main control row ── */

function SummaryControlRow({ displayState, elapsed, onStart, onPause, onResume, onStopRequest }) {
  const [stopHover, setStopHover] = useState(false)
  const [dotCount, setDotCount] = useState(0)

  useEffect(() => {
    if (displayState !== 'active') {
      setDotCount(0)
      return undefined
    }
    const id = setInterval(() => {
      setDotCount(prev => (prev >= 3 ? 0 : prev + 1))
    }, 700)
    return () => clearInterval(id)
  }, [displayState])

  const TITLES = {
    idle:   'Meeting summary',
    active: 'Summary in progress',
    paused: 'Summary paused',
  }
  const SUBTITLES = {
    idle: 'Off',
    active: 'Transcribing...',
    paused: 'Not listening',
  }
  const SUBTITLE_COLORS = {
    idle: '#8A8A8A',
    active: '#CFCFCF',
    paused: '#AFAFAF',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <SummaryStateIndicator displayState={displayState} />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', margin: 0, lineHeight: '18px' }}>
          {TITLES[displayState]}
        </p>
        {displayState && (
          <p style={{
            fontSize: 12, color: SUBTITLE_COLORS[displayState],
            margin: '2px 0 0', lineHeight: '16px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {displayState === 'active'
              ? `Transcribing${'.'.repeat(dotCount)}`
              : SUBTITLES[displayState]}
          </p>
        )}
      </div>

      {/* Idle → single Start button */}
      {displayState === 'idle' && (
        <button onClick={onStart} style={{
          background: '#FFFFFF', border: 'none', borderRadius: 6,
          color: '#111111', fontSize: 13, fontWeight: 500,
          padding: '6px 14px', cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}>
          Start
        </button>
      )}

      {/* Active / Paused → Pause|Resume + Stop */}
      {(displayState === 'active' || displayState === 'paused') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Pause button (active state) */}
          {displayState === 'active' && (
            <button onClick={onPause} style={{
              background: 'transparent',
              border: '1px solid #FFFFFF',
              borderRadius: 6,
              color: '#FFFFFF',
              fontSize: 12, fontWeight: 500,
              padding: '5px 10px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: "'Inter', system-ui, sans-serif",
              flexShrink: 0,
            }}>
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
                <rect width="3.2" height="11" rx="1" fill="#FFFFFF"/>
                <rect x="5.8" width="3.2" height="11" rx="1" fill="#FFFFFF"/>
              </svg>
              Pause
            </button>
          )}

          {/* Resume button (paused state) */}
          {displayState === 'paused' && (
            <button onClick={onResume} style={{
              background: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              color: '#111111',
              fontSize: 12, fontWeight: 500,
              padding: '5px 10px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: "'Inter', system-ui, sans-serif",
              flexShrink: 0,
            }}>
              <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
                <path d="M1.5 1.2L9 5.5L1.5 9.8V1.2Z" fill="#111111"/>
              </svg>
              Resume
            </button>
          )}

          {/* Stop icon-only button */}
          <button onClick={onStopRequest} style={{
            background: stopHover ? '#353535' : '#2B2B2B',
            border: '1px solid #454545',
            borderRadius: 6,
            width: 30, height: 30,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.12s, border-color 0.12s',
          }}
            onMouseEnter={() => setStopHover(true)}
            onMouseLeave={() => setStopHover(false)}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="0.5" y="0.5" width="10" height="10" rx="2" fill="#EF4444"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Inline stop-confirmation banner ── */

function StopConfirmBanner({ onConfirm }) {
  const [hover, setHover] = useState(false)
  return (
    <div style={{
      position: 'absolute',
      top: 50,
      right: 0,
      width: 220,
      background: '#1E1E1E',
      border: '1px solid #383838',
      borderRadius: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
      padding: 8,
      zIndex: 12,
      animation: 'summary-slide-down 0.18s ease-out',
    }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -6,
          right: 12,
          width: 10,
          height: 10,
          background: '#1E1E1E',
          borderTop: '1px solid #383838',
          borderLeft: '1px solid #383838',
          transform: 'rotate(45deg)',
        }}
      />
      <button
        type="button"
        onClick={onConfirm}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textAlign: 'left',
          background: hover ? '#2A2A2A' : 'transparent',
          border: 'none',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: '#E7E7E7',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 11 11" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="10" height="10" rx="2" fill="#EF4444" />
        </svg>
        Stop summarising
      </button>
    </div>
  )
}

/* ── Root component ── */

export function MeetingAIRail({ onClose, onSummaryChange, autoStart = false }) {
  const [query, setQuery]                   = useState('')
  const [summaryState, setSummaryState]     = useState(autoStart ? 'active' : 'idle') // 'idle' | 'active' | 'paused' | 'confirming'
  const [elapsed, setElapsed]               = useState(0)
  const [preConfirmState, setPreConfirmState] = useState(null)
  const intervalRef                         = useRef(null)

  /* Timer — ticks only while active */
  useEffect(() => {
    if (summaryState === 'active') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [summaryState])

  // Keep external "Turn on AI" actions in sync even if the rail is already mounted.
  useEffect(() => {
    if (!autoStart || summaryState !== 'idle') return
    setSummaryState('active')
    onSummaryChange?.(true)
  }, [autoStart, summaryState, onSummaryChange])

  const handleStart = () => {
    setSummaryState('active')
    onSummaryChange?.(true)
  }

  const handlePause = () => setSummaryState('paused')

  const handleResume = () => setSummaryState('active')

  const handleStopRequest = () => {
    if (summaryState === 'confirming') {
      setSummaryState(preConfirmState)
      setPreConfirmState(null)
      return
    }
    setPreConfirmState(summaryState)
    setSummaryState('confirming')
  }

  const handleConfirmStop = () => {
    clearInterval(intervalRef.current)
    setSummaryState('idle')
    setElapsed(0)
    setPreConfirmState(null)
    onSummaryChange?.(false)
  }

  /* While confirming, keep showing the pre-confirm state's visuals */
  const displayState = summaryState === 'confirming' ? preConfirmState : summaryState

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
      <style>{KEYFRAMES}</style>

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
        overflowX: 'visible',
      }}>

        {/* ── Meeting Summary control ── */}
        <div style={{
          position: 'relative',
          paddingBottom: 16, marginBottom: 4,
          borderBottom: '1px solid #2A2A2A',
          flexShrink: 0,
          overflow: 'visible',
        }}>
          <SummaryControlRow
            displayState={displayState}
            elapsed={elapsed}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStopRequest={handleStopRequest}
          />

          {summaryState === 'confirming' && (
            <StopConfirmBanner
              onConfirm={handleConfirmStop}
            />
          )}
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
            placeholder="Ask me anything about this meeting"
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
              background: '#F1F1F1',
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
          fontSize: 12, fontWeight: 400, color: '#999999',
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
