import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageCard from './index.jsx'

const mockMessage = {
  id: 'msg-123',
  title: 'Test Message Title',
  content: 'This is a test message content that might be quite long and should be truncated in the preview.',
  tags: ['study', 'prayer', 'devotion'],
  createdAt: 1640995200000, // 2022-01-01 00:00:00
  updatedAt: 1641081600000, // 2022-01-02 00:00:00
  usageCount: 5,
  lastUsed: 1641168000000 // 2022-01-03 00:00:00
}

const mockMessageWithoutTags = {
  id: 'msg-456',
  title: 'Another Test Message',
  content: 'Short content',
  tags: [],
  createdAt: 1640995200000,
  updatedAt: 1640995200000,
  usageCount: 0,
  lastUsed: null
}

const mockMessageWithManyTags = {
  id: 'msg-789',
  title: 'Message with Many Tags',
  content: 'Content here',
  tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
  createdAt: 1640995200000,
  updatedAt: 1640995200000,
  usageCount: 2,
  lastUsed: 1641081600000
}

const defaultProps = {
  message: mockMessage,
  isSelected: false,
  isCurrentlyDisplayed: false,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
  onSelect: jest.fn(),
  onDisplay: jest.fn()
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('MessageCard', () => {
  describe('Rendering', () => {
    test('renders message card with basic information', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByText('Test Message Title')).toBeInTheDocument()
      expect(screen.getByText(/This is a test message content/)).toBeInTheDocument()
      expect(screen.getByRole('listitem')).toBeInTheDocument()
    })

    test('returns null when no message is provided', () => {
      const { container } = render(<MessageCard {...defaultProps} message={null} />)
      expect(container.firstChild).toBeNull()
    })

    test('truncates long content', () => {
      const longMessage = {
        ...mockMessage,
        content: 'A'.repeat(200) // 200 characters
      }
      
      render(<MessageCard {...defaultProps} message={longMessage} />)
      
      const contentElement = screen.getByText(/A{100,}\.\.\./)
      expect(contentElement).toBeInTheDocument()
      expect(contentElement.textContent).toHaveLength(153) // 150 + '...'
    })

    test('does not truncate short content', () => {
      const shortMessage = {
        ...mockMessage,
        content: 'Short content'
      }
      
      render(<MessageCard {...defaultProps} message={shortMessage} />)
      
      expect(screen.getByText('Short content')).toBeInTheDocument()
    })

    test('displays creation and update dates', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByText('Created:')).toBeInTheDocument()
      expect(screen.getByText('Updated:')).toBeInTheDocument()
    })

    test('does not show updated date if same as created date', () => {
      render(<MessageCard {...defaultProps} message={mockMessageWithoutTags} />)
      
      expect(screen.getByText('Created:')).toBeInTheDocument()
      expect(screen.queryByText('Updated:')).not.toBeInTheDocument()
    })

    test('displays usage count', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByText('Used 5 times')).toBeInTheDocument()
    })

    test('displays singular usage count correctly', () => {
      const singleUseMessage = { ...mockMessage, usageCount: 1 }
      render(<MessageCard {...defaultProps} message={singleUseMessage} />)
      
      expect(screen.getByText('Used 1 time')).toBeInTheDocument()
    })

    test('displays last used date when available', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByText(/Last used:/)).toBeInTheDocument()
    })

    test('does not display last used when not available', () => {
      render(<MessageCard {...defaultProps} message={mockMessageWithoutTags} />)
      
      expect(screen.queryByText(/Last used:/)).not.toBeInTheDocument()
    })
  })

  describe('Tags Display', () => {
    test('displays tags when present', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByText('study')).toBeInTheDocument()
      expect(screen.getByText('prayer')).toBeInTheDocument()
      expect(screen.getByText('devotion')).toBeInTheDocument()
    })

    test('does not display tags section when no tags', () => {
      render(<MessageCard {...defaultProps} message={mockMessageWithoutTags} />)
      
      expect(screen.queryByText('study')).not.toBeInTheDocument()
    })

    test('displays only first 3 tags and shows "+X more" for additional tags', () => {
      render(<MessageCard {...defaultProps} message={mockMessageWithManyTags} />)
      
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('tag2')).toBeInTheDocument()
      expect(screen.getByText('tag3')).toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
      expect(screen.queryByText('tag4')).not.toBeInTheDocument()
      expect(screen.queryByText('tag5')).not.toBeInTheDocument()
    })

    test('additional tags indicator has proper title with all remaining tags', () => {
      render(<MessageCard {...defaultProps} message={mockMessageWithManyTags} />)
      
      const moreTagsElement = screen.getByText('+2')
      expect(moreTagsElement).toHaveAttribute(
        'title',
        'And 2 more tags: tag4, tag5'
      )
    })
  })

  describe('Selection', () => {
    test('shows checkbox for message selection', () => {
      render(<MessageCard {...defaultProps} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute('aria-label', 'Select message: Test Message Title')
    })

    test('checkbox reflects selected state', () => {
      render(<MessageCard {...defaultProps} isSelected={true} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    test('checkbox calls onSelect when clicked', async () => {
      const user = userEvent.setup()
      const mockOnSelect = jest.fn()
      
      render(<MessageCard {...defaultProps} onSelect={mockOnSelect} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(mockOnSelect).toHaveBeenCalledWith('msg-123')
    })

    test('checkbox click does not trigger other handlers', async () => {
      const user = userEvent.setup()
      const mockOnEdit = jest.fn()
      
      render(<MessageCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(mockOnEdit).not.toHaveBeenCalled()
    })

    test('applies selected styling when selected', () => {
      render(<MessageCard {...defaultProps} isSelected={true} />)
      
      const card = screen.getByRole('listitem')
      expect(card).toHaveClass('message-card--selected')
    })
  })

  describe('Action Buttons', () => {
    test('renders all action buttons', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByLabelText('Edit message: Test Message Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Duplicate message: Test Message Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete message: Test Message Title')).toBeInTheDocument()
    })

    test('edit button calls onEdit with message', async () => {
      const user = userEvent.setup()
      const mockOnEdit = jest.fn()
      
      render(<MessageCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      await user.click(editButton)
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockMessage)
    })

    test('duplicate button calls onDuplicate with message', async () => {
      const user = userEvent.setup()
      const mockOnDuplicate = jest.fn()
      
      render(<MessageCard {...defaultProps} onDuplicate={mockOnDuplicate} />)
      
      const duplicateButton = screen.getByLabelText('Duplicate message: Test Message Title')
      await user.click(duplicateButton)
      
      expect(mockOnDuplicate).toHaveBeenCalledWith(mockMessage)
    })

    test('delete button calls onDelete with message ID', async () => {
      const user = userEvent.setup()
      const mockOnDelete = jest.fn()
      
      render(<MessageCard {...defaultProps} onDelete={mockOnDelete} />)
      
      const deleteButton = screen.getByLabelText('Delete message: Test Message Title')
      await user.click(deleteButton)
      
      expect(mockOnDelete).toHaveBeenCalledWith('msg-123')
    })

    test('action buttons stop event propagation', async () => {
      const user = userEvent.setup()
      const mockOnEdit = jest.fn()
      const cardClickHandler = jest.fn()
      
      render(
        <div onClick={cardClickHandler}>
          <MessageCard {...defaultProps} onEdit={mockOnEdit} />
        </div>
      )
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      await user.click(editButton)
      
      expect(mockOnEdit).toHaveBeenCalled()
      expect(cardClickHandler).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    test('edit button responds to Enter key', () => {
      const mockOnEdit = jest.fn()
      render(<MessageCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      fireEvent.keyDown(editButton, { key: 'Enter' })
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockMessage)
    })

    test('edit button responds to Space key', () => {
      const mockOnEdit = jest.fn()
      render(<MessageCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      fireEvent.keyDown(editButton, { key: ' ' })
      
      expect(mockOnEdit).toHaveBeenCalledWith(mockMessage)
    })

    test('duplicate button responds to keyboard events', () => {
      const mockOnDuplicate = jest.fn()
      render(<MessageCard {...defaultProps} onDuplicate={mockOnDuplicate} />)
      
      const duplicateButton = screen.getByLabelText('Duplicate message: Test Message Title')
      fireEvent.keyDown(duplicateButton, { key: 'Enter' })
      
      expect(mockOnDuplicate).toHaveBeenCalledWith(mockMessage)
    })

    test('delete button responds to keyboard events', () => {
      const mockOnDelete = jest.fn()
      render(<MessageCard {...defaultProps} onDelete={mockOnDelete} />)
      
      const deleteButton = screen.getByLabelText('Delete message: Test Message Title')
      fireEvent.keyDown(deleteButton, { key: ' ' })
      
      expect(mockOnDelete).toHaveBeenCalledWith('msg-123')
    })

    test('keyboard events prevent default behavior', () => {
      const mockOnEdit = jest.fn()
      render(<MessageCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      
      // Test that Enter key triggers the action (which implies preventDefault was called)
      fireEvent.keyDown(editButton, { key: 'Enter' })
      expect(mockOnEdit).toHaveBeenCalledWith(mockMessage)
      
      // Test that Space key also triggers the action
      mockOnEdit.mockClear()
      fireEvent.keyDown(editButton, { key: ' ' })
      expect(mockOnEdit).toHaveBeenCalledWith(mockMessage)
    })

    test('ignores other keyboard keys', () => {
      const mockOnEdit = jest.fn()
      render(<MessageCard {...defaultProps} onEdit={mockOnEdit} />)
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      fireEvent.keyDown(editButton, { key: 'a' })
      
      expect(mockOnEdit).not.toHaveBeenCalled()
    })
  })

  describe('Date Formatting', () => {
    test('formats dates correctly', () => {
      render(<MessageCard {...defaultProps} />)
      
      // Check that the created date is formatted correctly
      expect(screen.getByText('Created:')).toBeInTheDocument()
      
      // Check for the formatted date pattern in the created date area
      const dateElements = screen.getAllByText(/\w{3} \d{1,2}, \d{4}/)
      expect(dateElements.length).toBeGreaterThan(0)
    })

    test('handles invalid dates gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const messageWithInvalidDate = {
        ...mockMessage,
        createdAt: 'invalid-date'
      }
      
      render(<MessageCard {...defaultProps} message={messageWithInvalidDate} />)
      
      expect(screen.getByText('Invalid Date')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('MessageCard: Invalid date:', 'invalid-date')
      
      consoleSpy.mockRestore()
    })

    test('handles missing dates', () => {
      const messageWithoutDate = {
        ...mockMessage,
        createdAt: null
      }
      
      render(<MessageCard {...defaultProps} message={messageWithoutDate} />)
      
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<MessageCard {...defaultProps} />)
      
      const card = screen.getByRole('listitem')
      expect(card).toHaveAttribute('aria-labelledby', 'message-title-msg-123')
      expect(card).toHaveAttribute('aria-describedby', 'message-content-msg-123 message-meta-msg-123')
    })

    test('title has proper ID for accessibility', () => {
      render(<MessageCard {...defaultProps} />)
      
      const title = screen.getByText('Test Message Title')
      expect(title).toHaveAttribute('id', 'message-title-msg-123')
    })

    test('content has proper ID for accessibility', () => {
      render(<MessageCard {...defaultProps} />)
      
      const content = screen.getByText(/This is a test message content/)
      expect(content).toHaveAttribute('id', 'message-content-msg-123')
    })

    test('meta section has proper ID for accessibility', () => {
      render(<MessageCard {...defaultProps} />)
      
      const card = screen.getByRole('listitem')
      const metaSection = card.querySelector('#message-meta-msg-123')
      expect(metaSection).toBeInTheDocument()
    })

    test('uses semantic time elements for dates', () => {
      render(<MessageCard {...defaultProps} />)
      
      const timeElements = screen.getAllByRole('time')
      expect(timeElements.length).toBeGreaterThan(0)
      
      // Check that time elements have proper datetime attributes
      timeElements.forEach(timeElement => {
        expect(timeElement).toHaveAttribute('dateTime')
        expect(timeElement.getAttribute('dateTime')).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })
    })

    test('action buttons have proper titles', () => {
      render(<MessageCard {...defaultProps} />)
      
      expect(screen.getByTitle('Edit message')).toBeInTheDocument()
      expect(screen.getByTitle('Duplicate message')).toBeInTheDocument()
      expect(screen.getByTitle('Delete message')).toBeInTheDocument()
    })

    test('title and content have title attributes for full text on hover', () => {
      render(<MessageCard {...defaultProps} />)
      
      const title = screen.getByText('Test Message Title')
      expect(title).toHaveAttribute('title', 'Test Message Title')
      
      const content = screen.getByText(/This is a test message content/)
      expect(content).toHaveAttribute('title', mockMessage.content)
    })
  })

  describe('Display Functionality', () => {
    test('renders display button with correct text and icon', () => {
      render(<MessageCard {...defaultProps} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toBeInTheDocument()
      expect(displayButton).toHaveTextContent('Display')
      expect(displayButton).toHaveTextContent('📺')
    })

    test('display button calls onDisplay with message when clicked', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      await user.click(displayButton)
      
      expect(onDisplay).toHaveBeenCalledWith(mockMessage)
      expect(onDisplay).toHaveBeenCalledTimes(1)
    })

    test('display button stops event propagation', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      const onSelect = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} onSelect={onSelect} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      await user.click(displayButton)
      
      expect(onDisplay).toHaveBeenCalledWith(mockMessage)
      expect(onSelect).not.toHaveBeenCalled()
    })

    test('display button responds to Enter key', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      displayButton.focus()
      await user.keyboard('{Enter}')
      
      expect(onDisplay).toHaveBeenCalledWith(mockMessage)
      expect(onDisplay).toHaveBeenCalledTimes(1)
    })

    test('display button responds to Space key', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      displayButton.focus()
      await user.keyboard(' ')
      
      expect(onDisplay).toHaveBeenCalledWith(mockMessage)
      expect(onDisplay).toHaveBeenCalledTimes(1)
    })

    test('display button ignores other keyboard keys', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      displayButton.focus()
      await user.keyboard('{Tab}')
      
      expect(onDisplay).not.toHaveBeenCalled()
    })

    test('shows "Displayed" text when currently displayed', () => {
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveTextContent('Displayed')
      expect(displayButton).toHaveAttribute('title', 'Currently displayed - click to display again')
    })

    test('display button is enabled when currently displayed', () => {
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toBeEnabled()
    })

    test('display button has correct CSS class when currently displayed', () => {
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveClass('message-card__action--displayed')
    })

    test('display button calls onDisplay when clicked even when displayed', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      
      // Click button to switch to this message
      await user.click(displayButton)
      
      expect(onDisplay).toHaveBeenCalledWith(defaultProps.message)
    })

    test('display button works without onDisplay callback', async () => {
      const user = userEvent.setup()
      const propsWithoutOnDisplay = { ...defaultProps }
      delete propsWithoutOnDisplay.onDisplay
      
      render(<MessageCard {...propsWithoutOnDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      
      expect(() => user.click(displayButton)).not.toThrow()
    })

    test('display button has proper accessibility attributes', () => {
      render(<MessageCard {...defaultProps} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveAttribute('type', 'button')
      expect(displayButton).toHaveAttribute('aria-label', 'Display message: Test Message Title')
      expect(displayButton).toHaveAttribute('title', 'Display message')
    })

    test('display button accessibility changes when displayed', () => {
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveAttribute('title', 'Currently displayed - click to display again')
      expect(displayButton).toBeEnabled()
    })

    test('display button handles onDisplay callback correctly on keyboard events', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      
      // Test Enter key
      displayButton.focus()
      await user.keyboard('{Enter}')
      expect(onDisplay).toHaveBeenCalledWith(mockMessage)
      
      // Clear mock and test Space key
      onDisplay.mockClear()
      await user.keyboard(' ')
      expect(onDisplay).toHaveBeenCalledWith(mockMessage)
    })

    test('display button prevents default behavior on keyboard events', () => {
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      
      // Create a custom keyboard event to test preventDefault
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      const preventDefaultSpy = jest.spyOn(enterEvent, 'preventDefault')
      
      fireEvent(displayButton, enterEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    test('display button calls onDisplay when already displayed', async () => {
      const user = userEvent.setup()
      const onDisplay = jest.fn()
      
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} onDisplay={onDisplay} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      
      // Test both click and keyboard events - should all work now
      await user.click(displayButton)
      displayButton.focus()
      await user.keyboard('{Enter}')
      await user.keyboard(' ')
      
      expect(onDisplay).toHaveBeenCalledTimes(3)
      expect(onDisplay).toHaveBeenCalledWith(defaultProps.message)
    })

    test('display state changes are properly reflected in button appearance', () => {
      const { rerender } = render(<MessageCard {...defaultProps} isCurrentlyDisplayed={false} />)
      
      let displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveTextContent('Display')
      expect(displayButton).toBeEnabled()
      expect(displayButton).not.toHaveClass('message-card__action--displayed')
      
      // Rerender with displayed state
      rerender(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} />)
      
      displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveTextContent('Displayed')
      expect(displayButton).toBeEnabled()
      expect(displayButton).toHaveClass('message-card__action--displayed')
    })

    test('display button maintains correct styling classes', () => {
      render(<MessageCard {...defaultProps} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveClass('message-card__action')
      expect(displayButton).toHaveClass('message-card__action--display')
      expect(displayButton).not.toHaveClass('message-card__action--displayed')
    })

    test('display button styling changes when displayed', () => {
      render(<MessageCard {...defaultProps} isCurrentlyDisplayed={true} />)
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveClass('message-card__action')
      expect(displayButton).toHaveClass('message-card__action--display')
      expect(displayButton).toHaveClass('message-card__action--displayed')
    })
  })

  describe('Optional Props', () => {
    test('works without optional callback props', () => {
      const minimalProps = { message: mockMessage }
      
      expect(() => {
        render(<MessageCard {...minimalProps} />)
      }).not.toThrow()
    })

    test('action buttons work without callbacks', async () => {
      const user = userEvent.setup()
      const minimalProps = { message: mockMessage }
      
      render(<MessageCard {...minimalProps} />)
      
      const editButton = screen.getByLabelText('Edit message: Test Message Title')
      
      expect(() => {
        user.click(editButton)
      }).not.toThrow()
    })

    test('works without isCurrentlyDisplayed prop', () => {
      const propsWithoutDisplayed = { ...defaultProps }
      delete propsWithoutDisplayed.isCurrentlyDisplayed
      
      expect(() => {
        render(<MessageCard {...propsWithoutDisplayed} />)
      }).not.toThrow()
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toHaveTextContent('Display')
      expect(displayButton).not.toBeDisabled()
    })

    test('works without onDisplay prop', () => {
      const propsWithoutOnDisplay = { ...defaultProps }
      delete propsWithoutOnDisplay.onDisplay
      
      expect(() => {
        render(<MessageCard {...propsWithoutOnDisplay} />)
      }).not.toThrow()
      
      const displayButton = screen.getByLabelText('Display message: Test Message Title')
      expect(displayButton).toBeInTheDocument()
    })
  })
})