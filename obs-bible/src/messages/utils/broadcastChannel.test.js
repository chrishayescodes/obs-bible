// Import everything we need
const broadcastChannelModule = require('./broadcastChannel');

// Export individual items for cleaner test access
const {
  isBroadcastChannelSupported,
  getBroadcastChannel,
  MessageTypes,
  broadcastVerseSelection,
  broadcastVerseClear,
  broadcastChapterNavigation,
  broadcastCustomMessageSelection,
  broadcastCustomMessageClear,
  subscribeToBroadcast,
  closeBroadcastChannel,
  createLocalStorageFallback,
  verseSyncUtils,
  getCurrentPathname
} = broadcastChannelModule;

// Mock BroadcastChannel
let mockBroadcastChannel;
let mockBroadcastChannelInstances = [];

beforeEach(() => {
  // Reset instances array
  mockBroadcastChannelInstances = [];
  
  // Mock BroadcastChannel constructor
  mockBroadcastChannel = jest.fn().mockImplementation(function(name) {
    this.name = name;
    this.postMessage = jest.fn();
    this.close = jest.fn();
    this.addEventListener = jest.fn();
    this.removeEventListener = jest.fn();
    
    // Keep track of instances
    mockBroadcastChannelInstances.push(this);
    
    return this;
  });
  
  // Set global BroadcastChannel
  global.BroadcastChannel = mockBroadcastChannel;
  
  // No need to mock pathname - just test functionality
  
  // Clear localStorage
  localStorage.clear();
  
  // Reset channel instance
  closeBroadcastChannel();
});

afterEach(() => {
  // Clean up
  delete global.BroadcastChannel;
  closeBroadcastChannel();
  jest.clearAllMocks();
});

