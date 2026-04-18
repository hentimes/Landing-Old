# Roadmap de Fixes (Landing Old)

Fecha: 2026-04-17
Objetivo: estabilizar UX/SEO/performance sin romper el sitio.
Regla: cada bloque se trabaja de mayor a menor urgencia.

## Global (antes de tocar nada)
- [ ] No tocar contenido/comercial salvo que sea parte del fix
- [ ] Probar en desktop + mobile (minimo 2 tamanos)
- [ ] Revisar consola (errores JS) en cada pase
- [ ] Hacer 1 commit por bloque (SEO / Frontend / Diseno / Marketing / Repo)

## SEO (urgente)
### SEO-1 Encoding / texto roto
- [x] Corregir mojibake `Â©` en footers
  - [x] `nosotros.html:242`
  - [x] `asesores.html:297`
  - [x] `noticias.html:151`
- [x] Barrido de mojibake residual (`Â`, `Ã`, etc.) en todas las `.html`

### SEO-2 Meta por pagina (title/description)
- [x] Revisar `title` y `meta name="description"` (sin tildes rotas) en:
  - [x] `index.html`
  - [x] `nosotros.html`
  - [x] `asesores.html`
  - [x] `noticias.html`
  - [x] `ebook.html`

### SEO-3 JSON-LD coherente (entidades)
- [x] Definir `@id` estable para Organization en `index.html` (ej: `https://planespro.cl/#organization`)
- [x] Alinear `publisher` / referencias a ese `@id` en:
  - [x] `nosotros.html`
  - [x] `asesores.html`
  - [x] `noticias.html`
  - [x] `ebook.html`

### SEO-4 Social share (OG/Twitter)
- [x] Definir 1 imagen OG estandar (ej: `assets/ilustraciones/heroimg.webp`) o 1 por pagina
- [x] Agregar `og:image` + `twitter:card` + `twitter:image` en:
  - [x] `nosotros.html`
  - [x] `asesores.html`
  - [x] `noticias.html`

### SEO-5 Indexacion
- [x] Revisar `robots.txt` y confirmar `Disallow` (especialmente `/formulario/`)
- [x] Revisar `sitemap.xml` (URLs + `lastmod` actualizado)
- [x] Revisar consistencia de `canonical`

### SEO-6 Seguridad enlaces externos
- [x] Asegurar `rel="noopener noreferrer"` en enlaces externos con `target="_blank"` (incluye CTAs WhatsApp en `noticias.html`)

## Frontend (urgente)
### FE-1 Navegacion sin `href="#"`
- [x] Reemplazar `href="#"` en navegacion por `<button type="button">` cuando dispare modal
  - [x] `index.html:83` ("Simular Plan")
  - [x] `nosotros.html:61` ("Simular Plan")
  - [x] `asesores.html:48` ("Simular Plan")
  - [x] `noticias.html:48` ("Simular Plan")
  - [x] `ebook.html:100` (si aplica)
- [x] Si queda algun `href="#"` por CTA temporal, reemplazar por URL real o marcar como TODO

### FE-2 Accesibilidad basica
- [x] Revisar `aria-label` en botones de menu movil (sin mojibake)
- [x] Agregar `aria-controls` / `aria-expanded` al menu movil
- [x] Revisar foco visible en botones/enlaces (tab)
- [ ] Validar foco visible navegando con teclado en browser real
- [x] Revisar imagenes criticas: `alt` descriptivos, evitar `alt` generico repetido
- [x] Agregar `loading="lazy"` / `decoding="async"` a varias imagenes no criticas de paginas secundarias

### FE-3 Robustez JS
- [ ] Confirmar que `type="module"` no rompe en navegadores target
- [x] Limpiar textos rotos en modulos criticos (`navigation`, `testimonials`, `casosDeExito`)
- [ ] Revisar listeners duplicados y errores en consola
- [ ] Hacer pasada real de consola en browser (index / nosotros / asesores / noticias / ebook)

## Diseno / UI (mediano)
### UI-0 Hero (index) coherente con nuevo layout
- [x] Implementar `hero--v3` en `index.html` (copy + composicion + CTA)
- [x] Ajustar responsive para que la foto se vea bien en movil (sin overflow)

### UI-1 Tipografias consistentes
- [x] Decidir set único (Inter/Outfit)
- [x] Aplicarlo a todas las páginas (.html)

### UI-2 Consistencia visual entre paginas
- [x] Unificar versionado de CSS a `?v=20260417_final`
- [x] Unificar `preconnect` a CDNs (fonts/cdnjs) en todos los encabezados HTML
- [x] Estandarizar orden de carga de fuentes y estilos (evitar saltos visuales)

## Performance (mediano)
### PERF-1 Preload / lazy
- [ ] Revisar `preload` solo para imagen hero (evitar sobre-preload)
- [x] Revisar `loading="lazy"` para imagenes no criticas
- [ ] Hacer barrido final de imagenes que aun cargan sin `lazy` por decision o descuido

### PERF-2 Cache busting
- [ ] Definir estrategia (sin `?v=` o con `?v=` en todas)
- [ ] Arreglar caso actual:
  - [ ] `noticias.html` usa `css/styles.css?v=1.2`
  - [x] `index.html` ya usa versionado temporal en `styles.css` y `main.js` por cache de correcciones

## Marketing / Analytics (opcional)
### MKT-1 Pixeles / medicion
- [x] Definir plataforma (Meta / GA4 / GTM / TikTok / Hotmart)
- [x] Definir eventos minimos: click CTA Hotmart, scroll TOC, submit formulario
- [x] Implementar e integrar `js/modules/analytics.js` en todas las páginas (incluyendo Ebook)

## Backend (no aplica / bajo)
- [ ] (Si se publica en servidor) definir headers: cache-control, gzip/brotli, fonts, images

## Repo / Mantenimiento (bajo)
- [x] Mover scripts sueltos (`fix_*.py`, `debug.mjs`, etc.) a `/tools/`
- [x] Agregar `.gitignore` para artefactos temporales si corresponde
- [ ] Verificar assets duplicados (png/webp/jpg) y consolidar

## Estrategia y Conversión (CRO / UX)
### CV-1 Propuesta y Valor
- [x] Validar propuesta de valor clara en Hero ("Optimiza tu 7%")
- [ ] Reforzar lenguaje de beneficios en secciones de "Perfiles" y "Casos"
- [ ] Planificar incorporación de Video/Demo visual explicativo

### CV-2 Reducción de Fricción
- [x] Confirmar flujo de formulario de baja fricción (multi-paso)
- [x] Asegurar visibilidad inmediata de Prueba Social (logos/testimonios)

## Marketing Avanzado (Analítica)
### MKT-2 Medición y Optimización
- [x] Refactorizar `analytics.js` para detección automática de IDs y eventos
- [ ] Definir objetivos de conversión en GA4 vinculados a `analytics.js`
- [ ] Definir hipótesis para Test A/B de copy y CTAs
