import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AppHubLogoMark } from '../../components/AppHubLogoMark'
import { QuestionScreen } from '../app-hub/QuestionScreen'
import { Question2Screen } from '../app-hub/Question2Screen'
import { RecommendationsScreen } from '../app-hub/RecommendationsScreen'

/* ─────────────────────────────────────────────────────────
 * APP HUB (enterprise) — step-driven shell
 * ───────────────────────────────────────────────────────── */

const LAYOUT = {
  columnMax: 600,
  gapEyebrowToHeadline: 10,
  gapHeadlineToBody: 14,
  gapBeforeList: 38,
  gapAfterList: 56,
  gridColumnGap: 28,
  gridRowGap: 26,
  whereAppsTitleBelow: 20,
}

const MOTION = {
  spring: { type: 'spring', stiffness: 420, damping: 36 },
  stagger: 0.055,
  heroEnter: { opacity: 0, y: 10 },
}

const WHERE_APPS_WORK = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
        <path fill="currentColor" d="M2 7a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zm14.037 7.776L14 13.369V6.63l2.037-1.406a1.25 1.25 0 0 1 1.96 1.028v7.495a1.25 1.25 0 0 1-1.96 1.029"/>
      </svg>
    ),
    label: 'In meetings',
    desc: 'Run apps live during your calls',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
        <path fill="currentColor" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m.5 9h-3l-.09.008a.5.5 0 0 0 0 .984L7.5 12h3l.09-.008a.5.5 0 0 0 0-.984zm2-3h-5l-.09.008a.5.5 0 0 0 0 .984L7.5 9h5l.09-.008a.5.5 0 0 0 0-.984z"/>
      </svg>
    ),
    label: 'In spaces',
    desc: 'Bots and tabs inside your team spaces',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden>
        <path fill="currentColor" d="M6.166 3v10H13.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3ZM2.5 3h2.166v10H2.5A1.5 1.5 0 0 1 1 11.5v-7A1.5 1.5 0 0 1 2.5 3"/>
      </svg>
    ),
    label: 'In sidebar',
    desc: 'Always-on panels alongside your work',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
        <path fill="currentColor" d="M6.987 2.066a2 2 0 0 1 2.327.946l.074.149l.662 1.471a2.5 2.5 0 0 1-.442 2.718l-.133.132l-1.043.973c-.188.178-.047.867.633 2.045c.612 1.06 1.11 1.555 1.355 1.582h.043l.053-.01l2.05-.627a1.5 1.5 0 0 1 1.564.441l.091.115l1.357 1.88a2 2 0 0 1-.125 2.497l-.122.126l-.542.514a3.5 3.5 0 0 1-3.715.705c-1.935-.78-3.693-2.562-5.29-5.328c-1.6-2.773-2.265-5.19-1.968-7.26a3.5 3.5 0 0 1 2.261-2.789l.193-.064z"/>
      </svg>
    ),
    label: 'In calls',
    desc: 'Apps during phone and video calls',
  },
]

