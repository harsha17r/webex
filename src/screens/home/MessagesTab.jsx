import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MessageStage } from './MessageStage'
import { Dropdown } from '../../components/Dropdown'

const FILTER_TABS = ['All', "DM's", 'Spaces', 'Public']

const FILTER_OPTIONS = [
  'Show all messages',
  'Notifications',
  'Unread',
  'Hidden',
  '@Mentions to me',
  '@Mentions to all',
  'Sent',
  'Threads',
  'Flagged',
  'Reminders',
  'Scheduled',
]

// Fluent UI 20px icons
const COMPOSE_ITEMS = [
  {
    key: 'message',
    label: 'New message',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m0 1a7 7 0 0 0-6.106 10.425a.5.5 0 0 1 .063.272l-.014.094l-.756 3.021l3.024-.754a.5.5 0 0 1 .188-.01l.091.021l.087.039A7 7 0 1 0 10 3m.5 8a.5.5 0 0 1 .09.992L10.5 12h-3a.5.5 0 0 1-.09-.992L7.5 11zm2-3a.5.5 0 0 1 .09.992L12.5 9h-5a.5.5 0 0 1-.09-.992L7.5 8z"/>
      </svg>
    ),
  },
  {
    key: 'space',
    label: 'New space',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M9 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8M6 6a3 3 0 1 1 6 0a3 3 0 0 1-6 0m-1.991 5A2 2 0 0 0 2 13c0 1.691.833 2.966 2.135 3.797C5.417 17.614 7.145 18 9 18q.617 0 1.21-.057a5.5 5.5 0 0 1-.618-.958Q9.301 17 9 17c-1.735 0-3.257-.364-4.327-1.047C3.623 15.283 3 14.31 3 13c0-.553.448-1 1.009-1h5.59q.277-.538.658-1zM14.5 19a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9m0-7a.5.5 0 0 1 .5.5V14h1.5a.5.5 0 0 1 0 1H15v1.5a.5.5 0 0 1-1 0V15h-1.5a.5.5 0 0 1 0-1H14v-1.5a.5.5 0 0 1 .5-.5"/>
      </svg>
    ),
  },
  {
    key: 'meeting',
    label: 'Start a new meeting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M5 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-.321l3.037 2.097a1.25 1.25 0 0 0 1.96-1.029V6.252a1.25 1.25 0 0 0-1.96-1.028L13 7.32V7a3 3 0 0 0-3-3zm8 4.536l3.605-2.49a.25.25 0 0 1 .392.206v7.495a.25.25 0 0 1-.392.206L13 11.463zM3 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
  {
    key: 'schedule',
    label: 'Schedule a meeting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M14.5 3A2.5 2.5 0 0 1 17 5.5v4.1a5.5 5.5 0 0 0-1-.393V7H4v7.5A1.5 1.5 0 0 0 5.5 16h3.707q.149.524.393 1H5.5A2.5 2.5 0 0 1 3 14.5v-9A2.5 2.5 0 0 1 5.5 3zm0 1h-9A1.5 1.5 0 0 0 4 5.5V6h12v-.5A1.5 1.5 0 0 0 14.5 4M19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-4-2a.5.5 0 0 0-1 0V14h-1.5a.5.5 0 0 0 0 1H14v1.5a.5.5 0 0 0 1 0V15h1.5a.5.5 0 0 0 0-1H15z"/>
      </svg>
    ),
  },
]

const FILTER_WIDTH      = 240
const MORE_OPTIONS_WIDTH = 310

const WELCOME_SPACE_PREVIEW = "👋 Welcome to Webex! But, more importantly, welcome to where you'll do the best work ever. In Spaces, you can send messages…"

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — Welcome Space row (badge + ⋮ swap-in)
 *
 *   idle          unread pill flush right; ⋮ rail width 0
 *   hover enter   rail 0 → 32px (layout spring) → pill slides left; ⋮ fades/scales in
 *   hover leave   reverse
 *   text          fixed paddingRight gutter — copy width does not change during hover
 * ───────────────────────────────────────────────────────── */
const WELCOME_ROW_MORE = {
  layoutSpring: { type: 'spring', stiffness: 340, damping: 32, mass: 0.78 },
  spring:       { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 },
  hidden:       { opacity: 0, scale: 0.88 },
  show:         { opacity: 1, scale: 1 },
  railPx:       32,
  gapTrail:     8,
  /** Inset tray from card edge — easier tap target for ⋮ */
  trayPaddingRight: 12,
  /** Reserve right space so title/preview ellipsis stay stable while tray animates */
  textGutterUnread: 86,
  textGutterRead:   52,
}

