import xml.etree.ElementTree as ET
from collections import defaultdict
import json

# Define book categories
BOOK_CATEGORIES = {
    # Old Testament
    # Pentateuch (Torah/Law)
    'Gen': 'Pentateuch',
    'Exod': 'Pentateuch',
    'Lev': 'Pentateuch',
    'Num': 'Pentateuch',
    'Deut': 'Pentateuch',
    
    # Historical Books
    'Josh': 'Historical',
    'Judg': 'Historical',
    'Ruth': 'Historical',
    '1Sam': 'Historical',
    '2Sam': 'Historical',
    '1Kgs': 'Historical',
    '2Kgs': 'Historical',
    '1Chr': 'Historical',
    '2Chr': 'Historical',
    'Ezra': 'Historical',
    'Neh': 'Historical',
    'Esth': 'Historical',
    
    # Wisdom/Poetry Books
    'Job': 'Poetry',
    'Ps': 'Poetry',
    'Prov': 'Poetry',
    'Eccl': 'Poetry',
    'Song': 'Poetry',
    
    # Major Prophets
    'Isa': 'Major Prophets',
    'Jer': 'Major Prophets',
    'Lam': 'Major Prophets',
    'Ezek': 'Major Prophets',
    'Dan': 'Major Prophets',
    
    # Minor Prophets
    'Hos': 'Minor Prophets',
    'Joel': 'Minor Prophets',
    'Amos': 'Minor Prophets',
    'Obad': 'Minor Prophets',
    'Jonah': 'Minor Prophets',
    'Mic': 'Minor Prophets',
    'Nah': 'Minor Prophets',
    'Hab': 'Minor Prophets',
    'Zeph': 'Minor Prophets',
    'Hag': 'Minor Prophets',
    'Zech': 'Minor Prophets',
    'Mal': 'Minor Prophets',
    
    # New Testament
    # Gospels
    'Matt': 'Gospels',
    'Mark': 'Gospels',
    'Luke': 'Gospels',
    'John': 'Gospels',
    
    # History
    'Acts': 'History',
    
    # Pauline Epistles
    'Rom': 'Pauline Epistles',
    '1Cor': 'Pauline Epistles',
    '2Cor': 'Pauline Epistles',
    'Gal': 'Pauline Epistles',
    'Eph': 'Pauline Epistles',
    'Phil': 'Pauline Epistles',
    'Col': 'Pauline Epistles',
    '1Thess': 'Pauline Epistles',
    '2Thess': 'Pauline Epistles',
    '1Tim': 'Pauline Epistles',
    '2Tim': 'Pauline Epistles',
    'Titus': 'Pauline Epistles',
    'Phlm': 'Pauline Epistles',
    
    # General Epistles
    'Heb': 'General Epistles',
    'Jas': 'General Epistles',
    '1Pet': 'General Epistles',
    '2Pet': 'General Epistles',
    '1John': 'General Epistles',
    '2John': 'General Epistles',
    '3John': 'General Epistles',
    'Jude': 'General Epistles',
    
    # Prophecy
    'Rev': 'Prophecy'
}

