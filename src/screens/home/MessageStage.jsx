import { useState, useRef, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────
 * Carousel layout:
 *   - Image: 4:3 aspect ratio, full card width, dominant
 *   - Current card fills most of container, next card peeks
 *   - Arrows centered vertically on the card (not below)
 *   - ResizeObserver keeps pixel math accurate on resize
 * ───────────────────────────────────────────────────────── */

const PEEK = 52
const GAP  = 14

const SLIDES = [
  {
    key: 'spaces',
    title: 'Create a Space',
    description: 'Bring your team together in a shared space. Invite anyone with an email.',
  },
  {
    key: 'messaging',
    title: 'Thread and React',
    description: 'Reply in threads, pin messages, and react. Conversations stay clean.',
  },
  {
    key: 'files',
    title: 'Share Files Instantly',
    description: 'Drop files into any conversation. Co-edit with your team in real time.',
  },
  {
    key: 'ai',
    title: 'AI Catches You Up',
    description: 'Missed a thread? Cisco AI summarizes it so you are always in the loop.',
  },
  {
    key: 'integrations',
    title: 'Apps You Already Use',
    description: 'Connect Salesforce, Google, Microsoft and 100 more without leaving Webex.',
  },
]

function ActionButton({ icon, label }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        height: 48, padding: '0 28px',
        background: pressed ? '#2A2A2A' : hovered ? '#1E1E1E' : 'transparent',
        border: `1px solid ${hovered ? '#555555' : '#333333'}`,
        borderRadius: 8,
        fontSize: 14, fontWeight: 500,
        color: hovered ? '#DDDDDD' : '#888888',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function NewMessageView({ onClose }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#1A1A1A',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Title + Cancel */}
      <div style={{ padding: '20px 24px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
          New message
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 6, borderRadius: 6,
            color: '#777777',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="#777777" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* To field */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 24px 14px',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, color: '#888888', flexShrink: 0 }}>To:</span>
        <input
          autoFocus
          placeholder="Add people name or email"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#2A2A2A', flexShrink: 0 }} />

      {/* Empty body area */}
      <div style={{ flex: 1 }} />

      {/* Compose box */}
      <div style={{
        margin: '0 16px 16px',
        border: '1px solid #2E2E2E',
        borderRadius: 12,
        background: '#1E1E1E',
        flexShrink: 0,
      }}>
        {/* Icon toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px 8px',
          borderBottom: '1px solid #2A2A2A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Attachment */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M16.5 10.5l-6.5 6.5a4.5 4.5 0 0 1-6.4-6.3L10 4a3 3 0 0 1 4.2 4.2L8 14.5a1.5 1.5 0 0 1-2.1-2.1L12 6" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* File/loop */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="10" height="13" rx="2" stroke="#666" strokeWidth="1.4"/><path d="M7 3v13M13 7h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3" stroke="#666" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            {/* Tt text format */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M10 5v11M7 16h6" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Emoji */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#666" strokeWidth="1.4"/><circle cx="7.5" cy="8.5" r="1" fill="#666"/><circle cx="12.5" cy="8.5" r="1" fill="#666"/><path d="M7 12.5c.8 1.5 6 1.5 6 0" stroke="#666" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            {/* Image */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#666" strokeWidth="1.4"/><circle cx="7" cy="8.5" r="1.5" fill="#666"/><path d="M2.5 14l4-4 3 3 2.5-2.5 4 4" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* GIF */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="#666" strokeWidth="1.4"/><text x="4.5" y="13.5" fontSize="6" fontWeight="700" fill="#666" fontFamily="sans-serif">GIF</text></svg>
            </button>
            {/* @ mention */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="#666" strokeWidth="1.4"/><path d="M13 10c0 3 5 3 5 0a8 8 0 1 0-5 7.4" stroke="#666" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            {/* Shield/security */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L3.5 5v5c0 3.8 2.8 7.3 6.5 8 3.7-.7 6.5-4.2 6.5-8V5L10 2.5z" stroke="#666" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <span style={{ fontSize: 12, color: '#737373', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Shift + Enter for a new line
          </span>
        </div>

        {/* Message input + send */}
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '14px 14px 16px', gap: 10, minHeight: 60 }}>
          <div style={{ flex: 1, fontSize: 14, color: '#999999', lineHeight: '22px', fontFamily: "'Inter', system-ui, sans-serif", cursor: 'text' }}>
            Write a message
          </div>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 4, flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M11 5l4 4-4 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function RecommendedMessagesView() {
  const [on, setOn] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      background: '#1A1A1A',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '20px 24px 16px',
        borderBottom: '1px solid #2A2A2A',
        flexShrink: 0,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: '#1170CF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#92CBF2" d="M14.604 2.76a20.5 20.5 0 0 0-4.637 0l-1.595.182a.5.5 0 0 0-.441.453l-.123 1.382a39.5 39.5 0 0 0 0 6.983l.123 1.382a.5.5 0 0 0 .498.456H10.5V21a.5.5 0 0 0 .89.312l.391-.49a35.5 35.5 0 0 0 5.497-9.676l.19-.507A.5.5 0 0 0 17 9.963h-2.713l2.325-6.352a.5.5 0 0 0-.413-.669z"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: '0 0 2px', lineHeight: '22px' }}>
            Recommended messages
          </h2>
          <p style={{ fontSize: 13, color: '#777777', margin: 0, lineHeight: '18px' }}>
            This section shows your most important conversations in the noise.
          </p>
        </div>
      </div>

      {/* Center empty state */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 40px',
        textAlign: 'center',
        gap: 0,
      }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#242424',
          border: '1px solid #333333',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a8 8 0 1 1-3.6 15.1L5 18l.9-3.4A8 8 0 0 1 12 2z" stroke="#555555" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 12h6M9 9h4" stroke="#555555" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px', lineHeight: '22px' }}>
          Recommended messages are {on ? 'on' : 'off'}
        </h3>
        <p style={{ fontSize: 14, color: '#666666', margin: '0 0 8px', lineHeight: '20px', maxWidth: 360 }}>
          {on
            ? "You're all set. Your most important messages will appear here as you use Webex."
            : "Your inbox gets smarter over time. Messages you care about will surface here first."}
        </p>
        <a
          href="https://help.webex.com/en-us/article/6x82v0/Webex-App-%7C-Recommended-messages#reference-template_d027c4ef-f23f-4bb3-811a-92ff2b018a11"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 13, color: '#3B9EFF', margin: '0 0 24px', lineHeight: '20px', textDecoration: 'none' }}
        >
          Learn more about this feature
        </a>

        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={() => setOn(o => !o)}
          style={{
            height: 36, padding: '0 20px',
            background: on
              ? (btnHovered ? '#E5E5E5' : '#FFFFFF')
              : (btnHovered ? '#E5E5E5' : '#FFFFFF'),
            border: 'none',
            borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            color: '#111111',
            cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'background 0.15s',
          }}
        >
          {on ? 'Turn off' : 'Turn on'}
        </button>
      </div>

      {/* Bottom privacy note */}
      <div style={{
        padding: '0 24px 20px',
        flexShrink: 0,
        textAlign: 'center',
        fontSize: 12,
        color: '#555555',
        lineHeight: '18px',
      }}>
        All your data stays encrypted.{' '}
        <span style={{ color: '#3B9EFF', cursor: 'pointer' }}>Learn more</span>
      </div>
    </div>
  )
}

/** Meet button — brand green */
const WELCOME_SPACE_MEET_BG = '#1D8160'
const WELCOME_SPACE_STAR = '#E8A317'
const WELCOME_SPACE_SCHEDULE_BTN_BG = '#404040'
const WELCOME_SPACE_TRAY_ICON = '#A3A3A3'
const WELCOME_SPACE_CHIP_SELECTED_BG = '#3A3A3A'
const WELCOME_SPACE_MEET_HOVER = '#239872'
const WELCOME_SPACE_SCHEDULE_HOVER_BG = '#4A4A4A'
const WELCOME_SPACE_SCHEDULE_HOVER_BORDER = '#5C5C5C'
const WELCOME_SPACE_CHIP_HOVER_SELECTED = '#484848'
const WELCOME_SPACE_CHIP_HOVER_MUTED = 'rgba(255,255,255,0.08)'

/** Full space thread chrome — reference header, pill chips, tray icons */
function WelcomeSpaceChatView() {
  const [spaceTab, setSpaceTab] = useState('messages')
  const [welcomeHover, setWelcomeHover] = useState(null)

  const tabs = [
    { key: 'messages', label: 'Messages' },
    { key: 'people', label: 'People (1)' },
    { key: 'content', label: 'Content' },
    { key: 'meetings', label: 'Meetings' },
    { key: 'apps', label: '+ Apps' },
  ]

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#1A1A1A',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
      minWidth: 0,
    }}>
      {/* Title row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 22px 12px',
        borderBottom: '1px solid #2A2A2A',
        flexShrink: 0, gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <h1 style={{
            fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            Welcome Space
          </h1>
          <button type="button" aria-label="Favorite space" onMouseEnter={() => setWelcomeHover('star')} onMouseLeave={() => setWelcomeHover(null)} style={{
            background: welcomeHover === 'star' ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8,
            display: 'flex', alignItems: 'center', flexShrink: 0,
            transition: 'background 0.12s ease',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                stroke={WELCOME_SPACE_STAR}
                strokeWidth="1.65"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            aria-label="Schedule a meeting"
            onMouseEnter={() => setWelcomeHover('schedule')}
            onMouseLeave={() => setWelcomeHover(null)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              border: `1px solid ${welcomeHover === 'schedule' ? WELCOME_SPACE_SCHEDULE_HOVER_BORDER : '#4F4F4F'}`,
              cursor: 'pointer',
              background: welcomeHover === 'schedule' ? WELCOME_SPACE_SCHEDULE_HOVER_BG : WELCOME_SPACE_SCHEDULE_BTN_BG,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, flexShrink: 0,
              transition: 'background 0.12s ease, border-color 0.12s ease',
            }}
          >
            {/* tabler:calendar-plus */}
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" aria-hidden style={{ color: '#FFFFFF' }}>
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.5 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5m-4-9v4M8 3v4m-4 4h16m-4 8h6m-3-3v6" />
            </svg>
          </button>
          <button type="button" onMouseEnter={() => setWelcomeHover('meet')} onMouseLeave={() => setWelcomeHover(null)} style={{
            height: 36, padding: '0 18px', borderRadius: 9999, border: 'none', cursor: 'pointer',
            background: welcomeHover === 'meet' ? WELCOME_SPACE_MEET_HOVER : WELCOME_SPACE_MEET_BG,
            color: '#FFFFFF', fontSize: 13, fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'background 0.12s ease',
          }}>
            Meet
          </button>
        </div>
      </div>

      {/* Pills + tray utilities */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        padding: '10px 20px 12px',
        borderBottom: '1px solid #2A2A2A',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          flex: 1, minWidth: 0, overflowX: 'auto',
        }}>
          {tabs.map(t => {
            const selected = spaceTab === t.key
            const chipHot = welcomeHover === `chip:${t.key}`
            const chipBg = selected
              ? (chipHot ? WELCOME_SPACE_CHIP_HOVER_SELECTED : WELCOME_SPACE_CHIP_SELECTED_BG)
              : (chipHot ? WELCOME_SPACE_CHIP_HOVER_MUTED : 'transparent')
            const chipColor = selected
              ? '#FFFFFF'
              : (chipHot ? '#B8B8B8' : '#8E8E8E')
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSpaceTab(t.key)}
                onMouseEnter={() => setWelcomeHover(`chip:${t.key}`)}
                onMouseLeave={() => setWelcomeHover(null)}
                style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer', flexShrink: 0,
                  borderRadius: 9999,
                  fontSize: 13, fontWeight: selected ? 600 : 500,
                  color: chipColor,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  background: chipBg,
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button type="button" aria-label="Pin space" onMouseEnter={() => setWelcomeHover('pin')} onMouseLeave={() => setWelcomeHover(null)} style={{
            background: welcomeHover === 'pin' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: welcomeHover === 'pin' ? '#C8C8C8' : WELCOME_SPACE_TRAY_ICON,
            transition: 'background 0.12s ease, color 0.12s ease',
          }}>
            {/* ph:push-pin-bold */}
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 256 256" aria-hidden>
              <path fill="currentColor" d="m238.15 78.54l-60.69-60.68a20 20 0 0 0-28.3 0L97.2 70c-12.43-3.33-36.68-5.72-61.74 14.5a20 20 0 0 0-1.6 29.73l45.46 45.47l-39.8 39.8a12 12 0 0 0 17 17l39.8-39.81l45.47 45.46a20 20 0 0 0 14.12 5.85c.46 0 .93 0 1.4-.05a20 20 0 0 0 14.56-7.95c4.69-6.23 11-16.13 14.44-28s3.45-22.88.16-33.4l51.7-51.87a20 20 0 0 0-.02-28.19m-74.26 68.79a12 12 0 0 0-2.23 13.84c3.43 6.86 6.9 21-6.28 40.65L54.08 100.53c21.09-14.59 39.53-6.64 41-6a11.67 11.67 0 0 0 13.81-2.29l54.43-54.61l55 55Z" />
            </svg>
          </button>
          <button type="button" aria-label="Search" onMouseEnter={() => setWelcomeHover('search')} onMouseLeave={() => setWelcomeHover(null)} style={{
            background: welcomeHover === 'search' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: welcomeHover === 'search' ? '#C8C8C8' : WELCOME_SPACE_TRAY_ICON,
            transition: 'background 0.12s ease, color 0.12s ease',
          }}>
            {/* stash:search-solid */}
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" fillRule="evenodd" d="M10.44 2.75a7.69 7.69 0 1 0 4.615 13.842c.058.17.154.329.29.464l3.84 3.84a1.21 1.21 0 0 0 1.71-1.712l-3.84-3.84a1.2 1.2 0 0 0-.463-.289A7.69 7.69 0 0 0 10.44 2.75m-5.75 7.69a5.75 5.75 0 0 1 11.5 0a5.75 5.75 0 0 1-11.5 0" clipRule="evenodd" />
            </svg>
          </button>
          <button type="button" aria-label="Space settings" onMouseEnter={() => setWelcomeHover('settings')} onMouseLeave={() => setWelcomeHover(null)} style={{
            background: welcomeHover === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: welcomeHover === 'settings' ? '#C8C8C8' : WELCOME_SPACE_TRAY_ICON,
            transition: 'background 0.12s ease, color 0.12s ease',
          }}>
            {/* mingcute:settings-3-line */}
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
              <g fill="none" fillRule="evenodd">
                <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                <path fill="currentColor" d="M14.035 2.809c.37-.266.89-.39 1.401-.203a10 10 0 0 1 2.982 1.725c.417.35.57.861.524 1.313c-.075.753.057 1.48.42 2.106c.32.557.802.997 1.39 1.307l.225.11c.414.187.782.576.875 1.113a10 10 0 0 1 0 3.44c-.083.484-.39.847-.753 1.051l-.122.063c-.69.31-1.254.79-1.616 1.416c-.362.627-.494 1.353-.419 2.106c.045.452-.107.964-.524 1.313a10 10 0 0 1-2.982 1.725a1.51 1.51 0 0 1-1.4-.203C13.42 20.75 12.723 20.5 12 20.5s-1.42.249-2.035.691a1.51 1.51 0 0 1-1.401.203a10 10 0 0 1-2.982-1.725a1.51 1.51 0 0 1-.524-1.313c.075-.753-.058-1.48-.42-2.106a3.4 3.4 0 0 0-1.39-1.307l-.225-.11a1.51 1.51 0 0 1-.875-1.113a10 10 0 0 1 0-3.44c.083-.484.39-.847.753-1.051l.122-.062c.69-.311 1.254-.79 1.616-1.417c.361-.626.494-1.353.419-2.106a1.51 1.51 0 0 1 .524-1.313a10 10 0 0 1 2.982-1.725a1.51 1.51 0 0 1 1.4.203c.615.442 1.312.691 2.036.691s1.42-.249 2.035-.691m.957 1.769c-.866.57-1.887.922-2.992.922s-2.126-.353-2.992-.922A8 8 0 0 0 7.068 5.7c.06 1.033-.145 2.093-.697 3.05c-.553.956-1.368 1.663-2.293 2.128a8 8 0 0 0 0 2.242c.925.465 1.74 1.172 2.293 2.13c.552.955.757 2.015.697 3.048a8 8 0 0 0 1.94 1.123c.866-.57 1.887-.922 2.992-.922s2.126.353 2.992.922a8 8 0 0 0 1.94-1.122c-.06-1.034.145-2.094.697-3.05c.552-.957 1.368-1.664 2.293-2.13a8 8 0 0 0 0-2.24c-.925-.466-1.74-1.173-2.293-2.13c-.552-.956-.757-2.016-.697-3.05a8 8 0 0 0-1.94-1.122ZM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8m0 2a2 2 0 1 0 0 4a2 2 0 0 0 0-4" />
              </g>
            </svg>
          </button>
        </div>
      </div>

      {/* Thread */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 24px 24px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {spaceTab === 'messages' && (
          <>
            <p style={{
              textAlign: 'center', fontSize: 12, color: '#6B7280', margin: 0, lineHeight: '18px',
            }}>
              This starts the &quot;Welcome Space&quot; space. 9/24/25, 10:42 PM
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: 720 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: '#1170CF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#FFFFFF',
              }}>
                Y
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>You</span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>10:42 PM</span>
                </div>
                <div style={{
                  background: '#222222', border: '1px solid #333333', borderRadius: 12,
                  overflow: 'hidden', marginBottom: 12, maxWidth: 420,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderBottom: '1px solid #2E2E2E',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: '#1A1A1A', border: '1px solid #333',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#3B9EFF' }}>WX</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px', lineHeight: '18px' }}>
                        Webex Help Center
                      </p>
                      <p style={{
                        fontSize: 12, color: '#9CA3AF', margin: 0,
                        lineHeight: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        Cisco Webex is the industry leader in video conferencing and team collaboration…
                      </p>
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: 14, color: '#E5E5E5', margin: 0, lineHeight: '22px', whiteSpace: 'pre-wrap',
                }}>
                  👋 Welcome to Webex! But, more importantly, welcome to where you&apos;ll do the best work ever. In Spaces, you can send messages, share files, set up meetings, and even meet instantly with other people in the space. Pretty cool, right? Try sending a few practice messages, GIFs or files — you can even edit, react and reply to messages. Have some fun! If you&apos;re looking for more, visit{' '}
                  <span style={{ color: '#3B9EFF' }}>https://help.webex.com</span>
                  {' '}or join the Webex Community.
                </p>
              </div>
            </div>
          </>
        )}
        {spaceTab !== 'messages' && (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#555555', fontSize: 14,
          }}>
            {tabs.find(t => t.key === spaceTab)?.label} — coming soon
          </div>
        )}
      </div>

      {/* Composer */}
      <div style={{
        borderTop: '1px solid #2A2A2A',
        padding: '12px 20px 16px',
        flexShrink: 0,
        background: '#1A1A1A',
      }}>
        <div style={{
          border: '1px solid #2E2E2E', borderRadius: 12, background: '#1E1E1E',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px 6px', borderBottom: '1px solid #2A2A2A',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M16.5 10.5l-6.5 6.5a4.5 4.5 0 0 1-6.4-6.3L10 4a3 3 0 0 1 4.2 4.2L8 14.5a1.5 1.5 0 0 1-2.1-2.1L12 6" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="10" height="13" rx="2" stroke="#666" strokeWidth="1.4"/><path d="M7 3v13M13 7h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-3" stroke="#666" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M10 5v11M7 16h6" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#666" strokeWidth="1.4"/><circle cx="7.5" cy="8.5" r="1" fill="#666"/><circle cx="12.5" cy="8.5" r="1" fill="#666"/><path d="M7 12.5c.8 1.5 6 1.5 6 0" stroke="#666" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#666" strokeWidth="1.4"/><circle cx="7" cy="8.5" r="1.5" fill="#666"/><path d="M2.5 14l4-4 3 3 2.5-2.5 4 4" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="#666" strokeWidth="1.4"/><text x="4.5" y="13.5" fontSize="6" fontWeight="700" fill="#666" fontFamily="sans-serif">GIF</text></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="#666" strokeWidth="1.4"/><path d="M13 10c0 3 5 3 5 0a8 8 0 1 0-5 7.4" stroke="#666" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </button>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', borderRadius: 5, display: 'flex', alignItems: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L3.5 5v5c0 3.8 2.8 7.3 6.5 8 3.7-.7 6.5-4.2 6.5-8V5L10 2.5z" stroke="#666" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <span style={{ fontSize: 11, color: '#737373' }}>Shift + Enter for a new line</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '12px 14px 14px', gap: 10 }}>
            <span style={{
              flex: 1, fontSize: 14, color: '#737373', lineHeight: '22px',
            }}>
              Write a message to Welcome Space
            </span>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M11 5l4 4-4 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#555" strokeWidth="1.4"/>
                <path d="M9 5v5l3 2" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PUBLIC_SPACES = [
  { id: 1, name: 'Lumon Industries',        letter: 'L', color: '#3A5A8C', people: 4812, date: 'Mon • 3/24/25', desc: 'Official company-wide space. All announcements, updates, and memos from Lumon leadership.' },
  { id: 2, name: 'Macrodata Refinement',    letter: 'M', color: '#5A3A7A', people: 4,    date: 'Fri • 3/21/25', desc: 'MDR team workspace. Refine numbers. Ask no questions. Stay focused on the work.' },
  { id: 3, name: 'Wellness Sessions',       letter: 'W', color: '#3A7A5A', people: 312,  date: 'Wed • 3/19/25', desc: 'A supportive space for scheduling check-ins with Ms. Casey. All sessions are confidential.' },
  { id: 4, name: 'Optics & Design',         letter: 'O', color: '#7A5A3A', people: 88,   date: 'Thu • 3/20/25', desc: 'Brand, visual identity, and internal design reviews. Share comps and get feedback from the team.' },
  { id: 5, name: 'Perpetuity Wing',         letter: 'P', color: '#3A6A7A', people: 7,    date: 'Tue • 1/14/25', desc: 'Explore the history and vision of Kier Eagan. Open to all severed employees on the floor.' },
  { id: 6, name: 'The Break Room',          letter: 'T', color: '#6A3A3A', people: 0,    date: 'Mon • 9/02/24', desc: 'Mandatory reflection space. Attendance is logged. Please proceed with cooperation and sincerity.' },
]

function PublicSpacesView() {
  const [search, setSearch] = useState('')
  const filtered = PUBLIC_SPACES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#1A1A1A',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header — same chrome as Recommended messages; search aligned right */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        padding: '20px 24px 16px',
        borderBottom: '1px solid #2A2A2A',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: '1 1 auto' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: '#1170CF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="#92CBF2" strokeWidth="1.5" />
              <path d="M3 12h18M12 3c-2.8 4.2-2.8 15.8 0 20M12 3c2.8 4.2 2.8 15.8 0 20" stroke="#92CBF2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: '0 0 2px', lineHeight: '22px' }}>
              Explore public spaces
            </h2>
            <p style={{ fontSize: 13, color: '#777777', margin: 0, lineHeight: '18px' }}>
              See all the conversations you're welcome to join.
            </p>
          </div>
        </div>
        <div style={{ position: 'relative', width: 280, maxWidth: '40%', flexShrink: 0 }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="7" cy="7" r="4.5" stroke="#555" strokeWidth="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="#555" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a public space"
            style={{
              width: '100%', height: 38,
              background: '#222222', border: '1px solid #333333',
              borderRadius: 9999,
              padding: '0 16px 0 38px',
              fontSize: 13, color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 32px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
        alignContent: 'start',
      }}>
        {filtered.map(space => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  )
}

function SpaceCard({ space }) {
  const [hover, setHover] = useState(false)
  const [joined, setJoined] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#252525' : '#202020',
        border: `1px solid ${hover ? '#3A3A3A' : '#2A2A2A'}`,
        borderRadius: 14,
        padding: '20px 16px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6,
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: space.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 6, flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>{space.letter}</span>
      </div>

      {/* Name */}
      <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: 0, textAlign: 'center', lineHeight: '18px' }}>
        {space.name}
      </p>

      {/* Meta */}
      <p style={{ fontSize: 11, color: '#555555', margin: 0, textAlign: 'center', lineHeight: '16px' }}>
        ~{space.people} {space.people === 1 ? 'person' : 'people'}<br/>
        Latest activity on {space.date}
      </p>

      {/* Description */}
      <p style={{
        fontSize: 11, color: '#444444', margin: '4px 0 8px',
        textAlign: 'center', lineHeight: '16px',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {space.desc}
      </p>

      {/* Join button */}
      <button
        onClick={() => setJoined(j => !j)}
        style={{
          height: 32, padding: '0 22px',
          background: joined ? '#2A2A2A' : '#FFFFFF',
          border: joined ? '1px solid #3A3A3A' : 'none',
          borderRadius: 9999,
          fontSize: 13, fontWeight: 600,
          color: joined ? '#888888' : '#111111',
          cursor: 'pointer',
          fontFamily: "'Inter', system-ui, sans-serif",
          transition: 'background 0.15s, color 0.15s',
          marginTop: 'auto',
        }}
      >
        {joined ? 'Joined' : 'Join'}
      </button>
    </div>
  )
}

function CreateSpaceView({ onClose }) {
  const [spaceName, setSpaceName]   = useState('')
  const [addPeople, setAddPeople]   = useState('')
  const [isPublic,  setIsPublic]    = useState(false)
  const canCreate = spaceName.trim().length > 0

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#1A1A1A',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div />
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="#777777" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Centered form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 40px 40px',
        gap: 0,
      }}>
        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: '0 0 6px', textAlign: 'center' }}>
          Create a space
        </h2>
        <p style={{ fontSize: 13, color: '#666666', margin: '0 0 28px', textAlign: 'center' }}>
          Start a group conversation with others.
        </p>

        {/* Inputs */}
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            autoFocus
            value={spaceName}
            onChange={e => setSpaceName(e.target.value)}
            placeholder="Name the space (required)"
            style={{
              width: '100%', height: 44,
              background: 'transparent',
              border: '1px solid #3A3A3A',
              borderRadius: 22,
              padding: '0 18px',
              fontSize: 14, color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ position: 'relative' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="7" cy="7" r="4.5" stroke="#555" strokeWidth="1.4"/>
              <path d="M10.5 10.5L14 14" stroke="#555" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              value={addPeople}
              onChange={e => setAddPeople(e.target.value)}
              placeholder="Add by name, number, or email"
              style={{
                width: '100%', height: 44,
                background: 'transparent',
                border: '1px solid #3A3A3A',
                borderRadius: 22,
                padding: '0 18px 0 40px',
                fontSize: 14, color: '#FFFFFF',
                fontFamily: "'Inter', system-ui, sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Public toggle */}
        <div style={{ width: '100%', maxWidth: 440, marginTop: 28 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
              style={{ marginTop: 2, accentColor: '#0070C8', cursor: 'pointer', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#CCCCCC', lineHeight: '16px' }}>Make this space public</div>
              <div style={{ fontSize: 14, color: '#555555', lineHeight: '16px', marginTop: 8 }}>Anyone in your organization can find and join a public space.</div>
            </div>
          </label>
        </div>

        {/* Buttons — centered, Cancel 30% / Create 70% */}
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: '0 0 30%',
            height: 42,
            background: '#2E2E2E', border: '1px solid #3A3A3A',
            borderRadius: 10, fontSize: 14, fontWeight: 500,
            color: '#888888', cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'background 0.15s',
          }}>
            Cancel
          </button>
          <button style={{
            flex: '0 0 70%',
            height: 42,
            background: canCreate ? '#FFFFFF' : '#2A2A2A',
            border: 'none',
            borderRadius: 10, fontSize: 14, fontWeight: 600,
            color: canCreate ? '#111111' : '#444444',
            cursor: canCreate ? 'pointer' : 'default',
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'background 0.15s, color 0.15s',
          }}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export function MessageStage({ view, onClose }) {
  const [current, setCurrent]               = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (view === 'recommended')    return <RecommendedMessagesView />
  if (view === 'welcome-space') return <WelcomeSpaceChatView />
  if (view === 'new-message')    return <NewMessageView onClose={onClose} />
  if (view === 'create-space')   return <CreateSpaceView onClose={onClose} />
  if (view === 'public-spaces')  return <PublicSpacesView />

  const cardWidth  = containerWidth > 0 ? containerWidth - PEEK - GAP : 0
  const translateX = current * (cardWidth + GAP)

  function prev() { setCurrent(c => Math.max(0, c - 1)) }
  function next() { setCurrent(c => Math.min(SLIDES.length - 1, c + 1)) }

  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 40px',
      boxSizing: 'border-box',
      background: '#1A1A1A',
      overflow: 'visible',
      position: 'relative',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24, width: '100%', maxWidth: 360 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px', lineHeight: '28px' }}>
          Your messages live here
        </h2>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#666666', margin: 0 }}>
          Here is what you can do with Messages
        </p>
      </div>

      {/* Carousel */}
      <div ref={containerRef} style={{ width: '100%', maxWidth: 400, position: 'relative', flexShrink: 0 }}>

        {/* Clipping track — no borderRadius here, kept on individual cards */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            gap: GAP,
            transform: `translateX(-${translateX}px)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {SLIDES.map(slide => (
              <div
                key={slide.key}
                style={{
                  width: cardWidth || '100%',
                  flexShrink: 0,
                  background: '#222222',
                  border: '1px solid #333333',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* 4:3 image area */}
                <div style={{
                  width: '100%',
                  paddingTop: '75%',
                  position: 'relative',
                  background: '#2A2A2A',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* Placeholder grid to suggest image composition */}
                    <svg width="48" height="36" viewBox="0 0 48 36" fill="none" opacity="0.2">
                      <rect width="48" height="36" rx="3" fill="#888"/>
                      <circle cx="15" cy="13" r="5" fill="#888"/>
                      <path d="M0 26l12-10 8 7 10-12 18 15H0z" fill="#888"/>
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <div style={{ padding: '14px 18px 18px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px', lineHeight: '20px' }}>
                    {slide.title}
                  </p>
                  <p style={{
                    fontSize: 13, fontWeight: 400, color: '#777777',
                    margin: 0, lineHeight: '20px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right fade — signals more slides ahead */}
        {current < SLIDES.length - 1 && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: PEEK + 20, height: '100%',
            background: 'linear-gradient(to right, transparent, #1A1A1A)',
            pointerEvents: 'none',
          }}/>
        )}

        {/* Left arrow */}
        {current > 0 && (
          <button onClick={prev} style={{
            position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: 9999,
            background: '#2A2A2A', border: '1px solid #404040',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L7 9L11 14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {current < SLIDES.length - 1 && (
          <button onClick={next} style={{
            position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: 9999,
            background: '#2A2A2A', border: '1px solid #404040',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4L11 9L7 14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 18 : 6, height: 6,
            borderRadius: 9999,
            background: i === current ? '#FFFFFF' : '#2E2E2E',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'width 0.2s, background 0.2s',
          }}/>
        ))}
      </div>

      {/* Secondary actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 56 }}>
        <ActionButton
          label="Send a message"
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 3.5C2 2.95 2.45 2.5 3 2.5H12C12.55 2.5 13 2.95 13 3.5V9C13 9.55 12.55 10 12 10H5.5L2 13V3.5Z"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <ActionButton
          label="Create a space"
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 13c0-2.76 2.24-4.5 5-4.5s5 1.74 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M11.5 7v4M9.5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>


    </div>
  )
}
