/*
==================================================================
ARCHIVO: planespro/js/main.js
==================================================================
*/

// ===================================
// Archivo principal de JavaScript
// ===================================

// --- Módulos de la página principal ---
import { initNavigation } from './modules/navigation.js'; // Gestiona el menú de navegación móvil.
import { initModal } from './modules/modal.js'; // Conecta los botones CTA para abrir el modal.
import { initFlipCards } from './modules/flip-cards.js'; // Activa las tarjetas giratorias de la sección "Proceso".
import { initCasosDeExitoSlider } from './modules/casosDeExito-slider.js'; // Inicializa el módulo de casos de éxito.
import { initTestimonials } from './modules/testimonials.js'; // Gestiona la rotación de testimonios.
import { initLogoFader } from './modules/logo-fader.js'; // Anima los logos de las Isapres.
import { initPlanesSlider } from './modules/planes-slider.js'; // Inicializa el slider de planes de salud.
import { initAsesores, initNosotrosAsesores } from './modules/asesores-loader.js'; // Carga y gestiona los asesores.
import { initAccordion } from './modules/accordion.js'; // Inicializa el acordeón de beneficios.
import { initAnalytics } from './modules/analytics.js'; // Carga los scripts de analítica.
import { initHeroTypewriter } from './modules/typewriter.js'; // Efecto tipeado en el eyebrow del hero.
import { initAsistenteFAQ } from './modules/asistente-faq.js'; // Inicializa el asistente de preguntas frecuentes.
import { initAfpCarousel } from './modules/afp-carousel.js'; // Carrusel de AFPs para la sección Ebook.
import { loadModules } from '../formulario/js/_module-loader.js'; // Carga el HTML de los modales del formulario.
import { setElements } from '../formulario/js/_dom-elements.js'; // Asigna las referencias a los elementos del DOM.
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

function initializeFormApp() {
    setElements();

    initFormModals();
    initStepNavigation();
    initFormEventListeners(handleFieldInteraction);
    initDynamicFields();
    initFormSubmission();

    loadProgress();
    updateActionButtonState();

    console.log('Lógica interna del formulario inicializada correctamente.');
}

document.addEventListener('DOMContentLoaded', () => {
    initAnalytics();

    initNavigation();
    initHeroTypewriter();
    initPlanesSlider();
    initFlipCards();
    initCasosDeExitoSlider();
    initTestimonials();
    initLogoFader();
    initAccordion();
    initAsesores();
    initNosotrosAsesores();
    initAsistenteFAQ();
    initAfpCarousel();
    initNoticiasFeed();
    console.log('Componentes de la página principal inicializados.');

    loadModules()
        .then(() => {
            console.log('HTML del formulario cargado en la página.');

            initModal();
            console.log('Botones CTA conectados al modal.');

            initializeFormApp();

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
            console.error('Error crítico al cargar o inicializar el formulario:', error);
            const ctaButtons = document.querySelectorAll('[data-modal-trigger]');
            ctaButtons.forEach((button) => {
                button.disabled = true;
                button.textContent = 'Formulario no disponible';
            });
        });
});
