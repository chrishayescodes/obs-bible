# Testing Guide

Comprehensive testing strategy for the OSB Bible Application. For complete architecture details, see [CLAUDE.md](./CLAUDE.md).

## Quick Commands

```bash
# Run all tests
npm test

# Watch mode for development  
npm run test:watch

# Coverage report
npm run test:coverage

# Clear Jest cache (if test discovery issues)
npm test -- --clearCache
```

## Testing Architecture

### Test Statistics
- **Total Tests**: 500+ tests (all passing)
- **Component Tests**: 235 tests across all navigation components
- **Messages Module**: 320+ tests covering complete message system
- **Utility Tests**: 94 tests for utilities and hooks
- **Integration Tests**: 7 tests for cross-component integration

### Test Categories

#### 1. Component Unit Tests
Each component has comprehensive test coverage:
- Rendering and behavior validation
- User interactions and event handling  
- Edge cases and error conditions
- Accessibility features and keyboard navigation
- State management and prop changes

#### 2. Integration Tests
- Cross-component communication
- Hook-component integration
- Navigation lifecycle testing
- State synchronization across components

#### 3. Utility Testing
- localStorage functionality
- Data processing and validation
- Error handling and resilience
- Cross-tab communication

## Component Testing Examples

### Basic Component Test
```javascript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BibleBookSelector from './index'

describe('BibleBookSelector', () => {
  const mockBibleData = {
    old_testament: { books: [...] },
    new_testament: { books: [...] }
  }

  test('renders all Bible books correctly', () => {
    render(<BibleBookSelector bibleData={mockBibleData} />)
    expect(screen.getByText('Genesis')).toBeInTheDocument()
    expect(screen.getByText('Matthew')).toBeInTheDocument()
  })

  test('calls onBookSelect when book is clicked', async () => {
    const mockOnBookSelect = jest.fn()
    render(
      <BibleBookSelector 
        bibleData={mockBibleData} 
        onBookSelect={mockOnBookSelect} 
      />
    )
    
    await userEvent.click(screen.getByText('Genesis'))
    expect(mockOnBookSelect).toHaveBeenCalledWith(expect.objectContaining({
      title: 'THE FIRST BOOK OF MOSES CALLED GENESIS'
    }))
  })
})
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react'
import useVerseNavigation from './useVerseNavigation'

describe('useVerseNavigation', () => {
  const mockBibleData = { /* ... */ }

  test('manages navigation state correctly', () => {
    const { result } = renderHook(() => useVerseNavigation(mockBibleData))
    
    expect(result.current.selectedScripture).toBeNull()
    expect(result.current.verseData).toEqual({})
    expect(result.current.loadingVerses).toBe(false)
  })

  test('handles verse selection with proper callback', () => {
    const { result } = renderHook(() => useVerseNavigation(mockBibleData))
    
    act(() => {
      result.current.handleVerseSelected({
        book: 'Genesis',
        bookId: 'Gen', 
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1'
      })
    })
    
    expect(result.current.selectedScripture).toEqual({
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1', 
      verse: 1,
      reference: 'Genesis 1:1'
    })
  })
})
```

### Accessibility Testing
```javascript
test('has proper accessibility attributes', () => {
  render(<BibleBookSelector bibleData={mockBibleData} />)
  
  // Check ARIA labels
  expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Bible book selection')
  
  // Check keyboard navigation
  const firstBook = screen.getAllByRole('button')[0]
  expect(firstBook).toHaveAttribute('type', 'button')
  
  // Check screen reader content
  expect(screen.getByText('Old Testament')).toHaveClass('sr-only')
})
```

## Messages Module Testing

### Message Component Testing
```javascript
describe('MessageEditor', () => {
  test('validates form input correctly', async () => {
    render(<MessageEditor />)
    
    const titleInput = screen.getByLabelText(/title/i)
    const saveButton = screen.getByText(/save/i)
    
    // Test empty validation
    await userEvent.click(saveButton)
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    
    // Test successful input
    await userEvent.type(titleInput, 'Test Message')
    await userEvent.click(saveButton)
    expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument()
  })

  test('handles markdown preview correctly', async () => {
    render(<MessageEditor />)
    
    const contentTextarea = screen.getByLabelText(/content/i)
    await userEvent.type(contentTextarea, '**Bold text**')
    
    const previewButton = screen.getByText(/preview/i)
    await userEvent.click(previewButton)
    
    expect(screen.getByText('Bold text')).toHaveStyle('font-weight: bold')
  })
})
```

