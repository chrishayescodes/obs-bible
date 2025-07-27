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
    it('should render nothing when no current verse exists', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      const { container } = render(<SelectedVerseDisplay />);

      // Component should render nothing (null) when no verse is selected
      expect(container.firstChild).toBeNull();
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
        expect(screen.getByText('In the beginning God created the heaven and the earth.')).toBeInTheDocument();
      });

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/data/output_chapters_json/Gen/Gen_1.json');
    });

    it('should render nothing when verse data is incomplete', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        book: 'Genesis',
        reference: 'Genesis 1:1',
        timestamp: 1234567890000
        // Missing bookId, chapter, verse - should not trigger loadVerseText
      });

      const { container } = render(<SelectedVerseDisplay />);

      // Should render nothing when verse data is incomplete
      expect(container.firstChild).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Verse loading functionality', () => {
    it('should display verse text after successful load', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
        expect(screen.getByText('In the beginning God created the heaven and the earth.')).toBeInTheDocument();
      });
    });

    it('should render nothing during loading state', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      
      // Create a promise that we can control
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      fetch.mockReturnValue(pendingPromise);

      const { container } = render(<SelectedVerseDisplay />);

      // Should render nothing during loading
      expect(container.firstChild).toBeNull();

      // Resolve the promise
      resolvePromise({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      await waitFor(() => {
        expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      });
    });

    it('should render nothing when verse loading fails', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { container } = render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Component behavior', () => {
    it('should handle component unmount gracefully', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      const { unmount } = render(<SelectedVerseDisplay />);
      
      expect(() => unmount()).not.toThrow();
    });

    it('should render nothing with invalid localStorage data', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      const { container } = render(<SelectedVerseDisplay />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Integration with verseHistory utility', () => {
    it('should call getCurrentVerse on component mount', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalledTimes(1);
    });

    it('should not make API calls when no current verse exists', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});