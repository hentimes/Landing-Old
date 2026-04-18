path = r'c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\css\_responsive.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove old split block
to_remove = (
    '\n'
    '  /* --- Hero split: apilado en movil --- */\n'
    '  .hero__container--split {\n'
    '    grid-template-columns: 1fr;\n'
    '    min-height: auto;\n'
    '  }\n'
    '  .hero__photo-col {\n'
    '    min-height: 260px;\n'
    '    order: -1;\n'
    '  }\n'
    '  .hero__photo { object-position: center 15%; }\n'
    '  .hero__text-group {\n'
    '    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xl);\n'
    '    text-align: center;\n'
    '    align-items: center;\n'
    '  }\n'
)
content = content.replace(to_remove, '\n')

# Add clean mobile hero rules at the beginning of @media 768
mobile_hero = (
    '\n'
    '  /* --- Hero en movil: apilado vertical, foto oculta --- */\n'
    '  .hero {\n'
    '    background: #f8faff;\n'
    '  }\n'
    '  .hero__container {\n'
    '    grid-template-columns: 1fr;\n'
    '    grid-template-areas: "text" "logos";\n'
    '    padding-top: calc(var(--header-height) + 16px);\n'
    '    text-align: center;\n'
    '    gap: var(--spacing-md);\n'
    '  }\n'
    '  .hero__illustration-content {\n'
    '    display: none;\n'
    '  }\n'
    '  .hero__text-group {\n'
    '    display: flex;\n'
    '    flex-direction: column;\n'
    '    align-items: center;\n'
    '  }\n'
)

target = '@media (max-width: 768px) {'
content = content.replace(target, target + mobile_hero, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('responsive.css updated OK')
