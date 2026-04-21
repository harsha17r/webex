/* ─────────────────────────────────────────────────────────
 * SlideIllustrations.jsx
 * Scaled-down Webex UI mockups for the Messages carousel.
 * Each component fills position:absolute inset:0 (4:3 slot).
 * ───────────────────────────────────────────────────────── */

import { useId } from 'react'

const F = "'Inter', system-ui, sans-serif"

const C = {
  bg:      '#161616',
  surface: '#252525',
  input:   '#1E1E1E',
  border:  '#333333',
  border2: '#2A2A2A',
  white:   '#FFFFFF',
  gray1:   '#888888',
  gray2:   '#666666',
  gray3:   '#555555',
  blue:    '#3B9EFF',
  blueDk:  '#1170CF',
  blueBtn: '#0D6EFD',
  purple:  '#8B5CF6',
  green:   '#059669',
  amber:   '#D97706',
}

function Av({ color, initials, size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, color: '#FFF',
      flexShrink: 0, letterSpacing: '-0.3px',
    }}>{initials}</div>
  )
}

/* ═══════════════════════════════════════════════════════════
 * 1. Create a Space
 * ═══════════════════════════════════════════════════════════ */
export function CreateSpaceIllustration() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: C.bg, fontFamily: F, overflow: 'hidden',
    }}>
      {/* Centered in slide; scale fills frame (footer row omitted in markup) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '70%',
        maxWidth: 280,
        transform: 'translate(-50%, -50%) scale(1.12)',
      }}>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        width: '100%',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 13px 9px',
          borderBottom: `1px solid ${C.border2}`,
        }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.white }}>New space</span>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Space name */}
        <div style={{ padding: '11px 13px 9px' }}>
          <div style={{ fontSize: 9.5, color: C.gray1, marginBottom: 5 }}>Space name</div>
          <div style={{
            background: C.input, border: `1.5px solid ${C.blue}`,
            borderRadius: 6, padding: '6px 9px',
            fontSize: 11, color: C.white,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            Design Team
            <span style={{ width: 1.5, height: 11, background: C.blue, display: 'inline-block' }}/>
          </div>
        </div>

        {/* Add people */}
        <div style={{ padding: '0 13px 11px' }}>
          <div style={{ fontSize: 9.5, color: C.gray1, marginBottom: 6 }}>Add people</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
            <Av color={C.blueDk} initials="JD" size={25}/>
            <Av color={C.purple} initials="SR" size={25}/>
            <Av color={C.green}  initials="MK" size={25}/>
            <div style={{
              width: 25, height: 25, borderRadius: '50%',
              border: '1.5px dashed #444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: '#444', lineHeight: 1,
            }}>+</div>
          </div>
          <div style={{
            background: C.input, border: `1px solid ${C.border}`,
            borderRadius: 6, padding: '6px 9px',
            fontSize: 10.5, color: C.gray3,
          }}>Add by name or email…</div>
        </div>
        {/* No footer (Cancel / Create) — carousel crops at “Add people” flow */}
      </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
 * 2. Thread and React
 * ═══════════════════════════════════════════════════════════ */
export function ThreadAndReactIllustration() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: C.bg, fontFamily: F, overflow: 'hidden',
    }}>
      {/* Messages */}
      <div style={{ padding: '9px 13px 10px', display: 'flex', flexDirection: 'column', gap: 9 }}>

        {/* Message 1 — with reactions + thread */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Av color={C.blueDk} initials="JD" size={24}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: C.white }}>Jamie D</span>
              <span style={{ fontSize: 9, color: C.gray2 }}>10:32 AM</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 2,
                background: '#2A2A2A', borderRadius: 4, padding: '1px 5px',
                fontSize: 8, color: C.gray1,
              }}>
                <svg width="6" height="8" viewBox="0 0 8 12" fill={C.gray1}>
                  <path d="M7 1H1L3 5H1L4 11L7 5H5L7 1Z"/>
                </svg>
                Pinned
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: '#CCCCCC', lineHeight: '15px' }}>
              Here's the updated design brief for Q3. Let's review it in tomorrow's sync.
            </div>
            {/* Reactions */}
            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
              {[
                { emoji: '👍', count: 4, bg: '#1E2A3A', border: '#2A4060' },
                { emoji: '❤️', count: 2, bg: '#2A1E1E', border: '#502A2A' },
                { emoji: '🎉', count: 1, bg: '#2A2A1A', border: '#504A1A' },
              ].map(r => (
                <div key={r.emoji} style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  background: r.bg, border: `1px solid ${r.border}`,
                  borderRadius: 20, padding: '2px 6px', fontSize: 10,
                }}>
                  <span style={{ fontSize: 10 }}>{r.emoji}</span>
                  <span style={{ color: C.gray1 }}>{r.count}</span>
                </div>
              ))}
            </div>
            {/* Thread indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <div style={{ display: 'flex' }}>
                {[C.green, C.purple, C.amber].map((col, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: '50%', background: col,
                    marginLeft: i > 0 ? -4 : 0, border: '1.5px solid #161616',
                  }}/>
                ))}
              </div>
              <span style={{ fontSize: 9.5, color: C.blue, fontWeight: 500 }}>3 replies</span>
              <span style={{ fontSize: 9, color: C.gray2 }}>Last reply 10:45 AM</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: C.border2 }}/>

        {/* Message 2 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Av color={C.purple} initials="SR" size={24}/>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: C.white }}>Sarah R</span>
              <span style={{ fontSize: 9, color: C.gray2 }}>10:47 AM</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#CCCCCC', lineHeight: '15px' }}>
              Looks great! Can we schedule a review call? 😊
            </div>
            <div style={{ marginTop: 5 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                background: '#1E2A1E', border: '1px solid #2A4A2A',
                borderRadius: 20, padding: '2px 6px',
              }}>
                <span style={{ fontSize: 10 }}>😄</span>
                <span style={{ fontSize: 10, color: C.gray1 }}>3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message 3 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Av color={C.green} initials="MK" size={24}/>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: C.white }}>Maya K</span>
              <span style={{ fontSize: 9, color: C.gray2 }}>10:52 AM</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#CCCCCC', lineHeight: '15px' }}>
              Thursday 2 PM works for me! 👌
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
 * 3. Share Files Instantly
 * ═══════════════════════════════════════════════════════════ */
export function ShareFilesIllustration() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: C.bg, fontFamily: F, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Messages — flex: 1 fills available space; extra top padding after header removal */}
      <div style={{ flex: 1, padding: '16px 13px 6px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>

        {/* Maya's message with files */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Av color={C.green} initials="MK" size={24}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: C.white }}>Maya K</span>
              <span style={{ fontSize: 9, color: C.gray2 }}>2:14 PM</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#CCCCCC', lineHeight: '15px', marginBottom: 6 }}>
              Here are the final assets for the launch 🎉
            </div>

            {/* PDF file card */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '6px 10px',
              display: 'flex', alignItems: 'center', gap: 8,
              marginBottom: 5,
            }}>
              <div style={{
                width: 26, height: 30, borderRadius: 4,
                background: C.input, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 7, fontWeight: 700, color: '#E53E3E' }}>PDF</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Q3-Launch-Brief.pdf</div>
                <div style={{ fontSize: 9, color: C.gray2, marginTop: 1 }}>142 KB · PDF Document</div>
              </div>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v7M5 8l3 3 3-3M3 13h10" stroke={C.gray2} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Image file card */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, overflow: 'hidden',
              display: 'flex', alignItems: 'center',
            }}>
              <div style={{
                width: 42, height: 38, flexShrink: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'rgba(0,0,0,0.25)' }}/>
                <div style={{ position: 'absolute', top: 6, left: 5, width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,200,0.75)' }}/>
              </div>
              <div style={{ padding: '4px 10px' }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: C.white }}>hero-banner.png</div>
                <div style={{ fontSize: 9, color: C.gray2, marginTop: 1 }}>2.4 MB · Image</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag-and-drop hint — balanced margins so it reads like a footer chip */}
      <div style={{
        margin: '10px 12px 14px', flexShrink: 0,
        border: '1.5px dashed rgba(59, 158, 255, 0.45)',
        borderRadius: 8, padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(30, 42, 58, 0.55)',
        boxSizing: 'border-box',
      }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v7M5 8l3-3 3 3" stroke={C.blue} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="2" y="2" width="12" height="12" rx="2" stroke={C.blue} strokeWidth="1.2" strokeDasharray="2.5 2"/>
        </svg>
        <span style={{ fontSize: 9.5, color: C.blue }}>Drop files here to share instantly</span>
      </div>
    </div>
  )
}

