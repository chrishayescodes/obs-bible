import React from 'react';
import { getSimpleBookName } from '../../utils/bookNames';
import './Breadcrumb.css';

const Breadcrumb = ({ 
  selectedBook, 
  selectedChapter, 
  selectedVerse, 
  onBookSelect, 
  onChapterSelect, 
  onReset 
}) => {
  // Get simple book name for display
  // Handle both new format (with id) and old format (for tests)
  const bookId = selectedBook?.id;
  const simpleBookName = selectedBook ? 
    (bookId ? getSimpleBookName(bookId) : selectedBook.title) : null;

  const handleBookClick = () => {
    if (onBookSelect) {
      onBookSelect();
    }
  };

  const handleChapterClick = () => {
    if (onChapterSelect) {
      onChapterSelect();
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <nav className="breadcrumb" aria-label="Bible navigation breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <button 
            className="breadcrumb-button home-button"
            onClick={handleReset}
            title="Go to book selection"
          >
            📖 Books
          </button>
        </li>
        
        {selectedBook && (
          <>
            <li className="breadcrumb-separator" aria-hidden="true">›</li>
            <li className="breadcrumb-item">
              <button 
                className={`breadcrumb-button ${!selectedChapter ? 'current' : ''}`}
                onClick={selectedChapter ? handleBookClick : undefined}
                disabled={!selectedChapter}
                title={selectedChapter ? `Go to ${simpleBookName} chapters` : `Currently viewing ${simpleBookName} chapters`}
              >
                {simpleBookName}
              </button>
            </li>
          </>
        )}
        
        {selectedBook && selectedChapter && (
          <>
            <li className="breadcrumb-separator" aria-hidden="true">›</li>
            <li className="breadcrumb-item">
              <button 
                className={`breadcrumb-button ${!selectedVerse ? 'current' : ''}`}
                onClick={selectedVerse ? handleChapterClick : undefined}
                disabled={!selectedVerse}
                title={selectedVerse ? `Go to ${simpleBookName} ${selectedChapter} verses` : `Currently viewing ${simpleBookName} ${selectedChapter} verses`}
              >
                Chapter {selectedChapter}
              </button>
            </li>
          </>
        )}
        
      </ol>
    </nav>
  );
};

export default Breadcrumb;