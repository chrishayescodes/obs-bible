import BibleBookSelector from './';

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
          '6': 22, '7': 24, '8': 22, '9': 29, '10': 32
        }
      },
      Exod: {
        title: 'Exodus',
        category: 'Pentateuch',
        chapter_count: 40,
        total_verses: 1213,
        chapters: {
          '1': 22, '2': 25, '3': 22, '4': 31, '5': 23
        }
      },
      Lev: {
        title: 'Leviticus',
        category: 'Pentateuch',
        chapter_count: 27,
        total_verses: 859,
        chapters: {
          '1': 17, '2': 16, '3': 17, '4': 35, '5': 19
        }
      },
      Josh: {
        title: 'Joshua',
        category: 'Historical',
        chapter_count: 24,
        total_verses: 658,
        chapters: {
          '1': 18, '2': 24, '3': 17, '4': 24, '5': 15
        }
      },
      Judg: {
        title: 'Judges',
        category: 'Historical',
        chapter_count: 21,
        total_verses: 618,
        chapters: {
          '1': 36, '2': 23, '3': 31, '4': 24, '5': 31
        }
      },
      Job: {
        title: 'Job',
        category: 'Poetry',
        chapter_count: 42,
        total_verses: 1070,
        chapters: {
          '1': 22, '2': 13, '3': 26, '4': 21, '5': 27
        }
      },
      Ps: {
        title: 'Psalms',
        category: 'Poetry',
        chapter_count: 150,
        total_verses: 2461,
        chapters: {
          '1': 6, '2': 12, '3': 8, '4': 8, '5': 12
        }
      },
      Isa: {
        title: 'Isaiah',
        category: 'Major Prophets',
        chapter_count: 66,
        total_verses: 1292,
        chapters: {
          '1': 31, '2': 22, '3': 26, '4': 6, '5': 30
        }
      },
      Hos: {
        title: 'Hosea',
        category: 'Minor Prophets',
        chapter_count: 14,
        total_verses: 197,
        chapters: {
          '1': 11, '2': 23, '3': 5, '4': 19, '5': 15
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
          '1': 25, '2': 23, '3': 17, '4': 25, '5': 48
        }
      },
      Mark: {
        title: 'Mark',
        category: 'Gospels',
        chapter_count: 16,
        total_verses: 678,
        chapters: {
          '1': 45, '2': 28, '3': 35, '4': 41, '5': 43
        }
      },
      Luke: {
        title: 'Luke',
        category: 'Gospels',
        chapter_count: 24,
        total_verses: 1151,
        chapters: {
          '1': 80, '2': 52, '3': 38, '4': 44, '5': 39
        }
      },
      John: {
        title: 'John',
        category: 'Gospels',
        chapter_count: 21,
        total_verses: 879,
        chapters: {
          '1': 51, '2': 25, '3': 36, '4': 54, '5': 47
        }
      },
      Acts: {
        title: 'Acts',
        category: 'History',
        chapter_count: 28,
        total_verses: 1007,
        chapters: {
          '1': 26, '2': 47, '3': 26, '4': 37, '5': 42
        }
      },
      Rom: {
        title: 'Romans',
        category: 'Pauline Epistles',
        chapter_count: 16,
        total_verses: 433,
        chapters: {
          '1': 32, '2': 29, '3': 31, '4': 25, '5': 21
        }
      },
      '1Cor': {
        title: '1 Corinthians',
        category: 'Pauline Epistles',
        chapter_count: 16,
        total_verses: 437,
        chapters: {
          '1': 31, '2': 16, '3': 23, '4': 21, '5': 13
        }
      },
      Heb: {
        title: 'Hebrews',
        category: 'General Epistles',
        chapter_count: 13,
        total_verses: 303,
        chapters: {
          '1': 14, '2': 18, '3': 19, '4': 16, '5': 14
        }
      },
      Rev: {
        title: 'Revelation',
        category: 'Prophecy',
        chapter_count: 22,
        total_verses: 404,
        chapters: {
          '1': 20, '2': 29, '3': 22, '4': 11, '5': 14
        }
      }
    }
  }
};

