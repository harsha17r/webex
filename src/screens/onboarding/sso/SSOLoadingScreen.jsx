import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import logoVerticalRGB from '../../../assets/logos/RGB_Webex_Logo_lockup_vertical_whitetext.svg'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — SSO Handoff Loading Screen
 *
 * Shown after Lumon SSO login. Webex takes over and shows
 * the user it's fetching their profile data.
 *
 * Read top-to-bottom. Each value is ms after mount.
 *
 *    0ms   dark Webex screen mounts — vertical logo appears instantly
 *  100ms   content wrapper slides up + fades in         (stage 1)
 *  250ms   "Signing you in…" heading fades in           (stage 2)
 *  700ms   Step 1 row enters — spinner active           (stage 3)
 *            "Connecting to Lumon Industries"
 * 1300ms   Step 1 spinner → green checkmark             (stage 4)
 * 1500ms   Step 2 row enters — spinner active           (stage 5)
 *            "Fetching your profile"
 * 2100ms   Step 2 spinner → green checkmark             (stage 6)
 * 2300ms   Step 3 row enters — spinner active           (stage 7)
 *            "Setting up your workspace"
 * 2900ms   Step 3 spinner → green checkmark             (stage 8)
 * 3200ms   navigate('/profile-review')
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  contentEnter: 100,    // content wrapper slides up from below
  heading:      250,    // heading fades in
  step0start:   700,    // step 1 row enters with spinner
  step0done:    1300,   // step 1 → green checkmark
  step1start:   1500,   // step 2 row enters
  step1done:    2100,   // step 2 → green checkmark
  step2start:   2300,   // step 3 row enters
  step2done:    2900,   // step 3 → green checkmark
  navigate:     3200,   // go to profile-review
}

/* Content wrapper — slides up on mount */
const CONTENT = {
  enterY: 40,
  spring: { type: 'spring', stiffness: 320, damping: 28 },
}

/* Heading */
const HEADING = {
  enterY: 16,
  spring: { type: 'spring', stiffness: 350, damping: 26 },
}

/* Step rows */
const STEPS = {
  items: [
    { label: 'Connecting to Lumon Industries', loadStage: 3, doneStage: 4 },
    { label: 'Fetching your profile',          loadStage: 5, doneStage: 6 },
    { label: 'Setting up your workspace',      loadStage: 7, doneStage: 8 },
  ],
  offsetY: 14,
  spring:  { type: 'spring', stiffness: 350, damping: 28 },
}

/* Spinner arc */
const SPINNER = {
  size:        20,
  strokeWidth: 2,
  dashArray:   '26 12',
  duration:    0.85,
}

/* Checkmark pop */
const CHECK = {
  spring: { type: 'spring', stiffness: 500, damping: 22 },
}

const C = {
  bg:          '#111111',
  surface:     '#222222',
  border:      '#494949',
  borderSubtle:'#AAAAAA',
  textPrimary: '#FFFFFF',
  textSecond:  '#AAAAAA',
  accent:      '#4ac397',
  accentDim:   '#1D8160',
  gradient1:   'linear-gradient(90deg, #4ac397 0%, #5cb3f0 100%)',
}

/* ── Sub-components ───────────────────────────────────── */

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <motion.svg
      width={SPINNER.size} height={SPINNER.size}
      viewBox={`0 0 ${SPINNER.size} ${SPINNER.size}`}
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: SPINNER.duration, ease: 'linear' }}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={SPINNER.size / 2} cy={SPINNER.size / 2} r={7}
        stroke={C.accent}
        strokeWidth={SPINNER.strokeWidth}
        strokeDasharray={SPINNER.dashArray}
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

