// ===================================
// Módulo para la Sección de Testimonios
// ===================================

import { testimonialsData } from '../../data/testimonials.js';

/**
 * Inicializa el componente de testimonios.
 */
export function initTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;

    const half = Math.ceil(testimonialsData.length / 2);
    const firstRowData = testimonialsData.slice(0, half);
    const secondRowData = testimonialsData.slice(half);

    container.innerHTML = `
        <div class="testimonial-fader" id="testimonial-row-1"></div>
        <div class="testimonial-fader" id="testimonial-row-2"></div>
    `;

    setupFader('testimonial-row-1', firstRowData, 'left-to-right');
    setupFader('testimonial-row-2', secondRowData, 'right-to-left');
}

/**
 * Configura una fila de testimonios con rotación automática, pausa en hover y avance por clic.
 * @param {string} containerId El ID del contenedor de la fila.
 * @param {Array} data Los datos para esta fila.
 * @param {string} direction La dirección de la animación.
 */
function setupFader(containerId, data, direction) {
    const rowContainer = document.getElementById(containerId);
    if (!rowContainer || data.length === 0) return;

    let currentIndex = -1;
    let intervalId = null;

// Función que maneja el cambio de tarjeta.
const changeCard = () => {
    const currentCard = rowContainer.querySelector('.is-visible');

    if (currentCard) {
        // Se le añaden las clases para la animación de salida
        currentCard.classList.remove('is-visible');
        currentCard.classList.add(`is-exiting-${direction}`);

        // Evento clave: Cuando la animación de salida TERMINA, se elimina la tarjeta del DOM.
        // La opción { once: true } es crucial para que este evento solo se ejecute una vez.
        currentCard.addEventListener('animationend', () => {
            currentCard.remove();
        }, { once: true });
    }

    currentIndex = (currentIndex + 1) % data.length;

    const nextCardHtml = createTestimonialCard(data[currentIndex]);
    rowContainer.insertAdjacentHTML('beforeend', nextCardHtml);
    const nextCard = rowContainer.lastElementChild;

    // Se usan para forzar al navegador a aplicar las clases en el siguiente "frame" de renderizado,
    // asegurando que la animación de entrada se ejecute.
    requestAnimationFrame(() => {
        nextCard.classList.add(`is-entering-${direction}`);
        nextCard.classList.add('is-visible');
    });
};

    // Inicia el intervalo de rotación automática.
    const startInterval = (immediate = false) => {
        stopInterval(); // Limpia cualquier intervalo anterior para evitar duplicados.
        if (immediate) {
            changeCard(); // Si se pide, cambia la tarjeta inmediatamente.
        }
        intervalId = setInterval(changeCard, 5000); 
    };

    // Detiene el intervalo.
    const stopInterval = () => {
        clearInterval(intervalId);
        intervalId = null;
    };

    // --- ASIGNACIÓN DE EVENTOS ---

    // 1. Pausa la rotación al pasar el mouse por encima.
    rowContainer.addEventListener('mouseenter', stopInterval);

    // 2. Reanuda la rotación al quitar el mouse.
    rowContainer.addEventListener('mouseleave', () => startInterval());

    // 3. Al hacer clic, avanza la tarjeta y reinicia el temporizador.
    rowContainer.addEventListener('click', () => {
        // El 'true' fuerza el cambio inmediato de la tarjeta.
        startInterval(true);
    });

    // Inicia el ciclo por primera vez al cargar la página.
    changeCard(); // Muestra la primera tarjeta.
    startInterval(); // Comienza la rotación automática.
}


/**
 * Crea el código HTML para una sola tarjeta de testimonio.
 * @param {object} testimonial El objeto con los datos del testimonio.
 * @param {string} [animationClass=''] Clases de animación iniciales.
 * @returns {string} El código HTML de la tarjeta.
 */
function createTestimonialCard(testimonial, animationClass = '') {
    const avatarHtml = (testimonial.avatar && testimonial.avatar.trim() !== '')
        ? `<img src="${testimonial.avatar}" alt="Avatar de ${testimonial.author}" class="testimonial-card__avatar-img">`
        : `<i class="fas fa-user-circle"></i>`;

    const cardClasses = `testimonial-card ${animationClass}`;

    const starsHtml = `<div class="testimonial-card__stars">${'★'.repeat(testimonial.stars)}${'☆'.repeat(5 - testimonial.stars)}</div>`;

    const googleLogoHtml = `<img src="assets/logos_varios/google.png" alt="Google" class="testimonial-card__google-logo-img">`;

    return `
        <div class="${cardClasses.trim()}">
            <div class="testimonial-card__google-logo">${googleLogoHtml}</div>
            <div class="testimonial-card__header">
                <div class="testimonial-card__avatar">${avatarHtml}</div>
                <div class="testimonial-card__author">
                    <strong>${testimonial.author}</strong>
                    ${starsHtml}
                </div>
            </div>
            <div class="testimonial-card__body">
                 <p class="testimonial-card__quote">“${testimonial.quote}”</p>
            </div>
        </div>
    `;
}