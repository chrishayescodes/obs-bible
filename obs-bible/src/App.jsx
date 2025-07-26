import { useState, useEffect } from 'react'
import './App.css'
import BibleBookSelector from './book-selection'
import ChapterSelector from './chapter-selection'
import VerseSelect from './verse-selection'

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

  return (
    <div className="app">
      <h1>OSB Bible</h1>
      
      {selectedBook && selectedChapter && selectedVerse && (
        <div className="selected-info">
          <h2>{selectedBook.title} {selectedChapter}:{selectedVerse}</h2>
          <p>Chapter {selectedChapter} has {selectedBook.chapters[selectedChapter]} verses</p>
        </div>
      )}
      
      {selectedBook && selectedChapter ? (
        <div className="verse-view">
          <button 
            className="back-button" 
            onClick={() => setSelectedChapter(null)}
          >
            ← Back to Chapters
          </button>
          <VerseSelect 
            bookData={selectedBook} 
            chapterNumber={selectedChapter}
            onVerseSelect={handleVerseSelect}
          />
        </div>
      ) : selectedBook ? (
        <div className="chapter-view">
          <button 
            className="back-button" 
            onClick={() => setSelectedBook(null)}
          >
            ← Back to Books
          </button>
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
