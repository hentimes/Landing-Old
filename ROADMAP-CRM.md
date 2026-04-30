# Checklist Roadmap CRM PlanesPro

## Estado real al 30-04-2026

### Hecho
- Backend base del CRM operativo sobre `ppforms`:
  - listado, detalle, notas, cambio de estado, archivado y borrado manual;
  - disponibilidad semanal;
  - bloqueos manuales y bloqueos de día completo;
  - creación, reprogramación y cancelación de citas;
  - integración base con Google Calendar;
  - selector público de slots reales con regla `45 min + 15 min`.
- CRM local accesible por `http://127.0.0.1:<puerto>/crm/` usando `X-Admin-Key`.
- Cloudflare Access ya protege el entorno productivo del CRM.
- Existe una primera capa visual para `Dashboard`, `Leads`, `Agenda`, `Settings` y `Profile`.

### Pendiente crítico
- Corregir la operación real del front del CRM antes de seguir con diseño:
  - visibilidad por sección de las tarjetas métricas;
  - filtros/rangos temporales coherentes por vista;
  - comparativas reales contra período anterior y/o mejor registro;
  - agenda realmente operativa por rango (`7d`, `2s`, `1m`);
  - bloquear / liberar horas desde CRM sin errores;
  - reprogramar citas abiertas desde Agenda;
  - ordenar `Settings` para que disponibilidad y bloqueos no ocupen media pantalla;
  - eliminar botones de adorno o volverlos funcionales.
- Resolver definitivamente la conexión Google OAuth en producción sin depender de pruebas locales.
- Unificar timezone y formato de fecha/hora entre formulario, CRM, D1 y Google Calendar.

### Regla de trabajo desde este punto
- No seguir expandiendo UI hasta cerrar lo operativo anterior.
- Todo cambio nuevo debe actualizar este roadmap y el handoff.

## Fase 0 - Base tecnica
- [ ] Consolidar el formulario actual como unica entrada activa
- [ ] Confirmar `ppforms_db` como base exclusiva del formulario
- [x] Confirmar `ppforms-uploads` como bucket exclusivo de adjuntos
- [x] Confirmar `form.planespro.cl` como endpoint publico del backend
- [ ] Definir contrato estable del lead
- [ ] Incluir `lead_id`
- [ ] Incluir `created_at`
- [ ] Incluir `status`
- [ ] Incluir `advisor_id`
- [ ] Incluir `campaign`
- [ ] Incluir `source_url`
- [ ] Incluir `sistema_actual`
- [ ] Incluir `isapre_especifica`
- [ ] Incluir `comentarios`
- [ ] Incluir `pdf_object_key`
- [ ] Definir convencion de nombres y estados
- [ ] Documentar estructura tecnica minima

## Fase 1 - CRM privado
- [x] Crear `asesores.planespro.cl`
- [x] Proteger `asesores.planespro.cl` con Cloudflare Access
- [ ] Definir usuarios autorizados en esta etapa
- [ ] Confirmar login por Google/email via Access

### CRM base
- [x] Crear vista principal de leads
- [x] Crear busqueda por nombre
- [x] Crear busqueda por email
- [x] Crear busqueda por telefono
- [x] Crear busqueda por RUT
- [x] Crear filtro por fecha
- [x] Crear filtro por sistema
- [x] Crear filtro por isapre especifica
- [x] Crear filtro por estado
- [x] Crear orden por fecha de ingreso
- [x] Crear ficha de detalle del lead
- [x] Mostrar adjunto en modal desde la bandeja
- [x] Agregar notas internas
- [x] Agregar cambio de estado
- [x] Agregar archivado
- [x] Agregar bloque de cita en la ficha del lead
- [x] Agregar resumen de agenda con proximas citas
- [x] Compactar la bandeja de leads
- [x] Compactar la ficha del lead
- [x] Agregar campo RUT editable con validacion y formateo
- [x] Reemplazar iniciales por avatar de silueta con colores dinamicos
- [x] Usar iconos Font Awesome consistentes en toda la UI
- [x] Agregar menu hover de perfil y settings del asesor
- [x] Alinear el perfil al header superior derecho
- [x] Crear vistas reales de `Profile` y `Settings`
- [x] Dejar el clip como unico acceso al adjunto
- [x] Ocultar el estado vacio descriptivo del detalle del lead

- [ ] No permitir borrado fisico desde UI

