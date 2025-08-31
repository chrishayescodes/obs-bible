import React, { useState, useEffect } from 'react';
import './ChapterSelector.css';

const ChapterSelector = ({ bookData, onChapterSelect }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Reset selection when book data changes
  useEffect(() => {
    setSelectedChapter(null);
  }, [bookData]);

  const handleChapterClick = (chapterNumber) => {
    setSelectedChapter(chapterNumber);
    if (onChapterSelect) {
      onChapterSelect(chapterNumber);
    }
  };

  if (!bookData) {
    return <div className="loading">No book selected...</div>;
  }

  if (!bookData.chapters) {
    return <div className="loading">Loading chapters...</div>;
  }

  const chapters = Object.entries(bookData.chapters);

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
    <div className="chapter-selector">
      <h2 className="sr-only">Select Chapter</h2>
      <div className="chapters-grid">
        {chapters.map(([chapterNumber, verseCount]) => (
          <button
            key={chapterNumber}
            type="button"
            className={`chapter-button ${getColorClass(chapterNumber)} ${selectedChapter === chapterNumber ? 'selected' : ''}`}
            onClick={() => handleChapterClick(chapterNumber)}
            title={`Chapter ${chapterNumber} - ${verseCount} verses`}
          >
            {chapterNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChapterSelector;