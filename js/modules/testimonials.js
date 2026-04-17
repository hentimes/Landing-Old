// ===================================
// Módulo para la Sección de Testimonios
// ===================================

import { testimonialsData } from '../../data/testimonials.js';

export function initTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;

    // Queremos mostrar 2 tarjetas estáticas en el grid para Desktop y Mobile.
    const cardsCount = 2; 
    let currentShown = []; // Indices de los testimonios en pantalla

    // 1. Elegir "cardsCount" testimonios al azar de la data grande
    let availableSlots = [...Array(testimonialsData.length).keys()];
    availableSlots = availableSlots.sort(() => 0.5 - Math.random());
    currentShown = availableSlots.slice(0, cardsCount);

    let html = '';
    currentShown.forEach((dataIndex, slotIndex) => {
        const t = testimonialsData[dataIndex];
        html += createTestimonialHTML(t, slotIndex);
    });
    container.innerHTML = html;

    // 2. Intervalo que cambia el texto y avatar de UNA tarjeta al azar cada 4.5s
    //    Sin animaciones "pop in / pop out" completas de contenedor, solo cambia la data.
    setInterval(() => {
        const slotToChange = Math.floor(Math.random() * cardsCount);
        
        // Encontrar un testimonio que NO este actualmente repetido en pantalla
        let unshownIndices = availableSlots.filter(i => !currentShown.includes(i));
        if (unshownIndices.length === 0) unshownIndices = availableSlots; // Fallback
        
        const newTestimonialIndex = unshownIndices[Math.floor(Math.random() * unshownIndices.length)];
        currentShown[slotToChange] = newTestimonialIndex; // Guardar estado
        
        const cardDOM = container.children[slotToChange];
        if (cardDOM) {
            updateTestimonialCardDOM(cardDOM, testimonialsData[newTestimonialIndex]);
        }
    }, 4500);
}

function createTestimonialHTML(testimonial, slotIndex) {
    // Escoger un avatar aleatorio de un placeholder real si no se provee. 
    // Usamos Pravatar.cc que tiene 70 caras limpias.
    const randomAvatarId = Math.floor(Math.random() * 70) + 1;
    const avatarSrc = `https://i.pravatar.cc/150?img=${randomAvatarId}`;

    const avatarHtml = `<img src="${avatarSrc}" alt="Usuario PlanesPro" class="testimonial-card__avatar-img">`;
    const starsHtml = `<div class="testimonial-card__stars">${'★'.repeat(testimonial.stars)}${'☆'.repeat(5 - testimonial.stars)}</div>`;
    const googleLogoHtml = `<img src="assets/logos_varios/google.png" alt="Google" class="testimonial-card__google-logo-img">`;

    return `
        <div class="testimonial-card" data-slot="${slotIndex}">
            <div class="testimonial-card__google-logo">${googleLogoHtml}</div>
            <div class="testimonial-card__header">
                <div class="testimonial-card__avatar">${avatarHtml}</div>
                <div class="testimonial-card__author">
                    <strong class="testimonial-author-name">${testimonial.author}</strong>
                    <div class="testimonial-stars-container">${starsHtml}</div>
                </div>
            </div>
            <div class="testimonial-card__body">
                 <p class="testimonial-card__quote">“${testimonial.quote}”</p>
            </div>
        </div>
    `;
}

function updateTestimonialCardDOM(cardDOM, newTestimonial) {
    const randomAvatarId = Math.floor(Math.random() * 70) + 1;
    const avatarSrc = `https://i.pravatar.cc/150?img=${randomAvatarId}`;
    
    const avatarImg = cardDOM.querySelector('.testimonial-card__avatar-img');
    const authorName = cardDOM.querySelector('.testimonial-author-name');
    const quoteText = cardDOM.querySelector('.testimonial-card__quote');
    const starsContainer = cardDOM.querySelector('.testimonial-stars-container');

    // Mínimo fade out visual rápido. (Opcional, pero previene pop muy brusco)
    cardDOM.style.opacity = '0.4';
    
    setTimeout(() => {
        if (avatarImg) avatarImg.src = avatarSrc;
        if (authorName) authorName.textContent = newTestimonial.author;
        if (quoteText) quoteText.textContent = `“${newTestimonial.quote}”`;
        
        if (starsContainer) {
             starsContainer.innerHTML = `<div class="testimonial-card__stars">${'★'.repeat(newTestimonial.stars)}${'☆'.repeat(5 - newTestimonial.stars)}</div>`;
        }
        
        cardDOM.style.opacity = '1';
    }, 200);
}