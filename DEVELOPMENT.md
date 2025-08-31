# Development Guide

Quick reference for development workflow, setup, and daily commands. For complete architecture details, see [CLAUDE.md](./CLAUDE.md).

## Quick Start

### Prerequisites
- Node.js (latest LTS)
- npm (comes with Node.js)
- Git

### Setup
```bash
# Clone repository
git clone <repository-url>
cd obs-bible

# Install dependencies
npm install

# Start development server
npm run dev
```

### Essential Commands
```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Production build
npm run preview          # Preview production build

# Testing  
npm test                 # Run all tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Lint code with ESLint

# Component Development
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook for deployment
```

## Development Workflow

### Daily Development Process
1. **Start Development Environment**:
   ```bash
   npm run dev          # Main application
   npm run storybook    # Component development (optional)
   npm run test:watch   # Test runner (optional)
   ```

2. **Make Changes**:
   - Edit components in `src/` directory
   - Hot reload updates browser automatically
   - Tests run automatically in watch mode

3. **Test Changes**:
   ```bash
   npm test            # Run all tests
   npm run lint        # Check code quality
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

### Component Development Workflow

#### 1. Create New Component
```bash
# Create component directory
mkdir src/components/NewComponent

# Component files
touch src/components/NewComponent/index.jsx
touch src/components/NewComponent/NewComponent.css
touch src/components/NewComponent/NewComponent.test.jsx
touch src/components/NewComponent/NewComponent.stories.jsx
```

#### 2. Component Template
```javascript
// index.jsx
import React from 'react'
import './NewComponent.css'

const NewComponent = ({ prop1, prop2, onAction }) => {
  return (
    <div className="new-component">
      <h2>{prop1}</h2>
      <button onClick={onAction}>{prop2}</button>
    </div>
  )
}

export default NewComponent
```

#### 3. Write Tests First (TDD)
```javascript
// NewComponent.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewComponent from './index'

