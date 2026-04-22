import { trackEvent } from './analytics.js';

export function initAccordion() {
    const accordions = document.querySelectorAll('.benefits-accordion');
    
    if (accordions.length === 0) return;

    accordions.forEach((accordion) => {
        const items = accordion.querySelectorAll('.accordion-item');

        items.forEach((item) => {
            const header = item.querySelector('.accordion-item__header');
            if (!header) return;
            
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isOpen = item.classList.contains('is-open') || item.classList.contains('active');
                
                // Cierra todos los items del mismo grupo usando ambas clases para limpiar
                items.forEach(i => {
                    i.classList.remove('is-open');
                    i.classList.remove('active');
                });

                // Si el item clickeado no estaba abierto, lo abre con ambas clases
                if (!isOpen) {
                    item.classList.add('is-open');
                    item.classList.add('active');

                    if (accordion.classList.contains('ebook-toc')) {
                        trackEvent('EbookTOCOpen', { label: header.textContent.trim() });
                    }

                    if (accordion.classList.contains('ebook-faq__accordion')) {
                        trackEvent('EbookFAQOpen', { label: header.textContent.trim() });
                    }
                }
            });
        });
    });
}
