# Formulario en Cloudflare

Este documento deja el setup exacto que falta para mover el formulario nuevo de `Apps Script` a `Cloudflare Worker + D1 + R2`.

## 1. Recursos que debes crear en Cloudflare

### Worker
- Nombre sugerido: `planespro-form`
- Entry point ya preparado en el repo: `cloudflare/form-worker.js`
- Dominio recomendado:
  - `form.planespro.cl` apuntando al Worker
  - alternativa temporal: `*.workers.dev`

### D1
- Nombre sugerido: `planespro-form`
- Binding esperado por el código: `FORM_DB`
- Migraciones listas para ejecutar:
  - `cloudflare/migrations/002_create_form_leads.sql`
  - `cloudflare/migrations/003_create_form_admin_tables.sql`

### R2
- Bucket sugerido: `planespro-form-uploads`
- Binding esperado por el código: `FORM_UPLOADS`
- Uso actual:
  - guardar PDFs opcionales del formulario
  - ruta de objeto: `leads/<fecha>_<nombre>_<leadId-corto>.<ext>`

## 2. Datos que necesito que me traigas

Cuando lo tengas creado, necesito estos datos exactos:

- `database_id` de D1
- nombre final del bucket R2
- URL final del Worker
  - idealmente `https://form.planespro.cl`
- dominio final permitido para CORS
  - ejemplo: `https://planespro.cl`
  - si usarás también GitHub Pages o staging, necesito esa lista

## 2.1. Estado actual detectado

Ya pude verificar esto:

- `account_id`: `a69ce5c1cf6b705438ee7028f37cb30b`
- zona encontrada: `planespro.cl`
- `zone_id`: `6bf0d82dd59c05b841eee2fd4531785c`
- estado de la zona: `active`

Implicación directa:

- sí puedo dejar listo el Worker para `workers.dev`
- no conviene cerrar `form.planespro.cl` hasta que `planespro.cl` apunte a los nameservers de Cloudflare y la zona quede `active`

Actualización:

- ya está cerrado `form.planespro.cl` con DNS + route del Worker
- Worker desplegado: `planespro-form`
- Ruta activa: `form.planespro.cl/*`
- Bucket R2 creado: `planespro-form-uploads`
- D1 usado temporalmente: `ppnews_db` (`96ac7139-09d1-4254-bbc7-b1d349bd90fd`)

Nota: la creación de una nueva base D1 llamada `planespro-form` devolvió error 7500 (internal). Cuando Cloudflare permita crearla, se migra el binding sin tocar el frontend.

## 2.2. Permisos que le faltan al token actual

El token actual es válido, pero no alcanza para provisionar todo.

Permisos observados:

- `#worker:edit`
- `#worker:read`
- `#zone:read`

Con eso puedo leer la zona y trabajar parcialmente con Workers, pero no puedo crear ni administrar estos recursos:

- D1
- R2
- DNS records / routes para `form.planespro.cl`

Para que yo haga todo por CLI, el token debe incluir además:

- `D1: Edit`
- `R2: Edit`
- `Zone DNS: Edit`
- `Workers Routes: Edit`

Opcional pero útil:

- `Account Settings: Read`
- `User Details: Read`

## 3. Configuración esperada

El ejemplo de Wrangler ya está listo en:

- `cloudflare/wrangler-form.example.toml`
- `cloudflare/wrangler-form.toml`

Debe quedar con estos bindings:

- `FORM_DB`
- `FORM_UPLOADS`

Y esta variable:

- `FORM_ALLOWED_ORIGIN`
- secreto recomendado para backoffice:
  - `ADMIN_API_KEY`

## 4. Endpoints ya preparados

El frontend nuevo ya está desacoplado por adaptador y espera estos endpoints:

- `POST /api/form/leads`
- `POST /api/form/leads/abandoned`
- `POST /api/form/appointments`
- `GET /api/admin/session`
- `GET /api/admin/leads`
- `GET /api/admin/leads/:id`
- `GET /api/admin/leads/:id/file`
- `POST /api/admin/leads/:id/notes`
- `POST /api/admin/leads/:id/status`
- `POST /api/admin/leads/:id/archive`

## 5. Qué hace cada endpoint

### `POST /api/form/leads`
- guarda metadata del lead en D1
- guarda PDF opcional en R2
- persiste `Comentario`
- persiste campos reservados de cita

### `POST /api/form/leads/abandoned`
- registra abandono del formulario
- guarda el payload parcial en D1

### `POST /api/form/appointments`
- actualiza cita sobre un lead existente
- pensado para la futura integración con Google Calendar

## 6. Cambio que haré cuando me traigas esos datos

Con esa información, el cambio es corto:

1. completar `cloudflare/wrangler-form.toml`
2. apuntar `form/config.js` a la URL final del Worker
3. cambiar `BACKEND_TARGET` de `apps-script` a `cloudflare`
4. desplegar Worker y migración
5. probar:
   - envío sin PDF
   - envío con PDF
   - abandono
   - comentario
   - cita reservada en payload

## 7. Estado actual

Hoy el formulario sigue funcionando con Apps Script.

Ya quedaron preparados:

- módulo nuevo activo en `form/`
- `Comentario` en frontend + Apps Script de referencia
- contrato de cita en frontend y backends
- Worker base
- migración D1
- ejemplo de Wrangler

Lo único que falta de tu lado para conectarlo de verdad es crear los recursos en Cloudflare y pasarme los identificadores finales.
