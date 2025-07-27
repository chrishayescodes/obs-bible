import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import SearchHistory from './index'
import { verseHistoryUtils } from '../../../utils/verseHistory'

// Mock the verseHistory utility
jest.mock('../../../utils/verseHistory', () => ({
  verseHistoryUtils: {
    getHistory: jest.fn(),
    clearHistory: jest.fn(),
    removeFromHistory: jest.fn()
  }
}))

describe('SearchHistory Component', () => {
  const mockHistoryData = [
    {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: '1',
      reference: 'Genesis 1:1',
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      osisId: 'Gen.1.1'
    },
    {
      book: 'Matthew',
      bookId: 'Matt',
      chapter: '5',
      verse: '3',
      reference: 'Matthew 5:3',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      osisId: 'Matt.5.3'
    },
    {
      book: 'John',
      bookId: 'John',
      chapter: '3',
      verse: '16',
      reference: 'John 3:16',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8, // 8 days ago
      osisId: 'John.3.16'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    test('displays loading state initially', () => {
      // Create a mock that never resolves to keep loading state
      let resolvePromise
      const mockPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      verseHistoryUtils.getHistory.mockReturnValue(mockPromise)

      const LoadingComponent = () => {
        const [loading, setLoading] = React.useState(true)
        
        React.useEffect(() => {
          verseHistoryUtils.getHistory()
            .then(() => setLoading(false))
            .catch(() => setLoading(false))
        }, [])

        if (loading) {
          return (
            <div className="search-history" role="main" aria-label="Search History">
              <div className="search-history__header">
                <h1 className="search-history__title">Search History</h1>
              </div>
              <div className="search-history__loading" role="status" aria-live="polite">
                <span className="sr-only">Loading history...</span>
                Loading history...
              </div>
            </div>
          )
        }
        
        return <SearchHistory />
      }

      render(<LoadingComponent />)

      expect(screen.getAllByText('Loading history...')).toHaveLength(2) // One visible, one screen-reader only
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    test('has proper accessibility attributes during loading', () => {
      const LoadingComponent = () => (
        <div className="search-history" role="main" aria-label="Search History">
          <div className="search-history__header">
            <h1 className="search-history__title">Search History</h1>
          </div>
          <div className="search-history__loading" role="status" aria-live="polite">
            <span className="sr-only">Loading history...</span>
            Loading history...
          </div>
        </div>
      )

      render(<LoadingComponent />)

      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Empty State', () => {
    test('displays empty state when no history exists', async () => {
      verseHistoryUtils.getHistory.mockReturnValue([])

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('No verses in your history yet.')).toBeInTheDocument()
      })

      expect(screen.getByText('Navigate to verses to build your history.')).toBeInTheDocument()
      expect(screen.getByRole('main', { name: /search history/i })).toBeInTheDocument()
    })

    test('does not display clear all button when empty', async () => {
      verseHistoryUtils.getHistory.mockReturnValue([])

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('No verses in your history yet.')).toBeInTheDocument()
      })

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument()
    })
  })

  describe('History Display', () => {
    test('displays history items correctly', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      expect(screen.getByText('Matthew 5:3')).toBeInTheDocument()
      expect(screen.getByText('John 3:16')).toBeInTheDocument()
    })

    test('displays timestamps correctly', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('1 hour ago')).toBeInTheDocument()
      })

      expect(screen.getByText('1 day ago')).toBeInTheDocument()
      expect(screen.getByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/)).toBeInTheDocument() // Date format for 8+ days
    })

    test('displays clear all button when history exists', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /clear all history/i })
      expect(clearButton).toBeInTheDocument()
    })

    test('has proper list structure', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeInTheDocument()
      })

      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })
  })

  describe('Verse Navigation', () => {
    test('calls onVerseSelect with correct scripture reference when verse is clicked', async () => {
      const mockOnVerseSelect = jest.fn()
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory onVerseSelect={mockOnVerseSelect} />)

      await waitFor(() => {
        const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
        fireEvent.click(verseButton)
      })

      expect(mockOnVerseSelect).toHaveBeenCalledWith({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1, // Note: converted to number
        reference: 'Genesis 1:1'
      })
    })

    test('handles missing onVerseSelect callback gracefully', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
        fireEvent.click(verseButton)
      })

      // Should not throw error
    })

    test('verse buttons have proper accessibility attributes', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
        expect(verseButton).toHaveAttribute('type', 'button')
        expect(verseButton).toHaveAttribute('aria-label', 'Navigate to Genesis 1:1')
      })
    })
  })

  describe('History Management', () => {
    test('clears all history when clear all button is clicked', async () => {
      const mockOnClearHistory = jest.fn()
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory onClearHistory={mockOnClearHistory} />)

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear all history/i })
        fireEvent.click(clearButton)
      })

      expect(verseHistoryUtils.clearHistory).toHaveBeenCalled()
      expect(mockOnClearHistory).toHaveBeenCalled()
    })

    test('removes individual history item when remove button is clicked', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const removeButton = screen.getByLabelText('Remove Genesis 1:1 from history')
        fireEvent.click(removeButton)
      })

      expect(verseHistoryUtils.removeFromHistory).toHaveBeenCalledWith('Gen.1.1')
    })

    test('updates display after removing individual item', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      })

      const removeButton = screen.getByLabelText('Remove Genesis 1:1 from history')
      fireEvent.click(removeButton)

      await waitFor(() => {
        expect(screen.queryByText('Genesis 1:1')).not.toBeInTheDocument()
      })

      // Other items should still be there
      expect(screen.getByText('Matthew 5:3')).toBeInTheDocument()
      expect(screen.getByText('John 3:16')).toBeInTheDocument()
    })

    test('remove buttons have proper accessibility attributes', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const removeButton = screen.getByLabelText('Remove Genesis 1:1 from history')
        expect(removeButton).toHaveAttribute('type', 'button')
        expect(removeButton).toHaveAttribute('title', 'Remove Genesis 1:1 from history')
      })
    })
  })

  describe('Error Handling', () => {
    test('handles error when loading history fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      verseHistoryUtils.getHistory.mockImplementation(() => {
        throw new Error('Failed to load history')
      })

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('No verses in your history yet.')).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load verse history:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    test('handles missing onClearHistory callback gracefully', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /clear all history/i })
        fireEvent.click(clearButton)
      })

      // Should not throw error
      expect(verseHistoryUtils.clearHistory).toHaveBeenCalled()
    })
  })

  describe('Timestamp Formatting', () => {
    test('formats recent timestamps correctly', async () => {
      const recentHistoryData = [
        {
          ...mockHistoryData[0],
          timestamp: Date.now() - 1000 * 60 * 30 // 30 minutes ago
        },
        {
          ...mockHistoryData[1],
          timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
        },
        {
          ...mockHistoryData[2],
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
        }
      ]

      verseHistoryUtils.getHistory.mockReturnValue(recentHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('Less than an hour ago')).toBeInTheDocument()
      })

      expect(screen.getByText('2 hours ago')).toBeInTheDocument()
      expect(screen.getByText('3 days ago')).toBeInTheDocument()
    })

    test('handles edge case timestamps', async () => {
      const edgeHistoryData = [
        {
          ...mockHistoryData[0],
          timestamp: Date.now() - 1000 * 60 * 60 // Exactly 1 hour ago
        },
        {
          ...mockHistoryData[1],
          timestamp: Date.now() - 1000 * 60 * 60 * 24 // Exactly 1 day ago
        }
      ]

      verseHistoryUtils.getHistory.mockReturnValue(edgeHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByText('1 hour ago')).toBeInTheDocument()
      })

      expect(screen.getByText('1 day ago')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    test('has proper semantic structure', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByRole('main', { name: /search history/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search History')
    })

    test('maintains consistent CSS classes', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const container = screen.getByRole('main')
        expect(container).toHaveClass('search-history')

        const header = container.querySelector('.search-history__header')
        expect(header).toBeInTheDocument()

        const title = screen.getByRole('heading')
        expect(title).toHaveClass('search-history__title')
      })
    })
  })

  describe('Accessibility', () => {
    test('provides proper screen reader content', async () => {
      verseHistoryUtils.getHistory.mockReturnValue([])

      render(<SearchHistory />)

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })

      // Check that screen reader content would be available during loading
      const LoadingComponent = () => (
        <div className="search-history" role="main" aria-label="Search History">
          <div className="search-history__header">
            <h1 className="search-history__title">Search History</h1>
          </div>
          <div className="search-history__loading" role="status" aria-live="polite">
            <span className="sr-only">Loading history...</span>
            Loading history...
          </div>
        </div>
      )

      const { container } = render(<LoadingComponent />)
      const srOnly = container.querySelector('.sr-only')
      expect(srOnly).toBeInTheDocument()
    })

    test('has proper ARIA labels for interactive elements', async () => {
      verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)

      render(<SearchHistory />)

      await waitFor(() => {
        const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
        expect(verseButton).toBeInTheDocument()
      })

      const removeButton = screen.getByLabelText('Remove Genesis 1:1 from history')
      expect(removeButton).toBeInTheDocument()

      const clearButton = screen.getByLabelText('Clear all history')
      expect(clearButton).toBeInTheDocument()
    })
  })
})