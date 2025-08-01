/**
 * Custom Messages Utility
 * Provides CRUD operations for custom markdown messages with localStorage persistence and cross-tab sync
 * Milestone 2: Added localStorage persistence and enhanced validation
 * Milestone 3: Added cross-tab synchronization via BroadcastChannel
 */

import { customMessageSyncUtils, MessageTypes } from './broadcastChannel.js'

// Constants for validation and storage
const STORAGE_KEY = 'obs-bible-custom-messages'
const STORAGE_VERSION = '1.0'
const MAX_TITLE_LENGTH = 200
const MIN_TITLE_LENGTH = 1
const MAX_CONTENT_LENGTH = 5000
const MIN_CONTENT_LENGTH = 1
const MAX_MESSAGES = 1000 // Prevent unlimited growth

// Generate UUID v4 for message IDs
const generateId = () => {
  return 'msg-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)
}

// localStorage wrapper with error handling
const storage = {
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        return { version: STORAGE_VERSION, messages: [], lastBackup: Date.now() }
      }
      
      const parsed = JSON.parse(data)
      
      // Handle version migration if needed
      if (!parsed.version || parsed.version !== STORAGE_VERSION) {
        console.warn('customMessages: Migrating storage from older version')
        return {
          version: STORAGE_VERSION,
          messages: Array.isArray(parsed) ? parsed : parsed.messages || [],
          lastBackup: Date.now()
        }
      }
      
      return parsed
    } catch (error) {
      console.error('customMessages: Failed to load from localStorage:', error)
      return { version: STORAGE_VERSION, messages: [], lastBackup: Date.now() }
    }
  },
  
  set: (data) => {
    try {
      const payload = {
        version: STORAGE_VERSION,
        messages: data,
        lastBackup: Date.now(),
        messageCount: data.length
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      return true
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('customMessages: localStorage quota exceeded. Consider clearing old messages.')
        // Try to clean up by removing oldest messages
        if (data.length > 10) {
          const reducedData = data.slice(-10) // Keep only 10 most recent
          try {
            const reducedPayload = {
              version: STORAGE_VERSION,
              messages: reducedData,
              lastBackup: Date.now(),
              messageCount: reducedData.length,
              autoReduced: true
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedPayload))
            console.warn('customMessages: Automatically reduced to 10 most recent messages due to storage limits')
            return true
          } catch (retryError) {
            console.error('customMessages: Failed to save even after reduction:', retryError)
          }
        }
      } else {
        console.error('customMessages: Failed to save to localStorage:', error)
      }
      return false
    }
  }
}

// Load messages from localStorage on module initialization
let messagesStore = storage.get().messages || []

// Flag to prevent infinite loops during cross-tab sync
let isSyncingFromBroadcast = false

// Cross-tab sync handlers
const handleBroadcastMessage = (message) => {
  if (isSyncingFromBroadcast) return // Prevent infinite loops
  
  isSyncingFromBroadcast = true
  
  try {
    switch (message.type) {
      case MessageTypes.MESSAGE_ADDED:
        handleRemoteMessageAdded(message.data)
        break
      case MessageTypes.MESSAGE_UPDATED:
        handleRemoteMessageUpdated(message.data)
        break
      case MessageTypes.MESSAGE_DELETED:
        handleRemoteMessageDeleted(message.data.id)
        break
      case MessageTypes.MESSAGES_CLEARED:
        handleRemoteMessagesCleared()
        break
    }
  } catch (error) {
    console.error('customMessages: Error handling broadcast message:', error)
  } finally {
    isSyncingFromBroadcast = false
  }
}

// Handle remote message addition (from other tabs)
const handleRemoteMessageAdded = (message) => {
  // Check if message already exists to prevent duplicates
  const existingIndex = messagesStore.findIndex(msg => msg.id === message.id)
  if (existingIndex === -1) {
    messagesStore.push(message)
    storage.set(messagesStore)
    dispatchCustomEvent('customMessagesUpdated', { type: 'added', message })
  }
}