### Estados del lead
- [ ] Definir `Nuevo`
- [ ] Definir `Por contactar`
- [ ] Definir `Contactado`
- [ ] Definir `En analisis`
- [ ] Definir `Pendiente documento`
- [ ] Definir `Cerrado`
- [ ] Definir `Archivado`
- [ ] Definir `Descartado`

### Backend admin
- [x] Crear endpoint de listado paginado
- [x] Crear endpoint de detalle por `lead_id`
- [x] Crear endpoint para ver adjunto
- [x] Crear endpoint para cambiar estado
- [x] Crear endpoint para agregar nota
- [x] Crear endpoint para archivar
- [x] Crear endpoint para crear lead manual desde el CRM
- [x] Crear endpoint para eliminar lead desde el CRM
- [x] Agregar auditoria basica de acciones

### Trazabilidad
- [x] Crear tabla `lead_notes`
- [x] Crear tabla `lead_events`
- [x] Guardar quien hizo cada accion
- [x] Guardar timestamp de cambios de estado
- [x] Guardar motivo de archivado o descarte

### Agenda y citas
- [x] Agendar cita desde el formulario (cita_fecha_hora opcional)
- [x] Mostrar `cita_estado` en la ficha del lead
- [x] Mostrar `cita_fecha_hora` en la ficha del lead
- [x] Mostrar `cita_calendar_url` si existe
- [x] Crear lista de proximas citas
- [x] Crear indicadores de citas de hoy, pendientes y proximas
- [x] Definir estados de cita
- [ ] Integrar agendamiento real con Google Calendar (backend listo via Service Account; falta configurar secrets y UI de reprogramacion)
- [x] Guardar `cita_calendar_event_id`
- [x] Permitir reprogramacion de cita
- [ ] Permitir marcar cita como realizada o cancelada
- [x] Reemplazar el selector nativo `datetime-local` del formulario por un selector de slots reales
- [x] Mostrar solo bloques disponibles segun la regla operativa final
- [x] Aplicar regla de agenda: cita de 45 min + buffer de 15 min
- [x] Bloquear visualmente horas ocupadas y no seleccionables en el formulario publico
- [ ] Evitar fechas y horas incoherentes entre formulario, CRM y Google Calendar
- [x] Permitir al asesor editar disponibilidad semanal desde el CRM
- [x] Permitir al asesor bloquear horas manualmente desde el CRM
- [x] Permitir bloquear día completo desde el CRM
- [x] Permitir al asesor reprogramar una cita desde el CRM y propagarlo a Google Calendar
- [x] Permitir al asesor cancelar una cita desde el CRM y propagarlo a Google Calendar
- [ ] Mostrar una agenda operativa real por bloques en el CRM, no solo KPIs y listados
- [ ] Unificar timezone y formateo horario entre formulario, CRM, D1 y Google Calendar
- [ ] Definir y documentar la fuente de verdad de disponibilidad: Google Calendar + reglas internas de slots
- [x] Exponer una grilla de slots con estado (`free`, `busy_crm`, `busy_google`, `manual_block`) para formulario y CRM

## Fase 2 - Atribucion por asesor
- [ ] Crear tabla `advisors`
- [ ] Definir `advisor_id`
- [ ] Asociar cada lead a un asesor desde origen
- [ ] Definir slug o codigo por asesor
- [ ] Guardar `campaign` y fuente del lead

### Captacion por asesor
- [ ] Definir formato de URL por asesor
- [ ] Capturar identificador del asesor en el formulario
- [ ] Guardar asesor en D1 al enviar
- [ ] Restringir vista para que cada asesor vea solo sus leads

### Panel por asesor
- [ ] Crear dashboard basico por asesor
- [ ] Mostrar leads nuevos
- [ ] Mostrar leads contactados
- [ ] Mostrar leads cerrados
- [ ] Mostrar leads archivados
- [ ] Crear vista global para admin/supervisor

## Fase 3 - Operacion comercial
- [ ] Crear recordatorios o tareas simples
- [ ] Agregar `fecha_ultimo_contacto`
- [x] Agregar `proxima_acciÃ³n`
- [ ] Agregar `prioridad`
- [ ] Agregar etiquetas internas
- [ ] Agregar comentarios privados por asesor
- [ ] Permitir adjuntos adicionales si hace falta
- [ ] Agregar vista operativa de agenda semanal