### Utility Testing Examples
```javascript
describe('customMessages utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('adds message with proper validation', () => {
    const message = {
      title: 'Test Message',
      content: 'Test content',
      tags: ['test']
    }
    
    const result = customMessageUtils.addMessage(message)
    expect(result.success).toBe(true)
    expect(result.message).toHaveProperty('id')
    expect(result.message).toHaveProperty('createdAt')
  })

  test('validates required fields', () => {
    const result = customMessageUtils.addMessage({ content: 'No title' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Title is required')
  })

  test('retrieves messages correctly', () => {
    customMessageUtils.addMessage({
      title: 'Test',
      content: 'Content', 
      tags: []
    })
    
    const messages = customMessageUtils.getMessages()
    expect(messages).toHaveLength(1)
    expect(messages[0].title).toBe('Test')
  })
})
```

## Integration Testing

### Navigation Integration
```javascript
describe('SearchHistory Integration', () => {
  test('integrates with useVerseNavigation hook', () => {
    const mockBibleData = { /* ... */ }
    const { result } = renderHook(() => useVerseNavigation(mockBibleData))
    
    render(
      <SearchHistory onVerseSelect={result.current.handleVerseSelected} />
    )
    
    // Test that history selections trigger navigation
    // Verify state changes in hook
    // Check cross-component communication
  })
})
```

### Cross-Tab Communication Testing
```javascript
describe('Cross-tab communication', () => {
  test('broadcasts verse selections correctly', () => {
    const mockCallback = jest.fn()
    verseSyncUtils.subscribe(mockCallback)
    
    verseSyncUtils.broadcastVerseSelection({
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1', 
      verse: 1,
      reference: 'Genesis 1:1'
    })
    
    expect(mockCallback).toHaveBeenCalledWith({
      type: 'verse-selected',
      data: expect.objectContaining({
        book: 'Genesis',
        reference: 'Genesis 1:1'
      })
    })
  })
})
```

## Testing Best Practices

### 1. Test Structure
```javascript
describe('ComponentName', () => {
  // Setup
  const defaultProps = { /* ... */ }
  
  beforeEach(() => {
    // Reset state
  })
  
  describe('rendering', () => {
    // Rendering tests
  })
  
  describe('user interactions', () => {
    // Interaction tests  
  })
  
  describe('edge cases', () => {
    // Error and edge case tests
  })
})
```

### 2. Mock Patterns
```javascript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mock' })
  })
)

// Mock BroadcastChannel
global.BroadcastChannel = jest.fn(() => ({
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn()
}))
```

### 3. Accessibility Testing
```javascript
// Screen reader content
expect(screen.getByText('Loading...')).toHaveClass('sr-only')

// ARIA attributes
expect(element).toHaveAttribute('aria-label', 'Expected label')
expect(element).toHaveAttribute('role', 'button')

// Keyboard navigation
await userEvent.tab()
expect(screen.getByText('Next Element')).toHaveFocus()
```

### 4. Async Testing
```javascript
test('loads data asynchronously', async () => {
  render(<Component />)
  
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
  
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})
```

## Common Test Patterns

### Component Props Testing
```javascript
test('handles missing props gracefully', () => {
  render(<Component />)
  expect(screen.getByText('Default state')).toBeInTheDocument()
})

test('updates when props change', () => {
  const { rerender } = render(<Component prop="initial" />)
  expect(screen.getByText('initial')).toBeInTheDocument()
  
  rerender(<Component prop="updated" />)
  expect(screen.getByText('updated')).toBeInTheDocument()
})
```

### Error Boundary Testing
```javascript
test('handles errors gracefully', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  
  render(<ComponentThatThrows />)
  
  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  consoleSpy.mockRestore()
})
```

### Local Storage Testing
```javascript
test('persists data to localStorage', () => {
  const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
  
  render(<Component />)
  userEvent.click(screen.getByText('Save'))
  
  expect(setItemSpy).toHaveBeenCalledWith('key', JSON.stringify(expectedData))
})
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/testSetup.js'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/stories/**'
  ]
}
```

### Test Setup (`src/testSetup.js`)
```javascript
import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}))

// Mock window.scrollTo
global.scrollTo = jest.fn()
```

### VS Code Configuration
For optimal Jest integration, ensure `.vscode/settings.json` contains:
```json
{
  "jest.jestCommandLine": "npm test",
  "jest.testExplorer.showClassicStatus": true,
  "jest.runMode": "on-demand"
}
```

## Debugging Tests

### Common Issues
1. **Test Discovery**: Clear Jest cache if tests don't appear
2. **Async Issues**: Use `waitFor` for async operations
3. **DOM Cleanup**: Tests should clean up after themselves
4. **Mock Leakage**: Reset mocks between tests

### Debug Commands
```bash
# Run specific test file
npm test -- BibleBookSelector.test.jsx

# Run tests in debug mode  
npm test -- --detectOpenHandles

# Run with coverage
npm test -- --coverage --watchAll=false
```

For complete testing architecture and component details, see [CLAUDE.md](./CLAUDE.md).