// Handle remote message update (from other tabs)
const handleRemoteMessageUpdated = (updatedMessage) => {
  const messageIndex = messagesStore.findIndex(msg => msg.id === updatedMessage.id)
  if (messageIndex !== -1) {
    messagesStore[messageIndex] = updatedMessage
    storage.set(messagesStore)
    dispatchCustomEvent('customMessagesUpdated', { type: 'updated', message: updatedMessage })
  }
}

// Handle remote message deletion (from other tabs)
const handleRemoteMessageDeleted = (messageId) => {
  const initialLength = messagesStore.length
  messagesStore = messagesStore.filter(msg => msg.id !== messageId)
  if (messagesStore.length < initialLength) {
    storage.set(messagesStore)
    dispatchCustomEvent('customMessagesUpdated', { type: 'deleted', messageId })
  }
}

// Handle remote messages clearing (from other tabs)
const handleRemoteMessagesCleared = () => {
  if (messagesStore.length > 0) {
    messagesStore = []
    storage.set(messagesStore)
    dispatchCustomEvent('customMessagesUpdated', { type: 'cleared' })
  }
}

// Utility to dispatch custom events for UI updates
const dispatchCustomEvent = (eventName, detail) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }
}

// Initialize cross-tab sync
let unsubscribeFromBroadcast = null
if (typeof window !== 'undefined') {
  unsubscribeFromBroadcast = customMessageSyncUtils.subscribe(handleBroadcastMessage)
}

/**
 * Create a new custom message
 * @param {Object} messageData - The message data
 * @param {string} messageData.title - Message title (required)
 * @param {string} messageData.content - Message content (required)
 * @param {Array<string>} messageData.tags - Optional tags array
 * @returns {Object|null} Created message object or null if invalid
 */
const addMessage = (messageData) => {
  // Validation: Check required fields
  if (!messageData || typeof messageData !== 'object') {
    console.error('customMessages.addMessage: Invalid message data provided')
    return null
  }

  const { title, content, tags = [] } = messageData

  // Validate title
  if (!title || typeof title !== 'string') {
    console.error('customMessages.addMessage: Title is required and must be a string')
    return null
  }
  
  const trimmedTitle = title.trim()
  if (trimmedTitle.length < MIN_TITLE_LENGTH) {
    console.error(`customMessages.addMessage: Title must be at least ${MIN_TITLE_LENGTH} character(s)`)
    return null
  }
  
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    console.error(`customMessages.addMessage: Title must be no more than ${MAX_TITLE_LENGTH} characters`)
    return null
  }

  // Validate content  
  if (!content || typeof content !== 'string') {
    console.error('customMessages.addMessage: Content is required and must be a string')
    return null
  }
  
  const trimmedContent = content.trim()
  if (trimmedContent.length < MIN_CONTENT_LENGTH) {
    console.error(`customMessages.addMessage: Content must be at least ${MIN_CONTENT_LENGTH} character(s)`)
    return null
  }
  
  if (trimmedContent.length > MAX_CONTENT_LENGTH) {
    console.error(`customMessages.addMessage: Content must be no more than ${MAX_CONTENT_LENGTH} characters`)
    return null
  }

  // Validate tags if provided
  if (tags && !Array.isArray(tags)) {
    console.error('customMessages.addMessage: Tags must be an array')
    return null
  }

  // Check storage limits
  if (messagesStore.length >= MAX_MESSAGES) {
    console.error(`customMessages.addMessage: Maximum number of messages (${MAX_MESSAGES}) reached`)
    return null
  }

  // Generate unique ID with collision prevention
  let messageId
  let attempts = 0
  do {
    messageId = generateId()
    attempts++
    if (attempts > 10) {
      console.error('customMessages.addMessage: Failed to generate unique ID after 10 attempts')
      return null
    }
  } while (messagesStore.find(msg => msg.id === messageId))

  // Create message object
  const now = Date.now()
  const message = {
    id: messageId,
    type: 'custom',
    title: trimmedTitle,
    content: trimmedContent,
    tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0) : [],
    createdAt: now,
    updatedAt: now,
    usageCount: 0,
    lastUsed: null
  }

  // Add to store
  messagesStore.push(message)

  // Persist to localStorage
  const saved = storage.set(messagesStore)
  if (!saved) {
    // Remove from memory if localStorage failed
    messagesStore.pop()
    console.error('customMessages.addMessage: Failed to persist message to storage')
    return null
  }

  // Broadcast to other tabs (only if not syncing from broadcast to prevent loops)
  if (!isSyncingFromBroadcast) {
    customMessageSyncUtils.broadcastMessageAdded(message)
  }

  // Dispatch local event for UI updates
  dispatchCustomEvent('customMessagesUpdated', { type: 'added', message })

  return message
}

