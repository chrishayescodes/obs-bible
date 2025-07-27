const VERSE_HISTORY_KEY = 'osb-bible-verse-history'
const CURRENT_VERSE_KEY = 'osb-bible-current-verse'
const MAX_HISTORY_ITEMS = 50

export const verseHistoryUtils = {
  getHistory() {
    try {
      const stored = localStorage.getItem(VERSE_HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
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
    } catch (error) {
      console.warn('Failed to save verse history to localStorage:', error)
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(VERSE_HISTORY_KEY)
    } catch (error) {
      console.warn('Failed to clear verse history from localStorage:', error)
    }
  },

  getCurrentVerse() {
    try {
      const stored = localStorage.getItem(CURRENT_VERSE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to load current verse from localStorage:', error)
      return null
    }
  },

  setCurrentVerse(scriptureRef) {
    if (!scriptureRef) {
      this.clearCurrentVerse()
      return
    }

    try {
      const verseData = {
        ...scriptureRef,
        timestamp: Date.now(),
        osisId: scriptureRef.bookId && scriptureRef.chapter && scriptureRef.verse 
          ? `${scriptureRef.bookId}.${scriptureRef.chapter}.${scriptureRef.verse}`
          : null
      }
      
      localStorage.setItem(CURRENT_VERSE_KEY, JSON.stringify(verseData))
    } catch (error) {
      console.warn('Failed to save current verse to localStorage:', error)
    }
  },

  clearCurrentVerse() {
    try {
      localStorage.removeItem(CURRENT_VERSE_KEY)
    } catch (error) {
      console.warn('Failed to clear current verse from localStorage:', error)
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
    } catch (error) {
      console.warn('Failed to remove verse from history:', error)
    }
  }
}