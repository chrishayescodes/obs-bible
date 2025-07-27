import React, { useState, useEffect } from 'react'
import './App.css'
import Navigation from './ref-nav/navigation'
import VerseDisplay from './bible-nav/verse-display'
import { verseHistoryUtils } from './utils/verseHistory'

function App() {
  const [bibleData, setBibleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedScripture, setSelectedScripture] = useState(null)
  const [verseData, setVerseData] = useState(null)
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [navigatedVerse, setNavigatedVerse] = useState(null)
  const [selectedVerse, setSelectedVerse] = useState(null)

  useEffect(() => {
    // Load the Bible structure data
    fetch('/data/kjv_structure.json')
      .then(response => response.json())
      .then(data => {
        setBibleData(data)
        setLoading(false)
        
        // Restore current verse from localStorage if it exists
        const savedVerse = verseHistoryUtils.getCurrentVerse()
        if (savedVerse && savedVerse.bookId && savedVerse.chapter && savedVerse.verse) {
          // Only restore if we have complete verse data
          handleVerseSelected(savedVerse)
        }
      })
      .catch(error => {
        console.error('Error loading Bible data:', error)
        setLoading(false)
      })
  }, [])

  const handleVerseSelected = async (scriptureRef) => {
    console.log('Verse navigated to:', scriptureRef)
    
    // Add to history and save as current verse
    verseHistoryUtils.addToHistory(scriptureRef)
    verseHistoryUtils.setCurrentVerse(scriptureRef)
    
    // Create the navigated verse OSIS ID from the scripture reference
    const navigatedVerseId = `${scriptureRef.bookId}.${scriptureRef.chapter}.${scriptureRef.verse}`
    
    const updatedScriptureRef = {
      ...scriptureRef,
      navigatedVerse: navigatedVerseId
    }
    
    setSelectedScripture(updatedScriptureRef)
    setNavigatedVerse(navigatedVerseId)
    setLoadingVerses(true)
    
    try {
      // Construct the JSON file path from scripture reference
      const { bookId, chapter } = scriptureRef
      const jsonPath = `/data/output_chapters_json/${bookId}/${bookId}_${chapter}.json`
      
      const response = await fetch(jsonPath)
      if (!response.ok) {
        throw new Error(`Failed to load verses: ${response.status}`)
      }
      
      const verses = await response.json()
      setVerseData(verses)
    } catch (error) {
      console.error('Error loading verse data:', error)
      setVerseData(null)
    } finally {
      setLoadingVerses(false)
    }
  }

  const handleVerseDisplaySelect = (osisId) => {
    // Update the selected verse for highlighting when clicking in verse display
    setSelectedVerse(osisId)
  }

  const handleBackToBooks = () => {
    // Clear current verse from localStorage and all selections
    verseHistoryUtils.clearCurrentVerse()
    
    // Clear all selections and return to navigation
    setSelectedScripture(null)
    setVerseData(null)
    setLoadingVerses(false)
    setNavigatedVerse(null)
    setSelectedVerse(null)
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
      {selectedScripture ? (
        // Show verse display with back button
        <div className="verse-view">
          <div className="verse-header">
            <button 
              className="back-button" 
              onClick={handleBackToBooks}
              type="button"
            >
              ← Back to Books
            </button>
          </div>
          
          {loadingVerses ? (
            <div className="verse-loading">
              <div className="loading">Loading verses...</div>
            </div>
          ) : verseData ? (
            <VerseDisplay
              verseData={verseData}
              selectedVerse={selectedVerse}
              navigateToVerse={navigatedVerse}
              onVerseSelect={handleVerseDisplaySelect}
              bookName={selectedScripture.book}
              chapterNumber={selectedScripture.chapter}
            />
          ) : (
            <div className="verse-error">
              <div className="loading">Failed to load verses</div>
            </div>
          )}
        </div>
      ) : (
        // Show navigation
        <div className="navigation-view">
          <Navigation bibleData={bibleData} onVerseSelected={handleVerseSelected} />
        </div>
      )}
    </div>
  )
}

export default App
