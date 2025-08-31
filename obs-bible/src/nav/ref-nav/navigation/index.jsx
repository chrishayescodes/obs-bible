import React, { useState } from 'react'
import BibleBookSelector from '../book-selection'
import NumberSelector from '../shared/NumberSelector'
import Breadcrumb from '../../breadcrumb'
import { getSimpleBookName } from '../../../utils/bookNames'
import './Navigation.css'
import '../shared/NumberSelector.css'

const Navigation = ({ bibleData, onVerseSelected, initialBookData = null, initialChapter = null }) => {
  const [selectedBook, setSelectedBook] = useState(initialBookData)
  const [selectedChapter, setSelectedChapter] = useState(initialChapter)
  const [selectedVerse, setSelectedVerse] = useState(null)

  const handleBookSelect = (bookId, bookInfo) => {
    setSelectedBook({ id: bookId, ...bookInfo })
    setSelectedChapter(null) // Reset chapter selection when book changes
    setSelectedVerse(null) // Reset verse selection when book changes
  }

  const handleChapterSelect = (chapterNumber) => {
    setSelectedChapter(chapterNumber)
    setSelectedVerse(null) // Reset verse selection when chapter changes
  }

  const handleVerseSelect = (verseNumber) => {
    setSelectedVerse(verseNumber)
    
    // Call the callback with scripture reference
    if (onVerseSelected && selectedBook && selectedChapter) {
      // Use simple book name instead of formal title
      const simpleBookName = getSimpleBookName(selectedBook.id)
      const scriptureRef = {
        book: simpleBookName,
        bookId: selectedBook.id,
        chapter: selectedChapter,
        verse: verseNumber,
        reference: `${simpleBookName} ${selectedChapter}:${verseNumber}`
      }
      onVerseSelected(scriptureRef)
    }
  }

  const handleBreadcrumbReset = () => {
    setSelectedBook(null)
    setSelectedChapter(null)
    setSelectedVerse(null)
  }

  const handleBreadcrumbBookSelect = () => {
    setSelectedChapter(null)
    setSelectedVerse(null)
  }

  const handleBreadcrumbChapterSelect = () => {
    setSelectedVerse(null)
  }

  return (
    <div className="navigation">
      <Breadcrumb 
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        selectedVerse={selectedVerse}
        onReset={handleBreadcrumbReset}
        onBookSelect={handleBreadcrumbBookSelect}
        onChapterSelect={handleBreadcrumbChapterSelect}
      />
      
      {selectedBook && selectedChapter ? (
        <div className="verse-view">
          {(() => {
            // Verse selection logic
            if (!selectedBook.chapters || !(selectedChapter in selectedBook.chapters)) {
              return <div className="loading">Loading verses...</div>;
            }

            const verseCount = selectedBook.chapters[selectedChapter];
            if (typeof verseCount !== 'number' || verseCount < 0 || !Number.isInteger(verseCount)) {
              return <div className="loading">Loading verses...</div>;
            }

            const verses = Array.from({ length: verseCount }, (_, i) => i + 1);
            const getItemTitle = (verseNumber) => `Verse ${verseNumber}`;

            return (
              <NumberSelector
                items={verses}
                onItemSelect={handleVerseSelect}
                emptyMessage="No verses available..."
                className="number-select-container"
                itemClassName="number-select-button"
                gridClassName="number-select-grid"
                getItemTitle={getItemTitle}
                srOnlyTitle="Select Verse"
              />
            );
          })()}
        </div>
      ) : selectedBook ? (
        <div className="chapter-view">
          {(() => {
            // Chapter selection logic
            if (!selectedBook.chapters) {
              return <div className="loading">Loading chapters...</div>;
            }

            const chapters = Object.entries(selectedBook.chapters);
            const items = chapters.map(([chapterNumber, verseCount]) => ({
              key: chapterNumber,
              value: chapterNumber,
              verseCount
            }));
            const getItemTitle = (item) => `Chapter ${item.value} - ${item.verseCount} verses`;

            return (
              <NumberSelector
                items={items}
                onItemSelect={handleChapterSelect}
                emptyMessage="No chapters available..."
                className="number-select-container"
                itemClassName="number-select-button"
                gridClassName="number-select-grid"
                getItemTitle={getItemTitle}
                srOnlyTitle="Select Chapter"
              />
            );
          })()}
        </div>
      ) : (
        <BibleBookSelector bibleData={bibleData} onBookSelect={handleBookSelect} />
      )}
    </div>
  )
}

export default Navigation