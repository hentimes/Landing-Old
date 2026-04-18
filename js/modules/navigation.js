// ===================================
// Modulo para la Funcionalidad de Navegacion
// ===================================
// Responsable de la logica del menu movil.

export function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');

    if (!navToggle || !navMobile) {
        console.warn('Elementos de navegación móvil no encontrados.');
        return;
    }

    navToggle.setAttribute('aria-controls', 'nav-mobile');
    navToggle.setAttribute('aria-expanded', 'false');

    const toggleMenu = (event) => {
        event.stopPropagation();
        navToggle.classList.toggle('is-active');
        navMobile.classList.toggle('nav-mobile--is-open');
        navToggle.setAttribute('aria-expanded', navMobile.classList.contains('nav-mobile--is-open') ? 'true' : 'false');
        document.body.classList.toggle('no-scroll');
    };

    const closeMenu = () => {
        if (navMobile.classList.contains('nav-mobile--is-open')) {
            navToggle.classList.remove('is-active');
            navMobile.classList.remove('nav-mobile--is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }
    };

    navToggle.addEventListener('click', toggleMenu);
    document.body.addEventListener('click', closeMenu);
    navMobile.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    navMobile.querySelectorAll('a, button').forEach((item) => {
        item.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}
