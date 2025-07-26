import { useState, useEffect } from 'react'
import './App.css'
import Navigation from './ref-nav/navigation'

function App() {
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

  const handleVerseSelected = (scriptureRef) => {
    console.log('Verse selected:', scriptureRef)
    // You can add additional logic here, such as:
    // - Navigate to verse content
    // - Update URL with scripture reference
    // - Load verse text content
    // - Update browser history
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading Bible data...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navigation bibleData={bibleData} onVerseSelected={handleVerseSelected} />
    </div>
  )
}

export default App
