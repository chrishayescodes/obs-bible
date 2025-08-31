import React, { useState, useEffect } from 'react'
import MessageEditor from '../MessageEditor'
import MessageLibrary from '../MessageLibrary'
import './SubTabs.css'

const SubTabs = () => {
  const [activeTab, setActiveTab] = useState('create')

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleKeyDown = (event) => {
    const tabs = ['create', 'library']
    const currentIndex = tabs.indexOf(activeTab)

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        setActiveTab(tabs[prevIndex])
        break
      case 'ArrowRight':
        event.preventDefault()
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        setActiveTab(tabs[nextIndex])
        break
      case 'Home':
        event.preventDefault()
        setActiveTab(tabs[0])
        break
      case 'End':
        event.preventDefault()
        setActiveTab(tabs[tabs.length - 1])
        break
      default:
        break
    }
  }

  // Focus management for accessibility
  useEffect(() => {
    const activeTabElement = document.getElementById(`${activeTab}-tab`)
    if (activeTabElement && document.activeElement?.closest('.messages-sub-tabs__tabs')) {
      activeTabElement.focus()
    }
  }, [activeTab])

  return (
    <div className="messages-sub-tabs">
      <div className="messages-sub-tabs__tabs" role="tablist" aria-label="Message sub-tabs">
        <button
          type="button"
          className={`messages-sub-tabs__tab ${activeTab === 'create' ? 'messages-sub-tabs__tab--active' : ''}`}
          onClick={() => handleTabChange('create')}
          onKeyDown={handleKeyDown}
          role="tab"
          aria-selected={activeTab === 'create'}
          aria-controls="create-panel"
          id="create-tab"
          title="Create new message"
        >
          <span className="messages-sub-tabs__tab-icon" aria-hidden="true">✏️</span>
          <span className="messages-sub-tabs__tab-label">Create</span>
        </button>
        <button
          type="button"
          className={`messages-sub-tabs__tab ${activeTab === 'library' ? 'messages-sub-tabs__tab--active' : ''}`}
          onClick={() => handleTabChange('library')}
          onKeyDown={handleKeyDown}
          role="tab"
          aria-selected={activeTab === 'library'}
          aria-controls="library-panel"
          id="library-tab"
          title="Message library and management"
        >
          <span className="messages-sub-tabs__tab-icon" aria-hidden="true">📚</span>
          <span className="messages-sub-tabs__tab-label">Library</span>
        </button>
      </div>

      <div className="messages-sub-tabs__content">
        <div 
          role="tabpanel"
          id="create-panel"
          aria-labelledby="create-tab"
          className={`messages-sub-tabs__panel ${activeTab === 'create' ? 'messages-sub-tabs__panel--active' : ''}`}
          hidden={activeTab !== 'create'}
          style={{ 
            opacity: activeTab === 'create' ? 1 : 0, 
            visibility: activeTab === 'create' ? 'visible' : 'hidden', 
            position: 'relative',
            display: activeTab === 'create' ? 'block' : 'none',
            width: '100%',
            height: 'auto'
          }}
        >
          <MessageEditor />
        </div>

        <div 
          role="tabpanel"
          id="library-panel"
          aria-labelledby="library-tab"
          className={`messages-sub-tabs__panel ${activeTab === 'library' ? 'messages-sub-tabs__panel--active' : ''}`}
          hidden={activeTab !== 'library'}
          style={{ 
            opacity: activeTab === 'library' ? 1 : 0, 
            visibility: activeTab === 'library' ? 'visible' : 'hidden', 
            position: 'relative',
            display: activeTab === 'library' ? 'block' : 'none',
            width: '100%',
            height: 'auto'
          }}
        >
          <MessageLibrary />
        </div>
      </div>
    </div>
  )
}

export default SubTabs