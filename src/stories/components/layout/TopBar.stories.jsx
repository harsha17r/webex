import { TopBar } from '../../../components/layout/TopBar'
import { useState } from 'react'

export default {
  title: 'Layout/Top Bar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ background: '#111111' }}>
        <Story />
      </div>
    ),
  ],
}

export const Default = {
  render: () => {
    const [aiOpen, setAiOpen] = useState(false)
    return (
      <TopBar
        aiPanelOpen={aiOpen}
        onToggleAI={() => setAiOpen((o) => !o)}
        onSetStatusClick={() => {}}
      />
    )
  },
}

export const AIOpen = {
  render: () => {
    const [aiOpen, setAiOpen] = useState(true)
    return (
      <TopBar
        aiPanelOpen={aiOpen}
        onToggleAI={() => setAiOpen((o) => !o)}
        onSetStatusClick={() => {}}
      />
    )
  },
}
