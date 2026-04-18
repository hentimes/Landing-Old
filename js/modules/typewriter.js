// ===================================
// Módulo: Typewriter Carousel para el Hero
// Tipea → espera → borra → siguiente frase → loop infinito
// ===================================

const PHRASES = [
    "¿Estás pagando de más por tu plan de salud",
    "¿Estás insatisfecho con tu plan de Isapre actual",
    "¿Incrementó tu 7% y aún no mejoras la cobertura",
    "¿Te volvieron a aumentar el plan de Isapre",
    "¿Lo que descuentan en Fonasa podría pagarte un excelente plan de Isapre",
    "¿Le temes a las listas de espera del sistema público",
    "¿Prefieres atenderte en clínicas pero sigues afiliado a Fonasa",
    "¿Guagua en camino Ya no se trata solo de ti. ¡Mejora tu plan!"
];

const TYPE_SPEED   = 40;   // ms por carácter al tipear
const DELETE_SPEED = 22;   // ms por carácter al borrar (más rápido)
const PAUSE_AFTER  = 2200; // ms de espera con texto completo
const PAUSE_NEXT   = 400;  // ms de pausa antes de tipear la siguiente

export function initHeroTypewriter() {
    const el     = document.querySelector('.hero__typewriter');
    const cursor = document.querySelector('.hero__cursor');
    if (!el) return;

    let phraseIndex = 0;
    let charIndex   = 0;
    let isDeleting  = false;

    function tick() {
        const current = PHRASES[phraseIndex];

        if (!isDeleting) {
            // ─── Tipeando ───
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === current.length) {
                // Frase completa → pausa → empezar a borrar
                isDeleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
            setTimeout(tick, TYPE_SPEED);

        } else {
            // ─── Borrando ───
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                // Texto vacío → pasar a la siguiente frase
                isDeleting   = false;
                phraseIndex  = (phraseIndex + 1) % PHRASES.length;
                setTimeout(tick, PAUSE_NEXT);
                return;
            }
            setTimeout(tick, DELETE_SPEED);
        }
    }

    // Pequeño delay inicial para que el hero ya esté visible
    setTimeout(tick, 600);
}
