const NEWSAPI_ENDPOINT = 'https://newsapi.org/v2/everything';
const HISTORY_DAYS = 60;
const DEFAULT_LIMIT = 7;
const MAX_LIMIT = 24;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800';

const DOMAINS = [
    'ispch.gob.cl', 'colegiomedico.cl', 'clinicasdechile.cl',
    'fonasa.gob.cl', 'federacionmedicadechile.cl', 'elmostrador.cl',
    'portalprensasalud.cl', 'meganoticias.cl', 'chilevision.cl',
    'tvn.cl', 'ips.gob.cl', '24horas.cl', 'previsionsocial.gob.cl',
    'aafp.cl', 'mintrab.gob.cl', 'cooperativa.cl', 'biobiochile.cl',
    'adnradio.cl', 'cnnchile.com', 'minsal.cl'
];

const NEWS_QUERY = "(isapre OR fonasa OR salud OR 'reforma previsional' OR afp OR multifondos OR 'seguro social' OR pensiones OR jubilacion OR 'dolar chile')";
const RELEVANT_KEYWORDS = ['isapre', 'fonasa', 'afp', 'pension', 'salud', 'dolar', 'ips', 'previs', 'reforma', 'jubila', 'multifondo', 'seguro'];
const BLOCKED_DOMAINS = ['latercera.com'];

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
};

const jsonResponse = (data, init = {}) => new Response(JSON.stringify(data), {
    ...init,
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=1800',
        ...corsHeaders,
        ...(init.headers || {})
    }
});

const cleanText = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const clampNumber = (value, fallback, max) => {
    const number = Number.parseInt(value || fallback, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.min(Math.max(number, 0), max);
};

const inferCategory = (article) => {
    const title = cleanText(article.title).toLowerCase();
    const description = cleanText(article.description).toLowerCase();
    const text = `${title} ${description}`;

    if (/afp|pensi[oó]n|jubila|multifondo|reforma|ips/.test(text)) return 'Previsión';
    if (/isapre|fonasa|minsal|salud|ges|hospital|licencia/.test(text)) return 'Salud Previsional';
    if (/d[oó]lar|uf|ipc|econom/.test(text)) return 'Económico';
    return 'General';
};

const isRelevantArticle = (article) => {
    const source = article.source?.name || '';
    const url = article.url || '';
    if (BLOCKED_DOMAINS.some((domain) => url.includes(domain)) || /tercera/i.test(source)) return false;

    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    return RELEVANT_KEYWORDS.some((keyword) => text.includes(keyword));
};

const fetchNewsApiArticles = async (env) => {
    const apiKey = env.NEWSAPI_KEY;
    if (!apiKey) throw new Error('Falta configurar NEWSAPI_KEY como secreto del Worker.');

    const url = new URL(NEWSAPI_ENDPOINT);
    url.searchParams.set('domains', DOMAINS.join(','));
    url.searchParams.set('q', NEWS_QUERY);
    url.searchParams.set('language', 'es');
    url.searchParams.set('sortBy', 'publishedAt');
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('apiKey', apiKey);

    const response = await fetch(url.toString(), { headers: { 'User-Agent': 'PlanesPro-Collector' } });
    if (!response.ok) throw new Error(`NewsAPI respondió ${response.status}`);

    const data = await response.json();
    return Array.isArray(data.articles) ? data.articles.filter(isRelevantArticle) : [];
};

const saveArticles = async (env, articles) => {
    if (!env.DB || !articles.length) return;

    const statements = articles.map((article) => env.DB.prepare(`
        INSERT OR IGNORE INTO noticias (titulo, resumen, url, imagen_url, fuente, categoria, fecha_publicacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
        cleanText(article.title),
        cleanText(article.description || article.content || ''),
        article.url,
        article.urlToImage || FALLBACK_IMAGE,
        article.source?.name || 'Fuente de salud',
        inferCategory(article),
        article.publishedAt || new Date().toISOString()
    ));

    await env.DB.batch(statements);
};

const pruneOldArticles = async (env) => {
    if (!env.DB) return;
    await env.DB.prepare("DELETE FROM noticias WHERE fecha_publicacion < datetime('now', ?)")
        .bind(`-${HISTORY_DAYS} days`)
        .run();
};

const buildWhereClause = ({ category, search, days }) => {
    const where = ["fecha_publicacion >= datetime('now', ?)"];
    const params = [`-${days} days`];

    if (search) {
        const like = `%${search}%`;
        where.push('(titulo LIKE ? OR resumen LIKE ? OR fuente LIKE ? OR categoria LIKE ?)');
        params.push(like, like, like, like);
    }

    if (category === 'afp') {
        where.push("categoria = 'Previsión'");
    } else if (category === 'isapres') {
        where.push("categoria = 'Salud Previsional'");
        where.push('(titulo LIKE ? OR resumen LIKE ?)');
        params.push('%isapre%', '%isapre%');
    } else if (category === 'fonasa') {
        where.push("categoria = 'Salud Previsional'");
        where.push('(titulo LIKE ? OR resumen LIKE ? OR titulo LIKE ? OR resumen LIKE ?)');
        params.push('%fonasa%', '%fonasa%', '%salud%', '%salud%');
    }

    return { whereSql: where.join(' AND '), params };
};

const readArticles = async (request, env) => {
    const { searchParams } = new URL(request.url);
    const limit = clampNumber(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT);
    const offset = clampNumber(searchParams.get('offset'), 0, 1000);
    const days = clampNumber(searchParams.get('dias'), HISTORY_DAYS, HISTORY_DAYS);
    const search = cleanText(searchParams.get('q') || '');
    const category = cleanText(searchParams.get('categoria') || 'todo').toLowerCase();

    const { whereSql, params } = buildWhereClause({ category, search, days });

    const count = await env.DB.prepare(`SELECT COUNT(*) AS total FROM noticias WHERE ${whereSql}`)
        .bind(...params)
        .first();

    const { results } = await env.DB.prepare(`
        SELECT titulo, resumen, url, imagen_url, fuente, categoria, fecha_publicacion
        FROM noticias
        WHERE ${whereSql}
        ORDER BY fecha_publicacion DESC
        LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();

    return {
        articles: results || [],
        total: count?.total || 0,
        days
    };
};

export default {
    async scheduled(_event, env, ctx) {
        ctx.waitUntil((async () => {
            const articles = await fetchNewsApiArticles(env);
            await saveArticles(env, articles);
            await pruneOldArticles(env);
        })());
    },

    async fetch(request, env) {
        if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

        try {
            const payload = await readArticles(request, env);
            return jsonResponse(payload);
        } catch (error) {
            return jsonResponse({ articles: [], total: 0, error: error.message }, { status: 500 });
        }
    }
};
