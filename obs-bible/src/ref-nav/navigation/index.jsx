import React, { useState } from 'react'
import BibleBookSelector from '../book-selection'
import ChapterSelector from '../chapter-selection'
import VerseSelect from '../verse-selection'
import Breadcrumb from '../breadcrumb'
import './Navigation.css'

const Navigation = ({ bibleData }) => {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)

  const handleBookSelect = (bookId, bookInfo) => {
    setSelectedBook({ id: bookId, ...bookInfo })
    setSelectedChapter(null) // Reset chapter selection when book changes
    setSelectedVerse(null) // Reset verse selection when book changes
    console.log('Selected book:', bookId, bookInfo)
  }

  const handleChapterSelect = (chapterNumber) => {
    setSelectedChapter(chapterNumber)
    setSelectedVerse(null) // Reset verse selection when chapter changes
    console.log('Selected chapter:', chapterNumber)
  }

  const handleVerseSelect = (verseNumber) => {
    setSelectedVerse(verseNumber)
    console.log('Selected verse:', verseNumber)
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