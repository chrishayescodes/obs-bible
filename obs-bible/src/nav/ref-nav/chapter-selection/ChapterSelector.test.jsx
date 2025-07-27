import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChapterSelector from './';

// Mock CSS import
jest.mock('./ChapterSelector.css', () => ({}));

const mockBookData = {
  title: 'Genesis',
  category: 'Pentateuch',
  chapter_count: 50,
  total_verses: 1533,
  chapters: {
    '1': 31,
    '2': 25,
    '3': 24,
    '4': 26,
    '5': 32
  }
};

const mockBookDataWithManyChapters = {
  title: 'Psalms',
  category: 'Poetry',
  chapter_count: 150,
  total_verses: 2461,
  chapters: Object.fromEntries(
    Array.from({ length: 150 }, (_, i) => [`${i + 1}`, Math.floor(Math.random() * 20) + 5])
  )
};

describe('ChapterSelector', () => {
  describe('Component Rendering', () => {
    test('renders loading state when no book data is provided', () => {
      render(<ChapterSelector bookData={null} />);
      expect(screen.getByText('No book selected...')).toBeInTheDocument();
    });

    test('renders loading state when book data has no chapters', () => {
      const bookWithoutChapters = { title: 'Test Book', chapter_count: 0 };
      render(<ChapterSelector bookData={bookWithoutChapters} />);
      expect(screen.getByText('Loading chapters...')).toBeInTheDocument();
    });

    test('renders chapter buttons without header', () => {
      render(<ChapterSelector bookData={mockBookData} />);
      // Should render chapter buttons without header
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('renders all chapters as buttons', () => {
      render(<ChapterSelector bookData={mockBookData} />);
      
      // Check that all 5 chapters are rendered
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('buttons have verse count in title attributes', () => {
      render(<ChapterSelector bookData={mockBookData} />);
      
      // Check that verse counts are in title attributes (not displayed as text)
      const chapter1Button = screen.getByText('1').closest('button');
      expect(chapter1Button).toHaveAttribute('title', 'Chapter 1 - 31 verses');
      
      const chapter2Button = screen.getByText('2').closest('button');
      expect(chapter2Button).toHaveAttribute('title', 'Chapter 2 - 25 verses');
    });
  });

  describe('User Interactions', () => {
    test('calls onChapterSelect when chapter button is clicked', () => {
      const mockOnChapterSelect = jest.fn();
      render(
        <ChapterSelector 
          bookData={mockBookData} 
          onChapterSelect={mockOnChapterSelect} 
        />
      );

      const chapter1Button = screen.getByText('1').closest('button');
      fireEvent.click(chapter1Button);

      expect(mockOnChapterSelect).toHaveBeenCalledWith('1');
      expect(mockOnChapterSelect).toHaveBeenCalledTimes(1);
    });

    test('handles multiple chapter selections', () => {
      const mockOnChapterSelect = jest.fn();
      render(
        <ChapterSelector 
          bookData={mockBookData} 
          onChapterSelect={mockOnChapterSelect} 
        />
      );

      const chapter1Button = screen.getByText('1').closest('button');
      const chapter3Button = screen.getByText('3').closest('button');

      fireEvent.click(chapter1Button);
      fireEvent.click(chapter3Button);

      expect(mockOnChapterSelect).toHaveBeenCalledTimes(2);
      expect(mockOnChapterSelect).toHaveBeenNthCalledWith(1, '1');
      expect(mockOnChapterSelect).toHaveBeenNthCalledWith(2, '3');
    });

    test('does not break when onChapterSelect is not provided', () => {
      render(<ChapterSelector bookData={mockBookData} />);

      const chapter1Button = screen.getByText('1').closest('button');
      
      // Should not throw an error
      expect(() => fireEvent.click(chapter1Button)).not.toThrow();
    });

    test('updates selected state when chapter is clicked', () => {
      render(<ChapterSelector bookData={mockBookData} />);

      const chapter1Button = screen.getByText('1').closest('button');
      
      // Initially not selected
      expect(chapter1Button).not.toHaveClass('selected');
      
      // Click to select
      fireEvent.click(chapter1Button);
      expect(chapter1Button).toHaveClass('selected');
    });
  });

  describe('User Event Testing', () => {
    test('handles keyboard navigation and selection', async () => {
      const user = userEvent.setup();
      const mockOnChapterSelect = jest.fn();
      
      render(
        <ChapterSelector 
          bookData={mockBookData} 
          onChapterSelect={mockOnChapterSelect} 
        />
      );

      const chapter1Button = screen.getByText('1').closest('button');
      
      // Tab to the button and press Enter
      await user.tab();
      expect(chapter1Button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnChapterSelect).toHaveBeenCalledWith('1');
    });

    test('handles space key for button activation', async () => {
      const user = userEvent.setup();
      const mockOnChapterSelect = jest.fn();
      
      render(
        <ChapterSelector 
          bookData={mockBookData} 
          onChapterSelect={mockOnChapterSelect} 
        />
      );

      const chapter2Button = screen.getByText('2').closest('button');
      chapter2Button.focus();
      
      await user.keyboard(' ');
      expect(mockOnChapterSelect).toHaveBeenCalledWith('2');
    });
  });

  describe('Accessibility', () => {
    test('chapter buttons have proper title attributes', () => {
      render(<ChapterSelector bookData={mockBookData} />);

      const chapter1Button = screen.getByText('1').closest('button');
      expect(chapter1Button).toHaveAttribute('title', 'Chapter 1 - 31 verses');

      const chapter2Button = screen.getByText('2').closest('button');
      expect(chapter2Button).toHaveAttribute('title', 'Chapter 2 - 25 verses');
    });

    test('buttons are keyboard accessible', () => {
      render(<ChapterSelector bookData={mockBookData} />);

      const chapterButtons = screen.getAllByRole('button');
      
      chapterButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    test('proper semantic structure with screen-reader-only heading', () => {
      render(<ChapterSelector bookData={mockBookData} />);

      // Should have screen-reader-only heading for accessibility
      const heading = screen.getByRole('heading', { name: 'Select Chapter' });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('sr-only');
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles book with single chapter', () => {
      const singleChapterBook = {
        title: 'Obadiah',
        category: 'Minor Prophets',
        chapter_count: 1,
        total_verses: 21,
        chapters: { '1': 21 }
      };

      render(<ChapterSelector bookData={singleChapterBook} />);

      // Should render the single chapter button without header
      expect(screen.getByText('1')).toBeInTheDocument();
      
      // Verse count should be in title attribute, not displayed as text
      const chapter1Button = screen.getByText('1').closest('button');
      expect(chapter1Button).toHaveAttribute('title', 'Chapter 1 - 21 verses');
    });

    test('handles book with many chapters', () => {
      render(<ChapterSelector bookData={mockBookDataWithManyChapters} />);

      // Should render first and last chapter buttons without header
      
      // Check first and last chapters
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    test('handles empty chapters object', () => {
      const emptyChaptersBook = {
        title: 'Empty Book',
        category: 'Test',
        chapter_count: 0,
        total_verses: 0,
        chapters: {}
      };

      render(<ChapterSelector bookData={emptyChaptersBook} />);

      // Should render empty grid (no chapter buttons) without header
      expect(document.querySelector('.chapters-grid')).toBeInTheDocument();
      
      // Should not have any chapter buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('handles chapters with zero verses', () => {
      const bookWithZeroVerses = {
        title: 'Test Book',
        category: 'Test',
        chapter_count: 2,
        total_verses: 0,
        chapters: { '1': 0, '2': 0 }
      };

      render(<ChapterSelector bookData={bookWithZeroVerses} />);

      // Verse counts should not be displayed as text anymore, only in title attributes
      const chapter1Button = screen.getByText('1').closest('button');
      const chapter2Button = screen.getByText('2').closest('button');
      expect(chapter1Button).toHaveAttribute('title', 'Chapter 1 - 0 verses');
      expect(chapter2Button).toHaveAttribute('title', 'Chapter 2 - 0 verses');
    });
  });

  describe('Component State Management', () => {
    test('maintains selection state across re-renders', () => {
      const { rerender } = render(<ChapterSelector bookData={mockBookData} />);

      const chapter1Button = screen.getByText('1').closest('button');
      fireEvent.click(chapter1Button);
      expect(chapter1Button).toHaveClass('selected');

      // Re-render with same props
      rerender(<ChapterSelector bookData={mockBookData} />);
      
      const updatedChapter1Button = screen.getByText('1').closest('button');
      expect(updatedChapter1Button).toHaveClass('selected');
    });

    test('resets selection when book data changes', () => {
      const { rerender } = render(<ChapterSelector bookData={mockBookData} />);

      const chapter1Button = screen.getByText('1').closest('button');
      fireEvent.click(chapter1Button);
      expect(chapter1Button).toHaveClass('selected');

      // Change book data
      const differentBookData = {
        title: 'Exodus',
        category: 'Pentateuch',
        chapter_count: 40,
        total_verses: 1213,
        chapters: { '1': 22, '2': 25 }
      };

      rerender(<ChapterSelector bookData={differentBookData} />);
      
      // Previous selection should be cleared
      const newChapter1Button = screen.getByText('1').closest('button');
      expect(newChapter1Button).not.toHaveClass('selected');
    });
  });

  describe('Error Handling', () => {
    test('handles malformed chapter data gracefully', () => {
      const malformedBookData = {
        title: 'Malformed Book',
        category: 'Test',
        chapter_count: 2,
        total_verses: 50,
        chapters: { '1': 'invalid', '2': null, '3': undefined }
      };

      expect(() => {
        render(<ChapterSelector bookData={malformedBookData} />);
      }).not.toThrow();

      // Should still render chapter buttons
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});