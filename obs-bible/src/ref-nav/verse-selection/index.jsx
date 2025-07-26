import React, { useState, useEffect } from 'react';
import './VerseSelect.css';

const VerseSelect = ({ bookData, chapterNumber, onVerseSelect }) => {
  const [selectedVerse, setSelectedVerse] = useState(null);

  // Reset selection when chapter changes
  useEffect(() => {
    setSelectedVerse(null);
  }, [bookData, chapterNumber]);

  const handleVerseClick = (verseNumber) => {
    setSelectedVerse(verseNumber);
    if (onVerseSelect) {
      onVerseSelect(verseNumber);
    }
  };

  if (!bookData || !chapterNumber) {
    return <div className="loading">No chapter selected...</div>;
  }

  if (!bookData.chapters || !(chapterNumber in bookData.chapters)) {
    return <div className="loading">Loading verses...</div>;
  }

  const verseCount = bookData.chapters[chapterNumber];

  // Handle invalid verse count (but allow 0)
  if (typeof verseCount !== 'number' || verseCount < 0 || !Number.isInteger(verseCount)) {
    return <div className="loading">Loading verses...</div>;
  }

  const verses = Array.from({ length: verseCount }, (_, i) => i + 1);

  return (
    <>
      <h2>Verse</h2>
      <div className="verse-select">
        <div className="verses-grid">
          {verses.map((verseNumber) => (
            <button
              key={verseNumber}
              type="button"
              className={`verse-button ${selectedVerse === verseNumber ? 'selected' : ''}`}
              onClick={() => handleVerseClick(verseNumber)}
              title={`Verse ${verseNumber}`}
            >
              {verseNumber}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default VerseSelect;