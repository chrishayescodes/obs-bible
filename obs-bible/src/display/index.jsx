import React, { useState, useEffect } from 'react'
import { verseHistoryUtils } from '../utils/verseHistory'
import { verseSyncUtils, MessageTypes } from '../utils/broadcastChannel'
import { createSimpleReference, loadBookNames } from '../utils/bookNames'
import './SelectedVerseDisplay.css'

const SelectedVerseDisplay = () => {
  const [currentVerse, setCurrentVerse] = useState(null)
  const [verseText, setVerseText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Optionally load book names from JSON to enhance the mapping
    loadBookNames()
  }, [])

  useEffect(() => {
    // Load current verse from localStorage on component mount
    const verse = verseHistoryUtils.getCurrentVerse()
    if (verse) {
      setCurrentVerse(verse)
      loadVerseText(verse)
    }

    // Subscribe to broadcast messages for cross-tab synchronization
    const unsubscribe = verseSyncUtils.subscribe((message) => {
        
      if (message.type === MessageTypes.VERSE_SELECTED && message.data) {
        // Update display with the new verse
        setCurrentVerse(message.data)
        loadVerseText(message.data)
      } else if (message.type === MessageTypes.VERSE_CLEARED) {
        // Clear the display when verse is cleared
        setCurrentVerse(null)
        setVerseText('')
        setError(null)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  const loadVerseText = async (verse) => {
    if (!verse || !verse.bookId || !verse.chapter || !verse.verse) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/data/output_chapters_json/${verse.bookId}/${verse.bookId}_${verse.chapter}.json`)
      
      if (!response.ok) {
        throw new Error(`Failed to load chapter data: ${response.status}`)
      }

      const chapterData = await response.json()
      const osisId = `${verse.bookId}.${verse.chapter}.${verse.verse}`
      const text = chapterData[osisId]

      if (text) {
        setVerseText(text)
      } else {
        setError(`Verse ${verse.reference} not found in chapter data`)
      }
    } catch (err) {
      console.error('Error loading verse text:', err)
      setError('Failed to load verse content')
    } finally {
      setLoading(false)
    }
  }

  const handleClearVerse = () => {
    verseHistoryUtils.clearCurrentVerse()
    setCurrentVerse(null)
    setVerseText('')
    setError(null)
  }

  if (!currentVerse) {
    return (
      <div className="selected-verse-display">
        <div className="no-verse-selected">
          <h3>No Verse Selected</h3>
          <p>Navigate to a verse to see it displayed here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="selected-verse-display">
      <div className="verse-header">
        <h3 className="verse-reference">
          {(() => {
            if (currentVerse.bookId && currentVerse.chapter && currentVerse.verse !== undefined) {
              return createSimpleReference(currentVerse.bookId, currentVerse.chapter, currentVerse.verse)
            }
            return currentVerse.reference
          })()}
        </h3>
        <button 
          type="button"
          className="clear-verse-button"
          onClick={handleClearVerse}
          aria-label={`Clear selected verse ${
            currentVerse.bookId && currentVerse.chapter && currentVerse.verse !== undefined
              ? createSimpleReference(currentVerse.bookId, currentVerse.chapter, currentVerse.verse)
              : currentVerse.reference
          }`}
        >
          ✕
        </button>
      </div>

      <div className="verse-content">
        {loading && (
          <div className="verse-loading">
            <div className="loading-spinner" aria-label="Loading verse content"></div>
            <span>Loading verse content...</span>
          </div>
        )}

        {error && (
          <div className="verse-error">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && verseText && (
          <div className="verse-text">
            <span className="verse-number">{currentVerse.verse}</span>
            <span className="verse-content-text">{verseText}</span>
          </div>
        )}
      </div>

      {currentVerse.timestamp && (
        <div className="verse-metadata">
          <span className="verse-timestamp">
            Selected {new Date(currentVerse.timestamp).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}

export default SelectedVerseDisplay