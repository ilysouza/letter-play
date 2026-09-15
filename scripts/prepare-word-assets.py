from pathlib import Path
from PIL import Image

sources = {
    'sapo.jpg': '/home/ubuntu/upload/search_images/fQ8HD9j9K6Cr.jpg',
    'pato.jpg': '/home/ubuntu/upload/search_images/AkqLEmrZnjjM.jpg',
    'foca.jpg': '/home/ubuntu/upload/search_images/iMaqgCJ5ZSj4.jpg',
    'lobo.jpg': '/home/ubuntu/upload/search_images/S3tM3nKOmf1D.jpg',
    'chave.jpg': '/home/ubuntu/upload/search_images/Lbjz4bJ4ltGj.jpg',
    'escola.jpg': '/home/ubuntu/upload/search_images/OOc4eGQAGQy2.jpg',
    'caderno.jpg': '/home/ubuntu/upload/search_images/g9arCnv4pDd1.jpg',
    'janela.jpg': '/home/ubuntu/upload/search_images/9PDUerf9Lurm.jpg',
    'computador.jpg': '/home/ubuntu/upload/search_images/UeAn6gfl2EAG.jpg',
}
out = Path('/home/ubuntu/letter-play/client/src/imports')
for name, source in sources.items():
    image = Image.open(source).convert('RGB')
    image.thumbnail((640, 640), Image.Resampling.LANCZOS)
    image.save(out / name, 'JPEG', quality=84, optimize=True, progressive=True)
    print(name, (out / name).stat().st_size)
