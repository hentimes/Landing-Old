// ===================================
// Modulo para la Seccion de Testimonios
// ===================================

import { testimonialsData } from '../../data/testimonials.js';

export function initTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;

    const cardsCount = 2;
    let currentShown = [];
    let nextSlotToChange = 1;

    let availableSlots = [...Array(testimonialsData.length).keys()];
    availableSlots = availableSlots.sort(() => 0.5 - Math.random());
    currentShown = availableSlots.slice(0, cardsCount);

    let html = '';
    currentShown.forEach((dataIndex, slotIndex) => {
        const testimonial = testimonialsData[dataIndex];
        html += createTestimonialHTML(testimonial, slotIndex);
    });
    container.innerHTML = html;

    setInterval(() => {
        const slotToChange = nextSlotToChange;
        nextSlotToChange = nextSlotToChange === 1 ? 0 : 1;
        let unshownIndices = availableSlots.filter((i) => !currentShown.includes(i));
        if (unshownIndices.length === 0) unshownIndices = availableSlots;

        const newTestimonialIndex = unshownIndices[Math.floor(Math.random() * unshownIndices.length)];
        currentShown[slotToChange] = newTestimonialIndex;

        const cardDOM = container.children[slotToChange];
        if (cardDOM) {
            updateTestimonialCardDOM(cardDOM, testimonialsData[newTestimonialIndex]);
        }
    }, 4500);
}

function createTestimonialHTML(testimonial, slotIndex) {
    const randomAvatarId = Math.floor(Math.random() * 50) + 1;
    const avatarSrc = `https://i.pravatar.cc/150?img=${randomAvatarId}`;
    const authorLabel = formatAuthorName(testimonial.author);
    const avatarHtml = `<img src="${avatarSrc}" alt="Usuario PlanesPro" class="testimonial-card__avatar-img">`;
    const starsHtml = createStarsHtml(testimonial.stars);
    const googleLogoHtml = `<img src="assets/logos_varios/google.webp" alt="Google" class="testimonial-card__google-logo-img">`;
    const reviewDate = generateReviewDate(slotIndex);

    return `
        <div class="testimonial-card" data-slot="${slotIndex}">
            <div class="testimonial-card__google-logo">${googleLogoHtml}</div>
            <div class="testimonial-card__header">
                <div class="testimonial-card__avatar">${avatarHtml}</div>
                <div class="testimonial-card__author">
                    <strong class="testimonial-author-name">${authorLabel}</strong>
                    <div class="testimonial-stars-container">${starsHtml}</div>
                </div>
            </div>
            <div class="testimonial-card__body">
                 <p class="testimonial-card__quote">"${testimonial.quote}"</p>
                 <p class="testimonial-card__date">${reviewDate}</p>
            </div>
        </div>
    `;
}

function updateTestimonialCardDOM(cardDOM, newTestimonial) {
    const randomAvatarId = Math.floor(Math.random() * 50) + 1;
    const avatarSrc = `https://i.pravatar.cc/150?img=${randomAvatarId}`;

    const avatarImg = cardDOM.querySelector('.testimonial-card__avatar-img');
    const authorName = cardDOM.querySelector('.testimonial-author-name');
    const quoteText = cardDOM.querySelector('.testimonial-card__quote');
    const starsContainer = cardDOM.querySelector('.testimonial-stars-container');
    const dateEl = cardDOM.querySelector('.testimonial-card__date');

    cardDOM.style.opacity = '0.4';

    setTimeout(() => {
        if (avatarImg) avatarImg.src = avatarSrc;
        if (authorName) authorName.textContent = formatAuthorName(newTestimonial.author);
        if (quoteText) quoteText.textContent = `"${newTestimonial.quote}"`;
        if (dateEl) dateEl.textContent = generateReviewDate();

        if (starsContainer) {
            starsContainer.innerHTML = createStarsHtml(newTestimonial.stars);
        }

        cardDOM.style.opacity = '1';
    }, 200);
}

function formatAuthorName(author) {
    if (!author) return 'C. Cliente';
    const parts = String(author).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0];
    const initial = parts[0].charAt(0).toUpperCase();
    const lastName = parts[parts.length - 1];
    return `${initial}. ${lastName}`;
}

function createStarsHtml(stars) {
    const fullStars = Math.max(0, Math.min(5, Number(stars) || 0));
    const icons = Array.from({ length: 5 }, (_, index) => {
        const finalClass = index === 4 ? ' testimonial-card__star--final' : '';
        const iconClass = index < fullStars ? 'fas fa-star' : 'far fa-star';
        return `<i class="${iconClass} testimonial-card__star${finalClass}" aria-hidden="true"></i>`;
    }).join('');
    return `<div class="testimonial-card__stars">${icons}</div>`;
}

function generateReviewDate(seed = Date.now()) {
    const start = new Date('2017-11-01T00:00:00');
    const end = new Date();
    const range = end.getTime() - start.getTime();
    const pseudo = typeof seed === 'number'
        ? Math.abs(Math.sin(seed * 9999.123)) % 1
        : Math.random();
    const date = new Date(start.getTime() + Math.floor(range * pseudo));
    return new Intl.DateTimeFormat('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}
