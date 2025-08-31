import { verseHistoryUtils } from './verseHistory';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.warn to suppress expected warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('verseHistoryUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = verseHistoryUtils.getHistory();
      expect(history).toEqual([]);
    });

    it('should return parsed history from localStorage', () => {
      const mockHistory = [
        {
          book: 'Genesis',
          bookId: 'Gen',
          chapter: '1',
          verse: 1,
          reference: 'Genesis 1:1',
          timestamp: 1234567890,
          osisId: 'Gen.1.1'
        }
      ];
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify(mockHistory));

      const history = verseHistoryUtils.getHistory();
      expect(history).toEqual(mockHistory);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem('osb-bible-verse-history', 'invalid-json');
      
      const history = verseHistoryUtils.getHistory();
      expect(history).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load verse history from localStorage:',
        expect.any(Error)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const history = verseHistoryUtils.getHistory();
      expect(history).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load verse history from localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('addToHistory', () => {
    const mockScriptureRef = {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1,
      reference: 'Genesis 1:1'
    };

    it('should add new verse to empty history', () => {
      verseHistoryUtils.addToHistory(mockScriptureRef);
      
      const history = verseHistoryUtils.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        ...mockScriptureRef,
        osisId: 'Gen.1.1'
      });
      expect(history[0]).toHaveProperty('timestamp');
    });

    it('should add new verse to beginning of existing history', () => {
      const existingVerse = {
        book: 'John',
        bookId: 'John',
        chapter: '3',
        verse: 16,
        reference: 'John 3:16',
        timestamp: 1234567890,
        osisId: 'John.3.16'
      };
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify([existingVerse]));

      verseHistoryUtils.addToHistory(mockScriptureRef);
      
      const history = verseHistoryUtils.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].osisId).toBe('Gen.1.1');
      expect(history[1].osisId).toBe('John.3.16');
    });

    it('should move existing verse to beginning when re-added', () => {
      const verse1 = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1',
        timestamp: 1234567890,
        osisId: 'Gen.1.1'
      };
      const verse2 = {
        book: 'John',
        bookId: 'John',
        chapter: '3',
        verse: 16,
        reference: 'John 3:16',
        timestamp: 1234567891,
        osisId: 'John.3.16'
      };
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify([verse2, verse1]));

      verseHistoryUtils.addToHistory(mockScriptureRef);
      
      const history = verseHistoryUtils.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].osisId).toBe('Gen.1.1');
      expect(history[1].osisId).toBe('John.3.16');
    });

    it('should limit history to maximum items', () => {
      // Create 50 existing verses
      const existingHistory = Array.from({ length: 50 }, (_, i) => ({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: i + 1,
        reference: `Genesis 1:${i + 1}`,
        timestamp: 1234567890 + i,
        osisId: `Gen.1.${i + 1}`
      }));
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify(existingHistory));

      const newVerse = {
        book: 'John',
        bookId: 'John',
        chapter: '1',
        verse: 1,
        reference: 'John 1:1'
      };
      verseHistoryUtils.addToHistory(newVerse);
      
      const history = verseHistoryUtils.getHistory();
      expect(history).toHaveLength(50);
      expect(history[0].osisId).toBe('John.1.1');
      expect(history[49].osisId).toBe('Gen.1.2'); // Oldest item remains at the end
    });

    it('should not add invalid scripture references', () => {
      verseHistoryUtils.addToHistory(null);
      verseHistoryUtils.addToHistory({});
      verseHistoryUtils.addToHistory({ book: 'Genesis' });
      verseHistoryUtils.addToHistory({ bookId: 'Gen', chapter: '1' });
      
      const history = verseHistoryUtils.getHistory();
      expect(history).toHaveLength(0);
    });

    it('should handle localStorage write errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage write error');
      });

      verseHistoryUtils.addToHistory(mockScriptureRef);
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to save verse history to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('clearHistory', () => {
    it('should remove history from localStorage', () => {
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify([{ test: 'data' }]));
      
      verseHistoryUtils.clearHistory();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('osb-bible-verse-history');
      expect(verseHistoryUtils.getHistory()).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      verseHistoryUtils.clearHistory();
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to clear verse history from localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('getCurrentVerse', () => {
    it('should return null when no current verse exists', () => {
      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toBeNull();
    });

    it('should return parsed current verse from localStorage', () => {
      const mockVerse = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1',
        timestamp: 1234567890,
        osisId: 'Gen.1.1'
      };
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify(mockVerse));

      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toEqual({
        ...mockVerse,
        type: 'verse' // Should add type for legacy data
      });
    });

    it('should return custom message data correctly', () => {
      const mockMessage = {
        type: 'custom',
        id: 'msg-123',
        title: 'Test Message',
        content: 'Test content',
        displayText: 'Rendered text',
        timestamp: 1234567890,
        source: 'custom-messages'
      };
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify(mockMessage));

      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toEqual(mockMessage);
    });

    it('should handle legacy verse data without type', () => {
      const legacyVerse = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1',
        timestamp: 1234567890,
        osisId: 'Gen.1.1'
      };
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify(legacyVerse));

      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toEqual({
        ...legacyVerse,
        type: 'verse'
      });
    });

    it('should validate and clear invalid custom message data', () => {
      const invalidMessage = {
        type: 'custom',
        id: null, // Missing required field
        title: 'Test Message'
      };
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify(invalidMessage));

      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Invalid stored custom message data, clearing');
    });

    it('should validate and clear invalid verse data', () => {
      const invalidVerse = {
        type: 'verse',
        book: 'Genesis',
        // Missing required fields
      };
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify(invalidVerse));

      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('Invalid stored verse data, clearing');
    });

    it('should validate and clear invalid content type', () => {
      const invalidContent = {
        type: 'invalid-type',
        someData: 'test'
      };
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify(invalidContent));

      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toBeNull();  
      expect(console.warn).toHaveBeenCalledWith('Invalid stored content type, clearing');
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem('osb-bible-current-verse', 'invalid-json');
      
      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load current content from localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('setCurrentVerse', () => {
    const mockScriptureRef = {
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1,
      reference: 'Genesis 1:1'
    };

    const mockCustomMessage = {
      type: 'custom',
      id: 'msg-123',
      title: 'Test Message',
      content: 'Test content'
    };

    // Mock window.dispatchEvent for event testing
    beforeEach(() => {
      window.dispatchEvent = jest.fn();
    });

    it('should save current verse to localStorage with type', () => {
      verseHistoryUtils.setCurrentVerse(mockScriptureRef);
      
      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toMatchObject({
        type: 'verse',
        ...mockScriptureRef,
        osisId: 'Gen.1.1'
      });
      expect(currentVerse).toHaveProperty('timestamp');
    });

    it('should save custom message to localStorage', () => {
      verseHistoryUtils.setCurrentVerse(mockCustomMessage);
      
      const currentContent = verseHistoryUtils.getCurrentVerse();
      expect(currentContent).toMatchObject({
        type: 'custom',
        id: 'msg-123',
        title: 'Test Message',
        content: 'Test content',
        displayText: 'Test content',
        source: 'custom-messages'
      });
      expect(currentContent).toHaveProperty('timestamp');
    });

    it('should use displayText when provided for custom messages', () => {
      const messageWithDisplayText = {
        ...mockCustomMessage,
        displayText: 'Rendered display text'
      };
      
      verseHistoryUtils.setCurrentVerse(messageWithDisplayText);
      
      const currentContent = verseHistoryUtils.getCurrentVerse();
      expect(currentContent.displayText).toBe('Rendered display text');
    });

    it('should dispatch currentVerseUpdated event for verses', () => {
      verseHistoryUtils.setCurrentVerse(mockScriptureRef);
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'currentVerseUpdated',
          detail: expect.objectContaining({
            type: 'verse',
            ...mockScriptureRef
          })
        })
      );
    });

    it('should dispatch currentVerseUpdated event for custom messages', () => {
      verseHistoryUtils.setCurrentVerse(mockCustomMessage);
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'currentVerseUpdated',
          detail: expect.objectContaining({
            type: 'custom',
            id: 'msg-123',
            title: 'Test Message'
          })
        })
      );
    });

    it('should clear current verse when passed null', () => {
      verseHistoryUtils.setCurrentVerse(mockScriptureRef);
      verseHistoryUtils.setCurrentVerse(null);
      
      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse).toBeNull();
    });

    it('should reject invalid content types', () => {
      const invalidContent = {
        type: 'invalid-type',
        someData: 'test'
      };
      
      verseHistoryUtils.setCurrentVerse(invalidContent);
      
      expect(console.warn).toHaveBeenCalledWith('Invalid content type:', 'invalid-type');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should reject invalid custom message data', () => {
      const invalidMessage = {
        type: 'custom',
        id: null, // Missing required field
        title: 'Test Message'
      };
      
      verseHistoryUtils.setCurrentVerse(invalidMessage);
      
      expect(console.warn).toHaveBeenCalledWith('Invalid custom message data - missing id or title');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should reject invalid verse data', () => {
      const invalidVerse = {
        type: 'verse',
        book: 'Genesis'
        // Missing required fields
      };
      
      verseHistoryUtils.setCurrentVerse(invalidVerse);
      
      expect(console.warn).toHaveBeenCalledWith('Invalid verse data - missing required fields');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should handle backward compatibility for verse data without type', () => {
      verseHistoryUtils.setCurrentVerse(mockScriptureRef);
      
      const currentVerse = verseHistoryUtils.getCurrentVerse();
      expect(currentVerse.type).toBe('verse');
    });

    it('should handle incomplete scripture references', () => {
      const incompleteRef = { book: 'Genesis', bookId: 'Gen', chapter: '1' };
      verseHistoryUtils.setCurrentVerse(incompleteRef);
      
      const currentVerse = verseHistoryUtils.getCurrentVerse();
      // Should not be saved due to validation, or if saved, should have null osisId
      if (currentVerse) {
        expect(currentVerse.osisId).toBeNull();
      } else {
        // It's also valid for it to be null due to validation
        expect(console.warn).toHaveBeenCalledWith('Invalid verse data - missing required fields');
      }
    });

    it('should handle localStorage write errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage write error');
      });

      verseHistoryUtils.setCurrentVerse(mockScriptureRef);
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to save current content to localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('clearCurrentVerse', () => {
    beforeEach(() => {
      window.dispatchEvent = jest.fn();
    });

    it('should remove current verse from localStorage', () => {
      localStorageMock.setItem('osb-bible-current-verse', JSON.stringify({ test: 'data' }));
      
      verseHistoryUtils.clearCurrentVerse();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('osb-bible-current-verse');
      expect(verseHistoryUtils.getCurrentVerse()).toBeNull();
    });

    it('should dispatch currentVerseUpdated event with null detail', () => {
      verseHistoryUtils.clearCurrentVerse();
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'currentVerseUpdated',
          detail: null
        })
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      verseHistoryUtils.clearCurrentVerse();
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to clear current content from localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('getRecentVerses', () => {
    it('should return empty array when no history exists', () => {
      const recent = verseHistoryUtils.getRecentVerses();
      expect(recent).toEqual([]);
    });

    it('should return limited number of recent verses', () => {
      const history = Array.from({ length: 20 }, (_, i) => ({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: i + 1,
        reference: `Genesis 1:${i + 1}`,
        timestamp: 1234567890 + i,
        osisId: `Gen.1.${i + 1}`
      }));
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify(history));

      const recent = verseHistoryUtils.getRecentVerses(5);
      expect(recent).toHaveLength(5);
      expect(recent[0].osisId).toBe('Gen.1.20'); // Most recent (highest timestamp)
      expect(recent[4].osisId).toBe('Gen.1.16'); // 5th most recent
    });

    it('should use default limit of 10', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: i + 1,
        reference: `Genesis 1:${i + 1}`,
        timestamp: 1234567890 + i,
        osisId: `Gen.1.${i + 1}`
      }));
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify(history));

      const recent = verseHistoryUtils.getRecentVerses();
      expect(recent).toHaveLength(10);
    });
  });

  describe('removeFromHistory', () => {
    it('should remove specific verse from history', () => {
      const history = [
        {
          book: 'Genesis',
          bookId: 'Gen',
          chapter: '1',
          verse: 1,
          reference: 'Genesis 1:1',
          timestamp: 1234567890,
          osisId: 'Gen.1.1'
        },
        {
          book: 'John',
          bookId: 'John',
          chapter: '3',
          verse: 16,
          reference: 'John 3:16',
          timestamp: 1234567891,
          osisId: 'John.3.16'
        }
      ];
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify(history));

      verseHistoryUtils.removeFromHistory('Gen.1.1');
      
      const updatedHistory = verseHistoryUtils.getHistory();
      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0].osisId).toBe('John.3.16');
    });

    it('should handle non-existent osisId gracefully', () => {
      const history = [
        {
          book: 'John',
          bookId: 'John',
          chapter: '3',
          verse: 16,
          reference: 'John 3:16',
          timestamp: 1234567891,
          osisId: 'John.3.16'
        }
      ];
      localStorageMock.setItem('osb-bible-verse-history', JSON.stringify(history));

      verseHistoryUtils.removeFromHistory('Gen.1.1');
      
      const updatedHistory = verseHistoryUtils.getHistory();
      expect(updatedHistory).toHaveLength(1);
      expect(updatedHistory[0].osisId).toBe('John.3.16');
    });

    it('should handle localStorage write errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage write error');
      });

      verseHistoryUtils.removeFromHistory('Gen.1.1');
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to remove verse from history:',
        expect.any(Error)
      );
    });
  });
});