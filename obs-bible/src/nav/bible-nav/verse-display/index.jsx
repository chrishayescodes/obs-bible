import React, { useState, useEffect, useRef } from 'react';
import { stageUtils } from '../../../utils/stageUtils';
import { getSimpleBookName } from '../../../utils/bookNames';
import './VerseDisplay.css';

const VerseDisplay = ({ 
  verseData, 
  selectedVerse, 
  navigateToVerse,
  onVerseSelect,
  bookName = '',
  chapterNumber = '',
  bookData = null,
  onPreviousChapter = null,
  onNextChapter = null,
  getAdjacentChapterInfo = null,
  loadingVerses = false
}) => {
  const [localSelectedVerse, setLocalSelectedVerse] = useState(selectedVerse);
  const [navigatedVerse, setNavigatedVerse] = useState(null);
  const [hasBeenNavigatedTo, setHasBeenNavigatedTo] = useState(new Set());
  const [stagedVerses, setStagedVerses] = useState(new Set());
  const verseRefs = useRef({});
  const containerRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  // Update local selection when prop changes
  useEffect(() => {
    setLocalSelectedVerse(selectedVerse);
    
    // Clear navigation animation when a verse is selected via props
    if (selectedVerse) {
      setNavigatedVerse(null);
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    }
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

      // Add to "has been navigated to" set for persistent subtle reminder
      setHasBeenNavigatedTo(prev => new Set([...prev, navigateToVerse]));

      // Always set navigation highlight when navigating (regardless of selection state)
      setNavigatedVerse(navigateToVerse);

      verseRefs.current[navigateToVerse].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Remove navigation highlight after a delay
      highlightTimeoutRef.current = setTimeout(() => {
        setNavigatedVerse(null);
      }, 800); // 0.8 seconds highlight duration
    }
  }, [navigateToVerse]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Load and track staged verses
  useEffect(() => {
    const updateStagedVerses = () => {
      if (verseData) {
        const currentStaged = stageUtils.getStagedVerses();
        const currentDisplayStaged = new Set(
          currentStaged
            .filter(item => Object.keys(verseData).some(osisId => osisId === item.osisId))
            .map(item => item.osisId)
        );
        setStagedVerses(currentDisplayStaged);
      }
    };

    updateStagedVerses();

    // Listen for staging updates
    const handleStagingUpdate = () => {
      updateStagedVerses();
    };

    window.addEventListener('stagedVersesUpdated', handleStagingUpdate);

    return () => {
      window.removeEventListener('stagedVersesUpdated', handleStagingUpdate);
    };
  }, [verseData]);

  const handleVerseClick = (osisId) => {
    setLocalSelectedVerse(osisId);
    
    // Clear navigation highlight animation from ALL verses when any verse is selected
    setNavigatedVerse(null);
    // Clear any existing highlight timeout
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    
    if (onVerseSelect) {
      onVerseSelect(osisId);
    }
  };

  const handleStageClick = (osisId, event) => {
    event.stopPropagation(); // Prevent verse selection

    // Parse the OSIS ID to create a scripture reference
    const [bookId, chapter, verse] = osisId.split('.');
    
    // Use simple book name instead of formal title
    const bookTitle = getSimpleBookName(bookId);
    
    const scriptureRef = {
      book: bookTitle,
      bookId: bookId,
      chapter: chapter,
      verse: verse, // Keep exact verse (could be "9a", "9b", etc.)
      reference: `${bookTitle} ${chapter}:${verse}`
    };

    const success = stageUtils.addToStage(scriptureRef);
    if (!success) {
      // Verse was already staged, could show a message here if desired
      console.log('Verse already staged:', scriptureRef.reference);
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
  
  // Get chapter navigation info
  const chapterInfo = getAdjacentChapterInfo ? getAdjacentChapterInfo(bookData) : { hasPrevious: false, hasNext: false };

  // Group verses by chapter for display headers
  const versesByChapter = {};
  verseEntries.forEach(([osisId, verseText]) => {
    const parts = osisId.split('.');
    const chapterNum = parts[1];
    if (!versesByChapter[chapterNum]) {
      versesByChapter[chapterNum] = [];
    }
    versesByChapter[chapterNum].push([osisId, verseText]);
  });

  const sortedChapters = Object.keys(versesByChapter).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="verse-display" ref={containerRef}>
      {/* Previous Chapter Button at Top */}
      {chapterInfo.hasPrevious && onPreviousChapter && (
        <div className="chapter-navigation-top">
          <button
            type="button"
            className="chapter-nav-button previous"
            onClick={() => onPreviousChapter(bookData)}
            disabled={loadingVerses}
          >
            ↑ Load Previous Chapter
          </button>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="verse-content">
        {/* Chapter Headers and Verses */}
        {sortedChapters.map(chapterNum => (
          <div key={chapterNum} className="chapter-section">
            <h2 className="verse-display-header">
              {bookName} {chapterNum}
            </h2>
            <div className="verse-list">
            {versesByChapter[chapterNum].map(([osisId, verseText]) => {
              const verseNumber = getVerseNumber(osisId);
              const isSelected = localSelectedVerse === osisId;
              const isNavigated = navigatedVerse === osisId && !isSelected;
              const hasBeenNavigated = hasBeenNavigatedTo.has(osisId);
              
              const classNames = [
                'verse-item',
                isSelected && 'selected',
                isNavigated && 'navigated',
                hasBeenNavigated && 'has-been-navigated'
              ].filter(Boolean).join(' ');
              
              return (
                <div key={osisId} className="verse-container">
                  <button
                    ref={el => verseRefs.current[osisId] = el}
                    type="button"
                    className={classNames}
                    onClick={() => handleVerseClick(osisId)}
                    aria-label={`Verse ${verseNumber}: ${verseText}`}
                    data-verse-id={osisId}
                  >
                    <span className="verse-number">{verseNumber}</span>
                    <span className="verse-text">{verseText}</span>
                  </button>
                  <button
                    type="button"
                    className={`stage-button ${stagedVerses.has(osisId) ? 'staged' : ''}`}
                    onClick={(event) => handleStageClick(osisId, event)}
                    title={`${stagedVerses.has(osisId) ? 'Already staged' : 'Add verse to stage'}`}
                    disabled={stagedVerses.has(osisId)}
                    aria-label={`${stagedVerses.has(osisId) ? 'Already staged' : 'Add to stage'}: ${verseNumber}`}
                  >
                    📋
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>

      {/* Next Chapter Button at Bottom */}
      {chapterInfo.hasNext && onNextChapter && (
        <div className="chapter-navigation-bottom">
          <button
            type="button"
            className="chapter-nav-button next"
            onClick={() => onNextChapter(bookData)}
            disabled={loadingVerses}
          >
            ↓ Load Next Chapter
          </button>
        </div>
      )}
    </div>
  );
};

export default VerseDisplay;