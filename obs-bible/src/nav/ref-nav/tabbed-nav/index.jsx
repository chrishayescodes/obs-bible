import React, { useState } from 'react'
import Navigation from '../navigation'
import SearchHistory from '../search-history'
import StageList from '../stage-list'
import VerseDisplay from '../../bible-nav/verse-display'
import './TabbedNavigation.css'

const TabbedNavigation = ({ 
  bibleData, 
  onVerseSelected,
  selectedScripture,
  verseData,
  loadingVerses,
  navigatedVerse,
  selectedVerse,
  handleVerseDisplaySelect,
  handleBackToBooks,
  selectedBookData,
  handlePreviousChapter,
  handleNextChapter,
  getAdjacentChapterInfo
}) => {
  const [activeTab, setActiveTab] = useState('reference')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleHistoryVerseSelect = (scriptureRef) => {
    // When history item is selected, switch to reference tab and navigate to verse
    setActiveTab('reference')
    if (onVerseSelected) {
      onVerseSelected(scriptureRef)
    }
  }

  const handleStageVerseSelect = (scriptureRef) => {
    // When stage item is selected, switch to reference tab and navigate to verse
    setActiveTab('reference')
    if (onVerseSelected) {
      onVerseSelected(scriptureRef)
    }
  }

  return (
    <div className="tabbed-navigation">
      <div className="tabbed-navigation__tabs" role="tablist" aria-label="Navigation tabs">
        <button
          type="button"
          className={`tabbed-navigation__tab ${activeTab === 'reference' ? 'tabbed-navigation__tab--active' : ''}`}
          onClick={() => handleTabChange('reference')}
          role="tab"
          aria-selected={activeTab === 'reference'}
          aria-controls="reference-panel"
          id="reference-tab"
          title="Reference Search"
        >
          <span className="tabbed-navigation__tab-icon" aria-hidden="true">🔍</span>
          <span className="tabbed-navigation__tab-label">Reference</span>
        </button>
        <button
          type="button"
          className={`tabbed-navigation__tab ${activeTab === 'history' ? 'tabbed-navigation__tab--active' : ''}`}
          onClick={() => handleTabChange('history')}
          role="tab"
          aria-selected={activeTab === 'history'}
          aria-controls="history-panel"
          id="history-tab"
          title="Search History"
        >
          <span className="tabbed-navigation__tab-icon" aria-hidden="true">🕐</span>
          <span className="tabbed-navigation__tab-label">History</span>
        </button>
        <button
          type="button"
          className={`tabbed-navigation__tab ${activeTab === 'stage' ? 'tabbed-navigation__tab--active' : ''}`}
          onClick={() => handleTabChange('stage')}
          role="tab"
          aria-selected={activeTab === 'stage'}
          aria-controls="stage-panel"
          id="stage-tab"
          title="Staged Verses"
        >
          <span className="tabbed-navigation__tab-icon" aria-hidden="true">📋</span>
          <span className="tabbed-navigation__tab-label">Stage</span>
        </button>
      </div>

      <div className="tabbed-navigation__content">
        <div
          className={`tabbed-navigation__panel ${activeTab === 'reference' ? 'tabbed-navigation__panel--active' : ''}`}
          role="tabpanel"
          aria-labelledby="reference-tab"
          id="reference-panel"
          hidden={activeTab !== 'reference'}
        >
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
                  bookData={selectedBookData}
                  onPreviousChapter={handlePreviousChapter}
                  onNextChapter={handleNextChapter}
                  getAdjacentChapterInfo={getAdjacentChapterInfo}
                  loadingVerses={loadingVerses}
                />
              ) : (
                <div className="verse-error">
                  <div className="loading">Failed to load verses</div>
                </div>
              )}
            </div>
          ) : (
            // Show reference navigation
            <Navigation 
              bibleData={bibleData} 
              onVerseSelected={onVerseSelected}
            />
          )}
        </div>
        <div
          className={`tabbed-navigation__panel ${activeTab === 'history' ? 'tabbed-navigation__panel--active' : ''}`}
          role="tabpanel"
          aria-labelledby="history-tab"
          id="history-panel"
          hidden={activeTab !== 'history'}
        >
          <SearchHistory onVerseSelect={handleHistoryVerseSelect} />
        </div>
        <div
          className={`tabbed-navigation__panel ${activeTab === 'stage' ? 'tabbed-navigation__panel--active' : ''}`}
          role="tabpanel"
          aria-labelledby="stage-tab"
          id="stage-panel"
          hidden={activeTab !== 'stage'}
        >
          <StageList onVerseSelect={handleStageVerseSelect} />
        </div>
      </div>
    </div>
  )
}

export default TabbedNavigation