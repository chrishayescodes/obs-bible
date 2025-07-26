import { useState, useEffect } from 'react'
import './App.css'
import Navigation from './navigation'

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
      <Navigation bibleData={bibleData} />
    </div>
  )
}

export default App
