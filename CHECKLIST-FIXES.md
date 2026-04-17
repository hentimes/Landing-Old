# Roadmap de Fixes (Landing Old)

Fecha: 2026-04-16
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
- [ ] Revisar `aria-label` en botones de menu movil (sin mojibake)
- [ ] Revisar foco visible en botones/enlaces (tab)
- [ ] Revisar imagenes criticas: `alt` descriptivos, evitar `alt` generico repetido

### FE-3 Robustez JS
- [ ] Confirmar que `type="module"` no rompe en navegadores target
- [ ] Revisar listeners duplicados y errores en consola

## Diseno / UI (mediano)
### UI-0 Hero (index) coherente con nuevo layout
- [x] Implementar `hero--v3` en `index.html` (copy + composicion + CTA)
- [x] Ajustar responsive para que la foto se vea bien en movil (sin overflow)

### UI-1 Tipografias consistentes
- [ ] Decidir set unico (Inter/Outfit vs Poppins)
- [ ] Aplicarlo a:
  - [ ] `index.html`
  - [ ] `nosotros.html`
  - [ ] `asesores.html`
  - [ ] `noticias.html`
  - [ ] `ebook.html`

### UI-2 Consistencia visual entre paginas
- [ ] Unificar versionado de CSS (caso `noticias.html` usa `css/styles.css?v=1.2`)
- [ ] Unificar `preconnect` a CDNs (fonts/cdnjs) segun estrategia

## Performance (mediano)
### PERF-1 Preload / lazy
- [ ] Revisar `preload` solo para imagen hero (evitar sobre-preload)
- [ ] Revisar `loading="lazy"` para imagenes no criticas

### PERF-2 Cache busting
- [ ] Definir estrategia (sin `?v=` o con `?v=` en todas)
- [ ] Arreglar caso actual:
  - [ ] `noticias.html` usa `css/styles.css?v=1.2`

## Marketing / Analytics (opcional)
### MKT-1 Pixeles / medicion
- [ ] Definir plataforma (Meta / GA4 / GTM / TikTok / Hotmart)
- [ ] Definir eventos minimos: click CTA Hotmart, scroll TOC, submit formulario
- [ ] Implementar `js/modules/analytics.js` o integrarlo a `js/main.js`

## Backend (no aplica / bajo)
- [ ] (Si se publica en servidor) definir headers: cache-control, gzip/brotli, fonts, images

## Repo / Mantenimiento (bajo)
- [ ] Mover scripts sueltos (`fix_*.py`, `debug.mjs`) a `/tools/` o eliminarlos si ya no se usan
- [ ] Agregar `.gitignore` para artefactos temporales si corresponde
- [ ] Verificar assets duplicados (png/webp/jpg) y consolidar
