import React from 'react';
import VerseDisplay from './index';

export default {
  title: 'BibleNav/VerseDisplay',
  component: VerseDisplay,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onVerseSelect: { action: 'verse selected' },
  },
};

// Sample verse data from Genesis 1
const genesisData = {
  'Gen.1.1': 'In the beginning God created the heaven and the earth.',
  'Gen.1.2': 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
  'Gen.1.3': 'And God said, Let there be light: and there was light.',
  'Gen.1.4': 'And God saw the light, that it was good: and God divided the light from the darkness.',
  'Gen.1.5': 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
  'Gen.1.6': 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.',
  'Gen.1.7': 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.',
  'Gen.1.8': 'And God called the firmament Heaven. And the evening and the morning were the second day.',
  'Gen.1.9': 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.',
  'Gen.1.10': 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.'
};

// Sample verse data from John 3
const johnData = {
  'John.3.14': 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:',
  'John.3.15': 'That whosoever believeth in him should not perish, but have eternal life.',
  'John.3.16': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
  'John.3.17': 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
  'John.3.18': 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.',
  'John.3.19': 'And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.',
  'John.3.20': 'For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.',
  'John.3.21': 'But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.'
};

// Sample verse data from Psalm 23
const psalmData = {
  'Ps.23.1': 'The LORD is my shepherd; I shall not want.',
  'Ps.23.2': 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
  'Ps.23.3': 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
  'Ps.23.4': 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
  'Ps.23.5': 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.',
  'Ps.23.6': 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.'
};

// Template for stories
const Template = (args) => <VerseDisplay {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  verseData: genesisData,
  bookName: 'Genesis',
  chapterNumber: '1'
};

// Story with selected verse
export const WithSelectedVerse = Template.bind({});
WithSelectedVerse.args = {
  verseData: johnData,
  selectedVerse: 'John.3.16',
  bookName: 'John',
  chapterNumber: '3'
};

// Story with Psalm (shorter chapter)
export const ShortChapter = Template.bind({});
ShortChapter.args = {
  verseData: psalmData,
  bookName: 'Psalms',
  chapterNumber: '23'
};

// Story without header
export const NoHeader = Template.bind({});
NoHeader.args = {
  verseData: genesisData
};

// Empty state
export const EmptyState = Template.bind({});
EmptyState.args = {
  verseData: {},
  bookName: 'Genesis',
  chapterNumber: '1'
};

// Single verse
export const SingleVerse = Template.bind({});
SingleVerse.args = {
  verseData: {
    'Obad.1.21': 'And saviours shall come up on mount Zion to judge the mount of Esau; and the kingdom shall be the LORD\'S.'
  },
  bookName: 'Obadiah',
  chapterNumber: '1'
};

// Long verse text (Esther 8:9)
export const LongVerseText = Template.bind({});
LongVerseText.args = {
  verseData: {
    'Esth.8.9': 'Then were the king\'s scribes called at that time in the third month, that is, the month Sivan, on the three and twentieth day thereof; and it was written according to all that Mordecai commanded unto the Jews, and to the lieutenants, and the deputies and rulers of the provinces which are from India unto Ethiopia, an hundred twenty and seven provinces, unto every province according to the writing thereof, and unto every people after their language, and to the Jews according to their writing, and according to their language.'
  },
  bookName: 'Esther',
  chapterNumber: '8',
  selectedVerse: 'Esth.8.9'
};

// Many verses (to test scrolling)
const manyVerses = {};
for (let i = 1; i <= 50; i++) {
  manyVerses[`Test.1.${i}`] = `This is verse ${i} of the test chapter. It contains sample text to demonstrate scrolling behavior.`;
}

export const ManyVerses = Template.bind({});
ManyVerses.args = {
  verseData: manyVerses,
  bookName: 'Test Book',
  chapterNumber: '1',
  selectedVerse: 'Test.1.25'
};

