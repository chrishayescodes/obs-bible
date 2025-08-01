import React from 'react'
import './MessageCard.css'

const MessageCard = ({ 
  message, 
  isSelected = false,
  isCurrentlyDisplayed = false,
  onEdit, 
  onDelete, 
  onDuplicate, 
  onSelect,
  onDisplay
}) => {
  if (!message) {
    return null
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown'
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp')
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('MessageCard: Invalid date:', timestamp)
      return 'Invalid Date'
    }
  }

  const getDateTimeAttribute = (timestamp) => {
    if (!timestamp) return undefined
    
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return undefined
      }
      return date.toISOString()
    } catch (error) {
      return undefined
    }
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content || content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength).trim() + '...'
  }

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action(event)
    }
  }

  const handleSelectChange = (event) => {
    event.stopPropagation()
    if (onSelect) {
      onSelect(message.id)
    }
  }

  const handleEdit = (event) => {
    event.stopPropagation()
    if (onEdit) {
      onEdit(message)
    }
  }

  const handleDelete = (event) => {
    event.stopPropagation()
    if (onDelete) {
      onDelete(message.id)
    }
  }

  const handleDuplicate = (event) => {
    event.stopPropagation()
    if (onDuplicate) {
      onDuplicate(message)
    }
  }

  const handleDisplay = (event) => {
    event.stopPropagation()
    if (onDisplay) {
      onDisplay(message)
    }
  }

  return (
    <div 
      className={`message-card ${isSelected ? 'message-card--selected' : ''}`}
      role="listitem"
      aria-labelledby={`message-title-${message.id}`}
      aria-describedby={`message-content-${message.id} message-meta-${message.id}`}
    >
      <div className="message-card__header">
        <div className="message-card__selection">
          <input
            type="checkbox"
            id={`select-${message.id}`}
            className="message-card__checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            aria-label={`Select message: ${message.title}`}
          />
        </div>
        
        <h4 
          id={`message-title-${message.id}`}
          className="message-card__title"
          title={message.title}
        >
          {message.title}
        </h4>

        <div className="message-card__actions">
          <button
            type="button"
            className={`message-card__action message-card__action--display ${isCurrentlyDisplayed ? 'message-card__action--displayed' : ''}`}
            onClick={handleDisplay}
            onKeyDown={(e) => handleKeyDown(e, handleDisplay)}
            aria-label={`Display message: ${message.title}`}
            title={isCurrentlyDisplayed ? 'Currently displayed - click to display again' : 'Display message'}
          >
            <span aria-hidden="true">📺</span>
            <span className="message-card__action-text">
              {isCurrentlyDisplayed ? 'Displayed' : 'Display'}
            </span>
          </button>
          
          <button
            type="button"
            className="message-card__action message-card__action--edit"
            onClick={handleEdit}
            onKeyDown={(e) => handleKeyDown(e, handleEdit)}
            aria-label={`Edit message: ${message.title}`}
            title="Edit message"
          >
            <span aria-hidden="true">✏️</span>
          </button>
          
          <button
            type="button"
            className="message-card__action message-card__action--duplicate"
            onClick={handleDuplicate}
            onKeyDown={(e) => handleKeyDown(e, handleDuplicate)}
            aria-label={`Duplicate message: ${message.title}`}
            title="Duplicate message"
          >
            <span aria-hidden="true">📋</span>
          </button>
          
          <button
            type="button"
            className="message-card__action message-card__action--delete"
            onClick={handleDelete}
            onKeyDown={(e) => handleKeyDown(e, handleDelete)}
            aria-label={`Delete message: ${message.title}`}
            title="Delete message"
          >
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      </div>

      <div className="message-card__content">
        <p 
          id={`message-content-${message.id}`}
          className="message-card__preview"
          title={message.content}
        >
          {truncateContent(message.content)}
        </p>
      </div>

      {message.tags && message.tags.length > 0 && (
        <div className="message-card__tags">
          {message.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="message-card__tag"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {message.tags.length > 3 && (
            <span 
              className="message-card__tag message-card__tag--more"
              title={`And ${message.tags.length - 3} more tags: ${message.tags.slice(3).join(', ')}`}
            >
              +{message.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div 
        id={`message-meta-${message.id}`}
        className="message-card__meta"
      >
        <div className="message-card__dates">
          <span className="message-card__date">
            <span className="message-card__date-label">Created:</span>
            <time dateTime={getDateTimeAttribute(message.createdAt)}>
              {formatDate(message.createdAt)}
            </time>
          </span>
          
          {message.updatedAt && message.updatedAt !== message.createdAt && (
            <span className="message-card__date">
              <span className="message-card__date-label">Updated:</span>
              <time dateTime={getDateTimeAttribute(message.updatedAt)}>
                {formatDate(message.updatedAt)}
              </time>
            </span>
          )}
        </div>

        {message.usageCount !== undefined && (
          <div className="message-card__usage">
            <span className="message-card__usage-count">
              Used {message.usageCount} time{message.usageCount !== 1 ? 's' : ''}
            </span>
            {message.lastUsed && (
              <span className="message-card__last-used">
                Last used: {formatDate(message.lastUsed)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageCard