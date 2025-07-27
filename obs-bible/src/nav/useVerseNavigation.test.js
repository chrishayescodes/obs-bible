import { renderHook, act } from '@testing-library/react'
import { useVerseNavigation } from './useVerseNavigation'
import { verseHistoryUtils } from '../utils/verseHistory'
import { verseSyncUtils } from '../utils/broadcastChannel'

// Mock the verseHistory utility
jest.mock('../utils/verseHistory', () => ({
  verseHistoryUtils: {
    addToHistory: jest.fn(),
    setCurrentVerse: jest.fn(),
    getCurrentVerse: jest.fn(),
    clearCurrentVerse: jest.fn(),
  }
}))

// Mock the broadcastChannel utility
jest.mock('../utils/broadcastChannel', () => ({
  verseSyncUtils: {
    broadcastVerseSelection: jest.fn(),
    broadcastVerseClear: jest.fn(),
  }
}))

// Mock fetch for verse data
global.fetch = jest.fn()

describe('useVerseNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
  })

  describe('initial state', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => useVerseNavigation())

      expect(result.current.selectedScripture).toBeNull()
      expect(result.current.verseData).toBeNull()
      expect(result.current.loadingVerses).toBe(false)
      expect(result.current.navigatedVerse).toBeNull()
      expect(result.current.selectedVerse).toBeNull()
    })

    it('should provide action functions', () => {
      const { result } = renderHook(() => useVerseNavigation())

      expect(typeof result.current.handleVerseSelected).toBe('function')
      expect(typeof result.current.handleVerseDisplaySelect).toBe('function')
      expect(typeof result.current.handleBackToBooks).toBe('function')
      expect(typeof result.current.restoreCurrentVerse).toBe('function')
    })
  })

  describe('handleVerseSelected', () => {
    const mockScriptureRef = {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1,
      reference: 'Genesis 1:1'
    }

    const mockVerseData = {
      'Gen.1.1': 'In the beginning God created the heaven and the earth.',
      'Gen.1.2': 'And the earth was without form, and void...'
    }

    it('should handle successful verse selection', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerseData)
      })

      const { result } = renderHook(() => useVerseNavigation())

      await act(async () => {
        await result.current.handleVerseSelected(mockScriptureRef)
      })

      // Should NOT add to history or set current verse (navigation only)
      expect(verseHistoryUtils.addToHistory).not.toHaveBeenCalled()
      expect(verseHistoryUtils.setCurrentVerse).not.toHaveBeenCalled()

      // Should update state
      expect(result.current.selectedScripture).toEqual({
        ...mockScriptureRef,
        navigatedVerse: 'Gen.1.1'
      })
      expect(result.current.navigatedVerse).toBe('Gen.1.1')
      expect(result.current.verseData).toEqual(mockVerseData)
      expect(result.current.loadingVerses).toBe(false)

      // Should fetch verse data
      expect(fetch).toHaveBeenCalledWith('/data/output_chapters_json/Gen/Gen_1.json')
    })

    it('should handle fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() => useVerseNavigation())

      await act(async () => {
        await result.current.handleVerseSelected(mockScriptureRef)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error loading verse data:', expect.any(Error))
      expect(result.current.verseData).toBeNull()
      expect(result.current.loadingVerses).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should handle HTTP errors gracefully', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() => useVerseNavigation())

      await act(async () => {
        await result.current.handleVerseSelected(mockScriptureRef)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error loading verse data:', expect.any(Error))
      expect(result.current.verseData).toBeNull()
      expect(result.current.loadingVerses).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should set loading state during fetch', async () => {
      let resolvePromise
      fetch.mockReturnValueOnce(new Promise((resolve) => {
        resolvePromise = resolve
      }))

      const { result } = renderHook(() => useVerseNavigation())

      // Start the async operation
      act(() => {
        result.current.handleVerseSelected(mockScriptureRef)
      })

      // Check loading state is true
      expect(result.current.loadingVerses).toBe(true)

      // Resolve the promise
      await act(async () => {
        resolvePromise({
          ok: true,
          json: () => Promise.resolve(mockVerseData)
        })
      })

      // Check loading state is false
      expect(result.current.loadingVerses).toBe(false)
    })
  })

  describe('handleVerseDisplaySelect', () => {
    it('should update selected verse', () => {
      const { result } = renderHook(() => useVerseNavigation())

      act(() => {
        result.current.handleVerseDisplaySelect('Gen.1.5')
      })

      expect(result.current.selectedVerse).toBe('Gen.1.5')
    })
  })

  describe('handleBackToBooks', () => {
    it('should clear all navigation state', () => {
      const { result } = renderHook(() => useVerseNavigation())

      // First set some state
      act(() => {
        result.current.handleVerseDisplaySelect('Gen.1.1')
      })

      // Then clear it
      act(() => {
        result.current.handleBackToBooks()
      })

      // Should NOT clear localStorage or broadcast - display should remain independent
      expect(verseHistoryUtils.clearCurrentVerse).not.toHaveBeenCalled()
      expect(verseSyncUtils.broadcastVerseClear).not.toHaveBeenCalled()
      
      // Should only clear navigation state
      expect(result.current.selectedScripture).toBeNull()
      expect(result.current.verseData).toBeNull()
      expect(result.current.loadingVerses).toBe(false)
      expect(result.current.navigatedVerse).toBeNull()
      expect(result.current.selectedVerse).toBeNull()
    })
  })

  describe('restoreCurrentVerse', () => {
    const mockSavedVerse = {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1,
      reference: 'Genesis 1:1'
    }

    it('should restore verse when valid saved verse exists', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockSavedVerse)
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      })

      const { result } = renderHook(() => useVerseNavigation())

      await act(async () => {
        await result.current.restoreCurrentVerse()
      })

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalled()
      expect(result.current.selectedScripture).toEqual({
        ...mockSavedVerse,
        navigatedVerse: 'Gen.1.1'
      })
    })

    it('should not restore when no saved verse exists', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null)

      const { result } = renderHook(() => useVerseNavigation())

      await act(async () => {
        await result.current.restoreCurrentVerse()
      })

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalled()
      expect(result.current.selectedScripture).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should not restore when saved verse is incomplete', async () => {
      const incompleteSavedVerse = {
        book: 'Genesis',
        bookId: 'Gen'
        // Missing chapter and verse
      }
      verseHistoryUtils.getCurrentVerse.mockReturnValue(incompleteSavedVerse)

      const { result } = renderHook(() => useVerseNavigation())

      await act(async () => {
        await result.current.restoreCurrentVerse()
      })

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalled()
      expect(result.current.selectedScripture).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('handleVerseDisplaySelect', () => {
    const mockBibleData = {
      old_testament: {
        books: {
          Gen: {
            title: 'Genesis'
          }
        }
      }
    }

    it('should handle verse selection with broadcasting and history updates', () => {
      const { result } = renderHook(() => useVerseNavigation(mockBibleData))

      act(() => {
        result.current.handleVerseDisplaySelect('Gen.1.5')
      })

      const expectedScriptureRef = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 5,
        reference: 'Genesis 1:5'
      }

      // Should add to history and set current verse (selection behavior)
      expect(verseHistoryUtils.addToHistory).toHaveBeenCalledWith(expectedScriptureRef)
      expect(verseHistoryUtils.setCurrentVerse).toHaveBeenCalledWith(expectedScriptureRef)

      // Should broadcast verse selection
      expect(verseSyncUtils.broadcastVerseSelection).toHaveBeenCalledWith(expectedScriptureRef)

      // Should update selected verse state
      expect(result.current.selectedVerse).toBe('Gen.1.5')
    })

    it('should handle verse selection without bibleData (fallback to bookId)', () => {
      const { result } = renderHook(() => useVerseNavigation())

      act(() => {
        result.current.handleVerseDisplaySelect('Matt.5.3')
      })

      const expectedScriptureRef = {
        book: 'Matt', // Falls back to bookId when no bibleData
        bookId: 'Matt',
        chapter: '5',
        verse: 3,
        reference: 'Matt 5:3'
      }

      expect(verseHistoryUtils.addToHistory).toHaveBeenCalledWith(expectedScriptureRef)
      expect(verseSyncUtils.broadcastVerseSelection).toHaveBeenCalledWith(expectedScriptureRef)
    })
  })

  describe('memoization', () => {
    it('should memoize action functions', () => {
      const { result, rerender } = renderHook(() => useVerseNavigation())

      const firstRenderActions = {
        handleVerseSelected: result.current.handleVerseSelected,
        handleVerseDisplaySelect: result.current.handleVerseDisplaySelect,
        handleBackToBooks: result.current.handleBackToBooks,
        restoreCurrentVerse: result.current.restoreCurrentVerse
      }

      rerender()

      const secondRenderActions = {
        handleVerseSelected: result.current.handleVerseSelected,
        handleVerseDisplaySelect: result.current.handleVerseDisplaySelect,
        handleBackToBooks: result.current.handleBackToBooks,
        restoreCurrentVerse: result.current.restoreCurrentVerse
      }

      // Functions should be the same reference due to useCallback
      expect(firstRenderActions.handleVerseSelected).toBe(secondRenderActions.handleVerseSelected)
      expect(firstRenderActions.handleVerseDisplaySelect).toBe(secondRenderActions.handleVerseDisplaySelect)
      expect(firstRenderActions.handleBackToBooks).toBe(secondRenderActions.handleBackToBooks)
      expect(firstRenderActions.restoreCurrentVerse).toBe(secondRenderActions.restoreCurrentVerse)
    })
  })
})