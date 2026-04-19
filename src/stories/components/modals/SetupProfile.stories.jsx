import { SetupProfileModal } from '../../../components/modals/SetupProfileModal'

export default {
  title: 'Modals/Setup Profile',
  component: SetupProfileModal,
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