// More complete mock data with all 66 books
const completeMockBibleData = {
  old_testament: {
    name: 'Old Testament',
    books: {
      Gen: { title: 'Genesis', category: 'Pentateuch', chapter_count: 50, total_verses: 1533 },
      Exod: { title: 'Exodus', category: 'Pentateuch', chapter_count: 40, total_verses: 1213 },
      Lev: { title: 'Leviticus', category: 'Pentateuch', chapter_count: 27, total_verses: 859 },
      Num: { title: 'Numbers', category: 'Pentateuch', chapter_count: 36, total_verses: 1288 },
      Deut: { title: 'Deuteronomy', category: 'Pentateuch', chapter_count: 34, total_verses: 959 },
      Josh: { title: 'Joshua', category: 'Historical', chapter_count: 24, total_verses: 658 },
      Judg: { title: 'Judges', category: 'Historical', chapter_count: 21, total_verses: 618 },
      Ruth: { title: 'Ruth', category: 'Historical', chapter_count: 4, total_verses: 85 },
      '1Sam': { title: '1 Samuel', category: 'Historical', chapter_count: 31, total_verses: 810 },
      '2Sam': { title: '2 Samuel', category: 'Historical', chapter_count: 24, total_verses: 695 },
      '1Kgs': { title: '1 Kings', category: 'Historical', chapter_count: 22, total_verses: 816 },
      '2Kgs': { title: '2 Kings', category: 'Historical', chapter_count: 25, total_verses: 719 },
      '1Chr': { title: '1 Chronicles', category: 'Historical', chapter_count: 29, total_verses: 942 },
      '2Chr': { title: '2 Chronicles', category: 'Historical', chapter_count: 36, total_verses: 822 },
      Ezra: { title: 'Ezra', category: 'Historical', chapter_count: 10, total_verses: 280 },
      Neh: { title: 'Nehemiah', category: 'Historical', chapter_count: 13, total_verses: 406 },
      Esth: { title: 'Esther', category: 'Historical', chapter_count: 10, total_verses: 167 },
      Job: { title: 'Job', category: 'Poetry', chapter_count: 42, total_verses: 1070 },
      Ps: { title: 'Psalms', category: 'Poetry', chapter_count: 150, total_verses: 2461 },
      Prov: { title: 'Proverbs', category: 'Poetry', chapter_count: 31, total_verses: 915 },
      Eccl: { title: 'Ecclesiastes', category: 'Poetry', chapter_count: 12, total_verses: 222 },
      Song: { title: 'Song of Solomon', category: 'Poetry', chapter_count: 8, total_verses: 117 },
      Isa: { title: 'Isaiah', category: 'Major Prophets', chapter_count: 66, total_verses: 1292 },
      Jer: { title: 'Jeremiah', category: 'Major Prophets', chapter_count: 52, total_verses: 1364 },
      Lam: { title: 'Lamentations', category: 'Major Prophets', chapter_count: 5, total_verses: 154 },
      Ezek: { title: 'Ezekiel', category: 'Major Prophets', chapter_count: 48, total_verses: 1273 },
      Dan: { title: 'Daniel', category: 'Major Prophets', chapter_count: 12, total_verses: 357 },
      Hos: { title: 'Hosea', category: 'Minor Prophets', chapter_count: 14, total_verses: 197 },
      Joel: { title: 'Joel', category: 'Minor Prophets', chapter_count: 3, total_verses: 73 },
      Amos: { title: 'Amos', category: 'Minor Prophets', chapter_count: 9, total_verses: 146 },
      Obad: { title: 'Obadiah', category: 'Minor Prophets', chapter_count: 1, total_verses: 21 },
      Jonah: { title: 'Jonah', category: 'Minor Prophets', chapter_count: 4, total_verses: 48 },
      Mic: { title: 'Micah', category: 'Minor Prophets', chapter_count: 7, total_verses: 105 },
      Nah: { title: 'Nahum', category: 'Minor Prophets', chapter_count: 3, total_verses: 47 },
      Hab: { title: 'Habakkuk', category: 'Minor Prophets', chapter_count: 3, total_verses: 56 },
      Zeph: { title: 'Zephaniah', category: 'Minor Prophets', chapter_count: 3, total_verses: 53 },
      Hag: { title: 'Haggai', category: 'Minor Prophets', chapter_count: 2, total_verses: 38 },
      Zech: { title: 'Zechariah', category: 'Minor Prophets', chapter_count: 14, total_verses: 211 },
      Mal: { title: 'Malachi', category: 'Minor Prophets', chapter_count: 4, total_verses: 55 }
    }
  },
  new_testament: {
    name: 'New Testament',
    books: {
      Matt: { title: 'Matthew', category: 'Gospels', chapter_count: 28, total_verses: 1071 },
      Mark: { title: 'Mark', category: 'Gospels', chapter_count: 16, total_verses: 678 },
      Luke: { title: 'Luke', category: 'Gospels', chapter_count: 24, total_verses: 1151 },
      John: { title: 'John', category: 'Gospels', chapter_count: 21, total_verses: 879 },
      Acts: { title: 'Acts', category: 'History', chapter_count: 28, total_verses: 1007 },
      Rom: { title: 'Romans', category: 'Pauline Epistles', chapter_count: 16, total_verses: 433 },
      '1Cor': { title: '1 Corinthians', category: 'Pauline Epistles', chapter_count: 16, total_verses: 437 },
      '2Cor': { title: '2 Corinthians', category: 'Pauline Epistles', chapter_count: 13, total_verses: 257 },
      Gal: { title: 'Galatians', category: 'Pauline Epistles', chapter_count: 6, total_verses: 149 },
      Eph: { title: 'Ephesians', category: 'Pauline Epistles', chapter_count: 6, total_verses: 155 },
      Phil: { title: 'Philippians', category: 'Pauline Epistles', chapter_count: 4, total_verses: 104 },
      Col: { title: 'Colossians', category: 'Pauline Epistles', chapter_count: 4, total_verses: 95 },
      '1Thess': { title: '1 Thessalonians', category: 'Pauline Epistles', chapter_count: 5, total_verses: 89 },
      '2Thess': { title: '2 Thessalonians', category: 'Pauline Epistles', chapter_count: 3, total_verses: 47 },
      '1Tim': { title: '1 Timothy', category: 'Pauline Epistles', chapter_count: 6, total_verses: 113 },
      '2Tim': { title: '2 Timothy', category: 'Pauline Epistles', chapter_count: 4, total_verses: 83 },
      Titus: { title: 'Titus', category: 'Pauline Epistles', chapter_count: 3, total_verses: 46 },
      Phlm: { title: 'Philemon', category: 'Pauline Epistles', chapter_count: 1, total_verses: 25 },
      Heb: { title: 'Hebrews', category: 'General Epistles', chapter_count: 13, total_verses: 303 },
      Jas: { title: 'James', category: 'General Epistles', chapter_count: 5, total_verses: 108 },
      '1Pet': { title: '1 Peter', category: 'General Epistles', chapter_count: 5, total_verses: 105 },
      '2Pet': { title: '2 Peter', category: 'General Epistles', chapter_count: 3, total_verses: 61 },
      '1John': { title: '1 John', category: 'General Epistles', chapter_count: 5, total_verses: 105 },
      '2John': { title: '2 John', category: 'General Epistles', chapter_count: 1, total_verses: 13 },
      '3John': { title: '3 John', category: 'General Epistles', chapter_count: 1, total_verses: 14 },
      Jude: { title: 'Jude', category: 'General Epistles', chapter_count: 1, total_verses: 25 },
      Rev: { title: 'Revelation', category: 'Prophecy', chapter_count: 22, total_verses: 404 }
    }
  }
};

export default {
  title: 'Components/BibleBookSelector',
  component: BibleBookSelector,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    bibleData: mockBibleData,
    onBookSelect: (bookId, bookInfo) => {
      console.log('Book selected:', bookId, bookInfo);
    },
  },
};

export const Complete = {
  args: {
    bibleData: completeMockBibleData,
    onBookSelect: (bookId, bookInfo) => {
      console.log('Book selected:', bookId, bookInfo);
    },
  },
};

export const Loading = {
  args: {
    bibleData: null,
    onBookSelect: (bookId, bookInfo) => {
      console.log('Book selected:', bookId, bookInfo);
    },
  },
};

export const WithInteraction = {
  args: {
    bibleData: completeMockBibleData,
    onBookSelect: (bookId, bookInfo) => {
      alert(`Selected: ${bookInfo.title} (${bookInfo.category})\n${bookInfo.chapter_count} chapters • ${bookInfo.total_verses} verses`);
    },
  },
};