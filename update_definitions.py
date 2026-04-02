import json
import re
import os

def update_definitions():
    txt_path = 'public/ai_genererede_definitioner.txt'
    json_path = 'public/dictionary.json'

    if not os.path.exists(txt_path):
        print(f"Error: {txt_path} not found.")
        return
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    # 1. Parse definitions
    # Expected format: "Term" er en definition...
    definitions = {}
    print(f"Parsing {txt_path}...")
    with open(txt_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            # Regex to find text in quotes and the following text
            match = re.match(r'^"([^"]+)"\s*(.*)$', line)
            if match:
                term = match.group(1).lower().strip()
                definition = match.group(2).strip()
                definitions[term] = definition
            else:
                print(f"Warning: Line {line_num} does not match expected format: {line[:50]}...")

    # 2. Load dictionary.json
    print(f"Loading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 3. Update data
    matches_found = 0
    total_entries = len(data)
    unique_terms_updated = set()

    for entry in data:
        term = entry.get('term', '').lower().strip()
        if term in definitions:
            entry['ai-definition'] = definitions[term]
            matches_found += 1
            unique_terms_updated.add(term)

    print(f"Summary:")
    print(f"- Total entries in JSON: {total_entries}")
    print(f"- Unique terms in TXT file: {len(definitions)}")
    print(f"- Matches found and updated in JSON: {matches_found}")
    print(f"- Unique terms successfully matched: {len(unique_terms_updated)}")

    # 4. Save results
    print(f"Saving updated {json_path}...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Done!")

if __name__ == "__main__":
    update_definitions()
