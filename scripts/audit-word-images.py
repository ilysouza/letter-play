from pathlib import Path
import re, urllib.request
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

src = Path('/home/ubuntu/letter-play/client/src/dailyWords.ts').read_text()
items = re.findall(r'^\s{2}([A-Z]+):\s*"(https://images\.unsplash\.com/[^" ]+)', src, re.M)
out = Path('/home/ubuntu/letter-play/audit-images')
out.mkdir(exist_ok=True)
thumbs = []
for word, url in items:
    try:
        data = urllib.request.urlopen(url, timeout=15).read()
        image = Image.open(BytesIO(data)).convert('RGB')
        image.thumbnail((180, 150), Image.Resampling.LANCZOS)
        canvas = Image.new('RGB', (220, 190), 'white')
        x = (220 - image.width) // 2; y = 4 + (150 - image.height) // 2
        canvas.paste(image, (x, y))
        ImageDraw.Draw(canvas).text((8, 164), word, fill='black')
        canvas.save(out / f'{word}.jpg', quality=88)
        thumbs.append((word, canvas))
    except Exception as exc:
        print('FAILED', word, exc)
cols = 4; rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 220, rows * 190), '#e5e7eb')
for i, (_, image) in enumerate(thumbs):
    sheet.paste(image, ((i % cols) * 220, (i // cols) * 190))
sheet.save(out / 'word-image-contact-sheet.jpg', quality=90)
print(f'created {len(thumbs)} thumbnails at {out / "word-image-contact-sheet.jpg"}')
