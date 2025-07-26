# OSB Bible Application - Claude Development Guide

## Project Overview

The OSB (Open Source Bible) Bible project is a React-based web application for browsing and interacting with Bible content. The application is built using modern web technologies with a focus on responsive design, comprehensive testing, and component-driven development.

### Technology Stack

- **Frontend Framework**: React 19.1.0 with React DOM 19.1.0
- **Build Tool**: Vite 7.0.4 with hot module replacement (HMR)
- **Testing**: Jest 30.0.5 with Testing Library (@testing-library/react, @testing-library/jest-dom)
- **Component Development**: Storybook 9.0.18 for isolated component development and documentation
- **Linting**: ESLint 9.30.1 with React-specific plugins
- **Styling**: Pure CSS with category-based color theming and responsive design
- **Data Format**: JSON structure for Bible metadata and XML files for chapter content

## Project Structure

```
obs-bible/
├── public/
│   ├── data/
│   │   ├── kjv_structure.json          # Bible structure and metadata
│   │   ├── kjvfull.xml                 # Complete KJV Bible XML
│   │   ├── parse_kjv_bible.py          # Python script for data processing
│   │   └── output_chapters/            # Individual chapter XML files (66 books)
│   │       ├── Gen/                    # Genesis chapters (Gen_1.xml to Gen_50.xml)
│   │       ├── Matt/                   # Matthew chapters (Matt_1.xml to Matt_28.xml)
│   │       └── ... (all 66 Bible books)
├── src/
│   ├── App.jsx                         # Main application component
│   ├── main.jsx                        # React application entry point
│   ├── ref-nav/                        # Reference navigation components folder
│   │   ├── book-selection/             # Bible book selector component
│   │   │   ├── index.jsx               # BibleBookSelector component
│   │   │   ├── BibleBookSelector.css   # Component-specific styling
│   │   │   ├── BibleBookSelector.test.jsx # Comprehensive test suite (21 tests)
│   │   │   └── BibleBookSelector.stories.jsx # Storybook stories
│   │   ├── chapter-selection/          # Chapter selector component
│   │   │   ├── index.jsx               # ChapterSelector component
│   │   │   ├── ChapterSelector.css     # Component-specific styling
│   │   │   ├── ChapterSelector.test.jsx # Comprehensive test suite (20 tests)
│   │   │   └── ChapterSelector.stories.jsx # Storybook stories
│   │   ├── verse-selection/            # Verse selector component
│   │   │   ├── index.jsx               # VerseSelect component
│   │   │   ├── VerseSelect.css         # Component-specific styling
│   │   │   ├── VerseSelect.test.jsx    # Comprehensive test suite (22 tests)
│   │   │   └── VerseSelect.stories.jsx # Storybook stories
│   │   ├── breadcrumb/                 # Breadcrumb navigation component
│   │   │   ├── index.jsx               # Breadcrumb component
│   │   │   ├── Breadcrumb.css          # Component-specific styling
│   │   │   ├── Breadcrumb.test.jsx     # Comprehensive test suite (22 tests)
│   │   │   └── Breadcrumb.stories.jsx  # Storybook stories
│   │   └── navigation/                 # Navigation container component
│   │       ├── index.jsx               # Navigation component
│   │       ├── Navigation.css          # Component-specific styling
│   │       ├── Navigation.test.jsx     # Comprehensive test suite (25 tests)
│   │       └── Navigation.stories.jsx  # Storybook stories
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

The application uses a two-tier data architecture:

1. **Bible Structure JSON** (`/public/data/kjv_structure.json`):
   - Hierarchical structure: `old_testament` and `new_testament`
   - Each testament contains `books` with metadata
   - Book metadata includes: `title`, `category`, `chapter_count`, `total_verses`, and `chapters` object
   - Categories: Pentateuch, Historical, Poetry, Major Prophets, Minor Prophets, Gospels, History, Pauline Epistles, General Epistles, Prophecy

2. **Chapter XML Files** (`/public/data/output_chapters/`):
   - Individual XML files for each chapter (e.g., `Gen_1.xml`)
   - OSIS XML format with Strong's numbers and morphological analysis
   - Contains structured verse data with lemma and morphological information

### Component Architecture

#### Main Application (`App.jsx`)
- **State Management**: Manages `bibleData` state and loading state only
- **Data Fetching**: Loads Bible structure from `/data/kjv_structure.json`
- **Simple Architecture**: Clean separation of concerns with Navigation component handling all navigation logic
- **User Interface**: 
  - Shows loading state while Bible data loads
  - Renders Navigation component with Bible data once loaded
  - Minimal, focused responsibility for data loading and high-level layout
- **Loading States**: Handles loading and error states during data fetch
- **Component Integration**: Delegates all navigation functionality to Navigation component
- **Verse Selection Callback**: Implements `handleVerseSelected` callback to receive scripture references
  - Receives complete scripture reference object when verses are selected
  - Provides extension point for custom navigation logic (content loading, URL updates, etc.)
  - Currently logs selections for debugging and can be extended for application features

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

### Styling Architecture

The application uses a comprehensive CSS architecture:

1. **Global Styles** (`src/index.css`):
   - CSS custom properties for theming
   - Dark mode support via `prefers-color-scheme` and `.dark` class
   - Typography and base element styling

2. **Application Styles** (`src/App.css`):
   - Layout for main application components
   - Navigation view containers (`.chapter-view`, `.verse-view`) with clean layouts
   - Loading state styling
   - Dark mode support for all navigation elements
   - Simplified structure with breadcrumb handling all navigation UI

3. **Component Styles**:
   - **BibleBookSelector** (`src/book-selection/BibleBookSelector.css`):
     - Responsive grid system with category-based color theming
     - Interactive states (hover, focus, selected)
     - Mobile-responsive breakpoints
   - **ChapterSelector** (`src/chapter-selection/ChapterSelector.css`):
     - CSS Grid layout with `auto-fill` for proper row wrapping
     - Simplified button styling with consistent sizing
     - Responsive breakpoints for different screen sizes
     - Fixed button heights to prevent size variations
   - **VerseSelect** (`src/verse-selection/VerseSelect.css`):
     - CSS Grid layout optimized for many verses (minmax 50px-40px responsive)
     - Smaller button sizing suitable for verse numbers
     - Enhanced responsive design for mobile verse selection
     - Proper handling of chapters with 0-176 verses
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

The project implements comprehensive testing with 110 passing tests:

1. **Unit Tests**:
   - **BibleBookSelector**: 21 tests covering component rendering, user interactions, accessibility, and edge cases
   - **ChapterSelector**: 20 tests covering component state management, user events, and error handling
   - **VerseSelect**: 22 tests covering verse selection, edge cases (0-176 verses), and prop changes
   - **Breadcrumb**: 22 tests covering navigation states, user interactions, accessibility, and edge cases
   - **Navigation**: 25 tests covering complete navigation flow, state management, integration, callback functionality, and edge cases
   - Component rendering and behavior validation
   - User interactions and event handling
   - Edge cases and error conditions (including zero verses, invalid data)
   - Accessibility features and keyboard navigation
   - State management and prop changes
   - Navigation flow testing across all breadcrumb states
   - Integration testing between navigation components

2. **Test Configuration**:
   - **Environment**: jsdom for DOM simulation
   - **Setup**: `@testing-library/jest-dom` for enhanced assertions
   - **Coverage**: Excludes Storybook files and setup files
   - **Mocking**: CSS imports mocked for testing
   - **VS Code Integration**: Enhanced Jest extension settings for test discovery

3. **Recent Updates** (Latest):
   - **Minimalist UI Design**: Removed all navigation help displays from individual components (book/chapter/verse headers removed)
   - **Ultra-Clean Breadcrumb**: Removed verse display and chapter info from breadcrumb - navigation stops at chapter level
   - **Streamlined Navigation**: Breadcrumb shows only Books › Book › Chapter (no verse reference or "Chapter has X verses" display)
   - **Verse Selection Callback System**: Added `onVerseSelected` callback to Navigation component for scripture reference handling
   - **Scripture Reference Integration**: Complete scripture reference object passed to callback with book, chapter, verse details
   - **Component Organization**: Moved all navigation components to `src/ref-nav/` folder for better organization
   - **Enhanced Testing**: Expanded to 110 tests with callback functionality testing (25 Navigation tests)
   - **Extensible Architecture**: Callback system enables custom navigation actions (content loading, URL updates, etc.)
   - **Navigation Component Extraction**: Extracted all navigation logic from App.jsx into dedicated Navigation component
   - **Clean Architecture**: App.jsx now focuses solely on data loading, Navigation handles all Bible browsing
   - **Enhanced Testability**: Navigation component fully testable in isolation with comprehensive test suite
   - **Component Reusability**: Navigation can be reused independently of data loading concerns
   - **Unified Breadcrumb Navigation**: Replaced individual back buttons and selected info displays with minimalist Breadcrumb component
   - **Enhanced Navigation UX**: Smart contextual navigation with disabled current view indicators and clickable backward traversal
   - **Minimalist Navigation System**: Book → Chapter selection with clean breadcrumb (no redundant verse displays)
   - **Enhanced State Management**: Implemented cascading state reset with centralized breadcrumb handlers
   - **Accessibility Improvements**: Full ARIA support, keyboard navigation, and meaningful titles throughout breadcrumb
   - **Responsive Breadcrumb Design**: Mobile-optimized navigation with collapsing elements and touch-friendly targets
   - **Separation of Concerns**: Clear architectural boundaries between data loading and navigation functionality

4. **Storybook Stories**:
   - Component isolation and development
   - Multiple story variants (Default, Complete, Loading, WithInteraction, ResponsiveTest, DarkModePreview)
   - Mock data for consistent development experience
   - Breadcrumb stories covering all navigation states and edge cases
   - Navigation stories covering complete navigation flow and edge cases
   - Interactive examples demonstrating navigation callbacks
   - Comprehensive documentation for all navigation components

## Data Processing

### Bible Data Pipeline

The application includes a Python script (`parse_kjv_bible.py`) for processing Bible data:

1. **Input**: Complete KJV XML file with Strong's numbers
2. **Processing**: Extracts book structure, chapters, and verse counts
3. **Output**: 
   - Structured JSON metadata (`kjv_structure.json`)
   - Individual chapter XML files organized by book

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
The application provides a complete three-level navigation system with minimalist unified breadcrumb:

1. **Initial State**: User sees BibleBookSelector with breadcrumb showing "📖 Books" button
2. **Book Selection**: User clicks a book → ChapterSelector appears with breadcrumb "📖 Books › Genesis" (Genesis disabled, Books clickable)
3. **Chapter Selection**: User clicks a chapter → VerseSelect appears with breadcrumb "📖 Books › Genesis › Chapter 1" (Chapter 1 disabled, Books and Genesis clickable)
4. **Verse Selection**: User clicks a verse → Breadcrumb remains "📖 Books › Genesis › Chapter 1" with no additional verse display (minimalist design)
5. **Hierarchical Navigation**: Breadcrumb provides contextual navigation - any previous level is clickable, current level is highlighted and disabled

### State Management Architecture
- **App-level State**: `selectedBook`, `selectedChapter`, `selectedVerse`, `bibleData`
- **Cascading Reset**: Verse selection resets when chapter changes; both reset when book changes
- **Conditional Rendering**: Three-level conditional logic determines which component renders
- **Event Propagation**: Child components communicate via callback props with automatic state management
- **Breadcrumb Navigation Handlers**:
  - `handleBreadcrumbReset`: Clears all selections (returns to books view)
  - `handleBreadcrumbBookSelect`: Clears chapter/verse selections (returns to chapters view for selected book)
  - `handleBreadcrumbChapterSelect`: Clears verse selection (returns to verses view for selected chapter)
- **Centralized Navigation**: All navigation logic flows through breadcrumb component with clean handler delegation

## Key Features

1. **Clean Architecture**: Navigation logic extracted into dedicated component with clear separation of concerns
2. **Minimalist Breadcrumb Navigation**: Clean navigation path (Books › Book › Chapter) with smart contextual controls, stops at chapter level
3. **Comprehensive Verse Selection**: Handles all verse counts from 0 (rare) to 176 (Psalm 119)  
4. **Responsive Design**: Adapts from mobile to desktop with proper button wrapping and breadcrumb collapse
5. **Cascading State Management**: Automatic state reset with proper hierarchy via centralized breadcrumb handlers
6. **Contextual Navigation Intelligence**: Current location disabled, all previous levels clickable for backward traversal
7. **Ultra-Clean UI**: No redundant verse reference or chapter info displays - purely functional navigation
8. **Dark Mode Support**: System preference detection and manual override for all components including breadcrumb
9. **Accessibility Excellence**: Full ARIA support, keyboard navigation, meaningful titles, semantic HTML structure
10. **Performance**: Component-level CSS, efficient rendering, lazy loading ready, clean component hierarchy
11. **Testability**: Each component fully testable in isolation with comprehensive test coverage
12. **Developer Experience**: Hot reload, comprehensive testing (110 tests), component isolation, Storybook documentation
13. **Callback Integration**: Verse selection callback system enabling custom navigation actions and application extensions

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