// Dark mode preview
export const DarkModePreview = () => (
  <div className="dark" style={{ 
    backgroundColor: '#0f172a', 
    padding: '20px', 
    minHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{ width: '600px', height: '400px' }}>
      <VerseDisplay 
        verseData={psalmData}
        bookName="Psalms"
        chapterNumber="23"
        selectedVerse="Ps.23.4"
        onVerseSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  </div>
);
DarkModePreview.parameters = {
  backgrounds: { default: 'dark' }
};

// Interactive example
export const InteractiveExample = () => {
  const [selectedVerse, setSelectedVerse] = React.useState('Gen.1.1');
  
  return (
    <div style={{ height: '500px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <VerseDisplay 
          verseData={genesisData}
          bookName="Genesis"
          chapterNumber="1"
          selectedVerse={selectedVerse}
          onVerseSelect={setSelectedVerse}
        />
      </div>
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h3>Selected Verse Info</h3>
        <p><strong>OSIS ID:</strong> {selectedVerse || 'None'}</p>
        {selectedVerse && genesisData[selectedVerse] && (
          <>
            <p><strong>Verse Number:</strong> {selectedVerse.split('.').pop()}</p>
            <p><strong>Text:</strong></p>
            <blockquote style={{ 
              margin: '10px 0', 
              padding: '10px', 
              borderLeft: '3px solid #3b82f6',
              backgroundColor: 'white' 
            }}>
              {genesisData[selectedVerse]}
            </blockquote>
          </>
        )}
      </div>
    </div>
  );
};

// Navigation highlight demo
export const NavigationHighlightDemo = () => {
  const [selectedVerse, setSelectedVerse] = React.useState('Gen.1.1');
  const [navigateToVerse, setNavigateToVerse] = React.useState(null);
  
  const navigateToRandomVerse = () => {
    const verses = Object.keys(genesisData);
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];
    setNavigateToVerse(randomVerse);
    
    // Clear navigation after highlighting
    setTimeout(() => setNavigateToVerse(null), 1000);
  };
  
  return (
    <div style={{ height: '500px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <VerseDisplay 
          verseData={genesisData}
          bookName="Genesis"
          chapterNumber="1"
          selectedVerse={selectedVerse}
          navigateToVerse={navigateToVerse}
          onVerseSelect={setSelectedVerse}
        />
      </div>
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h3>Navigation Demo</h3>
        <p><strong>Selected:</strong> {selectedVerse || 'None'}</p>
        <p><strong>Navigating to:</strong> {navigateToVerse || 'None'}</p>
        <button 
          onClick={navigateToRandomVerse}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Navigate to Random Verse
        </button>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Click the button to navigate to a random verse with orange highlight and persistent reminder.
          Notice the subtle left border that remains after animation.
        </p>
      </div>
    </div>
  );
};

// Combined navigation and selection demo
export const NavigationWithSelectionDemo = () => {
  const [selectedVerse, setSelectedVerse] = React.useState(null);
  const [navigatedVerses, setNavigatedVerses] = React.useState(new Set(['Gen.1.2', 'Gen.1.4']));
  
  return (
    <div style={{ height: '500px', display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <VerseDisplay 
          verseData={genesisData}
          bookName="Genesis"
          chapterNumber="1"
          selectedVerse={selectedVerse}
          navigateToVerse={navigatedVerses.has('Gen.1.6') ? 'Gen.1.6' : null}
          onVerseSelect={setSelectedVerse}
        />
      </div>
      <div style={{ 
        flex: 1, 
        padding: '20px', 
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h3>Combined States Demo</h3>
        <p><strong>Selected:</strong> {selectedVerse || 'None'}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Verses 2 and 4 have been previously navigated to (orange left border).
          Click any verse to see how all navigation animations clear but reminders remain.
        </p>
        <button 
          onClick={() => setNavigatedVerses(prev => new Set([...prev, 'Gen.1.6']))}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Navigate to Verse 6
        </button>
      </div>
    </div>
  );
};