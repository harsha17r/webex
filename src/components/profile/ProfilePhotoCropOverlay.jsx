import { useState, useRef, useEffect } from 'react'

/* Same crop math as `SetupProfileModal` — circular output, drag + zoom. */
const VIEWPORT = 280
const CIRCLE = 240

/**
 * Full-screen dim overlay with circular crop UI.
 * @param {string} rawImageUrl - object URL from `URL.createObjectURL(file)`
 * @param {(dataUrl: string) => void} onApply - receives JPEG data URL (~0.92 quality)
 * @param {() => void} onCancel - parent should revoke the object URL
 */
export function ProfilePhotoCropOverlay({ rawImageUrl, onApply, onCancel }) {
  const [cropScale, setCropScale] = useState(1)
  const [minScale, setMinScale] = useState(0.1)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 })

  const cropImgRef = useRef(null)
  const cropCanvasRef = useRef(null)

  function handleCropImageLoad(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    const s = CIRCLE / Math.min(w, h)
    setMinScale(s)
    setCropScale(s)
  }

  useEffect(() => {
    if (!rawImageUrl) return
    const img = cropImgRef.current
    if (!img) return
    img.decode?.()
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
  }, [rawImageUrl])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function applyCrop() {
    const img = cropImgRef.current
    const canvas = cropCanvasRef.current
    if (!img || !canvas) return

    canvas.width = CIRCLE
    canvas.height = CIRCLE
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.arc(CIRCLE / 2, CIRCLE / 2, CIRCLE / 2, 0, Math.PI * 2)
    ctx.clip()

    const w = img.naturalWidth
    const h = img.naturalHeight
    const srcW = CIRCLE / cropScale
    const srcH = CIRCLE / cropScale
    const srcX = w / 2 - cropOffset.x / cropScale - srcW / 2
    const srcY = h / 2 - cropOffset.y / cropScale - srcH / 2

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, CIRCLE, CIRCLE)

    onApply(canvas.toDataURL('image/jpeg', 0.92))
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-photo-title"
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111111',
          border: `1px solid ${'#383838'}`,
          borderRadius: 14,
          padding: '22px 22px 18px',
          maxWidth: 'min(100%, 420px)',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 16px 80px rgba(0,0,0,0.55)',
        }}
      >
        <p id="crop-photo-title" style={{ fontSize: 17, fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px' }}>
          Crop photo
        </p>
        <p style={{ fontSize: 12, color: '#AAAAAA', margin: '0 0 18px', lineHeight: 1.45 }}>
          Drag to reposition · use the slider to zoom
        </p>

        <div
          style={{
            width: VIEWPORT, height: VIEWPORT, maxWidth: '100%',
            margin: '0 auto', position: 'relative', overflow: 'hidden',
            background: '#0D0D0D', borderRadius: 12,
            cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            border: '1px solid #2A2A2A',
            boxSizing: 'border-box',
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
          {rawImageUrl && (
            <img
              ref={cropImgRef}
              src={rawImageUrl}
              alt=""
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
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle ${CIRCLE / 2}px at center, transparent ${CIRCLE / 2}px, rgba(0,0,0,0.68) ${CIRCLE / 2}px)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: (VIEWPORT - CIRCLE) / 2,
              top: (VIEWPORT - CIRCLE) / 2,
              width: CIRCLE, height: CIRCLE,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.3)',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div style={{ width: VIEWPORT, maxWidth: '100%', margin: '16px auto 0', display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="4.5" stroke="#666" strokeWidth="1.3"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M5 7h4M7 5v4" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>

        <canvas ref={cropCanvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 18px',
              background: '#383838', border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            style={{
              padding: '10px 18px',
              background: '#1D8160', border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Apply crop
          </button>
        </div>
      </div>
    </div>
  )
}
