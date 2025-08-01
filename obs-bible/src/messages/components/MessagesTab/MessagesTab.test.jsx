import React from 'react'
import { render, screen } from '@testing-library/react'
import MessagesTab from './index'

describe('MessagesTab Component', () => {
  describe('Component Rendering', () => {
    test('renders without errors', () => {
      render(<MessagesTab />)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('displays component with proper ARIA labels', () => {
      render(<MessagesTab />)
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveAttribute('aria-label', 'Custom Messages')
    })

    test('has correct CSS class structure', () => {
      render(<MessagesTab />)
      const mainElement = screen.getByRole('main')
      expect(mainElement).toHaveClass('messages-tab')
    })
  })

  describe('Header Section', () => {
    test('displays "Custom Messages" title', () => {
      render(<MessagesTab />)
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveTextContent('Custom Messages')
      expect(title).toHaveClass('messages-tab__title')
    })

    test('displays subtitle with description', () => {
      render(<MessagesTab />)
      const subtitle = screen.getByText('Create and manage your personal Bible study messages')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveClass('messages-tab__subtitle')
    })

    test('header has proper structure and CSS classes', () => {
      render(<MessagesTab />)
      const header = screen.getByRole('heading', { level: 2 }).parentElement
      expect(header).toHaveClass('messages-tab__header')
    })
  })

  describe('Content Section', () => {
    test('displays content area with proper structure', () => {
      render(<MessagesTab />)
      const content = screen.getByText('Custom Messages').closest('.messages-tab').querySelector('.messages-tab__content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('messages-tab__content')
    })

    test('integrates SubTabs component', () => {
      render(<MessagesTab />)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /create/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /library/i })).toBeInTheDocument()
    })

    test('displays sub-tab content', () => {
      render(<MessagesTab />)
      // MessageLibrary component shows loading state initially
      expect(screen.getByText('Loading messages...')).toBeInTheDocument()
      // Check for aria-label instead of visible text
      expect(screen.getByLabelText('Message Library')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    test('has proper semantic HTML structure', () => {
      render(<MessagesTab />)
      
      // Main container
      expect(screen.getByRole('main')).toBeInTheDocument()
      
      // Header with title and subtitle
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      
      // Sub-tabs structure
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(2)
    })

    test('maintains accessibility standards', () => {
      render(<MessagesTab />)
      
      // ARIA labels are present
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Custom Messages')
      
      // Headings are properly structured
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
      
      // Sub-tabs are accessible
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Message sub-tabs')
    })

    test('all text content is present and accessible', () => {
      render(<MessagesTab />)
      
      // Header content
      expect(screen.getByText('Custom Messages')).toBeInTheDocument()
      expect(screen.getByText('Create and manage your personal Bible study messages')).toBeInTheDocument()
      
      // Sub-tab content
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Library')).toBeInTheDocument()
      // Check for aria-label since MessageLibrary is in loading state
      expect(screen.getByLabelText('Message Library')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    test('applies consistent CSS class naming convention', () => {
      render(<MessagesTab />)
      
      // All CSS classes follow the BEM-style naming convention
      expect(screen.getByRole('main')).toHaveClass('messages-tab')
      expect(screen.getByRole('heading', { level: 2 }).parentElement).toHaveClass('messages-tab__header')
      expect(screen.getByRole('heading', { level: 2 })).toHaveClass('messages-tab__title')
      expect(screen.getByText('Create and manage your personal Bible study messages')).toHaveClass('messages-tab__subtitle')
    })

    test('integrates sub-tabs structure properly', () => {
      render(<MessagesTab />)
      
      const contentArea = screen.getByText('Custom Messages').closest('.messages-tab').querySelector('.messages-tab__content')
      expect(contentArea).toBeInTheDocument()
      
      // Sub-tabs should be within content area
      const subTabsContainer = contentArea.querySelector('.messages-sub-tabs')
      expect(subTabsContainer).toBeInTheDocument()
    })
  })

  describe('Sub-tab Integration', () => {
    test('sub-tabs are properly integrated', () => {
      render(<MessagesTab />)
      
      // Sub-tabs component is rendered
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /create/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /library/i })).toBeInTheDocument()
    })

    test('layout structure supports future content integration', () => {
      render(<MessagesTab />)
      
      // Content area is structured to support sub-tabs
      const contentArea = screen.getByText('Custom Messages').closest('.messages-tab').querySelector('.messages-tab__content')
      expect(contentArea).toBeInTheDocument()
      
      // Sub-tabs structure exists
      const subTabs = contentArea.querySelector('.messages-sub-tabs')
      expect(subTabs).toBeInTheDocument()
    })
  })
})