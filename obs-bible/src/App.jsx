import { useState, useEffect } from 'react'
import './App.css'
import Navigation from './ref-nav/navigation'
import VerseDisplay from './bible-nav/verse-display'

function App() {
  const [bibleData, setBibleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedScripture, setSelectedScripture] = useState(null)
  const [verseData, setVerseData] = useState(null)
  const [loadingVerses, setLoadingVerses] = useState(false)

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

  const handleVerseSelected = async (scriptureRef) => {
    console.log('Verse selected:', scriptureRef)
    
    // Create the selectedVerse OSIS ID from the scripture reference
    const selectedVerseId = `${scriptureRef.bookId}.${scriptureRef.chapter}.${scriptureRef.verse}`
    
    const updatedScriptureRef = {
      ...scriptureRef,
      selectedVerse: selectedVerseId
    }
    
    setSelectedScripture(updatedScriptureRef)
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
    // Update the selected verse for highlighting
    setSelectedScripture(prev => ({
      ...prev,
      selectedVerse: osisId
    }))
  }

  const handleBackToBooks = () => {
    // Clear all selections and return to navigation
    setSelectedScripture(null)
    setVerseData(null)
    setLoadingVerses(false)
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
              selectedVerse={selectedScripture.selectedVerse}
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
