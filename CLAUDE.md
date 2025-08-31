# OSB Bible Application - Claude Development Guide

> **📚 Focused Documentation Available**
> 
> For day-to-day development, use these focused guides:
> - **[COMPONENTS.md](./COMPONENTS.md)** - Component API reference and usage examples
> - **[TESTING.md](./TESTING.md)** - Testing workflow and best practices  
> - **[MESSAGES.md](./MESSAGES.md)** - Messages Module development guide
> - **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Setup, commands, and daily workflow
>
> This file contains the complete architecture reference.

## Project Overview

The OSB (Open Source Bible) Bible project is a React-based web application for browsing and interacting with Bible content. The application is built using modern web technologies with a focus on responsive design, comprehensive testing, and component-driven development.

### Technology Stack

- **Frontend Framework**: React 19.1.0 with React DOM 19.1.0
- **Routing**: React Router DOM 7.7.1 for client-side navigation
- **Build Tool**: Vite 7.0.4 with hot module replacement (HMR)
- **Testing**: Jest 30.0.5 with Testing Library (@testing-library/react, @testing-library/jest-dom)
- **Component Development**: Storybook 9.0.18 for isolated component development and documentation
- **Linting**: ESLint 9.30.1 with React-specific plugins
- **Styling**: Pure CSS with category-based color theming and responsive design
- **Data Format**: JSON structure for Bible metadata, XML files for chapter content, and JSON files for verse text

## Project Structure

```
obs-bible/
├── public/
│   ├── data/
│   │   ├── kjv_structure.json          # Bible structure and metadata
│   │   ├── kjvfull.xml                 # Complete KJV Bible XML
│   │   ├── book_names.json             # Simple book name mappings (Gen -> Genesis, etc.)
│   │   ├── parse_kjv_bible.py          # Python script for data processing
│   │   ├── extract_verses_to_json.py   # Python script to extract verses from XML to JSON with automatic verse splitting
│   │   ├── generate_book_names.py      # Python script to generate book name mappings
│   │   ├── output_chapters/            # Individual chapter XML files (66 books)
│   │   │   ├── Gen/                    # Genesis chapters (Gen_1.xml to Gen_50.xml)
│   │   │   ├── Matt/                   # Matthew chapters (Matt_1.xml to Matt_28.xml)
│   │   │   └── ... (all 66 Bible books)
│   │   └── output_chapters_json/       # Individual chapter JSON files (66 books)
│   │       ├── Gen/                    # Genesis chapters (Gen_1.json to Gen_50.json)
│   │       ├── Matt/                   # Matthew chapters (Matt_1.json to Matt_28.json)
│   │       └── ... (all 66 Bible books)
├── src/
│   ├── App.jsx                         # Main application component with React Router integration
│   ├── main.jsx                        # React application entry point with BrowserRouter setup
│   ├── testSetup.js                    # Jest test environment polyfills for React Router
│   ├── display/                        # Verse display components
│   │   ├── index.jsx                   # SelectedVerseDisplay component
│   │   ├── SelectedVerseDisplay.css    # Component-specific styling
│   │   ├── SelectedVerseDisplay.test.jsx # Comprehensive test suite (22 tests)
│   │   └── SelectedVerseDisplay.stories.jsx # Storybook stories
│   ├── nav/                            # Navigation architecture folder
│   │   ├── AppNavigation.jsx           # Navigation orchestration component
│   │   ├── AppNavigation.test.jsx      # AppNavigation test suite
│   │   ├── useVerseNavigation.js       # Verse navigation custom hook
│   │   ├── useVerseNavigation.test.js  # Hook test suite
│   │   ├── bible-nav/                  # Bible content display components
│   │   │   └── verse-display/          # Verse display component
│   │   │       ├── index.jsx           # VerseDisplay component
│   │   │       ├── VerseDisplay.css    # Component-specific styling
│   │   │       ├── VerseDisplay.test.jsx # Comprehensive test suite (25 tests)
│   │   │       └── VerseDisplay.stories.jsx # Storybook stories
│   │   └── ref-nav/                    # Reference navigation components
│   │       ├── book-selection/         # Bible book selector component
│   │       │   ├── index.jsx           # BibleBookSelector component
│   │       │   ├── BibleBookSelector.css # Component-specific styling
│   │       │   ├── BibleBookSelector.test.jsx # Comprehensive test suite (21 tests)
│   │       │   └── BibleBookSelector.stories.jsx # Storybook stories
│   │       ├── chapter-selection/      # Chapter selector component
│   │       │   ├── index.jsx           # ChapterSelector component
│   │       │   ├── ChapterSelector.css # Component-specific styling
│   │       │   ├── ChapterSelector.test.jsx # Comprehensive test suite (20 tests)
│   │       │   └── ChapterSelector.stories.jsx # Storybook stories
│   │       ├── verse-selection/        # Verse selector component
│   │       │   ├── index.jsx           # VerseSelect component
│   │       │   ├── VerseSelect.css     # Component-specific styling
│   │       │   ├── VerseSelect.test.jsx # Comprehensive test suite (22 tests)
│   │       │   └── VerseSelect.stories.jsx # Storybook stories
│   │       ├── breadcrumb/             # Breadcrumb navigation component
│   │       │   ├── index.jsx           # Breadcrumb component
│   │       │   ├── Breadcrumb.css      # Component-specific styling
│   │       │   ├── Breadcrumb.test.jsx # Comprehensive test suite (22 tests)
│   │       │   └── Breadcrumb.stories.jsx # Storybook stories
│   │       ├── verse-list/            # Reusable verse list component
│   │       │   ├── index.jsx           # VerseList component
│   │       │   ├── VerseList.css       # Minimal CSS (uses parent stylesheets)
│   │       │   ├── VerseList.test.jsx  # Comprehensive test suite (30 tests)
│   │       │   └── VerseList.stories.jsx # Storybook stories (10 variations)
│   │       ├── search-history/        # Verse history display and navigation component
│   │       │   ├── index.jsx           # SearchHistory component (refactored with VerseList)
│   │       │   ├── SearchHistory.css   # Component-specific styling
│   │       │   ├── SearchHistory.test.jsx # Comprehensive test suite (23 tests)
│   │       │   ├── SearchHistory.integration.test.jsx # Integration test suite (7 tests)
│   │       │   └── SearchHistory.stories.jsx # Storybook stories
│   │       ├── stage-list/            # Staged verses display and management component
│   │       │   ├── index.jsx           # StageList component (refactored with VerseList)
│   │       │   ├── StageList.css       # Component-specific styling
│   │       │   └── StageList.stories.jsx # Storybook stories
│   │       ├── tabbed-nav/             # Tabbed navigation wrapper component
│   │       │   ├── index.jsx           # TabbedNavigation component
│   │       │   └── TabbedNavigation.css # Component-specific styling
│   │       └── navigation/             # Navigation container component
│   │           ├── index.jsx           # Navigation component
│   │           ├── Navigation.css      # Component-specific styling
│   │           ├── Navigation.test.jsx # Comprehensive test suite (25 tests)
│   │           └── Navigation.stories.jsx # Storybook stories
│   ├── messages/                       # Messages Module - Custom message creation and management system
│   │   ├── components/                 # Message-related UI components
│   │   │   ├── MessagesTab/            # Main messages tab component
│   │   │   │   ├── index.jsx           # MessagesTab component
│   │   │   │   ├── MessagesTab.css     # Component-specific styling
│   │   │   │   ├── MessagesTab.test.jsx # Comprehensive test suite
│   │   │   │   └── MessagesTab.stories.jsx # Storybook stories
│   │   │   ├── SubTabs/                # Sub-tab navigation component
│   │   │   │   ├── index.jsx           # SubTabs component
│   │   │   │   ├── SubTabs.css         # Component-specific styling
│   │   │   │   ├── SubTabs.test.jsx    # Comprehensive test suite
│   │   │   │   └── SubTabs.stories.jsx # Storybook stories
│   │   │   ├── MessageEditor/          # Message creation and editing component
│   │   │   │   ├── index.jsx           # MessageEditor component
│   │   │   │   ├── MessageEditor.css   # Component-specific styling
│   │   │   │   ├── MessageEditor.test.jsx # Comprehensive test suite (50 tests)
│   │   │   │   └── MessageEditor.stories.jsx # Storybook stories
│   │   │   ├── MessageLibrary/         # Message library management component
│   │   │   │   ├── index.jsx           # MessageLibrary component
│   │   │   │   ├── MessageLibrary.css  # Component-specific styling
│   │   │   │   ├── MessageLibrary.test.jsx # Comprehensive test suite (69 tests)
│   │   │   │   └── MessageLibrary.stories.jsx # Storybook stories
│   │   │   ├── MessageCard/            # Individual message display component
│   │   │   │   ├── index.jsx           # MessageCard component
│   │   │   │   ├── MessageCard.css     # Component-specific styling
│   │   │   │   ├── MessageCard.test.jsx # Comprehensive test suite (98 tests)
│   │   │   │   └── MessageCard.stories.jsx # Storybook stories
│   │   │   └── MessageEditModal/       # Message editing modal component
│   │   │       ├── index.jsx           # MessageEditModal component
│   │   │       ├── MessageEditModal.css # Component-specific styling
│   │   │       ├── MessageEditModal.test.jsx # Comprehensive test suite (193 tests)
│   │   │       └── MessageEditModal.stories.jsx # Storybook stories
│   │   ├── utils/                      # Message-related utilities
│   │   │   ├── customMessages.js       # Custom message CRUD and validation utility
│   │   │   ├── customMessages.test.js  # Comprehensive test suite (65 tests)
│   │   │   ├── markdownRenderer.js     # Markdown processing and rendering utility
│   │   │   ├── markdownRenderer.test.js # Comprehensive test suite (44 tests)
│   │   │   ├── broadcastChannel.js     # Cross-tab communication utility with BroadcastChannel API
│   │   │   └── broadcastChannel.test.js # Comprehensive test suite (22 tests)
│   │   └── index.js                    # Barrel export for clean external imports
│   ├── utils/                          # General utility modules
│   │   ├── verseHistory.js             # Verse history localStorage utility
│   │   ├── verseHistory.test.js        # Comprehensive test suite (27 tests)
│   │   ├── broadcastChannelDebug.js    # Debug utilities for broadcast channel development
│   │   └── bookNames.js                # Book name mapping utility with synchronous functions
│   └── stories/                        # Default Storybook example components
├── .storybook/                         # Storybook configuration
│   ├── main.js                         # Storybook main configuration
│   └── preview.js                      # Storybook preview settings
├── .vscode/                           # VS Code workspace settings
│   └── settings.json                   # Jest and testing configurations
├── package.json                        # Dependencies and scripts
├── vite.config.js                      # Vite build configuration
├── jest.config.js                      # Jest testing configuration
└── eslint.config.js                   # ESLint configuration
```

## Core Architecture

### Data Structure

The application uses a three-tier data architecture:

1. **Bible Structure JSON** (`/public/data/kjv_structure.json`):
   - Hierarchical structure: `old_testament` and `new_testament`
   - Each testament contains `books` with metadata
   - Book metadata includes: `title`, `category`, `chapter_count`, `total_verses`, and `chapters` object
   - Categories: Pentateuch, Historical, Poetry, Major Prophets, Minor Prophets, Gospels, History, Pauline Epistles, General Epistles, Prophecy

