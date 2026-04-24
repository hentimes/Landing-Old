import os
import re

def build_pages():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_pages_dir = os.path.join(root_dir, 'src', 'pages')
    partials_dir = os.path.join(root_dir, 'src', 'partials')
    dist_dir = root_dir  # We output to the root directory

    # Load partials
    partials = {}
    for partial_name in ['header', 'footer', 'modals']:
        with open(os.path.join(partials_dir, f"{partial_name}.html"), 'r', encoding='utf-8') as f:
            partials[partial_name] = f.read()

    # Process each page
    for filename in os.listdir(src_pages_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(src_pages_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # The current src/pages/*.html files STILL HAVE the original header, footer and modals!
            # We need to replace those blocks with <!-- INCLUDE: ... --> or just replace the blocks directly with the partial.
            # But wait! If we run the build script multiple times, it's better if src/pages/*.html only contains the include comments.
            # However, right now they contain the full blocks. We should do a one-time replacement in src/pages/*.html to insert the INCLUDE comments!
            
            # Let's replace the header block
            header_pattern = re.compile(r'<header class="header">.*?</header>\s*<div class="nav-mobile" id="nav-mobile">.*?</div>', re.DOTALL)
            content = header_pattern.sub('<!-- INCLUDE: header -->', content)

            # Footer block
            footer_pattern = re.compile(r'<footer class="footer">.*?</footer>', re.DOTALL)
            content = footer_pattern.sub('<!-- INCLUDE: footer -->', content)

            # Modals block
            modals_pattern = re.compile(r'<div id="form-modal-placeholder"></div>.*?</a>', re.DOTALL)
            content = modals_pattern.sub('<!-- INCLUDE: modals -->', content)

            # (Cache busting eliminado — manejar manualmente si se requiere en producción)

            # Save the updated source file with INCLUDE comments
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

            # Now build the output file for the root directory
            out_content = content.replace('<!-- INCLUDE: header -->', partials['header'])
            out_content = out_content.replace('<!-- INCLUDE: footer -->', partials['footer'])
            out_content = out_content.replace('<!-- INCLUDE: modals -->', partials['modals'])

            # Save to root (dist)
            out_filepath = os.path.join(dist_dir, filename)
            with open(out_filepath, 'w', encoding='utf-8') as f:
                f.write(out_content)

            print(f"Built {filename} successfully.")

if __name__ == '__main__':
    build_pages()
