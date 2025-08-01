import React from 'react'
import MessagesTab from './index'

export default {
  title: 'Navigation/MessagesTab',
  component: MessagesTab,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A placeholder component for the Custom Messages tab, showing the future structure and layout for message creation and library features.'
      }
    }
  }
}

// Default story showing the empty state
export const Default = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default empty state of the MessagesTab component showing placeholder areas for future sub-tabs.'
      }
    }
  }
}

// Story demonstrating responsive behavior
export const ResponsiveLayout = {
  args: {},
  parameters: {
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' } }
      },
      defaultViewport: 'mobile'
    },
    docs: {
      description: {
        story: 'MessagesTab component adapts to different screen sizes. Placeholder areas stack vertically on mobile devices.'
      }
    }
  }
}

// Story with dark mode preview
export const DarkModePreview = {
  args: {},
  decorators: [
    (Story) => (
      <div className="dark" style={{ backgroundColor: '#1a202c', minHeight: '100vh', padding: '1rem' }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'MessagesTab component with dark mode styling applied. Shows proper contrast and theme colors.'
      }
    }
  }
}

// Story showing the component in a constrained container
export const ConstrainedWidth = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px dashed #ccc', padding: '1rem' }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'MessagesTab component in a narrow container showing how it adapts to limited width spaces.'
      }
    }
  }
}

// Story for accessibility testing
export const AccessibilityFocus = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'MessagesTab component with focus on accessibility features. All elements are properly labeled and structured for screen readers.'
      }
    }
  },
  play: async ({ canvasElement }) => {
    // Focus testing can be added here in the future
    // This story serves as a template for accessibility testing
  }
}

// Story showing component structure for development
export const ComponentStructure = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ border: '2px solid #007bff', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '-1rem', 
          left: '1rem', 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '0.25rem 0.5rem', 
          fontSize: '0.75rem',
          borderRadius: '0.25rem'
        }}>
          messages-tab
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'MessagesTab component with visual boundary highlighting the main container for development reference.'
      }
    }
  }
}

// Future state preview (conceptual)
export const FutureStatePreview = {
  args: {},
  decorators: [
    (Story) => (
      <div>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          border: '1px solid #2196f3', 
          borderRadius: '0.25rem',
          padding: '0.75rem',
          margin: '0 0 1rem 0',
          fontSize: '0.875rem',
          color: '#1976d2'
        }}>
          <strong>📋 Future Implementation:</strong> This component will contain sub-tabs for "Create" (message editor) and "Library" (message management) features.
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'MessagesTab component showing current state with context about planned future features and sub-tab structure.'
      }
    }
  }
}

// Empty state focus story
export const EmptyStateFocus = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1rem', 
          fontSize: '0.875rem', 
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          Focusing on the empty state design and messaging
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'MessagesTab component highlighting the empty state design with clear messaging about upcoming features.'
      }
    }
  }
}