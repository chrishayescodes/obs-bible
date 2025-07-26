import Navigation from './';

// Mock Bible data for Storybook
const mockBibleData = {
  old_testament: {
    name: 'Old Testament',
    books: {
      Gen: {
        title: 'Genesis',
        category: 'Pentateuch',
        chapter_count: 50,
        total_verses: 1533,
        chapters: {
          '1': 31, '2': 25, '3': 24, '4': 26, '5': 32,
          '6': 22, '7': 24, '8': 22, '9': 29, '10': 32,
          '11': 32, '12': 20, '13': 18, '14': 24, '15': 21,
          '16': 16, '17': 27, '18': 33, '19': 38, '20': 18,
          '21': 34, '22': 24, '23': 20, '24': 67, '25': 34,
          '26': 35, '27': 46, '28': 22, '29': 35, '30': 43,
          '31': 55, '32': 32, '33': 20, '34': 31, '35': 29,
          '36': 43, '37': 36, '38': 30, '39': 23, '40': 23,
          '41': 57, '42': 38, '43': 34, '44': 34, '45': 28,
          '46': 34, '47': 31, '48': 22, '49': 33, '50': 26
        }
      },
      Exod: {
        title: 'Exodus',
        category: 'Pentateuch',
        chapter_count: 40,
        total_verses: 1213,
        chapters: {
          '1': 22, '2': 25, '3': 22, '4': 31, '5': 23,
          '6': 30, '7': 25, '8': 32, '9': 35, '10': 29,
          '11': 10, '12': 51, '13': 22, '14': 31, '15': 27,
          '16': 36, '17': 16, '18': 27, '19': 25, '20': 26,
          '21': 36, '22': 31, '23': 33, '24': 18, '25': 40,
          '26': 37, '27': 21, '28': 43, '29': 46, '30': 38,
          '31': 18, '32': 35, '33': 23, '34': 35, '35': 35,
          '36': 38, '37': 29, '38': 31, '39': 43, '40': 38
        }
      },
      Ps: {
        title: 'Psalms',
        category: 'Poetry',
        chapter_count: 150,
        total_verses: 2461,
        chapters: {
          '1': 6, '2': 12, '3': 8, '4': 8, '5': 12,
          '23': 6, '51': 19, '119': 176, '150': 6
        }
      },
      Obad: {
        title: 'Obadiah',
        category: 'Minor Prophets',
        chapter_count: 1,
        total_verses: 21,
        chapters: {
          '1': 21
        }
      }
    }
  },
  new_testament: {
    name: 'New Testament',
    books: {
      Matt: {
        title: 'Matthew',
        category: 'Gospels',
        chapter_count: 28,
        total_verses: 1071,
        chapters: {
          '1': 25, '2': 23, '3': 17, '4': 25, '5': 48,
          '6': 34, '7': 29, '8': 34, '9': 38, '10': 42,
          '11': 30, '12': 50, '13': 58, '14': 36, '15': 39,
          '16': 28, '17': 27, '18': 35, '19': 30, '20': 34,
          '21': 46, '22': 46, '23': 39, '24': 51, '25': 46,
          '26': 75, '27': 66, '28': 20
        }
      },
      John: {
        title: 'John',
        category: 'Gospels',
        chapter_count: 21,
        total_verses: 879,
        chapters: {
          '1': 51, '2': 25, '3': 36, '4': 54, '5': 47,
          '6': 71, '7': 53, '8': 59, '9': 41, '10': 42,
          '11': 57, '12': 50, '13': 38, '14': 31, '15': 27,
          '16': 33, '17': 26, '18': 40, '19': 42, '20': 31,
          '21': 25
        }
      },
      Phlm: {
        title: 'Philemon',
        category: 'Pauline Epistles',
        chapter_count: 1,
        total_verses: 25,
        chapters: {
          '1': 25
        }
      }
    }
  }
};

const loadingBibleData = null;

export default {
  title: 'Components/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export const InitialState = {
  args: {
    bibleData: mockBibleData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the initial state with BibleBookSelector displayed and breadcrumb showing only Books button.',
      },
    },
  },
};

export const LoadingState = {
  args: {
    bibleData: loadingBibleData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the navigation component when Bible data is still loading (null bibleData).',
      },
    },
  },
};

export const EmptyData = {
  args: {
    bibleData: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the navigation component with empty Bible data object.',
      },
    },
  },
};

export const InteractiveNavigation = {
  args: {
    bibleData: mockBibleData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive navigation component. Click on books to see chapters, chapters to see verses, and use breadcrumb to navigate back.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // This story allows for manual interaction testing
    // Users can click through the navigation to test all states
  },
};

export const CompactView = {
  args: {
    bibleData: {
      old_testament: {
        name: 'Old Testament',
        books: {
          Gen: mockBibleData.old_testament.books.Gen,
          Ps: mockBibleData.old_testament.books.Ps,
        }
      },
      new_testament: {
        name: 'New Testament',
        books: {
          Matt: mockBibleData.new_testament.books.Matt,
          Phlm: mockBibleData.new_testament.books.Phlm,
        }
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation with reduced Bible data showing only a few books for compact demonstration.',
      },
    },
  },
};

export const SingleChapterBooks = {
  args: {
    bibleData: {
      old_testament: {
        name: 'Old Testament',
        books: {
          Obad: mockBibleData.old_testament.books.Obad,
        }
      },
      new_testament: {
        name: 'New Testament',
        books: {
          Phlm: mockBibleData.new_testament.books.Phlm,
        }
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation showing only single-chapter books (Obadiah and Philemon) to test edge cases.',
      },
    },
  },
};

export const ResponsiveTest = {
  args: {
    bibleData: mockBibleData,
  },
  decorators: [
    (Story) => (
      <div>
        <h3>Desktop View</h3>
        <div style={{ marginBottom: '40px', border: '1px solid #ddd', padding: '20px' }}>
          <Story />
        </div>
        
        <h3>Tablet View</h3>
        <div style={{ maxWidth: '768px', marginBottom: '40px', border: '1px solid #ddd', padding: '20px' }}>
          <Story />
        </div>
        
        <h3>Mobile View</h3>
        <div style={{ maxWidth: '375px', border: '1px solid #ddd', padding: '20px' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows how the Navigation component adapts to different screen sizes and responsive breakpoints.',
      },
    },
  },
};

export const DarkModePreview = {
  args: {
    bibleData: mockBibleData,
  },
  decorators: [
    (Story) => (
      <div>
        <h3>Light Mode</h3>
        <div style={{ padding: '20px', marginBottom: '40px', border: '1px solid #ddd' }}>
          <Story />
        </div>
        
        <h3>Dark Mode</h3>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#1f2937', 
          borderRadius: '8px',
          border: '1px solid #374151'
        }} className="dark">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows Navigation component appearance in both light and dark modes.',
      },
    },
  },
};

export const NavigationFlow = {
  args: {
    bibleData: {
      old_testament: {
        name: 'Old Testament',
        books: {
          Gen: {
            title: 'Genesis',
            category: 'Pentateuch',
            chapter_count: 3,
            total_verses: 80,
            chapters: {
              '1': 31, '2': 25, '3': 24
            }
          }
        }
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Simplified navigation with Genesis having only 3 chapters for easy demonstration of the complete navigation flow.',
      },
    },
  },
};