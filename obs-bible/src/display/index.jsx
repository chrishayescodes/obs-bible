import React, { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { verseHistoryUtils } from '../utils/verseHistory'
import { verseSyncUtils, MessageTypes } from '../utils/broadcastChannel'
import { createSimpleReference, loadBookNames } from '../utils/bookNames'
import './SelectedVerseDisplay.css'

const SelectedVerseDisplay = () => {
  const [currentVerse, setCurrentVerse] = useState(null)
  const [tempText, setTempText] = useState("")
  const [currentText, setCurrentText] = useState("")
  const [currentOpacity, setCurrentOpacity] = useState(1)
  const [tempOpacity, setTempOpacity] = useState(0)
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
        const verseReference = createSimpleReference(verse.bookId, verse.chapter, verse.verse)
        const newText = `${text} ~ ${verseReference}`

        // Use setTimeout to move flushSync out of render cycle
        setTimeout(() => {
          flushSync(() => {
            // swap text and opacity, set temp to look like current
            setTempText(currentText)
            setTempOpacity(1)
            setCurrentOpacity(0)
            setCurrentText(newText)
          })

          let startTime = Date.now()
          const duration = 500

          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            setTempOpacity(1 - progress)
            setCurrentOpacity(progress)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setTempOpacity(0)
              setCurrentOpacity(1)
            }
          }

          requestAnimationFrame(animate)
        }, 0)
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
  if (!currentVerse || (!currentText && !loading)) {
    return null
  }

  // Only show content when we have verse text (no loading or error states)
  if (!currentText || loading || error) {
    return null
  }

  return (
    <div className="selected-verse-display">
      <div className="verse-wrapper current-div" style={{ opacity: currentOpacity }}>
        <div className="verse-text">{currentText}</div>
      </div>
      <div className="verse-wrapper temp-div" style={{ opacity: tempOpacity }}>
        <div className="verse-text">{tempText}</div>
      </div>
    </div>
  )
}

export default SelectedVerseDisplay