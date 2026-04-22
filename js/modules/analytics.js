// ===========================================
// Módulo de analíticas y seguimiento (v1.1)
// ===========================================

/**
 * Configuración de IDs:
 * Reemplaza los valores de abajo por tus IDs reales para activar el seguimiento.
 */
const TRACKING_IDS = {
    META_PIXEL: '2795536600793741',
    // Pending: replace with the GA4 Measurement ID when available.
    GA4: 'G-TU_ID_AQUI'
};

export function initAnalytics() {
    // 1. Inicialización de Meta Pixel
    if (TRACKING_IDS.META_PIXEL && TRACKING_IDS.META_PIXEL !== 'TU_PIXEL_ID_AQUI') {
        initMetaPixel(TRACKING_IDS.META_PIXEL);
    }

    // 2. Inicialización de Google Analytics 4
    if (TRACKING_IDS.GA4 && TRACKING_IDS.GA4 !== 'G-TU_ID_AQUI') {
        initGA4(TRACKING_IDS.GA4);
    }

    // 3. Registro de eventos globales
    setupEventTracking();
}

function initMetaPixel(id) {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    
    fbq('init', id);
    fbq('track', 'PageView');
}

function initGA4(id) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', id);
}

/**
 * Configura el seguimiento de clics y conversiones relevantes.
 */
function setupEventTracking() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (!target) return;

        // Clic en WhatsApp
        if (target.href && target.href.includes('wa.me')) {
            trackEvent('Contact', { method: 'WhatsApp', location: target.id || 'floating' });
        }

        if (target.href && target.href.includes('pay.hotmart.com')) {
            trackEvent('HotmartClick', {
                label: target.textContent.trim(),
                href: target.href,
                location: target.dataset.trackLocation || target.id || target.className || 'hotmart_link'
            });
        }

        const trackedEventName = target.getAttribute('data-track');
        if (trackedEventName) {
            trackEvent(trackedEventName, {
                label: target.textContent.trim(),
                href: target.href || '',
                location: target.dataset.trackLocation || target.id || target.className || 'tracked_element'
            });
        }

        // Clic en CTA de Formulario
        if (target.hasAttribute('data-modal-trigger') || target.id === 'cta_hero') {
            trackEvent('LeadStarted', { label: target.textContent.trim() });
        }
    });
}

/**
 * Función auxiliar para enviar eventos a todas las plataformas activas.
 */
export function trackEvent(name, params = {}) {
    if (window.fbq) fbq('trackCustom', name, params);
    if (window.gtag) gtag('event', name, params);
}

