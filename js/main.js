/*
==================================================================
ARCHIVO: planespro/js/main.js
==================================================================
Orquestador principal. Inicializa módulos condicionalmente según
la página activa, identificada por la clase CSS del body.
==================================================================
*/

// --- Módulos siempre activos (todas las páginas) ---
import { initNavigation }   from './modules/navigation.js';
import { initModal }        from './modules/modal.js';
import { initAnalytics }    from './modules/analytics.js';
import { loadModules }      from '../formulario/js/_module-loader.js';
import { setElements }      from '../formulario/js/_dom-elements.js';
import {
    initModals as initFormModals,
    initStepNavigation,
    initFormEventListeners,
    initDynamicFields,
    initFormSubmission,
    loadProgress,
    handleFieldInteraction,
    updateActionButtonState
} from '../formulario/js/_form-logic.js';

// --- Módulos de página específica ---
import { initFlipCards }            from './modules/flip-cards.js';
import { initCasosDeExitoSlider }   from './modules/casosDeExito-slider.js';
import { initTestimonials }         from './modules/testimonials.js';
import { initLogoFader }            from './modules/logo-fader.js';
import { initPlanesSlider }         from './modules/planes-slider.js';
import { initHeroTypewriter }       from './modules/typewriter.js';
import { initAsistenteFAQ }         from './modules/asistente-faq.js';
import { initAccordion }            from './modules/accordion.js';
import { initAsesores, initNosotrosAsesores } from './modules/asesores-loader.js';
import { initAfpCarousel }          from './modules/afp-carousel.js';
import { initNoticiasFeed }         from './modules/noticias-loader.js';
import { initEbookPage }            from './modules/ebook-page.js';

// ─────────────────────────────────────────────────
// Inicialización del formulario (todas las páginas)
// ─────────────────────────────────────────────────
function initializeFormApp() {
    setElements();
    initFormModals();
    initStepNavigation();
    initFormEventListeners(handleFieldInteraction);
    initDynamicFields();
    initFormSubmission();
    loadProgress();
    updateActionButtonState();
}

// ─────────────────────────────────────────────────
// Bootstrap principal
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Página activa detectada por clase CSS del body
    const isIndex    = body.classList.contains('page-index');
    const isEbook    = body.classList.contains('page-ebook');
    const isNosotros = body.classList.contains('page-nosotros');
    const isAsesores = body.classList.contains('page-asesores') || (!isIndex && !isEbook && !isNosotros && !body.classList.contains('page-noticias'));
    const isNoticias = body.classList.contains('page-noticias');

    // ── Siempre activos ────────────────────────────
    initAnalytics();
    initNavigation();
    initAccordion();

    // ── Index ──────────────────────────────────────
    if (isIndex) {
        initHeroTypewriter();
        initPlanesSlider();
        initFlipCards();
        initCasosDeExitoSlider();
        initTestimonials();
        initLogoFader();
        initAsistenteFAQ();
    }

    // ── Ebook ──────────────────────────────────────
    if (isEbook) {
        initEbookPage();
        initAfpCarousel();
    }

    // ── Nosotros ───────────────────────────────────
    if (isNosotros) {
        initNosotrosAsesores();
    }

    // ── Asesores ───────────────────────────────────
    if (isAsesores) {
        initAsesores();
    }

    // ── Noticias ───────────────────────────────────
    if (isNoticias) {
        initNoticiasFeed();
    }

    // ── Formulario modal (todas las páginas) ───────
    loadModules()
        .then(() => {
            initModal();
            initializeFormApp();

            // Apertura automática por URL param
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('accion') === 'abrir-formulario') {
                const formModal = document.getElementById('formModal');
                if (formModal) {
                    formModal.classList.add('is-visible');
                    document.body.classList.add('no-scroll');
                }
            }
        })
        .catch((error) => {
            console.error('Error crítico al cargar el formulario:', error);
            document.querySelectorAll('[data-modal-trigger]').forEach((btn) => {
                btn.disabled = true;
                btn.textContent = 'Formulario no disponible';
            });
        });
});
