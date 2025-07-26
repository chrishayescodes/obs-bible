import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from './';

// Mock CSS imports
jest.mock('./Navigation.css', () => ({}));
jest.mock('../book-selection/BibleBookSelector.css', () => ({}));
jest.mock('../chapter-selection/ChapterSelector.css', () => ({}));
jest.mock('../verse-selection/VerseSelect.css', () => ({}));
jest.mock('../breadcrumb/Breadcrumb.css', () => ({}));

const mockBibleData = {
  old_testament: {
    name: 'Old Testament',
    books: {
      Gen: {
        title: 'Genesis',
        category: 'Pentateuch',
        chapter_count: 50,
        total_verses: 1533,
        chapters: {
          '1': 31,
          '2': 25,
          '3': 24
        }
      },
      Exod: {
        title: 'Exodus',
        category: 'Pentateuch',
        chapter_count: 40,
        total_verses: 1213,
        chapters: {
          '1': 22,
          '2': 25
        }
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
        chapters: {
          '1': 25,
          '2': 23,
          '5': 48
        }
      }
    }
  }
};

const singleChapterBook = {
  old_testament: {
    name: 'Old Testament',
    books: {
      Obad: {
        title: 'Obadiah',
        category: 'Minor Prophets',
        chapter_count: 1,
        total_verses: 21,
        chapters: {
          '1': 21
        }
      }
    }
  },
  new_testament: {
    name: 'New Testament',
    books: {}
  }
};

