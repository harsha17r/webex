import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'

/* ─────────────────────────────────────────────────────────
 * NotificationSettingsModal
 *
 * Two-panel settings dialog. Left = nav sidebar.
 * Right = scrollable notification settings with:
 *   - Three collapsible sections (Messaging, Meeting, Calling)
 *   - Accordion "Additional sound settings" (one open at a time)
 *   - Custom dark dropdowns via portal
 *   - Quiet Hours always-visible row
 * ───────────────────────────────────────────────────────── */

/* ── Constants ─────────────────────────────────────────── */

const SOUNDS = ['Off', 'Beep', 'Bounce', 'Calculation', 'Cute', 'Drop', 'Evolve', 'Idea', 'Nimba', 'Open', 'Snap', 'Tick', 'Vibes']

const WHEN_PARTICIPANTS = [
  "Only if I'm not viewing the Participants panel",
  'Only for the first message in the thread',
  'Always',
]

const WHEN_CHAT = [
  "Only if I'm not viewing the Chat panel",
  'Only for the first message in the thread',
  'Always',
]

/* ── Nav items ─────────────────────────────────────────── */

const NAV = [
  {
    key: 'general', label: 'General',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.06 1.06M14.84 14.84l1.06 1.06M4.1 15.9l1.06-1.06M14.84 5.16l1.06-1.06" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'audio', label: 'Audio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="7.5" y="2" width="5" height="9" rx="2.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M4 9a6 6 0 0 0 12 0M10 15v3M7 18h6" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'video', label: 'Video',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5.5" width="11" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M13 8.5l5.5-2.5v8l-5.5-2.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'sharing', label: 'Sharing Content',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="15" cy="4.5" r="2" stroke="#FFFFFF" strokeWidth="1.4"/>
        <circle cx="5" cy="10" r="2" stroke="#FFFFFF" strokeWidth="1.4"/>
        <circle cx="15" cy="15.5" r="2" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M7 9l6-3.5M7 11l6 3.5" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'notifications', label: 'Notifications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 11.5V8a6 6 0 0 1 12 0v3.5l1.5 2.5H2.5L4 11.5Z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="#FFFFFF" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    key: 'appearance', label: 'Appearance',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h14M3 15h14" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="7" cy="5" r="1.75" fill="#111111" stroke="#FFFFFF" strokeWidth="1.4"/>
        <circle cx="13" cy="10" r="1.75" fill="#111111" stroke="#FFFFFF" strokeWidth="1.4"/>
        <circle cx="9" cy="15" r="1.75" fill="#111111" stroke="#FFFFFF" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    key: 'accessibility', label: 'Accessibility',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="4" r="1.75" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M3 8h14M10 7.5v10M6 18l4-3 4 3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'shortcuts', label: 'Keyboard Shortcuts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5.5" width="16" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M5 9h.01M8.5 9h.01M12 9h.01M15 9h.01M5 12h.01M8.5 12h3M15 12h.01" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'privacy', label: 'Privacy',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="13.5" r="1.25" fill="#FFFFFF"/>
      </svg>
    ),
  },
  {
    key: 'integrations', label: 'Integrations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M14.5 11v7M11 14.5h7" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'messaging', label: 'Messaging',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 3h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5.5L2 17V4a1 1 0 0 1 1-1Z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'meetings', label: 'Meetings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="3.5" width="15" height="14" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M2.5 7.5h15M7 2v3M13 2v3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'calling', label: 'Calling',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4.5 3.5h3l1.5 4-2 1.5a9 9 0 0 0 4 4L12.5 11l4 1.5v3a1 1 0 0 1-1 1A14 14 0 0 1 3.5 4.5a1 1 0 0 1 1-1" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'devices', label: 'Devices',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1.5" y="3.5" width="17" height="11" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4"/>
        <path d="M7 17.5h6M10 14.5v3" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'accessories', label: 'Accessories',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10a7 7 0 0 1 14 0" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
        <rect x="2" y="10" width="3" height="5" rx="1" stroke="#FFFFFF" strokeWidth="1.4"/>
        <rect x="15" y="10" width="3" height="5" rx="1" stroke="#FFFFFF" strokeWidth="1.4"/>
      </svg>
    ),
  },
]

/* ── SoundDropdown ─────────────────────────────────────── */

