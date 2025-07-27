import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedVerseDisplay from './index';
import { verseHistoryUtils } from '../utils/verseHistory';

// Mock the verseHistory utility
jest.mock('../utils/verseHistory', () => ({
  verseHistoryUtils: {
    getCurrentVerse: jest.fn(),
    clearCurrentVerse: jest.fn()
  }
}));

// Mock the bookNames utility to avoid cache issues
jest.mock('../utils/bookNames', () => {
  let mockCache = null;
  
  return {
    getSimpleBookName: jest.fn((bookId) => {
      const fallback = {
        'Gen': 'Genesis',
        'Exod': 'Exodus',
        'Matt': 'Matthew'
      };
      return fallback[bookId] || bookId;
    }),
    createSimpleReference: jest.fn((bookId, chapter, verse) => {
      const fallback = {
        'Gen': 'Genesis',
        'Exod': 'Exodus', 
        'Matt': 'Matthew'
      };
      const bookName = fallback[bookId] || bookId;
      return `${bookName} ${chapter}:${verse}`;
    }),
    loadBookNames: jest.fn(() => Promise.resolve()),
    __clearCache: jest.fn(() => { mockCache = null; })
  };
});

// Mock CSS imports
jest.mock('./SelectedVerseDisplay.css', () => ({}));

// Mock fetch for verse data and book names
global.fetch = jest.fn((url) => {
  // Mock book names JSON response
  if (url === '/data/book_names.json') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        'Gen': 'Genesis',
        'Exod': 'Exodus',
        'Matt': 'Matthew',
        // Add other book names as needed for tests
      })
    });
  }
  
  // Default mock behavior for other requests
  return Promise.reject(new Error('Unmocked fetch request'));
});

describe('SelectedVerseDisplay Component', () => {
  const mockVerseData = {
    book: 'Genesis',
    bookId: 'Gen',
    chapter: '1',
    verse: 1,
    reference: 'Genesis 1:1',
    timestamp: 1234567890000,
    osisId: 'Gen.1.1'
  };

  const mockChapterData = {
    'Gen.1.1': 'In the beginning God created the heaven and the earth.',
    'Gen.1.2': 'And the earth was without form, and void; and darkness was upon the face of the deep.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Reset fetch to default behavior
    fetch.mockImplementation((url) => {
      // Mock book names JSON response
      if (url === '/data/book_names.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'Gen': 'Genesis',
            'Exod': 'Exodus',
            'Matt': 'Matthew',
            // Add other book names as needed for tests
          })
        });
      }
      
      // Default mock behavior for other requests
      return Promise.reject(new Error('Unmocked fetch request'));
    });
  });

  describe('Component initialization', () => {
    it('should render no verse selected state when no current verse exists', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(screen.getByText('No Verse Selected')).toBeInTheDocument();
      expect(screen.getByText('Navigate to a verse to see it displayed here.')).toBeInTheDocument();
    });

    it('should load and display current verse from localStorage on mount', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      });

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/data/output_chapters_json/Gen/Gen_1.json');
    });

    it('should handle missing verse data gracefully', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        book: 'Genesis',
        reference: 'Genesis 1:1',
        timestamp: 1234567890000
        // Missing bookId, chapter, verse - should not trigger loadVerseText
      });

      render(<SelectedVerseDisplay />);

      // Should still render the verse header but no content will load
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Verse loading functionality', () => {
    it('should show loading state while fetching verse text', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      
      // Create a promise that we can control
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      fetch.mockReturnValue(pendingPromise);

      render(<SelectedVerseDisplay />);

      expect(screen.getByText('Loading verse content...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading verse content')).toBeInTheDocument();

      // Resolve the promise
      resolvePromise({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading verse content...')).not.toBeInTheDocument();
      });
    });

    it('should display verse text after successful load', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('In the beginning God created the heaven and the earth.')).toBeInTheDocument();
      });
    });

    it('should handle fetch errors gracefully', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load verse content')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error loading verse text:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle 404 responses appropriately', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load verse content')).toBeInTheDocument();
      });
    });

    it('should handle missing verse in chapter data', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 'Gen.1.2': 'Different verse' })
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Verse Genesis 1:1 not found in chapter data')).toBeInTheDocument();
      });
    });
  });

  describe('User interactions', () => {
    it('should clear verse when clear button is clicked', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText('Clear selected verse Genesis 1:1');
      fireEvent.click(clearButton);

      expect(verseHistoryUtils.clearCurrentVerse).toHaveBeenCalledTimes(1);
      expect(screen.getByText('No Verse Selected')).toBeInTheDocument();
    });

    it('should have accessible clear button with proper ARIA label', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        const clearButton = screen.getByLabelText('Clear selected verse Genesis 1:1');
        expect(clearButton).toBeInTheDocument();
        expect(clearButton).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Verse metadata display', () => {
    it('should display formatted timestamp when available', async () => {
      const verseWithTimestamp = {
        ...mockVerseData,
        timestamp: new Date('2024-01-15T10:30:00').getTime()
      };

      verseHistoryUtils.getCurrentVerse.mockReturnValue(verseWithTimestamp);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Selected/)).toBeInTheDocument();
      });
    });

    it('should not display timestamp section when timestamp is missing', async () => {
      const verseWithoutTimestamp = {
        ...mockVerseData,
        timestamp: undefined
      };

      verseHistoryUtils.getCurrentVerse.mockReturnValue(verseWithoutTimestamp);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Selected/)).not.toBeInTheDocument();
    });
  });

  describe('Component structure and accessibility', () => {
    it('should have proper semantic structure', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toHaveTextContent('Genesis 1:1');
      });
    });

    it('should have accessible error state with proper icon', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        const errorIcon = screen.getByText('⚠️');
        expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
      });

      consoleSpy.mockRestore();
    });

    it('should handle component unmount gracefully', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      const { unmount } = render(<SelectedVerseDisplay />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle invalid JSON in localStorage gracefully', () => {
      // Mock getCurrentVerse to return null (as it would if localStorage fails)
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(screen.getByText('No Verse Selected')).toBeInTheDocument();
    });

    it('should handle empty chapter data response', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Verse Genesis 1:1 not found in chapter data')).toBeInTheDocument();
      });
    });

    it('should handle fetch response that is not JSON', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Not JSON'))
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load verse content')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('should clear error state when verse is cleared', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load verse content')).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText('Clear selected verse Genesis 1:1');
      fireEvent.click(clearButton);

      expect(screen.queryByText('Failed to load verse content')).not.toBeInTheDocument();
      expect(screen.getByText('No Verse Selected')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Integration with verseHistory utility', () => {
    it('should call getCurrentVerse on component mount', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalledTimes(1);
    });

    it('should call clearCurrentVerse when clear button is clicked', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText('Clear selected verse Genesis 1:1');
      fireEvent.click(clearButton);

      expect(verseHistoryUtils.clearCurrentVerse).toHaveBeenCalledTimes(1);
    });

    it('should not make API calls when no current verse exists', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});