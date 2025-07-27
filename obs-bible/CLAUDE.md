# OSB Bible Application - Claude Development Guide

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
│   │   ├── parse_kjv_bible.py          # Python script for data processing
│   │   ├── extract_verses_to_json.py   # Python script to extract verses from XML to JSON
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
│   │       └── navigation/             # Navigation container component
│   │           ├── index.jsx           # Navigation component
│   │           ├── Navigation.css      # Component-specific styling
│   │           ├── Navigation.test.jsx # Comprehensive test suite (25 tests)
│   │           └── Navigation.stories.jsx # Storybook stories
│   ├── utils/                          # Utility modules
│   │   ├── verseHistory.js             # Verse history localStorage utility
│   │   └── verseHistory.test.js        # Comprehensive test suite (27 tests)
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
   - Generated from XML files using `extract_verses_to_json.py`
   - Example structure:
     ```json
     {
       "Gen.1.1": "In the beginning God created the heaven and the earth.",
       "Gen.1.2": "And the earth was without form, and void...",
       ...
     }
     ```

### Component Architecture

#### Main Application (`App.jsx`)
- **Routing Architecture**: React Router integration with client-side navigation
- **Route Structure**: 
  - `/` - Main application with navigation and loading states (default route)
  - `*` - Fallback route redirects to main application
- **Data Fetching**: 
  - Loads Bible structure from `/data/kjv_structure.json`
  - Handles loading states and error conditions gracefully
  - Loading state integrated within routing components
- **Clean Separation**: All navigation logic extracted into dedicated components
- **Component Integration**: 
  - Uses React Router's Routes and Route components
  - Renders `AppNavigation` component after data loads
  - Passes `bibleData` prop to navigation system
  - Conditional rendering with ternary operator within MainApp component (loading ? LoadingScreen : AppNavigation)
- **Error Handling**: Graceful error logging with fallback rendering

#### AppNavigation Component (`src/nav/AppNavigation.jsx`)
- **Navigation Orchestration**: Centralized navigation UI management using custom hook
- **Hook Integration**: Uses `useVerseNavigation` for all navigation state and logic
- **View Management**: Conditional rendering between navigation and verse display modes
- **State Restoration**: Automatically restores current verse when Bible data loads
- **Component Architecture**: 
  - Renders `Navigation` component for Bible browsing
  - Switches to `VerseDisplay` component when verses are selected
  - Includes back button to return to navigation
  - Handles loading and error states for verse content
- **Props**:
  - `bibleData`: Complete Bible structure object passed from App

#### Navigation Hook (`src/nav/useVerseNavigation.js`)
- **State Management**: Manages all verse navigation state internally
  - `selectedScripture`, `verseData`, `loadingVerses`, `navigatedVerse`, `selectedVerse`, `loadedChapters`
- **Verse Selection Logic**: `handleVerseSelected` callback implementation
  - Receives complete scripture reference object when verses are selected
  - Loads corresponding JSON chapter file for verse content
  - Creates OSIS ID for verse highlighting and auto-scroll
  - Switches interface to verse display mode
  - Handles loading states and error conditions during verse fetch
  - Integrates with verse history system automatically
- **Chapter Navigation Logic**: Multi-chapter loading and management
  - `loadAdjacentChapter()`: Core function for loading previous/next chapters
  - `handlePreviousChapter()`: Loads previous chapter and scrolls to first verse
  - `handleNextChapter()`: Loads next chapter and scrolls to first verse
  - `getAdjacentChapterInfo()`: Determines if previous/next chapters exist
  - `loadedChapters`: Set tracking which chapters have been loaded to prevent duplicates
  - **Smart Loading**: Only fetches chapters that haven't been loaded yet
  - **Data Merging**: Combines new chapter data with existing verse data seamlessly
  - **Auto-scroll**: Automatically navigates to first verse of newly loaded chapters
- **Back Navigation**: `handleBackToBooks()` function clears selections and returns to navigation
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

The project implements comprehensive testing with 200 total tests (all passing):

