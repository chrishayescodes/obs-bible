import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerseSelect from './';

// Mock CSS import
jest.mock('./VerseSelect.css', () => ({}));

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

const mockBookDataWithManyVerses = {
  title: 'Psalms',
  category: 'Poetry',
  chapter_count: 150,
  total_verses: 2461,
  chapters: {
    '119': 176 // Longest chapter in the Bible
  }
};

describe('VerseSelect', () => {
  describe('Component Rendering', () => {
    test('renders loading state when no book data is provided', () => {
      render(<VerseSelect bookData={null} chapterNumber="1" />);
      expect(screen.getByText('No chapter selected...')).toBeInTheDocument();
    });

    test('renders loading state when no chapter number is provided', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber={null} />);
      expect(screen.getByText('No chapter selected...')).toBeInTheDocument();
    });

    test('renders loading state when chapter does not exist', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="999" />);
      expect(screen.getByText('Loading verses...')).toBeInTheDocument();
    });

    test('renders book title and chapter number in header', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);
      expect(screen.getByText('Genesis 1')).toBeInTheDocument();
      expect(screen.getByText('31 verses')).toBeInTheDocument();
    });

    test('renders all verses as buttons', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);
      
      // Check that all 31 verses are rendered
      for (let i = 1; i <= 31; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument();
      }
    });

    test('renders correct number of verse buttons', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="2" />);
      
      // Chapter 2 has 25 verses
      const verseButtons = screen.getAllByRole('button');
      expect(verseButtons).toHaveLength(25);
    });
  });

  describe('User Interactions', () => {
    test('calls onVerseSelect when verse button is clicked', () => {
      const mockOnVerseSelect = jest.fn();
      render(
        <VerseSelect 
          bookData={mockBookData} 
          chapterNumber="1"
          onVerseSelect={mockOnVerseSelect} 
        />
      );

      const verse1Button = screen.getByText('1').closest('button');
      fireEvent.click(verse1Button);

      expect(mockOnVerseSelect).toHaveBeenCalledWith(1);
      expect(mockOnVerseSelect).toHaveBeenCalledTimes(1);
    });

    test('handles multiple verse selections', () => {
      const mockOnVerseSelect = jest.fn();
      render(
        <VerseSelect 
          bookData={mockBookData} 
          chapterNumber="1"
          onVerseSelect={mockOnVerseSelect} 
        />
      );

      const verse1Button = screen.getByText('1').closest('button');
      const verse5Button = screen.getByText('5').closest('button');

      fireEvent.click(verse1Button);
      fireEvent.click(verse5Button);

      expect(mockOnVerseSelect).toHaveBeenCalledTimes(2);
      expect(mockOnVerseSelect).toHaveBeenNthCalledWith(1, 1);
      expect(mockOnVerseSelect).toHaveBeenNthCalledWith(2, 5);
    });

    test('does not break when onVerseSelect is not provided', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);

      const verse1Button = screen.getByText('1').closest('button');
      
      // Should not throw an error
      expect(() => fireEvent.click(verse1Button)).not.toThrow();
    });

    test('updates selected state when verse is clicked', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);

      const verse1Button = screen.getByText('1').closest('button');
      
      // Initially not selected
      expect(verse1Button).not.toHaveClass('selected');
      
      // Click to select
      fireEvent.click(verse1Button);
      expect(verse1Button).toHaveClass('selected');
    });

    test('only one verse can be selected at a time', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);

      const verse1Button = screen.getByText('1').closest('button');
      const verse2Button = screen.getByText('2').closest('button');
      
      // Select verse 1
      fireEvent.click(verse1Button);
      expect(verse1Button).toHaveClass('selected');
      expect(verse2Button).not.toHaveClass('selected');
      
      // Select verse 2
      fireEvent.click(verse2Button);
      expect(verse1Button).not.toHaveClass('selected');
      expect(verse2Button).toHaveClass('selected');
    });
  });

  describe('User Event Testing', () => {
    test('handles keyboard navigation and selection', async () => {
      const user = userEvent.setup();
      const mockOnVerseSelect = jest.fn();
      
      render(
        <VerseSelect 
          bookData={mockBookData} 
          chapterNumber="1"
          onVerseSelect={mockOnVerseSelect} 
        />
      );

      const verse1Button = screen.getByText('1').closest('button');
      
      // Tab to the button and press Enter
      await user.tab();
      expect(verse1Button).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnVerseSelect).toHaveBeenCalledWith(1);
    });

    test('handles space key for button activation', async () => {
      const user = userEvent.setup();
      const mockOnVerseSelect = jest.fn();
      
      render(
        <VerseSelect 
          bookData={mockBookData} 
          chapterNumber="1"
          onVerseSelect={mockOnVerseSelect} 
        />
      );

      const verse3Button = screen.getByText('3').closest('button');
      verse3Button.focus();
      
      await user.keyboard(' ');
      expect(mockOnVerseSelect).toHaveBeenCalledWith(3);
    });
  });

  describe('Accessibility', () => {
    test('verse buttons have proper title attributes', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);

      const verse1Button = screen.getByText('1').closest('button');
      expect(verse1Button).toHaveAttribute('title', 'Verse 1');

      const verse10Button = screen.getByText('10').closest('button');
      expect(verse10Button).toHaveAttribute('title', 'Verse 10');
    });

    test('buttons are keyboard accessible', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);

      const verseButtons = screen.getAllByRole('button');
      
      verseButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    test('proper semantic structure with headings', () => {
      render(<VerseSelect bookData={mockBookData} chapterNumber="1" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Genesis 1');
    });
  });

  describe('Edge Cases', () => {
    test('handles chapter with single verse', () => {
      const singleVerseChapter = {
        title: 'Test Book',
        category: 'Test',
        chapter_count: 1,
        total_verses: 1,
        chapters: { '1': 1 }
      };

      render(<VerseSelect bookData={singleVerseChapter} chapterNumber="1" />);

      expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      expect(screen.getByText('1 verses')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      
      const verseButtons = screen.getAllByRole('button');
      expect(verseButtons).toHaveLength(1);
    });

    test('handles chapter with many verses', () => {
      render(<VerseSelect bookData={mockBookDataWithManyVerses} chapterNumber="119" />);

      expect(screen.getByText('Psalms 119')).toBeInTheDocument();
      expect(screen.getByText('176 verses')).toBeInTheDocument();
      
      // Check first and last verses
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('176')).toBeInTheDocument();
      
      const verseButtons = screen.getAllByRole('button');
      expect(verseButtons).toHaveLength(176);
    });

    test('handles zero verses gracefully', () => {
      const emptyChapter = {
        title: 'Empty Chapter',
        category: 'Test',
        chapter_count: 1,
        total_verses: 0,
        chapters: { '1': 0 }
      };

      render(<VerseSelect bookData={emptyChapter} chapterNumber="1" />);

      expect(screen.getByText('Empty Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('0 verses')).toBeInTheDocument();
      
      // Should not have any verse buttons
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Component State Management', () => {
    test('resets selection when chapter changes', () => {
      const { rerender } = render(
        <VerseSelect bookData={mockBookData} chapterNumber="1" />
      );

      const verse1Button = screen.getByText('1').closest('button');
      fireEvent.click(verse1Button);
      expect(verse1Button).toHaveClass('selected');

      // Change chapter
      rerender(
        <VerseSelect bookData={mockBookData} chapterNumber="2" />
      );
      
      // Should now show chapter 2 verses, and no selection
      expect(screen.getByText('Genesis 2')).toBeInTheDocument();
      expect(screen.getByText('25 verses')).toBeInTheDocument();
      
      const newVerse1Button = screen.getByText('1').closest('button');
      expect(newVerse1Button).not.toHaveClass('selected');
    });

    test('resets selection when book changes', () => {
      const { rerender } = render(
        <VerseSelect bookData={mockBookData} chapterNumber="1" />
      );

      const verse1Button = screen.getByText('1').closest('button');
      fireEvent.click(verse1Button);
      expect(verse1Button).toHaveClass('selected');

      // Change book
      const differentBookData = {
        title: 'Exodus',
        category: 'Pentateuch',
        chapter_count: 40,
        total_verses: 1213,
        chapters: { '1': 22 }
      };

      rerender(
        <VerseSelect bookData={differentBookData} chapterNumber="1" />
      );
      
      // Should show new book and no selection
      expect(screen.getByText('Exodus 1')).toBeInTheDocument();
      expect(screen.getByText('22 verses')).toBeInTheDocument();
      
      const newVerse1Button = screen.getByText('1').closest('button');
      expect(newVerse1Button).not.toHaveClass('selected');
    });
  });

  describe('Error Handling', () => {
    test('handles malformed chapter data gracefully', () => {
      const malformedBookData = {
        title: 'Malformed Book',
        category: 'Test',
        chapter_count: 1,
        total_verses: 3,
        chapters: { '1': 'invalid', '2': null, '3': undefined }
      };

      // Should render loading state for invalid chapter data
      expect(() => {
        render(<VerseSelect bookData={malformedBookData} chapterNumber="1" />);
      }).not.toThrow();

      expect(screen.getByText('Loading verses...')).toBeInTheDocument();
    });
  });
});