import React, { useState, useEffect, useRef } from 'react';
import './VerseDisplay.css';

const VerseDisplay = ({ 
  verseData, 
  selectedVerse, 
  navigateToVerse,
  onVerseSelect,
  bookName = '',
  chapterNumber = ''
}) => {
  const [localSelectedVerse, setLocalSelectedVerse] = useState(selectedVerse);
  const [navigatedVerse, setNavigatedVerse] = useState(null);
  const verseRefs = useRef({});
  const containerRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  // Update local selection when prop changes
  useEffect(() => {
    setLocalSelectedVerse(selectedVerse);
  }, [selectedVerse]);

  // Scroll to selected verse when it changes (for selection)
  useEffect(() => {
    if (selectedVerse && verseRefs.current[selectedVerse]) {
      verseRefs.current[selectedVerse].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [selectedVerse]);

  // Navigate to verse with visual feedback without selection
  useEffect(() => {
    if (navigateToVerse && verseRefs.current[navigateToVerse]) {
      // Clear any existing highlight timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      // Set navigation highlight only if not the currently selected verse
      if (navigateToVerse !== selectedVerse) {
        setNavigatedVerse(navigateToVerse);
      }

      verseRefs.current[navigateToVerse].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Remove navigation highlight after a delay
      if (navigateToVerse !== selectedVerse) {
        highlightTimeoutRef.current = setTimeout(() => {
          setNavigatedVerse(null);
        }, 800); // 0.8 seconds highlight duration
      }
    }
  }, [navigateToVerse, selectedVerse]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleVerseClick = (osisId) => {
    setLocalSelectedVerse(osisId);
    if (onVerseSelect) {
      onVerseSelect(osisId);
    }
  };

  // Extract verse number from OSIS ID (e.g., "Gen.1.15" -> "15")
  const getVerseNumber = (osisId) => {
    const parts = osisId.split('.');
    return parts[parts.length - 1];
  };

  if (!verseData || Object.keys(verseData).length === 0) {
    return (
      <div className="verse-display">
        <div className="verse-display-empty">
          No verses to display
        </div>
      </div>
    );
  }

  const verseEntries = Object.entries(verseData);

  return (
    <div className="verse-display" ref={containerRef}>
      {bookName && chapterNumber && (
        <h2 className="verse-display-header">
          {bookName} {chapterNumber}
        </h2>
      )}
      <div className="verse-list">
        {verseEntries.map(([osisId, verseText]) => {
          const verseNumber = getVerseNumber(osisId);
          const isSelected = localSelectedVerse === osisId;
          const isNavigated = navigatedVerse === osisId && !isSelected;
          
          return (
            <button
              key={osisId}
              ref={el => verseRefs.current[osisId] = el}
              type="button"
              className={`verse-item ${isSelected ? 'selected' : ''} ${isNavigated ? 'navigated' : ''}`}
              onClick={() => handleVerseClick(osisId)}
              aria-label={`Verse ${verseNumber}: ${verseText}`}
              data-verse-id={osisId}
            >
              <span className="verse-number">{verseNumber}</span>
              <span className="verse-text">{verseText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VerseDisplay;