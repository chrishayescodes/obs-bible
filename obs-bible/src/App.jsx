import { useState, useEffect } from 'react'
import './App.css'
import BibleBookSelector from './components/BibleBookSelector'

function App() {
  const [selectedBook, setSelectedBook] = useState(null)
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
    console.log('Selected book:', bookId, bookInfo)
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
      {selectedBook && (
        <div className="selected-book-info">
          <h2>{selectedBook.title}</h2>
          <p>{selectedBook.chapter_count} chapters • {selectedBook.total_verses} verses</p>
        </div>
      )}
      <BibleBookSelector bibleData={bibleData} onBookSelect={handleBookSelect} />
    </div>
  )
}

export default App
