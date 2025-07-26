import ChapterSelector from './';

// Mock book data for Storybook
const mockGenesisData = {
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
    '46': 28, '47': 31, '48': 22, '49': 33, '50': 26
  }
};

const mockPsalmsData = {
  title: 'Psalms',
  category: 'Poetry',
  chapter_count: 150,
  total_verses: 2461,
  chapters: Object.fromEntries(
    Array.from({ length: 150 }, (_, i) => [`${i + 1}`, Math.floor(Math.random() * 20) + 5])
  )
};

const mockMatthewData = {
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

const mockShortBook = {
  title: '2 John',
  category: 'General Epistles',
  chapter_count: 1,
  total_verses: 13,
  chapters: {
    '1': 13
  }
};

export default {
  title: 'Components/ChapterSelector',
  component: ChapterSelector,
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
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const NewTestamentBook = {
  args: {
    bookData: mockMatthewData,
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const LargeBook = {
  args: {
    bookData: mockPsalmsData,
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const SingleChapterBook = {
  args: {
    bookData: mockObadiah,
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const ShortSingleChapter = {
  args: {
    bookData: mockShortBook,
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const NoBookSelected = {
  args: {
    bookData: null,
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const BookWithoutChapters = {
  args: {
    bookData: {
      title: 'Empty Book',
      category: 'Test',
      chapter_count: 0,
      total_verses: 0
    },
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
    },
  },
};

export const WithInteraction = {
  args: {
    bookData: mockGenesisData,
    onChapterSelect: (chapterNumber) => {
      const verseCount = mockGenesisData.chapters[chapterNumber];
      alert(`Selected: ${mockGenesisData.title} Chapter ${chapterNumber}\n${verseCount} verses`);
    },
  },
};

export const WithoutCallback = {
  args: {
    bookData: mockMatthewData,
    // No onChapterSelect callback provided
  },
};

export const GridTest = {
  args: {
    bookData: mockGenesisData,
    onChapterSelect: (chapterNumber) => {
      console.log('Chapter selected:', chapterNumber);
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
        <h3>Grid Test - Should show multiple columns</h3>
        <Story />
      </div>
    ),
  ],
};