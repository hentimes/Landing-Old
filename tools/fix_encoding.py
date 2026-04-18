import os
import glob

# Rutas a revisar
html_files = glob.glob(r'c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\*.html')

for file_path in html_files:
    try:
        # Leemos el archivo roto tal como estÃ¡ en utf-8
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Ocurrencias tÃ­picas de mojibake (utf-8 vÃ­a latin-1)
        # Intentamos reparar re-codificando a latin-1 y decodificando a utf-8
        
        # Una forma mÃ¡s segura basada en re-codificaciÃ³n manual
        replacements = {
            'Ã¡': 'á',
            'Ã©': 'é',
            'Ã³': 'ó',
            'Ãº': 'ú',
            'Ã±': 'ñ',
            'Â¿': '¿',
            'Â¡': '¡',
            'Ã': 'í', # Ojo, a veces 'Ã­' termina como 'Ã' + chr(173). 
            'Ã\xad': 'í',
            'Ã³': 'ó',
            'Ã©': 'é',
            'Ã±': 'ñ',
            'Ã¡': 'á',
            'Ãº': 'ú',
            'Âº': 'º',
            'Ãš': 'Ú',
            'Ã“': 'Ó',
            'Ã‰': 'É',
            'Ã\x81': 'Á'
        }
        
        # MÃ©todo de decodificaciÃ³n directa pura si tolera todos los caracteres
        fixed_content = ""
        try:
            fixed_content = content.encode('latin-1').decode('utf-8')
        except Exception as e:
            print(f"No se pudo usar latin-1 en {file_path}. Usando diccionarios manuales. Error: {e}")
            fixed_content = content
            for bad, good in replacements.items():
                fixed_content = fixed_content.replace(bad, good)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print(f"Fixed {file_path}")
    except Exception as e:
        print(f"Error on {file_path}: {e}")
