import { useState, useCallback } from 'react'
import { verseHistoryUtils } from '../utils/verseHistory'
import { verseSyncUtils } from '../messages/utils/broadcastChannel'
import { getSimpleBookName } from '../utils/bookNames'

// Debug logging removed - implementation working correctly

export const useVerseNavigation = (bibleData) => {
  const [selectedScripture, setSelectedScripture] = useState(null)
  const [verseData, setVerseData] = useState(null)
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [navigatedVerse, setNavigatedVerse] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const [loadedChapters, setLoadedChapters] = useState(new Set())

  const handleVerseSelected = useCallback(async (scriptureRef) => {
    
    // Add to history when navigating to verses
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
      
      // Check if the requested verse exists, if not, look for split verse (e.g., 9a)
      if (navigatedVerseId && !verses[navigatedVerseId]) {
        const splitVerseId = `${navigatedVerseId}a`
        if (verses[splitVerseId]) {
          // Update the navigated verse to point to the first part of the split verse
          setNavigatedVerse(splitVerseId)
        }
      }
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
    
    // Parse the OSIS ID to create a scripture reference
    const [bookId, chapter, verse] = osisId.split('.')
    
    // Use simple book name instead of formal title
    const bookTitle = getSimpleBookName(bookId)
    
    const scriptureRef = {
      book: bookTitle,
      bookId: bookId,
      chapter: chapter,
      verse: verse, // Keep exact verse (could be "9a", "9b", etc.)
      reference: `${bookTitle} ${chapter}:${verse}`
    }
    
    // Broadcast verse selection to other tabs/windows (but don't add to history)
    verseSyncUtils.broadcastVerseSelection(scriptureRef)
  }, [bibleData])

  const handleBackToBooks = useCallback(() => {
    // Clear navigation state only - do NOT clear localStorage or broadcast
    // The display page should remain independent of navigation state
    
    setSelectedScripture(null)
    setVerseData(null)
    setLoadingVerses(false)
    setNavigatedVerse(null)
    setSelectedVerse(null)
    setLoadedChapters(new Set())
  }, [])

  const handleBackToChapter = useCallback(() => {
    // Clear verse data to go back to chapter selection
    setVerseData(null)
    setLoadingVerses(false)
    setNavigatedVerse(null)
    setSelectedVerse(null)
    setLoadedChapters(new Set())
    
    // Keep book and chapter selection but clear verse
    if (selectedScripture) {
      setSelectedScripture(prev => ({
        ...prev,
        verse: null
      }))
    }
  }, [selectedScripture])

  const handleBackToVerseSelection = useCallback(() => {
    // Keep the current scripture reference but clear verse data
    // This returns to verse selection view while maintaining current selection context
    setVerseData(null)
    setLoadingVerses(false)
    setNavigatedVerse(null)
    setSelectedVerse(null)
    setLoadedChapters(new Set())
    
    // Clear verse from selectedScripture but keep book and chapter
    if (selectedScripture) {
      setSelectedScripture(prev => ({
        ...prev,
        verse: null
      }))
    }
  }, [selectedScripture])

  const handleBackToBookChapters = useCallback(() => {
    // Clear chapter and verse data to go back to chapter selection for the current book
    setVerseData(null)
    setLoadingVerses(false)
    setNavigatedVerse(null)
    setSelectedVerse(null)
    setLoadedChapters(new Set())
    
    // Keep book selection but clear chapter and verse
    if (selectedScripture) {
      setSelectedScripture(prev => ({
        ...prev,
        chapter: null,
        verse: null
      }))
    }
  }, [selectedScripture])

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
    if (!selectedScripture || !bookData || loadedChapters.size === 0) return
    
    const { bookId } = selectedScripture
    
    // Get all loaded chapter numbers for this book
    const loadedChapterNums = Array.from(loadedChapters)
      .filter(key => key.startsWith(`${bookId}.`))
      .map(key => parseInt(key.split('.')[1]))
    
    if (loadedChapterNums.length === 0) return
    
    const minLoadedChapter = Math.min(...loadedChapterNums)
    const targetChapter = minLoadedChapter - 1
    
    const result = await loadAdjacentChapter(bookData, minLoadedChapter, 'previous')
    
    if (result) {
      // Scroll to the first verse of the previous chapter
      const firstVerseId = `${bookId}.${result}.1`
      setNavigatedVerse(firstVerseId)
    }
  }, [selectedScripture, loadedChapters, loadAdjacentChapter])

  const handleNextChapter = useCallback(async (bookData) => {
    if (!selectedScripture || !bookData || loadedChapters.size === 0) return
    
    const { bookId } = selectedScripture
    
    // Get all loaded chapter numbers for this book
    const loadedChapterNums = Array.from(loadedChapters)
      .filter(key => key.startsWith(`${bookId}.`))
      .map(key => parseInt(key.split('.')[1]))
    
    if (loadedChapterNums.length === 0) return
    
    const maxLoadedChapter = Math.max(...loadedChapterNums)
    const targetChapter = maxLoadedChapter + 1
    
    const result = await loadAdjacentChapter(bookData, maxLoadedChapter, 'next')
    
    if (result) {
      // Scroll to the first verse of the next chapter
      const firstVerseId = `${bookId}.${result}.1`
      setNavigatedVerse(firstVerseId)
    }
  }, [selectedScripture, loadedChapters, loadAdjacentChapter])

  const getAdjacentChapterInfo = useCallback((bookData) => {
    if (!selectedScripture || !bookData || loadedChapters.size === 0) {
      return { hasPrevious: false, hasNext: false }
    }

    const { bookId } = selectedScripture
    
    // Get all loaded chapter numbers for this book
    const loadedChapterNums = Array.from(loadedChapters)
      .filter(key => key.startsWith(`${bookId}.`))
      .map(key => parseInt(key.split('.')[1]))
      .sort((a, b) => a - b)
    
    if (loadedChapterNums.length === 0) {
      return { hasPrevious: false, hasNext: false }
    }
    
    const minLoadedChapter = Math.min(...loadedChapterNums)
    const maxLoadedChapter = Math.max(...loadedChapterNums)
    
    const hasPrevious = minLoadedChapter > 1
    const hasNext = maxLoadedChapter < bookData.chapter_count

    return { hasPrevious, hasNext }
  }, [selectedScripture, loadedChapters])

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
    handleBackToChapter,
    handleBackToBookChapters,
    handleBackToVerseSelection,
    restoreCurrentVerse,
    handlePreviousChapter,
    handleNextChapter,
    getAdjacentChapterInfo
  }
}