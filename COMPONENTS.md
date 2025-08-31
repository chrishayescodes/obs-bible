# Component API Reference

Quick reference for all major components in the OSB Bible Application. For complete architecture details, see [CLAUDE.md](./CLAUDE.md).

## Navigation Components

### AppNavigation Component
**Location**: `src/nav/AppNavigation.jsx`
**Purpose**: Navigation orchestration using custom hook with tabbed interface

```javascript
<AppNavigation bibleData={bibleData} />
```

**Props**:
- `bibleData`: Complete Bible structure object passed from App

**Features**: Renders TabbedNavigation component, manages tab state, restores current verse automatically

### Navigation Component  
**Location**: `src/nav/ref-nav/navigation/`
**Purpose**: Centralized navigation system managing all Bible browsing functionality

```javascript
<Navigation 
  bibleData={bibleData} 
  onVerseSelected={handleVerseSelected} 
/>
```

**Props**:
- `bibleData`: Complete Bible structure object
- `onVerseSelected`: Optional callback function triggered when verse is selected

**Callback Format**:
```javascript
{
  book: 'Genesis',           // Full book title
  bookId: 'Gen',            // Book abbreviation/ID  
  chapter: '1',             // Chapter number (string)
  verse: 15,                // Verse number (number)
  reference: 'Genesis 1:15' // Formatted reference string
}
```

### TabbedNavigation Component
**Location**: `src/nav/ref-nav/tabbed-nav/`
**Purpose**: Four-tab interface organizing reference navigation, history, staged verses, and custom messages

```javascript
<TabbedNavigation
  bibleData={bibleData}
  onVerseSelected={navigation.handleVerseSelected}
  selectedScripture={navigation.selectedScripture}
  verseData={navigation.verseData}
  loadingVerses={navigation.loadingVerses}
  navigatedVerse={navigation.navigatedVerse}
  selectedVerse={navigation.selectedVerse}
  handleVerseDisplaySelect={navigation.handleVerseDisplaySelect}
  handleBackToBooks={navigation.handleBackToBooks}
  selectedBookData={navigation.selectedBookData}
  handlePreviousChapter={navigation.handlePreviousChapter}
  handleNextChapter={navigation.handleNextChapter}
  getAdjacentChapterInfo={navigation.getAdjacentChapterInfo}
/>
```

**Tab Structure**:
- **Reference tab (🔍)**: Bible browsing OR verse content display
- **History tab (🕐)**: SearchHistory component for verse history  
- **Stage tab (📋)**: StageList component for staged verses
- **Messages tab (💬)**: MessagesTab component for custom messages

## Selection Components

### BibleBookSelector Component
**Location**: `src/nav/ref-nav/book-selection/`

```javascript
<BibleBookSelector 
  bibleData={bibleData} 
  onBookSelect={handleBookSelect} 
/>
```

**Props**:
- `bibleData`: Complete Bible structure object
- `onBookSelect`: Callback function for book selection

**Features**: Color-coded categories, responsive grid, accessibility support

### ChapterSelector Component  
**Location**: `src/nav/ref-nav/chapter-selection/`

```javascript
<ChapterSelector 
  bookData={selectedBook} 
  onChapterSelect={handleChapterSelect} 
/>
```

**Props**:
- `bookData`: Selected book object with chapter information
- `onChapterSelect`: Callback function for chapter selection

### VerseSelect Component
**Location**: `src/nav/ref-nav/verse-selection/`

```javascript
<VerseSelect 
  bookData={selectedBook} 
  chapterNumber="1" 
  onVerseSelect={handleVerseSelect} 
/>
```

**Props**:
- `bookData`: Selected book object with chapter information  
- `chapterNumber`: Selected chapter number as string
- `onVerseSelect`: Callback function for verse selection

## Navigation Utilities

### Breadcrumb Component
**Location**: `src/nav/ref-nav/breadcrumb/`

