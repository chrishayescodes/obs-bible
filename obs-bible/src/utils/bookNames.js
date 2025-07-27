// Simple book name mapping for display purposes
// Maps book IDs to commonly used short names instead of formal long titles

// Complete fallback mapping - this ensures tests work even if JSON fails to load
const FALLBACK_BOOK_NAMES = {
  'Gen': 'Genesis', 'Exod': 'Exodus', 'Lev': 'Leviticus', 'Num': 'Numbers', 'Deut': 'Deuteronomy',
  'Josh': 'Joshua', 'Judg': 'Judges', 'Ruth': 'Ruth', '1Sam': '1 Samuel', '2Sam': '2 Samuel',
  '1Kgs': '1 Kings', '2Kgs': '2 Kings', '1Chr': '1 Chronicles', '2Chr': '2 Chronicles', 'Ezra': 'Ezra',
  'Neh': 'Nehemiah', 'Esth': 'Esther', 'Job': 'Job', 'Ps': 'Psalms', 'Prov': 'Proverbs',
  'Eccl': 'Ecclesiastes', 'Song': 'Song of Songs', 'Isa': 'Isaiah', 'Jer': 'Jeremiah', 'Lam': 'Lamentations',
  'Ezek': 'Ezekiel', 'Dan': 'Daniel', 'Hos': 'Hosea', 'Joel': 'Joel', 'Amos': 'Amos',
  'Obad': 'Obadiah', 'Jonah': 'Jonah', 'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk',
  'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah', 'Mal': 'Malachi', 'Matt': 'Matthew',
  'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John', 'Acts': 'Acts', 'Rom': 'Romans',
  '1Cor': '1 Corinthians', '2Cor': '2 Corinthians', 'Gal': 'Galatians', 'Eph': 'Ephesians',
  'Phil': 'Philippians', 'Col': 'Colossians', '1Thess': '1 Thessalonians', '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy', '2Tim': '2 Timothy', 'Titus': 'Titus', 'Phlm': 'Philemon', 'Heb': 'Hebrews',
  'Jas': 'James', '1Pet': '1 Peter', '2Pet': '2 Peter', '1John': '1 John', '2John': '2 John',
  '3John': '3 John', 'Jude': 'Jude', 'Rev': 'Revelation'
};

// Cache for the book names data
let bookNamesCache = null;

/**
 * Get simple book name from book ID (synchronous with fallback)
 * @param {string} bookId - The book ID (e.g., 'Gen', 'Matt')
 * @returns {string} Simple book name (e.g., 'Genesis', 'Matthew')
 */
export const getSimpleBookName = (bookId) => {
  // Use cached data if available, otherwise use fallback
  const bookNames = bookNamesCache || FALLBACK_BOOK_NAMES;
  return bookNames[bookId] || bookId; // Fallback to bookId if not found
};

/**
 * Load book names from JSON file (optional enhancement)
 * This is called to populate the cache but getSimpleBookName works without it
 */
export const loadBookNames = async () => {
  if (bookNamesCache) {
    return;
  }
  
  try {
    const response = await fetch('/data/book_names.json');
    if (!response.ok) {
      console.warn(`Could not load book names JSON: ${response.status}, using fallback`);
      return;
    }
    bookNamesCache = await response.json();
  } catch (error) {
    console.warn('Could not load book names JSON, using fallback:', error.message);
  }
};

/**
 * Helper function to create a reference with simple book name
 * @param {string} bookId - The book ID (e.g., 'Gen', 'Matt') 
 * @param {string|number} chapter - Chapter number
 * @param {string|number} verse - Verse number
 * @returns {string} Formatted reference (e.g., 'Genesis 1:1')
 */
export const createSimpleReference = (bookId, chapter, verse) => {
  const bookName = getSimpleBookName(bookId);
  return `${bookName} ${chapter}:${verse}`;
};