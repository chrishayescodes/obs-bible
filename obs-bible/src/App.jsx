import { useState, useEffect } from 'react'
import './App.css'
import BibleBookSelector from './book-selection'
import ChapterSelector from './chapter-selection'

function App() {
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
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
    console.log('Selected book:', bookId, bookInfo)
  }

  const handleChapterSelect = (chapterNumber) => {
    setSelectedChapter(chapterNumber)
    console.log('Selected chapter:', chapterNumber)
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
      
      {selectedBook && selectedChapter && (
        <div className="selected-info">
          <h2>{selectedBook.title} - Chapter {selectedChapter}</h2>
          <p>{selectedBook.chapters[selectedChapter]} verses</p>
        </div>
      )}
      
      {selectedBook ? (
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
