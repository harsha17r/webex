import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useProfile, computeStatusExpiresAt } from '../../context/ProfileContext'

const CHAR_MAX = 75

const DURATIONS = [
  { key: '30m', label: '30 minutes' },
  { key: '1h', label: '1 hour' },
  { key: '2h', label: '2 hours' },
  { key: '12h', label: '12 hours' },
  { key: '1d', label: '1 day' },
  { key: '7d', label: '7 days' },
  { key: '14d', label: '14 days' },
  { key: 'custom', label: 'Custom' },
]

const PRESETS = [
  'Working from Beach 🏖️',
  'Working from Office 👍',
  'Working from home 🏠',
  'Out for lunch 🍽️',
  'Be right back ⌛',
]

const EMOJI_PICK = ['😀', '😊', '👍', '❤️', '🔥', '✨', '🎉', '💼', '🏠', '🏖️', '🍽️', '☕', '⌛', '✅', '📞', '💻', '🎯', '🚀', '🙏', '👋', '😴', '🤝', '⭐', '💡']

function charCount(s) {
  return [...s].length
}

function isoToDatetimeLocalValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const z = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`
}

export function SetStatusModal({ onClose }) {
  const { profile, updateProfile } = useProfile()
  const [statusText, setStatusText] = useState(profile.statusText ?? '')
  const [clearAfter, setClearAfter] = useState(profile.statusClearAfter ?? '1d')
  const [customUntil, setCustomUntil] = useState(
    () => isoToDatetimeLocalValue(profile.statusCustomUntil)
  )
  const [durationOpen, setDurationOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [hoveredPreset, setHoveredPreset] = useState(null)
  const [hoveredDuration, setHoveredDuration] = useState(null)
  const textareaRef = useRef(null)
  const dropdownRef = useRef(null)
  const emojiRef = useRef(null)
  const dialogRef = useRef(null)
  const focusRestoreRef = useRef(null)

  useEffect(() => {
    focusRestoreRef.current = document.activeElement
    return () => {
      try { focusRestoreRef.current?.focus?.() } catch { /* */ }
    }
  }, [])

  const closeEmoji = useCallback(() => setEmojiOpen(false), [])
  const closeDuration = useCallback(() => setDurationOpen(false), [])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (emojiOpen) { closeEmoji(); return }
      if (durationOpen) { closeDuration(); return }
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, emojiOpen, durationOpen, closeEmoji, closeDuration])

  useEffect(() => {
    if (!emojiOpen && !durationOpen) return undefined
    function handler(e) {
      if (emojiOpen && emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false)
      }
      if (durationOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDurationOpen(false)
      }
    }
    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [emojiOpen, durationOpen])

  useEffect(() => {
    const root = dialogRef.current
    if (!root) return undefined
    const selector = 'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
    function focusables() {
      return [...root.querySelectorAll(selector)].filter(
        el => !el.closest('[aria-hidden="true"]')
      )
    }
    const id = window.requestAnimationFrame(() => {
      const els = focusables()
      els[0]?.focus()
    })
    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    root.addEventListener('keydown', onKeyDown)
    return () => { window.cancelAnimationFrame(id); root.removeEventListener('keydown', onKeyDown) }
  }, [])

  const durLabel = DURATIONS.find(d => d.key === clearAfter)?.label ?? '1 day'
  const count = charCount(statusText)
  const paddedCount = String(count).padStart(2, '0')

  function onChangeStatus(e) {
    const v = e.target.value
    if (charCount(v) <= CHAR_MAX) setStatusText(v)
  }

  function insertEmoji(emoji) {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const next = statusText.slice(0, start) + emoji + statusText.slice(end)
    if (charCount(next) > CHAR_MAX) return
    setStatusText(next)
    setEmojiOpen(false)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + [...emoji].length
      ta.setSelectionRange(pos, pos)
    })
  }

  function onPickPreset(text) {
    setStatusText(text.slice(0, CHAR_MAX))
    textareaRef.current?.focus()
  }

  function onSave() {
    const trimmed = statusText.trim()
    let customIso = null
    if (clearAfter === 'custom' && customUntil) {
      const d = new Date(customUntil)
      if (!Number.isNaN(d.getTime())) customIso = d.toISOString()
    }
    if (!trimmed) {
      updateProfile({ statusText: '', statusExpiresAt: null, statusCustomUntil: null, statusClearAfter: clearAfter })
    } else {
      updateProfile({
        statusText: trimmed,
        statusClearAfter: clearAfter,
        statusCustomUntil: clearAfter === 'custom' ? customIso : null,
        statusExpiresAt: computeStatusExpiresAt(clearAfter, clearAfter === 'custom' ? customIso : null),
      })
    }
    onClose()
  }

  return createPortal(
    <div
      role="presentation"
      style={{
        position: 'fixed', inset: 0, zIndex: 12000,
        backgroundColor: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        fontFamily: "'Inter', system-ui, sans-serif",
        colorScheme: 'dark',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-status-title"
        onMouseDown={e => e.stopPropagation()}
        tabIndex={-1}
        style={{
          width: '100%', maxWidth: 440,
          backgroundColor: '#0D0D0D',
          borderRadius: 14,
          border: '1px solid #2A2A2A',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          overflow: 'visible',
          outline: 'none',
          color: '#FFFFFF',
        }}
      >
        <div style={{ padding: '24px 24px 24px' }}>

          {/* ── Title ── */}
          <h2 id="set-status-title" style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Status
          </h2>

          {/* ── Textarea + emoji trigger ── */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <textarea
              ref={textareaRef}
              value={statusText}
              onChange={onChangeStatus}
              placeholder="What's your status?"
              rows={3}
              style={{
                width: '100%', resize: 'none', boxSizing: 'border-box',
                padding: '12px 12px 36px',
                borderRadius: 10,
                border: '1px solid #333333',
                background: '#141414',
                color: '#FFFFFF',
                fontSize: 14, lineHeight: '22px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />

            {/* Emoji trigger — ref wraps button + popover for outside-click */}
            <div ref={emojiRef} style={{ position: 'absolute', left: 10, bottom: 8 }}>
              <button
                type="button"
                aria-label="Insert emoji"
                aria-expanded={emojiOpen}
                onClick={() => setEmojiOpen(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center',
                  color: '#888888',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8.5 10.5h.01M15.5 10.5h.01M9 15c.85 1.65 4.15 1.65 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Emoji grid — opens BELOW the textarea */}
              {emojiOpen && (
                <div style={{
                  position: 'absolute', left: -10, top: 34, zIndex: 10,
                  background: '#1C1C1C', border: '1px solid #333333', borderRadius: 12,
                  padding: 10, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  width: 340,
                }}>
                  {EMOJI_PICK.map(em => (
                    <button
                      key={em}
                      type="button"
                      onPointerDown={e => { e.stopPropagation(); insertEmoji(em) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 22, lineHeight: 1, padding: 6, borderRadius: 8,
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span style={{
              position: 'absolute', right: 12, bottom: 10,
              fontSize: 12, color: count >= CHAR_MAX ? '#E85D4C' : '#6B6B6B',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {paddedCount}/{CHAR_MAX}
            </span>
          </div>

          {/* ── Clear status after ── */}
          <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
            Clear status after
          </p>
          <div ref={dropdownRef} style={{ position: 'relative', marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setDurationOpen(o => !o)}
              aria-expanded={durationOpen}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                border: '1px solid #3D3D3D', background: '#141414',
                color: '#FFFFFF', fontSize: 14, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span>{durLabel}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M4 6l4 4 4-4" stroke="#9A9A9A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {durationOpen && (
              <div style={{
                position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 6, zIndex: 10,
                background: '#1C1C1C', border: '1px solid #3A3A3A', borderRadius: 14,
                padding: 6, boxShadow: '0 14px 48px rgba(0,0,0,0.55)',
                maxHeight: 280, overflowY: 'auto',
              }}>
                {DURATIONS.map(d => {
                  const sel = clearAfter === d.key
                  const hot = hoveredDuration === d.key
                  const bg = sel ? '#2B6CB0' : (hot ? 'rgba(255,255,255,0.08)' : 'transparent')
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onPointerDown={e => { e.stopPropagation(); setClearAfter(d.key); setDurationOpen(false) }}
                      onMouseEnter={() => setHoveredDuration(d.key)}
                      onMouseLeave={() => setHoveredDuration(null)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', border: 'none', borderRadius: 10, cursor: 'pointer',
                        background: bg,
                        color: '#FFFFFF', fontSize: 14, textAlign: 'left', fontFamily: 'inherit',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <span>{d.label}</span>
                      {sel && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {clearAfter === 'custom' && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9A9A9A', marginBottom: 6 }}>
                Clear at (local)
              </label>
              <input
                type="datetime-local"
                value={customUntil}
                onChange={e => setCustomUntil(e.target.value)}
                className="set-status-datetime"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  borderRadius: 10, border: '1px solid #3D3D3D', backgroundColor: '#141414',
                  color: '#FFFFFF', fontSize: 14, fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {/* ── Choose a status ── */}
          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
            Choose a status
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
            {PRESETS.map((line, i) => (
              <button
                key={line}
                type="button"
                onClick={() => onPickPreset(line)}
                onMouseEnter={() => setHoveredPreset(i)}
                onMouseLeave={() => setHoveredPreset(null)}
                style={{
                  background: hoveredPreset === i ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  padding: '11px 10px', borderRadius: 10, textAlign: 'left',
                  color: hoveredPreset === i ? '#FFFFFF' : '#D4D4D4',
                  fontSize: 14, fontFamily: 'inherit',
                  transition: 'background 0.1s ease, color 0.1s ease',
                }}
              >
                {line}
              </button>
            ))}
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={() => onClose()}
              style={{
                padding: '8px 20px', borderRadius: 9999,
                border: 'none', background: '#2A2A2A',
                color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              style={{
                padding: '8px 20px', borderRadius: 9999,
                border: 'none', background: '#1D8160',
                color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
