import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useProfile } from '../../context/ProfileContext'
import { CiscoAIIcon } from '../../components/layout/CiscoAIRail'
import { MeetingAIRail, SummaryIcon } from '../../components/meeting/MeetingAIRail'
import { AppsRail }          from '../../components/meeting/AppsRail'
import { ParticipantsRail } from '../../components/meeting/ParticipantsRail'
import { ChatRail }          from '../../components/meeting/ChatRail'

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
  const [activeRail, setActiveRail] = useState(null)   // 'ai' | 'apps' | 'participants' | 'chat' | null
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const endBtnRef = useRef(null)
  const aiRailOpen           = activeRail === 'ai'
  const appsRailOpen         = activeRail === 'apps'
  const participantsRailOpen = activeRail === 'participants'
  const chatRailOpen         = activeRail === 'chat'
  const railOpen             = activeRail !== null
  function toggleRail(name) { setActiveRail(r => r === name ? null : name) }
  const [summaryActive,   setSummaryActive]   = useState(false)
  const [meetingInfoOpen, setMeetingInfoOpen] = useState(false)
  const [steppedAway,     setSteppedAway]     = useState(false)
  const prevStateRef = useRef({ micOn: true, cameraOn: true })
  const [toasts,       setToasts]       = useState([])
  const audioCtxRef    = useRef(null)
  const toastIdRef     = useRef(0)
  const toastTimersRef = useRef({})
  const hideTimerRef         = useRef(null)
  const analyserRef          = useRef(null)
  const rafRef               = useRef(null)
  const [tileMenuOpen,  setTileMenuOpen]  = useState(false)
  const tileMenuBtnRef  = useRef(null)
  const tileMenuRef     = useRef(null)
  const [reactOpen,    setReactOpen]    = useState(false)
  const reactBtnRef    = useRef(null)
  const reactMenuRef   = useRef(null)
  const meetingInfoBtnRef    = useRef(null)
  const meetingInfoPanelRef  = useRef(null)
  const meetingInfoTimerRef  = useRef(null)
  const moreBtnRef           = useRef(null)
  const moreMenuRef          = useRef(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const micBtnRef            = useRef(null)
  const audioMenuRef         = useRef(null)
  const [audioMenuOpen, setAudioMenuOpen] = useState(false)
  const videoBtnRef          = useRef(null)
  const videoMenuRef         = useRef(null)
  const [videoMenuOpen, setVideoMenuOpen] = useState(false)
  const [ccOpen, setCcOpen] = useState(false)
  const [ccOn, setCcOn] = useState(false)
  const [manualCaptioning, setManualCaptioning] = useState(false)
  const ccBtnRef   = useRef(null)
  const ccMenuRef  = useRef(null)

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

  /* ── Close leave popover when toolbar auto-hides ── */
  useEffect(() => {
    if (!uiVisible) setLeaveDialogOpen(false)
  }, [uiVisible])

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
    setLeaveDialogOpen(true)
  }
  function confirmLeave() {
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
    toggleRail('ai')
  }

  function toggleSummary() {
    if (!summaryActive) {
      setSummaryActive(true)
      addToast('AI Assistant is now transcribing and taking notes. All participants have been notified.')
    } else {
      setSummaryActive(false)
    }
  }

  /* ── Meeting Info: click-outside to close ── */
  useEffect(() => {
    if (!meetingInfoOpen) return
    function handleClickOutside(e) {
      const insideBtn   = meetingInfoBtnRef.current?.contains(e.target)
      const insidePanel = meetingInfoPanelRef.current?.contains(e.target)
      if (!insideBtn && !insidePanel) setMeetingInfoOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [meetingInfoOpen])

  /* ── Meeting Info: auto-dismiss after 15s idle ── */
  useEffect(() => {
    if (!meetingInfoOpen) return
    function resetTimer() {
      clearTimeout(meetingInfoTimerRef.current)
      meetingInfoTimerRef.current = setTimeout(() => setMeetingInfoOpen(false), 15000)
    }
    resetTimer()
    const panel = meetingInfoPanelRef.current
    panel?.addEventListener('mousemove', resetTimer)
    return () => {
      clearTimeout(meetingInfoTimerRef.current)
      panel?.removeEventListener('mousemove', resetTimer)
    }
  }, [meetingInfoOpen])

  /* ── React panel: click-outside to close ── */
  useEffect(() => {
    if (!reactOpen) return
    function handleClickOutside(e) {
      const insideBtn  = reactBtnRef.current?.contains(e.target)
      const insideMenu = reactMenuRef.current?.contains(e.target)
      if (!insideBtn && !insideMenu) setReactOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [reactOpen])

  /* ── Tile menu: click-outside to close ── */
  useEffect(() => {
    if (!tileMenuOpen) return
    function handleClickOutside(e) {
      const insideBtn  = tileMenuBtnRef.current?.contains(e.target)
      const insideMenu = tileMenuRef.current?.contains(e.target)
      if (!insideBtn && !insideMenu) setTileMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [tileMenuOpen])

  /* ── Step away / back ── */
  function stepAway() {
    prevStateRef.current = { micOn, cameraOn }
    setSteppedAway(true)
    setMicOn(false)
    setCameraOn(false)
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = false })
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = false })
    }
  }
  function backToMeeting() {
    const prev = prevStateRef.current
    setSteppedAway(false)
    setMicOn(prev.micOn)
    setCameraOn(prev.cameraOn)
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = prev.micOn })
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = prev.cameraOn })
    }
  }

  /* ── More menu: close when toolbar hides ── */
  useEffect(() => {
    if (!uiVisible) setMoreOpen(false)
  }, [uiVisible])

  /* ── More menu: click-outside to close ── */
  useEffect(() => {
    if (!moreOpen) return
    function handleClickOutside(e) {
      const insideBtn  = moreBtnRef.current?.contains(e.target)
      const insideMenu = moreMenuRef.current?.contains(e.target)
      if (!insideBtn && !insideMenu) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moreOpen])

  /* ── Audio menu: click-outside to close ── */
  useEffect(() => {
    if (!audioMenuOpen) return
    function handleClickOutside(e) {
      const insideBtn  = micBtnRef.current?.contains(e.target)
      const insideMenu = audioMenuRef.current?.contains(e.target)
      if (!insideBtn && !insideMenu) setAudioMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [audioMenuOpen])

  /* ── Video menu: click-outside to close ── */
  useEffect(() => {
    if (!videoMenuOpen) return
    function handleClickOutside(e) {
      const insideBtn  = videoBtnRef.current?.contains(e.target)
      const insideMenu = videoMenuRef.current?.contains(e.target)
      if (!insideBtn && !insideMenu) setVideoMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [videoMenuOpen])

  /* ── CC menu: click-outside to close ── */
  useEffect(() => {
    if (!ccOpen) return
    function handleClickOutside(e) {
      const insideBtn  = ccBtnRef.current?.contains(e.target)
      const insideMenu = ccMenuRef.current?.contains(e.target)
      if (!insideBtn && !insideMenu) setCcOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ccOpen])

  function turnOnAI() {
    setNudge(false)
    setSummaryActive(true)
    setActiveRail('ai')
    addToast('AI Assistant is now transcribing and taking notes. All participants have been notified.')
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
          <div ref={meetingInfoBtnRef}>
            <MeetingInfoBtn
              open={meetingInfoOpen}
              onClick={() => setMeetingInfoOpen(o => !o)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 400, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums', display: 'inline-block', minWidth: 44 }}>{fmt(elapsed)}</span>
            <NetworkStatusIcon />
            {summaryActive && <AIStatusIcon />}
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
          <PillButton label="AI Assistant" onClick={toggleAIRail} active={aiRailOpen}>
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
          right: railOpen ? 383 : 20,   // 371 rail + 12 gap
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
          boxShadow: !steppedAway && userSpeaking && micOn ? '0 0 0 3px #2BAB7E' : '0 0 0 3px transparent',
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
            opacity: (cameraOn && !permDenied) || steppedAway ? 0 : 1,
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
          {/* Stepped-away overlay */}
          <AnimatePresence>
            {steppedAway && (
              <motion.div
                key="stepped-away-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(10,10,10,0.78)',
                  backdropFilter: 'blur(2px)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 14,
                  padding: 24, boxSizing: 'border-box',
                  borderRadius: 16,
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                  <path d="M17 11.6V15a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3.4a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6"/>
                  <path d="M12 9c0-1 .714-2 2.143-2A2.857 2.857 0 0 0 17 4.143V3.5M8 9v-.5a3 3 0 0 1 3-3 2 2 0 0 0 2-2V3"/>
                  <path d="M16 11h2.5a2.5 2.5 0 0 1 0 5H17"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 500, color: '#E9E9E9', margin: '0 0 4px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    You've stepped away
                  </p>
                  <p style={{ fontSize: 14, color: '#C0C0C0', margin: 0, lineHeight: '18px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    You're muted and your video is off.
                  </p>
                </div>
                <button
                  onClick={backToMeeting}
                  style={{
                    marginTop: 16,
                    background: '#FFFFFF', color: '#111111',
                    border: 'none', borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 14, fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Back to meeting
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom-right action buttons */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            display: 'flex', gap: 8,
            opacity: steppedAway ? 0 : 1,
            pointerEvents: steppedAway ? 'none' : 'auto',
            transition: 'opacity 0.2s',
          }}>
            <TileIconBtn title="Step away from meeting" onClick={stepAway}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path fill="none" d="M17 11.6V15a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3.4a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6"/>
                <path fill="none" d="M12 9c0-1 .714-2 2.143-2A2.857 2.857 0 0 0 17 4.143V3.5M8 9v-.5a3 3 0 0 1 3-3 2 2 0 0 0 2-2V3"/>
                <path fill="none" d="M16 11h2.5a2.5 2.5 0 0 1 0 5H17"/>
              </svg>
            </TileIconBtn>
            <div ref={tileMenuBtnRef}>
              <TileIconBtn title="More options" onClick={() => setTileMenuOpen(o => !o)} active={tileMenuOpen}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="5"  cy="12" r="1.5" fill="#FFFFFF"/>
                  <circle cx="12" cy="12" r="1.5" fill="#FFFFFF"/>
                  <circle cx="19" cy="12" r="1.5" fill="#FFFFFF"/>
                </svg>
              </TileIconBtn>
            </div>
          </div>

          {/* Tile more-options menu */}
          <AnimatePresence>
            {tileMenuOpen && (
              <TileMenu
                menuRef={tileMenuRef}
                btnRef={tileMenuBtnRef}
                onClose={() => setTileMenuOpen(false)}
              />
            )}
          </AnimatePresence>

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
        {/* Closed Captions split button */}
        <div style={{ position: 'relative' }}>
          <CcSplitBtn
            ccBtnRef={ccBtnRef}
            ccOn={ccOn}
            ccMenuOpen={ccOpen}
            onToggleCc={() => setCcOn(o => !o)}
            onOpenMenu={() => setCcOpen(o => !o)}
          />

          {/* CC dropdown */}
          <AnimatePresence>
            {ccOpen && (
              <motion.div
                ref={ccMenuRef}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
                  width: 300, zIndex: 40,
                }}
              >
                {/* Arrow notch */}
                <div style={{
                  position: 'absolute', bottom: -5, left: 50,
                  width: 10, height: 10,
                  background: '#1A1A1A',
                  border: '1px solid #383838',
                  borderTopColor: 'transparent',
                  borderLeftColor: 'transparent',
                  borderRadius: '0 0 3px 0',
                  transform: 'rotate(45deg)',
                  zIndex: 2,
                }} />
                <div style={{
                  background: '#1A1A1A',
                  border: '1px solid #383838',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  <CcMenuItem label="Spoken language" value="English" />
                  <CcMenuItem label="Caption language" value="English" />
                  <div style={{ height: 1, background: '#383838' }} />
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#FFFFFF' }}>Allow manual captioning</span>
                    <button
                      onClick={() => setManualCaptioning(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <div style={{
                        width: 38, height: 22, borderRadius: 11,
                        background: manualCaptioning ? '#0073E6' : '#383838',
                        position: 'relative', transition: 'background 0.2s',
                      }}>
                        <div style={{
                          position: 'absolute', top: 3,
                          left: manualCaptioning ? 19 : 3,
                          width: 16, height: 16, borderRadius: '50%',
                          background: '#FFFFFF', transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main controls — absolutely centred so unequal side widths don't shift it */}
        <div style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <MicSplitBtn
            micBtnRef={micBtnRef}
            micOn={micOn}
            audioMenuOpen={audioMenuOpen}
            onToggleMic={toggleMic}
            onOpenAudio={() => setAudioMenuOpen(o => !o)}
          />
          <VideoSplitBtn
            videoBtnRef={videoBtnRef}
            cameraOn={cameraOn}
            videoMenuOpen={videoMenuOpen}
            onToggleCamera={toggleCamera}
            onOpenVideo={() => setVideoMenuOpen(o => !o)}
          />
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
          <div ref={reactBtnRef}>
          <ToolbarBtn label="React" onClick={() => setReactOpen(o => !o)} active={reactOpen}>
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <path fill="#FFFFFF" d="m13.798 2.217l-.015-.004l-.765-.248a1.58 1.58 0 0 1-1-.999L11.77.202a.302.302 0 0 0-.57 0l-.25.764a1.58 1.58 0 0 1-.983.999l-.594.193H9.37l-.172.055a.3.3 0 0 0-.146.111a.3.3 0 0 0 .146.459l.767.249l.083.03l.008.002a1.58 1.58 0 0 1 .88.889l.03.08l.248.765A.3.3 0 0 0 11.5 5h.004a.3.3 0 0 0 .281-.202l.249-.764a1.58 1.58 0 0 1 .999-.999l.765-.248a.303.303 0 0 0 0-.57m1.416 3.355l.612.199l.013.003a.242.242 0 0 1 0 .455l-.613.2a1.26 1.26 0 0 0-.799.798l-.199.612a.24.24 0 0 1-.235.16a.24.24 0 0 1-.224-.16l-.2-.612a1.26 1.26 0 0 0-.8-.8l-.024-.008l-.001-.003l-.583-.19a.242.242 0 0 1 0-.455l.613-.2a1.26 1.26 0 0 0 .787-.798l.199-.612a.242.242 0 0 1 .456 0l.199.612a1.26 1.26 0 0 0 .799.799M8.059 2.893a1 1 0 0 0 .04.108L8 3a5 5 0 1 0 4.98 5.455q.125.185.31.317a1.24 1.24 0 0 0 .628.225A6.002 6.002 0 0 1 2 8a6 6 0 0 1 6.097-6a1.3 1.3 0 0 0-.038.893M6.25 7.75a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5m-.114 1.917a.5.5 0 1 0-.745.667A3.5 3.5 0 0 0 8 11.5a3.5 3.5 0 0 0 2.609-1.166a.5.5 0 0 0-.745-.667A2.5 2.5 0 0 1 8 10.5c-.74 0-1.405-.321-1.864-.833M10.5 7A.75.75 0 1 1 9 7a.75.75 0 0 1 1.5 0"/>
            </svg>
          </ToolbarBtn>
          </div>
          <div ref={moreBtnRef}>
            <ToolbarBtn label="More" onClick={() => setMoreOpen(o => !o)} active={moreOpen}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="5"  cy="12" r="1.5" fill="#FFFFFF"/>
                <circle cx="12" cy="12" r="1.5" fill="#FFFFFF"/>
                <circle cx="19" cy="12" r="1.5" fill="#FFFFFF"/>
              </svg>
            </ToolbarBtn>
          </div>
          <div ref={endBtnRef}>
            <EndBtn onClick={handleEnd} />
          </div>
        </div>

        {/* Participants + Chat — solid #111111 per Figma */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToolbarBtn label="Apps" solid onClick={() => toggleRail('apps')} active={appsRailOpen}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="2" stroke="#FFFFFF" strokeWidth="1.4"/>
              <rect x="12" y="2" width="8" height="8" rx="2" stroke="#FFFFFF" strokeWidth="1.4"/>
              <rect x="2" y="12" width="8" height="8" rx="2" stroke="#FFFFFF" strokeWidth="1.4"/>
              <rect x="12" y="12" width="8" height="8" rx="2" stroke="#FFFFFF" strokeWidth="1.4"/>
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Participants" solid onClick={() => toggleRail('participants')} active={participantsRailOpen}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="4" stroke="#FFFFFF" strokeWidth="1.5"/>
              <path d="M2 21v-1a7 7 0 0 1 14 0v1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75M22 21v-1a7 7 0 0 0-5.27-6.77" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Chat" solid onClick={() => toggleRail('chat')} active={chatRailOpen}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </ToolbarBtn>
        </div>
      </motion.div>

      {/* ── Toast notifications — drop from top, stack below top bar ── */}
      <div style={{
        position: 'absolute', top: 76,
        right: railOpen ? 391 : 20,
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
              right: railOpen ? 391 : 20, width: 380,
              transition: 'right 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)',
              zIndex: 30,
            }}
          >
            {/* Arrow notch pointing at AI Assistant button */}
            <div style={{
              position: 'absolute',
              top: -5, right: 68,
              width: 10, height: 10,
              background: '#111111',
              border: '1px solid #595959',
              borderBottomColor: 'transparent',
              borderRightColor: 'transparent',
              borderRadius: '3px 0 0 0',
              transform: 'rotate(45deg)',
              zIndex: 2,
            }} />
            <div style={{
              background: '#111111',
              border: '1px solid #595959',
              borderRadius: 8,
              padding: '24px 24px 20px',
              display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: '0px 16px 40px 0px rgba(0,0,0,0.24)',
              boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SummaryIcon size={20} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px' }}>
                    See AI Assistant in action
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#D4D4D4', lineHeight: '20px' }}>
                  You'll get a summary, transcript, and action items when the meeting ends.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
                <NudgeBtn variant="cancel" onClick={() => setNudge(false)}>Skip</NudgeBtn>
                <NudgeBtn variant="confirm" onClick={turnOnAI}>Turn on</NudgeBtn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Participants Rail ── */}
      <AnimatePresence>
        {participantsRailOpen && (
          <motion.div
            key="participants-rail"
            initial={{ x: 371, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 371, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ position: 'absolute', top: 68, right: 0, bottom: 104, width: 371, zIndex: 15, overflow: 'hidden' }}
          >
            <ParticipantsRail
              onClose={() => setActiveRail(null)}
              profile={profile}
              micOn={micOn}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Rail ── */}
      <AnimatePresence>
        {chatRailOpen && (
          <motion.div
            key="chat-rail"
            initial={{ x: 371, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 371, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ position: 'absolute', top: 68, right: 0, bottom: 104, width: 371, zIndex: 15, overflow: 'hidden' }}
          >
            <ChatRail onClose={() => setActiveRail(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Apps Rail ── */}
      <AnimatePresence>
        {appsRailOpen && (
          <motion.div
            key="apps-rail"
            initial={{ x: 371, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 371, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{ position: 'absolute', top: 68, right: 0, bottom: 104, width: 371, zIndex: 15, overflow: 'hidden' }}
          >
            <AppsRail onClose={() => setActiveRail(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Meeting AI Rail — fits between top bar and toolbar ── */}
      <AnimatePresence>
        {aiRailOpen && (
          <motion.div
            key="meeting-ai-rail"
            initial={{ x: 371, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 371, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            style={{
              position: 'absolute', top: 68, right: 0, bottom: 104,
              width: 371, zIndex: 15, overflow: 'hidden',
            }}
          >
            <MeetingAIRail
              onClose={() => setActiveRail(null)}
              summaryActive={summaryActive}
              onSummaryToggle={toggleSummary}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Meeting Info Panel ── */}
      <AnimatePresence>
        {meetingInfoOpen && (
          <motion.div
            ref={meetingInfoPanelRef}
            key="meeting-info"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            style={{ position: 'absolute', top: 62, left: 40, zIndex: 30 }}
          >
            <MeetingInfoPanel profile={profile} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── React Panel ── */}
      <AnimatePresence>
        {reactOpen && (
          <ReactPanel
            menuRef={reactMenuRef}
            btnRef={reactBtnRef}
            onClose={() => setReactOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── More Menu ── */}
      <AnimatePresence>
        {moreOpen && (
          <MoreMenu
            menuRef={moreMenuRef}
            btnRef={moreBtnRef}
            onClose={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Audio Menu ── */}
      <AnimatePresence>
        {audioMenuOpen && (
          <AudioMenu
            menuRef={audioMenuRef}
            btnRef={micBtnRef}
            onClose={() => setAudioMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Leave Popover ── */}
      <AnimatePresence>
        {leaveDialogOpen && (
          <LeavePopover
            btnRef={endBtnRef}
            onLeave={confirmLeave}
            onCancel={() => setLeaveDialogOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Video Menu ── */}
      <AnimatePresence>
        {videoMenuOpen && (
          <VideoMenu
            menuRef={videoMenuRef}
            btnRef={videoBtnRef}
          />
        )}
      </AnimatePresence>

    </motion.div>
  )
}

/* ── React Panel ────────────────────────────────────────── */

const REACTIONS = [
  { emoji: '👍', shortcut: true  },
  { emoji: '👏', shortcut: true  },
  { emoji: '🙌', shortcut: true  },
  { emoji: '👎', shortcut: true  },
  { emoji: '🙏', shortcut: true  },
  { emoji: '😊', shortcut: false },
  { emoji: '😂', shortcut: false },
  { emoji: '😮', shortcut: false },
  { emoji: '😢', shortcut: false },
  { emoji: '🎉', shortcut: false },
  { emoji: '❤️', shortcut: true  },
  { emoji: '🐇', shortcut: false },
  { emoji: '🐢', shortcut: false },
  { emoji: '🔥', shortcut: false },
]

function ReactPanel({ menuRef, btnRef, onClose }) {
  const [gestureOn, setGestureOn] = useState(false)
  const [hovered,   setHovered]   = useState(null)

  const rect       = btnRef.current?.getBoundingClientRect()
  const panelWidth = 272
  const left       = rect ? Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) : 0
  const bottom     = rect ? window.innerHeight - rect.top + 16 : 0
  const notchLeft  = rect
    ? (rect.left + rect.width / 2) - Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) - 5
    : panelWidth / 2 - 5

  return (
    <motion.div
      ref={menuRef}
      key="react-panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      style={{ position: 'fixed', left, bottom, width: panelWidth, zIndex: 50, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Panel content */}
      <div style={{
        background: '#111111',
        border: '1px solid #2A2A2A',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        {/* Emoji grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4, padding: 12,
        }}>
          {REACTIONS.map(r => (
            <button
              key={r.emoji}
              onClick={onClose}
              onMouseEnter={() => setHovered(r.emoji)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === r.emoji ? '#222222' : 'transparent',
                border: r.shortcut ? '1.5px dashed rgba(255,255,255,0.12)' : '1.5px solid transparent',
                borderRadius: 10,
                padding: '10px 0',
                cursor: 'pointer',
                fontSize: 28, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.12s',
              }}
            >
              {r.emoji}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#2A2A2A', margin: '0 0' }} />

        {/* Recognize hand gestures */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 16px',
        }}>
          <span style={{ flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: 400 }}>
            Recognize hand gestures
          </span>
          <button onClick={() => setGestureOn(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{
              width: 42, height: 24, borderRadius: 12,
              background: gestureOn ? '#0073E6' : '#4A4A4A',
              position: 'relative', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 4, left: gestureOn ? 21 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#FFFFFF', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#2A2A2A' }} />

        {/* Customize reaction shortcuts */}
        <ReactPanelRow label="Customize reaction shortcuts" onClose={onClose} />
      </div>

      {/* Arrow notch */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: -5, left: notchLeft,
          width: 10, height: 10,
          background: '#111111',
          border: '1px solid #2A2A2A',
          borderTopColor: 'transparent', borderLeftColor: 'transparent',
          borderRadius: '0 0 3px 0',
          transform: 'rotate(45deg)', zIndex: 2,
        }} />
      </div>
    </motion.div>
  )
}

function ReactPanelRow({ label, onClose }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px',
        background: hovered ? '#1A1A1A' : 'transparent',
        cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      <span style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400 }}>{label}</span>
    </div>
  )
}

/* ── Mic Split Button ────────────────────────────────────── */

function MicSplitBtn({ micBtnRef, micOn, audioMenuOpen, onToggleMic, onOpenAudio }) {
  const [hovMain, setHovMain] = useState(false)
  const [hovChev, setHovChev] = useState(false)

  const baseBg    = 'rgba(34,34,34,0.5)'
  const hoverBg   = 'rgba(50,50,50,0.7)'
  const activeBg  = 'rgba(60,60,60,0.85)'

  const chevBg = audioMenuOpen ? activeBg : hovChev ? hoverBg : baseBg

  const shared = {
    border: 'none', cursor: 'pointer', backdropFilter: 'blur(24px)',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'background 0.15s',
  }

  return (
    <div ref={micBtnRef} style={{ display: 'flex', alignItems: 'stretch', borderRadius: 4, overflow: 'hidden', width: 90 }}>
      {/* Main: mic toggle — flex:1 fills all available width */}
      <button
        onClick={onToggleMic}
        onMouseEnter={() => setHovMain(true)}
        onMouseLeave={() => setHovMain(false)}
        style={{
          ...shared,
          flex: 1,
          background: hovMain ? hoverBg : baseBg,
          padding: '10px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}
      >
        <MicIcon on={micOn} size={20} />
        <span style={{ fontSize: 11, fontWeight: 400, color: '#AAAAAA', whiteSpace: 'nowrap' }}>Mic</span>
      </button>

      {/* Separator */}
      <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '10px 0' }} />

      {/* Chevron: fixed 24px tap target */}
      <button
        onClick={onOpenAudio}
        onMouseEnter={() => setHovChev(true)}
        onMouseLeave={() => setHovChev(false)}
        style={{
          ...shared,
          background: chevBg,
          width: 24,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke={audioMenuOpen ? '#FFFFFF' : '#AAAAAA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

/* ── Video Split Button ──────────────────────────────────── */

function VideoSplitBtn({ videoBtnRef, cameraOn, videoMenuOpen, onToggleCamera, onOpenVideo }) {
  const [hovMain, setHovMain] = useState(false)
  const [hovChev, setHovChev] = useState(false)

  const baseBg   = 'rgba(34,34,34,0.5)'
  const hoverBg  = 'rgba(50,50,50,0.7)'
  const activeBg = 'rgba(60,60,60,0.85)'
  const chevBg   = videoMenuOpen ? activeBg : hovChev ? hoverBg : baseBg

  const shared = {
    border: 'none', cursor: 'pointer', backdropFilter: 'blur(24px)',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'background 0.15s',
  }

  return (
    <div ref={videoBtnRef} style={{ display: 'flex', alignItems: 'stretch', borderRadius: 4, overflow: 'hidden', width: 90 }}>
      <button
        onClick={onToggleCamera}
        onMouseEnter={() => setHovMain(true)}
        onMouseLeave={() => setHovMain(false)}
        style={{
          ...shared,
          flex: 1,
          background: hovMain ? hoverBg : baseBg,
          padding: '10px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        }}
      >
        <CamIcon on={cameraOn} size={24} />
        <span style={{ fontSize: 11, fontWeight: 400, color: '#AAAAAA', whiteSpace: 'nowrap' }}>Video</span>
      </button>

      <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '10px 0' }} />

      <button
        onClick={onOpenVideo}
        onMouseEnter={() => setHovChev(true)}
        onMouseLeave={() => setHovChev(false)}
        style={{
          ...shared,
          background: chevBg,
          width: 24,
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke={videoMenuOpen ? '#FFFFFF' : '#AAAAAA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

/* ── Audio Menu ──────────────────────────────────────────── */

const SPEAKER_DEVICES = [
  { label: 'Follow system setting', sub: 'MacBook Air Speakers (Built-in)', selected: false },
  { label: 'MacBook Air Speakers (Built-in)',   selected: true  },
  { label: 'Microsoft Teams Audio (Virtual)',   selected: false },
]

const MIC_DEVICES = [
  { label: 'Follow system setting', sub: 'MacBook Air Microphone (Built-in)', selected: false },
  { label: 'MacBook Air Microphone (Built-in)', selected: true  },
  { label: 'Microsoft Teams Audio (Virtual)',   selected: false },
]

function AudioSectionHeader({ label }) {
  return (
    <div style={{ padding: '12px 16px 6px' }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#666666' }}>{label}</span>
    </div>
  )
}

function AudioDeviceRow({ label, sub, selected }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start',
        padding: '8px 16px',
        background: hovered ? '#1A1A1A' : 'transparent',
        cursor: 'pointer', gap: 10,
      }}
    >
      <div style={{ width: 20, flexShrink: 0, paddingTop: 2 }}>
        {selected && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 8l4 4 8-8" stroke="#0073E6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: selected ? 500 : 400, color: '#FFFFFF', lineHeight: '22px' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#666666', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function AudioExpandRow({ label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        background: hovered ? '#1A1A1A' : 'transparent',
        cursor: 'pointer',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <rect x="9" y="2" width="6" height="11" rx="3" stroke="#AAAAAA" strokeWidth="1.5"/>
        <path d="M5 10a7 7 0 0 0 14 0" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 19v3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span style={{ flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: 400 }}>{label}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5 7l3 3 3-3" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function AudioActionRow({ iconType, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        background: hovered ? '#1A1A1A' : 'transparent',
        cursor: 'pointer',
      }}
    >
      {iconType === 'gear' && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
          <path d="M9 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="#AAAAAA" strokeWidth="1.3"/>
          <path d="M7.4 2.4l-.4 1.3a5.5 5.5 0 00-1.1.65l-1.3-.43-1.6 1.6.43 1.3c-.27.34-.49.7-.65 1.1L1.4 8.4v2.2l1.33.4c.16.4.38.76.65 1.1l-.43 1.3 1.6 1.6 1.3-.43c.34.27.7.49 1.1.65l.4 1.33h2.2l.4-1.33a5.5 5.5 0 001.1-.65l1.3.43 1.6-1.6-.43-1.3c.27-.34.49-.7.65-1.1l1.33-.4V8.4l-1.33-.4a5.5 5.5 0 00-.65-1.1l.43-1.3-1.6-1.6-1.3.43a5.5 5.5 0 00-1.1-.65L10.6 2.4H7.4z" stroke="#AAAAAA" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      )}
      {iconType === 'phone' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.37 21 3 13.63 3 4.5a1 1 0 011-1H7.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.24 1.01z" stroke="#AAAAAA" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      )}
      <span style={{ flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: 400 }}>{label}</span>
    </div>
  )
}

function AudioDivider() {
  return <div style={{ height: 1, background: '#2A2A2A', margin: '4px 0' }} />
}

function AudioMenu({ menuRef, btnRef }) {
  const rect      = btnRef.current?.getBoundingClientRect()
  const panelWidth = 320
  const left      = rect ? Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) : 0
  const bottom    = rect ? window.innerHeight - rect.top + 16 : 0
  const notchLeft = rect
    ? (rect.left + rect.width / 2) - Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) - 5
    : panelWidth / 2 - 5

  return (
    <motion.div
      ref={menuRef}
      key="audio-menu"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      style={{ position: 'fixed', left, bottom, width: panelWidth, zIndex: 50, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Panel */}
      <div style={{
        background: '#111111',
        border: '1px solid #2A2A2A',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        maxHeight: rect ? rect.top - 32 : '80vh',
        overflowY: 'auto',
      }}>

        {/* Speaker */}
        <AudioSectionHeader label="Speaker" />
        {SPEAKER_DEVICES.map(d => <AudioDeviceRow key={d.label} {...d} />)}

        <AudioDivider />

        {/* Microphone */}
        <AudioSectionHeader label="Microphone" />
        {MIC_DEVICES.map(d => <AudioDeviceRow key={d.label} {...d} />)}

        <AudioDivider />

        {/* Smart audio */}
        <AudioSectionHeader label="Smart audio•microphone" />
        <AudioExpandRow label="Noise removal" />

        <AudioDivider />

        {/* Audio Settings */}
        <AudioActionRow iconType="gear" label="Audio Settings..." />

        <AudioDivider />

        {/* Footer */}
        <div style={{ padding: '10px 16px 2px' }}>
          <p style={{ fontSize: 12, color: '#666666', margin: 0, fontWeight: 400 }}>
            You're using your computer for audio
          </p>
        </div>
        <AudioActionRow iconType="phone" label="Switch audio" />
        <div style={{ height: 6 }} />
      </div>

      {/* Arrow notch pointing down */}
      <div style={{
        position: 'absolute',
        bottom: -5,
        left: notchLeft,
        width: 10, height: 10,
        background: '#111111',
        border: '1px solid #2A2A2A',
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRadius: '0 0 3px 0',
        transform: 'rotate(45deg)',
        zIndex: 2,
      }} />
    </motion.div>
  )
}

/* ── Video Menu ──────────────────────────────────────────── */

const CAMERA_DEVICES = [
  { label: 'Use last connected camera (MacBook Air C...)', selected: false },
  { label: 'MacBook Air Camera', selected: true },
]

function VideoMenu({ menuRef, btnRef }) {
  const rect       = btnRef.current?.getBoundingClientRect()
  const panelWidth = 300
  const left       = rect ? Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) : 0
  const bottom     = rect ? window.innerHeight - rect.top + 16 : 0
  const notchLeft  = rect
    ? (rect.left + rect.width / 2) - Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) - 5
    : panelWidth / 2 - 5

  return (
    <motion.div
      ref={menuRef}
      key="video-menu"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      style={{ position: 'fixed', left, bottom, width: panelWidth, zIndex: 50, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div style={{
        background: '#111111',
        border: '1px solid #2A2A2A',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        maxHeight: rect ? rect.top - 32 : '80vh',
        overflowY: 'auto',
      }}>

        {/* Camera devices */}
        <AudioSectionHeader label="Camera" />
        {CAMERA_DEVICES.map(d => <AudioDeviceRow key={d.label} {...d} />)}

        <AudioDivider />

        {/* Actions */}
        <VideoActionRow iconType="background" label="Change virtual background" />
        <VideoActionRow iconType="selfview"   label="Self-view location..." />

        <AudioDivider />

        <VideoActionRow iconType="gear" label="Video Settings..." />
        <div style={{ height: 6 }} />
      </div>

      {/* Arrow notch pointing down */}
      <div style={{
        position: 'absolute',
        bottom: -5,
        left: notchLeft,
        width: 10, height: 10,
        background: '#111111',
        border: '1px solid #2A2A2A',
        borderTopColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRadius: '0 0 3px 0',
        transform: 'rotate(45deg)',
        zIndex: 2,
      }} />
    </motion.div>
  )
}

function VideoActionRow({ iconType, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        background: hovered ? '#1A1A1A' : 'transparent',
        cursor: 'pointer',
      }}
    >
      {iconType === 'background' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M12 2l1.5 4H18l-3.5 2.5 1.5 4L12 10l-4 2.5 1.5-4L6 6h4.5z" stroke="#AAAAAA" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M5 20h14M8 17l4-6 4 6" stroke="#AAAAAA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {iconType === 'selfview' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="#AAAAAA" strokeWidth="1.4"/>
          <rect x="14" y="12" width="7" height="5" rx="1" stroke="#AAAAAA" strokeWidth="1.2"/>
        </svg>
      )}
      {iconType === 'gear' && (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
          <path d="M9 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="#AAAAAA" strokeWidth="1.3"/>
          <path d="M7.4 2.4l-.4 1.3a5.5 5.5 0 00-1.1.65l-1.3-.43-1.6 1.6.43 1.3c-.27.34-.49.7-.65 1.1L1.4 8.4v2.2l1.33.4c.16.4.38.76.65 1.1l-.43 1.3 1.6 1.6 1.3-.43c.34.27.7.49 1.1.65l.4 1.33h2.2l.4-1.33a5.5 5.5 0 001.1-.65l1.3.43 1.6-1.6-.43-1.3c.27-.34.49-.7.65-1.1l1.33-.4V8.4l-1.33-.4a5.5 5.5 0 00-.65-1.1l.43-1.3-1.6-1.6-1.3.43a5.5 5.5 0 00-1.1-.65L10.6 2.4H7.4z" stroke="#AAAAAA" strokeWidth="1.3" strokeLinejoin="round"/>
        </svg>
      )}
      <span style={{ flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: 400 }}>{label}</span>
    </div>
  )
}

/* ── More Menu ───────────────────────────────────────────── */

function MoreMenuIcon({ type }) {
  const s = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', flexShrink: 0 }
  switch (type) {
    case 'device': return (
      <svg {...s}><path fill="#AAAAAA" d="M2 19v-2h2V5h16v12h2v2zm5-2h10V7H5v10h2zM5 7h14H5z"/></svg>
    )
    case 'audio': return (
      <svg {...s}><path fill="#AAAAAA" d="M12 3a4 4 0 0 1 4 4v4a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v4a2 2 0 0 0 4 0V7a2 2 0 0 0-2-2zm-7 8h2a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.93V21h4v2H9v-2h4v-2.07A7 7 0 0 1 5 13z"/></svg>
    )
    case 'lock': return (
      <svg {...s}><path fill="#AAAAAA" d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm6-5q.825 0 1.413-.587T14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6z"/></svg>
    )
    case 'invite': return (
      <svg {...s}><path fill="#AAAAAA" d="M18 14v-3h-3V9h3V6h2v3h3v2h-3v3zM6.175 10.825Q5 9.65 5 8t1.175-2.825T9 4t2.825 1.175T13 8t-1.175 2.825T9 12t-2.825-1.175M1 20v-2.8q0-.85.438-1.562T2.6 14.55q1.55-.775 3.15-1.162T9 13t3.25.388t3.15 1.162q.725.375 1.163 1.088T17 17.2V20zm2-2h12v-.8q0-.275-.137-.5t-.363-.35q-1.35-.675-2.725-1.012T9 15t-2.775.338T3.5 16.35q-.225.125-.363.35T3 17.2z"/></svg>
    )
    case 'link': return (
      <svg {...s}><path fill="#AAAAAA" d="M11 17H7q-2.075 0-3.537-1.463T2 12t1.463-3.537T7 7h4v2H7q-1.25 0-2.125.875T4 12t.875 2.125T7 15h4zm-3-4v-2h8v2zm5 4v-2h4q1.25 0 2.125-.875T20 12t-.875-2.125T17 9h-4V7h4q2.075 0 3.538 1.463T22 12t-1.463 3.538T17 17z"/></svg>
    )
    case 'whiteboard': return (
      <svg {...s}><path fill="#AAAAAA" d="M3 19V5h18v14zm2-3h14V7H5zm0 0V7z"/></svg>
    )
    case 'breakout': return (
      <svg {...s}><path fill="#AAAAAA" d="M0 18v-1.575q0-1.075 1.1-1.75T4 14q.325 0 .625.013t.575.062q-.35.525-.525 1.1t-.175 1.2V18zm6 0v-1.625q0-.8.438-1.463t1.237-1.162T9.588 13T12 12.75q1.325 0 2.438.25t1.912.75t1.225 1.163t.425 1.462V18zm13.5 0v-1.625q0-.65-.162-1.225t-.488-1.075q.275-.05.563-.062T20 14q1.8 0 2.9.663t1.1 1.762V18zM4 13q-.825 0-1.412-.587T2 11q0-.85.588-1.425T4 9q.85 0 1.425.575T6 11q0 .825-.575 1.413T4 13m16 0q-.825 0-1.412-.587T18 11q0-.85.588-1.425T20 9q.85 0 1.425.575T22 11q0 .825-.575 1.413T20 13m-8-1q-1.25 0-2.125-.875T9 9q0-1.275.875-2.137T12 6q1.275 0 2.138.863T15 9q0 1.25-.862 2.125T12 12"/></svg>
    )
    case 'language': return (
      <svg {...s}><path fill="#AAAAAA" d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12t.788-3.875t2.15-3.187t3.187-2.15T12 2t3.875.788t3.188 2.15t2.15 3.187T22 12t-.787 3.875t-2.15 3.188t-3.188 2.15T12 22m0-2.05q.65-.9 1.125-1.875T13.9 16h-3.8q.3 1.1.775 2.075T12 19.95m-2.6-.4q-.45-.825-.787-1.713T8.05 16H5.1q.725 1.25 1.813 2.175T9.4 19.55m5.2 0q1.4-.45 2.488-1.375T18.9 16h-2.95q-.225.95-.562 1.838T14.6 19.55M4.25 14h3.4q-.075-.5-.112-.987T7.5 12t.038-1.012T7.65 10h-3.4q-.125.5-.187.988T4 12t.063 1.013t.187.987m5.4 0h4.7q.075-.5.113-.987T14.5 12t-.038-1.012T14.35 10h-4.7q-.075.5-.112.988T9.5 12t.038 1.013t.112.987m6.7 0h3.4q.125-.5.188-.987T20 12t-.062-1.012T19.75 10h-3.4q.075.5.113.988T16.5 12t-.038 1.013t-.112.987m-.4-6h2.95q-.725-1.25-1.812-2.175T14.6 4.45q.45.825.788 1.713T15.95 8M10.1 8h3.8q-.3-1.1-.775-2.075T12 4.05q-.65.9-1.125 1.875T10.1 8m-5 0h2.95q.225-.95.563-1.838T9.4 4.45Q8 4.9 6.912 5.825T5.1 8"/></svg>
    )
    case 'coffee': return (
      <svg {...s}><path fill="#AAAAAA" d="M11 18q-2.925 0-4.962-2.037T4 11V5q0-.825.588-1.412T6 3h12.5q1.45 0 2.475 1.025T22 6.5t-1.025 2.475T18.5 10H18v1q0 2.925-2.037 4.963T11 18M6 8h10V5H6zm5 8q2.075 0 3.538-1.463T16 11v-1H6v1q0 2.075 1.463 3.538T11 16m7-8h.5q.625 0 1.063-.437T20 6.5t-.437-1.062T18.5 5H18zM4 21v-2h16v2z"/></svg>
    )
    case 'settings': return (
      <svg {...s}><path fill="#AAAAAA" d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zM12 15.5q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5t-2.475 1.025T8.5 12t1.025 2.475T12 15.5"/></svg>
    )
    case 'report': return (
      <svg {...s}><path fill="#AAAAAA" d="M12 17q.425 0 .713-.288T13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17m-1-4h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137t2.137 3.175T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20"/></svg>
    )
    case 'stats': return (
      <svg {...s}><path fill="#AAAAAA" d="M2 21v-2h20v2zm1-3v-7h3v7zm5 0V6h3v12zm5 0V9h3v9zm5 0V3h3v15z"/></svg>
    )
    default: return null
  }
}

function MoreMenuToggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
      <div style={{
        width: 38, height: 22, borderRadius: 11,
        background: on ? '#0073E6' : '#4A4A4A',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 19 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: '#FFFFFF', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  )
}

const MORE_SECTIONS = [
  {
    header: 'Meeting',
    items: [
      { label: 'Lock meeting',                      icon: 'lock',      toggleKey: 'locked'       },
      { label: 'Invite and remind',                 icon: 'invite'                                },
      { label: 'Copy meeting link',                 icon: 'link'                                  },
      { label: 'Whiteboards',                       icon: 'whiteboard'                            },
      { label: 'Enable breakout sessions',          icon: 'breakout',  toggleKey: 'breakout'      },
      { label: 'Enable sign language interpretation', icon: 'language', toggleKey: 'signLanguage' },
      { label: 'Step away from meeting',            icon: 'coffee'                                },
      { label: 'Meeting options',                   icon: 'settings'                              },
      { label: 'Report an issue',                   icon: 'report'                                },
      { label: 'Statistics',                        icon: 'stats'                                 },
    ],
  },
  {
    header: 'Cisco video system',
    items: [
      { label: 'Move meeting to a video device', icon: 'device' },
    ],
  },
  {
    header: "You're using your computer for audio",
    items: [
      { label: 'Switch audio', icon: 'audio' },
    ],
  },
]

function MoreMenu({ menuRef, btnRef, onClose }) {
  const [toggles, setToggles] = useState({ locked: false, breakout: false, signLanguage: false })

  const rect = btnRef.current?.getBoundingClientRect()
  const panelWidth = 320
  const left = rect ? Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) : 0
  // 16px gap between button top and arrow tip; arrow protrudes 5px below panel
  const bottom = rect ? window.innerHeight - rect.top + 16 : 0
  // notch horizontal center relative to panel left edge
  const notchLeft = rect ? (rect.left + rect.width / 2) - Math.max(8, rect.left + rect.width / 2 - panelWidth / 2) - 5 : panelWidth / 2 - 5

  function flip(key) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <motion.div
      ref={menuRef}
      key="more-menu"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      style={{
        position: 'fixed',
        left, bottom,
        width: panelWidth,
        zIndex: 50,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Panel content */}
      <div style={{
        background: '#111111',
        border: '1px solid #2A2A2A',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        maxHeight: rect ? rect.top - 32 : '80vh',
        overflowY: 'auto',
      }}>
        {MORE_SECTIONS.map((section, si) => (
          <div key={section.header}>
            {si > 0 && <div style={{ height: 1, background: '#2A2A2A' }} />}

            {/* Section header */}
            <p style={{
              fontSize: 12, fontWeight: 400, color: '#666666',
              margin: 0, padding: '12px 16px 6px',
            }}>
              {section.header}
            </p>

            {/* Items */}
            {section.items.map(item => (
              <MoreMenuItem
                key={item.label}
                item={item}
                toggleOn={item.toggleKey ? toggles[item.toggleKey] : undefined}
                onToggle={item.toggleKey ? () => flip(item.toggleKey) : undefined}
                onClose={onClose}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Arrow notch pointing down toward the More button */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          bottom: -5,
          left: notchLeft,
          width: 10, height: 10,
          background: '#111111',
          border: '1px solid #2A2A2A',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRadius: '0 0 3px 0',
          transform: 'rotate(45deg)',
          zIndex: 2,
        }} />
      </div>
    </motion.div>
  )
}

function MoreMenuItem({ item, toggleOn, onToggle, onClose }) {
  const [hovered, setHovered] = useState(false)
  function handleClick() {
    if (!onToggle) onClose()
    else onToggle()
  }
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
        background: hovered ? '#1E1E1E' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
      }}
    >
      <MoreMenuIcon type={item.icon} />
      <span style={{ flex: 1, fontSize: 15, fontWeight: 400, color: '#FFFFFF', lineHeight: '22px' }}>
        {item.label}
      </span>
      {onToggle !== undefined && (
        <MoreMenuToggle on={toggleOn} onToggle={e => { e.stopPropagation(); onToggle() }} />
      )}
    </div>
  )
}

/* ── Meeting Info ────────────────────────────────────────── */

const MEETING_DATA = {
  link:       'https://webex.com/meet/harsha.test-call',
  number:     '2661 880 4718',
  accessCode: '2661 880 4718',
  videoAddr:  '26618804718@webex.com',
  audio:      'United States Toll +1-650-479-3208',
}

function InfoRow({ label, value, onCopy, copied }) {
  const [hov, setHov] = useState(false)
  return (
    <div>
      <p style={{ fontSize: 12, color: '#666666', margin: '0 0 3px', fontFamily: "'Inter', system-ui, sans-serif" }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <p style={{
          fontSize: 14, color: '#E9E9E9', margin: 0, flex: 1,
          fontFamily: "'Inter', system-ui, sans-serif",
          wordBreak: 'break-all', lineHeight: '20px',
        }}>
          {value}
        </p>
        {onCopy && (
          <button
            onClick={onCopy}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              flexShrink: 0, background: hov ? '#2A2A2A' : 'none',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              padding: 5, display: 'flex', alignItems: 'center',
              transition: 'background 0.12s',
            }}
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3 3 7-6" stroke="#4DB848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="1" width="8" height="9" rx="1.5" stroke="#888888" strokeWidth="1.2"/>
                <path d="M9 10v2a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 010 12V4a1.5 1.5 0 011.5-1.5H4" stroke="#888888" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function MeetingInfoPanel({ profile }) {
  const [tab,    setTab]    = useState('general')
  const [copied, setCopied] = useState(null)

  function copy(field, value) {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(field)
    setTimeout(() => setCopied(c => c === field ? null : c), 2000)
  }

  const allInfo = `Meeting link: ${MEETING_DATA.link}\nMeeting number: ${MEETING_DATA.number}\nAccess code: ${MEETING_DATA.accessCode}\nVideo address: ${MEETING_DATA.videoAddr}\nAudio: ${MEETING_DATA.audio}`

  return (
    <div style={{ position: 'relative', width: 320 }}>
      {/* ── Arrow notch ── */}
      <div style={{
        position: 'absolute',
        top: -5, left: 20,
        width: 10, height: 10,
        background: '#1A1A1A',
        border: '1px solid #383838',
        borderBottomColor: 'transparent',
        borderRightColor:  'transparent',
        borderRadius: '3px 0 0 0',
        transform: 'rotate(45deg)',
        zIndex: 2,
      }} />

    <div style={{
      width: 320,
      background: '#1A1A1A',
      border: '1px solid #383838',
      borderRadius: 16,
      boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '20px 20px 16px' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', margin: '0 0 10px', lineHeight: '22px' }}>
          {profile.name}'s Test Call
        </p>

        {/* Host row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#2E96E8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#FFFFFF', flexShrink: 0,
          }}>
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: 13, color: '#888888' }}>
            Host: <span style={{ color: '#E9E9E9', fontWeight: 500 }}>{profile.name}</span>
          </span>
        </div>

        {/* Copy all button */}
        <button
          onClick={() => copy('all', allInfo)}
          style={{
            width: '100%', background: 'none',
            border: '1px solid #494949', borderRadius: 9999,
            padding: '8px 0', cursor: 'pointer',
            color: copied === 'all' ? '#4DB848' : '#FFFFFF',
            fontSize: 13, fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
            transition: 'color 0.15s',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {copied === 'all' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3 3 7-6" stroke="#4DB848" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="1" width="8" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.2"/>
                <path d="M9 10v2a1.5 1.5 0 01-1.5 1.5h-6A1.5 1.5 0 010 12V4a1.5 1.5 0 011.5-1.5H4" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            )}
            {copied === 'all' ? 'Copied!' : 'Copy meeting information'}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#2A2A2A' }} />

      {/* Tabs */}
      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 2 }}>
        {['General', 'Security'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t.toLowerCase())}
            style={{
              background: tab === t.toLowerCase() ? '#323232' : 'none',
              border: 'none', borderRadius: 20,
              padding: '6px 14px',
              color: tab === t.toLowerCase() ? '#FFFFFF' : '#888888',
              fontSize: 13, fontWeight: tab === t.toLowerCase() ? 500 : 400,
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tab === 'general' ? (
          <>
            <InfoRow label="Meeting link"    value={MEETING_DATA.link}       onCopy={() => copy('link',   MEETING_DATA.link)}       copied={copied === 'link'} />
            <InfoRow label="Meeting number"  value={MEETING_DATA.number}     onCopy={() => copy('number', MEETING_DATA.number)}     copied={copied === 'number'} />
            <InfoRow label="Access code"     value={MEETING_DATA.accessCode} onCopy={() => copy('access', MEETING_DATA.accessCode)} copied={copied === 'access'} />
            <InfoRow label="Video address"   value={MEETING_DATA.videoAddr}  onCopy={() => copy('video',  MEETING_DATA.videoAddr)}  copied={copied === 'video'} />
            <InfoRow label="Audio"           value={MEETING_DATA.audio} />
          </>
        ) : (
          <>
            <div style={{
              background: 'rgba(0,115,230,0.12)',
              border: '1px solid rgba(0,115,230,0.25)',
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="8" cy="8" r="6.5" stroke="#2E96E8" strokeWidth="1.2"/>
                <path d="M8 7v4" stroke="#2E96E8" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="5.5" r="0.6" fill="#2E96E8"/>
              </svg>
              <p style={{ fontSize: 13, color: '#6BB8FF', margin: 0, lineHeight: '18px' }}>
                You are securely connected to this meeting with strong encryption.
              </p>
            </div>
            <InfoRow label="Meeting platform"  value="Commercial (Webex Suite)" />
            <InfoRow label="Server connection"  value="TLS AES 256 GCM SHA384" />
            <InfoRow label="Media connection"   value="AEAD AES 256 GCM" />
          </>
        )}
      </div>
    </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────── */

function MeetingInfoBtn({ open, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: open || hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: 'none', borderRadius: 8,
        padding: '6px 10px 6px 8px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C6.13 2 3 5.13 3 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke="#FFFFFF" strokeWidth="1.5"/>
        <path d="M10 9v4M10 7v.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif" }}>
        Meeting info
      </span>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

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

const TILE_MENU_ITEMS = [
  {
    label: 'Edit display name',
    icon: <path fill="#AAAAAA" d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/>,
  },
  {
    label: 'Change virtual background',
    icon: <path fill="#AAAAAA" d="m19 9l-1.25-2.75L15 5l2.75-1.25L19 1l1.25 2.75L23 5l-2.75 1.25L19 9Zm0 14l-1.25-2.75L15 19l2.75-1.25L19 15l1.25 2.75L23 19l-2.75 1.25L19 23ZM9 20l-2.5-5.5L1 12l5.5-2.5L9 4l2.5 5.5L17 12l-5.5 2.5L9 20Zm0-4.85L10 13l2.15-1L10 11L9 8.85L8 11l-2.15 1L8 13l1 2.15Z"/>,
  },
  {
    label: 'Video Settings...',
    icon: <path fill="#AAAAAA" d="M20 22h-6q-.425 0-.712-.288T13 21v-6q0-.425.288-.712T14 14h6q.425 0 .713.288T21 15v2l2-2v6l-2-2v2q0 .425-.288.713T20 22M12.05 8.5q-1.45 0-2.475 1.025T8.55 12q0 1.2.675 2.1T11 15.35V13.1q-.2-.2-.325-.513T10.55 12q0-.625.438-1.062t1.062-.438t1.05.438t.425 1.062h2.025q0-1.45-1.025-2.475T12.05 8.5M9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338V12h-2q-.025-.475-.075-.837t-.15-.688l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.213-.962t-1.437-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.6.625 1.35 1.05T11 17.4V22z"/>,
  },
  {
    label: 'Self-view location...',
    icon: <path fill="#AAAAAA" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm0 0V6zm7-5h8V7h-8zm2-2V9h4v2z"/>,
  },
]

function TileMenu({ menuRef, btnRef, onClose }) {
  const rect = btnRef.current?.getBoundingClientRect()
  const panelWidth = 260
  const left  = rect ? rect.right - panelWidth : 0
  // position above the button with 8px gap + 5px for arrow
  const bottom = rect ? window.innerHeight - rect.top + 8 : 0
  // notch aligns to center of button, relative to panel left
  const notchLeft = rect ? (rect.left + rect.width / 2) - Math.max(0, rect.right - panelWidth) - 5 : panelWidth - 24

  return (
    <motion.div
      ref={menuRef}
      key="tile-menu"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      style={{ position: 'fixed', left, bottom, width: panelWidth, zIndex: 60, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Panel */}
      <div style={{
        background: '#1A1A1A',
        border: '1px solid #383838',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        {TILE_MENU_ITEMS.map(item => (
          <TileMenuItem key={item.label} item={item} onClose={onClose} />
        ))}
      </div>
      {/* Arrow notch pointing down */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', bottom: -5, left: notchLeft,
          width: 10, height: 10,
          background: '#1A1A1A',
          border: '1px solid #383838',
          borderTopColor: 'transparent', borderLeftColor: 'transparent',
          borderRadius: '0 0 3px 0',
          transform: 'rotate(45deg)',
          zIndex: 2,
        }} />
      </div>
    </motion.div>
  )
}

function TileMenuItem({ item, onClose }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px',
        background: hovered ? '#242424' : 'transparent',
        cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        {item.icon}
      </svg>
      <span style={{ fontSize: 15, color: '#FFFFFF', fontWeight: 400 }}>
        {item.label}
      </span>
    </div>
  )
}

function TileIconBtn({ children, title, onClick, active = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        background: active || hovered ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function CcSplitBtn({ ccBtnRef, ccOn, ccMenuOpen, onToggleCc, onOpenMenu }) {
  const [hovMain, setHovMain] = useState(false)
  const [hovChev, setHovChev] = useState(false)

  const baseBg   = 'rgba(34,34,34,0.5)'
  const hoverBg  = 'rgba(50,50,50,0.7)'
  const activeBg = 'rgba(60,60,60,0.85)'
  const chevBg   = ccMenuOpen ? activeBg : hovChev ? hoverBg : baseBg

  const shared = {
    border: 'none', cursor: 'pointer', backdropFilter: 'blur(24px)',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'background 0.15s',
  }

  return (
    <div ref={ccBtnRef} style={{ display: 'flex', alignItems: 'stretch', borderRadius: 9999, overflow: 'hidden' }}>
      <button
        onClick={onToggleCc}
        onMouseEnter={() => setHovMain(true)}
        onMouseLeave={() => setHovMain(false)}
        style={{
          ...shared,
          background: hovMain ? hoverBg : baseBg,
          padding: '10px 12px 10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill={ccOn ? '#FFFFFF' : '#AAAAAA'} d="M5 20q-.825 0-1.412-.587T3 18V6q0-.825.588-1.412T5 4h14q.825 0 1.413.588T21 6v12q0 .825-.587 1.413T19 20zm0-2h14V6H5zm2-3h3q.425 0 .713-.288T11 14v-.5q0-.225-.15-.375t-.375-.15h-.45q-.225 0-.375.15t-.15.375h-2v-3h2q0 .225.15.375t.375.15h.45q.225 0 .375-.15T11 10.5V10q0-.425-.288-.712T10 9H7q-.425 0-.712.288T6 10v4q0 .425.288.713T7 15m10-6h-3q-.425 0-.712.288T13 10v4q0 .425.288.713T14 15h3q.425 0 .713-.288T18 14v-.5q0-.225-.15-.375t-.375-.15h-.45q-.225 0-.375.15t-.15.375h-2v-3h2q0 .225.15.375t.375.15h.45q.225 0 .375-.15T18 10.5V10q0-.425-.288-.712T17 9M5 18V6z"/>
        </svg>
      </button>
      <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '10px 0' }} />
      <button
        onClick={onOpenMenu}
        onMouseEnter={() => setHovChev(true)}
        onMouseLeave={() => setHovChev(false)}
        style={{
          ...shared,
          background: chevBg,
          width: 28,
          flexShrink: 0,
          padding: '10px 8px 10px 4px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: ccMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M3 5l3 3 3-3" stroke={ccMenuOpen ? '#FFFFFF' : '#AAAAAA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}

function CcMenuItem({ label, value }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        cursor: 'pointer',
        background: hovered ? '#222222' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 400, color: '#888888', lineHeight: '18px' }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#FFFFFF', lineHeight: '21px' }}>{value}</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
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

function ToolbarBtn({ label, children, onClick, hasChevron = false, onChevronClick, solid = false, active = false }) {
  const [hovered, setHovered] = useState(false)
  const bg = solid
    ? (hovered ? '#1A1A1A' : '#111111')
    : active
      ? 'rgba(60,60,60,0.85)'
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
        onChevronClick ? (
          <span
            onClick={e => { e.stopPropagation(); onChevronClick() }}
            style={{ display: 'flex', alignItems: 'center', padding: '4px 2px', cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5l3 3 3-3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5l3 3 3-3" stroke="#AAAAAA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      )}
    </button>
  )
}

function LeavePopover({ btnRef, onLeave, onCancel }) {
  const panelRef   = useRef(null)
  const rect       = btnRef.current?.getBoundingClientRect()
  const panelWidth = 220
  const left       = rect ? rect.left + rect.width / 2 - panelWidth / 2 : 0
  const bottom     = rect ? window.innerHeight - rect.top + 12 : 0
  const notchLeft  = panelWidth / 2 - 5

  useEffect(() => {
    function handleClick(e) {
      if (!panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) {
        onCancel()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onCancel, btnRef])

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        position: 'fixed',
        bottom, left,
        width: panelWidth,
        zIndex: 200,
        transformOrigin: 'bottom center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{
        position: 'relative',
        background: '#1E1E1E',
        border: '1px solid #383838',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        padding: '8px 8px 8px 8px',
      }}>
        {/* Arrow notch at the bottom, pointing down toward the End button */}
        <div style={{
          position: 'absolute',
          bottom: -6, left: notchLeft,
          width: 10, height: 10,
          background: '#1E1E1E',
          border: '1px solid #383838',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRadius: '0 0 3px 0',
          transform: 'rotate(45deg)',
          zIndex: 2,
        }} />

        <button
          onClick={onLeave}
          style={{
            width: '100%', padding: '10px 0', marginBottom: 4,
            background: '#C0001A', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, color: '#FFFFFF',
            cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Leave meeting
        </button>


      </div>
    </motion.div>
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
      {/* Summary icon */}
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        <SummaryIcon size={16} />
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

function NetworkStatusIcon() {
  const [hovered, setHovered] = useState(false)
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine)

  useEffect(() => {
    function onOnline() { setIsOnline(true) }
    function onOffline() { setIsOnline(false) }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const tooltipText = isOnline
    ? 'Your network connection and CPU usage are good, allowing you to have the full experience.'
    : 'Your connection is limited or you appear offline. Reconnect for the best experience.'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isOnline ? '#4DB848' : '#F5A623'} style={{ cursor: 'default' }} aria-hidden>
        <path d="M1 20v-6h3v6zm4.75 0v-8h3v8zm4.75 0V9h3v11zm4.75 0V7h3v13zM20 20V4h3v16z"/>
      </svg>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1A1A1A',
              border: '1px solid #383838',
              borderRadius: 8,
              padding: '8px 12px',
              width: 300,
              fontSize: 12,
              fontWeight: 400,
              color: '#E9E9E9',
              fontFamily: "'Inter', system-ui, sans-serif",
              lineHeight: '18px',
              pointerEvents: 'none',
              whiteSpace: 'normal',
              zIndex: 100,
            }}
          >
            {tooltipText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — AIStatusIcon pulse
 *
 *    0ms   icon at opacity 0.55
 * 2000ms   opacity eases up to 1.0   (easeInOut)
 * 4000ms   opacity eases back to 0.55 (easeInOut, repeat)
 * ───────────────────────────────────────────────────────── */
function AIStatusIcon() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <motion.svg
        width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" strokeMiterlimit="10"
        animate={{ opacity: [0.15, 1, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ cursor: 'default' }}
      >
        <path d="M16 3h2.6A2.4 2.4 0 0 1 21 5.4v15.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 20.6V5.4A2.4 2.4 0 0 1 5.4 3H8M7 13h4m-4-3h10M7 16h2M8.8 1h6.4a.8.8 0 0 1 .8.8v2.4a.8.8 0 0 1-.8.8H8.8a.8.8 0 0 1-.8-.8V1.8a.8.8 0 0 1 .8-.8m5.506 12.776l-.377 1.508a.2.2 0 0 1-.145.145l-1.508.377c-.202.05-.202.338 0 .388l1.508.377a.2.2 0 0 1 .145.145l.377 1.508c.05.202.338.202.388 0l.377-1.508a.2.2 0 0 1 .145-.145l1.508-.377c.202-.05.202-.337 0-.388l-1.508-.377a.2.2 0 0 1-.145-.145l-.377-1.508c-.05-.202-.338-.202-.388 0"/>
      </motion.svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1A1A1A',
              border: '1px solid #383838',
              borderRadius: 8,
              padding: '8px 12px',
              width: 220,
              fontSize: 12,
              fontWeight: 400,
              color: '#E9E9E9',
              fontFamily: "'Inter', system-ui, sans-serif",
              lineHeight: '18px',
              pointerEvents: 'none',
              whiteSpace: 'normal',
              zIndex: 100,
            }}
          >
            AI Assistant is now transcribing and taking notes. All participants have been notified.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
