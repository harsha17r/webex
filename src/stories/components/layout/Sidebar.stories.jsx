import { Sidebar } from '../../../components/layout/Sidebar'
import { useState } from 'react'

export default {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '100vh', background: '#111111' }}>
        <Story />
        <div style={{ flex: 1, background: '#1E1E1E' }} />
      </div>
    ),
  ],
}

function SidebarWithState({ initialTab = 'message' }) {
  const [active, setActive] = useState(initialTab)
  return <Sidebar activeTab={active} onTabChange={setActive} onSettingsClick={() => {}} />
}

export const MessageActive = {
  render: () => <SidebarWithState initialTab="message" />,
}

export const MeetActive = {
  render: () => <SidebarWithState initialTab="meet" />,
}

export const CallActive = {
  render: () => <SidebarWithState initialTab="call" />,
}

export const TeamActive = {
  render: () => <SidebarWithState initialTab="team" />,
}

export const AppHubActive = {
  render: () => <SidebarWithState initialTab="apphub" />,
}
