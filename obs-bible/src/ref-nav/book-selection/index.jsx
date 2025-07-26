import React, { useState } from 'react';
import './BibleBookSelector.css';

const BibleBookSelector = ({ bibleData, onBookSelect }) => {
  const [selectedBook, setSelectedBook] = useState(null);

  const handleBookClick = (bookId, bookInfo) => {
    setSelectedBook(bookId);
    if (onBookSelect) {
      onBookSelect(bookId, bookInfo);
    }
  };

  if (!bibleData) {
    return <div className="loading">Loading Bible books...</div>;
  }

  // Get books from testament sections
  const oldTestamentBooks = Object.entries(bibleData.old_testament.books);
  const newTestamentBooks = Object.entries(bibleData.new_testament.books);

  const getCategoryClass = (category) => {
    return category?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
  };

  const renderBookButton = ([bookId, bookInfo]) => (
    <button
      key={bookId}
      className={`book-button category-${getCategoryClass(bookInfo.category)} ${selectedBook === bookId ? 'selected' : ''}`}
      onClick={() => handleBookClick(bookId, bookInfo)}
      title={`${bookInfo.title} (${bookInfo.category}) - ${bookInfo.chapter_count} chapters, ${bookInfo.total_verses} verses`}
    >
      <span className="book-id">{bookId}</span>
    </button>
  );

  return (
    <div className="bible-book-selector">
      <div className="testament-section">
        <h2>Old Testament</h2>
        <div className="books-grid">
          {oldTestamentBooks.map(renderBookButton)}
        </div>
      </div>
      
      <div className="testament-section">
        <h2>New Testament</h2>
        <div className="books-grid">
          {newTestamentBooks.map(renderBookButton)}
        </div>
      </div>
    </div>
  );
};

export default BibleBookSelector;