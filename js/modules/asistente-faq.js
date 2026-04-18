/**
 * Modulo: Asistente FAQ del cierre en index.
 * Mantiene el menu por categorias y el acordeon interno.
 */

export const initAsistenteFAQ = () => {
    const container = document.getElementById('asistente-faq');
    if (!container) return;

    const views = container.querySelectorAll('.asistente-faq__view');
    const categoryButtons = container.querySelectorAll('.category-btn');
    const backButtons = container.querySelectorAll('.btn-volver');
    const accordionItems = container.querySelectorAll('.accordion-item');

    const setActiveState = (isActive) => {
        container.classList.toggle('asistente-faq--active', isActive);
    };

    const closeAllAccordions = () => {
        accordionItems.forEach((item) => item.classList.remove('is-open'));
    };

    const switchView = (viewId) => {
        views.forEach((view) => {
            view.classList.toggle('asistente-faq__view--active', view.id === `view-${viewId}`);
        });

        setActiveState(viewId !== 'categories');
    };

    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            switchView(target);
        });
    });

    backButtons.forEach((button) => {
        button.addEventListener('click', () => {
            closeAllAccordions();
            switchView('categories');
        });
    });

    accordionItems.forEach((item) => {
        const header = item.querySelector('.accordion-item__header');
        if (!header) return;

        header.addEventListener('click', (event) => {
            event.stopPropagation();

            const isOpen = item.classList.contains('is-open');
            const parentView = item.closest('.asistente-faq__view');
            if (!parentView) return;

            parentView.querySelectorAll('.accordion-item').forEach((accordionItem) => {
                accordionItem.classList.remove('is-open');
            });

            if (!isOpen) item.classList.add('is-open');
        });
    });

    container.addEventListener('mouseleave', () => {
        window.setTimeout(() => {
            if (!container.matches(':hover') && !container.matches(':focus-within')) {
                closeAllAccordions();
                switchView('categories');
            }
        }, 180);
    });
};
