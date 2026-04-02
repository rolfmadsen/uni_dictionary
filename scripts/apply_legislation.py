import json

LEGISLATION_MAPPING = {
    'Universitetsloven': [
        'universitet', 'organisation', 'organisatorisk enhed', 'uddannelsesinstitution', 
        'uddannelsesansvarlig', 'økonomisk ansvarlig', 'videnskabelig medarbejder', 
        'studieleder', 'studienævn', 'ansøgningsgebyr', 'manglende ansøgningsgebyr', 
        'beskæftigelsestilskud', 'uddannelsestilskud', 'bortvisningsårsag', 
        'permanent bortvist', 'disciplinærsag'
    ],
    'Uddannelsesbekendtgørelsen': [
        'fagelement', 'uddannelse', 'ECTS-point', 'bacheloruddannelse', 'kandidatuddannelse', 
        'akademisk overbygningsuddannelse', 'erhvervskandidatuddannelse', 'normeret studietid', 
        'maksimal studietid', 'studieordning', 'konstituerende fagelement', 
        'obligatorisk fagelement', 'valgfrit fagelement', 'støttefag', 'sidefag', 
        'studiefremdrift', 'propædeutik', 'merit', 'førstartmerit', 'forhåndsgodkendelse af merit'
    ],
    'Adgangsbekendtgørelsen': [
        'ansøger', 'adgangsgrundlag', 'adgangskrav', 'adgangsgivende eksamen', 
        'adgangsgivende uddannelse', 'kvote 1', 'kvote 2', 'den koordinerede tilmelding (KOT)', 
        'retskrav', 'retskrav til optagelse på kandidatuddannelse', 'betinget optaget', 
        'studieplads', 'pladsfordeling', 'genindskrivning', 'overflytning', 'studieskift'
    ],
    'Eksamensbekendtgørelsen': [
        'prøve', 'eksamen', 'delprøve', 'prøveforsøg', 'ordinær prøve', 'omprøve', 
        'sygeprøve', '7-trinskala', 'bestået/ikke-bestået', 'censor', 'censorbeskikkelse', 
        'censornorm', 'ekstern censur', 'intern bedømmelse', 'eksaminator', 'eksamenstilsyn', 
        'eksamensbevis', 'Diploma Supplement', 'kompetenceprofil', 'snyd', 'klage', 
        'ombedømmelse', 'ankeeksamen'
    ],
    'Masterbekendtgørelsen': [
        'masteruddannelse', 'masterprojekt', 'erhvervserfaring', 
        'varighed med adgangsgivende erhvervserfaring', 'masterniveau'
    ],
    'Bekendtgørelse af lov om erhvervsakademiudd. og professionsbachelorudd.': [
        'erhvervsakademiuddannelse', 'professionsbachelor-uddannelse', 'top-up-uddannelse', 
        'diplomuddannelse', 'akademigrad', 'niveau 5', 'niveau 6'
    ],
    'Bekendtgørelse om adgangskursus og adgangseksamen til ingeniøruddannelserne': [
        'adgangskursus', 'indskrivning til adgangskursus', 'Børne- og Undervisningsministeriet'
    ],
    'Lov om åben uddannelse': [
        'efter- og videreuddannelsessystemet', 'deltagerbetaling', 'egenbetaling', 
        'virksomhedsbetaling', 'tompladsstuderende', ' enkeltfag', 'enkeltfagsstuderende', 
        'heltid på deltid', 'årselev', 'årselevfinansieret', 'indtægtsdækket virksomhed'
    ],
    'SU-loven': [
        'statens uddannelsesstøtte (SU)', 'SU-aktivitetskrav', 'forventede ECTS-point ift. SU', 
        'fribeløb', 'udlandsstipendium', 'SU'
    ],
    'Databeskyttelsesloven': [
        'personnummer', 'person uden CPR', 'navne- og adressebeskyttelse', 'fortrolighed', 
        'identitetsvalidering', 'person', 'privat mail', 'privat telefonnummer'
    ]
}

# Manual corrections for terms that don't match exactly but are clearly these
FUZZY_ALIASES = {
    'statens uddannelsesstøtte (SU)': 'statens uddannelsesstøtte',
    'fribeløb': 'fribeløbsgrænse',
    'navne- og adressebeskyttelse': 'adressebeskyttet',
}

def apply_legislation():
    json_path = 'public/dictionary.json'
    print(f"Reading {json_path}...")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create term index for fast lookups
    term_to_entry = {e.get('term', '').lower().strip(): e for e in data}
    
    applied_count = 0
    for law, terms in LEGISLATION_MAPPING.items():
        for term_name in terms:
            term_clean = term_name.lower().strip()
            
            # 1. Try exact match
            entry = term_to_entry.get(term_clean)
            
            # 2. Try alias
            if not entry and term_name in FUZZY_ALIASES:
                entry = term_to_entry.get(FUZZY_ALIASES[term_name].lower().strip())
                
            # 3. Try substring/contains match for key terms if still not found
            if not entry:
                # We only do this for terms longer than 3 chars to avoid false positives
                if len(term_clean) > 3:
                    potential_matches = [e for name, e in term_to_entry.items() if term_clean in name]
                    if potential_matches:
                        entry = potential_matches[0] # Take first match

            if entry:
                existing = entry.get('legislation', '')
                
                # Check if already present
                if law not in existing:
                    if existing:
                        entry['legislation'] = f"{existing}, {law}"
                    else:
                        entry['legislation'] = law
                    applied_count += 1
            else:
                print(f"Warning: Term '{term_name}' not found in dictionary.")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully applied {applied_count} legal source associations.")

if __name__ == "__main__":
    apply_legislation()
