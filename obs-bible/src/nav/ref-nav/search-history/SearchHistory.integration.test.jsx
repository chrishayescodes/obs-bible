import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import SearchHistory from './index'
import { useVerseNavigation } from '../../useVerseNavigation'
import { verseHistoryUtils } from '../../../utils/verseHistory'

// Mock the dependencies
jest.mock('../../../utils/verseHistory', () => ({
  verseHistoryUtils: {
    getHistory: jest.fn(),
    clearHistory: jest.fn(),
    removeFromHistory: jest.fn()
  }
}))

jest.mock('../../useVerseNavigation')

describe('SearchHistory Integration', () => {
  const mockBibleData = {
    old_testament: {
      books: {
        Gen: {
          id: 'Gen',
          title: 'Genesis',
          chapter_count: 50
        }
      }
    },
    new_testament: {
      books: {
        Matt: {
          id: 'Matt',
          title: 'Matthew',
          chapter_count: 28
        }
      }
    }
  }

  const mockHistoryData = [
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
    }
  ]

  const mockUseVerseNavigation = {
    handleVerseSelected: jest.fn(),
    selectedScripture: null,
    verseData: null,
    loadingVerses: false,
    navigatedVerse: null,
    selectedVerse: null,
    loadedChapters: new Set(),
    handleVerseDisplaySelect: jest.fn(),
    handleBackToBooks: jest.fn(),
    restoreCurrentVerse: jest.fn(),
    handlePreviousChapter: jest.fn(),
    handleNextChapter: jest.fn(),
    getAdjacentChapterInfo: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    useVerseNavigation.mockReturnValue(mockUseVerseNavigation)
    verseHistoryUtils.getHistory.mockReturnValue(mockHistoryData)
  })

  test('integrates with navigation hook for verse selection', async () => {
    const TestComponent = () => {
      const navigation = useVerseNavigation(mockBibleData)
      
      return (
        <SearchHistory 
          onVerseSelect={navigation.handleVerseSelected}
        />
      )
    }

    render(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
    })

    // Click on a verse in history
    const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
    fireEvent.click(verseButton)

    // Verify the navigation hook was called with correct data
    expect(mockUseVerseNavigation.handleVerseSelected).toHaveBeenCalledWith({
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1, // Should be converted to number
      reference: 'Genesis 1:1'
    })
  })

  test('handles verse selection with correct scripture reference format', async () => {
    const onVerseSelect = jest.fn()

    render(<SearchHistory onVerseSelect={onVerseSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Matthew 5:3')).toBeInTheDocument()
    })

    // Click on Matthew verse
    const verseButton = screen.getByLabelText('Navigate to Matthew 5:3')
    fireEvent.click(verseButton)

    // Verify correct scripture reference structure
    expect(onVerseSelect).toHaveBeenCalledWith({
      book: 'Matthew',
      bookId: 'Matt',
      chapter: '5',
      verse: 3,
      reference: 'Matthew 5:3'
    })
  })

  test('works with split verse parts', async () => {
    const splitVerseHistory = [
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

    verseHistoryUtils.getHistory.mockReturnValue(splitVerseHistory)
    const onVerseSelect = jest.fn()

    render(<SearchHistory onVerseSelect={onVerseSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Esther 8:9a')).toBeInTheDocument()
    })

    // Click on split verse
    const verseButton = screen.getByLabelText('Navigate to Esther 8:9a')
    fireEvent.click(verseButton)

    // Verify split verse handling - verse should be converted to integer (extracting '9' from '9a')
    expect(onVerseSelect).toHaveBeenCalledWith({
      book: 'Esther',
      bookId: 'Esth',
      chapter: '8',
      verse: 9, // Should extract '9' from '9a'
      reference: 'Esther 8:9a'
    })
  })

  test('handles navigation integration lifecycle', async () => {
    const TestComponent = () => {
      const navigation = useVerseNavigation(mockBibleData)
      
      return (
        <div>
          <SearchHistory 
            onVerseSelect={navigation.handleVerseSelected}
            onClearHistory={() => {}}
          />
          <button onClick={navigation.handleBackToBooks}>
            Back to Books
          </button>
        </div>
      )
    }

    render(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
    })

    // Select a verse
    const verseButton = screen.getByLabelText('Navigate to Genesis 1:1')
    fireEvent.click(verseButton)

    expect(mockUseVerseNavigation.handleVerseSelected).toHaveBeenCalled()

    // Navigate back
    const backButton = screen.getByText('Back to Books')
    fireEvent.click(backButton)

    expect(mockUseVerseNavigation.handleBackToBooks).toHaveBeenCalled()
  })

  test('handles empty history gracefully', async () => {
    verseHistoryUtils.getHistory.mockReturnValue([])
    const onVerseSelect = jest.fn()

    render(<SearchHistory onVerseSelect={onVerseSelect} />)

    await waitFor(() => {
      expect(screen.getByText('No verses in your history yet.')).toBeInTheDocument()
    })

    expect(onVerseSelect).not.toHaveBeenCalled()
  })

  test('maintains history state after component interactions', async () => {
    render(<SearchHistory onVerseSelect={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
    })

    // Remove an item
    const removeButton = screen.getByLabelText('Remove Genesis 1:1 from history')
    fireEvent.click(removeButton)

    expect(verseHistoryUtils.removeFromHistory).toHaveBeenCalledWith('Gen.1.1')

    await waitFor(() => {
      expect(screen.queryByText('Genesis 1:1')).not.toBeInTheDocument()
    })

    // Other item should still be there
    expect(screen.getByText('Matthew 5:3')).toBeInTheDocument()
  })

  test('clears all history properly', async () => {
    const onClearHistory = jest.fn()

    render(<SearchHistory onClearHistory={onClearHistory} />)

    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /clear all history/i })
    fireEvent.click(clearButton)

    expect(verseHistoryUtils.clearHistory).toHaveBeenCalled()
    expect(onClearHistory).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.getByText('No verses in your history yet.')).toBeInTheDocument()
    })
  })
})