import { useState, useEffect } from 'react'
import './App.css'
import BibleBookSelector from './book-selection'
import ChapterSelector from './chapter-selection'
import VerseSelect from './verse-selection'
import Breadcrumb from './breadcrumb'

function App() {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)
  const [bibleData, setBibleData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load the Bible structure data
    fetch('/data/kjv_structure.json')
      .then(response => response.json())
      .then(data => {
        setBibleData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading Bible data:', error)
        setLoading(false)
      })
  }, [])

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

  if (loading) {
    return (
      <div className="app">
        <h1>OSB Bible</h1>
        <div className="loading">Loading Bible data...</div>
      </div>
    )
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
    <div className="app">
      <h1>OSB Bible</h1>
      
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

export default App
