import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProfile } from '../../context/ProfileContext'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from '../../components/layout/Sidebar'
import { TopBar } from '../../components/layout/TopBar'
import { CiscoAIRail } from '../../components/layout/CiscoAIRail'
import { MeetingsTab } from './MeetingsTab'
import { MessagesTab } from './MessagesTab'
import { OnboardingChecklist } from '../../components/OnboardingChecklist'

export function HomeScreen() {
  const [activeTab, setActiveTab]         = useState('meet')
  const [aiPanelOpen, setAiPanelOpen]     = useState(true)
  const [calendarConnected, setCalendar]  = useState(false)
  const location = useLocation()
  const { updateProfile } = useProfile()

  // Always apply name + email coming from the onboarding flow
  useEffect(() => {
    const { name, email } = location.state ?? {}
    if (name || email) {
      updateProfile({ ...(name && { name }), ...(email && { email }) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* TopBar — full width, height 63 */}
      <TopBar
        aiPanelOpen={aiPanelOpen}
        onToggleAI={() => setAiPanelOpen(v => !v)}
      />

      {/* Body row: Sidebar + Content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar — paddingTop 13 so nav starts at y:76 (63 topbar + 13) */}
        <div style={{ paddingTop: 13, background: 'var(--bg-primary)', flexShrink: 0 }}>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content area: scrollable main + AI rail */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Main content + checklist wrapper — relative so checklist anchors here */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Scrollable tab content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'message' && <MessagesTab />}
              {activeTab === 'meet'    && <MeetingsTab calendarConnected={calendarConnected} />}
            </div>

            {/* Checklist — persists across tab switches, anchored to content area only */}
            <OnboardingChecklist onCalendarConnect={() => setCalendar(true)} />
          </div>

          {/* AI Rail — slides in/out with spring */}
          <AnimatePresence>
            {aiPanelOpen && (
              <motion.div
                key="ai-rail"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 371, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                style={{ overflow: 'hidden', flexShrink: 0, height: '100%' }}
              >
                <CiscoAIRail onClose={() => setAiPanelOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
