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

  return (
    <div className="chapter-selector">
      <div className="chapter-header">
        <h3>{bookData.title}</h3>
        <p className="chapter-count">{bookData.chapter_count} chapters</p>
      </div>
      
      <div className="chapters-grid">
        {chapters.map(([chapterNumber, verseCount]) => (
          <button
            key={chapterNumber}
            type="button"
            className={`chapter-button ${selectedChapter === chapterNumber ? 'selected' : ''}`}
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