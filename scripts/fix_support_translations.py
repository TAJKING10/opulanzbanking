import json, subprocess

# Get the correct supportPage translations from the dashboard branch
en_dash = json.loads(subprocess.run(
    ['git', 'show', 'dashboard:messages/en.json'],
    capture_output=True, text=True, encoding='utf-8'
).stdout)
fr_dash = json.loads(subprocess.run(
    ['git', 'show', 'dashboard:messages/fr.json'],
    capture_output=True, text=True, encoding='utf-8'
).stdout)

# Load current main JSON files
with open('messages/en.json', encoding='utf-8') as f:
    en = json.load(f)
with open('messages/fr.json', encoding='utf-8') as f:
    fr = json.load(f)

# Replace supportPage with the correct full namespace from dashboard
en['supportPage'] = en_dash['supportPage']
fr['supportPage'] = fr_dash['supportPage']

with open('messages/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)
with open('messages/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr, f, indent=2, ensure_ascii=False)

print('Done.')
print('EN supportPage keys:', list(en['supportPage'].keys()))
print('FR supportPage keys:', list(fr['supportPage'].keys()))