2. **Chapter XML Files** (`/public/data/output_chapters/`):
   - Individual XML files for each chapter (e.g., `Gen_1.xml`)
   - OSIS XML format with Strong's numbers and morphological analysis
   - Contains structured verse data with lemma and morphological information
   - Each verse is contained on a single line with start and end markers

3. **Chapter JSON Files** (`/public/data/output_chapters_json/`):
   - Individual JSON files for each chapter (e.g., `Gen_1.json`)
   - Simple key-value structure with OSIS IDs as keys (e.g., "Gen.1.1")
   - Plain text verse content as values
   - Generated from XML files using `extract_verses_to_json.py` with automatic verse splitting
   - **Split Verses**: Long verses (>200 characters) are automatically split into parts with letter suffixes
   - Example structure:
     ```json
     {
       "Gen.1.1": "In the beginning God created the heaven and the earth.",
       "Gen.1.2": "And the earth was without form, and void...",
       "Esth.8.9a": "Then were the king's scribes called at that time in the third month...",
       "Esth.8.9b": "and rulers of the provinces which are from India unto Ethiopia...",
       ...
     }
     ```

### Component Architecture

#### Main Application (`App.jsx`)
- **Routing Architecture**: React Router integration with client-side navigation
- **Route Structure**: 
  - `/` - Main application with navigation and loading states (default route)
  - `/display` - SelectedVerseDisplay component for viewing selected verses from localStorage
  - `*` - Fallback route redirects to main application
- **Data Fetching**: 
  - Loads Bible structure from `/data/kjv_structure.json`
  - Handles loading states and error conditions gracefully
  - Loading state integrated within routing components
- **Clean Separation**: All navigation logic extracted into dedicated components
- **Component Integration**: 
  - Uses React Router's Routes and Route components
  - Renders `AppNavigation` component after data loads
  - Renders `SelectedVerseDisplay` component independently on `/display` route
  - Passes `bibleData` prop to navigation system
  - Conditional rendering with ternary operator within MainApp component (loading ? LoadingScreen : AppNavigation)
- **Error Handling**: Graceful error logging with fallback rendering

#### AppNavigation Component (`src/nav/AppNavigation.jsx`)
- **Navigation Orchestration**: Centralized navigation UI management using custom hook with tabbed interface
- **Hook Integration**: Uses `useVerseNavigation` for all navigation state and logic
- **Tabbed Interface**: Renders `TabbedNavigation` component instead of direct Navigation/VerseDisplay switching
- **State Restoration**: Automatically restores current verse when Bible data loads
- **Component Architecture**: 
  - Renders `TabbedNavigation` component wrapping all navigation functionality
  - Passes all navigation state and callbacks to tabbed interface
  - Tabbed component handles view switching between navigation and verse display
  - Manages tab state and cross-tab navigation coordination
- **Props**:
  - `bibleData`: Complete Bible structure object passed from App

#### Navigation Hook (`src/nav/useVerseNavigation.js`)
- **State Management**: Manages all verse navigation state internally
  - `selectedScripture`, `verseData`, `loadingVerses`, `navigatedVerse`, `selectedVerse`, `loadedChapters`
- **Architecture Separation**: Clear distinction between navigation and selection
  - `handleVerseSelected`: Navigation-only function (visual feedback, no persistent state changes)
  - `handleVerseDisplaySelect`: Selection function (history updates, cross-tab broadcasting)
- **Verse Navigation Logic**: `handleVerseSelected` callback implementation
  - Receives complete scripture reference object when verses are navigated to
  - Loads corresponding JSON chapter file for verse content
  - Creates OSIS ID for verse highlighting and auto-scroll
  - **Split Verse Navigation**: Automatically redirects to first part (e.g., 9a) if original verse (9) doesn't exist
  - Switches interface to verse display mode
  - Handles loading states and error conditions during verse fetch
  - **Does NOT update history or broadcast** - navigation is visual-only
- **Verse Selection Logic**: `handleVerseDisplaySelect` callback implementation
  - Receives OSIS ID when verses are explicitly selected (clicked in display)
  - **Split Verse Selection**: Preserves exact verse parts (e.g., "9a", "9b") when selected
  - Parses OSIS ID and creates scripture reference with proper book titles from bibleData
  - Updates verse history and localStorage current verse with exact verse identifier
  - Broadcasts selection to other browser tabs/windows via BroadcastChannel API
  - Updates selected verse highlighting state
- **Chapter Navigation Logic**: Multi-chapter loading and management
  - `loadAdjacentChapter()`: Core function for loading previous/next chapters
  - `handlePreviousChapter()`: Loads previous chapter and scrolls to first verse
  - `handleNextChapter()`: Loads next chapter and scrolls to first verse
  - `getAdjacentChapterInfo()`: Determines if previous/next chapters exist
  - `loadedChapters`: Set tracking which chapters have been loaded to prevent duplicates
  - **Smart Loading**: Only fetches chapters that haven't been loaded yet
  - **Data Merging**: Combines new chapter data with existing verse data seamlessly
  - **Auto-scroll**: Automatically navigates to first verse of newly loaded chapters
- **Back Navigation**: `handleBackToBooks()` function clears navigation state only - does NOT clear localStorage or broadcast
  - Display page remains independent of navigation state changes
  - Users can explicitly clear display using the clear button in SelectedVerseDisplay component
- **Verse History Integration**: Automatic history tracking and current verse persistence
- **Data Loading**: Dynamic loading of chapter JSON files on verse selection and chapter navigation
- **Error Handling**: Graceful handling of fetch errors with proper state management for both verse and chapter operations
- **Memoization**: All callback functions memoized with `useCallback` for performance

#### Navigation Component (`src/ref-nav/navigation/`)
- **Purpose**: Centralized navigation system managing all Bible browsing functionality
- **State Management**: Manages `selectedBook`, `selectedChapter`, `selectedVerse` state internally
- **Three-Level Navigation Flow**: Implements book → chapter → verse selection with unified breadcrumb navigation
- **User Interface**: 
  - Shows BibleBookSelector when no selections made
  - Shows ChapterSelector when book selected (no chapter)
  - Shows VerseSelect when book + chapter selected
  - Unified Breadcrumb component provides all navigation and verse reference display
  - Clean component hierarchy without redundant back buttons or selected info displays
- **Event Handling**: 
  - `handleBookSelect`: Sets selected book, resets chapter + verse selection
  - `handleChapterSelect`: Sets selected chapter, resets verse selection  
  - `handleVerseSelect`: Sets selected verse for display, triggers callback with scripture reference
  - `handleBreadcrumbReset`: Resets all selections to return to book view
  - `handleBreadcrumbBookSelect`: Resets to chapter view for selected book
  - `handleBreadcrumbChapterSelect`: Resets to verse view for selected chapter
- **Props**:
  - `bibleData`: Complete Bible structure object passed from App
  - `onVerseSelected`: Optional callback function triggered when verse is selected
- **Callback Integration**:
  - Calls `onVerseSelected` with complete scripture reference object:
    ```javascript
    {
      book: 'Genesis',           // Full book title
      bookId: 'Gen',            // Book abbreviation/ID
      chapter: '1',             // Chapter number (string)
      verse: 15,                // Verse number (number)
      reference: 'Genesis 1:15' // Formatted reference string
    }
    ```
  - Gracefully handles missing callback (no errors when undefined)
  - Enables extensible architecture for custom navigation actions
- **Benefits**:
  - Encapsulates all navigation logic in one place
  - Reusable and testable in isolation
  - Clean separation from data loading concerns
  - Maintainable single responsibility architecture
  - Extensible callback system for application integration

#### BibleBookSelector Component (`src/ref-nav/book-selection/`)
- **Purpose**: Interactive grid for selecting Bible books
- **Features**:
  - Color-coded categories with consistent theming
  - Responsive grid layout (3-12 columns based on screen size)
  - Hover effects and selection states
  - Accessibility support with keyboard navigation
  - Loading states and error handling
- **Props**:
  - `bibleData`: Complete Bible structure object
  - `onBookSelect`: Callback function for book selection
- **Styling**: Category-based color system with 10 distinct themes

#### ChapterSelector Component (`src/ref-nav/chapter-selection/`)
- **Purpose**: Interactive grid for selecting chapters within a selected book
- **Features**:
  - Chapter buttons with verse counts in title attributes
  - Selection state management with visual feedback
  - Responsive grid layout for chapter navigation
  - Accessibility support with proper button attributes (`type="button"`)
  - Automatic state reset when book data changes (via `useEffect`)
  - Loading states for empty or missing chapter data
- **Props**:
  - `bookData`: Selected book object with chapter information
  - `onChapterSelect`: Callback function for chapter selection
- **State Management**: Uses `useState` and `useEffect` for selection tracking and prop change handling

#### VerseSelect Component (`src/ref-nav/verse-selection/`)
- **Purpose**: Interactive grid for selecting verses within a selected chapter
- **Features**:
  - Verse buttons numbered sequentially (1, 2, 3, ...)
  - Selection state management with visual feedback
  - Responsive grid layout optimized for many verses (up to 176 in Psalm 119)
  - Accessibility support with proper button attributes and titles
  - Automatic state reset when book or chapter data changes (via `useEffect`)
  - Handles edge cases (0 verses, invalid data, missing chapters)
- **Props**:
  - `bookData`: Selected book object with chapter information
  - `chapterNumber`: Selected chapter number as string
  - `onVerseSelect`: Callback function for verse selection
- **State Management**: Uses `useState` and `useEffect` for selection tracking and prop change handling

#### Breadcrumb Component (`src/ref-nav/breadcrumb/`)
- **Purpose**: Unified navigation system replacing individual back buttons and selected info displays
- **Features**:
  - Smart contextual navigation (Books → Book → Chapter) - stops at chapter level
  - Current location highlighting with disabled buttons for current view
  - Clickable navigation elements for backward traversal
  - Minimalist design with no verse reference or chapter info displays
  - Accessibility support with meaningful titles, ARIA labels, and keyboard navigation
  - Responsive design adapting to different screen sizes
  - Dark mode support with system preference detection
- **Props**:
  - `selectedBook`: Currently selected book object
  - `selectedChapter`: Currently selected chapter number (string)
  - `selectedVerse`: Currently selected verse number (string) - used for internal state only
  - `onReset`: Callback to reset all selections (return to books)
  - `onBookSelect`: Callback to navigate to book's chapters
  - `onChapterSelect`: Callback to navigate to chapter's verses
- **Navigation Logic**: 
  - Books button always clickable (unless no selections)
  - Book button clickable when chapter/verse selected, disabled when only book selected
  - Chapter button clickable when verse selected, disabled when only chapter selected
  - No verse display element - navigation stops at chapter level for clean UI
- **State Management**: Purely controlled component with no internal state

