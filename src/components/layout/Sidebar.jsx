import { useState, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { Dropdown } from '../Dropdown'

/* ─────────────────────────────────────────────────────────
 * Figma Sidebar spec:
 *   x:0, y:76, w:107, h:948
 *   Column layout, justifyContent: space-between, alignItems: center
 *   padding: 0 0 48px
 *   Top group: gap 28px, contains GroupA + GroupB
 *   GroupA (Message/Meet/Call): gap 20px, paddingBottom 28px, gradient bottom border
 *   GroupB (Team/Whiteboard/More): gap 20px
 *   Bottom group: gap 20px (Settings/Help)
 *   Each nav item: column, center, gap 8px
 *   Icon container: 40×40, borderRadius 9999, bg #222222 ALWAYS
 *   Active label: #E9E9E9, inactive label: #D4D4D4
 *   Icon SVGs: white #FFFFFF
 * ───────────────────────────────────────────────────────── */

const icons = {
  message: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V12C17 12.5523 16.5523 13 16 13H6.5L3 16V4Z"
        stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),
  message_filled: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <path
        d="M3 4C3 3.44772 3.44772 3 4 3H16C16.5523 3 17 3.44772 17 4V12C17 12.5523 16.5523 13 16 13H6.5L3 16V4Z"
        fill="var(--text-primary)"
      />
    </svg>
  ),
  meet: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="11" height="9" rx="1.5" stroke="var(--text-primary)" strokeWidth="1.5"/>
      <path d="M13 8.5L18 6V14L13 11.5" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  meet_filled: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="11" height="9" rx="1.5" fill="var(--text-primary)"/>
      <path d="M13 8.5L18 6V14L13 11.5" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  call: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 3H7L8.5 6.5L6.5 8C7.5 10 9.5 12 12 13L13.5 11L17 12.5V15C17 15.5523 16.5523 16 16 16C9.373 16 4 10.627 4 4C4 3.44772 4.44772 3 4.5 3Z"
        stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  ),
  team: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="7" r="2.5" stroke="var(--text-primary)" strokeWidth="1.5"/>
      <path d="M2.5 16C2.5 13.5147 4.76472 11.5 7.5 11.5C10.2353 11.5 12.5 13.5147 12.5 16" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="7.5" r="2" stroke="var(--text-primary)" strokeWidth="1.5"/>
      <path d="M13 12C13.3 11.9 13.65 11.85 14 11.85C15.933 11.85 17.5 13.2 17.5 14.85" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  whiteboard: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="13" height="13" rx="1.5" stroke="var(--text-primary)" strokeWidth="1.5"/>
      <path d="M12.5 2.5L17.5 7.5L9 16H4V11L12.5 2.5Z" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  more: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="10" r="1.5" fill="var(--text-primary)"/>
      <circle cx="10" cy="10" r="1.5" fill="var(--text-primary)"/>
      <circle cx="15" cy="10" r="1.5" fill="var(--text-primary)"/>
    </svg>
  ),
  settings: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="var(--text-primary)" strokeWidth="1.5"/>
      <path
        d="M10 2.5V4M10 16V17.5M2.5 10H4M16 10H17.5M4.4 4.4L5.5 5.5M14.5 14.5L15.6 15.6M4.4 15.6L5.5 14.5M14.5 5.5L15.6 4.4"
        stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  ),
  help: (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="var(--text-primary)" strokeWidth="1.5"/>
      <path d="M7.5 7.75C7.5 6.37 8.62 5.25 10 5.25C11.38 5.25 12.5 6.37 12.5 7.75C12.5 9 11 9.75 10 10.5V11.5" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="14" r="0.75" fill="var(--text-primary)"/>
    </svg>
  ),
}

const groupA = [
  { key: 'message', label: 'Message' },
  { key: 'meet',    label: 'Meet'    },
  { key: 'call',    label: 'Call'    },
]

const groupB = [
  { key: 'team',       label: 'Team'       },
  { key: 'whiteboard', label: 'Whiteboard' },
]

const MORE_ITEMS = [
  {
    key: 'vidcast',
    label: 'Vidcast',
    subtitle: 'Record and share work videos',
    bg: 'var(--bg-elevated)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="5" width="13" height="12" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <path d="M15 9.5L20 7V15L15 12.5" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="11" r="2" fill="var(--text-primary)" opacity="0.6"/>
      </svg>
    ),
  },
  {
    key: 'apphub',
    label: 'App Hub',
    subtitle: 'Find workflows and apps',
    bg: 'var(--border-strong)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <rect x="12" y="2" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <rect x="12" y="12" width="8" height="8" rx="2" stroke="var(--text-primary)" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    key: 'insights',
    label: 'Personal Insights',
    subtitle: 'Insights for better work connections',
    bg: 'var(--border-strong)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="9" cy="7" r="3.5" stroke="var(--text-primary)" strokeWidth="1.4"/>
        <path d="M2 19c0-3.866 3.134-6 7-6" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 13v6M12.5 15.5h5" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function CustomizeLink() {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 0 12px 8px',
        fontSize: 14, fontWeight: 500,
        color: hovered ? 'var(--accent)' : 'var(--accent)',
        lineHeight: '16px', cursor: 'pointer',
        display: 'block',
        transition: 'color 0.15s',
        textDecoration: hovered ? 'underline' : 'none',
      }}
    >
      Customize side bar
    </span>
  )
}

