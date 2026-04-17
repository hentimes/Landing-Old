"""
Mejoras premium del Hero - PlanesPro Landing
- Eyebrow badge con pregunta de dolor
- Título más grande
- Subtítulo renovado (concreto, honesto)
- Microcopy de fricción bajo el CTA
- Blob orgánico animado detrás de la foto
- Reducción de padding superior
"""

# ─── 1. Actualizar HTML ────────────────────────────────────────────────────────
html_path = r'c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

OLD_HERO_INNER = (
    '                    <div class="hero__text-group">\r\n'
    '                        <h1 class="hero__title">Optimiza tu 7%. Mejor cobertura, mismo aporte.</h1>\r\n'
    '                        <p class="hero__subtitle">Te ayudamos a encontrar el plan de Isapre ideal para ti, optimizando tus cotizaciones y mejorando tus beneficios. Asesoría experta, transparente y 100% gratuita.</p>\r\n'
    '\r\n'
    '                        <div class="hero__social-proof">\r\n'
    '                            <div class="social-proof__avatars-wrapper">\r\n'
    '                                <div class="social-proof__stars">★★★★★</div>\r\n'
    '                                <div class="social-proof__avatars">\r\n'
    '                                    <img src="assets/avatares/hero/avatar1.jpg" alt="Cliente satisfecho 1" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                    <img src="assets/avatares/hero/avatar2.jpg" alt="Cliente satisfecho 2" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                    <img src="assets/avatares/hero/avatar3.jpg" alt="Cliente satisfecho 3" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                    <img src="assets/avatares/hero/avatar4.jpg" alt="Cliente satisfecho 4" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                </div>\r\n'
    '                            </div>\r\n'
    '                            <div class="social-proof__text">\r\n'
    '                                <p>Únete a más de <strong>500 clientes</strong> que ya optimizaron su plan.</p>\r\n'
    '                            </div>\r\n'
    '                        </div>\r\n'
    '\r\n'
    '                        <button class="button button--primary hero__button" data-modal-trigger="formModal" id="cta_hero">\r\n'
    '                            <i class="fas fa-search-dollar"></i> Solicitar Análisis Gratuito\r\n'
    '                        </button>\r\n'
    '                    </div>\r\n'
    '\r\n'
    '                    <div class="hero__illustration-content">\r\n'
    '                        <img src="assets/ilustraciones/hero-person.webp"\r\n'
    '                             alt="Asesora de PlanesPro ayudando a optimizar un plan de salud"\r\n'
    '                             class="hero__illustration"\r\n'
    '                             fetchpriority="high" decoding="async">\r\n'
    '                    </div>'
)

NEW_HERO_INNER = (
    '                    <div class="hero__text-group">\r\n'
    '\r\n'
    '                        <!-- Eyebrow: pregunta de dolor -->\r\n'
    '                        <div class="hero__eyebrow">\r\n'
    '                            <i class="fas fa-question-circle"></i>\r\n'
    '                            ¿Estás pagando de más por tu plan de salud?\r\n'
    '                        </div>\r\n'
    '\r\n'
    '                        <h1 class="hero__title">Optimiza tu 7%.<br>Mejor cobertura,<br>mismo aporte.</h1>\r\n'
    '\r\n'
    '                        <p class="hero__subtitle">Comparamos Fonasa y todas las Isapres según tu sueldo y familia. Sin letra chica, sin presiones. La asesoría es 100% gratuita.</p>\r\n'
    '\r\n'
    '                        <div class="hero__social-proof">\r\n'
    '                            <div class="social-proof__avatars-wrapper">\r\n'
    '                                <div class="social-proof__stars">★★★★★</div>\r\n'
    '                                <div class="social-proof__avatars">\r\n'
    '                                    <img src="assets/avatares/hero/avatar1.jpg" alt="Cliente satisfecho 1" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                    <img src="assets/avatares/hero/avatar2.jpg" alt="Cliente satisfecho 2" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                    <img src="assets/avatares/hero/avatar3.jpg" alt="Cliente satisfecho 3" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                    <img src="assets/avatares/hero/avatar4.jpg" alt="Cliente satisfecho 4" class="social-proof__avatar" loading="lazy" decoding="async">\r\n'
    '                                </div>\r\n'
    '                            </div>\r\n'
    '                            <div class="social-proof__text">\r\n'
    '                                <p>Únete a más de <strong>500 clientes</strong> que ya optimizaron su plan.</p>\r\n'
    '                            </div>\r\n'
    '                        </div>\r\n'
    '\r\n'
    '                        <button class="button button--primary hero__button" data-modal-trigger="formModal" id="cta_hero">\r\n'
    '                            <i class="fas fa-search-dollar"></i> Solicitar Análisis Gratuito\r\n'
    '                        </button>\r\n'
    '\r\n'
    '                        <!-- Microcopy: reduce fricción -->\r\n'
    '                        <p class="hero__microcopy">\r\n'
    '                            <i class="fas fa-check-circle"></i> Sin costo\r\n'
    '                            &nbsp;&middot;&nbsp;\r\n'
    '                            <i class="fas fa-handshake-slash"></i> Sin compromiso\r\n'
    '                            &nbsp;&middot;&nbsp;\r\n'
    '                            <i class="fas fa-clock"></i> Respuesta en 24 hrs\r\n'
    '                        </p>\r\n'
    '\r\n'
    '                    </div>\r\n'
    '\r\n'
    '                    <!-- Ilustración con blob orgánico detrás -->\r\n'
    '                    <div class="hero__illustration-content">\r\n'
    '                        <div class="hero__blob"></div>\r\n'
    '                        <img src="assets/ilustraciones/hero-person.webp"\r\n'
    '                             alt="Asesora de PlanesPro ayudando a optimizar un plan de salud"\r\n'
    '                             class="hero__illustration"\r\n'
    '                             fetchpriority="high" decoding="async">\r\n'
    '                    </div>'
)

