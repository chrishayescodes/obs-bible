import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BibleBookSelector from './';

// Mock CSS import
jest.mock('./BibleBookSelector.css', () => ({}));

const mockBibleData = {
  old_testament: {
    name: 'Old Testament',
    books: {
      Gen: {
        title: 'Genesis',
        category: 'Pentateuch',
        chapter_count: 50,
        total_verses: 1533,
        chapters: { '1': 31, '2': 25 }
      },
      Exod: {
        title: 'Exodus',
        category: 'Pentateuch',
        chapter_count: 40,
        total_verses: 1213,
        chapters: { '1': 22, '2': 25 }
      },
      Ps: {
        title: 'Psalms',
        category: 'Poetry',
        chapter_count: 150,
        total_verses: 2461,
        chapters: { '1': 6, '2': 12 }
      }
    }
  },
  new_testament: {
    name: 'New Testament',
    books: {
      Matt: {
        title: 'Matthew',
        category: 'Gospels',
        chapter_count: 28,
        total_verses: 1071,
        chapters: { '1': 25, '2': 23 }
      },
      Rom: {
        title: 'Romans',
        category: 'Pauline Epistles',
        chapter_count: 16,
        total_verses: 433,
        chapters: { '1': 32, '2': 29 }
      },
      Rev: {
        title: 'Revelation',
        category: 'Prophecy',
        chapter_count: 22,
        total_verses: 404,
        chapters: { '1': 20, '2': 29 }
      }
    }
  }
};