function MoreDropdown() {
  const [hoveredKey, setHoveredKey] = useState(null)

  return (
    <div
      style={{
        width: 320,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-strong)',
        borderRadius: 20,
        padding: 12,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      {MORE_ITEMS.map(item => (
        <div
          key={item.key}
          onMouseEnter={() => setHoveredKey(item.key)}
          onMouseLeave={() => setHoveredKey(null)}
          style={{
            display: 'flex', flexDirection: 'row', alignItems: 'center',
            gap: 8, padding: '8px 0 8px 8px',
            background: hoveredKey === item.key ? 'var(--border)' : 'transparent',
            borderRadius: 12,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {item.icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: '20px' }}>
              {item.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', lineHeight: '20px' }}>
              {item.subtitle}
            </span>
          </div>
        </div>
      ))}

      {/* Customize sidebar — plain text link */}
      <CustomizeLink />
    </div>
  )
}

const bottomGroup = [
  { key: 'settings', label: 'Settings' },
  { key: 'help',     label: 'Help'     },
]

function NavItem({ navKey, label, active, onClick }) {
  return (
    <div
      onClick={() => onClick(navKey)}
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 2, cursor: 'pointer',
        width: '100%', boxSizing: 'border-box',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 9999,
        background: active ? 'var(--bg-elevated)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icons[active && icons[`${navKey}_filled`] ? `${navKey}_filled` : navKey]}
      </div>
      <span style={{
        fontSize: 12, fontWeight: 500,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: '16px',
      }}>
        {label}
      </span>
    </div>
  )
}

export function Sidebar({ activeTab, onTabChange }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef    = useRef(null)
  const closeTimer = useRef(null)

  function keepOpen()  { clearTimeout(closeTimer.current) }
  function autoClose() { closeTimer.current = setTimeout(() => setMoreOpen(false), 220) }

  return (
    <div style={{
      width: 90, minWidth: 90, height: '100%',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 0 48px',
      boxSizing: 'border-box',
    }}>

      {/* Top group: GroupA + GroupB */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: 28, width: '100%', paddingTop: 20,
        boxSizing: 'border-box',
      }}>

        {/* Group A — Message / Meet / Call, with gradient bottom border */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          width: '100%',
          paddingBottom: 28,
          borderBottom: 'none',
          position: 'relative',
          boxSizing: 'border-box',
        }}>
          {groupA.map(item => (
            <NavItem
              key={item.key}
              navKey={item.key}
              label={item.label}
              active={activeTab === item.key}
              onClick={onTabChange}
            />
          ))}
          {/* Gradient bottom border pseudo-element via absolutely positioned div */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 1,
            background: 'linear-gradient(270deg, var(--bg-primary) 0%, #D9D9D9 41%, var(--bg-primary) 100%)',
          }} />
        </div>

        {/* Group B — Team / Whiteboard + More button */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          gap: 20, width: '100%',
          boxSizing: 'border-box',
        }}>
          {groupB.map(item => (
            <NavItem
              key={item.key}
              navKey={item.key}
              label={item.label}
              active={activeTab === item.key}
              onClick={onTabChange}
            />
          ))}

          {/* More — custom button with dropdown */}
          <div
            ref={moreRef}
            onClick={() => setMoreOpen(o => !o)}
            onMouseEnter={keepOpen}
            onMouseLeave={autoClose}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 2, cursor: 'pointer',
              width: '100%', boxSizing: 'border-box',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 9999,
              background: moreOpen ? 'var(--bg-elevated)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {icons.more}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 500,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '16px',
            }}>
              More
            </span>
          </div>
        </div>
      </div>

      {/* Bottom group — Settings / Help */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        gap: 20, width: '100%',
        boxSizing: 'border-box',
      }}>
        {bottomGroup.map(item => (
          <NavItem
            key={item.key}
            navKey={item.key}
            label={item.label}
            active={activeTab === item.key}
            onClick={onTabChange}
          />
        ))}
      </div>

      <AnimatePresence>
        {moreOpen && (
          <Dropdown
            anchorRef={moreRef}
            onClose={() => setMoreOpen(false)}
            onMouseEnter={keepOpen}
            onMouseLeave={autoClose}
          >
            <MoreDropdown />
          </Dropdown>
        )}
      </AnimatePresence>

    </div>
  )
}
