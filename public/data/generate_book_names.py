#!/usr/bin/env python3
"""
Generate book_names.json with simple book names from the KJV structure.

This script extracts book IDs from kjv_structure.json and creates a mapping
to commonly used simple book names instead of the formal long titles.
"""

import json
import os

def extract_simple_name(formal_title, book_id):
    """
    Extract a simple book name from the formal KJV title.
    
    Args:
        formal_title (str): The formal KJV title (e.g., "THE FIRST BOOK OF MOSES CALLED GENESIS")
        book_id (str): The book ID (e.g., "Gen")
    
    Returns:
        str: Simple book name (e.g., "Genesis")
    """
    
    # Manual mapping for complex cases where automatic extraction is difficult
    manual_mappings = {
        'Gen': 'Genesis',
        'Exod': 'Exodus',
        'Lev': 'Leviticus',
        'Num': 'Numbers', 
        'Deut': 'Deuteronomy',
        'Josh': 'Joshua',
        'Judg': 'Judges',
        'Ruth': 'Ruth',
        '1Sam': '1 Samuel',
        '2Sam': '2 Samuel',
        '1Kgs': '1 Kings',
        '2Kgs': '2 Kings',
        '1Chr': '1 Chronicles',
        '2Chr': '2 Chronicles',
        'Ezra': 'Ezra',
        'Neh': 'Nehemiah',
        'Esth': 'Esther',
        'Job': 'Job',
        'Ps': 'Psalms',
        'Prov': 'Proverbs',
        'Eccl': 'Ecclesiastes',
        'Song': 'Song of Songs',
        'Isa': 'Isaiah',
        'Jer': 'Jeremiah',
        'Lam': 'Lamentations',
        'Ezek': 'Ezekiel',
        'Dan': 'Daniel',
        'Hos': 'Hosea',
        'Joel': 'Joel',
        'Amos': 'Amos',
        'Obad': 'Obadiah',
        'Jonah': 'Jonah',
        'Mic': 'Micah',
        'Nah': 'Nahum',
        'Hab': 'Habakkuk',
        'Zeph': 'Zephaniah',
        'Hag': 'Haggai',
        'Zech': 'Zechariah',
        'Mal': 'Malachi',
        'Matt': 'Matthew',
        'Mark': 'Mark',
        'Luke': 'Luke',
        'John': 'John',
        'Acts': 'Acts',
        'Rom': 'Romans',
        '1Cor': '1 Corinthians',
        '2Cor': '2 Corinthians',
        'Gal': 'Galatians',
        'Eph': 'Ephesians',
        'Phil': 'Philippians',
        'Col': 'Colossians',
        '1Thess': '1 Thessalonians',
        '2Thess': '2 Thessalonians',
        '1Tim': '1 Timothy',
        '2Tim': '2 Timothy',
        'Titus': 'Titus',
        'Phlm': 'Philemon',
        'Heb': 'Hebrews',
        'Jas': 'James',
        '1Pet': '1 Peter',
        '2Pet': '2 Peter',
        '1John': '1 John',
        '2John': '2 John',
        '3John': '3 John',
        'Jude': 'Jude',
        'Rev': 'Revelation'
    }
    
    return manual_mappings.get(book_id, book_id)

def generate_book_names():
    """
    Generate book_names.json from kjv_structure.json.
    """
    
    # Read the KJV structure file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    kjv_path = os.path.join(script_dir, 'kjv_structure.json')
    
    try:
        with open(kjv_path, 'r', encoding='utf-8') as f:
            kjv_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {kjv_path}")
        return
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {kjv_path}: {e}")
        return
    
    book_names = {}
    
    # Process Old Testament books
    if 'old_testament' in kjv_data and 'books' in kjv_data['old_testament']:
        for book_id, book_data in kjv_data['old_testament']['books'].items():
            formal_title = book_data.get('title', book_id)
            simple_name = extract_simple_name(formal_title, book_id)
            book_names[book_id] = simple_name
            print(f"OT: {book_id} -> {simple_name}")
    
    # Process New Testament books
    if 'new_testament' in kjv_data and 'books' in kjv_data['new_testament']:
        for book_id, book_data in kjv_data['new_testament']['books'].items():
            formal_title = book_data.get('title', book_id)
            simple_name = extract_simple_name(formal_title, book_id)
            book_names[book_id] = simple_name
            print(f"NT: {book_id} -> {simple_name}")
    
    # Write the book names file
    output_path = os.path.join(script_dir, 'book_names.json')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(book_names, f, indent=2, ensure_ascii=False)
        
        print(f"\nSuccessfully generated {output_path}")
        print(f"Total books processed: {len(book_names)}")
        
    except IOError as e:
        print(f"Error: Could not write to {output_path}: {e}")

if __name__ == "__main__":
    generate_book_names()