import React from 'react'
import SearchHistory from './index'

export default {
  title: 'Navigation/SearchHistory',
  component: SearchHistory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A component for displaying and managing verse search history with navigation functionality.'
      }
    }
  },
  argTypes: {
    onVerseSelect: {
      action: 'verse-selected',
      description: 'Callback function called when a verse is selected from history'
    },
    onClearHistory: {
      action: 'history-cleared',
      description: 'Callback function called when history is cleared'
    }
  }
}

// Mock history data for stories
const sampleHistoryData = [
  {
    book: 'Genesis',
    bookId: 'Gen',
    chapter: '1',
    verse: '1',
    reference: 'Genesis 1:1',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    osisId: 'Gen.1.1'
  },
  {
    book: 'John',
    bookId: 'John',
    chapter: '3',
    verse: '16',
    reference: 'John 3:16',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    osisId: 'John.3.16'
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
    book: 'Psalms',
    bookId: 'Ps',
    chapter: '23',
    verse: '1',
    reference: 'Psalms 23:1',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    osisId: 'Ps.23.1'
  },
  {
    book: 'Romans',
    bookId: 'Rom',
    chapter: '8',
    verse: '28',
    reference: 'Romans 8:28',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
    osisId: 'Rom.8.28'
  },
  {
    book: 'Revelation',
    bookId: 'Rev',
    chapter: '21',
    verse: '4',
    reference: 'Revelation 21:4',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30, // 1 month ago
    osisId: 'Rev.21.4'
  }
]

const largeHistoryData = Array.from({ length: 15 }, (_, index) => ({
  book: `Book${index + 1}`,
  bookId: `B${index + 1}`,
  chapter: '1',
  verse: `${index + 1}`,
  reference: `Book${index + 1} 1:${index + 1}`,
  timestamp: Date.now() - 1000 * 60 * 60 * index, // Staggered timestamps
  osisId: `B${index + 1}.1.${index + 1}`
}))

// Create a mock SearchHistory component for stories that bypasses localStorage
const MockSearchHistory = ({ historyData = sampleHistoryData, onVerseSelect, onClearHistory }) => {
  const [history, setHistory] = React.useState(historyData)
  const [loading, setLoading] = React.useState(false)

  const handleVerseClick = (historyItem) => {
    if (onVerseSelect) {
      const scriptureRef = {
        book: historyItem.book,
        bookId: historyItem.bookId,
        chapter: historyItem.chapter,
        verse: parseInt(historyItem.verse),
        reference: historyItem.reference
      }
      onVerseSelect(scriptureRef)
    }
  }

  const handleClearAll = () => {
    setHistory([])
    if (onClearHistory) {
      onClearHistory()
    }
  }

  const handleRemoveItem = (osisId) => {
    setHistory(prev => prev.filter(item => item.osisId !== osisId))
  }

  const formatTimestamp = (timestamp) => {
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

  if (loading) {
    return (
      <div className="search-history" role="main" aria-label="Search History">
        <div className="search-history__header">
          <h1 className="search-history__title">Search History</h1>
        </div>
        <div className="search-history__loading" role="status" aria-live="polite">
          <span className="sr-only">Loading history...</span>
          Loading history...
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="search-history" role="main" aria-label="Search History">
        <div className="search-history__header">
          <h1 className="search-history__title">Search History</h1>
        </div>
        <div className="search-history__empty" role="status">
          <p>No verses in your history yet.</p>
          <p className="search-history__empty-hint">Navigate to verses to build your history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="search-history" role="main" aria-label="Search History">
      <div className="search-history__header">
        <h1 className="search-history__title">Search History</h1>
        <button
          type="button"
          className="search-history__clear-all"
          onClick={handleClearAll}
          aria-label="Clear all history"
        >
          Clear All
        </button>
      </div>
      
      <div className="search-history__list" role="list">
        {history.map((item, index) => (
          <div key={item.osisId} className="search-history__item" role="listitem">
            <button
              type="button"
              className="search-history__verse-button"
              onClick={() => handleVerseClick(item)}
              aria-label={`Navigate to ${item.reference}`}
            >
              <div className="search-history__verse-reference">
                {item.reference}
              </div>
              <div className="search-history__verse-timestamp">
                {formatTimestamp(item.timestamp)}
              </div>
            </button>
            <button
              type="button"
              className="search-history__remove-button"
              onClick={() => handleRemoveItem(item.osisId)}
              aria-label={`Remove ${item.reference} from history`}
              title={`Remove ${item.reference} from history`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const Template = (args) => {
  return <MockSearchHistory {...args} />
}

export const Default = Template.bind({})
Default.args = {
  historyData: sampleHistoryData
}
Default.parameters = {
  docs: {
    description: {
      story: 'Default SearchHistory component with sample verse history data.'
    }
  }
}

export const EmptyHistory = Template.bind({})
EmptyHistory.args = {
  historyData: []
}
EmptyHistory.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component when no history exists, showing empty state with helpful message.'
    }
  }
}

export const SingleItem = Template.bind({})
SingleItem.args = {
  historyData: [sampleHistoryData[0]]
}
SingleItem.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component with only one verse in history.'
    }
  }
}

export const LargeHistory = Template.bind({})
LargeHistory.args = {
  historyData: largeHistoryData
}
LargeHistory.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component with many verses to demonstrate scrolling and layout with larger datasets.'
    }
  }
}

