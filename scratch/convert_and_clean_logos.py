import os
from PIL import Image

def convert_and_cleanup(directory):
    print(f"Procesando directorio: {directory}")
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            png_path = os.path.join(directory, filename)
            try:
                img = Image.open(png_path)
                webp_filename = os.path.splitext(filename)[0] + ".webp"
                webp_path = os.path.join(directory, webp_filename)
                
                # Convertir a WebP con buena calidad
                img.save(webp_path, "WEBP", quality=90)
                print(f"Convertido con éxito: {filename} -> {webp_filename}")
                
                # Eliminar el PNG original
                os.remove(png_path)
                print(f"Eliminado original: {filename}")
            except Exception as e:
                print(f"Error procesando {filename}: {e}")

if __name__ == "__main__":
    base_dir = r"c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old"
    logos_dir = os.path.join(base_dir, "assets", "logos_afp")
    if os.path.exists(logos_dir):
        convert_and_cleanup(logos_dir)
    else:
        print(f"Error: No se encontró el directorio {logos_dir}")
