import React from 'react'
import VerseList from './index'

// Mock CSS to prevent Storybook styling issues
import './VerseList.css'

// Sample verse data for stories
const sampleVerseData = [
  {
    book: 'Genesis',
    bookId: 'Gen',
    chapter: '1',
    verse: '1',
    reference: 'Genesis 1:1',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    osisId: 'Gen.1.1'
  },
  {
    book: 'Matthew',
    bookId: 'Matt',
    chapter: '5',
    verse: '3',
    reference: 'Matthew 5:3',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    osisId: 'Matt.5.3'
  },
  {
    book: 'John',
    bookId: 'John',
    chapter: '3',
    verse: '16',
    reference: 'John 3:16',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    osisId: 'John.3.16'
  },
  {
    book: 'Psalms',
    bookId: 'Ps',
    chapter: '23',
    verse: '1',
    reference: 'Psalms 23:1',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
    osisId: 'Ps.23.1'
  },
  {
    book: 'Romans',
    bookId: 'Rom',
    chapter: '8',
    verse: '28',
    reference: 'Romans 8:28',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 60, // 60 days ago
    osisId: 'Rom.8.28'
  }
]

const splitVerseData = [
  {
    book: 'Esther',
    bookId: 'Esth',
    chapter: '8',
    verse: '9a',
    reference: 'Esther 8:9a',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    osisId: 'Esth.8.9a'
  },
  {
    book: 'Esther',
    bookId: 'Esth',
    chapter: '8',
    verse: '9b',
    reference: 'Esther 8:9b',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    osisId: 'Esth.8.9b'
  },
  {
    book: 'Esther',
    bookId: 'Esth',
    chapter: '8',
    verse: '9c',
    reference: 'Esther 8:9c',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    osisId: 'Esth.8.9c'
  }
]

// Base data source for stories
const createDataSource = (data) => ({
  getItems: () => data,
  clearAll: () => console.log('Clear all clicked'),
  removeItem: (osisId) => console.log('Remove item:', osisId)
})

export default {
  title: 'Navigation/VerseList',
  component: VerseList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A reusable component for displaying lists of Bible verses with navigation, removal, and management functionality. Used by SearchHistory and StageList components.'
      }
    }
  },
  argTypes: {
    dataSource: {
      description: 'Object with getItems, clearAll, and removeItem methods',
      control: false
    },
    eventName: {
      description: 'Name of the window event to listen for updates',
      control: 'text'
    },
    title: {
      description: 'Title displayed in the component header',
      control: 'text'
    },
    emptyMessage: {
      description: 'Message shown when no items exist',
      control: 'text'
    },
    emptyHint: {
      description: 'Hint text shown below empty message',
      control: 'text'
    },
    loadingMessage: {
      description: 'Message shown during loading state',
      control: 'text'
    },
    cssPrefix: {
      description: 'CSS class prefix for styling (e.g., "search-history")',
      control: 'text'
    },
    showCount: {
      description: 'Whether to show item count in title',
      control: 'boolean'
    },
    ariaLabel: {
      description: 'Custom ARIA label for the main container',
      control: 'text'
    },
    onVerseSelect: {
      description: 'Callback fired when a verse is selected for navigation',
      action: 'verse-selected'
    },
    onClearAll: {
      description: 'Callback fired when clear all button is clicked',
      action: 'clear-all'
    },
    formatTimestamp: {
      description: 'Custom function to format timestamps',
      control: false
    }
  }
}

// Default story - History-style list
export const SearchHistoryStyle = {
  args: {
    dataSource: createDataSource(sampleVerseData),
    eventName: 'verseHistoryUpdated',
    title: 'Search History',
    emptyMessage: 'No verses in your history yet.',
    emptyHint: 'Navigate to verses to build your history.',
    loadingMessage: 'Loading history',
    cssPrefix: 'search-history',
    showCount: false,
    formatTimestamp: (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) {
        return 'Less than an hour ago'
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString()
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Default appearance styled as a search history list with timestamps showing relative time.'
      }
    }
  }
}

// Stage-style list with count
export const StageListStyle = {
  args: {
    dataSource: createDataSource(sampleVerseData),
    eventName: 'stagedVersesUpdated',
    title: 'Staged Verses',
    emptyMessage: 'No verses staged yet.',
    emptyHint: 'Use the + button next to verses to add them to your stage.',
    loadingMessage: 'Loading staged verses',
    cssPrefix: 'stage-list',
    showCount: true,
    formatTimestamp: (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) {
        return 'Added recently'
      } else if (diffHours < 24) {
        return `Added ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffDays < 7) {
        return `Added ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else {
        return `Added ${date.toLocaleDateString()}`
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Staged verses style with count in title and "Added" prefix for timestamps.'
      }
    }
  }
}

