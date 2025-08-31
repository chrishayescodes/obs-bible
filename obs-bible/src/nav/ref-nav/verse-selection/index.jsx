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

  const getColorClass = (number) => {
    const num = parseInt(number);
    if (num <= 25) return 'color-1-25';
    if (num <= 50) return 'color-26-50';
    if (num <= 75) return 'color-51-75';
    if (num <= 100) return 'color-76-100';
    if (num <= 125) return 'color-101-125';
    if (num <= 150) return 'color-126-150';
    return 'color-151-176';
  };

  return (
    <div className="verse-select">
      <h2 className="sr-only">Select Verse</h2>
      <div className="verses-grid">
        {verses.map((verseNumber) => (
          <button
            key={verseNumber}
            type="button"
            className={`verse-button ${getColorClass(verseNumber)} ${selectedVerse === verseNumber ? 'selected' : ''}`}
            onClick={() => handleVerseClick(verseNumber)}
            title={`Verse ${verseNumber}`}
          >
            {verseNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VerseSelect;