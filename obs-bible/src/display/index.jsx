import React, { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { verseHistoryUtils } from '../utils/verseHistory'
import { verseSyncUtils, MessageTypes } from '../messages/utils/broadcastChannel'
import { markdownUtils } from '../messages/utils/markdownRenderer'
import { createSimpleReference, loadBookNames } from '../utils/bookNames'
import './SelectedVerseDisplay.css'

const SelectedVerseDisplay = () => {
  const [currentContent, setCurrentContent] = useState(null) // Can be verse or custom message
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
    // Load current content from localStorage on component mount
    const content = verseHistoryUtils.getCurrentVerse()
    if (content) {
      setCurrentContent(content)
      loadContent(content)
    }

    // Subscribe to broadcast messages for cross-tab synchronization
    const unsubscribe = verseSyncUtils.subscribe((message) => {
      if (message.type === MessageTypes.VERSE_SELECTED && message.data) {
        // Update display with the new verse
        setCurrentContent(message.data)
        loadContent(message.data)
      } else if (message.type === MessageTypes.VERSE_CLEARED) {
        // Clear the display when verse is cleared
        setCurrentContent(null)
        clearDisplay()
      } else if (message.type === MessageTypes.CUSTOM_MESSAGE_SELECTED && message.data) {
        // Update display with the new custom message
        setCurrentContent(message.data)
        loadContent(message.data)
      } else if (message.type === MessageTypes.CUSTOM_MESSAGE_CLEARED) {
        // Clear the display when custom message is cleared
        setCurrentContent(null)
        clearDisplay()
      }
    })

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [])

  const loadContent = async (content) => {
    if (!content) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      let newText = ''

      if (content.type === 'custom') {
        // Handle custom message
        if (!content.title || !content.content) {
          throw new Error('Invalid custom message data')
        }

        // Convert markdown to plain text for display
        const plainTextContent = markdownUtils.renderToPlainText(content.content)
        newText = `${plainTextContent} ~ ${content.title}`

        // Use setTimeout to move flushSync out of render cycle
        setTimeout(() => {
          updateDisplayWithFade(newText)
        }, 0)

      } else {
        // Handle verse content (existing logic) - also handle legacy data without type
        if (!content.bookId || !content.chapter || content.verse === undefined) {
          throw new Error('Invalid verse data')
        }

        const response = await fetch(`/data/output_chapters_json/${content.bookId}/${content.bookId}_${content.chapter}.json`)

        if (!response.ok) {
          throw new Error(`Failed to load chapter data: ${response.status}`)
        }

        const chapterData = await response.json()
        // Handle both regular verses (9) and split verses (9a, 9b)
        const osisId = `${content.bookId}.${content.chapter}.${content.verse}`
        const text = chapterData[osisId]

        if (text) {
          const verseReference = createSimpleReference(content.bookId, content.chapter, content.verse)
          newText = `${text} ~ ${verseReference}`

          // Use setTimeout to move flushSync out of render cycle
          setTimeout(() => {
            updateDisplayWithFade(newText)
          }, 0)
        } else {
          throw new Error(`Verse ${content.reference || `${content.bookId} ${content.chapter}:${content.verse}`} not found in chapter data`)
        }
      }
    } catch (err) {
      console.error('Error loading content:', err)
      setError(err.message || 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const updateDisplayWithFade = (newText) => {
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
  }

  const clearDisplay = () => {
    setCurrentText('')
    setTempText('')
    setError(null)
  }

  // Don't render anything if no content is selected
  if (!currentContent || (!currentText && !loading)) {
    return null
  }

  // Only show content when we have text (no loading or error states)
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