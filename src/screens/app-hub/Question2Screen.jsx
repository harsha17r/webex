import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/* Heroicons 24/solid — filled glyphs only */

const SPRING = { type: 'spring', stiffness: 420, damping: 36 }

const OPTIONS = [
  {
    key: 'work_productivity',
    label: 'Work & Productivity',
    desc: 'Tasks, project management, docs, planning',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M8 2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h3V2Zm6 0h-4v2h4V2ZM4 7v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7H4Z"
        />
        <rect fill="currentColor" x="8" y="10" width="8" height="2" rx="0.25" />
        <rect fill="currentColor" x="8" y="14" width="5" height="2" rx="0.25" />
        <rect fill="currentColor" x="8" y="18" width="8" height="2" rx="0.25" />
      </svg>
    ),
  },
  {
    key: 'collaboration',
    label: 'Collaboration',
    desc: 'Whiteboards, brainstorming, design',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0zM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38z"
          clipRule="evenodd"
        />
        <path
          fill="currentColor"
          d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047zM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z"
        />
      </svg>
    ),
  },
  {
    key: 'automation',
    label: 'Automation',
    desc: 'Bots, alerts, workflows',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: 'engagement',
    label: 'Engagement',
    desc: 'Polls, Q&A, reactions, meetings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75z"
        />
      </svg>
    ),
  },
  {
    key: 'integrations',
    label: 'Integrations',
    desc: 'CRM, calendar, file sync',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: 'customer_experience',
    label: 'Customer Experience',
    desc: 'Support, ticketing, contact center',
    /* Icon: Flex free icons by Streamline — https://creativecommons.org/licenses/by/4.0/ */
    icon: (
      <svg width="22" height="22" viewBox="0 0 14 14" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M3.703.484A7 7 0 0 1 5.151.142a.243.243 0 0 1 .272.244v3.34c0 .12-.086.221-.202.252c-.388.104-.73.289-1.007.565c-.459.459-.666 1.101-.666 1.833c0 .733.207 1.375.666 1.834s1.102.666 1.834.666q.243 0 .473-.03a.27.27 0 0 1 .22.068c.729.678 1.824 1.325 3.162 1.714a.625.625 0 1 0 .35-1.2c-.99-.288-1.799-.73-2.37-1.181a.025.025 0 0 1-.002-.037c.46-.459.667-1.101.667-1.834c0-.732-.208-1.374-.667-1.833a2.2 2.2 0 0 0-1.006-.565a.266.266 0 0 1-.202-.253V.38c0-.146.124-.26.269-.245a8.3 8.3 0 0 1 1.45.292a7 7 0 0 1 .861.318l.052.024l.015.008h.001c1.333.658 2.305 1.851 2.562 3.701c.021.153.127.386.333.71c.147.231.318.468.498.717l.197.272c.237.333.485.697.635 1.037c.138.313.276.793-.016 1.209a1.3 1.3 0 0 1-1.06.555l-.048.001a.25.25 0 0 0-.244.25v.653a2 2 0 0 1-2 2h-.493c-.227 0-.37.136-.401.282v1.205a.5.5 0 0 1-.5.5h-6.02a.5.5 0 0 1-.5-.5l.002-.828c.002-.718-.157-1.407-.514-1.984l-.162-.26C1.28 9.8.97 9.306.738 8.703C.46 7.98.298 7.118.298 5.877c0-2.346.846-4.058 2.493-4.983l.012-.007l.051-.029q.065-.037.183-.095c.157-.078.382-.178.666-.279"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Question2Screen({ onSubmit, onBack }) {
  const [selected, setSelected] = useState([])
  const [hovered, setHovered] = useState(null)
  const [submitHover, setSubmitHover] = useState(false)
  const [backHover, setBackHover] = useState(false)

  function toggle(key) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={SPRING}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: '#1D8160',
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              background: '#1D8160',
            }}
          />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#888888',
            lineHeight: '20px',
          }}
        >
          Question 2 of 2
        </span>
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '16px 0 0',
          lineHeight: '36px',
        }}
      >
        What kind of apps are you looking for?
      </h1>
      <p
        style={{
          fontSize: 15,
          fontWeight: 400,
          color: '#AAAAAA',
          margin: '10px 0 0',
          lineHeight: '24px',
        }}
      >
        Select all that apply. We'll suggest apps that fit.
      </p>

      <div
        role="group"
        aria-label="Choose areas that matter to you"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: 10,
          rowGap: 10,
          marginTop: 32,
        }}
      >
        {OPTIONS.map((opt, i) => {
          const isSelected = selected.includes(opt.key)
          const isHovered = hovered === opt.key

          return (
            <motion.button
              type="button"
              key={opt.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.04 + i * 0.03 }}
              onClick={() => toggle(opt.key)}
              onMouseEnter={() => setHovered(opt.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                minWidth: 0,
                padding: '14px 16px',
                background: isSelected
                  ? 'rgba(29, 129, 96, 0.12)'
                  : isHovered
                    ? '#2A2A2A'
                    : '#222222',
                border: isSelected
                  ? '1.5px solid #1D8160'
                  : '1.5px solid transparent',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
                textAlign: 'left',
                fontFamily: "'Inter', system-ui, sans-serif",
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 10,
                  background: '#333333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                {opt.icon}
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: '20px',
                  }}
                >
                  {opt.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: '#888888',
                    lineHeight: '18px',
                  }}
                >
                  {opt.desc}
                </span>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      width: 22,
                      height: 22,
                      flexShrink: 0,
                      borderRadius: 6,
                      background: '#1D8160',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon />
                  </motion.div>
                )}
              </AnimatePresence>
              {!isSelected && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    borderRadius: 6,
                    border: '1.5px solid #494949',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginTop: 36,
        }}
      >
        <button
          type="button"
          disabled={selected.length === 0}
          onMouseEnter={() => setSubmitHover(true)}
          onMouseLeave={() => setSubmitHover(false)}
          onClick={() => onSubmit(selected)}
          style={{
            background:
              selected.length === 0
                ? '#3A3A3A'
                : submitHover
                  ? '#ebebeb'
                  : '#FFFFFF',
            border: 'none',
            borderRadius: 9999,
            height: 48,
            padding: '0 28px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selected.length === 0 ? 0.55 : 1,
            transition: 'background 0.15s, opacity 0.15s',
            fontSize: 14,
            fontWeight: 600,
            color: selected.length === 0 ? '#888888' : '#111111',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Submit
        </button>

        <button
          type="button"
          onMouseEnter={() => setBackHover(true)}
          onMouseLeave={() => setBackHover(false)}
          onClick={onBack}
          style={{
            background: backHover ? '#4A4A4A' : '#3A3A3A',
            border: 'none',
            borderRadius: 9999,
            height: 48,
            padding: '0 24px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
            fontSize: 14,
            fontWeight: 500,
            color: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Back
        </button>
      </div>
    </motion.div>
  )
}
