import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProfile } from '../../context/ProfileContext'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from '../../components/layout/Sidebar'
import { TopBar } from '../../components/layout/TopBar'
import { CiscoAIRail } from '../../components/layout/CiscoAIRail'
import { MeetingsTab } from './MeetingsTab'
import { MessagesTab } from './MessagesTab'
import { AppHubTab } from './AppHubTab'
import { OnboardingChecklist } from '../../components/OnboardingChecklist'
import { PreJoinModal } from '../meeting/PreJoinModal'
import { NotificationSettingsModal } from '../../components/modals/NotificationSettingsModal'
import { ConnectCalendarModal } from '../../components/modals/ConnectCalendarModal'
import { SetStatusModal } from '../../components/modals/SetStatusModal'

export function HomeScreen() {
  const [activeTab, setActiveTab]         = useState('meet')
  const [aiPanelOpen, setAiPanelOpen]     = useState(true)
  const [calendarConnected, setCalendar]  = useState(false)
  const [preJoinOpen, setPreJoinOpen]     = useState(false)
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const location = useLocation()
  const { updateProfile } = useProfile()
  const { fromMeeting = false, elapsed: meetingElapsed = 0, fromOnboarding = false } = location.state ?? {}

  // Always apply name + email coming from the onboarding flow
  // Reset checklist dismissed state on fresh onboarding entry
  useEffect(() => {
    const { name, email } = location.state ?? {}
    if (name || email) {
      updateProfile({ ...(name && { name }), ...(email && { email }) })
    }
    if (fromOnboarding) {
      localStorage.removeItem('webex_smb_checklist_dismissed')
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
        onSetStatusClick={() => setStatusModalOpen(true)}
      />

      {/* Body row: Sidebar + Content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar — paddingTop 13 so nav starts at y:76 (63 topbar + 13) */}
        <div style={{ paddingTop: 13, background: 'var(--bg-primary)', flexShrink: 0 }}>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onSettingsClick={() => setSettingsOpen(true)} />
        </div>

        {/* Content area: scrollable main + AI rail */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Main content + checklist wrapper — relative so checklist anchors here */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Scrollable tab content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'message' && <MessagesTab />}
              {activeTab === 'meet'    && <MeetingsTab calendarConnected={calendarConnected} onConnectCalendar={() => setCalendarModalOpen(true)} fromMeeting={fromMeeting} meetingElapsed={meetingElapsed} />}
              {activeTab === 'apphub'  && <AppHubTab />}
            </div>

            {/* Checklist — visually hidden on message tab to avoid overlapping compose */}
            <div style={activeTab === 'message' ? { position: 'absolute', visibility: 'hidden', pointerEvents: 'none' } : {}}>
              <OnboardingChecklist
                calendarConnected={calendarConnected}
                onCalendarConnect={() => setCalendar(true)}
                onTestCall={() => setPreJoinOpen(true)}
                fromMeeting={fromMeeting}
              />
            </div>
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

      <AnimatePresence>
        {preJoinOpen && <PreJoinModal onClose={() => setPreJoinOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {calendarModalOpen && (
          <ConnectCalendarModal
            onClose={() => setCalendarModalOpen(false)}
            onSave={() => setCalendar(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && <NotificationSettingsModal onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {statusModalOpen && (
          <SetStatusModal onClose={() => setStatusModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
