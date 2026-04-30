// Teams tab — empty state, styled to match the App Hub intro layout

import { useState } from 'react'
import { motion } from 'motion/react'

const SPRING = { type: 'spring', stiffness: 420, damping: 36 }

const SPACES = [
  { name: 'General',   sub: 'auto-created' },
  { name: 'Campaigns', sub: 'space'        },
  { name: 'Brand',     sub: 'space'        },
  { name: 'Analytics', sub: 'space'        },
]

function TeamIllustration() {
  return (
    <div style={{
      border: '1.5px dashed #4A4A4A',
      borderRadius: 14,
      padding: '18px 20px 20px',
      background: '#222222',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <p style={{
        margin: '0 0 14px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        color: '#CCCCCC',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        Marketing team
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
      }}>
        {SPACES.map((s, i) => (
          <div key={s.name} style={{
            background: i % 2 === 0 ? '#2C2C2C' : '#303030',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            border: '1px solid #3A3A3A',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>{s.name}</span>
            <span style={{ fontSize: 10, color: '#AAAAAA', fontFamily: "'Inter', system-ui, sans-serif" }}>{s.sub}</span>
          </div>
        ))}
        <div style={{
          background: '#242424',
          borderRadius: 10,
          border: '1px dashed #3A3A3A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 52,
        }}>
          <span style={{ fontSize: 18, color: '#AAAAAA', lineHeight: 1 }}>+</span>
        </div>
      </div>
    </div>
  )
}

function TeamsLogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <path fill="#FFFFFF" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3m-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5m8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5"/>
    </svg>
  )
}

export function TeamsTab() {
  const [primaryHover, setPrimaryHover] = useState(false)
  const [linkHover, setLinkHover] = useState(false)

  return (
    <div style={{
      margin: 4,
      height: 'calc(100% - 8px)',
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.07)',
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          padding: '40px 32px',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: 700,
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: 16,
          padding: '40px 48px 44px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          textAlign: 'left',
        }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TeamsLogoMark />
            <p style={{
              fontSize: 14, fontWeight: 600, color: '#E9E9E9',
              margin: 0, lineHeight: '20px', letterSpacing: '0.02em',
            }}>
              Teams
            </p>
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 28, fontWeight: 700, color: '#FFFFFF',
            margin: '10px 0 0', lineHeight: '36px',
          }}>
            A team is a group of spaces
          </h1>

          {/* Subhead */}
          <p style={{
            fontSize: 15, fontWeight: 400, color: '#AAAAAA',
            margin: '14px 0 0', lineHeight: '24px', maxWidth: 480,
          }}>
            Bring related spaces together under one roof, so your team always knows where to go.
          </p>

          {/* Illustration */}
          <div style={{ margin: '24px 0 28px' }}>
            <TeamIllustration />
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.25 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 22, marginTop: 32,
            }}
          >
            <button
              type="button"
              onMouseEnter={() => setPrimaryHover(true)}
              onMouseLeave={() => setPrimaryHover(false)}
              onClick={() => {}}
              style={{
                background: primaryHover ? '#ebebeb' : '#FFFFFF',
                border: 'none', borderRadius: 9999,
                height: 48,
                minWidth: 220,
                padding: '0 40px',
                boxSizing: 'border-box',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                cursor: 'pointer',
                transition: 'background 0.15s, transform 0.15s',
                transform: primaryHover ? 'translateY(-1px)' : 'translateY(0)',
                fontSize: 14, fontWeight: 600, color: '#111111',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path fill="currentColor" d="M7 1a.75.75 0 0 1 .75.75V6.25h4.5a.75.75 0 0 1 0 1.5H7.75v4.5a.75.75 0 0 1-1.5 0V7.75H1.75a.75.75 0 0 1 0-1.5H6.25V1.75A.75.75 0 0 1 7 1Z"/>
              </svg>
              Create a team
            </button>

            <p style={{ margin: 0, fontSize: 13, color: '#999999', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Just need a quick conversation?{' '}
              <button
                type="button"
                onMouseEnter={() => setLinkHover(true)}
                onMouseLeave={() => setLinkHover(false)}
                onClick={() => {}}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 13,
                  fontWeight: 400,
                  color: linkHover ? '#CCCCCC' : '#888888',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  textDecorationColor: linkHover ? '#CCCCCC' : '#555555',
                  transition: 'color 0.15s',
                }}
              >
                Start a space instead
              </button>
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
