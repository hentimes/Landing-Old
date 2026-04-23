const FALLBACK_IMAGE = 'assets/ilustraciones/noticias-salud.webp';
const DEFAULT_CATEGORY = 'todo';
const DESKTOP_PAGE_SIZE = 7;
const MOBILE_PAGE_SIZE = 13;
const MOBILE_BREAKPOINT = 640;

const getPageSize = () => (
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
        ? MOBILE_PAGE_SIZE
        : DESKTOP_PAGE_SIZE
);

const fallbackArticles = [
    {
        title: 'Cómo leer una noticia de salud sin perder de vista tu cobertura',
        link: 'https://wa.me/56958785580',
        imageUrl: FALLBACK_IMAGE,
        summary: 'Antes de tomar decisiones por una noticia aislada, conviene revisar cómo puede afectar tu plan, tus beneficios y tu situación familiar.',
        portalName: 'PlanesPro.cl',
        category: 'salud',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Isapre, Fonasa y cobertura: conceptos que conviene revisar',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/news1.webp',
        summary: 'Una buena decisión requiere entender precios, beneficios, cobertura hospitalaria y condiciones reales antes de comparar alternativas.',
        portalName: 'Guía PlanesPro',
        category: 'isapres',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'AFP y previsión: por qué conviene separar ahorro, salud y cobertura',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/ebook-retiro-afp.webp',
        summary: 'Las noticias previsionales pueden afectar decisiones de largo plazo. Conviene mirar el contexto antes de actuar por urgencia.',
        portalName: 'Análisis PlanesPro',
        category: 'afp',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Qué revisar si una noticia anuncia cambios en beneficios de salud',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/news.webp',
        summary: 'Los cambios regulatorios o comerciales no siempre impactan igual a cada persona. La clave es revisar cobertura, red y costo real.',
        portalName: 'PlanesPro.cl',
        category: 'salud',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Cómo comparar noticias de Isapres sin tomar decisiones apresuradas',
        link: 'https://wa.me/56958785580',
        imageUrl: FALLBACK_IMAGE,
        summary: 'Una noticia puede ser relevante, pero tu decisión debe considerar edad, cargas, preexistencias, presupuesto y uso esperado.',
        portalName: 'Guía PlanesPro',
        category: 'isapres',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Fonasa y sistema privado: cuándo conviene volver a comparar',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/proceso-person.webp',
        summary: 'Cambios familiares, ingresos o uso de prestaciones pueden modificar la conveniencia entre Fonasa, Isapre o mantener tu cobertura.',
        portalName: 'Análisis PlanesPro',
        category: 'salud',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Previsión y salud: dos decisiones distintas que conviene ordenar',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/ebook-retiro-afp-bonus.webp',
        summary: 'Las noticias sobre AFP no reemplazan una revisión previsional completa, pero ayudan a detectar temas que conviene entender a tiempo.',
        portalName: 'PlanesPro.cl',
        category: 'afp',
        publishedAt: new Date().toISOString()
    }
    ,{
        title: 'Cuándo una noticia de Isapre debería llevarte a revisar tu plan',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/asesores.webp',
        summary: 'Si una actualización afecta precio, red o beneficios, conviene contrastarla con tu contrato y tu uso real de salud.',
        portalName: 'Guía PlanesPro',
        category: 'isapres',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Cambios en Fonasa: qué mirar antes de comparar alternativas',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/proceso-person.webp',
        summary: 'No todos los cambios del sistema público impactan de la misma forma. Edad, cargas y frecuencia de uso siguen siendo claves.',
        portalName: 'Análisis PlanesPro',
        category: 'salud',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'Cotización de salud: señales que conviene monitorear',
        link: 'https://wa.me/56958785580',
        imageUrl: FALLBACK_IMAGE,
        summary: 'Las noticias sobre precios o adecuaciones deben revisarse junto con cobertura, topes, red preferente y beneficios usados.',
        portalName: 'PlanesPro.cl',
        category: 'isapres',
        publishedAt: new Date().toISOString()
    },
    {
        title: 'AFP, salud y presupuesto familiar: cómo ordenar prioridades',
        link: 'https://wa.me/56958785580',
        imageUrl: 'assets/ilustraciones/ebook-retiro-afp.webp',
        summary: 'Las decisiones previsionales y de salud comparten presupuesto, pero responden a riesgos distintos y requieren análisis separado.',
        portalName: 'Guía PlanesPro',
        category: 'afp',
        publishedAt: new Date().toISOString()
    }

];

