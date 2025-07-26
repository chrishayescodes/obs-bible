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
│   ├── book-selection/                 # Bible book selector component
│   │   ├── index.jsx                   # BibleBookSelector component
│   │   ├── BibleBookSelector.css       # Component-specific styling
│   │   ├── BibleBookSelector.test.jsx  # Comprehensive test suite (21 tests)
│   │   └── BibleBookSelector.stories.jsx # Storybook stories
│   ├── chapter-selection/              # Chapter selector component
│   │   ├── index.jsx                   # ChapterSelector component
│   │   ├── ChapterSelector.css         # Component-specific styling
│   │   ├── ChapterSelector.test.jsx    # Comprehensive test suite (20 tests)
│   │   └── ChapterSelector.stories.jsx # Storybook stories
│   ├── verse-selection/                # Verse selector component
│   │   ├── index.jsx                   # VerseSelect component
│   │   ├── VerseSelect.css             # Component-specific styling
│   │   ├── VerseSelect.test.jsx        # Comprehensive test suite (22 tests)
│   │   └── VerseSelect.stories.jsx     # Storybook stories
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
- **State Management**: Manages `selectedBook`, `selectedChapter`, `selectedVerse`, and `bibleData` state
- **Data Fetching**: Loads Bible structure from `/data/kjv_structure.json`
- **Three-Level Navigation Flow**: Implements book → chapter → verse selection with hierarchical back navigation
- **User Interface**: 
  - Shows BibleBookSelector when no selections made
  - Shows ChapterSelector when book selected (no chapter)
  - Shows VerseSelect when book + chapter selected
  - Displays selected verse information (Book Chapter:Verse format)
  - Provides contextual back navigation ("Back to Books", "Back to Chapters")
- **Event Handling**: 
  - `handleBookSelect`: Sets selected book, resets chapter + verse selection
  - `handleChapterSelect`: Sets selected chapter, resets verse selection  
  - `handleVerseSelect`: Sets selected verse for display
- **Loading States**: Handles loading and error states during data fetch

#### BibleBookSelector Component (`src/book-selection/`)
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

#### ChapterSelector Component (`src/chapter-selection/`)
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

#### VerseSelect Component (`src/verse-selection/`)
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

### Styling Architecture

The application uses a comprehensive CSS architecture:

1. **Global Styles** (`src/index.css`):
   - CSS custom properties for theming
   - Dark mode support via `prefers-color-scheme` and `.dark` class
   - Typography and base element styling

2. **Application Styles** (`src/App.css`):
   - Layout for main application components
   - Selected verse information display (`.selected-info`) showing "Book Chapter:Verse"
   - Navigation view containers (`.chapter-view`, `.verse-view`)
   - Back navigation buttons (`.back-button`) with contextual text and hover effects
   - Loading state styling
   - Dark mode support for all navigation elements

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

The project implements comprehensive testing with 63 passing tests:

1. **Unit Tests**:
   - **BibleBookSelector**: 21 tests covering component rendering, user interactions, accessibility, and edge cases
   - **ChapterSelector**: 20 tests covering component state management, user events, and error handling
   - **VerseSelect**: 22 tests covering verse selection, edge cases (0-176 verses), and prop changes
   - Component rendering and behavior validation
   - User interactions and event handling
   - Edge cases and error conditions (including zero verses, invalid data)
   - Accessibility features and keyboard navigation
   - State management and prop changes

2. **Test Configuration**:
   - **Environment**: jsdom for DOM simulation
   - **Setup**: `@testing-library/jest-dom` for enhanced assertions
   - **Coverage**: Excludes Storybook files and setup files
   - **Mocking**: CSS imports mocked for testing
   - **VS Code Integration**: Enhanced Jest extension settings for test discovery

3. **Recent Updates** (Latest):
   - **Complete Navigation System**: Added VerseSelect component for three-level navigation (Book → Chapter → Verse)
   - **Enhanced State Management**: Implemented cascading state reset across all navigation levels
   - **Contextual Back Navigation**: Added "Back to Chapters" and "Back to Books" with proper state handling
   - **Comprehensive Testing**: Expanded to 63 tests covering all edge cases (0-176 verses)
   - **Verse Selection UI**: Optimized grid layout for verse selection with responsive design
   - **App Integration**: Complete integration of all three components with proper conditional rendering

4. **Storybook Stories**:
   - Component isolation and development
   - Multiple story variants (Default, Complete, Loading, WithInteraction)
   - Mock data for consistent development experience

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
The application provides a complete three-level navigation system:

1. **Initial State**: User sees the BibleBookSelector with all 66 Bible books organized by testament
2. **Book Selection**: User clicks a book → ChapterSelector appears with "Back to Books" button
3. **Chapter Selection**: User clicks a chapter → VerseSelect appears with "Back to Chapters" button  
4. **Verse Selection**: User clicks a verse → Selected verse info displays (Book Chapter:Verse format)
5. **Hierarchical Navigation**: Back buttons provide contextual navigation to previous levels

### State Management Architecture
- **App-level State**: `selectedBook`, `selectedChapter`, `selectedVerse`, `bibleData`
- **Cascading Reset**: Verse selection resets when chapter changes; both reset when book changes
- **Conditional Rendering**: Three-level conditional logic determines which component renders
- **Event Propagation**: Child components communicate via callback props with automatic state management

## Key Features

1. **Complete Three-Level Navigation**: Book → Chapter → Verse selection with hierarchical back navigation
2. **Comprehensive Verse Selection**: Handles all verse counts from 0 (rare) to 176 (Psalm 119)
3. **Responsive Design**: Adapts from mobile to desktop with proper button wrapping across all levels
4. **Cascading State Management**: Automatic state reset with proper hierarchy (verse resets on chapter change, etc.)
5. **Contextual Navigation**: Smart back buttons ("Back to Books", "Back to Chapters") with proper state management
6. **Dark Mode Support**: System preference detection and manual override for all components
7. **Accessibility**: Keyboard navigation, screen reader support, meaningful titles across all navigation levels
8. **Performance**: Component-level CSS, efficient rendering, lazy loading ready
9. **Developer Experience**: Hot reload, comprehensive testing (63 tests), component isolation

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

This codebase represents a well-structured, tested, and documented React application with clear patterns for extension and maintenance.