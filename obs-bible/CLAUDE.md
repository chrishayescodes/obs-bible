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
│   │   ├── BibleBookSelector.test.jsx  # Comprehensive test suite
│   │   └── BibleBookSelector.stories.jsx # Storybook stories
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
- Manages global state for selected book and Bible data
- Handles data fetching from `/data/kjv_structure.json`
- Implements loading states and error handling
- Renders book selection interface and selected book information

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

### Styling Architecture

The application uses a comprehensive CSS architecture:

1. **Global Styles** (`src/index.css`):
   - CSS custom properties for theming
   - Dark mode support via `prefers-color-scheme` and `.dark` class
   - Typography and base element styling

2. **Application Styles** (`src/App.css`):
   - Layout for main application components
   - Selected book information display
   - Loading state styling

3. **Component Styles** (`src/book-selection/BibleBookSelector.css`):
   - Responsive grid system
   - Category-based color theming (10 categories)
   - Interactive states (hover, focus, selected)
   - Mobile-responsive breakpoints

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

The project implements comprehensive testing:

1. **Unit Tests** (`BibleBookSelector.test.jsx`):
   - Component rendering and behavior
   - User interactions and event handling
   - Edge cases and error conditions
   - Accessibility features
   - 90+ test cases covering all functionality

2. **Test Configuration**:
   - **Environment**: jsdom for DOM simulation
   - **Setup**: `@testing-library/jest-dom` for enhanced assertions
   - **Coverage**: Excludes Storybook files and setup files
   - **Mocking**: CSS imports mocked for testing

3. **Storybook Stories**:
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
- **VS Code Settings**: Jest integration, test explorer, file associations
- **Storybook**: React-Vite framework with docs addon

## Key Features

1. **Responsive Design**: Adapts from mobile (3 columns) to desktop (12+ columns)
2. **Dark Mode Support**: System preference detection and manual override
3. **Accessibility**: Keyboard navigation, screen reader support, meaningful titles
4. **Performance**: Component-level CSS, efficient rendering, lazy loading ready
5. **Developer Experience**: Hot reload, comprehensive testing, component isolation

## Future Development Considerations

### Potential Enhancements
- Chapter and verse navigation components
- Search functionality across Bible text
- Bookmarking and note-taking features
- Cross-reference system
- Audio Bible integration
- Multiple translation support

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
- Jest watch mode for test-driven development
- Storybook for isolated component development
- Browser DevTools for responsive design testing

### Code Standards
- Follow existing naming conventions and file structure
- Maintain high test coverage for all new components
- Use semantic HTML and accessibility best practices
- Implement responsive design for all UI components
- Document component props and behavior in Storybook stories

This codebase represents a well-structured, tested, and documented React application with clear patterns for extension and maintenance.