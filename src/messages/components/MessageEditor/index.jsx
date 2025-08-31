import React, { useState } from 'react'
import { customMessageUtils } from '../../utils/customMessages'
import './MessageEditor.css'

const MessageEditor = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  // Character limits from customMessages utility
  const MAX_TITLE_LENGTH = 200
  const MIN_TITLE_LENGTH = 1
  const MAX_CONTENT_LENGTH = 5000
  const MIN_CONTENT_LENGTH = 1

  // Calculate character counts
  const titleLength = title.length
  const contentLength = content.length

  // Validation states
  const titleValid = title.trim().length >= MIN_TITLE_LENGTH && title.trim().length <= MAX_TITLE_LENGTH
  const contentValid = content.trim().length >= MIN_CONTENT_LENGTH && content.trim().length <= MAX_CONTENT_LENGTH
  const formValid = titleValid && contentValid && !isSubmitting

  // Clear feedback after a delay
  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => {
      setFeedback({ type: '', message: '' })
    }, 5000)
  }

  // Handle form submission
  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formValid) {
      showFeedback('error', 'Please check your input. Title and content are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = customMessageUtils.addMessage({
        title: title.trim(),
        content: content.trim()
      })

      if (result) {
        showFeedback('success', `Message "${result.title}" saved successfully!`)
        setTitle('')
        setContent('')
      } else {
        showFeedback('error', 'Failed to save message. Please check your input and try again.')
      }
    } catch (error) {
      console.error('MessageEditor: Error saving message:', error)
      showFeedback('error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle clear form
  const handleClear = () => {
    if (title.trim() || content.trim()) {
      setShowClearConfirmation(true)
    }
  }

  // Confirm clear form
  const confirmClear = () => {
    setTitle('')
    setContent('')
    setShowClearConfirmation(false)
    showFeedback('info', 'Form cleared.')
  }

  // Cancel clear form
  const cancelClear = () => {
    setShowClearConfirmation(false)
  }

  // Handle title input change
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    if (newTitle.length <= MAX_TITLE_LENGTH) {
      setTitle(newTitle)
    }
  }

  // Handle content input change
  const handleContentChange = (e) => {
    const newContent = e.target.value
    if (newContent.length <= MAX_CONTENT_LENGTH) {
      setContent(newContent)
    }
  }

  return (
    <div 
      className="message-editor" 
      role="form" 
      aria-label="Create new message"
      style={{
        backgroundColor: '#ffffff',
        color: '#333333',
        border: '1px solid #e0e0e0',
        minHeight: '400px',
        padding: '20px'
      }}
    >
      <div className="message-editor__header">
        <h3 className="message-editor__title" style={{ color: '#333333', fontSize: '1.5rem' }}>Create New Message</h3>
        <p className="message-editor__subtitle" style={{ color: '#666666' }}>
          Write your custom Bible study message with markdown support
        </p>
      </div>

      {feedback.message && (
        <div 
          className={`message-editor__feedback message-editor__feedback--${feedback.type}`}
          role="alert"
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}

      <form className="message-editor__form" onSubmit={handleSave}>
        <div className="message-editor__field">
          <label htmlFor="message-title" className="message-editor__label">
            Title
            <span className="message-editor__required" aria-label="required">*</span>
          </label>
          <input
            type="text"
            id="message-title"
            className={`message-editor__input ${
              title && !titleValid ? 'message-editor__input--error' : ''
            }`}
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter a descriptive title for your message"
            required
            aria-describedby="title-counter title-help"
            maxLength={MAX_TITLE_LENGTH}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: '#ffffff',
              color: '#333333'
            }}
          />
          <div className="message-editor__field-footer">
            <div id="title-help" className="message-editor__help">
              Give your message a clear, descriptive title
            </div>
            <div 
              id="title-counter" 
              className={`message-editor__counter ${
                titleLength > MAX_TITLE_LENGTH * 0.9 ? 'message-editor__counter--warning' : ''
              }`}
            >
              {titleLength}/{MAX_TITLE_LENGTH}
            </div>
          </div>
        </div>

        <div className="message-editor__field">
          <label htmlFor="message-content" className="message-editor__label">
            Content
            <span className="message-editor__required" aria-label="required">*</span>
          </label>
          <textarea
            id="message-content"
            className={`message-editor__textarea ${
              content && !contentValid ? 'message-editor__textarea--error' : ''
            }`}
            value={content}
            onChange={handleContentChange}
            placeholder="Write your message content here. You can use markdown formatting like **bold**, *italic*, and # headings."
            required
            rows="8"
            aria-describedby="content-counter content-help"
            maxLength={MAX_CONTENT_LENGTH}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: '#ffffff',
              color: '#333333',
              minHeight: '150px',
              resize: 'vertical'
            }}
          />
          <div className="message-editor__field-footer">
            <div id="content-help" className="message-editor__help">
              Use markdown for formatting: **bold**, *italic*, # headings, - lists
            </div>
            <div 
              id="content-counter" 
              className={`message-editor__counter ${
                contentLength > MAX_CONTENT_LENGTH * 0.9 ? 'message-editor__counter--warning' : ''
              }`}
            >
              {contentLength}/{MAX_CONTENT_LENGTH}
            </div>
          </div>
        </div>

        <div className="message-editor__actions">
          <button
            type="submit"
            className="message-editor__save"
            disabled={!formValid}
            aria-describedby={!formValid ? 'save-help' : undefined}
          >
            {isSubmitting ? (
              <>
                <span className="message-editor__spinner" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="message-editor__save-icon" aria-hidden="true">💾</span>
                Save Message
              </>
            )}
          </button>
          
          <button
            type="button"
            className="message-editor__clear"
            onClick={handleClear}
            disabled={!title.trim() && !content.trim()}
          >
            <span className="message-editor__clear-icon" aria-hidden="true">🗑️</span>
            Clear Form
          </button>
          
          {!formValid && !isSubmitting && (
            <div id="save-help" className="message-editor__validation-help">
              {!titleValid && title && 'Title must be 1-200 characters. '}
              {!contentValid && content && 'Content must be 1-5000 characters. '}
              {!title.trim() && !content.trim() && 'Please enter both title and content.'}
            </div>
          )}
        </div>
      </form>

      {showClearConfirmation && (
        <div 
          className="message-editor__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-title"
          aria-describedby="clear-message"
        >
          <div className="message-editor__modal-content">
            <h4 id="clear-title" className="message-editor__modal-title">
              Clear Form?
            </h4>
            <p id="clear-message" className="message-editor__modal-message">
              This will remove all text from both the title and content fields. This action cannot be undone.
            </p>
            <div className="message-editor__modal-actions">
              <button
                type="button"
                className="message-editor__modal-confirm"
                onClick={confirmClear}
                autoFocus
              >
                Yes, Clear Form
              </button>
              <button
                type="button"
                className="message-editor__modal-cancel"
                onClick={cancelClear}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageEditor