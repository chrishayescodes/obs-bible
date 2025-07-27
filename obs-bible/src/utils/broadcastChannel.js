// BroadcastChannel utility for cross-tab verse synchronization
const CHANNEL_NAME = 'osb-bible-sync';

// Channel singleton to avoid multiple instances
let channelInstance = null;

// Check if BroadcastChannel is supported
export const isBroadcastChannelSupported = () => {
  return typeof BroadcastChannel !== 'undefined';
};

// Get or create the broadcast channel
export const getBroadcastChannel = () => {
  if (!isBroadcastChannelSupported()) {
    console.warn('BroadcastChannel API is not supported in this browser');
    return null;
  }

  if (!channelInstance) {
    channelInstance = new BroadcastChannel(CHANNEL_NAME);
  }

  return channelInstance;
};

// Message types for verse synchronization
export const MessageTypes = {
  VERSE_SELECTED: 'verse-selected',
  VERSE_CLEARED: 'verse-cleared',
  CHAPTER_NAVIGATED: 'chapter-navigated',
  HISTORY_UPDATED: 'history-updated'
};

// Get current pathname (mockable for tests)
export let getCurrentPathname = () => {
  return window.location?.pathname || '/';
};

// Broadcast a verse selection
export const broadcastVerseSelection = (scriptureRef) => {
  const channel = getBroadcastChannel();
  if (!channel) {
    console.warn('No broadcast channel available');
    return;
  }

  try {
    const message = {
      type: MessageTypes.VERSE_SELECTED,
      data: scriptureRef,
      timestamp: Date.now(),
      origin: getCurrentPathname()
    };
    channel.postMessage(message);
  } catch (error) {
    console.error('Failed to broadcast verse selection:', error);
  }
};

// Broadcast verse clearing
export const broadcastVerseClear = () => {
  const channel = getBroadcastChannel();
  if (!channel) return;

  try {
    channel.postMessage({
      type: MessageTypes.VERSE_CLEARED,
      timestamp: Date.now(),
      origin: getCurrentPathname()
    });
  } catch (error) {
    console.error('Failed to broadcast verse clear:', error);
  }
};

// Broadcast chapter navigation
export const broadcastChapterNavigation = (chapterData) => {
  const channel = getBroadcastChannel();
  if (!channel) return;

  try {
    channel.postMessage({
      type: MessageTypes.CHAPTER_NAVIGATED,
      data: chapterData,
      timestamp: Date.now(),
      origin: getCurrentPathname()
    });
  } catch (error) {
    console.error('Failed to broadcast chapter navigation:', error);
  }
};

// Subscribe to broadcast messages
export const subscribeToBroadcast = (callback) => {
  const channel = getBroadcastChannel();
  if (!channel) return () => {};

  const handler = (event) => {
    // Ignore messages from the same tab
    if (event.data.origin === getCurrentPathname()) {
      return;
    }

    callback(event.data);
  };

  channel.addEventListener('message', handler);

  // Return cleanup function
  return () => {
    channel.removeEventListener('message', handler);
  };
};

// Close the broadcast channel (for cleanup)
export const closeBroadcastChannel = () => {
  if (channelInstance) {
    channelInstance.close();
    channelInstance = null;
  }
};

// Utility to create a fallback using localStorage for older browsers
export const createLocalStorageFallback = () => {
  const STORAGE_KEY = 'osb-bible-sync-fallback';
  let lastMessage = null;

  const broadcast = (message) => {
    const messageWithId = {
      ...message,
      id: Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messageWithId));
  };

  const subscribe = (callback) => {
    const handler = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const message = JSON.parse(event.newValue);
          // Avoid processing the same message twice
          if (lastMessage?.id !== message.id) {
            lastMessage = message;
            callback(message);
          }
        } catch (error) {
          console.error('Failed to parse localStorage message:', error);
        }
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  };

  return { broadcast, subscribe };
};

// Create a single fallback instance
let fallbackInstance = null;
const getFallbackInstance = () => {
  if (!fallbackInstance) {
    fallbackInstance = createLocalStorageFallback();
  }
  return fallbackInstance;
};

// Main sync utility that uses BroadcastChannel or falls back to localStorage
export const verseSyncUtils = {
  isSupported: isBroadcastChannelSupported,
  
  broadcastVerseSelection: (scriptureRef) => {
    if (isBroadcastChannelSupported()) {
      broadcastVerseSelection(scriptureRef);
    } else {
      const fallback = getFallbackInstance();
      fallback.broadcast({
        type: MessageTypes.VERSE_SELECTED,
        data: scriptureRef,
        timestamp: Date.now(),
        origin: getCurrentPathname()
      });
    }
  },

  broadcastVerseClear: () => {
    if (isBroadcastChannelSupported()) {
      broadcastVerseClear();
    } else {
      const fallback = getFallbackInstance();
      fallback.broadcast({
        type: MessageTypes.VERSE_CLEARED,
        timestamp: Date.now(),
        origin: getCurrentPathname()
      });
    }
  },

  subscribe: (callback) => {
    if (isBroadcastChannelSupported()) {
      return subscribeToBroadcast(callback);
    } else {
      const fallback = getFallbackInstance();
      return fallback.subscribe(callback);
    }
  },

  cleanup: () => {
    closeBroadcastChannel();
    fallbackInstance = null;
  }
};