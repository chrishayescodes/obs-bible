import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SelectedVerseDisplay from './index';
import { verseHistoryUtils } from '../utils/verseHistory';
import { verseSyncUtils, MessageTypes } from '../messages/utils/broadcastChannel';
import { markdownUtils } from '../messages/utils/markdownRenderer';

// Mock the verseHistory utility
jest.mock('../utils/verseHistory', () => ({
  verseHistoryUtils: {
    getCurrentVerse: jest.fn(),
    clearCurrentVerse: jest.fn()
  }
}));

// Mock the verseSyncUtils for broadcast channel
jest.mock('../messages/utils/broadcastChannel', () => ({
  verseSyncUtils: {
    subscribe: jest.fn(() => jest.fn())
  },
  MessageTypes: {
    VERSE_SELECTED: 'verse-selected',
    VERSE_CLEARED: 'verse-cleared',
    CUSTOM_MESSAGE_SELECTED: 'custom-message-selected',
    CUSTOM_MESSAGE_CLEARED: 'custom-message-cleared'
  }
}));

// Mock the markdownUtils
jest.mock('../messages/utils/markdownRenderer', () => ({
  markdownUtils: {
    renderToPlainText: jest.fn((content) => content)
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

  const mockCustomMessageData = {
    type: 'custom',
    id: 'msg123',
    title: 'Test Message',
    content: '**This is a test message** with *markdown*',
    timestamp: 1234567890000
  };

  const mockChapterData = {
    'Gen.1.1': 'In the beginning God created the heaven and the earth.',
    'Gen.1.2': 'And the earth was without form, and void; and darkness was upon the face of the deep.',
  };

  let mockUnsubscribe;
  let mockSubscribeCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    
    // Reset the mockUnsubscribe function
    mockUnsubscribe = jest.fn();
    mockSubscribeCallback = jest.fn();
    
    // Set up the subscribe mock to capture the callback
    verseSyncUtils.subscribe.mockImplementation((callback) => {
      mockSubscribeCallback = callback;
      return mockUnsubscribe;
    });
    
    // Reset markdownUtils mock
    markdownUtils.renderToPlainText.mockImplementation((content) => content);
    
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
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('/data/output_chapters_json/Gen/Gen_1.json');
    });

    it('should load and display custom message from localStorage on mount', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockCustomMessageData);
      markdownUtils.renderToPlainText.mockReturnValue('This is a test message with markdown');

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/This is a test message with markdown ~ Test Message/)).toBeInTheDocument();
      });

      expect(verseHistoryUtils.getCurrentVerse).toHaveBeenCalledTimes(1);
      expect(markdownUtils.renderToPlainText).toHaveBeenCalledWith('**This is a test message** with *markdown*');
      expect(fetch).not.toHaveBeenCalled(); // Should not fetch verse data for custom messages
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

    it('should render nothing when custom message data is incomplete', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue({
        type: 'custom',
        id: 'msg123',
        // Missing title and content
        timestamp: 1234567890000
      });

      const { container } = render(<SelectedVerseDisplay />);

      // Should render nothing when custom message data is incomplete
      expect(container.firstChild).toBeNull();
      expect(markdownUtils.renderToPlainText).not.toHaveBeenCalled();
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
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
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
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
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

  describe('Custom message functionality', () => {
    it('should display custom message after successful load', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockCustomMessageData);
      markdownUtils.renderToPlainText.mockReturnValue('This is a test message with markdown');

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/This is a test message with markdown ~ Test Message/)).toBeInTheDocument();
      });

      expect(markdownUtils.renderToPlainText).toHaveBeenCalledWith('**This is a test message** with *markdown*');
    });

    it('should handle markdown to plain text conversion correctly', async () => {
      const customMessage = {
        type: 'custom',
        id: 'msg456',
        title: 'Markdown Test',
        content: '# Header\n**Bold text** and *italic text*\n- List item',
        timestamp: 1234567890000
      };

      verseHistoryUtils.getCurrentVerse.mockReturnValue(customMessage);
      markdownUtils.renderToPlainText.mockReturnValue('Header Bold text and italic text List item');

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Header Bold text and italic text List item ~ Markdown Test/)).toBeInTheDocument();
      });

      expect(markdownUtils.renderToPlainText).toHaveBeenCalledWith('# Header\n**Bold text** and *italic text*\n- List item');
    });

    it('should render nothing when custom message loading fails', async () => {
      const invalidCustomMessage = {
        type: 'custom',
        id: 'msg789',
        // Missing title and content
        timestamp: 1234567890000
      };

      verseHistoryUtils.getCurrentVerse.mockReturnValue(invalidCustomMessage);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { container } = render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });

      expect(markdownUtils.renderToPlainText).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should render nothing when custom message has empty content', async () => {
      const emptyContentMessage = {
        type: 'custom',
        id: 'msg999',
        title: 'Empty Message',
        content: '',
        timestamp: 1234567890000
      };

      verseHistoryUtils.getCurrentVerse.mockReturnValue(emptyContentMessage);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { container } = render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });

      // Should not have called markdown renderer since validation failed
      expect(markdownUtils.renderToPlainText).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Cross-tab synchronization', () => {
    // mockSubscribeCallback is already declared at the top level

    it('should subscribe to broadcast messages on mount', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      render(<SelectedVerseDisplay />);

      expect(verseSyncUtils.subscribe).toHaveBeenCalledTimes(1);
      expect(typeof mockSubscribeCallback).toBe('function');
    });

    it('should handle VERSE_SELECTED broadcast messages', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      // Simulate receiving a verse selection broadcast
      const message = {
        type: MessageTypes.VERSE_SELECTED,
        data: mockVerseData
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });
    });

    it('should handle CUSTOM_MESSAGE_SELECTED broadcast messages', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);
      markdownUtils.renderToPlainText.mockReturnValue('This is a broadcast test message');

      render(<SelectedVerseDisplay />);

      // Simulate receiving a custom message selection broadcast
      const message = {
        type: MessageTypes.CUSTOM_MESSAGE_SELECTED,
        data: mockCustomMessageData
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(screen.getByText(/This is a broadcast test message ~ Test Message/)).toBeInTheDocument();
      });

      expect(markdownUtils.renderToPlainText).toHaveBeenCalledWith('**This is a test message** with *markdown*');
    });

    it('should handle VERSE_CLEARED broadcast messages', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      const { container } = render(<SelectedVerseDisplay />);

      // Wait for initial verse to load
      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      // Simulate receiving a verse cleared broadcast
      const message = {
        type: MessageTypes.VERSE_CLEARED
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should handle CUSTOM_MESSAGE_CLEARED broadcast messages', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockCustomMessageData);
      markdownUtils.renderToPlainText.mockReturnValue('This message will be cleared');

      const { container } = render(<SelectedVerseDisplay />);

      // Wait for initial custom message to load
      await waitFor(() => {
        expect(screen.getByText(/This message will be cleared ~ Test Message/)).toBeInTheDocument();
      });

      // Simulate receiving a custom message cleared broadcast
      const message = {
        type: MessageTypes.CUSTOM_MESSAGE_CLEARED
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('should clean up subscription on unmount', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      const { unmount } = render(<SelectedVerseDisplay />);
      
      unmount();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content type detection and exclusive display', () => {
    it('should detect verse content type correctly', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      // Should have called fetch for verse data
      expect(fetch).toHaveBeenCalledWith('/data/output_chapters_json/Gen/Gen_1.json');
      // Should not have called markdown renderer
      expect(markdownUtils.renderToPlainText).not.toHaveBeenCalled();
    });

    it('should detect custom message type correctly', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockCustomMessageData);
      markdownUtils.renderToPlainText.mockReturnValue('Custom message content');

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Custom message content ~ Test Message/)).toBeInTheDocument();
      });

      // Should have called markdown renderer
      expect(markdownUtils.renderToPlainText).toHaveBeenCalledWith('**This is a test message** with *markdown*');
      // Should not have called fetch for verse data
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle legacy verse data without type field', async () => {
      const legacyVerseData = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1',
        timestamp: 1234567890000,
        osisId: 'Gen.1.1'
        // No type field - should be treated as verse
      };

      verseHistoryUtils.getCurrentVerse.mockReturnValue(legacyVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      // Should have called fetch for verse data (treated as verse)
      expect(fetch).toHaveBeenCalledWith('/data/output_chapters_json/Gen/Gen_1.json');
      // Should not have called markdown renderer
      expect(markdownUtils.renderToPlainText).not.toHaveBeenCalled();
    });

    it('should switch from verse to custom message correctly', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      // Wait for verse to load
      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      // Simulate switching to custom message via broadcast
      markdownUtils.renderToPlainText.mockReturnValue('Switched to custom message');
      
      const message = {
        type: MessageTypes.CUSTOM_MESSAGE_SELECTED,
        data: mockCustomMessageData
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(screen.getByText(/Switched to custom message ~ Test Message/)).toBeInTheDocument();
      });

      // Should not show verse content anymore
      expect(screen.queryByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).not.toBeInTheDocument();
    });

    it('should switch from custom message to verse correctly', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockCustomMessageData);
      markdownUtils.renderToPlainText.mockReturnValue('Initial custom message');

      render(<SelectedVerseDisplay />);

      // Wait for custom message to load
      await waitFor(() => {
        expect(screen.getByText(/Initial custom message ~ Test Message/)).toBeInTheDocument();
      });

      // Simulate switching to verse via broadcast
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });
      
      const message = {
        type: MessageTypes.VERSE_SELECTED,
        data: mockVerseData
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      // Should not show custom message content anymore
      expect(screen.queryByText(/Initial custom message ~ Test Message/)).not.toBeInTheDocument();
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

    it('should add and remove OBS overlay class on body', () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(null);

      const { unmount } = render(<SelectedVerseDisplay />);

      // Should add the class
      expect(document.body.classList.contains('obs-overlay')).toBe(true);

      unmount();

      // Should remove the class on unmount
      expect(document.body.classList.contains('obs-overlay')).toBe(false);
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
      expect(markdownUtils.renderToPlainText).not.toHaveBeenCalled();
    });
  });

  describe('Fade transition functionality', () => {
    beforeEach(() => {
      // Mock requestAnimationFrame
      global.requestAnimationFrame = jest.fn((cb) => {
        setTimeout(cb, 16); // 60fps
      });
    });

    afterEach(() => {
      global.requestAnimationFrame.mockRestore();
    });

    it('should apply fade transitions for custom messages', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockCustomMessageData);
      markdownUtils.renderToPlainText.mockReturnValue('Message with fade transition');

      render(<SelectedVerseDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Message with fade transition ~ Test Message/)).toBeInTheDocument();
      });

      // Check that fade transition elements are present
      const currentDiv = document.querySelector('.current-div');
      const tempDiv = document.querySelector('.temp-div');

      expect(currentDiv).toBeInTheDocument();
      expect(tempDiv).toBeInTheDocument();
      // Note: Opacity may be 0 initially during fade transition, then animates to 1
      expect(currentDiv).toHaveStyle('opacity: 0');
    });

    it('should apply fade transitions when switching between content types', async () => {
      verseHistoryUtils.getCurrentVerse.mockReturnValue(mockVerseData);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChapterData)
      });

      render(<SelectedVerseDisplay />);

      // Wait for verse to load
      await waitFor(() => {
        expect(screen.getByText(/In the beginning God created the heaven and the earth\. ~ Genesis 1:1/)).toBeInTheDocument();
      });

      // Switch to custom message
      markdownUtils.renderToPlainText.mockReturnValue('Transitioning to custom message');
      
      const message = {
        type: MessageTypes.CUSTOM_MESSAGE_SELECTED,
        data: mockCustomMessageData
      };

      mockSubscribeCallback(message);

      await waitFor(() => {
        expect(screen.getByText(/Transitioning to custom message ~ Test Message/)).toBeInTheDocument();
      });

      // Verify fade transition elements
      const currentDiv = document.querySelector('.current-div');
      const tempDiv = document.querySelector('.temp-div');

      expect(currentDiv).toBeInTheDocument();
      expect(tempDiv).toBeInTheDocument();
    });
  });
});