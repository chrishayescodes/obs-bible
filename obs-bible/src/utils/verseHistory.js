const VERSE_HISTORY_KEY = 'osb-bible-verse-history'
const CURRENT_VERSE_KEY = 'osb-bible-current-verse'
const MAX_HISTORY_ITEMS = 50

export const verseHistoryUtils = {
  getHistory() {
    try {
      const stored = localStorage.getItem(VERSE_HISTORY_KEY)
      const history = stored ? JSON.parse(stored) : []
      // Sort by timestamp descending (most recent first)
      return history.sort((a, b) => b.timestamp - a.timestamp)
    } catch (error) {
      console.warn('Failed to load verse history from localStorage:', error)
      return []
    }
  },

  addToHistory(scriptureRef) {
    if (!scriptureRef || !scriptureRef.bookId || !scriptureRef.chapter || !scriptureRef.verse) {
      return
    }

    try {
      const history = this.getHistory()
      const timestamp = Date.now()
      
      const historyItem = {
        ...scriptureRef,
        timestamp,
        osisId: `${scriptureRef.bookId}.${scriptureRef.chapter}.${scriptureRef.verse}`
      }

      const existingIndex = history.findIndex(item => item.osisId === historyItem.osisId)
      
      if (existingIndex !== -1) {
        history.splice(existingIndex, 1)
      }
      
      history.unshift(historyItem)
      
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS)
      }
      
      localStorage.setItem(VERSE_HISTORY_KEY, JSON.stringify(history))
      
      // Dispatch custom event to notify components that history has been updated
      window.dispatchEvent(new CustomEvent('verseHistoryUpdated'))
    } catch (error) {
      console.warn('Failed to save verse history to localStorage:', error)
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(VERSE_HISTORY_KEY)
      
      // Dispatch custom event to notify components that history has been cleared
      window.dispatchEvent(new CustomEvent('verseHistoryUpdated'))
    } catch (error) {
      console.warn('Failed to clear verse history from localStorage:', error)
    }
  },

  getCurrentVerse() {
    try {
      const stored = localStorage.getItem(CURRENT_VERSE_KEY)
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      
      // Validate stored data structure
      if (!parsed.type || !['verse', 'custom'].includes(parsed.type)) {
        // Handle legacy data without type (assume verse)
        if (parsed.bookId && parsed.chapter && parsed.verse !== undefined) {
          // This looks like legacy verse data - add type for consistency
          return {
            ...parsed,
            type: 'verse'
          }
        } else {
          console.warn('Invalid stored content type, clearing')
          this.clearCurrentVerse()
          return null
        }
      }
      
      // Validate custom message data
      if (parsed.type === 'custom') {
        if (!parsed.id || !parsed.title) {
          console.warn('Invalid stored custom message data, clearing')
          this.clearCurrentVerse()
          return null
        }
      }
      
      // Validate verse data
      if (parsed.type === 'verse') {
        if (!parsed.bookId || !parsed.chapter || parsed.verse === undefined) {
          console.warn('Invalid stored verse data, clearing')
          this.clearCurrentVerse()
          return null
        }
      }
      
      return parsed
    } catch (error) {
      console.warn('Failed to load current content from localStorage:', error)
      return null
    }
  },

  setCurrentVerse(contentData) {
    if (!contentData) {
      this.clearCurrentVerse()
      return
    }

    try {
      // Validate content type - should be either 'verse' or 'custom'
      if (contentData.type && !['verse', 'custom'].includes(contentData.type)) {
        console.warn('Invalid content type:', contentData.type)
        return
      }

      let processedData

      if (contentData.type === 'custom') {
        // Handle custom message data
        if (!contentData.id || !contentData.title) {
          console.warn('Invalid custom message data - missing id or title')
          return
        }
        
        processedData = {
          type: 'custom',
          id: contentData.id,
          title: contentData.title,
          content: contentData.content,
          displayText: contentData.displayText || contentData.content,
          timestamp: Date.now(),
          source: contentData.source || 'custom-messages'
        }
      } else {
        // Handle verse data (existing logic) - backward compatible
        if (!contentData.bookId || !contentData.chapter || contentData.verse === undefined) {
          // For backward compatibility, try to handle scripture references without explicit type
          if (contentData.bookId && contentData.chapter && contentData.verse !== undefined) {
            // This looks like verse data
          } else {
            console.warn('Invalid verse data - missing required fields')
            return
          }
        }

        processedData = {
          type: contentData.type || 'verse', // Default to 'verse' for backward compatibility
          ...contentData,
          timestamp: Date.now(),
          osisId: contentData.bookId && contentData.chapter && contentData.verse !== undefined
            ? `${contentData.bookId}.${contentData.chapter}.${contentData.verse}`
            : null
        }
      }
      
      localStorage.setItem(CURRENT_VERSE_KEY, JSON.stringify(processedData))
      
      // Dispatch event for component updates
      window.dispatchEvent(new CustomEvent('currentVerseUpdated', {
        detail: processedData
      }))
    } catch (error) {
      console.warn('Failed to save current content to localStorage:', error)
    }
  },

  clearCurrentVerse() {
    try {
      localStorage.removeItem(CURRENT_VERSE_KEY)
      
      // Dispatch event for component updates
      window.dispatchEvent(new CustomEvent('currentVerseUpdated', {
        detail: null
      }))
    } catch (error) {
      console.warn('Failed to clear current content from localStorage:', error)
    }
  },

  getRecentVerses(limit = 10) {
    const history = this.getHistory()
    return history.slice(0, limit)
  },

  removeFromHistory(osisId) {
    try {
      const history = this.getHistory()
      const filtered = history.filter(item => item.osisId !== osisId)
      localStorage.setItem(VERSE_HISTORY_KEY, JSON.stringify(filtered))
      
      // Dispatch custom event to notify components that history has been updated
      window.dispatchEvent(new CustomEvent('verseHistoryUpdated'))
    } catch (error) {
      console.warn('Failed to remove verse from history:', error)
    }
  }
}