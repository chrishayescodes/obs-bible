// Debug helper for BroadcastChannel
import { verseSyncUtils, MessageTypes, isBroadcastChannelSupported } from './broadcastChannel';

// Add debug logging
export const setupBroadcastDebug = () => {
  console.log('🔍 BroadcastChannel Debug Info:');
  console.log('- BroadcastChannel supported:', isBroadcastChannelSupported());
  console.log('- Current pathname:', window.location.pathname);
  
  // Subscribe to all messages for debugging
  const unsubscribe = verseSyncUtils.subscribe((message) => {
    console.log('📨 Broadcast message received:', {
      type: message.type,
      origin: message.origin,
      data: message.data,
      timestamp: new Date(message.timestamp).toLocaleTimeString()
    });
  });

  // Override broadcast functions to add logging
  const originalBroadcast = verseSyncUtils.broadcastVerseSelection;
  verseSyncUtils.broadcastVerseSelection = (scriptureRef) => {
    console.log('📤 Broadcasting verse selection:', scriptureRef);
    originalBroadcast(scriptureRef);
  };

  const originalClear = verseSyncUtils.broadcastVerseClear;
  verseSyncUtils.broadcastVerseClear = () => {
    console.log('📤 Broadcasting verse clear');
    originalClear();
  };

  return unsubscribe;
};

// Log when page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('🚀 Page loaded at path:', window.location.pathname);
    setupBroadcastDebug();
  });
}