import os
from PIL import Image

src_dir = r"c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\assets\ilustraciones"

files_to_convert = [
    "asesores.png",
    "comofunciona.png",
    "ebook-retiro-afp-bonus.png",
    "ebook-retiro-afp.png"
]

for filename in files_to_convert:
    filepath = os.path.join(src_dir, filename)
    if os.path.exists(filepath):
        img = Image.open(filepath)
        
        # Guardar como WebP
        webp_filename = filename.replace('.png', '.webp')
        webp_filepath = os.path.join(src_dir, webp_filename)
        
        # Convertir con alta calidad y compresión lossy
        img.save(webp_filepath, 'webp', quality=85)
        
        old_size_mb = os.path.getsize(filepath) / (1024 * 1024)
        new_size_mb = os.path.getsize(webp_filepath) / (1024 * 1024)
        print(f"OK {filename}: {old_size_mb:.2f} MB -> {webp_filename}: {new_size_mb:.2f} MB")
    else:
        print(f"FAIL {filename} no encontrado.")
