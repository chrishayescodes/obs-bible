import React from 'react'
import TabbedNavigation from './ref-nav/tabbed-nav'
import VerseDisplay from './bible-nav/verse-display'
import { useVerseNavigation } from './useVerseNavigation'

const AppNavigation = ({ bibleData }) => {
  
  // Extract all verse navigation logic into custom hook
  const {
    selectedScripture,
    verseData,
    loadingVerses,
    navigatedVerse,
    selectedVerse,
    handleVerseSelected,
    handleVerseDisplaySelect,
    handleBackToBooks,
    restoreCurrentVerse,
    handlePreviousChapter,
    handleNextChapter,
    getAdjacentChapterInfo
  } = useVerseNavigation(bibleData)

  // Restore current verse when bibleData is loaded
  React.useEffect(() => {
    if (bibleData) {
      restoreCurrentVerse()
    }
  }, [bibleData, restoreCurrentVerse])

  // Get the selected book data for chapter navigation
  const getSelectedBookData = () => {
    if (!selectedScripture || !bibleData) return null
    
    const { bookId } = selectedScripture
    const oldTestament = bibleData.old_testament?.books?.[bookId]
    const newTestament = bibleData.new_testament?.books?.[bookId]
    
    return oldTestament || newTestament || null
  }

  const selectedBookData = getSelectedBookData()

  return (
    <TabbedNavigation 
      bibleData={bibleData} 
      onVerseSelected={handleVerseSelected}
      selectedScripture={selectedScripture}
      verseData={verseData}
      loadingVerses={loadingVerses}
      navigatedVerse={navigatedVerse}
      selectedVerse={selectedVerse}
      handleVerseDisplaySelect={handleVerseDisplaySelect}
      handleBackToBooks={handleBackToBooks}
      selectedBookData={selectedBookData}
      handlePreviousChapter={handlePreviousChapter}
      handleNextChapter={handleNextChapter}
      getAdjacentChapterInfo={getAdjacentChapterInfo}
    />
  )
}

export default AppNavigation