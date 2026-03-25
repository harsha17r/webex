import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SetupProfileModal } from './modals/SetupProfileModal'
import { NotificationSettingsModal } from './modals/NotificationSettingsModal'
import { AppearancesModal } from './modals/AppearancesModal'
import { ConnectCalendarModal } from './modals/ConnectCalendarModal'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — OnboardingChecklist open / close
 *
 * OPEN  (click header):
 *    0ms   card      → height 0 → auto  (spring, expands)
 *    0ms   chevron   → rotate 0° → 180°  (spring)
 *    0ms   row 1     → y:8 → 0, opacity 0 → 1  (spring)
 *   50ms   row 2     → y:8 → 0, opacity 0 → 1  (stagger)
 *  100ms   row 3     → y:8 → 0, opacity 0 → 1
 *  150ms   row 4     → y:8 → 0, opacity 0 → 1
 *  200ms   row 5     → y:8 → 0, opacity 0 → 1
 *  260ms   footer    → y:4 → 0, opacity 0 → 1  (last in)
 *
 * CLOSE (click header):
 *    0ms   rows+footer → opacity 1 → 0  (simultaneous, fast 80ms)
 *    0ms   chevron     → rotate 180° → 0°  (spring)
 *    0ms   card        → height auto → 0  (spring, collapses)
 *
 * TASK COMPLETE (click row):
 *    0ms   checkmark   → scale 0 → 1  (pop spring)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  rowStagger:  0.05,  // seconds between each row entering
  footerDelay: 0.28,  // seconds before footer appears after open
}

const CARD = {
  heightSpring: { type: 'spring', stiffness: 260, damping: 28 },
}

const ROW = {
  offsetY:      8,    // px — rows translate up from on enter
  spring:       { type: 'spring', stiffness: 380, damping: 26 },
  exitDuration: 0.08, // seconds — quick simultaneous collapse on close
}

const FOOTER = {
  offsetY: 4,
  spring:  { type: 'spring', stiffness: 300, damping: 28 },
}

const CHEVRON = {
  spring: { type: 'spring', stiffness: 320, damping: 26 },
}

const TASK_COMPLETE = {
  spring: { type: 'spring', stiffness: 500, damping: 20 }, // snappy pop
}

/* ─── Data ─────────────────────────────────────────────── */

const TASKS = [
  {
    key: 'test-call',
    label: 'Test call to check audio & video',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="13" height="11" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M15 9.5L21 7V17L15 14.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Set up your profile',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M4 20c0-4 3.582-6 8-6s8 2 8 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'calendar',
    label: 'Connect your Calendar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M3 9h18M8 2v4M16 2v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'notifications',
    label: 'Customize notification settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 14v-4a7 7 0 0 1 14 0v4l2 3H3l2-3Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 19a2 2 0 0 0 4 0" stroke="#FFFFFF" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    key: 'appearance',
    label: 'Adjust appearance',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8"  cy="6"  r="2" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5"/>
        <circle cx="16" cy="12" r="2" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5"/>
        <circle cx="10" cy="18" r="2" fill="#111111" stroke="#FFFFFF" strokeWidth="1.5"/>
      </svg>
    ),
  },
]

/* ─── TaskRow ───────────────────────────────────────────── */

