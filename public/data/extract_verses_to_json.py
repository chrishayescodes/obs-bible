#!/usr/bin/env python3
"""
Extract verses from OSIS XML files to JSON format.
Each verse is on a single line in the XML, marked by start and end tags.
"""

import json
import os
import re
from pathlib import Path

# Configuration for verse splitting
MAX_VERSE_LENGTH = 200  # Characters threshold for splitting verses
SPLIT_PATTERN = r'[.!?]\s+'  # Split on sentence boundaries


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


def split_long_verse(text, max_length=MAX_VERSE_LENGTH):
    """Split a long verse into multiple evenly-sized parts at sentence boundaries."""
    if len(text) <= max_length:
        return [text]
    
    # Calculate how many parts we need for approximately even distribution
    num_parts = max(2, (len(text) + max_length - 1) // max_length)
    target_length = len(text) // num_parts
    
    # Split on sentence boundaries first
    sentences = re.split(SPLIT_PATTERN, text)
    
    if len(sentences) <= 1:
        # If no sentence boundaries found, split at word boundaries
        words = text.split()
        words_per_part = len(words) // num_parts
        
        parts = []
        for i in range(num_parts):
            start_idx = i * words_per_part
            if i == num_parts - 1:  # Last part gets remaining words
                end_idx = len(words)
            else:
                end_idx = (i + 1) * words_per_part
            parts.append(' '.join(words[start_idx:end_idx]))
        
        return parts
    
    # Rebuild sentences with their punctuation
    full_sentences = []
    sentence_start = 0
    for i, sentence in enumerate(sentences):
        if sentence.strip():  # Skip empty sentences
            # Find the actual sentence with punctuation in original text
            sentence_end = text.find(sentence, sentence_start) + len(sentence)
            # Look for punctuation after the sentence
            while sentence_end < len(text) and text[sentence_end] in '.!?':
                sentence_end += 1
            # Include any trailing space
            while sentence_end < len(text) and text[sentence_end] == ' ':
                sentence_end += 1
            
            full_sentence = text[sentence_start:sentence_end].strip()
            if full_sentence:
                full_sentences.append(full_sentence)
            sentence_start = sentence_end
    
    # If we couldn't find proper sentences, fall back to original splitting
    if not full_sentences:
        words = text.split()
        words_per_part = len(words) // num_parts
        
        parts = []
        for i in range(num_parts):
            start_idx = i * words_per_part
            if i == num_parts - 1:
                end_idx = len(words)
            else:
                end_idx = (i + 1) * words_per_part
            parts.append(' '.join(words[start_idx:end_idx]))
        
        return parts
    
    # Group sentences into parts aiming for target length
    parts = []
    current_part = ""
    
    for sentence in full_sentences:
        test_part = current_part + (" " if current_part else "") + sentence
        
        # If this sentence would make us exceed target and we have content, start new part
        if len(test_part) > target_length and current_part:
            parts.append(current_part.strip())
            current_part = sentence
        else:
            current_part = test_part
    
    # Add the last part
    if current_part:
        parts.append(current_part.strip())
    
    # If we ended up with too few parts, try to balance them better
    if len(parts) < num_parts and len(parts) > 1:
        # Find the longest part and try to split it
        longest_idx = max(range(len(parts)), key=lambda i: len(parts[i]))
        longest_part = parts[longest_idx]
        
        if len(longest_part) > max_length:
            # Split the longest part
            words = longest_part.split()
            mid_point = len(words) // 2
            part1 = ' '.join(words[:mid_point])
            part2 = ' '.join(words[mid_point:])
            
            # Replace the longest part with the two new parts
            parts[longest_idx] = part1
            parts.insert(longest_idx + 1, part2)
    
    return parts


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
                            # Check if verse needs to be split
                            verse_parts = split_long_verse(text)
                            
                            if len(verse_parts) == 1:
                                # Single verse, add normally
                                verses[osisid] = text
                            else:
                                # Multiple parts, add with letter suffixes
                                for i, part in enumerate(verse_parts):
                                    suffix = chr(ord('a') + i)  # 'a', 'b', 'c', etc.
                                    split_osisid = f"{osisid}{suffix}"
                                    verses[split_osisid] = part
    
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