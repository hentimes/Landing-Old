# SEO Roadmap

Fecha: `2026-04-17`

Uso:

- Marca cada tarea con `[x]` cuando esté terminada.
- Mantén este archivo como fuente única del estado SEO.

## Global

- [x] Corregir por completo el problema de encoding/mojibake en HTML, JS y data.
- [x] Unificar una sola estrategia de cache busting para CSS y JS.
- [x] Hacer una validación SEO final completa antes de publicar.

## Fase 0. Bloqueadores Críticos

### Encoding

- [x] Revisar [index.html](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/index.html).
- [x] Revisar [nosotros.html](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/nosotros.html).
- [x] Revisar [asesores.html](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/asesores.html).
- [x] Revisar [noticias.html](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/noticias.html).
- [x] Revisar [ebook.html](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/ebook.html).
- [x] Revisar [data/testimonials.js](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/data/testimonials.js).
- [x] Revisar [data/planes.js](/c:/Users/henti/OneDrive/Documentos/ISAPRE/PlanesPro/Landing%20Old/data/planes.js).
- [x] Revisar otros JS con strings visibles.
- [x] Confirmar cero mojibake visible en navegador.

### Cache Busting

- [x] Definir formato único de versionado de assets.
- [x] Aplicarlo en `index.html`.
- [x] Aplicarlo en `nosotros.html`.
- [x] Aplicarlo en `asesores.html`.
- [x] Aplicarlo en `noticias.html`.
- [x] Aplicarlo en `ebook.html`.
- [x] Confirmar que CSS/JS viejos no queden en caché (aplicado versionado unificado).

## Fase 1. Metadatos y Snippets

### Titles y Meta Descriptions

- [x] Ajustar `title` de `index.html` a rango ideal.
- [x] Ajustar `description` de `index.html` a rango ideal.
- [x] Ajustar `title` de `nosotros.html`.
- [x] Ajustar `description` de `nosotros.html`.
- [x] Ajustar `title` de `asesores.html`.
- [x] Ajustar `description` de `asesores.html`.
- [x] Ajustar `title` de `noticias.html`.
- [x] Ajustar `description` de `noticias.html`.
- [x] Ajustar `title` de `ebook.html`.
- [x] Ajustar `description` de `ebook.html`.

### Open Graph / Twitter

- [x] Revisar `og:title` en todas las páginas.
- [x] Revisar `og:description` en todas las páginas.
- [x] Revisar `og:image` en todas las páginas.
- [x] Agregar `og:image:alt` donde falte.
- [x] Revisar `twitter:title` en todas las páginas.
- [x] Revisar `twitter:description` en todas las páginas.
- [x] Revisar `twitter:image` en todas las páginas.
- [x] Agregar `twitter:image:alt` donde falte.
- [ ] Definir si cada página necesita imagen social propia.

## Fase 2. Estructura Semántica

### Headings

- [x] Verificar 1 solo `h1` por página.
- [x] Revisar jerarquía `h2/h3` en `index.html`.
- [x] Revisar jerarquía `h2/h3` en `nosotros.html`.
- [x] Revisar jerarquía `h2/h3` en `asesores.html`.
- [x] Agregar jerarquía secundaria útil en `noticias.html`.
- [x] Revisar exceso de `h2` en `ebook.html`.

### Imágenes y Alt

- [x] Revisar `alt` de imágenes críticas en `index.html`.
- [x] Revisar `alt` de imágenes críticas en `nosotros.html`.
- [x] Revisar `alt` de imágenes críticas en `asesores.html`.
- [x] Revisar `alt` de imágenes críticas en `noticias.html`.
- [x] Revisar `alt` de imágenes críticas en `ebook.html`.
- [x] Confirmar que solo imágenes decorativas tengan `alt=""`.

### Enlazado Interno

- [ ] Mejorar enlaces internos desde `index.html`.
- [ ] Mejorar enlaces internos hacia `ebook.html`.
- [ ] Mejorar enlaces internos hacia `asesores.html`.
- [ ] Mejorar enlaces internos hacia `nosotros.html`.
- [ ] Mejorar enlaces internos hacia `noticias.html`.
- [ ] Mejorar textos ancla descriptivos.

## Fase 3. Structured Data

### Schema Existente

- [x] Validar JSON-LD de `index.html`.
- [x] Validar JSON-LD de `nosotros.html`.
- [x] Validar JSON-LD de `asesores.html`.
- [x] Validar JSON-LD de `noticias.html`.
- [x] Validar JSON-LD de `ebook.html`.

### Schema Nuevo

- [x] Evaluar `BreadcrumbList`.
- [x] Evaluar `FAQPage`.
- [x] Evaluar `Person` para asesores.
- [ ] Evaluar `Article` o `NewsArticle` en noticias.
- [ ] Evaluar `Review` / `AggregateRating` si aplica de forma genuina.
- [x] Revisar consistencia de `Organization`, `WebSite` y `Service`.

## Fase 4. Contenido

### Home / Landing

- [x] Agregar bloques con intención SEO alta.
- [x] Agregar preguntas frecuentes reales (v5 Categorizado).
- [x] Reforzar lenguaje semántico sobre Isapres, Fonasa y optimización.

### Nosotros

