import React from 'react'
import MessageEditor from './index'
import { jest } from '@jest/globals'

// Mock the customMessages utility
const mockCustomMessageUtils = {
  addMessage: jest.fn()
}

// Override the real import in stories
jest.mock('../../utils/customMessages', () => ({
  customMessageUtils: mockCustomMessageUtils
}))

export default {
  title: 'Navigation/Messages/MessageEditor',
  component: MessageEditor,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
MessageEditor is a comprehensive form component for creating custom Bible study messages. 
It provides a complete editing experience with validation, character limits, markdown support, 
and user feedback.

**Key Features:**
- Title and content input fields with validation
- Character counters with visual warnings
- Form validation with error states
- Save functionality with loading states
- Clear form with confirmation dialog
- Success/error feedback messages
- Full accessibility support
- Responsive design for all screen sizes
- Dark mode support

**Form Validation:**
- Title: 1-200 characters required
- Content: 1-5000 characters required
- Real-time validation with visual feedback
- Form submission blocked until valid

**User Experience:**
- Character counters turn orange at 90% capacity
- Clear confirmation prevents accidental data loss
- Auto-hide feedback messages after 5 seconds
- Disabled states during form submission
        `
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', padding: '2rem' }}>
        <Story />
      </div>
    )
  ]
}

export const Default = {
  name: 'Default Empty Form',
  render: () => {
    // Reset mocks for clean state
    mockCustomMessageUtils.addMessage.mockReset()
    return <MessageEditor />
  },
  parameters: {
    docs: {
      description: {
        story: 'The default empty state showing all form elements with proper labels and validation help.'
      }
    }
  }
}

export const WithContent = {
  name: 'Form with Sample Content',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    // Component with pre-filled content for demonstration
    return (
      <div>
        <MessageEditor />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simulate user input for demo
              setTimeout(() => {
                const titleInput = document.querySelector('#message-title')
                const contentTextarea = document.querySelector('#message-content')
                if (titleInput && contentTextarea) {
                  titleInput.value = 'Weekly Devotional: Faith and Trust'
                  titleInput.dispatchEvent(new Event('input', { bubbles: true }))
                  
                  contentTextarea.value = \`# Faith in Times of Uncertainty

When we face challenges, it's natural to feel overwhelmed. But remember:

**"Trust in the Lord with all your heart and lean not on your own understanding."** - Proverbs 3:5

## Key Points to Remember:

- *Faith* is not the absence of doubt, but action in spite of it
- **Trust** means letting go of our need to control everything  
- *Prayer* connects us to God's wisdom and peace

Take time today to reflect on where you need to trust God more deeply.\`
                  contentTextarea.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }, 100)
            `
          }}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Example with typical devotional content showing markdown formatting and character counts.
                This demonstrates how the form handles realistic content with formatting.`
      }
    }
  }
}

export const ApproachingLimits = {
  name: 'Character Limits Warning',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    return (
      <div>
        <MessageEditor />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simulate content approaching limits
              setTimeout(() => {
                const titleInput = document.querySelector('#message-title')
                const contentTextarea = document.querySelector('#message-content')
                if (titleInput && contentTextarea) {
                  // Title approaching 200 character limit (185 chars)
                  titleInput.value = 'This is a very long title that demonstrates the character warning system when approaching the 200 character limit and shows orange warning styling'
                  titleInput.dispatchEvent(new Event('input', { bubbles: true }))
                  
                  // Content approaching 5000 character limit
                  const longContent = \`# This is sample content to demonstrate character limits

This content is designed to show what happens when users approach the character limits in the MessageEditor component. The system provides visual warnings when users reach 90% of the allowed character count.

The character counter will turn orange and display a warning style to alert users that they're approaching the limit. This helps prevent users from losing content when they exceed the maximum allowed characters.

\` + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(150)
                  
                  contentTextarea.value = longContent.substring(0, 4500) // 90% of 5000
                  contentTextarea.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }, 100)
            `
          }}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the visual warning system when approaching character limits. 
                Character counters turn orange at 90% capacity to warn users.`
      }
    }
  }
}

export const FormValidation = {
  name: 'Form Validation States',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    return (
      <div>
        <MessageEditor />
        <p style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#6c757d'
        }}>
          <strong>Try these scenarios:</strong><br />
          • Leave both fields empty - see validation help<br />
          • Fill only title - save button remains disabled<br />
          • Fill both fields - save button becomes enabled<br />
          • Add content then click clear - see confirmation dialog
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Interactive example showing form validation states. The save button is disabled until both 
                title and content are provided, and validation help text guides users.`
      }
    }
  }
}

