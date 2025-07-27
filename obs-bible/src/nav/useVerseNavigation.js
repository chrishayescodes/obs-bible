import { useState, useCallback } from 'react'
import { verseHistoryUtils } from '../utils/verseHistory'

export const useVerseNavigation = () => {
  const [selectedScripture, setSelectedScripture] = useState(null)
  const [verseData, setVerseData] = useState(null)
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [navigatedVerse, setNavigatedVerse] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)

  const handleVerseSelected = useCallback(async (scriptureRef) => {
    console.log('Verse navigated to:', scriptureRef)
    
    // Add to history and save as current verse
    verseHistoryUtils.addToHistory(scriptureRef)
    verseHistoryUtils.setCurrentVerse(scriptureRef)
    
    // Create the navigated verse OSIS ID from the scripture reference
    const navigatedVerseId = `${scriptureRef.bookId}.${scriptureRef.chapter}.${scriptureRef.verse}`
    
    const updatedScriptureRef = {
      ...scriptureRef,
      navigatedVerse: navigatedVerseId
    }
    
    setSelectedScripture(updatedScriptureRef)
    setNavigatedVerse(navigatedVerseId)
    setLoadingVerses(true)
    
    try {
      // Construct the JSON file path from scripture reference
      const { bookId, chapter } = scriptureRef
      const jsonPath = `/data/output_chapters_json/${bookId}/${bookId}_${chapter}.json`
      
      const response = await fetch(jsonPath)
      if (!response.ok) {
        throw new Error(`Failed to load verses: ${response.status}`)
      }
      
      const verses = await response.json()
      setVerseData(verses)
    } catch (error) {
      console.error('Error loading verse data:', error)
      setVerseData(null)
    } finally {
      setLoadingVerses(false)
    }
  }, [])

  const handleVerseDisplaySelect = useCallback((osisId) => {
    // Update the selected verse for highlighting when clicking in verse display
    setSelectedVerse(osisId)
  }, [])

  const handleBackToBooks = useCallback(() => {
    // Clear current verse from localStorage and all selections
    verseHistoryUtils.clearCurrentVerse()
    
    // Clear all selections and return to navigation
    setSelectedScripture(null)
    setVerseData(null)
    setLoadingVerses(false)
    setNavigatedVerse(null)
    setSelectedVerse(null)
  }, [])

  const restoreCurrentVerse = useCallback(async () => {
    // Restore current verse from localStorage if it exists
    const savedVerse = verseHistoryUtils.getCurrentVerse()
    if (savedVerse && savedVerse.bookId && savedVerse.chapter && savedVerse.verse) {
      // Only restore if we have complete verse data
      await handleVerseSelected(savedVerse)
    }
  }, [handleVerseSelected])

  return {
    // State
    selectedScripture,
    verseData,
    loadingVerses,
    navigatedVerse,
    selectedVerse,
    
    // Actions
    handleVerseSelected,
    handleVerseDisplaySelect,
    handleBackToBooks,
    restoreCurrentVerse
  }
}