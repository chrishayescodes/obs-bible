import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerseDisplay from './index';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('VerseDisplay', () => {
  const mockVerseData = {
    'Gen.1.1': 'In the beginning God created the heaven and the earth.',
    'Gen.1.2': 'And the earth was without form, and void; and darkness was upon the face of the deep.',
    'Gen.1.3': 'And God said, Let there be light: and there was light.',
    'Gen.1.4': 'And God saw the light, that it was good: and God divided the light from the darkness.',
    'Gen.1.5': 'And God called the light Day, and the darkness he called Night.'
  };

  const mockOnVerseSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders verse display with all verses', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      // Check that all verse numbers are rendered (using more specific selectors)
      expect(screen.getByRole('button', { name: /Verse 1:/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verse 2:/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verse 3:/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verse 4:/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verse 5:/ })).toBeInTheDocument();

      // Check that verse text is rendered
      expect(screen.getByText('In the beginning God created the heaven and the earth.')).toBeInTheDocument();
      expect(screen.getByText(/And the earth was without form/)).toBeInTheDocument();
    });

    it('renders with book name and chapter number', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          bookName="Genesis"
          chapterNumber="1"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      expect(screen.getByText('Genesis 1')).toBeInTheDocument();
    });

    it('renders empty state when no verse data provided', () => {
      render(<VerseDisplay verseData={{}} />);
      expect(screen.getByText('No verses to display')).toBeInTheDocument();
    });

    it('renders empty state when verseData is null', () => {
      render(<VerseDisplay verseData={null} />);
      expect(screen.getByText('No verses to display')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onVerseSelect when verse is clicked', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const firstVerse = screen.getByRole('button', { 
        name: /Verse 1: In the beginning/ 
      });
      fireEvent.click(firstVerse);

      expect(mockOnVerseSelect).toHaveBeenCalledWith('Gen.1.1');
    });

    it('highlights selected verse', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const selectedVerse = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      expect(selectedVerse).toHaveClass('selected');
    });

    it('updates selection when clicking different verse', () => {
      const { rerender } = render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      // Click on verse 3
      const verse3 = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      fireEvent.click(verse3);

      // Rerender with new selection
      rerender(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      expect(verse3).toHaveClass('selected');
      
      const verse1 = screen.getByRole('button', { 
        name: /Verse 1: In the beginning/ 
      });
      expect(verse1).not.toHaveClass('selected');
    });
  });

  describe('Auto-scroll functionality', () => {
    it('scrolls to selected verse on mount', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const selectedVerse = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      
      expect(selectedVerse.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
    });

    it('applies navigation highlight when navigating to unselected verse', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const selectedVerse = screen.getByRole('button', { 
        name: /Verse 1: In the beginning/ 
      });
      const navigatedVerse = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      
      // Selected verse should have selected class
      expect(selectedVerse).toHaveClass('selected');
      expect(selectedVerse).not.toHaveClass('navigated');
      
      // Navigated verse should have navigated class but not selected
      expect(navigatedVerse).toHaveClass('navigated');
      expect(navigatedVerse).not.toHaveClass('selected');
    });

    it('removes navigation highlight after timeout', async () => {
      jest.useFakeTimers();
      
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const navigatedVerse = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      
      expect(navigatedVerse).toHaveClass('navigated');
      
      // Fast-forward past the timeout
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(navigatedVerse).not.toHaveClass('navigated');
      });
      
      jest.useRealTimers();
    });

    it('scrolls to newly selected verse when prop changes', async () => {
      const { rerender } = render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      // Clear previous calls
      jest.clearAllMocks();

      // Update selected verse
      rerender(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.5"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      await waitFor(() => {
        const newSelectedVerse = screen.getByRole('button', { 
          name: /Verse 5: And God called/ 
        });
        expect(newSelectedVerse.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center'
        });
      });
    });

    it('does not scroll when no verse is selected', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });

    it('does not apply navigation highlight to selected verse', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.3"
          navigateToVerse="Gen.1.3"  // Same as selected
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const verse3 = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });

      // Should have selected class but not navigated class
      expect(verse3).toHaveClass('selected');
      expect(verse3).not.toHaveClass('navigated');
    });

    it('clears navigation when selectedVerse prop changes', () => {
      const { rerender } = render(
        <VerseDisplay 
          verseData={mockVerseData}
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const verse3 = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      
      // Should initially have navigation animation
      expect(verse3).toHaveClass('navigated');

      // Update selectedVerse prop to select a different verse
      rerender(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.4"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      // Navigation animation should be cleared from verse 3
      expect(verse3).not.toHaveClass('navigated');
      // But reminder should remain
      expect(verse3).toHaveClass('has-been-navigated');
    });

    it('applies persistent has-been-navigated class after navigation', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const navigatedVerse = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      
      // Should have both navigated and has-been-navigated classes
      expect(navigatedVerse).toHaveClass('navigated');
      expect(navigatedVerse).toHaveClass('has-been-navigated');
    });

    it('carries over navigation state when verse is selected', () => {
      const { rerender } = render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      // Click on the navigated verse to select it
      const verse3 = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      fireEvent.click(verse3);

      // Rerender with the verse selected
      rerender(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      // Should have both selected and has-been-navigated classes
      expect(verse3).toHaveClass('selected');
      expect(verse3).toHaveClass('has-been-navigated');
      expect(verse3).not.toHaveClass('navigated');
    });

    it('removes navigation animation when verse is clicked', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const verse3 = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      
      // Should initially have both navigated and has-been-navigated classes
      expect(verse3).toHaveClass('navigated');
      expect(verse3).toHaveClass('has-been-navigated');

      // Click the verse
      fireEvent.click(verse3);

      // Should remove navigated class but keep has-been-navigated
      expect(verse3).not.toHaveClass('navigated');
      expect(verse3).toHaveClass('has-been-navigated');
    });

    it('removes navigation animation from all verses when any verse is selected', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          selectedVerse="Gen.1.1"
          navigateToVerse="Gen.1.3"
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const verse3 = screen.getByRole('button', { 
        name: /Verse 3: And God said/ 
      });
      const verse4 = screen.getByRole('button', { 
        name: /Verse 4: And God saw/ 
      });
      
      // Verse 3 should have navigation animation
      expect(verse3).toHaveClass('navigated');
      expect(verse3).toHaveClass('has-been-navigated');

      // Click a different verse (verse 4)
      fireEvent.click(verse4);

      // Navigation animation should be cleared from verse 3
      expect(verse3).not.toHaveClass('navigated');
      // But reminder should remain
      expect(verse3).toHaveClass('has-been-navigated');
    });
  });

  describe('Verse number extraction', () => {
    it('correctly extracts verse numbers from OSIS IDs', () => {
      const complexVerseData = {
        'Rev.22.21': 'The grace of our Lord Jesus Christ be with you all. Amen.',
        '1Cor.15.58': 'Therefore, my beloved brethren, be ye stedfast...',
        '3John.1.14': 'But I trust I shall shortly see thee...'
      };

      render(
        <VerseDisplay 
          verseData={complexVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      expect(screen.getByRole('button', { name: /Verse 21:/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verse 58:/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verse 14:/ })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on verse buttons', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const firstVerse = screen.getByRole('button', { 
        name: 'Verse 1: In the beginning God created the heaven and the earth.' 
      });
      expect(firstVerse).toBeInTheDocument();
    });

    it('maintains focus on keyboard navigation', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const firstVerse = screen.getByRole('button', { 
        name: /Verse 1: In the beginning/ 
      });
      
      firstVerse.focus();
      expect(document.activeElement).toBe(firstVerse);
    });

    it('has data attributes for verse identification', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const firstVerse = screen.getByRole('button', { 
        name: /Verse 1: In the beginning/ 
      });
      
      expect(firstVerse).toHaveAttribute('data-verse-id', 'Gen.1.1');
    });
  });

  describe('Edge cases', () => {
    it('handles verse data with only one verse', () => {
      const singleVerse = {
        'Obad.1.21': 'And saviours shall come up on mount Zion...'
      };

      render(
        <VerseDisplay 
          verseData={singleVerse}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      expect(screen.getByRole('button', { name: /Verse 21:/ })).toBeInTheDocument();
      expect(screen.getByText(/And saviours shall come up/)).toBeInTheDocument();
    });

    it('handles very long verse text', () => {
      const longVerse = {
        'Esth.8.9': 'Then were the king\'s scribes called at that time in the third month, that is, the month Sivan, on the three and twentieth day thereof; and it was written according to all that Mordecai commanded unto the Jews, and to the lieutenants, and the deputies and rulers of the provinces which are from India unto Ethiopia, an hundred twenty and seven provinces, unto every province according to the writing thereof, and unto every people after their language, and to the Jews according to their writing, and according to their language.'
      };

      render(
        <VerseDisplay 
          verseData={longVerse}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      expect(screen.getByRole('button', { name: /Verse 9:/ })).toBeInTheDocument();
      expect(screen.getByText(/Then were the king's scribes called/)).toBeInTheDocument();
    });

    it('maintains order of verses as provided in data', () => {
      render(
        <VerseDisplay 
          verseData={mockVerseData}
          onVerseSelect={mockOnVerseSelect}
        />
      );

      const verseButtons = screen.getAllByRole('button');
      
      // Verify order matches the input data
      expect(verseButtons[0]).toHaveAttribute('data-verse-id', 'Gen.1.1');
      expect(verseButtons[1]).toHaveAttribute('data-verse-id', 'Gen.1.2');
      expect(verseButtons[2]).toHaveAttribute('data-verse-id', 'Gen.1.3');
      expect(verseButtons[3]).toHaveAttribute('data-verse-id', 'Gen.1.4');
      expect(verseButtons[4]).toHaveAttribute('data-verse-id', 'Gen.1.5');
    });
  });
});