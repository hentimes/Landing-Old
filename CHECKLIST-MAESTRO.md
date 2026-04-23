# Checklist Maestro PlanesPro

Fecha de consolidacion: 2026-04-22  
Rama revisada: `sections`

Este documento reemplaza los roadmaps y checklists anteriores. Debe usarse como fuente unica para priorizar estabilizacion, SEO, noticias, conversion y mantenimiento.

## 1. Estabilizacion inmediata

- [x] Restaurar carga del feed de noticias en `noticias.html`.
- [x] Volver a importar y ejecutar `initNoticiasFeed()` desde `js/main.js`.
- [x] Corregir fallback local roto en `js/modules/noticias-loader.js` (`asesor-person.webp` no existe).
- [x] Ajustar el footer para recuperar la posicion baja del texto de derechos reservados.
- [x] Cerrar correctamente el contenedor `#cta-final` en `index.html`.
- [ ] Probar `noticias.html` en navegador real con Worker disponible.
- [ ] Probar footer en desktop y mobile en `index.html`, `noticias.html` y `ebook.html`.
- [ ] Revisar consola del navegador en `index`, `nosotros`, `asesores`, `noticias` y `ebook`.

## 2. Arquitectura y mantenimiento

- [x] CSS ya esta separado por archivos parciales (`_base`, `_layout`, `_components`, `_header-footer`, paginas y modulos).
- [x] JS ya esta separado por modulos funcionales en `js/modules`.
- [x] Formulario ya tiene modulos propios en `formulario/js`.
- [ ] Modularizar HTML compartido: header, footer, menu mobile, modales y secciones.
- [ ] Definir un mecanismo de build o includes para evitar duplicar header/footer en cada HTML.
- [ ] Separar CSS y JS por seccion de forma consistente, sin romper cache ni orden de carga.
- [ ] Eliminar duplicacion de markup entre paginas cuando exista una fuente unica.
- [ ] Consolidar estrategia de versionado de assets (`?v=`) para CSS y JS.
- [ ] Revisar assets duplicados (`png`, `jpg`, `webp`) y eliminar solo los que no esten referenciados.

## 3. Noticias

- [x] Hero compacto de noticias creado.
- [x] Feed visual con noticia destacada y grilla secundaria creado.
- [x] Filtros por Todo, Isapres, Fonasa/Salud y AFP creados.
- [x] Buscador por texto creado.
- [x] Worker preparado para consultar noticias, clasificar y normalizar campos.
- [x] Migracion SQL D1 creada.
- [x] Frontend preparado para `limit`, `offset`, `dias`, `categoria` y `q`.
- [ ] Crear la base D1 real en Cloudflare.
- [ ] Aplicar migracion D1 en Cloudflare.
- [ ] Confirmar URL final del Worker y reemplazar endpoints antiguos si corresponde.
- [ ] Validar que el Worker responda con CORS correcto para `planespro.cl`.
- [ ] Confirmar paginacion real contra D1, no solo fallback local.
- [ ] Agregar capa editorial: resumen ejecutivo, "por que importa" y etiquetas.
- [ ] Crear seccion de articulos propios PlanesPro separada de noticias externas.
- [ ] Evaluar schema `NewsArticle` o `BlogPosting` segun tipo de contenido.
- [ ] Integrar Instagram/Meta API desde Worker, sin exponer tokens en cliente.

## 4. SEO tecnico

- [x] `meta charset`, `lang`, canonical y sitemap existen en paginas principales.
- [x] Titles y descriptions fueron revisados en paginas principales.
- [x] Open Graph y Twitter Cards existen en paginas principales.
- [x] JSON-LD base existe en paginas principales.
- [x] Enlaces externos principales usan `rel="noopener noreferrer"`.
- [ ] Validar Rich Results Test para todos los JSON-LD.
- [ ] Validar Google Search Console despues de publicar.
- [ ] Validar previews en Meta Sharing Debugger, LinkedIn Post Inspector y X/Twitter.
- [ ] Revisar si cada pagina necesita imagen social propia.
- [ ] Implementar `Article`/`NewsArticle` cuando exista contenido editorial individual.
- [ ] Evaluar `llms.txt` y contenido optimizado para buscadores con IA.

## 5. Contenido y autoridad

