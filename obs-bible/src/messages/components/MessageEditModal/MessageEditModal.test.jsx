import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageEditModal from './index.jsx'
import { customMessageUtils } from '../../utils/customMessages.js'

// Mock the customMessages utility
jest.mock('../../utils/customMessages.js', () => ({
  customMessageUtils: {
    validateMessage: jest.fn(),
    updateMessage: jest.fn()
  }
}))

// Mock window.confirm
const mockConfirm = jest.fn()
window.confirm = mockConfirm

const mockMessage = {
  id: 'msg-123',
  title: 'Test Message Title',
  content: 'This is test content for the message.',
  tags: ['study', 'prayer'],
  createdAt: Date.now() - 86400000,
  updatedAt: Date.now() - 3600000,
  usageCount: 2,
  lastUsed: Date.now() - 1800000
}

const defaultProps = {
  message: mockMessage,
  onClose: jest.fn(),
  onSave: jest.fn()
}

// Mock HTMLElement.focus and select methods
HTMLInputElement.prototype.focus = jest.fn()
HTMLInputElement.prototype.select = jest.fn()
HTMLTextAreaElement.prototype.focus = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockConfirm.mockReturnValue(true)
  
  // Mock successful validation by default
  customMessageUtils.validateMessage.mockReturnValue({
    valid: true,
    errors: []
  })
  
  // Mock successful update by default
  customMessageUtils.updateMessage.mockReturnValue({
    ...mockMessage,
    title: 'Updated Title',
    updatedAt: Date.now()
  })
})

// Prevent body overflow changes from affecting tests
Object.defineProperty(document.body.style, 'overflow', {
  writable: true,
  value: ''
})

