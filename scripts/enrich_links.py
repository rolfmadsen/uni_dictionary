import json
import re

def enrich_links():
    json_path = 'public/dictionary.json'
    print(f"Reading {json_path}...")
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("Error: dictionary.json not found.")
        return

    # 1. Clean data (Deduplicate based on term name)
    unique_data = {}
    for entry in data:
        # Ensure we strip existing markers if we are re-running
        term = entry['term'].replace('[[', '').replace(']]', '').lower().strip()
        if term not in unique_data or len(str(entry)) > len(str(unique_data[term])):
            unique_data[term] = entry
    
    data = list(unique_data.values())
    
    # 2. Extract and sort all terms by length (descending)
    all_terms = sorted([e['term'].replace('[[', '').replace(']]', '') for e in data if e['term'] and len(e['term']) > 2], key=len, reverse=True)
    
    # 3. Build a regex that matches ALREADY wrapped terms OR raw terms
    # This prevents double-wrapping.
    escaped_terms = [re.escape(t) for t in all_terms]
    
    # Pattern: match [[...]] OR a term boundary
    # Group 1: existing links (we'll leave these)
    # Group 2: terms to be linked
    pattern = r'(\[\[.*?\]\])|\b(' + '|'.join(escaped_terms) + r')\b'
    term_regex = re.compile(pattern, re.IGNORECASE)

    fields_to_enrich = ['definition', 'explanation', 'ai-definition', 'definitionEn', 'explanationEn']
    matches_count = 0

    print(f"Enriching links for {len(data)} entries using {len(all_terms)} terms...")

    for entry in data:
        current_term = entry.get('term', '').lower().strip()
        
        for field in fields_to_enrich:
            if field in entry and entry[field] and isinstance(entry[field], str):
                # FIRST: Remove any existing (potentially broken) markers to start fresh
                text = re.sub(r'\[+([^\[\]]+)\]+', r'\1', entry[field])
                
                def replace_func(match):
                    # If it matched the first group (existing [[...]]), it's already linked
                    if match.group(1):
                        return match.group(1)
                    
                    found_term = match.group(2)
                    if not found_term:
                        return match.group(0)

                    # Don't link a term to itself
                    if found_term.lower().strip() == current_term:
                        return found_term
                    
                    nonlocal matches_count
                    matches_count += 1
                    return f"[[{found_term}]]"

                # Perform the substitution
                entry[field] = term_regex.sub(replace_func, text)

    # 4. Save the enriched data
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully enriched {matches_count} internal links in {json_path}.")

if __name__ == "__main__":
    enrich_links()
