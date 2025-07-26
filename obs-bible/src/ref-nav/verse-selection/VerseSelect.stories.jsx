import VerseSelect from './';

// Mock book data for Storybook
const mockGenesisData = {
  title: 'Genesis',
  category: 'Pentateuch',
  chapter_count: 50,
  total_verses: 1533,
  chapters: {
    '1': 31, '2': 25, '3': 24, '4': 26, '5': 32,
    '6': 22, '7': 24, '8': 22, '9': 29, '10': 32
  }
};

const mockPsalmsData = {
  title: 'Psalms',
  category: 'Poetry',
  chapter_count: 150,
  total_verses: 2461,
  chapters: {
    '23': 6,    // Short chapter
    '119': 176, // Longest chapter in Bible
    '117': 2    // Shortest chapter in Bible
  }
};

const mockMatthewData = {
  title: 'Matthew',
  category: 'Gospels',
  chapter_count: 28,
  total_verses: 1071,
  chapters: {
    '1': 25, '5': 48, '6': 34, '26': 75, '27': 66
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

const mockTestData = {
  title: '2 John',
  category: 'General Epistles',
  chapter_count: 1,
  total_verses: 13,
  chapters: {
    '1': 13
  }
};

export default {
  title: 'Components/VerseSelect',
  component: VerseSelect,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', minWidth: '800px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export const Default = {
  args: {
    bookData: mockGenesisData,
    chapterNumber: '1',
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const ShortChapter = {
  args: {
    bookData: mockPsalmsData,
    chapterNumber: '117', // Shortest chapter - 2 verses
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const MediumChapter = {
  args: {
    bookData: mockMatthewData,
    chapterNumber: '5', // Sermon on the Mount - 48 verses
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const LongChapter = {
  args: {
    bookData: mockPsalmsData,
    chapterNumber: '119', // Longest chapter - 176 verses
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const SingleChapterBook = {
  args: {
    bookData: mockObadiah,
    chapterNumber: '1',
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const ShortBook = {
  args: {
    bookData: mockTestData,
    chapterNumber: '1',
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const NoChapterSelected = {
  args: {
    bookData: mockGenesisData,
    chapterNumber: null,
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const NoBookSelected = {
  args: {
    bookData: null,
    chapterNumber: '1',
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const InvalidChapter = {
  args: {
    bookData: mockGenesisData,
    chapterNumber: '999', // Chapter that doesn't exist
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
};

export const WithInteraction = {
  args: {
    bookData: mockMatthewData,
    chapterNumber: '6',
    onVerseSelect: (verseNumber) => {
      const verseCount = mockMatthewData.chapters['6'];
      alert(`Selected: ${mockMatthewData.title} 6:${verseNumber}\nChapter has ${verseCount} verses total`);
    },
  },
};

export const WithoutCallback = {
  args: {
    bookData: mockGenesisData,
    chapterNumber: '1',
    // No onVerseSelect callback provided
  },
};

export const GridTest = {
  args: {
    bookData: mockPsalmsData,
    chapterNumber: '119',
    onVerseSelect: (verseNumber) => {
      console.log('Verse selected:', verseNumber);
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '100%', 
        minWidth: '1200px', 
        padding: '20px',
        border: '2px solid red',
        backgroundColor: '#f0f0f0'
      }}>
        <h3>Grid Test - Should show multiple rows with many verses</h3>
        <Story />
      </div>
    ),
  ],
};