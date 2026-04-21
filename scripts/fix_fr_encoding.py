import json
import shutil
import re
from datetime import datetime

# Backup
shutil.copy('messages/fr.json', f'messages/fr.json.bak_{datetime.now().strftime("%Y%m%d_%H%M%S")}')

def fix_str(s):
    """
    Fix a string where UTF-8 multi-byte sequences were decoded as cp1252.
    Processes character by character so mixed strings (partly correct,
    partly corrupted) are handled safely.
    e.g. '© ... r\xc3\xa9serv\xc3\xa9s' -> '© ... réservés'
    """
    result = []
    i = 0
    while i < len(s):
        c = s[i]
        # U+00C3 (Ã) is the cp1252-decoded form of the UTF-8 lead byte 0xC3
        if ord(c) == 0xC3 and i + 1 < len(s):
            try:
                pair = s[i:i+2].encode('cp1252').decode('utf-8')
                result.append(pair)
                i += 2
                continue
            except (UnicodeEncodeError, UnicodeDecodeError):
                pass
        result.append(c)
        i += 1
    return ''.join(result)

def fix_recursive(obj):
    if isinstance(obj, str):
        return fix_str(obj)
    elif isinstance(obj, dict):
        return {k: fix_recursive(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [fix_recursive(item) for item in obj]
    return obj

with open('messages/fr.json', encoding='utf-8') as f:
    fr = json.load(f)

fr_fixed = fix_recursive(fr)

with open('messages/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr_fixed, f, indent=2, ensure_ascii=False)

# Verify
with open('messages/fr.json', encoding='utf-8') as f:
    content = f.read()

remaining = re.findall(r'\xc3.', content)
print(f'Remaining corrupted (Ã+x) sequences: {len(remaining)}')

fr2 = json.loads(content)
print('\nSpot checks:')
print('  nav.about:', fr2.get('nav',{}).get('about'))
print('  footer.copyright:', fr2.get('footer',{}).get('copyright'))
print('  hero.about.cert1Title:', fr2.get('hero',{}).get('about',{}).get('cert1Title'))
print('  investmentAdvisory.wizard.progress.step:', fr2.get('investmentAdvisory',{}).get('wizard',{}).get('progress',{}).get('step'))
print('  home.services.title:', fr2.get('home',{}).get('services',{}).get('title'))
