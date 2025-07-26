#!/usr/bin/env python3
"""
Extract verses from OSIS XML files to JSON format.
Each verse is on a single line in the XML, marked by start and end tags.
"""

import json
import os
import re
from pathlib import Path


def extract_text_from_line(line):
    """Extract plain text from a verse line, ignoring notes."""
    # Remove note tags and their content
    line = re.sub(r'<ns1:note[^>]*>.*?</ns1:note>', '', line)
    
    # Extract text from ns1:w tags
    text_parts = []
    
    # Find all ns1:w tags and extract their content
    w_pattern = r'<ns1:w[^>]*>([^<]+)</ns1:w>'
    w_matches = re.findall(w_pattern, line)
    
    # Find all transChange tags and extract their content  
    trans_pattern = r'<ns1:transChange[^>]*>([^<]+)</ns1:transChange>'
    trans_matches = re.findall(trans_pattern, line)
    
    # Also find any plain text between tags (punctuation, spaces)
    # Split by tags and keep non-tag content
    tag_pattern = r'<[^>]+>'
    parts = re.split(tag_pattern, line)
    
    # Reconstruct the verse text
    # We need to process the line more carefully to maintain order
    # Use a different approach: replace tags with their content or remove them
    
    # First, replace transChange tags with their content
    line_processed = re.sub(r'<ns1:transChange[^>]*>([^<]+)</ns1:transChange>', r'\1', line)
    
    # Replace ns1:w tags with their content
    line_processed = re.sub(r'<ns1:w[^>]*>([^<]+)</ns1:w>', r'\1', line_processed)
    
    # Remove all remaining tags
    line_processed = re.sub(r'<[^>]+>', '', line_processed)
    
    # Clean up extra whitespace
    text = ' '.join(line_processed.split())
    
    return text.strip()


def extract_verses_from_xml(xml_path):
    """Extract verses from an OSIS XML file."""
    verses = {}
    
    with open(xml_path, 'r', encoding='utf-8') as f:
        for line in f:
            # Check if line contains a verse
            if '<ns1:verse osisID="' in line and 'sID="' in line:
                # Extract the OSIS ID
                osisid_match = re.search(r'osisID="([^"]+)"', line)
                if osisid_match:
                    osisid = osisid_match.group(1)
                    
                    # Extract the verse content between the start and end tags
                    # The verse content is between the sID marker and eID marker
                    start_pattern = r'<ns1:verse[^>]+sID="[^"]+"\s*/>'
                    end_pattern = r'<ns1:verse[^>]+eID="[^"]+"\s*/>'
                    
                    # Find the content between start and end markers
                    content_match = re.search(f'{start_pattern}(.*?){end_pattern}', line)
                    if content_match:
                        verse_content = content_match.group(1)
                        text = extract_text_from_line(verse_content)
                        if text:  # Only add non-empty verses
                            verses[osisid] = text
    
    return verses


def process_all_xml_files(input_dir, output_dir):
    """Process all XML files in the input directory."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Create output directory if it doesn't exist
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Process each book directory
    book_dirs = [d for d in input_path.iterdir() if d.is_dir()]
    total_files = 0
    
    for book_dir in sorted(book_dirs):
        book_name = book_dir.name
        print(f"Processing book: {book_name}")
        
        # Create book directory in output
        book_output_dir = output_path / book_name
        book_output_dir.mkdir(exist_ok=True)
        
        # Process each XML file in the book directory
        xml_files = list(book_dir.glob("*.xml"))
        
        for xml_file in sorted(xml_files):
            # Extract verses
            verses = extract_verses_from_xml(xml_file)
            
            if verses:
                # Create JSON filename
                json_filename = xml_file.stem + ".json"
                json_path = book_output_dir / json_filename
                
                # Write JSON file
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(verses, f, ensure_ascii=False, indent=2)
                
                total_files += 1
                print(f"  Created: {json_path.name} ({len(verses)} verses)")
    
    print(f"\nTotal files processed: {total_files}")


def main():
    """Main function."""
    # Test with a single file first
    test_file = "/Users/christopherhayes/code/osb-bible/obs-bible/public/data/output_chapters/1Chr/1Chr_1.xml"
    
    if os.path.exists(test_file):
        print("Testing with single file...")
        verses = extract_verses_from_xml(test_file)
        print(f"Found {len(verses)} verses")
        
        # Print first few verses as sample
        for i, (osisid, text) in enumerate(list(verses.items())[:5]):
            print(f"{osisid}: {text}")
        
        print("\nProceeding to process all files...")
        input_dir = "/Users/christopherhayes/code/osb-bible/obs-bible/public/data/output_chapters"
        output_dir = "/Users/christopherhayes/code/osb-bible/obs-bible/public/data/output_chapters_json"
        process_all_xml_files(input_dir, output_dir)
    else:
        print(f"Test file not found: {test_file}")


if __name__ == "__main__":
    main()