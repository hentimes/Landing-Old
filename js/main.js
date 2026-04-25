/*
==================================================================
ARCHIVO: planespro/js/main.js
Orquestador principal — rama: form
El sidebar reemplaza el formulario modal anterior.
==================================================================
*/

// ── Siempre activos ────────────────────────────────────────────
import { initNavigation }   from './modules/navigation.js';
import { initAnalytics }    from './modules/analytics.js';
import { initAccordion }    from './modules/accordion.js';

// ── Sidebar Form (reemplaza formulario modal) ──────────────────
import { initSidebar } from '../form/sidebar.js';

// ── Módulos por página ─────────────────────────────────────────
import { initFlipCards }          from './modules/flip-cards.js';
import { initCasosDeExitoSlider } from './modules/casosDeExito-slider.js';
import { initTestimonials }       from './modules/testimonials.js';
import { initLogoFader }          from './modules/logo-fader.js';
import { initPlanesSlider }       from './modules/planes-slider.js';
import { initHeroTypewriter }     from './modules/typewriter.js';
import { initAsistenteFAQ }       from './modules/asistente-faq.js';
import { initAsesores, initNosotrosAsesores } from './modules/asesores-loader.js';
import { initAfpCarousel }        from './modules/afp-carousel.js';
import { initNoticiasFeed }       from './modules/noticias-loader.js';
import { initEbookPage }          from './modules/ebook-page.js';

// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    const isIndex    = body.classList.contains('page-index');
    const isEbook    = body.classList.contains('page-ebook');
    const isNosotros = body.classList.contains('page-nosotros');
    const isNoticias = body.classList.contains('page-noticias');
    const isAsesores = !isIndex && !isEbook && !isNosotros && !isNoticias;

    // ── Siempre ────────────────────────────────────────────────
    initAnalytics();
    initNavigation();
    initAccordion();
    initSidebar();         // ← Sidebar global en todas las páginas

    // ── Index ──────────────────────────────────────────────────
    if (isIndex) {
        initHeroTypewriter();
        initPlanesSlider();
        initFlipCards();
        initCasosDeExitoSlider();
        initTestimonials();
        initLogoFader();
        initAsistenteFAQ();
    }

    // ── Ebook ──────────────────────────────────────────────────
    if (isEbook) {
        initEbookPage();
        initAfpCarousel();
    }

    // ── Nosotros ───────────────────────────────────────────────
    if (isNosotros) {
        initNosotrosAsesores();
    }

    // ── Asesores ───────────────────────────────────────────────
    if (isAsesores) {
        initAsesores();
    }

    // ── Noticias ───────────────────────────────────────────────
    if (isNoticias) {
        initNoticiasFeed();
    }
});
