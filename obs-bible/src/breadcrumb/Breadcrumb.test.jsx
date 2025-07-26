import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Breadcrumb from './';

// Mock CSS import
jest.mock('./Breadcrumb.css', () => ({}));

const mockBookData = {
  title: 'Genesis',
  category: 'Pentateuch',
  chapter_count: 50,
  total_verses: 1533,
  chapters: {
    '1': 31,
    '2': 25,
    '3': 24
  }
};

const mockBookData2 = {
  title: 'Matthew',
  category: 'Gospels',
  chapter_count: 28,
  total_verses: 1071,
  chapters: {
    '1': 25,
    '5': 48,
    '26': 75
  }
};

describe('Breadcrumb', () => {
  describe('Initial State - No Selections', () => {
    test('renders only Books button when no selections made', () => {
      render(<Breadcrumb />);
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.queryByText('Genesis')).not.toBeInTheDocument();
      expect(screen.queryByText('Chapter')).not.toBeInTheDocument();
      expect(screen.queryByText('Verse')).not.toBeInTheDocument();
    });

    test('Books button calls onReset when clicked', () => {
      const mockOnReset = jest.fn();
      render(<Breadcrumb onReset={mockOnReset} />);
      
      const booksButton = screen.getByText('📖 Books');
      fireEvent.click(booksButton);
      
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Book Selected State', () => {
    test('renders Books > Book when book is selected', () => {
      render(<Breadcrumb selectedBook={mockBookData} />);
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
    });

    test('book button is disabled and marked as current when no chapter selected', () => {
      render(<Breadcrumb selectedBook={mockBookData} />);
      
      const bookButton = screen.getByText('Genesis');
      expect(bookButton).toBeDisabled();
      expect(bookButton).toHaveClass('current');
    });

    test('does not show chapter or verse elements', () => {
      render(<Breadcrumb selectedBook={mockBookData} />);
      
      expect(screen.queryByText(/Chapter/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Verse/)).not.toBeInTheDocument();
    });
  });

  describe('Chapter Selected State', () => {
    test('renders Books > Book > Chapter when chapter is selected', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
        />
      );
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getAllByText('›')).toHaveLength(2);
    });

    test('book button is clickable when chapter is selected', () => {
      const mockOnBookSelect = jest.fn();
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1"
          onBookSelect={mockOnBookSelect}
        />
      );
      
      const bookButton = screen.getByText('Genesis');
      expect(bookButton).not.toBeDisabled();
      expect(bookButton).not.toHaveClass('current');
      
      fireEvent.click(bookButton);
      expect(mockOnBookSelect).toHaveBeenCalledTimes(1);
    });

    test('chapter button is disabled and marked as current when no verse selected', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
        />
      );
      
      const chapterButton = screen.getByText('Chapter 1');
      expect(chapterButton).toBeDisabled();
      expect(chapterButton).toHaveClass('current');
    });
  });

  describe('Verse Selected State - Complete Breadcrumb', () => {
    test('renders complete breadcrumb when verse is selected', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Verse 5')).toBeInTheDocument();
      expect(screen.getAllByText('›')).toHaveLength(3);
    });

    test('displays verse reference and chapter info', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      
      expect(screen.getByText('Genesis 1:5')).toBeInTheDocument();
      expect(screen.getByText('Chapter has 31 verses')).toBeInTheDocument();
    });

    test('all navigation buttons are clickable when verse selected', () => {
      const mockOnReset = jest.fn();
      const mockOnBookSelect = jest.fn();
      const mockOnChapterSelect = jest.fn();
      
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
          onReset={mockOnReset}
          onBookSelect={mockOnBookSelect}
          onChapterSelect={mockOnChapterSelect}
        />
      );
      
      // Test Books button
      fireEvent.click(screen.getByText('📖 Books'));
      expect(mockOnReset).toHaveBeenCalledTimes(1);
      
      // Test Book button
      fireEvent.click(screen.getByText('Genesis'));
      expect(mockOnBookSelect).toHaveBeenCalledTimes(1);
      
      // Test Chapter button
      fireEvent.click(screen.getByText('Chapter 1'));
      expect(mockOnChapterSelect).toHaveBeenCalledTimes(1);
    });

    test('verse element is not clickable', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      
      const verseElement = screen.getByText('Verse 5');
      expect(verseElement.tagName).toBe('SPAN');
      expect(verseElement).toHaveClass('breadcrumb-current');
    });
  });

  describe('User Interactions', () => {
    test('handles keyboard navigation', async () => {
      const user = userEvent.setup();
      const mockOnReset = jest.fn();
      const mockOnBookSelect = jest.fn();
      
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          onReset={mockOnReset}
          onBookSelect={mockOnBookSelect}
        />
      );
      
      // Tab to Books button
      await user.tab();
      expect(screen.getByText('📖 Books')).toHaveFocus();
      
      // Press Enter on Books button
      await user.keyboard('{Enter}');
      expect(mockOnReset).toHaveBeenCalledTimes(1);
      
      // Tab to book button
      await user.tab();
      expect(screen.getByText('Genesis')).toHaveFocus();
      
      // Press Enter on book button
      await user.keyboard('{Enter}');
      expect(mockOnBookSelect).toHaveBeenCalledTimes(1);
    });

    test('handles space key activation', async () => {
      const user = userEvent.setup();
      const mockOnChapterSelect = jest.fn();
      
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="10"
          onChapterSelect={mockOnChapterSelect}
        />
      );
      
      const chapterButton = screen.getByText('Chapter 1');
      chapterButton.focus();
      
      await user.keyboard(' ');
      expect(mockOnChapterSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and attributes', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Bible navigation breadcrumb');
      
      const separators = screen.getAllByText('›');
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('buttons have meaningful title attributes', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      
      expect(screen.getByText('📖 Books')).toHaveAttribute('title', 'Go to book selection');
      expect(screen.getByText('Genesis')).toHaveAttribute('title', 'Go to Genesis chapters');
      expect(screen.getByText('Chapter 1')).toHaveAttribute('title', 'Go to Genesis 1 verses');
      expect(screen.getByText('Verse 5')).toHaveAttribute('title', 'Currently viewing Genesis 1:5');
    });

    test('disabled buttons have appropriate titles', () => {
      render(<Breadcrumb selectedBook={mockBookData} />);
      
      const bookButton = screen.getByText('Genesis');
      expect(bookButton).toHaveAttribute('title', 'Currently viewing Genesis chapters');
    });
  });

  describe('Edge Cases', () => {
    test('handles missing callbacks gracefully', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      
      // Should not throw errors when clicking without callbacks
      expect(() => {
        fireEvent.click(screen.getByText('📖 Books'));
        fireEvent.click(screen.getByText('Genesis'));
        fireEvent.click(screen.getByText('Chapter 1'));
      }).not.toThrow();
    });

    test('handles different book and chapter combinations', () => {
      render(
        <Breadcrumb 
          selectedBook={mockBookData2} 
          selectedChapter="26" 
          selectedVerse="1"
        />
      );
      
      expect(screen.getByText('Matthew')).toBeInTheDocument();
      expect(screen.getByText('Chapter 26')).toBeInTheDocument();
      expect(screen.getByText('Verse 1')).toBeInTheDocument();
      expect(screen.getByText('Matthew 26:1')).toBeInTheDocument();
      expect(screen.getByText('Chapter has 75 verses')).toBeInTheDocument();
    });

    test('handles books with single chapters', () => {
      const singleChapterBook = {
        title: 'Obadiah',
        category: 'Minor Prophets',
        chapter_count: 1,
        total_verses: 21,
        chapters: { '1': 21 }
      };

      render(
        <Breadcrumb 
          selectedBook={singleChapterBook} 
          selectedChapter="1" 
          selectedVerse="10"
        />
      );
      
      expect(screen.getByText('Obadiah')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Obadiah 1:10')).toBeInTheDocument();
      expect(screen.getByText('Chapter has 21 verses')).toBeInTheDocument();
    });

    test('handles chapters with zero verses', () => {
      const bookWithZeroVerses = {
        title: 'Test Book',
        category: 'Test',
        chapter_count: 1,
        total_verses: 0,
        chapters: { '1': 0 }
      };

      render(
        <Breadcrumb 
          selectedBook={bookWithZeroVerses} 
          selectedChapter="1" 
          selectedVerse="1"
        />
      );
      
      expect(screen.getByText('Chapter has 0 verses')).toBeInTheDocument();
    });
  });

  describe('State Changes', () => {
    test('updates correctly when selections change', () => {
      const { rerender } = render(<Breadcrumb />);
      
      // Start with no selections
      expect(screen.getByText('📖 Books')).toBeInTheDocument();
      expect(screen.queryByText('Genesis')).not.toBeInTheDocument();
      
      // Add book selection
      rerender(<Breadcrumb selectedBook={mockBookData} />);
      expect(screen.getByText('Genesis')).toBeInTheDocument();
      
      // Add chapter selection
      rerender(<Breadcrumb selectedBook={mockBookData} selectedChapter="1" />);
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      
      // Add verse selection
      rerender(
        <Breadcrumb 
          selectedBook={mockBookData} 
          selectedChapter="1" 
          selectedVerse="5"
        />
      );
      expect(screen.getByText('Verse 5')).toBeInTheDocument();
      expect(screen.getByText('Genesis 1:5')).toBeInTheDocument();
    });
  });
});