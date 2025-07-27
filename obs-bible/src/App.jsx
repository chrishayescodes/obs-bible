import React, { useState, useEffect } from 'react'
import './App.css'
import AppNavigation from './nav/AppNavigation'

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
        <div className="loading">Loading Bible data...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <AppNavigation bibleData={bibleData} />
    </div>
  )
}

export default App