function SoundDropdown({ value, onChange, options = SOUNDS, disabled = false, width = 130 }) {
  const [open, setOpen]       = useState(false)
  const [hovered, setHovered] = useState(null)
  const [pos, setPos]         = useState({ top: 0, left: 0, w: 0 })
  const triggerRef            = useRef(null)

  function handleOpen(e) {
    e.stopPropagation()
    if (disabled) return
    const r = triggerRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, w: Math.max(r.width, 180) })
    setOpen(v => !v)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          width, display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 6, padding: '5px 10px', borderRadius: 4, boxSizing: 'border-box',
          background: disabled ? '#181818' : '#222222',
          border: '1px solid #3A3A3A',
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none', flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, color: '#CCCCCC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <path d={open ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} stroke="#777777" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          className="scrollbar-dark"
          style={{
            position: 'fixed', top: pos.top, left: pos.left, width: pos.w,
            background: '#2A2A2A', border: '1px solid #3A3A3A', borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)', zIndex: 9999,
            maxHeight: 220, overflowY: 'auto', padding: '4px 0',
          }}
        >
          {options.map(opt => (
            <div
              key={opt}
              onMouseEnter={() => setHovered(opt)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { onChange(opt); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 12px', cursor: 'pointer',
                background: hovered === opt ? 'rgba(255,255,255,0.07)' : opt === value ? 'rgba(17,112,207,0.15)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 13, color: opt === value ? '#5DB3F0' : '#DDDDDD' }}>{opt}</span>
              {opt === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3.5 3.5 5.5-5.5" stroke="#1170CF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

/* ── Checkbox ──────────────────────────────────────────── */

function Checkbox({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        flexShrink: 0, width: 16, height: 16, borderRadius: 3, boxSizing: 'border-box',
        background: checked ? '#1170CF' : 'transparent',
        border: checked ? 'none' : '1.5px solid #595959',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}

/* ── RadioOption ────────────────────────────────────────── */

function RadioOption({ selected, label, sublabel, extra, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        cursor: 'pointer', padding: '5px 6px', borderRadius: 6,
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 3 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={selected ? '#1170CF' : '#595959'} strokeWidth="1.5"/>
          {selected && <circle cx="8" cy="8" r="3.5" fill="#1170CF"/>}
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', lineHeight: '20px' }}>{label}</span>
          {extra && <span style={{ fontSize: 12, fontWeight: 500, color: '#5DB3F0', cursor: 'pointer' }}>{extra}</span>}
        </div>
        {sublabel && <span style={{ fontSize: 12, color: '#888888', lineHeight: '16px' }}>{sublabel}</span>}
      </div>
    </div>
  )
}

/* ── ActionRow (meeting sound rows) ────────────────────── */

function ActionRow({ label, sound, onSoundChange, when, onWhenChange, whenOptions }) {
  const isOn = sound !== 'Off'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, flex: 1, minWidth: 100, color: '#CCCCCC' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SoundDropdown value={sound} onChange={onSoundChange} width={110} />
        <AnimatePresence>
          {whenOptions && isOn && (
            <motion.div
              key="when"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: 'tween', duration: 0.18, ease: 'easeInOut' }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
            >
              <SoundDropdown value={when} onChange={onWhenChange} options={whenOptions} width={240} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── SectionCard wrapper ────────────────────────────────── */

function SectionCard({ title, children }) {
  return (
    <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #1E1E1E' }}>
      <div style={{ background: '#111111', padding: '14px 16px' }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

/* ── AccordionBody ──────────────────────────────────────── */

function AccordionBody({ sectionId, openId, onToggle, children }) {
  const isOpen = openId === sectionId
  return (
    <>
      {/* Trigger row */}
      <div
        onClick={() => onToggle(sectionId)}
        style={{
          padding: '8px 16px 10px',
          display: 'inline-flex', alignItems: 'center', gap: 5,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: '#2E96E8' }}>
          Additional sound settings
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M2 4l4 4 4-4" stroke="#2E96E8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Animated body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              margin: '0 12px 14px 16px',
              paddingLeft: 12,
              borderLeft: '2px solid #2A2A2A',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── Label row helper ───────────────────────────────────── */

function SoundRow({ label, value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 13, color: disabled ? '#555555' : '#CCCCCC', transition: 'color 0.15s' }}>{label}</span>
      <SoundDropdown value={value} onChange={onChange} disabled={disabled} width={130} />
    </div>
  )
}

/* ── AudioPanel helpers ─────────────────────────────────── */

function AudioDeviceRow({ device }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px', borderRadius: 4,
        background: '#2A2A2A', border: '1px solid #3A3A3A', cursor: 'pointer',
      }}>
        <span style={{ fontSize: 13, color: '#CCCCCC' }}>{device}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 5.5l3-3 3 3M4 8.5l3 3 3-3" stroke="#5DB3F0" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <button style={{
        padding: '6px 16px', background: '#2A2A2A',
        border: '1px solid #3A3A3A', borderRadius: 4,
        fontSize: 13, color: '#CCCCCC', cursor: 'pointer',
        fontFamily: "'Inter', system-ui, sans-serif", flexShrink: 0,
      }}>Test</button>
    </div>
  )
}

function LevelRow({ label, activeTicks = 0 }) {
  const TOTAL = 22
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: '#CCCCCC', width: 92, textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 10 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} style={{
            width: 2, height: 11, borderRadius: 1,
            background: i < activeTicks ? '#1170CF' : '#3A3A3A',
          }} />
        ))}
      </div>
    </div>
  )
}

function VolumeRow({ label, value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: '#CCCCCC', width: 92, textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, marginLeft: 10 }}>
        <input
          type="range" min={0} max={100} value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={disabled}
          className="volume-slider"
          style={{ '--pct': `${value}%` }}
        />
      </div>
    </div>
  )
}