describe('BibleBookSelector', () => {
  const mockOnBookSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('renders loading message when bibleData is null', () => {
      render(<BibleBookSelector bibleData={null} onBookSelect={mockOnBookSelect} />);
      expect(screen.getByText('Loading Bible books...')).toBeInTheDocument();
    });

    test('renders loading message when bibleData is undefined', () => {
      render(<BibleBookSelector bibleData={undefined} onBookSelect={mockOnBookSelect} />);
      expect(screen.getByText('Loading Bible books...')).toBeInTheDocument();
    });
  });

  describe('Rendering with Data', () => {
    test('renders Old Testament and New Testament books', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      // Should render books from both testaments
      expect(screen.getByText('Gen')).toBeInTheDocument();
      expect(screen.getByText('Matt')).toBeInTheDocument();
    });

    test('renders all Old Testament books', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      expect(screen.getByText('Gen')).toBeInTheDocument();
      expect(screen.getByText('Exod')).toBeInTheDocument();
      expect(screen.getByText('Ps')).toBeInTheDocument();
    });

    test('renders all New Testament books', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      expect(screen.getByText('Matt')).toBeInTheDocument();
      expect(screen.getByText('Rom')).toBeInTheDocument();
      expect(screen.getByText('Rev')).toBeInTheDocument();
    });

    test('applies correct CSS classes for categories', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      const psalmsButton = screen.getByText('Ps').closest('button');
      const matthewButton = screen.getByText('Matt').closest('button');
      const romansButton = screen.getByText('Rom').closest('button');
      const revelationButton = screen.getByText('Rev').closest('button');

      expect(genesisButton).toHaveClass('category-pentateuch');
      expect(psalmsButton).toHaveClass('category-poetry');
      expect(matthewButton).toHaveClass('category-gospels');
      expect(romansButton).toHaveClass('category-pauline-epistles');
      expect(revelationButton).toHaveClass('category-prophecy');
    });

    test('sets correct title attributes with book information', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      expect(genesisButton).toHaveAttribute('title', 'Genesis (Pentateuch) - 50 chapters, 1533 verses');
      
      const matthewButton = screen.getByText('Matt').closest('button');
      expect(matthewButton).toHaveAttribute('title', 'Matthew (Gospels) - 28 chapters, 1071 verses');
    });
  });

  describe('Book Selection', () => {
    test('calls onBookSelect when a book is clicked', async () => {
      const user = userEvent.setup();
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      await user.click(genesisButton);
      
      expect(mockOnBookSelect).toHaveBeenCalledTimes(1);
      expect(mockOnBookSelect).toHaveBeenCalledWith('Gen', mockBibleData.old_testament.books.Gen);
    });

    test('updates selected state when a book is clicked', async () => {
      const user = userEvent.setup();
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      await user.click(genesisButton);
      
      expect(genesisButton).toHaveClass('selected');
    });

    test('only one book can be selected at a time', async () => {
      const user = userEvent.setup();
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      const exodusButton = screen.getByText('Exod').closest('button');
      
      await user.click(genesisButton);
      expect(genesisButton).toHaveClass('selected');
      expect(exodusButton).not.toHaveClass('selected');
      
      await user.click(exodusButton);
      expect(genesisButton).not.toHaveClass('selected');
      expect(exodusButton).toHaveClass('selected');
    });

    test('works without onBookSelect callback', async () => {
      const user = userEvent.setup();
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={null} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      
      // Should not throw an error
      await user.click(genesisButton);
      expect(genesisButton).toHaveClass('selected');
    });

    test('works with undefined onBookSelect callback', async () => {
      const user = userEvent.setup();
      render(<BibleBookSelector bibleData={mockBibleData} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      
      // Should not throw an error
      await user.click(genesisButton);
      expect(genesisButton).toHaveClass('selected');
    });
  });

  describe('Category Class Generation', () => {
    test('handles category names with spaces', () => {
      const testData = {
        old_testament: {
          name: 'Old Testament',
          books: {
            Test: {
              title: 'Test Book',
              category: 'Major Prophets',
              chapter_count: 1,
              total_verses: 1,
              chapters: { '1': 1 }
            }
          }
        },
        new_testament: { name: 'New Testament', books: {} }
      };

      render(<BibleBookSelector bibleData={testData} onBookSelect={mockOnBookSelect} />);
      
      const testButton = screen.getByText('Test').closest('button');
      expect(testButton).toHaveClass('category-major-prophets');
    });

    test('handles missing category', () => {
      const testData = {
        old_testament: {
          name: 'Old Testament',
          books: {
            Test: {
              title: 'Test Book',
              category: null,
              chapter_count: 1,
              total_verses: 1,
              chapters: { '1': 1 }
            }
          }
        },
        new_testament: { name: 'New Testament', books: {} }
      };

      render(<BibleBookSelector bibleData={testData} onBookSelect={mockOnBookSelect} />);
      
      const testButton = screen.getByText('Test').closest('button');
      expect(testButton).toHaveClass('category-unknown');
    });
  });

  describe('Structure and Layout', () => {
    test('renders testament sections with correct structure', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const selector = document.querySelector('.bible-book-selector');
      const testamentSections = document.querySelectorAll('.testament-section');
      const booksGrids = document.querySelectorAll('.books-grid');
      
      expect(testamentSections).toHaveLength(2);
      expect(booksGrids).toHaveLength(2);
    });

    test('renders buttons with correct classes', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const buttons = document.querySelectorAll('.book-button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toHaveClass('book-button');
        expect(button.className).toMatch(/category-/);
      });
    });
  });

  describe('Accessibility', () => {
    test('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const genesisButton = screen.getByText('Gen').closest('button');
      
      genesisButton.focus();
      await user.keyboard(' ');
      
      expect(mockOnBookSelect).toHaveBeenCalledWith('Gen', mockBibleData.old_testament.books.Gen);
    });

    test('buttons have meaningful titles for screen readers', () => {
      render(<BibleBookSelector bibleData={mockBibleData} onBookSelect={mockOnBookSelect} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('title');
        expect(button.getAttribute('title')).toMatch(/\d+ chapters, \d+ verses/);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty testament sections', () => {
      const emptyData = {
        old_testament: { name: 'Old Testament', books: {} },
        new_testament: { name: 'New Testament', books: {} }
      };

      render(<BibleBookSelector bibleData={emptyData} onBookSelect={mockOnBookSelect} />);
      
      // Should still render testament sections (just without headers)
      expect(document.querySelectorAll('.testament-section')).toHaveLength(2);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('handles malformed book data gracefully', () => {
      const malformedData = {
        old_testament: {
          name: 'Old Testament',
          books: {
            Test: {
              title: 'Test Book',
              // Missing some properties
              chapter_count: 1
            }
          }
        },
        new_testament: { name: 'New Testament', books: {} }
      };

      render(<BibleBookSelector bibleData={malformedData} onBookSelect={mockOnBookSelect} />);
      
      const testButton = screen.getByText('Test').closest('button');
      expect(testButton).toBeInTheDocument();
      expect(testButton).toHaveAttribute('title');
    });
  });
});