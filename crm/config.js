export const isLocalDev = /^localhost$|^127\.0\.0\.1$/.test(window.location.hostname);

export const API_BASE_URL = isLocalDev
  ? 'https://form.planespro.cl'
  : window.location.origin;
export const ADMIN_KEY_STORAGE = 'planespro.crm.adminKey';

export const LEAD_STATUSES = [
  'Nuevo',
  'Por contactar',
  'Contactado',
  'En analisis',
  'Pendiente documento',
  'Cerrado',
  'Archivado',
  'Descartado',
  'Completado',
  'Abandonado',
];