#### TabbedNavigation Component (`src/ref-nav/tabbed-nav/`)
- **Purpose**: Tabbed interface wrapper that organizes reference navigation, history, staged verses, and custom messages into separate tabs with unified navigation flow
- **Features**:
  - **Four-Tab Interface**: Reference tab (🔍) for Bible browsing, History tab (🕐) for verse history, Stage tab (📋) for staged verses, and Messages tab (💬) for custom messages
  - **Always-Visible Tabs**: Tab bar remains visible in all navigation states for consistent access to all functionality
  - **Automatic Tab Switching**: History and Stage selections automatically switch to reference tab and navigate to verse
  - **Seamless Integration**: Wraps existing Navigation, SearchHistory, StageList, and MessagesTab components without modification
  - **Unified Verse Display**: Reference tab shows either navigation interface OR verse content with back button
  - **State Management**: Internal tab state management with cross-tab navigation coordination
  - **Responsive Design**: Mobile-optimized tab layout with adaptive sizing and stacked icons on small screens
  - **Dark Mode Support**: Both system preference detection and explicit `.dark` class support
  - **Full Accessibility**: Complete ARIA tablist/tab/tabpanel structure with proper keyboard navigation
  - **Smooth Transitions**: Fade transitions between tab content with proper visibility management
  - **Custom Messages Integration**: Complete integration of custom message creation and management functionality
- **Props**:
  - `bibleData`: Complete Bible structure object for navigation
  - `onVerseSelected`: Callback function triggered when verses are navigated to from either tab
  - `selectedScripture`: Current scripture reference object for verse display state
  - `verseData`: JSON object with verse content for display
  - `loadingVerses`: Boolean indicating verse loading state
  - `navigatedVerse`: OSIS ID for navigation highlighting
  - `selectedVerse`: OSIS ID for selection highlighting
  - `handleVerseDisplaySelect`: Callback for explicit verse selection within content
  - `handleBackToBooks`: Callback to return to navigation from verse display
  - `selectedBookData`: Book metadata for chapter navigation
  - `handlePreviousChapter`: Callback for loading previous chapter
  - `handleNextChapter`: Callback for loading next chapter
  - `getAdjacentChapterInfo`: Function to determine chapter navigation button visibility
- **Tab Architecture**:
  - **Reference Tab**: Contains Navigation component for browsing OR VerseDisplay component when verse selected
  - **History Tab**: Contains SearchHistory component for viewing and navigating to previous verses
  - **Stage Tab**: Contains StageList component for managing and navigating to staged verses
  - **Messages Tab**: Contains MessagesTab component for creating and managing custom messages
  - **Tab State**: Uses `useState` for active tab management with 'reference' as default
  - **Cross-Tab Navigation**: History and Stage selections trigger tab switch and verse navigation automatically
- **Navigation Flow Integration**:
  - **History to Reference**: Selecting verses from history automatically switches to reference tab and navigates
  - **Stage to Reference**: Selecting verses from staged list automatically switches to reference tab and navigates
  - **Verse Display**: Reference tab shows full verse display with chapter navigation when verses are selected
  - **Back Navigation**: Back button in reference tab returns to navigation interface while staying on reference tab
  - **State Preservation**: Tab switching preserves navigation state and verse display state
  - **Custom Messages Access**: Messages tab provides direct access to custom message creation and library management
- **Responsive Layout**:
  - **Desktop**: Horizontal tab layout with icons and labels side-by-side
  - **Tablet**: Maintains horizontal layout with reduced padding and smaller fonts
  - **Mobile**: Stacked icon-over-label layout for compact display on small screens
- **Accessibility Features**:
  - **Semantic Structure**: Proper `role="tablist"`, `role="tab"`, `role="tabpanel"` attributes
  - **ARIA Attributes**: `aria-selected`, `aria-controls`, `aria-labelledby` for screen readers
  - **Keyboard Navigation**: Full keyboard accessibility with proper focus management
  - **Hidden Panels**: Inactive panels properly hidden with `hidden` attribute
  - **Focus Management**: Tab switching maintains proper focus states

#### VerseList Component (`src/ref-nav/verse-list/`)
- **Purpose**: Reusable component for displaying lists of Bible verses with navigation, removal, and management functionality
- **Architecture**: Extracted from SearchHistory and StageList components to eliminate code duplication and provide consistent functionality
- **Features**:
  - **Configurable Data Source**: Adapter pattern for different data sources (history, staged verses, etc.)
  - **Event-Driven Updates**: Window event listening for real-time list updates
  - **Split Verse Support**: Intelligent handling of verse parts (e.g., "9a", "9b", "9c") with proper navigation
  - **Customizable Styling**: Works with existing CSS via configurable CSS prefix system
  - **Accessibility**: Full ARIA support, semantic HTML, keyboard navigation, screen reader compatibility
  - **Loading States**: Proper loading indicators with accessibility attributes
  - **Empty States**: Configurable empty state messaging with helpful hints
  - **Error Handling**: Graceful error recovery with console logging and fallback states
- **Props**:
  - `dataSource`: Object with `getItems()`, `clearAll()`, and `removeItem(osisId)` methods
  - `eventName`: Window event name to listen for updates (e.g., 'verseHistoryUpdated')
  - `title`: Display title for the component header
  - `emptyMessage`: Message shown when no items exist
  - `emptyHint`: Hint text shown below empty message
  - `loadingMessage`: Message shown during loading state
  - `cssPrefix`: CSS class prefix for styling (e.g., 'search-history', 'stage-list')
  - `showCount`: Boolean to show/hide item count in title
  - `formatTimestamp`: Optional custom timestamp formatting function
  - `ariaLabel`: Custom ARIA label for main container
  - `onVerseSelect`: Callback for verse navigation with scripture reference object
  - `onClearAll`: Callback for clear all button functionality
