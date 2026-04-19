import { ConnectCalendarModal } from '../../../components/modals/ConnectCalendarModal'

export default {
  title: 'Modals/Connect Calendar',
  component: ConnectCalendarModal,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '100vh', background: '#111111' }}>
        <Story />
      </div>
    ),
  ],
}

export const Default = {
  args: { onClose: () => {}, onSave: () => {} },
}
