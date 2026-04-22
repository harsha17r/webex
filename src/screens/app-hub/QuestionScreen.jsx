import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const SPRING = { type: 'spring', stiffness: 420, damping: 36 }

const OPTIONS = [
  {
    key: 'meetings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5Zm15.44 14.25-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z"
        />
      </svg>
    ),
    label: 'Meetings',
    desc: 'Presenting, collaborating, running calls',
  },
  {
    key: 'messaging',
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden>
        <path fill="currentColor" d="M10 2a8 8 0 1 1-3.613 15.14l-.121-.065l-3.645.91a.5.5 0 0 1-.62-.441v-.082l.014-.083l.91-3.644l-.063-.12a8 8 0 0 1-.83-2.887l-.025-.382L2 10a8 8 0 0 1 8-8m.5 9h-3l-.09.008a.5.5 0 0 0 0 .984L7.5 12h3l.09-.008a.5.5 0 0 0 0-.984zm2-3h-5l-.09.008a.5.5 0 0 0 0 .984L7.5 9h5l.09-.008a.5.5 0 0 0 0-.984z"/>
      </svg>
    ),
    label: 'Messaging',
    desc: 'Team spaces, channels, quick chats',
  },
  {
    key: 'contact_center',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
    label: 'Contact Center',
    desc: 'Customer support and calls',
  },
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function QuestionScreen({ onNext, onBack }) {
  const [selected, setSelected] = useState([])
  const [hovered, setHovered] = useState(null)
  const [nextHover, setNextHover] = useState(false)
  const [backHover, setBackHover] = useState(false)

  function toggle(key) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={SPRING}
      style={{
        width: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'stretch', textAlign: 'left',
      }}
    >
      {/* Step indicator */}
      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: 9999,
            background: '#1D8160',
          }} />
          <div style={{
            width: 8, height: 8, borderRadius: 9999,
            background: '#3A3A3A',
          }} />
        </div>
        <span style={{
          fontSize: 13, fontWeight: 500, color: '#888888', lineHeight: '20px',
        }}>
          Question 1 of 2
        </span>
      </div>

      {/* Heading + subheading */}
      <h1 style={{
        fontSize: 28, fontWeight: 700, color: '#FFFFFF',
        margin: '16px 0 0', lineHeight: '36px',
      }}>
        Where would you spend most of your time in Webex?
      </h1>
      <p style={{
        fontSize: 15, fontWeight: 400, color: '#AAAAAA',
        margin: '10px 0 0', lineHeight: '24px',
      }}>
        Select all that apply. We'll suggest apps that fit.
      </p>

      {/* Option rows */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        marginTop: 32,
      }}>
        {OPTIONS.map((opt, i) => {
          const isSelected = selected.includes(opt.key)
          const isHovered = hovered === opt.key

          return (
            <motion.button
              type="button"
              key={opt.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.06 + i * 0.04 }}
              onClick={() => toggle(opt.key)}
              onMouseEnter={() => setHovered(opt.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16,
                width: '100%',
                padding: '16px 20px',
                background: isSelected
                  ? 'rgba(29, 129, 96, 0.12)'
                  : isHovered ? '#2A2A2A' : '#222222',
                border: isSelected
                  ? '1.5px solid #1D8160'
                  : '1.5px solid transparent',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
                textAlign: 'left',
                fontFamily: "'Inter', system-ui, sans-serif",
                position: 'relative',
                boxSizing: 'border-box',
              }}
            >
              <div style={{
                width: 40, height: 40, flexShrink: 0,
                borderRadius: 10, background: '#333333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                {opt.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', lineHeight: '22px' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 400, color: '#888888', lineHeight: '20px' }}>
                  {opt.desc}
                </span>
              </div>

              {/* Selection indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      width: 24, height: 24, flexShrink: 0,
                      borderRadius: 9999, background: '#1D8160',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CheckIcon />
                  </motion.div>
                )}
              </AnimatePresence>
              {!isSelected && (
                <div style={{
                  width: 24, height: 24, flexShrink: 0,
                  borderRadius: 9999,
                  border: '1.5px solid #494949',
                  boxSizing: 'border-box',
                }} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        gap: 12, marginTop: 40,
      }}>
        <button
          type="button"
          disabled={selected.length === 0}
          onMouseEnter={() => setNextHover(true)}
          onMouseLeave={() => setNextHover(false)}
          onClick={() => onNext(selected)}
          style={{
            background: selected.length === 0
              ? '#3A3A3A'
              : nextHover ? '#ebebeb' : '#FFFFFF',
            border: 'none', borderRadius: 9999,
            height: 48, padding: '0 28px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selected.length === 0 ? 0.55 : 1,
            transition: 'background 0.15s, opacity 0.15s',
            fontSize: 14, fontWeight: 600, color: selected.length === 0 ? '#888888' : '#111111',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 3l5 5-5 5" stroke={selected.length === 0 ? '#888888' : '#111111'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          type="button"
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          onClick={onBack}
          style={{
            background: backHover ? '#4A4A4A' : '#3A3A3A',
            border: 'none', borderRadius: 9999,
            height: 48, padding: '0 24px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
            fontSize: 14, fontWeight: 500, color: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Back
        </button>
      </div>
    </motion.div>
  )
}
