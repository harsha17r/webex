import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { useProfile } from '../../context/ProfileContext'

/* ─────────────────────────────────────────────────────────
 * SetupProfileModal
 *
 * Fixed overlay. Left panel = live preview. Right = edit form.
 * All edits are drafted locally — nothing is saved until
 * "Update changes" is clicked.
 *
 * Props:
 *   onClose  — called on Cancel or backdrop click
 *   onSave   — called after profile is saved (mark task done)
 * ───────────────────────────────────────────────────────── */

const SWATCHES = [
  '#494949',
  '#1D8160',
  '#1170CF',
  '#950F22',
  '#9F6402',
  '#C54600',
  '#944DE7',
]

/* Crop constants — viewport is the visible drag area, circle is the output crop */
const VIEWPORT = 280
const CIRCLE   = 240

export function SetupProfileModal({ onClose, onSave, onOpenAppearances }) {
  const { profile, updateProfile } = useProfile()

  const [draftName,   setDraftName]   = useState(profile.name)
  const [draftPhoto,  setDraftPhoto]  = useState(profile.photoUrl)
  const [draftColor,  setDraftColor]  = useState(profile.bannerColor)
  const [customColor, setCustomColor] = useState(
    SWATCHES.includes(profile.bannerColor) ? '#FF6B6B' : profile.bannerColor
  )

  /* ── Crop state ── */
  const [cropMode,   setCropMode]   = useState(false)
  const [rawImage,   setRawImage]   = useState(null)
  const [cropScale,  setCropScale]  = useState(1)
  const [minScale,   setMinScale]   = useState(0.1)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [dragging,   setDragging]   = useState(false)
  const [dragStart,  setDragStart]  = useState({ x: 0, y: 0, ox: 0, oy: 0 })

  const fileRef        = useRef(null)
  const colorPickerRef = useRef(null)
  const cropImgRef     = useRef(null)
  const cropCanvasRef  = useRef(null)

  const initial       = draftName.trim() ? draftName.trim()[0].toUpperCase() : '?'
  const isCustomColor = !SWATCHES.includes(draftColor)

  /* ── Handlers ── */

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // Use a blob URL — no base64 encoding, no size limits, works for large photos
    if (rawImage) URL.revokeObjectURL(rawImage)
    setRawImage(URL.createObjectURL(file))
    setCropOffset({ x: 0, y: 0 })
    setCropMode(true)
    e.target.value = ''
  }

  function handleCropImageLoad(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    const s = CIRCLE / Math.min(w, h)
    setMinScale(s)
    setCropScale(s)
  }

  // img.decode() reliably resolves after full decode — covers cases where
  // onLoad fires before React attaches the handler (e.g. blob URLs already cached).
  useEffect(() => {
    if (!rawImage) return
    const img = cropImgRef.current
    if (!img) return
    img.decode()
      .then(() => {
        const s = CIRCLE / Math.min(img.naturalWidth, img.naturalHeight)
        setMinScale(s)
        setCropScale(s)
      })
      .catch(() => {
        if (img.naturalWidth > 0) {
          const s = CIRCLE / Math.min(img.naturalWidth, img.naturalHeight)
          setMinScale(s)
          setCropScale(s)
        }
      })
  }, [rawImage])

  function applyCrop() {
    const img    = cropImgRef.current
    const canvas = cropCanvasRef.current
    if (!img || !canvas) return

    canvas.width  = CIRCLE
    canvas.height = CIRCLE
    const ctx = canvas.getContext('2d')

    // Circular clip
    ctx.beginPath()
    ctx.arc(CIRCLE / 2, CIRCLE / 2, CIRCLE / 2, 0, Math.PI * 2)
    ctx.clip()

    // The image is centered in the viewport via CSS transform.
    // cropOffset shifts the image center relative to the viewport/circle center.
    // In source image pixels, the circle covers a CIRCLE/cropScale square
    // centred at (naturalWidth/2 - offsetX/scale, naturalHeight/2 - offsetY/scale).
    const w    = img.naturalWidth
    const h    = img.naturalHeight
    const srcW = CIRCLE / cropScale
    const srcH = CIRCLE / cropScale
    const srcX = w / 2 - cropOffset.x / cropScale - srcW / 2
    const srcY = h / 2 - cropOffset.y / cropScale - srcH / 2

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, CIRCLE, CIRCLE)

    setDraftPhoto(canvas.toDataURL('image/jpeg', 0.92))
    URL.revokeObjectURL(rawImage)
    setCropMode(false)
    setRawImage(null)
  }

  function cancelCrop() {
    URL.revokeObjectURL(rawImage)
    setCropMode(false)
    setRawImage(null)
  }

  function handleSave() {
    updateProfile({ name: draftName.trim() || profile.name, photoUrl: draftPhoto, bannerColor: draftColor })
    onSave?.()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          width: 826, height: 640,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0px 12px 120px 0px rgba(0,0,0,0.6)',
        }}
      >

        {/* ── LEFT PANEL — Live preview ── */}
        <div style={{ width: 300, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          {/* Banner strip */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 136,
            background: draftColor,
            borderRadius: '12px 0 0 0',
            transition: 'background 0.2s',
          }} />

          {/* Dark lower area */}
          <div style={{
            position: 'absolute', top: 136, left: 0, right: 0, bottom: 0,
            background: '#222222',
            borderLeft: '1px solid #494949',
            borderBottom: '1px solid #494949',
            borderRadius: '0 0 0 12px',
          }} />

          {/* Content — avatar + name + email */}
          <div style={{
            position: 'absolute', left: 30, top: 83,
            width: 240,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {/* Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: draftPhoto ? 'transparent' : '#595959',
              border: '4px solid #222222',
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {draftPhoto
                ? <img src={draftPhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <span style={{ fontSize: 40, fontWeight: 500, color: '#FFFFFF', lineHeight: 1 }}>{initial}</span>
              }
            </div>

            {/* Name */}
            <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px' }}>
              {draftName.trim() || 'Your name'}
            </span>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 400, color: '#AAAAAA', lineHeight: '14px' }}>Email</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF', lineHeight: '20px' }}>{profile.email || '—'}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Edit form / Crop ── */}
        <div style={{
          flex: 1,
          background: '#111111',
          border: '1px solid #494949',
          borderRadius: '0 12px 12px 0',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>

          {/* Header */}
          <div style={{ padding: '20px 20px 12px', flexShrink: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px', lineHeight: '28px' }}>
              {cropMode ? 'Crop photo' : 'Edit profile'}
            </p>
            <p style={{ fontSize: 12, fontWeight: 400, color: '#AAAAAA', margin: 0, lineHeight: '20px' }}>
              {cropMode ? 'Drag to reposition · use the slider to zoom' : 'Changes preview live on the left'}
            </p>
          </div>

          {/* ── CROP UI ── */}
          {cropMode ? (
            <div style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 20, padding: '12px 20px',
            }}>

              {/* Viewport */}
              <div
                style={{
                  width: VIEWPORT, height: VIEWPORT,
                  position: 'relative', overflow: 'hidden',
                  background: '#0D0D0D',
                  borderRadius: 12,
                  cursor: dragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  border: '1px solid #2A2A2A',
                }}
                onMouseDown={e => {
                  setDragging(true)
                  setDragStart({ x: e.clientX, y: e.clientY, ox: cropOffset.x, oy: cropOffset.y })
                }}
                onMouseMove={e => {
                  if (!dragging) return
                  setCropOffset({
                    x: dragStart.ox + (e.clientX - dragStart.x),
                    y: dragStart.oy + (e.clientY - dragStart.y),
                  })
                }}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
              >
                {/* The image — always visible at natural size, positioned via transform */}
                {rawImage && (
                  <img
                    ref={cropImgRef}
                    src={rawImage}
                    onLoad={handleCropImageLoad}
                    draggable={false}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropScale})`,
                      transformOrigin: 'center center',
                      maxWidth: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {/* Dark overlay outside the circle */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(circle ${CIRCLE / 2}px at center, transparent ${CIRCLE / 2}px, rgba(0,0,0,0.68) ${CIRCLE / 2}px)`,
                  pointerEvents: 'none',
                }} />

                {/* Circle border indicator */}
                <div style={{
                  position: 'absolute',
                  left: (VIEWPORT - CIRCLE) / 2,
                  top:  (VIEWPORT - CIRCLE) / 2,
                  width: CIRCLE, height: CIRCLE,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  boxSizing: 'border-box',
                  pointerEvents: 'none',
                }} />
              </div>

              {/* Zoom slider */}
              <div style={{
                width: VIEWPORT,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {/* Minus */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="4.5" stroke="#666" strokeWidth="1.3"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M5 7h4" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="range"
                  min={minScale}
                  max={minScale * 4}
                  step={minScale * 0.01}
                  value={cropScale}
                  onChange={e => setCropScale(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#2BAB7E', cursor: 'pointer' }}
                />
                {/* Plus */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="4.5" stroke="#666" strokeWidth="1.3"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M5 7h4M7 5v4" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Hidden canvas for rendering the crop output */}
              <canvas ref={cropCanvasRef} style={{ display: 'none' }} />

            </div>

          ) : (

            /* ── NORMAL FORM ── */
            <div style={{
              flex: 1,
              padding: '28px 20px',
              display: 'flex', flexDirection: 'column', gap: 32,
              overflowY: 'auto',
            }}>

              {/* Profile picture */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Profile picture</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Small preview */}
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: draftPhoto ? 'transparent' : '#595959',
                    border: '2px solid #222222',
                    overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {draftPhoto
                      ? <img src={draftPhoto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                      : <span style={{ fontSize: 23, fontWeight: 500, color: '#FFFFFF' }}>{initial}</span>
                    }
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px',
                        background: 'transparent',
                        border: '1px solid #494949',
                        borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 13V4M10 4L7 7M10 4L13 7" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: 12, fontWeight: 400, color: '#D4D4D4' }}>Upload photo</span>
                    </button>
                    {draftPhoto && (
                      <button
                        onClick={() => setDraftPhoto(null)}
                        style={{
                          background: 'transparent', border: 'none',
                          fontSize: 12, color: '#AAAAAA', cursor: 'pointer',
                          textAlign: 'left', padding: '0 2px',
                          fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Display name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Display name</span>
                <input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: '100%', padding: 12,
                    background: 'transparent',
                    border: '1px solid #494949',
                    borderRadius: 8,
                    fontSize: 16, fontWeight: 400, color: '#FFFFFF',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    caretColor: '#FFFFFF',
                  }}
                />
              </div>

              {/* Banner color */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>Banner color</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {SWATCHES.map(color => (
                    <button
                      key={color}
                      onClick={() => setDraftColor(color)}
                      style={{
                        width: 40, height: 40, borderRadius: 4,
                        background: color, padding: 0, cursor: 'pointer',
                        border: `2px solid ${draftColor === color ? '#FFFFFF' : 'transparent'}`,
                        outline: draftColor === color ? '2px solid rgba(255,255,255,0.15)' : 'none',
                        transition: 'border-color 0.12s, outline 0.12s',
                      }}
                    />
                  ))}

                  {/* Custom color picker swatch */}
                  <div style={{ position: 'relative', width: 40, height: 40 }}>
                    <div
                      onClick={() => colorPickerRef.current?.click()}
                      style={{
                        width: 40, height: 40, borderRadius: 4,
                        background: isCustomColor
                          ? draftColor
                          : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                        border: `2px solid ${isCustomColor ? '#FFFFFF' : 'transparent'}`,
                        outline: isCustomColor ? '2px solid rgba(255,255,255,0.15)' : 'none',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.12s',
                      }}
                    >
                      {isCustomColor ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ pointerEvents: 'none' }}>
                          <path d="M9.5 1.5L12.5 4.5L4.5 12.5H1.5V9.5L9.5 1.5Z" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <span style={{ fontSize: 18, color: '#FFFFFF', userSelect: 'none', lineHeight: 1 }}>+</span>
                      )}
                    </div>
                    <input
                      ref={colorPickerRef}
                      type="color"
                      value={customColor}
                      onChange={e => {
                        setCustomColor(e.target.value)
                        setDraftColor(e.target.value)
                      }}
                      style={{
                        position: 'absolute', inset: 0,
                        opacity: 0, cursor: 'pointer',
                        width: '100%', height: '100%',
                        padding: 0, border: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Action buttons */}
          <div style={{
            padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            flexShrink: 0,
          }}>
            {cropMode ? (
              <>
                <button
                  onClick={cancelCrop}
                  style={{
                    padding: '10px 20px',
                    background: '#494949', border: 'none', borderRadius: 9999,
                    fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                    cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5A5A5A'}
                  onMouseLeave={e => e.currentTarget.style.background = '#494949'}
                >
                  Cancel
                </button>
                <button
                  onClick={applyCrop}
                  style={{
                    padding: '10px 20px',
                    background: '#1D8160', border: 'none', borderRadius: 9999,
                    fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                    cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#166649'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1D8160'}
                >
                  Apply crop
                </button>
              </>
            ) : (
              <>
                {/* Left: appearance shortcut */}
                <button
                  onClick={e => { e.stopPropagation(); onOpenAppearances?.() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'transparent', border: 'none',
                    fontSize: 12, fontWeight: 500, color: '#888888',
                    cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                    padding: '6px 2px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#CCCCCC'}
                  onMouseLeave={e => e.currentTarget.style.color = '#888888'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7" cy="7" r="2" fill="currentColor"/>
                    <path d="M7 1.5V2.5M7 11.5V12.5M1.5 7H2.5M11.5 7H12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Adjust appearance
                </button>

                {/* Right: cancel + save */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '10px 20px',
                      background: '#494949', border: 'none', borderRadius: 9999,
                      fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                      cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#5A5A5A'}
                    onMouseLeave={e => e.currentTarget.style.background = '#494949'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '10px 20px',
                      background: '#1D8160', border: 'none', borderRadius: 9999,
                      fontSize: 14, fontWeight: 500, color: '#FFFFFF',
                      cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#166649'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1D8160'}
                  >
                    Update changes
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}