- **Usage Pattern**:
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
    cssPrefix="search-history"
    onVerseSelect={handleVerseSelect}
  />
  ```
- **Code Reduction**: Reduced SearchHistory from 159 to 50 lines, StageList from 159 to 50 lines (~75% reduction)
- **Testing**: Comprehensive test suite with 30 tests covering all functionality
- **Storybook**: 10 story variations demonstrating different configurations and use cases

#### SearchHistory Component (`src/ref-nav/search-history/`)
- **Purpose**: Display and manage verse search history with clickable navigation links and history management features
- **Architecture**: Refactored to use VerseList component for consistent functionality and reduced code duplication
- **Features**:
  - **History Display**: Shows recently visited verses as interactive navigation buttons with timestamps
  - **Split Verse Support**: Handles both regular verses and split verse parts (e.g., "9a", "9b") from localStorage history
  - **Responsive Design**: Mobile-optimized layout with adaptive button sizing and stacked header layout on small screens
  - **Dark Mode Support**: Both system preference detection (`prefers-color-scheme`) and explicit `.dark` class support
  - **Full Accessibility**: Complete ARIA support, semantic HTML structure, keyboard navigation, and screen reader compatibility
  - **History Management**: Clear all history functionality and individual item removal with confirmation
  - **Timestamp Formatting**: Custom relative time display ("Less than an hour ago", "X hours ago", "X days ago")
  - **Loading States**: Proper loading indicators with accessibility attributes during data fetching
  - **Empty States**: Helpful messaging when no history exists with actionable guidance
  - **Error Handling**: Graceful error recovery with fallback to empty state and console error logging
- **Props**:
  - `onVerseSelect`: Optional callback function triggered when verse history item is clicked
    - Receives scripture reference object: `{ book, bookId, chapter, verse, reference }`
    - Verse numbers are converted to integers for navigation (e.g., "9a" becomes verse 9)
  - `onClearHistory`: Optional callback function triggered when clear all button is clicked
- **Data Integration**:
  - **verseHistory Utility**: Uses `verseHistoryUtils.getHistory()` to load verse history from localStorage
  - **History Format**: Each history item contains: `{ book, bookId, chapter, verse, reference, timestamp, osisId }`
  - **Split Verse Handling**: Extracts numeric verse from split parts (e.g., "9a" → 9) for navigation compatibility
  - **Scripture Reference Creation**: Converts history items to navigation-compatible scripture reference objects
- **User Interactions**:
  - **Verse Navigation**: Click verse buttons to trigger navigation with `onVerseSelect` callback
  - **Individual Removal**: Remove specific verses from history using × button on each item
  - **Clear All**: Remove entire history with prominent red "Clear All" button in header
  - **Hover Effects**: Interactive button states with proper focus and hover styling
- **Integration with Navigation System**:
  - **useVerseNavigation Hook**: Integrates seamlessly with `handleVerseSelected` for verse navigation
  - **Navigation Flow**: History selections trigger main navigation system to load and display verses
  - **Cross-Component Compatibility**: Works with existing breadcrumb, verse display, and chapter navigation
  - **Split Verse Navigation**: Automatically redirects to first part (e.g., 9a) when navigating to split verses
- **State Management**: 
  - **Component State**: Uses `useState` for history array, loading state management
  - **Effect Hooks**: `useEffect` for loading history on component mount with error handling
  - **Local Updates**: Optimistic UI updates for remove operations with localStorage synchronization
- **Accessibility Architecture**:
  - **Semantic Structure**: Proper `role="main"`, `role="list"`, `role="listitem"` attributes
  - **ARIA Labels**: Descriptive labels for all interactive elements
  - **Screen Reader Support**: Hidden loading text with `sr-only` class and `aria-live` regions
  - **Keyboard Navigation**: Full keyboard accessibility for all buttons and interactions
- **Responsive Layout**:
  - **Desktop**: Horizontal header layout with side-by-side title and clear button
  - **Tablet**: Maintains horizontal layout with adjusted spacing and button sizes
  - **Mobile**: Stacked header layout with full-width clear button and reduced padding

#### SelectedVerseDisplay Component (`src/display/`)
- **Purpose**: Display the currently selected verse from localStorage with full text content and user interactions
- **Features**:
  - **LocalStorage Integration**: Automatically loads and displays current verse from localStorage using verseHistory utility
  - **Dynamic Content Loading**: Fetches verse text from JSON chapter files on component mount
  - **Split Verse Support**: Handles both regular verses and split verse parts (e.g., "9a", "9b") from localStorage
  - **Loading States**: Shows spinner and loading message while fetching verse content
  - **Error Handling**: Graceful handling of network errors, missing verses, 404 responses, and invalid JSON
  - **User Interactions**: Clear button to remove selected verse from localStorage
  - **No Verse State**: Displays helpful message when no verse is selected
  - **Verse Metadata**: Shows formatted timestamp of when verse was selected
  - **Responsive Design**: Adapts to mobile, tablet, and desktop screens with proper layout scaling
  - **Dark Mode Support**: Both system preference detection and explicit class support
  - **Accessibility**: Proper ARIA labels, semantic HTML structure, keyboard navigation, and screen reader support
- **Props**: Self-contained component with no required props (manages state through localStorage)
- **Integration**: Works independently of main navigation system, perfect for bookmarking or sharing specific verses
- **Data Loading**: Fetches chapter JSON files using same API pattern as main verse display
- **State Management**: Uses useState and useEffect for component-level state (loading, error, verse data)
- **Route Usage**: Available at `/display` route, works independently of main app loading state

#### VerseDisplay Component (`src/nav/bible-nav/verse-display/`)
- **Purpose**: Display and interact with actual verse content from JSON chapter files with multi-chapter support and chapter navigation
- **Features**:
  - **Multi-Chapter Display**: Shows multiple chapters in a single scrollable view with individual chapter headers
  - **Chapter Navigation**: Previous/Next chapter buttons for seamless reading experience
  - **Dynamic Chapter Loading**: Loads adjacent chapters on-demand into the same view
  - **Smart Button Visibility**: Previous/Next buttons only show when adjacent chapters exist
  - **Scrollable Content Area**: Dedicated scrollable container with fixed navigation buttons
  - Full verse text display with verse numbers
  - Auto-scroll to verses for both navigation and selection across multiple chapters
  - Triple highlighting system: orange animation (navigation), persistent orange reminder, blue selection
  - Fast navigation highlight animation (0.6s ease-out with pulse effect)
  - Persistent navigation reminders with subtle orange left border and background
  - Responsive design for different screen sizes
  - Dark mode support with system preference detection
  - Accessibility support with proper ARIA labels and keyboard navigation
  - Loading and empty states handling
- **Props**:
  - `verseData`: JSON object with OSIS IDs as keys and verse text as values (supports multiple chapters)
  - `selectedVerse`: OSIS ID of currently selected verse (e.g., "Gen.1.15") - blue highlight
  - `navigateToVerse`: OSIS ID for navigation-only highlighting (e.g., "Gen.1.15") - orange highlight
  - `onVerseSelect`: Callback function that receives OSIS ID when verse is clicked
  - `bookName`: Optional book name for display header
  - `chapterNumber`: Optional initial chapter number for display header
  - `bookData`: Book metadata for chapter navigation (chapter count, etc.)
  - `onPreviousChapter`: Callback function to load previous chapter
  - `onNextChapter`: Callback function to load next chapter
  - `getAdjacentChapterInfo`: Function to determine button visibility
  - `loadingVerses`: Boolean indicating if chapters are currently loading
- **Chapter Navigation System**:
  - **Previous Chapter Button**: Fixed at top, loads previous chapter into same view
  - **Next Chapter Button**: Fixed at bottom, loads next chapter into same view  
  - **Chapter Headers**: Individual headers for each loaded chapter (e.g., "Genesis 1", "Genesis 2")
  - **Loading States**: Buttons disabled during chapter loading operations
  - **Auto-scroll**: Automatically scrolls to first verse of newly loaded chapters
- **Navigation vs Selection System**:
  - **Navigation Animation**: Temporary orange pulse animation (0.6s) triggered only by `navigateToVerse` prop
  - **Navigation Reminder**: Persistent subtle orange left border and background for previously navigated verses
  - **Selection State**: Persistent blue highlight for currently selected verse
  - **Combined State**: Selected verses that were previously navigated show blue selection with orange accent
  - **Animation Clearing**: Any verse selection immediately clears ALL navigation animations globally
  - **Reminder Persistence**: Orange reminders remain until component unmount/reload
  - **Cross-Chapter Support**: All highlighting and selection works seamlessly across multiple chapters
- **Interaction Flow**:
  - Navigate to verse → Orange pulse + persistent reminder added
  - Select any verse → All navigation animations stop, selection highlighting begins
  - Load previous/next chapter → Chapter added to view, auto-scroll to first verse
  - Previously navigated verses retain subtle orange reminders even when selected
  - Navigation and selection are completely independent state systems
- **Data Integration**: Works with JSON chapter files from `output_chapters_json/`
- **OSIS ID Handling**: Extracts verse numbers from OSIS IDs (e.g., "Gen.1.15" → "15")
- **State Management**: Uses `useState` and `useEffect` for navigation highlighting, persistent reminders, selection tracking, auto-scroll functionality, and chapter grouping

### Styling Architecture

The application uses a comprehensive CSS architecture:

1. **Global Styles** (`src/index.css`):
   - CSS custom properties for theming
   - Dark mode support via `prefers-color-scheme` and `.dark` class
   - Typography and base element styling

2. **Application Styles** (`src/App.css`):
   - Layout for single-view interface switching between navigation and verse display
   - Flexbox layout system (`.navigation-view`, `.verse-view`, `.verse-header`)
   - Prominent back button styling with blue theme and hover effects
   - Loading state styling for both Bible data and verse content
   - Dark mode support for all interface elements
   - Responsive design adapting button and spacing for mobile

3. **Component Styles**:
   - **Global Accessibility** (`src/index.css`):
     - `.sr-only` class for screen-reader-only content that's visually hidden but accessible
   - **BibleBookSelector** (`src/book-selection/BibleBookSelector.css`):
     - Responsive grid system with category-based color theming
     - Interactive states (hover, focus, selected)
     - Mobile-responsive breakpoints
   - **ChapterSelector** (`src/chapter-selection/ChapterSelector.css`):
     - CSS Grid layout with `auto-fill` for proper row wrapping
     - Simplified button styling with consistent sizing
     - Responsive breakpoints for different screen sizes
     - Fixed button heights to prevent size variations
     - Screen-reader-only heading for accessibility without visual clutter
   - **VerseSelect** (`src/verse-selection/VerseSelect.css`):
     - CSS Grid layout optimized for many verses (minmax 50px-40px responsive)
     - Smaller button sizing suitable for verse numbers
     - Enhanced responsive design for mobile verse selection
     - Proper handling of chapters with 0-176 verses
     - Screen-reader-only heading for accessibility without visual clutter
   - **Breadcrumb** (`src/breadcrumb/Breadcrumb.css`):
     - Flexible navigation layout with semantic HTML (nav, ol, li structure)
     - Contextual button styling with hover states and disabled states
     - Visual separators between navigation levels
     - Verse reference and chapter info display styling
     - Comprehensive responsive design (desktop, tablet, mobile breakpoints)
     - Complete dark mode support with system preference and explicit class support
     - Accessibility-focused design with proper focus states and ARIA support
   - **TabbedNavigation** (`src/tabbed-nav/TabbedNavigation.css`):
     - Flexbox layout with tab bar at top and content area below
     - Tab bar styling with equal-width tabs, icons, and labels
     - Active tab highlighting with bottom border and color changes
     - Smooth transitions for tab switching and hover effects
     - Absolute positioning for tab panels with fade transitions
     - Responsive breakpoints for mobile (768px, 480px) with stacked icon/label layout
     - Dark mode support with proper contrast ratios and themed colors
     - Accessibility-focused styling with proper focus states and ARIA support
     - Verse view integration ensuring proper scrolling within tab content
   - **SearchHistory** (`src/search-history/SearchHistory.css`):
     - Card-based layout with individual history items as interactive buttons
     - Two-column layout per item: verse information and remove button
     - Responsive header design with adaptive Clear All button positioning
     - Comprehensive dark mode support with proper contrast ratios and hover states
     - Mobile-responsive breakpoints (768px, 480px) with stacked header layout
     - Accessibility-focused styling with proper focus states and screen reader support
     - Interactive states: hover effects, focus outlines, loading states, empty states
     - Consistent spacing and typography with flexible button sizing
     - Remove button styling with danger color theme and hover transitions
   - **Navigation** (`src/navigation/Navigation.css`):
     - Simple container styling for navigation wrapper
     - View containers for chapter and verse selection states
     - Minimal styling focused on layout and spacing
     - Delegates visual design to child components
   - **VerseDisplay** (`src/nav/bible-nav/verse-display/VerseDisplay.css`):
     - Multi-chapter layout with individual chapter headers and verse sections
     - Chapter navigation buttons with fixed positioning (top/bottom)
     - Scrollable content area with proper overflow handling
     - Blue selection theme with smooth transitions
     - Orange navigation highlighting with persistent reminders
     - Responsive design adapting button sizes and spacing
     - Dark mode support with proper contrast ratios
     - Custom scrollbar styling for better UX
     - Proper text wrapping for long verses
     - Interactive chapter navigation buttons with hover effects and loading states

### Category Color System

Each Bible book category has a distinct color theme:
- **Pentateuch**: Warm brown/orange
- **Historical**: Blue
- **Poetry**: Purple
- **Major Prophets**: Red
- **Minor Prophets**: Pink
- **Gospels**: Green
- **History (Acts)**: Teal
- **Pauline Epistles**: Indigo
- **General Epistles**: Cyan
- **Prophecy**: Yellow

## Cross-Tab Communication System

The application includes a comprehensive cross-tab communication system using the BroadcastChannel API that enables real-time synchronization of verse selections across multiple browser tabs or windows. This system operates independently while integrating seamlessly with the navigation architecture.

### BroadcastChannel Features

1. **Real-Time Synchronization**: Verse selections are instantly synchronized across all open tabs
2. **Automatic Fallback**: Uses localStorage events when BroadcastChannel API is not supported
3. **Origin Filtering**: Messages are filtered to prevent self-triggering loops
4. **Message Types**: Supports VERSE_SELECTED, VERSE_CLEARED, and other message types
5. **Error Resilience**: Graceful handling of API failures and unsupported browsers
6. **Selective Broadcasting**: Only verse selections (not navigation) trigger broadcasts

### Implementation Architecture

#### Utility Module (`src/utils/broadcastChannel.js`)
Comprehensive utility providing:
- `verseSyncUtils.broadcastVerseSelection(scriptureRef)`: Broadcast verse selection to other tabs
- `verseSyncUtils.broadcastVerseClear()`: Broadcast verse clearing to other tabs  
- `verseSyncUtils.subscribe(callback)`: Subscribe to messages from other tabs
- `verseSyncUtils.cleanup()`: Clean up resources and close channels
- **BroadcastChannel Support**: Primary implementation using modern BroadcastChannel API
- **localStorage Fallback**: Automatic fallback for older browsers using storage events
- **Message Filtering**: Prevents tabs from processing their own messages
- **Error Handling**: Comprehensive error catching and logging

#### Integration Points
- **useVerseNavigation Hook**: `handleVerseDisplaySelect` broadcasts selections (not navigation)
- **SelectedVerseDisplay Component**: Subscribes to broadcasts and updates display automatically
- **Architecture Separation**: Only explicit verse selections trigger broadcasts, navigation is local-only
- **Book Title Integration**: Uses actual Bible data structure for proper book titles in broadcasts

### Broadcasting Architecture

#### When Broadcasting Occurs
- **Verse Selection**: When users click on verses in the VerseDisplay component
- **Verse Clearing**: When users explicitly clear verse in SelectedVerseDisplay component
- **NOT on Navigation**: Navigation highlighting does not trigger broadcasts
- **NOT on Back to Books**: Returning to navigation does not clear display or broadcast

#### Message Structure
Broadcast messages contain:
```javascript
{
  type: 'verse-selected',          // Message type
  data: {                          // Scripture reference object
    book: 'Genesis',               // Full book title from Bible data
    bookId: 'Gen',                 // Book abbreviation
    chapter: '1',                  // Chapter number
    verse: 1,                      // Verse number
    reference: 'Genesis 1:1'       // Formatted reference
  },
  timestamp: 1234567890,           // Unix timestamp
  origin: '/navigation'            // Source tab pathname
}
```

#### Cross-Tab Behavior
1. **Source Tab**: User selects verse → broadcasts message → updates local state
2. **Listening Tabs**: Receive message → update display if on `/display` route → no local state changes
3. **Filter Prevention**: Tabs ignore messages with their own origin pathname
4. **Automatic Updates**: Display component automatically loads verse text when receiving broadcasts

### Testing Coverage

Comprehensive test suite with **22 tests** covering:
- **broadcastChannel.test.js**: BroadcastChannel API functionality
  - Message broadcasting and subscription
  - localStorage fallback behavior  
  - Origin filtering and error handling
  - Message type validation
- **useVerseNavigation.test.js**: Integration testing
  - Verse selection broadcasting (handleVerseDisplaySelect)
  - Navigation non-broadcasting (handleVerseSelected)
  - Book title mapping from Bible data
- **SelectedVerseDisplay.test.jsx**: Display component integration
  - Message subscription and verse loading
  - Cross-tab update behavior

### Usage Examples

```javascript
// Broadcast verse selection (automatic in useVerseNavigation)
verseSyncUtils.broadcastVerseSelection({
  book: 'Genesis',
  bookId: 'Gen', 
  chapter: '1',
  verse: 1,
  reference: 'Genesis 1:1'
});

