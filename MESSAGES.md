# Messages Module Development Guide

Complete guide for the Messages Module - custom message creation and management system. For complete architecture details, see [CLAUDE.md](./CLAUDE.md).

## Quick Start

### Import Messages Components
```javascript
// Clean imports from the messages module
import { MessagesTab, MessageLibrary, customMessageUtils } from '../messages'

// Or specific component imports
import MessagesTab from '../messages/components/MessagesTab'
import MessageLibrary from '../messages/components/MessageLibrary' 
import { customMessageUtils } from '../messages/utils/customMessages'
```

### Basic Usage
```javascript
// Add Messages tab to your application
<TabbedNavigation>
  <MessagesTab /> {/* Messages tab (💬) in main interface */}
</TabbedNavigation>

// Or use MessageLibrary standalone
<MessageLibrary />
```

## Module Architecture

### Folder Structure
```
src/messages/
├── components/                 # All UI components
│   ├── MessagesTab/           # Main messages tab
│   ├── SubTabs/               # Sub-tab navigation  
│   ├── MessageEditor/         # Message creation/editing
│   ├── MessageLibrary/        # Message management
│   ├── MessageCard/           # Individual message display
│   └── MessageEditModal/      # Modal editing interface
├── utils/                     # All utility functions
│   ├── customMessages.js      # CRUD operations
│   ├── markdownRenderer.js    # Markdown processing
│   └── broadcastChannel.js    # Cross-tab communication
└── index.js                   # Barrel exports
```

### Barrel Exports (`src/messages/index.js`)
```javascript
export { default as MessagesTab } from './components/MessagesTab'
export { default as MessageEditor } from './components/MessageEditor'
export { default as MessageLibrary } from './components/MessageLibrary'
export { default as MessageCard } from './components/MessageCard'
export { customMessageUtils } from './utils/customMessages'
export { markdownUtils } from './utils/markdownRenderer'
```

## Component API Reference

### MessagesTab Component
**Location**: `src/messages/components/MessagesTab/`
**Purpose**: Main container with tabbed interface for message management

```javascript
<MessagesTab />
```

**Features**:
- Two-tab interface: Create tab for new messages, Library tab for management
- Sub-tab navigation integration
- State management for active tab and message operations
- Complete integration with MessageEditor component

### MessageEditor Component  
**Location**: `src/messages/components/MessageEditor/`
**Purpose**: Comprehensive message creation and editing interface

```javascript
<MessageEditor />
```

**Features**:
- Form management with validation (title, content, tags)
- Real-time markdown preview
- CRUD operations via customMessages utility
- Responsive design and accessibility support
- User feedback and error handling

**Form Fields**:
- **Title**: Required text input with validation
- **Content**: Markdown textarea with preview toggle
- **Tags**: Comma-separated tags input

### MessageLibrary Component
**Location**: `src/messages/components/MessageLibrary/`
**Purpose**: Complete message management interface

```javascript
<MessageLibrary />
```

**Features**:
- **Display Integration**: Display buttons (📺) broadcast message selection for OBS overlay
- **Search and Filter**: Real-time search by title/content, tag-based filtering
- **Message Management**: Edit, delete, and organize custom messages
- **Modal Integration**: Seamless editing workflow with MessageEditModal
- **Responsive Design**: Mobile-optimized with adaptive grid layout

**Display Button Integration**:
- Messages can be displayed directly via Display buttons
- Integration with cross-tab broadcast system
- Visual feedback when messages are currently displayed
- Immediate OBS overlay display capability

### MessageCard Component
**Location**: `src/messages/components/MessageCard/`
**Purpose**: Individual message display with professional styling

```javascript
<MessageCard
  message={messageObject}
  onEdit={handleEdit}
  onDelete={handleDelete}
  isDisplayed={isCurrentlyDisplayed}
/>
```

**Props**:
- `message`: Message object with id, title, content, tags, dates
- `onEdit`: Callback for edit button functionality
- `onDelete`: Callback for delete button functionality  
- `isDisplayed`: Boolean indicating if message is currently displayed

**Features**:
- **Display Button Integration**: Display buttons (📺) with broadcast functionality
- **Professional Layout**: Clean card design with title, content preview, metadata
- **Visual Feedback**: Clear indication when messages are currently displayed
- **Content Management**: Show more/less for long content, date formatting
- **Interactive Elements**: Edit/delete buttons with accessibility features

### MessageEditModal Component
**Location**: `src/messages/components/MessageEditModal/`
**Purpose**: Modal interface for editing existing messages

```javascript
<MessageEditModal 
  message={messageToEdit}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSave={handleSaveMessage}
/>
```