```javascript
<Breadcrumb
  selectedBook={selectedBook}
  selectedChapter={selectedChapter}
  selectedVerse={selectedVerse}
  onReset={handleReset}
  onBookSelect={handleBookSelect}
  onChapterSelect={handleChapterSelect}
/>
```

**Props**:
- `selectedBook`: Currently selected book object
- `selectedChapter`: Currently selected chapter number (string)
- `selectedVerse`: Currently selected verse number (string)
- `onReset`: Callback to reset all selections (return to books)
- `onBookSelect`: Callback to navigate to book's chapters
- `onChapterSelect`: Callback to navigate to chapter's verses

**Navigation Logic**: Books → Book → Chapter (stops at chapter level)

## Content Display Components

### VerseDisplay Component
**Location**: `src/nav/bible-nav/verse-display/`

```javascript
<VerseDisplay
  verseData={verseData}
  selectedVerse={selectedVerse}
  navigateToVerse={navigatedVerse}
  onVerseSelect={handleVerseSelect}
  bookName="Genesis"
  chapterNumber="1"
  bookData={bookData}
  onPreviousChapter={handlePreviousChapter}
  onNextChapter={handleNextChapter}
  getAdjacentChapterInfo={getAdjacentChapterInfo}
  loadingVerses={loadingVerses}
/>
```

**Props**:
- `verseData`: JSON object with OSIS IDs as keys and verse text as values
- `selectedVerse`: OSIS ID of currently selected verse (blue highlight)
- `navigateToVerse`: OSIS ID for navigation highlighting (orange highlight)
- `onVerseSelect`: Callback function that receives OSIS ID when verse is clicked
- `bookName`: Optional book name for display header
- `chapterNumber`: Optional initial chapter number for display header
- `bookData`: Book metadata for chapter navigation
- `onPreviousChapter`: Callback function to load previous chapter
- `onNextChapter`: Callback function to load next chapter
- `getAdjacentChapterInfo`: Function to determine button visibility
- `loadingVerses`: Boolean indicating if chapters are currently loading

**Features**: Multi-chapter display, chapter navigation, triple highlighting system

### SelectedVerseDisplay Component
**Location**: `src/display/`
**Route**: `/display`

```javascript
<SelectedVerseDisplay />
```

**Props**: Self-contained component (no required props)

**Features**: 
- Loads current verse from localStorage automatically
- Works independently of main navigation
- Perfect for OBS overlay or bookmarking
- Handles split verses and error states

## History Components

### SearchHistory Component
**Location**: `src/nav/ref-nav/search-history/`

```javascript
<SearchHistory 
  onVerseSelect={handleVerseSelect}
  onClearHistory={handleClearHistory}
/>
```

**Props**:
- `onVerseSelect`: Optional callback for verse navigation
- `onClearHistory`: Optional callback for clear all button

**Features**: History display, timestamp formatting, split verse support, responsive design

### VerseList Component  
**Location**: `src/nav/ref-nav/verse-list/`
**Purpose**: Reusable component for displaying lists of Bible verses

```javascript
const dataSource = {
  getItems: () => verseHistoryUtils.getHistory(),
  clearAll: () => verseHistoryUtils.clearHistory(),
  removeItem: (osisId) => verseHistoryUtils.removeFromHistory(osisId)
}

<VerseList
  dataSource={dataSource}
  eventName="verseHistoryUpdated"
  title="Search History"
  emptyMessage="No verses in history yet"
  emptyHint="Navigate to verses to build your history"
  loadingMessage="Loading history..."
  cssPrefix="search-history"
  showCount={true}
  formatTimestamp={customFormatter}
  ariaLabel="Verse search history"
  onVerseSelect={handleVerseSelect}
  onClearAll={handleClearAll}
/>
```

**Props**:
- `dataSource`: Object with `getItems()`, `clearAll()`, and `removeItem(osisId)` methods
- `eventName`: Window event name to listen for updates
- `title`: Display title for the component header
- `emptyMessage`: Message shown when no items exist
- `emptyHint`: Hint text shown below empty message
- `loadingMessage`: Message shown during loading state
- `cssPrefix`: CSS class prefix for styling
- `showCount`: Boolean to show/hide item count in title
- `formatTimestamp`: Optional custom timestamp formatting function
- `ariaLabel`: Custom ARIA label for main container
- `onVerseSelect`: Callback for verse navigation
- `onClearAll`: Callback for clear all button functionality