describe('BroadcastChannel utility', () => {
  describe('isBroadcastChannelSupported', () => {
    it('should return true when BroadcastChannel is available', () => {
      expect(isBroadcastChannelSupported()).toBe(true);
    });

    it('should return false when BroadcastChannel is not available', () => {
      delete global.BroadcastChannel;
      expect(isBroadcastChannelSupported()).toBe(false);
    });
  });

  describe('getBroadcastChannel', () => {
    it('should create a new BroadcastChannel instance', () => {
      const channel = getBroadcastChannel();
      
      expect(mockBroadcastChannel).toHaveBeenCalledWith('osb-bible-sync');
      expect(channel).toBeDefined();
      expect(channel.name).toBe('osb-bible-sync');
    });

    it('should return the same instance on subsequent calls', () => {
      const channel1 = getBroadcastChannel();
      const channel2 = getBroadcastChannel();
      
      expect(channel1).toBe(channel2);
      expect(mockBroadcastChannel).toHaveBeenCalledTimes(1);
    });

    it('should return null when BroadcastChannel is not supported', () => {
      delete global.BroadcastChannel;
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const channel = getBroadcastChannel();
      
      expect(channel).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('BroadcastChannel API is not supported in this browser');
      
      consoleSpy.mockRestore();
    });
  });

  describe('broadcastVerseSelection', () => {
    it('should broadcast verse selection message', () => {
      const scriptureRef = {
        book: 'Genesis',
        bookId: 'Gen',
        chapter: '1',
        verse: 1,
        reference: 'Genesis 1:1'
      };

      broadcastVerseSelection(scriptureRef);
      
      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageTypes.VERSE_SELECTED,
          data: scriptureRef,
          timestamp: expect.any(Number),
          origin: expect.any(String)
        })
      );
    });

    it('should handle broadcast errors gracefully', () => {
      const scriptureRef = { bookId: 'Gen', chapter: '1', verse: 1 };
      const channel = getBroadcastChannel();
      channel.postMessage.mockImplementation(() => {
        throw new Error('Broadcast failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      broadcastVerseSelection(scriptureRef);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to broadcast verse selection:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('broadcastVerseClear', () => {
    it('should broadcast verse clear message', () => {
      broadcastVerseClear();
      
      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: MessageTypes.VERSE_CLEARED,
          timestamp: expect.any(Number),
          origin: expect.any(String)
        })
      );
    });
  });

  describe('subscribeToBroadcast', () => {
    it('should subscribe to broadcast messages', () => {
      const callback = jest.fn();
      const unsubscribe = subscribeToBroadcast(callback);
      
      const channel = mockBroadcastChannelInstances[0];
      expect(channel.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      
      // Cleanup
      unsubscribe();
      expect(channel.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should ignore messages from the same origin', () => {
      const callback = jest.fn();
      subscribeToBroadcast(callback);
      
      const channel = mockBroadcastChannelInstances[0];
      const handler = channel.addEventListener.mock.calls[0][1];
      
      // Get current origin
      const currentOrigin = window.location.pathname || '/';
      
      // Message from same origin
      handler({
        data: {
          type: MessageTypes.VERSE_SELECTED,
          origin: currentOrigin
        }
      });
      
      expect(callback).not.toHaveBeenCalled();
      
      // Message from different origin
      handler({
        data: {
          type: MessageTypes.VERSE_SELECTED,
          origin: '/different-path'
        }
      });
      
      expect(callback).toHaveBeenCalledWith({
        type: MessageTypes.VERSE_SELECTED,
        origin: '/different-path'
      });
    });

    it('should return noop function when BroadcastChannel is not supported', () => {
      delete global.BroadcastChannel;
      
      const callback = jest.fn();
      const unsubscribe = subscribeToBroadcast(callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('closeBroadcastChannel', () => {
    it('should close the channel instance', () => {
      const channel = getBroadcastChannel();
      closeBroadcastChannel();
      
      expect(channel.close).toHaveBeenCalled();
      
      // Should create new instance after closing
      const newChannel = getBroadcastChannel();
      expect(newChannel).not.toBe(channel);
    });

    it('should handle closing when no channel exists', () => {
      expect(() => closeBroadcastChannel()).not.toThrow();
    });
  });

  describe('createLocalStorageFallback', () => {
    it('should broadcast messages via localStorage', () => {
      const fallback = createLocalStorageFallback();
      const message = {
        type: MessageTypes.VERSE_SELECTED,
        data: { verse: '1' }
      };

      fallback.broadcast(message);
      
      const stored = JSON.parse(localStorage.getItem('osb-bible-sync-fallback'));
      expect(stored).toMatchObject({
        ...message,
        id: expect.any(String)
      });
    });

    it('should subscribe to storage events', () => {
      const fallback = createLocalStorageFallback();
      const callback = jest.fn();
      
      const unsubscribe = fallback.subscribe(callback);
      
      // Simulate storage event
      const message = {
        type: MessageTypes.VERSE_SELECTED,
        data: { verse: '1' },
        id: 'test-id'
      };
      
      const event = new StorageEvent('storage', {
        key: 'osb-bible-sync-fallback',
        newValue: JSON.stringify(message)
      });
      
      window.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalledWith(message);
      
      // Cleanup
      unsubscribe();
    });

    it('should avoid processing the same message twice', () => {
      const fallback = createLocalStorageFallback();
      const callback = jest.fn();
      
      fallback.subscribe(callback);
      
      const message = {
        type: MessageTypes.VERSE_SELECTED,
        data: { verse: '1' },
        id: 'duplicate-id'
      };
      
      // First event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'osb-bible-sync-fallback',
        newValue: JSON.stringify(message)
      }));
      
      // Same message again
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'osb-bible-sync-fallback',
        newValue: JSON.stringify(message)
      }));
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid JSON gracefully', () => {
      const fallback = createLocalStorageFallback();
      const callback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      fallback.subscribe(callback);
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'osb-bible-sync-fallback',
        newValue: 'invalid-json'
      }));
      
      expect(callback).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse localStorage message:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('verseSyncUtils', () => {
    it('should use BroadcastChannel when supported', () => {
      const scriptureRef = { bookId: 'Gen', chapter: '1', verse: 1 };
      
      verseSyncUtils.broadcastVerseSelection(scriptureRef);
      
      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalled();
    });

    it('should fall back to localStorage when BroadcastChannel is not supported', () => {
      delete global.BroadcastChannel;
      
      const scriptureRef = { bookId: 'Gen', chapter: '1', verse: 1 };
      
      verseSyncUtils.broadcastVerseSelection(scriptureRef);
      
      const stored = JSON.parse(localStorage.getItem('osb-bible-sync-fallback'));
      expect(stored).toMatchObject({
        type: MessageTypes.VERSE_SELECTED,
        data: scriptureRef,
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });

    it('should handle subscription with fallback', () => {
      delete global.BroadcastChannel;
      
      const callback = jest.fn();
      const unsubscribe = verseSyncUtils.subscribe(callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test that fallback works
      const message = {
        type: MessageTypes.VERSE_SELECTED,
        data: { verse: '1' },
        id: 'test'
      };
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'osb-bible-sync-fallback',
        newValue: JSON.stringify(message)
      }));
      
      expect(callback).toHaveBeenCalledWith(message);
      
      unsubscribe();
    });

    it('should properly cleanup channels', () => {
      const channel = getBroadcastChannel();
      verseSyncUtils.cleanup();
      
      expect(channel.close).toHaveBeenCalled();
    });
  });

  describe('broadcastCustomMessageSelection', () => {
    it('should broadcast custom message selection with correct format', () => {
      const messageData = {
        id: 'test-msg-123',
        title: 'Test Message',
        content: 'Test content'
      };

      broadcastCustomMessageSelection(messageData);

      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalledWith({
        type: MessageTypes.CUSTOM_MESSAGE_SELECTED,
        data: {
          type: 'custom',
          id: 'test-msg-123',
          title: 'Test Message',
          content: 'Test content',
          displayText: 'Test content',
          timestamp: expect.any(Number),
          source: 'custom-messages'
        },
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });

    it('should use displayText when provided', () => {
      const messageData = {
        id: 'test-msg-123',
        title: 'Test Message',
        content: 'Original content',
        displayText: 'Rendered display text'
      };

      broadcastCustomMessageSelection(messageData);

      const channel = mockBroadcastChannelInstances[0];
      const call = channel.postMessage.mock.calls[0][0];
      expect(call.data.displayText).toBe('Rendered display text');
    });

    it('should handle broadcast errors gracefully', () => {
      const messageData = {
        id: 'test-msg-123',
        title: 'Test Message',
        content: 'Test content'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const channel = getBroadcastChannel();
      channel.postMessage.mockImplementation(() => {
        throw new Error('Broadcast failed');
      });

      expect(() => broadcastCustomMessageSelection(messageData)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to broadcast custom message selection:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should not broadcast when channel is not available', () => {
      delete global.BroadcastChannel;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const messageData = {
        id: 'test-msg-123',
        title: 'Test Message',
        content: 'Test content'
      };

      broadcastCustomMessageSelection(messageData);
      
      expect(consoleSpy).toHaveBeenCalledWith('BroadcastChannel API is not supported in this browser');
      consoleSpy.mockRestore();
    });
  });

  describe('broadcastCustomMessageClear', () => {
    it('should broadcast custom message clear', () => {
      broadcastCustomMessageClear();

      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalledWith({
        type: MessageTypes.CUSTOM_MESSAGE_CLEARED,
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });

    it('should handle broadcast errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const channel = getBroadcastChannel();
      channel.postMessage.mockImplementation(() => {
        throw new Error('Clear broadcast failed');
      });

      expect(() => broadcastCustomMessageClear()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to broadcast custom message clear:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('verseSyncUtils custom message functions', () => {
    it('should broadcast custom message selection via BroadcastChannel', () => {
      const messageData = {
        id: 'test-msg-123',
        title: 'Test Message',
        content: 'Test content'
      };

      verseSyncUtils.broadcastCustomMessageSelection(messageData);

      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalledWith({
        type: MessageTypes.CUSTOM_MESSAGE_SELECTED,
        data: {
          type: 'custom',
          id: 'test-msg-123',
          title: 'Test Message',
          content: 'Test content',
          displayText: 'Test content',
          timestamp: expect.any(Number),
          source: 'custom-messages'
        },
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });

    it('should fall back to localStorage for custom message selection', () => {
      delete global.BroadcastChannel;
      
      const messageData = {
        id: 'test-msg-123',
        title: 'Test Message',
        content: 'Test content'
      };

      verseSyncUtils.broadcastCustomMessageSelection(messageData);

      const stored = JSON.parse(localStorage.getItem('osb-bible-sync-fallback'));
      expect(stored).toMatchObject({
        type: MessageTypes.CUSTOM_MESSAGE_SELECTED,
        data: {
          type: 'custom',
          id: 'test-msg-123',
          title: 'Test Message',
          content: 'Test content',
          displayText: 'Test content',
          timestamp: expect.any(Number),
          source: 'custom-messages'
        },
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });

    it('should broadcast custom message clear via BroadcastChannel', () => {
      verseSyncUtils.broadcastCustomMessageClear();

      const channel = mockBroadcastChannelInstances[0];
      expect(channel.postMessage).toHaveBeenCalledWith({
        type: MessageTypes.CUSTOM_MESSAGE_CLEARED,
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });

    it('should fall back to localStorage for custom message clear', () => {
      delete global.BroadcastChannel;

      verseSyncUtils.broadcastCustomMessageClear();

      const stored = JSON.parse(localStorage.getItem('osb-bible-sync-fallback'));
      expect(stored).toMatchObject({
        type: MessageTypes.CUSTOM_MESSAGE_CLEARED,
        timestamp: expect.any(Number),
        origin: expect.any(String)
      });
    });
  });

  describe('MessageTypes', () => {
    it('should have all expected message types', () => {
      expect(MessageTypes.VERSE_SELECTED).toBe('verse-selected');
      expect(MessageTypes.VERSE_CLEARED).toBe('verse-cleared');
      expect(MessageTypes.CHAPTER_NAVIGATED).toBe('chapter-navigated');
      expect(MessageTypes.HISTORY_UPDATED).toBe('history-updated');
      expect(MessageTypes.CUSTOM_MESSAGE_SELECTED).toBe('custom-message-selected');
      expect(MessageTypes.CUSTOM_MESSAGE_CLEARED).toBe('custom-message-cleared');
    });
  });
});