import React, { useState, useEffect } from 'react'
import { verseHistoryUtils } from '../utils/verseHistory'
import { verseSyncUtils, MessageTypes } from '../utils/broadcastChannel'
import { createSimpleReference, loadBookNames } from '../utils/bookNames'
import './SelectedVerseDisplay.css'

const SelectedVerseDisplay = () => {
  const [currentVerse, setCurrentVerse] = useState(null)
  const [currentHidden, setCurrentHidden] = useState(false);
  const [tempVerse, setTempVerse] = useState(null)
  const [tempHidden, setTempHidden] = useState(true);
  const [tempVerseRef, setTempVerseRef] = useState('')
  const [verseText, setVerseText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Optionally load book names from JSON to enhance the mapping
    loadBookNames()

    // Add body class for OBS Studio overlay styling
    document.body.classList.add('obs-overlay')

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('obs-overlay')
    }
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
      // Handle both regular verses (9) and split verses (9a, 9b)
      const osisId = `${verse.bookId}.${verse.chapter}.${verse.verse}`
      const text = chapterData[osisId]

      if (text) {
        // Store the old verse and reference in temp
        setTempVerse(verseText)
        setTempVerseRef(currentVerse ? createSimpleReference(currentVerse.bookId, currentVerse.chapter, currentVerse.verse) : '')
        setTempHidden(false)
        setCurrentHidden(true)

        setTimeout(() => {
          setVerseText(text)
          setCurrentHidden(false)
          setTempHidden(true)
          }, 300)
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

  // Don't render anything if no verse is selected
  if (!currentVerse || (!verseText && !loading)) {
    return null
  }

  // Only show content when we have verse text (no loading or error states)
  if (!verseText || loading || error) {
    return null
  }

  const verseReference = currentVerse.bookId && currentVerse.chapter && currentVerse.verse !== undefined
    ? createSimpleReference(currentVerse.bookId, currentVerse.chapter, currentVerse.verse)
    : currentVerse.reference

  return (
    <div className="selected-verse-display">
      <div className={`verse-wrapper ${currentHidden ? 'hidden' : 'visible'}`}>
        <div className="verse-text">{verseText && verseReference ? `${verseText} ~ ${verseReference}` : ''}</div>
      </div>
      <div className={`verse-wrapper ${tempHidden ? 'hidden' : 'visible'}`}>
        <div className="verse-text">{tempVerse && tempVerseRef ? `${tempVerse} ~ ${tempVerseRef}` : ''}</div>
      </div>
    </div>
  )
}

export default SelectedVerseDisplay