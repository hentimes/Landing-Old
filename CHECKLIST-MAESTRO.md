# Checklist Maestro PlanesPro

Fecha de consolidacion: 2026-04-23  
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
- [x] Formulario ya tiene modulos propios en `form/`.
- [ ] Modularizar HTML compartido: header, footer, menu mobile, modales y secciones.
- [ ] Definir un mecanismo de build o includes para evitar duplicar header/footer en cada HTML.
- [ ] Separar CSS y JS por seccion de forma consistente, sin romper cache ni orden de carga.
- [ ] Eliminar duplicacion de markup entre paginas cuando exista una fuente unica.
- [ ] Consolidar estrategia de versionado de assets (`?v=`) para CSS y JS.
- [x] Revisar assets duplicados (`png`, `jpg`, `webp`) y eliminar solo los que no esten referenciados.

## 3. Noticias

- [x] Hero compacto de noticias creado.
- [x] Feed visual con noticia destacada y grilla secundaria creado.
- [x] Filtros por Todo, Isapres, Fonasa/Salud y AFP creados.
- [x] Buscador por texto creado.
- [x] Worker preparado para consultar noticias, clasificar y normalizar campos.
- [x] Migracion SQL D1 creada.
- [x] Frontend preparado para `limit`, `offset`, `dias`, `categoria` y `q`.
- [x] RediseÃ±o mÃ³vil del feed (buscador + dropdown, 6 titulares + 6 carrusel, CTA azul final).
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

## 6.1 Formulario sidebar nuevo

- [ ] Crear una carpeta dedicada para el formulario nuevo y separar su logica del formulario legacy.
- [ ] Definir al formulario sidebar como unica version activa para el sitio, manteniendo el legacy solo como referencia temporal.
- [ ] Reducir el formulario a los campos realmente usados hoy: comuna, region, sistema, isapre, cargas, renta, nombre, telefono, email, archivo y comentario.
- [ ] Mantener solo la logica vigente del sidebar: autocomplete comuna-region, toggle Fonasa/Isapre, modal de cargas y validacion de telefono.
- [ ] Eliminar dependencias y modulos del formulario antiguo que ya no participen en el flujo actual.
- [x] Eliminar carpeta legacy `formulario/` (ya no se usa).
- [ ] Normalizar nombres de campos entre frontend y Apps Script para evitar mapeos duplicados.
- [x] Agregar `Comentario` al contrato del formulario, Apps Script y Google Sheets.
- [x] Preparar desde ya el contrato de `Agendamiento` o `Cita` aunque el flujo aun no exista en frontend.
- [x] Definir si la cita se guardara como estado, fecha/hora, link de agenda o combinacion de esos campos.
- [ ] DiseÃ±ar el flujo futuro de agendamiento conectado a Google Calendar sin mezclarlo aun con el submit principal.
- [x] Mantener Apps Script como backend transitorio del sidebar hasta cerrar la migracion a Cloudflare.
- [x] Definir un adaptador de backend para que el frontend nuevo no dependa de Apps Script ni de Cloudflare directamente.
- [x] Reemplazar el selector libre de fecha/hora por slots reales disponibles.
- [x] Aplicar una regla unica de agenda: 45 min de reunion + 15 min de buffer.
- [x] Mostrar al lead solo horas disponibles y bloquear visualmente las ocupadas o no disponibles.
- [x] Exponer desde backend una grilla completa de slots con estado para que las horas ocupadas no desaparezcan.
- [x] Permitir crear lead manual desde el CRM.
- [x] Permitir eliminar lead desde el CRM.
- [x] Permitir bloquear día completo desde el CRM.
- [ ] Unificar el formateo de fecha/hora entre formulario, CRM, D1 y Google Calendar.
- [ ] Probar el sidebar completo en mobile real, incluyendo CTA del header, menu hamburguesa, scroll, abandono y envio.
- [ ] Probar el sidebar en desktop real despues de la simplificacion para evitar regresiones.

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
- [ ] Implementar cambios prioritarios de PageSpeed (Ver SecciÃ³n 11).
- [ ] Optimizar cadena de carga crÃ­tica: `main.js` -> `_module-loader.js` -> templates (Latencia ~2.5s).
- [ ] Reducir "Forced Reflow" en JS (34ms detectados por consultas geomÃ©tricas).
- [ ] Medir LCP real por pagina.
- [ ] Revisar imagenes pesadas restantes (`news.webp`, `news1.webp`, assets del ebook).
- [ ] Evitar sobre-preload y mantener solo recursos criticos.
- [ ] Evaluar bundle/build para reducir `@import` en produccion.
- [ ] Configurar polÃ­ticas de cachÃ© (TTL > 30 dÃ­as para estÃ¡ticos; actualmente es de 7 dÃ­as).

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
- [x] Revisar archivos temporales antes de publicar (`tmp_downloads_sheet.jpg`, scratch, tools no usados).
- [ ] Crear commits por bloque: fixes, docs, modularizacion, SEO/performance.
- [ ] Mantener este archivo como unica fuente de estado.

## 11. OptimizaciÃ³n PageSpeed (Audit Detallado)

### P1: CrÃ­tico (Impacto Directo en Core Web Vitals)
- [ ] **Eliminar recursos que bloquean el renderizado:** Diferir scripts de terceros y optimizar carga de CSS crÃ­tico (~3.4s de ahorro).
- [ ] **Redimensionar Assets CrÃ­ticos:**
    - [ ] **Logo PlanesPro:** De 800x800 a 140x140 (Ahorro ~276 KiB).
    - [ ] **Avatar 4:** De 1511x1500 a ~160x160.
    - [ ] **Avatar 1:** De 953x931 a ~120x120.
    - [ ] **ConversiÃ³n total a WebP/AVIF:** Resto de imÃ¡genes en landing y noticias.
- [ ] **Dimensiones explÃ­citas (CLS):** 
    - [ ] Agregar `width` y `height` a los logos de Isapres (Nueva Masvida, Esencial, Consalud, etc.).
    - [ ] Asegurar dimensiones en todos los tags `<img>` del sitio.
- [ ] **Optimizar fuentes tipogrÃ¡ficas:** Aplicar `font-display: swap` en `@font-face`.

### P2: Estructura y Eficiencia (JS/DOM)
- [ ] **Optimizar Cadena de Peticiones:** Reducir la profundidad de carga (`index` -> `main.js` -> `loader` -> `templates`).
- [ ] **Controlar TamaÃ±o del DOM:** Actualmente 916 elementos. Evitar superar los 1400 y reducir profundidad (mÃ¡x 15 niveles en `i.fas.fa-users`).
- [ ] **Reducir trabajo de hilo principal:** Optimizar ejecuciÃ³n de `fbevents.js` y scripts propios (398ms CPU).
- [ ] **PolÃ­ticas de cachÃ©:** Aumentar TTL a 1 aÃ±o para assets estÃ¡ticos en el servidor/Cloudflare.

### P3: Accesibilidad, SEO y Seguridad
- [ ] **Corregir Contraste de Color:**
    - [ ] `p.case-study-microtitle`
    - [ ] `p.testimonial-card__date`
    - [ ] `button#cta_inferior`
    - [ ] `a.footer__subtle-link`
- [ ] **JerarquÃ­a de encabezados:** Corregir `h4.footer__title` (salto desde H1/H2).
- [ ] **TamaÃ±o de objetivos tÃ¡ctiles:** Espaciado en filtros y botones mÃ³viles.
- [ ] **Headers de Seguridad:** Implementar **CSP**, **HSTS** y **X-Frame-Options**.

