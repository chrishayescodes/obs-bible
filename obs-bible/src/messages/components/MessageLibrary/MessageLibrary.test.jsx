import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageLibrary from './index.jsx'
import { customMessageUtils } from '../../utils/customMessages.js'
import { verseSyncUtils } from '../../utils/broadcastChannel.js'
import { verseHistoryUtils } from '../../../utils/verseHistory.js'

// Mock the customMessages utility
jest.mock('../../utils/customMessages.js', () => ({
  customMessageUtils: {
    getMessages: jest.fn(),
    deleteMessage: jest.fn(),
    addMessage: jest.fn(),
    updateMessage: jest.fn()
  }
}))

// Mock the broadcast channel utility
jest.mock('../../utils/broadcastChannel.js', () => ({
  verseSyncUtils: {
    broadcastCustomMessageSelection: jest.fn(),
    broadcastCustomMessageClear: jest.fn()
  }
}))

// Mock the verse history utility
jest.mock('../../../utils/verseHistory.js', () => ({
  verseHistoryUtils: {
    getCurrentVerse: jest.fn(),
    setCurrentVerse: jest.fn(),
    clearCurrentVerse: jest.fn()
  }
}))

// Mock child components
jest.mock('../MessageCard', () => {
  return function MockMessageCard({ message, onEdit, onDelete, onDuplicate, onSelect, onDisplay, isSelected, isCurrentlyDisplayed }) {
    return (
      <div data-testid={`message-card-${message.id}`}>
        <h4>{message.title}</h4>
        <p>{message.content}</p>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(message.id)}
          data-testid={`select-${message.id}`}
        />
        <button onClick={() => onEdit(message)} data-testid={`edit-${message.id}`}>Edit</button>
        <button onClick={() => onDelete(message.id)} data-testid={`delete-${message.id}`}>Delete</button>
        <button onClick={() => onDuplicate(message)} data-testid={`duplicate-${message.id}`}>Duplicate</button>
        <button 
          onClick={() => onDisplay && onDisplay(message)} 
          data-testid={`display-${message.id}`}
        >
          {isCurrentlyDisplayed ? 'Displayed' : 'Display'}
        </button>
      </div>
    )
  }
})

jest.mock('../MessageEditModal', () => {
  return function MockMessageEditModal({ message, onClose, onSave }) {
    return (
      <div data-testid="message-edit-modal">
        <h2>Edit Message: {message.title}</h2>
        <button onClick={onClose} data-testid="modal-close">Close</button>
        <button onClick={() => onSave(message)} data-testid="modal-save">Save</button>
      </div>
    )
  }
})

// Mock window.confirm
const mockConfirm = jest.fn()
window.confirm = mockConfirm

// Mock window event listeners but allow real addEventListener for testing
const originalAddEventListener = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

const mockAddEventListener = jest.fn((event, handler) => {
  originalAddEventListener.call(window, event, handler)
})
const mockRemoveEventListener = jest.fn((event, handler) => {
  originalRemoveEventListener.call(window, event, handler)
})

beforeEach(() => {
  jest.clearAllMocks()
  mockConfirm.mockReturnValue(true)
  
  window.addEventListener = mockAddEventListener
  window.removeEventListener = mockRemoveEventListener
})

afterEach(() => {
  window.addEventListener = originalAddEventListener
  window.removeEventListener = originalRemoveEventListener
})

const mockMessages = [
  {
    id: 'msg-1',
    title: 'Test Message 1',
    content: 'This is the first test message content',
    tags: ['study', 'prayer'],
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86400000,
    usageCount: 0,
    lastUsed: null
  },
  {
    id: 'msg-2',
    title: 'Another Message',
    content: 'This is another test message with different content',
    tags: ['devotion'],
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 3600000, // 1 hour ago
    usageCount: 2,
    lastUsed: Date.now() - 1800000 // 30 minutes ago
  },
  {
    id: 'msg-3',
    title: 'Third Message',
    content: 'Yet another message for testing purposes',
    tags: [],
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 259200000,
    usageCount: 1,
    lastUsed: Date.now() - 86400000 // 1 day ago
  }
]