/** Same mark as `TopBar` `CiscoAISymbol` (viewBox 28×28); gradient ids from `useId` avoid clashes with `#tb-*` and between instances. */
function CiscoAISymbolSlide({ size = 13 }) {
  const rid = useId().replace(/:/g, '')
  const ringId = `${rid}-cai-ring`
  const lensId = `${rid}-cai-lens`
  const innerId = `${rid}-cai-inner`
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id={ringId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0051AF" />
          <stop offset="67%" stopColor="#0087EA" />
          <stop offset="100%" stopColor="#00BCEB" />
        </linearGradient>
        <linearGradient id={lensId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0087EA" />
          <stop offset="84%" stopColor="#63FFF7" />
        </linearGradient>
        <linearGradient id={innerId} x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="35%" stopColor="rgba(116,191,75,0)" />
          <stop offset="96%" stopColor="#74BF4B" />
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="11.5" stroke={`url(#${ringId})`} strokeWidth="2" fill="none" />
      <ellipse cx="20" cy="8" rx="6" ry="6" fill={`url(#${lensId})`} opacity="0.85" />
      <ellipse cx="20" cy="8" rx="4" ry="5" fill={`url(#${innerId})`} opacity="0.9" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
 * 4. AI Catches You Up
 * ═══════════════════════════════════════════════════════════ */
export function AICatchesUpIllustration() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: C.bg, fontFamily: F, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '14px 18px',
      boxSizing: 'border-box',
    }}>
      {/* AI Summary card — centered; no faded thread strip below */}
      <div style={{
        width: '100%',
        maxWidth: 292,
        flexShrink: 0,
        background: 'linear-gradient(135deg, #131a2e 0%, #111e28 100%)',
        border: '1px solid #1e3050',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35)',
      }}>
        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 10px',
          borderBottom: '1px solid rgba(30, 48, 80, 0.45)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <CiscoAISymbolSlide size={15} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#93C5FD', letterSpacing: '-0.01em' }}>Cisco AI · Summary</span>
          <span style={{ fontSize: 9.5, color: '#5B7AA5', marginLeft: 'auto', flexShrink: 0 }}>12 messages</span>
        </div>

        {/* Bullet points */}
        <div style={{
          padding: '12px 14px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {[
            'Q3 design brief shared and approved by the team',
            'Review call scheduled for Thursday at 2 PM',
            'Maya uploaded final launch assets — PDF + banner',
          ].map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', background: '#60A5FA', flexShrink: 0, marginTop: 5,
              }}/>
              <span style={{ fontSize: 10, color: '#CBD5E1', lineHeight: '15px' }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Action items */}
        <div style={{
          borderTop: '1px solid rgba(30, 48, 80, 0.5)',
          padding: '10px 14px 14px',
          display: 'flex', flexDirection: 'column', gap: 7,
        }}>
          <div style={{
            fontSize: 9, fontWeight: 600, color: '#60A5FA',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            2 Action items
          </div>
          {[
            { ini: 'JD', color: C.blueDk, text: 'Schedule review call' },
            { ini: 'MK', color: C.green,  text: 'Confirm banner dimensions' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Av color={a.color} initials={a.ini} size={16}/>
              <span style={{ fontSize: 10, color: '#94A3B8', lineHeight: '14px' }}>{a.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
 * 5. Apps You Already Use
 * ═══════════════════════════════════════════════════════════ */

function MicrosoftLogo({ size = 20 }) {
  const s = Math.floor(size / 2) - 1
  return (
    <svg width={size} height={size} viewBox="0 0 21 21">
      <rect x="1"   y="1"   width={s} height={s} fill="#f25022"/>
      <rect x={s+2} y="1"   width={s} height={s} fill="#7fba00"/>
      <rect x="1"   y={s+2} width={s} height={s} fill="#00a4ef"/>
      <rect x={s+2} y={s+2} width={s} height={s} fill="#ffb900"/>
    </svg>
  )
}

function SalesforceLogo() {
  return (
    <svg width="32" height="22" viewBox="0 0 256 180">
      <path fill="#00a1e0" d="M106.553 19.651c8.248-8.594 19.731-13.924 32.43-13.924c16.883 0 31.612 9.414 39.455 23.389a54.5 54.5 0 0 1 22.3-4.74c30.449 0 55.134 24.9 55.134 55.615c0 30.719-24.685 55.62-55.134 55.62a54.7 54.7 0 0 1-10.86-1.083c-6.908 12.321-20.07 20.645-35.178 20.645a40.1 40.1 0 0 1-17.632-4.058c-7.002 16.47-23.316 28.019-42.33 28.019c-19.8 0-36.674-12.529-43.152-30.1c-2.83.602-5.763.915-8.772.915c-23.574 0-42.686-19.308-42.686-43.13a43.2 43.2 0 0 1 21.345-37.36a49.4 49.4 0 0 1-4.088-19.727C17.385 22.336 39.626.128 67.06.128c16.106 0 30.42 7.658 39.494 19.523"/>
    </svg>
  )
}

function JiraLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <defs>
        <linearGradient id="ji-a" x1="98%" x2="58%" y1="0%" y2="40%">
          <stop offset="18%" stopColor="#0052cc"/>
          <stop offset="100%" stopColor="#2684ff"/>
        </linearGradient>
        <linearGradient id="ji-b" x1="100%" x2="55%" y1="0%" y2="44%">
          <stop offset="18%" stopColor="#0052cc"/>
          <stop offset="100%" stopColor="#2684ff"/>
        </linearGradient>
      </defs>
      <path fill="#2684ff" d="M244.658 0H121.707a55.5 55.5 0 0 0 55.502 55.502h22.649V77.37c.02 30.625 24.841 55.447 55.466 55.467V10.666C255.324 4.777 250.55 0 244.658 0"/>
      <path fill="url(#ji-a)" d="M183.822 61.262H60.872c.019 30.625 24.84 55.447 55.466 55.467h22.649v21.938c.039 30.625 24.877 55.43 55.502 55.43V71.93c0-5.891-4.776-10.667-10.667-10.667"/>
      <path fill="url(#ji-b)" d="M122.951 122.489H0c0 30.653 24.85 55.502 55.502 55.502h22.72v21.867c.02 30.597 24.798 55.408 55.396 55.466V133.156c0-5.891-4.776-10.667-10.667-10.667"/>
    </svg>
  )
}

function SlackLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256">
      <path fill="#e01e5a" d="M53.841 161.32c0 14.832-11.987 26.82-26.819 26.82S.203 176.152.203 161.32c0-14.831 11.987-26.818 26.82-26.818H53.84zm13.41 0c0-14.831 11.987-26.818 26.819-26.818s26.819 11.987 26.819 26.819v67.047c0 14.832-11.987 26.82-26.82 26.82c-14.83 0-26.818-11.988-26.818-26.82z"/>
      <path fill="#36c5f0" d="M94.07 53.638c-14.832 0-26.82-11.987-26.82-26.819S79.239 0 94.07 0s26.819 11.987 26.819 26.819v26.82zm0 13.613c14.832 0 26.819 11.987 26.819 26.819s-11.987 26.819-26.82 26.819H26.82C11.987 120.889 0 108.902 0 94.069c0-14.83 11.987-26.818 26.819-26.818z"/>
      <path fill="#2eb67d" d="M201.55 94.07c0-14.832 11.987-26.82 26.818-26.82s26.82 11.988 26.82 26.82s-11.988 26.819-26.82 26.819H201.55zm-13.41 0c0 14.832-11.988 26.819-26.82 26.819c-14.831 0-26.818-11.987-26.818-26.82V26.82C134.502 11.987 146.489 0 161.32 0s26.819 11.987 26.819 26.819z"/>
      <path fill="#ecb22e" d="M161.32 201.55c14.832 0 26.82 11.987 26.82 26.818s-11.988 26.82-26.82 26.82c-14.831 0-26.818-11.988-26.818-26.82V201.55zm0-13.41c-14.831 0-26.818-11.988-26.818-26.82c0-14.831 11.987-26.818 26.819-26.818h67.25c14.832 0 26.82 11.987 26.82 26.819s-11.988 26.819-26.82 26.819z"/>
    </svg>
  )
}

function GoogleDriveLogo({ size = 22 }) {
  return (
    <svg width={size} height={size * 0.87} viewBox="0 0 256 229">
      <path fill="#0066da" d="m19.354 196.034 11.29 19.5c2.346 4.106 5.718 7.332 9.677 9.678q17.009-21.591 23.68-33.137q6.77-11.717 16.641-36.655q-26.604-3.502-40.32-3.502q-13.165 0-40.322 3.502c0 4.545 1.173 9.09 3.519 13.196z"/>
      <path fill="#ea4335" d="M215.681 225.212c3.96-2.346 7.332-5.572 9.677-9.677l4.692-8.064 22.434-38.855a26.57 26.57 0 0 0 3.518-13.196q-27.315-3.502-40.247-3.502q-13.899 0-40.248 3.502q9.754 25.075 16.422 36.655q6.724 11.683 23.752 33.137"/>
      <path fill="#00832d" d="M128.001 73.311q19.68-23.768 27.125-36.655q5.996-10.377 13.196-33.137C164.363 1.173 159.818 0 155.126 0h-54.25C96.184 0 91.64 1.32 87.68 3.519q9.16 26.103 15.544 37.154q7.056 12.213 24.777 32.638"/>
      <path fill="#2684fc" d="M175.36 155.42H80.642l-40.32 69.792c3.958 2.346 8.503 3.519 13.195 3.519h148.968c4.692 0 9.238-1.32 13.196-3.52z"/>
      <path fill="#00ac47" d="M128.001 73.311 87.681 3.52c-3.96 2.346-7.332 5.571-9.678 9.677L3.519 142.224A26.57 26.57 0 0 0 0 155.42h80.642z"/>
      <path fill="#ffba00" d="m215.242 77.71-37.243-64.514c-2.345-4.106-5.718-7.331-9.677-9.677l-40.32 69.792 47.358 82.109h80.496c0-4.546-1.173-9.09-3.519-13.196z"/>
    </svg>
  )
}

function GitHubLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 98 96">
      <path fill="#fff" fillRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
    </svg>
  )
}