function IntroView({ onGetPicks, onSkip }) {
  const [primaryHover, setPrimaryHover] = useState(false)
  const [secondaryHover, setSecondaryHover] = useState(false)

  return (
    <motion.div
      initial={MOTION.heroEnter}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={MOTION.spring}
      style={{
        width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <AppHubLogoMark size={26} />
          <p style={{
            fontSize: 14, fontWeight: 600, color: '#E9E9E9',
            margin: 0, lineHeight: '20px', letterSpacing: '0.02em',
          }}>
            App Hub
          </p>
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: '#FFFFFF',
          margin: `${LAYOUT.gapEyebrowToHeadline}px 0 0`, lineHeight: '36px',
        }}>
          Do more inside Webex
        </h1>
        <p style={{
          fontSize: 15, fontWeight: 400, color: '#AAAAAA',
          margin: `${LAYOUT.gapHeadlineToBody}px 0 0`, lineHeight: '24px', maxWidth: 480,
        }}>
          Use the apps you already love, like Google Drive, Jira, or
          Salesforce, without ever leaving Webex.
        </p>
      </div>

      <div style={{ marginTop: LAYOUT.gapBeforeList, width: '100%' }}>
        <h2 style={{
          fontSize: 17, fontWeight: 600, color: '#FFFFFF',
          margin: `0 0 ${LAYOUT.whereAppsTitleBelow}px`, lineHeight: '24px',
        }}>
          Where apps work
        </h2>

        <div
          role="list"
          aria-label="Places you can use apps in Webex"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: LAYOUT.gridColumnGap,
            rowGap: LAYOUT.gridRowGap,
            width: '100%',
          }}
        >
          {WHERE_APPS_WORK.map((item, i) => (
            <motion.div
              key={item.label}
              role="listitem"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...MOTION.spring, delay: 0.1 + i * MOTION.stagger }}
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 14,
                minWidth: 0,
              }}
            >
              <div aria-hidden style={{
                width: 32, height: 32, flexShrink: 0, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                {item.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', lineHeight: '20px' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#888888', lineHeight: '20px' }}>
                  {item.desc}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...MOTION.spring, delay: 0.35 }}
        style={{
          display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'flex-start',
          gap: 12, marginTop: LAYOUT.gapAfterList,
        }}
      >
        <button
          type="button"
          onMouseEnter={() => setPrimaryHover(true)}
          onMouseLeave={() => setPrimaryHover(false)}
          onClick={onGetPicks}
          style={{
            background: primaryHover ? '#ebebeb' : '#FFFFFF',
            border: 'none', borderRadius: 9999,
            height: 48, padding: '0 28px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer',
            transition: 'background 0.15s, transform 0.15s',
            transform: primaryHover ? 'translateY(-1px)' : 'translateY(0)',
            fontSize: 14, fontWeight: 600, color: '#111111',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Get personalized picks
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 3l5 5-5 5" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          type="button"
          onMouseEnter={() => setSecondaryHover(true)}
          onMouseLeave={() => setSecondaryHover(false)}
          onClick={onSkip}
          style={{
            background: secondaryHover ? '#4A4A4A' : '#3A3A3A',
            border: 'none', borderRadius: 9999,
            height: 48, padding: '0 24px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s, transform 0.15s',
            transform: secondaryHover ? 'translateY(-1px)' : 'translateY(0)',
            fontSize: 14, fontWeight: 500, color: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Skip and browse all apps
        </button>
      </motion.div>
    </motion.div>
  )
}

export function AppHubTab() {
  const [step, setStep] = useState('intro')
  const [q1Answers, setQ1Answers] = useState([])
  const [q2Answers, setQ2Answers] = useState([])

  const isRecsView = step === 'recs' || step === 'browse'

  return (
    <div style={{
      margin: 4,
      height: 'calc(100% - 8px)',
      background: '#1A1A1A',
      border: '1px solid #494949',
      borderRadius: 12,
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      <div
        className="scrollbar-dark"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isRecsView ? 'flex-start' : 'center',
          minHeight: 0,
          padding: isRecsView ? '32px 32px 220px' : '48px 44px 56px',
        }}
      >
        <div style={{
          width: isRecsView ? 'clamp(560px, 85%, 960px)' : '100%',
          maxWidth: isRecsView ? undefined : LAYOUT.columnMax,
          display: 'flex', flexDirection: 'column', alignItems: 'stretch',
          textAlign: 'left',
        }}>
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <IntroView
                key="intro"
                onGetPicks={() => setStep('q1')}
                onSkip={() => setStep('browse')}
              />
            )}
            {step === 'q1' && (
              <QuestionScreen
                key="q1"
                onNext={(selected) => {
                  setQ1Answers(selected)
                  setStep('q2')
                }}
                onBack={() => setStep('intro')}
              />
            )}
            {step === 'q2' && (
              <Question2Screen
                key="q2"
                onSubmit={(selected) => {
                  setQ2Answers(selected)
                  setStep('recs')
                }}
                onBack={() => setStep('q1')}
              />
            )}
            {step === 'recs' && (
              <RecommendationsScreen
                key="recs"
                q1Answers={q1Answers}
                q2Answers={q2Answers}
                enterpriseTeamSection
              />
            )}
            {step === 'browse' && (
              <RecommendationsScreen key="browse" browseAllMode enterpriseTeamSection />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