const categoryLabels = {
    todo: 'Todo',
    isapres: 'Isapres',
    fonasa: 'Fonasa/Salud',
    salud: 'Fonasa/Salud',
    afp: 'AFP',
    economico: 'Económico'
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizeSearchText = (value = '') => String(value).trim().replace(/\s+/g, ' ');

const normalizeCategoryValue = (value = '') => {
    const category = String(value).toLowerCase();
    if (category.includes('previsi') || category.includes('afp') || category.includes('pension') || category.includes('jubila')) return 'afp';
    if (category.includes('econ')) return 'economico';
    if (category.includes('salud previsional')) return 'isapres';
    if (category.includes('isapre')) return 'isapres';
    if (category.includes('fonasa') || category.includes('salud') || category.includes('general')) return 'salud';
    return '';
};

const inferCategory = (article) => {
    const storedCategory = normalizeCategoryValue(article.category || article.categoria || '');
    if (storedCategory) return storedCategory;

    const text = `${article.title || article.titulo || ''} ${article.summary || article.resumen || ''} ${article.description || ''}`.toLowerCase();
    if (/\bafp\b|previsi[oó]n|fondos previsionales|retiro/.test(text)) return 'afp';
    if (/isapre|isapres|ges|excedente|exceso/.test(text)) return 'isapres';
    if (/fonasa|minsal|salud|hospital|licencia|cobertura/.test(text)) return 'salud';
    return 'salud';
};

const normalizeArticle = (article) => {
    const category = normalizeCategoryValue(article.category || article.categoria || '') || inferCategory(article);

    return {
        title: article.title || article.titulo || 'Actualización de salud en Chile',
        link: article.link || article.url || 'https://wa.me/56958785580',
        imageUrl: article.imageUrl || article.imagen_url || FALLBACK_IMAGE,
        summary: article.summary || article.resumen || article.description || 'Revisa esta actualización y evalúa su contexto antes de tomar decisiones sobre tu plan de salud.',
        portalName: article.portalName || article.fuente || article.source?.name || 'Fuente de salud',
        category,
        publishedAt: article.publishedAt || article.fecha_publicacion || article.date || ''
    };
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date).replace('.', '');
};

const createImageFallback = (event) => {
    event.currentTarget.src = FALLBACK_IMAGE;
};

const renderMeta = (article) => {
    const date = formatDate(article.publishedAt);
    const categoryLabel = categoryLabels[article.category] || 'Salud';

    return `
        <div class="noticia-card__meta">
            <span class="noticia-card__source">${escapeHtml(article.portalName)}</span>
            <span class="noticia-card__category">${escapeHtml(categoryLabel)}</span>
            ${date ? `<span class="noticia-card__date">${escapeHtml(date)}</span>` : ''}
        </div>
    `;
};

const getPortalShortName = (article) => {
    const candidates = [article.link, article.portalName].filter(Boolean);

    for (const candidate of candidates) {
        try {
            const url = new URL(candidate, window.location.href);
            const hostname = (url.hostname || '').replace(/^www\./, '');
            if (!hostname) continue;
            return hostname.split('.')[0];
        } catch {
            const value = String(candidate).trim().toLowerCase();
            if (!value) continue;
            if (value.includes('.')) return value.split('.')[0].replace(/^www\./, '');
            return value.split(/\s+/)[0];
        }
    }

    return 'portal';
};

const getCompactCategory = (article) => (
    article.category === 'afp' ? 'AFP' : 'Salud'
);

const renderCarouselTags = (article) => {
    const date = formatDate(article.publishedAt);
    return `
        <div class="noticia-carousel-tags" aria-label="Fecha, fuente y categoría">
            ${date ? `<span class="noticia-carousel-tag noticia-carousel-tag--date">${escapeHtml(date)}</span>` : ''}
            <span class="noticia-carousel-tag">${escapeHtml(getPortalShortName(article))}</span>
            <span class="noticia-carousel-tag">${escapeHtml(getCompactCategory(article))}</span>
        </div>
    `;
};

