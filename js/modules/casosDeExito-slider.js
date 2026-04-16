// ===================================
// Módulo para el Slider de Casos de Éxito
// ===================================
import { casosDeExitoData } from '../../data/casosDeExito.js';

export function initCasosDeExitoSlider() {
    const sliderContainer = document.querySelector('.case-study-slider');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevButton = document.querySelector('#casos-exito .slider-arrow.prev');
    const nextButton = document.querySelector('#casos-exito .slider-arrow.next');

    // Si los elementos no existen en la página, detenemos la ejecución.
    if (!sliderContainer || !dotsContainer || !prevButton || !nextButton) {
        return;
    }

    let currentIndex = 0;
    let slideInterval; // Variable para guardar el temporizador del slider automático

    // 1. Construir el HTML de las tarjetas y los puntos a partir de los datos.
    // CORRECCIÓN: Se debe iterar sobre el array 'casosDeExitoData', no sobre la función.
    casosDeExitoData.forEach((study, index) => {
        sliderContainer.appendChild(createCaseStudyCard(study));
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        dot.setAttribute('data-index', index);
        dotsContainer.appendChild(dot);
    });

    const cards = sliderContainer.querySelectorAll('.case-study-card');
    const dots = dotsContainer.querySelectorAll('.slider-dot');

    // Si no se crearon tarjetas, detenemos la ejecución.
    if (cards.length === 0) return;

    // 2. Función principal que actualiza qué tarjeta y punto están activos.
    function updateSliderView() {
        // Oculta todas las tarjetas
        cards.forEach(card => card.classList.remove('is-active'));
        // Muestra solo la tarjeta actual
        cards[currentIndex].classList.add('is-active');

        // Actualiza el punto activo
        dots.forEach(dot => dot.classList.remove('is-active'));
        dots[currentIndex].classList.add('is-active');
    }

    // 3. Funciones para controlar el slider automático.
    const startAutoSlide = () => {
        stopAutoSlide(); // Limpiamos cualquier intervalo anterior para evitar duplicados.
        slideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % cards.length;
            updateSliderView();
        }, 7000); // Cambia cada 7 segundos.
    };

    const stopAutoSlide = () => {
        clearInterval(slideInterval);
    };

    // 4. Asignar eventos a los botones y puntos.
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateSliderView();
        startAutoSlide(); // Reinicia el temporizador al navegar manualmente
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateSliderView();
        startAutoSlide(); // Reinicia el temporizador
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.target.dataset.index, 10);
            updateSliderView();
            startAutoSlide(); // Reinicia el temporizador
        });
    });

    // Pausar el slider si el usuario pasa el mouse por encima (para escritorio).
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    // Reanudar el slider cuando el mouse sale.
    sliderContainer.addEventListener('mouseleave', startAutoSlide);

    // Inicializar la primera vista y el slider automático.
    updateSliderView();
    startAutoSlide();
}

// Función que genera el HTML para una sola tarjeta de caso de éxito.
function createCaseStudyCard(studyData) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('case-study-card');
    const badgeClass = studyData.badgeType === 'neutral' ? 'case-study__badge--neutral' : '';

    cardElement.innerHTML = `
        <div class="case-study__header">
            <h3><i class="${studyData.icon}"></i> ${studyData.title}</h3>
            <div class="case-study__badge ${badgeClass}">${studyData.badge}</div>
        </div>
        <div class="case-study__content">
            <div class="case-study__column case-study__column--before">
                <h4>Situación Anterior:</h4>
                <p>Isapre: ${studyData.before.isapre}</p>
                <p>Pago mensual: <strong>${studyData.before.payment}</strong></p>
                <p>Problema: ${studyData.before.problem}</p>
            </div>
            <div class="case-study__column case-study__column--after">
                <h4>Optimización Realizada:</h4>
                <p>Isapre: ${studyData.after.isapre}</p>
                <p>Pago mensual: <strong>${studyData.after.payment}</strong></p>
                <p>Beneficio: ${studyData.after.benefit}</p>
            </div>
        </div>
        <div class="case-study__result">
            <strong>Resultado:</strong> ${studyData.result}
        </div>
    `;
    return cardElement;
}