// Subscribe to broadcasts (automatic in SelectedVerseDisplay)
const unsubscribe = verseSyncUtils.subscribe((message) => {
  if (message.type === 'verse-selected') {
    updateDisplay(message.data);
  }
});

// Cleanup subscription
unsubscribe();
```

## Messages Module Architecture

The Messages Module is a comprehensive custom message creation and management system that enables users to create, edit, organize, and store custom Bible study messages. This module is architecturally separated into its own dedicated subfolder structure for better organization and maintainability.

### Module Structure

The Messages Module follows a clean architectural pattern:
- **src/messages/components/**: All UI components related to message functionality
- **src/messages/utils/**: All utility functions for message operations
- **src/messages/index.js**: Barrel export file for clean external imports

### Component Architecture

#### MessagesTab Component (`src/messages/components/MessagesTab/`)
- **Purpose**: Main container component that provides tabbed interface for message management
- **Features**: 
  - Two-tab interface: Create tab for new messages, Library tab for message management
  - Sub-tab navigation integration with SubTabs component
  - State management for active tab and message operations
  - Complete integration with MessageEditor component
- **Props**: Self-contained component managing internal state for tab navigation
- **Integration**: Seamlessly integrates into main TabbedNavigation as Messages tab (💬)

#### SubTabs Component (`src/messages/components/SubTabs/`)
- **Purpose**: Reusable sub-tab navigation component for organizing message functionality
- **Features**:
  - Clean tab interface with Create and Library tabs
  - Active tab highlighting and smooth transitions
  - Responsive design adapting to different screen sizes
  - Accessibility support with proper ARIA attributes
- **Props**:
  - `activeTab`: Currently active tab identifier
  - `onTabChange`: Callback function for tab switching
  - `tabs`: Array of tab configurations with id, label, and content

#### MessageEditor Component (`src/messages/components/MessageEditor/`)
- **Purpose**: Comprehensive message creation and editing interface with markdown support
- **Features**:
  - **Form Management**: Title, content, and tags input with validation
  - **Markdown Support**: Real-time preview and markdown processing
  - **CRUD Operations**: Create, read, update, delete messages via customMessages utility
  - **Validation**: Input validation with user feedback and error handling
  - **Responsive Design**: Mobile-optimized layout with adaptive form elements
  - **Accessibility**: Full keyboard navigation and screen reader support
- **Props**: Self-contained component managing form state and message operations
- **State Management**: Uses useState for form data, validation, and user feedback

### Utility Architecture

#### customMessages Utility (`src/messages/utils/customMessages.js`)
- **Purpose**: Complete CRUD operations and validation for custom messages
- **Features**:
  - **Message Creation**: addMessage() with validation and localStorage persistence
  - **Message Retrieval**: getMessages(), getMessage() for accessing stored messages
  - **Message Updates**: updateMessage() for editing existing messages
  - **Message Deletion**: deleteMessage() for removing messages
  - **Validation System**: Comprehensive input validation for title, content, and tags
  - **Event Dispatching**: Cross-tab synchronization via custom events
  - **Error Handling**: Graceful error recovery with detailed error logging
- **Data Structure**: 
  ```javascript
  {
    id: 'unique-uuid',
    title: 'Message Title',
    content: 'Markdown content',
    tags: ['tag1', 'tag2'],
    createdAt: timestamp,
    updatedAt: timestamp
  }
  ```
- **Testing**: Comprehensive test suite with 65 tests covering all functionality

#### markdownRenderer Utility (`src/messages/utils/markdownRenderer.js`)
- **Purpose**: Markdown processing and rendering with security validation
- **Features**:
  - **Plain Text Rendering**: renderToPlainText() for clean text output
  - **HTML Rendering**: renderToHTML() with XSS protection and sanitization
  - **Content Validation**: validateMarkdown() for security checking
  - **Performance Monitoring**: getPerformanceInfo() for rendering metrics
  - **Security Features**: Script tag detection, XSS prevention, content sanitization
- **Testing**: Comprehensive test suite with 44 tests covering all rendering scenarios

#### broadcastChannel Utility (`src/messages/utils/broadcastChannel.js`)
- **Purpose**: Cross-tab communication for message synchronization (moved from general utils)
- **Features**: Same functionality as before, now dedicated to messages module
- **Integration**: Used by customMessages utility for cross-tab message updates

#### MessageLibrary Component (`src/messages/components/MessageLibrary/`)
- **Purpose**: Comprehensive message management interface with full CRUD operations and display functionality
- **Features**:
  - **Complete Message Management**: Display, search, filter, edit, delete, and organize custom messages in library view
  - **Display Button Integration**: Messages can be displayed directly via Display buttons with broadcast integration
  - **Advanced Search and Filtering**: Real-time search by title and content with tag-based filtering
  - **Professional Message Display**: Uses MessageCard components for consistent, accessible message presentation
  - **Modal Editing Integration**: Seamless integration with MessageEditModal for comprehensive editing workflow
  - **Responsive Design**: Mobile-optimized layout with adaptive grid and flexible message display
  - **State Management**: Complete state management for search, filtering, editing, and message operations
  - **Accessibility**: Full keyboard navigation, screen reader support, and ARIA compliance
- **Props**: Self-contained component managing all library functionality and message display operations
- **Testing**: Comprehensive test suite with 44 tests covering all library operations and user interactions

#### MessageCard Component (`src/messages/components/MessageCard/`)
- **Purpose**: Individual message display component with professional styling and display button functionality
- **Features**:
  - **Professional Message Display**: Clean, card-based layout with title, content preview, and metadata
  - **Display Button Integration**: Display buttons (📺) broadcast message selection for immediate OBS overlay display
  - **Visual Feedback System**: Clear indication when messages are currently displayed with visual state updates
  - **Date Formatting**: Relative timestamp display ("2 hours ago", "3 days ago") with fallback to absolute dates
  - **Content Preview**: Intelligent content truncation with "Show more/less" functionality for long messages
  - **Interactive Elements**: Edit and delete buttons with hover states and accessibility features
  - **Responsive Design**: Adapts to different screen sizes with mobile-optimized layout and touch targets
  - **Accessibility**: Full ARIA support, keyboard navigation, and semantic HTML structure
- **Props**:
  - `message`: Message object with id, title, content, tags, dates
  - `onEdit`: Callback for edit button functionality
  - `onDelete`: Callback for delete button functionality
  - `isDisplayed`: Boolean indicating if message is currently displayed (for visual feedback)
- **Integration**: Used within MessageLibrary for consistent message presentation and display functionality
- **Testing**: Comprehensive test suite with 63 tests covering all functionality including display button behavior

### Module Integration

#### Barrel Exports (`src/messages/index.js`)
```javascript
// Clean import interface for external consumers
export { default as MessagesTab } from './components/MessagesTab'
export { default as SubTabs } from './components/SubTabs'  
export { default as MessageEditor } from './components/MessageEditor'
export { default as MessageLibrary } from './components/MessageLibrary'
export { default as MessageCard } from './components/MessageCard'
export { customMessageUtils } from './utils/customMessages'
export { markdownUtils } from './utils/markdownRenderer'
```

#### External Usage
```javascript
// Clean imports from the messages module
import { MessagesTab, MessageLibrary, customMessageUtils, markdownUtils } from '../messages'

// Or specific component imports
import MessagesTab from '../messages/components/MessagesTab'
import MessageLibrary from '../messages/components/MessageLibrary'
import { customMessageUtils } from '../messages/utils/customMessages'
```

### Import Path Architecture

The refactoring established clean import paths:
- **Internal Module Imports**: Components use relative paths within the module
- **External Module Access**: Other parts of the app import via the messages module path
- **Barrel Export Benefits**: Simplified imports and better encapsulation

### Testing Integration

- **Component Testing**: All components have comprehensive test suites
- **Utility Testing**: 131+ tests total across all utilities (65 + 44 + 22)
- **Integration Testing**: Tests verify component-utility integration
- **Cross-Module Testing**: External imports tested to ensure module boundaries work correctly

### Phase 3 Achievement: Display Action Implementation

**Historic Milestone Completed (August 1, 2025)**: The Messages Module has achieved another groundbreaking milestone with the completion of **Phase 3: Display Action Implementation**. This represents a **64% completion rate** (30/47 checklist items) and establishes the foundation for end-to-end custom message workflow.

#### Technical Achievements

**MessageCard Component Enhancement**:
- **Display Button Integration**: Added professional Display buttons (📺) with comprehensive accessibility and user experience design
- **Visual Feedback System**: Real-time indication of currently displayed messages with state synchronization
- **Broadcast Integration**: Seamless integration with cross-tab communication for immediate display updates
- **Component Quality**: 63 comprehensive tests ensuring bulletproof reliability and edge case coverage

**MessageLibrary Integration**:
- **State Management**: Complete integration with broadcast system for display state tracking
- **User Experience**: Intuitive display button placement with clear visual feedback when messages are displayed
- **Error Handling**: Comprehensive error handling and graceful fallback for display operations
- **Testing Excellence**: 44 comprehensive tests covering all library operations including display functionality

**Display Architecture**:
- **Broadcast System**: Messages now broadcast selection to other tabs via BroadcastChannel API
- **State Synchronization**: Real-time tracking of currently displayed messages across browser tabs
- **localStorage Integration**: Custom messages saved as current content for display component consumption
- **Cross-Tab Coordination**: Perfect synchronization ensures all tabs reflect current display state

#### Quality Metrics Achieved

- **Test Success Rate**: 100% (All 107+ tests passing across MessageCard and MessageLibrary)
- **Code Quality**: Zero ESLint errors or warnings throughout implementation
- **Accessibility**: Full ARIA support and keyboard navigation for all display interactions
- **Performance**: Zero performance regressions with optimized state management
- **User Experience**: Professional display button integration matching existing component quality

#### User Impact

- **Immediate Value**: Users can now click Display buttons to broadcast custom message selections for OBS overlay
- **Visual Clarity**: Clear indication when messages are currently displayed with professional UI feedback
- **Professional Interface**: Display buttons seamlessly integrate with existing component design language
- **Accessibility**: Full keyboard navigation and screen reader support for display functionality

#### Next Phase Readiness

Phase 3 completion sets the stage for **Phase 4: Display Component Enhancement**, which will:
- Enhance SelectedVerseDisplay component for independent custom message rendering
- Complete the end-to-end workflow: Create → Display → OBS overlay
- Add comprehensive testing and final integration validation

This achievement represents a **significant step forward** in making the Messages Module fully functional for worship teams worldwide, with display functionality now seamlessly integrated into the existing architecture.

### Development Benefits

1. **Modular Architecture**: Clear separation of message-related code
2. **Better Organization**: Related functionality grouped together
3. **Cleaner Imports**: Shortened import paths and barrel exports
4. **Scalability**: Easy to add new message features within the module
5. **Maintenance**: Changes to message system isolated to one module
6. **Testing**: Module can be tested independently
7. **Git History**: File movements preserved with proper git mv commands
8. **Display Integration**: End-to-end workflow from creation to display now operational

### TabbedNavigation Component Usage Examples

```javascript
// Basic TabbedNavigation component usage
import TabbedNavigation from '../src/nav/ref-nav/tabbed-nav'

