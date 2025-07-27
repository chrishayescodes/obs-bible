import { useState, useCallback } from 'react'
import { verseHistoryUtils } from '../utils/verseHistory'

export const useVerseNavigation = () => {
  const [selectedScripture, setSelectedScripture] = useState(null)
  const [verseData, setVerseData] = useState(null)
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [navigatedVerse, setNavigatedVerse] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const [loadedChapters, setLoadedChapters] = useState(new Set())

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
      setLoadedChapters(new Set([`${bookId}.${chapter}`]))
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
    setLoadedChapters(new Set())
  }, [])

  const restoreCurrentVerse = useCallback(async () => {
    // Restore current verse from localStorage if it exists
    const savedVerse = verseHistoryUtils.getCurrentVerse()
    if (savedVerse && savedVerse.bookId && savedVerse.chapter && savedVerse.verse) {
      // Only restore if we have complete verse data
      await handleVerseSelected(savedVerse)
    }
  }, [handleVerseSelected])

  const loadAdjacentChapter = useCallback(async (bookData, currentChapter, direction) => {
    if (!selectedScripture || !bookData) return null

    const { bookId } = selectedScripture
    const currentChapterNum = parseInt(currentChapter)
    const targetChapterNum = direction === 'next' ? currentChapterNum + 1 : currentChapterNum - 1
    
    // Check if target chapter exists
    if (targetChapterNum < 1 || targetChapterNum > bookData.chapter_count) {
      return null
    }

    const targetChapterKey = `${bookId}.${targetChapterNum}`
    
    // Check if already loaded
    if (loadedChapters.has(targetChapterKey)) {
      return null
    }

    setLoadingVerses(true)
    
    try {
      const jsonPath = `/data/output_chapters_json/${bookId}/${bookId}_${targetChapterNum}.json`
      const response = await fetch(jsonPath)
      
      if (!response.ok) {
        throw new Error(`Failed to load chapter: ${response.status}`)
      }
      
      const verses = await response.json()
      
      // Merge with existing verse data
      setVerseData(prevData => ({
        ...prevData,
        ...verses
      }))
      
      // Add to loaded chapters
      setLoadedChapters(prev => new Set([...prev, targetChapterKey]))
      
      return targetChapterNum
    } catch (error) {
      console.error('Error loading adjacent chapter:', error)
      return null
    } finally {
      setLoadingVerses(false)
    }
  }, [selectedScripture, loadedChapters])

  const handlePreviousChapter = useCallback(async (bookData) => {
    if (!selectedScripture) return
    
    const currentChapter = selectedScripture.chapter
    const result = await loadAdjacentChapter(bookData, currentChapter, 'previous')
    
    if (result) {
      // Scroll to the first verse of the previous chapter
      const firstVerseId = `${selectedScripture.bookId}.${result}.1`
      setNavigatedVerse(firstVerseId)
    }
  }, [selectedScripture, loadAdjacentChapter])

  const handleNextChapter = useCallback(async (bookData) => {
    if (!selectedScripture) return
    
    const currentChapter = selectedScripture.chapter
    const result = await loadAdjacentChapter(bookData, currentChapter, 'next')
    
    if (result) {
      // Scroll to the first verse of the next chapter
      const firstVerseId = `${selectedScripture.bookId}.${result}.1`
      setNavigatedVerse(firstVerseId)
    }
  }, [selectedScripture, loadAdjacentChapter])

  const getAdjacentChapterInfo = useCallback((bookData) => {
    if (!selectedScripture || !bookData) {
      return { hasPrevious: false, hasNext: false }
    }

    const currentChapterNum = parseInt(selectedScripture.chapter)
    const hasPrevious = currentChapterNum > 1
    const hasNext = currentChapterNum < bookData.chapter_count

    return { hasPrevious, hasNext }
  }, [selectedScripture])

  return {
    // State
    selectedScripture,
    verseData,
    loadingVerses,
    navigatedVerse,
    selectedVerse,
    loadedChapters,
    
    // Actions
    handleVerseSelected,
    handleVerseDisplaySelect,
    handleBackToBooks,
    restoreCurrentVerse,
    handlePreviousChapter,
    handleNextChapter,
    getAdjacentChapterInfo
  }
}