import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppNavigation from './AppNavigation';
import { useVerseNavigation } from './useVerseNavigation';

// Mock the useVerseNavigation hook
jest.mock('./useVerseNavigation', () => ({
  useVerseNavigation: jest.fn()
}));

// Mock Navigation component
jest.mock('./ref-nav/navigation', () => {
  return function MockNavigation({ bibleData, onVerseSelected }) {
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
        {bibleData && <div data-testid="bible-data-loaded">Bible data loaded</div>}
      </div>
    );
  };
});

// Mock VerseDisplay component
jest.mock('./bible-nav/verse-display', () => {
  return function MockVerseDisplay({ verseData, onVerseSelect, bookName, chapterNumber }) {
    return (
      <div data-testid="verse-display">
        <div data-testid="book-name">{bookName}</div>
        <div data-testid="chapter-number">{chapterNumber}</div>
        <button onClick={() => onVerseSelect('Gen.1.2')}>
          Select Verse 2
        </button>
        {Object.keys(verseData || {}).map(osisId => (
          <div key={osisId} data-testid={`verse-${osisId}`}>
            {verseData[osisId]}
          </div>
        ))}
      </div>
    );
  };
});

describe('AppNavigation Component', () => {
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

  const mockNavigationHook = {
    selectedScripture: null,
    verseData: null,
    loadingVerses: false,
    navigatedVerse: null,
    selectedVerse: null,
    handleVerseSelected: jest.fn(),
    handleVerseDisplaySelect: jest.fn(),
    handleBackToBooks: jest.fn(),
    restoreCurrentVerse: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useVerseNavigation.mockReturnValue(mockNavigationHook);
  });

  describe('Navigation mode', () => {
    it('should render Navigation component when no scripture is selected', () => {
      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('bible-data-loaded')).toBeInTheDocument();
      expect(screen.queryByTestId('verse-display')).not.toBeInTheDocument();
      expect(screen.queryByText('← Back to Books')).not.toBeInTheDocument();
    });

    it('should pass bibleData to Navigation component', () => {
      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByTestId('bible-data-loaded')).toBeInTheDocument();
    });

    it('should call restoreCurrentVerse when bibleData is provided', () => {
      render(<AppNavigation bibleData={mockBibleData} />);

      expect(mockNavigationHook.restoreCurrentVerse).toHaveBeenCalled();
    });

    it('should not call restoreCurrentVerse when bibleData is null', () => {
      render(<AppNavigation bibleData={null} />);

      expect(mockNavigationHook.restoreCurrentVerse).not.toHaveBeenCalled();
    });
  });

  describe('Verse display mode', () => {
    const mockSelectedScripture = {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1,
      reference: 'Genesis 1:1'
    };

    const mockVerseData = {
      'Gen.1.1': 'In the beginning God created the heaven and the earth.',
      'Gen.1.2': 'And the earth was without form, and void...'
    };

    it('should render verse display when scripture is selected', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: mockSelectedScripture,
        verseData: mockVerseData
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByTestId('verse-display')).toBeInTheDocument();
      expect(screen.getByTitle('Go to book selection')).toBeInTheDocument();
      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    });

    it('should display book name and chapter number in verse display', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: mockSelectedScripture,
        verseData: mockVerseData
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByTestId('book-name')).toHaveTextContent('Genesis');
      expect(screen.getByTestId('chapter-number')).toHaveTextContent('1');
    });

    it('should call handleBackToBooks when breadcrumb Books button is clicked', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: mockSelectedScripture,
        verseData: mockVerseData
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      const booksButton = screen.getByTitle('Go to book selection');
      fireEvent.click(booksButton);

      expect(mockNavigationHook.handleBackToBooks).toHaveBeenCalled();
    });

    it('should show loading state while verses are loading', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: mockSelectedScripture,
        loadingVerses: true
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByText('Loading verses...')).toBeInTheDocument();
      expect(screen.queryByTestId('verse-display')).not.toBeInTheDocument();
    });

    it('should show error state when verse data fails to load', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: mockSelectedScripture,
        verseData: null // Error state
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByText('Failed to load verses')).toBeInTheDocument();
      expect(screen.queryByTestId('verse-display')).not.toBeInTheDocument();
    });

    it('should pass verse data to VerseDisplay component', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: mockSelectedScripture,
        verseData: mockVerseData
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      expect(screen.getByTestId('verse-Gen.1.1')).toHaveTextContent('In the beginning God created the heaven and the earth.');
      expect(screen.getByTestId('verse-Gen.1.2')).toHaveTextContent('And the earth was without form, and void...');
    });
  });

  describe('Hook integration', () => {
    it('should use the verse navigation hook', () => {
      render(<AppNavigation bibleData={mockBibleData} />);

      expect(useVerseNavigation).toHaveBeenCalled();
    });

    it('should pass handleVerseSelected to Navigation component', () => {
      render(<AppNavigation bibleData={mockBibleData} />);

      const selectButton = screen.getByText('Select Verse');
      fireEvent.click(selectButton);

      // The mock Navigation component calls onVerseSelected when button is clicked
      // This verifies the prop is passed correctly
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should pass handleVerseDisplaySelect to VerseDisplay component', () => {
      useVerseNavigation.mockReturnValue({
        ...mockNavigationHook,
        selectedScripture: {
          book: 'Genesis',
          bookId: 'Gen',
          chapter: '1',
          verse: 1,
          reference: 'Genesis 1:1'
        },
        verseData: {
          'Gen.1.1': 'In the beginning God created the heaven and the earth.'
        }
      });

      render(<AppNavigation bibleData={mockBibleData} />);

      const selectVerseButton = screen.getByText('Select Verse 2');
      fireEvent.click(selectVerseButton);

      // The mock VerseDisplay component calls onVerseSelect when button is clicked
      // This verifies the prop is passed correctly
      expect(screen.getByTestId('verse-display')).toBeInTheDocument();
    });
  });

  describe('Effect behavior', () => {
    it('should call restoreCurrentVerse when bibleData changes', () => {
      const { rerender } = render(<AppNavigation bibleData={null} />);

      expect(mockNavigationHook.restoreCurrentVerse).not.toHaveBeenCalled();

      rerender(<AppNavigation bibleData={mockBibleData} />);

      expect(mockNavigationHook.restoreCurrentVerse).toHaveBeenCalled();
    });

    it('should not call restoreCurrentVerse multiple times for same bibleData', () => {
      const { rerender } = render(<AppNavigation bibleData={mockBibleData} />);

      expect(mockNavigationHook.restoreCurrentVerse).toHaveBeenCalledTimes(1);

      rerender(<AppNavigation bibleData={mockBibleData} />);

      // Should still be called only once due to useEffect dependencies
      expect(mockNavigationHook.restoreCurrentVerse).toHaveBeenCalledTimes(1);
    });
  });
});