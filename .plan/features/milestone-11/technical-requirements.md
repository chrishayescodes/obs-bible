# Milestone 11: Technical Requirements

**Status**: ✅ Complete - Implementation Successful  
**Last Updated**: August 1, 2025

## Architecture Overview

### Core Principle: Independent Content Display
The system displays **either** Bible verses **OR** custom messages exclusively. No mixed content - messages appear as standalone content in the OBS overlay with the same professional quality as verses.

## Data Structures

### Current Message Storage Format
```javascript
// localStorage key: 'obs-bible-current-verse'
// Updated to handle both verses and custom messages
{
  // For custom messages
  type: 'custom',
  id: 'msg-uuid-12345',
  title: 'Weekly Announcement',
  content: 'Welcome to our service! Please silence phones.',
  displayText: 'Welcome to our service! Please silence phones.', // Rendered plaintext
  timestamp: 1691234567890,
  source: 'custom-messages'
}

// For Bible verses (existing format maintained)
{
  type: 'verse',
  book: 'Genesis',
  bookId: 'Gen',
  chapter: '1',
  verse: 1,
  reference: 'Genesis 1:1',
  timestamp: 1691234567890,
  source: 'bible-verses'
}
```

### Custom Message Object Structure
```javascript
// In customMessages utility
{
  id: 'msg-uuid-12345',           // Unique identifier
  title: 'Message Title',         // User-defined title
  content: 'Markdown content',    // Raw markdown content
  tags: ['announcement', 'prayer'], // User-defined tags
  createdAt: 1691234567890,       // Creation timestamp
  updatedAt: 1691234567890,       // Last modified timestamp
  displayCount: 3,                // Usage tracking
  lastDisplayed: 1691234567890    // Last display timestamp
}
```

## Component Architecture

### 1. MessageCard Component Enhancement

#### New Props:
```javascript
// Additional props for display functionality
{
  onDisplay: PropTypes.func,      // Callback for display action
  isCurrentlyDisplayed: PropTypes.bool, // Visual feedback
  displayLabel: PropTypes.string  // Customizable button text
}
```

#### Display Button Implementation:
```jsx
// Added to MessageCard action buttons
<button 
  type="button"
  className="message-card-display-btn"
  onClick={() => handleDisplayMessage(message)}
  aria-label={`Display message: ${message.title}`}
  disabled={isCurrentlyDisplayed}
>
  📺 {isCurrentlyDisplayed ? 'Currently Displayed' : 'Display'}
</button>
```

### 2. SelectedVerseDisplay Component Enhancement

#### Message Type Detection:
```javascript
// Enhanced useEffect for loading current content
useEffect(() => {
  const currentVerse = verseHistoryUtils.getCurrentVerse();
  
  if (currentVerse?.type === 'custom') {
    // Load custom message content
    setDisplayContent({
      type: 'custom',
      title: currentVerse.title,
      content: currentVerse.displayText,
      source: 'Custom Message'
    });
  } else if (currentVerse?.type === 'verse') {
    // Existing verse loading logic
    loadVerseContent(currentVerse);
  }
}, []);
```

#### Rendering Logic:
```javascript
// Conditional rendering based on content type
const renderContent = () => {
  if (displayContent?.type === 'custom') {
    return (
      <div className="custom-message-display">
        <div className="message-content">
          {displayContent.content}
        </div>
      </div>
    );
  } else {
    return (
      <div className="verse-display">
        {/* Existing verse rendering */}
      </div>
    );
  }
};
```

## Broadcast System Integration

### New Message Types
```javascript
// Added to broadcastChannel.js
export const MESSAGE_TYPES = {
  VERSE_SELECTED: 'verse-selected',
  VERSE_CLEARED: 'verse-cleared',
  CUSTOM_MESSAGE_SELECTED: 'custom-message-selected',  // NEW
  CUSTOM_MESSAGE_CLEARED: 'custom-message-cleared'     // NEW
};
```

### Custom Message Broadcasting
```javascript
// New broadcast functions
export const broadcastCustomMessageSelection = (messageData) => {
  const message = {
    type: MESSAGE_TYPES.CUSTOM_MESSAGE_SELECTED,
    data: {
      type: 'custom',
      id: messageData.id,
      title: messageData.title,
      displayText: markdownUtils.renderToPlainText(messageData.content),
      timestamp: Date.now(),
      source: 'custom-messages'
    },
    timestamp: Date.now(),
    origin: window.location.pathname
  };
  
  // Broadcast via BroadcastChannel
  if (broadcastChannel) {
    broadcastChannel.postMessage(message);
  }
  
  // Update localStorage for cross-tab compatibility
  verseHistoryUtils.setCurrentVerse(message.data);
};

export const broadcastCustomMessageClear = () => {
  const message = {
    type: MESSAGE_TYPES.CUSTOM_MESSAGE_CLEARED,
    data: null,
    timestamp: Date.now(),
    origin: window.location.pathname
  };
  
  if (broadcastChannel) {
    broadcastChannel.postMessage(message);
  }
  
  verseHistoryUtils.clearCurrentVerse();
};
```

## State Management Integration

### verseHistory Utility Enhancement
```javascript
// Enhanced to handle both verses and custom messages
export const setCurrentVerse = (contentData) => {
  try {
    // Validate content type
    if (!contentData?.type || !['verse', 'custom'].includes(contentData.type)) {
      throw new Error('Invalid content type');
    }
    
    const storageData = {
      ...contentData,
      timestamp: Date.now()
    };
    
    localStorage.setItem(CURRENT_VERSE_KEY, JSON.stringify(storageData));
    
    // Dispatch event for component updates
    window.dispatchEvent(new CustomEvent('currentVerseUpdated', {
      detail: storageData
    }));
  } catch (error) {
    console.error('Error setting current content:', error);
  }
};

export const getCurrentVerse = () => {
  try {
    const stored = localStorage.getItem(CURRENT_VERSE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate stored data structure
    if (!parsed.type || !['verse', 'custom'].includes(parsed.type)) {
      console.warn('Invalid stored content type, clearing');
      clearCurrentVerse();
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error getting current content:', error);
    return null;
  }
};
```

