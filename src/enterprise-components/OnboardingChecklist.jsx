import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { NotificationSettingsModal } from './modals/NotificationSettingsModal'
import { AppearancesModal } from './modals/AppearancesModal'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — OnboardingChecklist open / close
 *
 * OPEN  (click header):
 *    0ms   card      → height 0 → auto  (spring, expands)
 *    0ms   chevron   → rotate 0° → 180°  (spring)
 *    0ms   row 1     → y:8 → 0, opacity 0 → 1  (spring)
 *   50ms   row 2     → y:8 → 0, opacity 0 → 1  (stagger)
 *  100ms   row 3     → y:8 → 0, opacity 0 → 1
 *  160ms   footer    → y:4 → 0, opacity 0 → 1  (last in)
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

// Fluent UI 20px icons
const TASKS = [
  {
    key: 'test-call',
    label: 'Test call to check audio & video',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M5 4a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-.321l3.037 2.097a1.25 1.25 0 0 0 1.96-1.029V6.252a1.25 1.25 0 0 0-1.96-1.028L13 7.32V7a3 3 0 0 0-3-3zm8 4.536l3.605-2.49a.25.25 0 0 1 .392.206v7.495a.25.25 0 0 1-.392.206L13 11.463zM3 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
    ),
  },
  {
    key: 'notifications',
    label: 'Customize notification settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M9.998 2c3.149 0 5.744 2.335 5.984 5.355l.014.223l.004.224l-.001 3.596l.925 2.222q.034.081.053.167l.016.086l.008.132a1 1 0 0 1-.749.963l-.116.027l-.135.01l-3.501-.001l-.005.161a2.5 2.5 0 0 1-4.99 0l-.005-.161H3.999a1 1 0 0 1-.26-.034l-.124-.042a1 1 0 0 1-.603-1.052l.021-.128l.043-.128l.923-2.219L4 7.793l.004-.225C4.127 4.451 6.771 2 9.998 2M11.5 15.004h-3l.007.141a1.5 1.5 0 0 0 1.349 1.348L10 16.5a1.5 1.5 0 0 0 1.493-1.355zM9.998 3c-2.623 0-4.77 1.924-4.98 4.385l-.014.212L5 7.802V11.5l-.038.192l-.963 2.313l11.958.002l.045-.002l-.964-2.313L15 11.5V7.812l-.004-.204C14.891 5.035 12.695 3 9.998 3"/>
      </svg>
    ),
  },
  {
    key: 'appearance',
    label: 'Adjust appearance',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path fill="#FFFFFF" d="M14.95 5a2.5 2.5 0 0 0-4.9 0H2.5a.5.5 0 0 0 0 1h7.55a2.5 2.5 0 0 0 4.9 0h2.55a.5.5 0 0 0 0-1zM12.5 7a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m-2.55 7a2.5 2.5 0 0 0-4.9 0H2.5a.5.5 0 0 0 0 1h2.55a2.5 2.5 0 0 0 4.9 0h7.55a.5.5 0 0 0 0-1zM7.5 16a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3"/>
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
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path fill="#FFFFFF" d="M7.646 4.147a.5.5 0 0 1 .707-.001l5.484 5.465a.55.55 0 0 1 0 .779l-5.484 5.465a.5.5 0 0 1-.706-.708L12.812 10L7.647 4.854a.5.5 0 0 1-.001-.707"/>
        </svg>
      </div>
    </div>
  )
}

/* ─── OnboardingChecklist ───────────────────────────────── */

const DISMISSED_KEY = 'webex_checklist_dismissed'

export function OnboardingChecklist() {
  const [open,      setOpen]      = useState(false)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true')
  const [completed, setCompleted] = useState(new Set())
  const [notifModalOpen,      setNotifModalOpen]      = useState(false)
  const [appearancesOpen,     setAppearancesOpen]     = useState(false)

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
          width="20" height="20" viewBox="0 0 20 20"
          animate={{ rotate: open ? 180 : 0 }}
          transition={CHEVRON.spring}
          style={{ flexShrink: 0, originX: '50%', originY: '50%' }}
        >
          <path fill="#FFFFFF" d="M15.854 7.646a.5.5 0 0 1 .001.707l-5.465 5.484a.55.55 0 0 1-.78 0L4.147 8.353a.5.5 0 1 1 .708-.706L10 12.812l5.147-5.165a.5.5 0 0 1 .707-.001"/>
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
          {completed.size}/3
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
                if (task.key === 'notifications') setNotifModalOpen(true)
                else if (task.key === 'appearance') setAppearancesOpen(true)
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
            onClick={() => { localStorage.setItem(DISMISSED_KEY, 'true'); setDismissed(true) }}
            style={{ padding: '8px 0', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 12, fontWeight: 400, color: '#2E96E8', lineHeight: '20px' }}>
              Don't show this again
            </span>
          </div>
        </motion.div>
      </motion.div>

    </div>

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
