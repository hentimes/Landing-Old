/**
 * Módulo: afp-carousel.js
 * Movimiento continuo (Marquee) para los logos de AFP en la sección Ebook.
 */

export function initAfpCarousel() {
    const carousel = document.querySelector('#afp-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.afp-marquee-track');
    if (!track) return;

    // Clonar ítems para asegurar loop infinito fluido
    const items = Array.from(track.children);
    if (items.length === 0) return;

    items.forEach(item => {
        const clone = item.cloneNode(true);
        track.appendChild(clone);
    });

    // Control de pausa al pasar el mouse
    carousel.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    carousel.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
}
