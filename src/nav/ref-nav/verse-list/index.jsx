import React, { useState, useEffect } from 'react'
import './VerseList.css'

const VerseList = ({
  // Data configuration
  dataSource,
  eventName,
  
  // UI configuration
  title,
  emptyMessage,
  emptyHint,
  loadingMessage,
  
  // CSS configuration
  cssPrefix,
  
  // Callbacks
  onVerseSelect,
  onClearAll,
  
  // Customization options
  showCount = false,
  formatTimestamp,
  ariaLabel
}) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await Promise.resolve(dataSource.getItems())
        setItems(data)
      } catch (error) {
        console.error(`Failed to load ${title.toLowerCase()}:`, error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    // Load items on component mount
    loadItems()

    // Listen for updates and reload when they occur
    const handleUpdate = () => {
      loadItems()
    }

    window.addEventListener(eventName, handleUpdate)

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener(eventName, handleUpdate)
    }
  }, [dataSource, eventName, title])

  const handleVerseClick = (item) => {
    if (onVerseSelect) {
      // Handle split verses (e.g., "9a", "9b") by extracting the number
      const verseNumber = item.verse.toString().match(/^\d+/)
      const parsedVerse = verseNumber ? parseInt(verseNumber[0]) : parseInt(item.verse)
      
      // Create scripture reference object for navigation
      const scriptureRef = {
        book: item.book,
        bookId: item.bookId,
        chapter: item.chapter,
        verse: parsedVerse,
        reference: item.reference
      }
      onVerseSelect(scriptureRef)
    }
  }

  const handleClearAll = () => {
    dataSource.clearAll()
    setItems([])
    if (onClearAll) {
      onClearAll()
    }
  }

  const handleRemoveItem = (osisId) => {
    dataSource.removeItem(osisId)
    setItems(prev => prev.filter(item => item.osisId !== osisId))
  }

  const defaultFormatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) {
      return 'Recently'
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const timestampFormatter = formatTimestamp || defaultFormatTimestamp

  if (loading) {
    return (
      <div className={`${cssPrefix}`} role="main" aria-label={ariaLabel || title}>
        <div className={`${cssPrefix}__header`}>
          <h1 className={`${cssPrefix}__title`}>{title}</h1>
        </div>
        <div className={`${cssPrefix}__loading`} role="status" aria-live="polite">
          <span className="sr-only">{loadingMessage}...</span>
          {loadingMessage}...
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={`${cssPrefix}`} role="main" aria-label={ariaLabel || title}>
        <div className={`${cssPrefix}__header`}>
          <h1 className={`${cssPrefix}__title`}>{title}</h1>
        </div>
        <div className={`${cssPrefix}__empty`} role="status">
          <p>{emptyMessage}</p>
          <p className={`${cssPrefix}__empty-hint`}>{emptyHint}</p>
        </div>
      </div>
    )
  }

  const displayTitle = showCount ? `${title} (${items.length})` : title

  return (
    <div className={`${cssPrefix}`} role="main" aria-label={ariaLabel || title}>
      <div className={`${cssPrefix}__header`}>
        <h1 className={`${cssPrefix}__title`}>{displayTitle}</h1>
        <button
          type="button"
          className={`${cssPrefix}__clear-all`}
          onClick={handleClearAll}
          aria-label={`Clear all ${title.toLowerCase()}`}
        >
          Clear All
        </button>
      </div>
      
      <div className={`${cssPrefix}__list`} role="list">
        {items.map((item) => (
          <div key={item.osisId} className={`${cssPrefix}__item`} role="listitem">
            <button
              type="button"
              className={`${cssPrefix}__verse-button`}
              onClick={() => handleVerseClick(item)}
              aria-label={`Navigate to ${item.reference}`}
            >
              <div className={`${cssPrefix}__verse-reference`}>
                {item.reference}
              </div>
              <div className={`${cssPrefix}__verse-timestamp`}>
                {timestampFormatter(item.timestamp)}
              </div>
            </button>
            <button
              type="button"
              className={`${cssPrefix}__remove-button`}
              onClick={() => handleRemoveItem(item.osisId)}
              aria-label={`Remove ${item.reference} from ${title.toLowerCase()}`}
              title={`Remove ${item.reference} from ${title.toLowerCase()}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VerseList