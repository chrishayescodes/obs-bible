import React from 'react'
import SubTabs from './index'

export default {
  title: 'Navigation/MessagesTab/SubTabs',
  component: SubTabs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sub-tab navigation component for the Messages tab, providing tabbed interface for Create and Library functionality with full keyboard navigation and accessibility support.'
      }
    }
  }
}

// Default story showing the sub-tabs
export const Default = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default sub-tabs with Create tab active by default, showing placeholder content for future MessageEditor integration.'
      }
    }
  }
}

// Story demonstrating tab switching
export const TabSwitching = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component demonstrating tab switching functionality. Click between Create and Library tabs to see content changes.'
      }
    }
  },
  play: async ({ canvasElement }) => {
    // This story demonstrates interactive tab switching
    // Users can click tabs to see the switching behavior
  }
}

// Story with focus on accessibility features
export const AccessibilityDemo = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component highlighting accessibility features including ARIA attributes, keyboard navigation (arrow keys, Home, End), and proper tabpanel relationships.'
      }
    }
  },
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
          <strong>🎯 Accessibility:</strong> Use Tab to focus, Arrow keys to navigate between tabs, Space/Enter to activate.
        </div>
        <Story />
      </div>
    )
  ]
}

// Story demonstrating keyboard navigation
export const KeyboardNavigation = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component demonstrating full keyboard navigation support with arrow keys, Home/End keys for first/last tab navigation.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ 
          backgroundColor: '#f3e5f5', 
          border: '1px solid #9c27b0', 
          borderRadius: '0.25rem',
          padding: '0.75rem',
          margin: '0 0 1rem 0',
          fontSize: '0.875rem',
          color: '#7b1fa2'
        }}>
          <strong>⌨️ Keyboard Controls:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            <li>←/→ Arrow keys: Navigate between tabs</li>
            <li>Home: Jump to first tab (Create)</li>
            <li>End: Jump to last tab (Library)</li>
            <li>Tab: Move focus in/out of tab group</li>
          </ul>
        </div>
        <Story />
      </div>
    )
  ]
}

// Story showing responsive behavior
export const ResponsiveDesign = {
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
        story: 'Sub-tabs component adapting to different screen sizes. On mobile, tabs show stacked icon/label layout with hover tooltips.'
      }
    }
  }
}

// Story with dark mode preview
export const DarkModePreview = {
  args: {},
  decorators: [
    (Story) => (
      <div className="dark" style={{ 
        backgroundColor: '#1a202c', 
        minHeight: '100vh', 
        padding: '1rem',
        color: '#ffffff'
      }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component with dark mode styling applied, showing proper contrast ratios and themed colors.'
      }
    }
  }
}

// Story showing placeholder content in detail
export const PlaceholderContent = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component focusing on placeholder content that explains future functionality for both Create and Library tabs.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1rem', 
          fontSize: '0.875rem', 
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          Both tabs show detailed placeholder content describing future functionality
        </div>
        <Story />
      </div>
    )
  ]
}

// Story showing constrained width behavior
export const ConstrainedWidth = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ 
        maxWidth: '500px', 
        margin: '0 auto', 
        border: '1px dashed #ccc', 
        padding: '1rem',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.875rem', 
          color: '#666', 
          marginBottom: '1rem' 
        }}>
          Constrained to 500px width
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component in a narrow container showing how it adapts to limited width spaces while maintaining usability.'
      }
    }
  }
}

// Story for development reference
export const ComponentStructure = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '-2rem', 
          left: '0', 
          right: '0',
          display: 'flex',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          <span style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #2196f3'
          }}>
            messages-sub-tabs
          </span>
          <span style={{ 
            backgroundColor: '#f3e5f5', 
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #9c27b0'
          }}>
            tablist + tabpanels
          </span>
          <span style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #4caf50'
          }}>
            keyboard accessible
          </span>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Story />
        </div>
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component with visual indicators showing the component structure and key features for development reference.'
      }
    }
  }
}

// Future integration preview
export const FutureIntegration = {
  args: {},
  decorators: [
    (Story) => (
      <div>
        <div style={{ 
          backgroundColor: '#fff3e0', 
          border: '1px solid #ff9800', 
          borderRadius: '0.25rem',
          padding: '1rem',
          margin: '0 0 1.5rem 0',
          fontSize: '0.875rem',
          color: '#e65100'
        }}>
          <strong>🚀 Milestone Progress:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <strong>✅ Milestone 6 Complete:</strong> Sub-tab navigation with Create/Library tabs
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <strong>🎯 Next:</strong> Milestone 7 - MessageEditor component integration into Create tab
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <strong>📋 Future:</strong> Phase 2 - MessageLibrary component integration into Library tab
          </div>
        </div>
        <Story />
      </div>
    )
  ],
  parameters: {
    docs: {
      description: {
        story: 'Sub-tabs component showing current milestone completion and future integration plans for MessageEditor and MessageLibrary components.'
      }
    }
  }
}