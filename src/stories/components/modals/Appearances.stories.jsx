import { AppearancesModal } from '../../../components/modals/AppearancesModal'

export default {
  title: 'Modals/Appearances',
  component: AppearancesModal,
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
