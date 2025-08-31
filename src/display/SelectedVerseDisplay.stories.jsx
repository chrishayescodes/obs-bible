import SelectedVerseDisplay from './index';

// Mock the verseHistory utility for Storybook
const mockVerseHistoryUtils = {
  getCurrentVerse: () => null,
  clearCurrentVerse: () => console.log('Clear verse called')
};

// Replace the import in the component
jest.doMock('../utils/verseHistory', () => ({
  verseHistoryUtils: mockVerseHistoryUtils
}));

export default {
  title: 'Display/SelectedVerseDisplay',
  component: SelectedVerseDisplay,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A component that displays the currently selected verse from localStorage with full text content, loading states, and user interactions.'
      }
    }
  },
  argTypes: {
    // Component manages its own state through localStorage
  }
};

// Mock fetch for Storybook stories
const mockFetch = (responseData, shouldFail = false, delay = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network error'));
      } else {
        resolve({
          ok: true,
          json: () => Promise.resolve(responseData)
        });
      }
    }, delay);
  });
};

export const NoVerseSelected = {
  name: 'No Verse Selected',
  parameters: {
    docs: {
      description: {
        story: 'Default state when no verse has been selected or stored in localStorage.'
      }
    }
  },
  beforeEach: () => {
    mockVerseHistoryUtils.getCurrentVerse = () => null;
  }
};

export const WithSelectedVerse = {
  name: 'With Selected Verse',
  parameters: {
    docs: {
      description: {
        story: 'Displays a selected verse with full text content loaded from the chapter JSON file.'
      }
    }
  },
  beforeEach: () => {
    // Mock localStorage with a selected verse
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'Genesis',
      bookId: 'Gen',
      chapter: '1',
      verse: 1,
      reference: 'Genesis 1:1',
      timestamp: Date.now(),
      osisId: 'Gen.1.1'
    });

    // Mock successful fetch
    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        'Gen.1.1': 'In the beginning God created the heaven and the earth.',
        'Gen.1.2': 'And the earth was without form, and void; and darkness was upon the face of the deep.'
      })
    );
  }
};

export const LoadingState = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading spinner and message while verse content is being fetched.'
      }
    }
  },
  beforeEach: () => {
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'Psalms',
      bookId: 'Ps',
      chapter: '23',
      verse: 1,
      reference: 'Psalm 23:1',
      timestamp: Date.now(),
      osisId: 'Ps.23.1'
    });

    // Mock slow fetch to show loading state
    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        'Ps.23.1': 'The LORD is my shepherd; I shall not want.'
      }, false, 3000) // 3 second delay
    );
  }
};

export const ErrorState = {
  name: 'Error State',
  parameters: {
    docs: {
      description: {
        story: 'Displays error message when verse content fails to load from the server.'
      }
    }
  },
  beforeEach: () => {
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'John',
      bookId: 'John',
      chapter: '3',
      verse: 16,
      reference: 'John 3:16',
      timestamp: Date.now(),
      osisId: 'John.3.16'
    });

    // Mock failed fetch
    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch(null, true)
    );
  }
};

export const VerseNotFound = {
  name: 'Verse Not Found',
  parameters: {
    docs: {
      description: {
        story: 'Shows error when the requested verse is not found in the chapter data.'
      }
    }
  },
  beforeEach: () => {
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'Romans',
      bookId: 'Rom',
      chapter: '8',
      verse: 28,
      reference: 'Romans 8:28',
      timestamp: Date.now(),
      osisId: 'Rom.8.28'
    });

    // Mock successful fetch but missing verse
    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        'Rom.8.27': 'Different verse here...',
        'Rom.8.29': 'Another verse...'
        // Rom.8.28 is missing
      })
    );
  }
};

export const LongVerse = {
  name: 'Long Verse Content',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the component handles longer verse content with proper text wrapping.'
      }
    }
  },
  beforeEach: () => {
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'Ephesians',
      bookId: 'Eph',
      chapter: '6',
      verse: 11,
      reference: 'Ephesians 6:11',
      timestamp: Date.now(),
      osisId: 'Eph.6.11'
    });

    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        'Eph.6.11': 'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil. For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places.'
      })
    );
  }
};

export const WithTimestamp = {
  name: 'With Recent Selection',
  parameters: {
    docs: {
      description: {
        story: 'Shows verse with timestamp indicating when it was recently selected.'
      }
    }
  },
  beforeEach: () => {
    // Set timestamp to 5 minutes ago
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'Matthew',
      bookId: 'Matt',
      chapter: '5',
      verse: 14,
      reference: 'Matthew 5:14',
      timestamp: fiveMinutesAgo,
      osisId: 'Matt.5.14'
    });

    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        'Matt.5.14': 'Ye are the light of the world. A city that is set on an hill cannot be hid.'
      })
    );
  }
};

export const InteractiveDemo = {
  name: 'Interactive Demo',
  parameters: {
    docs: {
      description: {
        story: 'Interactive example demonstrating the clear verse functionality. Click the × button to clear the selected verse.'
      }
    }
  },
  beforeEach: () => {
    let hasVerse = true;
    
    const originalGetCurrentVerse = () => {
      if (!hasVerse) return null;
      
      return {
        book: '1 Corinthians',
        bookId: '1Cor',
        chapter: '13',
        verse: 4,
        reference: '1 Corinthians 13:4',
        timestamp: Date.now(),
        osisId: '1Cor.13.4'
      };
    };
    
    mockVerseHistoryUtils.getCurrentVerse = originalGetCurrentVerse;
    mockVerseHistoryUtils.clearCurrentVerse = () => {
      hasVerse = false;
      console.log('Verse cleared - component should re-render to show "No Verse Selected"');
    };

    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        '1Cor.13.4': 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.'
      })
    );
  }
};

export const ResponsiveDemo = {
  name: 'Responsive Design',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates responsive behavior at different screen sizes. Resize the viewport to see layout changes.'
      }
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' }
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' }
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' }
        }
      }
    }
  },
  beforeEach: () => {
    mockVerseHistoryUtils.getCurrentVerse = () => ({
      book: 'Proverbs',
      bookId: 'Prov',
      chapter: '3',
      verse: 5,
      reference: 'Proverbs 3:5',
      timestamp: Date.now(),
      osisId: 'Prov.3.5'
    });

    global.fetch = jest.fn().mockImplementation(() => 
      mockFetch({
        'Prov.3.5': 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.'
      })
    );
  }
};