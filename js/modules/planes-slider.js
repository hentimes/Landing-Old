// ===================================
// Módulo para el Slider de Planes
// ===================================

// Se importa la data con la información de cada plan.
import { planesData } from '../../data/planes.js';

/* Inicializa el slider de planes, haciéndolo interactivo */
export function initPlanesSlider() {
    /* -----------------------------------
       Selección de los elementos del DOM
       ----------------------------------- */
    const sliderContainer = document.querySelector('#planes .plan-slider-container');
    const slider           = document.querySelector('#planes .plan-slider');

    /* Flechas existentes en controles inferiores (se mantienen) */
    const prevButton       = document.querySelector('#planes .slider-arrow.prev');
    const nextButton       = document.querySelector('#planes .slider-arrow.next');

    /* Flechas laterales de desktop (ahora en WRAPPER estático) */
    /* Nota: Se ubican como hermanas del contenedor que scrollea,
       por eso las buscamos dentro de .plan-slider-wrapper */
    const desktopPrev      = document.querySelector('#planes .plan-slider-wrapper .slider-arrow.desktop-prev');
    const desktopNext      = document.querySelector('#planes .plan-slider-wrapper .slider-arrow.desktop-next');

    /* Validaciones mínimas */
    if (!slider || !sliderContainer) return;

    /* Evita doble inicialización */
    if (slider.dataset.initialized === 'true') return;
    slider.dataset.initialized = 'true';

    /* Estado del slider */
    let currentIndex = 0;

    /* -----------------------------------
       Construcción del Slider
       - Limpieza e inyección de tarjetas
       - Se eliminan definitivamente los "dots"
       ----------------------------------- */
    slider.innerHTML = '';
    // Eliminado por requerimiento: dots/paginación
    // (No se consulta ni se manipula .slider-dots en ningún punto)

    planesData.forEach((plan) => {
        slider.appendChild(createPlanCard(plan));
    });

    const cards = slider.querySelectorAll('.plan-card');
    if (cards.length === 0) return;

    /* -----------------------------------
       Utilidades de viewport
       ----------------------------------- */
    const DESKTOP_QUERY = '(min-width: 992px)';

    function isDesktop() {
        return window.matchMedia(DESKTOP_QUERY).matches;
    }

    /* -----------------------------------
       Posicionamiento/centrado del slide
       ----------------------------------- */
    function updateSliderView() {
        const targetCard = cards[currentIndex];
        if (!targetCard) return;

        if (isDesktop()) {
            /* Centrado en desktop: ubicar tarjeta activa al centro del container scrolleable */
            const containerWidth = sliderContainer.clientWidth;
            const cardWidth = targetCard.offsetWidth;
            const offsetLeft = targetCard.offsetLeft;
            const left = Math.max(0, offsetLeft - (containerWidth - cardWidth) / 2);

            sliderContainer.scrollTo({
                left,
                behavior: 'smooth'
            });
        } else {
            /* Comportamiento móvil/tablet: avance por ancho de tarjeta + gap (alineado a la izquierda) */
            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(window.getComputedStyle(slider).gap, 10) || 0;
            const scrollPosition = (cardWidth + gap) * currentIndex;

            sliderContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }

    /* -----------------------------------
       Navegación Next/Prev con envolvimiento
       ----------------------------------- */
    function goNext() {
        currentIndex = (currentIndex === cards.length - 1) ? 0 : currentIndex + 1;
        updateSliderView();
    }

    function goPrev() {
        currentIndex = (currentIndex === 0) ? cards.length - 1 : currentIndex - 1;
        updateSliderView();
    }

    /* -----------------------------------
       Eventos: flechas existentes (inferiores)
       ----------------------------------- */
    if (nextButton) nextButton.addEventListener('click', goNext);
    if (prevButton) prevButton.addEventListener('click', goPrev);

    /* -----------------------------------
       Eventos: flechas laterales desktop (wrapper estático)
       ----------------------------------- */
    if (desktopNext) desktopNext.addEventListener('click', goNext);
    if (desktopPrev) desktopPrev.addEventListener('click', goPrev);

    /* -----------------------------------
       Re-centrado al cambiar de tamaño (solo desktop)
       ----------------------------------- */
    window.addEventListener('resize', () => {
        if (isDesktop()) updateSliderView();
    });

    /* -----------------------------------
       Centrado inicial en desktop
       - Deja el carrusel equilibrado entre flechas al cargar.
       - Se hace tras el primer layout para usar medidas correctas.
       ----------------------------------- */
    if (isDesktop()) {
        requestAnimationFrame(() => {
            updateSliderView();
        });
    }

    /* -----------------------------------
       Recentrar al cruzar a desktop (matchMedia)
       - Si el usuario expande la ventana y pasa el breakpoint,
         recentramos una vez para mantener la composición.
       ----------------------------------- */
    const mqDesktop = window.matchMedia(DESKTOP_QUERY);
    const mqHandler = (e) => {
        if (e.matches) {
            requestAnimationFrame(() => {
                updateSliderView();
            });
        }
    };
    /* Soporte moderno y fallback */
    if (mqDesktop.addEventListener) {
        mqDesktop.addEventListener('change', mqHandler);
    } else if (mqDesktop.addListener) {
        mqDesktop.addListener(mqHandler);
    }

    /* Nota:
       Antes evitábamos llamar a updateSliderView al iniciar para no provocar saltos en móvil.
       Con este ajuste, sólo lo hacemos en desktop y luego de layout, manteniendo móvil intacto. */
}

/* Crea y devuelve el elemento HTML para una sola tarjeta de plan */
function createPlanCard(planData) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('plan-card');
    if (planData.featured) {
        cardElement.classList.add('plan-card--featured');
    }

    const benefitsHtml = planData.benefits.map(benefit => `
        <li class="plan-card__benefit">
            <i class="fas ${benefit.icon}"></i>
            <div class="benefit__text">
                <span>${benefit.name}</span>
                <strong>${benefit.coverage}</strong>
            </div>
        </li>
    `).join('');
    
    const clinicsHtml = planData.clinics.join(' • ');

    cardElement.innerHTML = `
        ${planData.featured ? '<div class="plan-card__featured-ribbon"><i class="fas fa-star"></i></div>' : ''}
        <div class="plan-card__header">
            <img src="${planData.isapreLogo}" alt="Logo Isapre" class="plan-card__logo">
            <div class="plan-card__price">
                <strong>$${planData.price}</strong>
                <span>/mes</span>
            </div>
        </div>
        <div class="plan-card__body">
            <div class="plan-card__clinics">
                <i class="fas fa-clinic-medical"></i>
                <span>${clinicsHtml}</span>
            </div>
            <div class="plan-card__plan-type">${planData.type}</div>
            <ul class="plan-card__benefits-list">
                ${benefitsHtml}
            </ul>
        </div>
        <div class="plan-card__footer">
            <button class="button button--primary plan-card__cta" data-modal-trigger="formModal">Ver Detalle</button>
        </div>
    `;
    return cardElement;
}
