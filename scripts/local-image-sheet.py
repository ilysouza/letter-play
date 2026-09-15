from pathlib import Path
from PIL import Image, ImageDraw
root = Path('/home/ubuntu/letter-play/client/src/imports')
names = ['sapo','pato','foca','lobo','chave','escola','caderno','janela','computador']
cell_w, cell_h, cols = 220, 190, 3
sheet = Image.new('RGB', (cell_w * cols, cell_h * 3), '#eef2ff')
for i, name in enumerate(names):
    image = Image.open(root / f'{name}.jpg').convert('RGB')
    image.thumbnail((190, 145), Image.Resampling.LANCZOS)
    cell = Image.new('RGB', (cell_w, cell_h), 'white')
    cell.paste(image, ((cell_w-image.width)//2, 6+(145-image.height)//2))
    ImageDraw.Draw(cell).text((10, 162), name.upper(), fill='#111827')
    sheet.paste(cell, ((i % cols)*cell_w, (i//cols)*cell_h))
sheet.save('/home/ubuntu/letter-play/audit-images/local-corrected-assets.jpg', quality=90)
print('/home/ubuntu/letter-play/audit-images/local-corrected-assets.jpg')
