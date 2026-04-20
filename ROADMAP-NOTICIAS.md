# Roadmap Noticias PlanesPro

## Fase 1 — Diseño Base
- [x] Convertir imagen nueva de noticias a WebP.
- [x] Crear hero tipo banner bajo.
- [x] Ubicar imagen a la izquierda del hero.
- [x] Ubicar título, subtítulo y contexto a la derecha.
- [x] Agregar filtros visuales: Todo, Isapres, Fonasa/Salud, AFP.
- [x] Crear estructura de noticia destacada + grilla secundaria.
- [x] Ajustar diseño responsive.

## Fase 2 — Feed Dinámico
- [x] Conectar `noticias.html` al Worker de Cloudflare.
- [x] Renderizar noticias desde datos reales.
- [x] Mostrar imagen, fuente, fecha, categoría, título y resumen.
- [x] Agregar botón `Leer noticia completa`.
- [x] Agregar estado de carga.
- [x] Agregar estado de error.
- [x] Agregar fallback si el Worker no responde.

## Fase 3 — Worker Mejorado
- [x] Mover API key de NewsAPI a secreto de Cloudflare.
- [x] Crear Cron Trigger cada 4 horas.
- [x] Consultar noticias generales de salud en Chile.
- [x] Consultar noticias de Isapres.
- [x] Consultar noticias de Fonasa/Salud.
- [x] Consultar noticias de AFP/previsión.
- [x] Eliminar duplicados por URL y título.
- [x] Normalizar campos de cada noticia.
- [x] Clasificar cada noticia por categoría.

## Fase 4 — Histórico 60 Días
- [ ] Crear base Cloudflare D1 en la cuenta de Cloudflare.
- [x] Crear migración SQL para tabla de noticias.
- [ ] Aplicar migración D1 en Cloudflare.
- [x] Preparar Worker para guardar noticias nuevas en D1.
- [x] Evitar guardar noticias duplicadas.
- [x] Mantener histórico de 60 días.
- [x] Crear endpoint para noticias recientes.
- [x] Crear endpoint por categoría.
- [x] Crear endpoint para búsqueda.
- [x] Agregar paginación o botón `Cargar más`.

## Fase 5 — Buscador
- [x] Agregar buscador en la página de noticias.
- [x] Buscar por título.
- [x] Buscar por resumen.
- [x] Buscar por fuente.
- [x] Buscar por categoría.
- [x] Permitir combinar búsqueda + filtro.
- [x] Mostrar contador de resultados.
- [x] Mostrar mensaje cuando no existan resultados.

## Fase 6 — Capa Premium Editorial
- [ ] Crear bloque `Lo que está pasando en salud previsional`.
- [ ] Mostrar resumen ejecutivo de Isapres.
- [ ] Mostrar resumen ejecutivo de Fonasa/Salud.
- [ ] Mostrar resumen ejecutivo de AFP/previsión.
- [ ] Agregar etiquetas automáticas.
- [ ] Agregar campo `Por qué importa`.
- [ ] Destacar noticias de mayor impacto.

## Fase 7 — Artículos PlanesPro
- [ ] Crear sección separada para artículos propios.
- [ ] Definir estructura visual de artículos.
- [ ] Crear primeros artículos manuales o en JSON local.
- [ ] Separar artículos propios de noticias externas.
- [ ] Agregar schema `BlogPosting`.
- [ ] Preparar futura migración a CMS, Markdown o D1.

## Fase 8 — Instagram / Meta API
- [ ] Definir las dos cuentas de Instagram a mostrar.
- [ ] Crear integración Meta API desde Worker.
- [ ] Evitar exponer tokens en frontend.
- [ ] Traer imagen del post.
- [ ] Traer caption resumido.
- [ ] Traer fecha y link del post.
- [ ] Crear sección `Desde Instagram`.
- [ ] Agregar fallback si Meta API no responde.

## Fase 9 — SEO y Performance
- [ ] Agregar schema `CollectionPage`.
- [ ] Evaluar schema `NewsArticle` para noticias externas.
- [ ] Optimizar imágenes externas con fallback local.
- [ ] Cachear respuestas del Worker.
- [ ] Preparar URLs futuras por categoría.
- [ ] Medir carga inicial de la página.
- [ ] Ajustar cantidad inicial de noticias visibles.
