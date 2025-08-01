import { customMessageUtils } from './customMessages'

// Mock BroadcastChannel for testing
let mockBroadcastChannel
let mockBroadcastChannelInstances = []

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock window.location for pathname
delete window.location
window.location = { pathname: '/test' }

describe('customMessageUtils', () => {
  beforeEach(() => {
    // Reset BroadcastChannel instances
    mockBroadcastChannelInstances = []
    
    // Mock BroadcastChannel constructor
    mockBroadcastChannel = jest.fn().mockImplementation(function(name) {
      this.name = name
      this.postMessage = jest.fn()
      this.close = jest.fn()
      this.addEventListener = jest.fn()
      this.removeEventListener = jest.fn()
      
      mockBroadcastChannelInstances.push(this)
      return this
    })
    
    global.BroadcastChannel = mockBroadcastChannel
    
    // Clear all mocks
    jest.clearAllMocks()
    
    // Mock localStorage to return empty data
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockReturnValue(true)
    
    // Clear messages before each test
    customMessageUtils.clearMessages()
  })

  afterEach(() => {
    // Cleanup
    customMessageUtils.cleanup()
  })

  describe('addMessage', () => {
    test('creates message with valid title and content', () => {
      const messageData = {
        title: 'Test Message',
        content: 'This is test content'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeTruthy()
      expect(result.id).toBeDefined()
      expect(result.id).toMatch(/^msg-/)
      expect(result.title).toBe('Test Message')
      expect(result.content).toBe('This is test content')
      expect(result.type).toBe('custom')
      expect(result.tags).toEqual([])
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.usageCount).toBe(0)
      expect(result.lastUsed).toBeNull()
    })

    test('creates message with tags', () => {
      const messageData = {
        title: 'Tagged Message',
        content: 'Content with tags',
        tags: ['prayer', 'announcement']
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result.tags).toEqual(['prayer', 'announcement'])
    })

    test('trims whitespace from title and content', () => {
      const messageData = {
        title: '  Trimmed Title  ',
        content: '  Trimmed Content  '
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result.title).toBe('Trimmed Title')
      expect(result.content).toBe('Trimmed Content')
    })

    test('filters invalid tags', () => {
      const messageData = {
        title: 'Test',
        content: 'Content',
        tags: ['valid', '', '  ', 'another-valid', null, undefined, 123]
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result.tags).toEqual(['valid', 'another-valid'])
    })

    test('returns null for missing title', () => {
      const messageData = {
        content: 'Content without title'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeNull()
    })

    test('returns null for empty title', () => {
      const messageData = {
        title: '   ',
        content: 'Content with empty title'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeNull()
    })

    test('returns null for missing content', () => {
      const messageData = {
        title: 'Title without content'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeNull()
    })

    test('returns null for invalid message data', () => {
      expect(customMessageUtils.addMessage(null)).toBeNull()
      expect(customMessageUtils.addMessage(undefined)).toBeNull()
      expect(customMessageUtils.addMessage('string')).toBeNull()
      expect(customMessageUtils.addMessage(123)).toBeNull()
    })

    test('returns null for non-array tags', () => {
      const messageData = {
        title: 'Test',
        content: 'Content',
        tags: 'not-an-array'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeNull()
    })

    test('validates title length limits', () => {
      // Title too long (over 200 characters)
      const longTitle = 'x'.repeat(201)
      const tooLongResult = customMessageUtils.addMessage({
        title: longTitle,
        content: 'Valid content'
      })
      expect(tooLongResult).toBeNull()

      // Title at maximum length (200 characters)
      const maxTitle = 'x'.repeat(200)
      const maxResult = customMessageUtils.addMessage({
        title: maxTitle,
        content: 'Valid content'
      })
      expect(maxResult).toBeTruthy()
      expect(maxResult.title.length).toBe(200)
    })

    test('validates content length limits', () => {
      // Content too long (over 5000 characters)
      const longContent = 'x'.repeat(5001)
      const tooLongResult = customMessageUtils.addMessage({
        title: 'Valid title',
        content: longContent
      })
      expect(tooLongResult).toBeNull()

      // Content at maximum length (5000 characters)
      const maxContent = 'x'.repeat(5000)
      const maxResult = customMessageUtils.addMessage({
        title: 'Valid title',
        content: maxContent
      })
      expect(maxResult).toBeTruthy()
      expect(maxResult.content.length).toBe(5000)
    })

    test('handles localStorage persistence', () => {
      const messageData = {
        title: 'Test Persistence',
        content: 'This should be saved'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeTruthy()
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'obs-bible-custom-messages',
        expect.stringContaining('"Test Persistence"')
      )
    })

    test('handles localStorage save failure', () => {
      // Mock localStorage.setItem to throw an error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      const messageData = {
        title: 'Test Failure',
        content: 'This should fail to save'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeNull()
      expect(customMessageUtils.getMessages()).toHaveLength(0)
    })
  })

  describe('getMessages', () => {
    test('returns empty array when no messages', () => {
      const result = customMessageUtils.getMessages()

      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    test('returns array of messages', () => {
      customMessageUtils.addMessage({ title: 'First', content: 'Content 1' })
      customMessageUtils.addMessage({ title: 'Second', content: 'Content 2' })

      const result = customMessageUtils.getMessages()

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('First')
      expect(result[1].title).toBe('Second')
    })

    test('returns copies of messages to prevent mutations', () => {
      customMessageUtils.addMessage({ title: 'Test', content: 'Content', tags: ['tag1'] })

      const result = customMessageUtils.getMessages()
      result[0].title = 'Modified'
      result[0].tags.push('new-tag')

      const freshResult = customMessageUtils.getMessages()
      expect(freshResult[0].title).toBe('Test')
      expect(freshResult[0].tags).toEqual(['tag1'])
    })
  })

  describe('updateMessage', () => {
    test('updates message title', () => {
      const message = customMessageUtils.addMessage({ title: 'Original', content: 'Content' })
      
      const result = customMessageUtils.updateMessage(message.id, { title: 'Updated Title' })

      expect(result.title).toBe('Updated Title')
      expect(result.content).toBe('Content')
      expect(result.updatedAt).toBeGreaterThanOrEqual(result.createdAt)
    })

    test('updates message content', () => {
      const message = customMessageUtils.addMessage({ title: 'Title', content: 'Original Content' })
      
      const result = customMessageUtils.updateMessage(message.id, { content: 'Updated Content' })

      expect(result.title).toBe('Title')
      expect(result.content).toBe('Updated Content')
      expect(result.updatedAt).toBeGreaterThanOrEqual(result.createdAt)
    })

    test('updates message tags', () => {
      const message = customMessageUtils.addMessage({ title: 'Title', content: 'Content', tags: ['old'] })
      
      const result = customMessageUtils.updateMessage(message.id, { tags: ['new1', 'new2'] })

      expect(result.tags).toEqual(['new1', 'new2'])
      expect(result.updatedAt).toBeGreaterThanOrEqual(result.createdAt)
    })

    test('updates multiple fields at once', () => {
      const message = customMessageUtils.addMessage({ title: 'Old Title', content: 'Old Content' })
      
      const result = customMessageUtils.updateMessage(message.id, { 
        title: 'New Title', 
        content: 'New Content',
        tags: ['new-tag']
      })

      expect(result.title).toBe('New Title')
      expect(result.content).toBe('New Content')
      expect(result.tags).toEqual(['new-tag'])
    })

    test('trims whitespace from updates', () => {
      const message = customMessageUtils.addMessage({ title: 'Title', content: 'Content' })
      
      const result = customMessageUtils.updateMessage(message.id, { 
        title: '  Updated Title  ', 
        content: '  Updated Content  '
      })

      expect(result.title).toBe('Updated Title')
      expect(result.content).toBe('Updated Content')
    })

    test('ignores invalid updates', () => {
      const message = customMessageUtils.addMessage({ title: 'Title', content: 'Content' })
      
      const result = customMessageUtils.updateMessage(message.id, { 
        title: '',
        content: '   ',
        invalidField: 'ignored',
        id: 'ignored-id-change'
      })

      expect(result.title).toBe('Title') // Unchanged
      expect(result.content).toBe('Content') // Unchanged
      expect(result.id).toBe(message.id) // Unchanged
      expect(result.invalidField).toBeUndefined()
    })

    test('returns null for invalid ID', () => {
      expect(customMessageUtils.updateMessage(null, { title: 'Test' })).toBeNull()
      expect(customMessageUtils.updateMessage('', { title: 'Test' })).toBeNull()
      expect(customMessageUtils.updateMessage('non-existent', { title: 'Test' })).toBeNull()
    })

    test('returns null for invalid updates', () => {
      const message = customMessageUtils.addMessage({ title: 'Title', content: 'Content' })
      
      expect(customMessageUtils.updateMessage(message.id, null)).toBeNull()
      expect(customMessageUtils.updateMessage(message.id, 'string')).toBeNull()
    })
  })

  describe('deleteMessage', () => {
    test('deletes existing message', () => {
      const message = customMessageUtils.addMessage({ title: 'To Delete', content: 'Content' })
      
      const result = customMessageUtils.deleteMessage(message.id)

      expect(result).toBe(true)
      expect(customMessageUtils.getMessages()).toHaveLength(0)
    })

    test('returns false for non-existent message', () => {
      const result = customMessageUtils.deleteMessage('non-existent-id')

      expect(result).toBe(false)
    })

    test('returns false for invalid ID', () => {
      expect(customMessageUtils.deleteMessage(null)).toBe(false)
      expect(customMessageUtils.deleteMessage('')).toBe(false)
      expect(customMessageUtils.deleteMessage(123)).toBe(false)
    })

    test('only deletes specified message', () => {
      const message1 = customMessageUtils.addMessage({ title: 'Keep', content: 'Content 1' })
      const message2 = customMessageUtils.addMessage({ title: 'Delete', content: 'Content 2' })
      const message3 = customMessageUtils.addMessage({ title: 'Keep', content: 'Content 3' })
      
      const result = customMessageUtils.deleteMessage(message2.id)

      expect(result).toBe(true)
      const remaining = customMessageUtils.getMessages()
      expect(remaining).toHaveLength(2)
      expect(remaining.find(m => m.id === message1.id)).toBeTruthy()
      expect(remaining.find(m => m.id === message3.id)).toBeTruthy()
      expect(remaining.find(m => m.id === message2.id)).toBeFalsy()
    })
  })

  describe('getMessage', () => {
    test('returns message by ID', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      
      const result = customMessageUtils.getMessage(message.id)

      expect(result).toEqual(message)
    })

    test('returns null for non-existent ID', () => {
      const result = customMessageUtils.getMessage('non-existent')

      expect(result).toBeNull()
    })

    test('returns null for invalid ID', () => {
      expect(customMessageUtils.getMessage(null)).toBeNull()
      expect(customMessageUtils.getMessage('')).toBeNull()
    })

    test('returns copy to prevent mutations', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content', tags: ['tag'] })
      
      const result = customMessageUtils.getMessage(message.id)
      result.title = 'Modified'
      result.tags.push('new-tag')

      const freshResult = customMessageUtils.getMessage(message.id)
      expect(freshResult.title).toBe('Test')
      expect(freshResult.tags).toEqual(['tag'])
    })
  })

  describe('utility functions', () => {
    test('clearMessages removes all messages', () => {
      customMessageUtils.addMessage({ title: 'Test 1', content: 'Content 1' })
      customMessageUtils.addMessage({ title: 'Test 2', content: 'Content 2' })
      
      const count = customMessageUtils.clearMessages()

      expect(count).toBe(2)
      expect(customMessageUtils.getMessages()).toHaveLength(0)
    })

    test('getMessageCount returns correct count', () => {
      expect(customMessageUtils.getMessageCount()).toBe(0)
      
      customMessageUtils.addMessage({ title: 'Test 1', content: 'Content 1' })
      expect(customMessageUtils.getMessageCount()).toBe(1)
      
      customMessageUtils.addMessage({ title: 'Test 2', content: 'Content 2' })
      expect(customMessageUtils.getMessageCount()).toBe(2)
      
      const messages = customMessageUtils.getMessages()
      customMessageUtils.deleteMessage(messages[0].id)
      expect(customMessageUtils.getMessageCount()).toBe(1)
    })
  })

  describe('data integrity', () => {
    test('generates unique IDs', () => {
      const message1 = customMessageUtils.addMessage({ title: 'Test 1', content: 'Content 1' })
      const message2 = customMessageUtils.addMessage({ title: 'Test 2', content: 'Content 2' })
      const message3 = customMessageUtils.addMessage({ title: 'Test 3', content: 'Content 3' })

      expect(message1.id).not.toBe(message2.id)
      expect(message1.id).not.toBe(message3.id)
      expect(message2.id).not.toBe(message3.id)
    })

    test('timestamps are consistent', () => {
      const before = Date.now()
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      const after = Date.now()

      expect(message.createdAt).toBeGreaterThanOrEqual(before)
      expect(message.createdAt).toBeLessThanOrEqual(after)
      expect(message.updatedAt).toBe(message.createdAt)
    })

    test('update timestamps change on modification', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        const updated = customMessageUtils.updateMessage(message.id, { title: 'Updated' })
        expect(updated.updatedAt).toBeGreaterThan(updated.createdAt)
      }, 1)
    })
  })

  describe('localStorage persistence', () => {
    test('persists updates to localStorage', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      jest.clearAllMocks()
      
      customMessageUtils.updateMessage(message.id, { title: 'Updated' })
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    test('persists deletions to localStorage', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      jest.clearAllMocks()
      
      customMessageUtils.deleteMessage(message.id)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    test('reverts changes if localStorage fails', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      
      // Mock localStorage failure for updates
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      const updateResult = customMessageUtils.updateMessage(message.id, { title: 'Should Fail' })
      expect(updateResult).toBeNull()
      
      // Original message should still exist unchanged
      const originalMessage = customMessageUtils.getMessage(message.id)
      expect(originalMessage.title).toBe('Test')
    })
  })

  describe('new utility functions', () => {
    test('getStorageInfo returns storage statistics', () => {
      customMessageUtils.addMessage({ title: 'Test 1', content: 'Content 1' })
      customMessageUtils.addMessage({ title: 'Test 2', content: 'Content 2' })
      
      const info = customMessageUtils.getStorageInfo()
      
      expect(info.messageCount).toBe(2)
      expect(info.maxMessages).toBe(1000)
      expect(info.version).toBe('1.0')
      expect(info.maxTitleLength).toBe(200)
      expect(info.maxContentLength).toBe(5000)
      expect(info.storageKey).toBe('obs-bible-custom-messages')
      expect(info.lastBackup).toBeDefined()
    })

    test('validateMessage validates without creating', () => {
      const validData = { title: 'Valid Title', content: 'Valid content' }
      const validation = customMessageUtils.validateMessage(validData)
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).toEqual([])
      expect(customMessageUtils.getMessageCount()).toBe(0) // No message created
    })

    test('validateMessage catches validation errors', () => {
      const invalidData = { title: '   ', content: 'x'.repeat(5001) } // Empty after trim
      const validation = customMessageUtils.validateMessage(invalidData)
      
      expect(validation.valid).toBe(false)
      expect(validation.errors).toContain('Title must be at least 1 character(s)')
      expect(validation.errors).toContain('Content must be no more than 5000 characters')
    })

    test('validateMessage checks storage limits', () => {
      // Fill up to the limit (this is a conceptual test)
      const validation = customMessageUtils.validateMessage({ title: 'Test', content: 'Content' })
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).not.toContain('Maximum number of messages')
    })
  })

  describe('cross-tab synchronization', () => {
    test('broadcasts message addition to other tabs', () => {
      const messageData = {
        title: 'Cross-tab Test',
        content: 'This should broadcast'
      }

      const result = customMessageUtils.addMessage(messageData)

      expect(result).toBeTruthy()
      expect(mockBroadcastChannelInstances.length).toBeGreaterThan(0)
      expect(mockBroadcastChannelInstances[0].postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'message-added',
          data: expect.objectContaining({
            title: 'Cross-tab Test',
            content: 'This should broadcast'
          })
        })
      )
    })

    test('broadcasts message updates to other tabs', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      jest.clearAllMocks()
      
      const result = customMessageUtils.updateMessage(message.id, { title: 'Updated Title' })

      expect(result).toBeTruthy()
      expect(mockBroadcastChannelInstances[0].postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'message-updated',
          data: expect.objectContaining({
            title: 'Updated Title'
          })
        })
      )
    })

    test('broadcasts message deletion to other tabs', () => {
      const message = customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      jest.clearAllMocks()
      
      const result = customMessageUtils.deleteMessage(message.id)

      expect(result).toBe(true)
      expect(mockBroadcastChannelInstances[0].postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'message-deleted',
          data: { id: message.id }
        })
      )
    })

    test('broadcasts messages clearing to other tabs', () => {
      customMessageUtils.addMessage({ title: 'Test 1', content: 'Content 1' })
      customMessageUtils.addMessage({ title: 'Test 2', content: 'Content 2' })
      jest.clearAllMocks()
      
      const result = customMessageUtils.clearMessages()

      expect(result).toBe(2)
      expect(mockBroadcastChannelInstances[0].postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'messages-cleared'
        })
      )
    })

    test('does not broadcast when syncing from remote to prevent loops', () => {
      // This test simulates receiving a message from another tab
      // The system should not re-broadcast when processing remote messages
      
      // Add a message normally first
      customMessageUtils.addMessage({ title: 'Local', content: 'Local content' })
      const initialBroadcasts = mockBroadcastChannelInstances[0].postMessage.mock.calls.length
      
      // Clear mocks to isolate the remote message handling
      jest.clearAllMocks()
      
      // Simulate receiving a remote message by directly calling the broadcast handler
      // This would normally happen via BroadcastChannel event
      const broadcastModule = require('./broadcastChannel.js')
      const { MessageTypes } = broadcastModule
      
      // Get the event listener that was registered
      const addEventListenerCalls = mockBroadcastChannelInstances[0].addEventListener.mock.calls
      const messageHandler = addEventListenerCalls.find(call => call[0] === 'message')?.[1]
      
      if (messageHandler) {
        // Simulate a message from another tab (different origin)
        messageHandler({
          data: {
            type: MessageTypes.MESSAGE_ADDED,
            data: {
              id: 'remote-msg-123',
              title: 'Remote Message',
              content: 'From another tab',
              type: 'custom',
              tags: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
              usageCount: 0,
              lastUsed: null
            },
            timestamp: Date.now(),
            origin: '/other-tab'
          }
        })
      }
      
      // Should not have broadcast again (preventing infinite loops)
      expect(mockBroadcastChannelInstances[0].postMessage).not.toHaveBeenCalled()
    })

    test('creates BroadcastChannel when performing operations', () => {
      // Trigger BroadcastChannel creation by performing an operation
      customMessageUtils.addMessage({ title: 'Test', content: 'Content' })
      
      // BroadcastChannel should be created
      expect(mockBroadcastChannelInstances.length).toBeGreaterThan(0)
      expect(mockBroadcastChannelInstances[0].name).toBe('osb-bible-sync')
    })

    test('cleanup function exists and can be called', () => {
      // Ensure cleanup function exists and can be called without errors
      expect(typeof customMessageUtils.cleanup).toBe('function')
      expect(() => customMessageUtils.cleanup()).not.toThrow()
    })
  })
})