// Full integration with useVerseNavigation hook
const NavigationApp = () => {
  const navigation = useVerseNavigation(bibleData)
  
  return (
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
  )
}

// Tab behavior examples:
// 1. User starts on Reference tab, navigates through books/chapters/verses
// 2. User switches to History tab, sees previously selected verses
// 3. User clicks verse in History tab → automatically switches to Reference tab and navigates
// 4. Reference tab shows either navigation interface OR verse display with back button
// 5. Tab bar remains visible in all states for consistent access

// Responsive design - tabs automatically adapt:
// Desktop: Horizontal icon+label layout with full padding
// Tablet: Reduced padding and smaller fonts
// Mobile: Stacked icon-over-label layout for compact display

// Dark mode support - automatically enabled via:
// System preference: @media (prefers-color-scheme: dark)  
// Manual override: <div className="dark"><TabbedNavigation /></div>

// Accessibility features:
// - Full ARIA tablist/tab/tabpanel structure
// - Keyboard navigation between tabs with arrow keys
// - Screen reader announces tab changes and content
// - Proper focus management during tab switching
```

### SearchHistory Component Usage Examples

```javascript
// Basic SearchHistory component usage
import SearchHistory from '../src/nav/ref-nav/search-history'

// Simple usage with verse selection callback
const MyApp = () => {
  const handleVerseSelect = (scriptureRef) => {
    console.log(`Navigating to: ${scriptureRef.reference}`)
    // Navigate to verse using existing navigation system
    // scriptureRef: { book, bookId, chapter, verse, reference }
  }

  return (
    <SearchHistory onVerseSelect={handleVerseSelect} />
  )
}

// Integration with useVerseNavigation hook
const NavigationApp = () => {
  const navigation = useVerseNavigation(bibleData)
  
  const handleClearHistory = () => {
    console.log('History cleared by user')
    // Optional cleanup or notifications
  }

  return (
    <SearchHistory 
      onVerseSelect={navigation.handleVerseSelected}
      onClearHistory={handleClearHistory}
    />
  )
}

// Split verse handling example
// When user clicks "Esther 8:9a" in history:
// - Component extracts verse number "9" from "9a"
// - Calls onVerseSelect with: { book: 'Esther', bookId: 'Esth', chapter: '8', verse: 9, reference: 'Esther 8:9a' }
// - Navigation system loads verse 9 and automatically redirects to 9a

// Responsive design - component automatically adapts:
// Desktop: Horizontal header with side-by-side title and clear button
// Mobile: Stacked header with full-width clear button

// Dark mode support - automatically enabled via:
// System preference: @media (prefers-color-scheme: dark)
// Manual override: <div className="dark"><SearchHistory /></div>
```

### SearchHistory Props API

```javascript
// Component Props Interface
SearchHistory.propTypes = {
  // Optional callback for verse selection
  onVerseSelect: PropTypes.func,
  // Optional callback for history clearing
  onClearHistory: PropTypes.func
}

// onVerseSelect callback receives scripture reference:
{
  book: 'Genesis',           // Full book name
  bookId: 'Gen',            // Book abbreviation
  chapter: '1',             // Chapter number (string)
  verse: 1,                 // Verse number (integer, extracted from split parts)
  reference: 'Genesis 1:1'  // Formatted reference (preserves original format)
}

// Split verse example - "9a" becomes:
{
  book: 'Esther',
  bookId: 'Esth', 
  chapter: '8',
  verse: 9,                 // Extracted from "9a"
  reference: 'Esther 8:9a'  // Original reference preserved
}
```

## Verse History System

The application includes a comprehensive verse history tracking system that automatically saves and restores selected verses using localStorage. This system operates independently of existing components, providing persistent verse selection across browser sessions.

### Verse History Features

1. **Automatic History Tracking**: Every verse navigation is automatically saved to history with timestamps
2. **Current Verse Persistence**: The last selected verse is restored when the app loads
3. **Duplicate Management**: Re-selecting verses moves them to the top of history
4. **Storage Limits**: Maintains up to 50 recent verses in history
5. **Error Resilience**: Graceful handling of localStorage failures
6. **Data Integrity**: Validates scripture references before storage

### Implementation Architecture

#### Utility Module (`src/utils/verseHistory.js`)
Standalone utility providing:
- `getHistory()`: Retrieve complete verse history
- `addToHistory(scriptureRef)`: Add verse to history
- `getCurrentVerse()`: Get currently selected verse
- `setCurrentVerse(scriptureRef)`: Save current verse
- `clearCurrentVerse()`: Remove current verse
- `clearHistory()`: Clear all history
- `getRecentVerses(limit)`: Get limited recent verses
- `removeFromHistory(osisId)`: Remove specific verse

#### Integration Points
- **App.jsx**: Integrated into existing `handleVerseSelected` and `handleBackToBooks` functions
- **No Component Changes**: Existing Navigation, VerseDisplay, and other components remain unchanged
- **Automatic Restoration**: App restores last verse on load if valid data exists
- **Clean State Management**: History cleared when returning to navigation

### Data Structure

History items contain:
```javascript
{
  book: 'Genesis',           // Full book title
  bookId: 'Gen',            // Book abbreviation
  chapter: '1',             // Chapter number (string)
  verse: 1,                 // Verse number (number)
  reference: 'Genesis 1:1', // Formatted reference
  timestamp: 1234567890,    // Unix timestamp
  osisId: 'Gen.1.1'        // OSIS identifier
}
```

### Testing Coverage

Comprehensive test suite with **36 tests** covering:
- **verseHistory.test.js**: 27 tests for utility functions
  - localStorage functionality and error handling
  - History management operations
  - Input validation and edge cases
  - Error resilience testing
- **App.test.jsx**: 9 tests for integration (all passing)
  - Verse selection tracking
  - Current verse restoration
  - State management integration
  - Error handling scenarios

### Usage Examples

```javascript
// Add verse to history (automatic in App.jsx)
verseHistoryUtils.addToHistory({
  book: 'Genesis',
  bookId: 'Gen',
  chapter: '1',
  verse: 1,
  reference: 'Genesis 1:1'
});

// Get recent verses
const recent = verseHistoryUtils.getRecentVerses(5);

// Check current verse
const current = verseHistoryUtils.getCurrentVerse();

// Clear history
verseHistoryUtils.clearHistory();
```

## Development Commands

### Essential Commands
```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Lint code
npm run lint

# Start Storybook component development environment
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

### Testing Strategy

The project implements comprehensive testing with 500+ total tests (all passing):

1. **Unit Tests**:
   - **BibleBookSelector**: 21 tests covering component rendering, user interactions, accessibility, and edge cases
   - **ChapterSelector**: 20 tests covering component state management, user events, and error handling
   - **VerseSelect**: 22 tests covering verse selection, edge cases (0-176 verses), and prop changes
   - **Breadcrumb**: 22 tests covering navigation states, user interactions, accessibility, and edge cases
   - **SearchHistory**: 23 tests covering history display, verse navigation, history management, error handling, timestamp formatting, accessibility, and component structure
   - **SearchHistory Integration**: 7 tests covering integration with useVerseNavigation hook, split verse handling, navigation lifecycle, and cross-component compatibility
   - **Navigation**: 25 tests covering complete navigation flow, state management, integration, callback functionality, and edge cases
   - **VerseDisplay**: 25 tests covering verse rendering, navigation highlighting, persistent reminders, selection clearing, auto-scroll, accessibility, and edge cases
   - **SelectedVerseDisplay**: 22 tests covering localStorage integration, verse loading, error handling, user interactions, accessibility, and component lifecycle
   - **verseHistory**: 27 tests covering localStorage functionality, history management, error handling, and data integrity
   - **broadcastChannel**: 22 tests covering BroadcastChannel API functionality, localStorage fallback, message filtering, and cross-tab communication
   - **App**: 15 tests covering routing architecture, Bible data loading, AppNavigation integration, SelectedVerseDisplay routing, and error handling
   - **AppNavigation**: 35 tests covering navigation orchestration, hook integration, component rendering states, and user interactions
   - **useVerseNavigation**: 35 tests covering custom hook state management, verse selection logic, history integration, and memoization
   - **Messages Module Tests (320+ tests total)**:
     - **MessageCard**: 63 tests covering message display, user interactions, date formatting, accessibility, display button functionality, and keyboard navigation
     - **MessageEditModal**: 193 tests covering form validation, user interactions, modal behavior, and error handling
     - **MessagesTab**: 35 tests covering tab navigation, component integration, and user interface
     - **MessageLibrary**: 44 tests covering message management, search functionality, display integration, and user operations
     - **MessageEditor**: 50 tests covering message creation, form validation, and user feedback
     - **SubTabs**: 14 tests covering sub-tab navigation and component behavior
     - **customMessages utility**: 65 tests covering CRUD operations, validation, and localStorage functionality
     - **markdownRenderer utility**: 44 tests covering markdown processing and security validation
     - **broadcastChannel utility**: 22 tests covering cross-tab communication and fallback behavior
   - Component rendering and behavior validation
   - User interactions and event handling
   - Edge cases and error conditions (including zero verses, invalid data)
   - Accessibility features and keyboard navigation
   - State management and prop changes
   - Navigation flow testing across all breadcrumb states
   - Integration testing between navigation components
   - Verse history persistence and localStorage functionality
   - Custom hook testing with renderHook and comprehensive state management scenarios

2. **Test Configuration**:
   - **Environment**: jsdom for DOM simulation
   - **Setup**: `@testing-library/jest-dom` for enhanced assertions
   - **Coverage**: Excludes Storybook files and setup files
   - **Mocking**: CSS imports mocked for testing
   - **VS Code Integration**: Enhanced Jest extension settings for test discovery

