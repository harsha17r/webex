import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../../context/ProfileContext'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — PreJoinModal
 *
 * ENTER:
 *    0ms   backdrop → opacity 0 → 1  (150ms)
 *    0ms   card     → opacity 0, scale 0.95 → 1  (spring)
 *
 * EXIT:
 *    0ms   backdrop → opacity 1 → 0  (150ms)
 *    0ms   card     → opacity 1 → 0, scale 0.97  (spring)
 *
 * DEVICE DROPDOWN:
 *    0ms   panel → opacity 0, y -4 → 1, y 0  (spring)
 * ───────────────────────────────────────────────────────── */

export function PreJoinModal({ onClose }) {
  const { profile }  = useProfile()
  const navigate     = useNavigate()
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)
  // Keep current device IDs in refs so async functions always read latest value
  const audioIdRef   = useRef('')
  const videoIdRef   = useRef('')
  const audioDropRef = useRef(null)
  const videoDropRef = useRef(null)

  const [micOn,             setMicOn]             = useState(true)
  const [cameraOn,          setCameraOn]           = useState(true)
  const [permDenied,        setPermDenied]         = useState(false)

  const [audioDevices,      setAudioDevices]       = useState([])
  const [videoDevices,      setVideoDevices]       = useState([])
  const [selectedAudioId,   setSelectedAudioId]    = useState('')
  const [selectedVideoId,   setSelectedVideoId]    = useState('')
  const [audioDropOpen,     setAudioDropOpen]      = useState(false)
  const [videoDropOpen,     setVideoDropOpen]      = useState(false)

  const [cancelHover,  setCancelHover]  = useState(false)
  const [startHover,   setStartHover]   = useState(false)
  const [bgHover,      setBgHover]      = useState(false)
  const [micHover,     setMicHover]     = useState(false)
  const [camHover,     setCamHover]     = useState(false)

  const initial = profile.name?.charAt(0).toUpperCase() || 'U'

  /* ── Start stream with specific device IDs ── */
  async function startStream(audioId = '', videoId = '') {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioId ? { deviceId: { exact: audioId } } : true,
        video: videoId ? { deviceId: { exact: videoId } } : true,
      })
      // Re-apply current mute states
      stream.getAudioTracks().forEach(t => { t.enabled = micOn })
      stream.getVideoTracks().forEach(t => { t.enabled = cameraOn })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      return stream
    } catch {
      setPermDenied(true)
      return null
    }
  }

  /* ── Initial mount: start stream + enumerate devices ── */
  useEffect(() => {
    async function init() {
      const stream = await startStream()
      if (!stream) return
      const devices   = await navigator.mediaDevices.enumerateDevices()
      const audioList = devices.filter(d => d.kind === 'audioinput'  && d.deviceId)
      const videoList = devices.filter(d => d.kind === 'videoinput'  && d.deviceId)
      setAudioDevices(audioList)
      setVideoDevices(videoList)
      // Mark the active device as selected
      const activeAudio = stream.getAudioTracks()[0]
      const activeVideo = stream.getVideoTracks()[0]
      const matchAudio  = audioList.find(d => activeAudio?.label && d.label === activeAudio.label)
      const matchVideo  = videoList.find(d => activeVideo?.label && d.label === activeVideo.label)
      const aid = matchAudio?.deviceId || audioList[0]?.deviceId || ''
      const vid = matchVideo?.deviceId || videoList[0]?.deviceId || ''
      setSelectedAudioId(aid); audioIdRef.current = aid
      setSelectedVideoId(vid); videoIdRef.current = vid
    }
    init()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!audioDropOpen && !videoDropOpen) return
    function handleMouseDown(e) {
      if (audioDropOpen && audioDropRef.current && !audioDropRef.current.contains(e.target)) {
        setAudioDropOpen(false)
      }
      if (videoDropOpen && videoDropRef.current && !videoDropRef.current.contains(e.target)) {
        setVideoDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [audioDropOpen, videoDropOpen])

  /* ── Switch audio device ── */
  async function switchAudio(deviceId) {
    audioIdRef.current = deviceId
    setSelectedAudioId(deviceId)
    setAudioDropOpen(false)
    await startStream(deviceId, videoIdRef.current)
  }

  /* ── Switch video device ── */
  async function switchVideo(deviceId) {
    videoIdRef.current = deviceId
    setSelectedVideoId(deviceId)
    setVideoDropOpen(false)
    await startStream(audioIdRef.current, deviceId)
  }

  /* ── Toggle mic ── */
  function toggleMic() {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setMicOn(v => !v)
  }

  /* ── Toggle camera ── */
  function toggleCamera() {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setCameraOn(v => !v)
  }

  function handleClose() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    onClose()
  }

  function handleStart() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    navigate('/meeting', { state: { micOn, cameraOn } })
    onClose()
  }

  /* ── Label helpers ── */
  function cleanLabel(label) {
    return label?.replace(/\s*\(.*?\)\s*/g, '').trim() || 'Unknown device'
  }
  const audioLabel = cleanLabel(audioDevices.find(d => d.deviceId === selectedAudioId)?.label) || 'Default microphone'
  const videoLabel = cleanLabel(videoDevices.find(d => d.deviceId === selectedVideoId)?.label) || 'Default camera'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.72)',
        zIndex: 1100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 720,
          background: '#111111',
          border: '1px solid #737373',
          borderRadius: 12,
          padding: 32,
          display: 'flex', flexDirection: 'column', gap: 32,
          boxSizing: 'border-box',
        }}
      >
        {/* ── Top section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 500 }}>
              <span style={{ fontSize: 12, fontWeight: 400, color: '#AAAAAA', lineHeight: '16px' }}>
                Moderated unmuted mode
              </span>
              <span style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', lineHeight: '28px' }}>
                {profile.name} - Test call
              </span>
            </div>
            <div
              onMouseEnter={e => { e.currentTarget.style.background = '#333333'; e.currentTarget.style.borderColor = '#555555' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#3A3A3A' }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#222222', border: '1px solid #3A3A3A', borderRadius: 8,
                padding: '0 16px', height: 40,
                cursor: 'pointer', boxSizing: 'border-box',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              {/* MDI cast — same as TopBar Connect */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
                <path fill="#FFFFFF" d="M1 10v2a9 9 0 0 1 9 9h2c0-6.08-4.93-11-11-11m0 4v2a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7m0 4v3h3a3 3 0 0 0-3-3M21 3H3c-1.11 0-2 .89-2 2v3h2V5h18v14h-7v2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#E9E9E9' }}>Connect to a device</span>
            </div>
          </div>

          {/* ── Video preview ── */}
          <div style={{
            position: 'relative', width: '100%', height: 421,
            borderRadius: 8, overflow: 'hidden',
            background: cameraOn && !permDenied ? '#141414' : '#1E1E1E',
            transition: 'background 0.25s',
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
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12,
              opacity: cameraOn && !permDenied ? 0 : 1,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: '#333333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 30, fontWeight: 600, color: '#FFFFFF', userSelect: 'none',
              }}>
                {initial}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#AAAAAA' }}>
                {permDenied ? 'Camera access denied' : profile.name}
              </span>
            </div>

            {/* Mic + Camera toggles */}
            <div style={{
              position: 'absolute', bottom: 16,
              left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <button
                onClick={toggleMic}
                onMouseEnter={() => setMicHover(true)}
                onMouseLeave={() => setMicHover(false)}
                title={micOn ? 'Mute' : 'Unmute'}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: micOn ? (micHover ? 'rgba(80,80,80,0.95)' : 'rgba(34,34,34,0.9)') : '#C93D3D',
                  border: micOn ? '1px solid #494949' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transform: micHover ? 'scale(1.08)' : 'scale(1)',
                  transition: 'background 0.15s, transform 0.12s',
                  boxSizing: 'border-box',
                }}
              >
                {micOn ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="7" y="2" width="6" height="10" rx="3" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M4 9.5c0 3.314 2.686 5 6 5s6-1.686 6-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 14.5V17.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="7" y="2" width="6" height="10" rx="3" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M4 9.5c0 3.314 2.686 5 6 5s6-1.686 6-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 14.5V17.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M3 3L17 17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              <button
                onClick={toggleCamera}
                onMouseEnter={() => setCamHover(true)}
                onMouseLeave={() => setCamHover(false)}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: cameraOn ? (camHover ? 'rgba(80,80,80,0.95)' : 'rgba(34,34,34,0.9)') : '#C93D3D',
                  border: cameraOn ? '1px solid #494949' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transform: camHover ? 'scale(1.08)' : 'scale(1)',
                  transition: 'background 0.15s, transform 0.12s',
                  boxSizing: 'border-box',
                }}
              >
                {cameraOn ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="5" width="11" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M13 8.5L18 6V14L13 11.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="5" width="11" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M13 8.5L18 6V14L13 11.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 2L18 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Background button */}
            <button
              onMouseEnter={() => setBgHover(true)}
              onMouseLeave={() => setBgHover(false)}
              style={{
                position: 'absolute', bottom: 16, right: 16,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 16px', height: 48,
                background: bgHover ? 'rgba(50,50,50,0.98)' : 'rgba(34,34,34,0.9)',
                border: '1px solid #737373', borderRadius: 9999,
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="16" height="13" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
                <path d="M2 12l4-3.5 3 2.5 4-5 5 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>Background</span>
            </button>
          </div>

          {/* ── Device selectors ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 17 }}>

            {/* Audio dropdown */}
            <div ref={audioDropRef} onMouseLeave={() => setAudioDropOpen(false)} style={{ flex: 1, position: 'relative' }}>
              <div
                onClick={() => { setAudioDropOpen(v => !v); setVideoDropOpen(false) }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 4, padding: '0 16px', height: 48,
                  background: audioDropOpen ? '#2A2A2A' : '#222222',
                  border: `1px solid ${audioDropOpen ? '#737373' : '#494949'}`,
                  borderRadius: audioDropOpen ? '8px 8px 0 0' : 8,
                  cursor: 'pointer', boxSizing: 'border-box',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="7" y="2" width="6" height="10" rx="3" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M4 9.5c0 3.314 2.686 5 6 5s6-1.686 6-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 14.5V17.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#AAAAAA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {audioLabel}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: audioDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                  <path d="M4 6L8 10L12 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <AnimatePresence>
                {audioDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: '#2A2A2A',
                      border: '1px solid #737373', borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      overflow: 'hidden',
                    }}
                  >
                    {audioDevices.map(d => (
                      <DeviceOption
                        key={d.deviceId}
                        label={cleanLabel(d.label)}
                        selected={d.deviceId === selectedAudioId}
                        onClick={() => switchAudio(d.deviceId)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Video dropdown */}
            <div ref={videoDropRef} onMouseLeave={() => setVideoDropOpen(false)} style={{ flex: 1, position: 'relative' }}>
              <div
                onClick={() => { setVideoDropOpen(v => !v); setAudioDropOpen(false) }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 4, padding: '0 16px', height: 48,
                  background: videoDropOpen ? '#2A2A2A' : '#222222',
                  border: `1px solid ${videoDropOpen ? '#737373' : '#494949'}`,
                  borderRadius: videoDropOpen ? '8px 8px 0 0' : 8,
                  cursor: 'pointer', boxSizing: 'border-box',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                    <rect x="2" y="5" width="11" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M13 8.5L18 6V14L13 11.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#AAAAAA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {videoLabel}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: videoDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                  <path d="M4 6L8 10L12 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <AnimatePresence>
                {videoDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: '#2A2A2A',
                      border: '1px solid #737373', borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      overflow: 'hidden',
                    }}
                  >
                    {videoDevices.map(d => (
                      <DeviceOption
                        key={d.deviceId}
                        label={cleanLabel(d.label)}
                        selected={d.deviceId === selectedVideoId}
                        onClick={() => switchVideo(d.deviceId)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleClose}
            onMouseEnter={() => setCancelHover(true)}
            onMouseLeave={() => setCancelHover(false)}
            style={{
              width: 84, height: 48,
              background: cancelHover ? '#5A5A5A' : '#494949',
              border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'background 0.15s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            onMouseEnter={() => setStartHover(true)}
            onMouseLeave={() => setStartHover(false)}
            style={{
              width: 160, height: 48,
              background: startHover ? '#2BAB7E' : '#1D8160',
              border: 'none', borderRadius: 9999,
              fontSize: 14, fontWeight: 500, color: '#FFFFFF',
              cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
              transition: 'background 0.15s',
            }}
          >
            Start meeting
          </button>
        </div>

      </motion.div>
    </motion.div>
  )
}

/* ── Device option row ── */
function DeviceOption({ label, selected, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', gap: 12,
        background: hovered ? '#333333' : 'transparent',
        cursor: 'pointer', transition: 'background 0.12s',
      }}
    >
      <span style={{
        fontSize: 12, fontWeight: selected ? 500 : 400,
        color: selected ? '#FFFFFF' : '#CCCCCC',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 7l3.5 3.5L12 3" stroke="#2BAB7E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  )
}
