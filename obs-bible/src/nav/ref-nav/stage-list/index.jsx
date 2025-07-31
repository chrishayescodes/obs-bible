import React from 'react'
import VerseList from '../verse-list'
import { stageUtils } from '../../../utils/stageUtils'
import './StageList.css'

const StageList = ({ onVerseSelect, onClearStage }) => {
  // Data source adapter for VerseList component
  const dataSource = {
    getItems: () => stageUtils.getStagedVerses(),
    clearAll: () => stageUtils.clearStage(),
    removeItem: (osisId) => stageUtils.removeFromStage(osisId)
  }

  // Custom timestamp formatter for staged verses
  const formatTimestamp = (timestamp) => {
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

  return (
    <VerseList
      dataSource={dataSource}
      eventName="stagedVersesUpdated"
      title="Staged Verses"
      emptyMessage="No verses staged yet."
      emptyHint="Use the + button next to verses to add them to your stage."
      loadingMessage="Loading staged verses"
      cssPrefix="stage-list"
      onVerseSelect={onVerseSelect}
      onClearAll={onClearStage}
      showCount={true}
      formatTimestamp={formatTimestamp}
      ariaLabel="Staged Verses"
    />
  )
}

export default StageList