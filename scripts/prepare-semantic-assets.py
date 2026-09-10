from pathlib import Path
from PIL import Image

source_map = {
    'butterfly.jpg': Path('/home/ubuntu/upload/search_images/ch3HNsrQ36qh.jpg'),
    'llama.jpg': Path('/home/ubuntu/upload/search_images/Maob3ZKlM81i.jpg'),
    'chocolate.jpg': Path('/home/ubuntu/upload/search_images/dwYYu28KjonW.jpg'),
}
out = Path('/home/ubuntu/letter-play/client/src/imports')
out.mkdir(parents=True, exist_ok=True)
for name, source in source_map.items():
    image = Image.open(source).convert('RGB')
    image.thumbnail((640, 640), Image.Resampling.LANCZOS)
    image.save(out / name, 'JPEG', quality=82, optimize=True, progressive=True)
    print(name, (out / name).stat().st_size)