const renderFeaturedArticle = (article) => `
    <article class="noticia-featured-card">
        <div class="noticia-featured-card__media">
            <img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async">
        </div>
        <div class="noticia-featured-card__body">
            ${renderMeta(article)}
            <h3 class="noticia-featured-card__title">${escapeHtml(article.title)}</h3>
            <p class="noticia-featured-card__summary">${escapeHtml(article.summary)}</p>
            <a class="noticia-card__link" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
                Leer noticia completa <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
    </article>
`;

const renderArticle = (article) => `
    <article class="noticia-card">
        <div class="noticia-card__media">
            <img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async">
        </div>
        <div class="noticia-card__body">
            ${renderMeta(article)}
            <h3 class="noticia-card__title">${escapeHtml(article.title)}</h3>
            <p class="noticia-card__summary">${escapeHtml(article.summary)}</p>
            <a class="noticia-card__link" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
                Leer noticia <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
    </article>
`;

const renderMidGridArticle = (article) => `
    <a class="noticia-mid-card" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
        <span class="noticia-mid-card__media" aria-hidden="true">
            <img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async">
        </span>
        <span class="noticia-mid-card__body">
            <span class="noticia-mid-card__title">${escapeHtml(article.title)}</span>
            <span class="noticia-mid-card__summary">${escapeHtml(article.summary || '')}</span>
        </span>
    </a>
`;

const renderCarouselArticle = (article) => `
    <article class="noticia-card noticia-card--carousel">
        <div class="noticia-card__media">
            <img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async">
        </div>
        <div class="noticia-card__body">
            ${renderMeta(article)}
            <h3 class="noticia-card__title">${escapeHtml(article.title)}</h3>
            <a class="noticia-card__link" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
                Leer <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        </div>
    </article>
`;

const renderCarouselItem = (article) => `
    <a class="noticia-carousel-item" href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">
        <span class="noticia-carousel-item__media" aria-hidden="true">
            <img src="${escapeHtml(article.imageUrl)}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async">
            ${renderCarouselTags(article)}
        </span>
        <div class="noticia-carousel-item__body">
            <div class="noticia-carousel-item__title">${escapeHtml(article.title)}</div>
        </div>
    </a>
`;

const chunk = (items, size) => {
    const result = [];
    for (let index = 0; index < items.length; index += size) {
        result.push(items.slice(index, index + size));
    }
    return result;
};

const renderCarouselSlides = (articles = []) => (
    chunk(articles, 2)
        .map((pair) => `
            <div class="noticias-carousel__slide">
                ${pair.map(renderCarouselItem).join('')}
            </div>
        `)
        .join('')
);

const buildEndpoint = ({ endpoint, category, query, offset, pageSize }) => {
    const url = new URL(endpoint, window.location.href);
    const categoryQueries = {
        isapres: 'isapre',
        fonasa: 'fonasa',
        afp: 'afp'
    };
    const effectiveQuery = query || categoryQueries[category] || '';

    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('dias', '60');
    if (category && category !== DEFAULT_CATEGORY) url.searchParams.set('categoria', category);
    if (effectiveQuery) url.searchParams.set('q', effectiveQuery);
    return url.toString();
};

