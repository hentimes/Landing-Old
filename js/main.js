/*
==================================================================
ARCHIVO: planespro/js/main.js
==================================================================
*/

// ===================================
// Archivo Principal de JavaScript
// ===================================

// --- Módulos de la Página Principal ---
import { initNavigation } from './modules/navigation.js';         // Gestiona el menú de navegación móvil.
import { initModal } from './modules/modal.js';                 // Conecta los botones CTA para abrir el modal.
import { initFlipCards } from './modules/flip-cards.js';          // Activa las tarjetas giratorias de la sección "Proceso".
import { initCasosDeExitoSlider } from './modules/casosDeExito-slider.js'; // Inicializa el carrusel de casos de éxito.
import { initTestimonials } from './modules/testimonials.js';       // Gestiona la rotación de testimonios.
import { initLogoFader } from './modules/logo-fader.js';          // Anima los logos de las Isapres.
import { initPlanesSlider } from './modules/planes-slider.js';    // Inicializa el carrusel de planes de salud.
import { initAsesores, initNosotrosAsesores } from './modules/asesores-loader.js';   // Carga y gestiona el carrusel de asesores. 
import { initAccordion } from './modules/accordion.js';     // Inicializa el acordeón de beneficios.
import { initAnalytics } from './modules/analytics.js';     // Carga los scripts de Meta/Google Analytics.
import { initHeroTypewriter } from './modules/typewriter.js'; // Efecto tipeado en el eyebrow del hero.
import { loadModules } from '../formulario/js/_module-loader.js'; // Carga el HTML de los modales del formulario.
import { setElements } from '../formulario/js/_dom-elements.js';    // Asigna las referencias a los elementos del DOM.
import {
    initModals as initFormModals,
    initStepNavigation,
    initFormEventListeners,
    initDynamicFields,
    initFormSubmission,
    loadProgress,
    handleFieldInteraction,
    updateActionButtonState
} from '../formulario/js/_form-logic.js';                         // Importa toda la lógica funcional del formulario.

/**
 * Inicializa la lógica interna del formulario una vez que su HTML ha sido cargado.
 */
function initializeFormApp() {
    // 1. Asigna todas las referencias del DOM.
    setElements();
    
    // 2. Inicializa la lógica interactiva del formulario.
    initFormModals();
    initStepNavigation();
    initFormEventListeners(handleFieldInteraction);
    initDynamicFields();
    initFormSubmission();
    
    // 3. Carga el progreso guardado y actualiza el estado inicial.
    loadProgress();
    updateActionButtonState();

    console.log("✅ Lógica interna del formulario inicializada correctamente.");
}

// --- Punto de Entrada de la Aplicación ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 0. Inicializa Módulo de Analíticas
    initAnalytics();

    // 1. Inicializa todos los componentes de la página principal.
    initNavigation();
    initHeroTypewriter();  // Efecto tipeado en el eyebrow
    initPlanesSlider();
    initFlipCards();
    initCasosDeExitoSlider();
    initTestimonials();
    initLogoFader();
    initAccordion();
    initAsesores();
    initNosotrosAsesores(); 
    console.log("🚀 Componentes de la página principal inicializados.");

    // 2. Carga el HTML del formulario desde los archivos de plantilla.
    loadModules()
        .then(() => {
            console.log("📦 HTML del formulario cargado en la página.");
            
            // 3. Conecta los botones CTA para que abran el modal de bienvenida.
            initModal(); 
            console.log("🔗 Botones CTA conectados al modal.");

            // 4. Inicializa toda la lógica interna del formulario.
            initializeFormApp();

            // 5. Revisa si la URL contiene el parámetro para abrir el formulario automáticamente.
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('accion') === 'abrir-formulario') {
                const formModal = document.getElementById('formModal'); // <-- CAMBIO: Apunta al modal del formulario.
                if (formModal) {
                    formModal.classList.add('is-visible');
                    document.body.classList.add('no-scroll');
                }
            }
        })
        .catch(error => {
            console.error("❌ Error crítico al cargar o inicializar el formulario:", error);
            // Deshabilita los botones CTA si el formulario no se puede cargar.
            const ctaButtons = document.querySelectorAll('[data-modal-trigger]');
            ctaButtons.forEach(button => {
                button.disabled = true;
                button.textContent = 'Formulario no disponible';
            });
        });
});