- [ ] Fortalecer señales de confianza y E-E-A-T.
- [ ] Reforzar copy institucional con términos clave bien definidos.

### Asesores

- [ ] Mejorar autoridad semántica de perfiles.
- [ ] Evaluar perfil individual o mayor detalle por asesor.

### Noticias

- [ ] Convertir `noticias.html` en hub editorial más robusto.
- [x] Agregar más texto contextual.
- [ ] Evaluar artículos individuales.
- [ ] Agregar fechas y señales editoriales claras.

### Ebook

- [ ] Revisar estructura semántica del contenido largo.
- [ ] Ajustar headings y copy para búsquedas informativas.
- [ ] Reforzar intención comercial sin debilitar SEO semántico.

## Fase 5. Performance SEO

### Imágenes

- [x] Optimizar `assets/ilustraciones/asistente-faq.webp` (Generada y optimizada).
- [ ] Optimizar `assets/ilustraciones/asesores.png`.
- [ ] Optimizar `assets/ilustraciones/process_banner.png`.
- [ ] Optimizar `assets/ilustraciones/news.webp`.
- [ ] Optimizar `assets/ilustraciones/news1.webp`.
- [ ] Optimizar `assets/ilustraciones/ebook-retiro-afp-bonus.webp`.
- [ ] Revisar si versiones `.png` grandes pueden eliminarse.

### Loading / Preload

- [x] Revisar `preload` de hero en `index.html`.
- [x] Revisar `preload` de hero en `ebook.html`.
- [x] Confirmar `lazy loading` correcto en imágenes secundarias.
- [x] Revisar impacto real de Google Fonts y Font Awesome (estandarizado en head).

### CSS / JS

- [x] Revisar CSS no crítico y peso general.
- [x] Revisar módulos JS innecesarios por página.
- [x] Confirmar que `type="module"` no rompa navegadores objetivo (probado estable).

## Fase 6. Social / Distribución

### Meta / Facebook

- [ ] Validar previews con Meta Sharing Debugger.
- [ ] Confirmar imágenes, títulos y descripciones correctas.

### LinkedIn

- [ ] Validar previews con LinkedIn Post Inspector.
- [ ] Confirmar que OG se vea limpio y sin mojibake.

### X / Twitter

- [ ] Validar `twitter:card` y preview visual.

## Fase 7. IA / LLMs

### Semántica

- [ ] Mejorar claridad factual del copy para extracción por IA.
- [ ] Agregar respuestas explícitas a preguntas frecuentes clave.
- [ ] Reforzar entidad marca, servicio y contexto país.

### Señales Especiales

- [ ] Evaluar creación de `llms.txt`.
- [ ] Definir páginas prioritarias para agentes y buscadores generativos.

## Fase 8. QA Final

### QA Técnico

- [x] Revisar `robots.txt`.
- [x] Revisar `sitemap.xml`.
- [x] Revisar `canonical` por página.
- [x] Revisar enlaces externos con `noopener noreferrer`.

### QA Externo

- [ ] Validar Rich Results Test.
- [ ] Validar Google Search Console.
- [ ] Validar Lighthouse / PageSpeed.
- [ ] Validar snippets sociales finales.

## Fase 9. Estrategia de Conversión y UX (CRO)

### Persuasión y Valor
- [x] Reforzar Propuesta de Valor en el Hero ("Optimiza tu 7%").
- [ ] Evaluar iteración de sección "Perfiles" para priorizar beneficios sobre características.
- [ ] Incorporar Video o Demostración visual si aporta claridad al proceso.

### Fricción y Confianza
- [x] Optimizar formularios para reducir fricción (multi-paso).
- [x] Asegurar visibilidad de Prueba Social (Testimonios y Logos) en el scroll inicial.

## Fase 10. Arquitectura y Autoridad Semántica

### Enlazado Interno
- [ ] Realizar auditoría de Texto Ancla (Anchor Text) descriptivo en todos los enlaces internos.
- [ ] Crear enlaces semánticos desde el contenido editorial (Noticias) hacia páginas de servicio (Asesores).

### Contenido y Autoridad
- [ ] Fortalecer señales E-E-A-T en la página "Nosotros" con bios de expertos o hitos.
- [x] Implementar Schema `FAQPage` con preguntas reales extraídas de las consultas más frecuentes.
- [ ] Implementar Schema `Article` o `NewsArticle` en la sección de Noticias.

## Fase 11. Optimización y Medición Continua

### Seguimiento
- [x] Configurar estructura de seguimiento de eventos en `analytics.js` (clics WhatsApp, CTAs).
- [ ] Definir objetivos (conversiones) en GA4 una vez configurados los IDs finales.

### Experimentación
- [ ] Definir hipótesis para Test A/B (ej: variaciones del copy en el Hero CTA).
- [ ] Evaluar herramientas de mapas de calor (Microsoft Clarity o similar).

## Orden Recomendado

- [x] 1. Confirmación final de encoding en navegador
- [x] 2. Confirmación final de caché
- [x] 3. Titles / descriptions
- [x] 4. OG / Twitter
- [x] 5. Headings
- [ ] 6. Schema
- [ ] 7. Noticias / contenido delgado
- [ ] 8. Optimización de imágenes
- [ ] 9. IA / semántica avanzada
- [ ] 10. QA final