export function AppsIntegrationsIllustration() {
  const apps = [
    { name: 'Salesforce', logo: <SalesforceLogo />,            bg: '#001525' },
    { name: 'Google Drive', logo: <GoogleDriveLogo size={22}/>, bg: '#0a1a0a' },
    { name: 'Microsoft',   logo: <MicrosoftLogo size={20}/>,   bg: '#001122' },
    { name: 'Jira',        logo: <JiraLogo size={22}/>,        bg: '#001033' },
    { name: 'Slack',       logo: <SlackLogo size={20}/>,       bg: '#1a0f10' },
    { name: 'GitHub',      logo: <GitHubLogo size={20}/>,      bg: '#111111' },
  ]

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: C.bg, fontFamily: F, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      padding: '11px 13px 10px',
    }}>
      {/* Header — App Hub mark matches sidebar NavItem (`icons.apphub`) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 9999,
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: C.white,
        }}>
          <svg width={14} height={14} viewBox="0 0 20 20" fill="none" aria-hidden>
            <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
          </svg>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.white }}>App Hub</span>
        <span style={{ fontSize: 9.5, color: C.gray2 }}>100+ integrations</span>
      </div>

      {/* 3×2 grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        flex: 1,
      }}>
        {apps.map(app => (
          <div key={app.name} style={{
            background: app.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '10px 6px 8px', gap: 5,
          }}>
            {app.logo}
            <span style={{ fontSize: 8.5, color: C.gray1, textAlign: 'center' }}>{app.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
