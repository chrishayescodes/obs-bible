import React, { useState, useEffect } from 'react'
import { stageUtils } from '../../../utils/stageUtils'
import './StageList.css'

const StageList = ({ onVerseSelect, onClearStage }) => {
  const [stagedVerses, setStagedVerses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStagedVerses = () => {
      try {
        const stagedData = stageUtils.getStagedVerses()
        setStagedVerses(stagedData)
      } catch (error) {
        console.error('Failed to load staged verses:', error)
        setStagedVerses([])
      } finally {
        setLoading(false)
      }
    }

    // Load staged verses on component mount
    loadStagedVerses()

    // Listen for staging updates and reload when they occur
    const handleStagingUpdate = () => {
      loadStagedVerses()
    }

    window.addEventListener('stagedVersesUpdated', handleStagingUpdate)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('stagedVersesUpdated', handleStagingUpdate)
    }
  }, [])

  const handleVerseClick = (stagedItem) => {
    if (onVerseSelect) {
      // Handle split verses (e.g., "9a", "9b") by extracting the number
      const verseNumber = stagedItem.verse.toString().match(/^\d+/)
      const parsedVerse = verseNumber ? parseInt(verseNumber[0]) : parseInt(stagedItem.verse)
      
      // Create scripture reference object for navigation
      const scriptureRef = {
        book: stagedItem.book,
        bookId: stagedItem.bookId,
        chapter: stagedItem.chapter,
        verse: parsedVerse,
        reference: stagedItem.reference
      }
      onVerseSelect(scriptureRef)
    }
  }

  const handleClearAll = () => {
    stageUtils.clearStage()
    setStagedVerses([])
    if (onClearStage) {
      onClearStage()
    }
  }

  const handleRemoveItem = (osisId) => {
    stageUtils.removeFromStage(osisId)
    setStagedVerses(prev => prev.filter(item => item.osisId !== osisId))
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Added recently'
    } else if (diffHours < 24) {
      return `Added ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `Added ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return `Added ${date.toLocaleDateString()}`
    }
  }

  if (loading) {
    return (
      <div className="stage-list" role="main" aria-label="Staged Verses">
        <div className="stage-list__header">
          <h1 className="stage-list__title">Staged Verses</h1>
        </div>
        <div className="stage-list__loading" role="status" aria-live="polite">
          <span className="sr-only">Loading staged verses...</span>
          Loading staged verses...
        </div>
      </div>
    )
  }

  if (stagedVerses.length === 0) {
    return (
      <div className="stage-list" role="main" aria-label="Staged Verses">
        <div className="stage-list__header">
          <h1 className="stage-list__title">Staged Verses</h1>
        </div>
        <div className="stage-list__empty" role="status">
          <p>No verses staged yet.</p>
          <p className="stage-list__empty-hint">Use the + button next to verses to add them to your stage.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stage-list" role="main" aria-label="Staged Verses">
      <div className="stage-list__header">
        <h1 className="stage-list__title">Staged Verses ({stagedVerses.length})</h1>
        <button
          type="button"
          className="stage-list__clear-all"
          onClick={handleClearAll}
          aria-label="Clear all staged verses"
        >
          Clear All
        </button>
      </div>
      
      <div className="stage-list__list" role="list">
        {stagedVerses.map((item) => (
          <div key={item.osisId} className="stage-list__item" role="listitem">
            <button
              type="button"
              className="stage-list__verse-button"
              onClick={() => handleVerseClick(item)}
              aria-label={`Navigate to ${item.reference}`}
            >
              <div className="stage-list__verse-reference">
                {item.reference}
              </div>
              <div className="stage-list__verse-timestamp">
                {formatTimestamp(item.timestamp)}
              </div>
            </button>
            <button
              type="button"
              className="stage-list__remove-button"
              onClick={() => handleRemoveItem(item.osisId)}
              aria-label={`Remove ${item.reference} from stage`}
              title={`Remove ${item.reference} from stage`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StageList