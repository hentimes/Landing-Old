// ===================================
// Módulo para el Fader de Logos de Isapres
// ===================================

// --- Configuración ---

// Lista de todos los logos disponibles.
const ALL_LOGOS = [
    { src: 'assets/logos_isapre/consalud.png', alt: 'Consalud Logo' },
    { src: 'assets/logos_isapre/nuevamasvida.png', alt: 'Nueva Masvida Logo' },
    { src: 'assets/logos_isapre/cruzblanca.png', alt: 'CruzBlanca Logo' },
    { src: 'assets/logos_isapre/colmena.png', alt: 'Colmena Logo' },
    { src: 'assets/logos_isapre/vidatres.png', alt: 'Vida Tres Logo' },
    { src: 'assets/logos_isapre/banmedica-logo.png', alt: 'Banmédica Logo' },
    { src: 'assets/logos_isapre/esencial.png', alt: 'Esencial Logo' }
];
// Intervalo de tiempo para cambiar los logos.
const CHANGE_INTERVAL = 4000; // 4 segundos

// Variable para controlar el temporizador del ciclo.
let intervalId = null;

// --- Funciones Principales ---

/**
 * Inicializa el componente del fader de logos.
 */
export function initLogoFader() {
    const container = document.querySelector('.logo-fader');
    if (!container) return;

    // Inicia el ciclo de cambio de logos.
    startFader(container);

    // Asigna los eventos para pausar y reanudar al interactuar con los logos.
    container.addEventListener('mousedown', (e) => handlePressStart(e.target));
    container.addEventListener('touchstart', (e) => handlePressStart(e.target), { passive: true });

    container.addEventListener('mouseup', (e) => handlePressEnd(e.target, container));
    container.addEventListener('touchend', (e) => handlePressEnd(e.target, container));
    container.addEventListener('mouseleave', (e) => handlePressEnd(e.target, container));
}

/**
 * Función principal que actualiza los logos visibles con una transición suave.
 * @param {HTMLElement} container - El elemento contenedor de los logos.
 */
function updateLogos(container) {
    // Determina cuántos logos mostrar según el ancho de la pantalla.
    const logosToShow = window.innerWidth <= 768 ? 3 : 6;
    const selectedLogos = getRandomLogos(logosToShow);

    // 1. Hace que los logos actuales se desvanezcan (fade-out).
    const currentImages = container.querySelectorAll('.logo-fader__img');
    currentImages.forEach(img => img.classList.remove('is-visible'));

    // 2. Espera a que la animación de desvanecimiento termine.
    setTimeout(() => {
        // 3. Limpia el contenedor y crea los nuevos logos.
        container.innerHTML = '';
        selectedLogos.forEach(logo => {
            const img = document.createElement('img');
            img.src = logo.src;
            img.alt = logo.alt;
            img.className = 'logo-fader__img'; // Se añaden sin la clase 'is-visible'
            container.appendChild(img);
        });

        // 4. Se usa un pequeño delay para asegurar que el navegador aplique la transición.
        setTimeout(() => {
            container.querySelectorAll('.logo-fader__img').forEach(img => {
                img.classList.add('is-visible'); // Hace aparecer los nuevos logos (fade-in).
            });
        }, 50);

    }, 500); // Este tiempo debe coincidir con la duración de la transición en el CSS.
}


// --- Funciones de Ayuda ---

/**
 * Inicia o reinicia el ciclo de cambio de logos.
 * @param {HTMLElement} container - El elemento contenedor.
 */
function startFader(container) {
    if (intervalId) return; // Evita múltiples ciclos simultáneos.
    updateLogos(container); // Muestra el primer set de logos inmediatamente.
    intervalId = setInterval(() => updateLogos(container), CHANGE_INTERVAL);
}

/**
 * Detiene el ciclo de cambio de logos.
 */
function stopFader() {
    clearInterval(intervalId);
    intervalId = null;
}

/**
 * Se ejecuta cuando el usuario presiona un logo.
 * @param {EventTarget} target - El elemento que recibió el clic.
 */
function handlePressStart(target) {
    if (target.classList.contains('logo-fader__img')) {
        stopFader();
        target.classList.add('is-vibrating');
    }
}

/**
 * Se ejecuta cuando el usuario suelta un logo.
 * @param {EventTarget} target - El elemento que se soltó.
 * @param {HTMLElement} container - El contenedor para reiniciar el ciclo.
 */
function handlePressEnd(target, container) {
    if (target.classList.contains('logo-fader__img')) {
        target.classList.remove('is-vibrating');
        startFader(container);
    }
}

/**
 * Algoritmo para obtener una selección aleatoria de logos sin repetir.
 * @param {number} count - La cantidad de logos a seleccionar.
 * @returns {Array} Un array con los logos seleccionados.
 */
function getRandomLogos(count) {
    const shuffled = [...ALL_LOGOS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}