**Props**:
- `message`: Message object to edit
- `isOpen`: Boolean controlling modal visibility
- `onClose`: Callback when modal is closed
- `onSave`: Callback when message is saved

**Features**:
- Full form editing with validation
- Markdown preview support
- Modal behavior with backdrop and keyboard handling
- Integration with customMessages utility

### SubTabs Component
**Location**: `src/messages/components/SubTabs/`
**Purpose**: Reusable sub-tab navigation

```javascript
<SubTabs
  activeTab="create"
  onTabChange={handleTabChange}
  tabs={[
    { id: 'create', label: 'Create', content: <MessageEditor /> },
    { id: 'library', label: 'Library', content: <MessageLibrary /> }
  ]}
/>
```

**Props**:
- `activeTab`: Currently active tab identifier
- `onTabChange`: Callback for tab switching
- `tabs`: Array of tab configurations

## Utility API Reference

### customMessages Utility
**Location**: `src/messages/utils/customMessages.js`
**Purpose**: Complete CRUD operations for custom messages

```javascript
import { customMessageUtils } from '../messages/utils/customMessages'

// Create message
const result = customMessageUtils.addMessage({
  title: 'Message Title',
  content: 'Markdown content here',
  tags: ['sermon', 'study']
})

// Get all messages
const messages = customMessageUtils.getMessages()

// Get specific message  
const message = customMessageUtils.getMessage(messageId)

// Update message
const updateResult = customMessageUtils.updateMessage(messageId, {
  title: 'Updated Title',
  content: 'Updated content'
})

// Delete message
const deleteResult = customMessageUtils.deleteMessage(messageId)

// Validation
const validation = customMessageUtils.validateMessage({
  title: 'Test',
  content: 'Content',
  tags: []
})
```

**Message Data Structure**:
```javascript
{
  id: 'unique-uuid',
  title: 'Message Title',
  content: 'Markdown content',
  tags: ['tag1', 'tag2'],
  createdAt: 1672531200000,
  updatedAt: 1672531200000
}
```

**Return Format**:
```javascript
{
  success: true,
  message: messageObject, // For successful operations
  error: 'Error message'  // For failed operations
}
```

### markdownRenderer Utility
**Location**: `src/messages/utils/markdownRenderer.js`
**Purpose**: Markdown processing with security validation

```javascript
import { markdownUtils } from '../messages/utils/markdownRenderer'

// Render to plain text
const plainText = markdownUtils.renderToPlainText('**Bold** text')
// Returns: "Bold text"

// Render to HTML (with XSS protection)
const html = markdownUtils.renderToHTML('**Bold** text')  
// Returns: "<p><strong>Bold</strong> text</p>"

// Validate content security
const validation = markdownUtils.validateMarkdown('Content here')
// Returns: { isValid: true, issues: [] }

// Performance info
const perfInfo = markdownUtils.getPerformanceInfo()
```

**Security Features**:
- Script tag detection and removal
- XSS prevention and content sanitization
- Content validation with security checking
- Performance monitoring for large content

### broadcastChannel Utility  
**Location**: `src/messages/utils/broadcastChannel.js`
**Purpose**: Cross-tab communication for message synchronization

```javascript
import { broadcastUtils } from '../messages/utils/broadcastChannel'

// Broadcast message selection
broadcastUtils.broadcastMessageSelection({
  type: 'message-selected',
  data: messageObject
})

// Subscribe to broadcasts
const unsubscribe = broadcastUtils.subscribe((message) => {
  if (message.type === 'message-selected') {
    console.log('Message selected:', message.data)
  }
})

// Cleanup
unsubscribe()
broadcastUtils.cleanup()
```

## Development Workflow

### Adding New Message Features

1. **Component Development**:
```javascript
// Create component in appropriate subfolder
src/messages/components/NewFeature/
├── index.jsx
├── NewFeature.css
├── NewFeature.test.jsx
└── NewFeature.stories.jsx
```

2. **Export from Module**:
```javascript
// Add to src/messages/index.js
export { default as NewFeature } from './components/NewFeature'
```

3. **Integration Testing**:
```javascript
// Test component integration
import { NewFeature } from '../messages'
```

### Message CRUD Examples

#### Creating Messages
```javascript
const handleCreateMessage = async (formData) => {
  const result = customMessageUtils.addMessage({
    title: formData.title,
    content: formData.content,
    tags: formData.tags.split(',').map(tag => tag.trim())
  })
  
  if (result.success) {
    console.log('Message created:', result.message.id)
    // Update UI, clear form, etc.
  } else {
    console.error('Failed to create message:', result.error)
  }
}
```

