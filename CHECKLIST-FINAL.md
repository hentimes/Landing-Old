# 🏁 PlanesPro: Checklist Maestro de Estabilización y Crecimiento

Este documento es la fuente única de verdad para el estado del proyecto. Compacta el SEO Roadmap, Roadmap de Noticias y Checklist de Fixes.

## 🏗️ Fase 1: Arquitectura y Estabilidad (Prioridad Alta)
- [ ] **Consolidación CSS**: Mover de `@import` a una estructura agrupada para evitar latencia de carga.
- [ ] **Refactoreo Formulario**: Dividir `_form-logic.js` en submódulos funcionales (Utilidades, Analytics, UI Dinámica).
- [ ] **Unificación de Modales**: Estandarizar la lógica de `no-scroll` en `navigation.js` y `modal.js` para evitar que la página se mueva detrás de los modales.
- [ ] **Limpieza de Assets**: Eliminar imágenes duplicadas (PNG vs WebP) y consolidar en la carpeta `assets/`.
- [ ] **Validación Mobile**: Revisar `touch targets` (botones de al menos 44px) en los filtros de noticias y asesores.

## 📈 Fase 2: SEO y Performance Semántica
- [ ] **Schema Avanzado**: Implementar `NewsArticle` para noticias individuales (Fase 9 de noticias).
- [ ] **Optimización LCP**: Implementar `fetchpriority="high"` en la imagen principal del Hero en todas las páginas.
- [ ] **Auditoría de Enlaces**: Asegurar que todos los enlaces internos usen textos ancla (anchor text) descriptivos (no usar "leer más" a secas).
- [ ] **Google Search Console**: Validar que no existan errores de índice por el uso de rutas con parámetros del formulario.
- [ ] **Pre-rendering**: Evaluar generación estática para las páginas de Nosotros y Asesores para velocidad instantánea.

## 📰 Fase 3: Roadmap Noticias (Pendientes Críticos)
- [x] **Fase 1-3**: Diseño, Feed Dinámico y Worker inicial.
- [x] **Fase 5**: Buscador funcional.
- [ ] **Base de Datos D1**: Aplicar la migración SQL y conectar el Worker para el histórico de 60 días (Fase 4).
- [ ] **Paginación Real**: Cambiar el botón "Cargar más" de una lógica local a una consulta dinámica al Worker (offset/limit).
- [ ] **Capa Editorial**: Implementar los campos `¿Por qué importa?` y `Resumen Ejecutivo` en el renderizado de noticias (Fase 6).
- [ ] **Instagram API**: Integrar las dos cuentas de IG sin exponer tokens en el cliente (Fase 8).

## 🤝 Fase 4: Optimización - Nuestros Asesores
- [ ] **Perfiles Individuales**: Evaluar la creación de `asesores/nombre-asesor.html` para ganar SEO por búsquedas de nombres específicos.
- [ ] **Schema Person**: Validar el JSON-LD de asesores en la herramienta de resultados enriquecidos de Google.
- [ ] **Filtro de Especialidad**: Agregar tags visuales (Maternidad, Freelance, etc.) en las tarjetas de asesores.
- [ ] **Prueba Social por Asesor**: Incluir contador de casos exitosos o testimonios específicos dentro del perfil del asesor.

## 📖 Fase 5: Optimización - Ebook Retiro AFP
- [ ] **Ajuste Heading Hierarchy**: Revisar que el eBook no abuse de `h2` y mantenga una estructura `h1 > h2 > h3` fluida.
- [ ] **Conversión CRO**: Implementar un bloque de "Garantía de Satisfacción" o "Muestra Gratuita" para reducir la fricción antes de la compra.
- [ ] **Tracking Específico**: Asegurar que el evento `PurchaseInterest` se dispare correctamente al hacer clic en el botón de Hotmart.
- [ ] **Internal Linking**: Crear bloques de "Artículos relacionados" en la sección de noticias que apunten directamente al Ebook.

## 🧪 Fase 6: QA Final y Lanzamiento
- [ ] **Cross-Browser Test**: Probar el formulario en Safari iOS (especialmente la subida de archivos).
- [ ] **Consola Cero**: Asegurar que no existan `console.log` residuales ni errores `404` de assets en ninguna ruta.
- [ ] **Validación de Tracking**: Confirmar que los IDs de Pixel y GA4 estén activos y midiendo conversiones reales.
