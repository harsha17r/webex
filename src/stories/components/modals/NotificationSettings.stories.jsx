import { NotificationSettingsModal } from '../../../components/modals/NotificationSettingsModal'

export default {
  title: 'Modals/Notification Settings',
  component: NotificationSettingsModal,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '100vh', background: '#111111' }}>
        <Story />
      </div>
    ),
  ],
}

export const General = {
  args: { onClose: () => {}, onSave: () => {}, initialNav: 'general' },
}

export const Notifications = {
  args: { onClose: () => {}, onSave: () => {}, initialNav: 'notifications' },
}