#### Updating Messages
```javascript
const handleUpdateMessage = (messageId, updates) => {
  const result = customMessageUtils.updateMessage(messageId, updates)
  
  if (result.success) {
    // Refresh message list
    setMessages(customMessageUtils.getMessages())
  }
}
```

#### Display Integration
```javascript
const handleDisplayMessage = (message) => {
  // Broadcast for OBS overlay
  broadcastUtils.broadcastMessageSelection({
    type: 'message-selected',
    data: message
  })
  
  // Update local state
  setCurrentlyDisplayed(message.id)
}
```

## Testing Messages Module

### Component Testing
```javascript
describe('MessageEditor', () => {
  test('validates required fields', async () => {
    render(<MessageEditor />)
    
    await userEvent.click(screen.getByText(/save/i))
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
  })

  test('handles markdown preview', async () => {
    render(<MessageEditor />)
    
    const textarea = screen.getByLabelText(/content/i)
    await userEvent.type(textarea, '**Bold**')
    
    await userEvent.click(screen.getByText(/preview/i))
    expect(screen.getByText('Bold')).toHaveStyle('font-weight: bold')
  })
})
```

### Utility Testing
```javascript
describe('customMessages', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('adds message with validation', () => {
    const message = {
      title: 'Test',
      content: 'Content',
      tags: ['test']
    }
    
    const result = customMessageUtils.addMessage(message)
    expect(result.success).toBe(true)
    expect(result.message).toHaveProperty('id')
  })
})
```

### Integration Testing
```javascript
describe('Messages Integration', () => {
  test('MessageLibrary displays MessageCards correctly', () => {
    // Create test messages
    customMessageUtils.addMessage({
      title: 'Test Message',
      content: 'Test content',
      tags: []
    })
    
    render(<MessageLibrary />)
    expect(screen.getByText('Test Message')).toBeInTheDocument()
  })
})
```

## Common Patterns

### Form Validation
```javascript
const validateForm = (data) => {
  const errors = {}
  
  if (!data.title?.trim()) {
    errors.title = 'Title is required'
  }
  
  if (!data.content?.trim()) {
    errors.content = 'Content is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
```

### Error Handling
```javascript
const handleSaveMessage = async (messageData) => {
  try {
    const result = customMessageUtils.addMessage(messageData)
    if (!result.success) {
      setError(result.error)
      return
    }
    
    setSuccess('Message saved successfully')
    clearForm()
  } catch (error) {
    console.error('Unexpected error:', error)
    setError('Something went wrong')
  }
}
```

### Cross-Tab Communication
```javascript
useEffect(() => {
  const unsubscribe = broadcastUtils.subscribe((message) => {
    if (message.type === 'message-selected') {
      setCurrentlyDisplayed(message.data.id)
    }
  })
  
  return unsubscribe
}, [])
```

## Display System Integration

### Phase 3 Achievements
The Messages Module has completed **Phase 3: Display Action Implementation** with:

- **Display Button Integration**: Professional Display buttons (📺) in MessageCard components
- **Broadcast System**: Messages broadcast selection to other tabs for OBS overlay
- **Visual Feedback**: Real-time indication when messages are currently displayed
- **localStorage Integration**: Custom messages saved as current content for display consumption
- **Cross-Tab Coordination**: Perfect synchronization across browser tabs

### Display Workflow
1. **Create Message**: Use MessageEditor to create custom message with markdown content
2. **Manage Library**: View and organize messages in MessageLibrary
3. **Display Message**: Click Display button (📺) to broadcast message selection
4. **OBS Integration**: Message appears in SelectedVerseDisplay component for overlay use
5. **Visual Feedback**: Display buttons show when messages are currently displayed

### Next Phase: Display Component Enhancement
Phase 4 will enhance the SelectedVerseDisplay component to:
- Independently render custom message content
- Complete the end-to-end workflow from creation to display
- Add comprehensive testing and final integration validation

## Quality Metrics

### Test Coverage
- **Total Tests**: 320+ tests across all Messages components and utilities
- **Component Tests**: 63-193 tests per major component
- **Utility Tests**: 22-65 tests per utility module
- **Success Rate**: 100% passing tests
- **Code Quality**: Zero ESLint errors or warnings

### Performance
- **Lazy Loading**: Components load on-demand
- **Efficient Rendering**: Optimized state management
- **Memory Management**: Proper cleanup and resource management
- **Cross-Tab Efficiency**: Minimal broadcast overhead

For complete Messages Module architecture and testing details, see [CLAUDE.md](./CLAUDE.md).