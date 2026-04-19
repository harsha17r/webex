import { ChatRail } from '../../../components/meeting/ChatRail'

export default {
  title: 'Meeting (SMB)/Chat Rail',
  component: ChatRail,
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