def parse_kjv_bible(xml_path):
    """Parse KJV Bible XML to extract book names, chapters, and verse counts."""
    
    # Parse the XML file
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Define the namespace
    ns = {'osis': 'http://www.bibletechnologies.net/2003/OSIS/namespace'}
    
    # Dictionary to store results
    bible_structure = {}
    
    # Find all book divs
    for book in root.findall('.//osis:div[@type="book"]', ns):
        book_id = book.get('osisID')
        
        # Get the book title
        title_elem = book.find('osis:title[@type="main"]', ns)
        book_title = title_elem.text if title_elem is not None else book_id
        
        # Initialize book structure
        bible_structure[book_id] = {
            'title': book_title,
            'category': BOOK_CATEGORIES.get(book_id, 'Unknown'),
            'chapters': {}
        }
        
        # Find all chapters in this book
        for chapter in book.findall('.//osis:chapter', ns):
            chapter_id = chapter.get('osisID')
            chapter_num = chapter_id.split('.')[-1] if chapter_id else None
            
            if chapter_num:
                # Count verses in this chapter
                verses = chapter.findall('.//osis:verse', ns)
                verse_count = len(verses) // 2  # Each verse has sID and eID
                
                bible_structure[book_id]['chapters'][chapter_num] = verse_count
        
        # Calculate total chapters and verses for the book
        chapter_count = len(bible_structure[book_id]['chapters'])
        total_verses = sum(bible_structure[book_id]['chapters'].values())
        
        bible_structure[book_id]['chapter_count'] = chapter_count
        bible_structure[book_id]['total_verses'] = total_verses
    
    # Organize books by testament
    old_testament_books = ['Gen', 'Exod', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', 
                          '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth',
                          'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Isa', 'Jer', 'Lam', 'Ezek', 'Dan',
                          'Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal']
    
    new_testament_books = ['Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph', 
                          'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb',
                          'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev']
    
    # Reorganize into testament structure
    organized_structure = {
        'old_testament': {
            'name': 'Old Testament',
            'books': {}
        },
        'new_testament': {
            'name': 'New Testament',
            'books': {}
        }
    }
    
    for book_id, book_info in bible_structure.items():
        if book_id in old_testament_books:
            organized_structure['old_testament']['books'][book_id] = book_info
        elif book_id in new_testament_books:
            organized_structure['new_testament']['books'][book_id] = book_info
    
    return organized_structure

def print_bible_summary(bible_structure):
    """Print a formatted summary of the Bible structure."""
    
    print("KJV Bible Structure Summary")
    print("=" * 100)
    print(f"{'Book':<40} {'Category':<20} {'Chapters':<10} {'Total Verses':<15}")
    print("-" * 100)
    
    total_books = 0
    total_chapters = 0
    total_verses = 0
    
    # Print Old Testament
    print(f"\n{bible_structure['old_testament']['name'].upper()}")
    print("-" * 50)
    for book_id, book_info in bible_structure['old_testament']['books'].items():
        total_books += 1
        total_chapters += book_info['chapter_count']
        total_verses += book_info['total_verses']
        
        print(f"{book_info['title']:<40} {book_info['category']:<20} {book_info['chapter_count']:<10} {book_info['total_verses']:<15}")
    
    # Print New Testament
    print(f"\n{bible_structure['new_testament']['name'].upper()}")
    print("-" * 50)
    for book_id, book_info in bible_structure['new_testament']['books'].items():
        total_books += 1
        total_chapters += book_info['chapter_count']
        total_verses += book_info['total_verses']
        
        print(f"{book_info['title']:<40} {book_info['category']:<20} {book_info['chapter_count']:<10} {book_info['total_verses']:<15}")
    
    print("-" * 100)
    print(f"{'TOTAL':<40} {'':<20} {total_chapters:<10} {total_verses:<15}")
    print(f"\nTotal Books: {total_books}")
    
    # Also print detailed chapter breakdown for each book
    print("\n\nDetailed Chapter Breakdown")
    print("=" * 80)
    
    for testament_key, testament_data in bible_structure.items():
        print(f"\n{testament_data['name'].upper()}")
        print("=" * 50)
        
        for book_id, book_info in testament_data['books'].items():
            print(f"\n{book_info['title']} ({book_id})")
            print("-" * 40)
            
            for chapter_num in sorted(book_info['chapters'].keys(), key=int):
                verse_count = book_info['chapters'][chapter_num]
                print(f"  Chapter {chapter_num}: {verse_count} verses")

def save_to_json(bible_structure, output_path):
    """Save the Bible structure to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(bible_structure, f, indent=2, ensure_ascii=False)
    print(f"\nData saved to: {output_path}")

if __name__ == "__main__":
    # Path to the KJV XML file
    xml_path = "/Users/christopherhayes/code/osb-bible/osb-bible/public/data/kjvfull.xml"
    
    print("Parsing KJV Bible XML...")
    bible_structure = parse_kjv_bible(xml_path)
    
    # Print summary
    print_bible_summary(bible_structure)
    
    # Save to JSON
    output_path = "/Users/christopherhayes/code/osb-bible/osb-bible/public/data/kjv_structure.json"
    save_to_json(bible_structure, output_path)