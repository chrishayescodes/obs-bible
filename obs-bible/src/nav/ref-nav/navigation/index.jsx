import React, { useState } from 'react'
import BibleBookSelector from '../book-selection'
import ChapterSelector from '../chapter-selection'
import VerseSelect from '../verse-selection'
import Breadcrumb from '../breadcrumb'
import { getSimpleBookName } from '../../../utils/bookNames'
import './Navigation.css'

const Navigation = ({ bibleData, onVerseSelected, initialBookData = null, initialChapter = null }) => {
  const [selectedBook, setSelectedBook] = useState(initialBookData)
  const [selectedChapter, setSelectedChapter] = useState(initialChapter)
  const [selectedVerse, setSelectedVerse] = useState(null)

  const handleBookSelect = (bookId, bookInfo) => {
    setSelectedBook({ id: bookId, ...bookInfo })
    setSelectedChapter(null) // Reset chapter selection when book changes
    setSelectedVerse(null) // Reset verse selection when book changes
  }

  const handleChapterSelect = (chapterNumber) => {
    setSelectedChapter(chapterNumber)
    setSelectedVerse(null) // Reset verse selection when chapter changes
  }

  const handleVerseSelect = (verseNumber) => {
    setSelectedVerse(verseNumber)
    
    // Call the callback with scripture reference
    if (onVerseSelected && selectedBook && selectedChapter) {
      // Use simple book name instead of formal title
      const simpleBookName = getSimpleBookName(selectedBook.id)
      const scriptureRef = {
        book: simpleBookName,
        bookId: selectedBook.id,
        chapter: selectedChapter,
        verse: verseNumber,
        reference: `${simpleBookName} ${selectedChapter}:${verseNumber}`
      }
      onVerseSelected(scriptureRef)
    }
  }

  const handleBreadcrumbReset = () => {
    setSelectedBook(null)
    setSelectedChapter(null)
    setSelectedVerse(null)
  }

  const handleBreadcrumbBookSelect = () => {
    setSelectedChapter(null)
    setSelectedVerse(null)
  }

  const handleBreadcrumbChapterSelect = () => {
    setSelectedVerse(null)
  }

  return (
    <div className="navigation">
      <Breadcrumb 
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        selectedVerse={selectedVerse}
        onReset={handleBreadcrumbReset}
        onBookSelect={handleBreadcrumbBookSelect}
        onChapterSelect={handleBreadcrumbChapterSelect}
      />
      
      {selectedBook && selectedChapter ? (
        <div className="verse-view">
          <VerseSelect 
            bookData={selectedBook} 
            chapterNumber={selectedChapter}
            onVerseSelect={handleVerseSelect}
          />
        </div>
      ) : selectedBook ? (
        <div className="chapter-view">
          <ChapterSelector 
            bookData={selectedBook} 
            onChapterSelect={handleChapterSelect}
          />
        </div>
      ) : (
        <BibleBookSelector bibleData={bibleData} onBookSelect={handleBookSelect} />
      )}
    </div>
  )
}

export default Navigation