export const initNoticiasFeed = () => {
    const feed = document.querySelector('[data-news-feed]');
    const featured = document.querySelector('[data-news-featured]');
    const headlines = document.querySelector('[data-news-headlines]');
    const carousel = document.querySelector('[data-news-carousel]');
    const section = document.querySelector('[data-news-endpoint]');
    if (!feed || !featured || !section) return;

    const status = document.querySelector('[data-news-status]');
    const filterButtons = document.querySelectorAll('[data-news-filter]');
    const filterSelect = document.querySelector('[data-news-filter-select]');
    const searchForm = document.querySelector('[data-news-search]');
    const searchInput = document.querySelector('[data-news-search-input]');
    const clearSearchButton = document.querySelector('[data-news-search-clear]');
    const loadMoreButton = document.querySelector('[data-news-load-more]');
    const endpoint = section.getAttribute('data-news-endpoint');
    let currentCategory = DEFAULT_CATEGORY;
    let currentQuery = '';
    let currentOffset = 0;
    let renderedCount = 0;
    let hasMore = false;
    let renderedArticleKeys = new Set();

    const setStatus = (message) => {
        if (status) status.textContent = message;
    };

    const setLoading = (isLoading) => {
        if (loadMoreButton) loadMoreButton.disabled = isLoading;
    };

    const updateLoadMore = () => {
        if (!loadMoreButton) return;
        loadMoreButton.hidden = !hasMore;
    };

    const bindImageFallbacks = () => {
        document.querySelectorAll('.noticia-card img, .noticia-featured-card img, .noticia-mid-card img, .noticia-carousel-item img').forEach((image) => {
            image.addEventListener('error', createImageFallback, { once: true });
        });
    };

    const makeArticleKey = (article) => `${article.title.toLowerCase()}|${article.link}`;

    const matchesCurrentCategory = (article) => (
        currentCategory === DEFAULT_CATEGORY
        || article.category === currentCategory
        || (currentCategory === 'fonasa' && article.category === 'salud')
    );

    const rememberRendered = (articles) => {
        articles.forEach((article) => renderedArticleKeys.add(makeArticleKey(article)));
    };

    const getLocalFallback = () => fallbackArticles
        .map(normalizeArticle)
        .filter(matchesCurrentCategory)
        .filter((article) => {
            if (!currentQuery) return true;
            const haystack = `${article.title} ${article.summary} ${article.portalName} ${article.category}`.toLowerCase();
            return haystack.includes(currentQuery.toLowerCase());
        });

    const getSupplementArticles = (existingArticles = [], limit) => {
        if (currentQuery || limit <= 0) return [];

        const seen = new Set([
            ...renderedArticleKeys,
            ...existingArticles.map(makeArticleKey)
        ]);

        return getLocalFallback()
            .filter((article) => !seen.has(makeArticleKey(article)))
            .slice(0, limit);
    };

    const completeInitialPage = (articles, pageSize) => {
        const normalizedArticles = articles.map(normalizeArticle);
        if (currentQuery || normalizedArticles.length >= pageSize) return normalizedArticles;

        const completedArticles = [...normalizedArticles];

        completedArticles.push(...getSupplementArticles(
            completedArticles,
            pageSize - completedArticles.length
        ));

        return completedArticles;
    };

    const renderMobileBlocks = (secondaryArticles = []) => {
        if (!headlines && !carousel) return;

        const headlineArticles = secondaryArticles.slice(0, 6);
        const carouselArticles = secondaryArticles.slice(6, 12);

        if (headlines) headlines.innerHTML = headlineArticles.map(renderMidGridArticle).join('');

        if (carousel) {
            carousel.innerHTML = carouselArticles.length
                ? `<div class="noticias-carousel__track">${renderCarouselSlides(carouselArticles)}</div>`
                : '';
        }
    };

    const renderPage = (articles, { append = false, message = '', pageSize } = {}) => {
        const effectivePageSize = pageSize ?? getPageSize();
        const normalizedArticles = articles.map(normalizeArticle);
        const visibleArticles = normalizedArticles.slice(0, effectivePageSize);
        const totalAvailable = normalizedArticles.length;
        hasMore = totalAvailable > effectivePageSize;

        if (!append) {
            const [featuredArticle, ...secondaryArticles] = visibleArticles;
            featured.innerHTML = featuredArticle ? renderFeaturedArticle(featuredArticle) : '';
            feed.innerHTML = secondaryArticles.map(renderArticle).join('');
            renderMobileBlocks(secondaryArticles);
            renderedCount = visibleArticles.length;
        } else {
            feed.insertAdjacentHTML('beforeend', visibleArticles.map(renderArticle).join(''));
            renderedCount += visibleArticles.length;
        }

        currentOffset = renderedCount;
        setStatus(message || `${renderedCount} noticias visibles${currentQuery ? ` para ?${currentQuery}?` : ''}.`);
        updateLoadMore();
        bindImageFallbacks();
    };

    const renderEmptyState = (message) => {
        featured.innerHTML = '';
        feed.innerHTML = '';
        if (headlines) headlines.innerHTML = '';
        if (carousel) carousel.innerHTML = '';
        renderedCount = 0;
        currentOffset = 0;
        hasMore = false;
        setStatus(message);
        updateLoadMore();
    };

    const renderLocalFallback = (message) => {
        const pageSize = getPageSize();
        const fallback = getLocalFallback();
        if (!fallback.length) {
            renderEmptyState('No hay resultados para esta busqueda en la seleccion local.');
            return;
        }

        renderPage(fallback, { message, pageSize });
    };

    const loadNews = ({ append = false } = {}) => {
        const pageSize = getPageSize();
        if (!endpoint) {
            renderPage(getLocalFallback(), { append, message: 'Selección base de contenidos PlanesPro.', pageSize });
            return;
        }

        const offset = append ? currentOffset : 0;
        setLoading(true);
        if (!append) {
            setStatus('Buscando noticias recientes...');
            featured.innerHTML = '';
            feed.innerHTML = '';
            if (headlines) headlines.innerHTML = '';
            if (carousel) carousel.innerHTML = '';
            currentOffset = 0;
            renderedCount = 0;
            renderedArticleKeys = new Set();
        }

        fetch(buildEndpoint({ endpoint, category: currentCategory, query: currentQuery, offset, pageSize }), { cache: 'no-store' })
            .then((response) => {
                if (!response.ok) throw new Error(`Noticias no disponibles: ${response.status}`);
                return response.json();
            })
            .then((payload) => {
                const articles = Array.isArray(payload) ? payload : payload.articles;
                const total = Array.isArray(payload) ? 0 : Number(payload.total || 0);
                const validArticles = Array.isArray(articles)
                    ? articles.filter((article) => article && (article.title || article.titulo) && (article.link || article.url))
                    : [];

                if (!validArticles.length && !append) {
                    renderLocalFallback(currentQuery
                        ? 'No hay resultados remotos para esta busqueda. Mostrando seleccion local relacionada.'
                        : 'El Worker no devolvio noticias. Mostrando seleccion local PlanesPro.');
                    return;
                }

                const normalizedValidArticles = validArticles
                    .map(normalizeArticle)
                    .filter(matchesCurrentCategory)
                    .filter((article) => !append || !renderedArticleKeys.has(makeArticleKey(article)));

                let articlesToRender = append ? normalizedValidArticles : completeInitialPage(normalizedValidArticles, pageSize);

                if (append && articlesToRender.length < pageSize) {
                    articlesToRender = [
                        ...articlesToRender,
                        ...getSupplementArticles(articlesToRender, pageSize - articlesToRender.length)
                    ];
                }

                const remoteHasMore = total ? offset + validArticles.length < total : validArticles.length === pageSize;
                const localHasMore = getSupplementArticles(articlesToRender, 1).length > 0;
                hasMore = remoteHasMore || localHasMore;

                if (!append) {
                    const [featuredArticle, ...secondaryArticles] = articlesToRender;
                    featured.innerHTML = featuredArticle ? renderFeaturedArticle(featuredArticle) : '';
                    feed.innerHTML = secondaryArticles.map(renderArticle).join('');
                    renderMobileBlocks(secondaryArticles);
                    renderedCount = articlesToRender.length;
                } else {
                    feed.insertAdjacentHTML('beforeend', articlesToRender.map(renderArticle).join(''));
                    renderedCount += articlesToRender.length;
                }

                rememberRendered(articlesToRender);
                currentOffset = renderedCount;
                const searchLabel = currentQuery ? ` para ?${currentQuery}?` : '';
                const totalLabel = total && total >= renderedCount ? ` de ${total}` : '';
                setStatus(`${renderedCount}${totalLabel} noticias visibles${searchLabel}.`);
                updateLoadMore();
                bindImageFallbacks();
            })
            .catch(() => {
                renderLocalFallback('No se pudo conectar con el Worker. Mostrando seleccion local PlanesPro.');
            })
            .finally(() => setLoading(false));
    };

    const setActiveCategory = (category) => {
        currentCategory = category || DEFAULT_CATEGORY;

        filterButtons.forEach((filterButton) => {
            const isActive = (filterButton.getAttribute('data-news-filter') || DEFAULT_CATEGORY) === currentCategory;
            filterButton.classList.toggle('is-active', isActive);
            filterButton.setAttribute('aria-selected', String(isActive));
        });

        if (filterSelect) filterSelect.value = currentCategory;
    };

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setActiveCategory(button.getAttribute('data-news-filter') || DEFAULT_CATEGORY);
            loadNews();
        });
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            setActiveCategory(filterSelect.value || DEFAULT_CATEGORY);
            loadNews();
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            currentQuery = normalizeSearchText(searchInput?.value || '');
            loadNews();
        });
    }

    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            currentQuery = '';
            loadNews();
        });
    }

    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', () => loadNews({ append: true }));
    }

    setActiveCategory(currentCategory);
    loadNews();
};