/* ── SidebarElement ────────────────────────────────────── */

function SidebarElement({ name, color, selected, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '12px 14px',
        borderRadius: 12,
        background: selected ? '#2E2E2E' : hovered ? '#2A2A2A' : 'transparent',
        transition: 'background 0.12s',
        cursor: 'pointer',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {/* Avatar group — 40×40 container */}
        <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
          {/* Main avatar */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: 40, height: 40, borderRadius: '50%',
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#92CBF2" d="M14.604 2.76a20.5 20.5 0 0 0-4.637 0l-1.595.182a.5.5 0 0 0-.441.453l-.123 1.382a39.5 39.5 0 0 0 0 6.983l.123 1.382a.5.5 0 0 0 .498.456H10.5V21a.5.5 0 0 0 .89.312l.391-.49a35.5 35.5 0 0 0 5.497-9.676l.19-.507A.5.5 0 0 0 17 9.963h-2.713l2.325-6.352a.5.5 0 0 0-.413-.669z"/>
            </svg>
          </div>
        </div>

        <span style={{
          fontSize: 16, fontWeight: 500,
          color: '#FFFFFF',
          lineHeight: '1.25em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
      </div>


    </div>
  )
}

function WelcomeSpaceListRow({ selected, unread, preview, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        cursor: 'pointer',
        background: selected ? '#2E2E2E' : hovered ? '#2A2A2A' : 'transparent',
        transition: 'background 0.12s',
        boxSizing: 'border-box',
      }}
    >
      {/* Avatar — 40×40 to match Recommended messages row */}
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        borderRadius: '50%',
        background: '#2E2E2E',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>W</span>
      </div>
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3,
        paddingRight: unread ? WELCOME_ROW_MORE.textGutterUnread : WELCOME_ROW_MORE.textGutterRead,
      }}>
        <span style={{
          fontSize: 16,
          fontWeight: unread ? 700 : 500,
          color: '#FFFFFF',
          lineHeight: '1.25em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          Welcome Space
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 400,
          color: '#8A8A8A',
          lineHeight: '18px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {preview}
        </span>
      </div>
      {/* Trailing: absolutely positioned — does not steal flex width from text; [pill][collapsible rail] */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: WELCOME_ROW_MORE.gapTrail,
          paddingRight: WELCOME_ROW_MORE.trayPaddingRight,
        }}
      >
        {unread && (
          <motion.div
            layout
            transition={WELCOME_ROW_MORE.layoutSpring}
            style={{ display: 'inline-flex' }}
          >
            <span style={{
              minWidth: 20, height: 20, padding: '0 6px', borderRadius: 9999,
              background: '#FFFFFF',
              color: '#1A1A1A', fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>
              1
            </span>
          </motion.div>
        )}
        <motion.div
          initial={false}
          animate={{ width: hovered ? WELCOME_ROW_MORE.railPx : 0 }}
          transition={WELCOME_ROW_MORE.layoutSpring}
          style={{
            overflow: 'hidden',
            flexShrink: 0,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            pointerEvents: hovered ? 'auto' : 'none',
          }}
        >
          <motion.div
            initial={false}
            animate={hovered ? WELCOME_ROW_MORE.show : WELCOME_ROW_MORE.hidden}
            transition={WELCOME_ROW_MORE.spring}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: WELCOME_ROW_MORE.railPx,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              aria-label="Conversation actions"
              onClick={e => { e.stopPropagation() }}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <circle cx="9" cy="4" r="1.5" fill="#CCCCCC"/>
                <circle cx="9" cy="9" r="1.5" fill="#CCCCCC"/>
                <circle cx="9" cy="14" r="1.5" fill="#CCCCCC"/>
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const MORE_OPTIONS = [
  { key: 'separate-dms',        label: "Separate DM's and spaces",  defaultOn: true  },
  { key: 'compact-view',        label: 'Show compact view',          defaultOn: false },
  { key: 'recommended-messages',label: 'Show recommended messages',  defaultOn: true  },
  { key: 'show-sections',       label: 'Show sections',              defaultOn: true  },
]

function FilterPanel({ activeTypeFilter, onSelect }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <div style={{
      width: FILTER_WIDTH,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 20,
      padding: 12,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {FILTER_OPTIONS.map(option => (
        <div
          key={option}
          onMouseEnter={() => setHoveredItem(option)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => onSelect(option)}
          style={{
            padding: '7px 16px',
            borderRadius: 12,
            cursor: 'pointer',
            background: activeTypeFilter === option
              ? '#222222'
              : hoveredItem === option ? '#1E1E1E' : 'transparent',
            transition: 'background 0.12s',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: activeTypeFilter === option ? '#FFFFFF' : '#CCCCCC',
            lineHeight: '20px',
          }}>
            {option}
          </span>
          {activeTypeFilter === option && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M2 7l3.5 3.5L12 3.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

function ComposePanel({ onClose }) {
  const [hoveredKey, setHoveredKey] = useState(null)

  return (
    <div style={{
      width: 240,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 20,
      padding: 12,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {COMPOSE_ITEMS.map(item => (
        <div
          key={item.key}
          onMouseEnter={() => setHoveredKey(item.key)}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            background: hoveredKey === item.key ? '#222222' : 'transparent',
            transition: 'background 0.12s',
          }}
        >
          {item.icon}
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: '#FFFFFF',
            lineHeight: '20px',
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function MoreOptionsPanel({ checked, onToggle }) {
  const [hoveredKey, setHoveredKey] = useState(null)

  return (
    <div style={{
      width: MORE_OPTIONS_WIDTH,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 20,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 4px 4px rgba(0,0,0,0.25)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {MORE_OPTIONS.map(option => (
        <div
          key={option.key}
          onMouseEnter={() => setHoveredKey(option.key)}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={() => onToggle(option.key)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12,
            padding: '9px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            background: checked.has(option.key)
              ? '#222222'
              : hoveredKey === option.key ? '#1E1E1E' : 'transparent',
            transition: 'background 0.12s',
          }}
        >
          <span style={{
            fontSize: 14, fontWeight: 500,
            color: checked.has(option.key) ? '#FFFFFF' : '#CCCCCC',
            lineHeight: '20px',
          }}>
            {option.label}
          </span>
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ flexShrink: 0, opacity: checked.has(option.key) ? 1 : 0, transition: 'opacity 0.12s' }}
          >
            <path d="M2.5 8l4 4L13.5 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ))}
    </div>
  )
}

export function MessagesTab() {
  const [activeFilter,     setActiveFilter]     = useState('All')
  const [activeTypeFilter, setActiveTypeFilter] = useState('Show all messages')
  const [filterOpen,       setFilterOpen]       = useState(false)
  const [composeOpen,      setComposeOpen]      = useState(false)
  const [moreOpen,         setMoreOpen]         = useState(false)
  const [checkedOptions,   setCheckedOptions]   = useState(
    () => new Set(MORE_OPTIONS.filter(o => o.defaultOn).map(o => o.key))
  )
  const [selectedItem,     setSelectedItem]     = useState(null)
  const [inviteHover,      setInviteHover]      = useState(false)
  const [invitePress,      setInvitePress]      = useState(false)
  const [sendHover,        setSendHover]        = useState(false)
  const [sendPress,        setSendPress]        = useState(false)
  const [dmView,           setDmView]           = useState(null)
  const [spaceHover,       setSpaceHover]       = useState(false)
  const [spacePress,       setSpacePress]       = useState(false)
  const [spaceView,        setSpaceView]        = useState(null)
  const [welcomeSpaceUnread, setWelcomeSpaceUnread] = useState(true)

  const filterRef    = useRef(null)
  const filterTimer  = useRef(null)
  const composeRef   = useRef(null)
  const composeTimer = useRef(null)
  const moreRef      = useRef(null)
  const moreTimer    = useRef(null)

  function keepFilterOpen()   { clearTimeout(filterTimer.current) }
  function autoCloseFilter()  { filterTimer.current  = setTimeout(() => setFilterOpen(false),  220) }
  function keepComposeOpen()  { clearTimeout(composeTimer.current) }
  function autoCloseCompose() { composeTimer.current = setTimeout(() => setComposeOpen(false), 220) }
  function keepMoreOpen()     { clearTimeout(moreTimer.current) }
  function autoCloseMore()    { moreTimer.current    = setTimeout(() => setMoreOpen(false),    220) }

  function toggleOption(key) {
    setCheckedOptions(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function openWelcomeSpace() {
    setWelcomeSpaceUnread(false)
    setSelectedItem('welcome-space')
    setSpaceView(null)
  }

  return (
    <div style={{
      margin: 4,
      minHeight: 'calc(100% - 8px)',
      background: '#1A1A1A',
      border: '1px solid #494949',
      borderRadius: 12,
      display: 'flex', flexDirection: 'row',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Left Panel — Messages List ── */}
      <div style={{
        width: 400, flexShrink: 0,
        background: '#222222',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
        borderRight: '1px solid #494949',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 16px 12px',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '28px' }}>
            Message
          </h2>
          {/* Icon buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Filter icon */}
            <button
              ref={filterRef}
              onClick={() => setFilterOpen(o => !o)}
              onMouseEnter={keepFilterOpen}
              onMouseLeave={autoCloseFilter}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: filterOpen ? '#3A3A3A' : '#2A2A2A',
                border: `1px solid ${filterOpen ? '#666666' : '#494949'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 5h14M5 9h8M7.5 13h3" stroke={filterOpen ? '#FFFFFF' : '#AAAAAA'} strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Compose / plus icon */}
            <button
              ref={composeRef}
              onClick={() => setComposeOpen(o => !o)}
              onMouseEnter={keepComposeOpen}
              onMouseLeave={autoCloseCompose}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: composeOpen ? '#3A3A3A' : '#2A2A2A',
                border: `1px solid ${composeOpen ? '#666666' : '#494949'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke={composeOpen ? '#FFFFFF' : '#AAAAAA'} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {/* More icon */}
            <button
              ref={moreRef}
              onClick={() => setMoreOpen(o => !o)}
              onMouseEnter={keepMoreOpen}
              onMouseLeave={autoCloseMore}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: moreOpen ? '#3A3A3A' : '#2A2A2A',
                border: `1px solid ${moreOpen ? '#666666' : '#494949'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="4" cy="9" r="1.5" fill={moreOpen ? '#FFFFFF' : '#AAAAAA'}/>
                <circle cx="9" cy="9" r="1.5" fill={moreOpen ? '#FFFFFF' : '#AAAAAA'}/>
                <circle cx="14" cy="9" r="1.5" fill={moreOpen ? '#FFFFFF' : '#AAAAAA'}/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 16px 16px',
          flexShrink: 0,
        }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveFilter(tab); setSelectedItem(null); setDmView(null); setSpaceView(null) }}
              style={{
                background: activeFilter === tab ? '#494949' : 'transparent',
                border: activeFilter === tab ? 'none' : '1px solid #494949',
                borderRadius: 9999,
                padding: '6px 14px',
                fontSize: 13, fontWeight: 500,
                color: activeFilter === tab ? '#FFFFFF' : '#AAAAAA',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'background 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Message list */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          {activeFilter === 'All' && (
            <>
              <SidebarElement
                name="Recommended messages"
                color="#1170CF"
                selected={selectedItem === 'recommended'}
                onClick={() => setSelectedItem('recommended')}
              />
              <WelcomeSpaceListRow
                selected={selectedItem === 'welcome-space'}
                unread={welcomeSpaceUnread}
                preview={WELCOME_SPACE_PREVIEW}
                onClick={openWelcomeSpace}
              />
            </>
          )}
          {activeFilter === 'Spaces' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 2px 0' }}>
              <WelcomeSpaceListRow
                selected={selectedItem === 'welcome-space'}
                unread={welcomeSpaceUnread}
                preview={WELCOME_SPACE_PREVIEW}
                onClick={openWelcomeSpace}
              />
              <button
                onMouseEnter={() => setSpaceHover(true)}
                onMouseLeave={() => { setSpaceHover(false); setSpacePress(false) }}
                onMouseDown={() => setSpacePress(true)}
                onMouseUp={() => setSpacePress(false)}
                onClick={() => { setSelectedItem(null); setSpaceView('create-space') }}
                style={{
                  width: '100%', height: 44,
                  background: spacePress ? '#3A3A3A' : spaceHover ? '#2E2E2E' : '#282828',
                  border: `1px solid ${spaceHover ? '#666666' : '#494949'}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                  transform: spacePress ? 'scale(0.98)' : 'scale(1)',
                }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path fill="#FFFFFF" d="M9 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8M6 6a3 3 0 1 1 6 0a3 3 0 0 1-6 0m-1.991 5A2 2 0 0 0 2 13c0 1.691.833 2.966 2.135 3.797C5.417 17.614 7.145 18 9 18q.617 0 1.21-.057a5.5 5.5 0 0 1-.618-.958Q9.301 17 9 17c-1.735 0-3.257-.364-4.327-1.047C3.623 15.283 3 14.31 3 13c0-.553.448-1 1.009-1h5.59q.277-.538.658-1zM14.5 19a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9m0-7a.5.5 0 0 1 .5.5V14h1.5a.5.5 0 0 1 0 1H15v1.5a.5.5 0 0 1-1 0V15h-1.5a.5.5 0 0 1 0-1H14v-1.5a.5.5 0 0 1 .5-.5"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Create a space
                </span>
              </button>
            </div>
          )}
          {activeFilter === "DM's" && (
            <div style={{ padding: '4px 2px 0' }}>
              <button
                onMouseEnter={() => setSendHover(true)}
                onMouseLeave={() => { setSendHover(false); setSendPress(false) }}
                onMouseDown={() => setSendPress(true)}
                onMouseUp={() => setSendPress(false)}
                onClick={() => setDmView('new-message')}
                style={{
                  width: '100%', height: 44,
                  background: sendPress ? '#3A3A3A' : sendHover ? '#2E2E2E' : '#282828',
                  border: `1px solid ${sendHover ? '#666666' : '#494949'}`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                  transform: sendPress ? 'scale(0.98)' : 'scale(1)',
                }}>
                <svg width="16" height="16" viewBox="0 0 20 20">
                  <path fill="#FFFFFF" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m0 1a7 7 0 0 0-6.106 10.425a.5.5 0 0 1 .063.272l-.014.094l-.756 3.021l3.024-.754a.5.5 0 0 1 .188-.01l.091.021l.087.039A7 7 0 1 0 10 3m.5 8a.5.5 0 0 1 .09.992L10.5 12h-3a.5.5 0 0 1-.09-.992L7.5 11zm2-3a.5.5 0 0 1 .09.992L12.5 9h-5a.5.5 0 0 1-.09-.992L7.5 8z"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Send a message
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Invite to Webex — always at bottom */}
        <div style={{ padding: '0 10px 16px', flexShrink: 0 }}>
          <button
            onMouseEnter={() => setInviteHover(true)}
            onMouseLeave={() => { setInviteHover(false); setInvitePress(false) }}
            onMouseDown={() => setInvitePress(true)}
            onMouseUp={() => setInvitePress(false)}
            style={{
              width: '100%', height: 48,
              background: invitePress ? '#333333' : inviteHover ? '#2A2A2A' : 'transparent',
              border: `1px solid ${inviteHover ? '#666666' : '#494949'}`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
              transform: invitePress ? 'scale(0.98)' : 'scale(1)',
            }}>
            <svg width="18" height="18" viewBox="0 0 20 20">
              <path fill="#FFFFFF" d="M9 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8M6 6a3 3 0 1 1 6 0a3 3 0 0 1-6 0m-1.991 5A2 2 0 0 0 2 13c0 1.691.833 2.966 2.135 3.797C5.417 17.614 7.145 18 9 18q.617 0 1.21-.057a5.5 5.5 0 0 1-.618-.958Q9.301 17 9 17c-1.735 0-3.257-.364-4.327-1.047C3.623 15.283 3 14.31 3 13c0-.553.448-1 1.009-1h5.59q.277-.538.658-1zM14.5 19a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9m0-7a.5.5 0 0 1 .5.5V14h1.5a.5.5 0 0 1 0 1H15v1.5a.5.5 0 0 1-1 0V15h-1.5a.5.5 0 0 1 0-1H14v-1.5a.5.5 0 0 1 .5-.5"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Invite to Webex
            </span>
          </button>
        </div>

      </div>

      {/* ── MessageStage — feature carousel empty state ── */}
      {activeFilter === 'All'
        ? <MessageStage view={selectedItem} />
        : activeFilter === "DM's" && dmView
          ? <MessageStage view={dmView} onClose={() => setDmView(null)} />
          : activeFilter === "DM's"
            ? (
              <div style={{
                flex: 1, background: '#1A1A1A',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 10, fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#242424', border: '1px solid #2E2E2E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 4,
                }}>
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                    <path fill="#444444" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m0 1a7 7 0 0 0-6.106 10.425a.5.5 0 0 1 .063.272l-.014.094l-.756 3.021l3.024-.754a.5.5 0 0 1 .188-.01l.091.021l.087.039A7 7 0 1 0 10 3m.5 8a.5.5 0 0 1 .09.992L10.5 12h-3a.5.5 0 0 1-.09-.992L7.5 11zm2-3a.5.5 0 0 1 .09.992L12.5 9h-5a.5.5 0 0 1-.09-.992L7.5 8z"/>
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>No messages yet</p>
                <p style={{ fontSize: 13, color: '#555555', margin: 0 }}>Send a message to start a conversation.</p>
              </div>
            )
            : activeFilter === 'Spaces' && spaceView
              ? <MessageStage view={spaceView} onClose={() => setSpaceView(null)} />
              : activeFilter === 'Spaces' && selectedItem === 'welcome-space'
                ? <MessageStage view="welcome-space" />
                : activeFilter === 'Spaces'
                  ? (
                    <div style={{
                      flex: 1, background: '#1A1A1A',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 10, fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: '#242424', border: '1px solid #2E2E2E',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 4,
                      }}>
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                          <path fill="#444444" d="M9 2a4 4 0 1 0 0 8a4 4 0 0 0 0-8M6 6a3 3 0 1 1 6 0a3 3 0 0 1-6 0m-1.991 5A2 2 0 0 0 2 13c0 1.691.833 2.966 2.135 3.797C5.417 17.614 7.145 18 9 18q.617 0 1.21-.057a5.5 5.5 0 0 1-.618-.958Q9.301 17 9 17c-1.735 0-3.257-.364-4.327-1.047C3.623 15.283 3 14.31 3 13c0-.553.448-1 1.009-1h5.59q.277-.538.658-1zM14.5 19a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9m0-7a.5.5 0 0 1 .5.5V14h1.5a.5.5 0 0 1 0 1H15v1.5a.5.5 0 0 1-1 0V15h-1.5a.5.5 0 0 1 0-1H14v-1.5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>No spaces yet</p>
                      <p style={{ fontSize: 13, color: '#555555', margin: 0 }}>Create a space to start a group conversation.</p>
                    </div>
                  )
                : activeFilter === 'Public'
                  ? (
                    <div style={{
                      flex: 1, background: '#1A1A1A',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: 10, fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', margin: 0 }}>No public spaces yet</p>
                      <p style={{ fontSize: 13, color: '#555555', margin: 0 }}>Public spaces will appear here when available.</p>
                    </div>
                  )
                  : <div style={{ flex: 1, background: '#1A1A1A' }} />
      }

      {/* ── Filter Dropdown ── */}
      <AnimatePresence>
        {filterOpen && (
          <Dropdown
            anchorRef={filterRef}
            onClose={() => setFilterOpen(false)}
            onMouseEnter={keepFilterOpen}
            onMouseLeave={autoCloseFilter}
            anchor="bottom-center"
            dropdownWidth={FILTER_WIDTH}
            offsetY={6}
            showArrow
            arrowColor="#111111"
            arrowBorder="#595959"
          >
            <FilterPanel
              activeTypeFilter={activeTypeFilter}
              onSelect={option => { setActiveTypeFilter(option); setFilterOpen(false) }}
            />
          </Dropdown>
        )}
      </AnimatePresence>

      {/* ── More Options Dropdown ── */}
      <AnimatePresence>
        {moreOpen && (
          <Dropdown
            anchorRef={moreRef}
            onClose={() => setMoreOpen(false)}
            onMouseEnter={keepMoreOpen}
            onMouseLeave={autoCloseMore}
            anchor="bottom-center"
            dropdownWidth={MORE_OPTIONS_WIDTH}
            offsetY={6}
            showArrow
            arrowColor="#111111"
            arrowBorder="#595959"
          >
            <MoreOptionsPanel checked={checkedOptions} onToggle={toggleOption} />
          </Dropdown>
        )}
      </AnimatePresence>

      {/* ── Compose Dropdown ── */}
      <AnimatePresence>
        {composeOpen && (
          <Dropdown
            anchorRef={composeRef}
            onClose={() => setComposeOpen(false)}
            onMouseEnter={keepComposeOpen}
            onMouseLeave={autoCloseCompose}
            anchor="bottom-center"
            dropdownWidth={240}
            offsetY={6}
            showArrow
            arrowColor="#111111"
            arrowBorder="#595959"
          >
            <ComposePanel onClose={() => setComposeOpen(false)} />
          </Dropdown>
        )}
      </AnimatePresence>

    </div>
  )
}
