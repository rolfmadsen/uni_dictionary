import json
import os

def update_missing():
    json_path = 'public/dictionary.json'
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    # Data from user, adapted to "er en/et ..." format
    new_definitions = {
        "manglende ansøgningsgebyr": "er en systemstatus, der angiver, at den krævede betaling for behandling af en ansøgning endnu ikke er registreret i institutionens økonomisystem.",
        "censornorm": "er en beregningsregel, der fastlægger det antal timer eller den ressource, som tildeles en censor til bedømmelse af en specifik prøvetype.",
        "Danmarks Statistik": "er en statslig myndighed, der har ansvaret for indsamling, bearbejdning og offentliggørelse af statistiske oplysninger om det danske samfund, herunder indberetninger fra uddannelsessektoren.",
        "dansk adresse": "er en geografisk identifikation, der angiver en persons bopæl eller en enheds fysiske placering inden for Danmarks nationale grænser.",
        "dansk selvfinansieret": "er en personkategorisering for en studerende, der selv afholder de fulde omkostninger til uddannelsen uden brug af statslige taxametertilskud eller stipendier.",
        "deltidstilrettelagt": "er en organiseringsform for en uddannelse, hvor undervisningen er planlagt med en reduceret studieintensitet for at muliggøre sideløbende erhvervsarbejde.",
        "frit eksamensspørgsmål": "er et prøveelement, hvor den studerende inden for fagelementets faglige rammer selv har frihed til at formulere problemstillingen eller vælge emnet for sin besvarelse.",
        "latinsk uddannelsesbetegnelse hankøn": "er en akademisk titel, der repræsenterer den officielle betegnelse for en grad affattet på latin i maskulin grammatisk form.",
        "privat mail": "er en personidentifikator i form af en e-mailadresse, som tilhører individet privat og ikke er udstedt eller administreret af uddannelsesinstitutionen.",
        "privat telefonnummer": "er en personidentifikator, der repræsenterer individets private telefoniske kontaktflade til brug uden for institutionens faste systemer.",
        "retskrav til optagelse på kandidatuddannelse": "er en lovfæstet ret, der sikrer en bachelorstuderende adgang til en specifik kandidatoverbygning ved samme institution i umiddelbar forlængelse af bacheloruddannelsens afslutning.",
        "slutdato for udvekslingsophold": "er en tidsangivelse, der markerer det formelle ophør af en studerendes mobilitetsperiode ved en partnerinstitution.",
        "Uddannelses- og Forskningsmisteriet": "er den statslige myndighed, der varetager den overordnede administration, lovgivning og finansiering af videregående uddannelser og forskning i Danmark.",
        "uddannelsestype": "er en administrativ kategorisering, der definerer rammen for et uddannelsesforløb, såsom hhv. \"bachelor-\", \"kandidat-\" eller \"professionsbacheloruddannelse\".",
        "videregående uddannelses- og enkeltfagsudbud i det ordinære uddannelsessystem": "er en samling af undervisningstilbud, der er rettet mod heltidsstuderende og finansieret via det ordinære taxametersystem.",
        "videregående uddannelses- og enkeltfagsudbud i efter- og videreuddannelsessystemet": "er en samling af undervisningstilbud, der er tilrettelagt som deltidsundervisning eller moduler under lov om åben uddannelse til voksne med erhvervserfaring."
    }

    # Normalize keys for lookup
    lookup = {k.lower().strip(): v for k, v in new_definitions.items()}

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated_count = 0
    for entry in data:
        term = entry.get('term', '').lower().strip()
        if term in lookup:
            entry['ai-definition'] = lookup[term]
            updated_count += 1

    print(f"Updated {updated_count} entries with new definitions.")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Done!")

if __name__ == "__main__":
    update_missing()
