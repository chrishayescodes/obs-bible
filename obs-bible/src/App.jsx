import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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

  // Main app component that shows navigation or loading
  const MainApp = () => (
    <div className="app">
      {loading ? (
        <div className="loading">Loading Bible data...</div>
      ) : (
        <AppNavigation bibleData={bibleData} />
      )}
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      {/* Default route - redirect to home */}
      <Route path="*" element={<MainApp />} />
    </Routes>
  )
}

export default App