### Metricas
- [ ] Medir leads recibidos por asesor
- [ ] Medir leads contactados por asesor
- [ ] Medir tasa de cierre
- [ ] Medir tiempo promedio de respuesta
- [ ] Crear panel global de metricas
- [ ] Medir campanas y origen de leads
- [ ] Hacer que los rangos `Hoy`, `7d`, `2 semanas`, `1 mes`, `3 meses`, `6 meses`, `1 aÃ±o` filtren datos reales en dashboard, leads y agenda
- [ ] Alinear los KPIs del dashboard con la misma ventana temporal activa

## Fase 4 - Colaboracion interna
- [ ] Crear sistema de reasignacion manual
- [ ] Registrar historial de cesion
- [ ] Permitir notas compartidas
- [ ] Permitir derivacion con motivo

### Roles
- [ ] Definir rol `admin`
- [ ] Definir rol `asesor`
- [ ] Definir rol `supervisor`
- [ ] Definir permisos por rol
- [ ] Restringir acceso a leads ajenos

## Fase 5 - Comunidad base
- [ ] Disenar modelo de grupos o equipos
- [ ] Disenar perfil basico del asesor
- [ ] Disenar reputacion interna
- [ ] Disenar eventos de actividad

### Mensajeria
- [ ] Definir comentarios sobre leads
- [ ] Definir chat 1 a 1
- [ ] Definir grupos
- [ ] Elegir stack de tiempo real

## Fase 6 - Marketplace de leads
- [ ] Definir cuando un lead puede publicarse
- [ ] Definir motivo de publicacion
- [ ] Incluir â€œno compatible con isapreâ€
- [ ] Incluir â€œfuera de zonaâ€
- [ ] Incluir â€œsin capacidadâ€
- [ ] Incluir â€œbaja probabilidad de cierreâ€
- [ ] Definir si el lead se publica anonimizado
- [ ] Definir si el lead se publica parcial
- [ ] Definir si el lead se publica completo tras aceptacion
- [ ] Definir reglas de compra/cesion
- [ ] Registrar trazabilidad del movimiento
- [ ] Revisar cumplimiento legal y consentimiento

## Fase 7 - Producto multiempresa
- [ ] Crear tabla `organizations`
- [ ] Asociar asesores a organizaciones
- [ ] Aislar datos por organizacion
- [ ] Preparar branding por cuenta
- [ ] Preparar configuracion por cliente

### Auth futura
- [ ] Evaluar si seguir con Cloudflare Access
- [ ] Evaluar usuarios propios
- [ ] Evaluar sesiones propias
- [ ] Evaluar recuperacion de contrasena
- [ ] Evaluar login con Google

## Infraestructura
- [x] Mantener `form_leads`
- [x] Crear `lead_notes`
- [x] Crear `lead_events`
- [ ] Crear `advisors`
- [ ] Evaluar futuro `organizations`
- [ ] Evaluar futuro `lead_transfers`
- [ ] Evaluar futuro `messages`
- [ ] Evaluar futuro `groups`

### Archivos
- [x] Mantener adjuntos en R2
- [x] Servir adjuntos solo a traves del Worker
- [x] No exponer bucket publicamente
- [ ] Definir politica de retencion

### Seguridad
- [x] Mantener `asesores.planespro.cl` detras de Cloudflare Access
- [x] Separar rutas admin del frontend publico
- [ ] Registrar eventos de lectura y edicion
- [ ] Proteger datos personales en marketplace futuro

### Observabilidad
- [ ] Activar logs del Worker
- [ ] Registrar acciones admin
- [ ] Configurar alertas basicas de error
- [ ] Medir uso del CRM
- [ ] Registrar fallos de OAuth Google por entorno y callback
- [ ] Registrar fallos de creacion, reprogramacion y cancelacion de citas

## Prioridad inmediata
- [x] Crear `asesores.planespro.cl`
- [x] Configurar Cloudflare Access
- [x] Construir API admin del Worker
- [x] Construir vista de leads
- [x] Construir filtros
- [x] Construir ficha con adjunto
- [x] Agregar notas
- [x] Agregar estados
- [ ] Agregar archivado
- [ ] Corregir la agenda para que formulario y CRM usen el mismo motor de disponibilidad
- [ ] Eliminar del formulario cualquier selector de fecha/hora que no respete la regla 45 + 15
- [ ] Hacer editable la disponibilidad y las citas desde el CRM

## Decisiones pendientes
- [ ] Cerrar estados finales del lead
- [ ] Definir si habr? asignacion manual ademas de automatica
- [ ] Definir campos visibles en la lista
- [ ] Definir campos visibles en la ficha
- [ ] Definir si habr? comentarios sobre leads antes del chat
- [ ] Definir si el marketplace mostrara datos completos o anonimizado