/**
 * Get all custom messages
 * @returns {Array} Array of all messages
 */
const getMessages = () => {
  // Return a copy to prevent external mutations
  return messagesStore.map(msg => ({ ...msg, tags: [...msg.tags] }))
}

/**
 * Update an existing message
 * @param {string} id - Message ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated message or null if not found
 */
const updateMessage = (id, updates) => {
  // Validation
  if (!id || typeof id !== 'string') {
    console.error('customMessages.updateMessage: Valid ID is required')
    return null
  }

  if (!updates || typeof updates !== 'object') {
    console.error('customMessages.updateMessage: Updates object is required')
    return null
  }

  // Find message
  const messageIndex = messagesStore.findIndex(msg => msg.id === id)
  if (messageIndex === -1) {
    console.error(`customMessages.updateMessage: Message with ID "${id}" not found`)
    return null
  }

  const message = messagesStore[messageIndex]
  const allowedUpdates = ['title', 'content', 'tags']
  const validUpdates = {}

  // Process valid updates with enhanced validation
  for (const key of allowedUpdates) {
    if (updates.hasOwnProperty(key)) {
      if (key === 'title') {
        if (typeof updates[key] === 'string') {
          const trimmedTitle = updates[key].trim()
          if (trimmedTitle.length >= MIN_TITLE_LENGTH && trimmedTitle.length <= MAX_TITLE_LENGTH) {
            validUpdates[key] = trimmedTitle
          }
        }
      } else if (key === 'content') {
        if (typeof updates[key] === 'string') {
          const trimmedContent = updates[key].trim()
          if (trimmedContent.length >= MIN_CONTENT_LENGTH && trimmedContent.length <= MAX_CONTENT_LENGTH) {
            validUpdates[key] = trimmedContent
          }
        }
      } else if (key === 'tags') {
        if (Array.isArray(updates[key])) {
          validUpdates[key] = updates[key].filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        }
      }
    }
  }

  // Apply updates
  const updatedMessage = {
    ...message,
    ...validUpdates,
    updatedAt: Date.now()
  }

  messagesStore[messageIndex] = updatedMessage

  // Persist to localStorage
  const saved = storage.set(messagesStore)
  if (!saved) {
    // Revert changes if save failed
    messagesStore[messageIndex] = message
    console.error('customMessages.updateMessage: Failed to persist changes to storage')
    return null
  }

  // Broadcast to other tabs (only if not syncing from broadcast to prevent loops)
  if (!isSyncingFromBroadcast) {
    customMessageSyncUtils.broadcastMessageUpdated(updatedMessage)
  }

  // Dispatch local event for UI updates
  dispatchCustomEvent('customMessagesUpdated', { type: 'updated', message: updatedMessage })

  return { ...updatedMessage, tags: [...updatedMessage.tags] }
}

/**
 * Delete a message
 * @param {string} id - Message ID
 * @returns {boolean} True if deleted, false if not found
 */
const deleteMessage = (id) => {
  // Validation
  if (!id || typeof id !== 'string') {
    console.error('customMessages.deleteMessage: Valid ID is required')
    return false
  }

  // Find and remove message
  const initialLength = messagesStore.length
  const deletedMessage = messagesStore.find(msg => msg.id === id)
  messagesStore = messagesStore.filter(msg => msg.id !== id)

  const wasDeleted = messagesStore.length < initialLength
  if (!wasDeleted) {
    console.error(`customMessages.deleteMessage: Message with ID "${id}" not found`)
    return false
  }

  // Persist to localStorage
  const saved = storage.set(messagesStore)
  if (!saved) {
    // Revert deletion if save failed
    messagesStore.push(deletedMessage)
    console.error('customMessages.deleteMessage: Failed to persist deletion to storage')
    return false
  }

  // Broadcast to other tabs (only if not syncing from broadcast to prevent loops)
  if (!isSyncingFromBroadcast) {
    customMessageSyncUtils.broadcastMessageDeleted(id)
  }

  // Dispatch local event for UI updates
  dispatchCustomEvent('customMessagesUpdated', { type: 'deleted', messageId: id })

  return wasDeleted
}

