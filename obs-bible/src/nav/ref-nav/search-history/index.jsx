import React from 'react'
import VerseList from '../verse-list'
import { verseHistoryUtils } from '../../../utils/verseHistory'
import './SearchHistory.css'

const SearchHistory = ({ onVerseSelect, onClearHistory }) => {
  // Data source adapter for VerseList component
  const dataSource = {
    getItems: () => verseHistoryUtils.getHistory(),
    clearAll: () => verseHistoryUtils.clearHistory(),
    removeItem: (osisId) => verseHistoryUtils.removeFromHistory(osisId)
  }

  // Custom timestamp formatter for history
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

  return (
    <VerseList
      dataSource={dataSource}
      eventName="verseHistoryUpdated"
      title="Search History"
      emptyMessage="No verses in your history yet."
      emptyHint="Navigate to verses to build your history."
      loadingMessage="Loading history"
      cssPrefix="search-history"
      onVerseSelect={onVerseSelect}
      onClearAll={onClearHistory}
      showCount={false}
      formatTimestamp={formatTimestamp}
      ariaLabel="Search History"
    />
  )
}

export default SearchHistory