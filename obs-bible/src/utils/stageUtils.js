const STAGED_VERSES_KEY = 'osb-bible-staged-verses'
const MAX_STAGED_ITEMS = 100

export const stageUtils = {
  getStagedVerses() {
    try {
      const stored = localStorage.getItem(STAGED_VERSES_KEY)
      const stagedVerses = stored ? JSON.parse(stored) : []
      // Keep insertion order (no sorting needed)
      return stagedVerses
    } catch (error) {
      console.warn('Failed to load staged verses from localStorage:', error)
      return []
    }
  },

  addToStage(scriptureRef) {
    if (!scriptureRef || !scriptureRef.bookId || !scriptureRef.chapter || !scriptureRef.verse) {
      return
    }

    try {
      const stagedVerses = this.getStagedVerses()
      const timestamp = Date.now()
      
      const stagedItem = {
        ...scriptureRef,
        timestamp,
        osisId: `${scriptureRef.bookId}.${scriptureRef.chapter}.${scriptureRef.verse}`
      }

      // Check if verse is already staged to prevent duplicates
      const existingIndex = stagedVerses.findIndex(item => item.osisId === stagedItem.osisId)
      
      if (existingIndex !== -1) {
        // Already staged, don't add duplicate
        return false
      }
      
      // Add to end of list (maintain insertion order)
      stagedVerses.push(stagedItem)
      
      // Limit staged items
      if (stagedVerses.length > MAX_STAGED_ITEMS) {
        stagedVerses.shift() // Remove oldest item
      }
      
      localStorage.setItem(STAGED_VERSES_KEY, JSON.stringify(stagedVerses))
      
      // Dispatch custom event to notify components that staging has been updated
      window.dispatchEvent(new CustomEvent('stagedVersesUpdated'))
      
      return true // Successfully added
    } catch (error) {
      console.warn('Failed to save staged verse to localStorage:', error)
      return false
    }
  },

  removeFromStage(osisId) {
    try {
      const stagedVerses = this.getStagedVerses()
      const filtered = stagedVerses.filter(item => item.osisId !== osisId)
      localStorage.setItem(STAGED_VERSES_KEY, JSON.stringify(filtered))
      
      // Dispatch custom event to notify components that staging has been updated
      window.dispatchEvent(new CustomEvent('stagedVersesUpdated'))
    } catch (error) {
      console.warn('Failed to remove verse from staging:', error)
    }
  },

  clearStage() {
    try {
      localStorage.removeItem(STAGED_VERSES_KEY)
      
      // Dispatch custom event to notify components that staging has been cleared
      window.dispatchEvent(new CustomEvent('stagedVersesUpdated'))
    } catch (error) {
      console.warn('Failed to clear staged verses from localStorage:', error)
    }
  },

  isVerseStaged(osisId) {
    try {
      const stagedVerses = this.getStagedVerses()
      return stagedVerses.some(item => item.osisId === osisId)
    } catch (error) {
      console.warn('Failed to check if verse is staged:', error)
      return false
    }
  },

  getStagedCount() {
    try {
      const stagedVerses = this.getStagedVerses()
      return stagedVerses.length
    } catch (error) {
      console.warn('Failed to get staged verse count:', error)
      return 0
    }
  }
}