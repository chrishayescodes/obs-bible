import React, { useState, useEffect } from 'react'
import { verseHistoryUtils } from '../../../utils/verseHistory'
import './SearchHistory.css'

const SearchHistory = ({ onVerseSelect, onClearHistory }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = () => {
      try {
        const historyData = verseHistoryUtils.getHistory()
        setHistory(historyData)
      } catch (error) {
        console.error('Failed to load verse history:', error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const handleVerseClick = (historyItem) => {
    if (onVerseSelect) {
      // Handle split verses (e.g., "9a", "9b") by extracting the number
      const verseNumber = historyItem.verse.toString().match(/^\d+/)
      const parsedVerse = verseNumber ? parseInt(verseNumber[0]) : parseInt(historyItem.verse)
      
      // Create scripture reference object for navigation
      const scriptureRef = {
        book: historyItem.book,
        bookId: historyItem.bookId,
        chapter: historyItem.chapter,
        verse: parsedVerse,
        reference: historyItem.reference
      }
      onVerseSelect(scriptureRef)
    }
  }

  const handleClearAll = () => {
    verseHistoryUtils.clearHistory()
    setHistory([])
    if (onClearHistory) {
      onClearHistory()
    }
  }

  const handleRemoveItem = (osisId) => {
    verseHistoryUtils.removeFromHistory(osisId)
    setHistory(prev => prev.filter(item => item.osisId !== osisId))
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Less than an hour ago'
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="search-history" role="main" aria-label="Search History">
        <div className="search-history__header">
          <h1 className="search-history__title">Search History</h1>
        </div>
        <div className="search-history__loading" role="status" aria-live="polite">
          <span className="sr-only">Loading history...</span>
          Loading history...
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="search-history" role="main" aria-label="Search History">
        <div className="search-history__header">
          <h1 className="search-history__title">Search History</h1>
        </div>
        <div className="search-history__empty" role="status">
          <p>No verses in your history yet.</p>
          <p className="search-history__empty-hint">Navigate to verses to build your history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="search-history" role="main" aria-label="Search History">
      <div className="search-history__header">
        <h1 className="search-history__title">Search History</h1>
        <button
          type="button"
          className="search-history__clear-all"
          onClick={handleClearAll}
          aria-label="Clear all history"
        >
          Clear All
        </button>
      </div>
      
      <div className="search-history__list" role="list">
        {history.map((item, index) => (
          <div key={item.osisId} className="search-history__item" role="listitem">
            <button
              type="button"
              className="search-history__verse-button"
              onClick={() => handleVerseClick(item)}
              aria-label={`Navigate to ${item.reference}`}
            >
              <div className="search-history__verse-reference">
                {item.reference}
              </div>
              <div className="search-history__verse-timestamp">
                {formatTimestamp(item.timestamp)}
              </div>
            </button>
            <button
              type="button"
              className="search-history__remove-button"
              onClick={() => handleRemoveItem(item.osisId)}
              aria-label={`Remove ${item.reference} from history`}
              title={`Remove ${item.reference} from history`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchHistory