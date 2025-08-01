import React from 'react'
import SubTabs from '../SubTabs'
import './MessagesTab.css'

const MessagesTab = () => {
  return (
    <div className="messages-tab" role="main" aria-label="Custom Messages">
      <div className="messages-tab__header">
        <h2 className="messages-tab__title">Custom Messages</h2>
        <p className="messages-tab__subtitle">Create and manage your personal Bible study messages</p>
      </div>
      
      <div className="messages-tab__content">
        <SubTabs />
      </div>
    </div>
  )
}

export default MessagesTab