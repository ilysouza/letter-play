from pathlib import Path
import re
text = Path('/home/ubuntu/letter-play/client/src/dailyWords.ts').read_text()
required = ['ESCOLA','CADERNO','JANELA','COMPUTADOR','DINOSSAURO','CHOCOLATE','BICICLETA']
for word in required:
    if f'word: "{word}"' not in text:
        raise SystemExit(f'missing {word}')
# Assert every new search row contains the intended horizontal word.
rows = [
    'ESCOLAQRTU', 'CADERNOPQW', 'JANELAMBVX', 'COMPUTADOR',
    'DINOSSAURO', 'CHOCOLATEX', 'BICICLETAQ'
]
for row, word in zip(rows, required):
    if word not in row:
        raise SystemExit(f'word {word} not placed in expected row {row}')
print('LONG_WORD_AUDIT')
print(f'validated {len(required)} long words and horizontal placements')
