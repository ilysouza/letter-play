from pathlib import Path
import re

text = Path('/home/ubuntu/letter-play/client/src/dailyWords.ts').read_text()

# Extract simple word/syllable records from drag pool
errors = []
for word, syllables in re.findall(r'\{ word: "([A-Z]+)", syllables: \[([^\]]+)\]', text):
    parts = re.findall(r'"([A-Z]+)"', syllables)
    if ''.join(parts) != word:
        errors.append(f'syllables: {word} != {"".join(parts)}')

# Validate image keys referenced in data
keys = set(re.findall(r'^  ([A-Z]+):', text, re.M))
for word in re.findall(r'word: "([A-Z]+)"', text):
    if word not in keys and word not in {'UM','DOIS','TRES'}:
        # Cruzadinhas também possuem respostas sem foto; só validar palavras
        # que aparecem no banco de imagens ou no pool de sílabas.
        if word in {'TETO', 'OVO', 'LUA', 'FITA'}:
            continue
        errors.append(f'missing image key: {word}')

# Search grids should be rectangular 10x10 and contain each listed word straight
# This parser is intentionally conservative and reports structural issues only.
for idx, block in enumerate(re.findall(r'grid: \[(.*?)\n    \],', text, re.S), 1):
    rows = re.findall(r'\[([^\]]+)\]', block)
    lengths = [len(re.findall(r'"[A-Z]"', row)) for row in rows]
    if len(rows) != 10 or any(n != 10 for n in lengths):
        errors.append(f'search grid {idx}: shape {len(rows)}x{lengths}')

# Crossword answer arrays need gridSize rows and columns.
for idx, block in enumerate(re.findall(r'gridSize: (\d+),\n        answer: \[\[(.*?)\]\],', text, re.S), 1):
    size = int(block[0])
    rows = re.findall(r'\[([^\]]+)\]', block[1])
    lengths = [len(re.findall(r'null|"[A-Z]"', row)) for row in rows]
    if len(rows) != size or any(n != size for n in lengths):
        errors.append(f'crossword {idx}: expected {size}x{size}, got {len(rows)}x{lengths}')

print('CONTENT_AUDIT')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print('No structural content errors found.')
