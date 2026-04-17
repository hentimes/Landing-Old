path = r"c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\css\_layout.css"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hero block (lines 73-86 = .hero and .hero__container)
old_hero = """.hero {\r
     display: flex;\r
     align-items: center;\r
}\r
.hero__container {\r
     display: flex;\r
     flex-direction: column;\r
     justify-content: space-around;\r
     align-items: center;\r
     text-align: center;\r
     width: 100%;\r
     padding-top: calc(var(--header-height) + 20px);\r
     padding-bottom: 20px;\r
}\r
.hero__title {\r
     margin-top: 0;\r
     margin-bottom: var(--spacing-md);\r
     font-size: 2.2rem;\r
}\r
.hero__logos-group {\r
    width: 100%;\r
    margin-top: var(--spacing-md);\r
}\r
.section-logos__title {\r
    font-size: 1.3rem;\r
    font-weight: 400;\r
    color: var(--color-text-light);\r
    margin-bottom: var(--spacing-md);\r
}\r
.logo-fader {\r
    min-height: 40px;\r
}"""

new_hero = """.hero {\r
    display: flex;\r
    align-items: stretch;\r
    width: 100%;\r
}\r
/* --- Hero split 2 columnas (desktop) --- */\r
.hero__container--split {\r
    display: grid;\r
    grid-template-columns: 1fr 1fr;\r
    align-items: stretch;\r
    min-height: calc(100vh - var(--header-height));\r
    padding: 0;\r
    max-width: 100%;\r
    width: 100%;\r
}\r
.hero__text-group {\r
    display: flex;\r
    flex-direction: column;\r
    justify-content: center;\r
    padding: calc(var(--header-height) + 48px) clamp(20px, 5vw, 80px) 48px;\r
}\r
.hero__title {\r
    margin-top: 0;\r
    margin-bottom: var(--spacing-md);\r
    font-size: clamp(2rem, 3.5vw, 3rem);\r
    line-height: 1.15;\r
}\r
.hero__logos-group {\r
    width: 100%;\r
    margin-top: var(--spacing-md);\r
}\r
.section-logos__title {\r
    font-size: 1.1rem;\r
    font-weight: 400;\r
    color: var(--color-text-light);\r
    margin-bottom: var(--spacing-md);\r
}\r
.logo-fader {\r
    min-height: 40px;\r
}\r
/* --- Columna foto hero --- */\r
.hero__photo-col {\r
    position: relative;\r
    overflow: hidden;\r
    min-height: 520px;\r
}\r
.hero__photo {\r
    position: absolute;\r
    top: 0; left: 0;\r
    width: 100%;\r
    height: 100%;\r
    object-fit: cover;\r
    object-position: center top;\r
    display: block;\r
}"""

if old_hero in content:
    content = content.replace(old_hero, new_hero)
    print("Hero block replaced OK")
else:
    print("Hero block NOT found - checking raw content...")
    # Try a simpler detection
    if ".hero__container {" in content:
        print("Found .hero__container - line-ending mismatch")
    else:
        print("Not found at all")

# Replace proceso__illustration
old_proceso = """.proceso__illustration {\r
    max-width: 280px;\r
    height: auto;\r
}"""

new_proceso = """.proceso__illustration {\r
    width: 100%;\r
    max-width: 780px;\r
    height: auto;\r
    border-radius: var(--radius-lg);\r
    box-shadow: var(--shadow-md);\r
}"""

if old_proceso in content:
    content = content.replace(old_proceso, new_proceso)
    print("Proceso illustration replaced OK")
else:
    print("Proceso illustration NOT found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
