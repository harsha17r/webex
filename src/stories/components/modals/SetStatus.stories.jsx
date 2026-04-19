import { SetStatusModal } from '../../../components/modals/SetStatusModal'

export default {
  title: 'Modals/Set Status',
  component: SetStatusModal,
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
  args: { onClose: () => {} },
}
