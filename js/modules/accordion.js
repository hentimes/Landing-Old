// planespro/js/modules/accordion.js

export function initAccordion() {
    const accordions = document.querySelectorAll('.benefits-accordion');
    if (accordions.length === 0) {
        return; // No hace nada si no hay acordeones en la página
    }

    accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.accordion-item');

        items.forEach(item => {
            const header = item.querySelector('.accordion-item__header');
            
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');

                // Cierra todos los items del mismo grupo de acordeón
                items.forEach(i => i.classList.remove('is-open'));

                // Si el item clickeado no estaba abierto, lo abre
                if (!isOpen) {
                    item.classList.add('is-open');
                }
            });
        });
    });
}