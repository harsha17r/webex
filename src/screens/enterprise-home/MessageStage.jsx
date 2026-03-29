import { useState, useRef, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────
 * Carousel layout:
 *   - Image: 4:3 aspect ratio, full card width, dominant
 *   - Current card fills most of container, next card peeks
 *   - Arrows centered vertically on the card (not below)
 *   - ResizeObserver keeps pixel math accurate on resize
 * ───────────────────────────────────────────────────────── */

const PEEK = 52
const GAP  = 14

const SLIDES = [
  {
    key: 'spaces',
    title: 'Create a Space',
    description: 'Bring your team together in a shared space. Invite anyone with an email.',
  },
  {
    key: 'messaging',
    title: 'Thread and React',
    description: 'Reply in threads, pin messages, and react. Conversations stay clean.',
  },
  {
    key: 'files',
    title: 'Share Files Instantly',
    description: 'Drop files into any conversation. Co-edit with your team in real time.',
  },
  {
    key: 'ai',
    title: 'AI Catches You Up',
    description: 'Missed a thread? Cisco AI summarizes it so you are always in the loop.',
  },
  {
    key: 'integrations',
    title: 'Apps You Already Use',
    description: 'Connect Salesforce, Google, Microsoft and 100 more without leaving Webex.',
  },
]

function ActionButton({ icon, label }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        height: 48, padding: '0 28px',
        background: pressed ? '#2A2A2A' : hovered ? '#1E1E1E' : 'transparent',
        border: `1px solid ${hovered ? '#555555' : '#333333'}`,
        borderRadius: 8,
        fontSize: 14, fontWeight: 500,
        color: hovered ? '#DDDDDD' : '#888888',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export function MessageStage() {
  const [current, setCurrent]               = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const cardWidth  = containerWidth > 0 ? containerWidth - PEEK - GAP : 0
  const translateX = current * (cardWidth + GAP)

  function prev() { setCurrent(c => Math.max(0, c - 1)) }
  function next() { setCurrent(c => Math.min(SLIDES.length - 1, c + 1)) }

  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 40px',
      boxSizing: 'border-box',
      background: '#1A1A1A',
      overflow: 'visible',
      position: 'relative',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24, width: '100%', maxWidth: 360 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px', lineHeight: '28px' }}>
          Your messages live here
        </h2>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#666666', margin: 0 }}>
          Here is what you can do with Messages
        </p>
      </div>

      {/* Carousel */}
      <div ref={containerRef} style={{ width: '100%', maxWidth: 400, position: 'relative', flexShrink: 0 }}>

        {/* Clipping track — no borderRadius here, kept on individual cards */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            gap: GAP,
            transform: `translateX(-${translateX}px)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {SLIDES.map(slide => (
              <div
                key={slide.key}
                style={{
                  width: cardWidth || '100%',
                  flexShrink: 0,
                  background: '#222222',
                  border: '1px solid #333333',
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* 4:3 image area */}
                <div style={{
                  width: '100%',
                  paddingTop: '75%',
                  position: 'relative',
                  background: '#2A2A2A',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {/* Placeholder grid to suggest image composition */}
                    <svg width="48" height="36" viewBox="0 0 48 36" fill="none" opacity="0.2">
                      <rect width="48" height="36" rx="3" fill="#888"/>
                      <circle cx="15" cy="13" r="5" fill="#888"/>
                      <path d="M0 26l12-10 8 7 10-12 18 15H0z" fill="#888"/>
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <div style={{ padding: '14px 18px 18px' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px', lineHeight: '20px' }}>
                    {slide.title}
                  </p>
                  <p style={{
                    fontSize: 13, fontWeight: 400, color: '#777777',
                    margin: 0, lineHeight: '20px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right fade — signals more slides ahead */}
        {current < SLIDES.length - 1 && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: PEEK + 20, height: '100%',
            background: 'linear-gradient(to right, transparent, #1A1A1A)',
            pointerEvents: 'none',
          }}/>
        )}

        {/* Left arrow */}
        {current > 0 && (
          <button onClick={prev} style={{
            position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: 9999,
            background: '#2A2A2A', border: '1px solid #404040',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L7 9L11 14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {current < SLIDES.length - 1 && (
          <button onClick={next} style={{
            position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, borderRadius: 9999,
            background: '#2A2A2A', border: '1px solid #404040',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4L11 9L7 14" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? 18 : 6, height: 6,
            borderRadius: 9999,
            background: i === current ? '#FFFFFF' : '#2E2E2E',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'width 0.2s, background 0.2s',
          }}/>
        ))}
      </div>

      {/* Secondary actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 56 }}>
        <ActionButton
          label="Send a message"
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 3.5C2 2.95 2.45 2.5 3 2.5H12C12.55 2.5 13 2.95 13 3.5V9C13 9.55 12.55 10 12 10H5.5L2 13V3.5Z"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <ActionButton
          label="Create a space"
          icon={
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 13c0-2.76 2.24-4.5 5-4.5s5 1.74 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M11.5 7v4M9.5 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>


    </div>
  )
}
