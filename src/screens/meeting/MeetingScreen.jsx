import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useProfile } from '../../context/ProfileContext'
import { CiscoAIRail } from '../../components/layout/CiscoAIRail'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — MeetingScreen
 *
 * ENTER (first load — staggered, deliberate):
 *    0ms   screen fades in (200ms)
 *  300ms   top bar slides down  y:-12 → 0   (spring 300/28)
 *  500ms   video tiles scale    0.96 → 1    (spring 300/28)
 *  700ms   toolbar slides up    y:12 → 0    (spring 300/28)
 * 4000ms   AI nudge drops down  y:-8 → 0   (spring 300/28, anchored top-right)
 * 19000ms  AI nudge auto-dismisses (15s after appearing)
 *
 * HIDE (15s idle — graceful, UI steps aside):
 *    0ms   toolbar eases down   y:0 → 72  + fade   (spring 220/26)
 *   40ms   top bar eases up     y:0 → -64 + fade   (spring 220/26, 40ms lag)
 *
 * SHOW (mouse move — zero hesitation, instant response):
 *    0ms   top bar snaps in     y:-64 → 0 + fade   (spring 500/38)
 *   25ms   toolbar snaps in     y:72 → 0  + fade   (spring 500/38, 25ms lag)
 *
 * EXIT (End call):
 *    0ms   screen fades to black (300ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = { topBar: 0.3, tiles: 0.5, toolbar: 0.7, nudge: 2000, nudgeDuration: 20000 }
const SPRING  = { type: 'spring', stiffness: 300, damping: 28 }

/* HIDE — soft spring, toolbar leads by 40ms */
const HIDE = {
  topBarY:      -64,   // px — just enough to clear the 60px bar
  toolbarY:      72,   // px — clears the bottom bar
  topBarDelay:  0.04,  // s  — top bar lags slightly behind toolbar
  toolbarDelay:    0,  // s  — toolbar exits first
  spring: { type: 'spring', stiffness: 220, damping: 26 },
}

/* SHOW — snappy spring, top bar leads by 25ms */
const SHOW = {
  topBarDelay:     0,  // s  — top bar leads
  toolbarDelay: 0.025, // s  — toolbar follows 25ms later
  spring: { type: 'spring', stiffness: 500, damping: 38 },
}

export function MeetingScreen() {
  const location    = useLocation()
  const navigate    = useNavigate()
  const { profile } = useProfile()
  const videoRef    = useRef(null)
  const streamRef   = useRef(null)

  const { micOn: initMic = true, cameraOn: initCamera = true } = location.state || {}

  const [micOn,      setMicOn]      = useState(initMic)
  const [cameraOn,   setCameraOn]   = useState(initCamera)
  const [permDenied, setPermDenied] = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [nudge,        setNudge]        = useState(false)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [uiVisible,    setUiVisible]    = useState(true)
  const [entered,      setEntered]      = useState(false)  // true after entrance settles
  const [aiRailOpen,   setAiRailOpen]   = useState(false)
  const [toasts,       setToasts]       = useState([])
  const audioCtxRef    = useRef(null)
  const toastIdRef     = useRef(0)
  const toastTimersRef = useRef({})
  const hideTimerRef = useRef(null)
  const analyserRef  = useRef(null)
  const rafRef       = useRef(null)

  const initial = profile.name?.charAt(0).toUpperCase() || 'U'

  /* ── Camera + mic stream with volume detection ── */
  useEffect(() => {
    async function startStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        stream.getAudioTracks().forEach(t => { t.enabled = initMic })
        stream.getVideoTracks().forEach(t => { t.enabled = initCamera })
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream

        // Connect analyser directly to the main stream's audio (always live)
        try {
          const ctx = new AudioContext()
          await ctx.resume()
          const source   = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 256
          analyser.smoothingTimeConstant = 0.3
          source.connect(analyser)
          audioCtxRef.current = ctx
          analyserRef.current = { analyser }

          const data = new Uint8Array(analyser.frequencyBinCount)
          let prev = false
          function tick() {
            analyser.getByteFrequencyData(data)
            const avg = data.reduce((a, b) => a + b, 0) / data.length
            const speaking = avg > 12
            if (speaking !== prev) { prev = speaking; setUserSpeaking(speaking) }
            rafRef.current = requestAnimationFrame(tick)
          }
          tick()
        } catch { /* VAD unavailable — silent fail */ }
      } catch {
        setPermDenied(true)
      }
    }
    startStream()
    return () => {
      cancelAnimationFrame(rafRef.current)
      audioCtxRef.current?.close()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, []) // eslint-disable-line

  /* ── Timer ── */
  useEffect(() => {
    const id = setInterval(() => setElapsed(v => v + 1), 1000)
    return () => clearInterval(id)
  }, [])

  /* ── Mark entrance as done after all entrance animations settle (~1.2s) ── */
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 1200)
    return () => clearTimeout(id)
  }, [])

  /* ── Auto-hide UI after 15s of inactivity ── */
  useEffect(() => {
    hideTimerRef.current = setTimeout(() => setUiVisible(false), 15000)
    return () => clearTimeout(hideTimerRef.current)
  }, [])

  function resetHideTimer() {
    setUiVisible(true)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setUiVisible(false), 15000)
  }

  /* ── Resume AudioContext on first user gesture (Chrome requires this) ── */
  useEffect(() => {
    function resumeCtx() {
      audioCtxRef.current?.resume()
      document.removeEventListener('click', resumeCtx)
    }
    document.addEventListener('click', resumeCtx)
    return () => document.removeEventListener('click', resumeCtx)
  }, [])

  /* ── AI nudge: appears at 1.8s, auto-dismisses 10s later ── */
  useEffect(() => {
    const showId = setTimeout(() => setNudge(true),  TIMING.nudge)
    const hideId = setTimeout(() => setNudge(false), TIMING.nudge + TIMING.nudgeDuration)
    return () => { clearTimeout(showId); clearTimeout(hideId) }
  }, [])

  function fmt(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m} : ${sec}`
  }

  function toggleMic() {
    const next = !micOn
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = next })
    setMicOn(next)
  }
  function toggleCamera() {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setCameraOn(v => !v)
  }
  function handleEnd() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    navigate('/home', { state: { fromMeeting: true, elapsed } })
  }

  function addToast(message) {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message }])
    toastTimersRef.current[id] = setTimeout(() => removeToast(id), 5000)
  }
  function removeToast(id) {
    clearTimeout(toastTimersRef.current[id])
    delete toastTimersRef.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }
  function toggleAIRail() {
    const next = !aiRailOpen
    setAiRailOpen(next)
    if (next) {
      addToast('This meeting is being transcribed. All participants have been notified.')
      setTimeout(() => addToast('Cisco AI is generating real-time notes and action items.'), 700)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseMove={resetHideTimer}
      style={{
        width: '100vw', height: '100vh',
        background: '#111111',
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        cursor: uiVisible ? 'default' : 'none',
      }}
    >

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: uiVisible ? 1 : 0, y: uiVisible ? 0 : HIDE.topBarY }}
        transition={
          !entered                                          // entrance (first load)
            ? { ...SPRING, delay: TIMING.topBar }
            : uiVisible                                    // show after hide
              ? { ...SHOW.spring, delay: SHOW.topBarDelay }
              : { ...HIDE.spring, delay: HIDE.topBarDelay } // hide
        }
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', zIndex: 20,
          pointerEvents: uiVisible ? 'auto' : 'none',
          // center child is absolute — left/right flex items never affect it
        }}
      >
        {/* Left: meeting info + timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C6.13 2 3 5.13 3 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke="#FFFFFF" strokeWidth="1.5"/>
              <path d="M10 9v4M10 7v.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>Meeting info</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#FFFFFF' }}>{fmt(elapsed)}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 6.5C5.5 3 14.5 3 18 6.5"             stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4.5 9C7 6.5 13 6.5 15.5 9"             stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7.5 11.5C8.8 10.2 11.2 10.2 12.5 11.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="14.5" r="1.5" fill="#FFFFFF"/>
            </svg>
          </div>
        </div>

        {/* Center: absolutely positioned so timer changes never shift it */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 24,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 14, fontWeight: 400, color: '#FFFFFF' }}>
            {profile.name} - Test call
          </span>
          <span style={{ fontSize: 12, fontWeight: 400, color: '#AAAAAA' }}>
            Moderated unmuted mode
          </span>
        </div>

        {/* Right: Layout + Cisco AI buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <PillButton label="Layout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.5"/>
              <rect x="11" y="2" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.5"/>
              <rect x="2" y="11" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.5"/>
              <rect x="11" y="11" width="7" height="7" rx="1" stroke="#FFFFFF" strokeWidth="1.5"/>
            </svg>
          </PillButton>
          <PillButton label="Cisco AI" onClick={toggleAIRail} active={aiRailOpen}>
            <CiscoAIIcon size={20} />
          </PillButton>
        </div>
      </motion.div>

      {/* ── Video tiles ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: TIMING.tiles }}
        style={{
          position: 'absolute',
          top: 68, left: 20,
          right: aiRailOpen ? 383 : 20,   // 371 rail + 12 gap
          bottom: 104,
          display: 'flex', gap: 12,
          transition: 'right 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        {/* User tile — green border when speaking */}
        <div style={{
          flex: 1, position: 'relative',
          borderRadius: 16, overflow: 'hidden',
          background: 'radial-gradient(circle at 50% 50%, #FEC432 0%, #A64B20 100%)',
          boxShadow: userSpeaking && micOn ? '0 0 0 3px #2BAB7E' : '0 0 0 3px transparent',
          transition: 'box-shadow 0.15s ease',
        }}>
          <video
            ref={videoRef}
            autoPlay muted playsInline
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              opacity: cameraOn && !permDenied ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          />
          {/* Avatar overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: cameraOn && !permDenied ? 0 : 1,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 160, height: 160, borderRadius: '50%',
              background: '#845201',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 80, fontWeight: 500, color: '#FFFFFF', userSelect: 'none',
            }}>
              {initial}
            </div>
          </div>
          {/* Name pill */}
          <NamePill label={`You (${profile.name})`} micOn={micOn} />
        </div>

        {/* Cisco AI tile — no border */}
        <div style={{ flex: 1, position: 'relative', borderRadius: 16, display: 'flex' }}>
          <div style={{
            flex: 1,
            borderRadius: 16,
            background: '#222222',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CiscoAIIcon size={160} />
            <NamePill label="Cisco AI" micOn={true} />
          </div>
        </div>
      </motion.div>

      {/* ── Bottom bar — single unified row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: uiVisible ? 1 : 0, y: uiVisible ? 0 : HIDE.toolbarY }}
        transition={
          !entered                                              // entrance (first load)
            ? { ...SPRING, delay: TIMING.toolbar }
            : uiVisible                                        // show after hide
              ? { ...SHOW.spring, delay: SHOW.toolbarDelay }
              : { ...HIDE.spring, delay: HIDE.toolbarDelay }   // hide
        }
        style={{
          position: 'absolute', bottom: 16, left: 20, right: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 20,
          pointerEvents: uiVisible ? 'auto' : 'none',
        }}
      >
        {/* Closed Captions pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#222222', borderRadius: 9999,
          padding: '10px 16px', cursor: 'pointer',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="#888888" d="M5 20q-.825 0-1.412-.587T3 18V6q0-.825.588-1.412T5 4h14q.825 0 1.413.588T21 6v12q0 .825-.587 1.413T19 20zm0-2h14V6H5zm2-3h3q.425 0 .713-.288T11 14v-.5q0-.225-.15-.375t-.375-.15h-.45q-.225 0-.375.15t-.15.375h-2v-3h2q0 .225.15.375t.375.15h.45q.225 0 .375-.15T11 10.5V10q0-.425-.288-.712T10 9H7q-.425 0-.712.288T6 10v4q0 .425.288.713T7 15m10-6h-3q-.425 0-.712.288T13 10v4q0 .425.288.713T14 15h3q.425 0 .713-.288T18 14v-.5q0-.225-.15-.375t-.375-.15h-.45q-.225 0-.375.15t-.15.375h-2v-3h2q0 .225.15.375t.375.15h.45q.225 0 .375-.15T18 10.5V10q0-.425-.288-.712T17 9M5 18V6z"/>
          </svg>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5l3 3 3-3" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Main controls — absolutely centred so unequal side widths don't shift it */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <ToolbarBtn label="Mic" hasChevron onClick={toggleMic}>
            <MicIcon on={micOn} size={20} />
          </ToolbarBtn>
          <ToolbarBtn label="Video" hasChevron onClick={toggleCamera}>
            <CamIcon on={cameraOn} size={24} />
          </ToolbarBtn>
          <ToolbarBtn label="Share">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill="#FFFFFF" d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16zm-5 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/>
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Raise">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path fill="#FFFFFF" d="M3 16c0 4.42 3.58 8 8 8c3.43 0 6.5-2.09 7.77-5.27l2.56-6.43c.25-.64.23-1.38-.15-1.95A2 2 0 0 0 19 9.5l-.78.23c-.46.12-.88.35-1.22.66V4.5A2.5 2.5 0 0 0 14.5 2c-.19 0-.37 0-.54.06A2.5 2.5 0 0 0 11.5 0c-1.06 0-1.96.66-2.33 1.59A2.5 2.5 0 0 0 6 4v.55c-.16-.05-.33-.05-.5-.05A2.5 2.5 0 0 0 3 7zm2-9c0-.28.22-.5.5-.5s.5.22.5.5v5h2V4c0-.28.22-.5.5-.5s.5.22.5.5v8h2V2.5c0-.28.22-.5.5-.5s.5.22.5.5V12h2V4.5c0-.28.22-.5.5-.5s.5.22.5.5V15h2l1-2.5c.15-.45.5-.79 1-.91l.5-.14L16.91 18c-.96 2.41-3.3 4-5.91 4c-3.31 0-6-2.69-6-6z"/>
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="React">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <path fill="#FFFFFF" d="m13.798 2.217l-.015-.004l-.765-.248a1.58 1.58 0 0 1-1-.999L11.77.202a.302.302 0 0 0-.57 0l-.25.764a1.58 1.58 0 0 1-.983.999l-.594.193H9.37l-.172.055a.3.3 0 0 0-.146.111a.3.3 0 0 0 .146.459l.767.249l.083.03l.008.002a1.58 1.58 0 0 1 .88.889l.03.08l.248.765A.3.3 0 0 0 11.5 5h.004a.3.3 0 0 0 .281-.202l.249-.764a1.58 1.58 0 0 1 .999-.999l.765-.248a.303.303 0 0 0 0-.57m1.416 3.355l.612.199l.013.003a.242.242 0 0 1 0 .455l-.613.2a1.26 1.26 0 0 0-.799.798l-.199.612a.24.24 0 0 1-.235.16a.24.24 0 0 1-.224-.16l-.2-.612a1.26 1.26 0 0 0-.8-.8l-.024-.008l-.001-.003l-.583-.19a.242.242 0 0 1 0-.455l.613-.2a1.26 1.26 0 0 0 .787-.798l.199-.612a.242.242 0 0 1 .456 0l.199.612a1.26 1.26 0 0 0 .799.799M8.059 2.893a1 1 0 0 0 .04.108L8 3a5 5 0 1 0 4.98 5.455q.125.185.31.317a1.24 1.24 0 0 0 .628.225A6.002 6.002 0 0 1 2 8a6 6 0 0 1 6.097-6a1.3 1.3 0 0 0-.038.893M6.25 7.75a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5m-.114 1.917a.5.5 0 1 0-.745.667A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 2.609-1.166a.5.5 0 0 0-.745-.667A2.5 2.5 0 0 1 8 10.5c-.74 0-1.405-.321-1.864-.833M10.5 7A.75.75 0 1 1 9 7a.75.75 0 0 1 1.5 0"/>
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="More">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="5"  cy="12" r="1.5" fill="#FFFFFF"/>
              <circle cx="12" cy="12" r="1.5" fill="#FFFFFF"/>
              <circle cx="19" cy="12" r="1.5" fill="#FFFFFF"/>
            </svg>
          </ToolbarBtn>
          <EndBtn onClick={handleEnd} />
        </div>

        {/* Participants + Chat — solid #111111 per Figma */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToolbarBtn label="Participants" solid>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" stroke="#FFFFFF" strokeWidth="1.5"/>
              <path d="M2 21v-1a7 7 0 0 1 14 0v1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75M22 21v-1a7 7 0 0 0-5.27-6.77" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Chat" solid>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </ToolbarBtn>
        </div>
      </motion.div>

      {/* ── Toast notifications — drop from top, stack below top bar ── */}
      <div style={{
        position: 'absolute', top: 76,
        right: aiRailOpen ? 391 : 20,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 28,
        transition: 'right 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)',
        pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastNotification
              key={toast.id}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── AI nudge panel ── */}
      <AnimatePresence>
        {nudge && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING}
            style={{
              position: 'absolute', top: 65,
              right: aiRailOpen ? 391 : 20, width: 380,
              transition: 'right 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)',
              background: '#111111',
              border: '1px solid #595959',
              borderRadius: 8,
              padding: '24px 24px 20px',
              display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: '0px 16px 40px 0px rgba(0,0,0,0.24)',
              zIndex: 30,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px' }}>
                See AI Assistant in action
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#D4D4D4', lineHeight: '20px' }}>
                You'll get a summary, transcript, and action items when the meeting ends.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
              <NudgeBtn variant="cancel" onClick={() => setNudge(false)}>Skip</NudgeBtn>
              <NudgeBtn variant="confirm" onClick={() => setNudge(false)}>Turn on</NudgeBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cisco AI Rail — slides in from right ── */}
      <AnimatePresence>
        {aiRailOpen && (
          <motion.div
            key="meeting-ai-rail"
            initial={{ x: 371, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 371, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'absolute', top: 0, right: 0, bottom: 0,
              width: 371, zIndex: 15, overflow: 'hidden',
            }}
          >
            <CiscoAIRail onClose={() => setAiRailOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */

function PillButton({ label, children, onClick, active = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: active ? '#1D4A7A' : hovered ? '#2A2A2A' : '#222222',
        border: active ? '1px solid #2E96E8' : '1px solid transparent',
        borderRadius: 9999, height: 40, padding: '0 16px',
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {children}
      <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>{label}</span>
    </button>
  )
}

function NamePill({ label, micOn }) {
  return (
    <div style={{
      position: 'absolute', bottom: 12, left: 12,
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(34,34,34,0.85)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 9999,
      padding: '10px 16px',
    }}>
      <MicIcon on={micOn} size={20} solidRed />
      <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF' }}>{label}</span>
    </div>
  )
}

function ToolbarBtn({ label, children, onClick, hasChevron = false, solid = false }) {
  const [hovered, setHovered] = useState(false)
  const bg = solid
    ? (hovered ? '#1A1A1A' : '#111111')
    : (hovered ? 'rgba(50,50,50,0.7)' : 'rgba(34,34,34,0.5)')
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: hasChevron ? 6 : undefined,
        background: bg,
        backdropFilter: solid ? 'none' : 'blur(24px)',
        borderRadius: 4, border: 'none',
        padding: '10px 0',
        cursor: 'pointer', transition: 'background 0.15s',
        width: 80,
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {children}
        <span style={{ fontSize: 11, fontWeight: 400, color: '#AAAAAA', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      {hasChevron && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

function EndBtn({ onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        background: hovered ? '#B01020' : '#950F22',
        backdropFilter: 'blur(24px)',
        borderRadius: 4, border: 'none',
        padding: '10px 0',
        width: 80, boxSizing: 'border-box',
        cursor: 'pointer', transition: 'background 0.15s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path fill="#F0F0F0" d="m3.4 16.4l-2.3-2.25q-.3-.3-.3-.7t.3-.7q2.2-2.375 5.075-3.562T12 8t5.813 1.188T22.9 12.75q.3.3.3.7t-.3.7l-2.3 2.25q-.275.275-.638.3t-.662-.2l-2.9-2.2q-.2-.15-.3-.35t-.1-.45v-2.85q-.95-.3-1.95-.475T12 10t-2.05.175T8 10.65v2.85q0 .25-.1.45t-.3.35l-2.9 2.2q-.3.225-.663.2t-.637-.3M6 11.45q-.725.375-1.4.863T3.2 13.4l1 1L6 13zm12 .05V13l1.8 1.4l1-.95q-.725-.65-1.4-1.125T18 11.5m0 0"/>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 400, color: '#F0F0F0' }}>End</span>
    </button>
  )
}

function NudgeBtn({ variant, onClick, children }) {
  const [hovered, setHovered] = useState(false)
  const base    = variant === 'confirm' ? '#1D8160' : '#222222'
  const hov     = variant === 'confirm' ? '#2BAB7E' : '#2A2A2A'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hov : base,
        border: 'none', borderRadius: 8,
        padding: variant === 'confirm' ? '12px 24px' : '12px 16px',
        fontSize: 14, fontWeight: 500, color: '#FFFFFF',
        cursor: 'pointer', transition: 'background 0.15s',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {children}
    </button>
  )
}

function ToastNotification({ message, onClose }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 300,
        background: hovered ? '#1A1A1A' : '#111111',
        border: '1px solid #595959',
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        backdropFilter: 'blur(24px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
        pointerEvents: 'auto',
        transition: 'background 0.15s',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Cisco AI icon */}
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        <CiscoAIIcon size={16} />
      </div>
      {/* Message */}
      <span style={{
        flex: 1, fontSize: 13, fontWeight: 400, color: '#FFFFFF',
        lineHeight: '18px',
      }}>
        {message}
      </span>
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0,
          opacity: 0.55, transition: 'opacity 0.15s', marginTop: 1,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.55'}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2L10 10M10 2L2 10" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </motion.div>
  )
}

/* ── Icons ───────────────────────────────────────────────── */

function MicIcon({ on, size = 20, solidRed = false }) {
  if (on) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#FFFFFF" d="M12 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3m0-2a5 5 0 0 1 5 5v4a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5M3.055 11H5.07a7.002 7.002 0 0 0 13.858 0h2.016A9.004 9.004 0 0 1 13 18.945V23h-2v-4.055A9.004 9.004 0 0 1 3.055 11"/>
    </svg>
  )
  // Muted — solidRed: whole off-icon in red (name pill); default: grey icon + red slash (toolbar)
  if (solidRed) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#E03A3A" d="m16.425 17.839l4.767 4.768l1.415-1.415l-19.8-19.799l-1.413 1.415L7 8.414V10a5 5 0 0 0 6.39 4.804l1.55 1.55A7.002 7.002 0 0 1 5.07 11H3.056A9.004 9.004 0 0 0 11 18.945V23h2v-4.055a8.9 8.9 0 0 0 3.425-1.106m-4.872-4.872a3 3 0 0 1-2.52-2.52zm7.822 2.193l-1.443-1.442c.509-.81.856-1.73.997-2.718h2.016a8.95 8.95 0 0 1-1.57 4.16m-2.91-2.909l-1.548-1.548Q15 10.364 15 10V6a3 3 0 0 0-5.818-1.032L7.686 3.471A5 5 0 0 1 17 6v4c0 .81-.192 1.575-.534 2.251"/>
    </svg>
  )
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path fill="#888888" d="M12 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3m0-2a5 5 0 0 1 5 5v4a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5M3.055 11H5.07a7.002 7.002 0 0 0 13.858 0h2.016A9.004 9.004 0 0 1 13 18.945V23h-2v-4.055A9.004 9.004 0 0 1 3.055 11"/>
      </svg>
      <svg style={{ position: 'absolute', top: 0, left: 0 }} width={size} height={size} viewBox="0 0 24 24">
        <line x1="4" y1="4" x2="20" y2="20" stroke="#E03A3A" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function CamIcon({ on, size = 20 }) {
  const col = on ? '#FFFFFF' : '#888888'
  const icon = (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path stroke={col} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14zM3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
  )
  if (on) return icon
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {icon}
      <svg style={{ position: 'absolute', top: 0, left: 0 }} width={size} height={size} viewBox="0 0 24 24">
        <line x1="4" y1="4" x2="20" y2="20" stroke="#E03A3A" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function CiscoAIIcon({ size = 20 }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cisco-ring" x1="20" y1="100" x2="80" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0051AF"/>
          <stop offset="0.67" stopColor="#0087EA"/>
          <stop offset="1" stopColor="#00BCEB"/>
        </linearGradient>
        <linearGradient id="cisco-lens-a" x1="0" y1="0" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0087EA"/>
          <stop offset="0.84" stopColor="#63FFF7"/>
        </linearGradient>
        <linearGradient id="cisco-lens-b" x1="20" y1="100" x2="80" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0051AF"/>
          <stop offset="0.67" stopColor="#0087EA"/>
          <stop offset="1" stopColor="#00BCEB"/>
        </linearGradient>
        <radialGradient id="cisco-top" cx="100%" cy="100%" r="50%">
          <stop offset="60%" stopColor="rgba(0,188,235,0)"/>
          <stop offset="100%" stopColor="#00BCEB"/>
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" stroke="url(#cisco-ring)" strokeWidth="8" fill="none"/>
      {/* Bottom lens */}
      <ellipse cx="64" cy="60" rx="22" ry="27" fill="url(#cisco-lens-a)" opacity="0.9"/>
      {/* Inner lens (gradient green fade) */}
      <ellipse cx="64" cy="42" rx="18" ry="22" fill="url(#cisco-lens-b)" opacity="0.65"/>
      {/* Top lens (radial fade) */}
      <ellipse cx="64" cy="30" rx="22" ry="18" fill="url(#cisco-top)"/>
    </svg>
  )
}