export const SuccessfulSave = {
  name: 'Successful Save Flow',
  render: () => {
    // Mock successful save
    mockCustomMessageUtils.addMessage.mockImplementation((message) => ({
      id: 'demo-id-123',
      title: message.title,
      content: message.content,
      timestamp: Date.now()
    }))
    
    return (
      <div>
        <MessageEditor />
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#155724'
        }}>
          <strong>Demo Setup:</strong> Add content and click save to see success feedback!
          The form will show a success message and clear automatically.
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstrates successful save flow with mocked utility function. 
                Shows success message and form clearing behavior.`
      }
    }
  }
}

export const ErrorState = {
  name: 'Save Error Handling',
  render: () => {
    // Mock failed save
    mockCustomMessageUtils.addMessage.mockImplementation(() => {
      throw new Error('Save failed - demo error')
    })
    
    return (
      <div>
        <MessageEditor />
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#721c24'
        }}>
          <strong>Demo Setup:</strong> This story simulates a save error.
          Add content and click save to see error feedback handling.
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstrates error handling when save operations fail. 
                Shows error feedback while preserving user content.`
      }
    }
  }
}

export const ClearConfirmation = {
  name: 'Clear Form Dialog',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    return (
      <div>
        <MessageEditor />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Pre-fill form to enable clear button
              setTimeout(() => {
                const titleInput = document.querySelector('#message-title')
                const contentTextarea = document.querySelector('#message-content')
                if (titleInput && contentTextarea) {
                  titleInput.value = 'Sample title to demonstrate clear functionality'
                  titleInput.dispatchEvent(new Event('input', { bubbles: true }))
                  contentTextarea.value = 'Sample content that will trigger the clear confirmation dialog.'
                  contentTextarea.dispatchEvent(new Event('input', { bubbles: true }))
                }
              }, 100)
            `
          }}
        />
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#fff3cd', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#856404'
        }}>
          <strong>Demo:</strong> Click the "Clear Form" button to see the confirmation dialog.
          This prevents accidental data loss.
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Shows the clear form confirmation dialog that prevents accidental data loss. 
                Users must confirm before clearing content.`
      }
    }
  }
}

export const ResponsiveDesign = {
  name: 'Responsive Layout Test',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Desktop View (Default)</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '0.5rem', padding: '1rem' }}>
            <MessageEditor />
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Tablet View (768px)</h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '0.5rem', 
            padding: '1rem',
            maxWidth: '768px',
            overflow: 'hidden'
          }}>
            <MessageEditor />
          </div>
        </div>
        
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Mobile View (480px)</h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '0.5rem', 
            padding: '0.5rem',
            maxWidth: '480px',
            overflow: 'hidden'
          }}>
            <MessageEditor />
          </div>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstrates responsive design across different screen sizes. 
                The layout adapts for mobile, tablet, and desktop viewing.`
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 'none', padding: '1rem' }}>
        <Story />
      </div>
    )
  ]
}

export const DarkModePreview = {
  name: 'Dark Mode Support',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    return (
      <div className="dark" style={{ 
        backgroundColor: '#1a202c', 
        padding: '2rem', 
        borderRadius: '0.5rem',
        minHeight: '600px'
      }}>
        <MessageEditor />
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#2d3748', 
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#adb5bd'
        }}>
          <strong>Dark Mode:</strong> The component automatically adapts to dark themes 
          with proper contrast ratios and themed styling.
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Shows the component in dark mode with proper theme styling. 
                Supports both system preference and explicit dark class.`
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '800px', padding: '0' }}>
        <Story />
      </div>
    )
  ]
}

export const AccessibilityDemo = {
  name: 'Accessibility Features',
  render: () => {
    mockCustomMessageUtils.addMessage.mockReset()
    
    return (
      <div>
        <MessageEditor />
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.6'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0066cc' }}>Accessibility Features</h4>
          <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#004499' }}>
            <li><strong>Semantic HTML:</strong> Form uses proper roles and labels</li>
            <li><strong>ARIA Support:</strong> Proper aria-describedby, aria-live regions</li>
            <li><strong>Keyboard Navigation:</strong> All interactive elements accessible via keyboard</li>
            <li><strong>Screen Reader:</strong> Hidden text provides context for assistive technology</li>
            <li><strong>Focus Management:</strong> Clear focus indicators and logical tab order</li>
            <li><strong>Error Handling:</strong> Validation messages announced to screen readers</li>
            <li><strong>Required Fields:</strong> Clearly marked with asterisks and labels</li>
            <li><strong>Modal Dialogs:</strong> Proper ARIA modal attributes and focus trapping</li>
          </ul>
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: `Comprehensive accessibility implementation following WCAG 2.1 guidelines. 
                The component is fully usable with keyboard navigation and screen readers.`
      }
    }
  }
}