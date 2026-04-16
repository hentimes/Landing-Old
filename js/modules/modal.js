/*
==================================================================
ARCHIVO: planespro/js/modules/modal.js
==================================================================
*/

// ===================================
// Módulo para la Funcionalidad de la Ventana Modal
// ===================================

// CORRECCIÓN FINAL: Este módulo ahora solo se encarga de iniciar el flujo.
// Abre el modal de bienvenida y cede el control a los otros scripts.

export function initModal() {
    
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');

    // Si no hay botones para abrir el modal, no hace nada.
    if (modalTriggers.length === 0) {
        return;
    }

    // A todos los botones CTA les asigna la misma acción.
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // Busca el modal de bienvenida que hemos creado.
            const welcomeModal = document.getElementById('welcomeModal');
            
            // Si lo encuentra, lo muestra.
            if (welcomeModal) {
                welcomeModal.classList.add('is-visible');
                document.body.classList.add('no-scroll');
            } else {
                console.error('El modal de bienvenida (#welcomeModal) no se encontró en la página.');
            }
        });
    });
}