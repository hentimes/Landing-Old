Formulario activo del sitio.

Estructura:
- `sidebar.js`: render y ciclo de vida del sidebar.
- `fields.js`: logica de campos y validaciones de UI.
- `submit.js`: coordinacion de serializacion y envio.
- `backend/adapter.js`: punto unico de seleccion de backend.
- `backend/apps-script.js`: implementacion temporal actual.
- `backend/cloudflare.js`: stub para Worker + D1 + R2.
- `styles/sidebar.css`: estilos del sidebar.

Decision actual:
- Backend activo: `apps-script`.
- Motivo: mantiene compatibilidad inmediata con el flujo publicado.
- Destino recomendado: Cloudflare Worker + D1 para metadata + R2 para PDF.

Convencion para la migracion:
- La UI no debe importar endpoints directos.
- Todo cambio de backend debe pasar por `backend/adapter.js`.
- Nuevos campos de negocio, como `Comentario` o estados de cita, deben entrar primero en `submit.js` como contrato comun.
