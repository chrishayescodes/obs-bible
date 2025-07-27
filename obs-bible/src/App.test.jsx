import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from './App';

// Mock CSS imports
jest.mock('./App.css', () => ({}));

// Mock fetch for Bible data
global.fetch = jest.fn();

// Mock AppNavigation component
jest.mock('./nav/AppNavigation', () => {
  return function MockAppNavigation({ bibleData }) {
    return (
      <div data-testid="app-navigation">
        {bibleData && <div data-testid="bible-data-passed">Bible data loaded</div>}
      </div>
    );
  };
});

describe('App Component - Routing Architecture', () => {
  const mockBibleData = {
    old_testament: {
      books: {
        Gen: {
          title: 'Genesis',
          category: 'Pentateuch',
          chapter_count: 50,
          chapters: { '1': 31 }
        }
      }
    }
  };

  // Helper function to render App with router
  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App initialization and data loading', () => {
    it('should show loading state while Bible data loads', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      renderWithRouter();

      expect(screen.getByText('Loading Bible data...')).toBeInTheDocument();
      expect(screen.queryByTestId('app-navigation')).not.toBeInTheDocument();
    });

    it('should render AppNavigation component after loading Bible data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading Bible data...')).not.toBeInTheDocument();
    });

    it('should pass Bible data to AppNavigation component', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('bible-data-passed')).toBeInTheDocument();
      });
    });

    it('should handle Bible data fetch errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderWithRouter();

      // Should still render AppNavigation even with fetch error (but with null data)
      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error loading Bible data:', expect.any(Error));
      expect(screen.queryByTestId('bible-data-passed')).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Component structure', () => {
    it('should have clean app wrapper structure', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });

      const appWrapper = screen.getByTestId('app-navigation').parentElement;
      expect(appWrapper).toHaveClass('app');
    });

    it('should only manage Bible data loading, not navigation state', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });

      // App should only render AppNavigation, not any specific navigation UI
      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
      expect(screen.queryByTestId('verse-display')).not.toBeInTheDocument();
      expect(screen.queryByText('← Back to Books')).not.toBeInTheDocument();
    });
  });

  describe('Data fetching behavior', () => {
    it('should fetch Bible data on mount', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      expect(fetch).toHaveBeenCalledWith('/data/kjv_structure.json');

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });
    });

    it('should handle successful Bible data response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('bible-data-passed')).toBeInTheDocument();
      });
    });

    it('should handle failed Bible data response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.reject(new Error('Not found'))
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(screen.queryByTestId('bible-data-passed')).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Integration with AppNavigation', () => {
    it('should render AppNavigation component', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });
    });

    it('should pass bibleData prop to AppNavigation', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('bible-data-passed')).toBeInTheDocument();
      });
    });
  });

  describe('Routing functionality', () => {
    it('should render AppNavigation on root path', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter(['/']);

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });
    });

    it('should render loading screen on /loading path', () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter(['/loading']);

      expect(screen.getByText('Loading Bible data...')).toBeInTheDocument();
    });

    it('should render AppNavigation on unknown paths (fallback)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBibleData)
      });

      renderWithRouter(['/unknown-path']);

      await waitFor(() => {
        expect(screen.getByTestId('app-navigation')).toBeInTheDocument();
      });
    });

    it('should prioritize loading state over route when data is loading', () => {
      fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      renderWithRouter(['/loading']);

      expect(screen.getByText('Loading Bible data...')).toBeInTheDocument();
      expect(screen.queryByTestId('app-navigation')).not.toBeInTheDocument();
    });
  });
});