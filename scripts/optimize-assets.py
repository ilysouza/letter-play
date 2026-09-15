from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/letter-play/client/src/assets')
for path in [root / 'words' / 'dino.png', root / 'brand' / 'mascot.png']:
    if not path.exists():
        continue
    image = Image.open(path).convert('RGBA')
    image.thumbnail((700, 700), Image.Resampling.LANCZOS)
    image.save(path, 'PNG', optimize=True)
    print(path.name, path.stat().st_size)