## Messages Components

### MessagesTab Component
**Location**: `src/messages/components/MessagesTab/`

```javascript
<MessagesTab />
```

**Props**: Self-contained component

**Features**: Two-tab interface (Create/Library), complete message management integration

### MessageEditor Component
**Location**: `src/messages/components/MessageEditor/`

```javascript
<MessageEditor />
```

**Props**: Self-contained component

**Features**: Form management, markdown support, CRUD operations, validation

### MessageLibrary Component
**Location**: `src/messages/components/MessageLibrary/`

```javascript
<MessageLibrary />
```

**Props**: Self-contained component

**Features**: Message display, search/filter, modal editing, display button integration

## Custom Hooks

### useVerseNavigation Hook
**Location**: `src/nav/useVerseNavigation.js`

```javascript
const navigation = useVerseNavigation(bibleData)
```

**Parameters**:
- `bibleData`: Complete Bible structure object

**Returns**:
```javascript
{
  selectedScripture,        // Current scripture reference object
  verseData,               // JSON object with verse content
  loadingVerses,           // Boolean loading state
  navigatedVerse,          // OSIS ID for navigation highlighting
  selectedVerse,           // OSIS ID for selection highlighting
  selectedBookData,        // Book metadata for chapter navigation
  handleVerseSelected,     // Navigation callback (visual feedback only)
  handleVerseDisplaySelect, // Selection callback (history + broadcast)
  handleBackToBooks,       // Reset navigation callback
  handlePreviousChapter,   // Load previous chapter callback
  handleNextChapter,       // Load next chapter callback
  getAdjacentChapterInfo   // Chapter navigation info function
}
```

## Utility Functions

### Book Names Utility
**Location**: `src/utils/bookNames.js`

```javascript
import { getSimpleBookName, getBookId } from '../utils/bookNames'

const simpleName = getSimpleBookName('THE FIRST BOOK OF MOSES CALLED GENESIS')
// Returns: 'Genesis'

const bookId = getBookId('Genesis')  
// Returns: 'Gen'
```

### Verse History Utility
**Location**: `src/utils/verseHistory.js`

```javascript
import { verseHistoryUtils } from '../utils/verseHistory'

// Add verse to history
verseHistoryUtils.addToHistory(scriptureRef)

// Get current verse
const current = verseHistoryUtils.getCurrentVerse()

// Clear history
verseHistoryUtils.clearHistory()
```

### Cross-Tab Communication Utility
**Location**: `src/utils/broadcastChannel.js`

```javascript
import { verseSyncUtils } from '../utils/broadcastChannel'

// Broadcast verse selection
verseSyncUtils.broadcastVerseSelection(scriptureRef)

// Subscribe to messages
const unsubscribe = verseSyncUtils.subscribe(callback)
```

## Common Usage Patterns

### Basic Navigation Setup
```javascript
const MyApp = () => {
  const [bibleData, setBibleData] = useState(null)
  const navigation = useVerseNavigation(bibleData)

  return (
    <TabbedNavigation
      bibleData={bibleData}
      {...navigation}
    />
  )
}
```

### Custom Verse Selection Handler
```javascript
const handleVerseSelect = (scriptureRef) => {
  console.log(`Selected: ${scriptureRef.reference}`)
  // Custom logic here
}

<Navigation 
  bibleData={bibleData}
  onVerseSelected={handleVerseSelect}
/>
```

### History Integration
```javascript
<SearchHistory 
  onVerseSelect={navigation.handleVerseSelected}
  onClearHistory={() => console.log('History cleared')}
/>
```

For complete architecture details, implementation examples, and testing information, see [CLAUDE.md](./CLAUDE.md).