function AudioPanel() {
  const [ringerVolume,    setRingerVolume]    = useState(95)
  const [speakerVolume,   setSpeakerVolume]   = useState(25)
  const [micVolume,       setMicVolume]       = useState(55)
  const [autoAdjustMic,   setAutoAdjustMic]   = useState(true)
  const [unmuteSpacer,    setUnmuteSpacer]    = useState(true)
  const [directionalAudio, setDirectionalAudio] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Divider */}
      <div style={{ height: 1, background: '#2A2A2A', marginBottom: 24 }} />

      {/* Ringer/Alerts */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Ringer/Alerts</div>
        <AudioDeviceRow device="All Devices" />
        <LevelRow label="Output level:" activeTicks={0} />
        <VolumeRow label="Volume:" value={ringerVolume} onChange={setRingerVolume} />
      </div>

      {/* Speaker */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Speaker</div>
        <AudioDeviceRow device="MacBook Air Speakers (Built-in)" />
        <LevelRow label="Output level:" activeTicks={0} />
        <VolumeRow label="Volume:" value={speakerVolume} onChange={setSpeakerVolume} />
      </div>

      {/* Microphone */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 12 }}>Microphone</div>
        <AudioDeviceRow device="MacBook Air Microphone (Built-in)" />
        <LevelRow label="Input level:" activeTicks={1} />
        <VolumeRow label="Volume:" value={micVolume} onChange={setMicVolume} disabled={autoAdjustMic} />
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Checkbox checked={autoAdjustMic} onChange={setAutoAdjustMic} />
            <span style={{ fontSize: 14, color: '#FFFFFF' }}>Automatically adjust my microphone volume</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#888888" strokeWidth="1.3"/>
              <path d="M8 7.5v3M8 5.2v.6" stroke="#888888" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Checkbox checked={unmuteSpacer} onChange={setUnmuteSpacer} />
            <span style={{ fontSize: 14, color: '#FFFFFF' }}>Unmute temporarily by holding Spacebar</span>
          </div>
        </div>
      </div>

      {/* Sound effect */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', marginBottom: 10 }}>Sound effect</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ marginTop: 1, flexShrink: 0 }}>
            <Checkbox checked={directionalAudio} onChange={setDirectionalAudio} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>Directional audio</div>
            <div style={{ fontSize: 12, color: '#888888', lineHeight: '18px' }}>
              Processes the audio from the active speaker's voice so that it sounds like it's coming from the speaker's layout location on the screen. This option doesn't affect direct calls.
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ── GeneralPanel ───────────────────────────────────────── */

function GeneralPanel() {
  const [startOnBoot,    setStartOnBoot]    = useState(true)
  const [outlookAvail,   setOutlookAvail]   = useState(false)
  const [floatingWindow, setFloatingWindow] = useState(true)
  const [optimizeEnergy, setOptimizeEnergy] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Divider */}
      <div style={{ height: 1, background: '#2A2A2A', marginBottom: 20 }} />

      {/* Start Webex when my computer starts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Checkbox checked={startOnBoot} onChange={setStartOnBoot} />
        <span style={{ fontSize: 14, color: '#FFFFFF' }}>Start Webex when my computer starts</span>
      </div>

      {/* Show Webex availability in Microsoft Outlook */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 28 }}>
        <div style={{ marginTop: 1, flexShrink: 0 }}>
          <Checkbox checked={outlookAvail} onChange={setOutlookAvail} />
        </div>
        <div>
          <div style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 6 }}>Show Webex availability in Microsoft Outlook</div>
          <div style={{ fontSize: 12, color: '#888888', lineHeight: '18px', marginBottom: 6 }}>
            See others' Webex availability in Microsoft Outlook. You can also make a Webex call or send a direct message from their Outlook profile.
          </div>
          <div style={{ fontSize: 12, color: '#888888', lineHeight: '18px' }}>
            We recommend that you enable only one app at a time to show availability in Outlook.
          </div>
        </div>
      </div>

      {/* Landing screen */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Landing screen</div>
        <div style={{ fontSize: 13, color: '#CCCCCC', lineHeight: '20px', marginBottom: 10 }}>
          Choose what you'd like to see first every time Webex opens.
        </div>
        <SoundDropdown
          value="Messaging (default)"
          onChange={() => {}}
          options={['Messaging (default)', 'Meetings', 'Calling']}
          width={200}
        />
      </div>

      {/* Recent sessions */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Recent sessions</div>
        <div style={{ fontSize: 13, color: '#CCCCCC', lineHeight: '20px', marginBottom: 8 }}>
          See devices that are currently signed in or have been active recently.
        </div>
        <span style={{ fontSize: 13, color: '#2E96E8', cursor: 'pointer' }}>Show Details</span>
      </div>

      {/* Default file location */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Default file location</div>
        <div style={{ fontSize: 13, color: '#CCCCCC', lineHeight: '20px', marginBottom: 10 }}>
          All the files you stored during your use of Webex will be saved at the following location. This setting is for this computer only.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#CCCCCC' }}>/Users/harsha/Downloads/</span>
          <button style={{
            padding: '5px 12px', background: '#2A2A2A',
            border: '1px solid #3A3A3A', borderRadius: 4,
            fontSize: 12, color: '#CCCCCC', cursor: 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>Change</button>
        </div>
      </div>

      {/* Local time zone */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Local time zone</div>
        <div style={{ fontSize: 13, color: '#CCCCCC', lineHeight: '20px', marginBottom: 10 }}>
          We use this time zone to show others your local time in your profile. This is also used for notification settings, such as Quiet hours.
        </div>
        <SoundDropdown
          value="(UTC-04:00) Indiana (East)"
          onChange={() => {}}
          options={['(UTC-04:00) Indiana (East)', '(UTC-05:00) Eastern (US & Canada)', '(UTC-08:00) Pacific (US & Canada)']}
          width={270}
        />
      </div>

      {/* Multitasking */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 10 }}>Multitasking</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ marginTop: 1, flexShrink: 0 }}>
            <Checkbox checked={floatingWindow} onChange={setFloatingWindow} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>Show floating window for calls and meetings</div>
            <div style={{ fontSize: 12, color: '#888888', lineHeight: '18px' }}>
              Automatically show my Webex call or meeting in a floating mini window when other apps are in front.
            </div>
          </div>
        </div>
      </div>

      {/* Carbon aware mode */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 10 }}>Carbon aware mode</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ marginTop: 1, flexShrink: 0 }}>
            <Checkbox checked={optimizeEnergy} onChange={setOptimizeEnergy} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>Optimize energy use</div>
            <div style={{ fontSize: 12, color: '#888888', lineHeight: '18px', marginBottom: 12 }}>
              Defer non-critical updates for up to 24 hours when power is coming from a high-carbon source.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: optimizeEnergy ? 1 : 0.35, transition: 'opacity 0.15s' }}>
              <div style={{ marginTop: 1, flexShrink: 0 }}>
                <Checkbox checked={false} onChange={() => {}} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#CCCCCC', marginBottom: 4 }}>Optimize video in one-to-one meetings and calls</div>
                <div style={{ fontSize: 12, color: '#888888', lineHeight: '18px' }}>
                  Reduce video resolution in one-to-one meetings and calls when power is coming from a high-carbon source.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Translation language */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>Translation language</div>
        <div style={{ fontSize: 13, color: '#CCCCCC', lineHeight: '20px', marginBottom: 10 }}>
          Select a preferred language for translation.
        </div>
        <SoundDropdown
          value="None"
          onChange={() => {}}
          options={['None', 'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese']}
          width={240}
        />
      </div>

    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export function NotificationSettingsModal({ onClose, onSave }) {
  const [activeNav,    setActiveNav]    = useState('general')
  const [hoveredNav,   setHoveredNav]   = useState(null)
  const [atBottom,     setAtBottom]     = useState(false)
  const scrollRef        = useRef(null)
  const quietScheduleRef = useRef(null)

  // ── Accordion ──
  const [openAccordion, setOpenAccordion] = useState(null)
  function toggleAccordion(id) {
    setOpenAccordion(prev => prev === id ? null : id)
  }

  // ── Messaging state ──
  const [msgVal,        setMsgVal]        = useState('all')
  const [msgSpace,      setMsgSpace]      = useState('Open')
  const [msgDm,         setMsgDm]         = useState('Open')
  const [msgFav,        setMsgFav]        = useState('Open')

  // ── Meeting state ──
  const [mtgVal,        setMtgVal]        = useState('5 minutes before')
  const [customMinutes, setCustomMinutes] = useState(30)
  const [customUnit,    setCustomUnit]    = useState('minutes')
  const [mtgRing,       setMtgRing]       = useState('Off')
  const [mtgMute,       setMtgMute]       = useState(false)
  const [mtgJoin,       setMtgJoin]       = useState({ sound: 'Off' })
  const [mtgLeave,      setMtgLeave]      = useState({ sound: 'Off' })
  const [mtgRaise,      setMtgRaise]      = useState({ sound: 'Off', when: WHEN_PARTICIPANTS[2] })
  const [mtgMsg,        setMtgMsg]        = useState({ sound: 'Off', when: WHEN_CHAT[2] })

  // ── Calling state ──
  const [callVal,       setCallVal]       = useState('allow')
  const [callDecline,   setCallDecline]   = useState(false)
  const [callRing,      setCallRing]      = useState('Open')

  // ── Quiet Hours ──
  const [quietHours,    setQuietHours]    = useState('Off')
  const [quietExpanded, setQuietExpanded] = useState(false)
  const [quietSaved,    setQuietSaved]    = useState(false)
  const [quietSchedule, setQuietSchedule] = useState({
    monday:    { on: true,  from: '18:00', to: '07:00' },
    tuesday:   { on: true,  from: '18:00', to: '07:00' },
    wednesday: { on: true,  from: '18:00', to: '07:00' },
    thursday:  { on: true,  from: '18:00', to: '07:00' },
    friday:    { on: true,  from: '18:00', to: '07:00' },
    saturday:  { on: true,  from: '07:00', to: '07:00' },
    sunday:    { on: true,  from: '07:00', to: '07:00' },
  })
  function setDay(day, patch) {
    setQuietSchedule(p => ({ ...p, [day]: { ...p[day], ...patch } }))
  }
  function handleQuietSave() {
    setQuietSaved(true)
    setTimeout(() => {
      setQuietSaved(false)
      setQuietExpanded(false)
    }, 1100)
  }

  function checkScroll() {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(el.scrollHeight - el.scrollTop <= el.clientHeight + 4)
  }

  useEffect(() => { checkScroll() }, [activeNav])

  useEffect(() => {
    if (quietExpanded) {
      // Wait for animation to finish (220ms) then scroll to bottom
      setTimeout(() => {
        const el = scrollRef.current
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }, 260)
    }
  }, [quietExpanded])

  const activeLabel = activeNav === 'notifications'
    ? 'Notification Settings'
    : NAV.find(n => n.key === activeNav)?.label ?? 'Settings'

  function handleDone() {
    onSave?.()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', width: 880, height: 840,
          borderRadius: 8, overflow: 'hidden',
          boxShadow: '0px 24px 80px rgba(0,0,0,0.5)',
        }}
      >

        {/* ── LEFT PANEL ── */}
        <div
          className="scrollbar-dark"
          style={{
            width: 240, flexShrink: 0,
            background: '#1E1E1E', border: '1px solid #595959',
            borderRadius: '8px 0 0 8px',
            display: 'flex', flexDirection: 'column',
            padding: 12, overflowY: 'auto', boxSizing: 'border-box',
          }}
        >
          {NAV.map(item => {
            const isActive  = item.key === activeNav
            const isHovered = hoveredNav === item.key
            return (
              <div
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                onMouseEnter={() => setHoveredNav(item.key)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10, padding: '12px 10px', borderRadius: 4, cursor: 'pointer',
                  background: isActive ? '#333333' : isHovered ? '#282828' : 'transparent',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {item.icon}
                  <span style={{
                    fontSize: 14, fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#FFFFFF' : '#AAAAAA',
                    lineHeight: '20px', whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M6 4l4 4-4 4" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            )
          })}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1, height: '100%',
          background: '#111111', border: '1px solid #595959',
          borderLeft: 'none', borderRadius: '0 8px 8px 0',
          display: 'grid', gridTemplateRows: 'auto 1fr auto',
          boxSizing: 'border-box', overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #2A2A2A' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: '28px' }}>
              {activeLabel}
            </p>
          </div>

          {/* Scroll container */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="scrollbar-dark"
              style={{ overflowY: 'auto', height: '100%' }}
            >
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 36 }}>

                {activeNav === 'general' ? (
                  <GeneralPanel />
                ) : activeNav === 'audio' ? (
                  <AudioPanel />
                ) : activeNav === 'notifications' ? (
                  <>

                    {/* ── Messaging Notifications ── */}
                    <SectionCard title="Messaging Notifications">
                      <div style={{ background: '#111111', padding: '16px 16px 8px ' }}>
                        {[
                          { value: 'all',    label: 'All messages (default)',               sublabel: 'All messages, replies, and @mentions' },
                          { value: 'dm',     label: 'Direct messages and @mentions to me',  sublabel: "Direct messages and when you're mentioned in the space" },
                          { value: 'custom', label: 'Custom',                               sublabel: 'Choose your own notification settings', extra: 'Edit' },
                          { value: 'off',    label: 'Off' },
                        ].map(opt => (
                          <RadioOption
                            key={opt.value}
                            selected={msgVal === opt.value}
                            label={opt.label}
                            sublabel={opt.sublabel}
                            extra={opt.extra}
                            onClick={() => setMsgVal(opt.value)}
                          />
                        ))}
                      </div>
                      <div style={{ background: '#111111', borderTop: '1px solid #1A1A1A' }}>
                        <AccordionBody sectionId="messaging" openId={openAccordion} onToggle={toggleAccordion}>
                          <SoundRow label="Space notification sound"          value={msgSpace} onChange={setMsgSpace} />
                          <SoundRow label="Direct message notification sound" value={msgDm}    onChange={setMsgDm} />
                          <SoundRow label="Favorites notification sound"      value={msgFav}   onChange={setMsgFav} />
                          <div>
                            <button
                              onClick={() => { setMsgSpace('Open'); setMsgDm('Open'); setMsgFav('Open') }}
                              style={{
                                padding: '6px 16px', background: 'transparent',
                                border: '1px solid #494949', borderRadius: 4,
                                fontSize: 12, color: '#AAAAAA', cursor: 'pointer',
                                fontFamily: "'Inter', system-ui, sans-serif",
                              }}
                            >
                              Reset message notifications to default
                            </button>
                          </div>
                        </AccordionBody>
                      </div>
                    </SectionCard>

                    {/* ── Meeting Notifications ── */}
                    <SectionCard title="Meeting Notifications">
                      <div style={{ background: '#111111', padding: '16px 16px 14px' }}>
                        <span style={{ fontSize: 14, color: '#888888', padding: '0 6px', display: 'block', marginBottom: 10 }}>
                          Remind me before scheduled meetings
                        </span>
                        <div style={{ padding: '0 6px' }}>
                          <SoundDropdown
                            value={mtgVal}
                            onChange={v => {
                              setMtgVal(v)
                              if (v !== 'Custom') { setCustomMinutes(30); setCustomUnit('minutes') }
                            }}
                            options={['5 minutes before', '1 minute before', 'At start time', 'Off', 'Custom']}
                            width={220}
                          />
                          <AnimatePresence>
                            {mtgVal === 'Custom' && (
                              <motion.div
                                key="custom-reminder"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{
                                  marginTop: 12, background: '#181818',
                                  border: '1px solid #2A2A2A', borderRadius: 6,
                                  padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>

                                    {/* Stepper */}
                                    <div style={{
                                      display: 'flex', alignItems: 'center',
                                      background: '#222222', border: '1px solid #3A3A3A', borderRadius: 6, overflow: 'hidden',
                                    }}>
                                      <button
                                        onClick={() => setCustomMinutes(v => Math.max(1, v - 1))}
                                        style={{
                                          width: 32, height: 34, border: 'none', borderRight: '1px solid #3A3A3A',
                                          background: 'transparent', color: '#AAAAAA', fontSize: 18, lineHeight: 1,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                                        }}
                                      >−</button>
                                      <input
                                        type="number"
                                        className="no-spinner"
                                        value={customMinutes}
                                        min={1}
                                        max={customUnit === 'hours' ? 24 : 1440}
                                        onChange={e => {
                                          const v = parseInt(e.target.value, 10)
                                          if (!isNaN(v)) {
                                            const max = customUnit === 'hours' ? 24 : 1440
                                            setCustomMinutes(Math.min(max, Math.max(1, v)))
                                          }
                                        }}
                                        style={{
                                          width: 52, height: 34, border: 'none',
                                          background: 'transparent', color: '#FFFFFF',
                                          fontSize: 15, fontWeight: 500, textAlign: 'center',
                                          outline: 'none', fontFamily: "'Inter', system-ui, sans-serif",
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          const max = customUnit === 'hours' ? 24 : 1440
                                          setCustomMinutes(v => Math.min(max, v + 1))
                                        }}
                                        style={{
                                          width: 32, height: 34, border: 'none', borderLeft: '1px solid #3A3A3A',
                                          background: 'transparent', color: '#AAAAAA', fontSize: 18, lineHeight: 1,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                                        }}
                                      >+</button>
                                    </div>

                                    {/* Minutes / Hours segmented toggle */}
                                    <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid #3A3A3A' }}>
                                      {['minutes', 'hours'].map(unit => (
                                        <button
                                          key={unit}
                                          onClick={() => {
                                            if (customUnit === unit) return
                                            if (unit === 'hours') {
                                              setCustomMinutes(v => Math.min(24, Math.max(1, Math.round(v / 60) || 1)))
                                            } else {
                                              setCustomMinutes(v => Math.min(1440, v * 60))
                                            }
                                            setCustomUnit(unit)
                                          }}
                                          style={{
                                            padding: '7px 14px', border: 'none',
                                            background: customUnit === unit ? '#1170CF' : '#222222',
                                            color: customUnit === unit ? '#FFFFFF' : '#777777',
                                            fontSize: 13, fontWeight: customUnit === unit ? 500 : 400,
                                            cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                                            transition: 'background 0.15s, color 0.15s',
                                          }}
                                        >
                                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                        </button>
                                      ))}
                                    </div>

                                    <span style={{ fontSize: 13, color: '#555555' }}>before start</span>
                                  </div>

                                  {/* Preview */}
                                  <span style={{ fontSize: 12, color: '#555555', fontStyle: 'italic' }}>
                                    Reminder set for {customMinutes} {customUnit} before start time
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div style={{ background: '#111111', borderTop: '1px solid #1A1A1A' }}>
                        <AccordionBody sectionId="meeting" openId={openAccordion} onToggle={toggleAccordion}>
                          {/* Ringtone row */}
                          <SoundRow label="Ringtone for meeting notifications" value={mtgRing} onChange={setMtgRing} />

                          {/* Mute beep */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Checkbox checked={mtgMute} onChange={setMtgMute} />
                            <span style={{ fontSize: 13, color: '#CCCCCC' }}>
                              Play a beep when I mute or unmute myself
                            </span>
                          </div>

                          {/* Meeting action sounds */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#777777' }}>Play sounds for these actions:</span>
                            <ActionRow
                              label="A participant joins the meeting"
                              sound={mtgJoin.sound}
                              onSoundChange={v => setMtgJoin(p => ({ ...p, sound: v }))}
                            />
                            <ActionRow
                              label="A participant leaves the meeting"
                              sound={mtgLeave.sound}
                              onSoundChange={v => setMtgLeave(p => ({ ...p, sound: v }))}
                            />
                            <ActionRow
                              label="A participant raises hand"
                              sound={mtgRaise.sound}
                              onSoundChange={v => setMtgRaise(p => ({ ...p, sound: v }))}
                              when={mtgRaise.when}
                              onWhenChange={v => setMtgRaise(p => ({ ...p, when: v }))}
                              whenOptions={WHEN_PARTICIPANTS}
                            />
                            <ActionRow
                              label="I receive a message"
                              sound={mtgMsg.sound}
                              onSoundChange={v => setMtgMsg(p => ({ ...p, sound: v }))}
                              when={mtgMsg.when}
                              onWhenChange={v => setMtgMsg(p => ({ ...p, when: v }))}
                              whenOptions={WHEN_CHAT}
                            />
                          </div>
                        </AccordionBody>
                      </div>
                    </SectionCard>

                    {/* ── Calling Notifications ── */}
                    <SectionCard title="Calling Notifications">
                      <div style={{ background: '#111111', padding: '16px 16px 8px' }}>
                        <span style={{ fontSize: 14, color: '#888888', padding: '0 6px', display: 'block', marginBottom: 6 }}>
                          Notifications when you receive a direct call
                        </span>
                        {[
                          { value: 'allow', label: 'Allow notifications' },
                          { value: 'off',   label: 'Turn off notifications' },
                          { value: 'inmtg', label: 'Turn off while in a meeting or call' },
                        ].map(opt => (
                          <RadioOption
                            key={opt.value}
                            selected={callVal === opt.value}
                            label={opt.label}
                            onClick={() => setCallVal(opt.value)}
                          />
                        ))}

                        {/* Sub-checkbox when "inmtg" is selected */}
                        <AnimatePresence>
                          {callVal === 'inmtg' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'tween', duration: 0.18, ease: 'easeInOut' }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                margin: '6px 6px 6px 28px',
                              }}>
                                <Checkbox checked={callDecline} onChange={setCallDecline} />
                                <span style={{ fontSize: 12, color: '#999999', lineHeight: '18px', marginTop: 1 }}>
                                  Automatically decline calls on all devices while in a meeting or call, and send call to voicemail or another number.
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div style={{ background: '#111111', borderTop: '1px solid #1A1A1A' }}>
                        <AccordionBody sectionId="calling" openId={openAccordion} onToggle={toggleAccordion}>
                          <SoundRow label="Direct calls ringtone" value={callRing} onChange={setCallRing} />
                        </AccordionBody>
                      </div>
                    </SectionCard>

                    {/* ── Quiet Hours ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>
                            Quiet hours schedule
                          </span>
                          <span style={{ fontSize: 12, color: '#888888', lineHeight: '18px', maxWidth: 300 }}>
                            Mutes notifications outside working hours. Meeting reminders still come through.
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Edit link — only when custom is set but collapsed */}
                          {quietHours === 'Custom schedule' && !quietExpanded && (
                            <span
                              onClick={() => setQuietExpanded(true)}
                              style={{ fontSize: 12, color: '#2E96E8', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              Edit
                            </span>
                          )}
                          <SoundDropdown
                            value={quietHours}
                            onChange={v => {
                              setQuietHours(v)
                              setQuietExpanded(v === 'Custom schedule')
                              setQuietSaved(false)
                            }}
                            options={['Off', 'Custom schedule', 'Work hours (Mon–Fri, 9am–5pm)']}
                            width={180}
                          />
                        </div>
                      </div>

                      {/* Custom schedule — animated expand */}
                      <AnimatePresence>
                        {quietHours === 'Custom schedule' && quietExpanded && (
                          <motion.div
                            key="quiet-schedule"
                            ref={quietScheduleRef}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{
                              background: '#181818', border: '1px solid #2A2A2A',
                              borderRadius: 6, padding: '14px 16px',
                              display: 'flex', flexDirection: 'column', gap: 10,
                            }}>
                              {[
                                { key: 'monday',    label: 'Monday' },
                                { key: 'tuesday',   label: 'Tuesday' },
                                { key: 'wednesday', label: 'Wednesday' },
                                { key: 'thursday',  label: 'Thursday' },
                                { key: 'friday',    label: 'Friday' },
                                { key: 'saturday',  label: 'Saturday' },
                                { key: 'sunday',    label: 'Sunday' },
                              ].map(({ key, label }) => {
                                const day = quietSchedule[key]
                                return (
                                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Checkbox checked={day.on} onChange={v => setDay(key, { on: v })} />
                                    <span style={{
                                      fontSize: 13, width: 90, flexShrink: 0,
                                      color: day.on ? '#CCCCCC' : '#555555',
                                      transition: 'color 0.15s',
                                    }}>
                                      {label}
                                    </span>
                                    <input
                                      type="time"
                                      className="time-input-dark"
                                      value={day.from}
                                      disabled={!day.on}
                                      onChange={e => setDay(key, { from: e.target.value })}
                                    />
                                    <span style={{ fontSize: 13, color: '#555555' }}>–</span>
                                    <input
                                      type="time"
                                      className="time-input-dark"
                                      value={day.to}
                                      disabled={!day.on}
                                      onChange={e => setDay(key, { to: e.target.value })}
                                    />
                                  </div>
                                )
                              })}

                              {/* Save button with feedback */}
                              <div style={{ marginTop: 4 }}>
                                <button
                                  onClick={handleQuietSave}
                                  disabled={quietSaved}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '7px 20px', border: 'none', borderRadius: 4,
                                    fontSize: 13, fontWeight: 500,
                                    background: '#FFFFFF', color: '#111111',
                                    cursor: quietSaved ? 'default' : 'pointer',
                                    fontFamily: "'Inter', system-ui, sans-serif",
                                  }}
                                >
                                  {quietSaved ? (
                                    <>
                                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                        <path d="M2 6.5l3 3 6-6" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      Saved
                                    </>
                                  ) : 'Save'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                    <span style={{ fontSize: 14, color: '#444444' }}>Coming soon</span>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom fade */}
            {!atBottom && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
                background: 'linear-gradient(to bottom, transparent, #111111)',
                pointerEvents: 'none',
              }}/>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '14px 20px', borderTop: '1px solid #1E1E1E',
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleDone}
              style={{
                padding: '10px 24px', background: '#1D8160',
                border: 'none', borderRadius: 9999,
                fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#166649'}
              onMouseLeave={e => e.currentTarget.style.background = '#1D8160'}
            >
              Done
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}
