import React from 'react'
import Navigation from './ref-nav/navigation'
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
  } = useVerseNavigation()

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
    <>
      {selectedScripture ? (
        // Show verse display with back button
        <div className="verse-view">
          <div className="verse-header">
            <button 
              className="back-button" 
              onClick={handleBackToBooks}
              type="button"
            >
              ← Back to Books
            </button>
          </div>
          
          {loadingVerses ? (
            <div className="verse-loading">
              <div className="loading">Loading verses...</div>
            </div>
          ) : verseData ? (
            <VerseDisplay
              verseData={verseData}
              selectedVerse={selectedVerse}
              navigateToVerse={navigatedVerse}
              onVerseSelect={handleVerseDisplaySelect}
              bookName={selectedScripture.book}
              chapterNumber={selectedScripture.chapter}
              bookData={selectedBookData}
              onPreviousChapter={handlePreviousChapter}
              onNextChapter={handleNextChapter}
              getAdjacentChapterInfo={getAdjacentChapterInfo}
              loadingVerses={loadingVerses}
            />
          ) : (
            <div className="verse-error">
              <div className="loading">Failed to load verses</div>
            </div>
          )}
        </div>
      ) : (
        // Show navigation
        <div className="navigation-view">
          <Navigation bibleData={bibleData} onVerseSelected={handleVerseSelected} />
        </div>
      )}
    </>
  )
}

export default AppNavigation