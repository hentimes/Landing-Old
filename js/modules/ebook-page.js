const PRICE_SELECTOR = '[data-ebook-price]';
const ANIMATED_PRICE_SELECTOR = '[data-ebook-price-animated]';
const JSONLD_SCRIPT_ID = 'ebook-jsonld';

const parsePrice = (value) => Number(String(value).replace(/[^\d]/g, '')) || 0;
const formatPrice = (value) => `$${value.toLocaleString('es-CL')}`;

const updateOfferPrice = (node, price) => {
    if (!node || typeof node !== 'object') return;

    if (node.offers && typeof node.offers === 'object') {
        node.offers.price = String(price);
    }

    if (Array.isArray(node['@graph'])) {
        node['@graph'].forEach((entry) => updateOfferPrice(entry, price));
    }
};

const hydratePrices = (displayPrice, numericPrice) => {
    document.querySelectorAll(PRICE_SELECTOR).forEach((node) => {
        node.textContent = displayPrice;
    });

    const jsonLdScript = document.getElementById(JSONLD_SCRIPT_ID);
    if (!jsonLdScript || numericPrice <= 0) return;

    try {
        const jsonLd = JSON.parse(jsonLdScript.textContent);
        updateOfferPrice(jsonLd, numericPrice);
        jsonLdScript.textContent = JSON.stringify(jsonLd, null, 2);
    } catch {
        // JSON-LD should not block the page if edited manually.
    }
};

const animatePrice = (finalPrice) => {
    const animatedPrice = document.querySelector(ANIMATED_PRICE_SELECTOR);
    if (!animatedPrice || finalPrice <= 0) return;

    animatedPrice.textContent = formatPrice(finalPrice);

    const startAnimation = () => {
        const startValue = Math.floor(100000 + Math.random() * 100001);
        const duration = 1600;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (finalPrice - startValue) * eased);

            animatedPrice.textContent = formatPrice(currentValue);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                animatedPrice.textContent = formatPrice(finalPrice);
            }
        };

        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                startAnimation();
                obs.disconnect();
            }
        });
    }, { threshold: 0.45 });

    observer.observe(animatedPrice);
};

const animateComparisonValue = (element) => {
    const target = parseInt(element.dataset.countTo, 10);
    const startValue = element.dataset.countFrom ? parseInt(element.dataset.countFrom, 10) : 0;
    const type = element.dataset.countType;
    const duration = 2000;
    const startTime = performance.now();

    if (Number.isNaN(target) || Number.isNaN(startValue)) return;

    const update = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(startValue + (target - startValue) * eased);

        if (type === 'percent') {
            element.textContent = `${current}%`;
        } else {
            element.textContent = `$${current.toLocaleString('es-CL')}`;
            if (target === 500000) element.textContent += '+';
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.add('pulse-animation');
        }
    };

    requestAnimationFrame(update);
};

const initComparativeCard = () => {
    const card = document.querySelector('.hero-comparison-card');
    const columns = document.querySelectorAll('.comparison-col__value[data-count-to]');
    if (!card || !columns.length) return;

    const comparativeObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                columns.forEach((column) => animateComparisonValue(column));
                obs.disconnect();
            }
        });
    }, { threshold: 0.5 });

    comparativeObserver.observe(card);
};

const initSubtitleRotation = () => {
    const subtitleEl = document.getElementById('rotating-subtitle');
    if (!subtitleEl) return;

    const texts = [
        'Para técnicos extranjeros',
        'Sin pagar de más desde el inicio',
        'La guía definitiva',
        'Para profesionales extranjeros',
        'Manual con casos reales'
    ];

    let currentIndex = 1;

    setInterval(() => {
        subtitleEl.classList.remove('subtitle-animate-in', 'fade-in-subtitle');
        subtitleEl.classList.add('subtitle-fade-out');

        setTimeout(() => {
            subtitleEl.textContent = texts[currentIndex];
            subtitleEl.classList.remove('subtitle-fade-out');

            void subtitleEl.offsetWidth;
            subtitleEl.classList.add('subtitle-animate-in');

            currentIndex = (currentIndex + 1) % texts.length;
        }, 500);
    }, 5000);
};

export const initEbookPage = () => {
    const page = document.querySelector('.page-ebook');
    if (!page) return;

    const displayPrice = page.dataset.ebookPriceValue || '';
    const numericPrice = parsePrice(displayPrice);

    hydratePrices(displayPrice, numericPrice);
    animatePrice(numericPrice);
    initComparativeCard();
    initSubtitleRotation();
};