describe('Navigation', () => {
  describe('Initial State - Book Selection', () => {
    test('renders BibleBookSelector when no selections made', () => {
      render(<Navigation bibleData={mockBibleData} />);
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByText('Gen')).toBeInTheDocument();
      expect(screen.getByText('Exod')).toBeInTheDocument();
      expect(screen.getByText('Matt')).toBeInTheDocument();
    });

    test('shows breadcrumb with only Books button initially', () => {
      render(<Navigation bibleData={mockBibleData} />);
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.queryByText('›')).not.toBeInTheDocument();
    });

    test('handles null bibleData gracefully', () => {
      render(<Navigation bibleData={null} />);
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.queryByText('Gen')).not.toBeInTheDocument();
    });

    test('handles empty bibleData gracefully', () => {
      const emptyData = {
        old_testament: { name: 'Old Testament', books: {} },
        new_testament: { name: 'New Testament', books: {} }
      };
      render(<Navigation bibleData={emptyData} />);
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.queryByText('Gen')).not.toBeInTheDocument();
    });
  });

  describe('Book Selection Flow', () => {
    test('navigates to chapter selection when book is clicked', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      const genesisButton = screen.getByText('Gen');
      await user.click(genesisButton);
      
      // Should show chapter selector
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Should show breadcrumb with book title
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Genesis/ })).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
      
      // Book selection should no longer be visible
      expect(screen.queryByText('Exod')).not.toBeInTheDocument();
      expect(screen.queryByText('Matt')).not.toBeInTheDocument();
    });

    test('logs book selection to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      const genesisButton = screen.getByText('Gen');
      await user.click(genesisButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Selected book:', 'Gen', expect.objectContaining({
        title: 'Genesis',
        category: 'Pentateuch'
      }));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Chapter Selection Flow', () => {
    test('navigates to verse selection when chapter is clicked', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Select Genesis
      await user.click(screen.getByText('Gen'));
      
      // Select Chapter 1
      await user.click(screen.getByText('1'));
      
      // Should show verse selector
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument(); // Genesis 1 has 31 verses
      
      // Should show complete breadcrumb
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getAllByText('›')).toHaveLength(2);
      
      // Chapter 2 and 3 buttons should not exist (only verse buttons 1-31)
      expect(screen.queryByTitle('Chapter 2 - 25 verses')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Chapter 3 - 24 verses')).not.toBeInTheDocument();
    });

    test('logs chapter selection to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Selected chapter:', '1');
      
      consoleSpy.mockRestore();
    });

    test('resets verse selection when different chapter is selected', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Navigate to Genesis > Chapter 1 > Verse 5
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('5'));
      
      // Verify verse is selected
      expect(screen.getByText('Genesis 1:5')).toBeInTheDocument();
      
      // Go back to chapters and select different chapter
      await user.click(screen.getByText('Genesis'));
      await user.click(screen.getByText('2'));
      
      // Verse selection should be reset
      expect(screen.queryByText('Genesis 1:5')).not.toBeInTheDocument();
      expect(screen.queryByText('Verse 5')).not.toBeInTheDocument();
    });
  });

  describe('Verse Selection Flow', () => {
    test('shows verse reference when verse is clicked', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('15'));
      
      // Should show complete breadcrumb with verse
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Verse 15')).toBeInTheDocument();
      expect(screen.getAllByText('›')).toHaveLength(3);
      
      // Should show verse reference
      expect(screen.getByText('Genesis 1:15')).toBeInTheDocument();
      expect(screen.getByText('Chapter has 31 verses')).toBeInTheDocument();
    });

    test('logs verse selection to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('10'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Selected verse:', 10);
      
      consoleSpy.mockRestore();
    });

    test('calls onVerseSelected callback with scripture reference', async () => {
      const mockOnVerseSelected = jest.fn();
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} onVerseSelected={mockOnVerseSelected} />);
      
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('15'));
      
      expect(mockOnVerseSelected).toHaveBeenCalledWith({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 15,
        reference: 'Genesis 1:15'
      });
    });

    test('does not call onVerseSelected when callback not provided', async () => {
      const user = userEvent.setup();
      
      // Should not throw error when onVerseSelected is not provided
      expect(() => {
        render(<Navigation bibleData={mockBibleData} />);
      }).not.toThrow();
      
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('5'));
      
      // Should complete without errors
      expect(screen.getByText('Genesis 1:5')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb Navigation', () => {
    test('Books button resets all selections', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Navigate to verse
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('5'));
      
      // Click Books button
      await user.click(screen.getByText('📖 Books'));
      
      // Should return to book selection
      expect(screen.getByText('Gen')).toBeInTheDocument();
      expect(screen.getByText('Exod')).toBeInTheDocument();
      expect(screen.getByText('Matt')).toBeInTheDocument();
      
      // Verse reference should be gone
      expect(screen.queryByText('Genesis 1:5')).not.toBeInTheDocument();
    });

    test('Book button resets chapter and verse selections', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Navigate to verse
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('5'));
      
      // Click Genesis button in breadcrumb
      await user.click(screen.getByText('Genesis'));
      
      // Should return to chapter selection for Genesis
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      // Verse reference should be gone
      expect(screen.queryByText('Genesis 1:5')).not.toBeInTheDocument();
      expect(screen.queryByText('Verse 5')).not.toBeInTheDocument();
    });

    test('Chapter button resets verse selection', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Navigate to verse
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('10'));
      
      // Click Chapter 1 button in breadcrumb
      await user.click(screen.getByText('Chapter 1'));
      
      // Should return to verse selection for Genesis 1
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('31')).toBeInTheDocument();
      
      // Verse reference should be gone
      expect(screen.queryByText('Genesis 1:10')).not.toBeInTheDocument();
      expect(screen.queryByText('Verse 10')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('maintains separate state for different books', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Select Genesis > Chapter 1 > Verse 5
      await user.click(screen.getByText('Gen'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('5'));
      
      // Go back to books and select Matthew
      await user.click(screen.getByText('📖 Books'));
      await user.click(screen.getByText('Matt'));
      
      // Should show Matthew's chapters, not Genesis chapters
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      
      // Previous selection should be cleared
      expect(screen.queryByText('Genesis 1:5')).not.toBeInTheDocument();
    });

    test('handles state transitions correctly', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Test complete navigation flow
      await user.click(screen.getByText('Gen'));
      expect(screen.getByRole('button', { name: /Genesis/ })).toHaveClass('current');
      
      await user.click(screen.getByText('1'));
      expect(screen.getByText('Chapter 1')).toHaveClass('current');
      expect(screen.getByText('Genesis')).not.toHaveClass('current');
      
      await user.click(screen.getByText('20'));
      expect(screen.getByText('Verse 20')).toHaveClass('breadcrumb-current');
      expect(screen.getByText('Chapter 1')).not.toHaveClass('current');
    });
  });

  describe('Edge Cases', () => {
    test('handles single chapter books correctly', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={singleChapterBook} />);
      
      await user.click(screen.getByText('Obad'));
      await user.click(screen.getByText('1'));
      await user.click(screen.getByText('10'));
      
      expect(screen.getByText('Obadiah 1:10')).toBeInTheDocument();
      expect(screen.getByText('Chapter has 21 verses')).toBeInTheDocument();
    });

    test('handles empty chapter data gracefully', async () => {
      const emptyChapterData = {
        old_testament: {
          name: 'Old Testament',
          books: {
            Test: {
              title: 'Test Book',
              category: 'Test',
              chapter_count: 1,
              total_verses: 0,
              chapters: {}
            }
          }
        },
        new_testament: {
          name: 'New Testament',
          books: {}
        }
      };
      
      const user = userEvent.setup();
      render(<Navigation bibleData={emptyChapterData} />);
      
      await user.click(screen.getByText('Test'));
      
      // Should show loading state or handle gracefully
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Test Book/ })).toBeInTheDocument();
    });

    test('handles missing verse data gracefully', async () => {
      const missingVerseData = {
        old_testament: {
          name: 'Old Testament',
          books: {
            Test: {
              title: 'Test Book',
              category: 'Test',
              chapter_count: 1,
              total_verses: 5,
              chapters: {
                '1': 5
              }
            }
          }
        },
        new_testament: {
          name: 'New Testament',
          books: {}
        }
      };
      
      const user = userEvent.setup();
      render(<Navigation bibleData={missingVerseData} />);
      
      await user.click(screen.getByText('Test'));
      await user.click(screen.getByText('1'));
      
      // Should show verse buttons
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    test('integrates all child components correctly', () => {
      render(<Navigation bibleData={mockBibleData} />);
      
      // Should have navigation wrapper
      expect(document.querySelector('.navigation')).toBeInTheDocument();
      
      // Should have breadcrumb
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Should have book selector initially
      expect(screen.getByText('Old Testament')).toBeInTheDocument();
      expect(screen.getByText('New Testament')).toBeInTheDocument();
    });

    test('passes correct props to child components', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Test that book data is passed correctly
      await user.click(screen.getByText('Gen'));
      
      // ChapterSelector should receive correct book data
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('maintains focus management during navigation', async () => {
      const user = userEvent.setup();
      render(<Navigation bibleData={mockBibleData} />);
      
      // Navigation should maintain proper focus flow
      await user.tab();
      expect(screen.getByText('📖 Books')).toHaveFocus();
    });

    test('provides semantic HTML structure', () => {
      render(<Navigation bibleData={mockBibleData} />);
      
      // Should have proper navigation landmark
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Should have proper list structure in breadcrumb
      expect(document.querySelector('ol')).toBeInTheDocument();
    });
  });
});