/**
 * Get a specific message by ID
 * @param {string} id - Message ID
 * @returns {Object|null} Message object or null if not found
 */
const getMessage = (id) => {
  if (!id || typeof id !== 'string') {
    return null
  }

  const message = messagesStore.find(msg => msg.id === id)
  return message ? { ...message, tags: [...message.tags] } : null
}

/**
 * Clear all messages (utility function for testing)
 * @returns {number} Number of messages cleared
 */
const clearMessages = () => {
  const count = messagesStore.length
  const backup = [...messagesStore]
  messagesStore = []
  
  // Persist to localStorage
  const saved = storage.set(messagesStore)
  if (!saved) {
    // Revert if save failed
    messagesStore = backup
    console.error('customMessages.clearMessages: Failed to persist changes to storage')
    return 0
  }
  
  // Broadcast to other tabs (only if not syncing from broadcast to prevent loops)
  if (!isSyncingFromBroadcast) {
    customMessageSyncUtils.broadcastMessagesCleared()
  }
  
  // Dispatch local event for UI updates
  dispatchCustomEvent('customMessagesUpdated', { type: 'cleared' })
  
  return count
}

/**
 * Get message count
 * @returns {number} Total number of messages
 */
const getMessageCount = () => {
  return messagesStore.length
}

/**
 * Get storage information
 * @returns {Object} Storage stats and limits
 */
const getStorageInfo = () => {
  const storageData = storage.get()
  return {
    messageCount: messagesStore.length,
    maxMessages: MAX_MESSAGES,
    version: STORAGE_VERSION,
    lastBackup: storageData.lastBackup,
    maxTitleLength: MAX_TITLE_LENGTH,
    maxContentLength: MAX_CONTENT_LENGTH,
    storageKey: STORAGE_KEY
  }
}

/**
 * Validate message data without creating
 * @param {Object} messageData - Message data to validate
 * @returns {Object} Validation result with errors
 */
const validateMessage = (messageData) => {
  const errors = []
  
  if (!messageData || typeof messageData !== 'object') {
    errors.push('Message data must be an object')
    return { valid: false, errors }
  }
  
  const { title, content, tags } = messageData
  
  // Validate title
  if (!title || typeof title !== 'string') {
    errors.push('Title is required and must be a string')
  } else {
    const trimmedTitle = title.trim()
    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${MIN_TITLE_LENGTH} character(s)`)
    }
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      errors.push(`Title must be no more than ${MAX_TITLE_LENGTH} characters`)
    }
  }
  
  // Validate content
  if (!content || typeof content !== 'string') {
    errors.push('Content is required and must be a string')
  } else {
    const trimmedContent = content.trim()
    if (trimmedContent.length < MIN_CONTENT_LENGTH) {
      errors.push(`Content must be at least ${MIN_CONTENT_LENGTH} character(s)`)
    }
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      errors.push(`Content must be no more than ${MAX_CONTENT_LENGTH} characters`)
    }
  }
  
  // Validate tags
  if (tags && !Array.isArray(tags)) {
    errors.push('Tags must be an array')
  }
  
  // Check storage limits
  if (messagesStore.length >= MAX_MESSAGES) {
    errors.push(`Maximum number of messages (${MAX_MESSAGES}) reached`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Cleanup cross-tab sync resources (for testing and module cleanup)
 */
const cleanup = () => {
  if (unsubscribeFromBroadcast) {
    unsubscribeFromBroadcast()
    unsubscribeFromBroadcast = null
  }
  customMessageSyncUtils.cleanup()
}

// Export utility object
export const customMessageUtils = {
  addMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  getMessage,
  clearMessages,
  getMessageCount,
  getStorageInfo,
  validateMessage,
  cleanup
}

// Default export for convenience
export default customMessageUtils