describe('MessageLibrary', () => {
  beforeEach(() => {
    customMessageUtils.getMessages.mockReturnValue(mockMessages)
  })

  describe('Rendering', () => {
    test('renders loading state initially', () => {
      render(<MessageLibrary />)
      
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading messages...')).toBeInTheDocument()
    })

    test('renders empty state when no messages exist', async () => {
      customMessageUtils.getMessages.mockReturnValue([])
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('No messages yet')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Create your first message using the Create tab to get started.')).toBeInTheDocument()
    })

    test('renders messages when they exist', async () => {
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('3 messages')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      expect(screen.getByTestId('message-card-msg-2')).toBeInTheDocument()
      expect(screen.getByTestId('message-card-msg-3')).toBeInTheDocument()
    })

    test('renders correct message count in header', async () => {
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('3 messages')).toBeInTheDocument()
      })
    })

    test('renders singular message count correctly', async () => {
      customMessageUtils.getMessages.mockReturnValue([mockMessages[0]])
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('1 message')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    test('filters messages by title', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByLabelText('Search messages')
      await user.type(searchInput, 'Another')
      
      await waitFor(() => {
        expect(screen.getByText('2 messages')).toBeInTheDocument()
      })
      
      // Should match both msg-2 (title: "Another Message") and msg-3 (content: "Yet another message")
      expect(screen.getByTestId('message-card-msg-2')).toBeInTheDocument()
      expect(screen.getByTestId('message-card-msg-3')).toBeInTheDocument()
      expect(screen.queryByTestId('message-card-msg-1')).not.toBeInTheDocument()
    })

    test('filters messages by content', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByLabelText('Search messages')
      await user.type(searchInput, 'different content')
      
      await waitFor(() => {
        expect(screen.getByText('1 message')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('message-card-msg-2')).toBeInTheDocument()
    })

    test('filters messages by tags', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByLabelText('Search messages')
      await user.type(searchInput, 'devotion')
      
      await waitFor(() => {
        expect(screen.getByText('1 message')).toBeInTheDocument()
      })
      
      expect(screen.getByTestId('message-card-msg-2')).toBeInTheDocument()
    })

    test('shows no results state when search yields no matches', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByLabelText('Search messages')
      await user.type(searchInput, 'nonexistent')
      
      await waitFor(() => {
        expect(screen.getByText('No messages found')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Try adjusting your search terms or clearing the search to see all messages.')).toBeInTheDocument()
    })

    test('clear search button works', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByLabelText('Search messages')
      await user.type(searchInput, 'nonexistent')
      
      await waitFor(() => {
        expect(screen.getByText('No messages found')).toBeInTheDocument()
      })
      
      const clearButton = screen.getByText('Clear Search')
      await user.click(clearButton)
      
      await waitFor(() => {
        expect(screen.getByText('3 messages')).toBeInTheDocument()
      })
    })
  })

  describe('Sorting Functionality', () => {
    test('sorts by recently updated by default', async () => {
      render(<MessageLibrary />)
      
      // Wait for component to finish loading
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      // Then check the sort select value
      const sortSelect = screen.getByLabelText('Sort by')
      expect(sortSelect.value).toBe('updatedAt-desc')
    })

    test('can change sort order', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const sortSelect = screen.getByLabelText('Sort by')
      await user.selectOptions(sortSelect, 'title-asc')
      
      await waitFor(() => {
        expect(sortSelect.value).toBe('title-asc')
      })
    })
  })

  describe('Message Actions', () => {
    test('opens edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const editButton = screen.getByTestId('edit-msg-1')
      await user.click(editButton)
      
      expect(screen.getByTestId('message-edit-modal')).toBeInTheDocument()
      expect(screen.getByText('Edit Message: Test Message 1')).toBeInTheDocument()
    })

    test('closes edit modal when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const editButton = screen.getByTestId('edit-msg-1')
      await user.click(editButton)
      
      expect(screen.getByTestId('message-edit-modal')).toBeInTheDocument()
      
      const closeButton = screen.getByTestId('modal-close')
      await user.click(closeButton)
      
      expect(screen.queryByTestId('message-edit-modal')).not.toBeInTheDocument()
    })

    test('deletes message with confirmation', async () => {
      const user = userEvent.setup()
      customMessageUtils.deleteMessage.mockReturnValue(true)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const deleteButton = screen.getByTestId('delete-msg-1')
      await user.click(deleteButton)
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this message? This action cannot be undone.'
      )
      expect(customMessageUtils.deleteMessage).toHaveBeenCalledWith('msg-1')
    })

    test('does not delete message if confirmation is cancelled', async () => {
      const user = userEvent.setup()
      mockConfirm.mockReturnValue(false)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const deleteButton = screen.getByTestId('delete-msg-1')
      await user.click(deleteButton)
      
      expect(mockConfirm).toHaveBeenCalled()
      expect(customMessageUtils.deleteMessage).not.toHaveBeenCalled()
    })

    test('duplicates message', async () => {
      const user = userEvent.setup()
      const duplicatedMessage = { id: 'msg-4', title: 'Test Message 1 (Copy)' }
      customMessageUtils.addMessage.mockReturnValue(duplicatedMessage)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const duplicateButton = screen.getByTestId('duplicate-msg-1')
      await user.click(duplicateButton)
      
      expect(customMessageUtils.addMessage).toHaveBeenCalledWith({
        title: 'Test Message 1 (Copy)',
        content: 'This is the first test message content',
        tags: ['study', 'prayer']
      })
    })
  })

  describe('Selection and Bulk Actions', () => {
    test('can select individual messages', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const checkbox = screen.getByTestId('select-msg-1')
      await user.click(checkbox)
      
      expect(checkbox).toBeChecked()
      expect(screen.getByText('1 selected')).toBeInTheDocument()
    })

    test('can select all messages', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      const selectAllButton = screen.getByText('Select All')
      await user.click(selectAllButton)
      
      expect(screen.getByText('3 selected')).toBeInTheDocument()
      expect(screen.getByText('Unselect All')).toBeInTheDocument()
    })

    test('can unselect all messages', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      // First select all
      const selectAllButton = screen.getByText('Select All')
      await user.click(selectAllButton)
      
      expect(screen.getByText('3 selected')).toBeInTheDocument()
      
      // Then unselect all
      const unselectAllButton = screen.getByText('Unselect All')
      await user.click(unselectAllButton)
      
      expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
    })

    test('can bulk delete selected messages', async () => {
      const user = userEvent.setup()
      customMessageUtils.deleteMessage.mockReturnValue(true)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      // Select first two messages
      await user.click(screen.getByTestId('select-msg-1'))
      await user.click(screen.getByTestId('select-msg-2'))
      
      expect(screen.getByText('2 selected')).toBeInTheDocument()
      
      const bulkDeleteButton = screen.getByText('Delete Selected')
      await user.click(bulkDeleteButton)
      
      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete 2 selected messages? This action cannot be undone.'
      )
      expect(customMessageUtils.deleteMessage).toHaveBeenCalledTimes(2)
    })

    test('can clear selection', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      // Select a message
      await user.click(screen.getByTestId('select-msg-1'))
      expect(screen.getByText('1 selected')).toBeInTheDocument()
      
      // Clear selection
      const clearButton = screen.getByText('Clear Selection')
      await user.click(clearButton)
      
      expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    const manyMessages = Array.from({ length: 25 }, (_, i) => ({
      id: `msg-${i + 1}`,
      title: `Message ${i + 1}`,
      content: `Content for message ${i + 1}`,
      tags: [],
      createdAt: Date.now() - (i * 1000),
      updatedAt: Date.now() - (i * 1000),
      usageCount: 0,
      lastUsed: null
    }))

    test('shows pagination when there are many messages', async () => {
      customMessageUtils.getMessages.mockReturnValue(manyMessages)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('25 messages')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    test('can navigate to next page', async () => {
      const user = userEvent.setup()
      customMessageUtils.getMessages.mockReturnValue(manyMessages)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })
      
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    })

    test('can navigate to previous page', async () => {
      const user = userEvent.setup()
      customMessageUtils.getMessages.mockReturnValue(manyMessages)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })
      
      // Go to page 2 first
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
      
      // Then go back to page 1
      const prevButton = screen.getByText('Previous')
      await user.click(prevButton)
      
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    })

    test('disables navigation buttons appropriately', async () => {
      customMessageUtils.getMessages.mockReturnValue(manyMessages)
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
      })
      
      // Previous should be disabled on first page
      expect(screen.getByText('Previous')).toBeDisabled()
      expect(screen.getByText('Next')).not.toBeDisabled()
    })
  })

  describe('Event Listeners', () => {
    test('sets up event listener for message updates', () => {
      render(<MessageLibrary />)
      
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'customMessagesUpdated',
        expect.any(Function)
      )
    })

    test('cleans up event listener on unmount', () => {
      const { unmount } = render(<MessageLibrary />)
      
      unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'customMessagesUpdated',
        expect.any(Function)
      )
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      render(<MessageLibrary />)
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('message-card-msg-1')).toBeInTheDocument()
      })
      
      expect(screen.getByLabelText('Search messages')).toBeInTheDocument()
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument()
    })

    test('announces loading state to screen readers', () => {
      render(<MessageLibrary />)
      
      const loadingStatus = screen.getByRole('status')
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite')
    })

    test('announces message count changes', async () => {
      render(<MessageLibrary />)
      
      await waitFor(() => {
        const messageCount = screen.getByText('3 messages')
        expect(messageCount).toHaveAttribute('aria-live', 'polite')
      })
    })
  })

  describe('Display Functionality', () => {
    test('renders display buttons for all messages', async () => {
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toBeInTheDocument()
        expect(screen.getByTestId('display-msg-2')).toBeInTheDocument()
        expect(screen.getByTestId('display-msg-3')).toBeInTheDocument()
      })
    })

    test('display button calls handleDisplayMessage when clicked', async () => {
      const user = userEvent.setup()
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-2')).toBeInTheDocument()
      })
      
      const displayButton = screen.getByTestId('display-msg-2')
      await user.click(displayButton)
      
      // msg-2 should be first in sorted order (most recently updated)
      expect(verseSyncUtils.broadcastCustomMessageSelection).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'msg-2',
          title: 'Another Message',
          content: 'This is another test message with different content'
        })
      )
      expect(verseHistoryUtils.setCurrentVerse).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'msg-2',
          title: 'Another Message',
          content: 'This is another test message with different content'
        })
      )
    })

    test('calls display functions even when message is currently displayed', async () => {
      const user = userEvent.setup()
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-1'
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toBeInTheDocument()
      })
      
      const displayButton = screen.getByTestId('display-msg-1')
      expect(displayButton).toBeEnabled()
      
      await user.click(displayButton)
      
      expect(verseSyncUtils.broadcastCustomMessageSelection).toHaveBeenCalled()
      expect(verseHistoryUtils.setCurrentVerse).toHaveBeenCalled()
    })

    test('shows correct display state for currently displayed message', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-2'
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        const displayButton = screen.getByTestId('display-msg-2')
        expect(displayButton).toHaveTextContent('Displayed')
        expect(displayButton).toBeEnabled()
      })

      // Other messages should not be displayed
      const otherDisplayButton = screen.getByTestId('display-msg-1')
      expect(otherDisplayButton).toHaveTextContent('Display')
      expect(otherDisplayButton).toBeEnabled()
    })

    test('updates display state when currentVerseUpdated event is fired', async () => {
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Display')
      })

      // Mock current verse change - must be done before firing event
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-1'
      })

      // Simulate currentVerseUpdated event
      fireEvent(window, new CustomEvent('currentVerseUpdated'))

      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Displayed')
        expect(screen.getByTestId('display-msg-1')).toBeEnabled()
      })
    })

    test('clears display state when no current verse', async () => {
      // Start with a displayed message
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-1'
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Displayed')
      })

      // Clear current verse - must be done before firing event
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null)

      // Simulate currentVerseUpdated event
      fireEvent(window, new CustomEvent('currentVerseUpdated'))

      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Display')
        expect(screen.getByTestId('display-msg-1')).toBeEnabled()
      })
    })

    test('ignores display state for non-custom verse types', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'verse',
        book: 'Genesis',
        chapter: '1',
        verse: 1
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        const displayButtons = screen.getAllByText('Display')
        expect(displayButtons).toHaveLength(3) // All should show Display, not Displayed
      })
    })

    test('passes correct props to MessageCard components', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-2'
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        // Message 1 should not be displayed
        const msg1Card = screen.getByTestId('message-card-msg-1')
        const msg1DisplayBtn = within(msg1Card).getByTestId('display-msg-1')
        expect(msg1DisplayBtn).toHaveTextContent('Display')
        expect(msg1DisplayBtn).toBeEnabled()

        // Message 2 should be displayed
        const msg2Card = screen.getByTestId('message-card-msg-2')
        const msg2DisplayBtn = within(msg2Card).getByTestId('display-msg-2')
        expect(msg2DisplayBtn).toHaveTextContent('Displayed')
        expect(msg2DisplayBtn).toBeEnabled()

        // Message 3 should not be displayed
        const msg3Card = screen.getByTestId('message-card-msg-3')
        const msg3DisplayBtn = within(msg3Card).getByTestId('display-msg-3')
        expect(msg3DisplayBtn).toHaveTextContent('Display')
        expect(msg3DisplayBtn).toBeEnabled()
      })
    })

    test('handles display functionality across pagination', async () => {
      const user = userEvent.setup()
      
      // Create more messages to enable pagination
      const manyMessages = Array.from({ length: 15 }, (_, i) => ({
        id: `msg-${i + 1}`,
        title: `Message ${i + 1}`,
        content: `Content ${i + 1}`,
        tags: [],
        createdAt: Date.now() - i * 1000,
        updatedAt: Date.now() - i * 1000
      }))

      customMessageUtils.getMessages.mockReturnValue(manyMessages)
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-13' // On second page
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByText('15 messages')).toBeInTheDocument()
      })

      // Navigate to second page
      const nextButton = screen.getByLabelText('Go to next page')
      await user.click(nextButton)

      await waitFor(() => {
        const msg13DisplayBtn = screen.getByTestId('display-msg-13')
        expect(msg13DisplayBtn).toHaveTextContent('Displayed')
        expect(msg13DisplayBtn).toBeEnabled()
      })
    })

    test('maintains display state during search operations', async () => {
      const user = userEvent.setup()
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-1'
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Displayed')
      })

      // Perform search
      const searchInput = screen.getByLabelText('Search messages')
      await user.type(searchInput, 'First')

      await waitFor(() => {
        // Only message 1 should be visible and still displayed
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Displayed')
        expect(screen.getByTestId('display-msg-1')).toBeEnabled()
      })
    })

    test('handles display state changes during message operations', async () => {
      const user = userEvent.setup()
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg-1'
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(screen.getByTestId('display-msg-1')).toHaveTextContent('Displayed')
      })

      // Delete the currently displayed message
      customMessageUtils.deleteMessage.mockReturnValue(true)
      window.confirm = jest.fn(() => true)
      
      const deleteButton = screen.getByTestId('delete-msg-1')
      await user.click(deleteButton)

      // The display state should still be handled correctly
      expect(customMessageUtils.deleteMessage).toHaveBeenCalledWith('msg-1')
    })

    test('cleans up event listeners for display functionality', () => {
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<MessageLibrary />)
      unmount()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'currentVerseUpdated',
        expect.any(Function)
      )
    })
  })

  describe('Error Handling', () => {
    test('handles errors when loading messages', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      customMessageUtils.getMessages.mockImplementation(() => {
        throw new Error('Failed to load')
      })
      
      render(<MessageLibrary />)
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'MessageLibrary: Failed to load messages:',
          expect.any(Error)
        )
      })
      
      consoleSpy.mockRestore()
    })
  })
})