1. **Unit Tests**:
   - **BibleBookSelector**: 21 tests covering component rendering, user interactions, accessibility, and edge cases
   - **ChapterSelector**: 20 tests covering component state management, user events, and error handling
   - **VerseSelect**: 22 tests covering verse selection, edge cases (0-176 verses), and prop changes
   - **Breadcrumb**: 22 tests covering navigation states, user interactions, accessibility, and edge cases
   - **Navigation**: 25 tests covering complete navigation flow, state management, integration, callback functionality, and edge cases
   - **VerseDisplay**: 25 tests covering verse rendering, navigation highlighting, persistent reminders, selection clearing, auto-scroll, accessibility, and edge cases
   - **verseHistory**: 27 tests covering localStorage functionality, history management, error handling, and data integrity
   - **App**: 13 tests covering simplified architecture, Bible data loading, AppNavigation integration, and error handling
   - **AppNavigation**: 35 tests covering navigation orchestration, hook integration, component rendering states, and user interactions
   - **useVerseNavigation**: 35 tests covering custom hook state management, verse selection logic, history integration, and memoization
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
   - **Comprehensive Testing**: Expanded to 200 tests including new AppNavigation (35 tests) and useVerseNavigation (35 tests) suites
   - **Clean Architecture**: Complete separation of concerns between data loading, navigation orchestration, and UI components
   - **Folder Reorganization**: Consolidated all navigation components under `src/nav/` folder with proper subfolders
   - **File Movement Tracking**: Used git commands to properly track file movements as renames rather than deletions/additions
   - **State Management Improvements**: Centralized navigation state in custom hook with proper memoization
   - **Integration Testing**: Comprehensive testing of hook-component integration and state management
   - **Enhanced Testability**: All components fully testable in isolation with comprehensive test suites
   - **Component Reusability**: Navigation architecture can be reused independently of data loading concerns
   - **Verse History System**: Comprehensive localStorage-based history tracking with automatic persistence and restoration
   - **Performance Optimization**: All callback functions memoized with useCallback for optimal rendering performance

4. **Storybook Stories**:
   - Component isolation and development
   - Multiple story variants (Default, Complete, Loading, WithInteraction, ResponsiveTest, DarkModePreview)
   - Mock data for consistent development experience
   - Breadcrumb stories covering all navigation states and edge cases
   - Navigation stories covering complete navigation flow and edge cases
   - VerseDisplay stories demonstrating verse content display, selection, and scrolling behavior
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
- **Output**: JSON files with verse text in `output_chapters_json/`
- **Total Files Processed**: 1,189 chapter files across 66 books

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
The application provides a simple two-view system with complete Bible navigation and verse content display:

1. **Initial State**: User sees BibleBookSelector for Bible navigation
2. **Book Selection**: User clicks a book → ChapterSelector appears with breadcrumb "📖 Books › Genesis"
3. **Chapter Selection**: User clicks a chapter → VerseSelect appears with breadcrumb "📖 Books › Genesis › Chapter 1"
4. **Verse Navigation**: User clicks a verse → Interface switches to VerseDisplay showing full chapter content with orange navigation highlight
5. **Navigation Feedback**: Navigated verse gets fast orange pulse animation (0.6s) that auto-clears after 0.8s without selection
6. **Explicit Selection**: Users must click verses within VerseDisplay to select them (blue highlight)
7. **Verse Interaction**: Clear distinction between navigation (orange, temporary) and selection (blue, persistent)
8. **Back Navigation**: Prominent "← Back to Books" button returns to navigation, clearing all selections
9. **Hierarchical Navigation**: Breadcrumb provides contextual navigation within the navigation view

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

1. **Client-Side Routing**: React Router integration with clean URL-based navigation
2. **Minimalist Navigation**: Clean navigation path (Books › Book › Chapter) with smart contextual controls
3. **Comprehensive Verse Selection**: Handles all verse counts from 0 (rare) to 176 (Psalm 119)  
4. **Navigation-Only Verse Display**: Bible reference navigation shows verse content with visual highlighting but no automatic selection - users must explicitly click verses to select them
5. **Simple Back Navigation**: Prominent back button to return to Bible navigation from any verse display
6. **Single-View Interface**: Either navigation OR verse content - never both simultaneously for focused experience
7. **Responsive Design**: Adapts from mobile to desktop with proper button and layout scaling
8. **Multi-Chapter Reading Experience**: Load adjacent chapters into the same view for seamless reading
9. **Smart Chapter Navigation**: Previous/Next chapter buttons with intelligent visibility based on book structure
10. **Dynamic Content Loading**: On-demand loading of chapter content when verses are selected or chapters are navigated
11. **Optimized Chapter Loading**: Prevents duplicate chapter fetches and intelligently merges content
12. **Cross-Chapter Functionality**: All verse highlighting, selection, and navigation works seamlessly across multiple chapters
13. **Dark Mode Support**: System preference detection and manual override for all components including breadcrumb
14. **Accessibility Excellence**: Full ARIA support, keyboard navigation, meaningful titles, semantic HTML structure
15. **Performance**: Component-level CSS, efficient rendering, lazy loading ready, clean component hierarchy
16. **Testability**: Each component fully testable in isolation with comprehensive test coverage
17. **Developer Experience**: Hot reload, comprehensive testing (200 tests), component isolation, Storybook documentation
18. **Advanced Navigation System**: Fast orange pulse animation (0.6s) plus persistent subtle reminders for navigated verses, with global clearing on selection
19. **Callback Integration**: Verse selection callback system enabling custom navigation actions and application extensions

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