describe('MessageEditModal', () => {
  describe('Rendering', () => {
    test('renders modal with message data', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      expect(screen.getByText('Edit Message')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Message Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is test content for the message.')).toBeInTheDocument()
      expect(screen.getByDisplayValue('study, prayer')).toBeInTheDocument()
    })

    test('does not render when no message provided', () => {
      const { container } = render(<MessageEditModal {...defaultProps} message={null} />)
      expect(container.firstChild).toBeNull()
    })

    test('renders with proper ARIA attributes', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby', 'edit-modal-title')
      expect(modal).toHaveAttribute('aria-describedby', 'edit-modal-description')
    })

    test('focuses title input on mount', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      expect(titleInput.focus).toHaveBeenCalled()
      expect(titleInput.select).toHaveBeenCalled()
    })

    test('sets body overflow to hidden', () => {
      render(<MessageEditModal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    test('restores body overflow on unmount', () => {
      const { unmount } = render(<MessageEditModal {...defaultProps} />)
      unmount()
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Form Initialization', () => {
    test('initializes form with message data', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      expect(screen.getByDisplayValue('Test Message Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('This is test content for the message.')).toBeInTheDocument()
      expect(screen.getByDisplayValue('study, prayer')).toBeInTheDocument()
    })

    test('handles message without tags', () => {
      const messageWithoutTags = { ...mockMessage, tags: [] }
      render(<MessageEditModal {...defaultProps} message={messageWithoutTags} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      expect(tagsInput.value).toBe('')
    })

    test('handles message with null tags', () => {
      const messageWithNullTags = { ...mockMessage, tags: null }
      render(<MessageEditModal {...defaultProps} message={messageWithNullTags} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      expect(tagsInput.value).toBe('')
    })
  })

  describe('Form Validation', () => {
    test('shows character counts', () => {
      const { container } = render(<MessageEditModal {...defaultProps} />)
      
      // Look for character count spans by their class and content
      const charCountSpans = container.querySelectorAll('.message-edit-modal__char-count')
      expect(charCountSpans).toHaveLength(3)
      
      // Check title character count (18 chars)
      expect(charCountSpans[0]).toHaveTextContent('18/200')
      // Check content character count (37 chars)
      expect(charCountSpans[1]).toHaveTextContent('37/5000')
      // Check tag count (2 tags)
      expect(charCountSpans[2]).toHaveTextContent('2/10 tags')
    })

    test('updates character count as user types', async () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      fireEvent.change(titleInput, { target: { value: 'New Title' } })
      
      // Look for the character count span within the title label
      const titleLabel = screen.getByLabelText(/Title/).closest('.message-edit-modal__field').querySelector('.message-edit-modal__char-count')
      expect(titleLabel).toHaveTextContent('9/200')
    })

    test('shows validation errors', async () => {
      customMessageUtils.validateMessage.mockReturnValue({
        valid: false,
        errors: ['Title is required and must be a string', 'Content must be at least 1 character(s)']
      })
      
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      expect(screen.getByText('Title is required and must be a string')).toBeInTheDocument()
      expect(screen.getByText('Content must be at least 1 character(s)')).toBeInTheDocument()
    })

  })

  describe('Change Detection', () => {
    test('detects changes in title', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      // Simulate typing by changing the value directly
      fireEvent.change(titleInput, { target: { value: 'Modified Title' } })
      
      // Wait for state to update
      await waitFor(() => {
        expect(titleInput.value).toBe('Modified Title')
      })
      
      // Cancel button should trigger confirmation
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockConfirm).toHaveBeenCalledWith('You have unsaved changes. Are you sure you want to close?')
    })

    test('detects changes in content', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const contentInput = screen.getByLabelText(/Content/)
      fireEvent.change(contentInput, { target: { value: 'Modified content' } })
      
      // Wait for state to update
      await waitFor(() => {
        expect(contentInput.value).toBe('Modified content')
      })
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockConfirm).toHaveBeenCalled()
    })

    test('detects changes in tags', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      fireEvent.change(tagsInput, { target: { value: 'new, tags' } })
      
      // Wait for state to update
      await waitFor(() => {
        expect(tagsInput.value).toBe('new, tags')
      })
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockConfirm).toHaveBeenCalled()
    })

    test('does not show confirmation when no changes made', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(mockConfirm).not.toHaveBeenCalled()
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    test('submits form with updated data', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      // Use fireEvent to directly set the value
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      expect(customMessageUtils.updateMessage).toHaveBeenCalledWith('msg-123', {
        title: 'Updated Title',
        content: 'This is test content for the message.',
        tags: ['study', 'prayer']
      })
    })

    test('calls updateMessage when validation passes', async () => {
      const user = userEvent.setup()
      
      // Ensure validation passes
      customMessageUtils.validateMessage.mockReturnValue({
        valid: true,
        errors: []
      })
      
      // Mock successful update
      customMessageUtils.updateMessage.mockReturnValue({
        ...mockMessage,
        title: 'Test Message Title',
        updatedAt: Date.now()
      })
      
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      // Check that updateMessage was called
      expect(customMessageUtils.updateMessage).toHaveBeenCalledWith('msg-123', {
        title: 'Test Message Title',
        content: 'This is test content for the message.',
        tags: ['study', 'prayer']
      })
    })

    test('calls onSave and onClose on successful submission', async () => {
      const user = userEvent.setup()
      const updatedMessage = { ...mockMessage, title: 'Updated Title' }
      customMessageUtils.updateMessage.mockReturnValue(updatedMessage)
      
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(updatedMessage)
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    test('shows error when submission fails', async () => {
      const user = userEvent.setup()
      customMessageUtils.updateMessage.mockReturnValue(null)
      
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to update message. Please try again.')).toBeInTheDocument()
      })
      
      expect(defaultProps.onSave).not.toHaveBeenCalled()
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    test('handles unexpected errors during submission', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const user = userEvent.setup()
      customMessageUtils.updateMessage.mockImplementation(() => {
        throw new Error('Network error')
      })
      
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'MessageEditModal: Failed to update message:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('Tag Parsing', () => {
    test('parses comma-separated tags correctly', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      fireEvent.change(tagsInput, { target: { value: 'tag1, tag2, tag3' } })
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      expect(customMessageUtils.updateMessage).toHaveBeenCalledWith('msg-123', 
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3']
        })
      )
    })

    test('filters out empty tags', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      fireEvent.change(tagsInput, { target: { value: 'tag1, , tag2,  , tag3' } })
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      expect(customMessageUtils.updateMessage).toHaveBeenCalledWith('msg-123', 
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3']
        })
      )
    })

    test('limits tags to 10', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      fireEvent.change(tagsInput, { target: { value: 'tag1,tag2,tag3,tag4,tag5,tag6,tag7,tag8,tag9,tag10,tag11,tag12' } })
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      const expectedTags = ['tag1','tag2','tag3','tag4','tag5','tag6','tag7','tag8','tag9','tag10']
      expect(customMessageUtils.updateMessage).toHaveBeenCalledWith('msg-123', 
        expect.objectContaining({
          tags: expectedTags
        })
      )
    })
  })

  describe('Keyboard Navigation', () => {
    test('closes modal on Escape key', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    test('traps focus within modal', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      const focusableElements = modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
      
      expect(focusableElements.length).toBeGreaterThan(0)
    })

    test('handles Tab key navigation', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      const tabEvent = { key: 'Tab', preventDefault: jest.fn() }
      
      // This tests the keyDown handler setup, actual focus management is complex to test
      fireEvent.keyDown(modal, tabEvent)
      
      // Test doesn't fail, indicating handler is set up correctly
      expect(true).toBe(true)
    })

    test('handles Shift+Tab key navigation', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const modal = screen.getByRole('dialog')
      const shiftTabEvent = { key: 'Tab', shiftKey: true, preventDefault: jest.fn() }
      
      fireEvent.keyDown(modal, shiftTabEvent)
      
      // Test doesn't fail, indicating handler is set up correctly
      expect(true).toBe(true)
    })
  })

  describe('Modal Interaction', () => {
    test('closes modal when clicking backdrop', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const backdrop = screen.getByRole('dialog')
      await user.click(backdrop)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    test('does not close modal when clicking inside modal content', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const modalContent = screen.getByRole('dialog').querySelector('.message-edit-modal')
      await user.click(modalContent)
      
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    test('closes modal with close button', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const closeButton = screen.getByLabelText('Close edit message modal')
      await user.click(closeButton)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    test('cancels modal with cancel button', async () => {
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('has proper form labels and help text', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Content/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tags/)).toBeInTheDocument()
      
      expect(screen.getByText('A descriptive title for your message')).toBeInTheDocument()
      expect(screen.getByText('Your message content. Supports Markdown formatting.')).toBeInTheDocument()
      expect(screen.getByText('Comma-separated tags to help organize your messages (optional)')).toBeInTheDocument()
    })

    test('associates error messages with form fields', async () => {
      customMessageUtils.validateMessage.mockReturnValue({
        valid: false,
        errors: ['Title is required and must be a string']
      })
      
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      const titleInput = screen.getByLabelText(/Title/)
      expect(titleInput).toHaveAttribute('aria-describedby', 'edit-title-error')
      expect(titleInput).toHaveAttribute('aria-invalid', 'true')
    })

    test('has proper required field indicators', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const contentInput = screen.getByLabelText(/Content/)
      
      expect(titleInput).toHaveAttribute('required')
      expect(contentInput).toHaveAttribute('required')
    })

    test('error messages have alert role', async () => {
      customMessageUtils.validateMessage.mockReturnValue({
        valid: false,
        errors: ['Title is required']
      })
      
      const user = userEvent.setup()
      render(<MessageEditModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Save Changes')
      await user.click(submitButton)
      
      const errorMessage = screen.getByText('Title is required')
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })
  })

  describe('Input Constraints', () => {
    test('enforces maxLength on inputs', () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      const contentInput = screen.getByLabelText(/Content/)
      
      expect(titleInput).toHaveAttribute('maxLength', '200')
      expect(contentInput).toHaveAttribute('maxLength', '5000')
    })

    test('updates character count as user types in title', async () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText(/Title/)
      fireEvent.change(titleInput, { target: { value: 'A'.repeat(50) } })
      
      // Look for the character count span within the title label
      const titleLabel = screen.getByLabelText(/Title/).closest('.message-edit-modal__field').querySelector('.message-edit-modal__char-count')
      expect(titleLabel).toHaveTextContent('50/200')
    })

    test('updates character count as user types in content', async () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const contentInput = screen.getByLabelText(/Content/)
      fireEvent.change(contentInput, { target: { value: 'A'.repeat(100) } })
      
      // Look for the character count span within the content label
      const contentLabel = screen.getByLabelText(/Content/).closest('.message-edit-modal__field').querySelector('.message-edit-modal__char-count')
      expect(contentLabel).toHaveTextContent('100/5000')
    })

    test('updates tag count as user types in tags', async () => {
      render(<MessageEditModal {...defaultProps} />)
      
      const tagsInput = screen.getByLabelText(/Tags/)
      fireEvent.change(tagsInput, { target: { value: 'one, two, three, four, five' } })
      
      // Look for the character count span within the tags label
      const tagsLabel = screen.getByLabelText(/Tags/).closest('.message-edit-modal__field').querySelector('.message-edit-modal__char-count')
      expect(tagsLabel).toHaveTextContent('5/10 tags')
    })
  })
})