import Breadcrumb from './';

// Mock book data for Storybook
const mockGenesisData = {
  title: 'Genesis',
  category: 'Pentateuch',
  chapter_count: 50,
  total_verses: 1533,
  chapters: {
    '1': 31, '2': 25, '3': 24, '4': 26, '5': 32,
    '10': 32, '15': 21, '22': 24, '25': 34
  }
};

const mockPsalmsData = {
  title: 'Psalms',
  category: 'Poetry',
  chapter_count: 150,
  total_verses: 2461,
  chapters: {
    '1': 6, '23': 6, '51': 19, '119': 176, '150': 6
  }
};

const mockMatthewData = {
  title: 'Matthew',
  category: 'Gospels',
  chapter_count: 28,
  total_verses: 1071,
  chapters: {
    '1': 25, '5': 48, '6': 34, '16': 28, '26': 75, '28': 20
  }
};

const mockObadiah = {
  title: 'Obadiah',
  category: 'Minor Prophets',
  chapter_count: 1,
  total_verses: 21,
  chapters: {
    '1': 21
  }
};

const mockPhilemon = {
  title: 'Philemon',
  category: 'Pauline Epistles',
  chapter_count: 1,
  total_verses: 25,
  chapters: {
    '1': 25
  }
};

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', maxWidth: '800px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export const InitialState = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows only the Books button when no selections have been made.',
      },
    },
  },
};

export const BookSelected = {
  args: {
    selectedBook: mockGenesisData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows Books > Genesis when a book is selected. The book button is disabled as it represents the current view.',
      },
    },
  },
};

export const ChapterSelected = {
  args: {
    selectedBook: mockGenesisData,
    selectedChapter: '1',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows Books > Genesis > Chapter 1 when a chapter is selected. Book button becomes clickable, chapter button is disabled.',
      },
    },
  },
};

export const VerseSelected = {
  args: {
    selectedBook: mockGenesisData,
    selectedChapter: '1',
    selectedVerse: '5',
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete breadcrumb with verse selected. Shows verse reference and chapter info below breadcrumb.',
      },
    },
  },
};

export const LongChapter = {
  args: {
    selectedBook: mockPsalmsData,
    selectedChapter: '119',
    selectedVerse: '105',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with Psalm 119 (longest chapter in the Bible with 176 verses).',
      },
    },
  },
};

export const NewTestament = {
  args: {
    selectedBook: mockMatthewData,
    selectedChapter: '26',
    selectedVerse: '39',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with New Testament book (Matthew) showing different formatting.',
      },
    },
  },
};

export const SingleChapterBook = {
  args: {
    selectedBook: mockObadiah,
    selectedChapter: '1',
    selectedVerse: '15',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with single-chapter book (Obadiah) showing how it displays.',
      },
    },
  },
};

export const ShortBook = {
  args: {
    selectedBook: mockPhilemon,
    selectedChapter: '1',
    selectedVerse: '10',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with short single-chapter book (Philemon).',
      },
    },
  },
};

export const WithInteractions = {
  args: {
    selectedBook: mockGenesisData,
    selectedChapter: '3',
    selectedVerse: '15',
    onReset: () => {
      alert('Navigate to Books - would show BibleBookSelector');
    },
    onBookSelect: () => {
      alert('Navigate to Genesis chapters - would show ChapterSelector');
    },
    onChapterSelect: () => {
      alert('Navigate to Genesis 3 verses - would show VerseSelect');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive breadcrumb with click handlers that show alerts (in real app would navigate).',
      },
    },
  },
};

export const ResponsiveTest = {
  args: {
    selectedBook: mockMatthewData,
    selectedChapter: '5',
    selectedVerse: '3',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <h3>Desktop View</h3>
        <div style={{ marginBottom: '20px' }}>
          <Story />
        </div>
        
        <h3>Tablet View</h3>
        <div style={{ maxWidth: '600px', marginBottom: '20px' }}>
          <Story />
        </div>
        
        <h3>Mobile View</h3>
        <div style={{ maxWidth: '320px' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows how the breadcrumb adapts to different screen sizes.',
      },
    },
  },
};

export const DarkModePreview = {
  args: {
    selectedBook: mockGenesisData,
    selectedChapter: '1',
    selectedVerse: '1',
  },
  decorators: [
    (Story) => (
      <div>
        <h3>Light Mode</h3>
        <div style={{ padding: '20px', marginBottom: '20px' }}>
          <Story />
        </div>
        
        <h3>Dark Mode</h3>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#1f2937', 
          borderRadius: '8px' 
        }} className="dark">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows breadcrumb appearance in both light and dark modes.',
      },
    },
  },
};