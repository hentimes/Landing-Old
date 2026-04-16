// ===================================
// Módulo para la Funcionalidad de Navegación
// ===================================
// Responsable de la lógica del menú móvil (hamburguesa).

export function initNavigation() {
    
    // --- Selección de Elementos del DOM ---
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
    
    // Si no encuentra los elementos necesarios, termina la ejecución.
    if (!navToggle || !navMobile) {
        console.warn('Elementos de navegación móvil no encontrados.');
        return;
    }

    // --- Función para alternar el menú ---
    const toggleMenu = (event) => {
        // Detiene la propagación del evento para evitar que otros listeners se activen.
        event.stopPropagation();
        
        // Alterna las clases 'is-active' para la animación del botón
        // y 'nav-mobile--is-open' para mostrar/ocultar el menú.
        navToggle.classList.toggle('is-active');
        navMobile.classList.toggle('nav-mobile--is-open');

        // Bloquea/desbloquea el scroll del body.
        document.body.classList.toggle('no-scroll');
    };

    // --- Función para cerrar el menú ---
    const closeMenu = () => {
        if (navMobile.classList.contains('nav-mobile--is-open')) {
            navToggle.classList.remove('is-active');
            navMobile.classList.remove('nav-mobile--is-open');
            document.body.classList.remove('no-scroll');
        }
    };

    // --- Asignación de Eventos ---

    // 1. Al hacer clic en el botón de hamburguesa, alterna el menú.
    navToggle.addEventListener('click', toggleMenu);

    // 2. Al hacer clic en cualquier parte del body, cierra el menú.
    // Esto es útil para que el menú se cierre si el usuario toca fuera de él.
    document.body.addEventListener('click', closeMenu);

    // 3. Al hacer clic DENTRO del menú, evitamos que se cierre.
    // Detiene la propagación del evento para que no llegue al 'body'.
    navMobile.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // 4. Al hacer clic en un ENLACE del menú, lo cerramos.
    // Esto es para que el menú desaparezca después de que el usuario elige una opción.
    navMobile.querySelectorAll('a, button').forEach(item => {
        item.addEventListener('click', closeMenu);
    });
}