- [x] Home comunica la propuesta "Optimiza tu 7%".
- [x] FAQ principal agregada en la landing.
- [x] Paginas `nosotros`, `asesores`, `noticias` y `ebook` existen.
- [ ] Fortalecer E-E-A-T en `nosotros.html` con hitos, experiencia y responsables.
- [ ] Evaluar perfiles individuales de asesores para SEO local/persona.
- [ ] Agregar tags de especialidad en tarjetas de asesores.
- [ ] Agregar prueba social por asesor si existen datos reales.
- [ ] Crear enlaces internos editoriales desde noticias hacia asesores, ebook y servicios.
- [ ] Mejorar textos ancla internos para que sean descriptivos.

## 6. Ebook y conversion

- [x] Pagina `ebook.html` creada.
- [x] Jerarquia visual del hero del ebook ajustada.
- [x] Subtitulos dinamicos implementados.
- [x] Botones principales estandarizados con color de compra/CTA.
- [x] Bloques de objeciones, costos, contenido y FAQ creados.
- [x] Meta Pixel configurado como pixel global de PlanesPro.
- [x] Eventos `data-track` activados para medir interes de compra y navegacion del ebook.
- [x] JS inline del ebook migrado a `js/modules/ebook-page.js`.
- [x] Schema adicional de `WebPage`, `FAQPage` y `BreadcrumbList` agregado para SEO/AIEO.
- [x] CTA "Ver que incluye" corregido para apuntar a `#incluye`.
- [x] Copy de ahorro ajustado para evitar promesas excesivas.
- [x] Garantia visual complementada con texto explicativo.
- [x] Implementar garantia, muestra gratuita o bloque de reduccion de friccion si aplica comercialmente.
- [x] Confirmar evento `PurchaseInterest` o equivalente en clicks a Hotmart.
- [x] Revisar mobile del hero del ebook despues de los ajustes recientes.
- [x] Corregir H1 del ebook para que no quede truncado por animacion de tipeo.
- [x] Corregir responsive movil de secciones `cambios`, `preparacion`, `para-quien`, `problema` y precio del ebook.
- [x] Refinar espaciados verticales, centrado del hero, tooltips y logos del footer en vista mobile del ebook.
- [ ] Agregar GA4 Measurement ID cuando este disponible.
- [ ] Crear articulos relacionados en noticias que apunten al ebook.

## 7. UX, accesibilidad y QA

- [x] Navegacion movil tiene `aria-controls` y `aria-expanded`.
- [x] CTAs que abren modal usan botones en vez de `href="#"` en los casos revisados.
- [x] Imagenes no criticas usan `loading="lazy"` en varias paginas.
- [ ] Validar foco visible navegando con teclado.
- [ ] Probar formulario en Safari iOS, especialmente subida de archivos.
- [ ] Confirmar que no hay listeners duplicados ni errores JS.
- [ ] Revisar touch targets de filtros, tabs, CTAs y cards en mobile.
- [ ] Ejecutar Lighthouse/PageSpeed despues de estabilizar noticias y footer.

## 8. Performance

- [x] Imagenes principales usan WebP en varias secciones.
- [x] Preload/fetchpriority revisado en heroes principales.
- [x] Agregar dimensiones explicitas a las imagenes usadas en `ebook.html`.
- [ ] Medir LCP real por pagina.
- [ ] Revisar imagenes pesadas restantes (`news.webp`, `news1.webp`, assets del ebook).
- [ ] Evitar sobre-preload y mantener solo recursos criticos.
- [ ] Evaluar bundle/build para reducir `@import` en produccion.
- [ ] Definir headers de cache si el sitio se publica en servidor propio o Cloudflare.

## 9. Analytics y medicion

- [x] `analytics.js` existe como modulo dedicado.
- [x] Eventos base de CTAs y clicks fueron preparados.
- [ ] Confirmar IDs finales de GA4/Meta/Hotmart.
- [ ] Definir conversiones en GA4.
- [ ] Validar eventos reales en navegador y dashboards.
- [ ] Definir hipotesis de A/B testing para hero, CTAs y copy de confianza.

## 10. Repo

- [x] Scripts sueltos fueron movidos a `tools/`.
- [x] Rama `sections` existe para los cambios actuales.
- [ ] Revisar archivos temporales antes de publicar (`tmp_downloads_sheet.jpg`, scratch, tools no usados).
- [ ] Crear commits por bloque: fixes, docs, modularizacion, SEO/performance.
- [ ] Mantener este archivo como unica fuente de estado.
