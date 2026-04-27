# Checklist Roadmap CRM PlanesPro

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
- [x] Agregar auditoria basica de acciones

### Trazabilidad
- [x] Crear tabla `lead_notes`
- [x] Crear tabla `lead_events`
- [x] Guardar quien hizo cada accion
- [x] Guardar timestamp de cambios de estado
- [ ] Guardar motivo de archivado o descarte

### Agenda y citas
- [x] Mostrar `cita_estado` en la ficha del lead
- [x] Mostrar `cita_fecha_hora` en la ficha del lead
- [x] Mostrar `cita_calendar_url` si existe
- [x] Crear lista de proximas citas
- [x] Crear indicadores de citas de hoy, pendientes y proximas
- [ ] Definir estados de cita
- [ ] Integrar agendamiento real con Google Calendar
- [ ] Guardar `cita_calendar_event_id`
- [ ] Permitir reprogramacion de cita
- [ ] Permitir marcar cita como realizada o cancelada

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
- [ ] Agregar `proxima_accion`
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
- [ ] Incluir “no compatible con isapre”
- [ ] Incluir “fuera de zona”
- [ ] Incluir “sin capacidad”
- [ ] Incluir “baja probabilidad de cierre”
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

## Decisiones pendientes
- [ ] Cerrar estados finales del lead
- [ ] Definir si habra asignacion manual ademas de automatica
- [ ] Definir campos visibles en la lista
- [ ] Definir campos visibles en la ficha
- [ ] Definir si habra comentarios sobre leads antes del chat
- [ ] Definir si el marketplace mostrara datos completos o anonimizado
