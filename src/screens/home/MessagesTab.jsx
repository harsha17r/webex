import { useState, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
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

const COMPOSE_ITEMS = [
  {
    key: 'message',
    label: 'New message',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 4h16v12H7.5L4 20V4Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 10h6M9 13h4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'space',
    label: 'New space',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M3 19c0-3.314 2.686-5 6-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 11v6M14 14h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'meeting',
    label: 'Start a new meeting',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="13" height="11" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M15 9.5L21 7V17L15 14.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'schedule',
    label: 'Schedule a meeting',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M3 9h18M8 2v4M16 2v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 13h4M8 16h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const FILTER_WIDTH      = 240
const COMPOSE_WIDTH     = 240
const MORE_OPTIONS_WIDTH = 310

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
  const [inviteHover,      setInviteHover]      = useState(false)
  const [invitePress,      setInvitePress]      = useState(false)

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
              onClick={() => setActiveFilter(tab)}
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

        {/* Message list — empty state */}
        <div style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#AAAAAA' }}>
            No messages yet.
          </span>
        </div>

        {/* Invite to Webex button */}
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
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="7" cy="6" r="3" stroke="#FFFFFF" strokeWidth="1.4"/>
              <path d="M1 15c0-3.314 2.686-5 6-5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M14 11v6M11 14h6" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Invite to Webex
            </span>
          </button>
        </div>

      </div>

      {/* ── MessageStage — feature carousel empty state ── */}
      <MessageStage />

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
          >
            <ComposePanel onClose={() => setComposeOpen(false)} />
          </Dropdown>
        )}
      </AnimatePresence>

    </div>
  )
}
