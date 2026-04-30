import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useProfile } from '../../context/ProfileContext'
import { webexTestMeetingIllustrationUrl } from '../../constants/publicIllustrations'
import { PreJoinModal } from '../enterprise-meeting/PreJoinModal'
import { Dropdown } from '../../enterprise-components/Dropdown'

/* ─────────────────────────────────────────────────────────
 * Figma content column spec:
 *   x:134, y:60 (within scrollable area), width:960, gap:64 between sections
 *
 * Section 1 — Welcome:
 *   "Welcome, {name}!" h1 (20px 600 white), marginBottom 24
 *   Banner row: LEFT illustration + RIGHT copy (single #1A1A1A fill + 1px hairline border)
 *
 * Section 2 — Meetings:
 *   Header row: "Meetings" h2 + "Connect your calendar" btn (only if not connected)
 *   3 tiles row, gap 20: each bg #3A3A3A, radius 12, padding 20px 24px; icon + label in one row
 * ───────────────────────────────────────────────────────── */

function StartDropItem({ label, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 16px',
        fontSize: 14, fontWeight: 500, color: '#FFFFFF',
        background: hovered ? '#383838' : 'transparent',
        cursor: 'pointer', transition: 'background 0.12s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {label}
    </div>
  )
}

export function MeetingsTab({ calendarConnected, onConnectCalendar, fromMeeting = false, meetingElapsed = 0 }) {
  const [tileHover,    setTileHover]    = useState(null)
  const [startDropOpen,    setStartDropOpen]    = useState(false)
  const [scheduleDropOpen, setScheduleDropOpen] = useState(false)
  const startTileRef      = useRef(null)
  const scheduleTileRef   = useRef(null)
  const startCloseTimer    = useRef(null)
  const scheduleCloseTimer = useRef(null)

  function startCloseDelay()    { startCloseTimer.current    = setTimeout(() => setStartDropOpen(false),    200) }
  function cancelCloseDelay()   { clearTimeout(startCloseTimer.current) }
  function schedCloseDelay()    { scheduleCloseTimer.current = setTimeout(() => setScheduleDropOpen(false), 200) }
  function cancelSchedDelay()   { clearTimeout(scheduleCloseTimer.current) }

  useEffect(() => {
    if (!startDropOpen) return
    function handleClick(e) {
      if (!startTileRef.current?.contains(e.target)) setStartDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [startDropOpen])

  useEffect(() => {
    if (!scheduleDropOpen) return
    function handleClick(e) {
      if (!scheduleTileRef.current?.contains(e.target)) setScheduleDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [scheduleDropOpen])

  const [btnHover, setBtnHover]       = useState(false)
  const [preJoinOpen, setPreJoinOpen] = useState(false)
  const [joinOpen, setJoinOpen]       = useState(false)
  const [copied, setCopied]           = useState(false)
  const [roomTooltip, setRoomTooltip] = useState(false)

  const { profile } = useProfile()

  const personalRoomUrl = `https://webex.com/meet/${(profile?.name || 'you').toLowerCase().replace(/\s+/g, '.')}`

  function copyPersonalRoom() {
    navigator.clipboard.writeText(personalRoomUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
    {/* Full-area card — fills the scrollable column, small padding all sides */}
    <div style={{
      margin: 4,
      height: 'calc(100% - 8px)',
      background: '#1A1A1A',
      border: '1px solid #494949',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Full-width scroll wrapper — scrollbar sits at right edge of the card */}
      {/* paddingBottom 340 = checklist height (~300px) + 20px gap + buffer, so last card scrolls clear */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '32px 32px 340px', boxSizing: 'border-box' }}>

      {/* Inner content column — centered */}
      <div style={{ width: 'clamp(560px, 85%, 960px)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* ── Section 1 — Welcome banner (hidden after first meeting) ── */}
        <AnimatePresence>
          {!fromMeeting && (
            <motion.div
              key="welcome-banner"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <h1 style={{
                fontSize: 20, fontWeight: 600, color: '#FFFFFF',
                margin: 0, lineHeight: '28px',
              }}>
                Welcome, {profile.name}!
              </h1>

              {/* Banner row — fills match page card; hairline border for edge */}
              <div style={{
                display: 'flex',
                width: '100%',
                minHeight: 200,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxSizing: 'border-box',
                background: '#1A1A1A',
              }}>
                <div style={{
                  width: 320, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 24, boxSizing: 'border-box',
                }}>
                  <img
                    src={webexTestMeetingIllustrationUrl}
                    alt="Illustration of a test video meeting"
                    width="260"
                    style={{ display: 'block' }}
                  />
                </div>

                <div style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '32px 40px',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', gap: 32,
                  boxSizing: 'border-box',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '28px' }}>
                      Try a quick test meeting
                    </h2>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#AAAAAA', margin: 0, maxWidth: 325, lineHeight: '20px' }}>
                      Experience how your meetings will look and feel.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreJoinOpen(true)}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      background: btnHover ? '#2BAB7E' : '#1D8160',
                      border: 'none', borderRadius: 9999,
                      height: 48, padding: '0 24px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      cursor: 'pointer', width: 'fit-content',
                      transition: 'background 0.15s',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path fill="#FFFFFF" d="M5 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-.321l3.037 2.097a1.25 1.25 0 0 0 1.96-1.029V6.252a1.25 1.25 0 0 0-1.96-1.028L13 7.32V7a3 3 0 0 0-3-3zm8 4.536l3.605-2.49a.25.25 0 0 1 .392.206v7.495a.25.25 0 0 1-.392.206L13 11.463zM3 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Start a test meeting</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Section 2 — Meetings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Header block — heading + personal room tightly grouped */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              fontSize: 20, fontWeight: 600, color: '#FFFFFF',
              margin: 0, lineHeight: '28px',
            }}>
              Meetings
            </h2>
            {!calendarConnected && (
              <button
                onClick={() => onConnectCalendar?.()}
                style={{
                  background: '#222222',
                  border: '1px solid #494949',
                  borderRadius: 8, padding: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20">
                  <path fill="#FFFFFF" d="M7 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m1 2a1 1 0 1 1-2 0a1 1 0 0 1 2 0m2-2a1 1 0 1 0 0-2a1 1 0 0 0 0 2m4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5zM4 7h12v7.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5zm1.5-3h9A1.5 1.5 0 0 1 16 5.5V6H4v-.5A1.5 1.5 0 0 1 5.5 4"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>
                  Connect your calendar
                </span>
              </button>
            )}

          </div>

          {/* ── Personal room row ── */}
          <div
            onMouseEnter={() => setRoomTooltip(true)}
            onMouseLeave={() => setRoomTooltip(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', width: 'fit-content' }}
          >
            {/* Tooltip */}
            {roomTooltip && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                background: '#333333', border: '1px solid #494949',
                borderRadius: 6, padding: '5px 10px',
                fontSize: 12, color: '#FFFFFF', whiteSpace: 'nowrap',
                fontFamily: "'Inter', system-ui, sans-serif",
                pointerEvents: 'none', zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}>
                Personal meeting room link
              </div>
            )}

            {/* Icon with rounded bg */}
            <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: '#2A2A2A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#AAAAAA" strokeWidth="1.6"/>
                <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#AAAAAA" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Full URL */}
            <span style={{
              fontSize: 15, color: '#CCCCCC',
              fontFamily: "'Inter', system-ui, sans-serif",
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {personalRoomUrl}
            </span>

            {/* Copy button — always visible */}
            <button
              onClick={copyPersonalRoom}
              title={copied ? 'Copied!' : 'Copy link'}
              style={{
                flexShrink: 0, background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
              }}
            >
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="#1D8160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="#888888" strokeWidth="1.6"/>
                  <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" stroke="#888888" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
          </div>{/* end header block */}

          {/* Action tiles — icon + label on one row */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: 30, position: 'relative', marginBottom: 40 }}>

            {/* ── Start tile (with dropdown) ── */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <div
                ref={startTileRef}
                onMouseEnter={() => { setTileHover('start'); cancelCloseDelay() }}
                onMouseLeave={() => { setTileHover(null); startCloseDelay() }}
                onClick={() => setStartDropOpen(o => !o)}
                style={{
                  width: '100%',
                  background: fromMeeting
                    ? (tileHover === 'start' || startDropOpen ? '#2BAB7E' : '#1D8160')
                    : (tileHover === 'start' || startDropOpen ? '#444444' : '#3A3A3A'),
                  borderRadius: 12, padding: '20px 24px',
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'background 0.15s',
                  boxSizing: 'border-box',
                }}
              >
                {/* Iconify mdi:video — filled */}
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
                  <path fill="#FFFFFF" d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11z"/>
                </svg>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Start a meeting</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: startDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <path d="M3 6l5 5 5-5" stroke={fromMeeting ? 'rgba(255,255,255,0.7)' : '#AAAAAA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Start dropdown */}
              <AnimatePresence>
                {startDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onMouseEnter={cancelCloseDelay}
                    onMouseLeave={startCloseDelay}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                      background: '#2A2A2A',
                      border: '1px solid #494949',
                      borderRadius: 8,
                      overflow: 'hidden',
                      zIndex: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {[
                      { label: 'Instant meeting', action: () => { setStartDropOpen(false); setPreJoinOpen(true) } },
                      { label: 'Personal Room', action: () => setStartDropOpen(false) },
                    ].map((item, i) => (
                      <StartDropItem key={i} label={item.label} onClick={item.action} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Join tile ── */}
            <div
              onMouseEnter={() => setTileHover('join')}
              onMouseLeave={() => setTileHover(null)}
              onClick={() => setJoinOpen(true)}
              style={{
                flex: 1, minWidth: 0,
                background: tileHover === 'join' || joinOpen ? '#444444' : '#3A3A3A',
                borderRadius: 12, padding: '20px 24px',
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
                cursor: 'pointer', transition: 'background 0.15s',
                boxSizing: 'border-box',
              }}
            >
              {/* Iconify line-md:link — static stroke (source uses animated dash; full path for UI) */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
                <path
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 6l2-2c1-1 3-1 4 0l1 1c1 1 1 3 0 4l-5 5c-1 1-3 1-4 0M11 18l-2 2c-1 1-3 1-4 0l-1-1c-1-1-1-3 0-4l5-5c1-1 3-1 4 0"
                />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Join a meeting</span>
            </div>

            {/* ── Schedule tile ── */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <div
                ref={scheduleTileRef}
                onMouseEnter={() => { setTileHover('schedule'); cancelSchedDelay() }}
                onMouseLeave={() => { setTileHover(null); schedCloseDelay() }}
                onClick={() => setScheduleDropOpen(o => !o)}
                style={{
                  width: '100%',
                  background: tileHover === 'schedule' || scheduleDropOpen ? '#444444' : '#3A3A3A',
                  borderRadius: 12, padding: '20px 24px',
                  display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'background 0.15s',
                  boxSizing: 'border-box',
                }}
              >
                {/* Iconify mdi:calendar-plus — filled */}
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
                  <path fill="#FFFFFF" d="M19 19V8H5v11zM16 1h2v2h1a2 2 0 0 1 2 2v14c0 1.11-.89 2-2 2H5a2 2 0 0 1-2-2V5c0-1.11.89-2 2-2h1V1h2v2h8zm-5 8.5h2v3h3v2h-3v3h-2v-3H8v-2h3z"/>
                </svg>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Schedule</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: scheduleDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                    <path d="M3 6l5 5 5-5" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <AnimatePresence>
                {scheduleDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onMouseEnter={cancelSchedDelay}
                    onMouseLeave={schedCloseDelay}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                      background: '#2A2A2A',
                      border: '1px solid #494949',
                      borderRadius: 8,
                      overflow: 'hidden',
                      zIndex: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  >
                    {[
                      { label: 'Meeting' },
                      { label: 'Webinar' },
                    ].map((item, i) => (
                      <StartDropItem key={i} label={item.label} onClick={() => setScheduleDropOpen(false)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Calendar view — appears when calendar is connected OR after returning from a meeting */}
          <AnimatePresence>
            {(calendarConnected || fromMeeting) && (
              <motion.div
                key="past-meeting"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
              >
                <PastMeetingCard elapsed={meetingElapsed} profile={profile} calendarConnected={calendarConnected} fromMeeting={fromMeeting} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      </div>{/* end scroll wrapper */}

    </div>{/* end outer card */}

    <AnimatePresence>
      {preJoinOpen && <PreJoinModal onClose={() => setPreJoinOpen(false)} />}
    </AnimatePresence>

    <AnimatePresence>
      {joinOpen && <JoinMeetingModal onClose={() => setJoinOpen(false)} />}
    </AnimatePresence>
    </>
  )
}

/* ── Join Meeting Modal ───────────────────────────────── */
/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — JoinMeetingModal error state
 *
 *    0ms   Join pressed with invalid input
 *    0ms   input border flashes red (instant)
 *    0ms   input wiggles  x: 0 → -8 → 8 → -6 → 6 → -3 → 3 → 0
 *   60ms   error message slides in  y: -4 → 0, opacity 0 → 1
 * ───────────────────────────────────────────────────────── */

const ERROR = {
  wiggle:    [0, -8, 8, -6, 6, -3, 3, 0],   // x keyframes — fast shake
  wiggleT:   { duration: 0.4, ease: 'easeInOut' },
  borderRed: '#E53935',
  borderNorm:'#494949',
  msgDelay:   0.06,   // s — error text lags slightly behind wiggle
  msgSpring: { type: 'spring', stiffness: 420, damping: 28 },
  msgOffsetY: -4,     // px — slides down from above
}

function isValidMeetingInput(v) {
  const s = v.trim()
  return /^\d{9,}$/.test(s) || s.includes('.') || s.includes('/')
}

function JoinMeetingModal({ onClose }) {
  const [value,    setValue]    = useState('')
  const [errorKey, setErrorKey] = useState(0)   // increments to replay wiggle
  const [hasError, setHasError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  function handleChange(e) {
    setValue(e.target.value)
    if (hasError) setHasError(false)
  }

  function handleJoin() {
    if (!value.trim()) return
    if (!isValidMeetingInput(value)) {
      setHasError(true)
      setErrorKey(k => k + 1)
      return
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 420,
          background: '#1A1A1A',
          border: '1px solid #383838',
          borderRadius: 16,
          padding: '28px 28px 24px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
          Join a meeting
        </p>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#888888', lineHeight: '20px' }}>
          Enter a meeting link or number to join.
        </p>

        {/* Input — wiggles on error */}
        <motion.div
          key={errorKey}
          animate={{ x: hasError ? ERROR.wiggle : 0 }}
          transition={ERROR.wiggleT}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#222222',
            border: `1px solid ${hasError ? ERROR.borderRed : ERROR.borderNorm}`,
            borderRadius: 10,
            padding: '11px 14px',
            marginBottom: hasError ? 8 : 16,
            transition: 'border-color 0.15s',
          }}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="Meeting link or number"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              fontSize: 14, color: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
              caretColor: '#FFFFFF',
            }}
          />
          {value && (
            <button onClick={() => { setValue(''); setHasError(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="#666666" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </motion.div>

        {/* Error message — slides in after wiggle */}
        <AnimatePresence>
          {hasError && (
            <motion.p
              initial={{ opacity: 0, y: ERROR.msgOffsetY }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: ERROR.msgOffsetY }}
              transition={{ ...ERROR.msgSpring, delay: ERROR.msgDelay }}
              style={{
                margin: '0 0 14px 2px',
                fontSize: 12, color: ERROR.borderRed, lineHeight: '18px',
              }}
            >
              Incorrect information — please check and try again.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            type="button"
            style={{
              flex: 1, padding: '11px 0',
              background: '#2A2A2A', border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleJoin}
            disabled={!value.trim()}
            style={{
              flex: 2, padding: '10px 0',
              background: value.trim() ? '#1D8160' : '#1A2E28',
              border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 600, color: value.trim() ? '#FFFFFF' : '#3A6A55',
              cursor: value.trim() ? 'pointer' : 'default',
              fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            Join
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Calendar helpers ─────────────────────────────────── */

function getWeekStart(d) {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() // 0 = Sun
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)) // Monday-first
  return date
}

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

function fmt12(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const DAY_ABBR       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PICKER_DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CHIPS    = ['Meeting Summary', 'Transcript', 'Chat Messages']
const SEGMENTS = ['Day', 'Week']

/* ── Date picker popover ───────────────────────────────── */
function DatePickerPopover({ viewDate, activeSeg, onSelect, onClose }) {
  const today = new Date()
  const [pickerMonth, setPickerMonth] = useState(() =>
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  )

  function prevMonth() { setPickerMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)) }
  function nextMonth() { setPickerMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)) }

  // Grid starts on the Sunday before (or on) the 1st of the month
  const firstOfMonth = pickerMonth
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  const monthLabel = pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function isHighlighted(cell) {
    if (activeSeg === 'Week') {
      const ws = getWeekStart(viewDate)
      return cell >= ws && cell <= addDays(ws, 6)
    }
    return isSameDay(cell, viewDate)
  }

  return (
    <div style={{
      width: 288,
      background: '#111111',
      border: '1px solid #2E2E2E',
      borderRadius: 16,
      padding: '16px 16px 12px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.65)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {/* Month header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{monthLabel}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['‹', prevMonth], ['›', nextMonth]].map(([ch, fn]) => (
            <button key={ch} onClick={fn} style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#888888', fontSize: 18, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{ch}</button>
          ))}
        </div>
      </div>

      {/* Day name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {PICKER_DAY_ABBR.map(d => (
          <span key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 600,
            color: '#666666', textTransform: 'uppercase', letterSpacing: '0.03em',
            paddingBottom: 4,
          }}>{d}</span>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          const inMonth  = cell.getMonth() === pickerMonth.getMonth()
          const isToday  = isSameDay(cell, today)
          const selected = isHighlighted(cell)

          return (
            <button
              key={i}
              onClick={() => { onSelect(cell); onClose() }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: isToday ? '#2E96E8' : (selected && !isToday ? 'rgba(255,255,255,0.06)' : 'none'),
                border: selected && !isToday ? '1px solid #595959' : '1px solid transparent',
                color: !inMonth ? '#383838' : isToday ? '#FFFFFF' : '#E9E9E9',
                fontSize: 13, fontWeight: isToday ? 600 : 400,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                transition: 'background 0.1s',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >{cell.getDate()}</button>
          )
        })}
      </div>
    </div>
  )
}
const DETAIL_TABS = ['About', 'Meeting summary', 'Transcript', 'Chat messages']

const MEETING_NOTES_DATA = {
  overview: 'A first-time onboarding test call with Cisco AI. Audio and video were verified and working. Cisco AI walked through its in-meeting and post-meeting capabilities to help the user get comfortable before their first real Webex meeting.',
  highlights: [
    'Audio and video confirmed working — no setup changes needed.',
    'Cisco AI can provide live summaries, flag action items, and help latecomers catch up mid-call.',
    'Post-meeting detail view explored — summary, transcript, and action items are all accessible after a call ends.',
    'User found the layout intuitive and felt ready for their first real meeting.',
  ],
  decisions: [
    'No configuration changes required — setup is complete out of the box.',
    'User will rely on Cisco AI during upcoming meetings to explore its full feature set.',
  ],
}

const INITIAL_ACTION_ITEMS = [
  { id: 1, text: 'Try asking Cisco AI to summarize the meeting during your next call.' },
  { id: 2, text: 'Use the \'Catch me up\' chip if you ever join a meeting late.' },
  { id: 3, text: 'Check back in the meeting detail view after your next call to review the summary and transcript.' },
]

/* ── Shared card primitives ────────────────────────────── */

function CardShell({ children, accent = '#2E2E2E', onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={onClick ? () => setHov(true) : undefined}
      onMouseLeave={onClick ? () => setHov(false) : undefined}
      style={{
        background: hov ? '#232323' : '#1E1E1E',
        border: '1px solid #2E2E2E',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 6,
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.12s',
      }}
    >{children}</div>
  )
}

/* ── Cisco AI avatar (used in detail modal participants) ── */
function CiscoAIAvatar({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="cav-ring" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0051AF"/>
          <stop offset="67%"  stopColor="#0087EA"/>
          <stop offset="100%" stopColor="#00BCEB"/>
        </linearGradient>
        <linearGradient id="cav-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="#0087EA"/>
          <stop offset="84%" stopColor="#63FFF7"/>
        </linearGradient>
        <linearGradient id="cav-inner" x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="35%"  stopColor="rgba(116,191,75,0)"/>
          <stop offset="96%"  stopColor="#74BF4B"/>
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="17" fill="#1E2A3A"/>
      <circle cx="18" cy="18" r="12" stroke="url(#cav-ring)" strokeWidth="2" fill="none"/>
      <ellipse cx="24" cy="12" rx="6" ry="6" fill="url(#cav-lens)" opacity="0.85"/>
      <ellipse cx="24" cy="12" rx="4" ry="5" fill="url(#cav-inner)" opacity="0.9"/>
    </svg>
  )
}

/* ── Summary section card (Notes + Action Items) ───────── */
function SummarySection({ title, feedbackConfig, children }) {
  const [vote,         setVote]         = useState(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [copyTick,     setCopyTick]     = useState(false)

  function handleVote(v) {
    setVote(v)
    setTimeout(() => setFeedbackSent(true), 350)
  }

  return (
    <div style={{
      background: '#1C1C1C',
      border: '1px solid #2A2A2A',
      borderRadius: 10,
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 18px',
        borderBottom: '1px solid #222222',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{title}</span>
          <span style={{ fontSize: 12, color: '#d1d1d1', fontWeight: 600}}>·    Cisco AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Translate */}
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: 6,
            display: 'flex', alignItems: 'center', color: '#888888',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="m11.9 22l4.55-12h2.1l4.55 12H21l-1.075-3.05h-4.85L14 22zM4 19l-1.4-1.4l5.05-5.05q-.875-.875-1.588-2T4.75 8h2.1q.5.975 1 1.7t1.2 1.45q.825-.825 1.713-2.313T12.1 6H1V4h7V2h2v2h7v2h-2.9q-.525 1.8-1.575 3.7t-2.075 2.9l2.4 2.45l-.75 2.05l-3.05-3.125zm11.7-1.8h3.6l-1.8-5.1z"/>
            </svg>
          </button>
          {/* Copy — flips to a checkmark on click */}
          <button
            onClick={() => { setCopyTick(true); setTimeout(() => setCopyTick(false), 1500) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, borderRadius: 6,
              display: 'flex', alignItems: 'center',
              color: copyTick ? '#2BAB7E' : '#888888',
              transition: 'color 0.15s',
            }}
          >
            {copyTick ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 11H3a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 3 2h6A1.5 1.5 0 0 1 10.5 3.5V5"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 18px 20px' }}>
        {children}
      </div>

      {/* Feedback strip */}
      <div style={{
        padding: '14px 18px 16px',
        background: '#161616',
        borderTop: '1px solid #1F1F1F',
      }}>
        {feedbackSent ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="rgba(43,171,126,0.15)"/>
              <path d="M4 7l2 2 4-4" stroke="#2BAB7E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 12, color: '#666666' }}>
              Thanks for the feedback. Cisco AI will use this to improve.
            </span>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9', margin: '0 0 2px' }}>
              {feedbackConfig.prompt}
            </p>
            <p style={{ fontSize: 13, color: '#888888', margin: '0 0 10px', lineHeight: '18px' }}>
              {feedbackConfig.sub}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { val: 'up',   label: feedbackConfig.yes, activeColor: '#2BAB7E', activeBg: 'rgba(43,171,126,0.12)', icon: 'M3 6V11M3 6L6 2L8.5 5H11.5L10 11H3V6Z' },
                { val: 'down', label: feedbackConfig.no,  activeColor: '#E06050', activeBg: 'rgba(224,96,80,0.10)',   icon: 'M11 8V3M11 8L8 12L5.5 9H2.5L4 3H11V8Z' },
              ].map(btn => (
                <button
                  key={btn.val}
                  onClick={() => handleVote(btn.val)}
                  style={{
                    background: vote === btn.val ? btn.activeBg : '#202020',
                    border: `1px solid ${vote === btn.val ? btn.activeColor : '#2A2A2A'}`,
                    borderRadius: 6, padding: '5px 12px',
                    fontSize: 12, fontWeight: 500,
                    color: vote === btn.val ? btn.activeColor : '#888888',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d={btn.icon} stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                  {btn.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MeetingSummaryContent() {
  const [checked, setChecked] = useState({})
  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: 16, alignItems: 'start' }}>

      {/* ── Notes ── */}
      <SummarySection
        title="Notes"
        feedbackConfig={{
          prompt: 'Was this summary accurate?',
          yes:    'Accurate',
          no:     'Not quite',
        }}
      >
        <p style={{ fontSize: 14, color: '#FFFFFF', margin: '0 0 18px', lineHeight: '24px' }}>
          {MEETING_NOTES_DATA.overview}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
          {MEETING_NOTES_DATA.highlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#FFFFFF', lineHeight: '24px' }}>
              <span style={{ color: '#383838', flexShrink: 0, userSelect: 'none' }}>·</span>
              {h}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {MEETING_NOTES_DATA.decisions.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: '#FFFFFF', lineHeight: '24px' }}>
              <span style={{ color: '#383838', flexShrink: 0, userSelect: 'none' }}>·</span>
              {d}
            </div>
          ))}
        </div>
      </SummarySection>

      {/* ── Action items ── */}
      <SummarySection
        title="Action items"
        feedbackConfig={{
          prompt: 'Are these action items complete?',
          
          yes:    'Yes, complete',
          no:     'No, incomplete',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {INITIAL_ACTION_ITEMS.map(item => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
                border: `1.5px solid ${checked[item.id] ? '#2E96E8' : '#383838'}`,
                background: checked[item.id] ? '#2E96E8' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {checked[item.id] && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: 14, lineHeight: '20px',
                color: checked[item.id] ? '#494949' : '#E9E9E9',
                textDecoration: checked[item.id] ? 'line-through' : 'none',
                transition: 'color 0.15s',
              }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </SummarySection>

    </div>
  )
}

/* ── Transcript tab ────────────────────────────────────── */

function highlight(text, query) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{
        background: 'rgba(46,150,232,0.22)', color: '#FFFFFF',
        borderRadius: 2, padding: '0 1px',
      }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const TRANSCRIPT_ENTRIES = [
  { id: 1,  speaker: 'ai',   time: '0:00:04', text: "Welcome to Webex! I'm Cisco AI, your meeting assistant. This is a quick test call to make sure everything is working before your first real meeting." },
  { id: 2,  speaker: 'user', time: '0:00:18', text: 'Hi! Yeah, can you hear me okay?' },
  { id: 3,  speaker: 'ai',   time: '0:00:22', text: "Loud and clear! Your audio is coming through perfectly. Your video looks great too — you're all set on both." },
  { id: 4,  speaker: 'user', time: '0:00:35', text: "That's good to know. So what can you actually do during a meeting?" },
  { id: 5,  speaker: 'ai',   time: '0:00:41', text: "Quite a lot. I can give you a live summary, flag action items as they come up, answer questions, and help you catch up if you join late. Just ask." },
  { id: 6,  speaker: 'user', time: '0:01:02', text: 'What about after the meeting — is there a way to go back and review everything?' },
  { id: 7,  speaker: 'ai',   time: '0:01:08', text: "Yes — once a call ends you'll find the full summary, action items, and this transcript right in the meeting detail view. That's actually where you are right now." },
  { id: 8,  speaker: 'user', time: '0:01:28', text: 'Oh nice, so this is what it looks like. The layout is pretty clean.' },
  { id: 9,  speaker: 'ai',   time: '0:01:33', text: "Glad you like it! You can search the transcript, translate it, or copy it out. And if my summary ever misses something, the feedback buttons help me improve over time." },
  { id: 10, speaker: 'user', time: '0:01:52', text: "That's really helpful. I think I'm good to go." },
  { id: 11, speaker: 'ai',   time: '0:01:56', text: "You're all set. I'll be here in every meeting whenever you need me. Good luck out there!" },
]
const CHAT_MESSAGES = [
  { id: 1, speaker: 'ai',   timeLabel: '3:55 PM', text: "Welcome! Feel free to use this chat to share links, notes, or questions during any meeting." },
  { id: 2, speaker: 'user', timeLabel: '3:56 PM', text: "Got it — just testing the chat!" },
  { id: 3, speaker: 'ai',   timeLabel: '3:56 PM', text: "Looks good! Chat history from every meeting is saved here so you can review it any time after the call ends." },
  { id: 4, speaker: 'user', timeLabel: '3:57 PM', text: "That's really useful. So I can come back and read this later?" },
  { id: 5, speaker: 'ai',   timeLabel: '3:57 PM', text: "Exactly — just open the meeting detail and head to Chat messages. It'll always be here." },
]

function TranscriptContent({ profile }) {
  const [search, setSearch] = useState('')
  const [focused, setFocused] = useState(false)
  const [copied, setCopied] = useState(false)

  const initials = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  const filtered = search.trim()
    ? TRANSCRIPT_ENTRIES.filter(e =>
        e.text.toLowerCase().includes(search.toLowerCase())
      )
    : TRANSCRIPT_ENTRIES

  function copyTranscript() {
    const text = TRANSCRIPT_ENTRIES.map(e => {
      const name = e.speaker === 'ai' ? 'Cisco AI' : profile.name
      return `[${e.time}] ${name}: ${e.text}`
    }).join('\n\n')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Search bar + Copy button */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'stretch' }}>

        {/* Search bar */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: '#1C1C1C',
          border: `1px solid ${focused ? '#494949' : '#2A2A2A'}`,
          borderRadius: 8,
          padding: '9px 14px',
          transition: 'border-color 0.15s',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="5.8" cy="5.8" r="4" stroke="#494949" strokeWidth="1.3"/>
            <path d="M9 9L12 12" stroke="#494949" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search transcript"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: 14, color: '#FFFFFF', caretColor: '#FFFFFF',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', color: '#666666' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Copy transcript button */}
        <button
          onClick={copyTranscript}
          title="Copy transcript"
          style={{
            background: '#1C1C1C',
            border: `1px solid ${copied ? '#3A3A3A' : '#2A2A2A'}`,
            borderRadius: 8,
            padding: '0 11px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: copied ? '#5BA4F5' : '#888888',
            flexShrink: 0,
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"/>
            </svg>
          )}
        </button>

      </div>

      {/* Entries */}
      {filtered.length > 0 ? (
        <div>
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '13px 0',
                borderBottom: i < filtered.length - 1 ? '1px solid #1E1E1E' : 'none',
              }}
            >
              {/* Avatar */}
              {entry.speaker === 'ai' ? (
                <div style={{ marginTop: 1, flexShrink: 0 }}><CiscoAIAvatar size={32} /></div>
              ) : profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 1 }}
                />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#3D4A5C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: '#FFFFFF', flexShrink: 0, marginTop: 1,
                }}>
                  {initials}
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, color: '#E9E9E9', margin: '0 0 5px', lineHeight: '24px' }}>
                  {highlight(entry.text, search)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#888888' }}>
                    {entry.speaker === 'ai' ? 'Cisco AI' : profile.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#888888', flexShrink: 0, marginLeft: 16 }}>
                    {entry.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#666666' }}>No results for &ldquo;{search}&rdquo;</span>
        </div>
      )}

    </div>
  )
}

/* ── Chat messages tab ─────────────────────────────────── */
function ChatContent({ profile }) {
  const initials = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  const today    = new Date()
  const weekday  = today.toLocaleDateString('en-US', { weekday: 'long' })
  const shortDate = today.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
  const dateHeader = `${weekday} · ${shortDate}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Date header */}
      <div style={{ textAlign: 'center', paddingBottom: 20 }}>
        <span style={{ fontSize: 12, color: '#666666' }}>{dateHeader}</span>
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {CHAT_MESSAGES.map(msg => {
          const isAI = msg.speaker === 'ai'
          const name = isAI ? 'Cisco AI' : profile.name
          const timestamp = `${shortDate}, ${msg.timeLabel}`
          return (
            <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Avatar */}
              {isAI ? (
                <CiscoAIAvatar size={36} />
              ) : profile.photoUrl ? (
                <img src={profile.photoUrl} alt={name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#3D4A5C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
                }}>{initials}</div>
              )}
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9' }}>{name}</span>
                  <span style={{ fontSize: 12, color: '#888888' }}>{timestamp}</span>
                </div>
                <p style={{ fontSize: 14, color: '#D9D9D9', margin: 0, lineHeight: '20px' }}>
                  {msg.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

/* ── Meeting Detail Modal ──────────────────────────────── */
const DOWNLOAD_WIDTH = 220

function DownloadPanel({ onClose }) {
  const [hovered, setHovered] = useState(null)
  const items = ['Transcript', 'Chat messages']
  return (
    <div style={{
      width: DOWNLOAD_WIDTH,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 12,
      padding: 8,
      display: 'flex', flexDirection: 'column', gap: 2,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {items.map(item => (
        <div
          key={item}
          onMouseEnter={() => setHovered(item)}
          onMouseLeave={() => setHovered(null)}
          onClick={onClose}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            cursor: 'pointer',
            background: hovered === item ? '#1E1E1E' : 'transparent',
            transition: 'background 0.12s',
            fontSize: 14, fontWeight: 400,
            color: '#FFFFFF',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}

function MeetingDetailModal({ onClose, elapsed, profile, initialTab = 'About' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [partsOpen, setPartsOpen] = useState(true)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const downloadRef = useRef(null)

  const mins      = Math.max(1, Math.floor(elapsed / 60))
  const endTime   = new Date()
  const startTime = new Date(endTime - elapsed * 1000)
  const dateStr   = startTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const timeRange = `${fmt12(startTime)} – ${fmt12(endTime)}`
  const initials  = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 920,
          height: '74vh',
          background: '#141414',
          border: '1px solid #2E2E2E',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Title area ── */}
        <div style={{ padding: '28px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '30px' }}>
                Test call with {profile.name}
              </h2>
              <p style={{ fontSize: 13, color: '#888888', margin: '4px 0 0', lineHeight: '20px' }}>
                {dateStr}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, marginTop: -4,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Tabs + action buttons */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: 20, paddingBottom: 12, borderBottom: '1px solid #242424',
          }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {DETAIL_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#323232' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? '#FFFFFF' : '#888888',
                    transition: 'background 0.12s, color 0.12s',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >{tab}</button>
              ))}
            </div>
            {/* Action icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Download + chevron grouped pill */}
              <div
                ref={downloadRef}
                style={{
                  display: 'flex', alignItems: 'center',
                  border: '1px solid #333333',
                  borderRadius: 8, overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setDownloadOpen(o => !o)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '7px 8px', display: 'flex', alignItems: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v9M5 9l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 14h12" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
                <button
                  onClick={() => setDownloadOpen(o => !o)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '7px 7px', display: 'flex', alignItems: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {/* Share */}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="14" cy="4" r="2"  stroke="#AAAAAA" strokeWidth="1.3"/>
                  <circle cx="4"  cy="9" r="2"  stroke="#AAAAAA" strokeWidth="1.3"/>
                  <circle cx="14" cy="14" r="2" stroke="#AAAAAA" strokeWidth="1.3"/>
                  <path d="M6 8l6-3M6 10l6 3" stroke="#AAAAAA" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, overflowY: 'auto' }}>

          {/* Left: tab content */}
          <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
            {activeTab === 'Meeting summary' ? (
              <MeetingSummaryContent />
            ) : activeTab === 'Transcript' ? (
              <TranscriptContent profile={profile} />
            ) : activeTab === 'About' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* Date + time row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                    <circle cx="9" cy="9" r="7" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M9 5.5V9l2.5 2" stroke="#888888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 14, color: '#E9E9E9', lineHeight: '20px' }}>{dateStr}</span>
                    <span style={{ fontSize: 14, color: '#888888', lineHeight: '18px' }}>{timeRange} · {mins} min</span>
                  </div>
                </div>

                {/* Participants count row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="6.5" r="2.8" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M1.5 15.5c0-3.04 2.46-5.5 5.5-5.5" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="13" cy="7" r="2.1" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M11 15.5c0-2.21 1.79-4 4-4" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>2 participants</span>
                </div>

                {/* Description row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                    <path d="M3 5h12M3 9h9M3 13h6" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9', margin: '0 0 6px' }}>Description</p>
                    <p style={{ fontSize: 14, color: '#666666', margin: 0, lineHeight: '20px' }}>No description added.</p>
                  </div>
                </div>

              </div>
            ) : activeTab === 'Chat messages' ? (
              <ChatContent profile={profile} />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 200,
              }}>
                <span style={{ fontSize: 13, color: '#666666' }}>No content yet.</span>
              </div>
            )}
          </div>

          {/* Right: Participants panel — About tab only */}
          {activeTab === 'About' && <div style={{
            width: 256, flexShrink: 0,
            borderLeft: '1px solid #242424',
            padding: '20px 20px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <button
              onClick={() => setPartsOpen(x => !x)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ transform: partsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s', flexShrink: 0 }}
              >
                <path d="M3 5l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#888888' }}>Participants</span>
            </button>

            {partsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Profile user */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={profile.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: '#3D4A5C',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
                    }}>
                      {initials}
                    </div>
                  )}
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>{profile.name}</span>
                </div>
                {/* Cisco AI */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CiscoAIAvatar size={36} />
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>Cisco AI</span>
                </div>
              </div>
            )}
          </div>}

        </div>

        {/* Chat closed footer */}
        {activeTab === 'Chat messages' && (
          <div style={{
            padding: '13px 28px',
            borderTop: '1px solid #1F1F1F',
            textAlign: 'center',
            flexShrink: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            <span style={{ fontSize: 14, color: '#FFFFFF' }}>The meeting conversation is closed.</span>
          </div>
        )}

      </motion.div>

      {/* Download dropdown */}
      <AnimatePresence>
        {downloadOpen && (
          <Dropdown
            anchorRef={downloadRef}
            onClose={() => setDownloadOpen(false)}
            anchor="bottom-right"
            offsetY={6}
          >
            <DownloadPanel onClose={() => setDownloadOpen(false)} />
          </Dropdown>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

/* ── State 4: Past ─────────────────────────────────────── */
function MeetingRow({ elapsed, profile, chipHover, setChipHover, onClick, onChipClick }) {
  const [hov, setHov] = useState(false)
  const mins      = Math.max(1, Math.floor(elapsed / 60))
  const endTime   = new Date()
  const startTime = new Date(endTime - elapsed * 1000)
  const timeRange = `${fmt12(startTime)} – ${fmt12(endTime)}`
  const initials  = profile.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px',
        background: hov ? '#2A2A2A' : '#222222',
        border: '1px solid #2E2E2E',
        borderRadius: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.12s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: '#7C3EC3', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{initials}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>

        {/* Row 1 — Title */}
        <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF' }}>
          Test call with {profile.name}
        </span>

        {/* Row 2 — time · duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#999CA2' }}>{timeRange} · {mins} min</span>
        </div>

        {/* Row 3 — Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {CHIPS.map(chip => (
            <button
              key={chip}
              onMouseEnter={() => setChipHover(chip)}
              onMouseLeave={() => setChipHover(null)}
              onClick={e => { e.stopPropagation(); onChipClick?.(CHIP_TAB_MAP[chip]) }}
              style={{
                background: chipHover === chip ? '#383838' : '#2A2A2A',
                border: '1px solid #3A3A3A',
                borderRadius: 5, padding: '3px 10px',
                fontSize: 12, fontWeight: 500, color: '#FFFFFF', lineHeight: '18px',
                cursor: 'pointer', transition: 'background 0.15s',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >{chip}</button>
          ))}
        </div>
      </div>

      {/* Trailing share icon */}
      <div style={{ flexShrink: 0, opacity: hov ? 1 : 0.35, transition: 'opacity 0.15s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 4v4C6.425 9.028 3.98 14.788 3 20c-.037.206 5.384-5.962 10-6v4l8-7z"/>
        </svg>
      </div>
    </div>
  )
}

/* ── Upcoming (future) meeting rows — Figma node 1675-4077 ── */
/* ── Fake meeting definitions (static metadata, times computed dynamically) ── */
const FAKE_MEETING_META = [
  { title: 'Q2 Planning Session',    space: 'Strategy · Finance',      initials: 'AK', avatarColor: '#5B5BD6', durationMins: 60  },
  { title: '1:1 with Sarah Chen',    space: "Sarah's Room",             initials: 'SC', avatarColor: '#E5534B', durationMins: 30  },
  { title: 'Product Roadmap Review', space: 'Product · Engineering',    initials: 'MJ', avatarColor: '#2E7D32', durationMins: 60  },
]
const FAKE_OFFSETS_MINS = [30, 150, 240]   // +30 min, +2h 30m, +4h from now

function makeFakeMeetings() {
  const now = new Date()
  return FAKE_MEETING_META.map((meta, i) => {
    const start = new Date(now.getTime() + FAKE_OFFSETS_MINS[i] * 60000)
    const end   = new Date(start.getTime() + meta.durationMins * 60000)
    return { ...meta, start, end }
  })
}

function fmtDate(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function minsFromNow(date) {
  return Math.round((date - new Date()) / 60000)
}

function UpcomingMeetingRow({ title, space, initials, avatarColor, start, end, isNext }) {
  const [hov,      setHov]      = useState(false)
  const [joinHov,  setJoinHov]  = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const timeRange  = `${fmtDate(start)} – ${fmtDate(end)}`
  const diff       = minsFromNow(start)
  const startsInTxt = diff > 0 ? `Starts in ${diff}m` : 'Starting now'

  return (
    <>
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => setModalOpen(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px',
        background: hov ? '#2A2A2A' : '#222222',
        border: '1px solid #2E2E2E',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'background 0.12s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: avatarColor, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{initials}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>

        {/* Row 1 — Title + space */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{title}</span>
          <span style={{ fontSize: 13, color: '#999CA2', flexShrink: 0 }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999CA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#E9E9E9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{space}</span>
          </div>
        </div>

        {/* Row 2 — time · starts in (only for isNext) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#999CA2' }}>{timeRange}</span>
          {isNext && (
            <>
              <span style={{ fontSize: 12, color: '#999CA2' }}>·</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#4A9EFF' }}>{startsInTxt}</span>
            </>
          )}
        </div>

        {/* Row 3 — Join chip (only for isNext) */}
        {isNext && (
          <div>
            <button
              onMouseEnter={() => setJoinHov(true)}
              onMouseLeave={() => setJoinHov(false)}
              onClick={e => e.stopPropagation()}
              style={{
                background: joinHov ? '#1565B8' : '#1170CF',
                border: 'none', borderRadius: 5,
                padding: '4px 10px',
                fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                cursor: 'pointer', transition: 'background 0.15s',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >Join meeting</button>
          </div>
        )}
      </div>

      {/* Trailing share icon */}
      <div style={{ flexShrink: 0, opacity: hov ? 1 : 0.35, transition: 'opacity 0.15s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 4v4C6.425 9.028 3.98 14.788 3 20c-.037.206 5.384-5.962 10-6v4l8-7z"/>
        </svg>
      </div>
    </div>

    <AnimatePresence>
      {modalOpen && (
        <UpcomingMeetingModal
          title={title}
          space={space}
          start={start}
          end={end}
          initials={initials}
          avatarColor={avatarColor}
          onClose={() => setModalOpen(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}

/* ── Upcoming Meeting Modal ────────────────────────────── */
const UPCOMING_TABS = ['About', 'Meeting summary', 'Transcript', 'Chat messages']

const MEETING_PARTICIPANTS = {
  AK: [
    { initials: 'AK', color: '#5B5BD6', name: 'Alex Kim' },
    { initials: 'MR', color: '#9C27B0', name: 'Maya Roberts' },
    { initials: 'JW', color: '#0277BD', name: 'James Wilson' },
  ],
  SC: [
    { initials: 'SC', color: '#E5534B', name: 'Sarah Chen' },
  ],
  MJ: [
    { initials: 'MJ', color: '#2E7D32', name: 'Michael Johnson' },
    { initials: 'PS', color: '#C2185B', name: 'Priya Sharma' },
    { initials: 'TC', color: '#E65100', name: 'Tom Chen' },
  ],
}

function UpcomingMeetingModal({ title, space, start, end, initials, avatarColor, onClose }) {
  const [activeTab,  setActiveTab]  = useState('About')
  const [partsOpen,  setPartsOpen]  = useState(true)
  const { profile } = useProfile()
  const userInitials = profile.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

  const dateStr    = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const timeRange  = `${fmtDate(start)} – ${fmtDate(end)}`
  const durationMins = Math.round((end - start) / 60000)

  const otherParticipants = MEETING_PARTICIPANTS[initials] ?? []

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 920, height: '74vh',
          background: '#141414', border: '1px solid #2E2E2E',
          borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Title area */}
        <div style={{ padding: '28px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '30px' }}>{title}</h2>
              <p style={{ fontSize: 13, color: '#888888', margin: '4px 0 0', lineHeight: '20px' }}>{dateStr}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 6, marginTop: -4 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L13 13M13 3L3 13" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginTop: 20, paddingBottom: 12, borderBottom: '1px solid #242424' }}>
            {UPCOMING_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? '#323232' : 'none',
                  border: 'none', cursor: 'pointer', padding: '6px 14px',
                  borderRadius: 20, fontSize: 14,
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? '#FFFFFF' : '#888888',
                  transition: 'background 0.12s, color 0.12s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* Content row */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left scrollable area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {activeTab === 'About' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {/* Time */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                    <circle cx="9" cy="9" r="7" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M9 5.5V9l2.5 2" stroke="#888888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 14, color: '#E9E9E9', lineHeight: '20px' }}>{dateStr}</span>
                    <span style={{ fontSize: 14, color: '#888888', lineHeight: '18px' }}>{timeRange} · {durationMins} min</span>
                  </div>
                </div>
                {/* Space */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>{space}</span>
                </div>
                {/* Participants count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="6.5" r="2.8" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M1.5 15.5c0-3.04 2.46-5.5 5.5-5.5" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="13" cy="7" r="2.1" stroke="#888888" strokeWidth="1.3"/>
                    <path d="M11 15.5c0-2.21 1.79-4 4-4" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 14, color: '#E9E9E9' }}>{otherParticipants.length + 1} participants invited</span>
                </div>
                {/* Description */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                    <path d="M3 5h12M3 9h9M3 13h6" stroke="#888888" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9', margin: '0 0 6px' }}>Description</p>
                    <p style={{ fontSize: 14, color: '#666666', margin: 0, lineHeight: '20px' }}>No description added.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Not started state for all other tabs */
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 14, paddingBottom: 40,
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#383838" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 3"/>
                </svg>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#555555', margin: 0 }}>This meeting hasn't started yet</p>
                <p style={{ fontSize: 13, color: '#3A3A3A', margin: 0, textAlign: 'center', maxWidth: 320, lineHeight: '20px' }}>
                  {activeTab === 'Meeting summary' && 'The AI-generated summary will appear here once the meeting ends.'}
                  {activeTab === 'Transcript' && 'The full transcript will be available after the meeting ends.'}
                  {activeTab === 'Chat messages' && 'Chat messages from the meeting will appear here after it ends.'}
                </p>
              </div>
            )}
          </div>

          {/* Right: Participants panel — About tab only */}
          {activeTab === 'About' && (
            <div style={{
              width: 256, flexShrink: 0,
              borderLeft: '1px solid #242424',
              padding: '20px 20px',
              display: 'flex', flexDirection: 'column', gap: 14,
              overflowY: 'auto',
            }}>
              <button
                onClick={() => setPartsOpen(x => !x)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ transform: partsOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s', flexShrink: 0 }}
                >
                  <path d="M3 5l4 4 4-4" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#888888' }}>Participants</span>
              </button>

              {partsOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Current user */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#3D4A5C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
                      }}>
                        {userInitials}
                      </div>
                    )}
                    <span style={{ fontSize: 14, color: '#E9E9E9' }}>{profile.name}</span>
                  </div>
                  {/* Other participants */}
                  {otherParticipants.map(p => (
                    <div key={p.initials} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: p.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
                      }}>
                        {p.initials}
                      </div>
                      <span style={{ fontSize: 14, color: '#E9E9E9' }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Week view ─────────────────────────────────────────── */
function WeekMeetingBlock({ title, timeRange, mins, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#232323' : '#1E1E1E',
        border: '1px solid #2E2E2E',
        borderLeft: '3px solid #494949',
        borderRadius: 8,
        padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 3,
        cursor: 'pointer',
        transition: 'background 0.12s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 600, color: '#FFFFFF',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{title}</span>
      <span style={{ fontSize: 11, color: '#888888', lineHeight: '16px' }}>{timeRange}</span>
      <span style={{ fontSize: 11, color: '#666666' }}>{mins} min</span>
    </div>
  )
}

function WeekView({ viewDate, meetingDate, elapsed, profile, onMeetingClick, fromMeeting, calendarConnected, fakeMeetings = [] }) {
  const GRID_START_HOUR = 7   // 7 AM
  const GRID_HOURS      = 19  // 7 AM → 2 AM next day
  const HOUR_HEIGHT     = 60  // px per hour = 1 px per minute

  const weekStart  = getWeekStart(viewDate)
  const today      = new Date()
  const days       = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Frozen test-call times (avoid re-computing every render)
  const testCallRef = useRef(fromMeeting ? {
    start: new Date(Date.now() - elapsed * 1000),
    end:   new Date(),
    title: `Test call with ${profile.name}`,
    avatarColor: '#7C3EC3',
    type: 'completed',
  } : null)
  const testCall = testCallRef.current

  // Return meetings that fall on a given day
  const getMeetingsForDay = (day) => {
    const result = []
    if (testCall && isSameDay(testCall.start, day)) result.push(testCall)
    if (calendarConnected) {
      fakeMeetings.forEach(m => {
        if (isSameDay(m.start, day)) result.push({ ...m, type: 'upcoming' })
      })
    }
    return result
  }

  // Convert a Date to px offset from grid top (handles past-midnight)
  const toPx = (date) => {
    let h = date.getHours()
    if (h < GRID_START_HOUR) h += 24   // past midnight → treat as 24 + h
    return (h - GRID_START_HOUR) * 60 + date.getMinutes()
  }

  // Current-time line position
  const nowPx = toPx(today)

  // Hour labels: empty string for the first slot (top-of-grid)
  const hourLabels = Array.from({ length: GRID_HOURS }, (_, i) => {
    if (i === 0) return ''
    const h = (GRID_START_HOUR + i) % 24
    return h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* ── Week header ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ width: 52, flexShrink: 0 }} /> {/* gutter */}
        {days.map((day, i) => {
          const isToday   = isSameDay(day, today)
          const isWeekend = i >= 5
          const hasDot    = getMeetingsForDay(day).length > 0
          return (
            <div key={i} style={{
              flex: 1, borderLeft: '1px solid #2A2A2A',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 4px 10px', gap: 4,
              background: isWeekend ? 'rgba(0,0,0,0.18)' : 'transparent',
            }}>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: isToday ? '#FFFFFF' : '#767676' }}>{DAY_ABBR[i]}</span>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: isToday ? '#FFFFFF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 600 : 400, color: isToday ? '#1A1A1A' : (isWeekend ? '#595959' : '#E9E9E9') }}>{day.getDate()}</span>
              </div>
              {hasDot && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2E96E8' }} />}
            </div>
          )
        })}
      </div>

      {/* ── Time grid ── */}
      <div style={{ display: 'flex' }}>

        {/* Time labels */}
        <div style={{ width: 52, flexShrink: 0, position: 'relative' }}>
          {hourLabels.map((label, i) => (
            <div key={i} style={{ height: HOUR_HEIGHT, position: 'relative' }}>
              {label && (
                <span style={{
                  position: 'absolute', top: -7, right: 10,
                  fontSize: 11, color: '#484848', whiteSpace: 'nowrap',
                }}>{label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const isToday   = isSameDay(day, today)
          const isWeekend = dayIdx >= 5
          const dayMeetings = getMeetingsForDay(day)

          return (
            <div key={dayIdx} style={{
              flex: 1, borderLeft: '1px solid #242424',
              position: 'relative',
              height: GRID_HOURS * HOUR_HEIGHT,
              background: isToday ? 'rgba(46,150,232,0.025)' : (isWeekend ? 'rgba(0,0,0,0.08)' : 'transparent'),
            }}>

              {/* Hour grid lines */}
              {hourLabels.map((_, i) => (
                i > 0 && <div key={i} style={{
                  position: 'absolute', top: i * HOUR_HEIGHT,
                  left: 0, right: 0, height: 1,
                  background: '#1E1E1E', pointerEvents: 'none',
                }} />
              ))}

              {/* Current-time indicator */}
              {isToday && nowPx >= 0 && nowPx <= GRID_HOURS * 60 && (
                <div style={{ position: 'absolute', top: nowPx, left: 0, right: 0, height: 2, background: '#2E96E8', zIndex: 3, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', left: -4, top: -3, width: 8, height: 8, borderRadius: '50%', background: '#2E96E8' }} />
                </div>
              )}

              {/* Meeting blocks */}
              {dayMeetings.map((m, mi) => {
                const top      = toPx(m.start)
                const durMins  = Math.round((m.end - m.start) / 60000)
                const blkH     = Math.max(durMins, 22)
                const isDone   = m.type === 'completed'
                const color    = m.avatarColor
                return (
                  <div
                    key={mi}
                    onClick={() => isDone && onMeetingClick?.()}
                    style={{
                      position: 'absolute', top, left: 4, right: 4, height: blkH,
                      background: isDone ? '#2A1F3D' : `${color}22`,
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 4, padding: '3px 7px',
                      overflow: 'hidden', boxSizing: 'border-box',
                      cursor: isDone ? 'pointer' : 'default', zIndex: 1,
                    }}
                  >
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.title}
                    </p>
                    {blkH > 28 && (
                      <p style={{ fontSize: 10, color: '#AAAAAA', margin: '1px 0 0', lineHeight: '13px' }}>
                        {fmt12(m.start)}
                      </p>
                    )}
                  </div>
                )
              })}

            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Calendar (month) view ─────────────────────────────── */
function CalendarView({ viewDate, meetingDate }) {
  const today      = new Date()
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const gridStart  = getWeekStart(firstOfMonth)
  const cells      = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  return (
    <div style={{
      border: '1px solid #2E2E2E', borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Day name header */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderBottom: '1px solid #2E2E2E', background: '#1E1E1E',
      }}>
        {DAY_ABBR.map(d => (
          <div key={d} style={{ padding: '8px 0', textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#595959', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => {
          const inMonth   = day.getMonth() === viewDate.getMonth()
          const isToday   = isSameDay(day, today)
          const hasMeeting = isSameDay(day, meetingDate) && inMonth
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          const isLast    = i >= 35

          return (
            <div key={i} style={{
              minHeight: 52,
              borderRight: (i + 1) % 7 !== 0 ? '1px solid #2E2E2E' : 'none',
              borderBottom: !isLast ? '1px solid #2E2E2E' : 'none',
              padding: '6px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: isWeekend && inMonth ? 'rgba(0,0,0,0.18)' : 'transparent',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: isToday ? '#2E96E8' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: isToday ? 600 : 400,
                  color: isToday ? '#FFFFFF' : (inMonth ? (isWeekend ? '#595959' : '#E9E9E9') : '#383838'),
                }}>{day.getDate()}</span>
              </div>
              {hasMeeting && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2E96E8' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── PastMeetingCard ───────────────────────────────────── */
const CHIP_TAB_MAP = {
  'Meeting Summary': 'Meeting summary',
  'Transcript':      'Transcript',
  'Chat Messages':   'Chat messages',
}

const SEGMENT_ICONS = {
  Day: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 17q-.825 0-1.412-.587T3 15V9q0-.825.588-1.412T5 7h14q.825 0 1.413.588T21 9v6q0 .825-.587 1.413T19 17zm0-2h14V9H5zM3 5V3h18v2zm0 16v-2h18v2zM5 9v6z"/>
    </svg>
  ),
  Week: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm9-2h2.5V6H13zm-4.5 0H11V6H8.5zM4 18h2.5V6H4zm13.5 0H20V6h-2.5z"/>
    </svg>
  ),
}

function ViewDropPanel({ activeSeg, onSelect }) {
  const [hov, setHov] = useState(null)
  return (
    <div style={{
      width: 160,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 12,
      padding: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxSizing: 'border-box',
    }}>
      {SEGMENTS.map(seg => (
        <div
          key={seg}
          onMouseEnter={() => setHov(seg)}
          onMouseLeave={() => setHov(null)}
          onClick={() => onSelect(seg)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            cursor: 'pointer',
            background: hov === seg ? '#1E1E1E' : 'transparent',
            transition: 'background 0.12s',
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, color: '#FFFFFF',
          }}
        >
          <span style={{ color: activeSeg === seg ? '#FFFFFF' : '#888888', display: 'flex', flexShrink: 0 }}>
            {SEGMENT_ICONS[seg]}
          </span>
          <span style={{ flex: 1 }}>{seg}</span>
          {activeSeg === seg && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 4" stroke="#2E96E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

function PastMeetingCard({ elapsed, profile, calendarConnected, fromMeeting }) {
  const [chipHover,      setChipHover]      = useState(null)
  const [detailOpen,     setDetailOpen]     = useState(false)
  const [initialTab,     setInitialTab]     = useState('About')
  const [activeSeg,      setActiveSeg]      = useState('Day')
  const [viewDate,       setViewDate]       = useState(new Date())
  const [meetingDate]                       = useState(() => new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [fakeMeetings]                      = useState(() => makeFakeMeetings())
  const [viewDropOpen,   setViewDropOpen]   = useState(false)
  const dateLabelRef                        = useRef(null)
  const viewDropRef                         = useRef(null)

  const today = new Date()

  /* ── Navigation helpers ── */
  function isOnToday() {
    if (activeSeg === 'Day')      return isSameDay(viewDate, today)
    if (activeSeg === 'Week')     return isSameDay(getWeekStart(viewDate), getWeekStart(today))
    return viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
  }

  function navLabel() {
    if (activeSeg === 'Day') {
      return viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    }
    if (activeSeg === 'Week') {
      const start = getWeekStart(viewDate)
      const end   = addDays(start, 6)
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`
    }
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  function navPrev() {
    setViewDate(d => {
      if (activeSeg === 'Week') return addDays(d, -7)
      if (activeSeg === 'Calendar') { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n }
      return addDays(d, -1)
    })
  }

  function navNext() {
    setViewDate(d => {
      if (activeSeg === 'Week') return addDays(d, 7)
      if (activeSeg === 'Calendar') { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n }
      return addDays(d, 1)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Date navigation bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>

        {/* Left: arrows + label + return to today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={navPrev} style={{
              width: 28, height: 28, borderRadius: 6, background: '#494949', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#FFFFFF', fontSize: 16,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>‹</button>
            <button onClick={navNext} style={{
              width: 28, height: 28, borderRadius: 6, background: '#494949', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#FFFFFF', fontSize: 16,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>›</button>
          </div>
          <button
            ref={dateLabelRef}
            onClick={() => setDatePickerOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: 18, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {navLabel()}
          </button>
          {!isOnToday() && (
            <span
              onClick={() => setViewDate(new Date())}
              style={{ fontSize: 13, fontWeight: 400, color: '#2E96E8', cursor: 'pointer' }}
            >
              Return to today
            </span>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Right: segment control + settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 7,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065"/>
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/>
            </svg>
          </button>
          <button
            ref={viewDropRef}
            onClick={() => setViewDropOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#494949', border: '1px solid #737373',
              borderRadius: 8, padding: '7px 12px',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{activeSeg}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="#888888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      </div>

      {/* ── View content ── */}
      <div style={{ paddingTop: 8 }}>

      {activeSeg === 'Day' && (
        isSameDay(viewDate, today) && (calendarConnected || fromMeeting) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fromMeeting && (
              <MeetingRow elapsed={elapsed} profile={profile} chipHover={chipHover} setChipHover={setChipHover} onClick={() => { setInitialTab('About'); setDetailOpen(true) }} onChipClick={tab => { setInitialTab(tab); setDetailOpen(true) }} />
            )}
            {calendarConnected && fakeMeetings.map((m, i) => (
              <UpcomingMeetingRow key={m.title} {...m} isNext={i === 0} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '52px 0', gap: 10,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5h9a2 2 0 0 1 2 2v9m-.184 3.839A2 2 0 0 1 18 21H6a2 2 0 0 1-2-2V7a2 2 0 0 1 1.158-1.815M16 3v4M8 3v1m-4 7h7m4 0h5M3 3l18 18"/>
            </svg>
            <span style={{ fontSize: 14, color: '#ffffff' }}>No meetings scheduled</span>
            {viewDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate()) && (
              <button type="button" style={{
                marginTop: 6,
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'transparent',
                border: '1px solid #494949',
                borderRadius: 9999,
                padding: '8px 18px',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13, fontWeight: 500, color: '#FFFFFF',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Schedule a meeting
              </button>
            )}
          </div>
        )
      )}

      {activeSeg === 'Week' && (
        <WeekView
          viewDate={viewDate}
          meetingDate={meetingDate}
          elapsed={elapsed}
          profile={profile}
          onMeetingClick={() => { setInitialTab('About'); setDetailOpen(true) }}
          onChipClick={tab => { setInitialTab(tab); setDetailOpen(true) }}
          fromMeeting={fromMeeting}
          calendarConnected={calendarConnected}
          fakeMeetings={fakeMeetings}
        />
      )}

      {activeSeg === 'Calendar' && (
        <CalendarView viewDate={viewDate} meetingDate={meetingDate} />
      )}

      </div>{/* end scrollable view content */}

      <AnimatePresence>
        {detailOpen && (
          <MeetingDetailModal
            onClose={() => setDetailOpen(false)}
            elapsed={elapsed}
            profile={profile}
            initialTab={initialTab}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {datePickerOpen && (
          <Dropdown
            anchorRef={dateLabelRef}
            onClose={() => setDatePickerOpen(false)}
            anchor="bottom"
            dropdownWidth={288}
            offsetY={10}
          >
            <DatePickerPopover
              viewDate={viewDate}
              activeSeg={activeSeg}
              onSelect={date => setViewDate(date)}
              onClose={() => setDatePickerOpen(false)}
            />
          </Dropdown>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewDropOpen && (
          <Dropdown
            anchorRef={viewDropRef}
            onClose={() => setViewDropOpen(false)}
            anchor="bottom-right"
            offsetY={6}
          >
            <ViewDropPanel
              activeSeg={activeSeg}
              onSelect={seg => { setActiveSeg(seg); setViewDropOpen(false) }}
            />
          </Dropdown>
        )}
      </AnimatePresence>

    </div>
  )
}
