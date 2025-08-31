import React, { useState, useEffect, useRef } from 'react'
import { customMessageUtils } from '../../utils/customMessages.js'
import './MessageEditModal.css'

const MessageEditModal = ({ message, onClose, onSave }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  const modalRef = useRef(null)
  const titleInputRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  // Initialize form with message data
  useEffect(() => {
    if (message) {
      setTitle(message.title || '')
      setContent(message.content || '')
      setTags(message.tags ? message.tags.join(', ') : '')
    }
  }, [message])

  // Focus management for accessibility
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }

    // Update focus references for keyboard navigation
    const updateFocusableElements = () => {
      if (!modalRef.current) return

      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length > 0) {
        firstFocusableRef.current = focusableElements[0]
        lastFocusableRef.current = focusableElements[focusableElements.length - 1]
      }
    }

    updateFocusableElements()
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Track changes for unsaved changes warning
  useEffect(() => {
    if (!message) return

    const originalTags = message.tags ? message.tags.join(', ') : ''
    const currentTags = tags.trim()
    
    const changed = 
      title.trim() !== message.title ||
      content.trim() !== message.content ||
      currentTags !== originalTags

    setHasChanges(changed)
  }, [title, content, tags, message])

  const validateForm = () => {
    const newErrors = {}
    const validation = customMessageUtils.validateMessage({
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tags)
    })

    if (!validation.valid) {
      validation.errors.forEach(error => {
        if (error.includes('Title')) {
          newErrors.title = error
        } else if (error.includes('Content')) {
          newErrors.content = error
        } else if (error.includes('Tags')) {
          newErrors.tags = error
        } else {
          newErrors.general = error
        }
      })
    }

    setErrors(newErrors)
    return validation.valid
  }

  const parseTags = (tagString) => {
    if (!tagString.trim()) return []
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10) // Limit to 10 tags
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const updatedData = {
        title: title.trim(),
        content: content.trim(),
        tags: parseTags(tags)
      }

      const result = customMessageUtils.updateMessage(message.id, updatedData)
      
      if (result) {
        onSave && onSave(result)
        onClose()
      } else {
        setErrors({ general: 'Failed to update message. Please try again.' })
      }
    } catch (error) {
      console.error('MessageEditModal: Failed to update message:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return
    }
    onClose()
  }

  const handleKeyDown = (event) => {
    // Handle Escape key
    if (event.key === 'Escape') {
      event.preventDefault()
      handleClose()
      return
    }

    // Handle Tab key for focus trapping
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  const getTitleCharacterCount = () => {
    return title.length
  }

  const getContentCharacterCount = () => {
    return content.length
  }

  const getTagCount = () => {
    return parseTags(tags).length
  }

  if (!message) {
    return null
  }

  return (
    <div 
      className="message-edit-modal__backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      aria-describedby="edit-modal-description"
    >
      <div 
        ref={modalRef}
        className="message-edit-modal"
      >
        <div className="message-edit-modal__header">
          <h2 id="edit-modal-title" className="message-edit-modal__title">
            Edit Message
          </h2>
          <button
            type="button"
            className="message-edit-modal__close"
            onClick={handleClose}
            aria-label="Close edit message modal"
            title="Close (Esc)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div id="edit-modal-description" className="message-edit-modal__description">
          Update the title, content, and tags for your message.
        </div>

        {errors.general && (
          <div className="message-edit-modal__error" role="alert">
            {errors.general}
          </div>
        )}

        <form className="message-edit-modal__form" onSubmit={handleSubmit}>
          <div className="message-edit-modal__field">
            <label htmlFor="edit-title" className="message-edit-modal__label">
              Title *
              <span className="message-edit-modal__char-count">
                {getTitleCharacterCount()}/200
              </span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="edit-title"
              className={`message-edit-modal__input ${errors.title ? 'message-edit-modal__input--error' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              aria-describedby={errors.title ? "edit-title-error" : "edit-title-help"}
              aria-invalid={!!errors.title}
            />
            <div id="edit-title-help" className="message-edit-modal__help">
              A descriptive title for your message
            </div>
            {errors.title && (
              <div id="edit-title-error" className="message-edit-modal__field-error" role="alert">
                {errors.title}
              </div>
            )}
          </div>

          <div className="message-edit-modal__field">
            <label htmlFor="edit-content" className="message-edit-modal__label">
              Content *
              <span className="message-edit-modal__char-count">
                {getContentCharacterCount()}/5000
              </span>
            </label>
            <textarea
              id="edit-content"
              className={`message-edit-modal__textarea ${errors.content ? 'message-edit-modal__textarea--error' : ''}`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
              rows={8}
              required
              aria-describedby={errors.content ? "edit-content-error" : "edit-content-help"}
              aria-invalid={!!errors.content}
            />
            <div id="edit-content-help" className="message-edit-modal__help">
              Your message content. Supports Markdown formatting.
            </div>
            {errors.content && (
              <div id="edit-content-error" className="message-edit-modal__field-error" role="alert">
                {errors.content}
              </div>
            )}
          </div>

          <div className="message-edit-modal__field">
            <label htmlFor="edit-tags" className="message-edit-modal__label">
              Tags
              <span className="message-edit-modal__char-count">
                {getTagCount()}/10 tags
              </span>
            </label>
            <input
              type="text"
              id="edit-tags"
              className={`message-edit-modal__input ${errors.tags ? 'message-edit-modal__input--error' : ''}`}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="study, prayer, devotion"
              aria-describedby={errors.tags ? "edit-tags-error" : "edit-tags-help"}
              aria-invalid={!!errors.tags}
            />
            <div id="edit-tags-help" className="message-edit-modal__help">
              Comma-separated tags to help organize your messages (optional)
            </div>
            {errors.tags && (
              <div id="edit-tags-error" className="message-edit-modal__field-error" role="alert">
                {errors.tags}
              </div>
            )}
          </div>

          <div className="message-edit-modal__actions">
            <button
              type="button"
              className="message-edit-modal__button message-edit-modal__button--secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="message-edit-modal__button message-edit-modal__button--primary"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? (
                <>
                  <span className="message-edit-modal__spinner" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessageEditModal