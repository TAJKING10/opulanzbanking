import json, subprocess

def deep_merge(base, overlay):
    result = dict(base)
    for k, v in overlay.items():
        if k not in result:
            result[k] = v
        elif isinstance(result[k], dict) and isinstance(v, dict):
            result[k] = deep_merge(result[k], v)
    return result

def count_keys(d):
    c = 0
    for v in d.values():
        if isinstance(v, dict): c += count_keys(v)
        else: c += 1
    return c

en_dash = json.loads(subprocess.run(['git','show','dashboard:messages/en.json'], capture_output=True, text=True, encoding='utf-8').stdout)
fr_dash = json.loads(subprocess.run(['git','show','dashboard:messages/fr.json'], capture_output=True, text=True, encoding='utf-8').stdout)

with open('messages/en.json', encoding='utf-8') as f:
    en_main = json.load(f)
with open('messages/fr.json', encoding='utf-8') as f:
    fr_main = json.load(f)

en_merged = deep_merge(en_main, en_dash)
fr_merged = deep_merge(fr_main, fr_dash)

# Write first
with open('messages/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_merged, f, indent=2, ensure_ascii=False)
with open('messages/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr_merged, f, indent=2, ensure_ascii=False)

# Report (ASCII only to avoid Windows terminal encoding issues)
print('Done.')
print('EN: %d -> %d (+%d)' % (count_keys(en_main), count_keys(en_merged), count_keys(en_merged)-count_keys(en_main)))
print('FR: %d -> %d (+%d)' % (count_keys(fr_main), count_keys(fr_merged), count_keys(fr_merged)-count_keys(fr_main)))
for ns in sorted(set(list(en_main.keys()) + list(en_dash.keys()))):
    b = count_keys(en_main.get(ns,{})) if isinstance(en_main.get(ns),dict) else (1 if ns in en_main else 0)
    a = count_keys(en_merged.get(ns,{})) if isinstance(en_merged.get(ns),dict) else (1 if ns in en_merged else 0)
    if a != b:
        print('  %s: %d -> %d (+%d)' % (ns, b, a, a-b))