## Integration Points

### 1. MessageLibrary Integration
```javascript
// Enhanced MessageLibrary component
const MessageLibrary = () => {
  const [currentlyDisplayed, setCurrentlyDisplayed] = useState(null);
  
  // Listen for display updates
  useEffect(() => {
    const handleCurrentVerseUpdate = (event) => {
      const current = event.detail;
      if (current?.type === 'custom') {
        setCurrentlyDisplayed(current.id);
      } else {
        setCurrentlyDisplayed(null);
      }
    };
    
    window.addEventListener('currentVerseUpdated', handleCurrentVerseUpdate);
    return () => window.removeEventListener('currentVerseUpdated', handleCurrentVerseUpdate);
  }, []);
  
  const handleDisplayMessage = (message) => {
    // Broadcast message selection
    verseSyncUtils.broadcastCustomMessageSelection(message);
  };
  
  // Pass display state to MessageCard components
  return (
    <div className="message-library">
      {messages.map(message => (
        <MessageCard
          key={message.id}
          message={message}
          onDisplay={handleDisplayMessage}
          isCurrentlyDisplayed={currentlyDisplayed === message.id}
        />
      ))}
    </div>
  );
};
```

### 2. Cross-Tab Synchronization
```javascript
// Enhanced SelectedVerseDisplay subscription
useEffect(() => {
  const unsubscribe = verseSyncUtils.subscribe((message) => {
    if (message.type === 'custom-message-selected') {
      // Load custom message for display
      setDisplayContent({
        type: 'custom',
        title: message.data.title,
        content: message.data.displayText,
        source: 'Custom Message'
      });
      setLoading(false);
      setError(null);
    } else if (message.type === 'custom-message-cleared') {
      // Clear display
      setDisplayContent(null);
      setLoading(false);
      setError(null);
    }
    // Handle verse messages (existing logic)
  });
  
  return unsubscribe;
}, []);
```

## Performance Requirements

### Response Time Targets
- **Display Action**: < 50ms from click to broadcast
- **Cross-Tab Sync**: < 25ms propagation time
- **Content Rendering**: < 100ms for message display
- **Fade Transitions**: 300ms smooth animation

### Memory Management
- **Message Caching**: Limit cached messages to 50 most recent
- **Event Cleanup**: Proper cleanup of event listeners and broadcast channels
- **Storage Efficiency**: Compress large message content for localStorage

## Security Considerations

### Input Sanitization
```javascript
// Enhanced markdown rendering with XSS protection
export const renderToPlainText = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return '';
  
  // Remove script tags and potentially dangerous content
  const sanitized = markdown
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Convert to plain text for OBS display
  return sanitized
    .replace(/#{1,6}\s*/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\n\s*\n/g, '\n') // Normalize line breaks
    .trim();
};
```

### Storage Validation
```javascript
// Validate message data before storage
const validateMessageData = (messageData) => {
  const errors = [];
  
  if (!messageData.id || typeof messageData.id !== 'string') {
    errors.push('Invalid message ID');
  }
  
  if (!messageData.title || typeof messageData.title !== 'string' ||
      messageData.title.length > 100) {
    errors.push('Invalid message title');
  }
  
  if (!messageData.content || typeof messageData.content !== 'string' ||
      messageData.content.length > 5000) {
    errors.push('Invalid message content');
  }
  
  return errors;
};
```

## Error Handling Strategy

### Graceful Degradation
```javascript
// Error boundary for display component
class MessageDisplayErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Message display error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Display Error</h2>
          <p>Unable to display content. Please try again.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Network Failure Handling
```javascript
// Robust broadcast with fallback
const broadcastWithFallback = (message) => {
  try {
    // Primary: BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage(message);
    } else {
      throw new Error('BroadcastChannel unavailable');
    }
  } catch (error) {
    console.warn('BroadcastChannel failed, using localStorage fallback:', error);
    
    // Fallback: localStorage event
    try {
      localStorage.setItem('broadcast-fallback', JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'broadcast-fallback',
        newValue: JSON.stringify(message)
      }));
    } catch (fallbackError) {
      console.error('All broadcast methods failed:', fallbackError);
    }
  }
};
```

## Browser Compatibility

### Supported Features
- **BroadcastChannel API**: Primary cross-tab communication
- **localStorage**: Data persistence and fallback communication
- **CustomEvent**: Component communication
- **Promises/async-await**: Asynchronous operations

### Fallback Strategies
- **BroadcastChannel → localStorage events**: For older browsers
- **Modern JS → ES5 transpilation**: Via Babel
- **CSS Grid → Flexbox**: For layout compatibility

## Testing Requirements

### Unit Test Coverage
- **Component Rendering**: All message display components
- **Event Handling**: Display actions and cross-tab communication
- **Data Validation**: Input sanitization and storage validation
- **Error Handling**: All error scenarios and fallbacks

### Integration Test Scenarios
- **End-to-End Workflow**: Create → Display → Cross-tab sync
- **Content Switching**: Verse → Message → Verse transitions
- **Error Recovery**: Network failures and invalid data handling
- **Performance**: Response time and memory usage validation

---

**Implementation Status**: ✅ Complete  
**Technical Debt**: None identified  
**Performance**: All targets met  
**Security**: Input sanitization and validation implemented  
**Browser Support**: Full compatibility achieved