3. **Recent Updates** (Latest):
   - **🎉 PHASE 3 COMPLETE - Display Action Implementation**: Historic achievement completing display functionality integration with 107+ tests passing and 64% project completion (30/47 items)
     - **MessageCard Component Enhancement**: Added Display buttons (📺) with comprehensive accessibility and broadcast integration for immediate OBS overlay display
     - **MessageLibrary Integration**: Complete state management integration with cross-tab display synchronization and visual feedback systems
     - **Broadcast Architecture**: Messages now broadcast selection via BroadcastChannel API with localStorage integration for display component consumption
     - **Quality Excellence**: Maintained 100% test success rate across all enhanced components with zero performance regressions
     - **User Experience**: Professional display button integration with clear visual feedback when messages are currently displayed
     - **Next Phase Ready**: Established foundation for Phase 4 Display Component Enhancement to complete end-to-end workflow
   - **🎉 MILESTONE 10 COMPLETE - Messages Module Testing Excellence**: Achieved 100% test success rate across all 320+ Messages Module tests, representing one of the most significant quality milestones in the project
     - Fixed all MessageEditModal test failures (193 tests) with comprehensive form validation, user interaction, and error handling coverage
     - Resolved MessageCard component issues (98 tests) covering message display, date formatting, accessibility, and keyboard navigation
     - Addressed MessagesTab integration issues (35 tests) ensuring perfect sub-tab navigation and component integration
     - Maintained 100% functionality while systematically updating test expectations following the principle: "when we break tests we either decide they are no longer relevant and delete them, change them to meet the current situation, or make appropriate new ones"
     - Established rock-solid foundation for Messages Module with comprehensive, reliable test coverage across all components and utilities
   - **Intelligent Verse Splitting System**: Implemented advanced verse splitting for long verses (>200 characters) with optimal size distribution into 2, 3, or more parts as needed
   - **Multi-Part Verse Support**: Enhanced algorithm creates evenly-sized parts (e.g., 9a, 9b, 9c) using sentence boundaries and smart distribution for maximum readability
   - **Smart Navigation for Split Verses**: When users click verse 9, system automatically navigates to 9a while preserving exact selection (9a, 9b, 9c) for history and display
   - **Split Verse Architecture**: Clear separation between navigation (guides to first part) and selection (saves exact part), maintaining backward compatibility
   - **Advanced Data Processing**: Updated extract_verses_to_json.py with intelligent part calculation, sentence-boundary splitting, and word-boundary fallback for optimal readability
   - **Cross-Component Support**: All components (navigation, display, history, broadcasting) now handle multi-part split verses seamlessly
   - **Enhanced OBS Studio Text Readability**: Increased display text size by 33% (2.4rem desktop, 2.0rem tablet, 1.6rem mobile) and added 50% more padding for better video streaming visibility
   - **Continuous Chapter Navigation**: Fixed chapter navigation to work continuously in both directions, tracking loaded chapter range instead of original chapter for seamless multi-chapter reading
   - **Complete Simple Book Name Integration**: Updated breadcrumb component to use simple book names (Genesis, Matthew) instead of formal titles throughout entire navigation system
   - **Test Suite Fixes**: Fixed all failing tests after component updates, ensuring comprehensive test coverage with 235 passing tests
   - **Backward Compatibility**: Added fallback support in breadcrumb component to handle both new format (with id) and legacy test format
   - **Consistent Navigation Experience**: Achieved uniform simple book name usage across breadcrumb, verse selection, display component, and navigation hook
   - **OBS Studio Overlay Enhancements**: Simplified display component to single-line format with verse text and reference combined using tilde separator
   - **Text Size Optimization**: Increased font sizes for better video streaming readability (1.8rem desktop, 1.5rem tablet, 1.3rem mobile)
   - **CSS Specificity Fix**: Made SelectedVerseDisplay CSS more specific to prevent text-shadow and styling conflicts with verse selection components
   - **Layout Simplification**: Changed from two-element layout to single centered text element showing "verse text ~ reference" format
   - **Verse Selection Text Fix**: Updated verse selection buttons to use pure black text (#000000) in light mode and white (#ffffff) in dark mode, removing gray color
   - **Cross-Tab Communication System**: Implemented comprehensive BroadcastChannel API for real-time verse synchronization across browser tabs
   - **Architecture Refinement**: Fixed navigation vs selection architecture - only explicit verse selections broadcast, navigation is visual-only
   - **Book Title Integration**: Enhanced verse selection to use actual Bible data structure for proper book titles instead of hardcoded mapping
   - **Selective Broadcasting**: Clear separation between handleVerseSelected (navigation, no broadcast) and handleVerseDisplaySelect (selection, broadcasts)
   - **localStorage Fallback**: Automatic fallback to localStorage events for older browsers without BroadcastChannel support
   - **Message Filtering**: Prevents tabs from processing their own broadcast messages using origin pathname filtering
   - **Comprehensive Testing**: Maintained 247 tests total with comprehensive book name mapping and display component testing
   - **Simple Book Name Mapping System**: Created comprehensive book name mapping with JSON data file, Python generation script, and JavaScript utility module
   - **Book Names Data Generation**: Implemented `generate_book_names.py` script to create `book_names.json` from Bible structure with all 66 book mappings
   - **Enhanced Display Component**: Updated SelectedVerseDisplay to show simple book names (e.g., "Genesis 1:1") instead of long formal titles
   - **Synchronous Book Name Functions**: Created efficient book name lookup with complete fallback mapping for test environments
   - **Test Architecture Improvements**: Fixed book name cache conflicts in tests with proper mocking and isolated test environment
   - **Debug Cleanup**: Removed all debug console logging from production code while preserving important error and warning logging
   - **Multi-Chapter Reading Experience**: Added seamless chapter navigation with previous/next chapter buttons
   - **Dynamic Chapter Loading**: Implemented on-demand loading of adjacent chapters into the same verse display
   - **Smart Chapter Navigation**: Previous/Next buttons only appear when adjacent chapters exist
   - **Optimized Data Merging**: Intelligent chapter data merging prevents duplicate fetches and maintains verse state
   - **Cross-Chapter Functionality**: All verse highlighting, selection, and navigation works across multiple chapters
   - **Enhanced Scrolling Architecture**: Restructured VerseDisplay with dedicated scrollable content area and fixed navigation buttons
   - **Multi-Chapter Headers**: Individual chapter headers for each loaded chapter (e.g., "Genesis 1", "Genesis 2")
   - **Auto-scroll to New Chapters**: Automatically scrolls to first verse of newly loaded chapters
   - **Loading State Management**: Chapter navigation buttons disabled during loading operations
   - **Responsive Chapter Navigation**: Mobile-optimized chapter buttons with proper spacing and touch targets
   - **Architecture Refactoring**: Complete extraction of navigation logic from App.jsx into dedicated components and custom hook
   - **Component Separation**: App.jsx reduced from 94 to 39 lines, focusing solely on Bible data loading
   - **Custom Hook Architecture**: Created `useVerseNavigation` hook to encapsulate all navigation state and logic
   - **AppNavigation Component**: New orchestration component handling navigation UI with hook integration
   - **Comprehensive Testing**: Maintained 247 tests including AppNavigation (35 tests), useVerseNavigation (35 tests), SelectedVerseDisplay (22 tests), broadcastChannel (22 tests), and Navigation (22 tests) suites
   - **Clean Architecture**: Complete separation of concerns between data loading, navigation orchestration, and UI components
   - **Folder Reorganization**: Consolidated all navigation components under `src/nav/` folder with proper subfolders
   - **File Movement Tracking**: Used git commands to properly track file movements as renames rather than deletions/additions
   - **State Management Improvements**: Centralized navigation state in custom hook with proper memoization
   - **Integration Testing**: Comprehensive testing of hook-component integration and state management
   - **Enhanced Testability**: All components fully testable in isolation with comprehensive test suites
   - **Component Reusability**: Navigation architecture can be reused independently of data loading concerns
   - **Verse History System**: Comprehensive localStorage-based history tracking with automatic persistence and restoration
   - **SelectedVerseDisplay Component**: New standalone component for displaying selected verses from localStorage at `/display` route
   - **Independent Verse Display**: Component works independently of main navigation system with its own loading states and error handling
   - **Enhanced Routing**: Added `/display` route for dedicated verse viewing with React Router integration
   - **Comprehensive Component Testing**: Full test coverage for new display component including localStorage integration and error scenarios
   - **Performance Optimization**: All callback functions memoized with useCallback for optimal rendering performance
   - **Custom Messages System Phase 1**: Completed comprehensive foundation with 9 major milestones
     - **Milestone 1**: Implemented customMessages utility with basic CRUD operations and localStorage persistence
     - **Milestone 2**: Added comprehensive data validation and localStorage persistence for message management
     - **Milestone 3**: Implemented event dispatching system for cross-tab synchronization of custom messages
     - **Milestone 4**: Created basic markdownRenderer utility for processing message content
     - **Milestone 5**: Set up MessagesTab component structure with comprehensive sub-tab navigation
     - **Milestone 6**: Implemented complete sub-tab navigation within MessagesTab (Create/Library tabs)
     - **Milestone 7**: Created comprehensive MessageEditor component with full markdown support and message management
     - **Milestone 8**: Successfully integrated Messages tab into main TabbedNavigation component, completing Phase 1 at 89% progress
     - **Milestone 9**: Completed comprehensive Messages Module refactoring - extracted all message-related code into dedicated src/messages/ subfolder with clean architecture, barrel exports, and preserved git history
   - **Fade Transition System**: Implemented smooth fade in/out transitions for verse display changes in OBS overlay component
   - **Dual-Layer Verse Display**: Added temporary verse layer to enable crossfade between old and new verses with CSS Grid stacking
   - **Reference Preservation**: Separate state management for temporary verse references ensures complete fade transitions including text and citations
   - **CSS Grid Layout**: Replaced absolute positioning with CSS Grid for reliable verse positioning and proper padding respect in OBS overlay
   - **SearchHistory Component**: Comprehensive verse history navigation component with complete functionality
   - **History Management Features**: Clear all history, individual item removal, and clickable verse navigation with timestamps
   - **Split Verse History Support**: Intelligent handling of split verse parts (9a, 9b) with automatic navigation to base verses
   - **Responsive History Layout**: Mobile-optimized design with stacked header layout and adaptive button sizing
   - **History Accessibility**: Complete ARIA support, semantic HTML structure, keyboard navigation, and screen reader compatibility
   - **Integration Testing**: Comprehensive integration tests (7 tests) with useVerseNavigation hook and navigation lifecycle
   - **History Component Testing**: Full unit test coverage (23 tests) including timestamp formatting, error handling, and user interactions
   - **Storybook History Stories**: Complete story collection covering empty states, loading states, responsive design, and dark mode
   - **LocalStorage Integration**: Seamless integration with existing verseHistory utility for persistent history management

4. **Storybook Stories**:
   - Component isolation and development
   - Multiple story variants (Default, Complete, Loading, WithInteraction, ResponsiveTest, DarkModePreview)
   - Mock data for consistent development experience
   - Breadcrumb stories covering all navigation states and edge cases
   - SearchHistory stories covering multiple scenarios:
     - Default history display with sample verse data
     - Empty history state with helpful messaging
     - Single item and large history datasets for layout testing
     - Interactive examples with verse selection and history clearing
     - Timestamp formatting demonstrations (recent vs. old verses)
     - Responsive design testing across mobile, tablet, and desktop
     - Dark mode preview with proper theme styling
     - Loading state with accessibility features
   - Navigation stories covering complete navigation flow and edge cases
   - VerseDisplay stories demonstrating verse content display, selection, and scrolling behavior
   - SelectedVerseDisplay stories covering localStorage integration, loading states, error scenarios, and user interactions
   - Interactive examples demonstrating navigation callbacks
   - Comprehensive documentation for all navigation and content display components

## Data Processing

### Bible Data Pipeline

The application includes Python scripts for processing Bible data:

#### 1. Structure Extraction (`parse_kjv_bible.py`)
- **Input**: Complete KJV XML file with Strong's numbers
- **Processing**: Extracts book structure, chapters, and verse counts
- **Output**: 
  - Structured JSON metadata (`kjv_structure.json`)
  - Individual chapter XML files organized by book

#### 2. Verse Extraction (`extract_verses_to_json.py`)
- **Input**: Individual chapter XML files from `output_chapters/`
- **Processing**: 
  - Parses each XML file line by line (verses are on single lines)
  - Extracts OSIS IDs from verse markers
  - Extracts plain text from `<ns1:w>` and `<ns1:transChange>` tags
  - Ignores `<ns1:note>` tags and their content
  - **Intelligent Verse Splitting**: Automatically splits verses longer than 200 characters into optimally-sized parts
  - **Multi-Part Support**: Creates 2, 3, or more parts as needed (e.g., 9a, 9b, 9c) for balanced readability
  - **Smart Splitting Algorithm**: Calculates optimal number of parts, splits at sentence boundaries when possible, falls back to word boundaries
  - **Even Distribution**: Aims for approximately equal-sized parts rather than simple binary splits
- **Output**: JSON files with verse text in `output_chapters_json/`
- **Split Verse Examples**: Esther 8:9 becomes "Esth.8.9a", "Esth.8.9b", and "Esth.8.9c" for optimal readability
- **Total Files Processed**: 1,189 chapter files across 66 books

#### 3. Book Names Generation (`generate_book_names.py`)
- **Input**: Bible structure JSON file (`kjv_structure.json`)
- **Processing**: 
  - Extracts book IDs from Old and New Testament structure
  - Maps formal book titles to commonly used simple names
  - Complete manual mapping for all 66 Bible books
  - Handles complex cases like "THE FIRST BOOK OF MOSES CALLED GENESIS" → "Genesis"
- **Output**: Simple book name mapping JSON file (`book_names.json`)
- **Integration**: Used by JavaScript `bookNames.js` utility for display components

### XML Structure

Chapter XML files follow OSIS standard:
- Namespace: `http://www.bibletechnologies.net/2003/OSIS/namespace`
- Contains Strong's lemma references and morphological data
- Structured with book, chapter, and verse elements
- Includes textual variants and study notes

## Development Workflow

### Component Development
1. Create component in appropriate directory with `index.jsx`
2. Add comprehensive CSS file with responsive design
3. Write extensive test suite covering all functionality
4. Create Storybook stories for component documentation
5. Export component and integrate with main application

### Testing Workflow
1. Write tests following Testing Library best practices
2. Achieve high test coverage (current target: 90%+)
3. Test user interactions, edge cases, and accessibility
4. Use Storybook for visual testing and component development

### Code Quality
- **ESLint**: Configured with React best practices
- **File Structure**: Organized by feature/component
- **Naming**: Consistent PascalCase for components, camelCase for functions
- **CSS**: BEM-inspired naming with category-based organization

## Configuration Files

### Build Configuration
- **Vite** (`vite.config.js`): React plugin, development server
- **Jest** (`jest.config.js`): Testing environment, coverage, transforms
- **ESLint** (`eslint.config.js`): React hooks, refresh, and best practices

### Development Environment
- **VS Code Settings**: Enhanced Jest integration with improved test discovery
  - Jest extension configuration with `jest.testExplorer` settings
  - Test runner commands and auto-run settings
  - File associations for test files (.test.jsx, .spec.jsx)
  - Search and watcher exclusions for better performance
- **Storybook**: React-Vite framework with docs addon

### VS Code Jest Extension Configuration
The `.vscode/settings.json` includes optimized settings for Jest test discovery:
- `jest.jestCommandLine`: Uses npm test command
- `jest.testExplorer.showClassicStatus`: Enables classic test status display  
- `jest.runMode`: Set to on-demand for better performance
- `jest.useDashedArgs`: Proper argument passing to Jest

## Application Flow

### User Navigation Experience
The application provides a tabbed interface system with organized Bible navigation, verse history access, staged verse management, and custom message functionality:

1. **Initial State**: User sees TabbedNavigation with Reference tab active, showing BibleBookSelector for Bible navigation
2. **Tab Access**: Four always-visible tabs - Reference (🔍) for browsing, History (🕐) for verse history, Stage (📋) for staged verses, and Messages (💬) for custom messages
3. **Reference Tab Navigation**:
   - Book selection → ChapterSelector appears with breadcrumb "📖 Books › Genesis"
   - Chapter selection → VerseSelect appears with breadcrumb "📖 Books › Genesis › Chapter 1"
   - Verse navigation → Interface switches to VerseDisplay with orange navigation highlight
4. **History Tab Access**: Users can switch to History tab to view and navigate to previously selected verses
5. **Stage Tab Access**: Users can switch to Stage tab to manage and navigate to staged verses for study preparation
6. **Messages Tab Access**: Users can switch to Messages tab to create custom messages with sub-tabs for Create and Library
7. **Cross-Tab Navigation**: Selecting verses from History or Stage tabs automatically switches to Reference tab and navigates
8. **Navigation Feedback**: Navigated verse gets fast orange pulse animation (0.6s) that auto-clears after 0.8s without selection
9. **Explicit Selection**: Users must click verses within VerseDisplay to select them (blue highlight)
10. **Verse Interaction**: Clear distinction between navigation (orange, temporary) and selection (blue, persistent)
11. **Back Navigation**: Prominent "← Back to Books" button returns to navigation while staying on Reference tab
12. **Hierarchical Navigation**: Breadcrumb provides contextual navigation within the Reference tab interface
13. **Tab Persistence**: Tab bar remains visible in all states for consistent access to all functionality
14. **Custom Messages Workflow**: Messages tab provides complete sub-tab interface for creating and managing custom Bible study messages

### State Management Architecture
- **App-level State**: `bibleData`, `selectedScripture`, `verseData`, `loadingVerses`, `navigatedVerse`, `selectedVerse`
- **View State**: Simple conditional rendering between Navigation and VerseDisplay components
- **Navigation State**: Managed internally by Navigation component with callback integration
- **Verse State Separation**: 
  - `navigatedVerse`: Temporary orange highlighting for navigation-only feedback
  - `selectedVerse`: Persistent blue highlighting for user-selected verses
  - Clear distinction between navigation and selection actions
- **Data Flow**: Navigation triggers App-level verse data loading and view switching with navigation highlighting
- **Clean Reset**: `handleBackToBooks()` clears all selections and returns to navigation view
- **Conditional Rendering**: Single view system - either Navigation OR VerseDisplay, never both
- **Event Propagation**: 
  - Navigation → App: `handleVerseSelected` with scripture reference (switches to verse view with navigation highlight)
  - VerseDisplay → App: `handleVerseDisplaySelect` for explicit verse selection within content
  - Back Button → App: `handleBackToBooks` to return to navigation view
- **Dynamic Data Loading**: Chapter JSON files loaded on-demand when verses are navigated to
- **Highlight Management**: Navigation highlights auto-clear after 0.8s, selection highlights persist until changed
- **Error Handling**: Graceful handling of verse loading failures with error states

## Key Features

1. **Client-Side Routing**: React Router integration with clean URL-based navigation including dedicated `/display` route for verse viewing
2. **Cross-Tab Synchronization**: Real-time verse selection synchronization across multiple browser tabs using BroadcastChannel API with localStorage fallback
3. **Standalone Verse Display**: Independent SelectedVerseDisplay component at `/display` route that remains unaffected by navigation changes
4. **Tabbed Navigation Interface**: Organized navigation with Reference tab (🔍) for Bible browsing and History tab (🕐) for verse history
5. **Always-Visible Tab Access**: Tab bar remains visible in all navigation states for consistent access to both browsing and history
6. **Cross-Tab Navigation Flow**: History selections automatically switch to reference tab and navigate to verses seamlessly
7. **Minimalist Navigation**: Clean navigation path (Books › Book › Chapter) with smart contextual controls within Reference tab
8. **Comprehensive Verse Selection**: Handles all verse counts from 0 (rare) to 176 (Psalm 119)  
9. **Navigation-Only Verse Display**: Bible reference navigation shows verse content with visual highlighting but no automatic selection - users must explicitly click verses to select them
10. **Simple Back Navigation**: Prominent back button to return to Bible navigation while staying within Reference tab
11. **Unified Interface**: Tabbed organization maintains context while providing easy access to both navigation and history
12. **Responsive Design**: Adapts from mobile to desktop with proper button and layout scaling including mobile-optimized tab layout
13. **Multi-Chapter Reading Experience**: Load adjacent chapters into the same view for seamless reading
14. **Smart Chapter Navigation**: Previous/Next chapter buttons with intelligent visibility based on book structure
15. **Dynamic Content Loading**: On-demand loading of chapter content when verses are selected or chapters are navigated
16. **Optimized Chapter Loading**: Prevents duplicate chapter fetches and intelligently merges content
17. **Cross-Chapter Functionality**: All verse highlighting, selection, and navigation works seamlessly across multiple chapters
18. **Dark Mode Support**: System preference detection and manual override for all components including tabbed interface
19. **Accessibility Excellence**: Full ARIA support, keyboard navigation, meaningful titles, semantic HTML structure with proper tab/tabpanel relationships
20. **Performance**: Component-level CSS, efficient rendering, lazy loading ready, clean component hierarchy with smooth tab transitions
21. **Testability**: Each component fully testable in isolation with comprehensive test coverage
22. **Developer Experience**: Hot reload, comprehensive testing (248 tests), component isolation, Storybook documentation
23. **Advanced Navigation System**: Fast orange pulse animation (0.6s) plus persistent subtle reminders for navigated verses, with global clearing on selection
24. **Callback Integration**: Verse selection callback system enabling custom navigation actions and application extensions
25. **Search History Management**: Comprehensive verse history display with clickable navigation, individual item removal, and complete history clearing
26. **Split Verse History Support**: Intelligent handling of split verse parts (9a, 9b) in history with automatic navigation to base verses
27. **History Accessibility**: Full screen reader support with ARIA labels, semantic structure, and keyboard navigation for history management

## Future Development Considerations

### Potential Enhancements
- **Verse Content Display**: Show actual verse text content when verse is selected
- **Search functionality**: Full-text search across Bible content with verse-level results
- **Bookmarking System**: Save and manage favorite verses with personal notes
- **Cross-Reference System**: Display related verses and biblical cross-references
- **Audio Bible Integration**: Play audio for selected chapters/verses
- **Multiple Translation Support**: Compare different Bible translations side-by-side
- **Study Tools**: Concordance, Strong's numbers, commentary integration

### Technical Improvements
- TypeScript migration for better type safety
- React Query for advanced data fetching
- Component library extraction
- Progressive Web App features
- Internationalization support

## Working with This Codebase

### Quick Start for New Features
1. Examine existing component structure in `src/book-selection/`
2. Follow established patterns for styling and testing
3. Use Storybook for component development and testing
4. Run test suite to ensure no regressions
5. Update documentation as needed

### Debugging and Development
- Use React Developer Tools for component inspection
- Jest watch mode for test-driven development (`npm run test:watch`)
- Storybook for isolated component development
- Browser DevTools for responsive design testing
- VS Code Jest extension for integrated test running and debugging
- Clear Jest cache with `npm test -- --clearCache` if test discovery issues occur

### Code Standards
- Follow existing naming conventions and file structure
- Maintain high test coverage for all new components
- Use semantic HTML and accessibility best practices
- Implement responsive design for all UI components
- Document component props and behavior in Storybook stories

This codebase represents a well-structured, tested, and documented React application with clean architectural separation and minimalist navigation system. The Navigation component encapsulates all Bible browsing functionality with extensible callback integration for scripture reference handling. The ultra-clean breadcrumb navigation system provides a modern, accessible, and intuitive user experience with no redundant displays, stopping at the chapter level for maximum simplicity. The callback system enables custom application features like content loading, URL management, and navigation actions while maintaining a clutter-free interface. The architecture maintains clear separation of concerns with comprehensive test coverage and excellent developer experience.