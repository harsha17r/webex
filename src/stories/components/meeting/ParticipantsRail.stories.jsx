import { ParticipantsRail } from '../../../components/meeting/ParticipantsRail'

export default {
  title: 'Meeting (SMB)/Participants Rail',
  component: ParticipantsRail,
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
