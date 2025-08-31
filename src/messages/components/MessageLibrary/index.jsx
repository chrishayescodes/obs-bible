import React, { useState, useEffect, useMemo } from 'react'
import { customMessageUtils } from '../../utils/customMessages.js'
import { markdownUtils } from '../../utils/markdownRenderer.js'
import { verseSyncUtils } from '../../utils/broadcastChannel.js'
import { verseHistoryUtils } from '../../../utils/verseHistory.js'
import MessageCard from '../MessageCard'
import MessageEditModal from '../MessageEditModal'
import './MessageLibrary.css'

const MessageLibrary = () => {
  const [messages, setMessages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingMessage, setEditingMessage] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentlyDisplayedMessage, setCurrentlyDisplayedMessage] = useState(null)

  const MESSAGES_PER_PAGE = 12

  // Load messages on mount and listen for updates
  useEffect(() => {
    loadMessages()
    checkCurrentlyDisplayedMessage()
    
    const handleMessagesUpdated = () => {
      loadMessages()
    }

    const handleCurrentVerseUpdated = (event) => {
      checkCurrentlyDisplayedMessage()
    }

    window.addEventListener('customMessagesUpdated', handleMessagesUpdated)
    window.addEventListener('currentVerseUpdated', handleCurrentVerseUpdated)
    
    return () => {
      window.removeEventListener('customMessagesUpdated', handleMessagesUpdated)
      window.removeEventListener('currentVerseUpdated', handleCurrentVerseUpdated)
    }
  }, [])

  const checkCurrentlyDisplayedMessage = () => {
    const current = verseHistoryUtils.getCurrentVerse()
    if (current && current.type === 'custom') {
      setCurrentlyDisplayedMessage(current.id)
    } else {
      setCurrentlyDisplayedMessage(null)
    }
  }

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      // Small delay to allow loading state to render
      await new Promise(resolve => setTimeout(resolve, 0))
      const allMessages = customMessageUtils.getMessages()
      setMessages(allMessages)
    } catch (error) {
      console.error('MessageLibrary: Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = messages.filter(message => 
        message.title.toLowerCase().includes(term) ||
        message.content.toLowerCase().includes(term) ||
        (message.tags && message.tags.some(tag => tag.toLowerCase().includes(term)))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // Handle date fields
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [messages, searchTerm, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMessages.length / MESSAGES_PER_PAGE)
  const paginatedMessages = useMemo(() => {
    const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE
    return filteredAndSortedMessages.slice(startIndex, startIndex + MESSAGES_PER_PAGE)
  }, [filteredAndSortedMessages, currentPage])

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleEditMessage = (message) => {
    setEditingMessage(message)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingMessage(null)
  }

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      const success = customMessageUtils.deleteMessage(messageId)
      if (success) {
        setSelectedMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }
    }
  }

  const handleDuplicateMessage = (message) => {
    const duplicatedMessage = {
      title: `${message.title} (Copy)`,
      content: message.content,
      tags: [...message.tags]
    }
    
    const newMessage = customMessageUtils.addMessage(duplicatedMessage)
    if (newMessage) {
      // Scroll to top to show the new message (assuming newest first)
      if (sortBy === 'createdAt' && sortOrder === 'desc') {
        setCurrentPage(1)
      }
    }
  }

  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedMessages.size === paginatedMessages.length) {
      setSelectedMessages(new Set())
    } else {
      setSelectedMessages(new Set(paginatedMessages.map(msg => msg.id)))
    }
  }

  const handleBulkDelete = () => {
    const selectedCount = selectedMessages.size
    if (selectedCount === 0) return

    const confirmMessage = `Are you sure you want to delete ${selectedCount} selected message${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`
    
    if (window.confirm(confirmMessage)) {
      let successCount = 0
      selectedMessages.forEach(messageId => {
        if (customMessageUtils.deleteMessage(messageId)) {
          successCount++
        }
      })
      
      setSelectedMessages(new Set())
      
      if (successCount !== selectedCount) {
        console.warn(`MessageLibrary: Only ${successCount} of ${selectedCount} messages were deleted`)
      }
    }
  }

  const handleDisplayMessage = (message) => {
    if (message) {
      verseSyncUtils.broadcastCustomMessageSelection(message)
      verseHistoryUtils.setCurrentVerse(message)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  if (isLoading) {
    return (
      <div className="message-library" role="main" aria-label="Message Library">
        <div className="message-library__loading" role="status" aria-live="polite">
          <span className="message-library__loading-spinner" aria-hidden="true"></span>
          <span className="message-library__loading-text">Loading messages...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="message-library" role="main" aria-label="Message Library">
      <div className="message-library__header">
        <div className="message-library__title-section">
          <h3 className="message-library__title">Message Library</h3>
          <span className="message-library__count" aria-live="polite">
            {filteredAndSortedMessages.length} message{filteredAndSortedMessages.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="message-library__controls">
          <div className="message-library__search">
            <label htmlFor="message-search" className="message-library__search-label">
              Search messages
            </label>
            <input
              type="search"
              id="message-search"
              className="message-library__search-input"
              placeholder="Search by title, content, or tags..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-describedby="search-help"
            />
            <div id="search-help" className="message-library__search-help">
              Search across message titles, content, and tags
            </div>
          </div>

          <div className="message-library__sort">
            <label htmlFor="sort-select" className="message-library__sort-label">
              Sort by
            </label>
            <select
              id="sort-select"
              className="message-library__sort-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="updatedAt-asc">Oldest Updated</option>
              <option value="createdAt-desc">Recently Created</option>
              <option value="createdAt-asc">Oldest Created</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {selectedMessages.size > 0 && (
        <div className="message-library__bulk-actions">
          <span className="message-library__selected-count">
            {selectedMessages.size} selected
          </span>
          <button
            type="button"
            className="message-library__bulk-delete"
            onClick={handleBulkDelete}
            aria-label={`Delete ${selectedMessages.size} selected messages`}
          >
            Delete Selected
          </button>
          <button
            type="button"
            className="message-library__clear-selection"
            onClick={() => setSelectedMessages(new Set())}
            aria-label="Clear selection"
          >
            Clear Selection
          </button>
        </div>
      )}

      {filteredAndSortedMessages.length === 0 ? (
        <div className="message-library__empty">
          {messages.length === 0 ? (
            <div className="message-library__empty-state">
              <span className="message-library__empty-icon" aria-hidden="true">📝</span>
              <h4 className="message-library__empty-title">No messages yet</h4>
              <p className="message-library__empty-description">
                Create your first message using the Create tab to get started.
              </p>
            </div>
          ) : (
            <div className="message-library__no-results">
              <span className="message-library__no-results-icon" aria-hidden="true">🔍</span>
              <h4 className="message-library__no-results-title">No messages found</h4>
              <p className="message-library__no-results-description">
                Try adjusting your search terms or clearing the search to see all messages.
              </p>
              <button
                type="button"
                className="message-library__clear-search"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="message-library__list-controls">
            <button
              type="button"
              className="message-library__select-all"
              onClick={handleSelectAll}
              aria-label={selectedMessages.size === paginatedMessages.length ? "Unselect all messages on this page" : "Select all messages on this page"}
            >
              {selectedMessages.size === paginatedMessages.length ? 'Unselect All' : 'Select All'}
            </button>
          </div>

          <div className="message-library__grid" role="list" aria-label="Messages">
            {paginatedMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                isSelected={selectedMessages.has(message.id)}
                isCurrentlyDisplayed={currentlyDisplayedMessage === message.id}
                onEdit={() => handleEditMessage(message)}
                onDelete={() => handleDeleteMessage(message.id)}
                onDuplicate={() => handleDuplicateMessage(message)}
                onSelect={() => handleSelectMessage(message.id)}
                onDisplay={handleDisplayMessage}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="message-library__pagination" role="navigation" aria-label="Pagination">
              <button
                type="button"
                className="message-library__pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                Previous
              </button>
              
              <span className="message-library__pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                type="button"
                className="message-library__pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showEditModal && editingMessage && (
        <MessageEditModal
          message={editingMessage}
          onClose={handleCloseEditModal}
          onSave={loadMessages}
        />
      )}
    </div>
  )
}

export default MessageLibrary