export const WithInteraction = Template.bind({})
WithInteraction.args = {
  historyData: sampleHistoryData,
  onVerseSelect: (scriptureRef) => {
    alert(`Selected: ${scriptureRef.reference}`)
  },
  onClearHistory: () => {
    alert('History cleared!')
  }
}
WithInteraction.parameters = {
  docs: {
    description: {
      story: 'Interactive SearchHistory component demonstrating verse selection and history clearing with alert notifications.'
    }
  }
}

export const RecentTimestamps = Template.bind({})
RecentTimestamps.args = {
  historyData: [
    {
      ...sampleHistoryData[0],
      timestamp: Date.now() - 1000 * 60 * 10 // 10 minutes ago
    },
    {
      ...sampleHistoryData[1],
      timestamp: Date.now() - 1000 * 60 * 60 // 1 hour ago
    },
    {
      ...sampleHistoryData[2],
      timestamp: Date.now() - 1000 * 60 * 60 * 25 // 25 hours ago
    }
  ]
}
RecentTimestamps.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component showing different timestamp formats for recent verses (minutes, hours, days).'
    }
  }
}

export const OldTimestamps = Template.bind({})
OldTimestamps.args = {
  historyData: [
    {
      ...sampleHistoryData[0],
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8 // 8 days ago (shows date)
    },
    {
      ...sampleHistoryData[1],
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 30 // 30 days ago (shows date)
    },
    {
      ...sampleHistoryData[2],
      timestamp: new Date('2023-01-01').getTime() // Very old date
    }
  ]
}
OldTimestamps.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component showing formatted dates for older verses (more than a week ago).'
    }
  }
}

export const ResponsiveTest = Template.bind({})
ResponsiveTest.args = {
  historyData: sampleHistoryData
}
ResponsiveTest.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component for testing responsive design across different screen sizes.'
    }
  },
  viewport: {
    viewports: {
      mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
      tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
      desktop: { name: 'Desktop', styles: { width: '1200px', height: '800px' } }
    }
  }
}

export const DarkModePreview = Template.bind({})
DarkModePreview.args = {
  historyData: sampleHistoryData
}
DarkModePreview.decorators = [
  (Story) => (
    <div className="dark" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', padding: '20px' }}>
      <Story />
    </div>
  )
]
DarkModePreview.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component in dark mode to verify dark theme styling.'
    }
  }
}

export const LoadingState = () => {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="search-history" role="main" aria-label="Search History">
        <div className="search-history__header">
          <h1 className="search-history__title">Search History</h1>
        </div>
        <div className="search-history__loading" role="status" aria-live="polite">
          <span className="sr-only">Loading history...</span>
          Loading history...
        </div>
      </div>
    )
  }

  return <MockSearchHistory historyData={sampleHistoryData} />
}
LoadingState.parameters = {
  docs: {
    description: {
      story: 'SearchHistory component showing the loading state before history data is available.'
    }
  }
}