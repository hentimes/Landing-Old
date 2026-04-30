export const isLocalDev = /^localhost$|^127\.0\.0\.1$/.test(window.location.hostname);

export const API_BASE_URL = isLocalDev
  ? 'https://form.planespro.cl'
  : window.location.origin;

export const ADMIN_KEY_STORAGE = 'planespro.crm.adminKey';
export const PROFILE_STORAGE = 'planespro.crm.profile';
export const LOCAL_DEV_ADMIN_KEY = 'ppcrm_dev_20260425_9f6c2c8e1a4b';

export const LEAD_STATUSES = [
  'Nuevo',
  'Por contactar',
  'Contactado',
  'En analisis',
  'Propuesta enviada',
  'Pendiente documento',
  'Cerrado',
  'Archivado',
  'Descartado',
  'Completado',
  'Abandonado',
];

export const RANGE_OPTIONS = {
  today: { label: 'Hoy', days: 1 },
  '7d': { label: '7d', days: 7 },
  '2s': { label: '2 semanas', days: 14 },
  '1m': { label: '1 mes', days: 30 },
  '3m': { label: '3 meses', days: 90 },
  '6m': { label: '6 meses', days: 180 },
  '1a': { label: '1 año', days: 365 },
};

export const ISAPRE_BUCKETS = [
  'Fonasa',
  'Banmedica',
  'Colmena',
  'Consalud',
  'Cruz Blanca',
  'Esencial',
  'Nueva Masvida',
  'Vida Tres',
  'Otros',
];