function TaskRow({ task, done, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12, padding: '12px 8px',
        cursor: 'pointer', borderRadius: 12,
        background: hovered && !done ? 'rgba(255,255,255,0.04)' : 'transparent',
        transition: 'background 0.12s',
      }}
    >
      {/* Left: icon + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>
          {done ? (
            /* Checkmark pops in with spring when task is first completed */
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={TASK_COMPLETE.spring}
              style={{ display: 'flex' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#2BAB7E"/>
                <path d="M7 12l3.5 3.5L17 8" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          ) : task.icon}
        </div>
        <span style={{
          fontSize: 14, fontWeight: 400,
          color: done ? '#737373' : '#FFFFFF',
          lineHeight: '20px',
          textDecoration: done ? 'line-through' : 'none',
          transition: 'color 0.2s',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.label}
        </span>
      </div>

      {/* Right: chevron fades out when done */}
      <div style={{ flexShrink: 0, opacity: done ? 0 : 1, transition: 'opacity 0.2s' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

/* ─── OnboardingChecklist ───────────────────────────────── */

export function OnboardingChecklist({ onCalendarConnect }) {
  const [open,             setOpen]             = useState(false)
  const [dismissed,        setDismissed]        = useState(false)
  const [completed,        setCompleted]        = useState(new Set())
  const [profileModalOpen,    setProfileModalOpen]    = useState(false)
  const [notifModalOpen,      setNotifModalOpen]      = useState(false)
  const [appearancesOpen,     setAppearancesOpen]     = useState(false)
  const [calendarModalOpen,   setCalendarModalOpen]   = useState(false)

  if (dismissed) return null

  function toggleTask(key) {
    setCompleted(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const fillPct = (completed.size / TASKS.length) * 100

  return (
    <>
    <div style={{
      position: 'absolute',
      bottom: 20, right: 20,
      width: 330,
      background: '#111111',
      border: '1px solid #595959',
      borderRadius: 16,
      padding: '12px 20px 12px',
      display: 'flex', flexDirection: 'column',
      gap: 12,
      zIndex: 10,
      boxSizing: 'border-box',
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
    }}>

      {/* ── Header ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none',
          padding: '4px 0',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: '#F0F0F0', lineHeight: '20px' }}>
          Personalize your account
        </span>

        {/* Chevron — spring rotation, not CSS transition */}
        <motion.svg
          width="24" height="24" viewBox="0 0 24 24" fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={CHEVRON.spring}
          style={{ flexShrink: 0, originX: '50%', originY: '50%' }}
        >
          <path d="M6 9L12 15L18 9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </motion.svg>
      </div>

      {/* ── Progress ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          flex: 1, height: 10,
          background: '#595959',
          borderRadius: 9999,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: completed.size === 0 ? 8 : `${fillPct}%`,
            minWidth: 8,
            background: '#2BAB7E',
            borderRadius: 9999,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}/>
        </div>
        <span style={{ fontSize: 14, fontWeight: 400, color: '#737373', lineHeight: '16px', flexShrink: 0 }}>
          {completed.size}/5
        </span>
      </div>

      {/* ── Task list + footer — height springs open/shut ── */}
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={CARD.heightSpring}
        style={{ overflow: 'hidden', pointerEvents: open ? 'auto' : 'none' }}
      >
        {/* Rows stagger in, collapse simultaneously */}
        {TASKS.map((task, i) => (
          <motion.div
            key={task.key}
            animate={{
              opacity: open ? 1 : 0,
              y:       open ? 0 : ROW.offsetY,
            }}
            transition={open
              ? { ...ROW.spring, delay: i * TIMING.rowStagger }
              : { duration: ROW.exitDuration, ease: 'easeIn' }
            }
          >
            <TaskRow
              task={task}
              done={completed.has(task.key)}
              onClick={() => {
                if (task.key === 'profile') setProfileModalOpen(true)
                else if (task.key === 'notifications') setNotifModalOpen(true)
                else if (task.key === 'appearance') setAppearancesOpen(true)
                else if (task.key === 'calendar') setCalendarModalOpen(true)
                else toggleTask(task.key)
              }}
            />
          </motion.div>
        ))}

        {/* Footer drifts in last */}
        <motion.div
          animate={{
            opacity: open ? 1 : 0,
            y:       open ? 0 : FOOTER.offsetY,
          }}
          transition={open
            ? { ...FOOTER.spring, delay: TIMING.footerDelay }
            : { duration: ROW.exitDuration, ease: 'easeIn' }
          }
        >
          <div
            onClick={() => setDismissed(true)}
            style={{ padding: '8px 0', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 12, fontWeight: 400, color: '#2E96E8', lineHeight: '20px' }}>
              Don't show this again
            </span>
          </div>
        </motion.div>
      </motion.div>

    </div>

    {/* Profile setup modal */}
    <AnimatePresence>
      {profileModalOpen && (
        <SetupProfileModal
          onClose={() => setProfileModalOpen(false)}
          onSave={() => toggleTask('profile')}
          onOpenAppearances={() => setAppearancesOpen(true)}
        />
      )}
    </AnimatePresence>

    {/* Calendar modal */}
    <AnimatePresence>
      {calendarModalOpen && (
        <ConnectCalendarModal
          onClose={() => setCalendarModalOpen(false)}
          onSave={() => { toggleTask('calendar'); onCalendarConnect?.() }}
        />
      )}
    </AnimatePresence>

    {/* Appearances modal */}
    <AnimatePresence>
      {appearancesOpen && (
        <AppearancesModal onClose={() => setAppearancesOpen(false)} onSave={() => toggleTask('appearance')} />
      )}
    </AnimatePresence>

    {/* Notification settings modal */}
    <AnimatePresence>
      {notifModalOpen && (
        <NotificationSettingsModal
          onClose={() => setNotifModalOpen(false)}
          onSave={() => toggleTask('notifications')}
        />
      )}
    </AnimatePresence>
    </>
  )
}
