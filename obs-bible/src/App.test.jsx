import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { verseHistoryUtils } from './utils/verseHistory';

// Mock CSS imports
jest.mock('./App.css', () => ({}));

// Mock the verseHistory utility
jest.mock('./utils/verseHistory', () => ({
  verseHistoryUtils: {
    addToHistory: jest.fn(),
    setCurrentVerse: jest.fn(),
    getCurrentVerse: jest.fn(),
    clearCurrentVerse: jest.fn(),
  }
}));

// Mock fetch for Bible data
global.fetch = jest.fn();

// Mock Navigation component to control verse selection
jest.mock('./ref-nav/navigation', () => {
  return function MockNavigation({ onVerseSelected }) {
    return (
      <div data-testid="navigation">
        <button
          onClick={() => onVerseSelected({
            book: 'Genesis',
            bookId: 'Gen',
            chapter: '1',
            verse: 1,
            reference: 'Genesis 1:1'
          })}
        >
          Select Verse
        </button>
      </div>
    );
  };
});

// Mock VerseDisplay component
jest.mock('./bible-nav/verse-display', () => {
  return function MockVerseDisplay({ onVerseSelect }) {
    return (
      <div data-testid="verse-display">
        <button onClick={() => onVerseSelect('Gen.1.2')}>
          Select Verse 2
        </button>
      </div>
    );
  };
});

describe('App Component - Verse History Integration', () => {
  const mockBibleData = {
    old_testament: {
      books: {
        Gen: {
          title: 'Genesis',
          category: 'Pentateuch',
          chapter_count: 50,
          chapters: { '1': 31 }
        }
      }
    }
  };

  const mockVerseData = {
    'Gen.1.1': 'In the beginning God created the heaven and the earth.',
    'Gen.1.2': 'And the earth was without form, and void...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful Bible data fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBibleData)
    });
  });

  describe('Initial load with saved verse', () => {
    it('should restore saved verse on app load', async () => {
      const savedVerse = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1'
      };
      
      verseHistoryUtils.getCurrentVerse.mockReturnValue(savedVerse);
      
      // Mock verse data fetch
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBibleData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockVerseData)
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('verse-display')).toBeInTheDocument();
      });

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalled();
    });

    it('should not restore verse if incomplete data', async () => {
      const incompleteSavedVerse = {
        book: 'Genesis',
        bookId: 'Gen'
        // Missing chapter and verse
      };
      
      verseHistoryUtils.getCurrentVerse.mockReturnValue(incompleteSavedVerse);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('verse-display')).not.toBeInTheDocument();
    });

    it('should show navigation when no saved verse exists', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('verse-display')).not.toBeInTheDocument();
    });
  });

  describe('Verse selection and history tracking', () => {
    it('should add verse to history and save as current when verse is selected', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);
      
      // Mock verse data fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerseData)
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      const selectButton = screen.getByText('Select Verse');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('verse-display')).toBeInTheDocument();
      });

      expect(verseHistoryUtils.addToHistory).toHaveBeenCalledWith({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1'
      });

      expect(verseHistoryUtils.setCurrentVerse).toHaveBeenCalledWith({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1'
      });
    });

    it('should clear current verse when returning to navigation', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);
      
      // Mock verse data fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerseData)
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      // Select a verse to go to verse display
      const selectButton = screen.getByText('Select Verse');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('verse-display')).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByText('← Back to Books');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      expect(verseHistoryUtils.clearCurrentVerse).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle Bible data fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<App />);

      // App should still render navigation even with fetch error
      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });
    });

    it('should handle verse data fetch errors gracefully', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);
      
      // Mock successful Bible data fetch but failed verse fetch
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      const selectButton = screen.getByText('Select Verse');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to load verses')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error loading verse data:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Loading states', () => {
    it('should show loading state while Bible data loads', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<App />);

      expect(screen.getByText('Loading Bible data...')).toBeInTheDocument();
    });

    it('should show verse loading state while verses load', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);
      
      // Mock delayed verse data fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => new Promise(() => {}) // Never resolves
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('navigation')).toBeInTheDocument();
      });

      const selectButton = screen.getByText('Select Verse');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText('Loading verses...')).toBeInTheDocument();
      });
    });
  });

  // Note: Verse display interactions are implicitly tested through the other integration tests
  // and are thoroughly covered by the individual component tests
});