describe('NewComponent', () => {
  test('renders correctly', () => {
    render(<NewComponent prop1="Test" prop2="Click me" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  test('handles user interaction', async () => {
    const mockOnAction = jest.fn()
    render(<NewComponent prop1="Test" prop2="Click" onAction={mockOnAction} />)
    
    await userEvent.click(screen.getByText('Click'))
    expect(mockOnAction).toHaveBeenCalled()
  })
})
```

#### 4. Create Storybook Stories
```javascript
// NewComponent.stories.jsx
import NewComponent from './index'

export default {
  title: 'Components/NewComponent',
  component: NewComponent,
  argTypes: {
    prop1: { control: 'text' },
    prop2: { control: 'text' }
  }
}

export const Default = {
  args: {
    prop1: 'Default Title',
    prop2: 'Default Button'
  }
}

export const Interactive = {
  args: {
    prop1: 'Interactive Title',
    prop2: 'Click Me',
    onAction: () => console.log('Button clicked!')
  }
}
```

### Testing Workflow

#### Test-Driven Development
1. **Write failing test**:
   ```bash
   npm run test:watch NewComponent
   ```
   
2. **Write minimal code to pass**:
   - Implement just enough to make test pass
   - Run tests continuously in watch mode

3. **Refactor**:
   - Clean up code while keeping tests green
   - Add more tests for edge cases

#### Testing Best Practices
- **One assertion per test** when possible
- **Descriptive test names** that explain behavior
- **Test user interactions** not implementation details
- **Mock external dependencies** properly
- **Test accessibility** features

### Code Quality Standards

#### Naming Conventions
- **Components**: PascalCase (`BibleBookSelector`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (`handleVerseSelect`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_VERSES`)
- **CSS Classes**: kebab-case (`bible-book-selector`)

#### File Structure
```
src/
├── components/
│   └── ComponentName/
│       ├── index.jsx                # Main component
│       ├── ComponentName.css        # Component styles  
│       ├── ComponentName.test.jsx   # Tests
│       └── ComponentName.stories.jsx # Storybook stories
├── utils/
│   ├── utilityName.js              # Utility functions
│   └── utilityName.test.js         # Utility tests
├── hooks/
│   ├── useHookName.js              # Custom hooks
│   └── useHookName.test.js         # Hook tests
└── assets/                         # Static assets
```

#### Code Style Guidelines
- **Prefer function components** over class components
- **Use custom hooks** for stateful logic
- **Keep components small** and focused
- **Extract reusable logic** into utilities
- **Use meaningful variable names**
- **Add comments** for complex logic only
- **Handle loading and error states**

### Git Workflow

#### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and commit
git add .
git commit -m "Add new feature: description"

# Push branch
git push -u origin feature/new-feature-name

# Create pull request (via GitHub interface)

# After review, merge to main
git checkout main
git pull origin main
git branch -d feature/new-feature-name
```

#### Commit Message Format
```bash
# Good commit messages
git commit -m "Add verse navigation highlighting system"
git commit -m "Fix responsive layout for mobile devices"
git commit -m "Update BibleBookSelector test coverage"

# Avoid
git commit -m "Fix bug"
git commit -m "Update"
git commit -m "Changes"
```

## Environment Configuration

### VS Code Settings
Recommended `.vscode/settings.json`:
```json
{
  "jest.jestCommandLine": "npm test",
  "jest.testExplorer.showClassicStatus": true,
  "jest.runMode": "on-demand",
  "jest.useDashedArgs": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### VS Code Extensions
Recommended extensions:
- ES7+ React/Redux/React-Native snippets
- Jest Test Explorer
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer

### Build Configuration

#### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

#### Jest Configuration (`jest.config.js`)
```javascript
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/testSetup.js'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/stories/**'
  ],
  testMatch: [
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ]
}
```

## Debugging

### Common Issues

#### Test Discovery Problems
```bash
# Clear Jest cache
npm test -- --clearCache

# Run specific test file
npm test -- ComponentName.test.jsx

# Debug Jest configuration
npm test -- --showConfig
```

#### Development Server Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port conflicts
lsof -ti:3000 | xargs kill -9
```

#### Build Issues
```bash
# Clear build cache
rm -rf dist
npm run build

# Check for import errors
npm run lint
```

### Debug Tools

#### Browser DevTools
- **React Developer Tools**: Component inspection
- **Console**: Error messages and debugging
- **Network Tab**: API calls and resource loading
- **Performance Tab**: Performance profiling

#### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### Test Debugging
```javascript
// Add debug output in tests
test('debug test', () => {
  render(<Component />)
  screen.debug() // Prints current DOM
  
  console.log(screen.getByTestId('element').textContent)
})
```

### Performance Optimization

#### Development Performance
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for unused dependencies
npx depcheck

# Profile component rendering
# Use React DevTools Profiler
```

#### Production Optimization
- **Code Splitting**: Use React.lazy for large components
- **Image Optimization**: Compress images and use WebP format
- **Bundle Analysis**: Regularly check bundle size
- **Lazy Loading**: Load components on demand

## Data Processing

### Bible Data Pipeline
The application includes Python scripts in `public/data/`:

#### Extract Verses to JSON
```bash
cd public/data
python extract_verses_to_json.py
```

This processes XML chapter files into JSON format with:
- Plain text verse extraction
- Intelligent verse splitting for long verses (>200 chars)
- OSIS ID preservation
- Multi-part verse support (9a, 9b, 9c)

#### Generate Book Names
```bash
cd public/data  
python generate_book_names.py
```

Creates simple book name mappings for display components.

### Data Structure
- **Bible Structure**: `kjv_structure.json` - Complete Bible metadata
- **Chapter XML**: `output_chapters/` - Individual chapter XML files
- **Chapter JSON**: `output_chapters_json/` - Verse text in JSON format
- **Book Names**: `book_names.json` - Simple name mappings

## Deployment

### Production Build
```bash
# Create production build
npm run build

# Test production build locally
npm run preview

# Build Storybook (optional)
npm run build-storybook
```

### Environment Variables
Create `.env.local` for local environment:
```bash
VITE_API_URL=http://localhost:3000
VITE_DEBUG_MODE=true
```

### Static File Serving
Ensure `public/data/` files are accessible:
- Bible structure JSON
- Chapter XML/JSON files
- Book name mappings

## Project Structure Overview

### Key Directories
```
obs-bible/
├── public/
│   └── data/               # Bible data files and processing scripts
├── src/
│   ├── nav/               # All navigation components and logic
│   │   ├── ref-nav/       # Reference navigation components
│   │   └── bible-nav/     # Bible content display components
│   ├── display/           # Standalone verse display component
│   ├── messages/          # Messages Module (complete system)
│   ├── utils/             # General utility functions
│   └── stories/           # Default Storybook examples
├── .storybook/            # Storybook configuration
├── .vscode/               # VS Code settings
└── docs/                  # Focused documentation files
```

### Architecture Principles
- **Component-Driven**: Each UI element is a tested, reusable component
- **Separation of Concerns**: Navigation, display, and utilities clearly separated
- **Testability**: Every component and utility fully testable in isolation
- **Accessibility**: Full ARIA support and keyboard navigation
- **Responsive Design**: Mobile-first design with progressive enhancement
- **Performance**: Optimized rendering and minimal bundle size

## Troubleshooting

### Common Development Issues

#### Component Not Updating
1. Check if props are changing correctly
2. Verify useEffect dependency arrays
3. Check for stale closures in callbacks

#### Tests Failing
1. Clear Jest cache: `npm test -- --clearCache`
2. Check for async issues - use `waitFor`
3. Verify mock implementations

#### Styles Not Applied
1. Check CSS import paths
2. Verify CSS class names match
3. Check CSS specificity issues

#### Hot Reload Not Working
1. Restart development server
2. Check file naming conventions
3. Clear browser cache

For complete project architecture and implementation details, see [CLAUDE.md](./CLAUDE.md).