function Checkmark() {
  return (
    <motion.svg
      width={SPINNER.size} height={SPINNER.size}
      viewBox={`0 0 ${SPINNER.size} ${SPINNER.size}`}
      fill="none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={CHECK.spring}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={SPINNER.size / 2} cy={SPINNER.size / 2} r={8.5}
        fill={C.accentDim} fillOpacity="0.25"
        stroke={C.accent} strokeWidth="1.5"
      />
      <path
        d="M6 10L8.5 12.5L14 7"
        stroke={C.accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  )
}

function StepRow({ label, status }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: STEPS.offsetY }}
      animate={{ opacity: 1, y: 0 }}
      transition={STEPS.spring}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0' }}
    >
      <AnimatePresence mode="wait">
        {status === 'loading'
          ? <Spinner key="spin" />
          : <Checkmark key="check" />
        }
      </AnimatePresence>
      <span style={{
        fontSize: 15, fontWeight: 500,
        color: status === 'done' ? C.textPrimary : C.textSecond,
        transition: 'color 0.35s',
      }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ── Main screen ──────────────────────────────────────── */

export function SSOLoadingScreen() {
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), TIMING.contentEnter),
      setTimeout(() => setStage(2), TIMING.heading),
      setTimeout(() => setStage(3), TIMING.step0start),
      setTimeout(() => setStage(4), TIMING.step0done),
      setTimeout(() => setStage(5), TIMING.step1start),
      setTimeout(() => setStage(6), TIMING.step1done),
      setTimeout(() => setStage(7), TIMING.step2start),
      setTimeout(() => setStage(8), TIMING.step2done),
      setTimeout(() => navigate('/profile-review'), TIMING.navigate),
    ]
    return () => timers.forEach(clearTimeout)
  }, [navigate])

  function stepStatus(step) {
    if (stage < step.loadStage) return 'hidden'
    if (stage < step.doneStage) return 'loading'
    return 'done'
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: C.bg,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Glow blob ── */}
      <div style={{
        position: 'absolute',
        bottom: -135, left: '50%',
        transform: 'translateX(-50%)',
        width: '100vw', height: 200,
        background: C.gradient1,
        filter: 'blur(30px)',
        borderRadius: '500%',
        pointerEvents: 'none',
      }} />

      {/* ── Top bar — Back pill + "…" button ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 72px 0',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px',
            background: 'transparent',
            border: `2px solid ${C.borderSubtle}`,
            borderRadius: 9999,
            fontSize: 14, fontWeight: 600, color: C.borderSubtle,
            fontFamily: 'inherit', cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.textPrimary; e.currentTarget.style.color = C.textPrimary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderSubtle; e.currentTarget.style.color = C.borderSubtle }}
        >
          <ArrowLeftIcon /> Back
        </button>

        <button
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: C.surface, border: `1.5px solid ${C.borderSubtle}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2e2e2e'; e.currentTarget.style.borderColor = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.borderSubtle }}
          aria-label="More options"
        >
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
            <circle cx="2" cy="2" r="1.5" fill="#AAAAAA"/>
            <circle cx="8" cy="2" r="1.5" fill="#AAAAAA"/>
            <circle cx="14" cy="2" r="1.5" fill="#AAAAAA"/>
          </svg>
        </button>
      </div>

      {/* ── Content area ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '6vh',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: 352, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}>

          {/* Vertical Webex logo — appears instantly */}
          <img src={logoVerticalRGB} alt="Webex" style={{ height: 80, objectFit: 'contain' }} />

          {/* Content slides up on mount */}
          <motion.div
            initial={{ opacity: 0, y: CONTENT.enterY }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : CONTENT.enterY }}
            transition={CONTENT.spring}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}
          >

            {/* Heading */}
            <motion.div
              style={{ textAlign: 'center', marginBottom: 32 }}
              initial={{ opacity: 0, y: HEADING.enterY }}
              animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : HEADING.enterY }}
              transition={HEADING.spring}
            >
              <h2 style={{
                fontSize: 26, fontWeight: 600,
                color: C.textPrimary,
                margin: '0 0 8px',
                letterSpacing: '-0.01em',
              }}>
                Signing you in…
              </h2>
              <p style={{ fontSize: 13, color: C.textSecond, margin: 0 }}>
                Authenticated via Lumon Industries SSO
              </p>
            </motion.div>

            {/* Step rows */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, width: '100%' }}>
              {STEPS.items.map((step) => {
                const status = stepStatus(step)
                if (status === 'hidden') return null
                return (
                  <StepRow key={step.label} label={step.label} status={status} />
                )
              })}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  )
}
