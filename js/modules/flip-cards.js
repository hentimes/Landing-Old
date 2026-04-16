// ===================================
// Módulo para las Tarjetas Interactivas ("Flip Cards")
// ===================================

export function initFlipCards() {
    
    // Selecciona todas las tarjetas con la clase 'flip-card'.
    const cards = document.querySelectorAll('.flip-card');

    // Si no hay tarjetas, no hace nada.
    if (cards.length === 0) {
        return;
    }

    // A cada tarjeta le asignamos un evento de 'click'.
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Al hacer clic, alterna la clase 'is-flipped'
            // para activar la animación de volteo definida en el CSS.
            card.classList.toggle('is-flipped');
        });
    });
}