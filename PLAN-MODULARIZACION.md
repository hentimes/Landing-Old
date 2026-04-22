# Plan de Modularizacion PlanesPro

Fecha: 2026-04-22  
Objetivo: reducir duplicacion, hacer mas seguro cambiar header/footer/secciones y preparar el proyecto para crecer sin romper paginas existentes.

## Recomendacion

Si es recomendable modularizar, pero conviene hacerlo por fases. Hoy el sitio es HTML/CSS/JS estatico con modulos JS parciales y CSS por imports. Pasar todo de golpe a componentes puede romper SEO, rutas, modales y cache. La ruta mas segura es introducir un build liviano o includes reutilizables y migrar pagina por pagina.

## Arquitectura objetivo

- `src/partials/header.html`
- `src/partials/footer.html`
- `src/partials/mobile-nav.html`
- `src/partials/modals.html`
- `src/sections/home/hero.html`
- `src/sections/home/proceso.html`
- `src/sections/home/planes.html`
- `src/sections/home/casos-exito.html`
- `src/sections/home/testimonios.html`
- `src/sections/home/cta-final.html`
- `src/pages/index.html`
- `src/pages/noticias.html`
- `src/pages/nosotros.html`
- `src/pages/asesores.html`
- `src/pages/ebook.html`
- `src/styles/global.css`
- `src/styles/partials/header-footer.css`
- `src/styles/sections/home/*.css`
- `src/styles/pages/*.css`
- `src/scripts/main.js`
- `src/scripts/sections/*.js`
- `dist/*.html`

## Fase 1: Preparacion sin cambiar comportamiento

- [ ] Inventariar duplicacion real de header, footer, menu mobile y modales en todos los HTML.
- [ ] Definir si se usara build simple con Node, Eleventy, Astro o un script propio de ensamblado.
- [ ] Mantener salida estatica en `dist/` para que el hosting siga siendo simple.
- [ ] Crear partials de header/footer sin cambiar clases CSS.
- [ ] Crear tests/manual QA basicos: abrir cada pagina, probar menu mobile, modal, noticias y footer.

## Fase 2: Header y footer independientes

- [ ] Mover header a un partial unico.
- [ ] Mover footer a un partial unico.
- [ ] Pasar estado activo del menu como variable por pagina.
- [ ] Mantener links relativos correctos desde todas las paginas.
- [ ] Probar que cambios de footer se reflejen en todas las paginas generadas.

## Fase 3: Secciones independientes

- [ ] Migrar secciones de `index.html` una por una.
- [ ] Empezar por secciones de bajo riesgo: logos, testimonios, confianza.
- [ ] Seguir con secciones interactivas: planes, casos de exito, asistente FAQ.
- [ ] Mantener IDs actuales para no romper links, CSS ni tracking.
- [ ] Documentar dependencias JS/CSS de cada seccion.

## Fase 4: CSS por modulo

- [ ] Separar CSS global: variables, base, layout, componentes.
- [ ] Separar CSS de partials: header/footer, modales, navigation.
- [ ] Separar CSS por pagina: noticias, asesores, nosotros, ebook.
- [ ] Separar CSS por seccion de home.
- [ ] Crear un archivo de entrada de desarrollo y un CSS final de produccion.
- [ ] Evitar `@import` en produccion si se adopta build.

## Fase 5: JS por modulo y carga condicional

- [ ] Mantener `main.js` como orquestador minimo.
- [ ] Inicializar modulos solo si existen sus selectores en la pagina.
- [ ] Separar inicializadores por pagina cuando el peso lo justifique.
- [ ] Centralizar helpers comunes: DOM, analytics, errores, fetch.
- [ ] Evitar que un error de un modulo bloquee el resto de la pagina.

## Fase 6: Publicacion y control de calidad

- [ ] Generar `dist/` limpio.
- [ ] Comparar visualmente HTML actual vs HTML generado.
- [ ] Validar sitemap, canonical, JSON-LD y metadatos despues del build.
- [ ] Revisar consola sin errores.
- [ ] Probar desktop y mobile.
- [ ] Definir estrategia de cache busting automatica.

## Riesgos

- Romper rutas relativas de assets al mover archivos.
- Duplicar IDs si se incluyen partials mas de una vez.
- Cambiar orden de CSS y alterar estilos existentes.
- Romper tracking si cambian IDs o clases de CTAs.
- Romper SEO si el build altera metadatos o JSON-LD.

## Decision sugerida

Usar un build estatico liviano. Para este proyecto, la opcion mas pragmatica es Eleventy o un script Node simple si se quiere minimo cambio. Astro seria buena opcion si despues se quiere crecer hacia componentes mas formales, pero es mas migracion inicial.