// Empty state
export const EmptyState = {
  args: {
    dataSource: createDataSource([]),
    eventName: 'testEvent',
    title: 'Empty List',
    emptyMessage: 'No items to display.',
    emptyHint: 'Add some items to see them here.',
    loadingMessage: 'Loading items',
    cssPrefix: 'test-list',
    showCount: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state with no items to display.'
      }
    }
  }
}

// Loading state
export const LoadingState = {
  args: {
    dataSource: {
      getItems: () => new Promise(resolve => setTimeout(() => resolve(sampleVerseData), 2000)),
      clearAll: () => console.log('Clear all clicked'),
      removeItem: (osisId) => console.log('Remove item:', osisId)
    },
    eventName: 'testEvent',
    title: 'Loading List',
    emptyMessage: 'No items to display.',
    emptyHint: 'Add some items to see them here.',
    loadingMessage: 'Loading items',
    cssPrefix: 'test-list',
    showCount: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state showing spinner and loading message (resolves after 2 seconds).'
      }
    }
  }
}

// Single item
export const SingleItem = {
  args: {
    dataSource: createDataSource([sampleVerseData[0]]),
    eventName: 'testEvent',
    title: 'Single Item',
    emptyMessage: 'No items to display.',
    emptyHint: 'Add some items to see them here.',
    loadingMessage: 'Loading items',
    cssPrefix: 'test-list',
    showCount: true
  },
  parameters: {
    docs: {
      description: {
        story: 'List with only one item, showing count in title.'
      }
    }
  }
}

// Split verses
export const SplitVerses = {
  args: {
    dataSource: createDataSource(splitVerseData),
    eventName: 'testEvent',
    title: 'Split Verses',
    emptyMessage: 'No verses to display.',
    emptyHint: 'Add some verses to see them here.',
    loadingMessage: 'Loading verses',
    cssPrefix: 'test-list',
    showCount: true,
    formatTimestamp: (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
      } else {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'List showing split verses (9a, 9b, 9c) with different verse parts.'
      }
    }
  }
}

// Large dataset
export const LargeDataset = {
  args: {
    dataSource: createDataSource([
      ...sampleVerseData,
      ...Array.from({ length: 15 }, (_, i) => ({
        book: 'Psalms',
        bookId: 'Ps',
        chapter: '119',
        verse: `${i + 1}`,
        reference: `Psalms 119:${i + 1}`,
        timestamp: Date.now() - 1000 * 60 * 60 * (i + 1),
        osisId: `Ps.119.${i + 1}`
      }))
    ]),
    eventName: 'testEvent',
    title: 'Large Dataset',
    emptyMessage: 'No verses to display.',
    emptyHint: 'Add some verses to see them here.',
    loadingMessage: 'Loading verses',
    cssPrefix: 'test-list',
    showCount: true
  },
  parameters: {
    docs: {
      description: {
        story: 'List with many items to test scrolling and performance.'
      }
    }
  }
}

// Custom timestamp formatter
export const CustomTimestamps = {
  args: {
    dataSource: createDataSource(sampleVerseData),
    eventName: 'testEvent',
    title: 'Custom Timestamps',
    emptyMessage: 'No verses to display.',
    emptyHint: 'Add some verses to see them here.',
    loadingMessage: 'Loading verses',
    cssPrefix: 'test-list',
    showCount: false,
    formatTimestamp: (timestamp) => {
      const date = new Date(timestamp)
      return `📅 ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'List with custom timestamp formatting showing full date and time with emoji.'
      }
    }
  }
}

// Interactive example
export const InteractiveExample = {
  args: {
    dataSource: createDataSource(sampleVerseData.slice(0, 3)),
    eventName: 'testEvent',
    title: 'Interactive List',
    emptyMessage: 'No verses to display.',
    emptyHint: 'Add some verses to see them here.',
    loadingMessage: 'Loading verses',
    cssPrefix: 'test-list',
    showCount: true,
    onVerseSelect: (scriptureRef) => {
      alert(`Navigate to: ${scriptureRef.reference}\nBook: ${scriptureRef.book}\nChapter: ${scriptureRef.chapter}\nVerse: ${scriptureRef.verse}`)
    },
    onClearAll: () => {
      if (confirm('Clear all items?')) {
        alert('All items cleared!')
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive example with alerts showing verse selection and clear all functionality.'
      }
    }
  }
}

// Responsive design test
export const ResponsiveTest = {
  args: {
    dataSource: createDataSource(sampleVerseData),
    eventName: 'testEvent',
    title: 'Responsive Design',
    emptyMessage: 'No verses to display.',
    emptyHint: 'Add some verses to see them here.',
    loadingMessage: 'Loading verses',
    cssPrefix: 'test-list',
    showCount: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Test responsive design on mobile viewport - resize your browser to see adaptive layout.'
      }
    }
  }
}