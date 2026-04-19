import { MeetingAIRail } from '../../../components/meeting/MeetingAIRail'

export default {
  title: 'Meeting (SMB)/AI Rail',
  component: MeetingAIRail,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '100vh', background: '#111111', justifyContent: 'flex-end' }}>
        <Story />
      </div>
    ),
  ],
}

export const Default = {}
