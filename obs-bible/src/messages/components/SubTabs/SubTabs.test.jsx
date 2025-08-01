import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubTabs from './index'

describe('SubTabs Component', () => {
  describe('Component Rendering', () => {
    test('renders without errors', () => {
      render(<SubTabs />)
      expect(screen.getByRole('tablist')).toBeInTheDocument()
    })

    test('displays component with proper ARIA labels', () => {
      render(<SubTabs />)
      const tablist = screen.getByRole('tablist')
      expect(tablist).toHaveAttribute('aria-label', 'Message sub-tabs')
    })

    test('has correct CSS class structure', () => {
      render(<SubTabs />)
      const container = screen.getByRole('tablist').closest('.messages-sub-tabs')
      expect(container).toHaveClass('messages-sub-tabs')
    })
  })

  describe('Tab Structure', () => {
    test('displays Create and Library tabs', () => {
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      expect(createTab).toBeInTheDocument()
      expect(libraryTab).toBeInTheDocument()
    })

    test('Create tab has proper attributes', () => {
      render(<SubTabs />)
      const createTab = screen.getByRole('tab', { name: /create/i })
      
      expect(createTab).toHaveAttribute('id', 'create-tab')
      expect(createTab).toHaveAttribute('aria-controls', 'create-panel')
      expect(createTab).toHaveAttribute('title', 'Create new message')
      expect(createTab).toHaveAttribute('type', 'button')
    })

    test('Library tab has proper attributes', () => {
      render(<SubTabs />)
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      expect(libraryTab).toHaveAttribute('id', 'library-tab')
      expect(libraryTab).toHaveAttribute('aria-controls', 'library-panel')
      expect(libraryTab).toHaveAttribute('title', 'Message library and management')
      expect(libraryTab).toHaveAttribute('type', 'button')
    })

    test('tabs have proper icons and labels', () => {
      render(<SubTabs />)
      
      // Create tab icon and label
      const createTabIcons = screen.getAllByText('✏️')
      expect(createTabIcons.length).toBeGreaterThan(0)
      expect(screen.getByText('Create')).toBeInTheDocument()
      
      // Library tab icon and label
      const libraryTabIcons = screen.getAllByText('📚')
      expect(libraryTabIcons.length).toBeGreaterThan(0)
      expect(screen.getByText('Library')).toBeInTheDocument()
    })

    test('icons are properly hidden from screen readers', () => {
      render(<SubTabs />)
      
      const createIcons = screen.getAllByText('✏️')
      const libraryIcons = screen.getAllByText('📚')
      
      // Check that at least the tab icons are hidden
      expect(createIcons[0]).toHaveAttribute('aria-hidden', 'true')
      expect(libraryIcons[0]).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Tab Panels', () => {
    test('displays Create and Library panels', () => {
      render(<SubTabs />)
      
      const createPanel = screen.getByRole('tabpanel', { name: /create/i })
      const libraryPanel = document.getElementById('library-panel')
      
      expect(createPanel).toBeInTheDocument()
      expect(libraryPanel).toBeInTheDocument()
    })

    test('Create panel has proper attributes', () => {
      render(<SubTabs />)
      const createPanel = screen.getByRole('tabpanel', { name: /create/i })
      
      expect(createPanel).toHaveAttribute('id', 'create-panel')
      expect(createPanel).toHaveAttribute('aria-labelledby', 'create-tab')
    })

    test('Library panel has proper attributes', () => {
      render(<SubTabs />)
      const libraryPanel = document.getElementById('library-panel')
      
      expect(libraryPanel).toHaveAttribute('id', 'library-panel')
      expect(libraryPanel).toHaveAttribute('aria-labelledby', 'library-tab')
      expect(libraryPanel).toHaveAttribute('role', 'tabpanel')
    })
  })

  describe('Default State', () => {
    test('Create tab is active by default', () => {
      render(<SubTabs />)
      const createTab = screen.getByRole('tab', { name: /create/i })
      
      expect(createTab).toHaveAttribute('aria-selected', 'true')
      expect(createTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('Library tab is inactive by default', () => {
      render(<SubTabs />)
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      expect(libraryTab).toHaveAttribute('aria-selected', 'false')
      expect(libraryTab).not.toHaveClass('messages-sub-tabs__tab--active')
    })

    test('Create panel is visible by default', () => {
      render(<SubTabs />)
      const createPanel = screen.getByRole('tabpanel', { name: /create/i })
      
      expect(createPanel).not.toHaveAttribute('hidden')
      expect(createPanel).toHaveClass('messages-sub-tabs__panel--active')
    })

    test('Library panel is hidden by default', () => {
      render(<SubTabs />)
      const libraryPanel = document.getElementById('library-panel')
      
      expect(libraryPanel).toHaveAttribute('hidden')
      expect(libraryPanel).not.toHaveClass('messages-sub-tabs__panel--active')
    })
  })

  describe('Tab Switching', () => {
    test('clicking Library tab switches to Library panel', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      await user.click(libraryTab)
      
      // Library tab should be active
      expect(libraryTab).toHaveAttribute('aria-selected', 'true')
      expect(libraryTab).toHaveClass('messages-sub-tabs__tab--active')
      
      // Create tab should be inactive
      const createTab = screen.getByRole('tab', { name: /create/i })
      expect(createTab).toHaveAttribute('aria-selected', 'false')
      expect(createTab).not.toHaveClass('messages-sub-tabs__tab--active')
    })

    test('clicking Create tab switches back to Create panel', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      // First switch to Library
      await user.click(screen.getByRole('tab', { name: /library/i }))
      
      // Then switch back to Create
      const createTab = screen.getByRole('tab', { name: /create/i })
      await user.click(createTab)
      
      // Create tab should be active
      expect(createTab).toHaveAttribute('aria-selected', 'true')
      expect(createTab).toHaveClass('messages-sub-tabs__tab--active')
      
      // Create panel should be visible
      const createPanel = screen.getByRole('tabpanel', { name: /create/i })
      expect(createPanel).not.toHaveAttribute('hidden')
      expect(createPanel).toHaveClass('messages-sub-tabs__panel--active')
    })

    test('panel visibility changes with tab switching', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createPanel = screen.getByRole('tabpanel', { name: /create/i })
      const libraryPanel = document.getElementById('library-panel')
      
      // Initially Create panel is visible, Library is hidden
      expect(createPanel).not.toHaveAttribute('hidden')
      expect(libraryPanel).toHaveAttribute('hidden')
      
      // Click Library tab
      await user.click(screen.getByRole('tab', { name: /library/i }))
      
      // Now Library panel is visible, Create is hidden
      expect(libraryPanel).not.toHaveAttribute('hidden')
      expect(createPanel).toHaveAttribute('hidden')
    })
  })

  describe('Keyboard Navigation', () => {
    test('ArrowRight moves from Create to Library tab', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Focus Create tab and press ArrowRight
      createTab.focus()
      await user.keyboard('{ArrowRight}')
      
      expect(libraryTab).toHaveAttribute('aria-selected', 'true')
      expect(libraryTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('ArrowLeft moves from Library to Create tab', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // First switch to Library tab
      await user.click(libraryTab)
      
      // Focus Library tab and press ArrowLeft
      libraryTab.focus()
      await user.keyboard('{ArrowLeft}')
      
      expect(createTab).toHaveAttribute('aria-selected', 'true')
      expect(createTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('ArrowRight wraps from Library to Create tab', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Switch to Library tab and focus it
      await user.click(libraryTab)
      libraryTab.focus()
      
      // Press ArrowRight (should wrap to Create)
      await user.keyboard('{ArrowRight}')
      
      expect(createTab).toHaveAttribute('aria-selected', 'true')
      expect(createTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('ArrowLeft wraps from Create to Library tab', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Focus Create tab and press ArrowLeft (should wrap to Library)
      createTab.focus()
      await user.keyboard('{ArrowLeft}')
      
      expect(libraryTab).toHaveAttribute('aria-selected', 'true')
      expect(libraryTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('Home key moves to first tab (Create)', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Switch to Library tab
      await user.click(libraryTab)
      libraryTab.focus()
      
      // Press Home key
      await user.keyboard('{Home}')
      
      expect(createTab).toHaveAttribute('aria-selected', 'true')
      expect(createTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('End key moves to last tab (Library)', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Focus Create tab and press End key
      createTab.focus()
      await user.keyboard('{End}')
      
      expect(libraryTab).toHaveAttribute('aria-selected', 'true')
      expect(libraryTab).toHaveClass('messages-sub-tabs__tab--active')
    })

    test('keyboard navigation works without errors', async () => {
      render(<SubTabs />)
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Focus create tab and use keyboard navigation
      createTab.focus()
      fireEvent.keyDown(createTab, { key: 'ArrowRight' })
      
      // Verify the navigation worked
      expect(libraryTab).toHaveAttribute('aria-selected', 'true')
      expect(libraryTab).toHaveClass('messages-sub-tabs__tab--active')
    })
  })

  describe('Tab Content', () => {
    test('displays MessageEditor in Create tab', () => {
      render(<SubTabs />)
      
      // MessageEditor should be visible by default (Create tab is active)
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save message/i })).toBeInTheDocument()
    })

    test('displays Library tab with MessageLibrary component', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      // Switch to Library tab
      await user.click(screen.getByRole('tab', { name: /library/i }))
      
      expect(screen.getByText('Message Library')).toBeInTheDocument()
      expect(screen.getByText('No messages yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first message using the Create tab to get started.')).toBeInTheDocument()
    })

    test('MessageEditor has proper form structure', () => {
      render(<SubTabs />)
      
      // Check for form elements
      expect(screen.getByRole('form')).toBeInTheDocument()
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
    })

    test('Library tab shows MessageLibrary features', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      // Switch to Library tab
      await user.click(screen.getByRole('tab', { name: /library/i }))
      
      expect(screen.getByText('Search messages')).toBeInTheDocument()
      expect(screen.getByText('Sort by')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search by title, content, or tags...')).toBeInTheDocument()
    })

    test('MessageLibrary has proper structure', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      // Switch to Library tab
      await user.click(screen.getByRole('tab', { name: /library/i }))
      
      const messageLibrary = screen.getByRole('main', { name: 'Message Library' })
      expect(messageLibrary).toBeInTheDocument()
      
      const searchInput = screen.getByLabelText('Search messages')
      expect(searchInput).toBeInTheDocument()
      
      const sortSelect = screen.getByLabelText('Sort by')
      expect(sortSelect).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('maintains proper focus management', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Focus Create tab
      createTab.focus()
      expect(document.activeElement).toBe(createTab)
      
      // Use keyboard to switch to Library
      await user.keyboard('{ArrowRight}')
      
      // Focus should move to Library tab
      await waitFor(() => {
        expect(document.activeElement).toBe(libraryTab)
      })
    })

    test('has proper ARIA role structure', () => {
      render(<SubTabs />)
      
      // Tablist role
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      
      // Tab roles
      expect(screen.getAllByRole('tab')).toHaveLength(2)
      
      // Tabpanel roles (only visible one is accessible)
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
      
      // But both panels exist in DOM
      expect(document.getElementById('create-panel')).toBeInTheDocument()
      expect(document.getElementById('library-panel')).toBeInTheDocument()
    })

    test('ARIA selected states are correct', async () => {
      const user = userEvent.setup()
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      
      // Initially Create is selected
      expect(createTab).toHaveAttribute('aria-selected', 'true')
      expect(libraryTab).toHaveAttribute('aria-selected', 'false')
      
      // Click Library tab
      await user.click(libraryTab)
      
      // Now Library is selected
      expect(libraryTab).toHaveAttribute('aria-selected', 'true')
      expect(createTab).toHaveAttribute('aria-selected', 'false')
    })

    test('tab controls match panel IDs', () => {
      render(<SubTabs />)
      
      const createTab = screen.getByRole('tab', { name: /create/i })
      const libraryTab = screen.getByRole('tab', { name: /library/i })
      const createPanel = screen.getByRole('tabpanel', { name: /create/i })
      const libraryPanel = document.getElementById('library-panel')
      
      expect(createTab).toHaveAttribute('aria-controls', createPanel.id)
      expect(libraryTab).toHaveAttribute('aria-controls', libraryPanel.id)
      expect(createPanel).toHaveAttribute('aria-labelledby', createTab.id)
      expect(libraryPanel).toHaveAttribute('aria-labelledby', libraryTab.id)
    })
  })

  describe('Component Integration', () => {
    test('component structure supports future content replacement', () => {
      render(<SubTabs />)
      
      const content = screen.getByRole('tablist').closest('.messages-sub-tabs').querySelector('.messages-sub-tabs__content')
      expect(content).toBeInTheDocument()
      
      const panels = content.querySelectorAll('.messages-sub-tabs__panel')
      expect(panels).toHaveLength(2)
    })

    test('CSS classes follow consistent naming convention', () => {
      render(<SubTabs />)
      
      const container = screen.getByRole('tablist').closest('.messages-sub-tabs')
      expect(container).toBeDefined()
      
      const tabs = container.querySelector('.messages-sub-tabs__tabs')
      expect(tabs).toBeDefined()
      
      const content = container.querySelector('.messages-sub-tabs__content')
      expect(content).toBeDefined()
    })
  })
})