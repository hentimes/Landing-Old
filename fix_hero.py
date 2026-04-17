import re

# ==========================================
# 1. REVERT INDEX.HTML HERO
# ==========================================
html_path = r'c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Find the #inicio div and replace the full hero block
old_inicio_start = html.find('<div id="inicio" class="screen">')
old_inicio_end = html.find('</div>', html.find('</section>', old_inicio_start)) + 6

new_hero = '''<div id="inicio" class="screen">
            <section class="hero">
                <div class="container hero__container">
                    <div class="hero__text-group">
                        <h1 class="hero__title">Optimiza tu 7%. Mejor cobertura, mismo aporte.</h1>
                        <p class="hero__subtitle">Te ayudamos a encontrar el plan de Isapre ideal para ti, optimizando tus cotizaciones y mejorando tus beneficios. Asesoría experta, transparente y 100% gratuita.</p>

                        <div class="hero__social-proof">
                            <div class="social-proof__avatars-wrapper">
                                <div class="social-proof__stars">★★★★★</div>
                                <div class="social-proof__avatars">
                                    <img src="assets/avatares/hero/avatar1.jpg" alt="Cliente satisfecho 1" class="social-proof__avatar" loading="lazy" decoding="async">
                                    <img src="assets/avatares/hero/avatar2.jpg" alt="Cliente satisfecho 2" class="social-proof__avatar" loading="lazy" decoding="async">
                                    <img src="assets/avatares/hero/avatar3.jpg" alt="Cliente satisfecho 3" class="social-proof__avatar" loading="lazy" decoding="async">
                                    <img src="assets/avatares/hero/avatar4.jpg" alt="Cliente satisfecho 4" class="social-proof__avatar" loading="lazy" decoding="async">
                                </div>
                            </div>
                            <div class="social-proof__text">
                                <p>Únete a más de <strong>500 clientes</strong> que ya optimizaron su plan.</p>
                            </div>
                        </div>

                        <button class="button button--primary hero__button" data-modal-trigger="formModal" id="cta_hero">
                            <i class="fas fa-search-dollar"></i> Solicitar Análisis Gratuito
                        </button>
                    </div>

                    <div class="hero__illustration-content">
                        <img src="assets/ilustraciones/hero-person.webp"
                             alt="Asesora de PlanesPro ayudando a optimizar un plan de salud"
                             class="hero__illustration"
                             fetchpriority="high" decoding="async">
                    </div>

                    <div class="hero__logos-group">
                        <h2 class="section-logos__title">Te asesoramos en todas las Isapres</h2>
                        <div class="logo-fader"></div>
                    </div>
                </div>
            </section>
        </div>'''

html = html[:old_inicio_start] + new_hero + html[old_inicio_end:]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html reverted OK")

# ==========================================
# 2. REVERT + UPGRADE _layout.css HERO BLOCK
# ==========================================
css_path = r'c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\css\_layout.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Remove new split hero block and replace with clean premium version
# Find from .hero { to logo-fader }
start_marker = '.hero {'
end_marker = '.logo-fader {\n    min-height: 40px;\n}'

start = css.find(start_marker)
end = css.find(end_marker) + len(end_marker)

if start == -1:
    print("ERROR: .hero not found in layout.css")
else:
    new_hero_css = '''.hero {
    display: flex;
    align-items: center;
    width: 100%;
    /* Premium background: tonos esmerilados azul/blanco */
    background:
        radial-gradient(ellipse at 80% 50%, rgba(37, 99, 235, 0.06) 0%, transparent 60%),
        radial-gradient(ellipse at 10% 80%, rgba(16, 185, 129, 0.04) 0%, transparent 50%),
        #f8faff;
}
.hero__container {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas:
        "text  photo"
        "logos logos";
    align-items: center;
    gap: var(--spacing-lg);
    width: 100%;
    padding-top: calc(var(--header-height) + 40px);
    padding-bottom: 20px;
}
.hero__text-group {
    grid-area: text;
}
.hero__illustration-content {
    grid-area: photo;
    display: flex;
    align-items: center;
    justify-content: center;
}
.hero__logos-group {
    grid-area: logos;
    width: 100%;
    margin-top: var(--spacing-md);
}
.hero__title {
    margin-top: 0;
    margin-bottom: var(--spacing-md);
    font-size: clamp(2rem, 3vw, 2.8rem);
    line-height: 1.15;
    color: var(--color-text-dark);
}
.hero__illustration {
    width: clamp(280px, 28vw, 420px);
    height: auto;
    object-fit: contain;
    transform: scaleX(-1); /* Voltear horizontalmente */
    filter: drop-shadow(0 20px 40px rgba(37, 99, 235, 0.12));
}
.section-logos__title {
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
    text-align: center;
}
.logo-fader {
    min-height: 40px;
}'''
    css = css[:start] + new_hero_css + css[end:]
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)
    print("_layout.css hero block upgraded OK")