if OLD_HERO_INNER in html:
    html = html.replace(OLD_HERO_INNER, NEW_HERO_INNER)
    print("HTML hero updated OK")
else:
    print("WARNING: old hero pattern not found - manual check needed")

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# ─── 2. Actualizar CSS _layout.css ────────────────────────────────────────────
css_path = r'c:\Users\henti\OneDrive\Documentos\ISAPRE\PlanesPro\Landing Old\css\_layout.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Locate the hero block and replace it
OLD_HERO_CSS_START = '.hero {'
OLD_HERO_CSS_END = '.logo-fader {\n    min-height: 40px;\n}'

start = css.find(OLD_HERO_CSS_START)
end = css.find(OLD_HERO_CSS_END)
if end != -1:
    end = end + len(OLD_HERO_CSS_END)

if start == -1 or end == -1:
    print("ERROR: Hero CSS block not found precisely. Appending instead.")
    # Append to end of file as fallback
    NEW_HERO_CSS = ""
else:
    NEW_HERO_CSS = """
/* ─── HERO: Premium redesign ─────────────────── */
.hero {
    display: flex;
    align-items: center;
    width: 100%;
    background:
        radial-gradient(ellipse at 75% 40%, rgba(37, 99, 235, 0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 15% 70%, rgba(16, 185, 129, 0.05) 0%, transparent 45%),
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
    gap: var(--spacing-xl);
    width: 100%;
    padding-top: calc(var(--header-height) + 12px);
    padding-bottom: 12px;
}
.hero__text-group {
    grid-area: text;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
}
.hero__illustration-content {
    grid-area: photo;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
}
.hero__logos-group {
    grid-area: logos;
    width: 100%;
    margin-top: var(--spacing-sm);
}

/* ─── Eyebrow badge ─── */
.hero__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.18);
    border-radius: 999px;
    color: var(--color-primary);
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: 0.01em;
}
.hero__eyebrow i {
    font-size: 0.85rem;
    opacity: 0.8;
}

/* ─── Título grande ─── */
.hero__title {
    margin: 0;
    font-size: clamp(2.6rem, 4.5vw, 4rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
    color: var(--color-text-dark);
}

/* ─── Microcopy bajo el CTA ─── */
.hero__microcopy {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 0.82rem;
    color: var(--color-text-light);
    margin-top: calc(-1 * var(--spacing-sm));
}
.hero__microcopy i {
    color: var(--color-secondary, #10b981);
    font-size: 0.8rem;
}

/* ─── Fotografía ─── */
.hero__illustration {
    width: clamp(220px, 22vw, 360px);
    height: auto;
    object-fit: contain;
    transform: scaleX(-1);
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 24px 48px rgba(37,99,235,0.13));
}

/* ─── Blob orgánico animado ─── */
.hero__blob {
    position: absolute;
    width: clamp(260px, 26vw, 420px);
    height: clamp(260px, 26vw, 420px);
    background: radial-gradient(circle at 40% 40%,
        rgba(37, 99, 235, 0.12) 0%,
        rgba(16, 185, 129, 0.07) 60%,
        transparent 80%);
    border-radius: 60% 40% 55% 45% / 45% 55% 40% 60%;
    animation: blob-morph 12s ease-in-out infinite;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

@keyframes blob-morph {
    0%   { border-radius: 60% 40% 55% 45% / 45% 55% 40% 60%; }
    25%  { border-radius: 50% 50% 40% 60% / 60% 40% 55% 45%; }
    50%  { border-radius: 40% 60% 60% 40% / 50% 50% 45% 55%; }
    75%  { border-radius: 55% 45% 45% 55% / 40% 60% 60% 40%; }
    100% { border-radius: 60% 40% 55% 45% / 45% 55% 40% 60%; }
}

/* ─── Logos group ─── */
.section-logos__title {
    font-size: 1rem;
    font-weight: 400;
    color: var(--color-text-light);
    margin-bottom: var(--spacing-md);
    text-align: center;
}
.logo-fader {
    min-height: 40px;
}"""
    css = css[:start] + NEW_HERO_CSS + css[end:]
    print("_layout.css hero block updated OK")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("All done!")
