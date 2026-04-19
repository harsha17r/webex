import '../src/index.css'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { ProfileProvider } from '../src/context/ProfileContext'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement(
          ProfileProvider,
          null,
          React.createElement(
            'div',
            {
              style: {
                background: '#111111',
                minHeight: '100vh',
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#ffffff',
              },
            },
            React.createElement(Story)
          )
        )
      ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    layout: 'fullscreen',
  },
}

export default preview
