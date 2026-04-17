import os

files_to_check = ['index.html', 'ebook.html', 'asesores.html', 'nosotros.html', 'noticias.html', 'css/styles.css', 'css/_components.css']
images_to_replace = {
    'comofunciona.png': 'comofunciona.webp',
    'asesores.png': 'asesores.webp',
    'ebook-retiro-afp.png': 'ebook-retiro-afp.webp',
    'ebook-retiro-afp-bonus.png': 'ebook-retiro-afp-bonus.webp'
}

for fname in files_to_check:
    path = os.path.join(r"c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old", fname)
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            updated = False
            for old, new in images_to_replace.items():
                if old in content:
                    content = content.replace(old, new)
                    updated = True
                    
            if updated:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {fname}")
        except Exception as e:
            print(f"Error {fname}: {e}")
