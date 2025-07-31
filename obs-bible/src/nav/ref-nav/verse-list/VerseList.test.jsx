import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import VerseList from './index'

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
})

Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
})

describe('VerseList Component', () => {
  const mockVerseData = [
    {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: '1',
      reference: 'Genesis 1:1',
      timestamp: Date.now() - 1000 * 60 * 60,
      osisId: 'Gen.1.1'
    },
    {
      book: 'Matthew',
      bookId: 'Matt',
      chapter: '5',
      verse: '3',
      reference: 'Matthew 5:3',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      osisId: 'Matt.5.3'
    },
    {
      book: 'John',
      bookId: 'John',
      chapter: '3',
      verse: '16',
      reference: 'John 3:16',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10,
      osisId: 'John.3.16'
    }
  ]

  const mockDataSource = {
    getItems: jest.fn(),
    clearAll: jest.fn(),
    removeItem: jest.fn()
  }

  const defaultProps = {
    dataSource: mockDataSource,
    eventName: 'testEvent',
    title: 'Test List',
    emptyMessage: 'No items yet.',
    emptyHint: 'Add some items to see them here.',
    loadingMessage: 'Loading items',
    cssPrefix: 'test-list',
    onVerseSelect: jest.fn(),
    onClearAll: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDataSource.getItems.mockReturnValue(mockVerseData)
  })

  describe('Loading State', () => {
    test('displays loading state initially', async () => {
      // Use a slow data source to catch loading state
      const slowDataSource = {
        ...mockDataSource,
        getItems: jest.fn(() => {
          // Simulate slow loading
          return new Promise(resolve => setTimeout(() => resolve(mockVerseData), 100))
        })
      }

      render(<VerseList {...defaultProps} dataSource={slowDataSource} />)

      expect(screen.getByText('Test List')).toBeInTheDocument()
      expect(screen.getAllByText('Loading items...')).toHaveLength(2) // visible and sr-only
      expect(screen.getByRole('status')).toBeInTheDocument()

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })
    })

    test('has proper accessibility attributes during loading', async () => {
      // Use a slow data source to catch loading state
      const slowDataSource = {
        ...mockDataSource,
        getItems: jest.fn(() => {
          return new Promise(resolve => setTimeout(() => resolve(mockVerseData), 100))
        })
      }

      render(<VerseList {...defaultProps} dataSource={slowDataSource} />)

      const statusElement = screen.getByRole('status')
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
      
      const srText = screen.getByText('Loading items...', { selector: '.sr-only' })
      expect(srText).toBeInTheDocument()

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    test('displays empty state when no items exist', async () => {
      mockDataSource.getItems.mockReturnValue([])

      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No items yet.')).toBeInTheDocument()
      })

      expect(screen.getByText('Add some items to see them here.')).toBeInTheDocument()
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
    })

    test('does not display clear all button when empty', async () => {
      mockDataSource.getItems.mockReturnValue([])

      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No items yet.')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument()
    })
  })

  describe('Items Display', () => {
    test('displays items correctly', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      expect(screen.getByText('Matthew 5:3')).toBeInTheDocument()
      expect(screen.getByText('John 3:16')).toBeInTheDocument()
    })

    test('displays timestamps correctly with default formatter', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('1 hour ago')).toBeInTheDocument()
      })

      expect(screen.getByText('1 day ago')).toBeInTheDocument()
    })

    test('displays custom timestamps when formatter provided', async () => {
      const customFormatter = (timestamp) => 'Custom Time'

      render(<VerseList {...defaultProps} formatTimestamp={customFormatter} />)

      await waitFor(() => {
        const timestamps = screen.getAllByText('Custom Time')
        expect(timestamps).toHaveLength(3)
      })
    })

    test('displays clear all button when items exist', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear all test list/i })
      expect(clearButton).toBeInTheDocument()
    })

    test('shows count in title when showCount is true', async () => {
      render(<VerseList {...defaultProps} showCount={true} />)

      await waitFor(() => {
        expect(screen.getByText('Test List (3)')).toBeInTheDocument()
      })
    })

    test('does not show count in title when showCount is false', async () => {
      render(<VerseList {...defaultProps} showCount={false} />)

      await waitFor(() => {
        expect(screen.getByText('Test List')).toBeInTheDocument()
      })

      expect(screen.queryByText('Test List (3)')).not.toBeInTheDocument()
    })

    test('has proper list structure', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument()
      })

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })
  })

  describe('Verse Navigation', () => {
    test('calls onVerseSelect with correct scripture reference when verse is clicked', async () => {
      const onVerseSelect = jest.fn()

      render(
        <VerseList
          {...defaultProps}
          onVerseSelect={onVerseSelect}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
      fireEvent.click(verseButton)

      expect(onVerseSelect).toHaveBeenCalledWith({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1, // Should be converted to number
        reference: 'Genesis 1:1'
      })
    })

    test('handles split verses correctly', async () => {
      const splitVerseData = [
        {
          book: 'Esther',
          bookId: 'Esth',
          chapter: '8',
          verse: '9a',
          reference: 'Esther 8:9a',
          timestamp: Date.now(),
          osisId: 'Esth.8.9a'
        }
      ]

      mockDataSource.getItems.mockReturnValue(splitVerseData)
      const onVerseSelect = jest.fn()

      render(
        <VerseList
          {...defaultProps}
          onVerseSelect={onVerseSelect}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Esther 8:9a')).toBeInTheDocument()
      })

      const verseButton = screen.getByLabelText('Navigate to Esther 8:9a')
      fireEvent.click(verseButton)

      expect(onVerseSelect).toHaveBeenCalledWith({
        book: 'Esther',
        bookId: 'Esth',
        chapter: '8',
        verse: 9, // Should extract '9' from '9a'
        reference: 'Esther 8:9a'
      })
    })

    test('handles missing onVerseSelect callback gracefully', async () => {
      render(<VerseList {...defaultProps} onVerseSelect={undefined} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
      expect(() => fireEvent.click(verseButton)).not.toThrow()
    })

    test('verse buttons have proper accessibility attributes', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
        expect(verseButton).toBeInTheDocument()
      })

      const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
      expect(verseButton).toHaveAttribute('type', 'button')
      expect(verseButton).toHaveAttribute('aria-label', 'Navigate to Genesis 1:1')
    })
  })

  describe('Item Management', () => {
    test('clears all items when clear all button is clicked', async () => {
      const onClearAll = jest.fn()

      render(
        <VerseList
          {...defaultProps}
          onClearAll={onClearAll}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear all test list/i })
      fireEvent.click(clearButton)

      expect(mockDataSource.clearAll).toHaveBeenCalled()
      expect(onClearAll).toHaveBeenCalled()

      await waitFor(() => {
        expect(screen.getByText('No items yet.')).toBeInTheDocument()
      })
    })

    test('removes individual item when remove button is clicked', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const removeButton = screen.getByLabelText('Remove Genesis 1:1 from test list')
      fireEvent.click(removeButton)

      expect(mockDataSource.removeItem).toHaveBeenCalledWith('Gen.1.1')

      await waitFor(() => {
        expect(screen.queryByText('Genesis 1:1')).not.toBeInTheDocument()
      })

      // Other items should still be there
      expect(screen.getByText('Matthew 5:3')).toBeInTheDocument()
      expect(screen.getByText('John 3:16')).toBeInTheDocument()
    })

    test('updates display after removing individual item', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      // Initially should have 3 items
      expect(screen.getAllByRole('listitem')).toHaveLength(3)

      const removeButton = screen.getByLabelText('Remove Genesis 1:1 from test list')
      fireEvent.click(removeButton)

      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(2)
      })
    })

    test('remove buttons have proper accessibility attributes', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        const removeButton = screen.getByLabelText('Remove Genesis 1:1 from test list')
        expect(removeButton).toBeInTheDocument()
      })

      const removeButton = screen.getByLabelText('Remove Genesis 1:1 from test list')
      expect(removeButton).toHaveAttribute('type', 'button')
      expect(removeButton).toHaveAttribute('aria-label', 'Remove Genesis 1:1 from test list')
      expect(removeButton).toHaveAttribute('title', 'Remove Genesis 1:1 from test list')
    })

    test('handles missing onClearAll callback gracefully', async () => {
      render(<VerseList {...defaultProps} onClearAll={undefined} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear all test list/i })
      expect(() => fireEvent.click(clearButton)).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    test('handles error when loading items fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      mockDataSource.getItems.mockImplementation(() => {
        throw new Error('Failed to load items')
      })

      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('No items yet.')).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load test list:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('Event Handling', () => {
    test('adds event listener on component mount', () => {
      render(<VerseList {...defaultProps} />)

      expect(mockAddEventListener).toHaveBeenCalledWith('testEvent', expect.any(Function))
    })

    test('removes event listener on component unmount', () => {
      const { unmount } = render(<VerseList {...defaultProps} />)

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith('testEvent', expect.any(Function))
    })

    test('updates items when event is triggered', async () => {
      let eventHandler

      mockAddEventListener.mockImplementation((eventName, handler) => {
        if (eventName === 'testEvent') {
          eventHandler = handler
        }
      })

      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      // Change the data source to return different data
      const newData = [
        {
          book: 'Psalms',
          bookId: 'Ps',
          chapter: '23',
          verse: '1',
          reference: 'Psalms 23:1',
          timestamp: Date.now(),
          osisId: 'Ps.23.1'
        }
      ]
      mockDataSource.getItems.mockReturnValue(newData)

      // Trigger the event
      eventHandler()

      await waitFor(() => {
        expect(screen.getByText('Psalms 23:1')).toBeInTheDocument()
      })

      expect(screen.queryByText('Genesis 1:1')).not.toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    test('has proper semantic structure', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      
      // Wait for items to load before checking for list
      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument()
      })
    })

    test('maintains consistent CSS classes', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const container = screen.getByRole('main')
      expect(container).toHaveClass('test-list')
      
      const header = container.querySelector('.test-list__header')
      expect(header).toBeInTheDocument()
      
      const title = container.querySelector('.test-list__title')
      expect(title).toBeInTheDocument()
      
      const list = container.querySelector('.test-list__list')
      expect(list).toBeInTheDocument()
    })

    test('uses custom aria-label when provided', async () => {
      render(<VerseList {...defaultProps} ariaLabel="Custom Label" />)

      await waitFor(() => {
        const main = screen.getByRole('main')
        expect(main).toHaveAttribute('aria-label', 'Custom Label')
      })
    })

    test('falls back to title for aria-label when not provided', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        const main = screen.getByRole('main')
        expect(main).toHaveAttribute('aria-label', 'Test List')
      })
    })
  })

  describe('Accessibility', () => {
    test('provides proper screen reader content', async () => {
      // Use a slow data source to catch loading state
      const slowDataSource = {
        ...mockDataSource,
        getItems: jest.fn(() => {
          return new Promise(resolve => setTimeout(() => resolve(mockVerseData), 100))
        })
      }

      render(<VerseList {...defaultProps} dataSource={slowDataSource} />)

      const srText = screen.getByText('Loading items...', { selector: '.sr-only' })
      expect(srText).toBeInTheDocument()

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })
    })

    test('has proper ARIA labels for interactive elements', async () => {
      render(<VerseList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
      expect(verseButton).toBeInTheDocument()

      const removeButton = screen.getByLabelText('Remove Genesis 1:1 from test list')
      expect(removeButton).toBeInTheDocument()

      const clearButton = screen.getByLabelText('Clear all test list')
      expect(clearButton).toBeInTheDocument()
    })
  })
})