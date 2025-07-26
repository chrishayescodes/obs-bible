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

      // Check that all verses are rendered
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

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

      expect(screen.getByText('21')).toBeInTheDocument();
      expect(screen.getByText('58')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
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

      expect(screen.getByText('21')).toBeInTheDocument();
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

      expect(screen.getByText('9')).toBeInTheDocument();
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